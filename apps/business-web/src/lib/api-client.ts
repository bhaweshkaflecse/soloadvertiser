/**
 * Business Portal — API Client
 * Configured with SDK for authenticated business requests with automatic token refresh.
 */

import { createApiClient, ApiClient } from '@soloadvertiser/sdk';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

function getStoredToken(key: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem(key) || undefined;
}

function storeTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

/**
 * Creates an authenticated SDK client for the business portal.
 * Reads tokens from localStorage and persists refreshed tokens automatically.
 */
export function createBusinessClient(): ApiClient {
  return createApiClient({
    baseUrl: API_BASE_URL,
    accessToken: getStoredToken(TOKEN_KEY),
    refreshToken: getStoredToken(REFRESH_KEY),
    onTokenRefresh: ({ accessToken, refreshToken }) => {
      storeTokens(accessToken, refreshToken);
    },
  });
}

/**
 * Singleton client instance for use across the business portal.
 * Re-initialize after login to inject new tokens.
 */
let _client: ApiClient | null = null;

export function getBusinessClient(): ApiClient {
  if (!_client) {
    _client = createBusinessClient();
  }
  return _client;
}

export function resetBusinessClient(): void {
  _client = null;
}

/**
 * Set tokens after successful login and reinitialize client.
 */
export function setBusinessAuth(accessToken: string, refreshToken: string): void {
  storeTokens(accessToken, refreshToken);
  _client = createBusinessClient();
}

/**
 * Clear auth state and redirect to login.
 */
export function clearBusinessAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  _client = null;
  window.location.href = '/login';
}

// Re-export types for convenience
export type { ApiResponse, PaginatedResponse, ApiClientConfig } from '@soloadvertiser/sdk';
export { ApiError, TokenExpiredError } from '@soloadvertiser/sdk';
