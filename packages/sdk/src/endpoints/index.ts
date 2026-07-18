/**
 * SDK Endpoint modules — Re-exports all endpoint groups
 */

export { createAuthEndpoints } from './auth';
export type { AuthTokens, UserProfile, Session, RegisterData } from './auth';

export { createRiderEndpoints } from './riders';
export type { RiderProfile, RiderDocument, RiderDashboard, SubmitDocumentData, ListRidersQuery } from './riders';

export { createBusinessEndpoints } from './businesses';
export type { BusinessProfile, ListBusinessesQuery } from './businesses';

export { createCampaignEndpoints } from './campaigns';
export type { Campaign, CreateCampaignData, CampaignPayment, ListCampaignsQuery } from './campaigns';

export { createAssignmentEndpoints } from './assignments';
export type { Assignment, Ride, ListAssignmentsQuery } from './assignments';

export { createFinanceEndpoints } from './finance';
export type { Wallet, Transaction, Payout, Escrow, LedgerQuery, PayoutBatch, CompletePayoutData } from './finance';

export { createMarketplaceEndpoints } from './marketplace';
export type { Channel, PreOrder, Enrollment, SubmitPreOrderData, SubmitEnrollmentData, CreateChannelData, ReadinessScore } from './marketplace';

export { createNotificationEndpoints } from './notifications';
export type { Notification, NotificationPreferences, ListNotificationsQuery } from './notifications';

export { createConfigEndpoints } from './config';
export type { PlatformConfig, Zone, VehicleType, CampaignType, PaymentMethod, FeatureFlag } from './config';

export { createMediaEndpoints } from './media';
export type { MediaAsset, UploadUrlResponse, UploadCompleteData } from './media';

export { createSupportEndpoints } from './support';
export type { SupportTicket, TicketMessage, CreateTicketData, ListTicketsQuery } from './support';
