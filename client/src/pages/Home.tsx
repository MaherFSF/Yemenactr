import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import InsightsTicker from "@/components/InsightsTicker";
import { WelcomeTour, QuickTourButton } from "@/components/onboarding/WelcomeTour";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
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
import DataQualityBadge from "@/components/DataQualityBadge";
import { AnimatedSection, StaggeredContainer } from "@/components/AnimatedSection";
import { AnimatedCounter, FadeIn, CardHover, Sparkline } from "@/components/ui/animated";
import { YetoLogo } from "@/components/YetoLogo";
import { useScrollPosition } from "@/hooks/useParallax";
import { KpiCardSkeleton, KpiRowSkeleton } from "@/components/KpiCardSkeleton";
import { ScrollToTop } from "@/components/ScrollToTop";
import ExchangeRateChart from "@/components/ExchangeRateChart";

export default function Home() {
  const { language } = useLanguage();
  const scrollY = useScrollPosition();

  // Fetch real-time KPI data from database
  const { data: kpiData, isLoading: kpiLoading } = trpc.dashboard.getHeroKPIs.useQuery();
  
  // Fetch dynamic platform stats from database
  const { data: platformStatsData } = trpc.platform.getStats.useQuery();

  // Hero floating KPI cards with real-time data and source attribution
  const heroKPIs = [
    {
      labelEn: "GDP Growth",
      labelAr: "نمو الناتج المحلي",
      value: kpiData?.gdpGrowth?.value || "N/A",
      subEn: kpiData?.gdpGrowth?.subtext || "Annual Growth",
      subAr: "نمو سنوي",
      sparklineData: kpiData?.gdpGrowth?.trend || [20, 25, 30, 35, 40, 50, 55, 60, 65, 70, 80, 90],
      color: "#107040",
      source: kpiData?.gdpGrowth?.source || "World Bank",
      confidence: kpiData?.gdpGrowth?.confidence || "B"
    },
    {
      labelEn: "Inflation Rate",
      labelAr: "معدل التضخم",
      value: kpiData?.inflation?.value || "N/A",
      subEn: kpiData?.inflation?.subtext || "Year-over-Year",
      subAr: "سنوي",
      sparklineData: kpiData?.inflation?.trend || [30, 35, 40, 45, 50, 55, 50, 55, 60, 65, 70, 75],
      color: "#107040",
      source: kpiData?.inflation?.source || "CBY Aden",
      confidence: kpiData?.inflation?.confidence || "B"
    },
    {
      labelEn: "Exchange Rate",
      labelAr: "سعر الصرف",
      value: kpiData?.exchangeRateYoY?.value || "N/A",
      subEn: kpiData?.exchangeRateYoY?.subtext || "YER/USD YoY Change",
      subAr: "التغير السنوي",
      sparklineData: kpiData?.exchangeRateYoY?.trend || [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
      color: "#107040",
      icon: "globe",
      source: kpiData?.exchangeRateYoY?.source || "CBY Aden",
      confidence: kpiData?.exchangeRateYoY?.confidence || "B"
    },
    {
      labelEn: "Exchange Rate",
      labelAr: "سعر الصرف",
      value: kpiData?.exchangeRateAden?.value || "N/A",
      subEn: kpiData?.exchangeRateAden?.subtext || "Aden Parallel Rate",
      subAr: "سعر عدن الموازي",
      sparklineData: kpiData?.exchangeRateAden?.trend || [50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72],
      color: "#107040",
      icon: "currency",
      source: kpiData?.exchangeRateAden?.source || "CBY Aden",
      confidence: kpiData?.exchangeRateAden?.confidence || "B"
    }
  ];

  // Platform stats - dynamically fetched from database
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };
  
  const platformStats = [
    { 
      valueEn: platformStatsData?.totalDocuments?.toString() || "0", 
      valueAr: platformStatsData?.totalDocuments?.toString() || "0", 
      labelEn: "Research Reports", 
      labelAr: "تقرير بحثي", 
      icon: FileText,
      source: "YETO Database"
    },
    { 
      valueEn: platformStatsData?.totalIndicators ? `${platformStatsData.totalIndicators}+` : "0", 
      valueAr: platformStatsData?.totalIndicators ? `${platformStatsData.totalIndicators}+` : "0", 
      labelEn: "Indicators", 
      labelAr: "مؤشر", 
      icon: TrendingUp,
      source: "YETO Database"
    },
    { 
      valueEn: platformStatsData?.dataPointsCount ? formatNumber(platformStatsData.dataPointsCount) : "0", 
      valueAr: platformStatsData?.dataPointsCount ? formatNumber(platformStatsData.dataPointsCount) : "0", 
      labelEn: "Data Points", 
      labelAr: "نقطة بيانات", 
      icon: Database,
      source: "YETO Database"
    },
    { 
      valueEn: platformStatsData?.totalSources?.toString() || "0", 
      valueAr: platformStatsData?.totalSources?.toString() || "0", 
      labelEn: "Data Sources", 
      labelAr: "مصدر بيانات", 
      icon: BarChart3,
      source: "YETO Database"
    },
  ];

  // Sectors with images - all 15 sectors matching mockup IMG_1527
  const sectorsWithImages = [
    { nameEn: "Trade & Commerce", nameAr: "التجارة والأعمال", href: "/sectors/trade", image: "/images/sectors/trade-port.jpg", icon: Ship },
    { nameEn: "Local Economy", nameAr: "الاقتصاد المحلي", href: "/sectors/macroeconomy", image: "/images/sectors/local-market.webp", icon: TrendingUp },
    { nameEn: "Rural Development", nameAr: "التنمية الريفية", href: "/sectors/agriculture", image: "/images/sectors/agriculture-terraces.jpg", icon: Droplets },
    { nameEn: "Banking & Finance", nameAr: "القطاع المصرفي", href: "/sectors/banking", image: "/images/sectors/banking-finance.webp", icon: Banknote },
    { nameEn: "Currency & Exchange", nameAr: "العملة والصرف", href: "/sectors/currency", image: "/images/sectors/currency-exchange.jpg", icon: Globe },
    { nameEn: "Food Security", nameAr: "الأمن الغذائي", href: "/sectors/food-security", image: "/images/sectors/food-security.jpg", icon: Wheat },
    { nameEn: "Energy & Fuel", nameAr: "الطاقة والوقود", href: "/sectors/energy", image: "/images/sectors/energy-fuel.jpg", icon: Zap },
    { nameEn: "Aid Flows", nameAr: "تدفقات المساعدات", href: "/sectors/aid-flows", image: "/images/sectors/aid-flows.jpg", icon: Heart },
    { nameEn: "Poverty & Development", nameAr: "الفقر والتنمية", href: "/sectors/poverty", image: "/images/sectors/poverty-development.jpg", icon: Users },
    { nameEn: "Labor Market", nameAr: "سوق العمل", href: "/sectors/labor-market", image: "/images/sectors/labor-market.jpg", icon: Briefcase },
    { nameEn: "Infrastructure", nameAr: "البنية التحتية", href: "/sectors/infrastructure", image: "/images/sectors/infrastructure.jpg", icon: Building2 },
    { nameEn: "Conflict Economy", nameAr: "اقتصاد الصراع", href: "/sectors/conflict-economy", image: "/images/sectors/conflict-economy.jpg", icon: AlertTriangle },
    { nameEn: "Public Finance", nameAr: "المالية العامة", href: "/sectors/public-finance", image: "/images/sectors/public-finance.jpg", icon: Building2 },
    { nameEn: "Investment", nameAr: "الاستثمار", href: "/sectors/investment", image: "/images/sectors/investment.jpg", icon: Factory },
    { nameEn: "Prices & Cost of Living", nameAr: "الأسعار وتكاليف المعيشة", href: "/sectors/prices", image: "/images/sectors/prices-cost.jpg", icon: DollarSign },
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
      href: "/data-repository",
      stats: "2,000+ data points",
      statsAr: "أكثر من 2000 نقطة بيانات",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: BarChart3,
      titleEn: "Interactive Analytics",
      titleAr: "تحليلات تفاعلية",
      descEn: "Explore data through customizable dashboards and regime-specific comparisons",
      descAr: "استكشف البيانات من خلال لوحات معلومات قابلة للتخصيص",
      href: "/dashboard",
      stats: "Real-time updates",
      statsAr: "تحديثات فورية",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Brain,
      titleEn: "AI-Powered Assistant",
      titleAr: "مساعد ذكي",
      descEn: "Ask questions in natural language and get evidence-backed answers with source citations",
      descAr: "اطرح أسئلة بلغة طبيعية واحصل على إجابات مدعومة بالأدلة والمصادر",
      href: "/ai-assistant",
      stats: "Evidence-backed",
      statsAr: "مدعوم بالأدلة",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: FileText,
      titleEn: "Custom Report Builder",
      titleAr: "منشئ التقارير",
      descEn: "Generate professional reports with selected indicators, charts, and analysis",
      descAr: "إنشاء تقارير احترافية مع المؤشرات والرسوم البيانية والتحليلات",
      href: "/report-builder",
      stats: "PDF/Excel export",
      statsAr: "تصدير PDF/Excel",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: TrendingUp,
      titleEn: "Scenario Simulator",
      titleAr: "محاكي السيناريوهات",
      descEn: "Model policy impacts and forecast economic outcomes with ML-powered predictions",
      descAr: "نمذجة تأثيرات السياسات والتنبؤ بالنتائج الاقتصادية",
      href: "/scenario-simulator",
      stats: "What-if analysis",
      statsAr: "تحليل ماذا لو",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Search,
      titleEn: "Research Library",
      titleAr: "مكتبة الأبحاث",
      descEn: "Browse reports, policy briefs, and academic publications from 50+ sources",
      descAr: "تصفح التقارير والملخصات السياسية والمنشورات الأكاديمية من أكثر من 50 مصدر",
      href: "/research",
      stats: "500+ publications",
      statsAr: "أكثر من 500 منشور",
      color: "from-cyan-500 to-blue-600"
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

  // Fetch latest economic events from database
  const { data: latestEventsData } = trpc.events.list.useQuery({ limit: 6 });
  
  // Map sector to image paths
  const sectorImages: Record<string, string> = {
    banking: "/images/sectors/central-bank.jpg",
    trade: "/images/sectors/trade-port.jpg",
    currency: "/images/sectors/currency-exchange.jpg",
    conflict: "/images/sectors/infrastructure.jpg",
    humanitarian: "/images/sectors/humanitarian-aid.jpg",
    food_security: "/images/sectors/food-security.jpg",
    energy: "/images/sectors/energy-fuel.jpg",
    default: "/images/sectors/local-market.webp"
  };
  
  // Array of varied images for news items to avoid repetition
  const newsImages = [
    "/images/sectors/currency-exchange.jpg",
    "/images/sectors/central-bank.jpg",
    "/images/sectors/trade-port.jpg",
    "/images/sectors/infrastructure.jpg",
    "/images/sectors/humanitarian-aid.jpg",
    "/images/sectors/energy-fuel.jpg",
    "/images/sectors/food-security.jpg",
    "/images/sectors/local-market.webp"
  ];
  
  // Function to get image based on event title keywords
  const getEventImage = (title: string, index: number): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('exchange') || lowerTitle.includes('yer') || lowerTitle.includes('currency') || lowerTitle.includes('صرف')) {
      return "/images/sectors/currency-exchange.jpg";
    }
    if (lowerTitle.includes('bank') || lowerTitle.includes('cby') || lowerTitle.includes('بنك') || lowerTitle.includes('مركزي')) {
      return "/images/sectors/central-bank.jpg";
    }
    if (lowerTitle.includes('port') || lowerTitle.includes('trade') || lowerTitle.includes('ميناء') || lowerTitle.includes('تجار')) {
      return "/images/sectors/trade-port.jpg";
    }
    if (lowerTitle.includes('defense') || lowerTitle.includes('security') || lowerTitle.includes('military') || lowerTitle.includes('دفاع') || lowerTitle.includes('أمن')) {
      return "/images/sectors/infrastructure.jpg";
    }
    if (lowerTitle.includes('rally') || lowerTitle.includes('protest') || lowerTitle.includes('stc') || lowerTitle.includes('مظاهر')) {
      return "/images/sectors/humanitarian-aid.jpg";
    }
    if (lowerTitle.includes('fuel') || lowerTitle.includes('oil') || lowerTitle.includes('وقود') || lowerTitle.includes('نفط')) {
      return "/images/sectors/energy-fuel.jpg";
    }
    if (lowerTitle.includes('food') || lowerTitle.includes('wheat') || lowerTitle.includes('غذاء') || lowerTitle.includes('قمح')) {
      return "/images/sectors/food-security.jpg";
    }
    // Use varied images based on index to avoid repetition
    return newsImages[index % newsImages.length];
  };
  
  // Transform database events to display format
  const latestUpdates = (latestEventsData || []).slice(0, 6).map((event, index) => ({
    titleEn: event.title,
    titleAr: event.titleAr || event.title,
    date: new Date(event.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    image: getEventImage(event.title, index),
    href: `/sectors/${event.category || 'macroeconomy'}`,
    source: 'YETO Database'
  }));

  return (
    <div className="flex flex-col">
      {/* Welcome Tour for first-time users */}
      <WelcomeTour />
      
      {/* Production Mode - Real Data */}
      
      {/* Insights Ticker - Sticky bar with rotating updates */}
      <InsightsTicker />
      
      {/* Hero Section - Yemen skyline background with parallax */}
      <section className="relative min-h-[650px] overflow-hidden">
        {/* Yemen skyline background image with parallax effect */}
        <div 
          className="absolute inset-0 scale-110"
          style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.1)` }}
        >
          <img 
            src="/images/hero-yemen-skyline.jpg" 
            alt="Yemen Skyline" 
            className="w-full h-full object-cover"
          />
        </div>
        {/* Green overlay for text readability - YETO brand colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D2818]/85 via-[#1B5E20]/70 to-[#1B5E20]/50" />

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

            {/* Right Content - Floating KPI Cards with animations */}
            <div className={`relative ${language === 'ar' ? 'lg:order-1' : ''}`}>
              {/* Custom YETO Logo SVG in center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
                <YetoLogo variant="badge" size="lg" animated />
              </div>

              {/* Loading skeleton state */}
              {kpiLoading && (
                <>
                  <div className="absolute top-0 left-0 animate-[slideInLeft_0.6s_ease-out]">
                    <KpiCardSkeleton variant="hero" />
                  </div>
                  <div className="absolute top-0 right-0 animate-[slideInRight_0.6s_ease-out_0.1s_both]">
                    <KpiCardSkeleton variant="hero" />
                  </div>
                  <div className="absolute bottom-0 left-0 animate-[slideInLeft_0.6s_ease-out_0.2s_both]">
                    <KpiCardSkeleton variant="hero" />
                  </div>
                  <div className="absolute bottom-0 right-0 animate-[slideInRight_0.6s_ease-out_0.3s_both]">
                    <KpiCardSkeleton variant="hero" />
                  </div>
                </>
              )}

              {/* KPI Cards - Only show when loaded */}
              {!kpiLoading && (
                <>
                  {/* GDP Growth Card - Top Left */}
                  <div className="absolute top-0 left-0 bg-white rounded-xl shadow-lg p-4 w-44 transform hover:scale-105 transition-all duration-300 animate-[slideInLeft_0.6s_ease-out]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-[#C0A030]/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-[#C0A030]" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {language === "ar" ? "نمو الناتج المحلي" : "GDP Growth"}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-[#107040] mb-1">{kpiData?.gdpGrowth?.value || "+2.5%"}</div>
                    <div className="text-xs text-gray-500 mb-2">
                      {language === "ar" ? "نمو ربع سنوي" : "Quarterly Growth"}
                    </div>
                    <Sparkline data={kpiData?.gdpGrowth?.trend || [20, 30, 25, 40, 35, 50, 45, 60, 55, 70, 80, 90]} color="#107040" />
                  </div>

                  {/* Inflation Rate Card - Top Right */}
                  <div className="absolute top-0 right-0 bg-white rounded-xl shadow-lg p-4 w-44 transform hover:scale-105 transition-all duration-300 animate-[slideInRight_0.6s_ease-out_0.1s_both]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-[#C0A030]/20 rounded-lg flex items-center justify-center">
                        <Coins className="w-4 h-4 text-[#C0A030]" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {language === "ar" ? "معدل التضخم" : "Inflation Rate"}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-[#107040] mb-1">{kpiData?.inflation?.value || "15.0%"}</div>
                    <div className="text-xs text-gray-500 mb-2">
                      {language === "ar" ? "سنوي" : "Year-over-Year"}
                    </div>
                    <Sparkline data={kpiData?.inflation?.trend || [40, 45, 50, 55, 60, 55, 60, 65, 70, 75, 80, 85]} color="#107040" />
                  </div>

                  {/* Exchange Rate % Card - Bottom Left */}
                  <div className="absolute bottom-0 left-0 bg-white rounded-xl shadow-lg p-4 w-44 transform hover:scale-105 transition-all duration-300 animate-[slideInLeft_0.6s_ease-out_0.2s_both]">
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
                    <div className="text-2xl font-bold text-[#107040] mb-1">{kpiData?.exchangeRateYoY?.value || "51.9%"}</div>
                    <div className="text-xs text-gray-500 mb-2">
                      {language === "ar" ? "التغير السنوي" : "YoY Change"}
                    </div>
                    <Sparkline data={kpiData?.exchangeRateYoY?.trend || [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85]} color="#107040" />
                  </div>

                  {/* Exchange Rate Value Card - Bottom Right */}
                  <div className="absolute bottom-0 right-0 bg-white rounded-xl shadow-lg p-4 w-44 transform hover:scale-105 transition-all duration-300 animate-[slideInRight_0.6s_ease-out_0.3s_both]">
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
                    <div className="text-xl font-bold text-[#107040] mb-1">{kpiData?.exchangeRateAden?.value || "1 USD = 1,620 YER"}</div>
                    <div className="text-xs text-gray-500 mb-2">
                      {language === "ar" ? "سعر عدن الموازي" : "Aden Parallel Rate"}
                    </div>
                    <Sparkline data={kpiData?.exchangeRateAden?.trend || [50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72]} color="#107040" />
                  </div>
                </>
              )}

              {/* Spacer for card positioning */}
              <div className="h-80"></div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards Row - Unique indicators not shown in hero (Foreign Reserves, IDPs) */}
      <section id="kpi-stats" className="py-8 bg-[#1B5E20]">
        <div className="container">
          <StaggeredContainer staggerDelay={100} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BarChart3, labelEn: "GDP Growth", labelAr: "نمو الناتج المحلي", value: kpiData?.gdpGrowth?.value || "+2.5%", trend: "up" },
              { icon: Coins, labelEn: "Inflation Rate", labelAr: "معدل التضخم", value: kpiData?.inflation?.value || "15.0%", trend: "up" },
              { icon: Globe, labelEn: "Foreign Reserves", labelAr: "الاحتياطيات الأجنبية", value: kpiData?.foreignReserves?.value || "$1.2B", trend: "down" },
              { icon: Users, labelEn: "IDPs", labelAr: "النازحون", value: kpiData?.idps?.value || "4.8M", trend: "stable" },
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
                    {kpi.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                    <Sparkline data={[40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]} color="#107040" height={20} />
                  </div>
                </div>
              </div>
            ))}
          </StaggeredContainer>
          
          {/* Data freshness indicator with enhanced badge */}
          {kpiData && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Freshness status dot */}
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                  (kpiData as any).freshnessInfo?.hoursAgo !== null && (kpiData as any).freshnessInfo?.hoursAgo < 24
                    ? "bg-green-500"
                    : (kpiData as any).freshnessInfo?.hoursAgo !== null && (kpiData as any).freshnessInfo?.hoursAgo < 168
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`} />
                
                {/* Freshness label */}
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {language === "ar" ? "آخر تحديث: " : "Updated: "}
                  {(kpiData as any).freshnessInfo?.hoursAgo !== null ? (
                    (kpiData as any).freshnessInfo?.hoursAgo < 1 ? (
                      language === "ar" ? "الآن" : "Just now"
                    ) : (kpiData as any).freshnessInfo?.hoursAgo < 24 ? (
                      language === "ar" 
                        ? `منذ ${(kpiData as any).freshnessInfo?.hoursAgo} ساعة`
                        : `${(kpiData as any).freshnessInfo?.hoursAgo}h ago`
                    ) : (kpiData as any).freshnessInfo?.hoursAgo < 48 ? (
                      language === "ar" ? "أمس" : "Yesterday"
                    ) : (
                      language === "ar"
                        ? `منذ ${Math.floor((kpiData as any).freshnessInfo?.hoursAgo / 24)} يوم`
                        : `${Math.floor((kpiData as any).freshnessInfo?.hoursAgo / 24)}d ago`
                    )
                  ) : (
                    language === "ar" ? "غير معروف" : "Unknown"
                  )}
                </span>
                
                {/* Separator */}
                <span className="text-gray-300 dark:text-gray-600">|</span>
                
                {/* Auto-update indicator */}
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {language === "ar" ? "تحديث تلقائي" : "Auto-refresh"}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sector Cards with Images - All 15 sectors */}
      <section id="sectors" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <AnimatedSection animation="fadeInUp" className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300">
              {language === "ar" ? "استكشف القطاعات الاقتصادية" : "Explore Economic Sectors"}
            </h2>
          </AnimatedSection>
          <StaggeredContainer staggerDelay={80} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sectorsWithImages.map((sector, index) => (
              <Link key={index} href={sector.href}>
                <div className="relative rounded-xl overflow-hidden h-40 group cursor-pointer
                  transition-all duration-500 ease-out
                  hover:shadow-2xl hover:-translate-y-2 hover:ring-4 hover:ring-[#107040]/30">
                  <img 
                    src={sector.image} 
                    alt={language === "ar" ? sector.nameAr : sector.nameEn}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-all duration-500 group-hover:from-[#107040]/90 group-hover:via-[#107040]/40" />
                  <div className="absolute bottom-3 left-3 right-3 transition-transform duration-300 group-hover:translate-y-[-4px]">
                    <h3 className="text-sm font-bold text-white transition-all duration-300 group-hover:text-[#C0A030] leading-tight">
                      {language === "ar" ? sector.nameAr : sector.nameEn}
                    </h3>
                    <div className="h-0.5 w-0 bg-[#C0A030] transition-all duration-500 group-hover:w-full mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* Trusted Data Sources Section */}
      <section className="py-12 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
        <div className="container">
          <AnimatedSection animation="fadeInUp" className="text-center mb-8">
            <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {language === "ar" ? "مصادر البيانات الموثوقة" : "Trusted Data Sources"}
            </h2>
          </AnimatedSection>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-24 flex items-center justify-center">
                <span className="text-xl font-bold text-[#003366]">World Bank</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-24 flex items-center justify-center">
                <span className="text-xl font-bold text-[#003366]">IMF</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-24 flex items-center justify-center">
                <span className="text-xl font-bold text-[#0072BC]">OCHA</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-24 flex items-center justify-center">
                <span className="text-xl font-bold text-[#CF4A00]">WFP</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-24 flex items-center justify-center">
                <span className="text-lg font-bold text-[#103050]">CBY Aden</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-24 flex items-center justify-center">
                <span className="text-xl font-bold text-[#00AEEF]">UNHCR</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-24 flex items-center justify-center">
                <span className="text-lg font-bold text-[#E31837]">Sana'a Center</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exchange Rate Trends Section */}
      <section id="exchange-rates" className="py-16 bg-white dark:bg-gray-800">
        <div className="container">
          <AnimatedSection animation="fadeInUp">
            <ExchangeRateChart />
          </AnimatedSection>
        </div>
      </section>

      {/* Latest Updates Section - Matching mockup IMG_1499 */}
      <section id="updates" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <AnimatedSection animation="fadeInUp">
            <h2 className="text-3xl font-bold text-center text-[#103050] dark:text-white mb-12">
              {language === "ar" ? "آخر التحديثات" : "Latest Updates"}
            </h2>
          </AnimatedSection>

          <StaggeredContainer staggerDelay={150} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </StaggeredContainer>
        </div>
      </section>

      {/* Features Grid - Matching mockup IMG_1498 */}
      <section id="features" className="py-16 bg-white dark:bg-gray-950">
        <div className="container">
          <AnimatedSection animation="fadeInUp" className={`text-center mb-12 ${language === 'ar' ? 'text-right' : ''}`}>
            <h2 className="text-3xl font-bold text-[#103050] dark:text-white mb-4">
              {language === "ar" ? "أدوات وميزات المنصة" : "Platform Tools & Features"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {language === "ar" 
                ? "استفد من مجموعة شاملة من الأدوات لتحليل البيانات الاقتصادية"
                : "Leverage a comprehensive suite of tools for economic data analysis"}
            </p>
          </AnimatedSection>

          <StaggeredContainer staggerDelay={100} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 overflow-hidden bg-white dark:bg-gray-800">
                  <CardContent className="p-0">
                    {/* Gradient header */}
                    <div className={`bg-gradient-to-r ${feature.color} p-4 flex items-center justify-between`}>
                      <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs font-medium text-white/90 bg-white/20 px-3 py-1 rounded-full">
                        {language === "ar" ? feature.statsAr : feature.stats}
                      </span>
                    </div>
                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-[#103050] dark:text-white mb-2 group-hover:text-[#107040] transition-colors">
                        {language === "ar" ? feature.titleAr : feature.titleEn}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {language === "ar" ? feature.descAr : feature.descEn}
                      </p>
                      <div className="mt-4 flex items-center text-[#107040] font-medium text-sm group-hover:translate-x-1 transition-transform">
                        {language === "ar" ? "استكشف" : "Explore"}
                        <ArrowRight className={`h-4 w-4 ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#103050] text-white">
        <div className="container">
          <AnimatedSection animation="scaleIn" className="max-w-3xl mx-auto text-center">
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
          </AnimatedSection>
        </div>
      </section>

      {/* Footer Attribution */}
      <section className="py-6 bg-[#0D2818] text-white/60 text-center text-sm">
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

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
