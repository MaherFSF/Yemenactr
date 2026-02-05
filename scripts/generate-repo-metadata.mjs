#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const docsDir = path.join(repoRoot, 'docs');
const metricsPath = path.join(docsDir, 'REPO_METRICS.json');
const notesPath = path.join(docsDir, 'REPO_METADATA_NOTES.md');
const readmePath = path.join(repoRoot, 'README.md');

const AUTO_START = '<!-- AUTO:REPO_METRICS_START -->';
const AUTO_END = '<!-- AUTO:REPO_METRICS_END -->';

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.turbo',
  '.cache',
  '.pnpm-store',
  'migrations',
]);

const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.mts', '.cts']);

async function listFilesRecursive(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      files.push(...await listFilesRecursive(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function safeListFiles(dir) {
  try {
    return await listFilesRecursive(dir);
  } catch (err) {
    return [];
  }
}

async function runCommand(command, args, options = {}) {
  const startedAt = Date.now();
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd: repoRoot,
      env: process.env,
      maxBuffer: 20 * 1024 * 1024,
      ...options,
    });
    return {
      ok: true,
      stdout,
      stderr,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      ok: false,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? '',
      error,
      durationMs: Date.now() - startedAt,
    };
  }
}

function parseCounts(line) {
  if (!line) {
    return {};
  }
  const counts = {};
  const regex = /(\d+)\s+(passed|failed|skipped|todo|total)/gi;
  let match;
  while ((match = regex.exec(line)) !== null) {
    counts[match[2].toLowerCase()] = Number(match[1]);
  }
  const totalMatch = line.match(/\((\d+)\)/);
  if (totalMatch && counts.total === undefined) {
    counts.total = Number(totalMatch[1]);
  }
  return counts;
}

function parseTestSummary(output) {
  const lines = output.split('\n').map(line => line.trim()).filter(Boolean);
  const testsLine = lines.find(line => /^Tests[:\s]/.test(line));
  const testFilesLine = lines.find(line => /^Test Files[:\s]/.test(line));
  const durationLine = lines.find(line => /^Duration[:\s]/.test(line));

  const tests = parseCounts(testsLine);
  const testFiles = parseCounts(testFilesLine);

  return {
    testsLine: testsLine || null,
    testFilesLine: testFilesLine || null,
    durationLine: durationLine || null,
    tests,
    testFiles,
  };
}

function formatMetricValue(value) {
  if (value === null || value === undefined) {
    return 'UNKNOWN';
  }
  return String(value);
}

function formatTestsValue(tests) {
  if (!tests || tests.status === 'UNKNOWN') {
    return 'UNKNOWN (see docs/REPO_METADATA_NOTES.md)';
  }
  const summary = tests.summary?.tests || {};
  const parts = [];
  if (typeof summary.passed === 'number') {
    parts.push(`${summary.passed} passed`);
  }
  if (typeof summary.failed === 'number') {
    parts.push(`${summary.failed} failed`);
  }
  if (typeof summary.total === 'number') {
    parts.push(`${summary.total} total`);
  }
  if (parts.length === 0) {
    return tests.status;
  }
  return parts.join(', ');
}

function formatReleaseGateValue(releaseGate) {
  if (!releaseGate || releaseGate.status === 'UNKNOWN') {
    return 'UNKNOWN (see docs/REPO_METADATA_NOTES.md)';
  }
  return releaseGate.status;
}

function buildMetricsSection(metrics) {
  const generatedAt = metrics.generatedAt;
  const counts = metrics.repoCounts;
  const releaseGateValue = formatReleaseGateValue(metrics.releaseGate);
  const testsValue = formatTestsValue(metrics.tests);

  return [
    '## 📈 Repository Metrics (auto-generated)',
    '',
    `_Last generated: ${generatedAt}. Run \`node scripts/generate-repo-metadata.mjs\` to refresh._`,
    '',
    'See [docs/REPO_METRICS.json](./docs/REPO_METRICS.json) for the canonical snapshot.',
    '',
    '| Metric | Value | Source |',
    '|--------|-------|--------|',
    `| Release gate | ${releaseGateValue} | \`node scripts/release-gate.mjs --json\` |`,
    `| Tests | ${testsValue} | \`pnpm test\` |`,
    `| Connectors | ${formatMetricValue(counts.connectors)} | \`server/connectors/*\` |`,
    `| tRPC routers | ${formatMetricValue(counts.trpcRouters)} | \`server/routers/*Router.*\` |`,
    `| DB tables | ${formatMetricValue(counts.dbTables)} | \`drizzle/**/*.ts\` (\`mysqlTable\`) |`,
    `| Client pages | ${formatMetricValue(counts.pages)} | \`client/src/pages/**\` |`,
    '',
    '_If a value is UNKNOWN, see docs/REPO_METADATA_NOTES.md for details._',
  ].join('\n');
}

function buildNotesContent(generatedAt, unknownNotes) {
  const lines = [
    '# Repository Metadata Notes',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Source registry of truth',
    '',
    '- Canonical spreadsheet: data/registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx',
    '- Versioned spreadsheet copies: data/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_0.xlsx and data/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_5.xlsx',
    '- Canonical database table: source_registry (MySQL/TiDB)',
    '- Import scripts: scripts/import-registry-v2.3.ts, scripts/import-source-registry-v2.ts, scripts/import-source-registry.ts, scripts/initialize-sources.mjs',
    '',
    '## Unknown metrics',
  ];

  if (unknownNotes.length === 0) {
    lines.push('', '- None. All metrics generated successfully.');
  } else {
    lines.push('');
    unknownNotes.forEach(note => {
      lines.push(`- ${note.metric}: ${note.reason}`);
      if (note.command) {
        lines.push(`  - Command: \`${note.command}\``);
      }
    });
  }

  lines.push('');
  return lines.join('\n');
}

async function updateReadme(metrics) {
  const readme = await fs.readFile(readmePath, 'utf-8');
  if (!readme.includes(AUTO_START) || !readme.includes(AUTO_END)) {
    throw new Error('README markers for repo metrics not found.');
  }

  const metricsSection = buildMetricsSection(metrics);
  const regex = new RegExp(`${AUTO_START}[\\s\\S]*?${AUTO_END}`, 'm');
  const updatedReadme = readme.replace(
    regex,
    `${AUTO_START}\n${metricsSection}\n\n${AUTO_END}`,
  );

  await fs.writeFile(readmePath, updatedReadme);
}

async function main() {
  const generatedAt = new Date().toISOString();
  const unknownNotes = [];

  const connectorsDir = path.join(repoRoot, 'server', 'connectors');
  const routersDir = path.join(repoRoot, 'server', 'routers');
  const pagesDir = path.join(repoRoot, 'client', 'src', 'pages');
  const drizzleDir = path.join(repoRoot, 'drizzle');

  const connectorFiles = await safeListFiles(connectorsDir);
  const connectors = connectorFiles.filter(file => CODE_EXTENSIONS.has(path.extname(file))).length;

  const routerFiles = await safeListFiles(routersDir);
  const trpcRouters = routerFiles.filter(file =>
    /router\.(ts|tsx|js|mjs|mts|cts)$/i.test(path.basename(file)),
  ).length;

  const pageFiles = await safeListFiles(pagesDir);
  const pages = pageFiles.filter(file => {
    const ext = path.extname(file);
    return (ext === '.tsx' || ext === '.ts') && !file.endsWith('.d.ts');
  }).length;

  const drizzleFiles = (await safeListFiles(drizzleDir)).filter(file => file.endsWith('.ts'));
  const tableNames = new Set();
  const tableRegex = /mysqlTable\s*\(\s*["'`](.+?)["'`]/g;
  for (const file of drizzleFiles) {
    const content = await fs.readFile(file, 'utf-8');
    let match;
    while ((match = tableRegex.exec(content)) !== null) {
      tableNames.add(match[1]);
    }
  }
  const dbTables = tableNames.size;

  const releaseGateCommand = 'node scripts/release-gate.mjs --json';
  const releaseGateRun = await runCommand('node', ['scripts/release-gate.mjs', '--json']);
  let releaseGate = {
    status: 'UNKNOWN',
    command: releaseGateCommand,
    output: null,
    durationMs: releaseGateRun.durationMs,
  };

  if (releaseGateRun.stdout && releaseGateRun.stdout.trim()) {
    try {
      const parsed = JSON.parse(releaseGateRun.stdout.trim());
      let status = 'UNKNOWN';
      if (parsed?.allPassed === true) {
        status = 'PASS';
      } else if (parsed?.allPassed === false) {
        status = 'FAIL';
      }
      releaseGate = {
        status,
        command: releaseGateCommand,
        output: parsed,
        durationMs: releaseGateRun.durationMs,
      };
      if (status === 'UNKNOWN') {
        const errorReason = parsed?.status === 'ERROR' && parsed?.error ? parsed.error : null;
        unknownNotes.push({
          metric: 'Release gate',
          reason: errorReason || 'Release gate JSON output missing allPassed status.',
          command: releaseGateCommand,
        });
      }
    } catch (err) {
      unknownNotes.push({
        metric: 'Release gate',
        reason: `Unable to parse JSON output: ${err.message}`,
        command: releaseGateCommand,
      });
    }
  } else {
    const reason = releaseGateRun.error?.message || releaseGateRun.stderr?.trim() || 'No output from release gate.';
    unknownNotes.push({
      metric: 'Release gate',
      reason,
      command: releaseGateCommand,
    });
  }

  const testCommand = 'pnpm test';
  const testRun = await runCommand('pnpm', ['test']);
  const testOutput = `${testRun.stdout}\n${testRun.stderr}`;
  const testSummary = parseTestSummary(testOutput);

  let testsStatus = 'UNKNOWN';
  const hasTestSummary = Boolean(testSummary.testsLine || testSummary.testFilesLine);
  if (hasTestSummary) {
    testsStatus = testRun.ok ? 'PASS' : 'FAIL';
  }

  if (testsStatus === 'UNKNOWN') {
    const reason = testRun.error?.message || testRun.stderr?.trim() || 'No test summary output detected.';
    unknownNotes.push({
      metric: 'Tests',
      reason,
      command: testCommand,
    });
  }

  const metrics = {
    generatedAt,
    repoCounts: {
      connectors,
      trpcRouters,
      dbTables,
      pages,
    },
    releaseGate,
    tests: {
      status: testsStatus,
      command: testCommand,
      summary: testSummary,
      durationMs: testRun.durationMs,
    },
  };

  await fs.mkdir(docsDir, { recursive: true });
  await fs.writeFile(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
  await fs.writeFile(notesPath, buildNotesContent(generatedAt, unknownNotes));
  await updateReadme(metrics);

  process.stdout.write('Repo metadata refreshed.\n');
}

main().catch(err => {
  process.stderr.write(`Repo metadata refresh failed: ${err.message}\n`);
  process.exit(1);
});
