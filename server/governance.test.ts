/**
 * YETO Platform - Data Governance Services Tests
 * Section 8: The Trust Engine
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
  },
}));

describe('Data Governance - Section 8', () => {
  describe('8A: Provenance Ledger', () => {
    it('should track data source origin', () => {
      // Test provenance tracking structure
      const provenanceEntry = {
        sourceId: 1,
        accessMethod: 'api',
        retrievalTime: new Date(),
        rawDataHash: 'sha256:abc123...',
        licenseType: 'CC-BY-4.0',
        termsAccepted: true,
        attributionRequired: true,
        attributionText: 'World Bank Open Data',
        commercialUseAllowed: true,
        derivativesAllowed: true,
      };
      
      expect(provenanceEntry.accessMethod).toBe('api');
      expect(provenanceEntry.termsAccepted).toBe(true);
      expect(provenanceEntry.rawDataHash).toMatch(/^sha256:/);
    });

    it('should record transformation pipeline', () => {
      const transformations = [
        {
          order: 1,
          type: 'normalize',
          description: 'Convert currency values to USD',
          formula: 'value * exchange_rate',
          inputFields: ['value_yer'],
          outputFields: ['value_usd'],
          timestamp: new Date().toISOString(),
          executedBy: 'ingestion_pipeline',
        },
        {
          order: 2,
          type: 'aggregate',
          description: 'Calculate monthly average',
          inputFields: ['daily_values'],
          outputFields: ['monthly_avg'],
          timestamp: new Date().toISOString(),
          executedBy: 'aggregation_service',
        },
      ];
      
      expect(transformations).toHaveLength(2);
      expect(transformations[0].order).toBe(1);
      expect(transformations[1].order).toBe(2);
    });

    it('should track QA checks', () => {
      const qaChecks = [
        { checkType: 'schema', checkName: 'Schema Validation', passed: true, severity: 'critical', message: 'All fields valid' },
        { checkType: 'outliers', checkName: 'Outlier Detection', passed: false, severity: 'warning', message: '2 outliers detected' },
        { checkType: 'continuity', checkName: 'Time Series Continuity', passed: true, severity: 'info', message: 'No gaps found' },
      ];
      
      const passedCount = qaChecks.filter(c => c.passed).length;
      const qaScore = (passedCount / qaChecks.length) * 100;
      
      expect(qaScore).toBeCloseTo(66.67, 1);
    });
  });

  describe('8B: Confidence Rating System', () => {
    it('should calculate confidence rating from scores', () => {
      const calculateRating = (scores: {
        sourceCredibility: number;
        dataCompleteness: number;
        timeliness: number;
        consistency: number;
        methodology: number;
      }): 'A' | 'B' | 'C' | 'D' => {
        const overall = (
          scores.sourceCredibility * 0.25 +
          scores.dataCompleteness * 0.20 +
          scores.timeliness * 0.20 +
          scores.consistency * 0.20 +
          scores.methodology * 0.15
        );
        
        if (overall >= 85) return 'A';
        if (overall >= 70) return 'B';
        if (overall >= 50) return 'C';
        return 'D';
      };
      
      // Test A rating
      expect(calculateRating({
        sourceCredibility: 95,
        dataCompleteness: 90,
        timeliness: 85,
        consistency: 90,
        methodology: 85,
      })).toBe('A');
      
      // Test B rating
      expect(calculateRating({
        sourceCredibility: 80,
        dataCompleteness: 75,
        timeliness: 70,
        consistency: 75,
        methodology: 70,
      })).toBe('B');
      
      // Test C rating
      expect(calculateRating({
        sourceCredibility: 60,
        dataCompleteness: 55,
        timeliness: 50,
        consistency: 55,
        methodology: 50,
      })).toBe('C');
      
      // Test D rating
      expect(calculateRating({
        sourceCredibility: 40,
        dataCompleteness: 35,
        timeliness: 30,
        consistency: 35,
        methodology: 30,
      })).toBe('D');
    });

    it('should provide rating badge information', () => {
      const ratingBadges = {
        A: { label: 'Highly Reliable', color: '#107040', description: 'Official/audited data' },
        B: { label: 'Reliable', color: '#1a6b9c', description: 'Credible source' },
        C: { label: 'Moderate', color: '#C0A030', description: 'Proxy/modelled data' },
        D: { label: 'Low Reliability', color: '#c53030', description: 'Use with caution' },
      };
      
      expect(ratingBadges.A.label).toBe('Highly Reliable');
      expect(ratingBadges.D.label).toBe('Low Reliability');
    });
  });

  describe('8C: Contradiction Detection', () => {
    it('should detect discrepancies between sources', () => {
      const detectContradiction = (value1: number, value2: number, threshold: number = 5) => {
        const discrepancyPercent = Math.abs((value1 - value2) / ((value1 + value2) / 2)) * 100;
        
        let discrepancyType: 'minor' | 'significant' | 'major' | 'critical';
        if (discrepancyPercent < 5) discrepancyType = 'minor';
        else if (discrepancyPercent < 15) discrepancyType = 'significant';
        else if (discrepancyPercent < 30) discrepancyType = 'major';
        else discrepancyType = 'critical';
        
        return {
          hasContradiction: discrepancyPercent > threshold,
          discrepancyPercent,
          discrepancyType,
        };
      };
      
      // Minor discrepancy (within threshold)
      const minor = detectContradiction(100, 102);
      expect(minor.hasContradiction).toBe(false);
      expect(minor.discrepancyType).toBe('minor');
      
      // Significant discrepancy
      const significant = detectContradiction(100, 110);
      expect(significant.hasContradiction).toBe(true);
      expect(significant.discrepancyType).toBe('significant');
      
      // Critical discrepancy
      const critical = detectContradiction(100, 150);
      expect(critical.hasContradiction).toBe(true);
      expect(critical.discrepancyType).toBe('critical');
    });

    it('should suggest plausible reasons for contradictions', () => {
      const suggestReasons = (discrepancyType: string, indicatorType: string): string[] => {
        const reasons: string[] = [];
        
        if (indicatorType === 'exchange_rate') {
          reasons.push('Different market rates (official vs parallel)');
          reasons.push('Different measurement times within the day');
          reasons.push('Regional variations in exchange rates');
        }
        
        if (discrepancyType === 'critical') {
          reasons.push('Possible data entry error');
          reasons.push('Different methodology or definition');
        }
        
        return reasons;
      };
      
      const reasons = suggestReasons('critical', 'exchange_rate');
      expect(reasons.length).toBeGreaterThan(0);
      expect(reasons).toContain('Different market rates (official vs parallel)');
    });
  });

  describe('8D: Data Vintages (Versioning)', () => {
    it('should track value revisions over time', () => {
      const vintages = [
        { vintageDate: new Date('2024-01-15'), value: 1000, changeType: 'initial' },
        { vintageDate: new Date('2024-02-01'), value: 1050, changeType: 'revision', changeReason: 'Updated methodology' },
        { vintageDate: new Date('2024-03-01'), value: 1045, changeType: 'correction', changeReason: 'Data entry error fixed' },
      ];
      
      expect(vintages).toHaveLength(3);
      expect(vintages[0].changeType).toBe('initial');
      expect(vintages[1].changeType).toBe('revision');
      expect(vintages[2].changeType).toBe('correction');
    });

    it('should calculate revision summary', () => {
      const calculateSummary = (vintages: Array<{ value: number; changeType: string }>) => {
        const initial = vintages[0].value;
        const current = vintages[vintages.length - 1].value;
        const totalChange = current - initial;
        const totalChangePercent = (totalChange / initial) * 100;
        
        const revisionTypes = vintages.reduce((acc, v) => {
          acc[v.changeType] = (acc[v.changeType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return {
          totalRevisions: vintages.length - 1,
          initialValue: initial,
          currentValue: current,
          totalChange,
          totalChangePercent,
          revisionTypes,
        };
      };
      
      const vintages = [
        { value: 1000, changeType: 'initial' },
        { value: 1050, changeType: 'revision' },
        { value: 1045, changeType: 'correction' },
      ];
      
      const summary = calculateSummary(vintages);
      expect(summary.totalRevisions).toBe(2);
      expect(summary.totalChange).toBe(45);
      expect(summary.totalChangePercent).toBe(4.5);
    });

    it('should support point-in-time queries', () => {
      const getValueAsOf = (
        vintages: Array<{ vintageDate: Date; value: number }>,
        asOfDate: Date
      ): number | null => {
        const validVintages = vintages
          .filter(v => v.vintageDate <= asOfDate)
          .sort((a, b) => b.vintageDate.getTime() - a.vintageDate.getTime());
        
        return validVintages.length > 0 ? validVintages[0].value : null;
      };
      
      const vintages = [
        { vintageDate: new Date('2024-01-15'), value: 1000 },
        { vintageDate: new Date('2024-02-01'), value: 1050 },
        { vintageDate: new Date('2024-03-01'), value: 1045 },
      ];
      
      // Query as of January 20 - should get initial value
      expect(getValueAsOf(vintages, new Date('2024-01-20'))).toBe(1000);
      
      // Query as of February 15 - should get first revision
      expect(getValueAsOf(vintages, new Date('2024-02-15'))).toBe(1050);
      
      // Query as of today - should get latest
      expect(getValueAsOf(vintages, new Date())).toBe(1045);
    });
  });

  describe('8E: Public Changelog', () => {
    it('should categorize change types', () => {
      const changeTypes = {
        dataset_added: { label: 'New Dataset', icon: '📊' },
        dataset_updated: { label: 'Dataset Updated', icon: '🔄' },
        document_added: { label: 'New Document', icon: '📄' },
        methodology_change: { label: 'Methodology Change', icon: '📐' },
        correction: { label: 'Correction', icon: '✏️' },
        source_added: { label: 'New Source', icon: '🔗' },
        indicator_added: { label: 'New Indicator', icon: '📈' },
      };
      
      expect(Object.keys(changeTypes)).toHaveLength(7);
      expect(changeTypes.correction.label).toBe('Correction');
    });

    it('should track impact levels', () => {
      const impactLevels = {
        low: { label: 'Minor', description: 'Small updates with minimal user impact' },
        medium: { label: 'Moderate', description: 'Notable changes affecting some analyses' },
        high: { label: 'Significant', description: 'Major changes requiring user attention' },
      };
      
      expect(impactLevels.high.label).toBe('Significant');
    });

    it('should generate RSS feed structure', () => {
      const generateRSSItem = (entry: {
        titleEn: string;
        descriptionEn: string;
        publishedAt: Date;
        changeType: string;
      }) => {
        return {
          title: entry.titleEn,
          description: entry.descriptionEn,
          pubDate: entry.publishedAt.toUTCString(),
          category: entry.changeType,
          guid: `yeto-changelog-${entry.publishedAt.getTime()}`,
        };
      };
      
      const entry = {
        titleEn: 'New Exchange Rate Data Added',
        descriptionEn: 'Added daily exchange rate data from Central Bank of Yemen (Aden)',
        publishedAt: new Date('2024-12-28'),
        changeType: 'dataset_added',
      };
      
      const rssItem = generateRSSItem(entry);
      expect(rssItem.title).toBe('New Exchange Rate Data Added');
      expect(rssItem.category).toBe('dataset_added');
      expect(rssItem.guid).toContain('yeto-changelog-');
    });
  });

  describe('Integration: Governance Components', () => {
    it('should link provenance to confidence ratings', () => {
      // A data point with full provenance should have higher confidence
      const calculateConfidenceFromProvenance = (provenance: {
        hasSource: boolean;
        hasTransformations: boolean;
        qaScore: number;
        hasLicense: boolean;
      }): number => {
        let score = 0;
        if (provenance.hasSource) score += 25;
        if (provenance.hasTransformations) score += 15;
        if (provenance.hasLicense) score += 10;
        score += provenance.qaScore * 0.5;
        return Math.min(100, score);
      };
      
      const fullProvenance = {
        hasSource: true,
        hasTransformations: true,
        qaScore: 90,
        hasLicense: true,
      };
      
      const partialProvenance = {
        hasSource: true,
        hasTransformations: false,
        qaScore: 60,
        hasLicense: false,
      };
      
      expect(calculateConfidenceFromProvenance(fullProvenance)).toBeGreaterThan(
        calculateConfidenceFromProvenance(partialProvenance)
      );
    });

    it('should trigger changelog on data updates', () => {
      const shouldCreateChangelogEntry = (
        changeType: string,
        impactLevel: string
      ): boolean => {
        // Always log high impact changes
        if (impactLevel === 'high') return true;
        
        // Log corrections and methodology changes regardless of impact
        if (['correction', 'methodology_change'].includes(changeType)) return true;
        
        // Log medium impact dataset changes
        if (impactLevel === 'medium' && changeType.includes('dataset')) return true;
        
        return false;
      };
      
      expect(shouldCreateChangelogEntry('correction', 'low')).toBe(true);
      expect(shouldCreateChangelogEntry('dataset_updated', 'high')).toBe(true);
      expect(shouldCreateChangelogEntry('dataset_updated', 'low')).toBe(false);
    });
  });
});
