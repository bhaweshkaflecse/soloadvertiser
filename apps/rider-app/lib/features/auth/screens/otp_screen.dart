// Solo Advertiser — Rider App
// SCR-RDR-003: OTP Verification Screen
// 6-digit OTP input with countdown timer and resend option
// Verifies code and navigates to onboarding or home

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/auth/auth_provider.dart';
import '../../../core/navigation/app_router.dart';

/// SCR-RDR-003: OTP Verification
/// Rider enters 6-digit code sent to their phone number
class OtpScreen extends ConsumerStatefulWidget {
  final String phone;

  const OtpScreen({super.key, required this.phone});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _otpController = TextEditingController();
  int _resendCountdown = 30;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      setState(() {
        _resendCountdown--;
        if (_resendCountdown <= 0) _canResend = true;
      });
      return _resendCountdown > 0;
    });
  }

  Future<void> _verifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.length != 6) return;

    await ref.read(authProvider.notifier).verifyOtp(widget.phone, otp);
    if (mounted) {
      context.go(AppRoutes.home);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify Phone')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Enter verification code', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text('Sent to ${widget.phone}', style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 32),
            // OTP input field
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineMedium,
              decoration: const InputDecoration(
                hintText: '000000',
                counterText: '',
              ),
              onChanged: (value) {
                if (value.length == 6) _verifyOtp();
              },
            ),
            const SizedBox(height: 24),
            // Resend option
            Center(
              child: _canResend
                  ? TextButton(
                      onPressed: () {
                        ref.read(authProvider.notifier).requestOtp(widget.phone);
                        setState(() {
                          _resendCountdown = 30;
                          _canResend = false;
                        });
                        _startCountdown();
                      },
                      child: const Text('Resend Code'),
                    )
                  : Text('Resend in ${_resendCountdown}s'),
            ),
          ],
        ),
      ),
    );
  }
}
