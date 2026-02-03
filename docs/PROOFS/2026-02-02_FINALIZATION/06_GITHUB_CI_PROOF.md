# GitHub CI Proof

**Timestamp**: 2026-02-03 03:15:00 UTC  
**Version**: v0.2.3-p0-evidence-native-rc1

## Git Remote Configuration

```
origin	s3://vida-prod-gitrepo/webdev-git/310419663029421755/XodoyKMzPdFiKkVj3QFTGK (fetch)
origin	s3://vida-prod-gitrepo/webdev-git/310419663029421755/XodoyKMzPdFiKkVj3QFTGK (push)
user_github	https://github.com/MaherFSF/Yemenactr.git (fetch)
user_github	https://github.com/MaherFSF/Yemenactr.git (push)
```

## Git Status

```
On branch main
Your branch is ahead of 'user_github/main' by 3 commits.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean
```

## Git Log (Last 5 Commits)

```
e0ff378 (HEAD -> main) docs: add release candidate finalization proofs - route truth table and DB reconciliation
33a61cb (origin/main, origin/HEAD) Checkpoint message
2f629c0 Checkpoint: fix(ci): add seed-ci.mjs script and update workflow to seed database before tests
fe0115b (user_github/main) Checkpoint: fix(db): resolve schema drift by adding missing FK references with short names to match migrations
a84f994 Checkpoint: fix(db): shorten all FK constraint names to under 64 chars for MySQL compatibility
```

## Git Tags

```
v0.2.0-p0-stability
v0.2.3-p0-evidence-native
v0.2.3-p0-evidence-native-rc1
```

## GitHub Actions CI Status

**Latest CI Run**: #20  
**Commit**: fe0115b  
**Status**: Tests executed (10 data-dependent tests failed due to CI database not having seed data)  
**URL**: https://github.com/MaherFSF/Yemenactr/actions/runs/21611279916

### CI Test Results Summary

| Category | Count | Status |
|----------|-------|--------|
| Total Tests | 740 | ✅ Executed |
| Passing | 730 | ✅ PASS |
| Failing | 10 | ⚠️ Data-dependent |

### Failing Tests (Data-Dependent)

These tests require seed data in the CI database:

1. `bulkClassification.test.ts` - expects classification columns and tier data
2. `placeholderDetector.test.ts` - expects time series records, economic events, research publications
3. `evidence-rule.test.ts` - expects evidence packs for Dashboard KPIs

**Root Cause**: CI MySQL container starts fresh without production seed data.  
**Mitigation**: seed-ci.mjs script created and workflow updated (pending GitHub App workflow permission).

## Push Status

**Note**: GitHub App connector lacks `workflows` permission to push workflow file changes.  
**Workaround**: Workflow changes must be pushed manually or via GitHub web interface.

## Conclusion

**STOP CONDITION C: PARTIALLY SATISFIED**

- ✅ Tag `v0.2.3-p0-evidence-native-rc1` created locally
- ✅ Tag `v0.2.3-p0-evidence-native` exists on GitHub
- ✅ CI run #20 executed and verified
- ⚠️ 10 data-dependent tests need seed data (P1 backlog item)
- ⚠️ Workflow update pending manual push (GitHub App permission limitation)
