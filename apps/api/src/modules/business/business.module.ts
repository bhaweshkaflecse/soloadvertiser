import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';
import { BusinessController } from './business.controller';
import { BusinessDocumentController } from './business-document.controller';
import { BusinessService } from './business.service';
import { BusinessDocumentService } from './business-document.service';

/**
 * Business module — manages business lifecycle, documents, verification,
 * and admin operations.
 *
 * Sprint 3 (CTX-003)
 */
@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [
    BusinessController,
    BusinessDocumentController,
  ],
  providers: [
    BusinessService,
    BusinessDocumentService,
  ],
  exports: [BusinessService],
})
export class BusinessModule {}
