import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, Database, FileText, Shield, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { t, language } = useLanguage();

  const features = [
    {
      icon: Database,
      titleEn: "Comprehensive Data Repository",
      titleAr: "مستودع بيانات شامل",
      descEn: "Access verified economic indicators with complete provenance tracking",
      descAr: "الوصول إلى المؤشرات الاقتصادية الموثقة مع تتبع كامل للمصادر",
    },
    {
      icon: BarChart3,
      titleEn: "Interactive Analytics",
      titleAr: "تحليلات تفاعلية",
      descEn: "Explore data through customizable dashboards and visualizations",
      descAr: "استكشف البيانات من خلال لوحات معلومات ورسوم بيانية قابلة للتخصيص",
    },
    {
      icon: Shield,
      titleEn: "Evidence-Based Intelligence",
      titleAr: "استخبارات قائمة على الأدلة",
      descEn: "Every data point linked to its source with confidence ratings",
      descAr: "كل نقطة بيانات مرتبطة بمصدرها مع تقييمات الثقة",
    },
    {
      icon: FileText,
      titleEn: "Research Library",
      titleAr: "مكتبة الأبحاث",
      descEn: "Access reports, publications, and economic analysis",
      descAr: "الوصول إلى التقارير والمنشورات والتحليلات الاقتصادية",
    },
    {
      icon: TrendingUp,
      titleEn: "Scenario Simulator",
      titleAr: "محاكي السيناريوهات",
      descEn: "Model policy impacts and forecast economic outcomes",
      descAr: "نمذجة تأثيرات السياسات والتنبؤ بالنتائج الاقتصادية",
    },
    {
      icon: Users,
      titleEn: "Collaborative Platform",
      titleAr: "منصة تعاونية",
      descEn: "Partner portal for data contributors and stakeholders",
      descAr: "بوابة الشركاء للمساهمين في البيانات وأصحاب المصلحة",
    },
  ];

  const sectors = [
    { nameEn: "Banking & Finance", nameAr: "القطاع المصرفي والمالي", href: "/sectors/banking" },
    { nameEn: "Trade & Commerce", nameAr: "التجارة والأعمال", href: "/sectors/trade" },
    { nameEn: "Poverty & Development", nameAr: "الفقر والتنمية", href: "/sectors/poverty" },
    { nameEn: "Public Finance", nameAr: "المالية العامة", href: "/sectors/public-finance" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0yNCA0OGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* CauseWay Logo */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 relative">
                    <div className="absolute top-0 left-0 w-3 h-3 bg-[#107040] rounded-sm"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 bg-[#C0A030] rounded-sm"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 bg-white rounded-sm"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#4A90E2] rounded-full"></div>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {language === "ar" ? "كوزواي" : "CauseWay"}
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t("home.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              {t("home.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="gap-2 group">
                  {t("home.hero.cta")}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                  {t("nav.about")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
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
                <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-accent" />
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

      {/* Sectors Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {language === "ar" ? "القطاعات الاقتصادية" : "Economic Sectors"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {language === "ar" 
                ? "تحليلات متخصصة لكل قطاع اقتصادي رئيسي"
                : "Specialized analysis for each major economic sector"}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectors.map((sector, index) => (
              <Link key={index} href={sector.href}>
                <Card className="border-border hover:border-accent hover:shadow-md transition-all cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg text-center">
                      {language === "ar" ? sector.nameAr : sector.nameEn}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-accent/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {language === "ar" 
                ? "ابدأ استكشاف البيانات الاقتصادية"
                : "Start Exploring Economic Data"}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {language === "ar"
                ? "انضم إلى المئات من الباحثين وصناع القرار الذين يعتمدون على يتو للحصول على رؤى اقتصادية موثوقة"
                : "Join hundreds of researchers and policymakers who rely on YETO for trusted economic insights"}
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 group">
                {language === "ar" ? "استكشف لوحة المعلومات" : "Explore Dashboard"}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
