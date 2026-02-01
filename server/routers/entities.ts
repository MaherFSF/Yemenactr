/**
 * YETO Entities Router
 * 
 * API endpoints for entity directory, profiles, and management.
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

// Helper function for raw SQL queries with parameters using connection pool
import mysql from 'mysql2/promise';

let _pool: mysql.Pool | null = null;

function getPool(): mysql.Pool | null {
  if (!_pool && process.env.DATABASE_URL) {
    try {
      _pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });
    } catch (error) {
      console.warn('[rawQuery] Failed to create pool:', error);
      return null;
    }
  }
  return _pool;
}

async function rawQuery(sql: string, params: any[] = []): Promise<any[]> {
  const pool = getPool();
  if (!pool) {
    console.warn('[rawQuery] No pool available');
    return [];
  }
  try {
    // Use query() instead of execute() for LIMIT/OFFSET compatibility
    const [rows] = await pool.query(sql, params);
    return (rows as any[]) || [];
  } catch (error) {
    console.error('[rawQuery] Query failed:', error);
    return [];
  }
}

export const entitiesRouter = router({
  // List entities with search and filters
  list: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      type: z.string().optional(),
      regimeTag: z.string().optional(),
      category: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let sql = `
        SELECT e.*, 
               (SELECT COUNT(*) FROM entity_timeline WHERE entityId = e.id) as timelineCount,
               (SELECT COUNT(*) FROM entity_links WHERE sourceEntityId = e.id OR targetEntityId = e.id) as relationshipCount
        FROM entities e
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input.search) {
        sql += " AND (e.name LIKE ? OR e.nameAr LIKE ?)";
        params.push(`%${input.search}%`, `%${input.search}%`);
      }
      
      if (input.type) {
        sql += " AND e.entityType = ?";
        params.push(input.type);
      }
      
      if (input.regimeTag) {
        sql += " AND e.regimeTag = ?";
        params.push(input.regimeTag);
      }
      
      sql += " ORDER BY e.name LIMIT ? OFFSET ?";
      params.push(Number(input.limit), Number(input.offset));
      
      const rows = await rawQuery(sql, params);
      return rows || [];
    }),
  
  // Get entity by ID with full details
  getById: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      // Get entity
      const entityRows = await rawQuery(
        "SELECT * FROM entities WHERE id = ?",
        [input.id]
      ) as any[];
      
      if (!entityRows || entityRows.length === 0) {
        return null;
      }
      
      const entity = entityRows[0];
      
      // Get aliases
      const aliases = await rawQuery(
        "SELECT * FROM entity_alias WHERE entityId = ?",
        [input.id]
      ) as any[];
      
      // Get external IDs
      const externalIds = await rawQuery(
        "SELECT * FROM entity_external_id WHERE entityId = ?",
        [input.id]
      ) as any[];
      
      // Get relationships
      const relationships = await rawQuery(
        `SELECT el.*, e.name as targetName, e.nameAr as targetNameAr
         FROM entity_links el
         JOIN entities e ON el.targetEntityId = e.id
         WHERE el.sourceEntityId = ?`,
        [input.id]
      ) as any[];
      
      // Get timeline
      const timeline = await rawQuery(
        "SELECT * FROM entity_timeline WHERE entityId = ? ORDER BY eventDate DESC",
        [input.id]
      ) as any[];
      
      // Get assertions
      const assertions = await rawQuery(
        "SELECT * FROM entity_assertion WHERE entityId = ? AND status = 'active'",
        [input.id]
      ) as any[];
      
      return {
        ...entity,
        aliases: aliases || [],
        externalIds: externalIds || [],
        relationships: relationships || [],
        timeline: timeline || [],
        assertions: assertions || [],
      };
    }),
  
  // Search entities (simple search)
  search: publicProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const [rows] = await rawQuery(
        `SELECT id, name, nameAr, entityType, regimeTag 
         FROM entities 
         WHERE name LIKE ? OR nameAr LIKE ?
         ORDER BY name
         LIMIT ?`,
        [`%${input.query}%`, `%${input.query}%`, input.limit]
      ) as any[];
      
      return rows || [];
    }),
  
  // Get entity types for filters
  getTypes: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const rows = await rawQuery(
      `SELECT DISTINCT entityType, COUNT(*) as count 
       FROM entities 
       GROUP BY entityType 
       ORDER BY count DESC`
    );
    
    return rows || [];
  }),
  
  // Get entity timeline
  getTimeline: publicProcedure
    .input(z.object({
      entityId: z.number(),
      eventType: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let sql = "SELECT * FROM entity_timeline WHERE entityId = ?";
      const params: any[] = [input.entityId];
      
      if (input.eventType) {
        sql += " AND eventType = ?";
        params.push(input.eventType);
      }
      
      if (input.startDate) {
        sql += " AND eventDate >= ?";
        params.push(input.startDate);
      }
      
      if (input.endDate) {
        sql += " AND eventDate <= ?";
        params.push(input.endDate);
      }
      
      sql += " ORDER BY eventDate DESC LIMIT ?";
      params.push(input.limit);
      
      const rows = await rawQuery(sql, params);
      return rows || [];
    }),
  
  // Get entity relationships
  getRelationships: publicProcedure
    .input(z.object({
      entityId: z.number(),
      direction: z.enum(["outgoing", "incoming", "both"]).default("both"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let sql = "";
      const params: any[] = [];
      
      if (input.direction === "outgoing") {
        sql = `
          SELECT el.*, e.name as targetName, e.nameAr as targetNameAr, 'outgoing' as direction
          FROM entity_links el
          JOIN entities e ON el.targetEntityId = e.id
          WHERE el.sourceEntityId = ?
        `;
        params.push(input.entityId);
      } else if (input.direction === "incoming") {
        sql = `
          SELECT el.*, e.name as sourceName, e.nameAr as sourceNameAr, 'incoming' as direction
          FROM entity_links el
          JOIN entities e ON el.sourceEntityId = e.id
          WHERE el.targetEntityId = ?
        `;
        params.push(input.entityId);
      } else {
        sql = `
          SELECT el.*, 
                 CASE WHEN el.sourceEntityId = ? THEN 'outgoing' ELSE 'incoming' END as direction,
                 e1.name as sourceName, e1.nameAr as sourceNameAr,
                 e2.name as targetName, e2.nameAr as targetNameAr
          FROM entity_links el
          JOIN entities e1 ON el.sourceEntityId = e1.id
          JOIN entities e2 ON el.targetEntityId = e2.id
          WHERE el.sourceEntityId = ? OR el.targetEntityId = ?
        `;
        params.push(input.entityId, input.entityId, input.entityId);
      }
      
      const rows = await rawQuery(sql, params);
      return rows || [];
    }),
  
  // Get resolution cases for admin
  getResolutionCases: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "approved", "rejected", "deferred"]).optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let sql = "SELECT * FROM entity_resolution_case WHERE 1=1";
      const params: any[] = [];
      
      if (input.status) {
        sql += " AND status = ?";
        params.push(input.status);
      }
      
      sql += " ORDER BY createdAt DESC LIMIT ?";
      params.push(input.limit);
      
      const rows = await rawQuery(sql, params);
      return rows || [];
    }),
  
  // Get entities with verified claims (evidence-backed data only)
  getWithClaims: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      type: z.string().optional(),
      regimeTag: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { entities: [], total: 0, gapTickets: [] };
      
      // Get entities
      let sql = `
        SELECT e.*, 
               (SELECT COUNT(*) FROM entity_timeline WHERE entityId = e.id) as timelineCount,
               (SELECT COUNT(*) FROM entity_links WHERE sourceEntityId = e.id OR targetEntityId = e.id) as relationshipCount,
               (SELECT COUNT(*) FROM entity_claims WHERE entity_id = e.id AND status = 'verified') as verifiedClaimsCount
        FROM entities e
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input.search) {
        sql += " AND (e.name LIKE ? OR e.nameAr LIKE ?)";
        params.push(`%${input.search}%`, `%${input.search}%`);
      }
      
      if (input.type) {
        sql += " AND e.entityType = ?";
        params.push(input.type);
      }
      
      if (input.regimeTag) {
        sql += " AND e.regimeTag = ?";
        params.push(input.regimeTag);
      }
      
      sql += " ORDER BY e.name LIMIT ? OFFSET ?";
      params.push(Number(input.limit), Number(input.offset));
      
      const rows = await rawQuery(sql, params) as any[];
      
      // Get total count
      let countSql = "SELECT COUNT(*) as total FROM entities WHERE 1=1";
      const countParams: any[] = [];
      if (input.search) {
        countSql += " AND (name LIKE ? OR nameAr LIKE ?)";
        countParams.push(`%${input.search}%`, `%${input.search}%`);
      }
      if (input.type) {
        countSql += " AND entityType = ?";
        countParams.push(input.type);
      }
      if (input.regimeTag) {
        countSql += " AND regimeTag = ?";
        countParams.push(input.regimeTag);
      }
      const countResult = await rawQuery(countSql, countParams);
      const total = countResult[0]?.total || 0;
      
      // Get verified claims for each entity
      const entitiesWithClaims = await Promise.all(
        (rows || []).map(async (entity: any) => {
          const claims = await rawQuery(
            `SELECT * FROM entity_claims 
             WHERE entity_id = ? AND status = 'verified' AND primary_evidence_id IS NOT NULL`,
            [entity.id]
          );
          return {
            ...entity,
            verifiedClaims: claims || [],
          };
        })
      );
      
      // Generate GAP tickets for entities without claims
      const gapTickets = entitiesWithClaims
        .filter((e: any) => e.verifiedClaimsCount === 0)
        .map((e: any) => ({
          gapId: `GAP-ENTITY-${e.id}`,
          entityId: e.id,
          entityName: e.name,
          titleEn: `Missing verified claims for ${e.name}`,
          titleAr: `بيانات مفقودة لـ ${e.nameAr || e.name}`,
          severity: 'medium',
          status: 'open',
        }));
      
      return {
        entities: entitiesWithClaims,
        total,
        gapTickets,
      };
    }),

  // Resolve a resolution case
  resolveCase: protectedProcedure
    .input(z.object({
      caseId: z.number(),
      action: z.enum(["approved", "rejected", "deferred"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await rawQuery(
        `UPDATE entity_resolution_case 
         SET status = ?, reviewedBy = ?, reviewedAt = NOW(), reviewNotes = ?
         WHERE id = ?`,
        [input.action, ctx.user?.name || "admin", input.notes || null, input.caseId]
      );
      
      return { success: true };
    }),
});
