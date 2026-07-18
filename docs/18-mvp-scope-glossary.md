# Document 18 - MVP Scope and Glossary

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** This document is the DEFINITIVE scope boundary and shared vocabulary for the Solo Advertiser MVP. Any feature, term, or requirement not referenced here is OUT OF SCOPE. No scope expansion may occur without the formal change process defined herein.

---

## 1. Purpose and Scope

This document serves as the final reference preventing scope creep. It defines:
- What IS and IS NOT included in the MVP
- A comprehensive glossary of all domain terms
- The project risk register
- Assumptions, constraints, and success criteria
- A complete document index for the 18-document specification set

### 1.1 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Scope items use prefix SCP-NNN (in-scope) or EXC-NNN (excluded).
- Risk identifiers use prefix RSK-NNN.

---

## 2. MVP Scope Definition

### 2.1 What IS In Scope (Definitive List)


| ID | Feature | Reference | Module |
|----|---------|-----------|--------|
| SCP-001 | Rider registration via phone + OTP | REQ-PRD-001, REQ-PRD-012 | IdentityModule |
| SCP-002 | Business registration via email | REQ-PRD-002, REQ-PRD-026 | IdentityModule |
| SCP-003 | Staff authentication (email + password) | REQ-PRD-003-006 | IdentityModule |
| SCP-004 | Rider document upload and review | REQ-PRD-013-014 | RiderModule |
| SCP-005 | Business document upload and review | REQ-PRD-027-029 | BusinessModule |
| SCP-006 | Campaign creation wizard | REQ-PRD-038-042 | CampaignModule |
| SCP-007 | Manual payment submission and verification | REQ-PRD-043-045, REQ-PRD-084-085 | FinanceModule |
| SCP-008 | Campaign escrow and daily release | REQ-PRD-071-073 | FinanceModule |
| SCP-009 | Rider-campaign assignment by Operations Staff | REQ-PRD-054-056 | AssignmentModule |
| SCP-010 | Sticker template and print order management | REQ-PRD-063-068 | StickerModule |
| SCP-011 | Sticker distribution with photo proof | REQ-PRD-068 | StickerModule |
| SCP-012 | 7-day periodic sticker verification | REQ-PRD-069-070 | VerificationModule |
| SCP-013 | Verification escalation (warn → suspend → remove) | REQ-PRD-137-139 | VerificationModule |
| SCP-014 | Rider wallet and daily earnings | REQ-PRD-075, REQ-PRD-129 | FinanceModule |
| SCP-015 | 15-day payout cycle with batch processing | REQ-PRD-077-080 | FinanceModule |
| SCP-016 | Invoice generation (PDF) | REQ-PRD-081 | FinanceModule |
| SCP-017 | Push notifications via FCM | REQ-PRD-086-087 | NotificationModule |
| SCP-018 | In-app real-time notifications (Socket.IO) | REQ-PRD-092 | NotificationModule |
| SCP-019 | Notification center with read/unread | REQ-PRD-088 | NotificationModule |
| SCP-020 | Rider mobile app (Flutter, Android + iOS) | REQ-PRD-168-175 | Mobile |
| SCP-021 | Business portal (Next.js) | REQ-PRD-176-182 | Frontend |
| SCP-022 | Admin panel (Next.js) | REQ-PRD-183-190 | Frontend |
| SCP-023 | Super Admin panel (Next.js) | REQ-PRD-191-199 | Frontend |
| SCP-024 | Role-based access control (6 roles, 89 permissions) | REQ-PRD-210-211 | AuthModule |
| SCP-025 | Zone management (Kathmandu Valley wards) | REQ-PRD-146-147 | ZoneModule |
| SCP-026 | Configuration management (55 entries) | REQ-PRD-200-204 | ConfigModule |
| SCP-027 | Audit trail (immutable) | REQ-PRD-215 | AuditModule |
| SCP-028 | Campaign lifecycle state machine (10 states) | REQ-PRD-046-052 | CampaignModule |
| SCP-029 | Rider reliability scoring | REQ-PRD-017 | RiderModule |
| SCP-030 | Document expiry reminders (30/15/7 days) | REQ-PRD-024 | DocumentModule |
| SCP-031 | Financial reconciliation (daily automated) | REQ-PRD-071 | FinanceModule |
| SCP-032 | Docker deployment on Contabo VPS 6 | REQ-PRD-225 | Infrastructure |
| SCP-033 | CI/CD via GitHub Actions | REQ-PRD-206 | Infrastructure |
| SCP-034 | Daily PostgreSQL backups to R2 | REQ-PRD-208 | Infrastructure |
| SCP-035 | Cloudflare WAF + DDoS protection | REQ-PRD-209 | Infrastructure |

### 2.2 What is NOT In Scope (Explicit Exclusions)


| ID | Exclusion | Rationale | Future Phase |
|----|-----------|-----------|--------------|
| EXC-001 | Payment gateway SDK integration | Manual verification sufficient for MVP scale | Phase 2 |
| EXC-002 | Automated payment verification (webhooks) | Operational simplicity, 5-person team | Phase 2 |
| EXC-003 | Self-serve business onboarding | Managed operations model for quality control | Phase 3 |
| EXC-004 | Multi-currency support | Nepal-only operation, NPR exclusively | Phase 3+ |
| EXC-005 | Multi-geography (outside Kathmandu Valley) | Initial market validation scope | Phase 2 |
| EXC-006 | Automated rider matching/recommendation | Manual assignment by Operations Staff | Phase 2 |
| EXC-007 | AI/ML-based sticker verification | Manual review by Operations Staff | Phase 3 |
| EXC-008 | Additional asset types (taxi, jacket) | Helmet only for MVP; data model extensible | Phase 2 |
| EXC-009 | Public API for third-party integrations | Internal platform only | Phase 3 |
| EXC-010 | Advanced analytics/BI dashboard | Basic reports in admin panel only | Phase 2 |
| EXC-011 | White-label/multi-tenant | Single platform instance | Not planned |
| EXC-012 | Rider GPS tracking | Privacy concerns; not needed for helmet ads | Phase 3 |
| EXC-013 | In-app chat/messaging | Support tickets sufficient | Phase 2 |
| EXC-014 | Automated campaign scheduling/optimization | Manual campaign management | Phase 2 |
| EXC-015 | Web app for riders | Mobile-first strategy; app only | Phase 3 |
| EXC-016 | Offline-first mobile architecture | Online-required with graceful degradation | Phase 2 |
| EXC-017 | Quiet hours for notifications | Feature flagged (FF-012, disabled) | Phase 2 |
| EXC-018 | Penetration testing | Post-MVP stabilization | Phase 2 |
| EXC-019 | Virus scanning for uploads | Documented risk; type validation only | Phase 2 |
| EXC-020 | Microservices architecture | Monolith appropriate for scale/team | Phase 3+ |

### 2.3 Scope Change Process

1. **Proposal:** Submit scope change request with business justification, effort estimate, and impact analysis.
2. **Impact Assessment:** Evaluate effect on timeline, budget, existing specifications, and dependencies.
3. **Approval:** Requires sign-off from project lead and technical lead.
4. **Documentation:** Update this document (§2.1 or §2.2), affected specification documents, and risk register.
5. **Communication:** Notify all team members of scope change and updated timeline.

---

## 3. Glossary

### 3.1 Domain Terms


| Term | Definition | Introduced In |
|------|-----------|---------------|
| Assignment | The binding of a specific rider to a specific campaign for a defined duration | Doc 01 §3 |
| Asset | A physical surface on which an advertisement can be placed (MVP: helmet only) | Doc 01 §3 |
| Batch (Payout) | A grouped set of rider payouts processed together in a single cycle | Doc 13 §6.2 |
| Bounded Context | A logical boundary encapsulating a specific domain concern with its own models | Doc 03 §2 |
| Business | A verified commercial entity that purchases advertising campaigns | Doc 01 §3 |
| Business Daily Rate | NPR 120 per rider per day charged to the business | Doc 02 RULE-FIN-001 |
| Campaign | A time-bound advertising engagement linking a business's creative to assigned riders | Doc 01 §3 |
| Campaign Escrow | Prepaid campaign funds held until daily release during campaign execution | Doc 13 §4 |
| Commission | Platform fee = Business Rate - Rider Rate = NPR 20/rider/day (~16.67%) | Doc 02 RULE-FIN-003 |
| Compensating Entry | A corrective ledger entry that reverses or adjusts a previous entry without modifying it | Doc 13 §3.1 |
| Configuration Entry | A runtime-modifiable platform setting managed via Super Admin panel | Doc 06 §1 |
| Creative | The advertisement artwork/design provided by a business for sticker printing | Doc 01 §3 |
| Daily Release | The daily portion of escrow released = total_escrow / total_campaign_days | Doc 02 RULE-FIN-005 |
| Domain Event | An immutable record of something that happened in the system (EVT-NNN) | Doc 03 §5 |
| Double-Entry | Accounting method requiring every transaction to have equal debits and credits | Doc 02 RULE-FIN-004 |
| Escalation | Progressive penalty for verification failures: warn → suspend → remove | Doc 02 RULE-VRF-002-004 |
| Feature Flag | A configuration toggle enabling/disabling platform features (FF-NNN) | Doc 06 |
| Fulfillment | The percentage of required riders assigned to a campaign (threshold: 100%) | Doc 02 RULE-CMP-004 |
| Ledger | The immutable, append-only record of all financial transactions | Doc 13 §3 |
| Modular Monolith | Architecture style: single deployable with internally isolated modules | Doc 04 §2.2 |
| Notification Center | Persistent in-app history of all notifications for a user | Doc 14 §5.3 |
| Notification Template | A versioned, translatable message template with variable placeholders | Doc 14 §3 |
| OTP | One-Time Password: 6-digit code sent via SMS for rider authentication | Doc 07 |
| Payout Cycle | The 15-day recurring period between payout batch generations | Doc 02 RULE-PAY-001 |
| PII | Personally Identifiable Information: data that can identify an individual | Doc 16 §4.4 |
| Platform Commission | NPR 20/rider/day retained as platform revenue | Doc 02 RULE-FIN-003 |
| Print Order | An order to an external vendor to produce stickers for a campaign | Doc 01 |
| Reconciliation | Daily verification that ledger debits equal credits with no discrepancies | Doc 13 §8 |
| Reliability Score | Weighted composite score (0-100) measuring rider performance | Doc 02 RULE-RDR-006 |
| Rider | A verified motorcycle ride-sharing driver who displays advertisements | Doc 01 §3 |
| Rider Daily Rate | NPR 100 per day earned by a rider for active campaign participation | Doc 02 RULE-FIN-002 |
| Rider Wallet | Virtual wallet accumulating rider earnings pending payout | Doc 13 §5 |
| Sticker | A physical advertisement applied to a rider's helmet | Doc 01 §3 |
| Sticker Template | Design specification for sticker production linked to campaign creative | Doc 01 |
| Timeline | Auto-generated chronological activity history for a domain entity | Doc 14 §7 |
| Verification | Periodic proof submission by riders showing sticker is properly displayed | Doc 01 |
| Ward | Administrative subdivision of Kathmandu Valley used for zone definitions | Doc 01 §2.2 |
| Zone | A collection of one or more wards defining a geographic operating area | Doc 02 RULE-ZON-001 |

### 3.2 Technical Terms


| Term | Definition | Introduced In |
|------|-----------|---------------|
| Aggregate | A cluster of domain objects treated as a single unit for data changes | Doc 03 §3 |
| BullMQ | Redis-backed job queue library for Node.js background processing | Doc 04 §3 |
| Cloudflare R2 | S3-compatible object storage with no egress fees | Doc 04 §3 |
| Correlation ID | UUID propagated through all layers for distributed request tracing | Doc 15 §8.5 |
| Docker Compose | Multi-container Docker application orchestration tool | Doc 04 §3 |
| DTO | Data Transfer Object: validated input/output structure for API endpoints | Doc 08 |
| FCM | Firebase Cloud Messaging: push notification delivery service | Doc 14 §5.1 |
| JWT | JSON Web Token: stateless authentication token (RS256, 15min access) | Doc 07 |
| NestJS | TypeScript Node.js framework with modular architecture | Doc 04 §3 |
| Nginx | Reverse proxy handling routing, rate limiting, and security headers | Doc 04 §2.1 |
| OpenAPI | API specification standard (v3.1) for documenting REST endpoints | Doc 08 §1 |
| Paisa | Smallest unit of NPR (1 NPR = 100 paisa); all amounts stored as INTEGER paisa | Doc 05 §1.2 |
| PostgreSQL | Relational database (v16) providing ACID compliance | Doc 04 §3 |
| RBAC | Role-Based Access Control: permission model with 6 roles, 89 permissions | Doc 07 |
| Redis | In-memory data store (v7) for caching, queues, and rate limiting | Doc 04 §3 |
| Socket.IO | WebSocket library with fallback for real-time bi-directional communication | Doc 04 §3 |
| TypeORM/Prisma | Type-safe ORM for database access and migration management | Doc 04 §3 |
| UUID v4 | Universally Unique Identifier (random) used for all primary keys | Doc 05 §1.2 |

### 3.3 Abbreviations

| Abbreviation | Full Form |
|-------------|-----------|
| API | Application Programming Interface |
| CI/CD | Continuous Integration / Continuous Deployment |
| CRUD | Create, Read, Update, Delete |
| CSP | Content Security Policy |
| DDoS | Distributed Denial of Service |
| ETA | Electronic Transaction Act (Nepal) |
| FCM | Firebase Cloud Messaging |
| GDPR | General Data Protection Regulation |
| JWT | JSON Web Token |
| MVP | Minimum Viable Product |
| NPR | Nepalese Rupee |
| NPT | Nepal Time (UTC+5:45) |
| ORM | Object-Relational Mapping |
| OTP | One-Time Password |
| PAN | Permanent Account Number (tax ID) |
| PII | Personally Identifiable Information |
| RBAC | Role-Based Access Control |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |
| SLA | Service Level Agreement |
| SSL/TLS | Secure Sockets Layer / Transport Layer Security |
| SSR | Server-Side Rendering |
| UUID | Universally Unique Identifier |
| VAT | Value Added Tax |
| VPS | Virtual Private Server |
| WAF | Web Application Firewall |
| XSS | Cross-Site Scripting |

---

## 4. Risk Register


### 4.1 Identified Risks

| ID | Risk | Probability | Impact | Mitigation | Residual Risk |
|----|------|-------------|--------|-----------|---------------|
| RSK-001 | Single VPS failure causes total outage | Low | Critical | Daily backups to R2; < 1hr RTO; documented restore procedure | Data loss up to 24hrs (RPO) |
| RSK-002 | Manual payment verification bottleneck | Medium | High | Clear SLA for Finance Staff; batch processing; queue management | Delays during peak campaign creation |
| RSK-003 | Rider adoption below target (< 8,000) | Medium | High | Phased rollout; incentive programs; ops team recruitment focus | Slower revenue growth |
| RSK-004 | Security breach exposing PII | Low | Critical | Cloudflare WAF; encryption; audit trail; incident response plan | Reputation damage if zero-day |
| RSK-005 | Database performance degradation at scale | Medium | Medium | Indexed queries; connection pooling; monitoring alerts | May need VPS upgrade sooner |
| RSK-006 | Mobile app store rejection | Low | Medium | Follow platform guidelines; pre-submission review | Delay in launch |
| RSK-007 | Payment provider API changes | Low | Low | Manual process (no SDK dependency); documented procedures | Minimal (manual flow) |
| RSK-008 | Operations team capacity exceeded | Medium | High | Clear runbooks; automation of routine tasks; prioritization framework | Degraded response time |
| RSK-009 | Regulatory compliance gap (Nepal ETA) | Low | High | Legal review of data handling; 5-year financial retention; audit trail | Unknown future regulations |
| RSK-010 | Network connectivity issues (Nepal) | Medium | Medium | Cloudflare caching; mobile offline graceful degradation; retry logic | Intermittent user experience issues |
| RSK-011 | Sticker damage/loss rate higher than expected | Medium | Medium | Inventory tracking; replacement process; deposit consideration (future) | Increased operational cost |
| RSK-012 | Concurrent campaign conflicts during scaling | Low | Medium | 1 campaign per asset per rider rule; conflict detection | Edge cases in overlapping dates |
| RSK-013 | Financial reconciliation discrepancies | Low | Critical | Automated daily reconciliation; immediate alerting; immutable ledger | Manual investigation required |
| RSK-014 | Third-party service outage (FCM, Cloudflare) | Low | Medium | Graceful degradation; notification center as fallback; multi-channel | Delayed notifications |
| RSK-015 | Scope creep during development | High | High | This document as scope boundary; formal change process; MVP focus | Pressure from stakeholders |

### 4.2 Risk Response Strategies

| Strategy | Application |
|----------|-------------|
| Avoid | Exclude features that introduce unacceptable risk (EXC-001 through EXC-020) |
| Mitigate | Implement controls (backups, monitoring, WAF, rate limiting) |
| Transfer | Use managed services where possible (Cloudflare, FCM) |
| Accept | Document low-probability/low-impact risks with monitoring |

---

## 5. Assumptions

### 5.1 Business Assumptions

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| 1 | Kathmandu Valley has sufficient rider population (8,000-15,000) | Reduced campaign fulfillment capacity |
| 2 | Businesses will accept manual payment process | Slower onboarding |
| 3 | 15-day payout cycle acceptable to riders | Rider dissatisfaction/attrition |
| 4 | NPR 100/day is sufficient rider compensation | Low rider retention |
| 5 | 7-day verification interval balances compliance and rider burden | Too frequent = rider fatigue; too rare = compliance risk |
| 6 | 5-person operations team can manage MVP scale | Operational bottleneck if understaffed |
| 7 | Helmet-only advertising is viable initial product | Limited advertiser appeal |

### 5.2 Technical Assumptions

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| 1 | Single VPS handles 15,000 riders + 1,500 businesses | Performance issues, need infrastructure upgrade |
| 2 | PostgreSQL handles financial ledger at MVP scale | Need sharding or separate DB earlier |
| 3 | Firebase Cloud Messaging reliable in Nepal | Notification delivery failures |
| 4 | Cloudflare provides adequate DDoS protection | Need additional security measures |
| 5 | NestJS modular monolith scales to MVP requirements | Architecture refactoring needed |
| 6 | Docker Compose sufficient (no Kubernetes needed) | Orchestration limitations |
| 7 | Daily backups provide acceptable RPO | Data loss exceeds business tolerance |

### 5.3 Operational Assumptions

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| 1 | Finance Staff available for payment verification within 24 hours | Campaign start delays |
| 2 | Operations Staff can verify rider documents within 48 hours | Rider onboarding delays |
| 3 | Internet connectivity to VPS is stable | Service interruptions |
| 4 | Team has Docker/deployment expertise | Operational incidents |
| 5 | Manual payout processing completes within payout cycle | Rider payment delays |

---

## 6. Constraints


### 6.1 Budget Constraints

| Constraint | Specification | Impact |
|-----------|---------------|--------|
| Infrastructure | Single Contabo VPS 6 (~€12/month) | No horizontal scaling; vertical limit at 6 vCPU/12GB |
| Storage | 200GB SSD (VPS) + Cloudflare R2 (pay-per-use) | Monitor disk usage; archive old data |
| Third-party services | Free tiers where possible (Firebase, GitHub) | Rate limits on free plans |
| No paid monitoring | Script-based monitoring only | Limited observability vs. Datadog/NewRelic |
| No paid CI/CD minutes | GitHub Actions free tier (2,000 min/month) | Optimize pipeline duration |

### 6.2 Team Size Constraints

| Constraint | Specification | Impact |
|-----------|---------------|--------|
| Operations staff | 5 persons total | Limited concurrent task capacity |
| No dedicated DBA | Backend developer manages database | Database optimization as needed |
| No dedicated DevOps | Shared infrastructure responsibility | Deployment and monitoring shared |
| No dedicated QA | Developers write and run tests | Testing embedded in development |
| No 24/7 coverage | Business hours only (NPT) | Off-hours incidents await morning |

### 6.3 Timeline Constraints

| Constraint | Specification |
|-----------|---------------|
| MVP delivery | Fixed timeline (project-specific) |
| No parallel development tracks | Sequential module delivery |
| Testing within sprint | No separate QA phase |

### 6.4 Technology Constraints (Locked Stack)

The following technology decisions are LOCKED per Document 04 and SHALL NOT change:

| Layer | Technology | Version | Locked |
|-------|-----------|---------|--------|
| Backend | NestJS | 10+ | Yes |
| Runtime | Node.js | 20 LTS | Yes |
| Database | PostgreSQL | 16 | Yes |
| Cache/Queue | Redis 7 + BullMQ | Latest | Yes |
| Mobile | Flutter | Latest stable | Yes |
| Frontend | Next.js 14+ (React) | Latest | Yes |
| Storage | Cloudflare R2 | N/A | Yes |
| Proxy | Nginx | Stable | Yes |
| Container | Docker + Compose | 24+/2.x | Yes |
| CI/CD | GitHub Actions | N/A | Yes |
| Real-time | Socket.IO | 4+ | Yes |
| Push | Firebase Cloud Messaging | N/A | Yes |

---

## 7. Success Criteria

### 7.1 MVP Launch Criteria

The platform SHALL NOT launch until ALL of the following are met:

| # | Criterion | Verification Method | Source |
|---|-----------|-------------------|--------|
| 1 | Rider registration and approval flow operational | E2E test TC-E2E-001 passes | REQ-PRD-001, REQ-PRD-012-014 |
| 2 | Business registration and verification operational | E2E test TC-E2E-002 passes | REQ-PRD-002, REQ-PRD-026-029 |
| 3 | Campaign creation through payment verification | E2E test TC-E2E-003 passes | REQ-PRD-038-045 |
| 4 | Rider assignment and sticker distribution | E2E test TC-E2E-004 passes | REQ-PRD-054-056, REQ-PRD-068 |
| 5 | 7-day verification cycle functional | Verification cron executes correctly | REQ-PRD-069-070 |
| 6 | Verification escalation (warn → suspend → remove) | E2E test TC-E2E-006 passes | REQ-PRD-137-139 |
| 7 | Daily escrow release calculating correctly | Financial invariant tests pass | REQ-PRD-071-073 |
| 8 | Rider wallet earnings accumulating | Wallet balance tests pass | REQ-PRD-075 |
| 9 | Payout batch generation and processing | E2E test TC-E2E-005 passes | REQ-PRD-077-080 |
| 10 | Push notifications delivering | FCM integration test passes | REQ-PRD-086-087 |
| 11 | Admin panel fully functional (all CRUD operations) | All admin endpoints tested | REQ-PRD-183-199 |
| 12 | Business portal campaign management | Portal integration tests pass | REQ-PRD-176-182 |
| 13 | Mobile app published to app stores | Store listing approved | REQ-PRD-168-175 |
| 14 | All 72 business rules have passing tests | CI pipeline green, traceability complete | Doc 02 (all rules) |
| 15 | Security controls operational (WAF, rate limiting, RBAC) | Security test suite passes | REQ-PRD-209-216 |
| 16 | Backup and restore procedure validated | Successful restore from backup tested | REQ-PRD-208 |
| 17 | Performance targets met (p95 < 200ms, 200 concurrent) | k6 load test results | Doc 17 §9 |
| 18 | Daily reconciliation job running without discrepancies | 7 consecutive clean reconciliation runs | Doc 13 §8 |

### 7.2 Operational Readiness Checklist

| # | Item | Status Required |
|---|------|----------------|
| 1 | Production environment provisioned and hardened | Complete |
| 2 | CI/CD pipeline deploying to production | Verified |
| 3 | Monitoring and alerting configured | Active |
| 4 | Backup automation running | Verified with restore test |
| 5 | Runbook documented and team trained | All staff reviewed |
| 6 | Incident response procedure documented | Team acknowledged |
| 7 | All environment secrets configured | Verified in production |
| 8 | DNS and SSL configured correctly | Verified with external check |
| 9 | Firebase project configured (prod) | Push notifications tested |
| 10 | R2 bucket configured with lifecycle policies | Verified |

### 7.3 Go/No-Go Decision Framework

| Decision | Criteria | Authority |
|----------|----------|-----------|
| GO | All 18 launch criteria met + operational readiness complete | Project Lead + Tech Lead |
| CONDITIONAL GO | 16/18 criteria met; remaining 2 have documented workaround | Project Lead + Stakeholder approval |
| NO-GO | < 16 criteria met OR any critical security/financial issue | Automatic — no override |

---

## 8. Document Index


### 8.1 Complete Document Registry

| # | Document | Purpose | Key Identifiers |
|---|----------|---------|-----------------|
| 01 | Product Requirements Specification | Foundational requirements (228 REQ-PRD-*) | REQ-PRD-001 through REQ-PRD-228 |
| 02 | Business Rules Engine | Canonical business rules (72 rules) | RULE-*-NNN (14 domains) |
| 03 | Domain Model | Bounded contexts, aggregates, events | CTX-001–014, AGG-001–018, EVT-001–060 |
| 04 | System Architecture | Technology stack, infrastructure decisions | ARCH-001–005, SVC-001–008 |
| 05 | Data Model | Physical database schema (47 tables) | TBL-001–047, IDX-001–NNN |
| 06 | Configuration Dictionary | Runtime configuration (55 entries) | CFG-001–055, FF-001–020, DICT-001–014 |
| 07 | Authentication and Permissions | Auth architecture, RBAC (89 permissions) | PERM-001–089, 6 roles |
| 08 | API Specification | REST endpoints (152 endpoints) | EP-001–152, OpenAPI 3.1 |
| 09 | Rider App Specification | Flutter mobile app screens and flows | Screen specs, navigation |
| 10 | Business Portal Specification | Next.js business web application | Portal pages, workflows |
| 11 | Admin Panel Specification | Next.js admin web application | Panel sections, management UIs |
| 12 | Campaign and Assignment Specification | Campaign lifecycle, assignment workflows | State machines, transitions |
| 13 | Financial Platform Specification | Ledger, escrow, wallets, payouts | FOP-001–007, ACCT-001–005 |
| 14 | Notifications and Timeline Specification | Push, in-app, center, timeline | NTPL-001–062, NCAT-001–007, TLE-001–055 |
| 15 | Deployment and Operations Specification | CI/CD, Docker, backups, runbook | DPL-001–004, RBK-001–002 |
| 16 | Security and Compliance Specification | Threat model, encryption, compliance | SEC-001–017, THR-NNN |
| 17 | Testing Strategy Specification | Test pyramid, coverage, QA process | TS-001–005, TC-*-NNN (72 rule tests) |
| 18 | MVP Scope and Glossary | Scope boundaries, terminology, risks | SCP-001–035, EXC-001–020, RSK-001–015 |

### 8.2 Cross-Reference Index

| Requirement Layer | Defined In | Referenced By | Count |
|-------------------|-----------|---------------|-------|
| Product Requirements (REQ-PRD-*) | Doc 01 | All documents | 228 |
| Business Rules (RULE-*-NNN) | Doc 02 | Doc 05, 08, 12, 13, 17 | 72 |
| Bounded Contexts (CTX-*) | Doc 03 | Doc 04, 05, 08, 13, 14 | 14 |
| Aggregates (AGG-*) | Doc 03 | Doc 05, 08 | 18 |
| Domain Events (EVT-*) | Doc 03 | Doc 12, 13, 14 | 60 |
| Architecture Decisions (ARCH-*) | Doc 04 | Doc 05, 15, 16 | 5 |
| Service Containers (SVC-*) | Doc 04 | Doc 15 | 8 |
| Database Tables (TBL-*) | Doc 05 | Doc 08 | 47 |
| Configuration Entries (CFG-*) | Doc 06 | Doc 02, 08, 11 | 55 |
| Feature Flags (FF-*) | Doc 06 | Doc 14 | 20 |
| Permissions (PERM-*) | Doc 07 | Doc 08, 11 | 89 |
| API Endpoints (EP-*) | Doc 08 | Doc 09, 10, 11, 17 | 152 |
| Financial Operations (FOP-*) | Doc 13 | Doc 17 | 7 |
| Notification Templates (NTPL-*) | Doc 14 | Doc 17 | 62 |
| Security Controls (SEC-*) | Doc 16 | Doc 17 | 17 |

---

## 9. Version History and Change Control

### 9.1 Specification Change Management

All specification changes SHALL follow this process:

1. **Change Request:** Document the proposed change, affected documents, and justification.
2. **Impact Analysis:** Identify all downstream documents affected by the change.
3. **Review:** Technical review by specification owners of affected documents.
4. **Approval:** Sign-off from project lead.
5. **Implementation:** Update all affected documents atomically.
6. **Communication:** Notify team of changes and affected areas.

### 9.2 Change Impact Categories

| Category | Definition | Process |
|----------|-----------|---------|
| Editorial | Typo, formatting, clarification (no behavior change) | Direct commit, no approval |
| Minor | Additive change (new endpoint, new config) | Review + approval |
| Major | Behavioral change (rule modification, architecture) | Full impact analysis + approval |
| Breaking | Incompatible change (removed feature, data model) | Stakeholder approval + migration plan |

### 9.3 Version Numbering

- Documents use semantic versioning: MAJOR.MINOR
- MAJOR: Breaking changes or significant restructuring
- MINOR: Additive changes or corrections
- Current version: 1.0 (initial release, all 18 documents)

---

## 10. Traceability Summary

### 10.1 Complete Documentation Chain

```
Requirements (Doc 01, 228 items)
    ↓
Business Rules (Doc 02, 72 rules)
    ↓
Domain Model (Doc 03, 14 contexts, 18 aggregates, 60 events)
    ↓
Architecture (Doc 04, locked technology stack)
    ↓
Data Model (Doc 05, 47 tables) + Config (Doc 06, 55 entries)
    ↓
Auth/Permissions (Doc 07, 89 permissions) + API (Doc 08, 152 endpoints)
    ↓
UI Specifications (Doc 09, 10, 11) + Domain Specs (Doc 12, 13, 14)
    ↓
Operations (Doc 15) + Security (Doc 16) + Testing (Doc 17)
    ↓
Scope & Glossary (Doc 18 — THIS DOCUMENT)
```

### 10.2 Traceability Guarantee

Every specification element in Documents 03-17 SHALL trace back to at least one:
- Product requirement (REQ-PRD-*) from Document 01, OR
- Business rule (RULE-*-NNN) from Document 02

Any specification element without upstream traceability is INVALID and SHALL be removed or justified with a formal exception.

### 10.3 Coverage Verification

| Upstream Artifact | Total Count | Referenced in Downstream | Coverage |
|-------------------|-------------|--------------------------|----------|
| REQ-PRD-* | 228 | All referenced in Docs 03-17 | 100% |
| RULE-*-NNN | 72 | All tested in Doc 17 | 100% |
| CTX-* | 14 | All implemented in Doc 04-05 | 100% |
| AGG-* | 18 | All schematized in Doc 05 | 100% |
| EVT-* | 60 | All handled in Doc 12-14 | 100% |

---

*End of Document 18*
