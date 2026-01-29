import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Building2, 
  Landmark, 
  Heart, 
  BarChart3,
  ArrowRight,
  Shield,
  Users,
  FileText,
  Database,
  Globe,
  Briefcase,
  GraduationCap,
  Newspaper,
  Search
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

// Helper to check if user is authenticated
function useIsAuthenticated() {
  const auth = useAuth();
  return { user: auth.user, isLoading: auth.loading };
}

interface RoleEntry {
  id: string;
  icon: React.ElementType;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  href: string;
  features: { en: string; ar: string }[];
  color: string;
  badge?: { en: string; ar: string };
  requiresAuth?: boolean;
}

const roleEntries: RoleEntry[] = [
  {
    id: "president",
    icon: Crown,
    titleEn: "National Leadership",
    titleAr: "القيادة الوطنية",
    descEn: "Strategic situation room with macro indicators and policy impact analysis",
    descAr: "غرفة الوضع الاستراتيجي مع المؤشرات الكلية وتحليل تأثير السياسات",
    href: "/vip/cockpit?role=president",
    features: [
      { en: "National KPI Dashboard", ar: "لوحة المؤشرات الوطنية" },
      { en: "Policy Impact Scenarios", ar: "سيناريوهات تأثير السياسات" },
      { en: "Daily Intelligence Brief", ar: "الملخص الاستخباراتي اليومي" }
    ],
    color: "from-amber-500 to-yellow-600",
    badge: { en: "VIP", ar: "كبار الشخصيات" },
    requiresAuth: true
  },
  {
    id: "finance",
    icon: Building2,
    titleEn: "Fiscal Command",
    titleAr: "القيادة المالية",
    descEn: "Revenue, expenditure, and budget execution monitoring with real-time alerts",
    descAr: "مراقبة الإيرادات والنفقات وتنفيذ الميزانية مع تنبيهات فورية",
    href: "/vip/cockpit?role=finance_minister",
    features: [
      { en: "Budget Execution Tracker", ar: "متتبع تنفيذ الميزانية" },
      { en: "Revenue Forecasting", ar: "توقعات الإيرادات" },
      { en: "Fiscal Risk Alerts", ar: "تنبيهات المخاطر المالية" }
    ],
    color: "from-blue-500 to-indigo-600",
    badge: { en: "VIP", ar: "كبار الشخصيات" },
    requiresAuth: true
  },
  {
    id: "central_bank",
    icon: Landmark,
    titleEn: "Monetary Policy",
    titleAr: "السياسة النقدية",
    descEn: "Exchange rates, reserves, and banking sector stability monitoring",
    descAr: "مراقبة أسعار الصرف والاحتياطيات واستقرار القطاع المصرفي",
    href: "/vip/cockpit?role=central_bank_governor",
    features: [
      { en: "FX Rate Monitoring", ar: "مراقبة سعر الصرف" },
      { en: "Reserves Tracking", ar: "تتبع الاحتياطيات" },
      { en: "Banking Sector Health", ar: "صحة القطاع المصرفي" }
    ],
    color: "from-emerald-500 to-teal-600",
    badge: { en: "VIP", ar: "كبار الشخصيات" },
    requiresAuth: true
  },
  {
    id: "humanitarian",
    icon: Heart,
    titleEn: "Humanitarian Response",
    titleAr: "الاستجابة الإنسانية",
    descEn: "Aid flows, food security, and displacement tracking for response coordination",
    descAr: "تتبع تدفقات المساعدات والأمن الغذائي والنزوح لتنسيق الاستجابة",
    href: "/vip/cockpit?role=humanitarian_coordinator",
    features: [
      { en: "Aid Flow Dashboard", ar: "لوحة تدفقات المساعدات" },
      { en: "Food Security Alerts", ar: "تنبيهات الأمن الغذائي" },
      { en: "IDP Movement Tracking", ar: "تتبع حركة النازحين" }
    ],
    color: "from-rose-500 to-pink-600",
    badge: { en: "VIP", ar: "كبار الشخصيات" },
    requiresAuth: true
  },
  {
    id: "donor",
    icon: BarChart3,
    titleEn: "Donor Intelligence",
    titleAr: "استخبارات المانحين",
    descEn: "Aid effectiveness, funding gaps, and impact measurement analytics",
    descAr: "فعالية المساعدات وفجوات التمويل وتحليلات قياس الأثر",
    href: "/vip/cockpit?role=donor_analyst",
    features: [
      { en: "Funding Gap Analysis", ar: "تحليل فجوات التمويل" },
      { en: "Impact Measurement", ar: "قياس الأثر" },
      { en: "Sector Allocation", ar: "توزيع القطاعات" }
    ],
    color: "from-purple-500 to-violet-600",
    badge: { en: "VIP", ar: "كبار الشخصيات" },
    requiresAuth: true
  }
];

const publicEntries: RoleEntry[] = [
  {
    id: "researcher",
    icon: GraduationCap,
    titleEn: "Researchers & Academics",
    titleAr: "الباحثون والأكاديميون",
    descEn: "Access comprehensive datasets, methodology documentation, and citation tools",
    descAr: "الوصول إلى مجموعات البيانات الشاملة ووثائق المنهجية وأدوات الاقتباس",
    href: "/data-repository",
    features: [
      { en: "Data Repository", ar: "مستودع البيانات" },
      { en: "Methodology Docs", ar: "وثائق المنهجية" },
      { en: "Export & Citation", ar: "التصدير والاقتباس" }
    ],
    color: "from-cyan-500 to-blue-600"
  },
  {
    id: "journalist",
    icon: Newspaper,
    titleEn: "Journalists & Media",
    titleAr: "الصحفيون والإعلام",
    descEn: "Verified facts, trend visualizations, and press-ready data exports",
    descAr: "حقائق موثقة وتصورات الاتجاهات وتصدير بيانات جاهزة للنشر",
    href: "/publications-hub",
    features: [
      { en: "Fact Sheets", ar: "صحائف الحقائق" },
      { en: "Trend Charts", ar: "رسوم الاتجاهات" },
      { en: "Press Exports", ar: "تصدير صحفي" }
    ],
    color: "from-orange-500 to-red-600"
  },
  {
    id: "business",
    icon: Briefcase,
    titleEn: "Business & Investment",
    titleAr: "الأعمال والاستثمار",
    descEn: "Market indicators, sector analysis, and economic forecasts for decision-making",
    descAr: "مؤشرات السوق وتحليل القطاعات والتوقعات الاقتصادية لاتخاذ القرارات",
    href: "/sectors",
    features: [
      { en: "Sector Reports", ar: "تقارير القطاعات" },
      { en: "Market Trends", ar: "اتجاهات السوق" },
      { en: "Risk Assessment", ar: "تقييم المخاطر" }
    ],
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "citizen",
    icon: Users,
    titleEn: "Citizens & Public",
    titleAr: "المواطنون والجمهور",
    descEn: "Understand Yemen's economy through accessible visualizations and explanations",
    descAr: "فهم اقتصاد اليمن من خلال تصورات وشروحات سهلة الوصول",
    href: "/",
    features: [
      { en: "Simple Dashboards", ar: "لوحات بسيطة" },
      { en: "Explainer Articles", ar: "مقالات توضيحية" },
      { en: "Cost of Living", ar: "تكاليف المعيشة" }
    ],
    color: "from-slate-500 to-gray-600"
  }
];

export function RoleAwareEntryPoints() {
  const { language } = useLanguage();
  const { user } = useIsAuthenticated();
  const isArabic = language === "ar";
  const [activeTab, setActiveTab] = useState<"vip" | "public">("public");

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#103050] dark:text-white mb-4">
            {isArabic ? "ابدأ رحلتك" : "Start Your Journey"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {isArabic 
              ? "اختر نقطة الدخول المناسبة لاحتياجاتك للوصول إلى البيانات والتحليلات المخصصة"
              : "Choose the entry point that matches your needs to access tailored data and analytics"}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("public")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "public"
                  ? "bg-white dark:bg-gray-700 text-[#103050] dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Globe className={`inline-block w-4 h-4 ${isArabic ? "ml-2" : "mr-2"}`} />
              {isArabic ? "الوصول العام" : "Public Access"}
            </button>
            <button
              onClick={() => setActiveTab("vip")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "vip"
                  ? "bg-white dark:bg-gray-700 text-[#103050] dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Shield className={`inline-block w-4 h-4 ${isArabic ? "ml-2" : "mr-2"}`} />
              {isArabic ? "لوحات VIP" : "VIP Dashboards"}
            </button>
          </div>
        </div>

        {/* Public Entry Points */}
        {activeTab === "public" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {publicEntries.map((entry) => (
              <Link key={entry.id} href={entry.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-[#107040]/30">
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${entry.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <entry.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-[#107040] transition-colors">
                      {isArabic ? entry.titleAr : entry.titleEn}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {isArabic ? entry.descAr : entry.descEn}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {entry.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <ArrowRight className={`w-3 h-3 text-[#107040] ${isArabic ? "ml-2" : "mr-2"}`} />
                          {isArabic ? feature.ar : feature.en}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* VIP Entry Points */}
        {activeTab === "vip" && (
          <div className="space-y-6">
            {!user && (
              <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <Shield className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                  {isArabic 
                    ? "يتطلب الوصول إلى لوحات VIP تسجيل الدخول والتفويض المناسب"
                    : "VIP dashboards require login and appropriate authorization"}
                </p>
                <Link href="/login">
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                    {isArabic ? "تسجيل الدخول" : "Sign In"}
                  </Button>
                </Link>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roleEntries.map((entry) => (
                <Link key={entry.id} href={user ? entry.href : "/login"}>
                  <Card className={`h-full transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-[#C0A030]/50 ${!user ? "opacity-75" : "hover:shadow-lg"}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${entry.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <entry.icon className="w-6 h-6 text-white" />
                        </div>
                        {entry.badge && (
                          <Badge className="bg-[#C0A030] text-white">
                            {isArabic ? entry.badge.ar : entry.badge.en}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-3 group-hover:text-[#C0A030] transition-colors">
                        {isArabic ? entry.titleAr : entry.titleEn}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {isArabic ? entry.descAr : entry.descEn}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {entry.features.map((feature, i) => (
                          <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <ArrowRight className={`w-3 h-3 text-[#C0A030] ${isArabic ? "ml-2" : "mr-2"}`} />
                            {isArabic ? feature.ar : feature.en}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Search */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isArabic ? "أو ابحث مباشرة عما تحتاجه" : "Or search directly for what you need"}
          </p>
          <Link href="/search">
            <Button variant="outline" size="lg" className="gap-2">
              <Search className="w-4 h-4" />
              {isArabic ? "البحث في البيانات" : "Search Data"}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default RoleAwareEntryPoints;
