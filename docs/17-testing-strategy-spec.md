# Document 17 - Testing Strategy Specification

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every testing requirement, coverage target, test category, and QA process defined in this document is the AUTHORITATIVE specification for quality assurance. No release may proceed without meeting the test requirements defined here.

---

## 1. Purpose and Scope

This document defines the complete testing approach, test pyramid, coverage targets, testing tools, QA processes, and test requirements for every domain module of the Solo Advertiser platform.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Test framework | Jest (unit + integration) |
| API testing | Supertest |
| E2E testing | Critical user journeys |
| Performance testing | k6 |
| Mobile testing | Flutter test + integration_test |
| Coverage enforcement | CI pipeline gate |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Test suite identifiers use prefix TS-NNN.
- Test scenario identifiers use prefix TC-NNN.
- All 72 business rules from Document 02 SHALL have corresponding test cases.

### 1.3 Upstream References

| Document | Relevant Sections |
|----------|-------------------|
| Document 01 | All 228 requirements (REQ-PRD-*) |
| Document 02 | All 72 business rules (RULE-*-NNN) |
| Document 04 | Technology stack, module boundaries |
| Document 08 | 152 API endpoints (EP-001 through EP-152) |
| Document 13 | Financial calculations and invariants |

---

## 2. Testing Philosophy

### 2.1 Principles

1. **Shift-left:** Testing begins at design time. Test cases SHALL be derived from specifications before code is written.
2. **Test pyramid:** More unit tests than integration tests, more integration tests than E2E tests.
3. **Business rule coverage:** Every business rule from Document 02 SHALL have at least one automated test proving enforcement.
4. **Fail-fast CI:** Tests SHALL run on every PR and block merge on failure.
5. **Deterministic:** Tests SHALL produce the same result regardless of execution order or time.
6. **Isolated:** Each test SHALL clean up its own state. No test SHALL depend on another test's side effects.

### 2.2 Test Pyramid

```
         ┌─────────┐
         │  E2E    │  (~5%)   Critical paths only
         │  Tests  │          6-10 scenarios
         ├─────────┤
         │ Integration │ (~25%)  API + DB
         │   Tests     │         All endpoints
         ├──────────────┤
         │  Unit Tests  │ (~70%)  Service logic
         │              │         Validators, calculations
         └──────────────┘
```

### 2.3 Test-Driven Business Rules

Every rule in Document 02 SHALL map to at least one test case:

| Rule Taxonomy | Test Category | Test Focus |
|---------------|--------------|------------|
| VALIDATION | Unit | Input rejected/accepted correctly |
| CALCULATION | Unit | Output matches expected formula |
| WORKFLOW | Integration | State transition allowed/denied |
| SECURITY | Integration | Authorization enforced |
| COMPLIANCE | Integration | Required data validated |
| CONFIGURATION | Unit + Integration | Config values applied correctly |
| SYSTEM | Integration | System behavior triggered |

---

## 3. Test Categories

### 3.1 Unit Tests (TS-001)

**Scope:** Individual service methods, validators, utility functions, calculations.

**Characteristics:**
- No external dependencies (database, Redis, network)
- Mocked dependencies via Jest mocks
- Fast execution (< 50ms per test)
- Grouped by module and service

**What to Unit Test:**
- All service method logic paths
- All DTO validation rules
- All calculation functions (financial, scoring, date)
- All state machine transition validations
- All error condition handling
- All permission check utilities

### 3.2 Integration Tests (TS-002)

**Scope:** API endpoints with real database, testing full request → response cycle.

**Characteristics:**
- Real PostgreSQL (test instance)
- Real Redis (test instance)
- Mocked external services (FCM, R2, SMS)
- Request via Supertest (HTTP)
- Full middleware chain (validation, auth, rate limiting)

**What to Integration Test:**
- Every API endpoint (152 endpoints from Document 08)
- Authentication flows (login, OTP, refresh, logout)
- Authorization boundaries (role-based access)
- Database state changes (create, update, state transitions)
- Error responses (4xx, 5xx scenarios)
- Pagination and filtering
- File upload handling

### 3.3 End-to-End Tests (TS-003)

**Scope:** Complete user journeys spanning multiple endpoints and state changes.

**Characteristics:**
- Full application stack (all containers)
- Real database with seed data
- Simulated external services
- Sequential multi-step scenarios
- Longer execution time (acceptable)

**Critical E2E Scenarios:**

| ID | Scenario | Steps |
|----|----------|-------|
| TC-E2E-001 | Rider registration to approval | Register → OTP → Documents → Review → Approve |
| TC-E2E-002 | Business registration to verification | Register → Email verify → Documents → Review → Approve |
| TC-E2E-003 | Campaign creation to payment | Create → Configure → Submit → Payment → Verify |
| TC-E2E-004 | Assignment full lifecycle | Create assignment → Distribute sticker → Verify → Complete |
| TC-E2E-005 | Payout full cycle | Earn daily → Batch generate → Approve → Complete |
| TC-E2E-006 | Verification escalation | Miss verify → Warning → Suspend → Remove |

### 3.4 Contract Tests (TS-004)

**Scope:** API contract verification against OpenAPI 3.1 specification.

**Characteristics:**
- Validate response schemas match OpenAPI definitions
- Validate required fields presence
- Validate status codes for each endpoint
- Run as part of integration test suite

### 3.5 Performance Tests (TS-005)

**Scope:** Load testing critical endpoints under concurrent load.

**Tools:** k6

**Targets:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Concurrent users | 200 | Sustained for 5 minutes |
| p95 response time | < 200ms | All GET endpoints |
| p95 response time | < 500ms | All POST/PUT endpoints |
| Error rate | < 0.1% | Under normal load |
| Throughput | > 500 req/s | Aggregate across endpoints |

---

## 4. Test Infrastructure

### 4.1 Test Framework Configuration

```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "roots": ["<rootDir>/src", "<rootDir>/test"],
    "moduleNameMapper": { "@/*": "<rootDir>/src/*" },
    "coverageDirectory": "./coverage",
    "coverageReporters": ["text", "lcov", "json-summary"],
    "collectCoverageFrom": [
      "src/**/*.ts",
      "!src/**/*.module.ts",
      "!src/**/*.dto.ts",
      "!src/**/index.ts",
      "!src/main.ts"
    ]
  }
}
```

### 4.2 Test Database

- Dedicated PostgreSQL instance for tests (Docker container)
- Schema created from migrations before test suite
- Truncated between test files (not between individual tests for performance)
- No shared state between test suites
- Connection pool limited to 5 connections (prevent resource exhaustion)

### 4.3 Test Fixtures and Factories

Each domain module SHALL provide a test factory:

```typescript
// Example: CampaignFactory
class CampaignFactory {
  static create(overrides?: Partial<Campaign>): Campaign;
  static createDraft(businessId: string): Campaign;
  static createRunning(riders: number, days: number): Campaign;
  static createWithEscrow(amount: number): Campaign;
}
```

**Factory Requirements:**
- One factory per aggregate entity
- Default values SHALL produce valid entities
- Overrides SHALL allow testing edge cases
- Factories SHALL handle related entity creation (e.g., campaign with business)

### 4.4 CI Test Execution

```yaml
# GitHub Actions test stage
test:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:16-alpine
      env:
        POSTGRES_DB: solo_test
        POSTGRES_USER: test_user
        POSTGRES_PASSWORD: test_pass
    redis:
      image: redis:7-alpine
  steps:
    - run: npm ci
    - run: npm run test:unit -- --coverage
    - run: npm run test:integration -- --coverage
    - run: npm run test:coverage-check
```

---

## 5. Coverage Targets

### 5.1 Line Coverage

| Category | Target | Enforcement |
|----------|--------|-------------|
| Unit tests | ≥ 80% line coverage | CI gate (merge blocked) |
| Integration tests | All 152 API endpoints exercised | Manual checklist + CI |
| Combined | ≥ 85% line coverage | CI gate |

### 5.2 Branch Coverage

| Module Type | Target |
|-------------|--------|
| Service logic | ≥ 75% branch coverage |
| Validators | ≥ 90% branch coverage |
| Controllers | ≥ 70% branch coverage |

### 5.3 Business Rule Coverage

| Requirement | Target | Verification |
|-------------|--------|--------------|
| Document 02 rules tested | 100% (72/72 rules) | Traceability matrix (§11) |
| Each rule has ≥ 1 passing test | Mandatory | CI + manual audit |
| Each rule has negative test | Mandatory | Verify rejection case |

### 5.4 Endpoint Coverage

| Requirement | Target |
|-------------|--------|
| All 152 endpoints have ≥ 1 integration test | 100% |
| All endpoints have authentication test | 100% |
| All endpoints have authorization test | 100% |
| All endpoints have validation error test | 100% |
| All endpoints have success response test | 100% |

---

## 6. Testing by Domain Module

### 6.1 Identity Module (CTX-001)

| Test Focus | Category | Key Scenarios |
|-----------|----------|---------------|
| OTP generation | Unit | Valid phone, rate limiting, format |
| OTP verification | Integration | Correct code, expired code, max attempts |
| JWT issuance | Unit | Payload structure, expiry, signing |
| Token refresh | Integration | Valid refresh, expired, revoked |
| Session management | Integration | Create, list, revoke |
| Password hashing | Unit | Correct hash verification |
| Account lockout | Integration | Threshold reached, lockout duration |

### 6.2 Rider Module (CTX-002)

| Test Focus | Category | Key Scenarios |
|-----------|----------|---------------|
| Registration validation | Unit | Phone format, required fields |
| Document submission | Integration | File type, size, count |
| Status transitions | Integration | Valid/invalid paths |
| Reliability score | Unit | Weight calculation, boundary values |
| Zone assignment | Unit | Valid zone, invalid zone |

### 6.3 Business Module (CTX-003)

| Test Focus | Category | Key Scenarios |
|-----------|----------|---------------|
| Registration validation | Unit | Email format, required fields |
| Document requirements | Integration | 3 required documents |
| Verification workflow | Integration | Approve, reject with reason |
| Status transitions | Integration | Blacklist permanence |

### 6.4 Campaign Module (CTX-004)

| Test Focus | Category | Key Scenarios |
|-----------|----------|---------------|
| Creation validation | Unit | Min days (15), min riders (100) |
| Cost calculation | Unit | riders × days × rate = correct |
| State machine | Integration | All valid transitions, blocked transitions |
| Payment submission | Integration | Method, amount match, proof required |
| Fulfillment threshold | Integration | 99% vs 100% |

### 6.5 Assignment Module (CTX-005)

| Test Focus | Category | Key Scenarios |
|-----------|----------|---------------|
| Eligibility validation | Unit | Zone match, status check, conflict detection |
| Assignment creation | Integration | Valid, duplicate, wrong state |
| Removal with reason | Integration | Reason required, replacement flagged |
| Concurrent campaign limit | Unit | 1 per asset type |

### 6.6 Finance Module (CTX-007) — Critical

| Test Focus | Category | Key Scenarios |
|-----------|----------|---------------|
| Ledger balance invariant | Unit + Integration | Debits always equal credits |
| Escrow creation | Integration | Correct amount, double-entry |
| Daily release calculation | Unit | total_escrow / total_days |
| Rider earning credit | Integration | NPR 100 per active day |
| Platform commission | Unit | NPR 20 per rider per day |
| Wallet balance derivation | Integration | Never stored, always computed |
| Payout eligibility | Unit | >= NPR 500 threshold |
| Batch generation | Integration | Correct eligible riders |
| Cancellation refund | Unit | Remaining days × daily rate |
| Reconciliation check | Integration | Imbalance detection |
| Ledger immutability | Integration | UPDATE/DELETE rejected |

**Financial Module Invariant Tests:**
- After any operation, SUM(debits) SHALL equal SUM(credits)
- Wallet balance SHALL never be negative
- Escrow balance SHALL never exceed original amount
- Daily release SHALL be exactly total_escrow / total_days

### 6.7 Verification Module (CTX-010)

| Test Focus | Category | Key Scenarios |
|-----------|----------|---------------|
| Overdue detection | Unit | 7-day window calculation |
| Escalation logic | Integration | 1st → warn, 2nd → suspend, 3rd → remove |
| Photo requirement | Integration | Missing photo rejected |
| Timer accuracy | Unit | Correct interval calculation |

### 6.8 Notification Module (CTX-008)

| Test Focus | Category | Key Scenarios |
|-----------|----------|---------------|
| Template resolution | Unit | Variable substitution |
| Channel routing | Unit | Preference respect |
| Event-to-notification mapping | Integration | All triggers fire correctly |
| Preference enforcement | Integration | Disabled channel not fired |

---

## 7. Test Data Management

### 7.1 Factories and Fixtures

**Factory Pattern:**
- Each aggregate has a dedicated factory class
- Factories use Builder pattern for complex entities
- Default values produce valid, consistent entities
- Random but deterministic (seeded if needed)

**Required Factories:**

| Factory | Creates | Dependencies |
|---------|---------|-------------|
| UserFactory | User with role | — |
| RiderFactory | Rider with documents | UserFactory |
| BusinessFactory | Business with documents | UserFactory |
| CampaignFactory | Campaign in any state | BusinessFactory |
| AssignmentFactory | Rider-Campaign binding | RiderFactory, CampaignFactory |
| LedgerFactory | Ledger entries | CampaignFactory |
| WalletFactory | Rider wallet with balance | RiderFactory, LedgerFactory |
| PayoutBatchFactory | Payout batch | WalletFactory |

### 7.2 Test Seeding

- Integration tests: seed via factories at test setup
- E2E tests: dedicated seed script creating realistic data set
- Performance tests: bulk seed (10,000 riders, 100 campaigns, 500 businesses)
- Seed scripts SHALL be idempotent

### 7.3 Cleanup Strategy

- **Unit tests:** No cleanup needed (no external state)
- **Integration tests:** TRUNCATE all tables between test files
- **E2E tests:** Full database reset between scenarios
- **Performance tests:** Dedicated test environment (separate from dev/CI)

---

## 8. QA Process

### 8.1 PR Review Checklist

Every PR SHALL meet the following before merge:

| # | Requirement | Verified By |
|---|-------------|-------------|
| 1 | All CI checks pass (lint + test + build) | Automated |
| 2 | Coverage not decreased from main branch | Automated |
| 3 | New business rule has corresponding test | Reviewer |
| 4 | New endpoint has integration test | Reviewer |
| 5 | No test marked as `.skip` without linked issue | Reviewer |
| 6 | Error cases tested (not just happy path) | Reviewer |
| 7 | Test names describe behavior, not implementation | Reviewer |
| 8 | No hardcoded IDs, dates, or non-deterministic values | Reviewer |

### 8.2 Test Requirements for Merging

| Criterion | Gate Type | Action on Failure |
|-----------|-----------|-------------------|
| Unit tests pass | Hard gate | Merge blocked |
| Integration tests pass | Hard gate | Merge blocked |
| Coverage ≥ 80% | Hard gate | Merge blocked |
| No security test regressions | Hard gate | Merge blocked |
| E2E tests pass | Soft gate | Review + override allowed |
| Performance tests pass | Informational | Investigate, no block |

### 8.3 Bug Reporting Format

| Field | Required | Description |
|-------|----------|-------------|
| Title | Yes | Clear, descriptive summary |
| Steps to reproduce | Yes | Numbered step sequence |
| Expected behavior | Yes | What SHOULD happen |
| Actual behavior | Yes | What DOES happen |
| Environment | Yes | dev/staging/prod + version |
| Severity | Yes | Critical/High/Medium/Low |
| Screenshots/logs | If applicable | Supporting evidence |
| Business rule reference | If applicable | RULE-*-NNN |

### 8.4 Regression Testing

- After every bug fix, a regression test SHALL be added
- Regression tests SHALL reproduce the exact bug scenario
- Regression test suite SHALL run on every CI build
- Quarterly review of regression suite for relevance

---

## 9. Performance Testing

### 9.1 Load Targets

| Scenario | Virtual Users | Duration | Success Criteria |
|----------|--------------|----------|-----------------|
| Normal load | 50 concurrent | 10 min | p95 < 200ms, 0% errors |
| Peak load | 200 concurrent | 5 min | p95 < 500ms, < 0.1% errors |
| Stress test | 500 concurrent | 2 min | Graceful degradation, no crash |
| Endurance test | 100 concurrent | 30 min | No memory leak, stable p95 |

### 9.2 k6 Test Scenarios

| Scenario | Endpoints | Weight |
|----------|-----------|--------|
| Rider login + dashboard | /auth/otp/*, /riders/me, /assignments | 40% |
| Business campaign view | /auth/login, /campaigns, /campaigns/:id | 20% |
| Operations staff work | /admin/assignments, /admin/verifications | 20% |
| Verification submission | /verifications/submit (with file) | 10% |
| Payout processing | /finance/payouts/*, /finance/wallets | 10% |

### 9.3 Performance Baselines

| Endpoint Category | p50 Target | p95 Target | p99 Target |
|-------------------|-----------|-----------|-----------|
| Simple GET (list) | < 50ms | < 150ms | < 300ms |
| Simple GET (by ID) | < 30ms | < 100ms | < 200ms |
| POST (create) | < 100ms | < 300ms | < 500ms |
| PUT (update) | < 100ms | < 300ms | < 500ms |
| File upload | < 500ms | < 2000ms | < 5000ms |
| Complex query | < 200ms | < 500ms | < 1000ms |

---

## 10. Mobile Testing (Rider App)

### 10.1 Device Matrix

| Platform | Minimum Version | Test Devices |
|----------|----------------|--------------|
| Android | 8.0 (API 26) | Samsung Galaxy A series, Xiaomi Redmi |
| iOS | 14.0 | iPhone SE (2nd gen), iPhone 12 |

**Rationale:** Nepal market dominated by mid-range Android devices. iOS coverage for completeness.

### 10.2 Mobile Test Categories

| Category | Framework | Scope |
|----------|-----------|-------|
| Unit tests | flutter_test | Business logic, state management |
| Widget tests | flutter_test | UI component rendering |
| Integration tests | integration_test | Full user flows on device/emulator |

### 10.3 Offline Testing

| Scenario | Expected Behavior | Test Method |
|----------|-------------------|-------------|
| No network on launch | Show cached data, offline indicator | Airplane mode |
| Network loss mid-operation | Queue action, retry on reconnect | Network toggle |
| Weak network (2G) | Graceful timeout, retry UI | Network throttling |
| Push while offline | Receive on reconnect (FCM handles) | Background + airplane |

### 10.4 Push Notification Testing

| Scenario | Verification |
|----------|-------------|
| App in foreground | In-app notification displayed |
| App in background | System notification shown |
| App terminated | System notification shown, tap opens correct screen |
| Deep link navigation | Notification tap navigates to correct entity |
| Multiple notifications | Badge count correct, list ordered |

---

## 11. Business Rule Test Traceability

### 11.1 Business Registration Rules

| Rule | Test ID | Test Description | Category |
|------|---------|-----------------|----------|
| RULE-BIZ-001 | TC-BIZ-001 | Registration requires valid email | Unit |
| RULE-BIZ-002 | TC-BIZ-002 | 3 documents required for review | Integration |
| RULE-BIZ-003 | TC-BIZ-003 | Only Ops Staff+ can verify business | Integration |
| RULE-BIZ-004 | TC-BIZ-004 | Only Verified/Active can create campaigns | Integration |
| RULE-BIZ-005 | TC-BIZ-005 | First campaign triggers Active status | Integration |
| RULE-BIZ-006 | TC-BIZ-006 | Only Ops/Admin/Super can suspend | Integration |
| RULE-BIZ-007 | TC-BIZ-007 | Only Super Admin can blacklist | Integration |
| RULE-BIZ-008 | TC-BIZ-008 | Blacklisted cannot write | Integration |

### 11.2 Rider Registration Rules

| Rule | Test ID | Test Description | Category |
|------|---------|-----------------|----------|
| RULE-RDR-001 | TC-RDR-001 | Registration requires valid Nepal phone | Unit |
| RULE-RDR-002 | TC-RDR-002 | 4 documents required | Integration |
| RULE-RDR-003 | TC-RDR-003 | Max 1 campaign per asset | Unit |
| RULE-RDR-004 | TC-RDR-004 | Suspended cannot receive assignments | Integration |
| RULE-RDR-005 | TC-RDR-005 | Only Available status eligible | Integration |
| RULE-RDR-006 | TC-RDR-006 | Reliability score = weighted composite | Unit |
| RULE-RDR-007 | TC-RDR-007 | Withdrawal forfeits future, keeps earned | Integration |
| RULE-RDR-008 | TC-RDR-008 | Withdrawal triggers replacement flag | Integration |

### 11.3 Campaign Rules

| Rule | Test ID | Test Description | Category |
|------|---------|-----------------|----------|
| RULE-CMP-001 | TC-CMP-001 | Duration ≥ 15 days enforced | Unit |
| RULE-CMP-002 | TC-CMP-002 | Riders ≥ 100 enforced | Unit |
| RULE-CMP-003 | TC-CMP-003 | Cost = riders × days × 120 | Unit |
| RULE-CMP-004 | TC-CMP-004 | 100% fulfillment required | Integration |
| RULE-CMP-005 | TC-CMP-005 | Cannot skip payment step | Integration |
| RULE-CMP-006 | TC-CMP-006 | Escrow on verification | Integration |
| RULE-CMP-007 | TC-CMP-007 | Refund on cancellation (unused portion) | Integration |
| RULE-CMP-008 | TC-CMP-008 | Only Ops/Admin can pause running | Integration |
| RULE-CMP-009 | TC-CMP-009 | Only Admin/Super can cancel running | Integration |
| RULE-CMP-010 | TC-CMP-010 | NPR currency only | Unit |

### 11.4 Assignment Rules

| Rule | Test ID | Test Description | Category |
|------|---------|-----------------|----------|
| RULE-ASN-001 | TC-ASN-001 | Zone overlap required | Unit |
| RULE-ASN-002 | TC-ASN-002 | Overlapping date conflict detected | Unit |
| RULE-ASN-003 | TC-ASN-003 | Only Ops Staff+ can assign | Integration |
| RULE-ASN-004 | TC-ASN-004 | Only Recruiting state accepts assignments | Integration |
| RULE-ASN-005 | TC-ASN-005 | Removal requires documented reason | Integration |
| RULE-ASN-006 | TC-ASN-006 | Below-threshold triggers replacement | Integration |

### 11.5 Sticker/Asset Rules

| Rule | Test ID | Test Description | Category |
|------|---------|-----------------|----------|
| RULE-STK-001 | TC-STK-001 | Template linked to campaign | Unit |
| RULE-STK-002 | TC-STK-002 | Print order requires 4 fields | Unit |
| RULE-STK-003 | TC-STK-003 | Distribution requires photo proof | Integration |
| RULE-STK-004 | TC-STK-004 | Inventory counts updated on distribution | Integration |
| RULE-STK-005 | TC-STK-005 | Unique batch identifier | Unit |
| RULE-STK-006 | TC-STK-006 | Asset types via configuration | Integration |

### 11.6 Verification Rules

| Rule | Test ID | Test Description | Category |
|------|---------|-----------------|----------|
| RULE-VRF-001 | TC-VRF-001 | 7-day interval enforced | Unit |
| RULE-VRF-002 | TC-VRF-002 | First failure = warning only | Integration |
| RULE-VRF-003 | TC-VRF-003 | Second failure = suspension | Integration |
| RULE-VRF-004 | TC-VRF-004 | Third failure = removal | Integration |
| RULE-VRF-005 | TC-VRF-005 | Photo required | Integration |
| RULE-VRF-006 | TC-VRF-006 | Only Ops Staff+ can approve/reject | Integration |

### 11.7 Financial Rules

| Rule | Test ID | Test Description | Category |
|------|---------|-----------------|----------|
| RULE-FIN-001 | TC-FIN-001 | Business charged NPR 120/rider/day | Unit |
| RULE-FIN-002 | TC-FIN-002 | Rider earns NPR 100/day | Unit |
| RULE-FIN-003 | TC-FIN-003 | Platform commission = NPR 20/day | Unit |
| RULE-FIN-004 | TC-FIN-004 | Double-entry balanced | Integration |
| RULE-FIN-005 | TC-FIN-005 | Daily release = escrow / days | Unit |
| RULE-FIN-006 | TC-FIN-006 | Ledger entries immutable | Integration |
| RULE-FIN-007 | TC-FIN-007 | 5 account types maintained | Unit |

### 11.8 Payout Rules

| Rule | Test ID | Test Description | Category |
|------|---------|-----------------|----------|
| RULE-PAY-001 | TC-PAY-001 | 15-day cycle frequency | Integration |
| RULE-PAY-002 | TC-PAY-002 | Minimum NPR 500 enforced | Unit |
| RULE-PAY-003 | TC-PAY-003 | Supported methods validated | Unit |
| RULE-PAY-004 | TC-PAY-004 | Manual approval required | Integration |
| RULE-PAY-005 | TC-PAY-005 | Proof required before completion | Integration |
| RULE-PAY-006 | TC-PAY-006 | Payment methods validated | Unit |
| RULE-PAY-007 | TC-PAY-007 | Manual verification only | Integration |

### 11.9 Notification, Document, Zone, and Security Rules

| Rule | Test ID | Test Description | Category |
|------|---------|-----------------|----------|
| RULE-NTF-001 | TC-NTF-001 | Events trigger notifications | Integration |
| RULE-NTF-002 | TC-NTF-002 | Push + in-app channels | Integration |
| RULE-NTF-003 | TC-NTF-003 | Real-time < 5 seconds | Integration |
| RULE-NTF-004 | TC-NTF-004 | Preferences respected | Integration |
| RULE-DOC-001 | TC-DOC-001 | Expiry reminders at 30/15/7 days | Unit |
| RULE-DOC-002 | TC-DOC-002 | Only Ops Staff+ can approve docs | Integration |
| RULE-DOC-003 | TC-DOC-003 | Expired → Replacement Required | Integration |
| RULE-DOC-004 | TC-DOC-004 | Rejection requires reason | Integration |
| RULE-DOC-005 | TC-DOC-005 | File type and size validated | Unit |
| RULE-ZON-001 | TC-ZON-001 | Zone requires at least 1 ward | Unit |
| RULE-ZON-002 | TC-ZON-002 | Only Super Admin manages zones | Integration |
| RULE-ZON-003 | TC-ZON-003 | Zones within Kathmandu Valley | Unit |
| RULE-ZON-004 | TC-ZON-004 | Zone match required for assignment | Unit |
| RULE-SEC-001 | TC-SEC-001 | Lockout after 5 failed attempts | Integration |

**Total: 72 rules → 72 test cases (minimum). All SHALL pass before release.**

---

*End of Document 17*
