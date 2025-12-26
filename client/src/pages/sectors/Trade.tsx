import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertCircle
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Trade() {
  const { language } = useLanguage();

  // Sample data for charts
  const tradeBalanceData = [
    { month: language === "ar" ? "يناير" : "Jan", imports: 850, exports: 320 },
    { month: language === "ar" ? "فبراير" : "Feb", imports: 920, exports: 340 },
    { month: language === "ar" ? "مارس" : "Mar", imports: 880, exports: 360 },
    { month: language === "ar" ? "أبريل" : "Apr", imports: 910, exports: 350 },
    { month: language === "ar" ? "مايو" : "May", imports: 940, exports: 380 },
    { month: language === "ar" ? "يونيو" : "Jun", imports: 960, exports: 400 },
  ];

  const exportCompositionData = [
    { name: language === "ar" ? "النفط والغاز" : "Oil & Gas", value: 45 },
    { name: language === "ar" ? "الأسماك" : "Fish", value: 25 },
    { name: language === "ar" ? "القهوة" : "Coffee", value: 15 },
    { name: language === "ar" ? "المعادن" : "Minerals", value: 10 },
    { name: language === "ar" ? "أخرى" : "Others", value: 5 },
  ];

  const importCompositionData = [
    { name: language === "ar" ? "الغذاء" : "Food", value: 35 },
    { name: language === "ar" ? "الوقود" : "Fuel", value: 30 },
    { name: language === "ar" ? "الآلات" : "Machinery", value: 15 },
    { name: language === "ar" ? "الأدوية" : "Medicine", value: 12 },
    { name: language === "ar" ? "أخرى" : "Others", value: 8 },
  ];

  const COLORS = ['#103050', '#107040', '#C0A030', '#E57373', '#64B5F6'];

  const tradingPartnersData = [
    { country: language === "ar" ? "الصين" : "China", value: 1850 },
    { country: language === "ar" ? "السعودية" : "Saudi Arabia", value: 1420 },
    { country: language === "ar" ? "الإمارات" : "UAE", value: 1280 },
    { country: language === "ar" ? "الهند" : "India", value: 980 },
    { country: language === "ar" ? "تركيا" : "Turkey", value: 720 },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-900/20 via-primary/10 to-green-900/20 border-b">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <Ship className="h-8 w-8 text-green-500" />
              </div>
              <Badge variant="outline" className="text-sm">
                {language === "ar" ? "التجارة والتجارة الخارجية" : "Trade & Commerce"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {language === "ar" 
                ? "التجارة والتجارة الخارجية في اليمن"
                : "Yemen Trade & Commerce"}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {language === "ar"
                ? "تحليل شامل لتدفقات التجارة الدولية، الصادرات والواردات، الشركاء التجاريين، والسياسات التجارية في كلا النظامين"
                : "Comprehensive analysis of international trade flows, imports and exports, trading partners, and commercial policies across both jurisdictions"}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2">
                <FileText className="h-5 w-5" />
                {language === "ar" ? "تحميل تقرير التجارة" : "Download Trade Report"}
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
                <span>{language === "ar" ? "إجمالي الصادرات" : "Total Exports"}</span>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$2.3B</div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>+8.5%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "مقارنة بالعام الماضي" : "vs last year"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "إجمالي الواردات" : "Total Imports"}</span>
                <Ship className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$5.5B</div>
              <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                <TrendingDown className="h-4 w-4" />
                <span>-3.2%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "مقارنة بالعام الماضي" : "vs last year"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "الميزان التجاري" : "Trade Balance"}</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">-$3.2B</div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>+12%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "تحسن" : "improvement"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "الشركاء التجاريون" : "Trading Partners"}</span>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">42</div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <ArrowUpRight className="h-4 w-4" />
                <span>+5</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "دول جديدة" : "new countries"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trade Analysis Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              {language === "ar" ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="exports">
              {language === "ar" ? "الصادرات" : "Exports"}
            </TabsTrigger>
            <TabsTrigger value="imports">
              {language === "ar" ? "الواردات" : "Imports"}
            </TabsTrigger>
            <TabsTrigger value="partners">
              {language === "ar" ? "الشركاء" : "Partners"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Trade Balance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "اتجاهات الميزان التجاري" : "Trade Balance Trends"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "الصادرات والواردات (بالملايين دولار) - آخر 6 أشهر"
                    : "Exports and Imports (USD Millions) - Last 6 Months"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={tradeBalanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="exports" 
                      stroke="#107040" 
                      strokeWidth={2}
                      name={language === "ar" ? "الصادرات" : "Exports"}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="imports" 
                      stroke="#C0A030" 
                      strokeWidth={2}
                      name={language === "ar" ? "الواردات" : "Imports"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Trade Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "ar" ? "أهم التطورات" : "Key Developments"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        {language === "ar"
                          ? "زيادة صادرات الأسماك بنسبة 18% بعد تحسن البنية التحتية في الموانئ"
                          : "Fish exports increased 18% following port infrastructure improvements"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        {language === "ar"
                          ? "اتفاقيات تجارية جديدة مع 3 دول أفريقية"
                          : "New trade agreements signed with 3 African nations"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        {language === "ar"
                          ? "تأخيرات في الموانئ بسبب نقص الوقود تؤثر على التجارة"
                          : "Port delays due to fuel shortages impacting trade flows"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowDownRight className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        {language === "ar"
                          ? "انخفاض واردات الآلات بنسبة 12% بسبب قيود النقد الأجنبي"
                          : "Machinery imports down 12% due to foreign currency restrictions"}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "ar" ? "أهم الموانئ" : "Major Ports"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{language === "ar" ? "ميناء عدن" : "Aden Port"}</div>
                        <div className="text-sm text-muted-foreground">
                          {language === "ar" ? "45% من إجمالي التجارة" : "45% of total trade"}
                        </div>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{language === "ar" ? "ميناء الحديدة" : "Hodeidah Port"}</div>
                        <div className="text-sm text-muted-foreground">
                          {language === "ar" ? "32% من إجمالي التجارة" : "32% of total trade"}
                        </div>
                      </div>
                      <Badge variant="secondary">Limited</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{language === "ar" ? "ميناء المكلا" : "Mukalla Port"}</div>
                        <div className="text-sm text-muted-foreground">
                          {language === "ar" ? "15% من إجمالي التجارة" : "15% of total trade"}
                        </div>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exports" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Export Composition */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "تكوين الصادرات" : "Export Composition"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "حسب القطاع (%)" : "By Sector (%)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={exportCompositionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {exportCompositionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Export Products */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "أهم المنتجات المصدرة" : "Top Export Products"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {language === "ar" ? "النفط الخام" : "Crude Oil"}
                        </span>
                        <span className="text-sm font-bold">$1.04B</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {language === "ar" ? "الأسماك والمأكولات البحرية" : "Fish & Seafood"}
                        </span>
                        <span className="text-sm font-bold">$575M</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {language === "ar" ? "البن اليمني" : "Yemeni Coffee"}
                        </span>
                        <span className="text-sm font-bold">$345M</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {language === "ar" ? "المعادن" : "Minerals"}
                        </span>
                        <span className="text-sm font-bold">$230M</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="imports" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Import Composition */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "تكوين الواردات" : "Import Composition"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "حسب القطاع (%)" : "By Sector (%)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={importCompositionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {importCompositionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Import Products */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "أهم المنتجات المستوردة" : "Top Import Products"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {language === "ar" ? "القمح والحبوب" : "Wheat & Grains"}
                        </span>
                        <span className="text-sm font-bold">$1.93B</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {language === "ar" ? "الوقود والمشتقات النفطية" : "Fuel & Petroleum"}
                        </span>
                        <span className="text-sm font-bold">$1.65B</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {language === "ar" ? "الآلات والمعدات" : "Machinery & Equipment"}
                        </span>
                        <span className="text-sm font-bold">$825M</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {language === "ar" ? "الأدوية والمستلزمات الطبية" : "Medicine & Medical Supplies"}
                        </span>
                        <span className="text-sm font-bold">$660M</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            {/* Top Trading Partners */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "أهم الشركاء التجاريين" : "Top Trading Partners"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "حجم التجارة الإجمالي (بالملايين دولار)"
                    : "Total Trade Volume (USD Millions)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tradingPartnersData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="country" type="category" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#107040" name={language === "ar" ? "حجم التجارة" : "Trade Volume"} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Regional Trade Analysis */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "ar" ? "آسيا" : "Asia"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">$4.2B</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {language === "ar" ? "52% من إجمالي التجارة" : "52% of total trade"}
                  </div>
                  <div className="text-sm">
                    {language === "ar" ? "الشركاء الرئيسيون:" : "Main partners:"} 
                    <span className="font-medium"> {language === "ar" ? "الصين، الهند، تايلاند" : "China, India, Thailand"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "ar" ? "الشرق الأوسط" : "Middle East"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">$2.8B</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {language === "ar" ? "35% من إجمالي التجارة" : "35% of total trade"}
                  </div>
                  <div className="text-sm">
                    {language === "ar" ? "الشركاء الرئيسيون:" : "Main partners:"} 
                    <span className="font-medium"> {language === "ar" ? "السعودية، الإمارات، عمان" : "Saudi Arabia, UAE, Oman"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "ar" ? "أفريقيا وأوروبا" : "Africa & Europe"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">$1.1B</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {language === "ar" ? "13% من إجمالي التجارة" : "13% of total trade"}
                  </div>
                  <div className="text-sm">
                    {language === "ar" ? "الشركاء الرئيسيون:" : "Main partners:"} 
                    <span className="font-medium"> {language === "ar" ? "تركيا، مصر، إثيوبيا" : "Turkey, Egypt, Ethiopia"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
                        ? "تحليل التجارة الخارجية - الربع الرابع 2024"
                        : "External Trade Analysis Q4 2024"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === "ar" ? "20 ديسمبر 2024" : "December 20, 2024"}
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
                        ? "تقييم أداء الموانئ اليمنية"
                        : "Yemen Ports Performance Assessment"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === "ar" ? "5 ديسمبر 2024" : "December 5, 2024"}
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
