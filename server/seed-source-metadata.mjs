/**
 * Seed Source Metadata - Contacts and API Registration Instructions
 * Production-ready seed script for YETO platform
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

// Parse connection string
function parseConnectionString(url) {
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
  const match = url.match(regex);
  if (!match) throw new Error('Invalid DATABASE_URL format');
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    ssl: { rejectUnauthorized: true }
  };
}

// Source contacts data - comprehensive contact information for each source
const sourceContacts = [
  // HDX HAPI
  { acronym: 'HDX', contactType: 'api_support', email: 'hdx@un.org', department: 'Data Services', isPrimary: true },
  { acronym: 'HDX', contactType: 'general', email: 'centrehumdata@un.org', department: 'Centre for Humanitarian Data' },
  
  // World Food Programme
  { acronym: 'WFP', contactType: 'data_team', email: 'vam.info@wfp.org', department: 'Vulnerability Analysis and Mapping', isPrimary: true },
  { acronym: 'WFP', contactType: 'general', email: 'wfpinfo@wfp.org', department: 'Public Information' },
  
  // FAO
  { acronym: 'FAO', contactType: 'api_support', email: 'faostat@fao.org', department: 'Statistics Division', isPrimary: true },
  { acronym: 'FAO', contactType: 'data_team', email: 'giews@fao.org', department: 'Global Information and Early Warning System' },
  
  // IOM DTM
  { acronym: 'IOM', contactType: 'data_team', email: 'dtmyemen@iom.int', department: 'Displacement Tracking Matrix Yemen', isPrimary: true },
  { acronym: 'IOM', contactType: 'general', email: 'iomyemen@iom.int', department: 'IOM Yemen Mission' },
  
  // UNICEF
  { acronym: 'UNICEF', contactType: 'data_team', email: 'data@unicef.org', department: 'Data and Analytics', isPrimary: true },
  { acronym: 'UNICEF', contactType: 'general', email: 'sanaa@unicef.org', department: 'UNICEF Yemen Office' },
  
  // UNDP
  { acronym: 'UNDP', contactType: 'api_support', email: 'opendata@undp.org', department: 'Open Data Team', isPrimary: true },
  { acronym: 'UNDP', contactType: 'general', email: 'registry.ye@undp.org', department: 'UNDP Yemen' },
  
  // Yemen Data Project
  { acronym: 'YDP', contactType: 'general', email: 'info@yemendataproject.org', department: 'Research Team', isPrimary: true },
  { acronym: 'YDP', contactType: 'partnership', email: 'partnerships@yemendataproject.org', department: 'Partnerships' },
  
  // Sana'a Center
  { acronym: 'SCSS', contactType: 'general', email: 'info@sanaacenter.org', department: 'Research', isPrimary: true },
  { acronym: 'SCSS', contactType: 'partnership', email: 'partnerships@sanaacenter.org', department: 'Partnerships' },
  
  // Yemen Polling Center
  { acronym: 'YPC', contactType: 'general', email: 'info@yemenpolling.org', department: 'Research', isPrimary: true },
  
  // CSO Yemen
  { acronym: 'CSO', contactType: 'general', email: 'info@cso-ye.org', department: 'Statistics', isPrimary: true },
  
  // ReliefWeb
  { acronym: 'RW', contactType: 'api_support', email: 'api@reliefweb.int', department: 'API Support', isPrimary: true },
  { acronym: 'RW', contactType: 'general', email: 'feedback@reliefweb.int', department: 'Editorial' },
  
  // Food Security Cluster
  { acronym: 'FSC', contactType: 'data_team', email: 'fscluster.yemen@wfp.org', department: 'Yemen Cluster', isPrimary: true },
  
  // World Bank
  { acronym: 'WB', contactType: 'api_support', email: 'data@worldbank.org', department: 'Development Data Group', isPrimary: true },
  { acronym: 'WB', contactType: 'general', email: 'yemen@worldbank.org', department: 'Yemen Country Office' },
  
  // Central Bank of Yemen - Aden
  { acronym: 'CBY-Aden', contactType: 'general', email: 'info@cby-ye.com', department: 'Public Relations', isPrimary: true },
  { acronym: 'CBY-Aden', contactType: 'data_team', email: 'statistics@cby-ye.com', department: 'Statistics Department' },
  
  // Central Bank of Yemen - Sanaa
  { acronym: 'CBY-Sanaa', contactType: 'general', email: 'info@cby.gov.ye', department: 'Public Relations', isPrimary: true },
];

// API Registration Instructions - comprehensive step-by-step guides
const apiInstructions = [
  {
    acronym: 'HDX',
    registrationUrl: 'https://hapi.humdata.org/docs',
    documentationUrl: 'https://hapi.humdata.org/docs',
    credentialType: 'api_key',
    requiresApproval: false,
    approvalTimeline: 'Instant',
    keyFormat: 'app_identifier parameter',
    keyLocation: 'query_param',
    keyHeaderName: 'app_identifier',
    defaultRateLimit: 1000,
    rateLimitPeriod: 'day',
    exampleRequest: `curl -X GET "https://hapi.humdata.org/api/v2/themes/food-security?location_code=YEM&app_identifier=YOUR_APP_NAME"`,
    steps: [
      { stepNumber: 1, title: 'Visit HDX HAPI Documentation', description: 'Go to https://hapi.humdata.org/docs to access the API documentation', tips: ['No account required for basic access'] },
      { stepNumber: 2, title: 'Choose an App Identifier', description: 'Select a unique identifier for your application (e.g., "yeto-platform")', tips: ['Use a descriptive name', 'Avoid special characters'] },
      { stepNumber: 3, title: 'Add to API Calls', description: 'Include app_identifier parameter in all API requests', tips: ['Required for all endpoints', 'Helps track usage'] },
      { stepNumber: 4, title: 'Test Your Access', description: 'Make a test request to verify access', tips: ['Start with /api/v2/themes endpoint', 'Check rate limit headers in response'] }
    ],
    commonIssues: ['Rate limit exceeded - wait 24 hours', 'Invalid location code - use ISO3 codes', 'Missing app_identifier parameter'],
    troubleshooting: 'If you encounter 429 errors, reduce request frequency. For 404 errors, verify endpoint path and parameters.'
  },
  {
    acronym: 'WB',
    registrationUrl: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889386-developer-information-overview',
    documentationUrl: 'https://datahelpdesk.worldbank.org/knowledgebase/topics/125589-developer-information',
    credentialType: 'api_key',
    requiresApproval: false,
    approvalTimeline: 'Instant - No key required',
    keyFormat: 'No API key required',
    keyLocation: 'none',
    defaultRateLimit: 500,
    rateLimitPeriod: 'minute',
    exampleRequest: `curl -X GET "https://api.worldbank.org/v2/country/YEM/indicator/NY.GDP.MKTP.CD?format=json&date=2010:2024"`,
    steps: [
      { stepNumber: 1, title: 'Access API Directly', description: 'World Bank API is publicly accessible without authentication', tips: ['No registration required', 'Free unlimited access'] },
      { stepNumber: 2, title: 'Review Documentation', description: 'Visit the developer portal to understand available endpoints', tips: ['Use format=json for easier parsing', 'Check available indicators'] },
      { stepNumber: 3, title: 'Construct Queries', description: 'Build queries using country codes and indicator IDs', tips: ['Yemen code is YEM', 'Use date ranges with date=2010:2024'] },
      { stepNumber: 4, title: 'Handle Pagination', description: 'Large datasets are paginated - use page and per_page parameters', tips: ['Default is 50 records per page', 'Maximum is 32000 per page'] }
    ],
    commonIssues: ['Indicator not found - verify indicator code', 'Empty response - check date range', 'Rate limiting - reduce request frequency'],
    troubleshooting: 'For empty responses, verify the indicator exists for Yemen. Use the indicator search endpoint to find valid indicators.'
  },
  {
    acronym: 'RW',
    registrationUrl: 'https://apidoc.reliefweb.int/',
    documentationUrl: 'https://apidoc.reliefweb.int/',
    credentialType: 'api_key',
    requiresApproval: false,
    approvalTimeline: 'Instant - No key required',
    keyFormat: 'appname header recommended',
    keyLocation: 'header',
    keyHeaderName: 'appname',
    defaultRateLimit: 1000,
    rateLimitPeriod: 'day',
    exampleRequest: `curl -X GET "https://api.reliefweb.int/v1/reports?appname=yeto-platform&filter[field]=country&filter[value]=Yemen&limit=10"`,
    steps: [
      { stepNumber: 1, title: 'Review API Documentation', description: 'Visit https://apidoc.reliefweb.int/ for complete API reference', tips: ['No registration required', 'Appname header is recommended but optional'] },
      { stepNumber: 2, title: 'Set Appname Header', description: 'Add appname header to identify your application', tips: ['Helps ReliefWeb track usage', 'Required for high-volume access'] },
      { stepNumber: 3, title: 'Build Queries', description: 'Use filter parameters to query Yemen-specific data', tips: ['Filter by country=Yemen', 'Use date filters for time ranges'] },
      { stepNumber: 4, title: 'Parse Responses', description: 'Handle JSON responses with proper pagination', tips: ['Use offset and limit for pagination', 'Check total count in response'] }
    ],
    commonIssues: ['Filter syntax errors - use proper field names', 'Rate limiting - add appname header', 'Large responses - use pagination'],
    troubleshooting: 'For filter errors, refer to the API documentation for valid field names. Use the /v1/reports/facets endpoint to discover available filter values.'
  },
  {
    acronym: 'FAO',
    registrationUrl: 'https://www.fao.org/faostat/en/#data',
    documentationUrl: 'https://fenixservices.fao.org/faostat/static/documents/FAOSTAT_API_DOCUMENTATION.pdf',
    credentialType: 'api_key',
    requiresApproval: false,
    approvalTimeline: 'Instant - No key required',
    keyFormat: 'No API key required',
    keyLocation: 'none',
    defaultRateLimit: 100,
    rateLimitPeriod: 'minute',
    exampleRequest: `curl -X GET "https://fenixservices.fao.org/faostat/api/v1/en/data/QCL?area=249&element=5510&item=15&year=2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020"`,
    steps: [
      { stepNumber: 1, title: 'Access FAOSTAT', description: 'Visit https://www.fao.org/faostat/en/#data to explore available datasets', tips: ['Yemen area code is 249', 'Browse datasets to find relevant indicators'] },
      { stepNumber: 2, title: 'Review API Documentation', description: 'Download the API documentation PDF for detailed endpoint information', tips: ['API uses area codes, not country names', 'Element codes define the measurement type'] },
      { stepNumber: 3, title: 'Construct API Calls', description: 'Build queries using domain, area, element, item, and year parameters', tips: ['Use comma-separated values for multiple years', 'QCL domain is for crop production'] },
      { stepNumber: 4, title: 'Handle Responses', description: 'Parse JSON responses containing data arrays', tips: ['Data is in the data array', 'Metadata is in the metadata object'] }
    ],
    commonIssues: ['Invalid area code - use 249 for Yemen', 'Element not found - check domain documentation', 'Empty data - verify year range'],
    troubleshooting: 'For empty responses, verify the dataset covers Yemen and the requested years. Some datasets have limited geographic coverage.'
  },
  {
    acronym: 'IOM',
    registrationUrl: 'https://dtm.iom.int/data-and-analysis',
    documentationUrl: 'https://dtm.iom.int/api/v3/docs',
    credentialType: 'api_key',
    requiresApproval: true,
    approvalTimeline: '1-2 weeks',
    keyFormat: 'Bearer token',
    keyLocation: 'header',
    keyHeaderName: 'Authorization',
    defaultRateLimit: 1000,
    rateLimitPeriod: 'day',
    exampleRequest: `curl -X GET "https://dtm.iom.int/api/v3/idps?country=YEM" -H "Authorization: Bearer YOUR_TOKEN"`,
    steps: [
      { stepNumber: 1, title: 'Contact DTM Team', description: 'Email dtmyemen@iom.int to request API access', tips: ['Explain your use case clearly', 'Mention institutional affiliation'] },
      { stepNumber: 2, title: 'Submit Request Form', description: 'Complete the data request form provided by DTM', tips: ['Specify data types needed', 'Include project timeline'] },
      { stepNumber: 3, title: 'Await Approval', description: 'Wait for approval and credentials from DTM team', tips: ['Typical response time is 1-2 weeks', 'Follow up if no response after 2 weeks'] },
      { stepNumber: 4, title: 'Configure Access', description: 'Use provided Bearer token in Authorization header', tips: ['Token may expire - check validity', 'Store token securely'] }
    ],
    commonIssues: ['Access denied - verify token validity', 'Rate limit exceeded - reduce request frequency', 'Data not available - check coverage dates'],
    troubleshooting: 'If access is denied, contact dtmyemen@iom.int to verify your credentials. For missing data, check the DTM coverage map for Yemen.'
  },
  {
    acronym: 'UNICEF',
    registrationUrl: 'https://data.unicef.org/resources/data-api/',
    documentationUrl: 'https://sdmx.data.unicef.org/ws/public/sdmxapi/rest',
    credentialType: 'api_key',
    requiresApproval: false,
    approvalTimeline: 'Instant - No key required',
    keyFormat: 'No API key required',
    keyLocation: 'none',
    defaultRateLimit: 500,
    rateLimitPeriod: 'hour',
    exampleRequest: `curl -X GET "https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/data/UNICEF,CME,1.0/YEM..?format=sdmx-json"`,
    steps: [
      { stepNumber: 1, title: 'Access UNICEF Data Portal', description: 'Visit https://data.unicef.org to explore available indicators', tips: ['No registration required', 'API uses SDMX standard'] },
      { stepNumber: 2, title: 'Learn SDMX Format', description: 'Understand SDMX query structure: agency,dataflow,version/key', tips: ['Yemen code is YEM', 'Use wildcards (..) for all values'] },
      { stepNumber: 3, title: 'Build Queries', description: 'Construct SDMX queries for specific indicators', tips: ['CME is Child Mortality Estimates', 'MNCH is Maternal and Child Health'] },
      { stepNumber: 4, title: 'Parse SDMX Responses', description: 'Handle SDMX-JSON or SDMX-ML response formats', tips: ['Use format=sdmx-json for easier parsing', 'Data is in dataSets array'] }
    ],
    commonIssues: ['Invalid dataflow - check available dataflows', 'SDMX parsing errors - use JSON format', 'Missing data - verify indicator coverage'],
    troubleshooting: 'For SDMX errors, use the /dataflow endpoint to list available dataflows. For parsing issues, switch to sdmx-json format.'
  },
  {
    acronym: 'UNDP',
    registrationUrl: 'https://open.undp.org/api',
    documentationUrl: 'https://open.undp.org/api',
    credentialType: 'api_key',
    requiresApproval: false,
    approvalTimeline: 'Instant - No key required',
    keyFormat: 'No API key required',
    keyLocation: 'none',
    defaultRateLimit: 200,
    rateLimitPeriod: 'hour',
    exampleRequest: `curl -X GET "https://api.open.undp.org/api/project_list?country=YEM&year=2024"`,
    steps: [
      { stepNumber: 1, title: 'Access Open UNDP Portal', description: 'Visit https://open.undp.org to explore project data', tips: ['No registration required', 'Data covers all UNDP projects'] },
      { stepNumber: 2, title: 'Review API Endpoints', description: 'Check available endpoints for projects, outputs, and expenditures', tips: ['Use country=YEM filter', 'Year parameter filters by fiscal year'] },
      { stepNumber: 3, title: 'Query Project Data', description: 'Use project_list endpoint for Yemen projects', tips: ['Results are paginated', 'Use offset and limit parameters'] },
      { stepNumber: 4, title: 'Extract Details', description: 'Use project_detail endpoint for full project information', tips: ['Requires project ID from list', 'Includes budget and outputs'] }
    ],
    commonIssues: ['Empty results - verify country code', 'Rate limiting - reduce request frequency', 'Missing fields - not all projects have complete data'],
    troubleshooting: 'For empty results, verify the year range. Some older projects may not be in the system. Use the /api/project_count endpoint to verify data availability.'
  },
  {
    acronym: 'YDP',
    registrationUrl: 'https://yemendataproject.org/data.html',
    documentationUrl: 'https://yemendataproject.org/methodology.html',
    credentialType: 'api_key',
    requiresApproval: true,
    approvalTimeline: '2-4 weeks',
    keyFormat: 'Partnership agreement required',
    keyLocation: 'none',
    defaultRateLimit: null,
    rateLimitPeriod: null,
    exampleRequest: 'Contact info@yemendataproject.org for data access',
    steps: [
      { stepNumber: 1, title: 'Review Available Data', description: 'Visit https://yemendataproject.org/data.html to see published datasets', tips: ['Some data is publicly available', 'Detailed data requires partnership'] },
      { stepNumber: 2, title: 'Contact Research Team', description: 'Email info@yemendataproject.org to request data access', tips: ['Explain research purpose', 'Mention institutional affiliation'] },
      { stepNumber: 3, title: 'Negotiate Partnership', description: 'Discuss data sharing terms and attribution requirements', tips: ['May require MOU', 'Attribution is mandatory'] },
      { stepNumber: 4, title: 'Receive Data', description: 'Data is typically provided as CSV/Excel files', tips: ['No API available', 'Manual download required'] }
    ],
    commonIssues: ['No API available - data is provided manually', 'Long approval process - allow 2-4 weeks', 'Attribution requirements - must credit YDP'],
    troubleshooting: 'If no response after 2 weeks, follow up with a reminder email. For urgent requests, mention timeline in initial contact.'
  },
  {
    acronym: 'SCSS',
    registrationUrl: 'https://sanaacenter.org/publications',
    documentationUrl: 'https://sanaacenter.org/about',
    credentialType: 'api_key',
    requiresApproval: true,
    approvalTimeline: '1-2 weeks',
    keyFormat: 'Partnership agreement required',
    keyLocation: 'none',
    defaultRateLimit: null,
    rateLimitPeriod: null,
    exampleRequest: 'Contact info@sanaacenter.org for data access',
    steps: [
      { stepNumber: 1, title: 'Browse Publications', description: 'Visit https://sanaacenter.org/publications for available research', tips: ['Publications are freely accessible', 'Raw data requires partnership'] },
      { stepNumber: 2, title: 'Contact Research Team', description: 'Email info@sanaacenter.org to request data collaboration', tips: ['Explain research objectives', 'Highlight mutual benefits'] },
      { stepNumber: 3, title: 'Establish Partnership', description: 'Discuss collaboration terms and data sharing', tips: ['May involve joint research', 'Attribution required'] },
      { stepNumber: 4, title: 'Access Data', description: 'Data is shared based on partnership terms', tips: ['No API available', 'Data format varies by project'] }
    ],
    commonIssues: ['No API available - manual data sharing only', 'Partnership required for raw data', 'Publication data is freely available'],
    troubleshooting: 'For research collaboration, contact partnerships@sanaacenter.org directly. For publication access, use the website search.'
  },
  {
    acronym: 'CBY-Aden',
    registrationUrl: 'https://english.cby-ye.com/',
    documentationUrl: 'https://english.cby-ye.com/statistics',
    credentialType: 'api_key',
    requiresApproval: true,
    approvalTimeline: '2-6 weeks',
    keyFormat: 'Official request required',
    keyLocation: 'none',
    defaultRateLimit: null,
    rateLimitPeriod: null,
    exampleRequest: 'Submit official request to statistics@cby-ye.com',
    steps: [
      { stepNumber: 1, title: 'Access Public Statistics', description: 'Visit https://english.cby-ye.com/statistics for published data', tips: ['Some statistics are publicly available', 'Detailed data requires formal request'] },
      { stepNumber: 2, title: 'Submit Official Request', description: 'Send formal data request to statistics@cby-ye.com', tips: ['Use institutional letterhead', 'Specify exact data requirements'] },
      { stepNumber: 3, title: 'Await Processing', description: 'Request is processed by Statistics Department', tips: ['Allow 2-6 weeks for response', 'May require additional documentation'] },
      { stepNumber: 4, title: 'Receive Data', description: 'Data is provided in official format (PDF/Excel)', tips: ['No API available', 'Data may be aggregated'] }
    ],
    commonIssues: ['No API available - manual request only', 'Long processing time - allow 2-6 weeks', 'Data may be restricted - specify purpose clearly'],
    troubleshooting: 'For urgent requests, contact info@cby-ye.com with explanation. For historical data, specify exact date ranges needed.'
  }
];

async function seedSourceMetadata() {
  console.log('🌱 Starting source metadata seeding...\n');
  
  const config = parseConnectionString(DATABASE_URL);
  const conn = await mysql.createConnection(config);
  
  try {
    // Get source IDs by acronym
    const [sources] = await conn.execute(
      `SELECT id, acronym FROM evidence_sources WHERE acronym IS NOT NULL`
    );
    
    const sourceMap = {};
    for (const source of sources) {
      sourceMap[source.acronym] = source.id;
    }
    
    console.log(`📊 Found ${Object.keys(sourceMap).length} sources with acronyms\n`);
    
    // Insert source contacts
    console.log('📧 Inserting source contacts...');
    let contactsInserted = 0;
    
    for (const contact of sourceContacts) {
      const sourceId = sourceMap[contact.acronym];
      if (!sourceId) {
        console.log(`  ⚠️  Skipping contact for unknown source: ${contact.acronym}`);
        continue;
      }
      
      try {
        await conn.execute(`
          INSERT INTO source_contacts (sourceId, contactType, email, department, isPrimary, isActive)
          VALUES (?, ?, ?, ?, ?, true)
          ON DUPLICATE KEY UPDATE
            department = VALUES(department),
            isPrimary = VALUES(isPrimary)
        `, [sourceId, contact.contactType, contact.email, contact.department, contact.isPrimary || false]);
        contactsInserted++;
      } catch (err) {
        console.log(`  ⚠️  Error inserting contact for ${contact.acronym}: ${err.message}`);
      }
    }
    
    console.log(`  ✅ Inserted ${contactsInserted} contacts\n`);
    
    // Insert API registration instructions
    console.log('📝 Inserting API registration instructions...');
    let instructionsInserted = 0;
    
    for (const instr of apiInstructions) {
      const sourceId = sourceMap[instr.acronym];
      if (!sourceId) {
        console.log(`  ⚠️  Skipping instructions for unknown source: ${instr.acronym}`);
        continue;
      }
      
      try {
        await conn.execute(`
          INSERT INTO api_registration_instructions (
            sourceId, registrationUrl, documentationUrl, credentialType,
            requiresApproval, approvalTimeline, keyFormat, keyLocation, keyHeaderName,
            defaultRateLimit, rateLimitPeriod, exampleRequest, steps
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            documentationUrl = VALUES(documentationUrl),
            approvalTimeline = VALUES(approvalTimeline),
            exampleRequest = VALUES(exampleRequest),
            steps = VALUES(steps)
        `, [
          sourceId,
          instr.registrationUrl,
          instr.documentationUrl,
          instr.credentialType,
          instr.requiresApproval,
          instr.approvalTimeline,
          instr.keyFormat,
          instr.keyLocation || 'none',
          instr.keyHeaderName || null,
          instr.defaultRateLimit,
          instr.rateLimitPeriod,
          instr.exampleRequest,
          JSON.stringify(instr.steps)
        ]);
        instructionsInserted++;
        console.log(`  ✅ ${instr.acronym}: Instructions added`);
      } catch (err) {
        console.log(`  ⚠️  Error inserting instructions for ${instr.acronym}: ${err.message}`);
      }
    }
    
    console.log(`\n✅ Seeding complete!`);
    console.log(`   - ${contactsInserted} contacts inserted`);
    console.log(`   - ${instructionsInserted} API instructions inserted`);
    
  } finally {
    await conn.end();
  }
}

seedSourceMetadata().catch(console.error);
