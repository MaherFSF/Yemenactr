/**
 * YETO Platform - Data Vintages Service
 * Section 8D: Data Governance - Versioning & Vintages
 * 
 * Preserves "as-of" views with revision history:
 * - Tracks all versions of data points
 * - Implements diff viewer for comparing versions
 * - Stores vintage metadata with timestamps
 */

import { getDb } from '../db';
import { dataVintages, sources } from '../../drizzle/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

// Types for data vintages
export interface VintageInput {
  dataPointId: number;
  dataPointType: 'time_series' | 'geospatial' | 'document';
  vintageDate: Date;
  value: number;
  previousValue?: number;
  changeType: 'initial' | 'revision' | 'correction' | 'restatement';
  changeReason?: string;
  sourceId?: number;
  confidenceRating?: 'A' | 'B' | 'C' | 'D';
  createdBy: string;
}

export interface VintageRecord {
  id: number;
  dataPointId: number;
  dataPointType: string;
  vintageDate: Date;
  value: number;
  previousValue?: number;
  changeType: 'initial' | 'revision' | 'correction' | 'restatement';
  changeReason?: string;
  changeMagnitude?: number;
  sourceId?: number;
  sourceName?: string;
  confidenceRating?: 'A' | 'B' | 'C' | 'D';
  createdBy: string;
  createdAt: Date;
}

export interface VersionDiff {
  vintageDate1: Date;
  vintageDate2: Date;
  value1: number;
  value2: number;
  absoluteChange: number;
  percentChange: number;
  changeType: string;
  changeReason?: string;
}

export class DataVintagesService {
  
  /**
   * Record a new vintage (version) of a data point
   */
  async recordVintage(input: VintageInput): Promise<VintageRecord> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    // Calculate change magnitude if previous value exists
    let changeMagnitude: number | undefined;
    if (input.previousValue !== undefined && input.previousValue !== 0) {
      changeMagnitude = ((input.value - input.previousValue) / input.previousValue) * 100;
    }
    
    // Insert vintage record
    const result = await db.insert(dataVintages).values({
      dataPointId: input.dataPointId,
      dataPointType: input.dataPointType,
      vintageDate: input.vintageDate,
      value: input.value.toString(),
      previousValue: input.previousValue?.toString(),
      changeType: input.changeType,
      changeReason: input.changeReason,
      changeMagnitude: changeMagnitude?.toFixed(4),
      sourceId: input.sourceId,
      confidenceRating: input.confidenceRating,
      createdBy: input.createdBy,
    });
    
    const insertId = Number((result as unknown as { insertId: number }).insertId);
    
    // Get source name if applicable
    let sourceName: string | undefined;
    if (input.sourceId) {
      const sourceResults = await db.select().from(sources).where(eq(sources.id, input.sourceId));
      sourceName = sourceResults[0]?.publisher;
    }
    
    return {
      id: insertId,
      dataPointId: input.dataPointId,
      dataPointType: input.dataPointType,
      vintageDate: input.vintageDate,
      value: input.value,
      previousValue: input.previousValue,
      changeType: input.changeType,
      changeReason: input.changeReason,
      changeMagnitude,
      sourceId: input.sourceId,
      sourceName,
      confidenceRating: input.confidenceRating,
      createdBy: input.createdBy,
      createdAt: new Date(),
    };
  }
  
  /**
   * Get all vintages for a data point
   */
  async getVintages(dataPointId: number, dataPointType: string): Promise<VintageRecord[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const results = await db.select()
      .from(dataVintages)
      .where(and(
        eq(dataVintages.dataPointId, dataPointId),
        eq(dataVintages.dataPointType, dataPointType)
      ))
      .orderBy(desc(dataVintages.vintageDate));
    
    const vintages: VintageRecord[] = [];
    
    for (const row of results) {
      let sourceName: string | undefined;
      if (row.sourceId) {
        const sourceResults = await db.select().from(sources).where(eq(sources.id, row.sourceId));
        sourceName = sourceResults[0]?.publisher;
      }
      
      vintages.push({
        id: row.id,
        dataPointId: row.dataPointId,
        dataPointType: row.dataPointType,
        vintageDate: row.vintageDate,
        value: parseFloat(row.value),
        previousValue: row.previousValue ? parseFloat(row.previousValue) : undefined,
        changeType: row.changeType,
        changeReason: row.changeReason ?? undefined,
        changeMagnitude: row.changeMagnitude ? parseFloat(row.changeMagnitude) : undefined,
        sourceId: row.sourceId ?? undefined,
        sourceName,
        confidenceRating: row.confidenceRating ?? undefined,
        createdBy: row.createdBy,
        createdAt: row.createdAt,
      });
    }
    
    return vintages;
  }
  
  /**
   * Get value as of a specific date (time travel)
   */
  async getValueAsOf(
    dataPointId: number,
    dataPointType: string,
    asOfDate: Date
  ): Promise<VintageRecord | null> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const results = await db.select()
      .from(dataVintages)
      .where(and(
        eq(dataVintages.dataPointId, dataPointId),
        eq(dataVintages.dataPointType, dataPointType),
        lte(dataVintages.vintageDate, asOfDate)
      ))
      .orderBy(desc(dataVintages.vintageDate))
      .limit(1);
    
    if (results.length === 0) return null;
    
    const row = results[0];
    let sourceName: string | undefined;
    if (row.sourceId) {
      const sourceResults = await db.select().from(sources).where(eq(sources.id, row.sourceId));
      sourceName = sourceResults[0]?.publisher;
    }
    
    return {
      id: row.id,
      dataPointId: row.dataPointId,
      dataPointType: row.dataPointType,
      vintageDate: row.vintageDate,
      value: parseFloat(row.value),
      previousValue: row.previousValue ? parseFloat(row.previousValue) : undefined,
      changeType: row.changeType,
      changeReason: row.changeReason ?? undefined,
      changeMagnitude: row.changeMagnitude ? parseFloat(row.changeMagnitude) : undefined,
      sourceId: row.sourceId ?? undefined,
      sourceName,
      confidenceRating: row.confidenceRating ?? undefined,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
    };
  }
  
  /**
   * Compare two vintages (diff viewer)
   */
  async compareVintages(
    dataPointId: number,
    dataPointType: string,
    date1: Date,
    date2: Date
  ): Promise<VersionDiff | null> {
    const vintage1 = await this.getValueAsOf(dataPointId, dataPointType, date1);
    const vintage2 = await this.getValueAsOf(dataPointId, dataPointType, date2);
    
    if (!vintage1 || !vintage2) return null;
    
    const absoluteChange = vintage2.value - vintage1.value;
    const percentChange = vintage1.value !== 0 
      ? (absoluteChange / vintage1.value) * 100 
      : 0;
    
    return {
      vintageDate1: vintage1.vintageDate,
      vintageDate2: vintage2.vintageDate,
      value1: vintage1.value,
      value2: vintage2.value,
      absoluteChange,
      percentChange,
      changeType: vintage2.changeType,
      changeReason: vintage2.changeReason,
    };
  }
  
  /**
   * Get revision history summary
   */
  async getRevisionSummary(dataPointId: number, dataPointType: string): Promise<{
    totalRevisions: number;
    initialValue: number;
    currentValue: number;
    totalChange: number;
    totalChangePercent: number;
    revisionTypes: Record<string, number>;
    lastRevisionDate: Date | null;
  }> {
    const vintages = await this.getVintages(dataPointId, dataPointType);
    
    if (vintages.length === 0) {
      return {
        totalRevisions: 0,
        initialValue: 0,
        currentValue: 0,
        totalChange: 0,
        totalChangePercent: 0,
        revisionTypes: {},
        lastRevisionDate: null,
      };
    }
    
    // Vintages are ordered desc, so first is current, last is initial
    const currentValue = vintages[0].value;
    const initialValue = vintages[vintages.length - 1].value;
    const totalChange = currentValue - initialValue;
    const totalChangePercent = initialValue !== 0 
      ? (totalChange / initialValue) * 100 
      : 0;
    
    const revisionTypes: Record<string, number> = {
      initial: 0,
      revision: 0,
      correction: 0,
      restatement: 0,
    };
    
    for (const vintage of vintages) {
      revisionTypes[vintage.changeType]++;
    }
    
    return {
      totalRevisions: vintages.length,
      initialValue,
      currentValue,
      totalChange,
      totalChangePercent,
      revisionTypes,
      lastRevisionDate: vintages[0].vintageDate,
    };
  }
  
  /**
   * Get all vintages within a date range
   */
  async getVintagesInRange(
    dataPointId: number,
    dataPointType: string,
    startDate: Date,
    endDate: Date
  ): Promise<VintageRecord[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const results = await db.select()
      .from(dataVintages)
      .where(and(
        eq(dataVintages.dataPointId, dataPointId),
        eq(dataVintages.dataPointType, dataPointType),
        gte(dataVintages.vintageDate, startDate),
        lte(dataVintages.vintageDate, endDate)
      ))
      .orderBy(desc(dataVintages.vintageDate));
    
    return results.map(row => ({
      id: row.id,
      dataPointId: row.dataPointId,
      dataPointType: row.dataPointType,
      vintageDate: row.vintageDate,
      value: parseFloat(row.value),
      previousValue: row.previousValue ? parseFloat(row.previousValue) : undefined,
      changeType: row.changeType,
      changeReason: row.changeReason ?? undefined,
      changeMagnitude: row.changeMagnitude ? parseFloat(row.changeMagnitude) : undefined,
      sourceId: row.sourceId ?? undefined,
      confidenceRating: row.confidenceRating ?? undefined,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
    }));
  }
  
  /**
   * Generate vintage timeline for visualization
   */
  async generateTimeline(
    dataPointId: number,
    dataPointType: string
  ): Promise<{
    date: Date;
    value: number;
    changeType: string;
    label: string;
  }[]> {
    const vintages = await this.getVintages(dataPointId, dataPointType);
    
    return vintages.reverse().map((v, index) => ({
      date: v.vintageDate,
      value: v.value,
      changeType: v.changeType,
      label: index === 0 
        ? 'Initial Value' 
        : `${v.changeType.charAt(0).toUpperCase() + v.changeType.slice(1)}${v.changeMagnitude ? ` (${v.changeMagnitude > 0 ? '+' : ''}${v.changeMagnitude.toFixed(2)}%)` : ''}`,
    }));
  }
}

// Export singleton instance
export const dataVintagesService = new DataVintagesService();
