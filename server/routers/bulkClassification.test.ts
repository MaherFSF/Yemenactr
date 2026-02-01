import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mysql from 'mysql2/promise';
import { classifySource, bulkClassify, getAllowedUsesForTier, validateAllowedUse } from '../services/tierClassifier';

describe('Tier Classifier Service', () => {
  describe('classifySource', () => {
    it('should classify World Bank as T0', () => {
      const result = classifySource({
        sourceId: 'WB001',
        name: 'World Bank WDI',
        sourceType: 'DATA',
        description: 'World Development Indicators'
      });
      expect(result.suggestedTier).toBe('T0');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should classify IMF as T0', () => {
      const result = classifySource({
        sourceId: 'IMF001',
        name: 'IMF International Financial Statistics',
        sourceType: 'DATA'
      });
      expect(result.suggestedTier).toBe('T0');
    });

    it('should classify OCHA as T1', () => {
      const result = classifySource({
        sourceId: 'OCHA001',
        name: 'OCHA Financial Tracking Service',
        sourceType: 'DATA'
      });
      expect(result.suggestedTier).toBe('T1');
    });

    it('should classify UNHCR as T1', () => {
      const result = classifySource({
        sourceId: 'UNHCR001',
        name: 'UNHCR Refugee Data',
        sourceType: 'DATA'
      });
      expect(result.suggestedTier).toBe('T1');
    });

    it('should classify Crisis Group as T2', () => {
      const result = classifySource({
        sourceId: 'ICG001',
        name: 'International Crisis Group Reports',
        sourceType: 'RESEARCH'
      });
      expect(result.suggestedTier).toBe('T2');
    });

    it('should classify ACLED as T2', () => {
      const result = classifySource({
        sourceId: 'ACLED001',
        name: 'ACLED Armed Conflict Data',
        sourceType: 'DATA'
      });
      expect(result.suggestedTier).toBe('T2');
    });

    it('should classify Reuters as T3', () => {
      const result = classifySource({
        sourceId: 'REUTERS001',
        name: 'Reuters News',
        sourceType: 'MEDIA'
      });
      expect(result.suggestedTier).toBe('T3');
    });

    it('should classify MEDIA sourceType as T3', () => {
      const result = classifySource({
        sourceId: 'NEWS001',
        name: 'Some News Source',
        sourceType: 'MEDIA'
      });
      expect(result.suggestedTier).toBe('T3');
      expect(result.matchedRule).toBe('MEDIA_SOURCE_TYPE');
    });

    it('should classify restricted license as T4', () => {
      const result = classifySource({
        sourceId: 'RESTRICTED001',
        name: 'Premium Data Provider',
        licenseState: 'restricted'
      });
      expect(result.suggestedTier).toBe('T4');
    });

    it('should flag truly unknown sources for human review', () => {
      const result = classifySource({
        sourceId: 'UNKNOWN001',
        name: 'XYZ Corporation Data Feed',
        sourceType: undefined // No source type means no rule matches
      });
      // This source has no matching keywords or organization patterns
      expect(result.matchedRule).toBe('NO_MATCH');
      expect(result.requiresHumanReview).toBe(true);
    });
  });

  describe('bulkClassify', () => {
    it('should classify multiple sources and return summary', () => {
      const sources = [
        { sourceId: 'WB001', name: 'World Bank', sourceType: 'DATA' },
        { sourceId: 'OCHA001', name: 'OCHA FTS', sourceType: 'DATA' },
        { sourceId: 'NEWS001', name: 'Al Jazeera', sourceType: 'MEDIA' }
      ];
      
      const { results, summary } = bulkClassify(sources);
      
      expect(results).toHaveLength(3);
      expect(summary.total).toBe(3);
      expect(summary.classified).toBeGreaterThan(0);
    });
  });

  describe('getAllowedUsesForTier', () => {
    it('should return correct allowed uses for T0', () => {
      const uses = getAllowedUsesForTier('T0');
      expect(uses).toContain('DATA_NUMERIC');
      expect(uses).toContain('DATA_TIMESERIES');
    });

    it('should return correct allowed uses for T3', () => {
      const uses = getAllowedUsesForTier('T3');
      expect(uses).toContain('EVENT_DETECTION');
      expect(uses).not.toContain('DATA_NUMERIC');
    });

    it('should return METADATA_ONLY for T4', () => {
      const uses = getAllowedUsesForTier('T4');
      expect(uses).toContain('METADATA_ONLY');
    });
  });

  describe('validateAllowedUse', () => {
    it('should validate T0 with DATA_NUMERIC', () => {
      const result = validateAllowedUse('T0', ['DATA_NUMERIC', 'CITATION']);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should reject T3 with DATA_NUMERIC', () => {
      const result = validateAllowedUse('T3', ['DATA_NUMERIC']);
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should reject T4 with DATA_TIMESERIES', () => {
      const result = validateAllowedUse('T4', ['DATA_TIMESERIES']);
      expect(result.valid).toBe(false);
    });
  });
});

describe('Bulk Classification Database Integration', () => {
  let conn: mysql.Connection;

  beforeAll(async () => {
    if (process.env.DATABASE_URL) {
      conn = await mysql.createConnection(process.env.DATABASE_URL);
    }
  });

  afterAll(async () => {
    if (conn) {
      await conn.end();
    }
  });

  it('should have classification columns in source_registry', async () => {
    if (!conn) return;
    
    const [cols] = await conn.query('SHOW COLUMNS FROM source_registry');
    const colNames = (cols as any[]).map(c => c.Field);
    
    expect(colNames).toContain('tierClassificationSuggested');
    expect(colNames).toContain('tierClassificationReason');
    expect(colNames).toContain('tierClassificationConfidence');
    expect(colNames).toContain('requiresHumanReview');
    expect(colNames).toContain('classificationMatchedRule');
  });

  it('should have unknown tier below 50%', async () => {
    if (!conn) return;
    
    const [total] = await conn.query('SELECT COUNT(*) as count FROM source_registry');
    const [unknown] = await conn.query("SELECT COUNT(*) as count FROM source_registry WHERE tier = 'UNKNOWN'");
    
    const totalCount = (total as any[])[0].count;
    const unknownCount = (unknown as any[])[0].count;
    const unknownPct = (unknownCount / totalCount) * 100;
    
    expect(unknownPct).toBeLessThan(50);
  });

  it('should have at least 100 classified sources', async () => {
    if (!conn) return;
    
    const [result] = await conn.query(`
      SELECT COUNT(*) as count FROM source_registry 
      WHERE tier IN ('T0', 'T1', 'T2', 'T3', 'T4')
    `);
    
    expect((result as any[])[0].count).toBeGreaterThanOrEqual(100);
  });
});
