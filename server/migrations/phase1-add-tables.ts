/**
 * YETO v1.6 Phase 1 Migration: Add Enhanced Tables
 * Adds calendar, source registry, ingestion tracking, gap tickets, agents, and audit logging
 */

import { getDb } from "../db";
import {
  calendarDay,
  sourceRegistry,
  ingestionRun,
  gapTicket,
  agent,
  agentRun,
  contentEvidence,
  documentTextChunk,
  glossaryTerm,
  auditLog,
  seedAgents,
  seedSources,
} from "../../drizzle/phase1-enhancements";

export async function migratePhase1() {
  console.log("🚀 Starting YETO v1.6 Phase 1 Migration...");

  try {
    // 1. Populate calendar table (2010-2026)
    console.log("📅 Populating calendar table (2010-2026)...");
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const calendarDays: typeof calendarDay.$inferInsert[] = [];
    const startDate = new Date("2010-01-01");
    const endDate = new Date("2026-12-31");

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const dayOfWeek = d.getDay();
      const week = Math.ceil(((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7);

      calendarDays.push({
        day: d.toISOString().split("T")[0] as any,
        isoYear: year,
        isoWeek: week,
        month,
        quarter: Math.ceil(month / 3),
        dayOfWeek,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });

      if (calendarDays.length >= 1000) {
        await db.insert(calendarDay).values(calendarDays).onDuplicateKeyUpdate({ set: {} });
        calendarDays.length = 0;
      }
    }

    if (calendarDays.length > 0) {
      await db.insert(calendarDay).values(calendarDays).onDuplicateKeyUpdate({ set: {} });
    }

    console.log(`✅ Calendar table populated with ${Math.floor((endDate.getTime() - startDate.getTime()) / 86400000)} days`);

    // 2. Seed source registry
    console.log("📚 Seeding source registry...");
    for (const source of seedSources) {
      await (db as any)
        .insert(sourceRegistry)
        .values(source)
        .onDuplicateKeyUpdate({
          set: {
            nameEn: source.nameEn,
            status: source.status,
          },
        });
    }
    console.log(`✅ Source registry seeded with ${seedSources.length} sources`);

    // 3. Seed agents
    console.log("🤖 Seeding approval agents...");
    for (const agentData of seedAgents) {
      await (db as any)
        .insert(agent)
        .values(agentData)
        .onDuplicateKeyUpdate({
          set: {
            nameEn: agentData.nameEn,
          },
        });
    }
    console.log(`✅ Agents seeded with ${seedAgents.length} agents`);

    // 4. Verify tables exist
    console.log("🔍 Verifying tables...");
    const tables = [
      "calendar_day",
      "source_registry",
      "ingestion_run",
      "gap_ticket",
      "agent",
      "agent_run",
      "content_evidence",
      "document_text_chunk",
      "glossary_term",
      "audit_log",
    ];

    for (const table of tables) {
      const result = await (db as any).execute(`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = '${table}' AND table_schema = DATABASE()`);
      if ((result as any)[0]?.[0]?.count > 0) {
        console.log(`✅ Table ${table} exists`);
      } else {
        console.log(`⚠️ Table ${table} may not exist (will be created by Drizzle)`);
      }
    }

    console.log("✅ YETO v1.6 Phase 1 Migration Complete!");
    return { success: true, message: "Phase 1 migration completed successfully" };
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  migratePhase1()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
