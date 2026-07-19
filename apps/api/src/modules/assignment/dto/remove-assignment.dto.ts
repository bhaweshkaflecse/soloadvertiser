import { IsString } from 'class-validator';

/**
 * DTO for removing an assignment.
 * RULE-ASN-005: Removal requires documented reason.
 */
export class RemoveAssignmentDto {
  @IsString()
  reason: string;
}
