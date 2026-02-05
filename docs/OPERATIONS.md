# YETO Operations Manual

This document provides comprehensive guidance for deploying, operating, and maintaining the YETO platform in production environments.

---

## Table of Contents

1. [Branch Structure & Protection Policies](#branch-structure--protection-policies)
2. [CI/CD Pipeline](#cicd-pipeline)
3. [Repository Hygiene](#repository-hygiene)
4. [System Requirements](#system-requirements)
5. [Environment Setup](#environment-setup)
6. [Deployment Guide](#deployment-guide)
7. [Database Operations](#database-operations)
8. [Monitoring & Alerts](#monitoring--alerts)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)
11. [Security Operations](#security-operations)

---

## Branch Structure & Protection Policies

### Branch Hierarchy

```
main (production)
  └── dev (development)
        └── feature/* (feature branches)
        └── fix/* (bug fix branches)
        └── hotfix/* (urgent production fixes)
```

### Branch Descriptions

| Branch | Purpose | Deploys To | Protection Level |
|--------|---------|------------|------------------|
| `main` | Production-ready code | https://yeto.causewaygrp.com | **Strict** |
| `dev` | Development integration | https://yteocauseway.manus.space | **Moderate** |
| `feature/*` | New features | Preview environments | None |
| `fix/*` | Bug fixes | Preview environments | None |
| `hotfix/*` | Urgent production fixes | Direct to main | **Strict** |

### Branch Protection Rules (main)

The `main` branch has the following protection rules:

1. **Require Pull Request Reviews**
   - Minimum 1 approving review required
   - Dismiss stale reviews when new commits are pushed
   - Require review from code owners

2. **Require Status Checks**
   - All CI checks must pass before merging:
     - ✅ Linting (`pnpm lint`)
     - ✅ Type checking (`pnpm check`)
     - ✅ Unit tests (`pnpm test`)
     - ✅ Integration tests (if applicable)
     - ✅ E2E tests (Playwright)
     - ✅ Build (`pnpm build`)

3. **Require Signed Commits**
   - All commits must be signed with GPG

4. **Restrict Force Pushes**
   - Force pushes are disabled on `main`

5. **Restrict Deletions**
   - Branch deletion is disabled

---

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline is defined in `.github/workflows/ci.yml` and runs on every push and PR.

### CI Status in Release Gate

The `/admin/release-gate` page displays CI status:
- Green: All checks passing
- Yellow: Some checks pending
- Red: One or more checks failing

---

## Repository Hygiene

### Large File Guard

A pre-commit hook blocks files larger than 20 MB. Large assets should be moved to S3 and tracked in `manifests/s3-assets.json`.

### S3 Asset Manifest

Large assets are stored in S3 and tracked in `manifests/s3-assets.json` with checksums and metadata.

---

## System Requirements

### Hardware Requirements

| Component | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| CPU | 2 cores | 4 cores | 8+ cores |
| RAM | 4 GB | 8 GB | 16+ GB |
| Storage | 20 GB SSD | 50 GB SSD | 100+ GB SSD |
| Network | 100 Mbps | 1 Gbps | 1+ Gbps |

### Software Requirements

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 22.x+ | Runtime environment |
| pnpm | 9.x+ | Package manager |
| MySQL/TiDB | 8.0+ | Primary database |
| Redis | 7.x+ | Caching (optional) |
| Nginx | 1.24+ | Reverse proxy (optional) |

---

## Environment Setup

### Required Environment Variables

The following environment variables must be configured for YETO to operate correctly. Create a `.env` file in the project root with these values.

#### Core Configuration

```bash
# Database Connection (REQUIRED)
DATABASE_URL="mysql://user:password@host:port/database?ssl=true"
# Example: mysql://root:password@localhost:3306/yeto_platform
# Required for: All database operations, schema migrations, data persistence

# Application Environment (REQUIRED)
NODE_ENV="production"  # Values: development, test, production
# Determines behavior of logging, error handling, and performance optimizations

# Server Configuration
PORT="3000"  # Default: 3000
HOST="0.0.0.0"  # Default: 0.0.0.0 (all interfaces)

# Authentication (REQUIRED)
JWT_SECRET="your-secure-jwt-secret-min-32-chars"
# Must be at least 32 characters. Used for signing JWT tokens.
# Generate with: openssl rand -base64 32

VITE_APP_ID="your-oauth-app-id"
# Manus OAuth application ID
# Obtain from: https://manus.im/developer/apps

OAUTH_SERVER_URL="https://api.manus.im"
# Manus OAuth server endpoint

VITE_OAUTH_PORTAL_URL="https://manus.im/oauth"
# Manus OAuth portal for user authentication

# Owner Information (REQUIRED)
OWNER_OPEN_ID="owner-open-id"
# Open ID of the platform owner/administrator
# Used for administrative access and initial setup

OWNER_NAME="Owner Name"
# Display name for the platform owner
```

#### Storage Configuration

```bash
# S3-Compatible Storage (REQUIRED for exports/evidence)
S3_BUCKET="your-bucket-name"
# S3 bucket name for storing exports, evidence packs, and large files
# Example: yeto-platform-exports

AWS_ACCESS_KEY_ID="your-access-key"
# AWS access key with S3 read/write permissions

AWS_SECRET_ACCESS_KEY="your-secret-key"
# AWS secret access key

AWS_REGION="us-east-1"
# AWS region where S3 bucket is located
# Example: us-east-1, eu-west-1, ap-southeast-1

# S3 Endpoint (Optional - for S3-compatible services)
S3_ENDPOINT="https://s3.amazonaws.com"
# Override for S3-compatible services like MinIO, DigitalOcean Spaces
```

#### AI Services

```bash
# LLM Integration (REQUIRED for AI Assistant)
BUILT_IN_FORGE_API_URL="https://api.forge.manus.im"
# Backend LLM API endpoint for server-side AI operations

BUILT_IN_FORGE_API_KEY="your-forge-api-key"
# Backend API key for LLM access
# Obtain from: Manus Forge dashboard

VITE_FRONTEND_FORGE_API_URL="https://api.forge.manus.im"
# Frontend LLM API endpoint for client-side AI operations

VITE_FRONTEND_FORGE_API_KEY="your-frontend-forge-key"
# Frontend API key (can be same as backend or separate with limited permissions)

# AI Model Configuration (Optional)
AI_MODEL="gpt-4"  # Default model for AI operations
AI_MAX_TOKENS="4096"  # Maximum tokens per request
AI_TEMPERATURE="0.7"  # Response creativity (0.0-2.0)
```

#### Analytics (Optional)

```bash
# Analytics Tracking
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
# Analytics service endpoint (e.g., Plausible, Umami, Matomo)

VITE_ANALYTICS_WEBSITE_ID="your-website-id"
# Website ID in your analytics platform

# Error Tracking (Optional)
SENTRY_DSN="https://...@sentry.io/..."
# Sentry DSN for error tracking and monitoring
```

#### Email Configuration (Optional)

```bash
# SMTP Configuration for notifications
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"  # true for 465, false for other ports
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="YETO Platform <noreply@yeto.org>"
```

#### Feature Flags (Optional)

```bash
# Feature toggles
ENABLE_AI_ASSISTANT="true"  # Enable/disable AI Assistant
ENABLE_EXPORTS="true"  # Enable/disable data exports
ENABLE_PARTNER_PORTAL="true"  # Enable/disable partner contributions
ENABLE_WEBHOOKS="true"  # Enable/disable webhook delivery
ENABLE_ADMIN_PORTAL="true"  # Enable/disable admin dashboard

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes in ms
RATE_LIMIT_MAX_REQUESTS="100"  # Max requests per window
```

#### Development Only

```bash
# Development tools (DO NOT use in production)
DEBUG="*"  # Enable debug logging
VITE_DEV_MODE="true"  # Show development banners
SKIP_AUTH="false"  # NEVER enable in production
```

### Environment Validation

Run the following command to validate your environment configuration:

```bash
pnpm run env:validate
```

---

## Deployment Guide

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/Causeway-banking-financial/yeto.git
cd yeto

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Push database schema
pnpm db:push

# 5. Seed initial data (optional)
pnpm db:seed

# 6. Start development server
pnpm dev
```

### Production Deployment

#### Option 1: Manus Platform (Recommended)

1. Save a checkpoint: `webdev_save_checkpoint`
2. Click "Publish" in the Manus Management UI
3. Configure custom domain in Settings → Domains

#### Option 2: Self-Hosted

```bash
# 1. Build production assets
pnpm build

# 2. Start production server
NODE_ENV=production pnpm start
```

### Docker Deployment

```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

---

## Database Operations

### Schema Management

```bash
# Push schema changes to database
pnpm db:push

# Generate migration files
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open database studio
pnpm db:studio
```

### Backup Procedures

#### Daily Automated Backup

The platform includes an automated backup service that runs daily at 2:00 AM UTC.

```typescript
// Backup configuration in server/services/backup-service.ts
const backupConfig = {
  schedule: '0 2 * * *',  // Daily at 2 AM UTC
  retention: 30,           // Keep 30 days of backups
  destination: 's3://bucket/backups/'
};
```

#### Manual Backup

```bash
# Export database to SQL file
mysqldump -h host -u user -p database > backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_*.sql s3://bucket/backups/
```

### Data Seeding

```bash
# Seed all initial data
pnpm db:seed

# Seed specific data types
pnpm db:seed:indicators
pnpm db:seed:publications
pnpm db:seed:glossary
```

---

## Monitoring & Alerts

### Health Checks

The platform exposes health check endpoints for monitoring:

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/api/health` | Basic health | `{ "status": "ok" }` |
| `/api/health/db` | Database connectivity | `{ "status": "ok", "latency": 5 }` |
| `/api/health/services` | All services | Full status report |

### Key Metrics to Monitor

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| Response Time (p95) | > 500ms | > 2000ms |
| Error Rate | > 1% | > 5% |
| Database Connections | > 80% pool | > 95% pool |
| Memory Usage | > 80% | > 95% |
| Disk Usage | > 80% | > 95% |

### Alert Configuration

Configure alerts in the Admin Console under Settings → Notifications:

1. **Email Alerts**: For critical system issues
2. **Slack Integration**: For operational notifications
3. **PagerDuty**: For on-call escalation

---

## Backup & Recovery

### Recovery Procedures

#### Database Recovery

```bash
# 1. Stop the application
pm2 stop yeto

# 2. Restore from backup
mysql -h host -u user -p database < backup_20260128.sql

# 3. Verify data integrity
pnpm db:verify

# 4. Restart application
pm2 start yeto
```

#### Point-in-Time Recovery

If using TiDB or MySQL with binary logging:

```bash
# Restore to specific point in time
mysqlbinlog --start-datetime="2026-01-28 10:00:00" \
            --stop-datetime="2026-01-28 12:00:00" \
            binlog.000001 | mysql -h host -u user -p database
```

### Disaster Recovery Plan

| Scenario | RTO | RPO | Procedure |
|----------|-----|-----|-----------|
| Database Corruption | 1 hour | 24 hours | Restore from daily backup |
| Server Failure | 15 min | 0 | Failover to standby |
| Data Center Outage | 4 hours | 1 hour | Activate DR site |
| Ransomware Attack | 8 hours | 24 hours | Restore from offline backup |

---

## Troubleshooting

### Common Issues

#### Issue: Database Connection Timeout

**Symptoms**: `Error: Connection timeout` in logs

**Resolution**:
1. Check database server is running
2. Verify `DATABASE_URL` is correct
3. Check network connectivity
4. Increase connection pool size

```bash
# Test database connectivity
mysql -h host -u user -p -e "SELECT 1"
```

#### Issue: High Memory Usage

**Symptoms**: Server becoming unresponsive, OOM errors

**Resolution**:
1. Check for memory leaks in logs
2. Restart the application
3. Increase server memory
4. Enable memory profiling

```bash
# Check memory usage
node --expose-gc --inspect server/index.js
```

#### Issue: Slow API Responses

**Symptoms**: Response times > 2 seconds

**Resolution**:
1. Check database query performance
2. Enable query caching
3. Add database indexes
4. Scale horizontally

### Log Analysis

```bash
# View application logs
tail -f logs/app.log

# Search for errors
grep -i error logs/app.log | tail -100

# View database slow queries
grep "slow query" logs/db.log
```

---

## Security Operations

### Security Checklist

- [ ] All environment variables are set via secure secrets management
- [ ] Database connections use SSL/TLS
- [ ] API rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Security headers are set (CSP, HSTS, etc.)
- [ ] Audit logging is enabled
- [ ] Regular security scans are scheduled

### Incident Response

1. **Detection**: Monitor alerts and logs
2. **Containment**: Isolate affected systems
3. **Eradication**: Remove threat
4. **Recovery**: Restore services
5. **Lessons Learned**: Document and improve

### Security Contacts

| Role | Contact |
|------|---------|
| Security Team | security@causewaygrp.com |
| On-Call Engineer | oncall@causewaygrp.com |
| Management | management@causewaygrp.com |

---

## Appendix

### Useful Commands

```bash
# Check application status
pm2 status

# View real-time logs
pm2 logs yeto

# Restart application
pm2 restart yeto

# Check disk usage
df -h

# Check memory usage
free -m

# Check CPU usage
top -bn1 | head -20
```

### Support Resources

- **Documentation**: [docs/](../docs/)
- **Issue Tracker**: GitHub Issues
- **Email Support**: support@causewaygrp.com

---

## Safe Publish Runbook

This section provides a step-by-step guide for safely publishing updates to production.

### Pre-Publish Checklist

Before initiating any production deployment, ensure all items are checked:

- [ ] All CI checks passing on target branch
- [ ] Release Gate (17 checks) passed
- [ ] Registry lint clean
- [ ] E2E tests passed in AR and EN
- [ ] No critical errors in logs
- [ ] Database migrations tested in staging
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

### Deployment Process

#### Step 1: Pre-Deployment Verification

```bash
# Verify current branch
git status
git log -1

# Run local checks
pnpm lint
pnpm typecheck
pnpm test
pnpm registry:lint

# Run release gate
node scripts/release-gate.mjs
```

#### Step 2: Database Backup

```bash
# Create backup before any schema changes
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3
aws s3 cp backup_*.sql s3://$BACKUP_BUCKET/backups/pre-deploy/
```

#### Step 3: Run Database Migrations

```bash
# Review pending migrations
pnpm drizzle-kit generate

# Apply migrations
pnpm db:push

# Verify schema
pnpm drizzle-kit introspect
```

#### Step 4: Build Production Assets

```bash
# Clean previous build
rm -rf dist/

# Build application
pnpm build

# Verify build output
ls -la dist/
```

#### Step 5: Deploy to Production

**Option A: Manus Platform**
```bash
# Save checkpoint
webdev_save_checkpoint --tag "v1.6-pre-deploy"

# Publish to production
# 1. Open Manus Management UI
# 2. Click "Publish" button
# 3. Select production environment
# 4. Confirm deployment
```

**Option B: Self-Hosted**
```bash
# Stop current process
pm2 stop yeto

# Pull latest code
git pull origin main

# Install dependencies
pnpm install --frozen-lockfile

# Build
pnpm build

# Start with new code
pm2 start yeto
pm2 save
```

#### Step 6: Post-Deployment Verification

```bash
# Check health endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/health/db

# Verify critical pages
curl -I https://your-domain.com/
curl -I https://your-domain.com/dashboard
curl -I https://your-domain.com/sectors/banking

# Check logs for errors
pm2 logs yeto --lines 50
```

#### Step 7: Smoke Testing

Manually verify critical user journeys:

1. **Homepage** - Load in AR and EN
2. **Dashboard** - Check data loads correctly
3. **Sector Pages** - Verify at least 3 sectors
4. **Evidence Packs** - Test export functionality
5. **AI Assistant** - Send test query
6. **Authentication** - Test login/logout flow

#### Step 8: Monitor for Issues

```bash
# Watch logs for 15 minutes post-deploy
pm2 logs yeto --lines 100 --timestamp

# Check error rates
curl https://your-domain.com/api/admin/health/errors

# Monitor database connections
mysql -h $DB_HOST -u $DB_USER -p -e "SHOW PROCESSLIST"
```

### Rollback Procedure

If critical issues are detected post-deployment:

#### Immediate Rollback

```bash
# Stop application
pm2 stop yeto

# Revert to previous version
git checkout <previous-commit-hash>

# Rebuild
pnpm install --frozen-lockfile
pnpm build

# Restart
pm2 start yeto

# Verify health
curl https://your-domain.com/api/health
```

#### Database Rollback (if schema changed)

```bash
# Stop application
pm2 stop yeto

# Restore database from backup
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < backup_YYYYMMDD_HHMMSS.sql

# Revert code
git checkout <previous-commit-hash>
pnpm install --frozen-lockfile
pnpm build

# Restart
pm2 start yeto
```

### Post-Rollback Actions

1. Document the issue that caused rollback
2. Create incident report
3. Schedule post-mortem meeting
4. Update deployment checklist if needed
5. Fix issue in development branch
6. Re-run full test suite before next attempt

---

## Release Gate Reference

The Release Gate includes 17 critical checks that must pass before production deployment:

| Gate | Description | Threshold |
|------|-------------|-----------|
| 1. Source Registry Count | Minimum sources in registry | ≥250 sources |
| 2. Active Sources | Active data sources | ≥150 active |
| 3. Sector Codebook | Sector definitions | ≥16 sectors |
| 4. Tier Distribution | UNKNOWN tier percentage | ≤70% |
| 5. Sector Mappings | Sources with sector tags | ≥50% |
| 6. No Duplicate IDs | Unique source identifiers | 0 duplicates |
| 7. Required Fields | No null required fields | 0 null names |
| 8. S3 Storage Health | Storage configuration | Configured |
| 9. v2.5 Schema | Database schema current | All columns |
| 10. No Static KPIs | No hardcoded values in UI | 0 violations |
| 11. No Mock Evidence | No mock data fallbacks | 0 mocks |
| 12. Evidence Coverage | Public pages have evidence | ≥95% |
| 13. AR/EN Parity | Bilingual support | Full parity |
| 14. Exports Signed URL | Secure exports | Implemented |
| 15. Contradiction Mode | Disagreement handling | Present |
| 16. Coverage Map | Gap tracking | Present |
| 17. Nightly Jobs | Scheduled maintenance | Configured |

---

*Last Updated: February 5, 2026*
