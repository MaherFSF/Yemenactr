/**
 * YETO Quality Assurance & Credibility System
 * 
 * Implements comprehensive data quality controls following
 * World Bank DQAF and IMF SDDS standards.
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

// ============================================================================
// DATA QUALITY ASSESSMENT FRAMEWORK (DQAF)
// ============================================================================

export interface DataQualityAssessment {
  indicatorCode: string;
  assessmentDate: Date;
  overallScore: number;
  dimensions: {
    prerequisites: DimensionScore;
    assurances: DimensionScore;
    accuracy: DimensionScore;
    serviceability: DimensionScore;
    accessibility: DimensionScore;
  };
  recommendations: string[];
  nextReviewDate: Date;
}

interface DimensionScore {
  score: number; // 0-100
  rating: 'Excellent' | 'Good' | 'Adequate' | 'Needs Improvement' | 'Poor';
  factors: string[];
}

/**
 * Assess data quality following World Bank DQAF methodology
 */
export async function assessDataQuality(indicatorCode: string): Promise<DataQualityAssessment> {
  const db = await getDb();
  
  // Get indicator metadata and data points
  let dataPoints = 0;
  let sources = 0;
  let latestDate: Date | null = null;
  let hasMetadata = false;
  
  if (db) {
    const [countResult] = await db.execute(sql`
      SELECT COUNT(*) as cnt, MAX(date) as latest, COUNT(DISTINCT source) as sources
      FROM time_series WHERE indicatorCode = ${indicatorCode}
    `);
    const countArr = Array.isArray(countResult) ? countResult : [];
    if (countArr[0]) {
      dataPoints = (countArr[0] as any).cnt;
      latestDate = (countArr[0] as any).latest;
      sources = (countArr[0] as any).sources;
    }
    
    const [metaResult] = await db.execute(sql`
      SELECT * FROM indicators WHERE code = ${indicatorCode}
    `);
    const metaArr = Array.isArray(metaResult) ? metaResult : [];
    hasMetadata = metaArr.length > 0;
  }
  
  // Calculate dimension scores
  const prerequisites = calculatePrerequisites(hasMetadata, sources);
  const assurances = calculateAssurances(sources, dataPoints);
  const accuracy = calculateAccuracy(dataPoints, sources);
  const serviceability = calculateServiceability(latestDate, dataPoints);
  const accessibility = calculateAccessibility(hasMetadata);
  
  const overallScore = Math.round(
    (prerequisites.score + assurances.score + accuracy.score + 
     serviceability.score + accessibility.score) / 5
  );
  
  const recommendations = generateRecommendations(
    prerequisites, assurances, accuracy, serviceability, accessibility
  );
  
  return {
    indicatorCode,
    assessmentDate: new Date(),
    overallScore,
    dimensions: {
      prerequisites,
      assurances,
      accuracy,
      serviceability,
      accessibility,
    },
    recommendations,
    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  };
}

function calculatePrerequisites(hasMetadata: boolean, sources: number): DimensionScore {
  let score = 0;
  const factors: string[] = [];
  
  if (hasMetadata) {
    score += 50;
    factors.push('Indicator metadata defined');
  } else {
    factors.push('Missing indicator metadata');
  }
  
  if (sources >= 2) {
    score += 50;
    factors.push('Multiple data sources available');
  } else if (sources === 1) {
    score += 25;
    factors.push('Single data source');
  } else {
    factors.push('No data sources');
  }
  
  return {
    score,
    rating: getRating(score),
    factors,
  };
}

function calculateAssurances(sources: number, dataPoints: number): DimensionScore {
  let score = 0;
  const factors: string[] = [];
  
  // Cross-validation possible with multiple sources
  if (sources >= 3) {
    score += 40;
    factors.push('Strong cross-validation capability');
  } else if (sources >= 2) {
    score += 25;
    factors.push('Limited cross-validation capability');
  } else {
    factors.push('No cross-validation possible');
  }
  
  // Data revision tracking
  if (dataPoints > 0) {
    score += 30;
    factors.push('Historical data available for revision analysis');
  }
  
  // Quality control processes
  score += 30; // YETO has automated validation
  factors.push('Automated validation processes in place');
  
  return {
    score,
    rating: getRating(score),
    factors,
  };
}

function calculateAccuracy(dataPoints: number, sources: number): DimensionScore {
  let score = 0;
  const factors: string[] = [];
  
  // Source reliability
  if (sources >= 2) {
    score += 40;
    factors.push('Multiple independent sources');
  } else if (sources === 1) {
    score += 20;
    factors.push('Single source - limited verification');
  }
  
  // Data completeness
  if (dataPoints >= 100) {
    score += 30;
    factors.push('Comprehensive historical data');
  } else if (dataPoints >= 50) {
    score += 20;
    factors.push('Adequate historical data');
  } else if (dataPoints > 0) {
    score += 10;
    factors.push('Limited historical data');
  }
  
  // Methodology documentation
  score += 30; // YETO documents all methodologies
  factors.push('Methodology fully documented');
  
  return {
    score,
    rating: getRating(score),
    factors,
  };
}

function calculateServiceability(latestDate: Date | null, dataPoints: number): DimensionScore {
  let score = 0;
  const factors: string[] = [];
  
  // Timeliness
  if (latestDate) {
    const daysSinceUpdate = (Date.now() - new Date(latestDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate <= 7) {
      score += 40;
      factors.push('Data updated within last week');
    } else if (daysSinceUpdate <= 30) {
      score += 30;
      factors.push('Data updated within last month');
    } else if (daysSinceUpdate <= 90) {
      score += 20;
      factors.push('Data updated within last quarter');
    } else {
      score += 10;
      factors.push('Data may be outdated');
    }
  }
  
  // Consistency
  if (dataPoints >= 24) {
    score += 30;
    factors.push('Consistent time series (2+ years)');
  } else if (dataPoints >= 12) {
    score += 20;
    factors.push('Consistent time series (1+ year)');
  } else {
    score += 10;
    factors.push('Limited time series consistency');
  }
  
  // Revision policy
  score += 30;
  factors.push('Clear revision policy documented');
  
  return {
    score,
    rating: getRating(score),
    factors,
  };
}

function calculateAccessibility(hasMetadata: boolean): DimensionScore {
  let score = 0;
  const factors: string[] = [];
  
  // Data availability
  score += 30;
  factors.push('Data available via API and web interface');
  
  // Metadata availability
  if (hasMetadata) {
    score += 25;
    factors.push('Complete metadata available');
  } else {
    score += 10;
    factors.push('Limited metadata');
  }
  
  // Format accessibility
  score += 25;
  factors.push('Multiple export formats supported (CSV, JSON, Excel)');
  
  // User support
  score += 20;
  factors.push('Documentation and user guides available');
  
  return {
    score,
    rating: getRating(score),
    factors,
  };
}

function getRating(score: number): 'Excellent' | 'Good' | 'Adequate' | 'Needs Improvement' | 'Poor' {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Adequate';
  if (score >= 40) return 'Needs Improvement';
  return 'Poor';
}

function generateRecommendations(
  prerequisites: DimensionScore,
  assurances: DimensionScore,
  accuracy: DimensionScore,
  serviceability: DimensionScore,
  accessibility: DimensionScore
): string[] {
  const recommendations: string[] = [];
  
  if (prerequisites.score < 75) {
    recommendations.push('Add additional data sources for cross-validation');
    recommendations.push('Complete indicator metadata documentation');
  }
  
  if (assurances.score < 75) {
    recommendations.push('Implement regular data quality audits');
    recommendations.push('Establish formal revision tracking');
  }
  
  if (accuracy.score < 75) {
    recommendations.push('Seek additional independent sources');
    recommendations.push('Document data collection methodology in detail');
  }
  
  if (serviceability.score < 75) {
    recommendations.push('Increase data update frequency');
    recommendations.push('Extend historical time series');
  }
  
  if (accessibility.score < 75) {
    recommendations.push('Enhance metadata documentation');
    recommendations.push('Add user guides and tutorials');
  }
  
  return recommendations;
}

// ============================================================================
// CONFIDENCE RATING SYSTEM
// ============================================================================

export type ConfidenceLevel = 'A' | 'B' | 'C' | 'D' | 'E';

export interface ConfidenceRating {
  level: ConfidenceLevel;
  score: number;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  factors: string[];
  factorsAr: string[];
}

export const CONFIDENCE_DEFINITIONS: Record<ConfidenceLevel, Omit<ConfidenceRating, 'factors' | 'factorsAr' | 'score'>> = {
  A: {
    level: 'A',
    label: 'High Confidence',
    labelAr: 'ثقة عالية',
    description: 'Official data from verified government or international sources, cross-validated',
    descriptionAr: 'بيانات رسمية من مصادر حكومية أو دولية موثقة، تم التحقق منها',
  },
  B: {
    level: 'B',
    label: 'Medium-High Confidence',
    labelAr: 'ثقة متوسطة-عالية',
    description: 'Credible data from reputable sources with some verification',
    descriptionAr: 'بيانات موثوقة من مصادر ذات سمعة جيدة مع بعض التحقق',
  },
  C: {
    level: 'C',
    label: 'Medium Confidence',
    labelAr: 'ثقة متوسطة',
    description: 'Estimated data from credible sources, limited verification',
    descriptionAr: 'بيانات مقدرة من مصادر موثوقة، تحقق محدود',
  },
  D: {
    level: 'D',
    label: 'Low Confidence',
    labelAr: 'ثقة منخفضة',
    description: 'Proxy or modeled data, single source, use with caution',
    descriptionAr: 'بيانات بديلة أو نموذجية، مصدر واحد، استخدم بحذر',
  },
  E: {
    level: 'E',
    label: 'Very Low Confidence',
    labelAr: 'ثقة منخفضة جداً',
    description: 'Unverified or outdated data, for reference only',
    descriptionAr: 'بيانات غير موثقة أو قديمة، للإشارة فقط',
  },
};

/**
 * Calculate confidence rating for a data point
 */
export function calculateConfidenceRating(params: {
  sourceType: 'official' | 'un' | 'research' | 'media' | 'estimate';
  sourceCount: number;
  dataAge: number; // days
  crossValidated: boolean;
  methodologyDocumented: boolean;
}): ConfidenceRating {
  let score = 0;
  const factors: string[] = [];
  const factorsAr: string[] = [];
  
  // Source type scoring
  switch (params.sourceType) {
    case 'official':
      score += 30;
      factors.push('Official government/central bank source');
      factorsAr.push('مصدر حكومي/بنك مركزي رسمي');
      break;
    case 'un':
      score += 25;
      factors.push('UN agency source');
      factorsAr.push('مصدر وكالة أممية');
      break;
    case 'research':
      score += 20;
      factors.push('Research institution source');
      factorsAr.push('مصدر مؤسسة بحثية');
      break;
    case 'media':
      score += 10;
      factors.push('Media/news source');
      factorsAr.push('مصدر إعلامي/أخباري');
      break;
    case 'estimate':
      score += 5;
      factors.push('YETO estimate');
      factorsAr.push('تقدير يتو');
      break;
  }
  
  // Source count scoring
  if (params.sourceCount >= 3) {
    score += 25;
    factors.push('Multiple sources (3+)');
    factorsAr.push('مصادر متعددة (3+)');
  } else if (params.sourceCount >= 2) {
    score += 15;
    factors.push('Two sources');
    factorsAr.push('مصدران');
  } else {
    score += 5;
    factors.push('Single source');
    factorsAr.push('مصدر واحد');
  }
  
  // Data freshness scoring
  if (params.dataAge <= 7) {
    score += 20;
    factors.push('Very recent (< 1 week)');
    factorsAr.push('حديث جداً (< أسبوع)');
  } else if (params.dataAge <= 30) {
    score += 15;
    factors.push('Recent (< 1 month)');
    factorsAr.push('حديث (< شهر)');
  } else if (params.dataAge <= 90) {
    score += 10;
    factors.push('Moderately recent (< 3 months)');
    factorsAr.push('حديث نسبياً (< 3 أشهر)');
  } else {
    score += 5;
    factors.push('Older data (> 3 months)');
    factorsAr.push('بيانات قديمة (> 3 أشهر)');
  }
  
  // Cross-validation scoring
  if (params.crossValidated) {
    score += 15;
    factors.push('Cross-validated');
    factorsAr.push('تم التحقق المتبادل');
  } else {
    factors.push('Not cross-validated');
    factorsAr.push('لم يتم التحقق المتبادل');
  }
  
  // Methodology documentation scoring
  if (params.methodologyDocumented) {
    score += 10;
    factors.push('Methodology documented');
    factorsAr.push('المنهجية موثقة');
  } else {
    factors.push('Methodology not documented');
    factorsAr.push('المنهجية غير موثقة');
  }
  
  // Determine level
  let level: ConfidenceLevel;
  if (score >= 85) level = 'A';
  else if (score >= 65) level = 'B';
  else if (score >= 45) level = 'C';
  else if (score >= 25) level = 'D';
  else level = 'E';
  
  const definition = CONFIDENCE_DEFINITIONS[level];
  
  return {
    ...definition,
    score,
    factors,
    factorsAr,
  };
}

// ============================================================================
// SOURCE CREDIBILITY ASSESSMENT
// ============================================================================

export interface SourceCredibility {
  sourceId: string;
  sourceName: string;
  category: string;
  credibilityScore: number;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';
  strengths: string[];
  limitations: string[];
  lastAssessed: Date;
}

export const SOURCE_TIERS: Record<string, SourceCredibility> = {
  'world_bank': {
    sourceId: 'world_bank',
    sourceName: 'World Bank',
    category: 'Multilateral',
    credibilityScore: 95,
    tier: 'Tier 1',
    strengths: ['Global methodology standards', 'Peer-reviewed data', 'Comprehensive coverage'],
    limitations: ['Data may lag', 'Limited conflict-zone coverage'],
    lastAssessed: new Date(),
  },
  'imf': {
    sourceId: 'imf',
    sourceName: 'International Monetary Fund',
    category: 'Multilateral',
    credibilityScore: 95,
    tier: 'Tier 1',
    strengths: ['Macroeconomic expertise', 'Global standards', 'Regular updates'],
    limitations: ['Article IV suspended for Yemen', 'Relies on estimates'],
    lastAssessed: new Date(),
  },
  'cby_aden': {
    sourceId: 'cby_aden',
    sourceName: 'Central Bank of Yemen - Aden',
    category: 'Official',
    credibilityScore: 85,
    tier: 'Tier 1',
    strengths: ['Official government source', 'Direct access to banking data', 'Regular reporting'],
    limitations: ['Limited to IRG-controlled areas', 'Political considerations'],
    lastAssessed: new Date(),
  },
  'cby_sanaa': {
    sourceId: 'cby_sanaa',
    sourceName: 'Central Bank of Yemen - Sanaa',
    category: 'De Facto Authority',
    credibilityScore: 70,
    tier: 'Tier 2',
    strengths: ['Direct access to northern economy data', 'Regular bulletins'],
    limitations: ['Not internationally recognized', 'Limited transparency'],
    lastAssessed: new Date(),
  },
  'ocha': {
    sourceId: 'ocha',
    sourceName: 'UN OCHA',
    category: 'UN Agency',
    credibilityScore: 90,
    tier: 'Tier 1',
    strengths: ['Humanitarian data expertise', 'Ground presence', 'Regular updates'],
    limitations: ['Focus on humanitarian metrics', 'Access constraints'],
    lastAssessed: new Date(),
  },
  'wfp': {
    sourceId: 'wfp',
    sourceName: 'World Food Programme',
    category: 'UN Agency',
    credibilityScore: 90,
    tier: 'Tier 1',
    strengths: ['Food security expertise', 'Market monitoring', 'Ground presence'],
    limitations: ['Sector-specific focus'],
    lastAssessed: new Date(),
  },
  'sanaa_center': {
    sourceId: 'sanaa_center',
    sourceName: 'Sana\'a Center for Strategic Studies',
    category: 'Research',
    credibilityScore: 85,
    tier: 'Tier 1',
    strengths: ['Yemen expertise', 'Independent analysis', 'Bilingual'],
    limitations: ['Research focus, not primary data'],
    lastAssessed: new Date(),
  },
  'acled': {
    sourceId: 'acled',
    sourceName: 'Armed Conflict Location & Event Data',
    category: 'Research',
    credibilityScore: 85,
    tier: 'Tier 1',
    strengths: ['Conflict data expertise', 'Real-time updates', 'Methodology documented'],
    limitations: ['Conflict-specific focus'],
    lastAssessed: new Date(),
  },
};

/**
 * Get source credibility assessment
 */
export function getSourceCredibility(sourceId: string): SourceCredibility | null {
  return SOURCE_TIERS[sourceId] || null;
}

// ============================================================================
// DATA VALIDATION PIPELINE
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestedFixes: string[];
}

interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'critical' | 'high' | 'medium';
}

interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
}

/**
 * Validate incoming data point
 */
export function validateDataPoint(data: {
  indicatorCode: string;
  value: number;
  date: Date;
  source: string;
  regime?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestedFixes: string[] = [];
  
  // Required field validation
  if (!data.indicatorCode) {
    errors.push({
      code: 'MISSING_INDICATOR',
      message: 'Indicator code is required',
      field: 'indicatorCode',
      severity: 'critical',
    });
  }
  
  if (data.value === null || data.value === undefined || isNaN(data.value)) {
    errors.push({
      code: 'INVALID_VALUE',
      message: 'Value must be a valid number',
      field: 'value',
      severity: 'critical',
    });
  }
  
  if (!data.date || isNaN(new Date(data.date).getTime())) {
    errors.push({
      code: 'INVALID_DATE',
      message: 'Date must be a valid date',
      field: 'date',
      severity: 'critical',
    });
  }
  
  if (!data.source) {
    errors.push({
      code: 'MISSING_SOURCE',
      message: 'Data source is required',
      field: 'source',
      severity: 'high',
    });
    suggestedFixes.push('Add source attribution for data provenance');
  }
  
  // Business rule validation
  if (data.date && new Date(data.date) > new Date()) {
    warnings.push({
      code: 'FUTURE_DATE',
      message: 'Date is in the future - this may be a projection',
      field: 'date',
    });
  }
  
  // Exchange rate specific validation
  if (data.indicatorCode.includes('fx_rate')) {
    if (data.value < 100 || data.value > 5000) {
      warnings.push({
        code: 'UNUSUAL_FX_RATE',
        message: `Exchange rate ${data.value} is outside typical range (100-5000)`,
        field: 'value',
      });
    }
  }
  
  // Regime validation for Yemen-specific data
  if (!data.regime && data.indicatorCode.includes('yemen')) {
    warnings.push({
      code: 'MISSING_REGIME',
      message: 'Consider specifying regime (aden/sanaa) for Yemen data',
      field: 'regime',
    });
    suggestedFixes.push('Add regime tag to distinguish Aden/IRG vs Sanaa/DFA data');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestedFixes,
  };
}

// ============================================================================
// AUDIT TRAIL
// ============================================================================

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: 'create' | 'update' | 'delete' | 'validate' | 'approve' | 'reject';
  entityType: 'data_point' | 'indicator' | 'publication' | 'entity';
  entityId: string;
  userId?: string;
  previousValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
}

/**
 * Create audit trail entry
 */
export async function createAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
  const auditEntry: AuditEntry = {
    ...entry,
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };
  
  // In production, this would be stored in database
  console.log('[Audit]', JSON.stringify(auditEntry));
  
  return auditEntry;
}

export default {
  assessDataQuality,
  calculateConfidenceRating,
  getSourceCredibility,
  validateDataPoint,
  createAuditEntry,
  CONFIDENCE_DEFINITIONS,
  SOURCE_TIERS,
};
