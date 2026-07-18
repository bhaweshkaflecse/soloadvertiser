# Rider App (Flutter)

## Overview

The Solo Advertiser Rider App is built with Flutter and managed in a separate development workflow due to its distinct toolchain requirements (Flutter SDK, Dart, platform-specific builds).

## Status

**Placeholder** — Flutter project will be initialized separately.

## Development Setup

1. Install Flutter SDK (>= 3.16.0)
2. Run `flutter doctor` to verify setup
3. Clone/initialize Flutter project in this directory
4. Run `flutter pub get` followed by `flutter run`

## Architecture

- **State Management**: Riverpod
- **Navigation**: go_router
- **HTTP Client**: Dio
- **Local Storage**: Hive / SharedPreferences
- **Maps**: Google Maps Flutter
- **Location**: Geolocator

## Integration Points

- REST API: `@soloadvertiser/api` (NestJS backend)
- WebSocket: Real-time ride tracking
- Push Notifications: Firebase Cloud Messaging
- Background Location: Platform-specific services

## Build & Deploy

- Android: Fastlane + Google Play Console
- iOS: Fastlane + App Store Connect
- CI/CD: GitHub Actions with Flutter action
