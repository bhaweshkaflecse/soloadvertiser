import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';

/**
 * DTO for creating a new rider profile.
 * Minimal data needed; profile is enriched incrementally.
 */
export class CreateRiderProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  emergencyName?: string;

  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @IsOptional()
  @IsUUID()
  profilePhotoId?: string;
}
