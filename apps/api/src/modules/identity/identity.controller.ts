import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { IdentityService } from './identity.service';
import { RegisterDto, LoginDto, RefreshTokenDto, SendOtpDto, VerifyOtpDto } from './dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@solo-advertiser/types';

/**
 * Identity / Authentication controller.
 * Base path: /api/v1/auth
 */
@Controller('auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  /**
   * POST /api/v1/auth/register
   * Register a new user (email for business, phone for rider).
   */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const tokens = await this.identityService.register(dto);
    return { success: true, data: tokens, timestamp: new Date().toISOString() };
  }

  /**
   * POST /api/v1/auth/login
   * Authenticate with email+password or phone+OTP.
   */
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const tokens = await this.identityService.login(dto, ipAddress);
    return { success: true, data: tokens, timestamp: new Date().toISOString() };
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token (token rotation).
   */
  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    const tokens = await this.identityService.refreshToken(dto);
    return { success: true, data: tokens, timestamp: new Date().toISOString() };
  }

  /**
   * POST /api/v1/auth/logout
   * Invalidate current session.
   */
  @Post('logout')
  async logout(@CurrentUser() user: JwtPayload) {
    await this.identityService.logout(user.sessionId);
    return { success: true, data: { message: 'Logged out' }, timestamp: new Date().toISOString() };
  }

  /**
   * POST /api/v1/auth/otp/send
   * Send OTP to phone number for authentication.
   */
  @Public()
  @Post('otp/send')
  async sendOtp(@Body() dto: SendOtpDto) {
    const result = await this.identityService.sendOtp(dto.phone);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  /**
   * POST /api/v1/auth/otp/verify
   * Verify OTP code — used for phone verification flow.
   */
  @Public()
  @Post('otp/verify')
  async verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const tokens = await this.identityService.login(
      { phone: dto.phone, otpCode: dto.code },
      ipAddress,
    );
    return { success: true, data: tokens, timestamp: new Date().toISOString() };
  }

  /**
   * GET /api/v1/auth/me
   * Get current authenticated user profile.
   */
  @Get('me')
  async me(@CurrentUser() user: JwtPayload) {
    const profile = await this.identityService.getCurrentUser(user.sub);
    return { success: true, data: profile, timestamp: new Date().toISOString() };
  }

  /**
   * GET /api/v1/auth/sessions
   * List active sessions for current user.
   */
  @Get('sessions')
  async listSessions(@CurrentUser() user: JwtPayload) {
    const sessions = await this.identityService.listSessions(user.sub, user.sessionId);
    return { success: true, data: sessions, timestamp: new Date().toISOString() };
  }

  /**
   * DELETE /api/v1/auth/sessions/:id
   * Revoke a specific session.
   */
  @Delete('sessions/:id')
  async revokeSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') sessionId: string,
  ) {
    await this.identityService.revokeSession(user.sub, sessionId);
    return { success: true, data: { message: 'Session revoked' }, timestamp: new Date().toISOString() };
  }
}
