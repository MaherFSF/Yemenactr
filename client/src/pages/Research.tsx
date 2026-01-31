import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  ExternalLink,
  FileText,
  FileBarChart,
  Briefcase,
  GraduationCap,
  Newspaper,
  Calendar,
  Eye,
  Star,
  Filter,
  BookOpen,
  Building2,
  Globe,
  Rss,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { 
  researchDocuments, 
  getUniqueCategories, 
  getUniqueSources, 
  getUniqueYears,
  getUniqueTypes,
  type ResearchDocument 
} from "@/data/researchDocuments";

export default function Research() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch stats from database
  const { data: dbStats } = trpc.research.getStats.useQuery();
  
  // Fetch category stats
  const { data: dbCategoryStats } = trpc.research.getCategoryStats.useQuery();
  
  // Fetch publications from database
  const { data: dbPublications, isLoading: dbLoading } = trpc.research.search.useQuery({
    query: debouncedQuery || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    type: selectedType !== "all" ? selectedType : undefined,
    year: selectedYear !== "all" ? parseInt(selectedYear) : undefined,
    limit: 200,
  });
  
  // Fetch organizations for source filter
  const { data: dbOrganizations } = trpc.research.getOrganizations.useQuery();

  // Get unique values for filters from static data (fallback)
  const staticCategories = useMemo(() => getUniqueCategories(), []);
  const staticSources = useMemo(() => getUniqueSources(), []);
  const staticYears = useMemo(() => getUniqueYears(), []);
  const staticTypes = useMemo(() => getUniqueTypes(), []);

  // Combine database categories with static ones
  const categories = useMemo(() => {
    const dbCats = (dbCategoryStats?.map(c => c.category as string | null).filter(Boolean) || []) as string[];
    const allCats = Array.from(new Set([...staticCategories, ...dbCats]));
    return allCats.sort();
  }, [staticCategories, dbCategoryStats]);

  // Get sources from both static and database
  const sources = useMemo(() => {
    const dbSources = (dbOrganizations?.map((o: { name: string | null }) => o.name).filter((x): x is string => x !== null) || []) as string[];
    const allSources = Array.from(new Set([...staticSources, ...dbSources]));
    return allSources.sort();
  }, [staticSources, dbOrganizations]);

  // Get years from both static and database
  const years = useMemo(() => {
    const dbYears = dbPublications?.map(p => p.publicationYear?.toString()).filter(Boolean) || [];
    const allYears = Array.from(new Set([...staticYears, ...dbYears]));
    return allYears.sort((a, b) => parseInt(b) - parseInt(a));
  }, [staticYears, dbPublications]);

  const types = useMemo(() => staticTypes, []);

  const categoryLabels: Record<string, { en: string; ar: string }> = {
    "Banking": { en: "Banking", ar: "القطاع المصرفي" },
    "Monetary Policy": { en: "Monetary Policy", ar: "السياسة النقدية" },
    "Macroeconomy": { en: "Macroeconomy", ar: "الاقتصاد الكلي" },
    "Prices": { en: "Prices", ar: "الأسعار" },
    "Trade": { en: "Trade", ar: "التجارة" },
    "Food Security": { en: "Food Security", ar: "الأمن الغذائي" },
    "Aid": { en: "Aid", ar: "المساعدات" },
    "Conflict Economy": { en: "Conflict Economy", ar: "اقتصاد الصراع" },
    "Policy": { en: "Policy", ar: "السياسات" },
    "Humanitarian": { en: "Humanitarian", ar: "الإنساني" },
    "Development": { en: "Development", ar: "التنمية" },
    "Poverty": { en: "Poverty", ar: "الفقر" },
    "Labor": { en: "Labor", ar: "العمل" },
    "Energy": { en: "Energy", ar: "الطاقة" },
    "Infrastructure": { en: "Infrastructure", ar: "البنية التحتية" },
    "Agriculture": { en: "Agriculture", ar: "الزراعة" },
    "Health": { en: "Health", ar: "الصحة" },
    "Education": { en: "Education", ar: "التعليم" },
    "Governance": { en: "Governance", ar: "الحوكمة" },
    "Reconstruction": { en: "Reconstruction", ar: "إعادة الإعمار" },
    // Database categories
    "banking_sector": { en: "Banking Sector", ar: "القطاع المصرفي" },
    "monetary_policy": { en: "Monetary Policy", ar: "السياسة النقدية" },
    "macroeconomic_analysis": { en: "Macroeconomic Analysis", ar: "التحليل الاقتصادي الكلي" },
    "fiscal_policy": { en: "Fiscal Policy", ar: "السياسة المالية" },
    "trade_external": { en: "Trade & External", ar: "التجارة الخارجية" },
    "poverty_development": { en: "Poverty & Development", ar: "الفقر والتنمية" },
    "conflict_economics": { en: "Conflict Economics", ar: "اقتصاديات الصراع" },
    "humanitarian_finance": { en: "Humanitarian Finance", ar: "التمويل الإنساني" },
    "split_system_analysis": { en: "Split System Analysis", ar: "تحليل النظام المنقسم" },
    "labor_market": { en: "Labor Market", ar: "سوق العمل" },
    "food_security": { en: "Food Security", ar: "الأمن الغذائي" },
    "energy_sector": { en: "Energy Sector", ar: "قطاع الطاقة" },
    "infrastructure": { en: "Infrastructure", ar: "البنية التحتية" },
    "agriculture": { en: "Agriculture", ar: "الزراعة" },
    "health_sector": { en: "Health Sector", ar: "القطاع الصحي" },
    "education": { en: "Education", ar: "التعليم" },
    "governance": { en: "Governance", ar: "الحوكمة" },
    "sanctions_compliance": { en: "Sanctions & Compliance", ar: "العقوبات والامتثال" },
  };

  const typeLabels: Record<string, { en: string; ar: string; icon: typeof FileText }> = {
    "report": { en: "Reports", ar: "التقارير", icon: FileBarChart },
    "brief": { en: "Policy Briefs", ar: "موجزات السياسات", icon: Briefcase },
    "dataset": { en: "Datasets", ar: "مجموعات البيانات", icon: FileText },
    "academic": { en: "Academic", ar: "أكاديمي", icon: GraduationCap },
    "news": { en: "News", ar: "أخبار", icon: Newspaper },
    "analysis": { en: "Analysis", ar: "تحليل", icon: FileBarChart },
    // Database types
    "research_paper": { en: "Research Paper", ar: "ورقة بحثية", icon: GraduationCap },
    "working_paper": { en: "Working Paper", ar: "ورقة عمل", icon: FileText },
    "policy_brief": { en: "Policy Brief", ar: "موجز سياسات", icon: Briefcase },
    "technical_note": { en: "Technical Note", ar: "ملاحظة فنية", icon: FileText },
    "case_study": { en: "Case Study", ar: "دراسة حالة", icon: FileBarChart },
    "statistical_bulletin": { en: "Statistical Bulletin", ar: "نشرة إحصائية", icon: FileBarChart },
    "sanctions_notice": { en: "Sanctions Notice", ar: "إشعار عقوبات", icon: FileText },
    "presentation": { en: "Presentation", ar: "عرض تقديمي", icon: FileText },
    "evaluation_report": { en: "Evaluation Report", ar: "تقرير تقييم", icon: FileBarChart },
    "journal_article": { en: "Journal Article", ar: "مقال صحفي", icon: Newspaper },
    "book_chapter": { en: "Book Chapter", ar: "فصل كتاب", icon: BookOpen },
    "thesis": { en: "Thesis", ar: "أطروحة", icon: GraduationCap },
    "dataset_documentation": { en: "Dataset Documentation", ar: "توثيق البيانات", icon: FileText },
    "methodology_note": { en: "Methodology Note", ar: "ملاحظة منهجية", icon: FileText },
    "survey_report": { en: "Survey Report", ar: "تقرير مسح", icon: FileBarChart },
    "market_bulletin": { en: "Market Bulletin", ar: "نشرة السوق", icon: FileBarChart },
    "economic_monitor": { en: "Economic Monitor", ar: "المراقب الاقتصادي", icon: FileBarChart },
    "article_iv": { en: "Article IV", ar: "المادة الرابعة", icon: FileText },
    "country_report": { en: "Country Report", ar: "تقرير قطري", icon: FileBarChart },
  };

  // Filter static documents
  const filteredStaticDocuments = useMemo(() => {
    let filtered = [...researchDocuments];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.titleEn.toLowerCase().includes(query) ||
        doc.titleAr.includes(searchQuery) ||
        doc.abstractEn.toLowerCase().includes(query) ||
        doc.abstractAr.includes(searchQuery) ||
        doc.source.nameEn.toLowerCase().includes(query)
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
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.titleEn.localeCompare(b.titleEn));
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedType, selectedSource, selectedYear, sortBy]);

  // Combine database and static documents
  const allDocuments = useMemo(() => {
    const combined: any[] = [];
    
    // Add database publications
    if (dbPublications) {
      dbPublications.forEach(pub => {
        combined.push({
          id: `db-${pub.id}`,
          titleEn: pub.title || "",
          titleAr: pub.title || "",
          abstractEn: pub.abstract || "",
          abstractAr: pub.abstract || "",
          date: pub.publicationYear ? `${pub.publicationYear}-01-01` : "",
          category: pub.researchCategory || "Other",
          type: pub.publicationType || "report",
          source: {
            nameEn: pub.organizationName || "Unknown Source",
            nameAr: pub.organizationName || "مصدر غير معروف",
            url: pub.sourceUrl || "#",
          },
          sectors: [],
          confidenceRating: "B",
          language: "ar",
          downloadUrl: pub.sourceUrl || undefined,
          externalUrl: pub.sourceUrl || undefined,
          featured: false,
          views: pub.viewCount || 0,
          license: "Unknown",
          isFromDatabase: true,
        });
      });
    }
    
    // Add static documents if no search/filter is active
    if (!searchQuery && selectedCategory === "all" && selectedType === "all" && selectedSource === "all" && selectedYear === "all") {
      filteredStaticDocuments.forEach(doc => {
        // Check if not already in database results
        const isDuplicate = combined.some(d => 
          d.titleEn.toLowerCase() === doc.titleEn.toLowerCase()
        );
        if (!isDuplicate) {
          combined.push({ ...doc, isFromDatabase: false });
        }
      });
    }
    
    // Sort combined results
    if (sortBy === "date") {
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "views") {
      combined.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === "title") {
      combined.sort((a, b) => a.titleEn.localeCompare(b.titleEn));
    }
    
    return combined;
  }, [dbPublications, filteredStaticDocuments, searchQuery, selectedCategory, selectedType, selectedSource, selectedYear, sortBy]);

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
    return typeLabels[type]?.icon || FileText;
  };

  const handleDownload = (doc: any) => {
    const url = doc.downloadUrl || doc.externalUrl;
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleViewSource = (doc: any) => {
    const url = doc.externalUrl || doc.source?.url;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Statistics
  const stats = useMemo(() => ({
    total: dbStats?.totalPublications || researchDocuments.length,
    reports: researchDocuments.filter(d => d.type === "report").length,
    datasets: researchDocuments.filter(d => d.type === "dataset").length,
    sources: dbStats?.totalOrganizations || sources.length,
    years: years.length,
  }), [dbStats, sources, years]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2e8b6e] to-[#2d4a3e] text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="h-10 w-10 text-[#c9a227]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === "ar" ? "مكتبة الأبحاث والتقارير" : "Research & Reports Library"}
            </h1>
            <p className="text-xl text-slate-200 mb-8">
              {language === "ar" 
                ? "مجموعة شاملة من الأبحاث والتقارير والبيانات الاقتصادية من مصادر موثوقة ومتنوعة منذ 2010"
                : "Comprehensive collection of research, reports, and economic data from verified and diverse sources since 2010"}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-[#c9a227]">{stats.total}</div>
                <div className="text-sm text-slate-300">{language === "ar" ? "وثيقة" : "Documents"}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-[#c9a227]">{stats.reports}</div>
                <div className="text-sm text-slate-300">{language === "ar" ? "تقرير" : "Reports"}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-[#c9a227]">{stats.datasets}</div>
                <div className="text-sm text-slate-300">{language === "ar" ? "مجموعة بيانات" : "Datasets"}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-[#c9a227]">{stats.sources}</div>
                <div className="text-sm text-slate-300">{language === "ar" ? "مصدر" : "Sources"}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-[#c9a227]">{stats.years}</div>
                <div className="text-sm text-slate-300">{language === "ar" ? "سنة" : "Years"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Search and Filters */}
        <Card className="mb-8 border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={language === "ar" ? "ابحث في الوثائق..." : "Search documents..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                {language === "ar" ? "الفلاتر" : "Filters"}
              </Button>

              {/* Desktop Filters */}
              <div className={`flex flex-wrap gap-3 ${showFilters ? "flex" : "hidden lg:flex"}`}>
                {/* Category */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={language === "ar" ? "الفئة" : "Category"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language === "ar" ? "جميع الفئات" : "All Categories"}
                    </SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {language === "ar" ? categoryLabels[cat]?.ar || cat : categoryLabels[cat]?.en || cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Type */}
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={language === "ar" ? "النوع" : "Type"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language === "ar" ? "جميع الأنواع" : "All Types"}
                    </SelectItem>
                    {types.map(type => (
                      <SelectItem key={type} value={type}>
                        {language === "ar" ? typeLabels[type]?.ar || type : typeLabels[type]?.en || type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Source */}
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={language === "ar" ? "المصدر" : "Source"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language === "ar" ? "جميع المصادر" : "All Sources"}
                    </SelectItem>
                    {sources.map(source => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year */}
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder={language === "ar" ? "السنة" : "Year"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language === "ar" ? "جميع السنوات" : "All Years"}
                    </SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={language === "ar" ? "ترتيب" : "Sort by"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">
                      {language === "ar" ? "الأحدث" : "Newest"}
                    </SelectItem>
                    <SelectItem value="views">
                      {language === "ar" ? "الأكثر مشاهدة" : "Most Viewed"}
                    </SelectItem>
                    <SelectItem value="title">
                      {language === "ar" ? "العنوان" : "Title"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory !== "all" || selectedType !== "all" || selectedSource !== "all" || selectedYear !== "all") && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-slate-500">
                  {language === "ar" ? "الفلاتر النشطة:" : "Active filters:"}
                </span>
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory("all")}>
                    {categoryLabels[selectedCategory]?.en || selectedCategory} ×
                  </Badge>
                )}
                {selectedType !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedType("all")}>
                    {typeLabels[selectedType]?.en || selectedType} ×
                  </Badge>
                )}
                {selectedSource !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedSource("all")}>
                    {selectedSource} ×
                  </Badge>
                )}
                {selectedYear !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedYear("all")}>
                    {selectedYear} ×
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedType("all");
                    setSelectedSource("all");
                    setSelectedYear("all");
                  }}
                  className="text-xs h-6"
                >
                  {language === "ar" ? "مسح الكل" : "Clear all"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            {dbLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === "ar" ? "جاري البحث..." : "Searching..."}
              </span>
            ) : (
              language === "ar" 
                ? `عرض ${allDocuments.length} من ${stats.total} وثيقة`
                : `Showing ${allDocuments.length} of ${stats.total} documents`
            )}
          </p>
          <Button variant="outline" size="sm" className="gap-2">
            <Rss className="h-4 w-4" />
            {language === "ar" ? "تغذية RSS" : "RSS Feed"}
          </Button>
        </div>

        {/* Documents Grid */}
        <div className="grid gap-6">
          {allDocuments.map((doc) => {
            const TypeIcon = getTypeIcon(doc.type);
            return (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow border-slate-200">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {doc.featured && (
                          <Badge className="bg-[#c9a227] text-white">
                            <Star className="h-3 w-3 mr-1" />
                            {language === "ar" ? "مميز" : "Featured"}
                          </Badge>
                        )}
                        <Badge variant="outline" className={getConfidenceColor(doc.confidenceRating)}>
                          {language === "ar" ? `تصنيف ${doc.confidenceRating}` : `Rating ${doc.confidenceRating}`}
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <TypeIcon className="h-3 w-3" />
                          {language === "ar" ? typeLabels[doc.type]?.ar : typeLabels[doc.type]?.en || doc.type}
                        </Badge>
                        <Badge variant="outline">
                          {language === "ar" ? categoryLabels[doc.category]?.ar || doc.category : categoryLabels[doc.category]?.en || doc.category}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-semibold text-slate-900 mb-2 hover:text-[#2e8b6e] cursor-pointer"
                          onClick={() => handleViewSource(doc)}>
                        {language === "ar" ? doc.titleAr : doc.titleEn}
                      </h3>

                      <p className="text-slate-600 mb-4 line-clamp-2">
                        {language === "ar" ? doc.abstractAr : doc.abstractEn}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <a 
                            href={doc.source?.url || "#"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-[#2e8b6e] hover:underline"
                          >
                            {language === "ar" ? doc.source?.nameAr : doc.source?.nameEn}
                          </a>
                        </div>
                        {doc.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(doc.date).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {(doc.views || 0).toLocaleString()} {language === "ar" ? "مشاهدة" : "views"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          {doc.language === "both" 
                            ? (language === "ar" ? "عربي/إنجليزي" : "AR/EN")
                            : doc.language === "ar" 
                              ? (language === "ar" ? "عربي" : "Arabic")
                              : (language === "ar" ? "إنجليزي" : "English")}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 lg:w-40">
                      {(doc.downloadUrl || doc.externalUrl) && doc.downloadUrl !== "#" && (
                        <Button 
                          className="flex-1 bg-[#2e8b6e] hover:bg-[#2d4a3e] gap-2"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                          {language === "ar" ? "تحميل" : "Download"}
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={() => handleViewSource(doc)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        {language === "ar" ? "المصدر" : "Source"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {allDocuments.length === 0 && !dbLoading && (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {language === "ar" ? "لم يتم العثور على وثائق" : "No documents found"}
            </h3>
            <p className="text-slate-500 mb-4">
              {language === "ar" 
                ? "جرب تعديل معايير البحث أو الفلاتر"
                : "Try adjusting your search criteria or filters"}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedType("all");
                setSelectedSource("all");
                setSelectedYear("all");
              }}
            >
              {language === "ar" ? "إعادة تعيين الفلاتر" : "Reset Filters"}
            </Button>
          </Card>
        )}

        {/* Loading State */}
        {dbLoading && allDocuments.length === 0 && (
          <Card className="p-12 text-center">
            <Loader2 className="h-16 w-16 mx-auto text-[#2e8b6e] mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {language === "ar" ? "جاري تحميل الوثائق..." : "Loading documents..."}
            </h3>
          </Card>
        )}

        {/* Data Sources Section */}
        <Card className="mt-12 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#2e8b6e]" />
              {language === "ar" ? "مصادر البيانات" : "Data Sources"}
            </CardTitle>
            <CardDescription>
              {language === "ar" 
                ? "نجمع البيانات من مصادر موثوقة ومتنوعة لضمان الشفافية والمصداقية"
                : "We aggregate data from verified and diverse sources to ensure transparency and credibility"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sources.slice(0, 12).map(source => (
                <div key={source} className="text-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <p className="text-sm font-medium text-slate-700 truncate" title={source}>
                    {source}
                  </p>
                </div>
              ))}
            </div>
            {sources.length > 12 && (
              <p className="text-center text-sm text-slate-500 mt-4">
                {language === "ar" 
                  ? `و ${sources.length - 12} مصدر آخر...`
                  : `And ${sources.length - 12} more sources...`}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
