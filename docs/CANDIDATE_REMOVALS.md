# Candidate Files for Removal

## Overview
This document lists files and directories that may be candidates for removal or consolidation. **NO FILES HAVE BEEN DELETED** in this PR. This is an audit and proposal only.

## Status: INVENTORY COMPLETE ✅

After thorough inspection of the repository structure, the following assessment has been made:

## Findings

### ✅ No Duplicate Cursor Operating System Structures Found

**Good news**: The repository does NOT contain duplicate Cursor OS structures such as:
- No duplicate `cursor-operating-system/` folder
- No conflicting `.cursor/` directories
- No redundant `agentos/` structures

### ✅ Clean Structure

The canonical structure is now established at:
- **`.cursor/`** - Cursor rules and commands (NEWLY CREATED)
- **`agentos/`** - Agent definitions and policies (EXISTING)
- **`docs/`** - Documentation (EXISTING)
- **`data/source_registry/`** - Source registry with README (NEWLY CREATED)

## Potential Candidates for Future Review

### Documentation Files (Low Priority)

The following files may contain overlapping or outdated information:

#### 1. Root-Level Documentation Files
**Files**:
- `/workspace/banking-sector-fix-status.md`
- `/workspace/browser-testing-notes.md`
- `/workspace/data-verification.md`
- `/workspace/database-audit.md`
- `/workspace/download-test-results.md`
- `/workspace/hsa-page-verification.md`
- `/workspace/macroeconomy-sector-issues.md`
- `/workspace/sector-review.md`
- `/workspace/sector-verification.md`
- `/workspace/smoke-test-comprehensive.md`
- `/workspace/smoke-test-results.md`
- `/workspace/test-log-jan-2026.md`
- `/workspace/ui-review-notes.md`
- `/workspace/wide-research-findings.md`
- `/workspace/yemen_banks_data.md`

**Reason**: These appear to be temporary audit/testing notes from development
**Risk Level**: 🟢 Low (likely outdated snapshots)
**Recommendation**: Review and migrate relevant content to:
  - `docs/AUDIT_PACK/` for audit reports
  - `test-findings/` for test results (already exists)
  - `docs/DECISIONS.md` for decisions
  - Then consider archiving these root-level files

**Action Required**: Manual review to ensure no unique data lost

#### 2. Overlapping TODO Files
**Files**:
- `/workspace/todo.md`
- `/workspace/COMPREHENSIVE_TODO.md`

**Reason**: Multiple TODO files can lead to inconsistency
**Risk Level**: 🟡 Medium (may contain active tasks)
**Recommendation**: Consolidate into:
  - `docs/GAP_TICKETS.md` (for formal gaps)
  - `docs/NEXT_ACTIONS.md` (for immediate actions)
  - GitHub Issues (for tracked work)

**Action Required**: Review both files, migrate active items, then remove

#### 3. Duplicate Architecture Docs
**Files**:
- `/workspace/ARCHITECTURE.md` (root level)
- `/workspace/docs/ARCHITECTURE.md` (in docs/)

**Reason**: Same filename in two locations
**Risk Level**: 🟡 Medium (may have different content)
**Recommendation**: 
  - Diff the files to check for differences
  - Keep `/workspace/docs/ARCHITECTURE.md` as canonical
  - Root-level `ARCHITECTURE.md` could redirect or be removed

**Action Required**: 
```bash
diff /workspace/ARCHITECTURE.md /workspace/docs/ARCHITECTURE.md
```
If identical → remove root-level copy
If different → merge content into docs/ version

### Data Files (Requires Careful Review)

#### 4. Multiple Source Registry Versions
**Files**:
- `/workspace/data/registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx`
- `/workspace/data/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_0.xlsx`
- `/workspace/data/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_5.xlsx`

**Reason**: Three versions of the same master file
**Risk Level**: 🔴 High (data integrity critical)
**Recommendation**: 
  - Identify the TRUE production version (likely v2_5 being newest)
  - Archive older versions to `data/archive/` or remove if confirmed superseded
  - Document which version is canonical in `data/source_registry/README.md`

**Action Required**: 
1. Verify v2_5 is most recent and complete
2. If yes, move v2_0 and v2_3 to archive
3. Update README to reference v2_5 only

#### 5. JSON Data Exports
**Files**:
- `/workspace/data-export.json`
- `/workspace/data/new_sources.json`
- `/workspace/data/sources_master_292.json`
- `/workspace/data/yemen_comprehensive_data_ingestion.json`

**Reason**: Unclear if these are temporary exports or production data
**Risk Level**: 🟡 Medium (depends on usage)
**Recommendation**:
  - Check if these are:
    - One-time exports (can be deleted)
    - Development fixtures (move to `data/fixtures/`)
    - Production data (keep with clear documentation)

**Action Required**: Review each file's purpose in codebase

### Research Files (Medium Priority)

#### 6. Research Files in data/
**Files**:
- `/workspace/data/research_files/` (20 numbered markdown files)

**Reason**: Research findings may belong elsewhere
**Risk Level**: 🟢 Low (informational)
**Recommendation**: 
  - These look like research snapshots
  - Consider moving to `/workspace/research/` (already exists)
  - Or keep if they're tied to specific data sources

**Action Required**: Review content, decide on canonical location

### Infrastructure Duplication

#### 7. Multiple Infrastructure Folders
**Files**:
- `/workspace/infra/k8s/deployment.yaml`
- `/workspace/infrastructure/*.tf`

**Reason**: Two different infrastructure approaches (Kubernetes vs Terraform)
**Risk Level**: 🟡 Medium (deployment critical)
**Recommendation**: 
  - Determine actual deployment method
  - If using AWS only (as per new deploy.yml), K8s may not be needed
  - If using both, document which is for what environment

**Action Required**: Clarify infrastructure strategy with team

## Files to KEEP (Confirmed)

### Essential Structure (Do Not Remove)
- ✅ `.cursor/` - Newly created Cursor OS structure
- ✅ `agentos/` - Agent definitions
- ✅ `docs/` - Main documentation
- ✅ `client/` - Frontend application
- ✅ `server/` - Backend application
- ✅ `shared/` - Shared types
- ✅ `drizzle/` - Database migrations
- ✅ `scripts/` - Build and utility scripts
- ✅ `e2e/` - End-to-end tests
- ✅ `test-findings/` - Sector testing results

### Essential Root Files
- ✅ `package.json` - Dependency management
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `drizzle.config.ts` - Database configuration
- ✅ `Dockerfile` - Container configuration
- ✅ `docker-compose.prod.yml` - Production compose
- ✅ `Makefile` - Build automation
- ✅ `START_HERE.md` - Entry point documentation
- ✅ `SECURITY.md` - Security policy
- ✅ `.github/` - GitHub configuration

## Recommended Action Plan

### Phase 1: Documentation Cleanup (Low Risk)
1. Review root-level testing/audit markdown files
2. Migrate relevant content to appropriate locations
3. Remove or archive outdated testing notes
4. Consolidate TODO files

### Phase 2: Data File Audit (Medium Risk)
1. Identify canonical source registry version
2. Archive or remove old versions
3. Clarify purpose of JSON export files
4. Move research files to appropriate location

### Phase 3: Infrastructure Clarity (Medium Risk)
1. Document infrastructure approach
2. Remove unused deployment configs (if confirmed)
3. Ensure deployment docs reflect actual setup

## Removal Safety Checklist

Before removing ANY file, verify:
- [ ] File is not referenced in code (`grep -r "filename" .`)
- [ ] File is not imported/required by application
- [ ] File is not used in CI/CD workflows
- [ ] File content is preserved elsewhere or truly obsolete
- [ ] Removal is approved by team lead or owner
- [ ] Removal is documented in git commit message

## Next Steps

1. **Team Review**: Share this document with team for input
2. **Prioritize**: Decide which removals provide most value
3. **Create Issues**: Track each cleanup task separately
4. **Execute Gradually**: Remove files in small, reviewable PRs
5. **Test After Each**: Ensure nothing breaks after removals

## Contact

Questions about this audit:
- Review commit history of candidate files: `git log -- <filepath>`
- Check file usage: `rg -l "filename" .`
- Discuss in team channel before removing

## Notes

- This audit was performed on: 2026-02-05
- Branch: `chore/cursor-os-sync-20260205`
- No files were deleted during this audit
- All removals require explicit approval and separate PR
