# Deployment Smoke Check

This guide provides manual verification steps after deploying YETO to production.

## Overview

The automated deployment workflow (`.github/workflows/deploy.yml`) includes basic smoke tests. However, human verification ensures critical functionality works correctly after deployment.

## Automated Checks (Already Run)

The workflow automatically verifies:
- ✅ Homepage returns HTTP 200
- ✅ API health endpoint (if available)
- ✅ Static assets path accessible

## Manual Verification Checklist

Perform these checks after each production deployment:

### 1. Homepage Load (2 minutes)

**URL**: `https://[your-domain]/`

- [ ] Page loads without errors
- [ ] No console errors in browser DevTools
- [ ] Correct version deployed (check commit hash if displayed)
- [ ] Navigation menu renders correctly
- [ ] Footer displays properly

### 2. Core Sector Pages (5 minutes)

Visit each main sector page and verify:

**Banking Sector** - `/banking`
- [ ] Page loads without errors
- [ ] Bank list displays
- [ ] Charts/visualizations render
- [ ] Source citations appear

**Currency Sector** - `/currency`
- [ ] Exchange rates display
- [ ] Historical charts render
- [ ] Date range selectors work

**Macroeconomy** - `/macroeconomy`
- [ ] GDP data displays
- [ ] Economic indicators load
- [ ] Timeline navigation works

**Trade** - `/trade`
- [ ] Import/export data loads
- [ ] Port statistics display
- [ ] Trade partner charts render

**Other Sectors** (spot check 2-3)
- [ ] Energy - `/energy`
- [ ] Food Security - `/food-security`
- [ ] Labor - `/labor`
- [ ] Poverty - `/poverty`
- [ ] Aid Flows - `/aid-flows`
- [ ] Health Services - `/health-services`

### 3. API Functionality (3 minutes)

Test API endpoints using browser DevTools Network tab:

- [ ] API requests complete successfully (check Network tab)
- [ ] No 500 errors
- [ ] Response times reasonable (<2s for most queries)
- [ ] Data returns in expected format

**Quick API Test**:
```bash
# If API is publicly accessible
curl https://[your-domain]/api/trpc/banking.getBankList | jq .
```

### 4. Search & Filter (2 minutes)

If search/filter features exist:
- [ ] Search returns results
- [ ] Filters apply correctly
- [ ] Date range selection works
- [ ] Clear filters button works

### 5. Data Download (1 minute)

If data export features exist:
- [ ] CSV export works
- [ ] PDF reports generate
- [ ] Excel downloads complete

### 6. Mobile Responsiveness (2 minutes)

Test on mobile device or browser DevTools mobile emulation:
- [ ] Homepage renders properly
- [ ] Navigation menu works (hamburger icon if applicable)
- [ ] Charts are readable
- [ ] Tables adapt to small screen

### 7. Browser Compatibility (Optional)

Test on multiple browsers if critical:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

### 8. Performance Check (2 minutes)

Use browser DevTools Performance/Lighthouse:
- [ ] Lighthouse Performance score >70
- [ ] First Contentful Paint <3s
- [ ] Time to Interactive <5s
- [ ] No major performance warnings

**Quick Performance Test**:
```bash
# Using curl to measure response time
time curl -o /dev/null -s https://[your-domain]/
```

### 9. CloudFront Cache (1 minute)

Verify CloudFront is serving content:
- [ ] Check response headers include `X-Cache: Hit from cloudfront` (on second request)
- [ ] Static assets load from CloudFront
- [ ] Page load is fast (indicates CDN working)

**Check Headers**:
```bash
curl -I https://[your-domain]/ | grep -i cache
```

### 10. Error Pages (1 minute)

Test error handling:
- [ ] Navigate to `/non-existent-page` - should show 404 page
- [ ] 404 page is styled (not plain white)
- [ ] Back to home link works

## Critical Issues

If any of these fail, consider rolling back:
- ❌ Homepage doesn't load (blank page or error)
- ❌ All sector pages fail to load
- ❌ Console shows critical errors preventing interaction
- ❌ API returns all 500 errors
- ❌ Build artifacts not deployed (shows old version)

## Non-Critical Issues

These can be addressed in next deployment:
- ⚠️ Minor styling issues
- ⚠️ Individual chart doesn't render
- ⚠️ Slow performance on one page
- ⚠️ Console warnings (non-blocking)

## Rollback Procedure

If critical issues found:

### Quick Rollback (CloudFront)
1. Go to AWS CloudFront Console
2. Find previous invalidation or revert distribution origin
3. (Usually not feasible - better to deploy previous version)

### Proper Rollback (GitHub)
1. Identify last known good commit: `git log main`
2. Revert to that commit:
   ```bash
   git revert --no-commit HEAD~1..HEAD
   git commit -m "Revert deployment: critical issue found"
   git push origin main
   ```
3. Wait for CI/CD to deploy reverted version
4. Re-run smoke checks

### Emergency Rollback (S3)
If GitHub workflow is broken:
1. Find previous build artifacts locally or in GitHub Actions artifacts
2. Manually upload to S3:
   ```bash
   aws s3 sync ./previous-build/ s3://your-bucket/ --delete
   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
   ```

## Reporting Issues

When reporting deployment issues:
1. **What**: Describe the issue clearly
2. **Where**: Which page/feature is affected
3. **When**: After which deployment (commit hash)
4. **Impact**: How many users/features affected
5. **Severity**: Critical (rollback), High (hotfix needed), Medium (fix in next release), Low (track for later)

**Issue Template**:
```markdown
## Deployment Issue

**Commit**: abc123def456
**Deployed**: 2025-01-15 14:30 UTC
**Severity**: [Critical/High/Medium/Low]

### Description
[What's broken]

### Steps to Reproduce
1. Go to...
2. Click on...
3. See error...

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Browser/Environment
- Browser: Chrome 120
- Device: Desktop
- URL: https://...

### Console Errors
```
[Paste any console errors]
```

### Screenshots
[If applicable]
```

## Post-Deployment Tasks

After successful verification:
- [ ] Update `docs/RELEASE_GATES.md` if new checks needed
- [ ] Document any workarounds in `docs/DECISIONS.md`
- [ ] Notify stakeholders deployment is complete
- [ ] Close deployment ticket/issue

## Monitoring

Set up ongoing monitoring (separate from smoke checks):
- Use AWS CloudWatch for infrastructure metrics
- Use error tracking (Sentry, etc.) for application errors
- Set up uptime monitoring (Pingdom, UptimeRobot, etc.)
- Review logs regularly for anomalies

## Automation Opportunities

Consider automating these checks:
- End-to-end tests with Playwright (already in project)
- Synthetic monitoring of key user flows
- Automated Lighthouse CI checks
- API contract testing

## Contact

For deployment issues:
- **Technical Lead**: [Contact info]
- **DevOps**: [Contact info]
- **Emergency**: [After-hours contact]

## Appendix: Quick Reference

**Production URL**: https://[your-cloudfront-domain]
**Deployment Workflow**: `.github/workflows/deploy.yml`
**Secrets Config**: `docs/DEPLOYMENT_SECRETS.md`
**AWS Console**: https://console.aws.amazon.com/

**Useful Commands**:
```bash
# Check CloudFront status
aws cloudfront get-distribution --id YOUR_DIST_ID

# List S3 bucket contents
aws s3 ls s3://your-bucket/ --recursive --human-readable

# Recent CloudFront invalidations
aws cloudfront list-invalidations --distribution-id YOUR_DIST_ID

# Test from different region (via curl)
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain/
```

**curl-format.txt**:
```
time_namelookup:  %{time_namelookup}s\n
time_connect:     %{time_connect}s\n
time_starttransfer: %{time_starttransfer}s\n
time_total:       %{time_total}s\n
http_code:        %{http_code}\n
```
