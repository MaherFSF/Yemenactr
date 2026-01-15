/**
 * Placeholder and Fake Data Detector Tests
 * 
 * These tests verify that no placeholder data, lorem ipsum, or fake statistics
 * exist in the production database or UI components.
 * 
 * Per requirement: "Implement a CI check that detects placeholder numbers, 
 * lorem ipsum, 'sample data', hard-coded demo values."
 */

import { describe, it, expect } from 'vitest';
import { getDb } from './db';
import { 
  timeSeries, 
  researchPublications, 
  economicEvents,
  glossaryTerms,
  commercialBanks,
  sources
} from '../drizzle/schema';
import { sql } from 'drizzle-orm';

// Patterns that indicate placeholder/fake data
const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /sample data/i,
  /test data/i,
  /placeholder/i,
  /xxx+/i,
  /\[insert.*\]/i,
  /TBD/i,
  /TODO/i,
  /FIXME/i,
  /example\.com/i,
  /fake/i,
  /dummy/i,
];

// Suspicious numeric patterns (all zeros, all nines, sequential)
const SUSPICIOUS_NUMBERS = [
  123456789,
  987654321,
  111111111,
  999999999,
];

describe('Placeholder Detector', () => {
  describe('Time Series Data', () => {
    it('should have valid numeric values (not suspicious patterns)', async () => {
      const db = await getDb();
      const records = await db.select({
        value: timeSeries.value,
      }).from(timeSeries).limit(1000);

      // Check that we don't have too many suspicious values
      const suspiciousCount = records.filter(r => 
        SUSPICIOUS_NUMBERS.includes(Number(r.value))
      ).length;

      // Allow some zeros (they can be legitimate), but not too many
      expect(suspiciousCount).toBeLessThan(records.length * 0.1);
    });

    it('should have valid indicator codes', async () => {
      const db = await getDb();
      const records = await db.select({
        indicatorCode: timeSeries.indicatorCode,
      }).from(timeSeries).limit(100);

      for (const record of records) {
        // Indicator code should not be empty
        expect(record.indicatorCode).toBeTruthy();
        expect(record.indicatorCode.length).toBeGreaterThan(2);
        
        // Check for placeholders
        for (const pattern of PLACEHOLDER_PATTERNS) {
          expect(record.indicatorCode).not.toMatch(pattern);
        }
      }
    });
  });

  describe('Research Publications', () => {
    it('should not contain placeholder titles', async () => {
      const db = await getDb();
      const records = await db.select({
        title: researchPublications.title,
        titleAr: researchPublications.titleAr,
      }).from(researchPublications).limit(500);

      for (const record of records) {
        for (const pattern of PLACEHOLDER_PATTERNS) {
          expect(record.title).not.toMatch(pattern);
          if (record.titleAr) {
            expect(record.titleAr).not.toMatch(pattern);
          }
        }
      }
    });

    it('should have valid publication years', async () => {
      const db = await getDb();
      const records = await db.select({
        publicationYear: researchPublications.publicationYear,
      }).from(researchPublications).limit(500);

      for (const record of records) {
        if (record.publicationYear) {
          // Year should be between 1990 and 2030 (allowing historical context)
          expect(record.publicationYear).toBeGreaterThanOrEqual(1990);
          expect(record.publicationYear).toBeLessThanOrEqual(2030);
        }
      }
    });
  });

  describe('Economic Events', () => {
    it('should not contain placeholder descriptions', async () => {
      const db = await getDb();
      const records = await db.select({
        title: economicEvents.title,
        description: economicEvents.description,
      }).from(economicEvents).limit(200);

      for (const record of records) {
        for (const pattern of PLACEHOLDER_PATTERNS) {
          expect(record.title).not.toMatch(pattern);
          if (record.description) {
            expect(record.description).not.toMatch(pattern);
          }
        }
      }
    });

    it('should have valid event dates within expected range', async () => {
      const db = await getDb();
      const records = await db.select({
        eventDate: economicEvents.eventDate,
      }).from(economicEvents).limit(200);

      for (const record of records) {
        const date = new Date(record.eventDate);
        // Events should be between 1990 and 2030 (allowing historical context)
        expect(date.getFullYear()).toBeGreaterThanOrEqual(1990);
        expect(date.getFullYear()).toBeLessThanOrEqual(2030);
      }
    });
  });

  describe('Glossary Terms', () => {
    it('should have both Arabic and English terms', async () => {
      const db = await getDb();
      const records = await db.select({
        termEn: glossaryTerms.termEn,
        termAr: glossaryTerms.termAr,
      }).from(glossaryTerms).limit(100);

      for (const record of records) {
        // English term required
        expect(record.termEn).toBeTruthy();
        
        // Arabic should also be present for bilingual support
        expect(record.termAr).toBeTruthy();
        
        // Check for placeholders
        for (const pattern of PLACEHOLDER_PATTERNS) {
          expect(record.termEn).not.toMatch(pattern);
        }
      }
    });
  });

  describe('Commercial Banks', () => {
    it('should have real bank names and data', async () => {
      const db = await getDb();
      const records = await db.select({
        name: commercialBanks.name,
        nameAr: commercialBanks.nameAr,
        totalAssets: commercialBanks.totalAssets,
      }).from(commercialBanks).limit(50);

      for (const record of records) {
        // Names should not be placeholders
        for (const pattern of PLACEHOLDER_PATTERNS) {
          expect(record.name).not.toMatch(pattern);
        }
        
        // Total assets should be realistic (not zero or absurdly high)
        if (record.totalAssets) {
          const assets = Number(record.totalAssets);
          expect(assets).toBeGreaterThan(0);
          expect(assets).toBeLessThan(100000000000); // Less than $100B
        }
      }
    });
  });

  describe('Data Completeness', () => {
    it('should have sufficient time series records', async () => {
      const db = await getDb();
      const result = await db.select({
        count: sql<number>`count(*)`,
      }).from(timeSeries);
      
      // Should have at least 500 time series records
      expect(Number(result[0].count)).toBeGreaterThan(500);
    });

    it('should have sufficient research publications', async () => {
      const db = await getDb();
      const result = await db.select({
        count: sql<number>`count(*)`,
      }).from(researchPublications);
      
      // Should have at least 100 publications
      expect(Number(result[0].count)).toBeGreaterThan(100);
    });

    it('should have sufficient economic events', async () => {
      const db = await getDb();
      const result = await db.select({
        count: sql<number>`count(*)`,
      }).from(economicEvents);
      
      // Should have at least 50 events
      expect(Number(result[0].count)).toBeGreaterThan(50);
    });
  });
});

describe('Evidence Pack Presence Check', () => {
  it('should have source references for time series data', async () => {
    const db = await getDb();
    const records = await db.select({
      sourceId: timeSeries.sourceId,
    }).from(timeSeries).limit(500);

    const withSource = records.filter(r => r.sourceId && r.sourceId > 0);
    const percentage = (withSource.length / records.length) * 100;
    
    // At least 95% should have source references
    expect(percentage).toBeGreaterThan(95);
  });

  it('should have confidence ratings for time series', async () => {
    const db = await getDb();
    const records = await db.select({
      confidenceRating: timeSeries.confidenceRating,
    }).from(timeSeries).limit(500);

    const withConfidence = records.filter(r => r.confidenceRating);
    const percentage = (withConfidence.length / records.length) * 100;
    
    // At least 95% should have confidence ratings
    expect(percentage).toBeGreaterThan(95);
  });

  it('should have regime tags for geographic scope', async () => {
    const db = await getDb();
    const records = await db.select({
      regimeTag: timeSeries.regimeTag,
    }).from(timeSeries).limit(500);

    const withRegime = records.filter(r => r.regimeTag);
    const percentage = (withRegime.length / records.length) * 100;
    
    // 100% should have regime/geographic tag (it's required)
    expect(percentage).toBe(100);
  });

  it('should have valid sources in sources table', async () => {
    const db = await getDb();
    const records = await db.select({
      publisher: sources.publisher,
      url: sources.url,
    }).from(sources).limit(100);

    for (const record of records) {
      // Publisher should not be empty
      expect(record.publisher).toBeTruthy();
      expect(record.publisher.length).toBeGreaterThan(2);
      
      // Check for placeholders
      for (const pattern of PLACEHOLDER_PATTERNS) {
        expect(record.publisher).not.toMatch(pattern);
      }
    }
  });
});
