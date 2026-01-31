import { useLanguage } from "@/contexts/LanguageContext";
import { SourcesUsedPanel } from "@/components/SourcesUsedPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Wheat,
  Download,
  Info,
  AlertTriangle,
  FileText,
  ArrowLeft,
  Users
} from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function FoodSecurity() {
  const { language } = useLanguage();

  // IPC data - Updated January 2026 (WFP/OCHA HNO 2025)
  const ipcData = [
    { phase: language === "ar" ? "المرحلة 1 - الحد الأدنى" : "Phase 1 - Minimal", population: 2.8, color: "#22C55E" },
    { phase: language === "ar" ? "المرحلة 2 - إجهاد" : "Phase 2 - Stressed", population: 7.2, color: "#EAB308" },
    { phase: language === "ar" ? "المرحلة 3 - أزمة" : "Phase 3 - Crisis", population: 12.5, color: "#F97316" },
    { phase: language === "ar" ? "المرحلة 4 - طوارئ" : "Phase 4 - Emergency", population: 6.8, color: "#EF4444" },
    { phase: language === "ar" ? "المرحلة 5 - مجاعة" : "Phase 5 - Famine", population: 0.5, color: "#7F1D1D" },
  ];

  // Food insecurity trends - Updated January 2026 (IPC/WFP)
  const trendData = [
    { year: "2019", acute: 15.9, severe: 10.2 },
    { year: "2020", acute: 16.2, severe: 11.3 },
    { year: "2021", acute: 16.1, severe: 11.0 },
    { year: "2022", acute: 17.4, severe: 12.5 },
    { year: "2023", acute: 17.6, severe: 12.8 },
    { year: "2024", acute: 17.8, severe: 12.2 },
    { year: "2025", acute: 19.8, severe: 13.5 }, // 19.8M food insecure (IPC Dec 2025)
    { year: "2026*", acute: 20.5, severe: 14.2 }, // Projected worsening
  ];

  // Malnutrition by governorate
  const malnutritionData = [
    { governorate: language === "ar" ? "الحديدة" : "Hodeidah", gam: 27.5, sam: 8.2 },
    { governorate: language === "ar" ? "حجة" : "Hajjah", gam: 24.3, sam: 7.1 },
    { governorate: language === "ar" ? "لحج" : "Lahj", gam: 22.8, sam: 6.5 },
    { governorate: language === "ar" ? "تعز" : "Taiz", gam: 21.5, sam: 5.8 },
    { governorate: language === "ar" ? "عدن" : "Aden", gam: 18.2, sam: 4.5 },
    { governorate: language === "ar" ? "صنعاء" : "Sana'a", gam: 16.5, sam: 3.8 },
  ];

  const kpis = [
    {
      titleEn: "Food Insecure",
      titleAr: "انعدام الأمن الغذائي",
      value: "19.8M",
      change: 11.2,
      source: "IPC Dec 2025",
      confidence: "A"
    },
    {
      titleEn: "Acute Malnutrition",
      titleAr: "سوء التغذية الحاد",
      value: "2.5M",
      change: 13.6,
      source: "UNICEF 2025",
      confidence: "A"
    },
    {
      titleEn: "Children SAM",
      titleAr: "الأطفال - سوء تغذية حاد",
      value: "620K",
      change: 14.8,
      source: "UNICEF 2025",
      confidence: "A"
    },
    {
      titleEn: "Aid Dependent",
      titleAr: "المعتمدون على المساعدات",
      value: "21.6M",
      change: 0.0,
      source: "OCHA HNO 2025",
      confidence: "A"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section with Background Image */}
      <section className="relative h-[350px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(/sectors/food-security.jpg)` }}
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
                <Wheat className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-[#2e8b6e] text-white border-0">
                {language === "ar" ? "القطاع الإنساني" : "Humanitarian Sector"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "الأمن الغذائي والأسواق"
                : "Food Security & Markets"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "تحليل حالة الأمن الغذائي وسوء التغذية وأسواق الغذاء في اليمن"
                : "Analysis of food security status, malnutrition, and food markets in Yemen"}
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
                  {language === "ar" ? "أزمة إنسانية حادة" : "Acute Humanitarian Crisis"}
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {language === "ar"
                    ? "اليمن يواجه واحدة من أسوأ الأزمات الإنسانية في العالم. أكثر من نصف السكان يعانون من انعدام الأمن الغذائي."
                    : "Yemen faces one of the world's worst humanitarian crises. Over half the population suffers from food insecurity."}
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
        <Tabs defaultValue="ipc">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ipc">
              {language === "ar" ? "تصنيف IPC" : "IPC Classification"}
            </TabsTrigger>
            <TabsTrigger value="trends">
              {language === "ar" ? "الاتجاهات" : "Trends"}
            </TabsTrigger>
            <TabsTrigger value="malnutrition">
              {language === "ar" ? "سوء التغذية" : "Malnutrition"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ipc">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "تصنيف الأمن الغذائي (IPC)" : "Food Security Classification (IPC)"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "السكان بالملايين (2024)" : "Population in millions (2024)"}
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
                        data={ipcData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="population"
                        label={({ population }) => `${population}M`}
                      >
                        {ipcData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {ipcData.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.phase}: {item.population}M</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{language === "ar" ? "المصدر" : "Source"}</span>
                  </div>
                  <p className="text-muted-foreground">
                    Integrated Food Security Phase Classification (IPC) • October 2024 Analysis
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "اتجاهات انعدام الأمن الغذائي" : "Food Insecurity Trends"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "السكان بالملايين" : "Population in millions"}
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
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="acute" 
                      stroke="#F97316" 
                      strokeWidth={2}
                      name={language === "ar" ? "انعدام حاد (IPC 3+)" : "Acute (IPC 3+)"}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="severe" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name={language === "ar" ? "انعدام شديد (IPC 4+)" : "Severe (IPC 4+)"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="malnutrition">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {language === "ar" ? "سوء التغذية حسب المحافظة" : "Malnutrition by Governorate"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "نسبة الأطفال دون 5 سنوات" : "Percentage of children under 5"}
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
                  <BarChart data={malnutritionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 30]} />
                    <YAxis dataKey="governorate" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="gam" 
                      fill="#F97316" 
                      name={language === "ar" ? "سوء تغذية عام (GAM)" : "Global Acute Malnutrition (GAM)"}
                    />
                    <Bar 
                      dataKey="sam" 
                      fill="#EF4444" 
                      name={language === "ar" ? "سوء تغذية حاد (SAM)" : "Severe Acute Malnutrition (SAM)"}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-sm border border-orange-200">
                  <p className="text-orange-700 dark:text-orange-300">
                    {language === "ar"
                      ? "معدل GAM أعلى من 15% يعتبر حالة طوارئ وفقاً لمعايير منظمة الصحة العالمية."
                      : "GAM rate above 15% is considered an emergency according to WHO standards."}
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
                <h4 className="font-semibold mb-1">Yemen IPC Acute Food Insecurity Analysis</h4>
                <p className="text-sm text-muted-foreground mb-2">IPC • October 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-1">Yemen Nutrition Cluster Bulletin</h4>
                <p className="text-sm text-muted-foreground mb-2">UNICEF • November 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources Used Panel */}
      <SourcesUsedPanel sectorCode="food" />
    </div>
  );
}
