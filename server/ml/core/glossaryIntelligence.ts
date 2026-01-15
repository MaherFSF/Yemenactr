/**
 * Semantic Glossary Intelligence System
 * Provides dynamic term relationships, semantic search, and automated enrichment
 */

import { EventEmitter } from 'events';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Term {
  id: string;
  termAr: string;
  termEn: string;
  definitionAr: string;
  definitionEn: string;
  synonymsAr: string[];
  synonymsEn: string[];
  category: string;
  language: 'ar' | 'en' | 'bilingual';
  embedding?: number[];
  confidence: number;
  sourceUrl?: string;
  lastUpdated: Date;
  usageCount: number;
  trendingScore: number;
}

export interface TermRelationship {
  term1Id: string;
  term2Id: string;
  relationshipType: 'synonym' | 'antonym' | 'hypernym' | 'hyponym' | 'related' | 'similar';
  strength: number; // 0-1
  evidence: string[];
  discoveredDate: Date;
}

export interface TermSuggestion {
  term: Term;
  relevance: number;
  reason: string;
  context: string;
}

export interface DefinitionSuggestion {
  term: string;
  suggestedDefinitionAr: string;
  suggestedDefinitionEn: string;
  sources: string[];
  confidence: number;
}

export interface TranslationQuality {
  termAr: string;
  termEn: string;
  qualityScore: number; // 0-1
  issues: string[];
  suggestions: string[];
}

export interface TermUsageAnalytics {
  termId: string;
  period: 'daily' | 'weekly' | 'monthly';
  searchCount: number;
  usageCount: number;
  trendDirection: 'up' | 'down' | 'stable';
  relatedTerms: string[];
  userSegments: Record<string, number>;
}

// ============================================================================
// Glossary Intelligence Engine
// ============================================================================

export class GlossaryIntelligence extends EventEmitter {
  private terms: Map<string, Term> = new Map();
  private relationships: TermRelationship[] = [];
  private usageAnalytics: Map<string, TermUsageAnalytics> = new Map();
  private embeddings: Map<string, number[]> = new Map();

  // Semantic similarity threshold
  private similarityThreshold: number = 0.7;

  constructor() {
    super();
  }

  /**
   * Add or update a term
   */
  public addTerm(term: Term): void {
    this.terms.set(term.id, term);

    // Generate embedding if not present
    if (!term.embedding) {
      term.embedding = this.generateEmbedding(term.termEn, term.termAr);
      this.embeddings.set(term.id, term.embedding);
    }

    this.emit('term:added', term);
  }

  /**
   * Generate semantic embedding for a term
   * In production, use Sentence-BERT or similar
   */
  private generateEmbedding(en: string, ar: string): number[] {
    // Placeholder: In production, use actual embedding model
    // For now, create a simple hash-based embedding
    const combined = `${en}:${ar}`;
    const embedding: number[] = [];

    for (let i = 0; i < 384; i++) {
      let hash = 0;
      for (let j = 0; j < combined.length; j++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(j);
        hash = hash & hash; // Convert to 32-bit integer
      }
      embedding.push((Math.sin(hash + i) + 1) / 2); // Normalize to 0-1
    }

    return embedding;
  }

  /**
   * Find semantically similar terms
   */
  public findSimilarTerms(termId: string, topK: number = 5): Term[] {
    const term = this.terms.get(termId);
    if (!term || !term.embedding) return [];

    const similarities: Array<[string, number]> = [];

    const entries = Array.from(this.terms.entries() as IterableIterator<[string, Term]>);
    for (const [id, otherTerm] of entries) {
      if (id === termId || !otherTerm.embedding) continue;

      const similarity = this.cosineSimilarity(term.embedding, otherTerm.embedding);
      if (similarity >= this.similarityThreshold) {
        similarities.push([id, similarity]);
      }
    }

    similarities.sort((a, b) => b[1] - a[1]);

    return similarities.slice(0, topK).map(([id]) => this.terms.get(id)!);
  }

  /**
   * Compute cosine similarity between embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
  }

  /**
   * Discover relationships between terms
   */
  public discoverRelationships(termId: string): Record<string, Term[]> {
    const term = this.terms.get(termId);
    if (!term) return {};

    const relationships: Record<string, Term[]> = {
      synonyms: [],
      antonyms: [],
      hypernyms: [],
      hyponyms: [],
      related: [],
    };

    // Find similar terms (synonyms)
    relationships.synonyms = this.findSimilarTerms(termId, 5);

    // Find related terms through relationships table
    const relatedIds = this.relationships
      .filter((r) => r.term1Id === termId || r.term2Id === termId)
      .map((r) => (r.term1Id === termId ? r.term2Id : r.term1Id));

    for (const id of relatedIds as string[]) {
      const rel = this.relationships.find(
        (r) => (r.term1Id === termId && r.term2Id === id) || (r.term1Id === id && r.term2Id === termId)
      );

      if (rel) {
        const relTerm = this.terms.get(id);
        if (relTerm) {
          if (rel.relationshipType === 'synonym') relationships.synonyms.push(relTerm);
          else if (rel.relationshipType === 'antonym') relationships.antonyms.push(relTerm);
          else if (rel.relationshipType === 'hypernym') relationships.hypernyms.push(relTerm);
          else if (rel.relationshipType === 'hyponym') relationships.hyponyms.push(relTerm);
          else relationships.related.push(relTerm);
        }
      }
    }

    return relationships;
  }

  /**
   * Suggest terms based on context and user role
   */
  public suggestTerms(context: string, userRole: string, topK: number = 5): TermSuggestion[] {
    const contextEmbedding = this.generateEmbedding(context, context);
    const suggestions: TermSuggestion[] = [];

    const entries = Array.from(this.terms.entries() as IterableIterator<[string, Term]>);
    for (const [id, term] of entries) {
      if (!term.embedding) continue;

      const similarity = this.cosineSimilarity(contextEmbedding, term.embedding);
      if (similarity >= this.similarityThreshold) {
        // Boost relevance based on user role and term category
        let relevance = similarity;
        if (this.isRelevantForRole(term.category, userRole)) {
          relevance *= 1.2;
        }

        suggestions.push({
          term,
          relevance: Math.min(relevance, 1.0),
          reason: `Semantically similar to context`,
          context,
        });
      }
    }

    suggestions.sort((a, b) => b.relevance - a.relevance);
    return suggestions.slice(0, topK);
  }

  /**
   * Check if term is relevant for user role
   */
  private isRelevantForRole(category: string, userRole: string): boolean {
    const roleCategories: Record<string, string[]> = {
      policymaker: ['monetary', 'fiscal', 'trade', 'banking', 'sanctions'],
      donor: ['humanitarian', 'aid', 'funding', 'development', 'poverty'],
      researcher: ['all'],
      banker: ['banking', 'monetary', 'sanctions', 'compliance'],
      trader: ['trade', 'currency', 'commodities', 'ports'],
    };

    const categories = roleCategories[userRole] || [];
    return categories.includes('all') || categories.includes(category);
  }

  /**
   * Generate definition from evidence base
   */
  public generateDefinition(termId: string, evidence: string[]): string {
    const term = this.terms.get(termId);
    if (!term) return '';

    // Placeholder: In production, use LLM to generate definition
    // For now, combine evidence into a simple definition

    const definition = `${term.termEn} is defined based on the following evidence: ${evidence.join('; ')}.`;

    return definition;
  }

  /**
   * Score translation quality
   */
  public scoreTranslation(termAr: string, termEn: string): TranslationQuality {
    const score = this.computeTranslationScore(termAr, termEn);
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (score < 0.5) {
      issues.push('Low semantic similarity between Arabic and English');
      suggestions.push('Consider revising the translation');
    }

    if (termAr.length > 50) {
      issues.push('Arabic term is very long');
      suggestions.push('Consider using a shorter synonym');
    }

    if (termEn.length > 40) {
      issues.push('English term is very long');
      suggestions.push('Consider using a shorter synonym');
    }

    return {
      termAr,
      termEn,
      qualityScore: score,
      issues,
      suggestions,
    };
  }

  /**
   * Compute translation quality score
   */
  private computeTranslationScore(ar: string, en: string): number {
    // Placeholder: In production, use cross-lingual embeddings
    // For now, use simple heuristics

    let score = 0.7; // Base score

    // Check length similarity
    const lengthRatio = Math.min(ar.length, en.length) / Math.max(ar.length, en.length);
    score += (lengthRatio - 0.5) * 0.2;

    // Check for common patterns
    if (ar.includes('ية') && en.includes('ity')) score += 0.1; // Common suffix pattern
    if (ar.includes('ال') && en.includes('the')) score += 0.05; // Article pattern

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Track term usage
   */
  public trackUsage(termId: string, userRole: string): void {
    const term = this.terms.get(termId);
    if (!term) return;

    term.usageCount += 1;

    // Update analytics
    let analytics = this.usageAnalytics.get(termId);
    if (!analytics) {
      analytics = {
        termId,
        period: 'daily',
        searchCount: 0,
        usageCount: 0,
        trendDirection: 'stable',
        relatedTerms: [],
        userSegments: {},
      };
      this.usageAnalytics.set(termId, analytics);
    }

    analytics.usageCount += 1;
    analytics.userSegments[userRole] = (analytics.userSegments[userRole] || 0) + 1;

    // Update trending score
    term.trendingScore = this.computeTrendingScore(analytics);

    this.emit('usage:tracked', { termId, userRole });
  }

  /**
   * Compute trending score
   */
  private computeTrendingScore(analytics: TermUsageAnalytics): number {
    let score = 0;

    // Usage frequency
    score += Math.min(analytics.usageCount / 100, 0.5);

    // Trend direction
    if (analytics.trendDirection === 'up') score += 0.3;
    else if (analytics.trendDirection === 'down') score -= 0.1;

    // Diversity of user segments
    const segmentCount = Object.keys(analytics.userSegments).length;
    score += Math.min(segmentCount / 5, 0.2);

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Get trending terms
   */
  public getTrendingTerms(limit: number = 10): Term[] {
    const terms = Array.from(this.terms.values() as IterableIterator<Term>);
    terms.sort((a, b) => b.trendingScore - a.trendingScore);
    return terms.slice(0, limit);
  }

  /**
   * Get term usage analytics
   */
  public getUsageAnalytics(termId: string): TermUsageAnalytics | undefined {
    return this.usageAnalytics.get(termId);
  }

  /**
   * Enrich glossary from external sources
   */
  public async enrichFromExternalSources(sources: string[]): Promise<Term[]> {
    const enrichedTerms: Term[] = [];

    // Placeholder: In production, fetch from IMF, World Bank, UN glossaries
    // For now, return empty

    this.emit('enrichment:completed', { count: enrichedTerms.length });
    return enrichedTerms;
  }

  /**
   * Get all terms
   */
  public getAllTerms(): Term[] {
    return Array.from(this.terms.values() as IterableIterator<Term>);
  }

  /**
   * Search terms
   */
  public searchTerms(query: string, language: 'ar' | 'en' | 'both' = 'both'): Term[] {
    const results: Term[] = [];
    const queryLower = query.toLowerCase();

    const terms = Array.from(this.terms.values() as IterableIterator<Term>);
    for (const term of terms) {
      let match = false;

      if (language === 'en' || language === 'both') {
        if (
          term.termEn.toLowerCase().includes(queryLower) ||
          term.definitionEn.toLowerCase().includes(queryLower) ||
          term.synonymsEn.some((s: string) => s.toLowerCase().includes(queryLower))
        ) {
          match = true;
        }
      }

      if (language === 'ar' || language === 'both') {
        if (
          term.termAr.includes(query) ||
          term.definitionAr.includes(query) ||
          term.synonymsAr.some((s: string) => s.includes(query))
        ) {
          match = true;
        }
      }

      if (match) {
        results.push(term);
      }
    }

    return results;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let glossaryInstance: GlossaryIntelligence | null = null;

export function getGlossaryIntelligence(): GlossaryIntelligence {
  if (!glossaryInstance) {
    glossaryInstance = new GlossaryIntelligence();
  }
  return glossaryInstance;
}

export function resetGlossaryIntelligence(): void {
  if (glossaryInstance) {
    glossaryInstance.removeAllListeners();
  }
  glossaryInstance = null;
}
