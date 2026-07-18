import { RiderStatus } from '@solo-advertiser/types';

/**
 * Valid state transitions for the rider lifecycle state machine.
 * Key: current status, Value: array of valid target statuses.
 */
export const VALID_TRANSITIONS: Record<RiderStatus, RiderStatus[]> = {
  [RiderStatus.PRE_REGISTERED]: [RiderStatus.DOCUMENTS_PENDING],
  [RiderStatus.DOCUMENTS_PENDING]: [RiderStatus.VERIFICATION_PENDING, RiderStatus.SUSPENDED],
  [RiderStatus.VERIFICATION_PENDING]: [
    RiderStatus.APPROVED,
    RiderStatus.DOCUMENTS_PENDING,
    RiderStatus.SUSPENDED,
  ],
  [RiderStatus.APPROVED]: [RiderStatus.AVAILABLE, RiderStatus.SUSPENDED],
  [RiderStatus.AVAILABLE]: [
    RiderStatus.ASSIGNED,
    RiderStatus.UNAVAILABLE,
    RiderStatus.SUSPENDED,
  ],
  [RiderStatus.ASSIGNED]: [RiderStatus.CAMPAIGN_ACTIVE, RiderStatus.SUSPENDED],
  [RiderStatus.CAMPAIGN_ACTIVE]: [RiderStatus.AVAILABLE, RiderStatus.SUSPENDED],
  [RiderStatus.UNAVAILABLE]: [RiderStatus.AVAILABLE, RiderStatus.SUSPENDED],
  [RiderStatus.SUSPENDED]: [RiderStatus.APPROVED],
};

/**
 * Required document types for rider verification.
 */
export const REQUIRED_DOCUMENT_TYPES = [
  'citizenship',
  'driving_license',
  'vehicle_registration',
  'profile_photo',
] as const;

export type RequiredDocumentType = (typeof REQUIRED_DOCUMENT_TYPES)[number];

/**
 * Reliability score weights (must sum to 100).
 */
export const RELIABILITY_WEIGHTS = {
  verification: 30,
  attendance: 25,
  activity: 20,
  completion: 15,
  response: 10,
} as const;

/**
 * Rider eligibility criteria for campaign assignment.
 */
export interface EligibilityFilter {
  zoneId?: string;
  assetType?: string;
  minScore?: number;
}
