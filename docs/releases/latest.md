# Latest Release — v0.2.3-p0-evidence-native

## Snapshot

- **Platform tag:** v0.2.3-p0-evidence-native  
- **Commit:** b922fa3  
- **Tagger:** Manus (dev-agent@manus.ai)  
- **Tag date:** 2026-02-02  

## Proof packs (authoritative)

- `docs/PROOFS/2026-02-02_FINALIZATION/00_EXEC_SUMMARY.md`
- `docs/PROOFS/2026-02-02_FINALIZATION/SOURCE_OF_TRUTH_PACK.md`
- `docs/PROOFS/2026-02-02_RC/RC_PROOF_PACK.md`
- `docs/PROOFS/2026-02-02_FINALIZATION/RELEASE_PROOF_PACK.md`

## Live preview stats (verified)

Environment: https://yteocauseway.manus.space  
Last updated: 2026-02-06T19:40:13.134Z

| Metric | Value |
| --- | --- |
| Total indicators | 398 |
| Total sources | 307 |
| Total documents | 69 |
| Total events | 237 |
| Data points | 6,723 |
| Coverage | 1970 → 2026 |

## Quality gates

From proof packs:
- **Tests:** 740 passing (exec summary)  
- **TypeScript errors:** 0  
- **Release gates:** 11/11 passing  

## Known discrepancies (to resolve)

1) **Route sweep counts** differ between proof packs.  
2) **Test totals** (740 vs 737 with 2 flaky).  
3) **Data counts** vary slightly between proof packs and live preview.

These are documented in `docs/releases/latest.json` so the differences are
visible and traceable.

## Next alignment steps (recommended)

1) Add a production release tag that matches this manifest.  
2) Update runtime version (`npm_package_version`) to match the release tag.  
3) Publish `docs/releases/latest.json` to S3 for public verification.  
