# YETO - Yemen Economic Transparency Observatory

## Welcome

YETO is a comprehensive bilingual (Arabic/English) economic intelligence platform for Yemen, providing verified data, research, and analysis from 2010 to present. The platform aggregates information from over 20 credible international and local sources, presenting it through an intuitive interface with full provenance tracking.

---

## Quick Start

### For Users

Visit the live platform at the deployed URL and explore:

| Feature | Description | Access |
|---------|-------------|--------|
| Dashboard | Real-time economic indicators and exchange rates | Public |
| Sectors | 17 specialized sector pages with detailed analysis | Public |
| Research Library | 350+ publications from credible sources | Public |
| Timeline | 100 economic events from 2010-2026 | Public |
| AI Assistant | Evidence-backed answers to economic questions | Registered |
| Data Repository | Downloadable datasets in CSV/JSON format | Registered |

### For Developers

Clone the repository and run locally:

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The development server runs at `http://localhost:3000`.

### For Administrators

Access the admin portal at `/admin` with an admin account. The admin portal provides:

| Section | Capabilities |
|---------|-------------|
| Dashboard | System metrics, user statistics, data health |
| Ingestion | Monitor and trigger data source updates |
| API Health | Check status of all 20 data connectors |
| Scheduler | Manage 11 automated jobs |
| Users | User management and role assignment |

---

## Key Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| README.md | Developer quickstart | `/README.md` |
| ADMIN_MANUAL.md | Admin operations guide | `/docs/ADMIN_MANUAL.md` |
| SUBSCRIBER_GUIDE.md | Subscriber features | `/docs/SUBSCRIBER_GUIDE.md` |
| DATA_SOURCES_CATALOG.md | Data source details | `/docs/DATA_SOURCES_CATALOG.md` |
| API_REFERENCE.md | API documentation | `/docs/API_REFERENCE.md` |
| SECURITY.md | Security controls | `/docs/SECURITY.md` |
| RUNBOOK.md | Operations procedures | `/docs/RUNBOOK.md` |

---

## Platform Architecture

YETO is built on a modern stack designed for reliability and scalability:

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 19 + Tailwind 4 | Bilingual UI with RTL support |
| API | tRPC 11 + Express 4 | Type-safe API layer |
| Database | MySQL/TiDB + Drizzle ORM | 89-table schema with provenance |
| AI | LLM with RAG | Evidence-backed assistant |
| Storage | S3 | Document and asset storage |
| Scheduler | Node-cron | Automated data ingestion |

---

## Data Integrity Principles

YETO enforces strict data governance:

1. **No Hallucination**: All AI outputs are grounded in the evidence store with source citations
2. **Full Provenance**: Every data point includes source, date, license, and confidence rating
3. **Triangulation**: High-stakes indicators show multiple sources when available
4. **Versioning**: Historical data vintages are preserved for "what was known when" analysis
5. **Bilingual Glossary**: 51 controlled terms ensure translation consistency

---

## Contact

For questions or support, contact: **yeto@causewaygrp.com**

---

## License

This platform is developed by Causeway Group. All data is sourced from publicly available sources with appropriate attribution.
