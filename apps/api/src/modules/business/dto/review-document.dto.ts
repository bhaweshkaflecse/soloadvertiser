import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * Review actions for business documents.
 */
export enum ReviewAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

/**
 * DTO for reviewing (approving/rejecting) a business document.
 */
export class ReviewBusinessDocumentDto {
  @IsEnum(ReviewAction)
  action!: ReviewAction;

  @IsOptional()
  @IsString()
  reason?: string;
}
