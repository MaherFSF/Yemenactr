# BLOCKERS

**Repository:** YETO Platform (Yemen Economic Transparency Observatory)  
**Audit Date:** February 4, 2026  
**Auditor:** Lead Engineer Onboarding  
**Branch:** cursor/repo-baseline-audit-3194

---

## Executive Summary

This document tracks blocking issues discovered during the baseline audit that prevent full local development or deployment. Each blocker includes severity, impact, file references, and recommended resolution.

**Total Blockers Identified:** 2 (1 Minor, 1 Documentation)

---

## Active Blockers

### 🟡 MINOR-001: Dead Route - Component Showcase

**Severity:** Minor  
**Impact:** Low (development/testing feature only)  
**Discovered:** February 4, 2026

**Description:**  
The `/component-showcase` route is documented in `SITEMAP_FULL.md` and the component exists, but it is not registered in the application router, making it inaccessible.

**Evidence:**
- Component exists: `/workspace/client/src/pages/ComponentShowcase.tsx`
- Documented in: `/workspace/docs/SITEMAP_FULL.md:152-154`
- Missing from: `/workspace/client/src/App.tsx:143-274` (no route registration found)

**Impact:**
- Developers cannot access UI component gallery
- Testing and documentation workflows affected
- Does NOT block production deployment

**Resolution:**
Add route registration to `/workspace/client/src/App.tsx`:

```typescript
import ComponentShowcase from "./pages/ComponentShowcase";

// In the Switch block, add:
<Route path="/component-showcase" component={ComponentShowcase} />
```

**Estimated Effort:** 5 minutes

---

### 📄 DOC-001: Missing .env.example Template

**Severity:** Documentation  
**Impact:** Medium (affects new developer onboarding)  
**Discovered:** February 4, 2026

**Description:**  
No `.env.example` file exists in the repository root to guide developers on required environment variable configuration. This makes initial setup harder for new team members.

**Evidence:**
- Expected location: `/workspace/.env.example`
- File not found in repository
- 23 environment variables documented in `/workspace/docs/ENV_VARS.md`
- Several scripts and services require specific env vars to function

**Impact:**
- New developers must manually discover required env vars
- Increases setup time and error rate
- Risk of missing critical configuration
- Does NOT block experienced developers

**Resolution:**
Create `/workspace/.env.example` with template values:

```bash
# Database
DATABASE_URL="mysql://root:password@localhost:3306/yeto_platform"

# Application
NODE_ENV="development"
PORT="3000"

# Security
JWT_SECRET="generate-a-secure-random-string-min-32-chars"

# OAuth (Optional)
# VITE_APP_ID=""
# OAUTH_SERVER_URL=""
# OWNER_OPEN_ID=""

# File Storage (Optional)
# BUILT_IN_FORGE_API_URL=""
# BUILT_IN_FORGE_API_KEY=""

# External APIs (Optional)
# ACLED_API_KEY=""
# ACLED_EMAIL=""

# AI Integration (Optional)
# AI_PROVIDER="local"
# AI_API_KEY=""
# AI_MODEL="gpt-4o"
```

**Estimated Effort:** 15 minutes

---

## Resolved Blockers

_None yet_

---

## Non-Blocking Issues (For Reference)

These issues were identified but do NOT block development:

### Path Discrepancies in Documentation

**Issue:** 3 routes have different paths in docs vs code
- `/ai-assistant-enhanced` (docs) vs `/ai-assistant` (code)
- `/research-visualization` (docs) vs `/research-analytics` (code)  
- `/` (docs) vs `/home` (actual landing)

**Reference:** `/workspace/docs/ROUTE_REALITY_CHECK.md`

**Resolution:** Update documentation (not blocking)

### Undocumented Routes

**Issue:** 42 functional routes not documented in SITEMAP_FULL.md

**Reference:** `/workspace/docs/ROUTE_REALITY_CHECK.md`

**Resolution:** Update documentation (not blocking)

### No ESLint Configuration

**Issue:** Project uses TypeScript checking (`tsc --noEmit`) but has no ESLint for code style enforcement

**Evidence:** 
- `pnpm lint` runs `tsc --noEmit` (`/workspace/package.json:18`)
- No `.eslintrc`, `.eslintrc.js`, or ESLint config in `package.json`

**Impact:** Code style consistency relies on Prettier only

**Resolution:** Consider adding ESLint (not blocking)

---

## Potential Blockers (Require Verification)

These may or may not be blockers depending on deployment target:

### ⚠️ VERIFY-001: Database Credentials

**Description:** DATABASE_URL must be configured for any operation

**Required For:**
- Development: ✅ Required
- Testing: ✅ Required  
- Production: ✅ Required

**Verification Steps:**
1. Check if DATABASE_URL is set in environment
2. Verify database exists and is accessible
3. Test connection: `pnpm db:push`

**Resolution if Blocked:**
1. Set up local MySQL: `mysql -u root -p`
2. Create database: `CREATE DATABASE yeto_platform;`
3. Set env var: `DATABASE_URL="mysql://root:password@localhost:3306/yeto_platform"`

### ⚠️ VERIFY-002: OAuth Configuration (Production Only)

**Description:** OAuth variables may be required for production authentication

**Required For:**
- Development: ❌ Optional
- Testing: ❌ Optional
- Production: ⚠️ May be required (depends on auth strategy)

**Variables:**
- VITE_APP_ID
- OAUTH_SERVER_URL
- OWNER_OPEN_ID

**Reference:** `/workspace/server/_core/env.ts:2,5,6`

**Verification Steps:**
1. Check if OAuth routes are accessed: `/workspace/server/_core/oauth.ts`
2. Verify if production deployment uses OAuth
3. Check with team on auth strategy

### ⚠️ VERIFY-003: File Storage (Production Only)

**Description:** File upload features require storage backend

**Required For:**
- Development: ❌ Optional (if not testing uploads)
- Testing: ⚠️ May be required for upload tests
- Production: ✅ Required (for banking docs, reports)

**Variables:**
- BUILT_IN_FORGE_API_URL
- BUILT_IN_FORGE_API_KEY
- OR AWS S3 credentials

**Reference:** `/workspace/scripts/upload-banking-reports.mjs:14-15`

**Verification Steps:**
1. Test file upload features
2. Check if S3 or Forge is configured in prod
3. Verify upload scripts work

---

## Blocker Resolution Workflow

### For Development Environment

**Minimum Required:**
1. ✅ Node.js 20+ installed
2. ✅ pnpm 10.4.1+ installed
3. ✅ MySQL running and accessible
4. ✅ DATABASE_URL configured
5. ✅ JWT_SECRET configured (can be simple for dev)

**Setup Steps:**
```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env  # After DOC-001 is resolved
# Edit .env with your database credentials

# 3. Run migrations
pnpm db:push

# 4. Start dev server
pnpm dev
```

### For Production Environment

**Required Configuration:**
1. All development requirements
2. NODE_ENV=production
3. Strong JWT_SECRET (32+ chars)
4. OAuth configuration (if using OAuth auth)
5. File storage backend (Forge or S3)
6. External API keys (ACLED, etc.) for data ingestion

**Deployment Checklist:**
- [ ] DATABASE_URL points to production database
- [ ] JWT_SECRET is strong and secure
- [ ] OAuth variables configured
- [ ] File storage configured (Forge or S3)
- [ ] External API keys configured
- [ ] Health check endpoint responds: `/api/health`
- [ ] Environment variables injected via secrets manager

---

## Blocker Severity Definitions

### 🔴 Critical
Completely blocks development or deployment. Must fix immediately.

### 🟠 High
Blocks significant functionality or affects all developers. Fix within 1 day.

### 🟡 Minor
Blocks optional features or affects few users. Fix within 1 week.

### 📄 Documentation
Does not block functionality but should be documented. Fix when convenient.

---

## Contact for Blocker Resolution

**Blocking Issues:** Escalate to tech lead or open GitHub issue  
**Environment Setup:** Refer to `/workspace/docs/ENGINEERING_BASELINE.md`  
**Configuration Help:** See `/workspace/docs/ENV_VARS.md`

---

## Audit Notes

During this comprehensive baseline audit, the repository was found to be in **good health** overall:

### ✅ What's Working Well
- Complete technology stack identified and documented
- All build/test commands work correctly
- Comprehensive routing system (113 routes)
- Well-organized codebase with clear separation of concerns
- Production-ready Docker configuration
- Extensive connector architecture for data ingestion
- Good test coverage infrastructure (Vitest + Playwright)

### ⚠️ Minor Issues Found
- 1 dead route (component-showcase)
- No .env.example template
- Some documentation drift (42 undocumented routes)
- 3 path discrepancies in docs

### 🎯 No Critical Blockers
- All core functionality works
- Stack is modern and well-maintained
- Build and deploy processes are clear
- No missing dependencies or broken configs

---

## Conclusion

**Overall Status:** 🟢 GREEN (Ready for Development)

This repository has **no critical blockers** preventing immediate development work. The two identified issues are minor and can be resolved quickly:

1. Fix component showcase route (5 min)
2. Add .env.example template (15 min)

New developers can start working on this codebase immediately with only basic setup (Node.js, pnpm, MySQL, and env vars).

---

**Document Status:** ✅ Complete  
**Last Updated:** February 4, 2026  
**Next Review:** When critical issues arise or major changes are made
