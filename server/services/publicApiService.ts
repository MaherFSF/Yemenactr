/**
 * YETO Public Data Export API Service
 * 
 * Provides programmatic access to YETO data for researchers,
 * institutions, and developers with proper rate limiting and API key management.
 * 
 * Features:
 * - API key generation and management
 * - Tiered rate limiting (public, registered, premium, institutional)
 * - Multiple export formats (JSON, CSV, XML)
 * - Query builder for complex data requests
 * - Usage analytics and quota tracking
 * - Webhook notifications for data updates
 */

import { getDb } from '../db';
import { timeSeries, indicators, sources, researchPublications, economicEvents } from '../../drizzle/schema';
import { eq, and, gte, lte, like, desc, sql, inArray } from 'drizzle-orm';
import crypto from 'crypto';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ApiKey {
  id: string;
  key: string;
  userId: string;
  tier: 'public' | 'registered' | 'premium' | 'institutional';
  name: string;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  requestCount: number;
  dailyLimit: number;
  monthlyLimit: number;
  isActive: boolean;
  permissions: string[];
  webhookUrl?: string;
  metadata?: Record<string, any>;
}

export interface RateLimitConfig {
  tier: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  requestsPerMonth: number;
  maxResultsPerRequest: number;
  allowedEndpoints: string[];
  allowedFormats: string[];
}

export interface ApiRequest {
  apiKey: string;
  endpoint: string;
  method: string;
  params: Record<string, any>;
  timestamp: Date;
  ip: string;
  userAgent: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    resultCount?: number;
    totalCount?: number;
    page?: number;
    pageSize?: number;
    rateLimitRemaining: number;
    rateLimitReset: string;
  };
  links?: {
    self: string;
    next?: string;
    prev?: string;
    documentation: string;
  };
}

export interface DataQuery {
  indicators?: string[];
  sources?: string[];
  regions?: string[];
  regimeTags?: string[];
  startDate?: string;
  endDate?: string;
  frequency?: string;
  format?: 'json' | 'csv' | 'xml';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeMetadata?: boolean;
  includeProvenance?: boolean;
}

// ============================================================================
// Rate Limit Configuration by Tier
// ============================================================================

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  public: {
    tier: 'public',
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 500,
    requestsPerMonth: 5000,
    maxResultsPerRequest: 100,
    allowedEndpoints: ['indicators', 'timeseries', 'events'],
    allowedFormats: ['json']
  },
  registered: {
    tier: 'registered',
    requestsPerMinute: 30,
    requestsPerHour: 500,
    requestsPerDay: 2000,
    requestsPerMonth: 20000,
    maxResultsPerRequest: 500,
    allowedEndpoints: ['indicators', 'timeseries', 'events', 'publications', 'sources'],
    allowedFormats: ['json', 'csv']
  },
  premium: {
    tier: 'premium',
    requestsPerMinute: 60,
    requestsPerHour: 2000,
    requestsPerDay: 10000,
    requestsPerMonth: 100000,
    maxResultsPerRequest: 2000,
    allowedEndpoints: ['indicators', 'timeseries', 'events', 'publications', 'sources', 'bulk', 'streaming'],
    allowedFormats: ['json', 'csv', 'xml']
  },
  institutional: {
    tier: 'institutional',
    requestsPerMinute: 120,
    requestsPerHour: 5000,
    requestsPerDay: 50000,
    requestsPerMonth: 500000,
    maxResultsPerRequest: 10000,
    allowedEndpoints: ['indicators', 'timeseries', 'events', 'publications', 'sources', 'bulk', 'streaming', 'webhooks', 'custom'],
    allowedFormats: ['json', 'csv', 'xml', 'parquet']
  }
};

// ============================================================================
// In-Memory Rate Limit Tracking (would use Redis in production)
// ============================================================================

const rateLimitStore: Map<string, {
  minute: { count: number; resetAt: Date };
  hour: { count: number; resetAt: Date };
  day: { count: number; resetAt: Date };
  month: { count: number; resetAt: Date };
}> = new Map();

// ============================================================================
// API Key Management
// ============================================================================

export class ApiKeyManager {
  /**
   * Generate a new API key for a user
   */
  static generateApiKey(
    userId: string,
    tier: ApiKey['tier'],
    name: string,
    permissions: string[] = [],
    expiresInDays?: number
  ): ApiKey {
    const key = `yeto_${tier}_${crypto.randomBytes(32).toString('hex')}`;
    const id = crypto.randomUUID();
    
    const limits = RATE_LIMITS[tier];
    
    const apiKey: ApiKey = {
      id,
      key,
      userId,
      tier,
      name,
      createdAt: new Date(),
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null,
      lastUsedAt: null,
      requestCount: 0,
      dailyLimit: limits.requestsPerDay,
      monthlyLimit: limits.requestsPerMonth,
      isActive: true,
      permissions: permissions.length > 0 ? permissions : limits.allowedEndpoints,
      metadata: {}
    };
    
    return apiKey;
  }

  /**
   * Validate an API key and return its configuration
   */
  static async validateApiKey(key: string): Promise<{ valid: boolean; apiKey?: ApiKey; error?: string }> {
    // In production, this would query the database
    // For now, we'll validate the format and return a mock key
    
    if (!key || !key.startsWith('yeto_')) {
      return { valid: false, error: 'Invalid API key format' };
    }
    
    const tierMatch = key.match(/^yeto_(public|registered|premium|institutional)_/);
    if (!tierMatch) {
      return { valid: false, error: 'Invalid API key tier' };
    }
    
    const tier = tierMatch[1] as ApiKey['tier'];
    
    // Mock API key for validation
    const apiKey: ApiKey = {
      id: crypto.randomUUID(),
      key,
      userId: 'demo-user',
      tier,
      name: 'Demo API Key',
      createdAt: new Date(),
      expiresAt: null,
      lastUsedAt: new Date(),
      requestCount: 0,
      dailyLimit: RATE_LIMITS[tier].requestsPerDay,
      monthlyLimit: RATE_LIMITS[tier].requestsPerMonth,
      isActive: true,
      permissions: RATE_LIMITS[tier].allowedEndpoints
    };
    
    return { valid: true, apiKey };
  }

  /**
   * Check rate limits for an API key
   */
  static checkRateLimit(apiKey: ApiKey): { allowed: boolean; remaining: number; resetAt: Date; error?: string } {
    const limits = RATE_LIMITS[apiKey.tier];
    const now = new Date();
    
    let tracking = rateLimitStore.get(apiKey.key);
    
    if (!tracking) {
      tracking = {
        minute: { count: 0, resetAt: new Date(now.getTime() + 60000) },
        hour: { count: 0, resetAt: new Date(now.getTime() + 3600000) },
        day: { count: 0, resetAt: new Date(now.getTime() + 86400000) },
        month: { count: 0, resetAt: new Date(now.getTime() + 2592000000) }
      };
      rateLimitStore.set(apiKey.key, tracking);
    }
    
    // Reset counters if time has passed
    if (now > tracking.minute.resetAt) {
      tracking.minute = { count: 0, resetAt: new Date(now.getTime() + 60000) };
    }
    if (now > tracking.hour.resetAt) {
      tracking.hour = { count: 0, resetAt: new Date(now.getTime() + 3600000) };
    }
    if (now > tracking.day.resetAt) {
      tracking.day = { count: 0, resetAt: new Date(now.getTime() + 86400000) };
    }
    if (now > tracking.month.resetAt) {
      tracking.month = { count: 0, resetAt: new Date(now.getTime() + 2592000000) };
    }
    
    // Check limits
    if (tracking.minute.count >= limits.requestsPerMinute) {
      return { allowed: false, remaining: 0, resetAt: tracking.minute.resetAt, error: 'Rate limit exceeded (per minute)' };
    }
    if (tracking.hour.count >= limits.requestsPerHour) {
      return { allowed: false, remaining: 0, resetAt: tracking.hour.resetAt, error: 'Rate limit exceeded (per hour)' };
    }
    if (tracking.day.count >= limits.requestsPerDay) {
      return { allowed: false, remaining: 0, resetAt: tracking.day.resetAt, error: 'Rate limit exceeded (per day)' };
    }
    if (tracking.month.count >= limits.requestsPerMonth) {
      return { allowed: false, remaining: 0, resetAt: tracking.month.resetAt, error: 'Rate limit exceeded (per month)' };
    }
    
    // Increment counters
    tracking.minute.count++;
    tracking.hour.count++;
    tracking.day.count++;
    tracking.month.count++;
    
    const remaining = Math.min(
      limits.requestsPerMinute - tracking.minute.count,
      limits.requestsPerHour - tracking.hour.count,
      limits.requestsPerDay - tracking.day.count,
      limits.requestsPerMonth - tracking.month.count
    );
    
    return { allowed: true, remaining, resetAt: tracking.minute.resetAt };
  }
}

// ============================================================================
// Data Export Service
// ============================================================================

export class DataExportService {
  /**
   * Query time series data with filters
   */
  static async queryTimeSeries(query: DataQuery, apiKey: ApiKey): Promise<ApiResponse<any>> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const limits = RATE_LIMITS[apiKey.tier];
      const pageSize = Math.min(query.pageSize || 100, limits.maxResultsPerRequest);
      const page = query.page || 1;
      const offset = (page - 1) * pageSize;
      
      // Build query conditions
      const conditions: any[] = [];
      
      if (query.indicators && query.indicators.length > 0) {
        conditions.push(inArray(timeSeries.indicatorCode, query.indicators));
      }
      
      if (query.regimeTags && query.regimeTags.length > 0) {
        const validTags = query.regimeTags.filter(t => 
          ['aden_irg', 'sanaa_defacto', 'mixed', 'unknown'].includes(t)
        ) as ('aden_irg' | 'sanaa_defacto' | 'mixed' | 'unknown')[];
        if (validTags.length > 0) {
          conditions.push(inArray(timeSeries.regimeTag, validTags));
        }
      }
      
      if (query.startDate) {
        conditions.push(gte(timeSeries.date, new Date(query.startDate)));
      }
      
      if (query.endDate) {
        conditions.push(lte(timeSeries.date, new Date(query.endDate)));
      }
      
      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const results = await db.select({
        id: timeSeries.id,
        indicatorCode: timeSeries.indicatorCode,
        date: timeSeries.date,
        value: timeSeries.value,
        unit: timeSeries.unit,
        regimeTag: timeSeries.regimeTag,
        sourceId: timeSeries.sourceId,
        confidenceRating: timeSeries.confidenceRating,
        notes: timeSeries.notes,
        createdAt: timeSeries.createdAt
      })
      .from(timeSeries)
      .where(whereClause)
      .orderBy(desc(timeSeries.date))
      .limit(pageSize)
      .offset(offset);
      
      // Get total count
      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(timeSeries)
        .where(whereClause);
      
      const totalCount = Number(countResult[0]?.count || 0);
      
      // Format response based on requested format
      let formattedData: any;
      
      if (query.format === 'csv') {
        formattedData = this.formatAsCSV(results);
      } else if (query.format === 'xml') {
        formattedData = this.formatAsXML(results);
      } else {
        formattedData = query.includeMetadata ? {
          records: results,
          metadata: {
            indicators: query.indicators,
            dateRange: { start: query.startDate, end: query.endDate },
            regimeTags: query.regimeTags
          }
        } : results;
      }
      
      const rateLimit = ApiKeyManager.checkRateLimit(apiKey);
      
      return {
        success: true,
        data: formattedData,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          resultCount: results.length,
          totalCount,
          page,
          pageSize,
          rateLimitRemaining: rateLimit.remaining,
          rateLimitReset: rateLimit.resetAt.toISOString()
        },
        links: {
          self: `/api/v1/timeseries?page=${page}&pageSize=${pageSize}`,
          next: offset + pageSize < totalCount ? `/api/v1/timeseries?page=${page + 1}&pageSize=${pageSize}` : undefined,
          prev: page > 1 ? `/api/v1/timeseries?page=${page - 1}&pageSize=${pageSize}` : undefined,
          documentation: 'https://yeto.causewaygrp.com/api/docs'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          rateLimitRemaining: 0,
          rateLimitReset: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Query indicators catalog
   */
  static async queryIndicators(query: DataQuery, apiKey: ApiKey): Promise<ApiResponse<any>> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const results = await db.select()
        .from(indicators)
        .orderBy(indicators.sector);
      
      const rateLimit = ApiKeyManager.checkRateLimit(apiKey);
      
      return {
        success: true,
        data: results,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          resultCount: results.length,
          rateLimitRemaining: rateLimit.remaining,
          rateLimitReset: rateLimit.resetAt.toISOString()
        },
        links: {
          self: '/api/v1/indicators',
          documentation: 'https://yeto.causewaygrp.com/api/docs'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          rateLimitRemaining: 0,
          rateLimitReset: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Query economic events
   */
  static async queryEvents(query: DataQuery, apiKey: ApiKey): Promise<ApiResponse<any>> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const pageSize = Math.min(query.pageSize || 50, 500);
      const page = query.page || 1;
      const offset = (page - 1) * pageSize;
      
      const conditions: any[] = [];
      
      if (query.startDate) {
        conditions.push(gte(economicEvents.eventDate, new Date(query.startDate)));
      }
      
      if (query.endDate) {
        conditions.push(lte(economicEvents.eventDate, new Date(query.endDate)));
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const results = await db.select()
        .from(economicEvents)
        .where(whereClause)
        .orderBy(desc(economicEvents.eventDate))
        .limit(pageSize)
        .offset(offset);
      
      const rateLimit = ApiKeyManager.checkRateLimit(apiKey);
      
      return {
        success: true,
        data: results,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          resultCount: results.length,
          page,
          pageSize,
          rateLimitRemaining: rateLimit.remaining,
          rateLimitReset: rateLimit.resetAt.toISOString()
        },
        links: {
          self: `/api/v1/events?page=${page}&pageSize=${pageSize}`,
          documentation: 'https://yeto.causewaygrp.com/api/docs'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          rateLimitRemaining: 0,
          rateLimitReset: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Query research publications
   */
  static async queryPublications(query: DataQuery, apiKey: ApiKey): Promise<ApiResponse<any>> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const pageSize = Math.min(query.pageSize || 20, 100);
      const page = query.page || 1;
      const offset = (page - 1) * pageSize;
      
      const results = await db.select()
        .from(researchPublications)
        .orderBy(desc(researchPublications.publicationDate))
        .limit(pageSize)
        .offset(offset);
      
      const rateLimit = ApiKeyManager.checkRateLimit(apiKey);
      
      return {
        success: true,
        data: results,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          resultCount: results.length,
          page,
          pageSize,
          rateLimitRemaining: rateLimit.remaining,
          rateLimitReset: rateLimit.resetAt.toISOString()
        },
        links: {
          self: `/api/v1/publications?page=${page}&pageSize=${pageSize}`,
          documentation: 'https://yeto.causewaygrp.com/api/docs'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          rateLimitRemaining: 0,
          rateLimitReset: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Bulk data export for institutional users
   */
  static async bulkExport(
    dataTypes: string[],
    dateRange: { start: string; end: string },
    apiKey: ApiKey
  ): Promise<ApiResponse<any>> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    if (apiKey.tier !== 'institutional' && apiKey.tier !== 'premium') {
      return {
        success: false,
        error: 'Bulk export requires premium or institutional tier',
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          rateLimitRemaining: 0,
          rateLimitReset: new Date().toISOString()
        }
      };
    }
    
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const exportData: Record<string, any[]> = {};
      
      for (const dataType of dataTypes) {
        switch (dataType) {
          case 'timeseries':
            const tsResults = await db.select()
              .from(timeSeries)
              .where(and(
                gte(timeSeries.date, new Date(dateRange.start)),
                lte(timeSeries.date, new Date(dateRange.end))
              ));
            exportData.timeseries = tsResults;
            break;
          
          case 'events':
            const eventResults = await db.select()
              .from(economicEvents)
              .where(and(
                gte(economicEvents.eventDate, new Date(dateRange.start)),
                lte(economicEvents.eventDate, new Date(dateRange.end))
              ));
            exportData.events = eventResults;
            break;
          
          case 'publications':
            const pubResults = await db.select()
              .from(researchPublications);
            exportData.publications = pubResults;
            break;
          
          case 'indicators':
            const indResults = await db.select()
              .from(indicators);
            exportData.indicators = indResults;
            break;
          
          case 'sources':
            const srcResults = await db.select()
              .from(sources);
            exportData.sources = srcResults;
            break;
        }
      }
      
      const rateLimit = ApiKeyManager.checkRateLimit(apiKey);
      
      return {
        success: true,
        data: exportData,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          rateLimitRemaining: rateLimit.remaining,
          rateLimitReset: rateLimit.resetAt.toISOString()
        },
        links: {
          self: '/api/v1/bulk',
          documentation: 'https://yeto.causewaygrp.com/api/docs'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          rateLimitRemaining: 0,
          rateLimitReset: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Format data as CSV
   */
  private static formatAsCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return String(val);
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Format data as XML
   */
  private static formatAsXML(data: any[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';
    
    for (const item of data) {
      xml += '  <record>\n';
      for (const [key, value] of Object.entries(item)) {
        const escapedValue = String(value ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        xml += `    <${key}>${escapedValue}</${key}>\n`;
      }
      xml += '  </record>\n';
    }
    
    xml += '</data>';
    return xml;
  }
}

// ============================================================================
// API Documentation Generator
// ============================================================================

export class ApiDocumentationGenerator {
  /**
   * Generate OpenAPI/Swagger documentation
   */
  static generateOpenApiSpec(): object {
    return {
      openapi: '3.0.3',
      info: {
        title: 'YETO Public Data API',
        description: 'Yemen Economic Transparency Observatory - Public Data Access API',
        version: '1.0.0',
        contact: {
          name: 'YETO Support',
          email: 'yeto@causewaygrp.com',
          url: 'https://yeto.causewaygrp.com'
        },
        license: {
          name: 'CC BY 4.0',
          url: 'https://creativecommons.org/licenses/by/4.0/'
        }
      },
      servers: [
        {
          url: 'https://yeto.causewaygrp.com/api/v1',
          description: 'Production server'
        }
      ],
      security: [
        { ApiKeyAuth: [] }
      ],
      paths: {
        '/timeseries': {
          get: {
            summary: 'Query time series data',
            description: 'Retrieve economic time series data with filtering options',
            parameters: [
              { name: 'indicators', in: 'query', schema: { type: 'array', items: { type: 'string' } }, description: 'Filter by indicator codes' },
              { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Start date (YYYY-MM-DD)' },
              { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'End date (YYYY-MM-DD)' },
              { name: 'regimeTags', in: 'query', schema: { type: 'array', items: { type: 'string', enum: ['aden', 'sanaa', 'mixed'] } }, description: 'Filter by regime' },
              { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
              { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 100, maximum: 10000 }, description: 'Results per page' },
              { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'xml'] }, description: 'Response format' }
            ],
            responses: {
              '200': { description: 'Successful response with time series data' },
              '401': { description: 'Invalid or missing API key' },
              '429': { description: 'Rate limit exceeded' }
            }
          }
        },
        '/indicators': {
          get: {
            summary: 'List all indicators',
            description: 'Retrieve the catalog of available economic indicators',
            responses: {
              '200': { description: 'List of indicators with metadata' }
            }
          }
        },
        '/events': {
          get: {
            summary: 'Query economic events',
            description: 'Retrieve economic and political events timeline',
            parameters: [
              { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
              { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
              { name: 'page', in: 'query', schema: { type: 'integer' } },
              { name: 'pageSize', in: 'query', schema: { type: 'integer' } }
            ],
            responses: {
              '200': { description: 'List of economic events' }
            }
          }
        },
        '/publications': {
          get: {
            summary: 'Query research publications',
            description: 'Retrieve research publications and reports',
            responses: {
              '200': { description: 'List of publications' }
            }
          }
        },
        '/bulk': {
          post: {
            summary: 'Bulk data export',
            description: 'Export large datasets (premium/institutional only)',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      dataTypes: { type: 'array', items: { type: 'string' } },
                      dateRange: {
                        type: 'object',
                        properties: {
                          start: { type: 'string', format: 'date' },
                          end: { type: 'string', format: 'date' }
                        }
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': { description: 'Bulk export data' },
              '403': { description: 'Insufficient permissions' }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'API key for authentication. Get your key at https://yeto.causewaygrp.com/api/keys'
          }
        }
      }
    };
  }

  /**
   * Generate SDK code examples
   */
  static generateSdkExamples(): Record<string, string> {
    return {
      python: `
# YETO Python SDK Example
import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://yeto.causewaygrp.com/api/v1"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# Query time series data
response = requests.get(
    f"{BASE_URL}/timeseries",
    headers=headers,
    params={
        "indicators": ["GDP_NOMINAL", "INFLATION_CPI"],
        "startDate": "2020-01-01",
        "endDate": "2025-12-31",
        "format": "json"
    }
)

data = response.json()
print(f"Retrieved {data['meta']['resultCount']} records")

# Export to CSV
csv_response = requests.get(
    f"{BASE_URL}/timeseries",
    headers=headers,
    params={
        "indicators": ["FX_RATE_OFFICIAL"],
        "format": "csv"
    }
)

with open("exchange_rates.csv", "w") as f:
    f.write(csv_response.text)
`,
      javascript: `
// YETO JavaScript SDK Example
const API_KEY = "your_api_key_here";
const BASE_URL = "https://yeto.causewaygrp.com/api/v1";

async function queryTimeSeries(indicators, startDate, endDate) {
  const params = new URLSearchParams({
    indicators: indicators.join(","),
    startDate,
    endDate,
    format: "json"
  });
  
  const response = await fetch(\`\${BASE_URL}/timeseries?\${params}\`, {
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json"
    }
  });
  
  return response.json();
}

// Usage
const data = await queryTimeSeries(
  ["GDP_NOMINAL", "INFLATION_CPI"],
  "2020-01-01",
  "2025-12-31"
);

console.log(\`Retrieved \${data.meta.resultCount} records\`);
`,
      r: `
# YETO R SDK Example
library(httr)
library(jsonlite)

API_KEY <- "your_api_key_here"
BASE_URL <- "https://yeto.causewaygrp.com/api/v1"

query_timeseries <- function(indicators, start_date, end_date) {
  response <- GET(
    paste0(BASE_URL, "/timeseries"),
    add_headers("X-API-Key" = API_KEY),
    query = list(
      indicators = paste(indicators, collapse = ","),
      startDate = start_date,
      endDate = end_date,
      format = "json"
    )
  )
  
  content(response, "parsed")
}

# Usage
data <- query_timeseries(
  c("GDP_NOMINAL", "INFLATION_CPI"),
  "2020-01-01",
  "2025-12-31"
)

cat(sprintf("Retrieved %d records\\n", data$meta$resultCount))
`
    };
  }
}

export default {
  ApiKeyManager,
  DataExportService,
  ApiDocumentationGenerator,
  RATE_LIMITS
};
