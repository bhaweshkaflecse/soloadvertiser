import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadInterface } from '../interfaces/jwt-payload.interface';

/**
 * JWT Passport strategy — validates and decodes access tokens.
 * Placeholder implementation; secret is loaded from environment.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] || 'default-dev-secret',
    });
  }

  /**
   * Passport calls this after verifying the token signature.
   * Returned value is attached to request.user.
   */
  async validate(payload: JwtPayloadInterface) {
    return {
      sub: payload.sub,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
