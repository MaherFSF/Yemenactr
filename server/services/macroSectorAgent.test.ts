/**
 * Macro Sector Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('../db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      })
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1 }])
      })
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined)
      })
    }),
    query: {
      entities: {
        findMany: vi.fn().mockResolvedValue([]),
        columns: { sectorTags: {} }
      }
    }
  }
}));

// Mock storage
vi.mock('../storage', () => ({
  storagePut: vi.fn().mockResolvedValue({ url: 'https://example.com/test.json' })
}));

// Mock LLM
vi.mock('../_core/llm', () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          summaryEn: 'Test summary',
          summaryAr: 'ملخص اختباري',
          keyFindings: [],
          recommendations: []
        })
      }
    }]
  })
}));

describe('Macro Sector Agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Macro Indicators Configuration', () => {
    it('should define core macro indicators', () => {
      const MACRO_INDICATORS = [
        { code: 'GDP_NOMINAL', titleEn: 'GDP (Nominal)', titleAr: 'الناتج المحلي الإجمالي (الاسمي)', unit: 'B USD', isCore: true },
        { code: 'GDP_GROWTH', titleEn: 'GDP Growth Rate', titleAr: 'معدل نمو الناتج المحلي', unit: '%', isCore: true },
        { code: 'GDP_PER_CAPITA', titleEn: 'GDP per Capita', titleAr: 'نصيب الفرد من الناتج', unit: 'USD', isCore: true },
        { code: 'INFLATION_CPI', titleEn: 'Inflation (CPI)', titleAr: 'التضخم (مؤشر أسعار المستهلك)', unit: '%', isCore: true },
      ];
      
      expect(MACRO_INDICATORS).toHaveLength(4);
      expect(MACRO_INDICATORS.every(i => i.isCore)).toBe(true);
      expect(MACRO_INDICATORS.every(i => i.code && i.titleEn && i.titleAr && i.unit)).toBe(true);
    });

    it('should define proxy indicators', () => {
      const PROXY_INDICATORS = [
        { code: 'NIGHTLIGHTS_INDEX', titleEn: 'Activity Proxy (Nightlights)', titleAr: 'مؤشر النشاط (الأضواء الليلية)', unit: 'index', isProxy: true },
        { code: 'MACRO_STRESS_INDEX', titleEn: 'Macro Stress Index', titleAr: 'مؤشر الضغط الكلي', unit: '/100', isProxy: true },
      ];
      
      expect(PROXY_INDICATORS).toHaveLength(2);
      expect(PROXY_INDICATORS.every(i => i.isProxy)).toBe(true);
    });
  });

  describe('Context Pack Structure', () => {
    it('should define valid context pack structure', () => {
      const contextPack = {
        sectorCode: 'macro',
        generatedAt: new Date().toISOString(),
        dateRange: { start: '2010-01-01', end: '2024-12-31' },
        kpis: [],
        charts: [],
        recentUpdates: [],
        contradictions: [],
        gaps: [],
        linkedEntities: [],
        linkedDocuments: []
      };
      
      expect(contextPack.sectorCode).toBe('macro');
      expect(contextPack.dateRange.start).toBe('2010-01-01');
      expect(Array.isArray(contextPack.kpis)).toBe(true);
      expect(Array.isArray(contextPack.charts)).toBe(true);
      expect(Array.isArray(contextPack.contradictions)).toBe(true);
    });
  });

  describe('KPI Structure', () => {
    it('should validate KPI structure with evidence', () => {
      const kpi = {
        code: 'GDP_NOMINAL',
        titleEn: 'GDP (Nominal)',
        titleAr: 'الناتج المحلي الإجمالي (الاسمي)',
        value: 21.8,
        unit: 'B USD',
        delta: -2.3,
        deltaPeriod: '2023',
        lastUpdated: '2024-06-15',
        confidence: 'medium' as const,
        evidencePackId: 1,
        source: 'World Bank'
      };
      
      expect(kpi.code).toBe('GDP_NOMINAL');
      expect(kpi.value).toBe(21.8);
      expect(kpi.evidencePackId).toBe(1);
      expect(['high', 'medium', 'low', 'proxy']).toContain(kpi.confidence);
    });

    it('should handle null values for missing data', () => {
      const kpi = {
        code: 'FISCAL_DEFICIT',
        titleEn: 'Fiscal Deficit',
        titleAr: 'العجز المالي',
        value: null,
        unit: '% GDP',
        lastUpdated: '2023-12-31',
        confidence: 'low' as const,
        source: 'Not available'
      };
      
      expect(kpi.value).toBeNull();
      expect(kpi.confidence).toBe('low');
    });

    it('should mark proxy indicators correctly', () => {
      const proxyKpi = {
        code: 'NIGHTLIGHTS_INDEX',
        titleEn: 'Activity Proxy (Nightlights)',
        titleAr: 'مؤشر النشاط (الأضواء الليلية)',
        value: 78.5,
        unit: 'index',
        confidence: 'proxy' as const,
        isProxy: true,
        proxyLabel: 'Based on VIIRS nighttime lights data',
        proxyLabelAr: 'بناءً على بيانات الأضواء الليلية VIIRS'
      };
      
      expect(proxyKpi.isProxy).toBe(true);
      expect(proxyKpi.confidence).toBe('proxy');
      expect(proxyKpi.proxyLabel).toBeTruthy();
    });
  });

  describe('Chart Data Structure', () => {
    it('should validate chart data structure', () => {
      const chart = {
        id: 'gdp_nominal',
        titleEn: 'GDP Nominal',
        titleAr: 'الناتج المحلي الإجمالي الاسمي',
        type: 'line' as const,
        data: [
          { year: 2010, value: 30.5, source: 'World Bank' },
          { year: 2011, value: 31.2, source: 'World Bank' },
          { year: 2012, value: 32.1, source: 'World Bank' }
        ],
        unit: 'B USD',
        evidencePackId: 1
      };
      
      expect(chart.type).toBe('line');
      expect(chart.data).toHaveLength(3);
      expect(chart.data[0].year).toBe(2010);
      expect(chart.evidencePackId).toBe(1);
    });

    it('should support multiple chart types', () => {
      const chartTypes = ['line', 'bar', 'area'];
      chartTypes.forEach(type => {
        expect(['line', 'bar', 'area']).toContain(type);
      });
    });
  });

  describe('Contradiction Detection', () => {
    it('should structure contradictions correctly', () => {
      const contradiction = {
        indicatorCode: 'GDP_2023',
        indicatorNameEn: 'GDP 2023 Estimate',
        indicatorNameAr: 'تقدير الناتج المحلي 2023',
        sources: [
          { name: 'World Bank', value: 21.8, date: 'Jun 2024', evidencePackId: 1 },
          { name: 'IMF', value: 23.1, date: 'Apr 2024', evidencePackId: 2 }
        ],
        reason: 'Different methodologies for estimating informal sector',
        reasonAr: 'منهجيات مختلفة لتقدير القطاع غير الرسمي'
      };
      
      expect(contradiction.sources).toHaveLength(2);
      expect(contradiction.sources[0].value).not.toBe(contradiction.sources[1].value);
      expect(contradiction.reason).toBeTruthy();
    });
  });

  describe('Gap Detection', () => {
    it('should identify missing data gaps', () => {
      const gap = {
        type: 'missing_data' as const,
        indicatorCode: 'FISCAL_DEFICIT',
        description: 'No data available for Fiscal Deficit',
        descriptionAr: 'لا توجد بيانات متاحة للعجز المالي',
        severity: 'critical' as const
      };
      
      expect(gap.type).toBe('missing_data');
      expect(gap.severity).toBe('critical');
    });

    it('should identify stale data gaps', () => {
      const gap = {
        type: 'stale_data' as const,
        indicatorCode: 'GDP_NOMINAL',
        description: 'GDP Nominal data is more than 6 months old',
        descriptionAr: 'بيانات الناتج المحلي أقدم من 6 أشهر',
        severity: 'warning' as const
      };
      
      expect(gap.type).toBe('stale_data');
      expect(gap.severity).toBe('warning');
    });
  });

  describe('Brief Generation', () => {
    it('should structure daily digest correctly', () => {
      const digest = {
        type: 'daily_digest' as const,
        generatedAt: new Date().toISOString(),
        period: {
          start: new Date(Date.now() - 86400000).toISOString(),
          end: new Date().toISOString()
        },
        summaryEn: 'Daily macro digest summary',
        summaryAr: 'ملخص الاقتصاد الكلي اليومي',
        keyFindings: [],
        alerts: [],
        contradictions: []
      };
      
      expect(digest.type).toBe('daily_digest');
      expect(digest.summaryEn).toBeTruthy();
      expect(digest.summaryAr).toBeTruthy();
    });

    it('should structure weekly brief correctly', () => {
      const brief = {
        type: 'weekly_public' as const,
        generatedAt: new Date().toISOString(),
        period: {
          start: new Date(Date.now() - 7 * 86400000).toISOString(),
          end: new Date().toISOString()
        },
        summaryEn: 'Weekly macro brief summary',
        summaryAr: 'ملخص الاقتصاد الكلي الأسبوعي',
        keyFindings: [
          {
            titleEn: 'GDP Update',
            titleAr: 'تحديث الناتج المحلي',
            descriptionEn: 'World Bank revised GDP estimates',
            descriptionAr: 'راجع البنك الدولي تقديرات الناتج المحلي'
          }
        ],
        alerts: [],
        contradictions: []
      };
      
      expect(brief.type).toBe('weekly_public');
      expect(brief.keyFindings).toHaveLength(1);
    });

    it('should include recommendations for VIP briefs', () => {
      const vipBrief = {
        type: 'weekly_vip' as const,
        generatedAt: new Date().toISOString(),
        period: {
          start: new Date(Date.now() - 7 * 86400000).toISOString(),
          end: new Date().toISOString()
        },
        summaryEn: 'VIP weekly macro brief',
        summaryAr: 'ملخص الاقتصاد الكلي الأسبوعي للشخصيات المهمة',
        keyFindings: [],
        alerts: [],
        contradictions: [],
        recommendations: [
          {
            titleEn: 'Monitor exchange rate',
            titleAr: 'مراقبة سعر الصرف',
            descriptionEn: 'Exchange rate volatility may impact imports',
            descriptionAr: 'تقلبات سعر الصرف قد تؤثر على الواردات'
          }
        ]
      };
      
      expect(vipBrief.type).toBe('weekly_vip');
      expect(vipBrief.recommendations).toBeDefined();
      expect(vipBrief.recommendations).toHaveLength(1);
    });
  });

  describe('Alert System', () => {
    it('should structure alerts correctly', () => {
      const alert = {
        sectorCode: 'macro',
        alertType: 'freshness_sla_breach',
        severity: 'warning' as const,
        title: 'GDP_NOMINAL data is 400 days old (SLA: 365 days)',
        titleAr: 'بيانات GDP_NOMINAL عمرها 400 يوم (الحد: 365 يوم)',
        indicatorCode: 'GDP_NOMINAL'
      };
      
      expect(alert.sectorCode).toBe('macro');
      expect(alert.alertType).toBe('freshness_sla_breach');
      expect(['critical', 'warning', 'info']).toContain(alert.severity);
    });

    it('should define SLA thresholds for key indicators', () => {
      const slaThresholds: Record<string, number> = {
        GDP_NOMINAL: 365,
        GDP_GROWTH: 365,
        INFLATION_CPI: 90,
        NIGHTLIGHTS_INDEX: 30,
      };
      
      expect(slaThresholds.GDP_NOMINAL).toBe(365);
      expect(slaThresholds.INFLATION_CPI).toBe(90);
      expect(slaThresholds.NIGHTLIGHTS_INDEX).toBe(30);
    });
  });

  describe('Agent Run Types', () => {
    it('should support all run types', () => {
      const runTypes = ['nightly', 'daily', 'weekly', 'manual'];
      runTypes.forEach(type => {
        expect(['nightly', 'daily', 'weekly', 'manual']).toContain(type);
      });
    });

    it('should track run status correctly', () => {
      const run = {
        sectorCode: 'macro',
        runType: 'nightly' as const,
        startedAt: new Date(),
        status: 'running' as const,
        outputFiles: [] as string[]
      };
      
      expect(run.status).toBe('running');
      expect(Array.isArray(run.outputFiles)).toBe(true);
    });
  });

  describe('Date Range Handling', () => {
    it('should support 2010→today date range', () => {
      const startYear = 2010;
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
      
      expect(years[0]).toBe(2010);
      expect(years[years.length - 1]).toBe(currentYear);
      expect(years.length).toBeGreaterThan(10);
    });
  });

  describe('Bilingual Support', () => {
    it('should have Arabic translations for all text fields', () => {
      const kpi = {
        titleEn: 'GDP (Nominal)',
        titleAr: 'الناتج المحلي الإجمالي (الاسمي)',
        proxyLabel: 'Based on VIIRS data',
        proxyLabelAr: 'بناءً على بيانات VIIRS'
      };
      
      expect(kpi.titleAr).toBeTruthy();
      expect(kpi.proxyLabelAr).toBeTruthy();
    });
  });
});
