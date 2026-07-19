import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from './storage.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { ERROR_CODES } from '@soloadvertiser/contracts';

/**
 * Media service — orchestrates file uploads, metadata storage, and signed URL generation.
 * Business rules:
 * - Maximum file size: 10MB (configurable)
 * - Allowed MIME types: images, PDFs, documents
 * - Files are soft-deleted (retained for audit trail)
 */
@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Upload a file to storage and save metadata.
   */
  async upload(
    file: Express.Multer.File,
    dto: UploadMediaDto,
    uploadedBy: string,
  ) {
    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException({
        code: ERROR_CODES.MEDIA.FILE_TOO_LARGE,
        message: `File size exceeds maximum of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }

    // Validate MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException({
        code: ERROR_CODES.MEDIA.UNSUPPORTED_TYPE,
        message: `File type "${file.mimetype}" is not supported`,
        details: { allowedTypes: this.ALLOWED_MIME_TYPES },
      });
    }

    // Upload to storage (R2 in production, local in dev)
    const { bucket, key, url } = await this.storageService.upload(file);

    // Save metadata to database
    const asset = await this.prisma.mediaAsset.create({
      data: {
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        bucket,
        key,
        url,
        entityType: dto.entityType || null,
        entityId: dto.entityId || null,
        uploadedBy,
      },
    });

    this.logger.log(`Media uploaded: ${asset.id} (${file.originalname})`);
    return asset;
  }

  /**
   * Get media asset by ID with a signed URL for access.
   */
  async getById(id: string) {
    const asset = await this.prisma.mediaAsset.findFirst({
      where: { id, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException({
        code: ERROR_CODES.MEDIA.ASSET_NOT_FOUND,
        message: 'Media asset not found',
      });
    }

    // Generate a signed URL for temporary access
    const signedUrl = await this.storageService.getSignedUrl(asset.bucket, asset.key);

    return {
      ...asset,
      signedUrl,
    };
  }

  /**
   * Soft-delete a media asset.
   * The file remains in storage for audit purposes.
   */
  async softDelete(id: string, deletedBy: string): Promise<void> {
    const asset = await this.prisma.mediaAsset.findFirst({
      where: { id, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException({
        code: ERROR_CODES.MEDIA.ASSET_NOT_FOUND,
        message: 'Media asset not found',
      });
    }

    await this.prisma.mediaAsset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Media soft-deleted: ${id} by user ${deletedBy}`);
  }
}
