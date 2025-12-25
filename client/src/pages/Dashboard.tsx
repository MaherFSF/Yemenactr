import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Users, 
  AlertCircle,
  Download,
  Filter,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const [regimeTag, setRegimeTag] = useState<"aden_irg" | "sanaa_defacto">("aden_irg");

  // Fetch key metrics
  const { data: keyMetrics, isLoading: metricsLoading } = trpc.dashboard.getKeyMetrics.useQuery({
    regimeTag,
  });

  // Fetch inflation time series
  const { data: inflationData } = trpc.timeSeries.getByIndicator.useQuery({
    indicatorCode: "inflation_cpi",
    regimeTag,
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
  });

  // Fetch FX rate time series
  const { data: fxData } = trpc.timeSeries.getByIndicator.useQuery({
    indicatorCode: "fx_rate_usd",
    regimeTag,
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
  });

  // Fetch recent economic events
  const { data: recentEvents } = trpc.events.list.useQuery({
    regimeTag,
    limit: 5,
  });

  const formatNumber = (num: number | undefined, decimals: number = 2) => {
    if (num === undefined) return "N/A";
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US", {
      year: "numeric",
      month: "short",
    });
  };

  // Transform data for charts
  const inflationChartData = inflationData?.map(d => ({
    date: formatDate(d.date),
    value: parseFloat(d.value),
    confidence: d.confidenceRating,
  })) || [];

  const fxChartData = fxData?.map(d => ({
    date: formatDate(d.date),
    value: parseFloat(d.value),
    confidence: d.confidenceRating,
  })) || [];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {language === "ar" ? "لوحة المعلومات الاقتصادية" : "Economic Dashboard"}
              </h1>
              <p className="text-muted-foreground">
                {language === "ar" 
                  ? "مؤشرات اقتصادية في الوقت الفعلي مع تتبع كامل للمصادر"
                  : "Real-time economic indicators with complete provenance tracking"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {language === "ar" ? "تصفية" : "Filter"}
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {language === "ar" ? "تصدير" : "Export"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Regime Selector */}
      <section className="bg-background border-b">
        <div className="container py-4">
          <Tabs value={regimeTag} onValueChange={(v) => setRegimeTag(v as typeof regimeTag)}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="aden_irg">
                {language === "ar" ? "عدن (الحكومة المعترف بها)" : "Aden (IRG)"}
              </TabsTrigger>
              <TabsTrigger value="sanaa_defacto">
                {language === "ar" ? "صنعاء (السلطة الفعلية)" : "Sana'a (De Facto)"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      <div className="container py-8">
        {/* Key Metrics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Inflation Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === "ar" ? "التضخم (CPI)" : "Inflation (CPI)"}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatNumber(keyMetrics?.inflation?.value ? parseFloat(keyMetrics.inflation.value) : undefined, 1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(keyMetrics?.inflation?.date)}
                  </p>
                  {keyMetrics?.inflation && (
                    <Badge variant="outline" className="mt-2">
                      {language === "ar" ? "الثقة" : "Confidence"}: {keyMetrics.inflation.confidenceRating}
                    </Badge>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* FX Rate Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === "ar" ? "سعر الصرف (USD)" : "FX Rate (USD)"}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatNumber(keyMetrics?.fxRate?.value ? parseFloat(keyMetrics.fxRate.value) : undefined, 0)} YER
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(keyMetrics?.fxRate?.date)}
                  </p>
                  {keyMetrics?.fxRate && (
                    <Badge variant="outline" className="mt-2">
                      {language === "ar" ? "الثقة" : "Confidence"}: {keyMetrics.fxRate.confidenceRating}
                    </Badge>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* GDP Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === "ar" ? "الناتج المحلي الإجمالي" : "GDP (Nominal)"}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {keyMetrics?.gdp?.value ? `$${formatNumber(parseFloat(keyMetrics.gdp.value) / 1000, 1)}B` : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(keyMetrics?.gdp?.date)}
                  </p>
                  {keyMetrics?.gdp && (
                    <Badge variant="outline" className="mt-2">
                      {language === "ar" ? "الثقة" : "Confidence"}: {keyMetrics.gdp.confidenceRating}
                    </Badge>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Poverty Rate Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === "ar" ? "معدل الفقر" : "Poverty Rate"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatNumber(keyMetrics?.poverty?.value ? parseFloat(keyMetrics.poverty.value) : undefined, 1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(keyMetrics?.poverty?.date)}
                  </p>
                  {keyMetrics?.poverty && (
                    <Badge variant="outline" className="mt-2">
                      {language === "ar" ? "الثقة" : "Confidence"}: {keyMetrics.poverty.confidenceRating}
                    </Badge>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Inflation Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === "ar" ? "التضخم - آخر سنتين" : "Inflation - Last 2 Years"}
              </CardTitle>
              <CardDescription>
                {language === "ar" ? "مؤشر أسعار المستهلك (CPI)" : "Consumer Price Index (CPI)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inflationChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={inflationChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#107040" 
                      strokeWidth={2}
                      name={language === "ar" ? "التضخم %" : "Inflation %"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {language === "ar" ? "لا توجد بيانات متاحة" : "No data available"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* FX Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === "ar" ? "سعر الصرف - آخر سنتين" : "FX Rate - Last 2 Years"}
              </CardTitle>
              <CardDescription>
                {language === "ar" ? "الريال اليمني مقابل الدولار الأمريكي" : "Yemeni Rial vs US Dollar"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fxChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fxChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#C0A030" 
                      strokeWidth={2}
                      name={language === "ar" ? "YER/USD" : "YER/USD"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {language === "ar" ? "لا توجد بيانات متاحة" : "No data available"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "الأحداث الاقتصادية الأخيرة" : "Recent Economic Events"}
            </CardTitle>
            <CardDescription>
              {language === "ar" 
                ? "أحدث التطورات والسياسات الاقتصادية"
                : "Latest economic developments and policy changes"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvents && recentEvents.length > 0 ? (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground mb-1">
                        {language === "ar" ? event.titleAr || event.title : event.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {language === "ar" ? event.descriptionAr || event.description : event.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(event.eventDate)}</span>
                        {event.impactLevel && (
                          <Badge variant={event.impactLevel === "critical" ? "destructive" : "outline"} className="text-xs">
                            {event.impactLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{language === "ar" ? "لا توجد أحداث حديثة" : "No recent events"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
