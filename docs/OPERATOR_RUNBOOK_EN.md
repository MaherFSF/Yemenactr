# YETO Operator Runbook

## Purpose

This runbook provides operational procedures for maintaining and troubleshooting the YETO platform. It covers daily operations, incident response, and maintenance tasks.

## System Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Application Server                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Express   │  │    tRPC     │  │  Scheduler  │          │
│  │   Server    │  │   Router    │  │   Service   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
┌────────▼────────┐ ┌─────▼─────┐ ┌────────▼────────┐
│    TiDB/MySQL   │ │    S3     │ │  External APIs  │
│    Database     │ │  Storage  │ │  (20 connectors)│
└─────────────────┘ └───────────┘ └─────────────────┘
```

### Key Components

| Component | Purpose | Port |
|-----------|---------|------|
| Express Server | HTTP server, static files | 3000 |
| tRPC Router | API endpoints | 3000/api/trpc |
| Scheduler | Automated jobs | Internal |
| Database | Data persistence | 3306 |
| S3 Storage | File storage | HTTPS |

## Daily Operations

### Morning Checklist

- [ ] Check system health dashboard
- [ ] Review overnight scheduler logs
- [ ] Verify API connector status
- [ ] Check database connection pool
- [ ] Review error logs

### Health Checks

**API Health Dashboard**: `/admin/api-health`

| Status | Meaning | Action |
|--------|---------|--------|
| 🟢 Active | Connector working | None |
| 🟡 Degraded | Partial issues | Monitor |
| 🔴 Failed | Connector down | Investigate |

### Scheduler Monitoring

**Admin Panel**: `/admin` → Ingestion tab

| Job Status | Meaning |
|------------|---------|
| Running | Currently executing |
| Completed | Last run successful |
| Failed | Last run failed |
| Disabled | Job paused |

## Common Procedures

### Restart Application Server

```bash
# SSH to server
ssh ubuntu@yeto-server

# Restart with PM2
pm2 restart yeto-platform

# Or with systemd
sudo systemctl restart yeto-platform
```

### Clear Cache

```bash
# Clear application cache
cd /home/ubuntu/yeto-platform
rm -rf .cache/*

# Restart server
pm2 restart yeto-platform
```

### Database Connection Issues

1. Check connection pool status
2. Verify DATABASE_URL environment variable
3. Test connection manually:

```bash
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "SELECT 1"
```

### S3 Storage Issues

1. Verify S3 credentials in environment
2. Test S3 connectivity:

```bash
aws s3 ls s3://yeto-storage/ --region us-east-1
```

## Incident Response

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P1 | Platform down | 15 minutes |
| P2 | Major feature broken | 1 hour |
| P3 | Minor issue | 4 hours |
| P4 | Enhancement | Next sprint |

### P1 Incident Procedure

1. **Acknowledge** - Confirm incident received
2. **Assess** - Determine scope and impact
3. **Communicate** - Notify stakeholders
4. **Mitigate** - Apply immediate fix
5. **Resolve** - Implement permanent fix
6. **Review** - Post-incident analysis

### Common Incidents

#### Database Connection Timeout

**Symptoms**: Slow queries, connection errors

**Resolution**:
1. Check connection pool usage
2. Restart database connection
3. Scale connection pool if needed

```bash
# Check active connections
mysql -e "SHOW PROCESSLIST"

# Kill long-running queries
mysql -e "KILL <process_id>"
```

#### API Connector Failure

**Symptoms**: Data not updating, connector shows failed

**Resolution**:
1. Check connector logs in admin panel
2. Verify API key is valid
3. Test API endpoint manually
4. Trigger manual refresh

#### High Memory Usage

**Symptoms**: Slow response, OOM errors

**Resolution**:
1. Check memory usage: `free -m`
2. Identify memory-heavy processes: `top`
3. Restart application if needed
4. Scale server if persistent

## Scheduled Maintenance

### Daily Tasks

| Task | Time (UTC) | Duration |
|------|------------|----------|
| Data refresh | 06:00 | ~30 min |
| Log rotation | 00:00 | ~5 min |
| Health check | Every 5 min | ~1 min |

### Weekly Tasks

| Task | Day | Duration |
|------|-----|----------|
| Full backup | Sunday 02:00 | ~2 hours |
| Security scan | Monday 03:00 | ~1 hour |
| Performance review | Friday | Manual |

### Monthly Tasks

| Task | When | Duration |
|------|------|----------|
| Dependency updates | 1st week | ~4 hours |
| Security patches | 2nd week | ~2 hours |
| Capacity review | 3rd week | Manual |

## Backup & Recovery

### Backup Schedule

| Type | Frequency | Retention |
|------|-----------|-----------|
| Database | Daily | 30 days |
| S3 files | Continuous | 90 days |
| Config | On change | Indefinite |

### Restore Procedure

**Database Restore**:
```bash
# List available backups
aws s3 ls s3://yeto-backups/db/

# Download backup
aws s3 cp s3://yeto-backups/db/backup-2026-01-14.sql.gz ./

# Restore
gunzip backup-2026-01-14.sql.gz
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME < backup-2026-01-14.sql
```

**Application Restore**:
```bash
# Rollback to previous checkpoint
cd /home/ubuntu/yeto-platform
git checkout <checkpoint-hash>
pnpm install
pm2 restart yeto-platform
```

## Monitoring & Alerts

### Key Metrics

| Metric | Warning | Critical |
|--------|---------|----------|
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 75% | > 90% |
| Disk Usage | > 80% | > 95% |
| Response Time | > 2s | > 5s |
| Error Rate | > 1% | > 5% |

### Alert Channels

| Channel | Use Case |
|---------|----------|
| Email | Non-urgent alerts |
| SMS | P1/P2 incidents |
| Slack | All alerts |

## Security Procedures

### Access Control

| Role | Access Level |
|------|--------------|
| Operator | Read logs, restart services |
| Admin | Full access, config changes |
| Developer | Deploy, debug |

### Security Checklist

- [ ] Rotate API keys quarterly
- [ ] Review access logs weekly
- [ ] Update dependencies monthly
- [ ] Security scan weekly

## Contacts

### Escalation Path

| Level | Contact | Method |
|-------|---------|--------|
| L1 | On-call operator | Slack |
| L2 | Platform team | Email |
| L3 | Engineering lead | Phone |

### External Contacts

| Service | Contact |
|---------|---------|
| AWS Support | AWS Console |
| Database Support | TiDB Support Portal |

## Appendix

### Useful Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs yeto-platform --lines 100

# Check disk space
df -h

# Check memory
free -m

# Check network
netstat -tlnp
```

### Environment Variables

| Variable | Purpose |
|----------|---------|
| DATABASE_URL | Database connection |
| JWT_SECRET | Authentication |
| S3_BUCKET | File storage |
| NODE_ENV | Environment mode |

---

*Last Updated: January 14, 2026*
*Version: 1.0*
