import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataQualityBadge, { DevModeBanner } from "@/components/DataQualityBadge";
import { ConfidenceBadge } from "@/components/DataCard";
import { ExportButton } from "@/components/ExportButton";
import SectorExportButtons from "@/components/SectorExportButtons";
import { Download } from "lucide-react";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Heart,
  Droplets,
  Wheat,
  GraduationCap,
  AlertCircle,
  Info,
  FileText,
  Stethoscope
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function Poverty() {
  const { language } = useLanguage();

  // Poverty Rate Data (2014-2024)
  const povertyTrendData = [
    { year: "2014", poverty: 48.6, extreme: 18.8, foodInsecurity: 41.0 },
    { year: "2015", poverty: 62.0, extreme: 28.5, foodInsecurity: 53.0 },
    { year: "2016", poverty: 71.0, extreme: 35.2, foodInsecurity: 62.0 },
    { year: "2017", poverty: 75.0, extreme: 38.5, foodInsecurity: 68.0 },
    { year: "2018", poverty: 78.0, extreme: 42.0, foodInsecurity: 72.0 },
    { year: "2019", poverty: 80.0, extreme: 45.0, foodInsecurity: 75.0 },
    { year: "2020", poverty: 81.0, extreme: 47.0, foodInsecurity: 78.0 },
    { year: "2021", poverty: 80.5, extreme: 46.5, foodInsecurity: 77.0 },
    { year: "2022", poverty: 79.0, extreme: 45.0, foodInsecurity: 75.0 },
    { year: "2023", poverty: 78.0, extreme: 44.0, foodInsecurity: 73.0 },
    { year: "2024", poverty: 77.0, extreme: 43.0, foodInsecurity: 71.0 },
  ];

  // HDI Components
  const hdiData = [
    { year: "2014", hdi: 0.498, health: 0.62, education: 0.38, income: 0.49 },
    { year: "2016", hdi: 0.463, health: 0.58, education: 0.34, income: 0.45 },
    { year: "2018", hdi: 0.447, health: 0.55, education: 0.32, income: 0.43 },
    { year: "2020", hdi: 0.458, health: 0.57, education: 0.33, income: 0.44 },
    { year: "2022", hdi: 0.452, health: 0.55, education: 0.33, income: 0.43 },
    { year: "2024", hdi: 0.448, health: 0.54, education: 0.32, income: 0.42 },
  ];

  // Food Security IPC Phases
  const foodSecurityData = [
    { name: language === "ar" ? "المرحلة 1" : "Phase 1", value: 8, color: "#107040" },
    { name: language === "ar" ? "المرحلة 2" : "Phase 2", value: 21, color: "#C0A030" },
    { name: language === "ar" ? "المرحلة 3" : "Phase 3", value: 38, color: "#F59E0B" },
    { name: language === "ar" ? "المرحلة 4" : "Phase 4", value: 28, color: "#EF4444" },
    { name: language === "ar" ? "المرحلة 5" : "Phase 5", value: 5, color: "#7F1D1D" },
  ];

  // Governorate poverty data
  const governoratePovertyData = [
    { name: language === "ar" ? "الحديدة" : "Hodeidah", poverty: 89, foodInsecurity: 85 },
    { name: language === "ar" ? "حجة" : "Hajjah", poverty: 87, foodInsecurity: 82 },
    { name: language === "ar" ? "صعدة" : "Sa'ada", poverty: 85, foodInsecurity: 80 },
    { name: language === "ar" ? "تعز" : "Taiz", poverty: 82, foodInsecurity: 78 },
    { name: language === "ar" ? "الجوف" : "Al Jawf", poverty: 81, foodInsecurity: 77 },
    { name: language === "ar" ? "إب" : "Ibb", poverty: 78, foodInsecurity: 72 },
    { name: language === "ar" ? "صنعاء" : "Sana'a", poverty: 72, foodInsecurity: 65 },
    { name: language === "ar" ? "عدن" : "Aden", poverty: 65, foodInsecurity: 58 },
  ];

  // Humanitarian needs radar
  const humanitarianNeedsData = [
    { sector: language === "ar" ? "الغذاء" : "Food", need: 85, fullMark: 100 },
    { sector: language === "ar" ? "الصحة" : "Health", need: 78, fullMark: 100 },
    { sector: language === "ar" ? "المياه" : "WASH", need: 72, fullMark: 100 },
    { sector: language === "ar" ? "المأوى" : "Shelter", need: 65, fullMark: 100 },
    { sector: language === "ar" ? "التعليم" : "Education", need: 68, fullMark: 100 },
    { sector: language === "ar" ? "الحماية" : "Protection", need: 75, fullMark: 100 },
  ];

  // WASH indicators
  const washData = [
    { name: language === "ar" ? "مياه آمنة" : "Safe Water", value: 55, color: "#107040" },
    { name: language === "ar" ? "صرف صحي" : "Sanitation", value: 42, color: "#C0A030" },
    { name: language === "ar" ? "نظافة" : "Hygiene", value: 38, color: "#103050" },
  ];

  // Alerts
  const povertyAlerts = [
    {
      type: "error",
      titleEn: "21.6 million people need humanitarian assistance in 2024",
      titleAr: "21.6 مليون شخص بحاجة للمساعدات الإنسانية في 2024",
    },
    {
      type: "warning",
      titleEn: "Funding gap: Only 42% of humanitarian appeal funded",
      titleAr: "فجوة التمويل: 42% فقط من النداء الإنساني تم تمويله",
    },
    {
      type: "info",
      titleEn: "WFP reaches 13 million with food assistance monthly",
      titleAr: "برنامج الأغذية العالمي يصل 13 مليون شخص شهرياً",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <DevModeBanner />
      
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden bg-gradient-to-r from-[#103050] to-[#1a4a70]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container relative h-full flex items-center">
          <div className={`max-w-2xl ${language === 'ar' ? 'mr-auto text-right' : 'ml-0'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-[#107040] text-white border-0">
                {language === "ar" ? "التنمية البشرية" : "Human Development"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "الفقر والتنمية البشرية"
                : "Poverty & Human Development"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "تحليل شامل لمؤشرات الفقر، الأمن الغذائي، الصحة، التعليم، والاحتياجات الإنسانية في اليمن"
                : "Comprehensive analysis of poverty indicators, food security, health, education, and humanitarian needs in Yemen"}
            </p>
            <div className="flex flex-wrap gap-4">
              <ExportButton 
                data={povertyTrendData}
                filename="yemen_poverty_data"
                title={language === "ar" ? "تصدير البيانات" : "Export Data"}
                variant="default"
                size="lg"
              />
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2">
                <FileText className="h-5 w-5" />
                {language === "ar" ? "تقرير التنمية البشرية" : "Human Development Report"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "معدل الفقر" : "Poverty Rate"}</span>
                <DataQualityBadge quality="provisional" size="sm" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">77%</div>
              <div className="text-sm text-muted-foreground">{language === "ar" ? "من السكان" : "of population"}</div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <TrendingDown className="h-4 w-4" />
                <span>-1.3%</span>
                <span className="text-muted-foreground">{language === "ar" ? "سنوياً" : "YoY"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "انعدام الأمن الغذائي" : "Food Insecurity"}</span>
                <DataQualityBadge quality="verified" size="sm" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">21.6M</div>
              <div className="text-sm text-muted-foreground">{language === "ar" ? "شخص" : "people"}</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                <span>71% {language === "ar" ? "من السكان" : "of population"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#103050]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "مؤشر التنمية البشرية" : "HDI Score"}</span>
                <DataQualityBadge quality="verified" size="sm" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#103050]">0.448</div>
              <div className="text-sm text-muted-foreground">{language === "ar" ? "تنمية منخفضة" : "Low Development"}</div>
              <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                <TrendingDown className="h-4 w-4" />
                <span>{language === "ar" ? "المرتبة 183 عالمياً" : "Rank 183 globally"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#107040]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "المساعدات الإنسانية" : "Humanitarian Aid"}</span>
                <DataQualityBadge quality="verified" size="sm" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#107040]">$2.1B</div>
              <div className="text-sm text-muted-foreground">{language === "ar" ? "مطلوب 2024" : "Required 2024"}</div>
              <div className="flex items-center gap-1 text-sm text-amber-600 mt-2">
                <span>42% {language === "ar" ? "ممول" : "funded"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              {language === "ar" ? "تنبيهات إنسانية" : "Humanitarian Alerts"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {povertyAlerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.type === "error" 
                      ? "bg-red-50 border-red-500 dark:bg-red-900/20"
                      : alert.type === "warning"
                      ? "bg-amber-50 border-amber-500 dark:bg-amber-900/20"
                      : "bg-blue-50 border-blue-500 dark:bg-blue-900/20"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {language === "ar" ? alert.titleAr : alert.titleEn}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Export Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-[#107040]" />
              {language === "ar" ? "تصدير بيانات الفقر والتنمية" : "Export Poverty & Development Data"}
            </CardTitle>
            <CardDescription>
              {language === "ar" 
                ? "تحميل بيانات الفقر والتنمية بتنسيقات مختلفة للتحليل والتقارير"
                : "Download poverty and development data in various formats for analysis and reporting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SectorExportButtons
              sectorName="poverty"
              datasets={[
                {
                  title: language === "ar" ? "اتجاهات الفقر" : "Poverty Trends",
                  data: povertyTrendData,
                  filename: "yemen_poverty_trends"
                },
                {
                  title: language === "ar" ? "مؤشر التنمية البشرية" : "HDI Data",
                  data: hdiData,
                  filename: "yemen_hdi"
                },
                {
                  title: language === "ar" ? "الأمن الغذائي" : "Food Security",
                  data: foodSecurityData,
                  filename: "yemen_food_security"
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="poverty" className="mb-8">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="poverty">
              {language === "ar" ? "الفقر" : "Poverty"}
            </TabsTrigger>
            <TabsTrigger value="food">
              {language === "ar" ? "الأمن الغذائي" : "Food Security"}
            </TabsTrigger>
            <TabsTrigger value="health">
              {language === "ar" ? "الصحة" : "Health"}
            </TabsTrigger>
            <TabsTrigger value="education">
              {language === "ar" ? "التعليم" : "Education"}
            </TabsTrigger>
            <TabsTrigger value="humanitarian">
              {language === "ar" ? "الإنساني" : "Humanitarian"}
            </TabsTrigger>
          </TabsList>

          {/* Poverty Tab */}
          <TabsContent value="poverty" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {language === "ar" ? "اتجاهات الفقر (2014-2024)" : "Poverty Trends (2014-2024)"}
                      </CardTitle>
                      <CardDescription>
                        {language === "ar" ? "نسبة مئوية من السكان" : "Percentage of Population"}
                      </CardDescription>
                    </div>
                    <DataQualityBadge quality="provisional" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={povertyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="poverty" 
                        stroke="#EF4444" 
                        fill="#EF4444"
                        fillOpacity={0.3}
                        name={language === "ar" ? "الفقر العام" : "General Poverty"}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="extreme" 
                        stroke="#7F1D1D" 
                        fill="#7F1D1D"
                        fillOpacity={0.3}
                        name={language === "ar" ? "الفقر المدقع" : "Extreme Poverty"}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {language === "ar" ? "مؤشر التنمية البشرية" : "Human Development Index"}
                      </CardTitle>
                      <CardDescription>
                        {language === "ar" ? "المكونات الرئيسية" : "Key Components"}
                      </CardDescription>
                    </div>
                    <DataQualityBadge quality="verified" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={hdiData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="hdi" stroke="#103050" strokeWidth={3} name={language === "ar" ? "مؤشر التنمية" : "HDI"} />
                      <Line type="monotone" dataKey="health" stroke="#107040" strokeWidth={2} strokeDasharray="5 5" name={language === "ar" ? "الصحة" : "Health"} />
                      <Line type="monotone" dataKey="education" stroke="#C0A030" strokeWidth={2} strokeDasharray="5 5" name={language === "ar" ? "التعليم" : "Education"} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Governorate Poverty */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "الفقر حسب المحافظة" : "Poverty by Governorate"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={governoratePovertyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                    <Legend />
                    <Bar dataKey="poverty" fill="#EF4444" name={language === "ar" ? "معدل الفقر" : "Poverty Rate"} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="foodInsecurity" fill="#F59E0B" name={language === "ar" ? "انعدام الأمن الغذائي" : "Food Insecurity"} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Food Security Tab */}
          <TabsContent value="food" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "ar" ? "مراحل الأمن الغذائي (IPC)" : "Food Security Phases (IPC)"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={foodSecurityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ value }) => `${value}%`}>
                        {foodSecurityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{language === "ar" ? "تفاصيل مراحل الأمن الغذائي" : "Food Security Phase Details"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {foodSecurityData.map((phase, index) => (
                    <div key={index} className="p-3 rounded-lg" style={{ backgroundColor: `${phase.color}15` }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phase.color }} />
                          <span className="font-medium text-sm">{phase.name}</span>
                        </div>
                        <span className="font-bold">{phase.value}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Wheat className="h-8 w-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      {language === "ar" ? "تحذير: أزمة غذائية حادة" : "Warning: Acute Food Crisis"}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {language === "ar"
                        ? "يواجه 21.6 مليون يمني انعدام الأمن الغذائي. يعتمد اليمن على استيراد 90% من احتياجاته الغذائية."
                        : "21.6 million Yemenis face food insecurity. Yemen imports 90% of its food needs."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardDescription>{language === "ar" ? "وفيات الأطفال" : "Child Mortality"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">55</div>
                  <div className="text-sm text-muted-foreground">{language === "ar" ? "لكل 1000 مولود" : "per 1,000 births"}</div>
                </CardContent>
              </Card>
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardDescription>{language === "ar" ? "سوء التغذية الحاد" : "Acute Malnutrition"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">16.4%</div>
                  <div className="text-sm text-muted-foreground">{language === "ar" ? "من الأطفال" : "of children"}</div>
                </CardContent>
              </Card>
              <Card className="border-amber-200">
                <CardHeader className="pb-2">
                  <CardDescription>{language === "ar" ? "الوصول للرعاية الصحية" : "Healthcare Access"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">52%</div>
                  <div className="text-sm text-muted-foreground">{language === "ar" ? "من السكان" : "of population"}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Stethoscope className="h-8 w-8 text-amber-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      {language === "ar" ? "انهيار النظام الصحي" : "Health System Collapse"}
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {language === "ar"
                        ? "أكثر من نصف المرافق الصحية في اليمن متوقفة عن العمل. يعاني 20 مليون شخص من نقص الوصول للخدمات الصحية."
                        : "Over half of Yemen's health facilities are non-functional. 20 million people lack access to basic healthcare."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {language === "ar" ? "معدل الالتحاق بالمدارس" : "School Enrollment"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#103050]">73%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {language === "ar" ? "الأطفال خارج المدرسة" : "Out of School Children"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">2M</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <GraduationCap className="h-8 w-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      {language === "ar" ? "أزمة التعليم" : "Education Crisis"}
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {language === "ar"
                        ? "أكثر من 2 مليون طفل يمني خارج المدرسة. تضررت 2,500 مدرسة بسبب الصراع."
                        : "Over 2 million Yemeni children are out of school. 2,500 schools damaged by conflict."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Humanitarian Tab */}
          <TabsContent value="humanitarian" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "ar" ? "الاحتياجات الإنسانية حسب القطاع" : "Humanitarian Needs by Sector"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={humanitarianNeedsData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="sector" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name={language === "ar" ? "مستوى الاحتياج" : "Need Level"} dataKey="need" stroke="#EF4444" fill="#EF4444" fillOpacity={0.5} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{language === "ar" ? "مؤشرات المياه والصرف الصحي" : "WASH Indicators"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {washData.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4" style={{ color: item.color }} />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold">{item.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="h-3 rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "الاستجابة الإنسانية 2024" : "Humanitarian Response 2024"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-3xl font-bold text-[#103050]">$2.1B</div>
                    <div className="text-sm text-muted-foreground">{language === "ar" ? "المطلوب" : "Required"}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">$882M</div>
                    <div className="text-sm text-muted-foreground">{language === "ar" ? "الممول" : "Funded"}</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">$1.2B</div>
                    <div className="text-sm text-muted-foreground">{language === "ar" ? "الفجوة" : "Gap"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data Sources */}
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {language === "ar" ? "مصادر البيانات" : "Data Sources"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">OCHA</Badge>
              <Badge variant="outline">WFP</Badge>
              <Badge variant="outline">UNICEF</Badge>
              <Badge variant="outline">World Bank</Badge>
              <Badge variant="outline">UNDP</Badge>
              <Badge variant="outline">IPC</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
