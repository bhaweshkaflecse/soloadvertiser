# Document 14 - Notifications and Timeline Specification

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every notification trigger, template, delivery channel, preference, and timeline entry defined in this document is the AUTHORITATIVE specification for the Notification Domain (CTX-008) and Timeline Service (CTX-011). No implementation may introduce notification behavior or timeline logic not sanctioned here.

---

## 1. Purpose and Scope

This document defines the complete specification for the Notification Domain and Timeline Service — covering push notifications, in-app notifications, notification center, versioned templates, delivery tracking, and auto-generated entity timelines.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Push delivery | Firebase Cloud Messaging (Android + iOS) |
| Real-time delivery | Socket.IO |
| Persistent storage | Notification Center (PostgreSQL) |
| Languages | English (en) + Nepali (ne) |
| Template management | Super Admin only |
| Timeline scope | Per-entity event history |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Notification template identifiers use prefix NTPL-NNN.
- Timeline event identifiers use prefix TLE-NNN.
- Notification category identifiers use prefix NCAT-NNN.

### 1.3 Upstream References

| Document | Relevant Sections |
|----------|-------------------|
| Document 01 | REQ-PRD-086 through REQ-PRD-092, REQ-PRD-104 through REQ-PRD-107 |
| Document 02 | RULE-NTF-001 through RULE-NTF-004 |
| Document 03 | AGG-012 (Notification), CTX-008, CTX-011 |
| Document 04 | NotificationModule, Socket.IO integration |
| Document 05 | notification_* schema tables |

---

## 2. Notification Architecture

### 2.1 Three-Layer Delivery Model

The notification system SHALL deliver via three complementary layers:

| Layer | Channel | Persistence | Latency Target | Offline Support |
|-------|---------|-------------|----------------|-----------------|
| Push | Firebase Cloud Messaging | FCM handles retry | < 5 seconds | Yes (FCM queues) |
| In-App | Socket.IO real-time | None (ephemeral) | < 2 seconds | No (requires connection) |
| Center | PostgreSQL storage | Permanent until deleted | N/A (pull-based) | Yes (queryable) |

### 2.2 Channel Priority and Fallback

For each notification trigger:

1. **In-App:** If recipient has active Socket.IO connection, deliver immediately.
2. **Push:** Always send via FCM regardless of connection status (FCM handles delivery).
3. **Center:** Always persist to Notification Center for history.

All three layers SHALL fire concurrently. No fallback chain — all enabled channels execute in parallel.

### 2.3 Delivery Architecture

```
Domain Event → NotificationModule → Template Resolution → Channel Router
                                                              ├── Push Service → FCM → Device
                                                              ├── Socket Service → Socket.IO → Connected Client
                                                              └── Center Service → PostgreSQL → Notification Center
```

---

## 3. Notification Templates

### 3.1 Template Structure

Each notification template SHALL contain:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| template_id | VARCHAR | Stable identifier (NTPL-NNN) | Yes |
| version | INTEGER | Monotonically increasing version | Yes |
| category | VARCHAR | Notification category (NCAT-NNN) | Yes |
| title_en | VARCHAR | English title with variable placeholders | Yes |
| title_ne | VARCHAR | Nepali title with variable placeholders | Yes |
| body_en | TEXT | English body with variable placeholders | Yes |
| body_ne | TEXT | Nepali body with variable placeholders | Yes |
| variables | JSONB | Array of variable names used in template | Yes |
| channels | JSONB | Enabled channels for this template | Yes |
| enabled | BOOLEAN | Whether template is active | Yes |
| created_by | UUID | Super Admin who created/updated | Yes |
| created_at | TIMESTAMPTZ | Creation timestamp | Yes |

### 3.2 Variable Format

Template variables SHALL use double-brace syntax:

```
Title: "Campaign {{campaign_name}} has started"
Body: "Your campaign {{campaign_name}} with {{rider_count}} riders is now running."
```

### 3.3 Template Versioning

- Each template update SHALL create a new version (never modify existing).
- Active version = highest version number where enabled = true.
- Historical versions retained for audit trail.
- Version rollback = disable current version, enable previous.

### 3.4 Template Governance

- Only Super Admin SHALL create, update, or disable templates (REQ-PRD-104).
- Template changes SHALL be audited (who, when, what changed).
- New templates SHALL be tested in development before production activation.

---

## 4. Notification Categories

### 4.1 Category Registry

| ID | Category | Description | Default Channels |
|----|----------|-------------|-----------------|
| NCAT-001 | Assignment | Rider assignment events | Push + In-App + Center |
| NCAT-002 | Verification | Sticker verification events | Push + In-App + Center |
| NCAT-003 | Payout | Financial/payout events | Push + In-App + Center |
| NCAT-004 | Document | Document status events | Push + In-App + Center |
| NCAT-005 | Campaign | Campaign lifecycle events | Push + In-App + Center |
| NCAT-006 | Support | Support ticket events | Push + In-App + Center |
| NCAT-007 | System | Platform announcements | Push + Center |

### 4.2 Notification Trigger Matrix

#### Assignment Notifications (NCAT-001)

| Trigger Event | Template | Recipients | Channels |
|--------------|----------|-----------|----------|
| EVT-020 (RiderAssigned) | NTPL-001 | Rider | Push + In-App + Center |
| EVT-020 (RiderAssigned) | NTPL-002 | Operations Staff | In-App + Center |
| EVT-021 (RiderRemoved) | NTPL-003 | Rider | Push + In-App + Center |
| EVT-022 (RiderWithdrew) | NTPL-004 | Operations Staff | Push + In-App + Center |
| EVT-025 (FulfillmentReached) | NTPL-005 | Business | Push + In-App + Center |
| EVT-025 (FulfillmentReached) | NTPL-006 | Operations Staff | In-App + Center |

#### Verification Notifications (NCAT-002)

| Trigger Event | Template | Recipients | Channels |
|--------------|----------|-----------|----------|
| EVT-040 (VerificationDue) | NTPL-010 | Rider | Push + In-App + Center |
| EVT-041 (VerificationSubmitted) | NTPL-011 | Operations Staff | In-App + Center |
| EVT-042 (VerificationApproved) | NTPL-012 | Rider | Push + In-App + Center |
| EVT-043 (VerificationRejected) | NTPL-013 | Rider | Push + In-App + Center |
| EVT-044 (VerificationWarning) | NTPL-014 | Rider | Push + In-App + Center |
| EVT-045 (RiderSuspended) | NTPL-015 | Rider | Push + In-App + Center |
| EVT-046 (RiderRemovedFromCampaign) | NTPL-016 | Rider | Push + In-App + Center |

#### Payout Notifications (NCAT-003)

| Trigger Event | Template | Recipients | Channels |
|--------------|----------|-----------|----------|
| EVT-037 (PayoutCompleted) | NTPL-020 | Rider | Push + In-App + Center |
| EVT-038 (PayoutBatchGenerated) | NTPL-021 | Finance Staff | In-App + Center |
| Daily earning credit | NTPL-022 | Rider | Center only |

#### Document Notifications (NCAT-004)

| Trigger Event | Template | Recipients | Channels |
|--------------|----------|-----------|----------|
| EVT-010 (DocumentSubmitted) | NTPL-030 | Operations Staff | In-App + Center |
| EVT-011 (DocumentApproved) | NTPL-031 | Document owner | Push + In-App + Center |
| EVT-012 (DocumentRejected) | NTPL-032 | Document owner | Push + In-App + Center |
| EVT-013 (DocumentExpiringSoon) | NTPL-033 | Document owner | Push + In-App + Center |
| EVT-014 (DocumentExpired) | NTPL-034 | Document owner + Ops | Push + In-App + Center |

#### Campaign Notifications (NCAT-005)

| Trigger Event | Template | Recipients | Channels |
|--------------|----------|-----------|----------|
| EVT-001 (CampaignCreated) | NTPL-040 | Operations Staff | In-App + Center |
| EVT-003 (CampaignStarted) | NTPL-041 | Business | Push + In-App + Center |
| EVT-003 (CampaignStarted) | NTPL-042 | Assigned Riders | Push + In-App + Center |
| EVT-004 (CampaignCompleted) | NTPL-043 | Business | Push + In-App + Center |
| EVT-004 (CampaignCompleted) | NTPL-044 | Assigned Riders | Push + In-App + Center |
| EVT-005 (CampaignCancelled) | NTPL-045 | Business + Riders | Push + In-App + Center |
| EVT-006 (CampaignPaused) | NTPL-046 | Business + Riders | Push + In-App + Center |
| EVT-032 (PaymentVerified) | NTPL-047 | Business | Push + In-App + Center |
| EVT-033 (PaymentRejected) | NTPL-048 | Business | Push + In-App + Center |

#### Support Notifications (NCAT-006)

| Trigger Event | Template | Recipients | Channels |
|--------------|----------|-----------|----------|
| EVT-050 (TicketCreated) | NTPL-050 | Operations Staff | Push + In-App + Center |
| EVT-051 (TicketReplied) | NTPL-051 | Ticket creator | Push + In-App + Center |
| EVT-052 (TicketResolved) | NTPL-052 | Ticket creator | Push + In-App + Center |

#### System Notifications (NCAT-007)

| Trigger Event | Template | Recipients | Channels |
|--------------|----------|-----------|----------|
| System announcement | NTPL-060 | All users (by role) | Push + Center |
| Maintenance window | NTPL-061 | All users | Push + Center |
| Feature release | NTPL-062 | All users | Center only |

---

## 5. Delivery Mechanism

### 5.1 Push Notifications (Firebase Cloud Messaging)

**Configuration:**
- Firebase project per environment (dev, prod)
- Platform support: Android (FCM) + iOS (APNs via FCM)
- Device token registration on app login
- Token refresh handling on app update

**Message Structure:**

```json
{
  "token": "device_fcm_token",
  "notification": {
    "title": "Resolved template title",
    "body": "Resolved template body"
  },
  "data": {
    "notification_id": "uuid",
    "category": "NCAT-001",
    "action_type": "navigate",
    "action_target": "/assignments/uuid",
    "created_at": "ISO8601"
  },
  "android": {
    "priority": "high",
    "notification": { "channel_id": "solo_advertiser" }
  },
  "apns": {
    "payload": { "aps": { "badge": 1, "sound": "default" } }
  }
}
```

**Error Handling:**
- Invalid token → remove from device registry, do not retry
- Rate limited → exponential backoff (BullMQ retry)
- Service unavailable → retry up to 3 times with backoff

### 5.2 In-App Notifications (Socket.IO)

**Connection Management:**
- Authenticated WebSocket connection per active session
- Room-based: each user joins room `user:{user_id}`
- Role-based rooms: `role:{role_name}` for broadcast

**Message Structure:**

```json
{
  "event": "notification",
  "data": {
    "id": "uuid",
    "category": "NCAT-001",
    "title": "Resolved template title",
    "body": "Resolved template body",
    "action_type": "navigate",
    "action_target": "/assignments/uuid",
    "created_at": "ISO8601",
    "read": false
  }
}
```

**Delivery Guarantee:**
- Best-effort delivery (no persistence)
- If client disconnected, notification is NOT queued (push + center cover offline)
- Client acknowledgment not required

### 5.3 Notification Center (Persistent Storage)

**Storage Structure:**

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Notification entry ID |
| user_id | UUID | Recipient user ID |
| template_id | VARCHAR | Template used (NTPL-NNN) |
| category | VARCHAR | Category (NCAT-NNN) |
| title | VARCHAR | Resolved title (user's language) |
| body | TEXT | Resolved body (user's language) |
| action_type | VARCHAR | navigate, open_url, none |
| action_target | VARCHAR | Deep link or URL |
| read | BOOLEAN | Read status (default: false) |
| read_at | TIMESTAMPTZ | When marked as read |
| created_at | TIMESTAMPTZ | When notification was created |

**API Operations:**
- List notifications (paginated, newest first)
- Mark as read (individual)
- Mark all as read (batch)
- Unread count (for badge display)
- Delete (soft-delete, user-initiated)

---

## 6. User Preferences

### 6.1 Preference Structure

Each user SHALL have per-category channel preferences:

| Field | Type | Description |
|-------|------|-------------|
| user_id | UUID | User reference |
| category | VARCHAR | NCAT-NNN |
| push_enabled | BOOLEAN | Push notification toggle |
| in_app_enabled | BOOLEAN | In-app notification toggle |
| center_enabled | BOOLEAN | Notification center toggle (always true) |

### 6.2 Default Preferences

All channels SHALL be enabled by default for all categories (RULE-NTF-004).

### 6.3 Preference Constraints

- Notification Center (center_enabled) SHALL NOT be disabled — it serves as the notification audit trail.
- Users MAY disable push and/or in-app per category.
- System notifications (NCAT-007) SHALL NOT be suppressible via preferences.

### 6.4 Quiet Hours (Future Feature)

- Feature Flag: FF-012 (disabled for MVP)
- When enabled: suppress push notifications during configured hours
- In-app and center delivery unaffected
- Default quiet hours: 22:00 - 07:00 NPT (configurable per user)

---

## 7. Timeline Service

### 7.1 Purpose

The Timeline Service SHALL auto-generate a chronological activity log for each domain entity by consuming domain events. Timelines provide a queryable history visible to authorized users.

### 7.2 Timeline Entry Structure

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Timeline entry ID |
| entity_type | VARCHAR | campaign, rider, business, assignment, payout |
| entity_id | UUID | Reference to the entity |
| event_type | VARCHAR | Domain event type (EVT-NNN) |
| title | VARCHAR | Human-readable summary |
| description | TEXT | Detailed description |
| actor_id | UUID | User who triggered the action (or SYSTEM) |
| actor_type | VARCHAR | user, system, cron |
| metadata | JSONB | Additional structured data |
| created_at | TIMESTAMPTZ | Event timestamp |

### 7.3 Event-to-Timeline Mapping

The Timeline Service SHALL subscribe to domain events and generate entries:

```
Domain Event Bus → Timeline Event Handler → Timeline Entry Creation
```

Each timeline entry SHALL be:
- Immutable (append-only)
- Queryable by entity_type + entity_id
- Ordered by created_at descending
- Retained for the lifetime of the entity

### 7.4 Per-Entity Timeline Access

| Entity Type | Viewable By | Scope |
|-------------|-------------|-------|
| Campaign | Business (own), Operations Staff+, Admin+ | All campaign lifecycle events |
| Rider | Rider (own, limited), Operations Staff+, Admin+ | Assignment, verification, payout events |
| Business | Business (own, limited), Operations Staff+, Admin+ | Registration, campaign, payment events |
| Assignment | Operations Staff+, Admin+ | Full assignment lifecycle |
| Payout | Finance Staff+, Admin+ | Payout processing events |

---

## 8. Timeline Event Catalog

### 8.1 Campaign Timeline Events

| Event Source | TLE ID | Title Template | Description |
|-------------|--------|---------------|-------------|
| EVT-001 | TLE-001 | Campaign created | "Campaign '{{name}}' created by {{actor}}" |
| EVT-002 | TLE-002 | Campaign updated | "Campaign details updated by {{actor}}" |
| EVT-003 | TLE-003 | Campaign started | "Campaign started with {{rider_count}} riders" |
| EVT-004 | TLE-004 | Campaign completed | "Campaign completed. Duration: {{days}} days" |
| EVT-005 | TLE-005 | Campaign cancelled | "Campaign cancelled by {{actor}}. Reason: {{reason}}" |
| EVT-006 | TLE-006 | Campaign paused | "Campaign paused by {{actor}}. Reason: {{reason}}" |
| EVT-007 | TLE-007 | Campaign resumed | "Campaign resumed by {{actor}}" |
| EVT-032 | TLE-008 | Payment verified | "Payment of NPR {{amount}} verified by {{actor}}" |
| EVT-034 | TLE-009 | Escrow created | "Escrow of NPR {{amount}} created" |
| EVT-025 | TLE-010 | Fulfillment reached | "All {{count}} rider positions filled" |

### 8.2 Rider Timeline Events

| Event Source | TLE ID | Title Template | Description |
|-------------|--------|---------------|-------------|
| EVT-015 | TLE-020 | Rider registered | "Rider registered via phone {{phone}}" |
| EVT-016 | TLE-021 | Documents submitted | "{{count}} documents submitted for review" |
| EVT-017 | TLE-022 | Rider approved | "Rider approved by {{actor}}" |
| EVT-020 | TLE-023 | Assigned to campaign | "Assigned to campaign '{{campaign_name}}'" |
| EVT-021 | TLE-024 | Removed from campaign | "Removed from campaign. Reason: {{reason}}" |
| EVT-042 | TLE-025 | Verification passed | "Sticker verification approved" |
| EVT-043 | TLE-026 | Verification failed | "Sticker verification rejected. Count: {{failure_count}}" |
| EVT-037 | TLE-027 | Payout received | "Payout of NPR {{amount}} via {{method}}" |

### 8.3 Business Timeline Events

| Event Source | TLE ID | Title Template | Description |
|-------------|--------|---------------|-------------|
| EVT-008 | TLE-040 | Business registered | "Business registered: {{business_name}}" |
| EVT-009 | TLE-041 | Business verified | "Business verified by {{actor}}" |
| EVT-001 | TLE-042 | Campaign created | "New campaign '{{campaign_name}}' created" |
| EVT-031 | TLE-043 | Payment submitted | "Payment of NPR {{amount}} submitted" |
| EVT-032 | TLE-044 | Payment confirmed | "Payment confirmed. Campaign proceeding." |

### 8.4 Assignment Timeline Events

| Event Source | TLE ID | Title Template | Description |
|-------------|--------|---------------|-------------|
| EVT-020 | TLE-050 | Assignment created | "{{rider_name}} assigned to {{campaign_name}}" |
| EVT-021 | TLE-051 | Rider removed | "Rider removed. Reason: {{reason}}" |
| EVT-022 | TLE-052 | Rider withdrew | "Rider withdrew voluntarily" |
| Sticker distributed | TLE-053 | Sticker applied | "Sticker distributed and applied" |
| EVT-042 | TLE-054 | Verification passed | "Periodic verification passed" |
| EVT-043 | TLE-055 | Verification failed | "Periodic verification failed" |

---

## 9. Delivery Tracking

### 9.1 Push Delivery Status

| Status | Description |
|--------|-------------|
| QUEUED | Enqueued in BullMQ for delivery |
| SENT | Successfully sent to FCM |
| DELIVERED | FCM confirmed delivery to device |
| FAILED | FCM returned error (invalid token, etc.) |
| EXPIRED | FCM TTL expired without delivery |

### 9.2 Delivery Metrics

The system SHALL track:
- Total notifications sent per channel per day
- Delivery success rate per channel
- Average delivery latency (queue to send)
- Failed delivery count and reasons

---

## 10. Traceability Matrix

| Specification Element | Upstream Reference | Rule Reference |
|----------------------|-------------------|----------------|
| Event-driven triggers | REQ-PRD-090 | RULE-NTF-001 |
| Push + in-app channels | REQ-PRD-086, REQ-PRD-087 | RULE-NTF-002 |
| Real-time delivery | REQ-PRD-092 | RULE-NTF-003 |
| User preferences | REQ-PRD-091 | RULE-NTF-004 |
| Notification center | REQ-PRD-088 | — |
| Template management | REQ-PRD-104 | — |
| Timeline per entity | REQ-PRD-105 | — |
| Timeline queryable | REQ-PRD-106 | — |
| Timeline retention | REQ-PRD-107 | — |
| Bilingual support | REQ-PRD-089 | — |

---

*End of Document 14*
