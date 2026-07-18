# Document 08 - API Specification

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every REST endpoint, WebSocket event, request/response schema, and error code defined in this document is the AUTHORITATIVE API contract. No controller, route, or gateway may expose endpoints not specified here.

---

## 1. Purpose and Scope

This document defines the complete REST API contract for all 16 endpoint domains of the Solo Advertiser platform. Every endpoint is specified with method, path, authentication requirements, permissions, error codes, and behavioral notes.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Base path | `/api/v1/` (Document 04 §10.1) |
| Format | REST + JSON exclusively |
| Documentation | OpenAPI 3.1 auto-generated from NestJS decorators |
| SDK targets | TypeScript (web) + Dart (Flutter) |
| Domains | 16 endpoint domains |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Endpoint identifiers use prefix EP-NNN.
- All endpoints require HTTPS (via Cloudflare SSL termination).
- URL paths use kebab-case; JSON bodies use camelCase.


---

## 2. API Conventions

### 2.1 Base Configuration

| Property | Value | Reference |
|----------|-------|-----------|
| Base URL | `https://api.soloadvertiser.com/api/v1/` | Document 04 §10.1 |
| Content-Type | `application/json` | REQ-PRD-159 |
| Versioning | URI-based (`/api/v1/`, `/api/v2/`) | REQ-PRD-160 |
| Naming | kebab-case URLs, camelCase JSON | Document 04 §10.1 |
| HTTP Methods | GET (read), POST (create), PATCH (update), DELETE (soft delete) | Document 04 §10.1 |

### 2.2 URL Patterns

| Pattern | Example | Usage |
|---------|---------|-------|
| Collection | GET /api/v1/riders | List resources |
| Resource | GET /api/v1/riders/:id | Get single resource |
| Sub-collection | GET /api/v1/riders/:id/documents | List nested resources |
| Action | POST /api/v1/campaigns/:id/pause | State transition |
| Nested action | POST /api/v1/auth/login/phone | Multi-step flow |

---

## 3. Request/Response Standards

### 3.1 Response Envelope

ALL responses SHALL conform to (REQ-PRD-164):

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "perPage": 20, "total": 150, "totalPages": 8 },
  "error": null
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "CAMPAIGN_003",
    "message": "Campaign fulfillment threshold not met",
    "details": { "required": 100, "current": 87 }
  }
}
```

### 3.2 Pagination

All list endpoints SHALL support offset pagination (Document 04 §10.4, ARCH-008):

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | integer | 1 | — | Page number |
| perPage | integer | 20 | 100 | Items per page |
| sortBy | string | createdAt | — | Sort field |
| sortOrder | string | desc | — | asc or desc |

### 3.3 Filtering

List endpoints SHALL support query-parameter-based filtering:

| Pattern | Example | Description |
|---------|---------|-------------|
| Exact match | `?status=active` | Filter by exact value |
| Multiple values | `?status=active,suspended` | OR filter |
| Date range | `?createdAfter=2024-01-01&createdBefore=2024-02-01` | Temporal filter |
| Search | `?search=john` | Text search across relevant fields |

### 3.4 Common Headers

| Header | Direction | Required | Description |
|--------|-----------|----------|-------------|
| Authorization | Request | Conditional | `Bearer <access_token>` |
| Content-Type | Request | Always | `application/json` |
| X-Correlation-ID | Request | Optional | Client-provided correlation ID |
| X-Correlation-ID | Response | Always | Server-generated if not provided |
| X-Request-ID | Response | Always | Unique request identifier |

---

## 4. Authentication Header Format

### 4.1 Bearer Token

All authenticated endpoints SHALL require:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

### 4.2 Authentication Responses

| Scenario | HTTP Status | Error Code |
|----------|------------|-----------|
| Missing Authorization header | 401 | AUTH_023 |
| Invalid/malformed token | 401 | AUTH_024 |
| Expired access token | 401 | AUTH_023 |
| Insufficient permissions | 403 | AUTH_025 |
| Account suspended | 403 | AUTH_022 |
| Account locked | 423 | AUTH_010 |

---

## 5. Endpoint Specifications by Domain

### 5.1 Auth Domain (/api/v1/auth)

Detailed in Document 07 §9. Summary:

| EP ID | Method | Path | Description | Auth | Permission |
|-------|--------|------|-------------|------|-----------|
| EP-001 | POST | /auth/register/rider | Rider registration (phone) | Public | — |
| EP-002 | POST | /auth/register/rider/verify-otp | Verify rider OTP | Public | — |
| EP-003 | POST | /auth/register/business | Business registration | Public | — |
| EP-004 | POST | /auth/verify-email | Email verification | Public | — |
| EP-005 | POST | /auth/login/phone | Request login OTP | Public | — |
| EP-006 | POST | /auth/login/phone/verify | Verify login OTP | Public | — |
| EP-007 | POST | /auth/login/email | Email + password login | Public | — |
| EP-008 | POST | /auth/refresh | Refresh access token | Refresh token | — |
| EP-009 | POST | /auth/logout | Logout session | Required | PERM-003 |
| EP-010 | POST | /auth/logout-all | Logout all sessions | Required | PERM-003 |
| EP-011 | GET | /auth/sessions | List active sessions | Required | PERM-004 |
| EP-012 | DELETE | /auth/sessions/:id | Revoke session | Required | PERM-005 |
| EP-013 | POST | /auth/password/change | Change password | Required | — |
| EP-014 | POST | /auth/password/forgot | Request reset | Public | — |
| EP-015 | POST | /auth/password/reset | Reset with token | Public | — |
| EP-016 | POST | /auth/staff | Create staff account | Required | PERM-007 |
| EP-017 | PATCH | /auth/staff/:id | Update staff | Required | PERM-007 |
| EP-018 | DELETE | /auth/staff/:id | Deactivate staff | Required | PERM-008 |

**Error Codes:** AUTH_001 through AUTH_025 (Document 07 §10)

### 5.2 Riders Domain (/api/v1/riders)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-019 | GET | /riders | List riders | Required | PERM-012 | Filterable: status, zone, score range |
| EP-020 | GET | /riders/me | Get own rider profile | Required | PERM-010 | Rider only |
| EP-021 | GET | /riders/:id | Get rider by ID | Required | PERM-013 | |
| EP-022 | PATCH | /riders/me | Update own profile | Required | PERM-011 | |
| EP-023 | POST | /riders/me/documents | Upload document | Required | PERM-014 | Multipart/form-data |
| EP-024 | GET | /riders/:id/documents | List rider documents | Required | PERM-013 | |
| EP-025 | PATCH | /riders/:id/documents/:docId/review | Review document | Required | PERM-015 | Approve/reject |
| EP-026 | POST | /riders/:id/verify | Verify rider identity | Required | PERM-016 | |
| EP-027 | POST | /riders/:id/suspend | Suspend rider | Required | PERM-017 | Requires reason |
| EP-028 | POST | /riders/:id/reactivate | Reactivate rider | Required | PERM-018 | |
| EP-029 | PATCH | /riders/me/availability | Update availability | Required | PERM-019 | Available/Unavailable |
| EP-030 | GET | /riders/me/score | Get own reliability score | Required | PERM-020 | |
| EP-031 | GET | /riders/:id/score | Get rider score | Required | PERM-021 | |
| EP-032 | GET | /riders/:id/assignments | List rider assignments | Required | PERM-013 | |
| EP-033 | GET | /riders/me/assignments | List own assignments | Required | PERM-043 | |

**Error Codes:** RIDER_001–RIDER_005, DOC_001–DOC_002

### 5.3 Businesses Domain (/api/v1/businesses)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-034 | GET | /businesses | List businesses | Required | PERM-024 | Filterable: status |
| EP-035 | GET | /businesses/me | Get own business profile | Required | PERM-022 | Business only |
| EP-036 | GET | /businesses/:id | Get business by ID | Required | PERM-025 | |
| EP-037 | PATCH | /businesses/me | Update own profile | Required | PERM-023 | |
| EP-038 | POST | /businesses/me/documents | Upload document | Required | PERM-026 | |
| EP-039 | GET | /businesses/:id/documents | List business documents | Required | PERM-025 | |
| EP-040 | PATCH | /businesses/:id/documents/:docId/review | Review document | Required | PERM-027 | |
| EP-041 | POST | /businesses/:id/verify | Verify business | Required | PERM-028 | |
| EP-042 | POST | /businesses/:id/suspend | Suspend business | Required | PERM-029 | Requires reason |
| EP-043 | POST | /businesses/:id/reactivate | Reactivate | Required | PERM-030 | |
| EP-044 | POST | /businesses/:id/blacklist | Blacklist business | Required | PERM-031 | Super Admin only |

**Error Codes:** BUSINESS_001–BUSINESS_004

### 5.4 Campaigns Domain (/api/v1/campaigns)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-045 | POST | /campaigns | Create campaign | Required | PERM-032 | Business only; validates RULE-CMP-001, RULE-CMP-002 |
| EP-046 | GET | /campaigns | List campaigns | Required | PERM-034 | Staff: all; Business: own |
| EP-047 | GET | /campaigns/me | List own campaigns | Required | PERM-033 | Business only |
| EP-048 | GET | /campaigns/:id | Get campaign details | Required | PERM-035 | |
| EP-049 | PATCH | /campaigns/:id | Update draft campaign | Required | PERM-036 | Only in Draft status |
| EP-050 | POST | /campaigns/:id/confirm | Confirm → Pending Payment | Required | PERM-036 | |
| EP-051 | POST | /campaigns/:id/submit-payment | Submit payment proof | Required | PERM-037 | Includes proof media |
| EP-052 | POST | /campaigns/:id/verify-payment | Verify payment | Required | PERM-038 | Finance Staff |
| EP-053 | POST | /campaigns/:id/reject-payment | Reject payment | Required | PERM-038 | Requires reason |
| EP-054 | POST | /campaigns/:id/pause | Pause campaign | Required | PERM-039 | Running only; RULE-CMP-008 |
| EP-055 | POST | /campaigns/:id/resume | Resume campaign | Required | PERM-039 | Paused only |
| EP-056 | POST | /campaigns/:id/cancel | Cancel campaign | Required | PERM-040/041 | RULE-CMP-009 |
| EP-057 | GET | /campaigns/:id/fulfillment | Get fulfillment status | Required | PERM-035 | |
| EP-058 | GET | /campaigns/:id/assignments | List campaign assignments | Required | PERM-044 | |

**Error Codes:** CAMPAIGN_001–CAMPAIGN_005, PAYMENT_001

### 5.5 Assignments Domain (/api/v1/assignments)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-059 | POST | /assignments | Create assignment | Required | PERM-042 | Validates RULE-ASN-001 to RULE-ASN-004 |
| EP-060 | POST | /assignments/bulk | Bulk create assignments | Required | PERM-042 | Array of rider/campaign pairs |
| EP-061 | GET | /assignments | List assignments | Required | PERM-044 | Filterable: campaign, rider, status |
| EP-062 | GET | /assignments/:id | Get assignment details | Required | PERM-045 | |
| EP-063 | POST | /assignments/:id/remove | Remove rider | Required | PERM-046 | Requires reason (RULE-ASN-005) |
| EP-064 | POST | /assignments/:id/replace | Replace rider | Required | PERM-047 | Remove + create in one operation |
| EP-065 | GET | /assignments/:id/fulfillment | Get daily fulfillment | Required | PERM-045 | |

**Error Codes:** ASSIGN_001–ASSIGN_004, RIDER_003–RIDER_005


### 5.6 Stickers Domain (/api/v1/stickers)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-066 | POST | /stickers/templates | Create template | Required | PERM-048 | Links to campaign creative |
| EP-067 | GET | /stickers/templates | List templates | Required | PERM-054 | Filterable: campaign |
| EP-068 | GET | /stickers/templates/:id | Get template | Required | PERM-054 | |
| EP-069 | POST | /stickers/orders | Create print order | Required | PERM-049 | RULE-STK-002 |
| EP-070 | GET | /stickers/orders | List print orders | Required | PERM-054 | |
| EP-071 | PATCH | /stickers/orders/:id | Update order status | Required | PERM-049 | |
| EP-072 | POST | /stickers/batches | Receive batch | Required | PERM-050 | RULE-STK-005 |
| EP-073 | GET | /stickers/batches | List batches | Required | PERM-054 | |
| EP-074 | POST | /stickers/distributions | Record distribution | Required | PERM-051 | RULE-STK-003 (photo required) |
| EP-075 | GET | /stickers/distributions | List distributions | Required | PERM-054 | |
| EP-076 | POST | /stickers/verifications | Submit verification | Required | PERM-052 | Rider submits photo |
| EP-077 | GET | /stickers/verifications | List verifications | Required | PERM-053 | Filterable: status, rider, assignment |
| EP-078 | PATCH | /stickers/verifications/:id/review | Review verification | Required | PERM-053 | Approve/reject |
| EP-079 | GET | /stickers/inventory/:campaignId | Campaign inventory | Required | PERM-054 | Aggregated counts |
| EP-080 | GET | /stickers/vendors | List vendors | Required | PERM-054 | |
| EP-081 | POST | /stickers/vendors | Create vendor | Required | PERM-048 | |

**Error Codes:** STICKER_001–STICKER_004, VERIFY_001–VERIFY_004

### 5.7 Finance Domain (/api/v1/finance)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-082 | GET | /finance/ledger | Query ledger entries | Required | PERM-055 | Filterable: account, date range, reference |
| EP-083 | GET | /finance/ledger/accounts | List ledger accounts | Required | PERM-055 | |
| EP-084 | GET | /finance/escrows | List escrows | Required | PERM-056 | Filterable: campaign, status |
| EP-085 | GET | /finance/escrows/:id | Get escrow details | Required | PERM-056 | Includes releases |
| EP-086 | GET | /finance/wallets/me | Get own wallet | Required | PERM-057 | Rider only |
| EP-087 | GET | /finance/wallets/:riderId | Get rider wallet | Required | PERM-058 | Finance Staff |
| EP-088 | GET | /finance/wallets/:riderId/transactions | Wallet transaction history | Required | PERM-058 | |
| EP-089 | GET | /finance/wallets/me/transactions | Own transaction history | Required | PERM-057 | |
| EP-090 | POST | /finance/payouts/generate | Generate payout batch | Required | PERM-059 | |
| EP-091 | GET | /finance/payouts/batches | List payout batches | Required | PERM-060 | |
| EP-092 | GET | /finance/payouts/batches/:id | Get batch details | Required | PERM-060 | Includes items |
| EP-093 | POST | /finance/payouts/batches/:id/approve | Approve batch | Required | PERM-060 | RULE-PAY-004 |
| EP-094 | PATCH | /finance/payouts/items/:id | Update payout item | Required | PERM-060 | Mark completed/failed |
| EP-095 | GET | /finance/payouts/me | Get own payout history | Required | PERM-061 | Rider only |
| EP-096 | POST | /finance/wallets/:riderId/adjust | Manual adjustment | Required | PERM-064 | Requires reason |
| EP-097 | GET | /finance/reconciliation | Reconciliation report | Required | PERM-063 | |

**Error Codes:** PAYMENT_001–PAYMENT_007

### 5.8 Notifications Domain (/api/v1/notifications)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-098 | GET | /notifications | List own notifications | Required | PERM-088 | Filterable: read status, category |
| EP-099 | GET | /notifications/unread-count | Get unread count | Required | PERM-088 | |
| EP-100 | PATCH | /notifications/:id/read | Mark as read | Required | PERM-088 | |
| EP-101 | POST | /notifications/mark-all-read | Mark all read | Required | PERM-088 | |
| EP-102 | GET | /notifications/preferences | Get preferences | Required | PERM-089 | |
| EP-103 | PATCH | /notifications/preferences | Update preferences | Required | PERM-089 | |

**Error Codes:** NOTIFY_001

### 5.9 Configuration Domain (/api/v1/config)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-104 | GET | /config/settings | List settings | Required | PERM-065 | Filtered by role visibility |
| EP-105 | GET | /config/settings/:key | Get setting | Required | PERM-065 | |
| EP-106 | PATCH | /config/settings/:key | Update setting | Required | PERM-066 | Super Admin; validates value |
| EP-107 | GET | /config/settings/:key/history | Setting history | Required | PERM-071 | |
| EP-108 | GET | /config/flags | List feature flags | Required | PERM-067 | |
| EP-109 | GET | /config/flags/:key | Get flag | Required | PERM-067 | |
| EP-110 | PATCH | /config/flags/:key | Toggle flag | Required | PERM-068 | Super Admin |
| EP-111 | GET | /config/dictionary | List dictionaries | Required | PERM-069 | |
| EP-112 | GET | /config/dictionary/:code | Get dictionary items | Required | PERM-069 | |
| EP-113 | POST | /config/dictionary/:code/items | Add item | Required | PERM-070 | Super Admin |
| EP-114 | PATCH | /config/dictionary/:code/items/:key | Update item | Required | PERM-070 | |
| EP-115 | DELETE | /config/dictionary/:code/items/:key | Deactivate item | Required | PERM-070 | Soft deactivate |

**Error Codes:** CONFIG_001

### 5.10 Audit Domain (/api/v1/audit)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-116 | GET | /audit | Query audit entries | Required | PERM-072 | Super Admin only |
| EP-117 | GET | /audit/:id | Get audit entry | Required | PERM-072 | |
| EP-118 | GET | /audit/entity/:type/:id | Entity audit trail | Required | PERM-072 | |
| EP-119 | GET | /audit/actor/:userId | Actor activity log | Required | PERM-072 | |

All audit endpoints are READ-ONLY. No create/update/delete operations exist (REQ-PRD-101).

**Error Codes:** None (read-only)

### 5.11 Timeline Domain (/api/v1/timeline)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-120 | GET | /timeline/:entityType/:entityId | Get entity timeline | Required | PERM-074 | |
| EP-121 | GET | /timeline/me | Get own timeline | Required | PERM-073 | Rider/Business |

All timeline endpoints are READ-ONLY.

**Error Codes:** None (read-only)

### 5.12 Media Domain (/api/v1/media)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-122 | POST | /media/upload | Upload file | Required | PERM-075 | Multipart/form-data; max 10MB |
| EP-123 | GET | /media/:id | Get media metadata | Required | PERM-075 | |
| EP-124 | GET | /media/:id/url | Get signed download URL | Required | PERM-075 | Time-limited signed URL |
| EP-125 | DELETE | /media/:id | Delete media | Required | PERM-076/077 | Soft delete |
| EP-126 | GET | /media/:id/variants | List variants | Required | PERM-075 | Thumbnails, compressed |

**Error Codes:** MEDIA_001


### 5.13 Support Domain (/api/v1/support)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-127 | POST | /support/tickets | Create ticket | Required | PERM-078 | Rider/Business |
| EP-128 | GET | /support/tickets | List tickets | Required | PERM-079/080 | Own or all (by role) |
| EP-129 | GET | /support/tickets/:id | Get ticket details | Required | PERM-079/080 | |
| EP-130 | POST | /support/tickets/:id/messages | Add message | Required | PERM-079/080 | |
| EP-131 | PATCH | /support/tickets/:id/status | Update ticket status | Required | PERM-080 | Staff only |
| EP-132 | PATCH | /support/tickets/:id/assign | Assign to staff | Required | PERM-081 | |
| EP-133 | POST | /support/tickets/:id/resolve | Resolve ticket | Required | PERM-080 | |
| EP-134 | GET | /support/tickets/:id/messages | List messages | Required | PERM-079/080 | |

**Error Codes:** SYSTEM_001

### 5.14 Analytics Domain (/api/v1/analytics)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-135 | GET | /analytics/dashboard | Get dashboard metrics | Required | PERM-082 | Role-scoped data |
| EP-136 | GET | /analytics/metrics/:metricName | Get specific metric | Required | PERM-082 | With time range |
| EP-137 | GET | /analytics/reports | List report definitions | Required | PERM-084 | |
| EP-138 | GET | /analytics/reports/:id | Get report definition | Required | PERM-084 | |
| EP-139 | POST | /analytics/reports/:id/export | Request export | Required | PERM-085 | Async job |
| EP-140 | GET | /analytics/exports | List export jobs | Required | PERM-085 | |
| EP-141 | GET | /analytics/exports/:id | Get export status | Required | PERM-085 | |
| EP-142 | GET | /analytics/campaigns/:id/performance | Campaign performance | Required | PERM-083/084 | Business: own; Staff: all |

**Error Codes:** SYSTEM_001

### 5.15 Zones Domain (/api/v1/zones)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-143 | GET | /zones | List zones | Required | PERM-086 | All authenticated |
| EP-144 | GET | /zones/:id | Get zone details | Required | PERM-086 | Includes wards |
| EP-145 | POST | /zones | Create zone | Required | PERM-087 | Super Admin (RULE-ZON-002) |
| EP-146 | PATCH | /zones/:id | Update zone | Required | PERM-087 | |
| EP-147 | DELETE | /zones/:id | Delete zone | Required | PERM-087 | |
| EP-148 | GET | /zones/:id/wards | List zone wards | Required | PERM-086 | |
| EP-149 | POST | /zones/:id/wards | Add wards to zone | Required | PERM-087 | |
| EP-150 | DELETE | /zones/:id/wards/:wardId | Remove ward | Required | PERM-087 | |

**Error Codes:** ZONE_001–ZONE_003

### 5.16 Health Domain (/api/v1/health)

| EP ID | Method | Path | Description | Auth | Permission | Notes |
|-------|--------|------|-------------|------|-----------|-------|
| EP-151 | GET | /health | System health check | Public | — | Document 04 §13.1 |
| EP-152 | GET | /health/detailed | Detailed health | Required | Admin+ | Includes component status |

**Response (EP-151):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 86400
}
```

---

## 6. WebSocket Events

### 6.1 Connection

**URL:** `wss://api.soloadvertiser.com/socket.io/`  
**Auth:** JWT access token in handshake `auth` payload  
**Library:** Socket.IO 4+

### 6.2 Namespaces and Events

**Namespace: /notifications**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| notification.new | Server → Client | { id, title, body, category, data, createdAt } | New notification |
| notification.read | Client → Server | { notificationId } | Mark as read |
| notification.count | Server → Client | { unread: number } | Updated unread count |

**Namespace: /config**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| config.updated | Server → Client | { type, key, value, previousValue, updatedAt } | Setting changed |
| feature.toggled | Server → Client | { key, enabled, updatedAt } | Flag toggled |
| dictionary.updated | Server → Client | { code, key, action, updatedAt } | Dictionary changed |

**Namespace: /campaigns**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| campaign.status_changed | Server → Client | { campaignId, oldStatus, newStatus, updatedAt } | Status transition |
| campaign.fulfillment_updated | Server → Client | { campaignId, percent, assignedRiders } | Fulfillment change |

**Namespace: /admin**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| dashboard.metric_updated | Server → Client | { metric, value, delta, updatedAt } | Live metric update |
| system.alert | Server → Client | { level, message, details } | System alert |

### 6.3 Connection Events

| Event | Direction | Description |
|-------|-----------|-------------|
| connect | Client → Server | Initial connection with auth token |
| connect_error | Server → Client | Authentication failure |
| disconnect | Bidirectional | Connection closed |
| session.invalidated | Server → Client | Session revoked, must reconnect |

---

## 7. Rate Limiting

Per Document 04 §14.5:

| Category | Limit | Window | Applies To |
|----------|-------|--------|-----------|
| Authentication | 10 requests | 15 minutes | EP-001 to EP-007, EP-014, EP-015 |
| OTP generation | 5 requests | 15 minutes | EP-001, EP-005 |
| Token refresh | 30 requests | 1 minute | EP-008 |
| File upload | 20 requests | 1 hour | EP-122 |
| Standard API (authenticated) | 100 requests | 1 minute | All authenticated endpoints |
| Public endpoints | 30 requests | 1 minute | EP-151 |
| Export generation | 5 requests | 1 hour | EP-139 |

**Rate Limit Headers (Response):**

| Header | Description |
|--------|-------------|
| X-RateLimit-Limit | Maximum requests in window |
| X-RateLimit-Remaining | Remaining requests |
| X-RateLimit-Reset | Window reset timestamp (Unix epoch) |

**Rate Limit Exceeded Response (429):**
```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "SYSTEM_002",
    "message": "Rate limit exceeded",
    "details": { "retryAfter": 45 }
  }
}
```

---

## 8. SDK Generation

### 8.1 TypeScript SDK (Web Applications)

- Generated from OpenAPI 3.1 spec using `openapi-generator-cli`.
- Target: `typescript-axios` or `typescript-fetch` generator.
- Output: NPM package consumed by Business Portal and Admin Panel.
- Includes: Typed request/response interfaces, API client classes, enum types.

### 8.2 Dart SDK (Flutter Mobile App)

- Generated from OpenAPI 3.1 spec using `openapi-generator-cli`.
- Target: `dart-dio` generator.
- Output: Dart package consumed by Rider Mobile App.
- Includes: Typed models, API client, serialization/deserialization.

### 8.3 Generation Rules

1. SDK generation SHALL be automated in the CI/CD pipeline on OpenAPI spec changes.
2. Generated SDKs SHALL include all request/response types from this document.
3. Breaking API changes SHALL increment the SDK major version.
4. SDKs SHALL handle token refresh transparently via interceptors.

---

## 9. Traceability

### 9.1 Endpoints to Requirements

| Requirement | Endpoints |
|-------------|-----------|
| REQ-PRD-001 (Rider phone registration) | EP-001, EP-002 |
| REQ-PRD-002 (Business email registration) | EP-003, EP-004 |
| REQ-PRD-003 (JWT auth) | EP-005–EP-008 |
| REQ-PRD-008 (Session management) | EP-011, EP-012 |
| REQ-PRD-039 (Min 100 riders) | EP-045 (validates) |
| REQ-PRD-040 (Min 15 days) | EP-045 (validates) |
| REQ-PRD-054 (Manual assignment) | EP-059, EP-060 |
| REQ-PRD-080 (Payout approval) | EP-093 |
| REQ-PRD-093 (Config service) | EP-104–EP-115 |
| REQ-PRD-094 (Feature flags) | EP-108–EP-110 |
| REQ-PRD-095 (Dictionary) | EP-111–EP-115 |
| REQ-PRD-099 (Audit log) | EP-116–EP-119 |
| REQ-PRD-104 (Timeline) | EP-120, EP-121 |
| REQ-PRD-108 (Media service) | EP-122–EP-126 |
| REQ-PRD-114 (Support tickets) | EP-127–EP-134 |
| REQ-PRD-121 (Analytics) | EP-135–EP-142 |
| REQ-PRD-159 (REST conventions) | All endpoints |
| REQ-PRD-160 (Versioning) | /api/v1/ prefix |
| REQ-PRD-161 (OpenAPI docs) | §8 SDK Generation |
| REQ-PRD-163 (Pagination) | §3.2 |
| REQ-PRD-164 (Response envelope) | §3.1 |
| REQ-PRD-165 (Real-time WebSocket) | §6 |

### 9.2 Endpoints to Permissions

| Domain | Endpoint Range | Key Permissions |
|--------|---------------|----------------|
| Auth | EP-001–EP-018 | PERM-001–PERM-009 |
| Riders | EP-019–EP-033 | PERM-010–PERM-021 |
| Businesses | EP-034–EP-044 | PERM-022–PERM-031 |
| Campaigns | EP-045–EP-058 | PERM-032–PERM-041 |
| Assignments | EP-059–EP-065 | PERM-042–PERM-047 |
| Stickers | EP-066–EP-081 | PERM-048–PERM-054 |
| Finance | EP-082–EP-097 | PERM-055–PERM-064 |
| Notifications | EP-098–EP-103 | PERM-088–PERM-089 |
| Configuration | EP-104–EP-115 | PERM-065–PERM-071 |
| Audit | EP-116–EP-119 | PERM-072 |
| Timeline | EP-120–EP-121 | PERM-073–PERM-074 |
| Media | EP-122–EP-126 | PERM-075–PERM-077 |
| Support | EP-127–EP-134 | PERM-078–PERM-081 |
| Analytics | EP-135–EP-142 | PERM-082–PERM-085 |
| Zones | EP-143–EP-150 | PERM-086–PERM-087 |
| Health | EP-151–EP-152 | Public / Admin |

### 9.3 Error Code Registry

| Domain | Code Pattern | Range | Total |
|--------|-------------|-------|-------|
| Authentication | AUTH_0XX | AUTH_001–AUTH_025 | 25 |
| Business | BUSINESS_0XX | BUSINESS_001–BUSINESS_004 | 4 |
| Rider | RIDER_0XX | RIDER_001–RIDER_005 | 5 |
| Campaign | CAMPAIGN_0XX | CAMPAIGN_001–CAMPAIGN_005 | 5 |
| Payment | PAYMENT_0XX | PAYMENT_001–PAYMENT_007 | 7 |
| Sticker | STICKER_0XX | STICKER_001–STICKER_004 | 4 |
| Assignment | ASSIGN_0XX | ASSIGN_001–ASSIGN_004 | 4 |
| Verification | VERIFY_0XX | VERIFY_001–VERIFY_004 | 4 |
| Zone | ZONE_0XX | ZONE_001–ZONE_003 | 3 |
| Document | DOC_0XX | DOC_001–DOC_002 | 2 |
| Media | MEDIA_0XX | MEDIA_001 | 1 |
| Configuration | CONFIG_0XX | CONFIG_001 | 1 |
| Notification | NOTIFY_0XX | NOTIFY_001 | 1 |
| System | SYSTEM_0XX | SYSTEM_001–SYSTEM_002 | 2 |
| **Total** | | | **68** |

### 9.4 Document Statistics

| Metric | Value |
|--------|-------|
| Total endpoints | 152 |
| API domains | 16 |
| WebSocket namespaces | 4 |
| WebSocket event types | 12 |
| Error codes | 68 |
| Rate limit categories | 7 |
| SDK targets | 2 (TypeScript, Dart) |
| Public endpoints | 12 (auth + health) |
| Authenticated endpoints | 140 |

---

*End of Document 08 - API Specification*
