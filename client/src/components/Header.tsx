import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { QuickTourButton } from "@/components/onboarding/WelcomeTour";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { 
  Globe, 
  Menu, 
  X, 
  ChevronDown,
  Banknote,
  Ship,
  TrendingUp,
  DollarSign,
  Building2,
  Zap,
  Wheat,
  Heart,
  Briefcase,
  AlertTriangle,
  Factory,
  Building,
  TreePine,
  Users,
  Brain,
  BarChart3,
  FileText,
  Database,
  Clock,
  BookOpen,
  Shield,
  Search,
  LineChart,
  MessageSquare,
  Library,
  ClipboardCheck,
  ShieldAlert,
  Send,
  Landmark,
  HeartHandshake,
  MapPin,
  Network
} from "lucide-react";
import { useState } from "react";
import GlobalSearch from "@/components/GlobalSearch";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const adminLinks = [
    { nameEn: "Admin Hub", nameAr: "مركز الإدارة", href: "/admin-hub", icon: Shield },
    { nameEn: "Scheduler Status", nameAr: "حالة الجدولة", href: "/admin/scheduler-status", icon: Clock },
    { nameEn: "Ingestion Dashboard", nameAr: "لوحة البيانات", href: "/admin/ingestion", icon: Database },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
    setMobileMenuOpen(false);
  };

  const sectors = [
    { nameEn: "Banking & Finance", nameAr: "القطاع المصرفي", href: "/sectors/banking", icon: Banknote },
    { nameEn: "Trade & Commerce", nameAr: "التجارة", href: "/sectors/trade", icon: Ship },
    { nameEn: "Macroeconomy", nameAr: "الاقتصاد الكلي", href: "/sectors/macroeconomy", icon: TrendingUp },
    { nameEn: "Prices & Inflation", nameAr: "الأسعار والتضخم", href: "/sectors/prices", icon: DollarSign },
    { nameEn: "Currency & Exchange", nameAr: "العملة والصرف", href: "/sectors/currency", icon: Globe },
    { nameEn: "Public Finance", nameAr: "المالية العامة", href: "/sectors/public-finance", icon: Building2 },
    { nameEn: "Energy & Fuel", nameAr: "الطاقة والوقود", href: "/sectors/energy", icon: Zap },
    { nameEn: "Food Security", nameAr: "الأمن الغذائي", href: "/sectors/food-security", icon: Wheat },
    { nameEn: "Aid Flows", nameAr: "تدفقات المساعدات", href: "/sectors/aid-flows", icon: Heart },
    { nameEn: "Labor Market", nameAr: "سوق العمل", href: "/sectors/labor-market", icon: Briefcase },
    { nameEn: "Conflict Economy", nameAr: "اقتصاد الصراع", href: "/sectors/conflict-economy", icon: AlertTriangle },
    { nameEn: "Infrastructure", nameAr: "البنية التحتية", href: "/sectors/infrastructure", icon: Building },
    { nameEn: "Agriculture", nameAr: "الزراعة", href: "/sectors/agriculture", icon: TreePine },
    { nameEn: "Investment", nameAr: "الاستثمار", href: "/sectors/investment", icon: Factory },
    { nameEn: "Poverty & Development", nameAr: "الفقر والتنمية", href: "/sectors/poverty", icon: Users },
    { nameEn: "Sanctions", nameAr: "العقوبات", href: "/sanctions", icon: ShieldAlert },
    { nameEn: "Remittances", nameAr: "التحويلات", href: "/remittances", icon: Send },
    { nameEn: "Public Debt", nameAr: "الدين العام", href: "/public-debt", icon: Landmark },
    { nameEn: "Humanitarian Funding", nameAr: "التمويل الإنساني", href: "/humanitarian-funding", icon: HeartHandshake },
    { nameEn: "Regional Zones", nameAr: "المناطق الاقتصادية", href: "/regional-zones", icon: MapPin },
    { nameEn: "Economic Actors", nameAr: "الفاعلون الاقتصاديون", href: "/economic-actors", icon: Network },
    { nameEn: "Corporate Registry", nameAr: "سجل الشركات", href: "/corporate-registry", icon: Building },
  ];

  const tools = [
    { nameEn: "AI Assistant", nameAr: "المساعد الذكي", href: "/ai-assistant", icon: Brain },
    { nameEn: "Dashboard", nameAr: "لوحة المعلومات", href: "/dashboard", icon: BarChart3 },
    { nameEn: "Report Builder", nameAr: "منشئ التقارير", href: "/report-builder", icon: FileText },
    { nameEn: "Scenario Simulator", nameAr: "محاكي السيناريوهات", href: "/scenario-simulator", icon: TrendingUp },
    { nameEn: "Data Repository", nameAr: "مستودع البيانات", href: "/data-repository", icon: Database },
    { nameEn: "Timeline", nameAr: "الجدول الزمني", href: "/timeline", icon: Clock },
  ];

  const resources = [
    { nameEn: "Economic Reports", nameAr: "التقارير الاقتصادية", href: "/reports", icon: FileText },
    { nameEn: "Research Portal", nameAr: "بوابة الأبحاث", href: "/research-portal", icon: BookOpen },
    { nameEn: "Research Explorer", nameAr: "مستكشف الأبحاث", href: "/research-explorer", icon: Search },
    { nameEn: "Research Analytics", nameAr: "تحليلات الأبحاث", href: "/research-analytics", icon: LineChart },
    { nameEn: "Research Assistant", nameAr: "مساعد الأبحاث", href: "/research-assistant", icon: MessageSquare },
    { nameEn: "Research Library", nameAr: "مكتبتي البحثية", href: "/research-library", icon: Library },
    { nameEn: "Research Audit", nameAr: "تدقيق الأبحاث", href: "/research-audit", icon: ClipboardCheck },
    { nameEn: "Methodology", nameAr: "المنهجية", href: "/methodology", icon: Shield },
    { nameEn: "Glossary", nameAr: "المصطلحات", href: "/glossary", icon: FileText },
    { nameEn: "About YETO", nameAr: "عن يتو", href: "/about", icon: Users },
    { nameEn: "Contact", nameAr: "اتصل بنا", href: "/contact", icon: Globe },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-gray-950/95 dark:border-gray-800">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo - CauseWay Bilingual with Economic Observatory */}
        <Link href="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {/* CauseWay Logo Icon */}
          <svg width="32" height="28" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M10 10 L10 70 L60 70 L60 55 L25 55 L25 25 L60 25 L60 10 Z" fill="#2e6b4f" />
            <rect x="50" y="10" width="20" height="20" fill="#5a7a5a" rx="2" />
            <rect x="75" y="10" width="15" height="15" fill="#C9A227" rx="2" />
            <circle cx="85" cy="40" r="6" fill="#2e6b4f" />
          </svg>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg font-semibold text-[#2C3424]">CauseWay</span>
              <span className="text-sm text-[#5a7a5a] font-arabic">كوزواي</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[#959581] font-medium">
              {language === "ar" ? "مرصد اقتصادي" : "Economic Observatory"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link href="/home" className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            location === "/home" || location === "/" 
              ? "text-[#2e6b4f] bg-[#2e6b4f]/10" 
              : "text-foreground/80 hover:text-[#2e6b4f] hover:bg-[#2e6b4f]/5"
          }`}>
            {language === "ar" ? "الرئيسية" : "Home"}
          </Link>

          {/* Sectors Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                location.startsWith("/sectors") 
                  ? "text-[#2e6b4f] bg-[#2e6b4f]/10" 
                  : "text-foreground/80 hover:text-[#2e6b4f] hover:bg-[#2e6b4f]/5"
              }`}>
                {language === "ar" ? "القطاعات" : "Sectors"}
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-[70vh] overflow-y-auto">
              <DropdownMenuLabel>
                {language === "ar" ? "القطاعات الاقتصادية" : "Economic Sectors"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sectors.map((sector) => {
                const Icon = sector.icon;
                return (
                  <DropdownMenuItem key={sector.href} asChild>
                    <Link href={sector.href} className="flex items-center gap-2 w-full cursor-pointer">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {language === "ar" ? sector.nameAr : sector.nameEn}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                ["/dashboard", "/ai-assistant", "/report-builder", "/scenario-simulator", "/data-repository", "/timeline"].some(p => location.startsWith(p))
                  ? "text-[#2e6b4f] bg-[#2e6b4f]/10" 
                  : "text-foreground/80 hover:text-[#2e6b4f] hover:bg-[#2e6b4f]/5"
              }`}>
                {language === "ar" ? "الأدوات" : "Tools"}
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>
                {language === "ar" ? "أدوات التحليل" : "Analysis Tools"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <DropdownMenuItem key={tool.href} asChild>
                    <Link href={tool.href} className="flex items-center gap-2 w-full cursor-pointer">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {language === "ar" ? tool.nameAr : tool.nameEn}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Resources Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                ["/research", "/methodology", "/glossary", "/about", "/contact"].some(p => location.startsWith(p))
                  ? "text-[#2e6b4f] bg-[#2e6b4f]/10" 
                  : "text-foreground/80 hover:text-[#2e6b4f] hover:bg-[#2e6b4f]/5"
              }`}>
                {language === "ar" ? "الموارد" : "Resources"}
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>
                {language === "ar" ? "الموارد والمعلومات" : "Resources & Info"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {resources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <DropdownMenuItem key={resource.href} asChild>
                    <Link href={resource.href} className="flex items-center gap-2 w-full cursor-pointer">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {language === "ar" ? resource.nameAr : resource.nameEn}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Direct Links */}
          <Link href="/pricing" className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive("/pricing") 
              ? "text-[#2e6b4f] bg-[#2e6b4f]/10" 
              : "text-foreground/80 hover:text-[#2e6b4f] hover:bg-[#2e6b4f]/5"
          }`}>
            {language === "ar" ? "الاشتراكات" : "Pricing"}
          </Link>

          {/* Admin Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                location.startsWith("/admin")
                  ? "text-[#2e6b4f] bg-[#2e6b4f]/10"
                  : "text-foreground/80 hover:text-[#2e6b4f] hover:bg-[#2e6b4f]/5"
              }`}>
                <Shield className="h-4 w-4" />
                {language === "ar" ? "الإدارة" : "Admin"}
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>
                {language === "ar" ? "لوحة التحكم" : "Admin Panel"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin-hub" className="flex items-center gap-2 w-full cursor-pointer">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  {language === "ar" ? "مركز الإدارة" : "Admin Hub"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {language === "ar" ? "الجدولة والبيانات" : "Scheduling & Data"}
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/admin/scheduler-status" className="flex items-center gap-2 w-full cursor-pointer">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {language === "ar" ? "حالة الجدولة" : "Scheduler Status"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/ingestion" className="flex items-center gap-2 w-full cursor-pointer">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  {language === "ar" ? "لوحة البيانات" : "Ingestion Dashboard"}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Global Search */}
          <div className="hidden md:block">
            <GlobalSearch />
          </div>

          {/* Language Switcher */}
          {/* Quick Tour Button */}
          <QuickTourButton />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === "ar" ? "English" : "العربية"}
            </span>
          </Button>

          {/* CTA Button - Desktop */}
          <Link href="/dashboard">
            <Button size="sm" className="hidden md:flex bg-[#2e6b4f] hover:bg-[#0D5A34]">
              {language === "ar" ? "استكشف البيانات" : "Explore Data"}
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white dark:bg-gray-950 max-h-[80vh] overflow-y-auto">
          <nav className="container flex flex-col py-4 gap-1">
            <Link 
              href="/"
              className="block px-4 py-2 text-sm font-medium text-foreground/80 hover:text-[#2e6b4f] hover:bg-[#2e6b4f]/5 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {language === "ar" ? "الرئيسية" : "Home"}
            </Link>

            {/* Mobile Sectors */}
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {language === "ar" ? "القطاعات" : "Sectors"}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {sectors.slice(0, 8).map((sector) => {
                  const Icon = sector.icon;
                  return (
                    <Link 
                      key={sector.href} 
                      href={sector.href}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-[#2e6b4f] hover:bg-[#2e6b4f]/5 rounded-md transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{language === "ar" ? sector.nameAr : sector.nameEn}</span>
                    </Link>
                  );
                })}
              </div>
              <Link 
                href="/data-repository"
                className="block mt-2 px-3 py-2 text-sm font-medium text-[#2e6b4f] hover:bg-[#2e6b4f]/5 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {language === "ar" ? "عرض جميع القطاعات →" : "View All Sectors →"}
              </Link>
            </div>

            {/* Mobile Tools */}
            <div className="px-4 py-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {language === "ar" ? "الأدوات" : "Tools"}
              </p>
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link 
                    key={tool.href} 
                    href={tool.href}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-[#2e6b4f] hover:bg-[#2e6b4f]/5 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {language === "ar" ? tool.nameAr : tool.nameEn}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Resources */}
            <div className="px-4 py-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {language === "ar" ? "الموارد" : "Resources"}
              </p>
              {resources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <Link 
                    key={resource.href} 
                    href={resource.href}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-[#2e6b4f] hover:bg-[#2e6b4f]/5 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {language === "ar" ? resource.nameAr : resource.nameEn}
                  </Link>
                );
              })}
            </div>

            {/* Mobile CTA */}
            <div className="px-4 py-4 border-t">
              <Link href="/dashboard">
                <Button className="w-full bg-[#2e6b4f] hover:bg-[#0D5A34]" onClick={() => setMobileMenuOpen(false)}>
                  {language === "ar" ? "استكشف البيانات" : "Explore Data"}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
