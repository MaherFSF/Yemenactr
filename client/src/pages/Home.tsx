import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  BarChart3, 
  Database, 
  FileText, 
  Shield, 
  TrendingUp, 
  Users,
  Building2,
  Banknote,
  Ship,
  Wheat,
  Zap,
  Heart,
  Globe,
  Briefcase,
  DollarSign,
  Factory,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Brain,
  Search,
  Download
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { t, language } = useLanguage();

  const keyStats = [
    {
      valueEn: "15+",
      valueAr: "15+",
      labelEn: "Economic Sectors",
      labelAr: "قطاع اقتصادي",
      icon: BarChart3
    },
    {
      valueEn: "500+",
      valueAr: "500+",
      labelEn: "Data Indicators",
      labelAr: "مؤشر بيانات",
      icon: Database
    },
    {
      valueEn: "100+",
      valueAr: "100+",
      labelEn: "Verified Sources",
      labelAr: "مصدر موثق",
      icon: Shield
    },
    {
      valueEn: "2014-Now",
      valueAr: "2014-الآن",
      labelEn: "Time Coverage",
      labelAr: "التغطية الزمنية",
      icon: Clock
    },
  ];

  const features = [
    {
      icon: Database,
      titleEn: "Comprehensive Data Repository",
      titleAr: "مستودع بيانات شامل",
      descEn: "Access verified economic indicators with complete provenance tracking and confidence ratings",
      descAr: "الوصول إلى المؤشرات الاقتصادية الموثقة مع تتبع كامل للمصادر وتقييمات الثقة",
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      icon: BarChart3,
      titleEn: "Interactive Analytics",
      titleAr: "تحليلات تفاعلية",
      descEn: "Explore data through customizable dashboards, charts, and regime-specific comparisons",
      descAr: "استكشف البيانات من خلال لوحات معلومات ورسوم بيانية قابلة للتخصيص ومقارنات بين الأنظمة",
      color: "bg-green-500/10 text-green-600"
    },
    {
      icon: Brain,
      titleEn: "AI-Powered Assistant",
      titleAr: "مساعد ذكي",
      descEn: "Ask questions in natural language and get evidence-backed answers with source citations",
      descAr: "اطرح أسئلة بلغة طبيعية واحصل على إجابات مدعومة بالأدلة مع الاستشهادات",
      color: "bg-purple-500/10 text-purple-600"
    },
    {
      icon: FileText,
      titleEn: "Custom Report Builder",
      titleAr: "منشئ التقارير المخصص",
      descEn: "Generate professional reports with selected indicators, charts, and analysis",
      descAr: "إنشاء تقارير احترافية مع المؤشرات والرسوم البيانية والتحليلات المختارة",
      color: "bg-orange-500/10 text-orange-600"
    },
    {
      icon: TrendingUp,
      titleEn: "Scenario Simulator",
      titleAr: "محاكي السيناريوهات",
      descEn: "Model policy impacts and forecast economic outcomes under different assumptions",
      descAr: "نمذجة تأثيرات السياسات والتنبؤ بالنتائج الاقتصادية تحت افتراضات مختلفة",
      color: "bg-teal-500/10 text-teal-600"
    },
    {
      icon: Users,
      titleEn: "Collaborative Platform",
      titleAr: "منصة تعاونية",
      descEn: "Partner portal for data contributors, researchers, and international organizations",
      descAr: "بوابة الشركاء للمساهمين في البيانات والباحثين والمنظمات الدولية",
      color: "bg-pink-500/10 text-pink-600"
    },
  ];

  const sectors = [
    { nameEn: "Banking & Finance", nameAr: "القطاع المصرفي", href: "/sectors/banking", icon: Banknote, color: "bg-blue-100 text-blue-700" },
    { nameEn: "Trade & Commerce", nameAr: "التجارة", href: "/sectors/trade", icon: Ship, color: "bg-cyan-100 text-cyan-700" },
    { nameEn: "Macroeconomy", nameAr: "الاقتصاد الكلي", href: "/sectors/macroeconomy", icon: TrendingUp, color: "bg-green-100 text-green-700" },
    { nameEn: "Prices & Inflation", nameAr: "الأسعار والتضخم", href: "/sectors/prices", icon: DollarSign, color: "bg-red-100 text-red-700" },
    { nameEn: "Currency & Exchange", nameAr: "العملة والصرف", href: "/sectors/currency", icon: Globe, color: "bg-yellow-100 text-yellow-700" },
    { nameEn: "Public Finance", nameAr: "المالية العامة", href: "/sectors/public-finance", icon: Building2, color: "bg-purple-100 text-purple-700" },
    { nameEn: "Energy & Fuel", nameAr: "الطاقة والوقود", href: "/sectors/energy", icon: Zap, color: "bg-orange-100 text-orange-700" },
    { nameEn: "Food Security", nameAr: "الأمن الغذائي", href: "/sectors/food-security", icon: Wheat, color: "bg-lime-100 text-lime-700" },
    { nameEn: "Aid Flows", nameAr: "تدفقات المساعدات", href: "/sectors/aid-flows", icon: Heart, color: "bg-pink-100 text-pink-700" },
    { nameEn: "Labor Market", nameAr: "سوق العمل", href: "/sectors/labor-market", icon: Briefcase, color: "bg-indigo-100 text-indigo-700" },
    { nameEn: "Conflict Economy", nameAr: "اقتصاد الصراع", href: "/sectors/conflict-economy", icon: AlertTriangle, color: "bg-rose-100 text-rose-700" },
    { nameEn: "Investment", nameAr: "الاستثمار", href: "/sectors/investment", icon: Factory, color: "bg-emerald-100 text-emerald-700" },
  ];

  const latestUpdates = [
    {
      titleEn: "Q4 2024 Exchange Rate Analysis",
      titleAr: "تحليل سعر الصرف للربع الرابع 2024",
      dateEn: "Dec 2024",
      dateAr: "ديسمبر 2024",
      typeEn: "Report",
      typeAr: "تقرير"
    },
    {
      titleEn: "Food Price Index Update",
      titleAr: "تحديث مؤشر أسعار الغذاء",
      dateEn: "Dec 2024",
      dateAr: "ديسمبر 2024",
      typeEn: "Data",
      typeAr: "بيانات"
    },
    {
      titleEn: "Banking Sector Assessment",
      titleAr: "تقييم القطاع المصرفي",
      dateEn: "Nov 2024",
      dateAr: "نوفمبر 2024",
      typeEn: "Analysis",
      typeAr: "تحليل"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#103050] via-[#0B1F33] to-[#071525] text-white py-20 md:py-28 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-[#107040]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#C0A030]/20 rounded-full blur-3xl"></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* CauseWay Logo */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 relative">
                    <div className="absolute top-0 left-0 w-4 h-4 bg-[#107040] rounded-sm"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 bg-[#C0A030] rounded-sm"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 bg-white rounded-sm"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4A90E2] rounded-full"></div>
                  </div>
                </div>
                <span className="text-lg font-semibold tracking-wide">
                  {language === "ar" ? "كوزواي" : "CauseWay"}
                </span>
              </div>
            </div>

            <Badge className="mb-6 bg-[#107040]/20 text-[#6FCF97] border-[#107040]/30 px-4 py-1">
              {language === "ar" ? "منصة الشفافية الاقتصادية" : "Economic Transparency Platform"}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {language === "ar" 
                ? "مرصد اليمن للشفافية الاقتصادية"
                : "Yemen Economic Transparency Observatory"}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              {language === "ar"
                ? "منصة استخبارات اقتصادية شاملة توفر بيانات موثقة وتحليلات معمقة لدعم صناع القرار والباحثين والمؤسسات الدولية"
                : "A comprehensive economic intelligence platform providing verified data and in-depth analysis to support policymakers, researchers, and international organizations"}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/dashboard">
                <Button size="lg" className="bg-[#107040] hover:bg-[#0D5A34] text-white gap-2 group px-8">
                  {language === "ar" ? "استكشف البيانات" : "Explore Data"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white gap-2 px-8">
                  <Brain className="h-4 w-4" />
                  {language === "ar" ? "اسأل المساعد الذكي" : "Ask AI Assistant"}
                </Button>
              </Link>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {keyStats.map((stat, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <stat.icon className="h-5 w-5 text-[#C0A030] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {language === "ar" ? stat.valueAr : stat.valueEn}
                  </div>
                  <div className="text-sm text-white/60">
                    {language === "ar" ? stat.labelAr : stat.labelEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sectors Grid Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#103050]/10 text-[#103050] dark:bg-[#103050]/20 dark:text-blue-300">
              {language === "ar" ? "15 قطاع اقتصادي" : "15 Economic Sectors"}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {language === "ar" ? "القطاعات الاقتصادية" : "Economic Sectors"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === "ar" 
                ? "تحليلات متخصصة وبيانات موثقة لكل قطاع اقتصادي رئيسي مع تتبع للتغيرات بين نظامي عدن وصنعاء"
                : "Specialized analysis and verified data for each major economic sector with tracking of changes between Aden and Sana'a regimes"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {sectors.map((sector, index) => {
              const Icon = sector.icon;
              return (
                <Link key={index} href={sector.href}>
                  <Card className="border-border hover:border-[#107040] hover:shadow-lg transition-all cursor-pointer h-full group">
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 rounded-lg ${sector.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-medium text-sm">
                        {language === "ar" ? sector.nameAr : sector.nameEn}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link href="/data-repository">
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                {language === "ar" ? "استعراض جميع البيانات" : "Browse All Data"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#107040]/10 text-[#107040]">
              {language === "ar" ? "أدوات متقدمة" : "Advanced Tools"}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {language === "ar" ? "منصة استخبارات اقتصادية شاملة" : "Comprehensive Economic Intelligence Platform"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === "ar" 
                ? "أدوات وبيانات متقدمة لصناع القرار والباحثين والمؤسسات الدولية"
                : "Advanced tools and data for policymakers, researchers, and international organizations"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-border hover:shadow-lg transition-shadow group">
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl">
                      {language === "ar" ? feature.titleAr : feature.titleEn}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {language === "ar" ? feature.descAr : feature.descEn}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dual Authority Tracking Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-[#103050] to-[#0B1F33] text-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-white/10 text-white border-white/20">
                {language === "ar" ? "ميزة فريدة" : "Unique Feature"}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {language === "ar" 
                  ? "تتبع السلطة المزدوجة"
                  : "Dual Authority Tracking"}
              </h2>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {language === "ar"
                  ? "يتميز يتو بقدرته على تتبع ومقارنة المؤشرات الاقتصادية بين نظامي عدن (الحكومة المعترف بها دولياً) وصنعاء (سلطات الحوثي)، مما يوفر رؤية شاملة للواقع الاقتصادي المجزأ في اليمن."
                  : "YETO uniquely tracks and compares economic indicators between the Aden regime (internationally recognized government) and Sana'a regime (Houthi authorities), providing a comprehensive view of Yemen's fragmented economic reality."}
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="font-semibold">{language === "ar" ? "نظام عدن" : "Aden Regime"}</span>
                  </div>
                  <p className="text-sm text-white/70">
                    {language === "ar" 
                      ? "الحكومة المعترف بها دولياً، البنك المركزي في عدن"
                      : "Internationally recognized government, CBY-Aden"}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <span className="font-semibold">{language === "ar" ? "نظام صنعاء" : "Sana'a Regime"}</span>
                  </div>
                  <p className="text-sm text-white/70">
                    {language === "ar" 
                      ? "سلطات الحوثي، البنك المركزي في صنعاء"
                      : "Houthi authorities, CBY-Sana'a"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">
                {language === "ar" ? "مثال: سعر الصرف" : "Example: Exchange Rate"}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span>{language === "ar" ? "عدن" : "Aden"}</span>
                  </div>
                  <span className="font-mono font-bold">~2,070 YER/USD</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <span>{language === "ar" ? "صنعاء" : "Sana'a"}</span>
                  </div>
                  <span className="font-mono font-bold">~535 YER/USD</span>
                </div>
                <div className="text-center pt-2">
                  <Badge variant="outline" className="bg-[#C0A030]/20 text-[#C0A030] border-[#C0A030]/30">
                    {language === "ar" ? "فجوة ~287%" : "~287% Gap"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {language === "ar" ? "آخر التحديثات" : "Latest Updates"}
              </h2>
              <p className="text-muted-foreground">
                {language === "ar" ? "أحدث البيانات والتقارير والتحليلات" : "Recent data, reports, and analysis"}
              </p>
            </div>
            <Link href="/timeline">
              <Button variant="outline" className="mt-4 md:mt-0 gap-2">
                {language === "ar" ? "عرض الجدول الزمني" : "View Timeline"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {latestUpdates.map((update, index) => (
              <Card key={index} className="border-border hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {language === "ar" ? update.typeAr : update.typeEn}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? update.dateAr : update.dateEn}
                    </span>
                  </div>
                  <CardTitle className="text-lg">
                    {language === "ar" ? update.titleAr : update.titleEn}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto text-[#107040]">
                    {language === "ar" ? "اقرأ المزيد" : "Read More"}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#107040] to-[#0D5A34] text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-6 text-white/80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {language === "ar" 
                ? "ابدأ استكشاف البيانات الاقتصادية اليمنية"
                : "Start Exploring Yemen's Economic Data"}
            </h2>
            <p className="text-lg text-white/80 mb-8">
              {language === "ar"
                ? "انضم إلى المئات من الباحثين وصناع القرار والمنظمات الدولية الذين يعتمدون على يتو للحصول على رؤى اقتصادية موثوقة"
                : "Join hundreds of researchers, policymakers, and international organizations who rely on YETO for trusted economic insights"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-[#107040] hover:bg-white/90 gap-2 group px-8">
                  {language === "ar" ? "استكشف لوحة المعلومات" : "Explore Dashboard"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/data-repository">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 px-8">
                  <Download className="h-4 w-4" />
                  {language === "ar" ? "تحميل البيانات" : "Download Data"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
