// Solo Advertiser — Business Portal
// Generic data fetching hook with loading/error states
// SWR-like pattern for API calls

'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

export function useApi<T>(path: string, params?: Record<string, string>): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await apiClient.get<T>(path, params);
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch data',
      });
    }
  }, [path, JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mutate = useCallback((data: T) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return { ...state, refetch: fetchData, mutate };
}
