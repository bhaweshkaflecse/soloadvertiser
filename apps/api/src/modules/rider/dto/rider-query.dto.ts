import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RiderStatus } from '@solo-advertiser/types';

/**
 * DTO for admin rider listing — supports filtering, searching, pagination.
 */
export class RiderQueryDto {
  @IsOptional()
  @IsEnum(RiderStatus)
  status?: RiderStatus;

  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  scoreMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  scoreMax?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number = 20;
}
