import { execSync } from "node:child_process";

const baseRef = process.env.RELEASE_GUARD_BASE || "origin/main";

const getDiff = () => {
  try {
    return execSync(`git diff --name-status ${baseRef}...HEAD`, {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    console.error(`[release-guard] Failed to diff against ${baseRef}.`);
    throw error;
  }
};

const pathExistsInBase = (path) => {
  try {
    execSync(`git cat-file -e ${baseRef}:${path}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const diff = getDiff();
if (!diff) {
  console.log("[release-guard] No changes detected.");
  process.exit(0);
}

const violations = [];

for (const line of diff.split("\n")) {
  if (!line.trim()) continue;
  const parts = line.trim().split(/\s+/);
  const status = parts[0];
  const file = parts.slice(1).join(" ");

  if (!file.startsWith("docs/releases/v")) continue;

  const versionFolder = file.split("/").slice(0, 3).join("/");
  const versionExists = pathExistsInBase(versionFolder);

  if (versionExists) {
    violations.push({ status, file, reason: "existing-release-modified" });
    continue;
  }

  if (status !== "A") {
    violations.push({ status, file, reason: "new-release-not-added" });
  }
}

if (violations.length) {
  console.error("[release-guard] Release immutability violation:");
  for (const v of violations) {
    console.error(`- ${v.status} ${v.file} (${v.reason})`);
  }
  process.exit(1);
}

console.log("[release-guard] OK: no frozen release changes detected.");
