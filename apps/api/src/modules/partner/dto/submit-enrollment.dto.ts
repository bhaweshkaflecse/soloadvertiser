import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
} from 'class-validator';

/**
 * DTO for submitting a partner enrollment.
 */
export class SubmitEnrollmentDto {
  @IsString()
  partnerCategoryCode: string;

  @IsString()
  channelId: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  platformUrl?: string;

  @IsOptional()
  @IsNumber()
  followersCount?: number;

  @IsOptional()
  @IsNumber()
  monthlyReach?: number;

  @IsOptional()
  @IsNumber()
  engagementRate?: number;

  @IsOptional()
  @IsString()
  contentNiche?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assetPhotos?: string[];

  @IsOptional()
  @IsString()
  locationCity?: string;

  @IsOptional()
  @IsString()
  locationZone?: string;

  @IsOptional()
  @IsObject()
  availability?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  expectedRate?: number;

  @IsOptional()
  @IsObject()
  additionalData?: Record<string, unknown>;
}
