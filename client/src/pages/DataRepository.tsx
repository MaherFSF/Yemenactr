import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  ChevronUp,
  RefreshCw
} from "lucide-react";

// Dataset type from API
interface Dataset {
  id: number;
  code: string;
  titleEn: string;
  titleAr: string;
  sector: string;
  descriptionEn?: string;
  descriptionAr?: string;
  dataPoints: number;
  lastUpdated: string | null;
  confidence: string;
  regime: string;
  source: string;
  sourceAr: string;
  unit?: string;
  frequency?: string;
}

export default function DataRepository() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedRegime, setSelectedRegime] = useState("all");
  const [selectedConfidence, setSelectedConfidence] = useState("all");
  const [showFilters, setShowFilters] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  // Fetch datasets from database
  const { data: datasets, isLoading, refetch } = trpc.datasets.list.useQuery({
    sector: selectedSector === "all" ? undefined : selectedSector,
    regime: selectedRegime === "all" ? undefined : selectedRegime as "aden_irg" | "sanaa_defacto" | "both",
    confidence: selectedConfidence === "all" ? undefined : (selectedConfidence === "high" ? "A" : selectedConfidence === "medium" ? "B" : "C") as "A" | "B" | "C" | "D",
    search: searchQuery || undefined,
    limit: 50,
  });

  // Fetch data for selected dataset
  const { data: datasetData, isLoading: dataLoading } = trpc.datasets.getData.useQuery({
    indicatorCode: selectedDataset?.code || "",
    limit: 100,
  }, {
    enabled: !!selectedDataset?.code,
  });

  // Download dataset as CSV
  const handleDownload = (dataset: Dataset, format: 'csv' | 'json' = 'csv') => {
    if (!datasetData || datasetData.length === 0) {
      alert(language === 'ar' ? 'لا توجد بيانات للتحميل' : 'No data available to download');
      return;
    }
    
    if (format === 'csv') {
      const csvContent = convertToCSV(datasetData);
      downloadFile(csvContent, `${dataset.titleEn.replace(/\s+/g, '_')}.csv`, 'text/csv');
    } else {
      const jsonContent = JSON.stringify(datasetData, null, 2);
      downloadFile(jsonContent, `${dataset.titleEn.replace(/\s+/g, '_')}.json`, 'application/json');
    }
    
    alert(language === 'ar' ? `تم تحميل ${dataset.titleAr} بنجاح` : `${dataset.titleEn} downloaded successfully`);
  };

  // Convert data to CSV format
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };

  // Download file helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // View dataset preview
  const handleView = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setViewDialogOpen(true);
  };

  // Filter datasets by search query (client-side for instant feedback)
  const filteredDatasets = useMemo(() => {
    if (!datasets) return [];
    
    return datasets.filter((dataset: Dataset) => {
      const matchesSearch = searchQuery === "" || 
        (language === "ar" ? dataset.titleAr : dataset.titleEn).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [datasets, searchQuery, language]);

  const getConfidenceBadge = (confidence: string) => {
    if (confidence === "high") {
      return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" /> {language === "ar" ? "عالية" : "High"}</Badge>;
    } else if (confidence === "medium") {
      return <Badge variant="secondary" className="gap-1 bg-amber-500"><AlertCircle className="h-3 w-3" /> {language === "ar" ? "متوسطة" : "Medium"}</Badge>;
    } else {
      return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" /> {language === "ar" ? "منخفضة" : "Low"}</Badge>;
    }
  };

  const getRegimeBadge = (regime: string) => {
    if (regime === "aden") {
      return <Badge variant="default" className="bg-[#107040]">Aden (IRG)</Badge>;
    } else if (regime === "sanaa") {
      return <Badge variant="secondary" className="bg-[#C0A030]">Sana'a (DFA)</Badge>;
    } else {
      return <Badge variant="outline">{language === "ar" ? "كلاهما" : "Both"}</Badge>;
    }
  };

  // Loading skeleton
  const DatasetSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );

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
              <Badge variant="default" className="bg-green-600 text-sm">
                {language === "ar" ? "بيانات حية" : "Live Data"}
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
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                {datasets?.length || 0} {language === "ar" ? "مجموعة بيانات" : "datasets"}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {datasets?.reduce((sum: number, d: Dataset) => sum + d.dataPoints, 0) || 0} {language === "ar" ? "نقطة بيانات" : "data points"}
              </span>
            </div>
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
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refetch()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {language === "ar" ? "تحديث" : "Refresh"}
                </Button>
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
                      <SelectItem value="monetary">{language === "ar" ? "السياسة النقدية" : "Monetary Policy"}</SelectItem>
                      <SelectItem value="fiscal">{language === "ar" ? "السياسة المالية" : "Fiscal Policy"}</SelectItem>
                      <SelectItem value="humanitarian">{language === "ar" ? "الإنسانية" : "Humanitarian"}</SelectItem>
                      <SelectItem value="food_security">{language === "ar" ? "الأمن الغذائي" : "Food Security"}</SelectItem>
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
                      <SelectItem value="aden_irg">Aden (IRG)</SelectItem>
                      <SelectItem value="sanaa_defacto">Sana'a (DFA)</SelectItem>
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
                      <SelectItem value="high">{language === "ar" ? "عالية (A)" : "High (A)"}</SelectItem>
                      <SelectItem value="medium">{language === "ar" ? "متوسطة (B)" : "Medium (B)"}</SelectItem>
                      <SelectItem value="low">{language === "ar" ? "منخفضة (C/D)" : "Low (C/D)"}</SelectItem>
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
            {isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              language === "ar" 
                ? `عرض ${filteredDatasets.length} مجموعة بيانات`
                : `Showing ${filteredDatasets.length} datasets`
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {language === "ar" ? "تصدير النتائج" : "Export Results"}
          </Button>
        </div>

        {/* Datasets Grid */}
        <div className="grid gap-6">
          {isLoading ? (
            <>
              <DatasetSkeleton />
              <DatasetSkeleton />
              <DatasetSkeleton />
            </>
          ) : filteredDatasets.length === 0 ? (
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
          ) : (
            filteredDatasets.map((dataset: Dataset) => (
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
                        {dataset.frequency && (
                          <Badge variant="outline" className="gap-1">
                            {dataset.frequency}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {language === "ar" ? dataset.sourceAr : dataset.source}
                        </span>
                        {dataset.lastUpdated && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {language === "ar" ? "آخر تحديث:" : "Updated:"} {dataset.lastUpdated}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleView(dataset)}>
                        <TrendingUp className="h-4 w-4" />
                        {language === "ar" ? "عرض" : "View"}
                      </Button>
                      <Button size="sm" className="gap-2" onClick={() => {
                        setSelectedDataset(dataset);
                        // Wait for data to load then download
                        setTimeout(() => handleDownload(dataset, 'csv'), 500);
                      }}>
                        <Download className="h-4 w-4" />
                        CSV
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                        setSelectedDataset(dataset);
                        setTimeout(() => handleDownload(dataset, 'json'), 500);
                      }}>
                        JSON
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* View Dataset Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDataset && (language === 'ar' ? selectedDataset.titleAr : selectedDataset.titleEn)}
            </DialogTitle>
            <DialogDescription>
              {selectedDataset && (
                <span className="flex items-center gap-4 mt-2">
                  <span>{language === 'ar' ? selectedDataset.sourceAr : selectedDataset.source}</span>
                  <span>•</span>
                  <span>{selectedDataset.dataPoints} {language === 'ar' ? 'نقطة بيانات' : 'data points'}</span>
                  {selectedDataset.lastUpdated && (
                    <>
                      <span>•</span>
                      <span>{language === 'ar' ? 'آخر تحديث:' : 'Updated:'} {selectedDataset.lastUpdated}</span>
                    </>
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDataset && (
            <div className="mt-4">
              {dataLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : datasetData && datasetData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                      <TableHead>{language === 'ar' ? 'القيمة' : 'Value'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الوحدة' : 'Unit'}</TableHead>
                      <TableHead>{language === 'ar' ? 'النظام' : 'Regime'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الثقة' : 'Confidence'}</TableHead>
                      <TableHead>{language === 'ar' ? 'المصدر' : 'Source'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datasetData.slice(0, 20).map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell className="font-mono">{row.value?.toLocaleString()}</TableCell>
                        <TableCell>{row.unit || '-'}</TableCell>
                        <TableCell>
                          {row.regime === 'aden_irg' ? 'Aden' : row.regime === 'sanaa_defacto' ? "Sana'a" : 'Mixed'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.confidence === 'A' ? 'default' : row.confidence === 'B' ? 'secondary' : 'outline'}>
                            {row.confidence}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {language === 'ar' ? row.sourceAr : row.source}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'ar' ? 'لا توجد بيانات متاحة' : 'No data available'}
                </div>
              )}
              
              {datasetData && datasetData.length > 20 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? `عرض 20 من ${datasetData.length} سجل. قم بتحميل الملف للحصول على جميع البيانات.`
                    : `Showing 20 of ${datasetData.length} records. Download the file for all data.`}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
