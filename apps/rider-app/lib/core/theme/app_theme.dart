// Solo Advertiser — Rider App
// Theme configuration with colors, typography, and spacing constants
// Supports light and dark modes

import 'package:flutter/material.dart';

/// Brand colors for Solo Advertiser
class AppColors {
  // Primary brand colors
  static const primary = Color(0xFF1E40AF);        // Blue 800
  static const primaryLight = Color(0xFF3B82F6);   // Blue 500
  static const primaryDark = Color(0xFF1E3A8A);    // Blue 900

  // Secondary / accent
  static const accent = Color(0xFFF59E0B);         // Amber 500
  static const accentLight = Color(0xFFFBBF24);    // Amber 400

  // Status colors
  static const success = Color(0xFF10B981);        // Emerald 500
  static const warning = Color(0xFFF59E0B);        // Amber 500
  static const error = Color(0xFFEF4444);          // Red 500
  static const info = Color(0xFF3B82F6);           // Blue 500

  // Neutral
  static const background = Color(0xFFF9FAFB);    // Gray 50
  static const surface = Color(0xFFFFFFFF);
  static const textPrimary = Color(0xFF111827);    // Gray 900
  static const textSecondary = Color(0xFF6B7280);  // Gray 500
  static const border = Color(0xFFE5E7EB);        // Gray 200
}

/// Spacing scale (in logical pixels)
class AppSpacing {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 16.0;
  static const lg = 24.0;
  static const xl = 32.0;
  static const xxl = 48.0;
}

/// Border radius constants
class AppRadius {
  static const sm = 4.0;
  static const md = 8.0;
  static const lg = 12.0;
  static const xl = 16.0;
  static const full = 100.0;
}

/// Application theme data
class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.accent,
        surface: AppColors.surface,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: AppColors.background,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardTheme(
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.lg)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
        contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primaryLight,
        secondary: AppColors.accent,
        error: AppColors.error,
      ),
    );
  }
}
