import { IsNotEmpty, IsString, IsIn } from 'class-validator';

/**
 * DTO for Google OAuth authentication.
 * Supports both web (Google Sign-In) and mobile (Google Sign-In for Flutter) clients.
 */
export class GoogleAuthDto {
  @IsNotEmpty()
  @IsString()
  idToken: string;

  @IsNotEmpty()
  @IsIn(['web', 'mobile'])
  clientType: 'web' | 'mobile';
}
