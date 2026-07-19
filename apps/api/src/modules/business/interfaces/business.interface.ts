import { BusinessStatus } from '@soloadvertiser/types';

/**
 * Valid state transitions for the business lifecycle state machine.
 * Key: current status, Value: array of valid target statuses.
 */
export const VALID_TRANSITIONS: Record<BusinessStatus, BusinessStatus[]> = {
  [BusinessStatus.REGISTERED]: [BusinessStatus.DOCUMENTS_PENDING],
  [BusinessStatus.DOCUMENTS_PENDING]: [BusinessStatus.UNDER_REVIEW, BusinessStatus.SUSPENDED],
  [BusinessStatus.UNDER_REVIEW]: [
    BusinessStatus.VERIFIED,
    BusinessStatus.DOCUMENTS_PENDING,
    BusinessStatus.SUSPENDED,
  ],
  [BusinessStatus.VERIFIED]: [BusinessStatus.ACTIVE, BusinessStatus.SUSPENDED],
  [BusinessStatus.ACTIVE]: [BusinessStatus.SUSPENDED],
  [BusinessStatus.SUSPENDED]: [BusinessStatus.VERIFIED, BusinessStatus.BLACKLISTED],
  [BusinessStatus.BLACKLISTED]: [], // Terminal state — no transitions allowed
};

/**
 * Required document types for business verification.
 * RULE-BIZ-002: PAN/VAT Certificate, Business Registration Certificate, Authorized Representative ID
 */
export const REQUIRED_DOCUMENT_TYPES = [
  'pan_vat_certificate',
  'business_registration_certificate',
  'authorized_representative_id',
] as const;

export type RequiredDocumentType = (typeof REQUIRED_DOCUMENT_TYPES)[number];
