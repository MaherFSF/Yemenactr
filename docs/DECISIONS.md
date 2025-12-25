# Architecture Decision Records

## ADR-001: Technology Stack Selection

**Date:** 2025-01-25

**Context:** Need to select appropriate technology stack for YETO platform that supports bilingual content, real-time data updates, and complex analytics.

**Decision:** Using React 19 + Tailwind 4 + Express 4 + tRPC 11 stack with Manus Auth, as provided by the web-db-user scaffold. This provides:
- Type-safe API contracts via tRPC
- Built-in authentication with Manus OAuth
- MySQL/TiDB database with Drizzle ORM
- S3 integration for file storage
- Superjson for seamless Date/complex type handling

**Rationale:** The provided scaffold offers production-ready infrastructure with authentication, database, and API layer already configured. This accelerates development while maintaining type safety and modern best practices.

**Consequences:** 
- Frontend and backend share TypeScript types automatically
- Authentication "just works" without manual OAuth implementation
- Database migrations managed via Drizzle Kit
- All RPC traffic under `/api/trpc` for easy gateway routing

---

## ADR-002: Bilingual Implementation Strategy

**Date:** 2025-01-25

**Context:** Platform must support Arabic (RTL) and English (LTR) with Arabic as the primary language.

**Decision:** Implement client-side language switching with:
- React context for language state management
- Separate translation JSON files for each language
- RTL/LTR layout switching via CSS direction property
- Arabic typography: Cairo or Noto Kufi Arabic
- English typography: Inter

**Rationale:** Client-side switching provides instant language changes without page reloads. Separate translation files enable easy content management and future expansion.

**Consequences:**
- All UI text must be externalized to translation files
- Layout components must handle both RTL and LTR gracefully
- Date/number formatting must respect locale

---

## ADR-003: Data Provenance Architecture

**Date:** 2025-01-25

**Context:** Every data point must have complete provenance tracking including source, confidence level, and licensing.

**Decision:** Implement provenance as first-class database entities:
- `sources` table: publisher, URL, license, retrieval date
- `datasets` table: links to sources, includes confidence rating
- `data_points` table: links to datasets, includes regime_tag
- `provenance_log` table: tracks all transformations and updates

**Rationale:** Treating provenance as core data (not metadata) ensures it cannot be accidentally omitted and enables powerful querying and auditing capabilities.

**Consequences:**
- Every data insert must include provenance information
- UI must display source attribution for all charts/statistics
- Database size increases but data integrity is guaranteed

---

## ADR-004: Split-System Enforcement (Aden vs Sana'a)

**Date:** 2025-01-25

**Context:** Yemen operates under two de facto regimes with separate economic systems that must never be merged without explicit user consent.

**Decision:** Implement `regime_tag` enum on all relevant entities:
- Values: `aden_irg`, `sanaa_defacto`, `mixed`, `unknown`
- Database constraint prevents NULL values
- UI never aggregates across regimes by default
- "Compare regimes" mode requires explicit user opt-in with warning

**Rationale:** Merging data from two separate economic systems would produce meaningless or misleading statistics. Explicit tagging prevents accidental conflation.

**Consequences:**
- All queries must filter by regime_tag
- Charts must clearly label which regime data represents
- Comparative analysis requires separate UI mode
- Data ingestion must determine correct regime_tag

---

## ADR-005: No Hallucination Policy

**Date:** 2025-01-25

**Context:** Platform must never fabricate data or present unverified information as fact.

**Decision:** Implement strict data validation:
- Missing data displays "Not available yet" with explanation
- All AI outputs labeled as: Fact / Interpretation / Hypothesis / Forecast / Recommendation
- Data Gap Ticket system for tracking missing information
- Evidence Pack generation for high-stakes outputs

**Rationale:** Trust is paramount for economic intelligence platform. Fabricated data could lead to harmful policy decisions.

**Consequences:**
- Some charts may show gaps or "N/A" values
- AI features require careful prompt engineering and output validation
- Data Gap Tickets create transparency about platform limitations

---

## ADR-006: Contact Information Policy

**Date:** 2025-01-25

**Context:** Platform must not reveal physical addresses or office locations.

**Decision:** 
- Only contact: yeto@causewaygrp.com (email)
- No physical addresses anywhere on site
- No maps, location pins, or city names in contact sections
- Social icons allowed but must not link to location-revealing content

**Rationale:** Security and privacy requirements for operating in conflict-affected region.

**Consequences:**
- Footer contains only email contact
- About page focuses on mission, not physical presence
- Contact form submissions go to email only

---

## ADR-007: Color Palette and Design System

**Date:** 2025-01-25

**Context:** Need professional, trustworthy visual identity that works in both Arabic and English contexts.

**Decision:** Implement CauseWay brand colors:
- Navy: #103050 (primary)
- Dark Navy: #0B1F33 (headers)
- Green: #107040 (success, positive indicators)
- Gold: #C0A030 (accents, highlights)
- Light background: #F6F8FB
- Card: #FFFFFF
- Border: #E6EAF0

**Rationale:** Navy conveys trust and professionalism. Green represents growth and stability. Gold adds warmth and highlights important information.

**Consequences:**
- All components must use design tokens
- Charts should use palette-derived colors
- Accessibility contrast ratios must be verified

---

## ADR-008: Image Licensing and Attribution

**Date:** 2025-01-25

**Context:** All images must have proper licensing and attribution to avoid legal issues.

**Decision:** Implement image metadata tracking:
- Store: title, creator, source URL, license, retrieval date, usage location
- Display "Image credit" toggle/footnote where images used
- Only use images with compatible licenses (CC, public domain, purchased)
- Never display images of specific locations that could reveal addresses

**Rationale:** Proper attribution respects creators' rights and protects platform from legal liability.

**Consequences:**
- Image upload workflow must capture metadata
- Database schema includes image attribution table
- UI includes attribution display component

---

## ADR-009: Subscription and Access Tiers

**Date:** 2025-01-25

**Context:** Platform needs sustainable revenue model while keeping core data accessible.

**Decision:** Implement tiered access:
- **Public (Free)**: Basic dashboards, limited downloads, public API (rate-limited)
- **Researcher ($)**: Full data access, advanced filters, unlimited downloads
- **Institutional ($$)**: Team workspaces, custom reports, priority support, bulk API access
- **Partner Contributor**: Submit data, access moderation tools, attribution

**Rationale:** Free tier ensures accessibility for citizens and students. Paid tiers support platform sustainability and provide advanced features for professional users.

**Consequences:**
- Database includes subscription tier tracking
- API implements rate limiting by tier
- UI shows feature gates with upgrade prompts
- Partner portal requires separate authentication flow

---

## ADR-010: Testing and Quality Assurance Strategy

**Date:** 2025-01-25

**Context:** Platform handles sensitive economic data that influences policy decisions.

**Decision:** Implement comprehensive testing:
- Unit tests for all data transformation logic (Vitest)
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Nightly data integrity checks
- Manual QA for bilingual content accuracy

**Rationale:** Errors in economic data could have serious real-world consequences. Rigorous testing is non-negotiable.

**Consequences:**
- CI/CD pipeline blocks merges if tests fail
- Test coverage targets: >80% for backend, >60% for frontend
- Data integrity failures create admin tickets automatically
- Bilingual QA requires native Arabic speakers
