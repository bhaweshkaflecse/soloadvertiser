import { IsEmail, IsEnum, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { Role } from '@solo-advertiser/types';

/**
 * Registration DTO.
 * Business users register with email + password.
 * Riders register with phone number (OTP-based).
 */
export class RegisterDto {
  @ValidateIf((o) => !o.phone)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  phone?: string;

  @ValidateIf((o) => !!o.email)
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
