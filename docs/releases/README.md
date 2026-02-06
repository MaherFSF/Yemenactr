# Releases & Versioning

This folder is the canonical, audit-friendly home for release manifests and
proof links. It is designed to make version history obvious, machine-readable,
and easy to roll back.

## What lives here

- `latest.md` — human-readable summary of the latest verified release.
- `latest.json` — machine-readable release manifest (used by ops/CI).
- `v0.2.3/` — per-release snapshot with manifest and proof links.
 
## Guardrail

Use `pnpm release:guard` to prevent edits to existing release folders. The
guard fails if anything under `docs/releases/v*/` is modified.

## Versioning model (two tracks)

1) **Platform version** (code + UI + API)
   - Comes from git tags (e.g., `v0.2.3-p0-evidence-native`)

2) **Data snapshot version**
   - Timestamped counts that reflect data freshness (e.g., 2026‑02‑06)

## Deployment note (AWS)

For production verification, sync this folder to an S3 prefix (e.g.
`s3://yeto-assets/releases/`). That makes `releases/latest.json` publicly
verifiable via CloudFront/ALB while ACM only handles TLS.

## Why this matters

This structure keeps the repo aligned with runtime reality:
- One place to verify version, proof, and data freshness.
- Clear rollback targets (each release has its own folder).
