import { IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * DTO for completing an individual payout item.
 * RULE-PAY-005: Payout completion requires proof upload.
 */
export class CompletePayoutItemDto {
  /**
   * Media asset ID of the payment proof screenshot/document.
   */
  @IsUUID()
  proofMediaId: string;

  /**
   * External transaction reference from the payment provider.
   */
  @IsOptional()
  @IsString()
  referenceId?: string;
}
