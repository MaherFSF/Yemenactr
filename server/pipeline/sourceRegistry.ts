/**
 * YETO Data Pipeline - Source Registry
 * Manages all data sources with metadata, status, and scheduling
 */

// Source Registry - manages all data sources with metadata and scheduling

export interface DataSourceConfig {
  id: string;
  name: string;
  nameAr: string;
  type: 'api' | 'partner' | 'scraper' | 'manual' | 'file';
  category: 'official' | 'international' | 'research' | 'other';
  endpoint?: string;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  regime?: 'aden' | 'sanaa' | 'both' | 'international';
  confidenceDefault: 'A' | 'B' | 'C' | 'D';
  enabled: boolean;
  rateLimitPerMinute: number;
  retryAttempts: number;
  timeout: number;
  lastRun?: Date;
  lastSuccess?: Date;
  recordCount: number;
  errorCount: number;
  metadata: Record<string, unknown>;
}

// Pre-configured data sources matching the architecture diagram
export const YETO_DATA_SOURCES: DataSourceConfig[] = [
  // Official Government Sources
  {
    id: 'cby-aden',
    name: 'Central Bank of Yemen - Aden',
    nameAr: 'البنك المركزي اليمني - عدن',
    type: 'partner',
    category: 'official',
    endpoint: 'https://cby-aden.gov.ye/api',
    frequency: 'daily',
    regime: 'aden',
    confidenceDefault: 'A',
    enabled: true,
    rateLimitPerMinute: 60,
    retryAttempts: 3,
    timeout: 30000,
    recordCount: 0,
    errorCount: 0,
    metadata: { sectors: ['banking', 'monetary', 'exchange'] }
  },
  {
    id: 'cby-sanaa',
    name: 'Central Bank of Yemen - Sana\'a',
    nameAr: 'البنك المركزي اليمني - صنعاء',
    type: 'partner',
    category: 'official',
    endpoint: 'https://cby-sanaa.gov.ye/api',
    frequency: 'daily',
    regime: 'sanaa',
    confidenceDefault: 'B',
    enabled: true,
    rateLimitPerMinute: 60,
    retryAttempts: 3,
    timeout: 30000,
    recordCount: 0,
    errorCount: 0,
    metadata: { sectors: ['banking', 'monetary', 'exchange'] }
  },
  // International Organizations
  {
    id: 'world-bank',
    name: 'World Bank Indicators',
    nameAr: 'مؤشرات البنك الدولي',
    type: 'api',
    category: 'international',
    endpoint: 'https://api.worldbank.org/v2',
    frequency: 'monthly',
    regime: 'international',
    confidenceDefault: 'A',
    enabled: true,
    rateLimitPerMinute: 100,
    retryAttempts: 3,
    timeout: 60000,
    recordCount: 0,
    errorCount: 0,
    metadata: { indicators: ['GDP', 'inflation', 'population', 'trade'] }
  },
  {
    id: 'imf',
    name: 'International Monetary Fund',
    nameAr: 'صندوق النقد الدولي',
    type: 'api',
    category: 'international',
    endpoint: 'https://www.imf.org/external/datamapper/api',
    frequency: 'monthly',
    regime: 'international',
    confidenceDefault: 'A',
    enabled: true,
    rateLimitPerMinute: 30,
    retryAttempts: 3,
    timeout: 60000,
    recordCount: 0,
    errorCount: 0,
    metadata: { datasets: ['WEO', 'IFS', 'DOTS'] }
  },
  {
    id: 'ocha-fts',
    name: 'OCHA Financial Tracking Service',
    nameAr: 'خدمة التتبع المالي - أوتشا',
    type: 'api',
    category: 'international',
    endpoint: 'https://api.hpc.tools/v1',
    frequency: 'daily',
    regime: 'international',
    confidenceDefault: 'A',
    enabled: true,
    rateLimitPerMinute: 60,
    retryAttempts: 3,
    timeout: 30000,
    recordCount: 0,
    errorCount: 0,
    metadata: { sectors: ['humanitarian', 'aid', 'funding'] }
  },
  {
    id: 'hdx-hapi',
    name: 'Humanitarian Data Exchange',
    nameAr: 'تبادل البيانات الإنسانية',
    type: 'api',
    category: 'international',
    endpoint: 'https://hapi.humdata.org/api/v1',
    frequency: 'daily',
    regime: 'international',
    confidenceDefault: 'A',
    enabled: true,
    rateLimitPerMinute: 100,
    retryAttempts: 3,
    timeout: 30000,
    recordCount: 0,
    errorCount: 0,
    metadata: { sectors: ['humanitarian', 'food', 'health'] }
  },
  {
    id: 'wfp-vam',
    name: 'WFP Vulnerability Analysis',
    nameAr: 'تحليل الضعف - برنامج الأغذية العالمي',
    type: 'api',
    category: 'international',
    endpoint: 'https://api.vam.wfp.org',
    frequency: 'weekly',
    regime: 'international',
    confidenceDefault: 'A',
    enabled: true,
    rateLimitPerMinute: 30,
    retryAttempts: 3,
    timeout: 60000,
    recordCount: 0,
    errorCount: 0,
    metadata: { sectors: ['food', 'prices', 'markets'] }
  },
  {
    id: 'iati',
    name: 'IATI Aid Activity Data',
    nameAr: 'بيانات أنشطة المعونة - IATI',
    type: 'api',
    category: 'international',
    endpoint: 'https://api.iatistandard.org',
    frequency: 'weekly',
    regime: 'international',
    confidenceDefault: 'A',
    enabled: true,
    rateLimitPerMinute: 60,
    retryAttempts: 3,
    timeout: 60000,
    recordCount: 0,
    errorCount: 0,
    metadata: { sectors: ['aid', 'development', 'projects'] }
  },
  {
    id: 'acled',
    name: 'ACLED Conflict Data',
    nameAr: 'بيانات النزاع - ACLED',
    type: 'api',
    category: 'research',
    endpoint: 'https://api.acleddata.com/acled/read',
    frequency: 'weekly',
    regime: 'international',
    confidenceDefault: 'A',
    enabled: true,
    rateLimitPerMinute: 10,
    retryAttempts: 3,
    timeout: 60000,
    recordCount: 0,
    errorCount: 0,
    metadata: { sectors: ['conflict', 'security', 'events'] }
  },
  {
    id: 'ucdp',
    name: 'Uppsala Conflict Data Program',
    nameAr: 'برنامج أوبسالا لبيانات النزاع',
    type: 'api',
    category: 'research',
    endpoint: 'https://ucdpapi.pcr.uu.se/api',
    frequency: 'monthly',
    regime: 'international',
    confidenceDefault: 'A',
    enabled: true,
    rateLimitPerMinute: 30,
    retryAttempts: 3,
    timeout: 60000,
    recordCount: 0,
    errorCount: 0,
    metadata: { sectors: ['conflict', 'fatalities', 'events'] }
  },
  // Web Scrapers
  {
    id: 'news-scraper',
    name: 'Yemen News Aggregator',
    nameAr: 'مجمع أخبار اليمن',
    type: 'scraper',
    category: 'other',
    frequency: 'hourly',
    regime: 'both',
    confidenceDefault: 'C',
    enabled: true,
    rateLimitPerMinute: 10,
    retryAttempts: 2,
    timeout: 30000,
    recordCount: 0,
    errorCount: 0,
    metadata: { sources: ['reuters', 'aljazeera', 'bbc', 'local'] }
  },
  {
    id: 'market-scraper',
    name: 'Market Price Scraper',
    nameAr: 'كاشطة أسعار السوق',
    type: 'scraper',
    category: 'other',
    frequency: 'daily',
    regime: 'both',
    confidenceDefault: 'C',
    enabled: true,
    rateLimitPerMinute: 5,
    retryAttempts: 2,
    timeout: 30000,
    recordCount: 0,
    errorCount: 0,
    metadata: { markets: ['aden', 'sanaa', 'taiz', 'hodeidah'] }
  }
];

export class SourceRegistry {
  private sources: Map<string, DataSourceConfig> = new Map();
  
  constructor() {
    // Initialize with pre-configured sources
    YETO_DATA_SOURCES.forEach(source => {
      this.sources.set(source.id, source);
    });
  }
  
  /**
   * Get all registered data sources
   */
  getAllSources(): DataSourceConfig[] {
    return Array.from(this.sources.values());
  }
  
  /**
   * Get sources by category
   */
  getSourcesByCategory(category: DataSourceConfig['category']): DataSourceConfig[] {
    return this.getAllSources().filter(s => s.category === category);
  }
  
  /**
   * Get sources by type
   */
  getSourcesByType(type: DataSourceConfig['type']): DataSourceConfig[] {
    return this.getAllSources().filter(s => s.type === type);
  }
  
  /**
   * Get enabled sources only
   */
  getEnabledSources(): DataSourceConfig[] {
    return this.getAllSources().filter(s => s.enabled);
  }
  
  /**
   * Get source by ID
   */
  getSource(id: string): DataSourceConfig | undefined {
    return this.sources.get(id);
  }
  
  /**
   * Update source status after run
   */
  updateSourceStatus(id: string, success: boolean, recordCount?: number): void {
    const source = this.sources.get(id);
    if (source) {
      source.lastRun = new Date();
      if (success) {
        source.lastSuccess = new Date();
        if (recordCount !== undefined) {
          source.recordCount += recordCount;
        }
      } else {
        source.errorCount++;
      }
    }
  }
  
  /**
   * Get sources due for refresh
   */
  getSourcesDueForRefresh(): DataSourceConfig[] {
    const now = new Date();
    return this.getEnabledSources().filter(source => {
      if (!source.lastRun) return true;
      
      const lastRun = new Date(source.lastRun);
      const diffMs = now.getTime() - lastRun.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      switch (source.frequency) {
        case 'realtime': return diffHours >= 0.1; // 6 minutes
        case 'hourly': return diffHours >= 1;
        case 'daily': return diffHours >= 24;
        case 'weekly': return diffHours >= 168;
        case 'monthly': return diffHours >= 720;
        default: return false;
      }
    });
  }
  
  /**
   * Get source statistics
   */
  getStatistics(): {
    total: number;
    enabled: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
    totalRecords: number;
    totalErrors: number;
  } {
    const sources = this.getAllSources();
    const byCategory: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalRecords = 0;
    let totalErrors = 0;
    
    sources.forEach(source => {
      byCategory[source.category] = (byCategory[source.category] || 0) + 1;
      byType[source.type] = (byType[source.type] || 0) + 1;
      totalRecords += source.recordCount;
      totalErrors += source.errorCount;
    });
    
    return {
      total: sources.length,
      enabled: sources.filter(s => s.enabled).length,
      byCategory,
      byType,
      totalRecords,
      totalErrors
    };
  }
}

// Singleton instance
export const sourceRegistry = new SourceRegistry();
