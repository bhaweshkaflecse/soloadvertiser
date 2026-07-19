/**
 * Marketplace module interfaces — CTX-015
 * Channel Maturity Model stages, categories, and campaign objectives.
 */

/**
 * Channel Maturity Model (CMM) stages.
 * Channels progress through these stages as supply/demand grows.
 */
export enum CMMStage {
  MARKET_RESEARCH = 'CMM_001_MARKET_RESEARCH',
  PRE_ORDER_OPEN = 'CMM_002_PRE_ORDER_OPEN',
  PRE_ENROLLMENT_OPEN = 'CMM_003_PRE_ENROLLMENT_OPEN',
  PILOT_PROGRAM = 'CMM_004_PILOT_PROGRAM',
  LIVE = 'CMM_005_LIVE',
  SCALING = 'CMM_006_SCALING',
  NATIONAL = 'CMM_007_NATIONAL',
  INTERNATIONAL = 'CMM_008_INTERNATIONAL',
}

/**
 * Valid CMM transitions — forward only.
 */
export const VALID_CMM_TRANSITIONS: Record<string, string[]> = {
  CMM_001_MARKET_RESEARCH: ['CMM_002_PRE_ORDER_OPEN'],
  CMM_002_PRE_ORDER_OPEN: ['CMM_003_PRE_ENROLLMENT_OPEN'],
  CMM_003_PRE_ENROLLMENT_OPEN: ['CMM_004_PILOT_PROGRAM'],
  CMM_004_PILOT_PROGRAM: ['CMM_005_LIVE'],
  CMM_005_LIVE: ['CMM_006_SCALING'],
  CMM_006_SCALING: ['CMM_007_NATIONAL'],
  CMM_007_NATIONAL: ['CMM_008_INTERNATIONAL'],
};

/**
 * Channel super-categories.
 */
export enum ChannelSuperCategory {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
}

/**
 * Physical channel sub-categories.
 */
export const PHYSICAL_CHANNELS = [
  'helmet',
  'taxi_exterior',
  'taxi_interior',
  'delivery_jacket',
  'windcheater',
  'tshirt',
  'bus_interior',
  'bus_exterior',
  'property_hoardings',
  'wall_branding',
  'rooftop',
  'event_promotion',
] as const;

/**
 * Digital channel sub-categories.
 */
export const DIGITAL_CHANNELS = [
  'influencer',
  'youtube',
  'blog',
  'instagram',
  'tiktok',
  'facebook',
  'news_portal',
  'community',
  'email',
  'digital_campaign',
] as const;

/**
 * Campaign objectives for pre-orders.
 */
export const CAMPAIGN_OBJECTIVES = [
  'brand_awareness',
  'lead_generation',
  'product_launch',
  'event_promotion',
  'seasonal_campaign',
  'local_targeting',
  'national_reach',
] as const;

/**
 * Pre-order status values.
 */
export enum PreOrderStatus {
  SUBMITTED = 'submitted',
  ACKNOWLEDGED = 'acknowledged',
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
}

/**
 * Readiness score weights for composite calculation.
 */
export const READINESS_WEIGHTS = {
  supply: 0.30,
  demand: 0.25,
  coverage: 0.20,
  operational: 0.15,
  infrastructure: 0.10,
} as const;
