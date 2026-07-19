import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsArray,
  IsIn,
} from 'class-validator';

/**
 * DTO for creating a distribution center.
 */
export class CreateCenterDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(['collection_point', 'installation_center', 'coordination_hub'])
  type: string;

  @IsString()
  regionId: string;

  @IsString()
  zoneId: string;

  @IsOptional()
  @IsString()
  wardId?: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  gpsLat?: number;

  @IsOptional()
  @IsNumber()
  gpsLng?: number;

  @IsArray()
  @IsString({ each: true })
  supportedChannels: string[];

  @IsObject()
  operatingHours: Record<string, unknown>;

  @IsNumber()
  capacityPerHour: number;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  managerUserId?: string;
}
