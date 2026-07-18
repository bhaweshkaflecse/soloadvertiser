import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for querying partner enrollments.
 */
export class EnrollmentQueryDto {
  @IsOptional()
  @IsString()
  partnerCategoryCode?: string;

  @IsOptional()
  @IsString()
  channelId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;
}
