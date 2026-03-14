import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { SectorAgentChat } from "@/components/SectorAgentChat";
import {
  Landmark, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Bell,
  FileText, BarChart3, LineChart, Activity, Shield, Globe, Building2,
  Users, Download, Send, Sparkles, ChevronRight, RefreshCw, Eye,
  Banknote, ArrowUpRight, ArrowDownRight, Zap, Loader2,
} from "lucide-react";

// Governor profile data
const governorProfile = {
  name: "Ahmed Ghaleb Al-Maabqi",
  nameAr: "أحمد غالب المعبقي",
  title: "Governor",
  titleAr: "المحافظ",
  institution: "Central Bank of Yemen - Aden",
  institutionAr: "البنك المركزي اليمني - عدن",
};

export default function GovernorDashboard() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [showAiChat, setShowAiChat] = useState(false);
  const [selectedRegime, setSelectedRegime] = useState<"both" | "aden_irg" | "sanaa_defacto">("both");

  // Fetch real data from database
  const { data: bankingData, isLoading: bankingLoading } = trpc.sectors.getSectorData.useQuery(
    { sectorCode: "banking", regimeTag: selectedRegime }
  );
  const { data: macroData, isLoading: macroLoading } = trpc.sectors.getSectorData.useQuery(
    { sectorCode: "macroeconomy", regimeTag: selectedRegime }
  );
  const { data: currencyData, isLoading: currencyLoading } = trpc.sectors.getSectorData.useQuery(
    { sectorCode: "currency", regimeTag: selectedRegime }
  );
  const { data: pricesData } = trpc.sectors.getSectorData.useQuery(
    { sectorCode: "prices", regimeTag: selectedRegime }
  );
  const { data: heroKPIs } = trpc.dashboard.getHeroKPIs.useQuery();

  // Extract key indicators from real data
  const keyIndicators = useMemo(() => {
    const indicators: Array<{
      id: string; label: string; labelAr: string; value: number | string;
      unit: string; change: number | null; trend: string; status: string;
    }> = [];

    // Exchange rate from heroKPIs
    if (heroKPIs) {
      const fxYoYVal = parseFloat(heroKPIs.exchangeRateYoY?.value || "0");
      indicators.push({
        id: "exchange_rate_aden",
        label: "Exchange Rate (Aden)",
        labelAr: "سعر الصرف (عدن)",
        value: heroKPIs.exchangeRateAden?.value || "N/A",
        unit: "",
        change: isNaN(fxYoYVal) ? null : fxYoYVal,
        trend: fxYoYVal > 0 ? "up" : "down",
        status: Math.abs(fxYoYVal) > 10 ? "critical" : "warning",
      });
    }

    // GDP from macro data
    const gdpInd = macroData?.indicators?.find((i: any) => 
      i.nameEn?.toLowerCase().includes("gdp") && !i.nameEn?.toLowerCase().includes("per capita")
    );
    if (gdpInd) {
      const gdpTs = macroData?.timeSeries?.filter((t: any) => t.indicatorCode === gdpInd.code)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = gdpTs?.[0];
      const prev = gdpTs?.[1];
      const change = latest && prev ? ((parseFloat(latest.value) - parseFloat(prev.value)) / Math.abs(parseFloat(prev.value))) * 100 : null;
      indicators.push({
        id: "gdp",
        label: gdpInd.nameEn || "GDP",
        labelAr: gdpInd.nameAr || "الناتج المحلي",
        value: latest ? (parseFloat(latest.value) / 1e9).toFixed(1) : "N/A",
        unit: "B USD",
        change: change ? Math.round(change * 10) / 10 : null,
        trend: (change || 0) > 0 ? "up" : "down",
        status: (change || 0) < -5 ? "critical" : (change || 0) < 0 ? "warning" : "ok",
      });
    }

    // Inflation from prices data
    const inflInd = pricesData?.indicators?.find((i: any) => 
      i.nameEn?.toLowerCase().includes("inflation") || i.nameEn?.toLowerCase().includes("cpi")
    );
    if (inflInd) {
      const inflTs = pricesData?.timeSeries?.filter((t: any) => t.indicatorCode === inflInd.code)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = inflTs?.[0];
      indicators.push({
        id: "inflation",
        label: "Inflation Rate",
        labelAr: "معدل التضخم",
        value: latest ? parseFloat(parseFloat(latest.value).toFixed(1)) : "N/A",
        unit: "%",
        change: null,
        trend: "up",
        status: (latest && parseFloat(latest.value) > 20) ? "critical" : "warning",
      });
    }

    // Broad money from banking
    const m2Ind = bankingData?.indicators?.find((i: any) => 
      i.nameEn?.toLowerCase().includes("broad money") || i.nameEn?.toLowerCase().includes("m2")
    );
    if (m2Ind) {
      const m2Ts = bankingData?.timeSeries?.filter((t: any) => t.indicatorCode === m2Ind.code)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = m2Ts?.[0];
      const prev = m2Ts?.[1];
      const change = latest && prev ? ((parseFloat(latest.value) - parseFloat(prev.value)) / Math.abs(parseFloat(prev.value))) * 100 : null;
      indicators.push({
        id: "broad_money",
        label: m2Ind.nameEn || "Broad Money (M2)",
        labelAr: m2Ind.nameAr || "عرض النقود الواسع",
        value: latest ? (parseFloat(latest.value) / 1e9 > 1 ? (parseFloat(latest.value) / 1e9).toFixed(1) : parseFloat(latest.value).toFixed(1)) : "N/A",
        unit: latest && parseFloat(latest.value) / 1e9 > 1 ? "B YER" : m2Ind.unit || "% GDP",
        change: change ? Math.round(change * 10) / 10 : null,
        trend: (change || 0) > 0 ? "up" : "down",
        status: "ok",
      });
    }

    return indicators;
  }, [heroKPIs, macroData, bankingData, pricesData, currencyData]);

  // Extract banking sector summary from real data
  const bankingSummary = useMemo(() => {
    if (!bankingData?.indicators) return null;
    const items: Array<{ name: string; nameAr: string; value: string; unit: string; icon: any; color: string }> = [];
    
    for (const ind of bankingData.indicators) {
      const ts = bankingData.timeSeries
        ?.filter((t: any) => t.indicatorCode === ind.code)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = ts?.[0];
      if (latest) {
        items.push({
          name: ind.nameEn,
          nameAr: ind.nameAr,
          value: parseFloat(latest.value).toLocaleString(undefined, { maximumFractionDigits: 1 }),
          unit: ind.unit,
          icon: ind.nameEn?.toLowerCase().includes("asset") ? Banknote : 
                ind.nameEn?.toLowerCase().includes("capital") ? Shield :
                ind.nameEn?.toLowerCase().includes("loan") ? AlertTriangle : BarChart3,
          color: ind.nameEn?.toLowerCase().includes("loan") ? "text-amber-600" : "text-blue-600",
        });
      }
    }
    return items;
  }, [bankingData]);

  // Extract exchange rate history for chart
  const fxHistory = useMemo(() => {
    if (!currencyData?.timeSeries) return [];
    return currencyData.timeSeries
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-24)
      .map((t: any) => ({
        date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: parseFloat(t.value),
        regime: t.regimeTag,
        indicator: t.indicator?.nameEn || t.indicatorCode,
      }));
  }, [currencyData]);

  const formatNumber = (num: number | string, decimals = 1) => {
    if (typeof num === 'string') return num;
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const isDataLoading = bankingLoading || macroLoading || currencyLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="max-w-md w-full mx-4 bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
              <Landmark className="h-10 w-10 text-amber-500" />
            </div>
            <CardTitle className="text-2xl text-white">{isRTL ? "لوحة تحكم المحافظ" : "Governor Dashboard"}</CardTitle>
            <CardDescription className="text-slate-400">{isRTL ? "يرجى تسجيل الدخول للوصول إلى لوحة التحكم التنفيذية" : "Please log in to access the executive dashboard"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" asChild>
              <a href={getLoginUrl()}>{isRTL ? "تسجيل الدخول" : "Log In"}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                <Landmark className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {isRTL ? "لوحة تحكم تنفيذية" : "Executive Dashboard"}
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    {isRTL ? "بيانات حية" : "Live Data"}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold">{isRTL ? governorProfile.nameAr : governorProfile.name}</h1>
                <p className="text-slate-400">{isRTL ? `${governorProfile.titleAr} - ${governorProfile.institutionAr}` : `${governorProfile.title} - ${governorProfile.institution}`}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedRegime} onValueChange={(v) => setSelectedRegime(v as any)}>
                <SelectTrigger className="w-40 border-slate-600 text-slate-300 bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">{isRTL ? "كلا الجهتين" : "Both Regimes"}</SelectItem>
                  <SelectItem value="aden_irg">{isRTL ? "عدن (IRG)" : "Aden (IRG)"}</SelectItem>
                  <SelectItem value="sanaa_defacto">{isRTL ? "صنعاء (DFA)" : "Sanaa (DFA)"}</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => setShowAiChat(!showAiChat)}
              >
                <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? "المساعد الذكي" : "AI Assistant"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Indicators - from real data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isDataLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))
          ) : keyIndicators.length > 0 ? (
            keyIndicators.map((indicator) => (
              <Card key={indicator.id} className={`${
                indicator.status === "critical" ? "border-red-200 dark:border-red-800" :
                indicator.status === "warning" ? "border-amber-200 dark:border-amber-800" :
                "border-emerald-200 dark:border-emerald-800"
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{isRTL ? indicator.labelAr : indicator.label}</span>
                    {indicator.status === "critical" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {indicator.status === "warning" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{formatNumber(indicator.value, typeof indicator.value === 'number' && indicator.unit === "%" ? 1 : 0)}</span>
                    <span className="text-sm text-slate-500">{indicator.unit}</span>
                  </div>
                  {indicator.change !== null && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${
                      indicator.change > 0 ? "text-red-600" : "text-emerald-600"
                    }`}>
                      {indicator.trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {indicator.change > 0 ? "+" : ""}{formatNumber(indicator.change)}% YoY
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-4">
              <CardContent className="p-6 text-center text-slate-500">
                {isRTL ? "لا توجد بيانات متاحة" : "No data available for selected regime"}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exchange Rate History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{isRTL ? "بيانات العملة الحية" : "Live Currency Data"}</CardTitle>
                    <CardDescription>
                      {isRTL ? `${fxHistory.length} نقطة بيانات من قاعدة بيانات يتو` : `${fxHistory.length} data points from YETO database`}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    {isRTL ? "حي" : "Live"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {fxHistory.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {fxHistory.slice(-4).map((point, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                          <p className="text-xs text-slate-500">{point.date}</p>
                          <p className="text-lg font-bold">{point.value.toLocaleString()}</p>
                          <p className="text-xs text-slate-400">{point.regime === 'aden_irg' ? 'Aden' : point.regime === 'sanaa_defacto' ? 'Sanaa' : 'National'}</p>
                        </div>
                      ))}
                    </div>
                    <div className="h-40 flex items-end gap-1 pt-4">
                      {fxHistory.map((point, i) => {
                        const max = Math.max(...fxHistory.map(p => p.value));
                        const min = Math.min(...fxHistory.map(p => p.value));
                        const range = max - min || 1;
                        const height = ((point.value - min) / range) * 120 + 20;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div 
                              className={`w-full rounded-t ${point.regime === 'aden_irg' ? 'bg-blue-500' : point.regime === 'sanaa_defacto' ? 'bg-red-500' : 'bg-amber-500'}`}
                              style={{ height: `${height}px` }}
                              title={`${point.date}: ${point.value.toLocaleString()} (${point.regime})`}
                            ></div>
                            {i % 4 === 0 && <span className="text-[9px] text-slate-400">{point.date}</span>}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2">
                      <span className="flex items-center gap-1"><div className="w-3 h-2 bg-blue-500 rounded"></div> Aden</span>
                      <span className="flex items-center gap-1"><div className="w-3 h-2 bg-red-500 rounded"></div> Sanaa</span>
                      <span className="flex items-center gap-1"><div className="w-3 h-2 bg-amber-500 rounded"></div> National</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 mx-auto mb-2" />
                      <p>{isRTL ? "جاري تحميل بيانات العملة..." : "Loading currency data..."}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Banking Sector Indicators - from real data */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "مؤشرات القطاع المصرفي" : "Banking Sector Indicators"}</CardTitle>
                <CardDescription>
                  {isRTL ? `${bankingSummary?.length || 0} مؤشرات حية من قاعدة البيانات` : `${bankingSummary?.length || 0} live indicators from database`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bankingLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : bankingSummary && bankingSummary.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bankingSummary.slice(0, 9).map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={`h-4 w-4 ${item.color}`} />
                            <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{isRTL ? item.nameAr : item.name}</span>
                          </div>
                          <p className="text-lg font-bold">{item.value}</p>
                          <p className="text-xs text-slate-500">{item.unit}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-8">{isRTL ? "لا توجد بيانات مصرفية" : "No banking data available"}</p>
                )}
              </CardContent>
            </Card>

            {/* Macro Economy Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "ملخص الاقتصاد الكلي" : "Macroeconomy Summary"}</CardTitle>
                <CardDescription>
                  {isRTL ? `${macroData?.indicators?.length || 0} مؤشرات` : `${macroData?.indicators?.length || 0} indicators tracked`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {macroLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : macroData?.indicators && macroData.indicators.length > 0 ? (
                  <div className="space-y-3">
                    {macroData.indicators.slice(0, 8).map((ind: any, i: number) => {
                      const ts = macroData.timeSeries
                        ?.filter((t: any) => t.indicatorCode === ind.code)
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      const latest = ts?.[0];
                      if (!latest) return null;
                      return (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-1 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{isRTL ? ind.nameAr : ind.nameEn}</p>
                              <p className="text-xs text-slate-500">{new Date(latest.date).getFullYear()}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold">{parseFloat(latest.value).toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
                            <p className="text-xs text-slate-500">{ind.unit}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-8">{isRTL ? "لا توجد بيانات" : "No macro data available"}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Data Sources */}
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-600" />
                  {isRTL ? "مصادر البيانات" : "Data Sources"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {bankingData?.sources?.slice(0, 5).map((src: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="truncate">{src.publisher || src.name || 'Unknown'}</span>
                  </div>
                ))}
                {(!bankingData?.sources || bankingData.sources.length === 0) && (
                  <p className="text-sm text-slate-400">{isRTL ? "جاري التحميل..." : "Loading sources..."}</p>
                )}
              </CardContent>
            </Card>

            {/* Alerts from economic events */}
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-600" />
                  {isRTL ? "الأحداث الاقتصادية" : "Economic Events"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bankingData?.alerts?.slice(0, 5).map((alert: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <p className="font-medium text-sm">{isRTL ? (alert.titleAr || alert.title) : alert.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{alert.eventDate ? new Date(alert.eventDate).toLocaleDateString() : ''}</p>
                  </div>
                ))}
                {(!bankingData?.alerts || bankingData.alerts.length === 0) && (
                  <p className="text-sm text-slate-400 text-center py-4">{isRTL ? "لا توجد أحداث حديثة" : "No recent events"}</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {isRTL ? "الإجراءات السريعة" : "Quick Actions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href="/sectors/banking"><Building2 className="h-4 w-4" />{isRTL ? "القطاع المصرفي" : "Banking Sector"}</a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href="/sectors/macroeconomy"><BarChart3 className="h-4 w-4" />{isRTL ? "الاقتصاد الكلي" : "Macroeconomy"}</a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href="/data-coverage"><Activity className="h-4 w-4" />{isRTL ? "تغطية البيانات" : "Data Coverage"}</a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href="/research-library"><FileText className="h-4 w-4" />{isRTL ? "مكتبة الأبحاث" : "Research Library"}</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  {isRTL ? "المساعد الذكي" : "AI Banking Advisor"}
                </CardTitle>
                <CardDescription>{isRTL ? "مدعوم ببيانات حية من 295 مؤشر" : "Powered by live data from 295 indicators"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => setShowAiChat(!showAiChat)}
                >
                  <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {showAiChat ? (isRTL ? "إخفاء المحادثة" : "Hide Chat") : (isRTL ? "فتح المحادثة" : "Open Chat")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Agent Chat - Full Width */}
        {showAiChat && (
          <div className="mt-8">
            <SectorAgentChat sectorId="banking" sectorName="Banking" sectorNameAr="القطاع المصرفي" />
          </div>
        )}
      </div>
    </div>
  );
}
