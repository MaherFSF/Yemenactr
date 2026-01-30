import fs from 'fs';

const sectorPages = [
  { file: 'Agriculture.tsx', sectorCode: 'agriculture' },
  { file: 'AidFlows.tsx', sectorCode: 'aid' },
  { file: 'Banking.tsx', sectorCode: 'banking' },
  { file: 'ConflictEconomy.tsx', sectorCode: 'conflict' },
  { file: 'Currency.tsx', sectorCode: 'currency' },
  { file: 'Energy.tsx', sectorCode: 'energy' },
  { file: 'FoodSecurity.tsx', sectorCode: 'food' },
  { file: 'Infrastructure.tsx', sectorCode: 'infrastructure' },
  { file: 'Investment.tsx', sectorCode: 'investment' },
  { file: 'LaborMarket.tsx', sectorCode: 'labor' },
  { file: 'Macroeconomy.tsx', sectorCode: 'macro' },
  { file: 'Microfinance.tsx', sectorCode: 'microfinance' },
  { file: 'Poverty.tsx', sectorCode: 'poverty' },
  { file: 'Prices.tsx', sectorCode: 'prices' },
  { file: 'PublicFinance.tsx', sectorCode: 'public_finance' },
  { file: 'Trade.tsx', sectorCode: 'trade' }
];

let updated = 0;
let skipped = 0;

for (const page of sectorPages) {
  const filePath = `client/src/pages/sectors/${page.file}`;
  if (!fs.existsSync(filePath)) {
    console.log(`${page.file}: File not found`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has SourcesUsedPanel with sectorCode
  if (content.includes('SourcesUsedPanel') && content.includes('sectorCode=')) {
    console.log(`${page.file}: Already has SourcesUsedPanel with sectorCode`);
    skipped++;
    continue;
  }
  
  // Remove old SourcesUsedPanel usage if it exists (with sources prop)
  if (content.includes('SourcesUsedPanel') && content.includes('sources=')) {
    // Replace old usage with new sectorCode-based usage
    content = content.replace(
      /<SourcesUsedPanel\s+sources=\{[^}]+\}[^/]*\/>/g,
      `<SourcesUsedPanel sectorCode="${page.sectorCode}" />`
    );
  }
  
  // Add import if not present
  if (!content.includes('SourcesUsedPanel')) {
    // Add import after trpc import
    content = content.replace(
      /import { trpc } from ['"]@\/lib\/trpc['"];/,
      `import { trpc } from "@/lib/trpc";\nimport { SourcesUsedPanel } from "@/components/SourcesUsedPanel";`
    );
    
    // Find the last closing </div> before the return statement ends and add the panel
    // Look for pattern: </div>\n  );\n} at the end
    const endPattern = /(\s*<\/div>\s*\n\s*<\/div>\s*\n\s*\);\s*\n\}\s*)$/;
    if (endPattern.test(content)) {
      content = content.replace(endPattern, `\n\n      {/* Sources Used Panel */}\n      <SourcesUsedPanel sectorCode="${page.sectorCode}" />\n    </div>\n  );\n}\n`);
    } else {
      // Try simpler pattern
      const simpleEnd = /(\s*<\/div>\s*\n\s*\);\s*\n\}\s*)$/;
      if (simpleEnd.test(content)) {
        content = content.replace(simpleEnd, `\n\n      {/* Sources Used Panel */}\n      <SourcesUsedPanel sectorCode="${page.sectorCode}" />\n    </div>\n  );\n}\n`);
      }
    }
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`${page.file}: Updated`);
  updated++;
}

console.log(`\nSummary: ${updated} updated, ${skipped} skipped`);
