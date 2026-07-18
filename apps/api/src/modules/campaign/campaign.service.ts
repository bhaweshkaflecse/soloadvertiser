import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCampaignDto, CampaignQueryDto } from './dto';
import { ERROR_CODES } from '@solo-advertiser/contracts';
import { CampaignStatus } from '@solo-advertiser/types';
import {
  VALID_CAMPAIGN_TRANSITIONS,
  CAMPAIGN_DEFAULTS,
  calculateCampaignCost,
  calculateFulfillmentPct,
} from './interfaces/campaign.interface';
import { CampaignCreatedEvent } from './events/campaign-created.event';
import { CampaignFundedEvent } from './events/campaign-funded.event';
import { CampaignStartedEvent } from './events/campaign-started.event';
import { CampaignCompletedEvent } from './events/campaign-completed.event';
import { CampaignCancelledEvent } from './events/campaign-cancelled.event';

/**
 * Core campaign service — manages campaign lifecycle, cost calculation,
 * and state machine transitions.
 *
 * State Machine:
 * DRAFT → PENDING_PAYMENT → PAYMENT_SUBMITTED → PAYMENT_VERIFIED → RECRUITING_RIDERS → READY → RUNNING → COMPLETED
 */
@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new campaign in DRAFT status.
   * RULE-CMP-001: Min 15 days duration.
   * RULE-CMP-002: Min 100 riders.
   * RULE-CMP-003: Cost = riders × days × business_daily_rate.
   * RULE-BIZ-005: First campaign auto-activates business (VERIFIED → ACTIVE).
   */
  async createCampaign(businessId: string, dto: CreateCampaignDto) {
    // Validate business exists and is eligible
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException({
        code: ERROR_CODES.BUSINESS.NOT_FOUND,
        message: 'Business not found',
      });
    }

    // Business must be VERIFIED or ACTIVE to create campaigns
    if (business.status !== 'VERIFIED' && business.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: ERROR_CODES.BUSINESS.NOT_ELIGIBLE_FOR_CAMPAIGN,
        message: 'Business must be verified or active to create campaigns',
      });
    }

    // Parse dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const now = new Date();

    // RULE-CMP-008: Start date must be at least 7 days ahead
    const minStartDate = new Date(now);
    minStartDate.setDate(minStartDate.getDate() + CAMPAIGN_DEFAULTS.MIN_START_DATE_DAYS_AHEAD);
    if (startDate < minStartDate) {
      throw new BadRequestException({
        code: ERROR_CODES.CAMPAIGN.START_DATE_TOO_SOON,
        message: `Start date must be at least ${CAMPAIGN_DEFAULTS.MIN_START_DATE_DAYS_AHEAD} days from now`,
      });
    }

    // Calculate duration
    const durationDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // RULE-CMP-001: Min duration
    if (durationDays < CAMPAIGN_DEFAULTS.MIN_DURATION_DAYS) {
      throw new BadRequestException({
        code: ERROR_CODES.CAMPAIGN.DURATION_BELOW_MINIMUM,
        message: `Campaign duration must be at least ${CAMPAIGN_DEFAULTS.MIN_DURATION_DAYS} days`,
      });
    }

    // RULE-CMP-002: Min riders
    if (dto.requiredRiders < CAMPAIGN_DEFAULTS.MIN_REQUIRED_RIDERS) {
      throw new BadRequestException({
        code: ERROR_CODES.CAMPAIGN.INSUFFICIENT_RIDERS,
        message: `Campaign requires at least ${CAMPAIGN_DEFAULTS.MIN_REQUIRED_RIDERS} riders`,
      });
    }

    // RULE-CMP-003: Calculate cost
    const dailyRate = CAMPAIGN_DEFAULTS.BUSINESS_DAILY_RATE;
    const riderDailyRate = CAMPAIGN_DEFAULTS.RIDER_DAILY_RATE;
    const totalCost = calculateCampaignCost(dto.requiredRiders, durationDays, dailyRate);

    const campaign = await this.prisma.campaign.create({
      data: {
        businessId,
        name: dto.name,
        status: 'DRAFT',
        targetZones: dto.targetZones,
        requiredRiders: dto.requiredRiders,
        assetType: dto.assetType || 'helmet',
        startDate,
        endDate,
        durationDays,
        totalCost,
        dailyRate,
        riderDailyRate,
        creativeMediaId: dto.creativeMediaId || null,
      },
    });

    this.logger.log(`Campaign created: ${campaign.id} for business: ${businessId}`);
    this.eventEmitter.emit(
      CampaignCreatedEvent.EVENT_NAME,
      new CampaignCreatedEvent(campaign.id, businessId),
    );

    // RULE-BIZ-005: Auto-activate business on first campaign
    if (business.status === 'VERIFIED') {
      await this.activateBusinessOnFirstCampaign(businessId);
    }

    return campaign;
  }

  /**
   * Get campaign by ID with relations.
   */
  async getCampaignById(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        assignments: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        payment: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException({
        code: ERROR_CODES.CAMPAIGN.NOT_FOUND,
        message: 'Campaign not found',
      });
    }

    return campaign;
  }

  /**
   * List campaigns for a specific business (self-service).
   */
  async listBusinessCampaigns(businessId: string, query: CampaignQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { businessId, deletedAt: null };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: pageSize,
        include: { payment: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: campaigns,
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
   * List all campaigns (admin view) with filters.
   */
  async listAllCampaigns(query: CampaignQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { deletedAt: null };

    if (query.status) {
      where.status = query.status;
    }

    if (query.businessId) {
      where.businessId = query.businessId;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: pageSize,
        include: { payment: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: campaigns,
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
   * Confirm campaign details (DRAFT → PENDING_PAYMENT).
   * Business locks in campaign parameters and moves to payment.
   */
  async confirmCampaign(campaignId: string, businessId: string) {
    const campaign = await this.getCampaignById(campaignId);

    this.assertCampaignOwnership(campaign.businessId, businessId);
    this.validateTransition(campaign.status as CampaignStatus, CampaignStatus.PENDING_PAYMENT);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.campaign.update({
        where: { id: campaignId },
        data: { status: 'PENDING_PAYMENT' },
      });

      await tx.campaignStatusHistory.create({
        data: {
          campaignId,
          fromStatus: campaign.status,
          toStatus: 'PENDING_PAYMENT',
          reason: 'Business confirmed campaign details',
        },
      });

      return result;
    });

    this.logger.log(`Campaign confirmed: ${campaignId} → PENDING_PAYMENT`);
    return updated;
  }

  /**
   * Cancel a draft campaign (business can delete their own drafts).
   */
  async cancelDraft(campaignId: string, businessId: string) {
    const campaign = await this.getCampaignById(campaignId);

    this.assertCampaignOwnership(campaign.businessId, businessId);

    if (campaign.status !== 'DRAFT') {
      throw new BadRequestException({
        code: ERROR_CODES.CAMPAIGN.INVALID_STATE_TRANSITION,
        message: 'Only draft campaigns can be deleted',
      });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'Cancelled by business (draft)',
          deletedAt: new Date(),
        },
      });

      await tx.campaignStatusHistory.create({
        data: {
          campaignId,
          fromStatus: 'DRAFT',
          toStatus: 'CANCELLED',
          reason: 'Cancelled by business (draft)',
        },
      });

      return result;
    });

    this.logger.log(`Campaign draft cancelled: ${campaignId}`);
    return updated;
  }

  /**
   * Admin: Pause a running campaign (Ops Staff+).
   * RULE-CMP-008: Only Ops Staff+ can pause.
   */
  async pauseCampaign(campaignId: string, adminUserId: string, reason?: string) {
    const campaign = await this.getCampaignById(campaignId);

    this.validateTransition(campaign.status as CampaignStatus, CampaignStatus.PAUSED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'PAUSED',
          pauseReason: reason || 'Paused by admin',
        },
      });

      await tx.campaignStatusHistory.create({
        data: {
          campaignId,
          fromStatus: campaign.status,
          toStatus: 'PAUSED',
          reason: reason || 'Paused by admin',
          changedBy: adminUserId,
        },
      });

      return result;
    });

    this.logger.log(`Campaign paused: ${campaignId} by admin: ${adminUserId}`);
    return updated;
  }

  /**
   * Admin: Resume a paused campaign (Ops Staff+).
   */
  async resumeCampaign(campaignId: string, adminUserId: string) {
    const campaign = await this.getCampaignById(campaignId);

    if (campaign.status !== 'PAUSED') {
      throw new BadRequestException({
        code: ERROR_CODES.CAMPAIGN.INVALID_STATE_TRANSITION,
        message: 'Only paused campaigns can be resumed',
      });
    }

    this.validateTransition(campaign.status as CampaignStatus, CampaignStatus.RUNNING);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'RUNNING',
          pauseReason: null,
        },
      });

      await tx.campaignStatusHistory.create({
        data: {
          campaignId,
          fromStatus: 'PAUSED',
          toStatus: 'RUNNING',
          reason: 'Resumed by admin',
          changedBy: adminUserId,
        },
      });

      return result;
    });

    this.logger.log(`Campaign resumed: ${campaignId} by admin: ${adminUserId}`);
    return updated;
  }

  /**
   * Admin: Cancel campaign.
   * RULE-CMP-009: Admin+ can cancel Running; Ops Staff+ can cancel pre-Running.
   */
  async cancelCampaign(campaignId: string, adminUserId: string, reason: string) {
    const campaign = await this.getCampaignById(campaignId);

    this.validateTransition(campaign.status as CampaignStatus, CampaignStatus.CANCELLED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
        },
      });

      await tx.campaignStatusHistory.create({
        data: {
          campaignId,
          fromStatus: campaign.status,
          toStatus: 'CANCELLED',
          reason,
          changedBy: adminUserId,
        },
      });

      return result;
    });

    this.logger.log(`Campaign cancelled: ${campaignId} by admin: ${adminUserId}`);
    this.eventEmitter.emit(
      CampaignCancelledEvent.EVENT_NAME,
      new CampaignCancelledEvent(campaignId, campaign.businessId, reason, adminUserId),
    );

    return updated;
  }

  /**
   * Auto-transition: RECRUITING_RIDERS → READY when fulfillment threshold reached.
   * Called by AssignmentService when an assignment is created.
   */
  async checkAndTransitionToReady(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.status !== 'RECRUITING_RIDERS') {
      return;
    }

    const fulfillmentPct = calculateFulfillmentPct(
      campaign.currentAssigned,
      campaign.requiredRiders,
    );

    if (fulfillmentPct >= CAMPAIGN_DEFAULTS.FULFILLMENT_THRESHOLD) {
      await this.prisma.$transaction(async (tx) => {
        await tx.campaign.update({
          where: { id: campaignId },
          data: { status: 'READY' },
        });

        await tx.campaignStatusHistory.create({
          data: {
            campaignId,
            fromStatus: 'RECRUITING_RIDERS',
            toStatus: 'READY',
            reason: `Fulfillment threshold reached (${fulfillmentPct.toFixed(2)}%)`,
          },
        });
      });

      this.logger.log(`Campaign auto-transitioned to READY: ${campaignId}`);
    }
  }

  /**
   * System: Transition READY → RUNNING when start_date is reached (cron job).
   */
  async startReadyCampaigns() {
    const now = new Date();

    const readyCampaigns = await this.prisma.campaign.findMany({
      where: {
        status: 'READY',
        startDate: { lte: now },
        deletedAt: null,
      },
    });

    for (const campaign of readyCampaigns) {
      await this.prisma.$transaction(async (tx) => {
        await tx.campaign.update({
          where: { id: campaign.id },
          data: { status: 'RUNNING' },
        });

        await tx.campaignStatusHistory.create({
          data: {
            campaignId: campaign.id,
            fromStatus: 'READY',
            toStatus: 'RUNNING',
            reason: 'Start date reached — auto-started by system',
          },
        });
      });

      this.logger.log(`Campaign auto-started: ${campaign.id}`);
      this.eventEmitter.emit(
        CampaignStartedEvent.EVENT_NAME,
        new CampaignStartedEvent(campaign.id, campaign.businessId),
      );
    }

    return readyCampaigns.length;
  }

  /**
   * System: Transition RUNNING → COMPLETED when end_date is reached (cron job).
   */
  async completeExpiredCampaigns() {
    const now = new Date();

    const expiredCampaigns = await this.prisma.campaign.findMany({
      where: {
        status: 'RUNNING',
        endDate: { lte: now },
        deletedAt: null,
      },
    });

    for (const campaign of expiredCampaigns) {
      await this.prisma.$transaction(async (tx) => {
        await tx.campaign.update({
          where: { id: campaign.id },
          data: { status: 'COMPLETED' },
        });

        await tx.campaignStatusHistory.create({
          data: {
            campaignId: campaign.id,
            fromStatus: 'RUNNING',
            toStatus: 'COMPLETED',
            reason: 'End date reached — auto-completed by system',
          },
        });
      });

      this.logger.log(`Campaign auto-completed: ${campaign.id}`);
      this.eventEmitter.emit(
        CampaignCompletedEvent.EVENT_NAME,
        new CampaignCompletedEvent(campaign.id, campaign.businessId),
      );
    }

    return expiredCampaigns.length;
  }

  /**
   * Increment assignment count and update fulfillment percentage.
   * Called by AssignmentService when a rider is assigned.
   */
  async incrementAssignment(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return;

    const newAssigned = campaign.currentAssigned + 1;
    const fulfillmentPct = calculateFulfillmentPct(newAssigned, campaign.requiredRiders);

    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        currentAssigned: newAssigned,
        fulfillmentPct,
      },
    });

    // Check auto-transition
    await this.checkAndTransitionToReady(campaignId);
  }

  /**
   * Decrement assignment count on removal.
   * Called by AssignmentService when a rider is removed.
   */
  async decrementAssignment(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return;

    const newAssigned = Math.max(0, campaign.currentAssigned - 1);
    const fulfillmentPct = calculateFulfillmentPct(newAssigned, campaign.requiredRiders);

    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        currentAssigned: newAssigned,
        fulfillmentPct,
      },
    });
  }

  /**
   * Internal: Activate business on first campaign creation (RULE-BIZ-005).
   */
  private async activateBusinessOnFirstCampaign(businessId: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.business.update({
          where: { id: businessId },
          data: { status: 'ACTIVE' },
        });

        await tx.businessStatusHistory.create({
          data: {
            businessId,
            fromStatus: 'VERIFIED',
            toStatus: 'ACTIVE',
            reason: 'First campaign created — auto-activated',
          },
        });
      });

      this.logger.log(`Business auto-activated: ${businessId} (first campaign created)`);
    } catch (error) {
      this.logger.warn(`Failed to auto-activate business: ${businessId}`, error);
    }
  }

  /**
   * Validate state transition against the campaign state machine.
   */
  private validateTransition(from: CampaignStatus, to: CampaignStatus): void {
    const validTargets = VALID_CAMPAIGN_TRANSITIONS[from];

    if (!validTargets || !validTargets.includes(to)) {
      throw new BadRequestException({
        code: ERROR_CODES.CAMPAIGN.INVALID_STATE_TRANSITION,
        message: `Invalid state transition from ${from} to ${to}`,
      });
    }
  }

  /**
   * Assert that the campaign belongs to the requesting business.
   */
  private assertCampaignOwnership(campaignBusinessId: string, requestBusinessId: string): void {
    if (campaignBusinessId !== requestBusinessId) {
      throw new ForbiddenException({
        code: ERROR_CODES.CAMPAIGN.UNAUTHORIZED_ACTION,
        message: 'You do not own this campaign',
      });
    }
  }
}
