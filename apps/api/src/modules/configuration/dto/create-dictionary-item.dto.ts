import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * DTO for creating a new dictionary item.
 */
export class CreateDictionaryItemDto {
  @IsString()
  dictionary: string;

  @IsString()
  code: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  metadata?: unknown;

  @IsOptional()
  @IsUUID()
  regionId?: string;
}
