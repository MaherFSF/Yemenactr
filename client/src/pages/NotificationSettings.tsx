import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Bell, Mail, FileText, AlertTriangle, Clock, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function NotificationSettings() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isArabic = language === "ar";

  // Local state for preferences
  const [preferences, setPreferences] = useState({
    emailDailyDigest: false,
    emailWeeklyMonitor: true,
    emailMonthlyBrief: true,
    emailSpecialReports: true,
    emailDataAlerts: false,
    emailCorrectionNotices: true,
    watchlistAlerts: true,
    preferredLanguage: "both" as "en" | "ar" | "both",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof typeof preferences) => {
    if (typeof preferences[key] === "boolean") {
      setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleLanguageChange = (value: "en" | "ar" | "both") => {
    setPreferences(prev => ({ ...prev, preferredLanguage: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Would call tRPC mutation here
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(isArabic ? "تم حفظ التفضيلات بنجاح" : "Preferences saved successfully");
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ أثناء الحفظ" : "Error saving preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const content = {
    title: {
      en: "Notification Settings",
      ar: "إعدادات الإشعارات",
    },
    subtitle: {
      en: "Manage how you receive updates from YETO",
      ar: "إدارة كيفية تلقي التحديثات من يتو",
    },
    publications: {
      title: { en: "Publication Subscriptions", ar: "اشتراكات المنشورات" },
      description: { en: "Choose which publications you want to receive", ar: "اختر المنشورات التي تريد تلقيها" },
    },
    daily: {
      title: { en: "Daily Economic Signals Digest", ar: "ملخص الإشارات الاقتصادية اليومية" },
      description: { en: "Key indicators and market movements every morning", ar: "المؤشرات الرئيسية وتحركات السوق كل صباح" },
    },
    weekly: {
      title: { en: "Weekly Market & FX Monitor", ar: "مراقب السوق والصرف الأسبوعي" },
      description: { en: "Comprehensive weekly analysis of market trends", ar: "تحليل أسبوعي شامل لاتجاهات السوق" },
    },
    monthly: {
      title: { en: "Monthly Macro-Fiscal Brief", ar: "الموجز الاقتصادي الكلي الشهري" },
      description: { en: "In-depth monthly economic overview", ar: "نظرة عامة اقتصادية شهرية متعمقة" },
    },
    special: {
      title: { en: "Special Reports", ar: "التقارير الخاصة" },
      description: { en: "Ad-hoc analyses on significant economic events", ar: "تحليلات خاصة للأحداث الاقتصادية المهمة" },
    },
    alerts: {
      title: { en: "Alerts & Notifications", ar: "التنبيهات والإشعارات" },
      description: { en: "Real-time alerts for important changes", ar: "تنبيهات فورية للتغييرات المهمة" },
    },
    dataAlerts: {
      title: { en: "Data Update Alerts", ar: "تنبيهات تحديث البيانات" },
      description: { en: "Get notified when new data is published", ar: "احصل على إشعار عند نشر بيانات جديدة" },
    },
    corrections: {
      title: { en: "Correction Notices", ar: "إشعارات التصحيح" },
      description: { en: "Be informed when data corrections are made", ar: "كن على علم عند إجراء تصحيحات على البيانات" },
    },
    watchlist: {
      title: { en: "Watchlist Alerts", ar: "تنبيهات قائمة المراقبة" },
      description: { en: "Alerts for indicators in your watchlist", ar: "تنبيهات للمؤشرات في قائمة مراقبتك" },
    },
    language: {
      title: { en: "Preferred Language", ar: "اللغة المفضلة" },
      description: { en: "Choose the language for your notifications", ar: "اختر لغة الإشعارات" },
      english: { en: "English only", ar: "الإنجليزية فقط" },
      arabic: { en: "Arabic only", ar: "العربية فقط" },
      both: { en: "Both languages", ar: "كلتا اللغتين" },
    },
    save: { en: "Save Preferences", ar: "حفظ التفضيلات" },
    saving: { en: "Saving...", ar: "جاري الحفظ..." },
    loginRequired: {
      title: { en: "Login Required", ar: "تسجيل الدخول مطلوب" },
      description: { en: "Please log in to manage your notification preferences", ar: "يرجى تسجيل الدخول لإدارة تفضيلات الإشعارات" },
    },
  };

  const t = (key: keyof typeof content) => {
    const item = content[key];
    if (typeof item === "object" && "en" in item && "ar" in item) {
      return isArabic ? item.ar : item.en;
    }
    return "";
  };

  const tNested = (key: keyof typeof content, subKey: string) => {
    const item = content[key] as Record<string, { en: string; ar: string }>;
    if (item && item[subKey]) {
      return isArabic ? item[subKey].ar : item[subKey].en;
    }
    return "";
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col bg-background ${isArabic ? "rtl" : "ltr"}`} dir={isArabic ? "rtl" : "ltr"}>
        <Header />
        <main className="flex-1 container py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle>{tNested("loginRequired", "title")}</CardTitle>
              <CardDescription>{tNested("loginRequired", "description")}</CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-background ${isArabic ? "rtl" : "ltr"}`} dir={isArabic ? "rtl" : "ltr"}>
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className={isArabic ? "text-right" : ""}>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>

          {/* Publication Subscriptions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#2e6b4f]" />
                <div>
                  <CardTitle>{tNested("publications", "title")}</CardTitle>
                  <CardDescription>{tNested("publications", "description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Daily Digest */}
              <div className="flex items-center justify-between">
                <div className={`space-y-0.5 ${isArabic ? "text-right" : ""}`}>
                  <Label className="text-base font-medium">{tNested("daily", "title")}</Label>
                  <p className="text-sm text-muted-foreground">{tNested("daily", "description")}</p>
                </div>
                <Switch
                  checked={preferences.emailDailyDigest}
                  onCheckedChange={() => handleToggle("emailDailyDigest")}
                />
              </div>

              <Separator />

              {/* Weekly Monitor */}
              <div className="flex items-center justify-between">
                <div className={`space-y-0.5 ${isArabic ? "text-right" : ""}`}>
                  <Label className="text-base font-medium">{tNested("weekly", "title")}</Label>
                  <p className="text-sm text-muted-foreground">{tNested("weekly", "description")}</p>
                </div>
                <Switch
                  checked={preferences.emailWeeklyMonitor}
                  onCheckedChange={() => handleToggle("emailWeeklyMonitor")}
                />
              </div>

              <Separator />

              {/* Monthly Brief */}
              <div className="flex items-center justify-between">
                <div className={`space-y-0.5 ${isArabic ? "text-right" : ""}`}>
                  <Label className="text-base font-medium">{tNested("monthly", "title")}</Label>
                  <p className="text-sm text-muted-foreground">{tNested("monthly", "description")}</p>
                </div>
                <Switch
                  checked={preferences.emailMonthlyBrief}
                  onCheckedChange={() => handleToggle("emailMonthlyBrief")}
                />
              </div>

              <Separator />

              {/* Special Reports */}
              <div className="flex items-center justify-between">
                <div className={`space-y-0.5 ${isArabic ? "text-right" : ""}`}>
                  <Label className="text-base font-medium">{tNested("special", "title")}</Label>
                  <p className="text-sm text-muted-foreground">{tNested("special", "description")}</p>
                </div>
                <Switch
                  checked={preferences.emailSpecialReports}
                  onCheckedChange={() => handleToggle("emailSpecialReports")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#C0A030]" />
                <div>
                  <CardTitle>{tNested("alerts", "title")}</CardTitle>
                  <CardDescription>{tNested("alerts", "description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Alerts */}
              <div className="flex items-center justify-between">
                <div className={`space-y-0.5 ${isArabic ? "text-right" : ""}`}>
                  <Label className="text-base font-medium">{tNested("dataAlerts", "title")}</Label>
                  <p className="text-sm text-muted-foreground">{tNested("dataAlerts", "description")}</p>
                </div>
                <Switch
                  checked={preferences.emailDataAlerts}
                  onCheckedChange={() => handleToggle("emailDataAlerts")}
                />
              </div>

              <Separator />

              {/* Correction Notices */}
              <div className="flex items-center justify-between">
                <div className={`space-y-0.5 ${isArabic ? "text-right" : ""}`}>
                  <Label className="text-base font-medium">{tNested("corrections", "title")}</Label>
                  <p className="text-sm text-muted-foreground">{tNested("corrections", "description")}</p>
                </div>
                <Switch
                  checked={preferences.emailCorrectionNotices}
                  onCheckedChange={() => handleToggle("emailCorrectionNotices")}
                />
              </div>

              <Separator />

              {/* Watchlist Alerts */}
              <div className="flex items-center justify-between">
                <div className={`space-y-0.5 ${isArabic ? "text-right" : ""}`}>
                  <Label className="text-base font-medium">{tNested("watchlist", "title")}</Label>
                  <p className="text-sm text-muted-foreground">{tNested("watchlist", "description")}</p>
                </div>
                <Switch
                  checked={preferences.watchlistAlerts}
                  onCheckedChange={() => handleToggle("watchlistAlerts")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language Preference */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#2e6b4f]" />
                <div>
                  <CardTitle>{tNested("language", "title")}</CardTitle>
                  <CardDescription>{tNested("language", "description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={preferences.preferredLanguage}
                onValueChange={(value) => handleLanguageChange(value as "en" | "ar" | "both")}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en" className="cursor-pointer">
                    {tNested("language", "english")}
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <RadioGroupItem value="ar" id="lang-ar" />
                  <Label htmlFor="lang-ar" className="cursor-pointer">
                    {tNested("language", "arabic")}
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <RadioGroupItem value="both" id="lang-both" />
                  <Label htmlFor="lang-both" className="cursor-pointer">
                    {tNested("language", "both")}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className={`flex ${isArabic ? "justify-start" : "justify-end"}`}>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#2e6b4f] hover:bg-[#0d5a34] text-white px-8"
            >
              {isSaving ? t("saving") : t("save")}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
