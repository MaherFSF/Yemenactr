import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Landmark, 
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle,
  Globe,
  Building2,
  Info
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function PublicDebt() {
  const { language } = useLanguage();

  // Public debt data (IMF/World Bank estimates)
  const debtTrends = [
    { year: "2010", total: 7.8, external: 5.2, domestic: 2.6, gdp_pct: 23.4 },
    { year: "2011", total: 8.5, external: 5.8, domestic: 2.7, gdp_pct: 26.2 },
    { year: "2012", total: 9.2, external: 6.3, domestic: 2.9, gdp_pct: 27.0 },
    { year: "2013", total: 10.1, external: 6.8, domestic: 3.3, gdp_pct: 27.0 },
    { year: "2014", total: 11.2, external: 7.2, domestic: 4.0, gdp_pct: 27.2 },
    { year: "2015", total: 12.8, external: 7.5, domestic: 5.3, gdp_pct: 69.0 },
    { year: "2016", total: 14.5, external: 7.8, domestic: 6.7, gdp_pct: 55.8 },
    { year: "2017", total: 16.2, external: 8.0, domestic: 8.2, gdp_pct: 66.5 },
    { year: "2018", total: 17.8, external: 8.2, domestic: 9.6, gdp_pct: 67.0 },
    { year: "2019", total: 19.5, external: 8.4, domestic: 11.1, gdp_pct: 88.5 },
    { year: "2020", total: 21.2, external: 8.5, domestic: 12.7, gdp_pct: 110.5 },
    { year: "2021", total: 22.8, external: 8.6, domestic: 14.2, gdp_pct: 116.2 },
    { year: "2022", total: 24.5, external: 8.7, domestic: 15.8, gdp_pct: 126.3 },
    { year: "2023", total: 26.2, external: 8.8, domestic: 17.4, gdp_pct: 135.5 },
    { year: "2024", total: 28.0, external: 8.9, domestic: 19.1, gdp_pct: 145.0 },
  ];

  // External creditors
  const externalCreditors = [
    { nameEn: "Saudi Arabia", nameAr: "السعودية", amount: 3.2, percentage: 36, color: "#2e8b6e" },
    { nameEn: "World Bank/IDA", nameAr: "البنك الدولي", amount: 2.1, percentage: 24, color: "#1e40af" },
    { nameEn: "IMF", nameAr: "صندوق النقد الدولي", amount: 0.9, percentage: 10, color: "#C0A030" },
    { nameEn: "Arab Fund", nameAr: "الصندوق العربي", amount: 0.8, percentage: 9, color: "#7c3aed" },
    { nameEn: "Kuwait Fund", nameAr: "الصندوق الكويتي", amount: 0.6, percentage: 7, color: "#059669" },
    { nameEn: "Other Bilateral", nameAr: "ثنائية أخرى", amount: 1.3, percentage: 14, color: "#6b7280" },
  ];

  // Domestic debt holders
  const domesticDebtHolders = [
    { nameEn: "Central Bank (Monetary Financing)", nameAr: "البنك المركزي (تمويل نقدي)", percentage: 65, color: "#dc2626" },
    { nameEn: "Commercial Banks", nameAr: "البنوك التجارية", percentage: 20, color: "#2e8b6e" },
    { nameEn: "Pension Funds", nameAr: "صناديق التقاعد", percentage: 10, color: "#1e40af" },
    { nameEn: "Other", nameAr: "أخرى", percentage: 5, color: "#6b7280" },
  ];

  // KPIs
  const kpis = [
    {
      titleEn: "Total Public Debt",
      titleAr: "إجمالي الدين العام",
      value: "$28.0B",
      change: 6.9,
      source: "IMF Article IV Estimates",
      confidence: "C",
      date: "2024"
    },
    {
      titleEn: "Debt-to-GDP Ratio",
      titleAr: "نسبة الدين للناتج المحلي",
      value: "145%",
      change: 9.5,
      source: "IMF/World Bank",
      confidence: "C",
      date: "2024"
    },
    {
      titleEn: "External Debt",
      titleAr: "الدين الخارجي",
      value: "$8.9B",
      change: 1.1,
      source: "World Bank IDS",
      confidence: "B",
      date: "2024"
    },
    {
      titleEn: "Domestic Debt",
      titleAr: "الدين المحلي",
      value: "$19.1B",
      change: 9.8,
      source: "CBY/IMF Estimates",
      confidence: "C",
      date: "2024"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[350px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-900 to-red-800" />
        <div className="absolute inset-0 opacity-10">
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
              <Badge className="bg-rose-500 text-white border-0">
                {language === "ar" ? "المالية العامة" : "Public Finance"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "الدين العام"
                : "Public Debt"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "تتبع الدين العام الداخلي والخارجي لليمن"
                : "Tracking Yemen's domestic and external public debt"}
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
                  {language === "ar" ? "تحذير: بيانات تقديرية" : "Warning: Estimated Data"}
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {language === "ar"
                    ? "بيانات الدين العام تقديرية بسبب الانقسام المؤسسي. كلا البنكين المركزيين (عدن وصنعاء) يصدران أدوات دين منفصلة، والتمويل النقدي الكبير يجعل التتبع الدقيق صعباً."
                    : "Public debt data is estimated due to institutional split. Both central banks (Aden and Sana'a) issue separate debt instruments, and significant monetary financing makes accurate tracking difficult."}
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
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">
                    +{kpi.change}% YoY
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {kpi.source} ({kpi.date})
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">
              {language === "ar" ? "الاتجاهات" : "Trends"}
            </TabsTrigger>
            <TabsTrigger value="external">
              {language === "ar" ? "الدين الخارجي" : "External Debt"}
            </TabsTrigger>
            <TabsTrigger value="domestic">
              {language === "ar" ? "الدين المحلي" : "Domestic Debt"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "تطور الدين العام (2010-2024)" : "Public Debt Evolution (2010-2024)"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "مليار دولار أمريكي" : "USD Billions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={debtTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" domain={[0, 30]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 160]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="total" 
                      stroke="#dc2626" 
                      strokeWidth={2}
                      name={language === "ar" ? "إجمالي الدين ($B)" : "Total Debt ($B)"}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="external" 
                      stroke="#1e40af" 
                      strokeWidth={2}
                      name={language === "ar" ? "الدين الخارجي ($B)" : "External Debt ($B)"}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="domestic" 
                      stroke="#2e8b6e" 
                      strokeWidth={2}
                      name={language === "ar" ? "الدين المحلي ($B)" : "Domestic Debt ($B)"}
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
                      ? "ملاحظة: ارتفعت نسبة الدين للناتج المحلي بشكل حاد بعد 2015 بسبب انكماش الاقتصاد والتمويل النقدي الكبير لتغطية العجز الحكومي."
                      : "Note: Debt-to-GDP ratio rose sharply after 2015 due to economic contraction and significant monetary financing to cover government deficits."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === "ar" ? "المصدر:" : "Source:"} IMF Article IV, World Bank International Debt Statistics (2024)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="external">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "الدائنون الخارجيون" : "External Creditors"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "توزيع الدين الخارجي حسب الدائن" : "External debt distribution by creditor"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={externalCreditors}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="percentage"
                        label={({ percentage }) => `${percentage}%`}
                      >
                        {externalCreditors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        formatter={(value, entry: any) => 
                          language === "ar" 
                            ? externalCreditors.find(s => s.nameEn === value)?.nameAr 
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
                    {language === "ar" ? "حجم الدين حسب الدائن" : "Debt by Creditor"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "مليار دولار أمريكي" : "USD Billions"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {externalCreditors.map((creditor, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium">
                          {language === "ar" ? creditor.nameAr : creditor.nameEn}
                        </div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full"
                              style={{ width: `${creditor.percentage}%`, backgroundColor: creditor.color }}
                            />
                          </div>
                        </div>
                        <div className="w-16 text-sm text-right">
                          ${creditor.amount}B
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="domestic">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "حاملو الدين المحلي" : "Domestic Debt Holders"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "توزيع الدين المحلي" : "Domestic debt distribution"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={domesticDebtHolders}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="percentage"
                        label={({ percentage }) => `${percentage}%`}
                      >
                        {domesticDebtHolders.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        formatter={(value, entry: any) => 
                          language === "ar" 
                            ? domesticDebtHolders.find(s => s.nameEn === value)?.nameAr 
                            : value
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    {language === "ar" ? "التمويل النقدي" : "Monetary Financing"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      {language === "ar" ? "65% من الدين المحلي" : "65% of Domestic Debt"}
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {language === "ar"
                        ? "يتم تمويل معظم الدين المحلي من خلال طباعة النقود من البنك المركزي، مما يساهم بشكل كبير في التضخم وانهيار العملة."
                        : "Most domestic debt is financed through central bank money printing, significantly contributing to inflation and currency collapse."}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {language === "ar" ? "الآثار الاقتصادية" : "Economic Implications"}
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• {language === "ar" ? "ضغط تضخمي مستمر" : "Persistent inflationary pressure"}</li>
                      <li>• {language === "ar" ? "تآكل القوة الشرائية" : "Erosion of purchasing power"}</li>
                      <li>• {language === "ar" ? "عدم استقرار سعر الصرف" : "Exchange rate instability"}</li>
                      <li>• {language === "ar" ? "مزاحمة القطاع الخاص" : "Crowding out private sector"}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
