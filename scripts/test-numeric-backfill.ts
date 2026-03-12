/**
 * Numeric Backfill Test Script
 * 
 * Tests the complete numeric backfill system:
 * 1. Registry inspection
 * 2. Data fetcher testing
 * 3. Backfill execution (World Bank GDP 2020-2026)
 * 4. Contradiction detection
 * 5. Coverage map updates
 * 6. Data freshness SLA checks
 */

import { numericSourceRegistry } from '../server/services/numericSourceRegistry';
import { NumericBackfillRunner } from '../server/services/numericBackfillRunner';
import { getAllFetchers, testFetcher } from '../server/services/numericDataFetchers';
import { contradictionDetector } from '../server/services/contradictionDetector';
import { dataFreshnessSLA } from '../server/services/dataFreshnessSLA';
import { getNumericSeriesCoverageStats } from '../server/services/coverageMap';

async function main() {
  console.log('\n========================================');
  console.log('NUMERIC BACKFILL SYSTEM TEST');
  console.log('========================================\n');

  try {
    // =========================================================================
    // 1. REGISTRY INSPECTION
    // =========================================================================
    
    console.log('[1/6] Registry Inspection');
    console.log('─────────────────────────────\n');
    
    const stats = numericSourceRegistry.getStatistics();
    console.log('Registry Statistics:');
    console.log(`  - Total Sources: ${stats.totalSources}`);
    console.log(`  - Active Sources: ${stats.activeSources}`);
    console.log(`  - Total Products: ${stats.totalProducts}`);
    console.log('\nBy Status:');
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });
    console.log('\nBy Frequency:');
    Object.entries(stats.byFrequency).forEach(([freq, count]) => {
      console.log(`  - ${freq}: ${count}`);
    });

    // List some products
    const products = numericSourceRegistry.getAllProducts();
    console.log(`\nSample Products (first 5):`);
    products.slice(0, 5).forEach(p => {
      console.log(`  - ${p.name} (${p.product_id})`);
      console.log(`    Frequency: ${p.frequency}, Unit: ${p.unit}`);
      console.log(`    Available: ${p.availableFrom} onwards`);
    });

    // =========================================================================
    // 2. DATA FETCHER TESTING
    // =========================================================================
    
    console.log('\n\n[2/6] Data Fetcher Testing');
    console.log('─────────────────────────────\n');

    // Test World Bank fetcher
    console.log('Testing World Bank WDI fetcher...');
    const wbTest = await testFetcher('wb-wdi', 'NY.GDP.MKTP.CD', 2023);
    console.log(`  Result: ${wbTest.success ? '✓ SUCCESS' : '✗ FAILED'}`);
    if (wbTest.success) {
      console.log(`  Observations: ${wbTest.observationCount}`);
      if (wbTest.sampleObservation) {
        console.log(`  Sample: ${wbTest.sampleObservation.value} ${wbTest.sampleObservation.unit} on ${wbTest.sampleObservation.date.toISOString().split('T')[0]}`);
      }
    } else {
      console.log(`  Error: ${wbTest.error}`);
    }

    // Test OCHA FTS fetcher
    console.log('\nTesting OCHA FTS fetcher...');
    const ochaTest = await testFetcher('ocha-fts', 'ocha-funding-total', 2023);
    console.log(`  Result: ${ochaTest.success ? '✓ SUCCESS' : '✗ FAILED'}`);
    if (ochaTest.success) {
      console.log(`  Observations: ${ochaTest.observationCount}`);
    } else {
      console.log(`  Error: ${ochaTest.error}`);
    }

    // =========================================================================
    // 3. FLAGSHIP BACKFILL EXECUTION
    // =========================================================================
    
    console.log('\n\n[3/6] Flagship Backfill Execution');
    console.log('─────────────────────────────\n');

    console.log('Running backfill for World Bank GDP (2020-2026)...\n');

    const fetchers = getAllFetchers();
    const wbFetcher = fetchers.get('wb-wdi');
    
    if (!wbFetcher) {
      console.log('✗ World Bank fetcher not available');
    } else {
      const runner = new NumericBackfillRunner(wbFetcher);
      
      // Backfill years 2026 down to 2020
      const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
      
      for (const year of years) {
        console.log(`\nBackfilling year ${year}...`);
        const result = await runner.backfillYear({
          sourceId: 'wb-wdi',
          product_id: 'wb-gdp',
          year,
        });
        
        console.log(`  ${result.success ? '✓' : '✗'} Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
        console.log(`  Observations inserted: ${result.observationsInserted}`);
        console.log(`  Observations skipped: ${result.observationsSkipped}`);
        console.log(`  Duration: ${result.duration}ms`);
        
        if (result.errors.length > 0) {
          console.log(`  Errors: ${result.errors.length}`);
          result.errors.slice(0, 3).forEach(err => {
            console.log(`    - ${err}`);
          });
        }
      }
    }

    // =========================================================================
    // 4. CONTRADICTION DETECTION
    // =========================================================================
    
    console.log('\n\n[4/6] Contradiction Detection');
    console.log('─────────────────────────────\n');

    console.log('Scanning for contradictions...');
    const contradictionStats = await contradictionDetector.getContradictionStatistics();
    
    console.log('\nContradiction Statistics:');
    console.log(`  Total: ${contradictionStats.total}`);
    console.log(`  Unresolved: ${contradictionStats.unresolved}`);
    console.log(`  Investigating: ${contradictionStats.investigating}`);
    console.log(`  Resolved: ${contradictionStats.resolved}`);
    console.log(`  Accepted Variance: ${contradictionStats.acceptedVariance}`);
    console.log(`  Avg Variance: ${contradictionStats.avgVariancePercent.toFixed(2)}%`);

    if (contradictionStats.total > 0) {
      console.log('\nTop Indicators with Contradictions:');
      Object.entries(contradictionStats.byIndicator)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([indicator, count]) => {
          console.log(`  - ${indicator}: ${count} contradictions`);
        });
    }

    // =========================================================================
    // 5. COVERAGE MAP
    // =========================================================================
    
    console.log('\n\n[5/6] Coverage Map Update');
    console.log('─────────────────────────────\n');

    console.log('Checking numeric series coverage...');
    const coverageStats = await getNumericSeriesCoverageStats();
    
    console.log('\nNumeric Series Coverage:');
    console.log(`  Total Series: ${coverageStats.totalSeries}`);
    console.log(`  Total Observations: ${coverageStats.totalObservations}`);
    console.log(`  Latest Observation: ${coverageStats.latestObservationDate || 'N/A'}`);
    
    if (Object.keys(coverageStats.seriesByFrequency).length > 0) {
      console.log('\nSeries by Frequency:');
      Object.entries(coverageStats.seriesByFrequency).forEach(([freq, count]) => {
        console.log(`  - ${freq}: ${count}`);
      });
    }
    
    if (Object.keys(coverageStats.observationsByYear).length > 0) {
      console.log('\nObservations by Year (recent):');
      Object.entries(coverageStats.observationsByYear)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .slice(0, 7)
        .forEach(([year, count]) => {
          console.log(`  - ${year}: ${count} observations`);
        });
    }

    // =========================================================================
    // 6. DATA FRESHNESS SLA
    // =========================================================================
    
    console.log('\n\n[6/6] Data Freshness SLA');
    console.log('─────────────────────────────\n');

    console.log('Checking data freshness...');
    const freshnessSummary = await dataFreshnessSLA.getSummaryStats();
    
    console.log('\nFreshness Summary:');
    console.log(`  Overall Health: ${freshnessSummary.overallHealth}%`);
    console.log(`  Total Series: ${freshnessSummary.totalSeries}`);
    console.log(`  Fresh: ${freshnessSummary.freshPercent}%`);
    console.log(`  Warning: ${freshnessSummary.warningPercent}%`);
    console.log(`  Critical: ${freshnessSummary.criticalPercent}%`);

    if (freshnessSummary.mostStale.length > 0) {
      console.log('\nMost Stale Series (top 5):');
      freshnessSummary.mostStale.slice(0, 5).forEach(s => {
        console.log(`  - ${s.name} (${s.productId})`);
        console.log(`    Last update: ${s.daysSinceLastUpdate} days ago`);
        console.log(`    Status: ${s.slaStatus.toUpperCase()}`);
      });
    }

    // =========================================================================
    // SUMMARY
    // =========================================================================
    
    console.log('\n\n========================================');
    console.log('TEST COMPLETE');
    console.log('========================================\n');

    console.log('System Status:');
    console.log(`  ✓ Registry: ${stats.totalSources} sources, ${stats.totalProducts} products`);
    console.log(`  ✓ Coverage: ${coverageStats.totalSeries} series, ${coverageStats.totalObservations} observations`);
    console.log(`  ✓ Contradictions: ${contradictionStats.total} detected`);
    console.log(`  ✓ Freshness: ${freshnessSummary.overallHealth}% health score`);

    console.log('\nBackfill system is operational! ✓\n');

  } catch (error) {
    console.error('\n✗ TEST FAILED:', error);
    process.exit(1);
  }
}

// Run test
main().catch(console.error);
