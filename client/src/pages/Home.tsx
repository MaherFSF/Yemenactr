import { useState, useEffect, useMemo } from "react";
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
  Globe,
  DollarSign,
  CheckCircle2,
  Zap,
  Building2,
  Users,
  ShieldCheck,
  BookOpen,
  Landmark,
  Heart,
  Wheat,
  Factory,
  Scale,
  Banknote,
  GraduationCap,
  Newspaper,
  LineChart,
  Search,
  ChevronRight,
  Activity,
  Eye
} from "lucide-react";
import { Link } from "wouter";
import { AnimatedSection, StaggeredContainer } from "@/components/AnimatedSection";
import { useScrollPosition } from "@/hooks/useParallax";
import { KpiCardSkeleton } from "@/components/KpiCardSkeleton";
import { ScrollToTop } from "@/components/ScrollToTop";
import ExchangeRateChart from "@/components/ExchangeRateChart";
import { useLanguage } from "@/contexts/LanguageContext";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029421755/XodoyKMzPdFiKkVj3QFTGK";

export default function Home() {
  const { language } = useLanguage();
  const scrollY = useScrollPosition();
  const isAr = language === "ar";

  // Fetch real-time KPI data
  const { data: kpiData, isLoading: kpiLoading } = trpc.dashboard.getHeroKPIs.useQuery();
  const { data: platformStatsData } = trpc.platform.getStats.useQuery();

  const sectors = useMemo(() => [
    { icon: Banknote, nameEn: "Banking & Finance", nameAr: "القطاع المصرفي والمالي", href: "/sectors/banking", color: "#2e8b6e", img: `${CDN}/banking_65581ee9.png` },
    { icon: TrendingUp, nameEn: "Macroeconomy", nameAr: "الاقتصاد الكلي", href: "/sectors/macroeconomy", color: "#1f5a47", img: `${CDN}/economy_66ec8c86.jpg` },
    { icon: DollarSign, nameEn: "Currency & Exchange", nameAr: "العملة وسعر الصرف", href: "/sectors/currency", color: "#C9A961", img: `${CDN}/economy_66ec8c86.jpg` },
    { icon: Globe, nameEn: "Trade & Exports", nameAr: "التجارة والصادرات", href: "/sectors/trade", color: "#2e8b6e", img: `${CDN}/trade_1b2ab09c.jpg` },
    { icon: BarChart3, nameEn: "Consumer Prices", nameAr: "أسعار المستهلك", href: "/sectors/prices", color: "#d4a528", img: `${CDN}/consumer-prices_a112081b.png` },
    { icon: Users, nameEn: "Labor Market", nameAr: "سوق العمل", href: "/sectors/labor", color: "#6b8e6b", img: `${CDN}/labor_00072783.jpg` },
    { icon: Heart, nameEn: "Humanitarian", nameAr: "الوضع الإنساني", href: "/sectors/humanitarian", color: "#c0392b", img: `${CDN}/humanitarian_bdbf1206.jpg` },
    { icon: Wheat, nameEn: "Food Security", nameAr: "الأمن الغذائي", href: "/sectors/food-security", color: "#8B6914", img: `${CDN}/food-security_2e0a7aff.jpg` },
    { icon: Zap, nameEn: "Energy", nameAr: "الطاقة", href: "/sectors/energy", color: "#e67e22", img: `${CDN}/economy_66ec8c86.jpg` },
    { icon: Landmark, nameEn: "Public Finance", nameAr: "المالية العامة", href: "/sectors/public-finance", color: "#1f5a47", img: `${CDN}/economy_66ec8c86.jpg` },
    { icon: Scale, nameEn: "Poverty", nameAr: "الفقر", href: "/sectors/poverty", color: "#7f8c8d", img: `${CDN}/GDypaRhOTKgU_efb239d0.jpg` },
    { icon: Factory, nameEn: "Infrastructure", nameAr: "البنية التحتية", href: "/sectors/infrastructure", color: "#34495e", img: `${CDN}/economy_66ec8c86.jpg` },
    { icon: Wheat, nameEn: "Agriculture", nameAr: "الزراعة", href: "/sectors/agriculture", color: "#27ae60", img: `${CDN}/agriculture_2d0af715.jpg` },
    { icon: Building2, nameEn: "Investment", nameAr: "الاستثمار", href: "/sectors/investment", color: "#2980b9", img: `${CDN}/economy_66ec8c86.jpg` },
    { icon: Banknote, nameEn: "Microfinance", nameAr: "التمويل الأصغر", href: "/sectors/microfinance", color: "#16a085", img: `${CDN}/banking_65581ee9.png` },
    { icon: ShieldCheck, nameEn: "Conflict Economy", nameAr: "اقتصاد النزاع", href: "/sectors/conflict-economy", color: "#c0392b", img: `${CDN}/humanitarian_bdbf1206.jpg` },
  ], []);

  const audiences = useMemo(() => [
    { icon: Landmark, labelEn: "Government Officials", labelAr: "المسؤولون الحكوميون", descEn: "Policy briefs, fiscal analysis, and strategic intelligence for ministries and central bank leadership", descAr: "إحاطات سياسية وتحليل مالي واستخبارات استراتيجية للوزارات وقيادة البنك المركزي", href: "/vip-cockpit" },
    { icon: Globe, labelEn: "International Organizations", labelAr: "المنظمات الدولية", descEn: "Donor accountability, humanitarian data, and programme impact analysis for UN agencies and World Bank", descAr: "مساءلة المانحين وبيانات إنسانية وتحليل أثر البرامج لوكالات الأمم المتحدة والبنك الدولي", href: "/dashboard" },
    { icon: GraduationCap, labelEn: "Researchers & Academics", labelAr: "الباحثون والأكاديميون", descEn: "1,767+ publications, time series since 2010, and advanced analytical tools for rigorous economic research", descAr: "أكثر من 1,767 منشور وسلاسل زمنية منذ 2010 وأدوات تحليلية متقدمة للبحث الاقتصادي", href: "/research" },
    { icon: Newspaper, labelEn: "Journalists & Media", labelAr: "الصحفيون والإعلام", descEn: "Verified data, real-time indicators, and visual tools for evidence-based economic reporting on Yemen", descAr: "بيانات موثقة ومؤشرات فورية وأدوات بصرية للتقارير الاقتصادية المبنية على الأدلة", href: "/live-data" },
    { icon: Users, labelEn: "Citizens", labelAr: "المواطنون", descEn: "Understand how the economy affects your daily life — prices, jobs, currency, and food security explained simply", descAr: "افهم كيف يؤثر الاقتصاد على حياتك اليومية — الأسعار والوظائف والعملة والأمن الغذائي بشكل مبسط", href: "/ai-assistant" },
    { icon: Building2, labelEn: "Banks & Private Sector", labelAr: "البنوك والقطاع الخاص", descEn: "Banking sector intelligence, compliance monitoring, market analysis, and investment climate assessment", descAr: "استخبارات القطاع المصرفي ومراقبة الامتثال وتحليل السوق وتقييم مناخ الاستثمار", href: "/sectors/banking" },
  ], []);

  const capabilities = useMemo(() => [
    { icon: Database, titleEn: "7,868+ Data Points", titleAr: "أكثر من 7,868 نقطة بيانات", descEn: "Verified economic indicators from 292 sources with full provenance tracking since 2010", descAr: "مؤشرات اقتصادية موثقة من 292 مصدر مع تتبع كامل للمصادر منذ 2010", href: "/data-repository" },
    { icon: Brain, titleEn: "8 Expert AI Agents", titleAr: "8 وكلاء ذكاء اصطناعي", descEn: "Sector-specific AI analysts trained on the full knowledge base — ask anything about Yemen's economy", descAr: "محللون بالذكاء الاصطناعي متخصصون بالقطاعات ومدربون على قاعدة المعرفة الكاملة", href: "/ai-assistant" },
    { icon: BookOpen, titleEn: "1,767+ Publications", titleAr: "أكثر من 1,767 منشور", descEn: "Academic papers, policy reports, and analysis from World Bank, IMF, UN, and leading think tanks", descAr: "أوراق أكاديمية وتقارير سياسية وتحليلات من البنك الدولي وصندوق النقد والأمم المتحدة", href: "/research" },
    { icon: LineChart, titleEn: "Advanced Analytics", titleAr: "تحليلات متقدمة", descEn: "Interactive dashboards, scenario modeling, and regime-comparison tools for deep economic analysis", descAr: "لوحات معلومات تفاعلية ونمذجة سيناريوهات وأدوات مقارنة الأنظمة للتحليل الاقتصادي العميق", href: "/dashboard" },
    { icon: Activity, titleEn: "Real-Time Monitoring", titleAr: "مراقبة فورية", descEn: "Live data feeds from World Bank, UNHCR, and connected APIs with automatic daily refresh", descAr: "بيانات حية من البنك الدولي ومفوضية اللاجئين وواجهات برمجة متصلة مع تحديث يومي تلقائي", href: "/live-data" },
    { icon: Eye, titleEn: "Full Transparency", titleAr: "شفافية كاملة", descEn: "Every figure is sourced, dated, and confidence-rated — no black boxes, no assumptions", descAr: "كل رقم موثق ومؤرخ ومصنف الثقة — لا صناديق سوداء ولا افتراضات", href: "/data-coverage" },
  ], []);

  return (
    <div className="flex flex-col overflow-hidden">
      <WelcomeTour />
      <InsightsTicker />
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0f0c] via-[#111a14] to-[#0a0f0c] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-30" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
          <img src={`${CDN}/sGPCd4uJMVg8_ebcd0e36.jpg`} alt="" className="w-full h-full object-cover" />
        </div>
        <div className={`absolute inset-0 ${isAr ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-[#0a0f0c]/95 via-[#0a0f0c]/75 to-[#0a0f0c]/50`} />
        
        {/* Decorative gold line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A961] to-transparent opacity-60" />

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32 overflow-hidden">
          <div className="max-w-4xl" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Observatory Badge */}
            <div className="mb-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#C9A961]/8 border border-[#C9A961]/25 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-[#C9A961] animate-pulse" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#C9A961]/90 font-medium">
                {isAr ? "المرصد اليمني للشفافية الاقتصادية" : "Yemen Economic Transparency Observatory"}
              </span>
            </div>

            {/* Opening Statement - The Hook */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1] tracking-tight">
              {isAr ? (
                <>
                  <span className="text-white/40 block text-2xl md:text-3xl font-light mb-3">لعقود، صُنعت القرارات في الظلام</span>
                  <span className="bg-gradient-to-r from-[#C9A961] via-[#e8d48b] to-[#C9A961] bg-clip-text text-transparent">شيء ما</span>
                  <span className="text-white"> على وشك </span>
                  <span className="bg-gradient-to-r from-[#C9A961] via-[#e8d48b] to-[#C9A961] bg-clip-text text-transparent">التغيير</span>
                </>
              ) : (
                <>
                  <span className="text-white/40 block text-2xl md:text-3xl font-light mb-3">For years, decisions have been made in darkness</span>
                  <span className="bg-gradient-to-r from-[#C9A961] via-[#e8d48b] to-[#C9A961] bg-clip-text text-transparent">Something</span>
                  <span className="text-white"> is about to </span>
                  <span className="bg-gradient-to-r from-[#C9A961] via-[#e8d48b] to-[#C9A961] bg-clip-text text-transparent">change</span>
                </>
              )}
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-3xl leading-relaxed mb-10">
              {isAr
                ? "أول مرصد اقتصادي شامل لليمن — يجمع بيانات 292 مصدراً عالمياً منذ 2010، مدعوماً بالذكاء الاصطناعي، لتمكين كل صانع قرار ومواطن وباحث من فهم الاقتصاد اليمني بعمق وشفافية غير مسبوقة."
                : "The first comprehensive economic observatory for Yemen — aggregating data from 292 global sources since 2010, powered by AI, to empower every policymaker, citizen, and researcher with unprecedented depth and transparency into Yemen's economy."}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-14">
              <Link href="/live-data">
                <Button size="lg" className="bg-gradient-to-r from-[#C9A961] to-[#b8964d] hover:from-[#d4af37] hover:to-[#C9A961] text-[#0a0f0c] font-bold gap-2 px-8 py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  {isAr ? "استكشف البيانات الحية" : "Explore Live Data"}
                  <ArrowRight className={`h-5 w-5 ${isAr ? 'rotate-180' : ''}`} />
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button size="lg" variant="outline" className="bg-white/5 border-2 border-[#C9A961]/30 hover:border-[#C9A961] hover:bg-[#C9A961]/10 text-white px-8 py-6 rounded-lg backdrop-blur-sm transition-all duration-300">
                  <Brain className="h-5 w-5 mr-2" />
                  {isAr ? "اسأل الذكاء الاصطناعي" : "Ask AI Agent"}
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="bg-white/5 border border-white/15 hover:border-white/30 hover:bg-white/10 text-white/80 px-8 py-6 rounded-lg backdrop-blur-sm transition-all duration-300">
                  {isAr ? "لوحة المعلومات" : "Dashboard"}
                </Button>
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "292", labelEn: "Global Sources", labelAr: "مصدر عالمي" },
                { value: "7,868+", labelEn: "Data Points", labelAr: "نقطة بيانات" },
                { value: "1,767+", labelEn: "Publications", labelAr: "منشور بحثي" },
                { value: "16", labelEn: "Economic Sectors", labelAr: "قطاع اقتصادي" },
              ].map((stat, i) => (
                <div key={i} className={`text-center ${isAr ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="text-2xl md:text-3xl font-bold text-[#C9A961]">{stat.value}</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider mt-1">{isAr ? stat.labelAr : stat.labelEn}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#C9A961]/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-[#C9A961] rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ===== WHO IS THIS FOR? ===== */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#0a0f0c] to-[#111a14]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {isAr ? "مصمم لكل من يهتم باقتصاد اليمن" : "Built for Everyone Who Cares About Yemen's Economy"}
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              {isAr ? "سواء كنت مسؤولاً حكومياً أو باحثاً أو صحفياً أو مواطناً — المرصد يخدمك" : "Whether you're a government official, researcher, journalist, or citizen — the Observatory serves you"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {audiences.map((a, i) => {
              const Icon = a.icon;
              return (
                <AnimatedSection key={i} delay={i * 0.08}>
                  <Link href={a.href}>
                    <div className="group relative p-6 rounded-xl bg-white/[0.03] border border-white/8 hover:border-[#C9A961]/40 transition-all duration-300 cursor-pointer h-full">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-lg bg-[#C9A961]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C9A961]/20 transition-colors">
                          <Icon className="w-5 h-5 text-[#C9A961]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-2 group-hover:text-[#C9A961] transition-colors">
                            {isAr ? a.labelAr : a.labelEn}
                          </h3>
                          <p className="text-sm text-white/45 leading-relaxed">
                            {isAr ? a.descAr : a.descEn}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-[#C9A961]/60 group-hover:text-[#C9A961] transition-colors">
                        <span className="text-xs font-medium">{isAr ? "ابدأ" : "Get Started"}</span>
                        <ChevronRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== LIVE KPIs ===== */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#111a14] to-[#0a0f0c]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {isAr ? "مؤشرات اقتصادية حية" : "Live Economic Indicators"}
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              {isAr ? "بيانات حقيقية من قاعدة البيانات — محدثة باستمرار من المصادر الدولية" : "Real data from our database — continuously updated from international sources"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {kpiLoading ? (
              <><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /></>
            ) : (
              kpiData && [
                { labelEn: 'GDP Growth', labelAr: 'نمو الناتج المحلي', value: kpiData.gdpGrowth?.value, sub: kpiData.gdpGrowth?.subtext, icon: TrendingUp },
                { labelEn: 'Inflation (Aden)', labelAr: 'التضخم (عدن)', value: kpiData.inflation?.value, sub: kpiData.inflation?.subtext, icon: BarChart3 },
                { labelEn: 'Exchange Rate', labelAr: 'سعر الصرف', value: kpiData.exchangeRateAden?.value, sub: kpiData.exchangeRateAden?.subtext, icon: DollarSign },
                { labelEn: 'Foreign Reserves', labelAr: 'الاحتياطيات الأجنبية', value: kpiData.foreignReserves?.value, sub: kpiData.foreignReserves?.subtext, icon: Landmark },
              ].map((kpi, idx) => {
                const KIcon = kpi.icon;
                return (
                  <AnimatedSection key={idx} delay={idx * 0.1}>
                    <Card className="relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/8 hover:border-[#C9A961]/30 transition-all duration-300">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">{isAr ? kpi.labelAr : kpi.labelEn}</h3>
                          <KIcon className="w-4 h-4 text-[#C9A961]/60" />
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-[#C9A961] mb-1">{kpi.value || '—'}</div>
                        <p className="text-xs text-white/40">{kpi.sub || ''}</p>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                );
              })
            )}
          </div>

          {/* Exchange Rate Chart */}
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {isAr ? "سعر الصرف — بيانات حية" : "Exchange Rate — Live Data"}
              </h3>
              <p className="text-white/50 mb-6 leading-relaxed">
                {isAr
                  ? "تتبع تحركات الريال اليمني مقابل الدولار في الوقت الحقيقي مع بيانات من البنك المركزي والسوق الموازي"
                  : "Track the Yemeni Riyal movements against the US Dollar in real-time with data from the Central Bank and parallel market"}
              </p>
              <Link href="/live-data">
                <Button className="bg-[#C9A961] hover:bg-[#d4af37] text-[#0a0f0c] font-semibold gap-2">
                  {isAr ? "عرض جميع البيانات الحية" : "View All Live Data"}
                  <ArrowRight className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
                </Button>
              </Link>
            </div>
            <div className="h-72 rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
              <ExchangeRateChart />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CAPABILITIES ===== */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#0a0f0c] to-[#111a14]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {isAr ? "قدرات لا مثيل لها" : "Unmatched Capabilities"}
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              {isAr ? "أول منصة تجمع كل مصادر البيانات الاقتصادية لليمن في مكان واحد مع ذكاء اصطناعي متقدم" : "The first platform to aggregate all Yemen economic data sources in one place with advanced AI intelligence"}
            </p>
          </div>

          <StaggeredContainer>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {capabilities.map((cap, idx) => {
                const Icon = cap.icon;
                return (
                  <AnimatedSection key={idx} delay={idx * 0.08}>
                    <Link href={cap.href}>
                      <Card className="group h-full overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/8 hover:border-[#C9A961]/40 transition-all duration-300 cursor-pointer">
                        <CardContent className="p-6 h-full flex flex-col">
                          <div className="w-11 h-11 rounded-lg bg-[#2e8b6e]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Icon className="w-5 h-5 text-[#2e8b6e]" />
                          </div>
                          <h3 className="text-base font-semibold text-white mb-2 group-hover:text-[#C9A961] transition-colors">
                            {isAr ? cap.titleAr : cap.titleEn}
                          </h3>
                          <p className="text-sm text-white/45 flex-grow leading-relaxed">
                            {isAr ? cap.descAr : cap.descEn}
                          </p>
                          <div className="mt-4 flex items-center gap-1 text-[#C9A961]/50 group-hover:text-[#C9A961] transition-colors">
                            <span className="text-xs font-medium">{isAr ? "اكتشف" : "Explore"}</span>
                            <ChevronRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
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

      {/* ===== SECTOR GRID ===== */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#111a14] to-[#0a0f0c]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {isAr ? "16 قطاعاً اقتصادياً بعمق غير مسبوق" : "16 Economic Sectors in Unprecedented Depth"}
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              {isAr ? "كل قطاع يتضمن بيانات تاريخية منذ 2010، تحليلات متقدمة، ووكيل ذكاء اصطناعي متخصص" : "Each sector includes historical data since 2010, advanced analytics, and a dedicated AI agent"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {sectors.map((sector, idx) => {
              const Icon = sector.icon;
              return (
                <AnimatedSection key={idx} delay={idx * 0.04}>
                  <Link href={sector.href}>
                    <div className="group relative overflow-hidden rounded-xl cursor-pointer h-32 md:h-40">
                      {/* Background image */}
                      <div className="absolute inset-0">
                        <img src={sector.img} alt="" className="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                      
                      {/* Content */}
                      <div className="relative z-10 h-full flex flex-col justify-end p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-[#C9A961]" />
                        </div>
                        <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-[#C9A961] transition-colors leading-tight">
                          {isAr ? sector.nameAr : sector.nameEn}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== POWERED BY ===== */}
      <section className="relative py-16 bg-[#0a0f0c] border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <img src={`${CDN}/causeway-logo_ef0d3f96.jpeg`} alt="CauseWay" className="h-12 w-auto rounded" />
              <div>
                <p className="text-white/70 text-sm font-medium">
                  {isAr ? "بدعم من كوزواي للاستشارات المالية والمصرفية" : "Powered by CauseWay Financial & Banking Consultancies"}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  {isAr ? "نحو اقتصاد مبني على الحقائق" : "Towards a fact-based economy"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/about">
                <span className="text-white/50 hover:text-[#C9A961] text-sm transition-colors cursor-pointer">
                  {isAr ? "من نحن" : "About Us"}
                </span>
              </Link>
              <Link href="/methodology">
                <span className="text-white/50 hover:text-[#C9A961] text-sm transition-colors cursor-pointer">
                  {isAr ? "المنهجية" : "Methodology"}
                </span>
              </Link>
              <Link href="/data-coverage">
                <span className="text-white/50 hover:text-[#C9A961] text-sm transition-colors cursor-pointer">
                  {isAr ? "تغطية البيانات" : "Data Coverage"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ScrollToTop />
    </div>
  );
}
