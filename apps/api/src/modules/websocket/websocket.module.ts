import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebSocketAppGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';

/**
 * WebSocket module providing real-time communication via Socket.IO.
 * Supports namespaces: /notifications, /config, /campaigns, /admin
 * All connections require JWT authentication via handshake.
 */
@Module({
  imports: [
    JwtModule.register({
      secret: process.env['JWT_SECRET'] || 'default-dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [WebSocketAppGateway, WebSocketService],
  exports: [WebSocketService],
})
export class WebSocketModule {}
