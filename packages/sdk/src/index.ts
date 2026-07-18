/**
 * Solo Advertiser SDK — Typed API Client
 *
 * Full-featured HTTP client for interacting with the Solo Advertiser platform API.
 * Includes automatic token refresh, typed responses, and comprehensive endpoint coverage.
 */

export { ApiClient, createApiClient } from './client';
export type { ApiClientConfig, ApiResponse, PaginatedResponse, RequestOptions } from './types';
export { ApiError, NetworkError, TokenExpiredError } from './types';
export * from './endpoints';
