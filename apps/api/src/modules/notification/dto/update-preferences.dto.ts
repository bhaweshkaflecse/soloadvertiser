import { IsArray, ValidateNested, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Individual preference update item.
 */
export class PreferenceItemDto {
  @IsString()
  category: string;

  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @IsOptional()
  @IsBoolean()
  inApp?: boolean;
}

/**
 * DTO for updating notification preferences.
 */
export class UpdatePreferencesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreferenceItemDto)
  preferences: PreferenceItemDto[];
}
