import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { READINESS_WEIGHTS } from './interfaces/marketplace.interface';
import { ReadinessThresholdReachedEvent } from './events/readiness-threshold-reached.event';

/**
 * Readiness service — computes channel readiness scores and recommendations.
 * Sprint 10 (CTX-015)
 *
 * Composite formula:
 *   composite = (supply × 0.30) + (demand × 0.25) + (coverage × 0.20)
 *             + (operational × 0.15) + (infrastructure × 0.10)
 */
@Injectable()
export class ReadinessService {
  private readonly logger = new Logger(ReadinessService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}


  /**
   * Compute readiness scores for a single channel.
   */
  async computeChannelReadiness(channelId: string) {
    const channel = await this.prisma.advertisingChannel.findUnique({
      where: { id: channelId },
      include: { launchThreshold: true },
    });

    if (!channel || !channel.launchThreshold) {
      return null;
    }

    const threshold = channel.launchThreshold;

    // Count pre-orders (demand)
    const businessCount = await this.prisma.businessPreOrder.count({
      where: { channelId, status: { not: 'cancelled' } },
    });

    // Count partner enrollments (supply)
    const partnerCount = await this.prisma.partnerEnrollment.count({
      where: { channelId, status: { in: ['submitted', 'approved'] } },
    });

    // Count distinct cities (coverage)
    const cities = await this.prisma.businessPreOrder.findMany({
      where: { channelId, status: { not: 'cancelled' } },
      select: { preferredCity: true },
      distinct: ['preferredCity'],
    });
    const citiesCovered = cities.length;

    // Sum budgets
    const budgetAgg = await this.prisma.businessPreOrder.aggregate({
      where: { channelId, status: { not: 'cancelled' } },
      _sum: { estimatedBudget: true },
    });
    const totalBudget = budgetAgg._sum.estimatedBudget || 0;


    // Compute individual scores (capped at 100)
    const supplyPct = Math.min(
      (partnerCount / threshold.minPartnerEnrollment) * 100, 100,
    );
    const demandPct = Math.min(
      (businessCount / threshold.minBusinessInterest) * 100, 100,
    );
    const coveragePct = Math.min(
      (citiesCovered / threshold.minCitiesCovered) * 100, 100,
    );

    // Operational: check if channel has configuration set
    const operationalPct = Object.keys(
      (channel.configuration as any) || {},
    ).length > 0 ? 100 : 0;

    // Infrastructure: check centers and print partners
    const hasCenters = await this.prisma.distributionCenter.count({
      where: { supportedChannels: { has: channel.code } },
    }) > 0 ? 1 : 0;

    const hasPrintPartners = await this.prisma.printPartner.count({
      where: { supportedChannels: { has: channel.code } },
    }) > 0 ? 1 : 0;

    const infrastructurePct = ((hasCenters + hasPrintPartners) / 2) * 100;

    // Composite readiness
    const composite =
      supplyPct * READINESS_WEIGHTS.supply +
      demandPct * READINESS_WEIGHTS.demand +
      coveragePct * READINESS_WEIGHTS.coverage +
      operationalPct * READINESS_WEIGHTS.operational +
      infrastructurePct * READINESS_WEIGHTS.infrastructure;


    // Upsert progress record
    const progress = await this.prisma.channelLaunchProgress.upsert({
      where: { channelId },
      update: {
        businessCount,
        partnerCount,
        totalBudget,
        citiesCovered,
        businessProgressPct: demandPct,
        partnerProgressPct: supplyPct,
        combinedReadinessPct: composite,
        recommended: composite >= 80,
        computedAt: new Date(),
      },
      create: {
        channelId,
        businessCount,
        partnerCount,
        totalBudget,
        citiesCovered,
        businessProgressPct: demandPct,
        partnerProgressPct: supplyPct,
        combinedReadinessPct: composite,
        recommended: composite >= 80,
        computedAt: new Date(),
      },
    });

    // Emit event if threshold reached
    if (composite >= 80 && !progress.recommended) {
      this.eventEmitter.emit(
        ReadinessThresholdReachedEvent.EVENT_NAME,
        new ReadinessThresholdReachedEvent(channelId, channel.code, composite),
      );
    }

    this.logger.log(
      `Readiness computed for ${channel.code}: ${composite.toFixed(1)}%`,
    );

    return {
      channelId,
      channelCode: channel.code,
      supply: { count: partnerCount, pct: supplyPct },
      demand: { count: businessCount, pct: demandPct },
      coverage: { cities: citiesCovered, pct: coveragePct },
      operational: { pct: operationalPct },
      infrastructure: { pct: infrastructurePct },
      composite,
      recommended: composite >= 80,
    };
  }


  /**
   * Compute readiness for all non-retired, non-live channels.
   */
  async computeAllReadiness() {
    const channels = await this.prisma.advertisingChannel.findMany({
      where: {
        isRetired: false,
        maturityStage: {
          notIn: ['CMM_005_LIVE', 'CMM_006_SCALING', 'CMM_007_NATIONAL', 'CMM_008_INTERNATIONAL'],
        },
      },
      include: { launchThreshold: true },
    });

    const results = [];
    for (const channel of channels) {
      if (channel.launchThreshold) {
        const result = await this.computeChannelReadiness(channel.id);
        if (result) results.push(result);
      }
    }

    return results;
  }

  /**
   * Get demand intelligence — aggregated pre-order data.
   */
  async getDemandIntelligence() {
    const byChannel = await this.prisma.businessPreOrder.groupBy({
      by: ['channelId'],
      where: { status: { not: 'cancelled' } },
      _count: { id: true },
      _sum: { estimatedBudget: true },
    });

    const byCity = await this.prisma.businessPreOrder.groupBy({
      by: ['preferredCity'],
      where: { status: { not: 'cancelled' } },
      _count: { id: true },
      _sum: { estimatedBudget: true },
    });

    return { byChannel, byCity };
  }

  /**
   * Get supply intelligence — aggregated partner enrollment data.
   */
  async getSupplyIntelligence() {
    const byChannel = await this.prisma.partnerEnrollment.groupBy({
      by: ['channelId'],
      where: { status: { in: ['submitted', 'approved'] } },
      _count: { id: true },
    });

    const byCategory = await this.prisma.partnerEnrollment.groupBy({
      by: ['partnerCategoryCode'],
      where: { status: { in: ['submitted', 'approved'] } },
      _count: { id: true },
    });

    return { byChannel, byCategory };
  }
}
