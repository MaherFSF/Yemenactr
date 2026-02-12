/**
 * Route Testing Script for YETO Platform
 * Tests all defined routes to ensure they are accessible
 */

const routes = [
  // Main pages
  { path: '/', name: 'Home' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/glossary', name: 'Glossary' },
  { path: '/pricing', name: 'Pricing' },
  
  // Sector pages (15)
  { path: '/sectors/banking', name: 'Banking' },
  { path: '/sectors/trade', name: 'Trade' },
  { path: '/sectors/poverty', name: 'Poverty' },
  { path: '/sectors/macroeconomy', name: 'Macroeconomy' },
  { path: '/sectors/prices', name: 'Prices' },
  { path: '/sectors/currency', name: 'Currency' },
  { path: '/sectors/public-finance', name: 'Public Finance' },
  { path: '/sectors/energy', name: 'Energy' },
  { path: '/sectors/food-security', name: 'Food Security' },
  { path: '/sectors/aid-flows', name: 'Aid Flows' },
  { path: '/sectors/labor-market', name: 'Labor Market' },
  { path: '/sectors/conflict-economy', name: 'Conflict Economy' },
  { path: '/sectors/infrastructure', name: 'Infrastructure' },
  { path: '/sectors/agriculture', name: 'Agriculture' },
  { path: '/sectors/investment', name: 'Investment' },
  
  // Tool pages (6)
  { path: '/ai-assistant', name: 'AI Assistant' },
  { path: '/report-builder', name: 'Report Builder' },
  { path: '/scenario-simulator', name: 'Scenario Simulator' },
  { path: '/data-repository', name: 'Data Repository' },
  { path: '/timeline', name: 'Timeline' },
  { path: '/comparison', name: 'Comparison Tool' },
  
  // Resource pages (5)
  { path: '/research', name: 'Research' },
  { path: '/methodology', name: 'Methodology' },
  
  // Research portal pages (6)
  { path: '/research-portal', name: 'Research Portal' },
  { path: '/research-explorer', name: 'Research Explorer' },
  { path: '/research-analytics', name: 'Research Analytics' },
  { path: '/research-assistant', name: 'Research Assistant' },
  { path: '/research-library', name: 'Research Library' },
  { path: '/research-audit', name: 'Research Audit' },
  
  // Admin pages
  { path: '/admin', name: 'Admin Portal' },
  { path: '/admin/monitoring', name: 'Admin Monitoring' },
  { path: '/admin/scheduler', name: 'Admin Scheduler' },
  { path: '/admin/alerts', name: 'Admin Alerts' },
  
  // Special pages
  { path: '/partner', name: 'Partner Portal' },
  { path: '/data-freshness', name: 'Data Freshness' },
  { path: '/api-docs', name: 'API Docs' },
  { path: '/policy-impact', name: 'Policy Impact' },
  { path: '/data-exchange', name: 'Data Exchange Hub' },
  { path: '/accuracy', name: 'Accuracy Dashboard' },
  
  // User pages
  { path: '/my-dashboard', name: 'User Dashboard' },
  { path: '/api-keys', name: 'API Keys' },
  { path: '/notifications', name: 'Notifications' },
  { path: '/changelog', name: 'Changelog' },
  
  // Legal pages
  { path: '/legal', name: 'Legal' },
  { path: '/legal/privacy', name: 'Privacy Policy' },
  { path: '/legal/terms', name: 'Terms of Service' },
  { path: '/legal/data-license', name: 'Data License' },
  { path: '/legal/accessibility', name: 'Accessibility' },
  
  // Other pages
  { path: '/entities', name: 'Entities' },
  { path: '/corrections', name: 'Corrections' },
  { path: '/publications', name: 'Publications' },
  { path: '/coverage', name: 'Coverage Scorecard' },
  { path: '/compliance', name: 'Compliance' },
  { path: '/indicators', name: 'Indicator Catalog' },
];

async function testRoutes() {
  const baseUrl = 'http://localhost:3000';
  const results: { path: string; name: string; status: string; error?: string }[] = [];
  
  console.log('Testing all routes...\n');
  
  for (const route of routes) {
    try {
      const response = await fetch(`${baseUrl}${route.path}`);
      const status = response.ok ? '✅ OK' : `❌ ${response.status}`;
      results.push({ ...route, status });
      console.log(`${status} - ${route.name} (${route.path})`);
    } catch (error) {
      results.push({ ...route, status: '❌ Error', error: String(error) });
      console.log(`❌ Error - ${route.name} (${route.path}): ${error}`);
    }
  }
  
  console.log('\n--- Summary ---');
  const passed = results.filter(r => r.status.includes('OK')).length;
  const failed = results.filter(r => !r.status.includes('OK')).length;
  console.log(`Passed: ${passed}/${routes.length}`);
  console.log(`Failed: ${failed}/${routes.length}`);
  
  if (failed > 0) {
    console.log('\nFailed routes:');
    results.filter(r => !r.status.includes('OK')).forEach(r => {
      console.log(`  - ${r.name} (${r.path}): ${r.status}`);
    });
  }
}

testRoutes();
