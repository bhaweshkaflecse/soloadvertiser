import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';
import { RiderController } from './rider.controller';
import { RiderDocumentController } from './rider-document.controller';
import { RiderVehicleController } from './rider-vehicle.controller';
import { RiderService } from './rider.service';
import { RiderDocumentService } from './rider-document.service';
import { RiderVehicleService } from './rider-vehicle.service';
import { RiderAvailabilityService } from './rider-availability.service';
import { RiderScoreService } from './rider-score.service';

/**
 * Rider module — manages rider lifecycle, documents, vehicle,
 * availability, and reliability scoring.
 *
 * Sprint 2 (CTX-002)
 */
@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [
    RiderController,
    RiderDocumentController,
    RiderVehicleController,
  ],
  providers: [
    RiderService,
    RiderDocumentService,
    RiderVehicleService,
    RiderAvailabilityService,
    RiderScoreService,
  ],
  exports: [RiderService, RiderAvailabilityService, RiderScoreService],
})
export class RiderModule {}
