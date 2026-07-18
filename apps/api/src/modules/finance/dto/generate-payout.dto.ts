import { IsDateString, IsOptional } from 'class-validator';

/**
 * DTO for generating a payout batch.
 * Finance staff triggers batch creation for eligible riders.
 */
export class GeneratePayoutDto {
  /**
   * Optional cycle date override. Defaults to current date.
   */
  @IsOptional()
  @IsDateString()
  cycleDate?: string;
}
