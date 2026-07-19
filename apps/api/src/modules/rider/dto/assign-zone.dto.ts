import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

/**
 * DTO for assigning a rider to an operating zone.
 */
export class AssignZoneDto {
  @IsNotEmpty()
  @IsUUID()
  zoneId!: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;
}
