# Rider App (Flutter)

## Overview

The Solo Advertiser Rider App is built with Flutter and managed in a separate development workflow due to its distinct toolchain requirements (Flutter SDK, Dart, platform-specific builds).

## Architecture

```
lib/
├── main.dart                 Entry point with initialization
├── app.dart                  MaterialApp.router root widget
├── core/
│   ├── config/               Environment configuration
│   ├── api/                  Dio HTTP client + JWT interceptor
│   ├── auth/                 Auth state + secure token storage
│   ├── socket/               Socket.IO real-time client
│   ├── navigation/           GoRouter with auth guards
│   └── theme/                Colors, typography, spacing
├── features/
│   ├── auth/                 Login + OTP verification (SCR-RDR-001–003)
│   ├── onboarding/           5-step wizard (SCR-RDR-004–009)
│   ├── home/                 Dashboard + notifications (SCR-RDR-010–012)
│   ├── campaigns/            Campaign list + detail (SCR-RDR-020–021)
│   ├── earnings/             Wallet + payout history (SCR-RDR-030–031)
│   ├── profile/              Profile management (SCR-RDR-040–046)
│   └── shared/               Reusable widgets (nav, loading, errors)
└── models/                   Data models (Rider, Campaign, Assignment, etc.)
```

## Key Design Decisions

- **State Management**: Riverpod (StateNotifier + Provider)
- **Navigation**: GoRouter with declarative routing and auth guards
- **HTTP Client**: Dio with interceptors for JWT auto-refresh
- **Local Storage**: flutter_secure_storage for tokens, Hive for cache
- **Real-time**: Socket.IO for location updates and notifications
- **Maps**: Google Maps Flutter for zone selection and tracking

## Screen Inventory (23 screens)

| ID | Screen | Feature |
|---|---|---|
| SCR-RDR-001 | Splash | Auth |
| SCR-RDR-002 | Login (Phone) | Auth |
| SCR-RDR-003 | OTP Verification | Auth |
| SCR-RDR-004 | Welcome | Onboarding |
| SCR-RDR-005 | Personal Info | Onboarding |
| SCR-RDR-006 | Vehicle Details | Onboarding |
| SCR-RDR-007 | Document Upload | Onboarding |
| SCR-RDR-008 | Zone Selection | Onboarding |
| SCR-RDR-009 | Completion | Onboarding |
| SCR-RDR-010 | Home Dashboard | Home |
| SCR-RDR-011 | Notification Center | Home |
| SCR-RDR-012 | Verification Capture | Home |
| SCR-RDR-020 | Campaign List | Campaigns |
| SCR-RDR-021 | Campaign Detail | Campaigns |
| SCR-RDR-030 | Earnings Overview | Earnings |
| SCR-RDR-031 | Payout History | Earnings |
| SCR-RDR-040 | Profile | Profile |
| SCR-RDR-041 | Edit Personal Info | Profile |
| SCR-RDR-042 | Vehicle Details | Profile |
| SCR-RDR-043 | Documents | Profile |
| SCR-RDR-044 | Support | Profile |
| SCR-RDR-045 | Support Conversation | Profile |
| SCR-RDR-046 | Settings | Profile |

## Development Setup

1. Install Flutter SDK (>= 3.16.0)
2. Run `flutter doctor` to verify setup
3. Run `flutter pub get` to install dependencies
4. Run `flutter run` to launch on connected device/emulator

## Integration Points

- REST API: `@soloadvertiser/api` (NestJS backend)
- WebSocket: Real-time location tracking and notifications
- Push Notifications: Firebase Cloud Messaging
- Background Location: Platform-specific services

## Build & Deploy

- Android: Fastlane + Google Play Console
- iOS: Fastlane + App Store Connect
- CI/CD: GitHub Actions with Flutter action
