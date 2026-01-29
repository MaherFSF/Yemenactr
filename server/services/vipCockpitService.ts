/**
 * VIP Cockpit Service
 * 
 * Provides role-based decision support dashboards with:
 * - Real-time signals from indicators
 * - Change detection and analysis
 * - Driver identification with evidence
 * - Policy options with tradeoffs
 * - Watchlist management
 * - Confidence and coverage metrics
 */

import { getDb } from "../db";
import { 
  vipRoleProfiles, 
  vipCockpitSignals, 
  vipCockpitDrivers, 
  vipCockpitOptions,
  vipWatchlistItems,
  vipUserAssignments,
  cockpitSnapshots,
  indicators,
  timeSeries,
} from "../../drizzle/schema";
import { eq, and, desc, gte } from "drizzle-orm";

// Types
export interface CockpitSignal {
  id: string;
  indicator: string;
  indicatorAr: string;
  value: number;
  unit: string;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  status: "normal" | "warning" | "critical";
  evidencePackId?: number;
  lastUpdated: string;
}

export interface CockpitChange {
  id: string;
  indicator: string;
  indicatorAr: string;
  previousValue: number;
  currentValue: number;
  delta: number;
  deltaPercent: number;
  period: string;
  significance: "high" | "medium" | "low";
  evidencePackId?: number;
}

export interface CockpitDriver {
  id: string;
  factor: string;
  factorAr: string;
  impact: "positive" | "negative" | "mixed";
  confidence: "high" | "medium" | "low";
  explanation: string;
  explanationAr: string;
  evidencePackId?: number;
  citations: string[];
}

export interface CockpitOption {
  id: string;
  title: string;
  titleAr: string;
  mechanism: string;
  mechanismAr: string;
  preconditions: string[];
  preconditionsAr: string[];
  risks: string[];
  risksAr: string[];
  timeframe: string;
  confidence: "high" | "medium" | "low";
  evidencePackId?: number;
}

export interface WatchlistItem {
  id: string;
  entity: string;
  entityAr: string;
  type: "indicator" | "entity" | "event" | "sector";
  status: "normal" | "warning" | "critical";
  value?: number;
  change7d?: number;
  change30d?: number;
  change90d?: number;
  evidencePackId?: number;
}

export interface CockpitData {
  roleId: string;
  roleName: string;
  roleNameAr: string;
  lastUpdated: string;
  signals: CockpitSignal[];
  changes: CockpitChange[];
  drivers: CockpitDriver[];
  options: CockpitOption[];
  watchlist: WatchlistItem[];
  confidence: {
    overallCoverage: number;
    dataFreshness: number;
    contradictionCount: number;
    gapCount: number;
  };
}

/**
 * Get all VIP role profiles
 */
export async function getVIPRoleProfiles() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const profiles = await db.select().from(vipRoleProfiles).where(eq(vipRoleProfiles.isActive, true));
  return profiles;
}

/**
 * Get a specific VIP role profile by code
 */
export async function getVIPRoleProfile(roleCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [profile] = await db.select().from(vipRoleProfiles).where(eq(vipRoleProfiles.roleCode, roleCode));
  return profile;
}

/**
 * Get cockpit data for a specific role
 */
export async function getCockpitData(roleCode: string, userId?: number): Promise<CockpitData> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get role profile
  const profile = await getVIPRoleProfile(roleCode);
  if (!profile) {
    throw new Error(`VIP role profile not found: ${roleCode}`);
  }

  // Get signals from database
  type DbSignal = typeof vipCockpitSignals.$inferSelect;
  type DbDriver = typeof vipCockpitDrivers.$inferSelect;
  type DbOption = typeof vipCockpitOptions.$inferSelect;
  
  const dbSignals: DbSignal[] = await db.select()
    .from(vipCockpitSignals)
    .where(eq(vipCockpitSignals.roleProfileId, profile.id))
    .orderBy(desc(vipCockpitSignals.lastUpdatedAt))
    .limit(10);

  // Get drivers from database
  const dbDrivers: DbDriver[] = await db.select()
    .from(vipCockpitDrivers)
    .where(eq(vipCockpitDrivers.roleProfileId, profile.id))
    .orderBy(desc(vipCockpitDrivers.identifiedAt))
    .limit(10);

  // Get options from database
  const dbOptions: DbOption[] = await db.select()
    .from(vipCockpitOptions)
    .where(and(
      eq(vipCockpitOptions.roleProfileId, profile.id),
      eq(vipCockpitOptions.status, "active")
    ))
    .orderBy(desc(vipCockpitOptions.priority))
    .limit(5);

  // Get watchlist items
  let watchlistItems: typeof vipWatchlistItems.$inferSelect[] = [];
  if (userId) {
    watchlistItems = await db.select()
      .from(vipWatchlistItems)
      .where(and(
        eq(vipWatchlistItems.userId, userId),
        eq(vipWatchlistItems.roleProfileId, profile.id)
      ))
      .limit(20);
  }

  // Transform to response format
  const signals: CockpitSignal[] = dbSignals.map((s: DbSignal) => ({
    id: `sig_${s.id}`,
    indicator: s.indicatorName,
    indicatorAr: s.indicatorNameAr,
    value: Number(s.currentValue) || 0,
    unit: s.unit || "",
    change: Number(s.change) || 0,
    changePercent: Number(s.changePercent) || 0,
    trend: s.trend || "stable",
    status: s.status || "normal",
    evidencePackId: s.evidencePackId || undefined,
    lastUpdated: s.lastUpdatedAt?.toISOString() || new Date().toISOString(),
  }));

  const changes: CockpitChange[] = dbSignals
    .filter((s: DbSignal) => Math.abs(Number(s.changePercent)) > 1)
    .map((s: DbSignal) => ({
      id: `chg_${s.id}`,
      indicator: s.indicatorName,
      indicatorAr: s.indicatorNameAr,
      previousValue: Number(s.previousValue) || 0,
      currentValue: Number(s.currentValue) || 0,
      delta: Number(s.change) || 0,
      deltaPercent: Number(s.changePercent) || 0,
      period: "Last 30 days",
      significance: (Math.abs(Number(s.changePercent)) > 10 ? "high" : Math.abs(Number(s.changePercent)) > 5 ? "medium" : "low") as "high" | "medium" | "low",
      evidencePackId: s.evidencePackId || undefined,
    }));

  const drivers: CockpitDriver[] = dbDrivers.map((d: DbDriver) => ({
    id: `drv_${d.id}`,
    factor: d.factor,
    factorAr: d.factorAr,
    impact: d.impact || "mixed",
    confidence: d.confidence || "medium",
    explanation: d.explanation,
    explanationAr: d.explanationAr,
    evidencePackId: d.evidencePackId || undefined,
    citations: (d.citations as string[]) || [],
  }));

  const options: CockpitOption[] = dbOptions.map((o: DbOption) => ({
    id: `opt_${o.id}`,
    title: o.title,
    titleAr: o.titleAr,
    mechanism: o.mechanism,
    mechanismAr: o.mechanismAr,
    preconditions: (o.preconditions as string[]) || [],
    preconditionsAr: (o.preconditionsAr as string[]) || [],
    risks: (o.risks as string[]) || [],
    risksAr: (o.risksAr as string[]) || [],
    timeframe: o.timeframe || "TBD",
    confidence: o.confidence || "medium",
    evidencePackId: o.evidencePackId || undefined,
  }));

  const watchlist: WatchlistItem[] = watchlistItems.map((w) => ({
    id: `wl_${w.id}`,
    entity: w.itemName,
    entityAr: w.itemNameAr,
    type: w.itemType,
    status: w.status || "normal",
    value: Number(w.currentValue) || undefined,
    change7d: Number(w.change7d) || undefined,
    change30d: Number(w.change30d) || undefined,
    change90d: Number(w.change90d) || undefined,
    evidencePackId: w.evidencePackId || undefined,
  }));

  // Calculate confidence metrics
  const totalIndicators = signals.length;
  const freshIndicators = signals.filter((s) => {
    const lastUpdated = new Date(s.lastUpdated);
    const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate < 7;
  }).length;

  return {
    roleId: roleCode,
    roleName: profile.roleName,
    roleNameAr: profile.roleNameAr,
    lastUpdated: new Date().toISOString(),
    signals,
    changes,
    drivers,
    options,
    watchlist,
    confidence: {
      overallCoverage: totalIndicators > 0 ? Math.round((signals.length / 10) * 100) : 0,
      dataFreshness: totalIndicators > 0 ? Math.round((freshIndicators / totalIndicators) * 100) : 0,
      contradictionCount: 0,
      gapCount: Math.max(0, 10 - signals.length),
    },
  };
}

/**
 * Generate cockpit data from real indicators
 */
export async function generateCockpitSignals(roleCode: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const profile = await getVIPRoleProfile(roleCode);
  if (!profile) {
    throw new Error(`VIP role profile not found: ${roleCode}`);
  }

  const primaryIndicators = (profile.primaryIndicators as string[]) || [];
  
  // Get latest indicator values for primary indicators
  for (const indicatorCode of primaryIndicators) {
    const [indicator] = await db.select()
      .from(indicators)
      .where(eq(indicators.code, indicatorCode))
      .limit(1);

    if (!indicator) continue;

    // Get latest two values from time series
    const values = await db.select()
      .from(timeSeries)
      .where(eq(timeSeries.indicatorCode, indicator.code))
      .orderBy(desc(timeSeries.date))
      .limit(2);

    if (values.length === 0) continue;

    const currentValue = Number(values[0].value);
    const previousValue = values.length > 1 ? Number(values[1].value) : currentValue;
    const change = currentValue - previousValue;
    const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;

    // Determine trend and status
    const trend = change > 0 ? "up" : change < 0 ? "down" : "stable";
    let status: "normal" | "warning" | "critical" = "normal";
    if (Math.abs(changePercent) > 20) status = "critical";
    else if (Math.abs(changePercent) > 10) status = "warning";

    // Upsert signal
    const existingSignal = await db.select()
      .from(vipCockpitSignals)
      .where(and(
        eq(vipCockpitSignals.roleProfileId, profile.id),
        eq(vipCockpitSignals.indicatorCode, indicatorCode)
      ))
      .limit(1);

    if (existingSignal.length > 0) {
      await db.update(vipCockpitSignals)
        .set({
          currentValue: currentValue.toString(),
          previousValue: previousValue.toString(),
          change: change.toString(),
          changePercent: changePercent.toString(),
          trend,
          status,
          lastUpdatedAt: new Date(),
        })
        .where(eq(vipCockpitSignals.id, existingSignal[0].id));
    } else {
      await db.insert(vipCockpitSignals).values({
        roleProfileId: profile.id,
        signalCode: `${roleCode}_${indicatorCode}`,
        indicatorCode,
        indicatorName: indicator.nameEn,
        indicatorNameAr: indicator.nameAr,
        currentValue: currentValue.toString(),
        previousValue: previousValue.toString(),
        unit: indicator.unit,
        change: change.toString(),
        changePercent: changePercent.toString(),
        trend,
        status,
      });
    }
  }
}

/**
 * Add item to user's watchlist
 */
export async function addToWatchlist(
  userId: number,
  roleProfileId: number,
  item: {
    itemType: "indicator" | "entity" | "event" | "sector";
    itemCode: string;
    itemName: string;
    itemNameAr: string;
    alertThreshold?: number;
    alertDirection?: "above" | "below" | "both";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [existing] = await db.select()
    .from(vipWatchlistItems)
    .where(and(
      eq(vipWatchlistItems.userId, userId),
      eq(vipWatchlistItems.itemCode, item.itemCode)
    ))
    .limit(1);

  if (existing) {
    return existing;
  }

  const [newItem] = await db.insert(vipWatchlistItems).values({
    userId,
    roleProfileId,
    itemType: item.itemType,
    itemCode: item.itemCode,
    itemName: item.itemName,
    itemNameAr: item.itemNameAr,
    alertThreshold: item.alertThreshold?.toString(),
    alertDirection: item.alertDirection || "both",
  }).$returningId();

  return newItem;
}

/**
 * Remove item from user's watchlist
 */
export async function removeFromWatchlist(userId: number, itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(vipWatchlistItems)
    .where(and(
      eq(vipWatchlistItems.userId, userId),
      eq(vipWatchlistItems.id, itemId)
    ));
}

/**
 * Get user's watchlist
 */
export async function getUserWatchlist(userId: number, roleProfileId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conditions = [eq(vipWatchlistItems.userId, userId)];
  if (roleProfileId) {
    conditions.push(eq(vipWatchlistItems.roleProfileId, roleProfileId));
  }

  return db.select()
    .from(vipWatchlistItems)
    .where(and(...conditions))
    .orderBy(desc(vipWatchlistItems.addedAt));
}

/**
 * Take a daily snapshot of cockpit state
 */
export async function takeCockpitSnapshot(roleCode: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const profile = await getVIPRoleProfile(roleCode);
  if (!profile) return;

  const data = await getCockpitData(roleCode);

  await db.insert(cockpitSnapshots).values({
    roleProfileId: profile.id,
    snapshotDate: new Date(),
    totalSignals: data.signals.length,
    criticalSignals: data.signals.filter((s) => s.status === "critical").length,
    warningSignals: data.signals.filter((s) => s.status === "warning").length,
    normalSignals: data.signals.filter((s) => s.status === "normal").length,
    overallCoverage: data.confidence.overallCoverage.toString(),
    dataFreshness: data.confidence.dataFreshness.toString(),
    contradictionCount: data.confidence.contradictionCount,
    gapCount: data.confidence.gapCount,
    signalsSnapshot: data.signals,
    driversSnapshot: data.drivers,
    optionsSnapshot: data.options,
    watchlistSnapshot: data.watchlist,
  });
}

/**
 * Get historical snapshots for trend analysis
 */
export async function getCockpitSnapshots(roleCode: string, days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const profile = await getVIPRoleProfile(roleCode);
  if (!profile) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return db.select()
    .from(cockpitSnapshots)
    .where(and(
      eq(cockpitSnapshots.roleProfileId, profile.id),
      gte(cockpitSnapshots.snapshotDate, startDate)
    ))
    .orderBy(desc(cockpitSnapshots.snapshotDate));
}

/**
 * Assign user to VIP role
 */
export async function assignUserToVIPRole(
  userId: number,
  roleCode: string,
  assignedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const profile = await getVIPRoleProfile(roleCode);
  if (!profile) {
    throw new Error(`VIP role profile not found: ${roleCode}`);
  }

  const [existing] = await db.select()
    .from(vipUserAssignments)
    .where(and(
      eq(vipUserAssignments.userId, userId),
      eq(vipUserAssignments.roleProfileId, profile.id)
    ))
    .limit(1);

  if (existing) {
    return existing;
  }

  const [assignment] = await db.insert(vipUserAssignments).values({
    userId,
    roleProfileId: profile.id,
    assignedBy,
    isActive: true,
  }).$returningId();

  return assignment;
}

/**
 * Get user's VIP role assignments
 */
export async function getUserVIPAssignments(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select({
    assignment: vipUserAssignments,
    profile: vipRoleProfiles,
  })
    .from(vipUserAssignments)
    .innerJoin(vipRoleProfiles, eq(vipUserAssignments.roleProfileId, vipRoleProfiles.id))
    .where(and(
      eq(vipUserAssignments.userId, userId),
      eq(vipUserAssignments.isActive, true)
    ));
}
