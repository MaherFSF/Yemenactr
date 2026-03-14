import { describe, it, expect, vi } from 'vitest';

// Test the sector data service
describe('Sector Data Service', () => {
  it('should export getSectorDataContext function', async () => {
    const mod = await import('./services/sectorDataService');
    expect(typeof mod.getSectorDataContext).toBe('function');
  });

  it('should export getAllSectorsSummary function', async () => {
    const mod = await import('./services/sectorDataService');
    expect(typeof mod.getAllSectorsSummary).toBe('function');
  });

  it('should handle unknown sector gracefully', async () => {
    const { getSectorDataContext } = await import('./services/sectorDataService');
    const result = await getSectorDataContext('nonexistent_sector_xyz');
    // Should return null or empty indicators, not throw
    if (result) {
      expect(result.indicators).toBeDefined();
      expect(Array.isArray(result.indicators)).toBe(true);
    }
  });

  it('should return data for banking sector', { timeout: 30000 }, async () => {
    const { getSectorDataContext } = await import('./services/sectorDataService');
    const result = await getSectorDataContext('banking');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.sectorName).toBe('banking');
      expect(result.indicators.length).toBeGreaterThan(0);
      expect(result.dataPoints).toBeGreaterThan(0);
      expect(result.summary).toBeTruthy();
    }
  });

  it('should return data for macroeconomy sector', { timeout: 30000 }, async () => {
    const { getSectorDataContext } = await import('./services/sectorDataService');
    const result = await getSectorDataContext('macroeconomy');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.sectorName).toBe('macroeconomy');
      expect(result.indicators.length).toBeGreaterThan(0);
    }
  });

  it('should return data for prices sector', { timeout: 30000 }, async () => {
    const { getSectorDataContext } = await import('./services/sectorDataService');
    const result = await getSectorDataContext('prices');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.sectorName).toBe('prices');
      expect(result.indicators.length).toBeGreaterThan(0);
    }
  });

  it('should include historical data in indicators', { timeout: 30000 }, async () => {
    const { getSectorDataContext } = await import('./services/sectorDataService');
    const result = await getSectorDataContext('banking');
    if (result && result.indicators.length > 0) {
      const firstIndicator = result.indicators[0];
      expect(firstIndicator.code).toBeTruthy();
      expect(firstIndicator.name).toBeTruthy();
      expect(firstIndicator.unit).toBeTruthy();
      expect(Array.isArray(firstIndicator.historicalData)).toBe(true);
    }
  });

  it('should calculate trend correctly', { timeout: 30000 }, async () => {
    const { getSectorDataContext } = await import('./services/sectorDataService');
    const result = await getSectorDataContext('banking');
    if (result && result.indicators.length > 0) {
      for (const ind of result.indicators) {
        if (ind.changePercent !== null) {
          expect(['up', 'down', 'stable']).toContain(ind.trend);
        }
      }
    }
  });
});

// Test the World Bank ingestion script exports
describe('World Bank Data Ingestion', () => {
  it('should export runWorldBankIngestion function', async () => {
    const mod = await import('./scripts/ingestWorldBankData');
    expect(typeof mod.runWorldBankIngestion).toBe('function');
  });
});

// Test agent personas
describe('Agent Personas', () => {
  it('should export AGENT_PERSONAS with required personas', async () => {
    const { AGENT_PERSONAS } = await import('./ai/agentPersonas');
    expect(AGENT_PERSONAS).toBeDefined();
    
    const requiredPersonas = [
      'citizen_explainer',
      'policymaker_brief',
      'donor_accountability',
      'bank_compliance',
    ];
    
    for (const persona of requiredPersonas) {
      expect(AGENT_PERSONAS[persona]).toBeDefined();
      expect(AGENT_PERSONAS[persona].nameEn).toBeTruthy();
      expect(AGENT_PERSONAS[persona].systemPromptAddition).toBeTruthy();
    }
  });
});
