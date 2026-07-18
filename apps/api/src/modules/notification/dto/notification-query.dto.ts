import { IsOptional, IsBoolean, IsInt, Min, Max, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for querying user notifications with pagination and filters.
 */
export class NotificationQueryDto {
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
  pageSize?: number = 20;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsString()
  category?: string;
}
