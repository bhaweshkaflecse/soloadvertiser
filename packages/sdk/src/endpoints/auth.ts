/**
 * Authentication & session endpoints
 */

import { ApiClient } from '../client';
import { ApiResponse } from '../types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  role: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  device: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'rider' | 'business' | 'partner';
  phone?: string;
}

export function createAuthEndpoints(client: ApiClient) {
  return {
    login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
      return client.post('/auth/login', { email, password });
    },

    register(data: RegisterData): Promise<ApiResponse<AuthTokens>> {
      return client.post('/auth/register', data);
    },

    googleAuth(idToken: string, clientType: 'web' | 'mobile'): Promise<ApiResponse<AuthTokens>> {
      return client.post('/auth/google', { idToken, clientType });
    },

    refreshToken(token: string): Promise<ApiResponse<AuthTokens>> {
      return client.post('/auth/refresh', { refreshToken: token });
    },

    logout(): Promise<ApiResponse<void>> {
      return client.post('/auth/logout');
    },

    sendOtp(phone: string): Promise<ApiResponse<{ expiresAt: string }>> {
      return client.post('/auth/otp/send', { phone });
    },

    verifyOtp(phone: string, code: string): Promise<ApiResponse<AuthTokens>> {
      return client.post('/auth/otp/verify', { phone, code });
    },

    getMe(): Promise<ApiResponse<UserProfile>> {
      return client.get('/auth/me');
    },

    getSessions(): Promise<ApiResponse<Session[]>> {
      return client.get('/auth/sessions');
    },
  };
}
