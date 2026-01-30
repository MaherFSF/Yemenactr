import { useLanguage } from "@/contexts/LanguageContext";
import { SourcesUsedPanel } from "@/components/SourcesUsedPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building,
  Zap,
  Droplets,
  Wifi,
  Route,
  Ship,
  Plane,
  AlertTriangle,
  FileText,
  Download,
  ExternalLink,
  TrendingDown,
  Hospital,
  GraduationCap
} from "lucide-react";
import { Link } from "wouter";

export default function Infrastructure() {
  const { language } = useLanguage();

  // January 2026 Data - World Bank PPI, UNDP, HRW
  const keyIndicators = [
    {
      titleEn: "Total PPI Investment",
      titleAr: "إجمالي الاستثمار الخاص",
      value: "$677M",
      descEn: "1990-2024 total",
      descAr: "الإجمالي 1990-2024",
      icon: Building,
      trend: "neutral"
    },
    {
      titleEn: "Electricity Access",
      titleAr: "الوصول للكهرباء",
      value: "<50%",
      descEn: "Few hours/day in Aden",
      descAr: "ساعات قليلة/يوم في عدن",
      icon: Zap,
      trend: "critical"
    },
    {
      titleEn: "Water Price Increase",
      titleAr: "ارتفاع أسعار المياه",
      value: "+133%",
      descEn: "Sana'a trucked water (Aug 2023)",
      descAr: "مياه الصهاريج صنعاء (أغسطس 2023)",
      icon: Droplets,
      trend: "critical"
    },
    {
      titleEn: "Solar Facilities",
      titleAr: "المرافق الشمسية",
      value: "164+",
      descEn: "Public facilities with solar (UNDP)",
      descAr: "مرافق عامة بالطاقة الشمسية (UNDP)",
      icon: Zap,
      trend: "positive"
    },
  ];

  // January 2026 Alerts
  const alerts = [
    {
      titleEn: "Summer 2023: Widespread protests in Aden over electricity and water cuts",
      titleAr: "صيف 2023: احتجاجات واسعة في عدن بسبب انقطاع الكهرباء والمياه",
      severity: "high",
      date: "Aug 2023"
    },
    {
      titleEn: "HRW Report: 'Widespread corruption' in Electricity Ministry",
      titleAr: "تقرير هيومن رايتس: 'فساد واسع' في وزارة الكهرباء",
      severity: "high",
      date: "Nov 2023"
    },
    {
      titleEn: "UNDP: 164+ public facilities now have solar power, benefiting 199,745 people",
      titleAr: "UNDP: 164+ مرفق عام لديه طاقة شمسية، يستفيد منها 199,745 شخص",
      severity: "positive",
      date: "Jan 2025"
    },
    {
      titleEn: "Solar systems projected to reduce 560 tonnes of CO2 emissions annually",
      titleAr: "الأنظمة الشمسية ستقلل 560 طن من انبعاثات CO2 سنوياً",
      severity: "positive",
      date: "Jan 2026"
    },
  ];

  const sectorStatus = [
    {
      sectorEn: "Electricity Grid",
      sectorAr: "شبكة الكهرباء",
      statusEn: "Severely Damaged",
      statusAr: "متضررة بشدة",
      coverageEn: "<50% of pre-war",
      coverageAr: "<50% من ما قبل الحرب",
      icon: Zap,
      color: "text-red-600"
    },
    {
      sectorEn: "Water & Sanitation",
      sectorAr: "المياه والصرف الصحي",
      statusEn: "Critical",
      statusAr: "حرجة",
      coverageEn: "~55% access",
      coverageAr: "~55% وصول",
      icon: Droplets,
      color: "text-orange-600"
    },
    {
      sectorEn: "Healthcare Facilities",
      sectorAr: "المرافق الصحية",
      statusEn: "Partially Functional",
      statusAr: "تعمل جزئياً",
      coverageEn: "~50% operational",
      coverageAr: "~50% عاملة",
      icon: Hospital,
      color: "text-orange-600"
    },
    {
      sectorEn: "Education Facilities",
      sectorAr: "المرافق التعليمية",
      statusEn: "Disrupted",
      statusAr: "متعطلة",
      coverageEn: "2M+ children out",
      coverageAr: "2+ مليون طفل خارج",
      icon: GraduationCap,
      color: "text-yellow-600"
    },
    {
      sectorEn: "Telecommunications",
      sectorAr: "الاتصالات",
      statusEn: "Operational",
      statusAr: "تعمل",
      coverageEn: "~70% mobile coverage",
      coverageAr: "~70% تغطية الجوال",
      icon: Wifi,
      color: "text-green-600"
    },
    {
      sectorEn: "Ports & Shipping",
      sectorAr: "الموانئ والشحن",
      statusEn: "Restricted",
      statusAr: "مقيدة",
      coverageEn: "Inspection delays",
      coverageAr: "تأخيرات التفتيش",
      icon: Ship,
      color: "text-yellow-600"
    },
  ];

  const transportInfra = [
    {
      typeEn: "Aden Port",
      typeAr: "ميناء عدن",
      statusEn: "Operational",
      statusAr: "يعمل",
      notesEn: "Main IRG port, handling majority of imports",
      notesAr: "الميناء الرئيسي للشرعية، يتعامل مع غالبية الواردات"
    },
    {
      typeEn: "Hodeidah Port",
      typeAr: "ميناء الحديدة",
      statusEn: "Restricted",
      statusAr: "مقيد",
      notesEn: "UN-monitored, critical for north",
      notesAr: "تحت مراقبة الأمم المتحدة، حيوي للشمال"
    },
    {
      typeEn: "Sana'a Airport",
      typeAr: "مطار صنعاء",
      statusEn: "Limited",
      statusAr: "محدود",
      notesEn: "Commercial flights resumed 2022",
      notesAr: "استؤنفت الرحلات التجارية 2022"
    },
    {
      typeEn: "Aden Airport",
      typeAr: "مطار عدن",
      statusEn: "Operational",
      statusAr: "يعمل",
      notesEn: "Main international gateway",
      notesAr: "البوابة الدولية الرئيسية"
    },
    {
      typeEn: "Road Network",
      typeAr: "شبكة الطرق",
      statusEn: "Degraded",
      statusAr: "متدهورة",
      notesEn: "Many routes damaged or blocked",
      notesAr: "العديد من الطرق متضررة أو مغلقة"
    },
  ];

  const reconstructionNeeds = [
    {
      sectorEn: "Housing",
      sectorAr: "الإسكان",
      estimateEn: "$8.5B",
      priorityEn: "High",
      priorityAr: "عالية"
    },
    {
      sectorEn: "Energy",
      sectorAr: "الطاقة",
      estimateEn: "$3.2B",
      priorityEn: "Critical",
      priorityAr: "حرجة"
    },
    {
      sectorEn: "Water & Sanitation",
      sectorAr: "المياه والصرف الصحي",
      estimateEn: "$2.8B",
      priorityEn: "Critical",
      priorityAr: "حرجة"
    },
    {
      sectorEn: "Health",
      sectorAr: "الصحة",
      estimateEn: "$1.9B",
      priorityEn: "High",
      priorityAr: "عالية"
    },
    {
      sectorEn: "Education",
      sectorAr: "التعليم",
      estimateEn: "$1.5B",
      priorityEn: "High",
      priorityAr: "عالية"
    },
    {
      sectorEn: "Transport",
      sectorAr: "النقل",
      estimateEn: "$2.1B",
      priorityEn: "Medium",
      priorityAr: "متوسطة"
    },
  ];

  const relatedReports = [
    {
      titleEn: "Yemen Damage and Needs Assessment",
      titleAr: "تقييم الأضرار والاحتياجات في اليمن",
      sourceEn: "World Bank / UN / EU / IsDB",
      sourceAr: "البنك الدولي / الأمم المتحدة / الاتحاد الأوروبي / البنك الإسلامي",
      date: "2024"
    },
    {
      titleEn: "Infrastructure Recovery Framework",
      titleAr: "إطار استعادة البنية التحتية",
      sourceEn: "UNDP",
      sourceAr: "برنامج الأمم المتحدة الإنمائي",
      date: "2023"
    },
    {
      titleEn: "Energy Sector Assessment",
      titleAr: "تقييم قطاع الطاقة",
      sourceEn: "World Bank",
      sourceAr: "البنك الدولي",
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
              <Building className="h-6 w-6" />
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {language === "ar" ? "قطاع" : "Sector"}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === "ar" 
              ? "البنية التحتية والخدمات"
              : "Infrastructure & Services"}
          </h1>
          <p className="text-lg text-white/80 max-w-3xl">
            {language === "ar"
              ? "تقييم حالة البنية التحتية الحيوية والخدمات الأساسية واحتياجات إعادة الإعمار"
              : "Assessment of critical infrastructure status, essential services, and reconstruction needs"}
          </p>
        </div>
      </section>

      <div className="container py-8">
        {/* Key Indicators */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyIndicators.map((indicator, index) => (
            <Card key={index} className={`border-l-4 ${
              indicator.trend === "critical" ? "border-l-red-500" :
              indicator.trend === "warning" ? "border-l-yellow-500" : "border-l-green-500"
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    indicator.trend === "critical" ? "bg-red-100 text-red-600" :
                    indicator.trend === "warning" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"
                  }`}>
                    <indicator.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? indicator.titleAr : indicator.titleEn}
                    </p>
                    <p className="text-2xl font-bold">{indicator.value}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? indicator.descAr : indicator.descEn}
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
            <TabsTrigger value="sectors">
              {language === "ar" ? "حالة القطاعات" : "Sector Status"}
            </TabsTrigger>
            <TabsTrigger value="transport">
              {language === "ar" ? "النقل" : "Transport"}
            </TabsTrigger>
            <TabsTrigger value="reconstruction">
              {language === "ar" ? "إعادة الإعمار" : "Reconstruction"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    {language === "ar" ? "حجم الأضرار" : "Damage Scale"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "تشير التقييمات إلى أن أضرار البنية التحتية في اليمن تتجاوز 20 مليار دولار. تأثرت جميع القطاعات الحيوية بشكل كبير، مع تدمير أو تضرر آلاف المرافق الصحية والتعليمية والمنازل."
                      : "Assessments indicate infrastructure damage in Yemen exceeds $20 billion. All critical sectors have been significantly affected, with thousands of health facilities, schools, and homes destroyed or damaged."}
                  </p>
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">
                        {language === "ar" ? "تحذير" : "Warning"}
                      </span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {language === "ar"
                        ? "البنية التحتية المتدهورة تؤثر مباشرة على الوضع الإنساني وقدرة السكان على الوصول للخدمات الأساسية."
                        : "Degraded infrastructure directly impacts the humanitarian situation and population's access to basic services."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    {language === "ar" ? "أزمة الكهرباء" : "Electricity Crisis"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "انهارت شبكة الكهرباء الوطنية بشكل شبه كامل. يعتمد معظم السكان على مولدات خاصة أو الطاقة الشمسية. تكلفة الكهرباء مرتفعة جداً مقارنة بالدخل."
                      : "The national electricity grid has almost completely collapsed. Most residents rely on private generators or solar power. Electricity costs are extremely high relative to income."}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="text-xl font-bold text-yellow-600">&lt;50%</div>
                      <div className="text-xs text-muted-foreground">
                        {language === "ar" ? "وصول للشبكة" : "Grid Access"}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="text-xl font-bold text-green-600">Growing</div>
                      <div className="text-xs text-muted-foreground">
                        {language === "ar" ? "الطاقة الشمسية" : "Solar Adoption"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sectors">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "حالة قطاعات البنية التحتية" : "Infrastructure Sector Status"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectorStatus.map((sector, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
                          <sector.icon className={`h-5 w-5 ${sector.color}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {language === "ar" ? sector.sectorAr : sector.sectorEn}
                          </h4>
                          <Badge variant="outline" className={`text-xs ${
                            sector.color === "text-red-600" ? "border-red-200 text-red-600" :
                            sector.color === "text-orange-600" ? "border-orange-200 text-orange-600" :
                            sector.color === "text-yellow-600" ? "border-yellow-200 text-yellow-600" :
                            "border-green-200 text-green-600"
                          }`}>
                            {language === "ar" ? sector.statusAr : sector.statusEn}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? sector.coverageAr : sector.coverageEn}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transport">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  {language === "ar" ? "البنية التحتية للنقل" : "Transport Infrastructure"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "المرفق" : "Facility"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "الحالة" : "Status"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "ملاحظات" : "Notes"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transportInfra.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3 font-medium">
                            {language === "ar" ? item.typeAr : item.typeEn}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className={`${
                              item.statusEn === "Operational" ? "bg-green-100 text-green-700 border-green-200" :
                              item.statusEn === "Limited" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                              item.statusEn === "Restricted" ? "bg-orange-100 text-orange-700 border-orange-200" :
                              "bg-red-100 text-red-700 border-red-200"
                            }`}>
                              {language === "ar" ? item.statusAr : item.statusEn}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground text-sm">
                            {language === "ar" ? item.notesAr : item.notesEn}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reconstruction">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "احتياجات إعادة الإعمار المقدرة" : "Estimated Reconstruction Needs"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "تقديرات البنك الدولي والأمم المتحدة"
                    : "World Bank and UN estimates"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "القطاع" : "Sector"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "التكلفة المقدرة" : "Estimated Cost"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "الأولوية" : "Priority"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconstructionNeeds.map((need, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3 font-medium">
                            {language === "ar" ? need.sectorAr : need.sectorEn}
                          </td>
                          <td className="p-3 font-semibold text-[#103050]">
                            {need.estimateEn}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className={`${
                              need.priorityEn === "Critical" ? "bg-red-100 text-red-700 border-red-200" :
                              need.priorityEn === "High" ? "bg-orange-100 text-orange-700 border-orange-200" :
                              "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }`}>
                              {language === "ar" ? need.priorityAr : need.priorityEn}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {language === "ar"
                      ? "إجمالي احتياجات إعادة الإعمار المقدرة: أكثر من 20 مليار دولار. هذه التقديرات تتطلب تحديثاً مستمراً مع استمرار الصراع."
                      : "Total estimated reconstruction needs: over $20 billion. These estimates require continuous updating as the conflict continues."}
                  </p>
                </div>
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
          <Link href="/data-repository">
            <Button variant="outline" className="gap-2">
              {language === "ar" ? "استكشاف المزيد من البيانات" : "Explore More Data"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Sources Used Panel */}
      <SourcesUsedPanel sectorCode="infrastructure" />
    </div>
  );
}
