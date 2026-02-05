# Release Gate Testing Guide

**YETO Platform**  
**Version**: 1.0  
**Last Updated**: February 5, 2026

---

## Overview

This guide provides instructions for testing the 17-gate release quality system before production deployment.

---

## Pre-Testing Checklist

Before running tests, ensure:

- [ ] All dependencies installed (`pnpm install`)
- [ ] Database connection configured (`DATABASE_URL` in `.env`)
- [ ] Database schema up to date (`pnpm db:push`)
- [ ] Test data seeded (`pnpm seed` or `node scripts/seed-ci.mjs`)
- [ ] Node.js version 22+ installed
- [ ] Playwright browsers installed (`npx playwright install`)

---

## Manual Testing Steps

### 1. Code Quality Tests

```bash
# Install ESLint dependencies (if not already installed)
pnpm add -D eslint @eslint/js @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks

# Run linting
pnpm lint

# Expected: Pass with ≤50 warnings
```

**Success Criteria:**
- Exit code 0
- Maximum 50 warnings
- No critical errors

---

### 2. Type Checking

```bash
# Run TypeScript compiler in check mode
pnpm typecheck
```

**Success Criteria:**
- Exit code 0
- No type errors
- All files type-safe

---

### 3. Registry Lint

```bash
# Validate source_registry data integrity
pnpm registry:lint
```

**Success Criteria:**
- All 10 checks pass
- No duplicate source IDs
- No missing required fields
- Valid tier/status values

**Expected Output:**
```
✅ Check 1: Table Existence
✅ Check 2: Schema Validation
✅ Check 3: Required Fields
✅ Check 4: Duplicate Source IDs
✅ Check 5: Valid Tier Values
✅ Check 6: Valid Status Values
✅ Check 7: Sector Mappings
✅ Check 8: Sector Codebook Integrity
✅ Check 9: Data Quality Scores
✅ Check 10: Evidence Pack Flags
```

---

### 4. Unit Tests

```bash
# Run Vitest unit tests
pnpm test
```

**Success Criteria:**
- All tests pass (432+)
- No failing tests
- Test coverage maintained

---

### 5. Integration Tests

```bash
# Run integration test suite
pnpm test -- --run integration
```

**Success Criteria:**
- All integration tests pass
- Database operations succeed
- API endpoints respond correctly

---

### 6. E2E Tests

```bash
# Run Playwright E2E tests
pnpm test:e2e
```

**Success Criteria:**
- All critical journeys pass
- Tests pass in both AR and EN
- No timeout errors
- No rendering failures

**Critical Journeys to Verify:**
- Homepage loads
- Dashboard displays data
- Sector pages (banking, trade, currency)
- Language switching (AR/EN)
- Evidence pack viewing
- Export functionality

---

### 7. Release Gate Validation

```bash
# Run comprehensive release gate
node scripts/release-gate.mjs
```

**Success Criteria:**
All 17 gates must pass:

1. ✅ Source Registry Count (≥250)
2. ✅ Active Sources (≥150)
3. ✅ Sector Codebook (≥16)
4. ✅ Tier Distribution (≤70% UNKNOWN)
5. ✅ Sector Mappings (≥50%)
6. ✅ No Duplicate Source IDs
7. ✅ Required Fields Complete
8. ✅ S3 Storage Health
9. ✅ Schema v2.5 Compliance
10. ✅ No Static KPIs in UI
11. ✅ No Mock Evidence Fallbacks
12. ✅ Evidence Coverage ≥95%
13. ✅ AR/EN Parity
14. ✅ Exports with Signed URLs
15. ✅ Contradiction Mode Present
16. ✅ Coverage Map Present
17. ✅ Nightly Jobs Configured

**Expected Final Output:**
```
✅ ALL GATES PASSED
Release Gate completed at [timestamp]
```

Exit code: 0

---

## CI Pipeline Testing

The full CI pipeline runs automatically on push/PR. Monitor at:
https://github.com/[org]/[repo]/actions

### CI Pipeline Stages

1. **Setup** (Node.js + pnpm)
2. **Install Dependencies**
3. **Database Setup** (schema + seed)
4. **Install ESLint Dependencies**
5. **Lint** (ESLint)
6. **Typecheck** (TypeScript)
7. **Registry Lint** (Data validation)
8. **Unit Tests** (Vitest)
9. **Integration Tests**
10. **Install Playwright Browsers**
11. **E2E Tests** (Playwright)
12. **Release Gate** (17 checks)

### CI Success Criteria

- ✅ All stages complete successfully
- ✅ Green checkmark on commit
- ✅ No failed jobs
- ✅ Test artifacts uploaded (if failures)

---

## Troubleshooting

### Common Issues

#### Issue: ESLint not found

**Solution:**
```bash
pnpm add -D eslint @eslint/js @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks
```

#### Issue: Registry lint fails (table not found)

**Solution:**
```bash
# Ensure database is set up
pnpm db:push
node scripts/seed-ci.mjs
```

#### Issue: E2E tests timeout

**Solution:**
```bash
# Install Playwright browsers
npx playwright install --with-deps

# Run with increased timeout
pnpm test:e2e -- --timeout=60000
```

#### Issue: Release gate fails on Gate 12 (Evidence Coverage)

**Solution:**
- Check that `evidence_packs` table exists and has data
- Run evidence ingestion scripts
- Verify evidence linking is working

#### Issue: Release gate fails on Gate 15 (Contradiction Mode)

**Solution:**
- Ensure `ContradictionBadge.tsx` exists
- Check file is not corrupted
- Verify component implementation

---

## Manual Verification Checklist

After all automated tests pass, manually verify:

### Data Quality
- [ ] Source registry has ≥250 sources
- [ ] At least 150 sources are ACTIVE
- [ ] All 16 sectors present in codebook
- [ ] No duplicate source IDs
- [ ] Sector mappings cover ≥50% of sources

### UI/UX
- [ ] Homepage loads in AR and EN
- [ ] Dashboard displays correct data
- [ ] All 15 sector pages accessible
- [ ] Evidence packs display correctly
- [ ] Exports generate signed URLs
- [ ] Contradiction mode visible when applicable
- [ ] Coverage scorecard accessible

### Documentation
- [ ] OPERATIONS.md has all env vars
- [ ] PLATFORM_METHODOLOGY.md complete
- [ ] PRIVACY_POLICY.md published
- [ ] AI_TRUST_FRAMEWORK.md published
- [ ] MASTER_INDEX.md links all docs
- [ ] STATUS.md current

### Security
- [ ] No hardcoded credentials in code
- [ ] Environment variables configured
- [ ] S3 access working
- [ ] Database connections encrypted
- [ ] HTTPS enabled in production

---

## Production Readiness Sign-Off

Only proceed to production if:

- ✅ All 17 release gates pass
- ✅ All CI checks green
- ✅ E2E tests pass in AR and EN
- ✅ Manual verification complete
- ✅ Documentation up to date
- ✅ Rollback plan documented
- ✅ Team notified of deployment

**Sign-Off Required From:**
- [ ] Technical Lead
- [ ] QA Lead
- [ ] Release Manager
- [ ] Product Owner

---

## Post-Deployment Verification

After deployment to production:

1. **Smoke Test** (5 minutes)
   - Homepage loads
   - Dashboard displays data
   - Authentication works
   - AI Assistant responds
   - Exports download

2. **Health Checks** (immediate)
   ```bash
   curl https://your-domain.com/api/health
   curl https://your-domain.com/api/health/db
   ```

3. **Error Monitoring** (first 30 minutes)
   - Watch logs for errors
   - Check error rates
   - Monitor performance metrics

4. **User Acceptance** (first 24 hours)
   - Monitor user feedback
   - Check support tickets
   - Review usage analytics

---

## Rollback Criteria

Initiate rollback if:

- Critical functionality broken
- Data integrity compromised
- Security vulnerability detected
- Error rate >5%
- User complaints >10 in first hour

**Rollback Procedure:** See `docs/OPERATIONS.md` - Safe Publish Runbook

---

## Continuous Monitoring

### Daily
- Check CI pipeline status
- Review error logs
- Monitor release gate metrics

### Weekly
- Review test coverage
- Analyze gate failure patterns
- Update test cases as needed

### Monthly
- Full release gate audit
- Documentation review
- Methodology updates

---

## Contact

- **CI/CD Issues:** tech@causewaygrp.com
- **Release Gate Questions:** release@yeto.org
- **Test Failures:** qa@yeto.org

---

*This testing guide ensures every release meets YETO's production quality standards.*
