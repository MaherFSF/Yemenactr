/**
 * Advanced Backfill Orchestrator
 * 
 * Intelligent multi-source backfill system that:
 * - Detects source type (API, scraping, manual, partnership)
 * - Routes to appropriate adapter
 * - Handles API key management
 * - Manages manual data entry workflows
 * - Tracks progress with resumable checkpoints
 * - Provides source-specific instructions
 * 
 * Architecture:
 * - SourceDetector: Analyzes source metadata and determines strategy
 * - SourceAdapters: API, Scraping, Manual, Partnership
 * - CredentialManager: API key validation and storage
 * - InstructionEngine: Generates human-readable instructions
 * - ProgressTracker: Real-time backfill monitoring
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import { runHistoricalBackfill, BackfillConfig, BackfillCheckpoint } from './historicalBackfill';

// ============================================================================
// SOURCE STRATEGY DETECTION
// ============================================================================

export type SourceStrategy = 
  | 'api_public'           // Public API, no auth required
  | 'api_key_required'     // API requires key (user must provide)
  | 'api_oauth'            // OAuth flow required
  | 'scraping_allowed'     // Web scraping permitted by ToS
  | 'scraping_restricted'  // Scraping possible but legally gray
  | 'manual_entry'         // No API/scraping, manual data entry only
  | 'partnership_required' // Need formal partnership/MOU
  | 'unavailable';         // Source not accessible

export interface SourceAnalysis {
  sourceId: string;
  sourceName: string;
  organization: string;
  strategy: SourceStrategy;
  confidence: number; // 0-1, how confident we are in this strategy
  reasoning: string;
  requirements: SourceRequirement[];
  estimatedEffort: 'low' | 'medium' | 'high' | 'very_high';
  instructions: string[];
  blockers: string[];
  alternatives: string[];
}

export interface SourceRequirement {
  type: 'api_key' | 'oauth_token' | 'partnership_agreement' | 'manual_labor' | 'legal_clearance';
  description: string;
  status: 'met' | 'pending' | 'blocked';
  actionRequired: string;
  responsibleParty: 'system' | 'admin' | 'user' | 'partner_org';
}

/**
 * Analyze a source and determine the best backfill strategy
 */
export async function analyzeSource(sourceId: string): Promise<SourceAnalysis> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Fetch source metadata
  const [rows] = await db.execute(sql`
    SELECT 
      id, name, organization, baseUrl, notes, dataFormat,
      updateFrequency, license, isActive, apiEndpoint, authType,
      requiresKey, partnershipRequired, scrapingAllowed,
      contactEmail
    FROM evidence_sources
    WHERE id = ${sourceId}
  `) as any;

  if (!rows || rows.length === 0) {
    throw new Error(`Source ${sourceId} not found`);
  }

  const source = {
    ...rows[0],
    url: rows[0].baseUrl,
    description: rows[0].notes,
  };
  
  // Strategy detection logic
  let strategy: SourceStrategy = 'unavailable';
  let confidence = 0;
  let reasoning = '';
  const requirements: SourceRequirement[] = [];
  const instructions: string[] = [];
  const blockers: string[] = [];
  const alternatives: string[] = [];
  let estimatedEffort: 'low' | 'medium' | 'high' | 'very_high' = 'medium';

  // 1. Check if source has API endpoint
  if (source.apiEndpoint) {
    if (source.requiresKey) {
      strategy = 'api_key_required';
      confidence = 0.95;
      reasoning = 'Source has documented API endpoint that requires authentication key';
      estimatedEffort = 'medium';
      
      requirements.push({
        type: 'api_key',
        description: `API key from ${source.organization}`,
        status: 'pending',
        actionRequired: `Obtain API key from ${source.apiEndpoint}`,
        responsibleParty: 'admin',
      });

      instructions.push(
        `1. Visit ${source.apiEndpoint} to register for API access`,
        `2. Request API key (may require institutional email)`,
        `3. Store key securely in YETO admin panel`,
        `4. Test connection before running backfill`,
        `5. Monitor rate limits during backfill execution`
      );

      if (source.contactEmail) {
        alternatives.push(
          `Contact ${source.contactEmail} to request bulk data access`,
          `Request historical data dump to bypass API rate limits`
        );
      }

    } else if (source.authType === 'oauth') {
      strategy = 'api_oauth';
      confidence = 0.9;
      reasoning = 'Source requires OAuth authentication flow';
      estimatedEffort = 'high';
      
      requirements.push({
        type: 'oauth_token',
        description: `OAuth credentials for ${source.organization}`,
        status: 'pending',
        actionRequired: 'Implement OAuth flow in YETO platform',
        responsibleParty: 'system',
      });

      instructions.push(
        `1. Register YETO as OAuth application with ${source.organization}`,
        `2. Obtain client_id and client_secret`,
        `3. Implement OAuth callback handler`,
        `4. Store refresh tokens securely`,
        `5. Handle token expiration and renewal`
      );

      blockers.push('OAuth implementation required - estimated 2-3 days development time');

    } else {
      strategy = 'api_public';
      confidence = 0.98;
      reasoning = 'Source has public API with no authentication required';
      estimatedEffort = 'low';

      instructions.push(
        `1. Review API documentation at ${source.apiEndpoint}`,
        `2. Test API endpoints with sample requests`,
        `3. Check rate limits and implement throttling`,
        `4. Run backfill with automatic retries`,
        `5. Monitor for API changes or deprecations`
      );
    }
  }
  
  // 2. Check if scraping is allowed
  else if (source.scrapingAllowed) {
    strategy = 'scraping_allowed';
    confidence = 0.8;
    reasoning = 'Source permits web scraping per Terms of Service';
    estimatedEffort = 'medium';

    instructions.push(
      `1. Review robots.txt at ${source.url}`,
      `2. Implement respectful scraping (rate limiting, user agent)`,
      `3. Parse HTML/PDF documents to extract data`,
      `4. Validate extracted data against known values`,
      `5. Monitor for website structure changes`
    );

    requirements.push({
      type: 'legal_clearance',
      description: 'Verify scraping is permitted by ToS',
      status: 'pending',
      actionRequired: 'Legal review of source Terms of Service',
      responsibleParty: 'admin',
    });

    blockers.push('Scraping implementation required - estimated 3-5 days development time');
    alternatives.push('Contact source organization to request API access or data partnership');

  } else if (source.url && source.url.includes('http')) {
    strategy = 'scraping_restricted';
    confidence = 0.6;
    reasoning = 'Source has web presence but scraping status unclear';
    estimatedEffort = 'high';

    blockers.push(
      'Scraping may violate Terms of Service',
      'Legal risk assessment required before proceeding'
    );

    alternatives.push(
      'Request formal data partnership with source organization',
      'Manual data entry as interim solution'
    );
  }

  // 3. Check if partnership is required
  if (source.partnershipRequired) {
    strategy = 'partnership_required';
    confidence = 0.95;
    reasoning = 'Source requires formal partnership agreement or MOU';
    estimatedEffort = 'very_high';

    requirements.push({
      type: 'partnership_agreement',
      description: `Formal agreement with ${source.organization}`,
      status: 'pending',
      actionRequired: `Initiate partnership discussion with ${source.contactEmail || 'source organization'}`,
      responsibleParty: 'admin',
    });

    instructions.push(
      `1. Draft partnership proposal highlighting YETO's mission`,
      `2. Email ${source.contactEmail || 'source organization'} with proposal`,
      `3. Schedule call to discuss data sharing terms`,
      `4. Negotiate data access frequency and format`,
      `5. Sign MOU or data sharing agreement`,
      `6. Establish technical integration (API key, SFTP, etc.)`,
      `7. Set up automated data sync pipeline`
    );

    blockers.push(
      'Partnership negotiation timeline: 2-6 months typical',
      'May require institutional backing or funding commitment'
    );

    alternatives.push(
      'Use publicly available summary data as interim solution',
      'Manual entry of key indicators from published reports'
    );
  }

  // 4. Fallback to manual entry
  if (strategy === 'unavailable' || (strategy === 'scraping_restricted' && !source.partnershipRequired)) {
    strategy = 'manual_entry';
    confidence = 1.0;
    reasoning = 'No automated access method available - manual data entry required';
    estimatedEffort = 'very_high';

    requirements.push({
      type: 'manual_labor',
      description: 'Human data entry from source documents',
      status: 'pending',
      actionRequired: 'Assign data entry task to analyst or intern',
      responsibleParty: 'user',
    });

    instructions.push(
      `1. Download all available reports from ${source.url}`,
      `2. Create data entry template matching YETO schema`,
      `3. Extract data points manually with source citations`,
      `4. Double-check all entries for accuracy`,
      `5. Upload via YETO Partner Contribution Portal`,
      `6. Flag any ambiguous or unclear data points`
    );

    alternatives.push(
      'Hire temporary data entry staff for large historical datasets',
      'Partner with university research assistants for data extraction'
    );
  }

  return {
    sourceId: source.id,
    sourceName: source.name,
    organization: source.organization,
    strategy,
    confidence,
    reasoning,
    requirements,
    estimatedEffort,
    instructions,
    blockers,
    alternatives,
  };
}

// ============================================================================
// BACKFILL ORCHESTRATION
// ============================================================================

export interface BackfillRequest {
  sourceId: string;
  indicatorCodes: string[];
  startDate: Date;
  endDate: Date;
  regimeTag?: 'aden_irg' | 'sanaa_defacto' | 'mixed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requestedBy: string; // user ID
}

export interface BackfillPlan {
  requestId: string;
  sourceAnalysis: SourceAnalysis;
  indicatorCount: number;
  dateRange: { start: Date; end: Date };
  estimatedDataPoints: number;
  estimatedDuration: string;
  strategy: SourceStrategy;
  nextSteps: string[];
  canProceedAutomatically: boolean;
  requiresHumanAction: boolean;
  humanActionItems: string[];
}

/**
 * Create a backfill plan for a source
 */
export async function createBackfillPlan(request: BackfillRequest): Promise<BackfillPlan> {
  const analysis = await analyzeSource(request.sourceId);
  
  // Calculate estimated data points
  const daysDiff = Math.ceil((request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const estimatedDataPoints = daysDiff * request.indicatorCodes.length;

  // Determine if we can proceed automatically
  const canProceedAutomatically = analysis.strategy === 'api_public';
  const requiresHumanAction = analysis.requirements.some(r => r.responsibleParty !== 'system');

  // Generate next steps
  const nextSteps: string[] = [];
  const humanActionItems: string[] = [];

  if (canProceedAutomatically) {
    nextSteps.push('✅ Ready to run automated backfill');
    nextSteps.push('Click "Start Backfill" to begin data ingestion');
  } else {
    for (const req of analysis.requirements) {
      if (req.status === 'pending') {
        const item = `${req.description}: ${req.actionRequired}`;
        if (req.responsibleParty === 'admin' || req.responsibleParty === 'user') {
          humanActionItems.push(item);
        }
        nextSteps.push(`⏳ ${item}`);
      }
    }
  }

  if (analysis.blockers.length > 0) {
    nextSteps.push('⚠️ Blockers identified:');
    analysis.blockers.forEach(b => nextSteps.push(`   - ${b}`));
  }

  // Estimate duration
  let estimatedDuration = 'Unknown';
  if (analysis.strategy === 'api_public') {
    const hoursEstimate = Math.ceil(estimatedDataPoints / 1000); // ~1000 points per hour with rate limiting
    estimatedDuration = `${hoursEstimate} hours`;
  } else if (analysis.strategy === 'api_key_required') {
    estimatedDuration = '1-2 days (after API key obtained)';
  } else if (analysis.strategy === 'partnership_required') {
    estimatedDuration = '2-6 months (partnership negotiation)';
  } else if (analysis.strategy === 'manual_entry') {
    const daysEstimate = Math.ceil(estimatedDataPoints / 100); // ~100 points per day manual entry
    estimatedDuration = `${daysEstimate} days (manual entry)`;
  }

  return {
    requestId: `backfill_${request.sourceId}_${Date.now()}`,
    sourceAnalysis: analysis,
    indicatorCount: request.indicatorCodes.length,
    dateRange: { start: request.startDate, end: request.endDate },
    estimatedDataPoints,
    estimatedDuration,
    strategy: analysis.strategy,
    nextSteps,
    canProceedAutomatically,
    requiresHumanAction,
    humanActionItems,
  };
}

/**
 * Execute backfill plan
 */
export async function executeBackfillPlan(
  plan: BackfillPlan,
  request: BackfillRequest,
  onProgress?: (checkpoint: BackfillCheckpoint) => void
): Promise<BackfillCheckpoint[]> {
  
  if (!plan.canProceedAutomatically) {
    throw new Error(
      `Cannot proceed automatically. Human action required:\n${plan.humanActionItems.join('\n')}`
    );
  }

  const results: BackfillCheckpoint[] = [];

  // Execute backfill for each indicator
  for (const indicatorCode of request.indicatorCodes) {
    // Map regime tags to match BackfillConfig type
    let mappedRegimeTag: 'IRG' | 'DFA' | 'unified' | undefined;
    if (request.regimeTag === 'aden_irg') mappedRegimeTag = 'IRG';
    else if (request.regimeTag === 'sanaa_defacto') mappedRegimeTag = 'DFA';
    else if (request.regimeTag === 'mixed') mappedRegimeTag = 'unified';
    
    const config: BackfillConfig = {
      datasetId: `${request.sourceId}_${indicatorCode}`,
      indicatorCode,
      sourceId: request.sourceId,
      startDate: request.startDate,
      endDate: request.endDate,
      chunkSize: 'month',
      regimeTag: mappedRegimeTag,
    };

    // Get appropriate data fetcher based on strategy
    const dataFetcher = await getDataFetcherForStrategy(
      plan.strategy,
      request.sourceId,
      indicatorCode
    );

    const checkpoint = await runHistoricalBackfill(config, dataFetcher, onProgress);
    results.push(checkpoint);
  }

  return results;
}

/**
 * Get data fetcher function based on source strategy
 */
async function getDataFetcherForStrategy(
  strategy: SourceStrategy,
  sourceId: string,
  indicatorCode: string
): Promise<(date: Date, regimeTag?: string) => Promise<number | null>> {
  
  switch (strategy) {
    case 'api_public':
      return createPublicAPIFetcher(sourceId, indicatorCode);
    
    case 'api_key_required':
      return createAuthenticatedAPIFetcher(sourceId, indicatorCode);
    
    case 'scraping_allowed':
      return createScraperFetcher(sourceId, indicatorCode);
    
    default:
      throw new Error(`No automated fetcher available for strategy: ${strategy}`);
  }
}

/**
 * Create data fetcher for public APIs
 */
function createPublicAPIFetcher(
  sourceId: string,
  indicatorCode: string
): (date: Date, regimeTag?: string) => Promise<number | null> {
  return async (date: Date, regimeTag?: string) => {
    // This is a placeholder - actual implementation would call specific API
    // For now, return null to indicate no data available
    return null;
  };
}

/**
 * Create data fetcher for authenticated APIs
 */
function createAuthenticatedAPIFetcher(
  sourceId: string,
  indicatorCode: string
): (date: Date, regimeTag?: string) => Promise<number | null> {
  return async (date: Date, regimeTag?: string) => {
    // Check if API key is available
    const apiKey = await getAPIKey(sourceId);
    if (!apiKey) {
      throw new Error(`API key not found for source ${sourceId}`);
    }

    // Placeholder for actual API call with authentication
    return null;
  };
}

/**
 * Create data fetcher for web scraping
 */
function createScraperFetcher(
  sourceId: string,
  indicatorCode: string
): (date: Date, regimeTag?: string) => Promise<number | null> {
  return async (date: Date, regimeTag?: string) => {
    // Placeholder for scraping implementation
    return null;
  };
}

/**
 * Get API key for a source (from secure storage)
 */
async function getAPIKey(sourceId: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [rows] = await db.execute(sql`
      SELECT apiKey FROM source_credentials
      WHERE sourceId = ${sourceId} AND isActive = 1
      LIMIT 1
    `) as any;

    if (rows && rows.length > 0) {
      return rows[0].apiKey;
    }
  } catch (error) {
    console.error('Error fetching API key:', error);
  }

  return null;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Analyze all sources and generate backfill recommendations
 */
export async function analyzeAllSources(): Promise<SourceAnalysis[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const [rows] = await db.execute(sql`
    SELECT id FROM evidence_sources WHERE isActive = 1
  `) as any;

  const analyses: SourceAnalysis[] = [];
  
  for (const row of rows) {
    try {
      const analysis = await analyzeSource(row.id);
      analyses.push(analysis);
    } catch (error) {
      console.error(`Error analyzing source ${row.id}:`, error);
    }
  }

  return analyses;
}

/**
 * Get backfill priority recommendations
 */
export interface BackfillRecommendation {
  sourceId: string;
  sourceName: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string;
  estimatedImpact: string;
  readinessScore: number; // 0-100, how ready we are to backfill this source
}

export async function getBackfillRecommendations(): Promise<BackfillRecommendation[]> {
  const analyses = await analyzeAllSources();
  const recommendations: BackfillRecommendation[] = [];

  for (const analysis of analyses) {
    let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    let reasoning = '';
    let estimatedImpact = '';
    let readinessScore = 0;

    // Calculate readiness score
    if (analysis.strategy === 'api_public') {
      readinessScore = 95;
      priority = 'high';
      reasoning = 'Public API available - can start immediately';
      estimatedImpact = 'High - automated data ingestion with minimal effort';
    } else if (analysis.strategy === 'api_key_required') {
      readinessScore = 60;
      priority = 'high';
      reasoning = 'API available but requires key - medium effort';
      estimatedImpact = 'High - automated after initial setup';
    } else if (analysis.strategy === 'scraping_allowed') {
      readinessScore = 40;
      priority = 'medium';
      reasoning = 'Scraping permitted but requires development';
      estimatedImpact = 'Medium - semi-automated after implementation';
    } else if (analysis.strategy === 'partnership_required') {
      readinessScore = 20;
      priority = 'low';
      reasoning = 'Partnership negotiation required - long timeline';
      estimatedImpact = 'High - but requires 2-6 months of partnership development';
    } else if (analysis.strategy === 'manual_entry') {
      readinessScore = 10;
      priority = 'low';
      reasoning = 'Manual entry only - very high effort';
      estimatedImpact = 'Low - labor intensive with slow progress';
    }

    // Boost priority for critical economic indicators
    if (analysis.sourceName.includes('Central Bank') || 
        analysis.sourceName.includes('World Bank') ||
        analysis.sourceName.includes('IMF')) {
      if (priority === 'medium') priority = 'high';
      if (priority === 'low') priority = 'medium';
      readinessScore += 10;
    }

    recommendations.push({
      sourceId: analysis.sourceId,
      sourceName: analysis.sourceName,
      priority,
      reasoning,
      estimatedImpact,
      readinessScore: Math.min(100, readinessScore),
    });
  }

  // Sort by readiness score descending
  recommendations.sort((a, b) => b.readinessScore - a.readinessScore);

  return recommendations;
}
