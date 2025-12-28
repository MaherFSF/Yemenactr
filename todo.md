# YETO Platform TODO

## Phase 1: Project Foundation & Documentation
- [x] Create STATUS.md with current phase tracking
- [x] Create docs/DECISIONS.md for architecture decisions
- [x] Create docs/ARCHITECTURE.md for system design
- [x] Create docs/CHANGELOG.md for version tracking
- [ ] Create docs/RECOVERY_RUNBOOK.md for disaster recovery
- [x] Set up bilingual glossary system

## Phase 2: Design System & Core Pages
- [x] Implement design tokens (Navy/Green/Gold color palette)
- [x] Set up bilingual navigation (Arabic RTL + English LTR)
- [x] Configure Arabic typography (Cairo) and English (Inter)
- [x] Build responsive header with language switcher
- [x] Build footer with yeto@causewaygrp.com contact only
- [x] Create Home/Landing page with hero section
- [x] Create About page with team information
- [x] Create Contact page
- [x] Create Methodology & Transparency page

## Phase 3: Database Schema & Backend Infrastructure
- [x] Design database schema for economic data with provenance tracking
- [x] Create tables for time series data with regime_tag support
- [x] Create tables for documents, sources, and licensing metadata
- [x] Create tables for confidence scoring and versioning
- [x] Create tables for data gap tickets
- [x] Create tables for stakeholder registry
- [x] Create tables for user subscriptions and permissions
- [x] Implement split-system enforcement (Aden/Sana'a regime tags)
- [x] Build backend API for data queries
- [x] Implement data provenance tracking system
- [x] Create tables for partner submissions
- [x] Create tables for API access logs
- [x] Create tables for AI query logs
- [x] Create tables for saved reports
- [x] Create tables for indicator definitions
- [x] Create tables for event-indicator links

## Phase 4: Dashboard & Data Visualizations
- [x] Build main economic dashboard with key metrics
- [x] Implement interactive charts (inflation, FX rates, reserves)
- [x] Build sector-specific dashboards (Banking, Trade, Poverty, etc.)
- [x] Create interactive timeline for economic events
- [x] Build data repository with search and filters
- [x] Implement advanced filtering system
- [x] Build comparative analysis tools
- [x] Create scenario simulator interface
- [x] Build custom report builder
- [x] Implement data export functionality

## Phase 5: Admin & Partner Portals
- [x] Build admin operations console
- [x] Create partner contributor portal
- [x] Implement data submission workflow
- [x] Build moderation and verification system
- [x] Create subscription management interface
- [x] Implement role-based access control
- [x] Build user workspace for premium features
- [x] Create coverage scorecard and gap management
- [x] Implement correction workflow system

## Phase 6: Advanced Features
- [x] Build bilingual economic glossary
- [x] Implement AI assistant ("One Brain") interface
- [x] Create evidence pack generation system
- [ ] Build auto-publication engine
- [ ] Implement API documentation portal
- [x] Create research library with filtering
- [x] Build compliance and sanctions monitoring dashboard
- [ ] Implement policy impact analysis tools
- [ ] Create international organization data exchange hub

## Phase 7: Testing & Deployment
- [x] Write comprehensive test suite
- [ ] Conduct platform-wide accuracy checks
- [x] Test bilingual functionality (Arabic RTL + English)
- [x] Verify all data provenance tracking
- [x] Test split-system regime tag enforcement
- [ ] Conduct security audit
- [ ] Deploy to production (yeto.causewaygrp.com)
- [x] Create final checkpoint

## Phase 8: GitHub Integration & Deployment
- [x] Create GitHub repository for YETO platform
- [x] Push all code to GitHub
- [ ] Set up branch protection rules
- [ ] Configure CI/CD with GitHub Actions

## Phase 9: Additional Sector Pages
- [x] Macroeconomy & Growth sector page
- [x] Prices & Cost of Living sector page
- [x] Currency & Exchange Rates sector page
- [x] Public Finance & Governance sector page
- [x] Energy & Fuel sector page
- [x] Labor Market & Wages sector page
- [x] Food Security & Markets sector page
- [x] Aid Flows & Accountability sector page
- [x] Conflict Economy & Political Economy sector page
- [x] Infrastructure & Services sector page
- [x] Agriculture & Rural Development sector page
- [x] Investment & Private Sector sector page

## Phase 10: Timeline & Events
- [x] Build Timeline page with 2010→present events
- [x] Implement event filtering by actor/location/theme
- [x] Link events to indicators with before/after comparison

## Phase 11: Methodology & Transparency
- [x] Build Methodology page with data QA rules
- [x] Build Transparency & Accountability page
- [x] Implement corrections policy workflow
- [ ] Create changelog page

## Phase 12: Enhanced AI & Reports
- [x] Enhance AI Assistant with RAG structure
- [x] Implement evidence packs for high-stakes outputs
- [x] Build Custom Report Builder wizard
- [x] Implement export pipeline (CSV/XLSX/PDF/PNG/SVG/JSON)

## Phase 13: Subscriptions & Premium Features
- [x] Implement subscription tiers (Public/Registered/Pro/Institutional)
- [x] Build premium workspaces
- [ ] Implement API key management
- [ ] Build saved dashboards/searches feature

## Phase 14: Database Enhancements
- [x] Implement provenance ledger tables
- [x] Build source registry with review queue
- [x] Implement gap tickets system
- [ ] Build coverage scorecard

## Phase 15: Documentation & Testing
- [x] Write comprehensive vitest test suite
- [ ] Create Administrator Manual
- [ ] Create Data Governance Manual
- [ ] Create API Manual
- [ ] Create Contributor Manual


## Phase 16: UI Refinement to Match Mockups
- [x] Update color scheme to exact design tokens (Navy #103050, Green #107040, Gold #C0A030)
- [x] Refine Home page hero section with proper gradient and typography
- [x] Add sector dropdown menu in header navigation
- [x] Update Dashboard with key metrics cards matching mockup style
- [x] Ensure all cards have proper shadows and borders
- [x] Add contextual Yemen imagery where appropriate

## Phase 17: Remaining Sector Pages
- [x] Labor Market & Wages sector page
- [x] Conflict Economy & Political Economy sector page
- [x] Infrastructure & Services sector page
- [x] Agriculture & Rural Development sector page
- [x] Investment & Private Sector sector page

## Phase 18: Dynamic Data Integration
- [x] Create tRPC procedures for fetching time series data
- [x] Create tRPC procedures for fetching geospatial data
- [x] Create tRPC procedures for sector analytics
- [x] Create tRPC procedures for regime comparison
- [x] Create tRPC procedures for platform statistics
- [ ] Implement data export endpoints (CSV, XLSX, JSON)
- [ ] Connect AI Assistant to LLM service


## Phase 19: Glossary & Legal Pages
- [x] Build Glossary page with bilingual economic terms
- [x] Build Privacy Policy page
- [x] Build Terms of Service page
- [x] Build Data License & Reuse page
- [x] Build Accessibility Statement page

## Phase 20: Research Library Enhancement
- [x] Add document cards with metadata display
- [x] Implement filtering by category, date, source
- [x] Add search functionality for documents
- [x] Display source attribution and licensing

## Phase 21: AI Assistant Integration
- [x] Connect AI Assistant to invokeLLM helper
- [x] Implement context-aware prompting for Yemen economy
- [x] Connect frontend to tRPC AI mutation
- [x] Add evidence pack generation for responses
- [x] Implement confidence scoring for AI outputs
- [ ] Implement full RAG retrieval from database (future enhancement)

## Phase 22: Data Seeding
- [x] Create seed script for economic indicators
- [x] Seed sample time series data (FX rates, inflation, etc.)
- [x] Seed sample economic events
- [x] Seed sample sources and documents
- [x] Seed glossary terms
- [x] Seed stakeholders
- [x] Run seed script successfully (96 FX data points, 5 events, 8 glossary terms, 6 stakeholders)

## Phase 23: Data Export
- [x] Implement CSV export function
- [x] Implement JSON export function
- [x] Create getExportData function for time series
- [ ] Add export buttons to Dashboard and sector pages (UI enhancement)

## Phase 24: Documentation
- [x] Create DECISIONS.md with architecture choices
- [x] Create ARCHITECTURE.md with system design
- [ ] Create API documentation (future enhancement)
- [ ] Update README with setup instructions (future enhancement)


## Phase 25: Control Pack Documentation (from upgraded prompt)
- [x] Create /docs/0_START_HERE.md - Operator guide with 10-command cheat sheet
- [x] Create /docs/WORKPLAN.md - Phase-by-phase plan
- [x] Create /docs/REQ_INDEX.md - Atomic requirements with IDs
- [x] Create /docs/RTM.csv - Requirements Traceability Matrix
- [ ] Create /docs/REQ_TRACEABILITY.md - Implementation to test mapping
- [x] Create /docs/MOCKUP_MAP.md - Mockup to component mapping
- [ ] Create /docs/ATTACHMENTS_INDEX.md - File inventory
- [x] Create /docs/DATA_SOURCE_REGISTER.md - Data source inventory
- [x] Create /docs/BLOCKERS_AND_INPUTS.md - Blocked items and inputs needed
- [ ] Create /docs/USER_JOURNEYS.md - End-to-end user journeys
- [ ] Create /docs/DEMO_SCRIPT.md - Demo paths for donors/partners
- [x] Create /docs/MASTER_INDEX.md - Navigation map for all docs
- [x] Update /STATUS.md - Current status
- [x] Create /docs/MOCKUP_ANALYSIS.md - Design reference from mockups

## Phase 26: Mockup Alignment
- [x] Access iCloud mockups and download to /assets/mockups/external/
- [x] Extract 83 mockup images from iCloud
- [x] Map each mockup to route/page/components
- [ ] Verify UI matches mockup design exactly
- [ ] Document any deviations with rationale

## Phase 27: Enhanced Data Governance
- [ ] Implement provenance ledger with W3C PROV concepts
- [ ] Add vintages system for "what was known when"
- [ ] Implement contradiction detector
- [x] Add Evidence Pack system to all KPIs/charts
- [x] Create EvidencePack component with dialog/popover variants

## Phase 28: Entity Profiles Module
- [x] Create /entities route with entity profiles
- [x] Seed HSA Group (Hayel Saeed Anam & Co.) profile
- [x] Add major banks, telecoms, ports/logistics profiles
- [x] Create entity detail page with tabs (Overview, Indicators, Risks, Timeline, Sources)
- [x] Implement Evidence Pack display on entity profiles
- [ ] Implement entity relationships and ownership structures (future enhancement)

## Phase 29: Corrections Workflow
- [x] Add "Report an issue" button on corrections page
- [x] Create corrections ticket submission dialog
- [ ] Build admin corrections review workflow
- [x] Create public /corrections log page with filtering

## Phase 30: Publications Engine
- [x] Create Publications page with publication types
- [x] Implement Daily Economic Signals Digest display
- [x] Implement Weekly Market & FX Monitor display
- [x] Implement Monthly Macro-Fiscal Brief display
- [x] Add Special Reports section
- [x] Build publication filtering and search
- [x] Add bilingual output for all publications
- [ ] Implement auto-draft generation backend (future enhancement)
- [ ] Build admin approval workflow for publications (future enhancement)

## Phase 31: Final Documentation
- [x] Create /docs/ADMIN_MANUAL.md
- [ ] Create /docs/SUBSCRIBER_MANUAL.md
- [ ] Create /docs/PARTNER_MANUAL.md
- [x] Create /docs/DATA_GOVERNANCE.md
- [x] Create /docs/API_REFERENCE.md
- [ ] Create /docs/FINAL_SELF_AUDIT.md


## Phase 32: User Dashboard & Personalization
- [x] Build user dashboard page with personalized content
- [x] Implement saved searches functionality
- [x] Create indicator watchlist feature
- [x] Add recent activity feed
- [x] Build custom report history

## Phase 33: Export Enhancements
- [x] Add export buttons to Dashboard page
- [x] Create reusable ExportButton component
- [x] Implement export format selection (CSV/JSON/XLSX)
- [ ] Add export buttons to all sector pages
- [ ] Implement bulk export functionality

## Phase 34: Additional Documentation
- [x] Create /docs/SUBSCRIBER_MANUAL.md
- [x] Create /docs/PARTNER_MANUAL.md
- [x] Create /docs/USER_JOURNEYS.md
- [ ] Create /docs/DEMO_SCRIPT.md

## Phase 35: Changelog & Status
- [x] Create /changelog page with version history
- [x] Update STATUS.md with current progress
- [ ] Create /docs/FINAL_SELF_AUDIT.md

## ## Phase 36: API Key Management
- [x] Build API key generation interface
- [x] Add usage tracking and rate limiting display
- [ ] Implement API key validation middleware (backend)ing per tier


## Phase 37: World-Class Implementation (Master Build Exact)

### Insights Ticker
- [x] Create InsightsTicker component with rotating evidence-backed updates
- [x] Add sticky ticker bar to homepage
- [x] Implement auto-rotation with pause on hover
- [x] Link each insight to its Evidence Pack
- [ ] Add InsightsTicker to dashboard page

### Evidence Pack Integration
- [x] Add "Show me how you know this" button to all KPI cards
- [x] Create enhanced EvidencePackButton component with tabs
- [x] Create DataQualityBadge component for DEV labels
- [x] Add DevModeBanner component for development mode
- [x] Implement Evidence Pack modal with full provenance display
- [ ] Add Evidence Pack buttons to all charts
- [ ] Add Evidence Pack links to all data tables
### Admin Console Enhancement
- [x] Add ingestion health dashboard with real-time status
- [x] Implement QA alerts panel with severity levels
- [x] Add coverage heatmap visualization
- [x] Create data source health monitoring
- [x] Add pending submissions review workflows panel for common admin tasks
### Entity Profiles Complete
- [x] Add HSA Group subsidiaries (YCGS, NFI, Aujan, YKB, etc.)
- [x] Add entity timeline with key events
- [x] Link entities to related indicators
- [x] Add risk factors with severity levels
- [x] Add confidence ratings to indicators
- [ ] Add ownership structure visualization (future enhancement)ces

### Time-Travel View
- [x] Implement vintage selector for historical data views
- [x] Add "what was known when" query interface
- [x] Create TimeTravelView component with timeline
- [x] Add TimeTravelBadge for inline use
- [ ] Store data vintages with timestamps
- [ ] Display vintage metadata on all data points

### DEV Labels
- [ ] Add DEV badge to all synthetic/placeholder data
- [ ] Implement data quality indicator badges (Verified/Provisional/Experimental)
- [ ] Add last updated timestamps to all data displays

### Validation Scripts
- [ ] Create Makefile with check command
- [ ] Create scripts/req_coverage_check.py
- [ ] Create scripts/mockup_coverage_check.py
- [ ] Implement E2E tests with Playwright

### Final Polish
- [ ] Verify all pages have Arabic and English versions
- [ ] Ensure all numeric values are consistent across translations
- [ ] Add contact email (yeto@causewaygrp.com) to footer
- [ ] Remove any physical address references


## Phase 38: User Role-Based Access Control
- [x] Implement role enum (admin, analyst, partner, public) in schema
- [x] Create adminProcedure, analystProcedure, partnerProcedure middleware
- [x] Add admin router with user management endpoints
- [ ] Add role-based route protection on frontend
- [ ] Build user management admin panel UI
- [ ] Implement role assignment workflow

## Phase 39: Email Notification System
- [x] Create notification preferences schema
- [x] Create email subscriptions schema
- [x] Create publication drafts schema
- [x] Create sent emails log schema
- [x] Add notifications router with preferences endpoints
- [x] Add subscribe/unsubscribe endpoints
- [ ] Build email templates for publications
- [ ] Implement email sending service
- [ ] Create digest email scheduler

## Phase 40: Real Data Fetching
- [ ] Create tRPC procedures for time series data
- [ ] Implement indicator search and filtering
- [ ] Add regime comparison data endpoints
- [ ] Create sector-specific data aggregations
- [ ] Implement data caching layer

## Phase 41: Interactive Charts
- [ ] Add Recharts to all sector pages
- [ ] Implement real-time data refresh
- [ ] Create comparison chart components
- [ ] Add chart export functionality
- [ ] Implement chart annotations

## Phase 42: Data Export API
- [ ] Create CSV export endpoint
- [ ] Create JSON export endpoint
- [ ] Create XLSX export endpoint
- [ ] Add export rate limiting
- [ ] Implement export audit logging

## Phase 43: Global Search
- [x] Create GlobalSearch component with keyboard shortcuts (⌘K)
- [x] Implement full-text search on indicators, documents, entities, events
- [x] Add document search functionality
- [x] Implement search results with type filtering and tabs
- [x] Implement search suggestions (popular searches)
- [x] Add GlobalSearch to Header navigation
- [ ] Add recent searches history (future enhancement)
- [ ] Connect to backend search API (future enhancement)
