/**
 * One Brain Intelligence Router
 * Exposes the sovereign evidence-bound intelligence layer via tRPC
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { 
  getOneBrainIntelligence, 
  type UserRole,
  type QueryContext 
} from '../ml/core/oneBrainDirective';

export const oneBrainRouter = router({
  /**
   * Process an intelligence query with full evidence grounding
   */
  query: protectedProcedure
    .input(z.object({
      query: z.string().min(1).max(2000),
      language: z.enum(['ar', 'en']).default('en'),
      focusAreas: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const oneBrain = getOneBrainIntelligence();
      
      // Determine user role from context
      const userRole: UserRole = (ctx.user as any)?.role === 'admin' 
        ? 'policymaker' 
        : 'researcher';
      
      const context: QueryContext = {
        userId: (ctx.user as any)?.id || 'anonymous',
        userRole,
        language: input.language,
        sessionId: `session-${Date.now()}`,
        previousQueries: [],
        focusAreas: input.focusAreas || [],
      };

      const response = await oneBrain.processQuery(input.query, context);
      
      return response;
    }),

  /**
   * Process query with specific role context
   */
  queryAsRole: protectedProcedure
    .input(z.object({
      query: z.string().min(1).max(2000),
      role: z.enum(['citizen', 'researcher', 'policymaker', 'donor', 'banker', 'private_sector', 'journalist']),
      language: z.enum(['ar', 'en']).default('en'),
      focusAreas: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const oneBrain = getOneBrainIntelligence();
      
      const context: QueryContext = {
        userId: (ctx.user as any)?.id || 'anonymous',
        userRole: input.role,
        language: input.language,
        sessionId: `session-${Date.now()}`,
        previousQueries: [],
        focusAreas: input.focusAreas || [],
      };

      const response = await oneBrain.processQuery(input.query, context);
      
      return response;
    }),

  /**
   * Get knowledge graph statistics
   */
  getKnowledgeGraphStats: publicProcedure
    .query(() => {
      const oneBrain = getOneBrainIntelligence();
      return oneBrain.getKnowledgeGraphStats();
    }),

  /**
   * Query the knowledge graph
   */
  queryKnowledgeGraph: publicProcedure
    .input(z.object({
      nodeId: z.string(),
      depth: z.number().min(1).max(5).default(2),
    }))
    .query(({ input }) => {
      const oneBrain = getOneBrainIntelligence();
      return oneBrain.queryKnowledgeGraph(input.nodeId, input.depth);
    }),

  /**
   * Get all data gap tickets
   */
  getDataGapTickets: protectedProcedure
    .query(() => {
      const oneBrain = getOneBrainIntelligence();
      return oneBrain.getDataGapTickets();
    }),

  /**
   * Add a node to the knowledge graph
   */
  addKnowledgeNode: protectedProcedure
    .input(z.object({
      id: z.string(),
      type: z.enum(['indicator', 'event', 'institution', 'document', 'policy', 'person']),
      name: z.string(),
      nameAr: z.string(),
      properties: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(({ input }) => {
      const oneBrain = getOneBrainIntelligence();
      oneBrain.addKnowledgeNode({
        id: input.id,
        type: input.type,
        name: input.name,
        nameAr: input.nameAr,
        properties: input.properties || {},
      });
      return { success: true };
    }),

  /**
   * Add an edge to the knowledge graph
   */
  addKnowledgeEdge: protectedProcedure
    .input(z.object({
      source: z.string(),
      target: z.string(),
      relationship: z.string(),
      weight: z.number().min(0).max(1).default(1),
      evidence: z.array(z.string()).optional(),
    }))
    .mutation(({ input }) => {
      const oneBrain = getOneBrainIntelligence();
      oneBrain.addKnowledgeEdge({
        source: input.source,
        target: input.target,
        relationship: input.relationship,
        weight: input.weight,
        evidence: input.evidence || [],
      });
      return { success: true };
    }),

  /**
   * Get available user roles and their configurations
   */
  getRoles: publicProcedure
    .query(() => {
      return {
        roles: [
          {
            id: 'citizen',
            name: 'Citizen',
            nameAr: 'مواطن',
            description: 'General public seeking practical economic information',
            descriptionAr: 'عامة الناس الباحثين عن معلومات اقتصادية عملية',
          },
          {
            id: 'researcher',
            name: 'Researcher',
            nameAr: 'باحث',
            description: 'Academic or policy researcher requiring detailed analysis',
            descriptionAr: 'باحث أكاديمي أو سياسي يحتاج تحليلاً مفصلاً',
          },
          {
            id: 'policymaker',
            name: 'Policymaker',
            nameAr: 'صانع سياسات',
            description: 'Government official making policy decisions',
            descriptionAr: 'مسؤول حكومي يتخذ قرارات سياسية',
          },
          {
            id: 'donor',
            name: 'Donor',
            nameAr: 'مانح',
            description: 'International donor or development partner',
            descriptionAr: 'مانح دولي أو شريك تنموي',
          },
          {
            id: 'banker',
            name: 'Banker',
            nameAr: 'مصرفي',
            description: 'Banking or financial sector professional',
            descriptionAr: 'محترف في القطاع المصرفي أو المالي',
          },
          {
            id: 'private_sector',
            name: 'Private Sector',
            nameAr: 'القطاع الخاص',
            description: 'Business owner or private sector operator',
            descriptionAr: 'صاحب عمل أو مشغل في القطاع الخاص',
          },
          {
            id: 'journalist',
            name: 'Journalist',
            nameAr: 'صحفي',
            description: 'Media professional reporting on economic issues',
            descriptionAr: 'محترف إعلامي يغطي القضايا الاقتصادية',
          },
        ],
      };
    }),
});

export type OneBrainRouter = typeof oneBrainRouter;
