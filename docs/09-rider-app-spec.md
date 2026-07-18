# Document 09 - Rider App Specification

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every screen, navigation path, interaction, data flow, and behavior defined in this document is the AUTHORITATIVE specification for the Flutter Rider Mobile Application. No screen, widget, or feature may be implemented without a corresponding entry here.

---

## 1. Purpose and Scope

This document defines the complete specification for the Rider Mobile Application built with Flutter. It covers all screens, navigation flows, interactions, data bindings, offline behavior, real-time communication, and accessibility requirements.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Platform | iOS and Android via Flutter single codebase |
| Target users | Motorcycle ride-sharing riders in Kathmandu Valley |
| Language | English (system), Nepali (user-facing content via dictionary) |
| Authentication | Phone + OTP exclusively (REQ-PRD-001, REQ-PRD-168) |
| Backend integration | REST API (/api/v1/) + Socket.IO WebSocket |
| SDK | Auto-generated Dart client from OpenAPI 3.1 spec |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Screen identifiers use prefix SCR-RDR-NNN.
- All screens trace to Document 01 requirements REQ-PRD-168 through REQ-PRD-175.
- UI text SHALL be dictionary-driven (Document 06) unless explicitly noted as system-internal.

---

## 2. Technology Stack

| Layer | Technology | Rationale | Reference |
|-------|-----------|-----------|-----------|
| Framework | Flutter (latest stable) | Cross-platform iOS/Android | Document 04 §3 |
| Language | Dart | Flutter native language | Document 04 §3 |
| State Management | Riverpod | Compile-safe, testable, scalable | ARCH-001 |
| Architecture | Clean Architecture (presentation/domain/data) | Separation of concerns, testability | Document 04 §2.2 |
| Navigation | GoRouter | Declarative, deep-link support | REQ-PRD-168 |
| HTTP Client | Dio + generated Dart SDK | Type-safe API calls from OpenAPI | Document 04 §3 |
| WebSocket | socket_io_client | Socket.IO protocol compatibility | REQ-PRD-165 |
| Local Storage | Hive (encrypted) | Secure token and cache storage | REQ-PRD-209 |
| Push Notifications | Firebase Cloud Messaging (FCM) | Industry standard, cross-platform | REQ-PRD-086 |
| Camera | camera + image_picker | Document and verification photo capture | REQ-PRD-169 |
| Image Compression | flutter_image_compress | Reduce upload size | REQ-PRD-111 |
| Localization | flutter_localizations + intl | Nepali language support | Document 06 |

---

## 3. Navigation Structure

### 3.1 Bottom Navigation Bar

The application SHALL use a bottom tab bar with exactly 4 tabs (max per UX principles).

| Position | Tab | Icon | Label | Root Screen |
|----------|-----|------|-------|-------------|
| 1 | Home | home | Home | SCR-RDR-010 |
| 2 | Campaigns | campaign | Campaigns | SCR-RDR-020 |
| 3 | Earnings | wallet | Earnings | SCR-RDR-030 |
| 4 | Profile | person | Profile | SCR-RDR-040 |


### 3.2 Navigation Rules

1. The bottom tab bar SHALL be visible on all root screens and SHALL persist across tab switches.
2. Each tab SHALL maintain its own navigation stack independently.
3. Deep links from push notifications SHALL navigate to the relevant screen within the correct tab.
4. The app SHALL restore the last active tab on cold start (after authentication).
5. Screens outside the tab structure (onboarding, login, settings) SHALL hide the bottom bar.

### 3.3 Navigation Hierarchy

```
[Unauthenticated]
├── SCR-RDR-001 Splash
├── SCR-RDR-002 Login (Phone Entry)
├── SCR-RDR-003 OTP Verification
└── SCR-RDR-004–009 Onboarding Flow

[Authenticated — Bottom Tab Bar]
├── Tab 1: Home
│   ├── SCR-RDR-010 Home Dashboard
│   ├── SCR-RDR-011 Notification Center
│   └── SCR-RDR-012 Verification Photo Capture
├── Tab 2: Campaigns
│   ├── SCR-RDR-020 Campaign List
│   └── SCR-RDR-021 Campaign Detail
├── Tab 3: Earnings
│   ├── SCR-RDR-030 Earnings Dashboard
│   └── SCR-RDR-031 Payout History
├── Tab 4: Profile
│   ├── SCR-RDR-040 Profile Overview
│   ├── SCR-RDR-041 Edit Personal Info
│   ├── SCR-RDR-042 Vehicle Details
│   ├── SCR-RDR-043 Documents
│   ├── SCR-RDR-044 Support
│   ├── SCR-RDR-045 Support Conversation
│   └── SCR-RDR-046 Settings
```

---

## 4. Screen Inventory

| ID | Screen Name | Parent Tab | Auth Required | Offline Capable |
|----|------------|-----------|---------------|-----------------|
| SCR-RDR-001 | Splash | — | No | Yes |
| SCR-RDR-002 | Login | — | No | No |
| SCR-RDR-003 | OTP Verification | — | No | No |
| SCR-RDR-004 | Onboarding: Welcome | — | Yes | No |
| SCR-RDR-005 | Onboarding: Personal Info | — | Yes | No |
| SCR-RDR-006 | Onboarding: Vehicle Details | — | Yes | No |
| SCR-RDR-007 | Onboarding: Document Upload | — | Yes | No |
| SCR-RDR-008 | Onboarding: Zone Selection | — | Yes | No |
| SCR-RDR-009 | Onboarding: Completion | — | Yes | No |
| SCR-RDR-010 | Home Dashboard | Home | Yes | Partial |
| SCR-RDR-011 | Notification Center | Home | Yes | Partial |
| SCR-RDR-012 | Verification Photo Capture | Home | Yes | No |
| SCR-RDR-020 | Campaign List | Campaigns | Yes | Partial |
| SCR-RDR-021 | Campaign Detail | Campaigns | Yes | Partial |
| SCR-RDR-030 | Earnings Dashboard | Earnings | Yes | Partial |
| SCR-RDR-031 | Payout History | Earnings | Yes | Partial |
| SCR-RDR-040 | Profile Overview | Profile | Yes | Partial |
| SCR-RDR-041 | Edit Personal Info | Profile | Yes | No |
| SCR-RDR-042 | Vehicle Details | Profile | Yes | No |
| SCR-RDR-043 | Documents | Profile | Yes | Partial |
| SCR-RDR-044 | Support | Profile | Yes | Partial |
| SCR-RDR-045 | Support Conversation | Profile | Yes | Partial |
| SCR-RDR-046 | Settings | Profile | Yes | Yes |

---

## 5. Screen Specifications

### 5.1 SCR-RDR-001 — Splash Screen

**Purpose:** Brand display during app initialization and auth state check.

| Aspect | Specification |
|--------|--------------|
| Layout | Centered logo, brand name, loading indicator at bottom |
| Duration | Maximum 2 seconds; transitions immediately upon auth check completion |
| Logic | Check stored JWT refresh token → if valid, navigate to Home; if expired/missing, navigate to Login |
| API Calls | POST /api/v1/auth/refresh (if refresh token exists) |
| Error State | On network error with valid cached token → navigate to Home (offline mode) |
| Empty State | N/A |
| Loading State | Subtle animated logo pulse |
| Transition | Fade transition to next screen |

### 5.2 SCR-RDR-002 — Login Screen

**Purpose:** Phone number entry for authentication (REQ-PRD-001, REQ-PRD-168).

| Aspect | Specification |
|--------|--------------|
| Layout | App logo top, phone input field center, country code fixed (+977), "Continue" button bottom |
| Data Displayed | Country code prefix (Nepal +977), app version at bottom |
| Actions | Enter phone number → tap Continue → triggers OTP send |
| API Calls | POST /api/v1/auth/otp/send { phone } |
| Validation | Phone: 10 digits, starts with 98/97/96; real-time validation as user types |
| Error States | Invalid phone format → inline error; Rate limited → "Too many attempts, try after X minutes"; Network error → "No internet connection" with retry button |
| Empty State | N/A |
| Loading State | Button shows spinner, input disabled during API call |

### 5.3 SCR-RDR-003 — OTP Verification Screen

**Purpose:** Verify OTP sent to rider's phone (REQ-PRD-001).

| Aspect | Specification |
|--------|--------------|
| Layout | Header showing masked phone number, 6-digit OTP input (auto-advancing), resend timer, verify button |
| Data Displayed | Phone number (masked: 98****1234), countdown timer (60s) |
| Actions | Enter OTP → auto-submit on 6th digit; Resend OTP (after countdown); Change phone number (back) |
| API Calls | POST /api/v1/auth/otp/verify { phone, otp } |
| Validation | OTP: exactly 6 numeric digits |
| Error States | Invalid OTP → shake animation + "Invalid code, X attempts remaining"; Expired OTP → "Code expired, request a new one"; Locked → "Account locked, contact support" |
| Empty State | N/A |
| Loading State | OTP input disabled, verify button shows spinner |
| Auto-read | SHALL attempt to auto-read OTP from SMS (Android only) |

### 5.4 SCR-RDR-004 — Onboarding: Welcome

**Purpose:** Introduction to onboarding process with progress overview.

| Aspect | Specification |
|--------|--------------|
| Layout | Welcome illustration, step progress indicator (1/5), brief explanation text, "Get Started" button |
| Data Displayed | Platform name, brief value proposition, step count |
| Actions | Tap "Get Started" → navigate to Personal Info |
| API Calls | None |
| Progress | Step 1 of 5 highlighted in progress bar |

### 5.5 SCR-RDR-005 — Onboarding: Personal Info

**Purpose:** Collect rider personal details (REQ-PRD-023).

| Aspect | Specification |
|--------|--------------|
| Layout | Progress bar (2/5), form fields, "Continue" button, "Back" text button |
| Fields | Full name (required), Date of birth (date picker), Address (text), Emergency contact name, Emergency contact phone |
| API Calls | PATCH /api/v1/riders/me/profile { personalInfo } |
| Validation | Name: 2-100 chars; DOB: age >= 18; Phone: valid Nepal format |
| Error States | Validation errors shown inline below fields; API error → snackbar with retry |
| Loading State | Button spinner during API call |
| Resume | Form state persisted locally; if user exits, data SHALL be restored on return |

### 5.6 SCR-RDR-006 — Onboarding: Vehicle Details

**Purpose:** Collect vehicle information (REQ-PRD-023).

| Aspect | Specification |
|--------|--------------|
| Layout | Progress bar (3/5), form fields, "Continue" button, "Back" text button |
| Fields | Vehicle type (dropdown: motorcycle only MVP), Registration number (text), Vehicle color (text), Vehicle make/model (text) |
| API Calls | PATCH /api/v1/riders/me/vehicle { vehicleDetails } |
| Validation | Registration number: required, alphanumeric, Nepal format |
| Error States | Validation inline; API error → snackbar |
| Loading State | Button spinner |
| Resume | Form state persisted locally |

### 5.7 SCR-RDR-007 — Onboarding: Document Upload

**Purpose:** Progressive document submission — one document at a time (REQ-PRD-013, REQ-PRD-169).

| Aspect | Specification |
|--------|--------------|
| Layout | Progress bar (4/5), current document type indicator, upload area with camera/gallery options, document preview, "Upload & Continue" button |
| Documents | Presented one at a time in sequence: 1) Citizenship/License, 2) Vehicle Registration, 3) Profile Photo, 4) Helmet Photo |
| Actions | Tap upload area → camera or gallery picker; Preview captured image → retake or confirm; Upload → progress indicator → next document |
| API Calls | POST /api/v1/media/upload (multipart) → then POST /api/v1/riders/me/documents { type, mediaId } |
| Validation | File type: JPEG/PNG; Max size: 10MB; Minimum resolution: 800x600px |
| Error States | File too large → "Image exceeds 10MB limit"; Upload failed → retry button; Wrong format → "Please use JPEG or PNG" |
| Loading State | Upload progress bar (percentage) |
| Resume | Completed documents marked with green checkmark; user resumes from next incomplete document |
| Camera Overlay | Profile photo and helmet photo SHALL show positioning guide overlay |

### 5.8 SCR-RDR-008 — Onboarding: Zone Selection

**Purpose:** Select operating zone (REQ-PRD-021).

| Aspect | Specification |
|--------|--------------|
| Layout | Progress bar (5/5), zone list with ward details, single-select, "Complete Registration" button |
| Data Displayed | Available zones with ward names, zone descriptions |
| API Calls | GET /api/v1/zones (list available zones) → PATCH /api/v1/riders/me/zone { zoneId } |
| Validation | Exactly one zone SHALL be selected |
| Error States | No zones available → "Zones not configured, contact support"; API error → retry |
| Loading State | Skeleton list during zone fetch; button spinner on submit |

### 5.9 SCR-RDR-009 — Onboarding: Completion

**Purpose:** Confirmation of registration submission.

| Aspect | Specification |
|--------|--------------|
| Layout | Success illustration, confirmation message, "What happens next" explanation, "Go to Home" button |
| Data Displayed | Status message: "Your documents are under review"; Expected timeline: "1-3 business days" |
| Actions | "Go to Home" → navigate to Home Dashboard |
| API Calls | None |

### 5.10 SCR-RDR-010 — Home Dashboard

**Purpose:** Primary landing screen showing rider status summary (REQ-PRD-170, REQ-PRD-172).

| Aspect | Specification |
|--------|--------------|
| Layout | Greeting header with notification bell, status card, action required section, quick stats row, active campaign card |
| Data Displayed | Rider name; Current status (Available/Assigned/Campaign Active/etc.); Wallet balance; Current period earnings; Active campaign name + days remaining; Next verification due date; Next payout date |
| Actions | Notification bell → SCR-RDR-011; Availability toggle (Available/Unavailable); "Submit Verification" → SCR-RDR-012; Campaign card → SCR-RDR-021 |
| API Calls | GET /api/v1/riders/me/dashboard (aggregated endpoint) |
| Validation | N/A |
| Error States | Network error → show cached data with "Last updated X ago" banner; API error → retry button |
| Empty States | No active campaign → "No active campaign. You'll be notified when assigned."; Pending verification → "Your documents are being reviewed" |
| Loading State | Skeleton screen mimicking card layout |
| Real-time | WebSocket events: assignment updates, verification reminders, payout notifications |


### 5.11 SCR-RDR-011 — Notification Center

**Purpose:** Scrollable notification history with read/unread status (REQ-PRD-088, REQ-PRD-173).

| Aspect | Specification |
|--------|--------------|
| Layout | Header with "Mark all read" action, scrollable list of notifications grouped by date, pull-to-refresh |
| Data Displayed | Notification title, body preview (2 lines), timestamp (relative), read/unread indicator (dot), notification type icon |
| Actions | Tap notification → deep link to relevant screen; Swipe left → dismiss; "Mark all read" → batch update |
| API Calls | GET /api/v1/notifications?page=N&limit=20; PATCH /api/v1/notifications/{id}/read; PATCH /api/v1/notifications/read-all |
| Pagination | Infinite scroll with cursor-based pagination |
| Error States | Network error → show cached notifications with offline banner |
| Empty State | Illustration + "No notifications yet. We'll keep you posted!" |
| Loading State | Skeleton list items |

### 5.12 SCR-RDR-012 — Verification Photo Capture

**Purpose:** Camera interface for sticker verification submission (REQ-PRD-069, REQ-PRD-171).

| Aspect | Specification |
|--------|--------------|
| Layout | Full-screen camera preview, helmet overlay guide (translucent frame), capture button, flash toggle, switch camera button |
| Camera Overlay | Translucent rectangular guide showing where helmet should be positioned; text instruction: "Position your helmet sticker within the frame" |
| Actions | Capture photo → preview with "Retake" and "Submit" options; Submit → upload + API call |
| API Calls | POST /api/v1/media/upload (photo) → POST /api/v1/stickers/verifications { assignmentId, mediaId } |
| Validation | Photo SHALL be minimum 1280x720px; SHALL include EXIF timestamp; SHALL be taken within current session (not from gallery) |
| Error States | Camera permission denied → explanation + settings redirect; Upload failed → retry with cached photo; No active assignment → "No verification required" |
| Loading State | Upload progress overlay on captured image |
| Constraints | Gallery selection SHALL NOT be permitted for verification photos (enforces RULE-VRF-005) |

### 5.13 SCR-RDR-020 — Campaign List

**Purpose:** Display active and available campaigns (REQ-PRD-170).

| Aspect | Specification |
|--------|--------------|
| Layout | Segmented control (Active / Completed), campaign cards list, pull-to-refresh |
| Data Displayed | Campaign name, business name, date range, days remaining/completed, status badge, daily rate |
| Actions | Tap campaign card → SCR-RDR-021; Pull-to-refresh |
| API Calls | GET /api/v1/riders/me/assignments?status=active; GET /api/v1/riders/me/assignments?status=completed |
| Error States | Network error → cached list with offline banner |
| Empty States | Active: "No active campaigns. You'll be assigned when a matching campaign is available."; Completed: "No completed campaigns yet." |
| Loading State | Skeleton cards (3 placeholder cards) |

### 5.14 SCR-RDR-021 — Campaign Detail

**Purpose:** Detailed view of a specific campaign assignment (REQ-PRD-170).

| Aspect | Specification |
|--------|--------------|
| Layout | Campaign header (name, business, status), assignment info card, sticker info card, verification section, earnings section |
| Data Displayed | Campaign name, business name, date range, days completed/total, daily earning rate, total earned so far, sticker status, last verification date, next verification due, zone |
| Actions | "Submit Verification" → SCR-RDR-012 (if due); View sticker details |
| API Calls | GET /api/v1/assignments/{id} (with campaign and sticker details expanded) |
| Error States | Assignment not found → "Campaign no longer available" with back navigation; Network → cached data |
| Empty State | N/A (always has data if navigated from list) |
| Loading State | Skeleton layout matching data structure |

### 5.15 SCR-RDR-030 — Earnings Dashboard

**Purpose:** Comprehensive earnings overview (REQ-PRD-172).

| Aspect | Specification |
|--------|--------------|
| Layout | Wallet balance card (prominent), current period earnings, lifetime earnings, per-campaign breakdown list, "View Payout History" link |
| Data Displayed | Current wallet balance (NPR); Current period earnings (since last payout); Lifetime total earnings; Next payout date; Next payout estimated amount; Per-campaign breakdown (campaign name, days, amount) |
| Actions | "View Payout History" → SCR-RDR-031; Tap campaign row → SCR-RDR-021 |
| API Calls | GET /api/v1/riders/me/wallet; GET /api/v1/riders/me/earnings/summary |
| Error States | Network → cached balance with "Last updated" timestamp |
| Empty State | Zero earnings → "Start earning by getting assigned to campaigns. NPR 100/day per campaign." |
| Loading State | Skeleton cards for balance and breakdown |

### 5.16 SCR-RDR-031 — Payout History

**Purpose:** Historical payout records (REQ-PRD-172).

| Aspect | Specification |
|--------|--------------|
| Layout | Payout list (date, amount, method, status), grouped by cycle |
| Data Displayed | Payout date, amount (NPR), payment method (eSewa/Khalti/Bank/IME Pay), status (Pending/Processing/Completed/Failed), reference number |
| Actions | Pull-to-refresh; Infinite scroll |
| API Calls | GET /api/v1/riders/me/payouts?page=N&limit=20 |
| Error States | Network → cached history |
| Empty State | "No payouts yet. Payouts are processed every 15 days for balances above NPR 500." |
| Loading State | Skeleton list items |

### 5.17 SCR-RDR-040 — Profile Overview

**Purpose:** Rider profile summary and navigation hub (REQ-PRD-023, REQ-PRD-174).

| Aspect | Specification |
|--------|--------------|
| Layout | Profile photo + name header, availability toggle, menu list (Personal Info, Vehicle, Documents, Support, Settings), app version |
| Data Displayed | Profile photo, full name, phone number (masked), rider status badge, reliability score, zone name |
| Actions | Availability toggle → PATCH /api/v1/riders/me/availability; Menu items → respective screens; Profile photo → edit (camera/gallery) |
| API Calls | GET /api/v1/riders/me; PATCH /api/v1/riders/me/availability { available: boolean } |
| Validation | Availability toggle SHALL only be enabled when rider is in Approved/Available/Unavailable state (not during active campaign) |
| Error States | Toggle failure → revert UI + snackbar error; Network → cached profile |
| Loading State | Skeleton header |

### 5.18 SCR-RDR-041 — Edit Personal Info

**Purpose:** Edit personal details.

| Aspect | Specification |
|--------|--------------|
| Layout | Form with pre-filled fields, "Save" button |
| Fields | Full name, Date of birth, Address, Emergency contact name, Emergency contact phone |
| API Calls | PATCH /api/v1/riders/me/profile { fields } |
| Validation | Same as onboarding (§5.5) |
| Error States | Validation inline; API error → snackbar |
| Loading State | Save button spinner |

### 5.19 SCR-RDR-042 — Vehicle Details

**Purpose:** View and edit vehicle information.

| Aspect | Specification |
|--------|--------------|
| Layout | Form with pre-filled vehicle fields, "Save" button |
| Fields | Vehicle type, Registration number, Color, Make/model |
| API Calls | PATCH /api/v1/riders/me/vehicle { fields } |
| Validation | Same as onboarding (§5.6) |
| Note | Registration number change SHALL require re-verification (flagged for Operations Staff review) |

### 5.20 SCR-RDR-043 — Documents

**Purpose:** Document status overview and re-upload capability (REQ-PRD-169).

| Aspect | Specification |
|--------|--------------|
| Layout | Document list with status indicators (Approved/Pending/Rejected/Expired), re-upload button per document |
| Data Displayed | Document type, upload date, status, rejection reason (if applicable), expiry date (if applicable) |
| Actions | "Re-upload" → camera/gallery picker → upload flow; Tap rejected document → view rejection reason |
| API Calls | GET /api/v1/riders/me/documents; POST /api/v1/media/upload + POST /api/v1/riders/me/documents |
| Error States | Upload failure → retry; Network → cached status list |
| Empty State | N/A (always has document slots from onboarding) |
| Status Colors | Approved: green; Pending: amber; Rejected: red; Expired: gray |

### 5.21 SCR-RDR-044 — Support

**Purpose:** Support ticket list and creation (REQ-PRD-175).

| Aspect | Specification |
|--------|--------------|
| Layout | "New Ticket" FAB, ticket list (status, subject, date), empty state |
| Data Displayed | Ticket subject, status badge, created date, last response date |
| Actions | FAB → new ticket form (category dropdown, subject, description, optional attachment); Tap ticket → SCR-RDR-045 |
| API Calls | GET /api/v1/support/tickets?page=N; POST /api/v1/support/tickets { category, subject, description, mediaIds } |
| Validation | Subject: 5-200 chars; Description: 10-2000 chars; Category: required selection |
| Error States | Submission failed → retry with preserved form data |
| Empty State | "No support tickets. Need help? Tap + to create a ticket." |

### 5.22 SCR-RDR-045 — Support Conversation

**Purpose:** View and reply within a support ticket.

| Aspect | Specification |
|--------|--------------|
| Layout | Chat-style conversation (rider messages right, staff messages left), text input + send button, attachment button |
| Data Displayed | Messages with timestamps, sender role indicator, attached images (tappable for full view), ticket status |
| Actions | Send text reply; Attach image; View full-size image |
| API Calls | GET /api/v1/support/tickets/{id}/messages; POST /api/v1/support/tickets/{id}/messages { text, mediaIds } |
| Real-time | WebSocket event for new messages in active ticket |
| Constraints | Reply SHALL only be available when ticket status is not Closed |

### 5.23 SCR-RDR-046 — Settings

**Purpose:** App preferences and configuration.

| Aspect | Specification |
|--------|--------------|
| Layout | Section list: Notifications, Language, About, Logout |
| Sections | **Notifications:** Toggle push notifications, toggle verification reminders; **Language:** Nepali/English selector; **About:** App version, terms of service link, privacy policy link; **Account:** Logout button with confirmation |
| API Calls | PATCH /api/v1/notifications/preferences { channels }; POST /api/v1/auth/logout |
| Actions | Logout → confirmation dialog → clear tokens → navigate to Login |

---

## 6. Onboarding Flow

### 6.1 Design Principles

- **Progressive Disclosure:** Documents SHALL be uploaded one at a time, not all simultaneously.
- **Resume Capability:** If the rider exits mid-onboarding, the app SHALL resume from the last incomplete step.
- **Progress Indicator:** A step progress bar SHALL be visible on all onboarding screens showing current position (X/5).
- **No Skip:** Steps SHALL NOT be skippable; each must be completed before proceeding.

### 6.2 Onboarding State Machine

```
Welcome → Personal Info → Vehicle Details → Document Upload (×4 sequential) → Zone Selection → Completion
```

### 6.3 Resume Logic

The app SHALL track onboarding progress via local storage AND server state:

| Signal | Resume Point |
|--------|-------------|
| Profile incomplete | SCR-RDR-005 |
| Vehicle missing | SCR-RDR-006 |
| Documents < 4 submitted | SCR-RDR-007 (at next unsubmitted doc) |
| Zone not selected | SCR-RDR-008 |
| All complete, status = Documents Pending | SCR-RDR-009 (show waiting state) |

### 6.4 Post-Onboarding States

| Rider Status | App Behavior |
|--------------|-------------|
| Pre-Registered | Show onboarding flow |
| Documents Pending | Show "Under Review" home state |
| Verification Pending | Show "Under Review" home state |
| Approved | Show "Set Availability" prompt on home |
| Available | Full home dashboard |
| Assigned / Campaign Active | Full home dashboard with campaign info |
| Suspended | Show suspension notice with reason, support link |

---

## 7. Authentication

### 7.1 Login Flow

1. Rider enters Nepal phone number (+977 prefix auto-applied).
2. System sends OTP via SMS (POST /api/v1/auth/otp/send).
3. Rider enters 6-digit OTP (auto-read on Android).
4. System verifies OTP → returns JWT access + refresh token pair.
5. Tokens stored in encrypted local storage (Hive).

### 7.2 Token Management

| Token | Storage | Lifetime | Refresh Strategy |
|-------|---------|----------|-----------------|
| Access Token | Encrypted Hive | 15 minutes (REQ-PRD-213) | Auto-refresh via interceptor before expiry |
| Refresh Token | Encrypted Hive | 7 days (REQ-PRD-214) | On access token refresh; if expired → force re-login |
| FCM Token | Encrypted Hive | Until invalidated | Register on login, update on refresh |

### 7.3 Session Management

- The app SHALL implement a Dio interceptor that automatically refreshes expired access tokens.
- If refresh fails (401), the app SHALL clear all tokens and navigate to Login.
- On account suspension (detected via 403 response), the app SHALL display suspension notice.
- The app SHALL support device-based session management (REQ-PRD-008).

### 7.4 Biometric Authentication (Future)

- The architecture SHALL accommodate biometric unlock as a future enhancement.
- Token storage SHALL use platform keychain (iOS Keychain / Android Keystore) to enable biometric-gated access.

---

## 8. Push Notifications

### 8.1 Firebase Cloud Messaging Integration

| Aspect | Specification |
|--------|--------------|
| Provider | Firebase Cloud Messaging (FCM) |
| Registration | On successful login, register FCM token via POST /api/v1/notifications/register-device { fcmToken, platform } |
| Token Refresh | On FCM token refresh callback, update via PATCH /api/v1/notifications/device { fcmToken } |
| Deregistration | On logout, deregister via DELETE /api/v1/notifications/device |
| Platforms | Android: default FCM; iOS: APNs via FCM bridge |

### 8.2 Notification Categories

| Category | Example | Deep Link Target |
|----------|---------|-----------------|
| Assignment | "You've been assigned to Campaign X" | SCR-RDR-021 (Campaign Detail) |
| Verification | "Verification due in 2 days" | SCR-RDR-012 (Capture) |
| Payout | "Payout of NPR X,XXX processed" | SCR-RDR-031 (Payout History) |
| Document | "Your document has been approved" | SCR-RDR-043 (Documents) |
| Support | "New reply on your ticket" | SCR-RDR-045 (Conversation) |
| General | "Platform maintenance scheduled" | SCR-RDR-011 (Notification Center) |

### 8.3 Notification Handling

- **Foreground:** Display in-app banner (auto-dismiss after 4 seconds), tap → deep link.
- **Background:** System notification tray, tap → app launch + deep link.
- **Terminated:** System notification tray, tap → cold start + deep link navigation.
- All received notifications SHALL be stored in local notification center cache.

---

## 9. Real-Time Updates

### 9.1 Socket.IO Connection

| Aspect | Specification |
|--------|--------------|
| Server | wss://api.soloadvertiser.com/socket.io |
| Auth | JWT access token in handshake auth header |
| Namespace | /rider |
| Transport | WebSocket (preferred), long-polling (fallback) |
| Connection | Establish on app foreground after authentication |
| Disconnection | Graceful disconnect on app background (after 30s delay) |

### 9.2 Events Consumed

| Event | Payload | UI Update |
|-------|---------|-----------|
| notification:new | { id, title, body, type, deepLink } | In-app banner + badge increment |
| assignment:created | { assignmentId, campaignName } | Home dashboard refresh + notification |
| assignment:updated | { assignmentId, status } | Campaign detail refresh |
| verification:reminder | { assignmentId, dueDate } | Home action required section |
| payout:completed | { amount, method } | Earnings refresh + notification |
| config:updated | { key, value } | Local config cache update |
| rider:status_changed | { newStatus, reason } | Profile status update, potential screen redirect |

### 9.3 Reconnection Strategy

1. On disconnect: attempt immediate reconnection.
2. Backoff: 1s → 2s → 4s → 8s → 16s → 30s (max).
3. After 5 failed attempts: show "Connection lost" banner in UI.
4. On reconnection: fetch missed events via GET /api/v1/notifications?since={lastEventTimestamp}.
5. On app resume from background: reconnect + sync.

---

## 10. Camera and Media

### 10.1 Document Upload

| Aspect | Specification |
|--------|--------------|
| Sources | Camera capture OR gallery selection |
| Formats | JPEG, PNG |
| Max Size | 10MB raw; compressed to ≤2MB before upload |
| Compression | Quality 80%, max dimension 2048px (preserving aspect ratio) |
| Overlay | Profile photo: face oval guide; Helmet photo: helmet shape guide |
| Preview | Full-screen preview with "Retake" and "Use Photo" buttons |

### 10.2 Verification Photo

| Aspect | Specification |
|--------|--------------|
| Source | Camera ONLY (gallery SHALL NOT be permitted) |
| Format | JPEG |
| Min Resolution | 1280x720px |
| Compression | Quality 85%, max dimension 2048px |
| Overlay | Rectangular guide showing sticker position area |
| Metadata | EXIF timestamp preserved; GPS coordinates included if permitted |
| Constraints | Photo SHALL be captured in current session (no pre-captured images) |

### 10.3 Upload Flow

1. Capture/select image.
2. Show preview with crop option (documents only).
3. Compress image per specification.
4. Upload via POST /api/v1/media/upload (multipart/form-data).
5. Show progress bar (0-100%).
6. On success: receive mediaId for association.
7. On failure: retain compressed image locally, offer retry.

---

## 11. Offline Behavior

### 11.1 Cached Data (Viewable Offline)

| Data | Cache Strategy | Staleness Indicator |
|------|---------------|-------------------|
| Home dashboard summary | Cache on every successful fetch | "Last updated X ago" banner |
| Campaign list | Cache last successful response | Offline badge on screen |
| Campaign detail | Cache per assignment ID | "Last updated" timestamp |
| Earnings summary | Cache on every successful fetch | "Last updated" timestamp |
| Payout history | Cache last page | Offline badge |
| Profile data | Cache on fetch | N/A (always available) |
| Notifications | Cache last 50 notifications | Offline badge |
| Documents status | Cache on fetch | "Last updated" timestamp |

### 11.2 Queued Actions (Executed on Reconnection)

| Action | Queue Behavior |
|--------|---------------|
| Availability toggle | Queue single action (latest wins) |
| Support ticket message | Queue with order preservation |

### 11.3 Actions Requiring Connectivity

The following actions SHALL display "No internet connection" and SHALL NOT be queued:

- Login / OTP verification
- Document upload
- Verification photo submission
- Profile edits (to ensure consistency)
- New support ticket creation

### 11.4 Offline Detection

- The app SHALL monitor network connectivity state.
- On connectivity loss: display persistent top banner "No internet connection — showing cached data."
- On connectivity restored: dismiss banner, trigger sync of queued actions, refresh current screen data.

---

## 12. Accessibility

### 12.1 Touch Targets

- All interactive elements SHALL have a minimum touch target of 48x48dp (REQ-PRD accessibility standards).
- Buttons SHALL have minimum height of 48dp.
- List items SHALL have minimum height of 56dp.
- Spacing between adjacent touch targets SHALL be minimum 8dp.

### 12.2 Typography

- The app SHALL respect system font size settings (Dynamic Type on iOS, font scale on Android).
- Text SHALL scale from 0.85x to 1.5x without layout breakage.
- Minimum body text size SHALL be 14sp at 1.0x scale.
- Headers SHALL use relative sizing (1.5x, 1.25x, 1.0x body).

### 12.3 Color and Contrast

- All text SHALL meet WCAG 2.1 AA contrast ratio (4.5:1 for normal text, 3:1 for large text).
- Status indicators SHALL NOT rely on color alone — SHALL include icons or text labels.
- The app SHOULD support system dark mode (implementation MAY be deferred post-MVP).

### 12.4 Language Support

- All user-facing strings SHALL be loaded from the dictionary service (Document 06).
- The app SHALL support Nepali (ne) and English (en) locales.
- Language switching SHALL be immediate without app restart.
- Right-to-left (RTL) layout is NOT required (neither English nor Nepali uses RTL).
- Date formatting SHALL respect locale (Bikram Sambat consideration for future).

### 12.5 Screen Reader

- All images SHALL have contentDescription / semanticLabel.
- Interactive elements SHALL have accessibility labels describing the action.
- Navigation changes SHALL announce new screen titles via semantics.

---

## 13. Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cold start to interactive | ≤ 3 seconds | Time from tap to first interactive frame |
| Warm start to interactive | ≤ 1 second | Time from background resume to interactive |
| Screen transition | ≤ 300ms | Animation duration for page transitions |
| API response rendering | ≤ 500ms | Time from API response to UI update |
| Image upload | Progress feedback within 100ms | User sees progress bar immediately |
| List scrolling | 60fps | No frame drops during scroll |
| App size (installed) | ≤ 50MB | APK/IPA size |
| Memory usage (idle) | ≤ 150MB | Background memory footprint |
| Battery | No background drain | No persistent background services |

### 13.1 Image Optimization

- Thumbnails SHALL be requested at display size (not full resolution).
- Images SHALL be cached locally with LRU eviction (max 100MB cache).
- Progressive JPEG loading SHALL be used for network images.
- Placeholder shimmer SHALL be shown during image load.

### 13.2 API Optimization

- The app SHALL use a dedicated dashboard aggregation endpoint (reduces multiple calls to one).
- Pagination SHALL use cursor-based pagination for infinite lists.
- The app SHALL implement request deduplication (prevent duplicate in-flight requests).
- Failed requests SHALL implement exponential backoff (1s, 2s, 4s max).

---

## 14. Traceability

### 14.1 Screen to Requirement Mapping

| Screen ID | Primary Requirements |
|-----------|---------------------|
| SCR-RDR-001 | REQ-PRD-168 |
| SCR-RDR-002 | REQ-PRD-001, REQ-PRD-168, RULE-RDR-001 |
| SCR-RDR-003 | REQ-PRD-001, REQ-PRD-168, RULE-RDR-001 |
| SCR-RDR-004–009 | REQ-PRD-013, REQ-PRD-169, RULE-RDR-002 |
| SCR-RDR-010 | REQ-PRD-170, REQ-PRD-172, REQ-PRD-174 |
| SCR-RDR-011 | REQ-PRD-088, REQ-PRD-173 |
| SCR-RDR-012 | REQ-PRD-069, REQ-PRD-171, RULE-VRF-005 |
| SCR-RDR-020 | REQ-PRD-170 |
| SCR-RDR-021 | REQ-PRD-170, REQ-PRD-058 |
| SCR-RDR-030 | REQ-PRD-172, REQ-PRD-074 |
| SCR-RDR-031 | REQ-PRD-172, REQ-PRD-077 |
| SCR-RDR-040 | REQ-PRD-023, REQ-PRD-174, REQ-PRD-022 |
| SCR-RDR-043 | REQ-PRD-169, REQ-PRD-024 |
| SCR-RDR-044–045 | REQ-PRD-175, REQ-PRD-114 |
| SCR-RDR-046 | REQ-PRD-091 |

### 14.2 Domain Rule Enforcement

| Rule | Enforced In |
|------|-------------|
| RULE-RDR-001 | SCR-RDR-002, SCR-RDR-003 (phone + OTP only) |
| RULE-RDR-002 | SCR-RDR-007 (4 documents required sequentially) |
| RULE-RDR-003 | SCR-RDR-020 (display only; backend enforces) |
| RULE-VRF-001 | SCR-RDR-010, SCR-RDR-012 (7-day cycle indicator) |
| RULE-VRF-005 | SCR-RDR-012 (camera only, no gallery) |
| RULE-NTF-004 | SCR-RDR-046 (notification preferences) |

### 14.3 API Dependency Map

| Screen | Endpoints Used |
|--------|---------------|
| SCR-RDR-002 | POST /api/v1/auth/otp/send |
| SCR-RDR-003 | POST /api/v1/auth/otp/verify |
| SCR-RDR-005 | PATCH /api/v1/riders/me/profile |
| SCR-RDR-006 | PATCH /api/v1/riders/me/vehicle |
| SCR-RDR-007 | POST /api/v1/media/upload, POST /api/v1/riders/me/documents |
| SCR-RDR-008 | GET /api/v1/zones, PATCH /api/v1/riders/me/zone |
| SCR-RDR-010 | GET /api/v1/riders/me/dashboard |
| SCR-RDR-011 | GET /api/v1/notifications, PATCH /api/v1/notifications/{id}/read |
| SCR-RDR-012 | POST /api/v1/media/upload, POST /api/v1/stickers/verifications |
| SCR-RDR-020 | GET /api/v1/riders/me/assignments |
| SCR-RDR-021 | GET /api/v1/assignments/{id} |
| SCR-RDR-030 | GET /api/v1/riders/me/wallet, GET /api/v1/riders/me/earnings/summary |
| SCR-RDR-031 | GET /api/v1/riders/me/payouts |
| SCR-RDR-040 | GET /api/v1/riders/me, PATCH /api/v1/riders/me/availability |
| SCR-RDR-043 | GET /api/v1/riders/me/documents |
| SCR-RDR-044 | GET /api/v1/support/tickets, POST /api/v1/support/tickets |
| SCR-RDR-045 | GET /api/v1/support/tickets/{id}/messages, POST /api/v1/support/tickets/{id}/messages |
| SCR-RDR-046 | PATCH /api/v1/notifications/preferences, POST /api/v1/auth/logout |

---

*End of Document 09*
