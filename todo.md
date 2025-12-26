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
- [ ] Create coverage scorecard and gap management
- [ ] Implement correction workflow system

## Phase 6: Advanced Features
- [x] Build bilingual economic glossary
- [x] Implement AI assistant ("One Brain") interface
- [x] Create evidence pack generation system
- [ ] Build auto-publication engine
- [ ] Implement API documentation portal
- [x] Create research library with filtering
- [ ] Build compliance and sanctions monitoring dashboard
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
