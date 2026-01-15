import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown,
  Banknote,
  Download,
  Info,
  AlertTriangle,
  FileText,
  ArrowLeft,
  ArrowUpDown,
  RefreshCw,
  Clock
} from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Sparkline, RegimeHeatmap, InsightsTicker, CorrelationMatrix } from "@/components/charts/EnhancedVisualizations";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export default function Currency() {
  const { language } = useLanguage();

  // Fetch dynamic data from database
  const { data: latestRates, isLoading: ratesLoading } = trpc.currency.getLatestRates.useQuery();
  const { data: historicalRates, isLoading: historicalLoading } = trpc.currency.getHistoricalRates.useQuery({
    startYear: 2015,
    endYear: 2026,
    granularity: 'monthly',
  });
  const { data: kpisData, isLoading: kpisLoading } = trpc.currency.getKPIs.useQuery();
  const { data: events, isLoading: eventsLoading } = trpc.currency.getHistoricalEvents.useQuery({
    startYear: 2011,
    endYear: 2026,
  });

  // Process chart data from database
  const fxData = useMemo(() => {
    if (!historicalRates || historicalRates.length === 0) return [];
    return historicalRates.map(d => ({
      month: d.month,
      adenOfficial: d.adenOfficial || 0,
      adenParallel: d.adenParallel || 0,
      sanaaParallel: d.sanaaParallel || 0,
    }));
  }, [historicalRates]);

  // Calculate spread data from fetched rates
  const spreadData = useMemo(() => {
    return fxData.map(d => ({
      month: d.month,
      adenSpread: d.adenOfficial > 0 ? ((d.adenParallel - d.adenOfficial) / d.adenOfficial * 100).toFixed(1) : '0',
      northSouthSpread: d.sanaaParallel > 0 ? ((d.adenParallel - d.sanaaParallel) / d.sanaaParallel * 100).toFixed(1) : '0',
    }));
  }, [fxData]);

  // Use KPIs from database
  const kpis = kpisData?.kpis || [];

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return language === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays} days ago`;
    }
    if (diffHours > 0) {
      return language === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`;
    }
    return language === 'ar' ? 'الآن' : 'Just now';
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(/sectors/currency.jpg)` }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#C0A030]/90 to-[#8B7500]/80" />
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container relative h-full flex items-center">
          <div className={`max-w-2xl ${language === 'ar' ? 'mr-auto text-right' : 'ml-0'}`}>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4 gap-2 text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
                {language === "ar" ? "العودة إلى لوحة المعلومات" : "Back to Dashboard"}
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Banknote className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-[#107040] text-white border-0">
                {language === "ar" ? "القطاع المالي" : "Financial Sector"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "العملة وأسعار الصرف"
                : "Currency & Exchange Rates"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "تتبع أسعار صرف الريال اليمني والفجوة بين النظامين النقديين"
                : "Tracking Yemeni Rial exchange rates and the dual monetary system divergence"}
            </p>
            {/* Dynamic Last Updated */}
            {latestRates && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  {language === "ar" ? "آخر تحديث:" : "Last updated:"} {formatRelativeTime(latestRates.lastUpdated)}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Critical Warning */}
        <Card className="mb-8 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                  {language === "ar" ? "تحذير: نظام نقدي منقسم" : "Warning: Split Monetary System"}
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {language === "ar"
                    ? "اليمن يعمل بنظامين نقديين منفصلين منذ 2019. الأوراق النقدية الجديدة (المطبوعة بعد 2016) غير مقبولة في مناطق صنعاء. هذا يخلق فجوة كبيرة في أسعار الصرف."
                    : "Yemen operates two separate monetary systems since 2019. New banknotes (printed after 2016) are not accepted in Sana'a areas. This creates a significant exchange rate divergence."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards - Dynamic from Database */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {kpisLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))
          ) : (
            kpis.map((kpi: any, index: number) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center justify-between">
                    <span>{language === "ar" ? kpi.titleAr : kpi.titleEn}</span>
                    <div className="flex items-center gap-1">
                      {kpi.regime && (
                        <Badge variant={kpi.regime === "IRG" ? "default" : "secondary"} className="text-xs">
                          {kpi.regime}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {kpi.confidence}
                      </Badge>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {kpi.change > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    ) : kpi.change < 0 ? (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    ) : null}
                    <span className={`text-sm ${kpi.change > 0 ? 'text-red-600' : kpi.change < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}% YoY
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {kpi.source}
                  </div>
                  {/* Show actual data date */}
                  {kpi.asOf && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {language === "ar" ? "بتاريخ:" : "As of:"} {formatDate(kpi.asOf)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="rates">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rates">
              {language === "ar" ? "أسعار الصرف" : "Exchange Rates"}
            </TabsTrigger>
            <TabsTrigger value="spread">
              {language === "ar" ? "الفجوة" : "Spread Analysis"}
            </TabsTrigger>
            <TabsTrigger value="historical">
              {language === "ar" ? "التاريخي" : "Historical"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "أسعار الصرف الشهرية (2015-2026)" : "Monthly Exchange Rates (2015-2026)"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "ريال يمني مقابل الدولار الأمريكي - بيانات حية من قاعدة البيانات" : "YER per USD - Live data from database"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    {language === "ar" ? "تصدير" : "Export"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {historicalLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : fxData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={fxData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" domain={[0, 'auto']} />
                      <YAxis yAxisId="right" orientation="right" domain={[200, 700]} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value.toLocaleString()} YER/$`,
                          name
                        ]}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="adenOfficial" 
                        stroke="#107040" 
                        strokeWidth={2}
                        name={language === "ar" ? "عدن - رسمي" : "Aden - Official"}
                        dot={false}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="adenParallel" 
                        stroke="#103050" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name={language === "ar" ? "عدن - موازي" : "Aden - Parallel"}
                        dot={false}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="sanaaParallel" 
                        stroke="#C0A030" 
                        strokeWidth={2}
                        name={language === "ar" ? "صنعاء - موازي" : "Sana'a - Parallel"}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    {language === "ar" ? "لا توجد بيانات متاحة" : "No data available"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spread">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "تحليل الفجوة" : "Spread Analysis"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "الفرق بين الأسعار الرسمية والموازية" : "Difference between official and parallel rates"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historicalLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : spreadData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={spreadData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: string) => [`${value}%`, '']} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="northSouthSpread" 
                        stroke="#C0A030" 
                        fill="#C0A030" 
                        fillOpacity={0.3}
                        name={language === "ar" ? "فجوة شمال-جنوب %" : "North-South Spread %"}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="adenSpread" 
                        stroke="#107040" 
                        fill="#107040" 
                        fillOpacity={0.3}
                        name={language === "ar" ? "فجوة عدن %" : "Aden Spread %"}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    {language === "ar" ? "لا توجد بيانات متاحة" : "No data available"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historical">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "الأحداث التاريخية الرئيسية" : "Key Historical Events"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "الأحداث الاقتصادية والسياسية المؤثرة على سعر الصرف" : "Economic and political events affecting exchange rates"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {events.map((event: any, index: number) => (
                      <div key={event.id || index} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          event.impactLevel === 'critical' ? 'bg-red-600' :
                          event.impactLevel === 'high' ? 'bg-orange-500' :
                          event.impactLevel === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}>
                          {event.year}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {language === "ar" ? event.titleAr : event.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {event.category}
                            </Badge>
                            <Badge variant={
                              event.impactLevel === 'critical' ? 'destructive' :
                              event.impactLevel === 'high' ? 'default' : 'secondary'
                            } className="text-xs">
                              {event.impactLevel}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(event.eventDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {language === "ar" ? "لا توجد أحداث متاحة" : "No events available"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data Sources Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {language === "ar" ? "مصادر البيانات" : "Data Sources"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">{language === "ar" ? "البنك المركزي - عدن" : "CBY Aden"}</h4>
                <p className="text-muted-foreground">
                  {language === "ar" 
                    ? "الأسعار الرسمية والتقارير الشهرية"
                    : "Official rates and monthly reports"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{language === "ar" ? "البنك المركزي - صنعاء" : "CBY Sana'a"}</h4>
                <p className="text-muted-foreground">
                  {language === "ar"
                    ? "أسعار المنطقة الشمالية"
                    : "Northern region rates"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{language === "ar" ? "مسوحات السوق" : "Market Surveys"}</h4>
                <p className="text-muted-foreground">
                  {language === "ar"
                    ? "أسعار السوق الموازي من الصرافين"
                    : "Parallel market rates from money changers"}
                </p>
              </div>
            </div>
            {/* Show actual data freshness */}
            {latestRates && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {language === "ar" 
                    ? `البيانات محدثة حتى: ${formatDate(latestRates.adenParallel?.date || latestRates.lastUpdated)}`
                    : `Data current as of: ${formatDate(latestRates.adenParallel?.date || latestRates.lastUpdated)}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
