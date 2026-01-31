import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Calendar, 
  Clock, 
  Download, 
  Eye, 
  Search,
  Filter,
  TrendingUp,
  BarChart3,
  Globe,
  Newspaper,
  BookOpen,
  ArrowRight,
  Bell,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

// Sample publications data
const publications = [
  {
    id: "pub-001",
    type: "daily",
    titleEn: "Daily Economic Signals Digest",
    titleAr: "ملخص الإشارات الاقتصادية اليومي",
    descriptionEn: "Key economic indicators and market movements for December 26, 2024",
    descriptionAr: "المؤشرات الاقتصادية الرئيسية وتحركات السوق ليوم 26 ديسمبر 2024",
    date: "2026-01-08",
    status: "published",
    highlights: [
      { en: "YER/USD rate stable at 2,070 in Aden", ar: "سعر الريال/الدولار مستقر عند 2,070 في عدن" },
      { en: "Fuel prices unchanged for 3rd consecutive day", ar: "أسعار الوقود ثابتة لليوم الثالث على التوالي" },
      { en: "CBY-Aden announces new monetary measures", ar: "البنك المركزي-عدن يعلن إجراءات نقدية جديدة" },
    ],
    downloadUrl: "#",
    views: 1250,
  },
  {
    id: "pub-002",
    type: "weekly",
    titleEn: "Weekly Market & FX Monitor",
    titleAr: "مراقب السوق والعملات الأسبوعي",
    descriptionEn: "Comprehensive analysis of currency markets and trade flows for Week 52, 2024",
    descriptionAr: "تحليل شامل لأسواق العملات وتدفقات التجارة للأسبوع 52، 2024",
    date: "2026-01-04",
    status: "published",
    highlights: [
      { en: "North-South FX spread widens to 270%", ar: "فجوة سعر الصرف شمال-جنوب تتسع إلى 270%" },
      { en: "Import volumes down 12% from previous week", ar: "حجم الواردات انخفض 12% عن الأسبوع السابق" },
      { en: "Remittance flows show seasonal uptick", ar: "تدفقات التحويلات تظهر ارتفاعاً موسمياً" },
    ],
    downloadUrl: "#",
    views: 3420,
  },
  {
    id: "pub-003",
    type: "monthly",
    titleEn: "Monthly Macro-Fiscal Brief",
    titleAr: "الموجز المالي الكلي الشهري",
    descriptionEn: "In-depth analysis of Yemen's macroeconomic conditions for November 2024",
    descriptionAr: "تحليل معمق للأوضاع الاقتصادية الكلية في اليمن لشهر نوفمبر 2024",
    date: "2025-12-14",
    status: "published",
    highlights: [
      { en: "Inflation rate reaches 35% YoY in Aden", ar: "معدل التضخم يصل إلى 35% سنوياً في عدن" },
      { en: "Government revenue collection improves by 8%", ar: "تحسن تحصيل الإيرادات الحكومية بنسبة 8%" },
      { en: "Foreign reserves stabilize at $1.2B", ar: "الاحتياطيات الأجنبية تستقر عند 1.2 مليار دولار" },
    ],
    downloadUrl: "#",
    views: 5680,
  },
  {
    id: "pub-004",
    type: "special",
    titleEn: "Special Report: Banking Sector Under Dual Monetary System",
    titleAr: "تقرير خاص: القطاع المصرفي في ظل النظام النقدي المزدوج",
    descriptionEn: "Comprehensive analysis of how Yemen's banking sector operates under the split monetary system",
    descriptionAr: "تحليل شامل لكيفية عمل القطاع المصرفي اليمني في ظل النظام النقدي المنقسم",
    date: "2024-11-15",
    status: "published",
    highlights: [
      { en: "18 banks operating across both zones", ar: "18 بنكاً يعمل عبر المنطقتين" },
      { en: "Sanctions compliance challenges analyzed", ar: "تحليل تحديات الامتثال للعقوبات" },
      { en: "Policy recommendations for reunification", ar: "توصيات سياسية لإعادة التوحيد" },
    ],
    downloadUrl: "#",
    views: 8920,
  },
  {
    id: "pub-005",
    type: "daily",
    titleEn: "Daily Economic Signals Digest",
    titleAr: "ملخص الإشارات الاقتصادية اليومي",
    descriptionEn: "Key economic indicators and market movements for December 25, 2024",
    descriptionAr: "المؤشرات الاقتصادية الرئيسية وتحركات السوق ليوم 25 ديسمبر 2024",
    date: "2026-01-07",
    status: "draft",
    highlights: [
      { en: "Markets closed for holiday", ar: "الأسواق مغلقة بمناسبة العطلة" },
    ],
    downloadUrl: "#",
    views: 0,
  },
];

const publicationTypes = [
  { value: "all", labelEn: "All Publications", labelAr: "جميع المنشورات" },
  { value: "daily", labelEn: "Daily Digest", labelAr: "الملخص اليومي" },
  { value: "weekly", labelEn: "Weekly Monitor", labelAr: "المراقب الأسبوعي" },
  { value: "monthly", labelEn: "Monthly Brief", labelAr: "الموجز الشهري" },
  { value: "special", labelEn: "Special Reports", labelAr: "التقارير الخاصة" },
];

const typeConfig = {
  daily: {
    icon: Newspaper,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    labelEn: "Daily",
    labelAr: "يومي",
  },
  weekly: {
    icon: Calendar,
    color: "bg-green-100 text-green-700 border-green-200",
    labelEn: "Weekly",
    labelAr: "أسبوعي",
  },
  monthly: {
    icon: BarChart3,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    labelEn: "Monthly",
    labelAr: "شهري",
  },
  special: {
    icon: BookOpen,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    labelEn: "Special",
    labelAr: "خاص",
  },
};

export default function Publications() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const filteredPublications = publications.filter(pub => {
    const matchesSearch = 
      pub.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.titleAr.includes(searchQuery) ||
      pub.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || pub.type === selectedType;
    const matchesTab = activeTab === "all" || 
      (activeTab === "published" && pub.status === "published") ||
      (activeTab === "drafts" && pub.status === "draft");
    return matchesSearch && matchesType && matchesTab;
  });

  const publishedCount = publications.filter(p => p.status === "published").length;
  const draftCount = publications.filter(p => p.status === "draft").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-[#2e8b6e] text-white py-12">
        <div className="container">
          <div className={`${language === 'ar' ? 'text-right' : ''}`}>
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Sparkles className="h-3 w-3 mr-1" />
              {language === "ar" ? "منشورات آلية" : "Auto-Generated Publications"}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {language === "ar" ? "المنشورات والتقارير" : "Publications & Reports"}
            </h1>
            <p className="text-white/80 max-w-3xl mb-6">
              {language === "ar"
                ? "تقارير اقتصادية منتظمة يتم إنشاؤها تلقائياً من بيانات YETO. يومية وأسبوعية وشهرية وتقارير خاصة متاحة للتنزيل."
                : "Regular economic reports auto-generated from YETO data. Daily, weekly, monthly, and special reports available for download."}
            </p>
            
            {/* Subscribe CTA */}
            <div className="flex flex-wrap gap-4">
              <Button className="bg-[#C0A030] hover:bg-[#A08020] text-white">
                <Mail className="h-4 w-4 mr-2" />
                {language === "ar" ? "اشترك في النشرة" : "Subscribe to Newsletter"}
              </Button>
              <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                <Bell className="h-4 w-4 mr-2" />
                {language === "ar" ? "تنبيهات التقارير" : "Report Alerts"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Publication Types Overview */}
      <div className="bg-white dark:bg-gray-900 border-b py-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(typeConfig).map(([key, config]) => {
              const Icon = config.icon;
              const count = publications.filter(p => p.type === key && p.status === "published").length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedType === key 
                      ? "border-[#2e8b6e] bg-[#2e8b6e]/5" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {language === "ar" ? config.labelAr : config.labelEn}
                      </div>
                      <div className="text-sm text-gray-500">{count} {language === "ar" ? "منشور" : "published"}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container py-6">
        <div className={`flex flex-wrap items-center gap-4 mb-6 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <div className="relative flex-1 min-w-[250px]">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={language === "ar" ? "البحث في المنشورات..." : "Search publications..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${language === 'ar' ? 'pr-10 text-right' : 'pl-10'}`}
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {publicationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {language === "ar" ? type.labelAr : type.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              {language === "ar" ? "الكل" : "All"} ({publications.length})
            </TabsTrigger>
            <TabsTrigger value="published">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {language === "ar" ? "منشور" : "Published"} ({publishedCount})
            </TabsTrigger>
            <TabsTrigger value="drafts">
              <Clock className="h-4 w-4 mr-1" />
              {language === "ar" ? "مسودات" : "Drafts"} ({draftCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredPublications.map((pub) => {
                const config = typeConfig[pub.type as keyof typeof typeConfig];
                const Icon = config.icon;
                return (
                  <Card key={pub.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className={`flex items-start gap-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-3 rounded-lg ${config.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className={`flex items-center gap-2 mb-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <Badge className={config.color}>
                              {language === "ar" ? config.labelAr : config.labelEn}
                            </Badge>
                            {pub.status === "draft" && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                                <Clock className="h-3 w-3 mr-1" />
                                {language === "ar" ? "مسودة" : "Draft"}
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {pub.date}
                            </span>
                          </div>
                          <h3 className={`font-semibold text-lg text-[#2e8b6e] dark:text-white mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                            {language === "ar" ? pub.titleAr : pub.titleEn}
                          </h3>
                          <p className={`text-gray-600 dark:text-gray-400 mb-4 ${language === 'ar' ? 'text-right' : ''}`}>
                            {language === "ar" ? pub.descriptionAr : pub.descriptionEn}
                          </p>
                          
                          {/* Highlights */}
                          {pub.highlights.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                              <div className={`text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                                {language === "ar" ? "أبرز النقاط:" : "Key Highlights:"}
                              </div>
                              <ul className={`space-y-1 text-sm text-gray-600 dark:text-gray-400 ${language === 'ar' ? 'text-right' : ''}`}>
                                {pub.highlights.map((highlight, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3 text-[#2e8b6e] flex-shrink-0" />
                                    {language === "ar" ? highlight.ar : highlight.en}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className={`flex items-center justify-between ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {pub.status === "published" && (
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {pub.views.toLocaleString()} {language === "ar" ? "مشاهدة" : "views"}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {pub.status === "published" ? (
                                <>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-1" />
                                    {language === "ar" ? "عرض" : "View"}
                                  </Button>
                                  <Button size="sm" className="bg-[#2e8b6e] hover:bg-[#0D5A34]">
                                    <Download className="h-4 w-4 mr-1" />
                                    {language === "ar" ? "تنزيل PDF" : "Download PDF"}
                                  </Button>
                                </>
                              ) : (
                                <Button variant="outline" size="sm" disabled>
                                  <Clock className="h-4 w-4 mr-1" />
                                  {language === "ar" ? "قيد المراجعة" : "Pending Review"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredPublications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {language === "ar" ? "لم يتم العثور على منشورات" : "No publications found"}
                </h3>
                <p className="text-gray-500">
                  {language === "ar" 
                    ? "جرب تعديل معايير البحث أو الفلتر"
                    : "Try adjusting your search or filter criteria"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Auto-Generation Info */}
      <div className="bg-white dark:bg-gray-900 border-t py-12">
        <div className="container">
          <Card className="bg-[#2e8b6e]/5 border-[#2e8b6e]/20">
            <CardContent className="p-6">
              <div className={`flex items-start gap-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <Sparkles className="h-6 w-6 text-[#C0A030] mt-1" />
                <div>
                  <h3 className={`font-semibold text-[#2e8b6e] dark:text-white mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                    {language === "ar" ? "منشورات مولدة آلياً" : "Auto-Generated Publications"}
                  </h3>
                  <p className={`text-sm text-gray-600 dark:text-gray-400 mb-4 ${language === 'ar' ? 'text-right' : ''}`}>
                    {language === "ar"
                      ? "يتم إنشاء هذه التقارير تلقائياً من بيانات YETO باستخدام الذكاء الاصطناعي. يتم مراجعة كل تقرير من قبل فريق البيانات قبل النشر لضمان الدقة والجودة."
                      : "These reports are auto-generated from YETO data using AI. Each report is reviewed by our data team before publication to ensure accuracy and quality."}
                  </p>
                  <div className={`grid md:grid-cols-3 gap-4 ${language === 'ar' ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{language === "ar" ? "مراجعة بشرية" : "Human reviewed"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{language === "ar" ? "مصادر موثقة" : "Sourced data"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{language === "ar" ? "ثنائي اللغة" : "Bilingual"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
