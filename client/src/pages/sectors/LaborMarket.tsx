import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Briefcase,
  GraduationCap,
  Building2,
  AlertTriangle,
  FileText,
  Download,
  ExternalLink,
  DollarSign,
  Clock,
  UserX,
  Factory
} from "lucide-react";
import { Link } from "wouter";

export default function LaborMarket() {
  const { language } = useLanguage();

  const keyIndicators = [
    {
      titleEn: "Unemployment Rate",
      titleAr: "معدل البطالة",
      value: "~30%",
      change: "+8%",
      trend: "up",
      periodEn: "2024 Est.",
      periodAr: "تقديرات 2024",
      sourceEn: "World Bank / ILO estimates",
      sourceAr: "تقديرات البنك الدولي / منظمة العمل الدولية",
      confidence: "C"
    },
    {
      titleEn: "Youth Unemployment",
      titleAr: "بطالة الشباب",
      value: "~45%",
      change: "+12%",
      trend: "up",
      periodEn: "Ages 15-24",
      periodAr: "الأعمار 15-24",
      sourceEn: "ILO estimates",
      sourceAr: "تقديرات منظمة العمل الدولية",
      confidence: "C"
    },
    {
      titleEn: "Public Sector Salary Arrears",
      titleAr: "متأخرات رواتب القطاع العام",
      value: "6+ years",
      change: "",
      trend: "stable",
      periodEn: "Sana'a (since 2016)",
      periodAr: "صنعاء (منذ 2016)",
      sourceEn: "UN reports",
      sourceAr: "تقارير الأمم المتحدة",
      confidence: "B"
    },
    {
      titleEn: "Minimum Wage (Official)",
      titleAr: "الحد الأدنى للأجور (رسمي)",
      value: "21,000 YER",
      change: "",
      trend: "stable",
      periodEn: "Not enforced",
      periodAr: "غير مطبق",
      sourceEn: "Government decree",
      sourceAr: "مرسوم حكومي",
      confidence: "B"
    },
  ];

  const regimeComparison = [
    {
      indicatorEn: "Public Sector Salaries",
      indicatorAr: "رواتب القطاع العام",
      adenValue: "Paid (irregular)",
      adenValueAr: "تُدفع (بشكل غير منتظم)",
      sanaaValue: "Suspended since 2016",
      sanaaValueAr: "معلقة منذ 2016"
    },
    {
      indicatorEn: "Private Sector Activity",
      indicatorAr: "نشاط القطاع الخاص",
      adenValue: "Recovering slowly",
      adenValueAr: "يتعافى ببطء",
      sanaaValue: "Constrained",
      sanaaValueAr: "مقيد"
    },
    {
      indicatorEn: "Humanitarian Employment",
      indicatorAr: "التوظيف الإنساني",
      adenValue: "Significant",
      adenValueAr: "كبير",
      sanaaValue: "Major employer",
      sanaaValueAr: "جهة توظيف رئيسية"
    },
    {
      indicatorEn: "Informal Sector",
      indicatorAr: "القطاع غير الرسمي",
      adenValue: "Growing",
      adenValueAr: "متنامي",
      sanaaValue: "Dominant",
      sanaaValueAr: "مهيمن"
    },
  ];

  const sectorBreakdown = [
    { sectorEn: "Agriculture", sectorAr: "الزراعة", percentage: 25, color: "bg-green-500" },
    { sectorEn: "Services", sectorAr: "الخدمات", percentage: 35, color: "bg-blue-500" },
    { sectorEn: "Trade", sectorAr: "التجارة", percentage: 20, color: "bg-yellow-500" },
    { sectorEn: "Construction", sectorAr: "البناء", percentage: 10, color: "bg-orange-500" },
    { sectorEn: "Manufacturing", sectorAr: "التصنيع", percentage: 5, color: "bg-purple-500" },
    { sectorEn: "Other", sectorAr: "أخرى", percentage: 5, color: "bg-gray-500" },
  ];

  const challenges = [
    {
      titleEn: "Salary Suspension Crisis",
      titleAr: "أزمة تعليق الرواتب",
      descEn: "Over 1.2 million public sector employees in Sana'a-controlled areas have not received regular salaries since 2016, devastating household incomes.",
      descAr: "أكثر من 1.2 مليون موظف في القطاع العام في المناطق الخاضعة لسيطرة صنعاء لم يتلقوا رواتب منتظمة منذ 2016، مما دمر دخل الأسر."
    },
    {
      titleEn: "Brain Drain",
      titleAr: "هجرة الكفاءات",
      descEn: "Skilled professionals continue to emigrate, depleting human capital critical for post-conflict recovery.",
      descAr: "يستمر المهنيون المهرة في الهجرة، مما يستنزف رأس المال البشري الحيوي للتعافي بعد الصراع."
    },
    {
      titleEn: "Youth Exclusion",
      titleAr: "إقصاء الشباب",
      descEn: "Limited opportunities for young people entering the workforce, with education-employment mismatches.",
      descAr: "فرص محدودة للشباب الداخلين إلى سوق العمل، مع عدم توافق بين التعليم والتوظيف."
    },
    {
      titleEn: "Gender Gaps",
      titleAr: "الفجوات بين الجنسين",
      descEn: "Female labor force participation remains extremely low, with conflict further restricting women's economic opportunities.",
      descAr: "تظل مشاركة المرأة في القوى العاملة منخفضة للغاية، مع تقييد الصراع لفرصها الاقتصادية بشكل أكبر."
    },
  ];

  const relatedReports = [
    {
      titleEn: "Yemen Labor Market Assessment 2024",
      titleAr: "تقييم سوق العمل اليمني 2024",
      sourceEn: "ILO",
      sourceAr: "منظمة العمل الدولية",
      date: "2024"
    },
    {
      titleEn: "Public Sector Salary Crisis Impact Study",
      titleAr: "دراسة تأثير أزمة رواتب القطاع العام",
      sourceEn: "World Bank",
      sourceAr: "البنك الدولي",
      date: "2023"
    },
    {
      titleEn: "Youth Employment Challenges in Yemen",
      titleAr: "تحديات توظيف الشباب في اليمن",
      sourceEn: "UNDP",
      sourceAr: "برنامج الأمم المتحدة الإنمائي",
      date: "2023"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#103050] to-[#0B1F33] text-white">
        <div className="container py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Briefcase className="h-6 w-6" />
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {language === "ar" ? "قطاع" : "Sector"}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === "ar" 
              ? "سوق العمل والأجور"
              : "Labor Market & Wages"}
          </h1>
          <p className="text-lg text-white/80 max-w-3xl">
            {language === "ar"
              ? "تحليل ديناميكيات التوظيف والبطالة والأجور وتأثير الصراع على القوى العاملة اليمنية"
              : "Analysis of employment dynamics, unemployment, wages, and the conflict's impact on Yemen's workforce"}
          </p>
        </div>
      </section>

      <div className="container py-8">
        {/* Key Indicators */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyIndicators.map((indicator, index) => (
            <Card key={index} className="border-l-4 border-l-[#103050]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {language === "ar" ? indicator.titleAr : indicator.titleEn}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {indicator.confidence}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{indicator.value}</span>
                  {indicator.change && (
                    <span className={`text-sm flex items-center ${
                      indicator.trend === "up" ? "text-red-600" : 
                      indicator.trend === "down" ? "text-green-600" : "text-gray-600"
                    }`}>
                      {indicator.trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                       indicator.trend === "down" ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                      {indicator.change}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "ar" ? indicator.periodAr : indicator.periodEn}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "ar" ? indicator.sourceAr : indicator.sourceEn}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              {language === "ar" ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="regime">
              {language === "ar" ? "مقارنة الأنظمة" : "Regime Comparison"}
            </TabsTrigger>
            <TabsTrigger value="sectors">
              {language === "ar" ? "القطاعات" : "Sectors"}
            </TabsTrigger>
            <TabsTrigger value="challenges">
              {language === "ar" ? "التحديات" : "Challenges"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#103050]" />
                    {language === "ar" ? "حالة سوق العمل" : "Labor Market Status"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "يعاني سوق العمل اليمني من أزمة حادة نتيجة الصراع المستمر. تشير التقديرات إلى أن معدل البطالة يتجاوز 30%، مع ارتفاع معدلات بطالة الشباب إلى مستويات مقلقة. القطاع غير الرسمي يستوعب الجزء الأكبر من القوى العاملة."
                      : "Yemen's labor market suffers from a severe crisis due to the ongoing conflict. Estimates suggest unemployment exceeds 30%, with youth unemployment reaching alarming levels. The informal sector absorbs the majority of the workforce."}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <UserX className="h-8 w-8 mx-auto mb-2 text-red-600" />
                      <div className="text-2xl font-bold">~7M</div>
                      <div className="text-xs text-muted-foreground">
                        {language === "ar" ? "عاطلون عن العمل" : "Unemployed"}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <div className="text-2xl font-bold">1.2M+</div>
                      <div className="text-xs text-muted-foreground">
                        {language === "ar" ? "بدون رواتب" : "Without Salaries"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#107040]" />
                    {language === "ar" ? "الأجور والدخل" : "Wages & Income"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "تآكلت القوة الشرائية للأجور بشكل كبير بسبب التضخم وانهيار العملة. الحد الأدنى للأجور الرسمي (21,000 ريال) لا يغطي احتياجات المعيشة الأساسية."
                      : "Wage purchasing power has eroded significantly due to inflation and currency collapse. The official minimum wage (21,000 YER) does not cover basic living needs."}
                  </p>
                  <div className="space-y-3 pt-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <span className="text-sm">{language === "ar" ? "الحد الأدنى للأجور" : "Minimum Wage"}</span>
                      <span className="font-semibold">21,000 YER</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <span className="text-sm">{language === "ar" ? "متوسط راتب القطاع العام" : "Avg. Public Sector Salary"}</span>
                      <span className="font-semibold">~80,000 YER</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <span className="text-sm">{language === "ar" ? "تكلفة سلة الغذاء الشهرية" : "Monthly Food Basket Cost"}</span>
                      <span className="font-semibold">~120,000 YER</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="regime">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {language === "ar" ? "مقارنة بين الأنظمة" : "Regime Comparison"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "الفروقات في سوق العمل بين مناطق الشرعية ومناطق الأمر الواقع"
                    : "Labor market differences between IRG and DFA controlled areas"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "المؤشر" : "Indicator"}
                        </th>
                        <th className="text-center p-3 font-medium bg-blue-50 dark:bg-blue-950/20">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            {language === "ar" ? "عدن (الشرعية)" : "Aden (IRG)"}
                          </Badge>
                        </th>
                        <th className="text-center p-3 font-medium bg-amber-50 dark:bg-amber-950/20">
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                            {language === "ar" ? "صنعاء (الأمر الواقع)" : "Sana'a (DFA)"}
                          </Badge>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {regimeComparison.map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3 font-medium">
                            {language === "ar" ? row.indicatorAr : row.indicatorEn}
                          </td>
                          <td className="text-center p-3 bg-blue-50/50 dark:bg-blue-950/10">
                            {language === "ar" ? row.adenValueAr : row.adenValue}
                          </td>
                          <td className="text-center p-3 bg-amber-50/50 dark:bg-amber-950/10">
                            {language === "ar" ? row.sanaaValueAr : row.sanaaValue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sectors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  {language === "ar" ? "توزيع القوى العاملة حسب القطاع" : "Workforce Distribution by Sector"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sectorBreakdown.map((sector, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {language === "ar" ? sector.sectorAr : sector.sectorEn}
                        </span>
                        <span className="text-sm text-muted-foreground">{sector.percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${sector.color}`}
                          style={{ width: `${sector.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  {language === "ar" 
                    ? "المصدر: تقديرات منظمة العمل الدولية / البنك الدولي (2023)"
                    : "Source: ILO / World Bank estimates (2023)"}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges">
            <div className="grid md:grid-cols-2 gap-6">
              {challenges.map((challenge, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      {language === "ar" ? challenge.titleAr : challenge.titleEn}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {language === "ar" ? challenge.descAr : challenge.descEn}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Reports */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {language === "ar" ? "التقارير ذات الصلة" : "Related Reports"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedReports.map((report, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <h4 className="font-medium mb-2">
                    {language === "ar" ? report.titleAr : report.titleEn}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {language === "ar" ? report.sourceAr : report.sourceEn} • {report.date}
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-3 w-3" />
                    {language === "ar" ? "عرض" : "View"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-8">
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            {language === "ar" ? "تحميل البيانات" : "Download Data"}
          </Button>
          <Link href="/data-repository">
            <Button variant="outline" className="gap-2">
              {language === "ar" ? "استكشاف المزيد من البيانات" : "Explore More Data"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
