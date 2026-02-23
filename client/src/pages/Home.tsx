import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import InsightsTicker from "@/components/InsightsTicker";
import { WelcomeTour } from "@/components/onboarding/WelcomeTour";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  ArrowRight, 
  BarChart3, 
  Database, 
  FileText, 
  TrendingUp,
  Brain,
  Search,
  Coins,
  Globe,
  DollarSign,
  CheckCircle2,
  Zap,
  Lock
} from "lucide-react";
import { Link } from "wouter";
import { AnimatedSection, StaggeredContainer } from "@/components/AnimatedSection";
import { useScrollPosition } from "@/hooks/useParallax";
import { KpiCardSkeleton } from "@/components/KpiCardSkeleton";
import { ScrollToTop } from "@/components/ScrollToTop";
import ExchangeRateChart from "@/components/ExchangeRateChart";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { language } = useLanguage();
  const scrollY = useScrollPosition();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Fetch real-time KPI data
  const { data: kpiData, isLoading: kpiLoading } = trpc.dashboard.getHeroKPIs.useQuery();
  const { data: platformStatsData } = trpc.platform.getStats.useQuery();
  const { data: latestEventsData } = trpc.events.list.useQuery({ limit: 6 });

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: Database,
      titleEn: "Comprehensive Data Repository",
      titleAr: "مستودع بيانات شامل",
      descEn: "2,000+ verified economic indicators from 170+ trusted sources with complete provenance tracking",
      descAr: "أكثر من 2000 مؤشر اقتصادي من 170+ مصدر موثوق",
      href: "/data-repository",
      color: "from-[#2e8b6e] to-[#1f5a47]",
      icon_bg: "bg-[#2e8b6e]"
    },
    {
      icon: BarChart3,
      titleEn: "Interactive Analytics",
      titleAr: "تحليلات تفاعلية",
      descEn: "Customizable dashboards with real-time updates and regime-specific comparisons",
      descAr: "لوحات معلومات قابلة للتخصيص مع تحديثات فورية",
      href: "/dashboard",
      color: "from-[#6b8e6b] to-[#2e8b6e]",
      icon_bg: "bg-[#6b8e6b]"
    },
    {
      icon: Brain,
      titleEn: "AI Intelligence",
      titleAr: "ذكاء اصطناعي",
      descEn: "Ask questions in natural language and get evidence-backed answers with citations",
      descAr: "اطرح أسئلة واحصل على إجابات مدعومة بالأدلة",
      href: "/ai-assistant",
      color: "from-[#d4a528] to-[#a88a1f]",
      icon_bg: "bg-[#d4a528]"
    },
    {
      icon: FileText,
      titleEn: "Report Builder",
      titleAr: "منشئ التقارير",
      descEn: "Generate professional reports with charts, analysis, and export to PDF/Excel",
      descAr: "إنشاء تقارير احترافية وتصديرها",
      href: "/report-builder",
      color: "from-[#1f2d1d] to-[#2a3a28]",
      icon_bg: "bg-[#1f2d1d]"
    },
    {
      icon: TrendingUp,
      titleEn: "Scenario Simulator",
      titleAr: "محاكي السيناريوهات",
      descEn: "Model policy impacts with ML-powered predictions and what-if analysis",
      descAr: "نمذجة تأثيرات السياسات والتنبؤ",
      href: "/scenario-simulator",
      color: "from-[#2a3a28] to-[#6b8e6b]",
      icon_bg: "bg-[#2a3a28]"
    },
    {
      icon: Search,
      titleEn: "Research Library",
      titleAr: "مكتبة الأبحاث",
      descEn: "500+ publications from 50+ international and local sources",
      descAr: "أكثر من 500 منشور من 50+ مصدر",
      href: "/research",
      color: "from-[#2e8b6e] to-[#6b8e6b]",
      icon_bg: "bg-[#2e8b6e]"
    },
  ];

  const sectors = [
    { nameEn: "Trade", nameAr: "التجارة", href: "/sectors/trade" },
    { nameEn: "Banking", nameAr: "المصرفي", href: "/sectors/banking" },
    { nameEn: "Currency", nameAr: "العملة", href: "/sectors/currency" },
    { nameEn: "Food Security", nameAr: "الأمن الغذائي", href: "/sectors/food-security" },
    { nameEn: "Energy", nameAr: "الطاقة", href: "/sectors/energy" },
    { nameEn: "Aid Flows", nameAr: "المساعدات", href: "/sectors/aid-flows" },
    { nameEn: "Labor", nameAr: "العمل", href: "/sectors/labor-market" },
    { nameEn: "Infrastructure", nameAr: "البنية", href: "/sectors/infrastructure" },
  ];

  const latestUpdates = (latestEventsData || []).slice(0, 6).map((event) => ({
    titleEn: event.title,
    titleAr: event.titleAr || event.title,
    date: new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    href: `/sectors/${event.category || 'macroeconomy'}`,
  }));

  return (
    <div className="flex flex-col overflow-hidden">
      <WelcomeTour />
      <InsightsTicker />
      
      {/* ===== HERO SECTION - REVOLUTIONARY DESIGN ===== */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f1410] via-[#1a2318] to-[#0f1410] flex items-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2e8b6e]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C9A961]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(201, 169, 97, 0.05) 25%, rgba(201, 169, 97, 0.05) 26%, transparent 27%, transparent 74%, rgba(201, 169, 97, 0.05) 75%, rgba(201, 169, 97, 0.05) 76%, transparent 77%, transparent),
                           linear-gradient(90deg, transparent 24%, rgba(201, 169, 97, 0.05) 25%, rgba(201, 169, 97, 0.05) 26%, transparent 27%, transparent 74%, rgba(201, 169, 97, 0.05) 75%, rgba(201, 169, 97, 0.05) 76%, transparent 77%, transparent)`,
          backgroundSize: '50px 50px'
        }} />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className={`${language === 'ar' ? 'lg:order-2 text-right' : ''}`}>
              {/* Logo with animation */}
              <div className="mb-8 flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-3 bg-gradient-to-r from-[#C9A961]/30 to-transparent rounded-lg blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029421755/YEGPLugduSkSNneV.png" alt="CauseWay" className="relative h-20 md:h-24 w-auto drop-shadow-2xl hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="h-16 w-px bg-gradient-to-b from-[#C9A961]/0 via-[#C9A961]/50 to-[#C9A961]/0" />
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-[0.4em] text-[#C9A961] font-light">Observatory</span>
                  <span className="text-xs text-white/50 mt-1 font-light">{language === 'ar' ? 'مرصد' : 'Yemen'}</span>
                </div>
              </div>

              {/* Main heading with gradient */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                {language === "ar" ? (
                  <>
                    <span className="text-white/95">مرصد</span>
                    <br />
                    <span className="bg-gradient-to-r from-[#C9A961] via-[#d4af37] to-[#C9A961] bg-clip-text text-transparent">الشفافية</span>
                    <br />
                    <span className="text-white/95">الاقتصادية</span>
                  </>
                ) : (
                  <>
                    <span className="text-white/95">Economic</span>
                    <br />
                    <span className="bg-gradient-to-r from-[#C9A961] via-[#d4af37] to-[#C9A961] bg-clip-text text-transparent">Transparency</span>
                    <br />
                    <span className="text-white/95">Observatory</span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/70 max-w-lg leading-relaxed mb-8 font-light">
                {language === "ar"
                  ? "إضاءة مسار اليمن نحو التعافي الاقتصادي من خلال المساءلة المبنية على البيانات"
                  : "Illuminating Yemen's path to economic recovery through evidence-based intelligence"}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-[#C9A961] to-[#b8964d] hover:from-[#d4af37] hover:to-[#C9A961] text-[#0f1410] font-bold gap-2 px-8 py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    {language === "ar" ? "استكشف البيانات" : "Explore Data"}
                    <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </Button>
                </Link>
                <Link href="/research">
                  <Button size="lg" variant="outline" className="bg-white/5 border-2 border-[#C9A961]/40 hover:border-[#C9A961] hover:bg-[#C9A961]/10 text-white px-8 py-6 rounded-lg backdrop-blur-sm transition-all duration-300">
                    {language === "ar" ? "اعرف المزيد" : "Learn More"}
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#C9A961]" />
                  <span className="text-sm text-white/70">{language === 'ar' ? '170+ مصدر موثوق' : '170+ Trusted Sources'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#C9A961]" />
                  <span className="text-sm text-white/70">{language === 'ar' ? '2000+ مؤشر' : '2000+ Indicators'}</span>
                </div>
              </div>
            </div>

            {/* Right: KPI Cards */}
            <div className={`relative min-h-[500px] ${language === 'ar' ? 'lg:order-1' : ''}`}>
              {/* Central glow */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
                <div className="relative w-56 h-56">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C9A961]/15 to-transparent rounded-full blur-3xl" />
                  <div className="absolute inset-12 border border-[#C9A961]/20 rounded-full" />
                </div>
              </div>

              {/* KPI Cards Grid */}
              {kpiLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {/* GDP Card */}
                  <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-[#C9A961]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A961]/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#C9A961] to-[#b8964d] rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">GDP</span>
                    </div>
                    <div className="text-3xl font-bold text-[#C9A961] mb-1">{kpiData?.gdpGrowth?.value || "+2.5%"}</div>
                    <div className="text-xs text-white/50">{language === "ar" ? "نمو سنوي" : "Annual Growth"}</div>
                  </div>

                  {/* Inflation Card */}
                  <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-[#C9A961]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A961]/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#2e8b6e] to-[#1f5a47] rounded-lg flex items-center justify-center">
                        <Coins className="w-5 h-5 text-[#C9A961]" />
                      </div>
                      <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Inflation</span>
                    </div>
                    <div className="text-3xl font-bold text-[#C9A961] mb-1">{kpiData?.inflation?.value || "15.0%"}</div>
                    <div className="text-xs text-white/50">{language === "ar" ? "سنوي" : "Year-over-Year"}</div>
                  </div>

                  {/* Exchange Rate % Card */}
                  <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-[#C9A961]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A961]/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#C9A961] to-[#b8964d] rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">FX %</span>
                    </div>
                    <div className="text-3xl font-bold text-[#C9A961] mb-1">{kpiData?.exchangeRateYoY?.value || "+4.5%"}</div>
                    <div className="text-xs text-white/50">{language === "ar" ? "التغير السنوي" : "YoY Change"}</div>
                  </div>

                  {/* Exchange Rate Value Card */}
                  <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-[#C9A961]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A961]/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#2e8b6e] to-[#1f5a47] rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-[#C9A961]" />
                      </div>
                      <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-[#C9A961] mb-1">{kpiData?.exchangeRateAden?.value || "1,620"}</div>
                    <div className="text-xs text-white/50">{language === "ar" ? "YER/USD" : "YER/USD"}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-white/50 uppercase tracking-widest">{language === 'ar' ? 'اسحب' : 'Scroll'}</span>
            <svg className="w-5 h-5 text-[#C9A961]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Data Sources Bar */}
      <section className="py-6 bg-gradient-to-r from-[#1f2d1d] to-[#0f1410] border-t border-[#C9A961]/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            <span className="text-white/60 text-sm font-medium uppercase tracking-wider">
              {language === "ar" ? "مصادر موثوقة:" : "Trusted Sources:"}
            </span>
            {['World Bank', 'IMF', 'UN OCHA', 'WFP', 'CBY'].map((source, i) => (
              <React.Fragment key={source}>
                <span className="text-white/80 font-medium text-sm">{source}</span>
                {i < 4 && <span className="text-white/20">|</span>}
              </React.Fragment>
            ))}
            <span className="text-[#C9A961] font-semibold text-sm">+170 {language === "ar" ? "مصدر" : "sources"}</span>
          </div>
        </div>
      </section>

      {/* Exchange Rate Chart */}
      <section className="py-16 bg-white/2 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp">
            <ExchangeRateChart />
          </AnimatedSection>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="py-16 bg-gradient-to-b from-[#0f1410] to-[#1a2318]">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp">
            <h2 className="text-4xl font-bold text-center text-white mb-4">
              {language === "ar" ? "آخر التحديثات" : "Latest Updates"}
            </h2>
            <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
              {language === "ar" 
                ? "تابع أحدث المؤشرات الاقتصادية والتطورات"
                : "Stay updated with the latest economic indicators"}
            </p>
          </AnimatedSection>

          <StaggeredContainer staggerDelay={100} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestUpdates.map((update, index) => (
              <Link key={index} href={update.href}>
                <div className="group relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-[#C9A961]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A961]/10 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#C9A961] to-[#b8964d] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-white/50 font-medium">{update.date}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#C9A961] transition-colors">
                    {language === "ar" ? update.titleAr : update.titleEn}
                  </h3>
                  <div className="flex items-center gap-2 text-[#C9A961] font-medium text-sm group-hover:gap-3 transition-all">
                    {language === "ar" ? "اقرأ المزيد" : "Read More"}
                    <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </Link>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-b from-[#1a2318] to-[#0f1410]">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              {language === "ar" ? "الأدوات والميزات" : "Tools & Features"}
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              {language === "ar" 
                ? "مجموعة شاملة من الأدوات المتقدمة لتحليل البيانات الاقتصادية"
                : "Comprehensive suite of advanced tools for economic analysis"}
            </p>
          </AnimatedSection>

          <StaggeredContainer staggerDelay={100} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div className="group relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-[#C9A961]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A961]/10 cursor-pointer h-full">
                  {/* Gradient header */}
                  <div className={`bg-gradient-to-r ${feature.color} p-6 flex items-center justify-between`}>
                    <div className={`${feature.icon_bg} p-3 rounded-lg`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <Zap className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-white mb-3 group-hover:text-[#C9A961] transition-colors">
                      {language === "ar" ? feature.titleAr : feature.titleEn}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed mb-4">
                      {language === "ar" ? feature.descAr : feature.descEn}
                    </p>
                    <div className="flex items-center gap-2 text-[#C9A961] font-medium text-sm group-hover:gap-3 transition-all">
                      {language === "ar" ? "استكشف" : "Explore"}
                      <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* Sectors Grid */}
      <section className="py-20 bg-gradient-to-b from-[#0f1410] to-[#1a2318]">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              {language === "ar" ? "القطاعات الاقتصادية" : "Economic Sectors"}
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              {language === "ar" 
                ? "استكشف البيانات والتحليلات لكل قطاع"
                : "Explore data and analytics for each sector"}
            </p>
          </AnimatedSection>

          <StaggeredContainer staggerDelay={80} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sectors.map((sector, index) => (
              <Link key={index} href={sector.href}>
                <div className="group relative bg-gradient-to-br from-[#2e8b6e]/20 to-[#C9A961]/10 backdrop-blur-md border border-white/10 rounded-xl p-4 h-32 flex items-center justify-center text-center hover:border-[#C9A961]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#C9A961]/10 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-xl group-hover:from-[#C9A961]/60 group-hover:via-[#C9A961]/20 transition-all duration-300" />
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#C9A961] transition-colors leading-tight">
                      {language === "ar" ? sector.nameAr : sector.nameEn}
                    </h3>
                    <div className="h-0.5 w-0 bg-[#C9A961] transition-all duration-500 group-hover:w-full mt-2 mx-auto" />
                  </div>
                </div>
              </Link>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#2C3424] via-[#1a2318] to-[#0f1410] border-t border-[#C9A961]/20">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection animation="fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {language === "ar" 
                ? "ابدأ استكشاف البيانات اليوم"
                : "Start Exploring Today"}
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-8 text-lg">
              {language === "ar"
                ? "انضم إلى مئات الباحثين وصانعي السياسات"
                : "Join hundreds of researchers and policymakers"}
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-[#C9A961] to-[#b8964d] hover:from-[#d4af37] hover:to-[#C9A961] text-[#0f1410] font-bold gap-2 px-8 py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                {language === "ar" ? "استكشف لوحة البيانات" : "Explore Dashboard"}
                <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <ScrollToTop />
    </div>
  );
}
