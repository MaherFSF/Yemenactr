import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wheat,
  Droplets,
  TrendingDown,
  TrendingUp,
  Sun,
  Fish,
  TreePine,
  AlertTriangle,
  FileText,
  Download,
  ExternalLink,
  Users,
  MapPin
} from "lucide-react";
import { Link } from "wouter";

export default function Agriculture() {
  const { language } = useLanguage();

  // January 2026 Data - FAO, World Bank, ACAPS
  const keyIndicators = [
    {
      titleEn: "Agricultural GDP Share",
      titleAr: "حصة الزراعة من الناتج المحلي",
      value: "~15%",
      change: "-5%",
      trend: "down",
      periodEn: "2025 Est. (FAO)",
      periodAr: "تقديرات 2025 (FAO)",
      sourceEn: "FAO 2025",
      sourceAr: "الفاو 2025",
      confidence: "B"
    },
    {
      titleEn: "Agricultural Employment",
      titleAr: "التوظيف الزراعي",
      value: ">50%",
      change: "+5%",
      trend: "up",
      periodEn: "Of workforce (FAO)",
      periodAr: "من القوى العاملة (FAO)",
      sourceEn: "FAO 2025",
      sourceAr: "الفاو 2025",
      confidence: "B"
    },
    {
      titleEn: "Domestic Food Supply",
      titleAr: "الإنتاج المحلي للغذاء",
      value: "15-20%",
      change: "-10%",
      trend: "down",
      periodEn: "Of staple food needs",
      periodAr: "من احتياجات الغذاء الأساسية",
      sourceEn: "World Bank May 2023",
      sourceAr: "البنك الدولي مايو 2023",
      confidence: "A"
    },
    {
      titleEn: "Food Imports (July 2025)",
      titleAr: "واردات الغذاء (يوليو 2025)",
      value: "268K MT",
      change: "-33%",
      trend: "down",
      periodEn: "vs July 2024",
      periodAr: "مقارنة بيوليو 2024",
      sourceEn: "ACAPS Aug 2025",
      sourceAr: "ACAPS أغسطس 2025",
      confidence: "A"
    },
  ];

  // January 2026 Alerts
  const alerts = [
    {
      titleEn: "18.1M people (52%) face acute food insecurity (Sep 2025 - Feb 2026)",
      titleAr: "18.1 مليون شخص (52%) يواجهون انعدام أمن غذائي حاد (سبتمبر 2025 - فبراير 2026)",
      severity: "critical",
      date: "Aug 2025"
    },
    {
      titleEn: "67% of households had inadequate food consumption (June 2025)",
      titleAr: "67% من الأسر لديها استهلاك غذائي غير كافٍ (يونيو 2025)",
      severity: "critical",
      date: "Jun 2025"
    },
    {
      titleEn: "Food imports down 33% in July 2025 vs July 2024",
      titleAr: "انخفضت واردات الغذاء 33% في يوليو 2025 مقارنة بيوليو 2024",
      severity: "high",
      date: "Aug 2025"
    },
    {
      titleEn: "Rainfed agriculture covers ~50% of cultivated land - vulnerable to climate",
      titleAr: "الزراعة المطرية تغطي ~50% من الأراضي المزروعة - عرضة للمناخ",
      severity: "medium",
      date: "Jan 2026"
    },
  ];

  const cropProduction = [
    {
      cropEn: "Qat",
      cropAr: "القات",
      shareEn: "~40%",
      trendEn: "Stable",
      trendAr: "مستقر",
      notesEn: "Dominates water use",
      notesAr: "يهيمن على استخدام المياه"
    },
    {
      cropEn: "Cereals (Sorghum, Millet)",
      cropAr: "الحبوب (الذرة الرفيعة، الدخن)",
      shareEn: "~25%",
      trendEn: "Declining",
      trendAr: "متراجع",
      notesEn: "Conflict-affected",
      notesAr: "متأثر بالصراع"
    },
    {
      cropEn: "Fruits & Vegetables",
      cropAr: "الفواكه والخضروات",
      shareEn: "~20%",
      trendEn: "Declining",
      trendAr: "متراجع",
      notesEn: "Market disruptions",
      notesAr: "اضطرابات السوق"
    },
    {
      cropEn: "Coffee",
      cropAr: "البن",
      shareEn: "~5%",
      trendEn: "Recovering",
      trendAr: "يتعافى",
      notesEn: "Export potential",
      notesAr: "إمكانية تصدير"
    },
    {
      cropEn: "Livestock",
      cropAr: "الثروة الحيوانية",
      shareEn: "~10%",
      trendEn: "Declining",
      trendAr: "متراجع",
      notesEn: "Feed shortages",
      notesAr: "نقص الأعلاف"
    },
  ];

  const challenges = [
    {
      titleEn: "Water Scarcity",
      titleAr: "شح المياه",
      descEn: "Yemen is one of the most water-scarce countries globally. Groundwater depletion is critical, with aquifers being depleted faster than recharge rates.",
      descAr: "اليمن من أكثر البلدان شحاً بالمياه عالمياً. استنزاف المياه الجوفية حرج، مع استنزاف طبقات المياه الجوفية أسرع من معدلات التجدد.",
      icon: Droplets
    },
    {
      titleEn: "Qat Dominance",
      titleAr: "هيمنة القات",
      descEn: "Qat cultivation consumes approximately 40% of irrigation water while providing limited nutritional value, crowding out food crops.",
      descAr: "تستهلك زراعة القات حوالي 40% من مياه الري مع توفير قيمة غذائية محدودة، مما يزاحم المحاصيل الغذائية.",
      icon: TreePine
    },
    {
      titleEn: "Conflict Disruption",
      titleAr: "اضطرابات الصراع",
      descEn: "Agricultural infrastructure damaged, supply chains disrupted, and farmers displaced. Input costs have risen dramatically.",
      descAr: "تضررت البنية التحتية الزراعية، وتعطلت سلاسل الإمداد، ونزح المزارعون. ارتفعت تكاليف المدخلات بشكل كبير.",
      icon: AlertTriangle
    },
    {
      titleEn: "Climate Vulnerability",
      titleAr: "الهشاشة المناخية",
      descEn: "Increasing droughts, erratic rainfall, and extreme weather events threaten already fragile agricultural systems.",
      descAr: "تهدد موجات الجفاف المتزايدة والأمطار غير المنتظمة والظواهر الجوية المتطرفة الأنظمة الزراعية الهشة بالفعل.",
      icon: Sun
    },
  ];

  const regionalProduction = [
    {
      regionEn: "Tihama (Coastal)",
      regionAr: "تهامة (الساحلية)",
      cropsEn: "Fruits, vegetables, cotton",
      cropsAr: "فواكه، خضروات، قطن",
      statusEn: "Partially active",
      statusAr: "نشطة جزئياً"
    },
    {
      regionEn: "Highlands",
      regionAr: "المرتفعات",
      cropsEn: "Qat, coffee, grains",
      cropsAr: "قات، بن، حبوب",
      statusEn: "Active",
      statusAr: "نشطة"
    },
    {
      regionEn: "Eastern Plateau",
      regionAr: "الهضبة الشرقية",
      cropsEn: "Livestock, dates",
      cropsAr: "ثروة حيوانية، تمور",
      statusEn: "Limited",
      statusAr: "محدودة"
    },
    {
      regionEn: "Southern Coast",
      regionAr: "الساحل الجنوبي",
      cropsEn: "Fishing, dates",
      cropsAr: "صيد، تمور",
      statusEn: "Recovering",
      statusAr: "يتعافى"
    },
  ];

  const fisheriesSector = {
    titleEn: "Fisheries Sector",
    titleAr: "قطاع الثروة السمكية",
    indicators: [
      {
        labelEn: "Coastline",
        labelAr: "الخط الساحلي",
        value: "2,500 km"
      },
      {
        labelEn: "Pre-war catch",
        labelAr: "الصيد قبل الحرب",
        value: "~250,000 MT/year"
      },
      {
        labelEn: "Current catch",
        labelAr: "الصيد الحالي",
        value: "~150,000 MT/year"
      },
      {
        labelEn: "Employment",
        labelAr: "التوظيف",
        value: "~500,000 people"
      },
    ]
  };

  const relatedReports = [
    {
      titleEn: "Yemen Agricultural Sector Assessment",
      titleAr: "تقييم القطاع الزراعي اليمني",
      sourceEn: "FAO",
      sourceAr: "منظمة الأغذية والزراعة",
      date: "2024"
    },
    {
      titleEn: "Water Scarcity and Agriculture in Yemen",
      titleAr: "شح المياه والزراعة في اليمن",
      sourceEn: "World Bank",
      sourceAr: "البنك الدولي",
      date: "2023"
    },
    {
      titleEn: "Rural Livelihoods Assessment",
      titleAr: "تقييم سبل العيش الريفية",
      sourceEn: "IFAD",
      sourceAr: "الصندوق الدولي للتنمية الزراعية",
      date: "2023"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section with Background Image */}
      <section className="relative h-[350px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(/sectors/agriculture.jpg)` }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#103050]/90 to-[#1a4a70]/80" />
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container relative h-full flex items-center">
          <div className={`max-w-2xl ${language === 'ar' ? 'mr-auto text-right' : 'ml-0'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Wheat className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-[#107040] text-white border-0">
                {language === "ar" ? "قطاع" : "Sector"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "الزراعة والتنمية الريفية"
                : "Agriculture & Rural Development"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "تحليل الإنتاج الزراعي والأمن الغذائي وسبل العيش الريفية وتحديات المياه"
                : "Analysis of agricultural production, food security, rural livelihoods, and water challenges"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Key Indicators */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyIndicators.map((indicator, index) => (
            <Card key={index} className="border-l-4 border-l-[#107040]">
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
                      indicator.trend === "down" ? "text-red-600" : "text-gray-600"
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
            <TabsTrigger value="production">
              {language === "ar" ? "الإنتاج" : "Production"}
            </TabsTrigger>
            <TabsTrigger value="challenges">
              {language === "ar" ? "التحديات" : "Challenges"}
            </TabsTrigger>
            <TabsTrigger value="fisheries">
              {language === "ar" ? "الثروة السمكية" : "Fisheries"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wheat className="h-5 w-5 text-[#107040]" />
                    {language === "ar" ? "القطاع الزراعي" : "Agricultural Sector"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "يشكل القطاع الزراعي حوالي 20% من الناتج المحلي الإجمالي ويوظف ربع القوى العاملة. لكن اليمن يستورد حوالي 90% من احتياجاته الغذائية، مما يجعله شديد التعرض لصدمات الأسعار العالمية واضطرابات سلاسل الإمداد."
                      : "The agricultural sector accounts for about 20% of GDP and employs a quarter of the workforce. However, Yemen imports about 90% of its food needs, making it highly vulnerable to global price shocks and supply chain disruptions."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#103050]" />
                    {language === "ar" ? "التوزيع الإقليمي" : "Regional Distribution"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {regionalProduction.map((region, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div>
                          <span className="font-medium">
                            {language === "ar" ? region.regionAr : region.regionEn}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {language === "ar" ? region.cropsAr : region.cropsEn}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {language === "ar" ? region.statusAr : region.statusEn}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="production">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "توزيع الإنتاج الزراعي" : "Agricultural Production Distribution"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "المحصول" : "Crop"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "الحصة" : "Share"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "الاتجاه" : "Trend"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "ملاحظات" : "Notes"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cropProduction.map((crop, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3 font-medium">
                            {language === "ar" ? crop.cropAr : crop.cropEn}
                          </td>
                          <td className="p-3 font-semibold text-[#107040]">
                            {crop.shareEn}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className={`${
                              crop.trendEn === "Declining" ? "text-red-600 border-red-200" :
                              crop.trendEn === "Recovering" ? "text-green-600 border-green-200" :
                              "text-gray-600 border-gray-200"
                            }`}>
                              {language === "ar" ? crop.trendAr : crop.trendEn}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground text-sm">
                            {language === "ar" ? crop.notesAr : crop.notesEn}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges">
            <div className="grid md:grid-cols-2 gap-6">
              {challenges.map((challenge, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <challenge.icon className="h-5 w-5 text-[#C0A030]" />
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

          <TabsContent value="fisheries">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fish className="h-5 w-5 text-blue-600" />
                  {language === "ar" ? fisheriesSector.titleAr : fisheriesSector.titleEn}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {fisheriesSector.indicators.map((ind, index) => (
                    <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-[#103050]">{ind.value}</div>
                      <div className="text-sm text-muted-foreground">
                        {language === "ar" ? ind.labelAr : ind.labelEn}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  {language === "ar"
                    ? "يمتلك اليمن ساحلاً طويلاً على البحر الأحمر وخليج عدن، مما يوفر إمكانات كبيرة للثروة السمكية. لكن الصراع أثر سلباً على القطاع من خلال تدمير قوارب الصيد والبنية التحتية، وتقييد الوصول إلى مناطق الصيد."
                    : "Yemen has a long coastline on the Red Sea and Gulf of Aden, providing significant fisheries potential. However, the conflict has negatively impacted the sector through destruction of fishing boats and infrastructure, and restricted access to fishing grounds."}
                </p>
              </CardContent>
            </Card>
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
          <Link href="/sectors/food-security">
            <Button variant="outline" className="gap-2">
              {language === "ar" ? "عرض الأمن الغذائي" : "View Food Security"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
