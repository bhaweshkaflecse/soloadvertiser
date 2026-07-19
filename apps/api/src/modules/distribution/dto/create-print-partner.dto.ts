import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsArray,
} from 'class-validator';

/**
 * DTO for registering a print partner.
 */
export class CreatePrintPartnerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  regionId: string;

  @IsString()
  zoneId: string;

  @IsOptional()
  @IsNumber()
  gpsLat?: number;

  @IsOptional()
  @IsNumber()
  gpsLng?: number;

  @IsArray()
  @IsString({ each: true })
  supportedChannels: string[];

  @IsArray()
  @IsString({ each: true })
  capabilities: string[];

  @IsNumber()
  maxDailyCapacity: number;

  @IsObject()
  workingHours: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  leadTimeDays?: number;
}
