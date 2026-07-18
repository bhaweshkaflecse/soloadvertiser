# Document 13 - Financial Platform Specification

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every financial transaction, ledger operation, balance calculation, escrow flow, and payout mechanism defined in this document is the AUTHORITATIVE specification for all monetary operations. No implementation may introduce financial logic not sanctioned here.

---

## 1. Purpose and Scope

This document defines the complete specification for the Financial Platform (CTX-007) — the ledger-based accounting system governing all money flows within the Solo Advertiser platform. It covers campaign billing, escrow management, rider wallets, payout processing, invoice generation, and reconciliation.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Currency | NPR (Nepalese Rupee) exclusively |
| Storage unit | Paisa (1 NPR = 100 paisa) as INTEGER |
| Payment processing | Manual verification only (no gateway SDK) |
| Accounting model | Double-entry ledger |
| Payout model | Batch processing with manual disbursement |
| Reconciliation | Automated daily + manual monthly |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Financial operation identifiers use prefix FOP-NNN.
- All monetary values are stored as INTEGER (paisa).
- Timestamps are TIMESTAMPTZ in UTC.

### 1.3 Upstream References

| Document | Relevant Sections |
|----------|-------------------|
| Document 01 | REQ-PRD-071 through REQ-PRD-085 |
| Document 02 | RULE-FIN-001 through RULE-FIN-007, RULE-PAY-001 through RULE-PAY-007 |
| Document 03 | AGG-008 (Ledger), AGG-009 (Wallet), AGG-010 (Invoice), AGG-011 (Payout) |
| Document 04 | CTX-007 (FinanceModule) |
| Document 05 | finance_* schema tables |

---

## 2. Financial Architecture Overview

### 2.1 Money Flow Pipeline

All monetary operations follow a single directional pipeline:

```
Business Payment → Accounts Receivable → Campaign Escrow → Daily Release
                                                              ├── Platform Revenue (NPR 20/rider/day)
                                                              └── Rider Liability → Rider Wallet → Rider Payout
```

### 2.2 Account Structure

The financial platform SHALL maintain exactly five ledger account types:

| Account ID | Account Name | Type | Purpose |
|-----------|--------------|------|---------|
| ACCT-001 | Accounts Receivable | Asset | Tracks business payments received |
| ACCT-002 | Campaign Escrow | Liability | Holds prepaid campaign funds until daily release |
| ACCT-003 | Platform Revenue | Revenue | Accumulates platform commission (NPR 20/rider/day) |
| ACCT-004 | Rider Liability | Liability | Owed to riders but not yet in wallet |
| ACCT-005 | Rider Wallet | Liability | Available rider balance pending payout |

### 2.3 Financial Invariants

1. Total debits SHALL ALWAYS equal total credits across all ledger entries.
2. Escrow balance SHALL ALWAYS equal the sum of unreleased campaign funds.
3. Rider wallet balance SHALL ALWAYS equal SUM(credits) - SUM(debits) for that wallet.
4. No financial balance SHALL be stored as a column — ALL balances are derived at query time.
5. No ledger entry SHALL be modified or deleted after creation.

---

## 3. Ledger System

### 3.1 Double-Entry Accounting Principles

The platform SHALL implement double-entry accounting per RULE-FIN-004:

- Every financial operation SHALL produce at least one debit entry and one credit entry.
- The sum of debit amounts SHALL equal the sum of credit amounts for each transaction.
- Errors SHALL be corrected via compensating entries, never by modification.
- Ledger entries are IMMUTABLE (RULE-FIN-006).

### 3.2 Ledger Entry Structure

Each ledger entry SHALL contain:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Unique entry identifier | Yes |
| transaction_id | UUID | Groups related debit/credit entries | Yes |
| account_type | ENUM | One of: ACCOUNTS_RECEIVABLE, CAMPAIGN_ESCROW, PLATFORM_REVENUE, RIDER_LIABILITY, RIDER_WALLET | Yes |
| entry_type | ENUM | DEBIT or CREDIT | Yes |
| amount | INTEGER | Amount in paisa (always positive) | Yes |
| reference_type | VARCHAR | Entity type (campaign, assignment, payout) | Yes |
| reference_id | UUID | ID of related entity | Yes |
| description | VARCHAR | Human-readable description | Yes |
| metadata | JSONB | Additional context (rider_id, campaign_id, day_number) | No |
| created_at | TIMESTAMPTZ | Immutable creation timestamp | Yes |
| created_by | UUID | Actor who initiated the operation | Yes |

### 3.3 Ledger Account Types

| Account Type | Normal Balance | Increases With | Decreases With |
|-------------|---------------|----------------|----------------|
| ACCOUNTS_RECEIVABLE | Debit | Debit | Credit |
| CAMPAIGN_ESCROW | Credit | Credit | Debit |
| PLATFORM_REVENUE | Credit | Credit | Debit (refund only) |
| RIDER_LIABILITY | Credit | Credit | Debit |
| RIDER_WALLET | Credit | Credit | Debit |

### 3.4 Balance Derivation Rules

Balances SHALL NEVER be stored directly. They SHALL be computed:

```sql
-- Campaign escrow balance
SELECT SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) -
       SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END)
FROM finance_ledger_entries
WHERE account_type = 'CAMPAIGN_ESCROW'
  AND reference_id = :campaign_id;

-- Rider wallet balance
SELECT SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) -
       SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END)
FROM finance_ledger_entries
WHERE account_type = 'RIDER_WALLET'
  AND metadata->>'rider_id' = :rider_id;
```

### 3.5 Reconciliation Invariant

At any point in time, the following SHALL hold true:

```
SUM(all_debits) = SUM(all_credits)
```

A violation of this invariant SHALL trigger an immediate CRITICAL alert (EVT-039).

---

## 4. Campaign Escrow

### 4.1 Escrow Creation (FOP-001)

**Trigger:** Finance Staff verifies campaign payment (RULE-CMP-006)

**Ledger Entries:**

| Entry | Account | Type | Amount |
|-------|---------|------|--------|
| 1 | ACCOUNTS_RECEIVABLE | DEBIT | total_campaign_cost |
| 2 | CAMPAIGN_ESCROW | CREDIT | total_campaign_cost |

**Preconditions:**
- Payment proof verified by Finance Staff (RULE-PAY-007)
- Amount matches campaign total_cost exactly
- Campaign in Payment Submitted state

**Postconditions:**
- Escrow account reflects full campaign cost
- Campaign transitions to Payment Verified → Recruiting Riders
- EVT-034 (EscrowCreated) emitted
- Invoice generated (§8)

### 4.2 Daily Escrow Release (FOP-002)

**Trigger:** Daily cron job for each Running campaign (RULE-FIN-005)

**Calculation:**

```
daily_release = total_escrow / total_campaign_days
rider_share = riders_active_today × rider_daily_rate (NPR 100)
platform_share = riders_active_today × platform_commission (NPR 20)
```

**Ledger Entries (per campaign per day):**

| Entry | Account | Type | Amount |
|-------|---------|------|--------|
| 1 | CAMPAIGN_ESCROW | DEBIT | daily_release |
| 2 | PLATFORM_REVENUE | CREDIT | platform_share |
| 3 | RIDER_LIABILITY | CREDIT | rider_share |

**Note:** If riders_active_today < total_riders (due to removals), the difference SHALL remain in escrow until campaign completion settlement.

### 4.3 Rider Earning Credit (FOP-003)

**Trigger:** Daily escrow release completes

**Ledger Entries (per active rider per day):**

| Entry | Account | Type | Amount |
|-------|---------|------|--------|
| 1 | RIDER_LIABILITY | DEBIT | rider_daily_rate (10000 paisa) |
| 2 | RIDER_WALLET | CREDIT | rider_daily_rate (10000 paisa) |

### 4.4 Escrow Partial Refund on Cancellation (FOP-004)

**Trigger:** Campaign cancelled with remaining escrow (RULE-CMP-007)

**Calculation:**

```
remaining_escrow = total_escrow - (completed_days × daily_release)
refund_amount = remaining_escrow
```

**Ledger Entries:**

| Entry | Account | Type | Amount |
|-------|---------|------|--------|
| 1 | CAMPAIGN_ESCROW | DEBIT | refund_amount |
| 2 | ACCOUNTS_RECEIVABLE | CREDIT | refund_amount |

**Postconditions:**
- Escrow balance for campaign reaches zero
- Refund record created for manual processing
- EVT-036 (EscrowRefundInitiated) emitted

### 4.5 Escrow Closure on Completion (FOP-005)

**Trigger:** Campaign reaches end date and completes

**Process:**
1. Final daily release processed
2. Any residual escrow (from rider removals) settled:
   - Proportional return to business for unfilled rider-days
   - Platform retains commission on served days only
3. Escrow balance SHALL reach exactly zero
4. EVT-035 (EscrowClosed) emitted

---

## 5. Rider Wallet

### 5.1 Wallet Creation

A rider wallet SHALL be created automatically upon rider status transitioning to Approved (Available). Each rider SHALL have exactly one wallet.

**Wallet Properties:**
- wallet_id: UUID
- rider_id: UUID (1:1 relationship)
- created_at: TIMESTAMPTZ
- status: ACTIVE | FROZEN | CLOSED

### 5.2 Credit Operations

Credits to a rider wallet SHALL occur exclusively via:

| Operation | Source | Amount | Frequency |
|-----------|--------|--------|-----------|
| Daily campaign earning | FOP-003 | NPR 100 per active day | Daily (automated) |
| Manual adjustment | Admin correction | Variable | Exceptional (requires Super Admin) |

### 5.3 Debit Operations

Debits from a rider wallet SHALL occur exclusively via:

| Operation | Destination | Amount | Frequency |
|-----------|-------------|--------|-----------|
| Payout disbursement | FOP-006 | Payout batch amount | Every 15 days |
| Manual adjustment | Admin correction | Variable | Exceptional (requires Super Admin) |

### 5.4 Balance Calculation

```
wallet_balance = SUM(credits to RIDER_WALLET for rider) - SUM(debits from RIDER_WALLET for rider)
```

The balance SHALL NEVER be stored as a column. It SHALL be computed on every query.

### 5.5 Minimum Balance for Payout

A rider SHALL be eligible for payout only when:

```
wallet_balance >= payout.minimum_amount (default: NPR 500 = 50000 paisa)
```

Per RULE-PAY-002.

### 5.6 Wallet Freezing

A wallet SHALL be frozen when:
- Rider is suspended (no credits accumulate, no debits processed)
- Fraud investigation in progress
- Rider account deactivated

Frozen wallet balances SHALL be preserved and unfrozen upon resolution.

---

## 6. Payout Processing

### 6.1 Payout Cycle

Payouts SHALL be processed every 15 days (configurable via payout.cycle_days, per RULE-PAY-001).

**Cycle Schedule:**
- Day 1: Batch generation (automated)
- Day 1-2: Finance Staff review
- Day 2-3: Batch approval
- Day 3-5: Manual disbursement + proof upload
- Day 5-7: Individual payout completion marking

### 6.2 Batch Generation

On payout cycle day, the system SHALL automatically generate a payout batch:

**Eligibility Criteria:**
- Rider wallet balance >= NPR 500 (RULE-PAY-002)
- Rider wallet status = ACTIVE
- Rider account not suspended or blacklisted
- Rider has configured payout method (RULE-PAY-003)

**Batch Properties:**

| Field | Type | Description |
|-------|------|-------------|
| batch_id | UUID | Unique batch identifier |
| batch_number | SERIAL | Sequential human-readable number |
| cycle_start_date | DATE | Start of this payout period |
| cycle_end_date | DATE | End of this payout period |
| total_riders | INTEGER | Number of eligible riders |
| total_amount | INTEGER | Sum of all payout amounts (paisa) |
| status | ENUM | GENERATED, REVIEWED, APPROVED, PROCESSING, COMPLETED, FAILED |
| generated_at | TIMESTAMPTZ | Auto-generation timestamp |
| generated_by | VARCHAR | "SYSTEM" |

### 6.3 CSV Export

The system SHALL generate a CSV export for each batch with:

| Column | Description |
|--------|-------------|
| rider_id | Rider UUID |
| rider_name | Full name |
| phone_number | Registered phone |
| payout_method | Selected method (eSewa/Khalti/Bank/IME Pay) |
| payout_account | Method-specific account identifier |
| amount_npr | Payout amount in NPR |
| wallet_balance_before | Balance before this payout |

### 6.4 Proof Upload

Finance Staff SHALL upload proof of disbursement for the batch:

| Field | Required | Validation |
|-------|----------|-----------|
| proof_media_id | Yes | Valid uploaded media (image/PDF) |
| external_reference | Yes | Transaction reference from payment provider |
| disbursement_date | Yes | Date of actual transfer |
| notes | No | Free-text notes |

Per RULE-PAY-005.

### 6.5 Batch Approval Workflow

```
GENERATED → REVIEWED (Finance Staff opens batch)
REVIEWED → APPROVED (Finance Staff confirms amounts)
APPROVED → PROCESSING (CSV downloaded, disbursement started)
PROCESSING → COMPLETED (All individual payouts marked complete)
PROCESSING → FAILED (Batch-level failure, requires investigation)
```

**Approval Authority:** Finance Staff or higher (RULE-PAY-004)

### 6.6 Individual Payout Completion (FOP-006)

For each rider in an approved batch:

**Ledger Entries:**

| Entry | Account | Type | Amount |
|-------|---------|------|--------|
| 1 | RIDER_WALLET | DEBIT | payout_amount |
| 2 | ACCOUNTS_RECEIVABLE | CREDIT | payout_amount |

**Postconditions:**
- Rider wallet balance reduced by payout amount
- Payout record marked as COMPLETED
- EVT-037 (PayoutCompleted) emitted per rider

---

## 7. Invoice Generation

### 7.1 Invoice Numbering

Invoices SHALL use sequential numbering:

```
Format: INV-{YYYY}-{NNNNNN}
Example: INV-2024-000001
```

The sequence SHALL be monotonically increasing and gap-free.

### 7.2 Invoice Trigger

An invoice SHALL be auto-generated upon:
- Payment verification by Finance Staff (campaign payment)
- Escrow creation confirmation

### 7.3 Required Fields

| Field | Source | Description |
|-------|--------|-------------|
| invoice_number | Sequential | INV-YYYY-NNNNNN |
| issue_date | System | Date of payment verification |
| due_date | N/A | Pre-paid (marked as PAID) |
| business_name | Business profile | Legal entity name |
| business_pan | Business documents | PAN/VAT number |
| business_address | Business profile | Registered address |
| platform_name | Config | "Solo Advertiser Pvt. Ltd." |
| platform_pan | Config | Platform PAN number |
| campaign_name | Campaign | Campaign reference name |
| campaign_id | Campaign | UUID reference |
| line_items | Calculated | Riders × Days × Rate breakdown |
| subtotal | Calculated | Total before tax |
| vat_amount | Calculated | VAT if applicable (future) |
| total_amount | Calculated | Final amount |
| payment_method | Payment record | Method used |
| payment_reference | Payment record | External reference |
| status | System | PAID (always pre-paid) |

### 7.4 PDF Generation

The system SHALL generate PDF invoices server-side:
- Template-based rendering (Handlebars or similar)
- Stored in Cloudflare R2
- Accessible via signed URL (24-hour expiry)
- Immutable once generated (new version = new invoice for corrections)

### 7.5 Invoice Access

| Role | Access |
|------|--------|
| Business | Own invoices only |
| Finance Staff | All invoices |
| Admin | All invoices |
| Super Admin | All invoices |

---

## 8. Reconciliation

### 8.1 Daily Automated Reconciliation

A scheduled job SHALL run daily at 02:00 UTC:

**Check 1 — Ledger Balance Verification:**
```sql
SELECT SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) as total_debits,
       SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) as total_credits
FROM finance_ledger_entries;
-- ASSERT: total_debits = total_credits
```

**Check 2 — Escrow vs. Actual Release:**
For each running campaign:
```
expected_released = completed_days × daily_release_amount
actual_released = SUM(escrow debit entries for campaign)
-- ASSERT: expected_released = actual_released
```

**Check 3 — Wallet Balance Integrity:**
For each active wallet:
```
computed_balance = SUM(credits) - SUM(debits)
-- ASSERT: computed_balance >= 0
```

### 8.2 Discrepancy Detection

If any check fails:
- Log CRITICAL discrepancy with full details
- Emit EVT-039 (ReconciliationDiscrepancy)
- Notify Finance Staff and Admin immediately
- Flag affected accounts for manual review
- DO NOT auto-correct — all corrections require manual compensating entries

### 8.3 Monthly Reconciliation Report

Finance Staff SHALL generate a monthly report containing:
- Total revenue collected (platform commission)
- Total escrow held (active campaigns)
- Total payouts disbursed
- Outstanding rider balances
- Discrepancy summary (if any)
- Month-over-month comparison

---

## 9. Manual Payment Flow (MVP)

### 9.1 Payment Submission

A Business SHALL submit payment proof containing:

| Field | Required | Validation |
|-------|----------|-----------|
| amount | Yes | SHALL equal campaign total_cost exactly |
| payment_method | Yes | One of: esewa, khalti, bank_transfer, ime_pay (RULE-PAY-006) |
| reference_id | Yes | Non-empty, alphanumeric + hyphens, max 50 chars |
| payment_date | Yes | Not in future; not older than 7 days |
| proof_media_id | Yes | Valid uploaded image (JPEG/PNG, max 10MB) |
| notes | No | Optional free-text (max 500 chars) |

### 9.2 Finance Staff Verification

Finance Staff SHALL verify against external payment system:

1. Open payment proof image
2. Confirm amount matches campaign cost
3. Verify reference_id in external system (eSewa/Khalti/Bank portal)
4. Confirm payment method matches declaration
5. Approve or reject with reason

### 9.3 Approval Flow

```
SUBMITTED → VERIFIED (Finance Staff approves)
           → REJECTED (Finance Staff rejects with reason)
REJECTED → SUBMITTED (Business re-submits with corrected proof)
```

### 9.4 Constraints

- No payment gateway SDK SHALL be integrated for MVP.
- No automated payment verification SHALL occur.
- No webhook or callback from payment providers SHALL be implemented.
- All verification is manual, human-in-the-loop per RULE-PAY-007.

---

## 10. Financial Reports

### 10.1 Revenue Summary

| Metric | Calculation | Grouping |
|--------|-------------|----------|
| Daily commission | SUM(platform_revenue credits for date) | Per day |
| Weekly commission | SUM(daily) for 7-day window | Per week |
| Monthly commission | SUM(daily) for calendar month | Per month |
| Active campaigns revenue | SUM(platform_revenue) per running campaign | Per campaign |

### 10.2 Escrow Status Report

| Field | Description |
|-------|-------------|
| Campaign ID | Campaign reference |
| Campaign name | Human-readable name |
| Total escrow | Original escrowed amount |
| Released to date | Amount released via daily releases |
| Remaining | Total - Released |
| Days remaining | Campaign days left |
| Daily rate | Per-day release amount |

### 10.3 Outstanding Payouts Report

| Field | Description |
|-------|-------------|
| Total riders eligible | Count of riders with balance >= NPR 500 |
| Total outstanding amount | Sum of eligible wallet balances |
| Next payout date | Next cycle date |
| Previous batch status | Last batch completion status |

### 10.4 Payout History

| Field | Description |
|-------|-------------|
| Batch number | Sequential identifier |
| Cycle period | Start to end date |
| Total riders paid | Count |
| Total amount disbursed | NPR |
| Completion date | When batch was fully processed |
| Proof reference | External reference from disbursement |

### 10.5 Business Billing Summary

| Field | Description |
|-------|-------------|
| Business name | Legal entity |
| Total campaigns | Count of campaigns |
| Total billed | Sum of all campaign costs |
| Total paid | Sum of verified payments |
| Active escrow | Current escrowed amount |
| Outstanding | Billed - Paid (should be 0 for pre-paid model) |

---

## 11. Error Codes

| Code | Condition | HTTP Status | Resolution |
|------|-----------|-------------|------------|
| PAYMENT_001 | Escrow creation failed | 500 | Retry; investigate if persistent |
| PAYMENT_002 | Ledger imbalance detected | 500 | CRITICAL — halt operations, manual investigation |
| PAYMENT_003 | Attempted ledger modification | 403 | Denied — ledger is immutable |
| PAYMENT_004 | Payout below minimum threshold | 400 | Rider wallet balance < NPR 500 |
| PAYMENT_005 | Invalid payout method | 400 | Method not in configured list |
| PAYMENT_006 | Missing payout proof | 400 | Proof upload required before completion |
| PAYMENT_007 | Invalid payment submission method | 400 | Method not in configured list |
| PAYMENT_008 | Payment amount mismatch | 400 | Submitted amount ≠ campaign cost |
| PAYMENT_009 | Duplicate payment reference | 409 | Reference already used for another payment |

---

## 12. Domain Events

| Event ID | Event Name | Trigger | Payload |
|----------|-----------|---------|---------|
| EVT-031 | PaymentSubmitted | Business uploads payment proof | campaign_id, amount, method, reference |
| EVT-032 | PaymentVerified | Finance Staff approves payment | campaign_id, amount, verified_by |
| EVT-033 | PaymentRejected | Finance Staff rejects payment | campaign_id, reason, rejected_by |
| EVT-034 | EscrowCreated | Payment verification completes | campaign_id, escrow_amount, transaction_id |
| EVT-035 | EscrowClosed | Campaign completes, escrow fully released | campaign_id, total_released, residual_refund |
| EVT-036 | EscrowRefundInitiated | Campaign cancelled, remaining escrow refunded | campaign_id, refund_amount, reason |
| EVT-037 | PayoutCompleted | Individual rider payout marked complete | rider_id, batch_id, amount, method |
| EVT-038 | PayoutBatchGenerated | System generates payout batch | batch_id, total_riders, total_amount, cycle_dates |
| EVT-039 | ReconciliationDiscrepancy | Daily reconciliation finds imbalance | discrepancy_type, expected, actual, affected_entities |

---

## 13. Traceability Matrix

| Specification Element | Upstream Reference | Rule Reference |
|----------------------|-------------------|----------------|
| Double-entry ledger | REQ-PRD-071 | RULE-FIN-004 |
| Escrow on payment | REQ-PRD-072, REQ-PRD-073 | RULE-CMP-006, RULE-FIN-005 |
| Rider daily earning | REQ-PRD-075 | RULE-FIN-002 |
| Platform commission | REQ-PRD-076 | RULE-FIN-003 |
| Payout cycle | REQ-PRD-077 | RULE-PAY-001 |
| Minimum payout | REQ-PRD-078 | RULE-PAY-002 |
| Payout methods | REQ-PRD-079 | RULE-PAY-003 |
| Manual payout approval | REQ-PRD-080 | RULE-PAY-004 |
| Invoice generation | REQ-PRD-081 | — |
| Business daily rate | REQ-PRD-128 | RULE-FIN-001 |
| Rider daily rate | REQ-PRD-129 | RULE-FIN-002 |
| Commission derivation | REQ-PRD-130 | RULE-FIN-003 |
| Payout proof | REQ-PRD-085 | RULE-PAY-005 |
| Payment methods | REQ-PRD-084 | RULE-PAY-006 |
| Manual verification | REQ-PRD-085 | RULE-PAY-007 |
| Ledger immutability | REQ-PRD-155 | RULE-FIN-006 |
| Account structure | REQ-PRD-071 | RULE-FIN-007 |

---

## 14. Appendix: Financial Operation Summary

| ID | Operation | Debit Account | Credit Account | Trigger |
|----|-----------|---------------|----------------|---------|
| FOP-001 | Escrow creation | ACCOUNTS_RECEIVABLE | CAMPAIGN_ESCROW | Payment verified |
| FOP-002 | Daily release | CAMPAIGN_ESCROW | PLATFORM_REVENUE + RIDER_LIABILITY | Daily cron |
| FOP-003 | Rider earning credit | RIDER_LIABILITY | RIDER_WALLET | Daily after FOP-002 |
| FOP-004 | Escrow refund | CAMPAIGN_ESCROW | ACCOUNTS_RECEIVABLE | Campaign cancelled |
| FOP-005 | Escrow closure | CAMPAIGN_ESCROW | ACCOUNTS_RECEIVABLE (residual) | Campaign completed |
| FOP-006 | Payout disbursement | RIDER_WALLET | ACCOUNTS_RECEIVABLE | Payout approved |
| FOP-007 | Manual adjustment | Variable | Variable | Super Admin action |

---

*End of Document 13*
