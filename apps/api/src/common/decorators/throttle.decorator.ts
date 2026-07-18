import { SetMetadata } from '@nestjs/common';

export const THROTTLE_METADATA_KEY = 'throttle_config';

/**
 * Rate limiting decorator for per-endpoint configuration.
 *
 * Usage:
 *   @Throttle(10, 900) // 10 requests per 15 minutes
 *   @Post('login')
 *   async login() { ... }
 *
 * Default limits (from Doc 16):
 * - Auth endpoints: @Throttle(10, 900)       → 10 requests / 15 minutes
 * - OTP:           @Throttle(5, 900)        → 5 requests / 15 minutes
 * - File upload:   @Throttle(20, 3600)      → 20 requests / 1 hour
 * - Standard API:  @Throttle(100, 60)       → 100 requests / 1 minute (default)
 * - Public:        @Throttle(30, 60)        → 30 requests / 1 minute
 */
export const Throttle = (limit: number, windowSeconds: number) =>
  SetMetadata(THROTTLE_METADATA_KEY, { limit, windowSeconds });

/**
 * Preset rate limit decorators for convenience.
 */
export const ThrottleAuth = () => Throttle(10, 900);
export const ThrottleOtp = () => Throttle(5, 900);
export const ThrottleUpload = () => Throttle(20, 3600);
export const ThrottlePublic = () => Throttle(30, 60);
export const ThrottleStandard = () => Throttle(100, 60);
