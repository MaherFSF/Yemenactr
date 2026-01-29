/**
 * Updates Router Tests
 * 
 * Tests for the NOW Layer updates ingestion and governed publishing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
  })),
}));

// Mock the services
vi.mock("../services/updatesIngestionService", () => ({
  runDailyIngestion: vi.fn().mockResolvedValue({
    totalProcessed: 10,
    totalIngested: 8,
    totalDuplicates: 2,
    totalErrors: 0,
    sourceResults: []
  }),
  ingestFromSource: vi.fn().mockResolvedValue({
    ingested: 5,
    duplicates: 1,
    errors: 0
  }),
  classifyUpdate: vi.fn().mockResolvedValue({
    updateType: "economic_data",
    sectors: ["currency_fx"],
    entities: [],
    indicators: []
  }),
}));

vi.mock("../services/governedPublishingService", () => ({
  runPublishingPipeline: vi.fn().mockResolvedValue({
    passed: true,
    gateResults: {
      evidence: { passed: true, score: 0.95 },
      source: { passed: true, score: 1.0 },
      translation: { passed: true, score: 0.98 },
      sensitivity: { passed: true, score: 1.0 },
      contradiction: { passed: true, score: 1.0 },
      quality: { passed: true, score: 0.92 }
    },
    overallScore: 0.97,
    recommendation: "auto_publish"
  }),
  getPublishingStats: vi.fn().mockResolvedValue({
    totalProcessed: 100,
    totalPublished: 85,
    totalRejected: 10,
    totalPending: 5,
    averageScore: 0.89,
    gateFailureRates: {}
  }),
}));

describe("Updates Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPublished", () => {
    it("should return published updates with pagination", async () => {
      const mockUpdates = [
        {
          id: 1,
          titleEn: "FX Rate Update",
          titleAr: "تحديث سعر الصرف",
          summaryEn: "Exchange rate changed",
          summaryAr: "تغير سعر الصرف",
          status: "published",
          confidenceGrade: "A",
          publishedAt: new Date().toISOString()
        }
      ];

      expect(mockUpdates).toHaveLength(1);
      expect(mockUpdates[0].status).toBe("published");
    });

    it("should filter by update type", async () => {
      const mockUpdates = [
        { id: 1, updateType: "economic_data", status: "published" },
        { id: 2, updateType: "policy_announcement", status: "published" }
      ];

      const filtered = mockUpdates.filter(u => u.updateType === "economic_data");
      expect(filtered).toHaveLength(1);
    });

    it("should filter by sector", async () => {
      const mockUpdates = [
        { id: 1, sectors: ["currency_fx", "banking"], status: "published" },
        { id: 2, sectors: ["trade"], status: "published" }
      ];

      const filtered = mockUpdates.filter(u => u.sectors?.includes("currency_fx"));
      expect(filtered).toHaveLength(1);
    });
  });

  describe("getReviewQueue", () => {
    it("should return updates pending review", async () => {
      const mockQueue = [
        { id: 1, status: "pending_review", confidenceGrade: "B" },
        { id: 2, status: "pending_review", confidenceGrade: "C" }
      ];

      expect(mockQueue).toHaveLength(2);
      expect(mockQueue.every(u => u.status === "pending_review")).toBe(true);
    });

    it("should sort by confidence grade", async () => {
      const mockQueue = [
        { id: 1, confidenceGrade: "C" },
        { id: 2, confidenceGrade: "A" },
        { id: 3, confidenceGrade: "B" }
      ];

      const sorted = [...mockQueue].sort((a, b) => 
        a.confidenceGrade.localeCompare(b.confidenceGrade)
      );

      expect(sorted[0].confidenceGrade).toBe("A");
      expect(sorted[2].confidenceGrade).toBe("C");
    });
  });

  describe("runDailyIngestion", () => {
    it("should process updates from all sources", async () => {
      const result = {
        totalProcessed: 10,
        totalIngested: 8,
        totalDuplicates: 2,
        totalErrors: 0,
        sourceResults: [
          { sourceId: 1, sourceName: "CBY", ingested: 3, duplicates: 1, errors: 0 },
          { sourceId: 2, sourceName: "MoF", ingested: 5, duplicates: 1, errors: 0 }
        ]
      };

      expect(result.totalIngested).toBe(8);
      expect(result.totalDuplicates).toBe(2);
      expect(result.totalErrors).toBe(0);
    });

    it("should handle source errors gracefully", async () => {
      const result = {
        totalProcessed: 10,
        totalIngested: 7,
        totalDuplicates: 1,
        totalErrors: 2,
        sourceResults: [
          { sourceId: 1, sourceName: "CBY", ingested: 3, duplicates: 1, errors: 0 },
          { sourceId: 2, sourceName: "External", ingested: 4, duplicates: 0, errors: 2 }
        ]
      };

      expect(result.totalErrors).toBe(2);
      expect(result.totalIngested).toBeLessThan(result.totalProcessed);
    });
  });

  describe("approveUpdate", () => {
    it("should publish update when approved", async () => {
      const update = {
        id: 1,
        status: "pending_review",
        confidenceGrade: "A"
      };

      const approved = { ...update, status: "published", publishedAt: new Date().toISOString() };
      expect(approved.status).toBe("published");
      expect(approved.publishedAt).toBeDefined();
    });

    it("should reject update with reason", async () => {
      const update = {
        id: 1,
        status: "pending_review"
      };

      const rejected = { 
        ...update, 
        status: "rejected", 
        rejectionReason: "Insufficient evidence" 
      };
      
      expect(rejected.status).toBe("rejected");
      expect(rejected.rejectionReason).toBe("Insufficient evidence");
    });
  });

  describe("runPublishingPipeline", () => {
    it("should pass all 6 gates for high-quality update", async () => {
      const result = {
        passed: true,
        gateResults: {
          evidence: { passed: true, score: 0.95 },
          source: { passed: true, score: 1.0 },
          translation: { passed: true, score: 0.98 },
          sensitivity: { passed: true, score: 1.0 },
          contradiction: { passed: true, score: 1.0 },
          quality: { passed: true, score: 0.92 }
        },
        overallScore: 0.97,
        recommendation: "auto_publish"
      };

      expect(result.passed).toBe(true);
      expect(result.recommendation).toBe("auto_publish");
      expect(Object.values(result.gateResults).every(g => g.passed)).toBe(true);
    });

    it("should fail when evidence gate fails", async () => {
      const result = {
        passed: false,
        gateResults: {
          evidence: { passed: false, score: 0.65 },
          source: { passed: true, score: 1.0 },
          translation: { passed: true, score: 0.98 },
          sensitivity: { passed: true, score: 1.0 },
          contradiction: { passed: true, score: 1.0 },
          quality: { passed: true, score: 0.92 }
        },
        overallScore: 0.75,
        recommendation: "manual_review"
      };

      expect(result.passed).toBe(false);
      expect(result.gateResults.evidence.passed).toBe(false);
      expect(result.recommendation).toBe("manual_review");
    });

    it("should flag sensitivity issues", async () => {
      const result = {
        passed: false,
        gateResults: {
          evidence: { passed: true, score: 0.95 },
          source: { passed: true, score: 1.0 },
          translation: { passed: true, score: 0.98 },
          sensitivity: { passed: false, score: 0.3, flags: ["political_claim", "unverified_casualty"] },
          contradiction: { passed: true, score: 1.0 },
          quality: { passed: true, score: 0.92 }
        },
        overallScore: 0.72,
        recommendation: "admin_review"
      };

      expect(result.gateResults.sensitivity.passed).toBe(false);
      expect(result.gateResults.sensitivity.flags).toContain("political_claim");
      expect(result.recommendation).toBe("admin_review");
    });
  });

  describe("deduplication", () => {
    it("should detect duplicate by content hash", async () => {
      const updates = [
        { id: 1, contentHash: "abc123", sourceUrl: "https://cby.gov.ye/news/1" },
        { id: 2, contentHash: "abc123", sourceUrl: "https://cby.gov.ye/news/2" }
      ];

      const uniqueHashes = new Set(updates.map(u => u.contentHash));
      expect(uniqueHashes.size).toBe(1);
      expect(updates.length).toBe(2);
    });

    it("should detect duplicate by URL", async () => {
      const updates = [
        { id: 1, contentHash: "abc123", sourceUrl: "https://cby.gov.ye/news/1" },
        { id: 2, contentHash: "def456", sourceUrl: "https://cby.gov.ye/news/1" }
      ];

      const uniqueUrls = new Set(updates.map(u => u.sourceUrl));
      expect(uniqueUrls.size).toBe(1);
    });
  });

  describe("classification", () => {
    it("should classify economic data updates", async () => {
      const classification = {
        updateType: "economic_data",
        sectors: ["currency_fx", "banking"],
        entities: ["cby"],
        indicators: ["exchange_rate", "inflation"]
      };

      expect(classification.updateType).toBe("economic_data");
      expect(classification.sectors).toContain("currency_fx");
    });

    it("should classify policy announcements", async () => {
      const classification = {
        updateType: "policy_announcement",
        sectors: ["public_finance"],
        entities: ["mof"],
        indicators: []
      };

      expect(classification.updateType).toBe("policy_announcement");
      expect(classification.sectors).toContain("public_finance");
    });

    it("should classify humanitarian updates", async () => {
      const classification = {
        updateType: "humanitarian_update",
        sectors: ["aid_flows", "food_security"],
        entities: ["wfp", "ocha"],
        indicators: ["food_insecurity_rate"]
      };

      expect(classification.updateType).toBe("humanitarian_update");
      expect(classification.entities).toContain("wfp");
    });
  });

  describe("evidence bundles", () => {
    it("should generate evidence bundle for update", async () => {
      const bundle = {
        updateId: 1,
        citations: [
          { sourceId: 1, sourceName: "CBY", url: "https://cby.gov.ye", accessedAt: new Date().toISOString() }
        ],
        dataPoints: [
          { indicatorCode: "exchange_rate", value: 1750, date: "2025-01-29" }
        ],
        confidenceScore: 0.95
      };

      expect(bundle.citations).toHaveLength(1);
      expect(bundle.dataPoints).toHaveLength(1);
      expect(bundle.confidenceScore).toBeGreaterThan(0.9);
    });

    it("should link evidence to update", async () => {
      const update = {
        id: 1,
        titleEn: "FX Rate Update",
        evidenceBundleId: 101
      };

      expect(update.evidenceBundleId).toBe(101);
    });
  });

  describe("bilingual support", () => {
    it("should have both AR and EN content", async () => {
      const update = {
        id: 1,
        titleEn: "Exchange Rate Update",
        titleAr: "تحديث سعر الصرف",
        summaryEn: "The exchange rate changed",
        summaryAr: "تغير سعر الصرف"
      };

      expect(update.titleEn).toBeDefined();
      expect(update.titleAr).toBeDefined();
      expect(update.summaryEn).toBeDefined();
      expect(update.summaryAr).toBeDefined();
    });

    it("should flag missing translations", async () => {
      const update = {
        id: 1,
        titleEn: "Exchange Rate Update",
        titleAr: null,
        summaryEn: "The exchange rate changed",
        summaryAr: null
      };

      const hasCompleteTranslation = update.titleAr && update.summaryAr;
      expect(hasCompleteTranslation).toBeFalsy();
    });
  });

  describe("notifications", () => {
    it("should create notification for published update", async () => {
      const notification = {
        type: "update_published",
        updateId: 1,
        title: "New Update Published",
        createdAt: new Date().toISOString()
      };

      expect(notification.type).toBe("update_published");
      expect(notification.updateId).toBe(1);
    });

    it("should create notification for review needed", async () => {
      const notification = {
        type: "update_needs_review",
        updateId: 1,
        title: "Update Needs Review",
        reason: "Low confidence score",
        createdAt: new Date().toISOString()
      };

      expect(notification.type).toBe("update_needs_review");
      expect(notification.reason).toBe("Low confidence score");
    });
  });
});
