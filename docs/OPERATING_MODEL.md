# YETO Operating Model: Simulated Team Roles & Responsibilities

## Overview

Although YETO is developed by an autonomous AI (Manus), we simulate a full interdisciplinary team to ensure all perspectives are covered. Each role has defined responsibilities, outputs, and decision-making authority.

---

## Core Team Roles

### 1. Program Director / Product Owner

**Responsibility:** Oversee sequencing of phases, define acceptance criteria, maintain risk register.

**Key Outputs:**
- Execution Plan (docs/EXECUTION_PLAN.md) outlining each phase with Definition of Done
- STATUS.md with real-time progress tracking (updated at end of each phase)
- Risk Register tracking known challenges (data licensing delays, integration risks)
- Acceptance Criteria Checklist for each checkpoint

**Decision Authority:** Phase sequencing, scope changes, risk escalation

**Accountability:** On-time delivery, quality gates, stakeholder communication

---

### 2. Yemen Macroeconomist & Domain Specialists

**Sub-roles:**
- **Macroeconomist:** Overall economic indicators, GDP, inflation, trade
- **Monetary/FX Specialist:** Exchange rates, reserves, money supply
- **Public Finance Specialist:** Government budgets, revenue, expenditure
- **Humanitarian Economist:** Food security, displacement, aid flows
- **Conflict Economy Analyst:** Conflict-related economic impacts, sanctions
- **Labor Market Specialist:** Employment, wages, informal economy

**Responsibility:** Ensure content and indicators are relevant and correctly interpreted.

**Key Outputs:**
- Indicator Catalog (key economic indicators and definitions needed)
- Critical Data Sources per domain (with reliability assessments)
- Glossary terms for Yemen-specific economic concepts (bilingual definitions)
- Context notes for sensitive indicators (conflict, sanctions, currency)
- Validation of all economic analyses before publication

**Decision Authority:** Indicator selection, data interpretation, domain-specific rules

**Accountability:** Accuracy, relevance, contextual appropriateness

---

### 3. Data Engineer (ETL, Pipelines)

**Responsibility:** Ingestion framework, provenance logging, source registry management.

**Key Outputs:**
- Source Registry database schema and seed data
- Ingestion connectors for all automated sources (World Bank, IMF, UN Comtrade, etc.)
- Provenance Ledger implementation (transformation logging)
- Data validation and quality checks
- Fallback strategies and gap ticket automation
- Data backfill scripts for 2010-present historical data

**Decision Authority:** Technical architecture, connector design, data quality standards

**Accountability:** Data reliability, pipeline uptime, provenance accuracy

---

### 4. Data Scientist / ML Engineer

**Responsibility:** Nowcasting, anomaly detection, models, and explainable AI.

**Key Outputs:**
- Model Registry (metadata, validation protocols, performance metrics)
- Explainable AI guidelines (no black-box models without interpretability)
- Anomaly detection rules for key indicators
- Nowcasting models for missing data
- Model validation and backtesting protocols
- AI response validation (citations, confidence ratings)

**Decision Authority:** Model selection, validation thresholds, AI safety gates

**Accountability:** Model accuracy, interpretability, bias detection

---

### 5. Full-Stack Engineer

**Responsibility:** Codebase structure, frontend and backend development, deployment.

**Key Outputs:**
- GitHub monorepo structure (frontend, backend, infrastructure folders)
- Next.js baseline with TypeScript, SSR, Tailwind CSS
- FastAPI baseline with health-check, CORS, logging, auth scaffolding
- Bilingual support scaffolding (i18n setup)
- Environment config and secrets handling (.env.template files)
- Docker containerization for both apps
- Kubernetes manifests for orchestration

**Decision Authority:** Technology choices, architecture patterns, code standards

**Accountability:** Code quality, performance, maintainability

---

### 6. UX/UI Designer

**Responsibility:** Design system, visual consistency, accessibility, bilingual support.

**Key Outputs:**
- Design System Framework (colors, typography, spacing, shadows)
- Tailwind theme configuration with design tokens
- RTL/LTR mirroring support (CSS, conditional classes)
- Component library (KPI cards, filters, charts, split-pane assistant)
- UI Parity Checklist (mockup elements vs planned components)
- Accessibility audit checklist (WCAG 2.1 AA)
- Bilingual component variants

**Decision Authority:** Visual design, user experience, accessibility standards

**Accountability:** Design consistency, accessibility compliance, user satisfaction

---

### 7. Security/DevSecOps Engineer

**Responsibility:** AWS infrastructure, security baseline, CI/CD pipeline, monitoring.

**Key Outputs:**
- Terraform modules (VPC, RDS, S3, OpenSearch, ECS Fargate)
- IAM roles and policies (principle of least privilege)
- AWS WAF baseline rule set
- CloudWatch monitoring dashboards
- GitHub Actions CI/CD workflows (test, build, deploy)
- docs/SECURITY.md (threat model, mitigations, OWASP Top 10)
- Encryption at rest (RDS, S3), encryption in transit (TLS)
- Secrets management (AWS Secrets Manager)

**Decision Authority:** Infrastructure design, security policies, deployment process

**Accountability:** Security posture, infrastructure reliability, compliance

---

### 8. QA Engineer

**Responsibility:** Test planning, test automation, data quality checks.

**Key Outputs:**
- Comprehensive Test Plan (functional, data quality, security, accessibility)
- Testing framework setup (PyTest for backend, Jest for frontend)
- Rule enforcement tests (e.g., no PII in UI, citations in AI responses)
- End-to-end test scenarios (golden paths, edge cases)
- Data quality validation tests
- Regression test suite
- Test coverage reporting (minimum 80%)

**Decision Authority:** Test strategy, coverage requirements, quality gates

**Accountability:** Test coverage, defect detection, quality assurance

---

### 9. Technical Writer

**Responsibility:** Documentation suite, user guides, API reference, runbooks.

**Key Outputs:**
- START_HERE.md (project overview, dev setup)
- README.md (tech stack, local setup)
- ADMIN_MANUAL.md (system administration, troubleshooting)
- SUBSCRIBER_GUIDE.md (user features, reports, alerts)
- DATA_SOURCES_CATALOG.md (all sources, coverage, reliability)
- API_REFERENCE.md (endpoints, authentication, rate limits)
- DATA_DICTIONARY.md (all fields, definitions, units)
- RUNBOOK.md (operational procedures, incident response)
- DECISIONS.md (key decisions, assumptions, rationale)

**Decision Authority:** Documentation structure, content organization

**Accountability:** Documentation completeness, clarity, accuracy

---

## Decision-Making Framework

### Authority Levels

**Level 1 - Autonomous (Individual Role):** Daily decisions within role scope (e.g., Data Engineer choosing connector library)

**Level 2 - Collaborative (Cross-functional):** Decisions affecting multiple roles (e.g., adding new indicator requires Macroeconomist + Data Engineer + Designer)

**Level 3 - Escalation (Program Director):** Strategic decisions, scope changes, risk management (e.g., delaying a phase, changing core architecture)

### Decision Log

All Level 2 and Level 3 decisions are logged in docs/DECISIONS.md with:
- Decision title
- Options considered
- Rationale for chosen option
- Stakeholders involved
- Date and owner
- Impact assessment

---

## Communication & Coordination

### Synchronization Points

- **Phase Start:** Program Director briefs all roles on phase goals and acceptance criteria
- **Mid-Phase:** Weekly status check (each role reports blockers, risks)
- **Phase End:** Full team review of deliverables against acceptance criteria
- **Checkpoint:** All roles sign off on quality before committing code

### Escalation Path

1. **Issue identified:** Role reports to Program Director
2. **Diagnosis:** Program Director + relevant experts assess impact
3. **Resolution:** Decide on fix, timeline, and resource allocation
4. **Communication:** Update STATUS.md and notify stakeholders

---

## Role Accountability Matrix

| Role | Execution Plan | Indicator Catalog | Source Registry | Test Plan | CI/CD | Documentation |
|------|---|---|---|---|---|---|
| Program Director | Owner | Reviewer | Reviewer | Reviewer | Reviewer | Reviewer |
| Macroeconomist | Contributor | Owner | Contributor | Contributor | - | Contributor |
| Data Engineer | Contributor | Contributor | Owner | Contributor | Contributor | Contributor |
| Data Scientist | Contributor | Contributor | Contributor | Contributor | Contributor | Contributor |
| Full-Stack Engineer | Contributor | - | Contributor | Contributor | Owner | Contributor |
| UX/UI Designer | Contributor | Contributor | - | Contributor | - | Contributor |
| Security Engineer | Contributor | - | Contributor | Contributor | Owner | Contributor |
| QA Engineer | Contributor | Contributor | Contributor | Owner | Contributor | Contributor |
| Technical Writer | Contributor | Contributor | Contributor | Contributor | Contributor | Owner |

---

## Success Metrics by Role

| Role | Metric | Target |
|------|--------|--------|
| Program Director | On-time delivery | 100% of phases on schedule |
| Macroeconomist | Indicator accuracy | 100% of indicators validated |
| Data Engineer | Data quality | 99.9% uptime, <1% missing data |
| Data Scientist | Model accuracy | >90% on backtests |
| Full-Stack Engineer | Code quality | 80%+ test coverage, <5 critical bugs |
| UX/UI Designer | Accessibility | WCAG 2.1 AA compliance |
| Security Engineer | Security posture | 0 critical vulnerabilities |
| QA Engineer | Test coverage | 80%+ of code paths tested |
| Technical Writer | Documentation | 100% of features documented |

---

## Status

- **Created:** 2026-01-17
- **Last Updated:** 2026-01-17
- **Version:** 1.0

---

*This Operating Model ensures all perspectives are represented and all decisions are traceable.*
