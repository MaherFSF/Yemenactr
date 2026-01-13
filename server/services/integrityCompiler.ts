/**
 * Integrity Compiler Service
 * 
 * Automated QA checks for YETO platform:
 * - Hardcode Scanner: Detects static values in code
 * - Provenance Checker: Verifies all values have claims
 * - Export Integrity Validator: Verifies exports match claims
 * - Translation Checker: Ensures bilingual coverage
 * - Click Audit: Crawls UI to verify all links/buttons work
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

// Types for QA results
export interface QACheckResult {
  checkType: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: any;
  filePath?: string;
  lineNumber?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedFix?: string;
}

export interface QAReport {
  runId: number;
  runType: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'pass' | 'pass_warn' | 'fail';
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  failedChecks: number;
  results: QACheckResult[];
}

// Patterns for detecting hardcoded values
const HARDCODE_PATTERNS = [
  // Numeric values that look like economic data
  { pattern: /(?<![a-zA-Z0-9_])(\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*(?:billion|million|trillion|B|M|T)/gi, type: 'currency_amount' },
  { pattern: /(?<![a-zA-Z0-9_])(\d+(?:\.\d+)?)\s*%/g, type: 'percentage' },
  { pattern: /(?<![a-zA-Z0-9_])(19|20)\d{2}(?![0-9])/g, type: 'year' },
  // Exchange rates
  { pattern: /(?<![a-zA-Z0-9_])(\d+(?:\.\d+)?)\s*(?:YER|USD|SAR)/gi, type: 'exchange_rate' },
  // Population/count data
  { pattern: /(?<![a-zA-Z0-9_])(\d{1,3}(?:,\d{3})+)\s*(?:people|persons|households|beneficiaries)/gi, type: 'population' },
  // Bank/financial data
  { pattern: /(?<![a-zA-Z0-9_])(\d+(?:\.\d+)?)\s*(?:assets|deposits|loans|capital)/gi, type: 'financial_metric' },
];

// Files/directories to exclude from scanning
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  '*.test.ts',
  '*.spec.ts',
  'migrations',
  '__snapshots__',
];

/**
 * Scan for hardcoded values in the codebase
 */
export async function runHardcodeScan(projectPath: string): Promise<QACheckResult[]> {
  const results: QACheckResult[] = [];
  const filesToScan: string[] = [];
  
  // Collect files to scan
  function collectFiles(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(projectPath, fullPath);
        
        // Check exclusions
        if (EXCLUDE_PATTERNS.some(pattern => {
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(entry.name);
          }
          return relativePath.includes(pattern);
        })) {
          continue;
        }
        
        if (entry.isDirectory()) {
          collectFiles(fullPath);
        } else if (entry.isFile() && /\.(tsx?|jsx?|json)$/.test(entry.name)) {
          filesToScan.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  collectFiles(projectPath);
  
  // Scan each file
  for (const filePath of filesToScan) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const relativePath = path.relative(projectPath, filePath);
      
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        
        for (const { pattern, type } of HARDCODE_PATTERNS) {
          let match: RegExpExecArray | null;
          const regex = new RegExp(pattern.source, pattern.flags);
          while ((match = regex.exec(line)) !== null) {
            // Skip if it's in a comment
            const beforeMatch = line.substring(0, match.index);
            if (beforeMatch.includes('//') || beforeMatch.includes('/*')) continue;
            
            // Skip if it's in a test file
            if (relativePath.includes('.test.') || relativePath.includes('.spec.')) continue;
            
            // Skip if it looks like a constant definition
            if (/const\s+[A-Z_]+\s*=/.test(line)) continue;
            
            // Determine severity based on type
            let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
            if (type === 'currency_amount' || type === 'financial_metric') {
              severity = 'high';
            } else if (type === 'year') {
              severity = 'low';
            }
            
            results.push({
              checkType: 'hardcode_detection',
              status: severity === 'high' ? 'fail' : 'warning',
              message: `Hardcoded ${type} detected: ${match[0]}`,
              filePath: relativePath,
              lineNumber: lineNum + 1,
              severity,
              suggestedFix: `Replace with ClaimValue component or database-backed value`,
              details: {
                matchedText: match[0],
                valueType: type,
                context: line.trim().substring(0, 100)
              }
            });
          }
        }
      }
    } catch (error) {
      // Skip files we can't read
    }
  }
  
  return results;
}

/**
 * Check that all displayed values have provenance claims
 */
export async function runProvenanceCheck(): Promise<QACheckResult[]> {
  const results: QACheckResult[] = [];
  const db = await getDb();
  if (!db) {
    results.push({
      checkType: 'provenance_check',
      status: 'fail',
      message: 'Database not available',
      severity: 'critical'
    });
    return results;
  }
  
  try {
    // Check for claims without evidence
    const [claimsWithoutEvidence] = await db.execute(sql`
      SELECT c.id, c.claimType, c.valueNumeric, c.valueText
      FROM claims c
      LEFT JOIN claim_evidence_links cel ON c.id = cel.claimId
      WHERE cel.id IS NULL
      LIMIT 100
    `);
    
    if (Array.isArray(claimsWithoutEvidence) && claimsWithoutEvidence.length > 0) {
      for (const claim of claimsWithoutEvidence as any[]) {
        results.push({
          checkType: 'provenance_check',
          status: 'warning',
          message: `Claim ${claim.id} has no linked evidence`,
          severity: 'medium',
          suggestedFix: 'Link evidence documents or observations to this claim',
          details: { claimId: claim.id, claimType: claim.claimType }
        });
      }
    }
    
    // Check for low confidence claims
    const [lowConfidenceClaims] = await db.execute(sql`
      SELECT id, claimType, confidenceGrade, valueNumeric
      FROM claims
      WHERE confidenceGrade = 'D'
      LIMIT 50
    `);
    
    if (Array.isArray(lowConfidenceClaims) && lowConfidenceClaims.length > 0) {
      for (const claim of lowConfidenceClaims as any[]) {
        results.push({
          checkType: 'provenance_check',
          status: 'warning',
          message: `Claim ${claim.id} has low confidence (Grade D)`,
          severity: 'low',
          suggestedFix: 'Find additional evidence to improve confidence',
          details: { claimId: claim.id, grade: claim.confidenceGrade }
        });
      }
    }
    
    // Check for disputed claims
    const [disputedClaims] = await db.execute(sql`
      SELECT id, claimType, conflictStatus, valueNumeric
      FROM claims
      WHERE conflictStatus = 'disputed'
      LIMIT 50
    `);
    
    if (Array.isArray(disputedClaims) && disputedClaims.length > 0) {
      for (const claim of disputedClaims as any[]) {
        results.push({
          checkType: 'provenance_check',
          status: 'fail',
          message: `Claim ${claim.id} is disputed - conflicting sources`,
          severity: 'high',
          suggestedFix: 'Review conflicting sources and resolve dispute',
          details: { claimId: claim.id, status: claim.conflictStatus }
        });
      }
    }
    
    // If no issues found
    if (results.length === 0) {
      results.push({
        checkType: 'provenance_check',
        status: 'pass',
        message: 'All claims have proper provenance',
        severity: 'low'
      });
    }
  } catch (error) {
    results.push({
      checkType: 'provenance_check',
      status: 'fail',
      message: `Provenance check failed: ${error}`,
      severity: 'critical'
    });
  }
  
  return results;
}

/**
 * Check translation coverage
 */
export async function runTranslationCheck(projectPath: string): Promise<QACheckResult[]> {
  const results: QACheckResult[] = [];
  
  try {
    // Check LanguageContext for translation keys
    const langContextPath = path.join(projectPath, 'client/src/contexts/LanguageContext.tsx');
    if (fs.existsSync(langContextPath)) {
      const content = fs.readFileSync(langContextPath, 'utf-8');
      
      // Extract English keys
      const enMatch = content.match(/en:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
      const arMatch = content.match(/ar:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
      
      if (enMatch && arMatch) {
        const enKeys = (enMatch[1].match(/"[^"]+"\s*:/g) || []).map(k => k.replace(/["\:]/g, '').trim());
        const arKeys = (arMatch[1].match(/"[^"]+"\s*:/g) || []).map(k => k.replace(/["\:]/g, '').trim());
        
        // Find missing Arabic translations
        const missingAr = enKeys.filter(k => !arKeys.includes(k));
        const missingEn = arKeys.filter(k => !enKeys.includes(k));
        
        if (missingAr.length > 0) {
          results.push({
            checkType: 'translation_check',
            status: 'warning',
            message: `${missingAr.length} English keys missing Arabic translations`,
            severity: 'medium',
            suggestedFix: 'Add Arabic translations for missing keys',
            details: { missingKeys: missingAr.slice(0, 20) }
          });
        }
        
        if (missingEn.length > 0) {
          results.push({
            checkType: 'translation_check',
            status: 'warning',
            message: `${missingEn.length} Arabic keys missing English translations`,
            severity: 'medium',
            suggestedFix: 'Add English translations for missing keys',
            details: { missingKeys: missingEn.slice(0, 20) }
          });
        }
        
        if (missingAr.length === 0 && missingEn.length === 0) {
          results.push({
            checkType: 'translation_check',
            status: 'pass',
            message: 'All translation keys have both English and Arabic versions',
            severity: 'low'
          });
        }
      }
    }
  } catch (error) {
    results.push({
      checkType: 'translation_check',
      status: 'fail',
      message: `Translation check failed: ${error}`,
      severity: 'medium'
    });
  }
  
  return results;
}

/**
 * Check data coverage by year/sector/governorate
 */
export async function runCoverageCheck(): Promise<QACheckResult[]> {
  const results: QACheckResult[] = [];
  const db = await getDb();
  if (!db) {
    results.push({
      checkType: 'coverage_check',
      status: 'fail',
      message: 'Database not available',
      severity: 'critical'
    });
    return results;
  }
  
  try {
    // Check for coverage gaps
    const gaps = await db.execute(sql`
      SELECT year, sector, governorate, coverageScore
      FROM coverage_cells
      WHERE coverageScore < 0.3
      ORDER BY coverageScore ASC
      LIMIT 50
    `);
    
    const gapsArray = Array.isArray(gaps) ? gaps : (gaps as any)[0] || [];
    if (gapsArray.length > 0) {
      for (const gap of gapsArray as any[]) {
        results.push({
          checkType: 'coverage_check',
          status: gap.coverageScore < 0.1 ? 'fail' : 'warning',
          message: `Low coverage: ${gap.year} / ${gap.sector} / ${gap.governorate} (${(gap.coverageScore * 100).toFixed(1)}%)`,
          severity: gap.coverageScore < 0.1 ? 'high' : 'medium',
          suggestedFix: 'Add more data sources or claims for this cell',
          details: { year: gap.year, sector: gap.sector, governorate: gap.governorate, score: gap.coverageScore }
        });
      }
    }
    
    // Check for missing years
    const currentYear = new Date().getFullYear();
    const yearCoverage = await db.execute(sql`
      SELECT DISTINCT year FROM coverage_cells ORDER BY year
    `);
    
    const yearCoverageArray = Array.isArray(yearCoverage) ? yearCoverage : (yearCoverage as any)[0] || [];
    const coveredYears = new Set((yearCoverageArray as any[]).map(r => r.year));
    for (let year = 2015; year <= currentYear; year++) {
      if (!coveredYears.has(year)) {
        results.push({
          checkType: 'coverage_check',
          status: 'warning',
          message: `No coverage data for year ${year}`,
          severity: 'medium',
          suggestedFix: `Initialize coverage cells for year ${year}`
        });
      }
    }
    
    if (results.length === 0) {
      results.push({
        checkType: 'coverage_check',
        status: 'pass',
        message: 'Coverage is adequate across all tracked cells',
        severity: 'low'
      });
    }
  } catch (error) {
    results.push({
      checkType: 'coverage_check',
      status: 'fail',
      message: `Coverage check failed: ${error}`,
      severity: 'critical'
    });
  }
  
  return results;
}

/**
 * Run a full integrity scan
 */
export async function runFullIntegrityScan(projectPath: string): Promise<QAReport> {
  const startedAt = new Date();
  const allResults: QACheckResult[] = [];
  
  // Run all checks
  const hardcodeResults = await runHardcodeScan(projectPath);
  allResults.push(...hardcodeResults);
  
  const provenanceResults = await runProvenanceCheck();
  allResults.push(...provenanceResults);
  
  const translationResults = await runTranslationCheck(projectPath);
  allResults.push(...translationResults);
  
  const coverageResults = await runCoverageCheck();
  allResults.push(...coverageResults);
  
  // Calculate summary
  const passedChecks = allResults.filter(r => r.status === 'pass').length;
  const warningChecks = allResults.filter(r => r.status === 'warning').length;
  const failedChecks = allResults.filter(r => r.status === 'fail').length;
  
  let status: 'pass' | 'pass_warn' | 'fail' = 'pass';
  if (failedChecks > 0) {
    status = 'fail';
  } else if (warningChecks > 0) {
    status = 'pass_warn';
  }
  
  return {
    runId: Date.now(),
    runType: 'full_integrity',
    startedAt,
    completedAt: new Date(),
    status,
    totalChecks: allResults.length,
    passedChecks,
    warningChecks,
    failedChecks,
    results: allResults
  };
}

/**
 * Create fix tickets from QA results
 */
export async function createFixTicketsFromResults(results: QACheckResult[], qaRunId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  let ticketsCreated = 0;
  
  for (const result of results) {
    if (result.status === 'fail' || (result.status === 'warning' && result.severity === 'high')) {
      try {
        await db.execute(sql`
          INSERT INTO fix_tickets (
            ticketType, severity, title, description, 
            affectedRoute, suggestedFix, qaRunId, status
          ) VALUES (
            ${result.checkType === 'hardcode_detection' ? 'hardcode_violation' : 
              result.checkType === 'provenance_check' ? 'provenance_gap' :
              result.checkType === 'coverage_check' ? 'coverage_gap' :
              result.checkType === 'translation_check' ? 'translation_gap' : 'data_quality'},
            ${result.severity},
            ${result.message.substring(0, 200)},
            ${JSON.stringify(result.details || {})},
            ${result.filePath || null},
            ${result.suggestedFix || null},
            ${qaRunId},
            'open'
          )
        `);
        ticketsCreated++;
      } catch (error) {
        console.error('Failed to create ticket:', error);
      }
    }
  }
  
  return ticketsCreated;
}

export default {
  runHardcodeScan,
  runProvenanceCheck,
  runTranslationCheck,
  runCoverageCheck,
  runFullIntegrityScan,
  createFixTicketsFromResults
};
