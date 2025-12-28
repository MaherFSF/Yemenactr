import { useState, useMemo } from "react";
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
} from "lucide-react";
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

  // Get unique values for filters from the data
  const categories = useMemo(() => getUniqueCategories(), []);
  const sources = useMemo(() => getUniqueSources(), []);
  const years = useMemo(() => getUniqueYears(), []);
  const types = useMemo(() => getUniqueTypes(), []);

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
  };

  const typeLabels: Record<string, { en: string; ar: string; icon: typeof FileText }> = {
    "report": { en: "Reports", ar: "التقارير", icon: FileBarChart },
    "brief": { en: "Policy Briefs", ar: "موجزات السياسات", icon: Briefcase },
    "dataset": { en: "Datasets", ar: "مجموعات البيانات", icon: FileText },
    "academic": { en: "Academic", ar: "أكاديمي", icon: GraduationCap },
    "news": { en: "News", ar: "أخبار", icon: Newspaper },
    "analysis": { en: "Analysis", ar: "تحليل", icon: FileBarChart },
  };

  const filteredDocuments = useMemo(() => {
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

  const handleDownload = (doc: ResearchDocument) => {
    const url = doc.downloadUrl || doc.externalUrl;
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleViewSource = (doc: ResearchDocument) => {
    const url = doc.externalUrl || doc.source.url;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Statistics
  const stats = useMemo(() => ({
    total: researchDocuments.length,
    reports: researchDocuments.filter(d => d.type === "report").length,
    datasets: researchDocuments.filter(d => d.type === "dataset").length,
    sources: sources.length,
    years: years.length,
  }), [sources, years]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1a365d] to-[#2d4a3e] text-white py-16">
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
                        {language === "ar" ? categoryLabels[cat]?.ar || cat : cat}
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
                    {selectedCategory} ×
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
            {language === "ar" 
              ? `عرض ${filteredDocuments.length} من ${researchDocuments.length} وثيقة`
              : `Showing ${filteredDocuments.length} of ${researchDocuments.length} documents`}
          </p>
          <Button variant="outline" size="sm" className="gap-2">
            <Rss className="h-4 w-4" />
            {language === "ar" ? "تغذية RSS" : "RSS Feed"}
          </Button>
        </div>

        {/* Documents Grid */}
        <div className="grid gap-6">
          {filteredDocuments.map((doc) => {
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
                          {language === "ar" ? categoryLabels[doc.category]?.ar || doc.category : doc.category}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-semibold text-slate-900 mb-2 hover:text-[#1a365d] cursor-pointer"
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
                            href={doc.source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-[#1a365d] hover:underline"
                          >
                            {language === "ar" ? doc.source.nameAr : doc.source.nameEn}
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(doc.date).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {doc.views.toLocaleString()} {language === "ar" ? "مشاهدة" : "views"}
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
                          className="flex-1 bg-[#1a365d] hover:bg-[#2d4a3e] gap-2"
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
        {filteredDocuments.length === 0 && (
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

        {/* Load More */}
        {filteredDocuments.length > 0 && filteredDocuments.length < researchDocuments.length && (
          <div className="text-center mt-8">
            <p className="text-slate-500 mb-4">
              {language === "ar" 
                ? `عرض ${filteredDocuments.length} من ${researchDocuments.length} وثيقة`
                : `Showing ${filteredDocuments.length} of ${researchDocuments.length} documents`}
            </p>
          </div>
        )}

        {/* Data Sources Section */}
        <Card className="mt-12 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#1a365d]" />
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
