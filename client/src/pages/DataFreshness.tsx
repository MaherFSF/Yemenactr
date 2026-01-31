/**
 * Data Freshness Dashboard
 * 
 * Visual indicator showing last update time and next refresh schedule
 * for each data source in the YETO platform.
 */

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Database,
  Globe,
  Calendar,
  Activity,
  TrendingUp,
  Shield,
  FileText,
  Users,
  Heart,
  Utensils,
  Building2,
  DollarSign,
  Landmark,
  AlertCircle,
} from "lucide-react";

// Data source definitions
const DATA_SOURCES = [
  {
    id: "world_bank",
    nameEn: "World Bank",
    nameAr: "البنك الدولي",
    icon: Globe,
    color: "bg-blue-500",
    refreshSchedule: "Weekly",
    refreshScheduleAr: "أسبوعياً",
    indicators: 15,
    category: "economic",
  },
  {
    id: "imf",
    nameEn: "IMF",
    nameAr: "صندوق النقد الدولي",
    icon: Landmark,
    color: "bg-indigo-500",
    refreshSchedule: "Monthly",
    refreshScheduleAr: "شهرياً",
    indicators: 8,
    category: "economic",
  },
  {
    id: "ocha",
    nameEn: "OCHA FTS",
    nameAr: "مكتب تنسيق الشؤون الإنسانية",
    icon: Heart,
    color: "bg-red-500",
    refreshSchedule: "Daily",
    refreshScheduleAr: "يومياً",
    indicators: 12,
    category: "humanitarian",
  },
  {
    id: "fao",
    nameEn: "FAO",
    nameAr: "منظمة الأغذية والزراعة",
    icon: Utensils,
    color: "bg-green-500",
    refreshSchedule: "Weekly",
    refreshScheduleAr: "أسبوعياً",
    indicators: 10,
    category: "food",
  },
  {
    id: "iom",
    nameEn: "IOM DTM",
    nameAr: "المنظمة الدولية للهجرة",
    icon: Users,
    color: "bg-orange-500",
    refreshSchedule: "Weekly",
    refreshScheduleAr: "أسبوعياً",
    indicators: 8,
    category: "humanitarian",
  },
  {
    id: "reliefweb",
    nameEn: "ReliefWeb",
    nameAr: "ريليف ويب",
    icon: FileText,
    color: "bg-purple-500",
    refreshSchedule: "Daily",
    refreshScheduleAr: "يومياً",
    indicators: 5,
    category: "reports",
  },
  {
    id: "who",
    nameEn: "WHO GHO",
    nameAr: "منظمة الصحة العالمية",
    icon: Heart,
    color: "bg-cyan-500",
    refreshSchedule: "Monthly",
    refreshScheduleAr: "شهرياً",
    indicators: 18,
    category: "health",
  },
  {
    id: "unhcr",
    nameEn: "UNHCR",
    nameAr: "المفوضية السامية للاجئين",
    icon: Users,
    color: "bg-sky-500",
    refreshSchedule: "Weekly",
    refreshScheduleAr: "أسبوعياً",
    indicators: 5,
    category: "humanitarian",
  },
  {
    id: "unicef",
    nameEn: "UNICEF",
    nameAr: "اليونيسف",
    icon: Users,
    color: "bg-teal-500",
    refreshSchedule: "Monthly",
    refreshScheduleAr: "شهرياً",
    indicators: 17,
    category: "humanitarian",
  },
  {
    id: "wfp",
    nameEn: "WFP VAM",
    nameAr: "برنامج الغذاء العالمي",
    icon: Utensils,
    color: "bg-amber-500",
    refreshSchedule: "Weekly",
    refreshScheduleAr: "أسبوعياً",
    indicators: 15,
    category: "food",
  },
  {
    id: "undp",
    nameEn: "UNDP HDR",
    nameAr: "برنامج الأمم المتحدة الإنمائي",
    icon: TrendingUp,
    color: "bg-emerald-500",
    refreshSchedule: "Annually",
    refreshScheduleAr: "سنوياً",
    indicators: 16,
    category: "development",
  },
  {
    id: "iati",
    nameEn: "IATI",
    nameAr: "مبادرة الشفافية في المعونات",
    icon: DollarSign,
    color: "bg-lime-500",
    refreshSchedule: "Weekly",
    refreshScheduleAr: "أسبوعياً",
    indicators: 12,
    category: "aid",
  },
  {
    id: "cby_aden",
    nameEn: "CBY Aden",
    nameAr: "البنك المركزي - عدن",
    icon: Building2,
    color: "bg-[#2e8b6e]",
    refreshSchedule: "Weekly",
    refreshScheduleAr: "أسبوعياً",
    indicators: 12,
    category: "banking",
  },
  {
    id: "cby_sanaa",
    nameEn: "CBY Sana'a",
    nameAr: "البنك المركزي - صنعاء",
    icon: Building2,
    color: "bg-[#2e8b6e]",
    refreshSchedule: "Weekly",
    refreshScheduleAr: "أسبوعياً",
    indicators: 4,
    category: "banking",
  },
  {
    id: "hdx_hapi",
    nameEn: "HDX HAPI",
    nameAr: "منصة البيانات الإنسانية",
    icon: Database,
    color: "bg-rose-500",
    refreshSchedule: "Daily",
    refreshScheduleAr: "يومياً",
    indicators: 0,
    category: "humanitarian",
    requiresKey: true,
  },
  {
    id: "acled",
    nameEn: "ACLED",
    nameAr: "بيانات النزاعات المسلحة",
    icon: AlertCircle,
    color: "bg-red-600",
    refreshSchedule: "Weekly",
    refreshScheduleAr: "أسبوعياً",
    indicators: 0,
    category: "conflict",
    requiresKey: true,
  },
];

// Simulated freshness data (in production, this would come from the database)
function generateFreshnessData() {
  const now = new Date();
  return DATA_SOURCES.map((source) => {
    const hoursAgo = source.requiresKey 
      ? null 
      : Math.floor(Math.random() * 168); // 0-7 days in hours
    
    const lastUpdate = hoursAgo !== null 
      ? new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
      : null;
    
    let status: "fresh" | "stale" | "warning" | "inactive" = "inactive";
    if (lastUpdate) {
      if (hoursAgo! < 24) status = "fresh";
      else if (hoursAgo! < 72) status = "warning";
      else status = "stale";
    }
    
    // Calculate next refresh based on schedule
    let nextRefresh: Date | null = null;
    if (lastUpdate) {
      const scheduleHours: Record<string, number> = {
        Daily: 24,
        Weekly: 168,
        Monthly: 720,
        Annually: 8760,
      };
      const hours = scheduleHours[source.refreshSchedule] || 168;
      nextRefresh = new Date(lastUpdate.getTime() + hours * 60 * 60 * 1000);
    }
    
    return {
      ...source,
      lastUpdate,
      nextRefresh,
      status,
      recordCount: source.requiresKey ? 0 : Math.floor(Math.random() * 500) + 50,
    };
  });
}

export default function DataFreshness() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [freshnessData, setFreshnessData] = useState(generateFreshnessData());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFreshnessData(generateFreshnessData());
    setIsRefreshing(false);
  };

  // Filter by category
  const filteredSources = selectedCategory === "all"
    ? freshnessData
    : freshnessData.filter((s) => s.category === selectedCategory);

  // Calculate overall stats
  const totalSources = freshnessData.length;
  const activeSources = freshnessData.filter((s) => s.status !== "inactive").length;
  const freshSources = freshnessData.filter((s) => s.status === "fresh").length;
  const staleSources = freshnessData.filter((s) => s.status === "stale").length;
  const totalRecords = freshnessData.reduce((sum, s) => sum + s.recordCount, 0);

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      fresh: { 
        icon: CheckCircle, 
        labelEn: "Fresh", 
        labelAr: "محدث", 
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
      },
      warning: { 
        icon: AlertTriangle, 
        labelEn: "Warning", 
        labelAr: "تحذير", 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" 
      },
      stale: { 
        icon: XCircle, 
        labelEn: "Stale", 
        labelAr: "قديم", 
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
      },
      inactive: { 
        icon: Clock, 
        labelEn: "Inactive", 
        labelAr: "غير نشط", 
        className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" 
      },
    };
    
    const { icon: Icon, labelEn, labelAr, className } = config[status as keyof typeof config] || config.inactive;
    
    return (
      <Badge className={`${className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {isRTL ? labelAr : labelEn}
      </Badge>
    );
  };

  // Format relative time
  const formatRelativeTime = (date: Date | null) => {
    if (!date) return isRTL ? "غير متاح" : "N/A";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return isRTL ? "منذ أقل من ساعة" : "Less than an hour ago";
    if (diffHours < 24) return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`;
    if (diffDays === 1) return isRTL ? "منذ يوم واحد" : "1 day ago";
    return isRTL ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
  };

  // Format next refresh
  const formatNextRefresh = (date: Date | null) => {
    if (!date) return isRTL ? "غير مجدول" : "Not scheduled";
    
    const now = new Date();
    if (date < now) return isRTL ? "مستحق الآن" : "Due now";
    
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return isRTL ? "خلال أقل من ساعة" : "In less than an hour";
    if (diffHours < 24) return isRTL ? `خلال ${diffHours} ساعة` : `In ${diffHours} hours`;
    if (diffDays === 1) return isRTL ? "غداً" : "Tomorrow";
    return isRTL ? `خلال ${diffDays} أيام` : `In ${diffDays} days`;
  };

  const categories = [
    { id: "all", labelEn: "All Sources", labelAr: "جميع المصادر" },
    { id: "economic", labelEn: "Economic", labelAr: "اقتصادي" },
    { id: "humanitarian", labelEn: "Humanitarian", labelAr: "إنساني" },
    { id: "health", labelEn: "Health", labelAr: "صحة" },
    { id: "food", labelEn: "Food Security", labelAr: "أمن غذائي" },
    { id: "banking", labelEn: "Banking", labelAr: "مصرفي" },
    { id: "development", labelEn: "Development", labelAr: "تنمية" },
    { id: "aid", labelEn: "Aid", labelAr: "معونات" },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-[#2e8b6e] text-white py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isRTL ? "لوحة حداثة البيانات" : "Data Freshness Dashboard"}
              </h1>
              <p className="text-gray-300">
                {isRTL 
                  ? "مراقبة حالة تحديث البيانات من جميع المصادر"
                  : "Monitor data update status from all sources"}
              </p>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="bg-[#2e8b6e] hover:bg-[#0d5a34]"
            >
              <RefreshCw className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} ${isRefreshing ? "animate-spin" : ""}`} />
              {isRTL ? "تحديث" : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="w-8 h-8 mx-auto mb-2 text-[#2e8b6e]" />
              <div className="text-2xl font-bold text-[#2e8b6e]">{totalSources}</div>
              <div className="text-sm text-gray-500">
                {isRTL ? "إجمالي المصادر" : "Total Sources"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-[#2e8b6e]" />
              <div className="text-2xl font-bold text-[#2e8b6e]">{activeSources}</div>
              <div className="text-sm text-gray-500">
                {isRTL ? "مصادر نشطة" : "Active Sources"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">{freshSources}</div>
              <div className="text-sm text-gray-500">
                {isRTL ? "محدثة" : "Fresh"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold text-red-600">{staleSources}</div>
              <div className="text-sm text-gray-500">
                {isRTL ? "قديمة" : "Stale"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-[#C0A030]" />
              <div className="text-2xl font-bold text-[#C0A030]">{totalRecords.toLocaleString()}</div>
              <div className="text-sm text-gray-500">
                {isRTL ? "إجمالي السجلات" : "Total Records"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id ? "bg-[#2e8b6e]" : ""}
              >
                {isRTL ? cat.labelAr : cat.labelEn}
              </Button>
            ))}
          </div>
        </div>

        {/* Data Sources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((source) => (
            <Card key={source.id} className="overflow-hidden">
              <div className={`h-2 ${source.color}`} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${source.color} flex items-center justify-center`}>
                      <source.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {isRTL ? source.nameAr : source.nameEn}
                      </CardTitle>
                      <p className="text-xs text-gray-500">
                        {source.indicators} {isRTL ? "مؤشر" : "indicators"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={source.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Last Update */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {isRTL ? "آخر تحديث" : "Last Update"}
                    </span>
                    <span className="font-medium">
                      {formatRelativeTime(source.lastUpdate)}
                    </span>
                  </div>
                  
                  {/* Next Refresh */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {isRTL ? "التحديث القادم" : "Next Refresh"}
                    </span>
                    <span className="font-medium">
                      {formatNextRefresh(source.nextRefresh)}
                    </span>
                  </div>
                  
                  {/* Schedule */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <RefreshCw className="w-4 h-4" />
                      {isRTL ? "الجدول" : "Schedule"}
                    </span>
                    <span className="font-medium">
                      {isRTL ? source.refreshScheduleAr : source.refreshSchedule}
                    </span>
                  </div>
                  
                  {/* Records */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Database className="w-4 h-4" />
                      {isRTL ? "السجلات" : "Records"}
                    </span>
                    <span className="font-medium">
                      {source.recordCount.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Requires API Key Warning */}
                  {source.requiresKey && (
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {isRTL ? "يتطلب مفتاح API" : "Requires API key"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Freshness Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>
              {isRTL ? "دليل حالة البيانات" : "Data Status Legend"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <div className="font-medium">{isRTL ? "محدث" : "Fresh"}</div>
                  <div className="text-xs text-gray-500">
                    {isRTL ? "تم التحديث خلال 24 ساعة" : "Updated within 24 hours"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div>
                  <div className="font-medium">{isRTL ? "تحذير" : "Warning"}</div>
                  <div className="text-xs text-gray-500">
                    {isRTL ? "تم التحديث خلال 72 ساعة" : "Updated within 72 hours"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div>
                  <div className="font-medium">{isRTL ? "قديم" : "Stale"}</div>
                  <div className="text-xs text-gray-500">
                    {isRTL ? "لم يتم التحديث منذ أكثر من 72 ساعة" : "Not updated in over 72 hours"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <div>
                  <div className="font-medium">{isRTL ? "غير نشط" : "Inactive"}</div>
                  <div className="text-xs text-gray-500">
                    {isRTL ? "يتطلب تكوين إضافي" : "Requires additional configuration"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
