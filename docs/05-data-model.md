# Document 05 - Data Model

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every table, column, constraint, and index defined in this document is the AUTHORITATIVE physical schema specification. No migration, query, or ORM entity may introduce schema elements not defined here.

---

## 1. Purpose and Scope

This document defines the complete physical database schema for the Solo Advertiser platform. It translates the 18 aggregates defined in Document 03 into PostgreSQL 16 tables, indexes, constraints, and relationships deployed on a single instance (Document 04 §7.1).

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Database engine | PostgreSQL 16 exclusively (ARCH-002) |
| Instance | Single instance on Contabo VPS 6 |
| Schema isolation | Prefix-based module isolation per Document 04 §7.1 |
| Scale target | 15,000 riders, 1,500 businesses, ~500 concurrent campaigns |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Table identifiers use prefix TBL-NNN.
- Index identifiers use prefix IDX-NNN.
- All tables use UUID v4 primary keys.
- Timestamps are `TIMESTAMPTZ` stored in UTC.
- Monetary values are stored as `INTEGER` representing paisa (1 NPR = 100 paisa).


---

## 2. Schema Organization

All tables SHALL use a prefix-based naming convention corresponding to their owning module (Document 04 §7.1). Cross-module foreign keys SHALL NOT exist; cross-module references use UUID values without FK constraints.

| Schema Prefix | Module | Context ID | Aggregate IDs |
|---------------|--------|-----------|---------------|
| identity_ | IdentityModule | CTX-001 | AGG-001 |
| rider_ | RiderModule | CTX-002 | AGG-002 |
| business_ | BusinessModule | CTX-003 | AGG-003 |
| campaign_ | CampaignModule | CTX-004 | AGG-004 |
| assignment_ | AssignmentModule | CTX-005 | AGG-005 |
| sticker_ | StickerModule | CTX-006 | AGG-006, AGG-007 |
| finance_ | FinanceModule | CTX-007 | AGG-008, AGG-009, AGG-010, AGG-011 |
| notification_ | NotificationModule | CTX-008 | AGG-012 |
| config_ | ConfigModule | CTX-009 | AGG-013 |
| audit_ | AuditModule | CTX-010 | AGG-014 |
| timeline_ | TimelineModule | CTX-011 | AGG-015 |
| media_ | MediaModule | CTX-012 | AGG-016 |
| support_ | SupportModule | CTX-013 | AGG-017 |
| analytics_ | AnalyticsModule | CTX-014 | AGG-018 |

---

## 3. Common Patterns

### 3.1 Standard Columns

ALL tables SHALL include the following columns (REQ-PRD-151):

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |
| created_by | UUID | NOT NULL | Actor who created the record |
| updated_by | UUID | NOT NULL | Actor who last updated the record |

### 3.2 Soft Delete Pattern

Business entities (riders, businesses, campaigns, assignments, tickets) SHALL include:

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| deleted_at | TIMESTAMPTZ | NULL | Soft deletion timestamp; NULL = active (REQ-PRD-150) |

### 3.3 Immutable Record Pattern

Financial and audit tables SHALL enforce immutability via database-level rules:

- `finance_ledger_entries`: CREATE rule only; UPDATE/DELETE triggers SHALL raise exceptions (RULE-FIN-006)
- `audit_entries`: CREATE rule only; UPDATE/DELETE triggers SHALL raise exceptions (REQ-PRD-156)

### 3.4 JSONB Usage Pattern

JSONB columns SHALL be used for (REQ-PRD-149):
- Flexible metadata that varies per record
- Audit context (before/after state snapshots)
- Configuration values with complex structures
- Notification template variables

### 3.5 UUID Cross-Module References

Cross-module entity references SHALL use plain UUID columns WITHOUT foreign key constraints. Referential integrity across modules SHALL be enforced at the application layer (Document 03 §4.1 Rule 4).


---

## 4. Table Definitions by Module

### 4.1 Identity Module (CTX-001)

**TBL-001: identity_users**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | User identifier |
| email | VARCHAR(255) | UNIQUE, NULL | Email (Business/Staff accounts) |
| phone | VARCHAR(20) | UNIQUE, NULL | Phone number (Rider accounts) |
| password_hash | VARCHAR(255) | NULL | bcrypt hash (email accounts only) |
| role | VARCHAR(50) | NOT NULL | RBAC role (rider, business, operations_staff, finance_staff, admin, super_admin) |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'active' | Account status (active, suspended, locked) |
| locked_until | TIMESTAMPTZ | NULL | Account lockout expiry (RULE-SEC-001) |
| failed_login_attempts | INTEGER | NOT NULL, DEFAULT 0 | Consecutive failed attempts |
| last_login_at | TIMESTAMPTZ | NULL | Last successful login |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

CHECK: `(email IS NOT NULL OR phone IS NOT NULL)` — at least one credential required.

**TBL-002: identity_sessions**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Session identifier |
| user_id | UUID | NOT NULL, FK → identity_users(id) | Owning user |
| device_name | VARCHAR(255) | NOT NULL | Device description |
| device_type | VARCHAR(50) | NOT NULL | mobile, desktop, tablet |
| ip_address | VARCHAR(45) | NOT NULL | Connection IP |
| refresh_token_hash | VARCHAR(255) | NOT NULL | Hashed refresh token |
| expires_at | TIMESTAMPTZ | NOT NULL | Session expiry (7 days) |
| last_active_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last activity |
| is_revoked | BOOLEAN | NOT NULL, DEFAULT FALSE | Manual revocation flag |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-003: identity_credentials**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Credential record ID |
| user_id | UUID | NOT NULL, FK → identity_users(id) | Owning user |
| credential_type | VARCHAR(50) | NOT NULL | otp, password, email_verification |
| credential_value | VARCHAR(255) | NOT NULL | Hashed OTP or verification token |
| expires_at | TIMESTAMPTZ | NOT NULL | Credential expiry |
| is_used | BOOLEAN | NOT NULL, DEFAULT FALSE | Single-use flag |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |


### 4.2 Rider Module (CTX-002)

**TBL-004: rider_riders**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Rider identifier |
| user_id | UUID | NOT NULL, UNIQUE | Reference to identity_users (cross-module UUID) |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'pre_registered' | State machine status |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| phone | VARCHAR(20) | NOT NULL | |
| date_of_birth | DATE | NULL | |
| gender | VARCHAR(20) | NULL | |
| address | TEXT | NULL | Full address |
| vehicle_type | VARCHAR(50) | NULL | Motorcycle model |
| vehicle_number | VARCHAR(50) | NULL | Registration plate |
| vehicle_color | VARCHAR(50) | NULL | |
| riding_platform | VARCHAR(50) | NULL | Dictionary: RIDE_SHARING_PLATFORM |
| riding_platform_id | VARCHAR(100) | NULL | Platform-specific rider ID |
| preferred_payment_method | VARCHAR(50) | NULL | Dictionary: PAYMENT_METHOD |
| bank_name | VARCHAR(100) | NULL | |
| bank_account_number | VARCHAR(50) | NULL | |
| bank_account_name | VARCHAR(100) | NULL | |
| esewa_id | VARCHAR(50) | NULL | |
| khalti_id | VARCHAR(50) | NULL | |
| ime_pay_number | VARCHAR(20) | NULL | |
| profile_photo_media_id | UUID | NULL | Reference to media_assets |
| suspended_reason | TEXT | NULL | |
| suspended_at | TIMESTAMPTZ | NULL | |
| suspended_by | UUID | NULL | |
| approved_at | TIMESTAMPTZ | NULL | |
| approved_by | UUID | NULL | |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-005: rider_documents**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Document record ID |
| rider_id | UUID | NOT NULL, FK → rider_riders(id) | Owning rider |
| document_type | VARCHAR(50) | NOT NULL | Dictionary: DOCUMENT_TYPE |
| media_id | UUID | NOT NULL | Reference to media_assets (cross-module UUID) |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'uploaded' | uploaded, under_review, approved, rejected, expired, replacement_required |
| reviewed_by | UUID | NULL | Staff who reviewed |
| reviewed_at | TIMESTAMPTZ | NULL | |
| rejection_reason | TEXT | NULL | Dictionary: REJECTION_REASON |
| expires_at | TIMESTAMPTZ | NULL | Document expiry date |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-006: rider_reliability_scores**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Score record ID |
| rider_id | UUID | NOT NULL, FK → rider_riders(id) | Owning rider |
| overall_score | INTEGER | NOT NULL, CHECK (0-100) | Composite score |
| verification_score | INTEGER | NOT NULL, CHECK (0-100) | Weight: 30% |
| attendance_score | INTEGER | NOT NULL, CHECK (0-100) | Weight: 25% |
| activity_score | INTEGER | NOT NULL, CHECK (0-100) | Weight: 20% |
| completion_score | INTEGER | NOT NULL, CHECK (0-100) | Weight: 15% |
| response_score | INTEGER | NOT NULL, CHECK (0-100) | Weight: 10% |
| calculation_metadata | JSONB | NULL | Raw scoring inputs |
| calculated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-007: rider_zone_assignments**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Assignment record ID |
| rider_id | UUID | NOT NULL, FK → rider_riders(id) | Owning rider |
| zone_id | UUID | NOT NULL | Reference to zone (config module, cross-module UUID) |
| ward_ids | JSONB | NOT NULL | Array of ward UUIDs within zone |
| is_primary | BOOLEAN | NOT NULL, DEFAULT TRUE | Primary operating zone |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-008: rider_assets**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Asset record ID |
| rider_id | UUID | NOT NULL, FK → rider_riders(id) | Owning rider |
| asset_type | VARCHAR(50) | NOT NULL | Dictionary: ASSET_TYPE (helmet) |
| description | VARCHAR(255) | NULL | |
| photo_media_id | UUID | NULL | Reference to media_assets |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |


### 4.3 Business Module (CTX-003)

**TBL-009: business_businesses**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Business identifier |
| user_id | UUID | NOT NULL, UNIQUE | Reference to identity_users (cross-module UUID) |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'registered' | State machine status |
| company_name | VARCHAR(255) | NOT NULL | |
| registration_number | VARCHAR(100) | NULL | Government registration number |
| pan_vat_number | VARCHAR(50) | NULL | PAN/VAT number |
| industry | VARCHAR(100) | NULL | Business category |
| address | TEXT | NULL | |
| city | VARCHAR(100) | NULL | |
| contact_person_name | VARCHAR(200) | NOT NULL | Authorized representative |
| contact_person_email | VARCHAR(255) | NOT NULL | |
| contact_person_phone | VARCHAR(20) | NOT NULL | |
| contact_person_position | VARCHAR(100) | NULL | |
| billing_address | TEXT | NULL | |
| billing_email | VARCHAR(255) | NULL | |
| logo_media_id | UUID | NULL | Reference to media_assets |
| suspended_reason | TEXT | NULL | |
| suspended_at | TIMESTAMPTZ | NULL | |
| suspended_by | UUID | NULL | |
| blacklisted_at | TIMESTAMPTZ | NULL | |
| blacklisted_by | UUID | NULL | |
| verified_at | TIMESTAMPTZ | NULL | |
| verified_by | UUID | NULL | |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-010: business_documents**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Document record ID |
| business_id | UUID | NOT NULL, FK → business_businesses(id) | Owning business |
| document_type | VARCHAR(50) | NOT NULL | Dictionary: DOCUMENT_TYPE |
| media_id | UUID | NOT NULL | Reference to media_assets (cross-module UUID) |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'uploaded' | uploaded, under_review, approved, rejected, expired |
| reviewed_by | UUID | NULL | |
| reviewed_at | TIMESTAMPTZ | NULL | |
| rejection_reason | TEXT | NULL | |
| expires_at | TIMESTAMPTZ | NULL | |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |


### 4.4 Campaign Module (CTX-004)

**TBL-011: campaign_campaigns**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Campaign identifier |
| business_id | UUID | NOT NULL | Reference to business_businesses (cross-module UUID) |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'draft' | State machine status |
| name | VARCHAR(255) | NOT NULL | Campaign name |
| description | TEXT | NULL | |
| asset_type | VARCHAR(50) | NOT NULL, DEFAULT 'helmet' | Dictionary: ASSET_TYPE |
| target_zones | JSONB | NOT NULL | Array of zone UUIDs |
| required_riders | INTEGER | NOT NULL, CHECK (>= 100) | Minimum riders (RULE-CMP-002) |
| duration_days | INTEGER | NOT NULL, CHECK (>= 15) | Campaign days (RULE-CMP-001) |
| start_date | DATE | NULL | Planned start date |
| end_date | DATE | NULL | Planned end date |
| total_cost_paisa | BIGINT | NOT NULL | riders × days × rate (paisa) |
| business_daily_rate_paisa | INTEGER | NOT NULL | Rate at campaign creation time |
| creative_media_id | UUID | NULL | Reference to media_assets |
| payment_method | VARCHAR(50) | NULL | Dictionary: PAYMENT_METHOD |
| payment_proof_media_id | UUID | NULL | Reference to media_assets |
| payment_submitted_at | TIMESTAMPTZ | NULL | |
| payment_verified_at | TIMESTAMPTZ | NULL | |
| payment_verified_by | UUID | NULL | |
| cancelled_reason | TEXT | NULL | |
| cancelled_at | TIMESTAMPTZ | NULL | |
| cancelled_by | UUID | NULL | |
| paused_reason | TEXT | NULL | |
| paused_at | TIMESTAMPTZ | NULL | |
| paused_by | UUID | NULL | |
| completed_at | TIMESTAMPTZ | NULL | |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-012: campaign_fulfillment_tracking**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Tracking record ID |
| campaign_id | UUID | NOT NULL, FK → campaign_campaigns(id) | Owning campaign |
| date | DATE | NOT NULL | Campaign day |
| assigned_riders | INTEGER | NOT NULL, DEFAULT 0 | Riders assigned for this day |
| active_riders | INTEGER | NOT NULL, DEFAULT 0 | Riders actually active |
| fulfillment_percent | DECIMAL(5,2) | NOT NULL, DEFAULT 0 | active/required × 100 |
| escrow_released | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether daily escrow was released |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

UNIQUE: (campaign_id, date)


### 4.5 Assignment Module (CTX-005)

**TBL-013: assignment_assignments**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Assignment identifier |
| rider_id | UUID | NOT NULL | Reference to rider_riders (cross-module UUID) |
| campaign_id | UUID | NOT NULL | Reference to campaign_campaigns (cross-module UUID) |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'suggested' | State machine status |
| asset_type | VARCHAR(50) | NOT NULL | Dictionary: ASSET_TYPE |
| zone_id | UUID | NOT NULL | Zone at time of assignment |
| start_date | DATE | NOT NULL | Assignment start |
| end_date | DATE | NOT NULL | Assignment end |
| days_required | INTEGER | NOT NULL | Total days in assignment |
| days_completed | INTEGER | NOT NULL, DEFAULT 0 | Days fulfilled |
| assigned_at | TIMESTAMPTZ | NULL | |
| assigned_by | UUID | NULL | |
| completed_at | TIMESTAMPTZ | NULL | |
| removed_at | TIMESTAMPTZ | NULL | |
| removed_by | UUID | NULL | |
| removal_reason | TEXT | NULL | |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-014: assignment_fulfillment**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Fulfillment record ID |
| assignment_id | UUID | NOT NULL, FK → assignment_assignments(id) | Owning assignment |
| date | DATE | NOT NULL | Fulfillment day |
| is_fulfilled | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether rider was active this day |
| verification_status | VARCHAR(50) | NULL | passed, failed, pending |
| notes | TEXT | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

UNIQUE: (assignment_id, date)

**TBL-015: assignment_removal_records**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Removal record ID |
| assignment_id | UUID | NOT NULL, FK → assignment_assignments(id) | Related assignment |
| rider_id | UUID | NOT NULL | Rider removed |
| campaign_id | UUID | NOT NULL | Campaign affected |
| reason | TEXT | NOT NULL | Documented reason (RULE-ASN-005) |
| removed_by | UUID | NOT NULL | Actor |
| days_completed_at_removal | INTEGER | NOT NULL | Days completed before removal |
| replacement_required | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether replacement recruitment triggered |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |


### 4.6 Sticker Module (CTX-006)

**TBL-016: sticker_templates**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Template identifier |
| campaign_id | UUID | NOT NULL | Reference to campaign_campaigns (cross-module UUID) |
| name | VARCHAR(255) | NOT NULL | Template name |
| asset_type | VARCHAR(50) | NOT NULL | Dictionary: ASSET_TYPE |
| shape | VARCHAR(50) | NOT NULL | Dictionary: STICKER_SHAPE (circular, rectangular) |
| dimensions | JSONB | NOT NULL | { diameter_cm: 8 } or { width_cm: 10, height_cm: 6 } |
| creative_media_id | UUID | NOT NULL | Reference to media_assets |
| print_specifications | JSONB | NULL | Color profile, material, finish |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-017: sticker_vendors**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Vendor identifier |
| name | VARCHAR(255) | NOT NULL | Vendor company name |
| contact_person | VARCHAR(200) | NOT NULL | |
| phone | VARCHAR(20) | NOT NULL | |
| email | VARCHAR(255) | NULL | |
| address | TEXT | NULL | |
| performance_rating | DECIMAL(3,2) | NULL | 0.00–5.00 |
| total_orders | INTEGER | NOT NULL, DEFAULT 0 | Lifetime order count |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-018: sticker_print_orders**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Print order identifier |
| template_id | UUID | NOT NULL, FK → sticker_templates(id) | Sticker template |
| vendor_id | UUID | NOT NULL, FK → sticker_vendors(id) | Printing vendor |
| quantity | INTEGER | NOT NULL, CHECK (> 0) | Number to print |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'pending' | pending, in_production, delivered, cancelled |
| expected_delivery_date | DATE | NOT NULL | (RULE-STK-002) |
| actual_delivery_date | DATE | NULL | |
| unit_cost_paisa | INTEGER | NULL | Cost per sticker |
| total_cost_paisa | BIGINT | NULL | Total order cost |
| notes | TEXT | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-019: sticker_batches**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Batch identifier |
| print_order_id | UUID | NOT NULL, FK → sticker_print_orders(id) | Parent order |
| batch_code | VARCHAR(100) | NOT NULL, UNIQUE | Unique batch identifier (RULE-STK-005) |
| quantity_received | INTEGER | NOT NULL | Stickers in batch |
| quantity_distributed | INTEGER | NOT NULL, DEFAULT 0 | Distributed count |
| quantity_damaged | INTEGER | NOT NULL, DEFAULT 0 | Damaged count |
| quantity_returned | INTEGER | NOT NULL, DEFAULT 0 | Returned count |
| received_at | TIMESTAMPTZ | NOT NULL | |
| quality_check_passed | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| notes | TEXT | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-020: sticker_distributions**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Distribution record ID |
| batch_id | UUID | NOT NULL, FK → sticker_batches(id) | Source batch |
| assignment_id | UUID | NOT NULL | Reference to assignment_assignments (cross-module UUID) |
| rider_id | UUID | NOT NULL | Reference to rider_riders (cross-module UUID) |
| distribution_proof_media_id | UUID | NOT NULL | Photographic proof (RULE-STK-003) |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'distributed' | distributed, installed, removed, returned, damaged |
| distributed_at | TIMESTAMPTZ | NOT NULL | |
| distributed_by | UUID | NOT NULL | |
| installed_at | TIMESTAMPTZ | NULL | |
| removed_at | TIMESTAMPTZ | NULL | |
| removal_reason | TEXT | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-021: sticker_verifications**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Verification record ID |
| distribution_id | UUID | NOT NULL, FK → sticker_distributions(id) | Related distribution |
| rider_id | UUID | NOT NULL | Reference to rider_riders (cross-module UUID) |
| assignment_id | UUID | NOT NULL | Reference to assignment_assignments (cross-module UUID) |
| photo_media_id | UUID | NOT NULL | Verification photo (RULE-VRF-005) |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'pending' | pending, approved, rejected |
| reviewed_by | UUID | NULL | |
| reviewed_at | TIMESTAMPTZ | NULL | |
| rejection_reason | TEXT | NULL | |
| failure_count | INTEGER | NOT NULL, DEFAULT 0 | Cumulative failures for this assignment |
| escalation_action | VARCHAR(50) | NULL | warning, suspension, removal |
| due_date | DATE | NOT NULL | When verification was due |
| submitted_at | TIMESTAMPTZ | NULL | When rider submitted |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |


### 4.7 Finance Module (CTX-007)

**TBL-022: finance_ledger_accounts**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Account identifier |
| account_code | VARCHAR(50) | NOT NULL, UNIQUE | e.g., ACCOUNTS_RECEIVABLE, CAMPAIGN_ESCROW, PLATFORM_REVENUE, RIDER_LIABILITY, RIDER_PAYOUT |
| account_name | VARCHAR(255) | NOT NULL | Human-readable name |
| account_type | VARCHAR(50) | NOT NULL | asset, liability, revenue, expense |
| description | TEXT | NULL | |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-023: finance_ledger_entries** (IMMUTABLE — RULE-FIN-006)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Entry identifier |
| transaction_id | UUID | NOT NULL | Groups debit+credit pair |
| account_id | UUID | NOT NULL, FK → finance_ledger_accounts(id) | Ledger account |
| entry_type | VARCHAR(10) | NOT NULL, CHECK IN ('debit', 'credit') | |
| amount_paisa | BIGINT | NOT NULL, CHECK (> 0) | Amount in paisa |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'NPR' | ISO 4217 |
| reference_type | VARCHAR(50) | NOT NULL | campaign_payment, escrow_release, rider_earning, payout, commission, refund |
| reference_id | UUID | NOT NULL | ID of related entity |
| description | TEXT | NOT NULL | Human-readable description |
| metadata | JSONB | NULL | Additional context |
| posted_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Posting timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |

NOTE: No updated_at, updated_by — record is immutable. Database trigger SHALL prevent UPDATE/DELETE.

**TBL-024: finance_escrows**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Escrow identifier |
| campaign_id | UUID | NOT NULL, UNIQUE | Reference to campaign_campaigns (cross-module UUID) |
| total_amount_paisa | BIGINT | NOT NULL | Full campaign amount |
| released_amount_paisa | BIGINT | NOT NULL, DEFAULT 0 | Cumulative released |
| refunded_amount_paisa | BIGINT | NOT NULL, DEFAULT 0 | Cumulative refunded |
| remaining_amount_paisa | BIGINT | NOT NULL | Computed: total - released - refunded |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'active' | active, fully_released, refunded, partially_refunded |
| total_days | INTEGER | NOT NULL | Campaign duration |
| daily_release_amount_paisa | BIGINT | NOT NULL | total / days (RULE-FIN-005) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-025: finance_escrow_releases**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Release record ID |
| escrow_id | UUID | NOT NULL, FK → finance_escrows(id) | Parent escrow |
| campaign_day_number | INTEGER | NOT NULL | Day number (1-based) |
| release_date | DATE | NOT NULL | Date of release |
| amount_paisa | BIGINT | NOT NULL | Released amount |
| ledger_transaction_id | UUID | NOT NULL | Reference to ledger entry group |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |

UNIQUE: (escrow_id, campaign_day_number)

**TBL-026: finance_wallets**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Wallet identifier |
| rider_id | UUID | NOT NULL, UNIQUE | Reference to rider_riders (cross-module UUID) |
| balance_paisa | BIGINT | NOT NULL, DEFAULT 0, CHECK (>= 0) | Current balance |
| total_earned_paisa | BIGINT | NOT NULL, DEFAULT 0 | Lifetime earnings |
| total_withdrawn_paisa | BIGINT | NOT NULL, DEFAULT 0 | Lifetime withdrawals |
| last_payout_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-027: finance_wallet_transactions**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Transaction record ID |
| wallet_id | UUID | NOT NULL, FK → finance_wallets(id) | Owning wallet |
| type | VARCHAR(20) | NOT NULL | credit, debit |
| amount_paisa | BIGINT | NOT NULL, CHECK (> 0) | |
| balance_after_paisa | BIGINT | NOT NULL | Running balance |
| reference_type | VARCHAR(50) | NOT NULL | daily_earning, payout, adjustment |
| reference_id | UUID | NULL | Related entity ID |
| description | TEXT | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |

**TBL-028: finance_payout_batches**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Batch identifier |
| cycle_date | DATE | NOT NULL | Payout cycle date |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'generated' | generated, approved, processing, completed, partially_completed |
| total_riders | INTEGER | NOT NULL | Eligible riders in batch |
| total_amount_paisa | BIGINT | NOT NULL | Total payout amount |
| approved_by | UUID | NULL | Finance Staff who approved |
| approved_at | TIMESTAMPTZ | NULL | |
| completed_at | TIMESTAMPTZ | NULL | |
| notes | TEXT | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-029: finance_payout_items**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Payout item ID |
| batch_id | UUID | NOT NULL, FK → finance_payout_batches(id) | Parent batch |
| rider_id | UUID | NOT NULL | Reference to rider_riders (cross-module UUID) |
| wallet_id | UUID | NOT NULL, FK → finance_wallets(id) | Rider wallet |
| amount_paisa | BIGINT | NOT NULL, CHECK (>= 50000) | Amount (min NPR 500 = 50000 paisa) (RULE-PAY-002) |
| payment_method | VARCHAR(50) | NOT NULL | Dictionary: PAYMENT_METHOD |
| payment_account_details | JSONB | NOT NULL | Account info for payout |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'pending' | pending, processing, completed, failed |
| proof_media_id | UUID | NULL | Transfer proof (RULE-PAY-005) |
| failure_reason | TEXT | NULL | |
| processed_at | TIMESTAMPTZ | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |


### 4.8 Notification Module (CTX-008)

**TBL-030: notification_templates**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Template identifier |
| code | VARCHAR(100) | NOT NULL, UNIQUE | Template code (e.g., ASSIGNMENT_CREATED) |
| title_template | VARCHAR(500) | NOT NULL | Title with {{variables}} |
| body_template | TEXT | NOT NULL | Body with {{variables}} |
| channels | JSONB | NOT NULL | ["push", "in_app"] |
| variables | JSONB | NOT NULL | Expected variable definitions |
| category | VARCHAR(50) | NOT NULL | assignment, campaign, verification, payout, system |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| version | INTEGER | NOT NULL, DEFAULT 1 | Template version |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-031: notification_notifications**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Notification identifier |
| user_id | UUID | NOT NULL | Reference to identity_users (cross-module UUID) |
| template_id | UUID | NOT NULL, FK → notification_templates(id) | Source template |
| title | VARCHAR(500) | NOT NULL | Rendered title |
| body | TEXT | NOT NULL | Rendered body |
| category | VARCHAR(50) | NOT NULL | |
| data | JSONB | NULL | Action payload (deep link info) |
| is_read | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| read_at | TIMESTAMPTZ | NULL | |
| reference_type | VARCHAR(50) | NULL | Entity type that triggered notification |
| reference_id | UUID | NULL | Entity ID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-032: notification_delivery_attempts**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Attempt record ID |
| notification_id | UUID | NOT NULL, FK → notification_notifications(id) | Parent notification |
| channel | VARCHAR(50) | NOT NULL | push, in_app |
| status | VARCHAR(50) | NOT NULL | pending, delivered, failed |
| delivered_at | TIMESTAMPTZ | NULL | |
| failure_reason | TEXT | NULL | |
| attempt_number | INTEGER | NOT NULL, DEFAULT 1 | |
| provider_response | JSONB | NULL | External provider response |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-033: notification_user_preferences**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Preference record ID |
| user_id | UUID | NOT NULL, UNIQUE | Reference to identity_users (cross-module UUID) |
| push_enabled | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| in_app_enabled | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| category_preferences | JSONB | NOT NULL, DEFAULT '{}' | Per-category overrides |
| quiet_hours_start | TIME | NULL | |
| quiet_hours_end | TIME | NULL | |
| fcm_token | VARCHAR(500) | NULL | Firebase Cloud Messaging token |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |


### 4.9 Configuration Module (CTX-009)

**TBL-034: config_entries**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Entry identifier |
| key | VARCHAR(255) | NOT NULL, UNIQUE | Dot-notation key (e.g., platform.commission_percent) |
| value | JSONB | NOT NULL | Configuration value (typed) |
| data_type | VARCHAR(50) | NOT NULL | string, integer, decimal, boolean, json, array |
| category | VARCHAR(100) | NOT NULL | Grouping category |
| description | TEXT | NULL | Human-readable description |
| validation_rules | JSONB | NULL | Validation schema |
| is_sensitive | BOOLEAN | NOT NULL, DEFAULT FALSE | Mask in UI |
| is_readonly | BOOLEAN | NOT NULL, DEFAULT FALSE | Prevent modification |
| affected_modules | JSONB | NOT NULL, DEFAULT '[]' | Module list |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-035: config_feature_flags**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Flag identifier |
| key | VARCHAR(255) | NOT NULL, UNIQUE | Flag key (e.g., sticker.circular_enabled) |
| enabled | BOOLEAN | NOT NULL, DEFAULT FALSE | Current state |
| description | TEXT | NULL | |
| affected_modules | JSONB | NOT NULL, DEFAULT '[]' | |
| rollout_percentage | INTEGER | NULL, CHECK (0-100) | Gradual rollout support |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-036: config_dictionary_items**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Item identifier |
| dictionary_code | VARCHAR(100) | NOT NULL | Parent dictionary code |
| item_key | VARCHAR(100) | NOT NULL | Item identifier within dictionary |
| label_en | VARCHAR(255) | NOT NULL | English display label |
| label_ne | VARCHAR(255) | NULL | Nepali display label |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Display ordering |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| metadata | JSONB | NULL | Additional item properties |
| region_applicability | JSONB | NULL | Region restrictions |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

UNIQUE: (dictionary_code, item_key)

**TBL-037: config_change_history**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Change record ID |
| entity_type | VARCHAR(50) | NOT NULL | config_entry, feature_flag, dictionary_item |
| entity_id | UUID | NOT NULL | ID of changed entity |
| change_type | VARCHAR(50) | NOT NULL | created, updated, deleted |
| old_value | JSONB | NULL | Previous value |
| new_value | JSONB | NOT NULL | New value |
| changed_by | UUID | NOT NULL | Actor |
| change_reason | TEXT | NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### 4.10 Audit Module (CTX-010)

**TBL-038: audit_entries** (IMMUTABLE — REQ-PRD-156)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Entry identifier |
| actor_id | UUID | NOT NULL | Who performed the action |
| actor_role | VARCHAR(50) | NOT NULL | Role at time of action |
| action | VARCHAR(100) | NOT NULL | What was done |
| entity_type | VARCHAR(100) | NOT NULL | Target entity type |
| entity_id | UUID | NOT NULL | Target entity ID |
| before_state | JSONB | NULL | State before change |
| after_state | JSONB | NULL | State after change |
| reason | TEXT | NULL | Justification |
| ip_address | VARCHAR(45) | NOT NULL | Source IP |
| device_info | VARCHAR(500) | NULL | User agent / device |
| correlation_id | UUID | NOT NULL | Request correlation |
| module | VARCHAR(50) | NOT NULL | Source module |
| occurred_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Event timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |

NOTE: No updated_at, updated_by, deleted_at. Database trigger SHALL prevent UPDATE/DELETE. Retention: minimum 3 years (REQ-PRD-226).


### 4.11 Timeline Module (CTX-011)

**TBL-039: timeline_entries**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Entry identifier |
| entity_type | VARCHAR(100) | NOT NULL | rider, business, campaign, assignment |
| entity_id | UUID | NOT NULL | Tracked entity ID |
| event_type | VARCHAR(100) | NOT NULL | Domain event type |
| title | VARCHAR(500) | NOT NULL | Human-readable title |
| description | TEXT | NULL | Detailed description |
| actor_id | UUID | NULL | Who caused the event |
| actor_role | VARCHAR(50) | NULL | |
| metadata | JSONB | NULL | Event-specific data |
| related_entities | JSONB | NULL | Array of { type, id } |
| occurred_at | TIMESTAMPTZ | NOT NULL | Event timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

### 4.12 Media Module (CTX-012)

**TBL-040: media_assets**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Asset identifier |
| uploader_id | UUID | NOT NULL | Reference to identity_users (cross-module UUID) |
| bucket | VARCHAR(100) | NOT NULL | R2 bucket name |
| storage_key | VARCHAR(500) | NOT NULL, UNIQUE | R2 object key |
| original_filename | VARCHAR(255) | NOT NULL | Original file name |
| content_type | VARCHAR(100) | NOT NULL | MIME type |
| file_size_bytes | BIGINT | NOT NULL | |
| purpose | VARCHAR(100) | NOT NULL | rider_document, business_document, creative, verification_photo, profile_photo, payout_proof |
| owner_type | VARCHAR(50) | NULL | Entity type that owns this asset |
| owner_id | UUID | NULL | Owning entity ID |
| is_processed | BOOLEAN | NOT NULL, DEFAULT FALSE | Variants generated |
| metadata | JSONB | NULL | Image dimensions, EXIF, etc. |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-041: media_variants**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Variant identifier |
| asset_id | UUID | NOT NULL, FK → media_assets(id) | Parent asset |
| variant_type | VARCHAR(50) | NOT NULL | thumbnail, compressed, original |
| storage_key | VARCHAR(500) | NOT NULL, UNIQUE | R2 object key |
| content_type | VARCHAR(100) | NOT NULL | |
| file_size_bytes | BIGINT | NOT NULL | |
| width | INTEGER | NULL | Image width in pixels |
| height | INTEGER | NULL | Image height in pixels |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

### 4.13 Support Module (CTX-013)

**TBL-042: support_tickets**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Ticket identifier |
| user_id | UUID | NOT NULL | Reference to identity_users (cross-module UUID) |
| category | VARCHAR(50) | NOT NULL | Dictionary: TICKET_CATEGORY |
| subject | VARCHAR(500) | NOT NULL | |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'open' | open, in_progress, awaiting_response, resolved, closed |
| priority | VARCHAR(20) | NOT NULL, DEFAULT 'medium' | low, medium, high, urgent |
| assigned_to | UUID | NULL | Staff handling ticket |
| is_dispute | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| reference_type | VARCHAR(50) | NULL | Related entity type |
| reference_id | UUID | NULL | Related entity ID |
| resolved_at | TIMESTAMPTZ | NULL | |
| resolved_by | UUID | NULL | |
| resolution_notes | TEXT | NULL | |
| closed_at | TIMESTAMPTZ | NULL | |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-043: support_messages**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Message identifier |
| ticket_id | UUID | NOT NULL, FK → support_tickets(id) | Parent ticket |
| sender_id | UUID | NOT NULL | Message author |
| sender_role | VARCHAR(50) | NOT NULL | Role at time of message |
| body | TEXT | NOT NULL | Message content |
| attachments | JSONB | NULL | Array of media_asset IDs |
| is_internal | BOOLEAN | NOT NULL, DEFAULT FALSE | Internal staff note |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-044: support_sla_tracking**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | SLA record ID |
| ticket_id | UUID | NOT NULL, FK → support_tickets(id), UNIQUE | Parent ticket |
| first_response_due_at | TIMESTAMPTZ | NOT NULL | SLA deadline for first response |
| first_response_at | TIMESTAMPTZ | NULL | Actual first response |
| first_response_breached | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| resolution_due_at | TIMESTAMPTZ | NOT NULL | SLA deadline for resolution |
| resolution_at | TIMESTAMPTZ | NULL | Actual resolution |
| resolution_breached | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |


### 4.14 Analytics Module (CTX-014)

**TBL-045: analytics_metric_snapshots**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Snapshot identifier |
| metric_name | VARCHAR(100) | NOT NULL | Metric identifier |
| metric_value | DECIMAL(20,4) | NOT NULL | Computed value |
| dimensions | JSONB | NULL | Breakdown dimensions (zone, category) |
| period_type | VARCHAR(20) | NOT NULL | daily, weekly, monthly |
| period_start | DATE | NOT NULL | Period start date |
| period_end | DATE | NOT NULL | Period end date |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

UNIQUE: (metric_name, period_type, period_start, dimensions)

**TBL-046: analytics_report_definitions**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Report definition ID |
| name | VARCHAR(255) | NOT NULL | Report name |
| description | TEXT | NULL | |
| report_type | VARCHAR(50) | NOT NULL | financial, operational, campaign_performance, rider_performance |
| parameters | JSONB | NOT NULL | Configurable parameters |
| schedule | JSONB | NULL | Cron-like schedule definition |
| output_formats | JSONB | NOT NULL, DEFAULT '["csv"]' | Supported formats |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

**TBL-047: analytics_export_jobs**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Export job ID |
| report_definition_id | UUID | NOT NULL, FK → analytics_report_definitions(id) | Source report |
| requested_by | UUID | NOT NULL | User who requested export |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'pending' | pending, processing, completed, failed |
| format | VARCHAR(20) | NOT NULL | csv, pdf |
| parameters | JSONB | NOT NULL | Applied parameters |
| result_media_id | UUID | NULL | Reference to media_assets for generated file |
| started_at | TIMESTAMPTZ | NULL | |
| completed_at | TIMESTAMPTZ | NULL | |
| failure_reason | TEXT | NULL | |
| expires_at | TIMESTAMPTZ | NULL | When download link expires |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| created_by | UUID | NOT NULL | |
| updated_by | UUID | NOT NULL | |

---

## 5. Index Strategy

### 5.1 Primary Key Indexes

All tables have implicit B-tree indexes on their UUID primary keys.

### 5.2 Foreign Key Indexes

All foreign key columns SHALL have corresponding indexes for efficient join operations.

### 5.3 Application Query Indexes

| ID | Table | Index | Type | Purpose |
|----|-------|-------|------|---------|
| IDX-001 | identity_users | (email) WHERE email IS NOT NULL | Unique, Partial | Login by email |
| IDX-002 | identity_users | (phone) WHERE phone IS NOT NULL | Unique, Partial | Login by phone |
| IDX-003 | identity_users | (role, status) | B-tree | Role-based listing |
| IDX-004 | identity_sessions | (user_id, is_revoked) | B-tree | Active session lookup |
| IDX-005 | identity_sessions | (expires_at) WHERE is_revoked = FALSE | Partial | Session cleanup |
| IDX-006 | rider_riders | (status) | B-tree | Status-based filtering |
| IDX-007 | rider_riders | (user_id) | Unique | User-to-rider lookup |
| IDX-008 | rider_documents | (rider_id, document_type) | B-tree | Document retrieval |
| IDX-009 | rider_documents | (status, expires_at) | B-tree | Expiry monitoring |
| IDX-010 | rider_reliability_scores | (rider_id, calculated_at DESC) | B-tree | Latest score lookup |
| IDX-011 | rider_zone_assignments | (zone_id, rider_id) | B-tree | Zone-based rider queries |
| IDX-012 | business_businesses | (status) | B-tree | Status filtering |
| IDX-013 | business_businesses | (user_id) | Unique | User-to-business lookup |
| IDX-014 | campaign_campaigns | (business_id, status) | B-tree | Business campaign listing |
| IDX-015 | campaign_campaigns | (status, start_date) | B-tree | Active campaign queries |
| IDX-016 | campaign_fulfillment_tracking | (campaign_id, date) | Unique | Daily tracking lookup |
| IDX-017 | assignment_assignments | (rider_id, status) | B-tree | Rider assignment lookup |
| IDX-018 | assignment_assignments | (campaign_id, status) | B-tree | Campaign assignment listing |
| IDX-019 | assignment_assignments | (rider_id, asset_type, start_date, end_date) | B-tree | Conflict detection (RULE-ASN-002) |
| IDX-020 | assignment_fulfillment | (assignment_id, date) | Unique | Daily fulfillment lookup |
| IDX-021 | sticker_distributions | (assignment_id) | B-tree | Assignment sticker lookup |
| IDX-022 | sticker_verifications | (rider_id, due_date) | B-tree | Verification due queries |
| IDX-023 | sticker_verifications | (assignment_id, status) | B-tree | Assignment verification status |
| IDX-024 | finance_ledger_entries | (transaction_id) | B-tree | Transaction grouping |
| IDX-025 | finance_ledger_entries | (reference_type, reference_id) | B-tree | Entity financial history |
| IDX-026 | finance_ledger_entries | (account_id, posted_at) | B-tree | Account statement |
| IDX-027 | finance_escrow_releases | (escrow_id, release_date) | B-tree | Release tracking |
| IDX-028 | finance_wallet_transactions | (wallet_id, created_at DESC) | B-tree | Transaction history |
| IDX-029 | finance_payout_items | (rider_id, status) | B-tree | Rider payout lookup |
| IDX-030 | notification_notifications | (user_id, is_read, created_at DESC) | B-tree | Notification center |
| IDX-031 | audit_entries | (entity_type, entity_id, occurred_at DESC) | B-tree | Entity audit trail |
| IDX-032 | audit_entries | (actor_id, occurred_at DESC) | B-tree | Actor activity |
| IDX-033 | audit_entries | (occurred_at DESC) | B-tree | Time-range queries |
| IDX-034 | timeline_entries | (entity_type, entity_id, occurred_at DESC) | B-tree | Entity timeline |
| IDX-035 | support_tickets | (user_id, status) | B-tree | User ticket listing |
| IDX-036 | support_tickets | (assigned_to, status) | B-tree | Staff queue |
| IDX-037 | analytics_metric_snapshots | (metric_name, period_type, period_start) | B-tree | Metric queries |
| IDX-038 | config_dictionary_items | (dictionary_code, is_active, sort_order) | B-tree | Dictionary lookup |


---

## 6. Database Constraints

### 6.1 Immutability Constraints

The following tables SHALL have database-level rules preventing UPDATE and DELETE operations:

**finance_ledger_entries (RULE-FIN-006):**
```sql
CREATE RULE prevent_update AS ON UPDATE TO finance_ledger_entries DO INSTEAD NOTHING;
CREATE RULE prevent_delete AS ON DELETE TO finance_ledger_entries DO INSTEAD NOTHING;
```

**audit_entries (REQ-PRD-156):**
```sql
CREATE RULE prevent_update AS ON UPDATE TO audit_entries DO INSTEAD NOTHING;
CREATE RULE prevent_delete AS ON DELETE TO audit_entries DO INSTEAD NOTHING;
```

### 6.2 Check Constraints

| Table | Constraint | Expression |
|-------|-----------|------------|
| rider_reliability_scores | valid_overall_score | overall_score BETWEEN 0 AND 100 |
| rider_reliability_scores | valid_component_scores | Each component BETWEEN 0 AND 100 |
| campaign_campaigns | valid_duration | duration_days >= 15 |
| campaign_campaigns | valid_riders | required_riders >= 100 |
| campaign_campaigns | valid_cost | total_cost_paisa > 0 |
| finance_ledger_entries | valid_amount | amount_paisa > 0 |
| finance_ledger_entries | valid_entry_type | entry_type IN ('debit', 'credit') |
| finance_wallets | non_negative_balance | balance_paisa >= 0 |
| finance_payout_items | minimum_payout | amount_paisa >= 50000 |
| sticker_print_orders | valid_quantity | quantity > 0 |
| config_feature_flags | valid_rollout | rollout_percentage BETWEEN 0 AND 100 OR NULL |

### 6.3 Referential Integrity

Within-module foreign keys SHALL be enforced with `ON DELETE RESTRICT` (prevent orphans) and `ON UPDATE CASCADE` (propagate PK changes, though UUIDs should not change).

Cross-module references (plain UUID columns) SHALL NOT have foreign key constraints. Application-layer validation SHALL enforce referential integrity across module boundaries.

### 6.4 Soft Delete Enforcement

Queries against tables with `deleted_at` columns SHALL include `WHERE deleted_at IS NULL` by default. The ORM/repository layer SHALL enforce this via global query scopes or default filters.

---

## 7. Migration Strategy

### 7.1 Migration Tooling

Database migrations SHALL be managed via TypeORM migrations or Prisma Migrate (per Document 04 §3 technology choice).

### 7.2 Migration Rules

1. Migrations SHALL be sequential and timestamped.
2. Every migration SHALL include both UP and DOWN operations.
3. Destructive migrations (DROP TABLE, DROP COLUMN) SHALL require explicit approval.
4. Data migrations SHALL be separate from schema migrations.
5. Migrations SHALL be idempotent — running the same migration twice SHALL NOT produce errors.
6. Production migrations SHALL be tested against a copy of production data before deployment.

### 7.3 Seed Data

The following SHALL be seeded on initial deployment:

| Table | Seed Data |
|-------|-----------|
| finance_ledger_accounts | 5 standard accounts (RULE-FIN-007) |
| config_entries | All platform configuration keys (Document 06) |
| config_feature_flags | All feature flags with defaults |
| config_dictionary_items | All dictionary entries (Document 06) |
| identity_users | Initial Super Admin account |
| notification_templates | All notification templates |

### 7.4 Backup Compatibility

Migrations SHALL maintain backward compatibility with the daily backup schedule (Document 04 §13.5). Schema changes SHALL NOT corrupt existing backup restore procedures.

---

## 8. Traceability

### 8.1 Tables to Aggregates

| Table ID | Table | Aggregate ID | Aggregate |
|----------|-------|-------------|-----------|
| TBL-001 | identity_users | AGG-001 | User |
| TBL-002 | identity_sessions | AGG-001 | User (Session entity) |
| TBL-003 | identity_credentials | AGG-001 | User (UserCredential entity) |
| TBL-004 | rider_riders | AGG-002 | Rider |
| TBL-005 | rider_documents | AGG-002 | Rider (RiderDocument entity) |
| TBL-006 | rider_reliability_scores | AGG-002 | Rider (ReliabilityScore VO) |
| TBL-007 | rider_zone_assignments | AGG-002 | Rider (ZoneAssignment VO) |
| TBL-008 | rider_assets | AGG-002 | Rider (asset tracking) |
| TBL-009 | business_businesses | AGG-003 | Business |
| TBL-010 | business_documents | AGG-003 | Business (BusinessDocument entity) |
| TBL-011 | campaign_campaigns | AGG-004 | Campaign |
| TBL-012 | campaign_fulfillment_tracking | AGG-004 | Campaign (FulfillmentStatus VO) |
| TBL-013 | assignment_assignments | AGG-005 | Assignment |
| TBL-014 | assignment_fulfillment | AGG-005 | Assignment (AssignmentFulfillment entity) |
| TBL-015 | assignment_removal_records | AGG-005 | Assignment (RemovalRecord VO) |
| TBL-016 | sticker_templates | AGG-006 | StickerTemplate |
| TBL-017 | sticker_vendors | AGG-006 | StickerTemplate (vendor tracking) |
| TBL-018 | sticker_print_orders | AGG-006 | StickerTemplate (PrintOrder entity) |
| TBL-019 | sticker_batches | AGG-006 | StickerTemplate (StickerBatch entity) |
| TBL-020 | sticker_distributions | AGG-007 | StickerDistribution |
| TBL-021 | sticker_verifications | AGG-007 | StickerDistribution (VerificationRecord entity) |
| TBL-022 | finance_ledger_accounts | AGG-008 | Ledger (LedgerAccount VO) |
| TBL-023 | finance_ledger_entries | AGG-008 | Ledger (LedgerEntry entity) |
| TBL-024 | finance_escrows | AGG-009 | CampaignEscrow |
| TBL-025 | finance_escrow_releases | AGG-009 | CampaignEscrow (EscrowRelease entity) |
| TBL-026 | finance_wallets | AGG-010 | RiderWallet |
| TBL-027 | finance_wallet_transactions | AGG-010 | RiderWallet (WalletTransaction entity) |
| TBL-028 | finance_payout_batches | AGG-011 | PayoutBatch |
| TBL-029 | finance_payout_items | AGG-011 | PayoutBatch (PayoutItem entity) |
| TBL-030 | notification_templates | AGG-012 | Notification (NotificationTemplate entity) |
| TBL-031 | notification_notifications | AGG-012 | Notification |
| TBL-032 | notification_delivery_attempts | AGG-012 | Notification (DeliveryAttempt entity) |
| TBL-033 | notification_user_preferences | AGG-012 | Notification (UserPreference VO) |
| TBL-034 | config_entries | AGG-013 | PlatformConfiguration (ConfigEntry entity) |
| TBL-035 | config_feature_flags | AGG-013 | PlatformConfiguration (FeatureFlag entity) |
| TBL-036 | config_dictionary_items | AGG-013 | PlatformConfiguration (DictionaryItem entity) |
| TBL-037 | config_change_history | AGG-013 | PlatformConfiguration (ConfigChangeRecord VO) |
| TBL-038 | audit_entries | AGG-014 | AuditLog (AuditEntry entity) |
| TBL-039 | timeline_entries | AGG-015 | EntityTimeline (TimelineEntry entity) |
| TBL-040 | media_assets | AGG-016 | MediaAsset |
| TBL-041 | media_variants | AGG-016 | MediaAsset (ImageVariant entity) |
| TBL-042 | support_tickets | AGG-017 | SupportTicket |
| TBL-043 | support_messages | AGG-017 | SupportTicket (TicketMessage entity) |
| TBL-044 | support_sla_tracking | AGG-017 | SupportTicket (SLATracker VO) |
| TBL-045 | analytics_metric_snapshots | AGG-018 | MetricsAggregation (MetricSnapshot entity) |
| TBL-046 | analytics_report_definitions | AGG-018 | MetricsAggregation (ReportDefinition entity) |
| TBL-047 | analytics_export_jobs | AGG-018 | MetricsAggregation (ExportJob entity) |

### 8.2 Tables to Requirements

| Requirement | Tables |
|-------------|--------|
| REQ-PRD-148 (PostgreSQL) | All 47 tables |
| REQ-PRD-149 (JSONB) | TBL-007, TBL-011, TBL-023, TBL-034, TBL-036, TBL-038, TBL-039, TBL-045 |
| REQ-PRD-150 (Soft delete) | TBL-004, TBL-005, TBL-009, TBL-010, TBL-011, TBL-013, TBL-017, TBL-040, TBL-042 |
| REQ-PRD-151 (Audit fields) | All 47 tables |
| REQ-PRD-155 (Ledger append-only) | TBL-023 |
| REQ-PRD-156 (Audit immutable) | TBL-038 |
| REQ-PRD-157 (Referential integrity) | All within-module FKs |
| RULE-FIN-004 (Double-entry) | TBL-023 (transaction_id groups balanced pairs) |
| RULE-FIN-006 (Immutability) | TBL-023 (UPDATE/DELETE rules) |
| RULE-PAY-002 (Min payout) | TBL-029 (CHECK >= 50000 paisa) |

### 8.3 Document Statistics

| Metric | Value |
|--------|-------|
| Total tables | 47 |
| Total indexes | 38 (+ PK indexes) |
| Immutable tables | 2 (finance_ledger_entries, audit_entries) |
| Soft-deletable tables | 9 |
| JSONB columns | 34 |
| Cross-module UUID references | 28 |
| Within-module foreign keys | 22 |
| Check constraints | 11 |

---

*End of Document 05 - Data Model*
