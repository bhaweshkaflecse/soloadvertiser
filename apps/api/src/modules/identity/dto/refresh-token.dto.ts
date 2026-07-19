import { IsString } from 'class-validator';

/**
 * Refresh token DTO for token rotation.
 */
export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
