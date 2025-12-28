/**
 * YETO Platform - Confidence Rating Service
 * Section 8B: Data Governance - Confidence Rating A-D
 * 
 * Rating system:
 * A = audited/official & consistent
 * B = credible but partial/lagged
 * C = proxy/modelled/uncertain
 * D = disputed/low reliability (display with warnings)
 */

import { getDb } from '../db';
import { confidenceRatings } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

// Types for confidence rating
export interface ConfidenceRatingInput {
  dataPointId: number;
  dataPointType: 'time_series' | 'geospatial' | 'document';
  
  // Rating criteria scores (0-100)
  sourceCredibility: number;
  dataCompleteness: number;
  timeliness: number;
  consistency: number;
  methodology: number;
  
  // Justification
  ratingJustification: string;
  
  // Rater info
  ratedBy: string;
}

export interface ConfidenceRatingResult {
  id: number;
  dataPointId: number;
  dataPointType: string;
  rating: 'A' | 'B' | 'C' | 'D';
  scores: {
    sourceCredibility: number;
    dataCompleteness: number;
    timeliness: number;
    consistency: number;
    methodology: number;
    overall: number;
  };
  ratingJustification: string;
  displayWarning: string | null;
  ratedBy: string;
  ratedAt: Date;
}

// Rating thresholds
const RATING_THRESHOLDS = {
  A: 85, // >= 85 = A
  B: 70, // >= 70 = B
  C: 50, // >= 50 = C
  // < 50 = D
};

// Criteria weights for overall score
const CRITERIA_WEIGHTS = {
  sourceCredibility: 0.30,
  dataCompleteness: 0.20,
  timeliness: 0.20,
  consistency: 0.15,
  methodology: 0.15,
};

// Warning messages for D-rated data
const D_RATING_WARNINGS: Record<string, string> = {
  en: 'This data has low reliability. Use with caution and verify with alternative sources.',
  ar: 'هذه البيانات ذات موثوقية منخفضة. استخدمها بحذر وتحقق من مصادر بديلة.',
};

export class ConfidenceRatingService {
  
  /**
   * Calculate and assign a confidence rating to a data point
   */
  async rateDataPoint(input: ConfidenceRatingInput): Promise<ConfidenceRatingResult> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(input);
    
    // Determine rating
    const rating = this.scoreToRating(overallScore);
    
    // Generate warning for D-rated data
    const displayWarning = rating === 'D' ? D_RATING_WARNINGS.en : null;
    
    // Check for existing rating
    const existing = await db.select()
      .from(confidenceRatings)
      .where(eq(confidenceRatings.dataPointId, input.dataPointId))
      .orderBy(desc(confidenceRatings.ratedAt))
      .limit(1);
    
    const previousRating = existing.length > 0 ? existing[0].rating : null;
    const ratingChangeReason = previousRating && previousRating !== rating
      ? `Rating changed from ${previousRating} to ${rating} based on updated criteria scores`
      : null;
    
    // Insert new rating
    const result = await db.insert(confidenceRatings).values({
      dataPointId: input.dataPointId,
      dataPointType: input.dataPointType,
      rating,
      sourceCredibility: input.sourceCredibility,
      dataCompleteness: input.dataCompleteness,
      timeliness: input.timeliness,
      consistency: input.consistency,
      methodology: input.methodology,
      ratingJustification: input.ratingJustification,
      displayWarning,
      ratedBy: input.ratedBy,
      previousRating,
      ratingChangeReason,
    });
    
    const insertId = Number((result as unknown as { insertId: number }).insertId);
    
    return {
      id: insertId,
      dataPointId: input.dataPointId,
      dataPointType: input.dataPointType,
      rating,
      scores: {
        sourceCredibility: input.sourceCredibility,
        dataCompleteness: input.dataCompleteness,
        timeliness: input.timeliness,
        consistency: input.consistency,
        methodology: input.methodology,
        overall: overallScore,
      },
      ratingJustification: input.ratingJustification,
      displayWarning,
      ratedBy: input.ratedBy,
      ratedAt: new Date(),
    };
  }
  
  /**
   * Get the current rating for a data point
   */
  async getRating(dataPointId: number, dataPointType: string): Promise<ConfidenceRatingResult | null> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const results = await db.select()
      .from(confidenceRatings)
      .where(eq(confidenceRatings.dataPointId, dataPointId))
      .orderBy(desc(confidenceRatings.ratedAt))
      .limit(1);
    
    if (results.length === 0) return null;
    
    const row = results[0];
    const overallScore = this.calculateOverallScore({
      dataPointId: row.dataPointId,
      dataPointType: row.dataPointType as 'time_series' | 'geospatial' | 'document',
      sourceCredibility: row.sourceCredibility,
      dataCompleteness: row.dataCompleteness,
      timeliness: row.timeliness,
      consistency: row.consistency,
      methodology: row.methodology,
      ratingJustification: row.ratingJustification,
      ratedBy: row.ratedBy,
    });
    
    return {
      id: row.id,
      dataPointId: row.dataPointId,
      dataPointType: row.dataPointType,
      rating: row.rating,
      scores: {
        sourceCredibility: row.sourceCredibility,
        dataCompleteness: row.dataCompleteness,
        timeliness: row.timeliness,
        consistency: row.consistency,
        methodology: row.methodology,
        overall: overallScore,
      },
      ratingJustification: row.ratingJustification,
      displayWarning: row.displayWarning,
      ratedBy: row.ratedBy,
      ratedAt: row.ratedAt,
    };
  }
  
  /**
   * Get rating history for a data point
   */
  async getRatingHistory(dataPointId: number): Promise<ConfidenceRatingResult[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const results = await db.select()
      .from(confidenceRatings)
      .where(eq(confidenceRatings.dataPointId, dataPointId))
      .orderBy(desc(confidenceRatings.ratedAt));
    
    return results.map(row => {
      const overallScore = this.calculateOverallScore({
        dataPointId: row.dataPointId,
        dataPointType: row.dataPointType as 'time_series' | 'geospatial' | 'document',
        sourceCredibility: row.sourceCredibility,
        dataCompleteness: row.dataCompleteness,
        timeliness: row.timeliness,
        consistency: row.consistency,
        methodology: row.methodology,
        ratingJustification: row.ratingJustification,
        ratedBy: row.ratedBy,
      });
      
      return {
        id: row.id,
        dataPointId: row.dataPointId,
        dataPointType: row.dataPointType,
        rating: row.rating,
        scores: {
          sourceCredibility: row.sourceCredibility,
          dataCompleteness: row.dataCompleteness,
          timeliness: row.timeliness,
          consistency: row.consistency,
          methodology: row.methodology,
          overall: overallScore,
        },
        ratingJustification: row.ratingJustification,
        displayWarning: row.displayWarning,
        ratedBy: row.ratedBy,
        ratedAt: row.ratedAt,
      };
    });
  }
  
  /**
   * Calculate overall score from criteria
   */
  private calculateOverallScore(input: ConfidenceRatingInput): number {
    return Math.round(
      input.sourceCredibility * CRITERIA_WEIGHTS.sourceCredibility +
      input.dataCompleteness * CRITERIA_WEIGHTS.dataCompleteness +
      input.timeliness * CRITERIA_WEIGHTS.timeliness +
      input.consistency * CRITERIA_WEIGHTS.consistency +
      input.methodology * CRITERIA_WEIGHTS.methodology
    );
  }
  
  /**
   * Convert overall score to rating letter
   */
  private scoreToRating(score: number): 'A' | 'B' | 'C' | 'D' {
    if (score >= RATING_THRESHOLDS.A) return 'A';
    if (score >= RATING_THRESHOLDS.B) return 'B';
    if (score >= RATING_THRESHOLDS.C) return 'C';
    return 'D';
  }
  
  /**
   * Get rating badge info for UI display
   */
  getRatingBadge(rating: 'A' | 'B' | 'C' | 'D'): {
    letter: string;
    label: string;
    labelAr: string;
    color: string;
    bgColor: string;
    description: string;
    descriptionAr: string;
  } {
    const badges = {
      A: {
        letter: 'A',
        label: 'Highly Reliable',
        labelAr: 'موثوق للغاية',
        color: '#107040',
        bgColor: '#e6f4ec',
        description: 'Official/audited data with consistent methodology',
        descriptionAr: 'بيانات رسمية/مدققة بمنهجية متسقة',
      },
      B: {
        letter: 'B',
        label: 'Reliable',
        labelAr: 'موثوق',
        color: '#1a6b9c',
        bgColor: '#e6f0f7',
        description: 'Credible source but may have partial coverage or lag',
        descriptionAr: 'مصدر موثوق لكن قد يكون جزئي التغطية أو متأخر',
      },
      C: {
        letter: 'C',
        label: 'Moderate',
        labelAr: 'متوسط',
        color: '#C0A030',
        bgColor: '#faf6e6',
        description: 'Proxy/modelled data with some uncertainty',
        descriptionAr: 'بيانات تقريبية/نموذجية مع بعض عدم اليقين',
      },
      D: {
        letter: 'D',
        label: 'Low Reliability',
        labelAr: 'موثوقية منخفضة',
        color: '#c53030',
        bgColor: '#fde8e8',
        description: 'Disputed or low reliability - use with caution',
        descriptionAr: 'متنازع عليها أو منخفضة الموثوقية - استخدم بحذر',
      },
    };
    
    return badges[rating];
  }
  
  /**
   * Auto-rate based on source characteristics
   */
  autoRateFromSource(sourceType: string, characteristics: {
    isOfficial: boolean;
    isAudited: boolean;
    hasMethodology: boolean;
    coveragePercent: number;
    lagDays: number;
    hasContradictions: boolean;
  }): ConfidenceRatingInput {
    // Calculate scores based on characteristics
    let sourceCredibility = 50;
    if (characteristics.isOfficial) sourceCredibility += 30;
    if (characteristics.isAudited) sourceCredibility += 20;
    
    let methodology = 50;
    if (characteristics.hasMethodology) methodology += 40;
    if (characteristics.isAudited) methodology += 10;
    
    const dataCompleteness = Math.min(100, characteristics.coveragePercent);
    
    let timeliness = 100;
    if (characteristics.lagDays > 7) timeliness -= 10;
    if (characteristics.lagDays > 30) timeliness -= 20;
    if (characteristics.lagDays > 90) timeliness -= 30;
    if (characteristics.lagDays > 180) timeliness -= 20;
    timeliness = Math.max(0, timeliness);
    
    let consistency = 80;
    if (characteristics.hasContradictions) consistency -= 40;
    
    return {
      dataPointId: 0, // To be filled by caller
      dataPointType: 'time_series',
      sourceCredibility: Math.min(100, sourceCredibility),
      dataCompleteness,
      timeliness,
      consistency,
      methodology: Math.min(100, methodology),
      ratingJustification: `Auto-rated based on source characteristics: ${sourceType}`,
      ratedBy: 'system',
    };
  }
}

// Export singleton instance
export const confidenceRatingService = new ConfidenceRatingService();
