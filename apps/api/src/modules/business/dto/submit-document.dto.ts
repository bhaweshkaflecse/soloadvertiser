import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/**
 * DTO for submitting a business document (PAN/VAT, registration cert, representative ID).
 */
export class SubmitBusinessDocumentDto {
  @IsNotEmpty()
  @IsString()
  documentType!: string;

  @IsNotEmpty()
  @IsUUID()
  mediaId!: string;
}
