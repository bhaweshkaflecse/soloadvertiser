# Document 12 - Campaign and Assignment Specification

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every state transition, business operation, matching rule, fulfillment calculation, and compliance workflow defined in this document is the AUTHORITATIVE operational specification for Campaign Domain (CTX-004) and Assignment Domain (CTX-005). No service, controller, or scheduled job may implement campaign or assignment logic not specified here.

---

## 1. Purpose and Scope

This document provides the detailed operational specification for the two core business domains of Solo Advertiser: **Campaign** (CTX-004) and **Assignment** (CTX-005). It defines the complete lifecycle state machines, fulfillment pipeline, rider matching algorithm, verification compliance system, financial integration, and cancellation/refund logic.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Domains covered | CTX-004 Campaign Domain, CTX-005 Assignment Domain |
| Upstream dependencies | CTX-002 Rider, CTX-003 Business, CTX-006 Sticker, CTX-007 Finance |
| Downstream consumers | CTX-006 Sticker, CTX-007 Finance, CTX-008 Notification, CTX-010 Audit, CTX-011 Timeline |
| Scale | 500-1,500 active campaigns, 8,000-15,000 riders |
| Geography | Kathmandu Valley zones (ward-based) |
| Asset type | Helmet stickers only (MVP) |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- State identifiers use prefix ST-CMP-NNN (campaign) and ST-ASN-NNN (assignment).
- All transitions trace to Document 02 rules (RULE-CMP-*, RULE-ASN-*, RULE-VRF-*, RULE-FIN-*).
- Side effects are listed for every transition — these are MANDATORY.

---

## 2. Campaign Lifecycle

### 2.1 Campaign State Machine

```
                                    ┌──────────────────────────────────────────────────────────────┐
                                    │                                                              │
  ┌───────┐   ┌─────────────────┐  │  ┌────────────────────┐   ┌──────────────────┐              │
  │ Draft │──▶│ Pending Payment │──┼─▶│ Payment Submitted  │──▶│ Payment Verified │              │
  └───┬───┘   └────────┬────────┘  │  └─────────┬──────────┘   └────────┬─────────┘              │
      │                 │           │            │                        │                         │
      │ Cancel          │ Cancel    │            │ Reject                 ▼                         │
      ▼                 ▼           │            ▼              ┌─────────────────────┐            │
  Cancelled        Cancelled        │   Pending Payment        │ Recruiting Riders   │            │
                                    │                           └────────┬────────────┘            │
                                    │                                    │                         │
                                    │                                    │ 100% fulfilled          │
                                    │                                    ▼                         │
                                    │                           ┌────────────────┐                 │
                                    │                           │     Ready      │                 │
                                    │                           └────────┬───────┘                 │
                                    │                                    │ Start date reached      │
                                    │                                    ▼                         │
                                    │                           ┌────────────────┐                 │
                                    │           ┌───────────────│    Running     │─────────┐       │
                                    │           │               └────────┬───────┘         │       │
                                    │           │ Pause                  │ End date        │ Cancel│
                                    │           ▼                        ▼                 ▼       │
                                    │     ┌──────────┐          ┌────────────────┐   Cancelled    │
                                    │     │  Paused  │──Resume─▶│   Completed    │                │
                                    │     └────┬─────┘          └────────────────┘                │
                                    │          │ Cancel                                            │
                                    │          ▼                                                   │
                                    │     Cancelled ◀──────────────────────────────────────────────┘
                                    └─────────────────────── Cancel from Recruiting ───────────────┘
```

### 2.2 Campaign States

| ID | State | Description | Entry Condition |
|----|-------|-------------|-----------------|
| ST-CMP-001 | Draft | Initial state; campaign spec being configured | Business creates campaign (RULE-BIZ-004) |
| ST-CMP-002 | Pending Payment | Awaiting payment from business | Business confirms campaign details |
| ST-CMP-003 | Payment Submitted | Payment proof uploaded, awaiting finance verification | Business submits payment proof |
| ST-CMP-004 | Payment Verified | Payment confirmed, escrow created | Finance Staff verifies payment (RULE-PAY-007) |
| ST-CMP-005 | Recruiting Riders | Active recruitment by Operations Staff | System auto-transitions after payment verification |
| ST-CMP-006 | Ready | All riders assigned, awaiting start date | Fulfillment reaches 100% (RULE-CMP-004) |
| ST-CMP-007 | Running | Campaign actively running | Start date reached (system trigger) |
| ST-CMP-008 | Paused | Temporarily halted | Operations Staff/Admin pauses (RULE-CMP-008) |
| ST-CMP-009 | Completed | Campaign finished successfully | End date reached (system trigger) |
| ST-CMP-010 | Cancelled | Campaign terminated | Authorized actor cancels (RULE-CMP-009) |

### 2.3 Campaign State Transitions

| From | To | Trigger | Actor | Preconditions | Side Effects |
|------|----|---------|-------|---------------|-------------|
| — | Draft | Campaign creation | Business | Business in Verified/Active status (RULE-BIZ-004); Valid campaign spec | EVT-001 emitted; Timeline entry created |
| Draft | Pending Payment | Confirm details | Business | All required fields populated; Duration ≥ 15 days (RULE-CMP-001); Riders ≥ 100 (RULE-CMP-002) | Cost calculated and locked (RULE-CMP-003); Notification to business |
| Draft | Cancelled | Cancel draft | Business | — | EVT-005 emitted; No financial impact |
| Pending Payment | Payment Submitted | Submit payment proof | Business | Proof uploaded; Amount, reference, method provided | EVT-031 emitted; Notification to Finance Staff |
| Pending Payment | Cancelled | Timeout or explicit cancel | System/Operations Staff | — | EVT-005 emitted; Notification to business |
| Payment Submitted | Payment Verified | Verify payment | Finance Staff | Finance Staff confirms amount matches cost; Reference verified | EVT-032 emitted; Escrow created for full amount (RULE-CMP-006); EVT-034 emitted; Auto-transition to Recruiting Riders |
| Payment Submitted | Pending Payment | Reject payment | Finance Staff | Reason provided | EVT-033 emitted; Notification to business with reason |
| Payment Verified | Recruiting Riders | System auto-transition | System | Escrow confirmed | Notification to Operations Staff; Campaign available for assignment |
| Recruiting Riders | Ready | Fulfillment threshold reached | System | Assigned riders = required riders × threshold (RULE-CMP-004) | EVT-025 emitted; Notification to business; System schedules start-date trigger |
| Recruiting Riders | Cancelled | Cannot fill / business requests | Operations Staff+ | Documented reason | EVT-005 emitted; Escrow refund initiated (§10); All pending assignments cancelled |
| Ready | Running | Start date reached | System (cron) | Current date ≥ campaign start date | EVT-003 emitted; All assignments activated; Daily escrow release scheduled (RULE-FIN-005); Notification to business and riders |
| Running | Paused | Operational pause | Operations Staff/Admin (RULE-CMP-008) | Documented reason required | EVT-006 emitted; Daily releases suspended; Verification cycles paused; Notifications to all parties |
| Running | Completed | End date reached | System (cron) | Current date > campaign end date | EVT-004 emitted; Final escrow settlement; Assignment completion processing; Performance metrics generated |
| Running | Cancelled | Critical issue | Admin/Super Admin only (RULE-CMP-009) | Documented reason required | EVT-005 emitted; Escrow refund for remaining days (§10); All assignments terminated; Notifications |
| Paused | Running | Resume | Operations Staff/Admin | Issue resolved; documented reason | EVT-007 emitted; Daily releases resume; Verification cycles restart |
| Paused | Cancelled | Unresolvable issue | Admin/Super Admin | Documented reason | EVT-005 emitted; Escrow refund calculation (§10) |

### 2.4 Campaign Invariants

1. A Campaign SHALL exist in exactly one state at any time.
2. State transitions SHALL be atomic — partial transitions SHALL NOT persist.
3. Every state transition SHALL generate an audit entry (REQ-PRD-099).
4. Every state transition SHALL emit the corresponding domain event.
5. No state SHALL be skipped — transitions follow defined paths only.
6. Monetary values SHALL NOT change after Payment Verified state (cost is locked).
7. Campaign start date SHALL NOT be in the past at time of transition to Ready.


---

## 3. Campaign Creation Rules

### 3.1 Validation Requirements

| Field | Rule | Error Code | Reference |
|-------|------|-----------|-----------|
| Name | Required, 3-100 characters | CAMPAIGN_006 | REQ-PRD-038 |
| Target Zones | At least 1 valid zone | CAMPAIGN_007 | REQ-PRD-038 |
| Required Riders | ≥ 100 (configurable via campaign.minimum_riders) | CAMPAIGN_002 | RULE-CMP-002 |
| Start Date | ≥ 7 days from creation date | CAMPAIGN_008 | Operational requirement |
| End Date | Start date + ≥ 15 days (configurable via campaign.minimum_days) | CAMPAIGN_001 | RULE-CMP-001 |
| Duration | Computed: end_date - start_date (in days) | — | REQ-PRD-038 |
| Asset Type | Must be in configured list (MVP: "helmet" only) | CAMPAIGN_009 | RULE-STK-006 |
| Creative | Valid media ID referencing uploaded creative | CAMPAIGN_010 | REQ-PRD-038 |
| Business | Must be in Verified or Active status | BUSINESS_003 | RULE-BIZ-004 |
| Currency | NPR exclusively | CAMPAIGN_005 | RULE-CMP-010 |

### 3.2 Cost Calculation

The total campaign cost SHALL be calculated as:

```
total_cost = required_riders × duration_days × business_daily_rate
```

Where:
- `required_riders`: Number specified by business (≥ 100)
- `duration_days`: Computed from start_date and end_date (≥ 15)
- `business_daily_rate`: From configuration (default: NPR 120, per RULE-FIN-001)

**Example:** 100 riders × 15 days × NPR 120 = NPR 180,000

### 3.3 Cost Locking

- The total cost SHALL be calculated and displayed during creation (Step 3 of wizard).
- The total cost SHALL be LOCKED upon transition to Pending Payment state.
- Once locked, the cost SHALL NOT change regardless of configuration changes to business_daily_rate.
- This ensures the business commits to a fixed price.

---

## 4. Payment Integration

### 4.1 Manual Payment Flow

```
Business reviews cost → Business transfers externally → Business uploads proof
→ Finance Staff verifies → Escrow created → Campaign proceeds
```

### 4.2 Payment Submission Data

| Field | Required | Validation |
|-------|----------|-----------|
| Method | Yes | One of: esewa, khalti, bank_transfer, ime_pay (RULE-PAY-006) |
| Amount | Yes | SHALL equal campaign total_cost exactly |
| Reference ID | Yes | Non-empty string; alphanumeric + hyphens |
| Payment Date | Yes | Not future; not older than 7 days |
| Proof Media ID | Yes | Valid uploaded media (image) |

### 4.3 Payment Verification

Finance Staff SHALL verify by cross-referencing:
1. Proof image shows correct amount.
2. Reference ID is traceable in external payment system.
3. Amount matches campaign cost exactly.
4. Payment method matches what was declared.

On verification:
- Full campaign amount placed in escrow (RULE-CMP-006).
- Escrow ledger entry created with double-entry (RULE-FIN-004).
- Invoice generated for business (REQ-PRD-081).

On rejection:
- Reason provided (required).
- Campaign returns to Pending Payment for re-submission.
- Business notified with rejection reason.

### 4.4 Payment Rejection Handling

A payment MAY be rejected for:
- Amount mismatch
- Unverifiable reference ID
- Fraudulent or unclear proof image
- Method mismatch

The business SHALL be able to re-submit payment after rejection (unlimited attempts while campaign is in Pending Payment state).

---

## 5. Fulfillment Pipeline

### 5.1 Fulfillment Model

Fulfillment represents the percentage of required riders actually assigned to a campaign.

```
fulfillment_percentage = (assigned_riders / required_riders) × 100
```

### 5.2 Fulfillment Phases

| Phase | State | Description |
|-------|-------|-------------|
| Recruiting | Recruiting Riders | Operations Staff assigning riders 0-99% |
| Threshold Reached | Ready | 100% riders assigned (RULE-CMP-004) |
| Active Fulfillment | Running | Tracking daily rider-day delivery |
| Under-Fulfillment | Running | Rider removed, below capacity |

### 5.3 Recruiting Phase

1. Campaign enters Recruiting Riders state after payment verification.
2. Operations Staff uses Assignment Dashboard (PG-ADM-050) to view campaigns needing riders.
3. System provides Smart Suggestions (§6) — pre-filtered eligible riders.
4. Operations Staff selects and assigns riders.
5. Fulfillment meter updates in real-time.
6. At 100% assigned: system auto-transitions to Ready.

### 5.4 Fulfillment Tracking During Running State

During the Running state, fulfillment is tracked as rider-days:

```
daily_fulfillment = active_riders_today / required_riders × 100
campaign_fulfillment = total_rider_days_delivered / total_rider_days_required × 100
```

Where:
- `total_rider_days_required` = required_riders × duration_days
- `total_rider_days_delivered` = sum of active rider-days across all assignments

### 5.5 Under-Fulfillment Handling

When a rider is removed during a Running campaign:

1. Fulfillment drops below 100%.
2. System emits EVT-025 (AssignmentFulfilled) with updated percentage.
3. System flags campaign for replacement recruitment.
4. Operations Staff notified via queue item.
5. Replacement process initiated (§12).
6. Under-fulfillment period: escrow release continues based on actual active riders, not required.

### 5.6 Fulfillment Data Model

| Field | Type | Description |
|-------|------|-------------|
| required_riders | Integer | Contracted rider count |
| current_assigned | Integer | Currently assigned riders (all active assignment states) |
| fulfillment_pct | Decimal | current_assigned / required_riders × 100 |
| total_rider_days_required | Integer | required_riders × duration_days |
| total_rider_days_delivered | Integer | Sum of active days across all assignments |
| delivery_pct | Decimal | total_rider_days_delivered / total_rider_days_required × 100 |

---

## 6. Rider Matching

### 6.1 Eligibility Criteria

A rider SHALL be eligible for assignment to a campaign only when ALL of the following conditions are met:

| # | Criterion | Validation | Rule Reference |
|---|-----------|-----------|----------------|
| 1 | Status = Available | Rider aggregate state check | RULE-RDR-005 |
| 2 | Zone overlaps campaign target zones | Rider zone ∩ Campaign zones ≠ ∅ | RULE-ASN-001 |
| 3 | No conflicting assignment | No active assignment on same asset type with overlapping dates | RULE-ASN-002 |
| 4 | Not suspended | Rider status ≠ Suspended | RULE-RDR-004 |
| 5 | All documents valid | No expired or rejected documents | Implied by Available status |
| 6 | Campaign in Recruiting state | Campaign.status = Recruiting Riders | RULE-ASN-004 |

### 6.2 Smart Suggestion Algorithm

The system SHALL pre-filter eligible riders and sort them for Operations Staff review:

**Step 1: Filter** — Remove all riders not meeting eligibility criteria (§6.1).

**Step 2: Sort** (composite, descending priority):

| Priority | Factor | Weight | Logic |
|----------|--------|--------|-------|
| 1 | Reliability Score | Primary | Higher score = better candidate |
| 2 | Zone Precision | Secondary | Exact zone match > adjacent zone overlap |
| 3 | Completion History | Tertiary | More completed campaigns = more experienced |
| 4 | Response Time | Quaternary | Faster historical response = more reliable |

**Step 3: Present** — Display sorted list to Operations Staff for confirmation.

### 6.3 Matching Constraints

- The algorithm is RULE-BASED, not AI/ML (Document 01 §13 exclusion).
- Operations Staff SHALL make the final assignment decision — system SUGGESTS only.
- Businesses SHALL NEVER choose individual riders (they purchase capacity).
- The platform handles ALL fulfillment decisions.

### 6.4 Bulk Assignment

Operations Staff MAY assign multiple riders simultaneously:
- Select multiple riders from suggestion list.
- Single "Assign Selected" action.
- System validates each individually.
- Partial success: valid assignments proceed, invalid ones reported with reasons.
- Fulfillment meter updates after bulk processing completes.

---

## 7. Assignment Lifecycle

### 7.1 Assignment State Machine

```
┌────────────┐    ┌──────────┐    ┌─────────────────┐    ┌─────────────┐
│ Suggested  │───▶│ Assigned │───▶│ Sticker Pending │───▶│ Distributed │
└────────────┘    └──────────┘    └─────────────────┘    └──────┬──────┘
                                                                 │
                                                                 ▼
                                                          ┌─────────────┐
                                                          │  Installed  │
                                                          └──────┬──────┘
                                                                 │
                                                                 ▼
                  ┌───────────┐                           ┌─────────────┐
                  │  Removed  │◀─── (any active state) ───│   Active    │
                  └───────────┘                           └──────┬──────┘
                                                                 │
                                                                 ▼
                                                          ┌─────────────┐
                                                          │  Completed  │
                                                          └─────────────┘
```

### 7.2 Assignment States

| ID | State | Description | Entry Condition |
|----|-------|-------------|-----------------|
| ST-ASN-001 | Suggested | System suggests rider (pre-assignment) | Smart suggestion generated |
| ST-ASN-002 | Assigned | Operations Staff confirms assignment | Staff confirms suggestion or directly assigns |
| ST-ASN-003 | Sticker Pending | Awaiting sticker preparation | Auto after assignment (linked to sticker inventory) |
| ST-ASN-004 | Distributed | Sticker distributed to rider | Distribution recorded with proof (RULE-STK-003) |
| ST-ASN-005 | Installed | Sticker installed on helmet | Installation verified (photo proof) |
| ST-ASN-006 | Active | Rider actively carrying advertisement | Campaign start date reached AND sticker installed |
| ST-ASN-007 | Completed | Assignment finished successfully | Campaign end date reached |
| ST-ASN-008 | Removed | Rider removed from assignment | Authorized removal with reason |

### 7.3 Assignment State Transitions

| From | To | Trigger | Actor | Preconditions | Side Effects |
|------|----|---------|-------|---------------|-------------|
| — | Suggested | Smart suggestion | System | Rider meets all eligibility criteria (§6.1) | Displayed in Admin Panel suggestion list |
| Suggested | Assigned | Staff confirms | Operations Staff | RULE-ASN-003 authority; RULE-ASN-004 campaign state | EVT-020 emitted; Rider status → Assigned; Campaign fulfillment updated; Notification to rider |
| — | Assigned | Direct assignment | Operations Staff | All eligibility checks pass; bypasses suggestion | Same as above |
| Assigned | Sticker Pending | Auto-transition | System | Assignment confirmed | Sticker inventory checked; Print order triggered if needed |
| Sticker Pending | Distributed | Distribution recorded | Operations Staff | Distribution proof photo uploaded (RULE-STK-003) | EVT-021 emitted; EVT-047 emitted; Inventory count updated |
| Distributed | Installed | Installation confirmed | Operations Staff/System | Installation photo uploaded and verified | EVT-022 emitted; EVT-048 emitted |
| Installed | Active | Campaign starts | System | Campaign.status = Running AND sticker installed | Daily earning begins; Verification cycle starts |
| Active | Completed | Campaign ends | System | Campaign.status = Completed | EVT-023 emitted; Final earnings calculated; Score contribution calculated; Rider → Available |
| Any (Assigned–Active) | Removed | Authorized removal | Operations Staff+ | Documented reason (RULE-ASN-005) | EVT-024 emitted; Rider → Available; Campaign fulfillment decremented; Replacement flagged (RULE-ASN-006) |

### 7.4 Assignment Invariants

1. An Assignment SHALL bind exactly one rider to exactly one campaign.
2. A rider SHALL NOT have overlapping assignments on the same asset type (RULE-ASN-002).
3. Assignment creation SHALL only occur for campaigns in Recruiting Riders state (RULE-ASN-004).
4. Removal SHALL always require a documented reason (RULE-ASN-005).
5. Removal of an active assignment SHALL trigger replacement recruitment if fulfillment drops (RULE-ASN-006).
6. Score contribution SHALL be calculated upon completion (REQ-PRD-059).


---

## 8. Sticker Distribution Coordination

### 8.1 Distribution Flow

```
Assignment Created → Sticker Template identified → Inventory checked
→ If in stock: allocate from batch → Schedule distribution
→ If not in stock: Print order triggered → Await batch arrival → Allocate → Distribute
```

### 8.2 Distribution Requirements

| Requirement | Specification | Reference |
|-------------|--------------|-----------|
| Proof | Photographic evidence of physical handoff required | RULE-STK-003 |
| Batch tracking | Each distributed sticker linked to specific batch ID | RULE-STK-005 |
| Inventory update | Distribution decrements in-stock count, increments distributed count | RULE-STK-004 |
| Assignment link | Each distribution record linked to specific assignment ID | RULE-STK-001 |
| Timing | Distribution SHALL occur before campaign start date | Operational requirement |

### 8.3 Distribution Record

| Field | Type | Description |
|-------|------|-------------|
| distributionId | UUID | Unique identifier |
| assignmentId | UUID | Linked assignment |
| riderId | UUID | Receiving rider |
| batchId | UUID | Source sticker batch |
| distributedAt | Timestamp | Distribution date/time |
| distributedBy | UUID | Staff who recorded distribution |
| proofMediaId | UUID | Photo evidence reference |
| condition | Enum | new, good, acceptable |

### 8.4 Post-Distribution Verification

After distribution, the rider SHALL confirm installation:
1. Rider applies sticker to helmet.
2. Rider takes installation photo via app (SCR-RDR-012 flow).
3. Photo uploaded as installation proof.
4. Assignment transitions: Distributed → Installed.
5. Assignment is ready for Active state when campaign starts.

---

## 9. Verification Compliance

### 9.1 Verification Cycle

| Parameter | Value | Configuration Key | Reference |
|-----------|-------|-------------------|-----------|
| Interval | 7 days | verification.interval_days | RULE-VRF-001 |
| Grace period | 24 hours after due date | verification.grace_period_hours | Operational |
| Method | Photo submission via Rider App | — | RULE-VRF-005 |
| Reviewer | Operations Staff or higher | — | RULE-VRF-006 |

### 9.2 Verification Schedule

For each Active assignment:
1. First verification due: start_date + 7 days.
2. Subsequent verifications: every 7 days from last verified date.
3. Reminder notification: 2 days before due date, 1 day before, day of.
4. Grace period: 24 hours after due date before flagging as overdue.

### 9.3 Verification Submission

| Requirement | Specification |
|-------------|--------------|
| Photo source | Camera only (no gallery) — enforced by app |
| Minimum resolution | 1280×720px |
| Content | Helmet with sticker clearly visible |
| Metadata | Timestamp, GPS (if available) |
| Deadline | Within 7 days + 24hr grace period |

### 9.4 Verification Review

Operations Staff reviews submitted verification:
- **Approve:** Sticker visible, intact, correctly positioned → verification passed.
- **Reject:** Sticker not visible, damaged, removed, or photo insufficient → verification failed.

### 9.5 Escalation Logic

| Failure Count | Consequence | Action | Reference |
|---------------|-------------|--------|-----------|
| 1 | Warning | Notification sent to rider: "Verification failed. Please re-submit." Rider remains Active. | RULE-VRF-002 |
| 2 | Temporary Suspension | Rider paused from earning for this campaign. Must re-submit acceptable verification. | RULE-VRF-003 |
| 3 | Campaign Removal | Rider removed from assignment entirely. Replacement recruitment triggered. | RULE-VRF-004 |

### 9.6 Escalation State Machine

```
Pass ─────────────────── No escalation (counter resets to 0)
Fail (count=1) ─────── Warning issued (EVT-030)
Fail (count=2) ─────── Temporary suspension (earning paused)
Fail (count=3) ─────── Removal from campaign (EVT-024)
```

### 9.7 Failure Counter Rules

- The failure counter is PER ASSIGNMENT (not global per rider).
- Counter increments on each rejected verification within the same assignment.
- Counter resets to 0 on successful verification.
- Counter does NOT reset between verification cycles — only on success.

### 9.8 Grace Period Handling

| Scenario | Behavior |
|----------|----------|
| Submitted within 7 days | Normal flow — pending review |
| Submitted within grace period (7 days + 24hrs) | Accepted for review; warning logged |
| Not submitted after grace period | System auto-flags as failed (count +1); escalation applied |

### 9.9 Verification During Campaign Pause

- When a campaign is Paused, verification cycles SHALL be suspended.
- No new verification SHALL be due during pause.
- On resume: next verification due = resume_date + 7 days (resets cycle).
- Verification counters are preserved through pause/resume.

---

## 10. Campaign Cancellation and Refund

### 10.1 Cancellation Rules by State

| Campaign State | Who Can Cancel | Refund Calculation | Rider Impact |
|---------------|----------------|-------------------|--------------|
| Draft | Business | None (no payment made) | None |
| Pending Payment | Business, Operations Staff+ | None (no payment made) | None |
| Payment Submitted | Operations Staff+ | Full refund (payment not verified) | None |
| Payment Verified | Operations Staff+ | Full escrow refund | None |
| Recruiting Riders | Operations Staff+ | Full escrow refund | Assigned riders released (→ Available) |
| Ready | Admin+ | Full escrow refund | All riders released |
| Running | Admin/Super Admin only | Partial refund (§10.2) | Active riders released; earnings for completed days retained |
| Paused | Admin/Super Admin | Partial refund (§10.2) | Same as Running |
| Completed | Cannot cancel | N/A | N/A |
| Cancelled | Cannot cancel | N/A | N/A |

### 10.2 Partial Refund Calculation (Running/Paused Campaigns)

```
days_completed = (cancellation_date - start_date) in days
days_remaining = duration_days - days_completed
used_amount = days_completed × required_riders × business_daily_rate
platform_commission_on_used = days_completed × required_riders × (business_daily_rate - rider_daily_rate)
refund_amount = total_escrow - used_amount
```

**Breakdown:**
- Business receives: `refund_amount` (unused escrow)
- Riders retain: earnings for all completed days (NPR 100/rider/day × days worked)
- Platform retains: commission on completed service days (NPR 20/rider/day × days_completed)

### 10.3 Cancellation Side Effects

1. EVT-005 (CampaignCancelled) emitted.
2. All active assignments terminated (→ Removed state).
3. Escrow refund ledger entry created (compensating entry per RULE-FIN-006).
4. EVT-036 (EscrowRefunded) emitted.
5. Notifications sent to: business, all assigned riders, Operations Staff.
6. Campaign timeline updated.
7. Audit entry created with full context.

### 10.4 Post-Cancellation State

- Campaign state: Cancelled (terminal — no further transitions).
- Rider states: Assigned/Active riders → Available.
- Rider earnings: Retained for completed days (RULE-RDR-007).
- Stickers: Flagged for return/disposal.
- Escrow: Closed with refund ledger entries balanced.

---

## 11. Campaign Completion

### 11.1 End-of-Campaign Processing

When a campaign's end date is reached (system cron trigger):

**Step 1: State Transition**
- Campaign: Running → Completed (EVT-004 emitted)
- All Active assignments: Active → Completed (EVT-023 emitted per assignment)

**Step 2: Financial Settlement**
- Final escrow release for the last day(s)
- Verify total released = total escrow (reconciliation check)
- Close escrow account for this campaign

**Step 3: Rider Processing (per assignment)**
- Calculate total days completed
- Calculate total earnings (days × NPR 100)
- Credit rider wallet for final day
- Calculate reliability score contribution (REQ-PRD-059)
- Update rider reliability score (EVT-053)
- Transition rider status: Campaign Active → Available

**Step 4: Performance Metrics Generation**
- Calculate campaign fulfillment percentage (actual vs. contracted)
- Calculate verification compliance rate
- Calculate rider retention rate (completed vs. initially assigned)
- Store metrics for business reporting

**Step 5: Notifications**
- Business: "Campaign X completed successfully. View your performance report."
- Riders: "Campaign X has ended. Your earnings have been credited."
- Operations Staff: summary metrics

**Step 6: Sticker Handling**
- All stickers flagged as "campaign ended"
- Return/disposal workflow initiated (Operations Staff manages)

### 11.2 Final Payout Calculation

At campaign completion, each rider's final earnings:

```
rider_total_earnings = active_days × rider_daily_rate
```

Where `active_days` = days the rider was in Active state for this assignment (excluding suspended/paused periods).

### 11.3 Performance Metrics

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| Fulfillment Rate | total_rider_days_delivered / total_rider_days_required × 100 | Business report |
| Compliance Rate | passed_verifications / total_verifications × 100 | Business report |
| Rider Retention | riders_completed / riders_initially_assigned × 100 | Operational metric |
| Average Reliability | mean(rider_scores) for assigned riders | Operational metric |
| Revenue Generated | days_completed × riders × platform_commission | Finance report |

---

## 12. Rider Replacement

### 12.1 Trigger Conditions

Replacement recruitment is triggered when:
1. A rider is REMOVED from an active assignment (RULE-ASN-006).
2. A rider WITHDRAWS from an assignment (RULE-RDR-007).
3. A rider is SUSPENDED while in an active assignment (RULE-RDR-004).
4. A rider fails 3rd verification (RULE-VRF-004 → removal).

### 12.2 Replacement Process

```
Removal detected → Fulfillment recalculated → Below threshold?
→ Yes: Campaign flagged for recruitment → Operations notified
→ Smart suggestions generated for replacement → Staff assigns replacement
→ Replacement goes through assignment lifecycle (Assigned → ... → Active)
```

### 12.3 Replacement Rules

| Rule | Specification |
|------|--------------|
| Campaign state | Replacement only for Running or Recruiting campaigns |
| Replacement timeline | No guaranteed timeline; depends on rider availability |
| Partial operation | Campaign continues running with reduced riders during replacement |
| Escrow impact | Daily release continues proportional to active riders |
| Business visibility | Business sees updated capacity meter (X/Y) |
| Fulfillment impact | Under-fulfillment period tracked separately for metrics |

### 12.4 Replacement Assignment Lifecycle

Replacement assignments follow the same lifecycle (§7) with:
- Start date = distribution completion date (not original campaign start)
- End date = original campaign end date
- Earnings = proportional to actual active days
- Duration shorter than original assignments

---

## 13. Reporting and Analytics

### 13.1 Campaign Performance Metrics (Business-Facing)

| Metric | Description | Refresh |
|--------|-------------|---------|
| Capacity Utilization | Riders active / riders contracted | Real-time |
| Fulfillment Rate | Rider-days delivered / rider-days purchased | Daily |
| Verification Compliance | % of verifications passed | Weekly cycle |
| Cost per Active Rider-Day | Total cost / actual rider-days delivered | On completion |
| Campaign Health Score | Composite of above metrics | Daily |

### 13.2 Operational Reports (Admin-Facing)

| Report | Content | Audience |
|--------|---------|----------|
| Recruitment Efficiency | Time to fill campaigns, rejection rates | Operations Staff |
| Zone Utilization | Riders per zone, demand vs. supply | Operations Staff, Admin |
| Verification Queue | Volume, approval rates, common rejection reasons | Operations Staff |
| Assignment Churn | Replacement frequency, common removal reasons | Admin |
| SLA Performance | Queue processing times vs. targets | Admin, Super Admin |

### 13.3 Financial Reports (Finance-Facing)

| Report | Content | Audience |
|--------|---------|----------|
| Revenue Summary | Daily/weekly/monthly commission earned | Finance Staff |
| Escrow Status | Active escrows, daily releases, total held | Finance Staff |
| Payout Summary | Batch history, total disbursed, pending | Finance Staff |
| Reconciliation | Ledger balance verification, discrepancies | Finance Staff, Admin |

---

## 14. Domain Events

### 14.1 Campaign Domain Events (CTX-004)

| Event ID | Event Name | Trigger | Payload |
|----------|-----------|---------|---------|
| EVT-001 | CampaignCreated | Campaign creation | { campaignId, businessId, spec, cost } |
| EVT-002 | CampaignFunded | Escrow created | { campaignId, amount, escrowId } |
| EVT-003 | CampaignStarted | Start date reached | { campaignId, startDate, riderCount } |
| EVT-004 | CampaignCompleted | End date reached | { campaignId, endDate, fulfillmentPct } |
| EVT-005 | CampaignCancelled | Authorized cancellation | { campaignId, reason, cancelledBy, daysCompleted } |
| EVT-006 | CampaignPaused | Operations/Admin pause | { campaignId, reason, pausedBy } |
| EVT-007 | CampaignResumed | Resume after pause | { campaignId, resumedBy } |

### 14.2 Assignment Domain Events (CTX-005)

| Event ID | Event Name | Trigger | Payload |
|----------|-----------|---------|---------|
| EVT-020 | AssignmentCreated | Staff assigns rider | { assignmentId, riderId, campaignId, zone } |
| EVT-021 | AssignmentDistributed | Sticker handoff | { assignmentId, stickerId, distributedAt } |
| EVT-022 | AssignmentInstalled | Sticker installed | { assignmentId, installedAt, proofMediaId } |
| EVT-023 | AssignmentCompleted | Campaign ends / individual completion | { assignmentId, riderId, campaignId, daysCompleted } |
| EVT-024 | AssignmentRemoved | Authorized removal | { assignmentId, riderId, reason, removedBy } |
| EVT-025 | AssignmentFulfilled | Fulfillment % change | { campaignId, fulfillmentPct } |

### 14.3 Event Consumers

| Event | Primary Consumers | Purpose |
|-------|-------------------|---------|
| EVT-001 | CTX-008, CTX-010, CTX-011, CTX-014 | Notification, audit, timeline, analytics |
| EVT-002 | CTX-007, CTX-008, CTX-010, CTX-011 | Escrow creation, notifications |
| EVT-003 | CTX-005, CTX-007, CTX-008 | Activate assignments, start daily release, notify |
| EVT-004 | CTX-005, CTX-007, CTX-008, CTX-014 | Complete assignments, final settlement, report |
| EVT-005 | CTX-005, CTX-007, CTX-008 | Terminate assignments, refund, notify |
| EVT-020 | CTX-002, CTX-004, CTX-006, CTX-008 | Update rider status, fulfillment, sticker prep, notify |
| EVT-023 | CTX-002, CTX-004, CTX-007 | Score update, fulfillment, earnings credit |
| EVT-024 | CTX-002, CTX-004, CTX-006, CTX-007 | Rider release, fulfillment decrement, sticker return, stop earnings |
| EVT-025 | CTX-004 | Campaign state evaluation (Ready threshold) |


---

## 15. Error Codes

### 15.1 Campaign Error Codes (CAMPAIGN_0XX)

| Code | Name | Trigger | HTTP Status |
|------|------|---------|-------------|
| CAMPAIGN_001 | Duration too short | Duration < minimum (15 days) | 400 |
| CAMPAIGN_002 | Insufficient riders | Riders < minimum (100) | 400 |
| CAMPAIGN_003 | Fulfillment incomplete | Attempt to transition Ready without 100% fill | 409 |
| CAMPAIGN_004 | Payment required | Attempt to skip payment states | 409 |
| CAMPAIGN_005 | Invalid currency | Non-NPR monetary value | 400 |
| CAMPAIGN_006 | Invalid name | Name validation failure | 400 |
| CAMPAIGN_007 | No zones specified | Empty target zones | 400 |
| CAMPAIGN_008 | Start date too soon | Start date < 7 days from now | 400 |
| CAMPAIGN_009 | Invalid asset type | Asset type not in configuration | 400 |
| CAMPAIGN_010 | Creative missing | No valid creative media ID | 400 |
| CAMPAIGN_011 | Invalid transition | State transition not permitted | 409 |
| CAMPAIGN_012 | Not cancellable | Campaign in non-cancellable state | 409 |
| CAMPAIGN_013 | Unauthorized action | Actor lacks permission for transition | 403 |

### 15.2 Assignment Error Codes (ASSIGN_0XX)

| Code | Name | Trigger | HTTP Status |
|------|------|---------|-------------|
| ASSIGN_001 | Zone mismatch | Rider zone does not overlap campaign zones | 400 |
| ASSIGN_002 | Conflicting assignment | Rider has overlapping assignment on same asset | 409 |
| ASSIGN_003 | Campaign not recruiting | Campaign not in Recruiting Riders state | 409 |
| ASSIGN_004 | Reason required | Removal without documented reason | 400 |
| ASSIGN_005 | Rider ineligible | Rider not in Available status | 400 |
| ASSIGN_006 | Assignment not found | Invalid assignment ID | 404 |
| ASSIGN_007 | Already assigned | Rider already assigned to this campaign | 409 |
| ASSIGN_008 | Invalid transition | Assignment state transition not permitted | 409 |
| ASSIGN_009 | Unauthorized | Actor lacks assignment:create permission | 403 |
| ASSIGN_010 | Campaign full | Campaign at 100% fulfillment, no more assignments | 409 |

### 15.3 Cross-Reference to Document 02

All error codes defined above trace to Document 02 §7 error code patterns:
- CAMPAIGN_0XX → Campaign domain failures
- ASSIGN_0XX → Assignment domain failures
- Referenced in API error responses per REQ-PRD-162

---

## 16. Traceability

### 16.1 Business Rule Coverage

| Rule ID | Section | Enforcement Point |
|---------|---------|-------------------|
| RULE-CMP-001 | §3.1, §2.3 | Campaign creation validation; state transition guard |
| RULE-CMP-002 | §3.1, §2.3 | Campaign creation validation |
| RULE-CMP-003 | §3.2 | Cost calculation; locked at Pending Payment |
| RULE-CMP-004 | §5.2, §2.3 | Fulfillment threshold check for Ready transition |
| RULE-CMP-005 | §2.3 | Payment states cannot be skipped |
| RULE-CMP-006 | §4.3, §2.3 | Escrow creation on payment verification |
| RULE-CMP-007 | §10.2 | Cancellation refund calculation |
| RULE-CMP-008 | §2.3 | Pause authority (Operations Staff/Admin) |
| RULE-CMP-009 | §2.3, §10.1 | Cancel authority (varies by state) |
| RULE-CMP-010 | §3.1 | NPR currency enforcement |
| RULE-ASN-001 | §6.1, §7.3 | Zone overlap validation |
| RULE-ASN-002 | §6.1, §7.3 | Conflict detection |
| RULE-ASN-003 | §7.3 | Assignment creation authority |
| RULE-ASN-004 | §6.1, §7.3 | Campaign state prerequisite |
| RULE-ASN-005 | §7.3, §7.4 | Removal requires reason |
| RULE-ASN-006 | §7.3, §12 | Replacement on under-fulfillment |
| RULE-VRF-001 | §9.1 | 7-day verification interval |
| RULE-VRF-002 | §9.5 | First failure → warning |
| RULE-VRF-003 | §9.5 | Second failure → suspension |
| RULE-VRF-004 | §9.5 | Third failure → removal |
| RULE-VRF-005 | §9.3 | Photo submission requirement |
| RULE-VRF-006 | §9.4 | Review authority |
| RULE-FIN-001 | §3.2 | Business daily rate in cost calculation |
| RULE-FIN-002 | §11.2 | Rider daily earning rate |
| RULE-FIN-003 | §10.2, §11.3 | Platform commission derivation |
| RULE-FIN-004 | §4.3 | Double-entry ledger for escrow |
| RULE-FIN-005 | §2.3 (Running side effects) | Daily escrow release |

### 16.2 Requirement Coverage

| Requirement | Section |
|-------------|---------|
| REQ-PRD-036 | §2 (complete campaign lifecycle) |
| REQ-PRD-037–053 | §2, §3, §4, §5 (campaign operations) |
| REQ-PRD-054–062 | §6, §7, §12 (assignment operations) |
| REQ-PRD-069–070 | §9 (verification compliance) |
| REQ-PRD-071–073 | §4.3, §10, §11 (escrow and ledger) |
| REQ-PRD-074–076 | §11.2 (rider earnings) |

### 16.3 Domain Model Coverage

| Aggregate | Specification Section |
|-----------|---------------------|
| AGG-004: Campaign | §2, §3, §4, §5 |
| AGG-005: Assignment | §7, §8, §9 |
| AGG-009: CampaignEscrow | §4.3, §10, §11 |
| AGG-007: StickerDistribution | §8, §9 |

---

*End of Document 12*
