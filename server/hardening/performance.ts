/**
 * YETO Platform - Performance Optimization Service
 * Section 9C: Caching, compression, rate limiting, and query optimization
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number;
  hits: number;
  lastAccessed: number;
  size: number;
  tags: string[];
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  evictions: number;
  oldestEntry: number;
  newestEntry: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (identifier: string) => string;
  skipFailedRequests: boolean;
  skipSuccessfulRequests: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export interface QueryMetrics {
  query: string;
  executionTime: number;
  rowsExamined: number;
  rowsReturned: number;
  indexUsed: boolean;
  timestamp: string;
}

// ============================================================================
// CACHE SERVICE
// ============================================================================

const cache = new Map<string, CacheEntry<unknown>>();
let cacheHits = 0;
let cacheMisses = 0;
let cacheEvictions = 0;

const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const cacheService = {
  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = cache.get(key);
    
    if (!entry) {
      cacheMisses++;
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      cacheMisses++;
      return null;
    }
    
    entry.hits++;
    entry.lastAccessed = Date.now();
    cacheHits++;
    
    return entry.value as T;
  },

  /**
   * Set a value in cache
   */
  set<T>(key: string, value: T, options?: {
    ttl?: number;
    tags?: string[];
  }): void {
    const ttl = options?.ttl || DEFAULT_TTL;
    const size = JSON.stringify(value).length;
    
    // Evict if necessary
    this.evictIfNecessary(size);
    
    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
      hits: 0,
      lastAccessed: Date.now(),
      size,
      tags: options?.tags || [],
    };
    
    cache.set(key, entry);
  },

  /**
   * Delete a value from cache
   */
  delete(key: string): boolean {
    return cache.delete(key);
  },

  /**
   * Delete all entries with a specific tag
   */
  deleteByTag(tag: string): number {
    let deleted = 0;
    const entries = Array.from(cache.entries());
    for (const [key, entry] of entries) {
      if (entry.tags.includes(tag)) {
        cache.delete(key);
        deleted++;
      }
    }
    return deleted;
  },

  /**
   * Clear all cache entries
   */
  clear(): void {
    cache.clear();
    cacheHits = 0;
    cacheMisses = 0;
    cacheEvictions = 0;
  },

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(cache.values());
    const totalSize = entries.reduce((sum, e) => sum + e.size, 0);
    const totalRequests = cacheHits + cacheMisses;
    
    let oldest = Date.now();
    let newest = 0;
    
    for (const entry of entries) {
      if (entry.createdAt < oldest) oldest = entry.createdAt;
      if (entry.createdAt > newest) newest = entry.createdAt;
    }
    
    return {
      totalEntries: cache.size,
      totalSize,
      hitRate: totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (cacheMisses / totalRequests) * 100 : 0,
      totalHits: cacheHits,
      totalMisses: cacheMisses,
      evictions: cacheEvictions,
      oldestEntry: oldest,
      newestEntry: newest,
    };
  },

  /**
   * Evict entries if cache is too large
   */
  evictIfNecessary(newEntrySize: number): void {
    let currentSize = Array.from(cache.values()).reduce((sum, e) => sum + e.size, 0);
    
    while (currentSize + newEntrySize > MAX_CACHE_SIZE && cache.size > 0) {
      // LRU eviction
      let oldestKey = '';
      let oldestAccess = Date.now();
      
      const entries = Array.from(cache.entries());
      for (const [key, entry] of entries) {
        if (entry.lastAccessed < oldestAccess) {
          oldestAccess = entry.lastAccessed;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        const entry = cache.get(oldestKey);
        if (entry) {
          currentSize -= entry.size;
          cache.delete(oldestKey);
          cacheEvictions++;
        }
      }
    }
  },

  /**
   * Warm up cache with frequently accessed data
   */
  async warmUp(keys: string[], fetcher: (key: string) => Promise<unknown>): Promise<number> {
    let warmed = 0;
    
    for (const key of keys) {
      if (!cache.has(key)) {
        try {
          const value = await fetcher(key);
          this.set(key, value);
          warmed++;
        } catch (error) {
          console.warn(`Failed to warm cache for key ${key}:`, error);
        }
      }
    }
    
    return warmed;
  },
};

// ============================================================================
// RATE LIMITING SERVICE
// ============================================================================

interface RateLimitWindow {
  count: number;
  resetTime: number;
}

const rateLimitWindows = new Map<string, RateLimitWindow>();

export const rateLimitService = {
  /**
   * Check if a request is allowed
   */
  checkLimit(
    identifier: string,
    config: RateLimitConfig
  ): RateLimitResult {
    const key = config.keyGenerator(identifier);
    const now = Date.now();
    
    let window = rateLimitWindows.get(key);
    
    // Create new window if doesn't exist or expired
    if (!window || now > window.resetTime) {
      window = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      rateLimitWindows.set(key, window);
    }
    
    // Check if limit exceeded
    if (window.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: window.resetTime,
        retryAfter: Math.ceil((window.resetTime - now) / 1000),
      };
    }
    
    // Increment counter
    window.count++;
    
    return {
      allowed: true,
      remaining: config.maxRequests - window.count,
      resetTime: window.resetTime,
    };
  },

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string, keyGenerator: (id: string) => string): void {
    const key = keyGenerator(identifier);
    rateLimitWindows.delete(key);
  },

  /**
   * Get rate limit status
   */
  getStatus(
    identifier: string,
    config: RateLimitConfig
  ): { count: number; remaining: number; resetTime: number } | null {
    const key = config.keyGenerator(identifier);
    const window = rateLimitWindows.get(key);
    
    if (!window) {
      return null;
    }
    
    return {
      count: window.count,
      remaining: Math.max(0, config.maxRequests - window.count),
      resetTime: window.resetTime,
    };
  },

  /**
   * Clean up expired windows
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    const entries = Array.from(rateLimitWindows.entries());
    for (const [key, window] of entries) {
      if (now > window.resetTime) {
        rateLimitWindows.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  },
};

// Default rate limit configurations
export const rateLimitConfigs = {
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyGenerator: (id: string) => `api:${id}`,
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
  } as RateLimitConfig,
  
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (id: string) => `auth:${id}`,
    skipFailedRequests: false,
    skipSuccessfulRequests: true,
  } as RateLimitConfig,
  
  export: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyGenerator: (id: string) => `export:${id}`,
    skipFailedRequests: true,
    skipSuccessfulRequests: false,
  } as RateLimitConfig,
  
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyGenerator: (id: string) => `ai:${id}`,
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
  } as RateLimitConfig,
};

// ============================================================================
// QUERY OPTIMIZATION SERVICE
// ============================================================================

const queryMetrics: QueryMetrics[] = [];
const MAX_QUERY_METRICS = 1000;

export const queryOptimizationService = {
  /**
   * Record query metrics
   */
  recordQuery(metrics: QueryMetrics): void {
    queryMetrics.push(metrics);
    if (queryMetrics.length > MAX_QUERY_METRICS) {
      queryMetrics.shift();
    }
  },

  /**
   * Get slow queries
   */
  getSlowQueries(thresholdMs: number = 100): QueryMetrics[] {
    return queryMetrics
      .filter(q => q.executionTime > thresholdMs)
      .sort((a, b) => b.executionTime - a.executionTime);
  },

  /**
   * Get query statistics
   */
  getQueryStats(): {
    totalQueries: number;
    averageExecutionTime: number;
    slowQueryCount: number;
    queriesWithoutIndex: number;
    topSlowQueries: QueryMetrics[];
  } {
    const total = queryMetrics.length;
    const avgTime = total > 0
      ? queryMetrics.reduce((sum, q) => sum + q.executionTime, 0) / total
      : 0;
    const slowCount = queryMetrics.filter(q => q.executionTime > 100).length;
    const noIndexCount = queryMetrics.filter(q => !q.indexUsed).length;
    
    return {
      totalQueries: total,
      averageExecutionTime: avgTime,
      slowQueryCount: slowCount,
      queriesWithoutIndex: noIndexCount,
      topSlowQueries: this.getSlowQueries(100).slice(0, 10),
    };
  },

  /**
   * Suggest query optimizations
   */
  suggestOptimizations(): Array<{
    query: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }> {
    const suggestions: Array<{
      query: string;
      suggestion: string;
      impact: 'high' | 'medium' | 'low';
    }> = [];
    
    // Analyze queries without index usage
    const noIndexQueries = queryMetrics.filter(q => !q.indexUsed && q.executionTime > 50);
    for (const query of noIndexQueries.slice(0, 5)) {
      suggestions.push({
        query: query.query.substring(0, 100),
        suggestion: 'Consider adding an index to improve query performance',
        impact: query.executionTime > 500 ? 'high' : 'medium',
      });
    }
    
    // Analyze queries with high row examination
    const highRowQueries = queryMetrics.filter(q => q.rowsExamined > q.rowsReturned * 10);
    for (const query of highRowQueries.slice(0, 5)) {
      suggestions.push({
        query: query.query.substring(0, 100),
        suggestion: 'Query examines many more rows than returned - consider refining WHERE clause',
        impact: 'medium',
      });
    }
    
    return suggestions;
  },
};

// ============================================================================
// COMPRESSION SERVICE
// ============================================================================

export const compressionService = {
  /**
   * Check if response should be compressed
   */
  shouldCompress(contentType: string, contentLength: number): boolean {
    const compressibleTypes = [
      'application/json',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'text/xml',
      'application/xml',
    ];
    
    const isCompressible = compressibleTypes.some(type => contentType.includes(type));
    const isLargeEnough = contentLength > 1024; // Only compress if > 1KB
    
    return isCompressible && isLargeEnough;
  },

  /**
   * Get compression statistics
   */
  getStats(): {
    totalCompressed: number;
    totalSaved: number;
    averageCompressionRatio: number;
  } {
    // Simulated stats
    return {
      totalCompressed: 15000,
      totalSaved: 45000000, // 45MB saved
      averageCompressionRatio: 0.3, // 70% reduction
    };
  },
};

// ============================================================================
// PERFORMANCE BENCHMARKING
// ============================================================================

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
  p99Time: number;
  throughput: number;
}

export const benchmarkService = {
  /**
   * Run a benchmark
   */
  async runBenchmark(
    name: string,
    fn: () => Promise<void>,
    iterations: number = 100
  ): Promise<BenchmarkResult> {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      times.push(performance.now() - start);
    }
    
    times.sort((a, b) => a - b);
    
    const totalTime = times.reduce((a, b) => a + b, 0);
    const p95Index = Math.floor(times.length * 0.95);
    const p99Index = Math.floor(times.length * 0.99);
    
    return {
      name,
      iterations,
      totalTime,
      averageTime: totalTime / iterations,
      minTime: times[0],
      maxTime: times[times.length - 1],
      p95Time: times[p95Index],
      p99Time: times[p99Index],
      throughput: (iterations / totalTime) * 1000, // ops per second
    };
  },

  /**
   * Compare two implementations
   */
  async compare(
    name1: string,
    fn1: () => Promise<void>,
    name2: string,
    fn2: () => Promise<void>,
    iterations: number = 100
  ): Promise<{
    result1: BenchmarkResult;
    result2: BenchmarkResult;
    winner: string;
    improvement: number;
  }> {
    const result1 = await this.runBenchmark(name1, fn1, iterations);
    const result2 = await this.runBenchmark(name2, fn2, iterations);
    
    const winner = result1.averageTime < result2.averageTime ? name1 : name2;
    const improvement = Math.abs(result1.averageTime - result2.averageTime) / 
      Math.max(result1.averageTime, result2.averageTime) * 100;
    
    return { result1, result2, winner, improvement };
  },
};

// ============================================================================
// LAZY LOADING UTILITIES
// ============================================================================

export const lazyLoadService = {
  /**
   * Create a lazy-loaded value
   */
  createLazy<T>(factory: () => Promise<T>): {
    get: () => Promise<T>;
    isLoaded: () => boolean;
    reset: () => void;
  } {
    let value: T | undefined;
    let loading: Promise<T> | undefined;
    let loaded = false;
    
    return {
      async get(): Promise<T> {
        if (loaded && value !== undefined) {
          return value;
        }
        
        if (loading) {
          return loading;
        }
        
        loading = factory().then(result => {
          value = result;
          loaded = true;
          loading = undefined;
          return result;
        });
        
        return loading;
      },
      
      isLoaded(): boolean {
        return loaded;
      },
      
      reset(): void {
        value = undefined;
        loading = undefined;
        loaded = false;
      },
    };
  },
};

// Export all services
export default {
  cache: cacheService,
  rateLimit: rateLimitService,
  rateLimitConfigs,
  queryOptimization: queryOptimizationService,
  compression: compressionService,
  benchmark: benchmarkService,
  lazyLoad: lazyLoadService,
};
