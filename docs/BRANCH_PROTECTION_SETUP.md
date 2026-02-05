# Branch Protection Setup (GitHub)

Apply these settings to the `main` branch in GitHub:

## Required settings

- Require a pull request before merging
- Require status checks to pass before merging
- Block force pushes

## Optional (recommended)

- Require linear history

## Notes

- Ensure required checks include all CI workflows that gate deploys.
- Keep release gates enforced (see `node scripts/release-gate.mjs`).
