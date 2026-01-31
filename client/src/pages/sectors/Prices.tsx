import { useLanguage } from "@/contexts/LanguageContext";
import { SourcesUsedPanel } from "@/components/SourcesUsedPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  Download,
  Info,
  AlertTriangle,
  FileText,
  ArrowLeft,
  MapPin
} from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import VintageSelector from "@/components/VintageSelector";
import EvidencePackButton from "@/components/EvidencePackButton";

export default function Prices() {
  const { language } = useLanguage();

  // CPI and inflation data (Updated January 2026 - World Bank, IMF)
  const inflationData = [
    { month: "Jan 25", aden: 15.2, sanaa: 12.8 },
    { month: "Feb 25", aden: 16.1, sanaa: 13.2 },
    { month: "Mar 25", aden: 17.5, sanaa: 13.5 },
    { month: "Apr 25", aden: 18.8, sanaa: 13.8 },
    { month: "May 25", aden: 20.2, sanaa: 14.1 },
    { month: "Jun 25", aden: 22.5, sanaa: 14.3 },
    { month: "Jul 25", aden: 25.8, sanaa: 14.5 }, // July 2025 crisis peak
    { month: "Aug 25", aden: 23.2, sanaa: 14.2 },
    { month: "Sep 25", aden: 20.5, sanaa: 14.0 },
    { month: "Oct 25", aden: 18.5, sanaa: 13.8 },
    { month: "Nov 25", aden: 17.2, sanaa: 13.5 },
    { month: "Dec 25", aden: 16.0, sanaa: 13.2 },
    { month: "Jan 26", aden: 15.0, sanaa: 13.0 },
  ];

  // January 2026 Alerts
  const alerts = [
    {
      titleEn: "July 2025: Aden inflation peaked at 25.8% during currency crisis",
      titleAr: "يوليو 2025: بلغ التضخم في عدن ذروته 25.8% خلال أزمة العملة",
      severity: "high",
      date: "Jul 2025"
    },
    {
      titleEn: "Food prices in Aden 15-25% higher than Sana'a due to currency gap",
      titleAr: "أسعار الغذاء في عدن أعلى بنسبة 15-25% من صنعاء بسبب فجوة العملة",
      severity: "medium",
      date: "Jan 2026"
    },
    {
      titleEn: "Fuel prices in Aden 18-20% higher than Sana'a",
      titleAr: "أسعار الوقود في عدن أعلى بنسبة 18-20% من صنعاء",
      severity: "medium",
      date: "Jan 2026"
    },
    {
      titleEn: "67% of households had inadequate food consumption (June 2025)",
      titleAr: "67% من الأسر لديها استهلاك غذائي غير كافٍ (يونيو 2025)",
      severity: "critical",
      date: "Jun 2025"
    },
  ];

  // Food basket costs by governorate
  const foodBasketData = [
    { governorate: language === "ar" ? "عدن" : "Aden", cost: 85000, regime: "IRG" },
    { governorate: language === "ar" ? "صنعاء" : "Sana'a", cost: 72000, regime: "DFA" },
    { governorate: language === "ar" ? "تعز" : "Taiz", cost: 78000, regime: "Mixed" },
    { governorate: language === "ar" ? "الحديدة" : "Hodeidah", cost: 68000, regime: "DFA" },
    { governorate: language === "ar" ? "مأرب" : "Marib", cost: 92000, regime: "IRG" },
    { governorate: language === "ar" ? "حضرموت" : "Hadramout", cost: 88000, regime: "IRG" },
  ];

  // Commodity prices
  const commodityPrices = [
    { 
      nameEn: "Wheat Flour (50kg)", 
      nameAr: "دقيق القمح (50 كجم)",
      adenPrice: 18500,
      sanaaPrice: 15200,
      change: 12.5
    },
    { 
      nameEn: "Rice (50kg)", 
      nameAr: "الأرز (50 كجم)",
      adenPrice: 32000,
      sanaaPrice: 28500,
      change: 8.3
    },
    { 
      nameEn: "Cooking Oil (18L)", 
      nameAr: "زيت الطبخ (18 لتر)",
      adenPrice: 24000,
      sanaaPrice: 21000,
      change: 15.2
    },
    { 
      nameEn: "Sugar (50kg)", 
      nameAr: "السكر (50 كجم)",
      adenPrice: 28000,
      sanaaPrice: 25500,
      change: 6.8
    },
    { 
      nameEn: "Diesel (Liter)", 
      nameAr: "الديزل (لتر)",
      adenPrice: 850,
      sanaaPrice: 720,
      change: 22.5
    },
  ];

  const kpis = [
    {
      titleEn: "Annual Inflation (Aden)",
      titleAr: "التضخم السنوي (عدن)",
      value: "15.0%",
      change: -8.5,
      source: "IMF Oct 2025",
      confidence: "A",
      regime: "IRG"
    },
    {
      titleEn: "Annual Inflation (Sana'a)",
      titleAr: "التضخم السنوي (صنعاء)",
      value: "32.1%",
      change: 8.5,
      source: "CSO Sana'a",
      confidence: "C",
      regime: "DFA"
    },
    {
      titleEn: "Food Basket Cost",
      titleAr: "تكلفة السلة الغذائية",
      value: "82,000 YER",
      change: 18.3,
      source: "WFP",
      confidence: "A"
    },
    {
      titleEn: "Fuel Price Index",
      titleAr: "مؤشر أسعار الوقود",
      value: "+45%",
      change: 45.0,
      source: "Market Survey",
      confidence: "B"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-100 via-orange-50 to-orange-100 dark:from-orange-950/30 dark:via-orange-900/20 dark:to-orange-950/30 border-b">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                {language === "ar" ? "العودة إلى لوحة المعلومات" : "Back to Dashboard"}
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              <Badge variant="outline" className="text-sm border-orange-200 text-orange-700">
                {language === "ar" ? "القطاع الاقتصادي" : "Economic Sector"}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "ar" 
                ? "الأسعار وتكلفة المعيشة"
                : "Prices & Cost of Living"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === "ar"
                ? "مراقبة التضخم وأسعار السلع الأساسية وتكاليف المعيشة عبر مناطق اليمن"
                : "Monitoring inflation, commodity prices, and living costs across Yemen's regions"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Vintage Selector Demo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {language === "ar" ? "مقارنة الإصدارات - بيانات التضخم" : "Vintage Comparison - Inflation Data"}
            </CardTitle>
            <CardDescription>
              {language === "ar" 
                ? "مقارنة الإصدارات المختلفة لبيانات التضخم - التصحيحات لا تستبدل البيانات القديمة"
                : "Compare different vintages of inflation data - corrections append, never overwrite"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VintageSelector
              vintages={[
                {
                  id: 1,
                  versionNumber: 1,
                  vintageDate: "2025-10-01",
                  changeType: "initial",
                  changeDescription: language === "ar" ? "الإصدار الأولي لبيانات التضخم 2025" : "Initial release of 2025 inflation data",
                  changeSummary: { recordsAdded: 156, recordsModified: 0, recordsDeleted: 0 }
                },
                {
                  id: 2,
                  versionNumber: 2,
                  vintageDate: "2025-11-15",
                  changeType: "revision",
                  changeDescription: language === "ar" ? "مراجعة بيانات يوليو 2025 بعد أزمة العملة" : "Revised July 2025 data after currency crisis",
                  changeSummary: { recordsAdded: 12, recordsModified: 8, recordsDeleted: 0, affectedIndicators: ["CPI Aden", "Food Prices"] }
                },
                {
                  id: 3,
                  versionNumber: 3,
                  vintageDate: "2026-01-10",
                  changeType: "correction",
                  changeDescription: language === "ar" ? "تصحيح أسعار الوقود في عدن" : "Correction to Aden fuel prices",
                  changeSummary: { recordsAdded: 0, recordsModified: 4, recordsDeleted: 0, affectedIndicators: ["Diesel Price", "Petrol Price"] }
                }
              ]}
              currentVintageId={3}
              onVintageChange={(id) => console.log("Selected vintage:", id)}
              onCompare={(id1, id2) => console.log("Comparing:", id1, "vs", id2)}
              language={language as "en" | "ar"}
            />
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
                  {kpi.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
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
                      indicatorId: `prices-kpi-${index}`,
                      indicatorNameEn: kpi.titleEn,
                      indicatorNameAr: kpi.titleAr,
                      value: kpi.value,
                      unit: "%",
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

        {/* Regime Comparison Warning */}
        <Card className="mb-8 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  {language === "ar" ? "مقارنة بين النظامين" : "Split-System Comparison"}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {language === "ar"
                    ? "الأسعار تختلف بشكل كبير بين مناطق سيطرة الحكومة الشرعية (IRG) ومناطق سيطرة سلطات الأمر الواقع (DFA) بسبب اختلاف العملة والسياسات الاقتصادية."
                    : "Prices differ significantly between IRG-controlled and DFA-controlled areas due to currency differences and economic policies."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Charts */}
        <Tabs defaultValue="inflation">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inflation">
              {language === "ar" ? "التضخم" : "Inflation"}
            </TabsTrigger>
            <TabsTrigger value="foodbasket">
              {language === "ar" ? "السلة الغذائية" : "Food Basket"}
            </TabsTrigger>
            <TabsTrigger value="commodities">
              {language === "ar" ? "أسعار السلع" : "Commodity Prices"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inflation">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "معدل التضخم الشهري (2024)" : "Monthly Inflation Rate (2024)"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "مقارنة بين عدن وصنعاء" : "Aden vs Sana'a comparison"}
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
                  <LineChart data={inflationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="aden" 
                      stroke="#2e8b6e" 
                      strokeWidth={2}
                      name={language === "ar" ? "عدن (IRG)" : "Aden (IRG)"}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sanaa" 
                      stroke="#C0A030" 
                      strokeWidth={2}
                      name={language === "ar" ? "صنعاء (DFA)" : "Sana'a (DFA)"}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{language === "ar" ? "المصدر" : "Source"}</span>
                  </div>
                  <p className="text-muted-foreground">
                    Central Statistical Organization (CSO) - Aden & Sana'a • WFP Market Monitors
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="foodbasket">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "تكلفة السلة الغذائية حسب المحافظة" : "Food Basket Cost by Governorate"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "بالريال اليمني" : "In Yemeni Rial (YER)"}
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
                  <BarChart data={foodBasketData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="governorate" type="category" width={100} />
                    <Tooltip />
                    <Bar 
                      dataKey="cost" 
                      fill="#2e8b6e"
                      name={language === "ar" ? "التكلفة (YER)" : "Cost (YER)"}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    {language === "ar" 
                      ? "السلة الغذائية الدنيا تشمل: دقيق، أرز، زيت، سكر، فاصوليا، ملح"
                      : "Minimum food basket includes: flour, rice, oil, sugar, beans, salt"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commodities">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "أسعار السلع الأساسية" : "Essential Commodity Prices"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "مقارنة بين عدن وصنعاء (ديسمبر 2024)" : "Aden vs Sana'a comparison (December 2024)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "السلعة" : "Commodity"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "عدن (YER)" : "Aden (YER)"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "صنعاء (YER)" : "Sana'a (YER)"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "التغير السنوي" : "YoY Change"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {commodityPrices.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            {language === "ar" ? item.nameAr : item.nameEn}
                          </td>
                          <td className="p-3">{item.adenPrice.toLocaleString()}</td>
                          <td className="p-3">{item.sanaaPrice.toLocaleString()}</td>
                          <td className="p-3">
                            <span className="text-red-600 flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              +{item.change}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                <h4 className="font-semibold mb-1">Yemen Market Monitor - December 2024</h4>
                <p className="text-sm text-muted-foreground mb-2">WFP • December 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-1">Cost of Living Analysis - Yemen Q4 2024</h4>
                <p className="text-sm text-muted-foreground mb-2">UNDP • November 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources Used Panel */}
      <SourcesUsedPanel sectorCode="prices" />
    </div>
  );
}
