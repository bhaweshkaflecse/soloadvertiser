// Solo Advertiser — Rider App
// Global auth state management provider
// Handles login, logout, and auth state changes

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'token_storage.dart';
import '../../models/rider.dart';

/// Authentication state enum
enum AuthStatus { initial, authenticated, unauthenticated, loading }

/// Auth state holds current user and authentication status
class AuthState {
  final AuthStatus status;
  final Rider? rider;
  final String? error;

  const AuthState({
    this.status = AuthStatus.initial,
    this.rider,
    this.error,
  });

  AuthState copyWith({
    AuthStatus? status,
    Rider? rider,
    String? error,
  }) {
    return AuthState(
      status: status ?? this.status,
      rider: rider ?? this.rider,
      error: error ?? this.error,
    );
  }

  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isLoading => status == AuthStatus.loading;
}

/// Auth state notifier managing authentication lifecycle
class AuthNotifier extends StateNotifier<AuthState> {
  final TokenStorage _tokenStorage;

  AuthNotifier({required TokenStorage tokenStorage})
      : _tokenStorage = tokenStorage,
        super(const AuthState()) {
    _checkAuthStatus();
  }

  /// Check stored tokens on app start
  Future<void> _checkAuthStatus() async {
    final token = await _tokenStorage.getAccessToken();
    if (token != null) {
      state = state.copyWith(status: AuthStatus.authenticated);
      // TODO: Fetch rider profile from API
    } else {
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  /// Request OTP for phone number login
  Future<void> requestOtp(String phoneNumber) async {
    state = state.copyWith(status: AuthStatus.loading);
    // TODO: Call API to send OTP
  }

  /// Verify OTP and complete login
  Future<void> verifyOtp(String phoneNumber, String otp) async {
    state = state.copyWith(status: AuthStatus.loading);
    // TODO: Call API to verify OTP, receive tokens, store them
  }

  /// Logout and clear stored tokens
  Future<void> logout() async {
    await _tokenStorage.clearTokens();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

/// Riverpod provider for auth state
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final tokenStorage = ref.watch(tokenStorageProvider);
  return AuthNotifier(tokenStorage: tokenStorage);
});
