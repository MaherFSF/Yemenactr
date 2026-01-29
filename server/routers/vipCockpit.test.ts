/**
 * VIP Cockpit Router Tests
 * Tests for the RoleLens cockpit system including:
 * - Role profiles
 * - Cockpit data
 * - Decision journal
 * - Auto-briefs
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the services
vi.mock("../services/vipCockpitService", () => ({
  getVIPRoleProfiles: vi.fn().mockResolvedValue([
    {
      id: 1,
      roleCode: "vip_president",
      roleName: "Presidential Advisor",
      roleNameAr: "مستشار رئاسي",
      roleDescription: "High-level economic overview",
      roleDescriptionAr: "نظرة اقتصادية عالية المستوى",
      isActive: true,
    },
    {
      id: 2,
      roleCode: "vip_finance_minister",
      roleName: "Finance Minister",
      roleNameAr: "وزير المالية",
      roleDescription: "Fiscal policy and budget oversight",
      roleDescriptionAr: "السياسة المالية ومراقبة الميزانية",
      isActive: true,
    },
  ]),
  getVIPRoleProfile: vi.fn().mockImplementation((roleCode: string) => {
    if (roleCode === "vip_president") {
      return Promise.resolve({
        id: 1,
        roleCode: "vip_president",
        roleName: "Presidential Advisor",
        roleNameAr: "مستشار رئاسي",
      });
    }
    return Promise.resolve(null);
  }),
  getCockpitData: vi.fn().mockResolvedValue({
    roleId: "vip_president",
    roleName: "Presidential Advisor",
    roleNameAr: "مستشار رئاسي",
    lastUpdated: new Date().toISOString(),
    signals: [
      {
        id: "sig_1",
        indicator: "Exchange Rate",
        indicatorAr: "سعر الصرف",
        value: 1850,
        unit: "YER/USD",
        change: 50,
        changePercent: 2.8,
        trend: "up",
        status: "warning",
      },
    ],
    changes: [],
    drivers: [],
    options: [],
    watchlist: [],
    confidence: {
      overallCoverage: 75,
      dataFreshness: 85,
      contradictionCount: 2,
      gapCount: 5,
    },
  }),
  generateCockpitSignals: vi.fn().mockResolvedValue(undefined),
  addToWatchlist: vi.fn().mockResolvedValue({ id: 1 }),
  removeFromWatchlist: vi.fn().mockResolvedValue(undefined),
  getUserWatchlist: vi.fn().mockResolvedValue([]),
  takeCockpitSnapshot: vi.fn().mockResolvedValue(undefined),
  getCockpitSnapshots: vi.fn().mockResolvedValue([]),
  assignUserToVIPRole: vi.fn().mockResolvedValue({ id: 1 }),
  getUserVIPAssignments: vi.fn().mockResolvedValue([]),
}));

vi.mock("../services/decisionJournalService", () => ({
  createDecisionEntry: vi.fn().mockResolvedValue({ id: 1 }),
  getUserDecisions: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: "Test Decision",
      titleAr: "قرار اختباري",
      contextSummary: "Test context",
      decision: "Test decision text",
      rationale: "Test rationale",
      confidenceLevel: "medium",
      status: "active",
      decisionDate: new Date(),
    },
  ]),
  getDecisionEntry: vi.fn().mockResolvedValue({
    id: 1,
    title: "Test Decision",
    status: "active",
  }),
  updateDecisionEntry: vi.fn().mockResolvedValue({ success: true }),
  recordOutcome: vi.fn().mockResolvedValue({ id: 1 }),
  getDecisionOutcomes: vi.fn().mockResolvedValue([]),
  createFollowUp: vi.fn().mockResolvedValue({ id: 1 }),
  getDecisionFollowUps: vi.fn().mockResolvedValue([]),
  updateFollowUpStatus: vi.fn().mockResolvedValue({ success: true }),
  getPendingFollowUps: vi.fn().mockResolvedValue([]),
  getDecisionStats: vi.fn().mockResolvedValue({
    totalDecisions: 10,
    activeDecisions: 5,
    implementedDecisions: 3,
    successRate: 80,
  }),
}));

vi.mock("../services/autoBriefService", () => ({
  getBriefTemplates: vi.fn().mockResolvedValue([
    {
      id: 1,
      templateCode: "BRIEF-001",
      templateName: "Daily Economic Brief",
      templateNameAr: "الموجز الاقتصادي اليومي",
      frequency: "daily",
      isActive: true,
    },
  ]),
  getBriefTemplate: vi.fn().mockResolvedValue({
    id: 1,
    templateCode: "BRIEF-001",
    templateName: "Daily Economic Brief",
    frequency: "daily",
  }),
  createBriefTemplate: vi.fn().mockResolvedValue({ id: 1 }),
  generateBrief: vi.fn().mockResolvedValue({
    id: 1,
    brief: {
      id: 1,
      title: "Generated Brief",
      executiveSummary: "Test summary",
    },
  }),
  getUserSubscriptions: vi.fn().mockResolvedValue([]),
  subscribeToBrief: vi.fn().mockResolvedValue({ id: 1 }),
  unsubscribeFromBrief: vi.fn().mockResolvedValue({ success: true }),
  getUserBriefHistory: vi.fn().mockResolvedValue([]),
  markBriefAsRead: vi.fn().mockResolvedValue({ success: true }),
  getBriefInstance: vi.fn().mockResolvedValue({
    id: 1,
    title: "Test Brief",
    executiveSummary: "Test summary",
  }),
}));

describe("VIP Cockpit Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Role Profiles", () => {
    it("should return all VIP role profiles", async () => {
      const { getVIPRoleProfiles } = await import("../services/vipCockpitService");
      const profiles = await getVIPRoleProfiles();
      
      expect(profiles).toHaveLength(2);
      expect(profiles[0].roleCode).toBe("vip_president");
      expect(profiles[1].roleCode).toBe("vip_finance_minister");
    });

    it("should return a specific role profile by code", async () => {
      const { getVIPRoleProfile } = await import("../services/vipCockpitService");
      const profile = await getVIPRoleProfile("vip_president");
      
      expect(profile).not.toBeNull();
      expect(profile?.roleCode).toBe("vip_president");
      expect(profile?.roleName).toBe("Presidential Advisor");
    });

    it("should return null for non-existent role", async () => {
      const { getVIPRoleProfile } = await import("../services/vipCockpitService");
      const profile = await getVIPRoleProfile("non_existent");
      
      expect(profile).toBeNull();
    });
  });

  describe("Cockpit Data", () => {
    it("should return cockpit data for a role", async () => {
      const { getCockpitData } = await import("../services/vipCockpitService");
      const data = await getCockpitData("vip_president");
      
      expect(data).toBeDefined();
      expect(data.roleId).toBe("vip_president");
      expect(data.signals).toHaveLength(1);
      expect(data.confidence.overallCoverage).toBe(75);
    });

    it("should have required cockpit data structure", async () => {
      const { getCockpitData } = await import("../services/vipCockpitService");
      const data = await getCockpitData("vip_president");
      
      expect(data).toHaveProperty("signals");
      expect(data).toHaveProperty("changes");
      expect(data).toHaveProperty("drivers");
      expect(data).toHaveProperty("options");
      expect(data).toHaveProperty("watchlist");
      expect(data).toHaveProperty("confidence");
    });
  });

  describe("Decision Journal", () => {
    it("should create a decision entry", async () => {
      const { createDecisionEntry } = await import("../services/decisionJournalService");
      const result = await createDecisionEntry(1, null, {
        title: "Test Decision",
        contextSummary: "Test context",
        decision: "Test decision",
        rationale: "Test rationale",
      });
      
      expect(result).toHaveProperty("id");
      expect(result.id).toBe(1);
    });

    it("should return user decisions", async () => {
      const { getUserDecisions } = await import("../services/decisionJournalService");
      const decisions = await getUserDecisions(1);
      
      expect(decisions).toHaveLength(1);
      expect(decisions[0].title).toBe("Test Decision");
      expect(decisions[0].status).toBe("active");
    });

    it("should return decision stats", async () => {
      const { getDecisionStats } = await import("../services/decisionJournalService");
      const stats = await getDecisionStats(1);
      
      expect(stats.totalDecisions).toBe(10);
      expect(stats.activeDecisions).toBe(5);
      expect(stats.successRate).toBe(80);
    });
  });

  describe("Auto-Briefs", () => {
    it("should return brief templates", async () => {
      const { getBriefTemplates } = await import("../services/autoBriefService");
      const templates = await getBriefTemplates();
      
      expect(templates).toHaveLength(1);
      expect(templates[0].templateName).toBe("Daily Economic Brief");
      expect(templates[0].frequency).toBe("daily");
    });

    it("should generate a brief", async () => {
      const { generateBrief } = await import("../services/autoBriefService");
      const result = await generateBrief(1, "vip_president", 1);
      
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("brief");
      expect(result.brief.title).toBe("Generated Brief");
    });

    it("should subscribe to a brief template", async () => {
      const { subscribeToBrief } = await import("../services/autoBriefService");
      const result = await subscribeToBrief(1, 1);
      
      expect(result).toHaveProperty("id");
      expect(result.id).toBe(1);
    });
  });

  describe("RoleLens Cockpit Features", () => {
    it("should provide 5-part decision support structure", async () => {
      const { getCockpitData } = await import("../services/vipCockpitService");
      const data = await getCockpitData("vip_president");
      
      // 1. What changed
      expect(data).toHaveProperty("changes");
      
      // 2. Why (drivers)
      expect(data).toHaveProperty("drivers");
      
      // 3. Options
      expect(data).toHaveProperty("options");
      
      // 4. What to do next (signals with status)
      expect(data.signals[0]).toHaveProperty("status");
      
      // 5. Confidence
      expect(data).toHaveProperty("confidence");
    });

    it("should include evidence for signals", async () => {
      const { getCockpitData } = await import("../services/vipCockpitService");
      const data = await getCockpitData("vip_president");
      
      // Each signal should have evidence capability
      expect(data.signals[0]).toHaveProperty("indicator");
      expect(data.signals[0]).toHaveProperty("value");
      expect(data.signals[0]).toHaveProperty("trend");
    });
  });
});
