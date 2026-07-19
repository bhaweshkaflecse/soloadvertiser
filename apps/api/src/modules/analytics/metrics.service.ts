import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MetricCode, MetricPeriod, DashboardKpi } from './interfaces/analytics.interface';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Compute all metrics and create snapshots.
   * Called by admin endpoint or cron job.
   */
  async computeAndSnapshot(period: MetricPeriod = MetricPeriod.DAILY): Promise<void> {
    const periodStart = this.getPeriodStart(period);
    this.logger.log(`Computing metrics for period=${period}, start=${periodStart.toISOString()}`);

    const metrics = await this.computeAllMetrics();

    // Store snapshots
    for (const [metric, value] of Object.entries(metrics)) {
      await this.prisma.metricSnapshot.create({
        data: {
          metric,
          value: new Decimal(value),
          period,
          periodStart,
        },
      });
    }

    this.logger.log(`Stored ${Object.keys(metrics).length} metric snapshots`);
  }

  /**
   * Get the admin dashboard — returns latest snapshot for each metric.
   */
  async getDashboard(): Promise<DashboardKpi[]> {
    const metrics = Object.values(MetricCode);
    const dashboard: DashboardKpi[] = [];

    for (const metric of metrics) {
      const latest = await this.prisma.metricSnapshot.findFirst({
        where: { metric },
        orderBy: { createdAt: 'desc' },
      });

      dashboard.push({
        metric,
        label: this.getMetricLabel(metric),
        value: latest ? Number(latest.value) : 0,
        period: latest?.period || 'daily',
        periodStart: latest?.periodStart || new Date(),
      });
    }

    return dashboard;
  }

  /**
   * Get metric time series.
   */
  async getMetricTimeSeries(
    metric: string,
    period: MetricPeriod = MetricPeriod.DAILY,
    days: number = 30,
    dimension?: string,
    dimensionValue?: string,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      metric,
      period,
      periodStart: { gte: startDate },
    };

    if (dimension) where.dimension = dimension;
    if (dimensionValue) where.dimensionValue = dimensionValue;

    const snapshots = await this.prisma.metricSnapshot.findMany({
      where,
      orderBy: { periodStart: 'asc' },
    });

    return snapshots.map((s) => ({
      value: Number(s.value),
      periodStart: s.periodStart,
      dimension: s.dimension,
      dimensionValue: s.dimensionValue,
    }));
  }

  /**
   * Get current snapshot of all metrics.
   */
  async getCurrentSnapshot() {
    return this.getDashboard();
  }

  /**
   * Compute all metrics from current data.
   */
  private async computeAllMetrics(): Promise<Record<string, number>> {
    const [
      activeRiders,
      activeCampaigns,
      totalRevenue,
      pendingPayouts,
      fulfillmentRate,
      pendingApprovals,
      riderGrowth,
      businessGrowth,
      totalEscrowHeld,
    ] = await Promise.all([
      this.computeActiveRiders(),
      this.computeActiveCampaigns(),
      this.computeTotalRevenue(),
      this.computePendingPayouts(),
      this.computeFulfillmentRate(),
      this.computePendingApprovals(),
      this.computeRiderGrowth(),
      this.computeBusinessGrowth(),
      this.computeTotalEscrowHeld(),
    ]);

    return {
      [MetricCode.ACTIVE_RIDERS]: activeRiders,
      [MetricCode.ACTIVE_CAMPAIGNS]: activeCampaigns,
      [MetricCode.TOTAL_REVENUE]: totalRevenue,
      [MetricCode.PENDING_PAYOUTS]: pendingPayouts,
      [MetricCode.FULFILLMENT_RATE]: fulfillmentRate,
      [MetricCode.PENDING_APPROVALS]: pendingApprovals,
      [MetricCode.RIDER_GROWTH]: riderGrowth,
      [MetricCode.BUSINESS_GROWTH]: businessGrowth,
      [MetricCode.TOTAL_ESCROW_HELD]: totalEscrowHeld,
    };
  }

  private async computeActiveRiders(): Promise<number> {
    return this.prisma.rider.count({
      where: {
        status: { in: ['AVAILABLE', 'ASSIGNED', 'CAMPAIGN_ACTIVE'] },
      },
    });
  }

  private async computeActiveCampaigns(): Promise<number> {
    return this.prisma.campaign.count({
      where: { status: 'RUNNING' },
    });
  }

  private async computeTotalRevenue(): Promise<number> {
    const result = await this.prisma.ledgerEntry.aggregate({
      where: {
        accountType: 'PLATFORM_REVENUE',
        entryType: 'CREDIT',
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  private async computePendingPayouts(): Promise<number> {
    const result = await this.prisma.riderWallet.aggregate({
      where: { balance: { gt: 0 } },
      _sum: { balance: true },
    });
    return result._sum.balance || 0;
  }

  private async computeFulfillmentRate(): Promise<number> {
    const result = await this.prisma.campaign.aggregate({
      where: { status: 'RUNNING' },
      _avg: { fulfillmentPct: true },
    });
    return result._avg.fulfillmentPct ? Number(result._avg.fulfillmentPct) : 0;
  }

  private async computePendingApprovals(): Promise<number> {
    const [riders, businesses] = await Promise.all([
      this.prisma.rider.count({
        where: { status: 'VERIFICATION_PENDING' },
      }),
      this.prisma.business.count({
        where: { status: 'UNDER_REVIEW' },
      }),
    ]);
    return riders + businesses;
  }

  private async computeRiderGrowth(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.prisma.rider.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
  }

  private async computeBusinessGrowth(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.prisma.business.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
  }

  private async computeTotalEscrowHeld(): Promise<number> {
    const result = await this.prisma.escrow.aggregate({
      where: { status: 'active' },
      _sum: { remainingAmount: true },
    });
    return result._sum.remainingAmount || 0;
  }

  /**
   * Get human-readable label for a metric.
   */
  private getMetricLabel(metric: MetricCode): string {
    const labels: Record<MetricCode, string> = {
      [MetricCode.ACTIVE_RIDERS]: 'Active Riders',
      [MetricCode.ACTIVE_CAMPAIGNS]: 'Active Campaigns',
      [MetricCode.TOTAL_REVENUE]: 'Total Revenue (NPR)',
      [MetricCode.PENDING_PAYOUTS]: 'Pending Payouts (NPR)',
      [MetricCode.FULFILLMENT_RATE]: 'Avg Fulfillment Rate (%)',
      [MetricCode.VERIFICATION_COMPLIANCE]: 'Verification Compliance (%)',
      [MetricCode.PENDING_APPROVALS]: 'Pending Approvals',
      [MetricCode.RIDER_GROWTH]: 'New Riders (30d)',
      [MetricCode.BUSINESS_GROWTH]: 'New Businesses (30d)',
      [MetricCode.TOTAL_ESCROW_HELD]: 'Total Escrow Held (NPR)',
    };
    return labels[metric] || metric;
  }

  /**
   * Get the start of the current period.
   */
  private getPeriodStart(period: MetricPeriod): Date {
    const now = new Date();
    switch (period) {
      case MetricPeriod.HOURLY:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      case MetricPeriod.DAILY:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case MetricPeriod.WEEKLY:
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(now.getFullYear(), now.getMonth(), diff);
      case MetricPeriod.MONTHLY:
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  }
}
