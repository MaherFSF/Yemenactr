# YETO Data Storage Policy

## Overview

This document defines what data belongs in GitHub vs S3 storage for the YETO platform.

## What Goes in GitHub

**Source Code Only:**
- All `.ts`, `.tsx`, `.js`, `.jsx` files
- Configuration files (`.json`, `.yaml`, `.yml` under 500KB)
- Documentation (`.md` files)
- Schema definitions (`drizzle/schema.ts`, `drizzle/schema.sql`)
- Test files (`*.test.ts`)
- CI/CD workflows (`.github/`)
- Small static assets (icons, favicons under 100KB)

**Size Limits:**
- Individual files: < 500KB recommended, < 1MB maximum
- Total repository: < 100MB (excluding git history)

## What Goes in S3

**Large Binary Assets:**
- Generated images (`client/public/images/generated/`)
- Sector images (`client/public/images/sectors/`)
- Event images (`client/public/images/events/`)
- Yemen photos (`client/public/images/yemen/`)
- Brand assets > 500KB (`causeway-brand.png`, `yeto-logo.png`)
- PDF documents (`public/documents/`, `client/public/docs/`)
- Excel files (`*.xlsx`)
- Research files (`data/research_files/`)
- CBY publications (`cby-publications/`)

**Data Exports:**
- `data-export.json`
- Large JSON datasets
- CSV exports > 100KB

## Database References

For S3-stored assets, the database should contain:
- `s3_key`: The S3 object key
- `s3_url`: The public or presigned URL
- `mime_type`: Content type
- `file_size`: Size in bytes
- `uploaded_at`: Timestamp
- `metadata`: JSON with additional info (dimensions, pages, etc.)

## Migration Plan

1. **Phase 1 (Current):** Remove large files from git tracking
2. **Phase 2:** Upload existing large files to S3
3. **Phase 3:** Update database with S3 references
4. **Phase 4:** Update frontend to use S3 URLs

## S3 Bucket Structure

```
s3://yeto-assets/
├── images/
│   ├── generated/
│   ├── sectors/
│   ├── events/
│   ├── yemen/
│   └── brand/
├── documents/
│   ├── banking/
│   ├── research/
│   └── publications/
├── exports/
│   └── data/
└── uploads/
    └── user/
```

## Environment Variables

Required for S3 access:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET`

These are already configured in the platform.
