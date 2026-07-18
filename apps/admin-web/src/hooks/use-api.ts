'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => void;
}

/**
 * Typed API hook wrapping fetch with loading/error states.
 * Placeholder for TanStack Query integration.
 */
export function useApi<T>(path: string, params?: Record<string, string | number | undefined>): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await api.get<T>(path, params);
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      setState({ data: null, isLoading: false, error: (err as Error).message });
    }
  }, [path, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Mutation hook for POST/PUT/PATCH/DELETE operations.
 */
export function useMutation<TInput, TOutput = unknown>(
  method: 'post' | 'put' | 'patch' | 'delete',
  path: string
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (body?: TInput): Promise<TOutput | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await (method === 'delete'
          ? api.delete<TOutput>(path)
          : api[method]<TOutput>(path, body));
        setIsLoading(false);
        return result;
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
        return null;
      }
    },
    [method, path]
  );

  return { mutate, isLoading, error };
}
