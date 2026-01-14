import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Filter, 
  X, 
  Download, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Building2, 
  FileText, 
  Database, 
  TrendingUp, 
  Users, 
  BookOpen,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Star,
  BarChart3,
  PieChart,
  LineChart,
  Table2,
  Code,
  Eye,
  Share2,
  Bookmark,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Shield,
  FileJson,
  FileSpreadsheet,
  ArrowUpDown,
  Grid3X3,
  List,
  Layers
} from "lucide-react";
import { toast } from "sonner";

// Types
interface SearchResult {
  id: string;
  type: "indicator" | "document" | "entity" | "dataset" | "event" | "glossary" | "report";
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  url: string;
  relevance: number;
  quality: "verified" | "provisional" | "estimated";
  confidence: "A" | "B" | "C" | "D";
  source: string;
  sourceAr: string;
  date: string;
  sector?: string;
  sectorAr?: string;
  regime?: "aden" | "sanaa" | "both";
  geography?: string;
  geographyAr?: string;
  tags?: string[];
  tagsAr?: string[];
  downloads?: number;
  views?: number;
  hasApi?: boolean;
  formats?: string[];
  lastUpdated?: string;
  coverage?: string;
  frequency?: string;
}

interface FilterState {
  query: string;
  types: string[];
  sectors: string[];
  regimes: string[];
  qualities: string[];
  confidences: string[];
  dateFrom: string;
  dateTo: string;
  sources: string[];
  hasApi: boolean | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// Sample data - In production, this would come from tRPC
const sampleResults: SearchResult[] = [
  {
    id: "gdp-1",
    type: "indicator",
    title: "GDP Growth Rate",
    titleAr: "معدل نمو الناتج المحلي الإجمالي",
    description: "Annual GDP growth rate for Yemen. Estimates based on World Bank and IMF projections.",
    descriptionAr: "معدل نمو الناتج المحلي الإجمالي السنوي لليمن. تقديرات مبنية على توقعات البنك الدولي وصندوق النقد الدولي.",
    url: "/indicators/gdp-growth",
    relevance: 0.99,
    quality: "verified",
    confidence: "B",
    source: "World Bank / IMF",
    sourceAr: "البنك الدولي / صندوق النقد الدولي",
    date: "2025-01-01",
    sector: "Macroeconomy",
    sectorAr: "الاقتصاد الكلي",
    regime: "both",
    geography: "Nationwide",
    geographyAr: "على مستوى الجمهورية",
    tags: ["GDP", "growth", "macroeconomy", "economic growth"],
    tagsAr: ["الناتج المحلي", "النمو", "الاقتصاد الكلي"],
    downloads: 18500,
    views: 95200,
    hasApi: true,
    formats: ["JSON", "CSV", "Excel"],
    lastUpdated: "2025-01-01",
    coverage: "2010-present",
    frequency: "Annual"
  },
  {
    id: "gdp-nominal",
    type: "indicator",
    title: "Nominal GDP (USD)",
    titleAr: "الناتج المحلي الإجمالي الاسمي (دولار)",
    description: "Total nominal GDP in USD. Yemen's economy contracted significantly since 2015 conflict.",
    descriptionAr: "إجمالي الناتج المحلي الاسمي بالدولار. انكمش اقتصاد اليمن بشكل كبير منذ صراع 2015.",
    url: "/indicators/gdp-nominal",
    relevance: 0.97,
    quality: "provisional",
    confidence: "B",
    source: "World Bank",
    sourceAr: "البنك الدولي",
    date: "2024-12-01",
    sector: "Macroeconomy",
    sectorAr: "الاقتصاد الكلي",
    regime: "both",
    geography: "Nationwide",
    geographyAr: "على مستوى الجمهورية",
    tags: ["GDP", "nominal", "economy", "macroeconomy"],
    tagsAr: ["الناتج المحلي", "الاسمي", "الاقتصاد"],
    downloads: 12300,
    views: 67800,
    hasApi: true,
    formats: ["JSON", "CSV"],
    lastUpdated: "2024-12-01",
    coverage: "2000-present",
    frequency: "Annual"
  },
  {
    id: "gdp-per-capita",
    type: "indicator",
    title: "GDP Per Capita (USD)",
    titleAr: "نصيب الفرد من الناتج المحلي الإجمالي (دولار)",
    description: "GDP per capita in current USD. Dropped from $1,400 (2014) to approximately $700 (2024).",
    descriptionAr: "نصيب الفرد من الناتج المحلي الإجمالي بالدولار الحالي. انخفض من 1,400 دولار (2014) إلى حوالي 700 دولار (2024).",
    url: "/indicators/gdp-per-capita",
    relevance: 0.96,
    quality: "provisional",
    confidence: "B",
    source: "World Bank",
    sourceAr: "البنك الدولي",
    date: "2024-12-01",
    sector: "Macroeconomy",
    sectorAr: "الاقتصاد الكلي",
    regime: "both",
    tags: ["GDP", "per capita", "income", "macroeconomy"],
    tagsAr: ["الناتج المحلي", "نصيب الفرد", "الدخل"],
    downloads: 9800,
    views: 52100,
    hasApi: true,
    formats: ["JSON", "CSV"],
    lastUpdated: "2024-12-01",
    coverage: "2000-present",
    frequency: "Annual"
  },
  {
    id: "1",
    type: "indicator",
    title: "USD/YER Exchange Rate (Aden)",
    titleAr: "سعر صرف الدولار/الريال (عدن)",
    description: "Official exchange rate from Central Bank of Yemen - Aden. Updated daily with full historical data from 2015.",
    descriptionAr: "سعر الصرف الرسمي من البنك المركزي اليمني - عدن. يتم تحديثه يومياً مع بيانات تاريخية كاملة منذ 2015.",
    url: "/indicators/exchange-rate-aden",
    relevance: 0.98,
    quality: "verified",
    confidence: "A",
    source: "Central Bank of Yemen - Aden",
    sourceAr: "البنك المركزي اليمني - عدن",
    date: "2025-01-14",
    sector: "Currency & Exchange",
    sectorAr: "العملة والصرف",
    regime: "aden",
    geography: "Aden",
    geographyAr: "عدن",
    tags: ["exchange rate", "currency", "CBY"],
    tagsAr: ["سعر الصرف", "العملة", "البنك المركزي"],
    downloads: 15420,
    views: 89500,
    hasApi: true,
    formats: ["JSON", "CSV", "Excel"],
    lastUpdated: "2025-01-14",
    coverage: "2015-present",
    frequency: "Daily"
  },
  {
    id: "2",
    type: "indicator",
    title: "USD/YER Exchange Rate (Sana'a)",
    titleAr: "سعر صرف الدولار/الريال (صنعاء)",
    description: "Parallel market exchange rate in Sana'a-controlled areas. Collected from money exchange networks.",
    descriptionAr: "سعر الصرف في السوق الموازي في المناطق الخاضعة لسيطرة صنعاء. يتم جمعه من شبكات الصرافة.",
    url: "/indicators/exchange-rate-sanaa",
    relevance: 0.95,
    quality: "provisional",
    confidence: "B",
    source: "Market Survey Network",
    sourceAr: "شبكة مسح السوق",
    date: "2025-01-14",
    sector: "Currency & Exchange",
    sectorAr: "العملة والصرف",
    regime: "sanaa",
    geography: "Sana'a",
    geographyAr: "صنعاء",
    tags: ["exchange rate", "parallel market"],
    tagsAr: ["سعر الصرف", "السوق الموازي"],
    downloads: 12300,
    views: 67800,
    hasApi: true,
    formats: ["JSON", "CSV"],
    lastUpdated: "2025-01-14",
    coverage: "2016-present",
    frequency: "Daily"
  },
  {
    id: "3",
    type: "document",
    title: "Yemen Financial Sector Diagnostics 2024",
    titleAr: "تشخيص القطاع المالي اليمني 2024",
    description: "Comprehensive World Bank assessment of Yemen's banking sector, including analysis of the dual central bank system.",
    descriptionAr: "تقييم شامل من البنك الدولي للقطاع المصرفي اليمني، بما في ذلك تحليل نظام البنك المركزي المزدوج.",
    url: "/research/world-bank-financial-sector-2024",
    relevance: 0.92,
    quality: "verified",
    confidence: "A",
    source: "World Bank",
    sourceAr: "البنك الدولي",
    date: "2024-10-15",
    sector: "Banking & Finance",
    sectorAr: "المصارف والتمويل",
    regime: "both",
    tags: ["banking", "financial sector", "World Bank"],
    tagsAr: ["المصارف", "القطاع المالي", "البنك الدولي"],
    downloads: 8900,
    views: 45600,
    hasApi: false,
    formats: ["PDF"],
    lastUpdated: "2024-10-15"
  },
  {
    id: "4",
    type: "dataset",
    title: "Food Price Monitoring Dataset",
    titleAr: "مجموعة بيانات مراقبة أسعار الغذاء",
    description: "WFP market price data for essential commodities across 22 governorates. Monthly updates with 50+ commodities tracked.",
    descriptionAr: "بيانات أسعار السوق من برنامج الأغذية العالمي للسلع الأساسية في 22 محافظة. تحديثات شهرية مع تتبع أكثر من 50 سلعة.",
    url: "/data/wfp-food-prices",
    relevance: 0.89,
    quality: "verified",
    confidence: "A",
    source: "World Food Programme",
    sourceAr: "برنامج الأغذية العالمي",
    date: "2025-01-01",
    sector: "Food Security",
    sectorAr: "الأمن الغذائي",
    regime: "both",
    geography: "Nationwide",
    geographyAr: "على مستوى الجمهورية",
    tags: ["food prices", "WFP", "commodities"],
    tagsAr: ["أسعار الغذاء", "برنامج الأغذية", "السلع"],
    downloads: 22100,
    views: 98700,
    hasApi: true,
    formats: ["JSON", "CSV", "Excel", "API"],
    lastUpdated: "2025-01-01",
    coverage: "2015-present",
    frequency: "Monthly"
  },
  {
    id: "5",
    type: "entity",
    title: "Yemen Kuwait Bank for Trade and Investment",
    titleAr: "بنك اليمن والكويت للتجارة والاستثمار",
    description: "Commercial bank under OFAC sanctions since January 2025 for alleged financial support to Ansarallah.",
    descriptionAr: "بنك تجاري تحت عقوبات أوفاك منذ يناير 2025 بسبب دعم مالي مزعوم لأنصار الله.",
    url: "/entities/bank/ykb",
    relevance: 0.87,
    quality: "verified",
    confidence: "A",
    source: "OFAC / Treasury",
    sourceAr: "مكتب مراقبة الأصول الأجنبية / الخزانة",
    date: "2025-01-17",
    sector: "Banking & Finance",
    sectorAr: "المصارف والتمويل",
    regime: "both",
    tags: ["bank", "sanctions", "OFAC"],
    tagsAr: ["بنك", "عقوبات", "أوفاك"],
    downloads: 3400,
    views: 18900,
    hasApi: false,
    formats: ["Profile"],
    lastUpdated: "2025-01-17"
  },
  {
    id: "6",
    type: "report",
    title: "Revitalizing Yemen's Banking Sector",
    titleAr: "إعادة تنشيط القطاع المصرفي اليمني",
    description: "Sana'a Center analysis of necessary steps for restarting formal financial cycles and basic economic stabilization.",
    descriptionAr: "تحليل مركز صنعاء للخطوات اللازمة لإعادة تشغيل الدورات المالية الرسمية والاستقرار الاقتصادي الأساسي.",
    url: "/research/sanaa-center-banking-2024",
    relevance: 0.85,
    quality: "verified",
    confidence: "B",
    source: "Sana'a Center for Strategic Studies",
    sourceAr: "مركز صنعاء للدراسات الاستراتيجية",
    date: "2024-06-15",
    sector: "Banking & Finance",
    sectorAr: "المصارف والتمويل",
    regime: "both",
    tags: ["banking", "think tank", "policy"],
    tagsAr: ["المصارف", "مراكز الفكر", "السياسات"],
    downloads: 5600,
    views: 28400,
    hasApi: false,
    formats: ["PDF"],
    lastUpdated: "2024-06-15"
  },
  {
    id: "7",
    type: "indicator",
    title: "Consumer Price Index (CPI)",
    titleAr: "مؤشر أسعار المستهلك",
    description: "Monthly inflation tracking across Yemen with breakdown by governorate and commodity category.",
    descriptionAr: "تتبع التضخم الشهري في جميع أنحاء اليمن مع تفصيل حسب المحافظة وفئة السلعة.",
    url: "/indicators/cpi",
    relevance: 0.84,
    quality: "provisional",
    confidence: "B",
    source: "Central Statistical Organization",
    sourceAr: "الجهاز المركزي للإحصاء",
    date: "2024-12-01",
    sector: "Prices & Inflation",
    sectorAr: "الأسعار والتضخم",
    regime: "both",
    tags: ["inflation", "CPI", "prices"],
    tagsAr: ["التضخم", "مؤشر الأسعار", "الأسعار"],
    downloads: 9800,
    views: 52300,
    hasApi: true,
    formats: ["JSON", "CSV"],
    lastUpdated: "2024-12-01",
    coverage: "2010-present",
    frequency: "Monthly"
  },
  {
    id: "8",
    type: "event",
    title: "CBY Aden Issues New Banknote Directive",
    titleAr: "البنك المركزي عدن يصدر توجيهاً جديداً بشأن الأوراق النقدية",
    description: "Central Bank of Yemen - Aden announces new regulations regarding old vs new banknote circulation.",
    descriptionAr: "البنك المركزي اليمني - عدن يعلن لوائح جديدة بشأن تداول الأوراق النقدية القديمة والجديدة.",
    url: "/timeline?event=cby-banknote-2024",
    relevance: 0.82,
    quality: "verified",
    confidence: "A",
    source: "Central Bank of Yemen - Aden",
    sourceAr: "البنك المركزي اليمني - عدن",
    date: "2024-11-20",
    sector: "Currency & Exchange",
    sectorAr: "العملة والصرف",
    regime: "aden",
    tags: ["CBY", "banknotes", "monetary policy"],
    tagsAr: ["البنك المركزي", "الأوراق النقدية", "السياسة النقدية"],
    downloads: 2100,
    views: 15600,
    hasApi: false,
    formats: ["Event"],
    lastUpdated: "2024-11-20"
  }
];

// Filter options
const sectors = [
  { value: "banking", label: "Banking & Finance", labelAr: "المصارف والتمويل" },
  { value: "currency", label: "Currency & Exchange", labelAr: "العملة والصرف" },
  { value: "prices", label: "Prices & Inflation", labelAr: "الأسعار والتضخم" },
  { value: "food", label: "Food Security", labelAr: "الأمن الغذائي" },
  { value: "trade", label: "Trade & Commerce", labelAr: "التجارة" },
  { value: "energy", label: "Energy & Fuel", labelAr: "الطاقة والوقود" },
  { value: "labor", label: "Labor & Employment", labelAr: "العمل والتوظيف" },
  { value: "aid", label: "Aid & Humanitarian", labelAr: "المساعدات والإنسانية" },
  { value: "governance", label: "Public Finance", labelAr: "المالية العامة" },
  { value: "conflict", label: "Conflict Economy", labelAr: "اقتصاد الصراع" }
];

const sources = [
  { value: "worldbank", label: "World Bank", labelAr: "البنك الدولي" },
  { value: "imf", label: "IMF", labelAr: "صندوق النقد الدولي" },
  { value: "cby-aden", label: "CBY Aden", labelAr: "البنك المركزي عدن" },
  { value: "cby-sanaa", label: "CBY Sana'a", labelAr: "البنك المركزي صنعاء" },
  { value: "wfp", label: "WFP", labelAr: "برنامج الأغذية العالمي" },
  { value: "undp", label: "UNDP", labelAr: "برنامج الأمم المتحدة الإنمائي" },
  { value: "ocha", label: "OCHA", labelAr: "مكتب تنسيق الشؤون الإنسانية" },
  { value: "sanaa-center", label: "Sana'a Center", labelAr: "مركز صنعاء" },
  { value: "acaps", label: "ACAPS", labelAr: "أكابس" },
  { value: "ofac", label: "OFAC/Treasury", labelAr: "أوفاك/الخزانة" }
];

export default function AdvancedSearch() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [location, setLocation] = useLocation();
  
  // Parse URL params
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const initialQuery = urlParams.get("q") || "";
  const initialType = urlParams.get("type") || "";
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    query: initialQuery,
    types: initialType ? [initialType] : [],
    sectors: [],
    regimes: [],
    qualities: [],
    confidences: [],
    dateFrom: "",
    dateTo: "",
    sources: [],
    hasApi: null,
    sortBy: "relevance",
    sortOrder: "desc"
  });
  
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [results, setResults] = useState<SearchResult[]>(sampleResults);
  const [isLoading, setIsLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  
  // Content translations
  const content = {
    title: { en: "Advanced Search", ar: "البحث المتقدم" },
    subtitle: { en: "Find indicators, documents, entities, and datasets across Yemen's economic data", ar: "ابحث في المؤشرات والوثائق والكيانات ومجموعات البيانات عبر البيانات الاقتصادية اليمنية" },
    searchPlaceholder: { en: "Search indicators, documents, entities...", ar: "ابحث في المؤشرات والوثائق والكيانات..." },
    filters: { en: "Filters", ar: "الفلاتر" },
    clearAll: { en: "Clear All", ar: "مسح الكل" },
    type: { en: "Type", ar: "النوع" },
    sector: { en: "Sector", ar: "القطاع" },
    regime: { en: "Regime/Authority", ar: "السلطة" },
    quality: { en: "Data Quality", ar: "جودة البيانات" },
    confidence: { en: "Confidence Level", ar: "مستوى الثقة" },
    dateRange: { en: "Date Range", ar: "النطاق الزمني" },
    source: { en: "Source", ar: "المصدر" },
    apiAvailable: { en: "API Available", ar: "API متاح" },
    sortBy: { en: "Sort By", ar: "ترتيب حسب" },
    relevance: { en: "Relevance", ar: "الصلة" },
    date: { en: "Date", ar: "التاريخ" },
    downloads: { en: "Downloads", ar: "التحميلات" },
    views: { en: "Views", ar: "المشاهدات" },
    results: { en: "results", ar: "نتيجة" },
    noResults: { en: "No results found", ar: "لم يتم العثور على نتائج" },
    tryDifferent: { en: "Try adjusting your filters or search terms", ar: "جرب تعديل الفلاتر أو مصطلحات البحث" },
    verified: { en: "Verified", ar: "موثق" },
    provisional: { en: "Provisional", ar: "مؤقت" },
    estimated: { en: "Estimated", ar: "تقديري" },
    aden: { en: "Aden (IRG)", ar: "عدن (الشرعية)" },
    sanaa: { en: "Sana'a (DFA)", ar: "صنعاء (الأمر الواقع)" },
    both: { en: "Both Regimes", ar: "كلا النظامين" },
    indicator: { en: "Indicator", ar: "مؤشر" },
    document: { en: "Document", ar: "وثيقة" },
    entity: { en: "Entity", ar: "كيان" },
    dataset: { en: "Dataset", ar: "مجموعة بيانات" },
    event: { en: "Event", ar: "حدث" },
    report: { en: "Report", ar: "تقرير" },
    glossary: { en: "Glossary", ar: "مصطلحات" },
    viewDetails: { en: "View Details", ar: "عرض التفاصيل" },
    download: { en: "Download", ar: "تحميل" },
    apiEndpoint: { en: "API Endpoint", ar: "نقطة API" },
    lastUpdated: { en: "Last Updated", ar: "آخر تحديث" },
    coverage: { en: "Coverage", ar: "التغطية" },
    frequency: { en: "Frequency", ar: "التكرار" },
    saveSearch: { en: "Save Search", ar: "حفظ البحث" },
    exportResults: { en: "Export Results", ar: "تصدير النتائج" }
  };
  
  const t = (key: keyof typeof content) => isArabic ? content[key].ar : content[key].en;
  
  // Filter results based on current filters
  const filteredResults = useMemo(() => {
    let filtered = [...results];
    
    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.titleAr.includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.descriptionAr.includes(query) ||
        r.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        r.tagsAr?.some(tag => tag.includes(query))
      );
    }
    
    // Type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter(r => filters.types.includes(r.type));
    }
    
    // Quality filter
    if (filters.qualities.length > 0) {
      filtered = filtered.filter(r => filters.qualities.includes(r.quality));
    }
    
    // Confidence filter
    if (filters.confidences.length > 0) {
      filtered = filtered.filter(r => filters.confidences.includes(r.confidence));
    }
    
    // Regime filter
    if (filters.regimes.length > 0) {
      filtered = filtered.filter(r => r.regime && filters.regimes.includes(r.regime));
    }
    
    // API filter
    if (filters.hasApi !== null) {
      filtered = filtered.filter(r => r.hasApi === filters.hasApi);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "relevance":
          comparison = b.relevance - a.relevance;
          break;
        case "date":
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        case "downloads":
          comparison = (b.downloads || 0) - (a.downloads || 0);
          break;
        case "views":
          comparison = (b.views || 0) - (a.views || 0);
          break;
      }
      return filters.sortOrder === "desc" ? comparison : -comparison;
    });
    
    return filtered;
  }, [results, filters]);
  
  // Update filter
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Toggle array filter
  const toggleArrayFilter = (key: "types" | "sectors" | "regimes" | "qualities" | "confidences" | "sources", value: string) => {
    setFilters(prev => {
      const arr = prev[key];
      const newArr = arr.includes(value) 
        ? arr.filter(v => v !== value)
        : [...arr, value];
      return { ...prev, [key]: newArr };
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      query: "",
      types: [],
      sectors: [],
      regimes: [],
      qualities: [],
      confidences: [],
      dateFrom: "",
      dateTo: "",
      sources: [],
      hasApi: null,
      sortBy: "relevance",
      sortOrder: "desc"
    });
  };
  
  // Get quality badge
  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 gap-1">
            <CheckCircle className="h-3 w-3" />
            {t("verified")}
          </Badge>
        );
      case "provisional":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 gap-1">
            <AlertTriangle className="h-3 w-3" />
            {t("provisional")}
          </Badge>
        );
      case "estimated":
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 gap-1">
            <HelpCircle className="h-3 w-3" />
            {t("estimated")}
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Get confidence badge
  const getConfidenceBadge = (confidence: string) => {
    const colors: Record<string, string> = {
      A: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      C: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      D: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return (
      <Badge className={`${colors[confidence]} font-mono`}>
        {confidence}
      </Badge>
    );
  };
  
  // Get type icon
  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      indicator: <TrendingUp className="h-4 w-4" />,
      document: <FileText className="h-4 w-4" />,
      entity: <Building2 className="h-4 w-4" />,
      dataset: <Database className="h-4 w-4" />,
      event: <Calendar className="h-4 w-4" />,
      report: <BookOpen className="h-4 w-4" />,
      glossary: <BookOpen className="h-4 w-4" />
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };
  
  // Get regime badge
  const getRegimeBadge = (regime?: string) => {
    if (!regime) return null;
    const colors: Record<string, string> = {
      aden: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      sanaa: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      both: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    };
    const labels: Record<string, string> = {
      aden: isArabic ? "عدن" : "Aden",
      sanaa: isArabic ? "صنعاء" : "Sana'a",
      both: isArabic ? "كلاهما" : "Both"
    };
    return (
      <Badge variant="outline" className={colors[regime]}>
        {labels[regime]}
      </Badge>
    );
  };
  
  // Handle save search
  const handleSaveSearch = () => {
    if (filters.query) {
      setSavedSearches(prev => Array.from(new Set([...prev, filters.query])));
      toast.success(isArabic ? "تم حفظ البحث" : "Search saved");
    }
  };
  
  // Handle export
  const handleExport = (format: string) => {
    toast.success(isArabic ? `جاري تصدير ${filteredResults.length} نتيجة بصيغة ${format}` : `Exporting ${filteredResults.length} results as ${format}`);
  };

  return (
    <div className="min-h-screen bg-background" dir={isArabic ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#1e3a5f] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="container py-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Search className="h-8 w-8" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{t("title")}</h1>
            </div>
            <p className="text-white/80 text-lg mb-8">{t("subtitle")}</p>
            
            {/* Main Search Input */}
            <div className="relative max-w-2xl mx-auto">
              <Search className={`absolute ${isArabic ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
              <Input
                placeholder={t("searchPlaceholder")}
                value={filters.query}
                onChange={(e) => updateFilter("query", e.target.value)}
                className={`${isArabic ? "pr-12 pl-4" : "pl-12 pr-4"} h-14 text-lg bg-white text-foreground rounded-xl shadow-lg border-0`}
              />
              {filters.query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute ${isArabic ? "left-2" : "right-2"} top-1/2 -translate-y-1/2`}
                  onClick={() => updateFilter("query", "")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Quick Type Filters */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {["indicator", "document", "dataset", "entity", "report", "event"].map(type => (
                <Button
                  key={type}
                  variant={filters.types.includes(type) ? "default" : "secondary"}
                  size="sm"
                  className={`gap-2 ${filters.types.includes(type) ? "bg-white text-[#1e3a5f]" : "bg-white/10 text-white hover:bg-white/20"}`}
                  onClick={() => toggleArrayFilter("types", type)}
                >
                  {getTypeIcon(type)}
                  {t(type as keyof typeof content)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Results Section */}
      <div className="container py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-72 shrink-0">
              <Card className="sticky top-4">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      {t("filters")}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      {t("clearAll")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Data Quality */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {t("quality")}
                    </h4>
                    <div className="space-y-2">
                      {["verified", "provisional", "estimated"].map(quality => (
                        <label key={quality} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={filters.qualities.includes(quality)}
                            onCheckedChange={() => toggleArrayFilter("qualities", quality)}
                          />
                          {getQualityBadge(quality)}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Confidence Level */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {t("confidence")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["A", "B", "C", "D"].map(conf => (
                        <Button
                          key={conf}
                          variant={filters.confidences.includes(conf) ? "default" : "outline"}
                          size="sm"
                          className="font-mono"
                          onClick={() => toggleArrayFilter("confidences", conf)}
                        >
                          {conf}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Regime/Authority */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t("regime")}
                    </h4>
                    <div className="space-y-2">
                      {[
                        { value: "aden", label: t("aden") },
                        { value: "sanaa", label: t("sanaa") },
                        { value: "both", label: t("both") }
                      ].map(regime => (
                        <label key={regime.value} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={filters.regimes.includes(regime.value)}
                            onCheckedChange={() => toggleArrayFilter("regimes", regime.value)}
                          />
                          <span className="text-sm">{regime.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* API Available */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      {t("apiAvailable")}
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant={filters.hasApi === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter("hasApi", filters.hasApi === true ? null : true)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {isArabic ? "نعم" : "Yes"}
                      </Button>
                      <Button
                        variant={filters.hasApi === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter("hasApi", filters.hasApi === false ? null : false)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {isArabic ? "لا" : "No"}
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Sector */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      {t("sector")}
                    </h4>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {sectors.map(sector => (
                          <label key={sector.value} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={filters.sectors.includes(sector.value)}
                              onCheckedChange={() => toggleArrayFilter("sectors", sector.value)}
                            />
                            <span className="text-sm">{isArabic ? sector.labelAr : sector.label}</span>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  <Separator />
                  
                  {/* Source */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {t("source")}
                    </h4>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {sources.map(source => (
                          <label key={source.value} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={filters.sources.includes(source.value)}
                              onCheckedChange={() => toggleArrayFilter("sources", source.value)}
                            />
                            <span className="text-sm">{isArabic ? source.labelAr : source.label}</span>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </aside>
          )}
          
          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {t("filters")}
                </Button>
                <span className="text-muted-foreground">
                  {filteredResults.length} {t("results")}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Sort */}
                <Select value={filters.sortBy} onValueChange={(v) => updateFilter("sortBy", v)}>
                  <SelectTrigger className="w-40">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">{t("relevance")}</SelectItem>
                    <SelectItem value="date">{t("date")}</SelectItem>
                    <SelectItem value="downloads">{t("downloads")}</SelectItem>
                    <SelectItem value="views">{t("views")}</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* View Mode */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Actions */}
                <Button variant="outline" size="sm" onClick={handleSaveSearch}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  {t("saveSearch")}
                </Button>
                <Select onValueChange={handleExport}>
                  <SelectTrigger className="w-40">
                    <Download className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={t("exportResults")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Results List */}
            {filteredResults.length === 0 ? (
              <Card className="p-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t("noResults")}</h3>
                <p className="text-muted-foreground">{t("tryDifferent")}</p>
              </Card>
            ) : (
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-4" : "space-y-4"}>
                {filteredResults.map(result => (
                  <Card key={result.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Type & Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant="outline" className="gap-1">
                              {getTypeIcon(result.type)}
                              {t(result.type as keyof typeof content)}
                            </Badge>
                            {getQualityBadge(result.quality)}
                            {getConfidenceBadge(result.confidence)}
                            {getRegimeBadge(result.regime)}
                            {result.hasApi && (
                              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 gap-1">
                                <Code className="h-3 w-3" />
                                API
                              </Badge>
                            )}
                          </div>
                          
                          {/* Title */}
                          <Link href={result.url}>
                            <h3 className="text-lg font-semibold hover:text-primary cursor-pointer mb-2">
                              {isArabic ? result.titleAr : result.title}
                            </h3>
                          </Link>
                          
                          {/* Description */}
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {isArabic ? result.descriptionAr : result.description}
                          </p>
                          
                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {isArabic ? result.sourceAr : result.source}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {result.date}
                            </span>
                            {result.downloads && (
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {result.downloads.toLocaleString()}
                              </span>
                            )}
                            {result.views && (
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {result.views.toLocaleString()}
                              </span>
                            )}
                            {result.frequency && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {result.frequency}
                              </span>
                            )}
                          </div>
                          
                          {/* Formats */}
                          {result.formats && result.formats.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {result.formats.map(format => (
                                <Badge key={format} variant="secondary" className="text-xs">
                                  {format === "JSON" && <FileJson className="h-3 w-3 mr-1" />}
                                  {format === "CSV" && <FileSpreadsheet className="h-3 w-3 mr-1" />}
                                  {format === "Excel" && <FileSpreadsheet className="h-3 w-3 mr-1" />}
                                  {format === "PDF" && <FileText className="h-3 w-3 mr-1" />}
                                  {format}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button size="sm" asChild>
                            <Link href={result.url}>
                              <Eye className="h-4 w-4 mr-1" />
                              {t("viewDetails")}
                            </Link>
                          </Button>
                          {result.hasApi && (
                            <Button size="sm" variant="outline" onClick={() => toast.info(isArabic ? "API: /api/v1/" + result.id : "API: /api/v1/" + result.id)}>
                              <Code className="h-4 w-4 mr-1" />
                              {t("apiEndpoint")}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
