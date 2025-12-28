/**
 * YETO Data Pipeline - Storage & Indexing
 * Time Series Store, Search Index, Cache Layer
 */

import { DataRecord } from './validation';

// ============================================
// TIME SERIES STORE
// ============================================

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface TimeSeriesQuery {
  indicator: string;
  sourceId?: string;
  regime?: 'aden' | 'sanaa' | 'both' | 'international';
  startDate?: Date;
  endDate?: Date;
  granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'last';
}

class TimeSeriesStore {
  private data: Map<string, TimeSeriesPoint[]> = new Map();
  
  /**
   * Generate key for time series
   */
  private getKey(indicator: string, sourceId: string, regime?: string): string {
    return `${indicator}:${sourceId}:${regime || 'all'}`;
  }
  
  /**
   * Insert a data point
   */
  insert(record: DataRecord): void {
    const key = this.getKey(record.indicator, record.sourceId, record.regime);
    
    if (!this.data.has(key)) {
      this.data.set(key, []);
    }
    
    const series = this.data.get(key)!;
    series.push({
      timestamp: new Date(record.date),
      value: record.value,
      metadata: record.metadata
    });
    
    // Keep sorted by timestamp
    series.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  /**
   * Bulk insert records
   */
  bulkInsert(records: DataRecord[]): number {
    let inserted = 0;
    for (const record of records) {
      this.insert(record);
      inserted++;
    }
    return inserted;
  }
  
  /**
   * Query time series data
   */
  query(q: TimeSeriesQuery): TimeSeriesPoint[] {
    const results: TimeSeriesPoint[] = [];
    
    for (const [key, series] of Array.from(this.data.entries())) {
      const [indicator, sourceId, regime] = key.split(':');
      
      // Filter by indicator
      if (indicator !== q.indicator) continue;
      
      // Filter by source
      if (q.sourceId && sourceId !== q.sourceId) continue;
      
      // Filter by regime
      if (q.regime && regime !== q.regime && regime !== 'all') continue;
      
      // Filter by date range
      let filtered = series;
      if (q.startDate) {
        filtered = filtered.filter(p => p.timestamp >= q.startDate!);
      }
      if (q.endDate) {
        filtered = filtered.filter(p => p.timestamp <= q.endDate!);
      }
      
      results.push(...filtered);
    }
    
    // Sort by timestamp
    results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Apply aggregation if specified
    if (q.granularity && q.aggregation) {
      return this.aggregate(results, q.granularity, q.aggregation);
    }
    
    return results;
  }
  
  /**
   * Aggregate time series data
   */
  private aggregate(
    points: TimeSeriesPoint[],
    granularity: TimeSeriesQuery['granularity'],
    aggregation: TimeSeriesQuery['aggregation']
  ): TimeSeriesPoint[] {
    if (points.length === 0) return [];
    
    const buckets = new Map<string, number[]>();
    
    for (const point of points) {
      const bucketKey = this.getBucketKey(point.timestamp, granularity!);
      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, []);
      }
      buckets.get(bucketKey)!.push(point.value);
    }
    
    const result: TimeSeriesPoint[] = [];
    
    for (const [bucketKey, values] of Array.from(buckets.entries())) {
      let aggregatedValue: number;
      
      switch (aggregation) {
        case 'sum':
          aggregatedValue = values.reduce((a, b) => a + b, 0);
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'last':
          aggregatedValue = values[values.length - 1];
          break;
        case 'avg':
        default:
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
      }
      
      result.push({
        timestamp: new Date(bucketKey),
        value: aggregatedValue
      });
    }
    
    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  /**
   * Get bucket key for aggregation
   */
  private getBucketKey(date: Date, granularity: string): string {
    const d = new Date(date);
    
    switch (granularity) {
      case 'hourly':
        d.setMinutes(0, 0, 0);
        break;
      case 'daily':
        d.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        break;
      case 'monthly':
        d.setHours(0, 0, 0, 0);
        d.setDate(1);
        break;
      case 'yearly':
        d.setHours(0, 0, 0, 0);
        d.setMonth(0, 1);
        break;
    }
    
    return d.toISOString();
  }
  
  /**
   * Get latest value for an indicator
   */
  getLatest(indicator: string, sourceId?: string, regime?: string): TimeSeriesPoint | null {
    const q: TimeSeriesQuery = { indicator, sourceId, regime: regime as any };
    const results = this.query(q);
    return results.length > 0 ? results[results.length - 1] : null;
  }
  
  /**
   * Get statistics for a time series
   */
  getStatistics(q: TimeSeriesQuery): {
    count: number;
    min: number;
    max: number;
    avg: number;
    stdDev: number;
    trend: 'up' | 'down' | 'stable';
  } | null {
    const points = this.query(q);
    if (points.length === 0) return null;
    
    const values = points.map(p => p.value);
    const count = values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / count;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / count;
    const stdDev = Math.sqrt(variance);
    
    // Calculate trend using simple linear regression
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (count >= 2) {
      const firstHalf = values.slice(0, Math.floor(count / 2));
      const secondHalf = values.slice(Math.floor(count / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const change = (secondAvg - firstAvg) / firstAvg;
      
      if (change > 0.05) trend = 'up';
      else if (change < -0.05) trend = 'down';
    }
    
    return { count, min, max, avg, stdDev, trend };
  }
}

// ============================================
// SEARCH INDEX
// ============================================

export interface SearchDocument {
  id: string;
  type: 'indicator' | 'report' | 'dataset' | 'event' | 'entity';
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  keywords: string[];
  sector?: string;
  regime?: string;
  date?: Date;
  metadata?: Record<string, unknown>;
}

export interface SearchQuery {
  query: string;
  type?: SearchDocument['type'];
  sector?: string;
  regime?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
  highlights: string[];
}

class SearchIndex {
  private documents: Map<string, SearchDocument> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map();
  
  /**
   * Index a document
   */
  index(doc: SearchDocument): void {
    this.documents.set(doc.id, doc);
    
    // Build inverted index
    const tokens = this.tokenize(doc);
    for (const token of tokens) {
      if (!this.invertedIndex.has(token)) {
        this.invertedIndex.set(token, new Set());
      }
      this.invertedIndex.get(token)!.add(doc.id);
    }
  }
  
  /**
   * Bulk index documents
   */
  bulkIndex(docs: SearchDocument[]): number {
    let indexed = 0;
    for (const doc of docs) {
      this.index(doc);
      indexed++;
    }
    return indexed;
  }
  
  /**
   * Search documents
   */
  search(q: SearchQuery): SearchResult[] {
    const queryTokens = this.tokenize({ 
      id: '', 
      type: 'indicator', 
      title: q.query, 
      keywords: q.query.split(' ') 
    });
    
    // Find candidate documents
    const candidateScores = new Map<string, number>();
    
    for (const token of queryTokens) {
      const matchingDocs = this.invertedIndex.get(token);
      if (matchingDocs) {
        for (const docId of Array.from(matchingDocs)) {
          candidateScores.set(docId, (candidateScores.get(docId) || 0) + 1);
        }
      }
    }
    
    // Score and filter candidates
    const results: SearchResult[] = [];
    
    for (const [docId, tokenMatches] of Array.from(candidateScores.entries())) {
      const doc = this.documents.get(docId);
      if (!doc) continue;
      
      // Apply filters
      if (q.type && doc.type !== q.type) continue;
      if (q.sector && doc.sector !== q.sector) continue;
      if (q.regime && doc.regime !== q.regime) continue;
      
      // Calculate score (TF-IDF simplified)
      const score = tokenMatches / queryTokens.length;
      
      // Find highlights
      const highlights = this.findHighlights(doc, queryTokens);
      
      results.push({ document: doc, score, highlights });
    }
    
    // Sort by score
    results.sort((a, b) => b.score - a.score);
    
    // Apply pagination
    const offset = q.offset || 0;
    const limit = q.limit || 20;
    
    return results.slice(offset, offset + limit);
  }
  
  /**
   * Tokenize document for indexing
   */
  private tokenize(doc: Partial<SearchDocument>): string[] {
    const text = [
      doc.title || '',
      doc.titleAr || '',
      doc.description || '',
      doc.descriptionAr || '',
      ...(doc.keywords || [])
    ].join(' ').toLowerCase();
    
    // Simple tokenization - split on non-alphanumeric, filter short tokens
    return text
      .split(/[^a-z0-9\u0600-\u06FF]+/)
      .filter(t => t.length >= 2);
  }
  
  /**
   * Find text highlights for search results
   */
  private findHighlights(doc: SearchDocument, queryTokens: string[]): string[] {
    const highlights: string[] = [];
    const text = `${doc.title} ${doc.description || ''}`;
    
    for (const token of queryTokens) {
      const regex = new RegExp(`(.{0,30}${token}.{0,30})`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        highlights.push(...matches.slice(0, 2));
      }
    }
    
    return highlights.slice(0, 3);
  }
  
  /**
   * Get document by ID
   */
  get(id: string): SearchDocument | undefined {
    return this.documents.get(id);
  }
  
  /**
   * Delete document from index
   */
  delete(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;
    
    // Remove from inverted index
    const tokens = this.tokenize(doc);
    for (const token of tokens) {
      this.invertedIndex.get(token)?.delete(id);
    }
    
    this.documents.delete(id);
    return true;
  }
  
  /**
   * Get index statistics
   */
  getStatistics(): {
    documentCount: number;
    tokenCount: number;
    byType: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    
    for (const doc of Array.from(this.documents.values())) {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
    }
    
    return {
      documentCount: this.documents.size,
      tokenCount: this.invertedIndex.size,
      byType
    };
  }
}

// ============================================
// CACHE LAYER
// ============================================

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hits: number;
}

class CacheLayer {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes
  private maxSize: number = 10000;
  
  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    return entry.value;
  }
  
  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Evict if at max size
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl || this.defaultTTL),
      hits: 0
    });
  }
  
  /**
   * Delete from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Get or set with factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    
    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }
  
  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    // Find entries with lowest hits
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].hits - b[1].hits);
    
    // Remove bottom 10%
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }
  
  /**
   * Get cache statistics
   */
  getStatistics(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
  } {
    let totalHits = 0;
    for (const entry of Array.from(this.cache.values())) {
      totalHits += entry.hits;
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      totalHits
    };
  }
  
  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let invalidated = 0;
    
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    return invalidated;
  }
}

// Singleton instances
export const timeSeriesStore = new TimeSeriesStore();
export const searchIndex = new SearchIndex();
export const cacheLayer = new CacheLayer();

// ============================================
// STORAGE UTILITIES
// ============================================

/**
 * Store a data record in all relevant stores
 */
export function storeRecord(record: DataRecord): void {
  // Store in time series
  timeSeriesStore.insert(record);
  
  // Index for search
  searchIndex.index({
    id: record.id || `${record.sourceId}_${record.indicator}_${record.date}`,
    type: 'indicator',
    title: record.indicator,
    keywords: [record.indicator, record.sourceId, record.unit],
    sector: record.metadata?.sector as string,
    regime: record.regime,
    date: record.date,
    metadata: record.metadata
  });
  
  // Invalidate related cache
  cacheLayer.invalidatePattern(`indicator:${record.indicator}`);
}

/**
 * Bulk store records
 */
export function bulkStoreRecords(records: DataRecord[]): {
  timeSeriesInserted: number;
  searchIndexed: number;
} {
  const timeSeriesInserted = timeSeriesStore.bulkInsert(records);
  
  const searchDocs: SearchDocument[] = records.map(r => ({
    id: r.id || `${r.sourceId}_${r.indicator}_${r.date}`,
    type: 'indicator' as const,
    title: r.indicator,
    keywords: [r.indicator, r.sourceId, r.unit],
    sector: r.metadata?.sector as string,
    regime: r.regime,
    date: r.date,
    metadata: r.metadata
  }));
  
  const searchIndexed = searchIndex.bulkIndex(searchDocs);
  
  return { timeSeriesInserted, searchIndexed };
}
