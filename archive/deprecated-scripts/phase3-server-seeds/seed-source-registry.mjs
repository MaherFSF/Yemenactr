/**
 * Seed Source Registry - Comprehensive contact information and API registration instructions
 * 
 * This script populates:
 * - source_contacts: Contact details for each data source
 * - api_registration_instructions: Step-by-step guides for obtaining API keys
 * 
 * Run with: node server/seed-source-registry.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// ============================================================================
// SOURCE REGISTRY DATA
// ============================================================================

const sourceRegistry = [
  {
    sourceName: 'World Bank',
    sourceId: 1, // Assuming this is the ID in evidence_sources
    contacts: [
      {
        contactType: 'api_support',
        contactName: 'World Bank Data Team',
        email: 'data@worldbank.org',
        department: 'Development Data Group',
        isPrimary: true,
        isActive: true,
      },
      {
        contactType: 'general',
        email: 'datahelp@worldbank.org',
        department: 'Data Help Desk',
        isPrimary: false,
        isActive: true,
      },
    ],
    apiInstructions: {
      registrationUrl: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation',
      documentationUrl: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392',
      credentialType: 'api_key',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No authentication required for public data',
      keyLocation: 'none',
      defaultRateLimit: 120,
      rateLimitPeriod: 'minute',
      rateLimitNotes: '120 requests per minute for anonymous users',
      steps: [
        {
          stepNumber: 1,
          title: 'Good News - No API Key Required!',
          description: 'The World Bank Indicators API is completely open and does not require registration or an API key for public data access.',
          tips: ['You can start using the API immediately', 'Rate limit: 120 requests/minute'],
        },
        {
          stepNumber: 2,
          title: 'Review API Documentation',
          description: 'Visit https://datahelpdesk.worldbank.org/knowledgebase/articles/889392 to understand the API structure and available endpoints.',
          tips: ['Bookmark the documentation page', 'Check available indicators and countries'],
        },
        {
          stepNumber: 3,
          title: 'Test the API',
          description: 'Try a sample request: https://api.worldbank.org/v2/country/YE/indicator/NY.GDP.MKTP.CD?format=json',
          tips: ['Use format=json for JSON responses', 'Add per_page parameter for pagination'],
        },
      ],
      exampleRequest: `curl "https://api.worldbank.org/v2/country/YE/indicator/NY.GDP.MKTP.CD?format=json&date=2010:2024"`,
      commonIssues: [
        {
          issue: 'Empty response or no data',
          solution: 'Check if the indicator code is correct and data is available for Yemen (country code: YE)',
        },
        {
          issue: 'Rate limit exceeded',
          solution: 'Implement exponential backoff and respect the 120 requests/minute limit',
        },
      ],
      tipsAndTricks: [
        'Use the date parameter with range format: date=2010:2024',
        'Add per_page=1000 to get more results per request',
        'Use MRV (Most Recent Value) parameter for latest data: MRV=1',
        'Country code for Yemen is "YE"',
      ],
    },
  },
  {
    sourceName: 'International Monetary Fund (IMF)',
    sourceId: 2,
    contacts: [
      {
        contactType: 'api_support',
        contactName: 'IMF Data Team',
        email: 'data@imf.org',
        department: 'Statistics Department',
        isPrimary: true,
        isActive: true,
      },
    ],
    apiInstructions: {
      registrationUrl: 'https://datahelp.imf.org/knowledgebase/articles/667681-using-json-restful-web-service',
      documentationUrl: 'https://datahelp.imf.org/knowledgebase/articles/667681',
      credentialType: 'api_key',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No authentication required',
      keyLocation: 'none',
      defaultRateLimit: 50,
      rateLimitPeriod: 'minute',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Key Required',
          description: 'IMF Data API is open and free. No registration or API key needed.',
          tips: ['Start using immediately', 'Rate limit: ~50 requests/minute'],
        },
        {
          stepNumber: 2,
          title: 'Understand the API Structure',
          description: 'IMF uses SDMX-JSON format. Review the documentation at https://datahelp.imf.org/knowledgebase/articles/667681',
          tips: ['Familiarize yourself with SDMX structure', 'Understand dimension codes'],
        },
        {
          stepNumber: 3,
          title: 'Test with Yemen Data',
          description: 'Try fetching International Financial Statistics (IFS) data for Yemen.',
          tips: ['Country code for Yemen: 474', 'Use IFS database for most indicators'],
        },
      ],
      exampleRequest: `curl "https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH/YEM"`,
      commonIssues: [
        {
          issue: 'Complex SDMX format',
          solution: 'Use the simplified DataMapper API: https://www.imf.org/external/datamapper/api/v1/',
        },
        {
          issue: 'Country code confusion',
          solution: 'Yemen country code is "YEM" (ISO3) or "474" (IMF code)',
        },
      ],
      tipsAndTricks: [
        'Use DataMapper API for simpler JSON responses',
        'Check available datasets: https://www.imf.org/external/datamapper/datasets',
        'Yemen ISO3 code: YEM',
      ],
    },
  },
  {
    sourceName: 'Humanitarian Data Exchange (HDX)',
    sourceId: 3,
    contacts: [
      {
        contactType: 'api_support',
        contactName: 'HDX Team',
        email: 'hdx@un.org',
        department: 'OCHA Centre for Humanitarian Data',
        isPrimary: true,
        isActive: true,
      },
      {
        contactType: 'general',
        email: 'hdx.feedback@un.org',
        department: 'Support Team',
        isPrimary: false,
        isActive: true,
      },
    ],
    apiInstructions: {
      registrationUrl: 'https://data.humdata.org/api/3/action/package_search',
      documentationUrl: 'https://hdx-hxl-preview.readthedocs.io/en/latest/',
      credentialType: 'api_key',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No authentication required for read operations',
      keyLocation: 'none',
      defaultRateLimit: 100,
      rateLimitPeriod: 'minute',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Key Required for Read Access',
          description: 'HDX CKAN API allows free read access without authentication. API keys are only needed for write operations.',
          tips: ['Read access is completely open', 'No registration needed'],
        },
        {
          stepNumber: 2,
          title: 'Explore Yemen Datasets',
          description: 'Search for Yemen-specific datasets using the package_search endpoint with query parameter "yemen".',
          tips: ['Use filters for specific topics', 'Check dataset update frequency'],
        },
        {
          stepNumber: 3,
          title: 'Access Dataset Resources',
          description: 'Each dataset contains multiple resources (CSV, Excel, etc.). Use resource IDs to download data.',
          tips: ['Prefer CSV format for programmatic access', 'Check resource last_modified date'],
        },
      ],
      exampleRequest: `curl "https://data.humdata.org/api/3/action/package_search?q=yemen&rows=100"`,
      commonIssues: [
        {
          issue: 'Large dataset downloads timing out',
          solution: 'Download resources directly using the resource URL instead of API',
        },
        {
          issue: 'Outdated data',
          solution: 'Check the "last_modified" field and contact dataset maintainer if stale',
        },
      ],
      tipsAndTricks: [
        'Use HXL tags for standardized humanitarian data',
        'Filter by organization: fq=organization:ocha-yemen',
        'Sort by relevance or last_modified',
        'Yemen datasets: https://data.humdata.org/group/yem',
      ],
    },
  },
  {
    sourceName: 'ACLED (Armed Conflict Location & Event Data Project)',
    sourceId: 4,
    contacts: [
      {
        contactType: 'api_support',
        contactName: 'ACLED Data Team',
        email: 'info@acleddata.com',
        department: 'Data Access',
        isPrimary: true,
        isActive: true,
      },
    ],
    apiInstructions: {
      registrationUrl: 'https://developer.acleddata.com/',
      documentationUrl: 'https://apidocs.acleddata.com/',
      credentialType: 'api_key',
      requiresInstitutionalEmail: true,
      requiresApproval: true,
      approvalTimeline: '1-2 business days',
      requiresPayment: false,
      pricingInfo: 'Free for academic and non-commercial use. Commercial licenses available.',
      keyFormat: 'API key and email in query parameters',
      keyLocation: 'query_param',
      keyHeaderName: 'key and email parameters',
      defaultRateLimit: 5000,
      rateLimitPeriod: 'day',
      rateLimitNotes: '5,000 requests per day for free tier',
      steps: [
        {
          stepNumber: 1,
          title: 'Register for ACLED Access',
          description: 'Visit https://developer.acleddata.com/ and click "Register" to create an account.',
          tips: ['Use institutional email if available', 'Provide detailed use case description'],
        },
        {
          stepNumber: 2,
          title: 'Request API Access',
          description: 'After registration, request API access by filling out the access form. Specify that you need Yemen conflict data for economic analysis.',
          tips: ['Mention YETO platform and transparency mission', 'Approval typically takes 1-2 business days'],
        },
        {
          stepNumber: 3,
          title: 'Receive API Credentials',
          description: 'You will receive an API key and access email via email. Store these securely.',
          tips: ['Save the email and key immediately', 'Do not share credentials publicly'],
        },
        {
          stepNumber: 4,
          title: 'Test API Access',
          description: 'Test your credentials with a sample request for Yemen (country code: Yemen).',
          tips: ['Use limit parameter to test with small dataset first', 'Check response format'],
        },
      ],
      exampleRequest: `curl "https://api.acleddata.com/acled/read?key=YOUR_API_KEY&email=YOUR_EMAIL&country=Yemen&year=2024&limit=100"`,
      commonIssues: [
        {
          issue: 'API key not working',
          solution: 'Ensure both "key" and "email" parameters are included in every request',
        },
        {
          issue: 'Rate limit exceeded',
          solution: 'Free tier allows 5,000 requests/day. Implement caching and batch requests.',
        },
        {
          issue: 'Missing recent data',
          solution: 'ACLED updates weekly. Check the "last_update" field in response.',
        },
      ],
      tipsAndTricks: [
        'Use year_where parameter for date ranges: year_where=BETWEEN|2020|2024',
        'Filter by event type: event_type=Battles',
        'Yemen country name in API: "Yemen"',
        'Export format: add &export_format=csv for CSV output',
        'Batch requests by year to stay within rate limits',
      ],
    },
  },
  {
    sourceName: 'FEWS NET (Famine Early Warning Systems Network)',
    sourceId: 5,
    contacts: [
      {
        contactType: 'data_team',
        contactName: 'FEWS NET Data Team',
        email: 'info@fews.net',
        department: 'Data and Analysis',
        isPrimary: true,
        isActive: true,
      },
    ],
    apiInstructions: {
      registrationUrl: 'https://fews.net/data',
      documentationUrl: 'https://fews.net/data-api',
      credentialType: 'api_key',
      requiresInstitutionalEmail: false,
      requiresApproval: false,
      requiresPayment: false,
      keyFormat: 'No authentication required for public data',
      keyLocation: 'none',
      steps: [
        {
          stepNumber: 1,
          title: 'No API Key Required',
          description: 'FEWS NET provides open access to food security data without authentication.',
          tips: ['Public data is freely accessible', 'No registration needed'],
        },
        {
          stepNumber: 2,
          title: 'Access Yemen Food Security Data',
          description: 'Navigate to https://fews.net/east-africa/yemen for Yemen-specific reports and data.',
          tips: ['Reports are published monthly', 'Check IPC classifications'],
        },
        {
          stepNumber: 3,
          title: 'Download Data Files',
          description: 'FEWS NET provides data in various formats (PDF, Excel, Shapefiles). Download programmatically or manually.',
          tips: ['Price data is available in Excel format', 'Shapefiles for geographic analysis'],
        },
      ],
      exampleRequest: `# FEWS NET does not have a traditional REST API
# Data is accessed via direct file downloads from https://fews.net/data`,
      commonIssues: [
        {
          issue: 'No structured API',
          solution: 'FEWS NET relies on file downloads. Use web scraping or manual downloads.',
        },
        {
          issue: 'Data in PDF format',
          solution: 'Use PDF parsing tools to extract tables and text data.',
        },
      ],
      tipsAndTricks: [
        'Check the "Price Bulletin" for market data',
        'IPC classifications are updated quarterly',
        'Yemen page: https://fews.net/east-africa/yemen',
        'Subscribe to email alerts for new reports',
      ],
    },
  },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seedSourceRegistry() {
  console.log('🌱 Seeding source registry...\n');

  for (const source of sourceRegistry) {
    console.log(`📍 Processing: ${source.sourceName}`);

    // Insert contacts
    for (const contact of source.contacts) {
      try {
        await db.execute(`
          INSERT INTO source_contacts (sourceId, contactType, contactName, email, department, role, notes, isPrimary, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          source.sourceId,
          contact.contactType,
          contact.contactName || null,
          contact.email,
          contact.department || null,
          contact.role || null,
          contact.notes || null,
          contact.isPrimary,
          contact.isActive,
        ]);
        console.log(`  ✅ Contact added: ${contact.email} (${contact.contactType})`);
      } catch (error) {
        console.log(`  ⚠️  Contact skipped (may already exist): ${contact.email}`);
      }
    }

    // Insert API instructions
    try {
      await db.execute(`
        INSERT INTO api_registration_instructions (
          sourceId, registrationUrl, documentationUrl, credentialType,
          steps, requiresInstitutionalEmail, requiresApproval, approvalTimeline,
          requiresPayment, pricingInfo, keyFormat, keyLocation, keyHeaderName,
          exampleRequest, defaultRateLimit, rateLimitPeriod, rateLimitNotes,
          commonIssues, tipsAndTricks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        source.sourceId,
        source.apiInstructions.registrationUrl,
        source.apiInstructions.documentationUrl || null,
        source.apiInstructions.credentialType,
        JSON.stringify(source.apiInstructions.steps),
        source.apiInstructions.requiresInstitutionalEmail,
        source.apiInstructions.requiresApproval,
        source.apiInstructions.approvalTimeline || null,
        source.apiInstructions.requiresPayment,
        source.apiInstructions.pricingInfo || null,
        source.apiInstructions.keyFormat || null,
        source.apiInstructions.keyLocation || null,
        source.apiInstructions.keyHeaderName || null,
        source.apiInstructions.exampleRequest || null,
        source.apiInstructions.defaultRateLimit || null,
        source.apiInstructions.rateLimitPeriod || null,
        source.apiInstructions.rateLimitNotes || null,
        source.apiInstructions.commonIssues ? JSON.stringify(source.apiInstructions.commonIssues) : null,
        source.apiInstructions.tipsAndTricks ? JSON.stringify(source.apiInstructions.tipsAndTricks) : null,
      ]);
      console.log(`  ✅ API instructions added\n`);
    } catch (error) {
      console.log(`  ⚠️  API instructions skipped (may already exist)\n`);
    }
  }

  console.log('✅ Source registry seeding complete!');
  process.exit(0);
}

seedSourceRegistry().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
