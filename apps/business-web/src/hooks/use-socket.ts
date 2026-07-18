// Solo Advertiser — Business Portal
// Socket.IO hook for real-time event subscriptions
// Auto-connects on mount and cleans up on unmount

'use client';

import { useEffect, useCallback } from 'react';
import socketClient from '@/lib/socket-client';

/**
 * Hook for subscribing to real-time socket events
 * Automatically connects and disconnects with component lifecycle
 */
export function useSocket(event: string, callback: (data: unknown) => void) {
  useEffect(() => {
    socketClient.connect();
    socketClient.on(event, callback);

    return () => {
      socketClient.off(event, callback);
    };
  }, [event, callback]);

  const emit = useCallback((emitEvent: string, data?: unknown) => {
    socketClient.emit(emitEvent, data);
  }, []);

  return { emit };
}
