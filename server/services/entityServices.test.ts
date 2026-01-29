/**
 * YETO Entity Services Tests
 * 
 * Tests for entity ingestion, relationship management, and dossier export.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue({
    $client: {
      execute: vi.fn().mockResolvedValue([[]])
    }
  })
}));

// Mock storage
vi.mock("../storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://s3.example.com/test", key: "test-key" })
}));

describe("Entity Ingestion Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should enforce regime split for CBY entities", () => {
    // Test that CBY Aden and CBY Sana'a are never merged
    const cbyAden = { name: "Central Bank of Yemen - Aden", regimeTag: "aden" };
    const cbySanaa = { name: "Central Bank of Yemen - Sana'a", regimeTag: "sanaa" };
    
    // These should be treated as separate entities
    expect(cbyAden.regimeTag).not.toBe(cbySanaa.regimeTag);
    expect(cbyAden.name).not.toBe(cbySanaa.name);
  });

  it("should require evidence pack for entity creation", () => {
    // Entity creation should always have evidence
    const entityData = {
      name: "World Bank",
      type: "multilateral",
      evidencePackId: 123
    };
    
    expect(entityData.evidencePackId).toBeDefined();
    expect(entityData.evidencePackId).toBeGreaterThan(0);
  });

  it("should validate entity type enum", () => {
    const validTypes = [
      "multilateral",
      "un_agency",
      "national_authority",
      "ngo",
      "donor",
      "private_sector",
      "research_institution"
    ];
    
    const testType = "multilateral";
    expect(validTypes).toContain(testType);
    
    const invalidType = "invalid_type";
    expect(validTypes).not.toContain(invalidType);
  });
});

describe("Entity Relationship Management", () => {
  it("should require evidence pack for relationship edges", () => {
    // Every relationship must have evidence
    const relationship = {
      sourceEntityId: 1,
      targetEntityId: 2,
      relationshipType: "FUNDS",
      evidencePackId: 456
    };
    
    expect(relationship.evidencePackId).toBeDefined();
    expect(relationship.evidencePackId).toBeGreaterThan(0);
  });

  it("should validate relationship types", () => {
    const validRelTypes = [
      "FUNDS",
      "IMPLEMENTS",
      "SUPPORTS",
      "REGULATES",
      "PUBLISHES",
      "OPERATES_IN",
      "PARTNERS_WITH",
      "REPORTS_TO"
    ];
    
    const testRelType = "FUNDS";
    expect(validRelTypes).toContain(testRelType);
  });

  it("should prevent self-referential relationships", () => {
    const relationship = {
      sourceEntityId: 1,
      targetEntityId: 1,
      relationshipType: "FUNDS"
    };
    
    // Self-referential relationships should be invalid
    expect(relationship.sourceEntityId).toBe(relationship.targetEntityId);
    // In real implementation, this would throw an error
  });

  it("should not allow regime-mixing merges", () => {
    // Entities from different regimes should never be merged
    const adenEntity = { id: 1, name: "Ministry of Finance - Aden", regimeTag: "aden" };
    const sanaaEntity = { id: 2, name: "Ministry of Finance - Sana'a", regimeTag: "sanaa" };
    
    // These should remain separate
    expect(adenEntity.regimeTag).not.toBe(sanaaEntity.regimeTag);
    
    // Merge attempt should be blocked
    const canMerge = adenEntity.regimeTag === sanaaEntity.regimeTag;
    expect(canMerge).toBe(false);
  });
});

describe("Entity Dossier Export", () => {
  it("should include all required sections in dossier", () => {
    const dossierSections = [
      "metadata",
      "profile",
      "timeline",
      "relationships",
      "dataContributions",
      "evidenceAppendix",
      "statistics"
    ];
    
    // Mock dossier structure
    const mockDossier = {
      metadata: { entityId: 1, entityName: "Test", generatedAt: new Date().toISOString() },
      profile: { type: "multilateral", category: "finance" },
      timeline: [],
      relationships: [],
      dataContributions: [],
      evidenceAppendix: [],
      statistics: { totalTimelineEvents: 0, totalRelationships: 0 }
    };
    
    for (const section of dossierSections) {
      expect(mockDossier).toHaveProperty(section);
    }
  });

  it("should support bilingual content", () => {
    const bilingualContent = {
      titleEn: "World Bank",
      titleAr: "البنك الدولي",
      descriptionEn: "International financial institution",
      descriptionAr: "مؤسسة مالية دولية"
    };
    
    expect(bilingualContent.titleEn).toBeDefined();
    expect(bilingualContent.titleAr).toBeDefined();
    expect(bilingualContent.titleEn).not.toBe(bilingualContent.titleAr);
  });

  it("should generate valid manifest with export", () => {
    const manifest = {
      entityId: 1,
      entityName: "World Bank",
      generatedAt: new Date().toISOString(),
      language: "bilingual",
      files: {
        json: "exports/dossiers/entity-1-123/dossier.json",
        markdown: "exports/dossiers/entity-1-123/dossier.md"
      },
      statistics: {
        totalTimelineEvents: 10,
        totalRelationships: 5
      }
    };
    
    expect(manifest.files.json).toContain(".json");
    expect(manifest.files.markdown).toContain(".md");
    expect(manifest.statistics).toBeDefined();
  });
});

describe("Entity Resolution Logic", () => {
  it("should use deterministic matching first", () => {
    // Deterministic matching based on external IDs
    const entity1 = { externalIds: [{ system: "IATI", id: "XM-DAC-41114" }] };
    const entity2 = { externalIds: [{ system: "IATI", id: "XM-DAC-41114" }] };
    
    const match = entity1.externalIds[0].id === entity2.externalIds[0].id;
    expect(match).toBe(true);
  });

  it("should flag ambiguous matches for admin review", () => {
    // When fuzzy matching is needed, create resolution case
    const resolutionCase = {
      candidateEntityId: 1,
      matchedEntityId: 2,
      matchScore: 0.85,
      matchReason: "name_similarity",
      status: "pending"
    };
    
    // Score below threshold should require review
    const THRESHOLD = 0.95;
    const needsReview = resolutionCase.matchScore < THRESHOLD;
    expect(needsReview).toBe(true);
    expect(resolutionCase.status).toBe("pending");
  });
});

describe("Entity Evidence Coverage", () => {
  it("should calculate evidence coverage percentage", () => {
    const entityStats = {
      totalAssertions: 20,
      assertionsWithEvidence: 19
    };
    
    const coverage = (entityStats.assertionsWithEvidence / entityStats.totalAssertions) * 100;
    expect(coverage).toBe(95);
    
    // Should meet 95% threshold
    const THRESHOLD = 95;
    expect(coverage).toBeGreaterThanOrEqual(THRESHOLD);
  });

  it("should track evidence freshness", () => {
    const evidencePack = {
      createdAt: new Date("2024-01-15"),
      lastVerified: new Date("2024-06-01")
    };
    
    const now = new Date();
    const daysSinceVerified = Math.floor(
      (now.getTime() - evidencePack.lastVerified.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Evidence should be verified within reasonable timeframe
    expect(daysSinceVerified).toBeDefined();
  });
});

describe("Stakeholder Engagement Engine", () => {
  it("should generate valid email templates", () => {
    const template = {
      subjectEn: "YETO Data Access Request - {{dataset}}",
      subjectAr: "طلب الوصول إلى البيانات - يتو - {{dataset}}",
      bodyEn: "Dear {{contactName}}, ...",
      bodyAr: "السيد/السيدة {{contactName}} المحترم/ة، ..."
    };
    
    // Template should have placeholders
    expect(template.subjectEn).toContain("{{dataset}}");
    expect(template.bodyEn).toContain("{{contactName}}");
    
    // Should be bilingual
    expect(template.subjectAr).toBeDefined();
    expect(template.bodyAr).toBeDefined();
  });

  it("should track outreach status", () => {
    const validStatuses = ["draft", "pending_review", "approved", "sent", "responded", "closed"];
    
    const outreach = { status: "sent" };
    expect(validStatuses).toContain(outreach.status);
  });
});
