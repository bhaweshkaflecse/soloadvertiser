// Solo Advertiser — Rider App
// Socket.IO client for real-time communication
// Handles connection, reconnection, and event subscriptions

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../config/app_config.dart';
import '../auth/token_storage.dart';

/// Real-time socket connection manager
/// Used for: location updates, assignment notifications, chat messages
class SocketClient {
  io.Socket? _socket;
  final TokenStorage _tokenStorage;
  bool _isConnected = false;

  SocketClient({required TokenStorage tokenStorage})
      : _tokenStorage = tokenStorage;

  bool get isConnected => _isConnected;

  /// Initialize and connect to the WebSocket server
  Future<void> connect() async {
    final token = await _tokenStorage.getAccessToken();
    if (token == null) return;

    _socket = io.io(
      AppConfig.instance.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(10)
          .setReconnectionDelay(1000)
          .build(),
    );

    _socket!.onConnect((_) {
      _isConnected = true;
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
    });

    _socket!.onConnectError((error) {
      _isConnected = false;
    });
  }

  /// Subscribe to a specific event channel
  void on(String event, Function(dynamic) callback) {
    _socket?.on(event, callback);
  }

  /// Emit an event to the server
  void emit(String event, [dynamic data]) {
    _socket?.emit(event, data);
  }

  /// Emit location update to server
  void emitLocationUpdate(double lat, double lng) {
    _socket?.emit('rider:location', {'lat': lat, 'lng': lng});
  }

  /// Disconnect and clean up
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }
}

/// Riverpod provider for socket client
final socketClientProvider = Provider<SocketClient>((ref) {
  final tokenStorage = ref.watch(tokenStorageProvider);
  return SocketClient(tokenStorage: tokenStorage);
});
