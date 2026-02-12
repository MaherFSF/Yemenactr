/**
 * @deprecated — Archived Phase 2 (Feb 2026)
 *
 * These three hardcoded source arrays were removed from
 * server/connectors/index.ts and replaced with DB-backed async functions
 * that query the source_registry table.
 *
 * DO NOT re-import. The canonical source of truth is:
 *   source_registry table  ← data/registry/YETO_Sources_Universe_Master_*.xlsx
 *
 * Replacement functions (all async, in server/connectors/index.ts):
 *   getDataSources()                → replaces DATA_SOURCES + EXTENDED_CONNECTORS
 *   getAllEnhancedConnectorStatuses() → replaces ENHANCED_CONNECTOR_REGISTRY
 *   getActiveConnectorsSorted()      → replaces getActiveConnectorsSorted() (was sync)
 *   getAllConnectors()               → replaces getAllConnectors() (was sync merge)
 */

// ============================================
// 1. DATA_SOURCES (9 entries)
// ============================================

export const DATA_SOURCES = [
  { id: 'world-bank', name: 'World Bank Development Indicators', type: 'api', url: 'https://api.worldbank.org/v2', cadence: 'annual', status: 'active', requiresKey: false },
  { id: 'hdx-hapi', name: 'Humanitarian Data Exchange (HAPI)', type: 'api', url: 'https://hapi.humdata.org/api/v1', cadence: 'monthly', status: 'active', requiresKey: false },
  { id: 'ocha-fts', name: 'OCHA Financial Tracking Service', type: 'api', url: 'https://api.hpc.tools/v2/public/fts', cadence: 'daily', status: 'active', requiresKey: false },
  { id: 'reliefweb', name: 'ReliefWeb', type: 'api', url: 'https://api.reliefweb.int/v1', cadence: 'daily', status: 'active', requiresKey: false },
  { id: 'iati', name: 'IATI Datastore', type: 'api', url: 'https://api.iatistandard.org/datastore', cadence: 'weekly', status: 'active', requiresKey: false },
  { id: 'ucdp', name: 'Uppsala Conflict Data Program', type: 'api', url: 'https://ucdp.uu.se/api', cadence: 'annual', status: 'active', requiresKey: false },
  { id: 'acled', name: 'Armed Conflict Location & Event Data', type: 'api', url: 'https://api.acleddata.com', cadence: 'weekly', status: 'blocked', requiresKey: true },
  { id: 'cby-aden', name: 'Central Bank of Yemen (Aden)', type: 'document', url: 'https://cby-ye.com', cadence: 'monthly', status: 'active', requiresKey: false },
  { id: 'cby-sanaa', name: "Central Bank of Yemen (Sana'a)", type: 'document', url: 'https://centralbank.gov.ye', cadence: 'monthly', status: 'active', requiresKey: false },
];

// ============================================
// 2. ENHANCED_CONNECTOR_REGISTRY (13 entries)
// ============================================

export const ENHANCED_CONNECTOR_REGISTRY = [
  { id: 'world-bank', name: 'World Bank Open Data', priority: 1 },
  { id: 'imf-data', name: 'IMF Data Services', priority: 1 },
  { id: 'ocha-fts', name: 'OCHA Financial Tracking Service', priority: 1 },
  { id: 'hdx-hapi', name: 'HDX HAPI', priority: 2 },
  { id: 'fao-stat', name: 'FAO/FAOSTAT', priority: 2 },
  { id: 'acled', name: 'ACLED', priority: 2 },
  { id: 'iom-dtm', name: 'IOM DTM Yemen', priority: 2 },
  { id: 'wfp-vam', name: 'WFP Market Monitoring', priority: 2 },
  { id: 'cby-aden', name: 'Central Bank of Yemen (Aden)', priority: 1 },
  { id: 'reliefweb', name: 'ReliefWeb', priority: 3 },
  { id: 'unhcr', name: 'UNHCR Data Portal', priority: 3 },
  { id: 'unicef', name: 'UNICEF Data', priority: 3 },
  { id: 'who-gho', name: 'WHO Global Health Observatory', priority: 3 },
];

// ============================================
// 3. EXTENDED_CONNECTORS (8 entries)
// ============================================

export const EXTENDED_CONNECTORS = [
  { id: 'unhcr', name: 'UNHCR Refugee Data', type: 'api', url: 'https://data.unhcr.org/', cadence: 'monthly', status: 'active', requiresKey: false },
  { id: 'who', name: 'WHO Health Indicators', type: 'api', url: 'https://www.who.int/data/gho', cadence: 'annual', status: 'active', requiresKey: false },
  { id: 'unicef', name: 'UNICEF Child Welfare', type: 'api', url: 'https://data.unicef.org/', cadence: 'annual', status: 'active', requiresKey: false },
  { id: 'wfp', name: 'WFP Food Security', type: 'api', url: 'https://dataviz.vam.wfp.org/', cadence: 'monthly', status: 'active', requiresKey: false },
  { id: 'undp', name: 'UNDP Human Development', type: 'api', url: 'https://hdr.undp.org/', cadence: 'annual', status: 'active', requiresKey: false },
  { id: 'iati', name: 'IATI Aid Transparency', type: 'api', url: 'https://iatistandard.org/', cadence: 'quarterly', status: 'active', requiresKey: false },
  { id: 'cby-aden', name: 'Central Bank of Yemen (Aden)', type: 'api', url: 'https://www.centralbank.gov.ye/', cadence: 'monthly', status: 'active', requiresKey: false },
  { id: 'cby-sanaa', name: "Central Bank of Yemen (Sana'a)", type: 'api', url: 'https://www.cby-ye.com/', cadence: 'monthly', status: 'active', requiresKey: false },
];
