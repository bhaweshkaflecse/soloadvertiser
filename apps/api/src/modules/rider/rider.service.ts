import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRiderProfileDto, UpdateRiderProfileDto } from './dto';
import { RiderQueryDto } from './dto/rider-query.dto';
import { ERROR_CODES } from '@soloadvertiser/contracts';
import { RiderStatus } from '@soloadvertiser/types';
import { VALID_TRANSITIONS } from './interfaces/rider.interface';
import { RiderRegisteredEvent } from './events/rider-registered.event';
import { RiderApprovedEvent } from './events/rider-approved.event';
import { RiderSuspendedEvent } from './events/rider-suspended.event';

/**
 * Core rider service — manages rider lifecycle, profile, and state machine transitions.
 */
@Injectable()
export class RiderService {
  private readonly logger = new Logger(RiderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a rider profile linked to user. Starts in PRE_REGISTERED state.
   */
  async createRiderProfile(userId: string, dto: CreateRiderProfileDto) {
    // Check if rider already exists for this user
    const existing = await this.prisma.rider.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.RIDER.ALREADY_REGISTERED,
        message: 'Rider profile already exists for this user',
      });
    }

    const rider = await this.prisma.rider.create({
      data: {
        userId,
        status: 'PRE_REGISTERED',
        fullName: dto.fullName || null,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        address: dto.address || null,
        emergencyName: dto.emergencyName || null,
        emergencyPhone: dto.emergencyPhone || null,
        profilePhotoId: dto.profilePhotoId || null,
      },
    });

    this.logger.log(`Rider profile created: ${rider.id} for user: ${userId}`);
    this.eventEmitter.emit(
      RiderRegisteredEvent.EVENT_NAME,
      new RiderRegisteredEvent(rider.id, userId),
    );

    return rider;
  }

  /**
   * Get rider profile by user ID (self-service).
   */
  async getRiderByUserId(userId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
      include: {
        vehicle: true,
        documents: true,
        assets: true,
      },
    });

    if (!rider) {
      throw new NotFoundException({
        code: ERROR_CODES.RESOURCE.NOT_FOUND,
        message: 'Rider profile not found',
      });
    }

    return rider;
  }

  /**
   * Get rider profile by rider ID (admin).
   */
  async getRiderById(riderId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId },
      include: {
        vehicle: true,
        documents: true,
        assets: true,
        reliabilityScores: {
          orderBy: { computedAt: 'desc' },
          take: 1,
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!rider) {
      throw new NotFoundException({
        code: ERROR_CODES.RESOURCE.NOT_FOUND,
        message: 'Rider not found',
      });
    }

    return rider;
  }

  /**
   * Update rider personal information.
   */
  async updateProfile(userId: string, dto: UpdateRiderProfileDto) {
    const rider = await this.getRiderByUserId(userId);

    const updated = await this.prisma.rider.update({
      where: { id: rider.id },
      data: {
        fullName: dto.fullName ?? rider.fullName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : rider.dateOfBirth,
        address: dto.address ?? rider.address,
        emergencyName: dto.emergencyName ?? rider.emergencyName,
        emergencyPhone: dto.emergencyPhone ?? rider.emergencyPhone,
        profilePhotoId: dto.profilePhotoId ?? rider.profilePhotoId,
      },
    });

    this.logger.log(`Rider profile updated: ${rider.id}`);
    return updated;
  }

  /**
   * Admin: List all riders with filters, search, pagination.
   */
  async listRiders(query: RiderQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.zoneId) {
      where.zoneId = query.zoneId;
    }

    if (query.scoreMin !== undefined || query.scoreMax !== undefined) {
      where.reliabilityScore = {};
      if (query.scoreMin !== undefined) {
        where.reliabilityScore.gte = query.scoreMin;
      }
      if (query.scoreMax !== undefined) {
        where.reliabilityScore.lte = query.scoreMax;
      }
    }

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [riders, total] = await Promise.all([
      this.prisma.rider.findMany({
        where,
        skip,
        take: pageSize,
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rider.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: riders,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Admin: Approve rider (VERIFICATION_PENDING → APPROVED).
   */
  async approveRider(riderId: string, adminUserId: string) {
    const rider = await this.getRiderById(riderId);

    this.validateTransition(rider.status as RiderStatus, RiderStatus.APPROVED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.rider.update({
        where: { id: riderId },
        data: { status: 'APPROVED' },
      });

      await tx.riderStatusHistory.create({
        data: {
          riderId,
          fromStatus: rider.status,
          toStatus: 'APPROVED',
          reason: 'Admin approved rider',
          changedBy: adminUserId,
        },
      });

      return result;
    });

    this.logger.log(`Rider approved: ${riderId} by admin: ${adminUserId}`);
    this.eventEmitter.emit(
      RiderApprovedEvent.EVENT_NAME,
      new RiderApprovedEvent(riderId, adminUserId),
    );

    return updated;
  }

  /**
   * Admin: Reject rider (VERIFICATION_PENDING → DOCUMENTS_PENDING).
   */
  async rejectRider(riderId: string, adminUserId: string, reason?: string) {
    const rider = await this.getRiderById(riderId);

    this.validateTransition(rider.status as RiderStatus, RiderStatus.DOCUMENTS_PENDING);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.rider.update({
        where: { id: riderId },
        data: { status: 'DOCUMENTS_PENDING' },
      });

      await tx.riderStatusHistory.create({
        data: {
          riderId,
          fromStatus: rider.status,
          toStatus: 'DOCUMENTS_PENDING',
          reason: reason || 'Documents rejected by admin',
          changedBy: adminUserId,
        },
      });

      return result;
    });

    this.logger.log(`Rider rejected: ${riderId} by admin: ${adminUserId}`);
    return updated;
  }

  /**
   * Admin: Suspend rider (any active state → SUSPENDED).
   */
  async suspendRider(riderId: string, adminUserId: string, reason: string) {
    const rider = await this.getRiderById(riderId);

    this.validateTransition(rider.status as RiderStatus, RiderStatus.SUSPENDED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.rider.update({
        where: { id: riderId },
        data: {
          status: 'SUSPENDED',
          suspensionReason: reason,
        },
      });

      await tx.riderStatusHistory.create({
        data: {
          riderId,
          fromStatus: rider.status,
          toStatus: 'SUSPENDED',
          reason,
          changedBy: adminUserId,
        },
      });

      return result;
    });

    this.logger.log(`Rider suspended: ${riderId} by admin: ${adminUserId}, reason: ${reason}`);
    this.eventEmitter.emit(
      RiderSuspendedEvent.EVENT_NAME,
      new RiderSuspendedEvent(riderId, adminUserId, reason, rider.status),
    );

    return updated;
  }

  /**
   * Admin: Reactivate suspended rider (SUSPENDED → APPROVED).
   */
  async reactivateRider(riderId: string, adminUserId: string) {
    const rider = await this.getRiderById(riderId);

    if (rider.status !== 'SUSPENDED') {
      throw new BadRequestException({
        code: ERROR_CODES.RIDER.INVALID_STATE_TRANSITION,
        message: 'Only suspended riders can be reactivated',
      });
    }

    this.validateTransition(rider.status as RiderStatus, RiderStatus.APPROVED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.rider.update({
        where: { id: riderId },
        data: {
          status: 'APPROVED',
          suspensionReason: null,
        },
      });

      await tx.riderStatusHistory.create({
        data: {
          riderId,
          fromStatus: 'SUSPENDED',
          toStatus: 'APPROVED',
          reason: 'Reactivated by admin',
          changedBy: adminUserId,
        },
      });

      return result;
    });

    this.logger.log(`Rider reactivated: ${riderId} by admin: ${adminUserId}`);
    return updated;
  }

  /**
   * Get rider dashboard aggregation.
   */
  async getDashboard(userId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
      include: {
        vehicle: true,
        documents: true,
        reliabilityScores: {
          orderBy: { computedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!rider) {
      throw new NotFoundException({
        code: ERROR_CODES.RESOURCE.NOT_FOUND,
        message: 'Rider profile not found',
      });
    }

    const pendingDocuments = rider.documents.filter(
      (d) => d.status === 'UPLOADED' || d.status === 'UNDER_REVIEW',
    ).length;

    return {
      rider: {
        id: rider.id,
        status: rider.status,
        fullName: rider.fullName,
        reliabilityScore: rider.reliabilityScore,
        totalCampaigns: rider.totalCampaigns,
        totalEarnings: rider.totalEarnings,
        zoneId: rider.zoneId,
      },
      vehicle: rider.vehicle,
      documentsCount: rider.documents.length,
      pendingDocuments,
      reliabilityScore: rider.reliabilityScores[0] || null,
      activeCampaign: null, // Sprint 4 placeholder
    };
  }

  /**
   * Validate state transition against the state machine.
   * Throws RIDER_006 if the transition is not valid.
   */
  private validateTransition(from: RiderStatus, to: RiderStatus): void {
    const validTargets = VALID_TRANSITIONS[from];

    if (!validTargets || !validTargets.includes(to)) {
      throw new BadRequestException({
        code: ERROR_CODES.RIDER.INVALID_STATE_TRANSITION,
        message: `Invalid state transition from ${from} to ${to}`,
      });
    }
  }

  /**
   * Internal helper: transition rider status with history record.
   */
  async transitionStatus(
    riderId: string,
    toStatus: RiderStatus,
    reason?: string,
    changedBy?: string,
  ) {
    const rider = await this.getRiderById(riderId);
    this.validateTransition(rider.status as RiderStatus, toStatus);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.rider.update({
        where: { id: riderId },
        data: { status: toStatus },
      });

      await tx.riderStatusHistory.create({
        data: {
          riderId,
          fromStatus: rider.status,
          toStatus,
          reason: reason || null,
          changedBy: changedBy || null,
        },
      });

      return result;
    });

    this.logger.log(`Rider ${riderId} transitioned: ${rider.status} → ${toStatus}`);
    return updated;
  }
}
