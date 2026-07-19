import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBusinessProfileDto, UpdateBusinessProfileDto } from './dto';
import { BusinessQueryDto } from './dto/business-query.dto';
import { ERROR_CODES } from '@soloadvertiser/contracts';
import { BusinessStatus } from '@soloadvertiser/types';
import { VALID_TRANSITIONS } from './interfaces/business.interface';
import { BusinessRegisteredEvent } from './events/business-registered.event';
import { BusinessVerifiedEvent } from './events/business-verified.event';
import { BusinessActivatedEvent } from './events/business-activated.event';
import { BusinessSuspendedEvent } from './events/business-suspended.event';
import { BusinessBlacklistedEvent } from './events/business-blacklisted.event';

/**
 * Core business service — manages business lifecycle, profile, and state machine transitions.
 *
 * State Machine:
 * REGISTERED → DOCUMENTS_PENDING → UNDER_REVIEW → VERIFIED → ACTIVE → SUSPENDED → BLACKLISTED
 */
@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a business profile linked to user. Starts in REGISTERED state.
   * RULE-BIZ-001: Business registers via email+password (User created in Identity module).
   */
  async createBusinessProfile(userId: string, dto: CreateBusinessProfileDto) {
    // Check if business already exists for this user
    const existing = await this.prisma.business.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.BUSINESS.ALREADY_REGISTERED,
        message: 'Business profile already exists for this user',
      });
    }

    // Check PAN/VAT uniqueness if provided
    if (dto.panVatNumber) {
      const panExists = await this.prisma.business.findFirst({
        where: { panVatNumber: dto.panVatNumber, deletedAt: null },
      });
      if (panExists) {
        throw new ConflictException({
          code: ERROR_CODES.BUSINESS.PAN_VAT_EXISTS,
          message: 'PAN/VAT number already registered',
        });
      }
    }

    const business = await this.prisma.business.create({
      data: {
        userId,
        status: 'REGISTERED',
        companyName: dto.companyName || null,
        legalName: dto.legalName || null,
        panVatNumber: dto.panVatNumber || null,
        address: dto.address || null,
        phone: dto.phone || null,
        website: dto.website || null,
        industry: dto.industry || null,
        contactPersonName: dto.contactPersonName || null,
        contactPersonEmail: dto.contactPersonEmail || null,
        contactPersonPhone: dto.contactPersonPhone || null,
        regionId: dto.regionId || null,
        zoneId: dto.zoneId || null,
      },
    });

    this.logger.log(`Business profile created: ${business.id} for user: ${userId}`);
    this.eventEmitter.emit(
      BusinessRegisteredEvent.EVENT_NAME,
      new BusinessRegisteredEvent(business.id, userId),
    );

    return business;
  }

  /**
   * Get business profile by user ID (self-service).
   */
  async getBusinessByUserId(userId: string) {
    const business = await this.prisma.business.findUnique({
      where: { userId },
      include: {
        documents: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!business) {
      throw new NotFoundException({
        code: ERROR_CODES.BUSINESS.NOT_FOUND,
        message: 'Business profile not found',
      });
    }

    return business;
  }

  /**
   * Get business profile by business ID (admin).
   */
  async getBusinessById(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: {
        documents: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!business) {
      throw new NotFoundException({
        code: ERROR_CODES.BUSINESS.NOT_FOUND,
        message: 'Business not found',
      });
    }

    return business;
  }

  /**
   * Update business company information.
   * RULE-BIZ-008: Blacklisted businesses cannot perform write operations.
   */
  async updateProfile(userId: string, dto: UpdateBusinessProfileDto) {
    const business = await this.getBusinessByUserId(userId);

    this.assertNotBlacklisted(business.status as BusinessStatus);

    // Check PAN/VAT uniqueness if changing
    if (dto.panVatNumber && dto.panVatNumber !== business.panVatNumber) {
      const panExists = await this.prisma.business.findFirst({
        where: {
          panVatNumber: dto.panVatNumber,
          deletedAt: null,
          id: { not: business.id },
        },
      });
      if (panExists) {
        throw new ConflictException({
          code: ERROR_CODES.BUSINESS.PAN_VAT_EXISTS,
          message: 'PAN/VAT number already registered',
        });
      }
    }

    const updated = await this.prisma.business.update({
      where: { id: business.id },
      data: {
        companyName: dto.companyName ?? business.companyName,
        legalName: dto.legalName ?? business.legalName,
        panVatNumber: dto.panVatNumber ?? business.panVatNumber,
        address: dto.address ?? business.address,
        phone: dto.phone ?? business.phone,
        website: dto.website ?? business.website,
        industry: dto.industry ?? business.industry,
        contactPersonName: dto.contactPersonName ?? business.contactPersonName,
        contactPersonEmail: dto.contactPersonEmail ?? business.contactPersonEmail,
        contactPersonPhone: dto.contactPersonPhone ?? business.contactPersonPhone,
        regionId: dto.regionId ?? business.regionId,
        zoneId: dto.zoneId ?? business.zoneId,
      },
    });

    this.logger.log(`Business profile updated: ${business.id}`);
    return updated;
  }

  /**
   * Admin: List all businesses with filters, search, pagination.
   */
  async listBusinesses(query: BusinessQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { deletedAt: null };

    if (query.status) {
      where.status = query.status;
    }

    if (query.industry) {
      where.industry = { contains: query.industry, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { legalName: { contains: query.search, mode: 'insensitive' } },
        { panVatNumber: { contains: query.search, mode: 'insensitive' } },
        { contactPersonName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [businesses, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        skip,
        take: pageSize,
        include: { documents: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.business.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: businesses,
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
   * Admin: Verify business (UNDER_REVIEW → VERIFIED).
   * RULE-BIZ-003: Only Operations Staff+ can verify.
   */
  async verifyBusiness(businessId: string, adminUserId: string) {
    const business = await this.getBusinessById(businessId);

    this.validateTransition(business.status as BusinessStatus, BusinessStatus.VERIFIED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.business.update({
        where: { id: businessId },
        data: { status: 'VERIFIED' },
      });

      await tx.businessStatusHistory.create({
        data: {
          businessId,
          fromStatus: business.status,
          toStatus: 'VERIFIED',
          reason: 'Admin verified business',
          changedBy: adminUserId,
        },
      });

      return result;
    });

    this.logger.log(`Business verified: ${businessId} by admin: ${adminUserId}`);
    this.eventEmitter.emit(
      BusinessVerifiedEvent.EVENT_NAME,
      new BusinessVerifiedEvent(businessId, adminUserId),
    );

    return updated;
  }

  /**
   * Admin: Reject business docs (UNDER_REVIEW → DOCUMENTS_PENDING).
   */
  async rejectBusiness(businessId: string, adminUserId: string, reason?: string) {
    const business = await this.getBusinessById(businessId);

    this.validateTransition(business.status as BusinessStatus, BusinessStatus.DOCUMENTS_PENDING);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.business.update({
        where: { id: businessId },
        data: { status: 'DOCUMENTS_PENDING' },
      });

      await tx.businessStatusHistory.create({
        data: {
          businessId,
          fromStatus: business.status,
          toStatus: 'DOCUMENTS_PENDING',
          reason: reason || 'Documents rejected by admin — resubmission required',
          changedBy: adminUserId,
        },
      });

      return result;
    });

    this.logger.log(`Business rejected: ${businessId} by admin: ${adminUserId}`);
    return updated;
  }

  /**
   * Admin: Suspend business (VERIFIED/ACTIVE → SUSPENDED).
   * RULE-BIZ-006: Operations Staff+ can suspend.
   */
  async suspendBusiness(businessId: string, adminUserId: string, reason: string) {
    const business = await this.getBusinessById(businessId);

    this.validateTransition(business.status as BusinessStatus, BusinessStatus.SUSPENDED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.business.update({
        where: { id: businessId },
        data: {
          status: 'SUSPENDED',
          suspensionReason: reason,
        },
      });

      await tx.businessStatusHistory.create({
        data: {
          businessId,
          fromStatus: business.status,
          toStatus: 'SUSPENDED',
          reason,
          changedBy: adminUserId,
        },
      });

      return result;
    });

    this.logger.log(`Business suspended: ${businessId} by admin: ${adminUserId}, reason: ${reason}`);
    this.eventEmitter.emit(
      BusinessSuspendedEvent.EVENT_NAME,
      new BusinessSuspendedEvent(businessId, adminUserId, reason, business.status),
    );

    return updated;
  }

  /**
   * Admin: Reactivate suspended business (SUSPENDED → VERIFIED).
   * Cannot reactivate if blacklisted.
   */
  async reactivateBusiness(businessId: string, adminUserId: string) {
    const business = await this.getBusinessById(businessId);

    if (business.status === 'BLACKLISTED') {
      throw new BadRequestException({
        code: ERROR_CODES.BUSINESS.CANNOT_REACTIVATE_BLACKLISTED,
        message: 'Cannot reactivate a blacklisted business',
      });
    }

    if (business.status !== 'SUSPENDED') {
      throw new BadRequestException({
        code: ERROR_CODES.BUSINESS.INVALID_STATE_TRANSITION,
        message: 'Only suspended businesses can be reactivated',
      });
    }

    this.validateTransition(business.status as BusinessStatus, BusinessStatus.VERIFIED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.business.update({
        where: { id: businessId },
        data: {
          status: 'VERIFIED',
          suspensionReason: null,
        },
      });

      await tx.businessStatusHistory.create({
        data: {
          businessId,
          fromStatus: 'SUSPENDED',
          toStatus: 'VERIFIED',
          reason: 'Reactivated by admin',
          changedBy: adminUserId,
        },
      });

      return result;
    });

    this.logger.log(`Business reactivated: ${businessId} by admin: ${adminUserId}`);
    return updated;
  }

  /**
   * Super Admin: Blacklist business permanently (SUSPENDED → BLACKLISTED).
   * RULE-BIZ-007: Only Super Admin can blacklist — irreversible.
   */
  async blacklistBusiness(businessId: string, adminUserId: string, reason: string) {
    const business = await this.getBusinessById(businessId);

    this.validateTransition(business.status as BusinessStatus, BusinessStatus.BLACKLISTED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.business.update({
        where: { id: businessId },
        data: {
          status: 'BLACKLISTED',
          blacklistReason: reason,
        },
      });

      await tx.businessStatusHistory.create({
        data: {
          businessId,
          fromStatus: business.status,
          toStatus: 'BLACKLISTED',
          reason,
          changedBy: adminUserId,
        },
      });

      return result;
    });

    this.logger.log(`Business BLACKLISTED: ${businessId} by Super Admin: ${adminUserId}, reason: ${reason}`);
    this.eventEmitter.emit(
      BusinessBlacklistedEvent.EVENT_NAME,
      new BusinessBlacklistedEvent(businessId, adminUserId, reason),
    );

    return updated;
  }

  /**
   * Get business dashboard aggregation.
   */
  async getDashboard(userId: string) {
    const business = await this.prisma.business.findUnique({
      where: { userId },
      include: {
        documents: true,
      },
    });

    if (!business) {
      throw new NotFoundException({
        code: ERROR_CODES.BUSINESS.NOT_FOUND,
        message: 'Business profile not found',
      });
    }

    const pendingDocuments = business.documents.filter(
      (d) => d.status === 'UPLOADED' || d.status === 'UNDER_REVIEW',
    ).length;

    return {
      business: {
        id: business.id,
        status: business.status,
        companyName: business.companyName,
        totalCampaigns: business.totalCampaigns,
        totalSpent: business.totalSpent,
      },
      documentsCount: business.documents.length,
      pendingDocuments,
      activeCampaigns: 0, // Sprint 4 placeholder
    };
  }

  /**
   * Get business billing summary (placeholder for Sprint 4/5).
   */
  async getBillingSummary(userId: string) {
    const business = await this.getBusinessByUserId(userId);

    return {
      businessId: business.id,
      totalSpent: business.totalSpent,
      totalCampaigns: business.totalCampaigns,
      currentBalance: 0, // Sprint 5 — Billing module
      lastPaymentDate: null,
    };
  }

  /**
   * Internal: Activate business (VERIFIED → ACTIVE) on first campaign creation.
   * RULE-BIZ-005: Auto-transition Verified → Active on first campaign.
   * Called by Campaign module in Sprint 4.
   */
  async activateBusiness(businessId: string) {
    const business = await this.getBusinessById(businessId);

    if (business.status !== 'VERIFIED') {
      throw new BadRequestException({
        code: ERROR_CODES.BUSINESS.NOT_ELIGIBLE_FOR_CAMPAIGN,
        message: 'Business must be verified to create campaigns',
      });
    }

    this.validateTransition(business.status as BusinessStatus, BusinessStatus.ACTIVE);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.business.update({
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

      return result;
    });

    this.logger.log(`Business activated: ${businessId} (first campaign created)`);
    this.eventEmitter.emit(
      BusinessActivatedEvent.EVENT_NAME,
      new BusinessActivatedEvent(businessId),
    );

    return updated;
  }

  /**
   * Validate state transition against the state machine.
   * Throws BUSINESS_005 if the transition is not valid.
   */
  private validateTransition(from: BusinessStatus, to: BusinessStatus): void {
    const validTargets = VALID_TRANSITIONS[from];

    if (!validTargets || !validTargets.includes(to)) {
      throw new BadRequestException({
        code: ERROR_CODES.BUSINESS.INVALID_STATE_TRANSITION,
        message: `Invalid state transition from ${from} to ${to}`,
      });
    }
  }

  /**
   * Assert business is not blacklisted for write operations.
   * RULE-BIZ-008: Blacklisted cannot perform any write operations.
   */
  private assertNotBlacklisted(status: BusinessStatus): void {
    if (status === BusinessStatus.BLACKLISTED) {
      throw new ForbiddenException({
        code: ERROR_CODES.BUSINESS.BLACKLISTED_WRITE_BLOCKED,
        message: 'Blacklisted businesses cannot perform write operations',
      });
    }
  }

  /**
   * Internal helper: transition business status with history record.
   */
  async transitionStatus(
    businessId: string,
    toStatus: BusinessStatus,
    reason?: string,
    changedBy?: string,
  ) {
    const business = await this.getBusinessById(businessId);
    this.validateTransition(business.status as BusinessStatus, toStatus);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.business.update({
        where: { id: businessId },
        data: { status: toStatus },
      });

      await tx.businessStatusHistory.create({
        data: {
          businessId,
          fromStatus: business.status,
          toStatus,
          reason: reason || null,
          changedBy: changedBy || null,
        },
      });

      return result;
    });

    this.logger.log(`Business ${businessId} transitioned: ${business.status} → ${toStatus}`);
    return updated;
  }
}
