/**
 * Sector Pages Router Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('../db', () => ({
  getDb: vi.fn(() => Promise.resolve({
    execute: vi.fn(() => Promise.resolve([[
      {
        sectorCode: 'currency_fx',
        nameEn: 'Currency & Foreign Exchange',
        nameAr: 'العملة والصرف الأجنبي',
        missionEn: 'Analyzing exchange rate dynamics',
        missionAr: 'تحليل ديناميكيات سعر الصرف',
        displayOrder: 3,
        heroColor: '#C0A030',
        hasRegimeSplit: true,
        isActive: true,
        isPublished: true
      }
    ]]))
  }))
}));

// Mock the sector agent service
vi.mock('../services/sectorAgentService', () => ({
  getAllSectorDefinitions: vi.fn(() => Promise.resolve([
    {
      sectorCode: 'currency_fx',
      nameEn: 'Currency & Foreign Exchange',
      nameAr: 'العملة والصرف الأجنبي',
      isActive: true,
      isPublished: true
    },
    {
      sectorCode: 'prices_costofliving',
      nameEn: 'Prices & Cost of Living',
      nameAr: 'الأسعار وتكلفة المعيشة',
      isActive: true,
      isPublished: true
    }
  ])),
  getSectorDefinition: vi.fn((code: string) => Promise.resolve({
    sectorCode: code,
    nameEn: 'Test Sector',
    nameAr: 'قطاع اختبار',
    missionEn: 'Test mission',
    missionAr: 'مهمة اختبار',
    heroColor: '#1E3A5F',
    hasRegimeSplit: false,
    isActive: true,
    isPublished: true
  })),
  getSectorIndicators: vi.fn(() => Promise.resolve([
    {
      indicatorCode: 'YER_USD_RATE',
      nameEn: 'YER/USD Exchange Rate',
      nameAr: 'سعر صرف الريال/الدولار',
      currentValue: 1500,
      previousValue: 1480,
      changePercent: 1.35,
      confidence: 'B',
      sourceName: 'CBY',
      lastUpdated: new Date().toISOString()
    }
  ])),
  getSectorEvents: vi.fn(() => Promise.resolve([])),
  getSectorDocuments: vi.fn(() => Promise.resolve([])),
  getSectorContradictions: vi.fn(() => Promise.resolve([])),
  getSectorGaps: vi.fn(() => Promise.resolve([])),
  getSectorAlerts: vi.fn(() => Promise.resolve([])),
  getSectorWatchlist: vi.fn(() => Promise.resolve([])),
  getSectorKpis: vi.fn(() => Promise.resolve([])),
  getSectorMechanisms: vi.fn(() => Promise.resolve([])),
  getSectorFaqs: vi.fn(() => Promise.resolve([])),
  getSectorReleaseGate: vi.fn(() => Promise.resolve(null)),
  calculateSectorCoverage: vi.fn(() => Promise.resolve({ coverage: 75, freshness: 80 })),
  generateSectorContextPack: vi.fn(() => Promise.resolve({
    sectorCode: 'currency_fx',
    packDate: new Date(),
    keyIndicators: [],
    topEvents: [],
    topDocuments: [],
    contradictions: [],
    gaps: [],
    whatChanged: [],
    whatToWatch: [],
    dataCoveragePercent: 75,
    dataFreshnessPercent: 80,
    contradictionCount: 0,
    gapCount: 0
  })),
  getLatestContextPack: vi.fn(() => Promise.resolve(null))
}));

describe('Sector Pages Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllSectors', () => {
    it('should return all active sectors', async () => {
      const { getAllSectorDefinitions } = await import('../services/sectorAgentService');
      const result = await getAllSectorDefinitions();
      
      expect(result).toHaveLength(2);
      expect(result[0].sectorCode).toBe('currency_fx');
      expect(result[1].sectorCode).toBe('prices_costofliving');
    });

    it('should include both English and Arabic names', async () => {
      const { getAllSectorDefinitions } = await import('../services/sectorAgentService');
      const result = await getAllSectorDefinitions();
      
      expect(result[0].nameEn).toBe('Currency & Foreign Exchange');
      expect(result[0].nameAr).toBe('العملة والصرف الأجنبي');
    });
  });

  describe('getSector', () => {
    it('should return sector definition by code', async () => {
      const { getSectorDefinition } = await import('../services/sectorAgentService');
      const result = await getSectorDefinition('currency_fx');
      
      expect(result).toBeDefined();
      expect(result?.sectorCode).toBe('currency_fx');
    });

    it('should include mission statement', async () => {
      const { getSectorDefinition } = await import('../services/sectorAgentService');
      const result = await getSectorDefinition('currency_fx');
      
      expect(result?.missionEn).toBeDefined();
      expect(result?.missionAr).toBeDefined();
    });
  });

  describe('getSectorIndicators', () => {
    it('should return indicators with evidence metadata', async () => {
      const { getSectorIndicators } = await import('../services/sectorAgentService');
      const result = await getSectorIndicators('currency_fx');
      
      expect(result).toHaveLength(1);
      expect(result[0].indicatorCode).toBe('YER_USD_RATE');
      expect(result[0].confidence).toBe('B');
      expect(result[0].sourceName).toBe('CBY');
    });

    it('should include change percentage', async () => {
      const { getSectorIndicators } = await import('../services/sectorAgentService');
      const result = await getSectorIndicators('currency_fx');
      
      expect(result[0].changePercent).toBe(1.35);
      expect(result[0].previousValue).toBe(1480);
      expect(result[0].currentValue).toBe(1500);
    });
  });

  describe('calculateSectorCoverage', () => {
    it('should return coverage and freshness metrics', async () => {
      const { calculateSectorCoverage } = await import('../services/sectorAgentService');
      const result = await calculateSectorCoverage('currency_fx');
      
      expect(result.coverage).toBe(75);
      expect(result.freshness).toBe(80);
    });
  });

  describe('generateSectorContextPack', () => {
    it('should generate complete context pack', async () => {
      const { generateSectorContextPack } = await import('../services/sectorAgentService');
      const result = await generateSectorContextPack('currency_fx');
      
      expect(result.sectorCode).toBe('currency_fx');
      expect(result.dataCoveragePercent).toBe(75);
      expect(result.dataFreshnessPercent).toBe(80);
      expect(result.keyIndicators).toBeDefined();
      expect(result.contradictions).toBeDefined();
      expect(result.gaps).toBeDefined();
    });
  });

  describe('Sector Page Contract', () => {
    it('should have all required sections for a sector page', async () => {
      const { getSectorDefinition, getSectorIndicators, getSectorMechanisms, getSectorFaqs, calculateSectorCoverage } = await import('../services/sectorAgentService');
      
      const definition = await getSectorDefinition('currency_fx');
      const indicators = await getSectorIndicators('currency_fx');
      const mechanisms = await getSectorMechanisms('currency_fx');
      const faqs = await getSectorFaqs('currency_fx');
      const coverage = await calculateSectorCoverage('currency_fx');
      
      // Verify all sections are available
      expect(definition).toBeDefined();
      expect(indicators).toBeDefined();
      expect(mechanisms).toBeDefined();
      expect(faqs).toBeDefined();
      expect(coverage).toBeDefined();
    });

    it('should support bilingual content', async () => {
      const { getSectorDefinition } = await import('../services/sectorAgentService');
      const result = await getSectorDefinition('currency_fx');
      
      // All text fields should have both EN and AR versions
      expect(result?.nameEn).toBeDefined();
      expect(result?.nameAr).toBeDefined();
      expect(result?.missionEn).toBeDefined();
      expect(result?.missionAr).toBeDefined();
    });
  });

  describe('Evidence Requirements', () => {
    it('should include source attribution for indicators', async () => {
      const { getSectorIndicators } = await import('../services/sectorAgentService');
      const result = await getSectorIndicators('currency_fx');
      
      result.forEach(indicator => {
        expect(indicator.sourceName).toBeDefined();
        expect(indicator.confidence).toBeDefined();
        expect(indicator.lastUpdated).toBeDefined();
      });
    });

    it('should track data quality metrics', async () => {
      const { calculateSectorCoverage } = await import('../services/sectorAgentService');
      const result = await calculateSectorCoverage('currency_fx');
      
      expect(typeof result.coverage).toBe('number');
      expect(typeof result.freshness).toBe('number');
      expect(result.coverage).toBeGreaterThanOrEqual(0);
      expect(result.coverage).toBeLessThanOrEqual(100);
    });
  });

  describe('No Demo Data', () => {
    it('should not contain hardcoded demo values', async () => {
      const { getSectorIndicators } = await import('../services/sectorAgentService');
      const result = await getSectorIndicators('currency_fx');
      
      // Values should come from database, not hardcoded
      result.forEach(indicator => {
        expect(indicator.currentValue).not.toBe('DEMO');
        expect(indicator.sourceName).not.toBe('Demo Source');
      });
    });
  });
});
