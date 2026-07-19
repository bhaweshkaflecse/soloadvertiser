import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for activating a channel (moving to CMM_005_LIVE).
 */
export class ActivateChannelDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
