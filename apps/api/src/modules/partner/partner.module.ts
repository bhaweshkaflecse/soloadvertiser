import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';
import { PartnerController } from './partner.controller';
import { PartnerCategoryController } from './partner-category.controller';
import { PartnerService } from './partner.service';
import { PartnerCategoryService } from './partner-category.service';

/**
 * Partner module — manages partner enrollment and category operations.
 *
 * Sprint 10 (CTX-016)
 */
@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [PartnerController, PartnerCategoryController],
  providers: [PartnerService, PartnerCategoryService],
  exports: [PartnerService, PartnerCategoryService],
})
export class PartnerModule {}
