'use client';

import { useCallback, useEffect, useRef } from 'react';
import { getSocketClient } from '@/lib/socket-client';

/**
 * Hook for Socket.IO real-time connection.
 * Manages connection lifecycle and event subscription.
 */
export function useSocket(event: string, handler: (data: unknown) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocketClient();
    socket.connect();

    const wrappedHandler = (data: unknown) => handlerRef.current(data);
    socket.on(event, wrappedHandler);

    return () => {
      socket.off(event, wrappedHandler);
    };
  }, [event]);
}

/**
 * Hook to emit socket events.
 */
export function useSocketEmit() {
  const emit = useCallback((event: string, data?: unknown) => {
    const socket = getSocketClient();
    socket.emit(event, data);
  }, []);

  return { emit };
}
