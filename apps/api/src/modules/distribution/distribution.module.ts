import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DistributionCenterController } from './distribution-center.controller';
import { PrintPartnerController } from './print-partner.controller';
import { DistributionCenterService } from './distribution-center.service';
import { PrintPartnerService } from './print-partner.service';

/**
 * Distribution module — manages distribution centers and print partners.
 *
 * Sprint 10 (CTX-017)
 */
@Module({
  imports: [PrismaModule],
  controllers: [DistributionCenterController, PrintPartnerController],
  providers: [DistributionCenterService, PrintPartnerService],
  exports: [DistributionCenterService, PrintPartnerService],
})
export class DistributionModule {}
