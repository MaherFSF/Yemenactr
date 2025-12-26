import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Users, 
  AlertCircle,
  Download,
  Filter,
  Calendar,
  Zap,
  Wheat,
  Ship,
  Building2,
  ArrowRight,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Link } from "wouter";

export default function Dashboard() {
  const { language } = useLanguage();
  const [regimeTag, setRegimeTag] = useState<"aden" | "sanaa" | "both">("both");

  // Sample data for demonstration
  const keyMetrics = {
    aden: {
      fxRate: { value: 2070, change: 15.2, date: "Dec 2024" },
      inflation: { value: 35.2, change: 2.1, date: "Nov 2024" },
      gdp: { value: 21.5, change: -2.3, date: "2023" },
      poverty: { value: 80, change: 5, date: "2024" },
      fuelPrice: { value: 1250, change: 8.5, date: "Dec 2024" },
      foodIndex: { value: 285, change: 12.3, date: "Dec 2024" },
    },
    sanaa: {
      fxRate: { value: 535, change: 0.5, date: "Dec 2024" },
      inflation: { value: 12.5, change: -1.2, date: "Nov 2024" },
      gdp: { value: null, change: null, date: "N/A" },
      poverty: { value: 78, change: 3, date: "2024" },
      fuelPrice: { value: 850, change: 5.2, date: "Dec 2024" },
      foodIndex: { value: 245, change: 8.7, date: "Dec 2024" },
    }
  };

  // Exchange rate comparison data
  const fxComparisonData = [
    { month: "Jul", aden: 1850, sanaa: 530 },
    { month: "Aug", aden: 1920, sanaa: 532 },
    { month: "Sep", aden: 1980, sanaa: 533 },
    { month: "Oct", aden: 2010, sanaa: 534 },
    { month: "Nov", aden: 2045, sanaa: 535 },
    { month: "Dec", aden: 2070, sanaa: 535 },
  ];

  // Inflation comparison data
  const inflationData = [
    { month: "Jul", aden: 32.1, sanaa: 14.2 },
    { month: "Aug", aden: 33.5, sanaa: 13.8 },
    { month: "Sep", aden: 34.2, sanaa: 13.2 },
    { month: "Oct", aden: 34.8, sanaa: 12.9 },
    { month: "Nov", aden: 35.2, sanaa: 12.5 },
    { month: "Dec", aden: 35.8, sanaa: 12.3 },
  ];

  // Sector breakdown data
  const sectorData = [
    { name: language === "ar" ? "الزراعة" : "Agriculture", value: 20, color: "#107040" },
    { name: language === "ar" ? "الخدمات" : "Services", value: 45, color: "#C0A030" },
    { name: language === "ar" ? "الصناعة" : "Industry", value: 15, color: "#103050" },
    { name: language === "ar" ? "النفط والغاز" : "Oil & Gas", value: 10, color: "#4A90E2" },
    { name: language === "ar" ? "أخرى" : "Other", value: 10, color: "#9CA3AF" },
  ];

  // Recent events
  const recentEvents = [
    {
      id: 1,
      titleEn: "CBY-Aden Announces New Monetary Policy Measures",
      titleAr: "البنك المركزي في عدن يعلن عن إجراءات نقدية جديدة",
      dateEn: "Dec 20, 2024",
      dateAr: "20 ديسمبر 2024",
      impact: "high",
      sector: "banking"
    },
    {
      id: 2,
      titleEn: "Fuel Prices Increase in Southern Governorates",
      titleAr: "ارتفاع أسعار الوقود في المحافظات الجنوبية",
      dateEn: "Dec 18, 2024",
      dateAr: "18 ديسمبر 2024",
      impact: "medium",
      sector: "energy"
    },
    {
      id: 3,
      titleEn: "WFP Reports Food Security Deterioration",
      titleAr: "برنامج الغذاء العالمي يرصد تدهور الأمن الغذائي",
      dateEn: "Dec 15, 2024",
      dateAr: "15 ديسمبر 2024",
      impact: "critical",
      sector: "food"
    },
    {
      id: 4,
      titleEn: "Trade Volume Through Aden Port Increases",
      titleAr: "زيادة حجم التجارة عبر ميناء عدن",
      dateEn: "Dec 12, 2024",
      dateAr: "12 ديسمبر 2024",
      impact: "low",
      sector: "trade"
    },
  ];

  // Data quality indicators
  const dataQuality = [
    { labelEn: "Verified Sources", labelAr: "مصادر موثقة", value: 127, icon: CheckCircle2, color: "text-green-600" },
    { labelEn: "Pending Review", labelAr: "قيد المراجعة", value: 23, icon: RefreshCw, color: "text-yellow-600" },
    { labelEn: "Data Gaps", labelAr: "فجوات البيانات", value: 8, icon: AlertTriangle, color: "text-red-600" },
  ];

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    change, 
    date, 
    icon: Icon, 
    confidence = "B",
    regime
  }: {
    title: string;
    value: string | number;
    unit?: string;
    change?: number;
    date: string;
    icon: any;
    confidence?: string;
    regime?: string;
  }) => (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${
        regime === "aden" ? "bg-blue-500" : 
        regime === "sanaa" ? "bg-red-500" : "bg-[#107040]"
      }`}></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {change !== undefined && (
              <span className={`text-xs flex items-center ${
                change > 0 ? "text-red-600" : change < 0 ? "text-green-600" : "text-gray-600"
              }`}>
                {change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(change)}%
              </span>
            )}
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {confidence}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#103050] to-[#0B1F33] text-white">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Badge className="mb-3 bg-white/10 text-white border-white/20">
                {language === "ar" ? "تحديث مباشر" : "Live Updates"}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {language === "ar" ? "لوحة المعلومات الاقتصادية" : "Economic Dashboard"}
              </h1>
              <p className="text-white/70">
                {language === "ar" 
                  ? "مؤشرات اقتصادية في الوقت الفعلي مع تتبع كامل للمصادر"
                  : "Real-time economic indicators with complete provenance tracking"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Filter className="h-4 w-4" />
                {language === "ar" ? "تصفية" : "Filter"}
              </Button>
              <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Download className="h-4 w-4" />
                {language === "ar" ? "تصدير" : "Export"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Regime Selector */}
      <section className="bg-background border-b sticky top-16 z-40">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs value={regimeTag} onValueChange={(v) => setRegimeTag(v as typeof regimeTag)}>
              <TabsList className="grid w-full max-w-lg grid-cols-3">
                <TabsTrigger value="both" className="gap-2">
                  {language === "ar" ? "مقارنة" : "Compare"}
                </TabsTrigger>
                <TabsTrigger value="aden" className="gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {language === "ar" ? "عدن" : "Aden"}
                </TabsTrigger>
                <TabsTrigger value="sanaa" className="gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  {language === "ar" ? "صنعاء" : "Sana'a"}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {language === "ar" ? "آخر تحديث: منذ 2 ساعة" : "Last updated: 2 hours ago"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Data Quality Banner */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-muted/50 rounded-lg">
          {dataQuality.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-sm">
                  <span className="font-semibold">{item.value}</span>{" "}
                  <span className="text-muted-foreground">
                    {language === "ar" ? item.labelAr : item.labelEn}
                  </span>
                </span>
              </div>
            );
          })}
          <Link href="/methodology" className="ml-auto">
            <Button variant="ghost" size="sm" className="gap-1 text-[#107040]">
              <Info className="h-4 w-4" />
              {language === "ar" ? "منهجية البيانات" : "Data Methodology"}
            </Button>
          </Link>
        </div>

        {/* Key Metrics - Comparison View */}
        {regimeTag === "both" && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              {language === "ar" ? "مقارنة المؤشرات الرئيسية" : "Key Indicators Comparison"}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Exchange Rate Comparison */}
              <Card className="col-span-full lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-[#C0A030]" />
                    {language === "ar" ? "سعر الصرف (YER/USD)" : "Exchange Rate (YER/USD)"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-muted-foreground">{language === "ar" ? "عدن" : "Aden"}</span>
                      </div>
                      <div className="text-2xl font-bold">{keyMetrics.aden.fxRate.value.toLocaleString()}</div>
                      <div className="text-xs text-red-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{keyMetrics.aden.fxRate.change}%
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-sm text-muted-foreground">{language === "ar" ? "صنعاء" : "Sana'a"}</span>
                      </div>
                      <div className="text-2xl font-bold">{keyMetrics.sanaa.fxRate.value.toLocaleString()}</div>
                      <div className="text-xs text-gray-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{keyMetrics.sanaa.fxRate.change}%
                      </div>
                    </div>
                  </div>
                  <div className="text-center p-2 bg-[#C0A030]/10 rounded">
                    <span className="text-sm font-medium text-[#C0A030]">
                      {language === "ar" ? "فجوة ~287%" : "~287% Gap"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Inflation Comparison */}
              <Card className="col-span-full lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-red-500" />
                    {language === "ar" ? "معدل التضخم" : "Inflation Rate"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-muted-foreground">{language === "ar" ? "عدن" : "Aden"}</span>
                      </div>
                      <div className="text-2xl font-bold">{keyMetrics.aden.inflation.value}%</div>
                      <div className="text-xs text-red-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{keyMetrics.aden.inflation.change}%
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-sm text-muted-foreground">{language === "ar" ? "صنعاء" : "Sana'a"}</span>
                      </div>
                      <div className="text-2xl font-bold">{keyMetrics.sanaa.inflation.value}%</div>
                      <div className="text-xs text-green-600 flex items-center">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {keyMetrics.sanaa.inflation.change}%
                      </div>
                    </div>
                  </div>
                  <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
                    <span className="text-sm font-medium text-red-600">
                      {language === "ar" ? "عدن أعلى بـ 22.7 نقطة" : "Aden 22.7pts higher"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Poverty Rate */}
              <Card className="col-span-full lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-purple-500" />
                    {language === "ar" ? "معدل الفقر" : "Poverty Rate"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-[#103050]">~80%</div>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? "من السكان تحت خط الفقر" : "of population below poverty line"}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" 
                        ? "تقديرات البنك الدولي وبرنامج الأمم المتحدة الإنمائي 2024"
                        : "World Bank & UNDP estimates 2024"}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {language === "ar" ? "الثقة: C" : "Confidence: C"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Single Regime View */}
        {(regimeTag === "aden" || regimeTag === "sanaa") && (
          <>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${regimeTag === "aden" ? "bg-blue-500" : "bg-red-500"}`}></div>
              {language === "ar" 
                ? `مؤشرات ${regimeTag === "aden" ? "عدن" : "صنعاء"}`
                : `${regimeTag === "aden" ? "Aden" : "Sana'a"} Indicators`}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title={language === "ar" ? "سعر الصرف" : "Exchange Rate"}
                value={keyMetrics[regimeTag].fxRate.value.toLocaleString()}
                unit="YER/USD"
                change={keyMetrics[regimeTag].fxRate.change}
                date={keyMetrics[regimeTag].fxRate.date}
                icon={DollarSign}
                regime={regimeTag}
              />
              <MetricCard
                title={language === "ar" ? "التضخم" : "Inflation"}
                value={keyMetrics[regimeTag].inflation.value}
                unit="%"
                change={keyMetrics[regimeTag].inflation.change}
                date={keyMetrics[regimeTag].inflation.date}
                icon={TrendingUp}
                regime={regimeTag}
              />
              <MetricCard
                title={language === "ar" ? "سعر الوقود" : "Fuel Price"}
                value={keyMetrics[regimeTag].fuelPrice.value.toLocaleString()}
                unit="YER/L"
                change={keyMetrics[regimeTag].fuelPrice.change}
                date={keyMetrics[regimeTag].fuelPrice.date}
                icon={Zap}
                regime={regimeTag}
              />
              <MetricCard
                title={language === "ar" ? "مؤشر الغذاء" : "Food Index"}
                value={keyMetrics[regimeTag].foodIndex.value}
                change={keyMetrics[regimeTag].foodIndex.change}
                date={keyMetrics[regimeTag].foodIndex.date}
                icon={Wheat}
                regime={regimeTag}
              />
            </div>
          </>
        )}

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Exchange Rate Trend */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === "ar" ? "اتجاه سعر الصرف" : "Exchange Rate Trend"}
              </CardTitle>
              <CardDescription>
                {language === "ar" ? "آخر 6 أشهر (YER/USD)" : "Last 6 months (YER/USD)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fxComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" domain={[1800, 2200]} />
                  <YAxis yAxisId="right" orientation="right" domain={[500, 600]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="aden" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name={language === "ar" ? "عدن" : "Aden"}
                    dot={{ fill: "#3B82F6" }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="sanaa" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name={language === "ar" ? "صنعاء" : "Sana'a"}
                    dot={{ fill: "#EF4444" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Inflation Trend */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === "ar" ? "اتجاه التضخم" : "Inflation Trend"}
              </CardTitle>
              <CardDescription>
                {language === "ar" ? "آخر 6 أشهر (%)" : "Last 6 months (%)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={inflationData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 40]} />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="aden" 
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    name={language === "ar" ? "عدن" : "Aden"}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sanaa" 
                    stroke="#EF4444" 
                    fill="#EF4444"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    name={language === "ar" ? "صنعاء" : "Sana'a"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Sector Breakdown & Recent Events */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* GDP Sector Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === "ar" ? "توزيع الناتج المحلي" : "GDP Breakdown"}
              </CardTitle>
              <CardDescription>
                {language === "ar" ? "حسب القطاع (تقديرات 2023)" : "By sector (2023 estimates)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {sectorData.map((sector, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: sector.color }}></div>
                    <span className="text-muted-foreground">{sector.name}</span>
                    <span className="font-medium ml-auto">{sector.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {language === "ar" ? "الأحداث الاقتصادية الأخيرة" : "Recent Economic Events"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "أحدث التطورات والسياسات" : "Latest developments and policies"}
                </CardDescription>
              </div>
              <Link href="/timeline">
                <Button variant="ghost" size="sm" className="gap-1">
                  {language === "ar" ? "عرض الكل" : "View All"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        event.impact === "critical" ? "bg-red-100 text-red-600" :
                        event.impact === "high" ? "bg-orange-100 text-orange-600" :
                        event.impact === "medium" ? "bg-yellow-100 text-yellow-600" :
                        "bg-green-100 text-green-600"
                      }`}>
                        <Calendar className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground mb-1 line-clamp-1">
                        {language === "ar" ? event.titleAr : event.titleEn}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{language === "ar" ? event.dateAr : event.dateEn}</span>
                        <Badge variant="outline" className={`text-xs ${
                          event.impact === "critical" ? "border-red-200 text-red-600" :
                          event.impact === "high" ? "border-orange-200 text-orange-600" :
                          event.impact === "medium" ? "border-yellow-200 text-yellow-600" :
                          "border-green-200 text-green-600"
                        }`}>
                          {event.impact}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Link href="/sectors/banking">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">{language === "ar" ? "القطاع المصرفي" : "Banking Sector"}</h4>
                  <p className="text-xs text-muted-foreground">{language === "ar" ? "عرض التفاصيل" : "View details"}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/sectors/trade">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Ship className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">{language === "ar" ? "التجارة" : "Trade"}</h4>
                  <p className="text-xs text-muted-foreground">{language === "ar" ? "عرض التفاصيل" : "View details"}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/sectors/food-security">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-lime-100 text-lime-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wheat className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">{language === "ar" ? "الأمن الغذائي" : "Food Security"}</h4>
                  <p className="text-xs text-muted-foreground">{language === "ar" ? "عرض التفاصيل" : "View details"}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/ai-assistant">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group bg-gradient-to-r from-[#107040]/5 to-[#107040]/10">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#107040] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">{language === "ar" ? "اسأل المساعد الذكي" : "Ask AI Assistant"}</h4>
                  <p className="text-xs text-muted-foreground">{language === "ar" ? "تحليل مخصص" : "Custom analysis"}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
