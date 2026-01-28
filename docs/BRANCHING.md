# Branching Strategy & Protection Rules — YETO Platform

> **Single source of truth for Git workflow, branch protection policies, and code review standards**

---

## Branch Naming Convention

All branches MUST follow the pattern: `<type>/<scope>-<description>`

### Branch Types

| Type | Purpose | Base Branch | Merge Target |
|------|---------|-------------|--------------|
| `feature/` | New features or enhancements | `dev` | `dev` → `main` |
| `fix/` | Bug fixes | `dev` | `dev` → `main` |
| `hotfix/` | Critical production fixes | `main` | `main` (direct) |
| `refactor/` | Code refactoring (no behavior change) | `dev` | `dev` → `main` |
| `docs/` | Documentation updates | `dev` | `dev` → `main` |
| `chore/` | Dependency updates, tooling | `dev` | `dev` → `main` |
| `test/` | Test coverage improvements | `dev` | `dev` → `main` |
| `perf/` | Performance optimizations | `dev` | `dev` → `main` |

### Examples

```bash
# Feature branch
git checkout -b feature/backfill-world-bank

# Bug fix
git checkout -b fix/scheduler-connection-error

# Hotfix (critical production issue)
git checkout -b hotfix/exchange-rate-data-corruption

# Documentation
git checkout -b docs/api-key-setup-guide

# Refactoring
git checkout -b refactor/backfill-orchestrator-cleanup
```

---

## Branch Protection Rules

### `main` Branch (Production)

**Purpose:** Production-ready code only. Deployed to https://yeto.causewaygrp.com

**Protection Rules:**

✅ **Require pull request reviews before merging**
- Minimum 2 approvals required
- Dismiss stale pull request approvals when new commits are pushed
- Require review from code owners (CODEOWNERS file)

✅ **Require status checks to pass before merging**
- Lint (ESLint)
- Type Check (TypeScript)
- Unit Tests (Vitest)
- E2E Tests (Playwright)
- Security Scan (Trivy)
- Large File Guard

✅ **Require branches to be up to date before merging**
- Enforce that branches must be up to date with `main` before merging

✅ **Require code owner review**
- Require approval from code owners (see CODEOWNERS)

✅ **Restrict who can push to matching branches**
- Only maintainers can push directly to `main`
- Force all changes through pull requests

✅ **Require signed commits**
- All commits must be signed with GPG

✅ **Require conversation resolution before merging**
- All review comments must be resolved

✅ **Include administrators**
- Admins are also subject to protection rules

**Allowed Merge Types:**
- Squash and merge (preferred for clean history)
- Create a merge commit (for major releases)
- ❌ Rebase and merge (not allowed)

**Auto-delete head branches:** Yes

---

### `dev` Branch (Development/Staging)

**Purpose:** Integration branch for features. Deployed to https://staging.yeto.causewaygrp.com

**Protection Rules:**

✅ **Require pull request reviews before merging**
- Minimum 1 approval required
- Dismiss stale pull request approvals when new commits are pushed

✅ **Require status checks to pass before merging**
- Lint (ESLint)
- Type Check (TypeScript)
- Unit Tests (Vitest)
- Large File Guard

✅ **Require branches to be up to date before merging**
- Enforce that branches must be up to date with `dev` before merging

✅ **Restrict who can push to matching branches**
- Only developers can push to `dev`
- Force all changes through pull requests

✅ **Require conversation resolution before merging**
- All review comments must be resolved

**Allowed Merge Types:**
- Squash and merge (preferred)
- Create a merge commit

**Auto-delete head branches:** Yes

---

### `hotfix/*` Branches (Emergency Fixes)

**Purpose:** Critical production fixes that bypass normal review process

**Protection Rules:**

✅ **Require pull request reviews before merging**
- Minimum 1 approval required (can be expedited)

✅ **Require status checks to pass before merging**
- Lint (ESLint)
- Type Check (TypeScript)
- Unit Tests (Vitest)

✅ **Require branches to be up to date before merging**
- Enforce that branches must be up to date with `main` before merging

✅ **Restrict who can push to matching branches**
- Only maintainers can create hotfix branches

**Merge Process:**
1. Create `hotfix/` branch from `main`
2. Fix the issue
3. Create PR with title: `[HOTFIX] <description>`
4. Get 1 approval (can be expedited)
5. Merge to `main` (squash)
6. Backport to `dev` (create separate PR)

---

## Pull Request Workflow

### 1. Create Feature Branch

```bash
git checkout dev
git pull origin dev
git checkout -b feature/my-feature
```

### 2. Make Changes & Commit

```bash
# Make changes
git add .
git commit -m "feat: add new feature"

# Follow conventional commits:
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code refactoring
# perf: performance improvement
# test: test coverage
# chore: dependency updates
```

### 3. Push & Create Pull Request

```bash
git push origin feature/my-feature
```

Then create PR on GitHub with:
- **Title:** `feat: add new feature`
- **Description:** Clear explanation of changes
- **Linked Issues:** `Closes #123`
- **Type:** Feature / Fix / Refactor / etc.

### 4. Code Review & Approval

- Minimum reviewers: 1 (dev), 2 (main)
- Address all comments
- Request re-review after changes
- Ensure CI/CD checks pass

### 5. Merge

```bash
# Squash and merge (preferred)
# This creates a single commit on the target branch
```

### 6. Delete Branch

```bash
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

---

## Code Owners & Review Assignments

### CODEOWNERS File

Create `.github/CODEOWNERS`:

```
# Global owners
* @MaherFSF @causeway-team

# Backend
/server/ @MaherFSF @backend-team
/drizzle/ @MaherFSF @database-team

# Frontend
/client/ @frontend-team

# Infrastructure
/infra/ @devops-team
/.github/ @devops-team

# Documentation
/docs/ @documentation-team
README.md @MaherFSF

# Tests
/tests/ @qa-team
```

---

## Commit Message Standards

### Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```bash
# Feature
git commit -m "feat(backfill): add World Bank API fetcher"

# Bug fix
git commit -m "fix(scheduler): resolve connection timeout error"

# Documentation
git commit -m "docs(api-keys): add registration instructions for HDX"

# Breaking change
git commit -m "feat(database)!: migrate to MySQL 8.0"
```

### Commit Message Guidelines

- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Keep subject under 50 characters
- Body: explain what and why, not how
- Reference issues: `Closes #123`, `Fixes #456`

---

## Release Process

### Version Numbering

Follow Semantic Versioning (MAJOR.MINOR.PATCH):
- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes

### Release Steps

1. **Prepare Release**
   ```bash
   git checkout main
   git pull origin main
   
   # Update version in package.json
   npm version minor  # or patch, major
   ```

2. **Create Release Branch**
   ```bash
   git checkout -b release/v1.2.0
   git push origin release/v1.2.0
   ```

3. **Create Pull Request**
   - Title: `Release v1.2.0`
   - Description: Changelog with all changes
   - Require 2 approvals

4. **Merge to Main**
   ```bash
   # After approval
   git merge --no-ff release/v1.2.0
   ```

5. **Create GitHub Release**
   - Tag: `v1.2.0`
   - Title: `Release v1.2.0`
   - Description: Changelog

6. **Backport to Dev**
   ```bash
   git checkout dev
   git merge main
   git push origin dev
   ```

---

## Conflict Resolution

### When Conflicts Occur

```bash
# Update your branch
git fetch origin
git rebase origin/dev

# Resolve conflicts in your editor
# Then continue rebase
git rebase --continue

# Or abort if needed
git rebase --abort
```

### Merge Conflict Guidelines

- **Keep both changes** if they're independent
- **Prefer newer logic** if they conflict
- **Ask reviewers** if unsure
- **Never force push** to shared branches

---

## Emergency Procedures

### Critical Production Bug (Hotfix)

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# 2. Fix the issue
# ... make changes ...

# 3. Commit with clear message
git commit -m "fix(critical): resolve production issue"

# 4. Push and create PR
git push origin hotfix/critical-issue

# 5. Get expedited approval (1 reviewer)

# 6. Merge to main
# (Squash merge)

# 7. Backport to dev
git checkout dev
git pull origin dev
git merge main
git push origin dev
```

### Rollback Procedure

```bash
# If a release causes issues
git revert <commit-hash>
git push origin main

# Or revert entire release
git reset --hard <previous-commit>
git push origin main --force-with-lease
```

---

## Monitoring & Metrics

### Branch Health Checks

- ✅ All CI/CD checks passing
- ✅ Code coverage > 80%
- ✅ No security vulnerabilities
- ✅ No large files (>20MB)
- ✅ All comments resolved

### Pull Request Metrics

| Metric | Target | Action |
|--------|--------|--------|
| **Review Time** | < 24 hours | Escalate if exceeded |
| **Merge Time** | < 48 hours | Review process |
| **Conflict Rate** | < 5% | Improve branching |
| **Revert Rate** | < 2% | Code quality review |

---

## Best Practices

### ✅ DO

- ✅ Keep branches short-lived (< 1 week)
- ✅ Sync with base branch frequently
- ✅ Write descriptive PR titles and descriptions
- ✅ Request reviews early
- ✅ Respond to review comments promptly
- ✅ Use draft PRs for work-in-progress
- ✅ Delete branches after merging
- ✅ Squash commits before merging

### ❌ DON'T

- ❌ Push directly to `main` or `dev`
- ❌ Force push to shared branches
- ❌ Merge without passing CI/CD
- ❌ Ignore review comments
- ❌ Create branches from old commits
- ❌ Leave branches stale (>2 weeks)
- ❌ Commit sensitive data
- ❌ Commit large files (>20MB)

---

## Tools & Automation

### GitHub Actions

- **Lint:** ESLint on every PR
- **Type Check:** TypeScript on every PR
- **Tests:** Vitest on every PR
- **E2E:** Playwright on every PR
- **Security:** Trivy scan on every PR
- **Large Files:** Check on every PR

### Pre-commit Hooks

```bash
# Install husky
npm install husky --save-dev
npx husky install

# Add hooks
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/pre-push "npm run test"
```

### Branch Cleanup

```bash
# Delete merged branches locally
git branch -d <branch-name>

# Delete merged branches remotely
git push origin --delete <branch-name>

# Prune stale remote branches
git fetch origin --prune
```

---

**Last Updated:** 2026-01-28  
**Next Review:** 2026-02-28  
**Maintained By:** DevOps Team & Engineering Leadership
