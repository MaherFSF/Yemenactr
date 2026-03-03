/**
 * Translation Service
 * Handles bilingual translation with glossary enforcement and numeric integrity checks
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { invokeLLM } from '../_core/llm';

// Types
export interface TranslationRecordInput {
  versionId: number;
  targetLang: 'en' | 'ar';
  method?: 'human' | 'machine' | 'hybrid' | 'api';
  modelVersion?: string;
}

export interface TranslationRecord {
  id: number;
  translationId: string;
  versionId: number;
  targetLang: string;
  method: string;
  modelVersion?: string;
  glossaryAdherenceScore?: number;
  numericIntegrityPass: boolean;
  glossaryIssues?: Array<{
    term: string;
    expected: string;
    found: string;
    location: string;
  }>;
  numericIssues?: Array<{
    original: string;
    translated: string;
    location: string;
  }>;
  status: string;
  s3TranslatedKey?: string;
  s3TranslatedUrl?: string;
  reviewedBy?: number;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
}

export interface GlossaryTerm {
  id: number;
  termId?: string;
  termEn: string;
  termAr: string;
  definitionEn?: string;
  definitionAr?: string;
  category?: string;
  sectors?: string[];
  variantsEn?: string[];
  variantsAr?: string[];
  doNotTranslate?: boolean;
  usageNotes?: string;
  status?: string;
}

export interface TranslationResult {
  translatedText: string;
  glossaryAdherenceScore: number;
  numericIntegrityPass: boolean;
  glossaryIssues: Array<{
    term: string;
    expected: string;
    found: string;
    location: string;
  }>;
  numericIssues: Array<{
    original: string;
    translated: string;
    location: string;
  }>;
}

/**
 * Get all glossary terms
 */
export async function getGlossaryTerms(): Promise<GlossaryTerm[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM glossary_terms ORDER BY termEn ASC
    `);

    return (result as any)[0] || [];
  } catch (error) {
    console.error('[TranslationService] Failed to get glossary terms:', error);
    return [];
  }
}

/**
 * Get glossary terms by sector
 */
export async function getGlossaryTermsBySector(sector: string): Promise<GlossaryTerm[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM glossary_terms 
      WHERE JSON_CONTAINS(sectors, ${JSON.stringify(sector)}) OR sectors IS NULL
      ORDER BY termEn ASC
    `);

    return (result as any)[0] || [];
  } catch (error) {
    console.error('[TranslationService] Failed to get glossary terms by sector:', error);
    return [];
  }
}

/**
 * Add a glossary term
 */
export async function addGlossaryTerm(
  termEn: string,
  termAr: string,
  definitionEn?: string,
  definitionAr?: string,
  category?: string,
  createdBy?: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      INSERT INTO glossary_terms (termEn, termAr, definitionEn, definitionAr, category)
      VALUES (${termEn}, ${termAr}, ${definitionEn || ''}, ${definitionAr || ''}, ${category || null})
    `);
    return true;
  } catch (error) {
    console.error('[TranslationService] Failed to add glossary term:', error);
    return false;
  }
}

/**
 * Translate text using LLM with glossary enforcement
 */
export async function translateText(
  text: string,
  sourceLang: 'en' | 'ar',
  targetLang: 'en' | 'ar',
  sector?: string
): Promise<TranslationResult> {
  // Get relevant glossary terms
  const glossaryTerms = sector 
    ? await getGlossaryTermsBySector(sector)
    : await getGlossaryTerms();

  // Build glossary reference for prompt
  const glossaryRef = glossaryTerms.map(t => 
    `${t.termEn} → ${t.termAr}`
  ).join('\n');

  const sourceLabel = sourceLang === 'en' ? 'English' : 'Arabic';
  const targetLabel = targetLang === 'en' ? 'English' : 'Arabic';

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are a professional translator specializing in economic and humanitarian content for Yemen. 
Translate the following ${sourceLabel} text to ${targetLabel}.

IMPORTANT RULES:
1. Use the following glossary terms exactly as specified:
${glossaryRef}

2. Preserve all numbers exactly as they appear in the original text.
3. Maintain the same formatting and structure.
4. For technical terms not in the glossary, use standard economic terminology.
5. Return ONLY the translated text, no explanations.`
        },
        {
          role: 'user',
          content: text
        }
      ]
    });

    const content = response.choices?.[0]?.message?.content;
    const translatedText = typeof content === 'string' ? content : '';

    // Check glossary adherence
    const glossaryIssues = checkGlossaryAdherence(text, translatedText, glossaryTerms, sourceLang);
    const glossaryAdherenceScore = calculateGlossaryScore(glossaryIssues, glossaryTerms.length);

    // Check numeric integrity
    const numericIssues = checkNumericIntegrity(text, translatedText);
    const numericIntegrityPass = numericIssues.length === 0;

    return {
      translatedText,
      glossaryAdherenceScore,
      numericIntegrityPass,
      glossaryIssues,
      numericIssues
    };
  } catch (error) {
    console.error('[TranslationService] Translation failed:', error);
    return {
      translatedText: '',
      glossaryAdherenceScore: 0,
      numericIntegrityPass: false,
      glossaryIssues: [],
      numericIssues: []
    };
  }
}

/**
 * Check glossary adherence
 */
function checkGlossaryAdherence(
  originalText: string,
  translatedText: string,
  glossaryTerms: GlossaryTerm[],
  sourceLang: 'en' | 'ar'
): Array<{ term: string; expected: string; found: string; location: string }> {
  const issues: Array<{ term: string; expected: string; found: string; location: string }> = [];
  
  for (const term of glossaryTerms) {
    const sourceTerm = sourceLang === 'en' ? term.termEn : term.termAr;
    const expectedTerm = sourceLang === 'en' ? term.termAr : term.termEn;
    
    // Check if source term appears in original
    if (originalText.toLowerCase().includes(sourceTerm.toLowerCase())) {
      // Check if expected translation appears in translated text
      if (!translatedText.includes(expectedTerm)) {
        // Try to find what was used instead
        const foundTerm = findAlternativeTranslation(translatedText, term, sourceLang);
        if (foundTerm !== expectedTerm) {
          issues.push({
            term: sourceTerm,
            expected: expectedTerm,
            found: foundTerm || 'not found',
            location: `Original text contains "${sourceTerm}"`
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Find alternative translation used
 */
function findAlternativeTranslation(
  translatedText: string,
  term: GlossaryTerm,
  sourceLang: 'en' | 'ar'
): string | null {
  // Check variants
  const variants = sourceLang === 'en' ? term.variantsAr : term.variantsEn;
  if (variants) {
    for (const variant of variants) {
      if (translatedText.includes(variant)) {
        return variant;
      }
    }
  }
  return null;
}

/**
 * Calculate glossary adherence score
 */
function calculateGlossaryScore(
  issues: Array<{ term: string; expected: string; found: string; location: string }>,
  totalTerms: number
): number {
  if (totalTerms === 0) return 100;
  const adherentTerms = totalTerms - issues.length;
  return Math.round((adherentTerms / totalTerms) * 100);
}

/**
 * Check numeric integrity between original and translated text
 */
function checkNumericIntegrity(
  originalText: string,
  translatedText: string
): Array<{ original: string; translated: string; location: string }> {
  const issues: Array<{ original: string; translated: string; location: string }> = [];
  const arabicDigitMap: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  };

  const normalizeNumber = (value: string) => {
    const normalizedDigits = value.replace(/[٠-٩۰-۹]/g, (d) => arabicDigitMap[d] ?? d);
    return normalizedDigits
      .replace(/[٬,]/g, '')
      .replace(/[٫]/g, '.')
      .replace(/[−]/g, '-')
      .replace(/\s/g, '');
  };

  // Extract all numbers (ASCII + Arabic-Indic digits)
  const numberPattern = /[-−]?[0-9٠-٩۰-۹][0-9٠-٩۰-۹٬,٫\.]*/g;
  const originalNumbers = originalText.match(numberPattern) || [];
  const translatedNumbers = translatedText.match(numberPattern) || [];

  const originalNormalized = originalNumbers.map(normalizeNumber);
  const translatedNormalized = translatedNumbers.map(normalizeNumber);

  // Check each original number appears in translation
  for (let i = 0; i < originalNormalized.length; i++) {
    const origNum = originalNormalized[i];
    if (!translatedNormalized.includes(origNum)) {
      // Find closest match in translation
      const closestMatch = translatedNormalized.find(n => 
        Math.abs(parseFloat(n) - parseFloat(origNum)) < 0.01
      );
      
      issues.push({
        original: originalNumbers[i],
        translated: closestMatch || 'not found',
        location: `Number "${originalNumbers[i]}" in original`
      });
    }
  }

  return issues;
}

/**
 * Create a translation record
 */
export async function createTranslationRecord(
  input: TranslationRecordInput,
  result: TranslationResult,
  s3TranslatedKey?: string,
  s3TranslatedUrl?: string
): Promise<TranslationRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const translationId = `trans_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

  try {
    const dbResult = await db.execute(sql`
      INSERT INTO translation_records (
        translationId, versionId, targetLang, method, modelVersion,
        glossaryAdherenceScore, numericIntegrityPass, glossaryIssues,
        numericIssues, status, s3TranslatedKey, s3TranslatedUrl
      ) VALUES (
        ${translationId}, ${input.versionId}, ${input.targetLang},
        ${input.method || 'machine'}, ${input.modelVersion || null},
        ${result.glossaryAdherenceScore}, ${result.numericIntegrityPass},
        ${JSON.stringify(result.glossaryIssues)}, ${JSON.stringify(result.numericIssues)},
        ${result.numericIntegrityPass && result.glossaryAdherenceScore >= 80 ? 'ok' : 'needs_review'},
        ${s3TranslatedKey || null}, ${s3TranslatedUrl || null}
      )
    `);

    const insertId = (dbResult as any)[0]?.insertId;
    if (insertId) {
      return getTranslationRecordById(insertId);
    }
    return null;
  } catch (error) {
    console.error('[TranslationService] Failed to create translation record:', error);
    return null;
  }
}

/**
 * Get translation record by ID
 */
export async function getTranslationRecordById(id: number): Promise<TranslationRecord | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT * FROM translation_records WHERE id = ${id}
    `);

    const rows = (result as any)[0] || [];
    if (rows.length === 0) return null;

    return mapRowToTranslationRecord(rows[0]);
  } catch (error) {
    console.error('[TranslationService] Failed to get translation record:', error);
    return null;
  }
}

/**
 * Get translation records for a version
 */
export async function getTranslationRecordsForVersion(versionId: number): Promise<TranslationRecord[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM translation_records WHERE versionId = ${versionId}
      ORDER BY createdAt DESC
    `);

    const rows = (result as any)[0] || [];
    return rows.map(mapRowToTranslationRecord);
  } catch (error) {
    console.error('[TranslationService] Failed to get translation records for version:', error);
    return [];
  }
}

/**
 * Get translations needing review
 */
export async function getTranslationsNeedingReview(limit: number = 20): Promise<TranslationRecord[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM translation_records 
      WHERE status = 'needs_review'
      ORDER BY createdAt DESC
      LIMIT ${limit}
    `);

    const rows = (result as any)[0] || [];
    return rows.map(mapRowToTranslationRecord);
  } catch (error) {
    console.error('[TranslationService] Failed to get translations needing review:', error);
    return [];
  }
}

/**
 * Update translation record status
 */
export async function updateTranslationStatus(
  id: number,
  status: 'pending' | 'ok' | 'needs_review' | 'rejected',
  reviewedBy?: number,
  reviewNotes?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE translation_records SET
        status = ${status},
        reviewedBy = ${reviewedBy || null},
        reviewedAt = NOW(),
        reviewNotes = ${reviewNotes || null}
      WHERE id = ${id}
    `);
    return true;
  } catch (error) {
    console.error('[TranslationService] Failed to update translation status:', error);
    return false;
  }
}

/**
 * Get translation statistics
 */
export async function getTranslationStatistics(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byLanguage: Record<string, number>;
  avgGlossaryScore: number;
  numericIntegrityRate: number;
}> {
  const db = await getDb();
  if (!db) return { total: 0, byStatus: {}, byLanguage: {}, avgGlossaryScore: 0, numericIntegrityRate: 0 };

  try {
    const statsResult = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        AVG(glossaryAdherenceScore) as avgGlossaryScore,
        SUM(CASE WHEN numericIntegrityPass = 1 THEN 1 ELSE 0 END) as numericIntegrityCount
      FROM translation_records
    `);

    const stats = (statsResult as any)[0]?.[0] || {};

    const statusResult = await db.execute(sql`
      SELECT status, COUNT(*) as count FROM translation_records GROUP BY status
    `);
    const byStatus: Record<string, number> = {};
    for (const row of (statusResult as any)[0] || []) {
      byStatus[row.status] = row.count;
    }

    const langResult = await db.execute(sql`
      SELECT targetLang, COUNT(*) as count FROM translation_records GROUP BY targetLang
    `);
    const byLanguage: Record<string, number> = {};
    for (const row of (langResult as any)[0] || []) {
      byLanguage[row.targetLang] = row.count;
    }

    return {
      total: stats.total || 0,
      byStatus,
      byLanguage,
      avgGlossaryScore: stats.avgGlossaryScore ? parseFloat(stats.avgGlossaryScore) : 0,
      numericIntegrityRate: stats.total > 0 
        ? (stats.numericIntegrityCount / stats.total) * 100 
        : 0
    };
  } catch (error) {
    console.error('[TranslationService] Failed to get translation statistics:', error);
    return { total: 0, byStatus: {}, byLanguage: {}, avgGlossaryScore: 0, numericIntegrityRate: 0 };
  }
}

// Helper function
function mapRowToTranslationRecord(row: any): TranslationRecord {
  return {
    id: row.id,
    translationId: row.translationId,
    versionId: row.versionId,
    targetLang: row.targetLang,
    method: row.method,
    modelVersion: row.modelVersion,
    glossaryAdherenceScore: row.glossaryAdherenceScore ? parseFloat(row.glossaryAdherenceScore) : undefined,
    numericIntegrityPass: row.numericIntegrityPass === 1,
    glossaryIssues: typeof row.glossaryIssues === 'string' 
      ? JSON.parse(row.glossaryIssues) 
      : row.glossaryIssues,
    numericIssues: typeof row.numericIssues === 'string' 
      ? JSON.parse(row.numericIssues) 
      : row.numericIssues,
    status: row.status,
    s3TranslatedKey: row.s3TranslatedKey,
    s3TranslatedUrl: row.s3TranslatedUrl,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt ? new Date(row.reviewedAt) : undefined,
    reviewNotes: row.reviewNotes,
    createdAt: new Date(row.createdAt)
  };
}
