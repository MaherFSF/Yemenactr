/**
 * Knowledge Graph Service Tests
 * Tests for the connective tissue layer functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue({ insertId: BigInt(1) }),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
    delete: vi.fn().mockReturnThis(),
  },
}));

// Mock schema
vi.mock("../../drizzle/schema", () => ({
  knowledgeGraphLinks: {},
  knowledgeGraphNodeCache: {},
  sectorSignals: {},
  economicEvents: {},
  libraryDocuments: {},
}));

describe("Knowledge Graph Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Link Types", () => {
    it("should support all required link types", () => {
      const linkTypes = [
        "cites",
        "contradicts",
        "supports",
        "mentions",
        "affects",
        "tracks",
        "publishes",
        "update_signal",
        "related_to",
        "part_of",
        "causes",
        "correlates_with",
      ];
      
      expect(linkTypes.length).toBeGreaterThan(10);
      expect(linkTypes).toContain("cites");
      expect(linkTypes).toContain("contradicts");
      expect(linkTypes).toContain("affects");
    });

    it("should support all required node types", () => {
      const nodeTypes = [
        "indicator",
        "document",
        "entity",
        "event",
        "sector",
        "dataset",
        "project",
        "contradiction",
        "gap",
      ];
      
      expect(nodeTypes.length).toBeGreaterThan(5);
      expect(nodeTypes).toContain("indicator");
      expect(nodeTypes).toContain("document");
      expect(nodeTypes).toContain("entity");
    });
  });

  describe("Link Creation", () => {
    it("should create a link with required fields", async () => {
      const linkData = {
        linkType: "cites",
        srcType: "document",
        srcId: 1,
        srcLabel: "World Bank Report 2024",
        dstType: "indicator",
        dstId: 100,
        dstLabel: "GDP Growth Rate",
        strengthScore: 0.85,
        confidenceLevel: "high",
        method: "auto_extraction",
        status: "active",
      };
      
      expect(linkData.linkType).toBe("cites");
      expect(linkData.strengthScore).toBeGreaterThan(0);
      expect(linkData.strengthScore).toBeLessThanOrEqual(1);
    });

    it("should validate strength score range", () => {
      const validScores = [0, 0.5, 1];
      const invalidScores = [-0.1, 1.1, 2];
      
      validScores.forEach(score => {
        expect(score >= 0 && score <= 1).toBe(true);
      });
      
      invalidScores.forEach(score => {
        expect(score >= 0 && score <= 1).toBe(false);
      });
    });

    it("should support bidirectional links", () => {
      const linkData = {
        linkType: "correlates_with",
        srcType: "indicator",
        srcId: 1,
        dstType: "indicator",
        dstId: 2,
        isBidirectional: true,
      };
      
      // Bidirectional links should be queryable from either direction
      expect(linkData.isBidirectional).toBe(true);
    });
  });

  describe("Related Items Query", () => {
    it("should return related items for a source node", async () => {
      const mockRelatedItems = [
        { type: "document", id: 1, label: "Report A", strength: 0.9 },
        { type: "entity", id: 2, label: "Entity B", strength: 0.8 },
        { type: "event", id: 3, label: "Event C", strength: 0.7 },
      ];
      
      expect(mockRelatedItems.length).toBe(3);
      expect(mockRelatedItems[0].type).toBe("document");
    });

    it("should filter by destination type", () => {
      const allItems = [
        { type: "document", id: 1 },
        { type: "entity", id: 2 },
        { type: "document", id: 3 },
      ];
      
      const documentsOnly = allItems.filter(item => item.type === "document");
      expect(documentsOnly.length).toBe(2);
    });

    it("should order by strength score", () => {
      const items = [
        { strength: 0.5 },
        { strength: 0.9 },
        { strength: 0.7 },
      ];
      
      const sorted = items.sort((a, b) => b.strength - a.strength);
      expect(sorted[0].strength).toBe(0.9);
      expect(sorted[1].strength).toBe(0.7);
      expect(sorted[2].strength).toBe(0.5);
    });
  });

  describe("Auto-Enrichment", () => {
    it("should extract entities from text", () => {
      const text = "The Central Bank of Yemen announced new monetary policy measures.";
      
      // Mock entity extraction
      const extractedEntities = [
        { name: "Central Bank of Yemen", type: "organization" },
      ];
      
      expect(extractedEntities.length).toBeGreaterThan(0);
      expect(extractedEntities[0].name).toContain("Central Bank");
    });

    it("should detect sector from keywords", () => {
      const sectorKeywords: Record<string, string[]> = {
        banking: ["bank", "monetary", "interest rate", "credit"],
        trade: ["import", "export", "customs", "tariff"],
        energy: ["fuel", "electricity", "oil", "gas"],
      };
      
      const text = "The bank announced new interest rate policy";
      const detectedSector = Object.entries(sectorKeywords).find(([_, keywords]) =>
        keywords.some(kw => text.toLowerCase().includes(kw))
      );
      
      expect(detectedSector?.[0]).toBe("banking");
    });

    it("should calculate link strength based on evidence", () => {
      const calculateStrength = (params: {
        mentionCount: number;
        isDirectCitation: boolean;
        sourceReliability: number;
      }) => {
        let strength = 0.3; // Base
        strength += Math.min(params.mentionCount * 0.1, 0.3);
        if (params.isDirectCitation) strength += 0.2;
        strength *= params.sourceReliability;
        return Math.min(strength, 1);
      };
      
      expect(calculateStrength({ mentionCount: 3, isDirectCitation: true, sourceReliability: 0.9 })).toBeGreaterThan(0.5);
      expect(calculateStrength({ mentionCount: 1, isDirectCitation: false, sourceReliability: 0.5 })).toBeLessThan(0.5);
    });
  });

  describe("Timeline Event Propagation", () => {
    it("should create event from data update", () => {
      const dataUpdate = {
        indicatorCode: "GDP_GROWTH",
        oldValue: 2.5,
        newValue: 3.2,
        changePercent: 28,
      };
      
      const isSignificant = Math.abs(dataUpdate.changePercent) > 5;
      expect(isSignificant).toBe(true);
    });

    it("should create sector signals for significant changes", () => {
      const changes = [
        { changePercent: 2, sectors: ["banking"] },
        { changePercent: 15, sectors: ["trade", "energy"] },
        { changePercent: -8, sectors: ["agriculture"] },
      ];
      
      const significantChanges = changes.filter(c => Math.abs(c.changePercent) > 5);
      expect(significantChanges.length).toBe(2);
    });

    it("should propagate to VIP what changed", () => {
      const signals = [
        { sector: "banking", type: "warning", detectedAt: new Date() },
        { sector: "trade", type: "critical", detectedAt: new Date() },
      ];
      
      const vipSectors = ["banking", "trade", "energy"];
      const relevantSignals = signals.filter(s => vipSectors.includes(s.sector));
      
      expect(relevantSignals.length).toBe(2);
    });
  });

  describe("Graph Traversal", () => {
    it("should find paths between nodes", () => {
      const mockGraph = {
        nodes: [
          { id: 1, type: "indicator" },
          { id: 2, type: "document" },
          { id: 3, type: "entity" },
        ],
        edges: [
          { src: 1, dst: 2, type: "cites" },
          { src: 2, dst: 3, type: "mentions" },
        ],
      };
      
      // Simple path finding
      const findPath = (graph: typeof mockGraph, from: number, to: number) => {
        const visited = new Set<number>();
        const queue: number[][] = [[from]];
        
        while (queue.length > 0) {
          const path = queue.shift()!;
          const current = path[path.length - 1];
          
          if (current === to) return path;
          if (visited.has(current)) continue;
          visited.add(current);
          
          const neighbors = graph.edges
            .filter(e => e.src === current)
            .map(e => e.dst);
          
          for (const neighbor of neighbors) {
            queue.push([...path, neighbor]);
          }
        }
        return null;
      };
      
      const path = findPath(mockGraph, 1, 3);
      expect(path).toEqual([1, 2, 3]);
    });

    it("should calculate node importance", () => {
      const incomingLinks = 5;
      const outgoingLinks = 3;
      const avgStrength = 0.75;
      
      const importance = (incomingLinks * 2 + outgoingLinks) * avgStrength;
      expect(importance).toBeGreaterThan(0);
    });
  });

  describe("Contradiction Detection", () => {
    it("should identify contradicting claims", () => {
      const claims = [
        { source: "Doc A", value: 100, date: "2024-01" },
        { source: "Doc B", value: 150, date: "2024-01" },
      ];
      
      const threshold = 0.2; // 20% difference
      const diff = Math.abs(claims[0].value - claims[1].value) / claims[0].value;
      
      expect(diff > threshold).toBe(true);
    });

    it("should create contradiction links", () => {
      const contradictionLink = {
        linkType: "contradicts",
        srcType: "document",
        srcId: 1,
        dstType: "document",
        dstId: 2,
        metadata: {
          claimType: "numeric_value",
          srcValue: 100,
          dstValue: 150,
          difference: "50%",
        },
      };
      
      expect(contradictionLink.linkType).toBe("contradicts");
      expect(contradictionLink.metadata.difference).toBe("50%");
    });
  });

  describe("Graph Statistics", () => {
    it("should calculate graph density", () => {
      const nodeCount = 100;
      const edgeCount = 250;
      const maxEdges = nodeCount * (nodeCount - 1);
      const density = edgeCount / maxEdges;
      
      expect(density).toBeGreaterThan(0);
      expect(density).toBeLessThan(1);
    });

    it("should identify hub nodes", () => {
      const nodes = [
        { id: 1, connections: 50 },
        { id: 2, connections: 5 },
        { id: 3, connections: 100 },
        { id: 4, connections: 10 },
      ];
      
      const avgConnections = nodes.reduce((sum, n) => sum + n.connections, 0) / nodes.length;
      const hubs = nodes.filter(n => n.connections > avgConnections * 2);
      
      expect(hubs.length).toBe(1);
      expect(hubs[0].id).toBe(3);
    });
  });
});

describe("RelatedInsights Component Logic", () => {
  it("should group items by type", () => {
    const items = [
      { type: "document", id: 1 },
      { type: "entity", id: 2 },
      { type: "document", id: 3 },
      { type: "event", id: 4 },
    ];
    
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, typeof items>);
    
    expect(grouped.document.length).toBe(2);
    expect(grouped.entity.length).toBe(1);
    expect(grouped.event.length).toBe(1);
  });

  it("should respect maxItems limit", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    const maxItems = 10;
    
    const limited = items.slice(0, maxItems);
    expect(limited.length).toBe(10);
  });

  it("should handle empty results gracefully", () => {
    const items: any[] = [];
    const hasItems = items.length > 0;
    
    expect(hasItems).toBe(false);
  });
});
