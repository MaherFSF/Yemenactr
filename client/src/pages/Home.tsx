import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import InsightsTicker from "@/components/InsightsTicker";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  BarChart3, 
  Database, 
  FileText, 
  TrendingUp, 
  TrendingDown,
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
  Brain,
  Search,
  Fuel,
  Droplets,
  Coins,
  Package
} from "lucide-react";
import { Link } from "wouter";
import DataQualityBadge, { DevModeBanner } from "@/components/DataQualityBadge";

export default function Home() {
  const { language } = useLanguage();

  // Live indicator cards matching mockup exactly
  const liveIndicators = [
    {
      labelEn: "Yemeni Rial Exchange Rate:",
      labelAr: "سعر صرف الريال اليمني:",
      valueEn: "1,345 YER / USD",
      valueAr: "1,345 ريال / دولار",
      trend: "up",
      trendColor: "text-green-600",
      sparklineColor: "#107040",
      sparklineData: [30, 35, 32, 40, 45, 42, 50, 55, 52, 60, 65, 70],
      icon: Coins
    },
    {
      labelEn: "Daily Oil Production:",
      labelAr: "إنتاج النفط اليومي:",
      valueEn: "52,000 Barrels",
      valueAr: "52,000 برميل",
      trend: "down",
      trendColor: "text-red-600",
      sparklineColor: "#DC2626",
      sparklineData: [80, 75, 78, 70, 65, 68, 60, 55, 58, 50, 52, 48],
      icon: Fuel
    },
    {
      labelEn: "Trade Balance:",
      labelAr: "الميزان التجاري:",
      valueEn: "-$1.2 Billion",
      valueAr: "-1.2 مليار دولار",
      trend: "stable",
      trendColor: "text-gray-600",
      sparklineColor: "#6B7280",
      sparklineData: [50, 48, 52, 50, 48, 50, 52, 50, 48, 50, 52, 50],
      icon: Ship
    },
    {
      labelEn: "Key Commodity Prices:",
      labelAr: "أسعار السلع الرئيسية:",
      valueEn: "—",
      valueAr: "—",
      trend: "up",
      trendColor: "text-green-600",
      sparklineColor: "#107040",
      sparklineData: [40, 42, 45, 48, 46, 50, 52, 55, 58, 60, 62, 65],
      icon: Package
    },
  ];

  // Platform stats for Arabic version
  const platformStats = [
    { valueEn: "45", valueAr: "45", labelEn: "Research Reports", labelAr: "تقرير بحثي", icon: FileText },
    { valueEn: "850+", valueAr: "850+", labelEn: "Users", labelAr: "مستخدم", icon: Users },
    { valueEn: "1.2M", valueAr: "1.2M", labelEn: "Data Points", labelAr: "نقطة بيانات", icon: Database },
    { valueEn: "47", valueAr: "47", labelEn: "Data Sources", labelAr: "مصدر بيانات", icon: BarChart3 },
  ];

  const sectors = [
    { nameEn: "Banking & Finance", nameAr: "القطاع المصرفي والمالي", href: "/sectors/banking", icon: Banknote, color: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { nameEn: "Trade & Commerce", nameAr: "التجارة والأعمال", href: "/sectors/trade", icon: Ship, color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { nameEn: "Macroeconomy & Growth", nameAr: "الاقتصاد الكلي والنمو", href: "/sectors/macroeconomy", icon: TrendingUp, color: "bg-green-50 hover:bg-green-100 border-green-200" },
    { nameEn: "Prices & Cost of Living", nameAr: "الأسعار وتكاليف المعيشة", href: "/sectors/prices", icon: DollarSign, color: "bg-red-50 hover:bg-red-100 border-red-200" },
    { nameEn: "Currency & Exchange", nameAr: "العملة والصرف", href: "/sectors/currency", icon: Globe, color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" },
    { nameEn: "Public Finance", nameAr: "المالية العامة", href: "/sectors/public-finance", icon: Building2, color: "bg-purple-50 hover:bg-purple-100 border-purple-200" },
    { nameEn: "Energy & Fuel", nameAr: "الطاقة والوقود", href: "/sectors/energy", icon: Zap, color: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
    { nameEn: "Food Security", nameAr: "الأمن الغذائي", href: "/sectors/food-security", icon: Wheat, color: "bg-lime-50 hover:bg-lime-100 border-lime-200" },
    { nameEn: "Aid Flows", nameAr: "تدفقات المساعدات", href: "/sectors/aid-flows", icon: Heart, color: "bg-pink-50 hover:bg-pink-100 border-pink-200" },
    { nameEn: "Labor Market", nameAr: "سوق العمل", href: "/sectors/labor-market", icon: Briefcase, color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
    { nameEn: "Conflict Economy", nameAr: "اقتصاد الصراع", href: "/sectors/conflict-economy", icon: AlertTriangle, color: "bg-rose-50 hover:bg-rose-100 border-rose-200" },
    { nameEn: "Investment", nameAr: "الاستثمار", href: "/sectors/investment", icon: Factory, color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { nameEn: "Poverty & Development", nameAr: "الفقر والتنمية", href: "/sectors/poverty", icon: Users, color: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
    { nameEn: "Infrastructure", nameAr: "البنية التحتية", href: "/sectors/infrastructure", icon: Building2, color: "bg-slate-50 hover:bg-slate-100 border-slate-200" },
    { nameEn: "Agriculture", nameAr: "الزراعة", href: "/sectors/agriculture", icon: Droplets, color: "bg-teal-50 hover:bg-teal-100 border-teal-200" },
  ];

  const features = [
    {
      icon: Database,
      titleEn: "Comprehensive Data Repository",
      titleAr: "مستودع بيانات شامل",
      descEn: "Access verified economic indicators with complete provenance tracking and confidence ratings",
      descAr: "الوصول إلى المؤشرات الاقتصادية الموثقة مع تتبع كامل للمصادر",
      href: "/data-repository"
    },
    {
      icon: BarChart3,
      titleEn: "Interactive Analytics",
      titleAr: "تحليلات تفاعلية",
      descEn: "Explore data through customizable dashboards and regime-specific comparisons",
      descAr: "استكشف البيانات من خلال لوحات معلومات قابلة للتخصيص",
      href: "/dashboard"
    },
    {
      icon: Brain,
      titleEn: "AI-Powered Assistant",
      titleAr: "مساعد ذكي",
      descEn: "Ask questions in natural language and get evidence-backed answers",
      descAr: "اطرح أسئلة بلغة طبيعية واحصل على إجابات مدعومة بالأدلة",
      href: "/ai-assistant"
    },
    {
      icon: FileText,
      titleEn: "Custom Report Builder",
      titleAr: "منشئ التقارير",
      descEn: "Generate professional reports with selected indicators and analysis",
      descAr: "إنشاء تقارير احترافية مع المؤشرات والتحليلات المختارة",
      href: "/report-builder"
    },
    {
      icon: TrendingUp,
      titleEn: "Scenario Simulator",
      titleAr: "محاكي السيناريوهات",
      descEn: "Model policy impacts and forecast economic outcomes",
      descAr: "نمذجة تأثيرات السياسات والتنبؤ بالنتائج الاقتصادية",
      href: "/scenario-simulator"
    },
    {
      icon: Search,
      titleEn: "Research Library",
      titleAr: "مكتبة الأبحاث",
      descEn: "Browse reports, policy briefs, and academic publications",
      descAr: "تصفح التقارير والملخصات السياسية والمنشورات الأكاديمية",
      href: "/research"
    },
  ];

  // Simple sparkline SVG component
  const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 120;
    const height = 30;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="inline-block">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="flex flex-col">
      {/* DEV Mode Banner */}
      <DevModeBanner />
      
      {/* Insights Ticker - Sticky bar with rotating updates */}
      <InsightsTicker />
      
      {/* Hero Section - Matching mockup exactly */}
      <section 
        className="relative min-h-[600px] flex items-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(16, 48, 80, 0.85), rgba(16, 48, 80, 0.6)), url('https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`text-white ${language === 'ar' ? 'lg:order-2 text-right' : ''}`}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {language === "ar" ? (
                  <>
                    <span className="text-[#C0A030]">الشفافية الاقتصادية</span>
                    <br />
                    <span>لليمن</span>
                  </>
                ) : (
                  <>
                    <span>Yemen Economic</span>
                    <br />
                    <span className="text-[#107040]">Transparency</span> Observatory
                  </>
                )}
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-4">
                {language === "ar"
                  ? "منصة الذكاء الاقتصادي الرائدة للبيانات والتحليل والمساءلة"
                  : "Evidence-Based Intelligence for Yemen's Economic Future"}
              </p>
              
              <p className="text-base text-[#C0A030] mb-8">
                {language === "ar"
                  ? "منتج رئيسي من كوزواي للاستشارات المالية والمصرفية"
                  : "A flagship product of CauseWay Financial & Banking Consultancies"}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-[#107040] hover:bg-[#0D5A34] text-white gap-2 px-8">
                    {language === "ar" ? "استكشف لوحة البيانات" : "Explore Dashboard"}
                    <ArrowRight className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </Button>
                </Link>
                <Link href="/research">
                  <Button size="lg" variant="outline" className="bg-transparent border-white/50 hover:bg-white/10 text-white px-8">
                    {language === "ar" ? "تصفح الأبحاث" : "View Latest Research"}
                  </Button>
                </Link>
              </div>

              {/* Powered by CauseWay */}
              <div className={`flex items-center gap-3 ${language === 'ar' ? 'justify-end' : ''}`}>
                <span className="text-white/70 text-sm">
                  {language === "ar" ? "مدعوم من" : "Powered by"}
                </span>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                  <div className="w-6 h-6 relative">
                    <div className="absolute top-0 left-0 w-3 h-3 bg-[#107040] rounded-sm"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 bg-[#C0A030] rounded-sm"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 bg-white rounded-sm"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#4A90E2] rounded-full"></div>
                  </div>
                  <span className="text-white font-semibold">CauseWay</span>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview (English) or Stats (Arabic) */}
            <div className={`${language === 'ar' ? 'lg:order-1' : ''}`}>
              {language === 'ar' ? (
                // Arabic: Show platform stats
                <div className="grid grid-cols-2 gap-4">
                  {platformStats.map((stat, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                      <stat.icon className="h-8 w-8 text-[#C0A030] mx-auto mb-3" />
                      <div className="text-3xl font-bold text-white mb-1">{stat.valueAr}</div>
                      <div className="text-white/70 text-sm">{stat.labelAr}</div>
                    </div>
                  ))}
                </div>
              ) : (
                // English: Show dashboard preview image
                <div className="relative">
                  <div className="bg-white rounded-xl shadow-2xl p-4 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="text-xs text-gray-500 ml-2">CauseWay | YETO Dashboard</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-white rounded p-3 shadow-sm">
                          <div className="text-xs text-gray-500">Trade Balance</div>
                          <div className="text-lg font-bold text-[#103050]">$2,000</div>
                          <div className="text-xs text-red-500">-$1.2 Billion</div>
                        </div>
                        <div className="bg-white rounded p-3 shadow-sm">
                          <div className="text-xs text-gray-500">GDP Growth (%)</div>
                          <div className="h-8 flex items-end gap-0.5">
                            {[40, 60, 45, 70, 55, 80].map((h, i) => (
                              <div key={i} className="flex-1 bg-[#107040] rounded-t" style={{ height: `${h}%` }}></div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded p-3 shadow-sm">
                          <div className="text-xs text-gray-500">Key Sector</div>
                          <div className="w-12 h-12 mx-auto mt-1">
                            <svg viewBox="0 0 36 36" className="w-full h-full">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="#E5E7EB" strokeWidth="3"/>
                              <circle cx="18" cy="18" r="15" fill="none" stroke="#107040" strokeWidth="3" strokeDasharray="47 100" transform="rotate(-90 18 18)"/>
                              <circle cx="18" cy="18" r="15" fill="none" stroke="#C0A030" strokeWidth="3" strokeDasharray="30 100" strokeDashoffset="-47" transform="rotate(-90 18 18)"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded p-3 shadow-sm">
                        <div className="text-xs text-gray-500 mb-2">Commodity Prices</div>
                        <div className="h-16">
                          <svg viewBox="0 0 200 60" className="w-full h-full">
                            <polyline fill="none" stroke="#107040" strokeWidth="2" points="0,50 30,45 60,40 90,35 120,30 150,25 180,20 200,15"/>
                            <polyline fill="none" stroke="#C0A030" strokeWidth="2" points="0,40 30,42 60,38 90,40 120,35 150,38 180,32 200,30"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Live Indicator Cards - Matching mockup */}
      <section className="py-8 bg-gray-50 dark:bg-gray-900 border-b">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {liveIndicators.map((indicator, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <indicator.icon className="h-6 w-6 text-[#103050] dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {language === "ar" ? indicator.labelAr : indicator.labelEn}
                      </div>
                      <div className="text-xl font-bold text-[#103050] dark:text-white">
                        {language === "ar" ? indicator.valueAr : indicator.valueEn}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-500">
                          {language === "ar" ? "الاتجاه:" : "Trend:"}
                        </span>
                        {indicator.trend === "up" && <TrendingUp className={`h-4 w-4 ${indicator.trendColor}`} />}
                        {indicator.trend === "down" && <TrendingDown className={`h-4 w-4 ${indicator.trendColor}`} />}
                        {indicator.trend === "stable" && <span className="text-gray-400">—</span>}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-400 block mb-1">
                          {language === "ar" ? "الرسم البياني المصغر:" : "Mini sparkline:"}
                        </span>
                        <Sparkline data={indicator.sparklineData} color={indicator.sparklineColor} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors Grid */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container">
          <div className={`text-center mb-12 ${language === 'ar' ? 'text-right' : ''}`}>
            <h2 className="text-3xl font-bold text-[#103050] dark:text-white mb-4">
              {language === "ar" ? "استكشف القطاعات الاقتصادية" : "Explore Economic Sectors"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {language === "ar" 
                ? "تصفح البيانات والتحليلات حسب القطاع الاقتصادي"
                : "Browse data and analysis by economic sector"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {sectors.map((sector, index) => (
              <Link key={index} href={sector.href}>
                <Card className={`${sector.color} border cursor-pointer transition-all hover:scale-105 hover:shadow-lg h-full`}>
                  <CardContent className="p-4 text-center">
                    <sector.icon className="h-8 w-8 mx-auto mb-3 text-gray-700" />
                    <div className="font-medium text-gray-800 text-sm">
                      {language === "ar" ? sector.nameAr : sector.nameEn}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className={`text-center mb-12 ${language === 'ar' ? 'text-right' : ''}`}>
            <h2 className="text-3xl font-bold text-[#103050] dark:text-white mb-4">
              {language === "ar" ? "أدوات وميزات المنصة" : "Platform Tools & Features"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {language === "ar" 
                ? "استفد من مجموعة شاملة من الأدوات لتحليل البيانات الاقتصادية"
                : "Leverage a comprehensive suite of tools for economic data analysis"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[#107040]/10 group-hover:bg-[#107040]/20 transition-colors">
                        <feature.icon className="h-6 w-6 text-[#107040]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#103050] dark:text-white mb-2 group-hover:text-[#107040] transition-colors">
                          {language === "ar" ? feature.titleAr : feature.titleEn}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? feature.descAr : feature.descEn}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#103050] text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              {language === "ar" 
                ? "ابدأ استكشاف البيانات الاقتصادية اليمنية"
                : "Start Exploring Yemen's Economic Data"}
            </h2>
            <p className="text-white/80 mb-8">
              {language === "ar"
                ? "انضم إلى مئات الباحثين وصناع القرار الذين يعتمدون على YETO للحصول على رؤى اقتصادية موثوقة"
                : "Join hundreds of researchers and policymakers who rely on YETO for reliable economic insights"}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-[#107040] hover:bg-[#0D5A34] text-white px-8">
                  {language === "ar" ? "استكشف لوحة البيانات" : "Explore Dashboard"}
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button size="lg" variant="outline" className="border-white/50 hover:bg-white/10 text-white px-8">
                  <Brain className="h-4 w-4 mr-2" />
                  {language === "ar" ? "اسأل المساعد الذكي" : "Ask AI Assistant"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Attribution */}
      <section className="py-6 bg-[#0B1F33] text-white/60 text-center text-sm">
        <div className="container">
          <div className="flex items-center justify-center gap-2">
            <span>{language === "ar" ? "مدعوم من" : "Powered by"}</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 relative">
                <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-[#107040] rounded-sm"></div>
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#C0A030] rounded-sm"></div>
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-white rounded-sm"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#4A90E2] rounded-full"></div>
              </div>
              <span className="text-white font-medium">CauseWay</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
