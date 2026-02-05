/**
 * Document Vault Backfill Planner
 * 
 * Creates year-by-year capture plans for documents from SOURCE_PRODUCTS
 * Priority: 2026 → 2020, then 2019 → 2010
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import * as crypto from 'crypto';

export interface DocumentBackfillPlan {
  id: number;
  sourceRegistryId: number;
  productId: number;
  year: number;
  priority: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  estimatedDocuments: number;
  actualDocuments: number;
  lastAttemptAt?: Date;
  completedAt?: Date;
  notes?: string;
}

/**
 * Create backfill plans for all document products
 */
export async function createDocumentBackfillPlans(): Promise<{
  plansCreated: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  let plansCreated = 0;
  const errors: string[] = [];

  try {
    // Get all document products from source_products
    const result = await db.execute(sql`
      SELECT 
        sp.id as productId,
        sp.sourceRegistryId,
        sp.productName,
        sp.productType,
        sp.historicalStart,
        sp.historicalEnd,
        sr.sourceId,
        sr.name as sourceName
      FROM source_products sp
      JOIN source_registry sr ON sp.sourceRegistryId = sr.id
      WHERE sp.productType IN ('DOC_PDF', 'DOC_NARRATIVE', 'DOC_EXCEL', 'NEWS_MEDIA')
        AND sp.isActive = true
        AND sr.status = 'ACTIVE'
    `);

    const products = (result as any)[0] || [];
    console.log(`[DocumentBackfillPlanner] Found ${products.length} document products`);

    for (const product of products) {
      const startYear = product.historicalStart || 2010;
      const endYear = product.historicalEnd || new Date().getFullYear();

      // Priority years: 2026, 2025, 2024, 2023, 2022, 2021, 2020 (descending)
      // Then: 2019, 2018, ... 2010 (descending)
      const priorityYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
      const olderYears = [];
      for (let y = 2019; y >= startYear && y >= 2010; y--) {
        olderYears.push(y);
      }
      const years = [...priorityYears, ...olderYears].filter(y => y >= startYear && y <= endYear);

      for (let i = 0; i < years.length; i++) {
        const year = years[i];
        const priority = 100 - i; // Higher priority for recent years

        try {
          // Check if plan already exists
          const existingResult = await db.execute(sql`
            SELECT id FROM document_backfill_plan
            WHERE sourceRegistryId = ${product.sourceRegistryId}
              AND productId = ${product.productId}
              AND year = ${year}
            LIMIT 1
          `);

          if ((existingResult as any)[0]?.length === 0) {
            // Create plan
            await db.execute(sql`
              INSERT INTO document_backfill_plan (
                sourceRegistryId, productId, year, priority, status,
                estimatedDocuments, actualDocuments, createdAt, updatedAt
              ) VALUES (
                ${product.sourceRegistryId},
                ${product.productId},
                ${year},
                ${priority},
                'PLANNED',
                0,
                0,
                NOW(),
                NOW()
              )
            `);
            plansCreated++;
          }
        } catch (error) {
          errors.push(`Failed to create plan for ${product.sourceName} (${year}): ${error}`);
        }
      }
    }

    console.log(`[DocumentBackfillPlanner] Created ${plansCreated} backfill plans`);
    return { plansCreated, errors };
  } catch (error) {
    console.error('[DocumentBackfillPlanner] Failed to create plans:', error);
    throw error;
  }
}

/**
 * Get next backfill plan to process
 */
export async function getNextBackfillPlan(): Promise<DocumentBackfillPlan | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT * FROM document_backfill_plan
      WHERE status = 'PLANNED'
      ORDER BY priority DESC, year DESC
      LIMIT 1
    `);

    const plan = (result as any)[0]?.[0];
    return plan || null;
  } catch (error) {
    console.error('[DocumentBackfillPlanner] Failed to get next plan:', error);
    return null;
  }
}

/**
 * Mark backfill plan as in progress
 */
export async function markPlanInProgress(planId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE document_backfill_plan
      SET status = 'IN_PROGRESS', lastAttemptAt = NOW(), updatedAt = NOW()
      WHERE id = ${planId}
    `);
    return true;
  } catch (error) {
    console.error('[DocumentBackfillPlanner] Failed to mark plan in progress:', error);
    return false;
  }
}

/**
 * Mark backfill plan as completed
 */
export async function markPlanCompleted(
  planId: number,
  documentsIngested: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE document_backfill_plan
      SET status = 'COMPLETED', actualDocuments = ${documentsIngested}, completedAt = NOW(), updatedAt = NOW()
      WHERE id = ${planId}
    `);
    return true;
  } catch (error) {
    console.error('[DocumentBackfillPlanner] Failed to mark plan completed:', error);
    return false;
  }
}

/**
 * Get backfill statistics
 */
export async function getBackfillStats(): Promise<{
  totalPlans: number;
  planned: number;
  inProgress: number;
  completed: number;
  failed: number;
  documentsIngested: number;
}> {
  const db = await getDb();
  if (!db) {
    return { totalPlans: 0, planned: 0, inProgress: 0, completed: 0, failed: 0, documentsIngested: 0 };
  }

  try {
    const statsResult = await db.execute(sql`
      SELECT 
        COUNT(*) as totalPlans,
        SUM(CASE WHEN status = 'PLANNED' THEN 1 ELSE 0 END) as planned,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
        SUM(actualDocuments) as documentsIngested
      FROM document_backfill_plan
    `);

    const stats = (statsResult as any)[0]?.[0] || {};
    return {
      totalPlans: stats.totalPlans || 0,
      planned: stats.planned || 0,
      inProgress: stats.inProgress || 0,
      completed: stats.completed || 0,
      failed: stats.failed || 0,
      documentsIngested: stats.documentsIngested || 0
    };
  } catch (error) {
    console.error('[DocumentBackfillPlanner] Failed to get stats:', error);
    return { totalPlans: 0, planned: 0, inProgress: 0, completed: 0, failed: 0, documentsIngested: 0 };
  }
}
