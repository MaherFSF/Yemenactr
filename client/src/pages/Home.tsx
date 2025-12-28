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
  Package,
  Compass
} from "lucide-react";
import { Link } from "wouter";
import DataQualityBadge, { DevModeBanner } from "@/components/DataQualityBadge";

export default function Home() {
  const { language } = useLanguage();

  // Hero floating KPI cards matching mockup IMG_1502
  const heroKPIs = [
    {
      labelEn: "GDP Growth",
      labelAr: "نمو الناتج المحلي",
      value: "+3.2%",
      subEn: "Quarterly Growth",
      subAr: "نمو ربع سنوي",
      sparklineData: [20, 25, 30, 35, 40, 50, 55, 60, 65, 70, 80, 90],
      color: "#107040"
    },
    {
      labelEn: "Inflation Rate",
      labelAr: "معدل التضخم",
      value: "12.5%",
      subEn: "Year-over-Year",
      subAr: "سنوي",
      sparklineData: [30, 35, 40, 45, 50, 55, 50, 55, 60, 65, 70, 75],
      color: "#107040"
    },
    {
      labelEn: "Exchange Rate",
      labelAr: "سعر الصرف",
      value: "37.6%",
      subEn: "Year-over-Year",
      subAr: "سنوي",
      sparklineData: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
      color: "#107040",
      icon: "globe"
    },
    {
      labelEn: "Exchange Rate",
      labelAr: "سعر الصرف",
      value: "1 USD = 250 YER",
      subEn: "Daily Update",
      subAr: "تحديث يومي",
      sparklineData: [50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72],
      color: "#107040",
      icon: "currency"
    }
  ];

  // Platform stats for Arabic version
  const platformStats = [
    { valueEn: "45", valueAr: "45", labelEn: "Research Reports", labelAr: "تقرير بحثي", icon: FileText },
    { valueEn: "850+", valueAr: "850+", labelEn: "Users", labelAr: "مستخدم", icon: Users },
    { valueEn: "1.2M", valueAr: "1.2M", labelEn: "Data Points", labelAr: "نقطة بيانات", icon: Database },
    { valueEn: "47", valueAr: "47", labelEn: "Data Sources", labelAr: "مصدر بيانات", icon: BarChart3 },
  ];

  // Sectors with images matching mockup IMG_1499
  const sectorsWithImages = [
    { 
      nameEn: "Trade & Commerce", 
      nameAr: "التجارة والأعمال", 
      href: "/sectors/trade", 
      image: "/images/sectors/trade-port.jpg",
      icon: Ship 
    },
    { 
      nameEn: "Local Economy", 
      nameAr: "الاقتصاد المحلي", 
      href: "/sectors/macroeconomy", 
      image: "/images/sectors/local-market.webp",
      icon: TrendingUp 
    },
    { 
      nameEn: "Rural Development", 
      nameAr: "التنمية الريفية", 
      href: "/sectors/agriculture", 
      image: "/images/sectors/agriculture-terraces.jpg",
      icon: Droplets 
    },
  ];

  // All sectors grid
  const sectors = [
    { nameEn: "Macroeconomy & Growth", nameAr: "الاقتصاد الكلي والنمو", href: "/sectors/macroeconomy", icon: TrendingUp, color: "bg-green-50 hover:bg-green-100 border-green-200" },
    { nameEn: "Trade & Commerce", nameAr: "التجارة والأعمال", href: "/sectors/trade", icon: Ship, color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { nameEn: "Banking & Finance", nameAr: "القطاع المصرفي والمالي", href: "/sectors/banking", icon: Banknote, color: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { nameEn: "Public Finance", nameAr: "المالية العامة", href: "/sectors/public-finance", icon: Building2, color: "bg-purple-50 hover:bg-purple-100 border-purple-200" },
    { nameEn: "Currency & Exchange", nameAr: "العملة والصرف", href: "/sectors/currency", icon: Globe, color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" },
    { nameEn: "Prices & Cost of Living", nameAr: "الأسعار وتكاليف المعيشة", href: "/sectors/prices", icon: DollarSign, color: "bg-red-50 hover:bg-red-100 border-red-200" },
    { nameEn: "Aid Flows", nameAr: "تدفقات المساعدات", href: "/sectors/aid-flows", icon: Heart, color: "bg-pink-50 hover:bg-pink-100 border-pink-200" },
    { nameEn: "Food Security", nameAr: "الأمن الغذائي", href: "/sectors/food-security", icon: Wheat, color: "bg-lime-50 hover:bg-lime-100 border-lime-200" },
    { nameEn: "Energy & Fuel", nameAr: "الطاقة والوقود", href: "/sectors/energy", icon: Zap, color: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
    { nameEn: "Investment", nameAr: "الاستثمار", href: "/sectors/investment", icon: Factory, color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { nameEn: "Conflict Economy", nameAr: "اقتصاد الصراع", href: "/sectors/conflict-economy", icon: AlertTriangle, color: "bg-rose-50 hover:bg-rose-100 border-rose-200" },
    { nameEn: "Labor Market", nameAr: "سوق العمل", href: "/sectors/labor-market", icon: Briefcase, color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
    { nameEn: "Agriculture", nameAr: "الزراعة", href: "/sectors/agriculture", icon: Droplets, color: "bg-teal-50 hover:bg-teal-100 border-teal-200" },
    { nameEn: "Infrastructure", nameAr: "البنية التحتية", href: "/sectors/infrastructure", icon: Building2, color: "bg-slate-50 hover:bg-slate-100 border-slate-200" },
    { nameEn: "Poverty & Development", nameAr: "الفقر والتنمية", href: "/sectors/poverty", icon: Users, color: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
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
  const Sparkline = ({ data, color, height = 24 }: { data: number[], color: string, height?: number }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 60;
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
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  // Latest updates for news section
  const latestUpdates = [
    {
      titleEn: "YETO Publishes Quarterly Economic Outlook Report",
      titleAr: "YETO ينشر تقرير التوقعات الاقتصادية الفصلية",
      date: "October 26, 2024",
      image: "/images/sectors/central-bank.jpg",
      href: "/research"
    },
    {
      titleEn: "New Data Portal Launched for Real-time Economic Indicators",
      titleAr: "إطلاق بوابة بيانات جديدة للمؤشرات الاقتصادية الحية",
      date: "October 18, 2024",
      image: "/images/sectors/infrastructure.jpg",
      href: "/dashboard"
    },
    {
      titleEn: "Research Highlights: Impact of Humanitarian Aid on Local Markets",
      titleAr: "أبرز الأبحاث: تأثير المساعدات الإنسانية على الأسواق المحلية",
      date: "October 10, 2024",
      image: "/images/sectors/humanitarian-aid.jpg",
      href: "/research"
    }
  ];

  return (
    <div className="flex flex-col">
      {/* DEV Mode Banner */}
      <DevModeBanner />
      
      {/* Insights Ticker - Sticky bar with rotating updates */}
      <InsightsTicker />
      
      {/* Hero Section - Matching mockup IMG_1502 exactly */}
      <section className="relative min-h-[650px] overflow-hidden">
        {/* Background collage */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2">
          <div className="col-span-2 row-span-2 relative">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(16, 48, 80, 0.95), rgba(16, 48, 80, 0.7))`,
                zIndex: 1
              }}
            />
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" 
              alt="Office" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" 
              alt="Analytics" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80" 
              alt="Dashboard" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative">
            <img 
              src="/images/sectors/trade-port.jpg" 
              alt="Port" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative">
            <img 
              src="/images/sectors/solar-energy.jpg" 
              alt="Solar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 container py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`text-white ${language === 'ar' ? 'lg:order-2 text-right' : ''}`}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {language === "ar" ? (
                  <>
                    <span className="text-white">مرصد</span>
                    <br />
                    <span className="text-[#107040]">الشفافية الاقتصادية</span>
                    <br />
                    <span className="text-white">اليمني</span>
                  </>
                ) : (
                  <>
                    <span className="text-white">Yemen Economic</span>
                    <br />
                    <span className="text-[#107040]">Transparency</span>
                    <br />
                    <span className="text-white">Observatory</span>
                  </>
                )}
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg">
                {language === "ar"
                  ? "إضاءة مسار اليمن نحو التعافي الاقتصادي من خلال المساءلة المبنية على البيانات"
                  : "Illuminating Yemen's Path to Economic Recovery Through Data-Driven Accountability"}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-[#107040] hover:bg-[#0D5A34] text-white gap-2 px-8 rounded-full">
                    {language === "ar" ? "استكشف لوحة البيانات" : "Explore Dashboard"}
                    <ArrowRight className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </Button>
                </Link>
                <Link href="/research">
                  <Button size="lg" variant="outline" className="bg-transparent border-white/50 hover:bg-white/10 text-white px-8 rounded-full">
                    {language === "ar" ? "اعرف المزيد" : "Learn More"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content - Floating KPI Cards matching mockup */}
            <div className={`relative ${language === 'ar' ? 'lg:order-1' : ''}`}>
              {/* Compass in center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
                <div className="w-32 h-32 rounded-full border-2 border-[#C0A030]/30 flex items-center justify-center">
                  <Compass className="w-16 h-16 text-[#C0A030]/50" />
                </div>
              </div>

              {/* GDP Growth Card - Top Left */}
              <div className="absolute top-0 left-0 bg-white rounded-xl shadow-lg p-4 w-44 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#C0A030]/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-[#C0A030]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {language === "ar" ? "نمو الناتج المحلي" : "GDP Growth"}
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#107040] mb-1">+3.2%</div>
                <div className="text-xs text-gray-500 mb-2">
                  {language === "ar" ? "نمو ربع سنوي" : "Quarterly Growth"}
                </div>
                <Sparkline data={[20, 30, 25, 40, 35, 50, 45, 60, 55, 70, 80, 90]} color="#107040" />
              </div>

              {/* Inflation Rate Card - Top Right */}
              <div className="absolute top-0 right-0 bg-white rounded-xl shadow-lg p-4 w-44 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#C0A030]/20 rounded-lg flex items-center justify-center">
                    <Coins className="w-4 h-4 text-[#C0A030]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {language === "ar" ? "معدل التضخم" : "Inflation Rate"}
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#107040] mb-1">12.5%</div>
                <div className="text-xs text-gray-500 mb-2">
                  {language === "ar" ? "سنوي" : "Year-over-Year"}
                </div>
                <Sparkline data={[40, 45, 50, 55, 60, 55, 60, 65, 70, 75, 80, 85]} color="#107040" />
              </div>

              {/* Exchange Rate % Card - Bottom Left */}
              <div className="absolute bottom-0 left-0 bg-white rounded-xl shadow-lg p-4 w-44 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#C0A030]/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-[#C0A030]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {language === "ar" ? "سعر الصرف" : "Exchange Rate"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">YER/USD</span>
                </div>
                <div className="text-2xl font-bold text-[#107040] mb-1">37.6%</div>
                <div className="text-xs text-gray-500 mb-2">
                  {language === "ar" ? "سنوي" : "Year-over-Year"}
                </div>
                <Sparkline data={[30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85]} color="#107040" />
              </div>

              {/* Exchange Rate Value Card - Bottom Right */}
              <div className="absolute bottom-0 right-0 bg-white rounded-xl shadow-lg p-4 w-44 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#C0A030]/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-[#C0A030]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {language === "ar" ? "سعر الصرف" : "Exchange Rate"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">YER/USD</span>
                </div>
                <div className="text-xl font-bold text-[#107040] mb-1">1 USD = 250 YER</div>
                <div className="text-xs text-gray-500 mb-2">
                  {language === "ar" ? "تحديث يومي" : "Daily Update"}
                </div>
                <Sparkline data={[50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72]} color="#107040" />
              </div>

              {/* Spacer for card positioning */}
              <div className="h-80"></div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards Row - Matching mockup IMG_1500 */}
      <section className="py-8 bg-[#103050]">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BarChart3, labelEn: "GDP Growth", labelAr: "نمو الناتج المحلي", value: "+2.5%", trend: "up" },
              { icon: Coins, labelEn: "Inflation Rate", labelAr: "معدل التضخم", value: "15%", trend: "up" },
              { icon: Globe, labelEn: "Foreign Reserves", labelAr: "الاحتياطيات الأجنبية", value: "$3.2B", trend: "up" },
              { icon: Users, labelEn: "Labor Force", labelAr: "القوى العاملة", value: "6.5M", trend: "stable" },
            ].map((kpi, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#C0A030]/20 rounded-lg flex items-center justify-center">
                    <kpi.icon className="w-5 h-5 text-[#C0A030]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {language === "ar" ? kpi.labelAr : kpi.labelEn}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#103050]">{kpi.value}</span>
                  <div className="flex items-center gap-1">
                    {kpi.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                    <Sparkline data={[40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]} color="#107040" height={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors Grid with Icons - Matching mockup IMG_1498 */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className={`text-center mb-12 ${language === 'ar' ? 'text-right' : ''}`}>
            <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">
              {language === "ar" ? "تصفح البيانات والتحليلات حسب القطاع الاقتصادي" : "Browse data and analysis by economic sector"}
            </h2>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
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

      {/* Sector Cards with Images - Matching mockup IMG_1499 */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            {sectorsWithImages.map((sector, index) => (
              <Link key={index} href={sector.href}>
                <div className="relative rounded-2xl overflow-hidden h-48 group cursor-pointer">
                  <img 
                    src={sector.image} 
                    alt={language === "ar" ? sector.nameAr : sector.nameEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">
                      {language === "ar" ? sector.nameAr : sector.nameEn}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Updates Section - Matching mockup IMG_1499 */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <h2 className="text-3xl font-bold text-center text-[#103050] dark:text-white mb-12">
            {language === "ar" ? "آخر التحديثات" : "Latest Updates"}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {latestUpdates.map((update, index) => (
              <Link key={index} href={update.href}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={update.image} 
                      alt={language === "ar" ? update.titleAr : update.titleEn}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-[#103050] dark:text-white mb-2 line-clamp-2">
                      {language === "ar" ? update.titleAr : update.titleEn}
                    </h3>
                    <p className="text-sm text-gray-500">{update.date}</p>
                    <div className="mt-3 text-[#107040] text-sm font-medium flex items-center gap-1">
                      {language === "ar" ? "اقرأ المزيد" : "Read More"}
                      <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Matching mockup IMG_1498 */}
      <section className="py-16 bg-white dark:bg-gray-950">
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
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group border-2 hover:border-[#107040]/30">
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
