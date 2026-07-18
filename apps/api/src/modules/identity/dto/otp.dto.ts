import { IsString } from 'class-validator';

/**
 * DTO for sending OTP to a phone number.
 */
export class SendOtpDto {
  @IsString()
  phone: string;
}

/**
 * DTO for verifying an OTP code.
 */
export class VerifyOtpDto {
  @IsString()
  phone: string;

  @IsString()
  code: string;
}
