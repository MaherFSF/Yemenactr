/**
 * Comprehensive Site Audit Script
 * Tests all routes and reports issues
 */

const BASE_URL = 'http://localhost:3000';

interface RouteTest {
  name: string;
  path: string;
  category: string;
}

const ALL_ROUTES: RouteTest[] = [
  // Main Pages
  { name: 'Home', path: '/', category: 'Main' },
  { name: 'Dashboard', path: '/dashboard', category: 'Main' },
  { name: 'Pricing', path: '/pricing', category: 'Main' },
  
  // Sector Pages
  { name: 'Banking', path: '/sectors/banking', category: 'Sectors' },
  { name: 'Trade', path: '/sectors/trade', category: 'Sectors' },
  { name: 'Macroeconomy', path: '/sectors/macroeconomy', category: 'Sectors' },
  { name: 'Prices', path: '/sectors/prices', category: 'Sectors' },
  { name: 'Currency', path: '/sectors/currency', category: 'Sectors' },
  { name: 'Public Finance', path: '/sectors/public-finance', category: 'Sectors' },
  { name: 'Energy', path: '/sectors/energy', category: 'Sectors' },
  { name: 'Food Security', path: '/sectors/food-security', category: 'Sectors' },
  { name: 'Aid Flows', path: '/sectors/aid-flows', category: 'Sectors' },
  { name: 'Labor Market', path: '/sectors/labor-market', category: 'Sectors' },
  { name: 'Conflict Economy', path: '/sectors/conflict-economy', category: 'Sectors' },
  { name: 'Infrastructure', path: '/sectors/infrastructure', category: 'Sectors' },
  { name: 'Agriculture', path: '/sectors/agriculture', category: 'Sectors' },
  { name: 'Investment', path: '/sectors/investment', category: 'Sectors' },
  { name: 'Poverty', path: '/sectors/poverty', category: 'Sectors' },
  
  // Tools
  { name: 'AI Assistant', path: '/ai-assistant', category: 'Tools' },
  { name: 'Report Builder', path: '/report-builder', category: 'Tools' },
  { name: 'Scenario Simulator', path: '/scenario-simulator', category: 'Tools' },
  { name: 'Data Repository', path: '/data-repository', category: 'Tools' },
  { name: 'Timeline', path: '/timeline', category: 'Tools' },
  
  // Resources
  { name: 'Research Library', path: '/research', category: 'Resources' },
  { name: 'Methodology', path: '/methodology', category: 'Resources' },
  { name: 'Glossary', path: '/glossary', category: 'Resources' },
  { name: 'About', path: '/about', category: 'Resources' },
  { name: 'Contact', path: '/contact', category: 'Resources' },
  
  // Admin Pages
  { name: 'Admin Portal', path: '/admin', category: 'Admin' },
  { name: 'Admin Monitoring', path: '/admin/monitoring', category: 'Admin' },
  { name: 'Admin Scheduler', path: '/admin/scheduler', category: 'Admin' },
  { name: 'Admin Alerts', path: '/admin/alerts', category: 'Admin' },
  
  // Special Pages
  { name: 'Partner Portal', path: '/partner', category: 'Special' },
  { name: 'Data Freshness', path: '/data-freshness', category: 'Special' },
  { name: 'API Docs', path: '/api-docs', category: 'Special' },
  { name: 'Policy Impact', path: '/policy-impact', category: 'Special' },
  { name: 'Data Exchange Hub', path: '/data-exchange', category: 'Special' },
  { name: 'Accuracy Dashboard', path: '/accuracy', category: 'Special' },
  
  // Research Portal
  { name: 'Research Portal', path: '/research-portal', category: 'Research' },
  { name: 'Research Explorer', path: '/research-explorer', category: 'Research' },
  { name: 'Research Analytics', path: '/research-analytics', category: 'Research' },
  { name: 'Research Assistant', path: '/research-assistant', category: 'Research' },
  { name: 'Research Library Page', path: '/research-library', category: 'Research' },
  { name: 'Research Audit', path: '/research-audit', category: 'Research' },
  
  // User Pages
  { name: 'My Dashboard', path: '/my-dashboard', category: 'User' },
  { name: 'API Keys', path: '/api-keys', category: 'User' },
  { name: 'Notifications', path: '/notifications', category: 'User' },
  { name: 'Changelog', path: '/changelog', category: 'User' },
  
  // Legal Pages
  { name: 'Legal', path: '/legal', category: 'Legal' },
  { name: 'Privacy Policy', path: '/legal/privacy', category: 'Legal' },
  { name: 'Terms of Service', path: '/legal/terms', category: 'Legal' },
  { name: 'Data License', path: '/legal/data-license', category: 'Legal' },
  { name: 'Accessibility', path: '/legal/accessibility', category: 'Legal' },
  
  // Other Pages
  { name: 'Entities', path: '/entities', category: 'Other' },
  { name: 'Corrections', path: '/corrections', category: 'Other' },
  { name: 'Publications', path: '/publications', category: 'Other' },
  { name: 'Coverage Scorecard', path: '/coverage', category: 'Other' },
  { name: 'Compliance', path: '/compliance', category: 'Other' },
  { name: 'Comparison Tool', path: '/comparison', category: 'Other' },
  { name: 'Indicator Catalog', path: '/indicators', category: 'Other' },
];

interface TestResult {
  route: RouteTest;
  status: 'pass' | 'fail' | 'redirect';
  statusCode: number;
  responseTime: number;
  error?: string;
}

async function testRoute(route: RouteTest): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const response = await fetch(`${BASE_URL}${route.path}`, {
      method: 'GET',
      redirect: 'follow',
    });
    const responseTime = Date.now() - startTime;
    
    return {
      route,
      status: response.ok ? 'pass' : 'fail',
      statusCode: response.status,
      responseTime,
    };
  } catch (error) {
    return {
      route,
      status: 'fail',
      statusCode: 0,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runAudit() {
  console.log('🔍 Starting Comprehensive Site Audit...\n');
  console.log(`Testing ${ALL_ROUTES.length} routes against ${BASE_URL}\n`);
  
  const results: TestResult[] = [];
  const categories = new Map<string, TestResult[]>();
  
  for (const route of ALL_ROUTES) {
    const result = await testRoute(route);
    results.push(result);
    
    if (!categories.has(route.category)) {
      categories.set(route.category, []);
    }
    categories.get(route.category)!.push(result);
    
    const icon = result.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${route.name} (${route.path}) - ${result.statusCode} [${result.responseTime}ms]`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  console.log(`Total Routes: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%\n`);
  
  // By Category
  console.log('By Category:');
  for (const [category, categoryResults] of categories) {
    const catPassed = categoryResults.filter(r => r.status === 'pass').length;
    console.log(`  ${category}: ${catPassed}/${categoryResults.length} passed`);
  }
  
  // Failed Routes
  if (failed > 0) {
    console.log('\n❌ Failed Routes:');
    for (const result of results.filter(r => r.status === 'fail')) {
      console.log(`  - ${result.route.name} (${result.route.path}): ${result.error || `Status ${result.statusCode}`}`);
    }
  }
  
  // Average Response Time
  const avgTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  console.log(`\n⏱️ Average Response Time: ${avgTime.toFixed(0)}ms`);
  
  return { passed, failed, total: results.length };
}

runAudit().then(summary => {
  console.log('\n✨ Audit Complete!');
  process.exit(summary.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Audit failed:', error);
  process.exit(1);
});
