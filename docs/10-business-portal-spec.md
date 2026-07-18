# Document 10 - Business Portal Specification

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every page, navigation path, interaction, data flow, and behavior defined in this document is the AUTHORITATIVE specification for the Business Web Portal. No page, component, or feature may be implemented without a corresponding entry here.

---

## 1. Purpose and Scope

This document defines the complete specification for the Business Web Portal built with React and Next.js. It covers all pages, navigation flows, interactions, data bindings, campaign management, payment flows, reporting, and responsive design requirements.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Platform | Web application (desktop, tablet, mobile-responsive) |
| Framework | React + Next.js 14+ with TypeScript |
| Target users | Business representatives managing advertising campaigns |
| Language | English (system), Nepali (user-facing content via dictionary) |
| Authentication | Email + password (REQ-PRD-002, REQ-PRD-176) |
| Backend integration | REST API (/api/v1/) + Socket.IO WebSocket |
| SDK | Auto-generated TypeScript client from OpenAPI 3.1 spec |
| Domain | business.soloadvertiser.com |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Page identifiers use prefix PG-BIZ-NNN.
- All pages trace to Document 01 requirements REQ-PRD-176 through REQ-PRD-182.
- UI text SHALL be dictionary-driven (Document 06).

---

## 2. Technology Stack

| Layer | Technology | Rationale | Reference |
|-------|-----------|-----------|-----------|
| Framework | Next.js 14+ (App Router) | SSR, file-based routing, React Server Components | Document 04 §3 |
| Language | TypeScript (strict mode) | Type safety, SDK integration | Document 04 §3 |
| UI Library | Tailwind CSS + Headless UI | Utility-first, accessible components | ARCH-001 |
| State Management | TanStack Query (React Query) | Server state caching, optimistic updates | Document 04 §3 |
| Forms | React Hook Form + Zod | Performant forms, schema validation | REQ-PRD-176 |
| HTTP Client | Generated TypeScript SDK | Type-safe API calls from OpenAPI | Document 04 §3 |
| WebSocket | socket.io-client | Real-time campaign updates | REQ-PRD-165 |
| File Upload | tus-js-client (resumable) | Large creative uploads with resume | REQ-PRD-108 |
| Charts | Recharts | Lightweight, React-native charting | REQ-PRD-179 |
| Date Handling | date-fns | Lightweight date utilities | N/A |
| Notifications | react-hot-toast | Non-blocking user feedback | UX principles |

---

## 3. Navigation Structure

### 3.1 Sidebar Navigation

The application SHALL use a collapsible sidebar navigation with the following structure:

| Position | Item | Icon | Route | Badge |
|----------|------|------|-------|-------|
| 1 | Dashboard | dashboard | /dashboard | — |
| 2 | Campaigns | campaign | /campaigns | Active count |
| 3 | Billing | receipt | /billing | Pending payments |
| 4 | Support | help | /support | Open tickets |
| 5 | Settings | settings | /settings | — |

### 3.2 Navigation Rules

1. The sidebar SHALL be visible on all authenticated pages.
2. On screens < 768px width, the sidebar SHALL collapse to a hamburger menu.
3. On tablet (768px–1024px), the sidebar SHALL show icons only (expandable on hover).
4. Active navigation item SHALL be visually distinguished (background highlight + left border accent).
5. Each navigation item MAY display a badge for pending action counts.
6. User avatar + company name SHALL appear at the sidebar bottom with a dropdown menu (Profile, Logout).

### 3.3 Page Hierarchy

```
[Unauthenticated]
├── PG-BIZ-001 Login
├── PG-BIZ-002 Registration
├── PG-BIZ-003 Email Verification
└── PG-BIZ-004 Forgot Password

[Authenticated — Sidebar Navigation]
├── PG-BIZ-010 Onboarding Wizard (if not verified)
├── Dashboard
│   └── PG-BIZ-020 Dashboard
├── Campaigns
│   ├── PG-BIZ-030 Campaign List
│   ├── PG-BIZ-031 Campaign Creation Wizard
│   ├── PG-BIZ-032 Campaign Detail
│   └── PG-BIZ-033 Campaign Renewal
├── Billing
│   ├── PG-BIZ-040 Billing Overview
│   ├── PG-BIZ-041 Payment Submission
│   └── PG-BIZ-042 Invoice Detail
├── Support
│   ├── PG-BIZ-050 Ticket List
│   ├── PG-BIZ-051 Create Ticket
│   └── PG-BIZ-052 Ticket Conversation
└── Settings
    ├── PG-BIZ-060 Company Profile
    ├── PG-BIZ-061 Billing Details
    └── PG-BIZ-062 Notification Preferences
```

---

## 4. Page Inventory

| ID | Page Name | Route | Auth Required | Verification Required |
|----|-----------|-------|---------------|----------------------|
| PG-BIZ-001 | Login | /login | No | No |
| PG-BIZ-002 | Registration | /register | No | No |
| PG-BIZ-003 | Email Verification | /verify-email | No | No |
| PG-BIZ-004 | Forgot Password | /forgot-password | No | No |
| PG-BIZ-010 | Onboarding Wizard | /onboarding | Yes | No |
| PG-BIZ-020 | Dashboard | /dashboard | Yes | Yes |
| PG-BIZ-030 | Campaign List | /campaigns | Yes | Yes |
| PG-BIZ-031 | Campaign Creation Wizard | /campaigns/new | Yes | Yes |
| PG-BIZ-032 | Campaign Detail | /campaigns/[id] | Yes | Yes |
| PG-BIZ-033 | Campaign Renewal | /campaigns/[id]/renew | Yes | Yes |
| PG-BIZ-040 | Billing Overview | /billing | Yes | Yes |
| PG-BIZ-041 | Payment Submission | /billing/pay/[campaignId] | Yes | Yes |
| PG-BIZ-042 | Invoice Detail | /billing/invoices/[id] | Yes | Yes |
| PG-BIZ-050 | Ticket List | /support | Yes | Yes |
| PG-BIZ-051 | Create Ticket | /support/new | Yes | Yes |
| PG-BIZ-052 | Ticket Conversation | /support/[id] | Yes | Yes |
| PG-BIZ-060 | Company Profile | /settings/company | Yes | Yes |
| PG-BIZ-061 | Billing Details | /settings/billing | Yes | Yes |
| PG-BIZ-062 | Notification Preferences | /settings/notifications | Yes | Yes |

---

## 5. Page Specifications

### 5.1 PG-BIZ-001 — Login

**Purpose:** Email-based authentication for business users (REQ-PRD-002, REQ-PRD-176).

| Aspect | Specification |
|--------|--------------|
| Layout | Centered card: logo, email field, password field, "Login" button, "Forgot password?" link, "Register" link |
| Fields | Email (required, valid format); Password (required, min 8 chars) |
| API Calls | POST /api/v1/auth/login { email, password } |
| Validation | Email: valid format, real-time; Password: required, min 8 chars |
| Error States | Invalid credentials → "Invalid email or password"; Account locked → "Account locked, try again in X minutes" (RULE-SEC-001); Unverified email → "Please verify your email first" with resend link; Network error → "Connection failed, please try again" |
| Loading State | Button shows spinner, fields disabled |
| Success | Store tokens → redirect to /dashboard (or /onboarding if not verified) |


### 5.2 PG-BIZ-002 — Registration

**Purpose:** New business account creation (REQ-PRD-002, REQ-PRD-176).

| Aspect | Specification |
|--------|--------------|
| Layout | Centered card: logo, form fields, "Register" button, "Already have an account?" link |
| Fields | Company name (required, 2-200 chars); Contact person name (required); Email (required, unique); Password (required, min 8, mixed case + numeric per REQ-PRD-010); Confirm password (must match) |
| API Calls | POST /api/v1/auth/register { email, password, companyName, contactPerson, role: "business" } |
| Validation | Real-time: email uniqueness check (debounced 500ms); Password strength indicator |
| Error States | Email exists → "An account with this email already exists"; Validation errors → inline per field; API error → generic error toast |
| Loading State | Button spinner, fields disabled |
| Success | Navigate to Email Verification page with success message |

### 5.3 PG-BIZ-003 — Email Verification

**Purpose:** Confirm email ownership before proceeding.

| Aspect | Specification |
|--------|--------------|
| Layout | Centered card: email icon, "Check your email" message, masked email display, "Resend" button (with cooldown), "Change email" link |
| Data Displayed | Email address (masked: b***@company.com); Resend cooldown timer (60s) |
| Actions | "Resend Verification" (after cooldown); "Change Email" → back to registration |
| API Calls | POST /api/v1/auth/verify-email { token } (via email link); POST /api/v1/auth/resend-verification { email } |
| Deep Link | Email contains link: business.soloadvertiser.com/verify-email?token=XXX |

### 5.4 PG-BIZ-004 — Forgot Password

**Purpose:** Password reset flow.

| Aspect | Specification |
|--------|--------------|
| Layout | Email input, "Send Reset Link" button; After send: confirmation message |
| API Calls | POST /api/v1/auth/forgot-password { email }; POST /api/v1/auth/reset-password { token, newPassword } |
| Validation | Email: valid format; New password: same rules as registration |
| Security | Token expires after 1 hour; one-time use |

### 5.5 PG-BIZ-010 — Onboarding Wizard

**Purpose:** Progressive business verification: Company Info → Documents → First Campaign (REQ-PRD-177).

| Aspect | Specification |
|--------|--------------|
| Layout | Full-width wizard with step indicator (3 steps), content area, navigation buttons |
| Step 1 | **Company Information:** Company legal name, PAN/VAT number, Address, Phone, Industry/category, Website (optional) |
| Step 2 | **Document Upload:** PAN/VAT certificate, Business registration certificate, Authorized representative ID (per RULE-BIZ-002) |
| Step 3 | **Complete:** Confirmation message, "Documents under review" status, estimated timeline |
| API Calls | Step 1: PATCH /api/v1/businesses/me/profile; Step 2: POST /api/v1/media/upload + POST /api/v1/businesses/me/documents; Step 3: GET /api/v1/businesses/me (status check) |
| Progress | Step indicator shows completed/current/upcoming; completed steps are tappable to review (read-only) |
| Resume | Wizard state persisted server-side; user returns to last incomplete step |
| Validation | Step 1: All required fields must be filled; Step 2: All 3 documents must be uploaded |
| Error States | Upload failure → retry per document; API error → toast with retry |
| Note | First Campaign creation is NOT part of onboarding wizard — business must be Verified first (RULE-BIZ-004) |

### 5.6 PG-BIZ-020 — Dashboard

**Purpose:** Business overview showing active campaigns, spend summary, and pending actions (REQ-PRD-179).

| Aspect | Specification |
|--------|--------------|
| Layout | KPI cards row, active campaigns section with capacity meters, recent activity, pending actions |
| KPI Cards | Active Campaigns (count); Total Spend (NPR, lifetime); Current Period Spend (NPR); Average Fulfillment Rate (%) |
| Active Campaigns | Card per campaign: name, status badge, capacity meter (X/Y riders filled), days remaining, daily spend |
| Pending Actions | Payment pending → link to payment submission; Documents under review → status indicator; Campaign drafts → link to complete |
| Recent Activity | Timeline of last 10 events (campaign state changes, payments, verifications) |
| API Calls | GET /api/v1/businesses/me/dashboard |
| Actions | Click campaign card → PG-BIZ-032; Click pending action → relevant page; "Create Campaign" button → PG-BIZ-031 |
| Error States | API error → retry banner at top |
| Empty State | No campaigns: "Ready to reach thousands of riders? Create your first campaign." with CTA button |
| Loading State | Skeleton cards for KPIs, skeleton campaign cards |
| Real-time | WebSocket: campaign status updates, payment verification notifications |

### 5.7 PG-BIZ-030 — Campaign List

**Purpose:** View all campaigns with filtering (REQ-PRD-178).

| Aspect | Specification |
|--------|--------------|
| Layout | Header with "Create Campaign" button, filters row, campaign table/cards |
| Filters | Status (multi-select: Draft, Pending Payment, Running, Completed, Cancelled); Date range (start date filter); Search (campaign name) |
| Table Columns | Campaign name; Status (badge); Riders (X/Y capacity); Duration; Total cost; Created date; Actions |
| Actions | Row click → PG-BIZ-032; "Create Campaign" → PG-BIZ-031; Status filter chips; Sort by any column |
| API Calls | GET /api/v1/businesses/me/campaigns?status=X&from=Y&to=Z&search=Q&page=N |
| Pagination | Server-side, 20 per page, page navigation at bottom |
| Error States | API error → error state with retry; No results → "No campaigns match your filters" |
| Empty State | Zero campaigns: "No campaigns yet. Create your first campaign to start advertising." |
| Loading State | Table skeleton rows |
| Responsive | On mobile: switch from table to card layout |

### 5.8 PG-BIZ-031 — Campaign Creation Wizard

**Purpose:** Multi-step campaign creation (REQ-PRD-178, RULE-CMP-001 through RULE-CMP-005).

| Aspect | Specification |
|--------|--------------|
| Layout | 4-step wizard with progress indicator, content area, Back/Next buttons |

**Step 1: Campaign Details**

| Field | Type | Validation | Reference |
|-------|------|-----------|-----------|
| Campaign Name | Text | Required, 3-100 chars | REQ-PRD-038 |
| Target Zones | Multi-select | At least 1 zone required | REQ-PRD-038 |
| Start Date | Date picker | Must be ≥ 7 days from today | RULE-CMP-001 |
| End Date | Date picker | Must be ≥ 15 days after start (RULE-CMP-001) | REQ-PRD-040 |
| Duration | Computed | Auto-calculated from dates, displayed | REQ-PRD-038 |

**Step 2: Capacity & Creative**

| Field | Type | Validation | Reference |
|-------|------|-----------|-----------|
| Number of Riders | Number input | Minimum 100 (RULE-CMP-002) | REQ-PRD-039 |
| Creative Upload | File upload | JPEG/PNG/PDF, max 10MB | REQ-PRD-109 |
| Creative Guidelines | Read-only | Display printing specifications | UX |

**Step 3: Budget Summary**

| Display | Value | Calculation |
|---------|-------|------------|
| Riders | X | From Step 2 |
| Duration | Y days | From Step 1 |
| Daily Rate | NPR 120/rider/day | RULE-FIN-001 |
| Total Cost | NPR (X × Y × 120) | RULE-CMP-003 |
| Payment Methods | List of accepted methods | RULE-PAY-006 |

**Step 4: Confirm & Submit**

| Display | Specification |
|---------|--------------|
| Summary | All campaign details in read-only review format |
| Terms | Checkbox: "I agree to the campaign terms and conditions" (required) |
| Action | "Create Campaign" button → creates Draft campaign |
| API Call | POST /api/v1/campaigns { name, zones, startDate, endDate, riders, creativeMediaId } |

| Error States | Specification |
|--------------|--------------|
| Validation failures | Inline per field, prevent "Next" until resolved |
| API error on submit | Toast with retry, preserve all form data |
| Creative upload failure | Retry with progress indicator |

### 5.9 PG-BIZ-032 — Campaign Detail

**Purpose:** Complete campaign view with status, capacity, compliance, and timeline (REQ-PRD-179).

| Aspect | Specification |
|--------|--------------|
| Layout | Header (name + status badge), tab navigation (Overview, Timeline, Reports) |

**Overview Tab:**

| Section | Data |
|---------|------|
| Status Card | Current status, state transition timestamp, next expected action |
| Capacity Meter | Visual progress bar: X/Y riders assigned (percentage) |
| Financial Summary | Total cost, amount paid, escrow balance, daily release rate |
| Campaign Spec | Name, zones, dates, duration, rider count, creative preview |
| Actions Available | Based on status (see table below) |

**Status-Based Actions:**

| Campaign Status | Available Actions |
|----------------|-------------------|
| Draft | Edit, Delete, Confirm (→ Pending Payment) |
| Pending Payment | Submit Payment (→ PG-BIZ-041) |
| Payment Submitted | View payment proof (read-only, awaiting verification) |
| Payment Verified | No action (system recruits) |
| Recruiting Riders | View capacity progress (read-only) |
| Ready | No action (awaiting start date) |
| Running | View compliance metrics |
| Completed | View final report, Download invoice |
| Cancelled | View cancellation details, refund status |

**Timeline Tab:**

| Aspect | Specification |
|--------|--------------|
| Layout | Chronological event list with date grouping |
| Events | State transitions, payment events, rider assignments, verification events |
| API | GET /api/v1/timeline?entityType=campaign&entityId={id} |

**Reports Tab (Running/Completed only):**

| Metric | Description |
|--------|-------------|
| Fulfillment Rate | % of rider-days delivered vs. required |
| Compliance Rate | % of verifications passed |
| Daily Progress | Chart showing daily active riders |

| API Calls | GET /api/v1/campaigns/{id}; GET /api/v1/campaigns/{id}/metrics |
| Error States | Campaign not found → 404 page; API error → retry banner |
| Loading State | Skeleton sections |

### 5.10 PG-BIZ-033 — Campaign Renewal

**Purpose:** Create a new campaign based on a completed campaign's parameters.

| Aspect | Specification |
|--------|--------------|
| Layout | Pre-filled campaign creation wizard (same as PG-BIZ-031) with previous campaign data |
| Pre-filled | Campaign name (appended "- Renewal"), same zones, same rider count, same creative (changeable) |
| Dates | Must select new dates (start ≥ 7 days from today) |
| API Calls | POST /api/v1/campaigns { ...renewal data, renewedFrom: previousCampaignId } |

### 5.11 PG-BIZ-040 — Billing Overview

**Purpose:** Financial summary and invoice history (REQ-PRD-181).

| Aspect | Specification |
|--------|--------------|
| Layout | Summary cards row, payment history table, invoice list |
| Summary Cards | Total Spent (NPR, lifetime); Outstanding Balance (pending payments); Active Escrow (held funds) |
| Payment History | Table: Date, Campaign, Amount, Method, Status, Reference |
| Invoice List | Table: Invoice #, Date, Campaign, Amount, Status, Download (PDF) |
| API Calls | GET /api/v1/businesses/me/billing/summary; GET /api/v1/businesses/me/payments?page=N; GET /api/v1/businesses/me/invoices?page=N |
| Actions | Download invoice PDF; Click "Pay" on pending → PG-BIZ-041; Click invoice → PG-BIZ-042 |
| Empty State | "No billing history. Your payment records will appear here after your first campaign." |
| Loading State | Skeleton tables |

### 5.12 PG-BIZ-041 — Payment Submission

**Purpose:** Manual payment proof upload (REQ-PRD-180, RULE-PAY-006, RULE-PAY-007).

| Aspect | Specification |
|--------|--------------|
| Layout | Campaign cost summary (read-only), payment form, submit button |
| Payment Summary | Campaign name, total amount due (NPR), accepted methods |
| Form Fields | Payment method (dropdown: eSewa, Khalti, Bank Transfer, IME Pay); Amount paid (NPR, must match campaign cost); Transaction/Reference ID (required); Payment date (date picker); Screenshot/proof (file upload, required) |
| API Calls | POST /api/v1/media/upload (proof image) → POST /api/v1/finance/payments { campaignId, method, amount, referenceId, date, proofMediaId } |
| Validation | Amount SHALL equal campaign total cost; Reference ID: required, alphanumeric; Proof: image file, max 10MB; All fields required |
| Error States | Amount mismatch → "Amount must equal campaign cost of NPR X"; Upload failure → retry; API error → toast with retry |
| Loading State | Submit button spinner |
| Success | Redirect to campaign detail with "Payment submitted, awaiting verification" status |
| Note | This is a MANUAL flow — business transfers money externally, then uploads proof here |

### 5.13 PG-BIZ-042 — Invoice Detail

**Purpose:** View individual invoice with download capability.

| Aspect | Specification |
|--------|--------------|
| Layout | Invoice header (number, date, status), line items, total, download button |
| Data | Invoice number, issue date, campaign reference, line items (riders × days × rate), tax (if applicable), total, payment status |
| Actions | "Download PDF" → GET /api/v1/businesses/me/invoices/{id}/pdf |
| API Calls | GET /api/v1/businesses/me/invoices/{id} |

### 5.14 PG-BIZ-050 — Ticket List

**Purpose:** Support ticket management (REQ-PRD-182).

| Aspect | Specification |
|--------|--------------|
| Layout | "Create Ticket" button, filters (status), ticket table |
| Table Columns | Subject, Category, Status (badge), Created, Last Updated, Actions |
| Filters | Status: Open, In Progress, Awaiting Response, Resolved, Closed |
| API Calls | GET /api/v1/support/tickets?page=N&status=X |
| Actions | Row click → PG-BIZ-052; "Create Ticket" → PG-BIZ-051 |
| Empty State | "No support tickets. Need help? Create a ticket and we'll respond within 24 hours." |

### 5.15 PG-BIZ-051 — Create Ticket

**Purpose:** Submit a new support request.

| Aspect | Specification |
|--------|--------------|
| Layout | Form: category, subject, description, attachments, submit button |
| Fields | Category (dropdown: Technical, Financial, Campaign, General); Subject (required, 5-200 chars); Description (required, 10-5000 chars, rich text); Attachments (optional, up to 3 files, max 10MB each) |
| API Calls | POST /api/v1/support/tickets { category, subject, description, mediaIds } |
| Success | Redirect to PG-BIZ-052 (conversation view) |

### 5.16 PG-BIZ-052 — Ticket Conversation

**Purpose:** View and reply within a support ticket.

| Aspect | Specification |
|--------|--------------|
| Layout | Ticket header (subject, status, category), message thread, reply form |
| Messages | Chronological, sender-differentiated (business right, staff left), timestamps, attachments |
| Reply Form | Text area + attachment button + send (available when status ≠ Closed) |
| API Calls | GET /api/v1/support/tickets/{id}/messages; POST /api/v1/support/tickets/{id}/messages |
| Real-time | WebSocket event for new messages |
| Actions | Reply; Attach file; "Close Ticket" (if in Resolved status) |

### 5.17 PG-BIZ-060 — Company Profile

**Purpose:** View and edit company information.

| Aspect | Specification |
|--------|--------------|
| Layout | Form sections: Company Info, Contact Person, Address, Documents status |
| Fields | Company legal name, PAN/VAT number (read-only after verification), Address, Phone, Website, Contact person name, Contact person email, Contact person phone |
| API Calls | GET /api/v1/businesses/me; PATCH /api/v1/businesses/me/profile |
| Constraints | PAN/VAT number and legal name SHALL be read-only after business verification (changes require support ticket) |
| Documents | Display document status (Approved/Pending/Rejected) with re-upload option for rejected ones |

### 5.18 PG-BIZ-061 — Billing Details

**Purpose:** Configure payment-related information.

| Aspect | Specification |
|--------|--------------|
| Layout | Payment preferences form, billing address |
| Fields | Preferred payment method (dropdown); Billing address; Tax identifier (if different from PAN) |
| API Calls | PATCH /api/v1/businesses/me/billing |

### 5.19 PG-BIZ-062 — Notification Preferences

**Purpose:** Control notification delivery.

| Aspect | Specification |
|--------|--------------|
| Layout | Toggle list by notification category |
| Categories | Campaign updates (status changes); Payment confirmations; Verification reports; Support responses; Platform announcements |
| Channels | Email, In-app (toggle per category) |
| API Calls | GET /api/v1/notifications/preferences; PATCH /api/v1/notifications/preferences |


---

## 6. Onboarding Flow

### 6.1 Design Principles

- **Progressive Disclosure:** Information collected in logical steps, not a single long form.
- **Resume Capability:** Wizard state persisted server-side; returning users land on the last incomplete step.
- **Progress Indicator:** Horizontal step indicator visible throughout showing Step 1/2/3.
- **Completion Gate:** Business SHALL NOT access campaign features until verification is complete (RULE-BIZ-004).

### 6.2 Onboarding States

| Business Status | Portal Behavior |
|----------------|----------------|
| Registered | Redirect to onboarding wizard Step 1 |
| Documents Pending | Redirect to onboarding wizard Step 3 (awaiting review) |
| Under Review | Show "Under Review" interstitial with estimated timeline |
| Verified | Full portal access, "Create First Campaign" prompt on dashboard |
| Active | Full portal access |
| Suspended | Show suspension notice with reason and support link |
| Blacklisted | Show permanent restriction notice |

### 6.3 Post-Verification Activation

Upon reaching Verified status (detected via WebSocket event or polling):
1. Display success notification.
2. Redirect to dashboard.
3. Show "Create Your First Campaign" prominent CTA.
4. First campaign creation transitions business to Active (RULE-BIZ-005).

---

## 7. Campaign Management

### 7.1 Campaign Creation Rules

| Rule | Enforcement | Reference |
|------|-------------|-----------|
| Minimum 100 riders | Input validation (min value) + API validation | RULE-CMP-002 |
| Minimum 15 days duration | Date picker constraint + computed validation | RULE-CMP-001 |
| Cost = riders × days × NPR 120 | Auto-calculated, read-only display | RULE-CMP-003 |
| Verified/Active business only | Route guard + API enforcement | RULE-BIZ-004 |
| Payment before recruitment | Status flow enforced by backend | RULE-CMP-005 |
| NPR currency only | Fixed display, no currency selector | RULE-CMP-010 |

### 7.2 Campaign List View

The campaign list SHALL support three view modes (user-selectable, persisted):
1. **Table View** (default on desktop): Sortable columns, compact data display.
2. **Card View** (default on mobile): Campaign cards with capacity meters.
3. **Status Board** (optional): Kanban-style columns by status.

### 7.3 Campaign Detail Sections

For campaigns in Running or Completed status, the detail page SHALL display:

| Section | Content |
|---------|---------|
| Capacity Meter | Visual bar: X of Y riders assigned (color-coded: green ≥ 90%, amber 70-89%, red < 70%) |
| Compliance Dashboard | % verifications passed this cycle, trend indicator |
| Financial Tracker | Paid amount, escrow balance, daily release, total released to date |
| Timeline | Auto-generated events from backend (references Document 03 §3.4) |

### 7.4 Campaign Renewal

A business MAY renew a Completed campaign:
1. Navigate to completed campaign detail.
2. Click "Renew Campaign" button.
3. Portal pre-fills creation wizard with previous parameters.
4. Business adjusts dates (mandatory) and optionally modifies other fields.
5. Submission creates a new campaign in Draft status linked to the original.

---

## 8. Payment Flow

### 8.1 Manual Payment Process

The payment flow is ENTIRELY MANUAL (no payment gateway integration per Document 01 §13):

```
Business calculates amount → Transfers externally (eSewa/Khalti/Bank/IME Pay)
→ Returns to portal → Uploads proof with details → Awaits Finance Staff verification
```

### 8.2 Payment Submission Requirements

| Field | Required | Validation |
|-------|----------|-----------|
| Payment Method | Yes | Must be in configured list (RULE-PAY-006) |
| Amount (NPR) | Yes | Must exactly match campaign total cost |
| Transaction/Reference ID | Yes | Non-empty, alphanumeric + hyphens |
| Payment Date | Yes | Not in the future; not older than 7 days |
| Proof Screenshot | Yes | Image file (JPEG/PNG), max 10MB |

### 8.3 Payment Status Flow

```
Not Paid → Payment Submitted → Payment Verified / Payment Rejected
                                        ↓                    ↓
                                 Campaign proceeds    Business re-submits
```

### 8.4 Post-Payment States

| Status | Business Portal Display |
|--------|------------------------|
| Payment Submitted | "Payment under review. You'll be notified once verified." |
| Payment Verified | "Payment confirmed! Rider recruitment has begun." |
| Payment Rejected | "Payment could not be verified. Reason: {reason}. Please re-submit." with re-submit button |

---

## 9. Billing and Invoices

### 9.1 Invoice Generation

- An invoice SHALL be auto-generated upon payment verification (REQ-PRD-081).
- Invoice SHALL contain: Invoice number, Date, Business details, Campaign reference, Line items, Total, Payment method, Payment reference.

### 9.2 Invoice List

| Column | Description |
|--------|-------------|
| Invoice # | Unique sequential identifier |
| Date | Issue date |
| Campaign | Campaign name |
| Amount | Total NPR |
| Status | Paid |
| Action | Download PDF |

### 9.3 PDF Export

- Invoice PDF SHALL be generated server-side via GET /api/v1/businesses/me/invoices/{id}/pdf.
- PDF SHALL include company letterhead, GST/VAT details, line item breakdown.
- Download SHALL trigger browser file download.

---

## 10. Reporting

### 10.1 Campaign Performance (PG-BIZ-032 Reports Tab)

| Metric | Description | Visualization |
|--------|-------------|---------------|
| Fulfillment Rate | Rider-days delivered / rider-days purchased × 100 | Percentage + progress bar |
| Verification Compliance | Passed verifications / total verifications × 100 | Percentage + trend line |
| Daily Active Riders | Riders verified active per day | Line chart (30-day view) |
| Total Impressions Estimate | Riders × avg daily trips × days | Number (informational) |

### 10.2 Spend Tracker (PG-BIZ-040)

| View | Data |
|------|------|
| Summary | Total lifetime spend, current month spend, average campaign cost |
| By Campaign | Breakdown per campaign: cost, status, fulfillment |
| By Month | Monthly spend trend (bar chart, last 12 months) |

### 10.3 Data Export

- Campaign reports SHALL support CSV export.
- Invoice list SHALL support CSV export.
- Payment history SHALL support CSV export.
- All exports via GET endpoints with `format=csv` query parameter.

---

## 11. Responsive Design

### 11.1 Breakpoints

| Breakpoint | Width | Layout Adaptation |
|-----------|-------|-------------------|
| Mobile | < 768px | Single column, bottom navigation fallback, card views |
| Tablet | 768px–1024px | Collapsed sidebar (icons), 2-column grids |
| Desktop | > 1024px | Full sidebar, tables, multi-column layouts |

### 11.2 Critical Mobile Actions

The following actions SHALL be fully functional on mobile viewport:

| Action | Mobile Adaptation |
|--------|-------------------|
| View campaign status | Card layout with key metrics |
| Submit payment | Full-width form, camera-accessible upload |
| View notifications | Full-screen list |
| Create support ticket | Full-width form |
| View billing summary | Stacked cards |

### 11.3 Tablet Optimization

- Campaign detail SHALL use a 2-column layout (info left, timeline right).
- Dashboard SHALL use a 2×2 KPI grid (not 4×1 row).
- Tables SHALL be horizontally scrollable with fixed first column.

---

## 12. Real-Time Updates

### 12.1 Socket.IO Connection

| Aspect | Specification |
|--------|--------------|
| Server | wss://api.soloadvertiser.com/socket.io |
| Auth | JWT access token in handshake auth |
| Namespace | /business |
| Connection | Establish on page load after authentication |
| Disconnection | On tab close or explicit logout |

### 12.2 Events Consumed

| Event | Payload | UI Update |
|-------|---------|-----------|
| campaign:status_changed | { campaignId, oldStatus, newStatus } | Campaign list/detail refresh, toast notification |
| payment:verified | { campaignId, paymentId } | Billing refresh, campaign status update, toast |
| payment:rejected | { campaignId, reason } | Toast with reason, campaign detail update |
| notification:new | { id, title, body, type } | Toast notification, badge increment |
| verification:report | { campaignId, complianceRate } | Campaign detail metrics update |

### 12.3 Optimistic Updates

- Campaign creation: Show "Creating..." → on success update list; on failure revert.
- Payment submission: Show "Submitting..." → on success navigate; on failure show error.
- Ticket replies: Show message immediately → on failure mark as "failed to send" with retry.

---

## 13. Traceability

### 13.1 Page to Requirement Mapping

| Page ID | Primary Requirements |
|---------|---------------------|
| PG-BIZ-001 | REQ-PRD-002, REQ-PRD-176, RULE-BIZ-001 |
| PG-BIZ-002 | REQ-PRD-002, REQ-PRD-176, REQ-PRD-010 |
| PG-BIZ-003 | REQ-PRD-002, REQ-PRD-176 |
| PG-BIZ-010 | REQ-PRD-177, RULE-BIZ-002 |
| PG-BIZ-020 | REQ-PRD-179 |
| PG-BIZ-030 | REQ-PRD-178 |
| PG-BIZ-031 | REQ-PRD-178, RULE-CMP-001, RULE-CMP-002, RULE-CMP-003, RULE-CMP-005 |
| PG-BIZ-032 | REQ-PRD-179, REQ-PRD-053 |
| PG-BIZ-033 | REQ-PRD-178 |
| PG-BIZ-040 | REQ-PRD-181, REQ-PRD-081 |
| PG-BIZ-041 | REQ-PRD-180, RULE-PAY-006, RULE-PAY-007 |
| PG-BIZ-042 | REQ-PRD-181 |
| PG-BIZ-050–052 | REQ-PRD-182, REQ-PRD-114, REQ-PRD-118 |
| PG-BIZ-060 | REQ-PRD-035 |
| PG-BIZ-061 | REQ-PRD-035 |
| PG-BIZ-062 | REQ-PRD-091 |

### 13.2 Business Rule Enforcement

| Rule | Enforced In |
|------|-------------|
| RULE-BIZ-001 | PG-BIZ-002 (email registration) |
| RULE-BIZ-002 | PG-BIZ-010 Step 2 (3 documents required) |
| RULE-BIZ-004 | Route guard on /campaigns/new (Verified/Active only) |
| RULE-BIZ-005 | System-driven (first campaign → Active) |
| RULE-CMP-001 | PG-BIZ-031 Step 1 (min 15 days) |
| RULE-CMP-002 | PG-BIZ-031 Step 2 (min 100 riders) |
| RULE-CMP-003 | PG-BIZ-031 Step 3 (cost calculation display) |
| RULE-CMP-010 | All financial displays (NPR only, no currency selection) |
| RULE-PAY-006 | PG-BIZ-041 (payment methods dropdown) |
| RULE-PAY-007 | PG-BIZ-041 → PG-BIZ-032 (await manual verification) |

### 13.3 API Dependency Map

| Page | Endpoints Used |
|------|---------------|
| PG-BIZ-001 | POST /api/v1/auth/login |
| PG-BIZ-002 | POST /api/v1/auth/register |
| PG-BIZ-003 | POST /api/v1/auth/verify-email, POST /api/v1/auth/resend-verification |
| PG-BIZ-010 | PATCH /api/v1/businesses/me/profile, POST /api/v1/media/upload, POST /api/v1/businesses/me/documents |
| PG-BIZ-020 | GET /api/v1/businesses/me/dashboard |
| PG-BIZ-030 | GET /api/v1/businesses/me/campaigns |
| PG-BIZ-031 | GET /api/v1/zones, POST /api/v1/media/upload, POST /api/v1/campaigns |
| PG-BIZ-032 | GET /api/v1/campaigns/{id}, GET /api/v1/campaigns/{id}/metrics, GET /api/v1/timeline |
| PG-BIZ-040 | GET /api/v1/businesses/me/billing/summary, GET /api/v1/businesses/me/payments, GET /api/v1/businesses/me/invoices |
| PG-BIZ-041 | POST /api/v1/media/upload, POST /api/v1/finance/payments |
| PG-BIZ-042 | GET /api/v1/businesses/me/invoices/{id}, GET /api/v1/businesses/me/invoices/{id}/pdf |
| PG-BIZ-050 | GET /api/v1/support/tickets |
| PG-BIZ-051 | POST /api/v1/support/tickets |
| PG-BIZ-052 | GET /api/v1/support/tickets/{id}/messages, POST /api/v1/support/tickets/{id}/messages |
| PG-BIZ-060 | GET /api/v1/businesses/me, PATCH /api/v1/businesses/me/profile |
| PG-BIZ-062 | GET /api/v1/notifications/preferences, PATCH /api/v1/notifications/preferences |

---

*End of Document 10*
