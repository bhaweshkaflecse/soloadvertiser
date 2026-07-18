import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';

/**
 * DTO for updating rider personal information.
 */
export class UpdateRiderProfileDto {
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
