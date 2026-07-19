import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for creating or updating rider vehicle details.
 */
export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsNotEmpty()
  @IsString()
  registrationNumber!: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  makeModel?: string;
}
