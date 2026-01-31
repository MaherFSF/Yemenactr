import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Banknote,
  Download,
  Info,
  AlertTriangle,
  FileText,
  ArrowLeft,
  ArrowUpDown
} from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Sparkline, RegimeHeatmap, InsightsTicker, CorrelationMatrix } from "@/components/charts/EnhancedVisualizations";
import EvidencePackButton from "@/components/EvidencePackButton";
import ContradictionBadge from "@/components/ContradictionBadge";
import { SourcesUsedPanel } from "@/components/SourcesUsedPanel";
import { trpc } from "@/lib/trpc";

export default function Currency() {
  const { language } = useLanguage();
  const sectorCode = "currency";

  // Fetch sources used on this page
  const { data: sourcesData, isLoading: isSourcesLoading } = trpc.sectorPages.getSectorSources.useQuery({
    sectorCode,
    limit: 20
  });

  // Exchange rate data - Updated January 2026 (CBY Aden Annual Reports)
  const fxData = [
    { month: "Feb 25", adenOfficial: 1840, adenParallel: 1920, sanaaParallel: 530 },
    { month: "Mar 25", adenOfficial: 1860, adenParallel: 1950, sanaaParallel: 530 },
    { month: "Apr 25", adenOfficial: 1880, adenParallel: 1980, sanaaParallel: 530 },
    { month: "May 25", adenOfficial: 1900, adenParallel: 2000, sanaaParallel: 530 },
    { month: "Jun 25", adenOfficial: 1920, adenParallel: 2020, sanaaParallel: 530 },
    { month: "Jul 25", adenOfficial: 2050, adenParallel: 2905, sanaaParallel: 530 }, // All-time low for rial
    { month: "Aug 25", adenOfficial: 1676, adenParallel: 1720, sanaaParallel: 530 }, // CBY measures recovery
    { month: "Sep 25", adenOfficial: 1700, adenParallel: 1750, sanaaParallel: 530 },
    { month: "Oct 25", adenOfficial: 1750, adenParallel: 1800, sanaaParallel: 530 },
    { month: "Nov 25", adenOfficial: 1800, adenParallel: 1850, sanaaParallel: 530 },
    { month: "Dec 25", adenOfficial: 1850, adenParallel: 1900, sanaaParallel: 530 },
    { month: "Jan 26", adenOfficial: 1620, adenParallel: 1650, sanaaParallel: 535 },
  ];

  // Spread data
  const spreadData = fxData.map(d => ({
    month: d.month,
    adenSpread: ((d.adenParallel - d.adenOfficial) / d.adenOfficial * 100).toFixed(1),
    northSouthSpread: ((d.adenParallel - d.sanaaParallel) / d.sanaaParallel * 100).toFixed(1),
  }));

  const kpis = [
    {
      titleEn: "Official Rate (Aden)",
      titleAr: "السعر الرسمي (عدن)",
      value: "1,620 YER/$",
      change: 5.3,
      source: "CBY Aden Jan 2026",
      confidence: "A",
      regime: "IRG"
    },
    {
      titleEn: "Parallel Rate (Aden)",
      titleAr: "السعر الموازي (عدن)",
      value: "1,650 YER/$",
      change: -32.8,
      source: "Market Survey Jan 2026",
      confidence: "B",
      regime: "IRG"
    },
    {
      titleEn: "Parallel Rate (Sana'a)",
      titleAr: "السعر الموازي (صنعاء)",
      value: "530 YER/$",
      change: -5.7,
      source: "Market Survey Jan 2026",
      confidence: "B",
      regime: "DFA"
    },
    {
      titleEn: "North-South Spread",
      titleAr: "الفجوة شمال-جنوب",
      value: "268%",
      change: -14.4,
      source: "Calculated Jan 2026",
      confidence: "B"
    },
  ];

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
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A227]/90 to-[#8B7500]/80" />
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
              <Badge className="bg-[#4C583E] text-white border-0">
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

        {/* Contradiction Demo - Exchange Rate Disagreement */}
        <Card className="mb-6 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                    {language === "ar" ? "مصادر متعددة تختلف" : "Multiple Sources Disagree"}
                  </h4>
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    {language === "ar" ? "سعر الصرف الموازي (عدن)" : "Parallel Exchange Rate (Aden)"}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="text-xs text-gray-500 mb-1">{language === "ar" ? "البنك المركزي - عدن" : "CBY Aden"}</div>
                    <div className="text-lg font-bold text-[#4C583E]">1,650 YER/$</div>
                    <div className="text-xs text-gray-400">{language === "ar" ? "مكاتب الصرافة المرخصة" : "Licensed bureaus"}</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="text-xs text-gray-500 mb-1">{language === "ar" ? "مسح سوق يتو" : "YETO Survey"}</div>
                    <div className="text-lg font-bold text-[#768064]">1,680 YER/$</div>
                    <div className="text-xs text-gray-400">{language === "ar" ? "15 نقطة صرف" : "15 exchange points"}</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="text-xs text-gray-500 mb-1">{language === "ar" ? "رويترز" : "Reuters"}</div>
                    <div className="text-lg font-bold text-[#C9A227]">1,665 YER/$</div>
                    <div className="text-xs text-gray-400">{language === "ar" ? "سعر مركب" : "Composite rate"}</div>
                  </div>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      {language === "ar" ? "لماذا تختلف" : "Why They Differ"}
                    </span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {language === "ar"
                      ? "يستخدم البنك المركزي أسعار المكاتب المرخصة التي قد تتأخر عن أسعار السوق. مسح يتو يلتقط المعاملات على مستوى الشارع. رويترز تجمع عروض أسعار متعددة من التجار."
                      : "CBY Aden uses licensed bureau rates which may lag market rates. YETO survey captures street-level transactions. Reuters aggregates multiple dealer quotes."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
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
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">
                    +{kpi.change}% YoY
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {kpi.source}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <EvidencePackButton 
                    data={{
                      indicatorId: `currency-kpi-${index}`,
                      indicatorNameEn: kpi.titleEn,
                      indicatorNameAr: kpi.titleAr,
                      value: kpi.value,
                      unit: "YER/$",
                      timestamp: new Date().toISOString(),
                      confidence: kpi.confidence as "A" | "B" | "C" | "D",
                      sources: [{
                        id: `src-${index}`,
                        name: kpi.source,
                        nameAr: kpi.source,
                        type: kpi.confidence === "A" ? "official" : "estimate",
                        date: "2026-01-15",
                        quality: kpi.confidence as "A" | "B" | "C" | "D"
                      }]
                    }}
                    variant="link"
                    size="sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
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
                      {language === "ar" ? "أسعار الصرف الشهرية (2024)" : "Monthly Exchange Rates (2024)"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "ريال يمني مقابل الدولار الأمريكي" : "YER per USD"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    {language === "ar" ? "تصدير" : "Export"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={fxData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" domain={[0, 2500]} />
                    <YAxis yAxisId="right" orientation="right" domain={[500, 600]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="adenOfficial" 
                      stroke="#4C583E" 
                      strokeWidth={2}
                      name={language === "ar" ? "عدن - رسمي" : "Aden - Official"}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="adenParallel" 
                      stroke="#768064" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={language === "ar" ? "عدن - موازي" : "Aden - Parallel"}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="sanaaParallel" 
                      stroke="#C9A227" 
                      strokeWidth={2}
                      name={language === "ar" ? "صنعاء - موازي" : "Sana'a - Parallel"}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{language === "ar" ? "ملاحظة" : "Note"}</span>
                  </div>
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "صنعاء تستخدم مقياس مختلف (المحور الأيمن) بسبب الفجوة الكبيرة في الأسعار"
                      : "Sana'a uses a different scale (right axis) due to the significant price divergence"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spread">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "تحليل الفجوة" : "Spread Analysis"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "الفرق بين الأسعار الرسمية والموازية" : "Difference between official and parallel rates"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    {language === "ar" ? "تصدير" : "Export"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={spreadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="adenSpread" 
                      stroke="#768064" 
                      fill="#768064"
                      fillOpacity={0.3}
                      name={language === "ar" ? "فجوة عدن (%)" : "Aden Spread (%)"}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="northSouthSpread" 
                      stroke="#C9A227" 
                      fill="#C9A227"
                      fillOpacity={0.3}
                      name={language === "ar" ? "فجوة شمال-جنوب (%)" : "North-South Spread (%)"}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historical">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "الأحداث الرئيسية في سوق الصرف" : "Key FX Market Events"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground w-24">2019</div>
                    <div>
                      <h4 className="font-semibold">
                        {language === "ar" ? "انقسام العملة" : "Currency Split"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar"
                          ? "سلطات صنعاء تحظر الأوراق النقدية الجديدة"
                          : "Sana'a authorities ban new banknotes"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground w-24">2022</div>
                    <div>
                      <h4 className="font-semibold">
                        {language === "ar" ? "وديعة سعودية" : "Saudi Deposit"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar"
                          ? "وديعة بقيمة مليار دولار تدعم الريال مؤقتاً"
                          : "$1B deposit temporarily supports the Rial"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground w-24">2024</div>
                    <div>
                      <h4 className="font-semibold">
                        {language === "ar" ? "أزمة البحر الأحمر" : "Red Sea Crisis"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar"
                          ? "اضطرابات الشحن تؤثر على التجارة وتدفقات العملة"
                          : "Shipping disruptions affect trade and currency flows"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sources Used Panel */}
        <div className="mt-8">
          <SourcesUsedPanel sectorCode="currency" />
        </div>

        {/* Related Research */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {language === "ar" ? "الأبحاث ذات الصلة" : "Related Research"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-1">Yemen's Dual Currency Crisis</h4>
                <p className="text-sm text-muted-foreground mb-2">Sana'a Center • November 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-1">Central Bank Policy Analysis - Yemen</h4>
                <p className="text-sm text-muted-foreground mb-2">Rethinking Yemen's Economy • October 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Visualizations Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#768064] mb-6">
            {language === "ar" ? "التحليلات المتقدمة" : "Advanced Analytics"}
          </h2>
          
          {/* Insights Ticker */}
          <Card className="mb-6 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#4C583E]" />
                {language === "ar" ? "رؤى العملة" : "Currency Insights"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InsightsTicker
                insights={[
                  {
                    id: "1",
                    type: "alert",
                    priority: "critical",
                    title: "Aden parallel rate hits record 2,320 YER/USD",
                    titleAr: "سعر الصرف الموازي في عدن يصل لمستوى قياسي 2,320 ريال/دولار",
                    indicator: "FX Rate",
                    value: 2320,
                    change: 43.2
                  },
                  {
                    id: "2",
                    type: "warning",
                    priority: "high",
                    title: "North-South currency spread exceeds 300%",
                    titleAr: "فجوة العملة بين الشمال والجنوب تتجاوز 300%",
                    indicator: "Spread",
                    value: 313,
                    change: 25
                  },
                  {
                    id: "3",
                    type: "info",
                    priority: "medium",
                    title: "Sana'a rate stable at 562 YER/USD",
                    titleAr: "سعر صنعاء مستقر عند 562 ريال/دولار",
                    indicator: "FX Rate",
                    value: 562,
                    change: 5
                  }
                ]}
                speed={45}
              />
            </CardContent>
          </Card>

          {/* Regime Comparison Heatmap */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-[#C9A227]" />
                {language === "ar" ? "مقارنة أسعار الصرف" : "Exchange Rate Comparison"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegimeHeatmap
                data={[
                  {
                    indicator: "Official Rate",
                    indicatorAr: "السعر الرسمي",
                    adenValue: 1800,
                    sanaaValue: 562,
                    divergence: 220.3,
                    trend: "widening"
                  },
                  {
                    indicator: "Parallel Rate",
                    indicatorAr: "السعر الموازي",
                    adenValue: 2320,
                    sanaaValue: 562,
                    divergence: 312.8,
                    trend: "widening"
                  },
                  {
                    indicator: "Monthly Volatility",
                    indicatorAr: "التقلب الشهري",
                    adenValue: 8.5,
                    sanaaValue: 1.2,
                    divergence: 608.3,
                    trend: "widening"
                  }
                ]}
                title="Currency Divergence"
                titleAr="تباين العملة"
              />
            </CardContent>
          </Card>

          {/* Sparkline Trends */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "عدن - موازي" : "Aden Parallel"}
                  </p>
                  <p className="text-2xl font-bold text-[#768064]">2,320</p>
                </div>
                <Sparkline 
                  data={[1620, 1720, 1850, 1980, 2050, 2120, 2180, 2250, 2320]} 
                  color="#dc2626"
                  showTrend={true}
                />
              </div>
              <p className="text-xs text-red-600">↑ 43.2% {language === "ar" ? "سنوياً" : "YoY"}</p>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "صنعاء - موازي" : "Sana'a Parallel"}
                  </p>
                  <p className="text-2xl font-bold text-[#768064]">562</p>
                </div>
                <Sparkline 
                  data={[535, 538, 540, 545, 548, 550, 555, 558, 562]} 
                  color="#16a34a"
                  showTrend={true}
                />
              </div>
              <p className="text-xs text-green-600">↑ 5.0% {language === "ar" ? "سنوياً" : "YoY"}</p>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "الفجوة" : "Spread"}
                  </p>
                  <p className="text-2xl font-bold text-red-600">313%</p>
                </div>
                <Sparkline 
                  data={[203, 220, 243, 260, 279, 285, 293, 303, 313]} 
                  color="#dc2626"
                  showTrend={true}
                />
              </div>
              <p className="text-xs text-red-600">↑ {language === "ar" ? "يتسع" : "Widening"}</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Sources Used Panel */}
      <SourcesUsedPanel sectorCode="currency" />
    </div>
  );
}
