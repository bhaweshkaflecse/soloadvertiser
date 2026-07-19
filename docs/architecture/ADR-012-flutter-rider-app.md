# ADR-012: Flutter for Rider Mobile App

## Status
Accepted

## Context
The rider app requires native-like performance for GPS tracking, camera access (photo verification), and push notifications. It must support both iOS and Android from a single codebase.

## Decision
We use Flutter for the rider mobile application, managed as a semi-independent project within the monorepo.

## Consequences
**Positive:**
- Single codebase for iOS and Android
- Near-native performance for GPS and camera operations
- Rich widget library for custom UI
- Hot reload for fast development iteration
- Growing ecosystem and community support

**Negative:**
- Different toolchain (Dart) from the rest of the monorepo
- Requires separate CI/CD pipeline (Flutter SDK)
- Platform-specific code needed for background location
- App store deployment adds release complexity
- Team needs Flutter/Dart expertise in addition to TypeScript
