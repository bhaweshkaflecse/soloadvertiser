# Document 16 - Security and Compliance Specification

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every security control, encryption requirement, access policy, threat mitigation, and compliance obligation defined in this document is the AUTHORITATIVE specification for platform security. No implementation may weaken, bypass, or omit controls defined here.

---

## 1. Purpose and Scope

This document defines the complete security architecture, threat model, data protection policies, encryption strategy, and compliance requirements for the Solo Advertiser platform.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Assets protected | PII, financial data, credentials, documents, platform code |
| Threat environment | Internet-facing platform in Nepal market |
| Compliance regime | Nepal Electronic Transaction Act (ETA 2063) consideration |
| Authentication | JWT-based (RS256) with OTP for riders |
| Authorization | Role-Based Access Control (RBAC) |
| Infrastructure | Single VPS behind Cloudflare |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Security control identifiers use prefix SEC-NNN.
- Threat identifiers use prefix THR-NNN.

### 1.3 Upstream References

| Document | Relevant Sections |
|----------|-------------------|
| Document 01 | REQ-PRD-209 through REQ-PRD-216 |
| Document 02 | RULE-SEC-001 |
| Document 04 | §3 Technology Stack (Cloudflare, Nginx, JWT) |
| Document 07 | Authentication and permissions (full reference) |
| Document 08 | API security headers, rate limiting |

---

## 2. Threat Model

### 2.1 Asset Inventory

| Asset | Classification | Location | Impact if Compromised |
|-------|---------------|----------|----------------------|
| Rider PII (name, phone, address) | Confidential | PostgreSQL | Privacy violation, legal liability |
| Rider documents (citizenship, license) | Restricted | Cloudflare R2 | Identity theft risk |
| Business PAN/VAT documents | Restricted | Cloudflare R2 | Financial fraud risk |
| Financial ledger data | Confidential | PostgreSQL | Financial manipulation |
| User credentials (password hashes) | Restricted | PostgreSQL | Account takeover |
| JWT signing keys | Restricted | Environment variables | Full authentication bypass |
| Payment proof images | Confidential | Cloudflare R2 | Financial fraud evidence tampering |
| API keys (Firebase, R2) | Restricted | Environment variables | Service abuse |

### 2.2 Threat Actors

| Actor | Motivation | Capability | Likelihood |
|-------|-----------|-----------|-----------|
| External attackers | Financial gain, data theft | Automated tools, known exploits | High |
| Malicious users (riders/businesses) | Financial manipulation, fraud | Platform access, social engineering | Medium |
| Insider threats (staff) | Data theft, unauthorized actions | Elevated access, system knowledge | Low |
| Competitors | Service disruption | DDoS, scraping | Low |

### 2.3 Attack Vectors

| Vector | Target | Mitigation Reference |
|--------|--------|---------------------|
| API abuse (enumeration, scraping) | Public endpoints | §8 Rate Limiting |
| SQL injection | Database | §7.2 Parameterized queries |
| Authentication bypass | Login endpoints | §5 Authentication Security |
| XSS (stored/reflected) | Web portals | §7.3 Output encoding |
| CSRF | State-changing requests | §7.4 CSRF protection |
| File upload exploitation | Document upload | §7.5 File upload security |
| Session hijacking | JWT tokens | §5.1 Short-lived tokens |
| Brute force (OTP/password) | Authentication | §5.3 Rate limiting + lockout |
| Data breach via backup | R2 stored backups | §4.2 Encryption at rest |
| Privilege escalation | RBAC boundaries | §6 Authorization Security |

### 2.4 STRIDE Analysis

| Component | Spoofing | Tampering | Repudiation | Info Disclosure | DoS | Elevation |
|-----------|----------|-----------|-------------|-----------------|-----|-----------|
| Mobile App | JWT validation | TLS + integrity | Audit trail | TLS | Rate limits | RBAC |
| API Gateway | JWT + OTP | Input validation | Audit trail | Minimal responses | Rate limits | Permission checks |
| Database | Connection auth | Parameterized queries | Immutable audit | Network isolation | Connection limits | Role separation |
| File Storage | Signed URLs | Immutable uploads | Access logging | Time-limited URLs | Size limits | Bucket policies |
| Admin Panel | JWT + session | CSRF tokens | Audit trail | CSP headers | Rate limits | Permission matrix |

---

## 3. Network Security

### 3.1 Cloudflare Protection (SEC-001)

| Control | Configuration |
|---------|--------------|
| DDoS protection | Enabled (automatic) |
| WAF | OWASP Core Rule Set enabled |
| SSL/TLS | Full (Strict) mode |
| SSL termination | At Cloudflare edge |
| Bot management | Challenge suspicious requests |
| IP reputation | Block known-bad IPs |
| Rate limiting | Additional layer at edge |
| Page Rules | Force HTTPS redirect |

### 3.2 Nginx Hardening (SEC-002)

| Control | Configuration |
|---------|--------------|
| Rate limiting | 100 req/min per IP (general), 10 req/min (auth endpoints) |
| Request size limit | 10MB maximum body |
| Timeout | 30s read, 30s send |
| Headers - X-Frame-Options | DENY |
| Headers - X-Content-Type-Options | nosniff |
| Headers - X-XSS-Protection | 1; mode=block |
| Headers - Strict-Transport-Security | max-age=31536000; includeSubDomains |
| Headers - Content-Security-Policy | default-src 'self'; script-src 'self' |
| Headers - Referrer-Policy | strict-origin-when-cross-origin |
| Server tokens | Disabled (hide Nginx version) |
| Allowed methods | GET, POST, PUT, PATCH, DELETE, OPTIONS |

### 3.3 Docker Network Isolation (SEC-003)

- Database containers SHALL NOT be accessible from the frontend network.
- Redis SHALL NOT be accessible from the frontend network.
- No container SHALL expose ports directly to the host (except Nginx 80/443).
- Inter-container communication SHALL use Docker DNS service names.
- The host firewall (UFW) SHALL block all ports except 22, 80, 443.

### 3.4 SSH Security (SEC-004)

| Control | Configuration |
|---------|--------------|
| Authentication | Key-based only (password disabled) |
| Port | Non-default (configured per deployment) |
| Root login | Disabled |
| Allowed users | Explicit allowlist |
| Fail2ban | 5 failed attempts → 1 hour ban |
| IP restriction | Team IPs only (UFW rules) |

---

## 4. Data Protection

### 4.1 Data Classification

| Level | Description | Examples | Controls |
|-------|-------------|----------|----------|
| Public | No sensitivity | Marketing content, public APIs | Standard access |
| Internal | Business operations | Aggregate statistics, configs | Authenticated access |
| Confidential | User/business data | PII, financial records | Encrypted + RBAC |
| Restricted | Critical secrets | Credentials, documents, keys | Encrypted + minimal access + audit |

### 4.2 Encryption at Rest

| Data Store | Encryption | Method |
|-----------|-----------|--------|
| PostgreSQL | Volume-level encryption | dm-crypt (LUKS) on VPS storage |
| Cloudflare R2 | Built-in encryption | AES-256 (managed by Cloudflare) |
| Backups in R2 | Application-level encryption | AES-256-GCM before upload |
| Redis | None (ephemeral cache) | Acceptable — no sensitive data persisted |
| Environment files | OS file permissions | 600 (owner read/write only) |

### 4.3 Encryption in Transit

| Path | Protocol | Minimum Version |
|------|----------|-----------------|
| Client → Cloudflare | HTTPS | TLS 1.2 |
| Cloudflare → Nginx | HTTPS (origin cert) | TLS 1.2 |
| Nginx → Backend | HTTP (internal network) | N/A (Docker internal) |
| Backend → PostgreSQL | Unencrypted | N/A (Docker internal) |
| Backend → Redis | Unencrypted | N/A (Docker internal) |
| Backend → R2 | HTTPS | TLS 1.2 |
| Backend → FCM | HTTPS | TLS 1.2 |

**Justification:** Internal Docker network traffic is isolated and not routable externally. Encrypting internal paths would add latency without meaningful security improvement for single-VPS deployment.

### 4.4 PII Handling

| PII Type | Storage | Access | Retention |
|----------|---------|--------|-----------|
| Phone numbers | PostgreSQL (plaintext) | Operations Staff+ | Active + 1 year |
| Email addresses | PostgreSQL (plaintext) | Operations Staff+ | Active + 1 year |
| Physical addresses | PostgreSQL (plaintext) | Operations Staff+ | Active + 1 year |
| Citizenship/License photos | R2 (encrypted) | Operations Staff+ (signed URL) | Active + 1 year |
| Vehicle registration | R2 (encrypted) | Operations Staff+ (signed URL) | Active + 1 year |
| PAN/VAT certificates | R2 (encrypted) | Finance Staff+ (signed URL) | Active + 3 years |

### 4.5 Data Retention Policies

| Data Type | Retention Period | Disposal Method |
|-----------|-----------------|-----------------|
| Audit trail | 3 years | Archived to cold storage, then deleted |
| Financial records | 5 years | Archived to cold storage, then deleted |
| User accounts (active) | Indefinite | N/A |
| User accounts (deactivated) | Active + 1 year | Soft delete → hard delete after retention |
| Uploaded documents | Active + 1 year | R2 lifecycle policy deletion |
| System logs | 30 days | Log rotation (automatic) |
| Backup files | 7 daily + 4 weekly | R2 lifecycle policy deletion |

### 4.6 Data Deletion Procedures

**User Account Deletion (SEC-005):**
1. Verify identity (OTP or admin action)
2. Soft-delete user record (set deleted_at)
3. Anonymize PII after retention period (replace with hashed values)
4. Remove uploaded documents from R2
5. Retain audit entries (anonymized actor reference)
6. Retain financial records (legal requirement)

---

## 5. Authentication Security

### 5.1 JWT Architecture (SEC-006)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Algorithm | RS256 (RSA + SHA-256) | Asymmetric — verify without signing key |
| Access token TTL | 15 minutes | Minimize exposure window |
| Refresh token TTL | 7 days | Balance usability and security |
| Key rotation | Manual (quarterly minimum) | Update signing key without invalidating all tokens |
| Token storage (mobile) | Secure storage (Flutter secure_storage) | Platform keychain |
| Token storage (web) | httpOnly cookie (refresh) + memory (access) | XSS protection |

**Access Token Payload:**
```json
{
  "sub": "user_uuid",
  "role": "rider",
  "permissions": ["perm_1", "perm_2"],
  "device_id": "device_uuid",
  "iat": 1705312800,
  "exp": 1705313700
}
```

### 5.2 OTP Security (Riders) (SEC-007)

| Parameter | Value |
|-----------|-------|
| OTP length | 6 digits |
| OTP validity | 5 minutes |
| OTP delivery | SMS (primary) |
| Rate limit | 3 OTPs per phone per 15 minutes |
| Lockout | 5 failed verifications → 30 minute lockout |
| Replay protection | Single-use (invalidated after verification or expiry) |
| Generation | Cryptographically random (not time-based) |

### 5.3 Password Policy (Staff Accounts) (SEC-008)

| Requirement | Specification |
|-------------|---------------|
| Minimum length | 8 characters |
| Complexity | At least 1 uppercase + 1 lowercase + 1 numeric |
| History | Cannot reuse last 5 passwords |
| Expiry | 90 days (configurable, SHOULD enforce) |
| Storage | bcrypt (cost factor 12) |
| Reset | Email-based reset link (1 hour expiry, single-use) |

### 5.4 Session Management (SEC-009)

| Control | Specification |
|---------|---------------|
| Per-device sessions | Each device has independent refresh token |
| Concurrent sessions | Maximum 5 active sessions per user |
| Forced logout | Admin can invalidate all sessions for a user |
| Device tracking | Device ID + user agent stored per session |
| Session listing | Users can view and revoke own sessions |
| Inactivity timeout | 30 days (refresh token TTL) |

---

## 6. Authorization Security

### 6.1 RBAC Enforcement Points (SEC-010)

| Layer | Mechanism | Responsibility |
|-------|-----------|---------------|
| API Gateway | JWT validation + permission extraction | Token authenticity |
| Controller | @RequirePermission() decorator | Endpoint-level access |
| Service | Business logic permission check | Resource-level access |
| Database | No direct user access (application-only) | Data isolation |

### 6.2 Permission Validation

Every API endpoint SHALL:
1. Validate JWT signature and expiry
2. Extract user role and permissions from token
3. Check required permission against user's permission set
4. For resource endpoints: verify user owns or has access to the resource
5. Log authorization failures to audit trail

### 6.3 Resource-Level Access Control

| Resource | Owner Access | Staff Access | Admin Access |
|----------|-------------|--------------|--------------|
| Rider profile | Own only | All (read), own zone (write) | All |
| Business profile | Own only | All (read), assigned (write) | All |
| Campaign | Own business only | All | All |
| Financial data | Own only (limited) | Finance Staff+ | All |
| Documents | Own only | Operations Staff+ | All |
| System config | None | None | Admin+ (read), Super Admin (write) |

---

## 7. Input Security

### 7.1 Validation Framework (SEC-011)

- ALL request payloads SHALL be validated using class-validator DTOs.
- Validation SHALL occur BEFORE any business logic execution.
- Validation errors SHALL return 400 with specific field-level error messages.
- Unknown fields SHALL be stripped (whitelist approach).

### 7.2 SQL Injection Prevention (SEC-012)

- ALL database queries SHALL use parameterized queries (via TypeORM/Prisma).
- Raw SQL SHALL be prohibited except for pre-approved, reviewed queries.
- Dynamic table/column names SHALL NOT be constructed from user input.
- Query logging SHALL NOT include parameter values in production.

### 7.3 XSS Prevention (SEC-013)

| Control | Implementation |
|---------|---------------|
| Output encoding | HTML entity encoding for all user-generated content |
| Content-Security-Policy | Strict CSP headers (no inline scripts) |
| React auto-escaping | Default JSX escaping for web portals |
| API responses | JSON content-type (no HTML rendering) |
| Stored content | Sanitized on input (DOMPurify for rich text) |

### 7.4 CSRF Protection (SEC-014)

- Web portals SHALL implement CSRF tokens for state-changing requests.
- SameSite=Strict cookie attribute for session cookies.
- Custom header requirement (X-Requested-With) for AJAX requests.
- Mobile app: N/A (token-based, no cookies).

### 7.5 File Upload Security (SEC-015)

| Control | Specification |
|---------|---------------|
| File type validation | Whitelist: JPEG, PNG, PDF only |
| Magic byte verification | Verify file header matches declared type |
| Size limit | 10MB maximum per file |
| Filename sanitization | Generate UUID filename, discard original |
| Storage isolation | Separate R2 bucket path per entity type |
| Direct execution prevention | No executable permissions; served via signed URL |
| Virus scanning | Future consideration (not MVP, documented risk) |

---

## 8. Rate Limiting

### 8.1 Rate Limit Categories (SEC-016)

| Category | Limit | Window | Endpoints |
|----------|-------|--------|-----------|
| Authentication | 10 requests | 15 minutes | /auth/login, /auth/otp/* |
| OTP generation | 3 requests | 15 minutes | /auth/otp/send |
| General API | 100 requests | 1 minute | All authenticated endpoints |
| File upload | 10 requests | 5 minutes | /media/upload |
| Search/List | 60 requests | 1 minute | GET endpoints with query params |
| Admin operations | 30 requests | 1 minute | /admin/* endpoints |

### 8.2 Implementation

- Redis-backed sliding window algorithm
- Key: `ratelimit:{category}:{identifier}` (IP for auth, user_id for authenticated)
- TTL: window duration
- Counter: atomic increment (INCR)

### 8.3 Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705313760
```

### 8.4 Exceeded Response

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Type: application/json

{
  "statusCode": 429,
  "error": "TOO_MANY_REQUESTS",
  "message": "Rate limit exceeded. Try again in 60 seconds."
}
```

---

## 9. Audit and Compliance

### 9.1 Immutable Audit Trail (SEC-017)

Every security-relevant action SHALL be recorded:

| Field | Description |
|-------|-------------|
| id | UUID |
| actor_id | Who performed the action |
| actor_role | Role at time of action |
| action | What was done (verb) |
| resource_type | What type of entity |
| resource_id | Which entity |
| before_state | State before change (JSONB) |
| after_state | State after change (JSONB) |
| reason | Why (if required by business rules) |
| ip_address | Request origin IP |
| user_agent | Client identifier |
| device_id | Device reference |
| timestamp | When (TIMESTAMPTZ, UTC) |
| correlation_id | Request trace ID |

### 9.2 Audit Triggers

| Action Category | Examples |
|----------------|----------|
| Authentication | Login, logout, OTP verification, password change |
| Authorization | Permission denied events |
| Data modification | Create, update, delete of any entity |
| Financial | Payments, escrow, payouts, ledger entries |
| Administrative | Role changes, config updates, user suspension |
| Document | Upload, approve, reject |
| Security | Rate limit exceeded, lockout triggered |

### 9.3 Log Retention

- Audit log entries SHALL be retained for a minimum of 3 years.
- Financial audit entries SHALL be retained for 5 years.
- Audit entries SHALL NOT be modified or deleted (append-only table).
- Archival to cold storage after 1 year (accessible but not in hot queries).

### 9.4 Compliance Considerations

| Regulation | Applicability | Controls |
|-----------|---------------|----------|
| Nepal ETA 2063 | Electronic transactions | Digital signatures, record keeping |
| Data Protection | PII handling | Retention policies, deletion procedures |
| Financial Reporting | Transaction records | 5-year retention, immutable ledger |
| Tax Compliance | Invoice generation | Sequential numbering, VAT recording |

---

## 10. Incident Response

### 10.1 Detection Methods

| Method | Scope | Alert Threshold |
|--------|-------|-----------------|
| Rate limit exceeded (bulk) | DDoS/Brute force | > 50 blocked requests in 1 minute |
| Failed auth spike | Credential stuffing | > 20 failed logins in 5 minutes |
| Unusual data access | Data breach | Query patterns outside normal (manual review) |
| Error rate spike | Application compromise | > 5% 5xx in 5 minutes |
| Audit trail anomaly | Insider threat | Admin actions outside business hours |
| Reconciliation failure | Financial tampering | Any ledger imbalance (EVT-039) |

### 10.2 Response Procedures

**Severity Classification:**

| Severity | Definition | Response Time | Example |
|----------|-----------|---------------|---------|
| Critical | Active breach, data exfiltration | Immediate | Database access by unauthorized party |
| High | Vulnerability exploited, service compromise | < 1 hour | Authentication bypass discovered |
| Medium | Suspected attempt, no confirmed breach | < 4 hours | Unusual access patterns |
| Low | Policy violation, minor anomaly | < 24 hours | Staff accessing data outside role |

**Response Steps:**
1. **Contain:** Isolate affected system/account immediately
2. **Assess:** Determine scope and impact
3. **Eradicate:** Remove threat actor access
4. **Recover:** Restore from known-good state
5. **Report:** Document timeline and actions taken
6. **Review:** Post-incident analysis and control improvements

### 10.3 Communication Plan

| Audience | When | Channel | Content |
|----------|------|---------|---------|
| Technical team | Immediately | Internal chat | Full technical details |
| Management | Within 1 hour | Direct message | Impact summary |
| Affected users | Within 24 hours | In-app + email | What happened, what we're doing |
| Regulators | If required by law | Formal letter | Compliance notification |

### 10.4 Post-Incident Review

Within 72 hours of resolution:
- Timeline of events
- Root cause analysis
- Controls that failed
- Controls that worked
- Improvement actions with owners and deadlines
- Update to this security specification if needed

---

## 11. Security Testing

### 11.1 OWASP Top 10 Coverage

| # | Risk | Control | Testing Method |
|---|------|---------|----------------|
| A01 | Broken Access Control | RBAC + resource checks | Permission boundary tests |
| A02 | Cryptographic Failures | TLS + encryption at rest | Configuration audit |
| A03 | Injection | Parameterized queries | SAST + manual review |
| A04 | Insecure Design | Threat model + SDL | Architecture review |
| A05 | Security Misconfiguration | Hardened defaults | Automated config scanning |
| A06 | Vulnerable Components | Dependency scanning | npm audit + Snyk/Dependabot |
| A07 | Auth Failures | JWT + OTP + lockout | Auth flow penetration test |
| A08 | Data Integrity Failures | Immutable ledger + signing | Integrity verification tests |
| A09 | Logging Failures | Structured audit logging | Log completeness tests |
| A10 | SSRF | No user-controlled URLs | Code review |

### 11.2 Dependency Vulnerability Scanning

- `npm audit` SHALL run on every CI build
- Dependabot (GitHub) SHALL be enabled for automated PR creation
- Critical/High vulnerabilities SHALL block merge
- Medium vulnerabilities SHALL be addressed within 7 days
- Low vulnerabilities SHALL be addressed within 30 days

### 11.3 Penetration Testing (Future)

- Schedule: Annually (after MVP stabilization)
- Scope: External attack surface + authenticated paths
- Provider: Independent third-party firm
- Report: Findings prioritized by CVSS score
- Remediation: Critical within 7 days, High within 30 days

---

## 12. Traceability Matrix

| Specification Element | Upstream Reference |
|----------------------|-------------------|
| Cloudflare WAF + DDoS | REQ-PRD-209 |
| JWT authentication | REQ-PRD-210 |
| RBAC authorization | REQ-PRD-211 |
| Data encryption | REQ-PRD-212 |
| Input validation | REQ-PRD-213 |
| Rate limiting | REQ-PRD-214 |
| Audit trail | REQ-PRD-215 |
| Compliance | REQ-PRD-216 |
| Account lockout | RULE-SEC-001 |

---

*End of Document 16*
