import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  TrendingUp, 
  TrendingDown,
  Users,
  Home,
  GraduationCap,
  FileText,
  Download,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Poverty() {
  const { language } = useLanguage();

  // Sample data for charts
  const povertyTrendData = [
    { year: "2018", rate: 71, extreme: 45 },
    { year: "2019", rate: 73, extreme: 47 },
    { year: "2020", rate: 78, extreme: 52 },
    { year: "2021", rate: 80, extreme: 54 },
    { year: "2022", rate: 79, extreme: 53 },
    { year: "2023", rate: 77, extreme: 51 },
  ];

  const humanitarianNeedsData = [
    { category: language === "ar" ? "الغذاء" : "Food", value: 17.3 },
    { category: language === "ar" ? "الصحة" : "Health", value: 15.8 },
    { category: language === "ar" ? "المأوى" : "Shelter", value: 8.2 },
    { category: language === "ar" ? "التعليم" : "Education", value: 6.5 },
    { category: language === "ar" ? "المياه" : "Water", value: 12.1 },
  ];

  const developmentIndicatorsData = [
    { indicator: language === "ar" ? "معدل الأمية" : "Literacy Rate", aden: 75, sanaa: 68 },
    { indicator: language === "ar" ? "الوصول للصحة" : "Health Access", aden: 62, sanaa: 48 },
    { indicator: language === "ar" ? "الكهرباء" : "Electricity", aden: 58, sanaa: 42 },
    { indicator: language === "ar" ? "المياه النظيفة" : "Clean Water", aden: 65, sanaa: 51 },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-900/20 via-primary/10 to-red-900/20 border-b">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <Badge variant="outline" className="text-sm">
                {language === "ar" ? "الفقر والتنمية" : "Poverty & Development"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {language === "ar" 
                ? "الفقر والتنمية في اليمن"
                : "Yemen Poverty & Development"}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {language === "ar"
                ? "تحليل شامل لمؤشرات الفقر، الاحتياجات الإنسانية، التنمية البشرية، والمساعدات الدولية مع تتبع التفاوتات الإقليمية"
                : "Comprehensive analysis of poverty indicators, humanitarian needs, human development, and international aid with regional disparity tracking"}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2">
                <FileText className="h-5 w-5" />
                {language === "ar" ? "تحميل التقرير الإنساني" : "Download Humanitarian Report"}
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
                <span>{language === "ar" ? "معدل الفقر" : "Poverty Rate"}</span>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">77%</div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <TrendingDown className="h-4 w-4" />
                <span>-2%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "مقارنة بالعام الماضي" : "vs last year"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "الفقر المدقع" : "Extreme Poverty"}</span>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">51%</div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <TrendingDown className="h-4 w-4" />
                <span>-2%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "مقارنة بالعام الماضي" : "vs last year"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "المحتاجون للمساعدة" : "People in Need"}</span>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">21.6M</div>
              <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>+1.2M</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "مقارنة بالعام الماضي" : "vs last year"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "المساعدات الدولية" : "International Aid"}</span>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$2.8B</div>
              <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                <TrendingDown className="h-4 w-4" />
                <span>-15%</span>
                <span className="text-muted-foreground">
                  {language === "ar" ? "مقارنة بالعام الماضي" : "vs last year"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              {language === "ar" ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="humanitarian">
              {language === "ar" ? "الوضع الإنساني" : "Humanitarian"}
            </TabsTrigger>
            <TabsTrigger value="development">
              {language === "ar" ? "التنمية" : "Development"}
            </TabsTrigger>
            <TabsTrigger value="aid">
              {language === "ar" ? "المساعدات" : "Aid"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Poverty Trends */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "اتجاهات الفقر" : "Poverty Trends"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "معدل الفقر والفقر المدقع (%) - 2018-2023"
                    : "Poverty and Extreme Poverty Rates (%) - 2018-2023"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={povertyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="rate" 
                      stackId="1"
                      stroke="#C0A030" 
                      fill="#C0A030"
                      fillOpacity={0.6}
                      name={language === "ar" ? "معدل الفقر" : "Poverty Rate"}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="extreme" 
                      stackId="2"
                      stroke="#E57373" 
                      fill="#E57373"
                      fillOpacity={0.6}
                      name={language === "ar" ? "الفقر المدقع" : "Extreme Poverty"}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Statistics Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    {language === "ar" ? "السكان" : "Population"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? "إجمالي السكان" : "Total Population"}
                    </span>
                    <span className="font-semibold">33.7M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? "النازحون داخلياً" : "IDPs"}
                    </span>
                    <span className="font-semibold text-orange-600">4.5M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? "اللاجئون" : "Refugees"}
                    </span>
                    <span className="font-semibold">280K</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    {language === "ar" ? "التعليم" : "Education"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? "معدل الالتحاق" : "Enrollment Rate"}
                    </span>
                    <span className="font-semibold">64%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? "الأطفال خارج المدرسة" : "Out of School"}
                    </span>
                    <span className="font-semibold text-red-600">2.4M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? "معدل الأمية" : "Illiteracy Rate"}
                    </span>
                    <span className="font-semibold">32%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    {language === "ar" ? "الصحة" : "Health"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? "سوء التغذية" : "Malnutrition"}
                    </span>
                    <span className="font-semibold text-orange-600">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? "الوصول للرعاية" : "Healthcare Access"}
                    </span>
                    <span className="font-semibold">52%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? "المرافق العاملة" : "Functioning Facilities"}
                    </span>
                    <span className="font-semibold">51%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="humanitarian" className="space-y-6">
            {/* Humanitarian Needs */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "الاحتياجات الإنسانية حسب القطاع" : "Humanitarian Needs by Sector"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "عدد الأشخاص المحتاجين (بالملايين)"
                    : "Number of People in Need (Millions)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={humanitarianNeedsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#E57373" name={language === "ar" ? "المحتاجون" : "People in Need"} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Critical Situation Alerts */}
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  {language === "ar" ? "حالات حرجة" : "Critical Situations"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">
                          {language === "ar" ? "انعدام الأمن الغذائي" : "Food Insecurity"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "ar"
                            ? "17.3 مليون شخص يعانون من انعدام الأمن الغذائي الحاد، منهم 6.1 مليون في مرحلة الطوارئ"
                            : "17.3 million people facing acute food insecurity, with 6.1 million in emergency phase"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">
                          {language === "ar" ? "أزمة الصحة" : "Health Crisis"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "ar"
                            ? "15.8 مليون شخص بحاجة لمساعدة صحية، مع انهيار 50% من المرافق الصحية"
                            : "15.8 million people need health assistance, with 50% of health facilities collapsed"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">
                          {language === "ar" ? "أزمة المأوى" : "Shelter Crisis"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "ar"
                            ? "4.5 مليون نازح داخلياً يعيشون في ظروف صعبة، 8.2 مليون بحاجة لمساعدة في المأوى"
                            : "4.5 million IDPs living in dire conditions, 8.2 million need shelter assistance"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="development" className="space-y-6">
            {/* Development Indicators Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "مؤشرات التنمية - مقارنة إقليمية" : "Development Indicators - Regional Comparison"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "النسبة المئوية للسكان ذوي الوصول"
                    : "Percentage of Population with Access"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={developmentIndicatorsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="indicator" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="aden" fill="#107040" name={language === "ar" ? "عدن" : "Aden"} />
                    <Bar dataKey="sanaa" fill="#C0A030" name={language === "ar" ? "صنعاء" : "Sana'a"} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Development Projects */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "مشاريع التنمية النشطة" : "Active Development Projects"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold mb-1">
                        {language === "ar"
                          ? "مشروع تحسين البنية التحتية للمياه"
                          : "Water Infrastructure Improvement Project"}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {language === "ar" ? "البنك الدولي" : "World Bank"} • $125M
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold mb-1">
                        {language === "ar"
                          ? "برنامج دعم التعليم الأساسي"
                          : "Basic Education Support Program"}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {language === "ar" ? "اليونيسف" : "UNICEF"} • $85M
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                        </div>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold mb-1">
                        {language === "ar"
                          ? "مشروع تعزيز النظام الصحي"
                          : "Health System Strengthening Project"}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {language === "ar" ? "منظمة الصحة العالمية" : "WHO"} • $95M
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aid" className="space-y-6">
            {/* Aid Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "ar" ? "المساعدات المطلوبة" : "Required Aid"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">$4.3B</div>
                  <div className="text-sm text-muted-foreground">
                    {language === "ar" ? "خطة الاستجابة الإنسانية 2024" : "Humanitarian Response Plan 2024"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "ar" ? "المساعدات المتلقاة" : "Received Aid"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">$2.8B</div>
                  <div className="text-sm text-muted-foreground">
                    {language === "ar" ? "65% من المطلوب" : "65% of required"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "ar" ? "فجوة التمويل" : "Funding Gap"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-2">$1.5B</div>
                  <div className="text-sm text-muted-foreground">
                    {language === "ar" ? "35% غير ممول" : "35% unfunded"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Donors */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "أكبر الجهات المانحة 2024" : "Top Donors 2024"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {language === "ar" ? "الولايات المتحدة" : "United States"}
                      </span>
                      <span className="font-bold">$685M</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {language === "ar" ? "السعودية" : "Saudi Arabia"}
                      </span>
                      <span className="font-bold">$520M</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '19%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {language === "ar" ? "الإمارات" : "UAE"}
                      </span>
                      <span className="font-bold">$445M</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '16%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {language === "ar" ? "الاتحاد الأوروبي" : "European Union"}
                      </span>
                      <span className="font-bold">$380M</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '14%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {language === "ar" ? "ألمانيا" : "Germany"}
                      </span>
                      <span className="font-bold">$295M</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '11%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                        ? "خطة الاستجابة الإنسانية 2024"
                        : "Humanitarian Response Plan 2024"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === "ar" ? "1 يناير 2024" : "January 1, 2024"}
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
                        ? "تقرير الأمن الغذائي - ديسمبر 2024"
                        : "Food Security Report - December 2024"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === "ar" ? "10 ديسمبر 2024" : "December 10, 2024"}
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
