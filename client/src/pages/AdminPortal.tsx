import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield, 
  Database,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Users,
  Settings,
  BarChart3,
  Search,
  Plus,
  RefreshCw,
  Activity,
  Server,
  Zap,
  Eye,
  Edit,
  Trash2,
  Download,
  XCircle,
  CheckCircle2,
  Info,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import DataQualityBadge from "@/components/DataQualityBadge";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function AdminPortal() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [activeTab, setActiveTab] = useState("overview");
  const { user, loading } = useAuth();

  // Require admin authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4C583E]"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950" dir={isArabic ? "rtl" : "ltr"}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {isArabic ? "الوصول مرفوض" : "Access Denied"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic ? "يتطلب صلاحيات المشرف" : "Admin privileges required"}
          </p>
        </div>
      </div>
    );
  }

  // Ingestion Health Data
  const ingestionSources = [
    {
      id: "cby-aden",
      name: "Central Bank of Yemen - Aden",
      nameAr: "البنك المركزي اليمني - عدن",
      status: "healthy",
      lastSync: "2026-01-10T10:30:00Z",
      recordsToday: 45,
      errorRate: 0.2,
      latency: 1.2
    },
    {
      id: "cby-sanaa",
      name: "Central Bank of Yemen - Sana'a",
      nameAr: "البنك المركزي اليمني - صنعاء",
      status: "warning",
      lastSync: "2026-01-10T08:15:00Z",
      recordsToday: 28,
      errorRate: 2.5,
      latency: 3.8
    },
    {
      id: "wfp-vam",
      name: "WFP Market Monitor",
      nameAr: "مراقب أسواق برنامج الأغذية العالمي",
      status: "healthy",
      lastSync: "2026-01-10T09:45:00Z",
      recordsToday: 156,
      errorRate: 0.1,
      latency: 0.8
    },
    {
      id: "world-bank",
      name: "World Bank Data API",
      nameAr: "واجهة بيانات البنك الدولي",
      status: "healthy",
      lastSync: "2026-01-10T06:00:00Z",
      recordsToday: 12,
      errorRate: 0,
      latency: 2.1
    },
    {
      id: "hdx",
      name: "Humanitarian Data Exchange",
      nameAr: "تبادل البيانات الإنسانية",
      status: "error",
      lastSync: "2026-01-09T22:00:00Z",
      recordsToday: 0,
      errorRate: 100,
      latency: null
    },
    {
      id: "acled",
      name: "ACLED Conflict Data",
      nameAr: "بيانات النزاعات ACLED",
      status: "healthy",
      lastSync: "2026-01-10T07:30:00Z",
      recordsToday: 34,
      errorRate: 0.5,
      latency: 1.5
    }
  ];

  // QA Alerts
  const qaAlerts = [
    {
      id: 1,
      severity: "critical",
      type: "data_contradiction",
      title: "Conflicting FX rates from CBY-Aden and market sources",
      titleAr: "تعارض في أسعار الصرف بين البنك المركزي ومصادر السوق",
      description: "Exchange rate differs by >5% between official CBY-Aden rate and Al-Kuraimi exchange",
      descriptionAr: "يختلف سعر الصرف بأكثر من 5% بين السعر الرسمي للبنك المركزي وصرافة الكريمي",
      indicator: "USD/YER Exchange Rate",
      timestamp: "2026-01-10T09:15:00Z",
      status: "open"
    },
    {
      id: 2,
      severity: "high",
      type: "missing_provenance",
      title: "12 data points missing source attribution",
      titleAr: "12 نقطة بيانات بدون إسناد المصدر",
      description: "Import statistics for December 2025 have incomplete source metadata",
      descriptionAr: "إحصائيات الاستيراد لديسمبر 2025 لديها بيانات وصفية غير مكتملة للمصدر",
      indicator: "Import Volume",
      timestamp: "2026-01-09T14:30:00Z",
      status: "in_progress"
    },
    {
      id: 3,
      severity: "medium",
      type: "stale_data",
      title: "Banking sector deposits data is 45 days old",
      titleAr: "بيانات ودائع القطاع المصرفي عمرها 45 يوماً",
      description: "Last update was on November 26, 2025. Expected monthly updates.",
      descriptionAr: "آخر تحديث كان في 26 نوفمبر 2025. التحديثات المتوقعة شهرية.",
      indicator: "Bank Deposits",
      timestamp: "2026-01-08T10:00:00Z",
      status: "open"
    },
    {
      id: 4,
      severity: "low",
      type: "translation_mismatch",
      title: "Numeric value mismatch in Arabic translation",
      titleAr: "عدم تطابق القيمة الرقمية في الترجمة العربية",
      description: "GDP figure shows 85,000 in English but 85.000 in Arabic (decimal separator issue)",
      descriptionAr: "رقم الناتج المحلي يظهر 85,000 بالإنجليزية لكن 85.000 بالعربية (مشكلة فاصل عشري)",
      indicator: "GDP",
      timestamp: "2026-01-07T16:45:00Z",
      status: "resolved"
    }
  ];

  // Coverage Scorecard Data
  const coverageData = [
    { sector: "Banking & Finance", sectorAr: "المصارف والمالية", coverage: 85, indicators: 24, gaps: 4, trend: "up" },
    { sector: "Trade & Commerce", sectorAr: "التجارة", coverage: 72, indicators: 18, gaps: 5, trend: "stable" },
    { sector: "Currency & FX", sectorAr: "العملة والصرف", coverage: 92, indicators: 12, gaps: 1, trend: "up" },
    { sector: "Prices & Inflation", sectorAr: "الأسعار والتضخم", coverage: 78, indicators: 20, gaps: 4, trend: "down" },
    { sector: "Energy & Fuel", sectorAr: "الطاقة والوقود", coverage: 65, indicators: 15, gaps: 5, trend: "stable" },
    { sector: "Food Security", sectorAr: "الأمن الغذائي", coverage: 88, indicators: 22, gaps: 3, trend: "up" },
    { sector: "Labor Market", sectorAr: "سوق العمل", coverage: 45, indicators: 10, gaps: 6, trend: "down" },
    { sector: "Public Finance", sectorAr: "المالية العامة", coverage: 58, indicators: 16, gaps: 7, trend: "stable" },
    { sector: "Aid & Humanitarian", sectorAr: "المساعدات الإنسانية", coverage: 82, indicators: 19, gaps: 3, trend: "up" },
    { sector: "Infrastructure", sectorAr: "البنية التحتية", coverage: 35, indicators: 8, gaps: 5, trend: "down" },
  ];

  // Pending Submissions
  const pendingSubmissions = [
    {
      id: 1,
      title: "Q4 2025 Banking Liquidity Data",
      titleAr: "بيانات السيولة المصرفية للربع الرابع 2025",
      contributor: "Central Bank Research Team",
      contributorAr: "فريق أبحاث البنك المركزي",
      submitted: "2026-01-08",
      dataPoints: 45,
      status: "pending_review"
    },
    {
      id: 2,
      title: "Port Operations December 2025",
      titleAr: "عمليات الميناء ديسمبر 2025",
      contributor: "Aden Port Authority",
      contributorAr: "هيئة ميناء عدن",
      submitted: "2026-01-07",
      dataPoints: 28,
      status: "pending_review"
    },
    {
      id: 3,
      title: "Humanitarian Aid Distribution Q4",
      titleAr: "توزيع المساعدات الإنسانية للربع الرابع",
      contributor: "UN OCHA Yemen",
      contributorAr: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية",
      submitted: "2026-01-06",
      dataPoints: 67,
      status: "under_review"
    },
  ];

  // Quick Actions
  const quickActions = [
    { icon: Upload, labelEn: "Upload Dataset", labelAr: "رفع مجموعة بيانات", color: "bg-blue-500" },
    { icon: RefreshCw, labelEn: "Force Sync All", labelAr: "مزامنة إجبارية", color: "bg-green-500" },
    { icon: FileText, labelEn: "Generate Report", labelAr: "إنشاء تقرير", color: "bg-purple-500" },
    { icon: Users, labelEn: "Manage Users", labelAr: "إدارة المستخدمين", color: "bg-orange-500" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{isArabic ? "سليم" : "Healthy"}</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500 text-black"><AlertTriangle className="h-3 w-3 mr-1" />{isArabic ? "تحذير" : "Warning"}</Badge>;
      case "error":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />{isArabic ? "خطأ" : "Error"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-600">{isArabic ? "حرج" : "Critical"}</Badge>;
      case "high":
        return <Badge className="bg-orange-500">{isArabic ? "عالي" : "High"}</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 text-black">{isArabic ? "متوسط" : "Medium"}</Badge>;
      case "low":
        return <Badge className="bg-blue-500">{isArabic ? "منخفض" : "Low"}</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return "bg-green-500";
    if (coverage >= 60) return "bg-yellow-500";
    if (coverage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir={isArabic ? "rtl" : "ltr"}>


      {/* Header */}
      <div className="bg-[#768064] text-white py-6">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8" />
                <h1 className="text-2xl font-bold">
                  {isArabic ? "لوحة تحكم المشرف" : "Admin Operations Console"}
                </h1>
              </div>
              <p className="text-white/70">
                {isArabic 
                  ? "إدارة البيانات والجودة والاستيعاب"
                  : "Data management, quality control, and ingestion monitoring"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {quickActions.map((action, index) => (
                <Button key={index} variant="secondary" size="sm" className="gap-2">
                  <action.icon className="h-4 w-4" />
                  {isArabic ? action.labelAr : action.labelEn}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              {isArabic ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="ingestion" className="gap-2">
              <Server className="h-4 w-4" />
              {isArabic ? "الاستيعاب" : "Ingestion"}
            </TabsTrigger>
            <TabsTrigger value="qa" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              {isArabic ? "الجودة" : "QA Alerts"}
            </TabsTrigger>
            <TabsTrigger value="coverage" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {isArabic ? "التغطية" : "Coverage"}
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <FileText className="h-4 w-4" />
              {isArabic ? "المقدمات" : "Submissions"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* System Health */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">
                    {isArabic ? "صحة النظام" : "System Health"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {isArabic ? "جيد" : "Good"}
                      </div>
                      <div className="text-xs text-gray-500">
                        5/6 {isArabic ? "مصادر نشطة" : "sources active"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* QA Alerts */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">
                    {isArabic ? "تنبيهات الجودة" : "QA Alerts"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    <div>
                      <div className="text-2xl font-bold">
                        {qaAlerts.filter(a => a.status !== "resolved").length}
                      </div>
                      <div className="text-xs text-gray-500">
                        {qaAlerts.filter(a => a.severity === "critical").length} {isArabic ? "حرج" : "critical"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coverage Score */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">
                    {isArabic ? "نسبة التغطية" : "Coverage Score"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">
                        {Math.round(coverageData.reduce((sum, d) => sum + d.coverage, 0) / coverageData.length)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {coverageData.reduce((sum, d) => sum + d.gaps, 0)} {isArabic ? "فجوات" : "gaps"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Reviews */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">
                    {isArabic ? "في انتظار المراجعة" : "Pending Reviews"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="h-8 w-8 text-purple-500" />
                    <div>
                      <div className="text-2xl font-bold">{pendingSubmissions.length}</div>
                      <div className="text-xs text-gray-500">
                        {pendingSubmissions.reduce((sum, s) => sum + s.dataPoints, 0)} {isArabic ? "نقطة بيانات" : "data points"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ingestion Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "ملخص الاستيعاب اليوم" : "Today's Ingestion Summary"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ingestionSources.slice(0, 4).map((source) => (
                      <div key={source.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(source.status)}
                          <span className="text-sm">
                            {isArabic ? source.nameAr : source.name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          +{source.recordsToday} {isArabic ? "سجل" : "records"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Critical Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    {isArabic ? "تنبيهات حرجة" : "Critical Alerts"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {qaAlerts.filter(a => a.severity === "critical" || a.severity === "high").slice(0, 3).map((alert) => (
                      <div key={alert.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {getSeverityBadge(alert.severity)}
                              <span className="text-sm font-medium">
                                {isArabic ? alert.titleAr : alert.title}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {isArabic ? alert.descriptionAr : alert.description}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            {isArabic ? "معالجة" : "Resolve"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ingestion Tab */}
          <TabsContent value="ingestion">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{isArabic ? "صحة مصادر البيانات" : "Data Source Health"}</CardTitle>
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    {isArabic ? "تحديث الكل" : "Refresh All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ingestionSources.map((source) => (
                    <div key={source.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(source.status)}
                          <div>
                            <div className="font-medium">
                              {isArabic ? source.nameAr : source.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {isArabic ? "آخر مزامنة:" : "Last sync:"} {new Date(source.lastSync).toLocaleString(isArabic ? 'ar-YE' : 'en-US')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold">{source.recordsToday}</div>
                            <div className="text-xs text-gray-500">{isArabic ? "سجلات اليوم" : "Today"}</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${source.errorRate > 5 ? 'text-red-500' : source.errorRate > 1 ? 'text-yellow-500' : 'text-green-500'}`}>
                              {source.errorRate}%
                            </div>
                            <div className="text-xs text-gray-500">{isArabic ? "نسبة الخطأ" : "Error Rate"}</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${source.latency === null ? 'text-gray-400' : source.latency > 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                              {source.latency !== null ? `${source.latency}s` : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">{isArabic ? "التأخير" : "Latency"}</div>
                          </div>
                          <Button size="sm" variant="outline">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {source.status === "error" && (
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                          {isArabic 
                            ? "فشل الاتصال - يرجى التحقق من بيانات الاعتماد والشبكة"
                            : "Connection failed - please check credentials and network"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QA Alerts Tab */}
          <TabsContent value="qa">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{isArabic ? "تنبيهات ضمان الجودة" : "Quality Assurance Alerts"}</CardTitle>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={isArabic ? "الحالة" : "Status"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{isArabic ? "الكل" : "All"}</SelectItem>
                        <SelectItem value="open">{isArabic ? "مفتوح" : "Open"}</SelectItem>
                        <SelectItem value="in_progress">{isArabic ? "قيد التنفيذ" : "In Progress"}</SelectItem>
                        <SelectItem value="resolved">{isArabic ? "تم الحل" : "Resolved"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {qaAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${
                      alert.status === "resolved" ? "bg-gray-50 dark:bg-gray-800 opacity-60" : ""
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getSeverityBadge(alert.severity)}
                            <Badge variant="outline">{alert.type.replace("_", " ")}</Badge>
                            {alert.status === "resolved" && (
                              <Badge className="bg-green-500">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {isArabic ? "تم الحل" : "Resolved"}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium mb-1">
                            {isArabic ? alert.titleAr : alert.title}
                          </h4>
                          <p className="text-sm text-gray-500 mb-2">
                            {isArabic ? alert.descriptionAr : alert.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{isArabic ? "المؤشر:" : "Indicator:"} {alert.indicator}</span>
                            <span>{new Date(alert.timestamp).toLocaleString(isArabic ? 'ar-YE' : 'en-US')}</span>
                          </div>
                        </div>
                        {alert.status !== "resolved" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              {isArabic ? "عرض" : "View"}
                            </Button>
                            <Button size="sm">
                              {isArabic ? "معالجة" : "Resolve"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coverage Tab */}
          <TabsContent value="coverage">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "بطاقة أداء التغطية" : "Coverage Scorecard"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? "نظرة عامة على تغطية البيانات حسب القطاع"
                    : "Data coverage overview by sector"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Coverage Heatmap */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  {coverageData.map((sector, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg text-white ${getCoverageColor(sector.coverage)}`}
                    >
                      <div className="text-2xl font-bold mb-1">{sector.coverage}%</div>
                      <div className="text-sm opacity-90">
                        {isArabic ? sector.sectorAr : sector.sector}
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {sector.gaps} {isArabic ? "فجوات" : "gaps"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-start text-sm font-medium">
                          {isArabic ? "القطاع" : "Sector"}
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          {isArabic ? "التغطية" : "Coverage"}
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          {isArabic ? "المؤشرات" : "Indicators"}
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          {isArabic ? "الفجوات" : "Gaps"}
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          {isArabic ? "الاتجاه" : "Trend"}
                        </th>
                        <th className="px-4 py-3 text-end text-sm font-medium">
                          {isArabic ? "الإجراءات" : "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {coverageData.map((sector, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">
                            <span className="font-medium">
                              {isArabic ? sector.sectorAr : sector.sector}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 justify-center">
                              <Progress value={sector.coverage} className="w-20 h-2" />
                              <span className="text-sm font-medium">{sector.coverage}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{sector.indicators}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={sector.gaps > 5 ? "destructive" : "outline"}>
                              {sector.gaps}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {sector.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />}
                            {sector.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />}
                            {sector.trend === "stable" && <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 text-end">
                            <Button size="sm" variant="outline">
                              {isArabic ? "عرض الفجوات" : "View Gaps"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{isArabic ? "المقدمات المعلقة" : "Pending Submissions"}</CardTitle>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {isArabic ? "إضافة يدوي" : "Manual Upload"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingSubmissions.map((submission) => (
                    <div key={submission.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">
                              {isArabic ? submission.titleAr : submission.title}
                            </h4>
                            <Badge variant={submission.status === "under_review" ? "default" : "outline"}>
                              {submission.status === "under_review" 
                                ? (isArabic ? "قيد المراجعة" : "Under Review")
                                : (isArabic ? "في الانتظار" : "Pending")}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            {isArabic ? submission.contributorAr : submission.contributor}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{isArabic ? "تاريخ التقديم:" : "Submitted:"} {submission.submitted}</span>
                            <span>{submission.dataPoints} {isArabic ? "نقطة بيانات" : "data points"}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            {isArabic ? "معاينة" : "Preview"}
                          </Button>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {isArabic ? "موافقة" : "Approve"}
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            {isArabic ? "رفض" : "Reject"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
