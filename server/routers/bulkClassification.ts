/**
 * Bulk Classification tRPC Router
 * Provides endpoints for tier classification management
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { classifySource, bulkClassify, getAllowedUsesForTier, validateAllowedUse } from '../services/tierClassifier';

export const bulkClassificationRouter = router({
  // Get classification preview for UNKNOWN tier sources
  getClassificationPreview: protectedProcedure
    .query(async ({ ctx }) => {
      const db = ctx.db;
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Get UNKNOWN tier sources
      const unknownSources = await db.query(`
        SELECT id, sourceId, name, sourceType, licenseState, webUrl as url, description, tier,
               tierClassificationSuggested, tierClassificationReason, tierClassificationConfidence,
               requiresHumanReview, classificationMatchedRule
        FROM source_registry 
        WHERE tier = 'UNKNOWN' OR tier IS NULL
        ORDER BY name
      `);
      
      // Classify each source
      const results = (unknownSources[0] as any[]).map((source: any) => {
        const classification = classifySource({
          sourceId: source.sourceId,
          name: source.name,
          sourceType: source.sourceType,
          licenseState: source.licenseState,
          url: source.url,
          description: source.description,
          tier: source.tier
        });
        
        return {
          id: source.id,
          sourceId: source.sourceId,
          name: source.name,
          currentTier: source.tier,
          suggestedTier: classification.suggestedTier,
          reason: classification.reason,
          confidence: classification.confidence,
          requiresReview: classification.requiresHumanReview,
          matchedRule: classification.matchedRule,
          // Include existing classification if any
          existingSuggestion: source.tierClassificationSuggested
        };
      });
      
      // Calculate summary
      const summary = {
        total: results.length,
        classified: results.filter((r: any) => r.suggestedTier !== 'UNKNOWN').length,
        requiresReview: results.filter((r: any) => r.requiresReview).length,
        byTier: {} as Record<string, number>,
        byConfidence: {
          high: results.filter((r: any) => r.confidence >= 0.85).length,
          medium: results.filter((r: any) => r.confidence >= 0.60 && r.confidence < 0.85).length,
          low: results.filter((r: any) => r.confidence < 0.60).length
        }
      };
      
      for (const result of results) {
        summary.byTier[result.suggestedTier] = (summary.byTier[result.suggestedTier] || 0) + 1;
      }
      
      return { results, summary };
    }),

  // Apply bulk classification
  applyClassification: protectedProcedure
    .input(z.object({
      sourceIds: z.array(z.number()).optional(), // If not provided, apply to all
      minConfidence: z.number().min(0).max(1).default(0.85)
    }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      const userId = ctx.user?.id || 'system';
      
      // Get sources to classify
      let query = `
        SELECT id, sourceId, name, sourceType, licenseState, webUrl as url, description, tier
        FROM source_registry 
        WHERE (tier = 'UNKNOWN' OR tier IS NULL)
      `;
      
      if (input.sourceIds && input.sourceIds.length > 0) {
        query += ` AND id IN (${input.sourceIds.join(',')})`;
      }
      
      const [sources] = await db.query(query);
      
      let applied = 0;
      let skipped = 0;
      const results: any[] = [];
      
      for (const source of sources as any[]) {
        const classification = classifySource({
          sourceId: source.sourceId,
          name: source.name,
          sourceType: source.sourceType,
          licenseState: source.licenseState,
          url: source.url,
          description: source.description,
          tier: source.tier
        });
        
        if (classification.confidence >= input.minConfidence && classification.suggestedTier !== 'UNKNOWN') {
          // Apply classification
          await db.query(`
            UPDATE source_registry SET
              tierClassificationSuggested = ?,
              tierClassificationReason = ?,
              tierClassificationConfidence = ?,
              requiresHumanReview = ?,
              classificationMatchedRule = ?,
              classifiedAt = NOW(),
              classifiedBy = ?,
              previousTier = tier,
              tier = ?
            WHERE id = ?
          `, [
            classification.suggestedTier,
            classification.reason,
            classification.confidence,
            classification.requiresHumanReview ? 1 : 0,
            classification.matchedRule,
            userId,
            classification.suggestedTier,
            source.id
          ]);
          
          applied++;
          results.push({
            sourceId: source.sourceId,
            name: source.name,
            newTier: classification.suggestedTier,
            confidence: classification.confidence,
            status: 'applied'
          });
        } else {
          // Store suggestion but don't apply
          await db.query(`
            UPDATE source_registry SET
              tierClassificationSuggested = ?,
              tierClassificationReason = ?,
              tierClassificationConfidence = ?,
              requiresHumanReview = 1,
              classificationMatchedRule = ?,
              classifiedAt = NOW(),
              classifiedBy = ?
            WHERE id = ?
          `, [
            classification.suggestedTier,
            classification.reason,
            classification.confidence,
            classification.matchedRule,
            userId,
            source.id
          ]);
          
          skipped++;
          results.push({
            sourceId: source.sourceId,
            name: source.name,
            suggestedTier: classification.suggestedTier,
            confidence: classification.confidence,
            status: 'skipped_low_confidence'
          });
        }
      }
      
      return {
        applied,
        skipped,
        total: (sources as any[]).length,
        results
      };
    }),

  // Get sources requiring human review
  getReviewQueue: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      const offset = (input.page - 1) * input.limit;
      
      // Get total count
      const [countResult] = await db.query(`
        SELECT COUNT(*) as total FROM source_registry 
        WHERE requiresHumanReview = 1
      `);
      const total = (countResult as any[])[0].total;
      
      // Get sources
      const [sources] = await db.query(`
        SELECT id, sourceId, name, sourceType, licenseState, tier, status, allowedUse,
               tierClassificationSuggested, tierClassificationReason, tierClassificationConfidence,
               classificationMatchedRule, classifiedAt, classifiedBy, previousTier
        FROM source_registry 
        WHERE requiresHumanReview = 1
        ORDER BY tierClassificationConfidence DESC, name
        LIMIT ? OFFSET ?
      `, [input.limit, offset]);
      
      return {
        sources,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit)
        }
      };
    }),

  // Approve or modify a source classification
  reviewSource: protectedProcedure
    .input(z.object({
      sourceId: z.number(),
      tier: z.enum(['T0', 'T1', 'T2', 'T3', 'T4']),
      allowedUse: z.array(z.string()).optional(),
      licenseState: z.enum(['known', 'unknown', 'restricted', 'open']).optional(),
      status: z.enum(['ACTIVE', 'PENDING_REVIEW', 'NEEDS_KEY', 'PARTNERSHIP_REQUIRED', 'INACTIVE']).optional(),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      const userId = ctx.user?.id || 'system';
      
      // Build update query
      const updates: string[] = [
        'tier = ?',
        'requiresHumanReview = 0',
        'classifiedBy = ?',
        'classifiedAt = NOW()'
      ];
      const values: any[] = [input.tier, userId];
      
      if (input.allowedUse) {
        updates.push('allowedUse = ?');
        values.push(JSON.stringify(input.allowedUse));
      }
      
      if (input.licenseState) {
        updates.push('licenseState = ?');
        values.push(input.licenseState);
      }
      
      if (input.status) {
        updates.push('status = ?');
        values.push(input.status);
      }
      
      if (input.notes) {
        updates.push('notes = CONCAT(COALESCE(notes, \'\'), ?)');
        values.push(`\n[${new Date().toISOString()}] Review: ${input.notes}`);
      }
      
      values.push(input.sourceId);
      
      await db.query(`
        UPDATE source_registry SET ${updates.join(', ')}
        WHERE id = ?
      `, values);
      
      return { success: true };
    }),

  // Get tier distribution statistics
  getTierStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = ctx.db;
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const [tierDist] = await db.query(`
        SELECT tier, COUNT(*) as count 
        FROM source_registry 
        GROUP BY tier 
        ORDER BY count DESC
      `);
      
      const [statusDist] = await db.query(`
        SELECT status, COUNT(*) as count 
        FROM source_registry 
        GROUP BY status 
        ORDER BY count DESC
      `);
      
      const [reviewQueue] = await db.query(`
        SELECT COUNT(*) as count FROM source_registry WHERE requiresHumanReview = 1
      `);
      
      const [total] = await db.query(`SELECT COUNT(*) as total FROM source_registry`);
      
      const unknownCount = (tierDist as any[]).find(t => t.tier === 'UNKNOWN')?.count || 0;
      const unknownPct = ((unknownCount / (total as any[])[0].total) * 100).toFixed(1);
      
      return {
        tierDistribution: tierDist,
        statusDistribution: statusDist,
        reviewQueueCount: (reviewQueue as any[])[0].count,
        total: (total as any[])[0].total,
        unknownPercentage: parseFloat(unknownPct),
        targetMet: parseFloat(unknownPct) < 50
      };
    }),

  // Revert a classification
  revertClassification: protectedProcedure
    .input(z.object({
      sourceId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Get previous tier
      const [source] = await db.query(`
        SELECT previousTier FROM source_registry WHERE id = ?
      `, [input.sourceId]);
      
      if (!(source as any[])[0]?.previousTier) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No previous tier to revert to'
        });
      }
      
      await db.query(`
        UPDATE source_registry SET
          tier = previousTier,
          previousTier = NULL,
          requiresHumanReview = 1,
          classifiedBy = 'REVERTED',
          classifiedAt = NOW()
        WHERE id = ?
      `, [input.sourceId]);
      
      return { success: true };
    })
});
