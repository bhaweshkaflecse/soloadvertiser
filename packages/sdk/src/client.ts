/**
 * Solo Advertiser SDK — API Client
 * Full-featured HTTP client with automatic token refresh and typed responses.
 */

import {
  ApiClientConfig,
  ApiResponse,
  ApiError,
  NetworkError,
  TokenExpiredError,
  RequestOptions,
} from './types';

export class ApiClient {
  private baseUrl: string;
  private accessToken: string | undefined;
  private refreshTokenValue: string | undefined;
  private onTokenRefresh: ApiClientConfig['onTokenRefresh'];
  private timeout: number;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.accessToken = config.accessToken;
    this.refreshTokenValue = config.refreshToken;
    this.onTokenRefresh = config.onTokenRefresh;
    this.timeout = config.timeout || 30000;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  setRefreshToken(token: string): void {
    this.refreshTokenValue = token;
  }

  clearTokens(): void {
    this.accessToken = undefined;
    this.refreshTokenValue = undefined;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, options);
  }

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, body, options);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, options);
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, options?.params);
    const headers = this.buildHeaders(options?.headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const signal = options?.signal || controller.signal;

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 — attempt token refresh
      if (response.status === 401 && this.refreshTokenValue) {
        const refreshed = await this.handleTokenRefresh();
        if (refreshed) {
          // Retry the original request with new token
          return this.request<T>(method, path, body, options);
        }
        throw new TokenExpiredError();
      }

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        const errorBody = responseBody as { code?: string; message?: string; details?: Record<string, unknown> } | null;
        throw new ApiError(
          response.status,
          errorBody?.code || `HTTP_${response.status}`,
          errorBody?.message || `Request failed with status ${response.status}`,
          errorBody?.details,
        );
      }

      // Parse envelope response
      if (responseBody && typeof responseBody === 'object' && 'success' in responseBody) {
        return responseBody as ApiResponse<T>;
      }

      // Wrap raw response in envelope
      return {
        success: true,
        data: responseBody as T,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError || error instanceof TokenExpiredError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new NetworkError('Request timed out');
      }

      throw new NetworkError(
        error instanceof Error ? error.message : 'Network request failed',
        error,
      );
    }
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    if (extra) {
      Object.assign(headers, extra);
    }

    return headers;
  }

  private async handleTokenRefresh(): Promise<boolean> {
    // Prevent concurrent refresh requests
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshTokenValue }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const newAccessToken = data.data?.accessToken || data.accessToken;
      const newRefreshToken = data.data?.refreshToken || data.refreshToken;

      if (newAccessToken) {
        this.accessToken = newAccessToken;
        this.refreshTokenValue = newRefreshToken || this.refreshTokenValue;

        if (this.onTokenRefresh) {
          this.onTokenRefresh({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || this.refreshTokenValue!,
          });
        }

        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
