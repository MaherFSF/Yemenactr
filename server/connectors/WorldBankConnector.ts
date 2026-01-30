/**
 * World Bank Data Connector
 * 
 * Direct API integration with World Bank's open data APIs:
 * - World Development Indicators (WDI)
 * - Documents & Reports
 * - Projects
 * 
 * FULLY HOST-INDEPENDENT - Uses standard HTTP APIs
 * 
 * @see https://datahelpdesk.worldbank.org/knowledgebase/topics/125589-developer-information
 */

import { BaseConnector, ConnectorConfig, IngestionResult, DataRecord, ConnectorRegistry } from './BaseConnector';
import { db } from '../db';
import { timeSeries, datasets } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// WORLD BANK INDICATOR DEFINITIONS
// ============================================================================

const YEMEN_INDICATORS = {
  // GDP & Growth
  'NY.GDP.MKTP.CD': 'GDP (current US$)',
  'NY.GDP.MKTP.KD.ZG': 'GDP growth (annual %)',
  'NY.GDP.PCAP.CD': 'GDP per capita (current US$)',
  'NY.GDP.PCAP.KD.ZG': 'GDP per capita growth (annual %)',
  
  // Inflation & Prices
  'FP.CPI.TOTL.ZG': 'Inflation, consumer prices (annual %)',
  'FP.CPI.TOTL': 'Consumer price index (2010 = 100)',
  
  // Trade
  'NE.EXP.GNFS.ZS': 'Exports of goods and services (% of GDP)',
  'NE.IMP.GNFS.ZS': 'Imports of goods and services (% of GDP)',
  'BN.CAB.XOKA.CD': 'Current account balance (BoP, current US$)',
  'TM.VAL.MRCH.CD.WT': 'Merchandise imports (current US$)',
  'TX.VAL.MRCH.CD.WT': 'Merchandise exports (current US$)',
  
  // Population
  'SP.POP.TOTL': 'Population, total',
  'SP.POP.GROW': 'Population growth (annual %)',
  'SP.URB.TOTL.IN.ZS': 'Urban population (% of total population)',
  
  // Labor & Employment
  'SL.UEM.TOTL.ZS': 'Unemployment, total (% of total labor force)',
  'SL.TLF.TOTL.IN': 'Labor force, total',
  'SL.TLF.CACT.ZS': 'Labor force participation rate (% of total population ages 15+)',
  
  // Poverty
  'SI.POV.NAHC': 'Poverty headcount ratio at national poverty lines (% of population)',
  'SI.POV.DDAY': 'Poverty headcount ratio at $2.15 a day (2017 PPP) (% of population)',
  'SI.POV.GINI': 'Gini index',
  
  // Health
  'SH.XPD.CHEX.PC.CD': 'Current health expenditure per capita (current US$)',
  'SH.DYN.MORT': 'Mortality rate, under-5 (per 1,000 live births)',
  'SP.DYN.LE00.IN': 'Life expectancy at birth, total (years)',
  'SH.STA.MMRT': 'Maternal mortality ratio (per 100,000 live births)',
  
  // Education
  'SE.ADT.LITR.ZS': 'Literacy rate, adult total (% of people ages 15 and above)',
  'SE.PRM.ENRR': 'School enrollment, primary (% gross)',
  'SE.SEC.ENRR': 'School enrollment, secondary (% gross)',
  
  // Infrastructure
  'EG.ELC.ACCS.ZS': 'Access to electricity (% of population)',
  'IT.NET.USER.ZS': 'Individuals using the Internet (% of population)',
  'IT.CEL.SETS.P2': 'Mobile cellular subscriptions (per 100 people)',
  
  // Financial Sector
  'FM.LBL.BMNY.GD.ZS': 'Broad money (% of GDP)',
  'FS.AST.DOMS.GD.ZS': 'Domestic credit provided by financial sector (% of GDP)',
  'FB.CBK.BRCH.P5': 'Commercial bank branches (per 100,000 adults)',
  
  // External Debt
  'DT.DOD.DECT.CD': 'External debt stocks, total (DOD, current US$)',
  'DT.TDS.DECT.EX.ZS': 'Total debt service (% of exports of goods, services and primary income)',
  
  // Agriculture
  'NV.AGR.TOTL.ZS': 'Agriculture, forestry, and fishing, value added (% of GDP)',
  'AG.LND.ARBL.ZS': 'Arable land (% of land area)',
  'AG.PRD.FOOD.XD': 'Food production index (2014-2016 = 100)',
  
  // Government
  'GC.REV.XGRT.GD.ZS': 'Revenue, excluding grants (% of GDP)',
  'GC.XPN.TOTL.GD.ZS': 'Expense (% of GDP)',
  'GC.DOD.TOTL.GD.ZS': 'Central government debt, total (% of GDP)',
  
  // Aid & Remittances
  'DT.ODA.ODAT.CD': 'Net official development assistance received (current US$)',
  'BX.TRF.PWKR.CD.DT': 'Personal remittances, received (current US$)',
};

// ============================================================================
// WORLD BANK CONNECTOR
// ============================================================================

export class WorldBankConnector extends BaseConnector {
  private static readonly BASE_URL = 'https://api.worldbank.org/v2';
  private static readonly COUNTRY_CODE = 'YEM'; // Yemen

  constructor() {
    super({
      name: 'WorldBank',
      baseUrl: WorldBankConnector.BASE_URL,
      rateLimit: 30, // 30 requests per minute
      retryAttempts: 3,
      retryDelay: 2000,
      timeout: 30000,
    });
  }

  /**
   * Test connection to World Bank API
   */
  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/country/${WorldBankConnector.COUNTRY_CODE}?format=json`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return Array.isArray(data) && data.length > 0;
    } catch (error) {
      this.log(`Connection test failed: ${(error as Error).message}`, 'error');
      return false;
    }
  }

  /**
   * Get list of available indicators
   */
  async getAvailableIndicators(): Promise<string[]> {
    return Object.keys(YEMEN_INDICATORS);
  }

  /**
   * Ingest all indicators for a specific year
   */
  async ingestYear(year: number): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      success: true,
      source: 'WorldBank',
      year,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    const indicators = Object.keys(YEMEN_INDICATORS);
    
    for (const indicatorCode of indicators) {
      try {
        const data = await this.fetchIndicator(indicatorCode, year, year);
        
        if (data && data.value !== null) {
          const stored = await this.storeIndicatorData(indicatorCode, data, year);
          if (stored.isNew) {
            result.recordsIngested++;
          } else {
            result.recordsUpdated++;
          }
        }
      } catch (error) {
        result.recordsFailed++;
        result.errors.push(`${indicatorCode}: ${(error as Error).message}`);
      }
    }

    result.duration = Date.now() - startTime;
    result.success = result.recordsFailed < indicators.length / 2;

    return result;
  }

  /**
   * Ingest indicators for a specific year and month
   * Note: World Bank WDI is typically annual, so this returns annual data
   */
  async ingestYearMonth(year: number, month: number): Promise<IngestionResult> {
    // World Bank WDI data is annual, so we just return the year data
    return this.ingestYear(year);
  }

  /**
   * Fetch a specific indicator from World Bank API
   */
  private async fetchIndicator(
    indicatorCode: string,
    startYear: number,
    endYear: number
  ): Promise<{ value: number | null; date: string } | null> {
    const url = `${this.config.baseUrl}/country/${WorldBankConnector.COUNTRY_CODE}/indicator/${indicatorCode}?format=json&date=${startYear}:${endYear}&per_page=100`;
    
    try {
      const response = await this.fetchWithRetry(url);
      const data = await response.json();

      // World Bank API returns [metadata, data] array
      if (!Array.isArray(data) || data.length < 2 || !data[1]) {
        return null;
      }

      const records = data[1];
      if (!Array.isArray(records) || records.length === 0) {
        return null;
      }

      // Find the record for the target year
      const record = records.find((r: any) => r.date === startYear.toString());
      if (!record) {
        return null;
      }

      return {
        value: record.value,
        date: record.date,
      };
    } catch (error) {
      this.log(`Failed to fetch ${indicatorCode}: ${(error as Error).message}`, 'warn');
      return null;
    }
  }

  /**
   * Fetch all years of data for an indicator
   */
  async fetchIndicatorAllYears(
    indicatorCode: string,
    startYear: number = 2010,
    endYear: number = 2026
  ): Promise<Array<{ year: number; value: number | null }>> {
    const url = `${this.config.baseUrl}/country/${WorldBankConnector.COUNTRY_CODE}/indicator/${indicatorCode}?format=json&date=${startYear}:${endYear}&per_page=100`;
    
    try {
      const response = await this.fetchWithRetry(url);
      const data = await response.json();

      if (!Array.isArray(data) || data.length < 2 || !data[1]) {
        return [];
      }

      const records = data[1];
      if (!Array.isArray(records)) {
        return [];
      }

      return records.map((r: any) => ({
        year: parseInt(r.date),
        value: r.value,
      }));
    } catch (error) {
      this.log(`Failed to fetch all years for ${indicatorCode}: ${(error as Error).message}`, 'warn');
      return [];
    }
  }

  /**
   * Store indicator data in the database
   */
  private async storeIndicatorData(
    indicatorCode: string,
    data: { value: number | null; date: string },
    year: number
  ): Promise<{ isNew: boolean }> {
    const indicatorName = YEMEN_INDICATORS[indicatorCode as keyof typeof YEMEN_INDICATORS] || indicatorCode;
    
    try {
      // Check if record exists
      const existing = await db
        .select()
        .from(timeSeries)
        .where(
          and(
            eq(timeSeries.indicatorCode, indicatorCode),
            eq(timeSeries.date, new Date(`${year}-01-01`))
          )
        )
        .limit(1);

      const seriesData = {
        indicatorCode,
        indicatorName,
        value: data.value?.toString() || null,
        date: new Date(`${year}-01-01`),
        source: 'World Bank WDI',
        sourceUrl: `https://data.worldbank.org/indicator/${indicatorCode}?locations=YE`,
        country: 'Yemen',
        countryCode: 'YEM',
        frequency: 'annual',
        unit: this.getIndicatorUnit(indicatorCode),
        metadata: JSON.stringify({
          originalDate: data.date,
          fetchedAt: new Date().toISOString(),
          apiVersion: 'v2',
        }),
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db
          .update(timeSeries)
          .set(seriesData)
          .where(eq(timeSeries.id, existing[0].id));
        return { isNew: false };
      } else {
        await db.insert(timeSeries).values({
          id: `wb-${indicatorCode}-${year}`,
          ...seriesData,
          createdAt: new Date(),
        });
        return { isNew: true };
      }
    } catch (error) {
      this.log(`Failed to store ${indicatorCode} for ${year}: ${(error as Error).message}`, 'error');
      throw error;
    }
  }

  /**
   * Get the unit for an indicator
   */
  private getIndicatorUnit(indicatorCode: string): string {
    if (indicatorCode.includes('.ZS') || indicatorCode.includes('.ZG')) {
      return '%';
    }
    if (indicatorCode.includes('.CD')) {
      return 'USD';
    }
    if (indicatorCode.includes('.IN')) {
      return 'count';
    }
    return 'value';
  }

  /**
   * Fetch World Bank documents for Yemen
   */
  async fetchDocuments(startYear: number, endYear: number): Promise<any[]> {
    const documents: any[] = [];
    
    for (let year = startYear; year <= endYear; year++) {
      try {
        const url = `https://search.worldbank.org/api/v2/wds?format=json&fl=id,docdt,docty,display_title,pdfurl,txturl,count,countrycode&qterm=yemen&rows=100&fct=docdt_collapse,${year}`;
        
        const response = await this.fetchWithRetry(url);
        const data = await response.json();

        if (data.documents) {
          for (const docId in data.documents) {
            const doc = data.documents[docId];
            if (doc.countrycode && doc.countrycode.includes('YE')) {
              documents.push({
                id: doc.id,
                title: doc.display_title,
                date: doc.docdt,
                type: doc.docty,
                pdfUrl: doc.pdfurl,
                year,
              });
            }
          }
        }

        this.log(`Found ${documents.length} documents for ${year}`);
      } catch (error) {
        this.log(`Failed to fetch documents for ${year}: ${(error as Error).message}`, 'warn');
      }
    }

    return documents;
  }

  /**
   * Fetch World Bank projects for Yemen
   */
  async fetchProjects(): Promise<any[]> {
    try {
      const url = `${this.config.baseUrl}/projects?format=json&countrycode=YE&per_page=500`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();

      if (data.projects) {
        return data.projects.map((p: any) => ({
          id: p.id,
          name: p.project_name,
          status: p.status,
          approvalDate: p.boardapprovaldate,
          closingDate: p.closingdate,
          totalCommitment: p.totalcommamt,
          sector: p.sector1?.Name,
          theme: p.theme1?.Name,
        }));
      }

      return [];
    } catch (error) {
      this.log(`Failed to fetch projects: ${(error as Error).message}`, 'warn');
      return [];
    }
  }

  /**
   * Run full ingestion for all years
   */
  async runFullIngestion(startYear: number = 2010, endYear: number = 2026): Promise<{
    indicators: IngestionResult[];
    documents: any[];
    projects: any[];
  }> {
    this.log(`Starting full World Bank ingestion: ${startYear}-${endYear}`);

    // Ingest all indicators year by year
    const indicatorResults: IngestionResult[] = [];
    for (let year = startYear; year <= endYear; year++) {
      const result = await this.ingestYear(year);
      indicatorResults.push(result);
      this.log(`Year ${year}: ${result.recordsIngested} new, ${result.recordsUpdated} updated`);
    }

    // Fetch documents
    const documents = await this.fetchDocuments(startYear, endYear);
    this.log(`Fetched ${documents.length} documents`);

    // Fetch projects
    const projects = await this.fetchProjects();
    this.log(`Fetched ${projects.length} projects`);

    return {
      indicators: indicatorResults,
      documents,
      projects,
    };
  }
}

// Register the connector
const worldBankConnector = new WorldBankConnector();
ConnectorRegistry.register('WorldBank', worldBankConnector);

export { worldBankConnector };
