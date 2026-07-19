import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { AuthTokens, JwtPayload, Role } from '@soloadvertiser/types';
import { ERROR_CODES } from '@soloadvertiser/contracts';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

/**
 * Identity service handling registration, authentication, and session management.
 * Business rules:
 * - Business users authenticate with email + password
 * - Riders authenticate with phone + OTP
 * - Account lockout after 5 consecutive failed attempts (30 min lockout)
 * - JWT access tokens expire in 15 minutes
 * - Refresh tokens expire in 7 days with rotation
 */
@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);
  private readonly SALT_ROUNDS = 12;
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user.
   * - Email-based: for BUSINESS role (requires password)
   * - Phone-based: for RIDER role (OTP verification later)
   */
  async register(dto: RegisterDto): Promise<AuthTokens> {
    // Determine registration type
    if (dto.email) {
      return this.registerWithEmail(dto);
    }

    if (dto.phone) {
      return this.registerWithPhone(dto);
    }

    throw new UnauthorizedException({
      code: ERROR_CODES.VALIDATION.INVALID_INPUT,
      message: 'Either email or phone is required for registration',
    });
  }

  private async registerWithEmail(dto: RegisterDto): Promise<AuthTokens> {
    // Check for existing user with same email
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.AUTH.EMAIL_ALREADY_EXISTS,
        message: 'A user with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password!, this.SALT_ROUNDS);
    const role = dto.role || Role.BUSINESS;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: role as any,
      },
    });

    this.logger.log(`User registered: ${user.id} (email: ${user.email})`);

    return this.createSession(user.id, user.email!, user.role as unknown as Role);
  }

  private async registerWithPhone(dto: RegisterDto): Promise<AuthTokens> {
    // Check for existing user with same phone
    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.AUTH.PHONE_ALREADY_EXISTS,
        message: 'A user with this phone already exists',
      });
    }

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        role: 'RIDER',
      },
    });

    this.logger.log(`User registered: ${user.id} (phone: ${user.phone})`);

    return this.createSession(user.id, undefined, Role.RIDER, user.phone!);
  }

  /**
   * Authenticate user with email+password or phone+OTP.
   */
  async login(dto: LoginDto, ipAddress?: string): Promise<AuthTokens> {
    if (dto.email && dto.password) {
      return this.loginWithEmail(dto.email, dto.password, dto.deviceInfo, ipAddress);
    }

    if (dto.phone && dto.otpCode) {
      return this.loginWithPhone(dto.phone, dto.otpCode, dto.deviceInfo, ipAddress);
    }

    throw new UnauthorizedException({
      code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
      message: 'Invalid login credentials',
    });
  }

  private async loginWithEmail(
    email: string,
    password: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException({
        code: ERROR_CODES.AUTH.ACCOUNT_LOCKED,
        message: 'Account is temporarily locked due to too many failed attempts',
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash || '');

    if (!isValid) {
      // Increment failed attempts
      const failedAttempts = user.failedAttempts + 1;
      const updateData: any = { failedAttempts };

      // Lock account after MAX_FAILED_ATTEMPTS
      if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION_MS);
        this.logger.warn(`Account locked for user: ${user.id}`);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    // Reset failed attempts on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    return this.createSession(
      user.id,
      user.email!,
      user.role as unknown as Role,
      undefined,
      deviceInfo,
      ipAddress,
    );
  }

  private async loginWithPhone(
    phone: string,
    otpCode: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        message: 'Invalid phone number',
      });
    }

    // TODO: Verify OTP against stored code (placeholder — accept "123456" in dev)
    const isValidOtp = otpCode === '123456' || this.verifyOtp(phone, otpCode);

    if (!isValidOtp) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.INVALID_OTP,
        message: 'Invalid or expired OTP code',
      });
    }

    // Mark phone as verified on first successful OTP login
    if (!user.phoneVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }

    return this.createSession(
      user.id,
      undefined,
      user.role as unknown as Role,
      user.phone!,
      deviceInfo,
      ipAddress,
    );
  }

  /**
   * Refresh access token using a valid refresh token.
   * Implements token rotation: old refresh token is invalidated, new one is issued.
   */
  async refreshToken(dto: RefreshTokenDto): Promise<AuthTokens> {
    const session = await this.prisma.session.findFirst({
      where: { refreshToken: dto.refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.UNAUTHORIZED,
        message: 'Invalid refresh token',
      });
    }

    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException({
        code: ERROR_CODES.AUTH.TOKEN_EXPIRED,
        message: 'Refresh token has expired',
      });
    }

    // Rotate refresh token
    const newRefreshToken = randomUUID();
    const newExpiry = new Date(
      Date.now() + this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt: newExpiry,
      },
    });

    const payload: JwtPayload = {
      sub: session.user.id,
      email: session.user.email || undefined,
      phone: session.user.phone || undefined,
      role: session.user.role as unknown as Role,
      sessionId: session.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * Invalidate a session (logout).
   */
  async logout(sessionId: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id: sessionId },
    }).catch(() => {
      // Session might already be expired/deleted — that's fine
    });
  }

  /**
   * Get current user profile by ID.
   */
  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        code: ERROR_CODES.RESOURCE.NOT_FOUND,
        message: 'User not found',
      });
    }

    return user;
  }

  /**
   * List active sessions for a user.
   */
  async listSessions(userId: string, currentSessionId: string) {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((session) => ({
      id: session.id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: session.id === currentSessionId,
    }));
  }

  /**
   * Revoke a specific session for a user.
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException({
        code: ERROR_CODES.AUTH.SESSION_NOT_FOUND,
        message: 'Session not found',
      });
    }

    await this.prisma.session.delete({ where: { id: sessionId } });
  }

  /**
   * Send OTP to phone number (placeholder implementation).
   */
  async sendOtp(phone: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      // Don't reveal whether phone exists — always return success
      this.logger.warn(`OTP requested for non-existent phone: ${phone}`);
    }

    // TODO: Integrate with SMS provider (Twilio / Africa's Talking)
    // For now, log the OTP for development
    const otp = '123456'; // Placeholder
    this.logger.log(`[DEV] OTP for ${phone}: ${otp}`);

    return { message: 'OTP sent successfully' };
  }

  /**
   * Verify OTP code (placeholder).
   */
  private verifyOtp(_phone: string, _code: string): boolean {
    // TODO: Check stored OTP with expiry (Redis or DB)
    return false;
  }

  /**
   * Create a session and return JWT tokens.
   */
  private async createSession(
    userId: string,
    email?: string,
    role?: Role,
    phone?: string,
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
        deviceInfo: deviceInfo || null,
        ipAddress: ipAddress || null,
      },
    });

    const payload: JwtPayload = {
      sub: userId,
      email,
      phone,
      role: role || Role.RIDER,
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
