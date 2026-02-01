/**
 * Tier Classifier Service
 * Deterministic rules for classifying source tiers based on PROMPT 5/6 requirements
 * 
 * Tier Definitions:
 * - T0: Official/statistical authority or primary dataset provider (IFIs, UN core, national stats)
 * - T1: Reputable multilateral/UN agency operational datasets + official bulletins
 * - T2: Reputable research institutions/think tanks/academic repositories
 * - T3: Credible media/news = EVENT_DETECTION ONLY (never numeric KPIs)
 * - T4: Restricted/paywalled/unclear license = METADATA_ONLY until access approved
 */

export interface ClassificationResult {
  sourceId: string;
  suggestedTier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'UNKNOWN';
  reason: string;
  confidence: number; // 0-1
  requiresHumanReview: boolean;
  matchedRule: string;
}

// T0: Official statistical authorities and primary dataset providers
const T0_PATTERNS = {
  organizations: [
    'world bank', 'imf', 'international monetary fund', 'un statistics', 'unsd',
    'central statistical organization', 'cso yemen', 'ministry of planning',
    'central bank of yemen', 'cby', 'world trade organization', 'wto',
    'bank for international settlements', 'bis', 'oecd', 'eurostat',
    'un comtrade', 'comtrade', 'wdi', 'world development indicators',
    'gfs', 'government finance statistics', 'bop', 'balance of payments',
    'ifs', 'international financial statistics', 'sdmx', 'dsd'
  ],
  sourceTypes: ['DATA'],
  keywords: ['official statistics', 'national accounts', 'gdp', 'balance of payments', 
             'government finance', 'monetary statistics', 'trade statistics']
};

// T1: Reputable multilateral/UN operational datasets
const T1_PATTERNS = {
  organizations: [
    'ocha', 'unhcr', 'wfp', 'world food programme', 'unicef', 'who',
    'fao', 'food and agriculture', 'iom', 'undp', 'unops', 'unfpa',
    'hdx', 'humanitarian data exchange', 'reliefweb', 'fts', 'financial tracking',
    'iati', 'aid transparency', 'aiddata', 'acaps', 'reach initiative',
    'cluster', 'protection cluster', 'food security cluster', 'wash cluster',
    'european union', 'eu', 'european commission', 'usaid', 'dfid', 'giz',
    'afdb', 'african development bank', 'isdb', 'islamic development bank',
    'arab monetary fund', 'amf', 'gcc stat', 'escwa'
  ],
  sourceTypes: ['DATA', 'RESEARCH'],
  keywords: ['humanitarian', 'aid', 'displacement', 'refugee', 'food security',
             'nutrition', 'health', 'protection', 'wash', 'shelter', 'education']
};

// T2: Research institutions and think tanks
const T2_PATTERNS = {
  organizations: [
    'brookings', 'carnegie', 'chatham house', 'csis', 'rand', 'iiss',
    'crisis group', 'international crisis group', 'sana\'a center', 'sanaa center',
    'yemen policy center', 'deep root', 'rethinking yemen', 'acled',
    'armed conflict', 'sipri', 'iep', 'institute for economics and peace',
    'transparency international', 'freedom house', 'heritage foundation',
    'world economic forum', 'wef', 'mckinsey', 'oxford', 'cambridge',
    'harvard', 'mit', 'stanford', 'lse', 'soas', 'american university',
    'cmi', 'chr. michelsen', 'prio', 'diis', 'odi', 'cgdev', 'ifpri',
    'economist intelligence unit', 'eiu', 'fitch', 'moody\'s', 's&p'
  ],
  sourceTypes: ['RESEARCH', 'ACADEMIA'],
  keywords: ['research', 'analysis', 'study', 'report', 'working paper',
             'policy brief', 'assessment', 'evaluation', 'academic']
};

// T3: Media sources (EVENT_DETECTION ONLY)
const T3_PATTERNS = {
  organizations: [
    'reuters', 'afp', 'ap news', 'associated press', 'bbc', 'al jazeera',
    'al arabiya', 'sky news', 'cnn', 'guardian', 'new york times', 'washington post',
    'financial times', 'economist', 'bloomberg', 'wall street journal',
    'middle east eye', 'al-monitor', 'arab news', 'gulf news',
    'yemen times', 'saba news', 'al-masdar', 'al-sahwa', 'mareb press',
    'belqees tv', 'yemen shabab', 'al-ayyam'
  ],
  sourceTypes: ['MEDIA'],
  keywords: ['news', 'media', 'press', 'journalism', 'breaking', 'report',
             'coverage', 'correspondent', 'editorial']
};

// T4: Restricted/paywalled sources
const T4_PATTERNS = {
  licenseStates: ['restricted', 'paywalled', 'subscription'],
  keywords: ['subscription required', 'members only', 'premium', 'paywall',
             'restricted access', 'confidential', 'proprietary']
};

/**
 * Classify a single source based on deterministic rules
 */
export function classifySource(source: {
  sourceId: string;
  name: string;
  sourceType?: string;
  licenseState?: string;
  url?: string;
  description?: string;
  tier?: string;
}): ClassificationResult {
  const nameLower = (source.name || '').toLowerCase();
  const descLower = (source.description || '').toLowerCase();
  const urlLower = (source.url || '').toLowerCase();
  const combined = `${nameLower} ${descLower} ${urlLower}`;
  const sourceType = (source.sourceType || '').toUpperCase();
  const licenseState = (source.licenseState || '').toLowerCase();

  // Rule 1: Check for T4 (restricted/paywalled) first
  if (T4_PATTERNS.licenseStates.includes(licenseState)) {
    return {
      sourceId: source.sourceId,
      suggestedTier: 'T4',
      reason: `License state is ${licenseState} - requires access approval`,
      confidence: 0.95,
      requiresHumanReview: false,
      matchedRule: 'LICENSE_STATE_RESTRICTED'
    };
  }

  for (const keyword of T4_PATTERNS.keywords) {
    if (combined.includes(keyword)) {
      return {
        sourceId: source.sourceId,
        suggestedTier: 'T4',
        reason: `Contains restricted keyword: "${keyword}"`,
        confidence: 0.85,
        requiresHumanReview: true,
        matchedRule: 'RESTRICTED_KEYWORD'
      };
    }
  }

  // Rule 2: Check for T0 (official statistical authorities)
  for (const org of T0_PATTERNS.organizations) {
    if (combined.includes(org)) {
      return {
        sourceId: source.sourceId,
        suggestedTier: 'T0',
        reason: `Matches T0 organization: "${org}" - official statistical authority`,
        confidence: 0.95,
        requiresHumanReview: false,
        matchedRule: 'T0_ORGANIZATION'
      };
    }
  }

  // Rule 3: Check for T3 (media) based on sourceType
  if (sourceType === 'MEDIA') {
    return {
      sourceId: source.sourceId,
      suggestedTier: 'T3',
      reason: 'Source type is MEDIA - EVENT_DETECTION only',
      confidence: 0.95,
      requiresHumanReview: false,
      matchedRule: 'MEDIA_SOURCE_TYPE'
    };
  }

  for (const org of T3_PATTERNS.organizations) {
    if (combined.includes(org)) {
      return {
        sourceId: source.sourceId,
        suggestedTier: 'T3',
        reason: `Matches T3 media organization: "${org}" - EVENT_DETECTION only`,
        confidence: 0.90,
        requiresHumanReview: false,
        matchedRule: 'T3_ORGANIZATION'
      };
    }
  }

  // Rule 4: Check for T1 (multilateral/UN operational)
  for (const org of T1_PATTERNS.organizations) {
    if (combined.includes(org)) {
      return {
        sourceId: source.sourceId,
        suggestedTier: 'T1',
        reason: `Matches T1 organization: "${org}" - reputable multilateral/UN`,
        confidence: 0.90,
        requiresHumanReview: false,
        matchedRule: 'T1_ORGANIZATION'
      };
    }
  }

  // Rule 5: Check for T2 (research/think tanks)
  for (const org of T2_PATTERNS.organizations) {
    if (combined.includes(org)) {
      return {
        sourceId: source.sourceId,
        suggestedTier: 'T2',
        reason: `Matches T2 organization: "${org}" - research institution`,
        confidence: 0.85,
        requiresHumanReview: false,
        matchedRule: 'T2_ORGANIZATION'
      };
    }
  }

  // Rule 6: Check keywords for tier hints
  for (const keyword of T0_PATTERNS.keywords) {
    if (combined.includes(keyword)) {
      return {
        sourceId: source.sourceId,
        suggestedTier: 'T0',
        reason: `Contains T0 keyword: "${keyword}" - likely official statistics`,
        confidence: 0.75,
        requiresHumanReview: true,
        matchedRule: 'T0_KEYWORD'
      };
    }
  }

  for (const keyword of T1_PATTERNS.keywords) {
    if (combined.includes(keyword)) {
      return {
        sourceId: source.sourceId,
        suggestedTier: 'T1',
        reason: `Contains T1 keyword: "${keyword}" - likely humanitarian/operational`,
        confidence: 0.70,
        requiresHumanReview: true,
        matchedRule: 'T1_KEYWORD'
      };
    }
  }

  for (const keyword of T2_PATTERNS.keywords) {
    if (combined.includes(keyword)) {
      return {
        sourceId: source.sourceId,
        suggestedTier: 'T2',
        reason: `Contains T2 keyword: "${keyword}" - likely research`,
        confidence: 0.65,
        requiresHumanReview: true,
        matchedRule: 'T2_KEYWORD'
      };
    }
  }

  // Rule 7: Check sourceType as fallback
  if (sourceType === 'ACADEMIA') {
    return {
      sourceId: source.sourceId,
      suggestedTier: 'T2',
      reason: 'Source type is ACADEMIA - classified as research',
      confidence: 0.80,
      requiresHumanReview: false,
      matchedRule: 'ACADEMIA_SOURCE_TYPE'
    };
  }

  if (sourceType === 'RESEARCH') {
    return {
      sourceId: source.sourceId,
      suggestedTier: 'T2',
      reason: 'Source type is RESEARCH - classified as research',
      confidence: 0.75,
      requiresHumanReview: true,
      matchedRule: 'RESEARCH_SOURCE_TYPE'
    };
  }

  if (sourceType === 'COMPLIANCE') {
    return {
      sourceId: source.sourceId,
      suggestedTier: 'T1',
      reason: 'Source type is COMPLIANCE - classified as official/regulatory',
      confidence: 0.70,
      requiresHumanReview: true,
      matchedRule: 'COMPLIANCE_SOURCE_TYPE'
    };
  }

  // Rule 8: Unknown license state with DATA type
  if (licenseState === 'unknown' && sourceType === 'DATA') {
    return {
      sourceId: source.sourceId,
      suggestedTier: 'T1',
      reason: 'DATA source with unknown license - likely operational data',
      confidence: 0.60,
      requiresHumanReview: true,
      matchedRule: 'DATA_UNKNOWN_LICENSE'
    };
  }

  // Default: Cannot classify with confidence
  return {
    sourceId: source.sourceId,
    suggestedTier: 'UNKNOWN',
    reason: 'No matching classification rules - requires human review',
    confidence: 0.0,
    requiresHumanReview: true,
    matchedRule: 'NO_MATCH'
  };
}

/**
 * Bulk classify multiple sources
 */
export function bulkClassify(sources: Array<{
  sourceId: string;
  name: string;
  sourceType?: string;
  licenseState?: string;
  url?: string;
  description?: string;
  tier?: string;
}>): {
  results: ClassificationResult[];
  summary: {
    total: number;
    classified: number;
    requiresReview: number;
    byTier: Record<string, number>;
    byConfidence: { high: number; medium: number; low: number };
  };
} {
  const results = sources.map(source => classifySource(source));
  
  const summary = {
    total: results.length,
    classified: results.filter(r => r.suggestedTier !== 'UNKNOWN').length,
    requiresReview: results.filter(r => r.requiresHumanReview).length,
    byTier: {} as Record<string, number>,
    byConfidence: {
      high: results.filter(r => r.confidence >= 0.85).length,
      medium: results.filter(r => r.confidence >= 0.60 && r.confidence < 0.85).length,
      low: results.filter(r => r.confidence < 0.60).length
    }
  };

  for (const result of results) {
    summary.byTier[result.suggestedTier] = (summary.byTier[result.suggestedTier] || 0) + 1;
  }

  return { results, summary };
}

/**
 * Get allowed uses based on tier
 */
export function getAllowedUsesForTier(tier: string): string[] {
  switch (tier) {
    case 'T0':
      return ['DATA_NUMERIC', 'DATA_TIMESERIES', 'DATA_AGGREGATE', 'CITATION', 'ANALYSIS'];
    case 'T1':
      return ['DATA_NUMERIC', 'DATA_TIMESERIES', 'DATA_AGGREGATE', 'CITATION', 'ANALYSIS'];
    case 'T2':
      return ['DATA_NUMERIC', 'CITATION', 'ANALYSIS', 'RESEARCH_REFERENCE'];
    case 'T3':
      return ['EVENT_DETECTION', 'CITATION', 'NEWS_REFERENCE'];
    case 'T4':
      return ['METADATA_ONLY', 'CITATION'];
    default:
      return ['METADATA_ONLY'];
  }
}

/**
 * Validate if a source's allowedUse is compatible with its tier
 */
export function validateAllowedUse(tier: string, allowedUse: string[]): {
  valid: boolean;
  violations: string[];
} {
  const permitted = getAllowedUsesForTier(tier);
  const violations: string[] = [];

  for (const use of allowedUse) {
    if (!permitted.includes(use)) {
      violations.push(`"${use}" not permitted for tier ${tier}`);
    }
  }

  // Special rule: T3 (media) cannot have DATA_NUMERIC
  if (tier === 'T3' && allowedUse.includes('DATA_NUMERIC')) {
    violations.push('T3 (media) sources cannot have DATA_NUMERIC - use EVENT_DETECTION only');
  }

  return {
    valid: violations.length === 0,
    violations
  };
}
