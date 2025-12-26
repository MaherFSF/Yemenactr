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

export default function Currency() {
  const { language } = useLanguage();

  // Exchange rate data
  const fxData = [
    { month: "Jan 24", adenOfficial: 1550, adenParallel: 1620, sanaaParallel: 535 },
    { month: "Feb 24", adenOfficial: 1560, adenParallel: 1650, sanaaParallel: 538 },
    { month: "Mar 24", adenOfficial: 1580, adenParallel: 1720, sanaaParallel: 540 },
    { month: "Apr 24", adenOfficial: 1600, adenParallel: 1780, sanaaParallel: 542 },
    { month: "May 24", adenOfficial: 1620, adenParallel: 1850, sanaaParallel: 545 },
    { month: "Jun 24", adenOfficial: 1650, adenParallel: 1920, sanaaParallel: 548 },
    { month: "Jul 24", adenOfficial: 1680, adenParallel: 1980, sanaaParallel: 550 },
    { month: "Aug 24", adenOfficial: 1700, adenParallel: 2050, sanaaParallel: 552 },
    { month: "Sep 24", adenOfficial: 1720, adenParallel: 2120, sanaaParallel: 555 },
    { month: "Oct 24", adenOfficial: 1750, adenParallel: 2180, sanaaParallel: 558 },
    { month: "Nov 24", adenOfficial: 1780, adenParallel: 2250, sanaaParallel: 560 },
    { month: "Dec 24", adenOfficial: 1800, adenParallel: 2320, sanaaParallel: 562 },
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
      value: "1,800 YER/$",
      change: 16.1,
      source: "CBY Aden",
      confidence: "A",
      regime: "IRG"
    },
    {
      titleEn: "Parallel Rate (Aden)",
      titleAr: "السعر الموازي (عدن)",
      value: "2,320 YER/$",
      change: 43.2,
      source: "Market Survey",
      confidence: "B",
      regime: "IRG"
    },
    {
      titleEn: "Parallel Rate (Sana'a)",
      titleAr: "السعر الموازي (صنعاء)",
      value: "562 YER/$",
      change: 5.0,
      source: "Market Survey",
      confidence: "B",
      regime: "DFA"
    },
    {
      titleEn: "North-South Spread",
      titleAr: "الفجوة شمال-جنوب",
      value: "313%",
      change: 45.0,
      source: "Calculated",
      confidence: "B"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:via-yellow-900/20 dark:to-yellow-950/30 border-b">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                {language === "ar" ? "العودة إلى لوحة المعلومات" : "Back to Dashboard"}
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-yellow-600" />
              </div>
              <Badge variant="outline" className="text-sm border-yellow-200 text-yellow-700">
                {language === "ar" ? "القطاع المالي" : "Financial Sector"}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "ar" 
                ? "العملة وأسعار الصرف"
                : "Currency & Exchange Rates"}
            </h1>
            <p className="text-lg text-muted-foreground">
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
                      stroke="#107040" 
                      strokeWidth={2}
                      name={language === "ar" ? "عدن - رسمي" : "Aden - Official"}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="adenParallel" 
                      stroke="#103050" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={language === "ar" ? "عدن - موازي" : "Aden - Parallel"}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="sanaaParallel" 
                      stroke="#C0A030" 
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
                      stroke="#103050" 
                      fill="#103050"
                      fillOpacity={0.3}
                      name={language === "ar" ? "فجوة عدن (%)" : "Aden Spread (%)"}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="northSouthSpread" 
                      stroke="#C0A030" 
                      fill="#C0A030"
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
      </div>
    </div>
  );
}
