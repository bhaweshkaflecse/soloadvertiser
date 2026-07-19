// Solo Advertiser — Rider App
// Secure token storage using flutter_secure_storage
// Stores JWT access and refresh tokens

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Secure token storage wrapper
/// Uses platform keychain (iOS) / keystore (Android) for sensitive data
class TokenStorage {
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';

  final FlutterSecureStorage _storage;

  TokenStorage()
      : _storage = const FlutterSecureStorage(
          aOptions: AndroidOptions(encryptedSharedPreferences: true),
          iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
        );

  /// Save both tokens after login or refresh
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: accessToken),
      _storage.write(key: _refreshTokenKey, value: refreshToken),
    ]);
  }

  /// Get stored access token (null if not logged in)
  Future<String?> getAccessToken() async {
    return _storage.read(key: _accessTokenKey);
  }

  /// Get stored refresh token
  Future<String?> getRefreshToken() async {
    return _storage.read(key: _refreshTokenKey);
  }

  /// Clear all tokens on logout
  Future<void> clearTokens() async {
    await _storage.deleteAll();
  }

  /// Check if tokens exist (quick auth check without decoding)
  Future<bool> hasTokens() async {
    final token = await _storage.read(key: _accessTokenKey);
    return token != null;
  }
}

/// Riverpod provider for token storage
final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage();
});
