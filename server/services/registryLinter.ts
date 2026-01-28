/**
 * PIPE_REGISTRY_LINT - Source Registry Linter
 * Validates all sources in the registry for required fields, unique IDs, and proper configuration.
 * Runs in CI and daily scheduler.
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

// Validation rule types
interface ValidationRule {
  field: string;
  rule: 'required' | 'unique' | 'enum' | 'format' | 'range';
  message: string;
  validator?: (value: any) => boolean;
  allowedValues?: string[];
}

// Lint result for a single source
interface LintResult {
  sourceId: string;
  sourceName: string;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

// Overall lint report
export interface RegistryLintReport {
  timestamp: Date;
  totalSources: number;
  validSources: number;
  invalidSources: number;
  totalErrors: number;
  totalWarnings: number;
  results: LintResult[];
  summary: {
    missingRequiredFields: number;
    duplicateSourceIds: number;
    invalidCadence: number;
    missingLicense: number;
    missingAuthFlags: number;
  };
}

// Required fields for each source
const REQUIRED_FIELDS: ValidationRule[] = [
  { field: 'source_id', rule: 'required', message: 'source_id is required' },
  { field: 'source_id', rule: 'unique', message: 'source_id must be unique' },
  { field: 'name', rule: 'required', message: 'name is required' },
  { field: 'organization', rule: 'required', message: 'organization is required' },
  { field: 'url', rule: 'required', message: 'url is required' },
  { field: 'cadence', rule: 'required', message: 'cadence is required' },
  { field: 'cadence', rule: 'enum', message: 'cadence must be valid', allowedValues: ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'irregular', 'real-time'] },
  { field: 'license', rule: 'required', message: 'license is required' },
  { field: 'auth_required', rule: 'required', message: 'auth_required flag is required' },
];

// Warning rules (not blocking but should be addressed)
const WARNING_RULES: ValidationRule[] = [
  { field: 'tolerance_days', rule: 'required', message: 'tolerance_days should be specified for scheduling' },
  { field: 'description', rule: 'required', message: 'description should be provided' },
  { field: 'contact_email', rule: 'required', message: 'contact_email should be provided for partnership sources' },
  { field: 'data_format', rule: 'required', message: 'data_format should be specified' },
];

/**
 * Lint a single source record
 */
function lintSource(source: any, allSourceIds: Set<string>): LintResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  for (const rule of REQUIRED_FIELDS) {
    const value = source[rule.field];
    
    if (rule.rule === 'required' && (value === null || value === undefined || value === '')) {
      errors.push(`${rule.field}: ${rule.message}`);
    }
    
    if (rule.rule === 'unique' && rule.field === 'source_id') {
      if (allSourceIds.has(value)) {
        errors.push(`${rule.field}: Duplicate source_id "${value}"`);
      }
    }
    
    if (rule.rule === 'enum' && rule.allowedValues && value) {
      if (!rule.allowedValues.includes(value)) {
        errors.push(`${rule.field}: Invalid value "${value}". Allowed: ${rule.allowedValues.join(', ')}`);
      }
    }
  }

  // Check warning rules
  for (const rule of WARNING_RULES) {
    const value = source[rule.field];
    
    if (rule.rule === 'required' && (value === null || value === undefined || value === '')) {
      // Special case: contact_email only needed for partnership sources
      if (rule.field === 'contact_email' && !source.partnership_required) {
        continue;
      }
      warnings.push(`${rule.field}: ${rule.message}`);
    }
  }

  // Validate cadence + tolerance combination
  if (source.cadence && !source.tolerance_days) {
    const defaultTolerances: Record<string, number> = {
      'daily': 1,
      'weekly': 3,
      'monthly': 7,
      'quarterly': 14,
      'annual': 30,
      'irregular': 30,
      'real-time': 0,
    };
    warnings.push(`tolerance_days not set. Suggested default for ${source.cadence}: ${defaultTolerances[source.cadence] || 7} days`);
  }

  // Validate auth flags
  if (source.auth_required === true && !source.auth_type) {
    errors.push('auth_type is required when auth_required is true');
  }

  if (source.needs_key === true && !source.key_instructions) {
    warnings.push('key_instructions should be provided when needs_key is true');
  }

  if (source.partnership_required === true && !source.partnership_status) {
    warnings.push('partnership_status should be tracked when partnership_required is true');
  }

  return {
    sourceId: source.source_id || 'UNKNOWN',
    sourceName: source.name || 'Unnamed Source',
    errors,
    warnings,
    isValid: errors.length === 0,
  };
}

/**
 * Run the registry linter on all sources
 */
export async function runRegistryLint(): Promise<RegistryLintReport> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection not available');
  }

  // Fetch all sources from evidence_sources table
  const [sourceRows] = await db.execute(sql`
    SELECT 
      id as source_id,
      name,
      organization,
      url,
      description,
      dataFormat as data_format,
      updateFrequency as cadence,
      license,
      isActive as is_active,
      lastCheckedAt as last_checked_at,
      createdAt as created_at
    FROM evidence_sources
  `) as any;
  const allSourceIds = new Set<string>();
  const results: LintResult[] = [];

  // Summary counters
  let missingRequiredFields = 0;
  let duplicateSourceIds = 0;
  let invalidCadence = 0;
  let missingLicense = 0;
  let missingAuthFlags = 0;

  // Lint each source
  for (const source of sourceRows) {
    const result = lintSource(source, allSourceIds);
    results.push(result);

    // Track source IDs for duplicate detection
    if (source.source_id) {
      if (allSourceIds.has(source.source_id)) {
        duplicateSourceIds++;
      }
      allSourceIds.add(source.source_id);
    }

    // Update summary counters
    for (const error of result.errors) {
      if (error.includes('is required')) missingRequiredFields++;
      if (error.includes('Duplicate')) duplicateSourceIds++;
      if (error.includes('cadence')) invalidCadence++;
      if (error.includes('license')) missingLicense++;
      if (error.includes('auth')) missingAuthFlags++;
    }
  }

  const validSources = results.filter(r => r.isValid).length;
  const invalidSources = results.filter(r => !r.isValid).length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  return {
    timestamp: new Date(),
    totalSources: sourceRows.length,
    validSources,
    invalidSources,
    totalErrors,
    totalWarnings,
    results,
    summary: {
      missingRequiredFields,
      duplicateSourceIds,
      invalidCadence,
      missingLicense,
      missingAuthFlags,
    },
  };
}

/**
 * Format lint report as text for CI output
 */
export function formatLintReport(report: RegistryLintReport): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════════════',
    '                    PIPE_REGISTRY_LINT REPORT',
    '═══════════════════════════════════════════════════════════════',
    '',
    `Timestamp: ${report.timestamp.toISOString()}`,
    '',
    '┌─────────────────────────────────────────────────────────────┐',
    '│                        SUMMARY                               │',
    '├─────────────────────────────────────────────────────────────┤',
    `│ Total Sources:     ${String(report.totalSources).padStart(5)}                                   │`,
    `│ Valid Sources:     ${String(report.validSources).padStart(5)} ✅                                │`,
    `│ Invalid Sources:   ${String(report.invalidSources).padStart(5)} ${report.invalidSources > 0 ? '❌' : '✅'}                                │`,
    `│ Total Errors:      ${String(report.totalErrors).padStart(5)}                                   │`,
    `│ Total Warnings:    ${String(report.totalWarnings).padStart(5)}                                   │`,
    '└─────────────────────────────────────────────────────────────┘',
    '',
  ];

  if (report.invalidSources > 0) {
    lines.push('┌─────────────────────────────────────────────────────────────┐');
    lines.push('│                    INVALID SOURCES                          │');
    lines.push('└─────────────────────────────────────────────────────────────┘');
    lines.push('');

    for (const result of report.results.filter(r => !r.isValid)) {
      lines.push(`❌ ${result.sourceId} (${result.sourceName})`);
      for (const error of result.errors) {
        lines.push(`   └─ ERROR: ${error}`);
      }
      for (const warning of result.warnings) {
        lines.push(`   └─ WARN: ${warning}`);
      }
      lines.push('');
    }
  }

  if (report.totalWarnings > 0) {
    lines.push('┌─────────────────────────────────────────────────────────────┐');
    lines.push('│                      WARNINGS                               │');
    lines.push('└─────────────────────────────────────────────────────────────┘');
    lines.push('');

    for (const result of report.results.filter(r => r.warnings.length > 0 && r.isValid)) {
      lines.push(`⚠️  ${result.sourceId} (${result.sourceName})`);
      for (const warning of result.warnings) {
        lines.push(`   └─ ${warning}`);
      }
      lines.push('');
    }
  }

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push(`RESULT: ${report.invalidSources === 0 ? 'PASS ✅' : 'FAIL ❌'}`);
  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}

/**
 * Run lint and throw if invalid (for CI)
 */
export async function runRegistryLintCI(): Promise<void> {
  const report = await runRegistryLint();
  console.log(formatLintReport(report));
  
  if (report.invalidSources > 0) {
    throw new Error(`Registry lint failed: ${report.invalidSources} invalid sources found`);
  }
}
