/**
 * Comprehensive Yemen Sources Registry Seed - 15 Major Data Sources
 * 
 * This script populates evidence_sources, source_contacts, and api_registration_instructions
 * with complete, production-ready data for Yemen-relevant sources.
 * 
 * Run with: node server/seed-yemen-sources-comprehensive.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// ============================================================================
// COMPREHENSIVE YEMEN SOURCES DATA
// ============================================================================

const yemenSources = [
  {
    // Source 1: Central Bank of Yemen
    source: {
      name: 'Central Bank of Yemen',
      nameAr: 'البنك المركزي اليمني',
      acronym: 'CBY',
      category: 'government',
      baseUrl: 'https://english.cby-ye.com',
      apiEndpoint: null,
      apiType: 'none',
      isWhitelisted: true,
      description: 'Yemen\'s central bank providing monetary aggregates, financial statistics, and economic indicators',
    },
    contacts: [
      {
        contactType: 'data_team',
        contactName: 'Research and Statistics Department',
        email: 'rsd@cby-ye.com',
        phone: '+967-02-256518',
        department: 'General Department of Research and Statistics',
        isPrimary: true,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://english.cby-ye.com/researchandstatistics',
      documentationUrl: 'https://english.cby-ye.com/researchandstatistics',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No API - Manual data extraction from PDF reports',
      keyLocation: 'none',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Available',
          description: 'CBY does not provide a public API. Data must be manually extracted from PDF reports published on their website.',
          tips: ['Monitor the Research & Statistics page for new monthly/annual reports', 'Use PDF parsing tools for data extraction'],
        },
        {
          stepNumber: 2,
          title: 'Access Published Reports',
          description: 'Navigate to https://english.cby-ye.com/researchandstatistics to download PDF reports containing economic data.',
          tips: ['Reports include monetary aggregates, banking sector data, and foreign exchange statistics'],
        },
        {
          stepNumber: 3,
          title: 'Contact for Custom Data',
          description: 'For specific data not available in published reports, email the Research and Statistics Department at rsd@cby-ye.com.',
          tips: ['Provide clear data requirements and intended use case', 'Response time may vary'],
        },
      ],
      commonIssues: [
        {
          issue: 'Data only available in PDF format',
          solution: 'Use PDF parsing libraries (e.g., PyPDF2, pdfplumber) to extract tables and text programmatically',
        },
        {
          issue: 'Delayed publication of reports',
          solution: 'Set up monitoring to check for new reports weekly',
        },
      ],
      tipsAndTricks: [
        'Focus on the Monthly Statistical Bulletin for most recent data',
        'Annual reports provide comprehensive historical data',
        'Contact the department directly for clarifications on methodology',
      ],
    },
  },
  
  {
    // Source 2: HDX HAPI (UN OCHA)
    source: {
      name: 'Humanitarian Data Exchange (HDX) - HAPI',
      nameAr: 'منصة تبادل البيانات الإنسانية',
      acronym: 'HDX HAPI',
      category: 'international',
      baseUrl: 'https://hapi.humdata.org',
      apiEndpoint: 'https://hapi.humdata.org/api/v2/',
      apiType: 'rest',
      isWhitelisted: true,
      description: 'UN OCHA\'s humanitarian data API providing standardized indicators for Yemen including IDPs, food security, and conflict data',
    },
    contacts: [
      {
        contactType: 'api_support',
        contactName: 'HDX Team',
        email: 'hdx@un.org',
        department: 'Centre for Humanitarian Data',
        isPrimary: true,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://hapi.humdata.org/api/v2/encode_app_identifier',
      documentationUrl: 'https://hapi.humdata.org/docs',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'Base64-encoded app identifier (app_name + email)',
      keyLocation: 'query_param',
      keyHeaderName: 'app_identifier',
      defaultRateLimit: 10000,
      rateLimitPeriod: 'request',
      rateLimitNotes: 'Maximum 10,000 records per request; use pagination for larger datasets',
      steps: [
        {
          stepNumber: 1,
          title: 'Generate App Identifier',
          description: 'Call the /encode_app_identifier endpoint with your app name and email to get a Base64-encoded identifier.',
          tips: ['No account registration required', 'Identifier is generated instantly'],
        },
        {
          stepNumber: 2,
          title: 'Test API Access',
          description: 'Use your app_identifier in the query parameter to access Yemen data with location_code=YEM.',
          tips: ['Start with a small limit parameter to test', 'Use output_format=json for programmatic access'],
        },
        {
          stepNumber: 3,
          title: 'Implement Pagination',
          description: 'For datasets larger than 10,000 records, use limit and offset parameters to paginate through results.',
          tips: ['Track offset to avoid duplicate data', 'Consider caching responses'],
        },
      ],
      exampleRequest: 'curl -X GET "https://hapi.humdata.org/api/v2/affected-people/idps?location_code=YEM&app_identifier=YOUR_BASE64_APP_ID&limit=1000"',
      commonIssues: [
        {
          issue: 'Confusing app_identifier authentication',
          solution: 'Use the /encode_app_identifier endpoint to generate the required Base64 string from your app name and email',
        },
        {
          issue: 'Hitting 10,000 record limit',
          solution: 'Implement pagination with offset parameter and make multiple requests',
        },
      ],
      tipsAndTricks: [
        'Use location_code=YEM filter for Yemen-specific data',
        'Set output_format=csv for bulk downloads',
        'Combine multiple indicator endpoints for comprehensive datasets',
        'Cache responses to reduce API calls',
      ],
    },
  },

  {
    // Source 3: World Food Programme (WFP)
    source: {
      name: 'World Food Programme',
      nameAr: 'برنامج الأغذية العالمي',
      acronym: 'WFP',
      category: 'international',
      baseUrl: 'https://www.wfp.org',
      apiEndpoint: 'https://hapi.humdata.org/api/v2',
      apiType: 'rest',
      isWhitelisted: true,
      description: 'UN agency providing food security indicators, food prices, and market functionality data for Yemen',
    },
    contacts: [
      {
        contactType: 'data_team',
        contactName: 'Vulnerability Analysis and Mapping (VAM)',
        email: 'wfp.vaminfo@wfp.org',
        phone: '+39-06-65131',
        department: 'VAM / RAM',
        isPrimary: true,
      },
      {
        contactType: 'general',
        email: 'wfpinfo@wfp.org',
        isPrimary: false,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://data.humdata.org/faqs/devs',
      documentationUrl: 'https://hdx-hapi.readthedocs.io/',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'None for public read access via HDX HAPI',
      keyLocation: 'none',
      steps: [
        {
          stepNumber: 1,
          title: 'Access via HDX HAPI',
          description: 'WFP data is available through the HDX Humanitarian API (HAPI) without authentication for read access.',
          tips: ['No API key required for public data', 'Use organization_id=wfp filter'],
        },
        {
          stepNumber: 2,
          title: 'Query WFP Datasets',
          description: 'Use the metadata/dataset endpoint with organization_id=wfp and location_code=YEM to find available datasets.',
          tips: ['Data is standardized and aggregated', 'Not raw microdata'],
        },
        {
          stepNumber: 3,
          title: 'Contact VAM for Raw Data',
          description: 'For raw data or WFP internal data, contact the VAM team directly at wfp.vaminfo@wfp.org.',
          tips: ['Specify data requirements clearly', 'Internal APIs require WFP credentials'],
        },
      ],
      exampleRequest: 'curl -X GET "https://hapi.humdata.org/api/v2/metadata/dataset?organization_id=wfp&location_code=YEM" -H "accept: application/json"',
      commonIssues: [
        {
          issue: 'Cannot access raw microdata',
          solution: 'HDX HAPI provides aggregated data only. Contact VAM team for raw data access',
        },
      ],
      tipsAndTricks: [
        'Combine WFP data with FAO and FEWS NET for comprehensive food security analysis',
        'Check data update frequency in metadata',
        'Use food price data for market monitoring',
      ],
    },
  },

  {
    // Source 4: Food and Agriculture Organization (FAO)
    source: {
      name: 'Food and Agriculture Organization',
      nameAr: 'منظمة الأغذية والزراعة',
      acronym: 'FAO',
      category: 'international',
      baseUrl: 'https://www.fao.org',
      apiEndpoint: 'https://nsi-release-ro-statsuite.fao.org/rest/data/',
      apiType: 'rest',
      isWhitelisted: true,
      description: 'UN agency providing food security, nutrition, crop production, and agricultural data for Yemen',
    },
    contacts: [
      {
        contactType: 'data_team',
        contactName: 'Statistics Division',
        email: 'FAO-Statistics@fao.org',
        phone: '+39 06 57051',
        department: 'ESS',
        isPrimary: true,
      },
      {
        contactType: 'general',
        email: 'FAO-HQ@fao.org',
        isPrimary: false,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://www.fao.org/faostat/en/#data',
      documentationUrl: 'https://statsuite-production-public-files.s3.eu-west-1.amazonaws.com/CROSS_DOMAIN/API+DOC.pdf',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No authentication required',
      keyLocation: 'none',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Key Required',
          description: 'FAO SDMX API is open and free. No registration or authentication needed.',
          tips: ['Start using immediately', 'Use FAOSTAT Query Builder for URL generation'],
        },
        {
          stepNumber: 2,
          title: 'Understand SDMX Format',
          description: 'FAO uses SDMX (Statistical Data and Metadata eXchange) format. Review the API documentation to understand query structure.',
          tips: ['Use format=json for JSON responses', 'Country code for Yemen: YEM'],
        },
        {
          stepNumber: 3,
          title: 'Build Queries',
          description: 'Use the FAOSTAT Query Builder to generate SDMX query URLs, then adapt for API use.',
          tips: ['Optimize queries to reduce data volume', 'Rate limiting may apply for large requests'],
        },
      ],
      exampleRequest: 'curl -X GET "https://nsi-release-ro-statsuite.fao.org/rest/data/FAO,FS,1.0/YEM?format=json" -H "Accept: application/json"',
      commonIssues: [
        {
          issue: 'Complex SDMX format',
          solution: 'Use the Query Builder to generate URLs, then study the structure for programmatic use',
        },
      ],
      tipsAndTricks: [
        'Use FAOSTAT Query Builder for initial query generation',
        'Combine with DIEM (Data in Emergencies Monitoring) for crisis data',
        'Check AQUASTAT for water resources data',
      ],
    },
  },

  {
    // Source 5: International Organization for Migration (IOM)
    source: {
      name: 'International Organization for Migration - DTM',
      nameAr: 'المنظمة الدولية للهجرة',
      acronym: 'IOM DTM',
      category: 'international',
      baseUrl: 'https://dtm.iom.int',
      apiEndpoint: 'https://dtm.iom.int/api/v3',
      apiType: 'rest',
      isWhitelisted: true,
      description: 'UN migration agency providing displacement tracking data including IDPs, returnees, and migrant arrivals for Yemen',
    },
    contacts: [
      {
        contactType: 'data_team',
        contactName: 'DTM Data Team',
        email: 'dtmdataconsolidation@iom.int',
        phone: '+41.22.717 9111',
        department: 'Displacement Tracking Matrix (DTM)',
        isPrimary: true,
      },
      {
        contactType: 'general',
        email: 'hq@iom.int',
        isPrimary: false,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://dtm-apim-portal.iom.int/',
      documentationUrl: 'https://dtmapi.readthedocs.io/',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'API key in header: Ocp-Apim-Subscription-Key',
      keyLocation: 'header',
      keyHeaderName: 'Ocp-Apim-Subscription-Key',
      steps: [
        {
          stepNumber: 1,
          title: 'Register for API Access',
          description: 'Visit https://dtm-apim-portal.iom.int/ to register and obtain an API key.',
          tips: ['Portal may be temporarily down (502 errors)', 'Registration is instant when portal is available'],
        },
        {
          stepNumber: 2,
          title: 'Use Python Package (Recommended)',
          description: 'Install the official dtmapi Python package from PyPI for easier API interaction.',
          tips: ['pip install dtmapi', 'Package handles authentication automatically'],
        },
        {
          stepNumber: 3,
          title: 'Query Yemen Data',
          description: 'Use CountryName=Yemen parameter to filter displacement data for Yemen.',
          tips: ['Check available endpoints in documentation', 'Data includes IDPs, returnees, and migrant flows'],
        },
      ],
      exampleRequest: 'curl -X GET "https://dtm.iom.int/api/v3/idp_admin0_data?CountryName=Yemen" -H "Ocp-Apim-Subscription-Key: YOUR_API_KEY"',
      commonIssues: [
        {
          issue: 'Registration portal returns 502 Bad Gateway',
          solution: 'Try again later or use the official Python package which may have cached credentials',
        },
        {
          issue: 'Unclear API endpoints',
          solution: 'Use the official dtmapi Python package which abstracts endpoint complexity',
        },
      ],
      tipsAndTricks: [
        'Highly recommended to use the official Python package dtmapi',
        'Combine with UNHCR data for comprehensive displacement analysis',
        'Check data update frequency for Yemen operations',
      ],
    },
  },

  {
    // Source 6: UNICEF Yemen
    source: {
      name: 'UNICEF Yemen',
      nameAr: 'اليونيسف اليمن',
      acronym: 'UNICEF',
      category: 'international',
      baseUrl: 'https://www.unicef.org/yemen',
      apiEndpoint: 'https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/',
      apiType: 'rest',
      isWhitelisted: true,
      description: 'UN children\'s agency providing child-related indicators including mortality, education, health, and nutrition data for Yemen',
    },
    contacts: [
      {
        contactType: 'general',
        email: 'sanaa@unicef.org',
        phone: '+967 1 211 400/1/2/3',
        isPrimary: true,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://data.unicef.org',
      documentationUrl: 'https://data.unicef.org/sdmx-api-documentation/',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No authentication required',
      keyLocation: 'none',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Key Required',
          description: 'UNICEF SDMX API is open and free. No registration needed.',
          tips: ['Start using immediately', 'Familiarize yourself with SDMX standard'],
        },
        {
          stepNumber: 2,
          title: 'Explore Available Dataflows',
          description: 'Use the dataflow endpoint to discover available datasets and indicators.',
          tips: ['Multiple databases with varying structures', 'Use SDMX registry UI for exploration'],
        },
        {
          stepNumber: 3,
          title: 'Query Yemen Data',
          description: 'Build SDMX queries with Yemen country code to retrieve child-related indicators.',
          tips: ['Check MICS (Multiple Indicator Cluster Surveys) for comprehensive data', 'SDG indicators available'],
        },
      ],
      exampleRequest: 'curl "https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/dataflow/all/all/latest/?format=sdmx-json&detail=full&references=none"',
      commonIssues: [
        {
          issue: 'Complex SDMX structure across multiple databases',
          solution: 'Use the SDMX registry UI to generate and test queries before implementing programmatically',
        },
      ],
      tipsAndTricks: [
        'Focus on MICS data for comprehensive child indicators',
        'Combine with WHO data for health indicators',
        'Check data availability and update frequency for Yemen',
      ],
    },
  },

  {
    // Source 7: UNDP Yemen
    source: {
      name: 'United Nations Development Programme Yemen',
      nameAr: 'برنامج الأمم المتحدة الإنمائي اليمن',
      acronym: 'UNDP',
      category: 'international',
      baseUrl: 'https://www.undp.org/yemen',
      apiEndpoint: 'https://api.open.undp.org',
      apiType: 'rest',
      isWhitelisted: true,
      description: 'UN development agency providing project data, financial information, and development indicators for Yemen',
    },
    contacts: [
      {
        contactType: 'data_team',
        contactName: 'UNDP Open Data Team',
        email: 'data@undp.org',
        phone: '+967 1 448605',
        department: 'Data Futures Exchange',
        isPrimary: true,
      },
      {
        contactType: 'general',
        email: 'unvye.info@undp.org',
        isPrimary: false,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://api.open.undp.org',
      documentationUrl: 'https://api.open.undp.org/api_documentation/api',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No authentication required',
      keyLocation: 'none',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Key Required',
          description: 'UNDP Open Data API is public and free. No registration needed.',
          tips: ['Rate limiting is enforced but limits not publicly documented'],
        },
        {
          stepNumber: 2,
          title: 'Query Yemen Projects',
          description: 'Use operating_unit=YEM parameter to filter projects and data for Yemen.',
          tips: ['ISO3 country code for Yemen: YEM', 'Includes project details, financials, and SDG alignment'],
        },
        {
          stepNumber: 3,
          title: 'Handle Rate Limiting',
          description: 'Implement exponential backoff for HTTP 429 responses.',
          tips: ['Bulk download available at /api/download/undp-project-data.zip', 'Cache responses to reduce API calls'],
        },
      ],
      exampleRequest: 'curl -X GET "https://api.open.undp.org/api/units/YEM.json" -H "accept: application/json"',
      commonIssues: [
        {
          issue: 'Rate limiting (HTTP 429)',
          solution: 'Implement exponential backoff and caching. Use bulk download for large datasets',
        },
        {
          issue: 'Incorrect country code',
          solution: 'Use ISO3 code "YEM" for Yemen, not "YE" or full country name',
        },
      ],
      tipsAndTricks: [
        'Use bulk download endpoint for comprehensive data',
        'Filter by operating_unit=YEM for Yemen-specific projects',
        'Check SDG alignment for development goals tracking',
      ],
    },
  },

  {
    // Source 8: Yemen Data Project
    source: {
      name: 'Yemen Data Project',
      nameAr: 'مشروع بيانات اليمن',
      acronym: 'YDP',
      category: 'research',
      baseUrl: 'https://yemendataproject.org',
      apiEndpoint: null,
      apiType: 'none',
      isWhitelisted: true,
      description: 'Independent project tracking airstrikes and civilian casualties in Yemen with downloadable CSV datasets',
    },
    contacts: [
      {
        contactType: 'general',
        email: 'contact@yemendataproject.org',
        isPrimary: true,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://yemendataproject.org/data',
      documentationUrl: 'https://yemendataproject.org/methodology-1',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No API - Data available as CSV downloads',
      keyLocation: 'none',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Available',
          description: 'Yemen Data Project provides data as downloadable CSV files, not via API.',
          tips: ['Data is freely available', 'No registration required'],
        },
        {
          stepNumber: 2,
          title: 'Download CSV Files',
          description: 'Visit the data page to download CSV files containing airstrike and casualty data.',
          tips: ['Data includes coordinates, dates, target types, and casualties', 'Updated regularly'],
        },
        {
          stepNumber: 3,
          title: 'Cite the Source',
          description: 'When using the data, cite Yemen Data Project and link back to the website.',
          tips: ['Check methodology page for data collection process', 'Contact for questions or clarifications'],
        },
      ],
      commonIssues: [
        {
          issue: 'No programmatic API access',
          solution: 'Set up automated downloads of CSV files and parse them programmatically',
        },
      ],
      tipsAndTricks: [
        'Combine with ACLED data for comprehensive conflict analysis',
        'Data is georeferenced for mapping applications',
        'Check update frequency on the website',
      ],
    },
  },

  {
    // Source 9: Sana'a Center for Strategic Studies
    source: {
      name: 'Sana\'a Center for Strategic Studies',
      nameAr: 'مركز صنعاء للدراسات الاستراتيجية',
      acronym: 'SCSS',
      category: 'research',
      baseUrl: 'https://sanaacenter.org',
      apiEndpoint: null,
      apiType: 'none',
      isWhitelisted: true,
      description: 'Yemen-focused think tank providing political, economic, and security analysis with embedded data in reports',
    },
    contacts: [
      {
        contactType: 'general',
        email: 'info@sanaacenter.org',
        phone: '+967 2 357 789',
        isPrimary: true,
      },
      {
        contactType: 'general',
        contactName: 'Media Inquiries',
        email: 'media@sanaacenter.org',
        isPrimary: false,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://sanaacenter.org/publications',
      documentationUrl: 'https://sanaacenter.org',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No API - Data embedded in publications',
      keyLocation: 'none',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Available',
          description: 'Sana\'a Center is a think tank. Data is embedded within reports and publications, not available via API.',
          tips: ['Publications are free to access', 'Focus on Yemen Economic Bulletin for economic data'],
        },
        {
          stepNumber: 2,
          title: 'Access Publications',
          description: 'Browse the publications page to find reports containing relevant data and analysis.',
          tips: ['Monthly Yemen Economic Bulletin is key resource', 'Reports include charts and data tables'],
        },
        {
          stepNumber: 3,
          title: 'Extract Data from Reports',
          description: 'Manually extract data from PDF reports or contact the center for specific data requests.',
          tips: ['Contact info@sanaacenter.org for data inquiries', 'Cite the source when using data'],
        },
      ],
      commonIssues: [
        {
          issue: 'Data embedded in PDF reports',
          solution: 'Use PDF parsing tools or contact the center directly for data in usable formats',
        },
      ],
      tipsAndTricks: [
        'Yemen Economic Bulletin is published monthly with key indicators',
        'Reports provide context and analysis alongside data',
        'Combine with other sources for comprehensive economic analysis',
      ],
    },
  },

  {
    // Source 10: Yemen Polling Center
    source: {
      name: 'Yemen Polling Center',
      nameAr: 'مركز اليمن للاستطلاع',
      acronym: 'YPC',
      category: 'research',
      baseUrl: 'https://yemenpolling.org',
      apiEndpoint: null,
      apiType: 'none',
      isWhitelisted: true,
      description: 'Yemen-based polling organization providing public opinion data and social science research',
    },
    contacts: [
      {
        contactType: 'general',
        email: 'contact@yemenpolling.org',
        phone: '+967-04-283-764',
        isPrimary: true,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://yemenpolling.org',
      documentationUrl: 'https://yemenpolling.org',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No API - Data via reports and public data sheets',
      keyLocation: 'none',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Available',
          description: 'Yemen Polling Center provides data through published reports and occasional public data sheets (e.g., Google Sheets).',
          tips: ['Data is free to access', 'Focus on public opinion polls and surveys'],
        },
        {
          stepNumber: 2,
          title: 'Access Published Data',
          description: 'Check the website for published poll results and data sheets.',
          tips: ['Some data available in Google Sheets format', 'Reports include methodology and sample details'],
        },
        {
          stepNumber: 3,
          title: 'Request Custom Data',
          description: 'Contact the center directly for custom data requests or access to raw survey data.',
          tips: ['Specify data requirements clearly', 'Response time may vary'],
        },
      ],
      commonIssues: [
        {
          issue: 'Limited public data availability',
          solution: 'Contact the center directly for specific data needs',
        },
      ],
      tipsAndTricks: [
        'Valuable for public opinion and social attitudes data',
        'Combine with other sources for comprehensive social analysis',
        'Check methodology for survey quality assessment',
      ],
    },
  },

  {
    // Source 11: Central Statistical Organization (CSO)
    source: {
      name: 'Central Statistical Organization',
      nameAr: 'الجهاز المركزي للإحصاء',
      acronym: 'CSO',
      category: 'government',
      baseUrl: 'https://www.cso-ye.org',
      apiEndpoint: null,
      apiType: 'none',
      isWhitelisted: true,
      description: 'Yemen\'s national statistical office providing official statistics including poverty, labor, trade, and demographic data',
    },
    contacts: [
      {
        contactType: 'general',
        email: 'info@cso-ye.org',
        phone: '+967 2 2458765',
        isPrimary: true,
      },
      {
        contactType: 'general',
        phone: '+967 2 2698435',
        isPrimary: false,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://www.cso-ye.org',
      documentationUrl: 'https://www.cso-ye.org',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No API - Data via publications and request form',
      keyLocation: 'none',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Available',
          description: 'CSO does not provide a public API. Data is accessed through publications or manual data request forms.',
          tips: ['Annual Statistical Book is key publication', 'Data request form available on website'],
        },
        {
          stepNumber: 2,
          title: 'Download Published Reports',
          description: 'Access the publications section to download statistical reports and yearbooks.',
          tips: ['Annual Statistical Book contains comprehensive data', 'Sector-specific reports available'],
        },
        {
          stepNumber: 3,
          title: 'Submit Data Request',
          description: 'For specific data not in publications, submit a "Request Data Provision" form on the website.',
          tips: ['Provide detailed data requirements', 'Timeline for response not publicly available'],
        },
      ],
      commonIssues: [
        {
          issue: 'Data only in PDF publications',
          solution: 'Use PDF parsing tools or submit data request form for specific datasets',
        },
      ],
      tipsAndTricks: [
        'Annual Statistical Book is most comprehensive resource',
        'Focus on Multidimensional Poverty Index for poverty data',
        'Contact directly for clarifications on methodology',
      ],
    },
  },

  {
    // Source 12: Ministry of Planning and International Cooperation
    source: {
      name: 'Ministry of Planning and International Cooperation',
      nameAr: 'وزارة التخطيط والتعاون الدولي',
      acronym: 'MoPIC',
      category: 'government',
      baseUrl: 'https://www.mopic.gov.ye',
      apiEndpoint: null,
      apiType: 'none',
      isWhitelisted: true,
      description: 'Yemen government ministry responsible for development planning and aid coordination',
    },
    contacts: [
      {
        contactType: 'general',
        email: 'mopic.gov.ye@outlook.com',
        notes: 'Email found in World Bank documents; may not be current',
        isPrimary: true,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://www.mopic.gov.ye',
      documentationUrl: 'https://www.mopic.gov.ye',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No API - Data via publications',
      keyLocation: 'none',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Available',
          description: 'MoPIC does not provide a public API. Data is accessed through publications and reports.',
          tips: ['Website primarily in Arabic', 'Political situation affects data availability'],
        },
        {
          stepNumber: 2,
          title: 'Search for Publications',
          description: 'Look for National Development Plans, Annual Reports, and sector reports on the website.',
          tips: ['Check partner organizations (World Bank, UN) for MoPIC data', 'Data may be fragmented'],
        },
        {
          stepNumber: 3,
          title: 'Contact Ministry',
          description: 'Email the ministry for specific data requests or clarifications.',
          tips: ['Response time uncertain', 'Consider contacting through partner organizations'],
        },
      ],
      commonIssues: [
        {
          issue: 'Fragmented data due to political situation',
          solution: 'Cross-reference with international organizations that work with MoPIC',
        },
        {
          issue: 'Limited English content',
          solution: 'Use translation tools or seek data from partner organizations',
        },
      ],
      tipsAndTricks: [
        'Focus on National Development Plans for strategic data',
        'Check World Bank and UN reports for MoPIC-sourced data',
        'Political context affects data availability and reliability',
      ],
    },
  },

  {
    // Source 13: ReliefWeb Yemen
    source: {
      name: 'ReliefWeb',
      nameAr: 'ريليف ويب',
      acronym: 'RW',
      category: 'international',
      baseUrl: 'https://reliefweb.int',
      apiEndpoint: 'https://api.reliefweb.int/v2/',
      apiType: 'rest',
      isWhitelisted: true,
      description: 'UN OCHA\'s humanitarian information service providing reports, maps, and news for Yemen',
    },
    contacts: [
      {
        contactType: 'api_support',
        email: 'feedback@reliefweb.int',
        isPrimary: true,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://reliefweb.int',
      documentationUrl: 'https://apidoc.reliefweb.int/',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No authentication required (read-only)',
      keyLocation: 'none',
      defaultRateLimit: 1000,
      rateLimitPeriod: 'day',
      rateLimitNotes: '1000 calls per day, max 1000 entries per call',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Key Required',
          description: 'ReliefWeb API is read-only and free. No registration needed.',
          tips: ['Strongly recommended to use appname parameter', 'Rate limit: 1000 calls/day'],
        },
        {
          stepNumber: 2,
          title: 'Query Yemen Content',
          description: 'Use POST requests with query parameter to filter by country=Yemen.',
          tips: ['Max 1000 entries per call', 'Use appname parameter for tracking'],
        },
        {
          stepNumber: 3,
          title: 'Implement Pagination',
          description: 'For large result sets, use offset and limit parameters to paginate.',
          tips: ['Cache responses to stay within rate limits', 'API is read-only'],
        },
      ],
      exampleRequest: 'curl -X POST \'https://api.reliefweb.int/v2/reports?appname=yeto-platform\' -d \'{"query":{"value":"Yemen","field":"country"},"limit":100}\'',
      commonIssues: [
        {
          issue: 'Hitting 1000 calls/day limit',
          solution: 'Implement caching and batch requests efficiently',
        },
        {
          issue: 'Max 1000 entries per call',
          solution: 'Use pagination with offset parameter for larger datasets',
        },
      ],
      tipsAndTricks: [
        'Always use appname parameter for better tracking',
        'Filter by country field with value "Yemen"',
        'Combine with HDX HAPI for comprehensive humanitarian data',
        'Cache responses to reduce API calls',
      ],
    },
  },

  {
    // Source 14: Global Food Security Cluster Yemen
    source: {
      name: 'Global Food Security Cluster Yemen',
      nameAr: 'المجموعة العالمية للأمن الغذائي اليمن',
      acronym: 'FSC',
      category: 'international',
      baseUrl: 'https://www.foodsecuritycluster.net/countries/yemen',
      apiEndpoint: 'https://hapi.humdata.org/api/v1',
      apiType: 'rest',
      isWhitelisted: true,
      description: 'Coordination mechanism providing food security data including IPC classifications and food prices for Yemen',
    },
    contacts: [
      {
        contactType: 'data_team',
        email: 'hdx@un.org',
        department: 'Centre for Humanitarian Data (OCHA)',
        isPrimary: true,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://hapi.humdata.org/api/v2/encode_app_identifier',
      documentationUrl: 'https://hdx-hapi.readthedocs.io/',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'Base64-encoded app identifier',
      keyLocation: 'query_param',
      keyHeaderName: 'app_identifier',
      defaultRateLimit: 10000,
      rateLimitPeriod: 'request',
      rateLimitNotes: 'Max 10,000 records per request; use pagination for more',
      steps: [
        {
          stepNumber: 1,
          title: 'Generate App Identifier',
          description: 'Call /encode_app_identifier endpoint to generate Base64-encoded identifier from app name and email.',
          tips: ['Instant generation', 'No account required'],
        },
        {
          stepNumber: 2,
          title: 'Query Food Security Data',
          description: 'Use location_code=YEM to filter Yemen-specific food security indicators.',
          tips: ['IPC classifications available', 'Food price data included'],
        },
        {
          stepNumber: 3,
          title: 'Implement Pagination',
          description: 'For datasets larger than 10,000 records, use limit and offset parameters.',
          tips: ['Set output_format=json for programmatic access', 'Cache responses'],
        },
      ],
      exampleRequest: 'curl -X GET "https://hapi.humdata.org/api/v1/food-security-nutrition-poverty/food-security?location_code=YEM&output_format=json&limit=1000&app_identifier=YOUR_APP_ID"',
      commonIssues: [
        {
          issue: 'Max 10,000 records per request',
          solution: 'Use pagination with offset parameter for larger datasets',
        },
      ],
      tipsAndTricks: [
        'Combine with WFP and FAO data for comprehensive food security analysis',
        'Use location_code=YEM filter for Yemen data',
        'IPC data critical for humanitarian planning',
      ],
    },
  },

  {
    // Source 15: World Bank Yemen Socio-Economic Update
    source: {
      name: 'World Bank Yemen Socio-Economic Update',
      nameAr: 'التحديث الاجتماعي والاقتصادي لليمن - البنك الدولي',
      acronym: 'WB Yemen',
      category: 'international',
      baseUrl: 'https://www.worldbank.org/en/country/yemen',
      apiEndpoint: 'https://api.worldbank.org/v2/',
      apiType: 'rest',
      isWhitelisted: true,
      description: 'World Bank\'s comprehensive economic and social indicators for Yemen including GDP, poverty, and development data',
    },
    contacts: [
      {
        contactType: 'data_team',
        contactName: 'Development Data Group',
        email: 'data@worldbank.org',
        phone: '+1-202-473-1000',
        department: 'DECDG',
        isPrimary: true,
      },
    ],
    instructions: {
      credentialType: 'api_key',
      registrationUrl: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392',
      documentationUrl: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No authentication required',
      keyLocation: 'none',
      defaultRateLimit: 60,
      rateLimitPeriod: 'minute',
      rateLimitNotes: 'No explicit hard limit; subject to excessive usage policy. Max 60 indicators per call, max 4000 chars in URL',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Key Required',
          description: 'World Bank Indicators API is completely open. No registration needed.',
          tips: ['Start using immediately', 'Rate limit: ~120 requests/minute for anonymous users'],
        },
        {
          stepNumber: 2,
          title: 'Query Yemen Indicators',
          description: 'Use country code "YE" or "YEM" to filter indicators for Yemen.',
          tips: ['Use format=json for JSON responses', 'Add per_page parameter for pagination'],
        },
        {
          stepNumber: 3,
          title: 'Implement Caching',
          description: 'Cache responses to handle potential API downtime and improve performance.',
          tips: ['Use MRV parameter for most recent values', 'Combine multiple indicators in single request'],
        },
      ],
      exampleRequest: 'curl "https://api.worldbank.org/v2/country/ye/indicator/SP.POP.TOTL?date=2020&format=json"',
      commonIssues: [
        {
          issue: 'API not guaranteed 100% uptime',
          solution: 'Implement caching layer and graceful error handling',
        },
        {
          issue: 'JSON difficult to read in browser',
          solution: 'Use JSON formatter extension or command-line tools like jq',
        },
      ],
      tipsAndTricks: [
        'Use date parameter with range: date=2010:2024',
        'Add per_page=1000 for more results per request',
        'Use MRV=1 for most recent value only',
        'Country code for Yemen: YE or YEM',
        'Implement caching for better performance',
      ],
    },
  },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seedYemenSources() {
  console.log('🌱 Seeding comprehensive Yemen sources registry...\n');

  for (const sourceData of yemenSources) {
    console.log(`📍 Processing: ${sourceData.source.name}`);

    // Insert or update source
    let sourceId;
    try {
      const [result] = await db.execute(`
        INSERT INTO evidence_sources (
          name, nameAr, acronym, category, baseUrl, apiEndpoint, apiType, isWhitelisted, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nameAr = VALUES(nameAr),
          acronym = VALUES(acronym),
          category = VALUES(category),
          baseUrl = VALUES(baseUrl),
          apiEndpoint = VALUES(apiEndpoint),
          apiType = VALUES(apiType),
          isWhitelisted = VALUES(isWhitelisted),
          description = VALUES(description)
      `, [
        sourceData.source.name,
        sourceData.source.nameAr || null,
        sourceData.source.acronym || null,
        sourceData.source.category,
        sourceData.source.baseUrl,
        sourceData.source.apiEndpoint || null,
        sourceData.source.apiType || 'none',
        sourceData.source.isWhitelisted,
        sourceData.source.description || null,
      ]);
      
      // Get the source ID
      const [sources] = await db.execute(`
        SELECT id FROM evidence_sources WHERE name = ? LIMIT 1
      `, [sourceData.source.name]);
      
      sourceId = sources[0].id;
      console.log(`  ✅ Source added/updated (ID: ${sourceId})`);
    } catch (error) {
      console.log(`  ⚠️  Source error: ${error.message}`);
      continue;
    }

    // Insert contacts
    for (const contact of sourceData.contacts) {
      try {
        await db.execute(`
          INSERT INTO source_contacts (
            sourceId, contactType, contactName, email, phone, department, notes, isPrimary, isActive
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            contactName = VALUES(contactName),
            phone = VALUES(phone),
            department = VALUES(department),
            notes = VALUES(notes),
            isPrimary = VALUES(isPrimary),
            isActive = VALUES(isActive)
        `, [
          sourceId,
          contact.contactType,
          contact.contactName || null,
          contact.email,
          contact.phone || null,
          contact.department || null,
          contact.notes || null,
          contact.isPrimary,
          contact.isActive !== false,
        ]);
        console.log(`  ✅ Contact added: ${contact.email}`);
      } catch (error) {
        console.log(`  ⚠️  Contact skipped: ${contact.email}`);
      }
    }

    // Insert API instructions
    if (sourceData.instructions) {
      try {
        await db.execute(`
          INSERT INTO api_registration_instructions (
            sourceId, registrationUrl, documentationUrl, credentialType,
            steps, requiresInstitutionalEmail, requiresApproval, approvalTimeline,
            requiresPayment, pricingInfo, keyFormat, keyLocation, keyHeaderName,
            exampleRequest, defaultRateLimit, rateLimitPeriod, rateLimitNotes,
            commonIssues, tipsAndTricks
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            registrationUrl = VALUES(registrationUrl),
            documentationUrl = VALUES(documentationUrl),
            credentialType = VALUES(credentialType),
            steps = VALUES(steps),
            requiresInstitutionalEmail = VALUES(requiresInstitutionalEmail),
            requiresApproval = VALUES(requiresApproval),
            approvalTimeline = VALUES(approvalTimeline),
            requiresPayment = VALUES(requiresPayment),
            pricingInfo = VALUES(pricingInfo),
            keyFormat = VALUES(keyFormat),
            keyLocation = VALUES(keyLocation),
            keyHeaderName = VALUES(keyHeaderName),
            exampleRequest = VALUES(exampleRequest),
            defaultRateLimit = VALUES(defaultRateLimit),
            rateLimitPeriod = VALUES(rateLimitPeriod),
            rateLimitNotes = VALUES(rateLimitNotes),
            commonIssues = VALUES(commonIssues),
            tipsAndTricks = VALUES(tipsAndTricks)
        `, [
          sourceId,
          sourceData.instructions.registrationUrl,
          sourceData.instructions.documentationUrl || null,
          sourceData.instructions.credentialType,
          JSON.stringify(sourceData.instructions.steps),
          sourceData.instructions.requiresInstitutionalEmail,
          sourceData.instructions.requiresApproval,
          sourceData.instructions.approvalTimeline || null,
          sourceData.instructions.requiresPayment,
          sourceData.instructions.pricingInfo || null,
          sourceData.instructions.keyFormat || null,
          sourceData.instructions.keyLocation || null,
          sourceData.instructions.keyHeaderName || null,
          sourceData.instructions.exampleRequest || null,
          sourceData.instructions.defaultRateLimit || null,
          sourceData.instructions.rateLimitPeriod || null,
          sourceData.instructions.rateLimitNotes || null,
          sourceData.instructions.commonIssues ? JSON.stringify(sourceData.instructions.commonIssues) : null,
          sourceData.instructions.tipsAndTricks ? JSON.stringify(sourceData.instructions.tipsAndTricks) : null,
        ]);
        console.log(`  ✅ API instructions added/updated\n`);
      } catch (error) {
        console.log(`  ⚠️  API instructions error: ${error.message}\n`);
      }
    }
  }

  console.log('✅ Comprehensive Yemen sources registry seeding complete!');
  console.log(`📊 Total sources processed: ${yemenSources.length}`);
  process.exit(0);
}

seedYemenSources().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
