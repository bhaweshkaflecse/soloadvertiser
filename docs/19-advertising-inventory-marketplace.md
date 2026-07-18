# Document 19 - Advertising Inventory Marketplace Specification

**Project:** Solo Advertiser Platform  
**Version:** 1.1  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Solo Advertiser is an Advertising Inventory Marketplace. Helmet Advertising is the first live inventory. This document defines the marketplace abstraction, inventory plugin contract, and expansion framework that SHALL govern all future inventory types. No operational workflows SHALL be implemented for non-live inventory types without explicit Super Admin activation.

---

## 1. Purpose and Scope

### 1.1 Platform Identity

Solo Advertiser is NOT a Helmet Advertising Platform. Solo Advertiser is an **Advertising Inventory Marketplace** that connects businesses seeking advertising surfaces with partners who supply those surfaces. Helmet Advertising is simply the first inventory type to achieve Live operational status.

This document establishes the architectural framework for:

- Advertising inventory abstraction (multiple surface types)
- A standardized Inventory Plugin Contract for each inventory type
- Two-sided marketplace dynamics (business demand + partner supply)
- Pre-order and pre-enrollment systems for future inventory
- Supply and demand intelligence for launch planning
- Marketplace readiness scoring and activation recommendations


### 1.2 Scope

| Dimension | Boundary |
|-----------|----------|
| MVP Impact | NONE — Helmet Advertising remains the only Live operational inventory |
| Expansion Scope | Demand capture, supply enrollment, analytics, capacity planning, configuration |
| Operational Workflows | Pre-Order inventory types SHALL NOT have operational workflows |
| Geography | Region → Zone → Ward hierarchy (multi-region ready) |
| Architecture | Additive modules on existing NestJS modular monolith (Document 04) |

### 1.3 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Inventory type identifiers use prefix INV-NNN.
- Marketplace rule identifiers use prefix MKT-NNN.
- Plugin contract identifiers use prefix PPC-NNN.
- Distribution center identifiers use prefix DST-NNN.
- Print partner identifiers use prefix PPR-NNN.
- Supply/demand intelligence identifiers use prefix SDI-NNN.
- All identifiers trace to upstream documents (01–18).

### 1.4 Upstream References

| Document | Relevant Sections |
|----------|-------------------|
| Document 01 | REQ-PRD-001 (platform purpose), §2.1 (MVP scope) |
| Document 02 | RULE-CMP-* (campaign rules), RULE-CFG-* (configuration rules) |
| Document 03 | CTX-009 (Configuration Service), CTX-005 (Assignment Domain) |
| Document 04 | §5.1 (module structure), §6.3 (service interfaces) |
| Document 05 | config_* schema, campaign_* schema |
| Document 06 | DICT-003 (ASSET_TYPE), CFG-* (platform settings) |

---


## 2. MVP Protection Rule

### 2.1 Absolute Constraint

| ID | Rule | Enforcement |
|----|------|-------------|
| MKT-001 | Helmet Advertising SHALL remain the ONLY inventory type with status "Live" until explicitly activated by Super Admin | System-enforced; no API or configuration change can bypass |
| MKT-002 | All existing MVP workflows (rider pipeline, business pipeline, campaign lifecycle, assignment lifecycle, financial flows) SHALL NOT be modified by this expansion | Architectural isolation |
| MKT-003 | Non-live inventory types SHALL participate ONLY in: business pre-order, partner pre-enrollment, market demand analytics, capacity planning, launch readiness assessment, and future configuration | Module boundary enforcement |
| MKT-004 | No operational workflow (sticker printing, distribution, verification, assignment, payment) SHALL execute for non-live inventory | Guard clause on all operational endpoints |

### 2.2 Activation Authority

Only the Super Admin role SHALL have the authority to transition an inventory type from Pre-Order to Live status. This transition SHALL require:

1. Marketplace Readiness Score above configured threshold (MKT-030)
2. Explicit manual confirmation (no automated activation)
3. Audit trail entry (CTX-010)
4. Configuration propagation to all dependent modules

---


## 3. Inventory Abstraction Model

### 3.1 Inventory Type Definition

An Inventory Type represents a distinct advertising surface category. Each inventory type is an independent operational unit with its own rules, workflows, and lifecycle.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| code | string | Machine-readable code (e.g., `helmet_advertising`, `taxi_door_exterior`) |
| name | string | Human-readable display name |
| description | text | Detailed description of the advertising surface |
| category | enum | Vehicle, Wearable, Property, Infrastructure, Delivery |
| status | enum | Live, Pre-Order, Paused, Retired |
| partner_type | string | Type of supply partner required (rider, taxi_owner, property_owner, bus_operator, etc.) |
| icon_url | string | Visual identifier for UI display |
| sort_order | integer | Display ordering in marketplace listings |
| created_at | timestamptz | Creation timestamp |
| activated_at | timestamptz | Nullable; set when status transitions to Live |
| region_ids | UUID[] | Regions where this inventory type is available |

### 3.2 Inventory Status Lifecycle

```
┌────────────┐     Super Admin      ┌────────┐
│  Pre-Order │─────────────────────▶│  Live  │
└─────┬──────┘     (MKT-030 met)   └───┬────┘
      │                                  │
      │ Super Admin                      │ Super Admin
      ▼                                  ▼
┌────────────┐                     ┌──────────┐
│   Paused   │◀────────────────────│  Paused  │
└─────┬──────┘     Super Admin     └──────────┘
      │
      │ Super Admin (irreversible)
      ▼
┌────────────┐
│  Retired   │
└────────────┘
```

**Status Definitions:**

| Status | Meaning | Allowed Operations |
|--------|---------|-------------------|
| Live | Fully operational; campaigns execute, partners fulfill | All operational workflows active |
| Pre-Order | Demand capture and supply enrollment only | Business pre-order, partner pre-enrollment, analytics, configuration |
| Paused | Temporarily suspended; no new campaigns | Existing campaigns wind down; no new assignments |
| Retired | Permanently decommissioned | Read-only historical data; no operations |

### 3.3 No "Coming Soon" Terminology

The platform SHALL NOT use "Coming Soon", "Beta", "Alpha", "Preview", or any similar terminology. The ONLY permitted statuses are: **Live**, **Pre-Order**, **Paused**, **Retired**.


### 3.4 Inventory Type Catalog

| ID | Code | Name | Category | MVP Status | Partner Type |
|----|------|------|----------|------------|--------------|
| INV-001 | `helmet_advertising` | Helmet Advertising | Vehicle | **Live** | Rider |
| INV-002 | `taxi_door_exterior` | Taxi Exterior Door | Vehicle | Pre-Order | Taxi Owner |
| INV-003 | `taxi_rear_window` | Taxi Rear Window | Vehicle | Pre-Order | Taxi Owner |
| INV-004 | `taxi_interior_display` | Taxi Interior Display | Vehicle | Pre-Order | Taxi Owner |
| INV-005 | `rideshare_jacket` | Ride Sharing Jacket | Wearable | Pre-Order | Rider |
| INV-006 | `rideshare_windcheater` | Ride Sharing Windcheater | Wearable | Pre-Order | Rider |
| INV-007 | `rideshare_tshirt` | Ride Sharing T-Shirt | Wearable | Pre-Order | Rider |
| INV-008 | `delivery_bag` | Delivery Bag | Delivery | Pre-Order | Delivery Rider |
| INV-009 | `delivery_box` | Delivery Box | Delivery | Pre-Order | Delivery Rider |
| INV-010 | `delivery_backpack` | Delivery Backpack | Delivery | Pre-Order | Delivery Rider |
| INV-011 | `property_hoarding` | Property Hoarding | Property | Pre-Order | Property Owner |
| INV-012 | `building_wall` | Building Wall | Property | Pre-Order | Building Owner |
| INV-013 | `building_terrace` | Building Terrace | Property | Pre-Order | Building Owner |
| INV-014 | `roadside_signboard` | Roadside Sign Board | Infrastructure | Pre-Order | Property Owner |
| INV-015 | `bus_interior_panel` | Public Bus Interior Panel | Infrastructure | Pre-Order | Bus Operator |
| INV-016 | `bus_grab_handle` | Public Bus Grab Handle | Infrastructure | Pre-Order | Bus Operator |
| INV-017 | `bus_seat_branding` | Public Bus Seat Branding | Infrastructure | Pre-Order | Bus Operator |

### 3.5 Inventory Categories

| Category | Description | Partner Archetype |
|----------|-------------|-------------------|
| Vehicle | Moving vehicle surfaces (helmets, taxis, buses) | Vehicle owner/operator |
| Wearable | Clothing and worn items (jackets, t-shirts) | Individual wearer |
| Property | Fixed real estate surfaces (walls, terraces, hoardings) | Property/building owner |
| Infrastructure | Public infrastructure (bus interiors, signboards) | Infrastructure operator |
| Delivery | Delivery equipment (bags, boxes, backpacks) | Delivery service rider |

---


## 4. Inventory Plugin Contract

### 4.1 Overview

Every inventory type SHALL implement a standardized plugin contract. This contract defines the complete behavioral interface that an inventory module must satisfy to become operational. Adding a new advertising medium to the platform becomes primarily **configuration + implementing one inventory plugin module**.

### 4.2 Plugin Contract Interface

| ID | Contract Component | Description | Required |
|----|-------------------|-------------|----------|
| PPC-001 | Eligibility Rules | Who qualifies as a partner for this inventory type | YES |
| PPC-002 | Pricing Rules | How campaigns are priced (daily rate, bulk discount, duration tiers) | YES |
| PPC-003 | Verification Rules | How active inventory is verified for compliance | YES |
| PPC-004 | Installation Rules | How advertising material is applied to the surface | YES |
| PPC-005 | Removal Rules | How advertising material is removed at campaign end | YES |
| PPC-006 | Required Media | What photos/videos partners must provide | YES |
| PPC-007 | Required Documents | What documents partners must submit for verification | YES |
| PPC-008 | Lifecycle States | State machine for individual inventory units | YES |
| PPC-009 | Matching Algorithm | How partners are matched to campaigns | YES |
| PPC-010 | KPI Definitions | What performance metrics are tracked | YES |
| PPC-011 | Commission Model | Platform commission structure | YES |
| PPC-012 | Deposit Model | Security deposit requirements (if applicable) | OPTIONAL |
| PPC-013 | Maintenance Rules | Ongoing maintenance/replacement requirements | OPTIONAL |
| PPC-014 | Geographic Constraints | Zone/ward/region restrictions | YES |
| PPC-015 | Capacity Limits | Maximum concurrent campaigns per partner unit | YES |

### 4.3 Contract Component Specifications

#### PPC-001: Eligibility Rules

Each inventory type SHALL define:

| Parameter | Type | Description |
|-----------|------|-------------|
| min_age | integer | Minimum partner age (if applicable) |
| required_documents | string[] | List of required document types |
| required_assets | string[] | Physical assets partner must own |
| geographic_zones | UUID[] | Zones where partner must operate |
| verification_level | enum | Basic, Standard, Enhanced |
| additional_criteria | JSON | Type-specific eligibility criteria |

**Example — Helmet Advertising (INV-001):**
- min_age: 18
- required_documents: ["citizenship_id", "driving_license", "vehicle_bluebook"]
- required_assets: ["motorcycle", "helmet"]
- geographic_zones: [Kathmandu Valley wards]
- verification_level: Standard

**Example — Taxi Exterior Door (INV-002):**
- min_age: 21
- required_documents: ["citizenship_id", "driving_license", "vehicle_bluebook", "taxi_permit"]
- required_assets: ["taxi_vehicle"]
- geographic_zones: [Kathmandu Valley wards]
- verification_level: Enhanced


#### PPC-002: Pricing Rules

Each inventory type SHALL define its commercial pricing model:

| Parameter | Type | Description |
|-----------|------|-------------|
| pricing_model | enum | daily_flat, daily_tiered, monthly_flat, impression_based, hybrid |
| base_daily_rate | integer | Base cost per unit per day (paisa) |
| partner_daily_rate | integer | Partner payout per unit per day (paisa) |
| min_campaign_days | integer | Minimum campaign duration |
| max_campaign_days | integer | Maximum campaign duration |
| min_quantity | integer | Minimum units per campaign |
| max_quantity | integer | Maximum units per campaign |
| bulk_discount_tiers | JSON | Quantity-based discount brackets |
| duration_discount_tiers | JSON | Duration-based discount brackets |
| premium_zone_multiplier | decimal | Zone-based pricing premium |

#### PPC-003: Verification Rules

Each inventory type SHALL define its compliance verification protocol:

| Parameter | Type | Description |
|-----------|------|-------------|
| verification_interval_days | integer | Days between mandatory verifications |
| verification_method | enum | photo, video, gps_checkin, physical_inspection, automated |
| required_photos | string[] | Specific photo angles/types required |
| max_verification_window_hours | integer | Hours allowed to complete verification |
| non_compliance_grace_period_hours | integer | Grace period before penalty |
| non_compliance_penalty_model | enum | warning, deduction, suspension, removal |
| auto_flag_rules | JSON | Automated compliance flag triggers |

#### PPC-004: Installation Rules

Each inventory type SHALL define how advertising material is applied:

| Parameter | Type | Description |
|-----------|------|-------------|
| installation_method | enum | self_apply, professional_install, partner_pickup |
| installation_duration_minutes | integer | Expected time to install |
| installation_location | enum | distribution_center, partner_location, print_partner |
| requires_appointment | boolean | Whether scheduled appointment is needed |
| installation_media_required | string[] | Photos/videos required post-installation |
| installation_verification | boolean | Whether ops staff must verify installation |

#### PPC-005: Removal Rules

Each inventory type SHALL define end-of-campaign removal:

| Parameter | Type | Description |
|-----------|------|-------------|
| removal_method | enum | self_remove, professional_remove, natural_expiry |
| removal_deadline_days | integer | Days after campaign end to complete removal |
| removal_penalty | integer | Penalty for late removal (paisa) |
| surface_restoration | boolean | Whether original surface must be restored |
| removal_media_required | string[] | Photos required post-removal |
| deposit_refund_condition | string | Condition for security deposit return |


#### PPC-006: Required Media

Each inventory type SHALL define media submission requirements:

| Parameter | Type | Description |
|-----------|------|-------------|
| enrollment_media | string[] | Media required during partner enrollment |
| pre_installation_media | string[] | Media required before installation |
| post_installation_media | string[] | Media required after installation |
| verification_media | string[] | Media required for compliance checks |
| removal_media | string[] | Media required after removal |
| media_quality_rules | JSON | Minimum resolution, format, size constraints |

#### PPC-007: Required Documents

Each inventory type SHALL define document requirements:

| Parameter | Type | Description |
|-----------|------|-------------|
| identity_documents | string[] | Government ID, citizenship, etc. |
| ownership_documents | string[] | Proof of asset ownership |
| operational_documents | string[] | Permits, licenses, insurance |
| optional_documents | string[] | Documents that enhance priority |
| document_expiry_tracking | boolean | Whether document expiry dates are monitored |
| renewal_reminder_days | integer | Days before expiry to send reminder |

#### PPC-008: Lifecycle States

Each inventory type SHALL define a state machine for individual inventory units:

| State | Description |
|-------|-------------|
| Registered | Partner has enrolled the asset |
| Verified | Asset meets all eligibility requirements |
| Available | Asset is ready for campaign assignment |
| Assigned | Asset is bound to an active campaign |
| Active | Advertising material is installed and verified |
| Suspended | Temporarily removed from service |
| Deregistered | Permanently removed from platform |

#### PPC-009: Matching Algorithm

Each inventory type SHALL define partner-to-campaign matching criteria:

| Parameter | Type | Description |
|-----------|------|-------------|
| primary_match_criteria | string[] | Mandatory match factors (zone, availability, eligibility) |
| secondary_match_criteria | string[] | Preference factors (reliability score, proximity, capacity) |
| match_mode | enum | manual, semi_automated, fully_automated |
| priority_scoring | JSON | Weighted scoring model for ranking |
| exclusion_rules | JSON | Conditions that disqualify a match |
| capacity_check | boolean | Whether partner's concurrent campaign limit is enforced |

#### PPC-010: KPI Definitions

Each inventory type SHALL define measurable performance indicators:

| Parameter | Type | Description |
|-----------|------|-------------|
| verification_compliance_rate | decimal | Target compliance percentage |
| average_campaign_duration | integer | Expected average duration (days) |
| partner_retention_rate | decimal | Target partner retention |
| fill_rate | decimal | Campaign demand fulfillment rate |
| verification_turnaround_hours | integer | Target verification response time |
| revenue_per_unit_day | integer | Target revenue per inventory unit per day |

---


## 5. Inventory Rule Engine

### 5.1 Per-Inventory Configurable Rules

Every inventory type SHALL have its complete behavioral ruleset managed through the Configuration Service (CTX-009). No inventory behavior SHALL be hardcoded.

| ID | Rule Category | Parameters | Editable By |
|----|--------------|------------|-------------|
| MKT-005 | Duration Rules | min_duration_days, max_duration_days, extension_allowed, extension_max_days | Super Admin |
| MKT-006 | Verification Rules | interval_days, window_hours, grace_period_hours, penalty_model | Super Admin |
| MKT-007 | Material Rules | sticker_size_cm, vinyl_size_cm, material_type, color_model | Super Admin |
| MKT-008 | Deposit Rules | deposit_required, deposit_amount, refund_condition, forfeiture_rules | Super Admin |
| MKT-009 | Installation Rules | method, duration_minutes, requires_appointment, verification_required | Super Admin |
| MKT-010 | Removal Rules | method, deadline_days, penalty_amount, restoration_required | Super Admin |
| MKT-011 | Cleaning Rules | cleaning_required, cleaning_interval_days, cleaning_penalty | Super Admin |
| MKT-012 | Replacement Rules | replacement_trigger, replacement_cost_bearer, max_replacements | Super Admin |
| MKT-013 | Quality Rules | min_resolution_dpi, acceptable_wear_percent, rejection_criteria | Super Admin |

### 5.2 Dynamic Commercial Policies

Commercial policies SHALL be independently configurable per inventory type:

| ID | Policy | Parameters | Default (Helmet) |
|----|--------|------------|------------------|
| MKT-014 | Campaign Duration | min_days, max_days | 7, 365 |
| MKT-015 | Campaign Quantity | min_units, max_units | 50, 15000 |
| MKT-016 | Campaign Budget | min_budget_npr, max_budget_npr | 42000, unlimited |
| MKT-017 | Pricing Model | model_type, base_rate, partner_rate | daily_flat, 12000, 10000 |
| MKT-018 | Commission Model | commission_percent, commission_type | 16.67, percentage |
| MKT-019 | Deposit Model | required, amount, refund_policy | false, 0, N/A |
| MKT-020 | Cancellation Policy | notice_days, penalty_percent, refund_percent | 3, 0, prorated |
| MKT-021 | Extension Policy | allowed, max_extension_days, pricing_change | true, 365, same_rate |
| MKT-022 | Payment Terms | advance_required, installment_allowed, payment_deadline_days | full_advance, false, 3 |

### 5.3 Configuration Storage

All inventory-specific rules SHALL be stored in the configuration system (Document 06) using the following key pattern:

```
inventory.{inventory_code}.{rule_category}.{parameter}
```

**Examples:**
- `inventory.helmet_advertising.pricing.base_daily_rate` = 12000
- `inventory.taxi_door_exterior.verification.interval_days` = 14
- `inventory.property_hoarding.deposit.amount` = 500000
- `inventory.delivery_bag.duration.min_days` = 30

---


## 6. Marketplace Two-Sided Model

### 6.1 Overview

Solo Advertiser operates as a two-sided marketplace:

- **Demand Side (Businesses):** Businesses seek advertising surfaces to display their brand
- **Supply Side (Partners):** Partners provide advertising surfaces (vehicles, property, wearables, etc.)

The marketplace platform orchestrates matching, fulfillment, verification, and payment between both sides.

### 6.2 Business Side (Demand)

#### 6.2.1 Pre-Order System

For inventory types with status "Pre-Order", businesses MAY submit pre-order reservations:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Pre-order identifier |
| business_id | UUID | Requesting business |
| inventory_type_id | UUID | Desired inventory type |
| quantity_requested | integer | Number of units desired |
| preferred_zones | UUID[] | Geographic preference |
| preferred_start_date | date | Desired campaign start |
| campaign_duration_days | integer | Desired duration |
| budget_range_min | integer | Minimum budget (paisa) |
| budget_range_max | integer | Maximum budget (paisa) |
| status | enum | Submitted, Acknowledged, Scheduled, Cancelled |
| priority | enum | Standard, Priority, Enterprise |
| notes | text | Additional requirements |
| created_at | timestamptz | Submission timestamp |

#### 6.2.2 Pre-Order Rules

| ID | Rule | Description |
|----|------|-------------|
| MKT-023 | Pre-orders SHALL NOT create financial obligations | No payment collected at pre-order time |
| MKT-024 | Pre-orders SHALL be non-binding | Business may cancel at any time |
| MKT-025 | Pre-orders SHALL contribute to demand analytics | All pre-orders feed marketplace readiness scoring |
| MKT-026 | Pre-orders SHALL receive notification when inventory goes Live | Automatic notification on status change |

### 6.3 Partner Side (Supply)

#### 6.3.1 Partner Generalization

"Partner" is the generalized term for any supply-side participant. The existing "Rider" concept (CTX-002) is a specialization of Partner for helmet advertising:

| Partner Type | Existing Concept | Inventory Types |
|--------------|-----------------|-----------------|
| Rider | CTX-002 (RiderModule) | INV-001 (Helmet), INV-005/006/007 (Wearables) |
| Taxi Owner | New | INV-002, INV-003, INV-004 (Taxi surfaces) |
| Property Owner | New | INV-011, INV-012, INV-013, INV-014 (Property surfaces) |
| Building Owner | New | INV-012, INV-013 (Building surfaces) |
| Bus Operator | New | INV-015, INV-016, INV-017 (Bus surfaces) |
| Delivery Rider | New | INV-008, INV-009, INV-010 (Delivery equipment) |

#### 6.3.2 Partner Pre-Enrollment

For inventory types with status "Pre-Order", partners MAY submit pre-enrollment applications:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Pre-enrollment identifier |
| user_id | UUID | Partner user account |
| partner_type | string | Category of partner |
| inventory_type_id | UUID | Inventory type enrolling for |
| asset_count | integer | Number of advertising surfaces available |
| operating_zones | UUID[] | Zones where partner operates |
| availability_hours | JSON | Weekly availability schedule |
| status | enum | Submitted, Verified, Approved, Rejected, Withdrawn |
| documents_submitted | UUID[] | References to uploaded documents |
| media_submitted | UUID[] | References to uploaded media |
| created_at | timestamptz | Submission timestamp |

#### 6.3.3 Pre-Enrollment Rules

| ID | Rule | Description |
|----|------|-------------|
| MKT-027 | Pre-enrollment SHALL NOT create operational obligations | Partner has no duties until inventory goes Live |
| MKT-028 | Pre-enrollment MAY require document submission | Verifiable supply readiness |
| MKT-029 | Pre-enrollment SHALL contribute to supply analytics | All enrollments feed marketplace readiness scoring |

---


## 7. Print Partner Network

### 7.1 Purpose

Print Partners are third-party vendors capable of producing advertising materials (stickers, vinyl wraps, signage, fabric prints, etc.) for various inventory types. The existing sticker vendor concept (Document 06, CTX-006) is a specialization for helmet stickers.

### 7.2 Print Partner Profile

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Print partner identifier |
| name | string | Business name |
| contact_person | string | Primary contact |
| phone | string | Contact phone |
| email | string | Contact email |
| region_id | UUID | Operating region |
| zone_id | UUID | Operating zone |
| ward_id | UUID | Specific ward location |
| gps_coordinates | point | Exact location (latitude, longitude) |
| supported_inventory_types | UUID[] | Inventory types this partner can produce for |
| capabilities | string[] | Production capabilities (vinyl_cutting, large_format, fabric_print, etc.) |
| max_daily_capacity | integer | Maximum production units per day |
| working_hours | JSON | Operating schedule |
| lead_time_days | integer | Standard production lead time |
| quality_rating | decimal | Historical quality score (0-5) |
| status | enum | Active, Suspended, Deactivated |
| pricing_tiers | JSON | Volume-based pricing |

### 7.3 Print Partner Rules

| ID | Rule | Description |
|----|------|-------------|
| PPR-001 | Each print partner SHALL declare supported inventory types | Capability matching |
| PPR-002 | Print partner assignment SHALL prefer nearest capable partner | Geographic optimization |
| PPR-003 | Print partner capacity SHALL be tracked against daily limits | Overload prevention |
| PPR-004 | Print partner quality rating SHALL be updated after each order | Continuous quality tracking |
| PPR-005 | Print partners SHALL be zone-assignable by Super Admin | Operational control |

### 7.4 Future Routing Logic

When a campaign requires material production, the system SHALL recommend the nearest capable print partner based on:

1. Supported inventory type match
2. Available capacity (daily limit not exceeded)
3. Geographic proximity to distribution center or partner location
4. Quality rating (minimum threshold configurable)
5. Lead time compatibility with campaign start date

---


## 8. Distribution Centers

### 8.1 Purpose

Distribution Centers are physical collection/installation locations where partners receive advertising materials. For MVP (helmet advertising), riders collect stickers from designated locations. Future inventory types will use distribution centers for material pickup, professional installation, or coordination.

### 8.2 Distribution Center Profile

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Distribution center identifier |
| name | string | Location name |
| type | enum | Collection Point, Installation Center, Coordination Hub |
| region_id | UUID | Region |
| zone_id | UUID | Zone |
| ward_id | UUID | Ward |
| gps_coordinates | point | Exact location (latitude, longitude) |
| address | text | Physical address |
| supported_inventory_types | UUID[] | Inventory types serviced |
| operating_hours | JSON | Weekly schedule with timezone |
| capacity_per_hour | integer | Maximum partner visits per hour |
| current_stock | JSON | Stock levels by inventory type |
| contact_phone | string | Location contact |
| manager_user_id | UUID | Assigned manager |
| status | enum | Active, Temporarily Closed, Permanently Closed |

### 8.3 Distribution Center Rules

| ID | Rule | Description |
|----|------|-------------|
| DST-001 | Each distribution center SHALL declare supported inventory types | Service scope definition |
| DST-002 | Stock levels SHALL be tracked in real-time | Inventory accuracy |
| DST-003 | Operating hours SHALL be configurable per day of week | Schedule flexibility |
| DST-004 | Capacity limits SHALL prevent overbooking | Operational quality |
| DST-005 | Distribution centers SHALL be assignable to zones by Super Admin | Geographic management |
| DST-006 | Low stock alerts SHALL trigger at configurable thresholds | Proactive restocking |

### 8.4 Inventory-Specific Distribution

| Inventory Category | Distribution Model |
|-------------------|--------------------|
| Vehicle (Helmet) | Partner collects stickers from nearest center |
| Vehicle (Taxi) | Professional installer visits partner or partner visits center |
| Wearable | Partner collects branded items from center |
| Property | Coordinator schedules on-site installation |
| Infrastructure | Bulk installation coordinated with operator |
| Delivery | Partner collects branded equipment from center |

---


## 9. Supply Intelligence & Demand Intelligence

### 9.1 Supply Intelligence

Supply intelligence tracks the availability, readiness, and capacity of the partner network across all inventory types.

#### 9.1.1 Supply Metrics

| ID | Metric | Description | Granularity |
|----|--------|-------------|-------------|
| SDI-001 | Registered Partners | Total pre-enrolled/registered partners | Per inventory type, per zone |
| SDI-002 | Verified Partners | Partners who passed document verification | Per inventory type, per zone |
| SDI-003 | Available Inventory Units | Total advertising surfaces available | Per inventory type, per zone |
| SDI-004 | Geographic Coverage | Percentage of target zones with supply | Per inventory type, per region |
| SDI-005 | Capacity Utilization | Assigned units / Total available units | Per inventory type, per zone |
| SDI-006 | Partner Growth Rate | New enrollments per week/month | Per inventory type |
| SDI-007 | Partner Retention Rate | Active partners / Historical total | Per inventory type |
| SDI-008 | Average Partner Quality Score | Mean reliability/quality score | Per inventory type, per zone |

#### 9.1.2 Supply Dashboard

The Super Admin panel SHALL display supply intelligence dashboards with:

- Real-time partner counts by inventory type and zone
- Geographic heat maps showing supply density
- Growth trend charts (weekly, monthly)
- Capacity utilization gauges
- Partner quality distribution histograms

### 9.2 Demand Intelligence

Demand intelligence tracks business interest, pre-orders, and campaign demand patterns across all inventory types.

#### 9.2.1 Demand Metrics

| ID | Metric | Description | Granularity |
|----|--------|-------------|-------------|
| SDI-009 | Pre-Order Count | Total pre-orders submitted | Per inventory type, per zone |
| SDI-010 | Pre-Order Volume | Total units requested via pre-orders | Per inventory type, per zone |
| SDI-011 | Pre-Order Budget | Total budget indicated in pre-orders | Per inventory type |
| SDI-012 | Demand by Region | Geographic distribution of demand | Per inventory type, per region |
| SDI-013 | Demand by Duration | Distribution of requested campaign durations | Per inventory type |
| SDI-014 | Requested Launch Dates | When businesses want campaigns to start | Per inventory type |
| SDI-015 | Business Interest Score | Weighted engagement metric | Per inventory type |
| SDI-016 | Demand Growth Rate | New pre-orders per week/month | Per inventory type |

#### 9.2.2 Demand Dashboard

The Super Admin panel SHALL display demand intelligence dashboards with:

- Pre-order volume by inventory type (bar chart)
- Geographic demand heat maps
- Budget distribution analysis
- Requested launch date timeline
- Business engagement funnel

### 9.3 Supply-Demand Gap Analysis

The system SHALL automatically compute supply-demand gaps:

| Metric | Calculation |
|--------|-------------|
| Fill Rate Projection | Available supply / Requested demand (per zone, per type) |
| Unmet Demand | Pre-order volume exceeding available supply |
| Excess Supply | Available supply without corresponding demand |
| Geographic Mismatch | Zones with demand but no supply (or vice versa) |
| Temporal Mismatch | Demand for dates when supply is unavailable |

---


## 10. Marketplace Readiness Score

### 10.1 Purpose

The Marketplace Readiness Score provides a data-driven assessment of whether an inventory type is ready for Live activation. It combines supply, demand, coverage, and operational readiness into a composite score.

### 10.2 Readiness Components

| ID | Component | Weight | Calculation |
|----|-----------|--------|-------------|
| MKT-030 | Supply Readiness % | 30% | Verified partners / Target partners × 100 |
| MKT-031 | Demand Readiness % | 25% | Pre-orders / Target pre-orders × 100 |
| MKT-032 | Geographic Coverage % | 20% | Zones with supply / Target zones × 100 |
| MKT-033 | Operational Readiness % | 15% | Configured rules / Required rules × 100 |
| MKT-034 | Infrastructure Readiness % | 10% | Distribution centers + Print partners available |

### 10.3 Composite Score

```
Marketplace Readiness = (Supply × 0.30) + (Demand × 0.25) + (Coverage × 0.20) 
                      + (Operational × 0.15) + (Infrastructure × 0.10)
```

### 10.4 Threshold Configuration

| Parameter | Default | Configurable |
|-----------|---------|--------------|
| auto_recommend_threshold | 80% | YES (Super Admin) |
| minimum_supply_threshold | 50% | YES (Super Admin) |
| minimum_demand_threshold | 30% | YES (Super Admin) |
| minimum_coverage_threshold | 40% | YES (Super Admin) |
| minimum_operational_threshold | 100% | NO (all rules must be configured) |

### 10.5 Auto Launch Recommendation

| ID | Rule | Description |
|----|------|-------------|
| MKT-035 | When composite score ≥ auto_recommend_threshold, system SHALL generate a Launch Recommendation notification to Super Admin | Proactive activation alert |
| MKT-036 | Launch Recommendation SHALL NOT auto-activate the inventory type | Human decision required |
| MKT-037 | Super Admin SHALL review readiness dashboard before activation | Informed decision |
| MKT-038 | Activation SHALL require explicit confirmation with reason | Audit trail |
| MKT-039 | System SHALL send notifications to all pre-order businesses and pre-enrolled partners upon activation | Stakeholder communication |

### 10.6 Readiness Dashboard (Super Admin)

For each inventory type in Pre-Order status, the Super Admin panel SHALL display:

- Composite readiness score (gauge visualization)
- Individual component scores (radar/spider chart)
- Trend over time (line chart)
- Target vs. actual for each component
- Launch recommendation status (Not Ready / Approaching / Recommended)
- One-click activation button (only enabled when MKT-034 operational = 100%)

---


## 11. Region Expansion Support

### 11.1 Geographic Hierarchy

The platform maintains a three-level geographic hierarchy (established in Document 06):

```
Region → Zone → Ward
```

### 11.2 Multi-Region Readiness

| ID | Rule | Description |
|----|------|-------------|
| MKT-040 | Each inventory type SHALL track readiness independently per region | Regional granularity |
| MKT-041 | An inventory type MAY be Live in one region and Pre-Order in another | Independent activation |
| MKT-042 | Region expansion SHALL NOT require code changes | Configuration-driven |
| MKT-043 | All geographic identifiers SHALL use UUID references, not hardcoded names | No country-specific assumptions |
| MKT-044 | Currency and language SHALL remain configurable per region | Future internationalization |

### 11.3 Region-Inventory Matrix

The platform SHALL maintain a region-inventory status matrix:

| | Region A (KTM Valley) | Region B (Future) | Region C (Future) |
|---|---|---|---|
| Helmet Advertising | Live | Pre-Order | — |
| Taxi Door Exterior | Pre-Order | Pre-Order | — |
| Property Hoarding | Pre-Order | — | — |

This matrix is managed exclusively by Super Admin through the Configuration Service.

---

## 12. New Bounded Contexts

### 12.1 Context Map Extension

This expansion introduces three new bounded contexts that SHALL be added to the domain model (Document 03):

| ID | Context | Module Name | Responsibility |
|----|---------|-------------|----------------|
| CTX-015 | Marketplace Domain | `MarketplaceModule` | Inventory type registry, readiness scoring, pre-order management, activation workflow |
| CTX-016 | Partner Domain | `PartnerModule` | Generalized partner lifecycle, pre-enrollment, multi-type partner management |
| CTX-017 | Distribution Domain | `DistributionModule` | Distribution centers, print partner network, material logistics coordination |

### 12.2 CTX-015 — Marketplace Domain

**Responsibility:** Manages the inventory type catalog, marketplace readiness assessment, pre-order lifecycle, and inventory activation workflow.

**Aggregates:**

| Aggregate | Root Entity | Description |
|-----------|-------------|-------------|
| AGG-019 | InventoryType | Advertising inventory type with status lifecycle |
| AGG-020 | PreOrder | Business pre-order for future inventory |
| AGG-021 | ReadinessScore | Composite marketplace readiness assessment |

**Owned Tables:**

| Table | Description |
|-------|-------------|
| marketplace_inventory_types | Inventory type catalog |
| marketplace_pre_orders | Business pre-order records |
| marketplace_readiness_scores | Historical readiness score snapshots |
| marketplace_readiness_thresholds | Configurable activation thresholds |
| marketplace_activation_log | Activation decision audit trail |

### 12.3 CTX-016 — Partner Domain

**Responsibility:** Manages generalized partner lifecycle for all non-rider partner types. The existing Rider Domain (CTX-002) remains unchanged for MVP helmet operations.

**Aggregates:**

| Aggregate | Root Entity | Description |
|-----------|-------------|-------------|
| AGG-022 | Partner | Generalized supply-side participant |
| AGG-023 | PartnerEnrollment | Pre-enrollment application for inventory type |
| AGG-024 | PartnerAsset | Registered advertising surface owned by partner |

**Owned Tables:**

| Table | Description |
|-------|-------------|
| partner_profiles | Partner identity and contact |
| partner_enrollments | Pre-enrollment records by inventory type |
| partner_assets | Registered advertising surfaces |
| partner_documents | Submitted verification documents |
| partner_verifications | Verification status tracking |

### 12.4 CTX-017 — Distribution Domain

**Responsibility:** Manages physical distribution infrastructure including centers and print partners.

**Aggregates:**

| Aggregate | Root Entity | Description |
|-----------|-------------|-------------|
| AGG-025 | DistributionCenter | Physical collection/installation location |
| AGG-026 | PrintPartner | Third-party production vendor |

**Owned Tables:**

| Table | Description |
|-------|-------------|
| distribution_centers | Center profiles and configuration |
| distribution_center_stock | Stock levels by inventory type |
| distribution_center_schedule | Operating hours |
| print_partners | Print partner profiles |
| print_partner_capabilities | Supported inventory types and capacities |
| print_partner_orders | Production order tracking |

---


## 13. Domain Events

### 13.1 Marketplace Domain Events

| ID | Event | Source | Payload | Consumers |
|----|-------|--------|---------|-----------|
| EVT-070 | InventoryTypeCreated | CTX-015 | { inventoryTypeId, code, name, category, status } | CTX-009, CTX-010, CTX-014 |
| EVT-071 | InventoryTypeActivated | CTX-015 | { inventoryTypeId, previousStatus, newStatus, activatedBy } | CTX-008, CTX-009, CTX-010, CTX-014, CTX-016 |
| EVT-072 | InventoryTypePaused | CTX-015 | { inventoryTypeId, reason, pausedBy } | CTX-008, CTX-010, CTX-014 |
| EVT-073 | InventoryTypeRetired | CTX-015 | { inventoryTypeId, retiredBy } | CTX-008, CTX-010, CTX-014 |
| EVT-074 | PreOrderSubmitted | CTX-015 | { preOrderId, businessId, inventoryTypeId, quantity, zones } | CTX-010, CTX-014 |
| EVT-075 | PreOrderCancelled | CTX-015 | { preOrderId, businessId, reason } | CTX-010, CTX-014 |
| EVT-076 | ReadinessThresholdReached | CTX-015 | { inventoryTypeId, score, threshold } | CTX-008, CTX-010 |
| EVT-077 | LaunchRecommendationGenerated | CTX-015 | { inventoryTypeId, score, components } | CTX-008, CTX-010 |

### 13.2 Partner Domain Events

| ID | Event | Source | Payload | Consumers |
|----|-------|--------|---------|-----------|
| EVT-078 | PartnerPreEnrolled | CTX-016 | { enrollmentId, userId, partnerType, inventoryTypeId } | CTX-010, CTX-014, CTX-015 |
| EVT-079 | PartnerDocumentsSubmitted | CTX-016 | { enrollmentId, documentIds } | CTX-010 |
| EVT-080 | PartnerVerified | CTX-016 | { enrollmentId, verifiedBy } | CTX-010, CTX-014, CTX-015 |
| EVT-081 | PartnerEnrollmentRejected | CTX-016 | { enrollmentId, reason } | CTX-008, CTX-010 |
| EVT-082 | PartnerAssetRegistered | CTX-016 | { assetId, partnerId, inventoryTypeId, zone } | CTX-014, CTX-015 |
| EVT-083 | PartnerWithdrawn | CTX-016 | { enrollmentId, reason } | CTX-010, CTX-014, CTX-015 |

### 13.3 Distribution Domain Events

| ID | Event | Source | Payload | Consumers |
|----|-------|--------|---------|-----------|
| EVT-084 | DistributionCenterCreated | CTX-017 | { centerId, name, zone, supportedTypes } | CTX-010, CTX-015 |
| EVT-085 | DistributionCenterStockUpdated | CTX-017 | { centerId, inventoryTypeId, previousStock, newStock } | CTX-014 |
| EVT-086 | DistributionCenterLowStock | CTX-017 | { centerId, inventoryTypeId, currentStock, threshold } | CTX-008 |
| EVT-087 | PrintPartnerRegistered | CTX-017 | { printPartnerId, name, zone, capabilities } | CTX-010, CTX-015 |
| EVT-088 | PrintOrderCreated | CTX-017 | { orderId, printPartnerId, inventoryTypeId, quantity } | CTX-010 |
| EVT-089 | PrintOrderCompleted | CTX-017 | { orderId, printPartnerId, deliveredQuantity } | CTX-010, CTX-014 |

---


## 14. API Endpoints (Marketplace Expansion)

### 14.1 Marketplace Endpoints

All marketplace endpoints SHALL be under the `/api/v1/marketplace/` namespace.

| ID | Method | Path | Auth | Permission | Description |
|----|--------|------|------|------------|-------------|
| EP-200 | GET | /marketplace/inventory-types | Public | — | List all inventory types with status |
| EP-201 | GET | /marketplace/inventory-types/:id | Public | — | Get inventory type details |
| EP-202 | POST | /marketplace/inventory-types | JWT | super_admin | Create new inventory type |
| EP-203 | PATCH | /marketplace/inventory-types/:id | JWT | super_admin | Update inventory type |
| EP-204 | POST | /marketplace/inventory-types/:id/activate | JWT | super_admin | Activate inventory type (Pre-Order → Live) |
| EP-205 | POST | /marketplace/inventory-types/:id/pause | JWT | super_admin | Pause inventory type |
| EP-206 | POST | /marketplace/inventory-types/:id/retire | JWT | super_admin | Retire inventory type |

### 14.2 Pre-Order Endpoints

| ID | Method | Path | Auth | Permission | Description |
|----|--------|------|------|------------|-------------|
| EP-210 | POST | /marketplace/pre-orders | JWT | business | Submit pre-order |
| EP-211 | GET | /marketplace/pre-orders | JWT | business, admin | List pre-orders (filtered) |
| EP-212 | GET | /marketplace/pre-orders/:id | JWT | business, admin | Get pre-order details |
| EP-213 | DELETE | /marketplace/pre-orders/:id | JWT | business | Cancel pre-order |
| EP-214 | GET | /marketplace/pre-orders/analytics | JWT | admin, super_admin | Pre-order analytics summary |

### 14.3 Partner Enrollment Endpoints

| ID | Method | Path | Auth | Permission | Description |
|----|--------|------|------|------------|-------------|
| EP-220 | POST | /marketplace/partner-enrollments | JWT | partner | Submit pre-enrollment |
| EP-221 | GET | /marketplace/partner-enrollments | JWT | partner, admin | List enrollments |
| EP-222 | GET | /marketplace/partner-enrollments/:id | JWT | partner, admin | Get enrollment details |
| EP-223 | POST | /marketplace/partner-enrollments/:id/documents | JWT | partner | Submit documents |
| EP-224 | POST | /marketplace/partner-enrollments/:id/verify | JWT | admin | Verify enrollment |
| EP-225 | POST | /marketplace/partner-enrollments/:id/reject | JWT | admin | Reject enrollment |
| EP-226 | DELETE | /marketplace/partner-enrollments/:id | JWT | partner | Withdraw enrollment |

### 14.4 Marketplace Analytics Endpoints

| ID | Method | Path | Auth | Permission | Description |
|----|--------|------|------|------------|-------------|
| EP-230 | GET | /marketplace/analytics/supply | JWT | admin, super_admin | Supply intelligence dashboard data |
| EP-231 | GET | /marketplace/analytics/demand | JWT | admin, super_admin | Demand intelligence dashboard data |
| EP-232 | GET | /marketplace/analytics/readiness | JWT | admin, super_admin | Readiness scores per inventory type |
| EP-233 | GET | /marketplace/analytics/readiness/:inventoryTypeId | JWT | admin, super_admin | Detailed readiness for specific type |
| EP-234 | GET | /marketplace/analytics/gap-analysis | JWT | super_admin | Supply-demand gap analysis |

### 14.5 Distribution Center Endpoints

| ID | Method | Path | Auth | Permission | Description |
|----|--------|------|------|------------|-------------|
| EP-240 | POST | /marketplace/distribution-centers | JWT | super_admin | Create distribution center |
| EP-241 | GET | /marketplace/distribution-centers | JWT | admin, super_admin | List distribution centers |
| EP-242 | GET | /marketplace/distribution-centers/:id | JWT | admin, super_admin | Get center details |
| EP-243 | PATCH | /marketplace/distribution-centers/:id | JWT | super_admin | Update center |
| EP-244 | GET | /marketplace/distribution-centers/:id/stock | JWT | admin | Get stock levels |

### 14.6 Print Partner Endpoints

| ID | Method | Path | Auth | Permission | Description |
|----|--------|------|------|------------|-------------|
| EP-250 | POST | /marketplace/print-partners | JWT | super_admin | Register print partner |
| EP-251 | GET | /marketplace/print-partners | JWT | admin, super_admin | List print partners |
| EP-252 | GET | /marketplace/print-partners/:id | JWT | admin, super_admin | Get print partner details |
| EP-253 | PATCH | /marketplace/print-partners/:id | JWT | super_admin | Update print partner |
| EP-254 | GET | /marketplace/print-partners/nearest | JWT | admin | Find nearest capable partner |

---


## 15. Database Schema (Marketplace Expansion)

### 15.1 Schema Organization

New tables SHALL follow the existing prefix convention (Document 05 §2):

| Schema Prefix | Module | Context ID | Aggregate IDs |
|---------------|--------|-----------|---------------|
| marketplace_ | MarketplaceModule | CTX-015 | AGG-019, AGG-020, AGG-021 |
| partner_ | PartnerModule | CTX-016 | AGG-022, AGG-023, AGG-024 |
| distribution_ | DistributionModule | CTX-017 | AGG-025, AGG-026 |

### 15.2 Marketplace Tables

**TBL-050: marketplace_inventory_types**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| code | VARCHAR(100) | UNIQUE, NOT NULL | Machine-readable code |
| name | VARCHAR(255) | NOT NULL | Display name |
| description | TEXT | | Detailed description |
| category | VARCHAR(50) | NOT NULL, CHECK (Vehicle,Wearable,Property,Infrastructure,Delivery) | Inventory category |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pre_order', CHECK (live,pre_order,paused,retired) | Current status |
| partner_type | VARCHAR(100) | NOT NULL | Required partner type |
| icon_url | VARCHAR(500) | | Icon for UI |
| sort_order | INTEGER | DEFAULT 0 | Display ordering |
| region_ids | UUID[] | | Available regions |
| plugin_config | JSONB | NOT NULL, DEFAULT '{}' | Full plugin contract configuration |
| activated_at | TIMESTAMPTZ | | When status became Live |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**TBL-051: marketplace_pre_orders**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| business_id | UUID | NOT NULL | Requesting business |
| inventory_type_id | UUID | NOT NULL, FK marketplace_inventory_types(id) | Target inventory type |
| quantity_requested | INTEGER | NOT NULL, CHECK > 0 | Units desired |
| preferred_zones | UUID[] | | Geographic preference |
| preferred_start_date | DATE | | Desired start date |
| campaign_duration_days | INTEGER | CHECK > 0 | Desired duration |
| budget_range_min | INTEGER | | Min budget (paisa) |
| budget_range_max | INTEGER | | Max budget (paisa) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'submitted' | Pre-order status |
| priority | VARCHAR(20) | DEFAULT 'standard' | Business priority |
| notes | TEXT | | Additional notes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Submission time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |
| cancelled_at | TIMESTAMPTZ | | Cancellation time |

**TBL-052: marketplace_readiness_scores**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| inventory_type_id | UUID | NOT NULL, FK marketplace_inventory_types(id) | Target inventory type |
| region_id | UUID | NOT NULL | Region assessed |
| supply_score | DECIMAL(5,2) | NOT NULL | Supply readiness % |
| demand_score | DECIMAL(5,2) | NOT NULL | Demand readiness % |
| coverage_score | DECIMAL(5,2) | NOT NULL | Geographic coverage % |
| operational_score | DECIMAL(5,2) | NOT NULL | Operational readiness % |
| infrastructure_score | DECIMAL(5,2) | NOT NULL | Infrastructure readiness % |
| composite_score | DECIMAL(5,2) | NOT NULL | Weighted composite % |
| recommendation | VARCHAR(30) | NOT NULL | not_ready, approaching, recommended |
| computed_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Computation timestamp |

### 15.3 Partner Tables

**TBL-053: partner_profiles**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| user_id | UUID | NOT NULL, UNIQUE | Identity reference |
| partner_type | VARCHAR(100) | NOT NULL | Category of partner |
| display_name | VARCHAR(255) | NOT NULL | Partner name |
| phone | VARCHAR(20) | NOT NULL | Contact phone |
| email | VARCHAR(255) | | Contact email |
| operating_zones | UUID[] | | Zones where partner operates |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Profile status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Registration time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**TBL-054: partner_enrollments**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| partner_id | UUID | NOT NULL, FK partner_profiles(id) | Partner reference |
| inventory_type_id | UUID | NOT NULL, FK marketplace_inventory_types(id) | Target inventory type |
| asset_count | INTEGER | NOT NULL, CHECK > 0 | Available surfaces |
| availability_hours | JSONB | | Weekly availability |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'submitted' | Enrollment status |
| verified_at | TIMESTAMPTZ | | Verification timestamp |
| verified_by | UUID | | Verifying admin |
| rejection_reason | TEXT | | If rejected |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Submission time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**TBL-055: partner_assets**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| partner_id | UUID | NOT NULL, FK partner_profiles(id) | Owner partner |
| inventory_type_id | UUID | NOT NULL, FK marketplace_inventory_types(id) | Asset type |
| description | TEXT | | Asset description |
| zone_id | UUID | NOT NULL | Operating zone |
| gps_coordinates | POINT | | Asset location (for fixed assets) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'registered' | Asset lifecycle status |
| media_ids | UUID[] | | Uploaded media references |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Registration time |

### 15.4 Distribution Tables

**TBL-056: distribution_centers**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| name | VARCHAR(255) | NOT NULL | Center name |
| type | VARCHAR(50) | NOT NULL | collection_point, installation_center, coordination_hub |
| region_id | UUID | NOT NULL | Region |
| zone_id | UUID | NOT NULL | Zone |
| ward_id | UUID | | Ward |
| gps_coordinates | POINT | NOT NULL | Location |
| address | TEXT | NOT NULL | Physical address |
| supported_inventory_types | UUID[] | NOT NULL | Serviced types |
| operating_hours | JSONB | NOT NULL | Weekly schedule |
| capacity_per_hour | INTEGER | NOT NULL | Throughput limit |
| contact_phone | VARCHAR(20) | | Contact number |
| manager_user_id | UUID | | Assigned manager |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | Center status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation time |

**TBL-057: distribution_center_stock**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| center_id | UUID | NOT NULL, FK distribution_centers(id) | Center reference |
| inventory_type_id | UUID | NOT NULL | Inventory type |
| current_stock | INTEGER | NOT NULL, DEFAULT 0 | Current units |
| low_stock_threshold | INTEGER | NOT NULL, DEFAULT 10 | Alert threshold |
| last_restocked_at | TIMESTAMPTZ | | Last restock time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**TBL-058: print_partners**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| name | VARCHAR(255) | NOT NULL | Business name |
| contact_person | VARCHAR(255) | | Primary contact |
| phone | VARCHAR(20) | NOT NULL | Contact phone |
| email | VARCHAR(255) | | Contact email |
| region_id | UUID | NOT NULL | Region |
| zone_id | UUID | NOT NULL | Zone |
| ward_id | UUID | | Ward |
| gps_coordinates | POINT | | Location |
| supported_inventory_types | UUID[] | NOT NULL | Capable types |
| capabilities | VARCHAR[] | NOT NULL | Production capabilities |
| max_daily_capacity | INTEGER | NOT NULL | Daily limit |
| working_hours | JSONB | NOT NULL | Schedule |
| lead_time_days | INTEGER | NOT NULL, DEFAULT 3 | Production time |
| quality_rating | DECIMAL(3,2) | DEFAULT 0.00 | Quality score |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | Partner status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Registration time |

---


## 16. Configuration Extensions

### 16.1 New Configuration Keys

The following configuration keys SHALL be added to the Configuration Service (Document 06):

| ID | Key | Default | Type | Category | Description |
|----|-----|---------|------|----------|-------------|
| CFG-050 | marketplace.enabled | true | boolean | marketplace | Master switch for marketplace features |
| CFG-051 | marketplace.pre_order.enabled | true | boolean | marketplace | Enable/disable pre-order submissions |
| CFG-052 | marketplace.pre_enrollment.enabled | true | boolean | marketplace | Enable/disable partner pre-enrollment |
| CFG-053 | marketplace.readiness.auto_recommend_threshold | 80 | integer | marketplace | Composite score threshold for recommendation |
| CFG-054 | marketplace.readiness.computation_interval_hours | 24 | integer | marketplace | How often readiness is recomputed |
| CFG-055 | marketplace.readiness.min_supply_threshold | 50 | integer | marketplace | Minimum supply % for recommendation |
| CFG-056 | marketplace.readiness.min_demand_threshold | 30 | integer | marketplace | Minimum demand % for recommendation |
| CFG-057 | marketplace.readiness.min_coverage_threshold | 40 | integer | marketplace | Minimum coverage % for recommendation |
| CFG-058 | marketplace.distribution.low_stock_alert_threshold | 10 | integer | distribution | Default low stock alert level |
| CFG-059 | marketplace.print_partner.min_quality_rating | 3.0 | decimal | distribution | Minimum quality for auto-assignment |

### 16.2 New Feature Flags

| ID | Key | Default | Description |
|----|-----|---------|-------------|
| FF-020 | marketplace.show_pre_order_inventory | true | Show non-live inventory in business portal |
| FF-021 | marketplace.allow_partner_pre_enrollment | true | Allow partners to pre-enroll for future types |
| FF-022 | marketplace.show_readiness_dashboard | true | Show readiness dashboard in admin panel |
| FF-023 | marketplace.analytics_enabled | true | Enable marketplace analytics collection |
| FF-024 | marketplace.distribution_center_management | true | Enable distribution center CRUD |
| FF-025 | marketplace.print_partner_management | true | Enable print partner CRUD |

### 16.3 New Dictionary Entries

The following entries SHALL be added to DICT-003 (ASSET_TYPE) in Document 06:

| Code | Label | Status | Category |
|------|-------|--------|----------|
| helmet_advertising | Helmet Advertising | Live | Vehicle |
| taxi_door_exterior | Taxi Exterior Door | Pre-Order | Vehicle |
| taxi_rear_window | Taxi Rear Window | Pre-Order | Vehicle |
| taxi_interior_display | Taxi Interior Display | Pre-Order | Vehicle |
| rideshare_jacket | Ride Sharing Jacket | Pre-Order | Wearable |
| rideshare_windcheater | Ride Sharing Windcheater | Pre-Order | Wearable |
| rideshare_tshirt | Ride Sharing T-Shirt | Pre-Order | Wearable |
| delivery_bag | Delivery Bag | Pre-Order | Delivery |
| delivery_box | Delivery Box | Pre-Order | Delivery |
| delivery_backpack | Delivery Backpack | Pre-Order | Delivery |
| property_hoarding | Property Hoarding | Pre-Order | Property |
| building_wall | Building Wall | Pre-Order | Property |
| building_terrace | Building Terrace | Pre-Order | Property |
| roadside_signboard | Roadside Sign Board | Pre-Order | Infrastructure |
| bus_interior_panel | Public Bus Interior Panel | Pre-Order | Infrastructure |
| bus_grab_handle | Public Bus Grab Handle | Pre-Order | Infrastructure |
| bus_seat_branding | Public Bus Seat Branding | Pre-Order | Infrastructure |

A new dictionary SHALL also be introduced:

**DICT-010: PARTNER_TYPE**

| Code | Label | Description |
|------|-------|-------------|
| rider | Rider | Motorcycle ride-sharing partner (MVP) |
| taxi_owner | Taxi Owner | Taxi vehicle owner/operator |
| property_owner | Property Owner | Real estate/hoarding owner |
| building_owner | Building Owner | Building wall/terrace owner |
| bus_operator | Bus Operator | Public bus service operator |
| delivery_rider | Delivery Rider | Delivery service partner |

**DICT-011: INVENTORY_CATEGORY**

| Code | Label | Description |
|------|-------|-------------|
| vehicle | Vehicle | Moving vehicle surfaces |
| wearable | Wearable | Clothing and worn items |
| property | Property | Fixed real estate surfaces |
| infrastructure | Infrastructure | Public infrastructure |
| delivery | Delivery | Delivery equipment |

**DICT-012: INVENTORY_STATUS**

| Code | Label | Description |
|------|-------|-------------|
| live | Live | Fully operational |
| pre_order | Pre-Order | Demand capture only |
| paused | Paused | Temporarily suspended |
| retired | Retired | Permanently decommissioned |

---


## 17. State Machines (New Pipelines)

### 17.1 Inventory Type Lifecycle

```
┌────────────┐   Activate    ┌────────┐
│  Pre-Order │──────────────▶│  Live  │
└─────┬──────┘               └───┬────┘
      │                          │
      │ Pause                    │ Pause
      ▼                          ▼
┌────────────┐               ┌────────┐
│   Paused   │               │ Paused │
└─────┬──────┘               └───┬────┘
      │                          │
      │ Retire                   │ Retire / Reactivate
      ▼                          ▼
┌────────────┐               ┌────────┐
│  Retired   │               │  Live  │ (reactivate only)
└────────────┘               └────────┘
```

**Transitions:**

| From | To | Trigger | Authority | Side Effects |
|------|----|---------|-----------|--------------|
| Pre-Order | Live | MKT-030 met + Super Admin confirms | Super Admin | EVT-071, notify pre-orders, notify enrollments |
| Pre-Order | Paused | Super Admin decision | Super Admin | EVT-072, suspend pre-orders |
| Live | Paused | Super Admin decision | Super Admin | EVT-072, halt new campaigns |
| Paused | Live | Super Admin reactivates | Super Admin | EVT-071, resume operations |
| Paused | Retired | Super Admin decision (irreversible) | Super Admin | EVT-073, archive data |

### 17.2 Partner Enrollment Pipeline

```
┌───────────┐   Documents    ┌────────────────┐   Admin    ┌──────────┐
│ Submitted │───────────────▶│ Under Review   │──────────▶│ Approved │
└─────┬─────┘               └───────┬────────┘           └──────────┘
      │                              │
      │ Withdraw                     │ Reject
      ▼                              ▼
┌───────────┐               ┌────────────────┐
│ Withdrawn │               │   Rejected     │
└───────────┘               └────────────────┘
```

**Transitions:**

| From | To | Trigger | Authority | Side Effects |
|------|----|---------|-----------|--------------|
| Submitted | Under Review | Documents submitted | System | EVT-079 |
| Under Review | Approved | Admin verifies | Admin | EVT-080, update supply metrics |
| Under Review | Rejected | Admin rejects | Admin | EVT-081, notify partner |
| Submitted | Withdrawn | Partner cancels | Partner | EVT-083 |
| Under Review | Withdrawn | Partner cancels | Partner | EVT-083 |

### 17.3 Pre-Order Lifecycle

```
┌───────────┐   Acknowledged   ┌──────────────┐   Inventory Live   ┌───────────┐
│ Submitted │─────────────────▶│ Acknowledged │───────────────────▶│ Scheduled │
└─────┬─────┘                  └──────┬───────┘                    └───────────┘
      │                                │
      │ Cancel                         │ Cancel
      ▼                                ▼
┌───────────┐                  ┌───────────┐
│ Cancelled │                  │ Cancelled │
└───────────┘                  └───────────┘
```

**Transitions:**

| From | To | Trigger | Authority | Side Effects |
|------|----|---------|-----------|--------------|
| Submitted | Acknowledged | System confirms receipt | System | EVT-074, notify business |
| Acknowledged | Scheduled | Inventory type activated | System | EVT-071, notify business to create campaign |
| Submitted | Cancelled | Business cancels | Business | EVT-075 |
| Acknowledged | Cancelled | Business cancels | Business | EVT-075 |

---


## 18. Impact on Existing Architecture

### 18.1 Document-by-Document Impact Analysis

This section specifies the ADDITIVE changes each existing document receives. No existing specification is broken or modified — all changes extend the current architecture.

| Document | Impact Level | Nature of Change |
|----------|-------------|------------------|
| 01 - Product Requirements | Low | Add marketplace vision statement; extend scope definitions |
| 02 - Business Rules Engine | Medium | Add MKT-* rules, PPR-* rules, DST-* rules |
| 03 - Domain Model | Medium | Add CTX-015/016/017, AGG-019 through AGG-026, EVT-070 through EVT-089 |
| 04 - System Architecture | Low | Add three NestJS modules; maintain single-VPS deployment |
| 05 - Data Model | Medium | Add TBL-050 through TBL-058; new schema prefixes |
| 06 - Configuration Dictionary | Medium | Add CFG-050 through CFG-059, FF-020 through FF-025, DICT-010/011/012 |
| 07 - Authentication Permissions | Low | Add partner role, marketplace permissions |
| 08 - API Specification | Medium | Add EP-200 through EP-254; /marketplace/ namespace |
| 09 - Rider App Spec | None | No change — rider remains helmet-only for MVP |
| 10 - Business Portal Spec | Low | Add marketplace browsing, pre-order UI |
| 11 - Admin Panel Spec | Medium | Add marketplace management, readiness dashboard, partner management |
| 12 - Campaign Assignment Spec | None | No change — campaign pipeline remains unchanged |
| 13 - Financial Platform Spec | None | No change — financial flows unchanged for MVP |
| 14 - Notifications Timeline Spec | Low | Add marketplace notification templates |
| 15 - Deployment Operations Spec | Low | Add three new module containers to Docker Compose |
| 16 - Security Compliance Spec | Low | Extend data classification for marketplace data |
| 17 - Testing Strategy Spec | Low | Add marketplace module test requirements |
| 18 - MVP Scope Glossary | Low | Add marketplace terms to glossary |

### 18.2 Backward Compatibility Statement

1. ALL existing MVP workflows remain UNCHANGED and FULLY OPERATIONAL.
2. The Rider App (Document 09) receives NO modifications.
3. The Campaign Lifecycle (Document 12) receives NO modifications.
4. The Financial Platform (Document 13) receives NO modifications.
5. Existing database tables (TBL-001 through TBL-049) receive NO schema changes.
6. Existing API endpoints (EP-001 through EP-199) receive NO behavioral changes.
7. Existing domain events (EVT-001 through EVT-069) receive NO modifications.
8. Existing configuration keys (CFG-001 through CFG-049) retain their current values and behavior.

---


## 19. Security and Compliance

### 19.1 Data Classification (Extension to Document 16)

| Data Category | Classification | Access Control |
|---------------|---------------|----------------|
| Inventory type configuration | Internal | Super Admin only |
| Pre-order data | Confidential | Business owner + Admin |
| Partner enrollment data | Confidential | Partner + Admin |
| Partner documents | Restricted | Partner + Admin (time-limited access) |
| Marketplace analytics | Internal | Admin + Super Admin |
| Readiness scores | Internal | Super Admin only |
| Distribution center data | Internal | Admin + Super Admin |
| Print partner data | Internal | Admin + Super Admin |

### 19.2 Permission Matrix (Extension to Document 07)

| Resource | Partner | Business | Admin | Super Admin |
|----------|---------|----------|-------|-------------|
| View inventory types | Read (public) | Read (public) | Read | Full |
| Submit pre-order | — | Create/Read/Delete | Read | Full |
| Submit pre-enrollment | Create/Read/Delete | — | Read | Full |
| View marketplace analytics | — | — | Read | Full |
| Manage inventory types | — | — | — | Full |
| Manage distribution centers | — | — | Read | Full |
| Manage print partners | — | — | Read | Full |
| Activate inventory type | — | — | — | Full |
| View readiness scores | — | — | Read | Full |

---

## 20. Testing Requirements

### 20.1 Marketplace Module Testing (Extension to Document 17)

| Test Category | Scope | Priority |
|---------------|-------|----------|
| Inventory lifecycle state machine | Unit | Critical |
| Pre-order CRUD operations | Integration | High |
| Partner enrollment workflow | Integration | High |
| Readiness score computation | Unit | High |
| Activation guard (MKT-001 through MKT-004) | Integration | Critical |
| MVP protection validation | E2E | Critical |
| API endpoint authorization | Integration | High |
| Supply/demand analytics accuracy | Unit | Medium |
| Distribution center stock management | Integration | Medium |
| Print partner routing logic | Unit | Medium |

### 20.2 Critical Test Scenarios

| Scenario | Expected Outcome |
|----------|-----------------|
| Attempt to run campaign on Pre-Order inventory | REJECTED — MKT-004 enforced |
| Attempt to assign partner to Pre-Order inventory campaign | REJECTED — MKT-004 enforced |
| Attempt to process payment for Pre-Order inventory | REJECTED — MKT-004 enforced |
| Submit pre-order for Pre-Order inventory | ACCEPTED — demand captured |
| Submit pre-enrollment for Pre-Order inventory | ACCEPTED — supply captured |
| Super Admin activates inventory with readiness < threshold | WARNING shown, activation requires override |
| Super Admin activates inventory with readiness ≥ threshold | RECOMMENDED, one-click activation |

---


## 21. Traceability Matrix

### 21.1 Upstream Traceability

| This Document Section | Traces To |
|-----------------------|-----------|
| §2 MVP Protection | Document 01 §2.1 (MVP Scope), Document 18 (MVP Glossary) |
| §3 Inventory Abstraction | Document 03 CTX-009, Document 06 DICT-003 |
| §4 Plugin Contract | Document 02 (Rule Taxonomy), Document 04 §6.3 (Service Interfaces) |
| §5 Rule Engine | Document 06 (Configuration Architecture), Document 02 RULE-CFG-* |
| §6 Marketplace Model | Document 01 §1 (Purpose), Document 03 CTX-003/CTX-005 |
| §7 Print Partners | Document 03 CTX-006, Document 06 (vendor configuration) |
| §8 Distribution Centers | Document 06 (collection point config), Document 12 §sticker distribution |
| §9 Intelligence | Document 03 CTX-014 (Analytics Domain), Document 14 |
| §10 Readiness Score | Document 06 (threshold configuration), Document 11 (Admin Panel) |
| §11 Region Expansion | Document 06 (geographic config), Document 01 §2.2 |
| §12 Bounded Contexts | Document 03 §2 (Bounded Contexts), Document 04 §5 |
| §13 Domain Events | Document 03 §5 (Domain Event Catalog) |
| §14 API Endpoints | Document 08 (API Specification) |
| §15 Database Schema | Document 05 (Data Model) |
| §16 Configuration | Document 06 (Configuration Dictionary) |
| §17 State Machines | Document 02 (Workflow Rules), Document 12 (Lifecycle Spec) |
| §18 Impact Analysis | All Documents 01–18 |
| §19 Security | Document 07, Document 16 |
| §20 Testing | Document 17 |

### 21.2 Downstream Dependencies

This document SHALL be referenced by any future specification that:

- Introduces a new inventory type
- Modifies marketplace readiness thresholds
- Adds partner types or distribution infrastructure
- Implements operational workflows for newly activated inventory
- Extends the plugin contract interface

---

## 22. Implementation Guidance

### 22.1 Phase 1 — Foundation (Pre-Order Infrastructure)

1. Create MarketplaceModule (CTX-015) with inventory type CRUD
2. Create PartnerModule (CTX-016) with pre-enrollment workflow
3. Create DistributionModule (CTX-017) with center/print partner management
4. Implement database tables TBL-050 through TBL-058
5. Add marketplace API endpoints (EP-200 through EP-254)
6. Add configuration keys and feature flags
7. Implement MVP protection guards (MKT-001 through MKT-004)

### 22.2 Phase 2 — Intelligence & Readiness

1. Implement supply and demand metric collection
2. Build readiness score computation engine
3. Create admin panel dashboards (readiness, analytics)
4. Implement auto-recommendation notifications
5. Build business portal pre-order UI

### 22.3 Phase 3 — Activation Framework

1. Implement inventory activation workflow
2. Build partner-to-campaign matching for activated types
3. Extend financial flows for new inventory types
4. Implement operational workflows per activated plugin
5. Extend notification templates for new inventory operations

### 22.4 Critical Constraint

Phases 2 and 3 SHALL NOT begin until Phase 1 is complete and the MVP protection rules (MKT-001 through MKT-004) are verified through automated testing.

---

## 23. Glossary (Marketplace Extension)

| Term | Definition |
|------|-----------|
| Advertising Inventory | A physical surface or item on which an advertisement can be placed |
| Distribution Center | Physical location where partners collect/receive advertising materials |
| Inventory Plugin Contract | Standardized interface every inventory type must implement |
| Inventory Type | A distinct category of advertising surface (e.g., helmet, taxi door, building wall) |
| Launch Recommendation | System-generated suggestion to activate an inventory type based on readiness score |
| Marketplace Readiness Score | Composite metric assessing whether an inventory type is ready for Live activation |
| Partner | Generalized supply-side participant providing advertising surfaces |
| Pre-Enrollment | Non-binding registration of a partner for a future inventory type |
| Pre-Order | Non-binding reservation by a business for a future inventory type |
| Print Partner | Third-party vendor producing advertising materials |
| Supply Intelligence | Analytics on partner availability, capacity, and coverage |
| Demand Intelligence | Analytics on business interest, pre-orders, and campaign demand |

---

*End of Document 19*
