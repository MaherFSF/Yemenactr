# YETO Platform Administrator Manual

## Overview

This manual provides comprehensive guidance for administrators of the Yemen Economic Transparency Observatory (YETO) platform. It covers system administration, data management, user management, and operational procedures.

## Table of Contents

1. [Getting Started](#getting-started)
2. [System Architecture](#system-architecture)
3. [User Management](#user-management)
4. [Data Management](#data-management)
5. [Content Management](#content-management)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [Security & Compliance](#security--compliance)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Admin Portal Access

1. Navigate to `/admin` on the YETO platform
2. Log in with your administrator credentials
3. You must have `role: admin` in the user database

### Admin Dashboard Overview

The admin dashboard provides:
- **Quick Stats**: Total users, data points, sources, pending submissions
- **Recent Activity**: Latest data submissions and corrections
- **System Health**: Server status, database connections, API health
- **Alerts**: Data quality issues, pending reviews, system warnings

---

## System Architecture

### Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 |
| Backend | Express 4 + tRPC 11 |
| Database | TiDB (MySQL-compatible) via Drizzle ORM |
| Authentication | Manus OAuth + JWT sessions |
| File Storage | S3-compatible object storage |
| AI Integration | LLM API via invokeLLM helper |

### Key Files

```
server/routers.ts      → tRPC procedures (business logic)
server/db.ts           → Database query helpers
drizzle/schema.ts      → Database schema definitions
client/src/pages/      → Frontend page components
```

### Database Schema

Core tables:
- `users` - User accounts with roles (admin/user)
- `indicators` - Economic indicator definitions
- `time_series_data` - Time series values with regime tags
- `economic_events` - Timeline events
- `sources` - Data source registry
- `data_gaps` - Gap ticket tracking
- `corrections` - Correction requests and resolutions

---

## User Management

### User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full platform access, user management, data approval |
| `user` | Standard access, can submit data, create reports |

### Promoting Users to Admin

```sql
UPDATE users SET role = 'admin' WHERE id = '<user_id>';
```

Or use the Database panel in the Management UI.

### Subscription Tiers

| Tier | Features |
|------|----------|
| Public | Basic dashboard, limited exports |
| Registered | Full dashboard, basic exports, saved searches |
| Pro | API access, custom reports, priority support |
| Institutional | White-label, bulk data, dedicated support |

---

## Data Management

### Data Submission Workflow

1. **Partner Submission**: Partner submits data via Partner Portal
2. **Validation**: Automated checks for format, range, consistency
3. **Review Queue**: Appears in admin review queue
4. **Admin Review**: Admin verifies source, methodology, accuracy
5. **Approval/Rejection**: Data published or returned with feedback
6. **Provenance Logging**: All actions logged with timestamps

### Regime Tags

All data must be tagged with regime context:

| Tag | Description |
|-----|-------------|
| `aden` | Internationally Recognized Government (IRG) |
| `sanaa` | De Facto Authority (DFA/Houthi) |
| `national` | Pre-split or unified data |

### Confidence Levels

| Level | Description | Criteria |
|-------|-------------|----------|
| A | High Confidence | Official source, verified methodology |
| B | Medium-High | Reputable source, cross-validated |
| C | Medium | Single source, plausible but unverified |
| D | Low | Estimated, proxy data, or contested |

### Data Gap Management

1. Navigate to `/coverage` (Coverage Scorecard)
2. View gaps by sector and priority
3. Create new gap tickets with:
   - Title and description
   - Why it matters
   - Candidate sources
   - Priority level
4. Assign to research team
5. Track progress through resolution

---

## Content Management

### Publications

Auto-generated publications:
- **Daily Economic Signals Digest**: Key indicators, alerts
- **Weekly Market & FX Monitor**: Currency, prices, trade
- **Monthly Macro-Fiscal Brief**: GDP, budget, debt analysis

Workflow:
1. System generates draft from latest data
2. Admin reviews and edits
3. Admin approves for publication
4. Published to `/publications` and email subscribers

### Corrections

1. Users report issues via "Report Issue" button
2. Corrections appear in admin queue
3. Admin reviews with evidence
4. Admin resolves with:
   - Correction applied (data updated)
   - Clarification added (no change needed)
   - Rejected (invalid report)
5. Public corrections log updated

---

## Monitoring & Analytics

### Platform Metrics

- **User Analytics**: Active users, session duration, feature usage
- **Data Analytics**: Queries per day, popular indicators, export volume
- **API Analytics**: Request volume, response times, error rates

### Health Checks

Monitor via `/admin` dashboard:
- Database connection status
- API endpoint health
- File storage availability
- LLM service status

### Alerts Configuration

Set up alerts for:
- Data quality thresholds exceeded
- Unusual traffic patterns
- Failed data imports
- System errors

---

## Security & Compliance

### Access Control

- All admin routes protected by `protectedProcedure` + role check
- Session tokens expire after 24 hours
- Failed login attempts logged

### Data Privacy

- User PII stored encrypted
- Export logs maintained for audit
- GDPR-compliant data handling

### Sanctions Compliance

- Monitor `/compliance` dashboard for updates
- Cross-reference entities against sanctions lists
- Document due diligence for sensitive data

---

## Troubleshooting

### Common Issues

**Database connection errors**
```bash
# Check DATABASE_URL environment variable
# Verify TiDB cluster is accessible
# Check connection pool limits
```

**Authentication failures**
```bash
# Verify JWT_SECRET is set
# Check OAuth callback URL configuration
# Clear browser cookies and retry
```

**Data import failures**
```bash
# Validate CSV/JSON format
# Check for duplicate entries
# Verify regime_tag values
```

### Support Contacts

- Technical Issues: tech@causewaygrp.com
- Data Questions: yeto@causewaygrp.com
- Security Concerns: security@causewaygrp.com

---

## Appendix

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | TiDB connection string |
| `JWT_SECRET` | Session signing key |
| `VITE_APP_ID` | OAuth application ID |
| `BUILT_IN_FORGE_API_KEY` | LLM API key |

### Database Migrations

```bash
# Generate migration
pnpm db:push

# This runs drizzle-kit generate & drizzle-kit migrate
```

### Backup Procedures

1. Database: Automated daily backups via TiDB
2. Files: S3 versioning enabled
3. Code: GitHub repository with branch protection

---

*Last Updated: December 2024*
*Version: 1.0*
