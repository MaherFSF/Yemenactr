import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, ExternalLink, Database, Calendar, RefreshCw, 
  Shield, FileText, BarChart3, Globe, Building2, Download,
  CheckCircle, AlertCircle, Clock
} from "lucide-react";

// Source metadata with comprehensive details
const SOURCES_DATA: Record<string, {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  url: string;
  apiUrl?: string;
  category: string;
  categoryAr: string;
  confidence: string;
  coverage: string;
  updateFrequency: string;
  updateFrequencyAr: string;
  lastSync?: string;
  indicators: { code: string; name: string; nameAr: string; sector: string }[];
  methodology: string;
  methodologyAr: string;
  limitations: string[];
  limitationsAr: string[];
  dataFormat: string;
  accessType: string;
  license: string;
}> = {
  "world-bank": {
    id: "world-bank",
    name: "World Bank",
    nameAr: "البنك الدولي",
    description: "The World Bank's World Development Indicators (WDI) database provides comprehensive data on development, including economic, social, and environmental indicators for Yemen and other countries.",
    descriptionAr: "توفر قاعدة بيانات مؤشرات التنمية العالمية للبنك الدولي بيانات شاملة عن التنمية، بما في ذلك المؤشرات الاقتصادية والاجتماعية والبيئية لليمن والدول الأخرى.",
    url: "https://data.worldbank.org",
    apiUrl: "https://api.worldbank.org/v2",
    category: "International Organization",
    categoryAr: "منظمة دولية",
    confidence: "A",
    coverage: "1960-2024",
    updateFrequency: "Annual (April/October)",
    updateFrequencyAr: "سنوي (أبريل/أكتوبر)",
    lastSync: "2026-01-29",
    indicators: [
      { code: "NY.GDP.MKTP.CD", name: "GDP (current US$)", nameAr: "الناتج المحلي الإجمالي (بالدولار الأمريكي الجاري)", sector: "macroeconomy" },
      { code: "NY.GDP.MKTP.KD.ZG", name: "GDP growth (annual %)", nameAr: "نمو الناتج المحلي الإجمالي (سنوي %)", sector: "macroeconomy" },
      { code: "NY.GDP.PCAP.CD", name: "GDP per capita (current US$)", nameAr: "نصيب الفرد من الناتج المحلي الإجمالي", sector: "macroeconomy" },
      { code: "SP.POP.TOTL", name: "Population, total", nameAr: "إجمالي السكان", sector: "macroeconomy" },
      { code: "FP.CPI.TOTL.ZG", name: "Inflation, consumer prices (annual %)", nameAr: "التضخم، أسعار المستهلك (سنوي %)", sector: "prices" },
      { code: "SL.UEM.TOTL.ZS", name: "Unemployment rate", nameAr: "معدل البطالة", sector: "labor" },
      { code: "SI.POV.NAHC", name: "Poverty headcount ratio", nameAr: "نسبة الفقر", sector: "poverty" },
      { code: "BX.TRF.PWKR.CD.DT", name: "Personal remittances received", nameAr: "التحويلات الشخصية المستلمة", sector: "trade" },
      { code: "NE.EXP.GNFS.CD", name: "Exports of goods and services", nameAr: "صادرات السلع والخدمات", sector: "trade" },
      { code: "NE.IMP.GNFS.CD", name: "Imports of goods and services", nameAr: "واردات السلع والخدمات", sector: "trade" },
      { code: "FI.RES.TOTL.CD", name: "Total reserves", nameAr: "إجمالي الاحتياطيات", sector: "fiscal" },
      { code: "PA.NUS.FCRF", name: "Official exchange rate", nameAr: "سعر الصرف الرسمي", sector: "currency" },
    ],
    methodology: "World Bank data is compiled from officially-recognized international sources. Data undergoes rigorous quality checks and harmonization across countries. For Yemen, data gaps exist from 2019-present due to conflict.",
    methodologyAr: "يتم تجميع بيانات البنك الدولي من مصادر دولية معترف بها رسمياً. تخضع البيانات لفحوصات جودة صارمة ومواءمة عبر البلدان. بالنسبة لليمن، توجد فجوات في البيانات من 2019 حتى الآن بسبب النزاع.",
    limitations: [
      "Data gaps from 2019-present due to conflict",
      "Official statistics may not reflect informal economy",
      "Exchange rate data uses official rates, not parallel market",
      "Some indicators have 2-3 year lag"
    ],
    limitationsAr: [
      "فجوات في البيانات من 2019 حتى الآن بسبب النزاع",
      "قد لا تعكس الإحصاءات الرسمية الاقتصاد غير الرسمي",
      "تستخدم بيانات سعر الصرف الأسعار الرسمية وليس السوق الموازية",
      "بعض المؤشرات لديها تأخر 2-3 سنوات"
    ],
    dataFormat: "JSON/XML via API",
    accessType: "Open Access",
    license: "CC BY 4.0"
  },
  "imf": {
    id: "imf",
    name: "International Monetary Fund",
    nameAr: "صندوق النقد الدولي",
    description: "The IMF's World Economic Outlook (WEO) database provides macroeconomic data and projections for Yemen, including GDP growth, inflation, and fiscal indicators.",
    descriptionAr: "توفر قاعدة بيانات آفاق الاقتصاد العالمي لصندوق النقد الدولي بيانات وتوقعات اقتصادية كلية لليمن، بما في ذلك نمو الناتج المحلي الإجمالي والتضخم والمؤشرات المالية.",
    url: "https://www.imf.org/en/Data",
    apiUrl: "https://www.imf.org/external/datamapper/api/v1",
    category: "International Organization",
    categoryAr: "منظمة دولية",
    confidence: "A",
    coverage: "1980-2029 (projections)",
    updateFrequency: "Semi-annual (April/October)",
    updateFrequencyAr: "نصف سنوي (أبريل/أكتوبر)",
    lastSync: "2026-01-29",
    indicators: [
      { code: "NGDP_RPCH", name: "Real GDP Growth", nameAr: "نمو الناتج المحلي الإجمالي الحقيقي", sector: "macroeconomy" },
      { code: "PCPIPCH", name: "Inflation Rate (CPI)", nameAr: "معدل التضخم (مؤشر أسعار المستهلك)", sector: "prices" },
      { code: "GGXCNL_NGDP", name: "Government Net Lending/Borrowing", nameAr: "صافي الإقراض/الاقتراض الحكومي", sector: "fiscal" },
      { code: "BCA_NGDPD", name: "Current Account Balance", nameAr: "رصيد الحساب الجاري", sector: "trade" },
    ],
    methodology: "IMF data combines official government statistics with IMF staff estimates and projections. Data is reviewed by country teams and undergoes multilateral consistency checks.",
    methodologyAr: "تجمع بيانات صندوق النقد الدولي بين الإحصاءات الحكومية الرسمية وتقديرات وتوقعات موظفي الصندوق. تتم مراجعة البيانات من قبل فرق الدول وتخضع لفحوصات اتساق متعددة الأطراف.",
    limitations: [
      "Projections carry significant uncertainty for conflict countries",
      "Limited ground verification possible",
      "Relies partly on government-reported data"
    ],
    limitationsAr: [
      "التوقعات تحمل عدم يقين كبير لدول النزاع",
      "إمكانية محدودة للتحقق الميداني",
      "تعتمد جزئياً على البيانات المبلغ عنها من الحكومة"
    ],
    dataFormat: "JSON via API",
    accessType: "Open Access",
    license: "IMF Terms of Use"
  },
  "wfp": {
    id: "wfp",
    name: "World Food Programme",
    nameAr: "برنامج الأغذية العالمي",
    description: "WFP's Vulnerability Analysis and Mapping (VAM) provides food security data for Yemen, including food prices, market functionality, and food insecurity prevalence.",
    descriptionAr: "يوفر تحليل الضعف ورسم الخرائط التابع لبرنامج الأغذية العالمي بيانات الأمن الغذائي لليمن، بما في ذلك أسعار الغذاء ووظائف السوق وانتشار انعدام الأمن الغذائي.",
    url: "https://www.wfp.org",
    apiUrl: "https://api.vam.wfp.org",
    category: "UN Agency",
    categoryAr: "وكالة أممية",
    confidence: "A",
    coverage: "2015-present",
    updateFrequency: "Monthly",
    updateFrequencyAr: "شهري",
    lastSync: "2026-01-29",
    indicators: [
      { code: "FOOD_INSECURITY", name: "Food Insecurity Prevalence", nameAr: "انتشار انعدام الأمن الغذائي", sector: "food_security" },
      { code: "WHEAT_PRICE", name: "Wheat Flour Price", nameAr: "سعر دقيق القمح", sector: "food_security" },
      { code: "RICE_PRICE", name: "Rice Price", nameAr: "سعر الأرز", sector: "food_security" },
      { code: "COOKING_OIL_PRICE", name: "Cooking Oil Price", nameAr: "سعر زيت الطهي", sector: "food_security" },
      { code: "MEB_COST", name: "Minimum Expenditure Basket Cost", nameAr: "تكلفة سلة الإنفاق الأدنى", sector: "food_security" },
    ],
    methodology: "WFP conducts regular market monitoring and household surveys across Yemen. Data is collected from 22 governorates through a network of field monitors and verified through triangulation.",
    methodologyAr: "يجري برنامج الأغذية العالمي مراقبة منتظمة للأسواق ومسوحات للأسر في جميع أنحاء اليمن. يتم جمع البيانات من 22 محافظة من خلال شبكة من المراقبين الميدانيين والتحقق منها من خلال التثليث.",
    limitations: [
      "Access restrictions in some areas",
      "Price data may vary by market",
      "Household surveys have sampling limitations"
    ],
    limitationsAr: [
      "قيود الوصول في بعض المناطق",
      "قد تختلف بيانات الأسعار حسب السوق",
      "مسوحات الأسر لها قيود في أخذ العينات"
    ],
    dataFormat: "JSON/CSV",
    accessType: "Open Access",
    license: "UN Data License"
  },
  "ocha": {
    id: "ocha",
    name: "UN OCHA",
    nameAr: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية",
    description: "OCHA's Financial Tracking Service (FTS) provides comprehensive data on humanitarian funding flows to Yemen, including requirements, contributions, and coverage rates.",
    descriptionAr: "توفر خدمة التتبع المالي التابعة لمكتب تنسيق الشؤون الإنسانية بيانات شاملة عن تدفقات التمويل الإنساني إلى اليمن، بما في ذلك المتطلبات والمساهمات ومعدلات التغطية.",
    url: "https://fts.unocha.org",
    apiUrl: "https://api.hpc.tools/v1/public/fts",
    category: "UN Agency",
    categoryAr: "وكالة أممية",
    confidence: "A",
    coverage: "2015-present",
    updateFrequency: "Real-time",
    updateFrequencyAr: "في الوقت الفعلي",
    lastSync: "2026-01-29",
    indicators: [
      { code: "HRP_REQUIREMENTS", name: "HRP Requirements", nameAr: "متطلبات خطة الاستجابة الإنسانية", sector: "humanitarian" },
      { code: "HRP_FUNDING", name: "HRP Funding Received", nameAr: "التمويل المستلم لخطة الاستجابة", sector: "humanitarian" },
      { code: "HRP_COVERAGE", name: "HRP Coverage Rate", nameAr: "معدل تغطية خطة الاستجابة", sector: "humanitarian" },
    ],
    methodology: "FTS tracks all reported humanitarian funding flows. Data is self-reported by donors and implementing organizations, with OCHA verification and reconciliation.",
    methodologyAr: "تتتبع خدمة التتبع المالي جميع تدفقات التمويل الإنساني المبلغ عنها. يتم الإبلاغ عن البيانات ذاتياً من قبل المانحين والمنظمات المنفذة، مع التحقق والمصالحة من قبل مكتب تنسيق الشؤون الإنسانية.",
    limitations: [
      "Self-reported data may have delays",
      "Some private funding may not be captured",
      "In-kind contributions harder to track"
    ],
    limitationsAr: [
      "قد يكون للبيانات المبلغ عنها ذاتياً تأخيرات",
      "قد لا يتم رصد بعض التمويل الخاص",
      "المساهمات العينية أصعب في التتبع"
    ],
    dataFormat: "JSON via API",
    accessType: "Open Access",
    license: "UN Data License"
  },
  "cby-aden": {
    id: "cby-aden",
    name: "Central Bank of Yemen - Aden",
    nameAr: "البنك المركزي اليمني - عدن",
    description: "The Central Bank of Yemen in Aden (IRG-controlled) provides official monetary and banking sector data for areas under the internationally recognized government.",
    descriptionAr: "يوفر البنك المركزي اليمني في عدن (الخاضع للحكومة المعترف بها دولياً) بيانات رسمية عن القطاع النقدي والمصرفي للمناطق الخاضعة للحكومة المعترف بها دولياً.",
    url: "https://cby-ye.com",
    category: "Government - IRG",
    categoryAr: "حكومي - الحكومة المعترف بها دولياً",
    confidence: "B",
    coverage: "2017-present",
    updateFrequency: "Monthly/Quarterly",
    updateFrequencyAr: "شهري/ربع سنوي",
    lastSync: "2026-01-29",
    indicators: [
      { code: "EXCHANGE_RATE_ADEN", name: "Exchange Rate (Aden)", nameAr: "سعر الصرف (عدن)", sector: "currency" },
      { code: "FOREIGN_RESERVES_ADEN", name: "Foreign Reserves (Aden)", nameAr: "الاحتياطيات الأجنبية (عدن)", sector: "fiscal" },
      { code: "MONEY_SUPPLY_ADEN", name: "Money Supply (Aden)", nameAr: "العرض النقدي (عدن)", sector: "monetary" },
      { code: "BANK_DEPOSITS_ADEN", name: "Bank Deposits (Aden)", nameAr: "الودائع المصرفية (عدن)", sector: "banking" },
    ],
    methodology: "CBY-Aden publishes official statistics based on data from commercial banks operating in IRG-controlled areas. Data reflects the formal banking sector only.",
    methodologyAr: "ينشر البنك المركزي في عدن إحصاءات رسمية بناءً على بيانات من البنوك التجارية العاملة في المناطق الخاضعة للحكومة المعترف بها دولياً. تعكس البيانات القطاع المصرفي الرسمي فقط.",
    limitations: [
      "Only covers IRG-controlled areas",
      "Does not capture informal money exchange",
      "Limited data on Sana'a-controlled areas",
      "Publication delays possible"
    ],
    limitationsAr: [
      "تغطي فقط المناطق الخاضعة للحكومة المعترف بها دولياً",
      "لا ترصد الصرافة غير الرسمية",
      "بيانات محدودة عن المناطق الخاضعة لصنعاء",
      "تأخيرات في النشر محتملة"
    ],
    dataFormat: "PDF Reports",
    accessType: "Public Reports",
    license: "Government Publication"
  },
  "unhcr": {
    id: "unhcr",
    name: "UNHCR",
    nameAr: "المفوضية السامية للأمم المتحدة لشؤون اللاجئين",
    description: "UNHCR provides data on internally displaced persons (IDPs), refugees, and asylum seekers in Yemen, including displacement trends and protection needs.",
    descriptionAr: "توفر المفوضية السامية للأمم المتحدة لشؤون اللاجئين بيانات عن النازحين داخلياً واللاجئين وطالبي اللجوء في اليمن، بما في ذلك اتجاهات النزوح واحتياجات الحماية.",
    url: "https://www.unhcr.org",
    apiUrl: "https://api.unhcr.org/population/v1",
    category: "UN Agency",
    categoryAr: "وكالة أممية",
    confidence: "A",
    coverage: "2010-present",
    updateFrequency: "Monthly",
    updateFrequencyAr: "شهري",
    lastSync: "2026-01-29",
    indicators: [
      { code: "IDPS", name: "Internally Displaced Persons", nameAr: "النازحون داخلياً", sector: "humanitarian" },
      { code: "REFUGEES", name: "Refugees in Yemen", nameAr: "اللاجئون في اليمن", sector: "humanitarian" },
      { code: "RETURNEES", name: "IDP Returnees", nameAr: "العائدون من النازحين", sector: "humanitarian" },
    ],
    methodology: "UNHCR works with IOM and local partners to track displacement through the Displacement Tracking Matrix (DTM) and registration systems.",
    methodologyAr: "تعمل المفوضية مع المنظمة الدولية للهجرة والشركاء المحليين لتتبع النزوح من خلال مصفوفة تتبع النزوح وأنظمة التسجيل.",
    limitations: [
      "Access constraints in some areas",
      "Unregistered IDPs may not be counted",
      "Rapid displacement harder to track"
    ],
    limitationsAr: [
      "قيود الوصول في بعض المناطق",
      "قد لا يتم احتساب النازحين غير المسجلين",
      "النزوح السريع أصعب في التتبع"
    ],
    dataFormat: "JSON via API",
    accessType: "Open Access",
    license: "UN Data License"
  }
};

export default function SourceDetail() {
  const [, params] = useRoute("/source/:sourceId");
  const { language, t } = useLanguage();
  const isArabic = language === "ar";
  
  const sourceId = params?.sourceId || "";
  const source = SOURCES_DATA[sourceId];
  
  if (!source) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isArabic ? "المصدر غير موجود" : "Source Not Found"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {isArabic 
                ? "المصدر المطلوب غير متوفر في قاعدة البيانات."
                : "The requested source is not available in our database."}
            </p>
            <Link href="/methodology">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isArabic ? "العودة للمنهجية" : "Back to Methodology"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const confidenceColors: Record<string, string> = {
    "A": "bg-green-500",
    "B": "bg-blue-500",
    "C": "bg-yellow-500",
    "D": "bg-orange-500",
    "E": "bg-red-500"
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container py-8">
          <Link href="/methodology" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {isArabic ? "العودة للمنهجية" : "Back to Methodology"}
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {isArabic ? source.nameAr : source.name}
                </h1>
                <Badge className={`${confidenceColors[source.confidence]} text-white`}>
                  {isArabic ? `ثقة ${source.confidence}` : `Confidence ${source.confidence}`}
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {isArabic ? source.descriptionAr : source.description}
              </p>
            </div>
            
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                {isArabic ? "زيارة المصدر" : "Visit Source"}
              </Button>
            </a>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-background rounded-lg p-4 border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Building2 className="h-4 w-4" />
                {isArabic ? "الفئة" : "Category"}
              </div>
              <div className="font-medium">{isArabic ? source.categoryAr : source.category}</div>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Database className="h-4 w-4" />
                {isArabic ? "المؤشرات" : "Indicators"}
              </div>
              <div className="font-medium">{source.indicators.length}</div>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Calendar className="h-4 w-4" />
                {isArabic ? "التغطية" : "Coverage"}
              </div>
              <div className="font-medium">{source.coverage}</div>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <RefreshCw className="h-4 w-4" />
                {isArabic ? "التحديث" : "Update"}
              </div>
              <div className="font-medium text-sm">{isArabic ? source.updateFrequencyAr : source.updateFrequency}</div>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Clock className="h-4 w-4" />
                {isArabic ? "آخر مزامنة" : "Last Sync"}
              </div>
              <div className="font-medium">{source.lastSync || "N/A"}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="container py-8">
        <Tabs defaultValue="indicators" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="indicators">
              <BarChart3 className="h-4 w-4 mr-2" />
              {isArabic ? "المؤشرات" : "Indicators"}
            </TabsTrigger>
            <TabsTrigger value="methodology">
              <FileText className="h-4 w-4 mr-2" />
              {isArabic ? "المنهجية" : "Methodology"}
            </TabsTrigger>
            <TabsTrigger value="limitations">
              <AlertCircle className="h-4 w-4 mr-2" />
              {isArabic ? "القيود" : "Limitations"}
            </TabsTrigger>
            <TabsTrigger value="access">
              <Globe className="h-4 w-4 mr-2" />
              {isArabic ? "الوصول" : "Access"}
            </TabsTrigger>
          </TabsList>
          
          {/* Indicators Tab */}
          <TabsContent value="indicators">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "المؤشرات المتاحة" : "Available Indicators"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? `${source.indicators.length} مؤشر متاح من هذا المصدر`
                    : `${source.indicators.length} indicators available from this source`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {source.indicators.map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          {isArabic ? indicator.nameAr : indicator.name}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {indicator.code}
                        </div>
                      </div>
                      <Badge variant="outline">{indicator.sector}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Methodology Tab */}
          <TabsContent value="methodology">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "منهجية جمع البيانات" : "Data Collection Methodology"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {isArabic ? source.methodologyAr : source.methodology}
                </p>
                
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium mb-2">
                    <CheckCircle className="h-5 w-5" />
                    {isArabic ? "التحقق من الجودة" : "Quality Verification"}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    {isArabic 
                      ? "يتم التحقق من جميع البيانات من هذا المصدر مقابل مصادر متعددة قبل النشر على منصة YETO."
                      : "All data from this source is verified against multiple sources before publication on the YETO platform."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Limitations Tab */}
          <TabsContent value="limitations">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "القيود والتحذيرات" : "Limitations & Caveats"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? "عوامل مهمة يجب مراعاتها عند استخدام هذه البيانات"
                    : "Important factors to consider when using this data"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(isArabic ? source.limitationsAr : source.limitations).map((limitation, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-yellow-700 dark:text-yellow-400">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Access Tab */}
          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "معلومات الوصول" : "Access Information"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {isArabic ? "نوع الوصول" : "Access Type"}
                      </div>
                      <div className="font-medium">{source.accessType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {isArabic ? "تنسيق البيانات" : "Data Format"}
                      </div>
                      <div className="font-medium">{source.dataFormat}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {isArabic ? "الترخيص" : "License"}
                      </div>
                      <div className="font-medium">{source.license}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {isArabic ? "الموقع الرسمي" : "Official Website"}
                      </div>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {source.url}
                      </a>
                    </div>
                    {source.apiUrl && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {isArabic ? "نقطة نهاية API" : "API Endpoint"}
                        </div>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{source.apiUrl}</code>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    <Button>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {isArabic ? "زيارة المصدر" : "Visit Source"}
                    </Button>
                  </a>
                  <Link href="/data-repository">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      {isArabic ? "تصفح البيانات" : "Browse Data"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
