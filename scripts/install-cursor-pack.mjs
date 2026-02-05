#!/usr/bin/env node
/**
 * Install Cursor Pack
 * 
 * This script:
 * 1. Backs up existing directories that conflict with cursor pack
 * 2. Unzips the cursor pack
 * 3. Merges content appropriately
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, renameSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const CURSOR_PACK_ZIP = join(ROOT, 'yemenactr_cursor_pack.zip');
const TEMP_EXTRACT_DIR = join(ROOT, '.cursor_pack_temp');

function log(message) {
  console.log(`[cursor-pack] ${message}`);
}

function exec(command, options = {}) {
  log(`Running: ${command}`);
  return execSync(command, { 
    cwd: ROOT, 
    stdio: 'inherit',
    ...options 
  });
}

function backupIfExists(path, label) {
  const fullPath = join(ROOT, path);
  if (existsSync(fullPath)) {
    const backupPath = `${fullPath}.bak`;
    log(`Backing up existing ${label}: ${path} -> ${path}.bak`);
    if (existsSync(backupPath)) {
      log(`  Removing old backup at ${backupPath}`);
      exec(`rm -rf "${backupPath}"`);
    }
    renameSync(fullPath, backupPath);
    return true;
  }
  return false;
}

function main() {
  log('Starting Cursor Pack installation...');

  // Check if zip exists
  if (!existsSync(CURSOR_PACK_ZIP)) {
    console.error(`ERROR: Cursor pack zip not found at ${CURSOR_PACK_ZIP}`);
    process.exit(1);
  }

  log(`Found cursor pack: ${CURSOR_PACK_ZIP}`);

  // Create temp extraction directory
  if (existsSync(TEMP_EXTRACT_DIR)) {
    log('Cleaning up old temp directory...');
    exec(`rm -rf "${TEMP_EXTRACT_DIR}"`);
  }
  mkdirSync(TEMP_EXTRACT_DIR, { recursive: true });

  // Extract zip to temp directory
  log('Extracting cursor pack...');
  exec(`unzip -q "${CURSOR_PACK_ZIP}" -d "${TEMP_EXTRACT_DIR}"`);

  // The zip contains a parent directory, let's find it
  const extractedContents = join(TEMP_EXTRACT_DIR, 'yemenactr_cursor_pack');
  
  if (!existsSync(extractedContents)) {
    console.error(`ERROR: Expected directory ${extractedContents} not found after extraction`);
    process.exit(1);
  }

  // Back up existing directories that will be affected
  // Note: We're being careful here - only backing up if there's actual conflict
  
  // .cursor is new, no backup needed
  log('Installing .cursor/ directory (new)...');
  const cursorSrc = join(extractedContents, '.cursor');
  const cursorDest = join(ROOT, '.cursor');
  if (existsSync(cursorSrc)) {
    cpSync(cursorSrc, cursorDest, { recursive: true });
    log('  ✓ .cursor/ installed');
  }

  // agentos - backup existing and merge
  log('Processing agentos/ directory...');
  const agentosSrc = join(extractedContents, 'agentos');
  const agentosDest = join(ROOT, 'agentos');
  if (existsSync(agentosSrc)) {
    if (existsSync(agentosDest)) {
      backupIfExists('agentos', 'agentos directory');
    }
    cpSync(agentosSrc, agentosDest, { recursive: true });
    log('  ✓ agentos/ installed (existing backed up to agentos.bak)');
  }

  // docs - selective merge (keep existing, add new from pack)
  log('Processing docs/ directory...');
  const docsSrc = join(extractedContents, 'docs');
  const docsDest = join(ROOT, 'docs');
  if (existsSync(docsSrc)) {
    if (!existsSync(docsDest)) {
      mkdirSync(docsDest, { recursive: true });
    }
    // Copy cursor pack docs without overwriting existing files
    cpSync(docsSrc, docsDest, { recursive: true, force: false, errorOnExist: false });
    log('  ✓ docs/ merged (cursor pack docs added, existing preserved)');
  }

  // data/source_registry - add to existing data structure
  log('Processing data/source_registry/ directory...');
  const dataRegistrySrc = join(extractedContents, 'data', 'source_registry');
  const dataRegistryDest = join(ROOT, 'data', 'source_registry');
  if (existsSync(dataRegistrySrc)) {
    if (!existsSync(dataRegistryDest)) {
      mkdirSync(dataRegistryDest, { recursive: true });
    }
    cpSync(dataRegistrySrc, dataRegistryDest, { recursive: true });
    log('  ✓ data/source_registry/ installed');
  }

  // Clean up temp directory
  log('Cleaning up temporary files...');
  exec(`rm -rf "${TEMP_EXTRACT_DIR}"`);

  log('✓ Cursor pack installation complete!');
  log('');
  log('Summary:');
  log('  - .cursor/ directory created with rules and commands');
  log('  - agentos/ replaced (old version backed up to agentos.bak)');
  log('  - docs/ merged (cursor pack docs added)');
  log('  - data/source_registry/ added');
  log('');
  log('NOTE: Review backed up directories (.bak) and remove if no longer needed.');
}

try {
  main();
} catch (error) {
  console.error('Error during cursor pack installation:', error);
  process.exit(1);
}
