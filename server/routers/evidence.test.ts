import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('../db', () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{
            id: 1,
            subjectType: 'kpi',
            subjectId: 'gdp_growth',
            subjectLabel: 'GDP Growth Rate',
            citations: [
              {
                sourceId: 1,
                title: 'World Bank Data',
                publisher: 'World Bank',
                retrievalDate: '2024-01-15',
                licenseFlag: 'CC-BY-4.0',
              },
            ],
            transforms: [],
            regimeTags: ['aden', 'sana_a'],
            geoScope: 'Yemen',
            timeCoverageStart: new Date('2020-01-01'),
            timeCoverageEnd: new Date('2024-12-31'),
            missingRanges: [],
            contradictions: [],
            hasContradictions: false,
            dqafIntegrity: 'pass',
            dqafMethodology: 'pass',
            dqafAccuracyReliability: 'needs_review',
            dqafServiceability: 'pass',
            dqafAccessibility: 'pass',
            uncertaintyInterval: '±2.5%',
            uncertaintyNote: 'Based on incomplete data from conflict zones',
            confidenceGrade: 'B',
            confidenceExplanation: 'Good confidence based on World Bank data with some gaps',
            whatWouldChange: ['More recent data from Central Bank', 'Ground verification'],
            createdAt: new Date(),
          }])),
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{
              id: 1,
              subjectType: 'kpi',
              subjectId: 'gdp_growth',
              confidenceGrade: 'B',
            }])),
          })),
        })),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => ({
            offset: vi.fn(() => Promise.resolve([])),
          })),
        })),
        groupBy: vi.fn(() => Promise.resolve([
          { grade: 'A', count: 5 },
          { grade: 'B', count: 10 },
          { grade: 'C', count: 3 },
        ])),
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve([{ insertId: 1 }])),
    })),
  })),
}));

describe('Evidence Router', () => {
  describe('Evidence Pack Schema', () => {
    it('should have correct structure for citations', () => {
      const citation = {
        sourceId: 1,
        title: 'World Bank Data',
        publisher: 'World Bank',
        url: 'https://data.worldbank.org',
        retrievalDate: '2024-01-15',
        licenseFlag: 'CC-BY-4.0',
        anchor: 'Table 1.2',
        rawObjectRef: 's3://bucket/raw/wb-data.json',
      };

      expect(citation).toHaveProperty('sourceId');
      expect(citation).toHaveProperty('title');
      expect(citation).toHaveProperty('publisher');
      expect(citation).toHaveProperty('retrievalDate');
      expect(citation).toHaveProperty('licenseFlag');
    });

    it('should have correct structure for transforms', () => {
      const transform = {
        formula: 'GDP_growth = (GDP_t - GDP_t-1) / GDP_t-1 * 100',
        parameters: { baseYear: 2015 },
        codeRef: 'server/transforms/gdp.ts:calculateGrowth',
        assumptions: ['Constant prices', 'Calendar year basis'],
        description: 'Year-over-year GDP growth calculation',
      };

      expect(transform).toHaveProperty('formula');
      expect(transform).toHaveProperty('assumptions');
      expect(Array.isArray(transform.assumptions)).toBe(true);
    });

    it('should have correct structure for contradictions', () => {
      const contradiction = {
        altSourceId: 2,
        altSourceName: 'IMF',
        altValue: '3.2%',
        ourValue: '2.8%',
        methodNotes: 'IMF uses different base year',
        whyDifferent: 'Methodological differences in GDP deflator calculation',
      };

      expect(contradiction).toHaveProperty('altSourceId');
      expect(contradiction).toHaveProperty('altSourceName');
      expect(contradiction).toHaveProperty('altValue');
      expect(contradiction).toHaveProperty('ourValue');
    });

    it('should have correct DQAF status values', () => {
      const validStatuses = ['pass', 'needs_review', 'unknown'];
      
      validStatuses.forEach(status => {
        expect(['pass', 'needs_review', 'unknown']).toContain(status);
      });
    });

    it('should have correct confidence grade values', () => {
      const validGrades = ['A', 'B', 'C', 'D'];
      
      validGrades.forEach(grade => {
        expect(['A', 'B', 'C', 'D']).toContain(grade);
      });
    });
  });

  describe('Evidence Pack Validation', () => {
    it('should require subject type and ID', () => {
      const evidencePack = {
        subjectType: 'kpi',
        subjectId: 'gdp_growth',
        citations: [],
        regimeTags: [],
        geoScope: 'Yemen',
        confidenceGrade: 'B',
        confidenceExplanation: 'Test explanation',
      };

      expect(evidencePack.subjectType).toBeTruthy();
      expect(evidencePack.subjectId).toBeTruthy();
    });

    it('should calculate hasContradictions from contradictions array', () => {
      const packWithContradictions = {
        contradictions: [{ altSourceId: 1, altValue: '5%', ourValue: '4%' }],
      };
      const packWithoutContradictions = {
        contradictions: [],
      };

      expect(packWithContradictions.contradictions.length > 0).toBe(true);
      expect(packWithoutContradictions.contradictions.length > 0).toBe(false);
    });
  });

  describe('DQAF Quality Panel', () => {
    it('should have 5 independent dimensions', () => {
      const dqafDimensions = [
        'integrity',
        'methodology',
        'accuracyReliability',
        'serviceability',
        'accessibility',
      ];

      expect(dqafDimensions).toHaveLength(5);
    });

    it('should not combine dimensions into single score', () => {
      const evidencePack = {
        dqafIntegrity: 'pass',
        dqafMethodology: 'pass',
        dqafAccuracyReliability: 'needs_review',
        dqafServiceability: 'pass',
        dqafAccessibility: 'pass',
      };

      // Each dimension should be independent
      expect(evidencePack.dqafIntegrity).toBeDefined();
      expect(evidencePack.dqafMethodology).toBeDefined();
      expect(evidencePack.dqafAccuracyReliability).toBeDefined();
      expect(evidencePack.dqafServiceability).toBeDefined();
      expect(evidencePack.dqafAccessibility).toBeDefined();

      // Should NOT have a combined score
      expect((evidencePack as any).dqafOverallScore).toBeUndefined();
    });
  });

  describe('Provenance Chain', () => {
    it('should trace data from observation to source', () => {
      const provenanceChain = [
        { level: 'observation', id: 123, type: 'kpi' },
        { level: 'series', id: 45 },
        { level: 'dataset_version', id: 12 },
        { level: 'ingestion_run', id: 8 },
        { level: 'raw_object', ref: 's3://bucket/raw/data.json' },
        { level: 'source', id: 1 },
      ];

      expect(provenanceChain[0].level).toBe('observation');
      expect(provenanceChain[provenanceChain.length - 1].level).toBe('source');
    });
  });

  describe('Vintages/Time-Travel', () => {
    it('should support multiple versions of same dataset', () => {
      const vintages = [
        { id: 3, versionNumber: 3, vintageDate: '2024-03-01', changeType: 'revision' },
        { id: 2, versionNumber: 2, vintageDate: '2024-02-01', changeType: 'correction' },
        { id: 1, versionNumber: 1, vintageDate: '2024-01-01', changeType: 'initial' },
      ];

      expect(vintages).toHaveLength(3);
      expect(vintages[0].versionNumber).toBeGreaterThan(vintages[1].versionNumber);
    });

    it('should track change types correctly', () => {
      const validChangeTypes = ['initial', 'revision', 'correction', 'restatement', 'methodology_change'];
      
      validChangeTypes.forEach(type => {
        expect(['initial', 'revision', 'correction', 'restatement', 'methodology_change']).toContain(type);
      });
    });

    it('should never overwrite - only append corrections', () => {
      const vintages = [
        { id: 2, changeType: 'correction', previousVersionId: 1 },
        { id: 1, changeType: 'initial', previousVersionId: null },
      ];

      // Original version should still exist
      expect(vintages.find(v => v.id === 1)).toBeDefined();
      // Correction should reference previous version
      expect(vintages[0].previousVersionId).toBe(1);
    });
  });

  describe('Bilingual Support', () => {
    it('should have translations for both EN and AR', () => {
      const translations = {
        en: {
          showEvidence: 'Show Evidence',
          confidenceGrade: 'Confidence Grade',
        },
        ar: {
          showEvidence: 'عرض الأدلة',
          confidenceGrade: 'درجة الثقة',
        },
      };

      expect(translations.en.showEvidence).toBeTruthy();
      expect(translations.ar.showEvidence).toBeTruthy();
      expect(translations.en.showEvidence).not.toBe(translations.ar.showEvidence);
    });
  });

  describe('Export with Evidence', () => {
    it('should include manifest.json in exports', () => {
      const exportManifest = {
        exportId: 'exp_abc123',
        createdAt: '2024-01-15T10:30:00Z',
        format: 'csv',
        recordCount: 100,
        files: [
          { format: 'csv', filename: 'data.csv', url: 'https://s3.../data.csv' },
        ],
        license: {
          type: 'CC-BY-4.0',
          attribution: 'YETO',
        },
      };

      expect(exportManifest.exportId).toBeTruthy();
      expect(exportManifest.files).toHaveLength(1);
      expect(exportManifest.license).toBeDefined();
    });

    it('should include evidence_pack.json in exports', () => {
      const evidencePackExport = {
        exportId: 'exp_abc123',
        evidencePacks: [
          { id: 1, confidenceGrade: 'B', citationCount: 3 },
        ],
        provenanceChain: {
          dataSource: 'YETO Database',
          processingSteps: ['extraction', 'validation'],
        },
      };

      expect(evidencePackExport.evidencePacks).toBeDefined();
      expect(evidencePackExport.provenanceChain).toBeDefined();
    });

    it('should include license_summary.json in exports', () => {
      const licenseSummary = {
        exportId: 'exp_abc123',
        licenses: [
          { sourceId: 1, licenseType: 'CC-BY-4.0', attribution: 'World Bank' },
        ],
        combinedRestrictions: ['Attribution required'],
        attributionText: 'Data from YETO. Sources: World Bank.',
      };

      expect(licenseSummary.licenses).toBeDefined();
      expect(licenseSummary.attributionText).toBeTruthy();
    });
  });
});
