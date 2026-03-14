import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EvidencePackButton from "@/components/EvidencePackButton";
import { ConfidenceBadge } from "@/components/DataCard";
import InsightsTicker from "@/components/InsightsTicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
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
  Loader2,
  Database
} from "lucide-react";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { Link } from "wouter";
import TimeTravelSlider from "@/components/TimeTravelSlider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportButton } from "@/components/ExportButton";

export default function Dashboard() {
  const { language } = useLanguage();
  const [regimeTag, setRegimeTag] = useState<"aden" | "sanaa" | "both">("both");
  const [granularity, setGranularity] = useState<"annual" | "quarterly" | "monthly">("annual");
  const [selectedIndicator, setSelectedIndicator] = useState("gdp");

  // Fetch real data from the database
  const indicatorCodeMap: Record<string, string[]> = {
    gdp: ["WB_GDP_CURRENT_USD", "GDP_NOMINAL", "gdp_nominal_usd", "macro_gdp_current_usd"],
    inflation: ["CPI_INFLATION", "inflation_cpi_aden", "inflation_cpi_sanaa", "prices_inflation_rate"],
    fx: ["EXCHANGE_RATE_ADEN", "EXCHANGE_RATE_SANAA", "fx_rate_aden_parallel", "fx_rate_sanaa"],
    trade: ["EXPORTS", "IMPORTS", "TRADE_BALANCE", "trade_imports", "trade_exports"],
  };

  const [indicatorCodes] = useState(() => indicatorCodeMap);
  const currentCodes = useMemo(() => indicatorCodes[selectedIndicator] || indicatorCodes.gdp, [selectedIndicator, indicatorCodes]);

  const { data: timeSeriesData, isLoading: tsLoading } = trpc.sectors.getIndicatorTimeSeries.useQuery({
    indicatorCodes: currentCodes,
    regimeTag: regimeTag === "both" ? "both" : regimeTag === "aden" ? "aden_irg" : "sanaa_defacto",
    startYear: 2010,
    endYear: 2026,
  });

  const { data: heroKPIs } = trpc.dashboard.getHeroKPIs.useQuery();

  // Transform time series data for the chart
  const chartData = useMemo(() => {
    if (!timeSeriesData || timeSeriesData.length === 0) return [];
    
    const byYear: Record<string, { year: string; aden: number | null; sanaa: number | null }> = {};
    
    for (const row of timeSeriesData as any[]) {
      const date = new Date(row.date);
      const year = date.getFullYear().toString();
      if (!byYear[year]) {
        byYear[year] = { year, aden: null, sanaa: null };
      }
      const val = parseFloat(row.value);
      if (!isNaN(val)) {
        if (row.regimeTag === "aden_irg") {
          byYear[year].aden = val;
        } else if (row.regimeTag === "sanaa_defacto") {
          byYear[year].sanaa = val;
        } else {
          // If no regime tag, assign to both
          if (!byYear[year].aden) byYear[year].aden = val;
          if (!byYear[year].sanaa) byYear[year].sanaa = val;
        }
      }
    }
    
    return Object.values(byYear).sort((a, b) => a.year.localeCompare(b.year));
  }, [timeSeriesData]);

  // Build quick stats from hero KPIs using actual return shape
  const quickStats = useMemo(() => {
    if (!heroKPIs) return [];
    const stats: Array<{
      labelEn: string;
      labelAr: string;
      value: string;
      trend: string;
      evidenceSubjectId: string;
    }> = [];

    if (heroKPIs.exchangeRateAden) {
      stats.push({
        labelEn: `Exchange Rate (Aden)`,
        labelAr: `سعر الصرف (عدن)`,
        value: heroKPIs.exchangeRateAden.value,
        trend: "up",
        evidenceSubjectId: "fx_rate_aden_parallel_aden_irg",
      });
    }

    if (heroKPIs.gdpGrowth) {
      stats.push({
        labelEn: `GDP Growth`,
        labelAr: `نمو الناتج المحلي`,
        value: heroKPIs.gdpGrowth.value,
        trend: heroKPIs.gdpGrowth.value.startsWith("-") ? "down" : "up",
        evidenceSubjectId: "gdp_nominal_usd_mixed",
      });
    }

    if (heroKPIs.inflation) {
      stats.push({
        labelEn: `Inflation Rate (Aden)`,
        labelAr: `معدل التضخم (عدن)`,
        value: heroKPIs.inflation.value,
        trend: "up",
        evidenceSubjectId: "inflation_cpi_aden_aden_irg",
      });
    }

    if (heroKPIs.idps) {
      stats.push({
        labelEn: `Internally Displaced`,
        labelAr: `النازحون داخلياً`,
        value: heroKPIs.idps.value,
        trend: "up",
        evidenceSubjectId: "idps_total_mixed",
      });
    }

    return stats;
  }, [heroKPIs]);

  // Build data table from time series
  const dataTable = useMemo(() => {
    if (!timeSeriesData || timeSeriesData.length === 0) return [];
    return (timeSeriesData as any[])
      .filter((row: any) => row.value)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
      .map((row: any) => ({
        year: new Date(row.date).getFullYear().toString(),
        value: selectedIndicator === "gdp" 
          ? `$${(parseFloat(row.value) / 1e9).toFixed(2)}B`
          : selectedIndicator === "fx"
          ? `${parseFloat(row.value).toFixed(0)} YER`
          : `${parseFloat(row.value).toFixed(1)}`,
        regime: row.regimeTag === "aden_irg" ? "Aden" : row.regimeTag === "sanaa_defacto" ? "Sana'a" : "National",
        regimeAr: row.regimeTag === "aden_irg" ? "عدن" : row.regimeTag === "sanaa_defacto" ? "صنعاء" : "وطني",
        source: row.sourceName || "World Bank / CBY",
        indicator: row.nameEn || row.indicatorCode,
      }));
  }, [timeSeriesData, selectedIndicator]);

  const indicatorLabels: Record<string, { en: string; ar: string; unit: string }> = {
    gdp: { en: "GDP", ar: "الناتج المحلي الإجمالي", unit: "USD" },
    inflation: { en: "Inflation Rate", ar: "معدل التضخم", unit: "%" },
    fx: { en: "Exchange Rate", ar: "سعر الصرف", unit: "YER/USD" },
    trade: { en: "Trade", ar: "التجارة", unit: "USD" },
  };

  const currentLabel = indicatorLabels[selectedIndicator] || indicatorLabels.gdp;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <InsightsTicker />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b">
        <div className="container py-6">
          <div className={`${language === 'ar' ? 'text-right' : ''}`}>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-[#2e8b6e] dark:text-white">
                {language === "ar" ? "لوحة المؤشرات الاقتصادية" : "Economic Indicators Dashboard"}
              </h1>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Database className="h-3 w-3 mr-1" />
                {language === "ar" ? "بيانات حية" : "Live Data"}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {language === "ar" 
                ? "بيانات موثقة ومحدثة من البنك الدولي والبنك المركزي اليمني وصندوق النقد الدولي"
                : "Verified data from World Bank, Central Bank of Yemen, and IMF"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-900 border-b py-4">
        <div className="container">
          <div className={`flex flex-wrap items-center gap-2 sm:gap-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {language === "ar" ? "اختر المؤشر" : "Select Indicator"}
              </span>
              <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gdp">{language === "ar" ? "الناتج المحلي الإجمالي" : "GDP"}</SelectItem>
                  <SelectItem value="inflation">{language === "ar" ? "التضخم" : "Inflation"}</SelectItem>
                  <SelectItem value="fx">{language === "ar" ? "سعر الصرف" : "Exchange Rate"}</SelectItem>
                  <SelectItem value="trade">{language === "ar" ? "الميزان التجاري" : "Trade Balance"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Regime Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {language === "ar" ? "النظام" : "Regime"}
              </span>
              <div className="flex rounded-lg border overflow-hidden">
                {(["both", "sanaa", "aden"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegimeTag(r)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${r !== "both" ? "border-l" : ""} ${
                      regimeTag === r 
                        ? "bg-[#2e8b6e] text-white" 
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {r === "both" ? (language === "ar" ? "كلاهما" : "Both") : 
                     r === "sanaa" ? (language === "ar" ? "صنعاء" : "Sana'a") : 
                     (language === "ar" ? "عدن" : "Aden")}
                  </button>
                ))}
              </div>
            </div>

            {/* Export */}
            {chartData.length > 0 && (
              <ExportButton 
                data={chartData}
                filename={`yeto_${selectedIndicator}_data`}
                title={language === "ar" ? "تصدير البيانات" : "Export Data"}
                variant="default"
                size="sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[280px_1fr_280px] gap-4 md:gap-6">
          
          {/* Left Sidebar */}
          <div className={`space-y-6 ${language === 'ar' ? 'lg:order-3' : ''}`}>
            {/* Quick Stats - from real data */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {language === "ar" ? "إحصائيات سريعة" : "Quick Stats"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickStats.length === 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-400">{language === "ar" ? "جاري التحميل..." : "Loading..."}</span>
                  </div>
                ) : (
                  quickStats.map((stat, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-500">
                          {language === "ar" ? stat.labelAr : stat.labelEn}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-red-500" />}
                        {stat.trend === "down" && <TrendingDown className="h-4 w-4 text-green-500" />}
                        <span className="font-bold text-[#2e8b6e] dark:text-white">{stat.value}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <EvidencePackButton 
                          subjectType="metric"
                          subjectId={stat.evidenceSubjectId}
                          indicatorName={stat.labelEn}
                          indicatorNameAr={stat.labelAr}
                          variant="link"
                          size="sm"
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Watchlist - from real hero KPIs */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {language === "ar" ? "قائمة المتابعة" : "Watchlist"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {heroKPIs && (
                  <>
                    {heroKPIs.exchangeRateAden && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "سعر صرف الدولار (عدن)" : "USD Exchange Rate (Aden)"}
                        </span>
                        <span className="font-medium text-[#2e8b6e] dark:text-white">{heroKPIs.exchangeRateAden.value}</span>
                      </div>
                    )}
                    {heroKPIs.gdpGrowth && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "نمو الناتج المحلي" : "GDP Growth"}
                        </span>
                        <span className="font-medium text-[#2e8b6e] dark:text-white">{heroKPIs.gdpGrowth.value}</span>
                      </div>
                    )}
                    {heroKPIs.inflation && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "معدل التضخم" : "Inflation Rate"}
                        </span>
                        <span className="font-medium text-[#2e8b6e] dark:text-white">{heroKPIs.inflation.value}</span>
                      </div>
                    )}
                    {heroKPIs.foreignReserves && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "الاحتياطيات الأجنبية" : "Foreign Reserves"}
                        </span>
                        <span className="font-medium text-[#2e8b6e] dark:text-white">{heroKPIs.foreignReserves.value}</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Data Source Info */}
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {language === "ar" ? "مصدر البيانات" : "Data Source"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {language === "ar" 
                    ? "يتم جمع البيانات من البنك الدولي وصندوق النقد الدولي والبنك المركزي اليمني والمفوضية السامية للأمم المتحدة لشؤون اللاجئين و1,767 منشوراً أكاديمياً."
                    : "Data sourced from World Bank, IMF, Central Bank of Yemen, UNHCR, and 1,767 academic publications."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart Area */}
          <div className={`${language === 'ar' ? 'lg:order-2' : ''}`}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>
                    {language === "ar" 
                      ? `${currentLabel.ar} 2010-2025`
                      : `${currentLabel.en} 2010-2025`}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-[#2e8b6e]"></div>
                      <span className="text-gray-600">{language === "ar" ? "عدن" : "Aden"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 border-dashed border-t-2 border-[#c0392b]"></div>
                      <span className="text-gray-600">{language === "ar" ? "صنعاء" : "Sana'a"}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tsLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2e8b6e]" />
                    <span className="ml-3 text-gray-500">{language === "ar" ? "جاري تحميل البيانات..." : "Loading data from database..."}</span>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    <AlertCircle className="h-6 w-6 mr-2" />
                    {language === "ar" ? "لا توجد بيانات متاحة لهذا المؤشر" : "No data available for this indicator"}
                  </div>
                ) : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                        <YAxis 
                          tick={{ fontSize: 12 }} 
                          tickFormatter={(value) => {
                            if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
                            if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
                            if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
                            return value.toFixed(1);
                          }}
                        />
                        <Tooltip 
                          formatter={(value: number, name: string) => {
                            const formatted = Math.abs(value) >= 1e9 
                              ? `$${(value / 1e9).toFixed(2)}B`
                              : Math.abs(value) >= 1e6 
                              ? `${(value / 1e6).toFixed(1)}M`
                              : value.toFixed(2);
                            return [formatted, name === "aden" ? "Aden" : "Sana'a"];
                          }}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        
                        <Area 
                          type="monotone" 
                          dataKey="aden" 
                          fill="#2e8b6e" 
                          fillOpacity={0.1} 
                          stroke="none"
                        />
                        
                        {(regimeTag === "both" || regimeTag === "aden") && (
                          <Line 
                            type="monotone" 
                            dataKey="aden" 
                            stroke="#2e8b6e" 
                            strokeWidth={2}
                            dot={{ fill: "#2e8b6e", strokeWidth: 2, r: 3 }}
                            connectNulls
                            name={language === "ar" ? "عدن" : "Aden"}
                          />
                        )}
                        
                        {(regimeTag === "both" || regimeTag === "sanaa") && (
                          <Line 
                            type="monotone" 
                            dataKey="sanaa" 
                            stroke="#c0392b" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: "#c0392b", strokeWidth: 2, r: 3 }}
                            connectNulls
                            name={language === "ar" ? "صنعاء" : "Sana'a"}
                          />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Data Table - from real data */}
                {dataTable.length > 0 && (
                  <div className="mt-6 border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className={`px-4 py-3 ${language === 'ar' ? 'text-right' : 'text-left'} font-medium text-gray-600`}>
                            {language === "ar" ? "السنة" : "Year"}
                          </th>
                          <th className={`px-4 py-3 ${language === 'ar' ? 'text-right' : 'text-left'} font-medium text-gray-600`}>
                            {language === "ar" ? "القيمة" : "Value"}
                          </th>
                          <th className={`px-4 py-3 ${language === 'ar' ? 'text-right' : 'text-left'} font-medium text-gray-600`}>
                            {language === "ar" ? "النظام" : "Regime"}
                          </th>
                          <th className={`px-4 py-3 ${language === 'ar' ? 'text-right' : 'text-left'} font-medium text-gray-600`}>
                            {language === "ar" ? "المصدر" : "Source"}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {dataTable.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-4 py-3">{row.year}</td>
                            <td className="px-4 py-3 font-medium">{row.value}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={
                                row.regime === "Aden" 
                                  ? "bg-green-50 text-green-700 border-green-200" 
                                  : row.regime === "Sana'a"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              }>
                                {language === "ar" ? row.regimeAr : row.regime}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{row.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className={`space-y-6 ${language === 'ar' ? 'lg:order-1' : ''}`}>
            <TimeTravelSlider compact={false} />
            
            {/* Sector Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {language === "ar" ? "القطاعات" : "Sectors"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { nameEn: "Banking & Finance", nameAr: "القطاع المصرفي", href: "/sectors/banking" },
                  { nameEn: "Trade & Commerce", nameAr: "التجارة", href: "/sectors/trade" },
                  { nameEn: "Energy & Fuel", nameAr: "الطاقة والوقود", href: "/sectors/energy" },
                  { nameEn: "Food Security", nameAr: "الأمن الغذائي", href: "/sectors/food-security" },
                  { nameEn: "Macroeconomy", nameAr: "الاقتصاد الكلي", href: "/sectors/macroeconomy" },
                  { nameEn: "Labor Market", nameAr: "سوق العمل", href: "/sectors/labor-market" },
                  { nameEn: "Prices & Inflation", nameAr: "الأسعار والتضخم", href: "/sectors/prices" },
                  { nameEn: "Aid Flows", nameAr: "تدفقات المساعدات", href: "/sectors/aid-flows" },
                ].map((sector, index) => (
                  <Link key={index} href={sector.href}>
                    <Button variant="ghost" className="w-full justify-start text-sm hover:bg-gray-100">
                      {language === "ar" ? sector.nameAr : sector.nameEn}
                    </Button>
                  </Link>
                ))}
                <Link href="/sectors">
                  <Button variant="link" className="text-[#2e8b6e] w-full justify-start">
                    {language === "ar" ? "عرض جميع القطاعات" : "View All Sectors →"}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tools */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {language === "ar" ? "الأدوات" : "Tools"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/ai-assistant">
                  <Button variant="outline" className="w-full justify-start text-sm gap-2">
                    <Eye className="h-4 w-4" />
                    {language === "ar" ? "المساعد الذكي" : "AI Assistant"}
                  </Button>
                </Link>
                <Link href="/scenario-simulator">
                  <Button variant="outline" className="w-full justify-start text-sm gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {language === "ar" ? "محاكي السيناريوهات" : "Scenario Simulator"}
                  </Button>
                </Link>
                <Link href="/report-builder">
                  <Button variant="outline" className="w-full justify-start text-sm gap-2">
                    <Download className="h-4 w-4" />
                    {language === "ar" ? "منشئ التقارير" : "Report Builder"}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-[#2e8b6e] text-white">
              <CardContent className="pt-6">
                <Info className="h-8 w-8 mb-3 text-[#C0A030]" />
                <h3 className="font-semibold mb-2">
                  {language === "ar" ? "هل تحتاج مساعدة؟" : "Need Help?"}
                </h3>
                <p className="text-sm text-white/80 mb-4">
                  {language === "ar" 
                    ? "اسأل المساعد الذكي أي سؤال عن الاقتصاد اليمني"
                    : "Ask our AI assistant any question about Yemen's economy"}
                </p>
                <Link href="/ai-assistant">
                  <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white w-full">
                    {language === "ar" ? "اسأل الآن" : "Ask Now"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
