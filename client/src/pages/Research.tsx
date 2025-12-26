import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Calendar, 
  Search,
  Filter,
  TrendingUp,
  BookOpen,
  ExternalLink,
  Building2,
  Globe,
  Shield,
  Clock,
  Eye,
  Star,
  ChevronRight,
  FileBarChart,
  Newspaper,
  GraduationCap,
  Briefcase
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";

interface ResearchDocument {
  id: string;
  titleEn: string;
  titleAr: string;
  abstractEn: string;
  abstractAr: string;
  date: string;
  category: string;
  type: "report" | "brief" | "dataset" | "academic" | "news";
  source: {
    nameEn: string;
    nameAr: string;
    url: string;
    logoUrl?: string;
  };
  sectors: string[];
  regimeTag?: "aden_irg" | "sanaa_defacto" | "both" | "national";
  confidenceRating: "A" | "B" | "C" | "D";
  language: "ar" | "en" | "both";
  downloadUrl?: string;
  externalUrl?: string;
  featured: boolean;
  views: number;
  license: string;
}

export default function Research() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Comprehensive research documents
  const documents: ResearchDocument[] = [
    {
      id: "1",
      titleEn: "Yemen Banking Sector Analysis Q4 2024",
      titleAr: "تحليل القطاع المصرفي اليمني - الربع الرابع 2024",
      abstractEn: "Comprehensive analysis of banking sector performance, liquidity challenges, and regulatory developments in both Aden and Sana'a jurisdictions. Examines correspondent banking relationships, FX access, and credit conditions.",
      abstractAr: "تحليل شامل لأداء القطاع المصرفي وتحديات السيولة والتطورات التنظيمية في كل من عدن وصنعاء. يدرس علاقات المراسلة المصرفية والوصول إلى العملات الأجنبية وظروف الائتمان.",
      date: "2024-12-15",
      category: "Banking",
      type: "report",
      source: {
        nameEn: "YETO Research",
        nameAr: "أبحاث يتو",
        url: "https://yeto.causewaygrp.com"
      },
      sectors: ["banking", "monetary"],
      regimeTag: "both",
      confidenceRating: "A",
      language: "both",
      downloadUrl: "#",
      featured: true,
      views: 1250,
      license: "CC BY 4.0"
    },
    {
      id: "2",
      titleEn: "Inflation Dynamics and Monetary Policy Effectiveness",
      titleAr: "ديناميكيات التضخم وفعالية السياسة النقدية",
      abstractEn: "Examination of inflation trends, currency devaluation impacts, and the effectiveness of monetary policy interventions by the Central Bank of Yemen. Includes regional price comparisons.",
      abstractAr: "دراسة اتجاهات التضخم وتأثيرات انخفاض قيمة العملة وفعالية تدخلات السياسة النقدية من قبل البنك المركزي اليمني. يتضمن مقارنات إقليمية للأسعار.",
      date: "2024-11-28",
      category: "Monetary Policy",
      type: "report",
      source: {
        nameEn: "YETO Research",
        nameAr: "أبحاث يتو",
        url: "https://yeto.causewaygrp.com"
      },
      sectors: ["prices", "monetary", "currency"],
      regimeTag: "both",
      confidenceRating: "A",
      language: "both",
      downloadUrl: "#",
      featured: true,
      views: 980,
      license: "CC BY 4.0"
    },
    {
      id: "3",
      titleEn: "Yemen Economic Monitor - World Bank",
      titleAr: "مرصد الاقتصاد اليمني - البنك الدولي",
      abstractEn: "Biannual economic update covering macroeconomic developments, fiscal situation, and outlook for Yemen's economy. Includes GDP estimates and poverty projections.",
      abstractAr: "تحديث اقتصادي نصف سنوي يغطي التطورات الاقتصادية الكلية والوضع المالي والتوقعات للاقتصاد اليمني. يتضمن تقديرات الناتج المحلي الإجمالي وتوقعات الفقر.",
      date: "2024-10-15",
      category: "Macroeconomy",
      type: "report",
      source: {
        nameEn: "World Bank",
        nameAr: "البنك الدولي",
        url: "https://www.worldbank.org"
      },
      sectors: ["macroeconomy", "poverty", "public_finance"],
      regimeTag: "national",
      confidenceRating: "A",
      language: "both",
      externalUrl: "https://www.worldbank.org/en/country/yemen",
      featured: true,
      views: 2100,
      license: "CC BY 3.0 IGO"
    },
    {
      id: "4",
      titleEn: "Yemen Market Monitoring Bulletin",
      titleAr: "نشرة مراقبة السوق اليمني",
      abstractEn: "Monthly market monitoring report covering food prices, fuel costs, and exchange rates across Yemen's governorates. Includes minimum food basket costs.",
      abstractAr: "تقرير شهري لمراقبة السوق يغطي أسعار الغذاء وتكاليف الوقود وأسعار الصرف في محافظات اليمن. يتضمن تكاليف الحد الأدنى لسلة الغذاء.",
      date: "2024-12-01",
      category: "Prices",
      type: "brief",
      source: {
        nameEn: "WFP",
        nameAr: "برنامج الغذاء العالمي",
        url: "https://www.wfp.org"
      },
      sectors: ["prices", "food_security"],
      regimeTag: "both",
      confidenceRating: "A",
      language: "both",
      externalUrl: "https://www.wfp.org/countries/yemen",
      featured: false,
      views: 1500,
      license: "UN Terms"
    },
    {
      id: "5",
      titleEn: "Yemen IPC Acute Food Insecurity Analysis",
      titleAr: "تحليل التصنيف المرحلي المتكامل لانعدام الأمن الغذائي الحاد في اليمن",
      abstractEn: "Integrated Food Security Phase Classification analysis showing acute food insecurity levels across Yemen's districts. Includes population estimates and projections.",
      abstractAr: "تحليل التصنيف المرحلي المتكامل للأمن الغذائي يُظهر مستويات انعدام الأمن الغذائي الحاد في مديريات اليمن. يتضمن تقديرات وتوقعات السكان.",
      date: "2024-09-20",
      category: "Food Security",
      type: "report",
      source: {
        nameEn: "IPC Global Platform",
        nameAr: "منصة التصنيف المرحلي المتكامل العالمية",
        url: "https://www.ipcinfo.org"
      },
      sectors: ["food_security", "poverty"],
      regimeTag: "national",
      confidenceRating: "A",
      language: "both",
      externalUrl: "https://www.ipcinfo.org/ipc-country-analysis/details-map/en/c/1156957/",
      featured: false,
      views: 890,
      license: "CC BY-NC-SA 4.0"
    },
    {
      id: "6",
      titleEn: "Humanitarian Response Plan Yemen 2024",
      titleAr: "خطة الاستجابة الإنسانية لليمن 2024",
      abstractEn: "Comprehensive humanitarian response plan outlining needs, response strategies, and funding requirements for Yemen. Includes cluster-specific plans and targets.",
      abstractAr: "خطة استجابة إنسانية شاملة تحدد الاحتياجات واستراتيجيات الاستجابة ومتطلبات التمويل لليمن. تتضمن خططاً وأهدافاً خاصة بكل قطاع.",
      date: "2024-02-15",
      category: "Aid",
      type: "report",
      source: {
        nameEn: "OCHA",
        nameAr: "مكتب تنسيق الشؤون الإنسانية",
        url: "https://www.unocha.org"
      },
      sectors: ["aid", "food_security", "poverty"],
      regimeTag: "national",
      confidenceRating: "A",
      language: "both",
      externalUrl: "https://reliefweb.int/report/yemen/yemen-humanitarian-response-plan-2024",
      featured: false,
      views: 1800,
      license: "UN Terms"
    },
    {
      id: "7",
      titleEn: "Yemen's War Economy: A Political Economy Analysis",
      titleAr: "اقتصاد الحرب في اليمن: تحليل الاقتصاد السياسي",
      abstractEn: "Analysis of war economy dynamics, including fuel trade, taxation by armed groups, and economic fragmentation. Examines incentives and constraints of key actors.",
      abstractAr: "تحليل ديناميكيات اقتصاد الحرب، بما في ذلك تجارة الوقود والضرائب من قبل الجماعات المسلحة والتجزئة الاقتصادية. يدرس حوافز وقيود الفاعلين الرئيسيين.",
      date: "2024-08-10",
      category: "Conflict Economy",
      type: "academic",
      source: {
        nameEn: "Sana'a Center for Strategic Studies",
        nameAr: "مركز صنعاء للدراسات الاستراتيجية",
        url: "https://sanaacenter.org"
      },
      sectors: ["conflict", "energy", "public_finance"],
      regimeTag: "both",
      confidenceRating: "B",
      language: "both",
      externalUrl: "https://sanaacenter.org",
      featured: false,
      views: 750,
      license: "CC BY-NC 4.0"
    },
    {
      id: "8",
      titleEn: "Central Bank of Yemen Annual Report 2023",
      titleAr: "التقرير السنوي للبنك المركزي اليمني 2023",
      abstractEn: "Official annual report from CBY-Aden covering monetary policy decisions, banking sector supervision, and foreign exchange operations.",
      abstractAr: "التقرير السنوي الرسمي من البنك المركزي في عدن يغطي قرارات السياسة النقدية والرقابة على القطاع المصرفي وعمليات الصرف الأجنبي.",
      date: "2024-03-30",
      category: "Banking",
      type: "report",
      source: {
        nameEn: "Central Bank of Yemen - Aden",
        nameAr: "البنك المركزي اليمني - عدن",
        url: "https://cby-ye.com"
      },
      sectors: ["banking", "monetary", "currency"],
      regimeTag: "aden_irg",
      confidenceRating: "A",
      language: "ar",
      externalUrl: "https://cby-ye.com",
      featured: false,
      views: 620,
      license: "Government Publication"
    },
    {
      id: "9",
      titleEn: "Rethinking Yemen's Economy: Policy Brief Series",
      titleAr: "إعادة التفكير في اقتصاد اليمن: سلسلة موجزات السياسات",
      abstractEn: "Policy brief series examining economic stabilization options, fiscal reforms, and reconstruction planning for Yemen.",
      abstractAr: "سلسلة موجزات سياسات تدرس خيارات الاستقرار الاقتصادي والإصلاحات المالية وتخطيط إعادة الإعمار لليمن.",
      date: "2024-07-15",
      category: "Policy",
      type: "brief",
      source: {
        nameEn: "Rethinking Yemen's Economy",
        nameAr: "إعادة التفكير في اقتصاد اليمن",
        url: "https://devchampions.org/rye"
      },
      sectors: ["macroeconomy", "public_finance"],
      regimeTag: "national",
      confidenceRating: "B",
      language: "both",
      externalUrl: "https://devchampions.org/rye",
      featured: false,
      views: 540,
      license: "CC BY 4.0"
    },
    {
      id: "10",
      titleEn: "Yemen Trade Statistics Dataset",
      titleAr: "مجموعة بيانات إحصاءات التجارة اليمنية",
      abstractEn: "Comprehensive trade statistics including imports, exports, trade partners, and commodity breakdowns from UN Comtrade.",
      abstractAr: "إحصاءات تجارية شاملة تتضمن الواردات والصادرات والشركاء التجاريين وتفاصيل السلع من قاعدة بيانات الأمم المتحدة للتجارة.",
      date: "2024-11-01",
      category: "Trade",
      type: "dataset",
      source: {
        nameEn: "UN Comtrade",
        nameAr: "قاعدة بيانات الأمم المتحدة للتجارة",
        url: "https://comtrade.un.org"
      },
      sectors: ["trade"],
      regimeTag: "national",
      confidenceRating: "A",
      language: "en",
      externalUrl: "https://comtrade.un.org/data",
      featured: false,
      views: 430,
      license: "UN Terms"
    }
  ];

  const categories = [
    { value: "all", labelEn: "All Categories", labelAr: "جميع الفئات" },
    { value: "Banking", labelEn: "Banking", labelAr: "القطاع المصرفي" },
    { value: "Monetary Policy", labelEn: "Monetary Policy", labelAr: "السياسة النقدية" },
    { value: "Macroeconomy", labelEn: "Macroeconomy", labelAr: "الاقتصاد الكلي" },
    { value: "Prices", labelEn: "Prices", labelAr: "الأسعار" },
    { value: "Trade", labelEn: "Trade", labelAr: "التجارة" },
    { value: "Food Security", labelEn: "Food Security", labelAr: "الأمن الغذائي" },
    { value: "Aid", labelEn: "Aid", labelAr: "المساعدات" },
    { value: "Conflict Economy", labelEn: "Conflict Economy", labelAr: "اقتصاد الصراع" },
    { value: "Policy", labelEn: "Policy", labelAr: "السياسات" },
  ];

  const documentTypes = [
    { value: "all", labelEn: "All Types", labelAr: "جميع الأنواع", icon: FileText },
    { value: "report", labelEn: "Reports", labelAr: "التقارير", icon: FileBarChart },
    { value: "brief", labelEn: "Policy Briefs", labelAr: "موجزات السياسات", icon: Briefcase },
    { value: "dataset", labelEn: "Datasets", labelAr: "مجموعات البيانات", icon: FileText },
    { value: "academic", labelEn: "Academic", labelAr: "أكاديمي", icon: GraduationCap },
    { value: "news", labelEn: "News", labelAr: "أخبار", icon: Newspaper },
  ];

  const sources = useMemo(() => {
    const uniqueSources = new Map();
    documents.forEach(doc => {
      if (!uniqueSources.has(doc.source.nameEn)) {
        uniqueSources.set(doc.source.nameEn, doc.source);
      }
    });
    return [{ nameEn: "all", nameAr: "جميع المصادر" }, ...Array.from(uniqueSources.values())];
  }, []);

  const years = ["all", "2024", "2023", "2022", "2021", "2020"];

  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.titleEn.toLowerCase().includes(query) ||
        doc.titleAr.includes(searchQuery) ||
        doc.abstractEn.toLowerCase().includes(query) ||
        doc.abstractAr.includes(searchQuery)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(doc => doc.type === selectedType);
    }

    // Source filter
    if (selectedSource !== "all") {
      filtered = filtered.filter(doc => doc.source.nameEn === selectedSource);
    }

    // Year filter
    if (selectedYear !== "all") {
      filtered = filtered.filter(doc => doc.date.startsWith(selectedYear));
    }

    // Sort
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "views") {
      filtered.sort((a, b) => b.views - a.views);
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedType, selectedSource, selectedYear, sortBy]);

  const getConfidenceColor = (rating: string) => {
    switch (rating) {
      case "A": return "bg-green-100 text-green-800 border-green-200";
      case "B": return "bg-blue-100 text-blue-800 border-blue-200";
      case "C": return "bg-amber-100 text-amber-800 border-amber-200";
      case "D": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "report": return FileBarChart;
      case "brief": return Briefcase;
      case "dataset": return FileText;
      case "academic": return GraduationCap;
      case "news": return Newspaper;
      default: return FileText;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#103050] to-[#0B1F33] text-white">
        <div className="container py-12">
          <Badge className="mb-4 bg-white/10 text-white border-white/20">
            {language === "ar" ? "مكتبة الأبحاث" : "Research Library"}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === "ar" ? "الأبحاث والتقارير" : "Research & Reports"}
          </h1>
          <p className="text-white/70 max-w-2xl">
            {language === "ar"
              ? "مكتبة شاملة من التقارير والتحليلات والبيانات الاقتصادية من مصادر موثوقة ومتعددة"
              : "Comprehensive library of reports, analysis, and economic data from verified and diverse sources"}
          </p>
          <div className="flex items-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{documents.length} {language === "ar" ? "وثيقة" : "documents"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{sources.length - 1} {language === "ar" ? "مصدر" : "sources"}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === "ar" ? "ابحث في التقارير والوثائق..." : "Search reports and documents..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "ar" ? "الفئة" : "Category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {language === "ar" ? cat.labelAr : cat.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "ar" ? "النوع" : "Type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {language === "ar" ? type.labelAr : type.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "ar" ? "المصدر" : "Source"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map(source => (
                      <SelectItem key={source.nameEn} value={source.nameEn}>
                        {language === "ar" ? source.nameAr : source.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "ar" ? "السنة" : "Year"} />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>
                        {year === "all" ? (language === "ar" ? "جميع السنوات" : "All Years") : year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "ar" ? "ترتيب" : "Sort"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">{language === "ar" ? "الأحدث" : "Most Recent"}</SelectItem>
                    <SelectItem value="views">{language === "ar" ? "الأكثر مشاهدة" : "Most Viewed"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results count */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {language === "ar"
                    ? `عرض ${filteredDocuments.length} من ${documents.length} وثيقة`
                    : `Showing ${filteredDocuments.length} of ${documents.length} documents`}
                </span>
                {(selectedCategory !== "all" || selectedType !== "all" || selectedSource !== "all" || selectedYear !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedType("all");
                      setSelectedSource("all");
                      setSelectedYear("all");
                    }}
                  >
                    {language === "ar" ? "مسح الفلاتر" : "Clear filters"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Documents */}
        {filteredDocuments.some(d => d.featured) && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-[#C0A030]" />
              <h2 className="text-2xl font-bold">
                {language === "ar" ? "وثائق مميزة" : "Featured Documents"}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.filter(d => d.featured).map((doc) => {
                const TypeIcon = getTypeIcon(doc.type);
                return (
                  <Card key={doc.id} className="border-2 border-[#C0A030]/30 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <TypeIcon className="h-3 w-3" />
                          {doc.category}
                        </Badge>
                        <Badge className={`${getConfidenceColor(doc.confidenceRating)} border`}>
                          {doc.confidenceRating}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {language === "ar" ? doc.titleAr : doc.titleEn}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {language === "ar" ? doc.abstractAr : doc.abstractEn}
                      </p>

                      {/* Source */}
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {language === "ar" ? doc.source.nameAr : doc.source.nameEn}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.date).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {doc.views.toLocaleString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {doc.downloadUrl && (
                          <Button size="sm" className="flex-1 gap-1">
                            <Download className="h-3 w-3" />
                            {language === "ar" ? "تحميل" : "Download"}
                          </Button>
                        )}
                        {doc.externalUrl && (
                          <Button size="sm" variant="outline" className="flex-1 gap-1" asChild>
                            <a href={doc.externalUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                              {language === "ar" ? "المصدر" : "Source"}
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Documents */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-[#107040]" />
            <h2 className="text-2xl font-bold">
              {language === "ar" ? "جميع الوثائق" : "All Documents"}
            </h2>
          </div>

          <div className="space-y-4">
            {filteredDocuments.map((doc) => {
              const TypeIcon = getTypeIcon(doc.type);
              return (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Main Content */}
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <TypeIcon className="h-3 w-3" />
                            {doc.category}
                          </Badge>
                          <Badge className={`${getConfidenceColor(doc.confidenceRating)} border text-xs`}>
                            {language === "ar" ? "الثقة" : "Confidence"}: {doc.confidenceRating}
                          </Badge>
                          {doc.regimeTag && doc.regimeTag !== "national" && (
                            <Badge variant="secondary" className="text-xs">
                              {doc.regimeTag === "aden_irg" 
                                ? (language === "ar" ? "عدن/الحكومة" : "Aden/IRG")
                                : doc.regimeTag === "sanaa_defacto"
                                ? (language === "ar" ? "صنعاء/السلطة الفعلية" : "Sana'a/DFA")
                                : (language === "ar" ? "كلاهما" : "Both")}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {doc.language === "ar" ? "عربي" : doc.language === "en" ? "English" : "AR/EN"}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold">
                          {language === "ar" ? doc.titleAr : doc.titleEn}
                        </h3>

                        {/* Abstract */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {language === "ar" ? doc.abstractAr : doc.abstractEn}
                        </p>

                        {/* Meta Row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <a 
                              href={doc.source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-[#107040] hover:underline"
                            >
                              {language === "ar" ? doc.source.nameAr : doc.source.nameEn}
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(doc.date).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {doc.views.toLocaleString()} {language === "ar" ? "مشاهدة" : "views"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            {doc.license}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-2 lg:w-32">
                        {doc.downloadUrl && (
                          <Button size="sm" className="flex-1 gap-1">
                            <Download className="h-3 w-3" />
                            {language === "ar" ? "تحميل" : "Download"}
                          </Button>
                        )}
                        {doc.externalUrl && (
                          <Button size="sm" variant="outline" className="flex-1 gap-1" asChild>
                            <a href={doc.externalUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                              {language === "ar" ? "المصدر" : "Source"}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* No Results */}
          {filteredDocuments.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === "ar" ? "لم يتم العثور على وثائق" : "No documents found"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "ar"
                    ? "جرب تغيير معايير البحث أو الفلاتر"
                    : "Try adjusting your search criteria or filters"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-br from-[#107040]/5 to-[#103050]/5 border-[#107040]/20">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              {language === "ar" 
                ? "هل لديك بحث أو تقرير للمشاركة؟"
                : "Have Research to Share?"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {language === "ar"
                ? "نرحب بمساهمات الباحثين والمؤسسات. شارك أبحاثك مع مجتمع YETO."
                : "We welcome contributions from researchers and institutions. Share your research with the YETO community."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/partner">
                  <FileText className="h-5 w-5" />
                  {language === "ar" ? "إرسال بحث" : "Submit Research"}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link href="/report-builder">
                  <TrendingUp className="h-5 w-5" />
                  {language === "ar" ? "إنشاء تقرير مخصص" : "Build Custom Report"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
