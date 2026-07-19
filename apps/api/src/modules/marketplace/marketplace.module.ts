import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';
import { ChannelController } from './channel.controller';
import { PreOrderController } from './pre-order.controller';
import { ChannelService } from './channel.service';
import { PreOrderService } from './pre-order.service';
import { ReadinessService } from './readiness.service';

/**
 * Marketplace module — manages advertising channels, pre-orders,
 * and readiness scoring for channel launch decisions.
 *
 * Sprint 10 (CTX-015)
 */
@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [ChannelController, PreOrderController],
  providers: [ChannelService, PreOrderService, ReadinessService],
  exports: [ChannelService, PreOrderService, ReadinessService],
})
export class MarketplaceModule {}
