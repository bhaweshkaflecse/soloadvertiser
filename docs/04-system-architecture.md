# Document 04 - System Architecture

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every technology choice, container boundary, communication pattern, and infrastructure decision defined in this document is LOCKED for MVP implementation. No downstream specification may introduce architectural components, deployment targets, or technology substitutions not sanctioned here.

---

## 1. Purpose and Scope

This document translates the domain model (Document 03) into a deployable technical system. It defines the complete infrastructure topology, technology stack, module structure, communication patterns, and operational procedures that SHALL govern the Solo Advertiser platform.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Deployment target | Single Contabo VPS 6 (6 vCPU, 12GB RAM, 200GB SSD) |
| Architecture style | Modular monolith (NestJS) |
| Containerization | Docker + Docker Compose |
| Scale target (MVP) | 8,000–15,000 riders, 500–1,500 businesses |
| Geography | Kathmandu Valley, Nepal |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Architecture decisions use prefix ARCH-NNN.
- Service/container identifiers use prefix SVC-NNN.
- All decisions trace to Document 01 requirements, Document 02 rules, and Document 03 domain model.


---

## 2. Architecture Overview

### 2.1 High-Level Topology

The Solo Advertiser platform is deployed as a set of Docker containers orchestrated via Docker Compose on a single Contabo VPS 6 instance. External traffic arrives via Cloudflare Proxy (SSL termination) and is routed by Nginx to the appropriate application container.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Cloudflare Proxy (SSL)                          │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────▼───────────────────────────────────────────┐
│                     SVC-001: Nginx (Reverse Proxy)                       │
│   api.soloadvertiser.com → backend:3000                                 │
│   admin.soloadvertiser.com → admin:3001                                 │
│   business.soloadvertiser.com → business:3002                           │
└────┬──────────────────────┬──────────────────────┬──────────────────────┘
     │                      │                      │
┌────▼─────┐         ┌─────▼──────┐        ┌──────▼─────┐
│ SVC-002  │         │  SVC-004   │        │  SVC-005   │
│ Backend  │         │  Admin     │        │  Business  │
│ (NestJS) │         │  (Next.js) │        │  (Next.js) │
└────┬─────┘         └────────────┘        └────────────┘
     │
     ├──────────────────────────────────────────────────┐
     │                                                  │
┌────▼─────┐    ┌──────────┐    ┌──────────┐    ┌──────▼─────┐
│ SVC-006  │    │ SVC-007  │    │ SVC-008  │    │  SVC-003   │
│ Postgres │    │  Redis   │    │   Cron   │    │  Worker    │
│          │    │          │    │          │    │            │
└──────────┘    └──────────┘    └──────────┘    └────────────┘
```

### 2.2 Design Principles

| ID | Principle | Rationale |
|----|-----------|-----------|
| ARCH-001 | Modular monolith over microservices | Single VPS deployment; operational simplicity; team size appropriate for monolith (traces to REQ-PRD-221) |
| ARCH-002 | Docker containers for all services | Consistent environments across dev/prod; isolation without VM overhead (traces to REQ-PRD-225) |
| ARCH-003 | Domain-driven module boundaries | Each NestJS module maps 1:1 to a bounded context from Document 03 (traces to REQ-PRD-222) |
| ARCH-004 | Event-driven inter-module communication | Loose coupling between modules; async processing for non-critical paths (traces to Document 03 §5.3) |
| ARCH-005 | Single database, schema-isolated modules | PostgreSQL schema prefixes per module; no cross-module table joins (traces to Document 03 §2.1) |


---

## 3. Technology Stack

All technology choices are LOCKED for MVP. No substitutions SHALL be made without a formal Architecture Decision Record amendment.

| Layer | Technology | Version | Rationale | Traces To |
|-------|-----------|---------|-----------|-----------|
| Mobile App | Flutter | Latest stable | Cross-platform (iOS/Android) from single codebase | REQ-PRD-168–175 |
| Business Portal | React + Next.js | Next.js 14+ | SSR for SEO, React ecosystem, TypeScript | REQ-PRD-176–182 |
| Admin Panel | React + Next.js | Next.js 14+ | Shared component library with Business Portal | REQ-PRD-183–199 |
| Super Admin Panel | React + Next.js | Next.js 14+ | Extended Admin Panel with elevated features | REQ-PRD-191–199 |
| Backend Runtime | Node.js | 20 LTS | Long-term support, async I/O for concurrent connections | REQ-PRD-202 |
| Backend Framework | NestJS | 10+ | Modular architecture, TypeScript, decorators for OpenAPI | REQ-PRD-221, REQ-PRD-161 |
| ORM | TypeORM or Prisma | Latest | Type-safe database access, migrations | REQ-PRD-148 |
| Database | PostgreSQL | 16 | ACID compliance, JSONB, mature ecosystem | REQ-PRD-148, REQ-PRD-149 |
| Cache / Queue Broker | Redis | 7 | In-memory speed, pub/sub, sorted sets, streams | REQ-PRD-152, REQ-PRD-153 |
| Job Queue Library | BullMQ | Latest | Redis-backed, reliable job processing, delayed jobs | REQ-PRD-153 |
| Object Storage | Cloudflare R2 | N/A | S3-compatible, no egress fees, built-in durability | REQ-PRD-154 |
| Real-time | Socket.IO | 4+ | WebSocket with fallback, room-based broadcasting | REQ-PRD-165–167 |
| Reverse Proxy | Nginx | Latest stable | High-performance routing, static file serving | REQ-PRD-209 |
| Containerization | Docker + Compose | 24+ / 2.x | Reproducible builds, service isolation | REQ-PRD-225 |
| Hosting | Contabo VPS 6 | 6 vCPU, 12GB RAM, 200GB SSD | Cost-effective for MVP scale | REQ-PRD-202 |
| CI/CD | GitHub Actions | N/A | Integrated with repository, free tier adequate | REQ-PRD-225 |
| SSL/CDN | Cloudflare | Free/Pro | SSL termination, DDoS protection, DNS | REQ-PRD-209 |
| API Documentation | OpenAPI 3.1 | Auto-generated via NestJS Swagger | Machine-readable spec, SDK generation | REQ-PRD-161, REQ-PRD-223 |
| SDK Generation | openapi-generator | Latest | TypeScript client (web), Dart client (Flutter) | REQ-PRD-161 |

### 3.1 Explicit Technology Exclusions

The following technologies SHALL NOT be used in the MVP:

| Excluded | Reason |
|----------|--------|
| MongoDB | PostgreSQL provides JSONB for flexible data; single DB simplifies operations |
| Elasticsearch | Not required at MVP scale; PostgreSQL full-text search is sufficient |
| Kafka / RabbitMQ | Redis queues (BullMQ) are sufficient for MVP throughput |
| Kubernetes | Operational complexity exceeds single-VPS deployment needs |
| PM2 | Docker provides process management via restart policies |
| Payment Gateway SDKs | All payment verification is manual per business rules |
| AI/ML frameworks | Explicitly out of scope (Document 01 §13) |


---

## 4. Deployment Topology

### 4.1 Container Registry

| ID | Container | Image Base | Port (Internal) | Responsibility |
|----|-----------|-----------|-----------------|----------------|
| SVC-001 | nginx | nginx:alpine | 80, 443 | Reverse proxy, subdomain routing, static assets |
| SVC-002 | backend | node:20-alpine | 3000 | NestJS API server + Socket.IO WebSocket |
| SVC-003 | worker | node:20-alpine | — | BullMQ job processor (6 logical queues) |
| SVC-004 | admin | node:20-alpine | 3001 | Next.js Admin + Super Admin Panel |
| SVC-005 | business | node:20-alpine | 3002 | Next.js Business Portal |
| SVC-006 | postgres | postgres:16-alpine | 5432 | Primary relational database |
| SVC-007 | redis | redis:7-alpine | 6379 | Cache, session store, job queues |
| SVC-008 | cron | node:20-alpine | — | Scheduled tasks (node-cron or similar) |

### 4.2 Docker Compose Structure

```
docker/
├── production/
│   ├── Dockerfile.backend
│   ├── Dockerfile.worker
│   ├── Dockerfile.admin
│   ├── Dockerfile.business
│   └── Dockerfile.cron
├── development/
│   ├── Dockerfile.backend.dev
│   └── docker-compose.override.yml
├── scripts/
│   ├── backup.sh
│   ├── deploy.sh
│   └── health-check.sh
└── compose/
    ├── docker-compose.dev.yml
    ├── docker-compose.prod.yml
    └── docker-compose.monitoring.yml (future)
```

### 4.3 Docker Network

All containers SHALL communicate via a single Docker bridge network named `soloadvertiser-network`. Service discovery SHALL use Docker DNS (service names resolve to container IPs).

| Source | Target | Protocol | Purpose |
|--------|--------|----------|---------|
| nginx | backend:3000 | HTTP | API and WebSocket proxy |
| nginx | admin:3001 | HTTP | Admin Panel proxy |
| nginx | business:3002 | HTTP | Business Portal proxy |
| backend | postgres:5432 | TCP | Database queries |
| backend | redis:6379 | TCP | Cache, sessions, pub/sub |
| worker | postgres:5432 | TCP | Job data access |
| worker | redis:6379 | TCP | Queue consumption |
| cron | backend:3000 | HTTP | Trigger scheduled endpoints |
| cron | redis:6379 | TCP | Direct queue enqueue for scheduled jobs |

### 4.4 Volume Mounts (Production)

| Container | Volume | Mount Path | Purpose |
|-----------|--------|-----------|---------|
| postgres | pgdata | /var/lib/postgresql/data | Persistent database storage |
| redis | redisdata | /data | RDB snapshot persistence |
| nginx | ./nginx/conf.d | /etc/nginx/conf.d | Nginx configuration |
| nginx | ./nginx/logs | /var/log/nginx | Access and error logs |

### 4.5 Resource Allocation

Total server: 6 vCPU, 12GB RAM, 200GB SSD.

| Container | CPU Limit | Memory Limit | Memory Reserve |
|-----------|-----------|-------------|----------------|
| postgres | 2.0 | 4GB | 2GB |
| backend | 1.5 | 2GB | 1GB |
| worker | 1.0 | 1.5GB | 512MB |
| redis | 0.5 | 1GB | 256MB |
| admin | 0.5 | 512MB | 256MB |
| business | 0.5 | 512MB | 256MB |
| nginx | 0.25 | 256MB | 128MB |
| cron | 0.25 | 256MB | 128MB |
| **Total** | **6.5** | **10GB** | **4.5GB** |

Note: CPU limits exceed physical cores to allow bursting; memory reserves ensure minimum allocation under pressure.


---

## 5. Module Structure

The NestJS backend SHALL be organized as a modular monolith where each module maps 1:1 to a bounded context defined in Document 03.

### 5.1 Project Layout

```
src/
├── main.ts                          # Application bootstrap
├── app.module.ts                    # Root module (imports all domain modules)
├── common/                          # Shared kernel (Document 03 §7)
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   ├── interfaces/
│   ├── dto/
│   ├── constants/
│   └── utils/
├── config/                          # Environment configuration
├── database/                        # TypeORM/Prisma setup, migrations
├── modules/
│   ├── identity/                    # CTX-001: IdentityModule
│   ├── rider/                       # CTX-002: RiderModule
│   ├── business/                    # CTX-003: BusinessModule
│   ├── campaign/                    # CTX-004: CampaignModule
│   ├── assignment/                  # CTX-005: AssignmentModule
│   ├── sticker/                     # CTX-006: StickerModule
│   ├── finance/                     # CTX-007: FinanceModule
│   ├── notification/                # CTX-008: NotificationModule
│   ├── configuration/               # CTX-009: ConfigModule
│   ├── audit/                       # CTX-010: AuditModule
│   ├── timeline/                    # CTX-011: TimelineModule
│   ├── media/                       # CTX-012: MediaModule
│   ├── support/                     # CTX-013: SupportModule
│   └── analytics/                   # CTX-014: AnalyticsModule
└── workers/                         # Worker entry point and queue processors
    ├── worker.module.ts
    └── processors/
        ├── verification.processor.ts
        ├── notification.processor.ts
        ├── reminder.processor.ts
        ├── finance.processor.ts
        ├── report.processor.ts
        └── cleanup.processor.ts
```

### 5.2 Module Internal Structure

Each domain module SHALL follow a consistent internal layout:

```
modules/{context}/
├── {context}.module.ts              # NestJS module definition
├── controllers/                     # REST API controllers
│   └── {entity}.controller.ts
├── services/                        # Business logic services
│   └── {entity}.service.ts
├── repositories/                    # Data access layer
│   └── {entity}.repository.ts
├── entities/                        # TypeORM/Prisma entities
│   └── {entity}.entity.ts
├── dto/                             # Request/Response DTOs
│   ├── create-{entity}.dto.ts
│   └── update-{entity}.dto.ts
├── events/                          # Domain event definitions
│   ├── {event-name}.event.ts
│   └── handlers/
│       └── {event-name}.handler.ts
├── guards/                          # Module-specific guards
├── interfaces/                      # Published service interfaces
│   └── {context}.interface.ts
├── acl/                             # Anti-corruption layer adapters (Document 03 §8)
│   └── {upstream}-adapter.ts
└── __tests__/                       # Unit and integration tests
    ├── {entity}.service.spec.ts
    └── {entity}.controller.spec.ts
```

### 5.3 Module Dependency Rules

1. A module SHALL only import modules listed in Document 03 §5.2 relationship table.
2. Circular module dependencies SHALL NOT exist; use event-based communication to break cycles.
3. The `common/` directory SHALL NOT contain domain logic; it provides infrastructure utilities only.
4. Each module SHALL export a published service interface for synchronous read access by dependent modules.
5. The `AuditModule`, `TimelineModule`, and `AnalyticsModule` SHALL be pure event consumers with no upstream dependencies.


---

## 6. Inter-Service Communication

### 6.1 Communication Patterns

The platform uses four communication patterns as defined in Document 03 §5.3:

| Pattern | Mechanism | Use Case | Latency |
|---------|-----------|----------|---------|
| Domain Events (async) | NestJS EventEmitter2 (in-process) | State change notifications between contexts | < 1 second (REQ-PRD-203) |
| Synchronous Service Calls | Direct method invocation via published interfaces | Read queries where caller needs current state | < 50ms (in-process) |
| Background Jobs (async) | BullMQ via Redis | Heavy processing, batch operations, scheduled tasks | Seconds to minutes |
| Real-time Push | Socket.IO | Client notifications, live updates | < 5 seconds (RULE-NTF-003) |

### 6.2 Domain Event Bus

**Implementation:** NestJS `@nestjs/event-emitter` (wraps EventEmitter2)

**Architecture:**

```
Producer Module                    Event Bus                     Consumer Modules
┌───────────────┐                ┌───────────┐                ┌────────────────┐
│ CampaignSvc   │──emit(EVT)──►│EventEmitter│──dispatch──►  │ FinanceHandler │
│               │                │           │                │ AuditHandler   │
│               │                │           │                │ TimelineHandler│
│               │                │           │                │ NotifHandler   │
└───────────────┘                └───────────┘                └────────────────┘
```

**Event Bus Rules:**
1. Events SHALL conform to the envelope schema defined in Document 03 §6.1.
2. Event handlers SHALL be idempotent (Document 03 §5.3 Rule 5).
3. Event producers SHALL NOT wait for consumer acknowledgment (fire-and-forget).
4. Failed event handlers SHALL log the error and NOT propagate failures to the producer.
5. Event handlers SHALL execute within their own error boundary (try/catch per handler).
6. The event bus SHALL support wildcard subscriptions for cross-cutting consumers (Audit, Timeline).

### 6.3 Synchronous Service Interfaces

Each module that provides read access to other modules SHALL export a service interface:

| Provider Module | Interface | Consumers | Operations |
|-----------------|-----------|-----------|------------|
| IdentityModule | IIdentityService | All modules | getUserById, validateToken, getRolePermissions |
| RiderModule | IRiderService | AssignmentModule, FinanceModule | getRiderById, getRidersByZone, isRiderAvailable |
| BusinessModule | IBusinessService | CampaignModule, FinanceModule | getBusinessById, isBusinessEligible |
| CampaignModule | ICampaignService | AssignmentModule, StickerModule, FinanceModule | getCampaignById, getCampaignStatus |
| AssignmentModule | IAssignmentService | RiderModule, CampaignModule, FinanceModule | getAssignmentsByCampaign, getActiveAssignment |
| ConfigModule | IConfigService | All modules | getSettingValue, isFeatureEnabled, getDictionaryItem |

**Rules:**
1. Service interfaces SHALL expose read-only methods only; mutations happen via events.
2. Interface implementations SHALL NOT leak internal entities; return DTOs or value objects.
3. Consumers SHALL handle the case where the provider returns null/undefined gracefully.

### 6.4 WebSocket Communication

**Implementation:** Socket.IO integrated into the NestJS backend container (SVC-002).

Socket.IO SHALL share the same HTTP server as the REST API on port 3000. Nginx SHALL proxy WebSocket upgrade requests via the `Upgrade` and `Connection` headers.


---

## 7. Data Architecture

### 7.1 PostgreSQL Schema Organization

The single PostgreSQL instance SHALL use schema-level isolation to enforce module boundaries from Document 03 §2.1.

| Schema Prefix | Module | Key Tables |
|---------------|--------|-----------|
| identity_ | IdentityModule | users, sessions, credentials, login_attempts |
| rider_ | RiderModule | riders, rider_documents, reliability_scores, zone_assignments |
| business_ | BusinessModule | businesses, business_documents, contact_persons |
| campaign_ | CampaignModule | campaigns, campaign_specs, fulfillment_tracking |
| assignment_ | AssignmentModule | assignments, assignment_fulfillment, removal_records |
| sticker_ | StickerModule | sticker_templates, print_orders, batches, distributions, verifications |
| finance_ | FinanceModule | ledger_entries, ledger_accounts, escrows, escrow_releases, wallets, wallet_transactions, payout_batches, payout_items |
| notification_ | NotificationModule | notifications, delivery_attempts, templates, user_preferences |
| config_ | ConfigModule | config_entries, feature_flags, dictionary_items, config_history |
| audit_ | AuditModule | audit_entries |
| timeline_ | TimelineModule | timeline_entries |
| media_ | MediaModule | media_assets, image_variants |
| support_ | SupportModule | tickets, ticket_messages, sla_tracking |
| analytics_ | AnalyticsModule | metric_snapshots, report_definitions, export_jobs |

### 7.2 Database Design Constraints

1. Cross-schema foreign keys SHALL NOT exist; references use UUID values only (Document 03 §4.1 Rule 4).
2. All tables SHALL include: `id` (UUID, PK), `created_at`, `updated_at`, `created_by`, `updated_by` (REQ-PRD-151).
3. Business entities SHALL implement soft deletes via `deleted_at` timestamp (REQ-PRD-150).
4. JSONB columns SHALL be used for: audit context, flexible metadata, configuration values (REQ-PRD-149).
5. Financial tables (`finance_ledger_entries`) SHALL have database-level constraints preventing UPDATE/DELETE (RULE-FIN-006).
6. Audit tables (`audit_entries`) SHALL have database-level constraints preventing UPDATE/DELETE (REQ-PRD-156).

### 7.3 Connection Pooling

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Pool size (backend) | 20 connections | Handles concurrent API requests (REQ-PRD-220) |
| Pool size (worker) | 10 connections | Background jobs are less latency-sensitive |
| Pool size (cron) | 5 connections | Scheduled tasks run sequentially |
| Idle timeout | 30 seconds | Release unused connections promptly |
| Connection timeout | 5 seconds | Fail fast on exhaustion |

### 7.4 Redis Usage Patterns

| Purpose | Key Pattern | TTL | Data Type | Traces To |
|---------|-------------|-----|-----------|-----------|
| Session storage | `session:{userId}:{deviceId}` | 7 days | Hash | REQ-PRD-008 |
| OTP codes | `otp:{phone/email}:{purpose}` | 5 minutes | String | REQ-PRD-001, REQ-PRD-002 |
| Rate limiting | `ratelimit:{ip}:{endpoint}` | Window-based | Sorted Set | REQ-PRD-211 |
| Configuration cache | `config:{key}` | 5 minutes (invalidate-on-change) | String/Hash | REQ-PRD-152 |
| Feature flags | `feature:{flagKey}` | 5 minutes (invalidate-on-change) | String | REQ-PRD-094 |
| Dashboard summaries | `dashboard:{role}:{metric}` | 5 minutes | Hash | REQ-PRD-121 |
| Temporary uploads | `upload:{uploadId}` | 1 hour | Hash | REQ-PRD-108 |
| Job queues | `bull:{queueName}:*` | Managed by BullMQ | Various | REQ-PRD-153 |

**Redis Boundary Rule:** Redis SHALL NOT store business-critical data. Loss of Redis data SHALL NOT result in data corruption or financial inconsistency. All authoritative data resides in PostgreSQL.

### 7.5 Cloudflare R2 Storage

| Bucket | Purpose | Access Pattern | Traces To |
|--------|---------|---------------|-----------|
| `soloadvertiser-documents` | Rider/business verification documents | Signed URL read (15 min TTL) | REQ-PRD-109, REQ-PRD-113 |
| `soloadvertiser-creatives` | Campaign artwork and sticker designs | Signed URL read (1 hour TTL) | REQ-PRD-063 |
| `soloadvertiser-verification` | Sticker verification photos | Signed URL read (15 min TTL) | REQ-PRD-069 |
| `soloadvertiser-exports` | Generated reports (CSV/PDF) | Signed URL read (24 hour TTL) | REQ-PRD-124 |
| `soloadvertiser-backups` | Database backup archives | Internal access only | REQ-PRD-207 |

**Access Rules:**
1. All client-facing file access SHALL use time-limited signed URLs (REQ-PRD-113).
2. Upload operations SHALL flow through the MediaModule (CTX-012) exclusively.
3. File metadata (bucket, key, content-type, size) SHALL be stored in PostgreSQL `media_assets` table.


---

## 8. Background Processing

### 8.1 Worker Architecture

The worker container (SVC-003) SHALL run the same NestJS codebase as the backend but bootstrap only queue processor modules. It shares database and Redis connections but does NOT expose HTTP endpoints.

### 8.2 Queue Design

BullMQ SHALL manage 6 logical queues, each with dedicated concurrency and retry configurations:

| Queue | Name | Concurrency | Retry Attempts | Backoff | Responsibility |
|-------|------|-------------|---------------|---------|----------------|
| Q-001 | VERIFICATION | 5 | 3 | Exponential (1s, 5s, 30s) | Photo reviews, reminders, overdue flags |
| Q-002 | NOTIFICATION | 10 | 3 | Fixed (2s) | Push notifications, in-app records |
| Q-003 | REMINDER | 3 | 2 | Exponential (5s, 30s) | Document expiry (30/15/7d), campaign ending, payout upcoming |
| Q-004 | FINANCE | 2 | 5 | Exponential (5s, 30s, 2m, 10m, 30m) | Daily escrow disbursement, payout batch, reconciliation, invoices |
| Q-005 | REPORT | 2 | 2 | Fixed (10s) | Daily metrics aggregation, dashboard refresh, scheduled reports, exports |
| Q-006 | CLEANUP | 1 | 1 | None | Orphaned files, session cleanup, expired OTPs, audit archival |

### 8.3 Job Processing Rules

1. Finance queue jobs (Q-004) SHALL execute within database transactions to ensure consistency (RULE-FIN-004).
2. Failed jobs exceeding retry limits SHALL be moved to a dead-letter queue for manual inspection.
3. Job payloads SHALL contain only references (IDs); full data SHALL be fetched from the database at processing time.
4. All queues SHALL have configurable rate limiters to prevent resource exhaustion.
5. The worker SHALL process queues in priority order: FINANCE > NOTIFICATION > VERIFICATION > REMINDER > REPORT > CLEANUP.

### 8.4 Cron Container

The cron container (SVC-008) SHALL execute scheduled tasks by enqueuing jobs into the appropriate BullMQ queues:

| Schedule | Task | Target Queue | Traces To |
|----------|------|-------------|-----------|
| Daily 00:00 NPT | Escrow daily release calculation | Q-004 FINANCE | RULE-FIN-005 |
| Daily 01:00 NPT | Metrics aggregation | Q-005 REPORT | REQ-PRD-122 |
| Daily 02:00 NPT | Database backup (pg_dump) | Direct execution | REQ-PRD-207 |
| Daily 06:00 NPT | Verification overdue check | Q-001 VERIFICATION | RULE-VRF-001 |
| Daily 07:00 NPT | Document expiry reminders | Q-003 REMINDER | RULE-DOC-001 |
| Every 15 days | Payout batch generation | Q-004 FINANCE | RULE-PAY-001 |
| Daily 03:00 NPT | Expired OTP cleanup | Q-006 CLEANUP | Internal |
| Daily 04:00 NPT | Orphaned file detection | Q-006 CLEANUP | Internal |
| Weekly Sunday 03:00 NPT | Session cleanup | Q-006 CLEANUP | Internal |
| Monthly 1st 02:00 NPT | Financial reconciliation | Q-004 FINANCE | REQ-PRD-082 |


---

## 9. Real-Time Communication

### 9.1 Socket.IO Implementation

Socket.IO SHALL be integrated into the NestJS backend (SVC-002) via the `@nestjs/websockets` and `@nestjs/platform-socket.io` packages.

### 9.2 Namespace and Room Architecture

| Namespace | Purpose | Authentication | Rooms |
|-----------|---------|---------------|-------|
| `/notifications` | Real-time notification delivery | JWT required | `user:{userId}` |
| `/config` | Configuration change broadcast | JWT required | `role:{roleName}` |
| `/campaigns` | Campaign status live updates | JWT required (Business/Staff) | `campaign:{campaignId}` |
| `/admin` | Admin dashboard live metrics | JWT required (Staff roles) | `dashboard:{panelType}` |

### 9.3 Connection Lifecycle

1. Client connects with JWT access token in handshake `auth` payload.
2. Server validates token via IdentityModule service interface; rejects if invalid/expired.
3. Server auto-joins client to rooms based on userId and role.
4. On domain events, server emits to relevant rooms (e.g., notification → `user:{userId}`).
5. Client heartbeat interval: 25 seconds. Timeout: 60 seconds.
6. On token expiry, client SHALL reconnect with a refreshed token.

### 9.4 Event Emission Rules

1. Real-time notifications SHALL reach connected clients within 5 seconds of the triggering domain event (RULE-NTF-003).
2. Configuration changes SHALL be broadcast to all connected clients in the appropriate role room (REQ-PRD-096).
3. WebSocket messages SHALL be JSON-serialized with the structure: `{ event: string, payload: object, timestamp: ISO8601 }`.
4. The server SHALL NOT queue messages for disconnected clients; missed messages are retrieved via REST on reconnection.

### 9.5 Scaling Considerations

For MVP single-server deployment, Socket.IO in-memory adapter is sufficient. For future multi-instance scaling, the Redis adapter (`@socket.io/redis-adapter`) SHALL be introduced to synchronize events across backend instances.


---

## 10. API Architecture

### 10.1 REST Conventions

| Aspect | Standard | Traces To |
|--------|----------|-----------|
| Base path | `/api/v1/` | REQ-PRD-160 |
| HTTP methods | GET (read), POST (create), PATCH (partial update), DELETE (soft delete) | REQ-PRD-159 |
| Content type | `application/json` exclusively | REQ-PRD-159 |
| Naming | kebab-case for URLs, camelCase for JSON bodies | Convention |
| Versioning | URI-based (`/api/v1/`, `/api/v2/`) | REQ-PRD-160 |

### 10.2 Response Envelope

All API responses SHALL conform to the following structure (REQ-PRD-164):

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "per_page": 20, "total": 150, "total_pages": 8 },
  "error": null
}
```

Error responses:

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

### 10.3 Error Code Format

Error codes SHALL follow the pattern `{DOMAIN}_{NNN}` as defined in Document 02 §7. The backend SHALL map business rule failures to their corresponding error codes.

### 10.4 Pagination

List endpoints SHALL support offset-based pagination (REQ-PRD-163):

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Current page number |
| `per_page` | integer | 20 | Items per page (max: 100) |
| `sort_by` | string | `created_at` | Sort field |
| `sort_order` | string | `desc` | Sort direction (asc/desc) |

### 10.5 OpenAPI Specification

1. OpenAPI 3.1 spec SHALL be auto-generated from NestJS decorators (`@nestjs/swagger`) (REQ-PRD-161).
2. Swagger UI SHALL be available at `/api/v1/docs` in non-production environments.
3. Swagger UI availability in production SHALL be controlled via feature flag `swagger.enabled` (default: disabled).
4. TypeScript SDK SHALL be generated for web applications (Business Portal, Admin Panel).
5. Dart SDK SHALL be generated for the Flutter mobile application.

### 10.6 API Endpoint Mapping

| Domain | Prefix | Module | Key Endpoints |
|--------|--------|--------|---------------|
| Auth | `/api/v1/auth` | IdentityModule | login, register, refresh, logout, sessions |
| Riders | `/api/v1/riders` | RiderModule | CRUD, documents, availability, score |
| Businesses | `/api/v1/businesses` | BusinessModule | CRUD, documents, status transitions |
| Campaigns | `/api/v1/campaigns` | CampaignModule | CRUD, lifecycle, fulfillment |
| Assignments | `/api/v1/assignments` | AssignmentModule | create, update, remove, replace |
| Stickers | `/api/v1/stickers` | StickerModule | templates, orders, batches, verify |
| Finance | `/api/v1/finance` | FinanceModule | ledger, escrow, wallets, payouts |
| Notifications | `/api/v1/notifications` | NotificationModule | list, mark-read, preferences |
| Configuration | `/api/v1/config` | ConfigModule | settings, flags, dictionary |
| Audit | `/api/v1/audit` | AuditModule | query (read-only) |
| Timeline | `/api/v1/timeline` | TimelineModule | query by entity (read-only) |
| Media | `/api/v1/media` | MediaModule | upload, signed-url, delete |
| Support | `/api/v1/support` | SupportModule | tickets, messages, resolve |
| Analytics | `/api/v1/analytics` | AnalyticsModule | metrics, reports, export |
| Zones | `/api/v1/zones` | ConfigModule | CRUD zones and wards |
| Health | `/api/v1/health` | AppModule | system health check |


---

## 11. Infrastructure

### 11.1 Server Specification

| Attribute | Value |
|-----------|-------|
| Provider | Contabo |
| Plan | VPS 6 |
| CPU | 6 vCPU (AMD EPYC) |
| RAM | 12 GB DDR4 |
| Storage | 200 GB NVMe SSD |
| Bandwidth | 32 TB/month |
| OS | Ubuntu 22.04 LTS |
| Location | EU (closest available to Nepal) |

### 11.2 DNS and Subdomain Configuration

All DNS SHALL be managed via Cloudflare:

| Record | Type | Target | Proxy |
|--------|------|--------|-------|
| `soloadvertiser.com` | A | VPS IP | Proxied (orange cloud) |
| `api.soloadvertiser.com` | A | VPS IP | Proxied |
| `admin.soloadvertiser.com` | A | VPS IP | Proxied |
| `business.soloadvertiser.com` | A | VPS IP | Proxied |

### 11.3 Nginx Configuration

Nginx (SVC-001) SHALL perform:

1. **Subdomain routing:** Route requests based on `Host` header to appropriate containers.
2. **WebSocket upgrade:** Proxy WebSocket connections for Socket.IO at `/socket.io/` path.
3. **Request size limits:** Max body size 10MB (REQ-PRD-204).
4. **Security headers:** X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Strict-Transport-Security.
5. **Gzip compression:** Enable for JSON, HTML, CSS, JavaScript responses.
6. **Rate limiting:** Connection-level rate limiting as first defense layer (REQ-PRD-211).
7. **Health check endpoint:** `/nginx-health` for container orchestrator readiness.

```nginx
# Simplified production server block example
upstream backend {
    server backend:3000;
}

server {
    listen 80;
    server_name api.soloadvertiser.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 11.4 SSL/TLS Architecture

SSL termination occurs at Cloudflare. The connection path is:

```
Client ──HTTPS──► Cloudflare Proxy ──HTTP──► Nginx ──HTTP──► Containers
```

| Layer | Encryption | Certificate |
|-------|-----------|-------------|
| Client → Cloudflare | TLS 1.2+ | Cloudflare-managed (auto-renewal) |
| Cloudflare → Nginx | HTTP (within VPS) | None (traffic is on same machine) |
| Nginx → Containers | HTTP (Docker network) | None (internal bridge network) |

**Cloudflare SSL Mode:** Full (Strict) if origin certificate is configured; otherwise Full.

No container SHALL manage its own SSL certificates. This eliminates certificate renewal operational burden (traces to REQ-PRD-209).


---

## 12. CI/CD Pipeline

### 12.1 Pipeline Architecture

```
Developer pushes to feature branch
        │
        ▼
┌─────────────────────────────────────────────────┐
│           GitHub Actions Workflow                 │
├─────────────────────────────────────────────────┤
│  Stage 1: Lint & Type Check                      │
│    → ESLint + Prettier                           │
│    → TypeScript compilation (--noEmit)           │
├─────────────────────────────────────────────────┤
│  Stage 2: Test                                   │
│    → Unit tests (Jest)                           │
│    → Integration tests (with test DB)            │
│    → Coverage threshold check (≥ 80%)            │
├─────────────────────────────────────────────────┤
│  Stage 3: Build                                  │
│    → Build Docker images                         │
│    → Tag with git SHA + branch name              │
├─────────────────────────────────────────────────┤
│  Stage 4: Push (on merge to main only)           │
│    → Push images to GitHub Container Registry    │
├─────────────────────────────────────────────────┤
│  Stage 5: Deploy (on merge to main only)         │
│    → SSH into Contabo VPS                        │
│    → docker compose pull                         │
│    → docker compose up -d                        │
│    → Health check (curl /api/v1/health)          │
│    → Notify team (success/failure via webhook)   │
└─────────────────────────────────────────────────┘
```

### 12.2 Branch Strategy

| Branch | Purpose | Triggers |
|--------|---------|----------|
| `main` | Production-ready code | Lint + Test + Build + Deploy |
| `feature/*` | Feature development | Lint + Test + Build (no deploy) |
| `hotfix/*` | Critical production fixes | Lint + Test + Build + Deploy (on merge) |

### 12.3 Deployment Process

1. Docker images SHALL be pushed to GitHub Container Registry (ghcr.io).
2. Deployment SHALL use SSH to connect to the Contabo VPS.
3. `docker compose pull` SHALL fetch updated images.
4. `docker compose up -d` SHALL perform rolling container restarts.
5. Health check SHALL verify the backend responds at `/api/v1/health` within 30 seconds.
6. If health check fails, automatic rollback SHALL revert to the previous image tag.
7. Deployment notifications SHALL be sent to the team via configured webhook (Slack/Discord).

### 12.4 Environment Management

| Environment | Branch | Database | Infrastructure |
|------------|--------|----------|---------------|
| Development | feature/* | Local Docker PostgreSQL | docker-compose.dev.yml |
| Production | main | Contabo VPS PostgreSQL | docker-compose.prod.yml |

**Environment Variable Rules:**
1. Every service SHALL have `.env.example` (committed), `.env.development` (local only), `.env.production` (server only).
2. Secrets SHALL NEVER be committed to the repository.
3. Production secrets SHALL be managed as GitHub Actions secrets and injected at deploy time.
4. Docker services SHALL reference each other by service name: `postgres:5432`, `redis:6379`, `backend:3000`.


---

## 13. Monitoring and Health

### 13.1 Health Endpoint

**Endpoint:** `GET /api/v1/health`

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 86400,
  "checks": {
    "database": { "status": "healthy", "latency_ms": 5 },
    "redis": { "status": "healthy", "latency_ms": 2 },
    "storage": { "status": "healthy" }
  }
}
```

**Health check SHALL verify:**
1. PostgreSQL connection is alive (SELECT 1).
2. Redis connection is alive (PING).
3. Cloudflare R2 is accessible (HEAD request to test bucket).

**Degraded responses:** If a non-critical service (Redis, R2) fails, return status `degraded` with HTTP 200. If PostgreSQL fails, return status `unhealthy` with HTTP 503.

### 13.2 Container Restart Policies

All containers SHALL use Docker restart policy `unless-stopped`:

```yaml
services:
  backend:
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 13.3 Structured Logging

All application containers SHALL output structured JSON logs to stdout/stderr (REQ-PRD-224):

```json
{
  "level": "info",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "correlationId": "uuid-v4",
  "service": "backend",
  "module": "CampaignModule",
  "message": "Campaign state transition",
  "context": {
    "campaignId": "uuid",
    "from": "PaymentVerified",
    "to": "RecruitingRiders",
    "actor": "uuid"
  }
}
```

**Logging Rules:**
1. Every HTTP request SHALL generate a correlation ID (UUID v4) attached to all downstream logs.
2. Correlation IDs SHALL be propagated through domain events and background jobs.
3. Log levels: `error` (failures), `warn` (degraded state), `info` (state transitions), `debug` (development only).
4. Sensitive data (passwords, tokens, PII) SHALL NEVER appear in logs.
5. Production log level SHALL be `info`; `debug` is available via feature flag.

### 13.4 Alerting (MVP)

MVP monitoring SHALL use simple script-based checks executed by the cron container:

| Check | Threshold | Action |
|-------|-----------|--------|
| Disk usage | > 80% | Email alert to admin |
| RAM usage | > 90% | Email alert to admin |
| Container restart count | > 3 in 5 minutes | Email alert to admin |
| Health endpoint failure | 3 consecutive failures | Email alert + attempt container restart |
| Database connection pool exhaustion | > 90% utilization | Log warning |

**Future (post-MVP):** Prometheus + Grafana stack via `docker-compose.monitoring.yml`.

### 13.5 Backup Strategy

| Target | Method | Schedule | Retention | Storage |
|--------|--------|----------|-----------|---------|
| PostgreSQL | `pg_dump --format=custom` | Daily 02:00 NPT | 7 daily + 4 weekly | Cloudflare R2 (`soloadvertiser-backups`) |
| Redis | RDB snapshot (BGSAVE) | Daily 02:30 NPT | 3 daily | Local volume (non-critical data) |
| Application config | Git repository | On every change | Full history | GitHub |

**Recovery procedures:**
1. Database restore: `pg_restore --clean --if-exists -d soloadvertiser backup.dump`
2. Redis restore: Copy RDB file to volume, restart container.
3. Full disaster recovery target: < 1 hour to restore service from latest backup.


---

## 14. Security Architecture

### 14.1 Network Security

```
Internet ──► Cloudflare (DDoS, WAF, SSL) ──► Nginx (rate limit, headers) ──► Containers
```

| Layer | Protection | Traces To |
|-------|-----------|-----------|
| Cloudflare | DDoS mitigation, Web Application Firewall, SSL termination | REQ-PRD-209 |
| Nginx | Rate limiting (connection/request), security headers, request size limits | REQ-PRD-211 |
| Application | Input validation, CORS, JWT verification, RBAC | REQ-PRD-212, REQ-PRD-215 |
| Database | Connection encryption (within Docker network), access restricted to app containers | REQ-PRD-148 |

### 14.2 Authentication Architecture

| Component | Implementation | Traces To |
|-----------|---------------|-----------|
| Password hashing | bcrypt, cost factor ≥ 10 | REQ-PRD-210 |
| Access tokens | JWT, 15-minute expiry, RS256 signing | REQ-PRD-213 |
| Refresh tokens | JWT, 7-day expiry, stored server-side in Redis | REQ-PRD-214 |
| OTP | 6-digit numeric, 5-minute expiry, stored in Redis | REQ-PRD-001 |
| Session management | Per-device sessions tracked; revocable | REQ-PRD-008 |
| Account lockout | 5 failed attempts → 30-minute lockout | RULE-SEC-001 |

### 14.3 Authorization (RBAC)

Role hierarchy and permission enforcement SHALL follow Document 03 §3.1 (AGG-001 invariants):

| Role | Level | Capabilities |
|------|-------|-------------|
| Rider | 1 | Own profile, documents, assignments, wallet, verification |
| Business | 1 | Own profile, documents, campaigns, payments |
| Operations Staff | 2 | Rider/Business management, assignments, verification review |
| Finance Staff | 2 | Payment verification, payout approval, reconciliation |
| Admin | 3 | All Operations + Finance + campaign cancellation + suspensions |
| Super Admin | 4 | All Admin + system configuration + zone management + staff accounts + blacklisting |

### 14.4 CORS Policy

```
Allowed origins:
  - https://admin.soloadvertiser.com
  - https://business.soloadvertiser.com
  - http://localhost:3001 (development only)
  - http://localhost:3002 (development only)

Allowed methods: GET, POST, PATCH, DELETE, OPTIONS
Allowed headers: Authorization, Content-Type, X-Correlation-ID
Credentials: true
Max age: 86400 (24 hours)
```

### 14.5 Rate Limiting

| Endpoint Category | Limit | Window | Traces To |
|-------------------|-------|--------|-----------|
| Authentication (login/register) | 10 requests | 15 minutes | REQ-PRD-211, RULE-SEC-001 |
| OTP generation | 5 requests | 15 minutes | REQ-PRD-211 |
| File upload | 20 requests | 1 hour | REQ-PRD-211 |
| Standard API (authenticated) | 100 requests | 1 minute | REQ-PRD-211 |
| Public endpoints | 30 requests | 1 minute | REQ-PRD-211 |

Implementation: Redis-backed sliding window rate limiter via NestJS `@nestjs/throttler` with Redis storage adapter.

### 14.6 Input Sanitization

1. All request bodies SHALL be validated via class-validator decorators (DTO validation pipes).
2. SQL injection prevention SHALL be handled by parameterized queries (ORM-managed).
3. XSS prevention SHALL use output encoding and Content-Security-Policy headers.
4. File uploads SHALL validate MIME type against allowlist (RULE-DOC-005).
5. Request payload size SHALL be limited to 10MB at Nginx and application levels (REQ-PRD-204).

### 14.7 Secrets Management

| Secret | Storage Location | Rotation |
|--------|-----------------|----------|
| Database password | `.env.production` + GitHub Secrets | On compromise |
| Redis password | `.env.production` + GitHub Secrets | On compromise |
| JWT signing key (RS256 private) | `.env.production` + GitHub Secrets | Annually |
| Cloudflare R2 credentials | `.env.production` + GitHub Secrets | Annually |
| Firebase push notification key | `.env.production` + GitHub Secrets | On compromise |

**Rules:**
1. No secret SHALL be committed to the Git repository.
2. `.env.production` SHALL be present only on the VPS server, never in CI artifacts.
3. GitHub Secrets SHALL be used to inject secrets during CI/CD deploy stage.


---

## 15. Scalability Path

### 15.1 Capacity Planning

| Resource | MVP Capacity | Growth Capacity | Bottleneck Indicator |
|----------|-------------|-----------------|---------------------|
| PostgreSQL connections | 35 pooled | 100 pooled (pgbouncer) | Connection wait time > 100ms |
| Redis memory | 1 GB | 2 GB | Eviction events in logs |
| API concurrent users | ~200 | ~500 | p95 response > 500ms |
| WebSocket connections | ~1,000 | ~5,000 | Memory pressure on backend |
| Background job throughput | ~100 jobs/minute | ~500 jobs/minute | Queue depth > 1,000 |
| Disk IOPS | NVMe baseline | NVMe baseline | I/O wait > 10% |

### 15.2 Growth Stages

| Phase | Scale | Infrastructure Changes | Trigger |
|-------|-------|----------------------|---------|
| MVP | 1,000 riders, 100 businesses | Single Contabo VPS 6 as specified | Launch |
| Growth | 15,000 riders, 1,500 businesses | Same VPS; add pgbouncer, optimize queries, add indexes | p95 > 200ms consistently |
| Scale | 50,000+ riders, 5,000+ businesses | Second VPS: read replica + dedicated worker | CPU sustained > 80% |
| Enterprise | 100,000+ riders, multi-city | Docker Swarm or lightweight K8s; service extraction | Single VPS cannot serve SLA |

### 15.3 Extraction Strategy

When scaling beyond single-VPS capacity, modules SHALL be extracted in this order:

| Priority | Module to Extract | Reason | Dependency Impact |
|----------|-------------------|--------|-------------------|
| 1 | Worker (SVC-003) | CPU-intensive; independent from API serving | None (already separate container) |
| 2 | AnalyticsModule | Read-heavy; can use read replica exclusively | Minimal (pure consumer) |
| 3 | NotificationModule | High throughput; independent delivery pipeline | Minimal (pure consumer) |
| 4 | MediaModule | I/O-intensive; direct R2 communication | Minimal (shared utility) |
| 5 | FinanceModule | Critical path isolation; dedicated resources | Moderate (requires event bus extension) |

**Extraction rules:**
1. In-process event bus SHALL be replaced with Redis Pub/Sub or dedicated message transport when modules are extracted.
2. Synchronous service interfaces SHALL be replaced with HTTP/gRPC calls between extracted services.
3. Shared database SHALL be split; each extracted service owns its schema exclusively.


---

## 16. Architecture Decision Records

### ADR-001: Modular Monolith over Microservices

| Attribute | Value |
|-----------|-------|
| ID | ARCH-001 |
| Status | Accepted |
| Context | MVP targets single VPS with small team; microservices add network complexity, distributed tracing, and deployment orchestration overhead |
| Decision | Deploy as NestJS modular monolith with strict module boundaries (Document 03 context map) |
| Consequences | Simpler deployment and debugging; module extraction possible later; requires discipline to maintain boundaries |
| Alternatives | Microservices (rejected: operational overhead), Serverless (rejected: cold start latency, vendor lock-in) |
| Traces To | REQ-PRD-221, REQ-PRD-222 |

### ADR-002: PostgreSQL Single Instance with Schema Isolation

| Attribute | Value |
|-----------|-------|
| ID | ARCH-002 |
| Status | Accepted |
| Context | 14 bounded contexts each owning tables; need isolation without multi-database operational cost |
| Decision | Single PostgreSQL 16 instance with table naming convention (prefix per module); no cross-module joins |
| Consequences | Simplified backup/restore; potential contention at extreme scale; clear ownership via naming |
| Alternatives | Separate databases per module (rejected: connection overhead), Schema objects (rejected: migration complexity) |
| Traces To | REQ-PRD-148, Document 03 §2.1 |

### ADR-003: BullMQ for Background Job Processing

| Attribute | Value |
|-----------|-------|
| ID | ARCH-003 |
| Status | Accepted |
| Context | Need reliable async job processing for notifications, payouts, reports; Redis already present |
| Decision | Use BullMQ with 6 logical queues, dedicated worker container |
| Consequences | Proven library; Redis dependency already exists; separate worker container for isolation |
| Alternatives | Agenda (rejected: MongoDB dependency), pg-boss (rejected: adds DB load), Kafka (rejected: overkill) |
| Traces To | REQ-PRD-153, RULE-PAY-001, RULE-NTF-001 |

### ADR-004: Socket.IO for Real-Time Communication

| Attribute | Value |
|-----------|-------|
| ID | ARCH-004 |
| Status | Accepted |
| Context | Need real-time push for notifications, config changes, campaign updates; must support mobile + web |
| Decision | Socket.IO integrated into backend container with namespace-based routing |
| Consequences | Built-in fallback transports; room-based broadcasting; well-supported in Flutter and React |
| Alternatives | Raw WebSocket (rejected: no fallback, no rooms), Server-Sent Events (rejected: unidirectional), Firebase Realtime (rejected: vendor lock-in) |
| Traces To | REQ-PRD-165, REQ-PRD-166, REQ-PRD-167, RULE-NTF-003 |

### ADR-005: Cloudflare for SSL and CDN

| Attribute | Value |
|-----------|-------|
| ID | ARCH-005 |
| Status | Accepted |
| Context | SSL certificate management and DDoS protection needed; containers should not manage certificates |
| Decision | Cloudflare Proxy handles SSL termination; Nginx receives HTTP from Cloudflare |
| Consequences | Zero certificate renewal burden; DDoS protection; slight latency from proxy hop |
| Alternatives | Let's Encrypt on Nginx (rejected: renewal complexity), AWS CloudFront (rejected: cost, vendor lock-in) |
| Traces To | REQ-PRD-209 |

### ADR-006: EventEmitter2 for In-Process Domain Events

| Attribute | Value |
|-----------|-------|
| ID | ARCH-006 |
| Status | Accepted |
| Context | 60 domain events from Document 03 need routing between modules within the same process |
| Decision | NestJS @nestjs/event-emitter (EventEmitter2) for synchronous in-process event dispatch |
| Consequences | Zero serialization overhead; wildcard subscription support; no network hop; must extract to message broker when scaling out |
| Alternatives | Redis Pub/Sub (rejected: unnecessary network hop within monolith), Custom event bus (rejected: maintenance burden) |
| Traces To | Document 03 §5.3, §6 |

### ADR-007: GitHub Container Registry for Image Storage

| Attribute | Value |
|-----------|-------|
| ID | ARCH-007 |
| Status | Accepted |
| Context | Need container registry for CI/CD pipeline; integrated with GitHub for minimal friction |
| Decision | Push Docker images to ghcr.io; pull on deployment |
| Consequences | Free tier sufficient for MVP; integrated authentication with GitHub Actions; no additional service to manage |
| Alternatives | Docker Hub (rejected: rate limits on free tier), Self-hosted registry (rejected: additional infrastructure) |
| Traces To | REQ-PRD-225 |

### ADR-008: Offset Pagination over Cursor-Based

| Attribute | Value |
|-----------|-------|
| ID | ARCH-008 |
| Status | Accepted |
| Context | List endpoints need pagination; admin panels need page jumping; MVP scale doesn't require cursor performance |
| Decision | Offset-based pagination with page/per_page parameters for all list endpoints |
| Consequences | Simpler implementation; supports page jumping in admin UI; performance degrades on very large offsets (acceptable at MVP scale) |
| Alternatives | Cursor-based (considered for future; better for mobile infinite scroll, but adds complexity for admin panels) |
| Traces To | REQ-PRD-163 |


---

## 17. Traceability

### 17.1 Architecture Decisions to Requirements

| Decision ID | Decision | Primary Requirements | Primary Rules |
|-------------|----------|---------------------|---------------|
| ARCH-001 | Modular monolith | REQ-PRD-221, REQ-PRD-222 | — |
| ARCH-002 | Single PostgreSQL with schema isolation | REQ-PRD-148, REQ-PRD-149, REQ-PRD-157 | RULE-FIN-004, RULE-FIN-006 |
| ARCH-003 | BullMQ background processing | REQ-PRD-153, REQ-PRD-077 | RULE-PAY-001, RULE-NTF-001 |
| ARCH-004 | Socket.IO real-time | REQ-PRD-165, REQ-PRD-166, REQ-PRD-167, REQ-PRD-092 | RULE-NTF-003 |
| ARCH-005 | Cloudflare SSL/CDN | REQ-PRD-209 | — |
| ARCH-006 | EventEmitter2 domain events | REQ-PRD-203 | Document 03 §5.3, §6 |
| ARCH-007 | GitHub Container Registry | REQ-PRD-225 | — |
| ARCH-008 | Offset pagination | REQ-PRD-163 | — |

### 17.2 Containers to Requirements

| Container ID | Container | Primary Requirements |
|-------------|-----------|---------------------|
| SVC-001 | Nginx | REQ-PRD-209, REQ-PRD-211, REQ-PRD-215 |
| SVC-002 | Backend (NestJS) | REQ-PRD-159–167, REQ-PRD-200–203, REQ-PRD-221–224 |
| SVC-003 | Worker | REQ-PRD-153, REQ-PRD-072, REQ-PRD-077, REQ-PRD-090 |
| SVC-004 | Admin Panel | REQ-PRD-183–199 |
| SVC-005 | Business Portal | REQ-PRD-176–182 |
| SVC-006 | PostgreSQL | REQ-PRD-148–158 |
| SVC-007 | Redis | REQ-PRD-152, REQ-PRD-153 |
| SVC-008 | Cron | REQ-PRD-077, REQ-PRD-207, RULE-VRF-001, RULE-DOC-001 |

### 17.3 Module to Context Mapping

| NestJS Module | Context ID | Context Name | Aggregate IDs |
|---------------|-----------|--------------|---------------|
| IdentityModule | CTX-001 | Identity & Auth | AGG-001 |
| RiderModule | CTX-002 | Rider Domain | AGG-002 |
| BusinessModule | CTX-003 | Business Domain | AGG-003 |
| CampaignModule | CTX-004 | Campaign Domain | AGG-004 |
| AssignmentModule | CTX-005 | Assignment Domain | AGG-005 |
| StickerModule | CTX-006 | Sticker Inventory | AGG-006, AGG-007 |
| FinanceModule | CTX-007 | Financial Platform | AGG-008, AGG-009, AGG-010, AGG-011 |
| NotificationModule | CTX-008 | Notification Domain | AGG-012 |
| ConfigModule | CTX-009 | Configuration Service | AGG-013 |
| AuditModule | CTX-010 | Audit Domain | AGG-014 |
| TimelineModule | CTX-011 | Timeline Service | AGG-015 |
| MediaModule | CTX-012 | Media Service | AGG-016 |
| SupportModule | CTX-013 | Support Domain | AGG-017 |
| AnalyticsModule | CTX-014 | Analytics Domain | AGG-018 |

### 17.4 Queue to Rule Enforcement

| Queue ID | Queue Name | Rules Enforced |
|----------|-----------|---------------|
| Q-001 | VERIFICATION | RULE-VRF-001, RULE-VRF-002, RULE-VRF-003, RULE-VRF-004 |
| Q-002 | NOTIFICATION | RULE-NTF-001, RULE-NTF-002, RULE-NTF-003 |
| Q-003 | REMINDER | RULE-DOC-001 |
| Q-004 | FINANCE | RULE-FIN-004, RULE-FIN-005, RULE-PAY-001, RULE-PAY-002, RULE-PAY-004 |
| Q-005 | REPORT | REQ-PRD-121, REQ-PRD-122, REQ-PRD-124 |
| Q-006 | CLEANUP | Internal operational maintenance |

### 17.5 Non-Functional Requirement Coverage

| NFR Category | Requirements | Architectural Response |
|-------------|-------------|----------------------|
| Performance | REQ-PRD-200–204 | Connection pooling, Redis caching, optimized queries, async processing |
| Availability | REQ-PRD-205–208 | Docker restart policies, health checks, daily backups, zero-downtime deploy |
| Security | REQ-PRD-209–216 | Cloudflare SSL, bcrypt, JWT, rate limiting, CORS, input sanitization, audit logs |
| Scalability | REQ-PRD-217–220 | Docker containers, connection pooling, index strategy, extraction path defined |
| Maintainability | REQ-PRD-221–225 | Modular monolith, TypeScript, OpenAPI, structured logging, Docker consistency |
| Data Retention | REQ-PRD-226–228 | Append-only audit/ledger, automated backups, R2 durability, retention policies |

### 17.6 Document Statistics

| Metric | Value |
|--------|-------|
| Architecture Decisions (ADRs) | 8 |
| Container Services | 8 |
| Background Queues | 6 |
| NestJS Modules | 14 |
| WebSocket Namespaces | 4 |
| API Endpoint Domains | 16 |
| R2 Storage Buckets | 5 |
| Scheduled Cron Tasks | 10 |
| Redis Key Patterns | 8 |
| Requirements Covered | REQ-PRD-001 through REQ-PRD-228 (all non-functional + infrastructure) |
| Rules Enforced | 72 (all rules from Document 02 have architectural support) |

### 17.7 Downstream Document References

This document is referenced by the following downstream specifications:

| Downstream Document | Usage |
|--------------------|-------|
| 05. Data Model | Schema naming convention, PostgreSQL constraints, JSONB patterns |
| 06. Configuration & Dictionary | ConfigModule structure, Redis caching patterns, real-time propagation |
| 07. Authentication & Permissions | JWT architecture, session storage, rate limiting implementation |
| 08. API Specification | REST conventions, error format, pagination, OpenAPI generation |
| 09. Rider App | Socket.IO integration, API base URL, push notification architecture |
| 10. Business Portal | Next.js container setup, API client SDK |
| 11. Admin Panel | Next.js container setup, WebSocket dashboard updates |
| 12. Campaign & Assignment | Event bus patterns, queue processing for verification |
| 13. Financial Platform | Queue design for payouts, ledger database constraints |
| 14. Notifications & Timeline | Notification queue, Socket.IO namespaces, event consumption |
| 15. Deployment & Operations | Docker Compose files, CI/CD pipeline, backup procedures |
| 16. Security & Compliance | Network security layers, encryption, secrets management |
| 17. Testing Strategy | Test database setup, integration test infrastructure |

---

*End of Document 04 - System Architecture*
