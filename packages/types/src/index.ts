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
