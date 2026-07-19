import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';
import { CampaignController } from './campaign.controller';
import { CampaignPaymentController } from './campaign-payment.controller';
import { CampaignService } from './campaign.service';
import { CampaignPaymentService } from './campaign-payment.service';

/**
 * Campaign module — manages campaign lifecycle, payment verification,
 * state machine transitions, and cost calculations.
 *
 * Sprint 4 (CTX-004)
 */
@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [
    CampaignController,
    CampaignPaymentController,
  ],
  providers: [
    CampaignService,
    CampaignPaymentService,
  ],
  exports: [CampaignService],
})
export class CampaignModule {}
