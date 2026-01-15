/**
 * Banking Data Integration Service
 * Integrates data from Yemeni banks including:
 * - بنك التضامن الإسلامي الدولي (Al-Tadhamon Islamic International Bank)
 * - بنك الكريمي للتمويل الأصغر والأ (Al-Kuraimi Islamic Microfinance Bank)
 * - Other commercial banks
 */

import { getDb } from '../db';
import { timeSeries, commercialBanks } from '../../drizzle/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface BankData {
  bankId: string;
  bankName: string;
  bankNameAr: string;
  date: Date;
  totalAssets?: number;
  totalDeposits?: number;
  totalLoans?: number;
  capitalAdequacyRatio?: number;
  liquidityRatio?: number;
  nplRatio?: number; // Non-performing loans
  profitability?: number;
  branchCount?: number;
  atmCount?: number;
  regime: 'aden' | 'sanaa' | 'both';
  source: string;
  confidence: 'A' | 'B' | 'C' | 'D';
}

// Major Yemeni banks with their details
export const YEMENI_BANKS = {
  TADHAMON: {
    id: 'tadhamon',
    name: 'Al-Tadhamon Islamic International Bank',
    nameAr: 'بنك التضامن الإسلامي الدولي',
    website: 'https://www.tadhamon-bank.com',
    regime: 'both' as const,
    type: 'islamic'
  },
  KURAIMI: {
    id: 'kuraimi',
    name: 'Al-Kuraimi Islamic Microfinance Bank',
    nameAr: 'بنك الكريمي للتمويل الأصغر والأصغر الإسلامي',
    website: 'https://www.alkuraimi.com',
    regime: 'both' as const,
    type: 'islamic_microfinance'
  },
  CAC: {
    id: 'cac',
    name: 'Cooperative and Agricultural Credit Bank',
    nameAr: 'بنك التسليف التعاوني والزراعي',
    regime: 'both' as const,
    type: 'specialized'
  },
  YEMEN_BANK: {
    id: 'yemen_bank',
    name: 'Yemen Bank for Reconstruction and Development',
    nameAr: 'بنك اليمن للإنشاء والتعمير',
    regime: 'both' as const,
    type: 'commercial'
  },
  NATIONAL_BANK: {
    id: 'national_bank',
    name: 'National Bank of Yemen',
    nameAr: 'البنك الأهلي اليمني',
    regime: 'both' as const,
    type: 'commercial'
  },
  YEMEN_KUWAIT_BANK: {
    id: 'yemen_kuwait_bank',
    name: 'Yemen Kuwait Bank',
    nameAr: 'بنك اليمن والكويت',
    regime: 'both' as const,
    type: 'commercial'
  },
  SABA_ISLAMIC: {
    id: 'saba_islamic',
    name: 'Saba Islamic Bank',
    nameAr: 'بنك سبأ الإسلامي',
    regime: 'both' as const,
    type: 'islamic'
  },
  YEMEN_INTERNATIONAL: {
    id: 'yemen_international',
    name: 'Yemen International Bank',
    nameAr: 'بنك اليمن الدولي',
    regime: 'both' as const,
    type: 'commercial'
  }
};

/**
 * Fetch banking sector indicators
 * Sources: CBY reports, bank annual reports, IMF data
 */
export async function fetchBankingSectorData(
  startDate: Date,
  endDate: Date
): Promise<BankData[]> {
  const db = await getDb();
  if (!db) {
    console.error('[BankingDataService] Database connection failed');
    return [];
  }

  try {
    // Query time series data for banking indicators
    const bankingData = await db
      .select()
      .from(timeSeries)
      .where(
        and(
          gte(timeSeries.date, startDate),
          lte(timeSeries.date, endDate),
          // Filter for banking-related indicators
          // indicatorId LIKE '%bank%' OR '%deposit%' OR '%loan%' OR '%credit%'
        )
      )
      .orderBy(desc(timeSeries.date));

    // Transform to BankData format
    const transformedData: BankData[] = [];

    // Group by bank and date
    const bankDataMap = new Map<string, Map<string, any>>();

    for (const row of bankingData) {
      // Extract bank info from indicator or metadata
      const bankId = extractBankId(row.indicatorCode);
      if (!bankId) continue;

      const dateKey = row.date.toISOString().split('T')[0];
      
      if (!bankDataMap.has(bankId)) {
        bankDataMap.set(bankId, new Map());
      }

      const bankDates = bankDataMap.get(bankId)!;
      if (!bankDates.has(dateKey)) {
        bankDates.set(dateKey, {
          bankId,
          date: row.date,
          regime: row.regimeTag || 'both',
          source: row.sourceId?.toString() || 'CBY',
          confidence: row.confidenceRating || 'B'
        });
      }

      // Map indicator to bank metric
      const metric = mapIndicatorToMetric(row.indicatorCode);
      if (metric) {
        bankDates.get(dateKey)![metric] = row.value;
      }
    }

    // Flatten the map structure
    for (const [bankId, dates] of Array.from(bankDataMap.entries())) {
      const bank = Object.values(YEMENI_BANKS).find(b => b.id === bankId);
      if (!bank) continue;

      for (const data of Array.from(dates.values())) {
        transformedData.push({
          ...data,
          bankName: bank.name,
          bankNameAr: bank.nameAr
        });
      }
    }

    return transformedData;
  } catch (error) {
    console.error('[BankingDataService] Error fetching banking data:', error);
    return [];
  }
}

/**
 * Extract bank ID from indicator ID
 * Examples:
 * - "bank_tadhamon_total_assets" -> "tadhamon"
 * - "bank_kuraimi_deposits" -> "kuraimi"
 */
function extractBankId(indicatorId: string): string | null {
  const match = indicatorId.match(/bank_([a-z_]+)_/);
  return match ? match[1] : null;
}

/**
 * Map indicator ID to bank metric field
 */
function mapIndicatorToMetric(indicatorId: string): keyof BankData | null {
  if (indicatorId.includes('total_assets')) return 'totalAssets';
  if (indicatorId.includes('deposits')) return 'totalDeposits';
  if (indicatorId.includes('loans') || indicatorId.includes('credit')) return 'totalLoans';
  if (indicatorId.includes('car') || indicatorId.includes('capital_adequacy')) return 'capitalAdequacyRatio';
  if (indicatorId.includes('liquidity')) return 'liquidityRatio';
  if (indicatorId.includes('npl') || indicatorId.includes('non_performing')) return 'nplRatio';
  if (indicatorId.includes('profit') || indicatorId.includes('roi')) return 'profitability';
  if (indicatorId.includes('branch')) return 'branchCount';
  if (indicatorId.includes('atm')) return 'atmCount';
  return null;
}

/**
 * Get latest banking sector summary
 */
export async function getBankingSectorSummary() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12); // Last 12 months

  const data = await fetchBankingSectorData(startDate, endDate);

  // Calculate aggregates
  const latestData = data.filter(d => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return d.date >= monthAgo;
  });

  const totalAssets = latestData.reduce((sum, d) => sum + (d.totalAssets || 0), 0);
  const totalDeposits = latestData.reduce((sum, d) => sum + (d.totalDeposits || 0), 0);
  const totalLoans = latestData.reduce((sum, d) => sum + (d.totalLoans || 0), 0);
  const avgNPL = latestData.length > 0
    ? latestData.reduce((sum, d) => sum + (d.nplRatio || 0), 0) / latestData.length
    : 0;

  return {
    totalAssets,
    totalDeposits,
    totalLoans,
    avgNPL,
    bankCount: new Set(latestData.map(d => d.bankId)).size,
    lastUpdated: latestData.length > 0 ? latestData[0].date : new Date(),
    dataPoints: latestData.length
  };
}

/**
 * Get bank-specific data
 */
export async function getBankData(bankId: string, months: number = 12) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const allData = await fetchBankingSectorData(startDate, endDate);
  return allData.filter(d => d.bankId === bankId);
}

/**
 * Compare banks
 */
export async function compareBanks(bankIds: string[], metric: keyof BankData) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);

  const allData = await fetchBankingSectorData(startDate, endDate);
  
  const comparison = bankIds.map(bankId => {
    const bankData = allData.filter(d => d.bankId === bankId);
    const latestData = bankData[0];
    
    return {
      bankId,
      bankName: latestData?.bankName || bankId,
      bankNameAr: latestData?.bankNameAr || bankId,
      value: latestData?.[metric] || 0,
      trend: calculateTrend(bankData, metric),
      dataPoints: bankData.length
    };
  });

  return comparison.sort((a, b) => (b.value as number) - (a.value as number));
}

/**
 * Calculate trend (percentage change over period)
 */
function calculateTrend(data: BankData[], metric: keyof BankData): number {
  if (data.length < 2) return 0;

  const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  const oldest = sorted[0][metric] as number || 0;
  const newest = sorted[sorted.length - 1][metric] as number || 0;

  if (oldest === 0) return 0;
  return ((newest - oldest) / oldest) * 100;
}

export default {
  fetchBankingSectorData,
  getBankingSectorSummary,
  getBankData,
  compareBanks,
  YEMENI_BANKS
};
