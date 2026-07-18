import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { MetricsService } from './metrics.service';
import { AnalyticsListenerService } from './analytics-listener.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, MetricsService, AnalyticsListenerService],
  exports: [AnalyticsService, MetricsService],
})
export class AnalyticsModule {}
