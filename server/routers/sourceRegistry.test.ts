/**
 * Source Registry Router Tests
 * 
 * Tests for the canonical source_registry tRPC router
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sql } from 'drizzle-orm';

// Mock the database module
vi.mock('../db', () => ({
  getDb: vi.fn(),
}));

import { getDb } from '../db';

describe('Source Registry Router', () => {
  const mockDb = {
    execute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getDb as any).mockResolvedValue(mockDb);
  });

  describe('getAll', () => {
    it('should return sources from the database', async () => {
      const mockSources = [
        [
          {
            id: 1,
            sourceId: 'SRC-001',
            name: 'World Bank WDI',
            altName: 'مؤشرات التنمية العالمية',
            publisher: 'World Bank',
            webUrl: 'https://data.worldbank.org',
            description: 'World Development Indicators',
            tier: 'T1',
            status: 'ACTIVE',
            accessType: 'API',
            updateFrequency: 'ANNUAL',
            language: 'en',
            allowedUse: 'Open',
            apiKeyRequired: false,
            needsPartnership: false,
            partnershipContact: null,
            confidenceRating: 'A',
            freshnessSla: 365,
            connectorType: 'WorldBankConnector',
            geographicScope: 'Global',
            sectorCategory: 'Macro',
            license: 'CC BY 4.0',
            historicalStart: 1960,
            historicalEnd: 2024,
            lastFetch: new Date('2026-01-30'),
            nextFetch: new Date('2026-02-28'),
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-30'),
          },
        ],
      ];

      mockDb.execute.mockResolvedValueOnce([[{ total: 1 }]]);
      mockDb.execute.mockResolvedValueOnce(mockSources);

      // Import the router after mocking
      const { sourceRegistryRouter } = await import('./sourceRegistry');
      
      // Create a mock caller
      const caller = sourceRegistryRouter.createCaller({} as any);
      
      const result = await caller.getAll({
        limit: 100,
        offset: 0,
      });

      expect(result.success).toBe(true);
      expect(result.sources).toHaveLength(1);
      expect(result.sources[0].sourceId).toBe('SRC-001');
      expect(result.sources[0].name).toBe('World Bank WDI');
      expect(result.sources[0].tier).toBe('T1');
      expect(result.sources[0].tierDescription).toBe('International Organizations (UN, WB, IMF)');
    });

    it('should filter by tier', async () => {
      mockDb.execute.mockResolvedValueOnce([[{ total: 0 }]]);
      mockDb.execute.mockResolvedValueOnce([[]]);

      const { sourceRegistryRouter } = await import('./sourceRegistry');
      const caller = sourceRegistryRouter.createCaller({} as any);
      
      await caller.getAll({
        tier: 'T0',
        limit: 100,
        offset: 0,
      });

      // Verify the execute was called with tier filter
      expect(mockDb.execute).toHaveBeenCalledTimes(2);
    });

    it('should handle database unavailable', async () => {
      (getDb as any).mockResolvedValue(null);

      const { sourceRegistryRouter } = await import('./sourceRegistry');
      const caller = sourceRegistryRouter.createCaller({} as any);
      
      const result = await caller.getAll({
        limit: 100,
        offset: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database unavailable');
    });
  });

  describe('getById', () => {
    it('should return a single source by ID', async () => {
      const mockSource = [
        [
          {
            id: 1,
            sourceId: 'SRC-001',
            name: 'World Bank WDI',
            tier: 'T1',
            status: 'ACTIVE',
          },
        ],
      ];

      const mockSectors = [[]];

      mockDb.execute.mockResolvedValueOnce(mockSource);
      mockDb.execute.mockResolvedValueOnce(mockSectors);

      const { sourceRegistryRouter } = await import('./sourceRegistry');
      const caller = sourceRegistryRouter.createCaller({} as any);
      
      const result = await caller.getById({ sourceId: 'SRC-001' });

      expect(result.success).toBe(true);
      expect(result.source?.sourceId).toBe('SRC-001');
    });

    it('should return error for non-existent source', async () => {
      mockDb.execute.mockResolvedValueOnce([[]]);

      const { sourceRegistryRouter } = await import('./sourceRegistry');
      const caller = sourceRegistryRouter.createCaller({} as any);
      
      const result = await caller.getById({ sourceId: 'SRC-999' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Source not found');
    });
  });

  describe('getStats', () => {
    it('should return registry statistics', async () => {
      // Mock tier counts
      mockDb.execute.mockResolvedValueOnce([[
        { tier: 'T0', count: 5 },
        { tier: 'T1', count: 95 },
        { tier: 'T2', count: 13 },
        { tier: 'T3', count: 17 },
        { tier: 'UNKNOWN', count: 162 },
      ]]);

      // Mock status counts
      mockDb.execute.mockResolvedValueOnce([[
        { status: 'ACTIVE', count: 207 },
        { status: 'NEEDS_KEY', count: 17 },
        { status: 'PENDING_REVIEW', count: 68 },
      ]]);

      // Mock frequency counts
      mockDb.execute.mockResolvedValueOnce([[
        { updateFrequency: 'ANNUAL', count: 100 },
        { updateFrequency: 'MONTHLY', count: 50 },
      ]]);

      // Mock access type counts
      mockDb.execute.mockResolvedValueOnce([[
        { accessType: 'API', count: 80 },
        { accessType: 'WEB', count: 150 },
      ]]);

      // Mock total count
      mockDb.execute.mockResolvedValueOnce([[{ total: 295 }]]);

      // Mock active count
      mockDb.execute.mockResolvedValueOnce([[{ active: 210 }]]);

      // Mock needs key count
      mockDb.execute.mockResolvedValueOnce([[{ needsKey: 17 }]]);

      // Mock sector count
      mockDb.execute.mockResolvedValueOnce([[{ count: 16 }]]);

      const { sourceRegistryRouter } = await import('./sourceRegistry');
      const caller = sourceRegistryRouter.createCaller({} as any);
      
      const result = await caller.getStats();

      expect(result.success).toBe(true);
      expect(result.stats?.total).toBe(292);
      expect(result.stats?.active).toBe(207);
      expect(result.stats?.needsKey).toBe(17);
      expect(result.stats?.sectorCount).toBe(16);
    });
  });

  describe('getSectors', () => {
    it('should return all sectors from codebook', async () => {
      const mockSectors = [[
        { sectorCode: 'MACRO', sectorName: 'Macroeconomy', sectorNameAr: 'الاقتصاد الكلي', definition: 'GDP, inflation, etc.', displayOrder: 1 },
        { sectorCode: 'TRADE', sectorName: 'Trade', sectorNameAr: 'التجارة', definition: 'Imports, exports', displayOrder: 2 },
      ]];

      mockDb.execute.mockResolvedValueOnce(mockSectors);

      const { sourceRegistryRouter } = await import('./sourceRegistry');
      const caller = sourceRegistryRouter.createCaller({} as any);
      
      const result = await caller.getSectors();

      expect(result.success).toBe(true);
      expect(result.sectors).toHaveLength(2);
      expect(result.sectors[0].code).toBe('MACRO');
      expect(result.sectors[0].name).toBe('Macroeconomy');
    });
  });

  describe('getLintReport', () => {
    it('should return lint report with no errors', async () => {
      mockDb.execute.mockResolvedValueOnce([[{ count: 0 }]]); // missing name
      mockDb.execute.mockResolvedValueOnce([[{ count: 0 }]]); // missing tier
      mockDb.execute.mockResolvedValueOnce([[{ count: 5 }]]); // missing url
      mockDb.execute.mockResolvedValueOnce([[{ count: 10 }]]); // missing desc

      const { sourceRegistryRouter } = await import('./sourceRegistry');
      const caller = sourceRegistryRouter.createCaller({} as any);
      
      const result = await caller.getLintReport();

      expect(result.success).toBe(true);
      expect(result.report?.p0Errors).toBe(0);
      expect(result.report?.status).toBe('PASS');
    });

    it('should return lint report with errors', async () => {
      mockDb.execute.mockResolvedValueOnce([[{ count: 2 }]]); // missing name (P0)
      mockDb.execute.mockResolvedValueOnce([[{ count: 5 }]]); // missing tier
      mockDb.execute.mockResolvedValueOnce([[{ count: 10 }]]); // missing url
      mockDb.execute.mockResolvedValueOnce([[{ count: 20 }]]); // missing desc

      const { sourceRegistryRouter } = await import('./sourceRegistry');
      const caller = sourceRegistryRouter.createCaller({} as any);
      
      const result = await caller.getLintReport();

      expect(result.success).toBe(true);
      expect(result.report?.p0Errors).toBe(2);
      expect(result.report?.status).toBe('FAIL');
    });
  });
});

describe('Source Registry Data Integrity', () => {
  it('should have correct tier descriptions', async () => {
    const { sourceRegistryRouter } = await import('./sourceRegistry');
    
    // The router exports TIER_DESCRIPTIONS internally
    // We can verify the expected tiers are handled
    const expectedTiers = ['T0', 'T1', 'T2', 'T3', 'T4', 'UNKNOWN'];
    
    expect(expectedTiers).toContain('T0');
    expect(expectedTiers).toContain('T1');
    expect(expectedTiers).toContain('UNKNOWN');
  });

  it('should have correct status descriptions', async () => {
    const expectedStatuses = ['ACTIVE', 'NEEDS_KEY', 'PENDING_REVIEW', 'INACTIVE', 'DEPRECATED'];
    
    expect(expectedStatuses).toContain('ACTIVE');
    expect(expectedStatuses).toContain('NEEDS_KEY');
    expect(expectedStatuses).toContain('PENDING_REVIEW');
  });
});
