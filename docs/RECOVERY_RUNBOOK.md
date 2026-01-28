# RECOVERY_RUNBOOK.md — YETO Disaster Recovery Guide

> **Step-by-step procedures for recovering from data loss, corruption, or system failures**

---

## Quick Reference

| Scenario | RTO | RPO | Procedure |
|----------|-----|-----|-----------|
| **Database Corruption** | 1 hour | 24 hours | [Database Recovery](#database-recovery) |
| **S3 Data Loss** | 30 min | 1 hour | [S3 Recovery](#s3-recovery) |
| **Application Crash** | 5 min | 0 | [Application Recovery](#application-recovery) |
| **Complete System Failure** | 4 hours | 24 hours | [Full System Recovery](#full-system-recovery) |

---

## Database Recovery

### Prerequisites

- Access to backup storage (S3 or local)
- MySQL client tools installed
- Database credentials
- Sufficient disk space for restore

### Backup Locations

| Backup Type | Location | Frequency | Retention |
|-------------|----------|-----------|-----------|
| **Daily Full** | `s3://yeto-data-prod/backups/daily/` | Daily @ 2 AM UTC | 30 days |
| **Hourly Incremental** | `s3://yeto-data-prod/backups/hourly/` | Every hour | 7 days |
| **Weekly Archive** | `s3://yeto-data-prod/backups/archive/` | Weekly | 1 year |

### Procedure: Restore from Daily Backup

```bash
# 1. Stop the application to prevent writes
pm2 stop yeto
systemctl stop yeto-scheduler

# 2. Download latest backup from S3
aws s3 cp s3://yeto-data-prod/backups/daily/latest.sql.gz ./
gunzip latest.sql.gz

# 3. Create backup of current database (just in case)
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS \
  --all-databases > current_state_$(date +%s).sql

# 4. Restore database from backup
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS < latest.sql

# 5. Verify data integrity
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e \
  "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='yeto';"

# 6. Restart application
pm2 start yeto
systemctl start yeto-scheduler

# 7. Verify application is running
curl http://localhost:3000/api/health
```

### Procedure: Point-in-Time Recovery (PITR)

Use this when you need to recover to a specific point in time (e.g., before accidental data deletion).

```bash
# 1. Identify the target recovery time
TARGET_TIME="2026-01-28 10:30:00"

# 2. Stop the application
pm2 stop yeto

# 3. Restore from nearest backup before target time
BACKUP_DATE="2026-01-28"
aws s3 cp s3://yeto-data-prod/backups/daily/$BACKUP_DATE.sql.gz ./
gunzip $BACKUP_DATE.sql.gz
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS < $BACKUP_DATE.sql

# 4. Apply binary logs up to target time
mysqlbinlog --start-datetime="2026-01-28 00:00:00" \
            --stop-datetime="$TARGET_TIME" \
            /var/lib/mysql/binlog.* | \
  mysql -h $DB_HOST -u $DB_USER -p$DB_PASS

# 5. Verify recovery
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e \
  "SELECT MAX(updated_at) FROM time_series_data;"

# 6. Restart application
pm2 start yeto
```

### Procedure: Restore Specific Table

If only one table is corrupted, restore just that table.

```bash
# 1. Export table from backup
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS yeto time_series_data > table_backup.sql

# 2. Drop corrupted table
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e \
  "DROP TABLE yeto.time_series_data;"

# 3. Restore table
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS yeto < table_backup.sql

# 4. Verify table integrity
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e \
  "CHECK TABLE yeto.time_series_data;"
```

### Verification Checklist

After database recovery, verify:

```bash
# Check table counts
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e \
  "SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema='yeto';"

# Check data freshness (most recent timestamp)
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e \
  "SELECT MAX(updated_at) FROM yeto.time_series_data;"

# Check for orphaned records
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e \
  "SELECT COUNT(*) FROM yeto.time_series_data WHERE indicator_id NOT IN (SELECT id FROM yeto.economic_indicators);"

# Verify application can connect
curl http://localhost:3000/api/health/db
```

---

## S3 Recovery

### S3 Backup Structure

```
s3://yeto-data-prod/
├── backups/
│   ├── daily/
│   │   ├── 2026-01-28.sql.gz
│   │   └── latest.sql.gz (symlink)
│   ├── hourly/
│   │   ├── 2026-01-28-10.sql.gz
│   │   └── 2026-01-28-11.sql.gz
│   └── archive/
│       └── 2026-01-15.sql.gz
├── documents/
│   ├── cby-reports/
│   ├── research-papers/
│   └── manifests/
├── exports/
│   ├── csv/
│   ├── json/
│   └── pdf/
├── raw-data/
│   ├── world-bank/
│   ├── hdx/
│   └── reliefweb/
├── processed-data/
│   ├── indicators/
│   └── time-series/
└── logs/
    ├── application/
    ├── database/
    └── scheduler/
```

### Procedure: Restore S3 Documents

If documents are accidentally deleted or corrupted:

```bash
# 1. List available backups
aws s3 ls s3://yeto-data-prod/backups/daily/ --recursive

# 2. Check S3 versioning (if enabled)
aws s3api list-object-versions \
  --bucket yeto-data-prod \
  --prefix documents/ \
  --query 'Versions[?IsLatest==`false`]' \
  --output table

# 3. Restore from specific version
OBJECT_KEY="documents/cby-reports/report.pdf"
VERSION_ID="abc123def456"
aws s3api get-object \
  --bucket yeto-data-prod \
  --key $OBJECT_KEY \
  --version-id $VERSION_ID \
  ./restored-report.pdf

# 4. Verify restored file
ls -lh ./restored-report.pdf
md5sum ./restored-report.pdf

# 5. Upload back to S3
aws s3 cp ./restored-report.pdf s3://yeto-data-prod/$OBJECT_KEY
```

### Procedure: Restore Entire S3 Prefix

If a whole prefix (e.g., all exports) is lost:

```bash
# 1. List all objects in prefix
aws s3 ls s3://yeto-data-prod/exports/ --recursive > exports_list.txt

# 2. Check backup location
aws s3 ls s3://yeto-data-prod/backups/archive/exports-backup/ --recursive

# 3. Sync from backup to production
aws s3 sync \
  s3://yeto-data-prod/backups/archive/exports-backup/ \
  s3://yeto-data-prod/exports/ \
  --delete

# 4. Verify restoration
aws s3 ls s3://yeto-data-prod/exports/ --recursive | wc -l
```

### S3 Versioning Recovery

If S3 versioning is enabled, recover deleted objects:

```bash
# 1. Find deleted object versions
aws s3api list-object-versions \
  --bucket yeto-data-prod \
  --prefix documents/ \
  --query 'DeleteMarkers[0]' \
  --output json

# 2. Remove delete marker to restore
DELETE_MARKER_ID="marker-id"
aws s3api delete-object \
  --bucket yeto-data-prod \
  --key documents/file.pdf \
  --version-id $DELETE_MARKER_ID
```

### Verification Checklist

After S3 recovery:

```bash
# Count objects in each prefix
for prefix in documents exports raw-data processed-data logs; do
  echo "$prefix: $(aws s3 ls s3://yeto-data-prod/$prefix --recursive | wc -l)"
done

# Check file sizes haven't changed
aws s3 ls s3://yeto-data-prod/documents/ --recursive --human-readable

# Verify manifest is accurate
aws s3 cp s3://yeto-data-prod/manifests/s3-assets.json ./
jq '.assets | length' s3-assets.json
```

---

## Application Recovery

### Procedure: Restart Application

If the application crashes or becomes unresponsive:

```bash
# 1. Check application status
pm2 status

# 2. View recent logs
pm2 logs yeto --lines 50

# 3. Restart application
pm2 restart yeto

# 4. Monitor startup
pm2 logs yeto --follow

# 5. Verify application is running
curl http://localhost:3000/api/health

# 6. Check database connectivity
curl http://localhost:3000/api/health/db

# 7. Check all services
curl http://localhost:3000/api/health/services
```

### Procedure: Rebuild Application

If the application binary is corrupted:

```bash
# 1. Stop the application
pm2 stop yeto

# 2. Clean build artifacts
rm -rf dist build .next

# 3. Reinstall dependencies
pnpm install --frozen-lockfile

# 4. Rebuild application
pnpm build

# 5. Start application
pm2 start yeto

# 6. Verify
curl http://localhost:3000/api/health
```

### Procedure: Rollback to Previous Version

If a bad deployment caused issues:

```bash
# 1. View deployment history
git log --oneline -10

# 2. Identify good version
GOOD_COMMIT="abc123def"

# 3. Checkout previous version
git checkout $GOOD_COMMIT

# 4. Rebuild and restart
pnpm install
pnpm build
pm2 restart yeto

# 5. Verify
curl http://localhost:3000/api/health

# 6. After verification, update main branch
git checkout main
git revert HEAD
git push origin main
```

---

## Full System Recovery

### Prerequisites for Full Recovery

- Backup of entire system (database + S3 + application code)
- New server with same OS and dependencies
- Network access to backup storage
- SSH access to new server

### Procedure: Complete System Restore

```bash
# 1. Provision new server
# - OS: Ubuntu 22.04 LTS
# - CPU: 8+ cores
# - RAM: 16+ GB
# - Storage: 100+ GB SSD

# 2. Install dependencies
sudo apt-get update
sudo apt-get install -y \
  nodejs npm git mysql-client \
  build-essential python3

# 3. Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install pnpm
npm install -g pnpm

# 5. Clone repository
git clone https://github.com/Causeway-banking-financial/yeto-platform.git
cd yeto-platform

# 6. Install dependencies
pnpm install --frozen-lockfile

# 7. Configure environment
cp .env.example .env
# Edit .env with production values

# 8. Restore database
aws s3 cp s3://yeto-data-prod/backups/daily/latest.sql.gz ./
gunzip latest.sql.gz
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS < latest.sql

# 9. Build application
pnpm build

# 10. Start application
pm2 start ecosystem.config.js

# 11. Verify all systems
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/db
curl http://localhost:3000/api/health/services

# 12. Configure monitoring
# - Set up CloudWatch alarms
# - Configure log aggregation
# - Set up health checks
```

### Verification Checklist

After full system recovery:

- [ ] Application is running (`pm2 status`)
- [ ] Database is accessible (`mysql -e "SELECT 1"`)
- [ ] S3 connectivity works (`aws s3 ls`)
- [ ] API responds to requests (`curl /api/health`)
- [ ] Database has data (`SELECT COUNT(*) FROM time_series_data`)
- [ ] Scheduler is running (`pm2 logs yeto | grep Scheduler`)
- [ ] Logs are being written (`tail -f logs/app.log`)
- [ ] Backups are being created (`aws s3 ls backups/`)

---

## Disaster Recovery Testing

### Monthly DR Drill

Perform a monthly disaster recovery test:

```bash
# 1. Schedule maintenance window (off-hours)
# 2. Notify stakeholders
# 3. Perform full system recovery to staging
# 4. Verify all data is present and correct
# 5. Document any issues
# 6. Update recovery procedures
# 7. Notify stakeholders of completion
```

### DR Test Checklist

- [ ] Database restored successfully
- [ ] All tables present with correct row counts
- [ ] S3 documents accessible
- [ ] Application starts without errors
- [ ] API endpoints respond correctly
- [ ] Scheduler jobs execute
- [ ] Email notifications work
- [ ] Backups are being created
- [ ] Recovery time meets RTO target
- [ ] Data loss is within RPO target

---

## Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| **Database Admin** | dba@causewaygrp.com | 24/7 |
| **DevOps Lead** | devops@causewaygrp.com | 24/7 |
| **Security Team** | security@causewaygrp.com | 24/7 |
| **Executive** | exec@causewaygrp.com | Business hours |

---

## Additional Resources

- [OPERATIONS.md](./OPERATIONS.md) — Operational procedures
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [AWS Backup Documentation](https://docs.aws.amazon.com/aws-backup/)
- [MySQL Backup and Recovery](https://dev.mysql.com/doc/refman/8.0/en/backup-and-recovery.html)

---

**Last Updated:** 2026-01-28  
**Next Review:** 2026-02-28  
**Maintained By:** DevOps Team
