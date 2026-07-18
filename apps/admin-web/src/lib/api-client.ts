/**
 * API client with auth headers for admin panel.
 * Uses placeholder fetch — real implementation will connect to the API gateway.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | undefined>;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, params } = options;
  const token = getAuthToken();

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) =>
    apiClient<T>(path, { params }),
  post: <T>(path: string, body: unknown) => apiClient<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body: unknown) => apiClient<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body: unknown) => apiClient<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => apiClient<T>(path, { method: 'DELETE' }),
};
