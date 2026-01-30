import fs from 'fs';

const sectorPages = [
  'Agriculture.tsx', 'AidFlows.tsx', 'Banking.tsx', 'ConflictEconomy.tsx',
  'Currency.tsx', 'Energy.tsx', 'FoodSecurity.tsx', 'Infrastructure.tsx',
  'Investment.tsx', 'LaborMarket.tsx', 'Macroeconomy.tsx', 'Microfinance.tsx',
  'Poverty.tsx', 'Prices.tsx', 'PublicFinance.tsx', 'Trade.tsx'
];

for (const file of sectorPages) {
  const filePath = `client/src/pages/sectors/${file}`;
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix pattern: </Card>\n\n      {/* Sources Used Panel */}
  // Should be: </Card>\n      </div>\n\n      {/* Sources Used Panel */}
  const badPattern = /(<\/Card>\s*\n)\s*(\n\s*\{\/\* Sources Used Panel \*\/\})/g;
  if (badPattern.test(content)) {
    content = content.replace(badPattern, '$1      </div>\n$2');
    fs.writeFileSync(filePath, content);
    console.log(`${file}: Fixed missing </div>`);
  } else {
    console.log(`${file}: OK or already fixed`);
  }
}
