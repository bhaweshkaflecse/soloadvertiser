import { IsString } from 'class-validator';

/**
 * DTO for cancelling a campaign. Reason is always required.
 */
export class CancelCampaignDto {
  @IsString()
  reason: string;
}
