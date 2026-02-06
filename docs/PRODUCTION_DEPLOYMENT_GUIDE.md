# YETO Platform - Production Deployment Guide

**Last Updated:** January 10, 2025

## 🚨 CRITICAL: Database Population for Production

The published production database is **separate** from the development database. After publishing, you **MUST** populate the production database with real data, or the published site will show empty tables.

---

## Quick Start (3 Steps)

### Step 1: Export Data from Development
```bash
cd /home/ubuntu/yeto-platform
pnpm tsx scripts/post-deployment-setup.ts
```

This will show you the current database status:
- ✅ research_publications: 273 records
- ✅ glossary_terms: 51 records
- ✅ time_series: 1,778 records
- ✅ economic_events: 5 records
- ✅ users: 3 records
- ✅ sources: 22 records
- **Total: 2,132 records**

### Step 2: Export Data to File
```bash
pnpm tsx scripts/export-data-for-production.ts
```

This creates `data-export.json` with all data ready for production.

### Step 3: Import Data to Production
After publishing:
```bash
pnpm tsx scripts/import-data-to-production.ts
```

This imports all data into the production database.

### Step 4: Publish Release Manifest (Required)

Update the release manifest and publish it to S3 so production can expose a
verifiable version:

```bash
aws s3 cp docs/releases/latest.json \
  s3://yeto-assets/releases/latest.json
```

Then verify it is reachable via the production domain:

```
https://yeto.causewaygrp.com/releases/latest.json
```

### Step 5: Archive Release Bundle (Backup)

Store the versioned release snapshot for rollback:

```bash
aws s3 sync docs/releases/v0.2.3 \
  s3://yeto-backups/releases/v0.2.3
```

---

## Detailed Deployment Process

### Phase 1: Pre-Deployment (Development)

1. **Verify Development Database**
   ```bash
   pnpm tsx scripts/post-deployment-setup.ts
   ```
   
   Expected output:
   ```
   ✅ research_publications               :    273 records
   ✅ glossary_terms                      :     51 records
   ✅ time_series                         :   1778 records
   ✅ economic_events                     :      5 records
   ✅ users                               :      3 records
   ✅ sources                             :     22 records
   📈 Summary:
      Total records: 2132
      Empty tables: 7/13
   ```

2. **Export Data**
   ```bash
   pnpm tsx scripts/export-data-for-production.ts
   ```
   
   This creates `data-export.json` (~5-10 MB)

3. **Save Checkpoint**
   ```bash
   # In Manus UI, click "Save Checkpoint"
   # Or via API: webdev_save_checkpoint
   ```

### Phase 2: Publishing

1. **Click "Publish" in Manus Management UI**
   - Wait 2-3 minutes for production server to start
   - Note the production URL (e.g., `yeto.causewaygrp.com`)

2. **Verify Production Server is Running**
   ```bash
   curl -s https://yeto.causewaygrp.com | head -20
   ```

### Phase 3: Post-Deployment (Production)

1. **Upload Data Export File**
   - Copy `data-export.json` to production server
   - Or use S3 storage if available

2. **Import Data to Production Database**
   ```bash
   pnpm tsx scripts/import-data-to-production.ts
   ```

3. **Verify Import Success**
   ```bash
   pnpm tsx scripts/post-deployment-setup.ts
   ```
   
   Should show:
   ```
   ✅ Database is properly populated!
      All tables have data. The published site should display correctly.
   ```

4. **Verify in Management UI**
   - Go to Management UI → Database panel
   - Check that all tables show data (not "No data")
   - Verify record counts match expectations

5. **Test Published Site**
   - Visit https://yeto.causewaygrp.com
   - Verify KPI cards show real data
   - Check that all pages display correctly
   - Test both Arabic and English versions

---

## Database Contents

### Core Data Tables (Always Populated)

| Table | Records | Description |
|-------|---------|-------------|
| research_publications | 273 | Research papers, reports, briefs from 18 organizations |
| glossary_terms | 51 | Economic terms in Arabic and English |
| time_series | 1,778 | Economic indicators (2000-2025) |
| economic_events | 5 | Major economic events and milestones |
| users | 3 | Platform users and administrators |
| sources | 22 | Data sources and attribution |

### Runtime-Generated Tables (Empty Initially)

These tables are populated during normal operation:

| Table | Description |
|-------|-------------|
| indicators | Created when indicators are registered |
| documents | Created when documents are ingested |
| provenance_ledger_full | Created as data is validated |
| confidence_ratings | Generated during QA checks |
| data_vintages | Created during data versioning |
| scheduler_jobs | Created when jobs are scheduled |
| alerts | Generated when thresholds are breached |

---

## Troubleshooting

### Problem: "No data" in Management UI Database Panel

**Solution 1: Run Post-Deployment Setup**
```bash
pnpm tsx scripts/post-deployment-setup.ts
```

**Solution 2: Check Database Connection**
```bash
# Verify DATABASE_URL is set correctly
echo $DATABASE_URL

# Test connection
pnpm tsx scripts/post-deployment-setup.ts
```

**Solution 3: Run Import Script**
```bash
pnpm tsx scripts/import-data-to-production.ts
```

### Problem: Import Script Fails

**Check 1: Verify Export File Exists**
```bash
ls -lh data-export.json
```

**Check 2: Verify Database Permissions**
- Ensure the production database user has INSERT permissions
- Check that all tables exist (run migrations first)

**Check 3: Run Migrations**
```bash
pnpm db:push
```

### Problem: Some Tables Still Empty After Import

This is normal! Tables like `indicators`, `documents`, `provenance_ledger_full`, etc. are populated during runtime operations, not during initial import.

---

## Automated Deployment

To automate this process, add to your deployment script:

```bash
#!/bin/bash

# After publishing
echo "🚀 Starting production database population..."

# Run migrations
pnpm db:push

# Import data
pnpm tsx scripts/import-data-to-production.ts

# Verify
pnpm tsx scripts/post-deployment-setup.ts

echo "✅ Deployment complete!"
```

---

## Data Verification Checklist

Before declaring deployment successful:

- [ ] Post-deployment setup script shows 2,132+ records
- [ ] Management UI Database panel shows all tables with data
- [ ] Homepage displays KPI cards with real data:
  - [ ] GDP Growth: +0.8%
  - [ ] Inflation Rate: 15.0%
  - [ ] Exchange Rate: 1 USD = 2,050 YER
  - [ ] IDPs: 4.8M
- [ ] Research Library shows 273 publications
- [ ] Glossary shows 51 terms
- [ ] All sector pages display data
- [ ] Arabic version displays correctly (RTL)
- [ ] English version displays correctly (LTR)
- [ ] AI Assistant can access research data
- [ ] Evidence Pack buttons work on all charts

---

## Key Files

| File | Purpose |
|------|---------|
| `scripts/post-deployment-setup.ts` | Check database status |
| `scripts/export-data-for-production.ts` | Export dev data to JSON |
| `scripts/import-data-to-production.ts` | Import JSON to production |
| `data-export.json` | Exported data file (created by export script) |

---

## Contact & Support

For issues or questions:
- Email: yeto@causewaygrp.com
- GitHub: [YETO Platform Repository]
- Documentation: See `/docs/` directory

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-10 | 1.0.0 | Initial production deployment guide |

---

**Last Updated:** January 10, 2025 GMT+5
