import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Redis } from 'ioredis';
import { THROTTLE_METADATA_KEY } from '../decorators/throttle.decorator';

/**
 * Default rate limit configuration.
 */
const DEFAULT_LIMIT = 100;
const DEFAULT_WINDOW_SECONDS = 60;

/**
 * Redis-backed sliding window rate limiter guard.
 *
 * Uses a sorted set (ZSET) in Redis for each client key.
 * Each request adds a timestamp entry. Expired entries are pruned on each check.
 *
 * Default limits (from Doc 16):
 * - Auth endpoints: 10 requests / 15 minutes
 * - OTP: 5 requests / 15 minutes
 * - File upload: 20 requests / 1 hour
 * - Standard API: 100 requests / 1 minute
 * - Public endpoints: 30 requests / 1 minute
 */
@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly logger = new Logger(ThrottleGuard.name);
  private redis: Redis;

  constructor(private readonly reflector: Reflector) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('error', (err) => {
      this.logger.error(`Redis connection error in ThrottleGuard: ${err.message}`);
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get per-endpoint config from @Throttle() decorator or use defaults
    const throttleConfig = this.reflector.getAllAndOverride<{
      limit: number;
      windowSeconds: number;
    }>(THROTTLE_METADATA_KEY, [context.getHandler(), context.getClass()]);

    const limit = throttleConfig?.limit || DEFAULT_LIMIT;
    const windowSeconds = throttleConfig?.windowSeconds || DEFAULT_WINDOW_SECONDS;

    // Build a unique key per client + endpoint
    const clientIp = this.getClientIp(request);
    const routeKey = `${request.method}:${request.route?.path || request.url}`;
    const key = `rate_limit:${clientIp}:${routeKey}`;

    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    try {
      // Sliding window implementation using Redis sorted set
      const pipeline = this.redis.pipeline();

      // Remove entries outside the window
      pipeline.zremrangebyscore(key, 0, windowStart);

      // Count current entries in window
      pipeline.zcard(key);

      // Add current request timestamp
      pipeline.zadd(key, now.toString(), `${now}:${Math.random()}`);

      // Set TTL on the key
      pipeline.expire(key, windowSeconds);

      const results = await pipeline.exec();

      // zcard result is at index 1
      const currentCount = (results?.[1]?.[1] as number) || 0;

      // Calculate remaining
      const remaining = Math.max(0, limit - currentCount - 1);
      const resetTime = Math.ceil((now + windowSeconds * 1000) / 1000);

      // Set rate limit headers
      response.setHeader('X-RateLimit-Limit', limit.toString());
      response.setHeader('X-RateLimit-Remaining', remaining.toString());
      response.setHeader('X-RateLimit-Reset', resetTime.toString());

      if (currentCount >= limit) {
        // Remove the entry we just added since we're denying
        await this.redis.zrem(key, `${now}:${Math.random()}`);

        response.setHeader('Retry-After', windowSeconds.toString());

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests. Please try again later.',
            error: 'Too Many Requests',
            retryAfter: windowSeconds,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      // If Redis is down, allow the request (fail-open)
      this.logger.warn(
        `Rate limiter Redis error (fail-open): ${error.message}`,
      );
      return true;
    }
  }

  /**
   * Extract client IP address from request.
   */
  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.ip ||
      request.connection?.remoteAddress ||
      'unknown'
    );
  }
}
