import { IsNotEmpty, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

/**
 * DTO for submitting a rider document (citizenship, license, registration, photo, helmet).
 */
export class SubmitDocumentDto {
  @IsNotEmpty()
  @IsString()
  documentType!: string;

  @IsNotEmpty()
  @IsUUID()
  mediaId!: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
