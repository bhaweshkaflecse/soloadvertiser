# Document 06 - Configuration and Dictionary

**Project:** Solo Advertiser Platform  
**Version:** 1.0  
**Status:** Approved  
**Date:** 2024-01-15  
**Classification:** Contract Specification  
**Governing Principle:** Every configurable value, feature flag, and dictionary entry used by the platform SHALL be defined in this document. No application code may introduce hardcoded values for settings specified here.

---

## 1. Purpose and Scope

This document specifies the complete registry of the Configuration Service (CTX-009, Document 03 §3.9) — all platform settings, feature flags, and system dictionary entries with their keys, default values, validation rules, data types, and propagation behavior.

### 1.1 Scope

| Dimension | Boundary |
|-----------|----------|
| Service | ConfigModule (CTX-009) per Document 04 §5.1 |
| Storage | PostgreSQL (config_entries, config_feature_flags, config_dictionary_items) |
| Cache | Redis with 5-minute TTL, invalidate-on-change (Document 04 §7.4) |
| Propagation | WebSocket real-time broadcast to connected clients (REQ-PRD-096) |
| Authority | Super Admin exclusively (REQ-PRD-097) |

### 1.2 Conventions

- **SHALL / SHALL NOT / SHOULD / MAY** follow RFC 2119 semantics.
- Configuration identifiers use prefix CFG-NNN.
- Feature flag identifiers use prefix FF-NNN.
- Dictionary identifiers use prefix DICT-NNN.
- All configuration keys use dot-notation (e.g., `platform.commission_percent`).


---

## 2. Configuration Architecture

### 2.1 Storage Layer

Configuration data SHALL be stored in PostgreSQL tables (Document 05 TBL-034, TBL-035, TBL-036, TBL-037) as the authoritative source of truth.

### 2.2 Cache Layer

Redis SHALL cache all active configuration values with the following patterns (Document 04 §7.4):

| Key Pattern | TTL | Invalidation |
|-------------|-----|-------------|
| `config:{key}` | 5 minutes | Immediate on update |
| `feature:{flagKey}` | 5 minutes | Immediate on update |
| `dictionary:{code}` | 5 minutes | Immediate on update |

### 2.3 Propagation Layer

Upon any configuration change, the system SHALL:

1. Persist the new value to PostgreSQL (TBL-034/035/036).
2. Record the change in config_change_history (TBL-037).
3. Invalidate the Redis cache entry for the affected key.
4. Emit a domain event (EVT-050, EVT-051, or EVT-052).
5. Broadcast via WebSocket to the `/config` namespace, scoped by role room (Document 04 §9.2).

### 2.4 Read Path

Application modules SHALL read configuration via the `IConfigService` interface (Document 04 §6.3):

1. Check Redis cache → if hit, return cached value.
2. On cache miss → query PostgreSQL → populate Redis → return value.
3. If PostgreSQL is unreachable → return last known cached value (graceful degradation).

---

## 3. Platform Settings

### 3.1 Pricing Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-001 | platform.business_daily_rate | 120 | integer | > 0 | pricing | Campaign, Finance | RULE-FIN-001, RULE-CMP-003 |
| CFG-002 | platform.rider_daily_rate | 100 | integer | > 0 | pricing | Finance | RULE-FIN-002 |
| CFG-003 | platform.commission_percent | 16.67 | decimal | > 0 AND < 100 | pricing | Finance | RULE-FIN-003 |
| CFG-004 | platform.currency | "NPR" | string | ISO 4217 code | pricing | All financial | RULE-CMP-010 |

### 3.2 Campaign Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-005 | campaign.minimum_days | 15 | integer | >= 1 | campaign | Campaign | RULE-CMP-001 |
| CFG-006 | campaign.minimum_riders | 100 | integer | >= 1 | campaign | Campaign | RULE-CMP-002 |
| CFG-007 | campaign.fulfillment_threshold_percent | 100 | integer | 1–100 | campaign | Campaign, Assignment | RULE-CMP-004 |
| CFG-008 | campaign.payment_deadline_hours | 72 | integer | >= 1 | campaign | Campaign | — |
| CFG-009 | campaign.auto_start_enabled | true | boolean | — | campaign | Campaign | — |

### 3.3 Verification Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-010 | verification.interval_days | 7 | integer | >= 1 | verification | Sticker | RULE-VRF-001 |
| CFG-011 | verification.grace_period_days | 2 | integer | >= 0 | verification | Sticker | — |
| CFG-012 | verification.failure_warn_threshold | 1 | integer | >= 1 | verification | Sticker | RULE-VRF-002 |
| CFG-013 | verification.failure_suspend_threshold | 2 | integer | >= 1 | verification | Sticker | RULE-VRF-003 |
| CFG-014 | verification.failure_remove_threshold | 3 | integer | >= 1 | verification | Sticker, Assignment | RULE-VRF-004 |
| CFG-015 | verification.photo_required | true | boolean | — | verification | Sticker | RULE-VRF-005 |

### 3.4 Payout Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-016 | payout.cycle_days | 15 | integer | >= 1 | payout | Finance | RULE-PAY-001 |
| CFG-017 | payout.minimum_amount | 500 | integer | > 0 | payout | Finance | RULE-PAY-002 |
| CFG-018 | payout.supported_methods | ["esewa","khalti","bank_transfer","ime_pay"] | array | Non-empty array | payout | Finance | RULE-PAY-003 |
| CFG-019 | payout.auto_batch_generation | true | boolean | — | payout | Finance | — |
| CFG-020 | payout.batch_approval_required | true | boolean | — | payout | Finance | RULE-PAY-004 |

### 3.5 Rider Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-021 | rider.max_concurrent_per_asset | 1 | integer | >= 1 | rider | Assignment | RULE-RDR-003 |
| CFG-022 | rider.reliability_weights | {"verification":30,"attendance":25,"activity":20,"completion":15,"response":10} | json | Values sum to 100 | rider | Rider | RULE-RDR-006 |
| CFG-023 | rider.required_documents | ["citizenship_or_license","vehicle_registration","profile_photo","helmet_photo"] | array | Non-empty array | rider | Rider | RULE-RDR-002 |
| CFG-024 | rider.initial_reliability_score | 50 | integer | 0–100 | rider | Rider | — |

### 3.6 Business Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-025 | business.required_documents | ["pan_certificate","business_registration","representative_id"] | array | Non-empty array | business | Business | RULE-BIZ-002 |
| CFG-026 | business.verification_sla_hours | 48 | integer | >= 1 | business | Business | — |

### 3.7 Document Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-027 | documents.expiry_reminder_days | [30, 15, 7] | array | Non-empty array of positive integers | documents | Notification, Rider, Business | RULE-DOC-001 |
| CFG-028 | documents.allowed_types | ["image/jpeg","image/png","application/pdf"] | array | Non-empty array of MIME types | documents | Media | RULE-DOC-005 |
| CFG-029 | documents.max_size_mb | 10 | integer | > 0 | documents | Media | RULE-DOC-005 |
| CFG-030 | documents.auto_expire_enabled | true | boolean | — | documents | Rider, Business | RULE-DOC-003 |

### 3.8 Zone Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-031 | zones.active_region | "kathmandu_valley" | string | Non-empty | zones | All zone-aware | RULE-ZON-003 |
| CFG-032 | zones.matching_required | true | boolean | — | zones | Assignment | RULE-ASN-001 |

### 3.9 Notification Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-033 | notifications.channels | ["push","in_app"] | array | Non-empty array | notifications | Notification | RULE-NTF-002 |
| CFG-034 | notifications.realtime_enabled | true | boolean | — | notifications | Notification | RULE-NTF-003 |
| CFG-035 | notifications.max_retry_attempts | 3 | integer | >= 1 | notifications | Notification | — |
| CFG-036 | notifications.push_provider | "firebase" | string | Non-empty | notifications | Notification | — |

### 3.10 System Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-037 | auth.max_failed_attempts | 5 | integer | >= 1 | system | Identity | RULE-SEC-001 |
| CFG-038 | auth.lockout_duration_minutes | 30 | integer | >= 1 | system | Identity | RULE-SEC-001 |
| CFG-039 | auth.access_token_expiry_minutes | 15 | integer | >= 1 | system | Identity | REQ-PRD-213 |
| CFG-040 | auth.refresh_token_expiry_days | 7 | integer | >= 1 | system | Identity | REQ-PRD-214 |
| CFG-041 | auth.otp_expiry_minutes | 5 | integer | >= 1 | system | Identity | — |
| CFG-042 | auth.otp_length | 6 | integer | 4–8 | system | Identity | — |
| CFG-043 | system.maintenance_mode | false | boolean | — | system | All | — |
| CFG-044 | system.log_level | "info" | string | One of: debug, info, warn, error | system | All | — |
| CFG-045 | system.pagination_default_size | 20 | integer | 1–100 | system | All | — |
| CFG-046 | system.pagination_max_size | 100 | integer | >= pagination_default_size | system | All | — |

### 3.11 Sticker Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-047 | sticker.circular_diameter_cm | 8 | decimal | > 0 | sticker | Sticker | — |
| CFG-048 | sticker.rectangular_dimensions_cm | "10x6" | string | Pattern: NNxNN | sticker | Sticker | — |
| CFG-049 | sticker.supported_shapes | ["circular","rectangular"] | array | Non-empty array | sticker | Sticker | — |

### 3.12 Payment Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-050 | payment.supported_methods | ["esewa","khalti","bank_transfer","ime_pay"] | array | Non-empty array | payment | Finance, Campaign | RULE-PAY-006 |
| CFG-051 | payment.manual_verification_required | true | boolean | — | payment | Finance | RULE-PAY-007 |

### 3.13 Asset Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-052 | asset.supported_types | ["helmet"] | array | Non-empty array | asset | Sticker, Assignment, Campaign | RULE-STK-006 |

### 3.14 Support Configuration

| ID | Key | Default | Type | Validation | Category | Affected Modules | Rule |
|----|-----|---------|------|-----------|----------|-----------------|------|
| CFG-053 | support.first_response_sla_hours | 4 | integer | >= 1 | support | Support | REQ-PRD-120 |
| CFG-054 | support.resolution_sla_hours | 48 | integer | >= 1 | support | Support | REQ-PRD-120 |
| CFG-055 | support.auto_close_days | 7 | integer | >= 1 | support | Support | — |


---

## 4. Feature Flags

All feature flags SHALL default to their specified state. Super Admin SHALL be the only role authorized to toggle flags (REQ-PRD-097).

| ID | Key | Default | Description | Affected Modules |
|----|-----|---------|-------------|-----------------|
| FF-001 | feature.rider_registration | true | Enable/disable new rider registration | Identity, Rider |
| FF-002 | feature.business_registration | true | Enable/disable new business registration | Identity, Business |
| FF-003 | feature.campaign_creation | true | Enable/disable campaign creation | Campaign |
| FF-004 | feature.payout_processing | true | Enable/disable payout batch processing | Finance |
| FF-005 | feature.verification_reminders | true | Enable/disable verification reminder notifications | Sticker, Notification |
| FF-006 | feature.document_expiry_checks | true | Enable/disable document expiry automation | Rider, Business, Notification |
| FF-007 | feature.realtime_notifications | true | Enable/disable WebSocket notification delivery | Notification |
| FF-008 | feature.analytics_export | true | Enable/disable report export functionality | Analytics |
| FF-009 | feature.support_tickets | true | Enable/disable support ticket creation | Support |
| FF-010 | feature.reliability_scoring | true | Enable/disable rider reliability score calculation | Rider |
| FF-011 | feature.swagger_docs | false | Enable Swagger UI in production | System |
| FF-012 | feature.maintenance_banner | false | Show maintenance banner to all users | System |
| FF-013 | feature.debug_logging | false | Enable debug-level logging in production | System |
| FF-014 | feature.new_sticker_shapes | false | Enable non-circular sticker shapes | Sticker |
| FF-015 | feature.bulk_assignment | true | Enable bulk rider assignment operations | Assignment |
| FF-016 | feature.wallet_manual_adjustment | true | Enable manual wallet balance adjustments by Finance Staff | Finance |
| FF-017 | feature.campaign_pause | true | Enable campaign pause functionality | Campaign |
| FF-018 | feature.rider_self_withdrawal | true | Enable rider self-withdrawal from campaigns | Assignment |
| FF-019 | feature.multi_zone_assignment | false | Enable riders to be assigned across multiple zones | Assignment |
| FF-020 | feature.escrow_auto_release | true | Enable automatic daily escrow release | Finance |

---

## 5. System Dictionary

All enumeration-like values used in the platform SHALL be dictionary-driven. No application code SHALL hardcode enumeration values; all SHALL be resolved from the dictionary at runtime.

### 5.1 DICT-001: PAYMENT_METHOD

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| esewa | eSewa | इसेवा | 1 | true |
| khalti | Khalti | खल्ती | 2 | true |
| bank_transfer | Bank Transfer | बैंक ट्रान्सफर | 3 | true |
| ime_pay | IME Pay | आईएमई पे | 4 | true |

### 5.2 DICT-002: ASSET_TYPE

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| helmet | Helmet | हेल्मेट | 1 | true |
| backpack | Backpack | ब्यागप्याक | 2 | false |
| jacket | Jacket | ज्याकेट | 3 | false |

### 5.3 DICT-003: STICKER_SHAPE

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| circular | Circular | गोलाकार | 1 | true |
| rectangular | Rectangular | आयताकार | 2 | true |

### 5.4 DICT-004: CAMPAIGN_CATEGORY

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| food_beverage | Food & Beverage | खाना तथा पेय | 1 | true |
| education | Education | शिक्षा | 2 | true |
| technology | Technology | प्रविधि | 3 | true |
| healthcare | Healthcare | स्वास्थ्य | 4 | true |
| finance_banking | Finance & Banking | वित्त तथा बैंकिङ | 5 | true |
| retail | Retail | खुद्रा | 6 | true |
| entertainment | Entertainment | मनोरञ्जन | 7 | true |
| real_estate | Real Estate | अचल सम्पत्ति | 8 | true |
| automotive | Automotive | अटोमोटिभ | 9 | true |
| other | Other | अन्य | 10 | true |

### 5.5 DICT-005: DOCUMENT_TYPE

| Item Key | Label (EN) | Label (NE) | Sort Order | Context | Active |
|----------|-----------|-----------|-----------|---------|--------|
| citizenship_or_license | Citizenship/License | नागरिकता/लाइसेन्स | 1 | rider | true |
| vehicle_registration | Vehicle Registration | सवारी दर्ता | 2 | rider | true |
| profile_photo | Profile Photo | प्रोफाइल फोटो | 3 | rider | true |
| helmet_photo | Helmet Photo | हेल्मेट फोटो | 4 | rider | true |
| pan_certificate | PAN/VAT Certificate | प्यान/भ्याट प्रमाणपत्र | 5 | business | true |
| business_registration | Business Registration | व्यापार दर्ता | 6 | business | true |
| representative_id | Representative ID | प्रतिनिधि परिचयपत्र | 7 | business | true |

### 5.6 DICT-006: REJECTION_REASON

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| blurry_image | Blurry/Unclear Image | अस्पष्ट तस्बिर | 1 | true |
| expired_document | Expired Document | म्याद सकिएको कागजात | 2 | true |
| mismatch_info | Information Mismatch | जानकारी बेमेल | 3 | true |
| incomplete_document | Incomplete Document | अपूर्ण कागजात | 4 | true |
| fraudulent | Suspected Fraudulent | शंकास्पद जालसाजी | 5 | true |
| wrong_document_type | Wrong Document Type | गलत कागजात प्रकार | 6 | true |
| other | Other | अन्य | 7 | true |

### 5.7 DICT-007: TICKET_CATEGORY

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| technical | Technical Issue | प्राविधिक समस्या | 1 | true |
| financial | Financial Issue | आर्थिक समस्या | 2 | true |
| campaign | Campaign Issue | अभियान समस्या | 3 | true |
| verification | Verification Issue | प्रमाणीकरण समस्या | 4 | true |
| general | General Inquiry | सामान्य जिज्ञासा | 5 | true |

### 5.8 DICT-008: RIDE_SHARING_PLATFORM

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| pathao | Pathao | पाठाओ | 1 | true |
| indrive | inDrive | इनड्राइभ | 2 | true |
| tootle | Tootle | टुटल | 3 | true |
| other | Other | अन्य | 4 | true |

### 5.9 DICT-009: SUSPENSION_REASON

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| verification_failure | Verification Failures | प्रमाणीकरण असफलता | 1 | true |
| policy_violation | Policy Violation | नीति उल्लङ्घन | 2 | true |
| document_issue | Document Issue | कागजात समस्या | 3 | true |
| complaint | Multiple Complaints | बहु गुनासो | 4 | true |
| fraud | Fraud/Misrepresentation | जालसाजी | 5 | true |
| inactivity | Prolonged Inactivity | लामो निष्क्रियता | 6 | true |
| other | Other | अन्य | 7 | true |

### 5.10 DICT-010: RIDER_STATUS

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| pre_registered | Pre-Registered | पूर्व-दर्ता | 1 | true |
| documents_pending | Documents Pending | कागजात पेन्डिङ | 2 | true |
| verification_pending | Verification Pending | प्रमाणीकरण पेन्डिङ | 3 | true |
| approved | Approved | स्वीकृत | 4 | true |
| available | Available | उपलब्ध | 5 | true |
| assigned | Assigned | तोकिएको | 6 | true |
| campaign_active | Campaign Active | अभियान सक्रिय | 7 | true |
| unavailable | Unavailable | अनुपलब्ध | 8 | true |
| suspended | Suspended | निलम्बित | 9 | true |

### 5.11 DICT-011: BUSINESS_STATUS

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| registered | Registered | दर्ता भएको | 1 | true |
| documents_pending | Documents Pending | कागजात पेन्डिङ | 2 | true |
| under_review | Under Review | समीक्षामा | 3 | true |
| verified | Verified | प्रमाणित | 4 | true |
| active | Active | सक्रिय | 5 | true |
| suspended | Suspended | निलम्बित | 6 | true |
| blacklisted | Blacklisted | कालोसूचीमा | 7 | true |

### 5.12 DICT-012: CAMPAIGN_STATUS

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| draft | Draft | ड्राफ्ट | 1 | true |
| pending_payment | Pending Payment | भुक्तानी पेन्डिङ | 2 | true |
| payment_submitted | Payment Submitted | भुक्तानी पेश | 3 | true |
| payment_verified | Payment Verified | भुक्तानी प्रमाणित | 4 | true |
| recruiting_riders | Recruiting Riders | राइडर भर्ना | 5 | true |
| ready | Ready | तयार | 6 | true |
| running | Running | चलिरहेको | 7 | true |
| completed | Completed | सम्पन्न | 8 | true |
| paused | Paused | रोकिएको | 9 | true |
| cancelled | Cancelled | रद्द | 10 | true |

### 5.13 DICT-013: ASSIGNMENT_STATUS

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| suggested | Suggested | सुझाव गरिएको | 1 | true |
| assigned | Assigned | तोकिएको | 2 | true |
| sticker_pending | Sticker Pending | स्टिकर पेन्डिङ | 3 | true |
| distributed | Distributed | वितरित | 4 | true |
| installed | Installed | स्थापित | 5 | true |
| active | Active | सक्रिय | 6 | true |
| completed | Completed | सम्पन्न | 7 | true |
| removed | Removed | हटाइएको | 8 | true |

### 5.14 DICT-014: DOCUMENT_STATUS

| Item Key | Label (EN) | Label (NE) | Sort Order | Active |
|----------|-----------|-----------|-----------|--------|
| uploaded | Uploaded | अपलोड भएको | 1 | true |
| under_review | Under Review | समीक्षामा | 2 | true |
| approved | Approved | स्वीकृत | 3 | true |
| rejected | Rejected | अस्वीकृत | 4 | true |
| expired | Expired | म्याद सकिएको | 5 | true |
| replacement_required | Replacement Required | प्रतिस्थापन आवश्यक | 6 | true |


---

## 6. Propagation Mechanism

### 6.1 Change Flow

When a Super Admin modifies any configuration entry, feature flag, or dictionary item:

```
Super Admin → API (PATCH /api/v1/config/settings/{key})
    │
    ▼
ConfigModule.updateSetting()
    │
    ├── 1. Validate new value against validation_rules
    ├── 2. Persist to PostgreSQL (UPDATE config_entries SET value = ...)
    ├── 3. Record change in config_change_history (old_value, new_value, changed_by)
    ├── 4. Invalidate Redis cache (DEL config:{key})
    ├── 5. Emit domain event (EVT-050 SettingsUpdated)
    └── 6. Broadcast via Socket.IO to /config namespace
```

### 6.2 WebSocket Broadcast Format

```json
{
  "event": "config.updated",
  "payload": {
    "type": "setting",
    "key": "platform.business_daily_rate",
    "value": 130,
    "previousValue": 120,
    "updatedBy": "uuid",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### 6.3 Client Handling

Connected clients SHALL:
1. Receive the WebSocket event and update their local configuration state.
2. If a received config value affects active UI elements, the UI SHALL reflect the change without requiring page reload.
3. Disconnected clients SHALL fetch fresh configuration via REST on reconnection.

### 6.4 Propagation Guarantees

- Connected clients SHALL receive updates within 5 seconds (per RULE-NTF-003 latency target).
- If WebSocket delivery fails, the next REST API call SHALL return the current value from cache/DB.
- Configuration changes SHALL NOT require application restart.

---

## 7. Governance

### 7.1 Access Control

| Role | Settings | Feature Flags | Dictionary | Change History |
|------|----------|--------------|-----------|---------------|
| Rider | Read (own-affecting) | — | Read | — |
| Business | Read (own-affecting) | — | Read | — |
| Operations Staff | Read (all) | Read | Read | Read |
| Finance Staff | Read (all) | Read | Read | Read |
| Admin | Read (all) | Read | Read (all) | Read |
| Super Admin | Read/Write (all) | Read/Write | Read/Write | Read |

### 7.2 Change Audit Requirements

Every configuration change SHALL generate:
1. A `config_change_history` record (TBL-037) with old/new values and actor.
2. An `audit_entries` record (TBL-038) via EVT-050/051/052 consumption.
3. A timeline entry for platform-level events.

### 7.3 Validation Rules

All configuration updates SHALL be validated BEFORE persistence:

| Data Type | Validation |
|-----------|-----------|
| integer | Type check, min/max bounds, non-null |
| decimal | Type check, min/max bounds, precision |
| string | Type check, max length, pattern match (if defined) |
| boolean | Type check, strict true/false |
| array | Type check, non-empty (if required), element type validation |
| json | Type check, schema validation against validation_rules JSONB |

### 7.4 Rollback Capability

Configuration changes SHALL be reversible:
1. Super Admin MAY revert to any previous value via the change history UI.
2. Reverting SHALL follow the same change flow (validate → persist → invalidate → broadcast).
3. The revert operation SHALL itself be recorded in change history.

---

## 8. API Impact

The Configuration Service SHALL expose the following REST endpoints (detailed in Document 08):

### 8.1 Settings Endpoints

| Method | Path | Description | Auth | Permission |
|--------|------|-------------|------|-----------|
| GET | /api/v1/config/settings | List all settings (filtered by role visibility) | Required | All authenticated |
| GET | /api/v1/config/settings/:key | Get single setting | Required | All authenticated |
| PATCH | /api/v1/config/settings/:key | Update setting value | Required | Super Admin only |
| GET | /api/v1/config/settings/:key/history | Get change history for key | Required | Admin, Super Admin |

### 8.2 Feature Flags Endpoints

| Method | Path | Description | Auth | Permission |
|--------|------|-------------|------|-----------|
| GET | /api/v1/config/flags | List all feature flags | Required | Staff roles |
| GET | /api/v1/config/flags/:key | Get single flag | Required | Staff roles |
| PATCH | /api/v1/config/flags/:key | Toggle flag | Required | Super Admin only |

### 8.3 Dictionary Endpoints

| Method | Path | Description | Auth | Permission |
|--------|------|-------------|------|-----------|
| GET | /api/v1/config/dictionary | List all dictionaries | Required | All authenticated |
| GET | /api/v1/config/dictionary/:code | Get dictionary items | Required | All authenticated |
| POST | /api/v1/config/dictionary/:code/items | Add dictionary item | Required | Super Admin only |
| PATCH | /api/v1/config/dictionary/:code/items/:key | Update dictionary item | Required | Super Admin only |
| DELETE | /api/v1/config/dictionary/:code/items/:key | Deactivate dictionary item | Required | Super Admin only |

---

## 9. Traceability

### 9.1 Configuration to Rules

| Config Key | Business Rule | Document 02 Reference |
|-----------|--------------|----------------------|
| platform.business_daily_rate | RULE-FIN-001, RULE-CMP-003 | §3.8, §3.3 |
| platform.rider_daily_rate | RULE-FIN-002 | §3.8 |
| campaign.minimum_days | RULE-CMP-001 | §3.3 |
| campaign.minimum_riders | RULE-CMP-002 | §3.3 |
| campaign.fulfillment_threshold_percent | RULE-CMP-004 | §3.3 |
| verification.interval_days | RULE-VRF-001 | §3.7 |
| verification.failure_warn_threshold | RULE-VRF-002 | §3.7 |
| verification.failure_suspend_threshold | RULE-VRF-003 | §3.7 |
| verification.failure_remove_threshold | RULE-VRF-004 | §3.7 |
| payout.cycle_days | RULE-PAY-001 | §3.9 |
| payout.minimum_amount | RULE-PAY-002 | §3.9 |
| payout.supported_methods | RULE-PAY-003 | §3.9 |
| rider.max_concurrent_per_asset | RULE-RDR-003 | §3.2 |
| rider.reliability_weights | RULE-RDR-006 | §3.2 |
| rider.required_documents | RULE-RDR-002 | §3.2 |
| business.required_documents | RULE-BIZ-002 | §3.1 |
| documents.expiry_reminder_days | RULE-DOC-001 | §3.11 |
| auth.max_failed_attempts | RULE-SEC-001 | §3.13 |
| auth.lockout_duration_minutes | RULE-SEC-001 | §3.13 |
| asset.supported_types | RULE-STK-006 | §3.5 |
| payment.supported_methods | RULE-PAY-006 | §3.9 |
| zones.active_region | RULE-ZON-003 | §3.12 |

### 9.2 Configuration to Requirements

| Requirement | Config IDs |
|-------------|-----------|
| REQ-PRD-093 (Centralized config) | All CFG-* entries |
| REQ-PRD-094 (Feature flags) | All FF-* entries |
| REQ-PRD-095 (Dictionary service) | All DICT-* entries |
| REQ-PRD-096 (Real-time propagation) | §6 Propagation Mechanism |
| REQ-PRD-097 (Super Admin authority) | §7.1 Access Control |
| REQ-PRD-098 (Change history) | §7.2, TBL-037 |

### 9.3 Document Statistics

| Metric | Value |
|--------|-------|
| Configuration entries (CFG-*) | 55 |
| Feature flags (FF-*) | 20 |
| Dictionary codes (DICT-*) | 14 |
| Total dictionary items | 85 |
| Configuration categories | 14 |
| Business rules with config backing | 22 |

---

*End of Document 06 - Configuration and Dictionary*
