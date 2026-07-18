# Document 07 - Authentication and Permissions

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every authentication flow, token format, session behavior, and permission grant defined in this document is the AUTHORITATIVE security contract. No endpoint, guard, or middleware may implement authentication or authorization logic not specified here.

---

## 1. Purpose and Scope

This document specifies the complete Identity & Auth module (CTX-001, Document 03 §3.1) — registration flows, login mechanisms, JWT architecture, session management, RBAC permission model, and security controls for the Solo Advertiser platform.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Module | IdentityModule (CTX-001) per Document 04 §5.1 |
| Roles | 6 roles: Rider, Business, Operations Staff, Finance Staff, Admin, Super Admin |
| Token format | JWT with RS256 signing |
| Session store | Redis (Document 04 §7.4) |
| Password hashing | bcrypt, cost factor >= 10 (REQ-PRD-210) |
| OTP | 6-digit numeric, 5-minute expiry |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Permission identifiers use prefix PERM-NNN.
- Error codes follow AUTH_0XX pattern.
- All authentication events are logged to the audit trail (REQ-PRD-006).


---

## 2. Registration Flows

### 2.1 Rider Registration (Phone + OTP)

**Flow:** REQ-PRD-001, RULE-RDR-001

1. Rider submits phone number (Nepal format: +977XXXXXXXXXX).
2. System validates phone format and uniqueness.
3. System generates 6-digit OTP, stores hashed in Redis (`otp:{phone}:registration`, TTL: 5 min).
4. System sends OTP via SMS gateway.
5. Rider submits OTP for verification.
6. System validates OTP (hash comparison, expiry check, single-use).
7. On success: Create `identity_users` record (role=rider), create `rider_riders` record (status=pre_registered).
8. System issues access + refresh token pair.
9. Rider account is active; rider status begins at Pre-Registered.

**Validation Rules:**
- Phone SHALL match pattern: `+977[0-9]{10}` (Nepal mobile).
- Phone SHALL NOT already exist in `identity_users`.
- OTP SHALL be 6 digits, valid for 5 minutes, single-use.
- Maximum 5 OTP generation requests per phone per 15 minutes (rate limit).

**Error Codes:**
- AUTH_011: Invalid phone number format.
- AUTH_012: Phone number already registered.
- AUTH_013: OTP expired or invalid.
- AUTH_014: OTP rate limit exceeded.

### 2.2 Business Registration (Email + Verification)

**Flow:** REQ-PRD-002, RULE-BIZ-001

1. Business representative submits email, password, company name, and contact details.
2. System validates email format, uniqueness, and password complexity.
3. System creates `identity_users` record (role=business, status=pending_verification).
4. System generates email verification token (UUID, stored hashed in `identity_credentials`, TTL: 24 hours).
5. System sends verification email with link.
6. Business clicks verification link.
7. System validates token (hash comparison, expiry check, single-use).
8. On success: Activate user account, create `business_businesses` record (status=registered).
9. System issues access + refresh token pair.

**Validation Rules:**
- Email SHALL be valid RFC 5322 format.
- Email SHALL NOT already exist in `identity_users`.
- Password SHALL meet complexity requirements (§8.1).
- Company name SHALL be 2–255 characters.

**Error Codes:**
- AUTH_015: Invalid email format.
- AUTH_016: Email already registered.
- AUTH_017: Verification token expired or invalid.
- AUTH_018: Password does not meet complexity requirements.

### 2.3 Staff Account Creation (Super Admin Only)

**Flow:** REQ-PRD-009

1. Super Admin submits: email, temporary password, role, full name.
2. System validates email uniqueness and role value.
3. System creates `identity_users` record with specified role.
4. System sends welcome email with temporary credentials.
5. On first login, staff member SHALL be required to change password.

**Validation Rules:**
- Only Super Admin SHALL invoke this flow (RULE-BIZ-007 pattern).
- Role SHALL be one of: operations_staff, finance_staff, admin, super_admin.
- Email SHALL be unique.
- Temporary password SHALL meet complexity requirements.

**Error Codes:**
- AUTH_019: Insufficient authority (not Super Admin).
- AUTH_020: Invalid role for staff creation.

---

## 3. Authentication Mechanisms

### 3.1 Phone + OTP Login (Riders)

1. Rider submits phone number.
2. System verifies phone exists and account is not locked/suspended.
3. System generates OTP, stores in Redis, sends via SMS.
4. Rider submits OTP.
5. System validates OTP.
6. On success: Reset failed_login_attempts, issue token pair, create session.
7. On failure: Increment failed_login_attempts; if >= 5, lock account (RULE-SEC-001).

### 3.2 Email + Password Login (Business/Staff)

1. User submits email and password.
2. System verifies email exists and account is not locked/suspended.
3. System compares password against stored bcrypt hash.
4. On success: Reset failed_login_attempts, issue token pair, create session.
5. On failure: Increment failed_login_attempts; if >= 5, lock account (RULE-SEC-001).

### 3.3 Token Refresh

1. Client submits refresh token.
2. System validates: token exists in Redis, not revoked, not expired.
3. On success: Issue new access token (and optionally rotate refresh token).
4. On failure: Return AUTH_021 (invalid refresh token).

### 3.4 Logout

1. Client submits refresh token (from current session).
2. System marks session as revoked in `identity_sessions`.
3. System removes refresh token from Redis.
4. Access token remains valid until natural expiry (max 15 minutes).

### 3.5 Force Logout (All Sessions)

1. Triggered by: account suspension (REQ-PRD-005), password change, or explicit user action.
2. System marks ALL sessions for the user as revoked.
3. System removes ALL refresh tokens for the user from Redis.
4. Connected WebSocket clients SHALL receive a `session.invalidated` event and disconnect.

---

## 4. Token Architecture

### 4.1 Access Token

| Property | Value |
|----------|-------|
| Format | JWT (RFC 7519) |
| Algorithm | RS256 (RSA PKCS#1 v1.5 with SHA-256) |
| Expiry | 15 minutes (CFG-039) |
| Storage | Client-side only (memory/secure storage) |
| Refresh | Via refresh token endpoint |

**Claims (Payload):**

```json
{
  "sub": "user-uuid",
  "role": "rider",
  "iat": 1705286400,
  "exp": 1705287300,
  "jti": "unique-token-id",
  "session_id": "session-uuid",
  "device_id": "device-identifier"
}
```

### 4.2 Refresh Token

| Property | Value |
|----------|-------|
| Format | JWT (RFC 7519) |
| Algorithm | RS256 |
| Expiry | 7 days (CFG-040) |
| Storage | Server-side hash in Redis + `identity_sessions` table |
| Rotation | Optional rotation on each refresh (recommended) |

**Claims (Payload):**

```json
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1705286400,
  "exp": 1705891200,
  "jti": "unique-refresh-token-id",
  "session_id": "session-uuid"
}
```

### 4.3 Token Signing

- Private key (RS256): Used by the backend to sign tokens.
- Public key (RS256): MAY be distributed to services that need to verify tokens independently.
- Key rotation: Annually or on compromise (Document 04 §14.7).
- Key storage: `.env.production` + GitHub Secrets.

### 4.4 Token Validation Pipeline

For every authenticated request:

1. Extract `Authorization: Bearer <token>` header.
2. Verify JWT signature against RS256 public key.
3. Check `exp` claim — reject if expired.
4. Check `jti` — verify session is not revoked in Redis.
5. Extract `sub` (user ID) and `role` for downstream authorization.
6. If validation fails at any step, return HTTP 401 with appropriate AUTH error code.

---

## 5. Session Management

### 5.1 Session Creation

A session SHALL be created upon every successful authentication:

| Field | Value |
|-------|-------|
| user_id | Authenticated user's UUID |
| device_name | Extracted from User-Agent or client-provided |
| device_type | mobile, desktop, tablet |
| ip_address | Request source IP |
| refresh_token_hash | bcrypt hash of issued refresh token |
| expires_at | NOW() + 7 days |

### 5.2 Per-Device Sessions

- Each device/client SHALL have its own session record (REQ-PRD-008).
- Users MAY have multiple concurrent sessions (one per device).
- Session list SHALL be viewable by the user via `GET /api/v1/auth/sessions`.

### 5.3 Session Revocation

| Trigger | Scope | Mechanism |
|---------|-------|-----------|
| User logout | Single session | Mark session revoked, remove Redis entry |
| User requests "logout all devices" | All sessions | Revoke all, clear Redis entries |
| Account suspension | All sessions | Revoke all, emit session.invalidated WebSocket event |
| Password change | All sessions (except current) | Revoke others, force re-authentication |
| Admin forces logout | All sessions | Revoke all, audit log entry |

### 5.4 Session Cleanup

Expired and revoked sessions SHALL be cleaned up by the weekly cron job (Document 04 §8.4).

---

## 6. Role-Based Access Control

### 6.1 Role Hierarchy

```
Super Admin (Level 4)
    └── Admin (Level 3)
        ├── Operations Staff (Level 2)
        └── Finance Staff (Level 2)

Rider (Level 1) — Peer to Business
Business (Level 1) — Peer to Rider
```

### 6.2 Role Definitions

| Role | Level | Description | Account Creation |
|------|-------|-------------|-----------------|
| Rider | 1 | Motorcycle rider carrying advertisements | Self-registration (phone + OTP) |
| Business | 1 | Commercial entity purchasing campaigns | Self-registration (email + password) |
| Operations Staff | 2 | Day-to-day platform operations management | Super Admin creates |
| Finance Staff | 2 | Financial operations and payout management | Super Admin creates |
| Admin | 3 | Elevated platform administration | Super Admin creates |
| Super Admin | 4 | Full system access, zone management, config | Initial seed + Super Admin creates |

### 6.3 Role Inheritance

- Super Admin SHALL have ALL permissions of Admin, Operations Staff, and Finance Staff.
- Admin SHALL have ALL permissions of Operations Staff AND Finance Staff.
- Operations Staff and Finance Staff are PEERS — neither inherits from the other.
- Rider and Business are PEERS with completely separate permission sets.


---

## 7. Permission Matrix

### 7.1 Identity & Auth Permissions

| ID | Permission | Rider | Business | Ops Staff | Finance Staff | Admin | Super Admin |
|----|-----------|-------|----------|-----------|--------------|-------|-------------|
| PERM-001 | auth.login | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-002 | auth.refresh | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-003 | auth.logout | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-004 | auth.sessions.list_own | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-005 | auth.sessions.revoke_own | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-006 | auth.sessions.revoke_any | — | — | — | — | ✓ | ✓ |
| PERM-007 | auth.staff.create | — | — | — | — | — | ✓ |
| PERM-008 | auth.staff.deactivate | — | — | — | — | — | ✓ |
| PERM-009 | auth.force_logout_user | — | — | — | — | ✓ | ✓ |

### 7.2 Rider Permissions

| ID | Permission | Rider | Business | Ops Staff | Finance Staff | Admin | Super Admin |
|----|-----------|-------|----------|-----------|--------------|-------|-------------|
| PERM-010 | rider.profile.read_own | ✓ | — | — | — | — | — |
| PERM-011 | rider.profile.update_own | ✓ | — | — | — | — | — |
| PERM-012 | rider.list | — | — | ✓ | — | ✓ | ✓ |
| PERM-013 | rider.read_any | — | — | ✓ | ✓ | ✓ | ✓ |
| PERM-014 | rider.documents.upload_own | ✓ | — | — | — | — | — |
| PERM-015 | rider.documents.review | — | — | ✓ | — | ✓ | ✓ |
| PERM-016 | rider.verify | — | — | ✓ | — | ✓ | ✓ |
| PERM-017 | rider.suspend | — | — | ✓ | — | ✓ | ✓ |
| PERM-018 | rider.reactivate | — | — | — | — | ✓ | ✓ |
| PERM-019 | rider.availability.update_own | ✓ | — | — | — | — | — |
| PERM-020 | rider.score.read_own | ✓ | — | — | — | — | — |
| PERM-021 | rider.score.read_any | — | — | ✓ | — | ✓ | ✓ |

### 7.3 Business Permissions

| ID | Permission | Rider | Business | Ops Staff | Finance Staff | Admin | Super Admin |
|----|-----------|-------|----------|-----------|--------------|-------|-------------|
| PERM-022 | business.profile.read_own | — | ✓ | — | — | — | — |
| PERM-023 | business.profile.update_own | — | ✓ | — | — | — | — |
| PERM-024 | business.list | — | — | ✓ | — | ✓ | ✓ |
| PERM-025 | business.read_any | — | — | ✓ | ✓ | ✓ | ✓ |
| PERM-026 | business.documents.upload_own | — | ✓ | — | — | — | — |
| PERM-027 | business.documents.review | — | — | ✓ | — | ✓ | ✓ |
| PERM-028 | business.verify | — | — | ✓ | — | ✓ | ✓ |
| PERM-029 | business.suspend | — | — | ✓ | — | ✓ | ✓ |
| PERM-030 | business.reactivate | — | — | — | — | ✓ | ✓ |
| PERM-031 | business.blacklist | — | — | — | — | — | ✓ |

### 7.4 Campaign Permissions

| ID | Permission | Rider | Business | Ops Staff | Finance Staff | Admin | Super Admin |
|----|-----------|-------|----------|-----------|--------------|-------|-------------|
| PERM-032 | campaign.create | — | ✓ | — | — | — | — |
| PERM-033 | campaign.read_own | — | ✓ | — | — | — | — |
| PERM-034 | campaign.list_all | — | — | ✓ | ✓ | ✓ | ✓ |
| PERM-035 | campaign.read_any | — | — | ✓ | ✓ | ✓ | ✓ |
| PERM-036 | campaign.update_own | — | ✓ | — | — | — | — |
| PERM-037 | campaign.submit_payment | — | ✓ | — | — | — | — |
| PERM-038 | campaign.verify_payment | — | — | — | ✓ | ✓ | ✓ |
| PERM-039 | campaign.pause | — | — | ✓ | — | ✓ | ✓ |
| PERM-040 | campaign.cancel_pre_running | — | — | ✓ | — | ✓ | ✓ |
| PERM-041 | campaign.cancel_running | — | — | — | — | ✓ | ✓ |

### 7.5 Assignment Permissions

| ID | Permission | Rider | Business | Ops Staff | Finance Staff | Admin | Super Admin |
|----|-----------|-------|----------|-----------|--------------|-------|-------------|
| PERM-042 | assignment.create | — | — | ✓ | — | ✓ | ✓ |
| PERM-043 | assignment.list_own | ✓ | — | — | — | — | — |
| PERM-044 | assignment.list_all | — | — | ✓ | — | ✓ | ✓ |
| PERM-045 | assignment.read_any | — | — | ✓ | ✓ | ✓ | ✓ |
| PERM-046 | assignment.remove_rider | — | — | ✓ | — | ✓ | ✓ |
| PERM-047 | assignment.replace_rider | — | — | ✓ | — | ✓ | ✓ |

### 7.6 Sticker Permissions

| ID | Permission | Rider | Business | Ops Staff | Finance Staff | Admin | Super Admin |
|----|-----------|-------|----------|-----------|--------------|-------|-------------|
| PERM-048 | sticker.template.create | — | — | ✓ | — | ✓ | ✓ |
| PERM-049 | sticker.order.create | — | — | ✓ | — | ✓ | ✓ |
| PERM-050 | sticker.batch.receive | — | — | ✓ | — | ✓ | ✓ |
| PERM-051 | sticker.distribute | — | — | ✓ | — | ✓ | ✓ |
| PERM-052 | sticker.verification.submit | ✓ | — | — | — | — | — |
| PERM-053 | sticker.verification.review | — | — | ✓ | — | ✓ | ✓ |
| PERM-054 | sticker.inventory.read | — | — | ✓ | — | ✓ | ✓ |

### 7.7 Finance Permissions

| ID | Permission | Rider | Business | Ops Staff | Finance Staff | Admin | Super Admin |
|----|-----------|-------|----------|-----------|--------------|-------|-------------|
| PERM-055 | finance.ledger.read | — | — | — | ✓ | ✓ | ✓ |
| PERM-056 | finance.escrow.read | — | — | — | ✓ | ✓ | ✓ |
| PERM-057 | finance.wallet.read_own | ✓ | — | — | — | — | — |
| PERM-058 | finance.wallet.read_any | — | — | — | ✓ | ✓ | ✓ |
| PERM-059 | finance.payout.generate_batch | — | — | — | ✓ | ✓ | ✓ |
| PERM-060 | finance.payout.approve_batch | — | — | — | ✓ | ✓ | ✓ |
| PERM-061 | finance.payout.read_own | ✓ | — | — | — | — | — |
| PERM-062 | finance.payment.verify | — | — | — | ✓ | ✓ | ✓ |
| PERM-063 | finance.reconciliation | — | — | — | ✓ | ✓ | ✓ |
| PERM-064 | finance.wallet.adjust | — | — | — | ✓ | ✓ | ✓ |

### 7.8 Configuration Permissions

| ID | Permission | Rider | Business | Ops Staff | Finance Staff | Admin | Super Admin |
|----|-----------|-------|----------|-----------|--------------|-------|-------------|
| PERM-065 | config.settings.read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-066 | config.settings.write | — | — | — | — | — | ✓ |
| PERM-067 | config.flags.read | — | — | ✓ | ✓ | ✓ | ✓ |
| PERM-068 | config.flags.write | — | — | — | — | — | ✓ |
| PERM-069 | config.dictionary.read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-070 | config.dictionary.write | — | — | — | — | — | ✓ |
| PERM-071 | config.history.read | — | — | — | — | ✓ | ✓ |

### 7.9 Audit & Timeline Permissions

| ID | Permission | Rider | Business | Ops Staff | Finance Staff | Admin | Super Admin |
|----|-----------|-------|----------|-----------|--------------|-------|-------------|
| PERM-072 | audit.read | — | — | — | — | — | ✓ |
| PERM-073 | timeline.read_own | ✓ | ✓ | — | — | — | — |
| PERM-074 | timeline.read_any | — | — | ✓ | ✓ | ✓ | ✓ |

### 7.10 Media, Support, Analytics, Zone Permissions

| ID | Permission | Rider | Business | Ops Staff | Finance Staff | Admin | Super Admin |
|----|-----------|-------|----------|-----------|--------------|-------|-------------|
| PERM-075 | media.upload | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-076 | media.delete_own | ✓ | ✓ | — | — | — | — |
| PERM-077 | media.delete_any | — | — | — | — | ✓ | ✓ |
| PERM-078 | support.ticket.create | ✓ | ✓ | — | — | — | — |
| PERM-079 | support.ticket.read_own | ✓ | ✓ | — | — | — | — |
| PERM-080 | support.ticket.manage | — | — | ✓ | — | ✓ | ✓ |
| PERM-081 | support.ticket.assign | — | — | ✓ | — | ✓ | ✓ |
| PERM-082 | analytics.dashboard.read | — | — | ✓ | ✓ | ✓ | ✓ |
| PERM-083 | analytics.reports.read_own | — | ✓ | — | — | — | — |
| PERM-084 | analytics.reports.read_all | — | — | ✓ | ✓ | ✓ | ✓ |
| PERM-085 | analytics.export | — | — | ✓ | ✓ | ✓ | ✓ |
| PERM-086 | zones.read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-087 | zones.manage | — | — | — | — | — | ✓ |
| PERM-088 | notification.read_own | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-089 | notification.preferences.update_own | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |


---

## 8. Account Security

### 8.1 Password Requirements (Email Accounts)

Per REQ-PRD-010, passwords SHALL meet:

| Requirement | Value |
|-------------|-------|
| Minimum length | 8 characters |
| Uppercase letters | At least 1 |
| Lowercase letters | At least 1 |
| Numeric digits | At least 1 |
| Special characters | SHOULD include (not mandatory for MVP) |
| Maximum length | 128 characters |
| Common password check | SHALL reject top 1000 common passwords |

### 8.2 Account Lockout (RULE-SEC-001)

| Parameter | Value | Config Key |
|-----------|-------|-----------|
| Max failed attempts | 5 | CFG-037: auth.max_failed_attempts |
| Lockout duration | 30 minutes | CFG-038: auth.lockout_duration_minutes |
| Counter reset | On successful login | — |
| Lockout scope | Per-account (not per-device) | — |

**Lockout Behavior:**
1. Each failed authentication attempt increments `failed_login_attempts` on `identity_users`.
2. When counter reaches threshold, set `locked_until = NOW() + lockout_duration`.
3. During lockout, ALL login attempts SHALL be rejected with AUTH_010 regardless of credential validity.
4. After lockout expiry, the next successful login SHALL reset the counter.
5. Admin/Super Admin MAY manually unlock accounts via `PERM-009`.

### 8.3 Suspension Handling (REQ-PRD-005)

When an account is suspended:
1. Set `identity_users.status = 'suspended'`.
2. Revoke ALL active sessions (§5.3).
3. Emit WebSocket `session.invalidated` event to all connected devices.
4. Record suspension in audit trail with actor, reason, and timestamp.
5. Suspended users SHALL receive HTTP 403 with AUTH_022 on any authenticated endpoint.

### 8.4 Future: Two-Factor Authentication

2FA is NOT implemented in MVP but the architecture SHALL support future addition:
- TOTP-based 2FA (Google Authenticator compatible).
- Recovery codes for account recovery.
- Per-role 2FA enforcement policy.

---

## 9. API Endpoints

### 9.1 Registration Endpoints

| Method | Path | Description | Auth | Rate Limit |
|--------|------|-------------|------|-----------|
| POST | /api/v1/auth/register/rider | Initiate rider registration | Public | 10/15min |
| POST | /api/v1/auth/register/rider/verify-otp | Verify rider OTP | Public | 10/15min |
| POST | /api/v1/auth/register/business | Register business account | Public | 10/15min |
| POST | /api/v1/auth/verify-email | Verify email token | Public | 10/15min |

### 9.2 Authentication Endpoints

| Method | Path | Description | Auth | Rate Limit |
|--------|------|-------------|------|-----------|
| POST | /api/v1/auth/login/phone | Request OTP for phone login | Public | 10/15min |
| POST | /api/v1/auth/login/phone/verify | Verify phone OTP login | Public | 10/15min |
| POST | /api/v1/auth/login/email | Email + password login | Public | 10/15min |
| POST | /api/v1/auth/refresh | Refresh access token | Refresh token | 30/1min |
| POST | /api/v1/auth/logout | Logout current session | Access token | 100/1min |
| POST | /api/v1/auth/logout-all | Logout all sessions | Access token | 10/15min |

### 9.3 Session Management Endpoints

| Method | Path | Description | Auth | Permission |
|--------|------|-------------|------|-----------|
| GET | /api/v1/auth/sessions | List own active sessions | Required | PERM-004 |
| DELETE | /api/v1/auth/sessions/:id | Revoke specific session | Required | PERM-005 |

### 9.4 Password Management Endpoints

| Method | Path | Description | Auth | Rate Limit |
|--------|------|-------------|------|-----------|
| POST | /api/v1/auth/password/change | Change own password | Required | 5/15min |
| POST | /api/v1/auth/password/forgot | Request password reset | Public | 5/15min |
| POST | /api/v1/auth/password/reset | Reset password with token | Public | 5/15min |

### 9.5 Staff Management Endpoints

| Method | Path | Description | Auth | Permission |
|--------|------|-------------|------|-----------|
| POST | /api/v1/auth/staff | Create staff account | Required | PERM-007 |
| PATCH | /api/v1/auth/staff/:id | Update staff account | Required | PERM-007 |
| DELETE | /api/v1/auth/staff/:id | Deactivate staff account | Required | PERM-008 |
| POST | /api/v1/auth/staff/:id/force-logout | Force logout staff | Required | PERM-009 |

### 9.6 Request/Response Examples

**POST /api/v1/auth/login/email — Request:**
```json
{
  "email": "admin@soloadvertiser.com",
  "password": "SecurePass123",
  "device_name": "Chrome on Windows",
  "device_type": "desktop"
}
```

**POST /api/v1/auth/login/email — Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "email": "admin@soloadvertiser.com",
      "role": "admin",
      "name": "Admin User"
    }
  },
  "meta": null,
  "error": null
}
```

---

## 10. Error Codes

| Code | HTTP Status | Description | Trigger |
|------|------------|-------------|---------|
| AUTH_001 | 403 | Insufficient authorization for business verification | RULE-BIZ-003 |
| AUTH_002 | 403 | Insufficient authorization for business suspension | RULE-BIZ-006 |
| AUTH_003 | 403 | Insufficient authorization for business blacklisting | RULE-BIZ-007 |
| AUTH_004 | 403 | Insufficient authorization for campaign pause | RULE-CMP-008 |
| AUTH_005 | 403 | Insufficient authorization for campaign cancellation | RULE-CMP-009 |
| AUTH_006 | 403 | Insufficient authorization for assignment creation | RULE-ASN-003 |
| AUTH_007 | 403 | Insufficient authorization for verification approval | RULE-VRF-006 |
| AUTH_008 | 403 | Insufficient authorization for document review | RULE-DOC-002 |
| AUTH_009 | 403 | Insufficient authorization for zone management | RULE-ZON-002 |
| AUTH_010 | 423 | Account locked due to excessive failed attempts | RULE-SEC-001 |
| AUTH_011 | 400 | Invalid phone number format | §2.1 |
| AUTH_012 | 409 | Phone number already registered | §2.1 |
| AUTH_013 | 401 | OTP expired or invalid | §2.1 |
| AUTH_014 | 429 | OTP rate limit exceeded | §2.1 |
| AUTH_015 | 400 | Invalid email format | §2.2 |
| AUTH_016 | 409 | Email already registered | §2.2 |
| AUTH_017 | 401 | Verification token expired or invalid | §2.2 |
| AUTH_018 | 400 | Password does not meet complexity requirements | §2.2 |
| AUTH_019 | 403 | Insufficient authority for staff creation | §2.3 |
| AUTH_020 | 400 | Invalid role for staff creation | §2.3 |
| AUTH_021 | 401 | Invalid or expired refresh token | §3.3 |
| AUTH_022 | 403 | Account suspended | §8.3 |
| AUTH_023 | 401 | Access token expired | §4.4 |
| AUTH_024 | 401 | Invalid access token signature | §4.4 |
| AUTH_025 | 403 | Insufficient permissions for requested resource | General RBAC |

---

## 11. Traceability

### 11.1 Requirements Coverage

| Requirement | Section | Implementation |
|-------------|---------|---------------|
| REQ-PRD-001 | §2.1 | Rider phone + OTP registration |
| REQ-PRD-002 | §2.2 | Business email + verification registration |
| REQ-PRD-003 | §4 | JWT access + refresh token architecture |
| REQ-PRD-004 | §6, §7 | 6-role RBAC with 89 permissions |
| REQ-PRD-005 | §8.3 | Suspension invalidates all sessions |
| REQ-PRD-006 | §10 | All auth events logged to audit trail |
| REQ-PRD-007 | §8.2 | Lockout after 5 failed attempts |
| REQ-PRD-008 | §5 | Per-device session management |
| REQ-PRD-009 | §2.3 | Staff accounts created by Super Admin only |
| REQ-PRD-010 | §8.1 | Password complexity requirements |
| REQ-PRD-209 | §4.3 | RS256 token signing |
| REQ-PRD-210 | §8.1 | bcrypt with cost >= 10 |
| REQ-PRD-211 | §9 | Rate limiting per endpoint |
| REQ-PRD-213 | §4.1 | 15-minute access token expiry |
| REQ-PRD-214 | §4.2 | 7-day refresh token expiry |

### 11.2 Rules Coverage

| Rule | Section | Permission |
|------|---------|-----------|
| RULE-SEC-001 | §8.2 | Account lockout |
| RULE-BIZ-003 | §7.3 | PERM-028 |
| RULE-BIZ-006 | §7.3 | PERM-029 |
| RULE-BIZ-007 | §7.3 | PERM-031 |
| RULE-CMP-008 | §7.4 | PERM-039 |
| RULE-CMP-009 | §7.4 | PERM-041 |
| RULE-ASN-003 | §7.5 | PERM-042 |
| RULE-VRF-006 | §7.6 | PERM-053 |
| RULE-DOC-002 | §7.2, §7.3 | PERM-015, PERM-027 |
| RULE-ZON-002 | §7.10 | PERM-087 |

### 11.3 Document Statistics

| Metric | Value |
|--------|-------|
| Total permissions defined | 89 |
| Roles defined | 6 |
| Auth error codes | 25 |
| Registration flows | 3 |
| Authentication mechanisms | 3 (Phone OTP, Email+Password, Token Refresh) |
| API endpoints | 16 |
| Token types | 2 (Access, Refresh) |

---

*End of Document 07 - Authentication and Permissions*
