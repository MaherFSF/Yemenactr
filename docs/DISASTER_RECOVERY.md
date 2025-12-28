# YETO Platform - Disaster Recovery Runbook

## خطة التعافي من الكوارث | Disaster Recovery Plan

This document provides comprehensive disaster recovery procedures for the YETO platform to ensure business continuity and data protection.

---

## Table of Contents

1. [Overview](#overview)
2. [Recovery Objectives](#recovery-objectives)
3. [Disaster Scenarios](#disaster-scenarios)
4. [Recovery Procedures](#recovery-procedures)
5. [Communication Plan](#communication-plan)
6. [Testing & Validation](#testing--validation)

---

## Overview

### Purpose

This disaster recovery plan ensures YETO can recover from catastrophic failures with minimal data loss and downtime, maintaining the platform's mission of providing transparent economic data for Yemen.

### Scope

| Component | Covered | RPO | RTO |
|-----------|---------|-----|-----|
| Application | Yes | 0 (stateless) | 15 min |
| Database | Yes | 1 hour | 1 hour |
| File Storage | Yes | 24 hours | 2 hours |
| Configuration | Yes | 0 (version controlled) | 15 min |

### Key Definitions

- **RPO (Recovery Point Objective)**: Maximum acceptable data loss measured in time
- **RTO (Recovery Time Objective)**: Maximum acceptable downtime
- **MTTR (Mean Time to Recovery)**: Average time to restore service

---

## Recovery Objectives

### Service Level Targets

| Metric | Target | Maximum |
|--------|--------|---------|
| RPO | 1 hour | 4 hours |
| RTO | 1 hour | 4 hours |
| Availability | 99.9% | 99.5% |

### Priority Order

1. **Critical**: Authentication, core API, database
2. **High**: Data display, search functionality
3. **Medium**: Analytics, exports, notifications
4. **Low**: Admin features, background jobs

---

## Disaster Scenarios

### Scenario 1: Application Server Failure

**Symptoms**: Application unresponsive, health checks failing

**Impact**: Service unavailable

**Recovery Time**: 15-30 minutes

```bash
# 1. Verify failure
curl -sf https://yeto.causewaygrp.com/api/trpc/monitoring.getLiveness || echo "DOWN"

# 2. Check container status
docker compose ps
docker compose logs --tail=100 web

# 3. Restart application
docker compose restart web

# 4. If restart fails, rebuild
docker compose up -d --build web

# 5. If still failing, rollback
./scripts/bootstrap_prod.sh --rollback <last-known-good-version>
```

### Scenario 2: Database Failure

**Symptoms**: Database connection errors, data queries failing

**Impact**: All data operations unavailable

**Recovery Time**: 30-60 minutes

```bash
# 1. Check database status
docker compose exec db mysqladmin ping -h localhost

# 2. Check database logs
docker compose logs --tail=200 db

# 3. Attempt restart
docker compose restart db

# 4. If corrupt, restore from backup
# Stop application first
docker compose stop web

# Restore database
gunzip -c /opt/yeto/backups/latest-db.sql.gz | \
  docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD yeto

# Restart application
docker compose start web

# 5. Verify data integrity
docker compose exec web pnpm db:verify
```

### Scenario 3: Complete Infrastructure Failure

**Symptoms**: All services down, server unreachable

**Impact**: Complete outage

**Recovery Time**: 1-4 hours

```bash
# 1. Provision new server
# Use cloud provider console or CLI

# 2. Install prerequisites
apt update && apt install -y docker.io docker-compose-plugin git

# 3. Clone repository
git clone https://github.com/MaherFSF/yeto-platform.git /opt/yeto
cd /opt/yeto

# 4. Restore configuration
# Copy .env.production from secure backup location
scp backup-server:/backups/yeto/.env.production /opt/yeto/.env

# 5. Restore database backup
# Download latest backup
scp backup-server:/backups/yeto/db/latest.sql.gz /tmp/

# 6. Start services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 7. Restore database
gunzip -c /tmp/latest.sql.gz | docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD yeto

# 8. Update DNS if IP changed
# Update A record to point to new server IP

# 9. Verify recovery
curl -sf https://yeto.causewaygrp.com/api/trpc/monitoring.getHealth
```

### Scenario 4: Data Corruption

**Symptoms**: Incorrect data displayed, integrity check failures

**Impact**: Data reliability compromised

**Recovery Time**: 1-2 hours

```bash
# 1. Identify corruption scope
docker compose exec web pnpm db:verify

# 2. Stop writes
docker compose exec web node -e "process.env.READ_ONLY=true"

# 3. Determine restore point
ls -la /opt/yeto/backups/

# 4. Restore to point before corruption
# Stop application
docker compose stop web

# Restore specific backup
gunzip -c /opt/yeto/backups/yeto-20241228-120000-db.sql.gz | \
  docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD yeto

# 5. Replay any valid transactions if possible
# (Application-specific logic)

# 6. Restart and verify
docker compose start web
docker compose exec web pnpm db:verify
```

### Scenario 5: Security Breach

**Symptoms**: Unauthorized access detected, suspicious activity

**Impact**: Data confidentiality/integrity compromised

**Recovery Time**: 2-8 hours

```bash
# 1. Isolate affected systems
docker compose stop web

# 2. Preserve evidence
docker compose logs > /tmp/incident-logs-$(date +%Y%m%d).txt
cp -r /opt/yeto /tmp/incident-snapshot-$(date +%Y%m%d)

# 3. Rotate all credentials
./scripts/rotate_secrets.sh

# 4. Restore from known-good backup
./scripts/bootstrap_prod.sh --rollback <pre-breach-version>

# 5. Apply security patches
git pull origin main
docker compose up -d --build

# 6. Review and harden
# See SECURITY_RUNBOOK.md for detailed steps

# 7. Notify stakeholders
# Follow communication plan
```

### Scenario 6: Cloud Provider Outage

**Symptoms**: Cannot access cloud resources

**Impact**: Service unavailable

**Recovery Time**: Depends on provider

```bash
# 1. Monitor provider status page
# AWS: https://status.aws.amazon.com/
# etc.

# 2. If prolonged, failover to backup region/provider
# (Requires pre-configured backup infrastructure)

# 3. Update DNS to point to backup
# Update A record to backup server IP

# 4. Notify users of degraded service
# Post status update
```

---

## Recovery Procedures

### Database Backup Restoration

```bash
#!/bin/bash
# restore_database.sh

BACKUP_FILE=$1
DB_NAME=${2:-yeto}

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file> [database_name]"
    echo "Available backups:"
    ls -la /opt/yeto/backups/*.sql.gz
    exit 1
fi

echo "Stopping application..."
docker compose stop web

echo "Restoring database from $BACKUP_FILE..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD $DB_NAME
else
    docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD $DB_NAME < "$BACKUP_FILE"
fi

echo "Running migrations..."
docker compose start web
sleep 10
docker compose exec web pnpm db:push

echo "Verifying restoration..."
docker compose exec web pnpm db:verify

echo "Database restoration complete!"
```

### Application Rollback

```bash
#!/bin/bash
# rollback_application.sh

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    echo "Available versions:"
    ls -la /opt/yeto/backups/ | grep yeto-
    exit 1
fi

BACKUP_DIR="/opt/yeto/backups/$VERSION"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Version not found: $VERSION"
    exit 1
fi

echo "Rolling back to $VERSION..."

# Stop services
docker compose down

# Restore application files
cp -r "$BACKUP_DIR"/* /opt/yeto/

# Restore database if backup exists
if [ -f "$BACKUP_DIR-db.sql.gz" ]; then
    echo "Restoring database..."
    docker compose up -d db
    sleep 10
    gunzip -c "$BACKUP_DIR-db.sql.gz" | docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD yeto
fi

# Start services
docker compose up -d

echo "Rollback complete!"
```

### Full System Recovery

```bash
#!/bin/bash
# full_recovery.sh
# Run this on a fresh server to restore YETO from backup

set -e

echo "=== YETO Full System Recovery ==="

# Prerequisites check
command -v docker >/dev/null 2>&1 || { echo "Docker required"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Git required"; exit 1; }

# Configuration
BACKUP_SERVER=${BACKUP_SERVER:-"backup.causewaygrp.com"}
BACKUP_PATH=${BACKUP_PATH:-"/backups/yeto"}
INSTALL_DIR=${INSTALL_DIR:-"/opt/yeto"}

# 1. Clone repository
echo "Cloning repository..."
git clone https://github.com/MaherFSF/yeto-platform.git "$INSTALL_DIR"
cd "$INSTALL_DIR"

# 2. Restore configuration
echo "Restoring configuration..."
scp "$BACKUP_SERVER:$BACKUP_PATH/.env.production" .env

# 3. Download latest backup
echo "Downloading latest backup..."
LATEST_BACKUP=$(ssh "$BACKUP_SERVER" "ls -t $BACKUP_PATH/db/*.sql.gz | head -1")
scp "$BACKUP_SERVER:$LATEST_BACKUP" /tmp/latest-db.sql.gz

# 4. Start infrastructure
echo "Starting infrastructure..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d db redis

# 5. Wait for database
echo "Waiting for database..."
for i in {1..30}; do
    docker compose exec -T db mysqladmin ping -h localhost --silent && break
    sleep 2
done

# 6. Restore database
echo "Restoring database..."
gunzip -c /tmp/latest-db.sql.gz | docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD yeto

# 7. Start application
echo "Starting application..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 8. Verify
echo "Verifying recovery..."
sleep 30
curl -sf http://localhost:3000/api/trpc/monitoring.getHealth && echo "Recovery successful!" || echo "Recovery may have issues"

echo "=== Recovery Complete ==="
echo "Next steps:"
echo "1. Update DNS if server IP changed"
echo "2. Verify TLS certificates"
echo "3. Test critical functionality"
echo "4. Notify stakeholders"
```

---

## Communication Plan

### Stakeholder Notification

| Stakeholder | Contact Method | Timing |
|-------------|----------------|--------|
| Technical Team | Slack/Email | Immediate |
| Management | Email/Phone | Within 15 min |
| Users | Status Page | Within 30 min |
| Partners | Email | Within 1 hour |

### Status Page Updates

```markdown
# Template: Incident Started
**Status**: Investigating
**Time**: [TIMESTAMP]
**Impact**: [DESCRIPTION]
We are aware of issues affecting [SERVICE] and are investigating.

# Template: Incident Update
**Status**: Identified / In Progress
**Time**: [TIMESTAMP]
**Update**: [DESCRIPTION]
We have identified the issue and are working on a fix.

# Template: Incident Resolved
**Status**: Resolved
**Time**: [TIMESTAMP]
**Resolution**: [DESCRIPTION]
The issue has been resolved. All services are operating normally.
```

### Post-Incident Report Template

```markdown
# Incident Report: [TITLE]

## Summary
- **Date**: [DATE]
- **Duration**: [DURATION]
- **Impact**: [DESCRIPTION]
- **Root Cause**: [DESCRIPTION]

## Timeline
- [TIME] - Issue detected
- [TIME] - Investigation started
- [TIME] - Root cause identified
- [TIME] - Fix implemented
- [TIME] - Service restored

## Root Cause Analysis
[Detailed technical explanation]

## Resolution
[Steps taken to resolve]

## Lessons Learned
1. [LESSON]
2. [LESSON]

## Action Items
- [ ] [ACTION] - Owner: [NAME] - Due: [DATE]
- [ ] [ACTION] - Owner: [NAME] - Due: [DATE]
```

---

## Testing & Validation

### DR Test Schedule

| Test Type | Frequency | Duration |
|-----------|-----------|----------|
| Backup verification | Weekly | 30 min |
| Application rollback | Monthly | 1 hour |
| Database restoration | Monthly | 2 hours |
| Full DR simulation | Quarterly | 4 hours |

### Backup Verification Script

```bash
#!/bin/bash
# verify_backups.sh

echo "=== Backup Verification ==="

BACKUP_DIR="/opt/yeto/backups"
ERRORS=0

# Check backup exists
LATEST=$(ls -t "$BACKUP_DIR"/*-db.sql.gz 2>/dev/null | head -1)
if [ -z "$LATEST" ]; then
    echo "ERROR: No database backups found"
    ERRORS=$((ERRORS + 1))
else
    echo "Latest backup: $LATEST"
    
    # Check backup age
    AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST")) / 3600 ))
    if [ $AGE -gt 24 ]; then
        echo "WARNING: Backup is $AGE hours old"
    else
        echo "Backup age: $AGE hours (OK)"
    fi
    
    # Verify backup integrity
    if gunzip -t "$LATEST" 2>/dev/null; then
        echo "Backup integrity: OK"
    else
        echo "ERROR: Backup is corrupted"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check backup size
SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "Total backup size: $SIZE"

if [ $ERRORS -gt 0 ]; then
    echo "=== VERIFICATION FAILED ==="
    exit 1
else
    echo "=== VERIFICATION PASSED ==="
    exit 0
fi
```

### DR Test Checklist

- [ ] Notify team of planned test
- [ ] Verify backups are current
- [ ] Document current state
- [ ] Execute recovery procedure
- [ ] Verify all services operational
- [ ] Test critical user flows
- [ ] Document any issues
- [ ] Restore production state
- [ ] Update runbook if needed

---

## Appendix

### Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Incident Commander | TBD | TBD | yeto@causewaygrp.com |
| Technical Lead | TBD | TBD | tech@causewaygrp.com |
| Communications | TBD | TBD | comms@causewaygrp.com |

### External Resources

- Cloud Provider Support: [Provider-specific]
- Domain Registrar: [Registrar-specific]
- SSL Certificate Provider: Let's Encrypt (automated)

### Recovery Checklist

```
[ ] Assess situation and classify severity
[ ] Notify incident commander
[ ] Begin recovery procedure
[ ] Update status page
[ ] Execute recovery steps
[ ] Verify service restoration
[ ] Notify stakeholders of resolution
[ ] Document incident
[ ] Schedule post-mortem
```

---

*Last updated: December 28, 2024*
*Emergency contact: yeto@causewaygrp.com*
