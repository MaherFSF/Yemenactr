/**
 * Coverage Governor Service
 * 
 * Tracks data coverage across the YETO platform:
 * - Year × Sector × Governorate matrix
 * - Gap detection and scoring
 * - Coverage map generation
 * - Data gap ticket creation
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";

// Yemen's 22 governorates
export const GOVERNORATES = [
  'Sana\'a', 'Aden', 'Taiz', 'Hodeidah', 'Ibb', 'Hadramaut', 'Dhamar', 'Hajjah',
  'Amran', 'Saada', 'Al-Bayda', 'Lahij', 'Marib', 'Shabwah', 'Al-Mahwit', 
  'Al-Jawf', 'Raymah', 'Abyan', 'Al-Dhale\'e', 'Al-Mahrah', 'Socotra', 'Amanat Al-Asimah'
];

// YETO sectors
export const SECTORS = [
  'banking', 'trade', 'poverty', 'macroeconomy', 'prices', 'currency',
  'public_finance', 'energy', 'food_security', 'aid_flows', 'labor_market',
  'conflict_economy', 'infrastructure', 'agriculture', 'investment',
  'remittances', 'sanctions', 'humanitarian'
];

// Coverage years
export const COVERAGE_YEARS = Array.from({ length: 16 }, (_, i) => 2010 + i);

export interface CoverageCell {
  year: number;
  sector: string;
  governorate: string;
  coverageScore: number;
  claimCount: number;
  sourceCount: number;
  lastUpdated: Date;
  gaps: string[];
}

export interface CoverageMap {
  totalCells: number;
  coveredCells: number;
  avgCoverage: number;
  gapCount: number;
  criticalGaps: number;
  cells: CoverageCell[];
}

export interface CoverageGap {
  year: number;
  sector: string;
  governorate: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  suggestedAction: string;
}

/**
 * Calculate coverage score for a single cell
 */
export async function calculateCellCoverage(
  year: number, 
  sector: string, 
  governorate: string
): Promise<CoverageCell> {
  const db = await getDb();
  if (!db) {
    return {
      year,
      sector,
      governorate,
      coverageScore: 0,
      claimCount: 0,
      sourceCount: 0,
      lastUpdated: new Date(),
      gaps: ['Database not available']
    };
  }

  try {
    // Count claims for this cell
    const claimResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM claims 
      WHERE year = ${year} 
      AND sector = ${sector}
      AND (governorate = ${governorate} OR governorate IS NULL OR governorate = 'national')
    `);
    const claimCount = (claimResult as any)[0]?.[0]?.count || 0;

    // Count unique sources
    const sourceResult = await db.execute(sql`
      SELECT COUNT(DISTINCT sourceId) as count FROM claims 
      WHERE year = ${year} 
      AND sector = ${sector}
      AND (governorate = ${governorate} OR governorate IS NULL OR governorate = 'national')
    `);
    const sourceCount = (sourceResult as any)[0]?.[0]?.count || 0;

    // Calculate coverage score (0-1)
    // Based on: claim count, source diversity, recency
    let score = 0;
    
    // Claims contribution (up to 0.4)
    score += Math.min(claimCount / 50, 0.4);
    
    // Source diversity contribution (up to 0.3)
    score += Math.min(sourceCount / 5, 0.3);
    
    // Recency bonus (up to 0.3)
    const currentYear = new Date().getFullYear();
    const yearDiff = currentYear - year;
    if (yearDiff <= 1) score += 0.3;
    else if (yearDiff <= 3) score += 0.2;
    else if (yearDiff <= 5) score += 0.1;

    // Identify gaps
    const gaps: string[] = [];
    if (claimCount === 0) gaps.push('No data claims');
    else if (claimCount < 10) gaps.push('Insufficient claims');
    if (sourceCount === 0) gaps.push('No sources');
    else if (sourceCount < 2) gaps.push('Single source only');

    return {
      year,
      sector,
      governorate,
      coverageScore: Math.min(score, 1),
      claimCount,
      sourceCount,
      lastUpdated: new Date(),
      gaps
    };
  } catch (error) {
    return {
      year,
      sector,
      governorate,
      coverageScore: 0,
      claimCount: 0,
      sourceCount: 0,
      lastUpdated: new Date(),
      gaps: [`Error: ${error}`]
    };
  }
}

/**
 * Generate full coverage map
 */
export async function generateCoverageMap(
  options: {
    years?: number[];
    sectors?: string[];
    governorates?: string[];
  } = {}
): Promise<CoverageMap> {
  const years = options.years || COVERAGE_YEARS;
  const sectors = options.sectors || SECTORS;
  const governorates = options.governorates || ['national']; // Start with national level

  const cells: CoverageCell[] = [];
  let totalScore = 0;
  let gapCount = 0;
  let criticalGaps = 0;

  for (const year of years) {
    for (const sector of sectors) {
      for (const governorate of governorates) {
        const cell = await calculateCellCoverage(year, sector, governorate);
        cells.push(cell);
        totalScore += cell.coverageScore;
        
        if (cell.coverageScore < 0.3) {
          gapCount++;
          if (cell.coverageScore < 0.1) criticalGaps++;
        }
      }
    }
  }

  const totalCells = cells.length;
  const coveredCells = cells.filter(c => c.coverageScore >= 0.3).length;

  return {
    totalCells,
    coveredCells,
    avgCoverage: totalCells > 0 ? totalScore / totalCells : 0,
    gapCount,
    criticalGaps,
    cells
  };
}

/**
 * Detect coverage gaps and generate recommendations
 */
export async function detectCoverageGaps(
  threshold: number = 0.3
): Promise<CoverageGap[]> {
  const db = await getDb();
  if (!db) return [];

  const gaps: CoverageGap[] = [];

  try {
    // Get cells below threshold
    const result = await db.execute(sql`
      SELECT year, sector, governorate, coverageScore, claimCount, sourceCount
      FROM coverage_cells
      WHERE coverageScore < ${threshold}
      ORDER BY coverageScore ASC
      LIMIT 100
    `);

    const rows = Array.isArray(result) ? result : (result as any)[0] || [];
    
    for (const row of rows as any[]) {
      let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';
      let reason = '';
      let suggestedAction = '';

      if (row.coverageScore < 0.1) {
        severity = 'critical';
        reason = 'No data coverage';
        suggestedAction = 'Priority: Add primary source data for this cell';
      } else if (row.coverageScore < 0.2) {
        severity = 'high';
        reason = 'Very low coverage';
        suggestedAction = 'Add multiple source data points';
      } else if (row.coverageScore < 0.3) {
        severity = 'medium';
        reason = 'Below minimum threshold';
        suggestedAction = 'Supplement with additional sources';
      }

      if (row.claimCount === 0) {
        reason = 'Zero claims in database';
        suggestedAction = 'Ingest data from available sources';
      } else if (row.sourceCount < 2) {
        reason += ' (single source)';
        suggestedAction = 'Add corroborating sources';
      }

      gaps.push({
        year: row.year,
        sector: row.sector,
        governorate: row.governorate,
        severity,
        reason,
        suggestedAction
      });
    }
  } catch (error) {
    console.error('Error detecting coverage gaps:', error);
  }

  return gaps;
}

/**
 * Update coverage cells in database
 */
export async function updateCoverageCells(cells: CoverageCell[]): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  let updated = 0;

  for (const cell of cells) {
    try {
      await db.execute(sql`
        INSERT INTO coverage_cells (year, sector, governorate, coverageScore, claimCount, sourceCount, lastUpdated)
        VALUES (${cell.year}, ${cell.sector}, ${cell.governorate}, ${cell.coverageScore}, ${cell.claimCount}, ${cell.sourceCount}, ${cell.lastUpdated})
        ON DUPLICATE KEY UPDATE
          coverageScore = ${cell.coverageScore},
          claimCount = ${cell.claimCount},
          sourceCount = ${cell.sourceCount},
          lastUpdated = ${cell.lastUpdated}
      `);
      updated++;
    } catch (error) {
      console.error(`Error updating coverage cell ${cell.year}/${cell.sector}/${cell.governorate}:`, error);
    }
  }

  return updated;
}

/**
 * Create fix tickets for coverage gaps
 */
export async function createGapTickets(gaps: CoverageGap[]): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  let created = 0;

  for (const gap of gaps) {
    if (gap.severity === 'critical' || gap.severity === 'high') {
      try {
        await db.execute(sql`
          INSERT INTO fix_tickets (
            ticketType, severity, title, description, 
            affectedRoute, suggestedFix, status
          ) VALUES (
            'coverage_gap',
            ${gap.severity},
            ${`Coverage gap: ${gap.year} / ${gap.sector} / ${gap.governorate}`},
            ${JSON.stringify({ reason: gap.reason, year: gap.year, sector: gap.sector, governorate: gap.governorate })},
            ${`/sectors/${gap.sector}`},
            ${gap.suggestedAction},
            'open'
          )
        `);
        created++;
      } catch (error) {
        // Likely duplicate, skip
      }
    }
  }

  return created;
}

/**
 * Get coverage summary by sector
 */
export async function getCoverageBySector(): Promise<Record<string, { avgScore: number; gapCount: number }>> {
  const db = await getDb();
  if (!db) return {};

  const result: Record<string, { avgScore: number; gapCount: number }> = {};

  try {
    const rows = await db.execute(sql`
      SELECT 
        sector,
        AVG(coverageScore) as avgScore,
        SUM(CASE WHEN coverageScore < 0.3 THEN 1 ELSE 0 END) as gapCount
      FROM coverage_cells
      GROUP BY sector
    `);

    const data = Array.isArray(rows) ? rows : (rows as any)[0] || [];
    for (const row of data as any[]) {
      result[row.sector] = {
        avgScore: row.avgScore || 0,
        gapCount: row.gapCount || 0
      };
    }
  } catch (error) {
    console.error('Error getting coverage by sector:', error);
  }

  return result;
}

/**
 * Get coverage summary by year
 */
export async function getCoverageByYear(): Promise<Record<number, { avgScore: number; gapCount: number }>> {
  const db = await getDb();
  if (!db) return {};

  const result: Record<number, { avgScore: number; gapCount: number }> = {};

  try {
    const rows = await db.execute(sql`
      SELECT 
        year,
        AVG(coverageScore) as avgScore,
        SUM(CASE WHEN coverageScore < 0.3 THEN 1 ELSE 0 END) as gapCount
      FROM coverage_cells
      GROUP BY year
      ORDER BY year
    `);

    const data = Array.isArray(rows) ? rows : (rows as any)[0] || [];
    for (const row of data as any[]) {
      result[row.year] = {
        avgScore: row.avgScore || 0,
        gapCount: row.gapCount || 0
      };
    }
  } catch (error) {
    console.error('Error getting coverage by year:', error);
  }

  return result;
}

/**
 * Run full coverage scan
 */
export async function runFullCoverageScan(): Promise<{
  map: CoverageMap;
  gaps: CoverageGap[];
  ticketsCreated: number;
}> {
  // Generate coverage map
  const map = await generateCoverageMap();
  
  // Update database
  await updateCoverageCells(map.cells);
  
  // Detect gaps
  const gaps = await detectCoverageGaps();
  
  // Create tickets for critical/high gaps
  const ticketsCreated = await createGapTickets(gaps);
  
  return { map, gaps, ticketsCreated };
}

export default {
  GOVERNORATES,
  SECTORS,
  COVERAGE_YEARS,
  calculateCellCoverage,
  generateCoverageMap,
  detectCoverageGaps,
  updateCoverageCells,
  createGapTickets,
  getCoverageBySector,
  getCoverageByYear,
  runFullCoverageScan
};
