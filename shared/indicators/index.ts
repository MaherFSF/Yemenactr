/**
 * YETO Indicator Definitions - Section 7 Complete Implementation
 * All 10 indicator families with full metadata as per master prompt
 */

// Types defined locally to match Section 7 requirements
export type IndicatorFamily = 
  | 'macro_fiscal'
  | 'monetary_banking'
  | 'trade_bop'
  | 'energy_fuel'
  | 'food_agriculture'
  | 'humanitarian'
  | 'conflict_security'
  | 'social_labor'
  | 'governance'
  | 'private_sector';

export type ConfidenceRating = 'A' | 'B' | 'C' | 'D';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';

export interface BilingualText {
  en: string;
  ar: string;
}

export interface Indicator {
  id: string;
  code: string;
  name: BilingualText;
  description: BilingualText;
  family: IndicatorFamily;
  unit: string;
  frequency: Frequency;
  methodology: string;
  sources: string[];
  startYear: number;
  regimeSplit: boolean;
  confidenceDefault: ConfidenceRating;
  tags: string[];
}

export interface IndicatorFamilyMeta {
  id: IndicatorFamily;
  name: BilingualText;
  description: BilingualText;
  icon: string;
  color: string;
  indicatorCount: number;
}

export interface IndicatorCatalog {
  version: string;
  lastUpdated: string;
  totalIndicators: number;
  families: IndicatorFamilyMeta[];
  indicators: Indicator[];
}

// ============================================================================
// 1. MACRO-FISCAL INDICATORS
// ============================================================================
export const macroFiscalIndicators: Indicator[] = [
  {
    id: 'gdp_nominal',
    code: 'MF001',
    name: { en: 'Nominal GDP', ar: 'الناتج المحلي الإجمالي الاسمي' },
    description: { 
      en: 'Total market value of all final goods and services produced within Yemen',
      ar: 'القيمة السوقية الإجمالية لجميع السلع والخدمات النهائية المنتجة داخل اليمن'
    },
    family: 'macro_fiscal',
    unit: 'USD_BILLION',
    frequency: 'annual',
    methodology: 'Expenditure approach with production cross-validation',
    sources: ['World Bank', 'IMF', 'CBY-Aden', 'CBY-Sanaa'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'B',
    tags: ['gdp', 'output', 'national_accounts']
  },
  {
    id: 'gdp_real',
    code: 'MF002',
    name: { en: 'Real GDP (2015 prices)', ar: 'الناتج المحلي الإجمالي الحقيقي (أسعار 2015)' },
    description: {
      en: 'GDP adjusted for inflation using 2015 as base year',
      ar: 'الناتج المحلي الإجمالي المعدل للتضخم باستخدام 2015 كسنة أساس'
    },
    family: 'macro_fiscal',
    unit: 'USD_BILLION',
    frequency: 'annual',
    methodology: 'Chain-linked volume measures',
    sources: ['World Bank', 'IMF'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['gdp', 'real', 'national_accounts']
  },
  {
    id: 'gdp_growth',
    code: 'MF003',
    name: { en: 'GDP Growth Rate', ar: 'معدل نمو الناتج المحلي الإجمالي' },
    description: {
      en: 'Annual percentage change in real GDP',
      ar: 'التغير السنوي في الناتج المحلي الإجمالي الحقيقي'
    },
    family: 'macro_fiscal',
    unit: 'PERCENT',
    frequency: 'annual',
    methodology: 'Year-over-year change in real GDP',
    sources: ['World Bank', 'IMF'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['gdp', 'growth', 'economic_performance']
  },
  {
    id: 'gdp_per_capita',
    code: 'MF004',
    name: { en: 'GDP per Capita', ar: 'نصيب الفرد من الناتج المحلي الإجمالي' },
    description: {
      en: 'GDP divided by total population',
      ar: 'الناتج المحلي الإجمالي مقسوماً على إجمالي السكان'
    },
    family: 'macro_fiscal',
    unit: 'USD',
    frequency: 'annual',
    methodology: 'Nominal GDP / mid-year population estimate',
    sources: ['World Bank', 'IMF'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['gdp', 'per_capita', 'living_standards']
  },
  {
    id: 'inflation_cpi',
    code: 'MF005',
    name: { en: 'Consumer Price Inflation', ar: 'تضخم أسعار المستهلك' },
    description: {
      en: 'Annual percentage change in consumer price index',
      ar: 'التغير السنوي في مؤشر أسعار المستهلك'
    },
    family: 'macro_fiscal',
    unit: 'PERCENT',
    frequency: 'monthly',
    methodology: 'Laspeyres index with 2014 basket weights',
    sources: ['CSO Yemen', 'World Bank'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'B',
    tags: ['inflation', 'prices', 'cost_of_living']
  },
  {
    id: 'fiscal_balance',
    code: 'MF006',
    name: { en: 'Fiscal Balance (% GDP)', ar: 'الرصيد المالي (% من الناتج المحلي)' },
    description: {
      en: 'Government revenue minus expenditure as percentage of GDP',
      ar: 'إيرادات الحكومة ناقص النفقات كنسبة من الناتج المحلي الإجمالي'
    },
    family: 'macro_fiscal',
    unit: 'PERCENT_GDP',
    frequency: 'annual',
    methodology: 'IMF GFS methodology',
    sources: ['IMF', 'Ministry of Finance'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'C',
    tags: ['fiscal', 'budget', 'government']
  },
  {
    id: 'public_debt',
    code: 'MF007',
    name: { en: 'Public Debt (% GDP)', ar: 'الدين العام (% من الناتج المحلي)' },
    description: {
      en: 'Total government debt as percentage of GDP',
      ar: 'إجمالي الدين الحكومي كنسبة من الناتج المحلي الإجمالي'
    },
    family: 'macro_fiscal',
    unit: 'PERCENT_GDP',
    frequency: 'annual',
    methodology: 'Gross debt including domestic and external',
    sources: ['IMF', 'World Bank'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'C',
    tags: ['debt', 'fiscal', 'sustainability']
  },
  {
    id: 'gov_revenue',
    code: 'MF008',
    name: { en: 'Government Revenue', ar: 'الإيرادات الحكومية' },
    description: {
      en: 'Total government revenue including tax and non-tax',
      ar: 'إجمالي الإيرادات الحكومية بما في ذلك الضريبية وغير الضريبية'
    },
    family: 'macro_fiscal',
    unit: 'YER_BILLION',
    frequency: 'annual',
    methodology: 'Cash basis accounting',
    sources: ['Ministry of Finance', 'IMF'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'C',
    tags: ['revenue', 'fiscal', 'government']
  },
  {
    id: 'gov_expenditure',
    code: 'MF009',
    name: { en: 'Government Expenditure', ar: 'النفقات الحكومية' },
    description: {
      en: 'Total government spending including current and capital',
      ar: 'إجمالي الإنفاق الحكومي بما في ذلك الجاري والرأسمالي'
    },
    family: 'macro_fiscal',
    unit: 'YER_BILLION',
    frequency: 'annual',
    methodology: 'Cash basis accounting',
    sources: ['Ministry of Finance', 'IMF'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'C',
    tags: ['expenditure', 'fiscal', 'government']
  },
  {
    id: 'tax_revenue',
    code: 'MF010',
    name: { en: 'Tax Revenue (% GDP)', ar: 'الإيرادات الضريبية (% من الناتج المحلي)' },
    description: {
      en: 'Total tax collection as percentage of GDP',
      ar: 'إجمالي التحصيل الضريبي كنسبة من الناتج المحلي الإجمالي'
    },
    family: 'macro_fiscal',
    unit: 'PERCENT_GDP',
    frequency: 'annual',
    methodology: 'IMF GFS classification',
    sources: ['IMF', 'Ministry of Finance'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'C',
    tags: ['tax', 'revenue', 'fiscal']
  }
];

// ============================================================================
// 2. MONETARY & BANKING INDICATORS
// ============================================================================
export const monetaryBankingIndicators: Indicator[] = [
  {
    id: 'exchange_rate_official',
    code: 'MB001',
    name: { en: 'Official Exchange Rate (YER/USD)', ar: 'سعر الصرف الرسمي (ريال/دولار)' },
    description: {
      en: 'Official central bank exchange rate',
      ar: 'سعر الصرف الرسمي للبنك المركزي'
    },
    family: 'monetary_banking',
    unit: 'YER_PER_USD',
    frequency: 'daily',
    methodology: 'Central bank published rate',
    sources: ['CBY-Aden', 'CBY-Sanaa'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'A',
    tags: ['exchange_rate', 'currency', 'monetary']
  },
  {
    id: 'exchange_rate_parallel',
    code: 'MB002',
    name: { en: 'Parallel Market Rate (YER/USD)', ar: 'سعر السوق الموازي (ريال/دولار)' },
    description: {
      en: 'Unofficial market exchange rate',
      ar: 'سعر الصرف في السوق غير الرسمي'
    },
    family: 'monetary_banking',
    unit: 'YER_PER_USD',
    frequency: 'daily',
    methodology: 'Market survey of exchange bureaus',
    sources: ['Market surveys', 'News reports'],
    startYear: 2015,
    regimeSplit: true,
    confidenceDefault: 'B',
    tags: ['exchange_rate', 'parallel_market', 'currency']
  },
  {
    id: 'money_supply_m2',
    code: 'MB003',
    name: { en: 'Money Supply (M2)', ar: 'عرض النقود (م2)' },
    description: {
      en: 'Broad money including currency, demand deposits, and quasi-money',
      ar: 'النقود بالمعنى الواسع شاملة العملة والودائع تحت الطلب وشبه النقود'
    },
    family: 'monetary_banking',
    unit: 'YER_BILLION',
    frequency: 'monthly',
    methodology: 'IMF monetary statistics methodology',
    sources: ['CBY-Aden', 'CBY-Sanaa', 'IMF'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'B',
    tags: ['money_supply', 'monetary', 'liquidity']
  },
  {
    id: 'foreign_reserves',
    code: 'MB004',
    name: { en: 'Foreign Exchange Reserves', ar: 'احتياطيات النقد الأجنبي' },
    description: {
      en: 'Central bank foreign currency holdings',
      ar: 'حيازات البنك المركزي من العملات الأجنبية'
    },
    family: 'monetary_banking',
    unit: 'USD_MILLION',
    frequency: 'monthly',
    methodology: 'IMF BPM6 definition',
    sources: ['CBY-Aden', 'IMF'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'B',
    tags: ['reserves', 'foreign_exchange', 'monetary']
  },
  {
    id: 'interest_rate_deposit',
    code: 'MB005',
    name: { en: 'Deposit Interest Rate', ar: 'سعر فائدة الودائع' },
    description: {
      en: 'Average interest rate on time deposits',
      ar: 'متوسط سعر الفائدة على الودائع لأجل'
    },
    family: 'monetary_banking',
    unit: 'PERCENT',
    frequency: 'monthly',
    methodology: 'Weighted average of commercial bank rates',
    sources: ['CBY-Aden', 'CBY-Sanaa'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'B',
    tags: ['interest_rate', 'deposits', 'banking']
  },
  {
    id: 'interest_rate_lending',
    code: 'MB006',
    name: { en: 'Lending Interest Rate', ar: 'سعر فائدة الإقراض' },
    description: {
      en: 'Average interest rate on commercial loans',
      ar: 'متوسط سعر الفائدة على القروض التجارية'
    },
    family: 'monetary_banking',
    unit: 'PERCENT',
    frequency: 'monthly',
    methodology: 'Weighted average of commercial bank rates',
    sources: ['CBY-Aden', 'CBY-Sanaa'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'B',
    tags: ['interest_rate', 'lending', 'banking']
  },
  {
    id: 'bank_deposits',
    code: 'MB007',
    name: { en: 'Total Bank Deposits', ar: 'إجمالي الودائع المصرفية' },
    description: {
      en: 'Total deposits in commercial banking system',
      ar: 'إجمالي الودائع في الجهاز المصرفي التجاري'
    },
    family: 'monetary_banking',
    unit: 'YER_BILLION',
    frequency: 'monthly',
    methodology: 'Sum of demand and time deposits',
    sources: ['CBY-Aden', 'CBY-Sanaa'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'B',
    tags: ['deposits', 'banking', 'financial_sector']
  },
  {
    id: 'bank_credit',
    code: 'MB008',
    name: { en: 'Bank Credit to Private Sector', ar: 'الائتمان المصرفي للقطاع الخاص' },
    description: {
      en: 'Total lending by commercial banks to private sector',
      ar: 'إجمالي إقراض البنوك التجارية للقطاع الخاص'
    },
    family: 'monetary_banking',
    unit: 'YER_BILLION',
    frequency: 'monthly',
    methodology: 'IMF monetary statistics',
    sources: ['CBY-Aden', 'CBY-Sanaa'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'B',
    tags: ['credit', 'lending', 'banking']
  },
  {
    id: 'npl_ratio',
    code: 'MB009',
    name: { en: 'Non-Performing Loans Ratio', ar: 'نسبة القروض المتعثرة' },
    description: {
      en: 'Percentage of loans in default or close to default',
      ar: 'نسبة القروض المتعثرة أو القريبة من التعثر'
    },
    family: 'monetary_banking',
    unit: 'PERCENT',
    frequency: 'quarterly',
    methodology: 'IMF FSI methodology',
    sources: ['CBY-Aden', 'IMF'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'C',
    tags: ['npl', 'banking', 'financial_stability']
  },
  {
    id: 'bank_capital_ratio',
    code: 'MB010',
    name: { en: 'Bank Capital Adequacy Ratio', ar: 'نسبة كفاية رأس المال المصرفي' },
    description: {
      en: 'Regulatory capital to risk-weighted assets',
      ar: 'رأس المال التنظيمي إلى الأصول المرجحة بالمخاطر'
    },
    family: 'monetary_banking',
    unit: 'PERCENT',
    frequency: 'quarterly',
    methodology: 'Basel II/III framework',
    sources: ['CBY-Aden', 'IMF'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'C',
    tags: ['capital', 'banking', 'financial_stability']
  }
];

// ============================================================================
// 3. TRADE & BALANCE OF PAYMENTS INDICATORS
// ============================================================================
export const tradeIndicators: Indicator[] = [
  {
    id: 'exports_total',
    code: 'TR001',
    name: { en: 'Total Exports', ar: 'إجمالي الصادرات' },
    description: {
      en: 'Total value of goods and services exported',
      ar: 'القيمة الإجمالية للسلع والخدمات المصدرة'
    },
    family: 'trade_bop',
    unit: 'USD_MILLION',
    frequency: 'monthly',
    methodology: 'FOB valuation, customs data',
    sources: ['Customs Authority', 'IMF DOTS'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['exports', 'trade', 'external']
  },
  {
    id: 'imports_total',
    code: 'TR002',
    name: { en: 'Total Imports', ar: 'إجمالي الواردات' },
    description: {
      en: 'Total value of goods and services imported',
      ar: 'القيمة الإجمالية للسلع والخدمات المستوردة'
    },
    family: 'trade_bop',
    unit: 'USD_MILLION',
    frequency: 'monthly',
    methodology: 'CIF valuation, customs data',
    sources: ['Customs Authority', 'IMF DOTS'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['imports', 'trade', 'external']
  },
  {
    id: 'trade_balance',
    code: 'TR003',
    name: { en: 'Trade Balance', ar: 'الميزان التجاري' },
    description: {
      en: 'Exports minus imports of goods',
      ar: 'الصادرات ناقص الواردات من السلع'
    },
    family: 'trade_bop',
    unit: 'USD_MILLION',
    frequency: 'monthly',
    methodology: 'Exports FOB minus Imports CIF',
    sources: ['Customs Authority', 'IMF'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['trade_balance', 'trade', 'external']
  },
  {
    id: 'current_account',
    code: 'TR004',
    name: { en: 'Current Account Balance', ar: 'رصيد الحساب الجاري' },
    description: {
      en: 'Trade balance plus net income and transfers',
      ar: 'الميزان التجاري زائد صافي الدخل والتحويلات'
    },
    family: 'trade_bop',
    unit: 'USD_MILLION',
    frequency: 'quarterly',
    methodology: 'IMF BPM6 methodology',
    sources: ['CBY-Aden', 'IMF'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['current_account', 'bop', 'external']
  },
  {
    id: 'remittances',
    code: 'TR005',
    name: { en: 'Worker Remittances', ar: 'تحويلات العمال' },
    description: {
      en: 'Personal transfers from Yemeni workers abroad',
      ar: 'التحويلات الشخصية من العمال اليمنيين في الخارج'
    },
    family: 'trade_bop',
    unit: 'USD_MILLION',
    frequency: 'quarterly',
    methodology: 'IMF BPM6 definition',
    sources: ['CBY-Aden', 'World Bank'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['remittances', 'transfers', 'external']
  },
  {
    id: 'fdi_inflows',
    code: 'TR006',
    name: { en: 'Foreign Direct Investment Inflows', ar: 'تدفقات الاستثمار الأجنبي المباشر' },
    description: {
      en: 'Net inflows of foreign direct investment',
      ar: 'صافي تدفقات الاستثمار الأجنبي المباشر'
    },
    family: 'trade_bop',
    unit: 'USD_MILLION',
    frequency: 'annual',
    methodology: 'IMF BPM6 definition',
    sources: ['UNCTAD', 'World Bank'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['fdi', 'investment', 'external']
  },
  {
    id: 'oil_exports',
    code: 'TR007',
    name: { en: 'Oil Exports', ar: 'صادرات النفط' },
    description: {
      en: 'Value of crude oil and petroleum exports',
      ar: 'قيمة صادرات النفط الخام والمنتجات البترولية'
    },
    family: 'trade_bop',
    unit: 'USD_MILLION',
    frequency: 'monthly',
    methodology: 'Customs and production data',
    sources: ['Ministry of Oil', 'Customs Authority'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['oil', 'exports', 'energy']
  },
  {
    id: 'food_imports',
    code: 'TR008',
    name: { en: 'Food Imports', ar: 'واردات الغذاء' },
    description: {
      en: 'Value of food and agricultural imports',
      ar: 'قيمة واردات الغذاء والمنتجات الزراعية'
    },
    family: 'trade_bop',
    unit: 'USD_MILLION',
    frequency: 'monthly',
    methodology: 'HS chapters 01-24',
    sources: ['Customs Authority', 'FAO'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['food', 'imports', 'food_security']
  },
  {
    id: 'fuel_imports',
    code: 'TR009',
    name: { en: 'Fuel Imports', ar: 'واردات الوقود' },
    description: {
      en: 'Value of petroleum and fuel imports',
      ar: 'قيمة واردات البترول والوقود'
    },
    family: 'trade_bop',
    unit: 'USD_MILLION',
    frequency: 'monthly',
    methodology: 'HS chapter 27',
    sources: ['Customs Authority', 'IEA'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['fuel', 'imports', 'energy']
  },
  {
    id: 'port_throughput',
    code: 'TR010',
    name: { en: 'Port Throughput', ar: 'حركة الموانئ' },
    description: {
      en: 'Total cargo handled at major ports',
      ar: 'إجمالي البضائع المناولة في الموانئ الرئيسية'
    },
    family: 'trade_bop',
    unit: 'METRIC_TONS',
    frequency: 'monthly',
    methodology: 'Port authority statistics',
    sources: ['Port authorities', 'UNCTAD'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['ports', 'logistics', 'trade']
  }
];

// ============================================================================
// 4. ENERGY & FUEL INDICATORS
// ============================================================================
export const energyIndicators: Indicator[] = [
  {
    id: 'oil_production',
    code: 'EN001',
    name: { en: 'Crude Oil Production', ar: 'إنتاج النفط الخام' },
    description: {
      en: 'Daily crude oil production volume',
      ar: 'حجم إنتاج النفط الخام اليومي'
    },
    family: 'energy_fuel',
    unit: 'BARRELS_PER_DAY',
    frequency: 'monthly',
    methodology: 'Ministry of Oil production reports',
    sources: ['Ministry of Oil', 'OPEC', 'IEA'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['oil', 'production', 'energy']
  },
  {
    id: 'lng_production',
    code: 'EN002',
    name: { en: 'LNG Production', ar: 'إنتاج الغاز الطبيعي المسال' },
    description: {
      en: 'Liquefied natural gas production volume',
      ar: 'حجم إنتاج الغاز الطبيعي المسال'
    },
    family: 'energy_fuel',
    unit: 'MILLION_TONS',
    frequency: 'monthly',
    methodology: 'Yemen LNG facility reports',
    sources: ['Yemen LNG', 'IEA'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['lng', 'gas', 'energy']
  },
  {
    id: 'electricity_generation',
    code: 'EN003',
    name: { en: 'Electricity Generation', ar: 'توليد الكهرباء' },
    description: {
      en: 'Total electricity generated from all sources',
      ar: 'إجمالي الكهرباء المولدة من جميع المصادر'
    },
    family: 'energy_fuel',
    unit: 'GWH',
    frequency: 'monthly',
    methodology: 'Public utility and private generation data',
    sources: ['PEC', 'Ministry of Electricity'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'C',
    tags: ['electricity', 'power', 'energy']
  },
  {
    id: 'fuel_price_diesel',
    code: 'EN004',
    name: { en: 'Diesel Price', ar: 'سعر الديزل' },
    description: {
      en: 'Retail price of diesel fuel',
      ar: 'سعر التجزئة لوقود الديزل'
    },
    family: 'energy_fuel',
    unit: 'YER_PER_LITER',
    frequency: 'weekly',
    methodology: 'Market survey of fuel stations',
    sources: ['Market surveys', 'YPC'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'A',
    tags: ['fuel', 'prices', 'diesel']
  },
  {
    id: 'fuel_price_petrol',
    code: 'EN005',
    name: { en: 'Petrol Price', ar: 'سعر البنزين' },
    description: {
      en: 'Retail price of petrol/gasoline',
      ar: 'سعر التجزئة للبنزين'
    },
    family: 'energy_fuel',
    unit: 'YER_PER_LITER',
    frequency: 'weekly',
    methodology: 'Market survey of fuel stations',
    sources: ['Market surveys', 'YPC'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'A',
    tags: ['fuel', 'prices', 'petrol']
  },
  {
    id: 'fuel_price_lpg',
    code: 'EN006',
    name: { en: 'LPG Price', ar: 'سعر الغاز المنزلي' },
    description: {
      en: 'Retail price of cooking gas cylinder',
      ar: 'سعر التجزئة لأسطوانة غاز الطهي'
    },
    family: 'energy_fuel',
    unit: 'YER_PER_CYLINDER',
    frequency: 'weekly',
    methodology: 'Market survey',
    sources: ['Market surveys', 'YGC'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'A',
    tags: ['fuel', 'prices', 'lpg', 'cooking_gas']
  },
  {
    id: 'electricity_access',
    code: 'EN007',
    name: { en: 'Electricity Access Rate', ar: 'معدل الوصول للكهرباء' },
    description: {
      en: 'Percentage of population with electricity access',
      ar: 'نسبة السكان الذين لديهم إمكانية الوصول للكهرباء'
    },
    family: 'energy_fuel',
    unit: 'PERCENT',
    frequency: 'annual',
    methodology: 'Household survey estimates',
    sources: ['World Bank', 'IEA'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['electricity', 'access', 'infrastructure']
  },
  {
    id: 'solar_capacity',
    code: 'EN008',
    name: { en: 'Solar Power Capacity', ar: 'قدرة الطاقة الشمسية' },
    description: {
      en: 'Installed solar photovoltaic capacity',
      ar: 'القدرة المركبة للطاقة الشمسية الكهروضوئية'
    },
    family: 'energy_fuel',
    unit: 'MW',
    frequency: 'annual',
    methodology: 'IRENA methodology',
    sources: ['IRENA', 'Industry estimates'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['solar', 'renewable', 'energy']
  }
];

// ============================================================================
// 5. FOOD SECURITY & AGRICULTURE INDICATORS
// ============================================================================
export const foodSecurityIndicators: Indicator[] = [
  {
    id: 'food_insecurity_ipc',
    code: 'FS001',
    name: { en: 'Food Insecurity (IPC 3+)', ar: 'انعدام الأمن الغذائي (IPC 3+)' },
    description: {
      en: 'Population in IPC Phase 3 (Crisis) or above',
      ar: 'السكان في المرحلة 3 (أزمة) أو أعلى من تصنيف IPC'
    },
    family: 'food_agriculture',
    unit: 'MILLIONS',
    frequency: 'biannual',
    methodology: 'IPC Acute Food Insecurity Analysis',
    sources: ['IPC', 'WFP', 'FAO'],
    startYear: 2014,
    regimeSplit: false,
    confidenceDefault: 'A',
    tags: ['food_security', 'ipc', 'humanitarian']
  },
  {
    id: 'food_prices_meb',
    code: 'FS002',
    name: { en: 'Minimum Expenditure Basket Cost', ar: 'تكلفة سلة الحد الأدنى للإنفاق' },
    description: {
      en: 'Cost of minimum food and non-food basket',
      ar: 'تكلفة سلة الحد الأدنى من الغذاء وغير الغذاء'
    },
    family: 'food_agriculture',
    unit: 'YER',
    frequency: 'monthly',
    methodology: 'WFP market monitoring',
    sources: ['WFP'],
    startYear: 2015,
    regimeSplit: true,
    confidenceDefault: 'A',
    tags: ['food_prices', 'meb', 'cost_of_living']
  },
  {
    id: 'wheat_price',
    code: 'FS003',
    name: { en: 'Wheat Flour Price', ar: 'سعر دقيق القمح' },
    description: {
      en: 'Retail price of wheat flour per kg',
      ar: 'سعر التجزئة لدقيق القمح للكيلوغرام'
    },
    family: 'food_agriculture',
    unit: 'YER_PER_KG',
    frequency: 'weekly',
    methodology: 'WFP market monitoring',
    sources: ['WFP', 'FAO GIEWS'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'A',
    tags: ['wheat', 'food_prices', 'staples']
  },
  {
    id: 'rice_price',
    code: 'FS004',
    name: { en: 'Rice Price', ar: 'سعر الأرز' },
    description: {
      en: 'Retail price of rice per kg',
      ar: 'سعر التجزئة للأرز للكيلوغرام'
    },
    family: 'food_agriculture',
    unit: 'YER_PER_KG',
    frequency: 'weekly',
    methodology: 'WFP market monitoring',
    sources: ['WFP', 'FAO GIEWS'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'A',
    tags: ['rice', 'food_prices', 'staples']
  },
  {
    id: 'cooking_oil_price',
    code: 'FS005',
    name: { en: 'Cooking Oil Price', ar: 'سعر زيت الطهي' },
    description: {
      en: 'Retail price of vegetable oil per liter',
      ar: 'سعر التجزئة للزيت النباتي للتر'
    },
    family: 'food_agriculture',
    unit: 'YER_PER_LITER',
    frequency: 'weekly',
    methodology: 'WFP market monitoring',
    sources: ['WFP', 'FAO GIEWS'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'A',
    tags: ['oil', 'food_prices', 'staples']
  },
  {
    id: 'cereal_production',
    code: 'FS006',
    name: { en: 'Cereal Production', ar: 'إنتاج الحبوب' },
    description: {
      en: 'Total domestic cereal production',
      ar: 'إجمالي إنتاج الحبوب المحلي'
    },
    family: 'food_agriculture',
    unit: 'METRIC_TONS',
    frequency: 'annual',
    methodology: 'FAO crop assessment',
    sources: ['FAO', 'Ministry of Agriculture'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['cereals', 'production', 'agriculture']
  },
  {
    id: 'agricultural_land',
    code: 'FS007',
    name: { en: 'Agricultural Land Area', ar: 'مساحة الأراضي الزراعية' },
    description: {
      en: 'Total area of arable and permanent crop land',
      ar: 'إجمالي مساحة الأراضي الصالحة للزراعة والمحاصيل الدائمة'
    },
    family: 'food_agriculture',
    unit: 'HECTARES',
    frequency: 'annual',
    methodology: 'FAO land use statistics',
    sources: ['FAO', 'Ministry of Agriculture'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['land', 'agriculture', 'resources']
  },
  {
    id: 'livestock_population',
    code: 'FS008',
    name: { en: 'Livestock Population', ar: 'تعداد الثروة الحيوانية' },
    description: {
      en: 'Total number of cattle, sheep, goats, and camels',
      ar: 'إجمالي عدد الأبقار والأغنام والماعز والإبل'
    },
    family: 'food_agriculture',
    unit: 'THOUSANDS',
    frequency: 'annual',
    methodology: 'FAO livestock census',
    sources: ['FAO', 'Ministry of Agriculture'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['livestock', 'agriculture', 'food_security']
  }
];

// ============================================================================
// 6. HUMANITARIAN INDICATORS
// ============================================================================
export const humanitarianIndicators: Indicator[] = [
  {
    id: 'people_in_need',
    code: 'HU001',
    name: { en: 'People in Need', ar: 'الأشخاص المحتاجون' },
    description: {
      en: 'Total population requiring humanitarian assistance',
      ar: 'إجمالي السكان الذين يحتاجون إلى مساعدة إنسانية'
    },
    family: 'humanitarian',
    unit: 'MILLIONS',
    frequency: 'annual',
    methodology: 'OCHA HNO methodology',
    sources: ['OCHA', 'HNO'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'A',
    tags: ['pin', 'humanitarian', 'needs']
  },
  {
    id: 'idps',
    code: 'HU002',
    name: { en: 'Internally Displaced Persons', ar: 'النازحون داخلياً' },
    description: {
      en: 'Number of internally displaced persons',
      ar: 'عدد النازحين داخلياً'
    },
    family: 'humanitarian',
    unit: 'MILLIONS',
    frequency: 'monthly',
    methodology: 'IOM DTM tracking',
    sources: ['IOM', 'UNHCR'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'A',
    tags: ['idp', 'displacement', 'humanitarian']
  },
  {
    id: 'humanitarian_funding',
    code: 'HU003',
    name: { en: 'Humanitarian Funding Received', ar: 'التمويل الإنساني المستلم' },
    description: {
      en: 'Total humanitarian funding received',
      ar: 'إجمالي التمويل الإنساني المستلم'
    },
    family: 'humanitarian',
    unit: 'USD_MILLION',
    frequency: 'monthly',
    methodology: 'OCHA FTS tracking',
    sources: ['OCHA FTS'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'A',
    tags: ['funding', 'humanitarian', 'aid']
  },
  {
    id: 'humanitarian_requirements',
    code: 'HU004',
    name: { en: 'Humanitarian Requirements', ar: 'الاحتياجات الإنسانية' },
    description: {
      en: 'Total humanitarian funding requirements',
      ar: 'إجمالي متطلبات التمويل الإنساني'
    },
    family: 'humanitarian',
    unit: 'USD_MILLION',
    frequency: 'annual',
    methodology: 'OCHA HRP methodology',
    sources: ['OCHA', 'HRP'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'A',
    tags: ['requirements', 'humanitarian', 'planning']
  },
  {
    id: 'funding_gap',
    code: 'HU005',
    name: { en: 'Humanitarian Funding Gap', ar: 'فجوة التمويل الإنساني' },
    description: {
      en: 'Difference between requirements and funding received',
      ar: 'الفرق بين الاحتياجات والتمويل المستلم'
    },
    family: 'humanitarian',
    unit: 'PERCENT',
    frequency: 'monthly',
    methodology: 'Requirements minus funding received',
    sources: ['OCHA FTS'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'A',
    tags: ['funding_gap', 'humanitarian', 'aid']
  },
  {
    id: 'acute_malnutrition',
    code: 'HU006',
    name: { en: 'Acute Malnutrition (GAM)', ar: 'سوء التغذية الحاد' },
    description: {
      en: 'Global acute malnutrition rate in children under 5',
      ar: 'معدل سوء التغذية الحاد العالمي لدى الأطفال دون الخامسة'
    },
    family: 'humanitarian',
    unit: 'PERCENT',
    frequency: 'annual',
    methodology: 'SMART survey methodology',
    sources: ['UNICEF', 'WFP', 'Nutrition Cluster'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['malnutrition', 'nutrition', 'health']
  },
  {
    id: 'cholera_cases',
    code: 'HU007',
    name: { en: 'Cholera/AWD Cases', ar: 'حالات الكوليرا/الإسهال المائي الحاد' },
    description: {
      en: 'Cumulative suspected cholera/AWD cases',
      ar: 'الحالات التراكمية المشتبه بها للكوليرا/الإسهال المائي الحاد'
    },
    family: 'humanitarian',
    unit: 'CASES',
    frequency: 'weekly',
    methodology: 'WHO/MoPHP surveillance',
    sources: ['WHO', 'MoPHP'],
    startYear: 2016,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['cholera', 'disease', 'health']
  },
  {
    id: 'health_facilities_functional',
    code: 'HU008',
    name: { en: 'Functional Health Facilities', ar: 'المرافق الصحية العاملة' },
    description: {
      en: 'Percentage of health facilities fully functional',
      ar: 'نسبة المرافق الصحية العاملة بالكامل'
    },
    family: 'humanitarian',
    unit: 'PERCENT',
    frequency: 'annual',
    methodology: 'HeRAMS assessment',
    sources: ['WHO', 'Health Cluster'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['health', 'facilities', 'infrastructure']
  }
];

// ============================================================================
// 7. CONFLICT & SECURITY INDICATORS
// ============================================================================
export const conflictIndicators: Indicator[] = [
  {
    id: 'conflict_events',
    code: 'CF001',
    name: { en: 'Conflict Events', ar: 'أحداث النزاع' },
    description: {
      en: 'Number of recorded conflict events',
      ar: 'عدد أحداث النزاع المسجلة'
    },
    family: 'conflict_security',
    unit: 'EVENTS',
    frequency: 'daily',
    methodology: 'ACLED event coding',
    sources: ['ACLED', 'UCDP'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['conflict', 'events', 'security']
  },
  {
    id: 'conflict_fatalities',
    code: 'CF002',
    name: { en: 'Conflict Fatalities', ar: 'ضحايا النزاع' },
    description: {
      en: 'Number of conflict-related fatalities',
      ar: 'عدد الوفيات المرتبطة بالنزاع'
    },
    family: 'conflict_security',
    unit: 'PERSONS',
    frequency: 'monthly',
    methodology: 'ACLED fatality estimates',
    sources: ['ACLED', 'UCDP'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['fatalities', 'conflict', 'security']
  },
  {
    id: 'airstrikes',
    code: 'CF003',
    name: { en: 'Airstrikes', ar: 'الغارات الجوية' },
    description: {
      en: 'Number of recorded airstrikes',
      ar: 'عدد الغارات الجوية المسجلة'
    },
    family: 'conflict_security',
    unit: 'EVENTS',
    frequency: 'daily',
    methodology: 'Yemen Data Project methodology',
    sources: ['Yemen Data Project', 'ACLED'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['airstrikes', 'conflict', 'security']
  },
  {
    id: 'civilian_casualties',
    code: 'CF004',
    name: { en: 'Civilian Casualties', ar: 'الضحايا المدنيون' },
    description: {
      en: 'Documented civilian deaths and injuries',
      ar: 'الوفيات والإصابات المدنية الموثقة'
    },
    family: 'conflict_security',
    unit: 'PERSONS',
    frequency: 'monthly',
    methodology: 'CIMP verification',
    sources: ['CIMP', 'OHCHR'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['civilians', 'casualties', 'protection']
  },
  {
    id: 'landmines_casualties',
    code: 'CF005',
    name: { en: 'Landmine/UXO Casualties', ar: 'ضحايا الألغام/الذخائر غير المنفجرة' },
    description: {
      en: 'Deaths and injuries from landmines and UXO',
      ar: 'الوفيات والإصابات من الألغام والذخائر غير المنفجرة'
    },
    family: 'conflict_security',
    unit: 'PERSONS',
    frequency: 'monthly',
    methodology: 'YEMAC and partner reporting',
    sources: ['YEMAC', 'UNMAS'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['landmines', 'uxo', 'protection']
  },
  {
    id: 'infrastructure_damage',
    code: 'CF006',
    name: { en: 'Infrastructure Damage Index', ar: 'مؤشر أضرار البنية التحتية' },
    description: {
      en: 'Cumulative infrastructure damage assessment',
      ar: 'تقييم الأضرار التراكمية للبنية التحتية'
    },
    family: 'conflict_security',
    unit: 'INDEX',
    frequency: 'quarterly',
    methodology: 'UNOSAT satellite analysis',
    sources: ['UNOSAT', 'World Bank'],
    startYear: 2015,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['infrastructure', 'damage', 'reconstruction']
  }
];

// ============================================================================
// 8. SOCIAL & LABOR INDICATORS
// ============================================================================
export const socialLaborIndicators: Indicator[] = [
  {
    id: 'population_total',
    code: 'SL001',
    name: { en: 'Total Population', ar: 'إجمالي السكان' },
    description: {
      en: 'Total population estimate',
      ar: 'تقدير إجمالي السكان'
    },
    family: 'social_labor',
    unit: 'MILLIONS',
    frequency: 'annual',
    methodology: 'UN DESA estimates',
    sources: ['UN DESA', 'World Bank'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['population', 'demographics']
  },
  {
    id: 'unemployment_rate',
    code: 'SL002',
    name: { en: 'Unemployment Rate', ar: 'معدل البطالة' },
    description: {
      en: 'Percentage of labor force unemployed',
      ar: 'نسبة القوى العاملة العاطلة عن العمل'
    },
    family: 'social_labor',
    unit: 'PERCENT',
    frequency: 'annual',
    methodology: 'ILO modeled estimates',
    sources: ['ILO', 'World Bank'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['unemployment', 'labor', 'employment']
  },
  {
    id: 'youth_unemployment',
    code: 'SL003',
    name: { en: 'Youth Unemployment Rate', ar: 'معدل بطالة الشباب' },
    description: {
      en: 'Unemployment rate for ages 15-24',
      ar: 'معدل البطالة للفئة العمرية 15-24'
    },
    family: 'social_labor',
    unit: 'PERCENT',
    frequency: 'annual',
    methodology: 'ILO modeled estimates',
    sources: ['ILO', 'World Bank'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['youth', 'unemployment', 'labor']
  },
  {
    id: 'poverty_rate',
    code: 'SL004',
    name: { en: 'Poverty Rate', ar: 'معدل الفقر' },
    description: {
      en: 'Population below national poverty line',
      ar: 'السكان تحت خط الفقر الوطني'
    },
    family: 'social_labor',
    unit: 'PERCENT',
    frequency: 'annual',
    methodology: 'World Bank poverty estimates',
    sources: ['World Bank', 'UNDP'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['poverty', 'welfare', 'living_standards']
  },
  {
    id: 'school_enrollment',
    code: 'SL005',
    name: { en: 'School Enrollment Rate', ar: 'معدل الالتحاق بالمدارس' },
    description: {
      en: 'Net enrollment rate in primary education',
      ar: 'معدل الالتحاق الصافي بالتعليم الابتدائي'
    },
    family: 'social_labor',
    unit: 'PERCENT',
    frequency: 'annual',
    methodology: 'UNESCO UIS methodology',
    sources: ['UNESCO', 'Ministry of Education'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['education', 'enrollment', 'children']
  },
  {
    id: 'literacy_rate',
    code: 'SL006',
    name: { en: 'Adult Literacy Rate', ar: 'معدل محو الأمية للبالغين' },
    description: {
      en: 'Percentage of adults who can read and write',
      ar: 'نسبة البالغين الذين يستطيعون القراءة والكتابة'
    },
    family: 'social_labor',
    unit: 'PERCENT',
    frequency: 'annual',
    methodology: 'UNESCO UIS methodology',
    sources: ['UNESCO', 'World Bank'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['literacy', 'education', 'human_development']
  },
  {
    id: 'life_expectancy',
    code: 'SL007',
    name: { en: 'Life Expectancy at Birth', ar: 'متوسط العمر المتوقع عند الولادة' },
    description: {
      en: 'Average expected lifespan at birth',
      ar: 'متوسط العمر المتوقع عند الولادة'
    },
    family: 'social_labor',
    unit: 'YEARS',
    frequency: 'annual',
    methodology: 'UN life table methodology',
    sources: ['UN DESA', 'World Bank'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['health', 'mortality', 'human_development']
  },
  {
    id: 'infant_mortality',
    code: 'SL008',
    name: { en: 'Infant Mortality Rate', ar: 'معدل وفيات الرضع' },
    description: {
      en: 'Deaths per 1,000 live births under age 1',
      ar: 'الوفيات لكل 1,000 ولادة حية تحت سن 1'
    },
    family: 'social_labor',
    unit: 'PER_1000',
    frequency: 'annual',
    methodology: 'UN IGME estimates',
    sources: ['UN IGME', 'UNICEF'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['mortality', 'children', 'health']
  }
];

// ============================================================================
// 9. GOVERNANCE & INSTITUTIONS INDICATORS
// ============================================================================
export const governanceIndicators: Indicator[] = [
  {
    id: 'wgi_government_effectiveness',
    code: 'GV001',
    name: { en: 'Government Effectiveness', ar: 'فعالية الحكومة' },
    description: {
      en: 'World Bank governance indicator for government effectiveness',
      ar: 'مؤشر البنك الدولي للحوكمة لفعالية الحكومة'
    },
    family: 'governance',
    unit: 'INDEX',
    frequency: 'annual',
    methodology: 'World Bank WGI methodology',
    sources: ['World Bank WGI'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['governance', 'institutions', 'effectiveness']
  },
  {
    id: 'wgi_rule_of_law',
    code: 'GV002',
    name: { en: 'Rule of Law', ar: 'سيادة القانون' },
    description: {
      en: 'World Bank governance indicator for rule of law',
      ar: 'مؤشر البنك الدولي للحوكمة لسيادة القانون'
    },
    family: 'governance',
    unit: 'INDEX',
    frequency: 'annual',
    methodology: 'World Bank WGI methodology',
    sources: ['World Bank WGI'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['governance', 'rule_of_law', 'institutions']
  },
  {
    id: 'wgi_corruption',
    code: 'GV003',
    name: { en: 'Control of Corruption', ar: 'مكافحة الفساد' },
    description: {
      en: 'World Bank governance indicator for corruption control',
      ar: 'مؤشر البنك الدولي للحوكمة لمكافحة الفساد'
    },
    family: 'governance',
    unit: 'INDEX',
    frequency: 'annual',
    methodology: 'World Bank WGI methodology',
    sources: ['World Bank WGI'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['governance', 'corruption', 'transparency']
  },
  {
    id: 'fragile_states_index',
    code: 'GV004',
    name: { en: 'Fragile States Index', ar: 'مؤشر الدول الهشة' },
    description: {
      en: 'Fund for Peace fragility assessment',
      ar: 'تقييم الهشاشة من صندوق السلام'
    },
    family: 'governance',
    unit: 'INDEX',
    frequency: 'annual',
    methodology: 'Fund for Peace methodology',
    sources: ['Fund for Peace'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['fragility', 'stability', 'governance']
  },
  {
    id: 'cpi_corruption',
    code: 'GV005',
    name: { en: 'Corruption Perceptions Index', ar: 'مؤشر مدركات الفساد' },
    description: {
      en: 'Transparency International corruption index',
      ar: 'مؤشر الفساد من منظمة الشفافية الدولية'
    },
    family: 'governance',
    unit: 'INDEX',
    frequency: 'annual',
    methodology: 'Transparency International methodology',
    sources: ['Transparency International'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['corruption', 'transparency', 'governance']
  },
  {
    id: 'public_sector_wages',
    code: 'GV006',
    name: { en: 'Public Sector Wage Payments', ar: 'مدفوعات رواتب القطاع العام' },
    description: {
      en: 'Status of public sector salary payments',
      ar: 'حالة صرف رواتب القطاع العام'
    },
    family: 'governance',
    unit: 'PERCENT',
    frequency: 'monthly',
    methodology: 'Government and UN reporting',
    sources: ['UN', 'Government sources'],
    startYear: 2015,
    regimeSplit: true,
    confidenceDefault: 'C',
    tags: ['wages', 'public_sector', 'governance']
  }
];

// ============================================================================
// 10. PRIVATE SECTOR & BUSINESS INDICATORS
// ============================================================================
export const privateSectorIndicators: Indicator[] = [
  {
    id: 'ease_of_doing_business',
    code: 'PS001',
    name: { en: 'Ease of Doing Business Rank', ar: 'ترتيب سهولة ممارسة الأعمال' },
    description: {
      en: 'World Bank Doing Business ranking',
      ar: 'ترتيب البنك الدولي لسهولة ممارسة الأعمال'
    },
    family: 'private_sector',
    unit: 'RANK',
    frequency: 'annual',
    methodology: 'World Bank Doing Business methodology',
    sources: ['World Bank'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'A',
    tags: ['business', 'investment', 'private_sector']
  },
  {
    id: 'business_registrations',
    code: 'PS002',
    name: { en: 'New Business Registrations', ar: 'تسجيلات الأعمال الجديدة' },
    description: {
      en: 'Number of newly registered businesses',
      ar: 'عدد الأعمال المسجلة حديثاً'
    },
    family: 'private_sector',
    unit: 'COUNT',
    frequency: 'annual',
    methodology: 'Chamber of Commerce data',
    sources: ['Chamber of Commerce', 'World Bank'],
    startYear: 2010,
    regimeSplit: true,
    confidenceDefault: 'C',
    tags: ['business', 'entrepreneurship', 'private_sector']
  },
  {
    id: 'sme_access_finance',
    code: 'PS003',
    name: { en: 'SME Access to Finance', ar: 'وصول المشاريع الصغيرة للتمويل' },
    description: {
      en: 'Percentage of SMEs with access to formal credit',
      ar: 'نسبة المشاريع الصغيرة والمتوسطة التي لديها وصول للائتمان الرسمي'
    },
    family: 'private_sector',
    unit: 'PERCENT',
    frequency: 'annual',
    methodology: 'Enterprise survey estimates',
    sources: ['World Bank Enterprise Surveys'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['sme', 'finance', 'private_sector']
  },
  {
    id: 'mobile_subscriptions',
    code: 'PS004',
    name: { en: 'Mobile Phone Subscriptions', ar: 'اشتراكات الهاتف المحمول' },
    description: {
      en: 'Mobile cellular subscriptions per 100 people',
      ar: 'اشتراكات الهاتف المحمول لكل 100 شخص'
    },
    family: 'private_sector',
    unit: 'PER_100',
    frequency: 'annual',
    methodology: 'ITU methodology',
    sources: ['ITU', 'World Bank'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['telecom', 'mobile', 'connectivity']
  },
  {
    id: 'internet_users',
    code: 'PS005',
    name: { en: 'Internet Users', ar: 'مستخدمو الإنترنت' },
    description: {
      en: 'Percentage of population using internet',
      ar: 'نسبة السكان الذين يستخدمون الإنترنت'
    },
    family: 'private_sector',
    unit: 'PERCENT',
    frequency: 'annual',
    methodology: 'ITU methodology',
    sources: ['ITU', 'World Bank'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'B',
    tags: ['internet', 'connectivity', 'digital']
  },
  {
    id: 'qat_production',
    code: 'PS006',
    name: { en: 'Qat Production Area', ar: 'مساحة إنتاج القات' },
    description: {
      en: 'Land area dedicated to qat cultivation',
      ar: 'مساحة الأراضي المخصصة لزراعة القات'
    },
    family: 'private_sector',
    unit: 'HECTARES',
    frequency: 'annual',
    methodology: 'Agricultural survey estimates',
    sources: ['FAO', 'Ministry of Agriculture'],
    startYear: 2010,
    regimeSplit: false,
    confidenceDefault: 'C',
    tags: ['qat', 'agriculture', 'economy']
  }
];

// ============================================================================
// COMPLETE INDICATOR CATALOG
// ============================================================================
export const completeIndicatorCatalog: IndicatorCatalog = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  totalIndicators: 0, // Will be calculated
  families: [
    {
      id: 'macro_fiscal',
      name: { en: 'Macro-Fiscal', ar: 'الاقتصاد الكلي والمالية العامة' },
      description: { 
        en: 'GDP, inflation, fiscal balance, public debt',
        ar: 'الناتج المحلي الإجمالي، التضخم، الرصيد المالي، الدين العام'
      },
      icon: 'TrendingUp',
      color: '#103050',
      indicatorCount: macroFiscalIndicators.length
    },
    {
      id: 'monetary_banking',
      name: { en: 'Monetary & Banking', ar: 'النقد والمصارف' },
      description: {
        en: 'Exchange rates, money supply, banking sector health',
        ar: 'أسعار الصرف، عرض النقود، صحة القطاع المصرفي'
      },
      icon: 'Landmark',
      color: '#107040',
      indicatorCount: monetaryBankingIndicators.length
    },
    {
      id: 'trade_bop',
      name: { en: 'Trade & Balance of Payments', ar: 'التجارة وميزان المدفوعات' },
      description: {
        en: 'Exports, imports, current account, remittances',
        ar: 'الصادرات، الواردات، الحساب الجاري، التحويلات'
      },
      icon: 'Ship',
      color: '#C0A030',
      indicatorCount: tradeIndicators.length
    },
    {
      id: 'energy_fuel',
      name: { en: 'Energy & Fuel', ar: 'الطاقة والوقود' },
      description: {
        en: 'Oil production, fuel prices, electricity',
        ar: 'إنتاج النفط، أسعار الوقود، الكهرباء'
      },
      icon: 'Zap',
      color: '#E07020',
      indicatorCount: energyIndicators.length
    },
    {
      id: 'food_agriculture',
      name: { en: 'Food Security & Agriculture', ar: 'الأمن الغذائي والزراعة' },
      description: {
        en: 'Food prices, IPC classification, agricultural production',
        ar: 'أسعار الغذاء، تصنيف IPC، الإنتاج الزراعي'
      },
      icon: 'Wheat',
      color: '#60A040',
      indicatorCount: foodSecurityIndicators.length
    },
    {
      id: 'humanitarian',
      name: { en: 'Humanitarian', ar: 'الإنساني' },
      description: {
        en: 'People in need, IDPs, funding, health crises',
        ar: 'المحتاجون، النازحون، التمويل، الأزمات الصحية'
      },
      icon: 'Heart',
      color: '#D03030',
      indicatorCount: humanitarianIndicators.length
    },
    {
      id: 'conflict_security',
      name: { en: 'Conflict & Security', ar: 'النزاع والأمن' },
      description: {
        en: 'Conflict events, casualties, infrastructure damage',
        ar: 'أحداث النزاع، الضحايا، أضرار البنية التحتية'
      },
      icon: 'Shield',
      color: '#505050',
      indicatorCount: conflictIndicators.length
    },
    {
      id: 'social_labor',
      name: { en: 'Social & Labor', ar: 'الاجتماعي والعمل' },
      description: {
        en: 'Population, employment, poverty, education, health',
        ar: 'السكان، التوظيف، الفقر، التعليم، الصحة'
      },
      icon: 'Users',
      color: '#7050A0',
      indicatorCount: socialLaborIndicators.length
    },
    {
      id: 'governance',
      name: { en: 'Governance & Institutions', ar: 'الحوكمة والمؤسسات' },
      description: {
        en: 'Government effectiveness, rule of law, corruption',
        ar: 'فعالية الحكومة، سيادة القانون، الفساد'
      },
      icon: 'Building',
      color: '#304080',
      indicatorCount: governanceIndicators.length
    },
    {
      id: 'private_sector',
      name: { en: 'Private Sector & Business', ar: 'القطاع الخاص والأعمال' },
      description: {
        en: 'Business environment, SMEs, connectivity',
        ar: 'بيئة الأعمال، المشاريع الصغيرة والمتوسطة، الاتصال'
      },
      icon: 'Briefcase',
      color: '#208080',
      indicatorCount: privateSectorIndicators.length
    }
  ],
  indicators: [
    ...macroFiscalIndicators,
    ...monetaryBankingIndicators,
    ...tradeIndicators,
    ...energyIndicators,
    ...foodSecurityIndicators,
    ...humanitarianIndicators,
    ...conflictIndicators,
    ...socialLaborIndicators,
    ...governanceIndicators,
    ...privateSectorIndicators
  ]
};

// Calculate total
completeIndicatorCatalog.totalIndicators = completeIndicatorCatalog.indicators.length;

// Export helper functions
export function getIndicatorsByFamily(familyId: string): Indicator[] {
  return completeIndicatorCatalog.indicators.filter((i: Indicator) => i.family === familyId);
}

export function getIndicatorById(id: string): Indicator | undefined {
  return completeIndicatorCatalog.indicators.find((i: Indicator) => i.id === id);
}

export function getIndicatorByCode(code: string): Indicator | undefined {
  return completeIndicatorCatalog.indicators.find((i: Indicator) => i.code === code);
}

export function searchIndicators(query: string, language: 'en' | 'ar' = 'en'): Indicator[] {
  const lowerQuery = query.toLowerCase();
  return completeIndicatorCatalog.indicators.filter((i: Indicator) => 
    i.name[language].toLowerCase().includes(lowerQuery) ||
    i.description[language].toLowerCase().includes(lowerQuery) ||
    i.code.toLowerCase().includes(lowerQuery) ||
    i.tags.some((t: string) => t.toLowerCase().includes(lowerQuery))
  );
}

export function getRegimeSplitIndicators(): Indicator[] {
  return completeIndicatorCatalog.indicators.filter((i: Indicator) => i.regimeSplit);
}

export function getIndicatorsByFrequency(frequency: string): Indicator[] {
  return completeIndicatorCatalog.indicators.filter((i: Indicator) => i.frequency === frequency);
}
