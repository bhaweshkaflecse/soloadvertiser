import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChannelDto, ChannelQueryDto } from './dto';
import { ERROR_CODES } from '@soloadvertiser/contracts';
import { VALID_CMM_TRANSITIONS } from './interfaces/marketplace.interface';
import { ChannelActivatedEvent } from './events/channel-activated.event';

/**
 * Channel service — manages advertising channel lifecycle and CMM transitions.
 * Sprint 10 (CTX-015)
 */
@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new advertising channel.
   */
  async createChannel(dto: CreateChannelDto) {
    const channel = await this.prisma.advertisingChannel.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description || null,
        superCategory: dto.superCategory,
        subCategory: dto.subCategory,
        partnerCategory: dto.partnerCategory || null,
        iconUrl: dto.iconUrl || null,
        estimatedReach: dto.estimatedReach || null,
        sortOrder: dto.sortOrder || 0,
        configuration: dto.configuration || {},
      },
    });

    this.logger.log(`Channel created: ${channel.code} (${channel.id})`);
    return channel;
  }

  /**
   * Get a single channel by ID.
   */
  async getChannelById(id: string) {
    const channel = await this.prisma.advertisingChannel.findUnique({
      where: { id },
      include: {
        launchThreshold: true,
        launchProgress: true,
      },
    });

    if (!channel) {
      throw new NotFoundException({
        code: ERROR_CODES.MARKETPLACE.CHANNEL_NOT_FOUND,
        message: 'Advertising channel not found',
      });
    }

    return channel;
  }

  /**
   * List channels with filtering and pagination.
   */
  async listChannels(query: ChannelQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const skip = (page - 1) * pageSize;

    const where: any = {
      isRetired: false,
    };

    if (query.superCategory) {
      where.superCategory = query.superCategory;
    }

    if (query.subCategory) {
      where.subCategory = query.subCategory;
    }

    if (query.maturityStage) {
      where.maturityStage = query.maturityStage;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [channels, total] = await Promise.all([
      this.prisma.advertisingChannel.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          launchProgress: true,
        },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.advertisingChannel.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: channels,
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
   * Update channel details.
   */
  async updateChannel(id: string, data: Partial<CreateChannelDto>) {
    await this.getChannelById(id);

    const updated = await this.prisma.advertisingChannel.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.iconUrl !== undefined && { iconUrl: data.iconUrl }),
        ...(data.estimatedReach !== undefined && { estimatedReach: data.estimatedReach }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.configuration && { configuration: data.configuration }),
        ...(data.partnerCategory !== undefined && { partnerCategory: data.partnerCategory }),
      },
    });

    this.logger.log(`Channel updated: ${updated.code}`);
    return updated;
  }

  /**
   * Activate a channel — transitions to CMM_005_LIVE.
   * Requires operational readiness checks.
   */
  async activateChannel(id: string, adminUserId: string) {
    const channel = await this.getChannelById(id);

    // Must be in PILOT_PROGRAM to activate
    if (channel.maturityStage !== 'CMM_004_PILOT_PROGRAM') {
      throw new BadRequestException({
        code: ERROR_CODES.MARKETPLACE.CHANNEL_NOT_ACTIVATABLE,
        message: `Channel must be in PILOT_PROGRAM to activate. Current: ${channel.maturityStage}`,
      });
    }

    const updated = await this.prisma.advertisingChannel.update({
      where: { id },
      data: {
        maturityStage: 'CMM_005_LIVE',
        activatedAt: new Date(),
      },
    });

    this.logger.log(`Channel activated: ${channel.code} by ${adminUserId}`);
    this.eventEmitter.emit(
      ChannelActivatedEvent.EVENT_NAME,
      new ChannelActivatedEvent(id, channel.code, adminUserId),
    );

    return updated;
  }

  /**
   * Pause a channel — sets isPaused flag.
   */
  async pauseChannel(id: string) {
    const channel = await this.getChannelById(id);

    const updated = await this.prisma.advertisingChannel.update({
      where: { id },
      data: { isPaused: true },
    });

    this.logger.log(`Channel paused: ${channel.code}`);
    return updated;
  }

  /**
   * Retire a channel — cannot retire active (Live+) channels without pausing first.
   */
  async retireChannel(id: string) {
    const channel = await this.getChannelById(id);

    const liveStages = [
      'CMM_005_LIVE',
      'CMM_006_SCALING',
      'CMM_007_NATIONAL',
      'CMM_008_INTERNATIONAL',
    ];

    if (liveStages.includes(channel.maturityStage) && !channel.isPaused) {
      throw new BadRequestException({
        code: ERROR_CODES.MARKETPLACE.CANNOT_RETIRE_ACTIVE,
        message: 'Cannot retire an active channel. Pause it first.',
      });
    }

    const updated = await this.prisma.advertisingChannel.update({
      where: { id },
      data: { isRetired: true },
    });

    this.logger.log(`Channel retired: ${channel.code}`);
    return updated;
  }

  /**
   * Transition channel maturity stage (forward only).
   */
  async transitionStage(id: string, targetStage: string) {
    const channel = await this.getChannelById(id);

    const validTargets = VALID_CMM_TRANSITIONS[channel.maturityStage];
    if (!validTargets || !validTargets.includes(targetStage)) {
      throw new BadRequestException({
        code: ERROR_CODES.MARKETPLACE.INVALID_CMM_TRANSITION,
        message: `Invalid CMM transition from ${channel.maturityStage} to ${targetStage}`,
      });
    }

    const updated = await this.prisma.advertisingChannel.update({
      where: { id },
      data: { maturityStage: targetStage as any },
    });

    this.logger.log(`Channel ${channel.code} transitioned: ${channel.maturityStage} → ${targetStage}`);
    return updated;
  }
}
