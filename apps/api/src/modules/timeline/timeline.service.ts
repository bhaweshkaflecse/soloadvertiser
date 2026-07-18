import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineEntryInput } from './interfaces/timeline.interface';

@Injectable()
export class TimelineService {
  private readonly logger = new Logger(TimelineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a timeline entry.
   */
  async createEntry(input: TimelineEntryInput) {
    return this.prisma.timelineEntry.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        eventType: input.eventType,
        title: input.title,
        description: input.description,
        actorId: input.actorId,
        actorRole: input.actorRole,
        metadata: input.metadata as any,
      },
    });
  }

  /**
   * Create multiple timeline entries (for events that affect multiple entities).
   */
  async createEntries(inputs: TimelineEntryInput[]) {
    return Promise.all(inputs.map((input) => this.createEntry(input)));
  }

  /**
   * Query timeline entries for an entity.
   */
  async getTimeline(
    entityType: string,
    entityId: string,
    limit: number = 50,
    cursor?: string,
  ) {
    const where: any = { entityType, entityId };

    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const entries = await this.prisma.timelineEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Fetch one extra to determine hasMore
    });

    const hasMore = entries.length > limit;
    const data = hasMore ? entries.slice(0, limit) : entries;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;

    return {
      data,
      meta: {
        hasMore,
        nextCursor,
        count: data.length,
      },
    };
  }
}
