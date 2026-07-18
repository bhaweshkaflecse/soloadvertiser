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
 * Platform user roles.
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  BUSINESS_MANAGER = 'BUSINESS_MANAGER',
  RIDER = 'RIDER',
}

/**
 * Supported platform environments.
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';
