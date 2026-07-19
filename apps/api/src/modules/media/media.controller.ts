import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@soloadvertiser/types';

/**
 * Media controller — file upload and retrieval endpoints.
 * Base path: /api/v1/media
 */
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * POST /api/v1/media/upload
   * Upload a file (multipart/form-data).
   * Accepts optional entityType and entityId to associate the media with a domain entity.
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const asset = await this.mediaService.upload(file, dto, user.sub);
    return { success: true, data: asset, timestamp: new Date().toISOString() };
  }

  /**
   * GET /api/v1/media/:id
   * Get media asset details including a signed URL for download.
   */
  @Get(':id')
  async getAsset(@Param('id') id: string) {
    const asset = await this.mediaService.getById(id);
    return { success: true, data: asset, timestamp: new Date().toISOString() };
  }

  /**
   * DELETE /api/v1/media/:id
   * Soft-delete a media asset.
   */
  @Delete(':id')
  async deleteAsset(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.mediaService.softDelete(id, user.sub);
    return { success: true, data: { message: 'Media asset deleted' }, timestamp: new Date().toISOString() };
  }
}
