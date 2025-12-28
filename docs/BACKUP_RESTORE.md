# YETO Platform - Backup & Restore Procedures

## إجراءات النسخ الاحتياطي والاستعادة | Backup & Restore Guide

This document provides comprehensive backup and restore procedures for the YETO platform.

---

## Table of Contents

1. [Backup Strategy](#backup-strategy)
2. [Automated Backups](#automated-backups)
3. [Manual Backup Procedures](#manual-backup-procedures)
4. [Restore Procedures](#restore-procedures)
5. [Backup Verification](#backup-verification)
6. [Retention Policies](#retention-policies)

---

## Backup Strategy

### What Gets Backed Up

| Component | Method | Frequency | Retention |
|-----------|--------|-----------|-----------|
| Database | mysqldump | Hourly | 30 days |
| File Storage | S3 versioning | Continuous | 90 days |
| Configuration | Git | On change | Permanent |
| Application | Docker image | On deploy | 10 versions |
| Secrets | Encrypted export | Weekly | 90 days |

### Backup Locations

| Type | Primary | Secondary |
|------|---------|-----------|
| Database | `/opt/yeto/backups/db/` | S3 bucket |
| Files | S3 primary bucket | S3 backup bucket |
| Config | GitHub repository | Local encrypted |

### Recovery Point Objectives (RPO)

| Data Type | RPO | Justification |
|-----------|-----|---------------|
| Transactional data | 1 hour | Hourly backups |
| User data | 1 hour | Hourly backups |
| Static content | 24 hours | Daily sync |
| Configuration | 0 | Version controlled |

---

## Automated Backups

### Database Backup Script

```bash
#!/bin/bash
# /opt/yeto/scripts/backup.sh
# Automated database backup script

set -e

# Configuration
BACKUP_DIR="/opt/yeto/backups/db"
S3_BUCKET="${S3_BACKUP_BUCKET:-yeto-backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="yeto-db-$TIMESTAMP.sql"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Create database backup
echo "[$(date)] Starting database backup..."

docker compose exec -T db mysqldump \
    -u"${DB_USER:-yeto}" \
    -p"${DB_PASSWORD}" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    "${DB_NAME:-yeto}" > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

# Calculate checksum
sha256sum "$BACKUP_DIR/$BACKUP_FILE" > "$BACKUP_DIR/$BACKUP_FILE.sha256"

echo "[$(date)] Backup created: $BACKUP_FILE"
echo "[$(date)] Size: $(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)"

# Upload to S3 (if configured)
if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
    echo "[$(date)] Uploading to S3..."
    aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://$S3_BUCKET/db/$BACKUP_FILE"
    aws s3 cp "$BACKUP_DIR/$BACKUP_FILE.sha256" "s3://$S3_BUCKET/db/$BACKUP_FILE.sha256"
    echo "[$(date)] S3 upload complete"
fi

# Cleanup old backups
echo "[$(date)] Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "yeto-db-*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "yeto-db-*.sha256" -mtime +$RETENTION_DAYS -delete

# Cleanup old S3 backups
if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
    aws s3 ls "s3://$S3_BUCKET/db/" | while read -r line; do
        FILE_DATE=$(echo "$line" | awk '{print $1}')
        FILE_NAME=$(echo "$line" | awk '{print $4}')
        if [ -n "$FILE_DATE" ] && [ -n "$FILE_NAME" ]; then
            FILE_AGE=$(( ($(date +%s) - $(date -d "$FILE_DATE" +%s)) / 86400 ))
            if [ $FILE_AGE -gt $RETENTION_DAYS ]; then
                aws s3 rm "s3://$S3_BUCKET/db/$FILE_NAME"
            fi
        fi
    done
fi

echo "[$(date)] Backup complete!"
```

### Cron Schedule

```bash
# /etc/cron.d/yeto-backup

# Database backup - every hour
0 * * * * root /opt/yeto/scripts/backup.sh >> /var/log/yeto-backup.log 2>&1

# Full backup verification - daily at 3 AM
0 3 * * * root /opt/yeto/scripts/verify_backups.sh >> /var/log/yeto-backup.log 2>&1

# Weekly full backup with extended retention
0 2 * * 0 root RETENTION_DAYS=90 /opt/yeto/scripts/backup.sh >> /var/log/yeto-backup.log 2>&1
```

### Docker Compose Backup Service

```yaml
# docker-compose.backup.yml
version: '3.8'

services:
  backup:
    image: mysql:8.0
    container_name: yeto-backup
    volumes:
      - ./backups:/backups
      - ./scripts/backup.sh:/backup.sh:ro
    environment:
      - MYSQL_HOST=db
      - MYSQL_USER=${DB_USER:-yeto}
      - MYSQL_PASSWORD=${DB_PASSWORD}
      - MYSQL_DATABASE=${DB_NAME:-yeto}
      - BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
      - S3_BACKUP_BUCKET=${S3_BACKUP_BUCKET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    networks:
      - yeto-network
    depends_on:
      db:
        condition: service_healthy
    entrypoint: ["/bin/bash", "/backup.sh"]
    profiles:
      - backup
```

---

## Manual Backup Procedures

### Database Backup

```bash
# Quick backup
docker compose exec db mysqldump -u yeto -p yeto > backup.sql

# Compressed backup with timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
docker compose exec db mysqldump -u yeto -p \
    --single-transaction \
    --routines \
    --triggers \
    yeto | gzip > "yeto-db-$TIMESTAMP.sql.gz"

# Backup specific tables
docker compose exec db mysqldump -u yeto -p yeto \
    users indicators observations > partial-backup.sql
```

### Application State Backup

```bash
# Backup current deployment
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="yeto-app-$TIMESTAMP"

mkdir -p "/opt/yeto/backups/$BACKUP_NAME"

# Copy application files
cp -r /opt/yeto/dist "/opt/yeto/backups/$BACKUP_NAME/"
cp -r /opt/yeto/drizzle "/opt/yeto/backups/$BACKUP_NAME/"
cp /opt/yeto/package.json "/opt/yeto/backups/$BACKUP_NAME/"
cp /opt/yeto/.env "/opt/yeto/backups/$BACKUP_NAME/.env.backup"

# Create archive
tar -czf "/opt/yeto/backups/$BACKUP_NAME.tar.gz" \
    -C /opt/yeto/backups "$BACKUP_NAME"

# Cleanup
rm -rf "/opt/yeto/backups/$BACKUP_NAME"

echo "Application backup created: /opt/yeto/backups/$BACKUP_NAME.tar.gz"
```

### Configuration Backup

```bash
# Export environment variables (sanitized)
env | grep -E "^(VITE_|NODE_|DB_NAME|DOMAIN)" | \
    sed 's/=.*/=<REDACTED>/' > config-backup.txt

# Backup Docker Compose files
tar -czf docker-config-backup.tar.gz \
    docker-compose.yml \
    docker-compose.prod.yml \
    traefik/
```

### Secrets Backup

```bash
# Encrypted secrets backup
# Requires GPG key setup

# Export secrets
cat > /tmp/secrets.env << EOF
JWT_SECRET=${JWT_SECRET}
DB_PASSWORD=${DB_PASSWORD}
DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
EOF

# Encrypt
gpg --symmetric --cipher-algo AES256 \
    -o "/opt/yeto/backups/secrets-$(date +%Y%m%d).gpg" \
    /tmp/secrets.env

# Secure delete plaintext
shred -u /tmp/secrets.env

echo "Encrypted secrets backup created"
```

---

## Restore Procedures

### Database Restore

```bash
#!/bin/bash
# restore_database.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh /opt/yeto/backups/db/*.sql.gz 2>/dev/null || echo "No local backups found"
    echo ""
    echo "S3 backups:"
    aws s3 ls s3://$S3_BACKUP_BUCKET/db/ 2>/dev/null || echo "S3 not configured"
    exit 1
fi

# Download from S3 if needed
if [[ "$BACKUP_FILE" == s3://* ]]; then
    echo "Downloading from S3..."
    LOCAL_FILE="/tmp/$(basename $BACKUP_FILE)"
    aws s3 cp "$BACKUP_FILE" "$LOCAL_FILE"
    BACKUP_FILE="$LOCAL_FILE"
fi

# Verify backup integrity
if [ -f "$BACKUP_FILE.sha256" ]; then
    echo "Verifying backup integrity..."
    sha256sum -c "$BACKUP_FILE.sha256" || {
        echo "ERROR: Backup integrity check failed!"
        exit 1
    }
fi

# Confirm restore
echo ""
echo "WARNING: This will overwrite the current database!"
echo "Backup file: $BACKUP_FILE"
echo "Database: ${DB_NAME:-yeto}"
echo ""
read -p "Type 'RESTORE' to confirm: " CONFIRM

if [ "$CONFIRM" != "RESTORE" ]; then
    echo "Restore cancelled"
    exit 1
fi

# Stop application
echo "Stopping application..."
docker compose stop web

# Create safety backup
echo "Creating safety backup of current database..."
docker compose exec -T db mysqldump -u root -p$DB_ROOT_PASSWORD ${DB_NAME:-yeto} | \
    gzip > "/opt/yeto/backups/db/pre-restore-$(date +%Y%m%d-%H%M%S).sql.gz"

# Restore database
echo "Restoring database..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD ${DB_NAME:-yeto}
else
    docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD ${DB_NAME:-yeto} < "$BACKUP_FILE"
fi

# Run migrations (in case schema changed)
echo "Running migrations..."
docker compose start web
sleep 10
docker compose exec web pnpm db:push

# Verify restore
echo "Verifying restore..."
docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD ${DB_NAME:-yeto} \
    -e "SELECT COUNT(*) as tables FROM information_schema.tables WHERE table_schema='${DB_NAME:-yeto}';"

echo ""
echo "Database restore complete!"
echo "Please verify application functionality."
```

### Application Restore

```bash
#!/bin/bash
# restore_application.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    echo ""
    echo "Available backups:"
    ls -lh /opt/yeto/backups/yeto-app-*.tar.gz 2>/dev/null
    exit 1
fi

echo "Restoring application from: $BACKUP_FILE"

# Stop services
docker compose down

# Backup current state
mv /opt/yeto/dist /opt/yeto/dist.old 2>/dev/null

# Extract backup
tar -xzf "$BACKUP_FILE" -C /opt/yeto/

# Restore from extracted directory
BACKUP_DIR=$(basename "$BACKUP_FILE" .tar.gz)
if [ -d "/opt/yeto/$BACKUP_DIR" ]; then
    cp -r "/opt/yeto/$BACKUP_DIR/dist" /opt/yeto/
    cp -r "/opt/yeto/$BACKUP_DIR/drizzle" /opt/yeto/
    rm -rf "/opt/yeto/$BACKUP_DIR"
fi

# Start services
docker compose up -d

# Verify
sleep 30
curl -sf http://localhost:3000/api/trpc/monitoring.getLiveness && \
    echo "Application restore successful!" || \
    echo "WARNING: Application may not be healthy"
```

### Point-in-Time Recovery

```bash
#!/bin/bash
# point_in_time_restore.sh
# Restore database to a specific point in time

TARGET_TIME=$1  # Format: YYYY-MM-DD HH:MM:SS

if [ -z "$TARGET_TIME" ]; then
    echo "Usage: $0 'YYYY-MM-DD HH:MM:SS'"
    exit 1
fi

# Find the backup just before target time
TARGET_EPOCH=$(date -d "$TARGET_TIME" +%s)

BEST_BACKUP=""
BEST_DIFF=999999999

for backup in /opt/yeto/backups/db/yeto-db-*.sql.gz; do
    # Extract timestamp from filename
    BACKUP_TIME=$(echo "$backup" | grep -oP '\d{8}-\d{6}')
    BACKUP_EPOCH=$(date -d "${BACKUP_TIME:0:8} ${BACKUP_TIME:9:2}:${BACKUP_TIME:11:2}:${BACKUP_TIME:13:2}" +%s)
    
    if [ $BACKUP_EPOCH -le $TARGET_EPOCH ]; then
        DIFF=$((TARGET_EPOCH - BACKUP_EPOCH))
        if [ $DIFF -lt $BEST_DIFF ]; then
            BEST_DIFF=$DIFF
            BEST_BACKUP=$backup
        fi
    fi
done

if [ -z "$BEST_BACKUP" ]; then
    echo "No suitable backup found for target time: $TARGET_TIME"
    exit 1
fi

echo "Best backup for point-in-time recovery: $BEST_BACKUP"
echo "Backup is $((BEST_DIFF / 60)) minutes before target time"
echo ""

# Proceed with restore
./restore_database.sh "$BEST_BACKUP"
```

---

## Backup Verification

### Verification Script

```bash
#!/bin/bash
# verify_backups.sh

echo "=== YETO Backup Verification ==="
echo "Date: $(date)"
echo ""

ERRORS=0
WARNINGS=0

# Check local backups
echo "Checking local backups..."
BACKUP_DIR="/opt/yeto/backups/db"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "ERROR: Backup directory does not exist"
    ERRORS=$((ERRORS + 1))
else
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
    echo "  Local backups found: $BACKUP_COUNT"
    
    if [ $BACKUP_COUNT -eq 0 ]; then
        echo "  ERROR: No backups found!"
        ERRORS=$((ERRORS + 1))
    else
        # Check latest backup
        LATEST=$(ls -t "$BACKUP_DIR"/*.sql.gz | head -1)
        LATEST_AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST")) / 3600 ))
        LATEST_SIZE=$(du -h "$LATEST" | cut -f1)
        
        echo "  Latest backup: $(basename $LATEST)"
        echo "  Age: $LATEST_AGE hours"
        echo "  Size: $LATEST_SIZE"
        
        if [ $LATEST_AGE -gt 2 ]; then
            echo "  WARNING: Latest backup is more than 2 hours old"
            WARNINGS=$((WARNINGS + 1))
        fi
        
        # Verify integrity
        if gunzip -t "$LATEST" 2>/dev/null; then
            echo "  Integrity: OK"
        else
            echo "  ERROR: Backup is corrupted!"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Verify checksum if exists
        if [ -f "$LATEST.sha256" ]; then
            if sha256sum -c "$LATEST.sha256" --quiet 2>/dev/null; then
                echo "  Checksum: OK"
            else
                echo "  ERROR: Checksum mismatch!"
                ERRORS=$((ERRORS + 1))
            fi
        fi
    fi
fi

# Check S3 backups
echo ""
echo "Checking S3 backups..."
if [ -n "$S3_BACKUP_BUCKET" ] && command -v aws &> /dev/null; then
    S3_COUNT=$(aws s3 ls "s3://$S3_BACKUP_BUCKET/db/" 2>/dev/null | wc -l)
    echo "  S3 backups found: $S3_COUNT"
    
    if [ $S3_COUNT -eq 0 ]; then
        echo "  WARNING: No S3 backups found"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "  S3 not configured or AWS CLI not available"
fi

# Test restore (dry run)
echo ""
echo "Testing restore capability..."
if [ -n "$LATEST" ]; then
    # Create test database
    TEST_DB="yeto_backup_test_$$"
    
    docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD \
        -e "CREATE DATABASE IF NOT EXISTS $TEST_DB;" 2>/dev/null
    
    # Try to restore
    if gunzip -c "$LATEST" | docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD $TEST_DB 2>/dev/null; then
        echo "  Restore test: OK"
        
        # Verify data
        TABLE_COUNT=$(docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD $TEST_DB \
            -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$TEST_DB';" 2>/dev/null)
        echo "  Tables restored: $TABLE_COUNT"
    else
        echo "  ERROR: Restore test failed!"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Cleanup test database
    docker compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD \
        -e "DROP DATABASE IF EXISTS $TEST_DB;" 2>/dev/null
fi

# Summary
echo ""
echo "=== Verification Summary ==="
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"

if [ $ERRORS -gt 0 ]; then
    echo "STATUS: FAILED"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "STATUS: WARNING"
    exit 0
else
    echo "STATUS: PASSED"
    exit 0
fi
```

### Restore Testing

```bash
# Monthly restore test procedure
# Run in staging environment

# 1. Get latest production backup
aws s3 cp s3://yeto-backups/db/$(aws s3 ls s3://yeto-backups/db/ | sort | tail -1 | awk '{print $4}') /tmp/test-restore.sql.gz

# 2. Restore to staging database
gunzip -c /tmp/test-restore.sql.gz | mysql -h staging-db -u yeto -p yeto_staging

# 3. Run application tests
cd /opt/yeto-staging
pnpm test

# 4. Verify data integrity
pnpm db:verify

# 5. Document results
echo "Restore test completed: $(date)" >> /var/log/restore-tests.log
```

---

## Retention Policies

### Retention Schedule

| Backup Type | Retention | Storage |
|-------------|-----------|---------|
| Hourly | 24 hours | Local |
| Daily | 7 days | Local + S3 |
| Weekly | 4 weeks | S3 |
| Monthly | 12 months | S3 Glacier |
| Yearly | 7 years | S3 Glacier Deep Archive |

### Storage Lifecycle Policy

```json
{
  "Rules": [
    {
      "ID": "HourlyBackupCleanup",
      "Filter": { "Prefix": "db/hourly/" },
      "Status": "Enabled",
      "Expiration": { "Days": 1 }
    },
    {
      "ID": "DailyBackupCleanup",
      "Filter": { "Prefix": "db/daily/" },
      "Status": "Enabled",
      "Expiration": { "Days": 7 }
    },
    {
      "ID": "WeeklyToGlacier",
      "Filter": { "Prefix": "db/weekly/" },
      "Status": "Enabled",
      "Transitions": [
        { "Days": 30, "StorageClass": "GLACIER" }
      ],
      "Expiration": { "Days": 365 }
    },
    {
      "ID": "MonthlyToDeepArchive",
      "Filter": { "Prefix": "db/monthly/" },
      "Status": "Enabled",
      "Transitions": [
        { "Days": 90, "StorageClass": "DEEP_ARCHIVE" }
      ],
      "Expiration": { "Days": 2555 }
    }
  ]
}
```

### Cleanup Script

```bash
#!/bin/bash
# cleanup_backups.sh

BACKUP_DIR="/opt/yeto/backups"

# Remove hourly backups older than 24 hours
find "$BACKUP_DIR/db" -name "yeto-db-*.sql.gz" -mmin +1440 -delete

# Keep only last 7 daily backups
ls -t "$BACKUP_DIR/db/daily/"*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm

# Archive weekly backups to S3
for backup in "$BACKUP_DIR/db/weekly/"*.sql.gz; do
    if [ -f "$backup" ]; then
        AGE=$(( ($(date +%s) - $(stat -c %Y "$backup")) / 86400 ))
        if [ $AGE -gt 7 ]; then
            aws s3 mv "$backup" "s3://$S3_BACKUP_BUCKET/archive/weekly/"
        fi
    fi
done

echo "Backup cleanup complete"
```

---

*Last updated: December 28, 2024*
