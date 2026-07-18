import { IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * DTO for file upload metadata.
 * The actual file is handled by Multer via @UploadedFile().
 */
export class UploadMediaDto {
  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;
}
