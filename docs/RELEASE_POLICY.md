# Release Policy (Immutability + Manus Intake)

This policy prevents future Manus pushes from mutating past releases. It also
defines how to evaluate and adopt future Manus updates.

## 1) Immutability rule

Once a release is published under `docs/releases/vX.Y.Z/`, it is **frozen**.

- No edits
- No deletions
- No new files

If you need a correction, **create a new release folder** and keep the older
one intact.

## 2) Canonical "latest" pointer

`docs/releases/latest.json` is the only mutable pointer. It always reflects the
most recently accepted release.

## 3) Manus intake (how to check new pushes)

Use the script:

```bash
pnpm release:check-manus
```

This lists Manus-authored commits since the latest release tag. If anything is
worth adopting, create a **new** release folder and update `latest.json`.

## 4) New release creation

```bash
pnpm release:snapshot vX.Y.Z
```

This creates:

```
docs/releases/vX.Y.Z/manifest.json
docs/releases/vX.Y.Z/README.md
```

Then update `docs/releases/latest.json` to point to the new version.

## 5) Guardrail (prevents old release edits)

```bash
pnpm release:guard
```

This fails if any existing `docs/releases/v*/` folder is modified. Use it in CI
to ensure older versions are never touched.

## 6) Backup + production verification

Publish manifests and backups:

```bash
aws s3 cp docs/releases/latest.json \
  s3://yeto-assets/releases/latest.json

aws s3 sync docs/releases/vX.Y.Z \
  s3://yeto-backups/releases/vX.Y.Z
```

This makes the version visible at:

```
https://yeto.causewaygrp.com/releases/latest.json
```
