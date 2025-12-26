import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Banknote,
  Building2,
  Ship,
  Landmark,
  Users
} from "lucide-react";
import { useState } from "react";

interface TimelineEvent {
  id: string;
  date: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: string;
  regime?: string;
  impact: "high" | "medium" | "low";
  indicators?: string[];
  sources: string[];
}

export default function Timeline() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const events: TimelineEvent[] = [
    {
      id: "1",
      date: "2024-11-19",
      titleEn: "Red Sea Shipping Disruptions Intensify",
      titleAr: "تصاعد اضطرابات الشحن في البحر الأحمر",
      descriptionEn: "Continued Houthi attacks on commercial vessels in the Red Sea lead to major shipping companies suspending operations, significantly impacting Yemen's imports and trade costs.",
      descriptionAr: "استمرار هجمات الحوثيين على السفن التجارية في البحر الأحمر يؤدي إلى تعليق شركات الشحن الكبرى لعملياتها، مما يؤثر بشكل كبير على واردات اليمن وتكاليف التجارة.",
      category: "trade",
      impact: "high",
      indicators: ["Import costs", "Fuel prices", "Food prices"],
      sources: ["Reuters", "Lloyd's List"]
    },
    {
      id: "2",
      date: "2024-09-15",
      titleEn: "CBY Aden Raises Interest Rates",
      titleAr: "البنك المركزي في عدن يرفع أسعار الفائدة",
      descriptionEn: "Central Bank of Yemen in Aden increases benchmark interest rate to 27% in attempt to stabilize the Yemeni Rial amid continued depreciation.",
      descriptionAr: "البنك المركزي اليمني في عدن يرفع سعر الفائدة المرجعي إلى 27% في محاولة لتثبيت الريال اليمني وسط استمرار انخفاض قيمته.",
      category: "monetary",
      regime: "IRG",
      impact: "high",
      indicators: ["Exchange rate", "Interest rates", "Banking liquidity"],
      sources: ["CBY Aden", "Sana'a Center"]
    },
    {
      id: "3",
      date: "2024-07-01",
      titleEn: "Saudi Arabia Extends $250M Deposit",
      titleAr: "السعودية تمدد وديعة بقيمة 250 مليون دولار",
      descriptionEn: "Saudi Arabia extends a $250 million deposit to the Central Bank of Yemen in Aden to support currency stabilization efforts.",
      descriptionAr: "السعودية تمدد وديعة بقيمة 250 مليون دولار للبنك المركزي اليمني في عدن لدعم جهود استقرار العملة.",
      category: "monetary",
      regime: "IRG",
      impact: "high",
      indicators: ["Foreign reserves", "Exchange rate"],
      sources: ["Saudi Press Agency", "Reuters"]
    },
    {
      id: "4",
      date: "2024-04-15",
      titleEn: "Fuel Price Increases in IRG Areas",
      titleAr: "ارتفاع أسعار الوقود في مناطق الشرعية",
      descriptionEn: "Government-controlled areas see significant fuel price increases following subsidy adjustments and currency depreciation.",
      descriptionAr: "المناطق الخاضعة لسيطرة الحكومة تشهد ارتفاعاً كبيراً في أسعار الوقود بعد تعديلات الدعم وانخفاض قيمة العملة.",
      category: "energy",
      regime: "IRG",
      impact: "medium",
      indicators: ["Fuel prices", "Inflation", "Transport costs"],
      sources: ["Yemen Economic Bulletin"]
    },
    {
      id: "5",
      date: "2023-12-01",
      titleEn: "UN-Mediated Truce Extension Discussions",
      titleAr: "مناقشات تمديد الهدنة بوساطة أممية",
      descriptionEn: "UN-led negotiations continue for extending the ceasefire, with economic provisions including salary payments and port access being key discussion points.",
      descriptionAr: "المفاوضات بقيادة الأمم المتحدة تستمر لتمديد وقف إطلاق النار، مع كون الأحكام الاقتصادية بما في ذلك مدفوعات الرواتب والوصول إلى الموانئ نقاط نقاش رئيسية.",
      category: "political",
      impact: "high",
      indicators: ["Trade flows", "Salary payments", "Humanitarian access"],
      sources: ["UN News", "OSESGY"]
    },
    {
      id: "6",
      date: "2023-08-20",
      titleEn: "IPC Analysis Shows Worsening Food Security",
      titleAr: "تحليل IPC يظهر تدهور الأمن الغذائي",
      descriptionEn: "Latest IPC analysis reveals 17.6 million Yemenis facing acute food insecurity, with 5.8 million in emergency conditions.",
      descriptionAr: "أحدث تحليل IPC يكشف أن 17.6 مليون يمني يواجهون انعدام الأمن الغذائي الحاد، مع 5.8 مليون في ظروف طوارئ.",
      category: "humanitarian",
      impact: "high",
      indicators: ["Food security", "Malnutrition rates", "Aid requirements"],
      sources: ["IPC", "WFP", "FAO"]
    },
    {
      id: "7",
      date: "2022-10-02",
      titleEn: "Truce Expires Without Renewal",
      titleAr: "انتهاء الهدنة دون تجديد",
      descriptionEn: "The UN-brokered truce expires after six months without formal renewal, though de facto calm largely continues.",
      descriptionAr: "الهدنة بوساطة الأمم المتحدة تنتهي بعد ستة أشهر دون تجديد رسمي، رغم استمرار الهدوء الفعلي إلى حد كبير.",
      category: "political",
      impact: "high",
      indicators: ["Conflict intensity", "Humanitarian access"],
      sources: ["UN News", "ACLED"]
    },
    {
      id: "8",
      date: "2022-04-02",
      titleEn: "UN-Mediated Truce Begins",
      titleAr: "بدء الهدنة بوساطة أممية",
      descriptionEn: "A two-month nationwide truce begins, later extended twice. Includes provisions for fuel ships to Hodeidah and flights from Sana'a.",
      descriptionAr: "بدء هدنة وطنية لمدة شهرين، تم تمديدها لاحقاً مرتين. تشمل أحكاماً لسفن الوقود إلى الحديدة والرحلات من صنعاء.",
      category: "political",
      impact: "high",
      indicators: ["Fuel imports", "Air travel", "Conflict intensity"],
      sources: ["UN News", "OSESGY"]
    },
    {
      id: "9",
      date: "2021-12-15",
      titleEn: "Rial Hits Record Low Against Dollar",
      titleAr: "الريال يسجل أدنى مستوى قياسي مقابل الدولار",
      descriptionEn: "The Yemeni Rial in government-controlled areas reaches 1,700 YER/USD, its lowest level in history.",
      descriptionAr: "الريال اليمني في المناطق الخاضعة لسيطرة الحكومة يصل إلى 1700 ريال/دولار، أدنى مستوى له في التاريخ.",
      category: "monetary",
      regime: "IRG",
      impact: "high",
      indicators: ["Exchange rate", "Inflation", "Purchasing power"],
      sources: ["Market data", "CBY Aden"]
    },
    {
      id: "10",
      date: "2019-12-18",
      titleEn: "Currency Split Formalized",
      titleAr: "تقنين انقسام العملة",
      descriptionEn: "Sana'a authorities formally ban new banknotes printed after 2016, creating a de facto currency split between north and south Yemen.",
      descriptionAr: "سلطات صنعاء تحظر رسمياً الأوراق النقدية الجديدة المطبوعة بعد 2016، مما يخلق انقساماً فعلياً في العملة بين شمال وجنوب اليمن.",
      category: "monetary",
      impact: "high",
      indicators: ["Exchange rate divergence", "Trade disruption"],
      sources: ["Sana'a Center", "Rethinking Yemen's Economy"]
    },
  ];

  const categories = [
    { value: "all", labelEn: "All Categories", labelAr: "جميع الفئات" },
    { value: "monetary", labelEn: "Monetary & Currency", labelAr: "النقد والعملة" },
    { value: "trade", labelEn: "Trade & Commerce", labelAr: "التجارة" },
    { value: "political", labelEn: "Political & Conflict", labelAr: "السياسة والصراع" },
    { value: "humanitarian", labelEn: "Humanitarian", labelAr: "إنساني" },
    { value: "energy", labelEn: "Energy & Fuel", labelAr: "الطاقة والوقود" },
  ];

  const years = ["all", "2024", "2023", "2022", "2021", "2020", "2019"];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "monetary": return <Banknote className="h-5 w-5" />;
      case "trade": return <Ship className="h-5 w-5" />;
      case "political": return <Landmark className="h-5 w-5" />;
      case "humanitarian": return <Users className="h-5 w-5" />;
      case "energy": return <Building2 className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.titleAr.includes(searchQuery) ||
      event.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
    const matchesYear = yearFilter === "all" || event.date.startsWith(yearFilter);
    return matchesSearch && matchesCategory && matchesYear;
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "ar" 
                ? "الجدول الزمني الاقتصادي"
                : "Economic Timeline"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === "ar"
                ? "الأحداث الاقتصادية والسياسية الرئيسية في اليمن من 2010 إلى الحاضر"
                : "Key economic and political events in Yemen from 2010 to present"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={language === "ar" ? "البحث في الأحداث..." : "Search events..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {language === "ar" ? cat.labelAr : cat.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>
                      {year === "all" ? (language === "ar" ? "جميع السنوات" : "All Years") : year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

          <div className="space-y-6">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute left-6 w-4 h-4 rounded-full bg-primary border-4 border-background hidden md:block" 
                     style={{ top: "24px" }} />
                
                <Card className={`md:ml-16 transition-all ${expandedEvent === event.id ? "ring-2 ring-primary" : ""}`}>
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          {getCategoryIcon(event.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {new Date(event.date).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </Badge>
                            <Badge className={`text-xs ${getImpactColor(event.impact)}`}>
                              {event.impact === "high" 
                                ? (language === "ar" ? "تأثير عالي" : "High Impact")
                                : event.impact === "medium"
                                ? (language === "ar" ? "تأثير متوسط" : "Medium Impact")
                                : (language === "ar" ? "تأثير منخفض" : "Low Impact")}
                            </Badge>
                            {event.regime && (
                              <Badge variant="secondary" className="text-xs">
                                {event.regime}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">
                            {language === "ar" ? event.titleAr : event.titleEn}
                          </CardTitle>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {expandedEvent === event.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {expandedEvent === event.id && (
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground mb-4">
                        {language === "ar" ? event.descriptionAr : event.descriptionEn}
                      </p>
                      
                      {event.indicators && event.indicators.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            {language === "ar" ? "المؤشرات المتأثرة" : "Affected Indicators"}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {event.indicators.map((indicator, i) => (
                              <Badge key={i} variant="outline">{indicator}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {language === "ar" ? "المصادر" : "Sources"}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {event.sources.map((source, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>

        {filteredEvents.length === 0 && (
          <Card className="mt-8">
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === "ar" ? "لا توجد أحداث" : "No Events Found"}
              </h3>
              <p className="text-muted-foreground">
                {language === "ar" 
                  ? "جرب تعديل معايير البحث أو الفلاتر"
                  : "Try adjusting your search criteria or filters"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
