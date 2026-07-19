import { IsDateString, IsInt, IsString, IsUUID, Min } from 'class-validator';

/**
 * DTO for submitting payment proof for a campaign.
 * Business submits bank transfer/e-wallet proof for admin verification.
 */
export class SubmitPaymentDto {
  @IsString()
  method: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  referenceId: string;

  @IsDateString()
  paymentDate: string;

  @IsUUID()
  proofMediaId: string;
}
