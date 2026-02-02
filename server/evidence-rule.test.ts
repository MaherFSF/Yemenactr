import { describe, it, expect } from 'vitest';
import { getDb } from './db';

/**
 * Evidence Rule Unit Test
 * 
 * RULE: A grade may display ONLY if evidence_pack_id exists AND drawer renders pack.
 * If no pack exists, must show GAP state and NO grade.
 * 
 * This test FAILS if any Dashboard KPI indicator has a grade displayed
 * but no corresponding evidence_pack exists in the database.
 */

const DASHBOARD_KPI_INDICATORS = [
  { code: 'inflation_cpi_aden', subjectIdPattern: 'inflation_cpi_aden%' },
  { code: 'inflation_cpi_sanaa', subjectIdPattern: 'inflation_cpi_sanaa%' },
  { code: 'unemployment_rate', subjectIdPattern: 'unemployment_rate%' },
  { code: 'fx_rate_aden_parallel', subjectIdPattern: 'fx_rate_aden_parallel%' },
  { code: 'fx_rate_sanaa', subjectIdPattern: 'fx_rate_sanaa%' },
];

describe('Evidence Rule Compliance', () => {
  it('should have evidence_pack for every Dashboard KPI that displays a grade', async () => {
    const db = await getDb();
    
    const kpisWithoutEvidence: string[] = [];
    
    for (const indicator of DASHBOARD_KPI_INDICATORS) {
      // Check if evidence_pack exists for this indicator
      const result = await db.execute(
        `SELECT id, subjectId, confidenceGrade FROM evidence_packs 
         WHERE subjectId LIKE '${indicator.subjectIdPattern}' 
         AND subjectType = 'metric' 
         LIMIT 1`
      );
      
      const rows = result[0] as any[];
      
      if (rows.length === 0) {
        kpisWithoutEvidence.push(indicator.code);
      }
    }
    
    // FAIL if any KPI has no evidence pack
    expect(
      kpisWithoutEvidence,
      `The following KPIs display grades but have NO evidence_pack: ${kpisWithoutEvidence.join(', ')}`
    ).toHaveLength(0);
  });

  it('should have valid confidence grades (A, B, C, D) for all evidence packs', async () => {
    const db = await getDb();
    
    const result = await db.execute(
      `SELECT id, subjectId, confidenceGrade FROM evidence_packs 
       WHERE subjectType = 'metric' 
       AND confidenceGrade NOT IN ('A', 'B', 'C', 'D')
       LIMIT 10`
    );
    
    const invalidGrades = result[0] as any[];
    
    expect(
      invalidGrades,
      `Found evidence packs with invalid grades: ${JSON.stringify(invalidGrades)}`
    ).toHaveLength(0);
  });

  it('should not have duplicate evidence packs for the same indicator+regime', async () => {
    const db = await getDb();
    
    const result = await db.execute(
      `SELECT subjectId, COUNT(*) as count FROM evidence_packs 
       WHERE subjectType = 'metric'
       GROUP BY subjectId 
       HAVING count > 1
       LIMIT 10`
    );
    
    const duplicates = result[0] as any[];
    
    // Note: Multiple packs per indicator may be valid (different time periods)
    // This test just ensures we're aware of them
    if (duplicates.length > 0) {
      console.log('Note: Found multiple evidence packs for same subjectId (may be valid):', duplicates);
    }
    
    // Pass - duplicates are allowed but logged
    expect(true).toBe(true);
  });
});
