import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';

/**
 * DTO for submitting a business pre-order for a channel.
 */
export class SubmitPreOrderDto {
  @IsString()
  channelId: string;

  @IsNumber()
  @Min(1000)
  estimatedBudget: number;

  @IsString()
  preferredCity: string;

  @IsString()
  campaignDuration: string;

  @IsString()
  expectedLaunch: string;

  @IsArray()
  @IsString({ each: true })
  campaignObjectives: string[];

  @IsOptional()
  @IsDateString()
  preferredStartDate?: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
