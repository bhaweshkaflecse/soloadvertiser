// Solo Advertiser — Rider App
// SCR-RDR-001: Splash Screen
// Shows app logo and loading indicator while checking auth state
// Auto-navigates to login or home based on stored tokens

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/auth/auth_provider.dart';
import '../../../core/navigation/app_router.dart';

/// SCR-RDR-001: Splash / Loading Screen
/// Displayed on app launch while authentication state is determined
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;

    final auth = ref.read(authProvider);
    if (auth.isAuthenticated) {
      context.go(AppRoutes.home);
    } else {
      context.go(AppRoutes.login);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // App logo placeholder
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor,
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(Icons.directions_car, size: 60, color: Colors.white),
            ),
            const SizedBox(height: 24),
            Text('Solo Advertiser', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text('Rider', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 48),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
