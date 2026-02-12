/**
 * Data Freshness Dashboard
 *
 * Visual indicator showing last update time and next refresh schedule
 * for each data source in the YETO platform.
 *
 * Sources loaded from canonical source_registry table via tRPC.
 */

import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Loader2,
} from "lucide-react";

// UI icon mapping for known source IDs (presentation layer only)
const SOURCE_ICON_MAP: Record<string, typeof Globe> = {
  world_bank: Globe,
  imf: Landmark,
  ocha: Heart,
  fao: Utensils,
  iom: Users,
  reliefweb: FileText,
  who: Heart,
  unhcr: Users,
  unicef: Users,
  wfp: Utensils,
  undp: TrendingUp,
  iati: DollarSign,
  cby: Building2,
  hdx: Database,
  acled: AlertCircle,
};

// Tier → UI color
const TIER_COLOR_MAP: Record<string, string> = {
  T0: "bg-[#2e8b6e]",
  T1: "bg-blue-500",
  T2: "bg-amber-500",
  T3: "bg-orange-500",
  T4: "bg-red-600",
};

// Update frequency → display labels and cadence hours
const FREQUENCY_LABELS: Record<
  string,
  { en: string; ar: string; hours: number }
> = {
  DAILY: { en: "Daily", ar: "يومياً", hours: 24 },
  WEEKLY: { en: "Weekly", ar: "أسبوعياً", hours: 168 },
  MONTHLY: { en: "Monthly", ar: "شهرياً", hours: 720 },
  QUARTERLY: { en: "Quarterly", ar: "ربع سنوي", hours: 2160 },
  ANNUAL: { en: "Annually", ar: "سنوياً", hours: 8760 },
  ANNUALLY: { en: "Annually", ar: "سنوياً", hours: 8760 },
  IRREGULAR: { en: "Irregular", ar: "غير منتظم", hours: 720 },
};

function getSourceIcon(sourceId: string): typeof Globe {
  const lower = sourceId.toLowerCase();
  for (const [key, icon] of Object.entries(SOURCE_ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return Globe;
}

function getSourceColor(tier: string | null): string {
  return TIER_COLOR_MAP[tier || ""] || "bg-gray-500";
}

function mapSectorToCategory(sectorCategory: string | null): string {
  if (!sectorCategory) return "other";
  const lower = sectorCategory.toLowerCase();
  if (
    lower.includes("econ") ||
    lower.includes("macro") ||
    lower.includes("fiscal") ||
    lower.includes("trade")
  )
    return "economic";
  if (
    lower.includes("human") ||
    lower.includes("displacement") ||
    lower.includes("refugee")
  )
    return "humanitarian";
  if (lower.includes("health")) return "health";
  if (
    lower.includes("food") ||
    lower.includes("agri") ||
    lower.includes("nutrition")
  )
    return "food";
  if (
    lower.includes("bank") ||
    lower.includes("monet") ||
    lower.includes("currency")
  )
    return "banking";
  if (lower.includes("develop") || lower.includes("hdi")) return "development";
  if (lower.includes("aid") || lower.includes("donor")) return "aid";
  if (lower.includes("conflict") || lower.includes("secur")) return "conflict";
  return "other";
}

function computeFreshnessStatus(
  lastFetch: string | Date | null,
  status: string,
  updateFrequency: string
): "fresh" | "stale" | "warning" | "inactive" {
  if (
    status === "NEEDS_KEY" ||
    status === "INACTIVE" ||
    status === "DEPRECATED" ||
    !lastFetch
  ) {
    return "inactive";
  }
  const now = new Date();
  const lastUpdate = new Date(lastFetch);
  const hoursAgo = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

  // Use cadence-based thresholds instead of fixed 24/72 hours
  const freq = FREQUENCY_LABELS[updateFrequency] || FREQUENCY_LABELS.IRREGULAR;
  const cadenceHours = freq.hours;

  // Fresh: within expected cadence
  // Warning: between 1x and 1.5x cadence (approaching overdue)
  // Stale: more than 1.5x cadence (overdue)
  if (hoursAgo <= cadenceHours) return "fresh";
  if (hoursAgo <= cadenceHours * 1.5) return "warning";
  return "stale";
}

export default function DataFreshness() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load real sources from canonical source_registry via tRPC
  const {
    data: sourcesData,
    isLoading,
    refetch,
  } = trpc.sourceRegistry.getAll.useQuery({
    limit: 500,
  });

  // Map DB sources to display format
  const freshnessData = useMemo(() => {
    if (!sourcesData?.sources) return [];
    return sourcesData.sources.map((source: any) => {
      const freq =
        FREQUENCY_LABELS[source.updateFrequency] || FREQUENCY_LABELS.IRREGULAR;
      const lastUpdate = source.lastFetch ? new Date(source.lastFetch) : null;
      const nextRefresh = source.nextFetch
        ? new Date(source.nextFetch)
        : lastUpdate
          ? new Date(lastUpdate.getTime() + freq.hours * 60 * 60 * 1000)
          : null;

      return {
        id: source.sourceId,
        nameEn: source.name,
        nameAr: source.nameAr || source.name,
        icon: getSourceIcon(source.sourceId),
        color: getSourceColor(source.tier),
        refreshSchedule: freq.en,
        refreshScheduleAr: freq.ar,
        publisher: source.publisher || "",
        category: mapSectorToCategory(source.sectorCategory),
        requiresKey: source.apiKeyRequired || source.status === "NEEDS_KEY",
        lastUpdate,
        nextRefresh,
        status: computeFreshnessStatus(
          source.lastFetch,
          source.status,
          source.updateFrequency
        ),
      };
    });
  }, [sourcesData]);

  // Refresh data from server
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Filter by category
  const filteredSources =
    selectedCategory === "all"
      ? freshnessData
      : freshnessData.filter((s: any) => s.category === selectedCategory);

  // Calculate overall stats
  const totalSources = freshnessData.length;
  const activeSources = freshnessData.filter(
    (s: any) => s.status !== "inactive"
  ).length;
  const freshSources = freshnessData.filter((s: any) => s.status === "fresh").length;
  const staleSources = freshnessData.filter((s: any) => s.status === "stale").length;

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      fresh: {
        icon: CheckCircle,
        labelEn: "Fresh",
        labelAr: "محدث",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
      warning: {
        icon: AlertTriangle,
        labelEn: "Warning",
        labelAr: "تحذير",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      },
      stale: {
        icon: XCircle,
        labelEn: "Stale",
        labelAr: "قديم",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
      inactive: {
        icon: Clock,
        labelEn: "Inactive",
        labelAr: "غير نشط",
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      },
    };

    const {
      icon: Icon,
      labelEn,
      labelAr,
      className,
    } = config[status as keyof typeof config] || config.inactive;

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

    if (diffHours < 1)
      return isRTL ? "منذ أقل من ساعة" : "Less than an hour ago";
    if (diffHours < 24)
      return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`;
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

    if (diffHours < 1)
      return isRTL ? "خلال أقل من ساعة" : "In less than an hour";
    if (diffHours < 24)
      return isRTL ? `خلال ${diffHours} ساعة` : `In ${diffHours} hours`;
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#2e8b6e]" />
          <p className="text-gray-500">
            {isRTL ? "جاري تحميل البيانات..." : "Loading data sources..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-950 ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
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
              <RefreshCw
                className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRTL ? "تحديث" : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="w-8 h-8 mx-auto mb-2 text-[#2e8b6e]" />
              <div className="text-2xl font-bold text-[#2e8b6e]">
                {totalSources}
              </div>
              <div className="text-sm text-gray-500">
                {isRTL ? "إجمالي المصادر" : "Total Sources"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-[#2e8b6e]" />
              <div className="text-2xl font-bold text-[#2e8b6e]">
                {activeSources}
              </div>
              <div className="text-sm text-gray-500">
                {isRTL ? "مصادر نشطة" : "Active Sources"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">
                {freshSources}
              </div>
              <div className="text-sm text-gray-500">
                {isRTL ? "محدثة" : "Fresh"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold text-red-600">
                {staleSources}
              </div>
              <div className="text-sm text-gray-500">
                {isRTL ? "قديمة" : "Stale"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
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
          {filteredSources.map((source: any) => {
            const SourceIcon = source.icon;
            return (
              <Card key={source.id} className="overflow-hidden">
                <div className={`h-2 ${source.color}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${source.color} flex items-center justify-center`}
                      >
                        <SourceIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {isRTL ? source.nameAr : source.nameEn}
                        </CardTitle>
                        <p className="text-xs text-gray-500">
                          {source.publisher}
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
                        {isRTL
                          ? source.refreshScheduleAr
                          : source.refreshSchedule}
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
            );
          })}
        </div>

        {/* Empty state */}
        {filteredSources.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>
              {isRTL
                ? "لا توجد مصادر في هذه الفئة"
                : "No sources found in this category"}
            </p>
          </div>
        )}

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
                    {isRTL
                      ? "ضمن وتيرة التحديث المتوقعة"
                      : "Within expected update cadence"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div>
                  <div className="font-medium">
                    {isRTL ? "تحذير" : "Warning"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isRTL
                      ? "يقترب من موعد التحديث"
                      : "Approaching scheduled refresh"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div>
                  <div className="font-medium">{isRTL ? "قديم" : "Stale"}</div>
                  <div className="text-xs text-gray-500">
                    {isRTL
                      ? "تجاوز وتيرة التحديث المتوقعة"
                      : "Exceeded expected update cadence"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <div>
                  <div className="font-medium">
                    {isRTL ? "غير نشط" : "Inactive"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isRTL
                      ? "يتطلب تكوين إضافي"
                      : "Requires additional configuration"}
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
