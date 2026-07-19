/**
 * Base entity interface for all domain entities.
 */
export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Soft-deletable entity extension.
 */
export interface SoftDeletable {
  deletedAt: Date | null;
}

/**
 * Standard paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Standard API success response.
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
  requestId?: string;
}

/**
 * Standard API error response.
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
  requestId?: string;
}

/**
 * Platform user roles — aligned with Prisma schema.
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OPERATIONS_STAFF = 'OPERATIONS_STAFF',
  FINANCE_STAFF = 'FINANCE_STAFF',
  BUSINESS = 'BUSINESS',
  RIDER = 'RIDER',
}

/**
 * User account status.
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

/**
 * Supported platform environments.
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

// === IDENTITY / AUTH TYPES ===

/**
 * JWT access + refresh token pair returned on login/register.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
}

/**
 * Payload encoded inside JWT access token.
 */
export interface JwtPayload {
  sub: string; // user id
  email?: string;
  phone?: string;
  role: Role;
  sessionId: string;
  iat?: number;
  exp?: number;
}

/**
 * Session information for session management endpoints.
 */
export interface SessionInfo {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

// === CONFIGURATION TYPES ===

/**
 * Platform configuration entry.
 */
export interface ConfigEntryType {
  id: string;
  key: string;
  value: unknown;
  category: string;
  description: string | null;
  dataType: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Feature flag for enabling/disabling platform features.
 */
export interface FeatureFlagType {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dictionary item for dropdown / reference data.
 */
export interface DictionaryItemType {
  id: string;
  dictionary: string;
  code: string;
  label: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  metadata: unknown;
  regionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// === MEDIA TYPES ===

/**
 * Uploaded media asset metadata.
 */
export interface MediaAssetType {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  bucket: string;
  key: string;
  url: string | null;
  entityType: string | null;
  entityId: string | null;
  uploadedBy: string;
  createdAt: Date;
  deletedAt: Date | null;
}


// === RIDER TYPES (CTX-002) ===

/**
 * Rider lifecycle status — state machine for rider onboarding and operations.
 */
export enum RiderStatus {
  PRE_REGISTERED = 'PRE_REGISTERED',
  DOCUMENTS_PENDING = 'DOCUMENTS_PENDING',
  VERIFICATION_PENDING = 'VERIFICATION_PENDING',
  APPROVED = 'APPROVED',
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  CAMPAIGN_ACTIVE = 'CAMPAIGN_ACTIVE',
  UNAVAILABLE = 'UNAVAILABLE',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Document review status for rider documents.
 */
export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  REPLACEMENT_REQUIRED = 'REPLACEMENT_REQUIRED',
}

/**
 * Rider profile information.
 */
export interface RiderProfile {
  id: string;
  userId: string;
  status: RiderStatus;
  fullName: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  profilePhotoId: string | null;
  zoneId: string | null;
  regionId: string | null;
  reliabilityScore: number;
  totalCampaigns: number;
  totalEarnings: number;
  suspensionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rider vehicle details.
 */
export interface RiderVehicleType {
  id: string;
  riderId: string;
  vehicleType: string;
  registrationNumber: string;
  color: string | null;
  makeModel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rider document metadata.
 */
export interface RiderDocumentType {
  id: string;
  riderId: string;
  documentType: string;
  mediaId: string;
  status: DocumentStatus;
  rejectionReason: string | null;
  expiryDate: Date | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rider advertising asset (e.g., helmet surface).
 */
export interface RiderAssetType {
  id: string;
  riderId: string;
  assetType: string;
  description: string | null;
  isVerified: boolean;
  mediaId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 5-component reliability score with weighted composite.
 */
export interface ReliabilityScoreType {
  id: string;
  riderId: string;
  verification: number;
  attendance: number;
  activity: number;
  completion: number;
  response: number;
  compositeScore: number;
  computedAt: Date;
}

/**
 * Rider status transition history record.
 */
export interface RiderStatusHistoryType {
  id: string;
  riderId: string;
  fromStatus: RiderStatus;
  toStatus: RiderStatus;
  reason: string | null;
  changedBy: string | null;
  createdAt: Date;
}

/**
 * Rider dashboard aggregation response.
 */
export interface RiderDashboard {
  rider: RiderProfile;
  vehicle: RiderVehicleType | null;
  documentsCount: number;
  pendingDocuments: number;
  reliabilityScore: ReliabilityScoreType | null;
  activeCampaign: null; // Sprint 4 — placeholder
}



// === BUSINESS TYPES (CTX-003) ===

/**
 * Business lifecycle status — state machine for business onboarding and operations.
 */
export enum BusinessStatus {
  REGISTERED = 'REGISTERED',
  DOCUMENTS_PENDING = 'DOCUMENTS_PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLACKLISTED = 'BLACKLISTED',
}

/**
 * Business profile information.
 */
export interface BusinessProfile {
  id: string;
  userId: string;
  status: BusinessStatus;
  companyName: string | null;
  legalName: string | null;
  panVatNumber: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  contactPersonName: string | null;
  contactPersonEmail: string | null;
  contactPersonPhone: string | null;
  regionId: string | null;
  zoneId: string | null;
  totalCampaigns: number;
  totalSpent: number;
  suspensionReason: string | null;
  blacklistReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Business document metadata.
 */
export interface BusinessDocumentType {
  id: string;
  businessId: string;
  documentType: string;
  mediaId: string;
  status: DocumentStatus;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Business dashboard aggregation response.
 */
export interface BusinessDashboard {
  business: {
    id: string;
    status: BusinessStatus;
    companyName: string | null;
    totalCampaigns: number;
    totalSpent: number;
  };
  documentsCount: number;
  pendingDocuments: number;
  activeCampaigns: number; // Sprint 4 — placeholder
}

/**
 * Business status transition history record.
 */
export interface BusinessStatusHistoryType {
  id: string;
  businessId: string;
  fromStatus: BusinessStatus;
  toStatus: BusinessStatus;
  reason: string | null;
  changedBy: string | null;
  createdAt: Date;
}



// === CAMPAIGN TYPES (CTX-004) ===

/**
 * Campaign lifecycle status — state machine for campaign operations.
 */
export enum CampaignStatus {
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_SUBMITTED = 'PAYMENT_SUBMITTED',
  PAYMENT_VERIFIED = 'PAYMENT_VERIFIED',
  RECRUITING_RIDERS = 'RECRUITING_RIDERS',
  READY = 'READY',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Campaign domain entity.
 */
export interface CampaignType {
  id: string;
  businessId: string;
  name: string;
  status: CampaignStatus;
  targetZones: string[];
  requiredRiders: number;
  currentAssigned: number;
  fulfillmentPct: number;
  assetType: string;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  totalCost: number;
  dailyRate: number;
  riderDailyRate: number;
  creativeMediaId: string | null;
  cancellationReason: string | null;
  pauseReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Campaign payment proof submitted by business.
 */
export interface CampaignPaymentType {
  id: string;
  campaignId: string;
  method: string;
  amount: number;
  referenceId: string;
  paymentDate: Date;
  proofMediaId: string;
  status: string;
  rejectionReason: string | null;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Campaign status transition history record.
 */
export interface CampaignStatusHistoryType {
  id: string;
  campaignId: string;
  fromStatus: CampaignStatus;
  toStatus: CampaignStatus;
  reason: string | null;
  changedBy: string | null;
  createdAt: Date;
}

// === ASSIGNMENT TYPES (CTX-005) ===

/**
 * Assignment lifecycle status — state machine for rider-campaign assignments.
 */
export enum AssignmentStatus {
  SUGGESTED = 'SUGGESTED',
  ASSIGNED = 'ASSIGNED',
  STICKER_PENDING = 'STICKER_PENDING',
  DISTRIBUTED = 'DISTRIBUTED',
  INSTALLED = 'INSTALLED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  REMOVED = 'REMOVED',
}

/**
 * Assignment domain entity — links riders to campaigns.
 */
export interface AssignmentType {
  id: string;
  campaignId: string;
  riderId: string;
  status: AssignmentStatus;
  zoneId: string | null;
  assignedBy: string | null;
  startDate: Date | null;
  endDate: Date | null;
  daysCompleted: number;
  totalEarnings: number;
  removalReason: string | null;
  removedBy: string | null;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}



// === FINANCIAL PLATFORM TYPES (CTX-007) ===

/**
 * Ledger account types — the five fundamental accounts in the platform.
 */
export enum LedgerAccountType {
  ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',
  CAMPAIGN_ESCROW = 'CAMPAIGN_ESCROW',
  PLATFORM_REVENUE = 'PLATFORM_REVENUE',
  RIDER_LIABILITY = 'RIDER_LIABILITY',
  RIDER_PAYOUT = 'RIDER_PAYOUT',
}

/**
 * Ledger entry types — double-entry bookkeeping.
 */
export enum LedgerEntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

/**
 * Ledger entry record.
 */
export interface LedgerEntryRecord {
  id: string;
  accountType: LedgerAccountType;
  entryType: LedgerEntryType;
  amount: number;
  currency: string;
  description: string;
  referenceType: string | null;
  referenceId: string | null;
  balanceAfter: number | null;
  createdAt: Date;
  createdBy: string | null;
}

/**
 * Escrow for campaign fund management.
 */
export interface EscrowType {
  id: string;
  campaignId: string;
  totalAmount: number;
  releasedAmount: number;
  refundedAmount: number;
  remainingAmount: number;
  totalDays: number;
  dailyRelease: number;
  daysReleased: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
}

/**
 * Rider wallet for tracking earnings.
 */
export interface RiderWalletType {
  id: string;
  riderId: string;
  balance: number;
  totalEarned: number;
  totalPaidOut: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Wallet transaction record.
 */
export interface WalletTransactionType {
  id: string;
  walletId: string;
  type: string;
  amount: number;
  description: string;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: Date;
}

/**
 * Payout batch for batch processing rider payments.
 */
export interface PayoutBatchType {
  id: string;
  cycleDate: Date;
  riderCount: number;
  totalAmount: number;
  status: string;
  generatedBy: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual payout item within a batch.
 */
export interface PayoutItemType {
  id: string;
  batchId: string;
  riderId: string;
  walletId: string;
  amount: number;
  method: string;
  accountDetail: string | null;
  status: string;
  proofMediaId: string | null;
  referenceId: string | null;
  completedAt: Date | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Invoice for campaign payments.
 */
export interface InvoiceType {
  id: string;
  invoiceNumber: string;
  businessId: string;
  campaignId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  issuedAt: Date;
  paidAt: Date | null;
  lineItems: Array<{ description: string; qty: number; rate: number; amount: number }>;
  createdAt: Date;
}

/**
 * Reconciliation report — balance verification and discrepancy detection.
 */
export interface ReconciliationReport {
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  accountBalances: Record<string, number>;
  escrowDiscrepancies: Array<{
    escrowId: string;
    campaignId: string;
    expectedReleased: number;
    actualReleased: number;
    difference: number;
  }>;
  walletDiscrepancies: Array<{
    walletId: string;
    riderId: string;
    storedBalance: number;
    computedBalance: number;
    difference: number;
  }>;
  generatedAt: Date;
}



// === NOTIFICATION TYPES (CTX-008) ===

/**
 * Notification entity type.
 */
export interface NotificationType {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  channel: string;
  templateId: string | null;
  deepLink: string | null;
  isRead: boolean;
  readAt: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Notification category enum for type safety.
 */
export enum NotificationCategoryEnum {
  ASSIGNMENT = 'assignment',
  VERIFICATION = 'verification',
  PAYOUT = 'payout',
  DOCUMENT = 'document',
  CAMPAIGN = 'campaign',
  SUPPORT = 'support',
  SYSTEM = 'system',
}

/**
 * Notification preference per category.
 */
export interface NotificationPreferenceType {
  id: string;
  userId: string;
  category: string;
  push: boolean;
  inApp: boolean;
}

/**
 * Notification template definition.
 */
export interface NotificationTemplateType {
  id: string;
  code: string;
  version: number;
  channel: string;
  language: string;
  title: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// === TIMELINE TYPES (CTX-011) ===

/**
 * Timeline entry entity type.
 */
export interface TimelineEntryType {
  id: string;
  entityType: string;
  entityId: string;
  eventType: string;
  title: string;
  description: string | null;
  actorId: string | null;
  actorRole: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Timeline entity types.
 */
export enum TimelineEntityTypeEnum {
  RIDER = 'rider',
  BUSINESS = 'business',
  CAMPAIGN = 'campaign',
  ASSIGNMENT = 'assignment',
}

// === ANALYTICS TYPES (CTX-014) ===

/**
 * Metric snapshot entity type.
 */
export interface MetricSnapshotType {
  id: string;
  metric: string;
  value: number;
  dimension: string | null;
  dimensionValue: string | null;
  period: string;
  periodStart: Date;
  createdAt: Date;
}

/**
 * Analytics dashboard response type.
 */
export interface AnalyticsDashboard {
  metrics: Array<{
    metric: string;
    label: string;
    value: number;
    period: string;
    periodStart: Date;
  }>;
}

/**
 * Analytics event entity type.
 */
export interface AnalyticsEventType {
  id: string;
  eventType: string;
  entityType: string | null;
  entityId: string | null;
  actorId: string | null;
  properties: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Supported analytics metric codes.
 */
export enum MetricCodeEnum {
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



// === MARKETPLACE TYPES (CTX-015) ===

/**
 * Channel Maturity Model stages.
 */
export enum ChannelMaturity {
  CMM_001_MARKET_RESEARCH = 'CMM_001_MARKET_RESEARCH',
  CMM_002_PRE_ORDER_OPEN = 'CMM_002_PRE_ORDER_OPEN',
  CMM_003_PRE_ENROLLMENT_OPEN = 'CMM_003_PRE_ENROLLMENT_OPEN',
  CMM_004_PILOT_PROGRAM = 'CMM_004_PILOT_PROGRAM',
  CMM_005_LIVE = 'CMM_005_LIVE',
  CMM_006_SCALING = 'CMM_006_SCALING',
  CMM_007_NATIONAL = 'CMM_007_NATIONAL',
  CMM_008_INTERNATIONAL = 'CMM_008_INTERNATIONAL',
}

/**
 * Advertising channel entity type.
 */
export interface AdvertisingChannelType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  superCategory: string;
  subCategory: string;
  maturityStage: ChannelMaturity;
  isPaused: boolean;
  isRetired: boolean;
  partnerCategory: string | null;
  iconUrl: string | null;
  estimatedReach: number | null;
  sortOrder: number;
  configuration: Record<string, unknown>;
  activatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Business pre-order entity type.
 */
export interface BusinessPreOrderType {
  id: string;
  businessId: string;
  channelId: string;
  estimatedBudget: number;
  preferredCity: string;
  campaignDuration: string;
  expectedLaunch: string;
  campaignObjectives: string[];
  preferredStartDate: Date | null;
  additionalNotes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt: Date | null;
}

/**
 * Partner enrollment entity type.
 */
export interface PartnerEnrollmentType {
  id: string;
  userId: string;
  partnerCategoryCode: string;
  channelId: string;
  platform: string | null;
  platformUrl: string | null;
  followersCount: number | null;
  monthlyReach: number | null;
  engagementRate: number | null;
  contentNiche: string | null;
  assetPhotos: string[];
  locationCity: string | null;
  locationZone: string | null;
  availability: Record<string, unknown> | null;
  expectedRate: number | null;
  additionalData: Record<string, unknown>;
  status: string;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Partner category entity type.
 */
export interface PartnerCategoryType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  superCategory: string;
  channelsServed: string[];
  enrollmentFields: Record<string, unknown>;
  verificationMethod: string;
  isActive: boolean;
  minRequirements: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Distribution center entity type.
 */
export interface DistributionCenterType {
  id: string;
  name: string;
  type: string;
  regionId: string;
  zoneId: string;
  wardId: string | null;
  address: string;
  gpsLat: number | null;
  gpsLng: number | null;
  supportedChannels: string[];
  operatingHours: Record<string, unknown>;
  capacityPerHour: number;
  contactPhone: string | null;
  managerUserId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Print partner entity type.
 */
export interface PrintPartnerType {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string;
  email: string | null;
  regionId: string;
  zoneId: string;
  gpsLat: number | null;
  gpsLng: number | null;
  supportedChannels: string[];
  capabilities: string[];
  maxDailyCapacity: number;
  workingHours: Record<string, unknown>;
  leadTimeDays: number;
  qualityRating: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Channel readiness score type.
 */
export interface ChannelReadiness {
  channelId: string;
  channelCode: string;
  supply: { count: number; pct: number };
  demand: { count: number; pct: number };
  coverage: { cities: number; pct: number };
  operational: { pct: number };
  infrastructure: { pct: number };
  composite: number;
  recommended: boolean;
}
