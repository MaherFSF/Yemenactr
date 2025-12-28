import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Database, 
  HardDrive, 
  RefreshCw, 
  Server, 
  Shield, 
  Wifi,
  XCircle,
  Zap,
  FileText,
  Users,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface SystemMetric {
  name: string;
  nameAr: string;
  value: number;
  max: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
}

interface Alert {
  id: string;
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: Date;
  source: string;
  acknowledged: boolean;
}

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  success: boolean;
}

interface IngestionStatus {
  source: string;
  sourceAr: string;
  lastRun: Date | null;
  nextRun: Date | null;
  status: "running" | "success" | "failed" | "pending";
  recordsProcessed: number;
  errorCount: number;
}

export default function AdminMonitoring() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  // System metrics
  const systemMetrics: SystemMetric[] = [
    { name: "CPU Usage", nameAr: "استخدام المعالج", value: 34, max: 100, unit: "%", status: "healthy" },
    { name: "Memory Usage", nameAr: "استخدام الذاكرة", value: 62, max: 100, unit: "%", status: "healthy" },
    { name: "Disk Usage", nameAr: "استخدام القرص", value: 45, max: 100, unit: "%", status: "healthy" },
    { name: "Network I/O", nameAr: "نشاط الشبكة", value: 128, max: 1000, unit: "MB/s", status: "healthy" },
    { name: "Active Connections", nameAr: "الاتصالات النشطة", value: 847, max: 10000, unit: "", status: "healthy" },
    { name: "Request Rate", nameAr: "معدل الطلبات", value: 1250, max: 5000, unit: "/min", status: "healthy" },
  ];

  // Active alerts
  const alerts: Alert[] = [
    {
      id: "1",
      severity: "warning",
      title: "High API Response Time",
      titleAr: "وقت استجابة API مرتفع",
      message: "Average response time exceeded 500ms threshold",
      messageAr: "تجاوز متوسط وقت الاستجابة عتبة 500 مللي ثانية",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      source: "API Gateway",
      acknowledged: false,
    },
    {
      id: "2",
      severity: "info",
      title: "World Bank Connector Updated",
      titleAr: "تم تحديث موصل البنك الدولي",
      message: "Successfully ingested 1,247 new data points",
      messageAr: "تم استيعاب 1,247 نقطة بيانات جديدة بنجاح",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      source: "Data Ingestion",
      acknowledged: true,
    },
    {
      id: "3",
      severity: "error",
      title: "CBY Aden API Timeout",
      titleAr: "انتهاء مهلة API البنك المركزي عدن",
      message: "Connection timeout after 3 retry attempts",
      messageAr: "انتهت مهلة الاتصال بعد 3 محاولات إعادة",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      source: "Data Ingestion",
      acknowledged: false,
    },
  ];

  // Audit log entries
  const auditLogs: AuditLogEntry[] = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      userId: "admin-001",
      userName: "System Admin",
      action: "DATA_EXPORT",
      resource: "indicators/fx-rates",
      details: "Exported 500 records to CSV",
      ipAddress: "192.168.1.100",
      success: true,
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      userId: "user-042",
      userName: "Ahmed Hassan",
      action: "LOGIN",
      resource: "auth/session",
      details: "Successful login via OAuth",
      ipAddress: "85.112.45.23",
      success: true,
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      userId: "api-key-003",
      userName: "Partner API",
      action: "API_CALL",
      resource: "api/v1/indicators",
      details: "Rate limit warning: 450/500 requests",
      ipAddress: "203.45.67.89",
      success: true,
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      userId: "system",
      userName: "Scheduler",
      action: "INGESTION_RUN",
      resource: "connectors/world-bank",
      details: "Scheduled ingestion completed",
      ipAddress: "127.0.0.1",
      success: true,
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 50 * 60 * 1000),
      userId: "admin-002",
      userName: "Data Manager",
      action: "RECORD_UPDATE",
      resource: "indicators/gdp-growth",
      details: "Updated confidence rating to A",
      ipAddress: "192.168.1.105",
      success: true,
    },
  ];

  // Ingestion pipeline status
  const ingestionStatus: IngestionStatus[] = [
    {
      source: "World Bank API",
      sourceAr: "API البنك الدولي",
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000),
      status: "success",
      recordsProcessed: 1247,
      errorCount: 0,
    },
    {
      source: "OCHA FTS",
      sourceAr: "OCHA FTS",
      lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000),
      status: "success",
      recordsProcessed: 523,
      errorCount: 2,
    },
    {
      source: "HDX HAPI",
      sourceAr: "HDX HAPI",
      lastRun: new Date(Date.now() - 30 * 60 * 1000),
      nextRun: new Date(Date.now() + 23.5 * 60 * 60 * 1000),
      status: "running",
      recordsProcessed: 89,
      errorCount: 0,
    },
    {
      source: "IMF Data Services",
      sourceAr: "خدمات بيانات صندوق النقد",
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 6 * 60 * 1000),
      status: "pending",
      recordsProcessed: 0,
      errorCount: 0,
    },
    {
      source: "CBY Aden",
      sourceAr: "البنك المركزي عدن",
      lastRun: new Date(Date.now() - 45 * 60 * 1000),
      nextRun: null,
      status: "failed",
      recordsProcessed: 0,
      errorCount: 3,
    },
    {
      source: "WFP Market Prices",
      sourceAr: "أسعار السوق WFP",
      lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
      status: "success",
      recordsProcessed: 2156,
      errorCount: 0,
    },
    {
      source: "ACLED Conflict Data",
      sourceAr: "بيانات النزاع ACLED",
      lastRun: new Date(Date.now() - 48 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 120 * 60 * 60 * 1000),
      status: "success",
      recordsProcessed: 847,
      errorCount: 1,
    },
    {
      source: "ReliefWeb Documents",
      sourceAr: "وثائق ReliefWeb",
      lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 20 * 60 * 60 * 1000),
      status: "success",
      recordsProcessed: 156,
      errorCount: 0,
    },
  ];

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "success":
        return "text-green-500";
      case "warning":
      case "pending":
        return "text-yellow-500";
      case "critical":
      case "failed":
      case "error":
        return "text-red-500";
      case "running":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
      case "success":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {language === "ar" ? "سليم" : "Healthy"}
        </Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          {language === "ar" ? "تحذير" : "Warning"}
        </Badge>;
      case "critical":
      case "failed":
      case "error":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          {language === "ar" ? "حرج" : "Critical"}
        </Badge>;
      case "running":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {language === "ar" ? "قيد التشغيل" : "Running"}
        </Badge>;
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          {language === "ar" ? "معلق" : "Pending"}
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "info":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return language === "ar" ? "الآن" : "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return language === "ar" ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return language === "ar" ? `منذ ${hours} ساعة` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return language === "ar" ? `منذ ${days} يوم` : `${days}d ago`;
  };

  const formatNextRun = (date: Date | null) => {
    if (!date) return language === "ar" ? "غير مجدول" : "Not scheduled";
    const minutes = Math.floor((date.getTime() - Date.now()) / 60000);
    if (minutes < 60) return language === "ar" ? `خلال ${minutes} دقيقة` : `In ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return language === "ar" ? `خلال ${hours} ساعة` : `In ${hours}h`;
    const days = Math.floor(hours / 24);
    return language === "ar" ? `خلال ${days} يوم` : `In ${days}d`;
  };

  // Calculate summary stats
  const healthyServices = systemMetrics.filter(m => m.status === "healthy").length;
  const totalServices = systemMetrics.length;
  const activeAlerts = alerts.filter(a => !a.acknowledged).length;
  const successfulIngestions = ingestionStatus.filter(s => s.status === "success").length;
  const totalIngestions = ingestionStatus.length;

  return (
    <DashboardLayout>
      <div className={`p-6 space-y-6 ${isRTL ? "rtl" : "ltr"}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === "ar" ? "لوحة المراقبة" : "Monitoring Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === "ar" 
                ? "مراقبة صحة النظام والتنبيهات وحالة استيعاب البيانات في الوقت الفعلي"
                : "Real-time system health, alerts, and data ingestion status"}
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {language === "ar" ? "تحديث" : "Refresh"}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "صحة النظام" : "System Health"}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round((healthyServices / totalServices) * 100)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {healthyServices}/{totalServices} {language === "ar" ? "خدمات سليمة" : "services healthy"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "التنبيهات النشطة" : "Active Alerts"}
                  </p>
                  <p className={`text-2xl font-bold ${activeAlerts > 0 ? "text-yellow-600" : "text-green-600"}`}>
                    {activeAlerts}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  activeAlerts > 0 ? "bg-yellow-100 dark:bg-yellow-900" : "bg-green-100 dark:bg-green-900"
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${activeAlerts > 0 ? "text-yellow-600" : "text-green-600"}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {language === "ar" ? "تتطلب الانتباه" : "Require attention"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "خطوط الاستيعاب" : "Ingestion Pipelines"}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {successfulIngestions}/{totalIngestions}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {language === "ar" ? "موصلات نشطة" : "Active connectors"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "معدل الطلبات" : "Request Rate"}
                  </p>
                  <p className="text-2xl font-bold">1,250</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {language === "ar" ? "طلب/دقيقة" : "requests/min"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              {language === "ar" ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              {language === "ar" ? "التنبيهات" : "Alerts"}
              {activeAlerts > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeAlerts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ingestion" className="gap-2">
              <Database className="h-4 w-4" />
              {language === "ar" ? "الاستيعاب" : "Ingestion"}
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <Shield className="h-4 w-4" />
              {language === "ar" ? "سجل التدقيق" : "Audit Log"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* System Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    {language === "ar" ? "مقاييس النظام" : "System Metrics"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {language === "ar" ? metric.nameAr : metric.name}
                        </span>
                        <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                          {metric.value}{metric.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(metric.value / metric.max) * 100} 
                        className={`h-2 ${
                          metric.status === "healthy" ? "[&>div]:bg-green-500" :
                          metric.status === "warning" ? "[&>div]:bg-yellow-500" :
                          "[&>div]:bg-red-500"
                        }`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Service Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    {language === "ar" ? "حالة الخدمات" : "Service Status"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "API Server", nameAr: "خادم API", status: "healthy", latency: "45ms" },
                      { name: "Database", nameAr: "قاعدة البيانات", status: "healthy", latency: "12ms" },
                      { name: "Cache Layer", nameAr: "طبقة التخزين المؤقت", status: "healthy", latency: "2ms" },
                      { name: "Storage (S3)", nameAr: "التخزين (S3)", status: "healthy", latency: "85ms" },
                      { name: "Search Index", nameAr: "فهرس البحث", status: "healthy", latency: "23ms" },
                      { name: "Scheduler", nameAr: "المجدول", status: "healthy", latency: "N/A" },
                    ].map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${
                            service.status === "healthy" ? "bg-green-500" : "bg-red-500"
                          }`} />
                          <span className="font-medium">
                            {language === "ar" ? service.nameAr : service.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{service.latency}</span>
                          {getStatusBadge(service.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {language === "ar" ? "التنبيهات النشطة" : "Active Alerts"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "تنبيهات النظام والتحذيرات التي تتطلب الانتباه"
                    : "System alerts and warnings requiring attention"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg border ${
                        alert.acknowledged ? "bg-muted/30" : "bg-muted/50"
                      } ${
                        alert.severity === "error" || alert.severity === "critical" 
                          ? "border-red-200 dark:border-red-800" 
                          : alert.severity === "warning"
                          ? "border-yellow-200 dark:border-yellow-800"
                          : "border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(alert.severity)}
                          <div>
                            <h4 className="font-medium">
                              {language === "ar" ? alert.titleAr : alert.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {language === "ar" ? alert.messageAr : alert.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{alert.source}</span>
                              <span>{formatTimeAgo(alert.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button variant="outline" size="sm">
                            {language === "ar" ? "تأكيد" : "Acknowledge"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingestion Tab */}
          <TabsContent value="ingestion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {language === "ar" ? "حالة خطوط الاستيعاب" : "Ingestion Pipeline Status"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "حالة موصلات البيانات وجداول التشغيل"
                    : "Data connector status and run schedules"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className={`text-${isRTL ? "right" : "left"} py-3 px-4 font-medium`}>
                          {language === "ar" ? "المصدر" : "Source"}
                        </th>
                        <th className={`text-${isRTL ? "right" : "left"} py-3 px-4 font-medium`}>
                          {language === "ar" ? "الحالة" : "Status"}
                        </th>
                        <th className={`text-${isRTL ? "right" : "left"} py-3 px-4 font-medium`}>
                          {language === "ar" ? "آخر تشغيل" : "Last Run"}
                        </th>
                        <th className={`text-${isRTL ? "right" : "left"} py-3 px-4 font-medium`}>
                          {language === "ar" ? "التشغيل التالي" : "Next Run"}
                        </th>
                        <th className={`text-${isRTL ? "right" : "left"} py-3 px-4 font-medium`}>
                          {language === "ar" ? "السجلات" : "Records"}
                        </th>
                        <th className={`text-${isRTL ? "right" : "left"} py-3 px-4 font-medium`}>
                          {language === "ar" ? "الأخطاء" : "Errors"}
                        </th>
                        <th className={`text-${isRTL ? "right" : "left"} py-3 px-4 font-medium`}>
                          {language === "ar" ? "الإجراءات" : "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingestionStatus.map((pipeline, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <span className="font-medium">
                              {language === "ar" ? pipeline.sourceAr : pipeline.source}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(pipeline.status)}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {pipeline.lastRun ? formatTimeAgo(pipeline.lastRun) : "-"}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatNextRun(pipeline.nextRun)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm">
                              {pipeline.recordsProcessed.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-mono text-sm ${
                              pipeline.errorCount > 0 ? "text-red-500" : "text-green-500"
                            }`}>
                              {pipeline.errorCount}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <RefreshCw className="h-3 w-3" />
                              {language === "ar" ? "تشغيل" : "Run"}
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

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {language === "ar" ? "سجل التدقيق الأمني" : "Security Audit Log"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "سجل الأنشطة والإجراءات على المنصة"
                    : "Activity and action log for the platform"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          log.success ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                        }`}>
                          {log.success 
                            ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                            : <XCircle className="h-4 w-4 text-red-600" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.userName}</span>
                            <Badge variant="outline" className="text-xs">{log.action}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="font-mono">{log.resource}</span>
                            <span>{log.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(log.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
