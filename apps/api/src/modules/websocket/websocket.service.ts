import { Injectable, Logger } from '@nestjs/common';
import { WebSocketAppGateway } from './websocket.gateway';

/**
 * Service for emitting WebSocket events to users, rooms, and roles.
 * Used by other modules to push real-time updates without directly coupling to the gateway.
 */
@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);

  constructor(private readonly gateway: WebSocketAppGateway) {}

  /**
   * Emit an event to a specific user by userId.
   * The user is auto-joined to room `user:{userId}` on connection.
   *
   * @param userId - Target user's ID
   * @param event - Event name
   * @param data - Payload to send
   */
  emitToUser(userId: string, event: string, data: any): void {
    const room = `user:${userId}`;
    this.gateway.getServer().to(room).emit(event, {
      ...data,
      _meta: { timestamp: new Date().toISOString(), target: 'user', userId },
    });
    this.logger.debug(`Emitted "${event}" to user:${userId}`);
  }

  /**
   * Emit an event to a specific room.
   * Rooms can be campaign-specific, zone-specific, etc.
   *
   * @param room - Room name (e.g., 'campaign:uuid', 'zone:uuid')
   * @param event - Event name
   * @param data - Payload to send
   */
  emitToRoom(room: string, event: string, data: any): void {
    this.gateway.getServer().to(room).emit(event, {
      ...data,
      _meta: { timestamp: new Date().toISOString(), target: 'room', room },
    });
    this.logger.debug(`Emitted "${event}" to room:${room}`);
  }

  /**
   * Emit an event to all users with a specific role.
   * Users are auto-joined to room `role:{role}` on connection.
   *
   * @param role - Target role (e.g., 'ADMIN', 'OPERATIONS_STAFF', 'RIDER')
   * @param event - Event name
   * @param data - Payload to send
   */
  emitToRole(role: string, event: string, data: any): void {
    const room = `role:${role}`;
    this.gateway.getServer().to(room).emit(event, {
      ...data,
      _meta: { timestamp: new Date().toISOString(), target: 'role', role },
    });
    this.logger.debug(`Emitted "${event}" to role:${role}`);
  }

  /**
   * Broadcast a configuration change to all connected clients.
   * Emits to the /config namespace via the 'config:changed' event.
   *
   * @param key - Configuration key that changed
   * @param value - New configuration value
   */
  broadcastConfigChange(key: string, value: any): void {
    this.gateway.getServer().emit('config:changed', {
      key,
      value,
      _meta: { timestamp: new Date().toISOString(), target: 'broadcast' },
    });
    this.logger.log(`Broadcast config change: ${key}`);
  }

  /**
   * Broadcast an event to ALL connected clients across all namespaces.
   *
   * @param event - Event name
   * @param data - Payload to send
   */
  broadcast(event: string, data: any): void {
    this.gateway.getServer().emit(event, {
      ...data,
      _meta: { timestamp: new Date().toISOString(), target: 'broadcast' },
    });
    this.logger.debug(`Broadcast "${event}" to all clients`);
  }

  /**
   * Get the number of currently connected WebSocket clients.
   */
  getConnectedCount(): number {
    return this.gateway.getConnectedClientsCount();
  }
}
