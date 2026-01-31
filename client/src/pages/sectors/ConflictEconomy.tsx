import { useLanguage } from "@/contexts/LanguageContext";
import { SourcesUsedPanel } from "@/components/SourcesUsedPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield,
  AlertTriangle,
  TrendingUp,
  MapPin,
  FileText,
  Download,
  ExternalLink,
  Scale,
  Landmark,
  Truck,
  Banknote,
  AlertOctagon
} from "lucide-react";
import { Link } from "wouter";

export default function ConflictEconomy() {
  const { language } = useLanguage();

  // Updated January 2026 - Including STC dissolution and Nation's Shield takeover
  const keyIndicators = [
    {
      titleEn: "Conflict Duration",
      titleAr: "مدة الصراع",
      value: "11+ years",
      periodEn: "Since 2014",
      periodAr: "منذ 2014",
      icon: Shield,
      color: "text-red-600"
    },
    {
      titleEn: "Territorial Control",
      titleAr: "السيطرة الإقليمية",
      value: "Shifting",
      periodEn: "STC dissolved Jan 2026",
      periodAr: "حل الانتقالي يناير 2026",
      icon: MapPin,
      color: "text-amber-600"
    },
    {
      titleEn: "Economic Fragmentation",
      titleAr: "التجزئة الاقتصادية",
      value: "Critical",
      periodEn: "Dual CBY systems",
      periodAr: "نظامان بنكيان مزدوجان",
      icon: Scale,
      color: "text-purple-600"
    },
    {
      titleEn: "Humanitarian Impact",
      titleAr: "الأثر الإنساني",
      value: "21.6M",
      periodEn: "People in need (HNO 2025)",
      periodAr: "شخص محتاج (2025)",
      icon: AlertTriangle,
      color: "text-orange-600"
    },
  ];

  const warEconomyChannels = [
    {
      titleEn: "Fuel Import Controls",
      titleAr: "ضوابط استيراد الوقود",
      descEn: "Control over fuel imports generates significant revenue for controlling authorities through taxation and distribution monopolies.",
      descAr: "السيطرة على واردات الوقود تولد إيرادات كبيرة للسلطات المسيطرة من خلال الضرائب واحتكارات التوزيع.",
      regimeEn: "Both",
      regimeAr: "كلاهما"
    },
    {
      titleEn: "Customs & Border Revenues",
      titleAr: "إيرادات الجمارك والحدود",
      descEn: "Ports and border crossings are key revenue sources, with competing tax regimes imposed by different authorities.",
      descAr: "الموانئ والمعابر الحدودية مصادر رئيسية للإيرادات، مع فرض أنظمة ضريبية متنافسة من قبل سلطات مختلفة.",
      regimeEn: "Both",
      regimeAr: "كلاهما"
    },
    {
      titleEn: "Telecommunications Taxation",
      titleAr: "ضرائب الاتصالات",
      descEn: "Mobile operators and telecom services face multiple taxation from different authorities.",
      descAr: "يواجه مشغلو الهاتف المحمول وخدمات الاتصالات ضرائب متعددة من سلطات مختلفة.",
      regimeEn: "Both",
      regimeAr: "كلاهما"
    },
    {
      titleEn: "Banking System Split",
      titleAr: "انقسام النظام المصرفي",
      descEn: "Dual central bank operations create parallel monetary policies and exchange rate regimes.",
      descAr: "عمليات البنك المركزي المزدوجة تخلق سياسات نقدية موازية وأنظمة سعر صرف مختلفة.",
      regimeEn: "Both",
      regimeAr: "كلاهما"
    },
  ];

  const governanceFragmentation = [
    {
      areaEn: "Northern Highlands",
      areaAr: "المرتفعات الشمالية",
      controlEn: "DFA (Sana'a)",
      controlAr: "سلطة الأمر الواقع (صنعاء)",
      popEn: "~70% of population",
      popAr: "~70% من السكان"
    },
    {
      areaEn: "Southern Governorates",
      areaAr: "المحافظات الجنوبية",
      controlEn: "IRG / STC",
      controlAr: "الشرعية / المجلس الانتقالي",
      popEn: "~20% of population",
      popAr: "~20% من السكان"
    },
    {
      areaEn: "Marib & Eastern",
      areaAr: "مأرب والشرق",
      controlEn: "IRG",
      controlAr: "الشرعية",
      popEn: "Key resources",
      popAr: "موارد رئيسية"
    },
    {
      areaEn: "Coastal Areas",
      areaAr: "المناطق الساحلية",
      controlEn: "Mixed",
      controlAr: "مختلطة",
      popEn: "Strategic ports",
      popAr: "موانئ استراتيجية"
    },
  ];

  const economicImpacts = [
    {
      titleEn: "GDP Collapse",
      titleAr: "انهيار الناتج المحلي",
      valueEn: "-50%",
      descEn: "GDP contracted by approximately 50% since 2014",
      descAr: "انكمش الناتج المحلي الإجمالي بنحو 50% منذ 2014"
    },
    {
      titleEn: "Currency Depreciation",
      titleAr: "انخفاض قيمة العملة",
      valueEn: "-80%",
      descEn: "Rial lost ~80% of pre-war value (IRG areas)",
      descAr: "فقد الريال ~80% من قيمته قبل الحرب (مناطق الشرعية)"
    },
    {
      titleEn: "Infrastructure Damage",
      titleAr: "أضرار البنية التحتية",
      valueEn: "$20B+",
      descEn: "Estimated infrastructure damage and losses",
      descAr: "تقديرات أضرار وخسائر البنية التحتية"
    },
    {
      titleEn: "Poverty Rate",
      titleAr: "معدل الفقر",
      valueEn: "80%+",
      descEn: "Population living below poverty line",
      descAr: "السكان الذين يعيشون تحت خط الفقر"
    },
  ];

  const relatedReports = [
    {
      titleEn: "Yemen's War Economy: Fragmentation and Adaptation",
      titleAr: "اقتصاد الحرب في اليمن: التجزئة والتكيف",
      sourceEn: "Sana'a Center",
      sourceAr: "مركز صنعاء",
      date: "2024"
    },
    {
      titleEn: "Political Economy of Yemen's Conflict",
      titleAr: "الاقتصاد السياسي للصراع اليمني",
      sourceEn: "World Bank",
      sourceAr: "البنك الدولي",
      date: "2023"
    },
    {
      titleEn: "Governance Fragmentation Assessment",
      titleAr: "تقييم تجزئة الحوكمة",
      sourceEn: "UNDP",
      sourceAr: "برنامج الأمم المتحدة الإنمائي",
      date: "2023"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#768064] to-[#0B1F33] text-white">
        <div className="container py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {language === "ar" ? "قطاع" : "Sector"}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === "ar" 
              ? "اقتصاد الصراع والاقتصاد السياسي"
              : "Conflict Economy & Political Economy"}
          </h1>
          <p className="text-lg text-white/80 max-w-3xl">
            {language === "ar"
              ? "تحليل ديناميكيات اقتصاد الحرب وتجزئة الحوكمة والتأثيرات الاقتصادية للصراع"
              : "Analysis of war economy dynamics, governance fragmentation, and economic impacts of the conflict"}
          </p>
          
          {/* Warning Banner */}
          <div className="mt-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-start gap-3">
            <AlertOctagon className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-100">
              {language === "ar"
                ? "تنويه: هذا القسم يقدم تحليلاً قائماً على الأدلة فقط. لا يُقصد به تقديم إرشادات تمكّن من العنف أو التهرب من العقوبات أو التلاعب بالسوق."
                : "Disclaimer: This section provides evidence-based analysis only. It is not intended to provide guidance that enables violence, sanctions evasion, or market manipulation."}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Key Indicators */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyIndicators.map((indicator, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
                    <indicator.icon className={`h-5 w-5 ${indicator.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? indicator.titleAr : indicator.titleEn}
                    </p>
                    <p className="text-2xl font-bold">{indicator.value}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? indicator.periodAr : indicator.periodEn}
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
            <TabsTrigger value="war-economy">
              {language === "ar" ? "اقتصاد الحرب" : "War Economy"}
            </TabsTrigger>
            <TabsTrigger value="governance">
              {language === "ar" ? "تجزئة الحوكمة" : "Governance Fragmentation"}
            </TabsTrigger>
            <TabsTrigger value="impacts">
              {language === "ar" ? "التأثيرات" : "Impacts"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-[#768064]" />
                    {language === "ar" ? "السياق السياسي" : "Political Context"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "منذ 2014، شهد اليمن انقساماً سياسياً وجغرافياً حاداً. تسيطر سلطة الأمر الواقع على المرتفعات الشمالية بما فيها صنعاء، بينما تعمل الحكومة المعترف بها دولياً من عدن. هذا الانقسام أدى إلى نظامين اقتصاديين ونقديين متوازيين."
                      : "Since 2014, Yemen has experienced a sharp political and geographical division. The de facto authority controls the northern highlands including Sana'a, while the internationally recognized government operates from Aden. This division has led to two parallel economic and monetary systems."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-[#4C583E]" />
                    {language === "ar" ? "التجزئة الاقتصادية" : "Economic Fragmentation"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "أدى الصراع إلى تجزئة اقتصادية عميقة: بنكان مركزيان، عملتان بأسعار صرف مختلفة، أنظمة ضريبية متنافسة، وسلاسل إمداد مقطعة. هذه التجزئة تفرض تكاليف إضافية على الأعمال والمواطنين."
                      : "The conflict has led to deep economic fragmentation: two central banks, two currencies with different exchange rates, competing tax systems, and disrupted supply chains. This fragmentation imposes additional costs on businesses and citizens."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="war-economy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  {language === "ar" ? "قنوات اقتصاد الحرب" : "War Economy Channels"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "المصادر الرئيسية للإيرادات والسيطرة الاقتصادية"
                    : "Key sources of revenue and economic control"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {warEconomyChannels.map((channel, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {language === "ar" ? channel.titleAr : channel.titleEn}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {language === "ar" ? channel.regimeAr : channel.regimeEn}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? channel.descAr : channel.descEn}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {language === "ar" ? "خريطة السيطرة" : "Control Map"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "المنطقة" : "Area"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "السيطرة" : "Control"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "ملاحظات" : "Notes"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {governanceFragmentation.map((area, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3 font-medium">
                            {language === "ar" ? area.areaAr : area.areaEn}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">
                              {language === "ar" ? area.controlAr : area.controlEn}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {language === "ar" ? area.popAr : area.popEn}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impacts">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {economicImpacts.map((impact, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-[#768064] mb-2">
                      {impact.valueEn}
                    </div>
                    <h4 className="font-medium mb-2">
                      {language === "ar" ? impact.titleAr : impact.titleEn}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? impact.descAr : impact.descEn}
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
          <Link href="/timeline">
            <Button variant="outline" className="gap-2">
              {language === "ar" ? "عرض الجدول الزمني" : "View Timeline"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Sources Used Panel */}
      <SourcesUsedPanel sectorCode="conflict" />
    </div>
  );
}
