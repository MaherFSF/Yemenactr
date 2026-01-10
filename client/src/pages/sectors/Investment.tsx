import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp,
  TrendingDown,
  Building2,
  Briefcase,
  DollarSign,
  BarChart3,
  AlertTriangle,
  FileText,
  Download,
  ExternalLink,
  Factory,
  Store,
  Truck,
  Globe
} from "lucide-react";
import { Link } from "wouter";

export default function Investment() {
  const { language } = useLanguage();

  // January 2026 Data - UNCTAD, World Bank, IFC
  const keyIndicators = [
    {
      titleEn: "FDI Inflows",
      titleAr: "تدفقات الاستثمار الأجنبي",
      value: "$-337M",
      change: "Negative",
      trend: "down",
      periodEn: "2023 (UNCTAD)",
      periodAr: "2023 (الأونكتاد)",
      sourceEn: "UNCTAD 2024",
      sourceAr: "الأونكتاد 2024",
      confidence: "A"
    },
    {
      titleEn: "Total PPI Investment",
      titleAr: "إجمالي الاستثمار الخاص",
      value: "$677M",
      change: "",
      trend: "stable",
      periodEn: "1990-2024 cumulative",
      periodAr: "تراكمي 1990-2024",
      sourceEn: "World Bank PPI",
      sourceAr: "البنك الدولي PPI",
      confidence: "A"
    },
    {
      titleEn: "PPI Projects",
      titleAr: "مشاريع الاستثمار الخاص",
      value: "8",
      change: "",
      trend: "stable",
      periodEn: "Total projects 1990-2024",
      periodAr: "إجمالي المشاريع 1990-2024",
      sourceEn: "World Bank PPI",
      sourceAr: "البنك الدولي PPI",
      confidence: "A"
    },
    {
      titleEn: "Ease of Doing Business",
      titleAr: "سهولة ممارسة الأعمال",
      value: "187/190",
      change: "",
      trend: "stable",
      periodEn: "Global ranking (2020)",
      periodAr: "الترتيب العالمي (2020)",
      sourceEn: "World Bank",
      sourceAr: "البنك الدولي",
      confidence: "B"
    },
  ];

  // January 2026 Alerts
  const alerts = [
    {
      titleEn: "FDI flows negative (-$337M in 2023) - capital flight continues",
      titleAr: "تدفقات الاستثمار الأجنبي سلبية (-337 مليون دولار في 2023) - هروب رأس المال مستمر",
      severity: "critical",
      date: "2023"
    },
    {
      titleEn: "Only 8 PPI projects reached financial closure in 34 years (1990-2024)",
      titleAr: "8 مشاريع فقط وصلت للإغلاق المالي في 34 عاماً (1990-2024)",
      severity: "high",
      date: "Jan 2026"
    },
    {
      titleEn: "Port sector dominates PPI ($410M) - 61% of total investment",
      titleAr: "قطاع الموانئ يهيمن على PPI (410 مليون دولار) - 61% من الإجمالي",
      severity: "medium",
      date: "Jan 2026"
    },
    {
      titleEn: "ICT investment $252M (37%), Electricity only $16M (2%)",
      titleAr: "استثمار الاتصالات 252 مليون دولار (37%)، الكهرباء 16 مليون فقط (2%)",
      severity: "medium",
      date: "Jan 2026"
    },
  ];

  const sectorStatus = [
    {
      sectorEn: "Telecommunications",
      sectorAr: "الاتصالات",
      statusEn: "Operational",
      statusAr: "يعمل",
      challengesEn: "Dual taxation, infrastructure damage",
      challengesAr: "ازدواج الضرائب، أضرار البنية التحتية",
      icon: Globe
    },
    {
      sectorEn: "Trade & Commerce",
      sectorAr: "التجارة",
      statusEn: "Constrained",
      statusAr: "مقيد",
      challengesEn: "Import restrictions, currency issues",
      challengesAr: "قيود الاستيراد، مشاكل العملة",
      icon: Store
    },
    {
      sectorEn: "Manufacturing",
      sectorAr: "التصنيع",
      statusEn: "Severely Affected",
      statusAr: "متأثر بشدة",
      challengesEn: "Power shortages, input costs",
      challengesAr: "نقص الكهرباء، تكاليف المدخلات",
      icon: Factory
    },
    {
      sectorEn: "Transport & Logistics",
      sectorAr: "النقل والخدمات اللوجستية",
      statusEn: "Disrupted",
      statusAr: "متعطل",
      challengesEn: "Road damage, checkpoints",
      challengesAr: "أضرار الطرق، نقاط التفتيش",
      icon: Truck
    },
    {
      sectorEn: "Construction",
      sectorAr: "البناء",
      statusEn: "Limited Activity",
      statusAr: "نشاط محدود",
      challengesEn: "Material costs, security",
      challengesAr: "تكاليف المواد، الأمن",
      icon: Building2
    },
    {
      sectorEn: "Financial Services",
      sectorAr: "الخدمات المالية",
      statusEn: "Fragmented",
      statusAr: "مجزأ",
      challengesEn: "Dual banking system, sanctions",
      challengesAr: "نظام مصرفي مزدوج، عقوبات",
      icon: DollarSign
    },
  ];

  const businessConstraints = [
    {
      constraintEn: "Access to Finance",
      constraintAr: "الوصول للتمويل",
      severityEn: "Critical",
      severityAr: "حرج",
      descEn: "Banking system fragmentation and liquidity constraints severely limit business financing.",
      descAr: "تجزئة النظام المصرفي وقيود السيولة تحد بشدة من تمويل الأعمال."
    },
    {
      constraintEn: "Currency Instability",
      constraintAr: "عدم استقرار العملة",
      severityEn: "Critical",
      severityAr: "حرج",
      descEn: "Dual exchange rates and currency volatility create unpredictable business environment.",
      descAr: "أسعار الصرف المزدوجة وتقلب العملة يخلقان بيئة أعمال غير متوقعة."
    },
    {
      constraintEn: "Infrastructure Gaps",
      constraintAr: "فجوات البنية التحتية",
      severityEn: "High",
      severityAr: "عالي",
      descEn: "Power shortages, damaged roads, and port restrictions increase operational costs.",
      descAr: "نقص الكهرباء والطرق المتضررة وقيود الموانئ تزيد تكاليف التشغيل."
    },
    {
      constraintEn: "Regulatory Fragmentation",
      constraintAr: "تجزئة التنظيم",
      severityEn: "High",
      severityAr: "عالي",
      descEn: "Dual regulatory systems and competing tax authorities create compliance challenges.",
      descAr: "الأنظمة التنظيمية المزدوجة والسلطات الضريبية المتنافسة تخلق تحديات الامتثال."
    },
    {
      constraintEn: "Security Concerns",
      constraintAr: "المخاوف الأمنية",
      severityEn: "High",
      severityAr: "عالي",
      descEn: "Ongoing conflict and instability deter investment and limit business operations.",
      descAr: "الصراع المستمر وعدم الاستقرار يثبطان الاستثمار ويحدان من العمليات التجارية."
    },
    {
      constraintEn: "Human Capital Flight",
      constraintAr: "هجرة رأس المال البشري",
      severityEn: "Medium",
      severityAr: "متوسط",
      descEn: "Skilled workers and entrepreneurs emigrating depletes business capacity.",
      descAr: "هجرة العمال المهرة ورجال الأعمال تستنزف القدرات التجارية."
    },
  ];

  const investmentOpportunities = [
    {
      sectorEn: "Renewable Energy",
      sectorAr: "الطاقة المتجددة",
      potentialEn: "High",
      potentialAr: "عالي",
      descEn: "Solar adoption growing rapidly due to grid collapse",
      descAr: "اعتماد الطاقة الشمسية ينمو بسرعة بسبب انهيار الشبكة"
    },
    {
      sectorEn: "Agriculture & Food Processing",
      sectorAr: "الزراعة وتصنيع الأغذية",
      potentialEn: "Medium",
      potentialAr: "متوسط",
      descEn: "Food security needs drive local production demand",
      descAr: "احتياجات الأمن الغذائي تدفع الطلب على الإنتاج المحلي"
    },
    {
      sectorEn: "Telecommunications",
      sectorAr: "الاتصالات",
      potentialEn: "Medium",
      potentialAr: "متوسط",
      descEn: "Digital services demand remains strong",
      descAr: "الطلب على الخدمات الرقمية يظل قوياً"
    },
    {
      sectorEn: "Healthcare",
      sectorAr: "الرعاية الصحية",
      potentialEn: "Medium",
      potentialAr: "متوسط",
      descEn: "Critical service gaps create private sector opportunities",
      descAr: "فجوات الخدمات الحرجة تخلق فرصاً للقطاع الخاص"
    },
  ];

  const relatedReports = [
    {
      titleEn: "Yemen Private Sector Assessment",
      titleAr: "تقييم القطاع الخاص اليمني",
      sourceEn: "IFC",
      sourceAr: "مؤسسة التمويل الدولية",
      date: "2024"
    },
    {
      titleEn: "SME Survival and Recovery Study",
      titleAr: "دراسة بقاء وتعافي المنشآت الصغيرة",
      sourceEn: "World Bank",
      sourceAr: "البنك الدولي",
      date: "2023"
    },
    {
      titleEn: "Investment Climate Assessment",
      titleAr: "تقييم مناخ الاستثمار",
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
              <BarChart3 className="h-6 w-6" />
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {language === "ar" ? "قطاع" : "Sector"}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === "ar" 
              ? "الاستثمار والقطاع الخاص"
              : "Investment & Private Sector"}
          </h1>
          <p className="text-lg text-white/80 max-w-3xl">
            {language === "ar"
              ? "تحليل مناخ الاستثمار وتحديات القطاع الخاص وفرص التعافي الاقتصادي"
              : "Analysis of investment climate, private sector challenges, and economic recovery opportunities"}
          </p>
        </div>
      </section>

      <div className="container py-8">
        {/* Key Indicators */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyIndicators.map((indicator, index) => (
            <Card key={index} className="border-l-4 border-l-[#C0A030]">
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
                  <span className="text-xl font-bold">{indicator.value}</span>
                  {indicator.change && (
                    <span className={`text-sm flex items-center ${
                      indicator.trend === "down" ? "text-red-600" : "text-green-600"
                    }`}>
                      {indicator.trend === "down" ? <TrendingDown className="h-3 w-3 mr-1" /> : 
                       <TrendingUp className="h-3 w-3 mr-1" />}
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
            <TabsTrigger value="sectors">
              {language === "ar" ? "القطاعات" : "Sectors"}
            </TabsTrigger>
            <TabsTrigger value="constraints">
              {language === "ar" ? "التحديات" : "Constraints"}
            </TabsTrigger>
            <TabsTrigger value="opportunities">
              {language === "ar" ? "الفرص" : "Opportunities"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#103050]" />
                    {language === "ar" ? "حالة القطاع الخاص" : "Private Sector Status"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "يعاني القطاع الخاص اليمني من أزمة حادة منذ 2014. توقفت تدفقات الاستثمار الأجنبي المباشر تقريباً، وأغلقت نسبة كبيرة من المنشآت الصغيرة والمتوسطة. البيئة التنظيمية المجزأة والقيود المالية تشكل عوائق رئيسية أمام التعافي."
                      : "Yemen's private sector has suffered a severe crisis since 2014. FDI inflows have virtually stopped, and a significant proportion of SMEs have closed. The fragmented regulatory environment and financial constraints pose major barriers to recovery."}
                  </p>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">
                        {language === "ar" ? "تحذير" : "Warning"}
                      </span>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      {language === "ar"
                        ? "تقديرات نشاط القطاع الخاص غير مؤكدة بسبب غياب البيانات الرسمية الموثوقة."
                        : "Private sector activity estimates are uncertain due to lack of reliable official data."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#107040]" />
                    {language === "ar" ? "الاستثمار الأجنبي" : "Foreign Investment"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "انخفضت تدفقات الاستثمار الأجنبي المباشر بنسبة تزيد عن 95% منذ بداية الصراع. المستثمرون الأجانب يتجنبون اليمن بسبب المخاطر الأمنية والتنظيمية. معظم الاستثمارات الحالية تتركز في قطاعي الاتصالات والطاقة."
                      : "FDI inflows have declined by more than 95% since the conflict began. Foreign investors avoid Yemen due to security and regulatory risks. Most current investments are concentrated in telecommunications and energy sectors."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sectors">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "حالة القطاعات الرئيسية" : "Key Sector Status"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectorStatus.map((sector, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <sector.icon className="h-5 w-5 text-[#103050]" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {language === "ar" ? sector.sectorAr : sector.sectorEn}
                          </h4>
                          <Badge variant="outline" className={`text-xs ${
                            sector.statusEn === "Operational" ? "text-green-600 border-green-200" :
                            sector.statusEn === "Constrained" || sector.statusEn === "Disrupted" ? "text-yellow-600 border-yellow-200" :
                            "text-red-600 border-red-200"
                          }`}>
                            {language === "ar" ? sector.statusAr : sector.statusEn}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? sector.challengesAr : sector.challengesEn}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="constraints">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "معوقات الأعمال الرئيسية" : "Key Business Constraints"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessConstraints.map((constraint, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {language === "ar" ? constraint.constraintAr : constraint.constraintEn}
                        </h4>
                        <Badge variant="outline" className={`${
                          constraint.severityEn === "Critical" ? "bg-red-100 text-red-700 border-red-200" :
                          constraint.severityEn === "High" ? "bg-orange-100 text-orange-700 border-orange-200" :
                          "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }`}>
                          {language === "ar" ? constraint.severityAr : constraint.severityEn}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? constraint.descAr : constraint.descEn}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#107040]" />
                  {language === "ar" ? "فرص الاستثمار المحتملة" : "Potential Investment Opportunities"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "قطاعات ذات إمكانات نمو رغم التحديات"
                    : "Sectors with growth potential despite challenges"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {investmentOpportunities.map((opp, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {language === "ar" ? opp.sectorAr : opp.sectorEn}
                        </h4>
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          {language === "ar" ? `إمكانية ${opp.potentialAr}` : `${opp.potentialEn} Potential`}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? opp.descAr : opp.descEn}
                      </p>
                    </div>
                  ))}
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
    </div>
  );
}
