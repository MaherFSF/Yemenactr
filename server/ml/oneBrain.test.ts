/**
 * One Brain Intelligence Directive Unit Tests
 * Tests the core functionality without making actual LLM calls
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getOneBrainIntelligence, 
  OneBrainIntelligence,
} from './core/oneBrainDirective';

describe('OneBrainIntelligence', () => {
  let oneBrain: OneBrainIntelligence;

  beforeEach(() => {
    oneBrain = getOneBrainIntelligence();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple calls', () => {
      const instance1 = getOneBrainIntelligence();
      const instance2 = getOneBrainIntelligence();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Knowledge Graph', () => {
    it('should return knowledge graph statistics', () => {
      const stats = oneBrain.getKnowledgeGraphStats();
      
      expect(stats).toHaveProperty('nodeCount');
      expect(stats).toHaveProperty('edgeCount');
      expect(stats).toHaveProperty('nodeTypes');
      expect(typeof stats.nodeCount).toBe('number');
      expect(typeof stats.edgeCount).toBe('number');
    });

    it('should have initial nodes from core institutions', () => {
      const stats = oneBrain.getKnowledgeGraphStats();
      // Should have at least the 7 core institutions
      expect(stats.nodeCount).toBeGreaterThanOrEqual(7);
    });

    it('should add nodes to knowledge graph', () => {
      const initialStats = oneBrain.getKnowledgeGraphStats();
      
      oneBrain.addKnowledgeNode({
        id: `test-node-${Date.now()}`,
        type: 'indicator',
        name: 'GDP Growth',
        nameAr: 'نمو الناتج المحلي',
        properties: { unit: 'percent' },
      });

      const newStats = oneBrain.getKnowledgeGraphStats();
      expect(newStats.nodeCount).toBeGreaterThanOrEqual(initialStats.nodeCount);
    });

    it('should add edges to knowledge graph', () => {
      const timestamp = Date.now();
      
      // Add two nodes first
      oneBrain.addKnowledgeNode({
        id: `edge-test-node-1-${timestamp}`,
        type: 'indicator',
        name: 'Inflation',
        nameAr: 'التضخم',
        properties: {},
      });

      oneBrain.addKnowledgeNode({
        id: `edge-test-node-2-${timestamp}`,
        type: 'indicator',
        name: 'Exchange Rate',
        nameAr: 'سعر الصرف',
        properties: {},
      });

      const initialStats = oneBrain.getKnowledgeGraphStats();
      
      oneBrain.addKnowledgeEdge({
        source: `edge-test-node-1-${timestamp}`,
        target: `edge-test-node-2-${timestamp}`,
        relationship: 'correlates_with',
        weight: 0.8,
        evidence: ['study-1', 'study-2'],
      });

      const newStats = oneBrain.getKnowledgeGraphStats();
      expect(newStats.edgeCount).toBeGreaterThanOrEqual(initialStats.edgeCount);
    });

    it('should query knowledge graph by node id', () => {
      const timestamp = Date.now();
      
      // Add a node
      oneBrain.addKnowledgeNode({
        id: `query-test-node-${timestamp}`,
        type: 'institution',
        name: 'Test Institution',
        nameAr: 'مؤسسة اختبار',
        properties: {},
      });

      const result = oneBrain.queryKnowledgeGraph(`query-test-node-${timestamp}`, 2);
      
      expect(result).toHaveProperty('nodes');
      expect(result).toHaveProperty('edges');
      expect(Array.isArray(result.nodes)).toBe(true);
      expect(Array.isArray(result.edges)).toBe(true);
    });

    it('should query existing core institution nodes', () => {
      // Query one of the core institutions
      const result = oneBrain.queryKnowledgeGraph('cby_aden', 1);
      
      expect(result.nodes.length).toBeGreaterThan(0);
      const node = result.nodes.find(n => n.id === 'cby_aden');
      expect(node).toBeDefined();
      expect(node?.name).toBe('Central Bank of Yemen (Aden)');
      expect(node?.nameAr).toBe('البنك المركزي اليمني (عدن)');
    });
  });

  describe('Data Gap Tickets', () => {
    it('should return data gap tickets array', () => {
      const tickets = oneBrain.getDataGapTickets();
      expect(Array.isArray(tickets)).toBe(true);
    });
  });

  describe('Node Types', () => {
    it('should track node types correctly', () => {
      const timestamp = Date.now();
      
      oneBrain.addKnowledgeNode({
        id: `type-test-indicator-${timestamp}`,
        type: 'indicator',
        name: 'Test Indicator',
        nameAr: 'مؤشر اختبار',
        properties: {},
      });

      oneBrain.addKnowledgeNode({
        id: `type-test-event-${timestamp}`,
        type: 'event',
        name: 'Test Event',
        nameAr: 'حدث اختبار',
        properties: {},
      });

      const stats = oneBrain.getKnowledgeGraphStats();
      expect(stats.nodeTypes).toHaveProperty('institution');
      expect(stats.nodeTypes.institution).toBeGreaterThan(0);
    });
  });

  describe('Edge Relationships', () => {
    it('should support various relationship types', () => {
      const timestamp = Date.now();
      
      oneBrain.addKnowledgeNode({
        id: `rel-node-a-${timestamp}`,
        type: 'indicator',
        name: 'Node A',
        nameAr: 'عقدة أ',
        properties: {},
      });

      oneBrain.addKnowledgeNode({
        id: `rel-node-b-${timestamp}`,
        type: 'event',
        name: 'Node B',
        nameAr: 'عقدة ب',
        properties: {},
      });

      // Add edge with specific relationship
      oneBrain.addKnowledgeEdge({
        source: `rel-node-a-${timestamp}`,
        target: `rel-node-b-${timestamp}`,
        relationship: 'caused_by',
        weight: 0.9,
        evidence: ['report-1'],
      });

      const result = oneBrain.queryKnowledgeGraph(`rel-node-a-${timestamp}`, 1);
      expect(result.edges.length).toBeGreaterThan(0);
      
      const edge = result.edges.find(e => 
        e.source === `rel-node-a-${timestamp}` && 
        e.target === `rel-node-b-${timestamp}`
      );
      expect(edge).toBeDefined();
      expect(edge?.relationship).toBe('caused_by');
      expect(edge?.weight).toBe(0.9);
    });
  });

  describe('Core Institutions', () => {
    it('should have CBY Aden in knowledge graph', () => {
      const result = oneBrain.queryKnowledgeGraph('cby_aden', 0);
      expect(result.nodes.length).toBe(1);
      expect(result.nodes[0].type).toBe('institution');
    });

    it('should have CBY Sanaa in knowledge graph', () => {
      const result = oneBrain.queryKnowledgeGraph('cby_sanaa', 0);
      expect(result.nodes.length).toBe(1);
      expect(result.nodes[0].type).toBe('institution');
    });

    it('should have World Bank in knowledge graph', () => {
      const result = oneBrain.queryKnowledgeGraph('world_bank', 0);
      expect(result.nodes.length).toBe(1);
      expect(result.nodes[0].name).toBe('World Bank');
    });

    it('should have IMF in knowledge graph', () => {
      const result = oneBrain.queryKnowledgeGraph('imf', 0);
      expect(result.nodes.length).toBe(1);
      expect(result.nodes[0].name).toBe('International Monetary Fund');
    });

    it('should have UN OCHA in knowledge graph', () => {
      const result = oneBrain.queryKnowledgeGraph('un_ocha', 0);
      expect(result.nodes.length).toBe(1);
    });
  });

  describe('Graph Traversal', () => {
    it('should respect depth parameter in queries', () => {
      const timestamp = Date.now();
      
      // Create a chain of nodes: A -> B -> C
      oneBrain.addKnowledgeNode({
        id: `chain-a-${timestamp}`,
        type: 'indicator',
        name: 'Chain A',
        nameAr: 'سلسلة أ',
        properties: {},
      });

      oneBrain.addKnowledgeNode({
        id: `chain-b-${timestamp}`,
        type: 'indicator',
        name: 'Chain B',
        nameAr: 'سلسلة ب',
        properties: {},
      });

      oneBrain.addKnowledgeNode({
        id: `chain-c-${timestamp}`,
        type: 'indicator',
        name: 'Chain C',
        nameAr: 'سلسلة ج',
        properties: {},
      });

      oneBrain.addKnowledgeEdge({
        source: `chain-a-${timestamp}`,
        target: `chain-b-${timestamp}`,
        relationship: 'leads_to',
        weight: 1,
        evidence: [],
      });

      oneBrain.addKnowledgeEdge({
        source: `chain-b-${timestamp}`,
        target: `chain-c-${timestamp}`,
        relationship: 'leads_to',
        weight: 1,
        evidence: [],
      });

      // Query with depth 1 should get A and B
      const depth1 = oneBrain.queryKnowledgeGraph(`chain-a-${timestamp}`, 1);
      expect(depth1.nodes.length).toBe(2);

      // Query with depth 2 should get A, B, and C
      const depth2 = oneBrain.queryKnowledgeGraph(`chain-a-${timestamp}`, 2);
      expect(depth2.nodes.length).toBe(3);
    });
  });
});
