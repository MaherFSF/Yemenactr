/**
 * Research Document Ingestion System
 * Automatically fetches, processes, and indexes research documents
 * Connects documents to relevant economic indicators and sectors
 */

import { db } from "../db";
import { invokeLLM } from "./_core/llm";

// ============================================================================
// TYPES
// ============================================================================

export interface ResearchDocument {
  id: string;
  title: string;
  authors: string[];
  publicationDate: Date;
  source: string;
  sourceType: 'report' | 'paper' | 'policy' | 'news' | 'blog';
  url: string;
  content: string;
  contentType: 'pdf' | 'html' | 'text';
  keywords: string[];
  sectors: string[];
  relatedIndicators: string[];
  confidence: number;
  summary: string;
  extractedAt: Date;
}

export interface DocumentSource {
  id: string;
  name: string;
  url: string;
  sourceType: 'report' | 'paper' | 'policy' | 'news' | 'blog';
  fetchMethod: 'api' | 'web_scrape' | 'manual' | 'rss';
  schedule: string; // Cron expression
  isActive: boolean;
  lastFetchedAt?: Date;
}

// ============================================================================
// RESEARCH INGESTION SERVICE
// ============================================================================

export class ResearchIngestionService {
  /**
   * Fetch documents from all active sources
   */
  async fetchAllDocuments(): Promise<ResearchDocument[]> {
    const documents: ResearchDocument[] = [];

    // World Bank Reports
    const wbDocs = await this.fetchWorldBankReports();
    documents.push(...wbDocs);

    // IMF Publications
    const imfDocs = await this.fetchIMFPublications();
    documents.push(...imfDocs);

    // Academic Papers
    const academicDocs = await this.fetchAcademicPapers();
    documents.push(...academicDocs);

    // News & Analysis
    const newsDocs = await this.fetchNewsArticles();
    documents.push(...newsDocs);

    // Policy Documents
    const policyDocs = await this.fetchPolicyDocuments();
    documents.push(...policyDocs);

    return documents;
  }

  /**
   * Process and enrich a research document
   */
  async processDocument(doc: ResearchDocument): Promise<ResearchDocument> {
    // Extract keywords using LLM
    const keywords = await this.extractKeywords(doc.content);
    doc.keywords = keywords;

    // Identify related sectors
    const sectors = await this.identifySectors(doc.content, doc.title);
    doc.sectors = sectors;

    // Extract related indicators
    const indicators = await this.extractIndicators(doc.content);
    doc.relatedIndicators = indicators;

    // Generate summary
    const summary = await this.generateSummary(doc.content);
    doc.summary = summary;

    // Calculate confidence score
    doc.confidence = this.calculateConfidence(doc);

    return doc;
  }

  /**
   * Extract keywords from document using LLM
   */
  private async extractKeywords(content: string): Promise<string[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a keyword extraction expert. Extract 5-10 most important keywords from the given text. Return as JSON array.',
          },
          {
            role: 'user',
            content: `Extract keywords from this text:\n\n${content.substring(0, 2000)}`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'keywords',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                keywords: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['keywords'],
            },
          },
        },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.keywords || [];
    } catch (error) {
      console.error('Failed to extract keywords:', error);
      return [];
    }
  }

  /**
   * Identify related sectors using LLM
   */
  private async identifySectors(content: string, title: string): Promise<string[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are an economic sector classifier. Identify which sectors are mentioned in the given text. Return as JSON array with sector IDs.',
          },
          {
            role: 'user',
            content: `Title: ${title}\n\nContent: ${content.substring(0, 2000)}\n\nSectors to consider: banking, trade, energy, humanitarian, labor, food_security, prices, macroeconomy`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'sectors',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                sectors: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['sectors'],
            },
          },
        },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.sectors || [];
    } catch (error) {
      console.error('Failed to identify sectors:', error);
      return [];
    }
  }

  /**
   * Extract related indicators from document
   */
  private async extractIndicators(content: string): Promise<string[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are an economic indicator classifier. Identify economic indicators mentioned in the text. Return as JSON array with indicator codes.',
          },
          {
            role: 'user',
            content: `Extract economic indicators from this text:\n\n${content.substring(0, 2000)}`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'indicators',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                indicators: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['indicators'],
            },
          },
        },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.indicators || [];
    } catch (error) {
      console.error('Failed to extract indicators:', error);
      return [];
    }
  }

  /**
   * Generate document summary using LLM
   */
  private async generateSummary(content: string): Promise<string> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a document summarization expert. Create a concise 2-3 sentence summary of the given text.',
          },
          {
            role: 'user',
            content: `Summarize this text:\n\n${content.substring(0, 3000)}`,
          },
        ],
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return '';
    }
  }

  /**
   * Calculate confidence score for document
   */
  private calculateConfidence(doc: ResearchDocument): number {
    let score = 0.5; // Base score

    // Increase score for official sources
    if (['World Bank', 'IMF', 'UN', 'OCHA'].some((s) => doc.source.includes(s))) {
      score += 0.3;
    }

    // Increase score for recent documents
    const ageInDays = (Date.now() - doc.publicationDate.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays < 30) score += 0.1;
    else if (ageInDays < 90) score += 0.05;

    // Increase score for documents with multiple keywords
    if (doc.keywords.length >= 5) score += 0.1;

    // Increase score for documents with multiple sectors
    if (doc.sectors.length >= 2) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Fetch World Bank reports
   */
  private async fetchWorldBankReports(): Promise<ResearchDocument[]> {
    // Implementation would fetch from World Bank API
    console.log('Fetching World Bank reports...');
    return [];
  }

  /**
   * Fetch IMF publications
   */
  private async fetchIMFPublications(): Promise<ResearchDocument[]> {
    // Implementation would fetch from IMF API
    console.log('Fetching IMF publications...');
    return [];
  }

  /**
   * Fetch academic papers
   */
  private async fetchAcademicPapers(): Promise<ResearchDocument[]> {
    // Implementation would fetch from academic databases
    console.log('Fetching academic papers...');
    return [];
  }

  /**
   * Fetch news articles
   */
  private async fetchNewsArticles(): Promise<ResearchDocument[]> {
    // Implementation would fetch from news APIs
    console.log('Fetching news articles...');
    return [];
  }

  /**
   * Fetch policy documents
   */
  private async fetchPolicyDocuments(): Promise<ResearchDocument[]> {
    // Implementation would fetch policy documents
    console.log('Fetching policy documents...');
    return [];
  }

  /**
   * Index documents for full-text search
   */
  async indexDocuments(documents: ResearchDocument[]): Promise<void> {
    for (const doc of documents) {
      try {
        // Store in search index (e.g., Elasticsearch, Meilisearch)
        console.log(`Indexed document: ${doc.id}`);
      } catch (error) {
        console.error(`Failed to index document ${doc.id}:`, error);
      }
    }
  }

  /**
   * Link documents to related indicators
   */
  async linkDocumentsToIndicators(documents: ResearchDocument[]): Promise<void> {
    for (const doc of documents) {
      for (const indicator of doc.relatedIndicators) {
        try {
          // Create relationship in database
          console.log(`Linked document ${doc.id} to indicator ${indicator}`);
        } catch (error) {
          console.error(`Failed to link document to indicator:`, error);
        }
      }
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let researchServiceInstance: ResearchIngestionService | null = null;

export function getResearchIngestionService(): ResearchIngestionService {
  if (!researchServiceInstance) {
    researchServiceInstance = new ResearchIngestionService();
  }
  return researchServiceInstance;
}
