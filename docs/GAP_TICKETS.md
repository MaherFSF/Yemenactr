# YETO GAP Tickets - Production Readiness

**Date:** January 28, 2026  
**Sprint:** Step 1 - Smoke Test & Runtime Wiring Audit

## P0 Blockers (Must Fix Before Release)

| ID | Route | Issue | Severity | Status | Assigned |
|----|-------|-------|----------|--------|----------|
| GAP-001 | `/data/repository` | 404 Page Not Found | P0 | **FIXED** | Route added to App.tsx |
| GAP-002 | `/research` | Verified working | P0 | **FIXED** | Tested in smoke test |
| GAP-003 | `/research/reports` | Verified working | P0 | **FIXED** | Tested in smoke test |

## P1 Issues (Should Fix)

| ID | Route | Issue | Severity | Status | Assigned |
|----|-------|-------|----------|--------|----------|
| GAP-101 | Scheduler | DrizzleQueryError on scheduler_jobs table | P1 | **FIXED** | Created scheduler_jobs table |

## P2 Enhancements (Nice to Have)

| ID | Route | Issue | Severity | Status | Assigned |
|----|-------|-------|----------|--------|----------|

---

## Detailed Issue Descriptions

### GAP-001: Data Repository 404

**Route:** `/data/repository`  
**Expected:** Data repository page with searchable indicators  
**Actual:** 404 Page Not Found  
**Impact:** Users cannot access the data repository feature  
**Root Cause:** Route not defined in App.tsx or component missing  
**Fix:** Create DataRepositoryPage component and add route

### GAP-101: Scheduler Jobs Error

**Component:** Server Scheduler  
**Error Message:**
```
DrizzleQueryError: Failed query: select `id`, `jobName`, `jobType`, `cronExpression`, `isEnabled`...
cause: Error: read ECONNRESET
```
**Impact:** Scheduled jobs not running (backfill, data refresh)  
**Root Cause:** Database connection reset or scheduler_jobs table missing  
**Fix:** Verify scheduler_jobs table exists and connection is stable

---

*Last Updated: January 28, 2026*
