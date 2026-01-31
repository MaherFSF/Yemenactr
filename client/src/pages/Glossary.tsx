import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  Search, 
  BookOpen, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  TrendingUp,
  Building2,
  Landmark,
  Globe,
  FileText,
  Link2
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Category configuration with icons
const categoryConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  "Macroeconomics": { icon: <TrendingUp className="h-4 w-4" />, color: "bg-blue-500" },
  "Monetary Policy": { icon: <Landmark className="h-4 w-4" />, color: "bg-emerald-500" },
  "Fiscal Policy": { icon: <Building2 className="h-4 w-4" />, color: "bg-purple-500" },
  "Trade": { icon: <Globe className="h-4 w-4" />, color: "bg-orange-500" },
  "Development": { icon: <TrendingUp className="h-4 w-4" />, color: "bg-teal-500" },
  "Banking": { icon: <Landmark className="h-4 w-4" />, color: "bg-indigo-500" },
};

// Alphabet for filtering
const englishAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const arabicAlphabet = "أبتثجحخدذرزسشصضطظعغفقكلمنهوي".split("");

// Yemen-specific context for key terms
const yemenContext: Record<string, { en: string; ar: string }> = {
  "Central Bank": {
    en: "In Yemen, the Central Bank of Yemen (CBY) plays a crucial role in maintaining price stability and managing foreign reserves amidst ongoing conflict and economic fragmentation, often issuing circulars related to currency exchange and banking regulations.",
    ar: "في اليمن، يلعب البنك المركزي اليمني دوراً حاسماً في الحفاظ على استقرار الأسعار وإدارة الاحتياطيات الأجنبية وسط الصراع المستمر والتشرذم الاقتصادي، وغالباً ما يصدر تعميمات تتعلق بصرف العملات واللوائح المصرفية."
  },
  "Exchange Rate": {
    en: "Yemen experiences significant exchange rate volatility, with divergent rates between Aden (IRG-controlled) and Sana'a (DFA-controlled) territories. The Yemeni Rial (YER) has depreciated substantially since 2015.",
    ar: "يشهد اليمن تقلبات كبيرة في سعر الصرف، مع اختلاف الأسعار بين عدن (تحت سيطرة الحكومة) وصنعاء (تحت سيطرة أنصار الله). وقد انخفضت قيمة الريال اليمني بشكل كبير منذ عام 2015."
  },
  "Inflation": {
    en: "Yemen faces high inflation rates driven by currency depreciation, supply chain disruptions, and conflict. Food prices are particularly volatile, affecting humanitarian conditions.",
    ar: "يواجه اليمن معدلات تضخم مرتفعة بسبب انخفاض قيمة العملة واضطرابات سلسلة التوريد والصراع. أسعار المواد الغذائية متقلبة بشكل خاص، مما يؤثر على الأوضاع الإنسانية."
  },
  "GDP": {
    en: "Yemen's GDP contracted significantly since 2015 due to conflict. The economy has shown partial recovery but remains fragmented between different territorial controls.",
    ar: "انكمش الناتج المحلي الإجمالي لليمن بشكل كبير منذ عام 2015 بسبب الصراع. أظهر الاقتصاد تعافياً جزئياً لكنه يظل مجزأً بين مناطق السيطرة المختلفة."
  },
  "Foreign Reserves": {
    en: "Yemen's foreign reserves have been severely depleted since 2015. The CBY-Aden has received Saudi deposits to support the currency, while CBY-Sana'a operates with limited reserves.",
    ar: "استُنزفت احتياطيات اليمن من النقد الأجنبي بشكل حاد منذ عام 2015. تلقى البنك المركزي في عدن ودائع سعودية لدعم العملة، بينما يعمل البنك المركزي في صنعاء باحتياطيات محدودة."
  },
};

// Related terms mapping
const relatedTerms: Record<string, string[]> = {
  "Central Bank": ["Monetary Policy", "Interest Rates", "Inflation", "Foreign Reserves", "Banking Supervision"],
  "Exchange Rate": ["Currency Depreciation", "Foreign Reserves", "Inflation", "Trade Balance"],
  "Inflation": ["Consumer Price Index", "Monetary Policy", "Exchange Rate", "Interest Rates"],
  "GDP": ["Economic Growth", "Fiscal Policy", "Trade Balance", "Investment"],
  "Interest Rates": ["Monetary Policy", "Central Bank", "Inflation", "Banking"],
};

// Source citations
const sourceCitations: Record<string, { name: string; url: string }[]> = {
  "Central Bank": [
    { name: "CBY Reports", url: "#" },
    { name: "World Bank Data", url: "https://data.worldbank.org/country/yemen" },
    { name: "IMF Articles", url: "#" },
  ],
  "Exchange Rate": [
    { name: "CBY Official Rates", url: "#" },
    { name: "Market Data", url: "#" },
  ],
};

export default function Glossary() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [expandedTermId, setExpandedTermId] = useState<number | null>(null);

  // Fetch all glossary terms
  const { data: allTerms, isLoading } = trpc.glossary.list.useQuery({});

  // Get unique categories
  const categories = useMemo(() => {
    if (!allTerms) return [];
    const cats = new Set(allTerms.map(term => term.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allTerms]);

  // Filter terms based on search, category, and letter
  const filteredTerms = useMemo(() => {
    if (!allTerms) return [];
    
    let filtered = allTerms;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(term => term.category === selectedCategory);
    }

    // Filter by letter
    if (selectedLetter) {
      filtered = filtered.filter(term => {
        const text = isArabic ? term.termAr || term.termEn : term.termEn;
        return text.charAt(0).toUpperCase() === selectedLetter.toUpperCase();
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(term => {
        const termText = isArabic ? term.termAr : term.termEn;
        const definitionText = isArabic ? term.definitionAr : term.definitionEn;
        return (
          termText?.toLowerCase().includes(query) ||
          definitionText?.toLowerCase().includes(query)
        );
      });
    }

    // Sort alphabetically
    return filtered.sort((a, b) => {
      const aText = isArabic ? a.termAr || a.termEn : a.termEn;
      const bText = isArabic ? b.termAr || b.termEn : b.termEn;
      return aText.localeCompare(bText, language);
    });
  }, [allTerms, searchQuery, selectedCategory, selectedLetter, isArabic, language]);

  const alphabet = isArabic ? arabicAlphabet : englishAlphabet;

  return (
    <div className="flex flex-col min-h-screen" dir={isArabic ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#768064] to-[#1a4a70] text-white border-b">
        <div className="container py-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {isArabic ? "قاموس المصطلحات الاقتصادية" : "Economic Glossary"}
                </h1>
              </div>
            </div>
            <p className="text-lg text-white/80">
              {isArabic
                ? "دليل شامل للمصطلحات الاقتصادية والمالية مع تعريفات وسياق يمني محدد"
                : "Comprehensive guide to economic and financial terms with Yemen-specific context"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid lg:grid-cols-[280px,1fr] gap-8">
          {/* Left Sidebar - Term List */}
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={isArabic ? "ابحث عن مصطلح..." : "Search terms..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isArabic ? "pr-10" : "pl-10"}
              />
            </div>

            {/* Alphabetical Filter */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {isArabic ? "تصفية أبجدية" : "Alphabetical filter"}
              </h3>
              <div className="flex flex-wrap gap-1">
                {alphabet.map((letter) => (
                  <Button
                    key={letter}
                    variant={selectedLetter === letter ? "default" : "outline"}
                    size="sm"
                    className="w-7 h-7 p-0 text-xs"
                    onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {isArabic ? "تصفية الفئة" : "Category filter"}
              </h3>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "جميع الفئات" : "All Categories"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {isArabic ? "جميع الفئات" : "All Categories"}
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category || "uncategorized"}>
                      <div className="flex items-center gap-2">
                        {categoryConfig[category || ""]?.icon}
                        {category || (isArabic ? "غير مصنف" : "Uncategorized")}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Term List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {isArabic ? "قائمة المصطلحات" : "Term List"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {isArabic 
                    ? `عرض ${filteredTerms.length} من ${allTerms?.length || 0} مصطلح`
                    : `Displaying ${filteredTerms.length} of ${allTerms?.length || 0} terms`}
                </p>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTerms.map((term) => (
                      <button
                        key={term.id}
                        onClick={() => setExpandedTermId(term.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          expandedTermId === term.id 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{isArabic ? term.termAr || term.termEn : term.termEn}</span>
                          {expandedTermId === term.id && (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Detailed Term View */}
          <div>
            {expandedTermId ? (
              (() => {
                const term = filteredTerms.find(t => t.id === expandedTermId);
                if (!term) return null;
                
                const termName = isArabic ? term.termAr || term.termEn : term.termEn;
                const context = yemenContext[term.termEn];
                const related = relatedTerms[term.termEn] || [];
                const sources = sourceCitations[term.termEn] || [];

                return (
                  <div className="space-y-6">
                    {/* Term Header */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h2 className="text-3xl font-bold text-foreground mb-2">
                              {termName}
                            </h2>
                            {isArabic && term.termEn && (
                              <p className="text-lg text-muted-foreground">{term.termEn}</p>
                            )}
                            {!isArabic && term.termAr && (
                              <p className="text-lg text-muted-foreground">{term.termAr}</p>
                            )}
                          </div>
                          {term.category && (
                            <Badge className={categoryConfig[term.category]?.color || "bg-gray-500"}>
                              {categoryConfig[term.category]?.icon}
                              <span className="ml-1">{term.category}</span>
                            </Badge>
                          )}
                        </div>

                        {/* Comprehensive Definition */}
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">
                            {isArabic ? "التعريف الشامل" : "Comprehensive Definition"}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {isArabic 
                              ? term.definitionAr || term.definitionEn 
                              : term.definitionEn}
                          </p>
                        </div>

                        {/* Yemen-Specific Context */}
                        {context && (
                          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <Globe className="h-5 w-5 text-amber-600" />
                              {isArabic ? "السياق اليمني المحدد" : "Yemen-Specific Application"}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {isArabic ? context.ar : context.en}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Related Indicators */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          {isArabic ? "المؤشرات ذات الصلة" : "Related Indicators"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {["Interest Rates", "Inflation Rate", "Foreign Reserves", "Broad Money Supply (M2)"].map((indicator) => (
                            <Button key={indicator} variant="outline" size="sm" className="justify-start">
                              <Link2 className="h-3 w-3 mr-2" />
                              {indicator}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Related Terms */}
                    {related.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {isArabic ? "المصطلحات ذات الصلة (روابط قابلة للنقر)" : "Related Terms (Clickable Tags)"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {related.map((relatedTerm) => (
                              <Badge 
                                key={relatedTerm} 
                                variant="secondary" 
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => {
                                  const found = allTerms?.find(t => t.termEn === relatedTerm);
                                  if (found) setExpandedTermId(found.id);
                                }}
                              >
                                {relatedTerm}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Source Citations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {isArabic ? "المراجع والقراءات الإضافية" : "References and Further Reading"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-sm">
                            <ExternalLink className="h-4 w-4 text-blue-500" />
                            <a href="#" className="text-blue-600 hover:underline">
                              Central Bank of Yemen, Annual Reports & Circulars
                            </a>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <ExternalLink className="h-4 w-4 text-blue-500" />
                            <a href="https://data.worldbank.org/country/yemen" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              World Bank, Yemen Economic Monitor
                            </a>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <ExternalLink className="h-4 w-4 text-blue-500" />
                            <a href="#" className="text-blue-600 hover:underline">
                              Sana'a Center for Strategic Studies, Economic Reports
                            </a>
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <ExternalLink className="h-4 w-4 text-blue-500" />
                            <a href="#" className="text-blue-600 hover:underline">
                              Academic Journals on War Economy and Central Banking
                            </a>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()
            ) : (
              /* Default view when no term is selected */
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    {isArabic ? "اختر مصطلحاً لعرض التفاصيل" : "Select a term to view details"}
                  </h3>
                  <p className="text-muted-foreground">
                    {isArabic 
                      ? "انقر على أي مصطلح من القائمة لعرض التعريف الشامل والسياق اليمني"
                      : "Click on any term from the list to view comprehensive definition and Yemen context"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
