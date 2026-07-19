import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { GoogleAuthService } from './google-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Identity module — handles user registration, authentication, JWT, sessions, and RBAC.
 * Supports email/password, phone/OTP, and Google OAuth authentication.
 * JWT secret and expiry are configured via environment variables.
 */
@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env['JWT_SECRET'] || 'default-dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [IdentityController],
  providers: [IdentityService, GoogleAuthService, JwtStrategy],
  exports: [IdentityService, GoogleAuthService, JwtModule],
})
export class IdentityModule {}
