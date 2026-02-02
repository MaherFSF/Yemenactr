# CI Failure Root Cause Analysis

**Date:** 2026-02-02  
**Runs Analyzed:** GitHub Actions #14 (commit a79e760)

---

## 1. Exact GitHub Actions Failing Stack Trace (First Failure)

```
2026-02-02T17:30:53.2555048Z params: [],
2026-02-02T17:30:53.2555628Z cause: Error: Specified key was too long; max key length is 3072 bytes
2026-02-02T17:30:53.2557398Z at PromiseConnection.query (/home/runner/work/Yemenactr/Yemenactr/node_modules/.pnpm/mysql2@3.15.1/node_modules/mysql2/lib/promise/connection.js:29:22)
2026-02-02T17:30:53.2578295Z at async MySqlDialect.migrate (/home/runner/work/Yemenactr/Yemenactr/node_modules/.pnpm/drizzle-orm@0.44.6_mysql2@3.15.1/node_modules/src/mysql-core/dialect.ts:75:3) {
2026-02-02T17:30:53.2580793Z code: 'ER_TOO_LONG_KEY',
2026-02-02T17:30:53.2581182Z errno: 1071,
2026-02-02T17:30:53.2581827Z sql: '\nCREATE INDEX `update_source_url_idx` ON `update_items` (`sourceUrl`);',
2026-02-02T17:30:53.2582504Z sqlState: '42000',
2026-02-02T17:30:53.2583101Z sqlMessage: 'Specified key was too long; max key length is 3072 bytes'
```

---

## 2. Which Test File/Line Fails

**The failure is NOT in a test file.** The failure occurs during the **"Apply DB schema (drizzle)"** step, which runs `pnpm db:push` BEFORE the unit tests.

The failing SQL statement:
```sql
CREATE INDEX `update_source_url_idx` ON `update_items` (`sourceUrl`);
```

This is in migration file: `drizzle/0020_jazzy_ravenous.sql` (line 120, now removed locally but not synced to CI).

---

## 3. Does DATABASE_URL Exist in CI?

**YES**

The CI workflow (`main.yml`) defines a MySQL 8.0 service container:

```yaml
services:
  mysql:
    image: mysql:8.0
    env:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: yeto_test
    ports:
      - 3306:3306
```

And sets `DATABASE_URL` in the environment:
```yaml
env:
  DATABASE_URL: mysql://root:root@mysql:3306/yeto_test
```

---

## 4. Does the CI Job Start Any DB Service?

**YES**

The CI workflow starts a MySQL 8.0 container as a service. Evidence from logs:

```
2026-02-02T17:29:44.7958805Z ##[group]Starting mysql service container
2026-02-02T17:29:44.7978915Z ##[command]/usr/bin/docker pull mysql:8.0
...
2026-02-02T17:30:00.3588569Z 98c6c225aa7673b03e208f0369b04959bf6a042656b01d052e02a9dd5647bad8
```

The MySQL container starts successfully and is healthy.

---

## 5. Why DB Schema Apply Fails in CI (5-Line Conclusion)

1. **CI database is FRESH** - The MySQL container starts with an empty `yeto_test` database each run.
2. **Migrations run from scratch** - `pnpm db:push` applies ALL migrations (0000-0026) sequentially.
3. **Migration 0020 contains a problematic index** - `CREATE INDEX update_source_url_idx ON update_items (sourceUrl)` where `sourceUrl` is `varchar(1000)`.
4. **MySQL utf8mb4 limit exceeded** - 1000 chars × 4 bytes = 4000 bytes > 3072-byte max index key length.
5. **Local fix not synced** - The index was removed locally in schema.ts and migration file, but the push to GitHub may not have included all changes due to merge conflicts or timing issues.

---

## 6. Evidence: Local vs GitHub State

**Local state (fixed):**
- `drizzle/schema.ts` line 6045: `sourceUrlIdx` removed
- `drizzle/0020_jazzy_ravenous.sql` line 120: index creation removed

**GitHub state (needs verification):**
- Need to confirm the fix was pushed to commit `a79e760`

---

## 7. Recommended Fix for Fresh Session

1. **Verify the sourceUrl index removal is on GitHub main**
2. **If not, push the fix explicitly**
3. **Add MySQL 8.0 service with proper health check wait**
4. **Ensure `pnpm db:push` runs before `pnpm test`**
5. **Re-run CI and verify green**

---

## 8. Session Handoff

This document serves as the handoff for the **CI-RESET-FIX** session. The next session should:
- NOT delete or regenerate migrations
- Focus on ensuring the local fixes are properly synced to GitHub
- Verify CI runs green after the sync
