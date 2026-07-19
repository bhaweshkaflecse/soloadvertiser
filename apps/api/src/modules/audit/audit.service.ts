import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditEntryInput, AuditQueryFilters } from './interfaces/audit.interface';

/**
 * Audit service — creates and queries immutable audit log entries.
 * All entries are write-once; no update or delete operations exist.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an immutable audit entry.
   *
   * @param input - Audit entry data (who, what, before, after, reason, ip, device, time)
   * @returns The created audit entry
   */
  async createEntry(input: CreateAuditEntryInput) {
    const entry = await this.prisma.auditEntry.create({
      data: {
        actorId: input.actorId || null,
        actorRole: input.actorRole || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        beforeState: input.beforeState || undefined,
        afterState: input.afterState || undefined,
        reason: input.reason || null,
        ipAddress: input.ipAddress || null,
        deviceInfo: input.deviceInfo || null,
        metadata: input.metadata || undefined,
      },
    });

    this.logger.debug(
      `Audit: ${input.action} on ${input.entityType}${input.entityId ? ':' + input.entityId : ''} by ${input.actorId || 'system'}`,
    );

    return entry;
  }

  /**
   * Query audit entries with filters and pagination.
   * Results are always ordered by createdAt descending (newest first).
   *
   * @param filters - Query filters (actor, action, entity, date range, pagination)
   * @returns Paginated list of audit entries with total count
   */
  async queryEntries(filters: AuditQueryFilters) {
    const where: any = {};

    if (filters.actorId) {
      where.actorId = filters.actorId;
    }

    if (filters.action) {
      where.action = { contains: filters.action, mode: 'insensitive' };
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.prisma.auditEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditEntry.count({ where }),
    ]);

    return {
      data: entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
