/**
 * Source Adapters - Intelligent data fetchers for different source types
 * 
 * Each adapter implements the DataFetcher interface and handles:
 * - Authentication (if required)
 * - Rate limiting
 * - Error handling and retries
 * - Data parsing and validation
 * - Logging and monitoring
 */

import { sql } from 'drizzle-orm';
import { getDb } from '../db';

// ============================================================================
// ADAPTER INTERFACE
// ============================================================================

export interface DataFetcher {
  sourceId: string;
  indicatorCode: string;
  fetch(date: Date, regimeTag?: string): Promise<DataPoint | null>;
  validate(): Promise<ValidationResult>;
  getMetadata(): AdapterMetadata;
}

export interface DataPoint {
  value: number;
  unit: string;
  confidence: 'A' | 'B' | 'C' | 'D';
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canProceed: boolean;
}

export interface AdapterMetadata {
  adapterType: 'api' | 'scraper' | 'manual' | 'partnership';
  requiresAuth: boolean;
  rateLimit: { requests: number; perSeconds: number } | null;
  estimatedLatency: number; // milliseconds
  reliability: number; // 0-1
}

// ============================================================================
// PUBLIC API ADAPTER
// ============================================================================

export class PublicAPIAdapter implements DataFetcher {
  constructor(
    public sourceId: string,
    public indicatorCode: string,
    protected apiEndpoint: string,
    protected rateLimit: { requests: number; perSeconds: number } = { requests: 60, perSeconds: 60 }
  ) {}

  async fetch(date: Date, regimeTag?: string): Promise<DataPoint | null> {
    try {
      // Apply rate limiting
      await this.throttle();

      // Make API request
      const response = await this.makeRequest(date, regimeTag);
      
      if (!response) {
        return null;
      }

      // Parse and validate response
      return this.parseResponse(response);

    } catch (error: any) {
      console.error(`[PublicAPIAdapter] Error fetching ${this.indicatorCode} for ${date}:`, error.message);
      
      // Retry logic with exponential backoff
      if (this.shouldRetry(error)) {
        await this.sleep(1000);
        return this.fetch(date, regimeTag);
      }
      
      return null;
    }
  }

  async validate(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Test API endpoint accessibility
    try {
      const testResponse = await fetch(this.apiEndpoint, {
        method: 'GET',
        headers: { 'User-Agent': 'YETO-Platform/1.0' },
      });

      if (!testResponse.ok) {
        errors.push(`API endpoint returned ${testResponse.status}: ${testResponse.statusText}`);
      }
    } catch (error: any) {
      errors.push(`Cannot reach API endpoint: ${error.message}`);
    }

    // Check rate limits
    if (this.rateLimit.requests < 60) {
      warnings.push(`Low rate limit: ${this.rateLimit.requests} requests per ${this.rateLimit.perSeconds}s`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canProceed: errors.length === 0,
    };
  }

  getMetadata(): AdapterMetadata {
    return {
      adapterType: 'api',
      requiresAuth: false,
      rateLimit: this.rateLimit,
      estimatedLatency: 500,
      reliability: 0.95,
    };
  }

  private async makeRequest(date: Date, regimeTag?: string): Promise<any> {
    // Placeholder - actual implementation would vary by API
    // This would be overridden by specific API adapters (World Bank, IMF, etc.)
    return null;
  }

  private parseResponse(response: any): DataPoint | null {
    // Placeholder - actual parsing logic varies by API
    return null;
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, 429 (rate limit), 503 (service unavailable)
    return error.code === 'ECONNRESET' || 
           error.code === 'ETIMEDOUT' ||
           error.status === 429 ||
           error.status === 503;
  }

  private async throttle(): Promise<void> {
    // Simple throttling - in production would use token bucket or leaky bucket
    const delay = (this.rateLimit.perSeconds * 1000) / this.rateLimit.requests;
    await this.sleep(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// AUTHENTICATED API ADAPTER
// ============================================================================

export class AuthenticatedAPIAdapter extends PublicAPIAdapter {
  private apiKey: string | null = null;

  constructor(
    sourceId: string,
    indicatorCode: string,
    apiEndpoint: string,
    rateLimit?: { requests: number; perSeconds: number }
  ) {
    super(sourceId, indicatorCode, apiEndpoint, rateLimit);
  }

  async validate(): Promise<ValidationResult> {
    const baseValidation = await super.validate();
    
    // Check if API key is available
    this.apiKey = await this.getAPIKey();
    
    if (!this.apiKey) {
      baseValidation.errors.push('API key not found - please provide credentials in admin panel');
      baseValidation.canProceed = false;
    } else {
      // Test API key validity
      const keyValid = await this.testAPIKey();
      if (!keyValid) {
        baseValidation.errors.push('API key is invalid or expired');
        baseValidation.canProceed = false;
      }
    }

    return baseValidation;
  }

  getMetadata(): AdapterMetadata {
    return {
      ...super.getMetadata(),
      requiresAuth: true,
    };
  }

  private async getAPIKey(): Promise<string | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const [rows] = await db.execute(sql`
        SELECT apiKey, encryptedKey FROM source_credentials
        WHERE sourceId = ${this.sourceId} AND isActive = 1
        LIMIT 1
      `) as any;

      if (rows && rows.length > 0) {
        // In production, decrypt the key
        return rows[0].apiKey || rows[0].encryptedKey;
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    }

    return null;
  }

  private async testAPIKey(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      // Make test request with API key
      const response = await fetch(this.apiEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'YETO-Platform/1.0',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// ============================================================================
// WEB SCRAPER ADAPTER
// ============================================================================

export class WebScraperAdapter implements DataFetcher {
  constructor(
    public sourceId: string,
    public indicatorCode: string,
    private targetUrl: string,
    private selectors: ScraperSelectors
  ) {}

  async fetch(date: Date, regimeTag?: string): Promise<DataPoint | null> {
    try {
      // Respectful scraping with delays
      await this.sleep(2000);

      // Fetch HTML
      const html = await this.fetchHTML(date);
      if (!html) return null;

      // Parse data using selectors
      const value = this.extractValue(html);
      if (value === null) return null;

      return {
        value,
        unit: this.selectors.unit || 'unknown',
        confidence: 'C', // Scraped data has lower confidence
        metadata: {
          scrapedAt: new Date().toISOString(),
          sourceUrl: this.targetUrl,
        },
      };

    } catch (error: any) {
      console.error(`[WebScraperAdapter] Error scraping ${this.indicatorCode}:`, error.message);
      return null;
    }
  }

  async validate(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check robots.txt
    const robotsAllowed = await this.checkRobotsTxt();
    if (!robotsAllowed) {
      errors.push('Scraping disallowed by robots.txt');
    }

    // Test selectors
    try {
      const html = await this.fetchHTML(new Date());
      if (!html) {
        errors.push('Cannot fetch HTML from target URL');
      } else {
        const testValue = this.extractValue(html);
        if (testValue === null) {
          warnings.push('Selectors may be outdated - could not extract test value');
        }
      }
    } catch (error: any) {
      errors.push(`Scraping test failed: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canProceed: errors.length === 0,
    };
  }

  getMetadata(): AdapterMetadata {
    return {
      adapterType: 'scraper',
      requiresAuth: false,
      rateLimit: { requests: 1, perSeconds: 2 }, // Very conservative
      estimatedLatency: 3000,
      reliability: 0.7, // Lower reliability due to HTML changes
    };
  }

  private async fetchHTML(date: Date): Promise<string | null> {
    try {
      const url = this.buildURL(date);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'YETO-Platform/1.0 (Research; +https://yeto.causewaygrp.com)',
        },
      });

      if (!response.ok) return null;
      return await response.text();

    } catch (error) {
      return null;
    }
  }

  private buildURL(date: Date): string {
    // Replace date placeholders in URL
    return this.targetUrl
      .replace('{YYYY}', date.getFullYear().toString())
      .replace('{MM}', String(date.getMonth() + 1).padStart(2, '0'))
      .replace('{DD}', String(date.getDate()).padStart(2, '0'));
  }

  private extractValue(html: string): number | null {
    // Simple regex-based extraction
    // In production, would use cheerio or jsdom for proper HTML parsing
    const pattern = new RegExp(this.selectors.valuePattern);
    const match = html.match(pattern);
    
    if (!match || !match[1]) return null;
    
    const value = parseFloat(match[1].replace(/,/g, ''));
    return isNaN(value) ? null : value;
  }

  private async checkRobotsTxt(): Promise<boolean> {
    try {
      const baseUrl = new URL(this.targetUrl).origin;
      const robotsUrl = `${baseUrl}/robots.txt`;
      const response = await fetch(robotsUrl);
      
      if (!response.ok) return true; // No robots.txt = allowed
      
      const robotsTxt = await response.text();
      
      // Simple check - in production would use robots-parser library
      return !robotsTxt.includes('Disallow: /');

    } catch (error) {
      return true; // Assume allowed if can't check
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface ScraperSelectors {
  valuePattern: string; // Regex pattern to extract value
  unit?: string;
  datePattern?: string;
}

// ============================================================================
// MANUAL ENTRY ADAPTER
// ============================================================================

export class ManualEntryAdapter implements DataFetcher {
  constructor(
    public sourceId: string,
    public indicatorCode: string
  ) {}

  async fetch(date: Date, regimeTag?: string): Promise<DataPoint | null> {
    // Check if data has been manually entered for this date
    const db = await getDb();
    if (!db) return null;

    try {
      const dateStr = date.toISOString().split('T')[0];
      const [rows] = await db.execute(sql`
        SELECT value, unit, confidenceRating, metadata
        FROM time_series
        WHERE indicatorCode = ${this.indicatorCode}
          AND date = ${dateStr}
          AND sourceId = ${this.sourceId}
          AND regimeTag = ${regimeTag || 'mixed'}
        LIMIT 1
      `) as any;

      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          value: parseFloat(row.value),
          unit: row.unit,
          confidence: row.confidenceRating as 'A' | 'B' | 'C' | 'D',
          metadata: row.metadata ? JSON.parse(row.metadata) : {},
        };
      }

      return null;

    } catch (error) {
      console.error(`[ManualEntryAdapter] Error fetching manual entry:`, error);
      return null;
    }
  }

  async validate(): Promise<ValidationResult> {
    const warnings: string[] = [];
    
    warnings.push('Manual entry required - no automated data source available');
    warnings.push('Data completeness depends on manual data entry efforts');

    return {
      isValid: true,
      errors: [],
      warnings,
      canProceed: true, // Can proceed but won't fetch new data
    };
  }

  getMetadata(): AdapterMetadata {
    return {
      adapterType: 'manual',
      requiresAuth: false,
      rateLimit: null,
      estimatedLatency: 0, // Instant (just database lookup)
      reliability: 1.0, // Reliable for existing data
    };
  }
}

// ============================================================================
// PARTNERSHIP ADAPTER
// ============================================================================

export class PartnershipAdapter implements DataFetcher {
  constructor(
    public sourceId: string,
    public indicatorCode: string,
    private partnershipStatus: 'pending' | 'active' | 'inactive'
  ) {}

  async fetch(date: Date, regimeTag?: string): Promise<DataPoint | null> {
    if (this.partnershipStatus !== 'active') {
      return null; // No data available until partnership is active
    }

    // Check for data from partner feed
    const db = await getDb();
    if (!db) return null;

    try {
      const dateStr = date.toISOString().split('T')[0];
      const [rows] = await db.execute(sql`
        SELECT value, unit, confidenceRating, metadata
        FROM time_series
        WHERE indicatorCode = ${this.indicatorCode}
          AND date = ${dateStr}
          AND sourceId = ${this.sourceId}
          AND regimeTag = ${regimeTag || 'mixed'}
        LIMIT 1
      `) as any;

      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          value: parseFloat(row.value),
          unit: row.unit,
          confidence: row.confidenceRating as 'A' | 'B' | 'C' | 'D',
          metadata: row.metadata ? JSON.parse(row.metadata) : {},
        };
      }

      return null;

    } catch (error) {
      console.error(`[PartnershipAdapter] Error fetching partner data:`, error);
      return null;
    }
  }

  async validate(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (this.partnershipStatus === 'pending') {
      warnings.push('Partnership agreement pending - no data available yet');
      warnings.push('Estimated timeline: 2-6 months for partnership negotiation');
    } else if (this.partnershipStatus === 'inactive') {
      errors.push('Partnership is inactive - cannot access data');
    }

    return {
      isValid: this.partnershipStatus === 'active',
      errors,
      warnings,
      canProceed: this.partnershipStatus === 'active',
    };
  }

  getMetadata(): AdapterMetadata {
    return {
      adapterType: 'partnership',
      requiresAuth: true,
      rateLimit: null, // Depends on partnership agreement
      estimatedLatency: 0,
      reliability: this.partnershipStatus === 'active' ? 0.95 : 0,
    };
  }
}

// ============================================================================
// ADAPTER FACTORY
// ============================================================================

export async function createAdapter(
  sourceId: string,
  indicatorCode: string,
  strategy: string
): Promise<DataFetcher> {
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Fetch source metadata
  const [rows] = await db.execute(sql`
    SELECT 
      id, name, apiEndpoint, url, scrapingAllowed,
      partnershipRequired, partnershipStatus,
      requiresKey, authType
    FROM evidence_sources
    WHERE id = ${sourceId}
  `) as any;

  if (!rows || rows.length === 0) {
    throw new Error(`Source ${sourceId} not found`);
  }

  const source = rows[0];

  // Create appropriate adapter based on strategy
  switch (strategy) {
    case 'api_public':
      return new PublicAPIAdapter(
        sourceId,
        indicatorCode,
        source.apiEndpoint,
        { requests: 60, perSeconds: 60 }
      );

    case 'api_key_required':
      return new AuthenticatedAPIAdapter(
        sourceId,
        indicatorCode,
        source.apiEndpoint,
        { requests: 100, perSeconds: 60 }
      );

    case 'scraping_allowed':
      return new WebScraperAdapter(
        sourceId,
        indicatorCode,
        source.url,
        {
          valuePattern: '\\d+\\.?\\d*', // Default pattern
          unit: 'unknown',
        }
      );

    case 'manual_entry':
      return new ManualEntryAdapter(sourceId, indicatorCode);

    case 'partnership_required':
      return new PartnershipAdapter(
        sourceId,
        indicatorCode,
        source.partnershipStatus || 'pending'
      );

    default:
      throw new Error(`Unknown strategy: ${strategy}`);
  }
}
