/**
 * Historical Report Archive Page
 * 
 * Searchable archive of all auto-generated reports with version comparison
 * to track economic trends over time.
 */

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  FileText, 
  Calendar, 
  Download, 
  GitCompare, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Filter,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Types
interface ArchivedReport {
  id: string;
  reportType: "monthly" | "quarterly" | "annual" | "special" | "custom";
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  periodStart: Date;
  periodEnd: Date;
  version: number;
  keyMetrics: {
    exchangeRateAden: number;
    exchangeRateSanaa: number;
    spreadPercentage: number;
    gdpEstimate?: number;
    inflationRate?: number;
    humanitarianFunding?: number;
    eventCount: number;
    dataQualityScore: number;
  };
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
}

// Generate sample reports for demonstration
function generateSampleReports(): ArchivedReport[] {
  const reports: ArchivedReport[] = [];
  
  for (let year = 2015; year <= 2026; year++) {
    for (let month = 1; month <= 12; month++) {
      if (year === 2026 && month > 1) break;
      
      const periodStart = new Date(year, month - 1, 1);
      const periodEnd = new Date(year, month, 0);
      
      const baseAdenRate = 250 + (year - 2015) * 150 + Math.random() * 50;
      const baseSanaaRate = 250 + (year - 2015) * 30 + Math.random() * 20;
      const spread = ((baseAdenRate - baseSanaaRate) / baseSanaaRate) * 100;
      
      reports.push({
        id: `monthly_${year}_${month.toString().padStart(2, '0')}`,
        reportType: "monthly",
        title: `Yemen Economic Monitor - ${new Date(year, month - 1).toLocaleString('en', { month: 'long', year: 'numeric' })}`,
        titleAr: `مراقب الاقتصاد اليمني - ${new Date(year, month - 1).toLocaleString('ar', { month: 'long', year: 'numeric' })}`,
        description: `Monthly economic analysis covering exchange rates, inflation, and key economic indicators.`,
        descriptionAr: `تحليل اقتصادي شهري يغطي أسعار الصرف والتضخم والمؤشرات الاقتصادية الرئيسية.`,
        periodStart,
        periodEnd,
        version: 1,
        keyMetrics: {
          exchangeRateAden: Math.round(baseAdenRate),
          exchangeRateSanaa: Math.round(baseSanaaRate),
          spreadPercentage: Math.round(spread * 10) / 10,
          gdpEstimate: 20000000000 - (year - 2015) * 1500000000,
          inflationRate: 10 + (year - 2015) * 3 + Math.random() * 5,
          humanitarianFunding: 2000000000 + Math.random() * 1000000000,
          eventCount: Math.floor(10 + Math.random() * 20),
          dataQualityScore: 0.75 + Math.random() * 0.2,
        },
        isPublished: true,
        publishedAt: new Date(year, month, 5),
        createdAt: new Date(year, month, 1),
      });
    }
    
    // Quarterly reports
    for (let quarter = 1; quarter <= 4; quarter++) {
      if (year === 2026 && quarter > 1) break;
      
      const periodStart = new Date(year, (quarter - 1) * 3, 1);
      const periodEnd = new Date(year, quarter * 3, 0);
      
      const baseAdenRate = 250 + (year - 2015) * 150 + Math.random() * 50;
      const baseSanaaRate = 250 + (year - 2015) * 30 + Math.random() * 20;
      const spread = ((baseAdenRate - baseSanaaRate) / baseSanaaRate) * 100;
      
      reports.push({
        id: `quarterly_${year}_Q${quarter}`,
        reportType: "quarterly",
        title: `Yemen Economic Quarterly Review - Q${quarter} ${year}`,
        titleAr: `المراجعة الاقتصادية الفصلية لليمن - الربع ${quarter} ${year}`,
        description: `Comprehensive quarterly analysis including sectoral breakdowns and forecasts.`,
        descriptionAr: `تحليل فصلي شامل يشمل التحليلات القطاعية والتوقعات.`,
        periodStart,
        periodEnd,
        version: 1,
        keyMetrics: {
          exchangeRateAden: Math.round(baseAdenRate),
          exchangeRateSanaa: Math.round(baseSanaaRate),
          spreadPercentage: Math.round(spread * 10) / 10,
          gdpEstimate: 20000000000 - (year - 2015) * 1500000000,
          inflationRate: 10 + (year - 2015) * 3 + Math.random() * 5,
          humanitarianFunding: 2000000000 + Math.random() * 1000000000,
          eventCount: Math.floor(30 + Math.random() * 50),
          dataQualityScore: 0.8 + Math.random() * 0.15,
        },
        isPublished: true,
        publishedAt: new Date(year, quarter * 3, 15),
        createdAt: new Date(year, quarter * 3, 1),
      });
    }
    
    // Annual report
    if (year < 2026) {
      const baseAdenRate = 250 + (year - 2015) * 150;
      const baseSanaaRate = 250 + (year - 2015) * 30;
      const spread = ((baseAdenRate - baseSanaaRate) / baseSanaaRate) * 100;
      
      reports.push({
        id: `annual_${year}`,
        reportType: "annual",
        title: `Yemen Economic Annual Report ${year}`,
        titleAr: `التقرير الاقتصادي السنوي لليمن ${year}`,
        description: `Comprehensive annual review of Yemen's economic performance and outlook.`,
        descriptionAr: `مراجعة سنوية شاملة للأداء الاقتصادي اليمني والتوقعات.`,
        periodStart: new Date(year, 0, 1),
        periodEnd: new Date(year, 11, 31),
        version: 1,
        keyMetrics: {
          exchangeRateAden: Math.round(baseAdenRate),
          exchangeRateSanaa: Math.round(baseSanaaRate),
          spreadPercentage: Math.round(spread * 10) / 10,
          gdpEstimate: 20000000000 - (year - 2015) * 1500000000,
          inflationRate: 10 + (year - 2015) * 3,
          humanitarianFunding: 2500000000 + Math.random() * 500000000,
          eventCount: Math.floor(150 + Math.random() * 100),
          dataQualityScore: 0.85 + Math.random() * 0.1,
        },
        isPublished: true,
        publishedAt: new Date(year + 1, 1, 15),
        createdAt: new Date(year + 1, 0, 15),
      });
    }
  }
  
  return reports.sort((a, b) => b.periodEnd.getTime() - a.periodEnd.getTime());
}

export default function ReportArchive() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportType, setReportType] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const itemsPerPage = 12;

  const isRTL = language === "ar";
  const allReports = useMemo(() => generateSampleReports(), []);

  // Filter reports
  const filteredReports = useMemo(() => {
    let filtered = allReports;
    
    if (reportType !== "all") {
      filtered = filtered.filter(r => r.reportType === reportType);
    }
    
    if (selectedYear !== "all") {
      const year = parseInt(selectedYear);
      filtered = filtered.filter(r => r.periodEnd.getFullYear() === year);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.titleAr.includes(searchQuery) ||
        r.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [allReports, reportType, selectedYear, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    const byYear: Record<number, number> = {};
    
    allReports.forEach(r => {
      byType[r.reportType] = (byType[r.reportType] || 0) + 1;
      const year = r.periodEnd.getFullYear();
      byYear[year] = (byYear[year] || 0) + 1;
    });
    
    return { byType, byYear, total: allReports.length };
  }, [allReports]);

  // Years for filter
  const years = useMemo(() => {
    const uniqueYears = new Set(allReports.map(r => r.periodEnd.getFullYear()));
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [allReports]);

  // Toggle report selection for comparison
  const toggleReportSelection = (reportId: string) => {
    setSelectedReports(prev => {
      if (prev.includes(reportId)) {
        return prev.filter(id => id !== reportId);
      }
      if (prev.length >= 2) {
        return [prev[1], reportId];
      }
      return [...prev, reportId];
    });
  };

  // Get selected reports for comparison
  const comparisonReports = useMemo(() => {
    return selectedReports.map(id => allReports.find(r => r.id === id)).filter(Boolean) as ArchivedReport[];
  }, [selectedReports, allReports]);

  // Calculate comparison changes
  const comparisonChanges = useMemo(() => {
    if (comparisonReports.length !== 2) return [];
    
    const [report1, report2] = comparisonReports;
    const changes = [];
    
    // Exchange rate Aden
    const adenChange = report2.keyMetrics.exchangeRateAden - report1.keyMetrics.exchangeRateAden;
    const adenChangePercent = (adenChange / report1.keyMetrics.exchangeRateAden) * 100;
    changes.push({
      field: isRTL ? "سعر الصرف (عدن)" : "Exchange Rate (Aden)",
      value1: report1.keyMetrics.exchangeRateAden,
      value2: report2.keyMetrics.exchangeRateAden,
      change: adenChange,
      changePercent: adenChangePercent,
      unit: "YER",
    });
    
    // Exchange rate Sanaa
    const sanaaChange = report2.keyMetrics.exchangeRateSanaa - report1.keyMetrics.exchangeRateSanaa;
    const sanaaChangePercent = (sanaaChange / report1.keyMetrics.exchangeRateSanaa) * 100;
    changes.push({
      field: isRTL ? "سعر الصرف (صنعاء)" : "Exchange Rate (Sana'a)",
      value1: report1.keyMetrics.exchangeRateSanaa,
      value2: report2.keyMetrics.exchangeRateSanaa,
      change: sanaaChange,
      changePercent: sanaaChangePercent,
      unit: "YER",
    });
    
    // Spread
    const spreadChange = report2.keyMetrics.spreadPercentage - report1.keyMetrics.spreadPercentage;
    changes.push({
      field: isRTL ? "الفارق بين المنطقتين" : "Aden-Sana'a Spread",
      value1: report1.keyMetrics.spreadPercentage,
      value2: report2.keyMetrics.spreadPercentage,
      change: spreadChange,
      changePercent: null,
      unit: "%",
    });
    
    // Inflation
    if (report1.keyMetrics.inflationRate && report2.keyMetrics.inflationRate) {
      const inflationChange = report2.keyMetrics.inflationRate - report1.keyMetrics.inflationRate;
      changes.push({
        field: isRTL ? "معدل التضخم" : "Inflation Rate",
        value1: report1.keyMetrics.inflationRate,
        value2: report2.keyMetrics.inflationRate,
        change: inflationChange,
        changePercent: null,
        unit: "%",
      });
    }
    
    return changes;
  }, [comparisonReports, isRTL]);

  const getReportTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      monthly: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      quarterly: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      annual: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      special: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      custom: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    const labels: Record<string, { en: string; ar: string }> = {
      monthly: { en: "Monthly", ar: "شهري" },
      quarterly: { en: "Quarterly", ar: "فصلي" },
      annual: { en: "Annual", ar: "سنوي" },
      special: { en: "Special", ar: "خاص" },
      custom: { en: "Custom", ar: "مخصص" },
    };
    return (
      <Badge className={colors[type] || colors.custom}>
        {labels[type]?.[language] || type}
      </Badge>
    );
  };

  const getQualityBadge = (score: number) => {
    if (score >= 0.9) return <Badge className="bg-green-500">A</Badge>;
    if (score >= 0.8) return <Badge className="bg-blue-500">B</Badge>;
    if (score >= 0.7) return <Badge className="bg-yellow-500">C</Badge>;
    if (score >= 0.6) return <Badge className="bg-orange-500">D</Badge>;
    return <Badge className="bg-red-500">E</Badge>;
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isRTL ? "أرشيف التقارير" : "Report Archive"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? "استعرض جميع التقارير الاقتصادية المنشورة منذ 2015 وقارن بين الفترات المختلفة"
              : "Browse all published economic reports since 2015 and compare across different periods"}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "إجمالي التقارير" : "Total Reports"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byType.monthly || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تقارير شهرية" : "Monthly Reports"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byType.quarterly || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تقارير فصلية" : "Quarterly Reports"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byType.annual || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تقارير سنوية" : "Annual Reports"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={isRTL ? "البحث في التقارير..." : "Search reports..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={isRTL ? "نوع التقرير" : "Report Type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "جميع الأنواع" : "All Types"}</SelectItem>
                  <SelectItem value="monthly">{isRTL ? "شهري" : "Monthly"}</SelectItem>
                  <SelectItem value="quarterly">{isRTL ? "فصلي" : "Quarterly"}</SelectItem>
                  <SelectItem value="annual">{isRTL ? "سنوي" : "Annual"}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={isRTL ? "السنة" : "Year"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "جميع السنوات" : "All Years"}</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant={selectedReports.length === 2 ? "default" : "outline"}
                onClick={() => setShowComparison(true)}
                disabled={selectedReports.length !== 2}
              >
                <GitCompare className="h-4 w-4 mr-2" />
                {isRTL ? "مقارنة" : "Compare"} ({selectedReports.length}/2)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {paginatedReports.map((report) => (
            <Card 
              key={report.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedReports.includes(report.id) ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => toggleReportSelection(report.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  {getReportTypeBadge(report.reportType)}
                  {getQualityBadge(report.keyMetrics.dataQualityScore)}
                </div>
                <CardTitle className="text-lg mt-2">
                  {isRTL ? report.titleAr : report.title}
                </CardTitle>
                <CardDescription>
                  {new Date(report.periodStart).toLocaleDateString(isRTL ? 'ar' : 'en', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                  {' - '}
                  {new Date(report.periodEnd).toLocaleDateString(isRTL ? 'ar' : 'en', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isRTL ? "عدن" : "Aden"}
                    </span>
                    <span className="font-medium">
                      {report.keyMetrics.exchangeRateAden.toLocaleString()} YER
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isRTL ? "صنعاء" : "Sana'a"}
                    </span>
                    <span className="font-medium">
                      {report.keyMetrics.exchangeRateSanaa.toLocaleString()} YER
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isRTL ? "الفارق" : "Spread"}
                    </span>
                    <span className={`font-medium ${
                      report.keyMetrics.spreadPercentage > 100 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {report.keyMetrics.spreadPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isRTL ? "الأحداث" : "Events"}
                    </span>
                    <span className="font-medium">{report.keyMetrics.eventCount}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-1" />
                    {isRTL ? "عرض" : "View"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {isRTL 
                ? `صفحة ${currentPage} من ${totalPages}`
                : `Page ${currentPage} of ${totalPages}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Comparison Dialog */}
        <Dialog open={showComparison} onOpenChange={setShowComparison}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? "مقارنة التقارير" : "Report Comparison"}
              </DialogTitle>
              <DialogDescription>
                {comparisonReports.length === 2 && (
                  <>
                    {isRTL ? comparisonReports[0].titleAr : comparisonReports[0].title}
                    {' vs '}
                    {isRTL ? comparisonReports[1].titleAr : comparisonReports[1].title}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            {comparisonReports.length === 2 && (
              <div className="space-y-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">{isRTL ? "المؤشر" : "Indicator"}</th>
                      <th className="text-right py-2">
                        {new Date(comparisonReports[0].periodEnd).toLocaleDateString(isRTL ? 'ar' : 'en', { month: 'short', year: 'numeric' })}
                      </th>
                      <th className="text-right py-2">
                        {new Date(comparisonReports[1].periodEnd).toLocaleDateString(isRTL ? 'ar' : 'en', { month: 'short', year: 'numeric' })}
                      </th>
                      <th className="text-right py-2">{isRTL ? "التغير" : "Change"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonChanges.map((change, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{change.field}</td>
                        <td className="text-right py-2">
                          {typeof change.value1 === 'number' ? change.value1.toLocaleString() : change.value1} {change.unit}
                        </td>
                        <td className="text-right py-2">
                          {typeof change.value2 === 'number' ? change.value2.toLocaleString() : change.value2} {change.unit}
                        </td>
                        <td className="text-right py-2">
                          <span className={`flex items-center justify-end gap-1 ${
                            change.change > 0 ? 'text-red-500' : change.change < 0 ? 'text-green-500' : ''
                          }`}>
                            {change.change > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : change.change < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                            {change.change > 0 ? '+' : ''}{change.change.toFixed(1)}
                            {change.changePercent !== null && (
                              <span className="text-xs">
                                ({change.changePercent > 0 ? '+' : ''}{change.changePercent.toFixed(1)}%)
                              </span>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowComparison(false)}>
                    {isRTL ? "إغلاق" : "Close"}
                  </Button>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    {isRTL ? "تصدير المقارنة" : "Export Comparison"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
}
