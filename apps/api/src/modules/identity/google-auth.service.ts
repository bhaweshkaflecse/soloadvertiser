import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthTokens, JwtPayload, Role } from '@soloadvertiser/types';
import { ERROR_CODES } from '@soloadvertiser/contracts';
import { randomUUID } from 'crypto';

interface GoogleProfile {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

/**
 * Google OAuth authentication service.
 * Verifies Google ID tokens and performs user upsert for both web and mobile clients.
 *
 * Web: Uses GOOGLE_CLIENT_ID_WEB for Google Sign-In on web platforms.
 * Mobile: Uses GOOGLE_CLIENT_ID_MOBILE for Google Sign-In on Flutter/mobile.
 */
@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Verify a Google ID token against Google's tokeninfo endpoint.
   * Validates the token signature, expiration, and audience (client ID).
   *
   * @param idToken - The Google ID token to verify
   * @param clientType - 'web' or 'mobile' to select the correct client ID for audience validation
   * @returns Decoded Google profile payload
   * @throws UnauthorizedException if token is invalid or audience mismatch
   */
  async verifyGoogleToken(
    idToken: string,
    clientType: 'web' | 'mobile',
  ): Promise<GoogleProfile> {
    const expectedClientId =
      clientType === 'web'
        ? process.env['GOOGLE_CLIENT_ID_WEB']
        : process.env['GOOGLE_CLIENT_ID_MOBILE'];

    if (!expectedClientId) {
      this.logger.error(
        `Google client ID not configured for ${clientType}`,
      );
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        message: 'Google authentication is not configured',
      });
    }

    try {
      // Verify token via Google's tokeninfo endpoint
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      );

      if (!response.ok) {
        throw new Error(`Google tokeninfo responded with status ${response.status}`);
      }

      const payload = (await response.json()) as Record<string, any>;

      // Validate audience matches our client ID
      if (payload.aud !== expectedClientId) {
        this.logger.warn(
          `Google token audience mismatch: expected ${expectedClientId}, got ${payload.aud}`,
        );
        throw new Error('Token audience mismatch');
      }

      // Validate token is not expired (Google returns exp as string seconds)
      const expiry = parseInt(payload.exp, 10) * 1000;
      if (Date.now() >= expiry) {
        throw new Error('Token has expired');
      }

      // Validate email is verified
      if (payload.email_verified !== 'true' && payload.email_verified !== true) {
        throw new Error('Google email is not verified');
      }

      return {
        sub: payload.sub,
        email: payload.email,
        email_verified: true,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
      };
    } catch (error) {
      this.logger.warn(
        `Google token verification failed: ${(error as Error).message}`,
      );
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        message: 'Invalid Google authentication token',
      });
    }
  }

  /**
   * Find an existing user by email or create a new one from Google profile data.
   * If the user exists, their email is marked as verified (since Google verified it).
   *
   * @param googleProfile - Verified Google profile data
   * @returns AuthTokens (access + refresh tokens)
   */
  async findOrCreateUser(
    googleProfile: GoogleProfile,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    let user = await this.prisma.user.findUnique({
      where: { email: googleProfile.email },
    });

    if (user) {
      // Existing user — ensure email is marked verified
      if (!user.emailVerified) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
      }

      // Reset lockout on successful Google auth
      if (user.failedAttempts > 0 || user.lockedUntil) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: 0, lockedUntil: null },
        });
      }

      this.logger.log(
        `Google auth: existing user ${user.id} (${googleProfile.email})`,
      );
    } else {
      // Create new user from Google profile
      user = await this.prisma.user.create({
        data: {
          email: googleProfile.email,
          emailVerified: true,
          role: 'BUSINESS', // Google OAuth users default to BUSINESS role
        },
      });

      this.logger.log(
        `Google auth: new user created ${user.id} (${googleProfile.email})`,
      );
    }

    // Create session and return tokens
    return this.createSession(
      user.id,
      user.email!,
      user.role as unknown as Role,
      deviceInfo,
      ipAddress,
    );
  }

  /**
   * Create a session and return JWT tokens.
   */
  private async createSession(
    userId: string,
    email: string,
    role: Role,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    const refreshToken = randomUUID();
    const expiresAt = new Date(
      Date.now() + this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
        deviceInfo: deviceInfo || 'google-oauth',
        ipAddress: ipAddress || null,
      },
    });

    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
      sessionId: session.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
