/**
 * YETO Platform - Internationalization (i18n) System
 * 
 * Provides bilingual support (Arabic/English) for all UI text
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Types
// ============================================

export type Language = 'ar' | 'en';

export interface TranslationStrings {
  // Navigation
  nav: {
    home: string;
    dashboard: string;
    sectors: string;
    tools: string;
    resources: string;
    pricing: string;
    login: string;
    logout: string;
    profile: string;
  };
  
  // Sectors
  sectors: {
    banking: string;
    trade: string;
    poverty: string;
    macroeconomy: string;
    prices: string;
    currency: string;
    publicFinance: string;
    energy: string;
    foodSecurity: string;
    aidFlows: string;
    laborMarket: string;
    conflictEconomy: string;
    infrastructure: string;
    agriculture: string;
    investment: string;
  };
  
  // Tools
  tools: {
    aiAssistant: string;
    scenarioSimulator: string;
    reportBuilder: string;
    dataRepository: string;
    timeline: string;
    entities: string;
    compliance: string;
    coverage: string;
  };
  
  // Common UI
  common: {
    search: string;
    filter: string;
    export: string;
    download: string;
    share: string;
    save: string;
    cancel: string;
    submit: string;
    loading: string;
    error: string;
    success: string;
    noData: string;
    viewAll: string;
    learnMore: string;
    readMore: string;
    showMore: string;
    showLess: string;
  };
  
  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    regimeComparison: string;
    aden: string;
    sanaa: string;
    national: string;
    lastUpdated: string;
    dataQuality: string;
    confidence: string;
  };
  
  // Data
  data: {
    indicator: string;
    value: string;
    date: string;
    source: string;
    regime: string;
    trend: string;
    change: string;
    period: string;
    unit: string;
  };
  
  // Publications
  publications: {
    dailyDigest: string;
    weeklyMonitor: string;
    monthlyBrief: string;
    specialReport: string;
    subscribe: string;
    unsubscribe: string;
    downloadPdf: string;
  };
  
  // Evidence
  evidence: {
    showEvidence: string;
    sources: string;
    methodology: string;
    confidence: string;
    lastVerified: string;
    reportIssue: string;
  };
  
  // Footer
  footer: {
    about: string;
    methodology: string;
    privacy: string;
    terms: string;
    contact: string;
    poweredBy: string;
  };
  
  // Home
  home: {
    heroTitle: string;
    heroSubtitle: string;
    exploreDashboard: string;
    browseResearch: string;
    stats: {
      users: string;
      reports: string;
      sources: string;
      dataPoints: string;
    };
  };
  
  // Dev Mode
  dev: {
    banner: string;
    sampleData: string;
  };
}

// ============================================
// Translations
// ============================================

export const translations: Record<Language, TranslationStrings> = {
  ar: {
    nav: {
      home: 'الرئيسية',
      dashboard: 'لوحة البيانات',
      sectors: 'القطاعات',
      tools: 'الأدوات',
      resources: 'الموارد',
      pricing: 'الاشتراكات',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      profile: 'الملف الشخصي',
    },
    sectors: {
      banking: 'البنوك والتمويل',
      trade: 'التجارة والاستيراد',
      poverty: 'الفقر والتنمية',
      macroeconomy: 'الاقتصاد الكلي',
      prices: 'الأسعار وتكلفة المعيشة',
      currency: 'العملة وأسعار الصرف',
      publicFinance: 'المالية العامة',
      energy: 'الطاقة والوقود',
      foodSecurity: 'الأمن الغذائي',
      aidFlows: 'تدفقات المساعدات',
      laborMarket: 'سوق العمل',
      conflictEconomy: 'اقتصاد الصراع',
      infrastructure: 'البنية التحتية',
      agriculture: 'الزراعة',
      investment: 'الاستثمار',
    },
    tools: {
      aiAssistant: 'المساعد الذكي',
      scenarioSimulator: 'محاكي السيناريوهات',
      reportBuilder: 'منشئ التقارير',
      dataRepository: 'مستودع البيانات',
      timeline: 'الجدول الزمني',
      entities: 'الكيانات',
      compliance: 'الامتثال والعقوبات',
      coverage: 'بطاقة التغطية',
    },
    common: {
      search: 'بحث',
      filter: 'تصفية',
      export: 'تصدير',
      download: 'تحميل',
      share: 'مشاركة',
      save: 'حفظ',
      cancel: 'إلغاء',
      submit: 'إرسال',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      noData: 'لا توجد بيانات',
      viewAll: 'عرض الكل',
      learnMore: 'اعرف المزيد',
      readMore: 'اقرأ المزيد',
      showMore: 'عرض المزيد',
      showLess: 'عرض أقل',
    },
    dashboard: {
      title: 'لوحة البيانات الاقتصادية',
      subtitle: 'مراقبة المؤشرات الاقتصادية الرئيسية في اليمن',
      regimeComparison: 'مقارنة بين السلطتين',
      aden: 'عدن (الحكومة المعترف بها)',
      sanaa: 'صنعاء (سلطة الأمر الواقع)',
      national: 'وطني',
      lastUpdated: 'آخر تحديث',
      dataQuality: 'جودة البيانات',
      confidence: 'مستوى الثقة',
    },
    data: {
      indicator: 'المؤشر',
      value: 'القيمة',
      date: 'التاريخ',
      source: 'المصدر',
      regime: 'السلطة',
      trend: 'الاتجاه',
      change: 'التغيير',
      period: 'الفترة',
      unit: 'الوحدة',
    },
    publications: {
      dailyDigest: 'الملخص اليومي',
      weeklyMonitor: 'المراقب الأسبوعي',
      monthlyBrief: 'الموجز الشهري',
      specialReport: 'تقرير خاص',
      subscribe: 'اشترك',
      unsubscribe: 'إلغاء الاشتراك',
      downloadPdf: 'تحميل PDF',
    },
    evidence: {
      showEvidence: 'أظهر الدليل',
      sources: 'المصادر',
      methodology: 'المنهجية',
      confidence: 'مستوى الثقة',
      lastVerified: 'آخر تحقق',
      reportIssue: 'الإبلاغ عن مشكلة',
    },
    footer: {
      about: 'عن المنصة',
      methodology: 'المنهجية',
      privacy: 'الخصوصية',
      terms: 'الشروط',
      contact: 'اتصل بنا',
      poweredBy: 'مدعوم من',
    },
    home: {
      heroTitle: 'الشفافية الاقتصادية لليمن',
      heroSubtitle: 'منصة الذكاء الاقتصادي الرائدة للبيانات والتحليل والمساءلة',
      exploreDashboard: 'استكشف لوحة البيانات',
      browseResearch: 'تصفح الأبحاث',
      stats: {
        users: 'مستخدم',
        reports: 'تقرير بحثي',
        sources: 'مصدر بيانات',
        dataPoints: 'نقطة بيانات',
      },
    },
    dev: {
      banner: 'وضع التطوير - البيانات المعروضة للعرض التوضيحي فقط وليست حقيقية',
      sampleData: 'بيانات تجريبية',
    },
  },
  en: {
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      sectors: 'Sectors',
      tools: 'Tools',
      resources: 'Resources',
      pricing: 'Pricing',
      login: 'Login',
      logout: 'Logout',
      profile: 'Profile',
    },
    sectors: {
      banking: 'Banking & Finance',
      trade: 'Trade & Commerce',
      poverty: 'Poverty & Development',
      macroeconomy: 'Macroeconomy & Growth',
      prices: 'Prices & Cost of Living',
      currency: 'Currency & Exchange Rates',
      publicFinance: 'Public Finance',
      energy: 'Energy & Fuel',
      foodSecurity: 'Food Security',
      aidFlows: 'Aid Flows',
      laborMarket: 'Labor Market',
      conflictEconomy: 'Conflict Economy',
      infrastructure: 'Infrastructure',
      agriculture: 'Agriculture',
      investment: 'Investment',
    },
    tools: {
      aiAssistant: 'AI Assistant',
      scenarioSimulator: 'Scenario Simulator',
      reportBuilder: 'Report Builder',
      dataRepository: 'Data Repository',
      timeline: 'Timeline',
      entities: 'Entities',
      compliance: 'Compliance & Sanctions',
      coverage: 'Coverage Scorecard',
    },
    common: {
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      download: 'Download',
      share: 'Share',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      noData: 'No data available',
      viewAll: 'View All',
      learnMore: 'Learn More',
      readMore: 'Read More',
      showMore: 'Show More',
      showLess: 'Show Less',
    },
    dashboard: {
      title: 'Economic Dashboard',
      subtitle: 'Monitor key economic indicators in Yemen',
      regimeComparison: 'Regime Comparison',
      aden: 'Aden (IRG)',
      sanaa: 'Sana\'a (De Facto)',
      national: 'National',
      lastUpdated: 'Last Updated',
      dataQuality: 'Data Quality',
      confidence: 'Confidence Level',
    },
    data: {
      indicator: 'Indicator',
      value: 'Value',
      date: 'Date',
      source: 'Source',
      regime: 'Regime',
      trend: 'Trend',
      change: 'Change',
      period: 'Period',
      unit: 'Unit',
    },
    publications: {
      dailyDigest: 'Daily Digest',
      weeklyMonitor: 'Weekly Monitor',
      monthlyBrief: 'Monthly Brief',
      specialReport: 'Special Report',
      subscribe: 'Subscribe',
      unsubscribe: 'Unsubscribe',
      downloadPdf: 'Download PDF',
    },
    evidence: {
      showEvidence: 'Show Evidence',
      sources: 'Sources',
      methodology: 'Methodology',
      confidence: 'Confidence Level',
      lastVerified: 'Last Verified',
      reportIssue: 'Report Issue',
    },
    footer: {
      about: 'About',
      methodology: 'Methodology',
      privacy: 'Privacy',
      terms: 'Terms',
      contact: 'Contact',
      poweredBy: 'Powered by',
    },
    home: {
      heroTitle: 'Economic Transparency for Yemen',
      heroSubtitle: 'The leading economic intelligence platform for data, analysis, and accountability',
      exploreDashboard: 'Explore Dashboard',
      browseResearch: 'Browse Research',
      stats: {
        users: 'Users',
        reports: 'Research Reports',
        sources: 'Data Sources',
        dataPoints: 'Data Points',
      },
    },
    dev: {
      banner: 'Development Mode - Data shown is for demonstration only and not real',
      sampleData: 'Sample Data',
    },
  },
};

// ============================================
// Language Store
// ============================================

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationStrings;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ar' as Language,
      setLanguage: (lang: Language) => set({ 
        language: lang,
        t: translations[lang]
      }),
      t: translations['ar'],
    }),
    {
      name: 'yeto-language',
      onRehydrateStorage: () => (state: LanguageState | undefined) => {
        if (state) {
          state.t = translations[state.language];
        }
      },
    }
  )
);

// ============================================
// Helper Functions
// ============================================

export function getDirection(lang: Language): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function formatNumber(num: number, lang: Language): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-YE' : 'en-US').format(num);
}

export function formatDate(date: Date, lang: Language): string {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-YE' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatCurrency(amount: number, currency: string, lang: Language): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-YE' : 'en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export default useLanguage;
