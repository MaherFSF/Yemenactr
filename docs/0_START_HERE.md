# YETO Platform - Operator Quick Start Guide

## What is YETO?

**YETO (Yemen Economic Transparency Observatory)** is a bilingual (Arabic-first, RTL default + English LTR) evidence-grounded economic intelligence platform for Yemen (2010→present). It provides:

- **Continuous data ingestion** from credible sources with full provenance tracking
- **Dashboards & Analytics** for economic indicators across 15+ sectors
- **Research Library** with documents, reports, and publications
- **Entity Profiles** for major commercial actors and institutions
- **AI Assistant ("One Brain")** for evidence-only queries
- **Scenario Simulator** for economic modeling
- **Partner Portal** for data contributors
- **Admin Console** for operations management

**Domain**: https://yeto.causewaygrp.com  
**Contact**: yeto@causewaygrp.com

---

## 10-Command Cheat Sheet

```bash
# 1. Start development server
pnpm dev

# 2. Run all tests
pnpm test

# 3. Push database schema changes
pnpm db:push

# 4. Seed sample data
node server/seed.mjs

# 5. Build for production
pnpm build

# 6. Type check
pnpm typecheck

# 7. Lint code
pnpm lint

# 8. Run E2E tests (when available)
pnpm test:e2e

# 9. Generate database migrations
pnpm db:generate

# 10. View database in browser
pnpm db:studio
```

---

## Where is X? Quick Index

| Task | Location |
|------|----------|
| Edit homepage hero | `client/src/pages/Home.tsx` |
| Add new dataset | Admin Portal → Data Repository → Upload |
| Change chart styling | `client/src/pages/Dashboard.tsx` or sector pages |
| Approve publication | Admin Portal → Publications → Pending |
| Manage users/subscriptions | Admin Portal → Users |
| Edit glossary terms | Admin Portal → Content → Glossary |
| Manage data sources | Admin Portal → Sources |
| View ingestion health | Admin Portal → Ingestion |
| Restore from backup | See `/docs/BACKUP_RESTORE.md` |
| Re-run ingestion | Admin Portal → Ingestion → Re-run |
| Rotate API keys | See `/docs/SECURITY_RUNBOOK.md` |

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- pnpm 8+
- Database connection (configured via environment)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/MaherFSF/yeto-platform.git
   cd yeto-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Configure database URL and other required variables

4. **Push database schema**
   ```bash
   pnpm db:push
   ```

5. **Seed sample data (optional)**
   ```bash
   node server/seed.mjs
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

7. **Open in browser**
   - Navigate to `http://localhost:3000`

---

## How to Deploy

### Staging Deployment
```bash
./scripts/bootstrap_staging.sh
```

### Production Deployment
```bash
./scripts/bootstrap_prod.sh
```

See `/docs/DEPLOYMENT_RUNBOOK.md` for detailed instructions.

---

## Content Management

### Managing Homepage Content
- Edit `client/src/pages/Home.tsx` for hero section, stats, and layout
- Update translations in component files for bilingual content

### Managing Data Sources
1. Go to Admin Portal → Sources
2. Add new source with URL, cadence, and licensing info
3. Configure validation rules
4. Enable scheduled ingestion

### Approving Publications
1. Go to Admin Portal → Publications
2. Review pending drafts
3. Check evidence packs
4. Approve or request revisions
5. Publish (bilingual output generated automatically)

### Managing Subscriptions
1. Go to Admin Portal → Users
2. View user/organization details
3. Upgrade/downgrade subscription tier
4. Manage seat allocations for institutional accounts

---

## If Something Breaks - Triage Tree

```
Problem?
├── Website not loading?
│   ├── Check server status: `pnpm dev` running?
│   ├── Check database connection
│   └── Check environment variables
│
├── Data not showing?
│   ├── Check ingestion logs: Admin → Ingestion
│   ├── Verify data source is active
│   └── Check for QA validation errors
│
├── Authentication issues?
│   ├── Check OAuth configuration
│   ├── Verify JWT_SECRET is set
│   └── Check user permissions
│
├── Search not working?
│   ├── Check search index status
│   ├── Rebuild embeddings if needed
│   └── Verify database connectivity
│
├── AI Assistant not responding?
│   ├── Check LLM provider configuration
│   ├── Verify API keys are valid
│   └── Check evidence store connectivity
│
├── Translation issues?
│   ├── Check translation QA scores
│   ├── Verify numeric integrity
│   └── Review glossary adherence
│
└── Export failures?
    ├── Check file storage configuration
    ├── Verify user has export permissions
    └── Check for data validation errors
```

---

## Key Documentation Links

- [Workplan](/docs/WORKPLAN.md) - Phase-by-phase implementation plan
- [Requirements Index](/docs/REQ_INDEX.md) - All requirements with IDs
- [Mockup Map](/docs/MOCKUP_MAP.md) - UI mockup to component mapping
- [Data Sources](/docs/DATA_SOURCE_REGISTER.md) - All data source configurations
- [Blockers](/docs/BLOCKERS_AND_INPUTS.md) - Items needing operator input
- [Architecture](/ARCHITECTURE.md) - System design documentation
- [Decisions](/DECISIONS.md) - Architecture decision log

---

## Support

For technical issues or questions:
- Email: yeto@causewaygrp.com
- GitHub Issues: https://github.com/MaherFSF/yeto-platform/issues

---

*Last updated: January 29, 2025*

---

## Control Pack Version

**Tag:** v0.0-control-pack

This document is part of the YETO Control Pack, ensuring no requirement is ever missed and all operations are documented and traceable.
