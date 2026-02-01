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


---

## ADR-011: AgentOS Multi-Agent Architecture

**Date:** 2025-01-29

**Context:** Complex economic analysis requires specialized AI capabilities that a single model cannot provide optimally.

**Decision:** Implement AgentOS with 50+ specialized agents:
- One Brain orchestrator for routing and coordination
- Sector-specific analysts (macro, banking, trade, food security, etc.)
- Quality agents (confidence scorer, contradiction detector, tribunal judge)
- Ingestion agents (data connectors for WB, IMF, WFP, etc.)
- Support agents (translators, citation builder, gap ticket creator)

**Rationale:** Specialized agents can be optimized for specific tasks, evaluated independently, and updated without affecting the entire system.

**Consequences:**
- Complex orchestration logic required
- Each agent has versioned prompts in repository
- Evaluation suites per agent
- Clear separation of concerns

---

## ADR-012: Evidence Laws R0-R12

**Date:** 2025-01-29

**Context:** AI systems can fabricate information; YETO requires strict controls to maintain trust.

**Decision:** Implement 13 Evidence Laws enforced by all agents:
- R0: Zero Fabrication (never invent data)
- R1: Source Attribution (cite all sources)
- R2: Confidence Scoring (rate all data)
- R3: Contradiction Surfacing (show disagreements)
- R4: Temporal Precision (date all data)
- R5: Geographic Precision (specify scope)
- R6: Methodology Transparency (explain methods)
- R7: Gap Acknowledgment (admit unknowns)
- R8: Version Control (track changes)
- R9: Provenance Chain (full lineage)
- R10: Licensing Compliance (respect terms)
- R11: Numeric Integrity (preserve numbers)
- R12: Correction Protocol (fix errors publicly)

**Rationale:** Trust is YETO's core value proposition. Evidence Laws ensure every output is verifiable.

**Consequences:**
- All agents must enforce these laws
- Tribunal Judge validates before delivery
- Some queries may be refused
- Higher trust in outputs

---

## ADR-013: Provider-Agnostic AI Architecture

**Date:** 2025-01-29

**Context:** AI providers change rapidly; avoid vendor lock-in.

**Decision:** Implement provider abstraction layer:
- All prompts stored in `/agentos/agents/` directory
- Configuration-based provider switching via environment variables
- Unified interface for all providers (Manus, OpenAI, Anthropic, Azure)
- Fallback chain for reliability

**Rationale:** Prompts are intellectual property; storing them in repository enables version control, review, and provider independence.

**Consequences:**
- Additional abstraction layer complexity
- Can switch providers without code changes
- Prompts are version-controlled and auditable
- No vendor lock-in

---

## ADR-014: Control Pack Documentation Standard

**Date:** 2025-01-29

**Context:** Complex project requires comprehensive documentation for operations and maintenance.

**Decision:** Implement Control Pack with standardized documents:
- `/docs/0_START_HERE.md` - Entry point for operators
- `/docs/WORKPLAN.md` - Phase-by-phase execution plan
- `/docs/REQ_INDEX.md` - All requirements with stable IDs
- `/STATUS.md` - Current project status
- `/docs/DECISIONS.md` - This document

**Rationale:** Standardized documentation ensures knowledge transfer and operational continuity.

**Consequences:**
- Documentation overhead
- Clear onboarding path
- Traceable requirements
- Maintainable project

---

## ADR-015: Golden Questions Evaluation Framework

**Date:** 2025-01-29

**Context:** AI agents need systematic evaluation to ensure quality.

**Decision:** Implement golden questions evaluation:
- Each agent has evaluation suite in `/agentos/evals/`
- Golden questions test specific capabilities
- Assertions verify evidence law compliance
- Scoring rules weight different criteria
- Pass threshold of 95% required

**Rationale:** Automated evaluation enables continuous quality monitoring and regression detection.

**Consequences:**
- Evaluation suites must be maintained
- Nightly evaluation runs
- Clear quality metrics
- Regression detection

---

*Control Pack Version: v0.0-control-pack*
*Last Updated: January 29, 2025*


---

## ADR-016: Safe State Audit Findings — February 1, 2026

**Date:** 2026-02-01

**Context:** Safe state audit performed after "PROMPT 5.1/6 (P0 PATCH) — Zero-Fake UI" checkpoint to validate platform readiness.

### Assumptions Made During Audit

1. **Connection Pool Issue is P0**: The stale MySQL connection issue is the root cause of `/entities` showing "No Data Available" based on console error evidence (`Can't add new command when connection is in closed state`).

2. **Schema is Correct**: Verified that the `entities` table uses `name` and `nameAr` columns (not `nameEn`), matching both Drizzle schema and database. Previous context suggesting a column mismatch was incorrect.

3. **GitHub Export via UI**: The operator will use Management UI → Settings → GitHub for export rather than direct git push, as Manus uses internal S3 storage for version control.

4. **Documentation Changes Safe**: Created/updated documentation files without saving a new checkpoint, as these are audit artifacts and do not affect platform functionality.

5. **129 TS Errors Non-Blocking**: TypeScript errors are non-blocking for runtime since all tests pass and the application executes correctly. These are technical debt, not P0 blockers.

### Decisions Made

| Decision | Rationale |
|----------|-----------|
| Classify connection issue as P0 | Directly affects public page functionality |
| Recommend PROMPT 6/6 for connection fix | P0 must be resolved before production |
| Do not implement fixes in audit prompt | Operator requested safe state audit only |
| Log all findings to Decision Packet | Provides proof-grade status for operator |

**Consequences:**
- `/entities` page remains broken until connection fix implemented
- GitHub export should wait until P0 resolved
- Full Decision Packet available at `/docs/STATE_AUDIT_DECISION_PACKET.md`

---

*Last Updated: February 1, 2026*
