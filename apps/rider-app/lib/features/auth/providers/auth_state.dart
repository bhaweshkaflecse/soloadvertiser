// Solo Advertiser — Rider App
// Auth feature state management
// Manages login flow state (phone input, OTP verification, errors)

import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Login flow state for the auth feature screens
class LoginFlowState {
  final String phoneNumber;
  final bool otpSent;
  final bool isVerifying;
  final String? errorMessage;
  final int resendCountdown;

  const LoginFlowState({
    this.phoneNumber = '',
    this.otpSent = false,
    this.isVerifying = false,
    this.errorMessage,
    this.resendCountdown = 0,
  });

  LoginFlowState copyWith({
    String? phoneNumber,
    bool? otpSent,
    bool? isVerifying,
    String? errorMessage,
    int? resendCountdown,
  }) {
    return LoginFlowState(
      phoneNumber: phoneNumber ?? this.phoneNumber,
      otpSent: otpSent ?? this.otpSent,
      isVerifying: isVerifying ?? this.isVerifying,
      errorMessage: errorMessage,
      resendCountdown: resendCountdown ?? this.resendCountdown,
    );
  }
}

/// Provider for login flow state
final loginFlowProvider = StateProvider<LoginFlowState>((ref) {
  return const LoginFlowState();
});
