import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Banknote, 
  Ship, 
  Smartphone,
  ArrowLeft,
  ExternalLink,
  Users,
  Globe,
  TrendingUp,
  AlertTriangle,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  Info,
  Download,
  Share2,
  Eye,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Link, useParams } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Entity data (same as Entities.tsx - in production would come from API)
const entitiesData: Record<string, any> = {
  "hsa-group": {
    id: "hsa-group",
    nameEn: "Hayel Saeed Anam Group (HSA)",
    nameAr: "مجموعة هائل سعيد أنعم",
    typeEn: "Commercial Conglomerate",
    typeAr: "تكتل تجاري",
    sectorEn: "Multi-sector",
    sectorAr: "متعدد القطاعات",
    foundedYear: 1938,
    headquarters: "Taiz / Aden",
    employeesEn: "15,000+",
    employeesAr: "15,000+",
    revenueEn: "$2.5B+ (est.)",
    revenueAr: "2.5+ مليار دولار (تقدير)",
    descriptionEn: "Yemen's largest private conglomerate with operations spanning food manufacturing, trading, banking, telecommunications, and real estate. Founded by Hayel Saeed Anam in Taiz, the group has grown to become a dominant economic force in Yemen and the region. The group maintains operations across both Houthi-controlled and government-controlled areas, navigating the complex political landscape through strategic partnerships and diversified holdings.",
    descriptionAr: "أكبر تكتل خاص في اليمن مع عمليات تشمل تصنيع الأغذية والتجارة والخدمات المصرفية والاتصالات والعقارات. أسسها هائل سعيد أنعم في تعز، ونمت المجموعة لتصبح قوة اقتصادية مهيمنة في اليمن والمنطقة. تحافظ المجموعة على عمليات في كل من المناطق الخاضعة للحوثيين والمناطق الخاضعة للحكومة.",
    subsidiaries: [
      { nameEn: "Yemen Kuwait Bank", nameAr: "بنك اليمن والكويت", sector: "Banking", established: 1979 },
      { nameEn: "HSA Trading", nameAr: "هائل سعيد للتجارة", sector: "Trading", established: 1960 },
      { nameEn: "Aujan Industries", nameAr: "صناعات أوجان", sector: "Manufacturing", established: 1985 },
      { nameEn: "National Food Industries", nameAr: "الصناعات الغذائية الوطنية", sector: "Food", established: 1972 },
      { nameEn: "HSA Real Estate", nameAr: "هائل سعيد العقارية", sector: "Real Estate", established: 1990 },
    ],
    keyIndicators: [
      { labelEn: "Market Share (Food)", labelAr: "حصة السوق (الغذاء)", value: "~40%", trend: "stable" },
      { labelEn: "Banking Assets", labelAr: "أصول مصرفية", value: "YER 850B", trend: "up" },
      { labelEn: "Import Volume", labelAr: "حجم الاستيراد", value: "$800M/yr", trend: "down" },
      { labelEn: "Employment", labelAr: "التوظيف", value: "15,000+", trend: "stable" },
      { labelEn: "Regional Presence", labelAr: "التواجد الإقليمي", value: "12 countries", trend: "up" },
    ],
    riskFactors: [
      { 
        en: "Sanctions exposure through banking operations", 
        ar: "التعرض للعقوبات من خلال العمليات المصرفية",
        severity: "high",
        details: "Yemen Kuwait Bank operations in Houthi-controlled areas may face sanctions scrutiny"
      },
      { 
        en: "Supply chain disruptions due to conflict", 
        ar: "اضطرابات سلسلة التوريد بسبب الصراع",
        severity: "medium",
        details: "Import operations affected by port blockades and security concerns"
      },
      { 
        en: "Currency exposure across dual monetary zones", 
        ar: "التعرض للعملة عبر المناطق النقدية المزدوجة",
        severity: "medium",
        details: "Operations in both Aden and Sana'a zones create FX management challenges"
      },
    ],
    timeline: [
      { year: 1938, eventEn: "Founded in Taiz by Hayel Saeed Anam", eventAr: "تأسست في تعز على يد هائل سعيد أنعم" },
      { year: 1960, eventEn: "Expanded into trading operations", eventAr: "توسعت في العمليات التجارية" },
      { year: 1979, eventEn: "Established Yemen Kuwait Bank", eventAr: "أسست بنك اليمن والكويت" },
      { year: 1985, eventEn: "Launched Aujan Industries", eventAr: "أطلقت صناعات أوجان" },
      { year: 2015, eventEn: "Operations disrupted by conflict onset", eventAr: "تعطلت العمليات ببداية الصراع" },
      { year: 2020, eventEn: "Restructured operations across dual zones", eventAr: "أعادت هيكلة العمليات عبر المنطقتين" },
    ],
    sources: [
      { titleEn: "Yemen Kuwait Bank Annual Report 2023", titleAr: "التقرير السنوي لبنك اليمن والكويت 2023", type: "primary", confidence: "high" },
      { titleEn: "Sana'a Center Economic Report", titleAr: "تقرير مركز صنعاء الاقتصادي", type: "secondary", confidence: "high" },
      { titleEn: "Trade Registry Records", titleAr: "سجلات السجل التجاري", type: "official", confidence: "high" },
    ],
    icon: Building2,
    color: "bg-blue-100 text-blue-700"
  },
  "cby-aden": {
    id: "cby-aden",
    nameEn: "Central Bank of Yemen (Aden)",
    nameAr: "البنك المركزي اليمني (عدن)",
    typeEn: "Central Bank",
    typeAr: "بنك مركزي",
    sectorEn: "Banking & Finance",
    sectorAr: "القطاع المصرفي والمالي",
    foundedYear: 1971,
    headquarters: "Aden",
    employeesEn: "2,000+",
    employeesAr: "2,000+",
    revenueEn: "N/A",
    revenueAr: "غير متاح",
    descriptionEn: "The internationally recognized central bank of Yemen, relocated to Aden in 2016 following the Houthi takeover of Sana'a. Responsible for monetary policy, currency issuance, and banking supervision in government-controlled areas. Faces significant challenges including depleted foreign reserves, currency depreciation, and maintaining banking system stability during ongoing conflict.",
    descriptionAr: "البنك المركزي المعترف به دولياً في اليمن، انتقل إلى عدن في 2016 بعد سيطرة الحوثيين على صنعاء. مسؤول عن السياسة النقدية وإصدار العملة والرقابة المصرفية في المناطق الخاضعة للحكومة. يواجه تحديات كبيرة بما في ذلك استنزاف الاحتياطيات الأجنبية وانخفاض قيمة العملة والحفاظ على استقرار النظام المصرفي.",
    subsidiaries: [],
    keyIndicators: [
      { labelEn: "Foreign Reserves", labelAr: "الاحتياطيات الأجنبية", value: "$1.2B", trend: "down" },
      { labelEn: "Exchange Rate", labelAr: "سعر الصرف", value: "2,070 YER/USD", trend: "down" },
      { labelEn: "Money Supply (M2)", labelAr: "عرض النقود (M2)", value: "YER 7.2T", trend: "up" },
      { labelEn: "Licensed Banks", labelAr: "البنوك المرخصة", value: "18", trend: "stable" },
    ],
    riskFactors: [
      { en: "Limited foreign reserves", ar: "احتياطيات أجنبية محدودة", severity: "high", details: "Reserves critically low, limiting intervention capacity" },
      { en: "Currency depreciation pressure", ar: "ضغوط انخفاض قيمة العملة", severity: "high", details: "Ongoing depreciation affecting import costs and inflation" },
      { en: "Dual monetary system challenges", ar: "تحديات النظام النقدي المزدوج", severity: "medium", details: "Coordination challenges with Sana'a-based CBY" },
    ],
    timeline: [
      { year: 1971, eventEn: "Established in Sana'a", eventAr: "تأسس في صنعاء" },
      { year: 2016, eventEn: "Relocated to Aden", eventAr: "انتقل إلى عدن" },
      { year: 2017, eventEn: "Received Saudi deposit ($2B)", eventAr: "تلقى وديعة سعودية (2 مليار دولار)" },
      { year: 2022, eventEn: "Currency crisis deepens", eventAr: "تعمق أزمة العملة" },
      { year: 2024, eventEn: "New monetary measures announced", eventAr: "إعلان إجراءات نقدية جديدة" },
    ],
    sources: [
      { titleEn: "CBY-Aden Official Statements", titleAr: "بيانات البنك المركزي الرسمية", type: "official", confidence: "high" },
      { titleEn: "IMF Article IV Consultation", titleAr: "مشاورات صندوق النقد الدولي", type: "primary", confidence: "high" },
      { titleEn: "World Bank Yemen Economic Monitor", titleAr: "مرصد البنك الدولي الاقتصادي", type: "secondary", confidence: "high" },
    ],
    icon: Banknote,
    color: "bg-green-100 text-green-700"
  },
};

export default function EntityDetail() {
  const { language } = useLanguage();
  const params = useParams();
  const entityId = params.id as string;
  
  const entity = entitiesData[entityId];

  if (!entity) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {language === "ar" ? "الكيان غير موجود" : "Entity Not Found"}
          </h2>
          <Link href="/entities">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === "ar" ? "العودة للكيانات" : "Back to Entities"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = entity.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-[#103050] text-white py-8">
        <div className="container">
          <Link href="/entities">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 mb-4">
              <ArrowLeft className={`h-4 w-4 mr-2 ${language === 'ar' ? 'rotate-180' : ''}`} />
              {language === "ar" ? "العودة للكيانات" : "Back to Entities"}
            </Button>
          </Link>
          
          <div className={`flex items-start gap-6 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
            <div className={`p-4 rounded-xl ${entity.color}`}>
              <IconComponent className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {language === "ar" ? entity.nameAr : entity.nameEn}
                </h1>
                <Badge className="bg-white/20 text-white border-white/30">
                  {language === "ar" ? entity.typeAr : entity.typeEn}
                </Badge>
              </div>
              <p className="text-white/80 mb-4">
                {language === "ar" ? entity.sectorAr : entity.sectorEn}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-white/60" />
                  <span>{entity.headquarters}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-white/60" />
                  <span>{language === "ar" ? `تأسس ${entity.foundedYear}` : `Founded ${entity.foundedYear}`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-white/60" />
                  <span>{language === "ar" ? entity.employeesAr : entity.employeesEn} {language === "ar" ? "موظف" : "employees"}</span>
                </div>
                {entity.revenueEn !== "N/A" && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-white/60" />
                    <span>{language === "ar" ? entity.revenueAr : entity.revenueEn}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1">
            <TabsTrigger value="overview">
              {language === "ar" ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="indicators">
              {language === "ar" ? "المؤشرات" : "Indicators"}
            </TabsTrigger>
            <TabsTrigger value="risks">
              {language === "ar" ? "المخاطر" : "Risks"}
            </TabsTrigger>
            <TabsTrigger value="timeline">
              {language === "ar" ? "الجدول الزمني" : "Timeline"}
            </TabsTrigger>
            <TabsTrigger value="sources">
              {language === "ar" ? "المصادر" : "Sources"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{language === "ar" ? "نبذة عن الكيان" : "About"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {language === "ar" ? entity.descriptionAr : entity.descriptionEn}
                    </p>
                  </CardContent>
                </Card>

                {entity.subsidiaries.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{language === "ar" ? "الشركات التابعة" : "Subsidiaries"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {entity.subsidiaries.map((sub: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <div className="font-medium">
                                {language === "ar" ? sub.nameAr : sub.nameEn}
                              </div>
                              <div className="text-sm text-gray-500">{sub.sector}</div>
                            </div>
                            <Badge variant="outline">{sub.established}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {/* Key Metrics Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>{language === "ar" ? "المؤشرات الرئيسية" : "Key Metrics"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {entity.keyIndicators.slice(0, 4).map((indicator: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? indicator.labelAr : indicator.labelEn}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{indicator.value}</span>
                          {indicator.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {indicator.trend === "down" && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Evidence Pack */}
                <Card className="bg-[#107040]/5 border-[#107040]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#107040]">
                      <Eye className="h-5 w-5" />
                      {language === "ar" ? "حزمة الأدلة" : "Evidence Pack"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {language === "ar"
                        ? "جميع البيانات في هذا الملف موثقة ومصدرها معروف. انقر لعرض المصادر الكاملة."
                        : "All data in this profile is documented and sourced. Click to view full provenance."}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{entity.sources.length} {language === "ar" ? "مصادر موثقة" : "verified sources"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{language === "ar" ? "آخر تحديث: ديسمبر 2024" : "Last updated: December 2024"}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full text-[#107040] border-[#107040]/30 hover:bg-[#107040]/10">
                      {language === "ar" ? "كيف نعرف هذا؟" : "How do we know this?"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Indicators Tab */}
          <TabsContent value="indicators">
            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "جميع المؤشرات" : "All Indicators"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entity.keyIndicators.map((indicator: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">
                        {language === "ar" ? indicator.labelAr : indicator.labelEn}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-[#103050] dark:text-white">
                          {indicator.value}
                        </span>
                        {indicator.trend === "up" && (
                          <Badge className="bg-green-100 text-green-700">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {language === "ar" ? "صاعد" : "Up"}
                          </Badge>
                        )}
                        {indicator.trend === "down" && (
                          <Badge className="bg-red-100 text-red-700">
                            <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                            {language === "ar" ? "هابط" : "Down"}
                          </Badge>
                        )}
                        {indicator.trend === "stable" && (
                          <Badge className="bg-gray-100 text-gray-700">
                            {language === "ar" ? "مستقر" : "Stable"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  {language === "ar" ? "عوامل المخاطر" : "Risk Factors"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {entity.riskFactors.map((risk: any, index: number) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-l-4 ${
                      risk.severity === "high" 
                        ? "bg-red-50 border-red-500 dark:bg-red-900/20" 
                        : "bg-amber-50 border-amber-500 dark:bg-amber-900/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        {language === "ar" ? risk.ar : risk.en}
                      </h4>
                      <Badge variant="outline" className={
                        risk.severity === "high" 
                          ? "bg-red-100 text-red-700 border-red-200" 
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }>
                        {risk.severity === "high" 
                          ? (language === "ar" ? "عالي" : "High") 
                          : (language === "ar" ? "متوسط" : "Medium")}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {risk.details}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "الجدول الزمني" : "Timeline"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-6">
                    {entity.timeline.map((event: any, index: number) => (
                      <div key={index} className="relative pl-10">
                        <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-[#107040] border-4 border-white dark:border-gray-900"></div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <Badge variant="outline" className="mb-2">{event.year}</Badge>
                          <p className="text-gray-700 dark:text-gray-300">
                            {language === "ar" ? event.eventAr : event.eventEn}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {language === "ar" ? "المصادر والمراجع" : "Sources & References"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {entity.sources.map((source: any, index: number) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {language === "ar" ? source.titleAr : source.titleEn}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {source.type}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              source.confidence === "high" 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {source.confidence === "high" 
                              ? (language === "ar" ? "ثقة عالية" : "High confidence") 
                              : (language === "ar" ? "ثقة متوسطة" : "Medium confidence")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
