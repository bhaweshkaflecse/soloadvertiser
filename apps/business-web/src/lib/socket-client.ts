// Solo Advertiser — Business Portal
// Socket.IO client for real-time updates
// Handles campaign status updates and notification delivery

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001';

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  connect(): void {
    if (this.socket?.connected) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    // Re-register existing listeners on reconnect
    this.socket.on('connect', () => {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((cb) => this.socket?.on(event, cb));
      });
    });
  }

  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (data: unknown) => void): void {
    this.listeners.get(event)?.delete(callback);
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: unknown): void {
    this.socket?.emit(event, data);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }
}

export const socketClient = new SocketClient();
export default socketClient;
