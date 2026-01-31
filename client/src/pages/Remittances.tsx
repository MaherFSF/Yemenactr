import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  DollarSign,
  Globe,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle,
  Clock,
  Building2,
  Users,
  ArrowRight,
  Info
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function Remittances() {
  const { language } = useLanguage();

  // Remittance flow data (World Bank estimates)
  const remittanceFlows = [
    { year: "2010", inflows: 3.35, gdp_pct: 10.2 },
    { year: "2011", inflows: 3.08, gdp_pct: 9.5 },
    { year: "2012", inflows: 3.35, gdp_pct: 9.8 },
    { year: "2013", inflows: 3.34, gdp_pct: 8.9 },
    { year: "2014", inflows: 3.35, gdp_pct: 8.1 },
    { year: "2015", inflows: 3.25, gdp_pct: 17.5 },
    { year: "2016", inflows: 2.91, gdp_pct: 11.2 },
    { year: "2017", inflows: 3.36, gdp_pct: 13.8 },
    { year: "2018", inflows: 3.77, gdp_pct: 14.2 },
    { year: "2019", inflows: 3.77, gdp_pct: 17.1 },
    { year: "2020", inflows: 3.80, gdp_pct: 19.8 },
    { year: "2021", inflows: 4.02, gdp_pct: 20.5 },
    { year: "2022", inflows: 4.12, gdp_pct: 21.2 },
    { year: "2023", inflows: 4.25, gdp_pct: 22.0 },
    { year: "2024", inflows: 4.35, gdp_pct: 22.5 },
  ];

  // Source countries
  const sourceCountries = [
    { nameEn: "Saudi Arabia", nameAr: "السعودية", amount: 2.18, percentage: 50, color: "#4C583E" },
    { nameEn: "UAE", nameAr: "الإمارات", amount: 0.65, percentage: 15, color: "#C0A030" },
    { nameEn: "USA", nameAr: "أمريكا", amount: 0.44, percentage: 10, color: "#1e40af" },
    { nameEn: "UK", nameAr: "بريطانيا", amount: 0.26, percentage: 6, color: "#7c3aed" },
    { nameEn: "Kuwait", nameAr: "الكويت", amount: 0.22, percentage: 5, color: "#059669" },
    { nameEn: "Qatar", nameAr: "قطر", amount: 0.17, percentage: 4, color: "#dc2626" },
    { nameEn: "Other", nameAr: "أخرى", amount: 0.43, percentage: 10, color: "#6b7280" },
  ];

  // Transfer channels
  const transferChannels = [
    {
      nameEn: "Hawala/Informal",
      nameAr: "الحوالة/غير رسمي",
      percentage: 65,
      avgCost: "2-4%",
      avgTime: "Same day",
      notes: "Primary channel due to banking restrictions"
    },
    {
      nameEn: "Banks",
      nameAr: "البنوك",
      percentage: 15,
      avgCost: "5-8%",
      avgTime: "3-5 days",
      notes: "Limited by correspondent banking issues"
    },
    {
      nameEn: "Money Transfer Operators",
      nameAr: "شركات تحويل الأموال",
      percentage: 12,
      avgCost: "4-7%",
      avgTime: "1-3 days",
      notes: "Western Union, MoneyGram (limited)"
    },
    {
      nameEn: "Mobile Money",
      nameAr: "المحافظ الإلكترونية",
      percentage: 5,
      avgCost: "3-5%",
      avgTime: "Instant",
      notes: "Growing but limited infrastructure"
    },
    {
      nameEn: "Cryptocurrency",
      nameAr: "العملات المشفرة",
      percentage: 3,
      avgCost: "1-3%",
      avgTime: "Minutes",
      notes: "Emerging channel, regulatory uncertainty"
    },
  ];

  // KPIs
  const kpis = [
    {
      titleEn: "Total Inflows (2024)",
      titleAr: "إجمالي التدفقات (2024)",
      value: "$4.35B",
      change: 2.4,
      source: "World Bank Remittance Data",
      confidence: "B"
    },
    {
      titleEn: "% of GDP",
      titleAr: "نسبة من الناتج المحلي",
      value: "22.5%",
      change: 0.5,
      source: "World Bank/IMF Estimates",
      confidence: "B"
    },
    {
      titleEn: "Avg. Transfer Cost",
      titleAr: "متوسط تكلفة التحويل",
      value: "5.2%",
      change: -0.3,
      source: "World Bank Remittance Prices",
      confidence: "B"
    },
    {
      titleEn: "Diaspora Population",
      titleAr: "المغتربون",
      value: "~1.5M",
      change: 0,
      source: "UN DESA Migration Data",
      confidence: "C"
    },
  ];

  // Major exchange companies
  const exchangeCompanies = [
    { nameEn: "Al-Amal Exchange", nameAr: "صرافة الأمل", status: "Active", regime: "Both" },
    { nameEn: "Al-Kuraimi Islamic Bank", nameAr: "بنك الكريمي الإسلامي", status: "Active", regime: "Both" },
    { nameEn: "Yemen Kuwait Bank", nameAr: "بنك اليمن والكويت", status: "Active", regime: "Both" },
    { nameEn: "CAC Bank", nameAr: "بنك كاك", status: "Active", regime: "Both" },
    { nameEn: "International Bank of Yemen", nameAr: "البنك الدولي اليمني", status: "Limited", regime: "IRG" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[350px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 to-teal-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container relative h-full flex items-center">
          <div className={`max-w-2xl ${language === 'ar' ? 'mr-auto text-right' : 'ml-0'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Send className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-emerald-500 text-white border-0">
                {language === "ar" ? "التدفقات المالية" : "Financial Flows"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "التحويلات المالية"
                : "Remittances"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "تتبع تدفقات التحويلات المالية - شريان الحياة الاقتصادي لليمن"
                : "Tracking remittance flows - Yemen's economic lifeline"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Critical Context */}
        <Card className="mb-8 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                  {language === "ar" ? "أهمية التحويلات" : "Importance of Remittances"}
                </h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {language === "ar"
                    ? "تمثل التحويلات المالية أكثر من 22% من الناتج المحلي الإجمالي لليمن، مما يجعلها المصدر الأكبر للعملة الأجنبية. يعتمد ما يقدر بـ 10 ملايين يمني بشكل مباشر على التحويلات للبقاء."
                    : "Remittances represent over 22% of Yemen's GDP, making them the largest source of foreign currency. An estimated 10 million Yemenis directly depend on remittances for survival."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between">
                  <span>{language === "ar" ? kpi.titleAr : kpi.titleEn}</span>
                  <Badge variant="outline" className="text-xs">{kpi.confidence}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  {kpi.change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : kpi.change < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : null}
                  {kpi.change !== 0 && (
                    <span className={`text-sm ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}% YoY
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {kpi.source}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="flows" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="flows">
              {language === "ar" ? "التدفقات" : "Flows"}
            </TabsTrigger>
            <TabsTrigger value="sources">
              {language === "ar" ? "المصادر" : "Sources"}
            </TabsTrigger>
            <TabsTrigger value="channels">
              {language === "ar" ? "القنوات" : "Channels"}
            </TabsTrigger>
            <TabsTrigger value="challenges">
              {language === "ar" ? "التحديات" : "Challenges"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flows">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "تدفقات التحويلات (2010-2024)" : "Remittance Flows (2010-2024)"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "مليار دولار أمريكي" : "USD Billions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={remittanceFlows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" domain={[0, 5]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 25]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="inflows" 
                      stroke="#4C583E" 
                      strokeWidth={2}
                      name={language === "ar" ? "التدفقات (مليار $)" : "Inflows ($B)"}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="gdp_pct" 
                      stroke="#C0A030" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={language === "ar" ? "% من الناتج المحلي" : "% of GDP"}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {language === "ar"
                      ? "ملاحظة: ارتفعت نسبة التحويلات من الناتج المحلي بشكل كبير بعد 2015 بسبب انكماش الاقتصاد وليس زيادة التحويلات. البيانات تقديرية بسبب حجم القطاع غير الرسمي الكبير."
                      : "Note: Remittances as % of GDP rose sharply after 2015 due to economic contraction, not increased remittances. Data is estimated due to large informal sector."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === "ar" ? "المصدر:" : "Source:"} World Bank Bilateral Remittance Matrix, IMF Balance of Payments (2024)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "الدول المصدرة للتحويلات" : "Remittance Source Countries"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "توزيع التحويلات حسب البلد المصدر (2024)" : "Distribution by source country (2024)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sourceCountries}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="percentage"
                        label={({ name, percentage }) => `${percentage}%`}
                      >
                        {sourceCountries.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        formatter={(value, entry: any) => 
                          language === "ar" 
                            ? sourceCountries.find(s => s.nameEn === value)?.nameAr 
                            : value
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "حجم التحويلات حسب المصدر" : "Remittance Volume by Source"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "مليار دولار أمريكي (2024)" : "USD Billions (2024)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sourceCountries.map((country, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium">
                          {language === "ar" ? country.nameAr : country.nameEn}
                        </div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full"
                              style={{ width: `${country.percentage}%`, backgroundColor: country.color }}
                            />
                          </div>
                        </div>
                        <div className="w-20 text-sm text-right">
                          ${country.amount}B
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    {language === "ar" ? "المصدر:" : "Source:"} World Bank Bilateral Remittance Matrix (2024)
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="channels">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "قنوات التحويل" : "Transfer Channels"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "الطرق المستخدمة لإرسال الأموال إلى اليمن"
                    : "Methods used to send money to Yemen"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transferChannels.map((channel, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">
                          {language === "ar" ? channel.nameAr : channel.nameEn}
                        </h4>
                        <Badge variant="outline">{channel.percentage}%</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            {language === "ar" ? "التكلفة:" : "Cost:"}
                          </span>
                          <span className="ml-2 font-medium">{channel.avgCost}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {language === "ar" ? "الوقت:" : "Time:"}
                          </span>
                          <span className="ml-2 font-medium">{channel.avgTime}</span>
                        </div>
                        <div className="text-muted-foreground italic">
                          {channel.notes}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    {language === "ar" ? "التحديات الرئيسية" : "Key Challenges"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {language === "ar" ? "إلغاء العلاقات المصرفية" : "De-risking"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar"
                        ? "قطعت البنوك الدولية علاقاتها مع البنوك اليمنية بسبب مخاوف الامتثال، مما يجبر التحويلات على القنوات غير الرسمية."
                        : "International banks have cut ties with Yemeni banks due to compliance concerns, forcing remittances through informal channels."}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {language === "ar" ? "العقوبات والامتثال" : "Sanctions & Compliance"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar"
                        ? "تخلق العقوبات المفروضة على اليمن تعقيدات في الامتثال تؤخر التحويلات وتزيد التكاليف."
                        : "Yemen-related sanctions create compliance complexities that delay transfers and increase costs."}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {language === "ar" ? "انقسام العملة" : "Currency Split"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar"
                        ? "النظام النقدي المنقسم يعقد التحويلات، حيث تختلف أسعار الصرف بشكل كبير بين المناطق."
                        : "The split monetary system complicates transfers, with exchange rates varying significantly between regions."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "شركات الصرافة الرئيسية" : "Major Exchange Companies"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" 
                      ? "المؤسسات المالية التي تسهل التحويلات"
                      : "Financial institutions facilitating remittances"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {exchangeCompanies.map((company, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">
                            {language === "ar" ? company.nameAr : company.nameEn}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={company.status === "Active" ? "default" : "secondary"}>
                            {company.status}
                          </Badge>
                          <Badge variant="outline">{company.regime}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    {language === "ar" 
                      ? "ملاحظة: أوقف البنك المركزي-عدن 79 شركة صرافة في يناير 2026"
                      : "Note: CBY-Aden suspended 79 exchange companies in January 2026"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
