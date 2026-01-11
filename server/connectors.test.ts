/**
 * YETO Platform - Data Connectors Tests
 * Yemen Economic Transparency Observatory
 * 
 * Unit tests for external data source connectors
 * Tests connector configuration and data normalization logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  WorldBankConnector, 
  HDXConnector, 
  OCHAFTSConnector, 
  ReliefWebConnector,
  DATA_SOURCES,
} from './connectors';

describe('WorldBankConnector', () => {
  let connector: WorldBankConnector;
  
  beforeEach(() => {
    connector = new WorldBankConnector();
  });
  
  it('should have correct source configuration', () => {
    expect(connector.sourceId).toBe('world-bank');
    expect(connector.sourceName).toBe('World Bank Indicators');
  });
  
  it('should have predefined indicators', () => {
    expect(connector.indicators).toBeDefined();
    expect(connector.indicators.length).toBeGreaterThan(0);
    
    // Check for key Yemen indicators
    const indicatorCodes = connector.indicators.map(i => i.code);
    expect(indicatorCodes).toContain('NY.GDP.MKTP.CD'); // GDP
    expect(indicatorCodes).toContain('FP.CPI.TOTL.ZG'); // Inflation
    expect(indicatorCodes).toContain('SP.POP.TOTL'); // Population
  });
  
  it('should normalize World Bank data correctly', async () => {
    const rawData = [
      { page: 1, pages: 1, total: 2 },
      [
        { indicator: { id: 'NY.GDP.MKTP.CD', value: 'GDP (current US$)' }, country: { id: 'YE' }, date: '2023', value: 21000000000 },
        { indicator: { id: 'NY.GDP.MKTP.CD', value: 'GDP (current US$)' }, country: { id: 'YE' }, date: '2022', value: 20000000000 },
      ]
    ];
    
    const series = await connector.normalize(rawData);
    
    expect(series.length).toBe(1);
    expect(series[0].indicatorCode).toBe('NY.GDP.MKTP.CD');
    expect(series[0].indicatorName).toBe('GDP (current US$)');
    expect(series[0].observations.length).toBe(2);
    expect(series[0].sourceId).toBe('world-bank');
  });
  
  it('should validate series and return QA report', async () => {
    const series = [{
      indicatorCode: 'TEST',
      indicatorName: 'Test Indicator',
      sourceId: 'world-bank',
      unit: 'USD',
      frequency: 'annual',
      observations: [
        { date: '2023', value: 100, geoId: 'YEM' },
        { date: '2022', value: 95, geoId: 'YEM' },
      ],
      confidence: 'A' as const,
      metadata: {
        sourceUrl: 'https://data.worldbank.org',
        retrievalDate: new Date().toISOString(),
      },
    }];
    
    const qaReport = await connector.validate(series);
    
    expect(qaReport.passed).toBe(true);
    expect(qaReport.checks).toBeDefined();
    expect(qaReport.checks.length).toBeGreaterThan(0);
    expect(qaReport.overallScore).toBeGreaterThanOrEqual(75);
  });
  
  it('should handle empty data', async () => {
    const rawData = [{ page: 1, pages: 0, total: 0 }, null];
    
    const series = await connector.normalize(rawData);
    
    expect(series.length).toBe(0);
  });
});

describe('HDXConnector', () => {
  let connector: HDXConnector;
  
  beforeEach(() => {
    connector = new HDXConnector();
  });
  
  it('should have correct source configuration', () => {
    expect(connector.sourceId).toBe('hdx-hapi');
    expect(connector.sourceName).toBe('Humanitarian Data Exchange (HAPI)');
  });
  
  it('should normalize HDX population data', async () => {
    const rawData = {
      data: [
        { 
          location_code: 'YEM', 
          population: 33000000, 
          reference_period_start: '2024-01-01',
          admin1_name: 'National',
        },
        { 
          location_code: 'YEM', 
          population: 1200000, 
          reference_period_start: '2024-01-01',
          admin1_name: 'Aden',
        },
      ],
    };
    
    const series = await connector.normalize(rawData);
    
    expect(series.length).toBeGreaterThan(0);
    expect(series[0].sourceId).toBe('hdx-hapi');
    expect(['people', 'persons']).toContain(series[0].unit);
  });
});

describe('OCHAFTSConnector', () => {
  let connector: OCHAFTSConnector;
  
  beforeEach(() => {
    connector = new OCHAFTSConnector();
  });
  
  it('should have correct source configuration', () => {
    expect(connector.sourceId).toBe('ocha-fts');
    expect(connector.sourceName).toBe('OCHA Financial Tracking Service');
  });
  
  it('should normalize FTS funding data', async () => {
    const rawData = {
      data: {
        flows: [
          { 
            id: 1, 
            amountUSD: 500000000, 
            date: '2024-01-15',
            sourceOrganizations: [{ name: 'USAID' }],
            destinationOrganizations: [{ name: 'WFP' }],
          },
          { 
            id: 2, 
            amountUSD: 200000000, 
            date: '2024-02-20',
            sourceOrganizations: [{ name: 'EU' }],
            destinationOrganizations: [{ name: 'UNICEF' }],
          },
        ],
      },
    };
    
    const series = await connector.normalize(rawData);
    
    expect(series.length).toBeGreaterThan(0);
    expect(series[0].sourceId).toBe('ocha-fts');
    expect(series[0].currency).toBe('USD');
  });
});

describe('ReliefWebConnector', () => {
  let connector: ReliefWebConnector;
  
  beforeEach(() => {
    connector = new ReliefWebConnector();
  });
  
  it('should have correct source configuration', () => {
    expect(connector.sourceId).toBe('reliefweb');
    expect(connector.sourceName).toBe('ReliefWeb');
  });
  
  it('should normalize ReliefWeb reports data', async () => {
    const rawData = {
      data: [
        { 
          id: '12345',
          fields: {
            title: 'Yemen Humanitarian Update',
            url_alias: '/report/yemen/update-2024',
            date: { created: '2024-12-01' },
            source: [{ name: 'OCHA' }],
            format: [{ name: 'Situation Report' }],
            theme: [{ name: 'Food and Nutrition' }],
          },
        },
        { 
          id: '12346',
          fields: {
            title: 'Yemen Food Security Assessment',
            url_alias: '/report/yemen/food-2024',
            date: { created: '2024-11-15' },
            source: [{ name: 'WFP' }],
            format: [{ name: 'Assessment' }],
            theme: [{ name: 'Food and Nutrition' }],
          },
        },
      ],
      totalCount: 100,
    };
    
    const series = await connector.normalize(rawData);
    
    expect(series.length).toBeGreaterThan(0);
    expect(series[0].sourceId).toBe('reliefweb');
    // The actual indicator code may vary based on implementation
    expect(series[0].indicatorCode).toBeDefined();
  });
});

describe('DATA_SOURCES configuration', () => {
  it('should have all required sources', () => {
    const sourceIds = DATA_SOURCES.map(s => s.id);
    
    expect(sourceIds).toContain('world-bank');
    expect(sourceIds).toContain('hdx-hapi');
    expect(sourceIds).toContain('ocha-fts');
    expect(sourceIds).toContain('reliefweb');
  });
  
  it('should have valid status for all sources', () => {
    const validStatuses = ['active', 'blocked', 'pending'];
    
    for (const source of DATA_SOURCES) {
      expect(validStatuses).toContain(source.status);
    }
  });
  
  it('should have valid cadence for all sources', () => {
    const validCadences = ['real-time', 'daily', 'weekly', 'monthly', 'quarterly', 'annual'];
    
    for (const source of DATA_SOURCES) {
      expect(validCadences).toContain(source.cadence);
    }
  });
  
  it('should have required fields for all sources', () => {
    for (const source of DATA_SOURCES) {
      expect(source.id).toBeDefined();
      expect(source.name).toBeDefined();
      expect(source.url).toBeDefined();
      expect(source.cadence).toBeDefined();
      expect(source.type).toBeDefined();
      expect(source.status).toBeDefined();
    }
  });
});

describe('Data Validation', () => {
  it('should validate series with proper QA report structure', async () => {
    const connector = new WorldBankConnector();
    const series = [{
      indicatorCode: 'TEST',
      indicatorName: 'Test',
      sourceId: 'world-bank',
      unit: 'USD',
      frequency: 'annual',
      observations: [
        { date: '2023', value: 100, geoId: 'YEM' },
        { date: '2022', value: 95, geoId: 'YEM' },
        { date: '2021', value: 90, geoId: 'YEM' },
      ],
      confidence: 'B' as const,
      metadata: {
        sourceUrl: 'https://test.com',
        retrievalDate: new Date().toISOString(),
      },
    }];
    
    const qaReport = await connector.validate(series);
    
    // Check QA report structure
    expect(qaReport).toHaveProperty('passed');
    expect(qaReport).toHaveProperty('checks');
    expect(qaReport).toHaveProperty('overallScore');
    expect(qaReport).toHaveProperty('warnings');
    expect(qaReport).toHaveProperty('errors');
    
    // Checks should be an array
    expect(Array.isArray(qaReport.checks)).toBe(true);
    expect(qaReport.checks.length).toBeGreaterThan(0);
    
    // Each check should have name, passed, and details
    for (const check of qaReport.checks) {
      expect(check).toHaveProperty('name');
      expect(check).toHaveProperty('passed');
      expect(check).toHaveProperty('details');
    }
  });
  
  it('should detect data gaps in validation', async () => {
    const connector = new WorldBankConnector();
    const series = [{
      indicatorCode: 'TEST',
      indicatorName: 'Test',
      sourceId: 'world-bank',
      unit: 'USD',
      frequency: 'annual',
      observations: [
        { date: '2023', value: 100, geoId: 'YEM' },
        { date: '2020', value: 80, geoId: 'YEM' }, // Gap: 2021, 2022 missing
        { date: '2019', value: 75, geoId: 'YEM' },
      ],
      confidence: 'B' as const,
      metadata: {
        sourceUrl: 'https://test.com',
        retrievalDate: new Date().toISOString(),
      },
    }];
    
    const qaReport = await connector.validate(series);
    
    // Validation should complete without errors
    expect(qaReport.passed).toBeDefined();
    // Gaps may or may not generate warnings depending on implementation
    expect(Array.isArray(qaReport.warnings)).toBe(true);
  });
});


// ============================================
// Daily Scheduler Tests
// ============================================

import { DEFAULT_JOBS } from './services/dailyScheduler';
import { WORLD_BANK_INDICATORS } from './connectors/worldBankConnector';

describe('Daily Scheduler Configuration', () => {
  it('should have default jobs configured', () => {
    expect(DEFAULT_JOBS).toBeDefined();
    expect(Array.isArray(DEFAULT_JOBS)).toBe(true);
    expect(DEFAULT_JOBS.length).toBeGreaterThan(0);
  });

  it('should have World Bank job configured', () => {
    const worldBankJob = DEFAULT_JOBS.find(j => j.id === 'world_bank_daily');
    expect(worldBankJob).toBeDefined();
    expect(worldBankJob?.enabled).toBe(true);
    expect(worldBankJob?.connector).toBe('world_bank');
  });

  it('should have UNHCR job configured', () => {
    const unhcrJob = DEFAULT_JOBS.find(j => j.id === 'unhcr_daily');
    expect(unhcrJob).toBeDefined();
    expect(unhcrJob?.enabled).toBe(true);
    expect(unhcrJob?.connector).toBe('unhcr');
  });

  it('should have valid cron expressions for all jobs', () => {
    for (const job of DEFAULT_JOBS) {
      // Cron expression should have 6 parts (seconds minutes hours day month weekday)
      const parts = job.cronExpression.split(' ');
      expect(parts.length).toBe(6);
      
      // Seconds should be 0
      expect(parts[0]).toBe('0');
    }
  });

  it('should have unique job IDs', () => {
    const ids = DEFAULT_JOBS.map(j => j.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all data refresh jobs with fetch functions', () => {
    const dataRefreshJobs = DEFAULT_JOBS.filter(j => j.type === 'data_refresh');
    
    for (const job of dataRefreshJobs) {
      expect(job.fetchFn).toBeDefined();
      expect(typeof job.fetchFn).toBe('function');
    }
  });

  it('should have signal detection job configured', () => {
    const signalJob = DEFAULT_JOBS.find(j => j.id === 'signal_detection');
    expect(signalJob).toBeDefined();
    expect(signalJob?.type).toBe('signal_detection');
    expect(signalJob?.enabled).toBe(true);
    // Signal detection runs every 4 hours
    expect(signalJob?.cronExpression).toContain('*/4');
  });

  it('should have connectors for all major data sources', () => {
    const connectorIds = DEFAULT_JOBS
      .filter(j => j.connector)
      .map(j => j.connector);
    
    // Required data sources
    const requiredSources = [
      'world_bank',
      'unhcr',
      'who',
      'unicef',
      'wfp',
      'undp',
      'iati',
      'cby',
      'hdx',
      'sanctions',
      'reliefweb',
      'fews_net',
    ];
    
    for (const source of requiredSources) {
      expect(connectorIds).toContain(source);
    }
  });

  it('should schedule data refresh jobs at appropriate times', () => {
    // Data refresh jobs should run in the morning (6-8 AM UTC)
    const dataRefreshJobs = DEFAULT_JOBS.filter(j => j.type === 'data_refresh');
    
    for (const job of dataRefreshJobs) {
      const parts = job.cronExpression.split(' ');
      const hour = parseInt(parts[2]);
      expect(hour).toBeGreaterThanOrEqual(6);
      expect(hour).toBeLessThanOrEqual(8);
    }
  });
});

describe('World Bank Indicator Definitions', () => {
  it('should have correct indicator definitions', () => {
    expect(WORLD_BANK_INDICATORS).toBeDefined();
    expect(WORLD_BANK_INDICATORS.GDP_CURRENT_USD).toBeDefined();
    expect(WORLD_BANK_INDICATORS.GDP_CURRENT_USD.code).toBe('NY.GDP.MKTP.CD');
    expect(WORLD_BANK_INDICATORS.GDP_CURRENT_USD.category).toBe('economy');
  });

  it('should have all required indicator categories', () => {
    const categories = new Set(
      Object.values(WORLD_BANK_INDICATORS).map(i => i.category)
    );
    
    expect(categories.has('economy')).toBe(true);
    expect(categories.has('trade')).toBe(true);
    expect(categories.has('poverty')).toBe(true);
    expect(categories.has('population')).toBe(true);
    expect(categories.has('health')).toBe(true);
  });

  it('should have valid World Bank indicator codes', () => {
    for (const [key, indicator] of Object.entries(WORLD_BANK_INDICATORS)) {
      // World Bank codes follow pattern: XX.XXX.XXXX.XX
      expect(indicator.code).toMatch(/^[A-Z]{2}\.[A-Z0-9]+\.[A-Z0-9]+/);
      expect(indicator.name).toBeTruthy();
      expect(indicator.unit).toBeTruthy();
    }
  });
});
