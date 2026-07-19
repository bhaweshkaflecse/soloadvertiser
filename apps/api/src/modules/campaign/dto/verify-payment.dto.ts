import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for admin verification of campaign payment.
 * Finance Staff+ verifies or rejects the payment proof.
 */
export class VerifyPaymentDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for admin rejection of campaign payment.
 */
export class RejectPaymentDto {
  @IsString()
  reason: string;
}
