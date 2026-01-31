import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle,
  Globe,
  Users,
  DollarSign,
  Target,
  ExternalLink
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function HumanitarianFunding() {
  const { language } = useLanguage();

  // Yemen HRP funding data (OCHA FTS)
  const fundingTrends = [
    { year: "2015", requested: 1.6, received: 0.89, coverage: 56 },
    { year: "2016", requested: 1.8, received: 1.07, coverage: 59 },
    { year: "2017", requested: 2.1, received: 1.54, coverage: 73 },
    { year: "2018", requested: 2.96, received: 2.58, coverage: 87 },
    { year: "2019", requested: 4.19, received: 3.63, coverage: 87 },
    { year: "2020", requested: 3.38, received: 1.86, coverage: 55 },
    { year: "2021", requested: 3.85, received: 2.27, coverage: 59 },
    { year: "2022", requested: 4.27, received: 2.07, coverage: 48 },
    { year: "2023", requested: 4.34, received: 1.69, coverage: 39 },
    { year: "2024", requested: 2.70, received: 1.35, coverage: 50 },
    { year: "2025", requested: 2.50, received: 0.42, coverage: 17 },
  ];

  // Top donors (2024)
  const topDonors = [
    { nameEn: "United States", nameAr: "الولايات المتحدة", amount: 485, percentage: 36, color: "#1e40af" },
    { nameEn: "European Commission", nameAr: "المفوضية الأوروبية", amount: 178, percentage: 13, color: "#2e6b4f" },
    { nameEn: "Germany", nameAr: "ألمانيا", amount: 142, percentage: 11, color: "#C0A030" },
    { nameEn: "United Kingdom", nameAr: "المملكة المتحدة", amount: 98, percentage: 7, color: "#7c3aed" },
    { nameEn: "Saudi Arabia", nameAr: "السعودية", amount: 85, percentage: 6, color: "#059669" },
    { nameEn: "UAE", nameAr: "الإمارات", amount: 72, percentage: 5, color: "#dc2626" },
    { nameEn: "Japan", nameAr: "اليابان", amount: 65, percentage: 5, color: "#f59e0b" },
    { nameEn: "Other", nameAr: "أخرى", amount: 225, percentage: 17, color: "#6b7280" },
  ];

  // Funding by sector (2024)
  const sectorFunding = [
    { nameEn: "Food Security", nameAr: "الأمن الغذائي", requested: 1200, received: 580, coverage: 48 },
    { nameEn: "Health", nameAr: "الصحة", requested: 420, received: 195, coverage: 46 },
    { nameEn: "WASH", nameAr: "المياه والصرف الصحي", requested: 380, received: 142, coverage: 37 },
    { nameEn: "Protection", nameAr: "الحماية", requested: 210, received: 78, coverage: 37 },
    { nameEn: "Education", nameAr: "التعليم", requested: 185, received: 52, coverage: 28 },
    { nameEn: "Shelter/NFI", nameAr: "المأوى", requested: 165, received: 68, coverage: 41 },
    { nameEn: "Nutrition", nameAr: "التغذية", requested: 140, received: 95, coverage: 68 },
  ];

  // Key implementing partners
  const implementingPartners = [
    { nameEn: "WFP", nameAr: "برنامج الغذاء العالمي", funding: 520, beneficiaries: "13M" },
    { nameEn: "UNICEF", nameAr: "اليونيسف", funding: 185, beneficiaries: "8.5M" },
    { nameEn: "WHO", nameAr: "منظمة الصحة العالمية", funding: 95, beneficiaries: "12M" },
    { nameEn: "UNHCR", nameAr: "المفوضية السامية للاجئين", funding: 78, beneficiaries: "1.2M" },
    { nameEn: "IOM", nameAr: "المنظمة الدولية للهجرة", funding: 65, beneficiaries: "2.8M" },
    { nameEn: "UNDP", nameAr: "برنامج الأمم المتحدة الإنمائي", funding: 52, beneficiaries: "3.5M" },
  ];

  // KPIs
  const kpis = [
    {
      titleEn: "2025 HRP Requirement",
      titleAr: "متطلبات خطة الاستجابة 2025",
      value: "$2.5B",
      subtext: language === "ar" ? "للاحتياجات الإنسانية" : "for humanitarian needs",
      source: "OCHA Yemen HRP 2025",
      confidence: "A"
    },
    {
      titleEn: "Funding Received (Jan 2025)",
      titleAr: "التمويل المستلم (يناير 2025)",
      value: "$420M",
      subtext: language === "ar" ? "17% من المطلوب" : "17% of requirement",
      source: "OCHA FTS",
      confidence: "A"
    },
    {
      titleEn: "People in Need",
      titleAr: "الأشخاص المحتاجون",
      value: "18.2M",
      subtext: language === "ar" ? "من أصل 33 مليون" : "out of 33 million",
      source: "OCHA HNO 2025",
      confidence: "A"
    },
    {
      titleEn: "Funding Gap",
      titleAr: "فجوة التمويل",
      value: "$2.08B",
      subtext: language === "ar" ? "83% غير ممول" : "83% unfunded",
      source: "OCHA FTS",
      confidence: "A"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[350px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-cyan-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container relative h-full flex items-center">
          <div className={`max-w-2xl ${language === 'ar' ? 'mr-auto text-right' : 'ml-0'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-cyan-500 text-white border-0">
                {language === "ar" ? "الاستجابة الإنسانية" : "Humanitarian Response"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "التمويل الإنساني"
                : "Humanitarian Funding"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "تتبع تمويل خطة الاستجابة الإنسانية لليمن من OCHA FTS"
                : "Tracking Yemen Humanitarian Response Plan funding from OCHA FTS"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Funding Gap Alert */}
        <Card className="mb-8 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                  {language === "ar" ? "تحذير: فجوة تمويل حرجة" : "Warning: Critical Funding Gap"}
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {language === "ar"
                    ? "خطة الاستجابة الإنسانية لليمن 2025 ممولة بنسبة 17% فقط. بدون تمويل إضافي عاجل، ستضطر الوكالات الإنسانية لتقليص المساعدات لملايين اليمنيين."
                    : "Yemen's 2025 HRP is only 17% funded. Without urgent additional funding, humanitarian agencies will be forced to cut assistance to millions of Yemenis."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between">
                  <span>{language === "ar" ? kpi.titleAr : kpi.titleEn}</span>
                  <Badge variant="outline" className="text-xs">{kpi.confidence}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{kpi.subtext}</p>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {kpi.source}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">
              {language === "ar" ? "الاتجاهات" : "Trends"}
            </TabsTrigger>
            <TabsTrigger value="donors">
              {language === "ar" ? "المانحون" : "Donors"}
            </TabsTrigger>
            <TabsTrigger value="sectors">
              {language === "ar" ? "القطاعات" : "Sectors"}
            </TabsTrigger>
            <TabsTrigger value="partners">
              {language === "ar" ? "الشركاء" : "Partners"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "تمويل خطة الاستجابة الإنسانية (2015-2025)" : "HRP Funding (2015-2025)"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "مليار دولار أمريكي" : "USD Billions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={fundingTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" domain={[0, 5]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="requested" 
                      fill="#e5e7eb"
                      name={language === "ar" ? "المطلوب ($B)" : "Requested ($B)"}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="received" 
                      fill="#2e6b4f"
                      name={language === "ar" ? "المستلم ($B)" : "Received ($B)"}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="coverage" 
                      stroke="#C0A030" 
                      strokeWidth={2}
                      name={language === "ar" ? "نسبة التغطية %" : "Coverage %"}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {language === "ar"
                      ? "ملاحظة: انخفضت نسبة تغطية التمويل بشكل حاد منذ 2020 بسبب \"إرهاق المانحين\" والأزمات الإنسانية المتنافسة عالمياً."
                      : "Note: Funding coverage has dropped sharply since 2020 due to 'donor fatigue' and competing global humanitarian crises."}
                  </p>
                  <a 
                    href="https://fts.unocha.org/countries/248/summary/2025"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                  >
                    {language === "ar" ? "المصدر: OCHA FTS" : "Source: OCHA FTS"}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donors">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "أكبر المانحين (2024)" : "Top Donors (2024)"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "التوزيع حسب المانح" : "Distribution by donor"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={topDonors}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="percentage"
                        label={({ percentage }) => `${percentage}%`}
                      >
                        {topDonors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        formatter={(value, entry: any) => 
                          language === "ar" 
                            ? topDonors.find(s => s.nameEn === value)?.nameAr 
                            : value
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "مساهمات المانحين" : "Donor Contributions"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "مليون دولار أمريكي (2024)" : "USD Millions (2024)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topDonors.map((donor, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium">
                          {language === "ar" ? donor.nameAr : donor.nameEn}
                        </div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full"
                              style={{ width: `${donor.percentage}%`, backgroundColor: donor.color }}
                            />
                          </div>
                        </div>
                        <div className="w-16 text-sm text-right">
                          ${donor.amount}M
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sectors">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "التمويل حسب القطاع (2024)" : "Funding by Sector (2024)"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "مليون دولار أمريكي" : "USD Millions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {sectorFunding.map((sector, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {language === "ar" ? sector.nameAr : sector.nameEn}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ${sector.received}M / ${sector.requested}M ({sector.coverage}%)
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={sector.coverage} className="h-3" />
                        <div 
                          className="absolute top-0 left-0 h-3 bg-muted rounded-full"
                          style={{ width: '100%', zIndex: -1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {language === "ar"
                      ? "قطاع التعليم هو الأقل تمويلاً بنسبة 28% فقط، مما يؤثر على 2.4 مليون طفل خارج المدرسة."
                      : "Education sector is the least funded at only 28%, affecting 2.4 million out-of-school children."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "الشركاء المنفذون الرئيسيون" : "Key Implementing Partners"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "وكالات الأمم المتحدة والمنظمات الإنسانية"
                    : "UN agencies and humanitarian organizations"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {implementingPartners.map((partner, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">
                          {language === "ar" ? partner.nameAr : partner.nameEn}
                        </h4>
                        <Badge variant="outline">${partner.funding}M</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {language === "ar" 
                            ? `${partner.beneficiaries} مستفيد`
                            : `${partner.beneficiaries} beneficiaries`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
