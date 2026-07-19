import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '@soloadvertiser/types';

/**
 * Socket.IO WebSocket gateway with JWT authentication.
 *
 * Namespaces:
 * - /notifications — real-time notification delivery
 * - /config — configuration change broadcasts
 * - /campaigns — campaign status updates
 * - /admin — admin dashboard real-time data
 *
 * Room management:
 * - user:{userId} — per-user room for targeted messages
 * - role:{role} — per-role room for role-based broadcasts
 * - campaign:{id} — campaign-specific updates
 */
@WebSocketGateway({
  cors: {
    origin: process.env['CORS_ORIGINS']?.split(',') || ['http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  },
  namespace: /\/(notifications|config|campaigns|admin)/,
  transports: ['websocket', 'polling'],
})
export class WebSocketAppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketAppGateway.name);
  private readonly connectedClients = new Map<string, { userId: string; role: string; socketId: string }>();

  constructor(private readonly jwtService: JwtService) {}

  afterInit(_server: Server): void {
    this.logger.log('WebSocket Gateway initialized');
  }

  /**
   * Handle new client connection.
   * Authenticates via JWT token in handshake auth or query params.
   * Auto-joins the client to user-specific and role-specific rooms.
   */
  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        client.handshake.query?.token as string;

      if (!token) {
        throw new UnauthorizedException('No authentication token provided');
      }

      const payload = this.jwtService.verify<JwtPayload>(token);

      // Store client metadata
      this.connectedClients.set(client.id, {
        userId: payload.sub,
        role: payload.role as string,
        socketId: client.id,
      });

      // Auto-join rooms based on user identity
      await client.join(`user:${payload.sub}`);
      await client.join(`role:${payload.role}`);

      // Store user data on socket for later use
      (client as any).user = payload;

      this.logger.log(
        `Client connected: ${client.id} | User: ${payload.sub} | Role: ${payload.role} | Namespace: ${client.nsp.name}`,
      );

      // Acknowledge successful connection
      client.emit('connected', {
        message: 'Successfully connected',
        userId: payload.sub,
        role: payload.role,
        namespace: client.nsp.name,
      });
    } catch (error) {
      this.logger.warn(
        `Client connection rejected: ${client.id} — ${(error as Error).message}`,
      );
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect(true);
    }
  }

  /**
   * Handle client disconnection.
   * Cleans up tracking data and logs the event.
   */
  handleDisconnect(client: Socket): void {
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      this.logger.log(
        `Client disconnected: ${client.id} | User: ${clientData.userId}`,
      );
      this.connectedClients.delete(client.id);
    } else {
      this.logger.log(`Unknown client disconnected: ${client.id}`);
    }
  }

  /**
   * Subscribe to a specific room (e.g., campaign:uuid).
   */
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ): Promise<void> {
    if (!data?.room) return;

    await client.join(data.room);
    this.logger.debug(`Client ${client.id} joined room: ${data.room}`);
    client.emit('room-joined', { room: data.room });
  }

  /**
   * Unsubscribe from a specific room.
   */
  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ): Promise<void> {
    if (!data?.room) return;

    await client.leave(data.room);
    this.logger.debug(`Client ${client.id} left room: ${data.room}`);
    client.emit('room-left', { room: data.room });
  }

  /**
   * Ping/pong for connection health checks.
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', { timestamp: Date.now() });
  }

  /**
   * Get the count of currently connected clients.
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get the server instance for use by WebSocketService.
   */
  getServer(): Server {
    return this.server;
  }
}
