/**
 * Partner module interfaces — CTX-016
 * Partner categories, enrollment fields, and status values.
 */

/**
 * Partner enrollment status values.
 */
export enum PartnerEnrollmentStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

/**
 * Pre-defined partner category codes (PC-001 through PC-016).
 */
export const PARTNER_CATEGORIES = [
  { code: 'PC-001', name: 'Helmet Rider', superCategory: 'physical' },
  { code: 'PC-002', name: 'Taxi Driver', superCategory: 'physical' },
  { code: 'PC-003', name: 'Ride Sharing Driver', superCategory: 'physical' },
  { code: 'PC-004', name: 'Bus Operator', superCategory: 'physical' },
  { code: 'PC-005', name: 'Property Owner', superCategory: 'physical' },
  { code: 'PC-006', name: 'Wall Owner', superCategory: 'physical' },
  { code: 'PC-007', name: 'Influencer', superCategory: 'digital' },
  { code: 'PC-008', name: 'YouTuber', superCategory: 'digital' },
  { code: 'PC-009', name: 'Blogger', superCategory: 'digital' },
  { code: 'PC-010', name: 'Instagram Creator', superCategory: 'digital' },
  { code: 'PC-011', name: 'TikTok Creator', superCategory: 'digital' },
  { code: 'PC-012', name: 'Facebook Page', superCategory: 'digital' },
  { code: 'PC-013', name: 'Delivery Rider', superCategory: 'physical' },
  { code: 'PC-014', name: 'Corporate Employee', superCategory: 'physical' },
  { code: 'PC-015', name: 'College Ambassador', superCategory: 'physical' },
  { code: 'PC-016', name: 'Event Volunteer', superCategory: 'physical' },
] as const;

/**
 * Valid enrollment status transitions.
 */
export const ENROLLMENT_TRANSITIONS: Record<string, string[]> = {
  submitted: ['under_review', 'withdrawn'],
  under_review: ['approved', 'rejected'],
  approved: [],
  rejected: [],
  withdrawn: [],
};
