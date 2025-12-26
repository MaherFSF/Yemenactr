# YETO Platform - Requirements Index

This document contains all atomic requirements parsed from the Master Build Prompt, each with a stable ID for traceability.

---

## Priority Levels

| Priority | Description |
|----------|-------------|
| **P0** | Critical - Must be implemented for MVP |
| **P1** | High - Required for production readiness |
| **P2** | Medium - Important but can be deferred |

---

## Core Platform Requirements

### REQ-0001: Bilingual Support (Arabic-First)
- **Priority**: P0
- **Section**: BILINGUAL RULE
- **Description**: Platform must be Arabic-first with RTL default, English LTR available
- **Acceptance Criteria**: All pages render correctly in both AR and EN with proper text direction

### REQ-0002: Evidence-Only Rule
- **Priority**: P0
- **Section**: EVIDENCE RULE
- **Description**: No hallucination, no fabricated facts. Every KPI, chart, statement must link to Evidence Pack
- **Acceptance Criteria**: All displayed data has traceable evidence pack with source attribution

### REQ-0003: No PII / Safety
- **Priority**: P0
- **Section**: SAFETY / DO-NO-HARM
- **Description**: No PII, no content enabling violence, sanctions evasion, fraud, or manipulation
- **Acceptance Criteria**: Content review process in place, safety filters active

### REQ-0004: Domain Configuration
- **Priority**: P1
- **Section**: DOMAIN & CONTACT
- **Description**: Production domain: https://yeto.causewaygrp.com, Contact: yeto@causewaygrp.com
- **Acceptance Criteria**: Domain configured, no physical addresses displayed

### REQ-0005: Numeric Integrity in Translation
- **Priority**: P0
- **Section**: NUMERIC INTEGRITY RULE
- **Description**: All numeric values must be locked during translation, validated post-translation
- **Acceptance Criteria**: Translation QA validates numeric tokens match exactly

---

## Design & UX Requirements

### REQ-0010: Mockup Parity
- **Priority**: P0
- **Section**: MOCKUPS & DESIGN CONTRACT
- **Description**: UI must match provided mockups exactly (layout, spacing, typography, interactions)
- **Acceptance Criteria**: Visual comparison passes for all mockup-mapped pages

### REQ-0011: Brand Style Tokens
- **Priority**: P1
- **Section**: BRAND / STYLE TOKENS
- **Description**: Use specified color palette (Navy #103050, Green #107040, Gold #C0A030)
- **Acceptance Criteria**: Design tokens implemented in CSS variables

### REQ-0012: KPI Cards with Evidence
- **Priority**: P0
- **Section**: REQUIRED UI PATTERNS
- **Description**: KPI cards must show value, delta, sparkline, and "Evidence" micro-link
- **Acceptance Criteria**: All KPI cards have clickable evidence link

### REQ-0013: Filter Panels
- **Priority**: P1
- **Section**: REQUIRED UI PATTERNS
- **Description**: Filter panels for time, geography, category, source, confidence, regime tag
- **Acceptance Criteria**: Filters work correctly and persist state

### REQ-0014: Chart Export Controls
- **Priority**: P1
- **Section**: REQUIRED UI PATTERNS
- **Description**: Charts must have export controls and "Show me how you know this" button
- **Acceptance Criteria**: Charts exportable to PNG/CSV, evidence modal opens

### REQ-0015: Accessibility (WCAG 2.2 AA)
- **Priority**: P1
- **Section**: ACCESSIBILITY & PERFORMANCE
- **Description**: Keyboard navigation, ARIA labels, responsive layouts
- **Acceptance Criteria**: Accessibility audit passes

### REQ-0016: Image Licensing
- **Priority**: P1
- **Section**: IMAGE LICENSING & QUALITY
- **Description**: Only use images with compatible licenses, store attribution
- **Acceptance Criteria**: Image registry with licensing metadata

---

## Information Architecture Requirements

### REQ-0020: Public Routes
- **Priority**: P0
- **Section**: PUBLIC (NO LOGIN)
- **Description**: Landing, about, dashboard (public), data, research, sectors, timeline, entities, glossary, methodology, legal pages
- **Acceptance Criteria**: All public routes accessible without login

### REQ-0021: Authenticated App Routes
- **Priority**: P0
- **Section**: AUTHENTICATED APP
- **Description**: Subscriber home, dashboards, data, research, scenario-simulator, alerts, reports, datasets, entities, timeline, compliance
- **Acceptance Criteria**: Protected routes require authentication

### REQ-0022: Partner Portal Routes
- **Priority**: P1
- **Section**: PARTNER PORTAL
- **Description**: Partner login, upload, submissions, guidelines, audit
- **Acceptance Criteria**: Partner workflows functional

### REQ-0023: Admin Console Routes
- **Priority**: P0
- **Section**: ADMIN CONSOLE
- **Description**: Operations dashboard, sources, ingestion, quality, documents, content, publications, corrections, users, security, models
- **Acceptance Criteria**: Admin can manage all platform aspects

---

## Data Governance Requirements

### REQ-0030: Provenance Ledger
- **Priority**: P0
- **Section**: PROVENANCE LEDGER
- **Description**: W3C PROV-aligned provenance tracking for all data
- **Acceptance Criteria**: Every data point has provenance record

### REQ-0031: Evidence Packs
- **Priority**: P0
- **Section**: EVIDENCE PACKS
- **Description**: Every chart/KPI/statement links to evidence pack with source, URL, dates, confidence
- **Acceptance Criteria**: Evidence pack modal shows complete provenance

### REQ-0032: Contradiction Detector
- **Priority**: P1
- **Section**: CONTRADICTION DETECTOR
- **Description**: Detect and display conflicts between sources, never average
- **Acceptance Criteria**: Disagreement mode toggle shows conflicting data

### REQ-0033: Vintages / Time Travel
- **Priority**: P1
- **Section**: VINTAGES & "WHAT WAS KNOWN WHEN"
- **Description**: Every update creates new version, UI toggle for "View as of date X"
- **Acceptance Criteria**: Historical views accessible

### REQ-0034: Corrections Workflow
- **Priority**: P1
- **Section**: CORRECTIONS WORKFLOW
- **Description**: "Report an issue" creates ticket, admin review, public corrections log
- **Acceptance Criteria**: Corrections visible at /corrections

---

## Data Model Requirements

### REQ-0040: Core Tables
- **Priority**: P0
- **Section**: DATA MODEL
- **Description**: sources, licenses, source_runs, provenance_ledger tables
- **Acceptance Criteria**: Schema matches specification

### REQ-0041: Document Tables
- **Priority**: P0
- **Section**: DATA MODEL
- **Description**: documents, document_versions, document_text_chunks, translations tables
- **Acceptance Criteria**: Document pipeline uses correct tables

### REQ-0042: Indicator Tables
- **Priority**: P0
- **Section**: DATA MODEL
- **Description**: indicators, indicator_series, series_versions, observations, contradictions tables
- **Acceptance Criteria**: Time series data stored correctly

### REQ-0043: Entity Tables
- **Priority**: P0
- **Section**: DATA MODEL
- **Description**: entities, entity_relationships, projects, funding_flows tables
- **Acceptance Criteria**: Entity profiles populated

### REQ-0044: User Tables
- **Priority**: P0
- **Section**: DATA MODEL
- **Description**: users, orgs, entitlements, audit_logs tables
- **Acceptance Criteria**: Auth and RBAC functional

---

## Ingestion Requirements

### REQ-0050: Connector Interface
- **Priority**: P0
- **Section**: PIPELINE ARCHITECTURE
- **Description**: discover(), fetch_raw(), normalize(), validate(), load(), index(), publish()
- **Acceptance Criteria**: All connectors implement interface

### REQ-0051: Backfill 2010-Present
- **Priority**: P1
- **Section**: BACKFILL STRATEGY
- **Description**: Historical data from 2010 to present where available
- **Acceptance Criteria**: At least one source backfilled

### REQ-0052: QA Validation
- **Priority**: P0
- **Section**: QA / VALIDATION
- **Description**: Schema validation, units normalization, continuity checks, outlier flagging
- **Acceptance Criteria**: QA reports generated for each ingestion

### REQ-0053: Data Gap System
- **Priority**: P1
- **Section**: DATA GAP SYSTEM
- **Description**: Create data_gap records when data missing, show "Not available yet"
- **Acceptance Criteria**: Gap records visible in admin and public UI

---

## Data Source Requirements

### REQ-0060: World Bank Connector
- **Priority**: P0
- **Section**: CORE OPEN/APIs
- **Description**: Working connector for World Bank Indicators API
- **Acceptance Criteria**: Yemen indicators fetched and stored

### REQ-0061: OCHA FTS Connector
- **Priority**: P0
- **Section**: CORE OPEN/APIs
- **Description**: Working connector for OCHA FTS funding flows
- **Acceptance Criteria**: Humanitarian funding data available

### REQ-0062: HDX HAPI Connector
- **Priority**: P1
- **Section**: CORE OPEN/APIs
- **Description**: Connector for Humanitarian Data Exchange
- **Acceptance Criteria**: HDX datasets accessible

### REQ-0063: ReliefWeb Connector
- **Priority**: P1
- **Section**: CORE OPEN/APIs
- **Description**: Connector for ReliefWeb documents
- **Acceptance Criteria**: Reports indexed and searchable

### REQ-0064: Sanctions Lists
- **Priority**: P1
- **Section**: SANCTIONS LISTS
- **Description**: Ingest UN, US OFAC, EU, UK sanctions lists (informational only)
- **Acceptance Criteria**: Sanctions data displayed with disclaimers

---

## AI Assistant Requirements

### REQ-0070: RAG-Only Rule
- **Priority**: P0
- **Section**: RAG-ONLY RULE
- **Description**: AI answers only from retrieved evidence, no external knowledge
- **Acceptance Criteria**: All AI responses cite evidence packs

### REQ-0071: Answer Template
- **Priority**: P0
- **Section**: REQUIRED ANSWER TEMPLATE
- **Description**: Answer, key takeaways, evidence, what changed, why it matters, drivers, options, uncertainty, next questions
- **Acceptance Criteria**: AI responses follow template structure

### REQ-0072: Show Me How You Know This
- **Priority**: P0
- **Section**: "SHOW ME HOW YOU KNOW THIS"
- **Description**: Evidence pack modal on every KPI, chart, alert, AI answer
- **Acceptance Criteria**: Modal opens with full provenance

### REQ-0073: Safety Refusals
- **Priority**: P0
- **Section**: SAFETY REFUSALS
- **Description**: Refuse PII requests, sanctions evasion, targeted harm
- **Acceptance Criteria**: Safety filters active and tested

---

## Commercial Entities Requirements

### REQ-0080: HSA Group Profile
- **Priority**: P0
- **Section**: MANDATORY COMMERCIAL COVERAGE
- **Description**: Verified entity profile for Hayel Saeed Anam & Co. and subsidiaries
- **Acceptance Criteria**: HSA profile with evidenced facts only

### REQ-0081: Major Commercial Entities
- **Priority**: P1
- **Section**: MANDATORY COMMERCIAL COVERAGE
- **Description**: Profiles for major banks, telecoms, ports/logistics, large employers
- **Acceptance Criteria**: At least 10 verified entity profiles

---

## Publications Requirements

### REQ-0090: Auto-Draft Publications
- **Priority**: P1
- **Section**: PUBLICATIONS ENGINE
- **Description**: Daily, Weekly, Monthly, Quarterly, Annual publications auto-generated
- **Acceptance Criteria**: Draft publications created on schedule

### REQ-0091: Approval Workflow
- **Priority**: P1
- **Section**: PUBLICATIONS ENGINE
- **Description**: Auto-draft → admin review → approve → publish
- **Acceptance Criteria**: Workflow functional in admin

### REQ-0092: Bilingual Output
- **Priority**: P0
- **Section**: PUBLICATIONS ENGINE
- **Description**: All publications in Arabic and English
- **Acceptance Criteria**: Both language versions generated

---

## Subscription Requirements

### REQ-0100: Subscription Tiers
- **Priority**: P1
- **Section**: SUBSCRIPTIONS, RBAC, BILLING
- **Description**: Public, Registered, Pro, Institutional, Partner, Admin tiers
- **Acceptance Criteria**: Tier entitlements enforced

### REQ-0101: RBAC/ABAC
- **Priority**: P0
- **Section**: SUBSCRIPTIONS, RBAC, BILLING
- **Description**: Route-level and API-level access control
- **Acceptance Criteria**: Unauthorized access blocked

---

## Testing Requirements

### REQ-0110: Unit Tests
- **Priority**: P0
- **Section**: TESTING
- **Description**: Backend pytest, frontend component tests
- **Acceptance Criteria**: Test coverage > 70%

### REQ-0111: E2E Tests
- **Priority**: P1
- **Section**: TESTING
- **Description**: Playwright E2E for core flows
- **Acceptance Criteria**: All critical paths tested

### REQ-0112: Data QA Tests
- **Priority**: P0
- **Section**: TESTING
- **Description**: Schema/range checks, continuity, provenance completeness
- **Acceptance Criteria**: QA tests run on every ingestion

---

## Deployment Requirements

### REQ-0120: Docker Compose
- **Priority**: P0
- **Section**: DEPLOYMENT ARTIFACTS
- **Description**: Local and staging deployment via Docker Compose
- **Acceptance Criteria**: `docker-compose up` works

### REQ-0121: Bootstrap Scripts
- **Priority**: P1
- **Section**: DEPLOYMENT ARTIFACTS
- **Description**: bootstrap_dev.sh, bootstrap_staging.sh, bootstrap_prod.sh
- **Acceptance Criteria**: Scripts documented and tested

### REQ-0122: Runbooks
- **Priority**: P1
- **Section**: DEPLOYMENT ARTIFACTS
- **Description**: Deployment, Security, Disaster Recovery, Backup/Restore runbooks
- **Acceptance Criteria**: Runbooks complete and tested

---

## Documentation Requirements

### REQ-0130: Admin Manual
- **Priority**: P1
- **Section**: DOCUMENTATION
- **Description**: Complete admin operations guide
- **Acceptance Criteria**: Admin can perform all tasks from manual

### REQ-0131: API Reference
- **Priority**: P1
- **Section**: DOCUMENTATION
- **Description**: OpenAPI documentation for all endpoints
- **Acceptance Criteria**: API docs generated and accurate

### REQ-0132: Final Self-Audit
- **Priority**: P0
- **Section**: DEFINITION OF DONE
- **Description**: Checklist with links to evidence for all requirements
- **Acceptance Criteria**: All items verified and documented

---

*Total Requirements: 50+*
*Last updated: December 2024*
