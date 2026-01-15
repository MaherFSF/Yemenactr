import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EvidencePackButton, { EvidencePackData } from "@/components/EvidencePackButton";
import { ConfidenceBadge, ConfidenceRatingLegend } from "@/components/DataCard";
import DataQualityBadge, { DevModeBanner } from "@/components/DataQualityBadge";
import InsightsTicker from "@/components/InsightsTicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  AlertTriangle,
  AlertCircle,
  Eye,
  ChevronDown,
  Info,
  RefreshCw
} from "lucide-react";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportButton } from "@/components/ExportButton";
import { DataFilters, type FilterState } from "@/components/filters/DataFilters";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { language } = useLanguage();
  const [regimeTag, setRegimeTag] = useState<"aden" | "sanaa" | "both">("both");
  const [granularity, setGranularity] = useState<"annual" | "quarterly" | "monthly">("annual");
  const [selectedIndicator, setSelectedIndicator] = useState("gdp");
  
  // Filter state with localStorage persistence
  const [filters, setFilters] = useState<FilterState>(() => {
    const saved = localStorage.getItem('yeto-dashboard-filters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultFilters();
      }
    }
    return getDefaultFilters();
  });
  
  // Helper to get default filters
  function getDefaultFilters(): FilterState {
    return {
      periodType: 'preset',
      presetPeriod: 'all',
      startDate: null,
      endDate: null,
      granularity: 'monthly',
      sectors: [],
      regimes: [],
      sources: [],
      confidenceRatings: [],
      showGaps: false,
      showProjections: false,
      compareRegimes: false
    };
  }
  
  // Handle filter changes with persistence
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    localStorage.setItem('yeto-dashboard-filters', JSON.stringify(newFilters));
    
    // Update regime tag based on filter
    if (newFilters.regimes.includes('aden_irg') && !newFilters.regimes.includes('sanaa_defacto')) {
      setRegimeTag('aden');
    } else if (newFilters.regimes.includes('sanaa_defacto') && !newFilters.regimes.includes('aden_irg')) {
      setRegimeTag('sanaa');
    } else {
      setRegimeTag('both');
    }
    
    // Update granularity
    if (newFilters.granularity === 'daily' || newFilters.granularity === 'weekly') {
      setGranularity('monthly');
    } else {
      setGranularity(newFilters.granularity as 'annual' | 'quarterly' | 'monthly');
    }
  };

  // ============================================
  // DYNAMIC DATA QUERIES
  // ============================================
  
  // Fetch Hero KPIs from database
  const { data: heroKPIs, isLoading: heroLoading, refetch: refetchHero } = trpc.dashboard.getHeroKPIs.useQuery();
  
  // Fetch GDP time series data
  const { data: gdpTimeSeries, isLoading: gdpLoading } = trpc.sectors.getIndicatorTimeSeries.useQuery({
    indicatorCodes: ['gdp_nominal', 'gdp_growth_annual'],
    regimeTag: regimeTag === 'aden' ? 'aden_irg' : regimeTag === 'sanaa' ? 'sanaa_defacto' : 'both',
    startYear: 2010,
    endYear: 2026,
  });
  
  // Fetch economic events/alerts
  const { data: eventsData, isLoading: eventsLoading } = trpc.events.list.useQuery({
    limit: 10,
  });
  
  // Fetch latest exchange rates
  const { data: fxData, isLoading: fxLoading } = trpc.sectors.getIndicatorTimeSeries.useQuery({
    indicatorCodes: ['fx_rate_aden_parallel', 'fx_rate_sanaa'],
    regimeTag: 'both',
    startYear: 2024,
    endYear: 2026,
  });

  // Transform GDP data for chart
  const gdpChartData = useMemo(() => {
    if (!gdpTimeSeries || gdpTimeSeries.length === 0) {
      // Return placeholder data while loading
      return Array.from({ length: 15 }, (_, i) => ({
        year: (2010 + i).toString(),
        aden: null,
        sanaa: null,
        unified: i < 5 ? 50000 + i * 2000 : null,
      }));
    }
    
    // Group by year
    const byYear: Record<string, { aden?: number; sanaa?: number; unified?: number }> = {};
    
    gdpTimeSeries.forEach((row: any) => {
      const year = new Date(row.date).getFullYear().toString();
      if (!byYear[year]) byYear[year] = {};
      
      const value = parseFloat(row.value);
      if (row.regimeTag === 'aden_irg') {
        byYear[year].aden = value;
      } else if (row.regimeTag === 'sanaa_defacto') {
        byYear[year].sanaa = value;
      } else if (row.regimeTag === 'mixed') {
        byYear[year].unified = value;
      }
    });
    
    // Convert to array sorted by year
    return Object.entries(byYear)
      .map(([year, values]) => ({ year, ...values }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [gdpTimeSeries]);

  // Transform events to alerts format
  const alerts = useMemo(() => {
    if (!eventsData || eventsData.length === 0) return [];
    
    return eventsData.slice(0, 5).map((event: any) => ({
      type: event.impactLevel === 'high' ? 'error' : 'warning',
      titleEn: event.titleEn,
      titleAr: event.titleAr,
      timeEn: new Date(event.eventDate).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      }),
      timeAr: new Date(event.eventDate).toLocaleDateString('ar-SA', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      }),
    }));
  }, [eventsData]);

  // Quick stats from hero KPIs
  const quickStats = useMemo(() => {
    if (!heroKPIs) return [];
    
    return [
      {
        labelEn: "Annual Inflation Rate (Aden)",
        labelAr: "معدل التضخم السنوي (عدن)",
        value: heroKPIs.inflation?.value || "N/A",
        trend: "up",
        sparkline: Array.isArray(heroKPIs.inflation?.trend) ? heroKPIs.inflation.trend : [15, 18, 20, 22, 24, 25]
      },
      {
        labelEn: "Exchange Rate (Aden)",
        labelAr: "سعر الصرف (عدن)",
        value: heroKPIs.exchangeRateAden?.value || "N/A",
        trend: "up",
        sparkline: heroKPIs.exchangeRateAden?.trend || [1500, 1550, 1600, 1620]
      },
      {
        labelEn: "Foreign Reserves",
        labelAr: "الاحتياطيات الأجنبية",
        value: heroKPIs.foreignReserves?.value || "N/A",
        trend: "warning",
        sparkline: heroKPIs.foreignReserves?.trend || [1.5, 1.4, 1.3, 1.2]
      },
    ];
  }, [heroKPIs]);

  // Watchlist from latest data
  const watchlist = useMemo(() => {
    if (!heroKPIs) return [];
    
    return [
      { 
        labelEn: "USD Exchange Rate (Aden)", 
        labelAr: "سعر صرف الدولار (عدن)", 
        value: heroKPIs.exchangeRateAden?.value?.replace('1 USD = ', '') || "N/A"
      },
      { 
        labelEn: "USD Exchange Rate (Sana'a)", 
        labelAr: "سعر صرف الدولار (صنعاء)", 
        value: heroKPIs.exchangeRateSanaa?.value?.replace('1 USD = ', '') || "N/A"
      },
      { 
        labelEn: "IDPs (UNHCR)", 
        labelAr: "النازحون داخلياً", 
        value: heroKPIs.idps?.value || "N/A"
      },
    ];
  }, [heroKPIs]);

  // Data table from time series
  const dataTable = useMemo(() => {
    if (!gdpTimeSeries || gdpTimeSeries.length === 0) return [];
    
    // Get latest records for each regime
    const latestByRegime: Record<string, any> = {};
    gdpTimeSeries.forEach((row: any) => {
      const key = `${row.regimeTag}-${new Date(row.date).getFullYear()}`;
      if (!latestByRegime[key] || new Date(row.date) > new Date(latestByRegime[key].date)) {
        latestByRegime[key] = row;
      }
    });
    
    return Object.values(latestByRegime)
      .slice(0, 4)
      .map((row: any) => ({
        year: new Date(row.date).getFullYear().toString(),
        value: `${(parseFloat(row.value) / 1000).toFixed(1)} مليار`,
        regime: row.regimeTag === 'aden_irg' ? 'عدن' : 'صنعاء',
        source: row.sourceName || 'World Bank',
        quality: row.confidenceRating === 'A' ? 'عالية' : row.confidenceRating === 'B' ? 'متوسطة' : 'منخفضة'
      }));
  }, [gdpTimeSeries]);

  // Simple sparkline component
  const MiniSparkline = ({ data, color = "#107040" }: { data: number[], color?: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="inline-block">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      </svg>
    );
  };

  // Loading skeleton for KPI cards
  const KPISkeleton = () => (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <CardContent className="p-4">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Dev Mode Banner */}
      <DevModeBanner />
      
      {/* Insights Ticker */}
      <InsightsTicker />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#103050] to-[#1a4a70] text-white py-6 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {language === "ar" ? "لوحة المعلومات الاقتصادية" : "Economic Dashboard"}
              </h1>
              <p className="text-white/80 mt-1">
                {language === "ar" 
                  ? "مؤشرات اقتصادية شاملة لليمن - بيانات حية من قاعدة البيانات" 
                  : "Comprehensive economic indicators for Yemen - Live data from database"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => refetchHero()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {language === "ar" ? "تحديث" : "Refresh"}
              </Button>
              <Badge variant="outline" className="bg-green-500/20 text-green-100 border-green-400/30">
                {language === "ar" ? "بيانات حية" : "Live Data"}
              </Badge>
              {heroKPIs?.lastUpdated && (
                <span className="text-xs text-white/60">
                  {language === "ar" ? "آخر تحديث: " : "Last updated: "}
                  {new Date(heroKPIs.lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        {/* Filters */}
        <div className="mb-6">
          <DataFilters 
            filters={filters} 
            onChange={handleFilterChange}
            compact={true}
            showPresets={true}
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {heroLoading ? (
            <>
              <KPISkeleton />
              <KPISkeleton />
              <KPISkeleton />
            </>
          ) : (
            quickStats.map((stat, index) => (
              <Card key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === "ar" ? stat.labelAr : stat.labelEn}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {stat.trend === "up" && <TrendingUp className="h-5 w-5 text-red-500" />}
                      {stat.trend === "down" && <TrendingDown className="h-5 w-5 text-green-500" />}
                      {stat.trend === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                      <MiniSparkline 
                        data={stat.sparkline as number[]} 
                        color={stat.trend === "up" ? "#ef4444" : stat.trend === "down" ? "#22c55e" : "#f59e0b"} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GDP Chart - 2 columns */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {language === "ar" ? "الناتج المحلي الإجمالي (2010-2026)" : "GDP Time Series (2010-2026)"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={regimeTag} onValueChange={(v) => setRegimeTag(v as any)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">{language === "ar" ? "الكل" : "All"}</SelectItem>
                        <SelectItem value="aden">{language === "ar" ? "عدن" : "Aden"}</SelectItem>
                        <SelectItem value="sanaa">{language === "ar" ? "صنعاء" : "Sana'a"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <ConfidenceBadge rating="B" size="sm" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {gdpLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={gdpChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}B`} />
                      <Tooltip 
                        formatter={(value: any) => value ? `$${(value/1000).toFixed(1)}B` : 'N/A'}
                        labelFormatter={(label) => `Year: ${label}`}
                      />
                      <Legend />
                      {(regimeTag === "both" || regimeTag === "aden") && (
                        <Line 
                          type="monotone" 
                          dataKey="aden" 
                          name={language === "ar" ? "عدن (IRG)" : "Aden (IRG)"} 
                          stroke="#107040" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          connectNulls
                        />
                      )}
                      {(regimeTag === "both" || regimeTag === "sanaa") && (
                        <Line 
                          type="monotone" 
                          dataKey="sanaa" 
                          name={language === "ar" ? "صنعاء (DFA)" : "Sana'a (DFA)"} 
                          stroke="#C0A030" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          connectNulls
                        />
                      )}
                      <Line 
                        type="monotone" 
                        dataKey="unified" 
                        name={language === "ar" ? "موحد (قبل 2015)" : "Unified (Pre-2015)"} 
                        stroke="#103050" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3 }}
                        connectNulls
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
                <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                  <span>
                    {language === "ar" ? "المصدر: البنك الدولي، البنك المركزي اليمني" : "Source: World Bank, CBY"}
                  </span>
                  <ExportButton 
                    data={gdpChartData}
                    filename="yemen-gdp-data"
                    title="GDP Time Series"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Alerts & Watchlist */}
          <div className="space-y-6">
            {/* Alerts */}
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  {language === "ar" ? "التنبيهات" : "Alerts"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : alerts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {language === "ar" ? "لا توجد تنبيهات حالية" : "No current alerts"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert: any, index: number) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg border ${
                          alert.type === 'error' 
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {alert.type === 'error' ? (
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {language === "ar" ? alert.titleAr : alert.titleEn}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {language === "ar" ? alert.timeAr : alert.timeEn}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Watchlist */}
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  {language === "ar" ? "قائمة المراقبة" : "Watchlist"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {heroLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {watchlist.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? item.labelAr : item.labelEn}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Table */}
        <Card className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {language === "ar" ? "بيانات الناتج المحلي الإجمالي" : "GDP Data Table"}
              </CardTitle>
              <ExportButton 
                data={dataTable}
                filename="yemen-gdp-table"
                title="GDP Data"
              />
            </div>
          </CardHeader>
          <CardContent>
            {gdpLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        {language === "ar" ? "السنة" : "Year"}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        {language === "ar" ? "القيمة" : "Value"}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        {language === "ar" ? "المنطقة" : "Region"}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        {language === "ar" ? "المصدر" : "Source"}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        {language === "ar" ? "الجودة" : "Quality"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataTable.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4">{row.year}</td>
                        <td className="py-3 px-4 font-medium">{row.value}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={
                            row.regime === 'عدن' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }>
                            {row.regime}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{row.source}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={
                            row.quality === 'عالية' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : row.quality === 'متوسطة'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }>
                            {row.quality}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confidence Rating Legend */}
        <div className="mt-6">
          <ConfidenceRatingLegend />
        </div>
      </div>
    </div>
  );
}
