import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sector background image mapping
const sectorBackgrounds: Record<string, string> = {
  'Banking': '/sectors/banking.png',
  'Trade': '/sectors/trade.jpg',
  'Macroeconomy': '/sectors/economy.jpg',
  'Prices': '/sectors/consumer-prices.png',
  'Currency': '/sectors/currency.jpg',
  'PublicFinance': '/sectors/public-finance.png',
  'Energy': '/sectors/energy.jpg',
  'FoodSecurity': '/sectors/food-security.jpg',
  'AidFlows': '/sectors/humanitarian.jpg',
  'LaborMarket': '/sectors/labor.jpg',
  'ConflictEconomy': '/sectors/conflict-economy.jpg',
  'Infrastructure': '/sectors/infrastructure.jpg',
  'Agriculture': '/sectors/agriculture.jpg',
  'Investment': '/sectors/investment.webp',
  'Poverty': '/sectors/poverty.jpg',
};

const sectorsDir = '/home/ubuntu/yeto-platform/client/src/pages/sectors';

// Get all sector files
const sectorFiles = fs.readdirSync(sectorsDir).filter(f => f.endsWith('.tsx'));

console.log('Updating sector pages with background images...\n');

for (const file of sectorFiles) {
  const sectorName = file.replace('.tsx', '');
  const backgroundImage = sectorBackgrounds[sectorName];
  
  if (!backgroundImage) {
    console.log(`⚠️  No background image mapping for ${sectorName}`);
    continue;
  }
  
  const filePath = path.join(sectorsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if already has background image
  if (content.includes('bg-cover bg-center') && content.includes('/sectors/')) {
    console.log(`✓ ${sectorName} already has background image`);
    continue;
  }
  
  // Find and replace the hero section pattern
  const oldPattern = /\{\/\* Hero Section \*\/\}\s*<section className="relative h-\[400px\] overflow-hidden bg-gradient-to-r from-\[#\w+\] to-\[#\w+\]">\s*<div className="absolute inset-0 opacity-20">/;
  
  const newPattern = `{/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: \`url(${backgroundImage})\` }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#103050]/90 to-[#1a4a70]/80" />
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">`;
  
  if (oldPattern.test(content)) {
    content = content.replace(oldPattern, newPattern);
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated ${sectorName} with ${backgroundImage}`);
  } else {
    console.log(`⚠️  Could not find hero pattern in ${sectorName}`);
  }
}

console.log('\nDone!');
