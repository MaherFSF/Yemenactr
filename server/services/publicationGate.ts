/**
 * Publication Gating System
 * 
 * Enforces that no KPI, event, alert, or report can be published without
 * passing the Evidence Tribunal with PASS or PASS_WARN verdict.
 * 
 * All publications are logged to an append-only audit trail.
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { runTribunal, quickVerify, TribunalResult, TribunalVerdict } from "./evidenceTribunal";
import { shouldBlockDeployment } from "./reliabilityLab";

export type PublishableType = 'kpi' | 'event' | 'alert' | 'report' | 'page' | 'data_export';

export interface PublishRequest {
  contentType: PublishableType;
  contentId: number;
  content: string;
  subject?: string;
  pageContext?: string;
  yearContext?: number;
  regimeTag?: 'aden' | 'sanaa' | 'both';
  requestedBy?: string;
  forcePublish?: boolean; // Admin override
}

export interface PublishResult {
  allowed: boolean;
  verdict: TribunalVerdict;
  publishedAt?: Date;
  publicationId?: number;
  warnings: string[];
  blockedReason?: string;
  tribunalResult?: TribunalResult;
}

/**
 * Check if content can be published
 */
export async function canPublish(request: PublishRequest): Promise<{
  canPublish: boolean;
  reason: string;
  warnings: string[];
}> {
  // Check if deployment is blocked by reliability lab
  const deploymentCheck = await shouldBlockDeployment();
  if (deploymentCheck.blocked && !request.forcePublish) {
    return {
      canPublish: false,
      reason: `Deployment blocked: ${deploymentCheck.reason}`,
      warnings: []
    };
  }
  
  // Quick verify if recent tribunal run exists
  const quickResult = await quickVerify(request.contentId);
  
  if (quickResult.canPublish) {
    return {
      canPublish: true,
      reason: `Recent tribunal verdict: ${quickResult.verdict}`,
      warnings: quickResult.warnings
    };
  }
  
  return {
    canPublish: false,
    reason: 'No recent tribunal verification - full tribunal run required',
    warnings: quickResult.warnings
  };
}

/**
 * Request publication with full tribunal verification
 */
export async function requestPublication(request: PublishRequest): Promise<PublishResult> {
  const db = await getDb();
  
  // Check deployment status first
  const deploymentCheck = await shouldBlockDeployment();
  if (deploymentCheck.blocked && !request.forcePublish) {
    return {
      allowed: false,
      verdict: 'FAIL',
      warnings: [],
      blockedReason: `Deployment blocked: ${deploymentCheck.reason}`
    };
  }
  
  // Run full tribunal
  const tribunalResult = await runTribunal({
    claimId: request.contentId,
    claimType: request.contentType,
    content: request.content,
    subject: request.subject,
    pageContext: request.pageContext,
    yearContext: request.yearContext,
    regimeTag: request.regimeTag
  });
  
  // Determine if publication is allowed
  const allowed = tribunalResult.verdict === 'PASS' || tribunalResult.verdict === 'PASS_WARN';
  
  // Log to publication audit trail
  let publicationId: number | undefined;
  const publishedAt = new Date();
  
  if (db) {
    try {
      const result = await db.execute(sql`
        INSERT INTO publication_log (
          contentType, contentId, content, verdict, citationCoveragePercent,
          contradictionScore, evidenceStrength, uncertaintyScore,
          publishableText, warningsJson, requestedBy, forcePublish,
          allowed, blockedReason, publishedAt
        ) VALUES (
          ${request.contentType}, ${request.contentId}, ${request.content},
          ${tribunalResult.verdict}, ${tribunalResult.citationCoveragePercent},
          ${tribunalResult.contradictionScore}, ${tribunalResult.evidenceStrength},
          ${tribunalResult.uncertaintyScore}, ${tribunalResult.publishableText},
          ${JSON.stringify(tribunalResult.warnings)}, ${request.requestedBy || 'system'},
          ${request.forcePublish || false}, ${allowed},
          ${allowed ? null : 'Tribunal verdict: ' + tribunalResult.verdict},
          ${publishedAt}
        )
      `);
      
      const rows = (result as any)[0];
      publicationId = rows?.insertId;
    } catch (error) {
      console.error('Error logging publication:', error);
    }
  }
  
  return {
    allowed,
    verdict: tribunalResult.verdict,
    publishedAt: allowed ? publishedAt : undefined,
    publicationId,
    warnings: tribunalResult.warnings,
    blockedReason: allowed ? undefined : `Tribunal verdict: ${tribunalResult.verdict}`,
    tribunalResult
  };
}

/**
 * Force publish with admin override (logged)
 */
export async function forcePublish(
  request: PublishRequest,
  adminUserId: string,
  justification: string
): Promise<PublishResult> {
  const db = await getDb();
  
  // Run tribunal anyway for audit purposes
  const tribunalResult = await runTribunal({
    claimId: request.contentId,
    claimType: request.contentType,
    content: request.content,
    subject: request.subject,
    pageContext: request.pageContext,
    yearContext: request.yearContext,
    regimeTag: request.regimeTag
  });
  
  // Log forced publication
  let publicationId: number | undefined;
  const publishedAt = new Date();
  
  if (db) {
    try {
      const result = await db.execute(sql`
        INSERT INTO publication_log (
          contentType, contentId, content, verdict, citationCoveragePercent,
          contradictionScore, evidenceStrength, uncertaintyScore,
          publishableText, warningsJson, requestedBy, forcePublish,
          allowed, blockedReason, publishedAt
        ) VALUES (
          ${request.contentType}, ${request.contentId}, ${request.content},
          ${tribunalResult.verdict}, ${tribunalResult.citationCoveragePercent},
          ${tribunalResult.contradictionScore}, ${tribunalResult.evidenceStrength},
          ${tribunalResult.uncertaintyScore}, ${tribunalResult.publishableText},
          ${JSON.stringify([...tribunalResult.warnings, `FORCE PUBLISHED by ${adminUserId}: ${justification}`])},
          ${adminUserId}, ${true}, ${true},
          ${`FORCE OVERRIDE: Original verdict was ${tribunalResult.verdict}`},
          ${publishedAt}
        )
      `);
      
      const rows = (result as any)[0];
      publicationId = rows?.insertId;
    } catch (error) {
      console.error('Error logging forced publication:', error);
    }
  }
  
  return {
    allowed: true,
    verdict: tribunalResult.verdict,
    publishedAt,
    publicationId,
    warnings: [...tribunalResult.warnings, `FORCE PUBLISHED: ${justification}`],
    tribunalResult
  };
}

/**
 * Get publication history for content
 */
export async function getPublicationHistory(
  contentType: PublishableType,
  contentId: number
): Promise<Array<{
  id: number;
  verdict: string;
  allowed: boolean;
  publishedAt: Date;
  requestedBy: string;
  forcePublish: boolean;
  warnings: string[];
}>> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT id, verdict, allowed, publishedAt, requestedBy, forcePublish, warningsJson
      FROM publication_log
      WHERE contentType = ${contentType} AND contentId = ${contentId}
      ORDER BY publishedAt DESC
    `);
    
    const rows = (result as any)[0] || [];
    return rows.map((row: any) => ({
      id: row.id,
      verdict: row.verdict,
      allowed: row.allowed,
      publishedAt: row.publishedAt,
      requestedBy: row.requestedBy,
      forcePublish: row.forcePublish,
      warnings: JSON.parse(row.warningsJson || '[]')
    }));
  } catch (error) {
    console.error('Error getting publication history:', error);
    return [];
  }
}

/**
 * Get publication statistics
 */
export async function getPublicationStats(): Promise<{
  totalPublications: number;
  passRate: number;
  forcePublishCount: number;
  avgCitationCoverage: number;
  recentPublications: Array<{
    contentType: string;
    contentId: number;
    verdict: string;
    publishedAt: Date;
  }>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalPublications: 0,
      passRate: 0,
      forcePublishCount: 0,
      avgCitationCoverage: 0,
      recentPublications: []
    };
  }
  
  try {
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as totalPublications,
        AVG(CASE WHEN allowed = true THEN 1 ELSE 0 END) * 100 as passRate,
        SUM(CASE WHEN forcePublish = true THEN 1 ELSE 0 END) as forcePublishCount,
        AVG(citationCoveragePercent) as avgCitationCoverage
      FROM publication_log
    `);
    
    const recent = await db.execute(sql`
      SELECT contentType, contentId, verdict, publishedAt
      FROM publication_log
      ORDER BY publishedAt DESC
      LIMIT 10
    `);
    
    const statsRows = (stats as any)[0] || [];
    const row = statsRows[0] || {};
    const recentRows = (recent as any)[0] || [];
    
    return {
      totalPublications: Number(row.totalPublications) || 0,
      passRate: Number(row.passRate) || 0,
      forcePublishCount: Number(row.forcePublishCount) || 0,
      avgCitationCoverage: Number(row.avgCitationCoverage) || 0,
      recentPublications: recentRows.map((r: any) => ({
        contentType: r.contentType,
        contentId: r.contentId,
        verdict: r.verdict,
        publishedAt: r.publishedAt
      }))
    };
  } catch (error) {
    console.error('Error getting publication stats:', error);
    return {
      totalPublications: 0,
      passRate: 0,
      forcePublishCount: 0,
      avgCitationCoverage: 0,
      recentPublications: []
    };
  }
}

/**
 * Middleware function to gate API responses
 */
export async function gateResponse<T>(
  contentType: PublishableType,
  contentId: number,
  content: string,
  responseData: T
): Promise<{
  data: T;
  gated: boolean;
  verdict?: TribunalVerdict;
  warnings?: string[];
  publishableText?: string;
}> {
  // Quick check first
  const quickResult = await quickVerify(contentId);
  
  if (quickResult.canPublish) {
    return {
      data: responseData,
      gated: false,
      verdict: quickResult.verdict,
      warnings: quickResult.warnings
    };
  }
  
  // Need full tribunal
  const publishResult = await requestPublication({
    contentType,
    contentId,
    content
  });
  
  if (publishResult.allowed) {
    return {
      data: responseData,
      gated: false,
      verdict: publishResult.verdict,
      warnings: publishResult.warnings,
      publishableText: publishResult.tribunalResult?.publishableText
    };
  }
  
  // Content is gated - return with warning
  return {
    data: responseData,
    gated: true,
    verdict: publishResult.verdict,
    warnings: [...(publishResult.warnings || []), publishResult.blockedReason || 'Content failed verification'],
    publishableText: publishResult.tribunalResult?.publishableText
  };
}
