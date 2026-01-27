# YETO Operations Manual

This document provides comprehensive guidance for deploying, operating, and maintaining the YETO platform in production environments.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Environment Setup](#environment-setup)
3. [Deployment Guide](#deployment-guide)
4. [Database Operations](#database-operations)
5. [Monitoring & Alerts](#monitoring--alerts)
6. [Backup & Recovery](#backup--recovery)
7. [Troubleshooting](#troubleshooting)
8. [Security Operations](#security-operations)

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
# Database Connection
DATABASE_URL="mysql://user:password@host:port/database?ssl=true"

# Authentication
JWT_SECRET="your-secure-jwt-secret-min-32-chars"
VITE_APP_ID="your-oauth-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/oauth"

# Owner Information
OWNER_OPEN_ID="owner-open-id"
OWNER_NAME="Owner Name"
```

#### Storage Configuration

```bash
# S3-Compatible Storage
S3_BUCKET="your-bucket-name"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
```

#### AI Services

```bash
# LLM Integration
BUILT_IN_FORGE_API_URL="https://api.forge.manus.im"
BUILT_IN_FORGE_API_KEY="your-forge-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.forge.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-forge-key"
```

#### Analytics (Optional)

```bash
# Analytics
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"
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

*Last Updated: January 28, 2026*
