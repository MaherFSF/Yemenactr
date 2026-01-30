import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  BookOpen,
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  ExternalLink,
  Database,
  Scale,
  Eye,
  FileText,
  ChevronDown,
  ChevronUp,
  Globe,
  Building2,
  FlaskConical,
  BarChart3,
  FileJson,
  FileSpreadsheet,
  Lock,
  Sparkles
} from "lucide-react";

export default function Methodology() {
  const { language } = useLanguage();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const confidenceLevels = [
    {
      grade: "A",
      labelEn: "High Confidence",
      labelAr: "ثقة عالية",
      descriptionEn: "Official source, verified by multiple independent parties, recent data",
      descriptionAr: "مصدر رسمي، تم التحقق منه من قبل أطراف مستقلة متعددة، بيانات حديثة",
      color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    },
    {
      grade: "B",
      labelEn: "Moderate Confidence",
      labelAr: "ثقة متوسطة",
      descriptionEn: "Credible source, limited verification, reasonably current",
      descriptionAr: "مصدر موثوق، تحقق محدود، حديث بشكل معقول",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
    },
    {
      grade: "C",
      labelEn: "Low Confidence",
      labelAr: "ثقة منخفضة",
      descriptionEn: "Single source, unverified, or older data requiring caution",
      descriptionAr: "مصدر واحد، غير موثق، أو بيانات قديمة تتطلب الحذر",
      color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
    },
    {
      grade: "D",
      labelEn: "Estimate/Proxy",
      labelAr: "تقدير/بديل",
      descriptionEn: "Calculated estimate, proxy indicator, or expert assessment",
      descriptionAr: "تقدير محسوب، مؤشر بديل، أو تقييم خبير",
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800"
    },
    {
      grade: "E",
      labelEn: "Contested/Disputed",
      labelAr: "متنازع عليه",
      descriptionEn: "Multiple conflicting sources, politically sensitive, requires cross-referencing",
      descriptionAr: "مصادر متعددة متضاربة، حساسة سياسياً، تتطلب مراجعة متقاطعة",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
    },
  ];

  const dataSources = [
    {
      id: "government",
      categoryEn: "Official Government Sources",
      categoryAr: "المصادر الحكومية الرسمية",
      icon: Building2,
      sources: [
        { name: "Central Bank of Yemen - Aden (CBY-Aden)", nameAr: "البنك المركزي اليمني - عدن", type: "Primary", reliability: "A-B", url: "https://www.centralbank.gov.ye" },
        { name: "Central Bank of Yemen - Sana'a (CBY-Sana'a)", nameAr: "البنك المركزي اليمني - صنعاء", type: "Primary", reliability: "B-C", url: "https://www.cby-ye.com" },
        { name: "Ministry of Finance - IRG", nameAr: "وزارة المالية - الحكومة الشرعية", type: "Primary", reliability: "B-C" },
        { name: "Ministry of Finance - DFA", nameAr: "وزارة المالية - سلطة الأمر الواقع", type: "Primary", reliability: "C" },
        { name: "Central Statistical Organization", nameAr: "الجهاز المركزي للإحصاء", type: "Primary", reliability: "C" },
      ]
    },
    {
      id: "international",
      categoryEn: "International Organizations",
      categoryAr: "المنظمات الدولية",
      icon: Globe,
      sources: [
        { name: "World Bank", nameAr: "البنك الدولي", type: "Primary", reliability: "A", url: "https://www.worldbank.org/en/country/yemen" },
        { name: "International Monetary Fund (IMF)", nameAr: "صندوق النقد الدولي", type: "Primary", reliability: "A", url: "https://www.imf.org/en/Countries/YEM" },
        { name: "UN OCHA", nameAr: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية", type: "Primary", reliability: "A", url: "https://www.unocha.org/yemen" },
        { name: "Food and Agriculture Organization (FAO)", nameAr: "منظمة الأغذية والزراعة", type: "Primary", reliability: "A", url: "https://www.fao.org/yemen" },
        { name: "International Labour Organization (ILO)", nameAr: "منظمة العمل الدولية", type: "Primary", reliability: "A", url: "https://www.ilo.org" },
        { name: "UNCTAD", nameAr: "مؤتمر الأمم المتحدة للتجارة والتنمية", type: "Primary", reliability: "A", url: "https://unctad.org" },
        { name: "IPC (Food Security)", nameAr: "التصنيف المرحلي المتكامل للأمن الغذائي", type: "Primary", reliability: "A", url: "https://www.ipcinfo.org" },
        { name: "World Food Programme (WFP)", nameAr: "برنامج الأغذية العالمي", type: "Primary", reliability: "A", url: "https://www.wfp.org/countries/yemen" },
        { name: "UNDP Yemen", nameAr: "برنامج الأمم المتحدة الإنمائي - اليمن", type: "Primary", reliability: "A", url: "https://www.undp.org/yemen" },
      ]
    },
    {
      id: "research",
      categoryEn: "Research Institutions",
      categoryAr: "المؤسسات البحثية",
      icon: FlaskConical,
      sources: [
        { name: "Sana'a Center for Strategic Studies", nameAr: "مركز صنعاء للدراسات الاستراتيجية", type: "Secondary", reliability: "A-B" },
        { name: "Rethinking Yemen's Economy", nameAr: "إعادة التفكير في اقتصاد اليمن", type: "Secondary", reliability: "A-B" },
        { name: "ACAPS", nameAr: "أكابس", type: "Secondary", reliability: "A-B" },
        { name: "Yemen Policy Center", nameAr: "مركز سياسات اليمن", type: "Secondary", reliability: "B" },
      ]
    },
    {
      id: "market",
      categoryEn: "Market & Field Data",
      categoryAr: "بيانات السوق والميدان",
      icon: BarChart3,
      sources: [
        { name: "WFP Market Monitoring", nameAr: "رصد أسواق برنامج الأغذية العالمي", type: "Primary", reliability: "A" },
        { name: "Exchange Bureau Surveys", nameAr: "مسوحات مكاتب الصرافة", type: "Primary", reliability: "B" },
        { name: "Fuel Station Surveys", nameAr: "مسوحات محطات الوقود", type: "Primary", reliability: "B" },
      ]
    },
  ];

  const provenanceRules = [
    {
      titleEn: "Source Attribution",
      titleAr: "إسناد المصدر",
      descriptionEn: "Every data point must cite its original source with date of publication",
      descriptionAr: "كل نقطة بيانات يجب أن تذكر مصدرها الأصلي مع تاريخ النشر",
      icon: FileCheck
    },
    {
      titleEn: "Confidence Grading",
      titleAr: "تصنيف الثقة",
      descriptionEn: "All indicators carry a confidence grade (A-E) based on source reliability and verification",
      descriptionAr: "جميع المؤشرات تحمل درجة ثقة (A-E) بناءً على موثوقية المصدر والتحقق",
      icon: Scale
    },
    {
      titleEn: "Regime Tagging",
      titleAr: "وسم النظام",
      descriptionEn: "Data is tagged by territorial control (IRG, DFA, or National) where applicable",
      descriptionAr: "البيانات موسومة حسب السيطرة الإقليمية (الشرعية، الأمر الواقع، أو وطني) حيثما ينطبق",
      icon: Building2
    },
    {
      titleEn: "Temporal Marking",
      titleAr: "التحديد الزمني",
      descriptionEn: "Reference period and data vintage are clearly indicated",
      descriptionAr: "فترة المرجع وعمر البيانات محددة بوضوح",
      icon: Eye
    },
    {
      titleEn: "Methodology Notes",
      titleAr: "ملاحظات المنهجية",
      descriptionEn: "Calculation methods and assumptions are documented for derived indicators",
      descriptionAr: "طرق الحساب والافتراضات موثقة للمؤشرات المشتقة",
      icon: FileText
    },
  ];

  const downloadDocuments = [
    {
      titleEn: "Full Methodology Guide",
      titleAr: "دليل المنهجية الكامل",
      descriptionEn: "Complete documentation of data collection, verification, and presentation standards",
      descriptionAr: "توثيق كامل لمعايير جمع البيانات والتحقق منها وعرضها",
      format: "PDF",
      size: "2.4 MB",
      icon: FileText,
      color: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-950/50"
    },
    {
      titleEn: "Data Dictionary",
      titleAr: "قاموس البيانات",
      descriptionEn: "Definitions, units, and metadata for all indicators in the platform",
      descriptionAr: "التعريفات والوحدات والبيانات الوصفية لجميع المؤشرات في المنصة",
      format: "PDF",
      size: "1.1 MB",
      icon: Database,
      color: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-950/50"
    },
    {
      titleEn: "API Documentation",
      titleAr: "توثيق واجهة البرمجة",
      descriptionEn: "Technical guide for accessing YETO data programmatically",
      descriptionAr: "دليل تقني للوصول إلى بيانات YETO برمجياً",
      format: "JSON",
      size: "450 KB",
      icon: FileJson,
      color: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 hover:bg-amber-100 dark:hover:bg-amber-950/50"
    },
    {
      titleEn: "Indicator Catalog",
      titleAr: "كتالوج المؤشرات",
      descriptionEn: "Complete list of all economic indicators with sources and update frequencies",
      descriptionAr: "قائمة كاملة بجميع المؤشرات الاقتصادية مع المصادر وتكرار التحديث",
      format: "XLSX",
      size: "890 KB",
      icon: FileSpreadsheet,
      color: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
    },
  ];

  const getReliabilityColor = (reliability: string) => {
    if (reliability.includes("A")) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    if (reliability.includes("B")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    if (reliability.includes("C")) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-b">
        <div className="container py-8 md:py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              {language === "ar" 
                ? "المنهجية والشفافية"
                : "Methodology & Transparency"}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === "ar"
                ? "كيف نجمع ونتحقق ونقدم البيانات الاقتصادية في اليمن"
                : "How we collect, verify, and present economic data on Yemen"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-6 md:py-8 flex-1">
        {/* Mission Statement */}
        <Card className="mb-6 md:mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {language === "ar" ? "التزامنا بالشفافية" : "Our Commitment to Transparency"}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {language === "ar"
                    ? "في بيئة بيانات صعبة مثل اليمن، الشفافية حول ما نعرفه وما لا نعرفه أمر بالغ الأهمية. نحن ملتزمون بالإفصاح الكامل عن مصادرنا ومنهجياتنا وقيودنا."
                    : "In a challenging data environment like Yemen, transparency about what we know and don't know is critical. We are committed to full disclosure of our sources, methodologies, and limitations."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="corrections" className="space-y-6">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
            <TabsTrigger value="corrections" className="flex-1 min-w-[100px] text-xs sm:text-sm py-2">
              {language === "ar" ? "التصحيحات" : "Corrections"}
            </TabsTrigger>
            <TabsTrigger value="provenance" className="flex-1 min-w-[100px] text-xs sm:text-sm py-2">
              {language === "ar" ? "قواعد المصدر" : "Provenance"}
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex-1 min-w-[100px] text-xs sm:text-sm py-2">
              {language === "ar" ? "المصادر" : "Sources"}
            </TabsTrigger>
            <TabsTrigger value="confidence" className="flex-1 min-w-[100px] text-xs sm:text-sm py-2">
              {language === "ar" ? "مستويات الثقة" : "Confidence"}
            </TabsTrigger>
          </TabsList>

          {/* Corrections Tab */}
          <TabsContent value="corrections" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  {language === "ar" ? "سياسة التصحيحات" : "Corrections Policy"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "كيف نتعامل مع الأخطاء والتحديثات"
                    : "How we handle errors and updates"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Error Reporting Card */}
                <div className="p-4 md:p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">
                        {language === "ar" ? "الإبلاغ عن الأخطاء" : "Reporting Errors"}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {language === "ar"
                          ? "إذا وجدت خطأ في بياناتنا، يرجى الإبلاغ عنه عبر نموذج الاتصال أو البريد الإلكتروني. نحن نقدر مساهمات المجتمع في تحسين جودة البيانات."
                          : "If you find an error in our data, please report it via the contact form or email. We value community contributions to improving data quality."}
                      </p>
                      <Button variant="default" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        {language === "ar" ? "الإبلاغ عن خطأ" : "Report an Error"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Correction Process */}
                <div className="p-4 md:p-6 rounded-xl border bg-card">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {language === "ar" ? "عملية التصحيح" : "Correction Process"}
                  </h4>
                  <div className="grid gap-3">
                    {[
                      { step: 1, en: "Receive report and initial verification", ar: "استلام التقرير والتحقق الأولي" },
                      { step: 2, en: "Review original sources", ar: "مراجعة المصادر الأصلية" },
                      { step: 3, en: "Update data if confirmed", ar: "تحديث البيانات إذا تم التأكيد" },
                      { step: 4, en: "Publish correction note", ar: "نشر ملاحظة التصحيح" },
                      { step: 5, en: "Notify affected users", ar: "إخطار المستخدمين المتأثرين" },
                    ].map((item) => (
                      <div key={item.step} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                          {item.step}
                        </div>
                        <span className="text-sm">{language === "ar" ? item.ar : item.en}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Corrections Log */}
                <div className="p-4 md:p-6 rounded-xl border bg-muted/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    {language === "ar" ? "سجل التصحيحات الأخيرة" : "Recent Corrections Log"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar"
                      ? "لا توجد تصحيحات حديثة."
                      : "No recent corrections."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Provenance Rules Tab */}
          <TabsContent value="provenance" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-primary" />
                  {language === "ar" ? "قواعد تتبع المصدر" : "Provenance Rules"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "المعايير التي نتبعها لضمان قابلية التتبع"
                    : "Standards we follow to ensure traceability"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {provenanceRules.map((rule, index) => {
                    const Icon = rule.icon;
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm md:text-base">
                            {language === "ar" ? rule.titleAr : rule.titleEn}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {language === "ar" ? rule.descriptionAr : rule.descriptionEn}
                          </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Sources Tab - Mobile Optimized with Collapsible Categories */}
          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-5 w-5 text-primary" />
                  {language === "ar" ? "مصادر البيانات" : "Data Sources"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "المصادر الرئيسية والثانوية المستخدمة في YETO"
                    : "Primary and secondary sources used in YETO"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dataSources.map((category) => {
                  const Icon = category.icon;
                  const isExpanded = expandedCategories[category.id] !== false; // Default to expanded
                  
                  return (
                    <Collapsible key={category.id} open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                      <div className="rounded-xl border overflow-hidden">
                        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-start">
                              <h4 className="font-semibold text-sm md:text-base">
                                {language === "ar" ? category.categoryAr : category.categoryEn}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {category.sources.length} {language === "ar" ? "مصادر" : "sources"}
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          {/* Desktop Table View */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b bg-muted/20">
                                  <th className="text-start p-3 font-medium text-sm">
                                    {language === "ar" ? "المصدر" : "Source"}
                                  </th>
                                  <th className="text-start p-3 font-medium text-sm">
                                    {language === "ar" ? "النوع" : "Type"}
                                  </th>
                                  <th className="text-start p-3 font-medium text-sm">
                                    {language === "ar" ? "الموثوقية" : "Reliability"}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {category.sources.map((source, i) => (
                                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="p-3">
                                      <div className="font-medium text-sm">
                                        {language === "ar" && source.nameAr ? source.nameAr : source.name}
                                      </div>
                                      {source.url && (
                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                          <ExternalLink className="h-3 w-3" />
                                          {language === "ar" ? "زيارة الموقع" : "Visit website"}
                                        </a>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      <Badge variant="outline" className="text-xs">
                                        {source.type}
                                      </Badge>
                                    </td>
                                    <td className="p-3">
                                      <Badge className={`text-xs ${getReliabilityColor(source.reliability)}`}>
                                        {source.reliability}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          {/* Mobile Card View */}
                          <div className="md:hidden divide-y">
                            {category.sources.map((source, i) => (
                              <div key={i} className="p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="font-medium text-sm flex-1">
                                    {language === "ar" && source.nameAr ? source.nameAr : source.name}
                                  </div>
                                  <Badge className={`text-xs flex-shrink-0 ${getReliabilityColor(source.reliability)}`}>
                                    {source.reliability}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {source.type}
                                  </Badge>
                                  {source.url && (
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                      <ExternalLink className="h-3 w-3" />
                                      {language === "ar" ? "الموقع" : "Website"}
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Confidence Levels Tab */}
          <TabsContent value="confidence" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Scale className="h-5 w-5 text-primary" />
                  {language === "ar" ? "نظام تصنيف الثقة" : "Confidence Grading System"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "كل مؤشر في YETO يحمل درجة ثقة تعكس موثوقية البيانات"
                    : "Every indicator in YETO carries a confidence grade reflecting data reliability"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {confidenceLevels.map((level, index) => (
                    <div key={index} className={`flex items-start gap-4 p-4 rounded-xl border ${level.color.replace('text-', 'border-').split(' ')[0]}/30`}>
                      <Badge className={`text-lg font-bold px-4 py-2 ${level.color}`}>
                        {level.grade}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base">
                          {language === "ar" ? level.labelAr : level.labelEn}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {language === "ar" ? level.descriptionAr : level.descriptionEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Download Section - Redesigned */}
        <Card className="mt-6 md:mt-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-primary" />
              {language === "ar" ? "تحميل الوثائق" : "Download Documentation"}
            </CardTitle>
            <CardDescription>
              {language === "ar"
                ? "احصل على الوثائق الكاملة للمنهجية والبيانات"
                : "Get complete methodology and data documentation"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {downloadDocuments.map((doc, index) => {
                const Icon = doc.icon;
                return (
                  <button
                    key={index}
                    className={`group p-4 md:p-5 rounded-xl border-2 transition-all duration-200 text-start ${doc.color}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm md:text-base mb-1">
                          {language === "ar" ? doc.titleAr : doc.titleEn}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {language === "ar" ? doc.descriptionAr : doc.descriptionEn}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {doc.format}
                          </Badge>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{doc.size}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
