# YETO Operations Playbook

## Document Vault Operations

### Overview

The Document Vault is a comprehensive knowledge base system that ingests, processes, and indexes documents from Yemen's economic and humanitarian sectors. Every document is searchable, citable, bilingual, and linked to indicators/events/entities.

### Architecture

```
Document Vault Pipeline:
┌─────────────────┐
│ Source Products │ → Deterministic ingestion by allowedUse
└────────┬────────┘
         ↓
┌─────────────────┐
│ Backfill Plans  │ → Year-by-year capture planning (2026→2020 priority)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Document Ingest │ → Storage + SHA256 + retrieval timestamp
└────────┬────────┘
         ↓
┌─────────────────┐
│ Processing      │ → OCR → Translate → Chunk → Embed → Index
└────────┬────────┘
         ↓
┌─────────────────┐
│ Evidence Pack   │ → Citation anchors (page/section/table)
└─────────────────┘
```

### Ingestion Paths by allowedUse

The system routes documents through different pipelines based on their `allowedUse` type:

| allowedUse | Pipeline Components |
|-----------|-------------------|
| `DATA_NUMERIC` | Data extraction only |
| `DOC_PDF` | OCR → Text extraction |
| `DOC_NARRATIVE` | OCR → Translation → Chunking → Embeddings → Search index |
| `NEWS_MEDIA` | Media processing → Translation → Chunking → Embeddings |
| `EVENT_DETECTION` | Event extraction from text |
| `METADATA_ONLY` | Catalog only, no processing |

### Source Product Configuration

#### Creating a Source Product

```typescript
POST /api/document-vault/source-products
{
  "sourceId": 123,
  "productType": "monthly_report",
  "productName": "Central Bank Monthly Statistical Bulletin",
  "productNameAr": "النشرة الإحصائية الشهرية للبنك المركزي",
  "allowedUse": ["DOC_NARRATIVE", "DATA_NUMERIC"],
  "publishingFrequency": "monthly",
  "historicalStartYear": 2010,
  "historicalEndYear": 2026,
  "sectorTags": ["banking", "monetary_policy"],
  "regimeTag": "aden",
  "visibility": "public",
  "license": "open"
}
```

#### Backfill Priority

The system automatically prioritizes document capture:

1. **Critical/High Priority (2026→2020)**: Recent years for real-time analysis
2. **Medium Priority (2019→2010)**: Historical data for trend analysis
3. **Low Priority (<2010)**: Archive material

### Document Processing Pipeline

#### 1. Ingestion

Documents are ingested either:
- **Automatic**: Scheduled backfill jobs check for new documents
- **Manual**: Admin upload through `/api/document-vault/upload`

Storage:
- Raw artifacts: `documents/raw/{product_id}/{year}/{filename}`
- SHA256 hash for deduplication
- Retrieval timestamp for provenance

#### 2. OCR Extraction

For scanned PDFs (`DOC_PDF`):
```
Status: pending → processing → completed/failed
```

Extracted text stored as artifact:
- Type: `ocr_extracted`
- Storage: `documents/ocr/{document_id}/extracted.txt`

#### 3. Translation

For narrative documents (`DOC_NARRATIVE`):
```
Translation pipeline:
1. Load glossary terms (EN↔AR mappings)
2. Translate with LLM (preserving technical terms)
3. Store bilingual content
```

Glossary preservation ensures terms like:
- "Central Bank of Yemen" → "البنك المركزي اليمني"
- "inflation rate" → "معدل التضخم"
- "exchange rate" → "سعر الصرف"

#### 4. Chunking

Documents split into searchable chunks:
- Size: ~500 words per chunk
- Anchors: page, section, paragraph, table, figure
- Bilingual: both EN and AR text stored

#### 5. Embeddings

Semantic embeddings generated for each chunk:
- Model: `text-embedding-3-small` (1536 dimensions)
- Used for hybrid search (keyword + semantic)

#### 6. Search Indexing

Full-text search index created:
- Title (EN + AR)
- Full text (EN + AR)
- Metadata filters (sector, year, regime, visibility)

#### 7. Evidence Pack Creation

Each document gets an evidence pack with:
- Citation anchors (page/section/table references)
- Provenance (source, retrieval date, license)
- Confidence grade
- DQAF compliance

### Search Operations

#### Hybrid Search

Combines keyword and semantic search:

```typescript
GET /api/document-vault/documents?q=inflation+rate&language=both&sectors=banking
```

Filters:
- `language`: `en`, `ar`, `both`
- `sectors`: Array of sector tags
- `regimeTag`: `aden`, `sanaa`, `both`, `international`
- `yearFrom`, `yearTo`: Date range
- `visibility`: `public`, `restricted`, `internal`

#### Search Quality Testing

Run regression tests:
```typescript
POST /api/document-vault/search/regression-test
```

Tests 10 queries (5 EN + 5 AR) and verifies:
- Result count > 0
- Top relevance score > 50
- Glossary term preservation

### Evidence Gate (95% Confidence Threshold)

All AI responses must pass through evidence verification:

```typescript
POST /api/document-vault/evidence-gate
{
  "responseText": "The inflation rate reached 45% in 2023.",
  "claim": "inflation rate 2023",
  "minConfidencePercent": 95
}
```

Response:
```typescript
{
  "canPublish": boolean,
  "verdict": "PASS" | "PASS_WARN" | "FAIL",
  "confidencePercent": number,
  "citationCoverage": number,
  "evidencePackIds": number[],
  "documentIds": number[],
  "publishableText": string,
  "warnings": string[],
  "dataGapTickets": Array<{ missingField, suggestedSources, priority }>
}
```

**Hard Gate Rules**:
- `confidencePercent >= 95` && `citationCoverage >= 95` → **PASS**
- `confidencePercent >= 85` && `citationCoverage >= 85` → **PASS_WARN**
- Otherwise → **FAIL** (return "Insufficient Evidence" message + data gap tickets)

### Monitoring & Maintenance

#### Admin Dashboard

Access: `/admin/document-vault`

Metrics:
- Running jobs
- Completed/failed jobs
- Pending backfill plans
- Document processing status
- Search index health

#### Background Jobs

Job types:
- `backfill_scan`: Check for new documents to ingest
- `document_ingest`: Ingest a specific document
- `document_process`: Process an ingested document
- `ocr_extract`: Run OCR on scanned PDF
- `translate`: Translate to Arabic
- `chunk_index`: Create chunks and index
- `embedding_generate`: Generate embeddings
- `search_index_rebuild`: Rebuild search index

Monitor jobs:
```typescript
GET /api/document-vault/jobs
```

#### Health Checks

Check vault statistics:
```typescript
GET /api/document-vault/stats
```

Returns:
- Documents by processing status
- Backfill plans by status
- Source products count
- Index health

### Troubleshooting

#### Document Not Appearing in Search

1. Check processing status:
   ```
   GET /api/document-vault/documents/{id}
   ```

2. Verify indexing completed:
   ```
   Status should be: processingStatus="completed", indexingStatus="completed"
   ```

3. Rebuild search index:
   ```
   POST /api/document-vault/documents/{id}/process
   ```

#### OCR Failed

1. Check artifact type:
   - Is it actually a scanned PDF?
   - Is the scan quality sufficient?

2. Manual retry:
   ```
   POST /api/document-vault/documents/{id}/process
   ```

3. If still failing, mark as `not_needed` and manually upload text

#### Translation Not Preserving Glossary Terms

1. Verify glossary terms exist:
   ```
   SELECT * FROM glossary_terms WHERE termEn LIKE '%keyword%'
   ```

2. Add missing terms to glossary

3. Re-translate:
   ```
   UPDATE documents SET translationStatus='pending' WHERE id={id}
   POST /api/document-vault/documents/{id}/process
   ```

#### Search Returning No Results

1. Check if documents are indexed:
   ```
   SELECT COUNT(*) FROM document_search_index WHERE visibility='public'
   ```

2. Run search regression test:
   ```
   POST /api/document-vault/search/regression-test
   ```

3. Check query language matches document language

### Security & Visibility

#### Document Visibility Levels

- **public**: Searchable by all users
- **restricted**: Searchable by authenticated users only
- **internal**: Admin/partner access only

#### License Enforcement

- Never bypass paywalls or logins
- Respect `license` field on source products
- Check `visibility` before serving documents

### Backup & Recovery

#### Raw Documents

All raw documents stored with:
- Original file in S3/storage
- SHA256 hash for integrity
- Retrieval URL for re-download

#### Database Backup

Key tables to backup:
- `documents`
- `document_artifacts`
- `document_chunks`
- `document_embeddings`
- `document_search_index`
- `document_backfill_plans`
- `source_products`

#### Disaster Recovery

1. Restore database from backup
2. Raw files already in S3/storage
3. Rebuild search index:
   ```
   For each document:
     POST /api/document-vault/documents/{id}/process
   ```

### Performance Optimization

#### Indexing Performance

- Batch process: Process multiple documents in parallel
- Priority queue: Process critical/high priority first
- Incremental indexing: Only reindex changed documents

#### Search Performance

- Use filters to reduce search space
- Cache frequent queries
- Paginate results (limit + offset)

#### Storage Optimization

- Lifecycle policy: Archive old raw files to cold storage
- Deduplication: SHA256 prevents duplicate storage
- Compression: Compress text artifacts

### API Reference

See [API Documentation](./API.md) for complete endpoint reference.

### Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Data Pipeline](./DATA_PIPELINE.md)
- [Evidence Tribunal](./EVIDENCE_TRIBUNAL.md)
- [Translation Guide](./TRANSLATION.md)

---

**Last Updated**: 2026-02-05  
**Maintainer**: Manus (Lead Data Engineer)
