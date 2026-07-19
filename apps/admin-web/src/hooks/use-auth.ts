'use client';

import { useCallback, useEffect, useState } from 'react';
import type { StaffRole, StaffUser } from '@/types';

interface AuthState {
  user: StaffUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Mock user for development — real implementation uses JWT from API
const MOCK_USER: StaffUser = {
  id: 'staff-001',
  email: 'admin@soloadvertiser.com',
  name: 'Admin User',
  role: 'super_admin',
  lastLogin: new Date().toISOString(),
};

export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: StaffRole[] | 'all') => boolean;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Simulate auth check
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (token) {
      setState({ user: MOCK_USER, isLoading: false, isAuthenticated: true });
    } else {
      // Auto-login with mock for development
      setState({ user: MOCK_USER, isLoading: false, isAuthenticated: true });
    }
  }, []);

  const login = useCallback(async (_email: string, _password: string) => {
    // Placeholder: would call auth API
    localStorage.setItem('admin_token', 'mock-jwt-token');
    setState({ user: MOCK_USER, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const hasRole = useCallback(
    (roles: StaffRole[] | 'all') => {
      if (!state.user) return false;
      if (roles === 'all') return true;
      return roles.includes(state.user.role);
    },
    [state.user]
  );

  return { ...state, login, logout, hasRole };
}
