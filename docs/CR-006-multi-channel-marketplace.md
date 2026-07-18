# CR-006 — Multi-Channel Advertising Marketplace & Pre-Enrollment System

**Project:** Solo Advertiser Platform  
**Version:** 1.1  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Change Request Specification  
**Priority:** Medium (Architecture Extension)  
**Affects:** Business Portal, Partner App, Admin Panel, Super Admin, Domain Model, Configuration, API  
**MVP Impact:** Helmet Advertising remains the only active campaign type  
**Governing Principle:** Solo Advertiser is an Advertising Inventory Marketplace. This CR defines the complete channel catalog, capability maturity model, pre-order/pre-enrollment UX, and market validation system. No campaign execution SHALL occur for non-Active channels.

---

## 1. Objective & Scope

### 1.1 Purpose

This Change Request expands Solo Advertiser from a helmet advertising platform into a unified advertising marketplace encompassing both Physical and Digital advertising channels. The platform SHALL collect demand from businesses and supply from advertising partners for future advertising channels while maintaining Helmet Advertising as the sole operational MVP channel.

### 1.2 Strategic Intent

Registrations captured through this system SHALL be treated as **market intelligence and launch readiness indicators**, NOT as disabled placeholders. Every pre-order and pre-enrollment represents real demand or supply that:

- Validates market hypotheses before feature development
- Demonstrates supply-side readiness to investors
- Confirms business-side demand with budget commitments
- Identifies geographic expansion opportunities
- Generates future revenue forecasts backed by real user data

### 1.3 Scope Boundaries

| Dimension | Boundary |
|-----------|----------|
| MVP Impact | NONE — Helmet Advertising remains the ONLY Live operational channel |
| Channel Catalog | 22 advertising channels (12 Physical + 10 Digital) |
| Partner Categories | 16 partner types with enrollment requirements |
| Maturity Model | 8-stage Capability Maturity Model replacing simple 4-status |
| UX Changes | Business Portal channel selection, Partner App enrollment, Admin dashboards |
| Data Collection | Pre-orders, pre-enrollments, market surveys, analytics |
| Execution | NO campaign execution for non-Active channels |


### 1.4 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Change Request rule identifiers use prefix CR6-NNN.
- Channel identifiers use prefix CH-NNN.
- Partner category identifiers use prefix PC-NNN.
- Capability Maturity Model stage identifiers use prefix CMM-NNN.
- All identifiers trace to Document 19 and upstream documents (01–18).

### 1.5 Upstream References

| Document | Relevant Sections |
|----------|-------------------|
| Document 19 | §3 (Inventory Abstraction), §6 (Two-Sided Model), §10 (Readiness Score) |
| Document 10 | Business Portal UX (campaign creation flow) |
| Document 09 | Rider/Partner App UX (enrollment flow) |
| Document 11 | Admin Panel (dashboard structure) |
| Document 06 | Configuration Dictionary (settings, feature flags) |
| Document 05 | Data Model (schema conventions, table prefixes) |
| Document 03 | Domain Model (bounded contexts, aggregates) |

---

## 2. Capability Maturity Model

### 2.1 Overview

This CR introduces an 8-stage Capability Maturity Model (CMM) that REPLACES the simple 4-status lifecycle from Document 19 (Live / Pre-Order / Paused / Retired). The CMM provides granular visibility into each channel's progression from concept to international availability.

### 2.2 Evolution from Document 19

The 4-status model maps into the 8-stage CMM as follows:

| Doc 19 Status | CMM Mapping | Rationale |
|---------------|-------------|-----------|
| Pre-Order | CMM-002 (Pre-Order Open) + CMM-003 (Pre-Enrollment Open) | Split demand capture from supply enrollment |
| Live | CMM-005 (Live) | Direct mapping — fully operational |
| Paused | Pause overlay (applicable at any stage) | Orthogonal concern; not a maturity stage |
| Retired | Terminal state (reachable from any stage) | Orthogonal concern; not a maturity stage |

This is an **evolution**, not a conflict. The original 4-status model remains valid as a simplified view. The CMM adds operational granularity for internal planning.


### 2.3 Maturity Stages

| ID | Stage | Visibility | Description |
|----|-------|-----------|-------------|
| CMM-001 | Market Research | Internal only | Idea under evaluation; not visible to any external user |
| CMM-002 | Pre-Order Open | Businesses | Businesses can register interest and submit pre-orders |
| CMM-003 | Pre-Enrollment Open | Businesses + Partners | Partners can enroll; businesses continue pre-ordering |
| CMM-004 | Pilot Program | Limited users | Limited rollout in selected zones with invited participants |
| CMM-005 | Live | All users | Fully operational; campaigns execute, partners fulfill |
| CMM-006 | Scaling | All users | Expanding to additional regions beyond initial launch zones |
| CMM-007 | National | All users | Available across all regions in Nepal |
| CMM-008 | International | All users | Multi-country support with localized operations |

### 2.4 Stage Transition Rules

| ID | From | To | Authority | Prerequisites | Side Effects |
|----|------|----|-----------|---------------|--------------|
| CR6-001 | CMM-001 | CMM-002 | Super Admin | Channel configuration complete | Business pre-order forms become visible |
| CR6-002 | CMM-002 | CMM-003 | Super Admin | Minimum 10 business pre-orders received | Partner enrollment forms become visible |
| CR6-003 | CMM-003 | CMM-004 | Super Admin | Min partners enrolled + min business demand met | Pilot invitations sent to selected participants |
| CR6-004 | CMM-004 | CMM-005 | Super Admin | Pilot success metrics met + operational readiness 100% | Full operational workflows activated |
| CR6-005 | CMM-005 | CMM-006 | Super Admin | Stable operations in launch zones for 30+ days | New zones opened for enrollment |
| CR6-006 | CMM-006 | CMM-007 | Super Admin | Coverage in 75%+ of country regions | National marketing enabled |
| CR6-007 | CMM-007 | CMM-008 | Super Admin | Legal/regulatory approval for target countries | Multi-currency and localization activated |

### 2.5 Pause and Retirement

Pause and Retirement are orthogonal to the maturity model:

| ID | Rule | Description |
|----|------|-------------|
| CR6-008 | Any stage MAY be paused by Super Admin | Suspends all active operations and new enrollments |
| CR6-009 | Any stage MAY transition to Retired by Super Admin | Irreversible; archives all data; no further operations |
| CR6-010 | Pause SHALL NOT reset maturity progress | Resuming returns to the same stage |
| CR6-011 | Retirement SHALL trigger notification to all enrolled parties | Businesses and partners informed of decommissioning |

### 2.6 MVP Maturity Assignments

| Channel | Maturity Stage | Rationale |
|---------|---------------|-----------|
| CH-001 (Helmet Advertising) | CMM-005 (Live) | Sole operational MVP channel |
| All other channels | CMM-002 (Pre-Order Open) | Collecting market demand data |

---


## 3. Advertising Channel Catalog

### 3.1 Channel Categories

This CR introduces a top-level categorization that extends Document 19's inventory categories (Vehicle, Wearable, Property, Infrastructure, Delivery) with a **Physical / Digital** super-category:

| Super-Category | Description | Sub-Categories |
|----------------|-------------|----------------|
| Physical Advertising | Tangible surfaces requiring material production and installation | Vehicle, Wearable, Property, Infrastructure, Event |
| Digital Advertising | Online platforms and digital media requiring content coordination | Social Media, Content, Community, Campaign |

### 3.2 Physical Advertising Channels

| ID | Code | Name | Sub-Category | Maturity | Partner Type |
|----|------|------|-------------|----------|--------------|
| CH-001 | `helmet_advertising` | Helmet Advertising | Vehicle | CMM-005 (Live) | Helmet Rider (PC-001) |
| CH-002 | `taxi_exterior` | Taxi Exterior Advertising | Vehicle | CMM-002 | Taxi Driver (PC-002) |
| CH-003 | `taxi_interior` | Taxi Interior Advertising | Vehicle | CMM-002 | Taxi Driver (PC-002) |
| CH-004 | `delivery_jacket` | Delivery Rider Jacket | Wearable | CMM-002 | Delivery Rider (PC-013) |
| CH-005 | `windcheater_advertising` | Windcheater Advertising | Wearable | CMM-002 | Ride Sharing Driver (PC-003) |
| CH-006 | `tshirt_advertising` | T-Shirt Advertising | Wearable | CMM-002 | Corporate Employee (PC-014) |
| CH-007 | `bus_interior` | Public Bus Interior | Infrastructure | CMM-002 | Public Bus Operator (PC-004) |
| CH-008 | `bus_exterior` | Public Bus Exterior | Infrastructure | CMM-002 | Public Bus Operator (PC-004) |
| CH-009 | `property_hoardings` | Property Hoardings | Property | CMM-002 | Property Owner (PC-005) |
| CH-010 | `wall_branding` | Wall Branding | Property | CMM-002 | Wall Owner (PC-006) |
| CH-011 | `rooftop_branding` | Rooftop Branding | Property | CMM-002 | Property Owner (PC-005) |
| CH-012 | `event_promotion` | Event Promotion | Event | CMM-002 | Event Volunteer (PC-016) |

### 3.3 Digital Advertising Channels

| ID | Code | Name | Sub-Category | Maturity | Partner Type |
|----|------|------|-------------|----------|--------------|
| CH-013 | `influencer_marketing` | Influencer Marketing | Social Media | CMM-002 | Influencer (PC-007) |
| CH-014 | `youtube_promotion` | YouTube Promotion | Content | CMM-002 | YouTuber (PC-008) |
| CH-015 | `blog_promotion` | Blog Promotion | Content | CMM-002 | Blogger (PC-009) |
| CH-016 | `instagram_marketing` | Instagram Marketing | Social Media | CMM-002 | Instagram Creator (PC-010) |
| CH-017 | `tiktok_marketing` | TikTok Marketing | Social Media | CMM-002 | TikTok Creator (PC-011) |
| CH-018 | `facebook_marketing` | Facebook Page Marketing | Social Media | CMM-002 | Facebook Page Owner (PC-012) |
| CH-019 | `news_portal` | News Portal Advertising | Content | CMM-002 | News Portal Owner (—) |
| CH-020 | `community_marketing` | Community Marketing | Community | CMM-002 | College Ambassador (PC-015) |
| CH-021 | `email_marketing` | Email Marketing | Campaign | CMM-002 | (Platform-managed) |
| CH-022 | `digital_campaign` | Digital Campaign | Campaign | CMM-002 | (Platform-managed) |

### 3.4 Channel Relationship to Document 19

| CH Code | Doc 19 INV Code | Relationship |
|---------|----------------|--------------|
| CH-001 | INV-001 | Direct mapping (Helmet Advertising) |
| CH-002 | INV-002, INV-003 | Consolidates taxi exterior surfaces |
| CH-003 | INV-004 | Maps to taxi interior display |
| CH-004 | INV-005 | Maps to rideshare jacket (extended to delivery) |
| CH-005 | INV-006 | Maps to rideshare windcheater |
| CH-006 | INV-007 | Maps to rideshare t-shirt (extended scope) |
| CH-007 | INV-015, INV-016, INV-017 | Consolidates bus interior surfaces |
| CH-008 | — | New channel (bus exterior not in Doc 19) |
| CH-009 | INV-011, INV-014 | Consolidates property hoardings + signboards |
| CH-010 | INV-012 | Maps to building wall |
| CH-011 | INV-013 | Maps to building terrace (rebranded rooftop) |
| CH-012 | — | New channel (events) |
| CH-013 to CH-022 | — | New digital channels (not in Doc 19) |

---


## 4. Partner Categories

### 4.1 Overview

Partner Categories define the types of supply-side participants who can enroll in advertising channels. Each category has specific enrollment requirements, verification criteria, and data collection needs. This extends Document 19 §6.3 (Partner Generalization) with granular category definitions.

### 4.2 Physical Advertising Partner Categories

| ID | Category | Channels Served | Status |
|----|----------|----------------|--------|
| PC-001 | Helmet Rider | CH-001 | Active (MVP) |
| PC-002 | Taxi Driver | CH-002, CH-003 | Pre-Enrollment |
| PC-003 | Ride Sharing Driver | CH-005 | Pre-Enrollment |
| PC-004 | Public Bus Operator | CH-007, CH-008 | Pre-Enrollment |
| PC-005 | Property Owner | CH-009, CH-011 | Pre-Enrollment |
| PC-006 | Wall Owner | CH-010 | Pre-Enrollment |
| PC-013 | Delivery Rider | CH-004 | Pre-Enrollment |
| PC-014 | Corporate Employee | CH-006 | Pre-Enrollment |
| PC-015 | College Ambassador | CH-020 | Pre-Enrollment |
| PC-016 | Event Volunteer | CH-012 | Pre-Enrollment |

### 4.3 Digital Advertising Partner Categories

| ID | Category | Channels Served | Status |
|----|----------|----------------|--------|
| PC-007 | Influencer | CH-013 | Pre-Enrollment |
| PC-008 | YouTuber | CH-014 | Pre-Enrollment |
| PC-009 | Blogger | CH-015 | Pre-Enrollment |
| PC-010 | Instagram Creator | CH-016 | Pre-Enrollment |
| PC-011 | TikTok Creator | CH-017 | Pre-Enrollment |
| PC-012 | Facebook Page Owner | CH-018 | Pre-Enrollment |

### 4.4 Enrollment Requirements by Category

#### PC-001: Helmet Rider (Active — MVP)

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | YES | Legal name matching citizenship |
| Phone Number | YES | Verified via OTP |
| Citizenship ID | YES | Government-issued ID photo |
| Driving License | YES | Valid motorcycle license |
| Vehicle Bluebook | YES | Motorcycle registration |
| Helmet Photos | YES | Front, back, left, right views |
| Operating Zone | YES | Primary riding zone |
| Platform | YES | Pathao, inDrive, Tootle, Yango |
| Availability | YES | Weekly availability hours |

#### PC-002: Taxi Driver

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | YES | Legal name |
| Phone Number | YES | Verified via OTP |
| Citizenship ID | YES | Government ID |
| Driving License | YES | Valid taxi/public vehicle license |
| Vehicle Bluebook | YES | Taxi registration |
| Taxi Permit | YES | Commercial taxi operating permit |
| Vehicle Photos | YES | Exterior (all sides) + interior |
| Platform | YES | Pathao, inDrive, Tootle, Yango, Local Taxi |
| Operating Zone | YES | Primary operating area |
| Daily KM Estimate | OPTIONAL | Average daily kilometers driven |

#### PC-003: Ride Sharing Driver

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | YES | Legal name |
| Phone Number | YES | Verified via OTP |
| Citizenship ID | YES | Government ID |
| Driving License | YES | Valid license |
| Vehicle Bluebook | YES | Vehicle registration |
| Platform | YES | Pathao, inDrive, Tootle, Yango |
| Uniform Size | YES | S/M/L/XL/XXL for windcheater |
| Operating Zone | YES | Primary riding zone |
| Availability | YES | Weekly hours |

#### PC-004: Public Bus Operator

| Field | Required | Description |
|-------|----------|-------------|
| Company/Individual Name | YES | Legal entity name |
| Contact Phone | YES | Primary contact |
| Business Registration | YES | Company registration certificate |
| Route Permit | YES | Bus route operating permit |
| Bus Photos | YES | Interior + exterior (all sides) |
| Route Details | YES | Route name, start/end points |
| Fleet Size | YES | Number of buses on route |
| Daily Passengers | OPTIONAL | Average daily passenger count |
| Platform | YES | School Bus, College Bus, Public Transport |

#### PC-005: Property Owner

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | YES | Legal name / Company name |
| Phone Number | YES | Verified contact |
| Citizenship/Registration | YES | ID or business registration |
| Property Ownership Proof | YES | Land registry / lease agreement |
| Property Photos | YES | Available advertising surfaces |
| Property Location | YES | GPS coordinates + address |
| Surface Dimensions | YES | Width × Height (meters) |
| Visibility Score | OPTIONAL | Estimated daily foot/vehicle traffic |
| Availability | YES | Lease start date + duration |

#### PC-006: Wall Owner

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | YES | Legal name |
| Phone Number | YES | Verified contact |
| Ownership Proof | YES | Property document |
| Wall Photos | YES | Photos from multiple angles |
| Wall Location | YES | GPS coordinates + address |
| Wall Dimensions | YES | Width × Height (meters) |
| Wall Condition | YES | Current condition description |
| Road Facing | YES | Which road/street the wall faces |
| Traffic Estimate | OPTIONAL | Estimated daily passersby |


#### PC-007: Influencer

| Field | Required | Description |
|-------|----------|-------------|
| Full Name / Stage Name | YES | Public identity |
| Phone Number | YES | Verified contact |
| Primary Platform | YES | Instagram, TikTok, YouTube, Facebook |
| Profile URL | YES | Link to primary profile |
| Followers Count | YES | Current follower count |
| Monthly Reach | YES | Average monthly impressions |
| Engagement Rate | OPTIONAL | Average likes/comments ratio |
| Content Niche | YES | Category (lifestyle, food, tech, travel, etc.) |
| Previous Brand Work | OPTIONAL | Portfolio of past collaborations |
| Expected Rate | YES | Per-post rate expectation (NPR) |

#### PC-008: YouTuber

| Field | Required | Description |
|-------|----------|-------------|
| Full Name / Channel Name | YES | Channel identity |
| Phone Number | YES | Verified contact |
| Channel URL | YES | YouTube channel link |
| Subscribers | YES | Current subscriber count |
| Monthly Views | YES | Average monthly view count |
| Content Category | YES | Channel niche/category |
| Average Video Duration | OPTIONAL | Typical video length |
| Upload Frequency | YES | Videos per week/month |
| Previous Sponsorships | OPTIONAL | Past brand partnerships |
| Expected Rate | YES | Per-video rate (NPR) |

#### PC-009: Blogger

| Field | Required | Description |
|-------|----------|-------------|
| Full Name / Pen Name | YES | Author identity |
| Phone Number | YES | Verified contact |
| Blog URL | YES | Primary blog/website |
| Monthly Visitors | YES | Average unique monthly visitors |
| Domain Authority | OPTIONAL | DA score if available |
| Content Niche | YES | Blog category |
| Post Frequency | YES | Articles per week/month |
| Previous Sponsored Posts | OPTIONAL | Portfolio |
| Expected Rate | YES | Per-post rate (NPR) |

#### PC-010: Instagram Creator

| Field | Required | Description |
|-------|----------|-------------|
| Full Name / Handle | YES | Instagram identity |
| Phone Number | YES | Verified contact |
| Instagram Profile URL | YES | Profile link |
| Followers Count | YES | Current followers |
| Monthly Reach | YES | Average monthly reach |
| Engagement Rate | YES | Average engagement percentage |
| Content Niche | YES | Content category |
| Story Views Average | OPTIONAL | Average story view count |
| Reel Views Average | OPTIONAL | Average reel view count |
| Expected Rate | YES | Per-post rate (NPR) |

#### PC-011: TikTok Creator

| Field | Required | Description |
|-------|----------|-------------|
| Full Name / Username | YES | TikTok identity |
| Phone Number | YES | Verified contact |
| TikTok Profile URL | YES | Profile link |
| Followers Count | YES | Current followers |
| Monthly Views | YES | Average monthly video views |
| Engagement Rate | YES | Average engagement |
| Content Niche | YES | Content category |
| Average Video Views | OPTIONAL | Per-video view average |
| Upload Frequency | YES | Videos per week |
| Expected Rate | YES | Per-video rate (NPR) |

#### PC-012: Facebook Page Owner

| Field | Required | Description |
|-------|----------|-------------|
| Full Name / Page Name | YES | Page identity |
| Phone Number | YES | Verified contact |
| Page URL | YES | Facebook page link |
| Page Likes | YES | Current page likes |
| Monthly Reach | YES | Average monthly reach |
| Engagement Rate | OPTIONAL | Average engagement |
| Page Category | YES | Page niche/category |
| Post Frequency | YES | Posts per week |
| Expected Rate | YES | Per-post rate (NPR) |

#### PC-013: Delivery Rider

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | YES | Legal name |
| Phone Number | YES | Verified via OTP |
| Citizenship ID | YES | Government ID |
| Delivery Platform | YES | Foodmandu, Bhojdeals, Pathao Food, other |
| Delivery Company | YES | Employer/platform name |
| Jacket Size | YES | S/M/L/XL/XXL |
| Operating Zone | YES | Delivery area |
| Daily Deliveries | OPTIONAL | Average deliveries per day |
| Availability | YES | Weekly hours |

#### PC-014: Corporate Employee

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | YES | Legal name |
| Phone Number | YES | Verified contact |
| Company Name | YES | Employer name |
| Employee ID | OPTIONAL | Company ID proof |
| T-Shirt Size | YES | S/M/L/XL/XXL |
| Office Location | YES | Work address/zone |
| Commute Mode | OPTIONAL | Walk, bike, public transport |
| Availability | YES | Willingness to wear branded T-shirt |

#### PC-015: College Ambassador

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | YES | Legal name |
| Phone Number | YES | Verified contact |
| College Name | YES | Educational institution |
| Student ID | YES | Valid student ID photo |
| Year of Study | YES | Current academic year |
| Social Media Profiles | OPTIONAL | Personal social accounts |
| Campus Influence | OPTIONAL | Club memberships, roles |
| Availability | YES | Hours per week available |

#### PC-016: Event Volunteer

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | YES | Legal name |
| Phone Number | YES | Verified contact |
| Citizenship ID | YES | Government ID |
| Event Experience | OPTIONAL | Previous event participation |
| T-Shirt Size | YES | S/M/L/XL/XXL |
| Availability | YES | Date/time flexibility |
| Location Preference | YES | Preferred event locations |
| Expected Earnings | OPTIONAL | Motivation / earning expectation |

---


## 5. Business Portal — Channel Selection UX

### 5.1 Channel Discovery Page

When a business user navigates to "Create Campaign" or "Marketplace" in the Business Portal (Document 10), the system SHALL display all advertising channels grouped by category:

| ID | Rule | Description |
|----|------|-------------|
| CR6-012 | Channels SHALL be displayed in two top-level tabs: Physical and Digital | Clear category separation |
| CR6-013 | Active channels SHALL display a green indicator with "Create Campaign" CTA | Immediate action available |
| CR6-014 | Pre-Order channels SHALL display an amber indicator with "Join Pre-Order" CTA | Demand capture action |
| CR6-015 | Each channel card SHALL show: name, icon, description, estimated reach, partner count | Informed decision-making |
| CR6-016 | Channel cards SHALL show social proof: "X businesses interested" | Builds confidence |
| CR6-017 | Channels SHALL be sorted: Active first, then by interest count (descending) | Engagement optimization |

### 5.2 Channel Card Layout

Each channel card SHALL display:

```
┌─────────────────────────────────────────────┐
│  [Icon]  Channel Name            [Status]   │
│                                             │
│  Brief description of advertising surface   │
│                                             │
│  📍 Estimated Reach: X,XXX daily views      │
│  👥 Partners Available: XXX                 │
│  🏢 Businesses Interested: XX              │
│                                             │
│  [ Create Campaign ]  or  [ Join Pre-Order ]│
└─────────────────────────────────────────────┘
```

### 5.3 Business Pre-Order Form

When a business clicks "Join Pre-Order" on any Pre-Order channel, the following form SHALL be presented:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Business ID | Auto-filled | YES | From authenticated session |
| Advertising Channel | Auto-filled | YES | Selected channel (locked) |
| Estimated Budget (NPR) | Number input | YES | Monthly/campaign budget range |
| Preferred City | Dropdown | YES | Kathmandu, Lalitpur, Bhaktapur, Pokhara, Other |
| Preferred Campaign Duration | Select | YES | 7 days, 15 days, 30 days, 60 days, 90 days, Custom |
| Expected Launch Time | Select | YES | ASAP, Within 1 month, Within 3 months, Within 6 months, Flexible |
| Campaign Objective | Multi-select | YES | See §5.4 |
| Preferred Start Date | Date picker | OPTIONAL | Desired campaign start |
| Additional Notes | Textarea | OPTIONAL | Special requirements or questions |

### 5.4 Campaign Objectives

The Campaign Objective field SHALL support the following options:

| Code | Label | Description |
|------|-------|-------------|
| brand_awareness | Brand Awareness | Increase brand visibility and recognition |
| lead_generation | Lead Generation | Generate qualified leads or inquiries |
| event_promotion | Event Promotion | Promote a specific event or launch |
| product_launch | Product Launch | Launch a new product or service |
| movie_promotion | Movie Promotion | Promote an upcoming movie release |
| store_opening | Store Opening | Announce a new store/branch opening |
| festival_campaign | Festival Campaign | Seasonal/festival promotional campaign |

### 5.5 Pre-Order Confirmation

| ID | Rule | Description |
|----|------|-------------|
| CR6-018 | Pre-order submission SHALL NOT create any financial obligation | Zero-cost market signal |
| CR6-019 | Business SHALL receive confirmation with estimated timeline | Set expectations |
| CR6-020 | Business SHALL be able to view and cancel pre-orders from dashboard | Self-service management |
| CR6-021 | Business SHALL be notified when channel reaches Live status | Conversion trigger |

---


## 6. Partner App — Enrollment UX

### 6.1 Navigation Rename

| ID | Rule | Description |
|----|------|-------------|
| CR6-022 | "Become Rider" button/section SHALL be renamed to "Become Advertising Partner" | Reflects marketplace identity |
| CR6-023 | Existing helmet rider enrollment flow SHALL remain unchanged | MVP protection |
| CR6-024 | The enrollment landing page SHALL show available categories | Multi-channel awareness |

### 6.2 Enrollment Landing Page

The Partner App enrollment page SHALL display:

```
┌─────────────────────────────────────────────┐
│  Become an Advertising Partner              │
│                                             │
│  ✅ Available Today                          │
│  ┌─────────────────────────────────────┐    │
│  │ 🪖 Helmet Rider          [Enroll] │    │
│  │ Earn NPR 100/day per helmet         │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📋 Pre-Enroll for Future Opportunities     │
│  ┌─────────────────────────────────────┐    │
│  │ 🚕 Taxi Driver        [Pre-Enroll] │    │
│  │ 🏍️ Delivery Rider     [Pre-Enroll] │    │
│  │ 🏢 Property Owner     [Pre-Enroll] │    │
│  │ 📱 Influencer         [Pre-Enroll] │    │
│  │ 🎬 YouTuber           [Pre-Enroll] │    │
│  │ ... (all categories)               │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### 6.3 Enrollment Flow Rules

| ID | Rule | Description |
|----|------|-------------|
| CR6-025 | "Available Today" section SHALL show ONLY channels at CMM-005 (Live) | Clear operational status |
| CR6-026 | "Pre-Enroll" section SHALL show channels at CMM-002 or CMM-003 | Future opportunity visibility |
| CR6-027 | Each category SHALL show category-specific enrollment form | Tailored data collection |
| CR6-028 | Partners MAY pre-enroll in multiple categories simultaneously | Maximize supply capture |
| CR6-029 | Pre-enrollment SHALL NOT grant operational access | No premature activation |
| CR6-030 | Partners SHALL receive confirmation with expected timeline | Expectation management |

### 6.4 Platform Selection

For vehicle-based partner categories (PC-001, PC-002, PC-003, PC-013), the enrollment form SHALL include platform selection:

| Code | Label | Applicable Categories |
|------|-------|----------------------|
| pathao | Pathao | PC-001, PC-002, PC-003, PC-013 |
| indrive | inDrive | PC-001, PC-002, PC-003 |
| tootle | Tootle | PC-001, PC-003 |
| yango | Yango | PC-002, PC-003 |
| local_taxi | Local Taxi | PC-002 |
| school_bus | School Bus | PC-004 |
| college_bus | College Bus | PC-004 |
| delivery_company | Delivery Company | PC-013 |

### 6.5 Enrollment Confirmation

Upon successful pre-enrollment, the partner SHALL see:

- Confirmation message with enrollment ID
- Category-specific estimated launch timeline
- Option to complete additional verification documents
- Link to track enrollment status
- Encouragement to refer other partners (social proof building)

---


## 7. Pre-Enrollment Dashboard (Admin Panel)

### 7.1 Purpose

The Pre-Enrollment Dashboard provides Admin and Super Admin users with real-time visibility into supply-demand progress for each advertising channel. This dashboard creates social proof for internal teams and helps operations decide when to launch each channel.

### 7.2 Dashboard Layout

For each advertising channel, the dashboard SHALL display:

| Metric | Source | Display |
|--------|--------|---------|
| Businesses Interested | Count of pre-orders for channel | Number + trend arrow |
| Partners Enrolled | Count of pre-enrollments for channel | Number + trend arrow |
| Launch Target (Businesses) | Configured threshold per channel | Target number |
| Launch Target (Partners) | Configured threshold per channel | Target number |
| Business Progress % | (Pre-orders / Business target) × 100 | Progress bar |
| Partner Progress % | (Enrollments / Partner target) × 100 | Progress bar |
| Combined Readiness | Weighted composite of both progress metrics | Percentage gauge |
| Top Cities | Geographic distribution of demand/supply | City breakdown |

### 7.3 Dashboard Rules

| ID | Rule | Description |
|----|------|-------------|
| CR6-031 | Dashboard SHALL update in near-real-time (max 5-minute delay) | Operational responsiveness |
| CR6-032 | Each channel card SHALL show progress toward configured launch targets | Clear goal visibility |
| CR6-033 | Channels approaching target (≥80%) SHALL be highlighted | Attention indicator |
| CR6-034 | Dashboard SHALL support filtering by: category, maturity stage, city | Flexible analysis |
| CR6-035 | Dashboard SHALL show weekly growth trend for each metric | Growth trajectory |
| CR6-036 | Export to CSV SHALL be available for all dashboard data | Reporting flexibility |

### 7.4 Channel Progress Card

```
┌──────────────────────────────────────────────────────┐
│  🚕 Taxi Exterior Advertising        CMM-002        │
│                                                      │
│  Businesses Interested:  47 / 100 target  ████░ 47% │
│  Partners Enrolled:      23 / 50 target   ██░░░ 46% │
│                                                      │
│  Combined Readiness: 46%                             │
│  Top Cities: Kathmandu (28), Lalitpur (12), Other(7) │
│  Weekly Growth: +8 businesses, +5 partners           │
│                                                      │
│  [View Details]  [Configure Targets]                 │
└──────────────────────────────────────────────────────┘
```

---

## 8. Admin Panel — Market Validation Dashboard

### 8.1 Purpose

The Market Validation Dashboard provides comprehensive analytics for evaluating channel viability, guiding launch decisions, and demonstrating market demand to stakeholders and investors.

### 8.2 Per-Channel Metrics

| Metric | Calculation | Display |
|--------|-------------|---------|
| Business Demand (Count) | Total pre-orders for channel | Number |
| Business Demand (Budget) | Sum of estimated budgets | NPR formatted |
| Partner Supply (Count) | Total pre-enrollments for channel | Number |
| Partner Supply (Capacity) | Sum of asset counts from enrollments | Number of units |
| Cities Covered | Distinct cities from pre-orders + enrollments | Count + list |
| Zones Covered | Distinct zones with supply or demand | Count |
| Average Budget | Mean of estimated budgets | NPR formatted |
| Average Reach | Estimated daily impressions (channel-specific) | Number |
| Conversion Rate | Historical: interest → active when channel launches | Percentage |
| Projected Revenue | (Avg budget × demand count × conversion rate) | NPR formatted |
| Recommended Launch Date | Based on growth trajectory + target thresholds | Date estimate |

### 8.3 Aggregate Market Metrics

| ID | Metric | Description |
|----|--------|-------------|
| CR6-037 | Total Addressable Market (TAM) | Sum of all pre-order budgets across all channels |
| CR6-038 | Most Requested Channel | Channel with highest pre-order count |
| CR6-039 | Highest Budget Channel | Channel with largest total budget interest |
| CR6-040 | Fastest Growing Supply | Channel with highest weekly partner enrollment growth |
| CR6-041 | Highest ROI Prediction | Channel with best projected revenue / operational cost ratio |
| CR6-042 | Cities with Highest Demand | Geographic ranking by total demand |
| CR6-043 | Partner Growth Rate | Overall weekly new partner enrollments |
| CR6-044 | Business Growth Rate | Overall weekly new business pre-orders |
| CR6-045 | Expected GMV | Gross Marketplace Value projection (12-month horizon) |

### 8.4 Investor Value Dashboard

A dedicated sub-section SHALL present metrics optimized for investor presentations:

| ID | Rule | Description |
|----|------|-------------|
| CR6-046 | Dashboard SHALL show market demand backed by REAL user registrations | Not projections — actual data |
| CR6-047 | Dashboard SHALL show supply readiness across multiple channels | Diversification proof |
| CR6-048 | Dashboard SHALL show geographic expansion potential | Growth story |
| CR6-049 | Dashboard SHALL show revenue projections with confidence intervals | Data-backed forecasts |
| CR6-050 | Dashboard SHALL be exportable as PDF report | Investor communication |

---


## 9. Super Admin — Channel Configuration

### 9.1 Overview

The Super Admin SHALL have full control over each advertising channel's configuration. This extends Document 19 §5 (Inventory Rule Engine) with channel-specific operational parameters.

### 9.2 Channel Configuration Parameters

For each channel (CH-001 through CH-022), the Super Admin SHALL configure:

| Parameter Group | Fields | Description |
|----------------|--------|-------------|
| Maturity Stage | Current stage (CMM-001 to CMM-008) | Controls visibility and available operations |
| Launch Thresholds | Minimum partner requirement, Minimum business interest | Targets for launch readiness |
| Operational Cost | Estimated cost per unit per day (NPR) | Financial planning |
| Approval Required | Boolean | Whether admin approval needed for enrollments |
| Verification Method | Document check, Photo verification, Platform API, Manual review | How partners are verified |
| Campaign Rules | Min/max duration, min/max quantity, geographic restrictions | Operational boundaries |
| Pricing Model | Per unit, per day, per impression, per post, hybrid | Revenue model per channel |
| Asset Rules | Dimensions, material, format, resolution | Physical/digital asset specifications |
| Media Rules | Required photos/screenshots, file types, max size | Media submission requirements |

### 9.3 Configuration Matrix

| ID | Parameter | Physical Channels | Digital Channels |
|----|-----------|-------------------|------------------|
| CR6-051 | Pricing Unit | Per surface per day | Per post / per impression |
| CR6-052 | Verification | Photo + document | Platform URL + screenshot |
| CR6-053 | Asset Specification | Physical dimensions (cm/m) | Pixel dimensions + format |
| CR6-054 | Partner Capacity | Surfaces owned | Follower count / reach |
| CR6-055 | Geographic Scope | Zone/Ward based | City/National/International |
| CR6-056 | Quality Metric | Surface condition score | Engagement rate |
| CR6-057 | Minimum Commitment | Days of availability | Posts per campaign |
| CR6-058 | Commission Model | % of campaign revenue | % of post payment |

### 9.4 Configuration Rules

| ID | Rule | Description |
|----|------|-------------|
| CR6-059 | Channel SHALL NOT advance past CMM-002 without complete configuration | Readiness gate |
| CR6-060 | Configuration changes SHALL be audited with before/after values | Change tracking |
| CR6-061 | Configuration SHALL support draft/published states | Safe editing |
| CR6-062 | Published configuration SHALL propagate to all dependent modules within 60 seconds | Near-real-time sync |

### 9.5 Channel Configuration Storage

Configuration SHALL use the key pattern established in Document 19 §5.3:

```
channel.{channel_code}.{parameter_group}.{parameter}
```

**Examples:**
- `channel.taxi_exterior.pricing.model` = "per_surface_per_day"
- `channel.taxi_exterior.pricing.base_rate` = 20000
- `channel.influencer_marketing.pricing.model` = "per_post"
- `channel.influencer_marketing.pricing.base_rate` = 50000
- `channel.helmet_advertising.maturity.stage` = "CMM-005"
- `channel.youtube_promotion.verification.method` = "platform_url"

---


## 10. Database Additions

### 10.1 Design Principles

All database additions are **additive** — no existing schema (TBL-001 through TBL-058) SHALL be modified. New tables follow the naming conventions established in Document 05 §2.

### 10.2 New Tables

#### TBL-060: advertising_channels

Extends `marketplace_inventory_types` (TBL-050) with digital category support and maturity stage tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| code | VARCHAR(100) | UNIQUE, NOT NULL | Channel code (e.g., `taxi_exterior`) |
| name | VARCHAR(255) | NOT NULL | Display name |
| description | TEXT | | Channel description |
| super_category | VARCHAR(20) | NOT NULL, CHECK (physical, digital) | Physical or Digital |
| sub_category | VARCHAR(50) | NOT NULL | Vehicle, Wearable, Property, etc. |
| maturity_stage | VARCHAR(10) | NOT NULL, DEFAULT 'CMM-002' | Current CMM stage |
| is_paused | BOOLEAN | NOT NULL, DEFAULT FALSE | Pause overlay |
| is_retired | BOOLEAN | NOT NULL, DEFAULT FALSE | Retirement flag |
| partner_category_id | VARCHAR(10) | | FK reference to partner_categories.code |
| icon_url | VARCHAR(500) | | Channel icon |
| estimated_daily_reach | INTEGER | | Estimated impressions per unit per day |
| sort_order | INTEGER | DEFAULT 0 | Display ordering |
| configuration | JSONB | NOT NULL, DEFAULT '{}' | Full channel configuration |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |
| activated_at | TIMESTAMPTZ | | When channel first reached CMM-005 |
| paused_at | TIMESTAMPTZ | | When paused (NULL if not paused) |
| retired_at | TIMESTAMPTZ | | When retired (NULL if not retired) |

#### TBL-061: partner_categories

Detailed category definitions for all partner types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| code | VARCHAR(10) | UNIQUE, NOT NULL | Category code (PC-001 through PC-016) |
| name | VARCHAR(100) | NOT NULL | Category name |
| description | TEXT | | Category description |
| super_category | VARCHAR(20) | NOT NULL | physical or digital |
| channels_served | VARCHAR(10)[] | NOT NULL | Array of CH-* codes served |
| enrollment_fields | JSONB | NOT NULL | Required/optional field definitions |
| verification_method | VARCHAR(50) | NOT NULL | How partners are verified |
| is_active | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether category accepts enrollments |
| min_requirements | JSONB | NOT NULL, DEFAULT '{}' | Minimum thresholds (followers, etc.) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

#### TBL-062: business_pre_orders

Extends `marketplace_pre_orders` (TBL-051) with campaign objective, budget detail, and launch timing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| business_id | UUID | NOT NULL | Requesting business |
| channel_id | UUID | NOT NULL, FK advertising_channels(id) | Target channel |
| estimated_budget_npr | INTEGER | NOT NULL, CHECK > 0 | Monthly budget estimate (NPR) |
| preferred_city | VARCHAR(100) | NOT NULL | Target city |
| campaign_duration | VARCHAR(20) | NOT NULL | Duration preference code |
| expected_launch_time | VARCHAR(30) | NOT NULL | Launch timing preference |
| campaign_objectives | VARCHAR(30)[] | NOT NULL | Array of objective codes |
| preferred_start_date | DATE | | Desired start date |
| additional_notes | TEXT | | Free-text notes |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'submitted' | Pre-order lifecycle status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Submission time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |
| cancelled_at | TIMESTAMPTZ | | Cancellation timestamp |

#### TBL-063: partner_enrollments_extended

Extends `partner_enrollments` (TBL-054) with platform, followers, reach, and media data for digital/specialized partners.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| partner_id | UUID | NOT NULL | Partner reference |
| partner_category_code | VARCHAR(10) | NOT NULL | PC-* category code |
| channel_id | UUID | NOT NULL, FK advertising_channels(id) | Target channel |
| platform | VARCHAR(50) | | Platform name (Pathao, Instagram, etc.) |
| platform_url | VARCHAR(500) | | Profile/page URL |
| followers_count | INTEGER | | Current followers/subscribers |
| monthly_reach | INTEGER | | Average monthly impressions/reach |
| engagement_rate | DECIMAL(5,2) | | Engagement percentage |
| content_niche | VARCHAR(100) | | Content category/niche |
| asset_photos | UUID[] | | Uploaded photo references |
| asset_dimensions | JSONB | | Physical dimensions (width, height) |
| location_gps | POINT | | GPS coordinates |
| location_city | VARCHAR(100) | | City name |
| location_zone | UUID | | Zone reference |
| availability_hours | JSONB | | Weekly availability schedule |
| expected_rate_npr | INTEGER | | Expected earning/rate (NPR) |
| additional_data | JSONB | NOT NULL, DEFAULT '{}' | Category-specific extra fields |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'submitted' | Enrollment status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Submission time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |
| verified_at | TIMESTAMPTZ | | Verification timestamp |
| verified_by | UUID | | Verifying admin |


#### TBL-064: channel_launch_thresholds

Per-channel configurable targets for launch readiness assessment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| channel_id | UUID | NOT NULL, UNIQUE, FK advertising_channels(id) | Target channel |
| min_business_interest | INTEGER | NOT NULL, DEFAULT 50 | Minimum pre-orders needed |
| min_partner_enrollment | INTEGER | NOT NULL, DEFAULT 30 | Minimum partner enrollments needed |
| min_cities_covered | INTEGER | NOT NULL, DEFAULT 3 | Minimum distinct cities |
| min_total_budget_npr | INTEGER | NOT NULL, DEFAULT 500000 | Minimum aggregate budget interest |
| target_launch_date | DATE | | Planned launch date |
| auto_recommend_enabled | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether to auto-recommend when met |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |
| configured_by | UUID | | Super Admin who set thresholds |

#### TBL-065: channel_launch_progress

Computed metrics tracking progress toward launch for each channel. Updated periodically by background job.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| channel_id | UUID | NOT NULL, FK advertising_channels(id) | Target channel |
| business_count | INTEGER | NOT NULL, DEFAULT 0 | Current pre-order count |
| partner_count | INTEGER | NOT NULL, DEFAULT 0 | Current enrollment count |
| total_budget_npr | INTEGER | NOT NULL, DEFAULT 0 | Sum of estimated budgets |
| cities_covered | INTEGER | NOT NULL, DEFAULT 0 | Distinct cities with activity |
| zones_covered | INTEGER | NOT NULL, DEFAULT 0 | Distinct zones with activity |
| business_progress_pct | DECIMAL(5,2) | NOT NULL, DEFAULT 0 | Progress toward business target |
| partner_progress_pct | DECIMAL(5,2) | NOT NULL, DEFAULT 0 | Progress toward partner target |
| combined_readiness_pct | DECIMAL(5,2) | NOT NULL, DEFAULT 0 | Weighted combined readiness |
| weekly_business_growth | INTEGER | NOT NULL, DEFAULT 0 | New pre-orders in last 7 days |
| weekly_partner_growth | INTEGER | NOT NULL, DEFAULT 0 | New enrollments in last 7 days |
| recommended_launch | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether thresholds are met |
| computed_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last computation timestamp |

#### TBL-066: market_survey_responses

Optional survey data collected from partners and businesses for market research.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| respondent_type | VARCHAR(20) | NOT NULL, CHECK (business, partner) | Who responded |
| respondent_id | UUID | NOT NULL | Business or partner ID |
| channel_id | UUID | FK advertising_channels(id) | Related channel (nullable) |
| survey_type | VARCHAR(50) | NOT NULL | Survey identifier |
| responses | JSONB | NOT NULL | Survey answers |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Response time |

### 10.3 Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| advertising_channels | idx_channels_super_category | super_category | Category filtering |
| advertising_channels | idx_channels_maturity | maturity_stage | Stage filtering |
| business_pre_orders | idx_preorders_channel | channel_id | Channel aggregation |
| business_pre_orders | idx_preorders_business | business_id | Business lookup |
| business_pre_orders | idx_preorders_city | preferred_city | Geographic analysis |
| partner_enrollments_extended | idx_enrollments_channel | channel_id | Channel aggregation |
| partner_enrollments_extended | idx_enrollments_category | partner_category_code | Category filtering |
| partner_enrollments_extended | idx_enrollments_city | location_city | Geographic analysis |
| channel_launch_progress | idx_progress_channel | channel_id | Unique per channel |

### 10.4 Relationship to Document 19 Schema

| New Table | Extends | Relationship |
|-----------|---------|--------------|
| TBL-060 (advertising_channels) | TBL-050 (marketplace_inventory_types) | Adds digital category + maturity stages |
| TBL-061 (partner_categories) | DICT-010 (PARTNER_TYPE) | Detailed definitions beyond dictionary |
| TBL-062 (business_pre_orders) | TBL-051 (marketplace_pre_orders) | Adds objectives, budget, timing |
| TBL-063 (partner_enrollments_extended) | TBL-054 (partner_enrollments) | Adds platform, followers, media |
| TBL-064 (channel_launch_thresholds) | MKT-030 readiness config | Dedicated threshold storage |
| TBL-065 (channel_launch_progress) | TBL-052 (marketplace_readiness_scores) | Channel-focused progress tracking |
| TBL-066 (market_survey_responses) | New | Market research data collection |

---


## 11. Analytics Requirements

### 11.1 Core Analytics Metrics

The platform SHALL track and compute the following analytics continuously:

| ID | Metric | Computation | Granularity | Update Frequency |
|----|--------|-------------|-------------|------------------|
| CR6-063 | Most Requested Channel | Channel with MAX(pre_order_count) | Global + per city | Hourly |
| CR6-064 | Highest Budget Channel | Channel with MAX(SUM(estimated_budget)) | Global + per city | Hourly |
| CR6-065 | Fastest Growing Supply | Channel with MAX(weekly_partner_growth) | Global | Daily |
| CR6-066 | Highest ROI Prediction | Channel with MAX(projected_revenue / operational_cost) | Global | Weekly |
| CR6-067 | Cities with Highest Demand | Cities ranked by SUM(pre_orders) across all channels | National | Daily |
| CR6-068 | Partner Growth Rate | COUNT(new enrollments) per week, segmented by category | Per category | Weekly |
| CR6-069 | Business Growth Rate | COUNT(new pre-orders) per week, segmented by channel | Per channel | Weekly |
| CR6-070 | Expected GMV | SUM(projected_revenue) across all channels (12-month horizon) | Platform | Weekly |
| CR6-071 | Investor Value Index | Composite of demand proof + supply readiness + geographic spread | Platform | Weekly |

### 11.2 Channel-Level Analytics

For each channel, the system SHALL maintain:

| Metric | Description |
|--------|-------------|
| Demand Velocity | Rate of new pre-orders (per day/week/month) |
| Supply Velocity | Rate of new enrollments (per day/week/month) |
| Budget Concentration | Distribution of budgets (histogram) |
| Geographic Spread | Number of cities/zones with activity |
| Objective Distribution | Which campaign objectives are most selected |
| Duration Preference | Distribution of preferred campaign durations |
| Launch Timeline Preference | When businesses want to launch |
| Conversion Funnel | Visitors → Pre-order page → Form started → Submitted |

### 11.3 Partner-Level Analytics

| Metric | Description |
|--------|-------------|
| Category Distribution | How partners distribute across PC-001 to PC-016 |
| Multi-Category Rate | % of partners enrolled in 2+ categories |
| Platform Distribution | Which platforms partners use (Pathao, inDrive, etc.) |
| Geographic Coverage | Map of partner locations and density |
| Follower Distribution | Digital partner follower count histogram |
| Verification Rate | % of enrollments that complete verification |
| Dropout Rate | % of enrollments withdrawn before verification |

### 11.4 Investor-Facing Metrics

| ID | Metric | Demonstrates |
|----|--------|-------------|
| CR6-072 | Demonstrable Market Demand | Real businesses with real budget commitments |
| CR6-073 | Supply-Side Readiness | Real partners with verified assets |
| CR6-074 | Multi-Channel Potential | Revenue not dependent on single channel |
| CR6-075 | Geographic Expansion Path | Clear city-by-city growth trajectory |
| CR6-076 | Revenue Forecast Confidence | Backed by actual registrations, not assumptions |
| CR6-077 | Platform Network Effects | Both sides growing reinforces the other |

### 11.5 Analytics Rules

| ID | Rule | Description |
|----|------|-------------|
| CR6-078 | All analytics SHALL be computed from real registration data only | No synthetic or projected-only metrics in primary dashboard |
| CR6-079 | Analytics SHALL distinguish between active and cancelled registrations | Cancelled pre-orders excluded from demand metrics |
| CR6-080 | Analytics SHALL support date-range filtering (7d, 30d, 90d, YTD, All time) | Temporal analysis |
| CR6-081 | Analytics SHALL be accessible via API for programmatic consumption | EP-230 through EP-234 extended |
| CR6-082 | Weekly digest email SHALL be sent to Super Admin with key metrics | Proactive reporting |

---


## 12. MVP Protection

### 12.1 Absolute Constraints

| ID | Rule | Enforcement |
|----|------|-------------|
| CR6-083 | Helmet Advertising (CH-001) SHALL remain the ONLY channel at CMM-005 (Live) | System-enforced; no configuration bypass |
| CR6-084 | All other channels SHALL operate ONLY in Pre-Order / Pre-Enrollment mode | Guard clause on all operational endpoints |
| CR6-085 | No campaign creation SHALL be permitted for non-Live channels | API validation + UI enforcement |
| CR6-086 | No partner assignment SHALL be permitted for non-Live channels | Assignment service guard |
| CR6-087 | No financial transaction SHALL execute for non-Live channels | Payment service guard |
| CR6-088 | No sticker/material production SHALL be triggered for non-Live channels | Print partner service guard |
| CR6-089 | Channel activation to CMM-005 SHALL require Super Admin explicit action | No automated promotion |

### 12.2 What This CR Collects (NOT Executes)

| Collected Data | Purpose | Execution Status |
|----------------|---------|------------------|
| Business pre-orders | Market demand validation | Data only — no campaigns created |
| Partner enrollments | Supply readiness assessment | Data only — no assignments made |
| Budget estimates | Revenue projection | Data only — no payments processed |
| Geographic preferences | Expansion planning | Data only — no zone operations |
| Campaign objectives | Product roadmap input | Data only — no fulfillment |
| Partner capabilities | Matching preparation | Data only — no matches executed |

### 12.3 Activation Checklist

Before any channel advances to CMM-005 (Live), the following SHALL be verified:

1. ✅ Channel configuration complete (all §9.2 parameters set)
2. ✅ Partner category enrollment form tested and functional
3. ✅ Business pre-order → campaign creation flow implemented
4. ✅ Partner enrollment → assignment flow implemented
5. ✅ Pricing model configured and tested
6. ✅ Verification workflow operational
7. ✅ Financial flows (payment, commission, payout) configured
8. ✅ Notification templates created
9. ✅ Admin management panels complete
10. ✅ Minimum partner threshold met
11. ✅ Minimum business demand threshold met
12. ✅ Super Admin explicit approval with documented rationale

---

## 13. Traceability

### 13.1 Upstream Document Mapping

| This CR Section | Traces To | Nature of Extension |
|-----------------|-----------|---------------------|
| §2 Capability Maturity Model | Doc 19 §3.2 (Status Lifecycle) | Replaces 4-status with 8-stage CMM |
| §3 Channel Catalog | Doc 19 §3.4 (Inventory Type Catalog) | Extends with digital + restructured physical |
| §4 Partner Categories | Doc 19 §6.3 (Partner Generalization) | Detailed category definitions + enrollment fields |
| §5 Business Portal UX | Doc 10 (Business Portal Spec) | Adds channel selection + pre-order form |
| §6 Partner App UX | Doc 09 (Rider App Spec) | Renames enrollment + adds multi-category |
| §7 Pre-Enrollment Dashboard | Doc 11 (Admin Panel Spec) | New dashboard section |
| §8 Market Validation Dashboard | Doc 11 (Admin Panel Spec) | New analytics dashboard |
| §9 Channel Configuration | Doc 06 (Configuration Dictionary) | New configuration keys per channel |
| §10 Database Additions | Doc 05 (Data Model) | 7 new tables (TBL-060 through TBL-066) |
| §11 Analytics | Doc 19 §9 (Supply/Demand Intelligence) | Extends with digital metrics + investor view |
| §12 MVP Protection | Doc 19 §2 (MVP Protection Rule) | Reinforces with channel-specific guards |

### 13.2 Downstream Impact

| Affected Document | Impact | Changes Required |
|-------------------|--------|------------------|
| Document 05 (Data Model) | Medium | Add TBL-060 through TBL-066 definitions |
| Document 06 (Configuration) | Medium | Add channel.* configuration keys |
| Document 09 (Rider/Partner App) | Low | Rename "Become Rider" → "Become Advertising Partner" |
| Document 10 (Business Portal) | Medium | Add channel selection page + pre-order form |
| Document 11 (Admin Panel) | Medium | Add pre-enrollment + market validation dashboards |
| Document 14 (Notifications) | Low | Add pre-order/enrollment notification templates |
| Document 19 (Marketplace) | Low | Reference CMM as evolution of status lifecycle |

### 13.3 Identifier Registry

| Prefix | Range | Purpose |
|--------|-------|---------|
| CR6- | CR6-001 through CR6-089 | Change Request rules and metrics |
| CH- | CH-001 through CH-022 | Advertising channel identifiers |
| PC- | PC-001 through PC-016 | Partner category identifiers |
| CMM- | CMM-001 through CMM-008 | Capability Maturity Model stages |
| TBL- | TBL-060 through TBL-066 | New database tables |

---

## 14. Governing Statement

This change SHALL allow Solo Advertiser to demonstrate:

1. **Market demand before feature development** — Real businesses register interest with real budget commitments before engineering resources are allocated.
2. **Supply-side readiness** — Real partners enroll with verified capabilities before operational infrastructure is built.
3. **Business-side demand** — Quantified demand across 22 channels informs product roadmap prioritization.
4. **Geographic expansion opportunities** — City-by-city demand data guides regional launch decisions.
5. **Future revenue forecasts backed by real user data** — Not assumptions, not projections from comparable markets, but actual platform registrations from verified businesses and partners.

The Capability Maturity Model ensures that no channel advances to operational status without demonstrated demand, verified supply, and complete operational readiness. This protects the MVP (Helmet Advertising) while building the evidence base for multi-channel expansion.

---

*End of CR-006*
