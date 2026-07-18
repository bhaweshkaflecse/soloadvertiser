import { AssignmentStatus } from '@solo-advertiser/types';

/**
 * Valid state transitions for the assignment lifecycle state machine.
 *
 * SUGGESTED → ASSIGNED → STICKER_PENDING → DISTRIBUTED → INSTALLED → ACTIVE → COMPLETED
 *                                                                                ↓
 *                                                                              REMOVED
 */
export const VALID_ASSIGNMENT_TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
  [AssignmentStatus.SUGGESTED]: [AssignmentStatus.ASSIGNED, AssignmentStatus.REMOVED],
  [AssignmentStatus.ASSIGNED]: [AssignmentStatus.STICKER_PENDING, AssignmentStatus.REMOVED],
  [AssignmentStatus.STICKER_PENDING]: [AssignmentStatus.DISTRIBUTED, AssignmentStatus.REMOVED],
  [AssignmentStatus.DISTRIBUTED]: [AssignmentStatus.INSTALLED, AssignmentStatus.REMOVED],
  [AssignmentStatus.INSTALLED]: [AssignmentStatus.ACTIVE, AssignmentStatus.REMOVED],
  [AssignmentStatus.ACTIVE]: [AssignmentStatus.COMPLETED, AssignmentStatus.REMOVED],
  [AssignmentStatus.COMPLETED]: [], // Terminal state
  [AssignmentStatus.REMOVED]: [], // Terminal state
};

/**
 * Rider eligibility criteria for campaign assignment.
 * RULE-ASN-001 through RULE-ASN-006.
 */
export interface EligibilityCriteria {
  /** Rider must be in AVAILABLE status (RULE-RDR-005) */
  isAvailable: boolean;
  /** Rider zone must overlap campaign target zones (RULE-ASN-001) */
  zoneOverlap: boolean;
  /** No conflicting active assignment on same asset type (RULE-ASN-002) */
  noConflict: boolean;
  /** Rider is not suspended (RULE-RDR-004) */
  notSuspended: boolean;
  /** All required documents are valid */
  documentsValid: boolean;
}

/**
 * Eligible rider result with scoring for matching.
 */
export interface EligibleRider {
  riderId: string;
  fullName: string | null;
  zoneId: string | null;
  reliabilityScore: number;
  totalCampaigns: number;
  eligible: boolean;
  criteria: EligibilityCriteria;
}
