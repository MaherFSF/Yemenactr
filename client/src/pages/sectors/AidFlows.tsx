import { useLanguage } from "@/contexts/LanguageContext";
import { SourcesUsedPanel } from "@/components/SourcesUsedPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  HandHeart,
  Download,
  Info,
  FileText,
  ArrowLeft,
  Building2,
  Globe
} from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function AidFlows() {
  const { language } = useLanguage();

  // Aid funding data (Updated January 2026 - OCHA)
  const fundingData = [
    { year: "2019", requirements: 4.2, funded: 3.6, gap: 0.6 },
    { year: "2020", requirements: 3.4, funded: 1.9, gap: 1.5 },
    { year: "2021", requirements: 3.9, funded: 2.3, gap: 1.6 },
    { year: "2022", requirements: 4.3, funded: 2.1, gap: 2.2 },
    { year: "2023", requirements: 4.3, funded: 2.0, gap: 2.3 },
    { year: "2024", requirements: 2.7, funded: 1.2, gap: 1.5 },
    { year: "2025", requirements: 2.5, funded: 0.48, gap: 2.02 }, // Only 19% funded - lowest in decade
  ];

  // Top donors
  const topDonors = [
    { donor: language === "ar" ? "الولايات المتحدة" : "United States", amount: 520, color: "#2e8b6e" },
    { donor: language === "ar" ? "السعودية" : "Saudi Arabia", amount: 380, color: "#2e8b6e" },
    { donor: language === "ar" ? "الإمارات" : "UAE", amount: 290, color: "#C0A030" },
    { donor: language === "ar" ? "الاتحاد الأوروبي" : "European Union", amount: 250, color: "#6B7280" },
    { donor: language === "ar" ? "المملكة المتحدة" : "United Kingdom", amount: 180, color: "#9CA3AF" },
    { donor: language === "ar" ? "ألمانيا" : "Germany", amount: 150, color: "#D1D5DB" },
  ];

  // Sector allocation
  const sectorAllocation = [
    { sector: language === "ar" ? "الأمن الغذائي" : "Food Security", percentage: 35 },
    { sector: language === "ar" ? "الصحة" : "Health", percentage: 18 },
    { sector: language === "ar" ? "المياه والصرف" : "WASH", percentage: 12 },
    { sector: language === "ar" ? "الحماية" : "Protection", percentage: 10 },
    { sector: language === "ar" ? "التعليم" : "Education", percentage: 8 },
    { sector: language === "ar" ? "المأوى" : "Shelter", percentage: 7 },
    { sector: language === "ar" ? "أخرى" : "Other", percentage: 10 },
  ];

  // Top implementing agencies
  const implementers = [
    { name: "WFP", fullName: "World Food Programme", funding: 850 },
    { name: "UNICEF", fullName: "UN Children's Fund", funding: 320 },
    { name: "WHO", fullName: "World Health Organization", funding: 180 },
    { name: "UNHCR", fullName: "UN Refugee Agency", funding: 150 },
    { name: "IOM", fullName: "Int'l Organization for Migration", funding: 120 },
  ];

  const kpis = [
    {
      titleEn: "2025 HRP Requirements",
      titleAr: "متطلبات الاستجابة 2025",
      value: "$2.5B",
      change: -7.4,
      source: "OCHA FTS Jan 2026",
      confidence: "A"
    },
    {
      titleEn: "2025 Funded",
      titleAr: "التمويل المستلم 2025",
      value: "$0.48B",
      change: -60.0,
      source: "OCHA FTS Jan 2026",
      confidence: "A"
    },
    {
      titleEn: "Funding Gap",
      titleAr: "فجوة التمويل",
      value: "81%",
      change: 26.0,
      source: "OCHA - Lowest in decade",
      confidence: "A"
    },
    {
      titleEn: "People in Need",
      titleAr: "المحتاجون للمساعدة",
      value: "23.1M",
      change: 5.5,
      source: "OCHA GHO 2026",
      confidence: "A"
    },
  ];

  // January 2026 Alerts
  const alerts = [
    {
      titleEn: "CRITICAL: Only 19% of 2025 HRP funded - lowest in over a decade",
      titleAr: "حرج: تم تمويل 19% فقط من خطة الاستجابة 2025 - الأدنى منذ عقد",
      severity: "critical",
      date: "Sep 2025"
    },
    {
      titleEn: "DFA detained 11+ UN national staff in September 2025",
      titleAr: "احتجزت سلطات صنعاء 11+ موظفاً أممياً في سبتمبر 2025",
      severity: "high",
      date: "Sep 2025"
    },
    {
      titleEn: "DFA raided UN compound in Sana'a, detained ~20 employees",
      titleAr: "داهمت سلطات صنعاء مجمع الأمم المتحدة واحتجزت ~20 موظفاً",
      severity: "high",
      date: "Oct 2025"
    },
    {
      titleEn: "4.7 million internally displaced persons (IDPs) in Yemen",
      titleAr: "4.7 مليون نازح داخلياً في اليمن",
      severity: "medium",
      date: "Jan 2026"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 dark:from-purple-950/30 dark:via-purple-900/20 dark:to-purple-950/30 border-b">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                {language === "ar" ? "العودة إلى لوحة المعلومات" : "Back to Dashboard"}
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <HandHeart className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="outline" className="text-sm border-purple-200 text-purple-700">
                {language === "ar" ? "القطاع الإنساني" : "Humanitarian Sector"}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "ar" 
                ? "تدفقات المساعدات والمساءلة"
                : "Aid Flows & Accountability"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === "ar"
                ? "تتبع التمويل الإنساني والمانحين والمنفذين ومساءلة المساعدات"
                : "Tracking humanitarian funding, donors, implementers, and aid accountability"}
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
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                  <span className={`text-sm ${kpi.change >= 0 ? "text-red-600" : "text-green-600"}`}>
                    {kpi.change >= 0 ? "+" : ""}{kpi.change}% vs 2023
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

        {/* Info Banner */}
        <Card className="mb-8 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  {language === "ar" ? "مصادر البيانات" : "Data Sources"}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {language === "ar"
                    ? "البيانات مستمدة من نظام تتبع التمويل (FTS) التابع لمكتب تنسيق الشؤون الإنسانية ومعيار الشفافية في المبادرات الدولية (IATI)."
                    : "Data sourced from OCHA Financial Tracking Service (FTS) and International Aid Transparency Initiative (IATI)."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Charts */}
        <Tabs defaultValue="funding">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="funding">
              {language === "ar" ? "التمويل" : "Funding"}
            </TabsTrigger>
            <TabsTrigger value="donors">
              {language === "ar" ? "المانحون" : "Donors"}
            </TabsTrigger>
            <TabsTrigger value="implementers">
              {language === "ar" ? "المنفذون" : "Implementers"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="funding">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "تمويل الاستجابة الإنسانية" : "Humanitarian Response Funding"}
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
                  <BarChart data={fundingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="funded" fill="#2e8b6e" name={language === "ar" ? "الممول" : "Funded"} />
                    <Bar dataKey="gap" fill="#EF4444" name={language === "ar" ? "الفجوة" : "Gap"} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                      {language === "ar" ? "إجمالي الممول (2019-2024)" : "Total Funded (2019-2024)"}
                    </div>
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">$13.1B</div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="text-sm text-red-700 dark:text-red-300 font-medium">
                      {language === "ar" ? "إجمالي الفجوة (2019-2024)" : "Total Gap (2019-2024)"}
                    </div>
                    <div className="text-2xl font-bold text-red-800 dark:text-red-200">$9.7B</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donors">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {language === "ar" ? "أكبر المانحين (2024)" : "Top Donors (2024)"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "بالمليون دولار أمريكي" : "In millions USD"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    {language === "ar" ? "تصدير" : "Export"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={topDonors}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="amount"
                        label={({ donor, amount }) => `$${amount}M`}
                      >
                        {topDonors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {topDonors.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.donor}: ${item.amount}M</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {language === "ar" ? "أكبر الوكالات المنفذة" : "Top Implementing Agencies"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {implementers.map((agency, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div>
                        <div className="font-semibold">{agency.name}</div>
                        <div className="text-sm text-muted-foreground">{agency.fullName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${agency.funding}M</div>
                        <div className="text-xs text-muted-foreground">2024 Funding</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">
                    {language === "ar" ? "التوزيع القطاعي" : "Sector Allocation"}
                  </h4>
                  <div className="space-y-2">
                    {sectorAllocation.map((sector, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{sector.sector}</span>
                          <span className="text-sm text-muted-foreground">{sector.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${sector.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
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
                <h4 className="font-semibold mb-1">Yemen Humanitarian Response Plan 2024</h4>
                <p className="text-sm text-muted-foreground mb-2">OCHA • January 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-1">Aid Effectiveness Review - Yemen</h4>
                <p className="text-sm text-muted-foreground mb-2">ODI • September 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources Used Panel */}
      <SourcesUsedPanel sectorCode="aid" />
    </div>
  );
}
