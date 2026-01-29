# YETO Platform - Work Plan

## Overview

This document outlines the phase-by-phase implementation plan for the YETO (Yemen Economic Transparency Observatory) platform, following the execution sequence defined in the Master Build Prompt.

---

## Phase 0: Control Pack First Commit ✅

### Deliverables
- [x] `/docs/0_START_HERE.md` - Operator guide
- [x] `/docs/WORKPLAN.md` - This document
- [x] `/docs/REQ_INDEX.md` - Requirements index
- [x] `/docs/RTM.csv` - Requirements Traceability Matrix
- [x] `/docs/REQ_TRACEABILITY.md` - Implementation traceability
- [x] `/docs/MOCKUP_MAP.md` - Mockup to component mapping
- [x] `/docs/DATA_SOURCE_REGISTER.md` - Data source inventory
- [x] `/docs/BLOCKERS_AND_INPUTS.md` - Blocked items
- [x] `/docs/USER_JOURNEYS.md` - User journey documentation
- [x] `/docs/MASTER_INDEX.md` - Navigation index
- [x] `/STATUS.md` - Current status

### Gates/Tests
- All documentation files exist and are properly formatted
- Links between documents are valid

### Definition of Done
- Control Pack committed to repository
- Operator can navigate all documentation

### Risks
- None identified

### Rollback
- Revert to previous commit

---

## Phase 1: Repo Scaffolding + CI Baseline ✅

### Deliverables
- [x] Project structure with client/server separation
- [x] TypeScript configuration
- [x] ESLint and Prettier setup
- [x] Vitest test framework
- [x] Basic CI pipeline (GitHub Actions)
- [x] `make check` skeleton

### Gates/Tests
- `pnpm install` succeeds
- `pnpm test` passes
- `pnpm typecheck` passes
- `pnpm lint` passes

### Definition of Done
- Clean build from fresh clone
- All basic tests pass

### Risks
- Dependency conflicts

### Rollback
- Revert to Control Pack commit

---

## Phase 2: Database Schema + Migrations ✅

### Deliverables
- [x] Core database tables (users, orgs, indicators, series, etc.)
- [x] Provenance tables (sources, source_runs, provenance_ledger)
- [x] Document tables (documents, document_versions, translations)
- [x] Entity tables (entities, entity_relationships)
- [x] Geography tables with PostGIS support
- [x] Seed script with sample data

### Gates/Tests
- `pnpm db:push` succeeds
- Schema validation tests pass
- Seed script runs without errors

### Definition of Done
- All tables created with proper relationships
- Sample data seeded for development

### Risks
- Schema changes may require migration adjustments

### Rollback
- Drop and recreate database from schema

---

## Phase 3: Source Registry + Ingestion Framework 🔄

### Deliverables
- [ ] Source registry admin UI
- [ ] Ingestion framework with connector interface
- [ ] World Bank Indicators connector (working)
- [ ] OCHA FTS connector (working)
- [ ] Admin ingestion monitoring UI

### Gates/Tests
- At least one connector fetches real data
- Ingestion logs are recorded
- QA validation runs on ingested data

### Definition of Done
- Working data pipeline from source to database
- Admin can monitor ingestion status

### Risks
- API rate limits
- Data format changes

### Rollback
- Disable connectors, use cached data

---

## Phase 4: Document Intelligence + Library 🔄

### Deliverables
- [ ] Document ingestion pipeline
- [ ] PDF/DOCX text extraction
- [ ] Semantic chunking and embedding
- [ ] Research library UI
- [ ] Bilingual summaries
- [ ] Evidence pack generation

### Gates/Tests
- Documents are indexed and searchable
- Evidence packs link to source documents
- Translation QA scores are recorded

### Definition of Done
- Research library populated with documents
- Evidence packs available for all content

### Risks
- Large document processing time
- Translation quality issues

### Rollback
- Disable document processing, show cached content

---

## Phase 5: Core UI Pages (Mockup-Exact) ✅

### Deliverables
- [x] Landing page (Home)
- [x] Dashboard with KPI cards
- [x] Data Repository with filters
- [x] Research hub
- [x] AI Assistant UI
- [x] Scenario Simulator UI
- [x] Sector pages (all 15 sectors)
- [x] Timeline page
- [x] Admin console
- [x] Subscription/Pricing page

### Gates/Tests
- All pages render correctly in AR and EN
- RTL layout verified
- Responsive design tested
- Mockup comparison passed

### Definition of Done
- UI matches mockups exactly
- All pages bilingual

### Risks
- Design deviations

### Rollback
- Revert to previous UI commit

---

## Phase 6: Auth + RBAC + Subscriptions 🔄

### Deliverables
- [ ] User authentication (OAuth)
- [ ] Role-based access control
- [ ] Subscription tier enforcement
- [ ] Partner portal workflows
- [ ] Organization management

### Gates/Tests
- Login/logout works
- Protected routes enforce permissions
- Subscription gating works

### Definition of Done
- Full auth flow working
- All tiers properly gated

### Risks
- OAuth provider issues

### Rollback
- Disable auth, allow public access

---

## Phase 7: Publications Engine 🔄

### Deliverables
- [ ] Auto-draft generation
- [ ] Admin approval workflow
- [ ] Bilingual output
- [ ] Corrections log
- [ ] Public corrections page

### Gates/Tests
- Publications generate correctly
- Approval workflow works
- Corrections are tracked

### Definition of Done
- Publications engine operational
- Corrections publicly visible

### Risks
- Content quality issues

### Rollback
- Disable auto-generation, manual only

---

## Phase 8: Scenario Simulator + Time Travel 🔄

### Deliverables
- [ ] Baseline transmission model
- [ ] Assumption visibility
- [ ] Model cards
- [ ] Vintage/time travel view
- [ ] Counterfactual analysis

### Gates/Tests
- Simulations run correctly
- Assumptions are displayed
- Model cards are complete

### Definition of Done
- Simulator produces valid outputs
- Time travel view works

### Risks
- Model accuracy concerns

### Rollback
- Show "experimental" label, disable public access

---

## Phase 9: Hardening 🔄

### Deliverables
- [ ] Monitoring setup
- [ ] Backup procedures
- [ ] Performance optimization
- [ ] Security scanning
- [ ] Full E2E test suite

### Gates/Tests
- `make check` passes all checks
- Security scan clean
- Performance benchmarks met

### Definition of Done
- Production-ready quality
- All security measures in place

### Risks
- Performance issues under load

### Rollback
- Scale down, optimize queries

---

## Phase 10: Production Deployment 📋

### Deliverables
- [ ] Deployment scripts finalized
- [ ] DNS configuration documented
- [ ] TLS certificates configured
- [ ] Readiness audit completed
- [ ] `/docs/FINAL_SELF_AUDIT.md`

### Gates/Tests
- Deployment scripts work in staging
- All checklist items verified
- Audit passed

### Definition of Done
- "READY FOR PRODUCTION DEPLOYMENT" status
- All documentation complete

### Risks
- Cloud credential availability

### Rollback
- Remain in staging mode

---

## Status Legend

- ✅ Complete
- 🔄 In Progress
- 📋 Planned
- ⚠️ Blocked

---

*Last updated: January 29, 2025*

---

## Phase 11: AgentOS Full Implementation 📋

### Deliverables
- [ ] `/agentos/AGENTOS_MANIFEST.json` - All 50+ agents
- [ ] `/agentos/PROVIDER_INTERFACE.md` - AI provider abstraction
- [ ] `/agentos/policies/` - Evidence, licensing, safety, bilingual, quality policies
- [ ] `/agentos/evals/` - Evaluation suites and golden questions
- [ ] `/agentos/runtime/` - Message schema, blackboard, orchestration

### Gates/Tests
- All agents have versioned prompts
- Evaluation suites pass thresholds
- Provider abstraction allows swapping without code changes

### Definition of Done
- AgentOS is hosting-agnostic
- All prompts stored in repository
- Nightly evals running

### Risks
- Provider API changes

### Rollback
- Revert to previous agent versions

---

## Control Pack Version

**Tag:** v0.0-control-pack
