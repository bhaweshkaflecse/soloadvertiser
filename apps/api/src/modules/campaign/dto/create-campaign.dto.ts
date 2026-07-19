import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

/**
 * DTO for creating a new campaign (DRAFT).
 * Business provides campaign details; cost is calculated server-side.
 */
export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  targetZones: string[];

  @IsInt()
  @Min(1)
  requiredRiders: number;

  @IsOptional()
  @IsString()
  assetType?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsUUID()
  creativeMediaId?: string;
}
