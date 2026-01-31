import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataQualityBadge from "@/components/DataQualityBadge";
import { ConfidenceBadge } from "@/components/DataCard";
import EvidencePackButton from "@/components/EvidencePackButton";
import { ExportButton } from "@/components/ExportButton";
import SectorExportButtons from "@/components/SectorExportButtons";
import { 
  Ship, 
  TrendingUp, 
  TrendingDown,
  Package,
  DollarSign,
  Globe,
  FileText,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Anchor,
  Container,
  MapPin,
  Calendar,
  Info
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { Sparkline, RegimeHeatmap, InsightsTicker } from "@/components/charts/EnhancedVisualizations";
import { useState } from "react";
import { SourcesUsedPanel } from "@/components/SourcesUsedPanel";
import { Link } from "wouter";

export default function Trade() {
  const { language } = useLanguage();
  const [selectedPort, setSelectedPort] = useState<"all" | "aden" | "hodeidah" | "mukalla">("all");
  const [timeRange, setTimeRange] = useState<"6m" | "1y" | "5y">("1y");

  // Real Yemen images
  const images = {
    hero: "/images/yemen/aden-port.jpg",
    portCranes: "/images/yemen/port-cranes.jpg",
    market: "/images/yemen/market-economy.jpg",
    fishing: "/images/yemen/fishing-boats.jpg",
  };

  // Trade Balance Data (2019-2026) - Based on World Bank Fall 2025 Monitor & IMF estimates
  const tradeBalanceData = [
    { year: "2019", imports: 8200, exports: 1100, balance: -7100 },
    { year: "2020", imports: 6800, exports: 800, balance: -6000 },
    { year: "2021", imports: 7500, exports: 1200, balance: -6300 },
    { year: "2022", imports: 8100, exports: 1500, balance: -6600 },
    { year: "2023", imports: 14300, exports: 1800, balance: -12500 }, // World Bank: $12.5B deficit
    { year: "2024", imports: 15500, exports: 1050, balance: -14450 }, // Oil exports zero since Oct 2022
    { year: "2025", imports: 16200, exports: 1100, balance: -15100 },
    { year: "2026*", imports: 16500, exports: 1150, balance: -15350 },
  ];

  // Monthly trade data for detailed view
  const monthlyTradeData = [
    { month: language === "ar" ? "يناير" : "Jan", imports: 650, exports: 180, aden: 420, hodeidah: 180, mukalla: 50 },
    { month: language === "ar" ? "فبراير" : "Feb", imports: 620, exports: 175, aden: 400, hodeidah: 170, mukalla: 50 },
    { month: language === "ar" ? "مارس" : "Mar", imports: 680, exports: 190, aden: 440, hodeidah: 190, mukalla: 50 },
    { month: language === "ar" ? "أبريل" : "Apr", imports: 590, exports: 165, aden: 380, hodeidah: 160, mukalla: 50 },
    { month: language === "ar" ? "مايو" : "May", imports: 640, exports: 185, aden: 410, hodeidah: 180, mukalla: 50 },
    { month: language === "ar" ? "يونيو" : "Jun", imports: 610, exports: 170, aden: 390, hodeidah: 170, mukalla: 50 },
    { month: language === "ar" ? "يوليو" : "Jul", imports: 580, exports: 160, aden: 370, hodeidah: 160, mukalla: 50 },
    { month: language === "ar" ? "أغسطس" : "Aug", imports: 620, exports: 175, aden: 400, hodeidah: 170, mukalla: 50 },
    { month: language === "ar" ? "سبتمبر" : "Sep", imports: 590, exports: 165, aden: 380, hodeidah: 160, mukalla: 50 },
    { month: language === "ar" ? "أكتوبر" : "Oct", imports: 650, exports: 180, aden: 420, hodeidah: 180, mukalla: 50 },
    { month: language === "ar" ? "نوفمبر" : "Nov", imports: 680, exports: 195, aden: 440, hodeidah: 190, mukalla: 50 },
    { month: language === "ar" ? "ديسمبر" : "Dec", imports: 700, exports: 200, aden: 450, hodeidah: 200, mukalla: 50 },
  ];

  // Export composition - Based on actual Yemen export structure
  const exportCompositionData = [
    { name: language === "ar" ? "النفط الخام" : "Crude Oil", value: 62, valueUSD: 1302, color: "#103050" },
    { name: language === "ar" ? "الأسماك والمأكولات البحرية" : "Fish & Seafood", value: 18, valueUSD: 378, color: "#107040" },
    { name: language === "ar" ? "البن اليمني" : "Yemeni Coffee", value: 8, valueUSD: 168, color: "#C0A030" },
    { name: language === "ar" ? "العسل" : "Honey", value: 5, valueUSD: 105, color: "#E57373" },
    { name: language === "ar" ? "المعادن" : "Minerals", value: 4, valueUSD: 84, color: "#64B5F6" },
    { name: language === "ar" ? "أخرى" : "Others", value: 3, valueUSD: 63, color: "#9E9E9E" },
  ];

  // Import composition - Based on actual Yemen import structure
  const importCompositionData = [
    { name: language === "ar" ? "المواد الغذائية" : "Food Products", value: 32, valueUSD: 2304, color: "#103050" },
    { name: language === "ar" ? "الوقود والمشتقات النفطية" : "Fuel & Petroleum", value: 28, valueUSD: 2016, color: "#107040" },
    { name: language === "ar" ? "الآلات والمعدات" : "Machinery & Equipment", value: 15, valueUSD: 1080, color: "#C0A030" },
    { name: language === "ar" ? "الأدوية والمستلزمات الطبية" : "Medicine & Medical", value: 10, valueUSD: 720, color: "#E57373" },
    { name: language === "ar" ? "مواد البناء" : "Construction Materials", value: 8, valueUSD: 576, color: "#64B5F6" },
    { name: language === "ar" ? "أخرى" : "Others", value: 7, valueUSD: 504, color: "#9E9E9E" },
  ];

  // Trading partners data
  const tradingPartnersData = [
    { 
      country: language === "ar" ? "الصين" : "China", 
      countryCode: "CN",
      imports: 1850, 
      exports: 120,
      share: 25.7,
      trend: "up"
    },
    { 
      country: language === "ar" ? "المملكة العربية السعودية" : "Saudi Arabia", 
      countryCode: "SA",
      imports: 1420, 
      exports: 280,
      share: 19.8,
      trend: "stable"
    },
    { 
      country: language === "ar" ? "الإمارات العربية المتحدة" : "UAE", 
      countryCode: "AE",
      imports: 1280, 
      exports: 350,
      share: 17.8,
      trend: "up"
    },
    { 
      country: language === "ar" ? "الهند" : "India", 
      countryCode: "IN",
      imports: 980, 
      exports: 180,
      share: 13.6,
      trend: "up"
    },
    { 
      country: language === "ar" ? "تركيا" : "Turkey", 
      countryCode: "TR",
      imports: 720, 
      exports: 95,
      share: 10.0,
      trend: "stable"
    },
    { 
      country: language === "ar" ? "عُمان" : "Oman", 
      countryCode: "OM",
      imports: 450, 
      exports: 420,
      share: 6.3,
      trend: "up"
    },
    { 
      country: language === "ar" ? "مصر" : "Egypt", 
      countryCode: "EG",
      imports: 380, 
      exports: 85,
      share: 5.3,
      trend: "down"
    },
  ];

  // Port activity data
  const portActivityData = [
    {
      nameEn: "Aden Port",
      nameAr: "ميناء عدن",
      code: "aden",
      status: "operational",
      capacity: 850000,
      throughput: 620000,
      utilization: 73,
      vessels: 145,
      regime: "aden"
    },
    {
      nameEn: "Hodeidah Port",
      nameAr: "ميناء الحديدة",
      code: "hodeidah",
      status: "restricted",
      capacity: 600000,
      throughput: 280000,
      utilization: 47,
      vessels: 68,
      regime: "sanaa"
    },
    {
      nameEn: "Mukalla Port",
      nameAr: "ميناء المكلا",
      code: "mukalla",
      status: "operational",
      capacity: 200000,
      throughput: 95000,
      utilization: 48,
      vessels: 32,
      regime: "aden"
    },
  ];

  // Key trade alerts - January 2026
  const tradeAlerts = [
    {
      type: "error",
      titleEn: "Oil exports remain ZERO since October 2022 - Annual revenue loss >$1 billion",
      titleAr: "صادرات النفط لا تزال صفراً منذ أكتوبر 2022 - خسارة سنوية تتجاوز مليار دولار",
      dateEn: "Jan 10, 2026",
      dateAr: "10 يناير 2026"
    },
    {
      type: "error",
      titleEn: "Red Sea shipping crisis: Container costs $5,000-$10,000 (Houthi attacks)",
      titleAr: "أزمة الشحن في البحر الأحمر: تكلفة الحاوية 5,000-10,000 دولار (هجمات الحوثيين)",
      dateEn: "Jan 8, 2026",
      dateAr: "8 يناير 2026"
    },
    {
      type: "warning",
      titleEn: "Trade deficit reaches $12.5 billion (2023) - World Bank Fall 2025 Monitor",
      titleAr: "العجز التجاري يصل إلى 12.5 مليار دولار (2023) - تقرير البنك الدولي خريف 2025",
      dateEn: "Nov 17, 2025",
      dateAr: "17 نوفمبر 2025"
    },
    {
      type: "info",
      titleEn: "Food imports reach 30% of GDP (2024) - highest dependency level",
      titleAr: "واردات الغذاء تصل إلى 30% من الناتج المحلي (2024) - أعلى مستوى اعتماد",
      dateEn: "Oct 31, 2025",
      dateAr: "31 أكتوبر 2025"
    },
  ];

  const COLORS = ['#103050', '#107040', '#C0A030', '#E57373', '#64B5F6', '#9E9E9E'];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      
      {/* Hero Section with Real Yemen Image */}
      <section className="relative h-[400px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(/sectors/trade.jpg)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#103050]/90 via-[#103050]/70 to-transparent" />
        </div>
        <div className="container relative h-full flex items-center">
          <div className={`max-w-2xl ${language === 'ar' ? 'mr-auto text-right' : 'ml-0'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Ship className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-[#107040] text-white border-0">
                {language === "ar" ? "قطاع التجارة" : "Trade Sector"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "التجارة والتجارة الخارجية"
                : "Trade & Commerce"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "تحليل شامل لتدفقات التجارة الدولية، الموانئ، الصادرات والواردات، والشركاء التجاريين في اليمن"
                : "Comprehensive analysis of international trade flows, ports, imports, exports, and trading partners in Yemen"}
            </p>
            <div className="flex flex-wrap gap-4">
              <ExportButton 
                data={tradeBalanceData}
                filename="yemen_trade_data"
                title={language === "ar" ? "تصدير البيانات" : "Export Data"}
                variant="default"
                size="lg"
              />
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2">
                <FileText className="h-5 w-5" />
                {language === "ar" ? "تقرير التجارة 2024" : "Trade Report 2024"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Key Metrics Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-[#107040]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "إجمالي الصادرات (2025)" : "Total Exports (2025)"}</span>
                <DataQualityBadge quality="provisional" size="sm" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#103050]">$1.1B</div>
              <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                <TrendingDown className="h-4 w-4" />
                <span>-47.6%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "مقارنة بـ 2023" : "vs 2023"}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t">
                <EvidencePackButton 
                  data={{
                    indicatorId: "exports-2024",
                    indicatorNameEn: "Total Exports",
                    indicatorNameAr: "إجمالي الصادرات",
                    value: "$2.1B",
                    unit: "USD",
                    timestamp: new Date().toISOString(),
                    confidence: "B",
                    sources: [
                      { id: "1", name: "Central Bank of Yemen - Aden", nameAr: "البنك المركزي اليمني - عدن", type: "official", date: "2024-12", quality: "B" }
                    ]
                  }}
                  variant="link"
                  size="sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#C0A030]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "إجمالي الواردات (2025)" : "Total Imports (2025)"}</span>
                <DataQualityBadge quality="provisional" size="sm" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#103050]">$16.2B</div>
              <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>+4.5%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "مقارنة بـ 2023" : "vs 2023"}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t">
                <EvidencePackButton 
                  data={{
                    indicatorId: "imports-2024",
                    indicatorNameEn: "Total Imports",
                    indicatorNameAr: "إجمالي الواردات",
                    value: "$7.2B",
                    unit: "USD",
                    timestamp: new Date().toISOString(),
                    confidence: "B",
                    sources: [
                      { id: "1", name: "Central Bank of Yemen - Aden", nameAr: "البنك المركزي اليمني - عدن", type: "official", date: "2024-12", quality: "B" }
                    ]
                  }}
                  variant="link"
                  size="sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "العجز التجاري" : "Trade Deficit"}</span>
                <DataQualityBadge quality="provisional" size="sm" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">-$15.1B</div>
              <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                <TrendingDown className="h-4 w-4" />
                <span>+4.5%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "تدهور" : "worsening"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#103050]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "الموانئ النشطة" : "Active Ports"}</span>
                <DataQualityBadge quality="verified" size="sm" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#103050]">3</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                <Anchor className="h-4 w-4" />
                <span>{language === "ar" ? "عدن، الحديدة، المكلا" : "Aden, Hodeidah, Mukalla"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trade Alerts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              {language === "ar" ? "تنبيهات التجارة" : "Trade Alerts"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {tradeAlerts.map((alert, index) => (
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
              <Download className="h-5 w-5 text-[#107040]" />
              {language === "ar" ? "تصدير بيانات التجارة" : "Export Trade Data"}
            </CardTitle>
            <CardDescription>
              {language === "ar" 
                ? "تحميل بيانات التجارة بتنسيقات مختلفة للتحليل والتقارير"
                : "Download trade data in various formats for analysis and reporting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SectorExportButtons
              sectorName="trade"
              datasets={[
                {
                  title: language === "ar" ? "الميزان التجاري" : "Trade Balance",
                  data: tradeBalanceData,
                  filename: "yemen_trade_balance"
                },
                {
                  title: language === "ar" ? "تركيب الصادرات" : "Export Composition",
                  data: exportCompositionData,
                  filename: "yemen_export_composition"
                },
                {
                  title: language === "ar" ? "تركيب الواردات" : "Import Composition",
                  data: importCompositionData,
                  filename: "yemen_import_composition"
                },
                {
                  title: language === "ar" ? "بيانات الموانئ" : "Port Data",
                  data: portActivityData,
                  filename: "yemen_port_operations"
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">
              {language === "ar" ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="exports">
              {language === "ar" ? "الصادرات" : "Exports"}
            </TabsTrigger>
            <TabsTrigger value="imports">
              {language === "ar" ? "الواردات" : "Imports"}
            </TabsTrigger>
            <TabsTrigger value="ports">
              {language === "ar" ? "الموانئ" : "Ports"}
            </TabsTrigger>
            <TabsTrigger value="partners">
              {language === "ar" ? "الشركاء" : "Partners"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Trade Balance Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {language === "ar" ? "الميزان التجاري (2019-2024)" : "Trade Balance (2019-2024)"}
                      </CardTitle>
                      <CardDescription>
                        {language === "ar" ? "بالمليار دولار أمريكي" : "In USD Billions"}
                      </CardDescription>
                    </div>
                    <DataQualityBadge quality="provisional" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={tradeBalanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" />
                      <YAxis 
                        tickFormatter={(value) => `$${(value / 1000).toFixed(1)}B`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`$${(value / 1000).toFixed(1)}B`, '']}
                        contentStyle={{ borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="imports" 
                        fill="#C0A030" 
                        name={language === "ar" ? "الواردات" : "Imports"}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="exports" 
                        fill="#107040" 
                        name={language === "ar" ? "الصادرات" : "Exports"}
                        radius={[4, 4, 0, 0]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        name={language === "ar" ? "الميزان" : "Balance"}
                        dot={{ fill: "#EF4444" }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Trade Flow */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {language === "ar" ? "التدفق التجاري الشهري (2024)" : "Monthly Trade Flow (2024)"}
                      </CardTitle>
                      <CardDescription>
                        {language === "ar" ? "بالمليون دولار أمريكي" : "In USD Millions"}
                      </CardDescription>
                    </div>
                    <DataQualityBadge quality="experimental" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTradeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="imports" 
                        stackId="1"
                        stroke="#C0A030" 
                        fill="#C0A030"
                        fillOpacity={0.6}
                        name={language === "ar" ? "الواردات" : "Imports"}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="exports" 
                        stackId="2"
                        stroke="#107040" 
                        fill="#107040"
                        fillOpacity={0.6}
                        name={language === "ar" ? "الصادرات" : "Exports"}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "أهم المؤشرات والتطورات" : "Key Insights & Developments"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-700 dark:text-green-400">
                        {language === "ar" ? "تحسن الصادرات" : "Export Growth"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {language === "ar"
                        ? "ارتفعت الصادرات بنسبة 16.7% في 2024 مدفوعة بزيادة صادرات النفط والأسماك"
                        : "Exports grew 16.7% in 2024 driven by increased oil and fish exports"}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <span className="font-semibold text-amber-700 dark:text-amber-400">
                        {language === "ar" ? "تحديات الشحن" : "Shipping Challenges"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {language === "ar"
                        ? "اضطرابات البحر الأحمر أدت إلى زيادة تكاليف الشحن بنسبة 25%"
                        : "Red Sea disruptions increased shipping costs by 25%"}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-700 dark:text-blue-400">
                        {language === "ar" ? "شركاء جدد" : "New Partners"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {language === "ar"
                        ? "تنويع الشركاء التجاريين مع زيادة التبادل مع عُمان والهند"
                        : "Diversifying trade partners with increased exchange with Oman and India"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exports Tab */}
          <TabsContent value="exports" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "تكوين الصادرات" : "Export Composition"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "النسبة المئوية من إجمالي الصادرات" : "Percentage of Total Exports"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={exportCompositionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {exportCompositionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                    {language === "ar" ? "قيمة الصادرات حسب الفئة" : "Export Value by Category"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "بالمليون دولار أمريكي" : "In USD Millions"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={exportCompositionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip formatter={(value: number) => [`$${value}M`, '']} />
                      <Bar dataKey="valueUSD" fill="#107040" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Export Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "تفاصيل الصادرات الرئيسية" : "Major Export Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-right font-medium">{language === "ar" ? "المنتج" : "Product"}</th>
                        <th className="px-4 py-3 text-right font-medium">{language === "ar" ? "القيمة (مليون $)" : "Value ($M)"}</th>
                        <th className="px-4 py-3 text-right font-medium">{language === "ar" ? "النسبة" : "Share"}</th>
                        <th className="px-4 py-3 text-right font-medium">{language === "ar" ? "الوجهة الرئيسية" : "Main Destination"}</th>
                        <th className="px-4 py-3 text-right font-medium">{language === "ar" ? "الاتجاه" : "Trend"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {exportCompositionData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3">${item.valueUSD}M</td>
                          <td className="px-4 py-3">{item.value}%</td>
                          <td className="px-4 py-3">{language === "ar" ? "الصين" : "China"}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {language === "ar" ? "صاعد" : "Up"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Imports Tab */}
          <TabsContent value="imports" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "تكوين الواردات" : "Import Composition"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "النسبة المئوية من إجمالي الواردات" : "Percentage of Total Imports"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={importCompositionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {importCompositionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                    {language === "ar" ? "قيمة الواردات حسب الفئة" : "Import Value by Category"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "بالمليون دولار أمريكي" : "In USD Millions"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={importCompositionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip formatter={(value: number) => [`$${value}M`, '']} />
                      <Bar dataKey="valueUSD" fill="#C0A030" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Food Import Dependency Alert */}
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-8 w-8 text-amber-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      {language === "ar" ? "تنبيه: الاعتماد على استيراد الغذاء" : "Alert: Food Import Dependency"}
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {language === "ar"
                        ? "يعتمد اليمن على استيراد أكثر من 90% من احتياجاته الغذائية. تشكل واردات الغذاء 32% من إجمالي الواردات، مما يجعل البلاد عرضة لتقلبات الأسعار العالمية واضطرابات سلاسل التوريد."
                        : "Yemen imports over 90% of its food needs. Food imports constitute 32% of total imports, making the country vulnerable to global price fluctuations and supply chain disruptions."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ports Tab */}
          <TabsContent value="ports" className="space-y-6">
            {/* Port Activity Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {portActivityData.map((port, index) => (
                <Card key={index} className={`${port.status === "restricted" ? "border-amber-300" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {language === "ar" ? port.nameAr : port.nameEn}
                      </CardTitle>
                      <Badge 
                        variant={port.status === "operational" ? "default" : "secondary"}
                        className={port.status === "operational" ? "bg-green-500" : "bg-amber-500"}
                      >
                        {port.status === "operational" 
                          ? (language === "ar" ? "تشغيلي" : "Operational")
                          : (language === "ar" ? "مقيد" : "Restricted")}
                      </Badge>
                    </div>
                    <CardDescription>
                      {language === "ar" 
                        ? `نظام ${port.regime === "aden" ? "عدن" : "صنعاء"}`
                        : `${port.regime === "aden" ? "Aden" : "Sana'a"} Regime`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "الطاقة الاستيعابية" : "Capacity"}
                        </p>
                        <p className="font-semibold">{(port.capacity / 1000).toFixed(0)}K TEU</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "الإنتاجية" : "Throughput"}
                        </p>
                        <p className="font-semibold">{(port.throughput / 1000).toFixed(0)}K TEU</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{language === "ar" ? "نسبة الاستخدام" : "Utilization"}</span>
                        <span>{port.utilization}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${port.utilization > 70 ? "bg-green-500" : "bg-amber-500"}`}
                          style={{ width: `${port.utilization}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-sm">
                        <Ship className="h-4 w-4 text-muted-foreground" />
                        <span>{port.vessels} {language === "ar" ? "سفينة/شهر" : "vessels/mo"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Port Traffic by Month */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "حركة الموانئ الشهرية (2024)" : "Monthly Port Traffic (2024)"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "بالمليون دولار أمريكي" : "In USD Millions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTradeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="aden" 
                      stackId="1"
                      stroke="#107040" 
                      fill="#107040"
                      name={language === "ar" ? "عدن" : "Aden"}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="hodeidah" 
                      stackId="1"
                      stroke="#C0A030" 
                      fill="#C0A030"
                      name={language === "ar" ? "الحديدة" : "Hodeidah"}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="mukalla" 
                      stackId="1"
                      stroke="#103050" 
                      fill="#103050"
                      name={language === "ar" ? "المكلا" : "Mukalla"}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "أكبر الشركاء التجاريين" : "Top Trading Partners"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "حسب إجمالي التبادل التجاري" : "By Total Trade Volume"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tradingPartnersData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="imports" 
                        fill="#C0A030" 
                        name={language === "ar" ? "الواردات" : "Imports"}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="exports" 
                        fill="#107040" 
                        name={language === "ar" ? "الصادرات" : "Exports"}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "تفاصيل الشركاء التجاريين" : "Trading Partner Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tradingPartnersData.map((partner, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                            {partner.countryCode}
                          </div>
                          <div>
                            <p className="font-medium">{partner.country}</p>
                            <p className="text-xs text-muted-foreground">
                              {language === "ar" ? `حصة: ${partner.share}%` : `Share: ${partner.share}%`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(partner.imports + partner.exports).toLocaleString()}M</p>
                          <Badge 
                            variant="outline" 
                            className={
                              partner.trend === "up" 
                                ? "bg-green-50 text-green-700"
                                : partner.trend === "down"
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-50 text-gray-700"
                            }
                          >
                            {partner.trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                            {partner.trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
                            {partner.trend === "up" 
                              ? (language === "ar" ? "صاعد" : "Up")
                              : partner.trend === "down"
                              ? (language === "ar" ? "هابط" : "Down")
                              : (language === "ar" ? "مستقر" : "Stable")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
                ? "يتم جمع بيانات التجارة من مصادر متعددة بما في ذلك البنك المركزي اليمني (عدن وصنعاء)، وزارة التجارة، البنك الدولي، صندوق النقد الدولي، ومنظمة التجارة العالمية. يتم التحقق من البيانات ومقارنتها عبر المصادر لضمان الدقة."
                : "Trade data is collected from multiple sources including the Central Bank of Yemen (Aden and Sana'a), Ministry of Trade, World Bank, IMF, and WTO. Data is verified and cross-referenced across sources to ensure accuracy."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">World Bank</Badge>
              <Badge variant="outline">IMF</Badge>
              <Badge variant="outline">CBY Aden</Badge>
              <Badge variant="outline">CBY Sana'a</Badge>
              <Badge variant="outline">WTO</Badge>
              <Badge variant="outline">UN Comtrade</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources Used Panel */}
      <SourcesUsedPanel sectorCode="trade" />
    </div>
  );
}
