# YETO Project Constitution: Hard Rules & Governance Framework

## Preamble

The Yemen Economic Transparency Observatory (YETO) is built on a foundation of **absolute non-negotiable rules** that govern all aspects of the platform's logic, user interface, and AI components. These rules are the supreme law of the project. Any feature or decision that violates these rules is redesigned or rejected.

This Constitution is a **living document** in the repository. Changes to it require strict review and approval.

---

## Rule 0: No Hallucination / No Fabrication (R0)

**Statement:** The AI and system must never invent data, citations, or facts.

**Implementation:**
- If information is missing, the UI displays **"Not available yet"** and triggers a Data Gap Ticket
- All AI-generated content is grounded strictly in the verified evidence store
- Every AI statement is labeled as one of: **Fact**, **Interpretation**, **Hypothesis**, **Forecast**, or **Recommendation**
- AI responses include mandatory citations with dataset IDs, source URLs, and retrieval dates
- Confidence ratings (A–D) are always displayed alongside claims

**Enforcement:**
- Automated tests verify AI responses contain citations
- Linting checks flag unlabeled statements
- Manual review gates for high-stakes outputs (policy briefs, public reports)

---

## Rule 1: Provenance & Transparency for Every Data Point (R1)

**Statement:** Every number, chart, or claim in the platform links to its source details and metadata.

**Implementation:**
- Every data point stores: publisher, dataset name, URL/ID, publication date, retrieval date, license info
- Metadata includes: geographic scope, time coverage, definitions/units, confidence rating, transformations
- **Single Source of Truth Policy:** All analytics, visualizations, and AI answers use only stored evidence and logged transformations
- No external or ad-hoc data sources are used in production
- Provenance badges are visible on all charts, tables, and KPI cards

**Enforcement:**
- Database schema enforces provenance_id on all time_series records
- UI tests verify provenance badges render correctly
- CI checks flag any visualization without a source reference

---

## Rule 2: Triangulation & Disagreement Mode (R2)

**Statement:** For high-stakes indicators, ingest multiple independent sources and preserve disagreement.

**Implementation:**
- High-stakes indicators (exchange rates, inflation, reserves) ingest 2+ independent sources
- System does NOT average conflicting values
- Disagreement mode view shows divergent figures with contextual explanations
- Users can toggle between single-source and multi-source views
- Discrepancies are highlighted with explanatory notes

**Examples:**
- Exchange rates: CBY Aden official vs CBY Sana'a vs market rates (shown separately, never averaged)
- Inflation: World Bank CPI vs IMF estimates vs WFP market prices (all preserved)
- Casualties: ACLED vs UCDP vs Yemen Data Project (displayed with confidence grades)

**Enforcement:**
- Database schema allows multiple values per indicator per date
- UI tests verify disagreement mode renders all sources
- Data validation checks flag averaged values and reject them

---

## Rule 3: Versioning and Historical Revisions (R3)

**Statement:** The data pipeline maintains full version history (vintages) for time-series and documents.

**Implementation:**
- Every update creates a new version entry with changelog note (what changed and why)
- Users query "what was known when" to avoid hindsight bias
- Earlier versions remain accessible for audit purposes
- Version history is immutable once committed

**Enforcement:**
- Database schema includes version_id, created_at, updated_at, changelog fields
- Soft deletes only (no hard deletes of historical data)
- API endpoints support version queries (e.g., `/api/timeseries?date=2025-06-15&version=2`)

---

## Rule 4: "Do No Harm" Principles (R4)

**Statement:** Protect privacy, prevent misuse, and use responsible framing for sensitive topics.

**Implementation:**
- **No PII:** Personal identifiable information is never ingested or published
- **AI Refusal:** AI refuses or sanitizes output that could facilitate violence, sanctions evasion, or market manipulation
- **Responsible Framing:** For panic-sensitive topics (currency collapse, bank runs), show uncertainty ranges and avoid alarmist language
- **Conflict Context:** All conflict-related data includes contextual warnings about dual governance and data limitations

**Enforcement:**
- Data validation checks scan for PII patterns (phone numbers, email addresses, names)
- AI safety gates check for harmful intent in queries
- Manual review for any output involving sanctions, weapons, or financial panic
- Glossary includes context notes for sensitive terms

---

## Rule 5: Arabic-First, Bilingual Design (R5)

**Statement:** Arabic is a first-class language at every level; UI/UX is fully bi-directional.

**Implementation:**
- UI/UX is fully RTL for Arabic, LTR for English
- Mirrored layouts (e.g., sidebar on right in Arabic, left in English)
- Enforced bilingual glossary ensures consistent terminology
- All features (dashboards, reports, AI assistant) available in Arabic and English with equal fidelity
- Accessibility standards (WCAG 2.1 AA) for color contrast, screen reader support, keyboard navigation

**Enforcement:**
- Automated tests verify RTL/LTR rendering
- Glossary tests check bilingual consistency
- Accessibility audits run on every release
- Design system enforces bilingual component variants

---

## Rule 6: Licensing & Data Compliance (R6)

**Statement:** Respect all data source licenses and robots.txt rules; no scraping of restricted sources.

**Implementation:**
- Only open or properly licensed data sources are ingested
- No scraping of paywalled or restricted content
- If a source is restricted, store only metadata (title, abstract) and mark as "restricted"
- Create Data Gap Ticket with recommended legal access methods
- Clear record of all content permissions maintained

**Enforcement:**
- Source registry includes license_type and license_notes fields
- Ingestion connectors check robots.txt before fetching
- CI checks verify all sources have valid licenses
- Legal review required before adding restricted sources

---

## Rule 7: Continuous Testing & CI/CD Safeguards (R7)

**Statement:** Rigorous CI pipeline from the start; all code changes require passing tests.

**Implementation:**
- Every code push triggers automated tests
- All key features have test coverage (including data validation checks)
- Merging to protected main branch requires passing all tests
- GitHub Actions enforces "green builds only" for deployment
- No "works on my machine" issues allowed

**Enforcement:**
- Branch protection rules require passing CI
- Test coverage minimum of 80% for new code
- Automated alerts for failing tests
- Deployment blocked if CI fails

---

## Rule 8: Unified Evidence Store (R8)

**Statement:** All components draw from the same unified database and document repository.

**Implementation:**
- No duplicated or diverging data caches
- User interface, analytics engine, and AI assistant all use same data source
- Reproducibility paramount: any insight can be traced to source data and transformation steps
- Provenance Ledger logs all transformations

**Enforcement:**
- Database schema enforces single source of truth
- API endpoints validate data consistency
- Audit logs track all data access and transformations
- Regular consistency checks between components

---

## Rule 9: Public Issue Reporting & Corrections (R9)

**Statement:** Every page includes "Report an issue" feature; corrections are published transparently.

**Implementation:**
- "Report an issue" button on all data charts and publications
- Reported issues generate internal tickets for investigation
- If correction is made, publish visible correction note or changelog entry
- Never silently alter published data
- Earlier versions remain accessible for audit

**Enforcement:**
- UI tests verify "Report an issue" button present on all data pages
- Correction workflow automated in issue tracking system
- Changelog entries required for all data corrections
- Version history immutable

---

## Rule 10: Split-System Data Enforcement (R10)

**Statement:** All data tagged by regime/source; never conflate data from different regimes.

**Implementation:**
- All relevant data tagged with regime_tag: "Aden/IRG", "Sana'a/de facto", "mixed", or "unknown"
- Key indicators (currency, prices, budgets) carry regime tags
- UI never merges data from different regimes without explicit user action
- Comparison mode available with clear warnings about context
- Example: Currency charts show separate trends for north and south by default

**Enforcement:**
- Database schema enforces regime_tag on all relevant records
- UI tests verify separate rendering of regime-tagged data
- Comparison mode requires explicit user confirmation
- Data validation checks flag missing regime tags

---

## Rule 11: Evidence Pack Requirement (R11)

**Statement:** AI-generated analysis includes Evidence Pack appendix with sources and confidence.

**Implementation:**
- Any AI analysis or report that might influence policy includes Evidence Pack
- Pack contains 5–15 most relevant sources backing conclusions
- Summary of what each source contributes
- Any contradictions noted
- Overall confidence grade
- Note on "what could change this conclusion"
- Implements provenance-first approach

**Enforcement:**
- AI response templates include Evidence Pack section
- Tests verify Evidence Pack completeness
- Manual review for high-stakes outputs
- Evidence Pack required before publishing any policy brief

---

## Rule 12: Resumability & Crash Safety (R12)

**Statement:** Build process is resilient; progress saved frequently for recovery.

**Implementation:**
- Checkpoint system saves progress after each major phase
- Code and docs committed, tagged (e.g., v0.1), and backed up
- docs/STATUS.md tracks phase progress
- docs/DECISIONS.md logs all key decisions and assumptions
- Project can recover from interruptions without starting over

**Enforcement:**
- Automated checkpoint creation at phase milestones
- Git tags created for all checkpoints
- Backup snapshots stored in /backups/ directory
- Recovery procedures documented in RUNBOOK.md

---

## Governance & Amendment Process

### How to Propose Changes to the Constitution

1. **Create Issue:** Open a GitHub issue titled "Constitution Amendment: [Title]"
2. **Justify:** Explain why the change is necessary and what problem it solves
3. **Review:** At least 2 domain experts (Macroeconomist, Security Engineer) must approve
4. **Document:** Update this file and create a changelog entry
5. **Test:** Implement tests for the new rule before merging

### Violations & Escalation

- **Minor violations:** Caught by automated tests; CI blocks merge
- **Major violations:** Escalated to Program Director for manual review
- **Unresolved violations:** Project deployment blocked until resolved

---

## Appendix: Rule Enforcement Matrix

| Rule | Enforcement Method | Owner | Frequency |
|------|-------------------|-------|-----------|
| R0 | AI response checker, manual review | Data Scientist | Per AI response |
| R1 | Database schema, UI tests | Data Engineer | Per data point |
| R2 | Data validation checks | Data Engineer | Per ingestion |
| R3 | Soft deletes, version tests | Database Admin | Per update |
| R4 | PII scanner, AI safety gates | Security Engineer | Per data/response |
| R5 | Accessibility audits, i18n tests | UX Designer | Per release |
| R6 | License checker, robots.txt validator | Legal/Data Engineer | Per source |
| R7 | CI/CD pipeline, test coverage | DevOps Engineer | Per commit |
| R8 | Consistency checks, audit logs | Data Engineer | Continuous |
| R9 | UI tests, issue tracking | QA Engineer | Per release |
| R10 | Data validation, UI tests | Data Engineer | Per record |
| R11 | Response templates, manual review | Data Scientist | Per report |
| R12 | Checkpoint automation, backup tests | DevOps Engineer | Per phase |

---

## Status

- **Created:** 2026-01-17
- **Last Updated:** 2026-01-17
- **Version:** 1.0
- **Approval Status:** DRAFT (awaiting team review)

---

*This Constitution is the supreme law of the YETO project. All features, decisions, and code must align with these rules.*
