/**
 * Banking Sector Data Connector
 * Fetches data from CBY, World Bank, IMF, and other banking sources
 * Covers 2023-2026 with historical backfill
 */

import { BaseDataConnector, ConnectorConfig, TransformationResult, ValidationResult, DataPoint } from "../services/dataConnector";

export class BankingConnector extends BaseDataConnector {
  constructor(config: ConnectorConfig) {
    super(config);
  }

  /**
   * Fetch banking data from multiple sources
   */
  async fetchData(year?: number): Promise<any> {
    const years = year ? [year] : [2023, 2024, 2025, 2026];
    const data: any = {
      nplRatios: [],
      depositGrowth: [],
      creditToGdp: [],
      capitalAdequacy: [],
      liquidityRatios: [],
      interestRates: [],
    };

    for (const y of years) {
      try {
        // Fetch from CBY (Central Bank of Yemen)
        const cbyData = await this.fetchFromCBY(y);
        Object.assign(data, cbyData);

        // Fetch from World Bank
        const wbData = await this.fetchFromWorldBank(y);
        Object.assign(data, wbData);

        // Fetch from IMF
        const imfData = await this.fetchFromIMF(y);
        Object.assign(data, imfData);
      } catch (error) {
        console.warn(`Failed to fetch banking data for ${y}:`, error);
      }
    }

    return data;
  }

  /**
   * Transform raw banking data to YETO schema
   */
  async transformData(rawData: any): Promise<TransformationResult[]> {
    const results: TransformationResult[] = [];

    // NPL Ratio
    if (rawData.nplRatios?.length > 0) {
      results.push({
        sectorId: 'banking',
        indicatorCode: 'NPL_RATIO',
        dataPoints: rawData.nplRatios.map((d: any) => ({
          year: d.year,
          month: d.month,
          value: d.value,
          confidence: d.confidence || 'high',
          source: d.source,
        })),
        metadata: {
          source: 'Multiple sources',
          sourceType: 'banking',
          fetchedAt: new Date(),
          transformedAt: new Date(),
        },
      });
    }

    // Deposit Growth
    if (rawData.depositGrowth?.length > 0) {
      results.push({
        sectorId: 'banking',
        indicatorCode: 'DEPOSIT_GROWTH',
        dataPoints: rawData.depositGrowth.map((d: any) => ({
          year: d.year,
          month: d.month,
          value: d.value,
          confidence: d.confidence || 'high',
          source: d.source,
        })),
        metadata: {
          source: 'Multiple sources',
          sourceType: 'banking',
          fetchedAt: new Date(),
          transformedAt: new Date(),
        },
      });
    }

    // Credit to GDP
    if (rawData.creditToGdp?.length > 0) {
      results.push({
        sectorId: 'banking',
        indicatorCode: 'CREDIT_TO_GDP',
        dataPoints: rawData.creditToGdp.map((d: any) => ({
          year: d.year,
          month: d.month,
          value: d.value,
          confidence: d.confidence || 'high',
          source: d.source,
        })),
        metadata: {
          source: 'Multiple sources',
          sourceType: 'banking',
          fetchedAt: new Date(),
          transformedAt: new Date(),
        },
      });
    }

    // Capital Adequacy Ratio
    if (rawData.capitalAdequacy?.length > 0) {
      results.push({
        sectorId: 'banking',
        indicatorCode: 'CAR',
        dataPoints: rawData.capitalAdequacy.map((d: any) => ({
          year: d.year,
          month: d.month,
          value: d.value,
          confidence: d.confidence || 'high',
          source: d.source,
        })),
        metadata: {
          source: 'Multiple sources',
          sourceType: 'banking',
          fetchedAt: new Date(),
          transformedAt: new Date(),
        },
      });
    }

    return results;
  }

  /**
   * Validate banking data
   */
  async validateData(data: TransformationResult[]): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const result of data) {
      for (const point of result.dataPoints) {
        // Validate year range
        if (point.year < 2023 || point.year > 2026) {
          errors.push(`Invalid year: ${point.year}`);
        }

        // Validate value ranges for specific indicators
        if (result.indicatorCode === 'NPL_RATIO' && (point.value! < 0 || point.value! > 100)) {
          errors.push(`NPL ratio out of range: ${point.value}%`);
        }

        if (result.indicatorCode === 'CAR' && (point.value! < 0 || point.value! > 100)) {
          errors.push(`CAR out of range: ${point.value}%`);
        }

        // Check for null values
        if (point.value === null && point.confidence !== 'proxy') {
          warnings.push(`Null value for ${result.indicatorCode} in ${point.year}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Fetch data from Central Bank of Yemen
   */
  private async fetchFromCBY(year: number): Promise<any> {
    try {
      const response = await this.fetchUrl(`${this.config.apiEndpoint}/cby/${year}`);
      return await response.json();
    } catch (error) {
      console.warn(`CBY fetch failed for ${year}:`, error);
      return {};
    }
  }

  /**
   * Fetch data from World Bank
   */
  private async fetchFromWorldBank(year: number): Promise<any> {
    try {
      const response = await this.fetchUrl(`${this.config.apiEndpoint}/worldbank/${year}`);
      return await response.json();
    } catch (error) {
      console.warn(`World Bank fetch failed for ${year}:`, error);
      return {};
    }
  }

  /**
   * Fetch data from IMF
   */
  private async fetchFromIMF(year: number): Promise<any> {
    try {
      const response = await this.fetchUrl(`${this.config.apiEndpoint}/imf/${year}`);
      return await response.json();
    } catch (error) {
      console.warn(`IMF fetch failed for ${year}:`, error);
      return {};
    }
  }
}
