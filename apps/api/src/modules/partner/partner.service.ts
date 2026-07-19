import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitEnrollmentDto, EnrollmentQueryDto } from './dto';
import { ERROR_CODES } from '@soloadvertiser/contracts';
import { PartnerEnrolledEvent } from './events/partner-enrolled.event';
import { PartnerVerifiedEvent } from './events/partner-verified.event';

/**
 * Partner enrollment service — manages partner enrollment lifecycle.
 * Sprint 10 (CTX-016)
 */
@Injectable()
export class PartnerService {
  private readonly logger = new Logger(PartnerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}


  /**
   * Submit a partner enrollment.
   */
  async submitEnrollment(userId: string, dto: SubmitEnrollmentDto) {
    // Verify channel exists and is enrollable
    const channel = await this.prisma.advertisingChannel.findUnique({
      where: { id: dto.channelId },
    });

    if (!channel) {
      throw new NotFoundException({
        code: ERROR_CODES.MARKETPLACE.CHANNEL_NOT_FOUND,
        message: 'Channel not found',
      });
    }

    const enrollableStages = [
      'CMM_003_PRE_ENROLLMENT_OPEN',
      'CMM_004_PILOT_PROGRAM',
      'CMM_005_LIVE',
      'CMM_006_SCALING',
      'CMM_007_NATIONAL',
      'CMM_008_INTERNATIONAL',
    ];

    if (!enrollableStages.includes(channel.maturityStage)) {
      throw new BadRequestException({
        code: ERROR_CODES.MARKETPLACE.ENROLLMENT_NOT_ENROLLABLE,
        message: 'This channel is not open for enrollment yet.',
      });
    }

    // Verify partner category exists
    const category = await this.prisma.partnerCategory.findUnique({
      where: { code: dto.partnerCategoryCode },
    });

    if (!category) {
      throw new NotFoundException({
        code: ERROR_CODES.MARKETPLACE.PARTNER_CATEGORY_NOT_FOUND,
        message: 'Partner category not found',
      });
    }

    const enrollment = await this.prisma.partnerEnrollment.create({
      data: {
        userId,
        partnerCategoryCode: dto.partnerCategoryCode,
        channelId: dto.channelId,
        platform: dto.platform || null,
        platformUrl: dto.platformUrl || null,
        followersCount: dto.followersCount || null,
        monthlyReach: dto.monthlyReach || null,
        engagementRate: dto.engagementRate || null,
        contentNiche: dto.contentNiche || null,
        assetPhotos: dto.assetPhotos || [],
        locationCity: dto.locationCity || null,
        locationZone: dto.locationZone || null,
        availability: dto.availability || null,
        expectedRate: dto.expectedRate || null,
        additionalData: dto.additionalData || {},
        status: 'submitted',
      },
      include: { channel: true, category: true },
    });

    this.logger.log(`Partner enrollment submitted: ${enrollment.id}`);
    this.eventEmitter.emit(
      PartnerEnrolledEvent.EVENT_NAME,
      new PartnerEnrolledEvent(enrollment.id, userId, dto.channelId, dto.partnerCategoryCode),
    );

    return enrollment;
  }


  /**
   * List enrollments with filtering and pagination.
   */
  async listEnrollments(query: EnrollmentQueryDto & { userId?: string }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.partnerCategoryCode) {
      where.partnerCategoryCode = query.partnerCategoryCode;
    }
    if (query.channelId) {
      where.channelId = query.channelId;
    }
    if (query.status) {
      where.status = query.status;
    }

    const [enrollments, total] = await Promise.all([
      this.prisma.partnerEnrollment.findMany({
        where,
        skip,
        take: pageSize,
        include: { channel: true, category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.partnerEnrollment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: enrollments,
      meta: { total, page, pageSize, totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get enrollment by ID.
   */
  async getEnrollmentById(id: string) {
    const enrollment = await this.prisma.partnerEnrollment.findUnique({
      where: { id },
      include: { channel: true, category: true },
    });

    if (!enrollment) {
      throw new NotFoundException({
        code: ERROR_CODES.MARKETPLACE.ENROLLMENT_NOT_FOUND,
        message: 'Enrollment not found',
      });
    }

    return enrollment;
  }

  /**
   * Verify (approve) a partner enrollment.
   */
  async verifyEnrollment(id: string, adminUserId: string) {
    const enrollment = await this.getEnrollmentById(id);

    if (enrollment.status !== 'submitted' && enrollment.status !== 'under_review') {
      throw new BadRequestException({
        code: ERROR_CODES.MARKETPLACE.ENROLLMENT_NOT_FOUND,
        message: 'Enrollment is not in a verifiable state',
      });
    }

    const updated = await this.prisma.partnerEnrollment.update({
      where: { id },
      data: {
        status: 'approved',
        verifiedAt: new Date(),
        verifiedBy: adminUserId,
      },
      include: { channel: true, category: true },
    });

    this.logger.log(`Enrollment verified: ${id} by ${adminUserId}`);
    this.eventEmitter.emit(
      PartnerVerifiedEvent.EVENT_NAME,
      new PartnerVerifiedEvent(id, enrollment.userId, enrollment.channelId, adminUserId),
    );

    return updated;
  }

  /**
   * Reject a partner enrollment.
   */
  async rejectEnrollment(id: string, adminUserId: string, reason?: string) {
    const enrollment = await this.getEnrollmentById(id);

    if (enrollment.status !== 'submitted' && enrollment.status !== 'under_review') {
      throw new BadRequestException({
        code: ERROR_CODES.MARKETPLACE.ENROLLMENT_NOT_FOUND,
        message: 'Enrollment is not in a rejectable state',
      });
    }

    const updated = await this.prisma.partnerEnrollment.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason || null,
        verifiedBy: adminUserId,
      },
      include: { channel: true, category: true },
    });

    this.logger.log(`Enrollment rejected: ${id} by ${adminUserId}`);
    return updated;
  }

  /**
   * Withdraw enrollment (by partner).
   */
  async withdrawEnrollment(id: string, userId: string) {
    const enrollment = await this.getEnrollmentById(id);

    if (enrollment.userId !== userId) {
      throw new BadRequestException({
        code: ERROR_CODES.MARKETPLACE.ENROLLMENT_NOT_FOUND,
        message: 'Enrollment not found or not owned by this user',
      });
    }

    if (enrollment.status === 'approved' || enrollment.status === 'rejected') {
      throw new BadRequestException({
        code: ERROR_CODES.MARKETPLACE.ENROLLMENT_NOT_FOUND,
        message: 'Cannot withdraw an already processed enrollment',
      });
    }

    const updated = await this.prisma.partnerEnrollment.update({
      where: { id },
      data: { status: 'withdrawn' },
      include: { channel: true, category: true },
    });

    this.logger.log(`Enrollment withdrawn: ${id} by user ${userId}`);
    return updated;
  }
}
