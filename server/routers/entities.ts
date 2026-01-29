/**
 * YETO Entities Router
 * 
 * API endpoints for entity directory, profiles, and management.
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

// Helper function for raw SQL queries with parameters
async function rawQuery(query: string, params: any[] = []): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  const connection = (db as any).$client;
  if (connection && connection.execute) {
    const [rows] = await connection.execute(query, params);
    return rows || [];
  }
  return [];
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
      params.push(input.limit, input.offset);
      
      const [rows] = await rawQuery(sql, params) as any[];
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
      const [entityRows] = await rawQuery(
        "SELECT * FROM entities WHERE id = ?",
        [input.id]
      ) as any[];
      
      if (!entityRows || entityRows.length === 0) {
        return null;
      }
      
      const entity = entityRows[0];
      
      // Get aliases
      const [aliases] = await rawQuery(
        "SELECT * FROM entity_alias WHERE entityId = ?",
        [input.id]
      ) as any[];
      
      // Get external IDs
      const [externalIds] = await rawQuery(
        "SELECT * FROM entity_external_id WHERE entityId = ?",
        [input.id]
      ) as any[];
      
      // Get relationships
      const [relationships] = await rawQuery(
        `SELECT el.*, e.name as targetName, e.nameAr as targetNameAr
         FROM entity_links el
         JOIN entities e ON el.targetEntityId = e.id
         WHERE el.sourceEntityId = ?`,
        [input.id]
      ) as any[];
      
      // Get timeline
      const [timeline] = await rawQuery(
        "SELECT * FROM entity_timeline WHERE entityId = ? ORDER BY eventDate DESC",
        [input.id]
      ) as any[];
      
      // Get assertions
      const [assertions] = await rawQuery(
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
    
    const [rows] = await rawQuery(
      `SELECT DISTINCT entityType, COUNT(*) as count 
       FROM entities 
       GROUP BY entityType 
       ORDER BY count DESC`
    ) as any[];
    
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
      
      const [rows] = await rawQuery(sql, params) as any[];
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
      
      const [rows] = await rawQuery(sql, params) as any[];
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
      
      const [rows] = await rawQuery(sql, params) as any[];
      return rows || [];
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
