import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitPreOrderDto } from './dto';
import { ERROR_CODES } from '@soloadvertiser/contracts';
import { PreOrderSubmittedEvent } from './events/pre-order-submitted.event';

/**
 * Pre-order service — manages business pre-orders for channels.
 * Sprint 10 (CTX-015)
 */
@Injectable()
export class PreOrderService {
  private readonly logger = new Logger(PreOrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Submit a pre-order for a channel.
   * Only allowed for non-Live channels (Live channels should create campaigns directly).
   */
  async submitPreOrder(businessId: string, dto: SubmitPreOrderDto) {
    // Verify channel exists
    const channel = await this.prisma.advertisingChannel.findUnique({
      where: { id: dto.channelId },
    });

    if (!channel) {
      throw new NotFoundException({
        code: ERROR_CODES.MARKETPLACE.CHANNEL_NOT_FOUND,
        message: 'Channel not found',
      });
    }

    // Cannot pre-order for Live channels — those should create campaigns
    if (channel.maturityStage === 'CMM_005_LIVE' ||
        channel.maturityStage === 'CMM_006_SCALING' ||
        channel.maturityStage === 'CMM_007_NATIONAL' ||
        channel.maturityStage === 'CMM_008_INTERNATIONAL') {
      throw new BadRequestException({
        code: ERROR_CODES.MARKETPLACE.PRE_ORDER_FOR_LIVE_CHANNEL,
        message: 'This channel is live. Please create a campaign instead of pre-ordering.',
      });
    }

    const preOrder = await this.prisma.businessPreOrder.create({
      data: {
        businessId,
        channelId: dto.channelId,
        estimatedBudget: dto.estimatedBudget,
        preferredCity: dto.preferredCity,
        campaignDuration: dto.campaignDuration,
        expectedLaunch: dto.expectedLaunch,
        campaignObjectives: dto.campaignObjectives,
        preferredStartDate: dto.preferredStartDate ? new Date(dto.preferredStartDate) : null,
        additionalNotes: dto.additionalNotes || null,
        status: 'submitted',
      },
      include: { channel: true },
    });

    this.logger.log(`Pre-order submitted: ${preOrder.id} for channel ${channel.code}`);
    this.eventEmitter.emit(
      PreOrderSubmittedEvent.EVENT_NAME,
      new PreOrderSubmittedEvent(preOrder.id, channel.id, businessId, dto.estimatedBudget),
    );

    return preOrder;
  }

  /**
   * List pre-orders for a specific business or all (admin).
   */
  async listPreOrders(options: {
    businessId?: string;
    channelId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (options.businessId) {
      where.businessId = options.businessId;
    }

    if (options.channelId) {
      where.channelId = options.channelId;
    }

    if (options.status) {
      where.status = options.status;
    }

    const [preOrders, total] = await Promise.all([
      this.prisma.businessPreOrder.findMany({
        where,
        skip,
        take: pageSize,
        include: { channel: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.businessPreOrder.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: preOrders,
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
   * Get a single pre-order by ID.
   */
  async getPreOrderById(id: string) {
    const preOrder = await this.prisma.businessPreOrder.findUnique({
      where: { id },
      include: { channel: true },
    });

    if (!preOrder) {
      throw new NotFoundException({
        code: ERROR_CODES.MARKETPLACE.PRE_ORDER_NOT_FOUND,
        message: 'Pre-order not found',
      });
    }

    return preOrder;
  }

  /**
   * Cancel a pre-order (only by the owning business).
   */
  async cancelPreOrder(id: string, businessId: string) {
    const preOrder = await this.getPreOrderById(id);

    if (preOrder.businessId !== businessId) {
      throw new BadRequestException({
        code: ERROR_CODES.MARKETPLACE.PRE_ORDER_NOT_FOUND,
        message: 'Pre-order not found or not owned by this business',
      });
    }

    if (preOrder.status === 'cancelled') {
      return preOrder;
    }

    const updated = await this.prisma.businessPreOrder.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
      include: { channel: true },
    });

    this.logger.log(`Pre-order cancelled: ${id}`);
    return updated;
  }

  /**
   * Get analytics: pre-order counts and budget by channel.
   */
  async getPreOrderAnalytics() {
    const analytics = await this.prisma.businessPreOrder.groupBy({
      by: ['channelId', 'status'],
      _count: { id: true },
      _sum: { estimatedBudget: true },
    });

    return analytics;
  }
}
