import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for verifying or rejecting a partner enrollment.
 */
export class VerifyEnrollmentDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
