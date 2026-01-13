/**
 * Autopilot OS tRPC Router
 * 
 * Provides APIs for:
 * - Coverage Governor: Track data coverage by year/sector/geography
 * - Ingestion Orchestrator: Manage data ingestion runs
 * - QA Gate: Run integrity checks and generate reports
 * - Page Factory: Auto-generate pages from claims
 * - Control Room: Admin dashboard for autopilot status
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

// Helper to get db instance
const getDbInstance = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
};

export const autopilotRouter = router({
  // ============================================================================
  // COVERAGE GOVERNOR
  // ============================================================================

  /**
   * Get coverage map - year × sector × governorate grid
   */
  getCoverageMap: publicProcedure
    .input(z.object({
      year: z.number().optional(),
      sector: z.string().optional(),
      governorate: z.string().optional()
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.year) {
        whereClause = sql`${whereClause} AND year = ${input.year}`;
      }
      if (input.sector) {
        whereClause = sql`${whereClause} AND sector = ${input.sector}`;
      }
      if (input.governorate) {
        whereClause = sql`${whereClause} AND governorate = ${input.governorate}`;
      }
      
      const cells = await (await getDbInstance()).execute(sql`
        SELECT * FROM coverage_cells
        WHERE ${whereClause}
        ORDER BY year DESC, sector ASC, governorate ASC
      `);
      
      return cells;
    }),

  /**
   * Get coverage summary statistics
   */
  getCoverageSummary: publicProcedure.query(async () => {
    try {
      const result = await (await getDbInstance()).execute(sql`
        SELECT 
          COUNT(*) as totalCells,
          COALESCE(SUM(CASE WHEN coverageScore >= 0.8 THEN 1 ELSE 0 END), 0) as fullCoverage,
          COALESCE(SUM(CASE WHEN coverageScore >= 0.5 AND coverageScore < 0.8 THEN 1 ELSE 0 END), 0) as partialCoverage,
          COALESCE(SUM(CASE WHEN coverageScore < 0.5 THEN 1 ELSE 0 END), 0) as lowCoverage,
          COALESCE(SUM(CASE WHEN coverageScore = 0 THEN 1 ELSE 0 END), 0) as noCoverage,
          COALESCE(AVG(coverageScore), 0) as avgCoverage,
          COALESCE(SUM(claimCount), 0) as totalClaims,
          COALESCE(SUM(sourceCount), 0) as totalEvidence
        FROM coverage_cells
      `);
      const summary = Array.isArray(result) ? result[0] : (result as any)[0]?.[0] || {};
    
      // Get coverage by year
      const byYear = await (await getDbInstance()).execute(sql`
        SELECT year, AVG(coverageScore) as avgScore, SUM(claimCount) as claims
        FROM coverage_cells
        GROUP BY year
        ORDER BY year DESC
        LIMIT 10
      `);
      
      // Get coverage by sector
      const bySector = await (await getDbInstance()).execute(sql`
        SELECT sector, AVG(coverageScore) as avgScore, SUM(claimCount) as claims
        FROM coverage_cells
        GROUP BY sector
        ORDER BY avgScore DESC
      `);
      
      return {
        summary,
        byYear: Array.isArray(byYear) ? byYear : (byYear as any)[0] || [],
        bySector: Array.isArray(bySector) ? bySector : (bySector as any)[0] || []
      };
    } catch (error) {
      console.error('Error getting coverage summary:', error);
      return {
        summary: { totalCells: 0, fullCoverage: 0, partialCoverage: 0, lowCoverage: 0, noCoverage: 0, avgCoverage: 0, totalClaims: 0, totalEvidence: 0 },
        byYear: [],
        bySector: []
      };
    }
  }),

  /**
   * Get coverage gaps (cells with low coverage)
   */
  getCoverageGaps: publicProcedure
    .input(z.object({
      threshold: z.number().default(0.5),
      limit: z.number().default(50)
    }))
    .query(async ({ input }) => {
      const gaps = await (await getDbInstance()).execute(sql`
        SELECT * FROM coverage_cells
        WHERE coverageScore < ${input.threshold}
        ORDER BY coverageScore ASC, year DESC
        LIMIT ${input.limit}
      `);
      
      return gaps;
    }),

  /**
   * Update coverage cell
   */
  updateCoverageCell: protectedProcedure
    .input(z.object({
      year: z.number(),
      sector: z.string(),
      governorate: z.string(),
      coverageScore: z.number().min(0).max(1),
      claimCount: z.number().optional(),
      evidenceCount: z.number().optional(),
      lastUpdated: z.date().optional()
    }))
    .mutation(async ({ input }) => {
      await (await getDbInstance()).execute(sql`
        INSERT INTO coverage_cells (year, sector, governorate, coverageScore, claimCount, evidenceCount, lastUpdated)
        VALUES (${input.year}, ${input.sector}, ${input.governorate}, ${input.coverageScore}, 
                ${input.claimCount || 0}, ${input.evidenceCount || 0}, NOW())
        ON DUPLICATE KEY UPDATE
          coverageScore = ${input.coverageScore},
          claimCount = ${input.claimCount || 0},
          evidenceCount = ${input.evidenceCount || 0},
          lastUpdated = NOW()
      `);
      
      return { success: true };
    }),

  // ============================================================================
  // INGESTION ORCHESTRATOR
  // ============================================================================

  /**
   * Get ingestion runs with filters
   */
  getIngestionRuns: publicProcedure
    .input(z.object({
      sourceId: z.number().optional(),
      connectorName: z.string().optional(),
      status: z.enum(["running", "success", "partial", "failed"]).optional(),
      limit: z.number().default(50)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.sourceId) {
        whereClause = sql`${whereClause} AND sourceId = ${input.sourceId}`;
      }
      if (input.connectorName) {
        whereClause = sql`${whereClause} AND connectorName = ${input.connectorName}`;
      }
      if (input.status) {
        whereClause = sql`${whereClause} AND status = ${input.status}`;
      }
      
      const runs = await (await getDbInstance()).execute(sql`
        SELECT ir.*, es.name as sourceName
        FROM ingestion_runs ir
        LEFT JOIN evidence_sources es ON ir.sourceId = es.id
        WHERE ${whereClause}
        ORDER BY startedAt DESC
        LIMIT ${input.limit}
      `);
      
      return runs;
    }),

  /**
   * Get latest ingestion status for all connectors
   */
  getIngestionStatus: publicProcedure.query(async () => {
    const status = await (await getDbInstance()).execute(sql`
      SELECT 
        connectorName,
        MAX(startedAt) as lastRun,
        (SELECT status FROM ingestion_runs ir2 
         WHERE ir2.connectorName = ir.connectorName 
         ORDER BY startedAt DESC LIMIT 1) as lastStatus,
        (SELECT recordsFetched FROM ingestion_runs ir2 
         WHERE ir2.connectorName = ir.connectorName 
         ORDER BY startedAt DESC LIMIT 1) as lastRecordsFetched,
        COUNT(*) as totalRuns,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successRuns,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedRuns
      FROM ingestion_runs ir
      GROUP BY connectorName
      ORDER BY MAX(startedAt) DESC
    `);
    
    return status;
  }),

  /**
   * Start an ingestion run
   */
  startIngestionRun: adminProcedure
    .input(z.object({
      sourceId: z.number(),
      connectorName: z.string()
    }))
    .mutation(async ({ input }) => {
      const [result] = await (await getDbInstance()).execute(sql`
        INSERT INTO ingestion_runs (sourceId, connectorName, startedAt, status)
        VALUES (${input.sourceId}, ${input.connectorName}, NOW(), 'running')
      `);
      
      // Log event
      await (await getDbInstance()).execute(sql`
        INSERT INTO autopilot_events (eventType, summary, relatedJobId)
        VALUES ('ingestion_started', ${`Started ingestion: ${input.connectorName}`}, ${(result as any).insertId})
      `);
      
      return { runId: (result as any).insertId, success: true };
    }),

  /**
   * Complete an ingestion run
   */
  completeIngestionRun: adminProcedure
    .input(z.object({
      runId: z.number(),
      status: z.enum(["success", "partial", "failed"]),
      recordsFetched: z.number().optional(),
      recordsCreated: z.number().optional(),
      recordsUpdated: z.number().optional(),
      recordsSkipped: z.number().optional(),
      claimsCreated: z.number().optional(),
      errorMessage: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      await (await getDbInstance()).execute(sql`
        UPDATE ingestion_runs SET
          completedAt = NOW(),
          duration = TIMESTAMPDIFF(SECOND, startedAt, NOW()),
          status = ${input.status},
          recordsFetched = ${input.recordsFetched || 0},
          recordsCreated = ${input.recordsCreated || 0},
          recordsUpdated = ${input.recordsUpdated || 0},
          recordsSkipped = ${input.recordsSkipped || 0},
          claimsCreated = ${input.claimsCreated || 0},
          errorMessage = ${input.errorMessage || null}
        WHERE id = ${input.runId}
      `);
      
      // Log event
      await (await getDbInstance()).execute(sql`
        INSERT INTO autopilot_events (eventType, summary, relatedJobId)
        VALUES ('ingestion_completed', ${`Ingestion completed: ${input.status}`}, ${input.runId})
      `);
      
      return { success: true };
    }),

  // ============================================================================
  // QA GATE
  // ============================================================================

  /**
   * Get QA runs with filters
   */
  getQARuns: publicProcedure
    .input(z.object({
      runType: z.string().optional(),
      status: z.enum(["running", "pass", "pass_warn", "fail"]).optional(),
      limit: z.number().default(50)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.runType) {
        whereClause = sql`${whereClause} AND runType = ${input.runType}`;
      }
      if (input.status) {
        whereClause = sql`${whereClause} AND status = ${input.status}`;
      }
      
      const runs = await (await getDbInstance()).execute(sql`
        SELECT * FROM qa_runs
        WHERE ${whereClause}
        ORDER BY startedAt DESC
        LIMIT ${input.limit}
      `);
      
      return runs;
    }),

  /**
   * Get latest QA status
   */
  getQAStatus: publicProcedure.query(async () => {
    const status = await (await getDbInstance()).execute(sql`
      SELECT 
        runType,
        MAX(startedAt) as lastRun,
        (SELECT status FROM qa_runs qr2 
         WHERE qr2.runType = qr.runType 
         ORDER BY startedAt DESC LIMIT 1) as lastStatus,
        (SELECT totalChecks FROM qa_runs qr2 
         WHERE qr2.runType = qr.runType 
         ORDER BY startedAt DESC LIMIT 1) as lastTotalChecks,
        (SELECT failedChecks FROM qa_runs qr2 
         WHERE qr2.runType = qr.runType 
         ORDER BY startedAt DESC LIMIT 1) as lastFailedChecks
      FROM qa_runs qr
      GROUP BY runType
    `);
    
    return status;
  }),

  /**
   * Start a QA run
   */
  startQARun: adminProcedure
    .input(z.object({
      runType: z.enum(["full_scan", "hardcode_detection", "click_audit", "provenance_check", "export_integrity", "translation_check"])
    }))
    .mutation(async ({ input }) => {
      const [result] = await (await getDbInstance()).execute(sql`
        INSERT INTO qa_runs (runType, startedAt, status)
        VALUES (${input.runType}, NOW(), 'running')
      `);
      
      // Log event
      await (await getDbInstance()).execute(sql`
        INSERT INTO autopilot_events (eventType, summary, relatedJobId)
        VALUES ('qa_started', ${`Started QA: ${input.runType}`}, ${(result as any).insertId})
      `);
      
      return { runId: (result as any).insertId, success: true };
    }),

  /**
   * Complete a QA run
   */
  completeQARun: adminProcedure
    .input(z.object({
      runId: z.number(),
      status: z.enum(["pass", "pass_warn", "fail"]),
      totalChecks: z.number(),
      passedChecks: z.number(),
      warningChecks: z.number(),
      failedChecks: z.number(),
      ticketsCreated: z.number().optional(),
      reportSummary: z.any().optional()
    }))
    .mutation(async ({ input }) => {
      await (await getDbInstance()).execute(sql`
        UPDATE qa_runs SET
          completedAt = NOW(),
          duration = TIMESTAMPDIFF(SECOND, startedAt, NOW()),
          status = ${input.status},
          totalChecks = ${input.totalChecks},
          passedChecks = ${input.passedChecks},
          warningChecks = ${input.warningChecks},
          failedChecks = ${input.failedChecks},
          ticketsCreated = ${input.ticketsCreated || 0},
          reportSummary = ${input.reportSummary ? JSON.stringify(input.reportSummary) : null}
        WHERE id = ${input.runId}
      `);
      
      // Log event
      await (await getDbInstance()).execute(sql`
        INSERT INTO autopilot_events (eventType, summary, relatedJobId)
        VALUES ('qa_completed', ${`QA completed: ${input.status} (${input.passedChecks}/${input.totalChecks} passed)`}, ${input.runId})
      `);
      
      return { success: true };
    }),

  // ============================================================================
  // FIX TICKETS
  // ============================================================================

  /**
   * Get fix tickets with filters
   */
  getFixTickets: publicProcedure
    .input(z.object({
      ticketType: z.string().optional(),
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      status: z.enum(["open", "in_progress", "resolved", "wont_fix"]).optional(),
      limit: z.number().default(50)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.ticketType) {
        whereClause = sql`${whereClause} AND ticketType = ${input.ticketType}`;
      }
      if (input.severity) {
        whereClause = sql`${whereClause} AND severity = ${input.severity}`;
      }
      if (input.status) {
        whereClause = sql`${whereClause} AND status = ${input.status}`;
      }
      
      const tickets = await (await getDbInstance()).execute(sql`
        SELECT * FROM fix_tickets
        WHERE ${whereClause}
        ORDER BY 
          CASE severity 
            WHEN 'critical' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'medium' THEN 3 
            ELSE 4 
          END,
          createdAt DESC
        LIMIT ${input.limit}
      `);
      
      return tickets;
    }),

  /**
   * Create a fix ticket
   */
  createFixTicket: protectedProcedure
    .input(z.object({
      ticketType: z.enum(["hardcode_violation", "provenance_gap", "broken_link", "export_failure", "translation_gap", "data_quality", "coverage_gap", "other"]),
      severity: z.enum(["low", "medium", "high", "critical"]),
      title: z.string(),
      description: z.string(),
      affectedRoute: z.string().optional(),
      affectedComponent: z.string().optional(),
      suggestedFix: z.string().optional(),
      qaRunId: z.number().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const [result] = await (await getDbInstance()).execute(sql`
        INSERT INTO fix_tickets (
          ticketType, severity, title, description, affectedRoute, 
          affectedComponent, suggestedFix, qaRunId, createdByUserId
        ) VALUES (
          ${input.ticketType}, ${input.severity}, ${input.title}, ${input.description},
          ${input.affectedRoute || null}, ${input.affectedComponent || null},
          ${input.suggestedFix || null}, ${input.qaRunId || null}, ${ctx.user.id}
        )
      `);
      
      // Log event
      await (await getDbInstance()).execute(sql`
        INSERT INTO autopilot_events (eventType, summary, relatedTicketId)
        VALUES ('ticket_created', ${`Ticket created: ${input.title}`}, ${(result as any).insertId})
      `);
      
      return { ticketId: (result as any).insertId, success: true };
    }),

  /**
   * Update fix ticket status
   */
  updateFixTicket: protectedProcedure
    .input(z.object({
      ticketId: z.number(),
      status: z.enum(["open", "in_progress", "resolved", "wont_fix"]),
      resolution: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      await (await getDbInstance()).execute(sql`
        UPDATE fix_tickets SET
          status = ${input.status},
          resolution = ${input.resolution || null},
          resolvedByUserId = ${input.status === 'resolved' || input.status === 'wont_fix' ? ctx.user.id : null},
          resolvedAt = ${input.status === 'resolved' || input.status === 'wont_fix' ? sql`NOW()` : null}
        WHERE id = ${input.ticketId}
      `);
      
      if (input.status === 'resolved') {
        await (await getDbInstance()).execute(sql`
          INSERT INTO autopilot_events (eventType, summary, relatedTicketId)
          VALUES ('ticket_resolved', ${`Ticket resolved: #${input.ticketId}`}, ${input.ticketId})
        `);
      }
      
      return { success: true };
    }),

  // ============================================================================
  // PUBLISH GATE
  // ============================================================================

  /**
   * Get publish runs
   */
  getPublishRuns: publicProcedure
    .input(z.object({
      status: z.enum(["pending", "running", "success", "failed", "blocked"]).optional(),
      limit: z.number().default(20)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.status) {
        whereClause = sql`${whereClause} AND status = ${input.status}`;
      }
      
      const runs = await (await getDbInstance()).execute(sql`
        SELECT pr.*, qr.runType as qaRunType, qr.status as qaRunStatus
        FROM publish_runs pr
        LEFT JOIN qa_runs qr ON pr.qaRunId = qr.id
        WHERE ${whereClause}
        ORDER BY startedAt DESC
        LIMIT ${input.limit}
      `);
      
      return runs;
    }),

  /**
   * Check if publish is allowed (QA gate)
   */
  checkPublishGate: publicProcedure.query(async () => {
    // Get latest QA run for each type
    const qaStatus = await (await getDbInstance()).execute(sql`
      SELECT runType, status, failedChecks, startedAt
      FROM qa_runs
      WHERE id IN (
        SELECT MAX(id) FROM qa_runs GROUP BY runType
      )
    `);
    
    // Get open critical/high tickets
    const [criticalTickets] = await (await getDbInstance()).execute(sql`
      SELECT COUNT(*) as count FROM fix_tickets
      WHERE status = 'open' AND severity IN ('critical', 'high')
    `);
    
    // Determine if publish is allowed
    const qaArray = qaStatus as any[];
    const hasFailedQA = qaArray.some((qa: any) => qa.status === 'fail');
    const hasCriticalTickets = (criticalTickets as any)?.count > 0;
    
    return {
      allowed: !hasFailedQA && !hasCriticalTickets,
      qaStatus: qaArray,
      criticalTickets: (criticalTickets as any)?.count || 0,
      blockedReason: hasFailedQA 
        ? 'QA checks failed' 
        : hasCriticalTickets 
          ? 'Critical/high severity tickets open' 
          : null
    };
  }),

  // ============================================================================
  // CONTROL ROOM
  // ============================================================================

  /**
   * Get autopilot settings
   */
  getSettings: publicProcedure.query(async () => {
    const settings = await (await getDbInstance()).execute(sql`
      SELECT * FROM autopilot_settings
      ORDER BY category, settingKey
    `);
    
    return settings;
  }),

  /**
   * Update autopilot setting
   */
  updateSetting: adminProcedure
    .input(z.object({
      settingKey: z.string(),
      settingValue: z.string(),
      settingType: z.enum(["boolean", "number", "string", "json"]),
      description: z.string().optional(),
      category: z.enum(["ingestion", "qa", "publishing", "coverage", "notifications", "general"])
    }))
    .mutation(async ({ input, ctx }) => {
      await (await getDbInstance()).execute(sql`
        INSERT INTO autopilot_settings (settingKey, settingValue, settingType, description, category, updatedByUserId)
        VALUES (${input.settingKey}, ${input.settingValue}, ${input.settingType}, ${input.description || null}, ${input.category}, ${ctx.user.id})
        ON DUPLICATE KEY UPDATE
          settingValue = ${input.settingValue},
          description = ${input.description || null},
          updatedByUserId = ${ctx.user.id}
      `);
      
      // Log event
      await (await getDbInstance()).execute(sql`
        INSERT INTO autopilot_events (eventType, summary, triggeredByUserId)
        VALUES ('setting_changed', ${`Setting changed: ${input.settingKey}`}, ${ctx.user.id})
      `);
      
      return { success: true };
    }),

  /**
   * Get recent autopilot events
   */
  getEvents: publicProcedure
    .input(z.object({
      eventType: z.string().optional(),
      limit: z.number().default(100)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.eventType) {
        whereClause = sql`${whereClause} AND eventType = ${input.eventType}`;
      }
      
      const events = await (await getDbInstance()).execute(sql`
        SELECT * FROM autopilot_events
        WHERE ${whereClause}
        ORDER BY createdAt DESC
        LIMIT ${input.limit}
      `);
      
      return events;
    }),

  /**
   * Get full autopilot dashboard status
   */
  getDashboard: publicProcedure.query(async () => {
    // Get latest ingestion status
    const [ingestionStatus] = await (await getDbInstance()).execute(sql`
      SELECT 
        COUNT(DISTINCT connectorName) as activeConnectors,
        SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as runningJobs,
        MAX(completedAt) as lastCompletion
      FROM ingestion_runs
      WHERE startedAt > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    
    // Get latest QA status
    const [qaStatus] = await (await getDbInstance()).execute(sql`
      SELECT 
        COUNT(*) as totalRuns,
        SUM(CASE WHEN status = 'pass' THEN 1 ELSE 0 END) as passedRuns,
        SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END) as failedRuns,
        MAX(completedAt) as lastCompletion
      FROM qa_runs
      WHERE startedAt > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    
    // Get ticket counts
    const [ticketCounts] = await (await getDbInstance()).execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN severity = 'critical' AND status = 'open' THEN 1 ELSE 0 END) as critical
      FROM fix_tickets
    `);
    
    // Get coverage summary
    const [coverageSummary] = await (await getDbInstance()).execute(sql`
      SELECT AVG(coverageScore) as avgCoverage, SUM(claimCount) as totalClaims
      FROM coverage_cells
    `);
    
    // Get recent events
    const recentEvents = await (await getDbInstance()).execute(sql`
      SELECT * FROM autopilot_events
      ORDER BY createdAt DESC
      LIMIT 10
    `);
    
    return {
      ingestion: ingestionStatus,
      qa: qaStatus,
      tickets: ticketCounts,
      coverage: coverageSummary,
      recentEvents
    };
  }),

  // ============================================================================
  // PAGE FACTORY
  // ============================================================================

  /**
   * Get page build runs
   */
  getPageBuildRuns: publicProcedure
    .input(z.object({
      pageType: z.string().optional(),
      status: z.enum(["running", "success", "failed", "skipped"]).optional(),
      limit: z.number().default(50)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.pageType) {
        whereClause = sql`${whereClause} AND pageType = ${input.pageType}`;
      }
      if (input.status) {
        whereClause = sql`${whereClause} AND status = ${input.status}`;
      }
      
      const runs = await (await getDbInstance()).execute(sql`
        SELECT * FROM page_build_runs
        WHERE ${whereClause}
        ORDER BY startedAt DESC
        LIMIT ${input.limit}
      `);
      
      return runs;
    }),

  /**
   * Trigger page generation
   */
  triggerPageBuild: adminProcedure
    .input(z.object({
      pageType: z.enum(["year_page", "sector_page", "actor_page", "regulation_page", "governorate_page", "report_page"]),
      pageIdentifier: z.string()
    }))
    .mutation(async ({ input }) => {
      const [result] = await (await getDbInstance()).execute(sql`
        INSERT INTO page_build_runs (pageType, pageIdentifier, startedAt, status)
        VALUES (${input.pageType}, ${input.pageIdentifier}, NOW(), 'running')
      `);
      
      // Log event
      await (await getDbInstance()).execute(sql`
        INSERT INTO autopilot_events (eventType, summary, relatedPageRoute)
        VALUES ('page_generated', ${`Page build started: ${input.pageType}/${input.pageIdentifier}`}, ${`/${input.pageType.replace('_page', '')}/${input.pageIdentifier}`})
      `);
      
      return { buildId: (result as any).insertId, success: true };
    }),

  // ============================================================================
  // INTEGRITY REPORTS
  // ============================================================================

  /**
   * Get integrity reports
   */
  getIntegrityReports: publicProcedure
    .input(z.object({
      reportType: z.string().optional(),
      limit: z.number().default(20)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.reportType) {
        whereClause = sql`${whereClause} AND reportType = ${input.reportType}`;
      }
      
      const reports = await (await getDbInstance()).execute(sql`
        SELECT * FROM integrity_reports
        WHERE ${whereClause}
        ORDER BY generatedAt DESC
        LIMIT ${input.limit}
      `);
      
      return reports;
    }),

  /**
   * Get latest integrity score
   */
  getLatestIntegrityScore: publicProcedure.query(async () => {
    const [report] = await (await getDbInstance()).execute(sql`
      SELECT * FROM integrity_reports
      WHERE reportType = 'full_integrity'
      ORDER BY generatedAt DESC
      LIMIT 1
    `);
    
    return report || null;
  })
});

export type AutopilotRouter = typeof autopilotRouter;
