/**
 * Solo Advertiser — Domain Events Catalog
 *
 * Complete event registry (EVT-001 through EVT-089) covering all platform domains.
 * Events follow the pattern: domain.entity.action
 */

// ─── Core Types ─────────────────────────────────────────────────────────────

export interface EventMetadata {
  eventId: string;
  timestamp: string;
  source: string;
  version: number;
  correlationId?: string;
  userId?: string;
  traceId?: string;
}

export interface DomainEvent<T = unknown> {
  metadata: EventMetadata;
  name: string;
  data: T;
}

// ─── EventBus Abstract Class ────────────────────────────────────────────────

export abstract class EventBus {
  abstract emit<T>(event: DomainEvent<T>): Promise<void>;
  abstract on<T>(eventName: string, handler: (event: DomainEvent<T>) => Promise<void>): void;
  abstract off(eventName: string, handler?: Function): void;
}

// ─── Event Name Constants ───────────────────────────────────────────────────

/** EVT-001 to EVT-010: Identity & Authentication */
export const AUTH_EVENTS = {
  USER_REGISTERED: 'auth.user.registered',           // EVT-001
  USER_VERIFIED_EMAIL: 'auth.user.verified_email',   // EVT-002
  USER_VERIFIED_PHONE: 'auth.user.verified_phone',   // EVT-003
  USER_LOGGED_IN: 'auth.user.logged_in',             // EVT-004
  USER_LOGGED_OUT: 'auth.user.logged_out',           // EVT-005
  USER_PASSWORD_RESET: 'auth.user.password_reset',   // EVT-006
  USER_PASSWORD_CHANGED: 'auth.user.password_changed', // EVT-007
  USER_DEACTIVATED: 'auth.user.deactivated',         // EVT-008
  USER_REACTIVATED: 'auth.user.reactivated',         // EVT-009
  SESSION_REVOKED: 'auth.session.revoked',           // EVT-010
} as const;

/** EVT-011 to EVT-020: Rider Lifecycle */
export const RIDER_EVENTS = {
  PROFILE_CREATED: 'rider.profile.created',          // EVT-011
  PROFILE_UPDATED: 'rider.profile.updated',          // EVT-012
  DOCUMENT_SUBMITTED: 'rider.document.submitted',    // EVT-013
  DOCUMENT_APPROVED: 'rider.document.approved',      // EVT-014
  DOCUMENT_REJECTED: 'rider.document.rejected',      // EVT-015
  APPROVED: 'rider.status.approved',                 // EVT-016
  REJECTED: 'rider.status.rejected',                 // EVT-017
  SUSPENDED: 'rider.status.suspended',               // EVT-018
  AVAILABILITY_CHANGED: 'rider.availability.changed', // EVT-019
  ZONE_CHANGED: 'rider.zone.changed',               // EVT-020
} as const;

/** EVT-021 to EVT-030: Business Lifecycle */
export const BUSINESS_EVENTS = {
  REGISTERED: 'business.profile.registered',         // EVT-021
  PROFILE_UPDATED: 'business.profile.updated',       // EVT-022
  VERIFIED: 'business.status.verified',              // EVT-023
  SUSPENDED: 'business.status.suspended',            // EVT-024
  REACTIVATED: 'business.status.reactivated',        // EVT-025
  PLAN_CHANGED: 'business.plan.changed',             // EVT-026
  CONTACT_UPDATED: 'business.contact.updated',       // EVT-027
  LOGO_UPDATED: 'business.logo.updated',             // EVT-028
  PAYMENT_METHOD_ADDED: 'business.payment.method_added', // EVT-029
  PAYMENT_METHOD_REMOVED: 'business.payment.method_removed', // EVT-030
} as const;

/** EVT-031 to EVT-045: Campaign Lifecycle */
export const CAMPAIGN_EVENTS = {
  CREATED: 'campaign.lifecycle.created',             // EVT-031
  SUBMITTED: 'campaign.lifecycle.submitted',         // EVT-032
  PAYMENT_SUBMITTED: 'campaign.payment.submitted',   // EVT-033
  PAYMENT_VERIFIED: 'campaign.payment.verified',     // EVT-034
  PAYMENT_REJECTED: 'campaign.payment.rejected',     // EVT-035
  ACTIVATED: 'campaign.lifecycle.activated',         // EVT-036
  PAUSED: 'campaign.lifecycle.paused',               // EVT-037
  RESUMED: 'campaign.lifecycle.resumed',             // EVT-038
  COMPLETED: 'campaign.lifecycle.completed',         // EVT-039
  CANCELLED: 'campaign.lifecycle.cancelled',         // EVT-040
  EXTENDED: 'campaign.lifecycle.extended',           // EVT-041
  BUDGET_EXHAUSTED: 'campaign.budget.exhausted',     // EVT-042
  RIDERS_NEEDED: 'campaign.riders.needed',           // EVT-043
  RIDERS_FULFILLED: 'campaign.riders.fulfilled',     // EVT-044
  MEDIA_UPLOADED: 'campaign.media.uploaded',         // EVT-045
} as const;

/** EVT-046 to EVT-055: Assignment & Ride */
export const ASSIGNMENT_EVENTS = {
  OFFERED: 'assignment.lifecycle.offered',           // EVT-046
  ACCEPTED: 'assignment.lifecycle.accepted',         // EVT-047
  DECLINED: 'assignment.lifecycle.declined',         // EVT-048
  STARTED: 'assignment.lifecycle.started',           // EVT-049
  COMPLETED: 'assignment.lifecycle.completed',       // EVT-050
  CANCELLED: 'assignment.lifecycle.cancelled',       // EVT-051
  RIDE_STARTED: 'assignment.ride.started',           // EVT-052
  RIDE_COMPLETED: 'assignment.ride.completed',       // EVT-053
  RIDE_VERIFIED: 'assignment.ride.verified',         // EVT-054
  RIDE_DISPUTED: 'assignment.ride.disputed',         // EVT-055
} as const;

/** EVT-056 to EVT-068: Finance & Payments */
export const FINANCE_EVENTS = {
  ESCROW_CREATED: 'finance.escrow.created',          // EVT-056
  ESCROW_RELEASED: 'finance.escrow.released',        // EVT-057
  ESCROW_REFUNDED: 'finance.escrow.refunded',        // EVT-058
  WALLET_CREDITED: 'finance.wallet.credited',        // EVT-059
  WALLET_DEBITED: 'finance.wallet.debited',          // EVT-060
  PAYOUT_REQUESTED: 'finance.payout.requested',      // EVT-061
  PAYOUT_APPROVED: 'finance.payout.approved',        // EVT-062
  PAYOUT_PROCESSING: 'finance.payout.processing',    // EVT-063
  PAYOUT_COMPLETED: 'finance.payout.completed',      // EVT-064
  PAYOUT_FAILED: 'finance.payout.failed',            // EVT-065
  BATCH_CREATED: 'finance.batch.created',            // EVT-066
  BATCH_APPROVED: 'finance.batch.approved',          // EVT-067
  COMMISSION_COLLECTED: 'finance.commission.collected', // EVT-068
} as const;

/** EVT-069 to EVT-075: Notifications */
export const NOTIFICATION_EVENTS = {
  PUSH_SENT: 'notification.push.sent',              // EVT-069
  EMAIL_SENT: 'notification.email.sent',            // EVT-070
  SMS_SENT: 'notification.sms.sent',                // EVT-071
  IN_APP_CREATED: 'notification.in_app.created',    // EVT-072
  PREFERENCES_UPDATED: 'notification.preferences.updated', // EVT-073
  BULK_SENT: 'notification.bulk.sent',              // EVT-074
  DELIVERY_FAILED: 'notification.delivery.failed',  // EVT-075
} as const;

/** EVT-076 to EVT-082: Marketplace */
export const MARKETPLACE_EVENTS = {
  CHANNEL_CREATED: 'marketplace.channel.created',    // EVT-076
  CHANNEL_ACTIVATED: 'marketplace.channel.activated', // EVT-077
  CHANNEL_PAUSED: 'marketplace.channel.paused',      // EVT-078
  PRE_ORDER_SUBMITTED: 'marketplace.preorder.submitted', // EVT-079
  PRE_ORDER_CONFIRMED: 'marketplace.preorder.confirmed', // EVT-080
  PRE_ORDER_CANCELLED: 'marketplace.preorder.cancelled', // EVT-081
  ENROLLMENT_SUBMITTED: 'marketplace.enrollment.submitted', // EVT-082
} as const;

/** EVT-083 to EVT-089: Platform & Admin */
export const PLATFORM_EVENTS = {
  CONFIG_UPDATED: 'platform.config.updated',         // EVT-083
  FEATURE_FLAG_TOGGLED: 'platform.feature.toggled',  // EVT-084
  ZONE_CREATED: 'platform.zone.created',             // EVT-085
  ZONE_UPDATED: 'platform.zone.updated',             // EVT-086
  SUPPORT_TICKET_CREATED: 'platform.support.ticket_created', // EVT-087
  SUPPORT_TICKET_RESOLVED: 'platform.support.ticket_resolved', // EVT-088
  SYSTEM_ALERT: 'platform.system.alert',             // EVT-089
} as const;

/** Aggregated event names for convenience */
export const EVENT_NAMES = {
  AUTH: AUTH_EVENTS,
  RIDER: RIDER_EVENTS,
  BUSINESS: BUSINESS_EVENTS,
  CAMPAIGN: CAMPAIGN_EVENTS,
  ASSIGNMENT: ASSIGNMENT_EVENTS,
  FINANCE: FINANCE_EVENTS,
  NOTIFICATION: NOTIFICATION_EVENTS,
  MARKETPLACE: MARKETPLACE_EVENTS,
  PLATFORM: PLATFORM_EVENTS,
} as const;

// ─── Event Payload Interfaces ───────────────────────────────────────────────

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  role: string;
  provider: 'email' | 'google' | 'phone';
}

export interface UserVerifiedPayload {
  userId: string;
  method: 'email' | 'phone';
  verifiedAt: string;
}

export interface RiderDocumentPayload {
  riderId: string;
  documentId: string;
  type: string;
  status: string;
  reason?: string;
}

export interface RiderStatusPayload {
  riderId: string;
  previousStatus: string;
  newStatus: string;
  reason?: string;
  adminId?: string;
}

export interface CampaignCreatedPayload {
  campaignId: string;
  businessId: string;
  title: string;
  type: string;
  budget: number;
  zones: string[];
}

export interface CampaignStatusPayload {
  campaignId: string;
  previousStatus: string;
  newStatus: string;
  reason?: string;
}

export interface CampaignPaymentPayload {
  campaignId: string;
  amount: number;
  method: string;
  reference: string;
  status: string;
}

export interface AssignmentPayload {
  assignmentId: string;
  campaignId: string;
  riderId: string;
  status: string;
}

export interface RidePayload {
  rideId: string;
  assignmentId: string;
  riderId: string;
  distanceKm?: number;
  impressions?: number;
  verificationMethod?: string;
}

export interface EscrowPayload {
  escrowId: string;
  campaignId: string;
  amount: number;
  status: string;
}

export interface WalletPayload {
  walletId: string;
  userId: string;
  amount: number;
  type: string;
  reference: string;
}

export interface PayoutPayload {
  payoutId: string;
  riderId: string;
  amount: number;
  method: string;
  status: string;
  reference?: string;
}

export interface NotificationPayload {
  notificationId: string;
  userId: string;
  channel: string;
  type: string;
  title: string;
}

export interface ChannelPayload {
  channelId: string;
  name: string;
  partnerId: string;
  status: string;
}

export interface PreOrderPayload {
  preOrderId: string;
  channelId: string;
  businessId: string;
  quantity: number;
  status: string;
}

export interface PlatformConfigPayload {
  key: string;
  previousValue: unknown;
  newValue: unknown;
  updatedBy: string;
}

export interface SupportTicketPayload {
  ticketId: string;
  userId: string;
  subject: string;
  category: string;
  status: string;
}
