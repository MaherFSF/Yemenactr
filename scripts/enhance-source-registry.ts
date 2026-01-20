/**
 * YETO Source Registry Enhancement Script
 * 
 * Integrates PDF-extracted source data with existing CSV registry
 * Performs comparison, deduplication, and enrichment
 * 
 * Run with: pnpm ts-node scripts/enhance-source-registry.ts
 */

import * as fs from 'fs';
import * as csv from 'csv-parse/sync';

interface SourceEntry {
  srcId: string;
  numericId: number;
  nameEn: string;
  nameAr?: string;
  category: string;
  subCategory?: string;
  type: string;
  url: string;
  urlRaw?: string;
  accessMethod: string;
  updateFrequency: string;
  tier: string;
  reliabilityScore: number;
  coverage: string;
  notes: string;
  origin: string;
  active: boolean;
  requiresKey: boolean;
  requiresPartnership: boolean;
  lastUpdate?: Date;
  dataGapTicket?: string;
}

/**
 * Parse CSV source registry
 */
function parseCSVRegistry(csvPath: string): SourceEntry[] {
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = csv.parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as any[];

  return records.map((row, idx) => ({
    srcId: row['SRC-ID']?.trim() || `SRC-${idx + 1}`,
    numericId: parseInt(row['Numeric ID'] || String(idx + 1)),
    nameEn: row['Name']?.trim() || 'Unknown',
    category: row['Category']?.trim() || 'Other',
    subCategory: row['Sub-Category']?.trim(),
    type: row['Type']?.trim() || 'API',
    url: row['URL']?.trim() || '',
    urlRaw: row['URL (Raw)']?.trim(),
    accessMethod: row['Access Method']?.trim() || 'WEB',
    updateFrequency: row['Update Cadence']?.trim() || 'Annual',
    tier: row['Tier']?.trim() || 'T2',
    reliabilityScore: extractReliabilityScore(row['Notes'] || ''),
    coverage: row['Coverage']?.trim() || '2010-present',
    notes: row['Notes']?.trim() || '',
    origin: row['Origin']?.trim() || 'Global',
    active: row['Status']?.toLowerCase() !== 'inactive',
    requiresKey: row['Access Method']?.includes('API') || false,
    requiresPartnership: row['Notes']?.toLowerCase().includes('partnership') || false,
  }));
}

/**
 * Extract reliability score from notes
 */
function extractReliabilityScore(notes: string): number {
  const scoreMap: Record<string, number> = {
    'A+': 98,
    'A': 95,
    'A-': 90,
    'B+': 85,
    'B': 75,
    'B-': 70,
    'C+': 65,
    'C': 60,
    'D': 40,
  };

  for (const [score, value] of Object.entries(scoreMap)) {
    if (notes.includes(score)) return value;
  }

  return 75; // Default
}

/**
 * Extract sector categories from PDF text
 */
function extractSectorCategories(pdfText: string): Map<string, string[]> {
  const sectors = new Map<string, string[]>();

  const sectorPatterns = [
    { sector: 'MACRO', keywords: ['Macroeconomy', 'GDP', 'Growth', 'Inflation'] },
    { sector: 'PRICES', keywords: ['Prices', 'Cost of Living', 'CPI', 'Inflation'] },
    { sector: 'CURRENCY', keywords: ['Currency', 'Exchange', 'FX rate', 'Reserves'] },
    { sector: 'BANKING', keywords: ['Banking', 'Finance', 'Financial', 'Credit'] },
    { sector: 'PUBLIC_FINANCE', keywords: ['Public Finance', 'Governance', 'Revenue', 'Expenditure'] },
    { sector: 'TRADE', keywords: ['Trade', 'Commerce', 'Exports', 'Imports'] },
    { sector: 'ENERGY', keywords: ['Energy', 'Fuel', 'Oil', 'Gas'] },
    { sector: 'LABOR', keywords: ['Labor', 'Wages', 'Employment', 'Unemployment'] },
    { sector: 'AID', keywords: ['Aid Flows', 'Projects', 'Donor', 'Humanitarian funding'] },
    { sector: 'FOOD_SECURITY', keywords: ['Food Security', 'Agriculture', 'Crop', 'Livestock'] },
    { sector: 'HUMANITARIAN', keywords: ['Humanitarian', 'Social Indicators', 'Health', 'Education'] },
    { sector: 'CONFLICT', keywords: ['Conflict', 'Political Economy', 'Battle', 'Airstrikes'] },
    { sector: 'INFRASTRUCTURE', keywords: ['Infrastructure', 'Services', 'Roads', 'Ports'] },
    { sector: 'INVESTMENT', keywords: ['Investment', 'Private Sector', 'FDI'] },
    { sector: 'NARRATIVE', keywords: ['Narrative', 'Research', 'Reports', 'Analysis'] },
    { sector: 'REMOTE_SENSING', keywords: ['Remote Sensing', 'Environmental', 'Satellite'] },
  ];

  for (const { sector, keywords } of sectorPatterns) {
    const matches: string[] = [];
    for (const keyword of keywords) {
      if (pdfText.includes(keyword)) {
        matches.push(keyword);
      }
    }
    if (matches.length > 0) {
      sectors.set(sector, matches);
    }
  }

  return sectors;
}

/**
 * Compare and deduplicate sources
 */
function deduplicateSources(csvSources: SourceEntry[], pdfSources: SourceEntry[]): {
  merged: SourceEntry[];
  newSources: SourceEntry[];
  duplicates: Array<{ csv: SourceEntry; pdf: SourceEntry }>;
} {
  const merged: SourceEntry[] = [...csvSources];
  const newSources: SourceEntry[] = [];
  const duplicates: Array<{ csv: SourceEntry; pdf: SourceEntry }> = [];

  for (const pdfSource of pdfSources) {
    const match = csvSources.find(
      csv =>
        csv.nameEn.toLowerCase() === pdfSource.nameEn.toLowerCase() ||
        (csv.url && pdfSource.url && csv.url === pdfSource.url)
    );

    if (match) {
      duplicates.push({ csv: match, pdf: pdfSource });
      // Merge data, preferring PDF if more complete
      Object.assign(match, {
        ...match,
        ...pdfSource,
        srcId: match.srcId, // Keep original ID
      });
    } else {
      newSources.push(pdfSource);
      merged.push(pdfSource);
    }
  }

  return { merged, newSources, duplicates };
}

/**
 * Identify data gaps
 */
function identifyDataGaps(sources: SourceEntry[]): Array<{
  sector: string;
  gap: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedAction: string;
}> {
  const gaps: Array<{
    sector: string;
    gap: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    suggestedAction: string;
  }> = [];

  const sectorCoverage = new Map<string, number>();

  for (const source of sources) {
    if (source.active) {
      const count = sectorCoverage.get(source.category) || 0;
      sectorCoverage.set(source.category, count + 1);
    }
  }

  // Check coverage thresholds
  for (const [sector, count] of sectorCoverage.entries()) {
    if (count < 3) {
      gaps.push({
        sector,
        gap: `Insufficient sources (${count} active)`,
        severity: 'HIGH',
        suggestedAction: `Identify and integrate 2-3 additional sources for ${sector}`,
      });
    }

    // Check for recent updates
    const sectorSources = sources.filter(s => s.category === sector && s.active);
    const staleCount = sectorSources.filter(
      s => !s.lastUpdate || Date.now() - s.lastUpdate.getTime() > 90 * 24 * 60 * 60 * 1000
    ).length;

    if (staleCount > sectorSources.length * 0.5) {
      gaps.push({
        sector,
        gap: `${staleCount}/${sectorSources.length} sources are stale (>90 days)`,
        severity: 'MEDIUM',
        suggestedAction: `Update connectors for ${sector} sources`,
      });
    }
  }

  return gaps;
}

/**
 * Generate enhanced registry report
 */
function generateReport(
  csvSources: SourceEntry[],
  pdfSources: SourceEntry[],
  comparison: ReturnType<typeof deduplicateSources>,
  gaps: ReturnType<typeof identifyDataGaps>,
  sectors: Map<string, string[]>
): string {
  let report = `
# YETO Source Registry Enhancement Report
Generated: ${new Date().toISOString()}

## Summary
- CSV Sources: ${csvSources.length}
- PDF Sources: ${pdfSources.length}
- Merged Total: ${comparison.merged.length}
- New Sources Found: ${comparison.newSources.length}
- Duplicates Identified: ${comparison.duplicates.length}

## Sector Categories Identified
${Array.from(sectors.entries())
  .map(([sector, keywords]) => `- **${sector}**: ${keywords.join(', ')}`)
  .join('\n')}

## Data Gaps Identified
${
  gaps.length > 0
    ? gaps
        .map(
          gap =>
            `### ${gap.sector} (${gap.severity})
- Gap: ${gap.gap}
- Action: ${gap.suggestedAction}`
        )
        .join('\n\n')
    : 'No critical gaps identified.'
}

## New Sources to Integrate
${
  comparison.newSources.length > 0
    ? comparison.newSources
        .map(
          source =>
            `### ${source.nameEn}
- Category: ${source.category}
- Access: ${source.accessMethod}
- Update Frequency: ${source.updateFrequency}
- Reliability: ${source.reliabilityScore}/100
- URL: ${source.url}
- Notes: ${source.notes}`
        )
        .join('\n\n')
    : 'No new sources to integrate.'
}

## Duplicates Found
${
  comparison.duplicates.length > 0
    ? comparison.duplicates
        .map(
          dup =>
            `### ${dup.csv.nameEn}
- CSV ID: ${dup.csv.srcId}
- PDF ID: ${dup.pdf.srcId}
- Recommendation: Merge and keep CSV ID`
        )
        .join('\n\n')
    : 'No duplicates found.'
}

## Reliability Distribution
${generateReliabilityDistribution(comparison.merged)}

## Recommendations
1. Integrate ${comparison.newSources.length} new sources into the registry
2. Update ${comparison.duplicates.length} duplicate entries
3. Address ${gaps.filter(g => g.severity === 'HIGH').length} high-priority data gaps
4. Implement ${gaps.filter(g => g.severity === 'MEDIUM').length} medium-priority improvements
5. Schedule quarterly registry reviews to maintain data freshness

## Action Items
- [ ] Review and approve new sources
- [ ] Implement connectors for high-priority sources
- [ ] Update source metadata in database
- [ ] Communicate changes to stakeholders
- [ ] Schedule next registry update (30 days)
`;

  return report;
}

/**
 * Generate reliability distribution chart
 */
function generateReliabilityDistribution(sources: SourceEntry[]): string {
  const distribution = {
    'A (90-100)': sources.filter(s => s.reliabilityScore >= 90).length,
    'B (70-89)': sources.filter(s => s.reliabilityScore >= 70 && s.reliabilityScore < 90).length,
    'C (50-69)': sources.filter(s => s.reliabilityScore >= 50 && s.reliabilityScore < 70).length,
    'D (<50)': sources.filter(s => s.reliabilityScore < 50).length,
  };

  return Object.entries(distribution)
    .map(([grade, count]) => `- ${grade}: ${count} sources`)
    .join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting YETO Source Registry Enhancement\n');

  try {
    // Parse CSV registry
    console.log('📖 Parsing CSV source registry...');
    const csvPath = '/home/ubuntu/upload/sources_seed_225.csv';
    const csvSources = parseCSVRegistry(csvPath);
    console.log(`✓ Loaded ${csvSources.length} sources from CSV\n`);

    // Extract PDF text
    console.log('📄 Extracting PDF registry data...');
    const pdfText = fs.readFileSync('/home/ubuntu/upload/registry_extracted.txt', 'utf-8');
    console.log(`✓ Extracted ${pdfText.length} characters from PDF\n`);

    // Extract sector categories
    console.log('🏭 Identifying sector categories...');
    const sectors = extractSectorCategories(pdfText);
    console.log(`✓ Found ${sectors.size} sector categories\n`);

    // Parse PDF sources (simulated - in production would use more sophisticated parsing)
    console.log('🔍 Parsing PDF sources...');
    const pdfSources: SourceEntry[] = [];
    // Extract sources from PDF text using regex patterns
    const sourcePattern = /([A-Z][A-Za-z\s&]+)\s+(?:Global|Regional|National|NGO)\s+([A-Z]+)\s+(API|Web|Download|Scrape)/g;
    let match;
    while ((match = sourcePattern.exec(pdfText)) !== null) {
      if (pdfSources.length < 50) {
        // Limit to avoid duplicates
        pdfSources.push({
          srcId: `SRC-PDF-${pdfSources.length + 1}`,
          numericId: 300 + pdfSources.length,
          nameEn: match[1].trim(),
          category: 'MACRO',
          type: 'API',
          url: '',
          accessMethod: match[3],
          updateFrequency: 'Annual',
          tier: 'T2',
          reliabilityScore: 75,
          coverage: '2010-present',
          notes: 'Extracted from PDF registry',
          origin: match[2],
          active: true,
          requiresKey: false,
          requiresPartnership: false,
        });
      }
    }
    console.log(`✓ Extracted ${pdfSources.length} sources from PDF\n`);

    // Compare and deduplicate
    console.log('🔄 Comparing and deduplicating sources...');
    const comparison = deduplicateSources(csvSources, pdfSources);
    console.log(`✓ Merged ${comparison.merged.length} unique sources`);
    console.log(`✓ Found ${comparison.newSources.length} new sources`);
    console.log(`✓ Identified ${comparison.duplicates.length} duplicates\n`);

    // Identify data gaps
    console.log('⚠️  Identifying data gaps...');
    const gaps = identifyDataGaps(comparison.merged);
    console.log(`✓ Found ${gaps.length} data gaps\n`);

    // Generate report
    console.log('📊 Generating enhancement report...');
    const report = generateReport(csvSources, pdfSources, comparison, gaps, sectors);

    // Save report
    const reportPath = '/home/ubuntu/yeto-platform/docs/SOURCE_REGISTRY_ENHANCEMENT_REPORT.md';
    fs.writeFileSync(reportPath, report);
    console.log(`✓ Report saved to ${reportPath}\n`);

    // Save enhanced registry
    console.log('💾 Saving enhanced registry...');
    const enhancedRegistry = {
      timestamp: new Date().toISOString(),
      totalSources: comparison.merged.length,
      newSources: comparison.newSources.length,
      duplicatesResolved: comparison.duplicates.length,
      sectors: Array.from(sectors.entries()),
      dataGaps: gaps,
      sources: comparison.merged,
    };

    const registryPath = '/home/ubuntu/yeto-platform/data/enhanced-source-registry.json';
    fs.writeFileSync(registryPath, JSON.stringify(enhancedRegistry, null, 2));
    console.log(`✓ Enhanced registry saved to ${registryPath}\n`);

    console.log('✅ Enhancement Complete!\n');
    console.log('📋 Summary:');
    console.log(`   - Total Sources: ${comparison.merged.length}`);
    console.log(`   - New Sources: ${comparison.newSources.length}`);
    console.log(`   - Duplicates Resolved: ${comparison.duplicates.length}`);
    console.log(`   - Data Gaps: ${gaps.length}`);
    console.log(`   - Sectors: ${sectors.size}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
