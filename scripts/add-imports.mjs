import fs from 'fs';

const files = [
  'Agriculture.tsx', 'AidFlows.tsx', 'ConflictEconomy.tsx', 'Energy.tsx',
  'FoodSecurity.tsx', 'Infrastructure.tsx', 'Investment.tsx', 'Microfinance.tsx',
  'Poverty.tsx', 'Prices.tsx', 'PublicFinance.tsx', 'Trade.tsx'
];

for (const file of files) {
  const filePath = `client/src/pages/sectors/${file}`;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('import { SourcesUsedPanel }') && !content.includes("import SourcesUsedPanel")) {
    // Find a good place to add the import - after useState or trpc import
    if (content.includes("import { trpc }")) {
      content = content.replace(
        /import { trpc } from ["']@\/lib\/trpc["'];/,
        `import { trpc } from "@/lib/trpc";\nimport { SourcesUsedPanel } from "@/components/SourcesUsedPanel";`
      );
    } else if (content.includes("import { useState")) {
      content = content.replace(
        /import { useState[^}]*} from ["']react["'];/,
        (match) => `${match}\nimport { SourcesUsedPanel } from "@/components/SourcesUsedPanel";`
      );
    } else {
      // Add at the top after first import
      content = content.replace(
        /(import [^;]+;)/,
        `$1\nimport { SourcesUsedPanel } from "@/components/SourcesUsedPanel";`
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`${file}: Added import`);
  } else {
    console.log(`${file}: Already has import`);
  }
}
