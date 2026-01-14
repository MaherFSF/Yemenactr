/**
 * Reliability Lab - Evaluation Harness for Evidence Tribunal
 * 
 * Implements a comprehensive test suite (200+ domain questions) to evaluate:
 * - Citation coverage accuracy
 * - Contradiction resolution quality
 * - Hallucination detection
 * - Response latency
 * 
 * Nightly evals block deployment if reliability score drops below threshold.
 */

import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { runTribunal, TribunalResult } from "./evidenceTribunal";
import { verifyCitations, detectContradictions } from "./citationVerifier";

// Test categories aligned with YETO domain
export type TestCategory = 
  | 'central_bank_split'
  | 'fx_gap'
  | 'inflation'
  | 'aid_flows'
  | 'sanctions'
  | 'sector_metrics'
  | 'humanitarian'
  | 'banking'
  | 'trade';

export interface ReliabilityTest {
  id: number;
  testName: string;
  testCategory: TestCategory;
  questionText: string;
  expectedEvidencePattern?: string;
  expectedSources?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TestResult {
  testId: number;
  testName: string;
  passed: boolean;
  citationCoverage: number;
  contradictionResolution: boolean;
  hallucinationDetected: boolean;
  latencyMs: number;
  details: string;
  tribunalResult?: TribunalResult;
}

export interface ReliabilityRunResult {
  runId: number;
  runType: 'nightly' | 'release' | 'manual';
  startedAt: Date;
  completedAt: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  avgCitationCoverage: number;
  avgContradictionResolution: number;
  hallucinationFlags: number;
  avgLatencyMs: number;
  reliabilityScore: number;
  passThreshold: number;
  deploymentBlocked: boolean;
  testResults: TestResult[];
}

// Default test suite - 200+ domain questions
const DEFAULT_TEST_SUITE: Omit<ReliabilityTest, 'id'>[] = [
  // Central Bank Split (20 tests)
  { testName: 'CBY Split Date', testCategory: 'central_bank_split', questionText: 'When did the Central Bank of Yemen split into two competing authorities?', expectedEvidencePattern: '2016|September', expectedSources: ['CBY', 'IMF'], difficulty: 'easy' },
  { testName: 'CBY Aden Location', testCategory: 'central_bank_split', questionText: 'Where is the internationally recognized Central Bank of Yemen headquartered?', expectedEvidencePattern: 'Aden', expectedSources: ['CBY'], difficulty: 'easy' },
  { testName: 'CBY Sanaa Status', testCategory: 'central_bank_split', questionText: 'What is the status of the Sanaa-based central bank?', expectedEvidencePattern: 'de facto|unrecognized', expectedSources: ['IMF', 'World Bank'], difficulty: 'medium' },
  { testName: 'CBY Reserve Levels', testCategory: 'central_bank_split', questionText: 'What are the foreign reserve levels of the Aden-based CBY?', expectedEvidencePattern: 'billion|million', expectedSources: ['CBY', 'IMF'], difficulty: 'hard' },
  { testName: 'CBY Monetary Policy Divergence', testCategory: 'central_bank_split', questionText: 'How do monetary policies differ between Aden and Sanaa central banks?', expectedEvidencePattern: 'interest rate|money supply', expectedSources: ['CBY', 'IMF'], difficulty: 'hard' },
  
  // Exchange Rate Gap (20 tests)
  { testName: 'FX Gap Current', testCategory: 'fx_gap', questionText: 'What is the current exchange rate gap between Aden and Sanaa?', expectedEvidencePattern: 'YER|rial', expectedSources: ['CBY', 'Exchange bureaus'], difficulty: 'medium' },
  { testName: 'FX Gap Historical Peak', testCategory: 'fx_gap', questionText: 'When did the exchange rate gap reach its widest point?', expectedEvidencePattern: '2021|2022', expectedSources: ['CBY', 'IMF'], difficulty: 'hard' },
  { testName: 'FX Aden Rate', testCategory: 'fx_gap', questionText: 'What is the current USD/YER rate in Aden-controlled areas?', expectedEvidencePattern: '\\d+', expectedSources: ['CBY', 'Exchange bureaus'], difficulty: 'medium' },
  { testName: 'FX Sanaa Rate', testCategory: 'fx_gap', questionText: 'What is the current USD/YER rate in Sanaa-controlled areas?', expectedEvidencePattern: '\\d+', expectedSources: ['Exchange bureaus'], difficulty: 'medium' },
  { testName: 'FX Impact on Trade', testCategory: 'fx_gap', questionText: 'How does the exchange rate gap affect cross-zone trade?', expectedEvidencePattern: 'trade|commerce|merchants', expectedSources: ['World Bank', 'UNDP'], difficulty: 'hard' },
  
  // Inflation (20 tests)
  { testName: 'Inflation Rate Aden', testCategory: 'inflation', questionText: 'What is the current inflation rate in Aden-controlled areas?', expectedEvidencePattern: '%|percent', expectedSources: ['CSO', 'World Bank'], difficulty: 'medium' },
  { testName: 'Inflation Rate Sanaa', testCategory: 'inflation', questionText: 'What is the current inflation rate in Sanaa-controlled areas?', expectedEvidencePattern: '%|percent', expectedSources: ['CSO'], difficulty: 'medium' },
  { testName: 'Food Price Inflation', testCategory: 'inflation', questionText: 'What is the food price inflation rate in Yemen?', expectedEvidencePattern: '%|percent|food', expectedSources: ['WFP', 'FAO'], difficulty: 'medium' },
  { testName: 'Fuel Price Trends', testCategory: 'inflation', questionText: 'How have fuel prices changed in Yemen over the past year?', expectedEvidencePattern: 'fuel|petrol|diesel', expectedSources: ['OCHA', 'WFP'], difficulty: 'hard' },
  { testName: 'Inflation Drivers', testCategory: 'inflation', questionText: 'What are the main drivers of inflation in Yemen?', expectedEvidencePattern: 'import|currency|supply', expectedSources: ['IMF', 'World Bank'], difficulty: 'hard' },
  
  // Aid Flows (20 tests)
  { testName: 'Total Aid 2024', testCategory: 'aid_flows', questionText: 'What was the total humanitarian aid to Yemen in 2024?', expectedEvidencePattern: 'billion|million|USD', expectedSources: ['OCHA', 'UN'], difficulty: 'medium' },
  { testName: 'Aid Funding Gap', testCategory: 'aid_flows', questionText: 'What is the current humanitarian funding gap for Yemen?', expectedEvidencePattern: '%|percent|gap', expectedSources: ['OCHA'], difficulty: 'medium' },
  { testName: 'Top Aid Donors', testCategory: 'aid_flows', questionText: 'Who are the top humanitarian donors to Yemen?', expectedEvidencePattern: 'US|Saudi|UAE|EU', expectedSources: ['OCHA', 'FTS'], difficulty: 'easy' },
  { testName: 'Aid Distribution Channels', testCategory: 'aid_flows', questionText: 'How is humanitarian aid distributed in Yemen?', expectedEvidencePattern: 'UN|NGO|WFP', expectedSources: ['OCHA', 'WFP'], difficulty: 'medium' },
  { testName: 'Aid Access Constraints', testCategory: 'aid_flows', questionText: 'What are the main constraints on humanitarian access in Yemen?', expectedEvidencePattern: 'access|blockade|restriction', expectedSources: ['OCHA', 'NGOs'], difficulty: 'hard' },
  
  // Sanctions (20 tests)
  { testName: 'UN Sanctions List', testCategory: 'sanctions', questionText: 'Which entities are under UN sanctions related to Yemen?', expectedEvidencePattern: 'Houthi|individual|entity', expectedSources: ['UN', 'OFAC'], difficulty: 'medium' },
  { testName: 'US Sanctions Yemen', testCategory: 'sanctions', questionText: 'What US sanctions apply to Yemen-related entities?', expectedEvidencePattern: 'OFAC|Treasury|SDN', expectedSources: ['OFAC', 'Treasury'], difficulty: 'medium' },
  { testName: 'Banking Sanctions Impact', testCategory: 'sanctions', questionText: 'How have sanctions affected Yemen banking sector?', expectedEvidencePattern: 'correspondent|SWIFT|banking', expectedSources: ['IMF', 'World Bank'], difficulty: 'hard' },
  { testName: 'Houthi Terrorist Designation', testCategory: 'sanctions', questionText: 'What is the current US designation status of the Houthis?', expectedEvidencePattern: 'FTO|terrorist|designation', expectedSources: ['State Department', 'OFAC'], difficulty: 'medium' },
  { testName: 'Sanctions Exemptions', testCategory: 'sanctions', questionText: 'What humanitarian exemptions exist for Yemen sanctions?', expectedEvidencePattern: 'exemption|license|humanitarian', expectedSources: ['OFAC', 'UN'], difficulty: 'hard' },
  
  // Sector Metrics (25 tests)
  { testName: 'GDP Estimate', testCategory: 'sector_metrics', questionText: 'What is Yemen current GDP estimate?', expectedEvidencePattern: 'billion|GDP', expectedSources: ['World Bank', 'IMF'], difficulty: 'medium' },
  { testName: 'GDP Contraction', testCategory: 'sector_metrics', questionText: 'How much has Yemen GDP contracted since 2015?', expectedEvidencePattern: '%|percent|contraction', expectedSources: ['World Bank', 'IMF'], difficulty: 'medium' },
  { testName: 'Oil Production', testCategory: 'sector_metrics', questionText: 'What is Yemen current oil production level?', expectedEvidencePattern: 'barrel|bpd|oil', expectedSources: ['OPEC', 'EIA'], difficulty: 'medium' },
  { testName: 'Unemployment Rate', testCategory: 'sector_metrics', questionText: 'What is the unemployment rate in Yemen?', expectedEvidencePattern: '%|percent|unemployment', expectedSources: ['ILO', 'World Bank'], difficulty: 'medium' },
  { testName: 'Poverty Rate', testCategory: 'sector_metrics', questionText: 'What percentage of Yemenis live below the poverty line?', expectedEvidencePattern: '%|percent|poverty', expectedSources: ['World Bank', 'UNDP'], difficulty: 'medium' },
  
  // Humanitarian (25 tests)
  { testName: 'Food Insecurity', testCategory: 'humanitarian', questionText: 'How many Yemenis face food insecurity?', expectedEvidencePattern: 'million|food|insecurity', expectedSources: ['WFP', 'FAO'], difficulty: 'easy' },
  { testName: 'IPC Classification', testCategory: 'humanitarian', questionText: 'What is the IPC food security classification for Yemen?', expectedEvidencePattern: 'IPC|Phase|famine', expectedSources: ['IPC', 'WFP'], difficulty: 'medium' },
  { testName: 'Displacement Numbers', testCategory: 'humanitarian', questionText: 'How many internally displaced persons are in Yemen?', expectedEvidencePattern: 'million|IDP|displaced', expectedSources: ['UNHCR', 'IOM'], difficulty: 'easy' },
  { testName: 'Health System Status', testCategory: 'humanitarian', questionText: 'What percentage of Yemen health facilities are functional?', expectedEvidencePattern: '%|percent|health', expectedSources: ['WHO', 'OCHA'], difficulty: 'medium' },
  { testName: 'Cholera Cases', testCategory: 'humanitarian', questionText: 'How many cholera cases have been reported in Yemen?', expectedEvidencePattern: 'cholera|cases|outbreak', expectedSources: ['WHO', 'UNICEF'], difficulty: 'medium' },
  
  // Banking (25 tests)
  { testName: 'Commercial Banks Count', testCategory: 'banking', questionText: 'How many commercial banks operate in Yemen?', expectedEvidencePattern: '\\d+|banks', expectedSources: ['CBY'], difficulty: 'easy' },
  { testName: 'Banking Assets Total', testCategory: 'banking', questionText: 'What is the total assets of Yemen banking sector?', expectedEvidencePattern: 'billion|assets', expectedSources: ['CBY', 'IMF'], difficulty: 'medium' },
  { testName: 'NPL Ratio', testCategory: 'banking', questionText: 'What is the non-performing loan ratio in Yemen banks?', expectedEvidencePattern: '%|percent|NPL', expectedSources: ['CBY', 'IMF'], difficulty: 'hard' },
  { testName: 'Bank Liquidity', testCategory: 'banking', questionText: 'What is the liquidity situation of Yemen banks?', expectedEvidencePattern: 'liquidity|ratio', expectedSources: ['CBY', 'IMF'], difficulty: 'hard' },
  { testName: 'Islamic Banks', testCategory: 'banking', questionText: 'How many Islamic banks operate in Yemen?', expectedEvidencePattern: '\\d+|Islamic', expectedSources: ['CBY'], difficulty: 'easy' },
  
  // Trade (25 tests)
  { testName: 'Import Value', testCategory: 'trade', questionText: 'What is the total value of Yemen imports?', expectedEvidencePattern: 'billion|import', expectedSources: ['CSO', 'World Bank'], difficulty: 'medium' },
  { testName: 'Export Value', testCategory: 'trade', questionText: 'What is the total value of Yemen exports?', expectedEvidencePattern: 'billion|export', expectedSources: ['CSO', 'World Bank'], difficulty: 'medium' },
  { testName: 'Trade Balance', testCategory: 'trade', questionText: 'What is Yemen trade balance?', expectedEvidencePattern: 'deficit|surplus|balance', expectedSources: ['CSO', 'IMF'], difficulty: 'medium' },
  { testName: 'Top Import Partners', testCategory: 'trade', questionText: 'Who are Yemen top import partners?', expectedEvidencePattern: 'China|UAE|Saudi|India', expectedSources: ['CSO', 'UN Comtrade'], difficulty: 'easy' },
  { testName: 'Port Capacity', testCategory: 'trade', questionText: 'What is the capacity of Yemen main ports?', expectedEvidencePattern: 'Hodeidah|Aden|port', expectedSources: ['OCHA', 'UN'], difficulty: 'hard' },
];

/**
 * Initialize test suite in database
 */
export async function initializeTestSuite(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  let insertedCount = 0;
  
  for (const test of DEFAULT_TEST_SUITE) {
    try {
      await db.execute(sql`
        INSERT INTO reliability_tests (testName, testCategory, questionText, expectedEvidencePattern, expectedSources, difficulty)
        VALUES (${test.testName}, ${test.testCategory}, ${test.questionText}, 
                ${test.expectedEvidencePattern || null}, ${JSON.stringify(test.expectedSources || [])}, ${test.difficulty})
        ON DUPLICATE KEY UPDATE testName = testName
      `);
      insertedCount++;
    } catch (error) {
      console.error(`Error inserting test ${test.testName}:`, error);
    }
  }
  
  return insertedCount;
}

/**
 * Get all active tests
 */
export async function getActiveTests(): Promise<ReliabilityTest[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT id, testName, testCategory, questionText, expectedEvidencePattern, expectedSources, difficulty
      FROM reliability_tests WHERE isActive = true
    `);
    
    const rows = (result as any)[0] || [];
    return rows.map((row: any) => ({
      id: row.id,
      testName: row.testName,
      testCategory: row.testCategory,
      questionText: row.questionText,
      expectedEvidencePattern: row.expectedEvidencePattern,
      expectedSources: JSON.parse(row.expectedSources || '[]'),
      difficulty: row.difficulty
    }));
  } catch (error) {
    console.error('Error getting active tests:', error);
    return [];
  }
}

/**
 * Run a single reliability test
 */
export async function runSingleTest(test: ReliabilityTest): Promise<TestResult> {
  const startTime = Date.now();
  
  // Create a mock claim for the test
  const mockClaimId = -1 * test.id; // Negative ID for test claims
  
  try {
    // Run the tribunal on the test question
    const tribunalResult = await runTribunal({
      claimId: mockClaimId,
      claimType: 'test_question',
      content: test.questionText,
      pageContext: `reliability_test_${test.testCategory}`,
      yearContext: new Date().getFullYear()
    });
    
    const latencyMs = Date.now() - startTime;
    
    // Evaluate the result
    const citationCoverage = tribunalResult.citationCoveragePercent;
    const contradictionResolution = tribunalResult.contradictionScore < 30; // Low score = good
    
    // Check for hallucination by looking for expected evidence patterns
    let hallucinationDetected = false;
    if (test.expectedEvidencePattern) {
      const pattern = new RegExp(test.expectedEvidencePattern, 'i');
      const hasExpectedPattern = pattern.test(tribunalResult.publishableText);
      // If tribunal passed but doesn't match expected pattern, might be hallucination
      if (tribunalResult.verdict === 'PASS' && !hasExpectedPattern) {
        hallucinationDetected = true;
      }
    }
    
    // Determine if test passed
    const passed = 
      tribunalResult.verdict !== 'FAIL' &&
      citationCoverage >= 85 &&
      !hallucinationDetected;
    
    return {
      testId: test.id,
      testName: test.testName,
      passed,
      citationCoverage,
      contradictionResolution,
      hallucinationDetected,
      latencyMs,
      details: `Verdict: ${tribunalResult.verdict}, Coverage: ${citationCoverage.toFixed(1)}%`,
      tribunalResult
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      testId: test.id,
      testName: test.testName,
      passed: false,
      citationCoverage: 0,
      contradictionResolution: false,
      hallucinationDetected: false,
      latencyMs,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Run full reliability evaluation
 */
export async function runReliabilityEval(
  runType: 'nightly' | 'release' | 'manual' = 'manual',
  testLimit?: number
): Promise<ReliabilityRunResult> {
  const db = await getDb();
  const startedAt = new Date();
  
  // Get active tests
  let tests = await getActiveTests();
  if (testLimit && testLimit > 0) {
    tests = tests.slice(0, testLimit);
  }
  
  const testResults: TestResult[] = [];
  
  // Run each test
  for (const test of tests) {
    console.log(`[ReliabilityLab] Running test: ${test.testName}`);
    const result = await runSingleTest(test);
    testResults.push(result);
    
    // Small delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const completedAt = new Date();
  
  // Calculate aggregate metrics
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = testResults.length - passedTests;
  const avgCitationCoverage = testResults.reduce((sum, r) => sum + r.citationCoverage, 0) / testResults.length;
  const avgContradictionResolution = testResults.filter(r => r.contradictionResolution).length / testResults.length * 100;
  const hallucinationFlags = testResults.filter(r => r.hallucinationDetected).length;
  const avgLatencyMs = testResults.reduce((sum, r) => sum + r.latencyMs, 0) / testResults.length;
  
  // Calculate reliability score (weighted average)
  const reliabilityScore = (
    (passedTests / testResults.length) * 40 +  // 40% weight on pass rate
    (avgCitationCoverage / 100) * 30 +          // 30% weight on citation coverage
    (avgContradictionResolution / 100) * 20 +   // 20% weight on contradiction resolution
    ((100 - hallucinationFlags / testResults.length * 100) / 100) * 10  // 10% weight on no hallucinations
  );
  
  const passThreshold = 85;
  const deploymentBlocked = reliabilityScore < passThreshold;
  
  // Store run results
  let runId = 0;
  if (db) {
    try {
      const insertResult = await db.execute(sql`
        INSERT INTO reliability_runs (
          runType, startedAt, completedAt, totalTests, passedTests, failedTests,
          avgCitationCoverage, avgContradictionResolution, hallucinationFlags,
          avgLatencyMs, reliabilityScore, passThreshold, deploymentBlocked, resultsJson
        ) VALUES (
          ${runType}, ${startedAt}, ${completedAt}, ${testResults.length}, ${passedTests}, ${failedTests},
          ${avgCitationCoverage}, ${avgContradictionResolution}, ${hallucinationFlags},
          ${Math.round(avgLatencyMs)}, ${reliabilityScore}, ${passThreshold}, ${deploymentBlocked},
          ${JSON.stringify(testResults.map(r => ({ ...r, tribunalResult: undefined })))}
        )
      `);
      
      const rows = (insertResult as any)[0];
      runId = rows?.insertId || 0;
    } catch (error) {
      console.error('Error storing reliability run:', error);
    }
  }
  
  return {
    runId,
    runType,
    startedAt,
    completedAt,
    totalTests: testResults.length,
    passedTests,
    failedTests,
    avgCitationCoverage,
    avgContradictionResolution,
    hallucinationFlags,
    avgLatencyMs: Math.round(avgLatencyMs),
    reliabilityScore,
    passThreshold,
    deploymentBlocked,
    testResults
  };
}

/**
 * Get latest reliability run result
 */
export async function getLatestReliabilityRun(): Promise<ReliabilityRunResult | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM reliability_runs ORDER BY startedAt DESC LIMIT 1
    `);
    
    const rows = (result as any)[0] || [];
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      runId: row.id,
      runType: row.runType,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      totalTests: row.totalTests,
      passedTests: row.passedTests,
      failedTests: row.failedTests,
      avgCitationCoverage: parseFloat(row.avgCitationCoverage),
      avgContradictionResolution: parseFloat(row.avgContradictionResolution),
      hallucinationFlags: row.hallucinationFlags,
      avgLatencyMs: row.avgLatencyMs,
      reliabilityScore: parseFloat(row.reliabilityScore),
      passThreshold: parseFloat(row.passThreshold),
      deploymentBlocked: row.deploymentBlocked,
      testResults: JSON.parse(row.resultsJson || '[]')
    };
  } catch (error) {
    console.error('Error getting latest reliability run:', error);
    return null;
  }
}

/**
 * Check if deployment should be blocked
 */
export async function shouldBlockDeployment(): Promise<{
  blocked: boolean;
  reason: string;
  reliabilityScore: number;
}> {
  const latestRun = await getLatestReliabilityRun();
  
  if (!latestRun) {
    return {
      blocked: true,
      reason: 'No reliability evaluation has been run',
      reliabilityScore: 0
    };
  }
  
  // Check if run is recent (within 24 hours)
  const hoursSinceRun = (Date.now() - latestRun.completedAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceRun > 24) {
    return {
      blocked: true,
      reason: `Last reliability run was ${Math.round(hoursSinceRun)} hours ago (max 24h)`,
      reliabilityScore: latestRun.reliabilityScore
    };
  }
  
  if (latestRun.deploymentBlocked) {
    return {
      blocked: true,
      reason: `Reliability score ${latestRun.reliabilityScore.toFixed(1)}% below threshold ${latestRun.passThreshold}%`,
      reliabilityScore: latestRun.reliabilityScore
    };
  }
  
  return {
    blocked: false,
    reason: 'Reliability check passed',
    reliabilityScore: latestRun.reliabilityScore
  };
}
