import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@solo-advertiser/contracts';
import { RiderStatus } from '@solo-advertiser/types';
import { RiderService } from './rider.service';
import { VALID_TRANSITIONS } from './interfaces/rider.interface';

/**
 * Service for managing rider availability toggle and eligibility checks.
 */
@Injectable()
export class RiderAvailabilityService {
  private readonly logger = new Logger(RiderAvailabilityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly riderService: RiderService,
  ) {}

  /**
   * Toggle rider availability: APPROVED/UNAVAILABLE → AVAILABLE, AVAILABLE → UNAVAILABLE.
   */
  async toggleAvailability(userId: string) {
    const rider = await this.riderService.getRiderByUserId(userId);
    const currentStatus = rider.status as RiderStatus;

    let targetStatus: RiderStatus;

    if (currentStatus === RiderStatus.AVAILABLE) {
      targetStatus = RiderStatus.UNAVAILABLE;
    } else if (
      currentStatus === RiderStatus.UNAVAILABLE ||
      currentStatus === RiderStatus.APPROVED
    ) {
      targetStatus = RiderStatus.AVAILABLE;
    } else {
      throw new BadRequestException({
        code: ERROR_CODES.RIDER.INVALID_STATE_TRANSITION,
        message: `Cannot toggle availability from status: ${currentStatus}`,
      });
    }

    // Validate zone is assigned before going Available
    if (targetStatus === RiderStatus.AVAILABLE && !rider.zoneId) {
      throw new BadRequestException({
        code: ERROR_CODES.RIDER.ZONE_NOT_ASSIGNED,
        message: 'Zone must be assigned before becoming available',
      });
    }

    const updated = await this.riderService.transitionStatus(
      rider.id,
      targetStatus,
      `Rider toggled availability to ${targetStatus}`,
      rider.userId,
    );

    this.logger.log(`Rider ${rider.id} toggled: ${currentStatus} → ${targetStatus}`);
    return updated;
  }

  /**
   * Get eligible riders for campaign assignment.
   * Criteria: AVAILABLE status + zone match + valid docs + no conflicts.
   */
  async getEligibleRiders(zoneId?: string, assetType?: string, minScore?: number) {
    const where: any = {
      status: 'AVAILABLE',
      deletedAt: null,
    };

    if (zoneId) {
      where.zoneId = zoneId;
    }

    if (minScore !== undefined) {
      where.reliabilityScore = { gte: minScore };
    }

    const riders = await this.prisma.rider.findMany({
      where,
      include: {
        vehicle: true,
        documents: {
          where: { status: 'APPROVED' },
        },
        assets: assetType ? { where: { assetType, isVerified: true } } : true,
      },
      orderBy: { reliabilityScore: 'desc' },
    });

    // Filter: riders must have all required documents approved
    const eligible = riders.filter((rider) => {
      const approvedTypes = new Set(rider.documents.map((d) => d.documentType));
      const hasAllDocs =
        approvedTypes.has('citizenship') &&
        approvedTypes.has('driving_license') &&
        approvedTypes.has('vehicle_registration') &&
        approvedTypes.has('profile_photo');

      // If asset type filter specified, must have a verified asset of that type
      if (assetType) {
        const hasAsset = rider.assets.some(
          (a) => a.assetType === assetType && a.isVerified,
        );
        return hasAllDocs && hasAsset;
      }

      return hasAllDocs;
    });

    return eligible;
  }

  /**
   * Assign zone to rider.
   */
  async assignZone(userId: string, zoneId: string, regionId?: string) {
    const rider = await this.riderService.getRiderByUserId(userId);

    const updated = await this.prisma.rider.update({
      where: { id: rider.id },
      data: {
        zoneId,
        regionId: regionId || null,
      },
    });

    this.logger.log(`Zone assigned: ${zoneId} for rider: ${rider.id}`);
    return updated;
  }
}
