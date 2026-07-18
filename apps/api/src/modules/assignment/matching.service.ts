import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@solo-advertiser/contracts';
import { EligibleRider, EligibilityCriteria } from './interfaces/assignment.interface';

/**
 * Matching service — determines rider eligibility and scoring for campaign assignments.
 *
 * Eligibility filters:
 * 1. Status = AVAILABLE (RULE-RDR-005)
 * 2. Zone overlaps campaign target zones (RULE-ASN-001)
 * 3. No conflicting assignment on same asset type (RULE-ASN-002)
 * 4. Not suspended (RULE-RDR-004)
 * 5. All documents valid
 *
 * Sorting:
 * 1. Reliability score (descending) — primary
 * 2. Total completed campaigns (descending) — secondary
 */
@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get eligible riders for a campaign, sorted by reliability score.
   */
  async getEligibleRiders(campaignId: string): Promise<EligibleRider[]> {
    // Get campaign details
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException({
        code: ERROR_CODES.CAMPAIGN.NOT_FOUND,
        message: 'Campaign not found',
      });
    }

    // Get all riders who might be eligible
    const riders = await this.prisma.rider.findMany({
      where: {
        deletedAt: null,
        status: 'AVAILABLE',
      },
      include: {
        documents: true,
        reliabilityScores: {
          orderBy: { computedAt: 'desc' },
          take: 1,
        },
      },
    });

    // Get existing assignments for this campaign's asset type to check conflicts
    const existingAssignments = await this.prisma.assignment.findMany({
      where: {
        status: { notIn: ['COMPLETED', 'REMOVED'] },
        campaign: {
          assetType: campaign.assetType,
          status: { in: ['RECRUITING_RIDERS', 'READY', 'RUNNING'] },
        },
      },
      select: { riderId: true, campaignId: true },
    });

    const ridersWithConflicts = new Set(
      existingAssignments
        .filter((a) => a.campaignId !== campaignId)
        .map((a) => a.riderId),
    );

    // Also get riders already assigned to this campaign
    const alreadyAssigned = new Set(
      existingAssignments
        .filter((a) => a.campaignId === campaignId)
        .map((a) => a.riderId),
    );

    // Evaluate eligibility for each rider
    const eligibleRiders: EligibleRider[] = [];

    for (const rider of riders) {
      // Skip if already assigned to this campaign
      if (alreadyAssigned.has(rider.id)) continue;

      const criteria: EligibilityCriteria = {
        isAvailable: rider.status === 'AVAILABLE',
        zoneOverlap: this.checkZoneOverlap(rider.zoneId, campaign.targetZones),
        noConflict: !ridersWithConflicts.has(rider.id),
        notSuspended: rider.status !== 'SUSPENDED',
        documentsValid: this.checkDocumentsValid(rider.documents),
      };

      const eligible = Object.values(criteria).every(Boolean);

      if (eligible) {
        const latestScore = rider.reliabilityScores[0];
        eligibleRiders.push({
          riderId: rider.id,
          fullName: rider.fullName,
          zoneId: rider.zoneId,
          reliabilityScore: latestScore?.compositeScore || 0,
          totalCampaigns: rider.totalCampaigns,
          eligible: true,
          criteria,
        });
      }
    }

    // Sort: reliability score desc (primary), total campaigns desc (secondary)
    eligibleRiders.sort((a, b) => {
      if (b.reliabilityScore !== a.reliabilityScore) {
        return b.reliabilityScore - a.reliabilityScore;
      }
      return b.totalCampaigns - a.totalCampaigns;
    });

    this.logger.log(
      `Found ${eligibleRiders.length} eligible riders for campaign: ${campaignId}`,
    );

    return eligibleRiders;
  }

  /**
   * Validate single rider eligibility for a specific campaign.
   */
  async validateRiderEligibility(
    riderId: string,
    campaignId: string,
  ): Promise<{ eligible: boolean; criteria: EligibilityCriteria; reason?: string }> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException({
        code: ERROR_CODES.CAMPAIGN.NOT_FOUND,
        message: 'Campaign not found',
      });
    }

    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId },
      include: { documents: true },
    });

    if (!rider) {
      return {
        eligible: false,
        criteria: {
          isAvailable: false,
          zoneOverlap: false,
          noConflict: false,
          notSuspended: false,
          documentsValid: false,
        },
        reason: 'Rider not found',
      };
    }

    // Check for conflicting assignment on same asset type
    const conflictingAssignment = await this.prisma.assignment.findFirst({
      where: {
        riderId,
        status: { notIn: ['COMPLETED', 'REMOVED'] },
        campaign: {
          assetType: campaign.assetType,
          status: { in: ['RECRUITING_RIDERS', 'READY', 'RUNNING'] },
          id: { not: campaignId },
        },
      },
    });

    const criteria: EligibilityCriteria = {
      isAvailable: rider.status === 'AVAILABLE',
      zoneOverlap: this.checkZoneOverlap(rider.zoneId, campaign.targetZones),
      noConflict: !conflictingAssignment,
      notSuspended: rider.status !== 'SUSPENDED',
      documentsValid: this.checkDocumentsValid(rider.documents),
    };

    const eligible = Object.values(criteria).every(Boolean);
    let reason: string | undefined;

    if (!eligible) {
      if (!criteria.isAvailable) reason = 'Rider is not in AVAILABLE status';
      else if (!criteria.zoneOverlap) reason = 'Rider zone does not overlap campaign target zones';
      else if (!criteria.noConflict) reason = 'Rider has conflicting assignment on same asset type';
      else if (!criteria.notSuspended) reason = 'Rider is suspended';
      else if (!criteria.documentsValid) reason = 'Rider has invalid or missing documents';
    }

    return { eligible, criteria, reason };
  }

  /**
   * Check if rider's zone overlaps with campaign target zones.
   * RULE-ASN-001
   */
  private checkZoneOverlap(riderZoneId: string | null, targetZones: string[]): boolean {
    if (!riderZoneId || targetZones.length === 0) return false;
    return targetZones.includes(riderZoneId);
  }

  /**
   * Check if all rider documents are approved/valid.
   */
  private checkDocumentsValid(documents: { status: string }[]): boolean {
    if (documents.length === 0) return false;
    return documents.every(
      (doc) => doc.status === 'APPROVED',
    );
  }
}
