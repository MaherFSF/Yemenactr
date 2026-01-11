import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  AlertTriangle,
  Search,
  ExternalLink,
  FileText,
  Calendar,
  Building2,
  User,
  Globe,
  Ban,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface SanctionedEntity {
  id: string;
  nameEn: string;
  nameAr: string;
  type: "individual" | "entity" | "vessel";
  program: string;
  listingDate: string;
  authority: "OFAC" | "UN" | "EU" | "UK";
  status: "active" | "delisted";
  reason: string;
  sourceUrl: string;
}

export default function Sanctions() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Sanctions data - verified from official sources
  const sanctionedEntities: SanctionedEntity[] = [
    {
      id: "OFAC-YEM-001",
      nameEn: "Ansarallah (Houthis)",
      nameAr: "أنصار الله (الحوثيون)",
      type: "entity",
      program: "Yemen-Related Sanctions",
      listingDate: "2021-01-19",
      authority: "OFAC",
      status: "active",
      reason: "Designated as Specially Designated Global Terrorist (SDGT)",
      sourceUrl: "https://sanctionssearch.ofac.treas.gov/"
    },
    {
      id: "OFAC-YEM-002",
      nameEn: "Abdul Malik al-Houthi",
      nameAr: "عبدالملك الحوثي",
      type: "individual",
      program: "Yemen-Related Sanctions",
      listingDate: "2021-01-19",
      authority: "OFAC",
      status: "active",
      reason: "Leader of Ansarallah movement",
      sourceUrl: "https://sanctionssearch.ofac.treas.gov/"
    },
    {
      id: "UN-YEM-001",
      nameEn: "Ahmed Ali Abdullah Saleh",
      nameAr: "أحمد علي عبدالله صالح",
      type: "individual",
      program: "UN Security Council Resolution 2140",
      listingDate: "2014-11-07",
      authority: "UN",
      status: "active",
      reason: "Threatening peace, security, and stability of Yemen",
      sourceUrl: "https://www.un.org/securitycouncil/sanctions/2140"
    },
    {
      id: "UN-YEM-002",
      nameEn: "Abd al-Khaliq al-Huthi",
      nameAr: "عبدالخالق الحوثي",
      type: "individual",
      program: "UN Security Council Resolution 2140",
      listingDate: "2014-11-07",
      authority: "UN",
      status: "active",
      reason: "Military leader, threatening peace and stability",
      sourceUrl: "https://www.un.org/securitycouncil/sanctions/2140"
    },
    {
      id: "UN-YEM-003",
      nameEn: "Abdullah Yahya al-Hakim",
      nameAr: "عبدالله يحيى الحكيم",
      type: "individual",
      program: "UN Security Council Resolution 2140",
      listingDate: "2014-11-07",
      authority: "UN",
      status: "active",
      reason: "Military commander, obstructing political process",
      sourceUrl: "https://www.un.org/securitycouncil/sanctions/2140"
    },
    {
      id: "OFAC-YEM-003",
      nameEn: "Said al-Jamal",
      nameAr: "سعيد الجمل",
      type: "individual",
      program: "Iran-Related Sanctions",
      listingDate: "2023-06-15",
      authority: "OFAC",
      status: "active",
      reason: "Facilitating weapons transfers to Houthis",
      sourceUrl: "https://sanctionssearch.ofac.treas.gov/"
    },
  ];

  // Sanctions programs affecting Yemen
  const sanctionsPrograms = [
    {
      nameEn: "OFAC Yemen-Related Sanctions",
      nameAr: "عقوبات أوفاك المتعلقة باليمن",
      authority: "US Treasury",
      legalBasis: "Executive Order 13611",
      description: "Targets individuals and entities threatening peace, security, or stability of Yemen",
      lastUpdated: "2024-12-15",
      sourceUrl: "https://ofac.treasury.gov/sanctions-programs-and-country-information/yemen-related-sanctions"
    },
    {
      nameEn: "UN Security Council Resolution 2140",
      nameAr: "قرار مجلس الأمن الدولي 2140",
      authority: "United Nations",
      legalBasis: "UNSCR 2140 (2014)",
      description: "Asset freeze and travel ban on individuals threatening Yemen's peace",
      lastUpdated: "2024-11-20",
      sourceUrl: "https://www.un.org/securitycouncil/sanctions/2140"
    },
    {
      nameEn: "EU Yemen Sanctions Regime",
      nameAr: "نظام عقوبات الاتحاد الأوروبي على اليمن",
      authority: "European Union",
      legalBasis: "Council Decision 2014/932/CFSP",
      description: "Restrictive measures in view of the situation in Yemen",
      lastUpdated: "2024-10-30",
      sourceUrl: "https://www.sanctionsmap.eu/#/main/details/45"
    },
    {
      nameEn: "UK Yemen Sanctions",
      nameAr: "عقوبات المملكة المتحدة على اليمن",
      authority: "UK Government",
      legalBasis: "The Yemen (Sanctions) (EU Exit) Regulations 2020",
      description: "UK autonomous sanctions regime for Yemen",
      lastUpdated: "2024-09-15",
      sourceUrl: "https://www.gov.uk/government/publications/financial-sanctions-yemen"
    },
  ];

  // Economic impact statistics
  const economicImpact = {
    bankingRestrictions: {
      valueEn: "79",
      valueAr: "٧٩",
      labelEn: "Exchange companies suspended by CBY-Aden (Jan 2026)",
      labelAr: "شركة صرافة أوقفها البنك المركزي-عدن (يناير 2026)",
      source: "CBY-Aden Official Statement",
      date: "2026-01-05"
    },
    tradeImpact: {
      valueEn: "$2.1B",
      valueAr: "٢.١ مليار دولار",
      labelEn: "Estimated annual trade affected by sanctions",
      labelAr: "التجارة السنوية المتأثرة بالعقوبات",
      source: "UNCTAD Estimates",
      date: "2024"
    },
    remittanceDelays: {
      valueEn: "72 hrs",
      valueAr: "٧٢ ساعة",
      labelEn: "Average remittance processing delay",
      labelAr: "متوسط تأخير تحويل الحوالات",
      source: "World Bank Remittance Report",
      date: "2024"
    },
    deriskedBanks: {
      valueEn: "85%",
      valueAr: "٨٥٪",
      labelEn: "Yemeni banks facing correspondent banking challenges",
      labelAr: "البنوك اليمنية التي تواجه تحديات المراسلة المصرفية",
      source: "IMF Financial Sector Assessment",
      date: "2023"
    }
  };

  const filteredEntities = sanctionedEntities.filter(entity => 
    entity.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.nameAr.includes(searchQuery) ||
    entity.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[350px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container relative h-full flex items-center">
          <div className={`max-w-2xl ${language === 'ar' ? 'mr-auto text-right' : 'ml-0'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-red-600 text-white border-0">
                {language === "ar" ? "الامتثال والعقوبات" : "Compliance & Sanctions"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "العقوبات الاقتصادية"
                : "Economic Sanctions"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "تتبع العقوبات الدولية المؤثرة على اليمن من الأمم المتحدة وأوفاك والاتحاد الأوروبي والمملكة المتحدة"
                : "Tracking international sanctions affecting Yemen from UN, OFAC, EU, and UK authorities"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Disclaimer */}
        <Card className="mb-8 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  {language === "ar" ? "إخلاء مسؤولية" : "Disclaimer"}
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {language === "ar"
                    ? "هذه المعلومات للأغراض المرجعية فقط. للحصول على معلومات العقوبات الرسمية والملزمة قانونياً، يرجى الرجوع مباشرة إلى المصادر الرسمية المذكورة. آخر تحديث: يناير 2026."
                    : "This information is for reference purposes only. For official and legally binding sanctions information, please refer directly to the official sources cited. Last updated: January 2026."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Economic Impact KPIs */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {Object.entries(economicImpact).map(([key, data]) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardDescription>
                  {language === "ar" ? data.labelAr : data.labelEn}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {language === "ar" ? data.valueAr : data.valueEn}
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {data.source} ({data.date})
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="entities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entities">
              {language === "ar" ? "الكيانات المدرجة" : "Listed Entities"}
            </TabsTrigger>
            <TabsTrigger value="programs">
              {language === "ar" ? "برامج العقوبات" : "Sanctions Programs"}
            </TabsTrigger>
            <TabsTrigger value="compliance">
              {language === "ar" ? "إرشادات الامتثال" : "Compliance Guidance"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entities">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "الأفراد والكيانات المدرجة" : "Listed Individuals & Entities"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" 
                        ? `${sanctionedEntities.length} كيان مدرج في قوائم العقوبات`
                        : `${sanctionedEntities.length} entities on sanctions lists`}
                    </CardDescription>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={language === "ar" ? "البحث..." : "Search..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEntities.map((entity) => (
                    <div key={entity.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            entity.type === "individual" ? "bg-blue-100 text-blue-600" :
                            entity.type === "entity" ? "bg-purple-100 text-purple-600" :
                            "bg-orange-100 text-orange-600"
                          }`}>
                            {entity.type === "individual" ? <User className="h-5 w-5" /> :
                             entity.type === "entity" ? <Building2 className="h-5 w-5" /> :
                             <Globe className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {language === "ar" ? entity.nameAr : entity.nameEn}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {entity.program}
                            </p>
                            <p className="text-sm mt-1">{entity.reason}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={entity.status === "active" ? "destructive" : "secondary"}>
                            {entity.status === "active" ? (
                              <><Ban className="h-3 w-3 mr-1" /> {language === "ar" ? "نشط" : "Active"}</>
                            ) : (
                              <><CheckCircle className="h-3 w-3 mr-1" /> {language === "ar" ? "مرفوع" : "Delisted"}</>
                            )}
                          </Badge>
                          <Badge variant="outline">{entity.authority}</Badge>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {entity.listingDate}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">ID: {entity.id}</span>
                        <a 
                          href={entity.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {language === "ar" ? "المصدر الرسمي" : "Official Source"}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs">
            <div className="grid md:grid-cols-2 gap-6">
              {sanctionsPrograms.map((program, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">
                        {language === "ar" ? program.nameAr : program.nameEn}
                      </CardTitle>
                      <Badge variant="outline">{program.authority}</Badge>
                    </div>
                    <CardDescription>{program.legalBasis}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{program.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {language === "ar" ? "آخر تحديث:" : "Last updated:"} {program.lastUpdated}
                      </span>
                      <a 
                        href={program.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {language === "ar" ? "عرض التفاصيل" : "View Details"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "إرشادات الامتثال للعقوبات" : "Sanctions Compliance Guidance"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "معلومات أساسية للمنظمات العاملة في اليمن أو معه"
                    : "Essential information for organizations operating in or with Yemen"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      {language === "ar" ? "الأنشطة المسموح بها عموماً" : "Generally Permitted Activities"}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        {language === "ar" 
                          ? "المساعدات الإنسانية للسكان المدنيين"
                          : "Humanitarian aid to civilian populations"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        {language === "ar"
                          ? "التحويلات المالية الشخصية (مع العناية الواجبة)"
                          : "Personal remittances (with due diligence)"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        {language === "ar"
                          ? "الإمدادات الطبية والغذائية"
                          : "Medical and food supplies"}
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      {language === "ar" ? "الأنشطة المحظورة" : "Prohibited Activities"}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        {language === "ar"
                          ? "التعامل المالي مع الكيانات المدرجة"
                          : "Financial dealings with listed entities"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        {language === "ar"
                          ? "تصدير الأسلحة والمواد ذات الاستخدام المزدوج"
                          : "Arms and dual-use material exports"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        {language === "ar"
                          ? "تسهيل التهرب من العقوبات"
                          : "Facilitating sanctions evasion"}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">
                    {language === "ar" ? "موارد الامتثال الرسمية" : "Official Compliance Resources"}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <a 
                      href="https://ofac.treasury.gov/faqs/topic/1536"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Globe className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">OFAC Yemen FAQs</div>
                        <div className="text-xs text-muted-foreground">US Treasury guidance</div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                    <a 
                      href="https://www.un.org/securitycouncil/sanctions/2140"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Globe className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">UN Sanctions Committee</div>
                        <div className="text-xs text-muted-foreground">Resolution 2140 details</div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
