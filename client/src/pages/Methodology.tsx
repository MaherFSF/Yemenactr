import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen,
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Download,
  ExternalLink,
  Database,
  Users,
  Scale,
  Eye
} from "lucide-react";

export default function Methodology() {
  const { language } = useLanguage();

  const confidenceLevels = [
    {
      grade: "A",
      labelEn: "High Confidence",
      labelAr: "ثقة عالية",
      descriptionEn: "Official source, verified by multiple independent parties, recent data",
      descriptionAr: "مصدر رسمي، تم التحقق منه من قبل أطراف مستقلة متعددة، بيانات حديثة",
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    },
    {
      grade: "B",
      labelEn: "Moderate Confidence",
      labelAr: "ثقة متوسطة",
      descriptionEn: "Credible source, limited verification, reasonably current",
      descriptionAr: "مصدر موثوق، تحقق محدود، حديث بشكل معقول",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    },
    {
      grade: "C",
      labelEn: "Low Confidence",
      labelAr: "ثقة منخفضة",
      descriptionEn: "Single source, unverified, or older data requiring caution",
      descriptionAr: "مصدر واحد، غير موثق، أو بيانات قديمة تتطلب الحذر",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    },
    {
      grade: "D",
      labelEn: "Estimate/Proxy",
      labelAr: "تقدير/بديل",
      descriptionEn: "Calculated estimate, proxy indicator, or expert assessment",
      descriptionAr: "تقدير محسوب، مؤشر بديل، أو تقييم خبير",
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
    },
    {
      grade: "E",
      labelEn: "Contested/Disputed",
      labelAr: "متنازع عليه",
      descriptionEn: "Multiple conflicting sources, politically sensitive, requires cross-referencing",
      descriptionAr: "مصادر متعددة متضاربة، حساسة سياسياً، تتطلب مراجعة متقاطعة",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    },
  ];

  const dataSources = [
    {
      categoryEn: "Official Government Sources",
      categoryAr: "المصادر الحكومية الرسمية",
      sources: [
        { name: "Central Bank of Yemen - Aden", type: "Primary", reliability: "A-B" },
        { name: "Ministry of Finance - IRG", type: "Primary", reliability: "B-C" },
        { name: "Central Statistical Organization", type: "Primary", reliability: "C" },
      ]
    },
    {
      categoryEn: "International Organizations",
      categoryAr: "المنظمات الدولية",
      sources: [
        { name: "World Bank", type: "Primary", reliability: "A" },
        { name: "IMF", type: "Primary", reliability: "A" },
        { name: "OCHA / UN Agencies", type: "Primary", reliability: "A" },
        { name: "IPC (Food Security)", type: "Primary", reliability: "A" },
      ]
    },
    {
      categoryEn: "Research Institutions",
      categoryAr: "المؤسسات البحثية",
      sources: [
        { name: "Sana'a Center for Strategic Studies", type: "Secondary", reliability: "A-B" },
        { name: "Rethinking Yemen's Economy", type: "Secondary", reliability: "A-B" },
        { name: "ACAPS", type: "Secondary", reliability: "A-B" },
        { name: "Yemen Policy Center", type: "Secondary", reliability: "B" },
      ]
    },
    {
      categoryEn: "Market & Field Data",
      categoryAr: "بيانات السوق والميدان",
      sources: [
        { name: "WFP Market Monitoring", type: "Primary", reliability: "A" },
        { name: "Exchange Bureau Surveys", type: "Primary", reliability: "B" },
        { name: "Fuel Station Surveys", type: "Primary", reliability: "B" },
      ]
    },
  ];

  const provenanceRules = [
    {
      titleEn: "Source Attribution",
      titleAr: "إسناد المصدر",
      descriptionEn: "Every data point must cite its original source with date of publication",
      descriptionAr: "كل نقطة بيانات يجب أن تذكر مصدرها الأصلي مع تاريخ النشر"
    },
    {
      titleEn: "Confidence Grading",
      titleAr: "تصنيف الثقة",
      descriptionEn: "All indicators carry a confidence grade (A-E) based on source reliability and verification",
      descriptionAr: "جميع المؤشرات تحمل درجة ثقة (A-E) بناءً على موثوقية المصدر والتحقق"
    },
    {
      titleEn: "Regime Tagging",
      titleAr: "وسم النظام",
      descriptionEn: "Data is tagged by territorial control (IRG, DFA, or National) where applicable",
      descriptionAr: "البيانات موسومة حسب السيطرة الإقليمية (الشرعية، الأمر الواقع، أو وطني) حيثما ينطبق"
    },
    {
      titleEn: "Temporal Marking",
      titleAr: "التحديد الزمني",
      descriptionEn: "Reference period and data vintage are clearly indicated",
      descriptionAr: "فترة المرجع وعمر البيانات محددة بوضوح"
    },
    {
      titleEn: "Methodology Notes",
      titleAr: "ملاحظات المنهجية",
      descriptionEn: "Calculation methods and assumptions are documented for derived indicators",
      descriptionAr: "طرق الحساب والافتراضات موثقة للمؤشرات المشتقة"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "ar" 
                ? "المنهجية والشفافية"
                : "Methodology & Transparency"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === "ar"
                ? "كيف نجمع ونتحقق ونقدم البيانات الاقتصادية في اليمن"
                : "How we collect, verify, and present economic data on Yemen"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Mission Statement */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {language === "ar" ? "التزامنا بالشفافية" : "Our Commitment to Transparency"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "ar"
                    ? "في بيئة بيانات صعبة مثل اليمن، الشفافية حول ما نعرفه وما لا نعرفه أمر بالغ الأهمية. نحن ملتزمون بالإفصاح الكامل عن مصادرنا ومنهجياتنا وقيودنا."
                    : "In a challenging data environment like Yemen, transparency about what we know and don't know is critical. We are committed to full disclosure of our sources, methodologies, and limitations."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="confidence">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="confidence">
              {language === "ar" ? "مستويات الثقة" : "Confidence Levels"}
            </TabsTrigger>
            <TabsTrigger value="sources">
              {language === "ar" ? "المصادر" : "Data Sources"}
            </TabsTrigger>
            <TabsTrigger value="provenance">
              {language === "ar" ? "قواعد المصدر" : "Provenance Rules"}
            </TabsTrigger>
            <TabsTrigger value="corrections">
              {language === "ar" ? "التصحيحات" : "Corrections"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="confidence">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  {language === "ar" ? "نظام تصنيف الثقة" : "Confidence Grading System"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "كل مؤشر في YETO يحمل درجة ثقة تعكس موثوقية البيانات"
                    : "Every indicator in YETO carries a confidence grade reflecting data reliability"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {confidenceLevels.map((level, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Badge className={`text-lg font-bold px-3 py-1 ${level.color}`}>
                        {level.grade}
                      </Badge>
                      <div>
                        <h4 className="font-semibold">
                          {language === "ar" ? level.labelAr : level.labelEn}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "ar" ? level.descriptionAr : level.descriptionEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {language === "ar" ? "مصادر البيانات" : "Data Sources"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "المصادر الرئيسية والثانوية المستخدمة في YETO"
                    : "Primary and secondary sources used in YETO"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {dataSources.map((category, index) => (
                    <div key={index}>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileCheck className="h-4 w-4" />
                        {language === "ar" ? category.categoryAr : category.categoryEn}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-start p-2 font-medium">
                                {language === "ar" ? "المصدر" : "Source"}
                              </th>
                              <th className="text-start p-2 font-medium">
                                {language === "ar" ? "النوع" : "Type"}
                              </th>
                              <th className="text-start p-2 font-medium">
                                {language === "ar" ? "الموثوقية" : "Reliability"}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.sources.map((source, i) => (
                              <tr key={i} className="border-b hover:bg-muted/50">
                                <td className="p-2">{source.name}</td>
                                <td className="p-2">
                                  <Badge variant="outline" className="text-xs">
                                    {source.type}
                                  </Badge>
                                </td>
                                <td className="p-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {source.reliability}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="provenance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {language === "ar" ? "قواعد تتبع المصدر" : "Provenance Rules"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "المعايير التي نتبعها لضمان قابلية التتبع"
                    : "Standards we follow to ensure traceability"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {provenanceRules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">
                          {language === "ar" ? rule.titleAr : rule.titleEn}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "ar" ? rule.descriptionAr : rule.descriptionEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="corrections">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {language === "ar" ? "سياسة التصحيحات" : "Corrections Policy"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "كيف نتعامل مع الأخطاء والتحديثات"
                    : "How we handle errors and updates"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      {language === "ar" ? "الإبلاغ عن الأخطاء" : "Reporting Errors"}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {language === "ar"
                        ? "إذا وجدت خطأ في بياناتنا، يرجى الإبلاغ عنه عبر نموذج الاتصال أو البريد الإلكتروني. نحن نقدر مساهمات المجتمع في تحسين جودة البيانات."
                        : "If you find an error in our data, please report it via the contact form or email. We value community contributions to improving data quality."}
                    </p>
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      {language === "ar" ? "الإبلاغ عن خطأ" : "Report an Error"}
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {language === "ar" ? "عملية التصحيح" : "Correction Process"}
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>{language === "ar" ? "استلام التقرير والتحقق الأولي" : "Receive report and initial verification"}</li>
                      <li>{language === "ar" ? "مراجعة المصادر الأصلية" : "Review original sources"}</li>
                      <li>{language === "ar" ? "تحديث البيانات إذا تم التأكيد" : "Update data if confirmed"}</li>
                      <li>{language === "ar" ? "نشر ملاحظة التصحيح" : "Publish correction note"}</li>
                      <li>{language === "ar" ? "إخطار المستخدمين المتأثرين" : "Notify affected users"}</li>
                    </ol>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2">
                      {language === "ar" ? "سجل التصحيحات الأخيرة" : "Recent Corrections Log"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar"
                        ? "لا توجد تصحيحات حديثة."
                        : "No recent corrections."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Download Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {language === "ar" ? "تحميل الوثائق" : "Download Documentation"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start gap-2 h-auto py-4">
                <FileCheck className="h-5 w-5" />
                <div className="text-start">
                  <div className="font-medium">
                    {language === "ar" ? "دليل المنهجية الكامل" : "Full Methodology Guide"}
                  </div>
                  <div className="text-xs text-muted-foreground">PDF • 2.4 MB</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-4">
                <Database className="h-5 w-5" />
                <div className="text-start">
                  <div className="font-medium">
                    {language === "ar" ? "قاموس البيانات" : "Data Dictionary"}
                  </div>
                  <div className="text-xs text-muted-foreground">PDF • 1.1 MB</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
