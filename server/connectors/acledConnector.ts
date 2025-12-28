/**
 * ACLED (Armed Conflict Location & Event Data) Connector
 * 
 * Connects to ACLED's API for:
 * - Conflict events data
 * - Fatality statistics
 * - Actor information
 * - Geographic conflict mapping
 * 
 * Documentation: https://acleddata.com/data-export-tool/
 * Note: ACLED requires API key for access
 */

const ACLED_BASE_URL = "https://api.acleddata.com/acled/read";

// Yemen country code in ACLED system
const YEMEN_COUNTRY = "Yemen";

interface ACLEDEvent {
  event_id_cnty: string;
  event_date: string;
  year: number;
  event_type: string;
  sub_event_type: string;
  actor1: string;
  actor2: string;
  admin1: string; // Governorate
  admin2: string; // District
  admin3: string;
  location: string;
  latitude: number;
  longitude: number;
  fatalities: number;
  notes: string;
  source: string;
  source_scale: string;
  timestamp: number;
}

interface ACLEDSummary {
  totalEvents: number;
  totalFatalities: number;
  eventsByType: Record<string, number>;
  eventsByGovernorate: Record<string, number>;
  fatalitiesByGovernorate: Record<string, number>;
  monthlyTrend: Array<{ month: string; events: number; fatalities: number }>;
}

// Event type categories
const ACLED_EVENT_TYPES = [
  "Battles",
  "Explosions/Remote violence",
  "Violence against civilians",
  "Protests",
  "Riots",
  "Strategic developments",
];

// Yemen governorates
const YEMEN_GOVERNORATES = [
  "Aden",
  "Abyan",
  "Al Bayda",
  "Al Dhale'e",
  "Al Hudaydah",
  "Al Jawf",
  "Al Mahrah",
  "Al Mahwit",
  "Amanat Al Asimah",
  "Amran",
  "Dhamar",
  "Hadramawt",
  "Hajjah",
  "Ibb",
  "Lahij",
  "Ma'rib",
  "Raymah",
  "Sa'ada",
  "Sana'a",
  "Shabwah",
  "Socotra",
  "Ta'iz",
];

/**
 * Fetch conflict events from ACLED API
 * Note: Requires ACLED_API_KEY and ACLED_EMAIL environment variables
 */
async function fetchACLEDEvents(
  startDate: string,
  endDate: string,
  eventType?: string,
  governorate?: string
): Promise<ACLEDEvent[]> {
  const events: ACLEDEvent[] = [];
  
  const apiKey = process.env.ACLED_API_KEY;
  const email = process.env.ACLED_EMAIL;
  
  if (!apiKey || !email) {
    console.warn("[ACLED Connector] API key or email not configured. Using sample data.");
    return getSampleACLEDData(startDate, endDate);
  }
  
  try {
    const params = new URLSearchParams({
      key: apiKey,
      email: email,
      country: YEMEN_COUNTRY,
      event_date: `${startDate}|${endDate}`,
      event_date_where: "BETWEEN",
      limit: "0", // No limit
    });
    
    if (eventType) {
      params.append("event_type", eventType);
    }
    if (governorate) {
      params.append("admin1", governorate);
    }
    
    const url = `${ACLED_BASE_URL}?${params}`;
    
    console.log(`[ACLED Connector] Fetching events from ${startDate} to ${endDate}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[ACLED Connector] HTTP error: ${response.status}`);
      return events;
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      for (const record of data.data) {
        events.push({
          event_id_cnty: record.event_id_cnty,
          event_date: record.event_date,
          year: parseInt(record.year),
          event_type: record.event_type,
          sub_event_type: record.sub_event_type,
          actor1: record.actor1,
          actor2: record.actor2 || "",
          admin1: record.admin1,
          admin2: record.admin2 || "",
          admin3: record.admin3 || "",
          location: record.location,
          latitude: parseFloat(record.latitude),
          longitude: parseFloat(record.longitude),
          fatalities: parseInt(record.fatalities) || 0,
          notes: record.notes || "",
          source: record.source,
          source_scale: record.source_scale || "",
          timestamp: record.timestamp,
        });
      }
    }
    
    console.log(`[ACLED Connector] Retrieved ${events.length} events`);
    
  } catch (error) {
    console.error(`[ACLED Connector] Error fetching events:`, error);
  }
  
  return events;
}

/**
 * Generate sample ACLED data for development/demo
 */
function getSampleACLEDData(startDate: string, endDate: string): ACLEDEvent[] {
  const events: ACLEDEvent[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Generate realistic sample data
  const sampleEvents = [
    { type: "Battles", subtype: "Armed clash", governorate: "Ma'rib", fatalities: [0, 5, 10, 15, 20] },
    { type: "Explosions/Remote violence", subtype: "Air/drone strike", governorate: "Sa'ada", fatalities: [0, 3, 8, 12] },
    { type: "Violence against civilians", subtype: "Attack", governorate: "Ta'iz", fatalities: [0, 1, 2, 3] },
    { type: "Protests", subtype: "Peaceful protest", governorate: "Aden", fatalities: [0] },
    { type: "Strategic developments", subtype: "Agreement", governorate: "Sana'a", fatalities: [0] },
  ];
  
  let eventId = 1;
  const current = new Date(start);
  
  while (current <= end) {
    // Generate 2-5 events per day
    const eventsPerDay = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < eventsPerDay; i++) {
      const sample = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      const fatalities = sample.fatalities[Math.floor(Math.random() * sample.fatalities.length)];
      
      events.push({
        event_id_cnty: `YEM${eventId++}`,
        event_date: current.toISOString().split("T")[0],
        year: current.getFullYear(),
        event_type: sample.type,
        sub_event_type: sample.subtype,
        actor1: "Government of Yemen",
        actor2: "Houthi forces",
        admin1: sample.governorate,
        admin2: "",
        admin3: "",
        location: sample.governorate,
        latitude: 15.0 + Math.random() * 3,
        longitude: 44.0 + Math.random() * 5,
        fatalities: fatalities,
        notes: `Sample event in ${sample.governorate}`,
        source: "Sample Data",
        source_scale: "National",
        timestamp: current.getTime(),
      });
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return events;
}

/**
 * Calculate summary statistics from ACLED events
 */
export function calculateACLEDSummary(events: ACLEDEvent[]): ACLEDSummary {
  const eventsByType: Record<string, number> = {};
  const eventsByGovernorate: Record<string, number> = {};
  const fatalitiesByGovernorate: Record<string, number> = {};
  const monthlyData: Record<string, { events: number; fatalities: number }> = {};
  
  let totalFatalities = 0;
  
  for (const event of events) {
    // By type
    eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
    
    // By governorate
    eventsByGovernorate[event.admin1] = (eventsByGovernorate[event.admin1] || 0) + 1;
    fatalitiesByGovernorate[event.admin1] = (fatalitiesByGovernorate[event.admin1] || 0) + event.fatalities;
    
    // Monthly trend
    const month = event.event_date.substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { events: 0, fatalities: 0 };
    }
    monthlyData[month].events++;
    monthlyData[month].fatalities += event.fatalities;
    
    totalFatalities += event.fatalities;
  }
  
  // Convert monthly data to array
  const monthlyTrend = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      events: data.events,
      fatalities: data.fatalities,
    }));
  
  return {
    totalEvents: events.length,
    totalFatalities,
    eventsByType,
    eventsByGovernorate,
    fatalitiesByGovernorate,
    monthlyTrend,
  };
}

/**
 * Ingest ACLED data for Yemen
 */
export async function ingestACLEDData(
  startDate: string = "2015-01-01",
  endDate: string = new Date().toISOString().split("T")[0]
): Promise<{
  success: boolean;
  recordsProcessed: number;
  summary: ACLEDSummary;
  errors: string[];
}> {
  const errors: string[] = [];
  
  console.log(`[ACLED Connector] Starting ingestion for Yemen (${startDate} to ${endDate})`);
  
  try {
    const events = await fetchACLEDEvents(startDate, endDate);
    const summary = calculateACLEDSummary(events);
    
    console.log(`[ACLED Connector] Completed. Processed ${events.length} events`);
    console.log(`[ACLED Connector] Total fatalities: ${summary.totalFatalities}`);
    
    return {
      success: true,
      recordsProcessed: events.length,
      summary,
      errors,
    };
    
  } catch (error) {
    const errorMsg = `Error during ingestion: ${error}`;
    console.error(`[ACLED Connector] ${errorMsg}`);
    errors.push(errorMsg);
    
    return {
      success: false,
      recordsProcessed: 0,
      summary: {
        totalEvents: 0,
        totalFatalities: 0,
        eventsByType: {},
        eventsByGovernorate: {},
        fatalitiesByGovernorate: {},
        monthlyTrend: [],
      },
      errors,
    };
  }
}

/**
 * Get conflict events for a specific governorate
 */
export async function getGovernorateConflictData(
  governorate: string,
  startDate?: string,
  endDate?: string
): Promise<ACLEDEvent[]> {
  const start = startDate || "2015-01-01";
  const end = endDate || new Date().toISOString().split("T")[0];
  
  return fetchACLEDEvents(start, end, undefined, governorate);
}

/**
 * Get conflict events by type
 */
export async function getConflictByType(
  eventType: string,
  startDate?: string,
  endDate?: string
): Promise<ACLEDEvent[]> {
  const start = startDate || "2015-01-01";
  const end = endDate || new Date().toISOString().split("T")[0];
  
  return fetchACLEDEvents(start, end, eventType);
}

/**
 * Get connector status
 */
export function getACLEDConnectorStatus() {
  const hasCredentials = !!(process.env.ACLED_API_KEY && process.env.ACLED_EMAIL);
  
  return {
    name: "ACLED",
    nameAr: "بيانات الصراع المسلح",
    baseUrl: ACLED_BASE_URL,
    country: YEMEN_COUNTRY,
    eventTypes: ACLED_EVENT_TYPES,
    governorates: YEMEN_GOVERNORATES,
    hasCredentials,
    lastUpdated: null as Date | null,
  };
}

export default {
  ingestACLEDData,
  getGovernorateConflictData,
  getConflictByType,
  calculateACLEDSummary,
  getACLEDConnectorStatus,
};
