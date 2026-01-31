import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  BarChart3,
  Users,
  Phone,
  BookOpen,
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
  Building,
  TreePine,
  Factory,
  Brain,
  FileText,
  Database,
  Clock,
  Shield,
  CreditCard,
  Settings,
  Activity,
  Bell,
  Key,
  LineChart,
  Search,
  MessageSquare,
  Library,
  ClipboardCheck,
  ShieldAlert,
  Send,
  Landmark,
  HeartHandshake,
  MapPin,
  Network,
  Globe,
  Scale,
  Gauge,
  Layers,
  PieChart,
  Target,
  Workflow,
  Palette,
  Lightbulb,
  Package,
  UserCog,
  Crown,
  Webhook,
  Sliders,
  Bot,
  FileBarChart,
  Eye,
  Download,
  ExternalLink,
} from "lucide-react";

interface SitemapSection {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  links: {
    name: string;
    nameAr: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    badgeAr?: string;
  }[];
}

export default function Sitemap() {
  const { language } = useLanguage();

  const sections: SitemapSection[] = [
    {
      title: "Main Pages",
      titleAr: "الصفحات الرئيسية",
      description: "Core platform pages and entry points",
      descriptionAr: "الصفحات الأساسية ونقاط الدخول للمنصة",
      links: [
        { name: "Home", nameAr: "الرئيسية", href: "/", icon: Home },
        { name: "Dashboard", nameAr: "لوحة المعلومات", href: "/dashboard", icon: BarChart3 },
        { name: "About YETO", nameAr: "عن يتو", href: "/about", icon: Users },
        { name: "Contact", nameAr: "اتصل بنا", href: "/contact", icon: Phone },
        { name: "Pricing & Subscriptions", nameAr: "الاشتراكات", href: "/pricing", icon: CreditCard },
        { name: "Changelog", nameAr: "سجل التغييرات", href: "/changelog", icon: FileText },
      ],
    },
    {
      title: "Economic Sectors",
      titleAr: "القطاعات الاقتصادية",
      description: "Detailed analysis by economic sector",
      descriptionAr: "تحليل مفصل حسب القطاع الاقتصادي",
      links: [
        { name: "Banking & Finance", nameAr: "القطاع المصرفي", href: "/sectors/banking", icon: Banknote },
        { name: "Microfinance", nameAr: "التمويل الأصغر", href: "/sectors/microfinance", icon: Banknote, badge: "New", badgeAr: "جديد" },
        { name: "Trade & Commerce", nameAr: "التجارة", href: "/sectors/trade", icon: Ship },
        { name: "Macroeconomy", nameAr: "الاقتصاد الكلي", href: "/sectors/macroeconomy", icon: TrendingUp },
        { name: "Prices & Inflation", nameAr: "الأسعار والتضخم", href: "/sectors/prices", icon: DollarSign },
        { name: "Currency & Exchange", nameAr: "العملة والصرف", href: "/sectors/currency", icon: Globe },
        { name: "Public Finance", nameAr: "المالية العامة", href: "/sectors/public-finance", icon: Building2 },
        { name: "Energy & Fuel", nameAr: "الطاقة والوقود", href: "/sectors/energy", icon: Zap },
        { name: "Food Security", nameAr: "الأمن الغذائي", href: "/sectors/food-security", icon: Wheat },
        { name: "Aid Flows", nameAr: "تدفقات المساعدات", href: "/sectors/aid-flows", icon: Heart },
        { name: "Labor Market", nameAr: "سوق العمل", href: "/sectors/labor-market", icon: Briefcase },
        { name: "Conflict Economy", nameAr: "اقتصاد الصراع", href: "/sectors/conflict-economy", icon: AlertTriangle },
        { name: "Infrastructure", nameAr: "البنية التحتية", href: "/sectors/infrastructure", icon: Building },
        { name: "Agriculture", nameAr: "الزراعة", href: "/sectors/agriculture", icon: TreePine },
        { name: "Investment", nameAr: "الاستثمار", href: "/sectors/investment", icon: Factory },
        { name: "Poverty & Development", nameAr: "الفقر والتنمية", href: "/sectors/poverty", icon: Users },
      ],
    },
    {
      title: "Specialized Topics",
      titleAr: "مواضيع متخصصة",
      description: "Deep-dive analysis on specific economic topics",
      descriptionAr: "تحليل معمق لمواضيع اقتصادية محددة",
      links: [
        { name: "Sanctions Monitoring", nameAr: "مراقبة العقوبات", href: "/sanctions", icon: ShieldAlert },
        { name: "Remittances", nameAr: "التحويلات", href: "/remittances", icon: Send },
        { name: "Public Debt", nameAr: "الدين العام", href: "/public-debt", icon: Landmark },
        { name: "Humanitarian Funding", nameAr: "التمويل الإنساني", href: "/humanitarian-funding", icon: HeartHandshake },
        { name: "Regional Economic Zones", nameAr: "المناطق الاقتصادية", href: "/regional-zones", icon: MapPin },
        { name: "Economic Actors", nameAr: "الفاعلون الاقتصاديون", href: "/economic-actors", icon: Network },
        { name: "Corporate Registry", nameAr: "سجل الشركات", href: "/corporate-registry", icon: Building },
        { name: "Compliance", nameAr: "الامتثال", href: "/compliance", icon: Shield },
        { name: "Policy Impact Analysis", nameAr: "تحليل تأثير السياسات", href: "/policy-impact", icon: Target },
      ],
    },
    {
      title: "Analysis Tools",
      titleAr: "أدوات التحليل",
      description: "Interactive tools for economic analysis",
      descriptionAr: "أدوات تفاعلية للتحليل الاقتصادي",
      links: [
        { name: "AI Assistant (One Brain)", nameAr: "المساعد الذكي", href: "/ai-assistant", icon: Brain },
        { name: "Report Builder", nameAr: "منشئ التقارير", href: "/report-builder", icon: FileText },
        { name: "Scenario Simulator", nameAr: "محاكي السيناريوهات", href: "/scenario-simulator", icon: TrendingUp },
        { name: "Comparison Tool", nameAr: "أداة المقارنة", href: "/comparison", icon: Scale },
        { name: "Data Repository", nameAr: "مستودع البيانات", href: "/data-repository", icon: Database },
        { name: "Interactive Timeline", nameAr: "الجدول الزمني", href: "/timeline", icon: Clock },
        { name: "Indicator Catalog", nameAr: "كتالوج المؤشرات", href: "/indicators", icon: Gauge },
        { name: "Advanced Search", nameAr: "البحث المتقدم", href: "/search", icon: Search },
      ],
    },
    {
      title: "Research & Knowledge",
      titleAr: "البحث والمعرفة",
      description: "Research resources and documentation",
      descriptionAr: "موارد البحث والتوثيق",
      links: [
        { name: "Research Portal", nameAr: "بوابة الأبحاث", href: "/research-portal", icon: BookOpen },
        { name: "Research Explorer", nameAr: "مستكشف الأبحاث", href: "/research-explorer", icon: Search },
        { name: "Research Analytics", nameAr: "تحليلات الأبحاث", href: "/research-analytics", icon: LineChart },
        { name: "Research Assistant", nameAr: "مساعد الأبحاث", href: "/research-assistant", icon: MessageSquare },
        { name: "Research Library", nameAr: "المكتبة البحثية", href: "/research-library", icon: Library },
        { name: "Research Audit", nameAr: "تدقيق الأبحاث", href: "/research-audit", icon: ClipboardCheck },
        { name: "Publications", nameAr: "المنشورات", href: "/publications", icon: FileText },
        { name: "Entity Profiles", nameAr: "ملفات الكيانات", href: "/entities", icon: Building },
        { name: "Glossary", nameAr: "المصطلحات", href: "/glossary", icon: BookOpen },
        { name: "Methodology", nameAr: "المنهجية", href: "/methodology", icon: Shield },
      ],
    },
    {
      title: "Data Quality & Transparency",
      titleAr: "جودة البيانات والشفافية",
      description: "Data governance and quality monitoring",
      descriptionAr: "حوكمة البيانات ومراقبة الجودة",
      links: [
        { name: "Coverage Scorecard", nameAr: "بطاقة التغطية", href: "/coverage", icon: PieChart },
        { name: "Data Freshness", nameAr: "حداثة البيانات", href: "/data-freshness", icon: Activity },
        { name: "Accuracy Dashboard", nameAr: "لوحة الدقة", href: "/accuracy", icon: Target },
        { name: "Corrections Log", nameAr: "سجل التصحيحات", href: "/corrections", icon: ClipboardCheck },
        { name: "Data Exchange Hub", nameAr: "مركز تبادل البيانات", href: "/data-exchange", icon: Layers },
      ],
    },
    {
      title: "User Account",
      titleAr: "حساب المستخدم",
      description: "Personal dashboard and settings",
      descriptionAr: "لوحة التحكم الشخصية والإعدادات",
      links: [
        { name: "My Dashboard", nameAr: "لوحتي", href: "/my-dashboard", icon: BarChart3 },
        { name: "API Keys", nameAr: "مفاتيح API", href: "/api-keys", icon: Key },
        { name: "Notification Settings", nameAr: "إعدادات الإشعارات", href: "/notifications", icon: Bell },
      ],
    },
    {
      title: "Executive Dashboards",
      titleAr: "لوحات المسؤولين التنفيذيين",
      description: "Specialized dashboards for decision-makers",
      descriptionAr: "لوحات متخصصة لصناع القرار",
      links: [
        { name: "Governor Dashboard", nameAr: "لوحة المحافظ", href: "/executive/governor", icon: Crown, badge: "Executive", badgeAr: "تنفيذي" },
        { name: "Deputy Governor Dashboard", nameAr: "لوحة نائب المحافظ", href: "/executive/deputy-governor", icon: UserCog, badge: "Executive", badgeAr: "تنفيذي" },
      ],
    },
    {
      title: "Partner Portal",
      titleAr: "بوابة الشركاء",
      description: "Data contribution and partnership",
      descriptionAr: "المساهمة بالبيانات والشراكة",
      links: [
        { name: "Partner Portal", nameAr: "بوابة الشركاء", href: "/partner", icon: Users },
      ],
    },
    {
      title: "Administration",
      titleAr: "الإدارة",
      description: "Platform administration and monitoring",
      descriptionAr: "إدارة ومراقبة المنصة",
      links: [
        { name: "Admin Hub", nameAr: "مركز الإدارة", href: "/admin-hub", icon: Settings, badge: "Admin", badgeAr: "مدير" },
        { name: "Admin Portal", nameAr: "بوابة الإدارة", href: "/admin", icon: Shield },
        { name: "Admin Monitoring", nameAr: "مراقبة الإدارة", href: "/admin/monitoring", icon: Activity },
        { name: "Scheduler Dashboard", nameAr: "لوحة الجدولة", href: "/admin/scheduler", icon: Clock },
        { name: "Alerts Dashboard", nameAr: "لوحة التنبيهات", href: "/admin/alerts", icon: Bell },
        { name: "API Health", nameAr: "صحة API", href: "/admin/api-health", icon: Activity },
        { name: "Alert History", nameAr: "سجل التنبيهات", href: "/admin/alert-history", icon: FileText },
        { name: "Webhook Settings", nameAr: "إعدادات Webhook", href: "/admin/webhooks", icon: Webhook },
        { name: "Connector Thresholds", nameAr: "عتبات الموصلات", href: "/admin/connector-thresholds", icon: Sliders },
        { name: "Autopilot Control Room", nameAr: "غرفة التحكم الآلي", href: "/admin/autopilot", icon: Bot },
        { name: "Report Workflow", nameAr: "سير عمل التقارير", href: "/admin/reports", icon: FileBarChart },
        { name: "Visualization Builder", nameAr: "منشئ التصورات", href: "/admin/visualizations", icon: Palette },
        { name: "Insight Miner", nameAr: "منقب الرؤى", href: "/admin/insights", icon: Lightbulb },
        { name: "Export Bundle", nameAr: "حزمة التصدير", href: "/admin/export", icon: Package },
      ],
    },
    {
      title: "Developer Resources",
      titleAr: "موارد المطورين",
      description: "API documentation and developer tools",
      descriptionAr: "توثيق API وأدوات المطورين",
      links: [
        { name: "API Documentation", nameAr: "توثيق API", href: "/api-docs", icon: FileText },
      ],
    },
    {
      title: "Legal & Policies",
      titleAr: "القانونية والسياسات",
      description: "Terms, privacy, and legal information",
      descriptionAr: "الشروط والخصوصية والمعلومات القانونية",
      links: [
        { name: "Legal Hub", nameAr: "المركز القانوني", href: "/legal", icon: Scale },
        { name: "Privacy Policy", nameAr: "سياسة الخصوصية", href: "/legal/privacy", icon: Shield },
        { name: "Terms of Service", nameAr: "شروط الخدمة", href: "/legal/terms", icon: FileText },
        { name: "Data License", nameAr: "ترخيص البيانات", href: "/legal/data-license", icon: Key },
        { name: "Accessibility", nameAr: "إمكانية الوصول", href: "/legal/accessibility", icon: Eye },
      ],
    },
  ];

  const totalPages = sections.reduce((acc, section) => acc + section.links.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-[#768064] text-white py-12">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === "ar" ? "خريطة الموقع" : "Sitemap"}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            {language === "ar"
              ? `جميع صفحات منصة يتو (${totalPages} صفحة) - مرصد الشفافية الاقتصادية اليمني`
              : `Complete index of all YETO platform pages (${totalPages} pages) - Yemen Economic Transparency Observatory`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="grid gap-8">
          {sections.map((section, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span>{language === "ar" ? section.titleAr : section.title}</span>
                  <Badge variant="outline">{section.links.length}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? section.descriptionAr : section.description}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-[#4C583E]/30 hover:bg-[#4C583E]/5 transition-all group"
                      >
                        <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 group-hover:bg-[#4C583E]/10 transition-colors">
                          <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-[#4C583E]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate group-hover:text-[#4C583E]">
                              {language === "ar" ? link.nameAr : link.name}
                            </span>
                            {link.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {language === "ar" ? link.badgeAr : link.badge}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground truncate block">
                            {link.href}
                          </span>
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 p-6 bg-[#768064] text-white rounded-xl">
          <h2 className="text-xl font-bold mb-4">
            {language === "ar" ? "إحصائيات الموقع" : "Site Statistics"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-[#C9A227]">{totalPages}</div>
              <div className="text-sm text-white/70">
                {language === "ar" ? "إجمالي الصفحات" : "Total Pages"}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#C9A227]">{sections.length}</div>
              <div className="text-sm text-white/70">
                {language === "ar" ? "الأقسام" : "Sections"}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#C9A227]">16</div>
              <div className="text-sm text-white/70">
                {language === "ar" ? "القطاعات الاقتصادية" : "Economic Sectors"}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#C9A227]">14</div>
              <div className="text-sm text-white/70">
                {language === "ar" ? "صفحات الإدارة" : "Admin Pages"}
              </div>
            </div>
          </div>
        </div>

        {/* Download Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <a
            href="/api/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">
              {language === "ar" ? "تحميل XML Sitemap" : "Download XML Sitemap"}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
