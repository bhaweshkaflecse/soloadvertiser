import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for updating a configuration entry.
 * The value field accepts any JSON-serializable data.
 */
export class UpdateConfigDto {
  value: unknown;

  @IsOptional()
  @IsString()
  description?: string;
}
