import { CampaignStatus } from '@solo-advertiser/types';

/**
 * Valid state transitions for the campaign lifecycle state machine.
 *
 * DRAFT → PENDING_PAYMENT → PAYMENT_SUBMITTED → PAYMENT_VERIFIED → RECRUITING_RIDERS → READY → RUNNING → COMPLETED
 *                                                                                                  ↓
 *                                                                                               PAUSED → RUNNING (resume)
 *                                                                                                  ↓
 *                                                                                              CANCELLED
 */
export const VALID_CAMPAIGN_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  [CampaignStatus.DRAFT]: [CampaignStatus.PENDING_PAYMENT, CampaignStatus.CANCELLED],
  [CampaignStatus.PENDING_PAYMENT]: [CampaignStatus.PAYMENT_SUBMITTED, CampaignStatus.CANCELLED],
  [CampaignStatus.PAYMENT_SUBMITTED]: [
    CampaignStatus.PAYMENT_VERIFIED,
    CampaignStatus.PENDING_PAYMENT, // rejection → back to pending
    CampaignStatus.CANCELLED,
  ],
  [CampaignStatus.PAYMENT_VERIFIED]: [CampaignStatus.RECRUITING_RIDERS],
  [CampaignStatus.RECRUITING_RIDERS]: [CampaignStatus.READY, CampaignStatus.CANCELLED],
  [CampaignStatus.READY]: [CampaignStatus.RUNNING, CampaignStatus.CANCELLED],
  [CampaignStatus.RUNNING]: [
    CampaignStatus.PAUSED,
    CampaignStatus.COMPLETED,
    CampaignStatus.CANCELLED,
  ],
  [CampaignStatus.PAUSED]: [CampaignStatus.RUNNING, CampaignStatus.CANCELLED],
  [CampaignStatus.COMPLETED]: [], // Terminal state
  [CampaignStatus.CANCELLED]: [], // Terminal state
};

/**
 * Default configuration values for campaign creation.
 * These are overridden by ConfigEntry if present.
 */
export const CAMPAIGN_DEFAULTS = {
  /** Minimum campaign duration in days (RULE-CMP-001) */
  MIN_DURATION_DAYS: 15,
  /** Minimum required riders (RULE-CMP-002) */
  MIN_REQUIRED_RIDERS: 100,
  /** Business daily rate per rider in paisa (NPR 120 = 12000 paisa) */
  BUSINESS_DAILY_RATE: 12000,
  /** Rider daily rate in paisa (NPR 100 = 10000 paisa) */
  RIDER_DAILY_RATE: 10000,
  /** Fulfillment percentage required for READY (100%) (RULE-CMP-004) */
  FULFILLMENT_THRESHOLD: 100,
  /** Minimum days before start date when creating campaign */
  MIN_START_DATE_DAYS_AHEAD: 7,
} as const;

/**
 * Cost calculation helper.
 * RULE-CMP-003: totalCost = requiredRiders × durationDays × businessDailyRate
 */
export function calculateCampaignCost(
  requiredRiders: number,
  durationDays: number,
  businessDailyRate: number,
): number {
  return requiredRiders * durationDays * businessDailyRate;
}

/**
 * Fulfillment percentage calculation.
 */
export function calculateFulfillmentPct(
  currentAssigned: number,
  requiredRiders: number,
): number {
  if (requiredRiders === 0) return 0;
  return Math.min(100, (currentAssigned / requiredRiders) * 100);
}
