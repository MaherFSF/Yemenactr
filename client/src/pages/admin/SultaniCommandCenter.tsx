import { useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Database, 
  FileText, 
  Key, 
  Mail, 
  Cloud,
  RefreshCw,
  Activity,
  Rocket,
  Lock,
  Users,
  Server,
  Globe,
  Zap,
  Eye,
  AlertCircle,
  BarChart3,
  Settings,
  Terminal,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  Bell,
  MessageSquare,
  FileCode,
  Cpu,
  HardDrive,
  Wifi,
  Power
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";

interface SystemService {
  id: string;
  name: string;
  nameAr: string;
  status: "running" | "stopped" | "error" | "starting";
  uptime?: string;
  lastRestart?: string;
  memory?: string;
  cpu?: string;
}

interface ScheduledJob {
  id: string;
  name: string;
  nameAr: string;
  schedule: string;
  lastRun?: string;
  nextRun?: string;
  status: "active" | "paused" | "error";
  lastResult?: "success" | "failure";
}

interface ConnectorStatus {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  status: "connected" | "disconnected" | "error" | "rate_limited";
  lastSync?: string;
  recordsToday?: number;
  errorMessage?: string;
}

export default function SultaniCommandCenter() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // System services
  const services: SystemService[] = [
    { id: "api", name: "API Server", nameAr: "خادم API", status: "running", uptime: "7d 14h", memory: "512MB", cpu: "12%" },
    { id: "db", name: "Database", nameAr: "قاعدة البيانات", status: "running", uptime: "7d 14h", memory: "2GB", cpu: "8%" },
    { id: "redis", name: "Cache (Redis)", nameAr: "التخزين المؤقت", status: "running", uptime: "7d 14h", memory: "256MB", cpu: "2%" },
    { id: "scheduler", name: "Job Scheduler", nameAr: "جدولة المهام", status: "running", uptime: "7d 14h", memory: "128MB", cpu: "1%" },
    { id: "ingestion", name: "Ingestion Pipeline", nameAr: "خط الاستيعاب", status: "running", uptime: "7d 14h", memory: "384MB", cpu: "5%" },
    { id: "ai", name: "AI Service", nameAr: "خدمة الذكاء الاصطناعي", status: "running", uptime: "7d 14h", memory: "1GB", cpu: "15%" },
  ];

  // Scheduled jobs
  const jobs: ScheduledJob[] = [
    { id: "daily-brief", name: "Daily Brief Generation", nameAr: "إنشاء الملخص اليومي", schedule: "0 6 * * *", lastRun: "2026-01-29 06:00", nextRun: "2026-01-30 06:00", status: "active", lastResult: "success" },
    { id: "freshness-check", name: "Freshness SLA Check", nameAr: "فحص SLA الحداثة", schedule: "*/15 * * * *", lastRun: "2026-01-29 14:15", nextRun: "2026-01-29 14:30", status: "active", lastResult: "success" },
    { id: "connector-sync", name: "Connector Sync", nameAr: "مزامنة الموصلات", schedule: "0 */4 * * *", lastRun: "2026-01-29 12:00", nextRun: "2026-01-29 16:00", status: "active", lastResult: "success" },
    { id: "evidence-coverage", name: "Evidence Coverage Scan", nameAr: "فحص تغطية الأدلة", schedule: "0 0 * * *", lastRun: "2026-01-29 00:00", nextRun: "2026-01-30 00:00", status: "active", lastResult: "success" },
    { id: "backup", name: "Database Backup", nameAr: "نسخ احتياطي لقاعدة البيانات", schedule: "0 2 * * *", lastRun: "2026-01-29 02:00", nextRun: "2026-01-30 02:00", status: "active", lastResult: "success" },
    { id: "cleanup", name: "Temp Files Cleanup", nameAr: "تنظيف الملفات المؤقتة", schedule: "0 3 * * 0", lastRun: "2026-01-26 03:00", nextRun: "2026-02-02 03:00", status: "active", lastResult: "success" },
  ];

  // Connectors
  const connectors: ConnectorStatus[] = [
    { id: "worldbank", name: "World Bank API", nameAr: "API البنك الدولي", type: "api", status: "connected", lastSync: "2026-01-29 14:00", recordsToday: 156 },
    { id: "imf", name: "IMF Data", nameAr: "بيانات صندوق النقد الدولي", type: "api", status: "connected", lastSync: "2026-01-29 12:00", recordsToday: 89 },
    { id: "ocha", name: "OCHA FTS", nameAr: "OCHA FTS", type: "api", status: "connected", lastSync: "2026-01-29 10:00", recordsToday: 234 },
    { id: "cby", name: "CBY (Manual)", nameAr: "البنك المركزي (يدوي)", type: "manual", status: "connected", lastSync: "2026-01-28 16:00", recordsToday: 12 },
    { id: "customs", name: "Customs Authority", nameAr: "مصلحة الجمارك", type: "partner", status: "connected", lastSync: "2026-01-27 09:00", recordsToday: 0 },
    { id: "mof", name: "Ministry of Finance", nameAr: "وزارة المالية", type: "partner", status: "disconnected", errorMessage: "Partnership pending" },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast.success(isArabic ? "تم تحديث الحالة" : "Status refreshed");
  };

  const handleServiceAction = (serviceId: string, action: "restart" | "stop" | "start") => {
    toast.success(isArabic 
      ? `تم ${action === "restart" ? "إعادة تشغيل" : action === "stop" ? "إيقاف" : "تشغيل"} الخدمة`
      : `Service ${action}ed successfully`);
  };

  const handleJobAction = (jobId: string, action: "run" | "pause" | "resume") => {
    toast.success(isArabic 
      ? `تم ${action === "run" ? "تشغيل" : action === "pause" ? "إيقاف مؤقت" : "استئناف"} المهمة`
      : `Job ${action === "run" ? "triggered" : action === "pause" ? "paused" : "resumed"}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
      case "connected":
      case "active":
        return <Badge className="bg-green-500">{isArabic ? "يعمل" : "Running"}</Badge>;
      case "stopped":
      case "disconnected":
      case "paused":
        return <Badge variant="secondary">{isArabic ? "متوقف" : "Stopped"}</Badge>;
      case "error":
        return <Badge variant="destructive">{isArabic ? "خطأ" : "Error"}</Badge>;
      case "starting":
        return <Badge variant="outline">{isArabic ? "يبدأ" : "Starting"}</Badge>;
      case "rate_limited":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">{isArabic ? "محدود" : "Rate Limited"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate stats
  const runningServices = services.filter(s => s.status === "running").length;
  const activeJobs = jobs.filter(j => j.status === "active").length;
  const connectedConnectors = connectors.filter(c => c.status === "connected").length;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background" dir={isArabic ? "rtl" : "ltr"}>
        <div className="container py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Terminal className="h-8 w-8 text-primary" />
                {isArabic ? "مركز القيادة السلطاني" : "Sultani Command Center"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isArabic 
                  ? "التحكم الكامل في جميع أنظمة YETO"
                  : "Full control over all YETO systems"}
              </p>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 ${isArabic ? "ml-2" : "mr-2"} ${isRefreshing ? "animate-spin" : ""}`} />
              {isArabic ? "تحديث" : "Refresh"}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "الخدمات" : "Services"}</p>
                    <p className="text-2xl font-bold">{runningServices}/{services.length}</p>
                  </div>
                  <Server className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "المهام" : "Jobs"}</p>
                    <p className="text-2xl font-bold">{activeJobs}/{jobs.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "الموصلات" : "Connectors"}</p>
                    <p className="text-2xl font-bold">{connectedConnectors}/{connectors.length}</p>
                  </div>
                  <Wifi className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{isArabic ? "الحالة" : "Status"}</p>
                    <p className="text-2xl font-bold text-green-500">{isArabic ? "صحي" : "Healthy"}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {isArabic ? "نظرة عامة" : "Overview"}
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                {isArabic ? "الخدمات" : "Services"}
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {isArabic ? "المهام" : "Jobs"}
              </TabsTrigger>
              <TabsTrigger value="connectors" className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                {isArabic ? "الموصلات" : "Connectors"}
              </TabsTrigger>
              <TabsTrigger value="controls" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {isArabic ? "التحكم" : "Controls"}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      {isArabic ? "صحة النظام" : "System Health"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{isArabic ? "استخدام CPU" : "CPU Usage"}</span>
                          <span className="text-sm font-medium">43%</span>
                        </div>
                        <Progress value={43} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{isArabic ? "استخدام الذاكرة" : "Memory Usage"}</span>
                          <span className="text-sm font-medium">67%</span>
                        </div>
                        <Progress value={67} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{isArabic ? "استخدام القرص" : "Disk Usage"}</span>
                          <span className="text-sm font-medium">52%</span>
                        </div>
                        <Progress value={52} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{isArabic ? "اتصالات قاعدة البيانات" : "DB Connections"}</span>
                          <span className="text-sm font-medium">24/100</span>
                        </div>
                        <Progress value={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      {isArabic ? "النشاط الأخير" : "Recent Activity"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-3">
                        {[
                          { time: "14:23", event: "Daily brief generated successfully", type: "success" },
                          { time: "14:15", event: "Freshness SLA check completed", type: "success" },
                          { time: "12:00", event: "Connector sync completed (456 records)", type: "success" },
                          { time: "10:30", event: "New partner submission received", type: "info" },
                          { time: "08:45", event: "Evidence coverage scan: 97.3%", type: "success" },
                          { time: "06:00", event: "Daily brief generation started", type: "info" },
                          { time: "02:00", event: "Database backup completed", type: "success" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <span className="text-muted-foreground w-12">{item.time}</span>
                            <div className={`w-2 h-2 rounded-full mt-1.5 ${
                              item.type === "success" ? "bg-green-500" :
                              item.type === "error" ? "bg-red-500" :
                              "bg-blue-500"
                            }`} />
                            <span>{item.event}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      {isArabic ? "إجراءات سريعة" : "Quick Actions"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                        <RefreshCw className="h-5 w-5" />
                        <span>{isArabic ? "مزامنة الموصلات" : "Sync Connectors"}</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                        <FileText className="h-5 w-5" />
                        <span>{isArabic ? "إنشاء ملخص" : "Generate Brief"}</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                        <Eye className="h-5 w-5" />
                        <span>{isArabic ? "فحص التغطية" : "Coverage Scan"}</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                        <Download className="h-5 w-5" />
                        <span>{isArabic ? "نسخ احتياطي" : "Backup Now"}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "خدمات النظام" : "System Services"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "إدارة ومراقبة جميع خدمات YETO" : "Manage and monitor all YETO services"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.map(service => (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            service.status === "running" ? "bg-green-500" :
                            service.status === "error" ? "bg-red-500" :
                            "bg-gray-400"
                          }`} />
                          <div>
                            <h4 className="font-medium">{isArabic ? service.nameAr : service.name}</h4>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>{isArabic ? "وقت التشغيل:" : "Uptime:"} {service.uptime}</span>
                              <span>{isArabic ? "الذاكرة:" : "Memory:"} {service.memory}</span>
                              <span>CPU: {service.cpu}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(service.status)}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleServiceAction(service.id, "restart")}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "المهام المجدولة" : "Scheduled Jobs"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "إدارة المهام الآلية والمجدولة" : "Manage automated and scheduled tasks"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.map(job => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{isArabic ? job.nameAr : job.name}</h4>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span>{isArabic ? "الجدول:" : "Schedule:"} {job.schedule}</span>
                            <span>{isArabic ? "آخر تشغيل:" : "Last run:"} {job.lastRun}</span>
                            <span>{isArabic ? "التالي:" : "Next:"} {job.nextRun}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.lastResult === "success" ? (
                            <Badge className="bg-green-500">{isArabic ? "نجاح" : "Success"}</Badge>
                          ) : job.lastResult === "failure" ? (
                            <Badge variant="destructive">{isArabic ? "فشل" : "Failed"}</Badge>
                          ) : null}
                          {getStatusBadge(job.status)}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleJobAction(job.id, "run")}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleJobAction(job.id, job.status === "active" ? "pause" : "resume")}
                          >
                            {job.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Connectors Tab */}
            <TabsContent value="connectors">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "موصلات البيانات" : "Data Connectors"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "حالة ومراقبة موصلات مصادر البيانات" : "Status and monitoring of data source connectors"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connectors.map(connector => (
                      <div key={connector.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            connector.status === "connected" ? "bg-green-500" :
                            connector.status === "error" ? "bg-red-500" :
                            connector.status === "rate_limited" ? "bg-yellow-500" :
                            "bg-gray-400"
                          }`} />
                          <div>
                            <h4 className="font-medium">{isArabic ? connector.nameAr : connector.name}</h4>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <Badge variant="outline">{connector.type}</Badge>
                              {connector.lastSync && (
                                <span>{isArabic ? "آخر مزامنة:" : "Last sync:"} {connector.lastSync}</span>
                              )}
                              {connector.recordsToday !== undefined && (
                                <span>{isArabic ? "اليوم:" : "Today:"} {connector.recordsToday} {isArabic ? "سجل" : "records"}</span>
                              )}
                            </div>
                            {connector.errorMessage && (
                              <p className="text-sm text-red-500 mt-1">{connector.errorMessage}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(connector.status)}
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Controls Tab */}
            <TabsContent value="controls">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Toggles */}
                <Card>
                  <CardHeader>
                    <CardTitle>{isArabic ? "تبديل الميزات" : "Feature Toggles"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { id: "ai-assistant", label: "AI Assistant", labelAr: "مساعد الذكاء الاصطناعي", enabled: true },
                        { id: "scenario-sim", label: "Scenario Simulator", labelAr: "محاكي السيناريو", enabled: true },
                        { id: "auto-briefs", label: "Auto Brief Generation", labelAr: "إنشاء الملخصات التلقائي", enabled: true },
                        { id: "partner-portal", label: "Partner Portal", labelAr: "بوابة الشركاء", enabled: true },
                        { id: "public-api", label: "Public API Access", labelAr: "وصول API العام", enabled: false },
                        { id: "debug-mode", label: "Debug Mode", labelAr: "وضع التصحيح", enabled: false },
                      ].map(toggle => (
                        <div key={toggle.id} className="flex items-center justify-between">
                          <Label htmlFor={toggle.id}>{isArabic ? toggle.labelAr : toggle.label}</Label>
                          <Switch id={toggle.id} defaultChecked={toggle.enabled} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Maintenance Mode */}
                <Card>
                  <CardHeader>
                    <CardTitle>{isArabic ? "وضع الصيانة" : "Maintenance Mode"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div>
                          <h4 className="font-medium">{isArabic ? "وضع الصيانة" : "Maintenance Mode"}</h4>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? "تعطيل الوصول العام أثناء الصيانة" : "Disable public access during maintenance"}
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label>{isArabic ? "رسالة الصيانة" : "Maintenance Message"}</Label>
                        <Textarea 
                          placeholder={isArabic ? "أدخل رسالة الصيانة..." : "Enter maintenance message..."}
                          defaultValue="YETO is currently undergoing scheduled maintenance. We'll be back shortly."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isArabic ? "الوقت المتوقع للعودة" : "Expected Return Time"}</Label>
                        <Input type="datetime-local" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>{isArabic ? "روابط الإدارة" : "Admin Links"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { href: "/admin/release-gate", icon: Shield, label: "Release Gate", labelAr: "بوابة الإصدار" },
                        { href: "/admin/coverage", icon: Eye, label: "Coverage Map", labelAr: "خريطة التغطية" },
                        { href: "/admin/freshness", icon: Clock, label: "Freshness SLA", labelAr: "SLA الحداثة" },
                        { href: "/admin/publishing", icon: FileText, label: "Publishing", labelAr: "النشر" },
                        { href: "/admin/partners", icon: Users, label: "Partners", labelAr: "الشركاء" },
                        { href: "/admin/mission-control", icon: Activity, label: "Mission Control", labelAr: "مركز المهمة" },
                        { href: "/admin/api-keys", icon: Key, label: "API Keys", labelAr: "مفاتيح API" },
                        { href: "/admin/sectors", icon: BarChart3, label: "Sectors", labelAr: "القطاعات" },
                      ].map(link => (
                        <Link key={link.href} href={link.href}>
                          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                            <link.icon className="h-5 w-5" />
                            <span>{isArabic ? link.labelAr : link.label}</span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  );
}
