/**
 * Feed Matrix Router Tests
 * Tests for sector feed matrix, page feed matrix, and matrix stats endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('../db', () => ({
  getDb: vi.fn().mockResolvedValue({
    execute: vi.fn().mockImplementation((query) => {
      // Return mock data based on query
      return Promise.resolve([[
        { 
          sourceId: 'SRC-001', 
          name: 'World Bank', 
          tier: 'T1', 
          status: 'ACTIVE',
          confidenceRating: 'A',
          updateFrequency: 'quarterly',
          allowedUse: 'Open',
          isPrimary: true
        },
        { 
          sourceId: 'SRC-002', 
          name: 'IMF', 
          tier: 'T1', 
          status: 'ACTIVE',
          confidenceRating: 'A',
          updateFrequency: 'annual',
          allowedUse: 'Open',
          isPrimary: false
        }
      ]]);
    })
  })
}));

// Mock the routing engine
vi.mock('../services/routingEngine', () => ({
  getSourcesForPage: vi.fn().mockResolvedValue([
    { sourceId: 'SRC-001', name: 'World Bank', tier: 'T1', status: 'ACTIVE' },
    { sourceId: 'SRC-002', name: 'IMF', tier: 'T1', status: 'ACTIVE' }
  ]),
  getSourceCoverage: vi.fn().mockResolvedValue({
    totalSources: 295,
    activeSources: 210,
    coveragePercent: 71
  }),
  TARGET_PAGES: ['dashboard', 'data-repository', 'research-library']
}));

describe('Feed Matrix Router', () => {
  describe('getSectorFeedMatrix', () => {
    it('should return sector feed matrix with sources', async () => {
      // Import after mocks are set up
      const { feedMatrixRouter } = await import('./feedMatrix');
      
      // Create a mock caller
      const caller = feedMatrixRouter.createCaller({} as any);
      
      const result = await caller.getSectorFeedMatrix({ limit: 10 });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.sectors).toBeDefined();
      expect(Array.isArray(result.sectors)).toBe(true);
    });

    it('should filter by sector code when provided', async () => {
      const { feedMatrixRouter } = await import('./feedMatrix');
      const caller = feedMatrixRouter.createCaller({} as any);
      
      const result = await caller.getSectorFeedMatrix({ 
        sectorCode: 'S01',
        limit: 10 
      });
      
      expect(result.success).toBe(true);
      // Should only return one sector when filtered
      expect(result.sectors.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getPageFeedMatrix', () => {
    it('should return page feed matrix with sources', async () => {
      const { feedMatrixRouter } = await import('./feedMatrix');
      const caller = feedMatrixRouter.createCaller({} as any);
      
      const result = await caller.getPageFeedMatrix({ limit: 10 });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.pages).toBeDefined();
      expect(Array.isArray(result.pages)).toBe(true);
    });

    it('should filter by page key when provided', async () => {
      const { feedMatrixRouter } = await import('./feedMatrix');
      const caller = feedMatrixRouter.createCaller({} as any);
      
      const result = await caller.getPageFeedMatrix({ 
        pageKey: 'dashboard',
        limit: 10 
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('getSourcesForPage', () => {
    it('should return sources for a specific page', async () => {
      const { feedMatrixRouter } = await import('./feedMatrix');
      const caller = feedMatrixRouter.createCaller({} as any);
      
      const result = await caller.getSourcesForPage({ 
        pageKey: 'dashboard',
        limit: 20 
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.sources).toBeDefined();
      expect(Array.isArray(result.sources)).toBe(true);
    });

    it('should return sources for a sector when sectorCode provided', async () => {
      const { feedMatrixRouter } = await import('./feedMatrix');
      const caller = feedMatrixRouter.createCaller({} as any);
      
      const result = await caller.getSourcesForPage({ 
        pageKey: 'dashboard',
        sectorCode: 'S01',
        limit: 20 
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('getMatrixStats', () => {
    it('should return matrix statistics', async () => {
      const { feedMatrixRouter } = await import('./feedMatrix');
      const caller = feedMatrixRouter.createCaller({} as any);
      
      const result = await caller.getMatrixStats();
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
    });
  });
});

describe('Feed Matrix Data Integrity', () => {
  it('should have valid tier values', async () => {
    const validTiers = ['T0', 'T1', 'T2', 'T3', 'T4', 'UNKNOWN'];
    const { feedMatrixRouter } = await import('./feedMatrix');
    const caller = feedMatrixRouter.createCaller({} as any);
    
    const result = await caller.getSectorFeedMatrix({ limit: 50 });
    
    if (result.success && result.sectors.length > 0) {
      for (const sector of result.sectors) {
        for (const source of sector.sources) {
          expect(validTiers).toContain(source.tier);
        }
      }
    }
  });

  it('should have valid status values', async () => {
    const validStatuses = ['ACTIVE', 'NEEDS_KEY', 'PENDING_REVIEW', 'INACTIVE', 'DEPRECATED'];
    const { feedMatrixRouter } = await import('./feedMatrix');
    const caller = feedMatrixRouter.createCaller({} as any);
    
    const result = await caller.getSectorFeedMatrix({ limit: 50 });
    
    if (result.success && result.sectors.length > 0) {
      for (const sector of result.sectors) {
        for (const source of sector.sources) {
          expect(validStatuses).toContain(source.status);
        }
      }
    }
  });
});
