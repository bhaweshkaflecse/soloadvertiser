import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditListenerService } from './audit-listener.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Audit module (CTX-010) — immutable audit trail for all system actions.
 * Provides:
 * - Wildcard event listener that captures all domain events
 * - Query API for browsing audit logs (admin only)
 * - Service for programmatic audit entry creation
 */
@Module({
  imports: [PrismaModule],
  controllers: [AuditController],
  providers: [AuditService, AuditListenerService],
  exports: [AuditService],
})
export class AuditModule {}
