/**
 * DATA_NUMERIC Source Registry
 * 
 * Comprehensive registry of all numeric data sources with:
 * - Real API endpoints and authentication requirements
 * - Native frequency (daily/weekly/monthly/quarterly/annual)
 * - Product/indicator mappings
 * - Data availability windows
 * 
 * RULES:
 * - Never invent frequencies - use source's native frequency
 * - Never interpolate missing data
 * - Strict regime_tag separation
 * - Store observations at native frequency, backfill by year
 */

export type DataFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type SourceStatus = 'active' | 'requires_key' | 'requires_partnership' | 'manual' | 'inactive';

export interface NumericProduct {
  product_id: string;
  name: string;
  nameAr: string;
  frequency: DataFrequency;
  unit: string;
  availableFrom: string; // YYYY-MM-DD
  availableTo?: string; // YYYY-MM-DD or undefined for ongoing
  regimeTag?: 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'international';
  apiPath?: string; // Specific API path for this product
  indicatorCode?: string; // External indicator code (e.g., NY.GDP.MKTP.CD for World Bank)
}

export interface NumericDataSource {
  sourceId: string;
  name: string;
  nameAr: string;
  organization: string;
  type: 'api' | 'sdmx' | 'csv' | 'manual' | 'partner';
  status: SourceStatus;
  baseUrl?: string;
  apiVersion?: string;
  authType?: 'none' | 'api_key' | 'oauth' | 'basic';
  rateLimitPerHour?: number;
  products: NumericProduct[];
  notes?: string;
  documentationUrl?: string;
  contactEmail?: string;
}

/**
 * FLAGSHIP NUMERIC SOURCES
 * Sources with verified API endpoints and comprehensive Yemen data
 */
export const NUMERIC_SOURCES: NumericDataSource[] = [
  // ==========================================================================
  // WORLD BANK - World Development Indicators
  // ==========================================================================
  {
    sourceId: 'wb-wdi',
    name: 'World Bank - World Development Indicators',
    nameAr: 'البنك الدولي - مؤشرات التنمية العالمية',
    organization: 'World Bank',
    type: 'api',
    status: 'active',
    baseUrl: 'https://api.worldbank.org/v2',
    apiVersion: 'v2',
    authType: 'none',
    rateLimitPerHour: 500,
    documentationUrl: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889386',
    products: [
      {
        product_id: 'wb-gdp',
        name: 'GDP (current US$)',
        nameAr: 'الناتج المحلي الإجمالي',
        frequency: 'annual',
        unit: 'USD',
        availableFrom: '1990-01-01',
        regimeTag: 'international',
        indicatorCode: 'NY.GDP.MKTP.CD',
      },
      {
        product_id: 'wb-gdp-per-capita',
        name: 'GDP per capita (current US$)',
        nameAr: 'نصيب الفرد من الناتج المحلي الإجمالي',
        frequency: 'annual',
        unit: 'USD',
        availableFrom: '1990-01-01',
        regimeTag: 'international',
        indicatorCode: 'NY.GDP.PCAP.CD',
      },
      {
        product_id: 'wb-inflation',
        name: 'Inflation, consumer prices (annual %)',
        nameAr: 'التضخم، أسعار المستهلك',
        frequency: 'annual',
        unit: 'percent',
        availableFrom: '1990-01-01',
        regimeTag: 'international',
        indicatorCode: 'FP.CPI.TOTL.ZG',
      },
      {
        product_id: 'wb-population',
        name: 'Population, total',
        nameAr: 'إجمالي السكان',
        frequency: 'annual',
        unit: 'persons',
        availableFrom: '1960-01-01',
        regimeTag: 'international',
        indicatorCode: 'SP.POP.TOTL',
      },
      {
        product_id: 'wb-unemployment',
        name: 'Unemployment, total (% of labor force)',
        nameAr: 'معدل البطالة',
        frequency: 'annual',
        unit: 'percent',
        availableFrom: '1991-01-01',
        regimeTag: 'international',
        indicatorCode: 'SL.UEM.TOTL.ZS',
      },
      {
        product_id: 'wb-exports-goods-services',
        name: 'Exports of goods and services (% of GDP)',
        nameAr: 'الصادرات من السلع والخدمات',
        frequency: 'annual',
        unit: 'percent',
        availableFrom: '1990-01-01',
        regimeTag: 'international',
        indicatorCode: 'NE.EXP.GNFS.ZS',
      },
      {
        product_id: 'wb-imports-goods-services',
        name: 'Imports of goods and services (% of GDP)',
        nameAr: 'الواردات من السلع والخدمات',
        frequency: 'annual',
        unit: 'percent',
        availableFrom: '1990-01-01',
        regimeTag: 'international',
        indicatorCode: 'NE.IMP.GNFS.ZS',
      },
      {
        product_id: 'wb-remittances',
        name: 'Personal remittances, received (current US$)',
        nameAr: 'التحويلات الشخصية المستلمة',
        frequency: 'annual',
        unit: 'USD',
        availableFrom: '1990-01-01',
        regimeTag: 'international',
        indicatorCode: 'BX.TRF.PWKR.CD.DT',
      },
      {
        product_id: 'wb-life-expectancy',
        name: 'Life expectancy at birth (years)',
        nameAr: 'العمر المتوقع عند الولادة',
        frequency: 'annual',
        unit: 'years',
        availableFrom: '1960-01-01',
        regimeTag: 'international',
        indicatorCode: 'SP.DYN.LE00.IN',
      },
      {
        product_id: 'wb-poverty-ratio',
        name: 'Poverty headcount ratio at $2.15 a day',
        nameAr: 'نسبة الفقر',
        frequency: 'annual',
        unit: 'percent',
        availableFrom: '1990-01-01',
        regimeTag: 'international',
        indicatorCode: 'SI.POV.DDAY',
      },
    ],
    notes: 'Public API, no authentication required. Yemen country code: YEM or YE',
  },

  // ==========================================================================
  // IMF - International Financial Statistics
  // ==========================================================================
  {
    sourceId: 'imf-ifs',
    name: 'IMF - International Financial Statistics',
    nameAr: 'صندوق النقد الدولي - الإحصاءات المالية الدولية',
    organization: 'International Monetary Fund',
    type: 'sdmx',
    status: 'active',
    baseUrl: 'https://sdmxcentral.imf.org/ws/public/sdmxapi/rest',
    apiVersion: '1.0',
    authType: 'none',
    rateLimitPerHour: 1000,
    documentationUrl: 'https://datahelp.imf.org/knowledgebase/articles/667681',
    products: [
      {
        product_id: 'imf-exchange-rate',
        name: 'Exchange Rate (LCU per USD, period average)',
        nameAr: 'سعر الصرف',
        frequency: 'monthly',
        unit: 'YER/USD',
        availableFrom: '1990-01-01',
        regimeTag: 'international',
        indicatorCode: 'ENDA_XDC_USD_RATE',
      },
      {
        product_id: 'imf-reserves',
        name: 'Total Reserves (excluding gold, USD)',
        nameAr: 'إجمالي الاحتياطيات',
        frequency: 'monthly',
        unit: 'USD',
        availableFrom: '1990-01-01',
        regimeTag: 'international',
        indicatorCode: 'FI_1L_USD',
      },
      {
        product_id: 'imf-cpi',
        name: 'Consumer Price Index',
        nameAr: 'مؤشر أسعار المستهلك',
        frequency: 'monthly',
        unit: 'index',
        availableFrom: '1990-01-01',
        regimeTag: 'international',
        indicatorCode: 'PCPI_IX',
      },
    ],
    notes: 'SDMX API, no authentication required. Yemen country code: 474',
  },

  // ==========================================================================
  // UNHCR - Refugee Statistics
  // ==========================================================================
  {
    sourceId: 'unhcr-popstats',
    name: 'UNHCR - Population Statistics',
    nameAr: 'مفوضية الأمم المتحدة لشؤون اللاجئين - إحصاءات السكان',
    organization: 'UN High Commissioner for Refugees',
    type: 'api',
    status: 'active',
    baseUrl: 'https://api.unhcr.org/population/v1',
    authType: 'api_key',
    rateLimitPerHour: 100,
    documentationUrl: 'https://api.unhcr.org/docs',
    products: [
      {
        product_id: 'unhcr-refugees',
        name: 'Refugees',
        nameAr: 'اللاجئون',
        frequency: 'annual',
        unit: 'persons',
        availableFrom: '2000-01-01',
        regimeTag: 'international',
      },
      {
        product_id: 'unhcr-idps',
        name: 'Internally Displaced Persons',
        nameAr: 'النازحون داخلياً',
        frequency: 'annual',
        unit: 'persons',
        availableFrom: '2000-01-01',
        regimeTag: 'mixed',
      },
      {
        product_id: 'unhcr-asylum-seekers',
        name: 'Asylum Seekers',
        nameAr: 'طالبو اللجوء',
        frequency: 'annual',
        unit: 'persons',
        availableFrom: '2000-01-01',
        regimeTag: 'international',
      },
    ],
    notes: 'Requires API key. Register at https://api.unhcr.org',
  },

  // ==========================================================================
  // OCHA FTS - Humanitarian Funding
  // ==========================================================================
  {
    sourceId: 'ocha-fts',
    name: 'OCHA Financial Tracking Service',
    nameAr: 'خدمة التتبع المالي - أوتشا',
    organization: 'UN OCHA',
    type: 'api',
    status: 'active',
    baseUrl: 'https://api.hpc.tools/v2/fts',
    authType: 'none',
    rateLimitPerHour: 200,
    documentationUrl: 'https://fts.unocha.org/content/fts-api-documentation',
    products: [
      {
        product_id: 'ocha-funding-total',
        name: 'Total Humanitarian Funding',
        nameAr: 'إجمالي التمويل الإنساني',
        frequency: 'daily',
        unit: 'USD',
        availableFrom: '2000-01-01',
        regimeTag: 'mixed',
      },
      {
        product_id: 'ocha-funding-hrp',
        name: 'Humanitarian Response Plan Funding',
        nameAr: 'تمويل خطة الاستجابة الإنسانية',
        frequency: 'daily',
        unit: 'USD',
        availableFrom: '2015-01-01',
        regimeTag: 'mixed',
      },
      {
        product_id: 'ocha-requirements',
        name: 'Funding Requirements',
        nameAr: 'الاحتياجات التمويلية',
        frequency: 'monthly',
        unit: 'USD',
        availableFrom: '2000-01-01',
        regimeTag: 'mixed',
      },
    ],
    notes: 'Public API, no authentication. Use country code: 248 for Yemen',
  },

  // ==========================================================================
  // WFP - Food Prices
  // ==========================================================================
  {
    sourceId: 'wfp-vam',
    name: 'WFP - Vulnerability Analysis and Mapping',
    nameAr: 'برنامج الأغذية العالمي - تحليل الضعف ورسم الخرائط',
    organization: 'World Food Programme',
    type: 'api',
    status: 'active',
    baseUrl: 'https://api.vam.wfp.org/dataviz/api',
    authType: 'api_key',
    rateLimitPerHour: 100,
    documentationUrl: 'https://dataviz.vam.wfp.org/ApiExplorer',
    products: [
      {
        product_id: 'wfp-food-prices',
        name: 'Food Commodity Prices',
        nameAr: 'أسعار المواد الغذائية',
        frequency: 'monthly',
        unit: 'YER',
        availableFrom: '2010-01-01',
        regimeTag: 'mixed',
      },
      {
        product_id: 'wfp-market-functionality',
        name: 'Market Functionality Index',
        nameAr: 'مؤشر وظائف السوق',
        frequency: 'quarterly',
        unit: 'index',
        availableFrom: '2015-01-01',
        regimeTag: 'mixed',
      },
    ],
    notes: 'Requires API key. Request at https://dataviz.vam.wfp.org/',
  },

  // ==========================================================================
  // HDX HAPI - Humanitarian Data
  // ==========================================================================
  {
    sourceId: 'hdx-hapi',
    name: 'HDX - Humanitarian API',
    nameAr: 'تبادل البيانات الإنسانية',
    organization: 'Humanitarian Data Exchange',
    type: 'api',
    status: 'active',
    baseUrl: 'https://hapi.humdata.org/api/v1',
    authType: 'api_key',
    rateLimitPerHour: 1000,
    documentationUrl: 'https://hdx-hapi.readthedocs.io/',
    products: [
      {
        product_id: 'hdx-population-affected',
        name: 'Affected Population',
        nameAr: 'السكان المتضررون',
        frequency: 'monthly',
        unit: 'persons',
        availableFrom: '2015-01-01',
        regimeTag: 'mixed',
      },
      {
        product_id: 'hdx-conflict-events',
        name: 'Conflict Events',
        nameAr: 'أحداث النزاع',
        frequency: 'daily',
        unit: 'events',
        availableFrom: '2015-01-01',
        regimeTag: 'mixed',
      },
    ],
    notes: 'Requires API key. Register at https://data.humdata.org',
  },

  // ==========================================================================
  // CENTRAL BANK OF YEMEN - ADEN (IRG)
  // ==========================================================================
  {
    sourceId: 'cby-aden',
    name: 'Central Bank of Yemen - Aden',
    nameAr: 'البنك المركزي اليمني - عدن',
    organization: 'CBY Aden (IRG)',
    type: 'manual',
    status: 'requires_partnership',
    contactEmail: 'info@cby-ye.com',
    products: [
      {
        product_id: 'cby-aden-exchange-rate',
        name: 'Official Exchange Rate (CBY Aden)',
        nameAr: 'سعر الصرف الرسمي - عدن',
        frequency: 'daily',
        unit: 'YER/USD',
        availableFrom: '2016-01-01',
        regimeTag: 'aden_irg',
      },
      {
        product_id: 'cby-aden-reserves',
        name: 'Foreign Reserves (CBY Aden)',
        nameAr: 'الاحتياطيات الأجنبية - عدن',
        frequency: 'monthly',
        unit: 'USD',
        availableFrom: '2016-01-01',
        regimeTag: 'aden_irg',
      },
      {
        product_id: 'cby-aden-money-supply',
        name: 'Money Supply M2 (CBY Aden)',
        nameAr: 'عرض النقد - عدن',
        frequency: 'monthly',
        unit: 'YER',
        availableFrom: '2016-01-01',
        regimeTag: 'aden_irg',
      },
    ],
    notes: 'Manual data entry from published bulletins. Partnership required for API access.',
  },

  // ==========================================================================
  // CENTRAL BANK OF YEMEN - SANA'A (DFA)
  // ==========================================================================
  {
    sourceId: 'cby-sanaa',
    name: 'Central Bank of Yemen - Sana\'a',
    nameAr: 'البنك المركزي اليمني - صنعاء',
    organization: 'CBY Sana\'a (DFA)',
    type: 'manual',
    status: 'requires_partnership',
    products: [
      {
        product_id: 'cby-sanaa-exchange-rate',
        name: 'Official Exchange Rate (CBY Sana\'a)',
        nameAr: 'سعر الصرف الرسمي - صنعاء',
        frequency: 'daily',
        unit: 'YER/USD',
        availableFrom: '2016-01-01',
        regimeTag: 'sanaa_defacto',
      },
      {
        product_id: 'cby-sanaa-reserves',
        name: 'Foreign Reserves (CBY Sana\'a)',
        nameAr: 'الاحتياطيات الأجنبية - صنعاء',
        frequency: 'monthly',
        unit: 'USD',
        availableFrom: '2016-01-01',
        regimeTag: 'sanaa_defacto',
      },
    ],
    notes: 'Manual data entry from published reports. Partnership negotiations ongoing.',
  },
];

/**
 * Registry class for managing numeric data sources
 */
export class NumericSourceRegistry {
  private sources: Map<string, NumericDataSource>;

  constructor() {
    this.sources = new Map();
    NUMERIC_SOURCES.forEach(source => {
      this.sources.set(source.sourceId, source);
    });
  }

  /**
   * Get all sources
   */
  getAllSources(): NumericDataSource[] {
    return Array.from(this.sources.values());
  }

  /**
   * Get source by ID
   */
  getSource(sourceId: string): NumericDataSource | undefined {
    return this.sources.get(sourceId);
  }

  /**
   * Get all products across all sources
   */
  getAllProducts(): Array<NumericProduct & { sourceId: string; sourceName: string }> {
    const products: Array<NumericProduct & { sourceId: string; sourceName: string }> = [];
    
    for (const source of this.sources.values()) {
      for (const product of source.products) {
        products.push({
          ...product,
          sourceId: source.sourceId,
          sourceName: source.name,
        });
      }
    }
    
    return products;
  }

  /**
   * Get product by ID
   */
  getProduct(productId: string): (NumericProduct & { sourceId: string }) | undefined {
    for (const source of this.sources.values()) {
      const product = source.products.find(p => p.product_id === productId);
      if (product) {
        return { ...product, sourceId: source.sourceId };
      }
    }
    return undefined;
  }

  /**
   * Get sources by status
   */
  getSourcesByStatus(status: SourceStatus): NumericDataSource[] {
    return this.getAllSources().filter(s => s.status === status);
  }

  /**
   * Get active API sources (ready for automated backfill)
   */
  getActiveSources(): NumericDataSource[] {
    return this.getAllSources().filter(s => 
      s.status === 'active' && (s.type === 'api' || s.type === 'sdmx')
    );
  }

  /**
   * Get products by frequency
   */
  getProductsByFrequency(frequency: DataFrequency): Array<NumericProduct & { sourceId: string }> {
    const products: Array<NumericProduct & { sourceId: string }> = [];
    
    for (const source of this.sources.values()) {
      for (const product of source.products) {
        if (product.frequency === frequency) {
          products.push({ ...product, sourceId: source.sourceId });
        }
      }
    }
    
    return products;
  }

  /**
   * Get products by regime tag
   */
  getProductsByRegime(regimeTag: 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'international'): Array<NumericProduct & { sourceId: string }> {
    const products: Array<NumericProduct & { sourceId: string }> = [];
    
    for (const source of this.sources.values()) {
      for (const product of source.products) {
        if (product.regimeTag === regimeTag) {
          products.push({ ...product, sourceId: source.sourceId });
        }
      }
    }
    
    return products;
  }

  /**
   * Check if product is available for a given year
   */
  isProductAvailableForYear(productId: string, year: number): boolean {
    const product = this.getProduct(productId);
    if (!product) return false;

    const availableFromYear = new Date(product.availableFrom).getFullYear();
    const availableToYear = product.availableTo 
      ? new Date(product.availableTo).getFullYear() 
      : new Date().getFullYear();

    return year >= availableFromYear && year <= availableToYear;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSources: number;
    activeSources: number;
    totalProducts: number;
    byStatus: Record<SourceStatus, number>;
    byType: Record<string, number>;
    byFrequency: Record<DataFrequency, number>;
  } {
    const sources = this.getAllSources();
    const products = this.getAllProducts();

    const byStatus: Record<SourceStatus, number> = {
      active: 0,
      requires_key: 0,
      requires_partnership: 0,
      manual: 0,
      inactive: 0,
    };

    const byType: Record<string, number> = {};
    const byFrequency: Record<DataFrequency, number> = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      quarterly: 0,
      annual: 0,
    };

    sources.forEach(source => {
      byStatus[source.status]++;
      byType[source.type] = (byType[source.type] || 0) + 1;
    });

    products.forEach(product => {
      byFrequency[product.frequency]++;
    });

    return {
      totalSources: sources.length,
      activeSources: sources.filter(s => s.status === 'active').length,
      totalProducts: products.length,
      byStatus,
      byType,
      byFrequency,
    };
  }
}

// Singleton instance
export const numericSourceRegistry = new NumericSourceRegistry();
