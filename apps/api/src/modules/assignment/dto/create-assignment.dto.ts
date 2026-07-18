import { ArrayMinSize, IsArray, IsOptional, IsUUID } from 'class-validator';

/**
 * DTO for creating a single assignment (assign rider to campaign).
 * RULE-ASN-003: Only Ops Staff+ can create assignments.
 */
export class CreateAssignmentDto {
  @IsUUID()
  campaignId: string;

  @IsUUID()
  riderId: string;

  @IsOptional()
  @IsUUID()
  zoneId?: string;
}

/**
 * DTO for bulk assigning riders to a campaign.
 */
export class BulkCreateAssignmentDto {
  @IsUUID()
  campaignId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  riderIds: string[];

  @IsOptional()
  @IsUUID()
  zoneId?: string;
}
