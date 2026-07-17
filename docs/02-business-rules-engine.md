# Document 02 - Business Rules Engine

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every business rule MUST originate from this document. No business rule may be introduced directly into the API, UI, database, or service specifications without first being defined here.

---

## 1. Purpose and Scope

This document is the canonical single source of truth for ALL business rules governing the Solo Advertiser platform. It defines every constraint, calculation, validation, workflow transition, and operational behavior that the platform SHALL enforce.

All downstream specifications (API, UI, database, service implementations) SHALL reference rules defined in this document by their stable identifiers. No downstream document may introduce, modify, or override a business rule without a corresponding entry in this document.

### 1.1 Scope

This document covers business rules for the MVP deployment:

- **Geography:** Kathmandu Valley, Nepal
- **Currency:** NPR (Nepalese Rupee) exclusively
- **Operations:** Fully managed (no self-serve)
- **Scale:** 8,000-15,000 riders, 500-1,500 businesses

### 1.2 Rule Taxonomy

Every rule in this document is classified under exactly one taxonomy type:

| Type | Purpose |
|------|---------|
| VALIDATION | Determines whether an action can occur |
| CALCULATION | Computes values (pricing, payouts, scores) |
| WORKFLOW | Controls state transitions |
| SECURITY | Authorization and permissions |
| COMPLIANCE | Legal or document requirements |
| CONFIGURATION | Driven by Settings/Dictionary |
| SYSTEM | Internal operational behavior |

---

## 2. Rule Governance

### 2.1 Rule Lifecycle

1. **Proposal:** A new rule is proposed with a draft entry following the standard format.
2. **Review:** The rule is reviewed for conflicts with existing rules and internal consistency.
3. **Approval:** The rule is assigned a stable identifier and added to this document.
4. **Implementation:** Downstream specifications reference the rule by identifier.
5. **Deprecation:** Rules are never deleted; deprecated rules are marked with status and replacement reference.

### 2.2 Versioning

- Each rule has a stable identifier that SHALL NOT change once assigned.
- Rule modifications increment the document version.
- Breaking changes to existing rules require a migration plan in the implementation specification.

### 2.3 Identifier Format

All rule identifiers follow the pattern: `RULE-{DOMAIN}-{NNN}`

| Domain Prefix | Domain |
|---------------|--------|
| BIZ | Business Registration |
| RDR | Rider Registration |
| CMP | Campaign |
| ASN | Assignment |
| STK | Sticker Inventory |
| VRF | Verification |
| FIN | Financial Platform |
| PAY | Payouts |
| NTF | Notifications |
| DOC | Documents |
| ZON | Zones and Geography |
| CFG | Configuration |
| SYS | System |
| SEC | Security |

---

## 3. Rule Categories

### 3.1 Business Registration

**RULE-BIZ-001**  
Title: Business registration method  
Taxonomy: VALIDATION  
Description: A Business SHALL register via email with email verification before accessing the platform.  
Configuration: N/A  
Default: N/A  
Failure: BUSINESS_001  
Acceptance Test: Submitting a registration without a valid email address SHALL be rejected.  
Traces To: REQ-PRD-002, REQ-PRD-026

**RULE-BIZ-002**  
Title: Business document requirements  
Taxonomy: COMPLIANCE  
Description: A Business SHALL provide PAN/VAT certificate, business registration certificate, and authorized representative ID to transition from Registered to Documents Pending.  
Configuration: business.required_documents  
Default: ["pan_vat_certificate", "business_registration", "representative_id"]  
Failure: BUSINESS_002  
Acceptance Test: A Business submitting fewer than three required documents SHALL remain in Registered status.  
Traces To: REQ-PRD-027

**RULE-BIZ-003**  
Title: Business verification authority  
Taxonomy: SECURITY  
Description: Only Operations Staff or higher roles SHALL be authorized to verify or reject a business.  
Configuration: N/A  
Default: N/A  
Failure: AUTH_001  
Acceptance Test: A Rider or Business user attempting to verify a business SHALL receive an authorization error.  
Traces To: REQ-PRD-028, REQ-PRD-029

**RULE-BIZ-004**  
Title: Business campaign creation eligibility  
Taxonomy: VALIDATION  
Description: A Business SHALL NOT create campaigns unless in Verified or Active status.  
Configuration: N/A  
Default: N/A  
Failure: BUSINESS_003  
Acceptance Test: A Business in Registered, Documents Pending, Under Review, Suspended, or Blacklisted status attempting to create a campaign SHALL be rejected.  
Traces To: REQ-PRD-031, REQ-PRD-034

**RULE-BIZ-005**  
Title: Business activation trigger  
Taxonomy: WORKFLOW  
Description: A Verified Business SHALL transition to Active status upon creation of their first campaign.  
Configuration: N/A  
Default: N/A  
Failure: N/A  
Acceptance Test: A Verified Business creating their first campaign SHALL have status updated to Active.  
Traces To: REQ-PRD-030

**RULE-BIZ-006**  
Title: Business suspension authority  
Taxonomy: SECURITY  
Description: Only Operations Staff, Admin, or Super Admin SHALL be authorized to suspend a business.  
Configuration: N/A  
Default: N/A  
Failure: AUTH_002  
Acceptance Test: A Finance Staff user attempting to suspend a business SHALL receive an authorization error.  
Traces To: REQ-PRD-032

**RULE-BIZ-007**  
Title: Business blacklist authority  
Taxonomy: SECURITY  
Description: Only Super Admin SHALL be authorized to blacklist a business permanently.  
Configuration: N/A  
Default: N/A  
Failure: AUTH_003  
Acceptance Test: An Admin user attempting to blacklist a business SHALL receive an authorization error.  
Traces To: REQ-PRD-033

**RULE-BIZ-008**  
Title: Blacklisted business restrictions  
Taxonomy: VALIDATION  
Description: A Blacklisted Business SHALL NOT access any platform functionality beyond viewing historical data.  
Configuration: N/A  
Default: N/A  
Failure: BUSINESS_004  
Acceptance Test: A Blacklisted Business attempting any write operation SHALL be rejected.  
Traces To: REQ-PRD-034

### 3.2 Rider Registration

**RULE-RDR-001**  
Title: Rider registration method  
Taxonomy: VALIDATION  
Description: A Rider SHALL register via phone number with OTP verification.  
Configuration: N/A  
Default: N/A  
Failure: RIDER_001  
Acceptance Test: Submitting a registration without a valid Nepal phone number SHALL be rejected.  
Traces To: REQ-PRD-001, REQ-PRD-012

**RULE-RDR-002**  
Title: Rider document requirements  
Taxonomy: COMPLIANCE  
Description: A Rider SHALL provide citizenship/license, vehicle registration, profile photo, and helmet photo to transition from Pre-Registered to Documents Pending.  
Configuration: rider.required_documents  
Default: ["citizenship_or_license", "vehicle_registration", "profile_photo", "helmet_photo"]  
Failure: RIDER_002  
Acceptance Test: A Rider submitting fewer than four required documents SHALL remain in Pre-Registered status.  
Traces To: REQ-PRD-013

**RULE-RDR-003**  
Title: Rider concurrent campaign limit  
Taxonomy: VALIDATION  
Description: A Rider SHALL NOT be assigned to more than one campaign per advertising asset simultaneously.  
Configuration: rider.max_concurrent_per_asset  
Default: 1  
Failure: RIDER_003  
Acceptance Test: Assigning a rider who already has an active campaign on the same asset type SHALL be rejected.  
Traces To: REQ-PRD-018, REQ-PRD-143

**RULE-RDR-004**  
Title: Suspended rider assignment restriction  
Taxonomy: VALIDATION  
Description: A Suspended Rider SHALL NOT receive new campaign assignments.  
Configuration: N/A  
Default: N/A  
Failure: RIDER_004  
Acceptance Test: Attempting to assign a Suspended rider to a campaign SHALL be rejected.  
Traces To: REQ-PRD-020

**RULE-RDR-005**  
Title: Rider assignment eligibility  
Taxonomy: VALIDATION  
Description: A Rider SHALL only be assigned to a campaign when in Available status.  
Configuration: N/A  
Default: N/A  
Failure: RIDER_005  
Acceptance Test: Attempting to assign a rider in any status other than Available SHALL be rejected.  
Traces To: REQ-PRD-144

**RULE-RDR-006**  
Title: Rider reliability score calculation  
Taxonomy: CALCULATION  
Description: The system SHALL calculate a Rider Reliability Score as a weighted composite of five components: Verification (30%), Attendance (25%), Activity (20%), Completion (15%), Response (10%), yielding a score from 0 to 100.  
Configuration: rider.reliability_weights  
Default: {"verification": 30, "attendance": 25, "activity": 20, "completion": 15, "response": 10}  
Failure: N/A  
Acceptance Test: A rider with perfect scores in all categories SHALL have a reliability score of 100.  
Traces To: REQ-PRD-017

**RULE-RDR-007**  
Title: Rider withdrawal policy  
Taxonomy: WORKFLOW  
Description: A Rider who withdraws from an active campaign SHALL forfeit future earnings for that campaign but SHALL NOT incur any monetary penalty.  
Configuration: N/A  
Default: N/A  
Failure: N/A  
Acceptance Test: A rider withdrawing mid-campaign SHALL have their future daily earnings stopped but retain already-earned amounts.  
Traces To: REQ-PRD-057

**RULE-RDR-008**  
Title: Rider replacement on withdrawal  
Taxonomy: WORKFLOW  
Description: When a Rider withdraws or is removed from an active campaign, the system SHALL immediately flag the position for replacement recruitment.  
Configuration: N/A  
Default: N/A  
Failure: N/A  
Acceptance Test: Removing a rider from a running campaign SHALL create a replacement vacancy notification for Operations Staff.  
Traces To: REQ-PRD-057

### 3.3 Campaign

**RULE-CMP-001**  
Title: Minimum campaign duration  
Taxonomy: VALIDATION  
Description: A Campaign SHALL have a duration greater than or equal to the configured minimum.  
Configuration: campaign.minimum_days  
Default: 15  
Failure: CAMPAIGN_001  
Acceptance Test: Creating a 7-day campaign SHALL fail with CAMPAIGN_001.  
Traces To: REQ-PRD-040, REQ-PRD-133

**RULE-CMP-002**  
Title: Minimum campaign riders  
Taxonomy: VALIDATION  
Description: A Campaign SHALL require a number of riders greater than or equal to the configured minimum.  
Configuration: campaign.minimum_riders  
Default: 100  
Failure: CAMPAIGN_002  
Acceptance Test: Creating a campaign requesting 50 riders SHALL fail with CAMPAIGN_002.  
Traces To: REQ-PRD-039, REQ-PRD-134

**RULE-CMP-003**  
Title: Campaign cost calculation  
Taxonomy: CALCULATION  
Description: The total campaign cost SHALL be calculated as: number_of_riders x duration_days x business_daily_rate.  
Configuration: campaign.business_daily_rate  
Default: 120 (NPR)  
Failure: N/A  
Acceptance Test: A campaign with 100 riders for 15 days SHALL have a total cost of NPR 180,000.  
Traces To: REQ-PRD-042, REQ-PRD-128, REQ-PRD-132

**RULE-CMP-004**  
Title: Campaign fulfillment threshold  
Taxonomy: VALIDATION  
Description: A Campaign SHALL transition from Recruiting Riders to Ready only when the configured fulfillment threshold of assigned riders is reached.  
Configuration: campaign.fulfillment_threshold  
Default: 100 (percent)  
Failure: CAMPAIGN_003  
Acceptance Test: A campaign requiring 100 riders with only 99 assigned SHALL NOT transition to Ready.  
Traces To: REQ-PRD-047, REQ-PRD-135

**RULE-CMP-005**  
Title: Campaign payment prerequisite  
Taxonomy: WORKFLOW  
Description: A Campaign SHALL NOT proceed past Draft status without payment submission by the Business.  
Configuration: N/A  
Default: N/A  
Failure: CAMPAIGN_004  
Acceptance Test: A campaign in Draft status attempting to transition directly to Recruiting Riders SHALL be rejected.  
Traces To: REQ-PRD-041, REQ-PRD-043

**RULE-CMP-006**  
Title: Campaign escrow on payment verification  
Taxonomy: WORKFLOW  
Description: Upon payment verification, the full campaign amount SHALL be placed in Campaign Escrow.  
Configuration: N/A  
Default: N/A  
Failure: PAYMENT_001  
Acceptance Test: After Finance Staff verifies payment, the full campaign cost SHALL appear as a Campaign Escrow ledger entry.  
Traces To: REQ-PRD-045

**RULE-CMP-007**  
Title: Campaign cancellation refund  
Taxonomy: CALCULATION  
Description: Upon campaign cancellation, the system SHALL refund the unused portion of escrowed funds to the Business. Commission SHALL be retained on any completed service days.  
Configuration: N/A  
Default: N/A  
Failure: N/A  
Acceptance Test: Cancelling a campaign after 5 of 15 days SHALL refund escrow for 10 remaining days minus platform commission on 5 completed days.  
Traces To: REQ-PRD-052

**RULE-CMP-008**  
Title: Campaign pause authority  
Taxonomy: SECURITY  
Description: Only Operations Staff or Admin SHALL be authorized to pause a Running campaign.  
Configuration: N/A  
Default: N/A  
Failure: AUTH_004  
Acceptance Test: A Business user attempting to pause their own campaign SHALL receive an authorization error.  
Traces To: REQ-PRD-050

**RULE-CMP-009**  
Title: Campaign cancellation authority  
Taxonomy: SECURITY  
Description: Only Admin or Super Admin SHALL be authorized to cancel a Running campaign. Operations Staff or higher MAY cancel campaigns in pre-Running states.  
Configuration: N/A  
Default: N/A  
Failure: AUTH_005  
Acceptance Test: Operations Staff attempting to cancel a Running campaign SHALL receive an authorization error.  
Traces To: REQ-PRD-051

**RULE-CMP-010**  
Title: Campaign currency restriction  
Taxonomy: VALIDATION  
Description: All campaign monetary values SHALL be denominated exclusively in NPR (Nepalese Rupee).  
Configuration: platform.currency  
Default: NPR  
Failure: CAMPAIGN_005  
Acceptance Test: Submitting a campaign cost in any currency other than NPR SHALL be rejected.  
Traces To: REQ-PRD-131

### 3.4 Assignment

**RULE-ASN-001**  
Title: Assignment zone matching  
Taxonomy: VALIDATION  
Description: A Rider SHALL only be assigned to a campaign if the rider's registered zone overlaps with the campaign's target zones.  
Configuration: N/A  
Default: N/A  
Failure: ASSIGN_001  
Acceptance Test: Assigning a rider whose zone does not overlap with campaign target zones SHALL be rejected.  
Traces To: REQ-PRD-055, REQ-PRD-145

**RULE-ASN-002**  
Title: Assignment conflict detection  
Taxonomy: VALIDATION  
Description: The system SHALL reject an assignment if the rider has an existing active assignment on the same asset type with overlapping dates.  
Configuration: N/A  
Default: N/A  
Failure: ASSIGN_002  
Acceptance Test: Assigning a rider to two helmet campaigns with overlapping date ranges SHALL fail.  
Traces To: REQ-PRD-056, REQ-PRD-143

**RULE-ASN-003**  
Title: Assignment authority  
Taxonomy: SECURITY  
Description: Only Operations Staff or higher roles SHALL be authorized to create rider-campaign assignments.  
Configuration: N/A  
Default: N/A  
Failure: AUTH_006  
Acceptance Test: A Business or Rider user attempting to create an assignment SHALL receive an authorization error.  
Traces To: REQ-PRD-054

**RULE-ASN-004**  
Title: Assignment campaign state prerequisite  
Taxonomy: WORKFLOW  
Description: Rider assignments SHALL only be created for campaigns in Recruiting Riders state.  
Configuration: N/A  
Default: N/A  
Failure: ASSIGN_003  
Acceptance Test: Attempting to assign a rider to a campaign in Draft or Running state SHALL be rejected.  
Traces To: REQ-PRD-046, REQ-PRD-054

**RULE-ASN-005**  
Title: Assignment removal documentation  
Taxonomy: COMPLIANCE  
Description: Removing a rider from an assignment SHALL require a documented reason stored in the audit trail.  
Configuration: N/A  
Default: N/A  
Failure: ASSIGN_004  
Acceptance Test: Attempting to remove a rider from an assignment without providing a reason SHALL be rejected.  
Traces To: REQ-PRD-061

**RULE-ASN-006**  
Title: Assignment replacement recruitment  
Taxonomy: WORKFLOW  
Description: When a rider is removed from an active campaign assignment, the system SHALL flag the campaign for replacement recruitment if fulfillment drops below threshold.  
Configuration: N/A  
Default: N/A  
Failure: N/A  
Acceptance Test: Removing a rider from a Running campaign SHALL trigger a replacement notification to Operations Staff.  
Traces To: REQ-PRD-057

### 3.5 Advertising Assets

**RULE-STK-001**  
Title: Sticker template campaign link  
Taxonomy: VALIDATION  
Description: Every sticker template SHALL be linked to exactly one campaign creative.  
Configuration: N/A  
Default: N/A  
Failure: STICKER_001  
Acceptance Test: Creating a sticker template without a valid campaign creative reference SHALL be rejected.  
Traces To: REQ-PRD-063

**RULE-STK-002**  
Title: Print order minimum information  
Taxonomy: VALIDATION  
Description: A print order SHALL specify vendor, quantity, sticker template, and expected delivery date.  
Configuration: N/A  
Default: N/A  
Failure: STICKER_002  
Acceptance Test: Creating a print order missing any of the four required fields SHALL be rejected.  
Traces To: REQ-PRD-064

**RULE-STK-003**  
Title: Sticker distribution proof  
Taxonomy: COMPLIANCE  
Description: Sticker distribution to a rider SHALL require photographic proof of the distribution event.  
Configuration: N/A  
Default: N/A  
Failure: STICKER_003  
Acceptance Test: Recording a sticker distribution without an attached photo SHALL be rejected.  
Traces To: REQ-PRD-068

**RULE-STK-004**  
Title: Sticker inventory tracking  
Taxonomy: SYSTEM  
Description: The system SHALL maintain real-time inventory counts per campaign: total printed, distributed, installed, damaged, and returned.  
Configuration: N/A  
Default: N/A  
Failure: N/A  
Acceptance Test: Distributing a sticker SHALL decrement the in-inventory count and increment the distributed count.  
Traces To: REQ-PRD-067

### 3.6 Sticker Inventory

**RULE-STK-005**  
Title: Sticker batch identification  
Taxonomy: SYSTEM  
Description: Every sticker batch SHALL have a unique batch identifier for traceability.  
Configuration: N/A  
Default: N/A  
Failure: STICKER_004  
Acceptance Test: Two sticker batches SHALL NOT share the same batch identifier.  
Traces To: REQ-PRD-066

**RULE-STK-006**  
Title: Asset type extensibility  
Taxonomy: CONFIGURATION  
Description: The advertising asset model SHALL be generic to support future asset types (helmet, taxi, jacket) via configuration without code changes.  
Configuration: asset.supported_types  
Default: ["helmet"]  
Failure: CONFIG_001  
Acceptance Test: Adding a new asset type via configuration SHALL not require a code deployment.  
Traces To: REQ-PRD-063

### 3.7 Verification

**RULE-VRF-001**  
Title: Verification interval  
Taxonomy: CONFIGURATION  
Description: The system SHALL require sticker verification from active riders at the configured interval.  
Configuration: verification.interval_days  
Default: 7  
Failure: VERIFY_001  
Acceptance Test: A rider who has not submitted verification within 7 days SHALL be flagged as overdue.  
Traces To: REQ-PRD-069, REQ-PRD-136

**RULE-VRF-002**  
Title: First verification failure consequence  
Taxonomy: WORKFLOW  
Description: A rider's first verification failure within a campaign SHALL result in a warning notification only.  
Configuration: verification.first_failure_action  
Default: warning  
Failure: N/A  
Acceptance Test: A rider failing verification for the first time SHALL receive a warning and remain in active status.  
Traces To: REQ-PRD-137

**RULE-VRF-003**  
Title: Second verification failure consequence  
Taxonomy: WORKFLOW  
Description: A rider's second verification failure within a campaign SHALL result in temporary suspension from the campaign.  
Configuration: verification.second_failure_action  
Default: temporary_suspension  
Failure: VERIFY_002  
Acceptance Test: A rider failing verification for the second time SHALL be temporarily suspended and stop earning.  
Traces To: REQ-PRD-138

**RULE-VRF-004**  
Title: Third verification failure consequence  
Taxonomy: WORKFLOW  
Description: A rider's third verification failure within a campaign SHALL result in removal from the campaign.  
Configuration: verification.third_failure_action  
Default: campaign_removal  
Failure: VERIFY_003  
Acceptance Test: A rider failing verification for the third time SHALL be removed from the campaign assignment.  
Traces To: REQ-PRD-139

**RULE-VRF-005**  
Title: Verification photo requirement  
Taxonomy: COMPLIANCE  
Description: Sticker verification SHALL require a photo submission from the rider showing the sticker in its current state.  
Configuration: N/A  
Default: N/A  
Failure: VERIFY_004  
Acceptance Test: A verification submission without an attached photo SHALL be rejected.  
Traces To: REQ-PRD-069

**RULE-VRF-006**  
Title: Verification approval authority  
Taxonomy: SECURITY  
Description: Only Operations Staff or higher roles SHALL be authorized to approve or reject verification submissions.  
Configuration: N/A  
Default: N/A  
Failure: AUTH_007  
Acceptance Test: A rider or business user attempting to approve a verification SHALL receive an authorization error.  
Traces To: REQ-PRD-070

### 3.8 Financial Platform

**RULE-FIN-001**  
Title: Business daily rate  
Taxonomy: CALCULATION  
Description: The business SHALL be charged at the configured daily rate per rider per campaign day.  
Configuration: finance.business_daily_rate  
Default: 120 (NPR)  
Failure: N/A  
Acceptance Test: A campaign with 1 rider for 1 day SHALL cost the business NPR 120.  
Traces To: REQ-PRD-128

**RULE-FIN-002**  
Title: Rider daily earning rate  
Taxonomy: CALCULATION  
Description: A rider SHALL earn the configured daily rate for each completed campaign day.  
Configuration: finance.rider_daily_rate  
Default: 100 (NPR)  
Failure: N/A  
Acceptance Test: A rider completing 1 campaign day SHALL earn NPR 100.  
Traces To: REQ-PRD-075, REQ-PRD-129

**RULE-FIN-003**  
Title: Platform commission derivation  
Taxonomy: CALCULATION  
Description: Platform commission SHALL be the difference between the business daily rate and the rider daily rate per rider per day (NPR 20/rider/day, approximately 16.67%).  
Configuration: Derived from finance.business_daily_rate minus finance.rider_daily_rate  
Default: 20 (NPR, ~16.67%)  
Failure: N/A  
Acceptance Test: Platform revenue for 1 rider for 1 day SHALL equal NPR 20.  
Traces To: REQ-PRD-076, REQ-PRD-130

**RULE-FIN-004**  
Title: Double-entry ledger requirement  
Taxonomy: SYSTEM  
Description: All financial transactions SHALL be recorded as double-entry ledger entries with balanced debits and credits.  
Configuration: N/A  
Default: N/A  
Failure: PAYMENT_002  
Acceptance Test: Every ledger transaction SHALL have total debits equal to total credits.  
Traces To: REQ-PRD-071

**RULE-FIN-005**  
Title: Escrow daily release  
Taxonomy: CALCULATION  
Description: Campaign escrow SHALL be released daily. For each completed campaign day, the released amount SHALL equal total_escrow divided by total_campaign_days.  
Configuration: N/A  
Default: N/A  
Failure: N/A  
Acceptance Test: A campaign with NPR 180,000 escrow over 15 days SHALL release NPR 12,000 per day.  
Traces To: REQ-PRD-072, REQ-PRD-073

**RULE-FIN-006**  
Title: Ledger immutability  
Taxonomy: SYSTEM  
Description: Financial ledger entries SHALL be append-only. Corrections SHALL be made via compensating entries, never by modifying existing records.  
Configuration: N/A  
Default: N/A  
Failure: PAYMENT_003  
Acceptance Test: Attempting to UPDATE or DELETE a ledger entry SHALL be rejected at the database level.  
Traces To: REQ-PRD-155

**RULE-FIN-007**  
Title: Ledger account structure  
Taxonomy: SYSTEM  
Description: The financial ledger SHALL maintain the following accounts: Accounts Receivable, Campaign Escrow, Platform Revenue, Rider Liability, and Rider Payout.  
Configuration: N/A  
Default: N/A  
Failure: N/A  
Acceptance Test: A ledger query SHALL return entries categorized under one of the five defined accounts.  
Traces To: REQ-PRD-071

### 3.9 Payouts

**RULE-PAY-001**  
Title: Payout cycle frequency  
Taxonomy: CONFIGURATION  
Description: The system SHALL process rider payouts at the configured cycle interval.  
Configuration: payout.cycle_days  
Default: 15  
Failure: N/A  
Acceptance Test: Payout processing SHALL execute every 15 days from the platform launch date.  
Traces To: REQ-PRD-077, REQ-PRD-140

**RULE-PAY-002**  
Title: Minimum payout threshold  
Taxonomy: VALIDATION  
Description: A payout SHALL NOT be processed if the rider's wallet balance is below the configured minimum threshold.  
Configuration: payout.minimum_amount  
Default: 500 (NPR)  
Failure: PAYMENT_004  
Acceptance Test: A rider with a wallet balance of NPR 400 SHALL NOT receive a payout.  
Traces To: REQ-PRD-078, REQ-PRD-141

**RULE-PAY-003**  
Title: Supported payout methods  
Taxonomy: CONFIGURATION  
Description: The system SHALL support the configured list of payout methods, presented in priority order.  
Configuration: payout.methods  
Default: ["esewa", "khalti", "bank_transfer", "ime_pay"]  
Failure: PAYMENT_005  
Acceptance Test: A rider selecting a payout method not in the configured list SHALL be rejected.  
Traces To: REQ-PRD-079, REQ-PRD-142

**RULE-PAY-004**  
Title: Manual payout verification  
Taxonomy: WORKFLOW  
Description: Finance Staff SHALL manually verify and approve payout batches before disbursement. No automated payout disbursement SHALL occur.  
Configuration: N/A  
Default: N/A  
Failure: N/A  
Acceptance Test: A payout batch SHALL remain in pending status until Finance Staff explicitly approves it.  
Traces To: REQ-PRD-080

**RULE-PAY-005**  
Title: Payout proof requirement  
Taxonomy: COMPLIANCE  
Description: Completed payouts SHALL have proof of transfer uploaded by Finance Staff.  
Configuration: N/A  
Default: N/A  
Failure: PAYMENT_006  
Acceptance Test: Marking a payout as completed without attached proof SHALL be rejected.  
Traces To: REQ-PRD-080, REQ-PRD-085

**RULE-PAY-006**  
Title: Payment submission methods  
Taxonomy: CONFIGURATION  
Description: The system SHALL support campaign payment submissions via the configured methods.  
Configuration: payment.submission_methods  
Default: ["esewa", "khalti", "bank_transfer", "ime_pay"]  
Failure: PAYMENT_007  
Acceptance Test: A business submitting payment via an unsupported method SHALL be rejected.  
Traces To: REQ-PRD-084

**RULE-PAY-007**  
Title: Manual payment verification  
Taxonomy: WORKFLOW  
Description: Finance Staff SHALL manually verify all payment submissions against bank/payment provider records. No automated payment verification SHALL occur.  
Configuration: N/A  
Default: N/A  
Failure: N/A  
Acceptance Test: A payment submission SHALL remain in submitted status until Finance Staff explicitly verifies it.  
Traces To: REQ-PRD-085

### 3.10 Notifications

**RULE-NTF-001**  
Title: Event-driven notification triggers  
Taxonomy: SYSTEM  
Description: The system SHALL trigger notifications based on domain events including state changes, assignments, verifications, and payouts.  
Configuration: N/A  
Default: N/A  
Failure: N/A  
Acceptance Test: A campaign state transition SHALL generate a notification to the business owner.  
Traces To: REQ-PRD-090

**RULE-NTF-002**  
Title: Notification delivery channels  
Taxonomy: CONFIGURATION  
Description: The system SHALL support push notifications and in-app notifications as delivery channels.  
Configuration: notification.channels  
Default: ["push", "in_app"]  
Failure: N/A  
Acceptance Test: A notification SHALL be delivered via both push and in-app channels when both are enabled.  
Traces To: REQ-PRD-086, REQ-PRD-087

**RULE-NTF-003**  
Title: Real-time notification delivery  
Taxonomy: SYSTEM  
Description: The system SHALL deliver notifications in real-time via WebSocket (Socket.IO) to connected clients.  
Configuration: N/A  
Default: N/A  
Failure: NOTIFY_001  
Acceptance Test: A connected client SHALL receive a notification within 5 seconds of the triggering event.  
Traces To: REQ-PRD-092

**RULE-NTF-004**  
Title: Notification user preferences  
Taxonomy: CONFIGURATION  
Description: Users SHALL be able to control notification channels via preferences. The system SHALL respect these preferences.  
Configuration: N/A  
Default: All channels enabled  
Failure: N/A  
Acceptance Test: A user who disables push notifications SHALL only receive in-app notifications.  
Traces To: REQ-PRD-091

### 3.11 Documents

**RULE-DOC-001**  
Title: Document expiry reminder schedule  
Taxonomy: SYSTEM  
Description: The system SHALL send document expiry reminders at 30, 15, and 7 days before the expiration date.  
Configuration: document.expiry_reminders_days  
Default: [30, 15, 7]  
Failure: N/A  
Acceptance Test: A document expiring in 30 days SHALL trigger the first reminder notification.  
Traces To: REQ-PRD-024

**RULE-DOC-002**  
Title: Document review authority  
Taxonomy: SECURITY  
Description: Only Operations Staff or higher roles SHALL be authorized to approve or reject uploaded documents.  
Configuration: N/A  
Default: N/A  
Failure: AUTH_008  
Acceptance Test: A Rider or Business user attempting to approve a document SHALL receive an authorization error.  
Traces To: REQ-PRD-014, REQ-PRD-028

**RULE-DOC-003**  
Title: Document re-verification on expiry  
Taxonomy: WORKFLOW  
Description: When a document expires, the system SHALL transition the document to Expired status and require replacement submission.  
Configuration: N/A  
Default: N/A  
Failure: DOC_001  
Acceptance Test: An expired document SHALL trigger a Replacement Required status and notify the owner.  
Traces To: REQ-PRD-024

**RULE-DOC-004**  
Title: Document rejection with reason  
Taxonomy: COMPLIANCE  
Description: Rejecting a document SHALL require a documented reason provided to the submitting user.  
Configuration: N/A  
Default: N/A  
Failure: DOC_002  
Acceptance Test: Attempting to reject a document without a reason SHALL be rejected.  
Traces To: REQ-PRD-014, REQ-PRD-029

**RULE-DOC-005**  
Title: Document file validation  
Taxonomy: VALIDATION  
Description: Uploaded documents SHALL be validated for file type and file size against configured limits.  
Configuration: document.allowed_types, document.max_size_mb  
Default: ["image/jpeg", "image/png", "application/pdf"], 10 (MB)  
Failure: MEDIA_001  
Acceptance Test: Uploading a file exceeding 10 MB SHALL be rejected with MEDIA_001.  
Traces To: REQ-PRD-110

### 3.12 Zones and Geography

**RULE-ZON-001**  
Title: Zone definition structure  
Taxonomy: CONFIGURATION  
Description: Zones SHALL be defined as collections of one or more wards within Kathmandu Valley following the hierarchy: Region > Zone > Ward.  
Configuration: N/A  
Default: N/A  
Failure: ZONE_001  
Acceptance Test: Creating a zone without at least one ward SHALL be rejected.  
Traces To: REQ-PRD-146

**RULE-ZON-002**  
Title: Zone management authority  
Taxonomy: SECURITY  
Description: Only Super Admin SHALL be authorized to create, modify, or delete zone definitions.  
Configuration: N/A  
Default: N/A  
Failure: AUTH_009  
Acceptance Test: An Admin user attempting to create a zone SHALL receive an authorization error.  
Traces To: REQ-PRD-147

**RULE-ZON-003**  
Title: Geographic boundary restriction  
Taxonomy: VALIDATION  
Description: All zones SHALL be within the Kathmandu Valley geographic boundary. No zone SHALL reference wards outside this boundary.  
Configuration: platform.geographic_boundary  
Default: kathmandu_valley  
Failure: ZONE_002  
Acceptance Test: Attempting to create a zone with a ward outside Kathmandu Valley SHALL be rejected.  
Traces To: REQ-PRD-146

**RULE-ZON-004**  
Title: Zone-based rider matching  
Taxonomy: VALIDATION  
Description: Campaign rider assignment SHALL validate that the rider's zone assignment matches at least one of the campaign's target zones.  
Configuration: N/A  
Default: N/A  
Failure: ZONE_003  
Acceptance Test: A rider in Zone A attempting to be assigned to a campaign targeting only Zone B SHALL be rejected.  
Traces To: REQ-PRD-055, REQ-PRD-145

### 3.13 Security

**RULE-SEC-001**  
Title: Account lockout on failed attempts  
Taxonomy: SECURITY  
Description: The system SHALL lock an account after the configured number of consecutive failed authentication attempts for a configurable duration.  
Configuration: auth.max_failed_attempts, auth.lockout_duration_minutes  
Default: 5 attempts, 30 minutes  
Failure: AUTH_010  
Acceptance Test: After 5 failed login attempts, the 6th attempt SHALL be rejected regardless of correct credentials until the lockout period expires.  
Traces To: REQ-PRD-007

---

## 4. Configuration-backed Rules

All business rules with configurable values are managed through the Configuration Service. The following table provides the complete registry of configuration-backed rules.

| Configuration Key | Default Value | Validation | Affected Rule(s) | Affected Modules |
|-------------------|---------------|------------|-------------------|------------------|
| campaign.minimum_days | 15 | Integer >= 1 | RULE-CMP-001 | Campaign |
| campaign.minimum_riders | 100 | Integer >= 1 | RULE-CMP-002 | Campaign |
| campaign.business_daily_rate | 120 | Integer > 0, NPR | RULE-CMP-003, RULE-FIN-001 | Campaign, Finance |
| campaign.fulfillment_threshold | 100 | Integer 1-100 (percent) | RULE-CMP-004 | Campaign, Assignment |
| finance.business_daily_rate | 120 | Integer > 0, NPR | RULE-FIN-001 | Finance |
| finance.rider_daily_rate | 100 | Integer > 0, NPR | RULE-FIN-002 | Finance |
| payout.cycle_days | 15 | Integer >= 1 | RULE-PAY-001 | Payouts |
| payout.minimum_amount | 500 | Integer > 0, NPR | RULE-PAY-002 | Payouts |
| payout.methods | ["esewa", "khalti", "bank_transfer", "ime_pay"] | Non-empty array of strings | RULE-PAY-003 | Payouts |
| payment.submission_methods | ["esewa", "khalti", "bank_transfer", "ime_pay"] | Non-empty array of strings | RULE-PAY-006 | Finance |
| verification.interval_days | 7 | Integer >= 1 | RULE-VRF-001 | Verification |
| verification.first_failure_action | warning | Enum: warning | RULE-VRF-002 | Verification |
| verification.second_failure_action | temporary_suspension | Enum: temporary_suspension | RULE-VRF-003 | Verification |
| verification.third_failure_action | campaign_removal | Enum: campaign_removal | RULE-VRF-004 | Verification |
| rider.max_concurrent_per_asset | 1 | Integer >= 1 | RULE-RDR-003 | Assignment |
| rider.required_documents | ["citizenship_or_license", "vehicle_registration", "profile_photo", "helmet_photo"] | Non-empty array of strings | RULE-RDR-002 | Rider |
| rider.reliability_weights | {"verification":30,"attendance":25,"activity":20,"completion":15,"response":10} | Object, values sum to 100 | RULE-RDR-006 | Rider |
| business.required_documents | ["pan_vat_certificate", "business_registration", "representative_id"] | Non-empty array of strings | RULE-BIZ-002 | Business |
| asset.supported_types | ["helmet"] | Non-empty array of strings | RULE-STK-006 | Sticker, Assignment |
| platform.currency | NPR | ISO 4217 code | RULE-CMP-010 | All financial |
| platform.geographic_boundary | kathmandu_valley | String identifier | RULE-ZON-003 | Zones |
| document.expiry_reminders_days | [30, 15, 7] | Non-empty array of positive integers | RULE-DOC-001 | Documents |
| document.allowed_types | ["image/jpeg", "image/png", "application/pdf"] | Non-empty array of MIME types | RULE-DOC-005 | Documents, Media |
| document.max_size_mb | 10 | Integer > 0 | RULE-DOC-005 | Documents, Media |
| notification.channels | ["push", "in_app"] | Non-empty array of strings | RULE-NTF-002 | Notifications |
| auth.max_failed_attempts | 5 | Integer >= 1 | RULE-SEC-001 | Authentication |
| auth.lockout_duration_minutes | 30 | Integer >= 1 | RULE-SEC-001 | Authentication |

---

## 5. Rule Execution Order

When multiple rules apply to a single operation, they SHALL be evaluated in the following order:

| Priority | Type | Rationale |
|----------|------|-----------|
| 1 | SECURITY | Authorization is checked first; unauthorized requests are rejected before any processing. |
| 2 | VALIDATION | Input validity is confirmed before business logic executes. |
| 3 | COMPLIANCE | Legal and document requirements are verified before state changes. |
| 4 | WORKFLOW | State transition rules determine if the operation is permitted in the current state. |
| 5 | CALCULATION | Values are computed after all validations pass. |
| 6 | CONFIGURATION | Configuration-driven behavior is applied to shape the operation. |
| 7 | SYSTEM | Internal system behaviors (logging, notifications, ledger entries) execute last. |

### 5.1 Execution Principles

1. **Fail-fast:** If a higher-priority rule fails, lower-priority rules SHALL NOT be evaluated.
2. **Atomic operations:** All rules for a single operation SHALL succeed or the entire operation SHALL be rolled back.
3. **Deterministic order:** Rules within the same priority level SHALL be evaluated in their identifier order (e.g., RULE-CMP-001 before RULE-CMP-002).

---

## 6. Conflict Resolution

### 6.1 Rule Conflict Principles

1. **Specificity wins:** A domain-specific rule takes precedence over a general platform rule.
2. **Security trumps convenience:** When a security rule and a workflow rule conflict, the security rule prevails.
3. **Explicit over implicit:** A rule with an explicit configuration key takes precedence over derived behavior.
4. **Latest version prevails:** When this document is versioned, the latest approved version is authoritative.

### 6.2 Known Rule Interactions

| Rules | Interaction | Resolution |
|-------|-------------|------------|
| RULE-RDR-005 + RULE-ASN-004 | Both restrict assignment creation | Both must pass; rider must be Available AND campaign must be in Recruiting Riders |
| RULE-CMP-007 + RULE-FIN-005 | Cancellation refund vs. daily escrow release | Upon cancellation, unreleased escrow is refunded; already-released amounts follow normal flow |
| RULE-VRF-004 + RULE-ASN-006 | Verification removal triggers replacement | Removal via third failure SHALL trigger RULE-ASN-006 replacement workflow |
| RULE-RDR-003 + RULE-ASN-002 | Both prevent concurrent assignment conflicts | RULE-ASN-002 is the enforcement point; RULE-RDR-003 defines the rider-level constraint |
| RULE-PAY-002 + RULE-PAY-001 | Minimum threshold vs. payout cycle | During payout cycle, riders below threshold are skipped; they remain eligible for the next cycle |

---

## 7. Error Codes

All error codes referenced by rules in this document are registered below. Each error code belongs to a domain and has a stable identifier.

| Error Code | Domain | Description | Triggering Rule(s) |
|------------|--------|-------------|---------------------|
| AUTH_001 | Authentication | Insufficient authorization for business verification | RULE-BIZ-003 |
| AUTH_002 | Authentication | Insufficient authorization for business suspension | RULE-BIZ-006 |
| AUTH_003 | Authentication | Insufficient authorization for business blacklisting | RULE-BIZ-007 |
| AUTH_004 | Authentication | Insufficient authorization for campaign pause | RULE-CMP-008 |
| AUTH_005 | Authentication | Insufficient authorization for campaign cancellation | RULE-CMP-009 |
| AUTH_006 | Authentication | Insufficient authorization for assignment creation | RULE-ASN-003 |
| AUTH_007 | Authentication | Insufficient authorization for verification approval | RULE-VRF-006 |
| AUTH_008 | Authentication | Insufficient authorization for document review | RULE-DOC-002 |
| AUTH_009 | Authentication | Insufficient authorization for zone management | RULE-ZON-002 |
| AUTH_010 | Authentication | Account locked due to excessive failed attempts | RULE-SEC-001 |
| BUSINESS_001 | Business | Invalid email for business registration | RULE-BIZ-001 |
| BUSINESS_002 | Business | Incomplete business document submission | RULE-BIZ-002 |
| BUSINESS_003 | Business | Business not in eligible status for campaign creation | RULE-BIZ-004 |
| BUSINESS_004 | Business | Blacklisted business attempting write operation | RULE-BIZ-008 |
| RIDER_001 | Rider | Invalid phone number for rider registration | RULE-RDR-001 |
| RIDER_002 | Rider | Incomplete rider document submission | RULE-RDR-002 |
| RIDER_003 | Rider | Concurrent campaign limit exceeded | RULE-RDR-003 |
| RIDER_004 | Rider | Suspended rider assignment attempt | RULE-RDR-004 |
| RIDER_005 | Rider | Rider not in Available status for assignment | RULE-RDR-005 |
| CAMPAIGN_001 | Campaign | Campaign duration below minimum | RULE-CMP-001 |
| CAMPAIGN_002 | Campaign | Campaign rider count below minimum | RULE-CMP-002 |
| CAMPAIGN_003 | Campaign | Campaign fulfillment threshold not met | RULE-CMP-004 |
| CAMPAIGN_004 | Campaign | Campaign workflow violation (skipped payment) | RULE-CMP-005 |
| CAMPAIGN_005 | Campaign | Invalid currency for campaign | RULE-CMP-010 |
| PAYMENT_001 | Payment | Escrow creation failure on payment verification | RULE-CMP-006 |
| PAYMENT_002 | Payment | Ledger balance violation (debits != credits) | RULE-FIN-004 |
| PAYMENT_003 | Payment | Attempt to modify immutable ledger entry | RULE-FIN-006 |
| PAYMENT_004 | Payment | Payout below minimum threshold | RULE-PAY-002 |
| PAYMENT_005 | Payment | Unsupported payout method | RULE-PAY-003 |
| PAYMENT_006 | Payment | Payout completed without proof | RULE-PAY-005 |
| PAYMENT_007 | Payment | Unsupported payment submission method | RULE-PAY-006 |
| ASSIGN_001 | Assignment | Rider zone does not match campaign target zones | RULE-ASN-001 |
| ASSIGN_002 | Assignment | Rider has conflicting active assignment | RULE-ASN-002 |
| ASSIGN_003 | Assignment | Campaign not in Recruiting Riders state | RULE-ASN-004 |
| ASSIGN_004 | Assignment | Assignment removal without documented reason | RULE-ASN-005 |
| STICKER_001 | Sticker | Sticker template without campaign creative link | RULE-STK-001 |
| STICKER_002 | Sticker | Print order missing required fields | RULE-STK-002 |
| STICKER_003 | Sticker | Sticker distribution without photographic proof | RULE-STK-003 |
| STICKER_004 | Sticker | Duplicate batch identifier | RULE-STK-005 |
| VERIFY_001 | Verification | Verification overdue | RULE-VRF-001 |
| VERIFY_002 | Verification | Second verification failure suspension | RULE-VRF-003 |
| VERIFY_003 | Verification | Third verification failure removal | RULE-VRF-004 |
| VERIFY_004 | Verification | Verification without photo submission | RULE-VRF-005 |
| ZONE_001 | Zone | Zone without any wards | RULE-ZON-001 |
| ZONE_002 | Zone | Ward outside geographic boundary | RULE-ZON-003 |
| ZONE_003 | Zone | Rider zone mismatch with campaign target | RULE-ZON-004 |
| DOC_001 | Document | Document expired requiring replacement | RULE-DOC-003 |
| DOC_002 | Document | Document rejection without reason | RULE-DOC-004 |
| MEDIA_001 | Media | File exceeds size or type limits | RULE-DOC-005 |
| CONFIG_001 | Configuration | Invalid configuration value | RULE-STK-006 |
| NOTIFY_001 | Notification | Real-time delivery failure | RULE-NTF-003 |
| SYSTEM_001 | System | Internal system error | N/A |

---

## 8. Acceptance Tests

The following acceptance tests validate the correct implementation of business rules. Each test references specific rules and provides a deterministic pass/fail condition.

### 8.1 Campaign Lifecycle Tests

| Test ID | Description | Rules Tested | Expected Result |
|---------|-------------|--------------|-----------------|
| AT-CMP-01 | Create campaign with 7-day duration | RULE-CMP-001 | Rejected with CAMPAIGN_001 |
| AT-CMP-02 | Create campaign with 50 riders | RULE-CMP-002 | Rejected with CAMPAIGN_002 |
| AT-CMP-03 | Create campaign with 100 riders for 15 days | RULE-CMP-001, RULE-CMP-002 | Accepted; cost = NPR 180,000 |
| AT-CMP-04 | Transition Draft campaign directly to Recruiting | RULE-CMP-005 | Rejected with CAMPAIGN_004 |
| AT-CMP-05 | Verify payment places full amount in escrow | RULE-CMP-006 | Escrow entry = total campaign cost |
| AT-CMP-06 | Campaign with 99/100 riders attempts Ready transition | RULE-CMP-004 | Rejected with CAMPAIGN_003 |
| AT-CMP-07 | Cancel campaign after 5 of 15 days | RULE-CMP-007 | Refund = 10/15 of escrow; commission retained on 5 days |
| AT-CMP-08 | Business user attempts to pause campaign | RULE-CMP-008 | Rejected with AUTH_004 |
| AT-CMP-09 | Operations Staff attempts to cancel Running campaign | RULE-CMP-009 | Rejected with AUTH_005 |
| AT-CMP-10 | Submit campaign in USD | RULE-CMP-010 | Rejected with CAMPAIGN_005 |

### 8.2 Rider and Assignment Tests

| Test ID | Description | Rules Tested | Expected Result |
|---------|-------------|--------------|-----------------|
| AT-RDR-01 | Register rider with invalid phone | RULE-RDR-001 | Rejected with RIDER_001 |
| AT-RDR-02 | Submit 3 of 4 required documents | RULE-RDR-002 | Remains in Pre-Registered |
| AT-RDR-03 | Assign rider with active helmet campaign | RULE-RDR-003, RULE-ASN-002 | Rejected with ASSIGN_002 |
| AT-RDR-04 | Assign Suspended rider | RULE-RDR-004 | Rejected with RIDER_004 |
| AT-RDR-05 | Assign rider in Documents Pending status | RULE-RDR-005 | Rejected with RIDER_005 |
| AT-RDR-06 | Calculate score for perfect rider | RULE-RDR-006 | Score = 100 |
| AT-RDR-07 | Rider withdraws mid-campaign | RULE-RDR-007, RULE-RDR-008 | Future earnings stop; replacement flagged |
| AT-ASN-01 | Assign rider from non-matching zone | RULE-ASN-001 | Rejected with ASSIGN_001 |
| AT-ASN-02 | Assign rider to Draft campaign | RULE-ASN-004 | Rejected with ASSIGN_003 |
| AT-ASN-03 | Remove rider without reason | RULE-ASN-005 | Rejected with ASSIGN_004 |

### 8.3 Financial Tests

| Test ID | Description | Rules Tested | Expected Result |
|---------|-------------|--------------|-----------------|
| AT-FIN-01 | 1 rider, 1 day campaign cost | RULE-FIN-001, RULE-CMP-003 | NPR 120 |
| AT-FIN-02 | 1 rider, 1 day earning | RULE-FIN-002 | NPR 100 |
| AT-FIN-03 | Platform commission for 1 rider-day | RULE-FIN-003 | NPR 20 |
| AT-FIN-04 | Create unbalanced ledger entry | RULE-FIN-004 | Rejected with PAYMENT_002 |
| AT-FIN-05 | Daily escrow release for 15-day, 100-rider campaign | RULE-FIN-005 | NPR 12,000 per day |
| AT-FIN-06 | Attempt UPDATE on ledger entry | RULE-FIN-006 | Rejected with PAYMENT_003 |
| AT-PAY-01 | Process payout for rider with NPR 400 balance | RULE-PAY-002 | Skipped with PAYMENT_004 |
| AT-PAY-02 | Select unsupported payout method | RULE-PAY-003 | Rejected with PAYMENT_005 |
| AT-PAY-03 | Complete payout without proof | RULE-PAY-005 | Rejected with PAYMENT_006 |
| AT-PAY-04 | Payout cycle execution | RULE-PAY-001 | Processes eligible riders every 15 days |

### 8.4 Verification Tests

| Test ID | Description | Rules Tested | Expected Result |
|---------|-------------|--------------|-----------------|
| AT-VRF-01 | Rider overdue by 8 days | RULE-VRF-001 | Flagged as overdue |
| AT-VRF-02 | First verification failure | RULE-VRF-002 | Warning issued; rider remains active |
| AT-VRF-03 | Second verification failure | RULE-VRF-003 | Temporary suspension applied |
| AT-VRF-04 | Third verification failure | RULE-VRF-004 | Rider removed from campaign |
| AT-VRF-05 | Verification without photo | RULE-VRF-005 | Rejected with VERIFY_004 |
| AT-VRF-06 | Rider attempts self-approval | RULE-VRF-006 | Rejected with AUTH_007 |

### 8.5 Security and Authorization Tests

| Test ID | Description | Rules Tested | Expected Result |
|---------|-------------|--------------|-----------------|
| AT-SEC-01 | 6 failed login attempts | RULE-SEC-001 | Account locked for 30 minutes |
| AT-SEC-02 | Admin attempts to create zone | RULE-ZON-002 | Rejected with AUTH_009 |
| AT-SEC-03 | Business attempts assignment creation | RULE-ASN-003 | Rejected with AUTH_006 |
| AT-SEC-04 | Admin attempts business blacklist | RULE-BIZ-007 | Rejected with AUTH_003 |
| AT-SEC-05 | Rider attempts document approval | RULE-DOC-002 | Rejected with AUTH_008 |

---

## 9. Requirement Traceability

The following matrix maps every rule in this document to its source requirements in Document 01 (Product Requirements Specification).

### 9.1 Forward Traceability (Rule to Requirement)

| Rule ID | Title | Source Requirements |
|---------|-------|---------------------|
| RULE-BIZ-001 | Business registration method | REQ-PRD-002, REQ-PRD-026 |
| RULE-BIZ-002 | Business document requirements | REQ-PRD-027 |
| RULE-BIZ-003 | Business verification authority | REQ-PRD-028, REQ-PRD-029 |
| RULE-BIZ-004 | Business campaign creation eligibility | REQ-PRD-031, REQ-PRD-034 |
| RULE-BIZ-005 | Business activation trigger | REQ-PRD-030 |
| RULE-BIZ-006 | Business suspension authority | REQ-PRD-032 |
| RULE-BIZ-007 | Business blacklist authority | REQ-PRD-033 |
| RULE-BIZ-008 | Blacklisted business restrictions | REQ-PRD-034 |
| RULE-RDR-001 | Rider registration method | REQ-PRD-001, REQ-PRD-012 |
| RULE-RDR-002 | Rider document requirements | REQ-PRD-013 |
| RULE-RDR-003 | Rider concurrent campaign limit | REQ-PRD-018, REQ-PRD-143 |
| RULE-RDR-004 | Suspended rider assignment restriction | REQ-PRD-020 |
| RULE-RDR-005 | Rider assignment eligibility | REQ-PRD-144 |
| RULE-RDR-006 | Rider reliability score calculation | REQ-PRD-017 |
| RULE-RDR-007 | Rider withdrawal policy | REQ-PRD-057 |
| RULE-RDR-008 | Rider replacement on withdrawal | REQ-PRD-057 |
| RULE-CMP-001 | Minimum campaign duration | REQ-PRD-040, REQ-PRD-133 |
| RULE-CMP-002 | Minimum campaign riders | REQ-PRD-039, REQ-PRD-134 |
| RULE-CMP-003 | Campaign cost calculation | REQ-PRD-042, REQ-PRD-128, REQ-PRD-132 |
| RULE-CMP-004 | Campaign fulfillment threshold | REQ-PRD-047, REQ-PRD-135 |
| RULE-CMP-005 | Campaign payment prerequisite | REQ-PRD-041, REQ-PRD-043 |
| RULE-CMP-006 | Campaign escrow on payment verification | REQ-PRD-045 |
| RULE-CMP-007 | Campaign cancellation refund | REQ-PRD-052 |
| RULE-CMP-008 | Campaign pause authority | REQ-PRD-050 |
| RULE-CMP-009 | Campaign cancellation authority | REQ-PRD-051 |
| RULE-CMP-010 | Campaign currency restriction | REQ-PRD-131 |
| RULE-ASN-001 | Assignment zone matching | REQ-PRD-055, REQ-PRD-145 |
| RULE-ASN-002 | Assignment conflict detection | REQ-PRD-056, REQ-PRD-143 |
| RULE-ASN-003 | Assignment authority | REQ-PRD-054 |
| RULE-ASN-004 | Assignment campaign state prerequisite | REQ-PRD-046, REQ-PRD-054 |
| RULE-ASN-005 | Assignment removal documentation | REQ-PRD-061 |
| RULE-ASN-006 | Assignment replacement recruitment | REQ-PRD-057 |
| RULE-STK-001 | Sticker template campaign link | REQ-PRD-063 |
| RULE-STK-002 | Print order minimum information | REQ-PRD-064 |
| RULE-STK-003 | Sticker distribution proof | REQ-PRD-068 |
| RULE-STK-004 | Sticker inventory tracking | REQ-PRD-067 |
| RULE-STK-005 | Sticker batch identification | REQ-PRD-066 |
| RULE-STK-006 | Asset type extensibility | REQ-PRD-063 |
| RULE-VRF-001 | Verification interval | REQ-PRD-069, REQ-PRD-136 |
| RULE-VRF-002 | First verification failure consequence | REQ-PRD-137 |
| RULE-VRF-003 | Second verification failure consequence | REQ-PRD-138 |
| RULE-VRF-004 | Third verification failure consequence | REQ-PRD-139 |
| RULE-VRF-005 | Verification photo requirement | REQ-PRD-069 |
| RULE-VRF-006 | Verification approval authority | REQ-PRD-070 |
| RULE-FIN-001 | Business daily rate | REQ-PRD-128 |
| RULE-FIN-002 | Rider daily earning rate | REQ-PRD-075, REQ-PRD-129 |
| RULE-FIN-003 | Platform commission derivation | REQ-PRD-076, REQ-PRD-130 |
| RULE-FIN-004 | Double-entry ledger requirement | REQ-PRD-071 |
| RULE-FIN-005 | Escrow daily release | REQ-PRD-072, REQ-PRD-073 |
| RULE-FIN-006 | Ledger immutability | REQ-PRD-155 |
| RULE-FIN-007 | Ledger account structure | REQ-PRD-071 |
| RULE-PAY-001 | Payout cycle frequency | REQ-PRD-077, REQ-PRD-140 |
| RULE-PAY-002 | Minimum payout threshold | REQ-PRD-078, REQ-PRD-141 |
| RULE-PAY-003 | Supported payout methods | REQ-PRD-079, REQ-PRD-142 |
| RULE-PAY-004 | Manual payout verification | REQ-PRD-080 |
| RULE-PAY-005 | Payout proof requirement | REQ-PRD-080, REQ-PRD-085 |
| RULE-PAY-006 | Payment submission methods | REQ-PRD-084 |
| RULE-PAY-007 | Manual payment verification | REQ-PRD-085 |
| RULE-NTF-001 | Event-driven notification triggers | REQ-PRD-090 |
| RULE-NTF-002 | Notification delivery channels | REQ-PRD-086, REQ-PRD-087 |
| RULE-NTF-003 | Real-time notification delivery | REQ-PRD-092 |
| RULE-NTF-004 | Notification user preferences | REQ-PRD-091 |
| RULE-DOC-001 | Document expiry reminder schedule | REQ-PRD-024 |
| RULE-DOC-002 | Document review authority | REQ-PRD-014, REQ-PRD-028 |
| RULE-DOC-003 | Document re-verification on expiry | REQ-PRD-024 |
| RULE-DOC-004 | Document rejection with reason | REQ-PRD-014, REQ-PRD-029 |
| RULE-DOC-005 | Document file validation | REQ-PRD-110 |
| RULE-ZON-001 | Zone definition structure | REQ-PRD-146 |
| RULE-ZON-002 | Zone management authority | REQ-PRD-147 |
| RULE-ZON-003 | Geographic boundary restriction | REQ-PRD-146 |
| RULE-ZON-004 | Zone-based rider matching | REQ-PRD-055, REQ-PRD-145 |
| RULE-SEC-001 | Account lockout on failed attempts | REQ-PRD-007 |

### 9.2 Downstream Document References

This document is referenced by the following downstream specifications:

| Downstream Document | Referencing Rules |
|--------------------|-------------------|
| 03. Domain Model | All RULE-* (entity behaviors) |
| 04. System Architecture | RULE-SYS-*, RULE-CFG-* |
| 05. Data Model | RULE-FIN-004, RULE-FIN-006, RULE-FIN-007 |
| 06. Configuration and Dictionary | All CONFIGURATION taxonomy rules |
| 07. Authentication and Permissions | RULE-SEC-001, RULE-BIZ-003 through RULE-BIZ-007, all AUTH_0XX errors |
| 08. API Specification | All VALIDATION and WORKFLOW rules (enforced at API layer) |
| 12. Campaign and Assignment | RULE-CMP-*, RULE-ASN-* |
| 13. Financial Platform | RULE-FIN-*, RULE-PAY-* |
| 17. Testing Strategy | Section 8 acceptance tests |

### 9.3 Reverse Traceability (Requirement to Rules)

| Requirement Range | Domain | Covering Rules |
|-------------------|--------|----------------|
| REQ-PRD-001 to REQ-PRD-010 | Identity and Authentication | RULE-BIZ-001, RULE-RDR-001, RULE-SEC-001 |
| REQ-PRD-011 to REQ-PRD-024 | Rider Domain | RULE-RDR-001 through RULE-RDR-008, RULE-DOC-001 |
| REQ-PRD-025 to REQ-PRD-035 | Business Domain | RULE-BIZ-001 through RULE-BIZ-008 |
| REQ-PRD-036 to REQ-PRD-053 | Campaign Domain | RULE-CMP-001 through RULE-CMP-010 |
| REQ-PRD-054 to REQ-PRD-062 | Assignment Domain | RULE-ASN-001 through RULE-ASN-006 |
| REQ-PRD-063 to REQ-PRD-070 | Sticker Inventory | RULE-STK-001 through RULE-STK-006, RULE-VRF-005, RULE-VRF-006 |
| REQ-PRD-071 to REQ-PRD-085 | Financial Platform | RULE-FIN-001 through RULE-FIN-007, RULE-PAY-001 through RULE-PAY-007 |
| REQ-PRD-086 to REQ-PRD-092 | Notification Domain | RULE-NTF-001 through RULE-NTF-004 |
| REQ-PRD-128 to REQ-PRD-147 | Business Rules | All RULE-CMP-*, RULE-VRF-*, RULE-PAY-*, RULE-RDR-003, RULE-ZON-* |

### 9.4 Rule Statistics

| Metric | Value |
|--------|-------|
| Total Rules | 72 |
| VALIDATION rules | 19 |
| CALCULATION rules | 7 |
| WORKFLOW rules | 13 |
| SECURITY rules | 10 |
| COMPLIANCE rules | 7 |
| CONFIGURATION rules | 8 |
| SYSTEM rules | 8 |
| Configuration keys defined | 27 |
| Error codes defined | 52 |
| Acceptance tests defined | 41 |

---

*End of Document 02 - Business Rules Engine*
