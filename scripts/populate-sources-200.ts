/**
 * YETO Platform - Comprehensive Source Registry Population
 * 
 * This script populates the source registry with 200+ data sources
 * covering all aspects of Yemen's economic landscape from 2010-present
 */

import { db } from "../server/db";
import { sourceRegistry } from "../drizzle/schema";
import { sql, eq } from "drizzle-orm";

// ============================================================================
// COMPREHENSIVE SOURCE LIST - 200+ SOURCES
// ============================================================================

interface SourceData {
  sourceId: string;
  name: string;
  altName?: string;
  publisher?: string;
  apiUrl?: string;
  webUrl?: string;
  accessType: "API" | "SDMX" | "RSS" | "WEB" | "PDF" | "CSV" | "XLSX" | "MANUAL" | "PARTNER" | "REMOTE_SENSING";
  tier: "T0" | "T1" | "T2" | "T3" | "T4" | "UNKNOWN";
  status: "ACTIVE" | "PENDING_REVIEW" | "NEEDS_KEY" | "INACTIVE" | "DEPRECATED";
  updateFrequency: "REALTIME" | "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL" | "IRREGULAR";
  geographicScope?: string;
  regimeApplicability?: "ADEN_IRG" | "SANAA_DFA" | "BOTH" | "MIXED" | "GLOBAL";
  historicalStart?: number;
  historicalEnd?: number;
  description?: string;
  sectorsFed?: string[];
  isPrimary?: boolean;
  isMedia?: boolean;
}

const YEMEN_DATA_SOURCES: SourceData[] = [
  // ============================================================================
  // TIER 0: PRIMARY OFFICIAL SOURCES (Highest Authority)
  // ============================================================================
  
  // Central Banks
  { sourceId: "SRC-001", name: "Central Bank of Yemen - Aden", altName: "البنك المركزي اليمني - عدن", publisher: "CBY Aden", webUrl: "https://cby-ye.com", accessType: "WEB", tier: "T0", status: "ACTIVE", updateFrequency: "WEEKLY", geographicScope: "National", regimeApplicability: "ADEN_IRG", historicalStart: 2016, sectorsFed: ["banking", "currency", "macro"], isPrimary: true, description: "Official central bank data for IRG-controlled areas" },
  { sourceId: "SRC-002", name: "Central Bank of Yemen - Sana'a", altName: "البنك المركزي اليمني - صنعاء", publisher: "CBY Sanaa", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "IRREGULAR", geographicScope: "National", regimeApplicability: "SANAA_DFA", historicalStart: 2016, sectorsFed: ["banking", "currency", "macro"], isPrimary: true, description: "Official central bank data for Sana'a-controlled areas" },
  
  // Government Ministries
  { sourceId: "SRC-003", name: "Yemen Ministry of Finance", altName: "وزارة المالية اليمنية", publisher: "MoF Yemen", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["macro", "fiscal"], isPrimary: true, description: "Official fiscal data and budget information" },
  { sourceId: "SRC-004", name: "Yemen Ministry of Planning", altName: "وزارة التخطيط والتعاون الدولي", publisher: "MoPIC Yemen", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["macro", "development"], isPrimary: true, description: "Development planning and international cooperation data" },
  { sourceId: "SRC-005", name: "Yemen Central Statistical Organization", altName: "الجهاز المركزي للإحصاء", publisher: "CSO Yemen", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["macro", "demographics", "prices"], isPrimary: true, description: "Official national statistics" },
  { sourceId: "SRC-006", name: "Yemen Ministry of Trade", altName: "وزارة التجارة والصناعة", publisher: "MoTI Yemen", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["trade", "prices"], description: "Trade and industry data" },
  { sourceId: "SRC-007", name: "Yemen Ministry of Agriculture", altName: "وزارة الزراعة والري", publisher: "MoA Yemen", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["agriculture", "food_security"], description: "Agricultural production and irrigation data" },
  { sourceId: "SRC-008", name: "Yemen Ministry of Oil", altName: "وزارة النفط والمعادن", publisher: "MoO Yemen", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["energy", "macro"], description: "Oil and minerals production data" },
  { sourceId: "SRC-009", name: "Yemen Ministry of Health", altName: "وزارة الصحة العامة والسكان", publisher: "MoH Yemen", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["health", "humanitarian"], description: "Public health statistics" },
  { sourceId: "SRC-010", name: "Yemen Ministry of Education", altName: "وزارة التربية والتعليم", publisher: "MoE Yemen", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["education", "development"], description: "Education statistics" },
  
  // ============================================================================
  // TIER 1: INTERNATIONAL FINANCIAL INSTITUTIONS
  // ============================================================================
  
  // World Bank Group
  { sourceId: "SRC-011", name: "World Bank - WDI", altName: "البنك الدولي - مؤشرات التنمية العالمية", publisher: "World Bank", apiUrl: "https://api.worldbank.org/v2", webUrl: "https://data.worldbank.org", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1960, sectorsFed: ["macro", "development", "trade", "demographics"], isPrimary: true, description: "World Development Indicators - comprehensive development data" },
  { sourceId: "SRC-012", name: "World Bank - Doing Business", altName: "البنك الدولي - ممارسة الأعمال", publisher: "World Bank", apiUrl: "https://api.worldbank.org/v2", accessType: "API", tier: "T1", status: "INACTIVE", updateFrequency: "ANNUAL", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 2003, historicalEnd: 2020, sectorsFed: ["business", "macro"], description: "Business environment indicators (discontinued)" },
  { sourceId: "SRC-013", name: "World Bank - GEM", altName: "البنك الدولي - آفاق الاقتصاد العالمي", publisher: "World Bank", apiUrl: "https://api.worldbank.org/v2", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 2010, sectorsFed: ["macro", "trade"], description: "Global Economic Monitor" },
  { sourceId: "SRC-014", name: "World Bank - Yemen Projects", altName: "البنك الدولي - مشاريع اليمن", publisher: "World Bank", apiUrl: "https://api.worldbank.org/v2", webUrl: "https://projects.worldbank.org", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1970, sectorsFed: ["development", "humanitarian"], description: "World Bank projects in Yemen" },
  { sourceId: "SRC-015", name: "IFC - Yemen", altName: "مؤسسة التمويل الدولية - اليمن", publisher: "IFC", webUrl: "https://www.ifc.org", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["banking", "business"], description: "Private sector investment data" },
  
  // IMF
  { sourceId: "SRC-016", name: "IMF - WEO", altName: "صندوق النقد الدولي - آفاق الاقتصاد العالمي", publisher: "IMF", apiUrl: "https://dataservices.imf.org/REST/SDMX_JSON.svc", accessType: "SDMX", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1980, sectorsFed: ["macro", "fiscal"], isPrimary: true, description: "World Economic Outlook projections" },
  { sourceId: "SRC-017", name: "IMF - IFS", altName: "صندوق النقد الدولي - الإحصاءات المالية الدولية", publisher: "IMF", apiUrl: "https://dataservices.imf.org/REST/SDMX_JSON.svc", accessType: "SDMX", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1948, sectorsFed: ["macro", "banking", "currency"], isPrimary: true, description: "International Financial Statistics" },
  { sourceId: "SRC-018", name: "IMF - BOP", altName: "صندوق النقد الدولي - ميزان المدفوعات", publisher: "IMF", apiUrl: "https://dataservices.imf.org/REST/SDMX_JSON.svc", accessType: "SDMX", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1948, sectorsFed: ["trade", "macro"], description: "Balance of Payments statistics" },
  { sourceId: "SRC-019", name: "IMF - DOTS", altName: "صندوق النقد الدولي - إحصاءات اتجاه التجارة", publisher: "IMF", apiUrl: "https://dataservices.imf.org/REST/SDMX_JSON.svc", accessType: "SDMX", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1948, sectorsFed: ["trade"], description: "Direction of Trade Statistics" },
  { sourceId: "SRC-020", name: "IMF - Article IV Yemen", altName: "صندوق النقد الدولي - تقارير المادة الرابعة لليمن", publisher: "IMF", webUrl: "https://www.imf.org/en/Countries/YEM", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1990, sectorsFed: ["macro", "fiscal", "banking"], description: "Article IV consultation reports" },
  
  // ============================================================================
  // TIER 1: UN AGENCIES
  // ============================================================================
  
  // OCHA
  { sourceId: "SRC-021", name: "UN OCHA - FTS", altName: "مكتب تنسيق الشؤون الإنسانية - تتبع التمويل", publisher: "UN OCHA", apiUrl: "https://api.hpc.tools/v1/public", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["humanitarian", "development"], isPrimary: true, description: "Financial Tracking Service for humanitarian funding" },
  { sourceId: "SRC-022", name: "UN OCHA - HDX", altName: "مكتب تنسيق الشؤون الإنسانية - تبادل البيانات الإنسانية", publisher: "UN OCHA", apiUrl: "https://data.humdata.org/api/3/action", webUrl: "https://data.humdata.org", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2014, sectorsFed: ["humanitarian", "food_security", "health"], isPrimary: true, description: "Humanitarian Data Exchange" },
  { sourceId: "SRC-023", name: "UN OCHA - ReliefWeb", altName: "مكتب تنسيق الشؤون الإنسانية - ريليف ويب", publisher: "UN OCHA", apiUrl: "https://api.reliefweb.int/v1", webUrl: "https://reliefweb.int", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1996, sectorsFed: ["humanitarian", "conflict"], isPrimary: true, description: "Humanitarian reports and documents" },
  { sourceId: "SRC-024", name: "UN OCHA - HNO Yemen", altName: "نظرة عامة على الاحتياجات الإنسانية - اليمن", publisher: "UN OCHA", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian"], description: "Humanitarian Needs Overview" },
  { sourceId: "SRC-025", name: "UN OCHA - HRP Yemen", altName: "خطة الاستجابة الإنسانية - اليمن", publisher: "UN OCHA", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian"], description: "Humanitarian Response Plan" },
  
  // WFP
  { sourceId: "SRC-026", name: "WFP - VAM", altName: "برنامج الأغذية العالمي - تحليل الضعف ورسم الخرائط", publisher: "WFP", apiUrl: "https://api.vam.wfp.org", accessType: "API", tier: "T1", status: "NEEDS_KEY", updateFrequency: "WEEKLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["food_security", "prices"], isPrimary: true, description: "Vulnerability Analysis and Mapping" },
  { sourceId: "SRC-027", name: "WFP - mVAM", altName: "برنامج الأغذية العالمي - مراقبة الأمن الغذائي المتنقلة", publisher: "WFP", webUrl: "https://mvam.wfp.org", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2013, sectorsFed: ["food_security"], description: "Mobile Vulnerability Analysis and Mapping" },
  { sourceId: "SRC-028", name: "WFP - HungerMap", altName: "برنامج الأغذية العالمي - خريطة الجوع", publisher: "WFP", webUrl: "https://hungermap.wfp.org", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2019, sectorsFed: ["food_security"], description: "Real-time hunger monitoring" },
  { sourceId: "SRC-029", name: "WFP - Yemen Market Monitor", altName: "برنامج الأغذية العالمي - مراقبة أسواق اليمن", publisher: "WFP", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["food_security", "prices"], description: "Monthly market price monitoring" },
  
  // FAO
  { sourceId: "SRC-030", name: "FAO - GIEWS", altName: "منظمة الأغذية والزراعة - نظام المعلومات العالمي والإنذار المبكر", publisher: "FAO", apiUrl: "https://www.fao.org/giews/food-prices/tool/public", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["food_security", "agriculture"], isPrimary: true, description: "Global Information and Early Warning System" },
  { sourceId: "SRC-031", name: "FAO - FAOSTAT", altName: "منظمة الأغذية والزراعة - قاعدة البيانات الإحصائية", publisher: "FAO", apiUrl: "https://fenixservices.fao.org/faostat/api/v1", webUrl: "https://www.fao.org/faostat", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1961, sectorsFed: ["agriculture", "trade", "food_security"], isPrimary: true, description: "Agricultural statistics database" },
  { sourceId: "SRC-032", name: "FAO - FPMA", altName: "منظمة الأغذية والزراعة - أداة مراقبة وتحليل أسعار الغذاء", publisher: "FAO", apiUrl: "https://fpma.fao.org/giews/fpmat4", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2008, sectorsFed: ["prices", "food_security"], description: "Food Price Monitoring and Analysis" },
  { sourceId: "SRC-033", name: "FAO - IPC Yemen", altName: "التصنيف المرحلي المتكامل للأمن الغذائي - اليمن", publisher: "IPC Global Partnership", webUrl: "https://www.ipcinfo.org", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2014, sectorsFed: ["food_security"], isPrimary: true, description: "Integrated Food Security Phase Classification" },
  
  // UNHCR
  { sourceId: "SRC-034", name: "UNHCR - Population Statistics", altName: "المفوضية السامية للأمم المتحدة لشؤون اللاجئين - إحصاءات السكان", publisher: "UNHCR", apiUrl: "https://api.unhcr.org/population/v1", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1951, sectorsFed: ["humanitarian", "demographics"], description: "Refugee and displacement statistics" },
  { sourceId: "SRC-035", name: "UNHCR - Operational Data Portal", altName: "المفوضية السامية للأمم المتحدة لشؤون اللاجئين - بوابة البيانات التشغيلية", publisher: "UNHCR", apiUrl: "https://data.unhcr.org/api", webUrl: "https://data.unhcr.org", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "WEEKLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian", "demographics"], description: "Operational refugee data" },
  
  // WHO
  { sourceId: "SRC-036", name: "WHO - GHO", altName: "منظمة الصحة العالمية - المرصد الصحي العالمي", publisher: "WHO", apiUrl: "https://ghoapi.azureedge.net/api", webUrl: "https://www.who.int/data/gho", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1990, sectorsFed: ["health", "humanitarian"], isPrimary: true, description: "Global Health Observatory" },
  { sourceId: "SRC-037", name: "WHO - Yemen Health Cluster", altName: "منظمة الصحة العالمية - مجموعة الصحة في اليمن", publisher: "WHO", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["health", "humanitarian"], description: "Health cluster coordination reports" },
  
  // UNICEF
  { sourceId: "SRC-038", name: "UNICEF - Data Warehouse", altName: "اليونيسف - مستودع البيانات", publisher: "UNICEF", apiUrl: "https://data.unicef.org/api", webUrl: "https://data.unicef.org", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1990, sectorsFed: ["health", "education", "humanitarian"], description: "Child welfare statistics" },
  { sourceId: "SRC-039", name: "UNICEF - Yemen Situation Reports", altName: "اليونيسف - تقارير الوضع في اليمن", publisher: "UNICEF", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian", "health", "education"], description: "Situation reports for Yemen" },
  
  // IOM
  { sourceId: "SRC-040", name: "IOM - DTM Yemen", altName: "المنظمة الدولية للهجرة - مصفوفة تتبع النزوح في اليمن", publisher: "IOM", apiUrl: "https://dtm.iom.int/api", webUrl: "https://dtm.iom.int/yemen", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian", "demographics"], isPrimary: true, description: "Displacement Tracking Matrix" },
  { sourceId: "SRC-041", name: "IOM - Flow Monitoring", altName: "المنظمة الدولية للهجرة - رصد التدفقات", publisher: "IOM", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian", "demographics"], description: "Migration flow monitoring" },
  
  // ILO
  { sourceId: "SRC-042", name: "ILO - ILOSTAT", altName: "منظمة العمل الدولية - قاعدة البيانات الإحصائية", publisher: "ILO", apiUrl: "https://www.ilo.org/ilostat-files/WEB_bulk_download", webUrl: "https://ilostat.ilo.org", accessType: "CSV", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1990, sectorsFed: ["labor", "macro"], isPrimary: true, description: "International labor statistics" },
  
  // UNDP
  { sourceId: "SRC-043", name: "UNDP - HDI Data", altName: "برنامج الأمم المتحدة الإنمائي - بيانات مؤشر التنمية البشرية", publisher: "UNDP", apiUrl: "https://hdr.undp.org/api", webUrl: "https://hdr.undp.org", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1990, sectorsFed: ["development", "macro"], isPrimary: true, description: "Human Development Index data" },
  { sourceId: "SRC-044", name: "UNDP - Yemen Reports", altName: "برنامج الأمم المتحدة الإنمائي - تقارير اليمن", publisher: "UNDP", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["development", "humanitarian"], description: "UNDP Yemen country reports" },
  
  // UN DESA
  { sourceId: "SRC-045", name: "UN DESA - Population Division", altName: "إدارة الشؤون الاقتصادية والاجتماعية - شعبة السكان", publisher: "UN DESA", apiUrl: "https://population.un.org/wpp/Download/Standard", webUrl: "https://population.un.org", accessType: "CSV", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1950, sectorsFed: ["demographics"], isPrimary: true, description: "World Population Prospects" },
  
  // UNCTAD
  { sourceId: "SRC-046", name: "UNCTAD - UNCTADstat", altName: "الأونكتاد - قاعدة البيانات الإحصائية", publisher: "UNCTAD", apiUrl: "https://unctadstat.unctad.org/api", webUrl: "https://unctadstat.unctad.org", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1948, sectorsFed: ["trade", "macro"], description: "Trade and development statistics" },
  
  // UN Comtrade
  { sourceId: "SRC-047", name: "UN Comtrade", altName: "قاعدة بيانات التجارة الدولية للأمم المتحدة", publisher: "UN Statistics Division", apiUrl: "https://comtradeapi.un.org/data/v1/get", webUrl: "https://comtrade.un.org", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1962, sectorsFed: ["trade"], isPrimary: true, description: "International trade statistics" },
  
  // ============================================================================
  // TIER 1: REGIONAL ORGANIZATIONS
  // ============================================================================
  
  { sourceId: "SRC-048", name: "Arab Monetary Fund", altName: "صندوق النقد العربي", publisher: "AMF", webUrl: "https://www.amf.org.ae", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "Regional", regimeApplicability: "GLOBAL", historicalStart: 1976, sectorsFed: ["banking", "macro"], description: "Arab monetary and financial data" },
  { sourceId: "SRC-049", name: "Islamic Development Bank", altName: "البنك الإسلامي للتنمية", publisher: "IsDB", webUrl: "https://www.isdb.org", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "Regional", regimeApplicability: "GLOBAL", historicalStart: 1975, sectorsFed: ["development", "banking"], description: "Islamic development finance data" },
  { sourceId: "SRC-050", name: "GCC Statistical Center", altName: "المركز الإحصائي لدول مجلس التعاون", publisher: "GCC-Stat", webUrl: "https://gccstat.org", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "Regional", regimeApplicability: "GLOBAL", historicalStart: 2010, sectorsFed: ["macro", "trade"], description: "GCC regional statistics" },
  
  // ============================================================================
  // TIER 2: RESEARCH INSTITUTIONS & THINK TANKS
  // ============================================================================
  
  // Yemen-Focused Research
  { sourceId: "SRC-051", name: "Sana'a Center for Strategic Studies", altName: "مركز صنعاء للدراسات الاستراتيجية", publisher: "Sana'a Center", webUrl: "https://sanaacenter.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "WEEKLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2014, sectorsFed: ["macro", "conflict", "development"], isPrimary: true, description: "Yemen-focused policy research" },
  { sourceId: "SRC-052", name: "Yemen Policy Center", altName: "مركز اليمن للسياسات", publisher: "YPC", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2018, sectorsFed: ["macro", "development"], description: "Yemen policy analysis" },
  { sourceId: "SRC-053", name: "DeepRoot Consulting", altName: "ديب روت للاستشارات", publisher: "DeepRoot", webUrl: "https://www.deeproot.consulting", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["development", "humanitarian"], description: "Yemen development consulting" },
  { sourceId: "SRC-054", name: "Abaad Studies Center", altName: "مركز أبعاد للدراسات", publisher: "Abaad", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["macro", "conflict"], description: "Strategic studies on Yemen" },
  { sourceId: "SRC-055", name: "Yemen Polling Center", altName: "مركز اليمن لقياس الرأي العام", publisher: "YPC", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["demographics", "development"], description: "Public opinion research" },
  
  // International Think Tanks
  { sourceId: "SRC-056", name: "Chatham House - Yemen", altName: "تشاتام هاوس - اليمن", publisher: "Chatham House", webUrl: "https://www.chathamhouse.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], description: "UK foreign policy research on Yemen" },
  { sourceId: "SRC-057", name: "Brookings Institution - Yemen", altName: "معهد بروكينغز - اليمن", publisher: "Brookings", webUrl: "https://www.brookings.edu", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], description: "US policy research on Yemen" },
  { sourceId: "SRC-058", name: "Carnegie Endowment - Yemen", altName: "مؤسسة كارنيغي - اليمن", publisher: "Carnegie", webUrl: "https://carnegieendowment.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], description: "International policy research on Yemen" },
  { sourceId: "SRC-059", name: "International Crisis Group - Yemen", altName: "مجموعة الأزمات الدولية - اليمن", publisher: "ICG", webUrl: "https://www.crisisgroup.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["conflict", "humanitarian"], isPrimary: true, description: "Conflict analysis and prevention" },
  { sourceId: "SRC-060", name: "Middle East Institute - Yemen", altName: "معهد الشرق الأوسط - اليمن", publisher: "MEI", webUrl: "https://www.mei.edu", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], description: "Middle East policy research" },
  
  // ============================================================================
  // TIER 2: CONFLICT & SECURITY DATA
  // ============================================================================
  
  { sourceId: "SRC-061", name: "ACLED - Yemen", altName: "مشروع بيانات مواقع النزاعات المسلحة والأحداث - اليمن", publisher: "ACLED", apiUrl: "https://api.acleddata.com/acled/read", webUrl: "https://acleddata.com", accessType: "API", tier: "T2", status: "ACTIVE", updateFrequency: "WEEKLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1997, sectorsFed: ["conflict", "humanitarian"], isPrimary: true, description: "Armed conflict location and event data" },
  { sourceId: "SRC-062", name: "Yemen Data Project", altName: "مشروع بيانات اليمن", publisher: "YDP", webUrl: "https://yemendataproject.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["conflict", "humanitarian"], description: "Airstrikes and civilian casualties tracking" },
  { sourceId: "SRC-063", name: "Civilian Impact Monitoring Project", altName: "مشروع رصد الأثر على المدنيين", publisher: "CIMP", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2017, sectorsFed: ["conflict", "humanitarian"], description: "Civilian impact monitoring" },
  { sourceId: "SRC-064", name: "SIPRI - Yemen Arms", altName: "معهد ستوكهولم الدولي لأبحاث السلام - أسلحة اليمن", publisher: "SIPRI", webUrl: "https://www.sipri.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1950, sectorsFed: ["conflict"], description: "Arms transfers and military expenditure" },
  
  // ============================================================================
  // TIER 2: DONOR & AID TRACKING
  // ============================================================================
  
  { sourceId: "SRC-065", name: "IATI - Yemen Aid", altName: "مبادرة الشفافية في المعونات الدولية - معونات اليمن", publisher: "IATI", apiUrl: "https://api.iatistandard.org/datastore", webUrl: "https://iatistandard.org", accessType: "API", tier: "T2", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2011, sectorsFed: ["humanitarian", "development"], description: "International aid transparency data" },
  { sourceId: "SRC-066", name: "OECD DAC - Yemen ODA", altName: "منظمة التعاون الاقتصادي والتنمية - المساعدة الإنمائية الرسمية لليمن", publisher: "OECD", apiUrl: "https://stats.oecd.org/SDMX-JSON", webUrl: "https://stats.oecd.org", accessType: "SDMX", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1960, sectorsFed: ["development"], description: "Official development assistance statistics" },
  { sourceId: "SRC-067", name: "USAID - Yemen", altName: "الوكالة الأمريكية للتنمية الدولية - اليمن", publisher: "USAID", webUrl: "https://www.usaid.gov", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1990, sectorsFed: ["humanitarian", "development"], description: "US development assistance to Yemen" },
  
  // ============================================================================
  // TIER 2: NGOs & HUMANITARIAN ORGANIZATIONS
  // ============================================================================
  
  { sourceId: "SRC-068", name: "ICRC - Yemen", altName: "اللجنة الدولية للصليب الأحمر - اليمن", publisher: "ICRC", webUrl: "https://www.icrc.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["humanitarian", "health"], description: "Humanitarian operations in Yemen" },
  { sourceId: "SRC-069", name: "MSF - Yemen", altName: "أطباء بلا حدود - اليمن", publisher: "MSF", webUrl: "https://www.msf.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["health", "humanitarian"], description: "Medical humanitarian operations" },
  { sourceId: "SRC-070", name: "Oxfam - Yemen", altName: "أوكسفام - اليمن", publisher: "Oxfam", webUrl: "https://www.oxfam.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["humanitarian", "food_security"], description: "Humanitarian and development operations" },
  { sourceId: "SRC-071", name: "Save the Children - Yemen", altName: "إنقاذ الطفولة - اليمن", publisher: "Save the Children", webUrl: "https://www.savethechildren.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["humanitarian", "education", "health"], description: "Child-focused humanitarian operations" },
  { sourceId: "SRC-072", name: "NRC - Yemen", altName: "المجلس النرويجي للاجئين - اليمن", publisher: "NRC", webUrl: "https://www.nrc.no", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["humanitarian"], description: "Refugee and displacement assistance" },
  
  // ============================================================================
  // TIER 2: MICROFINANCE & BANKING
  // ============================================================================
  
  { sourceId: "SRC-073", name: "Yemen Microfinance Network", altName: "شبكة التمويل الأصغر اليمنية", publisher: "YMN", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["banking", "development"], description: "Microfinance sector data" },
  { sourceId: "SRC-074", name: "Al Amal Microfinance Bank", altName: "بنك الأمل للتمويل الأصغر", publisher: "Al Amal Bank", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2009, sectorsFed: ["banking"], description: "Microfinance banking data" },
  { sourceId: "SRC-075", name: "National Microfinance Foundation", altName: "المؤسسة الوطنية للتمويل الأصغر", publisher: "NMF", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["banking"], description: "Microfinance institution data" },
  
  // ============================================================================
  // TIER 2: PORTS & SHIPPING
  // ============================================================================
  
  { sourceId: "SRC-076", name: "Aden Port Authority", altName: "هيئة موانئ عدن", publisher: "APA", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "ADEN_IRG", historicalStart: 2010, sectorsFed: ["trade"], description: "Aden port operations data" },
  { sourceId: "SRC-077", name: "Hodeidah Port", altName: "ميناء الحديدة", publisher: "Hodeidah Port", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "SANAA_DFA", historicalStart: 2010, sectorsFed: ["trade", "humanitarian"], description: "Hodeidah port operations data" },
  { sourceId: "SRC-078", name: "UNVIM - Yemen Ports", altName: "آلية التحقق والتفتيش الأممية - موانئ اليمن", publisher: "UNVIM", accessType: "MANUAL", tier: "T1", status: "ACTIVE", updateFrequency: "WEEKLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2016, sectorsFed: ["trade", "humanitarian"], description: "UN verification mechanism for Yemen ports" },
  
  // ============================================================================
  // TIER 3: MARKET DATA & FINANCIAL
  // ============================================================================
  
  { sourceId: "SRC-079", name: "XE Currency - YER", altName: "إكس إي للعملات - الريال اليمني", publisher: "XE", apiUrl: "https://www.xe.com/api", webUrl: "https://www.xe.com", accessType: "API", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1995, sectorsFed: ["currency"], description: "Exchange rate data" },
  { sourceId: "SRC-080", name: "Open Exchange Rates", altName: "أسعار الصرف المفتوحة", publisher: "OER", apiUrl: "https://openexchangerates.org/api", accessType: "API", tier: "T3", status: "NEEDS_KEY", updateFrequency: "HOURLY", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 2012, sectorsFed: ["currency"], description: "Real-time exchange rates" },
  { sourceId: "SRC-081", name: "Trading Economics - Yemen", altName: "تريدينغ إيكونوميكس - اليمن", publisher: "Trading Economics", apiUrl: "https://api.tradingeconomics.com", webUrl: "https://tradingeconomics.com/yemen", accessType: "API", tier: "T3", status: "NEEDS_KEY", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["macro", "prices", "trade"], description: "Economic indicators and forecasts" },
  
  // ============================================================================
  // TIER 3: ENERGY DATA
  // ============================================================================
  
  { sourceId: "SRC-082", name: "EIA - Yemen Energy", altName: "إدارة معلومات الطاقة الأمريكية - طاقة اليمن", publisher: "EIA", apiUrl: "https://api.eia.gov", webUrl: "https://www.eia.gov", accessType: "API", tier: "T3", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1980, sectorsFed: ["energy"], description: "US Energy Information Administration data on Yemen" },
  { sourceId: "SRC-083", name: "OPEC - Yemen Oil", altName: "أوبك - نفط اليمن", publisher: "OPEC", webUrl: "https://www.opec.org", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1960, sectorsFed: ["energy"], description: "OPEC oil production data" },
  { sourceId: "SRC-084", name: "IEA - Yemen", altName: "وكالة الطاقة الدولية - اليمن", publisher: "IEA", webUrl: "https://www.iea.org", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1990, sectorsFed: ["energy"], description: "International Energy Agency data" },
  
  // ============================================================================
  // TIER 3: SATELLITE & GEOSPATIAL
  // ============================================================================
  
  { sourceId: "SRC-085", name: "NASA FIRMS - Yemen Fires", altName: "ناسا - نظام معلومات الحرائق في اليمن", publisher: "NASA", apiUrl: "https://firms.modaps.eosdis.nasa.gov/api", accessType: "API", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["conflict", "agriculture"], description: "Fire detection satellite data" },
  { sourceId: "SRC-086", name: "NOAA - Yemen Climate", altName: "الإدارة الوطنية للمحيطات والغلاف الجوي - مناخ اليمن", publisher: "NOAA", apiUrl: "https://www.ncdc.noaa.gov/cdo-web/api/v2", accessType: "API", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1950, sectorsFed: ["agriculture", "food_security"], description: "Climate and weather data" },
  { sourceId: "SRC-087", name: "FEWS NET - Yemen", altName: "شبكة نظم الإنذار المبكر بالمجاعة - اليمن", publisher: "FEWS NET", webUrl: "https://fews.net", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["food_security", "agriculture"], isPrimary: true, description: "Famine early warning system" },
  
  // ============================================================================
  // TIER 3: NEWS & MEDIA
  // ============================================================================
  
  { sourceId: "SRC-088", name: "Reuters - Yemen", altName: "رويترز - اليمن", publisher: "Reuters", webUrl: "https://www.reuters.com", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], isMedia: true, description: "International news coverage" },
  { sourceId: "SRC-089", name: "Al Jazeera - Yemen", altName: "الجزيرة - اليمن", publisher: "Al Jazeera", webUrl: "https://www.aljazeera.com", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], isMedia: true, description: "Arabic news coverage" },
  { sourceId: "SRC-090", name: "BBC Arabic - Yemen", altName: "بي بي سي عربي - اليمن", publisher: "BBC", webUrl: "https://www.bbc.com/arabic", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], isMedia: true, description: "BBC Arabic news coverage" },
  { sourceId: "SRC-091", name: "Al Masdar Online", altName: "المصدر أونلاين", publisher: "Al Masdar", webUrl: "https://almasdaronline.com", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], isMedia: true, description: "Yemen news portal" },
  { sourceId: "SRC-092", name: "Saba News Agency", altName: "وكالة سبأ للأنباء", publisher: "Saba", webUrl: "https://www.sabanews.net", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "SANAA_DFA", historicalStart: 2010, sectorsFed: ["macro"], isMedia: true, description: "Sana'a official news agency" },
  
  // ============================================================================
  // TIER 3: BUSINESS & TRADE DATA
  // ============================================================================
  
  { sourceId: "SRC-093", name: "Yemen Chamber of Commerce", altName: "الغرفة التجارية اليمنية", publisher: "YCC", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["business", "trade"], description: "Business registration and trade data" },
  { sourceId: "SRC-094", name: "Aden Free Zone", altName: "المنطقة الحرة عدن", publisher: "AFZ", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "ADEN_IRG", historicalStart: 1991, sectorsFed: ["trade", "business"], description: "Free zone trade and investment data" },
  { sourceId: "SRC-095", name: "Yemen Customs Authority", altName: "مصلحة الجمارك اليمنية", publisher: "YCA", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["trade"], description: "Customs and import/export data" },
  
  // ============================================================================
  // TIER 3: TELECOMMUNICATIONS
  // ============================================================================
  
  { sourceId: "SRC-096", name: "Yemen Mobile", altName: "يمن موبايل", publisher: "Yemen Mobile", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2001, sectorsFed: ["business"], description: "Mobile telecommunications data" },
  { sourceId: "SRC-097", name: "MTN Yemen", altName: "إم تي إن اليمن", publisher: "MTN", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2006, sectorsFed: ["business"], description: "Mobile telecommunications data" },
  { sourceId: "SRC-098", name: "TeleYemen", altName: "تيلي يمن", publisher: "TeleYemen", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1990, sectorsFed: ["business"], description: "Fixed-line telecommunications data" },
  
  // ============================================================================
  // TIER 3: WATER & SANITATION
  // ============================================================================
  
  { sourceId: "SRC-099", name: "Yemen Water Authority", altName: "الهيئة العامة للمياه", publisher: "NWRA", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["humanitarian", "development"], description: "Water resources management data" },
  { sourceId: "SRC-100", name: "WASH Cluster Yemen", altName: "مجموعة المياه والصرف الصحي والنظافة - اليمن", publisher: "WASH Cluster", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian"], description: "Water, sanitation and hygiene cluster data" },
  
  // ============================================================================
  // ADDITIONAL SOURCES (101-200+)
  // ============================================================================
  
  // More UN Agencies
  { sourceId: "SRC-101", name: "UNESCO - Yemen", altName: "اليونسكو - اليمن", publisher: "UNESCO", webUrl: "https://en.unesco.org", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["education", "development"], description: "Education and cultural heritage data" },
  { sourceId: "SRC-102", name: "UNIDO - Yemen", altName: "منظمة الأمم المتحدة للتنمية الصناعية - اليمن", publisher: "UNIDO", webUrl: "https://www.unido.org", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["business", "development"], description: "Industrial development data" },
  { sourceId: "SRC-103", name: "UNEP - Yemen", altName: "برنامج الأمم المتحدة للبيئة - اليمن", publisher: "UNEP", webUrl: "https://www.unep.org", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["agriculture", "development"], description: "Environmental data" },
  
  // More Think Tanks
  { sourceId: "SRC-104", name: "RAND Corporation - Yemen", altName: "مؤسسة راند - اليمن", publisher: "RAND", webUrl: "https://www.rand.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["conflict", "development"], description: "Policy research on Yemen" },
  { sourceId: "SRC-105", name: "European Council on Foreign Relations - Yemen", altName: "المجلس الأوروبي للعلاقات الخارجية - اليمن", publisher: "ECFR", webUrl: "https://ecfr.eu", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], description: "European policy research on Yemen" },
  { sourceId: "SRC-106", name: "Overseas Development Institute", altName: "معهد التنمية الخارجية", publisher: "ODI", webUrl: "https://odi.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["development", "humanitarian"], description: "Development policy research" },
  
  // More NGOs
  { sourceId: "SRC-107", name: "CARE International - Yemen", altName: "كير الدولية - اليمن", publisher: "CARE", webUrl: "https://www.care.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["humanitarian", "food_security"], description: "Humanitarian operations" },
  { sourceId: "SRC-108", name: "IRC - Yemen", altName: "لجنة الإنقاذ الدولية - اليمن", publisher: "IRC", webUrl: "https://www.rescue.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["humanitarian", "health"], description: "Humanitarian operations" },
  { sourceId: "SRC-109", name: "Action Against Hunger - Yemen", altName: "العمل ضد الجوع - اليمن", publisher: "ACF", webUrl: "https://www.actionagainsthunger.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["food_security", "humanitarian"], description: "Nutrition and food security operations" },
  { sourceId: "SRC-110", name: "Mercy Corps - Yemen", altName: "ميرسي كوربس - اليمن", publisher: "Mercy Corps", webUrl: "https://www.mercycorps.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["humanitarian", "development"], description: "Humanitarian and development operations" },
  { sourceId: "SRC-111", name: "World Vision - Yemen", altName: "الرؤية العالمية - اليمن", publisher: "World Vision", webUrl: "https://www.worldvision.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["humanitarian", "development"], description: "Child-focused development operations" },
  { sourceId: "SRC-112", name: "Yemen Red Crescent Society", altName: "جمعية الهلال الأحمر اليمني", publisher: "YRCS", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["humanitarian", "health"], description: "Local humanitarian operations" },
  { sourceId: "SRC-113", name: "Social Fund for Development - Yemen", altName: "الصندوق الاجتماعي للتنمية - اليمن", publisher: "SFD", webUrl: "https://www.sfd-yemen.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["development"], description: "Social development fund data" },
  
  // More Donors
  { sourceId: "SRC-114", name: "EU - Yemen Aid", altName: "الاتحاد الأوروبي - معونات اليمن", publisher: "EU", webUrl: "https://ec.europa.eu", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["humanitarian", "development"], description: "EU humanitarian and development assistance" },
  { sourceId: "SRC-115", name: "UK FCDO - Yemen", altName: "وزارة الخارجية والتنمية البريطانية - اليمن", publisher: "UK FCDO", webUrl: "https://www.gov.uk/fcdo", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["humanitarian", "development"], description: "UK development assistance" },
  { sourceId: "SRC-116", name: "Saudi Development Fund - Yemen", altName: "صندوق التنمية السعودي - اليمن", publisher: "SDF", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["development"], description: "Saudi development assistance" },
  { sourceId: "SRC-117", name: "UAE Aid - Yemen", altName: "المعونات الإماراتية - اليمن", publisher: "UAE Aid", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian", "development"], description: "UAE humanitarian assistance" },
  { sourceId: "SRC-118", name: "Kuwait Fund - Yemen", altName: "الصندوق الكويتي للتنمية - اليمن", publisher: "KFAED", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["development"], description: "Kuwait development assistance" },
  
  // Academic Sources
  { sourceId: "SRC-119", name: "JSTOR - Yemen Studies", altName: "جيستور - دراسات اليمن", publisher: "JSTOR", webUrl: "https://www.jstor.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1900, sectorsFed: ["macro", "development", "conflict"], description: "Academic journal articles" },
  { sourceId: "SRC-120", name: "Google Scholar - Yemen Economics", altName: "جوجل سكولار - اقتصاد اليمن", publisher: "Google", webUrl: "https://scholar.google.com", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["macro", "development"], description: "Academic research aggregator" },
  { sourceId: "SRC-121", name: "SSRN - Yemen Papers", altName: "شبكة أبحاث العلوم الاجتماعية - أوراق اليمن", publisher: "SSRN", webUrl: "https://www.ssrn.com", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["macro", "development"], description: "Working papers repository" },
  { sourceId: "SRC-122", name: "RePEc - Yemen Economics", altName: "ريبيك - اقتصاد اليمن", publisher: "RePEc", webUrl: "https://ideas.repec.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "WEEKLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1990, sectorsFed: ["macro"], description: "Economics research papers" },
  { sourceId: "SRC-123", name: "Sana'a University - Economic Research", altName: "جامعة صنعاء - البحوث الاقتصادية", publisher: "Sana'a University", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["macro", "development"], description: "Local academic research" },
  { sourceId: "SRC-124", name: "Aden University - Economic Studies", altName: "جامعة عدن - الدراسات الاقتصادية", publisher: "Aden University", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["macro", "development"], description: "Local academic research" },
  
  // More Market Data
  { sourceId: "SRC-125", name: "Fixer.io", altName: "فيكسر للعملات", publisher: "Fixer", apiUrl: "https://data.fixer.io/api", accessType: "API", tier: "T3", status: "NEEDS_KEY", updateFrequency: "DAILY", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 2012, sectorsFed: ["currency"], description: "Exchange rate API" },
  { sourceId: "SRC-126", name: "Yemen Exchange Houses", altName: "محلات الصرافة اليمنية", publisher: "Various", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["currency"], description: "Local exchange rate data" },
  
  // Remittances
  { sourceId: "SRC-127", name: "World Bank - Remittances", altName: "البنك الدولي - التحويلات", publisher: "World Bank", apiUrl: "https://api.worldbank.org/v2", accessType: "API", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1970, sectorsFed: ["banking", "macro"], description: "Remittance flow data" },
  { sourceId: "SRC-128", name: "Yemen Exchange Companies", altName: "شركات الصرافة اليمنية", publisher: "Various", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["banking", "currency"], description: "Remittance and exchange data" },
  
  // Aviation
  { sourceId: "SRC-129", name: "Yemen Civil Aviation Authority", altName: "هيئة الطيران المدني اليمنية", publisher: "YCAA", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["trade", "business"], description: "Aviation statistics" },
  { sourceId: "SRC-130", name: "Yemenia Airways", altName: "الخطوط الجوية اليمنية", publisher: "Yemenia", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["trade", "business"], description: "Airline operations data" },
  
  // Education Cluster
  { sourceId: "SRC-131", name: "Yemen Ministry of Education Statistics", altName: "إحصاءات وزارة التربية والتعليم", publisher: "MoE Yemen", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["education", "development"], description: "Education statistics" },
  { sourceId: "SRC-132", name: "Education Cluster Yemen", altName: "مجموعة التعليم - اليمن", publisher: "Education Cluster", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["education", "humanitarian"], description: "Education cluster coordination data" },
  
  // Additional Development Banks
  { sourceId: "SRC-133", name: "ADB - Yemen", altName: "بنك التنمية الآسيوي - اليمن", publisher: "ADB", webUrl: "https://www.adb.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["development"], description: "Asian Development Bank data" },
  { sourceId: "SRC-134", name: "AfDB - Yemen", altName: "بنك التنمية الأفريقي - اليمن", publisher: "AfDB", webUrl: "https://www.afdb.org", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["development"], description: "African Development Bank data" },
  { sourceId: "SRC-135", name: "EBRD - Yemen", altName: "البنك الأوروبي لإعادة الإعمار والتنمية - اليمن", publisher: "EBRD", webUrl: "https://www.ebrd.com", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2000, sectorsFed: ["development"], description: "European Bank for Reconstruction and Development data" },
  
  // Social Media & Alternative Data
  { sourceId: "SRC-136", name: "Twitter/X - Yemen Trends", altName: "تويتر/إكس - اتجاهات اليمن", publisher: "X Corp", apiUrl: "https://api.twitter.com", accessType: "API", tier: "T4", status: "NEEDS_KEY", updateFrequency: "REALTIME", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], description: "Social media trends" },
  { sourceId: "SRC-137", name: "Google Trends - Yemen", altName: "جوجل تريندز - اليمن", publisher: "Google", webUrl: "https://trends.google.com", accessType: "WEB", tier: "T4", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2004, sectorsFed: ["macro"], description: "Search trend data" },
  
  // Global Terrorism Database
  { sourceId: "SRC-138", name: "Global Terrorism Database - Yemen", altName: "قاعدة بيانات الإرهاب العالمي - اليمن", publisher: "START", webUrl: "https://www.start.umd.edu/gtd", accessType: "WEB", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1970, sectorsFed: ["conflict"], description: "Terrorism incident data" },
  
  // Copernicus
  { sourceId: "SRC-139", name: "Copernicus - Yemen", altName: "كوبرنيكوس - اليمن", publisher: "ESA", apiUrl: "https://scihub.copernicus.eu/dhus", accessType: "API", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2014, sectorsFed: ["agriculture", "conflict"], description: "Earth observation satellite data" },
  { sourceId: "SRC-140", name: "Planet Labs - Yemen", altName: "بلانيت لابز - اليمن", publisher: "Planet", webUrl: "https://www.planet.com", accessType: "WEB", tier: "T3", status: "NEEDS_KEY", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["conflict", "agriculture"], description: "High-resolution satellite imagery" },
  
  // More News Sources
  { sourceId: "SRC-141", name: "AP News - Yemen", altName: "أسوشيتد برس - اليمن", publisher: "AP", webUrl: "https://apnews.com", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], isMedia: true, description: "International news coverage" },
  { sourceId: "SRC-142", name: "AFP - Yemen", altName: "وكالة الأنباء الفرنسية - اليمن", publisher: "AFP", webUrl: "https://www.afp.com", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], isMedia: true, description: "French news agency coverage" },
  { sourceId: "SRC-143", name: "Al Arabiya - Yemen", altName: "العربية - اليمن", publisher: "Al Arabiya", webUrl: "https://www.alarabiya.net", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro", "conflict"], isMedia: true, description: "Arabic news coverage" },
  { sourceId: "SRC-144", name: "Sky News Arabia - Yemen", altName: "سكاي نيوز عربية - اليمن", publisher: "Sky News Arabia", webUrl: "https://www.skynewsarabia.com", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2012, sectorsFed: ["macro", "conflict"], isMedia: true, description: "Arabic news coverage" },
  { sourceId: "SRC-145", name: "Al Sahwa Net", altName: "الصحوة نت", publisher: "Al Sahwa", webUrl: "https://alsahwa-yemen.net", accessType: "WEB", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["macro"], isMedia: true, description: "Yemen news portal" },
  
  // Commodity Prices
  { sourceId: "SRC-146", name: "Commodity Prices - Oil", altName: "أسعار السلع - النفط", publisher: "Various", accessType: "API", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1980, sectorsFed: ["energy", "prices"], description: "Global oil price data" },
  { sourceId: "SRC-147", name: "Commodity Prices - Wheat", altName: "أسعار السلع - القمح", publisher: "Various", accessType: "API", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1980, sectorsFed: ["food_security", "prices"], description: "Global wheat price data" },
  { sourceId: "SRC-148", name: "Commodity Prices - Rice", altName: "أسعار السلع - الأرز", publisher: "Various", accessType: "API", tier: "T3", status: "ACTIVE", updateFrequency: "DAILY", geographicScope: "Global", regimeApplicability: "GLOBAL", historicalStart: 1980, sectorsFed: ["food_security", "prices"], description: "Global rice price data" },
  
  // Yemen LNG
  { sourceId: "SRC-149", name: "Yemen LNG", altName: "الغاز الطبيعي المسال اليمني", publisher: "Yemen LNG", accessType: "MANUAL", tier: "T3", status: "INACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2009, historicalEnd: 2015, sectorsFed: ["energy"], description: "LNG production data (suspended)" },
  
  // Arab League
  { sourceId: "SRC-150", name: "Arab League - Economic Affairs", altName: "جامعة الدول العربية - الشؤون الاقتصادية", publisher: "Arab League", accessType: "MANUAL", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "Regional", regimeApplicability: "GLOBAL", historicalStart: 1945, sectorsFed: ["macro", "trade"], description: "Arab League economic data" },
  
  // Additional 50 sources to reach 200+
  { sourceId: "SRC-151", name: "Protection Cluster Yemen", altName: "مجموعة الحماية - اليمن", publisher: "Protection Cluster", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian"], description: "Protection cluster coordination data" },
  { sourceId: "SRC-152", name: "Shelter/NFI Cluster Yemen", altName: "مجموعة المأوى/المواد غير الغذائية - اليمن", publisher: "Shelter Cluster", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian"], description: "Shelter cluster coordination data" },
  { sourceId: "SRC-153", name: "Nutrition Cluster Yemen", altName: "مجموعة التغذية - اليمن", publisher: "Nutrition Cluster", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian", "food_security"], description: "Nutrition cluster coordination data" },
  { sourceId: "SRC-154", name: "Food Security Cluster Yemen", altName: "مجموعة الأمن الغذائي - اليمن", publisher: "FSC", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["food_security", "humanitarian"], description: "Food security cluster coordination data" },
  { sourceId: "SRC-155", name: "Logistics Cluster Yemen", altName: "مجموعة الإمداد - اليمن", publisher: "Logistics Cluster", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian"], description: "Logistics cluster coordination data" },
  { sourceId: "SRC-156", name: "Camp Coordination Cluster Yemen", altName: "مجموعة تنسيق المخيمات - اليمن", publisher: "CCCM Cluster", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian"], description: "Camp coordination data" },
  { sourceId: "SRC-157", name: "Early Recovery Cluster Yemen", altName: "مجموعة التعافي المبكر - اليمن", publisher: "Early Recovery Cluster", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian", "development"], description: "Early recovery cluster data" },
  { sourceId: "SRC-158", name: "Emergency Telecommunications Cluster Yemen", altName: "مجموعة الاتصالات في حالات الطوارئ - اليمن", publisher: "ETC", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian"], description: "Emergency telecommunications data" },
  { sourceId: "SRC-159", name: "Yemen Humanitarian Fund", altName: "صندوق اليمن الإنساني", publisher: "YHF", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian"], description: "Humanitarian pooled fund data" },
  { sourceId: "SRC-160", name: "CERF - Yemen", altName: "الصندوق المركزي للاستجابة لحالات الطوارئ - اليمن", publisher: "CERF", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2006, sectorsFed: ["humanitarian"], description: "Central Emergency Response Fund allocations" },
  { sourceId: "SRC-161", name: "Yemen Socioeconomic Update", altName: "التحديث الاجتماعي والاقتصادي لليمن", publisher: "UNDP/WB", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["macro", "development"], description: "Joint socioeconomic monitoring" },
  { sourceId: "SRC-162", name: "Yemen Economic Monitoring Brief", altName: "موجز الرصد الاقتصادي لليمن", publisher: "World Bank", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["macro"], description: "World Bank economic monitoring" },
  { sourceId: "SRC-163", name: "MOPIC Development Reports", altName: "تقارير التنمية - وزارة التخطيط", publisher: "MOPIC", accessType: "PDF", tier: "T0", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["development", "macro"], description: "Ministry of Planning development reports" },
  { sourceId: "SRC-164", name: "Yemen National Accounts", altName: "الحسابات القومية اليمنية", publisher: "CSO Yemen", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 1990, sectorsFed: ["macro"], description: "National accounts data" },
  { sourceId: "SRC-165", name: "Yemen Household Budget Survey", altName: "مسح ميزانية الأسرة اليمنية", publisher: "CSO Yemen", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "IRREGULAR", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2005, sectorsFed: ["demographics", "prices"], description: "Household expenditure survey" },
  { sourceId: "SRC-166", name: "Yemen Labor Force Survey", altName: "مسح القوى العاملة اليمنية", publisher: "CSO Yemen", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "IRREGULAR", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 1999, sectorsFed: ["labor"], description: "Labor force statistics" },
  { sourceId: "SRC-167", name: "Yemen Population Census", altName: "التعداد السكاني اليمني", publisher: "CSO Yemen", accessType: "MANUAL", tier: "T0", status: "ACTIVE", updateFrequency: "IRREGULAR", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 1994, sectorsFed: ["demographics"], description: "Population census data" },
  { sourceId: "SRC-168", name: "Yemen DHS", altName: "المسح الديموغرافي والصحي اليمني", publisher: "DHS Program", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "IRREGULAR", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1991, sectorsFed: ["health", "demographics"], description: "Demographic and Health Survey" },
  { sourceId: "SRC-169", name: "Yemen MICS", altName: "المسح العنقودي متعدد المؤشرات - اليمن", publisher: "UNICEF", accessType: "WEB", tier: "T1", status: "ACTIVE", updateFrequency: "IRREGULAR", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2006, sectorsFed: ["health", "education", "demographics"], description: "Multiple Indicator Cluster Survey" },
  { sourceId: "SRC-170", name: "Yemen SMART Survey", altName: "مسح سمارت - اليمن", publisher: "Various", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["food_security", "health"], description: "Standardized Monitoring and Assessment of Relief and Transitions" },
  { sourceId: "SRC-171", name: "Yemen Food Security Assessment", altName: "تقييم الأمن الغذائي في اليمن", publisher: "WFP/FAO", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["food_security"], description: "Comprehensive food security assessment" },
  { sourceId: "SRC-172", name: "Yemen Market Assessment", altName: "تقييم الأسواق في اليمن", publisher: "WFP", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["prices", "food_security"], description: "Market functionality assessment" },
  { sourceId: "SRC-173", name: "Yemen Cash Working Group", altName: "مجموعة عمل النقد - اليمن", publisher: "CWG", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian", "banking"], description: "Cash and voucher assistance data" },
  { sourceId: "SRC-174", name: "Yemen Minimum Expenditure Basket", altName: "سلة الحد الأدنى للإنفاق - اليمن", publisher: "CWG", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["prices", "humanitarian"], description: "Minimum expenditure basket tracking" },
  { sourceId: "SRC-175", name: "Yemen Fuel Prices Monitor", altName: "مراقبة أسعار الوقود - اليمن", publisher: "Various", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "WEEKLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["energy", "prices"], description: "Fuel price monitoring" },
  { sourceId: "SRC-176", name: "Yemen Electricity Sector", altName: "قطاع الكهرباء اليمني", publisher: "PEC", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["energy"], description: "Electricity generation and distribution data" },
  { sourceId: "SRC-177", name: "Yemen Solar Energy", altName: "الطاقة الشمسية في اليمن", publisher: "Various", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["energy"], description: "Solar energy adoption data" },
  { sourceId: "SRC-178", name: "Yemen Qat Economy", altName: "اقتصاد القات في اليمن", publisher: "Various", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["agriculture", "macro"], description: "Qat production and trade data" },
  { sourceId: "SRC-179", name: "Yemen Fisheries", altName: "قطاع الثروة السمكية اليمني", publisher: "MoF Yemen", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["agriculture", "trade"], description: "Fisheries production data" },
  { sourceId: "SRC-180", name: "Yemen Coffee Production", altName: "إنتاج البن اليمني", publisher: "Various", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["agriculture", "trade"], description: "Coffee production and export data" },
  { sourceId: "SRC-181", name: "Yemen Honey Production", altName: "إنتاج العسل اليمني", publisher: "Various", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["agriculture", "trade"], description: "Honey production data" },
  { sourceId: "SRC-182", name: "Yemen Construction Sector", altName: "قطاع البناء والتشييد اليمني", publisher: "Various", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["business", "development"], description: "Construction activity data" },
  { sourceId: "SRC-183", name: "Yemen Real Estate", altName: "العقارات في اليمن", publisher: "Various", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["business", "prices"], description: "Real estate market data" },
  { sourceId: "SRC-184", name: "Yemen Insurance Sector", altName: "قطاع التأمين اليمني", publisher: "Various", accessType: "MANUAL", tier: "T3", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["banking", "business"], description: "Insurance sector data" },
  { sourceId: "SRC-185", name: "Yemen Stock Exchange", altName: "سوق الأوراق المالية اليمني", publisher: "YSE", accessType: "MANUAL", tier: "T3", status: "INACTIVE", updateFrequency: "DAILY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2009, historicalEnd: 2015, sectorsFed: ["banking"], description: "Stock exchange data (suspended)" },
  { sourceId: "SRC-186", name: "Yemen Tax Authority", altName: "مصلحة الضرائب اليمنية", publisher: "YTA", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["fiscal", "business"], description: "Tax revenue data" },
  { sourceId: "SRC-187", name: "Yemen Zakat Authority", altName: "الهيئة العامة للزكاة", publisher: "Zakat Authority", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["fiscal"], description: "Zakat collection data" },
  { sourceId: "SRC-188", name: "Yemen Social Welfare Fund", altName: "صندوق الرعاية الاجتماعية", publisher: "SWF", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "BOTH", historicalStart: 2010, sectorsFed: ["development", "humanitarian"], description: "Social protection data" },
  { sourceId: "SRC-189", name: "Yemen Public Works Project", altName: "مشروع الأشغال العامة", publisher: "PWP", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["development"], description: "Public works project data" },
  { sourceId: "SRC-190", name: "Yemen Small Enterprise Development", altName: "تنمية المنشآت الصغيرة", publisher: "SEDF", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["business", "development"], description: "Small enterprise development data" },
  { sourceId: "SRC-191", name: "Yemen Women Economic Empowerment", altName: "التمكين الاقتصادي للمرأة في اليمن", publisher: "Various", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["development", "labor"], description: "Women's economic participation data" },
  { sourceId: "SRC-192", name: "Yemen Youth Employment", altName: "توظيف الشباب في اليمن", publisher: "Various", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["labor", "development"], description: "Youth employment data" },
  { sourceId: "SRC-193", name: "Yemen Diaspora Remittances", altName: "تحويلات المغتربين اليمنيين", publisher: "Various", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["banking", "macro"], description: "Diaspora remittance flows" },
  { sourceId: "SRC-194", name: "Yemen Private Sector Assessment", altName: "تقييم القطاع الخاص اليمني", publisher: "IFC/WB", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "IRREGULAR", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["business"], description: "Private sector assessment" },
  { sourceId: "SRC-195", name: "Yemen Investment Climate", altName: "مناخ الاستثمار في اليمن", publisher: "Various", accessType: "PDF", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["business", "macro"], description: "Investment climate assessment" },
  { sourceId: "SRC-196", name: "Yemen FDI Data", altName: "بيانات الاستثمار الأجنبي المباشر في اليمن", publisher: "UNCTAD", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1970, sectorsFed: ["macro", "business"], description: "Foreign direct investment data" },
  { sourceId: "SRC-197", name: "Yemen Debt Data", altName: "بيانات الدين اليمني", publisher: "World Bank", accessType: "API", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 1970, sectorsFed: ["fiscal", "macro"], description: "External debt statistics" },
  { sourceId: "SRC-198", name: "Yemen Aid Effectiveness", altName: "فعالية المعونات في اليمن", publisher: "MOPIC", accessType: "MANUAL", tier: "T2", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["development"], description: "Aid effectiveness monitoring" },
  { sourceId: "SRC-199", name: "Yemen Reconstruction Needs", altName: "احتياجات إعادة الإعمار في اليمن", publisher: "WB/UN/IsDB/EU", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "IRREGULAR", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["development", "humanitarian"], description: "Reconstruction needs assessment" },
  { sourceId: "SRC-200", name: "Yemen Peace Process Monitoring", altName: "مراقبة عملية السلام في اليمن", publisher: "UN", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["conflict"], description: "Peace process monitoring" },
  { sourceId: "SRC-201", name: "Yemen Sanctions Monitoring", altName: "مراقبة العقوبات على اليمن", publisher: "UN Panel of Experts", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["conflict", "trade"], description: "Sanctions monitoring reports" },
  { sourceId: "SRC-202", name: "Yemen Arms Embargo Monitoring", altName: "مراقبة حظر الأسلحة على اليمن", publisher: "UN Panel of Experts", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "ANNUAL", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["conflict"], description: "Arms embargo monitoring" },
  { sourceId: "SRC-203", name: "Yemen Human Rights Reports", altName: "تقارير حقوق الإنسان في اليمن", publisher: "OHCHR", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "QUARTERLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian", "conflict"], description: "Human rights monitoring" },
  { sourceId: "SRC-204", name: "Yemen GBV Data", altName: "بيانات العنف القائم على النوع الاجتماعي في اليمن", publisher: "GBV Sub-Cluster", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian"], description: "Gender-based violence data" },
  { sourceId: "SRC-205", name: "Yemen Child Protection Data", altName: "بيانات حماية الطفل في اليمن", publisher: "CP Sub-Cluster", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian"], description: "Child protection data" },
  { sourceId: "SRC-206", name: "Yemen Mine Action", altName: "إزالة الألغام في اليمن", publisher: "YEMAC", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["humanitarian", "conflict"], description: "Mine action data" },
  { sourceId: "SRC-207", name: "Yemen Cholera Response", altName: "الاستجابة للكوليرا في اليمن", publisher: "WHO/UNICEF", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "WEEKLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2017, sectorsFed: ["health", "humanitarian"], description: "Cholera outbreak response data" },
  { sourceId: "SRC-208", name: "Yemen COVID-19 Response", altName: "الاستجابة لكوفيد-19 في اليمن", publisher: "WHO", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "WEEKLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2020, sectorsFed: ["health", "humanitarian"], description: "COVID-19 response data" },
  { sourceId: "SRC-209", name: "Yemen Vaccination Data", altName: "بيانات التطعيم في اليمن", publisher: "WHO/UNICEF", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "MONTHLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2010, sectorsFed: ["health"], description: "Vaccination coverage data" },
  { sourceId: "SRC-210", name: "Yemen Disease Surveillance", altName: "مراقبة الأمراض في اليمن", publisher: "WHO", accessType: "PDF", tier: "T1", status: "ACTIVE", updateFrequency: "WEEKLY", geographicScope: "National", regimeApplicability: "MIXED", historicalStart: 2015, sectorsFed: ["health"], description: "Disease surveillance data" },
];

async function populateSources() {
  console.log("Starting source registry population...");
  console.log(`Total sources to insert: ${YEMEN_DATA_SOURCES.length}`);
  
  let inserted = 0;
  let updated = 0;
  let errors = 0;
  
  for (const source of YEMEN_DATA_SOURCES) {
    try {
      // Check if source already exists by sourceId
      const existing = await db
        .select()
        .from(sourceRegistry)
        .where(eq(sourceRegistry.sourceId, source.sourceId))
        .limit(1);
      
      const sourceData = {
        sourceId: source.sourceId,
        name: source.name,
        altName: source.altName || null,
        publisher: source.publisher || null,
        apiUrl: source.apiUrl || null,
        webUrl: source.webUrl || null,
        accessType: source.accessType,
        tier: source.tier,
        status: source.status,
        updateFrequency: source.updateFrequency,
        geographicScope: source.geographicScope || null,
        regimeApplicability: source.regimeApplicability || "GLOBAL",
        historicalStart: source.historicalStart || null,
        historicalEnd: source.historicalEnd || null,
        description: source.description || null,
        sectorsFed: source.sectorsFed || [],
        isPrimary: source.isPrimary || false,
        isMedia: source.isMedia || false,
        updatedAt: new Date(),
      };
      
      if (existing.length > 0) {
        // Update existing
        await db
          .update(sourceRegistry)
          .set(sourceData)
          .where(eq(sourceRegistry.id, existing[0].id));
        updated++;
      } else {
        // Insert new
        await db.insert(sourceRegistry).values({
          ...sourceData,
          createdAt: new Date(),
        });
        inserted++;
      }
      
      if ((inserted + updated) % 20 === 0) {
        console.log(`Progress: ${inserted} inserted, ${updated} updated`);
      }
    } catch (error) {
      console.error(`Error processing source ${source.name}:`, error);
      errors++;
    }
  }
  
  console.log("\n=== Source Registry Population Complete ===");
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total sources in registry: ${inserted + updated}`);
}

// Run the population
populateSources()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
