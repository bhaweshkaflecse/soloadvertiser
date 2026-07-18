import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Support module (CTX-013) — customer support ticket system.
 * Provides ticket creation, messaging, assignment, and lifecycle management.
 * Ticket states: OPEN → IN_PROGRESS → AWAITING_RESPONSE → RESOLVED → CLOSED
 */
@Module({
  imports: [PrismaModule],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
