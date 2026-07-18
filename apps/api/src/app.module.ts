import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Infrastructure modules
import { PrismaModule } from './prisma/prisma.module';

// Feature modules
import { IdentityModule } from './modules/identity/identity.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { MediaModule } from './modules/media/media.module';
import { RiderModule } from './modules/rider/rider.module';

// Global guards
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Infrastructure
    PrismaModule,

    // Feature modules — Sprint 1
    IdentityModule,
    ConfigurationModule,
    MediaModule,

    // Feature modules — Sprint 2
    RiderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global authentication guard — all routes require JWT unless marked @Public()
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // Global role guard — checks @Roles() decorator
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
