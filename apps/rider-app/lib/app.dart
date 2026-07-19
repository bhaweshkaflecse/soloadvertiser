// Solo Advertiser — Rider App
// Root application widget with MaterialApp.router configuration
// Uses GoRouter for declarative routing with auth guards

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/navigation/app_router.dart';
import 'core/theme/app_theme.dart';

/// Root application widget
/// Configures theme, routing, and global providers
class SoloRiderApp extends ConsumerWidget {
  const SoloRiderApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Solo Advertiser — Rider',
      debugShowCheckedModeBanner: false,

      // Theme configuration
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,

      // Router configuration
      routerConfig: router,

      // Global error handling
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: TextScaler.noScaling,
          ),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}

/// Provider for the GoRouter instance
/// Declared here so it can be accessed app-wide via Riverpod
final appRouterProvider = Provider<GoRouter>((ref) {
  return AppRouter.createRouter(ref);
});
