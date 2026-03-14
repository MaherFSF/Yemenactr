/**
 * Script to add useSectorData hook to all sector pages
 * This adds live database indicators to each sector page
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SECTORS_DIR = path.join(__dirname, '../../client/src/pages/sectors');

// Map sector page name to sector code in database
const sectorMap: Record<string, { code: string; color: string; indicatorCodes: string[] }> = {
  'Energy': {
    code: 'energy',
    color: '#f59e0b',
    indicatorCodes: ['WB_ENERGY_IMPORTS', 'WB_ELECTRICITY_ACCESS', 'WB_RENEWABLE_ENERGY', 'WB_FOSSIL_FUEL_CONSUMPTION']
  },
  'FoodSecurity': {
    code: 'food_security',
    color: '#16a34a',
    indicatorCodes: ['WB_FOOD_IMPORTS', 'WB_AGRICULTURE_GDP', 'WB_CEREAL_YIELD', 'WB_ARABLE_LAND']
  },
  'AidFlows': {
    code: 'aid_flows',
    color: '#3b82f6',
    indicatorCodes: ['WB_NET_ODA', 'WB_ODA_GNI', 'UNHCR_REFUGEES', 'UNHCR_IDPS']
  },
  'Agriculture': {
    code: 'agriculture',
    color: '#65a30d',
    indicatorCodes: ['WB_AGRICULTURE_GDP', 'WB_CEREAL_YIELD', 'WB_ARABLE_LAND', 'WB_FOOD_IMPORTS']
  },
  'LaborMarket': {
    code: 'labor',
    color: '#8b5cf6',
    indicatorCodes: ['WB_UNEMPLOYMENT', 'WB_LABOR_FORCE', 'WB_EMPLOYMENT_RATIO', 'WB_YOUTH_UNEMPLOYMENT']
  },
  'Prices': {
    code: 'prices',
    color: '#ef4444',
    indicatorCodes: ['WB_CPI_INFLATION', 'WB_GDP_DEFLATOR', 'WB_FOOD_IMPORTS']
  },
  'Currency': {
    code: 'currency',
    color: '#0ea5e9',
    indicatorCodes: ['WB_EXCHANGE_RATE', 'WB_BROAD_MONEY', 'WB_RESERVES', 'WB_INFLATION']
  },
  'ConflictEconomy': {
    code: 'conflict',
    color: '#dc2626',
    indicatorCodes: ['WB_MILITARY_EXPENDITURE', 'WB_REFUGEE_POPULATION', 'UNHCR_IDPS', 'WB_NET_ODA']
  },
  'Infrastructure': {
    code: 'infrastructure',
    color: '#6366f1',
    indicatorCodes: ['WB_ELECTRICITY_ACCESS', 'WB_INTERNET_USERS', 'WB_MOBILE_SUBSCRIPTIONS']
  },
  'Investment': {
    code: 'investment',
    color: '#14b8a6',
    indicatorCodes: ['WB_FDI_INFLOWS', 'WB_GROSS_CAPITAL', 'WB_DOMESTIC_CREDIT']
  },
  'Microfinance': {
    code: 'microfinance',
    color: '#f97316',
    indicatorCodes: ['WB_DOMESTIC_CREDIT', 'WB_BROAD_MONEY', 'WB_BANK_CAPITAL_ASSETS']
  },
  'Poverty': {
    code: 'poverty',
    color: '#a855f7',
    indicatorCodes: ['WB_POVERTY_RATIO', 'WB_GINI', 'WB_GNI_PER_CAPITA', 'WB_LIFE_EXPECTANCY']
  },
  'PublicFinance': {
    code: 'public_finance',
    color: '#0d9488',
    indicatorCodes: ['WB_TAX_REVENUE', 'WB_GOVERNMENT_EXPENDITURE', 'WB_EXTERNAL_DEBT', 'WB_DEBT_SERVICE']
  },
  'Macroeconomy': {
    code: 'macro',
    color: '#2563eb',
    indicatorCodes: ['WB_GDP_CURRENT_USD', 'WB_GDP_GROWTH', 'WB_GDP_PER_CAPITA', 'WB_CPI_INFLATION']
  },
};

let modified = 0;

for (const [pageName, config] of Object.entries(sectorMap)) {
  const filePath = path.join(SECTORS_DIR, `${pageName}.tsx`);
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${pageName}.tsx not found, skipping`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has useSectorData
  if (content.includes('useSectorData')) {
    console.log(`✅ ${pageName}.tsx already has useSectorData`);
    continue;
  }

  // Add import for useSectorData
  const importLine = `import { useSectorData, formatIndicatorValue } from "@/hooks/useSectorData";\n`;
  
  // Find the last import line
  const importLines = content.split('\n');
  let lastImportIdx = 0;
  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i].startsWith('import ') || importLines[i].match(/^\s*\} from /)) {
      lastImportIdx = i;
    }
  }
  
  // Insert after last import
  importLines.splice(lastImportIdx + 1, 0, importLine);
  content = importLines.join('\n');

  // Find the export default function and add the hook call after the first line of state
  const funcMatch = content.match(/export default function \w+\(\)\s*\{/);
  if (funcMatch && funcMatch.index !== undefined) {
    const insertPos = funcMatch.index + funcMatch[0].length;
    const hookCode = `\n  // Live database indicators\n  const { indicators: liveIndicators, latestValues, isLoading: liveLoading } = useSectorData("${config.code}");\n`;
    content = content.slice(0, insertPos) + hookCode + content.slice(insertPos);
  }

  // Find the closing </div> before the last SourcesUsedPanel or at the end
  // Add a live data section before the data sources card
  const liveDataSection = `
        {/* Live Database Indicators */}
        {Object.keys(latestValues).length > 0 && (
          <div className="mb-8 p-6 rounded-xl border border-[${config.color}]/20 bg-[${config.color}]/5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live World Bank Indicators
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(latestValues).slice(0, 6).map(([code, regimes]: [string, any]) => {
                const regime = regimes.aden || regimes.sanaa;
                if (!regime) return null;
                const ind = liveIndicators.find((i: any) => i.code === code);
                return (
                  <div key={code} className="p-4 rounded-lg bg-white dark:bg-gray-800 border">
                    <div className="text-sm text-muted-foreground mb-1">{ind?.nameEn || code}</div>
                    <div className="text-2xl font-bold" style={{ color: '${config.color}' }}>
                      {formatIndicatorValue(regime.value, ind?.unit || "")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {regime.year} · {regime.source}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
`;

  // Try to insert before SourcesUsedPanel
  if (content.includes('<SourcesUsedPanel')) {
    content = content.replace(
      /(\s*{\/\* Sources Used Panel \*\/}|\s*<SourcesUsedPanel)/,
      liveDataSection + '\n$1'
    );
  }

  fs.writeFileSync(filePath, content);
  console.log(`✏️  ${pageName}.tsx updated with useSectorData hook`);
  modified++;
}

console.log(`\n📊 Modified ${modified} sector pages`);
