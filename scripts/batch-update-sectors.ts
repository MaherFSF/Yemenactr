import * as fs from 'fs';

// Sector configurations with their background images and gradient colors
const sectorConfigs: Record<string, { image: string; gradientFrom: string; gradientTo: string }> = {
  'PublicFinance': { image: '/sectors/public-finance.png', gradientFrom: '#6B21A8', gradientTo: '#9333EA' },
  'Energy': { image: '/sectors/energy.jpg', gradientFrom: '#EA580C', gradientTo: '#F97316' },
  'FoodSecurity': { image: '/sectors/food-security.jpg', gradientFrom: '#65A30D', gradientTo: '#84CC16' },
  'AidFlows': { image: '/sectors/humanitarian.jpg', gradientFrom: '#DB2777', gradientTo: '#EC4899' },
  'LaborMarket': { image: '/sectors/labor.jpg', gradientFrom: '#4338CA', gradientTo: '#6366F1' },
  'ConflictEconomy': { image: '/sectors/conflict-economy.jpg', gradientFrom: '#B91C1C', gradientTo: '#DC2626' },
  'Infrastructure': { image: '/sectors/infrastructure.jpg', gradientFrom: '#475569', gradientTo: '#64748B' },
  'Agriculture': { image: '/sectors/agriculture.jpg', gradientFrom: '#059669', gradientTo: '#10B981' },
  'Investment': { image: '/sectors/investment.webp', gradientFrom: '#047857', gradientTo: '#10B981' },
  'Macroeconomy': { image: '/sectors/economy.jpg', gradientFrom: '#15803D', gradientTo: '#22C55E' },
  'Prices': { image: '/sectors/consumer-prices.png', gradientFrom: '#B91C1C', gradientTo: '#EF4444' },
};

const sectorsDir = '/home/ubuntu/yeto-platform/client/src/pages/sectors';

// Get all sector files
const sectorFiles = fs.readdirSync(sectorsDir).filter(f => f.endsWith('.tsx'));

console.log('Batch updating sector pages with background images...\n');

for (const file of sectorFiles) {
  const sectorName = file.replace('.tsx', '');
  const config = sectorConfigs[sectorName];
  
  if (!config) {
    console.log(`⏭️  Skipping ${sectorName} (no config or already updated)`);
    continue;
  }
  
  const filePath = `${sectorsDir}/${file}`;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if already has the new hero pattern
  if (content.includes('bg-cover bg-center') && content.includes('/sectors/')) {
    console.log(`✓ ${sectorName} already has background image`);
    continue;
  }
  
  // Find the hero section and update it
  // Pattern 1: Simple gradient background
  const simpleGradientPattern = /<section className="bg-gradient-to-r[^"]*">\s*<div className="container py-\d+">/;
  
  // Pattern 2: With border-b
  const borderPattern = /<section className="bg-gradient-to-r[^"]*border-b">/;
  
  if (simpleGradientPattern.test(content) || borderPattern.test(content)) {
    // This sector has a simple hero, needs full replacement
    console.log(`🔧 ${sectorName} needs manual update (complex hero structure)`);
  } else {
    console.log(`⚠️  ${sectorName} has unknown hero pattern`);
  }
}

console.log('\nDone! Some sectors may need manual updates.');
