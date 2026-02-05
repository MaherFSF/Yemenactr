# YETO Database Migration Runbook

**Version:** 1.0  
**Last Updated:** 2026-02-05  
**Applies To:** Schema v2.5 and all future migrations

---

## Overview

This runbook provides step-by-step instructions for applying database migrations to the YETO platform. It covers local development, CI/CD, and production deployment scenarios.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Migration System](#migration-system)
3. [Local Development Migrations](#local-development-migrations)
4. [CI/CD Migrations](#cicd-migrations)
5. [Production Migrations](#production-migrations)
6. [Schema v2.5 Specific Instructions](#schema-v25-specific-instructions)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)
9. [Future Migration Guidelines](#future-migration-guidelines)

---

## Prerequisites

### Required Tools

- Node.js 22+
- pnpm 9.15.4+
- Database access (MySQL 8.0 compatible)
- Git access to repository

### Environment Variables

```bash
DATABASE_URL="mysql://user:password@host:port/database"
```

For local development:
```bash
DATABASE_URL="mysql://root:root@127.0.0.1:3306/yeto_dev"
```

For CI testing:
```bash
DATABASE_URL="mysql://root:root@127.0.0.1:3306/yeto_test"
```

---

## Migration System

### Technology Stack

- **ORM:** Drizzle ORM
- **Migration Tool:** drizzle-kit
- **Migration Location:** `./drizzle/`
- **Schema Definition:** `./drizzle/schema.ts`

### Migration Files

Migrations are stored as:
```
drizzle/
├── 0000_*.sql              # Initial schema
├── 0001_*.sql              # Migration 1
├── ...
├── 0028_add_v2_5_governance_columns.sql  # v2.5 migration
└── meta/
    ├── _journal.json       # Migration registry
    └── 0000_snapshot.json  # Schema snapshots
```

### Migration Naming Convention

```
[number]_[descriptive_name].sql
```

Example: `0028_add_v2_5_governance_columns.sql`

---

## Local Development Migrations

### Step 1: Ensure Clean State

```bash
# Check current git status
git status

# Ensure you're on the correct branch
git checkout cursor/schema-v2-5-governance-columns-0a9d

# Pull latest changes
git pull origin cursor/schema-v2-5-governance-columns-0a9d
```

### Step 2: Install Dependencies

```bash
pnpm install --frozen-lockfile
```

### Step 3: Apply Migrations

**Option A: Using pnpm script (recommended)**
```bash
pnpm db:push
```

This command:
1. Generates migration files from schema
2. Applies all pending migrations
3. Updates the database to match `drizzle/schema.ts`

**Option B: Using drizzle-kit directly**
```bash
# Generate migration SQL from schema changes
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate
```

### Step 4: Verify Migration

```bash
# Run schema gate check
node scripts/release-gate.mjs
```

Expected output:
```
🔍 Gate 9: v2.5 Schema Columns
   ✅ v2.5 columns: All present
```

### Step 5: Verify TypeScript Compilation

```bash
pnpm typecheck
```

Should complete without errors.

### Step 6: Run Tests

```bash
pnpm test
```

All tests should pass.

---

## CI/CD Migrations

### GitHub Actions Workflow

The CI workflow automatically applies migrations before running tests.

**File:** `.github/workflows/main.yml`

**Relevant Steps:**
```yaml
- name: Apply DB schema (drizzle)
  shell: bash
  run: |
    if pnpm -s run | grep -q "db:push"; then
      pnpm db:push
    elif pnpm -s run | grep -q "db:migrate"; then
      pnpm db:migrate
    fi

- name: Release gate
  run: node scripts/release-gate.mjs
```

### CI Environment

- **Database:** MySQL 8.0 service container
- **DATABASE_URL:** `mysql://root:root@127.0.0.1:3306/yeto_test`
- **Auto-seeding:** `scripts/seed-ci.mjs` runs after migrations

### CI Failure Resolution

If Gate 9 fails in CI:

1. **Check Error Message:**
   ```
   ❌ v2.5 columns: Missing columns detected
      Missing: [column names]
   ```

2. **Verify Migration Files:**
   - Ensure `0028_add_v2_5_governance_columns.sql` exists
   - Ensure `drizzle/meta/_journal.json` includes migration entry

3. **Verify Schema Definition:**
   - Check `drizzle/schema.ts` includes all v2.5 columns

4. **Re-run Locally:**
   ```bash
   # Clean database
   pnpm db:push
   
   # Run gate
   node scripts/release-gate.mjs
   ```

5. **Push Fix:**
   ```bash
   git add drizzle/
   git commit -m "fix: ensure v2.5 migration files are included"
   git push
   ```

---

## Production Migrations

### ⚠️ Production Migration Protocol

**CRITICAL:** Production migrations require careful coordination.

### Pre-Migration Checklist

- [ ] Migration tested in local development
- [ ] Migration tested in CI
- [ ] All tests pass
- [ ] Rollback plan documented
- [ ] Database backup completed
- [ ] Downtime window scheduled (if required)
- [ ] Team notified of deployment

### Production Migration Steps

#### Step 1: Backup Production Database

```bash
# MySQL backup
mysqldump -h [HOST] -u [USER] -p [DATABASE] > backup_pre_v2.5_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backup_pre_v2.5_*.sql
```

#### Step 2: Test Migration on Staging

```bash
# Apply to staging first
DATABASE_URL="mysql://..." pnpm db:push

# Run gate check
DATABASE_URL="mysql://..." node scripts/release-gate.mjs

# Run integration tests
DATABASE_URL="mysql://..." pnpm test
```

#### Step 3: Deploy to Production

**Option A: Zero-Downtime (v2.5 compatible)**

Schema v2.5 migration is zero-downtime compatible because:
- All columns are nullable
- No defaults that could cause writes to fail
- No foreign key constraints added
- Additive only (no drops or renames)

```bash
# SSH to production server
ssh production-server

# Navigate to app directory
cd /app/yeto

# Pull latest code
git pull origin main

# Install dependencies
pnpm install --frozen-lockfile

# Apply migration
DATABASE_URL="mysql://..." pnpm db:push

# Verify
DATABASE_URL="mysql://..." node scripts/release-gate.mjs

# Restart application (optional for schema changes)
systemctl restart yeto
```

**Option B: With Maintenance Window**

If cautious approach preferred:

```bash
# 1. Enable maintenance mode
echo "MAINTENANCE_MODE=true" >> .env

# 2. Stop application
systemctl stop yeto

# 3. Apply migration
DATABASE_URL="mysql://..." pnpm db:push

# 4. Verify migration
DATABASE_URL="mysql://..." node scripts/release-gate.mjs

# 5. Start application
systemctl start yeto

# 6. Disable maintenance mode
sed -i '/MAINTENANCE_MODE/d' .env
```

#### Step 4: Post-Migration Verification

```bash
# Check application logs
journalctl -u yeto -f --since "5 minutes ago"

# Verify schema gate
curl https://production-url/api/health
# OR
ssh production-server "cd /app/yeto && node scripts/release-gate.mjs"

# Monitor application metrics
# - Response times
# - Error rates
# - Database query performance
```

---

## Schema v2.5 Specific Instructions

### What Changed

Added 5 columns to `source_registry`:
1. `sourceType` - ENUM (nullable)
2. `licenseState` - ENUM (nullable)
3. `needsClassification` - BOOLEAN (nullable)
4. `reliabilityScore` - DECIMAL(5,2) (nullable)
5. `evidencePackFlag` - BOOLEAN (nullable)

### Zero-Downtime Guarantee

✅ **SAFE FOR ZERO-DOWNTIME DEPLOYMENT**

Reasons:
- All columns nullable → no write failures
- No defaults → no implicit data modification
- Additive only → no data loss risk
- No foreign keys → no constraint violations
- Indexed columns use non-blocking index creation

### Expected Duration

- **Local/Dev:** < 1 second (empty database)
- **CI:** < 1 second (test database)
- **Production:** 1-5 seconds (depends on table size)
  - Small databases (<1M rows): < 1 second
  - Large databases (>1M rows): < 5 seconds

### Monitoring

After migration, monitor:
```sql
-- Verify columns exist
DESCRIBE source_registry;

-- Check for NULL values (expected initially)
SELECT 
  COUNT(*) as total_sources,
  COUNT(sourceType) as sources_with_type,
  COUNT(licenseState) as sources_with_license,
  COUNT(reliabilityScore) as sources_with_score
FROM source_registry;
```

Expected initial state:
- All new columns should be NULL for existing rows
- New rows can populate these columns

---

## Troubleshooting

### Issue: Migration Fails with "Column already exists"

**Cause:** Migration already applied, or partial application.

**Solution:**
```bash
# Check current schema
mysql -h [HOST] -u [USER] -p -e "DESCRIBE source_registry" [DATABASE]

# If columns exist, update journal manually
# Edit drizzle/meta/_journal.json to mark as applied

# Or re-generate migrations
npx drizzle-kit push --force
```

### Issue: Gate 9 Still Fails After Migration

**Cause:** Migration not fully applied or schema.ts out of sync.

**Solution:**
```bash
# Re-apply migration
pnpm db:push

# Force regenerate
npx drizzle-kit generate
npx drizzle-kit migrate

# Verify directly in database
mysql -h [HOST] -u [USER] -p -e "DESCRIBE source_registry" [DATABASE] | grep -E "(sourceType|licenseState|needsClassification|reliabilityScore|evidencePackFlag)"
```

### Issue: TypeScript Errors After Migration

**Cause:** Schema types not regenerated.

**Solution:**
```bash
# Regenerate Drizzle types
npx drizzle-kit generate

# Clear TypeScript cache
rm -rf node_modules/.cache

# Re-check
pnpm typecheck
```

### Issue: Tests Fail After Migration

**Cause:** Tests expect old schema or don't handle NULL values.

**Solution:**
```bash
# Identify failing tests
pnpm test --reporter=verbose

# Check if tests query new columns
# Update tests to handle NULL values

# Example fix:
# OLD: expect(source.reliabilityScore).toBe(95)
# NEW: expect(source.reliabilityScore).toBe(95) || expect(source.reliabilityScore).toBeNull()
```

---

## Rollback Procedures

### When to Rollback

Consider rollback if:
- Migration causes application errors
- Performance degradation detected
- Data integrity issues discovered
- Unexpected behavior in production

### Rollback Steps

#### Step 1: Stop Application (if required)

```bash
systemctl stop yeto
```

#### Step 2: Restore Database Backup

**Option A: Full Restore (safest)**
```bash
# Restore from backup
mysql -h [HOST] -u [USER] -p [DATABASE] < backup_pre_v2.5_TIMESTAMP.sql

# Verify restore
mysql -h [HOST] -u [USER] -p -e "DESCRIBE source_registry" [DATABASE]
```

**Option B: Drop Columns Only (faster)**
```sql
-- Connect to database
mysql -h [HOST] -u [USER] -p [DATABASE]

-- Drop v2.5 columns in reverse order
ALTER TABLE source_registry DROP COLUMN evidencePackFlag;
ALTER TABLE source_registry DROP COLUMN reliabilityScore;
ALTER TABLE source_registry DROP COLUMN needsClassification;
ALTER TABLE source_registry DROP COLUMN licenseState;
ALTER TABLE source_registry DROP COLUMN sourceType;

-- Drop indexes
DROP INDEX source_registry_source_type_idx ON source_registry;
DROP INDEX source_registry_license_state_idx ON source_registry;
DROP INDEX source_registry_reliability_score_idx ON source_registry;
```

#### Step 3: Rollback Code

```bash
# Revert to previous commit
git revert HEAD

# Or checkout previous version
git checkout [previous-commit-hash]

# Redeploy
pnpm install
pnpm build
systemctl start yeto
```

#### Step 4: Verify Rollback

```bash
# Check gate (should fail Gate 9, which is expected for pre-v2.5)
node scripts/release-gate.mjs

# Check application health
curl https://production-url/api/health

# Monitor logs
journalctl -u yeto -f
```

### Rollback Risk Assessment

**Schema v2.5 Rollback Risk:** 🟢 **ZERO RISK**

- No data to lose (columns added empty)
- No dependencies on new columns in v2.5 code
- Application continues to function without v2.5 columns

---

## Future Migration Guidelines

### Creating New Migrations

#### Step 1: Update Schema

Edit `drizzle/schema.ts`:
```typescript
export const myTable = mysqlTable("my_table", {
  // ... existing columns
  newColumn: varchar("newColumn", { length: 255 }), // Add new column
});
```

#### Step 2: Generate Migration

```bash
# Drizzle auto-generates migration SQL
npx drizzle-kit generate
```

This creates:
- `drizzle/XXXX_descriptive_name.sql`
- `drizzle/meta/XXXX_snapshot.json`
- Updates `drizzle/meta/_journal.json`

#### Step 3: Review Generated SQL

```bash
# Review the generated SQL
cat drizzle/XXXX_descriptive_name.sql

# Verify it matches your intent
# Check for:
# - Correct column types
# - Appropriate NULL/NOT NULL constraints
# - Proper defaults
# - Necessary indexes
```

#### Step 4: Test Locally

```bash
# Apply migration
pnpm db:push

# Run tests
pnpm test

# Run gate checks
node scripts/release-gate.mjs
```

#### Step 5: Document Migration

Create or update:
- Migration-specific docs (e.g., `docs/SCHEMA_V2_6.md`)
- Update this runbook if new patterns introduced
- Update truth table if governance columns added

### Migration Best Practices

#### ✅ DO:

1. **Make migrations additive**
   - Add columns (nullable)
   - Add indexes (non-blocking)
   - Add tables

2. **Use NULL for unknowns**
   - Never fabricate data with defaults
   - Document why NULL is appropriate

3. **Test thoroughly**
   - Local dev
   - CI
   - Staging
   - Load test if structural changes

4. **Document everything**
   - Purpose of each column
   - Backfill strategy
   - Rollback procedure

5. **Version migrations**
   - Increment schema version
   - Update release gates
   - Tag in git

#### ❌ DON'T:

1. **Drop columns without coordination**
   - Requires multi-phase deployment
   - Must deprecate first
   - Document grace period

2. **Rename columns directly**
   - Use add + backfill + drop pattern
   - Maintain backward compatibility window

3. **Add NOT NULL without defaults**
   - Will break on existing rows
   - Use nullable first, then migrate

4. **Change column types destructively**
   - Use new column + migration + drop old pattern
   - Preserve data integrity

5. **Skip documentation**
   - Future maintainers need context
   - Governance requires audit trail

### Multi-Phase Migration Pattern

For breaking changes, use this pattern:

**Phase 1: Add New**
```sql
ALTER TABLE my_table ADD COLUMN new_column VARCHAR(255);
```

**Phase 2: Backfill**
```sql
UPDATE my_table SET new_column = old_column WHERE new_column IS NULL;
```

**Phase 3: Enforce**
```sql
ALTER TABLE my_table MODIFY COLUMN new_column VARCHAR(255) NOT NULL;
```

**Phase 4: Deprecate Old**
```sql
-- Mark as deprecated in code
-- Add warnings for old column usage
```

**Phase 5: Remove Old**
```sql
ALTER TABLE my_table DROP COLUMN old_column;
```

---

## Compliance and Governance

### Audit Trail

All migrations must:
- Be tracked in git
- Include purpose documentation
- Update schema version
- Pass release gates

### Data Integrity Rules

From `docs/CONSTITUTION.md`:

1. **No data fabrication** (Hard Rule 2)
   - Use NULL for unknowns
   - No arbitrary defaults

2. **Provenance preservation** (Hard Rule 4)
   - Maintain audit trail
   - Version all schema changes

3. **Forward compatibility** (Hard Rule 3)
   - Additive changes preferred
   - Document breaking changes

### Release Gate Integration

Schema migrations must pass:
- **Gate 2:** Schema version check
- **Gate 9:** v2.5 columns present (current)

Future gates may add additional schema checks.

---

## Support and Escalation

### Documentation Resources

- Schema v2.5: `docs/SCHEMA_V2_5.md`
- Truth Table: `docs/SCHEMA_V2_5_TRUTH_TABLE.md`
- Architecture: `docs/ARCHITECTURE.md`
- Data Governance: `docs/DATA_GOVERNANCE.md`

### Escalation Path

1. **Level 1:** Check this runbook and schema docs
2. **Level 2:** Review git history and previous migrations
3. **Level 3:** Check GitHub issues and pull requests
4. **Level 4:** Contact platform team

### Emergency Contacts

- **Database Issues:** Platform infrastructure team
- **Schema Design:** Data platform engineer
- **Governance Questions:** Data governance team

---

## Appendix

### Quick Reference Commands

```bash
# Local development
pnpm db:push                    # Apply migrations
node scripts/release-gate.mjs   # Verify schema
pnpm typecheck                  # Check TypeScript
pnpm test                       # Run tests

# Migration generation
npx drizzle-kit generate        # Generate from schema
npx drizzle-kit migrate         # Apply to database

# Database inspection
mysql -e "DESCRIBE source_registry" # Check schema
mysql -e "SHOW TABLES"              # List tables

# Rollback
git revert HEAD                     # Revert code
mysql < backup_file.sql             # Restore database
```

### Schema Version History

| Version | Date | Description | Migration |
|---------|------|-------------|-----------|
| 1.0 | 2024-12 | Initial schema | 0000-0026 |
| 2.5 | 2026-02-05 | Governance columns | 0027-0028 |

---

*Runbook Version: 1.0*  
*Last Updated: 2026-02-05*  
*Maintainer: Data Platform Team*  
*Status: Active*
