import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReviewAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

/**
 * DTO for admin reviewing (approving/rejecting) a rider document.
 */
export class ReviewDocumentDto {
  @IsEnum(ReviewAction)
  action!: ReviewAction;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
