# CHANGELOG v1.1 — Advertising Inventory Marketplace Expansion

**Project:** Solo Advertiser Platform  
**Version:** 1.1  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Impact Analysis  
**Governing Principle:** This changelog documents all ADDITIVE changes introduced by Document 19 (Advertising Inventory Marketplace Specification). No existing MVP specification is modified or broken. All changes extend the platform without regression.

---

## 1. Version Summary

| Property | Value |
|----------|-------|
| Version | 1.1 |
| Type | Additive Expansion |
| Primary Deliverable | Document 19 - Advertising Inventory Marketplace Specification |
| MVP Impact | NONE |
| Backward Compatible | YES — all existing Documents 01–18 remain valid and unchanged |
| New Bounded Contexts | 3 (CTX-015, CTX-016, CTX-017) |
| New Database Tables | 9 (TBL-050 through TBL-058) |
| New API Endpoints | 29 (EP-200 through EP-254) |
| New Domain Events | 20 (EVT-070 through EVT-089) |
| New Configuration Keys | 10 (CFG-050 through CFG-059) |
| New Feature Flags | 6 (FF-020 through FF-025) |
| New Dictionaries | 3 (DICT-010, DICT-011, DICT-012) |

---

## 2. Backward Compatibility Statement

The following components are GUARANTEED UNCHANGED:

1. **Rider App** (Document 09) — No modifications whatsoever
2. **Campaign Lifecycle** (Document 12) — All state machines unchanged
3. **Financial Platform** (Document 13) — All financial flows unchanged
4. **Existing Database Schema** (TBL-001 through TBL-049) — No column or constraint changes
5. **Existing API Endpoints** (EP-001 through EP-199) — No behavioral changes
6. **Existing Domain Events** (EVT-001 through EVT-069) — No payload or routing changes
7. **Existing Configuration** (CFG-001 through CFG-049) — No value or validation changes
8. **Existing Feature Flags** (FF-001 through FF-019) — No state changes
9. **Helmet Advertising Operations** — Remains the ONLY Live inventory type

---


## 3. Per-Document Impact Analysis

### 3.1 Document 01 — Product Requirements Specification

| Section | Impact | Details |
|---------|--------|---------|
| §1 Purpose | Extend | Add "Advertising Inventory Marketplace" to platform description |
| §2.1 In Scope | Extend | Add "Marketplace pre-order and pre-enrollment infrastructure" row |
| §2.1 Asset Types | Extend | Change "Helmet stickers only" to "Helmet stickers (Live); all others Pre-Order" |
| §3 Definitions | Extend | Add: Inventory Type, Partner, Pre-Order, Pre-Enrollment, Distribution Center, Print Partner |

**New Requirement IDs Needed:** REQ-PRD-250 through REQ-PRD-270 (marketplace requirements)

### 3.2 Document 02 — Business Rules Engine

| Section | Impact | Details |
|---------|--------|---------|
| §1.2 Rule Taxonomy | None | Existing taxonomy covers marketplace rules |
| New Section | Add | Marketplace Rules (RULE-MKT-001 through RULE-MKT-044) |
| New Section | Add | Print Partner Rules (RULE-PPR-001 through RULE-PPR-005) |
| New Section | Add | Distribution Rules (RULE-DST-001 through RULE-DST-006) |

**New Rule Identifiers:**
- RULE-MKT-001 through RULE-MKT-044 (marketplace operational rules)
- RULE-PPR-001 through RULE-PPR-005 (print partner rules)
- RULE-DST-001 through RULE-DST-006 (distribution center rules)

### 3.3 Document 03 — Domain Model

| Section | Impact | Details |
|---------|--------|---------|
| §2 Bounded Contexts | Extend | Add CTX-015 (Marketplace), CTX-016 (Partner), CTX-017 (Distribution) |
| §3 Aggregates | Extend | Add AGG-019 through AGG-026 |
| §5 Domain Events | Extend | Add EVT-070 through EVT-089 |
| §2 Context Table | Extend | Add three rows for new contexts |

**New Identifiers:**
- CTX-015: Marketplace Domain (MarketplaceModule)
- CTX-016: Partner Domain (PartnerModule)
- CTX-017: Distribution Domain (DistributionModule)
- AGG-019: InventoryType
- AGG-020: PreOrder
- AGG-021: ReadinessScore
- AGG-022: Partner
- AGG-023: PartnerEnrollment
- AGG-024: PartnerAsset
- AGG-025: DistributionCenter
- AGG-026: PrintPartner

### 3.4 Document 04 — System Architecture

| Section | Impact | Details |
|---------|--------|---------|
| §5.1 Module Structure | Extend | Add MarketplaceModule, PartnerModule, DistributionModule |
| §7.1 Database Schema | Extend | Add marketplace_, partner_, distribution_ prefixes |
| Docker Compose | Extend | Same SVC-002 backend container; three new NestJS modules loaded |

**No new containers required** — modules deploy within the existing NestJS modular monolith.

### 3.5 Document 05 — Data Model

| Section | Impact | Details |
|---------|--------|---------|
| §2 Schema Organization | Extend | Add marketplace_, partner_, distribution_ prefixes |
| Table Catalog | Extend | Add TBL-050 through TBL-058 |

**New Tables:**
- TBL-050: marketplace_inventory_types
- TBL-051: marketplace_pre_orders
- TBL-052: marketplace_readiness_scores
- TBL-053: partner_profiles
- TBL-054: partner_enrollments
- TBL-055: partner_assets
- TBL-056: distribution_centers
- TBL-057: distribution_center_stock
- TBL-058: print_partners

### 3.6 Document 06 — Configuration Dictionary

| Section | Impact | Details |
|---------|--------|---------|
| §3 Platform Settings | Extend | Add CFG-050 through CFG-059 (marketplace settings) |
| §4 Feature Flags | Extend | Add FF-020 through FF-025 (marketplace flags) |
| §5 Dictionaries | Extend | Add DICT-010 (PARTNER_TYPE), DICT-011 (INVENTORY_CATEGORY), DICT-012 (INVENTORY_STATUS) |
| DICT-003 (ASSET_TYPE) | Extend | Add 16 new asset type entries |

**New Configuration Keys:**
- CFG-050: marketplace.enabled
- CFG-051: marketplace.pre_order.enabled
- CFG-052: marketplace.pre_enrollment.enabled
- CFG-053: marketplace.readiness.auto_recommend_threshold
- CFG-054: marketplace.readiness.computation_interval_hours
- CFG-055: marketplace.readiness.min_supply_threshold
- CFG-056: marketplace.readiness.min_demand_threshold
- CFG-057: marketplace.readiness.min_coverage_threshold
- CFG-058: marketplace.distribution.low_stock_alert_threshold
- CFG-059: marketplace.print_partner.min_quality_rating

**New Feature Flags:**
- FF-020: marketplace.show_pre_order_inventory
- FF-021: marketplace.allow_partner_pre_enrollment
- FF-022: marketplace.show_readiness_dashboard
- FF-023: marketplace.analytics_enabled
- FF-024: marketplace.distribution_center_management
- FF-025: marketplace.print_partner_management

### 3.7 Document 07 — Authentication & Permissions

| Section | Impact | Details |
|---------|--------|---------|
| Role Definitions | Extend | Add "partner" role (generalized form of rider for non-helmet inventory) |
| Permission Matrix | Extend | Add marketplace resource permissions |
| API Guards | Extend | Add marketplace endpoint authorization rules |

**New Permissions:**
- marketplace.inventory_types.manage
- marketplace.pre_orders.create / read / delete
- marketplace.partner_enrollments.create / read / manage
- marketplace.analytics.read
- marketplace.distribution.manage
- marketplace.print_partners.manage
- marketplace.activate

### 3.8 Document 08 — API Specification

| Section | Impact | Details |
|---------|--------|---------|
| §1.1 Domains | Extend | Add Marketplace domain (17th endpoint domain) |
| Endpoint Catalog | Extend | Add EP-200 through EP-254 under /api/v1/marketplace/ |

**New Endpoint Groups:**
- EP-200–206: Inventory Type management (7 endpoints)
- EP-210–214: Pre-Order CRUD (5 endpoints)
- EP-220–226: Partner Enrollment (7 endpoints)
- EP-230–234: Marketplace Analytics (5 endpoints)
- EP-240–244: Distribution Centers (5 endpoints)
- EP-250–254: Print Partners (5 endpoints)

### 3.9 Document 09 — Rider App Spec

| Section | Impact | Details |
|---------|--------|---------|
| ALL | **None** | No changes — Rider App remains helmet-only for MVP |

### 3.10 Document 10 — Business Portal Spec

| Section | Impact | Details |
|---------|--------|---------|
| Navigation | Extend | Add "Marketplace" section showing available inventory types |
| Campaign Creation | Extend | Show inventory type selector (only Live types allow campaign creation) |
| Pre-Order UI | Add | New page for submitting pre-orders for Pre-Order inventory |
| Dashboard | Extend | Show pre-order status tracking |

### 3.11 Document 11 — Admin Panel Spec

| Section | Impact | Details |
|---------|--------|---------|
| Navigation | Extend | Add "Marketplace" management section |
| Inventory Management | Add | Inventory type CRUD, status management, activation workflow |
| Partner Management | Add | Partner enrollment review, verification, approval |
| Readiness Dashboard | Add | Readiness scores, gap analysis, launch recommendations |
| Distribution Management | Add | Distribution center and print partner CRUD |
| Analytics | Extend | Marketplace supply/demand intelligence dashboards |

### 3.12 Document 12 — Campaign & Assignment Spec

| Section | Impact | Details |
|---------|--------|---------|
| ALL | **None** | No changes — Campaign and Assignment lifecycles unchanged |

### 3.13 Document 13 — Financial Platform Spec

| Section | Impact | Details |
|---------|--------|---------|
| ALL | **None** | No changes — all financial flows remain unchanged for MVP |

### 3.14 Document 14 — Notifications & Timeline Spec

| Section | Impact | Details |
|---------|--------|---------|
| Notification Templates | Extend | Add marketplace notification templates |
| Timeline Events | Extend | Add marketplace events to timeline rendering |

**New Notification Templates:**
- Pre-order acknowledged
- Pre-order cancelled
- Enrollment approved/rejected
- Inventory type activated (notify pre-order businesses)
- Inventory type activated (notify pre-enrolled partners)
- Launch recommendation generated (Super Admin)
- Low stock alert (distribution center)

### 3.15 Document 15 — Deployment & Operations Spec

| Section | Impact | Details |
|---------|--------|---------|
| Module Loading | Extend | MarketplaceModule, PartnerModule, DistributionModule loaded in SVC-002 |
| Database Migrations | Extend | Add migration scripts for TBL-050 through TBL-058 |
| Health Checks | Extend | Add marketplace module health endpoints |
| Monitoring | Extend | Add marketplace metrics to observability stack |

### 3.16 Document 16 — Security & Compliance Spec

| Section | Impact | Details |
|---------|--------|---------|
| Data Classification | Extend | Add marketplace data categories |
| Access Control | Extend | Add partner role access rules |
| Audit Requirements | Extend | Marketplace operations logged to CTX-010 |
| GDPR/Data Retention | Extend | Partner enrollment data retention policies |

### 3.17 Document 17 — Testing Strategy Spec

| Section | Impact | Details |
|---------|--------|---------|
| Module Test Matrix | Extend | Add MarketplaceModule, PartnerModule, DistributionModule test requirements |
| Critical Test Scenarios | Extend | Add MVP protection validation tests |
| Integration Tests | Extend | Add marketplace workflow integration tests |
| E2E Tests | Extend | Add marketplace pre-order and enrollment flows |

### 3.18 Document 18 — MVP Scope & Glossary

| Section | Impact | Details |
|---------|--------|---------|
| MVP Scope | Extend | Clarify marketplace infrastructure is non-operational for MVP |
| Glossary | Extend | Add marketplace-specific terms |

**New Glossary Terms:**
- Advertising Inventory, Distribution Center, Inventory Plugin Contract
- Inventory Type, Launch Recommendation, Marketplace Readiness Score
- Partner (generalized), Pre-Enrollment, Pre-Order, Print Partner
- Supply Intelligence, Demand Intelligence

---


## 4. New Identifiers Introduced

### 4.1 Bounded Contexts

| ID | Name | Module |
|----|------|--------|
| CTX-015 | Marketplace Domain | MarketplaceModule |
| CTX-016 | Partner Domain | PartnerModule |
| CTX-017 | Distribution Domain | DistributionModule |

### 4.2 Aggregates

| ID | Name | Context |
|----|------|---------|
| AGG-019 | InventoryType | CTX-015 |
| AGG-020 | PreOrder | CTX-015 |
| AGG-021 | ReadinessScore | CTX-015 |
| AGG-022 | Partner | CTX-016 |
| AGG-023 | PartnerEnrollment | CTX-016 |
| AGG-024 | PartnerAsset | CTX-016 |
| AGG-025 | DistributionCenter | CTX-017 |
| AGG-026 | PrintPartner | CTX-017 |

### 4.3 Inventory Types

| ID | Code | Category | Status |
|----|------|----------|--------|
| INV-001 | helmet_advertising | Vehicle | Live |
| INV-002 | taxi_door_exterior | Vehicle | Pre-Order |
| INV-003 | taxi_rear_window | Vehicle | Pre-Order |
| INV-004 | taxi_interior_display | Vehicle | Pre-Order |
| INV-005 | rideshare_jacket | Wearable | Pre-Order |
| INV-006 | rideshare_windcheater | Wearable | Pre-Order |
| INV-007 | rideshare_tshirt | Wearable | Pre-Order |
| INV-008 | delivery_bag | Delivery | Pre-Order |
| INV-009 | delivery_box | Delivery | Pre-Order |
| INV-010 | delivery_backpack | Delivery | Pre-Order |
| INV-011 | property_hoarding | Property | Pre-Order |
| INV-012 | building_wall | Property | Pre-Order |
| INV-013 | building_terrace | Property | Pre-Order |
| INV-014 | roadside_signboard | Infrastructure | Pre-Order |
| INV-015 | bus_interior_panel | Infrastructure | Pre-Order |
| INV-016 | bus_grab_handle | Infrastructure | Pre-Order |
| INV-017 | bus_seat_branding | Infrastructure | Pre-Order |

### 4.4 Marketplace Rules

| ID Range | Category |
|----------|----------|
| MKT-001 through MKT-004 | MVP Protection Rules |
| MKT-005 through MKT-013 | Inventory Rule Engine |
| MKT-014 through MKT-022 | Dynamic Commercial Policies |
| MKT-023 through MKT-026 | Pre-Order Rules |
| MKT-027 through MKT-029 | Pre-Enrollment Rules |
| MKT-030 through MKT-039 | Marketplace Readiness |
| MKT-040 through MKT-044 | Region Expansion |

### 4.5 Plugin Contract Components

| ID Range | Components |
|----------|-----------|
| PPC-001 through PPC-015 | Inventory Plugin Contract Interface |

### 4.6 Distribution Rules

| ID | Description |
|----|-------------|
| DST-001 | Supported inventory types declaration |
| DST-002 | Real-time stock tracking |
| DST-003 | Configurable operating hours |
| DST-004 | Capacity limit enforcement |
| DST-005 | Zone assignment by Super Admin |
| DST-006 | Low stock alerting |

### 4.7 Print Partner Rules

| ID | Description |
|----|-------------|
| PPR-001 | Supported inventory type declaration |
| PPR-002 | Nearest capable partner preference |
| PPR-003 | Capacity tracking against limits |
| PPR-004 | Quality rating updates |
| PPR-005 | Zone assignment by Super Admin |

---

## 5. New Domain Events

| ID | Event Name | Source |
|----|-----------|--------|
| EVT-070 | InventoryTypeCreated | CTX-015 |
| EVT-071 | InventoryTypeActivated | CTX-015 |
| EVT-072 | InventoryTypePaused | CTX-015 |
| EVT-073 | InventoryTypeRetired | CTX-015 |
| EVT-074 | PreOrderSubmitted | CTX-015 |
| EVT-075 | PreOrderCancelled | CTX-015 |
| EVT-076 | ReadinessThresholdReached | CTX-015 |
| EVT-077 | LaunchRecommendationGenerated | CTX-015 |
| EVT-078 | PartnerPreEnrolled | CTX-016 |
| EVT-079 | PartnerDocumentsSubmitted | CTX-016 |
| EVT-080 | PartnerVerified | CTX-016 |
| EVT-081 | PartnerEnrollmentRejected | CTX-016 |
| EVT-082 | PartnerAssetRegistered | CTX-016 |
| EVT-083 | PartnerWithdrawn | CTX-016 |
| EVT-084 | DistributionCenterCreated | CTX-017 |
| EVT-085 | DistributionCenterStockUpdated | CTX-017 |
| EVT-086 | DistributionCenterLowStock | CTX-017 |
| EVT-087 | PrintPartnerRegistered | CTX-017 |
| EVT-088 | PrintOrderCreated | CTX-017 |
| EVT-089 | PrintOrderCompleted | CTX-017 |

---

## 6. New Database Tables

| ID | Table Name | Schema Prefix | Context |
|----|-----------|---------------|---------|
| TBL-050 | marketplace_inventory_types | marketplace_ | CTX-015 |
| TBL-051 | marketplace_pre_orders | marketplace_ | CTX-015 |
| TBL-052 | marketplace_readiness_scores | marketplace_ | CTX-015 |
| TBL-053 | partner_profiles | partner_ | CTX-016 |
| TBL-054 | partner_enrollments | partner_ | CTX-016 |
| TBL-055 | partner_assets | partner_ | CTX-016 |
| TBL-056 | distribution_centers | distribution_ | CTX-017 |
| TBL-057 | distribution_center_stock | distribution_ | CTX-017 |
| TBL-058 | print_partners | distribution_ | CTX-017 |

---

## 7. New API Endpoints

| Range | Namespace | Count | Purpose |
|-------|-----------|-------|---------|
| EP-200–206 | /marketplace/inventory-types | 7 | Inventory type management |
| EP-210–214 | /marketplace/pre-orders | 5 | Business pre-order operations |
| EP-220–226 | /marketplace/partner-enrollments | 7 | Partner enrollment operations |
| EP-230–234 | /marketplace/analytics | 5 | Marketplace intelligence |
| EP-240–244 | /marketplace/distribution-centers | 5 | Distribution center management |
| EP-250–254 | /marketplace/print-partners | 5 | Print partner management |

**Total:** 34 new endpoints under `/api/v1/marketplace/`

---

## 8. New Configuration

### 8.1 Settings (CFG-050 through CFG-059)

| Key | Default | Purpose |
|-----|---------|---------|
| marketplace.enabled | true | Master marketplace switch |
| marketplace.pre_order.enabled | true | Pre-order submission control |
| marketplace.pre_enrollment.enabled | true | Partner enrollment control |
| marketplace.readiness.auto_recommend_threshold | 80 | Activation recommendation threshold |
| marketplace.readiness.computation_interval_hours | 24 | Score recomputation frequency |
| marketplace.readiness.min_supply_threshold | 50 | Minimum supply for recommendation |
| marketplace.readiness.min_demand_threshold | 30 | Minimum demand for recommendation |
| marketplace.readiness.min_coverage_threshold | 40 | Minimum coverage for recommendation |
| marketplace.distribution.low_stock_alert_threshold | 10 | Low stock alert trigger |
| marketplace.print_partner.min_quality_rating | 3.0 | Minimum quality for auto-assignment |

### 8.2 Feature Flags (FF-020 through FF-025)

| Key | Default | Purpose |
|-----|---------|---------|
| marketplace.show_pre_order_inventory | true | UI visibility control |
| marketplace.allow_partner_pre_enrollment | true | Enrollment gate |
| marketplace.show_readiness_dashboard | true | Admin dashboard visibility |
| marketplace.analytics_enabled | true | Analytics collection |
| marketplace.distribution_center_management | true | Distribution CRUD |
| marketplace.print_partner_management | true | Print partner CRUD |

### 8.3 Dictionaries (DICT-010, DICT-011, DICT-012)

| ID | Code | Items |
|----|------|-------|
| DICT-010 | PARTNER_TYPE | rider, taxi_owner, property_owner, building_owner, bus_operator, delivery_rider |
| DICT-011 | INVENTORY_CATEGORY | vehicle, wearable, property, infrastructure, delivery |
| DICT-012 | INVENTORY_STATUS | live, pre_order, paused, retired |

---

## 9. Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Modular monolith maintained | New modules load within existing SVC-002 NestJS application; no new containers |
| Single database maintained | New tables in same PostgreSQL instance with prefix isolation |
| No cross-module FKs | Consistent with Document 05 §2 — UUID references without FK constraints |
| Event-driven communication | New modules emit/consume events via existing in-process event bus |
| Configuration-driven behavior | All inventory-specific rules in ConfigModule — no hardcoded behavior |
| MVP protection as guard clauses | System-level enforcement prevents accidental operational activation |

---

## 10. Migration Notes

### 10.1 Database Migration

- Migrations for TBL-050 through TBL-058 SHALL be idempotent
- No existing table modifications required
- No data migration from existing tables needed
- Seed data: INV-001 (helmet_advertising) with status "live" linking to existing helmet operations

### 10.2 Configuration Migration

- New CFG keys SHALL have defaults that maintain current behavior
- FF-020 through FF-025 default to `true` to enable marketplace infrastructure
- DICT-003 (ASSET_TYPE) extended with new entries (no removals)
- Three new dictionaries (DICT-010, DICT-011, DICT-012) seeded on deploy

### 10.3 Zero-Downtime Deployment

- All changes are additive — no breaking schema changes
- New modules can be deployed without affecting existing module behavior
- Feature flags provide runtime control over marketplace visibility
- Rollback: disable FF-020 through FF-025 to hide all marketplace features

---

*End of CHANGELOG v1.1*
