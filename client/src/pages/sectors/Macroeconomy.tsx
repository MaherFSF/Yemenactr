import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Download,
  Info,
  AlertTriangle,
  FileText,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Macroeconomy() {
  const { language } = useLanguage();

  // Sample GDP data (will be replaced with real data from World Bank/IMF)
  const gdpData = [
    { year: "2010", gdp: 31.0, gdpPerCapita: 1334 },
    { year: "2011", gdp: 28.5, gdpPerCapita: 1195 },
    { year: "2012", gdp: 30.0, gdpPerCapita: 1225 },
    { year: "2013", gdp: 35.4, gdpPerCapita: 1408 },
    { year: "2014", gdp: 35.9, gdpPerCapita: 1390 },
    { year: "2015", gdp: 21.5, gdpPerCapita: 812 },
    { year: "2016", gdp: 18.2, gdpPerCapita: 671 },
    { year: "2017", gdp: 17.1, gdpPerCapita: 614 },
    { year: "2018", gdp: 19.2, gdpPerCapita: 672 },
    { year: "2019", gdp: 21.6, gdpPerCapita: 738 },
    { year: "2020", gdp: 18.5, gdpPerCapita: 617 },
    { year: "2021", gdp: 21.0, gdpPerCapita: 683 },
    { year: "2022", gdp: 23.5, gdpPerCapita: 747 },
    { year: "2023", gdp: 22.8, gdpPerCapita: 707 },
  ];

  const sectorContribution = [
    { sector: language === "ar" ? "الزراعة" : "Agriculture", value: 21.3 },
    { sector: language === "ar" ? "الصناعة" : "Industry", value: 11.8 },
    { sector: language === "ar" ? "الخدمات" : "Services", value: 54.2 },
    { sector: language === "ar" ? "النفط والغاز" : "Oil & Gas", value: 12.7 },
  ];

  const kpis = [
    {
      titleEn: "GDP (Nominal)",
      titleAr: "الناتج المحلي الإجمالي (الاسمي)",
      value: "$22.8B",
      change: -3.0,
      year: "2023",
      source: "World Bank",
      confidence: "B"
    },
    {
      titleEn: "GDP Per Capita",
      titleAr: "نصيب الفرد من الناتج المحلي",
      value: "$707",
      change: -5.4,
      year: "2023",
      source: "World Bank",
      confidence: "B"
    },
    {
      titleEn: "GDP Growth",
      titleAr: "نمو الناتج المحلي",
      value: "-3.0%",
      change: -3.0,
      year: "2023",
      source: "IMF Estimates",
      confidence: "C"
    },
    {
      titleEn: "Population",
      titleAr: "عدد السكان",
      value: "32.3M",
      change: 2.3,
      year: "2023",
      source: "UN DESA",
      confidence: "B"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                {language === "ar" ? "العودة إلى لوحة المعلومات" : "Back to Dashboard"}
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="outline" className="text-sm">
                {language === "ar" ? "القطاع الاقتصادي" : "Economic Sector"}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "ar" 
                ? "الاقتصاد الكلي والنمو"
                : "Macroeconomy & Growth"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === "ar"
                ? "تحليل شامل للناتج المحلي الإجمالي والنمو الاقتصادي والمؤشرات الكلية لليمن"
                : "Comprehensive analysis of GDP, economic growth, and macroeconomic indicators for Yemen"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center justify-between">
                  <span>{language === "ar" ? kpi.titleAr : kpi.titleEn}</span>
                  <Badge variant="outline" className="text-xs">
                    {kpi.confidence}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  {kpi.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${kpi.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {kpi.change >= 0 ? "+" : ""}{kpi.change}%
                  </span>
                  <span className="text-xs text-muted-foreground">({kpi.year})</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {kpi.source}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Warning Banner */}
        <Card className="mb-8 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                  {language === "ar" ? "ملاحظة حول البيانات" : "Data Note"}
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {language === "ar"
                    ? "تقديرات الناتج المحلي الإجمالي لليمن تخضع لعدم يقين كبير بسبب الصراع المستمر والانقسام المؤسسي. البيانات المعروضة مستمدة من تقديرات البنك الدولي وصندوق النقد الدولي."
                    : "GDP estimates for Yemen are subject to significant uncertainty due to ongoing conflict and institutional fragmentation. Data shown is derived from World Bank and IMF estimates."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Charts */}
        <Tabs defaultValue="gdp">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gdp">
              {language === "ar" ? "الناتج المحلي الإجمالي" : "GDP"}
            </TabsTrigger>
            <TabsTrigger value="percapita">
              {language === "ar" ? "نصيب الفرد" : "Per Capita"}
            </TabsTrigger>
            <TabsTrigger value="sectors">
              {language === "ar" ? "القطاعات" : "Sectors"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gdp">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "الناتج المحلي الإجمالي (2010-2023)" : "GDP (2010-2023)"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "بالمليار دولار أمريكي" : "In billions USD"}
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
                  <AreaChart data={gdpData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="gdp" 
                      stroke="#107040" 
                      fill="#107040"
                      fillOpacity={0.3}
                      name={language === "ar" ? "الناتج المحلي الإجمالي ($B)" : "GDP ($B)"}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{language === "ar" ? "المصدر" : "Source"}</span>
                  </div>
                  <p className="text-muted-foreground">
                    World Bank World Development Indicators • {language === "ar" ? "تم الاسترجاع:" : "Retrieved:"} Dec 2024
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="percapita">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "نصيب الفرد من الناتج المحلي (2010-2023)" : "GDP Per Capita (2010-2023)"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "بالدولار الأمريكي" : "In USD"}
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
                  <LineChart data={gdpData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="gdpPerCapita" 
                      stroke="#C0A030" 
                      strokeWidth={2}
                      name={language === "ar" ? "نصيب الفرد ($)" : "Per Capita ($)"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sectors">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "مساهمة القطاعات في الناتج المحلي" : "Sector Contribution to GDP"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "النسبة المئوية (تقديرات 2023)" : "Percentage (2023 estimates)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sectorContribution.map((sector, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{sector.sector}</span>
                        <span className="text-sm text-muted-foreground">{sector.value}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all"
                          style={{ width: `${sector.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
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
                <h4 className="font-semibold mb-1">Yemen Economic Monitor - Fall 2024</h4>
                <p className="text-sm text-muted-foreground mb-2">World Bank • December 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-1">IMF Article IV Consultation - Yemen</h4>
                <p className="text-sm text-muted-foreground mb-2">IMF • October 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
