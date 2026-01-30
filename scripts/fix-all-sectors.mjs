import fs from 'fs';
import { execSync } from 'child_process';

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

for (const page of sectorPages) {
  const filePath = `client/src/pages/sectors/${page.file}`;
  
  // Restore from git
  try {
    execSync(`git checkout HEAD -- ${filePath}`, { encoding: 'utf8' });
  } catch (e) {
    console.log(`${page.file}: Could not restore from git`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import after first import line
  if (!content.includes('SourcesUsedPanel')) {
    content = content.replace(
      /import { trpc } from ["']@\/lib\/trpc["'];/,
      `import { trpc } from "@/lib/trpc";\nimport { SourcesUsedPanel } from "@/components/SourcesUsedPanel";`
    );
  }
  
  // Find the return statement and the main container div
  // Add SourcesUsedPanel just before the final closing </div> of the main container
  // Pattern: find the last </div>\n  );\n} and insert before it
  
  const lines = content.split('\n');
  let insertIndex = -1;
  let depth = 0;
  let inReturn = false;
  
  // Find where to insert - look for the closing of the main container
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line === '}' && lines[i-1]?.trim() === ');') {
      // Found the end of the function
      // Go back to find the closing </div>
      for (let j = i - 2; j >= 0; j--) {
        if (lines[j].trim().includes('</div>')) {
          insertIndex = j;
          break;
        }
      }
      break;
    }
  }
  
  if (insertIndex > 0 && !content.includes('SourcesUsedPanel sectorCode=')) {
    // Insert the SourcesUsedPanel before the last </div>
    lines.splice(insertIndex, 0, '', '      {/* Sources Used Panel */}', `      <SourcesUsedPanel sectorCode="${page.sectorCode}" />`);
    content = lines.join('\n');
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`${page.file}: Fixed`);
}
