import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataQualityBadge from "@/components/DataQualityBadge";
import { ConfidenceBadge } from "@/components/DataCard";
import { ExportButton } from "@/components/ExportButton";
import SectorExportButtons from "@/components/SectorExportButtons";
import { Download } from "lucide-react";
import { 
  Landmark, 
  TrendingUp, 
  TrendingDown,
  Banknote,
  CreditCard,
  AlertCircle,
  Info,
  FileText,
  Scale
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, PieChart, Pie, Cell } from 'recharts';
import { useState, useMemo } from "react";
import { Sparkline, RegimeHeatmap, InsightsTicker, CorrelationMatrix } from "@/components/charts/EnhancedVisualizations";
import { trpc } from "@/lib/trpc";

export default function Banking() {
  const { language } = useLanguage();
  const [selectedRegime, setSelectedRegime] = useState<"both" | "aden" | "sanaa">("both");

  // Exchange Rate Data (2020-2026) - Based on actual CBY data
  const exchangeRateData = [
    { year: "2020", adenRate: 730, sanaaRate: 600, spread: 130 },
    { year: "2021", adenRate: 1050, sanaaRate: 600, spread: 450 },
    { year: "2022", adenRate: 1150, sanaaRate: 560, spread: 590 },
    { year: "2023", adenRate: 1550, sanaaRate: 535, spread: 1015 },
    { year: "2024", adenRate: 1890, sanaaRate: 530, spread: 1360 },
    { year: "2025", adenRate: 2050, sanaaRate: 530, spread: 1520 },
    { year: "2026*", adenRate: 1950, sanaaRate: 530, spread: 1420 },
  ];

  // Monthly FX data for 2025-2026 (latest 12 months)
  const monthlyFXData = [
    { month: language === "ar" ? "فبراير 2025" : "Feb 2025", aden: 1920, sanaa: 530 },
    { month: language === "ar" ? "مارس" : "Mar", aden: 1950, sanaa: 530 },
    { month: language === "ar" ? "أبريل" : "Apr", aden: 1980, sanaa: 530 },
    { month: language === "ar" ? "مايو" : "May", aden: 2000, sanaa: 530 },
    { month: language === "ar" ? "يونيو" : "Jun", aden: 2020, sanaa: 530 },
    { month: language === "ar" ? "يوليو" : "Jul", aden: 2030, sanaa: 530 },
    { month: language === "ar" ? "أغسطس" : "Aug", aden: 2040, sanaa: 530 },
    { month: language === "ar" ? "سبتمبر" : "Sep", aden: 2050, sanaa: 530 },
    { month: language === "ar" ? "أكتوبر" : "Oct", aden: 2040, sanaa: 530 },
    { month: language === "ar" ? "نوفمبر" : "Nov", aden: 2020, sanaa: 530 },
    { month: language === "ar" ? "ديسمبر" : "Dec", aden: 2000, sanaa: 530 },
    { month: language === "ar" ? "يناير 2026" : "Jan 2026", aden: 1950, sanaa: 530 },
  ];

  // Inflation data (2019-2026)
  const inflationData = [
    { year: "2019", aden: 10.0, sanaa: 8.5, food: 15.2 },
    { year: "2020", aden: 22.0, sanaa: 12.0, food: 28.5 },
    { year: "2021", aden: 35.0, sanaa: 15.0, food: 42.0 },
    { year: "2022", aden: 28.0, sanaa: 18.0, food: 35.0 },
    { year: "2023", aden: 25.0, sanaa: 18.3, food: 32.0 },
    { year: "2024", aden: 22.5, sanaa: 16.0, food: 28.0 },
    { year: "2025", aden: 18.0, sanaa: 14.5, food: 24.0 },
    { year: "2026*", aden: 15.0, sanaa: 13.0, food: 20.0 },
  ];

  // Banking sector data
  const bankingSectorData = [
    { 
      nameEn: "Commercial Banks",
      nameAr: "البنوك التجارية",
      count: 18,
      assets: 2850,
      deposits: 1920,
      loans: 680,
      npl: 45
    },
    { 
      nameEn: "Islamic Banks",
      nameAr: "البنوك الإسلامية",
      count: 4,
      assets: 520,
      deposits: 380,
      loans: 120,
      npl: 38
    },
    { 
      nameEn: "Microfinance",
      nameAr: "التمويل الأصغر",
      count: 12,
      assets: 85,
      deposits: 45,
      loans: 62,
      npl: 25
    },
  ];

  // Foreign reserves data (2014-2026)
  const reservesData = [
    { year: "2014", reserves: 4700 },
    { year: "2015", reserves: 2100 },
    { year: "2016", reserves: 1200 },
    { year: "2017", reserves: 850 },
    { year: "2018", reserves: 1100 },
    { year: "2019", reserves: 1500 },
    { year: "2020", reserves: 1200 },
    { year: "2021", reserves: 1800 },
    { year: "2022", reserves: 1400 },
    { year: "2023", reserves: 1100 },
    { year: "2024", reserves: 850 },
    { year: "2025", reserves: 1200 },
    { year: "2026*", reserves: 1150 },
  ];

  // Money supply data (2019-2026)
  const moneySupplyData = [
    { year: "2019", m1: 2800, m2: 4200 },
    { year: "2020", m1: 3200, m2: 4800 },
    { year: "2021", m1: 3800, m2: 5600 },
    { year: "2022", m1: 4200, m2: 6200 },
    { year: "2023", m1: 4800, m2: 7000 },
    { year: "2024", m1: 5400, m2: 7800 },
    { year: "2025", m1: 6100, m2: 8600 },
    { year: "2026*", m1: 6400, m2: 9000 },
  ];

  // Financial inclusion data
  const financialInclusionData = [
    { name: language === "ar" ? "حساب بنكي" : "Bank Account", value: 6 },
    { name: language === "ar" ? "محفظة إلكترونية" : "Mobile Wallet", value: 12 },
    { name: language === "ar" ? "تحويلات مالية" : "Remittances", value: 25 },
    { name: language === "ar" ? "بدون خدمات" : "Unbanked", value: 57 },
  ];

  const COLORS = ['#2e8b6e', '#2e8b6e', '#C0A030', '#9E9E9E'];

  // Banking alerts - January 2026 updates
  const bankingAlerts = [
    {
      type: "error",
      titleEn: "CBY Aden instructed to freeze al-Zubaidi's bank accounts following STC dissolution",
      titleAr: "البنك المركزي عدن يُوجَّه بتجميد حسابات الزبيدي بعد حل المجلس الانتقالي",
      dateEn: "Jan 10, 2026",
      dateAr: "10 يناير 2026"
    },
    {
      type: "warning",
      titleEn: "79 exchange companies had licenses suspended/revoked in 2025 regulation campaign",
      titleAr: "79 شركة صرافة تم تعليق/إلغاء تراخيصها في حملة التنظيم 2025",
      dateEn: "Jan 2, 2026",
      dateAr: "2 يناير 2026"
    },
    {
      type: "info",
      titleEn: "CBY Aden holds first 2026 board meeting, approves 2025 audit contract",
      titleAr: "البنك المركزي عدن يعقد أول اجتماع لمجلس الإدارة 2026، يوافق على عقد تدقيق 2025",
      dateEn: "Jan 9, 2026",
      dateAr: "9 يناير 2026"
    },
    {
      type: "warning",
      titleEn: "STC dissolution creates uncertainty for banking operations in Aden",
      titleAr: "حل المجلس الانتقالي يخلق حالة عدم يقين للعمليات المصرفية في عدن",
      dateEn: "Jan 9, 2026",
      dateAr: "9 يناير 2026"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(/sectors/banking.png)` }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2e8b6e]/90 to-[#6b8e6b]/80" />
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container relative h-full flex items-center">
          <div className={`max-w-2xl ${language === 'ar' ? 'mr-auto text-right' : 'ml-0'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Landmark className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-[#2e8b6e] text-white border-0">
                {language === "ar" ? "القطاع المصرفي" : "Banking Sector"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "القطاع المصرفي والمالي"
                : "Banking & Finance"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "تحليل شامل للقطاع المصرفي، أسعار الصرف، التضخم، والسياسة النقدية في كلا النظامين"
                : "Comprehensive analysis of the banking sector, exchange rates, inflation, and monetary policy across both regimes"}
            </p>
            <div className="flex flex-wrap gap-4">
              <ExportButton 
                data={exchangeRateData}
                filename="yemen_banking_data"
                title={language === "ar" ? "تصدير البيانات" : "Export Data"}
                variant="default"
                size="lg"
              />
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2">
                <FileText className="h-5 w-5" />
                {language === "ar" ? "تقرير القطاع المصرفي" : "Banking Sector Report"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Regime Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="text-sm text-muted-foreground">
            {language === "ar" ? "عرض البيانات:" : "Show Data:"}
          </span>
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setSelectedRegime("both")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedRegime === "both" 
                  ? "bg-[#2e8b6e] text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {language === "ar" ? "كلاهما" : "Both"}
            </button>
            <button
              onClick={() => setSelectedRegime("aden")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-x ${
                selectedRegime === "aden" 
                  ? "bg-[#2e8b6e] text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {language === "ar" ? "عدن" : "Aden"}
            </button>
            <button
              onClick={() => setSelectedRegime("sanaa")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedRegime === "sanaa" 
                  ? "bg-[#C0A030] text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {language === "ar" ? "صنعاء" : "Sana'a"}
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-[#2e8b6e]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "سعر الصرف (عدن)" : "Exchange Rate (Aden)"}</span>
                <DataQualityBadge quality="verified" size="sm" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2e8b6e]">1,890</div>
              <div className="text-sm text-muted-foreground">{language === "ar" ? "ريال/دولار" : "YER/USD"}</div>
              <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>+21.9%</span>
                <span className="text-muted-foreground">{language === "ar" ? "سنوياً" : "YoY"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#C0A030]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "سعر الصرف (صنعاء)" : "Exchange Rate (Sana'a)"}</span>
                <DataQualityBadge quality="verified" size="sm" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2e8b6e]">530</div>
              <div className="text-sm text-muted-foreground">{language === "ar" ? "ريال/دولار" : "YER/USD"}</div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <TrendingDown className="h-4 w-4" />
                <span>-0.9%</span>
                <span className="text-muted-foreground">{language === "ar" ? "سنوياً" : "YoY"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "فجوة سعر الصرف" : "FX Spread"}</span>
                <DataQualityBadge quality="verified" size="sm" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">1,360</div>
              <div className="text-sm text-muted-foreground">{language === "ar" ? "ريال فرق" : "YER Gap"}</div>
              <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>+34%</span>
                <span className="text-muted-foreground">{language === "ar" ? "سنوياً" : "YoY"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "الاحتياطيات الأجنبية" : "Foreign Reserves"}</span>
                <DataQualityBadge quality="provisional" size="sm" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2e8b6e]">$1.15B</div>
              <div className="text-sm text-muted-foreground">{language === "ar" ? "تقديري" : "Estimated"}</div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>+35.3%</span>
                <span className="text-muted-foreground">{language === "ar" ? "سنوياً" : "YoY"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Banking Alerts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              {language === "ar" ? "تنبيهات القطاع المصرفي" : "Banking Sector Alerts"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {bankingAlerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.type === "error" 
                      ? "bg-red-50 border-red-500 dark:bg-red-900/20"
                      : alert.type === "warning"
                      ? "bg-amber-50 border-amber-500 dark:bg-amber-900/20"
                      : "bg-blue-50 border-blue-500 dark:bg-blue-900/20"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {language === "ar" ? alert.titleAr : alert.titleEn}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {language === "ar" ? alert.dateAr : alert.dateEn}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Export Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-[#2e8b6e]" />
              {language === "ar" ? "تصدير بيانات القطاع المصرفي" : "Export Banking Data"}
            </CardTitle>
            <CardDescription>
              {language === "ar" 
                ? "تحميل بيانات القطاع المصرفي بتنسيقات مختلفة للتحليل والتقارير"
                : "Download banking sector data in various formats for analysis and reporting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SectorExportButtons
              sectorName="banking"
              datasets={[
                {
                  title: language === "ar" ? "سعر الصرف" : "Exchange Rate",
                  data: exchangeRateData,
                  filename: "yemen_exchange_rate"
                },
                {
                  title: language === "ar" ? "التضخم" : "Inflation",
                  data: inflationData,
                  filename: "yemen_inflation"
                },
                {
                  title: language === "ar" ? "البنوك" : "Banks",
                  data: bankingSectorData,
                  filename: "yemen_banks"
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="exchange" className="mb-8">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="exchange">
              {language === "ar" ? "سعر الصرف" : "Exchange Rate"}
            </TabsTrigger>
            <TabsTrigger value="inflation">
              {language === "ar" ? "التضخم" : "Inflation"}
            </TabsTrigger>
            <TabsTrigger value="banks">
              {language === "ar" ? "البنوك" : "Banks"}
            </TabsTrigger>
            <TabsTrigger value="reserves">
              {language === "ar" ? "الاحتياطيات" : "Reserves"}
            </TabsTrigger>
            <TabsTrigger value="inclusion">
              {language === "ar" ? "الشمول المالي" : "Inclusion"}
            </TabsTrigger>
          </TabsList>

          {/* Exchange Rate Tab */}
          <TabsContent value="exchange" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {language === "ar" ? "سعر الصرف السنوي (2020-2024)" : "Annual Exchange Rate (2020-2024)"}
                      </CardTitle>
                      <CardDescription>
                        {language === "ar" ? "ريال يمني مقابل الدولار الأمريكي" : "YER per USD"}
                      </CardDescription>
                    </div>
                    <DataQualityBadge quality="verified" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={exchangeRateData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Legend />
                      {(selectedRegime === "both" || selectedRegime === "aden") && (
                        <Line 
                          type="monotone" 
                          dataKey="adenRate" 
                          stroke="#2e8b6e" 
                          strokeWidth={2}
                          name={language === "ar" ? "عدن" : "Aden"}
                          dot={{ fill: "#2e8b6e" }}
                        />
                      )}
                      {(selectedRegime === "both" || selectedRegime === "sanaa") && (
                        <Line 
                          type="monotone" 
                          dataKey="sanaaRate" 
                          stroke="#C0A030" 
                          strokeWidth={2}
                          name={language === "ar" ? "صنعاء" : "Sana'a"}
                          dot={{ fill: "#C0A030" }}
                        />
                      )}
                      <Bar 
                        dataKey="spread" 
                        fill="#EF4444" 
                        fillOpacity={0.3}
                        name={language === "ar" ? "الفجوة" : "Spread"}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {language === "ar" ? "سعر الصرف الشهري (2024)" : "Monthly Exchange Rate (2024)"}
                      </CardTitle>
                      <CardDescription>
                        {language === "ar" ? "ريال يمني مقابل الدولار الأمريكي" : "YER per USD"}
                      </CardDescription>
                    </div>
                    <DataQualityBadge quality="verified" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyFXData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Legend />
                      {(selectedRegime === "both" || selectedRegime === "aden") && (
                        <Area 
                          type="monotone" 
                          dataKey="aden" 
                          stroke="#2e8b6e" 
                          fill="#2e8b6e"
                          fillOpacity={0.3}
                          name={language === "ar" ? "عدن" : "Aden"}
                        />
                      )}
                      {(selectedRegime === "both" || selectedRegime === "sanaa") && (
                        <Area 
                          type="monotone" 
                          dataKey="sanaa" 
                          stroke="#C0A030" 
                          fill="#C0A030"
                          fillOpacity={0.3}
                          name={language === "ar" ? "صنعاء" : "Sana'a"}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Currency Divergence Alert */}
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Scale className="h-8 w-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      {language === "ar" ? "تحذير: انقسام العملة" : "Warning: Currency Bifurcation"}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {language === "ar"
                        ? "وصلت فجوة سعر الصرف بين نظامي عدن وصنعاء إلى مستوى قياسي يبلغ 1,360 ريال. هذا الانقسام يعكس السياسات النقدية المتباينة ويؤثر بشكل كبير على التجارة والتحويلات المالية بين المنطقتين."
                        : "The exchange rate gap between Aden and Sana'a regimes has reached a record high of 1,360 YER. This bifurcation reflects divergent monetary policies and significantly impacts trade and remittances between regions."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inflation Tab */}
          <TabsContent value="inflation" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {language === "ar" ? "معدل التضخم السنوي" : "Annual Inflation Rate"}
                      </CardTitle>
                      <CardDescription>
                        {language === "ar" ? "نسبة مئوية" : "Percentage"}
                      </CardDescription>
                    </div>
                    <DataQualityBadge quality="provisional" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={inflationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                      <Legend />
                      {(selectedRegime === "both" || selectedRegime === "aden") && (
                        <Line 
                          type="monotone" 
                          dataKey="aden" 
                          stroke="#2e8b6e" 
                          strokeWidth={2}
                          name={language === "ar" ? "عدن" : "Aden"}
                        />
                      )}
                      {(selectedRegime === "both" || selectedRegime === "sanaa") && (
                        <Line 
                          type="monotone" 
                          dataKey="sanaa" 
                          stroke="#C0A030" 
                          strokeWidth={2}
                          name={language === "ar" ? "صنعاء" : "Sana'a"}
                        />
                      )}
                      <Line 
                        type="monotone" 
                        dataKey="food" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name={language === "ar" ? "تضخم الغذاء" : "Food Inflation"}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "مؤشرات التضخم الرئيسية" : "Key Inflation Indicators"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? "التضخم العام (عدن)" : "General Inflation (Aden)"}
                      </span>
                      <Badge variant="outline" className="bg-red-50 text-red-700">22.5%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-red-500" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? "التضخم العام (صنعاء)" : "General Inflation (Sana'a)"}
                      </span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">16.0%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-amber-500" style={{ width: '53%' }} />
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? "تضخم أسعار الغذاء" : "Food Price Inflation"}
                      </span>
                      <Badge variant="outline" className="bg-red-50 text-red-700">28.0%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-red-600" style={{ width: '93%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Banks Tab */}
          <TabsContent value="banks" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {bankingSectorData.map((sector, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {language === "ar" ? sector.nameAr : sector.nameEn}
                    </CardTitle>
                    <CardDescription>
                      {sector.count} {language === "ar" ? "مؤسسة" : "institutions"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "إجمالي الأصول" : "Total Assets"}
                        </p>
                        <p className="font-semibold">${sector.assets}M</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "الودائع" : "Deposits"}
                        </p>
                        <p className="font-semibold">${sector.deposits}M</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "القروض" : "Loans"}
                        </p>
                        <p className="font-semibold">${sector.loans}M</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "القروض المتعثرة" : "NPL Ratio"}
                        </p>
                        <p className="font-semibold text-red-600">{sector.npl}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* NPL Warning */}
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-8 w-8 text-amber-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      {language === "ar" ? "تحذير: ارتفاع نسبة القروض المتعثرة" : "Warning: High NPL Ratios"}
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {language === "ar"
                        ? "تتجاوز نسبة القروض المتعثرة في البنوك التجارية 45%، وهو مستوى مرتفع للغاية يعكس التحديات الاقتصادية وعدم قدرة المقترضين على السداد بسبب الصراع."
                        : "NPL ratios in commercial banks exceed 45%, an extremely high level reflecting economic challenges and borrowers' inability to repay due to the conflict."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reserves Tab */}
          <TabsContent value="reserves" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {language === "ar" ? "الاحتياطيات الأجنبية (2014-2024)" : "Foreign Reserves (2014-2024)"}
                      </CardTitle>
                      <CardDescription>
                        {language === "ar" ? "بالمليون دولار أمريكي" : "In USD Millions"}
                      </CardDescription>
                    </div>
                    <DataQualityBadge quality="provisional" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reservesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`$${value}M`, '']} />
                      <Area 
                        type="monotone" 
                        dataKey="reserves" 
                        stroke="#2e8b6e" 
                        fill="#2e8b6e"
                        fillOpacity={0.3}
                        name={language === "ar" ? "الاحتياطيات" : "Reserves"}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {language === "ar" ? "عرض النقود (M1 & M2)" : "Money Supply (M1 & M2)"}
                      </CardTitle>
                      <CardDescription>
                        {language === "ar" ? "بالمليار ريال يمني" : "In YER Billions"}
                      </CardDescription>
                    </div>
                    <DataQualityBadge quality="experimental" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={moneySupplyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="m1" 
                        fill="#2e8b6e" 
                        name="M1"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="m2" 
                        fill="#C0A030" 
                        name="M2"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Inclusion Tab */}
          <TabsContent value="inclusion" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "الشمول المالي في اليمن" : "Financial Inclusion in Yemen"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "نسبة السكان البالغين" : "Percentage of Adult Population"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={financialInclusionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {financialInclusionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "تفاصيل الشمول المالي" : "Financial Inclusion Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-red-600" />
                        <span className="font-medium">{language === "ar" ? "بدون خدمات مصرفية" : "Unbanked"}</span>
                      </div>
                      <span className="text-2xl font-bold text-red-600">57%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {language === "ar"
                        ? "أكثر من نصف السكان البالغين ليس لديهم حساب مصرفي أو محفظة إلكترونية"
                        : "Over half of adult population has no bank account or mobile wallet"}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{language === "ar" ? "التحويلات المالية" : "Remittances"}</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">25%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {language === "ar"
                        ? "ربع السكان يعتمدون على التحويلات من الخارج كمصدر دخل رئيسي"
                        : "Quarter of population relies on remittances as primary income source"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Visualizations Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#2e8b6e] mb-6">
            {language === "ar" ? "التحليلات المتقدمة" : "Advanced Analytics"}
          </h2>
          
          {/* Insights Ticker */}
          <Card className="mb-6 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#2e8b6e]" />
                {language === "ar" ? "رؤى مباشرة" : "Live Insights"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InsightsTicker
                insights={[
                  {
                    id: "1",
                    type: "alert",
                    priority: "critical",
                    title: "CBY Aden freezes al-Zubaidi accounts after STC dissolution (Jan 10, 2026)",
                    titleAr: "البنك المركزي عدن يجمد حسابات الزبيدي بعد حل المجلس الانتقالي (10 يناير 2026)",
                    indicator: "Political Risk",
                    value: 0,
                    change: 0
                  },
                  {
                    id: "2",
                    type: "warning",
                    priority: "high",
                    title: "79 exchange companies suspended/revoked in 2025 CBY regulation campaign",
                    titleAr: "79 شركة صرافة تم تعليق/إلغاء تراخيصها في حملة التنظيم 2025",
                    indicator: "Exchange Licenses",
                    value: 79,
                    change: -79
                  },
                  {
                    id: "3",
                    type: "positive",
                    priority: "medium",
                    title: "Exchange rate stabilizing at ~1,950 YER/USD after 2025 peak of 2,050",
                    titleAr: "سعر الصرف يستقر عند ~1,950 ريال/دولار بعد ذروة 2025 عند 2,050",
                    indicator: "FX Rate",
                    value: 1950,
                    change: -4.9
                  },
                  {
                    id: "4",
                    type: "info",
                    priority: "medium",
                    title: "CBY Aden holds first 2026 board meeting, approves 2025 audit (Jan 9)",
                    titleAr: "البنك المركزي عدن يعقد أول اجتماع 2026، يوافق على تدقيق 2025 (9 يناير)",
                    indicator: "NPL",
                    value: 45,
                    change: 5
                  }
                ]}
                speed={40}
              />
            </CardContent>
          </Card>

          {/* Regime Comparison Heatmap */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-[#C0A030]" />
                {language === "ar" ? "مقارنة المؤشرات بين النظامين" : "Regime Indicator Comparison"}
              </CardTitle>
              <CardDescription>
                {language === "ar"
                  ? "مقارنة المؤشرات الاقتصادية الرئيسية بين عدن وصنعاء"
                  : "Comparing key economic indicators between Aden and Sana'a regimes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegimeHeatmap
                data={[
                  {
                    indicator: "Exchange Rate (Jan 2026)",
                    indicatorAr: "سعر الصرف (يناير 2026)",
                    adenValue: 1950,
                    sanaaValue: 530,
                    divergence: 268.0,
                    trend: "narrowing"
                  },
                  {
                    indicator: "Inflation Rate (2025)",
                    indicatorAr: "معدل التضخم (2025)",
                    adenValue: 18.0,
                    sanaaValue: 14.5,
                    divergence: 24.1,
                    trend: "narrowing"
                  },
                  {
                    indicator: "Money Supply Growth",
                    indicatorAr: "نمو عرض النقود",
                    adenValue: 14.5,
                    sanaaValue: 6.8,
                    divergence: 113.2,
                    trend: "widening"
                  },
                  {
                    indicator: "Exchange Licenses Suspended",
                    indicatorAr: "تراخيص الصرافة المعلقة",
                    adenValue: 79,
                    sanaaValue: 0,
                    divergence: 100,
                    trend: "widening"
                  }
                ]}
                title="Banking Sector Divergence (Jan 2026)"
                titleAr="تباين القطاع المصرفي (يناير 2026)"
              />
            </CardContent>
          </Card>

          {/* Correlation Matrix */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#2e8b6e]" />
                {language === "ar" ? "مصفوفة الارتباط" : "Correlation Matrix"}
              </CardTitle>
              <CardDescription>
                {language === "ar"
                  ? "العلاقات الإحصائية بين المؤشرات المصرفية الرئيسية"
                  : "Statistical relationships between key banking indicators"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CorrelationMatrix
                indicators={["Exchange Rate", "Inflation", "Reserves", "Money Supply", "NPL Ratio"]}
                indicatorsAr={["سعر الصرف", "التضخم", "الاحتياطيات", "عرض النقود", "القروض المتعثرة"]}
                correlations={[
                  [1.00, 0.85, -0.72, 0.68, 0.45],
                  [0.85, 1.00, -0.58, 0.72, 0.52],
                  [-0.72, -0.58, 1.00, -0.45, -0.38],
                  [0.68, 0.72, -0.45, 1.00, 0.35],
                  [0.45, 0.52, -0.38, 0.35, 1.00]
                ]}
              />
            </CardContent>
          </Card>

          {/* Sparkline KPI Summary - January 2026 */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "سعر الصرف (يناير 2026)" : "FX Rate (Jan 2026)"}
                  </p>
                  <p className="text-2xl font-bold text-[#2e8b6e]">1,950</p>
                </div>
                <Sparkline 
                  data={[730, 1050, 1150, 1550, 1890, 2050, 1950]} 
                  color="#16a34a"
                  showTrend={true}
                />
              </div>
              <p className="text-xs text-green-600">↓ 4.9% {language === "ar" ? "من ذروة 2025" : "from 2025 peak"}</p>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "التضخم (2025)" : "Inflation (2025)"}
                  </p>
                  <p className="text-2xl font-bold text-[#2e8b6e]">18.0%</p>
                </div>
                <Sparkline 
                  data={[10, 22, 35, 28, 25, 22.5, 18]} 
                  color="#16a34a"
                  showTrend={true}
                />
              </div>
              <p className="text-xs text-green-600">↓ 20% {language === "ar" ? "من 2024" : "from 2024"}</p>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "الاحتياطيات (2026)" : "Reserves (2026)"}
                  </p>
                  <p className="text-2xl font-bold text-[#2e8b6e]">$1.15B</p>
                </div>
                <Sparkline 
                  data={[4700, 2100, 1200, 850, 1500, 1200, 1800, 1400, 1100, 850, 1200, 1150]} 
                  color="#16a34a"
                  showTrend={true}
                />
              </div>
              <p className="text-xs text-green-600">↑ 35.3% {language === "ar" ? "من 2024" : "from 2024"}</p>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "شركات الصرافة المعلقة" : "Exchange Cos. Suspended"}
                  </p>
                  <p className="text-2xl font-bold text-[#dc2626]">79</p>
                </div>
                <Sparkline 
                  data={[0, 0, 0, 15, 35, 55, 79]} 
                  color="#dc2626"
                  showTrend={true}
                />
              </div>
              <p className="text-xs text-red-600">{language === "ar" ? "حملة التنظيم 2025" : "2025 Regulation Campaign"}</p>
            </Card>
          </div>
        </div>

        {/* Data Sources */}
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {language === "ar" ? "مصادر البيانات والمنهجية" : "Data Sources & Methodology"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "ar"
                ? "يتم جمع البيانات المصرفية والمالية من البنك المركزي اليمني (فرعي عدن وصنعاء)، صندوق النقد الدولي، البنك الدولي، ومصادر السوق المحلية. يتم التحقق من أسعار الصرف يومياً من شبكة الصرافين."
                : "Banking and financial data is collected from the Central Bank of Yemen (Aden and Sana'a branches), IMF, World Bank, and local market sources. Exchange rates are verified daily from money exchanger networks."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">CBY Aden</Badge>
              <Badge variant="outline">CBY Sana'a</Badge>
              <Badge variant="outline">IMF</Badge>
              <Badge variant="outline">World Bank</Badge>
              <Badge variant="outline">Local Markets</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
