# YETO Operations Playbook

**Version**: 2.0  
**Last Updated**: February 5, 2026  
**Maintainer**: Manus (Principal Architect)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Daily Operations](#daily-operations)
3. [Document Vault Operations](#document-vault-operations)
4. [Numeric Data Backfill](#numeric-data-backfill)
5. [Source Registry Management](#source-registry-management)
6. [Ingestion Health Monitoring](#ingestion-health-monitoring)
7. [Gap & Contradiction Management](#gap--contradiction-management)
8. [Partnership Access Workflow](#partnership-access-workflow)
9. [AI Agent Operations](#ai-agent-operations)
10. [Emergency Procedures](#emergency-procedures)

---

## System Overview

### Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    YETO PLATFORM STACK                          │
├─────────────────────────────────────────────────────────────────┤
│ Frontend: React + TypeScript + Vite                            │
│ Backend: Express + TRPC + Drizzle ORM                          │
│ Database: MySQL 8.0                                            │
│ Storage: S3 (documents, artifacts)                             │
│ AI: OpenAI GPT-4 (via Anthropic API)                          │
│ Search: Hybrid (keyword + embedding)                           │
└─────────────────────────────────────────────────────────────────┘
```

### Environment Variables (Required)
```bash
# Database
DATABASE_URL=mysql://user:pass@host:3306/yeto_db

# S3 Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=yeto-documents

# AI
ANTHROPIC_API_KEY=...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# App
NODE_ENV=production
PORT=3000
SESSION_SECRET=...
```

---

## Daily Operations

### Morning Checklist (09:00 UTC)
1. **Check Release Gate**: Visit `/admin/release-gate`
   - Evidence coverage >= 95%
   - Registry lint: 0 errors
   - No critical gaps
   
2. **Review Overnight Jobs**:
   - Sector context packs built (17 sectors)
   - Document ingestion completed
   - Numeric backfill progress
   
3. **Check Ingestion Health**: Visit `/admin/operations-command-center`
   - All ACTIVE sources fetched in last 24h
   - Error rate < 5%
   - No stuck jobs in work queue

### Nightly Jobs (Automated)
```cron
# Sector context pack builder (01:00 UTC)
0 1 * * * node scripts/build-sector-context-packs.mjs

# Document backfill runner (02:00 UTC)
0 2 * * * node scripts/run-document-backfill.mjs

# Numeric backfill runner (03:00 UTC)
0 3 * * * node scripts/run-numeric-backfill.mjs

# Registry lint check (04:00 UTC)
0 4 * * * node scripts/run-registry-lint.mjs

# Stuck job recovery (every hour)
0 * * * * node scripts/reset-stuck-jobs.mjs
```

---

## Document Vault Operations

### Ingestion Path by Product Type

| Product Type | Ingestion Path | RAG Indexing | Visibility |
|--------------|----------------|--------------|------------|
| DOC_PDF | Document Vault | Yes | License-based |
| DOC_NARRATIVE | Document Vault | Yes | License-based |
| DOC_EXCEL | Document Vault | Tables only | License-based |
| NEWS_MEDIA | News Aggregator → Document Vault | Yes | Public |
| DATA_NUMERIC | Numeric pipeline | No | Public |
| SANCTIONS_LIST | Compliance module | No | Internal only |

### Document Ingestion Workflow

1. **Source Selection**:
   ```sql
   SELECT sp.* FROM source_products sp
   JOIN source_registry sr ON sp.sourceRegistryId = sr.id
   WHERE sp.productType IN ('DOC_PDF', 'DOC_NARRATIVE', 'DOC_EXCEL')
     AND sp.isActive = true
     AND sr.status = 'ACTIVE';
   ```

2. **Year-by-Year Backfill**:
   - Priority years: 2026 → 2020
   - Historical: 2019 → 2010
   - Plan tracked in `document_backfill_plan` table

3. **Per Document Processing**:
   - Raw snapshot stored in S3: `documents/{docId}/{filename}`
   - SHA256 hash computed for deduplication
   - Retrieval timestamp logged
   - OCR if scanned (quality threshold: 80%)
   - Bilingual text: Original + translated (glossary-aware)
   - Chunking: 500 words per chunk, 100 word overlap
   - Hybrid index: Keyword (TF-IDF) + Embedding (vector)
   - Evidence pack created with citation anchors (page/table/section)

4. **Storage Structure**:
   ```
   S3 Bucket: yeto-documents/
   ├── raw/
   │   └── {docId}/
   │       └── original.pdf
   ├── extracted/
   │   └── {docId}/
   │       ├── text.txt
   │       └── tables.json
   ├── translated/
   │   └── {docId}/
   │       └── text_ar.txt
   └── embeddings/
       └── {docId}/
           └── vectors.bin
   ```

### Access Control by License

| License | Free Tier | Researcher | Institutional |
|---------|-----------|------------|---------------|
| Open / CC-BY | ✅ Download | ✅ Download | ✅ Download |
| CC-BY-NC | ✅ View only | ✅ Download | ✅ Download |
| Restricted | ❌ | ✅ View only | ✅ Download |
| Proprietary | ❌ | ❌ | ✅ View only |

---

## Numeric Data Backfill

### Backfill Strategy

**Priority Order**:
1. Flagship indicators (GDP, CPI, FX, unemployment)
2. Sector-critical indicators
3. Supporting indicators
4. Nice-to-have indicators

**Year Order**: 2026 → 2025 → 2024 → 2023 → 2022 → 2021 → 2020 → 2019 → ... → 2010

**Frequency Handling**:
- Store at native frequency (daily/weekly/monthly/quarterly/annual)
- Never interpolate missing months
- Use day/month spine for gap detection only

### Backfill Execution

```bash
# Create checkpoints
npm run backfill:plan-numeric

# Run backfill (single year)
npm run backfill:numeric -- --year=2025

# Run backfill (range)
npm run backfill:numeric -- --start=2020 --end=2025

# Resume from checkpoint
npm run backfill:resume -- --checkpoint-id=123
```

### Regime Tag Enforcement

**NEVER merge Aden/Sana'a data**. Always store separately:
- `regime_tag = 'aden_irg'` - Government data
- `regime_tag = 'sanaa_defacto'` - De facto authority data
- `regime_tag = 'mixed'` - Both regions (rare)
- `regime_tag = 'unified'` - Pre-2015 data

### Contradiction Detection

When multiple sources provide the same indicator/date/regime:
- Calculate variance: `|valueA - valueB| / valueA * 100`
- If variance > 15%: Store BOTH values + create contradiction record
- NEVER average silently
- Display both values in UI with "disagreement mode" indicator

Example:
```
CPI (Aden, Jan 2025):
Source A (CBY Aden): 245.3 (±2%)
Source B (WFP): 267.8 (±5%)
Variance: 9.2% ⚠️ Under threshold, both shown
```

---

## Source Registry Management

### Importing Registry from Excel

**File**: `/workspace/data/registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx`

**Command**:
```bash
# Via admin UI (recommended)
# Visit: https://yeto.causewaygrp.com/admin/source-import-console
# Click: "Import from Excel"

# Via TRPC
curl -X POST https://yeto.causewaygrp.com/api/trpc/canonicalRegistry.importFromCanonicalExcel
```

**Expected Output**:
- 292 sources imported/updated
- 17 sectors initialized
- 600+ sector mappings created
- 300+ endpoints imported
- 400+ products imported
- 0 lint errors

### Adding a New Source

1. **Add to Excel**: Edit `YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx`
   - Add row to SOURCES_MASTER_EXT
   - Add sector mappings to SOURCE_SECTOR_MATRIX_292
   - Add endpoints to SOURCE_ENDPOINTS
   - Add products to SOURCE_PRODUCTS

2. **Import**: Run import from admin console

3. **Verify**: Check `/admin/registry-diff` for changes

4. **Activate**: Update source status to ACTIVE

### Registry Lint (PIPE_REGISTRY_LINT)

**Rules**:
1. ❌ **ERROR**: Missing name
2. ❌ **ERROR**: Invalid enum values
3. ❌ **ERROR**: ACTIVE source without endpoint (unless manual/partner)
4. ⚠️ **WARNING**: needsPartnership=true but no contact
5. ⚠️ **WARNING**: Missing allowedUse

**Run lint**:
```bash
npm run registry:lint
```

**CI Integration**: Lint runs automatically on every push, fails CI if errors exist.

---

## Ingestion Health Monitoring

### Per-Source Monitoring

Visit: `/admin/operations-command-center` → Health tab

**Metrics Tracked**:
- Last successful fetch timestamp
- Error rate (last 7 days)
- Records fetched (last run)
- Cost estimate (API calls * rate)
- Latency (p50, p95, p99)

**Alerts**:
- 🔴 Source not fetched in > 2x expected frequency
- 🟡 Error rate > 10%
- 🟡 Latency > 10 seconds

### Endpoint Health

**Check endpoint status**:
```sql
SELECT 
  sr.name,
  se.endpointType,
  se.url,
  se.lastVerified,
  DATEDIFF(NOW(), se.lastVerified) as days_since_verified
FROM source_endpoints se
JOIN source_registry sr ON se.sourceRegistryId = sr.id
WHERE se.isActive = true
  AND (se.lastVerified IS NULL OR se.lastVerified < DATE_SUB(NOW(), INTERVAL 30 DAY))
ORDER BY days_since_verified DESC;
```

---

## Gap & Contradiction Management

### Gap Ticket Workflow

1. **Gap Detection**: Automated via coverage map
2. **Ticket Creation**: Auto-created or manual via `/admin/gap-tickets`
3. **Assignment**: Assign to owner agent or analyst
4. **Resolution**: Add recommended source or mark as unavoidable
5. **Closure**: Verify data ingested, close ticket

**Gap Priority**:
- P0: Critical indicator missing (e.g., GDP, CPI)
- P1: Important sector data missing
- P2: Nice-to-have data missing

### Contradiction Management

Visit: `/admin/operations-command-center` → Conflicts tab

**Workflow**:
1. **Detection**: Automatic when variance > 15%
2. **Review**: Analyst investigates sources
3. **Explanation**: Document reason for difference
4. **Resolution**: Keep both values OR mark one as incorrect

**Never**: Average contradicting values without explicit methodology

---

## Partnership Access Workflow

### For Sources Marked NEEDS_KEY

1. **Create Access Request**:
   ```bash
   # Visit: /admin/source-registry
   # Click source → "Request Access"
   ```

2. **Draft Email Generated**:
   - To: Source contact or `partnerships@causewaygrp.com`
   - CC: `ceo@causewaygrp.com`
   - Template: Partnership request with YETO introduction

3. **Email Queue**:
   - Stored in `email_outbox` table
   - Status: QUEUED (sent when SMTP configured)
   - Manual send if SMTP not available

4. **Follow-up**: Track response in `partnership_access_requests` table

---

## AI Agent Operations

### Sector Context Packs (Nightly)

**Generated at**: 01:00 UTC daily

**Contents**:
- Top 10 indicator changes (last 30 days)
- Top 10 recent documents (last 90 days)
- Active contradictions (variance > 15%)
- Open gap tickets
- Example questions per sector

**Build command**:
```bash
npm run context-packs:build-all
```

**Verification**:
```sql
SELECT 
  sectorCode,
  packVersion,
  generatedAt,
  validUntil,
  JSON_LENGTH(topIndicators) as indicator_count,
  JSON_LENGTH(recentDocuments) as doc_count
FROM sector_context_packs
WHERE validUntil > NOW()
ORDER BY generatedAt DESC;
```

### AI Response Policy

**Hard Rules**:
1. ✅ Must cite evidence pack IDs for every claim
2. ✅ If evidence < 95%: Respond "Insufficient evidence" + suggest gap ticket
3. ❌ Cannot invent numbers or dates
4. ❌ Cannot provide legal/medical/financial advice
5. ✅ Must show confidence score + DQAF panel

**Audit**:
- Every response logged to `ai_audit_log`
- Citation count tracked
- Policy checks recorded

---

## Emergency Procedures

### System Down
1. Check database: `mysql -u root -p yeto_db`
2. Check processes: `pm2 status` or `docker ps`
3. Check logs: `tail -f /var/log/yeto/app.log`
4. Restart: `pm2 restart yeto` or `docker-compose restart`

### Stuck Ingestion Jobs
```bash
# Identify stuck jobs
npm run work-queue:list-stuck

# Reset to PENDING
npm run work-queue:reset-stuck

# Or manually
mysql> UPDATE ingestion_work_queue SET state = 'PENDING', updatedAt = NOW() WHERE state = 'RUNNING' AND startedAt < DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

### Data Corruption Detected
1. **Identify affected records**: Check `provenance_log` and `corrections` tables
2. **Create correction**: Via `/admin/corrections`
3. **Publish correction**: Public changelog entry
4. **Re-ingest**: Queue backfill job for affected period

### Registry Drift Detected
1. **Check diffs**: Visit `/admin/registry-diff`
2. **Identify source**: Review `registry_diff_log`
3. **Fix**: Update Excel, re-import
4. **Verify**: Run `PIPE_REGISTRY_LINT`

---

## Monitoring & Alerts

### Critical Alerts
- 🔴 Evidence coverage drops below 90%
- 🔴 Registry lint fails (ERROR-level issues)
- 🔴 >10 stuck jobs in work queue
- 🔴 S3 storage unavailable

### Warning Alerts
- 🟡 Source not fetched in 2x expected frequency
- 🟡 >20 open gap tickets
- 🟡 >10 unresolved contradictions
- 🟡 API key expiring in <30 days

### Info Notifications
- 🟢 Nightly jobs completed successfully
- 🟢 New documents ingested
- 🟢 Registry imported successfully

---

## Safe Publishing Checklist

Before publishing any update:
- [ ] Evidence coverage >= 95%
- [ ] Registry lint: 0 errors
- [ ] No P0 gap tickets
- [ ] Contradictions reviewed
- [ ] AR/EN parity checked
- [ ] Exports tested (signed URLs work)
- [ ] Admin release gate: GREEN

---

**Document Owner**: Manus  
**Review Cycle**: Monthly  
**Version Control**: Git-tracked in `/workspace/docs/`
