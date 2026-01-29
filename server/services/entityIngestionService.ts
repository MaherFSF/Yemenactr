/**
 * YETO Entity Ingestion Service
 * 
 * Auto-creates entities from external sources (OCHA FTS, IATI, World Bank, IMF, ReliefWeb)
 * with evidence linking and regime split enforcement.
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";

// Helper function for raw SQL queries with parameters
async function rawQuery(query: string, params: any[] = []): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  // Use drizzle's sql tagged template for parameterized queries
  // For raw queries, we use the underlying connection
  const connection = (db as any).$client;
  if (connection && connection.execute) {
    const [rows] = await connection.execute(query, params);
    return rows || [];
  }
  return [];
}

// Entity types supported
export type EntityType = 
  | "multilateral"
  | "eu_institution"
  | "un_agency"
  | "national_authority"
  | "development_program"
  | "association"
  | "private_sector"
  | "think_tank"
  | "media_civil_society"
  | "central_bank"
  | "ministry"
  | "donor"
  | "implementer";

// Entity category mapping
export type EntityCategory = 
  | "international_org"
  | "government"
  | "ngo"
  | "private"
  | "academic"
  | "media";

// Regime tags for Yemen split
export type RegimeTag = "aden" | "sanaa" | "both" | "international" | "neutral";

// Entity resolution result
interface EntityResolutionResult {
  entityId: number | null;
  matchType: "exact" | "alias" | "external_id" | "fuzzy" | "new";
  confidence: number;
  needsReview: boolean;
  reviewReason?: string;
}

// Canonical entity mapping for known organizations
const CANONICAL_ENTITIES: Record<string, {
  nameEn: string;
  nameAr: string;
  type: EntityType;
  category: EntityCategory;
  regimeTag: RegimeTag;
  aliases: string[];
  externalIds: Record<string, string>;
}> = {
  // Multilateral Organizations
  "world_bank": {
    nameEn: "World Bank",
    nameAr: "البنك الدولي",
    type: "multilateral",
    category: "international_org",
    regimeTag: "international",
    aliases: ["WB", "IBRD", "IDA", "World Bank Group", "The World Bank"],
    externalIds: { "iati": "44000", "fts": "world-bank" }
  },
  "imf": {
    nameEn: "International Monetary Fund",
    nameAr: "صندوق النقد الدولي",
    type: "multilateral",
    category: "international_org",
    regimeTag: "international",
    aliases: ["IMF", "The Fund", "International Monetary Fund"],
    externalIds: { "iati": "44001", "fts": "imf" }
  },
  "isdb": {
    nameEn: "Islamic Development Bank",
    nameAr: "البنك الإسلامي للتنمية",
    type: "multilateral",
    category: "international_org",
    regimeTag: "international",
    aliases: ["IsDB", "IDB", "Islamic Development Bank Group"],
    externalIds: { "iati": "44002" }
  },
  
  // EU Institutions
  "dg_echo": {
    nameEn: "European Civil Protection and Humanitarian Aid Operations",
    nameAr: "المفوضية الأوروبية للحماية المدنية والمساعدات الإنسانية",
    type: "eu_institution",
    category: "international_org",
    regimeTag: "international",
    aliases: ["DG ECHO", "ECHO", "EU Humanitarian Aid"],
    externalIds: { "iati": "41114", "fts": "european-commission" }
  },
  
  // UN Agencies
  "ocha": {
    nameEn: "UN Office for the Coordination of Humanitarian Affairs",
    nameAr: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية",
    type: "un_agency",
    category: "international_org",
    regimeTag: "international",
    aliases: ["OCHA", "UN OCHA", "Office for the Coordination of Humanitarian Affairs"],
    externalIds: { "iati": "41127", "fts": "ocha" }
  },
  "wfp": {
    nameEn: "World Food Programme",
    nameAr: "برنامج الأغذية العالمي",
    type: "un_agency",
    category: "international_org",
    regimeTag: "international",
    aliases: ["WFP", "UN WFP", "World Food Program"],
    externalIds: { "iati": "41140", "fts": "wfp" }
  },
  "unicef": {
    nameEn: "United Nations Children's Fund",
    nameAr: "منظمة الأمم المتحدة للطفولة",
    type: "un_agency",
    category: "international_org",
    regimeTag: "international",
    aliases: ["UNICEF", "UN Children's Fund"],
    externalIds: { "iati": "41122", "fts": "unicef" }
  },
  "undp": {
    nameEn: "United Nations Development Programme",
    nameAr: "برنامج الأمم المتحدة الإنمائي",
    type: "un_agency",
    category: "international_org",
    regimeTag: "international",
    aliases: ["UNDP", "UN Development Programme"],
    externalIds: { "iati": "41114", "fts": "undp" }
  },
  "fao": {
    nameEn: "Food and Agriculture Organization",
    nameAr: "منظمة الأغذية والزراعة",
    type: "un_agency",
    category: "international_org",
    regimeTag: "international",
    aliases: ["FAO", "UN FAO", "Food and Agriculture Organization of the United Nations"],
    externalIds: { "iati": "41301", "fts": "fao" }
  },
  "who": {
    nameEn: "World Health Organization",
    nameAr: "منظمة الصحة العالمية",
    type: "un_agency",
    category: "international_org",
    regimeTag: "international",
    aliases: ["WHO", "UN WHO", "World Health Organisation"],
    externalIds: { "iati": "41143", "fts": "who" }
  },
  "iom": {
    nameEn: "International Organization for Migration",
    nameAr: "المنظمة الدولية للهجرة",
    type: "un_agency",
    category: "international_org",
    regimeTag: "international",
    aliases: ["IOM", "UN IOM", "UN Migration"],
    externalIds: { "iati": "47066", "fts": "iom" }
  },
  "unhcr": {
    nameEn: "United Nations High Commissioner for Refugees",
    nameAr: "المفوضية السامية للأمم المتحدة لشؤون اللاجئين",
    type: "un_agency",
    category: "international_org",
    regimeTag: "international",
    aliases: ["UNHCR", "UN Refugee Agency", "UN High Commissioner for Refugees"],
    externalIds: { "iati": "41121", "fts": "unhcr" }
  },
  
  // Yemen National Authorities - REGIME SPLIT
  "cby_aden": {
    nameEn: "Central Bank of Yemen - Aden",
    nameAr: "البنك المركزي اليمني - عدن",
    type: "central_bank",
    category: "government",
    regimeTag: "aden",
    aliases: ["CBY Aden", "Central Bank Aden", "CBY-Aden"],
    externalIds: {}
  },
  "cby_sanaa": {
    nameEn: "Central Bank of Yemen - Sana'a",
    nameAr: "البنك المركزي اليمني - صنعاء",
    type: "central_bank",
    category: "government",
    regimeTag: "sanaa",
    aliases: ["CBY Sana'a", "Central Bank Sanaa", "CBY-Sanaa", "CBY Sanaa"],
    externalIds: {}
  },
  "mof_aden": {
    nameEn: "Ministry of Finance - Aden",
    nameAr: "وزارة المالية - عدن",
    type: "ministry",
    category: "government",
    regimeTag: "aden",
    aliases: ["MoF Aden", "Ministry of Finance Aden"],
    externalIds: {}
  },
  "mof_sanaa": {
    nameEn: "Ministry of Finance - Sana'a",
    nameAr: "وزارة المالية - صنعاء",
    type: "ministry",
    category: "government",
    regimeTag: "sanaa",
    aliases: ["MoF Sana'a", "Ministry of Finance Sanaa"],
    externalIds: {}
  },
  "mopic": {
    nameEn: "Ministry of Planning and International Cooperation",
    nameAr: "وزارة التخطيط والتعاون الدولي",
    type: "ministry",
    category: "government",
    regimeTag: "aden",
    aliases: ["MoPIC", "Ministry of Planning"],
    externalIds: {}
  },
  "cso": {
    nameEn: "Central Statistical Organization",
    nameAr: "الجهاز المركزي للإحصاء",
    type: "national_authority",
    category: "government",
    regimeTag: "both",
    aliases: ["CSO", "Central Statistics Office"],
    externalIds: {}
  },
  
  // Development Programs
  "sfd": {
    nameEn: "Social Fund for Development",
    nameAr: "الصندوق الاجتماعي للتنمية",
    type: "development_program",
    category: "government",
    regimeTag: "both",
    aliases: ["SFD", "Yemen Social Fund"],
    externalIds: { "iati": "YE-SFD" }
  },
  "pwp": {
    nameEn: "Public Works Project",
    nameAr: "مشروع الأشغال العامة",
    type: "development_program",
    category: "government",
    regimeTag: "both",
    aliases: ["PWP", "Yemen Public Works"],
    externalIds: {}
  },
  
  // Think Tanks
  "sanaa_center": {
    nameEn: "Sana'a Center for Strategic Studies",
    nameAr: "مركز صنعاء للدراسات الاستراتيجية",
    type: "think_tank",
    category: "academic",
    regimeTag: "neutral",
    aliases: ["Sana'a Center", "SCSS", "Sanaa Center"],
    externalIds: {}
  },
  "acaps_yeti": {
    nameEn: "ACAPS Yemen Team",
    nameAr: "فريق أكابس اليمن",
    type: "think_tank",
    category: "academic",
    regimeTag: "international",
    aliases: ["ACAPS", "ACAPS YETI"],
    externalIds: {}
  },
  "rethinking_yemen": {
    nameEn: "Rethinking Yemen's Economy",
    nameAr: "إعادة التفكير في اقتصاد اليمن",
    type: "think_tank",
    category: "academic",
    regimeTag: "neutral",
    aliases: ["RYE", "Rethinking Yemen"],
    externalIds: {}
  }
};

/**
 * Normalize entity name for matching
 */
function normalizeEntityName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Check if entity is a national authority that requires regime split
 */
function requiresRegimeSplit(name: string): boolean {
  const regimeSplitKeywords = [
    "central bank", "cby", "ministry of finance", "mof",
    "ministry of planning", "mopic", "customs", "tax authority"
  ];
  const normalized = normalizeEntityName(name);
  return regimeSplitKeywords.some(keyword => normalized.includes(keyword));
}

/**
 * Resolve entity from name using deterministic rules
 */
export async function resolveEntity(
  name: string,
  externalSystem?: string,
  externalId?: string
): Promise<EntityResolutionResult> {
  const db = await getDb();
  const normalized = normalizeEntityName(name);
  
  // Step 1: Check canonical entities first (exact match)
  for (const [code, entity] of Object.entries(CANONICAL_ENTITIES)) {
    if (normalizeEntityName(entity.nameEn) === normalized ||
        normalizeEntityName(entity.nameAr) === normalized) {
      // Check if already in database
      const [existing] = await rawQuery(
        "SELECT id FROM entities WHERE name = ? OR nameAr = ? LIMIT 1",
        [entity.nameEn, entity.nameAr]
      ) as any[];
      
      if (existing && existing.length > 0) {
        return {
          entityId: existing[0].id,
          matchType: "exact",
          confidence: 1.0,
          needsReview: false
        };
      }
      
      // Create new entity
      const entityId = await createCanonicalEntity(code);
      return {
        entityId,
        matchType: "new",
        confidence: 1.0,
        needsReview: false
      };
    }
    
    // Check aliases
    for (const alias of entity.aliases) {
      if (normalizeEntityName(alias) === normalized) {
        const [existing] = await rawQuery(
          "SELECT id FROM entities WHERE name = ? LIMIT 1",
          [entity.nameEn]
        ) as any[];
        
        if (existing && existing.length > 0) {
          return {
            entityId: existing[0].id,
            matchType: "alias",
            confidence: 0.95,
            needsReview: false
          };
        }
        
        const entityId = await createCanonicalEntity(code);
        return {
          entityId,
          matchType: "new",
          confidence: 0.95,
          needsReview: false
        };
      }
    }
    
    // Check external IDs
    if (externalSystem && externalId && entity.externalIds[externalSystem] === externalId) {
      const [existing] = await rawQuery(
        "SELECT id FROM entities WHERE name = ? LIMIT 1",
        [entity.nameEn]
      ) as any[];
      
      if (existing && existing.length > 0) {
        return {
          entityId: existing[0].id,
          matchType: "external_id",
          confidence: 1.0,
          needsReview: false
        };
      }
      
      const entityId = await createCanonicalEntity(code);
      return {
        entityId,
        matchType: "new",
        confidence: 1.0,
        needsReview: false
      };
    }
  }
  
  // Step 2: Check database for existing entity
  const [dbMatch] = await rawQuery(
    "SELECT id, name FROM entities WHERE LOWER(name) = ? OR LOWER(nameAr) = ? LIMIT 1",
    [normalized, normalized]
  ) as any[];
  
  if (dbMatch && dbMatch.length > 0) {
    return {
      entityId: dbMatch[0].id,
      matchType: "exact",
      confidence: 0.9,
      needsReview: false
    };
  }
  
  // Step 3: Check aliases table
  const [aliasMatch] = await rawQuery(
    "SELECT entityId FROM entity_alias WHERE LOWER(alias) = ? LIMIT 1",
    [normalized]
  ) as any[];
  
  if (aliasMatch && aliasMatch.length > 0) {
    return {
      entityId: aliasMatch[0].entityId,
      matchType: "alias",
      confidence: 0.85,
      needsReview: false
    };
  }
  
  // Step 4: Check external IDs
  if (externalSystem && externalId) {
    const [extMatch] = await rawQuery(
      "SELECT entityId FROM entity_external_id WHERE systemName = ? AND externalId = ? LIMIT 1",
      [externalSystem, externalId]
    ) as any[];
    
    if (extMatch && extMatch.length > 0) {
      return {
        entityId: extMatch[0].entityId,
        matchType: "external_id",
        confidence: 1.0,
        needsReview: false
      };
    }
  }
  
  // Step 5: Check if this requires regime split (NEVER auto-merge national authorities)
  if (requiresRegimeSplit(name)) {
    // Create resolution case for admin review
    await rawQuery(
      `INSERT INTO entity_resolution_case 
       (caseType, proposedAction, evidenceSummary, status)
       VALUES ('ambiguous_match', ?, ?, 'pending')`,
      [
        `Create new entity for "${name}" - requires regime split determination`,
        `Entity name "${name}" matches national authority pattern. Admin must determine if this is Aden or Sana'a regime.`
      ]
    );
    
    return {
      entityId: null,
      matchType: "fuzzy",
      confidence: 0.3,
      needsReview: true,
      reviewReason: "National authority requires regime split determination"
    };
  }
  
  // Step 6: No match found - create new entity
  return {
    entityId: null,
    matchType: "new",
    confidence: 0.5,
    needsReview: true,
    reviewReason: "New entity not in canonical list"
  };
}

/**
 * Create a canonical entity from the predefined list
 */
async function createCanonicalEntity(code: string): Promise<number> {
  const db = await getDb();
  const entity = CANONICAL_ENTITIES[code];
  
  if (!entity) {
    throw new Error(`Unknown canonical entity code: ${code}`);
  }
  
  // Insert entity
  const [result] = await rawQuery(
    `INSERT INTO entities (name, nameAr, entityType, regimeTag, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 'active', NOW(), NOW())
     ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
    [entity.nameEn, entity.nameAr, entity.type, entity.regimeTag]
  ) as any[];
  
  const entityId = result.insertId;
  
  // Insert aliases
  for (const alias of entity.aliases) {
    await rawQuery(
      `INSERT IGNORE INTO entity_alias (entityId, alias, language, source, confidence)
       VALUES (?, ?, 'en', 'canonical', 1.0)`,
      [entityId, alias]
    );
  }
  
  // Insert external IDs
  for (const [system, extId] of Object.entries(entity.externalIds)) {
    await rawQuery(
      `INSERT IGNORE INTO entity_external_id (entityId, systemName, externalId)
       VALUES (?, ?, ?)`,
      [entityId, system, extId]
    );
  }
  
  return entityId;
}

/**
 * Create entity with evidence pack linking
 */
export async function createEntityWithEvidence(
  nameEn: string,
  nameAr: string | null,
  type: EntityType,
  category: EntityCategory,
  regimeTag: RegimeTag,
  evidencePackId: number | null,
  sourceSystem: string,
  sourceId: string
): Promise<number> {
  const db = await getDb();
  
  // Insert entity
  const [result] = await rawQuery(
    `INSERT INTO entities (name, nameAr, entityType, regimeTag, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 'active', NOW(), NOW())`,
    [nameEn, nameAr, type, regimeTag]
  ) as any[];
  
  const entityId = result.insertId;
  
  // Link external ID
  await rawQuery(
    `INSERT INTO entity_external_id (entityId, systemName, externalId)
     VALUES (?, ?, ?)`,
    [entityId, sourceSystem, sourceId]
  );
  
  // Create assertion about entity creation
  if (evidencePackId) {
    await rawQuery(
      `INSERT INTO entity_assertion 
       (entityId, assertionType, assertionTextEn, evidencePackId, confidenceGrade, status)
       VALUES (?, 'fact', ?, ?, 'B', 'active')`,
      [entityId, `Entity created from ${sourceSystem} data`, evidencePackId]
    );
  }
  
  return entityId;
}

/**
 * Add entity relationship with evidence
 */
export async function addEntityRelationship(
  sourceEntityId: number,
  targetEntityId: number,
  relationshipType: string,
  evidencePackId: number | null,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await rawQuery(
    `INSERT INTO entity_links 
     (sourceEntityId, targetEntityId, relationshipType, evidencePackId, startDate, endDate, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [sourceEntityId, targetEntityId, relationshipType, evidencePackId, startDate || null, endDate || null]
  ) as any;
  
  return result.insertId || 0;
}

/**
 * Add timeline event for entity
 */
export async function addEntityTimelineEvent(
  entityId: number,
  eventType: string,
  eventDate: Date,
  titleEn: string,
  titleAr: string | null,
  descriptionEn: string | null,
  descriptionAr: string | null,
  evidencePackId: number | null,
  amount?: number,
  currency?: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await rawQuery(
    `INSERT INTO entity_timeline 
     (entityId, eventType, eventDate, titleEn, titleAr, descriptionEn, descriptionAr, 
      evidencePackId, amount, currency, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [entityId, eventType, eventDate, titleEn, titleAr, descriptionEn, descriptionAr,
     evidencePackId, amount || null, currency || null]
  ) as any;
  
  return result.insertId || 0;
}

/**
 * Seed all canonical entities
 */
export async function seedCanonicalEntities(): Promise<void> {
  console.log("Seeding canonical entities...");
  
  for (const code of Object.keys(CANONICAL_ENTITIES)) {
    try {
      await createCanonicalEntity(code);
      console.log(`  ✅ Created: ${CANONICAL_ENTITIES[code].nameEn}`);
    } catch (error) {
      console.log(`  ⚠️ Skipped (exists): ${CANONICAL_ENTITIES[code].nameEn}`);
    }
  }
  
  console.log("Canonical entities seeding complete.");
}

/**
 * Get entity by ID with full details
 */
export async function getEntityById(entityId: number): Promise<any> {
  const db = await getDb();
  if (!db) return null;
  
  const entity = await rawQuery(
    "SELECT * FROM entities WHERE id = ?",
    [entityId]
  );
  
  if (!entity || entity.length === 0) {
    return null;
  }
  
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
  
  // Get relationships
  const relationships = await rawQuery(
    `SELECT el.*, e.name as targetName, e.nameAr as targetNameAr
     FROM entity_links el
     JOIN entities e ON el.targetEntityId = e.id
     WHERE el.sourceEntityId = ?`,
    [entityId]
  );
  
  // Get timeline
  const timeline = await rawQuery(
    "SELECT * FROM entity_timeline WHERE entityId = ? ORDER BY eventDate DESC",
    [entityId]
  );
  
  // Get assertions
  const assertions = await rawQuery(
    "SELECT * FROM entity_assertion WHERE entityId = ? AND status = 'active'",
    [entityId]
  );
  
  return {
    ...entity[0],
    aliases: aliases || [],
    externalIds: externalIds || [],
    relationships: relationships || [],
    timeline: timeline || [],
    assertions: assertions || []
  };
}

/**
 * Search entities
 */
export async function searchEntities(
  query: string,
  type?: EntityType,
  regimeTag?: RegimeTag,
  limit: number = 50
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Build query with sql tagged template
  const searchPattern = `%${query}%`;
  
  const results = await rawQuery(
    `SELECT e.*, 
           (SELECT COUNT(*) FROM entity_timeline WHERE entityId = e.id) as timelineCount,
           (SELECT COUNT(*) FROM entity_links WHERE sourceEntityId = e.id OR targetEntityId = e.id) as relationshipCount
     FROM entities e
     WHERE (e.name LIKE ? OR e.nameAr LIKE ?)
     ORDER BY e.name LIMIT ?`,
    [searchPattern, searchPattern, limit]
  );
  return results || [];
}
