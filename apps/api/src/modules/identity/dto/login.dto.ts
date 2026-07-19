import { IsEmail, IsOptional, IsString, ValidateIf } from 'class-validator';

/**
 * Login DTO.
 * Supports two flows:
 * 1. Email + password (business users)
 * 2. Phone + OTP code (riders)
 */
export class LoginDto {
  @ValidateIf((o) => !o.phone)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  phone?: string;

  @ValidateIf((o) => !!o.email)
  @IsString()
  password?: string;

  @ValidateIf((o) => !!o.phone)
  @IsString()
  otpCode?: string;

  @IsOptional()
  @IsString()
  deviceInfo?: string;
}
