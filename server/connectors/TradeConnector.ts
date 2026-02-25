/**
 * Trade Sector Data Connector
 * Fetches data from UN Comtrade, World Bank, Port Authority, and other trade sources
 * Covers 2023-2026 with historical backfill
 */

import { BaseDataConnector, ConnectorConfig, TransformationResult, ValidationResult } from "../services/dataConnector";

export class TradeConnector extends BaseDataConnector {
  constructor(config: ConnectorConfig) {
    super(config);
  }

  /**
   * Fetch trade data from multiple sources
   */
  async fetchData(year?: number): Promise<any> {
    const years = year ? [year] : [2023, 2024, 2025, 2026];
    const data: any = {
      importVolumes: [],
      exportRevenues: [],
      tradeBalance: [],
      portThroughput: [],
      containerVolumes: [],
      tradingPartners: [],
    };

    for (const y of years) {
      try {
        // Fetch from UN Comtrade
        const comtradeData = await this.fetchFromComtrade(y);
        Object.assign(data, comtradeData);

        // Fetch from World Bank
        const wbData = await this.fetchFromWorldBank(y);
        Object.assign(data, wbData);

        // Fetch from Port Authority
        const portData = await this.fetchFromPortAuthority(y);
        Object.assign(data, portData);
      } catch (error) {
        console.warn(`Failed to fetch trade data for ${y}:`, error);
      }
    }

    return data;
  }

  /**
   * Transform raw trade data to YETO schema
   */
  async transformData(rawData: any): Promise<TransformationResult[]> {
    const results: TransformationResult[] = [];

    // Import Volumes
    if (rawData.importVolumes?.length > 0) {
      results.push({
        sectorId: 'trade',
        indicatorCode: 'IMPORT_VOLUME',
        dataPoints: rawData.importVolumes.map((d: any) => ({
          year: d.year,
          month: d.month,
          value: d.value,
          confidence: d.confidence || 'high',
          source: d.source,
        })),
        metadata: {
          source: 'Multiple sources',
          sourceType: 'trade',
          fetchedAt: new Date(),
          transformedAt: new Date(),
        },
      });
    }

    // Export Revenues
    if (rawData.exportRevenues?.length > 0) {
      results.push({
        sectorId: 'trade',
        indicatorCode: 'EXPORT_REVENUE',
        dataPoints: rawData.exportRevenues.map((d: any) => ({
          year: d.year,
          month: d.month,
          value: d.value,
          confidence: d.confidence || 'high',
          source: d.source,
        })),
        metadata: {
          source: 'Multiple sources',
          sourceType: 'trade',
          fetchedAt: new Date(),
          transformedAt: new Date(),
        },
      });
    }

    // Trade Balance
    if (rawData.tradeBalance?.length > 0) {
      results.push({
        sectorId: 'trade',
        indicatorCode: 'TRADE_BALANCE',
        dataPoints: rawData.tradeBalance.map((d: any) => ({
          year: d.year,
          month: d.month,
          value: d.value,
          confidence: d.confidence || 'high',
          source: d.source,
        })),
        metadata: {
          source: 'Multiple sources',
          sourceType: 'trade',
          fetchedAt: new Date(),
          transformedAt: new Date(),
        },
      });
    }

    // Port Throughput
    if (rawData.portThroughput?.length > 0) {
      results.push({
        sectorId: 'trade',
        indicatorCode: 'PORT_THROUGHPUT',
        dataPoints: rawData.portThroughput.map((d: any) => ({
          year: d.year,
          month: d.month,
          value: d.value,
          confidence: d.confidence || 'medium',
          source: d.source,
        })),
        metadata: {
          source: 'Multiple sources',
          sourceType: 'trade',
          fetchedAt: new Date(),
          transformedAt: new Date(),
        },
      });
    }

    // Container Volumes
    if (rawData.containerVolumes?.length > 0) {
      results.push({
        sectorId: 'trade',
        indicatorCode: 'CONTAINER_VOLUME',
        dataPoints: rawData.containerVolumes.map((d: any) => ({
          year: d.year,
          month: d.month,
          value: d.value,
          confidence: d.confidence || 'high',
          source: d.source,
        })),
        metadata: {
          source: 'Multiple sources',
          sourceType: 'trade',
          fetchedAt: new Date(),
          transformedAt: new Date(),
        },
      });
    }

    return results;
  }

  /**
   * Validate trade data
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

        // Validate value ranges
        if (point.value !== null && point.value < 0) {
          errors.push(`Negative value for ${result.indicatorCode}: ${point.value}`);
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
   * Fetch data from UN Comtrade
   */
  private async fetchFromComtrade(year: number): Promise<any> {
    try {
      const response = await this.fetchUrl(`${this.config.apiEndpoint}/comtrade/${year}`);
      return await response.json();
    } catch (error) {
      console.warn(`UN Comtrade fetch failed for ${year}:`, error);
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
   * Fetch data from Port Authority
   */
  private async fetchFromPortAuthority(year: number): Promise<any> {
    try {
      const response = await this.fetchUrl(`${this.config.apiEndpoint}/port-authority/${year}`);
      return await response.json();
    } catch (error) {
      console.warn(`Port Authority fetch failed for ${year}:`, error);
      return {};
    }
  }
}
