import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for approving a payout batch.
 * RULE-PAY-004: Finance Staff manually approves batches.
 */
export class ApprovePayoutDto {
  /**
   * Optional notes for the approval.
   */
  @IsOptional()
  @IsString()
  notes?: string;
}
