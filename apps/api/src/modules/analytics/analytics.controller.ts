import { Controller, Get, Post, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { MetricsService } from './metrics.service';
import { MetricQueryDto, AnalyticsEventQueryDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@solo-advertiser/types';
import { MetricPeriod } from './interfaces/analytics.interface';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly metricsService: MetricsService,
  ) {}

  /**
   * GET /api/v1/analytics/dashboard — Admin dashboard KPIs.
   */
  @Get('dashboard')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATIONS_STAFF)
  async getDashboard() {
    return this.metricsService.getDashboard();
  }

  /**
   * GET /api/v1/analytics/metrics — Metric time series data.
   */
  @Get('metrics')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATIONS_STAFF)
  async getMetricTimeSeries(@Query() query: MetricQueryDto) {
    return this.metricsService.getMetricTimeSeries(
      query.metric,
      query.period,
      query.days,
      query.dimension,
      query.dimensionValue,
    );
  }

  /**
   * GET /api/v1/analytics/metrics/snapshot — Current snapshot of all metrics.
   */
  @Get('metrics/snapshot')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATIONS_STAFF)
  async getCurrentSnapshot() {
    return this.metricsService.getCurrentSnapshot();
  }

  /**
   * GET /api/v1/analytics/events — Event stream (paginated).
   */
  @Get('events')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async getEvents(@Query() query: AnalyticsEventQueryDto) {
    return this.analyticsService.queryEvents({
      eventType: query.eventType,
      entityType: query.entityType,
      entityId: query.entityId,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  /**
   * POST /api/v1/analytics/compute — Trigger metric computation (Admin/cron).
   */
  @Post('compute')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async computeMetrics(@Query('period') period?: string) {
    const metricPeriod = (period as MetricPeriod) || MetricPeriod.DAILY;
    await this.metricsService.computeAndSnapshot(metricPeriod);
    return { message: 'Metrics computed and snapshot created', period: metricPeriod };
  }
}
