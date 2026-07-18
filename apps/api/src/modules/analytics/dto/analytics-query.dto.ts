import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { MetricCode, MetricPeriod } from '../interfaces/analytics.interface';

/**
 * DTO for querying metric time series data.
 */
export class MetricQueryDto {
  @IsString()
  metric: string;

  @IsOptional()
  @IsEnum(MetricPeriod)
  period?: MetricPeriod = MetricPeriod.DAILY;

  @IsOptional()
  @IsString()
  dimension?: string;

  @IsOptional()
  @IsString()
  dimensionValue?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number = 30;
}

/**
 * DTO for querying analytics events.
 */
export class AnalyticsEventQueryDto {
  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 50;
}
