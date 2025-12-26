import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Users,
  FileText,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Banking() {
  const { language } = useLanguage();

  // Sample data for charts (will be replaced with real data from tRPC)
  const liquidityData = [
    { month: language === "ar" ? "يناير" : "Jan", aden: 2.3, sanaa: 1.8 },
    { month: language === "ar" ? "فبراير" : "Feb", aden: 2.5, sanaa: 1.6 },
    { month: language === "ar" ? "مارس" : "Mar", aden: 2.7, sanaa: 1.5 },
    { month: language === "ar" ? "أبريل" : "Apr", aden: 2.4, sanaa: 1.4 },
    { month: language === "ar" ? "مايو" : "May", aden: 2.6, sanaa: 1.3 },
    { month: language === "ar" ? "يونيو" : "Jun", aden: 2.8, sanaa: 1.2 },
  ];

  const bankPerformanceData = [
    { name: "CAC Bank", assets: 450, deposits: 380, loans: 280 },
    { name: "Yemen Kuwait Bank", assets: 380, deposits: 320, loans: 240 },
    { name: "Tadhamon Bank", assets: 320, deposits: 270, loans: 200 },
    { name: "Al-Amal Microfinance", assets: 180, deposits: 150, loans: 120 },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900/20 via-primary/10 to-blue-900/20 border-b">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
              <Badge variant="outline" className="text-sm">
                {language === "ar" ? "القطاع المصرفي والمالي" : "Banking & Financial Sector"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {language === "ar" 
                ? "القطاع المصرفي والمالي في اليمن"
                : "Yemen Banking & Financial Sector"}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {language === "ar"
                ? "تحليل شامل لأداء البنوك التجارية والإسلامية ومؤسسات التمويل الأصغر مع تتبع التطورات التنظيمية في كل من عدن وصنعاء"
                : "Comprehensive analysis of commercial banks, Islamic banks, and microfinance institutions with regulatory developments tracking in both Aden and Sana'a jurisdictions"}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2">
                <FileText className="h-5 w-5" />
                {language === "ar" ? "تحميل التقرير الكامل" : "Download Full Report"}
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Download className="h-5 w-5" />
                {language === "ar" ? "تصدير البيانات" : "Export Data"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Key Metrics Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "إجمالي الأصول" : "Total Assets"}</span>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$4.2B</div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>+5.2%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "مقارنة بالربع السابق" : "vs last quarter"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "إجمالي الودائع" : "Total Deposits"}</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$3.5B</div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>+3.8%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "مقارنة بالربع السابق" : "vs last quarter"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "إجمالي القروض" : "Total Loans"}</span>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$2.6B</div>
              <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                <TrendingDown className="h-4 w-4" />
                <span>-2.1%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "مقارنة بالربع السابق" : "vs last quarter"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "القروض المتعثرة" : "NPL Ratio"}</span>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18.5%</div>
              <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                <ArrowUpRight className="h-4 w-4" />
                <span>+1.3%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "مقارنة بالربع السابق" : "vs last quarter"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regime-Specific Analysis Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              {language === "ar" ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="aden">
              {language === "ar" ? "عدن" : "Aden"}
            </TabsTrigger>
            <TabsTrigger value="sanaa">
              {language === "ar" ? "صنعاء" : "Sana'a"}
            </TabsTrigger>
            <TabsTrigger value="comparison">
              {language === "ar" ? "المقارنة" : "Comparison"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Liquidity Trends */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "اتجاهات السيولة" : "Liquidity Trends"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "نسبة السيولة (%) حسب النظام - آخر 6 أشهر"
                    : "Liquidity Ratio (%) by Regime - Last 6 Months"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={liquidityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="aden" 
                      stroke="#107040" 
                      strokeWidth={2}
                      name={language === "ar" ? "عدن" : "Aden"}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sanaa" 
                      stroke="#C0A030" 
                      strokeWidth={2}
                      name={language === "ar" ? "صنعاء" : "Sana'a"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bank Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "أداء البنوك الرئيسية" : "Major Banks Performance"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "الأصول والودائع والقروض (بالملايين دولار)"
                    : "Assets, Deposits, and Loans (USD Millions)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bankPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="assets" fill="#103050" name={language === "ar" ? "الأصول" : "Assets"} />
                    <Bar dataKey="deposits" fill="#107040" name={language === "ar" ? "الودائع" : "Deposits"} />
                    <Bar dataKey="loans" fill="#C0A030" name={language === "ar" ? "القروض" : "Loans"} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aden" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="default">Aden</Badge>
                  {language === "ar" ? "القطاع المصرفي في عدن" : "Aden Banking Sector"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      {language === "ar" ? "البنوك التجارية" : "Commercial Banks"}
                    </div>
                    <div className="text-2xl font-bold">8</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      {language === "ar" ? "البنوك الإسلامية" : "Islamic Banks"}
                    </div>
                    <div className="text-2xl font-bold">4</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      {language === "ar" ? "مؤسسات التمويل الأصغر" : "MFIs"}
                    </div>
                    <div className="text-2xl font-bold">12</div>
                  </div>
                </div>

                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-semibold mb-2">
                    {language === "ar" ? "التطورات التنظيمية الرئيسية" : "Key Regulatory Developments"}
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        {language === "ar"
                          ? "البنك المركزي في عدن أصدر تعميماً جديداً بشأن متطلبات رأس المال"
                          : "Central Bank of Aden issued new capital adequacy requirements"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        {language === "ar"
                          ? "تحسن في نسبة السيولة بنسبة 12% خلال الربع الأخير"
                          : "Liquidity ratio improved by 12% in the last quarter"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        {language === "ar"
                          ? "3 بنوك جديدة في طور الحصول على التراخيص"
                          : "3 new banks in licensing process"}
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sanaa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">Sana'a</Badge>
                  {language === "ar" ? "القطاع المصرفي في صنعاء" : "Sana'a Banking Sector"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      {language === "ar" ? "البنوك التجارية" : "Commercial Banks"}
                    </div>
                    <div className="text-2xl font-bold">6</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      {language === "ar" ? "البنوك الإسلامية" : "Islamic Banks"}
                    </div>
                    <div className="text-2xl font-bold">3</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      {language === "ar" ? "مؤسسات التمويل الأصغر" : "MFIs"}
                    </div>
                    <div className="text-2xl font-bold">8</div>
                  </div>
                </div>

                <div className="border-l-4 border-destructive pl-4 py-2">
                  <h4 className="font-semibold mb-2">
                    {language === "ar" ? "التحديات الرئيسية" : "Key Challenges"}
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ArrowDownRight className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>
                        {language === "ar"
                          ? "انخفاض السيولة بنسبة 15% خلال الربع الأخير"
                          : "Liquidity declined by 15% in the last quarter"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>
                        {language === "ar"
                          ? "ارتفاع نسبة القروض المتعثرة إلى 24%"
                          : "NPL ratio increased to 24%"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>
                        {language === "ar"
                          ? "قيود على التحويلات الدولية تؤثر على التجارة"
                          : "International transfer restrictions impacting trade"}
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "مقارنة بين النظامين" : "Regime Comparison"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "مقارنة شاملة للمؤشرات المصرفية الرئيسية"
                    : "Comprehensive comparison of key banking indicators"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">
                          {language === "ar" ? "المؤشر" : "Indicator"}
                        </th>
                        <th className="text-center p-3">
                          {language === "ar" ? "عدن" : "Aden"}
                        </th>
                        <th className="text-center p-3">
                          {language === "ar" ? "صنعاء" : "Sana'a"}
                        </th>
                        <th className="text-center p-3">
                          {language === "ar" ? "الفرق" : "Difference"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">{language === "ar" ? "نسبة السيولة" : "Liquidity Ratio"}</td>
                        <td className="text-center p-3 font-semibold text-green-600">2.8%</td>
                        <td className="text-center p-3 font-semibold text-orange-600">1.2%</td>
                        <td className="text-center p-3">
                          <Badge variant="default">+1.6%</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">{language === "ar" ? "نسبة القروض المتعثرة" : "NPL Ratio"}</td>
                        <td className="text-center p-3 font-semibold text-green-600">15.2%</td>
                        <td className="text-center p-3 font-semibold text-red-600">24.1%</td>
                        <td className="text-center p-3">
                          <Badge variant="destructive">-8.9%</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">{language === "ar" ? "كفاية رأس المال" : "Capital Adequacy"}</td>
                        <td className="text-center p-3 font-semibold text-green-600">14.5%</td>
                        <td className="text-center p-3 font-semibold text-orange-600">11.2%</td>
                        <td className="text-center p-3">
                          <Badge variant="default">+3.3%</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3">{language === "ar" ? "العائد على الأصول" : "ROA"}</td>
                        <td className="text-center p-3 font-semibold text-green-600">1.8%</td>
                        <td className="text-center p-3 font-semibold text-red-600">-0.5%</td>
                        <td className="text-center p-3">
                          <Badge variant="default">+2.3%</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sanctions and Compliance */}
        <Card className="mb-8 border-orange-200 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              {language === "ar" ? "العقوبات والامتثال" : "Sanctions & Compliance"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">
                      {language === "ar" ? "البنوك الخاضعة للعقوبات" : "Sanctioned Banks"}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {language === "ar"
                        ? "البنوك التالية خاضعة حالياً لعقوبات دولية بسبب مخاوف تتعلق بتمويل الإرهاب وغسل الأموال:"
                        : "The following banks are currently under international sanctions due to terrorism financing and money laundering concerns:"}
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">US Treasury</Badge>
                        <span>Yemen Kuwait Bank - Sana'a Branch (OFAC, 2019)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">EU Council</Badge>
                        <span>Yemen Exchange Co. - Multiple locations (EU, 2021)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    {language === "ar" ? "البنوك الممتثلة" : "Compliant Banks"}
                  </h4>
                  <div className="text-2xl font-bold text-green-600">18</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "ar"
                      ? "بنك ومؤسسة مالية ملتزمة بمعايير مكافحة غسل الأموال"
                      : "Banks and financial institutions meeting AML standards"}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    {language === "ar" ? "قيد المراجعة" : "Under Review"}
                  </h4>
                  <div className="text-2xl font-bold text-orange-600">5</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "ar"
                      ? "مؤسسات مالية قيد المراجعة من قبل FATF"
                      : "Financial institutions under FATF review"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Reports */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "تقارير ذات صلة" : "Related Reports"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {language === "ar"
                        ? "تحليل القطاع المصرفي - الربع الرابع 2024"
                        : "Banking Sector Analysis Q4 2024"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === "ar" ? "15 ديسمبر 2024" : "December 15, 2024"}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  {language === "ar" ? "تحميل" : "Download"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {language === "ar"
                        ? "تقييم مخاطر القطاع المصرفي"
                        : "Banking Sector Risk Assessment"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === "ar" ? "28 نوفمبر 2024" : "November 28, 2024"}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  {language === "ar" ? "تحميل" : "Download"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
