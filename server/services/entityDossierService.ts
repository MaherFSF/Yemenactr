/**
 * YETO Entity Dossier Export Service
 * 
 * Generates comprehensive entity dossiers with:
 * - Entity profile and metadata
 * - Timeline of events (2010→today)
 * - Relationship graph snapshot
 * - Evidence appendix
 * - Bilingual content (EN + AR)
 */

import { getDb } from "../db";
import { storagePut } from "../storage";

// Helper function for raw SQL queries
async function rawQuery(query: string, params: any[] = []): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  const connection = (db as any).$client;
  if (connection && connection.execute) {
    const [rows] = await connection.execute(query, params);
    return rows || [];
  }
  return [];
}

// Dossier structure
interface EntityDossier {
  metadata: {
    entityId: number;
    entityName: string;
    entityNameAr: string;
    generatedAt: string;
    version: string;
    language: "en" | "ar" | "bilingual";
  };
  profile: {
    type: string;
    category: string;
    country: string;
    regimeTag: string;
    description: string;
    descriptionAr: string;
    website: string;
    contactEmail: string;
    aliases: string[];
    externalIds: { system: string; id: string; url: string }[];
  };
  timeline: {
    date: string;
    type: string;
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    amount?: number;
    currency?: string;
    evidencePackId?: number;
  }[];
  relationships: {
    direction: "outgoing" | "incoming";
    type: string;
    entityId: number;
    entityName: string;
    entityNameAr: string;
    startDate?: string;
    endDate?: string;
    evidencePackId?: number;
  }[];
  dataContributions: {
    indicatorCode: string;
    indicatorName: string;
    dataPointCount: number;
    dateRange: { start: string; end: string };
  }[];
  evidenceAppendix: {
    packId: number;
    subjectType: string;
    subjectId: string;
    confidenceGrade: string;
    citations: any[];
    createdAt: string;
  }[];
  statistics: {
    totalTimelineEvents: number;
    totalRelationships: number;
    totalDataPoints: number;
    totalEvidencePacks: number;
    firstActivity: string;
    lastActivity: string;
  };
}

/**
 * Generate comprehensive entity dossier
 */
export async function generateEntityDossier(
  entityId: number,
  language: "en" | "ar" | "bilingual" = "bilingual"
): Promise<EntityDossier> {
  // Get entity profile
  const entities = await rawQuery(
    "SELECT * FROM entities WHERE id = ?",
    [entityId]
  );
  
  if (!entities || entities.length === 0) {
    throw new Error(`Entity ${entityId} not found`);
  }
  
  const entity = entities[0];
  
  // Get aliases
  const aliases = await rawQuery(
    "SELECT * FROM entity_alias WHERE entityId = ?",
    [entityId]
  );
  
  // Get external IDs
  const externalIds = await rawQuery(
    "SELECT * FROM entity_external_id WHERE entityId = ?",
    [entityId]
  );
  
  // Get timeline events
  const timeline = await rawQuery(
    `SELECT * FROM entity_timeline 
     WHERE entityId = ? 
     ORDER BY eventDate DESC`,
    [entityId]
  );
  
  // Get relationships (both directions)
  const outgoingRels = await rawQuery(
    `SELECT el.*, e.name as targetName, e.nameAr as targetNameAr
     FROM entity_links el
     JOIN entities e ON el.targetEntityId = e.id
     WHERE el.sourceEntityId = ?`,
    [entityId]
  );
  
  const incomingRels = await rawQuery(
    `SELECT el.*, e.name as sourceName, e.nameAr as sourceNameAr
     FROM entity_links el
     JOIN entities e ON el.sourceEntityId = e.id
     WHERE el.targetEntityId = ?`,
    [entityId]
  );
  
  // Get data contributions (if entity is a data source)
  const dataContributions = await rawQuery(
    `SELECT 
       i.code as indicatorCode,
       i.nameEn as indicatorName,
       COUNT(ts.id) as dataPointCount,
       MIN(ts.observationDate) as startDate,
       MAX(ts.observationDate) as endDate
     FROM time_series ts
     JOIN indicators i ON ts.indicatorId = i.id
     JOIN sources s ON ts.sourceId = s.id
     WHERE s.publisher LIKE CONCAT('%', ?, '%')
     GROUP BY i.id, i.code, i.nameEn`,
    [entity.name]
  );
  
  // Get evidence packs related to this entity
  const evidencePacks = await rawQuery(
    `SELECT * FROM evidence_packs 
     WHERE subjectType = 'entity' AND subjectId = ?
     ORDER BY createdAt DESC
     LIMIT 50`,
    [String(entityId)]
  );
  
  // Calculate statistics
  const firstActivity = timeline.length > 0 
    ? timeline[timeline.length - 1].eventDate 
    : null;
  const lastActivity = timeline.length > 0 
    ? timeline[0].eventDate 
    : null;
  
  const totalDataPoints = dataContributions.reduce(
    (sum: number, dc: any) => sum + (dc.dataPointCount || 0), 
    0
  );
  
  // Build dossier
  const dossier: EntityDossier = {
    metadata: {
      entityId,
      entityName: entity.name,
      entityNameAr: entity.nameAr || entity.name,
      generatedAt: new Date().toISOString(),
      version: "1.0",
      language
    },
    profile: {
      type: entity.entityType,
      category: entity.category || "",
      country: entity.country || "",
      regimeTag: entity.regimeTag || "",
      description: entity.description || "",
      descriptionAr: entity.descriptionAr || "",
      website: entity.website || "",
      contactEmail: entity.contactEmail || "",
      aliases: aliases.map((a: any) => a.alias),
      externalIds: externalIds.map((e: any) => ({
        system: e.systemName,
        id: e.externalId,
        url: e.url || ""
      }))
    },
    timeline: timeline.map((t: any) => ({
      date: t.eventDate,
      type: t.eventType,
      titleEn: t.titleEn,
      titleAr: t.titleAr || "",
      descriptionEn: t.descriptionEn || "",
      descriptionAr: t.descriptionAr || "",
      amount: t.amount,
      currency: t.currency,
      evidencePackId: t.evidencePackId
    })),
    relationships: [
      ...outgoingRels.map((r: any) => ({
        direction: "outgoing" as const,
        type: r.relationshipType,
        entityId: r.targetEntityId,
        entityName: r.targetName,
        entityNameAr: r.targetNameAr || r.targetName,
        startDate: r.startDate,
        endDate: r.endDate,
        evidencePackId: r.evidencePackId
      })),
      ...incomingRels.map((r: any) => ({
        direction: "incoming" as const,
        type: r.relationshipType,
        entityId: r.sourceEntityId,
        entityName: r.sourceName,
        entityNameAr: r.sourceNameAr || r.sourceName,
        startDate: r.startDate,
        endDate: r.endDate,
        evidencePackId: r.evidencePackId
      }))
    ],
    dataContributions: dataContributions.map((dc: any) => ({
      indicatorCode: dc.indicatorCode,
      indicatorName: dc.indicatorName,
      dataPointCount: dc.dataPointCount,
      dateRange: {
        start: dc.startDate || "2010-01-01",
        end: dc.endDate || new Date().toISOString().split("T")[0]
      }
    })),
    evidenceAppendix: evidencePacks.map((ep: any) => ({
      packId: ep.id,
      subjectType: ep.subjectType,
      subjectId: ep.subjectId,
      confidenceGrade: ep.confidenceGrade,
      citations: JSON.parse(ep.citations || "[]"),
      createdAt: ep.createdAt
    })),
    statistics: {
      totalTimelineEvents: timeline.length,
      totalRelationships: outgoingRels.length + incomingRels.length,
      totalDataPoints,
      totalEvidencePacks: evidencePacks.length,
      firstActivity: firstActivity || "N/A",
      lastActivity: lastActivity || "N/A"
    }
  };
  
  return dossier;
}

/**
 * Export dossier as JSON to S3
 */
export async function exportDossierJSON(
  entityId: number,
  language: "en" | "ar" | "bilingual" = "bilingual"
): Promise<{ url: string; key: string }> {
  const dossier = await generateEntityDossier(entityId, language);
  
  const filename = `entity-dossier-${entityId}-${Date.now()}.json`;
  const key = `exports/dossiers/${filename}`;
  
  const { url } = await storagePut(
    key,
    JSON.stringify(dossier, null, 2),
    "application/json"
  );
  
  return { url, key };
}

/**
 * Generate dossier as Markdown (for PDF conversion)
 */
export async function generateDossierMarkdown(
  entityId: number,
  language: "en" | "ar" | "bilingual" = "bilingual"
): Promise<string> {
  const dossier = await generateEntityDossier(entityId, language);
  const isArabic = language === "ar";
  const isBilingual = language === "bilingual";
  
  let md = "";
  
  // Header
  if (isBilingual) {
    md += `# ${dossier.metadata.entityName}\n`;
    md += `# ${dossier.metadata.entityNameAr}\n\n`;
  } else if (isArabic) {
    md += `# ${dossier.metadata.entityNameAr}\n\n`;
  } else {
    md += `# ${dossier.metadata.entityName}\n\n`;
  }
  
  md += `**Generated:** ${new Date(dossier.metadata.generatedAt).toLocaleDateString()}\n\n`;
  md += `---\n\n`;
  
  // Profile Section
  md += `## ${isArabic ? "الملف الشخصي" : "Profile"}\n\n`;
  md += `| ${isArabic ? "الحقل" : "Field"} | ${isArabic ? "القيمة" : "Value"} |\n`;
  md += `|-------|-------|\n`;
  md += `| ${isArabic ? "النوع" : "Type"} | ${dossier.profile.type} |\n`;
  md += `| ${isArabic ? "الفئة" : "Category"} | ${dossier.profile.category} |\n`;
  md += `| ${isArabic ? "البلد" : "Country"} | ${dossier.profile.country} |\n`;
  md += `| ${isArabic ? "علامة النظام" : "Regime Tag"} | ${dossier.profile.regimeTag} |\n`;
  if (dossier.profile.website) {
    md += `| ${isArabic ? "الموقع" : "Website"} | ${dossier.profile.website} |\n`;
  }
  md += `\n`;
  
  if (dossier.profile.description || dossier.profile.descriptionAr) {
    md += `### ${isArabic ? "الوصف" : "Description"}\n\n`;
    if (isBilingual) {
      md += `${dossier.profile.description}\n\n`;
      md += `${dossier.profile.descriptionAr}\n\n`;
    } else if (isArabic) {
      md += `${dossier.profile.descriptionAr}\n\n`;
    } else {
      md += `${dossier.profile.description}\n\n`;
    }
  }
  
  // Statistics
  md += `## ${isArabic ? "الإحصائيات" : "Statistics"}\n\n`;
  md += `| ${isArabic ? "المقياس" : "Metric"} | ${isArabic ? "القيمة" : "Value"} |\n`;
  md += `|--------|-------|\n`;
  md += `| ${isArabic ? "أحداث الجدول الزمني" : "Timeline Events"} | ${dossier.statistics.totalTimelineEvents} |\n`;
  md += `| ${isArabic ? "العلاقات" : "Relationships"} | ${dossier.statistics.totalRelationships} |\n`;
  md += `| ${isArabic ? "نقاط البيانات" : "Data Points"} | ${dossier.statistics.totalDataPoints} |\n`;
  md += `| ${isArabic ? "حزم الأدلة" : "Evidence Packs"} | ${dossier.statistics.totalEvidencePacks} |\n`;
  md += `| ${isArabic ? "أول نشاط" : "First Activity"} | ${dossier.statistics.firstActivity} |\n`;
  md += `| ${isArabic ? "آخر نشاط" : "Last Activity"} | ${dossier.statistics.lastActivity} |\n`;
  md += `\n`;
  
  // Timeline
  if (dossier.timeline.length > 0) {
    md += `## ${isArabic ? "الجدول الزمني" : "Timeline"}\n\n`;
    for (const event of dossier.timeline.slice(0, 20)) {
      const title = isBilingual 
        ? `${event.titleEn} / ${event.titleAr}`
        : isArabic ? event.titleAr : event.titleEn;
      md += `### ${event.date} - ${title}\n\n`;
      if (event.descriptionEn || event.descriptionAr) {
        const desc = isBilingual
          ? `${event.descriptionEn}\n\n${event.descriptionAr}`
          : isArabic ? event.descriptionAr : event.descriptionEn;
        md += `${desc}\n\n`;
      }
      if (event.amount) {
        md += `**${isArabic ? "المبلغ" : "Amount"}:** ${event.amount.toLocaleString()} ${event.currency || "USD"}\n\n`;
      }
    }
  }
  
  // Relationships
  if (dossier.relationships.length > 0) {
    md += `## ${isArabic ? "العلاقات" : "Relationships"}\n\n`;
    md += `| ${isArabic ? "الاتجاه" : "Direction"} | ${isArabic ? "النوع" : "Type"} | ${isArabic ? "الكيان" : "Entity"} |\n`;
    md += `|-----------|------|--------|\n`;
    for (const rel of dossier.relationships) {
      const entityName = isBilingual
        ? `${rel.entityName} / ${rel.entityNameAr}`
        : isArabic ? rel.entityNameAr : rel.entityName;
      md += `| ${rel.direction} | ${rel.type} | ${entityName} |\n`;
    }
    md += `\n`;
  }
  
  // Data Contributions
  if (dossier.dataContributions.length > 0) {
    md += `## ${isArabic ? "مساهمات البيانات" : "Data Contributions"}\n\n`;
    md += `| ${isArabic ? "المؤشر" : "Indicator"} | ${isArabic ? "نقاط البيانات" : "Data Points"} | ${isArabic ? "النطاق" : "Range"} |\n`;
    md += `|-----------|-------------|-------|\n`;
    for (const dc of dossier.dataContributions) {
      md += `| ${dc.indicatorName} | ${dc.dataPointCount} | ${dc.dateRange.start} - ${dc.dateRange.end} |\n`;
    }
    md += `\n`;
  }
  
  // Evidence Appendix
  if (dossier.evidenceAppendix.length > 0) {
    md += `## ${isArabic ? "ملحق الأدلة" : "Evidence Appendix"}\n\n`;
    for (const ep of dossier.evidenceAppendix.slice(0, 10)) {
      md += `### ${isArabic ? "حزمة الأدلة" : "Evidence Pack"} #${ep.packId}\n\n`;
      md += `- **${isArabic ? "درجة الثقة" : "Confidence Grade"}:** ${ep.confidenceGrade}\n`;
      md += `- **${isArabic ? "تاريخ الإنشاء" : "Created"}:** ${ep.createdAt}\n`;
      if (ep.citations.length > 0) {
        md += `- **${isArabic ? "الاستشهادات" : "Citations"}:** ${ep.citations.length}\n`;
      }
      md += `\n`;
    }
  }
  
  // Footer
  md += `---\n\n`;
  md += `*${isArabic ? "تم إنشاؤه بواسطة مرصد الشفافية الاقتصادية اليمني (يتو)" : "Generated by Yemen Economic Transparency Observatory (YETO)"}*\n`;
  md += `*${dossier.metadata.generatedAt}*\n`;
  
  return md;
}

/**
 * Export dossier bundle (JSON + Markdown) to S3
 */
export async function exportDossierBundle(
  entityId: number,
  language: "en" | "ar" | "bilingual" = "bilingual"
): Promise<{
  jsonUrl: string;
  markdownUrl: string;
  manifestUrl: string;
}> {
  const timestamp = Date.now();
  const prefix = `exports/dossiers/entity-${entityId}-${timestamp}`;
  
  // Generate dossier
  const dossier = await generateEntityDossier(entityId, language);
  const markdown = await generateDossierMarkdown(entityId, language);
  
  // Upload JSON
  const { url: jsonUrl } = await storagePut(
    `${prefix}/dossier.json`,
    JSON.stringify(dossier, null, 2),
    "application/json"
  );
  
  // Upload Markdown
  const { url: markdownUrl } = await storagePut(
    `${prefix}/dossier.md`,
    markdown,
    "text/markdown"
  );
  
  // Create manifest
  const manifest = {
    entityId,
    entityName: dossier.metadata.entityName,
    generatedAt: dossier.metadata.generatedAt,
    language,
    files: {
      json: `${prefix}/dossier.json`,
      markdown: `${prefix}/dossier.md`
    },
    statistics: dossier.statistics
  };
  
  const { url: manifestUrl } = await storagePut(
    `${prefix}/manifest.json`,
    JSON.stringify(manifest, null, 2),
    "application/json"
  );
  
  return { jsonUrl, markdownUrl, manifestUrl };
}
