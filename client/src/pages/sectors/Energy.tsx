import { useLanguage } from "@/contexts/LanguageContext";
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

  // Fuel prices data
  const fuelPrices = [
    { month: "Jan 24", dieselAden: 750, dieselSanaa: 620, petrolAden: 820, petrolSanaa: 680 },
    { month: "Feb 24", dieselAden: 770, dieselSanaa: 630, petrolAden: 840, petrolSanaa: 690 },
    { month: "Mar 24", dieselAden: 790, dieselSanaa: 640, petrolAden: 860, petrolSanaa: 700 },
    { month: "Apr 24", dieselAden: 810, dieselSanaa: 650, petrolAden: 880, petrolSanaa: 710 },
    { month: "May 24", dieselAden: 830, dieselSanaa: 660, petrolAden: 900, petrolSanaa: 720 },
    { month: "Jun 24", dieselAden: 850, dieselSanaa: 680, petrolAden: 920, petrolSanaa: 740 },
    { month: "Jul 24", dieselAden: 870, dieselSanaa: 690, petrolAden: 940, petrolSanaa: 750 },
    { month: "Aug 24", dieselAden: 890, dieselSanaa: 700, petrolAden: 960, petrolSanaa: 760 },
    { month: "Sep 24", dieselAden: 910, dieselSanaa: 710, petrolAden: 980, petrolSanaa: 770 },
    { month: "Oct 24", dieselAden: 930, dieselSanaa: 720, petrolAden: 1000, petrolSanaa: 780 },
    { month: "Nov 24", dieselAden: 950, dieselSanaa: 730, petrolAden: 1020, petrolSanaa: 790 },
    { month: "Dec 24", dieselAden: 970, dieselSanaa: 740, petrolAden: 1040, petrolSanaa: 800 },
  ];

  // Fuel imports data
  const fuelImports = [
    { year: "2019", diesel: 2.8, petrol: 1.2, lpg: 0.8 },
    { year: "2020", diesel: 2.2, petrol: 0.9, lpg: 0.6 },
    { year: "2021", diesel: 2.5, petrol: 1.0, lpg: 0.7 },
    { year: "2022", diesel: 2.6, petrol: 1.1, lpg: 0.7 },
    { year: "2023", diesel: 2.4, petrol: 1.0, lpg: 0.6 },
    { year: "2024", diesel: 2.3, petrol: 0.9, lpg: 0.5 },
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
      value: "970 YER/L",
      change: 29.3,
      source: "Market Survey",
      confidence: "B",
      regime: "IRG"
    },
    {
      titleEn: "Diesel Price (Sana'a)",
      titleAr: "سعر الديزل (صنعاء)",
      value: "740 YER/L",
      change: 19.4,
      source: "Market Survey",
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
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-amber-950/30 border-b">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                {language === "ar" ? "العودة إلى لوحة المعلومات" : "Back to Dashboard"}
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Fuel className="h-6 w-6 text-amber-600" />
              </div>
              <Badge variant="outline" className="text-sm border-amber-200 text-amber-700">
                {language === "ar" ? "قطاع الطاقة" : "Energy Sector"}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "ar" 
                ? "الطاقة والوقود"
                : "Energy & Fuel"}
            </h1>
            <p className="text-lg text-muted-foreground">
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
                      stroke="#103050" 
                      strokeWidth={2}
                      name={language === "ar" ? "ديزل - عدن" : "Diesel - Aden"}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="dieselSanaa" 
                      stroke="#103050" 
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
                    <Bar dataKey="diesel" fill="#103050" name={language === "ar" ? "ديزل" : "Diesel"} />
                    <Bar dataKey="petrol" fill="#107040" name={language === "ar" ? "بنزين" : "Petrol"} />
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
    </div>
  );
}
