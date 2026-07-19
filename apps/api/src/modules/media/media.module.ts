import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { StorageService } from './storage.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Media module — handles file uploads, storage, and retrieval.
 * Uses Cloudflare R2 for production; local file storage for development.
 */
@Module({
  imports: [PrismaModule],
  controllers: [MediaController],
  providers: [MediaService, StorageService],
  exports: [MediaService, StorageService],
})
export class MediaModule {}
