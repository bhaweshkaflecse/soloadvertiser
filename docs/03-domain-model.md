# Document 03 - Domain Model

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every domain entity, relationship, event, and boundary defined in this document SHALL be the single source of truth for engineering implementation. No module may introduce domain concepts, aggregates, or inter-module communication patterns not defined here.

---

## 1. Purpose and Scope

This document defines the canonical domain model for the Solo Advertiser platform. It serves as the bridge between business rules (Document 02) and engineering implementation by establishing:


- Bounded contexts with explicit responsibilities and boundaries
- Aggregate roots with their constituent entities and value objects
- Data ownership — single source of truth per entity
- Inter-context relationships and communication patterns
- A complete domain event catalog with sources, payloads, and consumers
- Shared kernel definitions and anti-corruption layer specifications

### 1.1 Scope

This model covers the MVP deployment:

- **Architecture:** NestJS modular monolith
- **Geography:** Kathmandu Valley, Nepal
- **Scale:** 8,000–15,000 riders, 500–1,500 businesses
- **Communication:** In-process event bus for domain events; direct service calls for synchronous read queries only

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Identifiers use the prefix format: CTX-NNN (bounded contexts), AGG-NNN (aggregates), EVT-NNN (domain events).
- All aggregates enforce their own invariants; no external module may bypass aggregate boundaries.

---

## 2. Bounded Contexts

The platform is decomposed into 14 bounded contexts. Each context SHALL own its database tables exclusively — no cross-context table access is permitted.

| ID | Context | Module Name | Responsibility |
|----|---------|-------------|----------------|
| CTX-001 | Identity & Auth | `IdentityModule` | User registration, authentication, session management, RBAC, account security |
| CTX-002 | Rider Domain | `RiderModule` | Rider lifecycle, documents, profile, reliability score, availability, zone assignment |
| CTX-003 | Business Domain | `BusinessModule` | Business lifecycle, documents, profile, billing information |
| CTX-004 | Campaign Domain | `CampaignModule` | Campaign lifecycle, fulfillment tracking, capacity management, cost calculation |
| CTX-005 | Assignment Domain | `AssignmentModule` | Rider-campaign matching, assignment lifecycle, replacement, fulfillment, score triggers |
| CTX-006 | Sticker Inventory | `StickerModule` | Templates, print orders, vendors, batches, inventory counts, distribution, verification tracking |
| CTX-007 | Financial Platform | `FinanceModule` | Double-entry ledger, escrow, rider wallets, payout batches, invoices, reconciliation |
| CTX-008 | Notification Domain | `NotificationModule` | Push/in-app delivery, notification center, template versioning, delivery tracking, preferences |
| CTX-009 | Configuration Service | `ConfigModule` | Platform settings, feature flags, system dictionary, real-time propagation |
| CTX-010 | Audit Domain | `AuditModule` | Immutable append-only log of all significant operations |
| CTX-011 | Timeline Service | `TimelineModule` | Auto-generated entity timelines from domain events |
| CTX-012 | Media Service | `MediaModule` | File upload, Cloudflare R2 storage, signed URLs, image optimization, cleanup |
| CTX-013 | Support Domain | `SupportModule` | Tickets, disputes, resolution workflow, SLA tracking |
| CTX-014 | Analytics Domain | `AnalyticsModule` | Metrics aggregation, dashboards, report generation, data export |


### 2.1 Context Boundary Rules

1. Each context SHALL own its database tables exclusively (no shared tables).
2. State mutations in one context SHALL be communicated to other contexts via domain events only.
3. Synchronous read queries across context boundaries SHALL use published service interfaces (read-only).
4. No context SHALL directly modify another context's aggregate state.
5. Each context SHALL validate its own invariants independently of other contexts.

---

## 3. Aggregates

### 3.1 CTX-001 — Identity & Auth

**AGG-001: User**

| Component | Type | Description |
|-----------|------|-------------|
| User | Aggregate Root | Base identity for all platform participants |
| UserCredential | Entity | Authentication credentials (phone/email, password hash, OTP state) |
| Session | Entity | Active device session with token references |
| Role | Value Object | Assigned RBAC role (Rider, Business, Operations Staff, Finance Staff, Admin, Super Admin) |
| LoginAttempt | Value Object | Record of authentication attempt (success/failure, IP, device) |

**Invariants:**
- A User SHALL have exactly one Role assigned at creation (traces to REQ-PRD-004).
- Account SHALL be locked after 5 consecutive failed attempts (enforces RULE-SEC-001).
- Staff accounts SHALL only be created by Super Admin (enforces REQ-PRD-009).
- Access tokens SHALL expire within 15 minutes; refresh tokens within 7 days (REQ-PRD-213, REQ-PRD-214).
- Suspension SHALL invalidate all active sessions (REQ-PRD-005).


### 3.2 CTX-002 — Rider Domain

**AGG-002: Rider**

| Component | Type | Description |
|-----------|------|-------------|
| Rider | Aggregate Root | Extended rider profile with lifecycle state machine |
| RiderProfile | Entity | Personal info, vehicle details, payment preferences |
| RiderDocument | Entity | Uploaded document with review status and expiry |
| ReliabilityScore | Value Object | Composite score (0–100) with five weighted components |
| ZoneAssignment | Value Object | Ward-based zone where rider operates |

**State Machine:** Pre-Registered → Documents Pending → Verification Pending → Approved → Available → Assigned → Campaign Active → Unavailable → Suspended

**Invariants:**
- A Rider SHALL NOT transition to Documents Pending without all required documents submitted (enforces RULE-RDR-002).
- A Rider SHALL NOT be assigned to more than 1 campaign per asset type concurrently (enforces RULE-RDR-003).
- Only riders in Available status SHALL receive new assignments (enforces RULE-RDR-005).
- Suspended riders SHALL NOT receive assignments (enforces RULE-RDR-004).
- ReliabilityScore SHALL be recalculated upon assignment completion or verification event (enforces RULE-RDR-006).
- Documents SHALL follow their own lifecycle: Uploaded → Under Review → Approved/Rejected → Expired → Replacement Required.

### 3.3 CTX-003 — Business Domain

**AGG-003: Business**

| Component | Type | Description |
|-----------|------|-------------|
| Business | Aggregate Root | Business entity with lifecycle state machine |
| BusinessProfile | Entity | Company information, contact details, billing info |
| BusinessDocument | Entity | Uploaded document with review status |
| ContactPerson | Value Object | Authorized representative details |

**State Machine:** Registered → Documents Pending → Under Review → Verified → Active → Suspended → Blacklisted

**Invariants:**
- A Business SHALL NOT transition to Documents Pending without PAN/VAT certificate, business registration, and representative ID (enforces RULE-BIZ-002).
- Only Verified or Active businesses SHALL create campaigns (enforces RULE-BIZ-004).
- A Verified Business SHALL transition to Active upon first campaign creation (enforces RULE-BIZ-005).
- Blacklisted businesses SHALL NOT perform any write operations (enforces RULE-BIZ-008).
- Only Super Admin SHALL blacklist a business (enforces RULE-BIZ-007).


### 3.4 CTX-004 — Campaign Domain

**AGG-004: Campaign**

| Component | Type | Description |
|-----------|------|-------------|
| Campaign | Aggregate Root | Campaign entity with lifecycle state machine |
| CampaignSpec | Value Object | Name, target zones, required riders, start/end dates, duration, asset type |
| CampaignCost | Value Object | Total cost calculation (riders x days x business_daily_rate) |
| FulfillmentStatus | Value Object | Current rider count vs. required count, percentage |

**State Machine:** Draft → Pending Payment → Payment Submitted → Payment Verified → Recruiting Riders → Ready → Running → Completed / Paused / Cancelled

**Invariants:**
- Duration SHALL be >= configured minimum (15 days) (enforces RULE-CMP-001).
- Required riders SHALL be >= configured minimum (100) (enforces RULE-CMP-002).
- All monetary values SHALL be in NPR exclusively (enforces RULE-CMP-010).
- Campaign SHALL NOT skip Payment states to reach Recruiting Riders (enforces RULE-CMP-005).
- Transition to Ready requires 100% fulfillment threshold (enforces RULE-CMP-004).
- Only Admin/Super Admin SHALL cancel a Running campaign (enforces RULE-CMP-009).
- Campaign SHALL reference exactly one Business as owner (downstream of CTX-003).

### 3.5 CTX-005 — Assignment Domain

**AGG-005: Assignment**

| Component | Type | Description |
|-----------|------|-------------|
| Assignment | Aggregate Root | Rider-to-campaign binding with its own lifecycle |
| AssignmentFulfillment | Entity | Daily tracking of completed vs. required days |
| RemovalRecord | Value Object | Documented reason, actor, timestamp for removal |
| ScoreContribution | Value Object | Calculated score impact upon completion |

**State Machine:** Suggested → Assigned → Sticker Pending → Distributed → Installed → Active → Completed / Removed

**Invariants:**
- Rider zone SHALL overlap with campaign target zones (enforces RULE-ASN-001).
- No conflicting active assignment on same asset type with overlapping dates (enforces RULE-ASN-002).
- Only Operations Staff or higher SHALL create assignments (enforces RULE-ASN-003).
- Campaign SHALL be in Recruiting Riders state for new assignments (enforces RULE-ASN-004).
- Removal SHALL require documented reason stored in audit trail (enforces RULE-ASN-005).
- Removal below fulfillment threshold SHALL trigger replacement recruitment (enforces RULE-ASN-006).


### 3.6 CTX-006 — Sticker Inventory

**AGG-006: StickerTemplate**

| Component | Type | Description |
|-----------|------|-------------|
| StickerTemplate | Aggregate Root | Creative specification linked to a campaign |
| PrintOrder | Entity | Manufacturing order to a vendor with delivery schedule |
| StickerBatch | Entity | Physical batch received with unique batch identifier |
| InventoryCount | Value Object | Real-time count: total, distributed, installed, damaged, returned |

**AGG-007: StickerDistribution**

| Component | Type | Description |
|-----------|------|-------------|
| StickerDistribution | Aggregate Root | Individual sticker assignment to a rider |
| DistributionProof | Value Object | Photographic evidence of distribution event |
| VerificationRecord | Entity | Periodic verification submission with photo, status, timestamp |
| VerificationEscalation | Value Object | Failure count tracking (warning → suspension → removal) |

**Invariants:**
- Every template SHALL link to exactly one campaign creative (enforces RULE-STK-001).
- Print orders SHALL specify vendor, quantity, template, expected delivery (enforces RULE-STK-002).
- Distribution SHALL require photographic proof (enforces RULE-STK-003).
- Batch identifiers SHALL be unique (enforces RULE-STK-005).
- Verification SHALL be required every 7 days for active riders (enforces RULE-VRF-001).
- Third verification failure SHALL trigger campaign removal (enforces RULE-VRF-004).

### 3.7 CTX-007 — Financial Platform

**AGG-008: Ledger**

| Component | Type | Description |
|-----------|------|-------------|
| Ledger | Aggregate Root | Immutable append-only financial record |
| LedgerEntry | Entity | Individual double-entry transaction (debit + credit) |
| LedgerAccount | Value Object | Account classification: Accounts Receivable, Campaign Escrow, Platform Revenue, Rider Liability, Rider Payout |

**AGG-009: CampaignEscrow**

| Component | Type | Description |
|-----------|------|-------------|
| CampaignEscrow | Aggregate Root | Held funds for a specific campaign |
| EscrowRelease | Entity | Daily release record (amount, date, campaign day number) |
| EscrowRefund | Entity | Refund record on cancellation with calculation details |

**AGG-010: RiderWallet**

| Component | Type | Description |
|-----------|------|-------------|
| RiderWallet | Aggregate Root | Individual rider's accumulated earnings balance |
| WalletTransaction | Entity | Credit (daily earning) or debit (payout) entry |

**AGG-011: PayoutBatch**

| Component | Type | Description |
|-----------|------|-------------|
| PayoutBatch | Aggregate Root | Batch of rider payouts for a cycle |
| PayoutItem | Entity | Individual rider payout within the batch |
| PayoutProof | Value Object | Transfer proof uploaded by Finance Staff |

**Invariants:**
- All ledger entries SHALL balance (debits = credits) (enforces RULE-FIN-004).
- Ledger entries SHALL be append-only; no UPDATE/DELETE (enforces RULE-FIN-006).
- Escrow SHALL be created upon payment verification for full campaign amount (enforces RULE-CMP-006).
- Daily release = total_escrow / total_days (enforces RULE-FIN-005).
- Payout SHALL NOT process for balance < NPR 500 (enforces RULE-PAY-002).
- Payout completion SHALL require proof upload (enforces RULE-PAY-005).
- Finance Staff SHALL manually approve payout batches (enforces RULE-PAY-004).


### 3.8 CTX-008 — Notification Domain

**AGG-012: Notification**

| Component | Type | Description |
|-----------|------|-------------|
| Notification | Aggregate Root | Individual notification to a user |
| DeliveryAttempt | Entity | Record of delivery via each channel (push, in-app) |
| NotificationTemplate | Entity | Versioned template with variables and language support |
| UserPreference | Value Object | Per-user channel enable/disable settings |

**Invariants:**
- Notifications SHALL be delivered via configured channels respecting user preferences (enforces RULE-NTF-002, RULE-NTF-004).
- Real-time delivery SHALL occur within 5 seconds via WebSocket (enforces RULE-NTF-003).
- Templates SHALL support versioning; only enabled templates SHALL be used (REQ-PRD-089).

### 3.9 CTX-009 — Configuration Service

**AGG-013: PlatformConfiguration**

| Component | Type | Description |
|-----------|------|-------------|
| PlatformConfiguration | Aggregate Root | Complete platform settings registry |
| ConfigEntry | Entity | Individual key-value setting with validation rules |
| FeatureFlag | Entity | Boolean toggle controlling feature availability |
| DictionaryItem | Entity | UI label, message, or configurable text entry |
| ConfigChangeRecord | Value Object | Before/after snapshot with actor and timestamp |

**Invariants:**
- Only Super Admin SHALL modify configuration and feature flags (enforces REQ-PRD-097).
- Changes SHALL be propagated in real-time to connected clients (enforces REQ-PRD-096).
- All configuration changes SHALL maintain history (enforces REQ-PRD-098).
- All enumerations SHALL be dictionary-driven; no hardcoded enums in application code.

### 3.10 CTX-010 — Audit Domain

**AGG-014: AuditLog**

| Component | Type | Description |
|-----------|------|-------------|
| AuditLog | Aggregate Root | Immutable append-only audit record store |
| AuditEntry | Entity | Individual operation record with full context |
| AuditContext | Value Object | Who, What, Before, After, Reason, IP, Device, Time |

**Invariants:**
- Entries SHALL be immutable — no UPDATE or DELETE permitted (enforces REQ-PRD-101, REQ-PRD-156).
- Every significant state change SHALL generate an audit entry (enforces REQ-PRD-099).
- Audit records SHALL be retained for minimum 3 years (enforces REQ-PRD-103, REQ-PRD-226).
- This context is a pure event consumer; it SHALL NOT produce domain events.


### 3.11 CTX-011 — Timeline Service

**AGG-015: EntityTimeline**

| Component | Type | Description |
|-----------|------|-------------|
| EntityTimeline | Aggregate Root | Chronological event view per tracked entity |
| TimelineEntry | Entity | Individual event record with type, timestamp, actor, description |
| EntityReference | Value Object | Link to source entity (rider, business, campaign, assignment) |

**Invariants:**
- Timeline entries SHALL be auto-generated from consumed domain events (enforces REQ-PRD-104).
- Timelines SHALL be queryable per entity type and ID (enforces REQ-PRD-105).
- This context is a pure event consumer; it SHALL NOT produce domain events.

### 3.12 CTX-012 — Media Service

**AGG-016: MediaAsset**

| Component | Type | Description |
|-----------|------|-------------|
| MediaAsset | Aggregate Root | Uploaded file with storage reference |
| StorageReference | Value Object | Cloudflare R2 bucket, key, signed URL |
| ImageVariant | Entity | Optimized variant (thumbnail, compressed) |
| AccessControl | Value Object | Owning context, entity reference, visibility rules |

**Invariants:**
- Files SHALL be validated for type and size before upload (enforces RULE-DOC-005).
- Media SHALL be associated with parent entities via reference metadata (enforces REQ-PRD-112).
- Signed URLs SHALL be time-limited for secure access (enforces REQ-PRD-113).
- This context is a shared utility; it SHALL NOT contain domain logic beyond file management.

### 3.13 CTX-013 — Support Domain

**AGG-017: SupportTicket**

| Component | Type | Description |
|-----------|------|-------------|
| SupportTicket | Aggregate Root | Issue or dispute with lifecycle |
| TicketMessage | Entity | Individual message in conversation thread |
| SLATracker | Value Object | Response time and resolution time tracking |
| DisputeDetails | Value Object | Financial or campaign dispute specifics |

**State Machine:** Open → In Progress → Awaiting Response → Resolved → Closed

**Invariants:**
- Tickets SHALL be categorized by type: technical, financial, campaign, verification, general (enforces REQ-PRD-115).
- SLA tracking SHALL enforce configurable response and resolution times (enforces REQ-PRD-120).
- Complete conversation history SHALL be maintained (enforces REQ-PRD-119).
- Only Operations Staff or higher SHALL manage tickets (enforces REQ-PRD-116).

### 3.14 CTX-014 — Analytics Domain

**AGG-018: MetricsAggregation**

| Component | Type | Description |
|-----------|------|-------------|
| MetricsAggregation | Aggregate Root | Pre-computed metrics store for dashboards |
| MetricSnapshot | Entity | Point-in-time metric value (active campaigns, riders, revenue, etc.) |
| ReportDefinition | Entity | Configured report with parameters and schedule |
| ExportJob | Entity | Data export request with format (CSV/PDF) and status |

**Invariants:**
- Metrics SHALL be derived from consumed domain events (pure downstream consumer).
- Reports SHALL support CSV and PDF export formats (enforces REQ-PRD-124).
- Super Admin SHALL access platform-wide analytics (enforces REQ-PRD-127).
- This context SHALL NOT modify any upstream context state.


---

## 4. Ownership

Each entity SHALL have exactly one owning context that serves as the single source of truth. Other contexts MAY hold read-only projections (denormalized copies) but SHALL NOT treat them as authoritative.

| Entity / Concept | Owning Context | Consumers (Read Projections) |
|------------------|----------------|------------------------------|
| User, Session, Role | CTX-001 Identity & Auth | All contexts (for auth checks) |
| Rider, RiderProfile, RiderDocument | CTX-002 Rider Domain | CTX-005 Assignment, CTX-007 Finance, CTX-014 Analytics |
| ReliabilityScore | CTX-002 Rider Domain | CTX-005 Assignment, CTX-014 Analytics |
| ZoneAssignment | CTX-002 Rider Domain | CTX-005 Assignment |
| Business, BusinessProfile, BusinessDocument | CTX-003 Business Domain | CTX-004 Campaign, CTX-007 Finance, CTX-014 Analytics |
| Campaign, CampaignSpec, FulfillmentStatus | CTX-004 Campaign Domain | CTX-005 Assignment, CTX-006 Sticker, CTX-007 Finance |
| Assignment, AssignmentFulfillment | CTX-005 Assignment Domain | CTX-002 Rider, CTX-004 Campaign, CTX-007 Finance |
| StickerTemplate, PrintOrder, StickerBatch | CTX-006 Sticker Inventory | CTX-004 Campaign, CTX-005 Assignment |
| StickerDistribution, VerificationRecord | CTX-006 Sticker Inventory | CTX-005 Assignment, CTX-002 Rider |
| Ledger, LedgerEntry | CTX-007 Financial Platform | CTX-014 Analytics |
| CampaignEscrow | CTX-007 Financial Platform | CTX-004 Campaign |
| RiderWallet | CTX-007 Financial Platform | CTX-002 Rider (balance display) |
| PayoutBatch | CTX-007 Financial Platform | CTX-014 Analytics |
| Notification, NotificationTemplate | CTX-008 Notification Domain | None (terminal consumer) |
| PlatformConfiguration, FeatureFlag, DictionaryItem | CTX-009 Configuration Service | All contexts (consumers) |
| AuditEntry | CTX-010 Audit Domain | CTX-014 Analytics |
| TimelineEntry | CTX-011 Timeline Service | None (terminal consumer) |
| MediaAsset | CTX-012 Media Service | CTX-002 Rider, CTX-003 Business, CTX-006 Sticker |
| SupportTicket | CTX-013 Support Domain | CTX-014 Analytics |
| MetricsAggregation | CTX-014 Analytics Domain | None (terminal consumer) |

### 4.1 Ownership Rules

1. The owning context SHALL be the only context that can CREATE, UPDATE, or DELETE an entity.
2. Consumer contexts SHALL maintain read projections via event-driven synchronization.
3. If a consumer's projection becomes stale, the owning context's data SHALL be treated as authoritative.
4. Cross-context references SHALL use stable entity IDs (UUIDs), never foreign-key joins across module tables.


---

## 5. Relationships and Context Map

### 5.1 Context Map Overview

```
                            ┌──────────────────┐
                            │  CTX-009 Config  │ (Upstream Supplier)
                            │   Service        │
                            └────────┬─────────┘
                                     │ Publishes settings to ALL
                    ┌────────────────┼────────────────────────────────┐
                    │                │                                 │
         ┌──────────▼──┐   ┌────────▼────┐   ┌──────────────┐   ┌───▼────────────┐
         │ CTX-001     │   │ CTX-002     │   │ CTX-003      │   │ CTX-012 Media  │
         │ Identity    │   │ Rider       │   │ Business     │   │ Service        │
         └──────┬──────┘   └──────┬──────┘   └──────┬───────┘   └────────────────┘
                │                  │                  │               (Shared Utility)
                │                  │                  │
                │          ┌──────▼──────┐   ┌──────▼───────┐
                │          │ CTX-005     │◄──│ CTX-004      │
                │          │ Assignment  │   │ Campaign     │
                │          └──────┬──────┘   └──────┬───────┘
                │                  │                  │
                │          ┌──────▼──────┐   ┌──────▼───────┐
                │          │ CTX-006     │   │ CTX-007      │
                │          │ Sticker Inv │   │ Finance      │
                │          └─────────────┘   └──────────────┘
                │
     ┌──────────┼──────────────────────────────────────────┐
     │          │                                           │
┌────▼────┐ ┌──▼──────┐ ┌──────────┐ ┌──────────┐ ┌──────▼────┐
│CTX-008  │ │CTX-010  │ │CTX-011   │ │CTX-013   │ │CTX-014    │
│Notif.   │ │Audit    │ │Timeline  │ │Support   │ │Analytics  │
└─────────┘ └─────────┘ └──────────┘ └──────────┘ └───────────┘
              (Pure Downstream Consumers)
```

### 5.2 Relationship Types

| Upstream | Downstream | Relationship Pattern | Communication |
|----------|-----------|---------------------|---------------|
| CTX-009 Configuration | ALL contexts | Published Language (Supplier) | Synchronous read + WebSocket push |
| CTX-001 Identity & Auth | ALL contexts | Published Language (Supplier) | Synchronous read (auth validation) |
| CTX-003 Business | CTX-004 Campaign | Customer-Supplier | Event (BusinessVerified) + sync read |
| CTX-004 Campaign | CTX-005 Assignment | Customer-Supplier | Event (CampaignFunded) + sync read |
| CTX-002 Rider | CTX-005 Assignment | Customer-Supplier | Sync read (availability, zone) |
| CTX-005 Assignment | CTX-006 Sticker | Customer-Supplier | Event (AssignmentCreated) + sync read |
| CTX-004 Campaign | CTX-006 Sticker | Customer-Supplier | Sync read (creative reference) |
| CTX-004 Campaign | CTX-007 Finance | Customer-Supplier | Event (CampaignFunded, CampaignCompleted, CampaignCancelled) |
| CTX-005 Assignment | CTX-007 Finance | Customer-Supplier | Event (AssignmentCompleted daily) |
| CTX-002 Rider | CTX-007 Finance | Customer-Supplier | Event (RiderApproved → wallet creation) |
| CTX-012 Media | CTX-002, CTX-003, CTX-006 | Shared Kernel (Utility) | Synchronous service call |
| ALL producing contexts | CTX-008 Notification | Event Consumer (Downstream) | Domain events → notification triggers |
| ALL producing contexts | CTX-010 Audit | Event Consumer (Downstream) | Domain events → audit entries |
| ALL producing contexts | CTX-011 Timeline | Event Consumer (Downstream) | Domain events → timeline entries |
| ALL producing contexts | CTX-014 Analytics | Event Consumer (Downstream) | Domain events → metrics aggregation |


### 5.3 Communication Rules

1. **Event-driven (asynchronous):** SHALL be used for all state change notifications between contexts. Events are processed via in-process event bus.
2. **Synchronous service call:** SHALL be used ONLY for read queries where the caller needs current state to make a decision (e.g., Assignment reads Rider availability before creation).
3. **WebSocket push:** SHALL be used by CTX-009 Configuration for real-time settings propagation to connected clients.
4. Events SHALL be fire-and-forget from the producer's perspective; producers SHALL NOT wait for consumer acknowledgment.
5. Event consumers SHALL be idempotent — processing the same event twice SHALL produce the same result.

---

## 6. Domain Events

### 6.1 Event Envelope

Every domain event SHALL conform to the following base schema:

```
{
  eventId: UUID,
  eventType: string,
  occurredAt: ISO8601 timestamp,
  actorId: UUID | "SYSTEM",
  actorRole: Role,
  aggregateId: UUID,
  aggregateType: string,
  contextId: CTX-NNN,
  payload: { ... },
  metadata: { ip?: string, device?: string, correlationId: UUID }
}
```

### 6.2 Campaign Events

| ID | Event | Source Context | Payload | Consumers |
|----|-------|---------------|---------|-----------|
| EVT-001 | CampaignCreated | CTX-004 | { campaignId, businessId, spec, cost } | CTX-003, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-002 | CampaignFunded | CTX-004 | { campaignId, amount, escrowId } | CTX-007, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-003 | CampaignStarted | CTX-004 | { campaignId, startDate, riderCount } | CTX-005, CTX-007, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-004 | CampaignCompleted | CTX-004 | { campaignId, endDate, fulfillmentPct } | CTX-005, CTX-007, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-005 | CampaignCancelled | CTX-004 | { campaignId, reason, cancelledBy, daysCompleted } | CTX-005, CTX-007, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-006 | CampaignPaused | CTX-004 | { campaignId, reason, pausedBy } | CTX-005, CTX-007, CTX-008, CTX-010, CTX-011 |
| EVT-007 | CampaignResumed | CTX-004 | { campaignId, resumedBy } | CTX-005, CTX-007, CTX-008, CTX-010, CTX-011 |


### 6.3 Rider Events

| ID | Event | Source Context | Payload | Consumers |
|----|-------|---------------|---------|-----------|
| EVT-008 | RiderRegistered | CTX-002 | { riderId, phone, zone } | CTX-001, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-009 | RiderVerified | CTX-002 | { riderId, verifiedBy } | CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-010 | RiderApproved | CTX-002 | { riderId, approvedBy } | CTX-007, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-011 | RiderSuspended | CTX-002 | { riderId, reason, suspendedBy } | CTX-001, CTX-005, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-012 | RiderReactivated | CTX-002 | { riderId, reactivatedBy } | CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-013 | RiderAvailable | CTX-002 | { riderId, zone } | CTX-005, CTX-010, CTX-011, CTX-014 |
| EVT-014 | RiderUnavailable | CTX-002 | { riderId, reason } | CTX-005, CTX-010, CTX-011, CTX-014 |

### 6.4 Business Events

| ID | Event | Source Context | Payload | Consumers |
|----|-------|---------------|---------|-----------|
| EVT-015 | BusinessRegistered | CTX-003 | { businessId, email, companyName } | CTX-001, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-016 | BusinessVerified | CTX-003 | { businessId, verifiedBy } | CTX-004, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-017 | BusinessActivated | CTX-003 | { businessId, firstCampaignId } | CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-018 | BusinessSuspended | CTX-003 | { businessId, reason, suspendedBy } | CTX-001, CTX-004, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-019 | BusinessBlacklisted | CTX-003 | { businessId, blacklistedBy } | CTX-001, CTX-004, CTX-008, CTX-010, CTX-011, CTX-014 |

### 6.5 Assignment Events

| ID | Event | Source Context | Payload | Consumers |
|----|-------|---------------|---------|-----------|
| EVT-020 | AssignmentCreated | CTX-005 | { assignmentId, riderId, campaignId, zone } | CTX-002, CTX-004, CTX-006, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-021 | AssignmentDistributed | CTX-005 | { assignmentId, stickerId, distributedAt } | CTX-006, CTX-008, CTX-010, CTX-011 |
| EVT-022 | AssignmentInstalled | CTX-005 | { assignmentId, installedAt, proofMediaId } | CTX-006, CTX-008, CTX-010, CTX-011 |
| EVT-023 | AssignmentCompleted | CTX-005 | { assignmentId, riderId, campaignId, daysCompleted } | CTX-002, CTX-004, CTX-007, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-024 | AssignmentRemoved | CTX-005 | { assignmentId, riderId, reason, removedBy } | CTX-002, CTX-004, CTX-006, CTX-007, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-025 | AssignmentFulfilled | CTX-005 | { campaignId, fulfillmentPct } | CTX-004, CTX-010, CTX-011 |


### 6.6 Verification Events

| ID | Event | Source Context | Payload | Consumers |
|----|-------|---------------|---------|-----------|
| EVT-026 | VerificationSubmitted | CTX-006 | { verificationId, riderId, assignmentId, mediaId } | CTX-008, CTX-010, CTX-011 |
| EVT-027 | VerificationApproved | CTX-006 | { verificationId, riderId, approvedBy } | CTX-002, CTX-005, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-028 | VerificationRejected | CTX-006 | { verificationId, riderId, reason, failureCount } | CTX-002, CTX-005, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-029 | VerificationExpired | CTX-006 | { riderId, assignmentId, overdueByDays } | CTX-002, CTX-005, CTX-008, CTX-010, CTX-011 |
| EVT-030 | VerificationWarned | CTX-006 | { riderId, assignmentId, failureCount: 1 } | CTX-002, CTX-008, CTX-010, CTX-011 |

### 6.7 Financial Events

| ID | Event | Source Context | Payload | Consumers |
|----|-------|---------------|---------|-----------|
| EVT-031 | PaymentSubmitted | CTX-007 | { paymentId, campaignId, amount, method } | CTX-004, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-032 | PaymentVerified | CTX-007 | { paymentId, campaignId, verifiedBy } | CTX-004, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-033 | PaymentRejected | CTX-007 | { paymentId, campaignId, reason, rejectedBy } | CTX-004, CTX-008, CTX-010, CTX-011 |
| EVT-034 | EscrowCreated | CTX-007 | { escrowId, campaignId, amount } | CTX-004, CTX-010, CTX-011, CTX-014 |
| EVT-035 | EscrowReleased | CTX-007 | { escrowId, campaignId, dayNumber, amount } | CTX-004, CTX-010, CTX-011, CTX-014 |
| EVT-036 | EscrowRefunded | CTX-007 | { escrowId, campaignId, refundAmount, reason } | CTX-003, CTX-004, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-037 | PayoutBatchGenerated | CTX-007 | { batchId, cycleDate, riderCount, totalAmount } | CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-038 | PayoutCompleted | CTX-007 | { batchId, riderId, amount, method } | CTX-002, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-039 | PayoutFailed | CTX-007 | { batchId, riderId, reason } | CTX-002, CTX-008, CTX-010, CTX-011 |


### 6.8 Document Events

| ID | Event | Source Context | Payload | Consumers |
|----|-------|---------------|---------|-----------|
| EVT-040 | DocumentUploaded | CTX-002/CTX-003 | { documentId, ownerId, ownerType, docType } | CTX-008, CTX-010, CTX-011 |
| EVT-041 | DocumentApproved | CTX-002/CTX-003 | { documentId, ownerId, approvedBy } | CTX-008, CTX-010, CTX-011 |
| EVT-042 | DocumentRejected | CTX-002/CTX-003 | { documentId, ownerId, reason, rejectedBy } | CTX-008, CTX-010, CTX-011 |
| EVT-043 | DocumentExpired | CTX-002/CTX-003 | { documentId, ownerId, expiredAt } | CTX-008, CTX-010, CTX-011 |

### 6.9 Sticker Events

| ID | Event | Source Context | Payload | Consumers |
|----|-------|---------------|---------|-----------|
| EVT-044 | StickerTemplateCreated | CTX-006 | { templateId, campaignId, assetType } | CTX-004, CTX-008, CTX-010, CTX-011 |
| EVT-045 | StickerPrintOrdered | CTX-006 | { orderId, templateId, vendorId, quantity } | CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-046 | StickerBatchReceived | CTX-006 | { batchId, orderId, quantity, receivedAt } | CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-047 | StickerDistributed | CTX-006 | { distributionId, riderId, assignmentId, batchId } | CTX-005, CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-048 | StickerInstalled | CTX-006 | { distributionId, riderId, installedAt, proofMediaId } | CTX-005, CTX-008, CTX-010, CTX-011 |
| EVT-049 | StickerRemoved | CTX-006 | { distributionId, riderId, reason, removedAt } | CTX-005, CTX-008, CTX-010, CTX-011 |

### 6.10 Configuration Events

| ID | Event | Source Context | Payload | Consumers |
|----|-------|---------------|---------|-----------|
| EVT-050 | SettingsUpdated | CTX-009 | { key, oldValue, newValue, updatedBy } | ALL contexts, CTX-010, CTX-011 |
| EVT-051 | FeatureFlagToggled | CTX-009 | { flagKey, enabled, toggledBy } | ALL contexts, CTX-010, CTX-011 |
| EVT-052 | DictionaryItemAdded | CTX-009 | { itemKey, category, value, language } | ALL contexts, CTX-010, CTX-011 |

### 6.11 Score Events

| ID | Event | Source Context | Payload | Consumers |
|----|-------|---------------|---------|-----------|
| EVT-053 | RiderScoreUpdated | CTX-002 | { riderId, oldScore, newScore, components } | CTX-005, CTX-008, CTX-010, CTX-011, CTX-014 |

### 6.12 Support Events

| ID | Event | Source Context | Payload | Consumers |
|----|-------|---------------|---------|-----------|
| EVT-054 | TicketCreated | CTX-013 | { ticketId, userId, category, subject } | CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-055 | TicketAssigned | CTX-013 | { ticketId, assignedTo } | CTX-008, CTX-010, CTX-011 |
| EVT-056 | TicketResolved | CTX-013 | { ticketId, resolvedBy, resolution } | CTX-008, CTX-010, CTX-011, CTX-014 |
| EVT-057 | TicketEscalated | CTX-013 | { ticketId, escalatedTo, reason } | CTX-008, CTX-010, CTX-011 |

### 6.13 Notification Events

| ID | Event | Source Context | Payload | Consumers |
|----|-------|---------------|---------|-----------|
| EVT-058 | NotificationSent | CTX-008 | { notificationId, userId, channel, templateId } | CTX-010, CTX-011 |
| EVT-059 | NotificationDelivered | CTX-008 | { notificationId, userId, channel, deliveredAt } | CTX-010, CTX-011 |
| EVT-060 | NotificationRead | CTX-008 | { notificationId, userId, readAt } | CTX-010, CTX-011 |


### 6.14 Event Governance Rules

1. Events SHALL be named in past tense (e.g., CampaignCreated, not CreateCampaign).
2. Event payloads SHALL contain only IDs and essential state; consumers SHALL query owning services for full entity details if needed.
3. Events SHALL be immutable once published; schema evolution SHALL use additive changes only.
4. Every event SHALL carry a correlationId for request tracing across contexts.
5. Events SHALL be processed asynchronously; producers SHALL NOT depend on consumer side effects for their own invariant enforcement.
6. Event ordering SHALL be guaranteed within a single aggregate; cross-aggregate ordering is not guaranteed.

---

## 7. Shared Kernel

The following concepts are shared across multiple bounded contexts and SHALL maintain consistent definitions.

### 7.1 Geographic Model

| Concept | Definition | Used By |
|---------|-----------|---------|
| Region | Top-level geographic division (Kathmandu Valley) | CTX-002, CTX-004, CTX-005, CTX-009 |
| Zone | Collection of one or more wards within a region | CTX-002, CTX-004, CTX-005, CTX-009 |
| Ward | Administrative subdivision; smallest geographic unit | CTX-002, CTX-004, CTX-005, CTX-009 |

**Constraints:**
- Zone definitions SHALL be managed exclusively by Super Admin via CTX-009 (enforces RULE-ZON-002).
- All zones SHALL be within Kathmandu Valley boundary (enforces RULE-ZON-003).
- A zone SHALL contain at least one ward (enforces RULE-ZON-001).

### 7.2 Money Value Object

| Concept | Definition | Used By |
|---------|-----------|---------|
| Money | Amount + Currency (NPR only in MVP) | CTX-004, CTX-007 |
| DailyRate | Money value per rider per day | CTX-004, CTX-007, CTX-009 |

**Constraints:**
- Currency SHALL be NPR exclusively (enforces RULE-CMP-010).
- Monetary calculations SHALL use integer arithmetic (paisa precision) to avoid floating-point errors.

### 7.3 Asset Type Model

| Concept | Definition | Used By |
|---------|-----------|---------|
| AssetType | Generic advertising surface type (dictionary-driven) | CTX-004, CTX-005, CTX-006, CTX-009 |

**Constraints:**
- Asset types SHALL be extensible via configuration without code changes (enforces RULE-STK-006).
- MVP supports "helmet" only; dictionary SHALL contain additional types for future activation.

### 7.4 Audit Context Value Object

| Concept | Definition | Used By |
|---------|-----------|---------|
| AuditContext | { who, what, before, after, reason, ip, device, time } | ALL contexts (attached to state-changing operations) |

**Constraints:**
- Every state-changing operation SHALL construct an AuditContext (enforces REQ-PRD-100, REQ-PRD-216).
- AuditContext SHALL be passed as metadata with domain events for CTX-010 consumption.

### 7.5 Entity Lifecycle Pattern

All stateful aggregates SHALL implement a consistent lifecycle pattern:

| Concept | Definition | Used By |
|---------|-----------|---------|
| StatusField | Enum-like field (dictionary-driven) representing current aggregate state | CTX-002, CTX-003, CTX-004, CTX-005, CTX-006, CTX-013 |
| StateTransition | { fromStatus, toStatus, trigger, actor, timestamp } | All stateful aggregates |
| SoftDelete | Logical deletion via `deleted_at` timestamp; never physical deletion | All business entities |

**Constraints:**
- All entities SHALL include standard audit fields: created_at, updated_at, created_by, updated_by (enforces REQ-PRD-151).
- Soft deletes SHALL be used for business entities (enforces REQ-PRD-150).
- Status values SHALL be dictionary-driven; no hardcoded enums in code.


---

## 8. Anti-Corruption Layers

Anti-corruption layers (ACLs) SHALL be implemented where contexts have significantly different models or where upstream changes must not propagate internal model instability.

### 8.1 ACL Definitions

| ID | Boundary | Upstream | Downstream | Translation Required |
|----|----------|----------|------------|---------------------|
| ACL-001 | Identity → Rider | CTX-001 | CTX-002 | User ID + Role → RiderIdentity (stripped of auth details) |
| ACL-002 | Identity → Business | CTX-001 | CTX-003 | User ID + Role → BusinessIdentity (stripped of auth details) |
| ACL-003 | Campaign → Finance | CTX-004 | CTX-007 | Campaign cost model → Financial instrument (escrow parameters) |
| ACL-004 | Assignment → Finance | CTX-005 | CTX-007 | Daily fulfillment → Wallet credit transaction |
| ACL-005 | Sticker Verification → Assignment | CTX-006 | CTX-005 | Verification failure count → Assignment status change trigger |
| ACL-006 | Configuration → All consumers | CTX-009 | ALL | Raw config entry → Typed, validated domain parameter |

### 8.2 ACL Implementation Rules

1. Each ACL SHALL be implemented as a dedicated adapter/translator class at the consuming context boundary.
2. ACLs SHALL validate incoming data before transforming it into the local context's model.
3. If an upstream event contains invalid data per the local context's rules, the ACL SHALL log a warning and discard the event (fail-safe).
4. ACLs SHALL NOT contain business logic; they perform structural translation only.
5. ACL changes SHALL NOT require changes in the upstream context.

---

## 9. Non-Functional Constraints

### 9.1 Data Isolation

| Constraint | Specification | Traces To |
|-----------|---------------|-----------|
| Table ownership | Each context SHALL own its tables exclusively; no cross-module joins | REQ-PRD-221, REQ-PRD-222 |
| Database | PostgreSQL SHALL be the sole relational store | REQ-PRD-148 |
| Caching | Redis SHALL be used for cross-cutting caches (config, sessions, feature flags) | REQ-PRD-152 |
| File storage | Cloudflare R2 exclusively via CTX-012 | REQ-PRD-154 |
| Job queues | Redis-backed queues for async processing (notifications, payouts, scheduled tasks) | REQ-PRD-153 |

### 9.2 Consistency Model

| Constraint | Specification | Traces To |
|-----------|---------------|-----------|
| Intra-aggregate | Strong consistency (single DB transaction) | REQ-PRD-158 |
| Inter-aggregate (same context) | Eventual consistency via internal events | REQ-PRD-158 |
| Inter-context | Eventual consistency via domain event bus | Architecture decision |
| Financial operations | Strong consistency within ledger aggregate (balanced debits/credits) | RULE-FIN-004 |

### 9.3 Performance Constraints

| Constraint | Specification | Traces To |
|-----------|---------------|-----------|
| Event processing latency | Domain events SHALL be processed within 1 second of emission | REQ-PRD-203 |
| Notification delivery | Real-time notifications SHALL reach connected clients within 5 seconds | RULE-NTF-003 |
| API response (CRUD) | < 200ms at p95 | REQ-PRD-200 |
| API response (complex) | < 2 seconds at p95 | REQ-PRD-201 |

### 9.4 Data Retention

| Constraint | Specification | Traces To |
|-----------|---------------|-----------|
| Audit logs | Minimum 3 years retention | REQ-PRD-226 |
| Financial records | Minimum 5 years retention | REQ-PRD-227 |
| User data | Active account lifetime + 1 year post-deactivation | REQ-PRD-228 |
| Domain events | SHALL be retained for replay capability; minimum 1 year | Architecture decision |

### 9.5 Scalability Constraints

| Constraint | Specification | Traces To |
|-----------|---------------|-----------|
| Target scale | 15,000 riders, 1,500 businesses on single VPS | REQ-PRD-202, REQ-PRD-218 |
| Horizontal scaling | Application layer SHALL support Docker container scaling | REQ-PRD-217 |
| Connection pooling | Required for database connections | REQ-PRD-220 |
| Indexing strategy | Optimized for read-heavy workloads | REQ-PRD-219 |


---

## 10. Traceability

### 10.1 Context to Requirements

| Context ID | Context | Primary Requirements | Primary Rules |
|-----------|---------|---------------------|---------------|
| CTX-001 | Identity & Auth | REQ-PRD-001 to REQ-PRD-010 | RULE-SEC-001 |
| CTX-002 | Rider Domain | REQ-PRD-011 to REQ-PRD-024 | RULE-RDR-001 to RULE-RDR-008 |
| CTX-003 | Business Domain | REQ-PRD-025 to REQ-PRD-035 | RULE-BIZ-001 to RULE-BIZ-008 |
| CTX-004 | Campaign Domain | REQ-PRD-036 to REQ-PRD-053 | RULE-CMP-001 to RULE-CMP-010 |
| CTX-005 | Assignment Domain | REQ-PRD-054 to REQ-PRD-062 | RULE-ASN-001 to RULE-ASN-006 |
| CTX-006 | Sticker Inventory | REQ-PRD-063 to REQ-PRD-070 | RULE-STK-001 to RULE-STK-006, RULE-VRF-001 to RULE-VRF-006 |
| CTX-007 | Financial Platform | REQ-PRD-071 to REQ-PRD-085 | RULE-FIN-001 to RULE-FIN-007, RULE-PAY-001 to RULE-PAY-007 |
| CTX-008 | Notification Domain | REQ-PRD-086 to REQ-PRD-092 | RULE-NTF-001 to RULE-NTF-004 |
| CTX-009 | Configuration Service | REQ-PRD-093 to REQ-PRD-098 | All CONFIGURATION taxonomy rules |
| CTX-010 | Audit Domain | REQ-PRD-099 to REQ-PRD-103 | N/A (pure consumer) |
| CTX-011 | Timeline Service | REQ-PRD-104 to REQ-PRD-107 | N/A (pure consumer) |
| CTX-012 | Media Service | REQ-PRD-108 to REQ-PRD-113 | RULE-DOC-005 |
| CTX-013 | Support Domain | REQ-PRD-114 to REQ-PRD-120 | N/A |
| CTX-014 | Analytics Domain | REQ-PRD-121 to REQ-PRD-127 | N/A (pure consumer) |

### 10.2 Aggregate to Context

| Aggregate ID | Aggregate | Context |
|-------------|-----------|---------|
| AGG-001 | User | CTX-001 |
| AGG-002 | Rider | CTX-002 |
| AGG-003 | Business | CTX-003 |
| AGG-004 | Campaign | CTX-004 |
| AGG-005 | Assignment | CTX-005 |
| AGG-006 | StickerTemplate | CTX-006 |
| AGG-007 | StickerDistribution | CTX-006 |
| AGG-008 | Ledger | CTX-007 |
| AGG-009 | CampaignEscrow | CTX-007 |
| AGG-010 | RiderWallet | CTX-007 |
| AGG-011 | PayoutBatch | CTX-007 |
| AGG-012 | Notification | CTX-008 |
| AGG-013 | PlatformConfiguration | CTX-009 |
| AGG-014 | AuditLog | CTX-010 |
| AGG-015 | EntityTimeline | CTX-011 |
| AGG-016 | MediaAsset | CTX-012 |
| AGG-017 | SupportTicket | CTX-013 |
| AGG-018 | MetricsAggregation | CTX-014 |

### 10.3 Event to Rule Enforcement

| Event ID | Event | Enforces / Triggered By |
|----------|-------|------------------------|
| EVT-001 | CampaignCreated | RULE-BIZ-004, RULE-BIZ-005, RULE-CMP-001, RULE-CMP-002 |
| EVT-002 | CampaignFunded | RULE-CMP-005, RULE-CMP-006 |
| EVT-003 | CampaignStarted | RULE-CMP-004 (fulfillment threshold met) |
| EVT-004 | CampaignCompleted | Campaign end date reached |
| EVT-005 | CampaignCancelled | RULE-CMP-007, RULE-CMP-009 |
| EVT-010 | RiderApproved | RULE-RDR-002 (documents complete) |
| EVT-011 | RiderSuspended | RULE-RDR-004 (blocks future assignments) |
| EVT-020 | AssignmentCreated | RULE-ASN-001 to RULE-ASN-004, RULE-RDR-003, RULE-RDR-005 |
| EVT-023 | AssignmentCompleted | RULE-RDR-006 (score recalculation), RULE-FIN-002 |
| EVT-024 | AssignmentRemoved | RULE-ASN-005, RULE-ASN-006, RULE-RDR-008 |
| EVT-027 | VerificationApproved | RULE-VRF-005, RULE-VRF-006 |
| EVT-028 | VerificationRejected | RULE-VRF-002, RULE-VRF-003, RULE-VRF-004 |
| EVT-032 | PaymentVerified | RULE-CMP-006, RULE-PAY-007 |
| EVT-034 | EscrowCreated | RULE-FIN-004 (balanced entry) |
| EVT-035 | EscrowReleased | RULE-FIN-005 |
| EVT-037 | PayoutBatchGenerated | RULE-PAY-001, RULE-PAY-002 |
| EVT-038 | PayoutCompleted | RULE-PAY-005 |
| EVT-053 | RiderScoreUpdated | RULE-RDR-006 |


### 10.4 Document Statistics

| Metric | Value |
|--------|-------|
| Bounded Contexts | 14 |
| Aggregates | 18 |
| Domain Events | 60 |
| Anti-Corruption Layers | 6 |
| Shared Kernel Concepts | 5 |
| Requirements Covered | REQ-PRD-001 through REQ-PRD-228 |
| Rules Enforced | 72 (all rules from Document 02) |

### 10.5 Downstream Document References

This document is referenced by the following downstream specifications:

| Downstream Document | Usage |
|--------------------|-------|
| 04. System Architecture | Module boundaries, event bus design, service interfaces |
| 05. Data Model | Aggregate-to-table mapping, column definitions from value objects |
| 06. Configuration & Dictionary | CTX-009 aggregate details, dictionary keys |
| 07. Authentication & Permissions | CTX-001 aggregate, role model, session lifecycle |
| 08. API Specification | Aggregate operations mapped to REST endpoints |
| 12. Campaign & Assignment | CTX-004, CTX-005 state machines, event flows |
| 13. Financial Platform | CTX-007 ledger model, escrow flow, payout cycle |
| 14. Notifications & Timeline | CTX-008, CTX-011 event consumption patterns |
| 17. Testing Strategy | Aggregate invariants as test contracts |

---

*End of Document 03 - Domain Model*