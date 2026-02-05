# YETO Disaster Recovery Runbook

**Version**: 1.0  
**Last Updated**: February 5, 2026  
**Maintainer**: Manus (DevOps/SRE Lead)

---

## Recovery Scenarios

### Scenario 1: Database Crash

**Symptoms**: Application cannot connect to MySQL

**Recovery Steps**:
1. Check database status:
   ```bash
   systemctl status mysql
   # Or for Docker
   docker ps | grep mysql
   ```

2. Restart database:
   ```bash
   systemctl restart mysql
   # Or
   docker-compose restart db
   ```

3. Verify connection:
   ```bash
   mysql -u root -p yeto_db -e "SELECT COUNT(*) FROM source_registry;"
   ```

4. Run health check:
   ```bash
   curl https://yeto.causewaygrp.com/api/health
   ```

**RTO**: 5 minutes  
**RPO**: 0 (continuous replication)

---

### Scenario 2: Stuck Ingestion Jobs

**Symptoms**: Work queue has jobs in RUNNING state for > 1 hour

**Recovery Steps**:
1. Identify stuck jobs:
   ```sql
   SELECT * FROM ingestion_work_queue
   WHERE state = 'RUNNING'
     AND startedAt < DATE_SUB(NOW(), INTERVAL 1 HOUR);
   ```

2. Reset stuck jobs:
   ```bash
   npm run work-queue:reset-stuck
   ```

3. Verify jobs resume:
   ```sql
   SELECT state, COUNT(*) FROM ingestion_work_queue GROUP BY state;
   ```

**RTO**: 2 minutes  
**RPO**: Jobs resume from last checkpoint

---

### Scenario 3: Registry Import Failure

**Symptoms**: Import fails mid-run, registry partially updated

**Recovery Steps**:
1. Check import logs:
   ```bash
   tail -f /var/log/yeto/import.log
   ```

2. Review diffs:
   ```sql
   SELECT * FROM registry_diff_log
   WHERE importRunId = (SELECT importRunId FROM registry_diff_log ORDER BY createdAt DESC LIMIT 1)
   ORDER BY createdAt DESC
   LIMIT 50;
   ```

3. Rollback if needed:
   ```bash
   # Restore from backup
   mysql yeto_db < backups/source_registry_pre_import.sql
   ```

4. Re-run import:
   - Fix Excel file
   - Re-import via admin console

**RTO**: 10 minutes  
**RPO**: Last successful import (tracked in `registry_diff_log`)

---

### Scenario 4: S3 Storage Unavailable

**Symptoms**: Document downloads fail, signed URLs return 403/404

**Recovery Steps**:
1. Check S3 credentials:
   ```bash
   aws s3 ls s3://yeto-documents/ --profile yeto
   ```

2. Verify IAM permissions:
   - GetObject, PutObject required
   - Check bucket policy

3. Regenerate signed URLs:
   ```bash
   # Documents will auto-regenerate on next request
   # No manual action needed
   ```

4. Fallback: Serve from local cache if configured

**RTO**: 1 minute (auto-regenerate)  
**RPO**: 0 (documents immutable once uploaded)

---

### Scenario 5: AI Agent Not Responding

**Symptoms**: Sector agent returns errors, no responses

**Recovery Steps**:
1. Check API key:
   ```bash
   echo $ANTHROPIC_API_KEY | head -c 20
   ```

2. Test API directly:
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-sonnet-4-20250514","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'
   ```

3. Check context packs:
   ```sql
   SELECT sectorCode, generatedAt, validUntil
   FROM sector_context_packs
   WHERE validUntil > NOW()
   ORDER BY generatedAt DESC;
   ```

4. Rebuild context packs:
   ```bash
   npm run context-packs:build-all
   ```

**RTO**: 5 minutes  
**RPO**: Last context pack (24 hour validity)

---

### Scenario 6: Registry Lint Fails CI

**Symptoms**: CI pipeline fails on PIPE_REGISTRY_LINT

**Recovery Steps**:
1. Get lint report:
   ```bash
   npm run registry:lint
   ```

2. Review errors:
   ```json
   {
     "passed": false,
     "errors": [
       {"sourceId": "SRC-123", "rule": "MISSING_NAME", "severity": "ERROR"}
     ]
   }
   ```

3. Fix errors in Excel:
   - Edit SOURCES_MASTER_EXT sheet
   - Correct invalid values
   - Save and re-import

4. Re-run lint:
   ```bash
   npm run registry:lint
   ```

**RTO**: 15 minutes  
**RPO**: N/A (validation issue, not data loss)

---

## Backup & Restore

### Daily Backups (Automated)

**Schedule**: 04:00 UTC daily

**What's Backed Up**:
- Full MySQL dump: `/backups/mysql/yeto_db_YYYYMMDD.sql.gz`
- Registry Excel: `/backups/registry/v2_3_YYYYMMDD.xlsx`
- S3 bucket snapshot: Versioning enabled

**Retention**:
- Daily: 7 days
- Weekly: 4 weeks
- Monthly: 12 months

### Restore from Backup

**Full Database Restore**:
```bash
# 1. Stop application
pm2 stop yeto

# 2. Restore database
gunzip -c backups/mysql/yeto_db_20260205.sql.gz | mysql -u root -p yeto_db

# 3. Verify
mysql -u root -p yeto_db -e "SELECT COUNT(*) FROM source_registry;"

# 4. Restart application
pm2 start yeto
```

**Partial Restore (Registry Only)**:
```bash
# Extract registry tables only
gunzip -c backups/mysql/yeto_db_20260205.sql.gz | \
  grep -A 1000000 "CREATE TABLE \`source_registry\`" | \
  grep -B 1000000 "CREATE TABLE" | \
  head -n -1 | \
  mysql -u root -p yeto_db
```

---

## Contact Information

**On-Call Rotation**: See Manus Dashboard

**Escalation**:
1. DevOps Lead: `devops@causewaygrp.com`
2. Data Engineering: `data@causewaygrp.com`
3. CTO: `cto@causewaygrp.com`

**Emergency Hotline**: +1-XXX-XXX-XXXX (24/7)

---

**Document Owner**: Manus (DevOps/SRE Lead)  
**Review Cycle**: Quarterly  
**Last Drill**: TBD
