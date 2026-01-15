import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Bell, 
  Mail, 
  TrendingUp, 
  FileText, 
  AlertTriangle,
  Calendar,
  Clock,
  Settings,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  BarChart3,
  Zap,
  Globe,
  Shield,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

// Subscription tier definitions
const SUBSCRIPTION_TIERS = {
  public: {
    name: "Public",
    nameAr: "عام",
    color: "bg-slate-500",
    features: ["Basic data access", "Weekly digest emails"],
    featuresAr: ["الوصول الأساسي للبيانات", "رسائل الملخص الأسبوعية"],
  },
  registered: {
    name: "Registered",
    nameAr: "مسجل",
    color: "bg-blue-500",
    features: ["Full data access", "Daily alerts", "Custom reports"],
    featuresAr: ["الوصول الكامل للبيانات", "تنبيهات يومية", "تقارير مخصصة"],
  },
  pro: {
    name: "Professional",
    nameAr: "احترافي",
    color: "bg-purple-500",
    features: ["Real-time alerts", "API access", "Priority support"],
    featuresAr: ["تنبيهات فورية", "الوصول للـ API", "دعم أولوي"],
  },
  institutional: {
    name: "Institutional",
    nameAr: "مؤسسي",
    color: "bg-amber-500",
    features: ["Unlimited access", "Custom integrations", "Dedicated support"],
    featuresAr: ["وصول غير محدود", "تكاملات مخصصة", "دعم مخصص"],
  },
};

// Notification category definitions
const NOTIFICATION_CATEGORIES = [
  {
    id: "exchange_rates",
    icon: TrendingUp,
    name: "Exchange Rate Alerts",
    nameAr: "تنبيهات سعر الصرف",
    description: "Get notified when exchange rates change significantly",
    descriptionAr: "احصل على إشعارات عند تغير أسعار الصرف بشكل ملحوظ",
    thresholds: ["1%", "2%", "5%", "10%"],
  },
  {
    id: "publications",
    icon: FileText,
    name: "New Publications",
    nameAr: "منشورات جديدة",
    description: "Alerts for new research reports and CBY directives",
    descriptionAr: "تنبيهات للتقارير البحثية الجديدة وتوجيهات البنك المركزي",
    categories: ["CBY Directives", "Research Reports", "Policy Briefs"],
  },
  {
    id: "economic_events",
    icon: AlertTriangle,
    name: "Economic Events",
    nameAr: "الأحداث الاقتصادية",
    description: "Major economic events and policy changes",
    descriptionAr: "الأحداث الاقتصادية الرئيسية وتغييرات السياسات",
    severity: ["Critical", "High", "Medium"],
  },
  {
    id: "data_updates",
    icon: BarChart3,
    name: "Data Updates",
    nameAr: "تحديثات البيانات",
    description: "New datasets and indicator updates",
    descriptionAr: "مجموعات البيانات الجديدة وتحديثات المؤشرات",
    sectors: ["Banking", "Trade", "Monetary", "Fiscal"],
  },
];

// Frequency options
const FREQUENCY_OPTIONS = [
  { value: "realtime", label: "Real-time", labelAr: "فوري", icon: Zap },
  { value: "hourly", label: "Hourly", labelAr: "كل ساعة", icon: Clock },
  { value: "daily", label: "Daily Digest", labelAr: "ملخص يومي", icon: Calendar },
  { value: "weekly", label: "Weekly Summary", labelAr: "ملخص أسبوعي", icon: Calendar },
  { value: "monthly", label: "Monthly Report", labelAr: "تقرير شهري", icon: FileText },
];

export default function SubscriptionManagement() {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("preferences");
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Initialize preferences
  useEffect(() => {
    // Load saved preferences from localStorage or API
    const savedPrefs = localStorage.getItem("yeto_notification_prefs");
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    } else {
      // Default preferences
      setPreferences({
        exchange_rates: { enabled: true, frequency: "daily", threshold: "2%" },
        publications: { enabled: true, frequency: "weekly", categories: ["CBY Directives"] },
        economic_events: { enabled: true, frequency: "realtime", severity: ["Critical", "High"] },
        data_updates: { enabled: false, frequency: "weekly", sectors: [] },
        email: user?.email || "",
        language: language,
      });
    }
  }, [user, language]);

  // Save preferences
  const savePreferences = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("yeto_notification_prefs", JSON.stringify(preferences));
      // In production, also save to backend
      toast.success(language === "ar" ? "تم حفظ التفضيلات بنجاح" : "Preferences saved successfully");
    } catch (error) {
      toast.error(language === "ar" ? "فشل في حفظ التفضيلات" : "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle category
  const toggleCategory = (categoryId: string) => {
    setPreferences(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        enabled: !prev[categoryId]?.enabled,
      },
    }));
  };

  // Update frequency
  const updateFrequency = (categoryId: string, frequency: string) => {
    setPreferences(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        frequency,
      },
    }));
  };

  // Current tier (mock - would come from user profile)
  const currentTier = isAuthenticated ? "registered" : "public";
  const tierInfo = SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Bloomberg/IMF Style */}
      <section className="bg-gradient-to-br from-[#103050] via-[#1a4060] to-[#103050] text-white border-b">
        <div className="container py-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Bell className="h-7 w-7 text-[#C0A030]" />
              </div>
              <div>
                <Badge className={`${tierInfo.color} text-white`}>
                  {language === "ar" ? tierInfo.nameAr : tierInfo.name}
                </Badge>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {language === "ar" 
                ? "إدارة الاشتراكات والتنبيهات"
                : "Subscription & Alert Management"}
            </h1>
            <p className="text-lg text-white/80 mb-6">
              {language === "ar"
                ? "تخصيص تنبيهاتك وتقاريرك للبقاء على اطلاع بالتطورات الاقتصادية في اليمن"
                : "Customize your alerts and reports to stay informed on Yemen's economic developments"}
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold text-[#C0A030]">
                  {Object.values(preferences).filter((p: any) => p?.enabled).length}
                </div>
                <div className="text-sm text-white/70">
                  {language === "ar" ? "تنبيهات نشطة" : "Active Alerts"}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold text-[#107040]">24</div>
                <div className="text-sm text-white/70">
                  {language === "ar" ? "تنبيهات هذا الشهر" : "Alerts This Month"}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-sm text-white/70">
                  {language === "ar" ? "تقارير مستلمة" : "Reports Received"}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold text-white">98%</div>
                <div className="text-sm text-white/70">
                  {language === "ar" ? "معدل التسليم" : "Delivery Rate"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-8 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="preferences" className="gap-2">
              <Bell className="h-4 w-4" />
              {language === "ar" ? "التفضيلات" : "Preferences"}
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              {language === "ar" ? "التقارير" : "Reports"}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              {language === "ar" ? "السجل" : "History"}
            </TabsTrigger>
          </TabsList>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            {/* Email Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#107040]" />
                  {language === "ar" ? "إعدادات البريد الإلكتروني" : "Email Settings"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "أدخل بريدك الإلكتروني لتلقي التنبيهات والتقارير"
                    : "Enter your email to receive alerts and reports"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "البريد الإلكتروني" : "Email Address"}</Label>
                    <Input 
                      type="email"
                      placeholder="your@email.com"
                      value={preferences.email || ""}
                      onChange={(e) => setPreferences(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "ar" ? "لغة التنبيهات" : "Alert Language"}</Label>
                    <Select 
                      value={preferences.language || "ar"}
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="both">{language === "ar" ? "كلاهما" : "Both"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Categories */}
            <div className="grid md:grid-cols-2 gap-6">
              {NOTIFICATION_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isEnabled = preferences[category.id]?.enabled;
                const frequency = preferences[category.id]?.frequency || "daily";
                
                return (
                  <Card key={category.id} className={`transition-all ${isEnabled ? "ring-2 ring-[#107040]" : ""}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isEnabled ? "bg-[#107040]/10" : "bg-muted"}`}>
                            <Icon className={`h-5 w-5 ${isEnabled ? "text-[#107040]" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {language === "ar" ? category.nameAr : category.name}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {language === "ar" ? category.descriptionAr : category.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Switch 
                          checked={isEnabled}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                      </div>
                    </CardHeader>
                    {isEnabled && (
                      <CardContent className="pt-0 space-y-4">
                        {/* Frequency Selector */}
                        <div className="space-y-2">
                          <Label className="text-sm">{language === "ar" ? "التكرار" : "Frequency"}</Label>
                          <div className="flex flex-wrap gap-2">
                            {FREQUENCY_OPTIONS.map((option) => {
                              const FreqIcon = option.icon;
                              const isSelected = frequency === option.value;
                              return (
                                <Button
                                  key={option.value}
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  className={`gap-1 ${isSelected ? "bg-[#107040] hover:bg-[#0d5a34]" : ""}`}
                                  onClick={() => updateFrequency(category.id, option.value)}
                                >
                                  <FreqIcon className="h-3 w-3" />
                                  {language === "ar" ? option.labelAr : option.label}
                                </Button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Category-specific options */}
                        {category.id === "exchange_rates" && category.thresholds && (
                          <div className="space-y-2">
                            <Label className="text-sm">{language === "ar" ? "حد التغيير" : "Change Threshold"}</Label>
                            <Select 
                              value={preferences[category.id]?.threshold || "2%"}
                              onValueChange={(value) => setPreferences(prev => ({
                                ...prev,
                                [category.id]: { ...prev[category.id], threshold: value }
                              }))}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {category.thresholds.map((t) => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                {language === "ar" ? "إعادة تعيين" : "Reset"}
              </Button>
              <Button 
                onClick={savePreferences} 
                disabled={isSaving}
                className="bg-[#107040] hover:bg-[#0d5a34] gap-2"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {language === "ar" ? "حفظ التفضيلات" : "Save Preferences"}
              </Button>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#C0A030]" />
                  {language === "ar" ? "التقارير المجدولة" : "Scheduled Reports"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "إدارة التقارير التلقائية التي يتم إرسالها إلى بريدك الإلكتروني"
                    : "Manage automated reports delivered to your email"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Weekly Economic Summary */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#107040]/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-[#107040]" />
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {language === "ar" ? "الملخص الاقتصادي الأسبوعي" : "Weekly Economic Summary"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "كل يوم أحد الساعة 8 صباحاً" : "Every Sunday at 8:00 AM"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {language === "ar" ? "نشط" : "Active"}
                    </Badge>
                    <Switch defaultChecked />
                  </div>
                </div>

                {/* Monthly Analysis Report */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#C0A030]/10 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-[#C0A030]" />
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {language === "ar" ? "تقرير التحليل الشهري" : "Monthly Analysis Report"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "أول يوم من كل شهر" : "First day of each month"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {language === "ar" ? "نشط" : "Active"}
                    </Badge>
                    <Switch defaultChecked />
                  </div>
                </div>

                {/* Quarterly Deep Dive */}
                <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {language === "ar" ? "التحليل الفصلي المعمق" : "Quarterly Deep Dive"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "متاح للمشتركين المحترفين" : "Available for Pro subscribers"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowUpgradeDialog(true)}>
                    {language === "ar" ? "ترقية" : "Upgrade"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#103050]" />
                  {language === "ar" ? "سجل التنبيهات" : "Alert History"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "التنبيهات والتقارير المرسلة إليك"
                    : "Alerts and reports sent to you"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: "exchange_rate", title: "Exchange Rate Alert: YER/USD +2.3%", titleAr: "تنبيه سعر الصرف: ريال/دولار +2.3%", time: "2 hours ago", timeAr: "منذ ساعتين" },
                    { type: "publication", title: "New CBY Directive Published", titleAr: "نشر توجيه جديد للبنك المركزي", time: "Yesterday", timeAr: "أمس" },
                    { type: "report", title: "Weekly Summary Delivered", titleAr: "تم تسليم الملخص الأسبوعي", time: "3 days ago", timeAr: "منذ 3 أيام" },
                    { type: "event", title: "Economic Event: IMF Mission Visit", titleAr: "حدث اقتصادي: زيارة بعثة صندوق النقد", time: "1 week ago", timeAr: "منذ أسبوع" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          item.type === "exchange_rate" ? "bg-[#107040]" :
                          item.type === "publication" ? "bg-[#C0A030]" :
                          item.type === "report" ? "bg-[#103050]" : "bg-red-500"
                        }`} />
                        <span className="font-medium">
                          {language === "ar" ? item.titleAr : item.title}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? item.timeAr : item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  {language === "ar" ? "عرض السجل الكامل" : "View Full History"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#C0A030]" />
              {language === "ar" ? "ترقية اشتراكك" : "Upgrade Your Subscription"}
            </DialogTitle>
            <DialogDescription>
              {language === "ar"
                ? "احصل على المزيد من الميزات والتقارير المتقدمة"
                : "Get access to more features and advanced reports"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {Object.entries(SUBSCRIPTION_TIERS).slice(1).map(([key, tier]) => (
              <div key={key} className={`p-4 border rounded-lg ${key === "pro" ? "ring-2 ring-[#C0A030]" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${tier.color} text-white`}>
                    {language === "ar" ? tier.nameAr : tier.name}
                  </Badge>
                  {key === "pro" && (
                    <Badge variant="outline" className="text-[#C0A030] border-[#C0A030]">
                      {language === "ar" ? "موصى به" : "Recommended"}
                    </Badge>
                  )}
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {(language === "ar" ? tier.featuresAr : tier.features).map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-[#107040]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              {language === "ar" ? "لاحقاً" : "Maybe Later"}
            </Button>
            <Button className="bg-[#C0A030] hover:bg-[#a08020]">
              {language === "ar" ? "ترقية الآن" : "Upgrade Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
