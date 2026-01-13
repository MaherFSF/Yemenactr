import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { getLoginUrl } from "@/const";
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertTriangle,
  Bell,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Shield,
  Globe,
  Building2,
  Users,
  Clock,
  Calendar,
  Download,
  Send,
  MessageSquare,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Eye,
  Settings,
  Briefcase,
  Scale,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
} from "lucide-react";

// Governor profile data
const governorProfile = {
  name: "Ahmed Ghaleb Al-Maabqi",
  nameAr: "أحمد غالب المعبقي",
  title: "Governor",
  titleAr: "المحافظ",
  institution: "Central Bank of Yemen - Aden",
  institutionAr: "البنك المركزي اليمني - عدن",
  appointedDate: "2023-04-15",
  image: "/images/governor-placeholder.jpg",
};

// Key economic indicators
const economicIndicators = [
  {
    id: "exchange_rate_aden",
    label: "Exchange Rate (Aden)",
    labelAr: "سعر الصرف (عدن)",
    value: 1540,
    unit: "YER/USD",
    change: 2.3,
    trend: "up",
    status: "warning",
  },
  {
    id: "exchange_rate_sanaa",
    label: "Exchange Rate (Sanaa)",
    labelAr: "سعر الصرف (صنعاء)",
    value: 1850,
    unit: "YER/USD",
    change: 8.7,
    trend: "up",
    status: "critical",
  },
  {
    id: "gdp_growth",
    label: "GDP Growth",
    labelAr: "نمو الناتج المحلي",
    value: -1.5,
    unit: "%",
    change: -0.3,
    trend: "down",
    status: "critical",
  },
  {
    id: "inflation",
    label: "Inflation Rate",
    labelAr: "معدل التضخم",
    value: 42.1,
    unit: "%",
    change: 5.2,
    trend: "up",
    status: "critical",
  },
];

// Banking sector summary
const bankingSectorSummary = {
  totalBanks: 25,
  adenBanks: 18,
  sanaaBanks: 7,
  totalAssets: 8.2, // billion USD
  averageCAR: 18.7,
  averageNPL: 12.3,
  banksUnderWatch: 3,
  sanctionedBanks: 1,
};

// Recent alerts
const recentAlerts = [
  {
    id: 1,
    type: "urgent",
    title: "Exchange Rate Threshold Exceeded",
    titleAr: "تجاوز عتبة سعر الصرف في صنعاء",
    time: "Today, 14:30",
    timeAr: "اليوم، 14:30",
    category: "monetary",
  },
  {
    id: 2,
    type: "warning",
    title: "Inflation Above Expected Rate",
    titleAr: "ارتفاع التضخم فوق المعدل المتوقع",
    time: "Yesterday, 10:15",
    timeAr: "أمس، 10:15",
    category: "economic",
  },
  {
    id: 3,
    type: "info",
    title: "GDP Data Updated",
    titleAr: "تحديث بيانات الناتج المحلي الإجمالي",
    time: "May 23, 16:45",
    timeAr: "23 مايو، 16:45",
    category: "data",
  },
];

// Recent events
const recentEvents = [
  {
    id: 1,
    title: "Exchange rate threshold exceeded in Sanaa",
    titleAr: "تجاوز عتبة سعر الصرف في صنعاء للمستويات الناتج المحلي اليمني",
    time: "Today - 14:30",
    timeAr: "اليوم - 14:30",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    id: 2,
    title: "Inflation above expected rate",
    titleAr: "ارتفاع التضخم فوق المعدل المتوقع المصالحي إلى من المحلي الإجمالي عين الوهل المحلي اليمني",
    time: "Yesterday, 10:15",
    timeAr: "أمس، 10:15",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    id: 3,
    title: "GDP data updated",
    titleAr: "تحديث بيانات الناتج المحلي الإجمالي المقدرة. البيانات",
    time: "May 23, 16:45",
    timeAr: "23 مايو، 16:45",
    icon: <BarChart3 className="h-4 w-4" />,
  },
];

// Quick actions
const quickActions = [
  { id: "report", label: "Generate Report", labelAr: "تصدير تقرير", icon: <FileText className="h-5 w-5" /> },
  { id: "view", label: "Save View", labelAr: "حفظ طريقة العرض", icon: <Eye className="h-5 w-5" /> },
  { id: "share", label: "Share", labelAr: "مشاركة", icon: <Send className="h-5 w-5" /> },
];

// Tracked indicators
const trackedIndicators = [
  { id: 1, name: "Exchange Rate - Comparison", nameAr: "سعر الصرف - مقارنة", value: "1,540", unit: "ريال" },
  { id: 2, name: "Capital Adequacy Ratio", nameAr: "نسبة كفاية رأس المال", value: "1,850", unit: "ريال" },
  { id: 3, name: "Non-Performing Loans", nameAr: "القروض غير العاملة", value: "1,540", unit: "ريال" },
  { id: 4, name: "Non-Performing Loans", nameAr: "القروض غير العاملة", value: "1,650", unit: "ريال" },
];

export default function GovernorDashboard() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [activeTab, setActiveTab] = useState("overview");
  const [aiQuery, setAiQuery] = useState("");
  const [showAiChat, setShowAiChat] = useState(false);

  // Suggested AI questions
  const suggestedQuestions = [
    { id: 1, text: "What is the current monetary policy stance?", textAr: "ما هي السياسة النقدية الحالية؟" },
    { id: 2, text: "Compare Aden vs Sanaa exchange rate trends", textAr: "قارن اتجاهات سعر الصرف بين عدن وصنعاء" },
    { id: 3, text: "Banking sector risk assessment", textAr: "تقييم مخاطر القطاع المصرفي" },
    { id: 4, text: "Inflation drivers analysis", textAr: "تحليل محركات التضخم" },
  ];

  const formatNumber = (num: number, decimals = 1) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="max-w-md w-full mx-4 bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
              <Landmark className="h-10 w-10 text-amber-500" />
            </div>
            <CardTitle className="text-2xl text-white">{isRTL ? "لوحة تحكم المحافظ" : "Governor Dashboard"}</CardTitle>
            <CardDescription className="text-slate-400">{isRTL ? "يرجى تسجيل الدخول للوصول إلى لوحة التحكم التنفيذية" : "Please log in to access the executive dashboard"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" asChild>
              <a href={getLoginUrl()}>{isRTL ? "تسجيل الدخول" : "Log In"}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                <Landmark className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {isRTL ? "لوحة تحكم تنفيذية" : "Executive Dashboard"}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold">{isRTL ? governorProfile.nameAr : governorProfile.name}</h1>
                <p className="text-slate-400">{isRTL ? `${governorProfile.titleAr} - ${governorProfile.institutionAr}` : `${governorProfile.title} - ${governorProfile.institution}`}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                <Bell className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? "التنبيهات" : "Alerts"}
                <Badge className="bg-red-500 text-white text-xs ml-2">3</Badge>
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? "التقارير" : "Reports"}
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? "المساعد الذكي" : "AI Assistant"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {economicIndicators.map((indicator) => (
            <Card key={indicator.id} className={`${
              indicator.status === "critical" ? "border-red-200 dark:border-red-800" :
              indicator.status === "warning" ? "border-amber-200 dark:border-amber-800" :
              "border-slate-200 dark:border-slate-700"
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{isRTL ? indicator.labelAr : indicator.label}</span>
                  {indicator.status === "critical" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  {indicator.status === "warning" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{formatNumber(indicator.value, indicator.unit === "%" ? 1 : 0)}</span>
                  <span className="text-sm text-slate-500">{indicator.unit}</span>
                </div>
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  indicator.trend === "up" && indicator.change > 0 ? "text-red-600" :
                  indicator.trend === "down" && indicator.change < 0 ? "text-red-600" :
                  "text-emerald-600"
                }`}>
                  {indicator.trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {indicator.change > 0 ? "+" : ""}{formatNumber(indicator.change)}%
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exchange Rate Chart Placeholder */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{isRTL ? "سعر الصرف - مقارنة عدن/صنعاء" : "Exchange Rate - Aden/Sanaa Comparison"}</CardTitle>
                    <CardDescription>{isRTL ? "اتجاهات سعر الصرف 2020-2024" : "Exchange rate trends 2020-2024"}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      {isRTL ? "عدن" : "Aden"}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      {isRTL ? "صنعاء" : "Sanaa"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">{isRTL ? "رسم بياني تفاعلي لسعر الصرف" : "Interactive exchange rate chart"}</p>
                    <p className="text-xs text-slate-400 mt-1">{isRTL ? "عدن: 1,540 | صنعاء: 1,850 ريال/دولار" : "Aden: 1,540 | Sanaa: 1,850 YER/USD"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banking Sector Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "مؤشرات القطاع المصرفي" : "Banking Sector Indicators"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Assets */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Banknote className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{isRTL ? "إجمالي الأصول" : "Total Assets"}</span>
                    </div>
                    <div className="h-20 bg-gradient-to-t from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded flex items-end justify-center gap-1 p-2">
                      {[1500, 2000, 2500, 3000, 3500].map((h, i) => (
                        <div key={i} className="w-6 bg-blue-500 rounded-t" style={{ height: `${h / 50}px` }}></div>
                      ))}
                    </div>
                    <p className="text-center text-xs text-slate-500 mt-2">2020-2024</p>
                  </div>

                  {/* Capital Adequacy */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{isRTL ? "نسبة كفاية رأس المال" : "Capital Adequacy"}</span>
                    </div>
                    <div className="h-20 flex items-center justify-center">
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-200 dark:text-slate-700" />
                          <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="none" className="text-emerald-500" strokeDasharray={`${bankingSectorSummary.averageCAR * 2.2} 220`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold">{bankingSectorSummary.averageCAR}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NPL Ratio */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{isRTL ? "القروض غير العاملة" : "Non-Performing Loans"}</span>
                    </div>
                    <div className="h-20 flex items-center justify-center">
                      <div className="w-full">
                        {[2020, 2021, 2022, 2023, 2024].map((year, i) => (
                          <div key={year} className="flex items-center gap-2 mb-1">
                            <span className="text-xs w-10">{year}</span>
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${30 + i * 10}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters Section */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "الفلاتر" : "Filters"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{isRTL ? "الجهة" : "Jurisdiction"}</label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">{isRTL ? "كلاهما" : "Both"}</Button>
                      <Button variant="outline" size="sm" className="flex-1">{isRTL ? "عدن" : "Aden"}</Button>
                      <Button variant="outline" size="sm" className="flex-1">{isRTL ? "صنعاء" : "Sanaa"}</Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{isRTL ? "الفترة الزمنية" : "Time Period"}</label>
                    <Select defaultValue="2020-2024">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2020-2024">2020-2024</SelectItem>
                        <SelectItem value="2015-2024">2015-2024</SelectItem>
                        <SelectItem value="2010-2024">2010-2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{isRTL ? "القطاع" : "Sector"}</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="cursor-pointer">{isRTL ? "مصرفي" : "Banking"}</Badge>
                      <Badge variant="outline" className="cursor-pointer">{isRTL ? "مالية عامة" : "Public Finance"}</Badge>
                      <Badge variant="outline" className="cursor-pointer">{isRTL ? "تجاري" : "Trade"}</Badge>
                      <Badge variant="outline" className="cursor-pointer">{isRTL ? "إنساني" : "Humanitarian"}</Badge>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">{isRTL ? "تطبيق الفلاتر" : "Apply Filters"}</Button>
                    <Button variant="outline">{isRTL ? "إعادة تعيين" : "Reset"}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Alerts */}
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-600" />
                  {isRTL ? "التنبيهات" : "Alerts"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.type === "urgent" 
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800" 
                        : alert.type === "warning"
                        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                        : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant={alert.type === "urgent" ? "destructive" : alert.type === "warning" ? "secondary" : "outline"} className="text-xs">
                        {alert.type === "urgent" ? (isRTL ? "عاجل" : "Urgent") : 
                         alert.type === "warning" ? (isRTL ? "تحذير" : "Warning") : 
                         (isRTL ? "معلومة" : "Info")}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{isRTL ? alert.titleAr : alert.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{isRTL ? alert.timeAr : alert.time}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        {isRTL ? "عرض" : "View"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {isRTL ? "الأحداث الأخيرة" : "Recent Events"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className={`absolute ${isRTL ? 'right-2' : 'left-2'} top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700`}></div>
                  <div className="space-y-4">
                    {recentEvents.map((event, index) => (
                      <div key={event.id} className={`flex gap-3 ${isRTL ? 'pr-6' : 'pl-6'} relative`}>
                        <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center`}>
                          <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                        </div>
                        <div>
                          <p className="text-sm">{isRTL ? event.titleAr : event.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{isRTL ? event.timeAr : event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracked Indicators */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {isRTL ? "المؤشرات المتابعة" : "Tracked Indicators"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trackedIndicators.map((indicator) => (
                  <div key={indicator.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{isRTL ? indicator.nameAr : indicator.name}</span>
                    </div>
                    <span className="font-medium">{indicator.value} <span className="text-xs text-slate-500">{indicator.unit}</span></span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {isRTL ? "الإجراءات السريعة" : "Quick Actions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <Button key={action.id} variant="outline" size="sm" className="gap-2">
                      {action.icon}
                      {isRTL ? action.labelAr : action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant Quick Access */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  {isRTL ? "المساعد الذكي" : "AI Assistant"}
                </CardTitle>
                <CardDescription>{isRTL ? "اسأل عن أي مؤشر اقتصادي" : "Ask about any economic indicator"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input 
                    placeholder={isRTL ? "اكتب سؤالك هنا..." : "Type your question here..."}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    className="bg-white dark:bg-slate-800"
                  />
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">{isRTL ? "أسئلة مقترحة:" : "Suggested questions:"}</p>
                    {suggestedQuestions.slice(0, 2).map((q) => (
                      <Button 
                        key={q.id} 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-xs h-auto py-2 text-slate-600 hover:text-slate-900"
                        onClick={() => setAiQuery(isRTL ? q.textAr : q.text)}
                      >
                        <ChevronRight className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {isRTL ? q.textAr : q.text}
                      </Button>
                    ))}
                  </div>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? "إرسال" : "Send"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
