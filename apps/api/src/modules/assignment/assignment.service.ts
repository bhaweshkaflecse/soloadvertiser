import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssignmentDto, AssignmentQueryDto } from './dto';
import { BulkCreateAssignmentDto } from './dto/create-assignment.dto';
import { ERROR_CODES } from '@soloadvertiser/contracts';
import { CampaignService } from '../campaign/campaign.service';
import { MatchingService } from './matching.service';
import { AssignmentCreatedEvent } from './events/assignment-created.event';
import { AssignmentRemovedEvent } from './events/assignment-removed.event';

/**
 * Core assignment service — manages rider-campaign assignments, matching,
 * and lifecycle transitions.
 *
 * RULE-ASN-003: Only Ops Staff+ can create assignments.
 * RULE-ASN-004: Campaign must be in RECRUITING_RIDERS.
 * RULE-ASN-005: Removal requires documented reason.
 */
@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly campaignService: CampaignService,
    private readonly matchingService: MatchingService,
  ) {}

  /**
   * Create a single assignment (assign rider to campaign).
   * RULE-ASN-003: Only Ops Staff+ can create.
   * RULE-ASN-004: Campaign must be in RECRUITING_RIDERS.
   */
  async createAssignment(dto: CreateAssignmentDto, assignedBy: string) {
    // Validate campaign is recruiting
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: dto.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException({
        code: ERROR_CODES.CAMPAIGN.NOT_FOUND,
        message: 'Campaign not found',
      });
    }

    // RULE-ASN-004: Campaign must be in RECRUITING_RIDERS
    if (campaign.status !== 'RECRUITING_RIDERS') {
      throw new BadRequestException({
        code: ERROR_CODES.ASSIGNMENT.CAMPAIGN_NOT_RECRUITING,
        message: 'Campaign must be in RECRUITING_RIDERS status to assign riders',
      });
    }

    // Check if campaign is already full
    if (campaign.currentAssigned >= campaign.requiredRiders) {
      throw new BadRequestException({
        code: ERROR_CODES.ASSIGNMENT.CAMPAIGN_FULL,
        message: 'Campaign has reached 100% fulfillment — no more riders needed',
      });
    }

    // RULE-ASN-007: Check if rider is already assigned to this campaign
    const existingAssignment = await this.prisma.assignment.findUnique({
      where: {
        campaignId_riderId: {
          campaignId: dto.campaignId,
          riderId: dto.riderId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException({
        code: ERROR_CODES.ASSIGNMENT.ALREADY_ASSIGNED,
        message: 'Rider is already assigned to this campaign',
      });
    }

    // Validate rider eligibility
    const eligibility = await this.matchingService.validateRiderEligibility(
      dto.riderId,
      dto.campaignId,
    );

    if (!eligibility.eligible) {
      // Determine specific error code
      if (!eligibility.criteria.isAvailable) {
        throw new BadRequestException({
          code: ERROR_CODES.ASSIGNMENT.RIDER_INELIGIBLE,
          message: eligibility.reason || 'Rider is not available',
        });
      }
      if (!eligibility.criteria.zoneOverlap) {
        throw new BadRequestException({
          code: ERROR_CODES.ASSIGNMENT.ZONE_MISMATCH,
          message: eligibility.reason || 'Rider zone does not match campaign zones',
        });
      }
      if (!eligibility.criteria.noConflict) {
        throw new BadRequestException({
          code: ERROR_CODES.ASSIGNMENT.CONFLICTING_ASSIGNMENT,
          message: eligibility.reason || 'Rider has conflicting assignment',
        });
      }
      throw new BadRequestException({
        code: ERROR_CODES.ASSIGNMENT.RIDER_INELIGIBLE,
        message: eligibility.reason || 'Rider is not eligible for this campaign',
      });
    }

    // Create assignment
    const assignment = await this.prisma.assignment.create({
      data: {
        campaignId: dto.campaignId,
        riderId: dto.riderId,
        status: 'ASSIGNED',
        zoneId: dto.zoneId || null,
        assignedBy,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
      },
    });

    // Increment campaign assignment count
    await this.campaignService.incrementAssignment(dto.campaignId);

    this.logger.log(
      `Assignment created: ${assignment.id} (rider: ${dto.riderId} → campaign: ${dto.campaignId})`,
    );
    this.eventEmitter.emit(
      AssignmentCreatedEvent.EVENT_NAME,
      new AssignmentCreatedEvent(assignment.id, dto.campaignId, dto.riderId, assignedBy),
    );

    return assignment;
  }

  /**
   * Bulk assign riders to a campaign.
   * Validates each rider individually and returns results.
   */
  async bulkCreateAssignments(dto: BulkCreateAssignmentDto, assignedBy: string) {
    const results: { riderId: string; success: boolean; assignmentId?: string; error?: string }[] = [];

    for (const riderId of dto.riderIds) {
      try {
        const assignment = await this.createAssignment(
          { campaignId: dto.campaignId, riderId, zoneId: dto.zoneId },
          assignedBy,
        );
        results.push({ riderId, success: true, assignmentId: assignment.id });
      } catch (error: any) {
        results.push({
          riderId,
          success: false,
          error: error.response?.message || error.message || 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    this.logger.log(
      `Bulk assignment: ${successCount}/${dto.riderIds.length} successful for campaign: ${dto.campaignId}`,
    );

    return {
      campaignId: dto.campaignId,
      totalRequested: dto.riderIds.length,
      successCount,
      failedCount: dto.riderIds.length - successCount,
      results,
    };
  }

  /**
   * Get assignment by ID.
   */
  async getAssignmentById(assignmentId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
            businessId: true,
            assetType: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException({
        code: ERROR_CODES.ASSIGNMENT.NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    return assignment;
  }

  /**
   * List assignments with filters.
   */
  async listAssignments(query: AssignmentQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (query.campaignId) {
      where.campaignId = query.campaignId;
    }

    if (query.riderId) {
      where.riderId = query.riderId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [assignments, total] = await Promise.all([
      this.prisma.assignment.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              status: true,
              businessId: true,
              assetType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.assignment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: assignments,
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
   * Remove an assignment (with documented reason).
   * RULE-ASN-005: Removal requires documented reason.
   * RULE-ASN-006: Removal triggers replacement notification.
   */
  async removeAssignment(assignmentId: string, reason: string, removedBy: string) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException({
        code: ERROR_CODES.ASSIGNMENT.REASON_REQUIRED_FOR_REMOVAL,
        message: 'A documented reason is required for removing an assignment',
      });
    }

    const assignment = await this.getAssignmentById(assignmentId);

    // Cannot remove already completed or removed assignments
    if (assignment.status === 'COMPLETED' || assignment.status === 'REMOVED') {
      throw new BadRequestException({
        code: ERROR_CODES.ASSIGNMENT.NOT_FOUND,
        message: 'Assignment is already completed or removed',
      });
    }

    const updated = await this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: 'REMOVED',
        removalReason: reason,
        removedBy,
        removedAt: new Date(),
      },
    });

    // Decrement campaign assignment count
    await this.campaignService.decrementAssignment(assignment.campaignId);

    this.logger.log(
      `Assignment removed: ${assignmentId} (rider: ${assignment.riderId}), reason: ${reason}`,
    );
    this.eventEmitter.emit(
      AssignmentRemovedEvent.EVENT_NAME,
      new AssignmentRemovedEvent(
        assignmentId,
        assignment.campaignId,
        assignment.riderId,
        reason,
        removedBy,
      ),
    );

    return updated;
  }

  /**
   * Get eligible riders for a campaign (delegates to MatchingService).
   */
  async getEligibleRiders(campaignId: string) {
    return this.matchingService.getEligibleRiders(campaignId);
  }
}
