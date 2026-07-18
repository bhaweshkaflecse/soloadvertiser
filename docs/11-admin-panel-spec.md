# Document 11 - Admin Panel Specification

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every page, navigation path, interaction, approval workflow, and behavior defined in this document is the AUTHORITATIVE specification for the Admin Panel and Super Admin Panel. No page, component, or feature may be implemented without a corresponding entry here.

---

## 1. Purpose and Scope

This document defines the complete specification for the Admin Panel and Super Admin Panel — a single React + Next.js web application with role-based feature visibility. It covers approval queues, entity management, operational dashboards, financial operations, system configuration, and power-user features for the 5-person operations team.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Platform | Web application (desktop-optimized, tablet-accessible) |
| Framework | React + Next.js 14+ with TypeScript |
| Target users | Operations Staff, Finance Staff, Admin, Super Admin |
| Roles served | 4 roles with progressive feature visibility |
| Language | English (system interface) |
| Authentication | Email + password (staff accounts created by Super Admin only, REQ-PRD-009) |
| Backend integration | REST API (/api/v1/) + Socket.IO WebSocket |
| SDK | Shared TypeScript SDK with Business Portal |
| Domain | admin.soloadvertiser.com |

### 1.2 Role Visibility Matrix

| Feature Area | Operations Staff | Finance Staff | Admin | Super Admin |
|-------------|-----------------|---------------|-------|-------------|
| Dashboard | ✓ | ✓ (finance-focused) | ✓ | ✓ |
| Rider Management | ✓ | Read-only | ✓ | ✓ |
| Business Management | ✓ | Read-only | ✓ | ✓ |
| Campaign Management | ✓ | Read-only | ✓ | ✓ |
| Assignment Management | ✓ | — | ✓ | ✓ |
| Sticker Inventory | ✓ | — | ✓ | ✓ |
| Payment Verification | — | ✓ | ✓ | ✓ |
| Payout Management | — | ✓ | ✓ | ✓ |
| Support Tickets | ✓ | ✓ (financial) | ✓ | ✓ |
| Reports | ✓ (operational) | ✓ (financial) | ✓ | ✓ |
| Configuration | — | — | — | ✓ |
| Zone Management | — | — | — | ✓ |
| Staff Management | — | — | — | ✓ |
| Audit Logs | — | — | Read-only | ✓ |
| System Health | — | — | — | ✓ |

### 1.3 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Page identifiers use prefix PG-ADM-NNN.
- All pages trace to Document 01 requirements REQ-PRD-183 through REQ-PRD-199.
- Shared component library with Business Portal (Document 10).

---

## 2. Technology Stack

| Layer | Technology | Rationale | Reference |
|-------|-----------|-----------|-----------|
| Framework | Next.js 14+ (App Router) | SSR, shared infra with Business Portal | Document 04 §3 |
| Language | TypeScript (strict mode) | Type safety, shared SDK | Document 04 §3 |
| UI Library | Tailwind CSS + Headless UI | Shared with Business Portal | Document 10 §2 |
| Component Library | Shared @soloadvertiser/ui package | Consistency across portals | ARCH-003 |
| State Management | TanStack Query (React Query) | Server state, real-time invalidation | Document 04 §3 |
| Tables | TanStack Table | Sortable, filterable, keyboard-navigable | UX principles |
| Forms | React Hook Form + Zod | Schema validation, bulk operations | REQ-PRD-183 |
| HTTP Client | Generated TypeScript SDK | Same SDK as Business Portal | Document 04 §3 |
| WebSocket | socket.io-client | Live queue counts, real-time updates | REQ-PRD-165 |
| Keyboard Shortcuts | @github/hotkey or custom | Power-user efficiency | UX principles |
| PDF Generation | Server-side via API | Payout CSV, reports | REQ-PRD-124 |
| Charts | Recharts | Dashboard metrics visualization | REQ-PRD-189 |

---

## 3. Navigation Structure

### 3.1 Sidebar Navigation — Admin Roles

| Position | Section | Items | Visibility |
|----------|---------|-------|-----------|
| 1 | — | Dashboard | All roles |
| 2 | Operations | Approval Queues | Ops Staff, Admin, Super Admin |
| 3 | Operations | Riders | Ops Staff, Admin, Super Admin (Finance: read-only) |
| 4 | Operations | Businesses | Ops Staff, Admin, Super Admin (Finance: read-only) |
| 5 | Operations | Campaigns | Ops Staff, Admin, Super Admin (Finance: read-only) |
| 6 | Operations | Assignments | Ops Staff, Admin, Super Admin |
| 7 | Operations | Sticker Inventory | Ops Staff, Admin, Super Admin |
| 8 | Finance | Payment Verification | Finance Staff, Admin, Super Admin |
| 9 | Finance | Payouts | Finance Staff, Admin, Super Admin |
| 10 | Finance | Reconciliation | Finance Staff, Admin, Super Admin |
| 11 | — | Support | All roles |
| 12 | — | Reports | All roles (scoped by role) |
| 13 | System | Configuration | Super Admin only |
| 14 | System | Zones & Wards | Super Admin only |
| 15 | System | Staff Management | Super Admin only |
| 16 | System | Audit Logs | Admin (read-only), Super Admin |
| 17 | System | System Health | Super Admin only |

### 3.2 Navigation Rules

1. Sidebar SHALL be permanently visible on desktop (collapsible via toggle).
2. Sections SHALL collapse/expand; sections with zero-permission items SHALL be hidden entirely.
3. Badge counts SHALL display on Approval Queues (pending count) and Support (open count).
4. Active item SHALL show left-border accent and background highlight.
5. Top bar SHALL show: search (global entity search), notification bell, user avatar + role badge.

### 3.3 Page Hierarchy

```
[Authenticated — Sidebar]
├── PG-ADM-001 Dashboard
├── Approval Queues
│   ├── PG-ADM-010 Rider Approvals
│   ├── PG-ADM-011 Business Approvals
│   ├── PG-ADM-012 Document Approvals
│   └── PG-ADM-013 Verification Approvals
├── Riders
│   ├── PG-ADM-020 Rider List
│   └── PG-ADM-021 Rider Detail
├── Businesses
│   ├── PG-ADM-030 Business List
│   └── PG-ADM-031 Business Detail
├── Campaigns
│   ├── PG-ADM-040 Campaign List
│   └── PG-ADM-041 Campaign Detail
├── Assignments
│   ├── PG-ADM-050 Assignment Dashboard
│   └── PG-ADM-051 Assignment Creation
├── Sticker Inventory
│   ├── PG-ADM-060 Inventory Overview
│   ├── PG-ADM-061 Print Orders
│   └── PG-ADM-062 Distribution Tracking
├── Finance
│   ├── PG-ADM-070 Payment Verification Queue
│   ├── PG-ADM-071 Payout Management
│   └── PG-ADM-072 Reconciliation
├── Support
│   ├── PG-ADM-080 Ticket Queue
│   └── PG-ADM-081 Ticket Detail
├── Reports
│   └── PG-ADM-090 Reports Hub
├── Configuration (Super Admin)
│   ├── PG-ADM-100 Settings Manager
│   ├── PG-ADM-101 Feature Flags
│   └── PG-ADM-102 Dictionary Manager
├── Zones (Super Admin)
│   └── PG-ADM-110 Zone Manager
├── Staff (Super Admin)
│   └── PG-ADM-120 Staff Management
├── Audit (Super Admin / Admin read-only)
│   └── PG-ADM-130 Audit Log Viewer
└── System Health (Super Admin)
    └── PG-ADM-140 System Health
```

---

## 4. Page Inventory

| ID | Page Name | Route | Minimum Role |
|----|-----------|-------|-------------|
| PG-ADM-001 | Dashboard | /dashboard | Operations Staff |
| PG-ADM-010 | Rider Approvals | /approvals/riders | Operations Staff |
| PG-ADM-011 | Business Approvals | /approvals/businesses | Operations Staff |
| PG-ADM-012 | Document Approvals | /approvals/documents | Operations Staff |
| PG-ADM-013 | Verification Approvals | /approvals/verifications | Operations Staff |
| PG-ADM-020 | Rider List | /riders | Operations Staff |
| PG-ADM-021 | Rider Detail | /riders/[id] | Operations Staff |
| PG-ADM-030 | Business List | /businesses | Operations Staff |
| PG-ADM-031 | Business Detail | /businesses/[id] | Operations Staff |
| PG-ADM-040 | Campaign List | /campaigns | Operations Staff |
| PG-ADM-041 | Campaign Detail | /campaigns/[id] | Operations Staff |
| PG-ADM-050 | Assignment Dashboard | /assignments | Operations Staff |
| PG-ADM-051 | Assignment Creation | /assignments/new | Operations Staff |
| PG-ADM-060 | Inventory Overview | /stickers | Operations Staff |
| PG-ADM-061 | Print Orders | /stickers/orders | Operations Staff |
| PG-ADM-062 | Distribution Tracking | /stickers/distribution | Operations Staff |
| PG-ADM-070 | Payment Verification | /finance/payments | Finance Staff |
| PG-ADM-071 | Payout Management | /finance/payouts | Finance Staff |
| PG-ADM-072 | Reconciliation | /finance/reconciliation | Finance Staff |
| PG-ADM-080 | Ticket Queue | /support | Operations Staff |
| PG-ADM-081 | Ticket Detail | /support/[id] | Operations Staff |
| PG-ADM-090 | Reports Hub | /reports | Operations Staff |
| PG-ADM-100 | Settings Manager | /config/settings | Super Admin |
| PG-ADM-101 | Feature Flags | /config/flags | Super Admin |
| PG-ADM-102 | Dictionary Manager | /config/dictionary | Super Admin |
| PG-ADM-110 | Zone Manager | /zones | Super Admin |
| PG-ADM-120 | Staff Management | /staff | Super Admin |
| PG-ADM-130 | Audit Log Viewer | /audit | Admin |
| PG-ADM-140 | System Health | /system | Super Admin |


---

## 5. Dashboard Specification (PG-ADM-001)

### 5.1 KPI Cards Row

| Card | Value | Color Logic | Update |
|------|-------|-------------|--------|
| Pending Approvals | Sum of all queues | Red if > 20 | Real-time |
| Active Campaigns | Count of Running campaigns | Green | Hourly |
| Pending Payouts | NPR amount awaiting disbursement | Amber if > NPR 500K | Real-time |
| Open Support Tickets | Count of Open/In Progress | Red if > 10 | Real-time |
| Active Riders | Count in Available/Assigned/Campaign Active | Green | Hourly |
| Today's Revenue | NPR released from escrow today | Green | Daily |

### 5.2 Today's Queue

| Section | Content |
|---------|---------|
| Layout | Priority-sorted list of pending actions |
| Items | Rider verifications pending; Business documents pending; Payment verifications pending; Verification photos pending; Support tickets awaiting response |
| Urgency | Red: overdue (> SLA); Amber: due today; Green: on track |
| Actions | Click item → navigate to relevant queue |

### 5.3 Recent Activity Feed

| Aspect | Specification |
|--------|--------------|
| Source | Last 20 events from timeline service |
| Display | Actor avatar, action description, timestamp (relative), entity link |
| Filter | By event type (dropdown) |
| Real-time | New events prepend to feed via WebSocket |

### 5.4 API Calls

- GET /api/v1/admin/dashboard (aggregated KPIs)
- GET /api/v1/timeline?limit=20 (recent activity)

---

## 6. Approval Queues

### 6.1 Split-Pane Layout

All approval queue pages (PG-ADM-010 through PG-ADM-013) SHALL use a split-pane layout:

| Pane | Content | Width |
|------|---------|-------|
| Left | Scrollable queue list with summary info | 40% |
| Right | Selected item detail with actions | 60% |

### 6.2 Queue List (Left Pane)

| Element | Specification |
|---------|--------------|
| Items | Entity name, submitted date, type badge, urgency indicator |
| Sorting | Newest first (default), oldest first (toggle) |
| Selection | Click to select → loads detail in right pane |
| Active indicator | Selected item highlighted with background |
| Count | Total pending count in header |
| Bulk select | Checkbox per item for bulk actions |

### 6.3 Detail View (Right Pane)

| Element | Specification |
|---------|--------------|
| Header | Entity name, status, submitted by, submitted date |
| Content | Depends on queue type (see §6.5–6.8) |
| Actions | Approve button (green), Reject button (red), Internal note (text area) |
| Reject flow | Clicking "Reject" SHALL open a modal with: reason dropdown (templates) + free-text field (required) |
| Notes | Internal notes (not visible to user) stored per entity |

### 6.4 Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| J | Select next item in queue | Queue list focused |
| K | Select previous item in queue | Queue list focused |
| A | Approve selected item | Detail pane focused |
| R | Open reject modal | Detail pane focused |
| N | Focus internal note field | Detail pane focused |
| Ctrl+Enter | Submit action (approve/reject) | Modal focused |
| Escape | Close modal / deselect | Any |

### 6.5 PG-ADM-010 — Rider Approvals

**Queue items:** Riders in Verification Pending status.

| Detail Content | Specification |
|----------------|--------------|
| Personal Info | Name, phone, DOB, address |
| Vehicle | Type, registration, color, make/model |
| Documents | Inline viewer (zoomable images): citizenship/license, vehicle registration, profile photo, helmet photo |
| Zone | Selected operating zone |
| History | Previous rejections (if re-submission) |

**Actions:**
- Approve → rider transitions to Approved (REQ-PRD-015)
- Reject → rider returns to Documents Pending with reason (REQ-PRD-015)

**API:** GET /api/v1/admin/riders?status=verification_pending; PATCH /api/v1/riders/{id}/approve; PATCH /api/v1/riders/{id}/reject { reason }

### 6.6 PG-ADM-011 — Business Approvals

**Queue items:** Businesses in Under Review status.

| Detail Content | Specification |
|----------------|--------------|
| Company Info | Legal name, PAN/VAT, address, industry |
| Contact Person | Name, email, phone |
| Documents | Inline viewer: PAN/VAT certificate, Business registration, Representative ID |
| History | Previous rejections (if re-submission) |

**Actions:**
- Verify → business transitions to Verified (REQ-PRD-029)
- Reject → business returns to Documents Pending with reason (REQ-PRD-029)

**API:** GET /api/v1/admin/businesses?status=under_review; PATCH /api/v1/businesses/{id}/verify; PATCH /api/v1/businesses/{id}/reject { reason }

### 6.7 PG-ADM-012 — Document Approvals

**Queue items:** Documents with status Under Review (rider and business documents).

| Detail Content | Specification |
|----------------|--------------|
| Document | Full-size inline viewer with zoom/rotate |
| Owner Info | Owner name, type (Rider/Business), status |
| Document Type | Citizenship, vehicle registration, PAN/VAT, etc. |
| Comparison | If re-submission: show previous rejected version side-by-side |

**Actions:**
- Approve document → document status: Approved
- Reject document → document status: Rejected with reason (RULE-DOC-004)

**API:** GET /api/v1/admin/documents?status=under_review; PATCH /api/v1/documents/{id}/approve; PATCH /api/v1/documents/{id}/reject { reason }

### 6.8 PG-ADM-013 — Verification Approvals

**Queue items:** Sticker verification submissions pending review.

| Detail Content | Specification |
|----------------|--------------|
| Verification Photo | Full-size with zoom (captured by rider) |
| Reference | Campaign creative thumbnail for comparison |
| Rider Info | Name, assignment, campaign, zone |
| History | Previous verifications for this assignment (pass/fail timeline) |
| Failure Count | Current failure count for escalation context |

**Actions:**
- Approve → verification passed (RULE-VRF-006)
- Reject → verification failed; system applies escalation logic per RULE-VRF-002/003/004

**API:** GET /api/v1/admin/verifications?status=pending; PATCH /api/v1/stickers/verifications/{id}/approve; PATCH /api/v1/stickers/verifications/{id}/reject { reason }

### 6.9 Bulk Actions

| Action | Availability | Behavior |
|--------|-------------|----------|
| Bulk Approve | All queues | Select multiple → "Approve Selected (N)" button → confirmation modal |
| Bulk Reject | All queues | Select multiple → "Reject Selected (N)" → reason modal (single reason applied to all) |
| Select All | All queues | Checkbox in header selects visible page |

---

## 7. Entity Management

### 7.1 PG-ADM-020 — Rider List

| Aspect | Specification |
|--------|--------------|
| Layout | Search bar, filter chips, sortable table, pagination |
| Filters | Status (multi-select all rider states); Zone; Reliability score range; Has active assignment; Registration date range |
| Table Columns | Name, Phone, Status (badge), Zone, Reliability Score, Active Campaign, Registered Date, Actions |
| Actions | Row click → PG-ADM-021; Quick actions: Suspend, Change Status |
| Search | By name, phone number (debounced, server-side) |
| API | GET /api/v1/admin/riders?status=X&zone=Y&page=N&search=Q |
| Export | "Export CSV" button → GET /api/v1/admin/riders?format=csv |
| Pagination | Server-side, 25 per page |

### 7.2 PG-ADM-021 — Rider Detail

| Aspect | Specification |
|--------|--------------|
| Layout | Header (name + status + actions), tab navigation |
| Tabs | Overview, Documents, Assignments, Earnings, Timeline |

**Overview Tab:**
- Personal info (name, phone, DOB, address, emergency contact)
- Vehicle details
- Zone assignment
- Reliability score breakdown (5 components with weights)
- Current status with available transitions

**Documents Tab:**
- Document list with status indicators
- Inline document viewer
- Approve/Reject actions per document (if pending)

**Assignments Tab:**
- Assignment history table (campaign, dates, status, days completed)
- Active assignment details

**Earnings Tab:**
- Wallet balance
- Earnings history (per assignment)
- Payout history

**Timeline Tab:**
- Complete entity timeline from creation (REQ-PRD-107)
- Filterable by event type

**Status Transitions (available based on current state):**

| Current Status | Available Actions | Authority |
|---------------|-------------------|-----------|
| Verification Pending | Approve, Reject | Operations Staff+ |
| Approved/Available | Suspend | Operations Staff+ |
| Suspended | Reactivate (→ Approved) | Admin+ |
| Any | View timeline | All |

**API:** GET /api/v1/riders/{id}; GET /api/v1/riders/{id}/documents; GET /api/v1/riders/{id}/assignments; GET /api/v1/riders/{id}/wallet; GET /api/v1/timeline?entityType=rider&entityId={id}

### 7.3 PG-ADM-030 — Business List

| Aspect | Specification |
|--------|--------------|
| Layout | Search bar, filter chips, sortable table, pagination |
| Filters | Status (multi-select); Industry; Has active campaigns; Registration date range |
| Table Columns | Company Name, Contact, Status (badge), Active Campaigns, Total Spend, Registered Date |
| Search | By company name, contact email, PAN/VAT number |
| API | GET /api/v1/admin/businesses?status=X&page=N&search=Q |
| Export | CSV export |

### 7.4 PG-ADM-031 — Business Detail

| Aspect | Specification |
|--------|--------------|
| Layout | Header (company name + status + actions), tab navigation |
| Tabs | Overview, Documents, Campaigns, Billing, Timeline |

**Status Transitions:**

| Current Status | Available Actions | Authority |
|---------------|-------------------|-----------|
| Under Review | Verify, Reject | Operations Staff+ |
| Verified/Active | Suspend | Operations Staff+ (RULE-BIZ-006) |
| Suspended | Reactivate, Blacklist | Admin+ reactivate, Super Admin blacklist (RULE-BIZ-007) |

### 7.5 PG-ADM-040 — Campaign List

| Aspect | Specification |
|--------|--------------|
| Filters | Status (multi-select); Business; Zone; Date range; Fulfillment range |
| Table Columns | Campaign Name, Business, Status, Riders (X/Y), Duration, Start Date, Total Cost |
| Search | By campaign name, business name |
| API | GET /api/v1/admin/campaigns?status=X&page=N |

### 7.6 PG-ADM-041 — Campaign Detail

| Aspect | Specification |
|--------|--------------|
| Tabs | Overview, Assignments, Stickers, Finance, Timeline |

**Overview:** Campaign spec, status, fulfillment meter, compliance rate, business info.

**Assignments Tab:**
- Rider list (assigned to this campaign)
- Add rider button → PG-ADM-051 (pre-filtered)
- Remove rider (with reason modal per RULE-ASN-005)

**Stickers Tab:**
- Print order status
- Distribution tracking (distributed/pending per rider)
- Batch information

**Finance Tab:**
- Payment status and proof
- Escrow balance and daily release log
- Cost breakdown

**Campaign Actions:**

| Campaign Status | Available Actions | Authority |
|----------------|-------------------|-----------|
| Recruiting Riders | Assign riders | Operations Staff+ |
| Running | Pause | Operations Staff+ (RULE-CMP-008) |
| Paused | Resume, Cancel | Operations Staff+ resume, Admin+ cancel (RULE-CMP-009) |
| Pre-Running states | Cancel | Operations Staff+ (RULE-CMP-009) |
| Running | Cancel | Admin+ only (RULE-CMP-009) |

---

## 8. Assignment Management

### 8.1 PG-ADM-050 — Assignment Dashboard

| Aspect | Specification |
|--------|--------------|
| Layout | Campaigns in Recruiting status (primary), fulfillment overview |
| Content | Campaign cards with: name, required riders, current assigned, fulfillment %, "Assign Riders" button |
| Sorting | By urgency (lowest fulfillment first), then by start date proximity |
| API | GET /api/v1/admin/campaigns?status=recruiting_riders |

### 8.2 PG-ADM-051 — Assignment Creation

**Purpose:** Smart rider matching and assignment (REQ-PRD-054, RULE-ASN-001 through RULE-ASN-004).

| Aspect | Specification |
|--------|--------------|
| Layout | Campaign info header, eligible rider list (smart suggestions), bulk assign actions |

**Smart Rider Suggestions:**

The system SHALL pre-filter and sort eligible riders:

| Filter Criterion | Rule Reference |
|-----------------|----------------|
| Status = Available | RULE-RDR-005 |
| Zone overlaps campaign target zones | RULE-ASN-001 |
| No conflicting active assignment on same asset | RULE-ASN-002 |
| Not suspended | RULE-RDR-004 |
| All documents valid (not expired) | RULE-DOC-003 |

**Sorting (primary → secondary):**
1. Reliability Score (descending) — primary sort factor
2. Zone match precision (exact zone > overlapping zone)
3. Response time history (fastest responders first)

**Display per rider:**
| Column | Data |
|--------|------|
| Name | Rider full name |
| Score | Reliability score (0-100) with color indicator |
| Zone | Operating zone name |
| Campaigns Completed | Historical count |
| Last Active | Date of last assignment completion |
| Select | Checkbox for bulk assignment |

**Actions:**
- Select riders (checkbox) → "Assign Selected (N)" → confirmation modal
- Single rider: "Assign" button per row
- Bulk assign: select multiple → bulk action

**API:**
- GET /api/v1/admin/riders/eligible?campaignId={id}&sort=reliability_score
- POST /api/v1/assignments { campaignId, riderIds[] }

**Post-Assignment:**
- Fulfillment meter updates in real-time
- Campaign auto-transitions to Ready at 100% (RULE-CMP-004)

---

## 9. Financial Operations

### 9.1 PG-ADM-070 — Payment Verification Queue

**Purpose:** Finance Staff verifies business payment submissions (RULE-PAY-007).

| Aspect | Specification |
|--------|--------------|
| Layout | Split-pane: payment list (left), payment detail (right) |
| List Columns | Business name, Campaign, Amount (NPR), Method, Submitted date |
| Detail | Payment proof image (full-size), transaction reference, amount, method, business info, campaign cost for cross-reference |
| Verification | Cross-check: Does proof amount match campaign cost? Does reference ID match? |
| Actions | Verify (approve) → campaign proceeds to Recruiting; Reject → reason required, business re-submits |
| API | GET /api/v1/admin/payments?status=submitted; PATCH /api/v1/finance/payments/{id}/verify; PATCH /api/v1/finance/payments/{id}/reject { reason } |

### 9.2 PG-ADM-071 — Payout Management

**Purpose:** Generate, review, and process rider payout batches (RULE-PAY-004).

| Aspect | Specification |
|--------|--------------|
| Layout | Batch list, batch detail, generation controls |

**Batch Generation:**
- "Generate Payout Batch" button → system calculates all eligible riders (balance ≥ NPR 500 per RULE-PAY-002)
- Display: rider count, total amount, payout method breakdown
- Confirmation required before generation

**Batch Detail:**
- Individual rider payouts within batch
- Per-rider: name, amount, method, account details
- Status: Pending → Approved → Processing → Completed/Failed
- CSV export of batch (for external payment processing)

**Actions:**
- Generate batch → POST /api/v1/finance/payouts/generate
- Approve batch → PATCH /api/v1/finance/payouts/batches/{id}/approve
- Mark individual payouts complete (with proof) → PATCH /api/v1/finance/payouts/{id}/complete { proofMediaId }
- Export CSV → GET /api/v1/finance/payouts/batches/{id}/csv

### 9.3 PG-ADM-072 — Reconciliation Dashboard

**Purpose:** Financial reconciliation and reporting (REQ-PRD-082).

| Aspect | Specification |
|--------|--------------|
| Sections | Revenue summary, Escrow status, Outstanding balances, Ledger entries |
| Revenue Summary | Total platform revenue (commission earned), daily/weekly/monthly breakdown |
| Escrow Status | Per-campaign: total held, total released, remaining, daily release amount |
| Outstanding | Pending payment verifications, pending payout batches |
| Ledger | Recent ledger entries with filter by account type (RULE-FIN-007) |
| API | GET /api/v1/finance/reconciliation; GET /api/v1/finance/ledger?account=X&page=N |
| Export | CSV/PDF export of reconciliation report |

---

## 10. Super Admin Sections

### 10.1 PG-ADM-100 — Settings Manager

**Purpose:** Platform configuration management (REQ-PRD-093, REQ-PRD-193).

| Aspect | Specification |
|--------|--------------|
| Layout | Grouped settings list (categorized), edit-in-place, save button per section |
| Categories | Campaign (minimum_days, minimum_riders, business_daily_rate, fulfillment_threshold); Finance (rider_daily_rate, payout_cycle_days, minimum_payout); Verification (interval_days, failure_actions); Documents (allowed_types, max_size_mb, expiry_reminders); Notifications (channels, delivery_timeout) |
| Display | Setting key, current value, default value, description, last modified |
| Edit | Click value → inline edit → Save → real-time propagation (REQ-PRD-096) |
| Validation | Type-specific (number ranges, arrays, booleans) |
| History | "View History" per setting → modal showing change log |
| API | GET /api/v1/config/settings; PATCH /api/v1/config/settings/{key} { value } |
| Authority | Super Admin only (RULE-CFG-001, REQ-PRD-097) |

### 10.2 PG-ADM-101 — Feature Flags

**Purpose:** Feature toggle management (REQ-PRD-094, REQ-PRD-194).

| Aspect | Specification |
|--------|--------------|
| Layout | Table of flags: name, description, status (enabled/disabled), last toggled, toggle switch |
| Actions | Toggle switch → confirmation modal → PATCH /api/v1/config/flags/{key} { enabled } |
| Effect | Changes propagate in real-time to all connected clients (REQ-PRD-096) |
| History | Toggle history per flag |

### 10.3 PG-ADM-102 — Dictionary Manager

**Purpose:** UI label and message management (REQ-PRD-095, REQ-PRD-195).

| Aspect | Specification |
|--------|--------------|
| Layout | Searchable table: key, category, English value, Nepali value, last modified |
| Actions | Inline edit values; Add new entry; Search by key/value |
| Categories | labels, messages, errors, enums, tooltips |
| Bilingual | Side-by-side English/Nepali editing |
| API | GET /api/v1/config/dictionary?category=X&search=Q; PATCH /api/v1/config/dictionary/{key} { en, ne } |

### 10.4 PG-ADM-110 — Zone Manager

**Purpose:** Geographic zone and ward management (REQ-PRD-192, RULE-ZON-001, RULE-ZON-002).

| Aspect | Specification |
|--------|--------------|
| Layout | Zone list with ward details, create/edit/delete zones |
| Display | Zone name, description, ward list, rider count in zone, active campaigns in zone |
| Actions | Create zone (name + select wards); Edit zone (modify wards); Deactivate zone (soft delete) |
| Validation | Zone SHALL contain at least one ward (RULE-ZON-001); All wards SHALL be within Kathmandu Valley (RULE-ZON-003) |
| API | GET /api/v1/zones; POST /api/v1/zones; PATCH /api/v1/zones/{id}; DELETE /api/v1/zones/{id} |
| Authority | Super Admin only (RULE-ZON-002) |

### 10.5 PG-ADM-120 — Staff Management

**Purpose:** Create and manage platform staff accounts (REQ-PRD-009, REQ-PRD-196).

| Aspect | Specification |
|--------|--------------|
| Layout | Staff table, create form, edit actions |
| Table | Name, Email, Role, Status (Active/Deactivated), Created date, Last login |
| Create | Name, Email, Role (Operations Staff/Finance Staff/Admin), temporary password generation |
| Actions | Deactivate (soft), Change role, Reset password |
| Constraints | Only Super Admin can create staff (REQ-PRD-009); Cannot modify own role; Cannot deactivate self |
| API | GET /api/v1/admin/staff; POST /api/v1/admin/staff; PATCH /api/v1/admin/staff/{id} |

### 10.6 PG-ADM-130 — Audit Log Viewer

**Purpose:** Query and view immutable audit records (REQ-PRD-102, REQ-PRD-197).

| Aspect | Specification |
|--------|--------------|
| Layout | Filter bar, audit entry table, entry detail modal |
| Filters | Actor (user search); Action type; Entity type; Entity ID; Date range |
| Table | Timestamp, Actor (name + role), Action, Entity type, Entity ID, Reason (truncated) |
| Detail Modal | Full audit context: Who, What, Before state (JSON), After state (JSON), Reason, IP, Device, Time (REQ-PRD-100) |
| Constraints | Read-only for all users; no edit/delete (REQ-PRD-101) |
| Pagination | Server-side, 50 per page |
| API | GET /api/v1/audit?actor=X&action=Y&entity=Z&from=A&to=B&page=N |
| Export | CSV export for compliance |

### 10.7 PG-ADM-140 — System Health

**Purpose:** Platform operational overview (Super Admin only).

| Aspect | Specification |
|--------|--------------|
| Sections | Service status, Queue depths, Database metrics, Error rates |
| Service Status | Backend API (up/down), WebSocket (connections), Worker (active jobs), Redis (memory) |
| Queue Depths | BullMQ queues: notification, payout, verification_reminder, score_calculation, report_generation, cleanup |
| Database | Connection pool usage, slow query count (last hour), table sizes |
| Error Rates | API 5xx errors (last hour), failed jobs (last hour) |
| API | GET /api/v1/admin/system/health |
| Refresh | Auto-refresh every 30 seconds |


---

## 11. Real-Time Updates

### 11.1 Socket.IO Connection

| Aspect | Specification |
|--------|--------------|
| Server | wss://api.soloadvertiser.com/socket.io |
| Auth | JWT access token in handshake auth |
| Namespace | /admin |
| Connection | Persistent while page is open |
| Rooms | Role-based (ops-staff, finance-staff, admin, super-admin) |

### 11.2 Events Consumed

| Event | UI Update |
|-------|-----------|
| queue:count_updated | { queueType, count } | Badge count update on sidebar |
| rider:status_changed | { riderId, newStatus } | Rider list/detail refresh |
| business:status_changed | { businessId, newStatus } | Business list/detail refresh |
| campaign:status_changed | { campaignId, newStatus } | Campaign list/detail refresh |
| payment:submitted | { paymentId, campaignId } | Payment queue count increment |
| verification:submitted | { verificationId } | Verification queue count increment |
| payout:batch_ready | { batchId, amount } | Payout management notification |
| ticket:created | { ticketId } | Support badge increment |
| config:updated | { key, value } | Settings page refresh |

### 11.3 Live Dashboard Updates

- KPI card values SHALL update in real-time without page refresh.
- Queue counts SHALL update within 2 seconds of server-side change.
- Activity feed SHALL prepend new items with subtle animation.

---

## 12. Keyboard Shortcuts and Power User Features

### 12.1 Global Shortcuts

| Shortcut | Action |
|----------|--------|
| / | Focus global search |
| G then D | Go to Dashboard |
| G then Q | Go to Approval Queues |
| G then R | Go to Riders |
| G then B | Go to Businesses |
| G then C | Go to Campaigns |
| G then F | Go to Finance |
| G then S | Go to Support |
| ? | Show keyboard shortcuts overlay |

### 12.2 Queue-Specific Shortcuts

| Shortcut | Action |
|----------|--------|
| J / K | Navigate up/down in queue list |
| A | Approve selected item |
| R | Reject selected item (opens modal) |
| N | Open internal notes |
| Space | Toggle bulk selection |
| Ctrl+A | Select all visible |
| Enter | Confirm action in modal |

### 12.3 Table Shortcuts

| Shortcut | Action |
|----------|--------|
| ↑ / ↓ | Navigate rows |
| Enter | Open selected row detail |
| Ctrl+F | Focus table filter/search |
| E | Export current view |

### 12.4 Quick-Reject Templates

Pre-configured rejection reasons (loaded from dictionary):

| Category | Templates |
|----------|-----------|
| Rider Documents | "Document is blurry/unreadable"; "Document expired"; "Wrong document type submitted"; "Photo does not match requirements" |
| Business Documents | "PAN/VAT number mismatch"; "Document expired"; "Incomplete document"; "Company name mismatch" |
| Verification Photos | "Sticker not visible"; "Photo too blurry"; "Wrong helmet captured"; "Sticker damaged/missing" |

Templates SHALL be editable via Dictionary Manager (PG-ADM-102).

### 12.5 Internal Notes

- Every entity (rider, business, campaign, assignment) SHALL support internal staff notes.
- Notes SHALL be visible only to staff (never exposed to riders or businesses).
- Notes SHALL include: author, timestamp, text content.
- Notes SHALL be displayed in entity detail pages under a dedicated "Notes" section.
- API: GET /api/v1/admin/notes?entityType=X&entityId=Y; POST /api/v1/admin/notes { entityType, entityId, text }

---

## 13. Traceability

### 13.1 Page to Requirement Mapping

| Page ID | Primary Requirements |
|---------|---------------------|
| PG-ADM-001 | REQ-PRD-189, REQ-PRD-121 |
| PG-ADM-010 | REQ-PRD-183, REQ-PRD-015 |
| PG-ADM-011 | REQ-PRD-184, REQ-PRD-029 |
| PG-ADM-012 | REQ-PRD-183, REQ-PRD-184, RULE-DOC-002 |
| PG-ADM-013 | REQ-PRD-186, RULE-VRF-006 |
| PG-ADM-020–021 | REQ-PRD-183, REQ-PRD-019, REQ-PRD-190 |
| PG-ADM-030–031 | REQ-PRD-184, REQ-PRD-032, REQ-PRD-033, REQ-PRD-190 |
| PG-ADM-040–041 | REQ-PRD-185, REQ-PRD-050, REQ-PRD-051, REQ-PRD-190 |
| PG-ADM-050–051 | REQ-PRD-054, REQ-PRD-055, REQ-PRD-056, RULE-ASN-001 through RULE-ASN-004 |
| PG-ADM-060–062 | REQ-PRD-186, RULE-STK-001 through RULE-STK-006 |
| PG-ADM-070 | REQ-PRD-187, RULE-PAY-007 |
| PG-ADM-071 | REQ-PRD-187, RULE-PAY-004, RULE-PAY-005 |
| PG-ADM-072 | REQ-PRD-187, REQ-PRD-082 |
| PG-ADM-080–081 | REQ-PRD-188, REQ-PRD-116 |
| PG-ADM-090 | REQ-PRD-189, REQ-PRD-121 through REQ-PRD-127 |
| PG-ADM-100 | REQ-PRD-193, REQ-PRD-093, REQ-PRD-097 |
| PG-ADM-101 | REQ-PRD-194, REQ-PRD-094 |
| PG-ADM-102 | REQ-PRD-195, REQ-PRD-095 |
| PG-ADM-110 | REQ-PRD-192, RULE-ZON-001, RULE-ZON-002, RULE-ZON-003 |
| PG-ADM-120 | REQ-PRD-196, REQ-PRD-009 |
| PG-ADM-130 | REQ-PRD-197, REQ-PRD-099, REQ-PRD-102 |
| PG-ADM-140 | REQ-PRD-198 |

### 13.2 Role-Permission Enforcement

| Action | Required Permission | Rule Reference |
|--------|-------------------|----------------|
| Approve/reject rider | rider:verify | RULE-RDR-003 |
| Verify/reject business | business:verify | RULE-BIZ-003 |
| Approve/reject documents | document:review | RULE-DOC-002 |
| Approve/reject verification | verification:review | RULE-VRF-006 |
| Assign riders to campaign | assignment:create | RULE-ASN-003 |
| Pause campaign | campaign:pause | RULE-CMP-008 |
| Cancel running campaign | campaign:cancel | RULE-CMP-009 |
| Suspend rider/business | entity:suspend | RULE-BIZ-006 |
| Blacklist business | business:blacklist | RULE-BIZ-007 |
| Verify payment | payment:verify | RULE-PAY-007 |
| Approve payout batch | payout:approve | RULE-PAY-004 |
| Modify configuration | config:manage | REQ-PRD-097 |
| Manage zones | zone:manage | RULE-ZON-002 |
| Create staff | staff:create | REQ-PRD-009 |
| View audit logs | audit:read | REQ-PRD-102 |

### 13.3 API Dependency Map

| Page | Key Endpoints |
|------|---------------|
| PG-ADM-001 | GET /api/v1/admin/dashboard |
| PG-ADM-010 | GET /api/v1/admin/riders?status=verification_pending, PATCH /api/v1/riders/{id}/approve |
| PG-ADM-011 | GET /api/v1/admin/businesses?status=under_review, PATCH /api/v1/businesses/{id}/verify |
| PG-ADM-020 | GET /api/v1/admin/riders |
| PG-ADM-021 | GET /api/v1/riders/{id}, GET /api/v1/timeline |
| PG-ADM-030 | GET /api/v1/admin/businesses |
| PG-ADM-031 | GET /api/v1/businesses/{id}, GET /api/v1/timeline |
| PG-ADM-040 | GET /api/v1/admin/campaigns |
| PG-ADM-041 | GET /api/v1/campaigns/{id}, GET /api/v1/assignments?campaignId={id} |
| PG-ADM-051 | GET /api/v1/admin/riders/eligible, POST /api/v1/assignments |
| PG-ADM-060 | GET /api/v1/stickers/inventory |
| PG-ADM-070 | GET /api/v1/admin/payments?status=submitted, PATCH /api/v1/finance/payments/{id}/verify |
| PG-ADM-071 | POST /api/v1/finance/payouts/generate, PATCH /api/v1/finance/payouts/batches/{id}/approve |
| PG-ADM-072 | GET /api/v1/finance/reconciliation |
| PG-ADM-080 | GET /api/v1/admin/support/tickets |
| PG-ADM-100 | GET /api/v1/config/settings, PATCH /api/v1/config/settings/{key} |
| PG-ADM-101 | GET /api/v1/config/flags, PATCH /api/v1/config/flags/{key} |
| PG-ADM-102 | GET /api/v1/config/dictionary, PATCH /api/v1/config/dictionary/{key} |
| PG-ADM-110 | GET /api/v1/zones, POST /api/v1/zones, PATCH /api/v1/zones/{id} |
| PG-ADM-120 | GET /api/v1/admin/staff, POST /api/v1/admin/staff |
| PG-ADM-130 | GET /api/v1/audit |
| PG-ADM-140 | GET /api/v1/admin/system/health |

---

*End of Document 11*
