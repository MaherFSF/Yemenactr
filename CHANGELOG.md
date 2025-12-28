# Changelog

All notable changes to the YETO Platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2024-12-28

### 🎉 Initial Release

The first production-ready release of YETO (Yemen Economic Transparency Observatory).

---

### Added

#### Core Platform

- **Bilingual Support**: Arabic-first design with full RTL support, English LTR available
- **Evidence-Only Architecture**: Every data point links to verifiable Evidence Pack
- **15 Economic Sectors**: Comprehensive coverage including Banking, Trade, Agriculture, Energy, and more
- **47+ Data Sources**: Aggregated from World Bank, OCHA, IMF, CBY, and local institutions
- **1.2M+ Data Points**: Time series, geospatial, and event data

#### User Interface

- **Landing Page**: Hero section with live statistics ticker
- **Dashboard**: Real-time KPIs with sparklines and trend indicators
- **Sector Pages**: Detailed analysis for each economic sector
- **Data Repository**: Searchable database with advanced filters
- **Research Hub**: Document library with semantic search
- **AI Assistant**: Natural language queries with evidence-backed responses
- **Scenario Simulator**: "What-if" analysis with transparent assumptions
- **Timeline Explorer**: Historical trends and event correlation
- **Entity Profiles**: Detailed profiles for key economic actors

#### Data Governance (Section 8 - The Trust Engine)

- **8A - Provenance Ledger**: W3C PROV-compliant data lineage tracking
  - Source attribution and access method tracking
  - Transformation pipeline documentation
  - QA check recording
  - License and terms management
  
- **8B - Confidence Ratings**: A-D grade system
  - Five-dimension weighted scoring
  - Source credibility (25%)
  - Data completeness (20%)
  - Timeliness (20%)
  - Consistency (20%)
  - Methodology (15%)
  
- **8C - Contradiction Detector**: Discrepancy identification
  - Automatic detection between sources
  - Severity classification (minor/significant/major/critical)
  - Plausible reason suggestions
  - Resolution workflow
  
- **8D - Data Vintages**: Point-in-time queries
  - "What was known when" analysis
  - Revision history tracking
  - Change type classification
  - Temporal queries support
  
- **8E - Public Changelog**: Transparency updates
  - RSS feed support
  - Impact level classification
  - Bilingual entries
  - Related entity linking

#### Hardening (Section 9 - Production Readiness)

- **9A - Monitoring & Observability**
  - Health check endpoints (/health, /ready, /live)
  - System metrics collection (CPU, memory, requests)
  - Request logging with correlation IDs
  - Error tracking and deduplication
  - Alert configuration and management
  - Performance metrics (response times, throughput)
  
- **9B - Backup & Recovery**
  - Automated backup scheduling (daily full, hourly incremental)
  - Point-in-time recovery support
  - Backup verification and integrity checks
  - Retention policy management
  - Recovery point creation
  - Recovery operation tracking
  
- **9C - Performance Optimization**
  - LRU cache with TTL support
  - Rate limiting (API, auth, export, AI)
  - Query optimization tracking
  - Slow query identification
  - Compression recommendations
  - Benchmark utilities
  - Lazy loading support
  
- **9D - Security Hardening**
  - CSRF protection with single-use tokens
  - Security headers (CSP, HSTS, X-Frame-Options, etc.)
  - Input sanitization (XSS, SQL injection prevention)
  - Brute force protection
  - API key management with rotation
  - Security audit logging
  - Security scanner with grading

#### Testing

- **57 Unit Tests** across governance and hardening modules
- **15 Governance Tests**: Provenance, confidence, contradictions, vintages, changelog
- **42 Hardening Tests**: Monitoring, backup, performance, security, integration

#### Documentation

- Comprehensive README with architecture diagrams
- API reference documentation
- Requirements traceability matrix
- User journey documentation
- Mockup mapping documentation

---

### Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui |
| Backend | Node.js 22, Express 4, tRPC 11, Drizzle ORM |
| Database | TiDB (MySQL-compatible) |
| Storage | S3-compatible |
| Testing | Vitest |

---

### Database Schema

New tables added for governance and hardening:

```sql
-- Section 8: Data Governance
provenance_ledger_full
confidence_ratings
data_contradictions
data_vintages
public_changelog

-- Existing tables enhanced
time_series (with provenance linking)
sources (with confidence metadata)
```

---

### API Endpoints

#### Governance Router (`/api/trpc/governance.*`)

| Procedure | Type | Description |
|-----------|------|-------------|
| `getProvenance` | Query | Get provenance for a data point |
| `createProvenance` | Mutation | Create provenance entry |
| `getConfidenceRating` | Query | Get confidence rating |
| `calculateConfidence` | Mutation | Calculate confidence score |
| `getContradictions` | Query | List contradictions |
| `detectContradictions` | Mutation | Run contradiction detection |
| `getVintages` | Query | Get data vintages |
| `getValueAsOf` | Query | Point-in-time query |
| `getChangelog` | Query | Get public changelog |
| `getChangelogRSS` | Query | Get RSS feed |

#### Monitoring Router (`/api/trpc/monitoring.*`)

| Procedure | Type | Description |
|-----------|------|-------------|
| `getHealth` | Query | System health status |
| `getLiveness` | Query | Kubernetes liveness probe |
| `getReadiness` | Query | Kubernetes readiness probe |
| `getMetrics` | Query | System metrics |
| `getAlerts` | Query | Active alerts |
| `acknowledgeAlert` | Mutation | Acknowledge alert |

---

### Security Measures

- **Content Security Policy**: Strict CSP with report-uri
- **HSTS**: 1-year max-age with includeSubDomains
- **Rate Limiting**: 100 req/min API, 5 req/15min auth
- **Brute Force**: 5 attempts, 30-minute lockout
- **Input Validation**: Zod schemas on all inputs
- **Audit Logging**: All security events logged

---

### Known Limitations

1. **Data Sources**: Some sources require manual refresh
2. **AI Assistant**: Rate limited to 10 queries/minute
3. **Export**: Large exports may timeout (>100k rows)
4. **Maps**: Requires Google Maps API key for full features

---

### Migration Notes

This is the initial release. No migration required.

---

## [Unreleased]

### Planned

- [ ] Automated data source connectors
- [ ] Real-time collaboration features
- [ ] Mobile application
- [ ] Advanced ML-based anomaly detection
- [ ] Multi-tenant support

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2024-12-28 | Initial production release |

---

*For questions or support, contact: yeto@causewaygrp.com*
