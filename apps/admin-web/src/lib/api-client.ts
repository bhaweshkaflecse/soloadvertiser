/**
 * Admin Panel — API Client
 * Configured with SDK for authenticated admin requests with automatic token refresh.
 */

import { createApiClient, ApiClient } from '@soloadvertiser/sdk';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
const TOKEN_KEY = 'admin_access_token';
const REFRESH_KEY = 'admin_refresh_token';

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
 * Creates an authenticated SDK client for the admin panel.
 * Reads tokens from localStorage and persists refreshed tokens automatically.
 */
export function createAdminClient(): ApiClient {
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
 * Singleton client instance for use across the admin app.
 * Re-initialize after login to inject new tokens.
 */
let _client: ApiClient | null = null;

export function getAdminClient(): ApiClient {
  if (!_client) {
    _client = createAdminClient();
  }
  return _client;
}

export function resetAdminClient(): void {
  _client = null;
}

/**
 * Set tokens after successful login and reinitialize client.
 */
export function setAdminAuth(accessToken: string, refreshToken: string): void {
  storeTokens(accessToken, refreshToken);
  _client = createAdminClient();
}

/**
 * Clear auth state and redirect to login.
 */
export function clearAdminAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  _client = null;
  window.location.href = '/login';
}

// Re-export types for convenience
export type { ApiResponse, PaginatedResponse, ApiClientConfig } from '@soloadvertiser/sdk';
export { ApiError, TokenExpiredError } from '@soloadvertiser/sdk';
