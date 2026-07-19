import { IsString, IsOptional, IsNumber, IsObject, IsIn } from 'class-validator';

/**
 * DTO for creating a new advertising channel.
 */
export class CreateChannelDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsIn(['physical', 'digital'])
  superCategory: string;

  @IsString()
  subCategory: string;

  @IsOptional()
  @IsString()
  partnerCategory?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsNumber()
  estimatedReach?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, unknown>;
}
