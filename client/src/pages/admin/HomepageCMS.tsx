import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Layout, 
  Type, 
  Image, 
  Settings, 
  Eye, 
  Save,
  Plus,
  Trash2,
  GripVertical,
  Globe,
  BarChart3,
  FileText,
  Users,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface HeroConfig {
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  showTicker: boolean;
  showKPIs: boolean;
  backgroundType: "gradient" | "image" | "video";
  backgroundUrl?: string;
}

interface SectionConfig {
  id: string;
  type: "kpis" | "sectors" | "sources" | "updates" | "features" | "cta";
  enabled: boolean;
  order: number;
  titleEn: string;
  titleAr: string;
}

export default function HomepageCMS() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    titleEn: "Yemen Economic Transparency Observatory",
    titleAr: "مرصد الشفافية الاقتصادية اليمني",
    subtitleEn: "Evidence-based economic intelligence for Yemen",
    subtitleAr: "استخبارات اقتصادية مبنية على الأدلة لليمن",
    showTicker: true,
    showKPIs: true,
    backgroundType: "gradient"
  });

  const [sections, setSections] = useState<SectionConfig[]>([
    { id: "kpis", type: "kpis", enabled: true, order: 1, titleEn: "Key Indicators", titleAr: "المؤشرات الرئيسية" },
    { id: "sectors", type: "sectors", enabled: true, order: 2, titleEn: "Economic Sectors", titleAr: "القطاعات الاقتصادية" },
    { id: "sources", type: "sources", enabled: true, order: 3, titleEn: "Trusted Sources", titleAr: "المصادر الموثوقة" },
    { id: "updates", type: "updates", enabled: true, order: 4, titleEn: "Latest Updates", titleAr: "آخر التحديثات" },
    { id: "features", type: "features", enabled: true, order: 5, titleEn: "Platform Features", titleAr: "مميزات المنصة" },
    { id: "cta", type: "cta", enabled: true, order: 6, titleEn: "Call to Action", titleAr: "دعوة للعمل" }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(isArabic ? "تم حفظ التغييرات" : "Changes saved successfully");
    setIsSaving(false);
  };

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    setSections(prev => {
      const index = prev.findIndex(s => s.id === id);
      if ((direction === "up" && index === 0) || (direction === "down" && index === prev.length - 1)) {
        return prev;
      }
      const newSections = [...prev];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];
      return newSections.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Home className="w-6 h-6 text-[#4C583E]" />
              {isArabic ? "إدارة الصفحة الرئيسية" : "Homepage CMS"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isArabic 
                ? "تخصيص محتوى وتخطيط الصفحة الرئيسية"
                : "Customize homepage content and layout"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              {isArabic ? "معاينة" : "Preview"}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="gap-2 bg-[#4C583E] hover:bg-[#0d5c34]"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isArabic ? "حفظ التغييرات" : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hero" className="gap-2">
              <Layout className="w-4 h-4" />
              {isArabic ? "القسم الرئيسي" : "Hero Section"}
            </TabsTrigger>
            <TabsTrigger value="sections" className="gap-2">
              <GripVertical className="w-4 h-4" />
              {isArabic ? "الأقسام" : "Sections"}
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <Type className="w-4 h-4" />
              {isArabic ? "المحتوى" : "Content"}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              {isArabic ? "الإعدادات" : "Settings"}
            </TabsTrigger>
          </TabsList>

          {/* Hero Section Tab */}
          <TabsContent value="hero" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* English Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    English Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hero Title</Label>
                    <Input 
                      value={heroConfig.titleEn}
                      onChange={(e) => setHeroConfig(prev => ({ ...prev, titleEn: e.target.value }))}
                      placeholder="Main headline..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Textarea 
                      value={heroConfig.subtitleEn}
                      onChange={(e) => setHeroConfig(prev => ({ ...prev, subtitleEn: e.target.value }))}
                      placeholder="Supporting text..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Arabic Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    المحتوى العربي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" dir="rtl">
                  <div className="space-y-2">
                    <Label>العنوان الرئيسي</Label>
                    <Input 
                      value={heroConfig.titleAr}
                      onChange={(e) => setHeroConfig(prev => ({ ...prev, titleAr: e.target.value }))}
                      placeholder="العنوان الرئيسي..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>العنوان الفرعي</Label>
                    <Textarea 
                      value={heroConfig.subtitleAr}
                      onChange={(e) => setHeroConfig(prev => ({ ...prev, subtitleAr: e.target.value }))}
                      placeholder="النص الداعم..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hero Options */}
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "خيارات العرض" : "Display Options"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{isArabic ? "شريط الأخبار" : "News Ticker"}</Label>
                    <p className="text-sm text-gray-500">
                      {isArabic ? "عرض شريط الأخبار المتحرك" : "Show scrolling news ticker"}
                    </p>
                  </div>
                  <Switch 
                    checked={heroConfig.showTicker}
                    onCheckedChange={(checked) => setHeroConfig(prev => ({ ...prev, showTicker: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{isArabic ? "بطاقات KPI" : "KPI Cards"}</Label>
                    <p className="text-sm text-gray-500">
                      {isArabic ? "عرض بطاقات المؤشرات الرئيسية" : "Show floating KPI indicator cards"}
                    </p>
                  </div>
                  <Switch 
                    checked={heroConfig.showKPIs}
                    onCheckedChange={(checked) => setHeroConfig(prev => ({ ...prev, showKPIs: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "ترتيب الأقسام" : "Section Order"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? "اسحب لإعادة ترتيب الأقسام أو قم بتفعيل/تعطيلها"
                    : "Drag to reorder sections or toggle them on/off"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sections.sort((a, b) => a.order - b.order).map((section) => (
                    <div 
                      key={section.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        section.enabled 
                          ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                          : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                        <div className="flex items-center gap-3">
                          {section.type === "kpis" && <BarChart3 className="w-5 h-5 text-[#4C583E]" />}
                          {section.type === "sectors" && <Layout className="w-5 h-5 text-blue-500" />}
                          {section.type === "sources" && <Users className="w-5 h-5 text-purple-500" />}
                          {section.type === "updates" && <FileText className="w-5 h-5 text-orange-500" />}
                          {section.type === "features" && <Settings className="w-5 h-5 text-cyan-500" />}
                          {section.type === "cta" && <AlertCircle className="w-5 h-5 text-amber-500" />}
                          <div>
                            <p className="font-medium">{isArabic ? section.titleAr : section.titleEn}</p>
                            <p className="text-sm text-gray-500">{section.type}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => moveSection(section.id, "up")}
                          disabled={section.order === 1}
                        >
                          ↑
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => moveSection(section.id, "down")}
                          disabled={section.order === sections.length}
                        >
                          ↓
                        </Button>
                        <Switch 
                          checked={section.enabled}
                          onCheckedChange={() => toggleSection(section.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#4C583E]" />
                    {isArabic ? "مؤشرات KPI" : "KPI Indicators"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    {isArabic 
                      ? "يتم سحب المؤشرات تلقائياً من قاعدة البيانات"
                      : "Indicators are automatically pulled from the database"}
                  </p>
                  <div className="space-y-2">
                    {["GDP Growth", "Inflation Rate", "Exchange Rate", "Foreign Reserves"].map((kpi, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm">{kpi}</span>
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5 text-blue-500" />
                    {isArabic ? "القطاعات المعروضة" : "Featured Sectors"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    {isArabic 
                      ? "يتم عرض جميع القطاعات النشطة من قاعدة البيانات"
                      : "All active sectors from the database are displayed"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Trade", "Banking", "Currency", "Aid", "Energy", "Food Security"].map((sector, i) => (
                      <Badge key={i} variant="secondary">{sector}</Badge>
                    ))}
                    <Badge variant="outline">+9 more</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "إعدادات SEO" : "SEO Settings"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{isArabic ? "عنوان الصفحة (EN)" : "Page Title (EN)"}</Label>
                  <Input defaultValue="YETO - Yemen Economic Transparency Observatory" />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "عنوان الصفحة (AR)" : "Page Title (AR)"}</Label>
                  <Input defaultValue="يتو - مرصد الشفافية الاقتصادية اليمني" dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "الوصف التعريفي" : "Meta Description"}</Label>
                  <Textarea 
                    defaultValue="Evidence-based economic intelligence platform for Yemen, providing verified data, analysis, and insights across 16 economic sectors."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "إعدادات الأداء" : "Performance Settings"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{isArabic ? "التحميل الكسول" : "Lazy Loading"}</Label>
                    <p className="text-sm text-gray-500">
                      {isArabic ? "تحميل الصور والأقسام عند التمرير" : "Load images and sections on scroll"}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{isArabic ? "الرسوم المتحركة" : "Animations"}</Label>
                    <p className="text-sm text-gray-500">
                      {isArabic ? "تفعيل الرسوم المتحركة للأقسام" : "Enable section animations"}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
