import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Database, 
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function DataRepository() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedRegime, setSelectedRegime] = useState("all");
  const [selectedConfidence, setSelectedConfidence] = useState("all");
  const [showFilters, setShowFilters] = useState(true);

  // Sample data (will be replaced with tRPC queries)
  const datasets = [
    {
      id: 1,
      titleEn: "Commercial Banks Liquidity Ratios",
      titleAr: "نسب السيولة للبنوك التجارية",
      sector: "banking",
      regime: "aden",
      dataPoints: 156,
      lastUpdated: "2024-12-20",
      confidence: "high",
      source: "Central Bank of Aden",
      sourceAr: "البنك المركزي في عدن"
    },
    {
      id: 2,
      titleEn: "Import/Export Trade Volumes",
      titleAr: "أحجام التجارة الاستيراد والتصدير",
      sector: "trade",
      regime: "both",
      dataPoints: 324,
      lastUpdated: "2024-12-18",
      confidence: "high",
      source: "Yemen Customs Authority",
      sourceAr: "هيئة الجمارك اليمنية"
    },
    {
      id: 3,
      titleEn: "Poverty Rate by Governorate",
      titleAr: "معدل الفقر حسب المحافظة",
      sector: "poverty",
      regime: "both",
      dataPoints: 88,
      lastUpdated: "2024-12-15",
      confidence: "medium",
      source: "World Bank / UNICEF",
      sourceAr: "البنك الدولي / اليونيسف"
    },
    {
      id: 4,
      titleEn: "Banking Sector NPL Ratios",
      titleAr: "نسب القروض المتعثرة في القطاع المصرفي",
      sector: "banking",
      regime: "sanaa",
      dataPoints: 92,
      lastUpdated: "2024-12-10",
      confidence: "medium",
      source: "Central Bank of Yemen (Sana'a)",
      sourceAr: "البنك المركزي اليمني (صنعاء)"
    },
    {
      id: 5,
      titleEn: "Humanitarian Aid Distribution",
      titleAr: "توزيع المساعدات الإنسانية",
      sector: "poverty",
      regime: "both",
      dataPoints: 245,
      lastUpdated: "2024-12-22",
      confidence: "high",
      source: "UN OCHA",
      sourceAr: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية"
    },
    {
      id: 6,
      titleEn: "Port Operations Statistics",
      titleAr: "إحصائيات عمليات الموانئ",
      sector: "trade",
      regime: "aden",
      dataPoints: 178,
      lastUpdated: "2024-12-19",
      confidence: "high",
      source: "Aden Port Authority",
      sourceAr: "هيئة ميناء عدن"
    },
  ];

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = searchQuery === "" || 
      (language === "ar" ? dataset.titleAr : dataset.titleEn).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === "all" || dataset.sector === selectedSector;
    const matchesRegime = selectedRegime === "all" || dataset.regime === selectedRegime || dataset.regime === "both";
    const matchesConfidence = selectedConfidence === "all" || dataset.confidence === selectedConfidence;
    
    return matchesSearch && matchesSector && matchesRegime && matchesConfidence;
  });

  const getConfidenceBadge = (confidence: string) => {
    if (confidence === "high") {
      return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> {language === "ar" ? "عالية" : "High"}</Badge>;
    } else if (confidence === "medium") {
      return <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" /> {language === "ar" ? "متوسطة" : "Medium"}</Badge>;
    } else {
      return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" /> {language === "ar" ? "منخفضة" : "Low"}</Badge>;
    }
  };

  const getRegimeBadge = (regime: string) => {
    if (regime === "aden") {
      return <Badge variant="default">Aden</Badge>;
    } else if (regime === "sanaa") {
      return <Badge variant="secondary">Sana'a</Badge>;
    } else {
      return <Badge variant="outline">{language === "ar" ? "كلاهما" : "Both"}</Badge>;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <Badge variant="outline" className="text-sm">
                {language === "ar" ? "مستودع البيانات" : "Data Repository"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {language === "ar" 
                ? "مستودع البيانات الاقتصادية"
                : "Economic Data Repository"}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {language === "ar"
                ? "استكشف وقم بتنزيل مجموعات البيانات الاقتصادية الموثقة مع تتبع كامل للمصادر وتقييمات الثقة"
                : "Explore and download verified economic datasets with complete source attribution and confidence ratings"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Search and Filter Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {language === "ar" ? "البحث والتصفية" : "Search & Filter"}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === "ar" ? "ابحث في مجموعات البيانات..." : "Search datasets..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "القطاع" : "Sector"}
                  </label>
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "ar" ? "جميع القطاعات" : "All Sectors"}</SelectItem>
                      <SelectItem value="banking">{language === "ar" ? "المصرفي والمالي" : "Banking & Finance"}</SelectItem>
                      <SelectItem value="trade">{language === "ar" ? "التجارة" : "Trade & Commerce"}</SelectItem>
                      <SelectItem value="poverty">{language === "ar" ? "الفقر والتنمية" : "Poverty & Development"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "النظام" : "Regime"}
                  </label>
                  <Select value={selectedRegime} onValueChange={setSelectedRegime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "ar" ? "جميع الأنظمة" : "All Regimes"}</SelectItem>
                      <SelectItem value="aden">Aden</SelectItem>
                      <SelectItem value="sanaa">Sana'a</SelectItem>
                      <SelectItem value="both">{language === "ar" ? "كلاهما" : "Both"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "مستوى الثقة" : "Confidence Level"}
                  </label>
                  <Select value={selectedConfidence} onValueChange={setSelectedConfidence}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "ar" ? "جميع المستويات" : "All Levels"}</SelectItem>
                      <SelectItem value="high">{language === "ar" ? "عالية" : "High"}</SelectItem>
                      <SelectItem value="medium">{language === "ar" ? "متوسطة" : "Medium"}</SelectItem>
                      <SelectItem value="low">{language === "ar" ? "منخفضة" : "Low"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            {language === "ar" 
              ? `عرض ${filteredDatasets.length} من ${datasets.length} مجموعة بيانات`
              : `Showing ${filteredDatasets.length} of ${datasets.length} datasets`}
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {language === "ar" ? "تصدير النتائج" : "Export Results"}
          </Button>
        </div>

        {/* Datasets Grid */}
        <div className="grid gap-6">
          {filteredDatasets.map((dataset) => (
            <Card key={dataset.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {language === "ar" ? dataset.titleAr : dataset.titleEn}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getRegimeBadge(dataset.regime)}
                      {getConfidenceBadge(dataset.confidence)}
                      <Badge variant="outline" className="gap-1">
                        <Database className="h-3 w-3" />
                        {dataset.dataPoints} {language === "ar" ? "نقطة بيانات" : "data points"}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {language === "ar" ? dataset.sourceAr : dataset.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {language === "ar" ? "آخر تحديث:" : "Updated:"} {dataset.lastUpdated}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {language === "ar" ? "عرض" : "View"}
                    </Button>
                    <Button size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      {language === "ar" ? "تحميل" : "Download"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredDatasets.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === "ar" ? "لم يتم العثور على نتائج" : "No Results Found"}
              </h3>
              <p className="text-muted-foreground">
                {language === "ar"
                  ? "حاول تعديل معايير البحث أو التصفية"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
