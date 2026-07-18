import { Role } from '@solo-advertiser/types';

/**
 * JWT token payload structure.
 * Encoded in access tokens issued during authentication.
 */
export interface JwtPayloadInterface {
  sub: string; // user ID (UUID)
  email?: string;
  phone?: string;
  role: Role;
  sessionId: string;
}
