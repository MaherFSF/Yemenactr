/**
 * RAG (Retrieval-Augmented Generation) Service
 * Full semantic search and evidence retrieval for AI Assistant
 */

import { getDb } from "../db";
import { 
  researchPublications, 
  economicEvents, 
  sources, 
  datasets,
  indicators,
  timeSeries,
  documents,
  glossaryTerms,
  stakeholders,
  evidencePacks
} from "../../drizzle/schema";
import { desc, eq, like, or, and, sql, inArray } from "drizzle-orm";

export interface RetrievedContext {
  publications: Array<{
    id: number;
    title: string;
    abstract: string | null;
    year: number | null;
    organization: string | null;
    url: string | null;
    relevanceScore: number;
  }>;
  events: Array<{
    id: number;
    title: string;
    description: string | null;
    date: Date | null;
    category: string | null;
    relevanceScore: number;
  }>;
  indicators: Array<{
    id: number;
    name: string;
    description: string | null;
    latestValue: string | null;
    unit: string | null;
    source: string | null;
    relevanceScore: number;
  }>;
  documents: Array<{
    id: number;
    title: string;
    summary: string | null;
    category: string | null;
    url: string | null;
    relevanceScore: number;
  }>;
  glossary: Array<{
    id: number;
    term: string;
    definition: string | null;
    termAr: string | null;
    relevanceScore: number;
  }>;
  stakeholders: Array<{
    id: number;
    name: string;
    type: string | null;
    description: string | null;
    relevanceScore: number;
  }>;
  evidencePacks: Array<{
    id: number;
    subjectType: string | null;
    subjectId: string | null;
    confidenceGrade: string | null;
    relevanceScore: number;
  }>;
}

export interface RAGQuery {
  query: string;
  sector?: string;
  regime?: "aden_irg" | "sanaa_defacto" | "both";
  timeRange?: {
    start?: string;
    end?: string;
  };
  maxResults?: number;
}

/**
 * Extract keywords from a query for search
 */
function extractKeywords(query: string): string[] {
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but',
    'if', 'or', 'because', 'until', 'while', 'what', 'which', 'who',
    'this', 'that', 'these', 'those', 'am', 'about', 'against', 'any',
    'both', 'cannot', 'down', 'during', 'either', 'every', 'however',
    'its', 'itself', 'me', 'my', 'myself', 'neither', 'now', 'off',
    'our', 'ours', 'ourselves', 'out', 'over', 'per', 'please', 'since',
    'still', 'their', 'theirs', 'them', 'themselves', 'therefore', 'they',
    'up', 'upon', 'us', 'we', 'well', 'were', 'whatever', 'whenever',
    'wherever', 'whether', 'whoever', 'whom', 'whose', 'within', 'without',
    'yet', 'you', 'your', 'yours', 'yourself', 'yourselves'
  ]);

  // Yemen-specific terms to boost
  const yemenTerms = new Set([
    'yemen', 'aden', 'sanaa', 'sana\'a', 'houthi', 'irg', 'dfa', 'cby',
    'rial', 'yer', 'exchange', 'currency', 'inflation', 'gdp', 'trade',
    'humanitarian', 'aid', 'food', 'fuel', 'banking', 'bank', 'oil',
    'remittance', 'ipc', 'wfp', 'ocha', 'imf', 'world bank', 'undp',
    'stc', 'coalition', 'conflict', 'economy', 'economic', 'monetary',
    'fiscal', 'budget', 'revenue', 'import', 'export', 'port', 'hodeidah',
    'marib', 'taiz', 'hadramout', 'shabwa', 'lahj', 'abyan'
  ]);

  // Tokenize and filter
  const words = query.toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !stopWords.has(word));

  // Prioritize Yemen-specific terms
  const prioritized = words.sort((a, b) => {
    const aIsYemen = yemenTerms.has(a) ? 1 : 0;
    const bIsYemen = yemenTerms.has(b) ? 1 : 0;
    return bIsYemen - aIsYemen;
  });

  return prioritized.slice(0, 8);
}

/**
 * Calculate simple relevance score based on keyword matches
 */
function calculateRelevance(text: string | null, keywords: string[]): number {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  let score = 0;
  for (const keyword of keywords) {
    const regex = new RegExp(keyword, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      score += matches.length;
    }
  }
  return score;
}

/**
 * Full RAG retrieval across all data sources
 */
export async function retrieveContext(params: RAGQuery): Promise<RetrievedContext> {
  const db = await getDb();
  if (!db) {
    return {
      publications: [],
      events: [],
      indicators: [],
      documents: [],
      glossary: [],
      stakeholders: [],
      evidencePacks: []
    };
  }

  const keywords = extractKeywords(params.query);
  const maxResults = params.maxResults || 5;

  const result: RetrievedContext = {
    publications: [],
    events: [],
    indicators: [],
    documents: [],
    glossary: [],
    stakeholders: [],
    evidencePacks: []
  };

  try {
    // 1. Search Research Publications
    if (keywords.length > 0) {
      const pubConditions = keywords.slice(0, 3).map(kw => 
        or(
          like(researchPublications.title, `%${kw}%`),
          like(researchPublications.abstract, `%${kw}%`)
        )
      );

      const pubs = await db.select({
        id: researchPublications.id,
        title: researchPublications.title,
        abstract: researchPublications.abstract,
        year: researchPublications.publicationYear,
        url: researchPublications.sourceUrl,
      })
      .from(researchPublications)
      .where(or(...pubConditions))
      .orderBy(desc(researchPublications.publicationYear))
      .limit(maxResults * 2);

      result.publications = pubs.map(p => ({
        id: p.id,
        title: p.title || '',
        abstract: p.abstract,
        year: p.year,
        organization: null,
        url: p.url,
        relevanceScore: calculateRelevance((p.title || '') + ' ' + (p.abstract || ''), keywords)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
    }

    // 2. Search Economic Events
    if (keywords.length > 0) {
      const eventConditions = keywords.slice(0, 3).map(kw => 
        or(
          like(economicEvents.title, `%${kw}%`),
          like(economicEvents.description, `%${kw}%`)
        )
      );

      const events = await db.select({
        id: economicEvents.id,
        title: economicEvents.title,
        description: economicEvents.description,
        date: economicEvents.eventDate,
        category: economicEvents.category,
      })
      .from(economicEvents)
      .where(or(...eventConditions))
      .orderBy(desc(economicEvents.eventDate))
      .limit(maxResults * 2);

      result.events = events.map(e => ({
        id: e.id,
        title: e.title || '',
        description: e.description,
        date: e.date,
        category: e.category,
        relevanceScore: calculateRelevance((e.title || '') + ' ' + (e.description || ''), keywords)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
    }

    // 3. Search Indicators
    if (keywords.length > 0) {
      const indicatorConditions = keywords.slice(0, 3).map(kw => 
        or(
          like(indicators.nameEn, `%${kw}%`),
          like(indicators.descriptionEn, `%${kw}%`)
        )
      );

      const inds = await db.select({
        id: indicators.id,
        name: indicators.nameEn,
        description: indicators.descriptionEn,
        unit: indicators.unit,
      })
      .from(indicators)
      .where(or(...indicatorConditions))
      .limit(maxResults * 2);

      result.indicators = inds.map(i => ({
        id: i.id,
        name: i.name || '',
        description: i.description,
        latestValue: null,
        unit: i.unit,
        source: null,
        relevanceScore: calculateRelevance((i.name || '') + ' ' + (i.description || ''), keywords)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
    }

    // 4. Search Documents
    if (keywords.length > 0) {
      const docConditions = keywords.slice(0, 3).map(kw => 
        like(documents.title, `%${kw}%`)
      );

      const docs = await db.select({
        id: documents.id,
        title: documents.title,
        summary: documents.category,
        category: documents.category,
        url: documents.fileUrl,
      })
      .from(documents)
      .where(or(...docConditions))
      .limit(maxResults * 2);

      result.documents = docs.map(d => ({
        id: d.id,
        title: d.title || '',
        summary: d.summary,
        category: d.category,
        url: d.url,
        relevanceScore: calculateRelevance((d.title || '') + ' ' + (d.summary || ''), keywords)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
    }

    // 5. Search Glossary Terms
    if (keywords.length > 0) {
      const glossaryConditions = keywords.slice(0, 3).map(kw => 
        or(
          like(glossaryTerms.termEn, `%${kw}%`),
          like(glossaryTerms.definitionEn, `%${kw}%`)
        )
      );

      const terms = await db.select({
        id: glossaryTerms.id,
        term: glossaryTerms.termEn,
        definition: glossaryTerms.definitionEn,
        termAr: glossaryTerms.termAr,
      })
      .from(glossaryTerms)
      .where(or(...glossaryConditions))
      .limit(maxResults);

      result.glossary = terms.map(t => ({
        id: t.id,
        term: t.term || '',
        definition: t.definition,
        termAr: t.termAr,
        relevanceScore: calculateRelevance((t.term || '') + ' ' + (t.definition || ''), keywords)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
    }

    // 6. Search Stakeholders
    if (keywords.length > 0) {
      const stakeholderConditions = keywords.slice(0, 3).map(kw => 
        or(
          like(stakeholders.name, `%${kw}%`),
          like(stakeholders.notes, `%${kw}%`)
        )
      );

      const shs = await db.select({
        id: stakeholders.id,
        name: stakeholders.name,
        type: stakeholders.type,
        description: stakeholders.notes,
      })
      .from(stakeholders)
      .where(or(...stakeholderConditions))
      .limit(maxResults);

      result.stakeholders = shs.map(s => ({
        id: s.id,
        name: s.name || '',
        type: s.type,
        description: s.description,
        relevanceScore: calculateRelevance((s.name || '') + ' ' + (s.description || ''), keywords)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
    }

  } catch (error) {
    console.error("RAG retrieval error:", error);
  }

  return result;
}

/**
 * Format retrieved context into a prompt-friendly string
 */
export function formatContextForPrompt(context: RetrievedContext, language: "en" | "ar" = "en"): string {
  const sections: string[] = [];

  if (context.publications.length > 0) {
    const header = language === "ar" ? "**الأبحاث والمنشورات ذات الصلة:**" : "**Relevant Research Publications:**";
    const items = context.publications.map((p, i) => 
      `${i + 1}. "${p.title}" (${p.year || 'N/A'})\n   ${p.abstract?.substring(0, 200) || 'No abstract'}...`
    ).join("\n\n");
    sections.push(`${header}\n\n${items}`);
  }

  if (context.events.length > 0) {
    const header = language === "ar" ? "**الأحداث الاقتصادية ذات الصلة:**" : "**Relevant Economic Events:**";
    const items = context.events.map((e, i) => 
      `${i + 1}. ${e.title} (${e.date ? new Date(e.date).toLocaleDateString() : 'N/A'})\n   ${e.description?.substring(0, 150) || ''}...`
    ).join("\n\n");
    sections.push(`${header}\n\n${items}`);
  }

  if (context.indicators.length > 0) {
    const header = language === "ar" ? "**المؤشرات ذات الصلة:**" : "**Relevant Indicators:**";
    const items = context.indicators.map((ind, i) => 
      `${i + 1}. ${ind.name}: ${ind.latestValue || 'N/A'} ${ind.unit || ''}\n   ${ind.description?.substring(0, 100) || ''}`
    ).join("\n\n");
    sections.push(`${header}\n\n${items}`);
  }

  if (context.glossary.length > 0) {
    const header = language === "ar" ? "**المصطلحات:**" : "**Glossary Terms:**";
    const items = context.glossary.map((t, i) => 
      `${i + 1}. **${t.term}** ${t.termAr ? `(${t.termAr})` : ''}: ${t.definition?.substring(0, 150) || ''}...`
    ).join("\n\n");
    sections.push(`${header}\n\n${items}`);
  }

  if (context.stakeholders.length > 0) {
    const header = language === "ar" ? "**الجهات المعنية:**" : "**Relevant Stakeholders:**";
    const items = context.stakeholders.map((s, i) => 
      `${i + 1}. **${s.name}** (${s.type || 'Organization'}): ${s.description?.substring(0, 100) || ''}...`
    ).join("\n\n");
    sections.push(`${header}\n\n${items}`);
  }

  return sections.join("\n\n---\n\n");
}

/**
 * Get citation references from retrieved context
 */
export function extractCitations(context: RetrievedContext): Array<{
  id: string;
  type: string;
  title: string;
  source: string;
  date: string | null;
  url: string | null;
  confidence: "A" | "B" | "C" | "D";
}> {
  const citations: Array<{
    id: string;
    type: string;
    title: string;
    source: string;
    date: string | null;
    url: string | null;
    confidence: "A" | "B" | "C" | "D";
  }> = [];

  for (const pub of context.publications) {
    citations.push({
      id: `pub-${pub.id}`,
      type: "research",
      title: pub.title,
      source: pub.organization || "YETO Research Library",
      date: pub.year?.toString() || null,
      url: pub.url,
      confidence: "A"
    });
  }

  for (const event of context.events) {
    citations.push({
      id: `event-${event.id}`,
      type: "event",
      title: event.title,
      source: "YETO Economic Timeline",
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : null,
      url: null,
      confidence: "A"
    });
  }

  for (const doc of context.documents) {
    citations.push({
      id: `doc-${doc.id}`,
      type: "document",
      title: doc.title,
      source: doc.category || "YETO Document Library",
      date: null,
      url: doc.url,
      confidence: "B"
    });
  }

  return citations;
}

export default {
  retrieveContext,
  formatContextForPrompt,
  extractCitations,
  extractKeywords
};
