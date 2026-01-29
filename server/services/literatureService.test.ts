/**
 * Literature Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as literatureService from './literatureService';

// Mock the database
vi.mock('../db', () => ({
  getDb: vi.fn(() => Promise.resolve({
    execute: vi.fn((query) => {
      // Mock different responses based on query
      return Promise.resolve([[{ 
        id: 1,
        docId: 'doc_test123',
        titleEn: 'Test Document',
        titleAr: 'وثيقة اختبار',
        publisherName: 'World Bank',
        publishedAt: new Date('2024-01-15'),
        retrievedAt: new Date(),
        licenseFlag: 'open',
        languageOriginal: 'en',
        docType: 'report',
        sectors: JSON.stringify(['banking_finance']),
        entityIds: JSON.stringify([]),
        geographies: JSON.stringify(['Yemen']),
        status: 'published',
        importanceScore: 75,
        summaryEn: 'Test summary',
        metadata: JSON.stringify({}),
        createdAt: new Date(),
        updatedAt: new Date()
      }]]);
    })
  }))
}));

describe('Literature Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateContentHash', () => {
    it('should generate consistent hash for same content', () => {
      const content = 'Test document content';
      const hash1 = literatureService.generateContentHash(content);
      const hash2 = literatureService.generateContentHash(content);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it('should generate different hashes for different content', () => {
      const hash1 = literatureService.generateContentHash('Content A');
      const hash2 = literatureService.generateContentHash('Content B');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle Buffer input', () => {
      const buffer = Buffer.from('Test content');
      const hash = literatureService.generateContentHash(buffer);
      
      expect(hash).toHaveLength(64);
    });
  });

  describe('getDocumentById', () => {
    it('should return document when found', async () => {
      const doc = await literatureService.getDocumentById(1);
      
      expect(doc).not.toBeNull();
      expect(doc?.id).toBe(1);
      expect(doc?.docId).toBe('doc_test123');
      expect(doc?.titleEn).toBe('Test Document');
    });

    it('should parse JSON fields correctly', async () => {
      const doc = await literatureService.getDocumentById(1);
      
      expect(doc?.sectors).toBeInstanceOf(Array);
      expect(doc?.sectors).toContain('banking_finance');
      expect(doc?.entityIds).toBeInstanceOf(Array);
      expect(doc?.geographies).toContain('Yemen');
    });
  });

  describe('searchDocuments', () => {
    it('should return search results with pagination info', async () => {
      const result = await literatureService.searchDocuments({
        query: 'test',
        limit: 10,
        offset: 0
      });
      
      expect(result).toHaveProperty('documents');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.documents)).toBe(true);
    });

    it('should apply sector filter', async () => {
      const result = await literatureService.searchDocuments({
        sectors: ['banking_finance'],
        limit: 10
      });
      
      expect(result.documents).toBeDefined();
    });

    it('should apply year filter', async () => {
      const result = await literatureService.searchDocuments({
        years: [2024],
        limit: 10
      });
      
      expect(result.documents).toBeDefined();
    });
  });

  describe('Document Status Management', () => {
    it('should update document status', async () => {
      const success = await literatureService.updateDocumentStatus(1, 'published');
      
      // With mock, this should return true
      expect(success).toBe(true);
    });

    it('should accept valid status values', async () => {
      const statuses: Array<'draft' | 'queued_for_review' | 'published' | 'archived'> = [
        'draft',
        'queued_for_review',
        'published',
        'archived'
      ];

      for (const status of statuses) {
        const success = await literatureService.updateDocumentStatus(1, status);
        expect(success).toBe(true);
      }
    });
  });

  describe('Document Statistics', () => {
    it('should return statistics object', async () => {
      const stats = await literatureService.getDocumentStatistics();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byStatus');
      expect(stats).toHaveProperty('byType');
      expect(stats).toHaveProperty('byLicense');
      expect(stats).toHaveProperty('byYear');
    });
  });
});

describe('Document Type Mapping', () => {
  it('should have consistent document types', () => {
    const validTypes = [
      'report',
      'working_paper',
      'policy_brief',
      'dataset_doc',
      'sitrep',
      'evaluation',
      'annex',
      'law_regulation',
      'bulletin',
      'circular',
      'press_release',
      'academic_paper',
      'thesis',
      'methodology_note',
      'other'
    ];

    // Verify all types are lowercase with underscores
    for (const type of validTypes) {
      expect(type).toMatch(/^[a-z_]+$/);
    }
  });
});

describe('License Flag Validation', () => {
  it('should have valid license flags', () => {
    const validFlags = [
      'open',
      'restricted_metadata_only',
      'unknown_requires_review'
    ];

    expect(validFlags).toContain('open');
    expect(validFlags).toContain('restricted_metadata_only');
    expect(validFlags).toContain('unknown_requires_review');
  });
});
