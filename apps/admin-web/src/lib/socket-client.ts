/**
 * Socket.IO client singleton for real-time updates.
 * Placeholder — actual implementation will use socket.io-client.
 */

type EventHandler = (data: unknown) => void;

interface SocketClient {
  connect(): void;
  disconnect(): void;
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  emit(event: string, data?: unknown): void;
  isConnected(): boolean;
}

let instance: SocketClient | null = null;

export function getSocketClient(): SocketClient {
  if (instance) return instance;

  const handlers = new Map<string, Set<EventHandler>>();
  let connected = false;

  instance = {
    connect() {
      // Placeholder: would connect to Socket.IO server
      connected = true;
      console.log('[Socket] Connected to real-time server');
    },
    disconnect() {
      connected = false;
      handlers.clear();
      console.log('[Socket] Disconnected');
    },
    on(event: string, handler: EventHandler) {
      if (!handlers.has(event)) {
        handlers.set(event, new Set());
      }
      handlers.get(event)!.add(handler);
    },
    off(event: string, handler: EventHandler) {
      handlers.get(event)?.delete(handler);
    },
    emit(event: string, data?: unknown) {
      console.log(`[Socket] Emit: ${event}`, data);
    },
    isConnected() {
      return connected;
    },
  };

  return instance;
}

// Real-time event types for the admin panel
export const SOCKET_EVENTS = {
  APPROVAL_SUBMITTED: 'approval:submitted',
  APPROVAL_UPDATED: 'approval:updated',
  PAYMENT_RECEIVED: 'payment:received',
  RIDER_STATUS_CHANGED: 'rider:status_changed',
  CAMPAIGN_UPDATED: 'campaign:updated',
  TICKET_CREATED: 'ticket:created',
  SYSTEM_ALERT: 'system:alert',
} as const;
