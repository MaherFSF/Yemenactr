/**
 * All Pages Index - /review/all-pages
 * 
 * Lists every route in the platform (public + user + partner + admin + hidden)
 * for review purposes. Shows status, dependencies, and links to open each page.
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Globe,
  Users,
  Shield,
  Building2,
  Eye
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { YETO_COLORS } from "@/lib/chartTheme";

// Complete route inventory
const ALL_ROUTES = [
  // Public Pages
  { path: "/", name: "Home", nameAr: "الرئيسية", category: "public", status: "active", auth: "none" },
  { path: "/about", name: "About", nameAr: "حول", category: "public", status: "active", auth: "none" },
  { path: "/methodology", name: "Methodology", nameAr: "المنهجية", category: "public", status: "active", auth: "none" },
  { path: "/contact", name: "Contact", nameAr: "اتصل بنا", category: "public", status: "active", auth: "none" },
  { path: "/sitemap", name: "Sitemap", nameAr: "خريطة الموقع", category: "public", status: "active", auth: "none" },
  { path: "/glossary", name: "Glossary", nameAr: "المصطلحات", category: "public", status: "active", auth: "none" },
  { path: "/faq", name: "FAQ", nameAr: "الأسئلة الشائعة", category: "public", status: "active", auth: "none" },
  { path: "/privacy", name: "Privacy Policy", nameAr: "سياسة الخصوصية", category: "public", status: "active", auth: "none" },
  { path: "/terms", name: "Terms of Service", nameAr: "شروط الخدمة", category: "public", status: "active", auth: "none" },
  
  // Dashboard & Data
  { path: "/dashboard", name: "Dashboard", nameAr: "لوحة القيادة", category: "data", status: "active", auth: "none" },
  { path: "/data-explorer", name: "Data Explorer", nameAr: "مستكشف البيانات", category: "data", status: "active", auth: "none" },
  { path: "/timeline", name: "Timeline", nameAr: "الجدول الزمني", category: "data", status: "active", auth: "none" },
  { path: "/economic-actors", name: "Economic Actors", nameAr: "الفاعلون الاقتصاديون", category: "data", status: "active", auth: "none" },
  { path: "/indicators", name: "Indicators", nameAr: "المؤشرات", category: "data", status: "active", auth: "none" },
  { path: "/sources", name: "Sources", nameAr: "المصادر", category: "data", status: "active", auth: "none" },
  
  // Sectors
  { path: "/sectors/banking", name: "Banking Sector", nameAr: "القطاع المصرفي", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/currency", name: "Currency & Exchange", nameAr: "العملة والصرف", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/public-finance", name: "Public Finance", nameAr: "المالية العامة", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/energy", name: "Energy & Fuel", nameAr: "الطاقة والوقود", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/food-security", name: "Food Security", nameAr: "الأمن الغذائي", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/aid-flows", name: "Aid Flows", nameAr: "تدفقات المساعدات", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/labor-market", name: "Labor Market", nameAr: "سوق العمل", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/conflict-economy", name: "Conflict Economy", nameAr: "اقتصاد الصراع", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/private-sector", name: "Private Sector", nameAr: "القطاع الخاص", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/infrastructure", name: "Infrastructure", nameAr: "البنية التحتية", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/trade", name: "Trade & Ports", nameAr: "التجارة والموانئ", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/environment", name: "Environment", nameAr: "البيئة", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/social-protection", name: "Social Protection", nameAr: "الحماية الاجتماعية", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/remittances", name: "Remittances", nameAr: "التحويلات", category: "sectors", status: "active", auth: "none" },
  { path: "/sectors/microfinance", name: "Microfinance", nameAr: "التمويل الأصغر", category: "sectors", status: "active", auth: "none" },
  
  // Tools
  { path: "/tools/scenario-simulator", name: "Scenario Simulator", nameAr: "محاكي السيناريوهات", category: "tools", status: "active", auth: "none" },
  { path: "/tools/comparison", name: "Comparison Tool", nameAr: "أداة المقارنة", category: "tools", status: "active", auth: "none" },
  { path: "/tools/ai-assistant", name: "AI Assistant", nameAr: "المساعد الذكي", category: "tools", status: "active", auth: "none" },
  { path: "/tools/report-builder", name: "Report Builder", nameAr: "منشئ التقارير", category: "tools", status: "active", auth: "user" },
  { path: "/tools/data-validator", name: "Data Validator", nameAr: "مدقق البيانات", category: "tools", status: "active", auth: "user" },
  
  // Resources
  { path: "/resources/reports", name: "Reports", nameAr: "التقارير", category: "resources", status: "active", auth: "none" },
  { path: "/resources/research", name: "Research", nameAr: "الأبحاث", category: "resources", status: "active", auth: "none" },
  { path: "/resources/documents", name: "Documents", nameAr: "الوثائق", category: "resources", status: "active", auth: "none" },
  { path: "/resources/api", name: "API Documentation", nameAr: "توثيق API", category: "resources", status: "active", auth: "none" },
  { path: "/resources/downloads", name: "Downloads", nameAr: "التنزيلات", category: "resources", status: "active", auth: "none" },
  
  // Governance
  { path: "/governance/sanctions", name: "Sanctions Information", nameAr: "معلومات العقوبات", category: "governance", status: "active", auth: "none" },
  { path: "/governance/compliance", name: "Compliance", nameAr: "الامتثال", category: "governance", status: "active", auth: "none" },
  { path: "/governance/regulations", name: "Regulations", nameAr: "اللوائح", category: "governance", status: "active", auth: "none" },
  
  // User Account
  { path: "/account/profile", name: "Profile", nameAr: "الملف الشخصي", category: "user", status: "active", auth: "user" },
  { path: "/account/settings", name: "Settings", nameAr: "الإعدادات", category: "user", status: "active", auth: "user" },
  { path: "/account/saved", name: "Saved Items", nameAr: "العناصر المحفوظة", category: "user", status: "active", auth: "user" },
  { path: "/account/alerts", name: "Alerts", nameAr: "التنبيهات", category: "user", status: "active", auth: "user" },
  
  // Subscriptions
  { path: "/subscriptions", name: "Subscriptions", nameAr: "الاشتراكات", category: "subscriptions", status: "active", auth: "none" },
  { path: "/subscriptions/premium", name: "Premium", nameAr: "المميز", category: "subscriptions", status: "active", auth: "none" },
  { path: "/subscriptions/enterprise", name: "Enterprise", nameAr: "المؤسسات", category: "subscriptions", status: "active", auth: "none" },
  
  // Partner Portal
  { path: "/partner/dashboard", name: "Partner Dashboard", nameAr: "لوحة الشريك", category: "partner", status: "active", auth: "partner" },
  { path: "/partner/submit", name: "Submit Data", nameAr: "إرسال البيانات", category: "partner", status: "active", auth: "partner" },
  { path: "/partner/submissions", name: "My Submissions", nameAr: "طلباتي", category: "partner", status: "active", auth: "partner" },
  
  // Admin Portal
  { path: "/admin", name: "Admin Dashboard", nameAr: "لوحة الإدارة", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/sources", name: "Source Registry", nameAr: "سجل المصادر", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/ingestion", name: "Ingestion Monitor", nameAr: "مراقب الاستيعاب", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/data-qa", name: "Data QA", nameAr: "ضمان جودة البيانات", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/knowledge-graph", name: "Knowledge Graph", nameAr: "الرسم البياني المعرفي", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/glossary", name: "Glossary Manager", nameAr: "مدير المصطلحات", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/reports", name: "Report Approvals", nameAr: "موافقات التقارير", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/corrections", name: "Corrections", nameAr: "التصحيحات", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/audit-logs", name: "Audit Logs", nameAr: "سجلات التدقيق", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/users", name: "User Management", nameAr: "إدارة المستخدمين", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/export", name: "Export Center", nameAr: "مركز التصدير", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/scheduler", name: "Scheduler", nameAr: "المجدول", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/connectors", name: "Connectors", nameAr: "الموصلات", category: "admin", status: "active", auth: "admin" },
  { path: "/admin/ai-quality", name: "AI Quality", nameAr: "جودة الذكاء الاصطناعي", category: "admin", status: "active", auth: "admin" },
  
  // Review Mode
  { path: "/review/all-pages", name: "All Pages Index", nameAr: "فهرس جميع الصفحات", category: "review", status: "active", auth: "none" },
];

const CATEGORY_CONFIG: Record<string, { label: string; labelAr: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  public: { label: "Public", labelAr: "عام", icon: Globe, color: "#10B981" },
  data: { label: "Data & Analytics", labelAr: "البيانات والتحليلات", icon: Eye, color: "#3B82F6" },
  sectors: { label: "Sectors", labelAr: "القطاعات", icon: Building2, color: "#8B5CF6" },
  tools: { label: "Tools", labelAr: "الأدوات", icon: Eye, color: "#F59E0B" },
  resources: { label: "Resources", labelAr: "الموارد", icon: Eye, color: "#6366F1" },
  governance: { label: "Governance", labelAr: "الحوكمة", icon: Shield, color: "#EF4444" },
  user: { label: "User Account", labelAr: "حساب المستخدم", icon: Users, color: "#14B8A6" },
  subscriptions: { label: "Subscriptions", labelAr: "الاشتراكات", icon: Eye, color: "#EC4899" },
  partner: { label: "Partner Portal", labelAr: "بوابة الشريك", icon: Building2, color: "#F97316" },
  admin: { label: "Admin Portal", labelAr: "بوابة الإدارة", icon: Lock, color: "#DC2626" },
  review: { label: "Review Mode", labelAr: "وضع المراجعة", icon: Eye, color: "#F59E0B" },
};

export default function AllPages() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const filteredRoutes = useMemo(() => {
    return ALL_ROUTES.filter(route => {
      const matchesSearch = searchQuery === "" || 
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.nameAr.includes(searchQuery) ||
        route.path.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === null || route.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);
  
  const routesByCategory = useMemo(() => {
    const grouped: Record<string, typeof ALL_ROUTES> = {};
    filteredRoutes.forEach(route => {
      if (!grouped[route.category]) {
        grouped[route.category] = [];
      }
      grouped[route.category].push(route);
    });
    return grouped;
  }, [filteredRoutes]);
  
  const stats = useMemo(() => ({
    total: ALL_ROUTES.length,
    public: ALL_ROUTES.filter(r => r.auth === 'none').length,
    user: ALL_ROUTES.filter(r => r.auth === 'user').length,
    partner: ALL_ROUTES.filter(r => r.auth === 'partner').length,
    admin: ALL_ROUTES.filter(r => r.auth === 'admin').length,
    active: ALL_ROUTES.filter(r => r.status === 'active').length,
  }), []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Eye className="h-8 w-8" style={{ color: YETO_COLORS.navy }} />
            <h1 className="text-3xl md:text-4xl font-bold text-center" style={{ color: YETO_COLORS.navy }}>
              {isRTL ? 'فهرس جميع الصفحات' : 'All Pages Index'}
            </h1>
          </div>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto">
            {isRTL 
              ? 'قائمة شاملة بجميع الصفحات في المنصة للمراجعة والتحقق'
              : 'Complete inventory of all pages in the platform for review and verification'}
          </p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="container py-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: YETO_COLORS.navy }}>{stats.total}</div>
              <div className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الصفحات' : 'Total Pages'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.public}</div>
              <div className="text-sm text-muted-foreground">{isRTL ? 'عام' : 'Public'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.user}</div>
              <div className="text-sm text-muted-foreground">{isRTL ? 'مستخدم' : 'User'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.partner}</div>
              <div className="text-sm text-muted-foreground">{isRTL ? 'شريك' : 'Partner'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.admin}</div>
              <div className="text-sm text-muted-foreground">{isRTL ? 'إدارة' : 'Admin'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">{isRTL ? 'نشط' : 'Active'}</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="container pb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isRTL ? 'البحث في الصفحات...' : 'Search pages...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              {isRTL ? 'الكل' : 'All'}
            </Button>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className={selectedCategory === key ? 'text-white' : ''}
              >
                {isRTL ? config.labelAr : config.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Routes by Category */}
      <div className="container pb-12">
        {Object.entries(routesByCategory).map(([category, routes]) => {
          const config = CATEGORY_CONFIG[category];
          const Icon = config?.icon || Eye;
          
          return (
            <Card key={category} className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div style={{ color: config?.color }}><Icon className="h-5 w-5" /></div>
                  <span style={{ color: config?.color }}>
                    {isRTL ? config?.labelAr : config?.label}
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {routes.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {routes.map(route => (
                    <div 
                      key={route.path}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {route.status === 'active' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        <div>
                          <div className="font-medium">
                            {isRTL ? route.nameAr : route.name}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {route.path}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={
                            route.auth === 'none' ? 'border-green-500 text-green-600' :
                            route.auth === 'user' ? 'border-blue-500 text-blue-600' :
                            route.auth === 'partner' ? 'border-orange-500 text-orange-600' :
                            'border-red-500 text-red-600'
                          }
                        >
                          {route.auth === 'none' ? (isRTL ? 'عام' : 'Public') :
                           route.auth === 'user' ? (isRTL ? 'مستخدم' : 'User') :
                           route.auth === 'partner' ? (isRTL ? 'شريك' : 'Partner') :
                           (isRTL ? 'إدارة' : 'Admin')}
                        </Badge>
                        <Link href={route.path}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
