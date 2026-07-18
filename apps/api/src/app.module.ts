import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Infrastructure modules
import { PrismaModule } from './prisma/prisma.module';

// Feature modules
import { IdentityModule } from './modules/identity/identity.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { MediaModule } from './modules/media/media.module';
import { RiderModule } from './modules/rider/rider.module';
import { BusinessModule } from './modules/business/business.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { AssignmentModule } from './modules/assignment/assignment.module';
import { FinanceModule } from './modules/finance/finance.module';
import { NotificationModule } from './modules/notification/notification.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { PartnerModule } from './modules/partner/partner.module';
import { DistributionModule } from './modules/distribution/distribution.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { AuditModule } from './modules/audit/audit.module';
import { SupportModule } from './modules/support/support.module';
import { EmailModule } from './modules/email/email.module';

// Background processing
import { WorkerModule } from './workers/worker.module';
import { CronModule } from './cron/cron.module';

// Global guards
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ThrottleGuard } from './common/guards/throttle.guard';

@Module({
  imports: [
    // Infrastructure
    PrismaModule,
    EventEmitterModule.forRoot(),

    // Email & SMS
    EmailModule,

    // Background processing
    WorkerModule,
    CronModule,

    // Feature modules — Sprint 1
    IdentityModule,
    ConfigurationModule,
    MediaModule,
    WebSocketModule,
    AuditModule,
    SupportModule,

    // Feature modules — Sprint 2
    RiderModule,

    // Feature modules — Sprint 3
    BusinessModule,

    // Feature modules — Sprint 4
    CampaignModule,
    AssignmentModule,

    // Feature modules — Sprint 5
    FinanceModule,

    // Feature modules — Sprint 6
    NotificationModule,
    TimelineModule,
    AnalyticsModule,

    // Feature modules — Sprint 10
    MarketplaceModule,
    PartnerModule,
    DistributionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limiting guard — applies to all routes
    {
      provide: APP_GUARD,
      useClass: ThrottleGuard,
    },
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
