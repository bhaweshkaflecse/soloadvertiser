# Document 01 - Product Requirements Specification

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  

---

## 1. Purpose

This document defines the complete product-level requirements for the Solo Advertiser MVP platform. It serves as the authoritative contract specification against which all design, implementation, and testing activities SHALL be validated.

Solo Advertiser is a managed advertising operations platform connecting verified businesses with verified ride-sharing motorcycle riders through removable helmet and asset advertisements. The platform manages ALL operations end-to-end: recruitment, verification, printing, distribution, compliance monitoring, and payment processing.

This document is the first in a series of 18 specification documents and establishes the foundational requirements that all subsequent documents SHALL trace back to.

---

## 2. Scope

### 2.1 In Scope (MVP)

| Dimension | Boundary |
|-----------|----------|
| Geography | Kathmandu Valley, Nepal |
| Currency | NPR (Nepalese Rupee) only |
| Language | English (system), Nepali (user-facing content) |
| Operations Model | Fully managed (no self-serve) |
| Rider Scale | 8,000 - 15,000 riders |
| Business Scale | 500 - 1,500 businesses |
| Deployment | Single Contabo VPS 6 (6 vCPU, 12GB RAM, 200GB SSD) |
| Asset Types | Helmet stickers only |
| Matching | Manual (operations staff driven) |
| Payment Processing | Manual verification (no gateway SDK integration) |

### 2.2 Geographic Boundaries

The platform SHALL operate exclusively within Kathmandu Valley wards. Zone definitions SHALL be ward-based and managed exclusively through the Super Admin Panel.

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| Asset | A physical surface on which an advertisement can be placed (MVP: helmet only) |
| Assignment | The binding of a specific rider to a specific campaign for a defined duration |
| Business | A verified commercial entity that purchases advertising campaigns |
| Campaign | A time-bound advertising engagement linking a business's creative to a set of assigned riders |
| Creative | The advertisement design/artwork submitted by a business for printing |
| Escrow | Funds held by the platform on behalf of a business, released incrementally as campaign days complete |
| Fulfillment | The percentage of required rider-days actually delivered in a campaign |
| Ledger | The immutable financial record of all monetary transactions on the platform |
| Payout | The transfer of earned funds from the platform wallet to a rider's external account |
| Reliability Score | A composite metric (0-100) measuring rider performance across five dimensions |
| Rider | A verified motorcycle ride-sharing driver who carries advertisements on their helmet |
| Sticker | The printed advertisement material applied to a rider's helmet |
| Verification | The periodic process of confirming a rider is actively displaying the assigned sticker |
| Ward | An administrative subdivision within Kathmandu Valley used for zone definitions |
| Zone | A geographic operating area defined by one or more wards |
| Wallet | A platform-managed balance representing a rider's accumulated earnings |
| Domain Event | A record of a significant state change within any platform module |
| Timeline | An auto-generated chronological view of all events related to a specific entity |
| Feature Flag | A configuration toggle that controls availability of platform features |
| Dictionary | A centralized key-value store for UI labels, validation messages, and configurable text |

---

## 4. Actors

| Actor | Type | Description |
|-------|------|-------------|
| Rider | Human | Motorcycle ride-sharing driver who registers, gets verified, and carries helmet advertisements |
| Business | Human | Commercial entity representative who registers, gets verified, and purchases advertising campaigns |
| Operations Staff | Human | Platform employee managing day-to-day operations: rider/business verification, campaign management, assignment |
| Finance Staff | Human | Platform employee managing financial operations: payment verification, payouts, reconciliation |
| Admin | Human | Platform administrator with elevated privileges for system configuration and oversight |
| Super Admin | Human | Highest-privilege platform administrator with full system access including zone management and feature flags |
| System | Automated | Platform automation performing scheduled tasks: verification reminders, payout cycles, notifications, score calculations |

---

## 5. Functional Requirements

### 5.1 Identity and Authentication

| ID | Requirement |
|----|-------------|
| REQ-PRD-001 | The system SHALL provide phone-number-based registration for Riders via OTP verification. |
| REQ-PRD-002 | The system SHALL provide email-based registration for Business users with email verification. |
| REQ-PRD-003 | The system SHALL support JWT-based authentication with access and refresh token pairs. |
| REQ-PRD-004 | The system SHALL enforce role-based access control (RBAC) with roles: Rider, Business, Operations Staff, Finance Staff, Admin, Super Admin. |
| REQ-PRD-005 | The system SHALL invalidate all active sessions when a user's account is suspended. |
| REQ-PRD-006 | The system SHALL log all authentication events (login, logout, token refresh, failed attempts) to the audit trail. |
| REQ-PRD-007 | The system SHALL lock an account after 5 consecutive failed authentication attempts for a configurable duration. |
| REQ-PRD-008 | The system SHALL support device-based session management allowing users to view and revoke active sessions. |
| REQ-PRD-009 | Staff accounts (Operations, Finance, Admin, Super Admin) SHALL only be created by a Super Admin. |
| REQ-PRD-010 | The system SHALL enforce password complexity rules for email-based accounts (minimum 8 characters, mixed case, numeric). |

### 5.2 Rider Domain

| ID | Requirement |
|----|-------------|
| REQ-PRD-011 | The system SHALL support the complete Rider pipeline: Pre-Registered, Documents Pending, Verification Pending, Approved, Available, Assigned, Campaign Active, Unavailable, Suspended. |
| REQ-PRD-012 | A Rider SHALL transition to "Pre-Registered" status upon successful phone number verification. |
| REQ-PRD-013 | A Rider SHALL provide mandatory documents (citizenship/license, vehicle registration, profile photo, helmet photo) to transition from Pre-Registered to Documents Pending. |
| REQ-PRD-014 | Operations Staff SHALL manually review rider documents and transition the rider from Documents Pending to Verification Pending or back to Documents Pending with rejection reason. |
| REQ-PRD-015 | Operations Staff SHALL approve or reject a rider's verification, transitioning them from Verification Pending to Approved or back to Documents Pending. |
| REQ-PRD-016 | An Approved Rider SHALL be marked as Available when they opt in to receive campaign assignments. |
| REQ-PRD-017 | The system SHALL calculate a Rider Reliability Score (0-100) based on five components: Verification compliance, Attendance, Activity, Completion rate, and Response time. |
| REQ-PRD-018 | A Rider SHALL NOT be assigned to more than one campaign per asset simultaneously. |
| REQ-PRD-019 | The system SHALL allow Operations Staff to suspend a rider with a documented reason. |
| REQ-PRD-020 | A Suspended Rider SHALL NOT receive new campaign assignments. |
| REQ-PRD-021 | The system SHALL track rider zone assignments based on ward definitions. |
| REQ-PRD-022 | A Rider SHALL be able to update their availability status (Available/Unavailable) at any time when not in an active assignment. |
| REQ-PRD-023 | The system SHALL maintain a complete rider profile including personal information, vehicle details, zone preferences, and bank/payment details. |
| REQ-PRD-024 | The system SHALL support rider document re-verification when documents expire or are flagged. |

### 5.3 Business Domain

| ID | Requirement |
|----|-------------|
| REQ-PRD-025 | The system SHALL support the complete Business pipeline: Registered, Documents Pending, Under Review, Verified, Active, Suspended, Blacklisted. |
| REQ-PRD-026 | A Business SHALL transition to "Registered" status upon successful email verification. |
| REQ-PRD-027 | A Business SHALL provide mandatory documents (PAN/VAT certificate, business registration, authorized representative ID) to transition from Registered to Documents Pending. |
| REQ-PRD-028 | Operations Staff SHALL manually review business documents and transition the business from Documents Pending to Under Review. |
| REQ-PRD-029 | Operations Staff SHALL verify or reject a business, transitioning from Under Review to Verified or back to Documents Pending with rejection reason. |
| REQ-PRD-030 | A Verified Business SHALL be marked as Active upon first successful campaign creation. |
| REQ-PRD-031 | A Business SHALL NOT create campaigns unless in Verified or Active status. |
| REQ-PRD-032 | The system SHALL allow Operations Staff or Admin to suspend a business with a documented reason. |
| REQ-PRD-033 | The system SHALL allow Super Admin to blacklist a business, permanently preventing further platform access. |
| REQ-PRD-034 | A Suspended or Blacklisted Business SHALL NOT create new campaigns. |
| REQ-PRD-035 | The system SHALL maintain a complete business profile including company information, contact details, billing information, and campaign history. |

### 5.4 Campaign Domain

| ID | Requirement |
|----|-------------|
| REQ-PRD-036 | The system SHALL support the complete Campaign lifecycle: Draft, Pending Payment, Payment Submitted, Payment Verified, Recruiting Riders, Ready, Running, Completed, Paused, Cancelled. |
| REQ-PRD-037 | A Campaign SHALL be created by an Active or Verified Business and begin in Draft status. |
| REQ-PRD-038 | A Campaign SHALL specify: name, creative design, target zones, required number of riders, start date, end date, and duration. |
| REQ-PRD-039 | A Campaign SHALL require a minimum of 100 riders. |
| REQ-PRD-040 | A Campaign SHALL require a minimum duration of 15 days. |
| REQ-PRD-041 | A Campaign SHALL transition from Draft to Pending Payment when the business confirms campaign details. |
| REQ-PRD-042 | The system SHALL calculate the total campaign cost as: number_of_riders x duration_days x NPR 120/rider/day. |
| REQ-PRD-043 | A Campaign SHALL transition from Pending Payment to Payment Submitted when the business submits payment proof. |
| REQ-PRD-044 | Finance Staff SHALL verify the payment and transition the campaign from Payment Submitted to Payment Verified. |
| REQ-PRD-045 | Upon payment verification, the full campaign amount SHALL be placed in escrow. |
| REQ-PRD-046 | A Payment Verified Campaign SHALL transition to Recruiting Riders, enabling Operations Staff to assign riders. |
| REQ-PRD-047 | A Campaign SHALL transition from Recruiting Riders to Ready when 100% of required riders have been assigned. |
| REQ-PRD-048 | A Ready Campaign SHALL transition to Running on the configured start date. |
| REQ-PRD-049 | A Running Campaign SHALL transition to Completed when the end date is reached. |
| REQ-PRD-050 | Operations Staff or Admin SHALL be able to Pause a Running Campaign with a documented reason. |
| REQ-PRD-051 | Operations Staff or Admin SHALL be able to Cancel a Campaign in any pre-Running state. |
| REQ-PRD-052 | The system SHALL support campaign cancellation with appropriate escrow refund calculations. |
| REQ-PRD-053 | The system SHALL track campaign fulfillment percentage in real-time during the Running state. |

### 5.5 Assignment Domain

| ID | Requirement |
|----|-------------|
| REQ-PRD-054 | Operations Staff SHALL manually match and assign Available riders to campaigns in Recruiting Riders state. |
| REQ-PRD-055 | The system SHALL validate that assigned riders meet campaign zone requirements. |
| REQ-PRD-056 | The system SHALL validate that assigned riders do not have conflicting active assignments on the same asset. |
| REQ-PRD-057 | The system SHALL support rider replacement when an assigned rider becomes unavailable or is removed. |
| REQ-PRD-058 | The system SHALL track individual rider assignment fulfillment (days completed vs. days required). |
| REQ-PRD-059 | The system SHALL calculate rider scores upon assignment completion. |
| REQ-PRD-060 | The system SHALL notify riders upon new assignment creation. |
| REQ-PRD-061 | The system SHALL allow Operations Staff to remove a rider from an assignment with a documented reason. |
| REQ-PRD-062 | The system SHALL maintain assignment history for both riders and campaigns. |

### 5.6 Sticker Inventory

| ID | Requirement |
|----|-------------|
| REQ-PRD-063 | The system SHALL manage sticker templates linked to campaign creatives. |
| REQ-PRD-064 | The system SHALL support print order creation specifying vendor, quantity, template, and expected delivery date. |
| REQ-PRD-065 | The system SHALL track print vendors with contact information and performance history. |
| REQ-PRD-066 | The system SHALL track sticker batches with unique batch identifiers. |
| REQ-PRD-067 | The system SHALL maintain real-time sticker inventory counts per campaign (total printed, distributed, damaged, returned). |
| REQ-PRD-068 | The system SHALL record sticker distribution to individual riders with photographic proof. |
| REQ-PRD-069 | The system SHALL support sticker verification through photo submissions by riders. |
| REQ-PRD-070 | Operations Staff SHALL verify sticker distribution and condition through the Admin Panel. |

### 5.7 Financial Platform

| ID | Requirement |
|----|-------------|
| REQ-PRD-071 | The system SHALL maintain a double-entry ledger for all financial transactions. |
| REQ-PRD-072 | The system SHALL hold campaign funds in escrow until daily release based on completed campaign days. |
| REQ-PRD-073 | Escrow SHALL be released daily: for each completed campaign day, (total_escrow / total_days) SHALL be released. |
| REQ-PRD-074 | The system SHALL maintain an individual wallet balance for each rider. |
| REQ-PRD-075 | Rider earnings SHALL be calculated at NPR 100/rider/day for each completed campaign day. |
| REQ-PRD-076 | Platform commission SHALL be the difference between business rate (NPR 120/rider/day) and rider rate (NPR 100/rider/day), approximately 16.67%. |
| REQ-PRD-077 | The system SHALL process rider payouts on a 15-day cycle. |
| REQ-PRD-078 | A payout SHALL NOT be processed if the rider's wallet balance is below NPR 500. |
| REQ-PRD-079 | The system SHALL support payout methods: eSewa, Khalti, Bank Transfer, IME Pay. |
| REQ-PRD-080 | Finance Staff SHALL manually verify and approve payout batches. |
| REQ-PRD-081 | The system SHALL generate invoices for businesses upon campaign payment verification. |
| REQ-PRD-082 | The system SHALL support financial reconciliation reports for Finance Staff. |
| REQ-PRD-083 | The system SHALL maintain complete financial audit trails for all monetary operations. |
| REQ-PRD-084 | The system SHALL support payment submission via eSewa, Khalti, Bank Transfer, and IME Pay. |
| REQ-PRD-085 | Finance Staff SHALL manually verify payment submissions against bank/payment provider records. |

### 5.8 Notification Domain

| ID | Requirement |
|----|-------------|
| REQ-PRD-086 | The system SHALL support push notifications to the Rider Mobile App. |
| REQ-PRD-087 | The system SHALL support in-app notifications for all platform applications. |
| REQ-PRD-088 | The system SHALL maintain a notification center per user with read/unread status. |
| REQ-PRD-089 | The system SHALL use versioned notification templates for consistent messaging. |
| REQ-PRD-090 | The system SHALL trigger notifications based on domain events (state changes, assignments, verifications, payouts). |
| REQ-PRD-091 | The system SHALL support notification preferences allowing users to control notification channels. |
| REQ-PRD-092 | The system SHALL deliver real-time notifications via WebSocket (Socket.IO) to connected clients. |

### 5.9 Configuration Service

| ID | Requirement |
|----|-------------|
| REQ-PRD-093 | The system SHALL provide a centralized configuration service for all platform settings. |
| REQ-PRD-094 | The system SHALL support feature flags to control feature availability without deployment. |
| REQ-PRD-095 | The system SHALL maintain a dictionary service for UI labels, validation messages, and configurable text. |
| REQ-PRD-096 | Configuration changes SHALL be propagated to connected clients in real-time via WebSocket. |
| REQ-PRD-097 | Super Admin SHALL be the only role authorized to modify system configuration and feature flags. |
| REQ-PRD-098 | The system SHALL maintain a history of all configuration changes with before/after values. |

### 5.10 Audit Domain

| ID | Requirement |
|----|-------------|
| REQ-PRD-099 | The system SHALL maintain an immutable audit log for all significant platform operations. |
| REQ-PRD-100 | Each audit entry SHALL record: Who (actor), What (action), Before (previous state), After (new state), Reason (justification), IP (source address), Device (user agent), Time (timestamp). |
| REQ-PRD-101 | Audit records SHALL NOT be modifiable or deletable by any user, including Super Admin. |
| REQ-PRD-102 | The system SHALL support audit log querying by actor, action type, entity, and time range. |
| REQ-PRD-103 | The system SHALL retain audit logs for a minimum of 3 years. |

### 5.11 Timeline Service

| ID | Requirement |
|----|-------------|
| REQ-PRD-104 | The system SHALL auto-generate timeline entries from domain events for every tracked entity. |
| REQ-PRD-105 | Timelines SHALL be queryable per entity (rider, business, campaign, assignment). |
| REQ-PRD-106 | Each timeline entry SHALL include: event type, timestamp, actor, description, and related entity references. |
| REQ-PRD-107 | The system SHALL display entity timelines in the Admin Panel and Super Admin Panel. |

### 5.12 Media Service

| ID | Requirement |
|----|-------------|
| REQ-PRD-108 | The system SHALL provide centralized file upload and management via Cloudflare R2 storage. |
| REQ-PRD-109 | The system SHALL support image uploads for: rider documents, business documents, campaign creatives, sticker verification photos, and profile photos. |
| REQ-PRD-110 | The system SHALL validate file types and sizes before upload (configurable limits). |
| REQ-PRD-111 | The system SHALL generate optimized variants (thumbnails, compressed) for uploaded images. |
| REQ-PRD-112 | The system SHALL associate uploaded media with their parent entities via reference metadata. |
| REQ-PRD-113 | The system SHALL support signed URL generation for secure, time-limited file access. |

### 5.13 Support Domain

| ID | Requirement |
|----|-------------|
| REQ-PRD-114 | The system SHALL support ticket creation by Riders and Businesses for issue reporting. |
| REQ-PRD-115 | The system SHALL categorize support tickets by type (technical, financial, campaign, verification, general). |
| REQ-PRD-116 | Operations Staff SHALL manage and respond to support tickets via the Admin Panel. |
| REQ-PRD-117 | The system SHALL support dispute creation for financial or campaign-related disagreements. |
| REQ-PRD-118 | The system SHALL track ticket status: Open, In Progress, Awaiting Response, Resolved, Closed. |
| REQ-PRD-119 | The system SHALL maintain complete conversation history within each ticket. |
| REQ-PRD-120 | The system SHALL enforce SLA tracking for ticket response and resolution times (configurable). |

### 5.14 Analytics Domain

| ID | Requirement |
|----|-------------|
| REQ-PRD-121 | The system SHALL provide operational metrics dashboards in the Admin Panel. |
| REQ-PRD-122 | The system SHALL track key metrics: active campaigns, active riders, revenue, fulfillment rates, verification compliance. |
| REQ-PRD-123 | The system SHALL provide campaign performance reports for Businesses via the Business Portal. |
| REQ-PRD-124 | The system SHALL support data export in CSV and PDF formats for reports. |
| REQ-PRD-125 | The system SHALL provide financial reports: revenue summaries, payout summaries, outstanding balances, commission earned. |
| REQ-PRD-126 | The system SHALL provide rider performance analytics: average reliability scores, zone distribution, activity patterns. |
| REQ-PRD-127 | Super Admin SHALL have access to platform-wide analytics including growth metrics and financial summaries. |

---

## 6. Business Rules


### 6.1 Pricing and Commission

| Rule ID | Rule | Value |
|---------|------|-------|
| REQ-PRD-128 | Business daily rate per rider SHALL be fixed at | NPR 120/rider/day |
| REQ-PRD-129 | Rider daily earning rate SHALL be fixed at | NPR 100/rider/day |
| REQ-PRD-130 | Platform commission SHALL be the difference between business rate and rider rate | ~16.67% (NPR 20/rider/day) |
| REQ-PRD-131 | All monetary values SHALL be in NPR (Nepalese Rupee) only | NPR |
| REQ-PRD-132 | Campaign total cost SHALL be calculated as: riders x days x NPR 120 | Formula locked |

### 6.2 Campaign Minimums

| Rule ID | Rule | Value |
|---------|------|-------|
| REQ-PRD-133 | Minimum campaign duration SHALL be | 15 days |
| REQ-PRD-134 | Minimum number of riders per campaign SHALL be | 100 riders |
| REQ-PRD-135 | Campaign fulfillment threshold SHALL be | 100% |

### 6.3 Verification and Compliance

| Rule ID | Rule | Value |
|---------|------|-------|
| REQ-PRD-136 | Sticker verification interval SHALL be | Every 7 days |
| REQ-PRD-137 | First verification failure SHALL result in | Warning |
| REQ-PRD-138 | Second verification failure SHALL result in | Temporary suspension |
| REQ-PRD-139 | Third verification failure SHALL result in | Campaign removal |

### 6.4 Payout Rules

| Rule ID | Rule | Value |
|---------|------|-------|
| REQ-PRD-140 | Payout processing cycle SHALL be | Every 15 days |
| REQ-PRD-141 | Minimum payout threshold SHALL be | NPR 500 |
| REQ-PRD-142 | Supported payment methods SHALL be | eSewa, Khalti, Bank Transfer, IME Pay |

### 6.5 Assignment Constraints

| Rule ID | Rule | Value |
|---------|------|-------|
| REQ-PRD-143 | Maximum concurrent campaigns per rider per asset SHALL be | 1 |
| REQ-PRD-144 | Rider assignment SHALL only occur for riders in Available status | Enforced |
| REQ-PRD-145 | Zone matching SHALL be based on ward-level definitions | Ward-based |

### 6.6 Zone Management

| Rule ID | Rule | Value |
|---------|------|-------|
| REQ-PRD-146 | Zone definitions SHALL be ward-based | Kathmandu Valley wards |
| REQ-PRD-147 | Zone management SHALL be restricted to Super Admin only | Super Admin exclusive |

---

## 7. State Machines

### 7.1 Rider State Machine

```
Pre-Registered --> Documents Pending --> Verification Pending --> Approved --> Available --> Assigned --> Campaign Active
                                                                     |            |                          |
                                                                     v            v                          v
                                                                 Unavailable  Unavailable               Unavailable
                                                                     |            |                          |
                                                                     v            v                          v
                                                                 Suspended    Suspended                  Suspended
```

| From State | To State | Trigger | Actor |
|------------|----------|---------|-------|
| (New) | Pre-Registered | Phone verification complete | System |
| Pre-Registered | Documents Pending | Rider submits required documents | Rider |
| Documents Pending | Verification Pending | Operations reviews documents, all valid | Operations Staff |
| Documents Pending | Documents Pending | Documents rejected, rider resubmits | Operations Staff |
| Verification Pending | Approved | Operations approves rider identity | Operations Staff |
| Verification Pending | Documents Pending | Verification rejected | Operations Staff |
| Approved | Available | Rider opts in for assignments | Rider |
| Available | Assigned | Rider matched to a campaign | Operations Staff |
| Assigned | Campaign Active | Campaign start date reached | System |
| Campaign Active | Available | Campaign completed or rider released | System/Operations Staff |
| Available | Unavailable | Rider opts out | Rider |
| Assigned | Unavailable | Rider removed from assignment before start | Operations Staff |
| Campaign Active | Unavailable | Rider removed mid-campaign | Operations Staff |
| Unavailable | Available | Rider opts back in | Rider |
| Any Active State | Suspended | Policy violation or compliance failure | Operations Staff/Admin |
| Suspended | Approved | Suspension lifted after review | Admin |

### 7.2 Business State Machine

```
Registered --> Documents Pending --> Under Review --> Verified --> Active
                                                        |           |
                                                        v           v
                                                    Suspended   Suspended --> Blacklisted
```

| From State | To State | Trigger | Actor |
|------------|----------|---------|-------|
| (New) | Registered | Email verification complete | System |
| Registered | Documents Pending | Business submits required documents | Business |
| Documents Pending | Under Review | Operations receives documents for review | Operations Staff |
| Documents Pending | Documents Pending | Documents rejected, business resubmits | Operations Staff |
| Under Review | Verified | Operations approves business | Operations Staff |
| Under Review | Documents Pending | Verification rejected | Operations Staff |
| Verified | Active | First campaign created | System |
| Active | Suspended | Policy violation or compliance issue | Operations Staff/Admin |
| Verified | Suspended | Policy violation or compliance issue | Operations Staff/Admin |
| Suspended | Verified | Suspension lifted after review | Admin |
| Suspended | Blacklisted | Permanent ban decision | Super Admin |

### 7.3 Campaign State Machine

```
Draft --> Pending Payment --> Payment Submitted --> Payment Verified --> Recruiting Riders --> Ready --> Running --> Completed
  |                                                                                                       |   |
  v                                                                                                       v   v
Cancelled                                                                                             Paused Cancelled
```

| From State | To State | Trigger | Actor |
|------------|----------|---------|-------|
| (New) | Draft | Business creates campaign | Business |
| Draft | Pending Payment | Business confirms campaign details | Business |
| Draft | Cancelled | Business cancels draft | Business |
| Pending Payment | Payment Submitted | Business submits payment proof | Business |
| Pending Payment | Cancelled | Payment not received within deadline | System/Operations Staff |
| Payment Submitted | Payment Verified | Finance verifies payment | Finance Staff |
| Payment Submitted | Pending Payment | Payment verification failed | Finance Staff |
| Payment Verified | Recruiting Riders | System initiates rider recruitment | System |
| Recruiting Riders | Ready | 100% riders assigned | System |
| Recruiting Riders | Cancelled | Unable to fill, business agrees to cancel | Operations Staff |
| Ready | Running | Campaign start date reached | System |
| Running | Completed | Campaign end date reached | System |
| Running | Paused | Operational issue requires pause | Operations Staff/Admin |
| Running | Cancelled | Critical issue requires cancellation | Admin |
| Paused | Running | Issue resolved, campaign resumes | Operations Staff/Admin |
| Paused | Cancelled | Issue unresolvable | Admin |

---

## 8. Data Requirements

### 8.1 Core Data Entities

| Entity | Description | Key Relationships |
|--------|-------------|-------------------|
| User | Base identity for all platform participants | Has Role, Has Sessions |
| Rider | Extended rider profile and operational data | Belongs to User, Has Documents, Has Assignments, Has Wallet |
| Business | Extended business profile and billing data | Belongs to User, Has Documents, Has Campaigns |
| Campaign | Advertising campaign with lifecycle | Belongs to Business, Has Assignments, Has Sticker Orders |
| Assignment | Rider-to-campaign binding | Links Rider and Campaign |
| Sticker Template | Creative design specification | Belongs to Campaign |
| Print Order | Manufacturing order for stickers | References Template, Vendor |
| Sticker Batch | Physical batch of printed stickers | Belongs to Print Order |
| Ledger Entry | Financial transaction record | References multiple entities |
| Escrow | Held campaign funds | Belongs to Campaign |
| Wallet | Rider earnings balance | Belongs to Rider |
| Payout | Disbursement to rider | Belongs to Wallet |
| Notification | Message to user | Belongs to User |
| Audit Log | Immutable operation record | References Actor, Entity |
| Timeline Entry | Entity event record | References Entity |
| Support Ticket | Issue or dispute record | Belongs to User |
| Configuration | System setting | Global |
| Feature Flag | Feature toggle | Global |
| Zone | Geographic operating area | Contains Wards |

### 8.2 Data Storage Patterns

| ID | Requirement |
|----|-------------|
| REQ-PRD-148 | The system SHALL use PostgreSQL as the sole relational database. |
| REQ-PRD-149 | The system SHALL use JSONB columns for flexible metadata, configuration data, and audit trail details. |
| REQ-PRD-150 | The system SHALL implement soft deletes for business entities (riders, businesses, campaigns). |
| REQ-PRD-151 | All entities SHALL include standard audit fields: created_at, updated_at, created_by, updated_by. |
| REQ-PRD-152 | The system SHALL use Redis for caching frequently accessed data (configurations, feature flags, active sessions). |
| REQ-PRD-153 | The system SHALL use Redis for job queue management (notifications, scheduled tasks, payout processing). |
| REQ-PRD-154 | The system SHALL store all uploaded files in Cloudflare R2 with metadata references in PostgreSQL. |

### 8.3 Data Integrity

| ID | Requirement |
|----|-------------|
| REQ-PRD-155 | Financial ledger entries SHALL be append-only; corrections SHALL be made via compensating entries. |
| REQ-PRD-156 | Audit log entries SHALL be immutable; no UPDATE or DELETE operations SHALL be permitted. |
| REQ-PRD-157 | The system SHALL enforce referential integrity via foreign keys for all entity relationships. |
| REQ-PRD-158 | The system SHALL use database transactions for operations spanning multiple tables. |

---

## 9. API Impact

### 9.1 API Design Standards

| ID | Requirement |
|----|-------------|
| REQ-PRD-159 | All APIs SHALL follow REST conventions with JSON request/response bodies. |
| REQ-PRD-160 | All APIs SHALL be versioned under the /api/v1/ prefix. |
| REQ-PRD-161 | The system SHALL provide OpenAPI 3.1 specification documentation for all endpoints. |
| REQ-PRD-162 | All API errors SHALL use structured error codes following domain-prefixed pattern (e.g., CAMPAIGN_001, PAYMENT_004, RIDER_012). |
| REQ-PRD-163 | All list endpoints SHALL support pagination with cursor-based or offset pagination. |
| REQ-PRD-164 | All API responses SHALL include standard envelope: { success, data, error, meta }. |

### 9.2 Domain API Categories

| Domain | Endpoint Prefix | Primary Operations |
|--------|----------------|-------------------|
| Auth | /api/v1/auth | Login, register, refresh, logout, sessions |
| Riders | /api/v1/riders | CRUD, status transitions, documents, assignments |
| Businesses | /api/v1/businesses | CRUD, status transitions, documents, campaigns |
| Campaigns | /api/v1/campaigns | CRUD, lifecycle transitions, assignments, stickers |
| Assignments | /api/v1/assignments | Create, update, complete, replace |
| Stickers | /api/v1/stickers | Templates, orders, batches, distribution, verification |
| Finance | /api/v1/finance | Ledger, escrow, wallets, payouts, invoices |
| Notifications | /api/v1/notifications | List, mark read, preferences |
| Configuration | /api/v1/config | Settings, feature flags, dictionary |
| Audit | /api/v1/audit | Query logs (read-only) |
| Timeline | /api/v1/timeline | Query entity timelines (read-only) |
| Media | /api/v1/media | Upload, retrieve, delete |
| Support | /api/v1/support | Tickets, responses, disputes |
| Analytics | /api/v1/analytics | Metrics, reports, export |
| Zones | /api/v1/zones | CRUD zones and ward mappings |

### 9.3 Real-time Communication

| ID | Requirement |
|----|-------------|
| REQ-PRD-165 | The system SHALL provide real-time updates via Socket.IO for: notifications, configuration changes, and campaign status updates. |
| REQ-PRD-166 | WebSocket connections SHALL be authenticated using the same JWT tokens as REST APIs. |
| REQ-PRD-167 | The system SHALL support WebSocket rooms/channels scoped to user roles and entity subscriptions. |

---

## 10. UI Impact

### 10.1 Rider Mobile App (Flutter)

| ID | Requirement |
|----|-------------|
| REQ-PRD-168 | The Rider Mobile App SHALL provide phone-based registration and OTP login. |
| REQ-PRD-169 | The Rider Mobile App SHALL allow document upload for verification. |
| REQ-PRD-170 | The Rider Mobile App SHALL display current assignment details and campaign information. |
| REQ-PRD-171 | The Rider Mobile App SHALL support sticker verification photo submission. |
| REQ-PRD-172 | The Rider Mobile App SHALL display wallet balance and payout history. |
| REQ-PRD-173 | The Rider Mobile App SHALL display notifications and support push notifications. |
| REQ-PRD-174 | The Rider Mobile App SHALL allow riders to manage availability status. |
| REQ-PRD-175 | The Rider Mobile App SHALL provide a support ticket creation interface. |

### 10.2 Business Web Portal (React + Next.js)

| ID | Requirement |
|----|-------------|
| REQ-PRD-176 | The Business Portal SHALL provide email-based registration and login. |
| REQ-PRD-177 | The Business Portal SHALL allow document upload for business verification. |
| REQ-PRD-178 | The Business Portal SHALL provide campaign creation and management interface. |
| REQ-PRD-179 | The Business Portal SHALL display campaign performance and fulfillment metrics. |
| REQ-PRD-180 | The Business Portal SHALL provide payment submission interface with proof upload. |
| REQ-PRD-181 | The Business Portal SHALL display billing history and invoices. |
| REQ-PRD-182 | The Business Portal SHALL provide a support ticket interface. |

### 10.3 Admin Panel (React + Next.js)

| ID | Requirement |
|----|-------------|
| REQ-PRD-183 | The Admin Panel SHALL provide rider management: list, view, verify, suspend, manage documents. |
| REQ-PRD-184 | The Admin Panel SHALL provide business management: list, view, verify, suspend, manage documents. |
| REQ-PRD-185 | The Admin Panel SHALL provide campaign management: list, view, manage lifecycle, assign riders. |
| REQ-PRD-186 | The Admin Panel SHALL provide sticker inventory management: orders, batches, distribution, verification. |
| REQ-PRD-187 | The Admin Panel SHALL provide financial operations: payment verification, payout approval, reconciliation. |
| REQ-PRD-188 | The Admin Panel SHALL provide support ticket management: view, respond, resolve. |
| REQ-PRD-189 | The Admin Panel SHALL display operational dashboards with key metrics. |
| REQ-PRD-190 | The Admin Panel SHALL provide entity timeline views. |

### 10.4 Super Admin Panel (React + Next.js)

| ID | Requirement |
|----|-------------|
| REQ-PRD-191 | The Super Admin Panel SHALL include all Admin Panel capabilities. |
| REQ-PRD-192 | The Super Admin Panel SHALL provide zone and ward management. |
| REQ-PRD-193 | The Super Admin Panel SHALL provide system configuration management. |
| REQ-PRD-194 | The Super Admin Panel SHALL provide feature flag management. |
| REQ-PRD-195 | The Super Admin Panel SHALL provide dictionary/label management. |
| REQ-PRD-196 | The Super Admin Panel SHALL provide staff account management (create, modify, deactivate). |
| REQ-PRD-197 | The Super Admin Panel SHALL provide audit log access and querying. |
| REQ-PRD-198 | The Super Admin Panel SHALL provide platform-wide analytics and financial summaries. |
| REQ-PRD-199 | The Super Admin Panel SHALL support business blacklisting. |

---

## 11. Non-Functional Requirements

### 11.1 Performance

| ID | Requirement |
|----|-------------|
| REQ-PRD-200 | API response time for standard CRUD operations SHALL be under 200ms at p95 under normal load. |
| REQ-PRD-201 | API response time for complex queries (reports, analytics) SHALL be under 2 seconds at p95. |
| REQ-PRD-202 | The system SHALL support hundreds of concurrent API users on a single Contabo VPS 6 (6 vCPU, 12GB RAM, 200GB SSD). |
| REQ-PRD-203 | WebSocket notification delivery SHALL occur within 1 second of the triggering event. |
| REQ-PRD-204 | File uploads SHALL support files up to 10MB per individual file. |

### 11.2 Availability and Reliability

| ID | Requirement |
|----|-------------|
| REQ-PRD-205 | The system SHALL target 99% uptime during business hours (6:00-22:00 NPT). |
| REQ-PRD-206 | The system SHALL implement graceful degradation; non-critical services (analytics, notifications) failing SHALL NOT impact core operations. |
| REQ-PRD-207 | The system SHALL implement automated database backups at minimum daily frequency. |
| REQ-PRD-208 | The system SHALL support zero-downtime deployments via Docker container orchestration. |

### 11.3 Security

| ID | Requirement |
|----|-------------|
| REQ-PRD-209 | All API communication SHALL use HTTPS/TLS encryption. |
| REQ-PRD-210 | All passwords SHALL be hashed using bcrypt with a minimum cost factor of 10. |
| REQ-PRD-211 | The system SHALL implement rate limiting on all public endpoints. |
| REQ-PRD-212 | The system SHALL sanitize all user inputs to prevent SQL injection and XSS attacks. |
| REQ-PRD-213 | JWT tokens SHALL have a maximum access token lifetime of 15 minutes. |
| REQ-PRD-214 | Refresh tokens SHALL have a maximum lifetime of 7 days. |
| REQ-PRD-215 | The system SHALL enforce CORS policies restricting API access to authorized origins. |
| REQ-PRD-216 | Audit logs SHALL capture: Who, What, Before, After, Reason, IP, Device, Time for every significant operation. |

### 11.4 Scalability

| ID | Requirement |
|----|-------------|
| REQ-PRD-217 | The system architecture SHALL support horizontal scaling of the application layer via Docker containers. |
| REQ-PRD-218 | The database schema SHALL be designed for efficient querying at target scale (15,000 riders, 1,500 businesses). |
| REQ-PRD-219 | The system SHALL implement database indexing strategies optimized for read-heavy workloads. |
| REQ-PRD-220 | The system SHALL use connection pooling for database connections. |

### 11.5 Maintainability

| ID | Requirement |
|----|-------------|
| REQ-PRD-221 | The backend SHALL be implemented as a NestJS modular monolith with clear domain boundaries. |
| REQ-PRD-222 | Each domain module SHALL be independently testable with clear interfaces. |
| REQ-PRD-223 | The system SHALL provide comprehensive API documentation via OpenAPI 3.1 specification. |
| REQ-PRD-224 | The system SHALL implement structured logging with correlation IDs for request tracing. |
| REQ-PRD-225 | The system SHALL use Docker for consistent development, testing, and deployment environments. |

### 11.6 Data Retention

| ID | Requirement |
|----|-------------|
| REQ-PRD-226 | Audit logs SHALL be retained for a minimum of 3 years. |
| REQ-PRD-227 | Financial records SHALL be retained for a minimum of 5 years. |
| REQ-PRD-228 | User data SHALL be retained as long as the account is active plus 1 year after deactivation. |

---

## 12. Acceptance Criteria

The Solo Advertiser MVP SHALL be considered complete when ALL of the following criteria are met:

| # | Criterion |
|---|-----------|
| AC-01 | A Rider can register via phone, submit documents, get verified, and reach Available status. |
| AC-02 | A Business can register via email, submit documents, get verified, and reach Active status. |
| AC-03 | A Business can create a campaign with minimum 100 riders and 15 days duration. |
| AC-04 | A Business can submit payment proof and Finance Staff can verify it. |
| AC-05 | Operations Staff can assign riders to a payment-verified campaign until 100% fulfillment. |
| AC-06 | A campaign transitions through its complete lifecycle from Draft to Completed. |
| AC-07 | Escrow is released daily based on completed campaign days. |
| AC-08 | Rider wallets accumulate earnings at NPR 100/rider/day. |
| AC-09 | Payouts are processed on a 15-day cycle for riders with balance >= NPR 500. |
| AC-10 | Sticker verification occurs every 7 days with proper escalation (warning, suspension, removal). |
| AC-11 | All state transitions generate audit log entries with full context (Who/What/Before/After/Reason/IP/Device/Time). |
| AC-12 | Notifications are delivered in real-time via push and in-app channels. |
| AC-13 | Configuration and feature flags can be modified by Super Admin with real-time propagation. |
| AC-14 | The system operates within performance targets on a single Contabo VPS 6. |
| AC-15 | All four applications (Rider App, Business Portal, Admin Panel, Super Admin Panel) are functional. |
| AC-16 | Financial ledger maintains integrity with double-entry accounting. |
| AC-17 | Support tickets can be created, managed, and resolved through the platform. |
| AC-18 | Analytics dashboards display accurate operational and financial metrics. |

---

## 13. Out of Scope

The following items are explicitly excluded from the MVP and SHALL NOT be implemented:

| Category | Excluded Items |
|----------|---------------|
| Geography | Multiple cities, countries, or regions beyond Kathmandu Valley |
| Currency | Multiple currencies; only NPR is supported |
| Language | Multiple languages in the system interface (Nepali content support only in user-facing dictionary values) |
| Asset Types | Taxi, bus, rickshaw, jacket, delivery box, backpack, or any asset beyond helmets |
| Automation | Automated rider-campaign matching algorithms |
| Payment Integration | Direct payment gateway SDK integration (eSewa/Khalti APIs); all verification is manual |
| Public APIs | Third-party developer APIs or webhook integrations |
| Partnerships | Fleet partnerships, rider agencies, or enterprise advertiser portals |
| AI/ML | Machine learning or AI features in runtime product (recommendations, fraud detection, etc.) |
| Multi-tenancy | White-label or multi-tenant deployment models |
| Offline Mode | Offline-first mobile app capabilities |
| Advanced Analytics | Predictive analytics, cohort analysis, or real-time streaming analytics |
| Social Features | Rider community, leaderboards, or social sharing |
| Self-Service | Business self-serve campaign management without operations staff involvement |

---

## 14. Requirement IDs / Traceability

### 14.1 Requirement Index

| Range | Domain | Count |
|-------|--------|-------|
| REQ-PRD-001 to REQ-PRD-010 | Identity and Authentication | 10 |
| REQ-PRD-011 to REQ-PRD-024 | Rider Domain | 14 |
| REQ-PRD-025 to REQ-PRD-035 | Business Domain | 11 |
| REQ-PRD-036 to REQ-PRD-053 | Campaign Domain | 18 |
| REQ-PRD-054 to REQ-PRD-062 | Assignment Domain | 9 |
| REQ-PRD-063 to REQ-PRD-070 | Sticker Inventory | 8 |
| REQ-PRD-071 to REQ-PRD-085 | Financial Platform | 15 |
| REQ-PRD-086 to REQ-PRD-092 | Notification Domain | 7 |
| REQ-PRD-093 to REQ-PRD-098 | Configuration Service | 6 |
| REQ-PRD-099 to REQ-PRD-103 | Audit Domain | 5 |
| REQ-PRD-104 to REQ-PRD-107 | Timeline Service | 4 |
| REQ-PRD-108 to REQ-PRD-113 | Media Service | 6 |
| REQ-PRD-114 to REQ-PRD-120 | Support Domain | 7 |
| REQ-PRD-121 to REQ-PRD-127 | Analytics Domain | 7 |
| REQ-PRD-128 to REQ-PRD-147 | Business Rules | 20 |
| REQ-PRD-148 to REQ-PRD-158 | Data Requirements | 11 |
| REQ-PRD-159 to REQ-PRD-167 | API Impact | 9 |
| REQ-PRD-168 to REQ-PRD-199 | UI Impact | 32 |
| REQ-PRD-200 to REQ-PRD-228 | Non-Functional Requirements | 29 |

**Total Requirements: 228**

### 14.2 Downstream Document Traceability

| Downstream Document | Relevant Requirement Ranges | Relationship |
|--------------------|-----------------------------|--------------|
| 02. Business Rules Engine | REQ-PRD-128 to REQ-PRD-147 | Implements and extends business rules into executable logic |
| 03. Domain Model | REQ-PRD-011 to REQ-PRD-127 | Translates functional requirements into domain entities and behaviors |
| 04. System Architecture | REQ-PRD-200 to REQ-PRD-228 | Designs system to satisfy non-functional requirements |
| 05. Data Model | REQ-PRD-148 to REQ-PRD-158 | Implements data requirements as physical schema |
| 06. Configuration & Dictionary | REQ-PRD-093 to REQ-PRD-098 | Details configuration service implementation |
| 07. Authentication & Permissions | REQ-PRD-001 to REQ-PRD-010 | Implements identity and auth requirements |
| 08. API Specification | REQ-PRD-159 to REQ-PRD-167 | Defines complete API contracts per domain |
| 09. Rider App | REQ-PRD-168 to REQ-PRD-175 | Implements rider mobile application requirements |
| 10. Business Portal | REQ-PRD-176 to REQ-PRD-182 | Implements business web portal requirements |
| 11. Admin Panel | REQ-PRD-183 to REQ-PRD-190 | Implements admin panel requirements |
| 12. Campaign & Assignment | REQ-PRD-036 to REQ-PRD-062 | Details campaign lifecycle and assignment logic |
| 13. Financial Platform | REQ-PRD-071 to REQ-PRD-085 | Details financial system implementation |
| 14. Notifications & Timeline | REQ-PRD-086 to REQ-PRD-092, REQ-PRD-104 to REQ-PRD-107 | Implements notification and timeline services |
| 15. Deployment & Operations | REQ-PRD-205 to REQ-PRD-208, REQ-PRD-225 | Defines deployment and operational procedures |
| 16. Security & Compliance | REQ-PRD-099 to REQ-PRD-103, REQ-PRD-209 to REQ-PRD-216 | Implements security and audit requirements |
| 17. Testing Strategy | All REQ-PRD-* | Defines test cases validating all requirements |
| 18. MVP Scope & Glossary | Section 2 (Scope), Section 3 (Definitions), Section 13 (Out of Scope) | Consolidates scope boundaries and terminology |

### 14.3 Rider Reliability Score Components

| Component | Description | Traced To |
|-----------|-------------|-----------|
| Verification | Compliance with periodic sticker verification requirements | REQ-PRD-069, REQ-PRD-136 to REQ-PRD-139 |
| Attendance | Presence and activity during assigned campaign days | REQ-PRD-058 |
| Activity | Ride-sharing activity level during campaign hours | REQ-PRD-058 |
| Completion | Ratio of completed assignments to total assignments | REQ-PRD-059 |
| Response | Timeliness of responses to platform communications and verification requests | REQ-PRD-060 |

**Formula:** Verification + Attendance + Activity + Completion + Response = X/100

---

*End of Document 01 - Product Requirements Specification*
