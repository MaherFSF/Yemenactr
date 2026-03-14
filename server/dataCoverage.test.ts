/**
 * Tests for Data Coverage Dashboard endpoints and IMF ingestion
 */
import { describe, it, expect, vi } from 'vitest';

// Test IMF data ingestion script structure
describe('IMF Data Ingestion', () => {
  it('should have valid IMF WEO data structure', async () => {
    // Import the module to check data structure
    const mod = await import('./scripts/ingestIMFData');
    expect(mod.runIMFIngestion).toBeDefined();
    expect(typeof mod.runIMFIngestion).toBe('function');
  });

  it('should have valid World Bank ingestion structure', async () => {
    const mod = await import('./scripts/ingestWorldBankData');
    expect(mod.runWorldBankIngestion).toBeDefined();
    expect(typeof mod.runWorldBankIngestion).toBe('function');
  });
});

// Test sector data service
describe('Sector Data Service', () => {
  it('should export getSectorDataContext function', async () => {
    const mod = await import('./services/sectorDataService');
    expect(mod.getSectorDataContext).toBeDefined();
    expect(typeof mod.getSectorDataContext).toBe('function');
  });

  it('should return data context for banking sector', async () => {
    const { getSectorDataContext } = await import('./services/sectorDataService');
    const result = await getSectorDataContext('banking');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('sectorName');
    expect(result).toHaveProperty('indicators');
    expect(result).toHaveProperty('dataPoints');
    expect(result).toHaveProperty('dateRange');
    expect(Array.isArray(result.indicators)).toBe(true);
  }, 30000);

  it('should return data context for macroeconomy sector', async () => {
    const { getSectorDataContext } = await import('./services/sectorDataService');
    const result = await getSectorDataContext('macroeconomy');
    expect(result).toBeDefined();
    expect(result.indicators.length).toBeGreaterThan(0);
  }, 30000);

  it('should return data context for trade sector', async () => {
    const { getSectorDataContext } = await import('./services/sectorDataService');
    const result = await getSectorDataContext('trade');
    expect(result).toBeDefined();
    expect(result.indicators.length).toBeGreaterThan(0);
  }, 30000);
});

// Test agent personas
describe('Agent Personas', () => {
  it('should have all required personas', async () => {
    const { AGENT_PERSONAS } = await import('./ai/agentPersonas');
    expect(AGENT_PERSONAS).toBeDefined();
    expect(AGENT_PERSONAS['policymaker_brief']).toBeDefined();
    expect(AGENT_PERSONAS['citizen_explainer']).toBeDefined();
  });

  it('should have system prompt additions', async () => {
    const { AGENT_PERSONAS } = await import('./ai/agentPersonas');
    for (const [key, persona] of Object.entries(AGENT_PERSONAS)) {
      expect(persona).toHaveProperty('systemPromptAddition');
      expect(typeof persona.systemPromptAddition).toBe('string');
      expect(persona.systemPromptAddition.length).toBeGreaterThan(0);
    }
  });
});

// Test data coverage queries
describe('Data Coverage Queries', () => {
  it('should be able to query sector coverage from database', async () => {
    const { getDb } = await import('./db');
    const { sql } = await import('drizzle-orm');
    const db = await getDb();
    if (!db) {
      console.warn('No database connection, skipping');
      return;
    }
    
    const [rows] = await db.execute(sql`
      SELECT 
        i.sector,
        COUNT(DISTINCT i.code) as indicatorCount,
        COUNT(DISTINCT ts.id) as dataPoints
      FROM indicators i
      LEFT JOIN time_series ts ON ts.indicatorCode = i.code
      WHERE i.isActive = 1
      GROUP BY i.sector
      ORDER BY i.sector
    `);
    
    const stats = rows as unknown as any[];
    expect(stats.length).toBeGreaterThan(0);
    
    // Verify we have data for key sectors
    const sectors = stats.map((s: any) => s.sector);
    expect(sectors).toContain('banking');
    expect(sectors).toContain('macroeconomy');
  }, 30000);

  it('should have IMF indicators in the database', async () => {
    const { getDb } = await import('./db');
    const { sql } = await import('drizzle-orm');
    const db = await getDb();
    if (!db) return;
    
    const [rows] = await db.execute(sql`
      SELECT COUNT(*) as cnt FROM indicators WHERE code LIKE 'IMF_%'
    `);
    const count = Number((rows as unknown as any[])[0]?.cnt || 0);
    expect(count).toBeGreaterThan(0);
  }, 30000);

  it('should have World Bank indicators in the database', async () => {
    const { getDb } = await import('./db');
    const { sql } = await import('drizzle-orm');
    const db = await getDb();
    if (!db) return;
    
    const [rows] = await db.execute(sql`
      SELECT COUNT(*) as cnt FROM indicators WHERE code LIKE 'WB_%'
    `);
    const count = Number((rows as unknown as any[])[0]?.cnt || 0);
    expect(count).toBeGreaterThan(0);
  }, 30000);

  it('should have time series data spanning 2010-2024', async () => {
    const { getDb } = await import('./db');
    const { sql } = await import('drizzle-orm');
    const db = await getDb();
    if (!db) return;
    
    const [rows] = await db.execute(sql`
      SELECT 
        MIN(YEAR(date)) as minYear,
        MAX(YEAR(date)) as maxYear,
        COUNT(*) as total
      FROM time_series
    `);
    const stats = (rows as unknown as any[])[0];
    expect(Number(stats.minYear)).toBeLessThanOrEqual(2010);
    expect(Number(stats.maxYear)).toBeGreaterThanOrEqual(2023);
    expect(Number(stats.total)).toBeGreaterThan(7000);
  }, 30000);
});
