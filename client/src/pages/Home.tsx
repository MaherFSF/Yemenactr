import { useState, useEffect } from "react";
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
      titleEn: "Research Library",
      titleAr: "مكتبة البحث",
      descEn: "Curated reports, analysis, and policy briefs from leading economists and researchers",
      descAr: "تقارير منسقة وتحليلات من الاقتصاديين الرائدين",
      href: "/research",
      color: "from-[#2e8b6e] to-[#1f5a47]",
      icon_bg: "bg-[#2e8b6e]"
    },
    {
      icon: TrendingUp,
      titleEn: "Scenario Modeling",
      titleAr: "نمذجة السيناريوهات",
      descEn: "Simulate economic outcomes under different policy scenarios and interventions",
      descAr: "محاكاة النتائج الاقتصادية تحت سيناريوهات مختلفة",
      href: "/scenario-simulator",
      color: "from-[#d4a528] to-[#a88a1f]",
      icon_bg: "bg-[#d4a528]"
    },
    {
      icon: Globe,
      titleEn: "Live Data",
      titleAr: "البيانات المباشرة",
      descEn: "Real-time economic indicators from World Bank and international sources",
      descAr: "مؤشرات اقتصادية فورية من البنك الدولي والمصادر الدولية",
      href: "/live-data",
      color: "from-[#2e8b6e] to-[#1f5a47]",
      icon_bg: "bg-[#2e8b6e]"
    }
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      <WelcomeTour />
      <InsightsTicker />
      
      {/* ===== ELITE OBSERVATORY HERO SECTION ===== */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f1410] via-[#1a2318] to-[#0f1410] flex items-center">
        {/* Yemen Map Background with parallax effect */}
        <div className="absolute inset-0 opacity-50 md:opacity-60" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
          <img src="https://d2xsxph8kpxj0f.cloudfront.net/310419663029421755/XodoyKMzPdFiKkVj3QFTGK/yemen-map-hero_94bf3551.png" alt="Yemen Economic Map" className="w-full h-full object-cover" />
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1410]/98 via-[#0f1410]/80 to-[#0f1410]/40" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            {/* Observatory Badge */}
            <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#C9A961]/10 border border-[#C9A961]/30 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-[#C9A961] animate-pulse" />
              <span className="text-sm uppercase tracking-widest text-[#C9A961] font-light">Elite Global Observatory</span>
            </div>

            {/* Main heading with elite positioning */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight">
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

            {/* Strategic positioning tagline */}
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl leading-relaxed mb-4 font-light">
              {language === "ar"
                ? "لعقد من الزمان، تم اتخاذ القرارات في الظلام. حان الوقت للتغيير."
                : "For a decade, decisions have been made in the dark. Something is about to change."}
            </p>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mb-8 font-light">
              {language === "ar"
                ? "إضاءة مسار اليمن نحو التعافي الاقتصادي من خلال المساءلة المبنية على البيانات والذكاء الاستراتيجي"
                : "Illuminating Yemen's path to economic recovery through evidence-based intelligence and strategic accountability"}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/live-data">
                <Button size="lg" className="bg-gradient-to-r from-[#C9A961] to-[#b8964d] hover:from-[#d4af37] hover:to-[#C9A961] text-[#0f1410] font-bold gap-2 px-8 py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  {language === "ar" ? "استكشف البيانات المباشرة" : "View Live Data"}
                  <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="bg-white/5 border-2 border-[#C9A961]/40 hover:border-[#C9A961] hover:bg-[#C9A961]/10 text-white px-8 py-6 rounded-lg backdrop-blur-sm transition-all duration-300">
                  {language === "ar" ? "لوحة المعلومات" : "Dashboard"}
                </Button>
              </Link>
            </div>

            {/* Trust badges with elite positioning */}
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#C9A961]" />
                <span className="text-sm text-white/70">{language === 'ar' ? '170+ مصدر موثوق عالمياً' : '170+ Global Trusted Sources'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#C9A961]" />
                <span className="text-sm text-white/70">{language === 'ar' ? '2000+ مؤشر اقتصادي' : '2000+ Economic Indicators'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#C9A961]" />
                <span className="text-sm text-white/70">{language === 'ar' ? 'تحديثات فورية' : 'Real-time Updates'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#C9A961]/40 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-[#C9A961] rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ===== KEY FEATURES SECTION ===== */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-[#0f1410] to-[#1a2318]">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              {language === "ar" ? "قدرات المرصد" : "Observatory Capabilities"}
            </h2>
            <p className="text-lg text-white/60">
              {language === "ar"
                ? "أدوات متقدمة مصممة للمحللين والسياسيين والباحثين"
                : "Advanced tools designed for analysts, policymakers, and researchers"}
            </p>
          </div>

          {/* Features Grid */}
          <StaggeredContainer>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <AnimatedSection key={idx} delay={idx * 0.1}>
                    <Link href={feature.href}>
                      <Card className="group relative h-full overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-[#C9A961]/50 transition-all duration-300 hover:shadow-xl cursor-pointer">
                        <CardContent className="p-6 h-full flex flex-col">
                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-lg ${feature.icon_bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-[#C9A961] transition-colors duration-300">
                            {language === "ar" ? feature.titleAr : feature.titleEn}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-white/60 flex-grow mb-4">
                            {language === "ar" ? feature.descAr : feature.descEn}
                          </p>

                          {/* Arrow */}
                          <div className="flex items-center gap-2 text-[#C9A961] group-hover:gap-3 transition-all duration-300">
                            <span className="text-sm font-medium">{language === "ar" ? "اكتشف" : "Explore"}</span>
                            <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </AnimatedSection>
                );
              })}
            </div>
          </StaggeredContainer>
        </div>
      </section>

      {/* ===== KPI SECTION ===== */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-[#1a2318] to-[#0f1410]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-white text-center">
            {language === "ar" ? "مؤشرات المنصة" : "Platform Metrics"}
          </h2>

          {/* KPI Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiLoading ? (
              <>
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
              </>
            ) : (
              kpiData && [
                { label: 'GDP Growth', value: kpiData.gdpGrowth?.value, change: kpiData.gdpGrowth?.subtext },
                { label: 'Inflation (Aden)', value: kpiData.inflation?.value, change: kpiData.inflation?.subtext },
                { label: 'Exchange Rate (Aden)', value: kpiData.exchangeRateAden?.value, change: kpiData.exchangeRateAden?.subtext },
                { label: 'Foreign Reserves', value: kpiData.foreignReserves?.value, change: kpiData.foreignReserves?.subtext },
              ].map((kpi, idx) => (
                <AnimatedSection key={idx} delay={idx * 0.1}>
                  <Card className="relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white/70">{kpi.label}</h3>
                        <Zap className="w-4 h-4 text-[#C9A961]" />
                      </div>
                      <div className="text-3xl font-bold text-[#C9A961] mb-2">{kpi.value}</div>
                      <p className="text-xs text-white/50">{kpi.change}</p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== LIVE DATA SECTION ===== */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-[#0f1410] to-[#1a2318]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                {language === "ar" ? "بيانات حية من البنك الدولي" : "Live World Bank Data"}
              </h2>
              <p className="text-lg text-white/60 mb-8">
                {language === "ar"
                  ? "شاهد مؤشرات اليمن الاقتصادية الحقيقية مباشرة من البنك الدولي مع تحديثات فورية"
                  : "View real Yemen economic indicators directly from World Bank with live updates"}
              </p>
              <Link href="/live-data">
                <Button size="lg" className="bg-gradient-to-r from-[#C9A961] to-[#b8964d] hover:from-[#d4af37] hover:to-[#C9A961] text-[#0f1410] font-bold gap-2 px-8 py-6 rounded-lg shadow-xl">
                  {language === "ar" ? "عرض البيانات المباشرة" : "View Live Data"}
                  <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </Button>
              </Link>
            </div>
            <div className="relative h-80 rounded-lg overflow-hidden">
              <ExchangeRateChart />
            </div>
          </div>
        </div>
      </section>

      <ScrollToTop />
    </div>
  );
}
