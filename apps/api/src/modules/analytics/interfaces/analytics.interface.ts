/**
 * Metric codes tracked by the analytics system.
 */
export enum MetricCode {
  ACTIVE_RIDERS = 'active_riders',
  ACTIVE_CAMPAIGNS = 'active_campaigns',
  TOTAL_REVENUE = 'total_revenue',
  PENDING_PAYOUTS = 'pending_payouts',
  FULFILLMENT_RATE = 'fulfillment_rate',
  VERIFICATION_COMPLIANCE = 'verification_compliance',
  PENDING_APPROVALS = 'pending_approvals',
  RIDER_GROWTH = 'rider_growth',
  BUSINESS_GROWTH = 'business_growth',
  TOTAL_ESCROW_HELD = 'total_escrow_held',
}

/**
 * Metric aggregation periods.
 */
export enum MetricPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

/**
 * Dimensions for dimensional metrics.
 */
export enum MetricDimension {
  ZONE = 'zone',
  CHANNEL = 'channel',
  CATEGORY = 'category',
}

/**
 * Dashboard KPI item.
 */
export interface DashboardKpi {
  metric: MetricCode;
  label: string;
  value: number;
  period: string;
  periodStart: Date;
}

/**
 * Metric time series data point.
 */
export interface MetricDataPoint {
  value: number;
  periodStart: Date;
  dimension?: string;
  dimensionValue?: string;
}

/**
 * Analytics event input for recording.
 */
export interface AnalyticsEventInput {
  eventType: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  properties?: Record<string, unknown>;
}

/**
 * All metric codes as array.
 */
export const ALL_METRICS: MetricCode[] = Object.values(MetricCode);
