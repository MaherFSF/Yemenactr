import { useLanguage } from "@/contexts/LanguageContext";
import { SourcesUsedPanel } from "@/components/SourcesUsedPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Fuel,
  Download,
  Info,
  AlertTriangle,
  FileText,
  ArrowLeft,
  Zap,
  Ship
} from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Energy() {
  const { language } = useLanguage();

  // Fuel prices data - Updated January 2026 (Market Surveys)
  const fuelPrices = [
    { month: "Feb 25", dieselAden: 1020, dieselSanaa: 760, petrolAden: 1100, petrolSanaa: 820 },
    { month: "Mar 25", dieselAden: 1050, dieselSanaa: 770, petrolAden: 1130, petrolSanaa: 830 },
    { month: "Apr 25", dieselAden: 1080, dieselSanaa: 780, petrolAden: 1160, petrolSanaa: 840 },
    { month: "May 25", dieselAden: 1100, dieselSanaa: 790, petrolAden: 1180, petrolSanaa: 850 },
    { month: "Jun 25", dieselAden: 1120, dieselSanaa: 800, petrolAden: 1200, petrolSanaa: 860 },
    { month: "Jul 25", dieselAden: 1250, dieselSanaa: 810, petrolAden: 1350, petrolSanaa: 870 }, // Peak during FX crisis
    { month: "Aug 25", dieselAden: 1150, dieselSanaa: 820, petrolAden: 1230, petrolSanaa: 880 },
    { month: "Sep 25", dieselAden: 1100, dieselSanaa: 830, petrolAden: 1180, petrolSanaa: 890 },
    { month: "Oct 25", dieselAden: 1080, dieselSanaa: 840, petrolAden: 1160, petrolSanaa: 900 },
    { month: "Nov 25", dieselAden: 1060, dieselSanaa: 850, petrolAden: 1140, petrolSanaa: 910 },
    { month: "Dec 25", dieselAden: 1040, dieselSanaa: 860, petrolAden: 1120, petrolSanaa: 920 },
    { month: "Jan 26", dieselAden: 1050, dieselSanaa: 870, petrolAden: 1130, petrolSanaa: 930 },
  ];

  // Fuel imports data - Updated January 2026 (World Bank Fall 2025: Petroleum 17.1% of GDP)
  const fuelImports = [
    { year: "2019", diesel: 2.8, petrol: 1.2, lpg: 0.8 },
    { year: "2020", diesel: 2.2, petrol: 0.9, lpg: 0.6 },
    { year: "2021", diesel: 2.5, petrol: 1.0, lpg: 0.7 },
    { year: "2022", diesel: 2.6, petrol: 1.1, lpg: 0.7 },
    { year: "2023", diesel: 2.4, petrol: 1.0, lpg: 0.6 },
    { year: "2024", diesel: 2.8, petrol: 1.2, lpg: 0.7 }, // 17.1% of GDP
    { year: "2025", diesel: 3.0, petrol: 1.3, lpg: 0.8 },
    { year: "2026*", diesel: 3.1, petrol: 1.4, lpg: 0.8 },
  ];

  // Electricity status
  const electricityStatus = [
    { 
      regionEn: "Aden", 
      regionAr: "عدن",
      hoursPerDay: "8-12",
      source: "Grid + Generators",
      sourceAr: "الشبكة + المولدات"
    },
    { 
      regionEn: "Sana'a", 
      regionAr: "صنعاء",
      hoursPerDay: "2-4",
      source: "Solar + Generators",
      sourceAr: "الطاقة الشمسية + المولدات"
    },
    { 
      regionEn: "Marib", 
      regionAr: "مأرب",
      hoursPerDay: "18-24",
      source: "Gas Power Plant",
      sourceAr: "محطة الغاز"
    },
    { 
      regionEn: "Hodeidah", 
      regionAr: "الحديدة",
      hoursPerDay: "4-6",
      source: "Grid (limited)",
      sourceAr: "الشبكة (محدود)"
    },
  ];

  const kpis = [
    {
      titleEn: "Diesel Price (Aden)",
      titleAr: "سعر الديزل (عدن)",
      value: "1,050 YER/L",
      change: 8.2,
      source: "Market Survey Jan 2026",
      confidence: "B",
      regime: "IRG"
    },
    {
      titleEn: "Diesel Price (Sana'a)",
      titleAr: "سعر الديزل (صنعاء)",
      value: "870 YER/L",
      change: 17.6,
      source: "Market Survey Jan 2026",
      confidence: "B",
      regime: "DFA"
    },
    {
      titleEn: "Fuel Imports (2024)",
      titleAr: "واردات الوقود (2024)",
      value: "3.7M MT",
      change: -8.5,
      source: "UNVIM",
      confidence: "A"
    },
    {
      titleEn: "Electricity Access",
      titleAr: "الوصول للكهرباء",
      value: "~30%",
      change: -5.0,
      source: "Estimates",
      confidence: "C"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section with Background Image */}
      <section className="relative h-[350px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(/sectors/energy.jpg)` }}
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
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4 gap-2 text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
                {language === "ar" ? "العودة إلى لوحة المعلومات" : "Back to Dashboard"}
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Fuel className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-[#2e8b6e] text-white border-0">
                {language === "ar" ? "قطاع الطاقة" : "Energy Sector"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "الطاقة والوقود"
                : "Energy & Fuel"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "مراقبة أسعار الوقود وواردات الطاقة وحالة الكهرباء في اليمن"
                : "Monitoring fuel prices, energy imports, and electricity status in Yemen"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Warning Banner */}
        <Card className="mb-8 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                  {language === "ar" ? "أزمة البحر الأحمر" : "Red Sea Crisis Impact"}
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {language === "ar"
                    ? "اضطرابات الشحن في البحر الأحمر منذ نوفمبر 2023 أثرت على واردات الوقود وزادت التكاليف والتأخيرات."
                    : "Red Sea shipping disruptions since November 2023 have affected fuel imports, increasing costs and delays."}
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
                  {kpi.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                  <span className={`text-sm ${kpi.change >= 0 ? "text-red-600" : "text-green-600"}`}>
                    {kpi.change >= 0 ? "+" : ""}{kpi.change}% YoY
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
        <Tabs defaultValue="prices">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prices">
              {language === "ar" ? "أسعار الوقود" : "Fuel Prices"}
            </TabsTrigger>
            <TabsTrigger value="imports">
              {language === "ar" ? "الواردات" : "Imports"}
            </TabsTrigger>
            <TabsTrigger value="electricity">
              {language === "ar" ? "الكهرباء" : "Electricity"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prices">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "أسعار الوقود الشهرية (2024)" : "Monthly Fuel Prices (2024)"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "ريال يمني للتر" : "YER per liter"}
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
                  <LineChart data={fuelPrices}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="dieselAden" 
                      stroke="#2e8b6e" 
                      strokeWidth={2}
                      name={language === "ar" ? "ديزل - عدن" : "Diesel - Aden"}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="dieselSanaa" 
                      stroke="#2e8b6e" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={language === "ar" ? "ديزل - صنعاء" : "Diesel - Sana'a"}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="petrolAden" 
                      stroke="#C0A030" 
                      strokeWidth={2}
                      name={language === "ar" ? "بنزين - عدن" : "Petrol - Aden"}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="petrolSanaa" 
                      stroke="#C0A030" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={language === "ar" ? "بنزين - صنعاء" : "Petrol - Sana'a"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="imports">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="h-5 w-5" />
                      {language === "ar" ? "واردات الوقود السنوية" : "Annual Fuel Imports"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "بالمليون طن متري" : "In million metric tons"}
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
                  <BarChart data={fuelImports}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="diesel" fill="#2e8b6e" name={language === "ar" ? "ديزل" : "Diesel"} />
                    <Bar dataKey="petrol" fill="#2e8b6e" name={language === "ar" ? "بنزين" : "Petrol"} />
                    <Bar dataKey="lpg" fill="#C0A030" name={language === "ar" ? "غاز مسال" : "LPG"} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{language === "ar" ? "المصدر" : "Source"}</span>
                  </div>
                  <p className="text-muted-foreground">
                    UN Verification and Inspection Mechanism (UNVIM) • Hodeidah Port Data
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="electricity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {language === "ar" ? "حالة الكهرباء حسب المنطقة" : "Electricity Status by Region"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "المنطقة" : "Region"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "ساعات/يوم" : "Hours/Day"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "المصدر الرئيسي" : "Main Source"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {electricityStatus.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">
                            {language === "ar" ? item.regionAr : item.regionEn}
                          </td>
                          <td className="p-3">
                            <Badge variant={
                              item.hoursPerDay.includes("18") ? "default" : 
                              item.hoursPerDay.includes("8") ? "secondary" : "destructive"
                            }>
                              {item.hoursPerDay}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {language === "ar" ? item.sourceAr : item.source}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "معظم اليمنيين يعتمدون على الطاقة الشمسية والمولدات الخاصة بسبب انهيار شبكة الكهرباء الوطنية."
                      : "Most Yemenis rely on solar power and private generators due to the collapse of the national grid."}
                  </p>
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
                <h4 className="font-semibold mb-1">Yemen Energy Sector Assessment</h4>
                <p className="text-sm text-muted-foreground mb-2">World Bank • October 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-1">Fuel Import Dynamics and Humanitarian Access</h4>
                <p className="text-sm text-muted-foreground mb-2">ACAPS • September 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources Used Panel */}
      <SourcesUsedPanel sectorCode="energy" />
    </div>
  );
}
