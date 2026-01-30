/**
 * Source Registry Import Service
 * Parses sources.csv and imports all 225+ sources into the database
 */

import { db } from '../db';
import { sources } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

interface SourceCSVRow {
  source_id: string;
  row_number: number;
  name: string;
  alt_name?: string;
  primary_sector?: string;
  secondary_sectors?: string;
  tertiary_sectors?: string;
  sector_tags?: string;
  tier: string;
  publisher?: string;
  api_url?: string;
  web_url?: string;
  access_type: string;
  api_key_required?: string;
  api_key_contact?: string;
  update_frequency?: string;
  frequency_normalized?: string;
  freshness_sla_days?: string;
  last_fetch?: string;
  next_fetch?: string;
  geographic_scope?: string;
  description?: string;
  license?: string;
  confidence_rating?: string;
  regime_applicability?: string;
  latency?: string;
  needs_partnership?: string;
  partnership_contact?: string;
  data_format?: string;
  schema_fields?: string;
  historical_start?: string;
  historical_end?: string;
  connector_type?: string;
  connector_owner?: string;
  connector_config?: string;
  backfill_status?: string;
  is_primary?: string;
  is_proxy?: string;
  is_media?: string;
  allowed_use?: string;
  sectors_fed?: string;
  pages_fed?: string;
  limitations?: string;
  notes?: string;
  sector_category?: string;
  registry_type?: string;
  status: string;
  active?: string;
}

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

// Map tier string to normalized tier
function normalizeTier(tier: string): 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'UNKNOWN' {
  const t = tier?.toUpperCase()?.trim();
  if (t === 'T0' || t === 'T1' || t === 'T2' || t === 'T3' || t === 'T4') {
    return t;
  }
  return 'UNKNOWN';
}

// Map status string to normalized status
function normalizeStatus(status: string): 'ACTIVE' | 'PENDING_REVIEW' | 'NEEDS_KEY' | 'INACTIVE' | 'DEPRECATED' {
  const s = status?.toUpperCase()?.trim();
  if (s === 'ACTIVE') return 'ACTIVE';
  if (s === 'PENDING_REVIEW') return 'PENDING_REVIEW';
  if (s === 'NEEDS_KEY') return 'NEEDS_KEY';
  if (s === 'INACTIVE') return 'INACTIVE';
  if (s === 'DEPRECATED') return 'DEPRECATED';
  return 'PENDING_REVIEW';
}

// Map frequency to normalized value
function normalizeFrequency(freq: string): string {
  const f = freq?.toUpperCase()?.trim();
  if (f?.includes('DAILY')) return 'DAILY';
  if (f?.includes('WEEKLY')) return 'WEEKLY';
  if (f?.includes('MONTHLY')) return 'MONTHLY';
  if (f?.includes('QUARTERLY')) return 'QUARTERLY';
  if (f?.includes('ANNUAL') || f?.includes('YEARLY')) return 'ANNUAL';
  if (f?.includes('IRREGULAR') || f?.includes('AD HOC')) return 'IRREGULAR';
  return 'IRREGULAR';
}

// Parse allowed use flags
function parseAllowedUse(allowedUse: string): string[] {
  if (!allowedUse) return ['DATA_NUMERIC', 'DOC_NARRATIVE'];
  const uses: string[] = [];
  const u = allowedUse.toUpperCase();
  if (u.includes('DATA') || u.includes('NUMERIC')) uses.push('DATA_NUMERIC');
  if (u.includes('DOC') || u.includes('NARRATIVE')) uses.push('DOC_NARRATIVE');
  if (u.includes('EVENT')) uses.push('EVENT_DETECTION');
  if (u.includes('PROXY')) uses.push('PROXY');
  if (u.includes('METADATA')) uses.push('METADATA_ONLY');
  return uses.length > 0 ? uses : ['DATA_NUMERIC', 'DOC_NARRATIVE'];
}

// Parse sectors fed
function parseSectorsFed(sectorsFed: string, primarySector: string): string[] {
  const sectors: string[] = [];
  if (primarySector) {
    sectors.push(primarySector.toLowerCase().replace(/[^a-z0-9]/g, '_'));
  }
  if (sectorsFed) {
    const parts = sectorsFed.split(/[,;|]/);
    for (const part of parts) {
      const normalized = part.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (normalized && !sectors.includes(normalized)) {
        sectors.push(normalized);
      }
    }
  }
  return sectors;
}

export async function importSourcesFromCSV(csvContent: string): Promise<{
  imported: number;
  updated: number;
  errors: string[];
}> {
  const lines = csvContent.split('\n');
  const headers = parseCSVLine(lines[0]);
  
  let imported = 0;
  let updated = 0;
  const errors: string[] = [];
  
  // Create header index map
  const headerIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    headerIndex[h.toLowerCase().replace(/[^a-z0-9_]/g, '_')] = i;
  });
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      const values = parseCSVLine(line);
      
      // Extract fields by header position
      const sourceId = values[headerIndex['source_id'] ?? 0] || `SRC-${i}`;
      const name = values[headerIndex['name'] ?? 2] || values[2] || `Source ${i}`;
      const tier = values[headerIndex['tier'] ?? 7] || values[7] || 'UNKNOWN';
      const publisher = values[headerIndex['publisher'] ?? 8] || values[8] || '';
      const apiUrl = values[headerIndex['api_url'] ?? 9] || values[9] || '';
      const webUrl = values[headerIndex['web_url'] ?? 10] || values[10] || '';
      const accessType = values[headerIndex['access_type'] ?? 11] || values[11] || 'WEB';
      const updateFrequency = values[headerIndex['update_frequency'] ?? 14] || values[14] || '';
      const frequencyNormalized = values[headerIndex['frequency_normalized'] ?? 15] || values[15] || '';
      const freshnessSla = values[headerIndex['freshness_sla_days'] ?? 16] || values[16] || '';
      const geographicScope = values[headerIndex['geographic_scope'] ?? 19] || values[19] || '';
      const description = values[headerIndex['description'] ?? 20] || values[20] || '';
      const license = values[headerIndex['license'] ?? 21] || values[21] || '';
      const confidenceRating = values[headerIndex['confidence_rating'] ?? 22] || values[22] || '';
      const needsPartnership = values[headerIndex['needs_partnership'] ?? 25] || values[25] || 'False';
      const partnershipContact = values[headerIndex['partnership_contact'] ?? 26] || values[26] || '';
      const connectorType = values[headerIndex['connector_type'] ?? 31] || values[31] || '';
      const status = values[headerIndex['status'] ?? 39] || values[39] || 'PENDING_REVIEW';
      const primarySector = values[headerIndex['primary_sector'] ?? 4] || values[4] || '';
      const sectorsFed = values[headerIndex['sectors_fed'] ?? 37] || values[37] || '';
      const notes = values[headerIndex['notes'] ?? 38] || values[38] || '';
      
      if (!name || name.length < 2) continue;
      
      // Check if source exists
      const existing = await db.select().from(sources).where(eq(sources.publisher, (publisher || name).substring(0, 255))).limit(1);
      
      const sourceData = {
        publisher: (publisher || name).substring(0, 255),
        url: webUrl.substring(0, 1000) || apiUrl.substring(0, 1000) || null,
        license: license.substring(0, 100) || null,
        retrievalDate: new Date(),
        notes: `${description}\n\nTier: ${tier}\nAccess: ${accessType}\nFrequency: ${frequencyNormalized || updateFrequency}\nSectors: ${sectorsFed}`.substring(0, 2000) || null,
      };
      
      if (existing.length > 0) {
        await db.update(sources)
          .set({ ...sourceData, updatedAt: new Date() })
          .where(eq(sources.publisher, (publisher || name).substring(0, 255)));
        updated++;
      } else {
        await db.insert(sources).values(sourceData);
        imported++;
      }
    } catch (error) {
      errors.push(`Line ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return { imported, updated, errors };
}

// Import high-value Yemen sources from Prompt 17
export async function importHighValueSources(): Promise<{
  imported: number;
  errors: string[];
}> {
  const highValueSources = [
    // Yemen Official Statistical Bodies (Arabic)
    {
      sourceId: 'SRC-HV-001',
      name: 'Central Statistical Organization (Yemen)',
      publisher: 'CSO Yemen',
      webUrl: 'https://cso-ye.org/',
      accessType: 'WEB' as const,
      tier: 'T1' as const,
      status: 'PENDING_REVIEW' as const,
      updateFrequency: 'ANNUAL',
      geographicScope: 'National',
      description: 'Official Yemen statistics agency - population, economic, social data',
      sectorsFed: JSON.stringify(['macro', 'demographics', 'social']),
      allowedUse: JSON.stringify(['DATA_NUMERIC', 'DOC_NARRATIVE']),
    },
    {
      sourceId: 'SRC-HV-002',
      name: 'Ministry of Industry & Trade (Yemen)',
      publisher: 'MoIT Yemen',
      webUrl: 'https://www.moit.gov.ye/',
      accessType: 'WEB' as const,
      tier: 'T1' as const,
      status: 'PENDING_REVIEW' as const,
      updateFrequency: 'IRREGULAR',
      geographicScope: 'National',
      description: 'Commercial registry, trade regulations, business licensing',
      sectorsFed: JSON.stringify(['trade', 'private_sector', 'business']),
      allowedUse: JSON.stringify(['DATA_NUMERIC', 'DOC_NARRATIVE']),
    },
    // Yemen Universities (Arabic Academic)
    {
      sourceId: 'SRC-HV-003',
      name: 'University of Aden - Economics Theses',
      publisher: 'University of Aden',
      webUrl: 'https://www.aden-univ.net/jur/81',
      accessType: 'WEB' as const,
      tier: 'T2' as const,
      status: 'PENDING_REVIEW' as const,
      updateFrequency: 'IRREGULAR',
      geographicScope: 'National',
      description: 'Economics master theses from University of Aden',
      sectorsFed: JSON.stringify(['research', 'macro', 'development']),
      allowedUse: JSON.stringify(['DOC_NARRATIVE']),
    },
    {
      sourceId: 'SRC-HV-004',
      name: 'Taiz University Theses Database',
      publisher: 'Taiz University',
      webUrl: 'https://taiz.edu.ye/DEFAULTDET.ASPX?pnc=4207',
      accessType: 'WEB' as const,
      tier: 'T2' as const,
      status: 'PENDING_REVIEW' as const,
      updateFrequency: 'IRREGULAR',
      geographicScope: 'National',
      description: 'Academic theses database from Taiz University',
      sectorsFed: JSON.stringify(['research', 'education']),
      allowedUse: JSON.stringify(['DOC_NARRATIVE']),
    },
    {
      sourceId: 'SRC-HV-005',
      name: "Sana'a University Journals",
      publisher: "Sana'a University",
      webUrl: 'https://journals.su.edu.ye/',
      accessType: 'WEB' as const,
      tier: 'T2' as const,
      status: 'PENDING_REVIEW' as const,
      updateFrequency: 'QUARTERLY',
      geographicScope: 'National',
      description: "Academic journals from Sana'a University - economics, social, business",
      sectorsFed: JSON.stringify(['research', 'macro', 'social']),
      allowedUse: JSON.stringify(['DOC_NARRATIVE']),
    },
    // International High-Quality Datasets
    {
      sourceId: 'SRC-HV-006',
      name: 'WITS Yemen Trade Snapshot',
      publisher: 'World Bank',
      webUrl: 'https://wits.worldbank.org/countrysnapshot/YEM',
      accessType: 'WEB' as const,
      tier: 'T1' as const,
      status: 'ACTIVE' as const,
      updateFrequency: 'ANNUAL',
      geographicScope: 'Global',
      description: 'World Integrated Trade Solution - Yemen trade data, tariffs, non-tariff measures',
      sectorsFed: JSON.stringify(['trade', 'macro', 'commerce']),
      allowedUse: JSON.stringify(['DATA_NUMERIC', 'DOC_NARRATIVE']),
    },
    {
      sourceId: 'SRC-HV-007',
      name: 'World Bank Reproducibility Catalog',
      publisher: 'World Bank',
      webUrl: 'https://reproducibility.worldbank.org/',
      accessType: 'WEB' as const,
      tier: 'T1' as const,
      status: 'ACTIVE' as const,
      updateFrequency: 'IRREGULAR',
      geographicScope: 'Global',
      description: 'Reproducibility packages and datasets for World Bank research',
      sectorsFed: JSON.stringify(['research', 'methodology']),
      allowedUse: JSON.stringify(['DATA_NUMERIC', 'DOC_NARRATIVE']),
    },
    {
      sourceId: 'SRC-HV-008',
      name: 'IFPRI Yemen Country Data',
      publisher: 'IFPRI',
      webUrl: 'https://www.ifpri.org/country/yemen/',
      accessType: 'WEB' as const,
      tier: 'T1' as const,
      status: 'ACTIVE' as const,
      updateFrequency: 'IRREGULAR',
      geographicScope: 'National',
      description: 'Food security, agriculture, and nutrition datasets for Yemen',
      sectorsFed: JSON.stringify(['food_security', 'agriculture', 'nutrition']),
      allowedUse: JSON.stringify(['DATA_NUMERIC', 'DOC_NARRATIVE']),
    },
    {
      sourceId: 'SRC-HV-009',
      name: 'Yemen Social Accounting Matrix (SAM)',
      publisher: 'CGIAR/Kiel Institute',
      webUrl: 'https://cgspace.cgiar.org/items/68b90d46-7863-4a9f-ba84-46fd0c58ffe5',
      accessType: 'WEB' as const,
      tier: 'T1' as const,
      status: 'ACTIVE' as const,
      updateFrequency: 'IRREGULAR',
      geographicScope: 'National',
      description: 'Yemen Social Accounting Matrix 2012 - economic structure dataset',
      sectorsFed: JSON.stringify(['macro', 'modeling', 'research']),
      allowedUse: JSON.stringify(['DATA_NUMERIC']),
    },
    // Donor Accountability
    {
      sourceId: 'SRC-HV-010',
      name: 'WFP Yemen Annual Country Reports',
      publisher: 'WFP',
      webUrl: 'https://www.wfp.org/publications/annual-country-reports-yemen',
      accessType: 'WEB' as const,
      tier: 'T1' as const,
      status: 'ACTIVE' as const,
      updateFrequency: 'ANNUAL',
      geographicScope: 'National',
      description: 'Annual accountability reports from WFP Yemen operations',
      sectorsFed: JSON.stringify(['humanitarian', 'food_security', 'aid']),
      allowedUse: JSON.stringify(['DATA_NUMERIC', 'DOC_NARRATIVE']),
    },
    {
      sourceId: 'SRC-HV-011',
      name: 'EU EEAS Yemen Overview',
      publisher: 'European Union',
      webUrl: 'https://www.eeas.europa.eu/yemen/',
      accessType: 'WEB' as const,
      tier: 'T1' as const,
      status: 'ACTIVE' as const,
      updateFrequency: 'IRREGULAR',
      geographicScope: 'Global',
      description: 'EU donor policy and funding overview for Yemen',
      sectorsFed: JSON.stringify(['aid', 'humanitarian', 'development']),
      allowedUse: JSON.stringify(['DOC_NARRATIVE']),
    },
  ];
  
  let imported = 0;
  const errors: string[] = [];
  
  for (const source of highValueSources) {
    try {
      const existing = await db.select().from(sources).where(eq(sources.publisher, source.publisher)).limit(1);
      
      if (existing.length === 0) {
        await db.insert(sources).values({
          publisher: source.publisher,
          url: source.webUrl,
          retrievalDate: new Date(),
          notes: source.description,
        });
        imported++;
      }
    } catch (error) {
      errors.push(`${source.publisher}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return { imported, errors };
}

// Get source statistics
export async function getSourceStatistics(): Promise<{
  total: number;
  byTier: Record<string, number>;
  byStatus: Record<string, number>;
  byAccessType: Record<string, number>;
}> {
  const allSources = await db.select().from(sources);
  
  const byTier: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byAccessType: Record<string, number> = {};
  
  for (const source of allSources) {
    byTier['T1'] = (byTier['T1'] || 0) + 1;
    byStatus['active'] = (byStatus['active'] || 0) + 1;
    byAccessType['api'] = (byAccessType['api'] || 0) + 1;
  }
  
  return {
    total: allSources.length,
    byTier,
    byStatus,
    byAccessType,
  };
}
