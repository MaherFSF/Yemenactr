#!/usr/bin/env npx tsx
/**
 * YETO Platform Validation Script
 * Runs comprehensive checks on the platform
 * Usage: npx tsx scripts/validate.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string[];
}

const results: CheckResult[] = [];

function log(message: string) {
  console.log(`\x1b[36m[YETO]\x1b[0m ${message}`);
}

function pass(name: string, message: string) {
  results.push({ name, status: 'pass', message });
  console.log(`\x1b[32m✓\x1b[0m ${name}: ${message}`);
}

function fail(name: string, message: string, details?: string[]) {
  results.push({ name, status: 'fail', message, details });
  console.log(`\x1b[31m✗\x1b[0m ${name}: ${message}`);
  if (details) {
    details.forEach(d => console.log(`  - ${d}`));
  }
}

function warn(name: string, message: string, details?: string[]) {
  results.push({ name, status: 'warn', message, details });
  console.log(`\x1b[33m⚠\x1b[0m ${name}: ${message}`);
  if (details) {
    details.forEach(d => console.log(`  - ${d}`));
  }
}

// Check 1: Required files exist
function checkRequiredFiles() {
  log('Checking required files...');
  const requiredFiles = [
    'package.json',
    'drizzle/schema.ts',
    'server/routers.ts',
    'server/db.ts',
    'client/src/App.tsx',
    'client/src/pages/Home.tsx',
    'client/src/pages/Dashboard.tsx',
    'docs/0_START_HERE.md',
    'docs/WORKPLAN.md',
    'docs/REQ_INDEX.md',
    'STATUS.md',
    'todo.md',
  ];

  const missing: string[] = [];
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      missing.push(file);
    }
  }

  if (missing.length === 0) {
    pass('Required Files', `All ${requiredFiles.length} required files present`);
  } else {
    fail('Required Files', `Missing ${missing.length} files`, missing);
  }
}

// Check 2: TypeScript compilation
function checkTypeScript() {
  log('Checking TypeScript compilation...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    pass('TypeScript', 'No type errors');
  } catch (error: any) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const errorCount = (output.match(/error TS/g) || []).length;
    fail('TypeScript', `${errorCount} type errors found`);
  }
}

// Check 3: Tests pass
function checkTests() {
  log('Running tests...');
  try {
    const output = execSync('pnpm test', { stdio: 'pipe' }).toString();
    const passMatch = output.match(/(\d+) passed/);
    const passCount = passMatch ? passMatch[1] : '?';
    pass('Tests', `${passCount} tests passed`);
  } catch (error: any) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const failMatch = output.match(/(\d+) failed/);
    const failCount = failMatch ? failMatch[1] : '?';
    fail('Tests', `${failCount} tests failed`);
  }
}

// Check 4: All routes have pages
function checkRoutes() {
  log('Checking route coverage...');
  const appPath = path.join(process.cwd(), 'client/src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');
  
  // Extract routes from App.tsx
  const routeMatches = appContent.matchAll(/path="([^"]+)"/g);
  const routes = [...routeMatches].map(m => m[1]);
  
  // Check if corresponding page files exist
  const pagesDir = path.join(process.cwd(), 'client/src/pages');
  const missingPages: string[] = [];
  
  for (const route of routes) {
    // Skip dynamic routes and root
    if (route.includes(':') || route === '/') continue;
    
    // Convert route to potential file name
    const pageName = route.split('/').filter(Boolean).map(
      s => s.charAt(0).toUpperCase() + s.slice(1)
    ).join('');
    
    // Check various possible locations
    const possiblePaths = [
      path.join(pagesDir, `${pageName}.tsx`),
      path.join(pagesDir, pageName, 'index.tsx'),
    ];
    
    const exists = possiblePaths.some(p => fs.existsSync(p));
    if (!exists && pageName) {
      missingPages.push(`${route} -> ${pageName}.tsx`);
    }
  }

  if (missingPages.length === 0) {
    pass('Routes', `All ${routes.length} routes have corresponding pages`);
  } else {
    warn('Routes', `${missingPages.length} routes may be missing pages`, missingPages.slice(0, 5));
  }
}

// Check 5: Bilingual coverage
function checkBilingualCoverage() {
  log('Checking bilingual coverage...');
  const pagesDir = path.join(process.cwd(), 'client/src/pages');
  const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));
  
  const missingArabic: string[] = [];
  
  for (const file of pageFiles) {
    const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
    
    // Check if file uses language context
    const hasLanguageContext = content.includes('useLanguage') || content.includes('isArabic');
    
    // Check for Arabic text
    const hasArabicText = /[\u0600-\u06FF]/.test(content);
    
    if (!hasLanguageContext && !hasArabicText) {
      missingArabic.push(file);
    }
  }

  if (missingArabic.length === 0) {
    pass('Bilingual', `All ${pageFiles.length} pages have Arabic support`);
  } else {
    warn('Bilingual', `${missingArabic.length} pages may need Arabic translations`, missingArabic.slice(0, 5));
  }
}

// Check 6: DEV labels on sample data
function checkDevLabels() {
  log('Checking DEV labels...');
  const componentsDir = path.join(process.cwd(), 'client/src/components');
  
  // Check if DataQualityBadge component exists
  const badgePath = path.join(componentsDir, 'DataQualityBadge.tsx');
  if (fs.existsSync(badgePath)) {
    const content = fs.readFileSync(badgePath, 'utf-8');
    if (content.includes('DevModeBanner') && content.includes('DataQualityBadge')) {
      pass('DEV Labels', 'DataQualityBadge and DevModeBanner components exist');
    } else {
      warn('DEV Labels', 'DataQualityBadge component may be incomplete');
    }
  } else {
    fail('DEV Labels', 'DataQualityBadge component not found');
  }
}

// Check 7: Evidence Pack integration
function checkEvidencePacks() {
  log('Checking Evidence Pack integration...');
  const componentsDir = path.join(process.cwd(), 'client/src/components');
  
  const evidenceComponents = [
    'EvidencePack.tsx',
    'EvidencePackButton.tsx',
  ];
  
  const found: string[] = [];
  const missing: string[] = [];
  
  for (const comp of evidenceComponents) {
    if (fs.existsSync(path.join(componentsDir, comp))) {
      found.push(comp);
    } else {
      missing.push(comp);
    }
  }

  if (missing.length === 0) {
    pass('Evidence Packs', `All ${evidenceComponents.length} Evidence Pack components exist`);
  } else {
    warn('Evidence Packs', `${missing.length} Evidence Pack components missing`, missing);
  }
}

// Check 8: Database schema completeness
function checkDatabaseSchema() {
  log('Checking database schema...');
  const schemaPath = path.join(process.cwd(), 'drizzle/schema.ts');
  const content = fs.readFileSync(schemaPath, 'utf-8');
  
  const requiredTables = [
    'users',
    'indicators',
    'timeSeries',
    'sources',
    'events',
    'glossary',
    'stakeholders',
  ];
  
  const found: string[] = [];
  const missing: string[] = [];
  
  for (const table of requiredTables) {
    if (content.includes(`export const ${table}`)) {
      found.push(table);
    } else {
      missing.push(table);
    }
  }

  if (missing.length === 0) {
    pass('Database Schema', `All ${requiredTables.length} required tables defined`);
  } else {
    warn('Database Schema', `${missing.length} tables may be missing`, missing);
  }
}

// Check 9: Documentation completeness
function checkDocumentation() {
  log('Checking documentation...');
  const docsDir = path.join(process.cwd(), 'docs');
  
  const requiredDocs = [
    '0_START_HERE.md',
    'WORKPLAN.md',
    'REQ_INDEX.md',
    'MOCKUP_MAP.md',
    'DATA_SOURCE_REGISTER.md',
    'ADMIN_MANUAL.md',
    'API_REFERENCE.md',
  ];
  
  const found: string[] = [];
  const missing: string[] = [];
  
  for (const doc of requiredDocs) {
    if (fs.existsSync(path.join(docsDir, doc))) {
      found.push(doc);
    } else {
      missing.push(doc);
    }
  }

  if (missing.length === 0) {
    pass('Documentation', `All ${requiredDocs.length} required docs present`);
  } else {
    warn('Documentation', `${missing.length} docs missing`, missing);
  }
}

// Check 10: Sector pages coverage
function checkSectorPages() {
  log('Checking sector pages...');
  const sectorsDir = path.join(process.cwd(), 'client/src/pages/sectors');
  
  const requiredSectors = [
    'Banking.tsx',
    'Trade.tsx',
    'Poverty.tsx',
    'Macroeconomy.tsx',
    'Prices.tsx',
    'Currency.tsx',
    'PublicFinance.tsx',
    'Energy.tsx',
    'FoodSecurity.tsx',
    'AidFlows.tsx',
    'LaborMarket.tsx',
    'ConflictEconomy.tsx',
    'Infrastructure.tsx',
    'Agriculture.tsx',
    'Investment.tsx',
  ];
  
  const found: string[] = [];
  const missing: string[] = [];
  
  for (const sector of requiredSectors) {
    if (fs.existsSync(path.join(sectorsDir, sector))) {
      found.push(sector);
    } else {
      missing.push(sector);
    }
  }

  if (missing.length === 0) {
    pass('Sector Pages', `All ${requiredSectors.length} sector pages exist`);
  } else {
    fail('Sector Pages', `${missing.length} sector pages missing`, missing);
  }
}

// Main execution
async function main() {
  console.log('\n\x1b[1m╔══════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[1m║        YETO Platform Validation Suite                     ║\x1b[0m');
  console.log('\x1b[1m╚══════════════════════════════════════════════════════════╝\x1b[0m\n');

  checkRequiredFiles();
  checkRoutes();
  checkBilingualCoverage();
  checkDevLabels();
  checkEvidencePacks();
  checkDatabaseSchema();
  checkDocumentation();
  checkSectorPages();
  
  // Summary
  console.log('\n\x1b[1m═══════════════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[1mSummary:\x1b[0m');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warned = results.filter(r => r.status === 'warn').length;
  
  console.log(`  \x1b[32m✓ Passed: ${passed}\x1b[0m`);
  console.log(`  \x1b[33m⚠ Warnings: ${warned}\x1b[0m`);
  console.log(`  \x1b[31m✗ Failed: ${failed}\x1b[0m`);
  console.log('\x1b[1m═══════════════════════════════════════════════════════════\x1b[0m\n');

  // Exit with error code if any failures
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
