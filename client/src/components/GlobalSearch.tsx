import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Database, Users, Calendar, TrendingUp, BookOpen, X, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface SearchResult {
  id: string;
  type: "indicator" | "document" | "entity" | "event" | "glossary" | "dataset";
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  url: string;
  relevance: number;
  metadata?: Record<string, string>;
}

// Sample search results for demonstration
const sampleResults: SearchResult[] = [
  {
    id: "1",
    type: "indicator",
    title: "USD/YER Exchange Rate (Aden)",
    titleAr: "سعر صرف الدولار/الريال (عدن)",
    description: "Official exchange rate from Central Bank of Yemen - Aden",
    descriptionAr: "سعر الصرف الرسمي من البنك المركزي اليمني - عدن",
    url: "/dashboard",
    relevance: 0.95,
    metadata: { sector: "Currency", regime: "Aden IRG" },
  },
  {
    id: "2",
    type: "indicator",
    title: "Consumer Price Index (CPI)",
    titleAr: "مؤشر أسعار المستهلك",
    description: "Monthly inflation tracking across Yemen",
    descriptionAr: "تتبع التضخم الشهري في جميع أنحاء اليمن",
    url: "/sectors/prices",
    relevance: 0.88,
    metadata: { sector: "Prices", regime: "Both" },
  },
  {
    id: "3",
    type: "document",
    title: "Yemen Economic Outlook Q4 2024",
    titleAr: "التوقعات الاقتصادية لليمن الربع الرابع 2024",
    description: "Comprehensive quarterly analysis of Yemen's economic situation",
    descriptionAr: "تحليل ربع سنوي شامل للوضع الاقتصادي في اليمن",
    url: "/research",
    relevance: 0.82,
    metadata: { type: "Report", date: "2024-12" },
  },
  {
    id: "4",
    type: "entity",
    title: "HSA Group (Hayel Saeed Anam)",
    titleAr: "مجموعة هائل سعيد أنعم",
    description: "Yemen's largest conglomerate with diversified operations",
    descriptionAr: "أكبر تكتل في اليمن مع عمليات متنوعة",
    url: "/entities/hsa-group",
    relevance: 0.79,
    metadata: { type: "Conglomerate", sector: "Multiple" },
  },
  {
    id: "5",
    type: "event",
    title: "CBY Aden Interest Rate Decision",
    titleAr: "قرار سعر الفائدة من البنك المركزي عدن",
    description: "Central Bank of Yemen - Aden announces monetary policy changes",
    descriptionAr: "البنك المركزي اليمني - عدن يعلن تغييرات في السياسة النقدية",
    url: "/timeline",
    relevance: 0.75,
    metadata: { date: "2024-11-15", impact: "High" },
  },
  {
    id: "6",
    type: "glossary",
    title: "Dual Currency System",
    titleAr: "نظام العملة المزدوجة",
    description: "The parallel currency systems operating in Yemen since 2016",
    descriptionAr: "أنظمة العملات المتوازية العاملة في اليمن منذ 2016",
    url: "/glossary",
    relevance: 0.72,
    metadata: { category: "Monetary" },
  },
  {
    id: "7",
    type: "dataset",
    title: "Food Price Monitoring Dataset",
    titleAr: "مجموعة بيانات مراقبة أسعار الغذاء",
    description: "WFP market price data for essential commodities",
    descriptionAr: "بيانات أسعار السوق من برنامج الأغذية العالمي للسلع الأساسية",
    url: "/data-repository",
    relevance: 0.68,
    metadata: { source: "WFP", frequency: "Monthly" },
  },
];

const typeIcons: Record<SearchResult["type"], React.ReactNode> = {
  indicator: <TrendingUp className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  entity: <Users className="w-4 h-4" />,
  event: <Calendar className="w-4 h-4" />,
  glossary: <BookOpen className="w-4 h-4" />,
  dataset: <Database className="w-4 h-4" />,
};

const typeColors: Record<SearchResult["type"], string> = {
  indicator: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  document: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  entity: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  event: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  glossary: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  dataset: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
};

export default function GlobalSearch() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const content = {
    placeholder: { en: "Search indicators, documents, entities...", ar: "ابحث في المؤشرات والوثائق والكيانات..." },
    title: { en: "Search YETO", ar: "البحث في يتو" },
    all: { en: "All", ar: "الكل" },
    indicators: { en: "Indicators", ar: "المؤشرات" },
    documents: { en: "Documents", ar: "الوثائق" },
    entities: { en: "Entities", ar: "الكيانات" },
    events: { en: "Events", ar: "الأحداث" },
    noResults: { en: "No results found", ar: "لم يتم العثور على نتائج" },
    tryDifferent: { en: "Try different keywords or browse by category", ar: "جرب كلمات مختلفة أو تصفح حسب الفئة" },
    recentSearches: { en: "Recent Searches", ar: "عمليات البحث الأخيرة" },
    popularSearches: { en: "Popular Searches", ar: "عمليات البحث الشائعة" },
    pressEsc: { en: "Press ESC to close", ar: "اضغط ESC للإغلاق" },
    viewAll: { en: "View all results", ar: "عرض جميع النتائج" },
  };

  const t = (key: keyof typeof content) => isArabic ? content[key].ar : content[key].en;

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Search logic
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    // Simulate search delay
    const timer = setTimeout(() => {
      const filtered = sampleResults.filter(result => {
        const searchText = `${result.title} ${result.titleAr} ${result.description} ${result.descriptionAr}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
      setResults(filtered.length > 0 ? filtered : sampleResults.slice(0, 5));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredResults = activeTab === "all" 
    ? results 
    : results.filter(r => r.type === activeTab || (activeTab === "indicators" && r.type === "indicator"));

  const handleResultClick = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    setLocation(result.url);
  };

  const popularSearches = [
    { en: "Exchange rate", ar: "سعر الصرف" },
    { en: "Inflation", ar: "التضخم" },
    { en: "Food prices", ar: "أسعار الغذاء" },
    { en: "Banking sector", ar: "القطاع المصرفي" },
    { en: "HSA Group", ar: "مجموعة هائل سعيد" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="relative w-full max-w-sm justify-start text-muted-foreground gap-2"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">{t("placeholder")}</span>
          <span className="sm:hidden">{isArabic ? "بحث" : "Search"}</span>
          <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">{t("title")}</DialogTitle>
          <div className="relative">
            <Search className={`absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
            <Input
              ref={inputRef}
              placeholder={t("placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${isArabic ? "pr-10 pl-10" : "pl-10 pr-10"} h-12 text-lg border-0 focus-visible:ring-0 shadow-none`}
              dir={isArabic ? "rtl" : "ltr"}
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className={`absolute ${isArabic ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 h-6 w-6 p-0`}
                onClick={() => setQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="border-t">
          {query.length >= 2 ? (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                  <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                    {t("all")}
                  </TabsTrigger>
                  <TabsTrigger value="indicator" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                    {t("indicators")}
                  </TabsTrigger>
                  <TabsTrigger value="document" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                    {t("documents")}
                  </TabsTrigger>
                  <TabsTrigger value="entity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                    {t("entities")}
                  </TabsTrigger>
                  <TabsTrigger value="event" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                    {t("events")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="max-h-[400px] overflow-y-auto p-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="space-y-1">
                    {filteredResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors ${isArabic ? "text-right" : "text-left"}`}
                      >
                        <div className={`p-2 rounded-lg ${typeColors[result.type]}`}>
                          {typeIcons[result.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">
                              {isArabic && result.titleAr ? result.titleAr : result.title}
                            </span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {result.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                            {isArabic && result.descriptionAr ? result.descriptionAr : result.description}
                          </p>
                          {result.metadata && (
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {Object.entries(result.metadata).map(([key, value]) => (
                                <span key={key} className="text-xs text-muted-foreground">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium">{t("noResults")}</p>
                    <p className="text-sm text-muted-foreground">{t("tryDifferent")}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 space-y-4">
              <div>
                <h4 className={`text-sm font-medium text-muted-foreground mb-2 ${isArabic ? "text-right" : ""}`}>
                  {t("popularSearches")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(isArabic ? search.ar : search.en)}
                      className="text-sm"
                    >
                      {isArabic ? search.ar : search.en}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("pressEsc")}</span>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
            <span>{isArabic ? "للتنقل" : "to navigate"}</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
            <span>{isArabic ? "للاختيار" : "to select"}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
