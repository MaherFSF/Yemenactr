# Literature & Knowledge Base

## Overview

The YETO Literature & Knowledge Base is a comprehensive document management system that serves as the canonical source for all research documents, reports, and publications used by the platform. It provides structured access to evidence-based information for AI agents, VIP briefs, sector pages, and evidence packs.

## Architecture

### Database Schema

The system uses a multi-table schema designed for document versioning, citation tracking, and bilingual support:

| Table | Purpose |
|-------|---------|
| `library_documents` | Master document records with metadata |
| `library_document_versions` | Version history and extracted content |
| `library_citation_anchors` | Citable snippets with page references |
| `library_extracted_tables` | Structured data extracted from documents |
| `library_document_translations` | Bilingual translations with QA metrics |
| `library_ingestion_runs` | Ingestion pipeline audit trail |

### Document Types

The system supports the following document types:

- **report**: Comprehensive research reports
- **working_paper**: Academic working papers
- **policy_brief**: Policy analysis documents
- **dataset_doc**: Dataset documentation
- **sitrep**: Situation reports (humanitarian)
- **evaluation**: Program evaluations
- **annex**: Supporting annexes
- **law_regulation**: Legal documents
- **bulletin**: Statistical bulletins
- **circular**: Official circulars
- **press_release**: Press releases
- **academic_paper**: Peer-reviewed papers
- **thesis**: Academic theses
- **methodology_note**: Methodology documentation
- **other**: Uncategorized documents

### License Flags

Documents are tagged with license information:

- **open**: Full text available for display and AI use
- **restricted_metadata_only**: Only metadata can be shown
- **unknown_requires_review**: Pending license review

## Ingestion Pipelines

### World Bank Documents API

The system ingests documents from the World Bank Documents & Reports API:

1. Query API for Yemen-related documents
2. Extract metadata (title, date, type, authors)
3. Download PDF when available
4. Store in S3 with content hash
5. Queue for text extraction

### ReliefWeb Reports API

Humanitarian reports are ingested from ReliefWeb:

1. Query API for Yemen situation reports
2. Map report types to YETO taxonomy
3. Extract attachments and metadata
4. Store and process PDFs

### Manual Upload

Administrators can manually upload documents through the Library Console:

1. Upload PDF/document file
2. Enter metadata (title, publisher, type)
3. System extracts text and tables
4. Document enters QA queue

## Citation Anchor System

### Anchor Types

Citation anchors are extracted snippets that can be referenced:

- **key_finding**: Important research findings
- **statistic**: Numerical data points
- **definition**: Term definitions
- **methodology**: Methodology descriptions
- **recommendation**: Policy recommendations
- **quote**: Direct quotes

### Anchor ID Format

Anchors use a stable ID format for citation:

```
{docId}:{versionNumber}:p{pageNumber}:{anchorType}:{sequence}
```

Example: `doc_wb_2024_001:1:p15:statistic:003`

### Confidence Levels

Each anchor has a confidence rating:

- **high**: Verified by human review
- **medium**: AI-extracted with high certainty
- **low**: AI-extracted, needs review

## Table Extraction

### Extraction Methods

Tables are extracted using multiple methods:

- **camelot**: PDF table extraction library
- **tabula**: Alternative PDF extraction
- **ocr_table**: OCR-based extraction for scanned documents
- **manual**: Manually entered tables

### Quality Ratings

Extracted tables are rated for quality:

- **high**: Clean extraction, verified
- **medium**: Minor issues, usable
- **low**: Significant issues, needs review

### Table Promotion

High-quality tables can be promoted to datasets:

1. Review extraction quality
2. Map columns to indicators
3. Create dataset record
4. Link to source document

## Translation System

### Bilingual Support

All documents support English and Arabic:

- Original language preserved
- AI translation with human review
- Glossary enforcement for consistency

### Glossary Adherence

Translations are checked against the YETO glossary:

1. Extract technical terms
2. Compare against glossary
3. Flag inconsistencies
4. Calculate adherence score

### Numeric Integrity

Translation quality includes numeric checks:

- Numbers must match between languages
- Dates must be equivalent
- Percentages must be preserved

## RAG Context Packs

### Context Pack Building

AI agents receive context packs with relevant documents:

1. Query specifies sector/entity/topic
2. System retrieves relevant documents
3. Anchors and tables included
4. Token budget respected

### Pack Format

Context packs include:

- Document summaries
- Key citation anchors
- Table references
- Citation guidelines

### Usage Tracking

Context pack usage is tracked for analytics:

- Agent type
- Usage context
- Documents included
- User feedback

## Admin Library Console

### Features

The admin console provides:

- Document search and filtering
- Status management (draft → review → published)
- Ingestion pipeline controls
- Table review queue
- Translation QA queue
- Statistics dashboard

### Access Control

Library management requires admin role:

- View all document statuses
- Modify document metadata
- Run ingestion pipelines
- Approve translations

## Public Research Hub

### Features

Public users can access:

- Document search with filters
- Document detail pages
- Citation anchor viewing
- Table previews
- Download links (where permitted)

### Filtering Options

- By sector
- By year
- By publisher
- By document type
- By language
- By license type

## API Endpoints

### Public Endpoints

| Endpoint | Description |
|----------|-------------|
| `library.searchDocuments` | Search with filters |
| `library.getDocument` | Get document details |
| `library.getDocumentVersions` | Get version history |
| `library.getAnchorsForVersion` | Get citation anchors |
| `library.getTablesForVersion` | Get extracted tables |

### Admin Endpoints

| Endpoint | Description |
|----------|-------------|
| `library.ingestWorldBank` | Run World Bank ingestion |
| `library.ingestReliefWeb` | Run ReliefWeb ingestion |
| `library.updateDocumentStatus` | Change document status |
| `library.getDocumentStatistics` | Get statistics |
| `library.getIngestionStatistics` | Get ingestion stats |

## Quality Metrics

### Coverage Score

Documents are scored for coverage:

- Sector relevance
- Temporal coverage
- Source diversity
- Citation density

### Freshness Score

Document freshness is tracked:

- Publication date
- Last update
- Ingestion date
- Review date

## Integration Points

### Sector Pages

Sector pages pull evidence from the library:

- Key documents for sector
- Recent publications
- Citation anchors for claims

### AI Agents

AI agents receive context packs:

- Sector-specific documents
- Entity-related reports
- Query-matched content

### VIP Briefs

Executive briefs cite library documents:

- Source attribution
- Anchor references
- Confidence levels

## Maintenance

### Regular Tasks

- Daily: Run ingestion pipelines
- Weekly: Review QA queues
- Monthly: Audit coverage gaps
- Quarterly: Update glossary

### Monitoring

Track system health:

- Ingestion success rates
- Translation quality scores
- Table extraction accuracy
- API response times
