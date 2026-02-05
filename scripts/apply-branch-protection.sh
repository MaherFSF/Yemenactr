#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${GH_TOKEN:-}" ]]; then
  echo "GH_TOKEN is required. Create a GitHub token with admin:repo permissions and export GH_TOKEN." >&2
  echo "Example: export GH_TOKEN=ghp_..." >&2
  exit 1
fi

if [[ -z "${REQUIRED_CHECKS:-}" ]]; then
  echo "REQUIRED_CHECKS is required (comma-separated list of status check names)." >&2
  echo "Example: export REQUIRED_CHECKS=\"build,test,lint\"" >&2
  exit 1
fi

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
BRANCH_NAME="${BRANCH_NAME:-main}"
REQUIRE_LINEAR_HISTORY="${REQUIRE_LINEAR_HISTORY:-true}"
REQUIRED_APPROVALS="${REQUIRED_APPROVALS:-1}"

echo "Applying branch protection to ${REPO}:${BRANCH_NAME}"
echo "This requires admin permissions on the repository."

payload="$(node -e '
  const checks = process.env.REQUIRED_CHECKS.split(",").map(c => c.trim()).filter(Boolean);
  const payload = {
    required_status_checks: {
      strict: true,
      contexts: checks,
    },
    required_pull_request_reviews: {
      required_approving_review_count: Number(process.env.REQUIRED_APPROVALS || 1),
    },
    enforce_admins: true,
    required_linear_history: process.env.REQUIRE_LINEAR_HISTORY === "true",
    allow_force_pushes: false,
    allow_deletions: false,
  };
  console.log(JSON.stringify(payload));
')"

gh api -X PUT "repos/${REPO}/branches/${BRANCH_NAME}/protection" \
  -H "Accept: application/vnd.github+json" \
  --input - <<<"${payload}"

echo "Branch protection applied."
