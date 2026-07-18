import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Audit controller — read-only access to the immutable audit log.
 * Only accessible by SUPER_ADMIN, ADMIN, and OPERATIONS_STAFF.
 */
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /api/v1/audit
   * Query audit entries with optional filters.
   */
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_STAFF')
  async queryAuditEntries(@Query() query: AuditQueryDto) {
    const result = await this.auditService.queryEntries({
      actorId: query.actorId,
      action: query.action,
      entityType: query.entityType,
      entityId: query.entityId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      page: query.page,
      limit: query.limit,
    });

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }
}
