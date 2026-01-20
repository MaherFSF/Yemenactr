/**
 * YETO Tier 1 Connector Tests
 * 
 * Validates World Bank, IMF, UN, WFP API connectors
 * Tests data retrieval, parsing, and validation
 */

import axios from 'axios';

interface TestResult {
  source: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  message: string;
  dataPoints?: number;
  latency?: number;
  error?: string;
}

/**
 * Test World Bank API
 */
async function testWorldBankConnector(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    // Test World Bank Macro PovcalNet
    const response = await axios.get(
      'https://api.worldbank.org/v2/country/YEM/indicator/NY.GDP.MKTP.CD?format=json&per_page=100',
      { timeout: 10000 }
    );

    const latency = Date.now() - startTime;
    const dataPoints = response.data[1]?.length || 0;

    if (response.status === 200 && dataPoints > 0) {
      return {
        source: 'World Bank',
        status: 'PASS',
        message: `✅ Successfully retrieved ${dataPoints} GDP data points for Yemen`,
        dataPoints,
        latency,
      };
    } else {
      return {
        source: 'World Bank',
        status: 'PARTIAL',
        message: '⚠️  API responded but no data found',
        latency,
      };
    }
  } catch (error) {
    return {
      source: 'World Bank',
      status: 'FAIL',
      message: '❌ World Bank API connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test IMF API
 */
async function testIMFConnector(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    // Test IMF World Economic Outlook
    const response = await axios.get(
      'https://www.imf.org/external/datamapper/api/v1/NGDPD?countries=YEM',
      { timeout: 10000 }
    );

    const latency = Date.now() - startTime;
    const dataPoints = Object.keys(response.data?.data?.NGDPD?.YEM || {}).length;

    if (response.status === 200 && dataPoints > 0) {
      return {
        source: 'IMF',
        status: 'PASS',
        message: `✅ Successfully retrieved ${dataPoints} economic indicators from IMF`,
        dataPoints,
        latency,
      };
    } else {
      return {
        source: 'IMF',
        status: 'PARTIAL',
        message: '⚠️  IMF API responded but limited data',
        latency,
      };
    }
  } catch (error) {
    return {
      source: 'IMF',
      status: 'FAIL',
      message: '❌ IMF API connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test UN Population API
 */
async function testUNConnector(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    // Test UN Population Division
    const response = await axios.get(
      'https://population.un.org/dataportalapi/api/v1/data/indicators/49?pageSize=100&pageNumber=1',
      { timeout: 10000 }
    );

    const latency = Date.now() - startTime;
    const dataPoints = response.data?.data?.length || 0;

    if (response.status === 200 && dataPoints > 0) {
      return {
        source: 'UN Population',
        status: 'PASS',
        message: `✅ Successfully retrieved ${dataPoints} population data points`,
        dataPoints,
        latency,
      };
    } else {
      return {
        source: 'UN Population',
        status: 'PARTIAL',
        message: '⚠️  UN API responded but limited data',
        latency,
      };
    }
  } catch (error) {
    return {
      source: 'UN Population',
      status: 'FAIL',
      message: '❌ UN Population API connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test WFP VAM API
 */
async function testWFPConnector(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    // Test WFP Food Price Monitoring
    const response = await axios.get(
      'https://api.wfp.org/v1/prices?countryCode=YE&pageSize=100',
      {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const latency = Date.now() - startTime;
    const dataPoints = response.data?.data?.length || 0;

    if (response.status === 200 && dataPoints > 0) {
      return {
        source: 'WFP',
        status: 'PASS',
        message: `✅ Successfully retrieved ${dataPoints} food price data points`,
        dataPoints,
        latency,
      };
    } else {
      return {
        source: 'WFP',
        status: 'PARTIAL',
        message: '⚠️  WFP API responded but limited data',
        latency,
      };
    }
  } catch (error) {
    return {
      source: 'WFP',
      status: 'FAIL',
      message: '❌ WFP API connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test UNHCR API
 */
async function testUNHCRConnector(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    // Test UNHCR Refugee Data
    const response = await axios.get(
      'https://data2.unhcr.org/api/stats/population?limit=100&filter=country:YE',
      { timeout: 10000 }
    );

    const latency = Date.now() - startTime;
    const dataPoints = response.data?.data?.length || 0;

    if (response.status === 200 && dataPoints > 0) {
      return {
        source: 'UNHCR',
        status: 'PASS',
        message: `✅ Successfully retrieved ${dataPoints} refugee/IDP data points`,
        dataPoints,
        latency,
      };
    } else {
      return {
        source: 'UNHCR',
        status: 'PARTIAL',
        message: '⚠️  UNHCR API responded but limited data',
        latency,
      };
    }
  } catch (error) {
    return {
      source: 'UNHCR',
      status: 'FAIL',
      message: '❌ UNHCR API connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run all Tier 1 connector tests
 */
export async function runTier1Tests(): Promise<TestResult[]> {
  console.log('\n🚀 Running Tier 1 Connector Tests...\n');
  console.log('='.repeat(80));

  const results: TestResult[] = [];

  // Test each connector
  console.log('Testing World Bank...');
  results.push(await testWorldBankConnector());

  console.log('Testing IMF...');
  results.push(await testIMFConnector());

  console.log('Testing UN Population...');
  results.push(await testUNConnector());

  console.log('Testing WFP...');
  results.push(await testWFPConnector());

  console.log('Testing UNHCR...');
  results.push(await testUNHCRConnector());

  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('📊 Tier 1 Connector Test Results\n');

  let passCount = 0;
  let failCount = 0;
  let partialCount = 0;

  for (const result of results) {
    console.log(`${result.source}:`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Message: ${result.message}`);
    if (result.dataPoints) console.log(`  Data Points: ${result.dataPoints}`);
    if (result.latency) console.log(`  Latency: ${result.latency}ms`);
    if (result.error) console.log(`  Error: ${result.error}`);
    console.log('');

    if (result.status === 'PASS') passCount++;
    else if (result.status === 'FAIL') failCount++;
    else partialCount++;
  }

  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passCount}`);
  console.log(`⚠️  Partial: ${partialCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('='.repeat(80));

  return results;
}

export default {
  runTier1Tests,
  testWorldBankConnector,
  testIMFConnector,
  testUNConnector,
  testWFPConnector,
  testUNHCRConnector,
};
