/**
 * PDF Document Connector
 * 
 * Downloads PDF documents, stores them in the library,
 * extracts text, and indexes for search/RAG
 * 
 * Part of the "knowledge base" capability
 */

import axios from 'axios';
import crypto from 'crypto';
import { db } from '../../db';
import { 
  libraryDocuments, 
  documentVersions,
  rawObjects,
  documentSearchIndex
} from '../../../drizzle/schema';

export interface PdfConnectorConfig {
  url: string;
  metadata: {
    title: string;
    titleAr?: string;
    publisher: string;
    publishedAt?: Date;
    docType?: string;
    sectors?: string[];
    language?: 'en' | 'ar' | 'both';
  };
  license?: string;
  extractText?: boolean;
  createSearchIndex?: boolean;
}

export class PdfDocumentConnector {
  private sourceRegistryId: number;
  
  constructor(sourceRegistryId: number) {
    this.sourceRegistryId = sourceRegistryId;
  }
  
  async downloadPdf(url: string): Promise<Buffer> {
    console.log(`  📕 Downloading PDF from: ${url}`);
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 60000 // 60 second timeout for large PDFs
    });
    return Buffer.from(response.data);
  }
  
  async storeRawPdf(
    runId: number,
    url: string,
    content: Buffer
  ): Promise<number> {
    const sha256 = crypto.createHash('sha256').update(content).digest('hex');
    
    const existing = await db
      .select({ id: rawObjects.id })
      .from(rawObjects)
      .where(eq(rawObjects.sha256, sha256))
      .limit(1);
    
    if (existing.length > 0) {
      console.log(`  ℹ️  PDF already stored (SHA256: ${sha256.substring(0, 16)}...)`);
      return existing[0].id;
    }
    
    const storageUri = `raw/pdf/${this.sourceRegistryId}/${sha256}.pdf`;
    
    const result = await db.insert(rawObjects).values({
      sourceRegistryId: this.sourceRegistryId,
      ingestionRunId: runId,
      contentType: 'application/pdf',
      canonicalUrl: url,
      retrievalTs: new Date(),
      sha256,
      fileSize: content.length,
      storageUri,
      status: 'active',
      licenseSnapshot: 'Retrieved from public URL; see source registry for license details'
    });
    
    return result[0].insertId;
  }
  
  async createLibraryDocument(
    config: PdfConnectorConfig,
    rawObjectId: number
  ): Promise<number> {
    const docId = `DOC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    const result = await db.insert(libraryDocuments).values({
      docId,
      titleEn: config.metadata.title,
      titleAr: config.metadata.titleAr || null,
      publisherName: config.metadata.publisher,
      sourceId: this.sourceRegistryId,
      canonicalUrl: config.url,
      publishedAt: config.metadata.publishedAt || new Date(),
      retrievedAt: new Date(),
      licenseFlag: config.license?.includes('open') ? 'open' : 'unknown_requires_review',
      licenseDetails: config.license || 'Unknown',
      languageOriginal: config.metadata.language || 'en',
      docType: config.metadata.docType as any || 'report',
      sectors: config.metadata.sectors || [],
      status: 'published',
      importanceScore: 50
    });
    
    return result[0].insertId;
  }
  
  async createDocumentVersion(
    documentId: number,
    rawObjectId: number,
    pdfBuffer: Buffer
  ): Promise<number> {
    const contentHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
    
    const result = await db.insert(documentVersions).values({
      documentId,
      versionNumber: 1,
      contentHash,
      s3OriginalKey: null, // TODO: Upload to S3
      mimeType: 'application/pdf',
      fileSize: pdfBuffer.length,
      pageCount: null, // TODO: Extract page count
      extractionStatus: 'pending',
      extractionMethod: null,
      ocrConfidenceAvg: null,
      ocrLanguage: null
    });
    
    return result[0].insertId;
  }
  
  async extractText(pdfBuffer: Buffer): Promise<string> {
    // TODO: Implement PDF text extraction
    // Options: pdf-parse, pdfjs-dist, or external service
    console.log(`  📄 Text extraction not yet implemented (${pdfBuffer.length} bytes)`);
    return '';
  }
  
  async createSearchIndex(
    documentId: number,
    versionId: number,
    text: string,
    language: 'en' | 'ar'
  ): Promise<void> {
    if (!text || text.length === 0) {
      console.log(`  ⚠️  No text to index`);
      return;
    }
    
    // Simple keyword extraction (in production, use NLP)
    const keywords = text
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3)
      .slice(0, 100); // Top 100 words
    
    await db.insert(documentSearchIndex).values({
      documentId,
      versionId,
      language,
      titleText: null,
      bodyText: text.substring(0, 10000), // Limit text field size
      keywords: Array.from(new Set(keywords)).slice(0, 50),
      indexedAt: new Date()
    });
    
    console.log(`  🔍 Created search index with ${keywords.length} keywords`);
  }
  
  async ingest(
    runId: number,
    config: PdfConnectorConfig
  ): Promise<{
    fetched: number;
    stored: number;
    errors: string[];
  }> {
    const result = {
      fetched: 0,
      stored: 0,
      errors: []
    };
    
    try {
      // Download PDF
      const pdfBuffer = await this.downloadPdf(config.url);
      result.fetched = 1;
      
      // Store raw PDF
      const rawObjectId = await this.storeRawPdf(runId, config.url, pdfBuffer);
      
      // Create library document record
      const documentId = await this.createLibraryDocument(config, rawObjectId);
      result.stored++;
      
      // Create version record
      const versionId = await this.createDocumentVersion(
        documentId,
        rawObjectId,
        pdfBuffer
      );
      
      // Extract text if configured
      if (config.extractText) {
        const text = await this.extractText(pdfBuffer);
        
        // Create search index if configured
        if (config.createSearchIndex && text) {
          await this.createSearchIndex(
            documentId,
            versionId,
            text,
            config.metadata.language || 'en'
          );
        }
      }
      
      console.log(`  ✅ PDF document ingested successfully`);
      
    } catch (error: any) {
      result.errors.push(error.message);
      console.error(`  ❌ PDF ingestion error: ${error.message}`);
    }
    
    return result;
  }
}
