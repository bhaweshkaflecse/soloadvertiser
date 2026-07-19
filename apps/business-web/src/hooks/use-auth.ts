// Solo Advertiser — Business Portal
// Authentication hook for managing user session
// Provides login, logout, and auth state

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthState } from '@/types';
import apiClient from '@/lib/api-client';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setState({ ...initialState, isLoading: false });
    }
  }, []);

  const fetchUser = async () => {
    try {
      const user = await apiClient.get<User>('/auth/me');
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setState({ ...initialState, isLoading: false });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>(
        '/auth/login',
        { email, password }
      );
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      setState({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
      router.push('/dashboard');
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Login failed',
      }));
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setState({ ...initialState, isLoading: false });
    router.push('/login');
  }, [router]);

  return { ...state, login, logout, fetchUser };
}
