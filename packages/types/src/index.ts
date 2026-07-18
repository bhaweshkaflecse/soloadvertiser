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
