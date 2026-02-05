/**
 * S3 Signed URL Service
 * 
 * Generates time-limited signed URLs for document downloads
 * with licensing and access control enforcement
 */

import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getDb } from '../db';
import { sql } from 'drizzle-orm';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  } : undefined
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'yeto-documents';

// License types and their access rules
export const LICENSE_TYPES = {
  OPEN: 'open',
  RESTRICTED_METADATA_ONLY: 'restricted_metadata_only',
  UNKNOWN_REQUIRES_REVIEW: 'unknown_requires_review',
  CC_BY: 'cc_by',
  CC_BY_NC: 'cc_by_nc',
  CC_BY_SA: 'cc_by_sa',
  CC_BY_ND: 'cc_by_nd',
  PROPRIETARY: 'proprietary'
} as const;

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  RESEARCHER: 'researcher',
  INSTITUTIONAL: 'institutional'
} as const;

export interface DocumentAccessRequest {
  documentId: number;
  userId?: number;
  userSubscriptionTier?: keyof typeof SUBSCRIPTION_TIERS;
  userRole?: string;
  purpose?: 'download' | 'view' | 'print';
}

export interface SignedUrlResponse {
  url: string;
  expiresAt: Date;
  expiresIn: number; // seconds
  licenseNotice: string;
  licenseTerms?: string;
  canDownload: boolean;
  canPrint: boolean;
  canModify: boolean;
  attribution: string;
}

export interface AccessDeniedResponse {
  allowed: false;
  reason: string;
  requiredTier?: string;
  upgradeUrl?: string;
}

/**
 * Generate signed URL for document access
 */
export async function generateDocumentSignedUrl(
  request: DocumentAccessRequest
): Promise<SignedUrlResponse | AccessDeniedResponse> {
  const db = await getDb();
  if (!db) {
    return {
      allowed: false,
      reason: 'Database unavailable'
    };
  }

  try {
    // Get document details
    const docResult = await db.execute(sql`
      SELECT 
        ld.id,
        ld.titleEn,
        ld.titleAr,
        ld.publisherName,
        ld.licenseFlag,
        ld.licenseDetails,
        ld.status,
        dv.s3OriginalKey,
        dv.s3OriginalUrl,
        dv.mimeType,
        sr.license as sourceLicense,
        sr.publisher as sourcePublisher
      FROM library_documents ld
      LEFT JOIN document_versions dv ON ld.currentVersionId = dv.id
      LEFT JOIN source_registry sr ON ld.sourceId = sr.id
      WHERE ld.id = ${request.documentId}
      LIMIT 1
    `);

    const doc = (docResult as any)[0]?.[0];
    if (!doc) {
      return {
        allowed: false,
        reason: 'Document not found'
      };
    }

    // Check if document is published
    if (doc.status !== 'published') {
      return {
        allowed: false,
        reason: 'Document not yet published'
      };
    }

    // Check license restrictions
    const accessCheck = checkLicenseAccess(
      doc.licenseFlag,
      request.userSubscriptionTier,
      request.userRole,
      request.purpose
    );

    if (!accessCheck.allowed) {
      return accessCheck;
    }

    // Generate S3 signed URL
    const s3Key = doc.s3OriginalKey;
    if (!s3Key) {
      return {
        allowed: false,
        reason: 'Document file not available'
      };
    }

    const expiresIn = getExpirationTime(
      doc.licenseFlag,
      request.userSubscriptionTier,
      request.purpose
    );

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ResponseContentDisposition: request.purpose === 'download' 
        ? `attachment; filename="${doc.titleEn}.pdf"`
        : 'inline'
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn
    });

    // Log access
    await logDocumentAccess(request.documentId, request.userId, request.purpose);

    // Generate license notice and attribution
    const { licenseNotice, licenseTerms, attribution } = generateLicenseNotice(
      doc.licenseFlag,
      doc.licenseDetails,
      doc.publisherName,
      doc.titleEn
    );

    const canDownload = accessCheck.permissions.canDownload;
    const canPrint = accessCheck.permissions.canPrint;
    const canModify = accessCheck.permissions.canModify;

    return {
      url,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      expiresIn,
      licenseNotice,
      licenseTerms,
      canDownload,
      canPrint,
      canModify,
      attribution
    };
  } catch (error) {
    console.error('[S3SignedUrl] Error generating signed URL:', error);
    return {
      allowed: false,
      reason: 'Failed to generate access URL'
    };
  }
}

/**
 * Check if user can access document based on license
 */
function checkLicenseAccess(
  license: string,
  userTier?: keyof typeof SUBSCRIPTION_TIERS,
  userRole?: string,
  purpose?: string
): AccessDeniedResponse | {
  allowed: true;
  permissions: {
    canDownload: boolean;
    canPrint: boolean;
    canModify: boolean;
  };
} {
  // Admin can access everything
  if (userRole === 'admin' || userRole === 'editor') {
    return {
      allowed: true,
      permissions: {
        canDownload: true,
        canPrint: true,
        canModify: false
      }
    };
  }

  switch (license) {
    case LICENSE_TYPES.OPEN:
    case LICENSE_TYPES.CC_BY:
    case LICENSE_TYPES.CC_BY_SA:
      // Open access for all
      return {
        allowed: true,
        permissions: {
          canDownload: true,
          canPrint: true,
          canModify: false
        }
      };

    case LICENSE_TYPES.CC_BY_NC:
      // Non-commercial use only
      return {
        allowed: true,
        permissions: {
          canDownload: true,
          canPrint: true,
          canModify: false
        }
      };

    case LICENSE_TYPES.CC_BY_ND:
      // No derivatives
      return {
        allowed: true,
        permissions: {
          canDownload: true,
          canPrint: true,
          canModify: false
        }
      };

    case LICENSE_TYPES.RESTRICTED_METADATA_ONLY:
      // Only metadata visible, no download
      if (userTier === 'institutional') {
        return {
          allowed: true,
          permissions: {
            canDownload: true,
            canPrint: false,
            canModify: false
          }
        };
      }
      return {
        allowed: false,
        reason: 'This document requires institutional subscription',
        requiredTier: 'institutional',
        upgradeUrl: '/upgrade'
      };

    case LICENSE_TYPES.PROPRIETARY:
      // Institutional only
      if (userTier === 'institutional') {
        return {
          allowed: true,
          permissions: {
            canDownload: purpose === 'download',
            canPrint: false,
            canModify: false
          }
        };
      }
      return {
        allowed: false,
        reason: 'This document requires institutional subscription',
        requiredTier: 'institutional',
        upgradeUrl: '/upgrade'
      };

    case LICENSE_TYPES.UNKNOWN_REQUIRES_REVIEW:
    default:
      // View only for researcher+, no download
      if (userTier === 'researcher' || userTier === 'institutional') {
        return {
          allowed: true,
          permissions: {
            canDownload: false,
            canPrint: false,
            canModify: false
          }
        };
      }
      return {
        allowed: false,
        reason: 'This document is under license review. Researcher tier required for preview.',
        requiredTier: 'researcher',
        upgradeUrl: '/upgrade'
      };
  }
}

/**
 * Get expiration time for signed URL based on license and tier
 */
function getExpirationTime(
  license: string,
  userTier?: keyof typeof SUBSCRIPTION_TIERS,
  purpose?: string
): number {
  // Download URLs expire faster
  if (purpose === 'download') {
    return 300; // 5 minutes
  }

  // View URLs for open licenses can last longer
  if (license === LICENSE_TYPES.OPEN || license === LICENSE_TYPES.CC_BY) {
    return 3600; // 1 hour
  }

  // Restricted content expires quickly
  if (license === LICENSE_TYPES.RESTRICTED_METADATA_ONLY || 
      license === LICENSE_TYPES.PROPRIETARY) {
    return 600; // 10 minutes
  }

  // Default
  return 1800; // 30 minutes
}

/**
 * Generate license notice and attribution text
 */
function generateLicenseNotice(
  license: string,
  licenseDetails?: string,
  publisher?: string,
  title?: string
): {
  licenseNotice: string;
  licenseTerms?: string;
  attribution: string;
} {
  let licenseNotice = '';
  let licenseTerms = '';
  let attribution = '';

  switch (license) {
    case LICENSE_TYPES.OPEN:
    case LICENSE_TYPES.CC_BY:
      licenseNotice = 'This document is licensed under Creative Commons Attribution 4.0 (CC BY 4.0)';
      licenseTerms = 'You are free to share and adapt this material for any purpose, even commercially, as long as you give appropriate credit.';
      attribution = `Source: ${publisher || 'Unknown'}. "${title || 'Document'}". Accessed via YETO Platform.`;
      break;

    case LICENSE_TYPES.CC_BY_NC:
      licenseNotice = 'This document is licensed under Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0)';
      licenseTerms = 'You are free to share and adapt this material for non-commercial purposes only, with appropriate credit.';
      attribution = `Source: ${publisher || 'Unknown'}. "${title || 'Document'}". Non-commercial use only.`;
      break;

    case LICENSE_TYPES.CC_BY_SA:
      licenseNotice = 'This document is licensed under Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)';
      licenseTerms = 'You are free to share and adapt this material, but derivative works must use the same license.';
      attribution = `Source: ${publisher || 'Unknown'}. "${title || 'Document'}". ShareAlike required.`;
      break;

    case LICENSE_TYPES.CC_BY_ND:
      licenseNotice = 'This document is licensed under Creative Commons Attribution-NoDerivatives 4.0 (CC BY-ND 4.0)';
      licenseTerms = 'You are free to share this material, but no derivative works are permitted.';
      attribution = `Source: ${publisher || 'Unknown'}. "${title || 'Document'}". No derivatives allowed.`;
      break;

    case LICENSE_TYPES.RESTRICTED_METADATA_ONLY:
      licenseNotice = 'Restricted access: Metadata only';
      licenseTerms = 'Full document access requires institutional subscription. Citation and metadata are available for all users.';
      attribution = `Metadata source: ${publisher || 'Unknown'}. Contact publisher for full access.`;
      break;

    case LICENSE_TYPES.PROPRIETARY:
      licenseNotice = 'Proprietary license: Restricted distribution';
      licenseTerms = licenseDetails || 'This document is subject to proprietary licensing terms. Contact publisher for usage permissions.';
      attribution = `Source: ${publisher || 'Unknown'}. Proprietary content.`;
      break;

    default:
      licenseNotice = 'License under review';
      licenseTerms = 'The licensing terms for this document are being reviewed. Preview only.';
      attribution = `Source: ${publisher || 'Unknown'}. License pending review.`;
      break;
  }

  return {
    licenseNotice,
    licenseTerms,
    attribution
  };
}

/**
 * Log document access for analytics and compliance
 */
async function logDocumentAccess(
  documentId: number,
  userId?: number,
  purpose?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.execute(sql`
      INSERT INTO document_access_log (
        documentId,
        userId,
        accessType,
        accessedAt
      ) VALUES (
        ${documentId},
        ${userId || null},
        ${purpose || 'view'},
        NOW()
      )
    `);
  } catch (error) {
    console.error('[S3SignedUrl] Failed to log document access:', error);
  }
}

/**
 * Upload document to S3 with metadata
 */
export async function uploadDocumentToS3(
  fileBuffer: Buffer,
  fileName: string,
  metadata: {
    documentId: string;
    mimeType: string;
    publisher?: string;
    license?: string;
  }
): Promise<{
  s3Key: string;
  s3Url: string;
}> {
  const s3Key = `documents/${metadata.documentId}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: metadata.mimeType,
    Metadata: {
      documentId: metadata.documentId,
      publisher: metadata.publisher || 'Unknown',
      license: metadata.license || 'unknown',
      uploadedAt: new Date().toISOString()
    }
  });

  await s3Client.send(command);

  const s3Url = `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

  return {
    s3Key,
    s3Url
  };
}

/**
 * Get document access statistics
 */
export async function getDocumentAccessStats(
  documentId: number
): Promise<{
  totalAccesses: number;
  uniqueUsers: number;
  accessesByType: Record<string, number>;
  recentAccesses: Array<{
    userId?: number;
    accessType: string;
    accessedAt: Date;
  }>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalAccesses: 0,
      uniqueUsers: 0,
      accessesByType: {},
      recentAccesses: []
    };
  }

  try {
    // Total accesses
    const [totalResult] = await db.execute(sql`
      SELECT COUNT(*) as count FROM document_access_log WHERE documentId = ${documentId}
    `);
    const totalAccesses = (totalResult as any)[0]?.count || 0;

    // Unique users
    const [uniqueResult] = await db.execute(sql`
      SELECT COUNT(DISTINCT userId) as count FROM document_access_log 
      WHERE documentId = ${documentId} AND userId IS NOT NULL
    `);
    const uniqueUsers = (uniqueResult as any)[0]?.count || 0;

    // By type
    const typeResult = await db.execute(sql`
      SELECT accessType, COUNT(*) as count FROM document_access_log 
      WHERE documentId = ${documentId}
      GROUP BY accessType
    `);
    const accessesByType: Record<string, number> = {};
    for (const row of (typeResult as any)[0] || []) {
      accessesByType[row.accessType] = row.count;
    }

    // Recent accesses
    const recentResult = await db.execute(sql`
      SELECT userId, accessType, accessedAt FROM document_access_log 
      WHERE documentId = ${documentId}
      ORDER BY accessedAt DESC
      LIMIT 10
    `);
    const recentAccesses = ((recentResult as any)[0] || []).map((row: any) => ({
      userId: row.userId,
      accessType: row.accessType,
      accessedAt: new Date(row.accessedAt)
    }));

    return {
      totalAccesses,
      uniqueUsers,
      accessesByType,
      recentAccesses
    };
  } catch (error) {
    console.error('[S3SignedUrl] Failed to get access stats:', error);
    return {
      totalAccesses: 0,
      uniqueUsers: 0,
      accessesByType: {},
      recentAccesses: []
    };
  }
}
