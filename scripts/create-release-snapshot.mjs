import fs from "node:fs";
import path from "node:path";

const version = process.argv[2];
if (!version) {
  console.error("Usage: pnpm release:snapshot vX.Y.Z");
  process.exit(1);
}

const root = process.cwd();
const latestPath = path.join(root, "docs", "releases", "latest.json");
const targetDir = path.join(root, "docs", "releases", version);
const manifestPath = path.join(targetDir, "manifest.json");
const readmePath = path.join(targetDir, "README.md");

if (!fs.existsSync(latestPath)) {
  console.error("Missing docs/releases/latest.json");
  process.exit(1);
}

if (fs.existsSync(targetDir)) {
  console.error(`Release folder already exists: ${targetDir}`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });

// Read latest.json, update version fields, then write to manifest
const latestContent = JSON.parse(fs.readFileSync(latestPath, "utf8"));
latestContent.platformVersion = version;
latestContent.platformTag = version;
fs.writeFileSync(
  manifestPath,
  JSON.stringify(latestContent, null, 2) + "\n",
  "utf8"
);

const now = new Date().toISOString();
const readme = `# Release ${version}

Snapshot created: ${now}

## What this contains
- manifest.json copied from docs/releases/latest.json
- Links to proof packs should be added if needed

## Notes
This folder is immutable after creation.
`;

fs.writeFileSync(readmePath, readme, "utf8");

console.log(`[release-snapshot] Created ${targetDir}`);
