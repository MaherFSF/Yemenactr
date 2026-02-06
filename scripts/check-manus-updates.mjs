import { execSync } from "node:child_process";

const run = (command) =>
  execSync(command, { encoding: "utf8" }).trim();

const latestTag = (() => {
  try {
    return run("git tag -l 'v*' --sort=-creatordate | head -n 1");
  } catch {
    return "";
  }
})();

const base = latestTag || "HEAD~50";
const authorRegex = "Manus\\|dev-agent@manus.ai";
const log = run(
  `git log ${base}..HEAD --author="${authorRegex}" --date=short --pretty=format:%h\\|%ad\\|%an\\|%s`
);

if (!log) {
  console.log("[manus-check] No Manus commits since latest tag.");
  process.exit(0);
}

console.log("[manus-check] Manus commits since latest tag:");
console.log(log);
console.log("");
console.log(
  "[manus-check] If any commit is worth adopting, create a new release folder and update docs/releases/latest.json."
);
