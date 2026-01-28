#!/usr/bin/env node
/**
 * YETO Platform - Expanded Data Sources Seed Script
 * 
 * This script seeds 20 additional Yemen-specific data sources from parallel research
 * into the evidence_sources, source_contacts, and api_registration_instructions tables.
 * 
 * Run with: node scripts/seed-expanded-sources.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 20 New Yemen-Specific Data Sources from Parallel Research
const newSources = [
  {
    name: 'OCHA Yemen - UN Office for Coordination of Humanitarian Affairs',
    nameAr: 'مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية - اليمن',
    acronym: 'OCHA',
    category: 'humanitarian',
    trustLevel: 'high',
    baseUrl: 'https://www.unocha.org/yemen',
    apiEndpoint: 'https://hapi.humdata.org/api/v2',
    apiType: 'rest',
    updateFrequency: 'irregular',
    notes: 'Humanitarian needs, operational presence, funding, conflict events, food security, food prices, poverty rate, IDPs, refugees, migrants, health facilities',
    contact: {
      email: 'hdx@un.org',
      department: 'Humanitarian Data Exchange',
      contactType: 'api_support'
    },
    apiInstructions: {
      registrationUrl: 'https://hapi.humdata.org/',
      documentationUrl: 'https://hapi.humdata.org/',
      credentialType: 'api_key',
      steps: [
        { stepNumber: 1, title: 'Generate App Identifier', description: 'Encode an application name and email address using the /api/v2/encode_app_identifier endpoint' },
        { stepNumber: 2, title: 'Include Identifier', description: 'Include the app_identifier as a query parameter or as an X-HDX-HAPI-APP-IDENTIFIER header in all API requests' }
      ],
      requiresApproval: false,
      keyLocation: 'header',
      keyHeaderName: 'X-HDX-HAPI-APP-IDENTIFIER',
      rateLimitNotes: 'Maximum of 10,000 records per request'
    }
  },
  {
    name: 'CEIC Data',
    nameAr: 'بيانات CEIC',
    acronym: 'CEIC',
    category: 'ifi',
    trustLevel: 'high',
    baseUrl: 'https://www.ceicdata.com/en',
    apiEndpoint: null,
    apiType: 'none',
    updateFrequency: 'monthly',
    notes: 'National Accounts, Production, Government and Public Finance, Demographic and Labour Market, Domestic Trade, Inflation, Foreign Trade. Coverage: 1990-present',
    contact: {
      email: 'indiaoffice@isimarkets.com',
      department: 'Sales',
      contactType: 'partnership'
    },
    apiInstructions: {
      registrationUrl: 'https://info.ceicdata.com/api-and-data-feed-solution',
      documentationUrl: 'https://info.ceicdata.com/api-and-data-feed-solution',
      credentialType: 'api_key',
      steps: [
        { stepNumber: 1, title: 'Visit API Page', description: 'Visit the CEIC API and Data Feed solution page' },
        { stepNumber: 2, title: 'Request Demo', description: 'Fill out the Request Demo form with your contact information' },
        { stepNumber: 3, title: 'Wait for Contact', description: 'A CEIC representative will contact you to discuss your data needs and provide API access' }
      ],
      requiresApproval: true,
      requiresPayment: true,
      pricingInfo: 'Enterprise subscription required'
    }
  },
  {
    name: 'IOM DTM Yemen - Displacement Tracking Matrix',
    nameAr: 'مصفوفة تتبع النزوح - اليمن',
    acronym: 'IOM-DTM',
    category: 'humanitarian',
    trustLevel: 'high',
    baseUrl: 'https://dtm.iom.int/yemen',
    apiEndpoint: null,
    apiType: 'manual',
    updateFrequency: 'irregular',
    notes: 'Displacement, returnees, migrants, humanitarian data. Coverage: 2015-present',
    contact: {
      email: 'iomYemenDTM@iom.int',
      department: 'DTM Yemen',
      contactType: 'data_team'
    },
    apiInstructions: null
  },
  {
    name: 'Armed Conflict Location & Event Data Project (ACLED)',
    nameAr: 'مشروع بيانات موقع وحدث النزاع المسلح',
    acronym: 'ACLED',
    category: 'academic',
    trustLevel: 'high',
    baseUrl: 'https://acleddata.com/',
    apiEndpoint: 'https://api.acleddata.com/acled/read',
    apiType: 'rest',
    updateFrequency: 'weekly',
    notes: 'Political violence, demonstrations, strategic developments. Coverage: 2015-present',
    contact: {
      email: 'access@acleddata.com',
      department: 'Data Access',
      contactType: 'api_support'
    },
    apiInstructions: {
      registrationUrl: 'https://acleddata.com/user/register',
      documentationUrl: 'https://acleddata.com/acled-api-documentation/',
      credentialType: 'api_key',
      steps: [
        { stepNumber: 1, title: 'Visit Signup Page', description: 'Navigate to the ACLED user registration page' },
        { stepNumber: 2, title: 'Create Account', description: 'Fill out the registration form with your details' },
        { stepNumber: 3, title: 'Request API Key', description: 'Request an API key from your account dashboard' }
      ],
      requiresApproval: false,
      keyLocation: 'query_param',
      defaultRateLimit: 5000,
      rateLimitPeriod: 'request',
      rateLimitNotes: '5000 rows per request'
    }
  },
  {
    name: 'Yemen Data Project',
    nameAr: 'مشروع بيانات اليمن',
    acronym: 'YDP',
    category: 'think_tank',
    trustLevel: 'medium',
    baseUrl: 'https://yemendataproject.org/',
    apiEndpoint: null,
    apiType: 'manual',
    updateFrequency: 'irregular',
    notes: 'Airstrikes, civilian casualties, military operations. Coverage: 2015-present',
    contact: {
      email: 'contact@yemendataproject.org',
      department: 'Data Team',
      contactType: 'data_team'
    },
    apiInstructions: null
  },
  {
    name: 'WFP VAM - Vulnerability Analysis and Mapping',
    nameAr: 'تحليل وخرائط الضعف - برنامج الأغذية العالمي',
    acronym: 'WFP-VAM',
    category: 'humanitarian',
    trustLevel: 'high',
    baseUrl: 'https://dataviz.vam.wfp.org/the-middle-east-and-northern-africa/yemen/overview',
    apiEndpoint: null,
    apiType: 'rest',
    updateFrequency: 'irregular',
    notes: 'Climate, Economic (Prices, Market Assessment, Exchange Rates, Inflation), Conflict and Displacement, Food Security',
    contact: {
      email: 'wfp.economicanalysis@wfp.org',
      department: 'Economic Analysis',
      contactType: 'data_team'
    },
    apiInstructions: {
      registrationUrl: 'https://github.com/WFP-VAM/DataBridgesAPI',
      documentationUrl: 'https://github.com/WFP-VAM/DataBridgesAPI',
      credentialType: 'api_key',
      steps: [
        { stepNumber: 1, title: 'Contact WFP', description: 'Contact wfp.economicanalysis@wfp.org to request API access' }
      ],
      requiresApproval: true
    }
  },
  {
    name: 'IPC - Integrated Food Security Phase Classification',
    nameAr: 'التصنيف المرحلي المتكامل للأمن الغذائي',
    acronym: 'IPC',
    category: 'humanitarian',
    trustLevel: 'high',
    baseUrl: 'https://www.ipcinfo.org/ipc-country-analysis/en/?country=YE',
    apiEndpoint: null,
    apiType: 'manual',
    updateFrequency: 'irregular',
    notes: 'Acute Food Insecurity, Chronic Food Insecurity, Acute Malnutrition. Coverage: 2022-present',
    contact: {
      email: 'IPC@fao.org',
      department: 'IPC Global Support Unit',
      contactType: 'data_team'
    },
    apiInstructions: null
  },
  {
    name: 'UNHCR Yemen - UN Refugee Agency',
    nameAr: 'المفوضية السامية للأمم المتحدة لشؤون اللاجئين - اليمن',
    acronym: 'UNHCR',
    category: 'humanitarian',
    trustLevel: 'high',
    baseUrl: 'https://www.unhcr.org/yemen',
    apiEndpoint: 'https://data.unhcr.org/api',
    apiType: 'rest',
    updateFrequency: 'irregular',
    notes: 'Refugee and asylum seeker data, IDPs data, population data, protection data, shelter data, cash assistance data. Coverage: 2012-present',
    contact: {
      email: 'yemsa@unhcr.org',
      department: 'Yemen Operations',
      contactType: 'data_team'
    },
    apiInstructions: {
      registrationUrl: 'https://data.unhcr.org/api',
      documentationUrl: 'https://data.unhcr.org/api/doc',
      credentialType: 'api_key',
      steps: [
        { stepNumber: 1, title: 'Access API', description: 'No registration required - open access API' }
      ],
      requiresApproval: false
    }
  },
  {
    name: 'World Health Organization (WHO) - Yemen',
    nameAr: 'منظمة الصحة العالمية - اليمن',
    acronym: 'WHO',
    category: 'un_agency',
    trustLevel: 'high',
    baseUrl: 'https://data.who.int/countries/887',
    apiEndpoint: null,
    apiType: 'manual',
    updateFrequency: 'irregular',
    notes: 'Population, Health expenditure, Life expectancy, Causes of death, Health status, Risk factors, Service coverage, Health systems. Coverage: 2000-present',
    contact: {
      email: 'emrgocom@who.int',
      department: 'Eastern Mediterranean Regional Office',
      contactType: 'general'
    },
    apiInstructions: null
  },
  {
    name: 'UNICEF MICS Yemen - Multiple Indicator Cluster Surveys',
    nameAr: 'المسوح العنقودية متعددة المؤشرات - يونيسف اليمن',
    acronym: 'UNICEF-MICS',
    category: 'un_agency',
    trustLevel: 'high',
    baseUrl: 'https://mics.unicef.org/',
    apiEndpoint: 'https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/',
    apiType: 'sdmx',
    updateFrequency: 'irregular',
    notes: 'Child welfare, health, education, child protection. Coverage: 2006-2023',
    contact: {
      email: 'mics@unicef.org',
      department: 'MICS Programme',
      contactType: 'data_team'
    },
    apiInstructions: {
      registrationUrl: 'https://mics.unicef.org/surveys',
      documentationUrl: 'https://data.unicef.org/sdmx-api-documentation/',
      credentialType: 'api_key',
      steps: [
        { stepNumber: 1, title: 'Visit MICS Website', description: 'Navigate to the UNICEF MICS website' },
        { stepNumber: 2, title: 'Register Account', description: 'Register for an account to get access to the datasets' },
        { stepNumber: 3, title: 'Download Datasets', description: 'Download the required datasets' }
      ],
      requiresApproval: false
    }
  },
  {
    name: 'FAO GIEWS - Global Information and Early Warning System',
    nameAr: 'نظام المعلومات والإنذار المبكر العالمي - الفاو',
    acronym: 'FAO-GIEWS',
    category: 'un_agency',
    trustLevel: 'high',
    baseUrl: 'https://www.fao.org/giews/en/',
    apiEndpoint: 'https://data.apps.fao.org/giews-share-config-generator',
    apiType: 'rest',
    updateFrequency: 'irregular',
    notes: 'Cereal production, imports, food security, agricultural stress, drought intensity, vegetation health, crop phenology. Coverage: 1980-present',
    contact: {
      email: null,
      department: 'GIEWS',
      contactType: 'data_team'
    },
    apiInstructions: {
      registrationUrl: 'https://data.apps.fao.org/giews-share-config-generator',
      documentationUrl: 'https://data.apps.fao.org/giews-share-config-generator?help',
      credentialType: 'api_key',
      steps: [
        { stepNumber: 1, title: 'Access API', description: 'No registration required - open access API' }
      ],
      requiresApproval: false
    }
  },
  {
    name: 'Trading Economics',
    nameAr: 'تريدينج إيكونوميكس',
    acronym: 'TE',
    category: 'other',
    trustLevel: 'medium',
    baseUrl: 'https://tradingeconomics.com',
    apiEndpoint: 'https://api.tradingeconomics.com',
    apiType: 'rest',
    updateFrequency: 'irregular',
    notes: 'GDP, inflation, trade, population, economic indicators and forecasts. Coverage: 1960-present',
    contact: {
      email: 'contact@tradingeconomics.com',
      department: 'Support',
      contactType: 'api_support'
    },
    apiInstructions: {
      registrationUrl: 'https://tradingeconomics.com/analytics/pricing.aspx',
      documentationUrl: 'https://docs.tradingeconomics.com',
      credentialType: 'api_key',
      steps: [
        { stepNumber: 1, title: 'Visit Pricing Page', description: 'Navigate to the Trading Economics pricing page' },
        { stepNumber: 2, title: 'Choose Plan', description: 'Select a subscription plan that fits your needs' },
        { stepNumber: 3, title: 'Create Account', description: 'Create an account and complete payment' },
        { stepNumber: 4, title: 'Get API Key', description: 'Receive your API key after subscription' }
      ],
      requiresApproval: false,
      requiresPayment: true,
      pricingInfo: 'Subscription required - various tiers available',
      defaultRateLimit: 1,
      rateLimitPeriod: 'second',
      rateLimitNotes: '1 request per second. Max 10000 rows for historical data, 1000 rows for Economic Calendar. 260 character limit per call.'
    }
  },
  {
    name: 'Statista',
    nameAr: 'ستاتيستا',
    acronym: 'STAT',
    category: 'other',
    trustLevel: 'medium',
    baseUrl: 'https://www.statista.com/topics/4141/yemen/',
    apiEndpoint: 'https://api.statista.com/v2/',
    apiType: 'rest',
    updateFrequency: 'irregular',
    notes: 'GDP, inflation, trade, population, infant mortality, life expectancy, unemployment, national debt. Coverage: 1960-present',
    contact: {
      email: 'connect@statista.com',
      department: 'API Support',
      contactType: 'api_support'
    },
    apiInstructions: {
      registrationUrl: 'https://forms.office.com/pages/responsepage.aspx?id=OfiFB67f4U-gaID-j8YfKwI-9bbupjFMnubBsPP0QlRUMjZNOFczSjA4NkdFN0U4ODVORU5GTFIxTyQlQCN0PWcu&route=shorturl',
      documentationUrl: 'https://statista.mintlify.app/start/introduction',
      credentialType: 'api_key',
      steps: [
        { stepNumber: 1, title: 'Fill Questionnaire', description: 'Visit the questionnaire page and fill out the form' },
        { stepNumber: 2, title: 'Submit Form', description: 'Submit the form with your company and contact information' },
        { stepNumber: 3, title: 'Wait for Contact', description: 'Wait for Statista to get in touch with an API key' }
      ],
      requiresApproval: true,
      requiresPayment: true,
      pricingInfo: 'Enterprise subscription required'
    }
  },
  {
    name: 'Knoema (Seek)',
    nameAr: 'نوما (سيك)',
    acronym: 'SEEK',
    category: 'other',
    trustLevel: 'low',
    baseUrl: 'https://seekinsights.com/',
    apiEndpoint: null,
    apiType: 'none',
    updateFrequency: 'irregular',
    notes: 'Rebranded to Seek. Contact sales for subscription information.',
    contact: {
      email: null,
      department: 'Sales',
      contactType: 'partnership'
    },
    apiInstructions: null
  },
  {
    name: 'Macrotrends',
    nameAr: 'ماكروتريندز',
    acronym: 'MT',
    category: 'other',
    trustLevel: 'low',
    baseUrl: 'https://www.macrotrends.net/',
    apiEndpoint: null,
    apiType: 'manual',
    updateFrequency: 'annual',
    notes: 'GDP, GDP Growth Rate, GDP Per Capita, Debt to GDP, Inflation Rate, Manufacturing, GNI, Population, Trade, Health, Education, Labor Force. Coverage: 1990-2018',
    contact: {
      email: null,
      department: null,
      contactType: 'general'
    },
    apiInstructions: null
  },
  {
    name: 'TheGlobalEconomy.com',
    nameAr: 'الاقتصاد العالمي',
    acronym: 'TGE',
    category: 'other',
    trustLevel: 'medium',
    baseUrl: 'https://www.theglobaleconomy.com/',
    apiEndpoint: null,
    apiType: 'rest',
    updateFrequency: 'irregular',
    notes: 'GDP, inflation, trade, population, economic growth, investment, consumption, retail sales, private credit, interest rates, labor cost, employment. Coverage: 1960-present',
    contact: {
      email: 'neven.valev@theglobaleconomy.com',
      department: 'Data Services',
      contactType: 'api_support'
    },
    apiInstructions: {
      registrationUrl: 'https://www.theglobaleconomy.com/data_feed_api.php',
      documentationUrl: 'https://www.theglobaleconomy.com/data_feed_api.php',
      credentialType: 'api_key',
      steps: [
        { stepNumber: 1, title: 'Contact Provider', description: 'Contact neven.valev@theglobaleconomy.com to request a free trial or subscription' },
        { stepNumber: 2, title: 'Obtain Credentials', description: 'Obtain login credentials after payment or approval' },
        { stepNumber: 3, title: 'Access Data Feed', description: 'Log in to access the data feed' }
      ],
      requiresApproval: true,
      requiresPayment: true,
      pricingInfo: 'Subscription required'
    }
  },
  {
    name: 'Index Mundi',
    nameAr: 'إندكس موندي',
    acronym: 'IM',
    category: 'other',
    trustLevel: 'low',
    baseUrl: 'https://www.indexmundi.com/yemen/',
    apiEndpoint: null,
    apiType: 'manual',
    updateFrequency: 'irregular',
    notes: 'GDP, inflation, trade, population, Demographics, Environment, Government, Economy, Energy, Telecommunications, Transportation, Military. Coverage: 2000-2021',
    contact: {
      email: 'webmaster@indexmundi.com',
      department: null,
      contactType: 'general'
    },
    apiInstructions: null
  },
  {
    name: 'Google Data Commons',
    nameAr: 'مشاع بيانات جوجل',
    acronym: 'GDC',
    category: 'other',
    trustLevel: 'high',
    baseUrl: 'https://datacommons.org/',
    apiEndpoint: 'https://api.datacommons.org',
    apiType: 'rest',
    updateFrequency: 'irregular',
    notes: 'Economics, Health, Equity, Demographics, Environment, Energy. Coverage varies by dataset.',
    contact: {
      email: null,
      department: 'Data Commons Team',
      contactType: 'api_support'
    },
    apiInstructions: {
      registrationUrl: 'https://apikeys.datacommons.org',
      documentationUrl: 'https://docs.datacommons.org/api/',
      credentialType: 'api_key',
      steps: [
        { stepNumber: 1, title: 'Visit API Keys Page', description: 'Navigate to https://apikeys.datacommons.org' },
        { stepNumber: 2, title: 'Request API Key', description: 'Request an API key for the desired hostname (e.g., api.datacommons.org)' },
        { stepNumber: 3, title: 'Enable APIs', description: 'Enable the APIs you want to use' }
      ],
      requiresApproval: false
    }
  },
  {
    name: 'Our World In Data',
    nameAr: 'عالمنا في بيانات',
    acronym: 'OWID',
    category: 'academic',
    trustLevel: 'high',
    baseUrl: 'https://ourworldindata.org/',
    apiEndpoint: 'https://ourworldindata.org',
    apiType: 'rest',
    updateFrequency: 'irregular',
    notes: 'Population, GDP, life expectancy, birth rate, CO2 emissions, energy consumption, agricultural output, and many others. Coverage varies by indicator.',
    contact: {
      email: 'info@ourworldindata.org',
      department: 'Data Team',
      contactType: 'data_team'
    },
    apiInstructions: {
      registrationUrl: 'https://ourworldindata.org',
      documentationUrl: 'https://docs.owid.io/projects/etl/api/',
      credentialType: 'api_key',
      steps: [
        { stepNumber: 1, title: 'Access API', description: 'No registration required - open access API' }
      ],
      requiresApproval: false
    }
  },
  {
    name: 'SIPRI Arms Transfers Database',
    nameAr: 'قاعدة بيانات نقل الأسلحة - سيبري',
    acronym: 'SIPRI',
    category: 'academic',
    trustLevel: 'high',
    baseUrl: 'https://www.sipri.org/databases/armstransfers',
    apiEndpoint: null,
    apiType: 'manual',
    updateFrequency: 'annual',
    notes: 'Military equipment transfers. Coverage: 1950-present. Non-commercial use.',
    contact: {
      email: 'atp@sipri.org',
      department: 'Arms Transfers Programme',
      contactType: 'data_team'
    },
    apiInstructions: null
  }
];

async function seedExpandedSources() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  console.log('🌐 Connecting to database...');
  const conn = await mysql.createConnection(connectionString);

  try {
    console.log('\n📚 Seeding 20 new Yemen-specific data sources...\n');
    
    let sourcesAdded = 0;
    let contactsAdded = 0;
    let instructionsAdded = 0;

    for (const source of newSources) {
      // Check if source already exists
      const [existing] = await conn.execute(
        'SELECT id FROM evidence_sources WHERE name = ? OR acronym = ?',
        [source.name, source.acronym]
      );

      let sourceId;
      if (existing.length > 0) {
        sourceId = existing[0].id;
        console.log(`  ⏭️  ${source.acronym}: Already exists (ID: ${sourceId})`);
      } else {
        // Insert new source
        const [result] = await conn.execute(`
          INSERT INTO evidence_sources 
          (name, nameAr, acronym, category, trustLevel, baseUrl, apiEndpoint, apiType, updateFrequency, notes, isWhitelisted)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `, [
          source.name,
          source.nameAr,
          source.acronym,
          source.category,
          source.trustLevel,
          source.baseUrl,
          source.apiEndpoint,
          source.apiType,
          source.updateFrequency,
          source.notes
        ]);
        sourceId = result.insertId;
        sourcesAdded++;
        console.log(`  ✅ ${source.acronym}: Added (ID: ${sourceId})`);
      }

      // Add contact if provided
      if (source.contact && source.contact.email) {
        const [existingContact] = await conn.execute(
          'SELECT id FROM source_contacts WHERE sourceId = ? AND email = ?',
          [sourceId, source.contact.email]
        );

        if (existingContact.length === 0) {
          await conn.execute(`
            INSERT INTO source_contacts 
            (sourceId, contactType, email, department, isPrimary, isActive)
            VALUES (?, ?, ?, ?, 1, 1)
          `, [
            sourceId,
            source.contact.contactType,
            source.contact.email,
            source.contact.department
          ]);
          contactsAdded++;
        }
      }

      // Add API registration instructions if provided
      if (source.apiInstructions) {
        const [existingInstr] = await conn.execute(
          'SELECT id FROM api_registration_instructions WHERE sourceId = ?',
          [sourceId]
        );

        if (existingInstr.length === 0) {
          await conn.execute(`
            INSERT INTO api_registration_instructions 
            (sourceId, registrationUrl, documentationUrl, credentialType, steps, requiresApproval, requiresPayment, pricingInfo, keyLocation, keyHeaderName, defaultRateLimit, rateLimitPeriod, rateLimitNotes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            sourceId,
            source.apiInstructions.registrationUrl,
            source.apiInstructions.documentationUrl || null,
            source.apiInstructions.credentialType,
            JSON.stringify(source.apiInstructions.steps),
            source.apiInstructions.requiresApproval ? 1 : 0,
            source.apiInstructions.requiresPayment ? 1 : 0,
            source.apiInstructions.pricingInfo || null,
            source.apiInstructions.keyLocation || null,
            source.apiInstructions.keyHeaderName || null,
            source.apiInstructions.defaultRateLimit || null,
            source.apiInstructions.rateLimitPeriod || null,
            source.apiInstructions.rateLimitNotes || null
          ]);
          instructionsAdded++;
        }
      }
    }

    // Get total counts
    const [totalSources] = await conn.execute('SELECT COUNT(*) as count FROM evidence_sources');
    const [totalContacts] = await conn.execute('SELECT COUNT(*) as count FROM source_contacts');
    const [totalInstructions] = await conn.execute('SELECT COUNT(*) as count FROM api_registration_instructions');

    console.log('\n' + '='.repeat(60));
    console.log('📊 SEED SUMMARY');
    console.log('='.repeat(60));
    console.log(`  New sources added:      ${sourcesAdded}`);
    console.log(`  New contacts added:     ${contactsAdded}`);
    console.log(`  New instructions added: ${instructionsAdded}`);
    console.log('');
    console.log(`  Total evidence_sources:              ${totalSources[0].count}`);
    console.log(`  Total source_contacts:               ${totalContacts[0].count}`);
    console.log(`  Total api_registration_instructions: ${totalInstructions[0].count}`);
    console.log('='.repeat(60));
    console.log('\n✅ Expanded sources seed complete!');

  } catch (error) {
    console.error('❌ Error seeding sources:', error);
    throw error;
  } finally {
    await conn.end();
  }
}

seedExpandedSources().catch(console.error);
