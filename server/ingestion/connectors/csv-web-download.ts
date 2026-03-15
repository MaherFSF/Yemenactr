/**
 * CSV Web Download Connector
 * 
 * Downloads and parses CSV files from public URLs
 * Stores raw CSV as evidence, parses into structured data
 */

import axios from 'axios';
import crypto from 'crypto';
import { parse } from 'csv-parse/sync';
import { db } from '../../db';
import { rawObjects, timeSeries } from '../../../drizzle/schema';

export interface CsvConnectorConfig {
  url: string;
  parseOptions?: {
    columns?: boolean | string[];
    skip_empty_lines?: boolean;
    delimiter?: string;
  };
  columnMapping: {
    date?: string;
    value?: string;
    indicator?: string;
    geography?: string;
  };
}

export class CsvWebDownloadConnector {
  private sourceRegistryId: number;
  
  constructor(sourceRegistryId: number) {
    this.sourceRegistryId = sourceRegistryId;
  }
  
  async download(url: string): Promise<string> {
    console.log(`  📥 Downloading CSV from: ${url}`);
    const response = await axios.get(url, { responseType: 'text' });
    return response.data;
  }
  
  async storeRaw(runId: number, url: string, content: string): Promise<number> {
    const sha256 = crypto.createHash('sha256').update(content).digest('hex');
    
    const existing = await db
      .select({ id: rawObjects.id })
      .from(rawObjects)
      .where(eq(rawObjects.sha256, sha256))
      .limit(1);
    
    if (existing.length > 0) {
      console.log(`  ℹ️  CSV already stored (SHA256: ${sha256.substring(0, 16)}...)`);
      return existing[0].id;
    }
    
    const storageUri = `raw/csv/${this.sourceRegistryId}/${sha256}.csv`;
    
    const result = await db.insert(rawObjects).values({
      sourceRegistryId: this.sourceRegistryId,
      ingestionRunId: runId,
      contentType: 'text/csv',
      canonicalUrl: url,
      retrievalTs: new Date(),
      sha256,
      fileSize: content.length,
      storageUri,
      status: 'active'
    });
    
    return result[0].insertId;
  }
  
  async parseCsv(
    content: string,
    config: CsvConnectorConfig
  ): Promise<any[]> {
    const options = {
      columns: true,
      skip_empty_lines: true,
      ...config.parseOptions
    };
    
    const records = parse(content, options);
    console.log(`  📊 Parsed ${records.length} rows from CSV`);
    
    return records;
  }
  
  async ingest(
    runId: number,
    config: CsvConnectorConfig
  ): Promise<{
    fetched: number;
    stored: number;
    errors: string[];
  }> {
    const result = {
      fetched: 0,
      stored: 0,
      errors: []
    };
    
    try {
      // Download CSV
      const content = await this.download(config.url);
      result.fetched = 1;
      
      // Store raw
      const rawObjectId = await this.storeRaw(runId, config.url, content);
      
      // Parse
      const records = await this.parseCsv(content, config);
      
      // Store parsed data (simplified - in production, create dataset/version)
      for (const record of records) {
        // Extract fields based on column mapping
        const dateField = config.columnMapping.date || 'date';
        const valueField = config.columnMapping.value || 'value';
        
        if (!record[dateField] || !record[valueField]) {
          continue;
        }
        
        try {
          await db.insert(timeSeries).values({
            indicatorId: null,
            date: new Date(record[dateField]),
            value: parseFloat(record[valueField]),
            valueText: String(record[valueField]),
            unit: 'number',
            regimeTag: 'UNIFIED',
            geography: record[config.columnMapping.geography || 'geography'] || null,
            frequencyCode: 'ANNUAL',
            sourceId: this.sourceRegistryId,
            rawObjectId: rawObjectId,
            vintageDate: new Date(),
            confidenceScore: 80,
            qualityFlags: null,
            notes: null
          });
          
          result.stored++;
        } catch (err: any) {
          result.errors.push(`Row parse error: ${err.message}`);
        }
      }
      
      console.log(`  ✅ Stored ${result.stored} records from CSV`);
      
    } catch (error: any) {
      result.errors.push(error.message);
      console.error(`  ❌ CSV ingestion error: ${error.message}`);
    }
    
    return result;
  }
}
