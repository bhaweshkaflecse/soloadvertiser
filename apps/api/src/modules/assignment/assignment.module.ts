import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';
import { CampaignModule } from '../campaign/campaign.module';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { MatchingService } from './matching.service';

/**
 * Assignment module — manages rider-campaign assignments, eligibility matching,
 * and assignment lifecycle.
 *
 * Sprint 4 (CTX-005)
 */
@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot(), CampaignModule],
  controllers: [AssignmentController],
  providers: [
    AssignmentService,
    MatchingService,
  ],
  exports: [AssignmentService, MatchingService],
})
export class AssignmentModule {}
