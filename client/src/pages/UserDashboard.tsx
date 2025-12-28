import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Star, 
  Search, 
  FileText, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Bell,
  Settings,
  Download,
  Trash2,
  Eye,
  Plus,
  BarChart3,
  Globe,
  Bookmark,
  History
} from "lucide-react";

export default function UserDashboard() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isArabic = language === "ar";
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data for demonstration
  const watchlistIndicators = [
    {
      id: "1",
      name: isArabic ? "سعر صرف الريال (عدن)" : "YER Exchange Rate (Aden)",
      value: "1,720",
      unit: "YER/USD",
      change: -2.3,
      lastUpdated: "2024-12-28",
      sector: isArabic ? "العملة" : "Currency"
    },
    {
      id: "2",
      name: isArabic ? "سعر صرف الريال (صنعاء)" : "YER Exchange Rate (Sana'a)",
      value: "535",
      unit: "YER/USD",
      change: 0.5,
      lastUpdated: "2024-12-28",
      sector: isArabic ? "العملة" : "Currency"
    },
    {
      id: "3",
      name: isArabic ? "معدل التضخم" : "Inflation Rate",
      value: "35.2",
      unit: "%",
      change: 1.8,
      lastUpdated: "2024-12-15",
      sector: isArabic ? "الأسعار" : "Prices"
    },
    {
      id: "4",
      name: isArabic ? "احتياطي النقد الأجنبي" : "Foreign Reserves",
      value: "1.2",
      unit: "B USD",
      change: -5.2,
      lastUpdated: "2024-12-01",
      sector: isArabic ? "المصرفية" : "Banking"
    }
  ];

  const savedSearches = [
    {
      id: "1",
      name: isArabic ? "مقارنة أسعار الصرف" : "Exchange Rate Comparison",
      query: "exchange rate aden sanaa comparison",
      filters: { sector: "currency", regime: "all" },
      createdAt: "2024-12-20",
      lastRun: "2024-12-28"
    },
    {
      id: "2",
      name: isArabic ? "بيانات التضخم 2024" : "Inflation Data 2024",
      query: "inflation consumer prices 2024",
      filters: { sector: "prices", year: "2024" },
      createdAt: "2024-12-15",
      lastRun: "2024-12-27"
    },
    {
      id: "3",
      name: isArabic ? "تدفقات المساعدات الإنسانية" : "Humanitarian Aid Flows",
      query: "humanitarian aid UN agencies",
      filters: { sector: "aid", confidence: "A,B" },
      createdAt: "2024-12-10",
      lastRun: "2024-12-25"
    }
  ];

  const recentReports = [
    {
      id: "1",
      title: isArabic ? "تقرير سوق العملات الأسبوعي" : "Weekly Currency Market Report",
      type: isArabic ? "تقرير مخصص" : "Custom Report",
      createdAt: "2024-12-27",
      format: "PDF",
      size: "2.4 MB"
    },
    {
      id: "2",
      title: isArabic ? "تحليل القطاع المصرفي" : "Banking Sector Analysis",
      type: isArabic ? "تقرير مخصص" : "Custom Report",
      createdAt: "2024-12-25",
      format: "XLSX",
      size: "1.8 MB"
    },
    {
      id: "3",
      title: isArabic ? "مؤشرات الأمن الغذائي" : "Food Security Indicators",
      type: isArabic ? "تصدير بيانات" : "Data Export",
      createdAt: "2024-12-22",
      format: "CSV",
      size: "0.5 MB"
    }
  ];

  const recentActivity = [
    {
      id: "1",
      action: isArabic ? "عرض لوحة البيانات" : "Viewed Dashboard",
      timestamp: "2024-12-28 14:30",
      details: isArabic ? "لوحة بيانات العملة" : "Currency Dashboard"
    },
    {
      id: "2",
      action: isArabic ? "تصدير بيانات" : "Exported Data",
      timestamp: "2024-12-28 12:15",
      details: isArabic ? "أسعار الصرف - CSV" : "Exchange Rates - CSV"
    },
    {
      id: "3",
      action: isArabic ? "حفظ بحث" : "Saved Search",
      timestamp: "2024-12-27 16:45",
      details: isArabic ? "مقارنة أسعار الصرف" : "Exchange Rate Comparison"
    },
    {
      id: "4",
      action: isArabic ? "إنشاء تقرير" : "Created Report",
      timestamp: "2024-12-27 10:20",
      details: isArabic ? "تقرير سوق العملات الأسبوعي" : "Weekly Currency Market Report"
    }
  ];

  const alerts = [
    {
      id: "1",
      type: "warning",
      title: isArabic ? "تنبيه سعر الصرف" : "Exchange Rate Alert",
      message: isArabic 
        ? "انخفض سعر صرف الريال في عدن بنسبة 2.3% خلال 24 ساعة" 
        : "YER exchange rate in Aden dropped 2.3% in 24 hours",
      timestamp: "2024-12-28 08:00"
    },
    {
      id: "2",
      type: "info",
      title: isArabic ? "بيانات جديدة متاحة" : "New Data Available",
      message: isArabic 
        ? "تم تحديث بيانات التضخم لشهر نوفمبر 2024" 
        : "November 2024 inflation data has been updated",
      timestamp: "2024-12-27 15:30"
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isArabic ? "rtl" : "ltr"}>
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle>{isArabic ? "تسجيل الدخول مطلوب" : "Login Required"}</CardTitle>
            <CardDescription>
              {isArabic 
                ? "يرجى تسجيل الدخول للوصول إلى لوحة التحكم الشخصية" 
                : "Please log in to access your personal dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/">
                {isArabic ? "العودة للرئيسية" : "Back to Home"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#103050] to-[#1a4a70] text-white py-8">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isArabic ? `مرحباً، ${user.name}` : `Welcome, ${user.name}`}
              </h1>
              <p className="text-white/80">
                {isArabic 
                  ? "لوحة التحكم الشخصية - إدارة المؤشرات والبحوث المحفوظة" 
                  : "Personal Dashboard - Manage your watchlist and saved searches"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Bell className="h-4 w-4 mr-2" />
                {isArabic ? "التنبيهات" : "Alerts"}
                <Badge className="ml-2 bg-red-500">{alerts.length}</Badge>
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Settings className="h-4 w-4 mr-2" />
                {isArabic ? "الإعدادات" : "Settings"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {isArabic ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              {isArabic ? "قائمة المتابعة" : "Watchlist"}
            </TabsTrigger>
            <TabsTrigger value="searches" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              {isArabic ? "البحوث المحفوظة" : "Saved Searches"}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {isArabic ? "التقارير" : "Reports"}
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {isArabic ? "النشاط" : "Activity"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={`border-l-4 ${alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-blue-500 bg-blue-50'}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{alert.timestamp}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{isArabic ? "المؤشرات المتابعة" : "Watched Indicators"}</p>
                      <p className="text-2xl font-bold">{watchlistIndicators.length}</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{isArabic ? "البحوث المحفوظة" : "Saved Searches"}</p>
                      <p className="text-2xl font-bold">{savedSearches.length}</p>
                    </div>
                    <Search className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{isArabic ? "التقارير المنشأة" : "Reports Created"}</p>
                      <p className="text-2xl font-bold">{recentReports.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{isArabic ? "التنبيهات النشطة" : "Active Alerts"}</p>
                      <p className="text-2xl font-bold">{alerts.length}</p>
                    </div>
                    <Bell className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Watchlist Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "قائمة المتابعة" : "Watchlist"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "المؤشرات التي تتابعها" : "Indicators you're tracking"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("watchlist")}>
                  {isArabic ? "عرض الكل" : "View All"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {watchlistIndicators.slice(0, 4).map((indicator) => (
                    <div key={indicator.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{indicator.name}</p>
                        <p className="text-sm text-gray-500">{indicator.sector}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{indicator.value} <span className="text-sm font-normal text-gray-500">{indicator.unit}</span></p>
                        <div className={`flex items-center justify-end text-sm ${indicator.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {indicator.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          {indicator.change >= 0 ? '+' : ''}{indicator.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "قائمة المتابعة" : "Indicator Watchlist"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "تتبع المؤشرات الاقتصادية المهمة لك" : "Track economic indicators important to you"}
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إضافة مؤشر" : "Add Indicator"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {watchlistIndicators.map((indicator) => (
                    <div key={indicator.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-yellow-500">
                          <Star className="h-5 w-5 fill-current" />
                        </Button>
                        <div>
                          <p className="font-medium">{indicator.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline">{indicator.sector}</Badge>
                            <span>•</span>
                            <span>{isArabic ? "آخر تحديث:" : "Updated:"} {indicator.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">{indicator.value} <span className="text-sm font-normal text-gray-500">{indicator.unit}</span></p>
                          <div className={`flex items-center justify-end text-sm ${indicator.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {indicator.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                            {indicator.change >= 0 ? '+' : ''}{indicator.change}%
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Bell className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Searches Tab */}
          <TabsContent value="searches" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "البحوث المحفوظة" : "Saved Searches"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "الوصول السريع لعمليات البحث المتكررة" : "Quick access to your frequent searches"}
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/data-repository">
                    <Search className="h-4 w-4 mr-2" />
                    {isArabic ? "بحث جديد" : "New Search"}
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedSearches.map((search) => (
                    <div key={search.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Search className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{search.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{isArabic ? "الاستعلام:" : "Query:"} "{search.query}"</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {Object.entries(search.filters).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm text-gray-500">
                          <p>{isArabic ? "آخر تشغيل:" : "Last run:"} {search.lastRun}</p>
                          <p>{isArabic ? "تم الإنشاء:" : "Created:"} {search.createdAt}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="default" size="sm">
                            <Search className="h-4 w-4 mr-1" />
                            {isArabic ? "تشغيل" : "Run"}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "التقارير المنشأة" : "Your Reports"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "التقارير والتصديرات التي أنشأتها" : "Reports and exports you've created"}
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/report-builder">
                    <Plus className="h-4 w-4 mr-2" />
                    {isArabic ? "تقرير جديد" : "New Report"}
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline">{report.type}</Badge>
                            <span>•</span>
                            <span>{report.format}</span>
                            <span>•</span>
                            <span>{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm text-gray-500">
                          <p>{isArabic ? "تم الإنشاء:" : "Created:"} {report.createdAt}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            {isArabic ? "تحميل" : "Download"}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "النشاط الأخير" : "Recent Activity"}</CardTitle>
                <CardDescription>
                  {isArabic ? "سجل نشاطك على المنصة" : "Your activity log on the platform"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <Clock className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.timestamp}</p>
                        </div>
                        <p className="text-sm text-gray-600">{activity.details}</p>
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
