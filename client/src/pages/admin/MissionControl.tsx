/**
 * Admin Mission Control
 * Central command center for platform operations, incidents, and governance
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText,
  Settings,
  Users,
  Database,
  RefreshCw,
  Plus,
  Eye
} from "lucide-react";

export default function MissionControl() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [activeTab, setActiveTab] = useState("overview");
  const [showIncidentDialog, setShowIncidentDialog] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "medium" as "critical" | "high" | "medium" | "low",
    category: "other" as "pipeline_outage" | "data_anomaly" | "security" | "performance" | "integration" | "other"
  });

  // Queries
  const { data: incidents, refetch: refetchIncidents } = trpc.partnerEngine.getIncidents.useQuery({ limit: 20 });
  const { data: policies, refetch: refetchPolicies } = trpc.partnerEngine.getPolicies.useQuery();
  const { data: auditLog } = trpc.partnerEngine.getAuditLog.useQuery({ limit: 50 });
  const { data: moderationStats } = trpc.partnerEngine.getModerationStats.useQuery();

  // Mutations
  const createIncidentMutation = trpc.partnerEngine.createIncident.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم إنشاء الحادث" : "Incident created");
      setShowIncidentDialog(false);
      setNewIncident({ title: "", description: "", severity: "medium", category: "other" });
      refetchIncidents();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const updateIncidentMutation = trpc.partnerEngine.updateIncident.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم تحديث الحادث" : "Incident updated");
      refetchIncidents();
    }
  });

  const updatePolicyMutation = trpc.partnerEngine.updatePolicy.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم تحديث السياسة" : "Policy updated");
      refetchPolicies();
    }
  });

  // Stats calculations
  const openIncidents = incidents?.filter(i => i.status === "open" || i.status === "investigating").length || 0;
  const criticalIncidents = incidents?.filter(i => i.severity === "critical" && i.status !== "closed").length || 0;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800";
      case "investigating": return "bg-yellow-100 text-yellow-800";
      case "mitigating": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isArabic ? "مركز القيادة" : "Mission Control"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isArabic 
                ? "مراقبة العمليات والحوادث والحوكمة"
                : "Monitor operations, incidents, and governance"}
            </p>
          </div>
          <Dialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {isArabic ? "حادث جديد" : "New Incident"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isArabic ? "إنشاء حادث جديد" : "Create New Incident"}</DialogTitle>
                <DialogDescription>
                  {isArabic 
                    ? "سجل حادثًا جديدًا للتتبع والحل"
                    : "Log a new incident for tracking and resolution"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder={isArabic ? "عنوان الحادث" : "Incident title"}
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                />
                <Textarea
                  placeholder={isArabic ? "وصف الحادث" : "Incident description"}
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={newIncident.severity}
                    onValueChange={(v) => setNewIncident({ ...newIncident, severity: v as typeof newIncident.severity })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? "الخطورة" : "Severity"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">{isArabic ? "حرج" : "Critical"}</SelectItem>
                      <SelectItem value="high">{isArabic ? "عالي" : "High"}</SelectItem>
                      <SelectItem value="medium">{isArabic ? "متوسط" : "Medium"}</SelectItem>
                      <SelectItem value="low">{isArabic ? "منخفض" : "Low"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={newIncident.category}
                    onValueChange={(v) => setNewIncident({ ...newIncident, category: v as typeof newIncident.category })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? "الفئة" : "Category"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pipeline_outage">{isArabic ? "انقطاع خط الأنابيب" : "Pipeline Outage"}</SelectItem>
                      <SelectItem value="data_anomaly">{isArabic ? "شذوذ البيانات" : "Data Anomaly"}</SelectItem>
                      <SelectItem value="security">{isArabic ? "أمان" : "Security"}</SelectItem>
                      <SelectItem value="performance">{isArabic ? "أداء" : "Performance"}</SelectItem>
                      <SelectItem value="integration">{isArabic ? "تكامل" : "Integration"}</SelectItem>
                      <SelectItem value="other">{isArabic ? "أخرى" : "Other"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowIncidentDialog(false)}>
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
                <Button 
                  onClick={() => createIncidentMutation.mutate(newIncident)}
                  disabled={!newIncident.title || !newIncident.description}
                >
                  {isArabic ? "إنشاء" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "الحوادث المفتوحة" : "Open Incidents"}
                  </p>
                  <p className="text-2xl font-bold">{openIncidents}</p>
                </div>
                <AlertTriangle className={`w-8 h-8 ${openIncidents > 0 ? "text-yellow-500" : "text-green-500"}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "حوادث حرجة" : "Critical Incidents"}
                  </p>
                  <p className="text-2xl font-bold">{criticalIncidents}</p>
                </div>
                <Shield className={`w-8 h-8 ${criticalIncidents > 0 ? "text-red-500" : "text-green-500"}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "قيد المراجعة" : "Pending Review"}
                  </p>
                  <p className="text-2xl font-bold">
                    {(moderationStats?.byStatus as Record<string, number>)?.pending_review || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "السياسات النشطة" : "Active Policies"}
                  </p>
                  <p className="text-2xl font-bold">{policies?.length || 0}</p>
                </div>
                <Settings className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Activity className="w-4 h-4 mr-2" />
              {isArabic ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="incidents">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {isArabic ? "الحوادث" : "Incidents"}
            </TabsTrigger>
            <TabsTrigger value="policies">
              <Shield className="w-4 h-4 mr-2" />
              {isArabic ? "السياسات" : "Policies"}
            </TabsTrigger>
            <TabsTrigger value="audit">
              <FileText className="w-4 h-4 mr-2" />
              {isArabic ? "سجل التدقيق" : "Audit Log"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "صحة النظام" : "System Health"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        {isArabic ? "قاعدة البيانات" : "Database"}
                      </span>
                      <Badge className="bg-green-500">{isArabic ? "متصل" : "Connected"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        {isArabic ? "خط الأنابيب" : "Pipeline"}
                      </span>
                      <Badge className="bg-green-500">{isArabic ? "يعمل" : "Running"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {isArabic ? "المصادقة" : "Auth"}
                      </span>
                      <Badge className="bg-green-500">{isArabic ? "نشط" : "Active"}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Moderation Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "إحصائيات الإشراف" : "Moderation Stats"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moderationStats?.byStatus && Object.entries(moderationStats.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize">{status.replace(/_/g, " ")}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "الحوادث النشطة" : "Active Incidents"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? "تتبع وإدارة حوادث النظام"
                    : "Track and manage system incidents"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidents?.map((incident) => (
                    <div 
                      key={incident.id} 
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(incident.severity)}`} />
                        <div>
                          <h4 className="font-medium">{incident.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {incident.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(incident.detectedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {incident.status === "open" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateIncidentMutation.mutate({ 
                              id: incident.id, 
                              status: "investigating" 
                            })}
                          >
                            {isArabic ? "التحقيق" : "Investigate"}
                          </Button>
                        )}
                        {incident.status === "investigating" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateIncidentMutation.mutate({ 
                              id: incident.id, 
                              status: "resolved" 
                            })}
                          >
                            {isArabic ? "حل" : "Resolve"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!incidents || incidents.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>{isArabic ? "لا توجد حوادث نشطة" : "No active incidents"}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "سياسات الحوكمة" : "Governance Policies"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? "إدارة سياسات النظام والعتبات"
                    : "Manage system policies and thresholds"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policies?.map((policy) => {
                    const policyValue = policy.policyValue as { value?: number; enabled?: boolean } | null;
                    return (
                      <div 
                        key={policy.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{policy.policyName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {policy.description}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {policy.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          {policyValue?.value !== undefined && (
                            <Input
                              type="number"
                              className="w-24"
                              defaultValue={policyValue.value}
                              onBlur={(e) => {
                                const newValue = Number(e.target.value);
                                if (newValue !== policyValue.value) {
                                  updatePolicyMutation.mutate({
                                    policyKey: policy.policyKey,
                                    policyValue: { value: newValue }
                                  });
                                }
                              }}
                            />
                          )}
                          {policyValue?.enabled !== undefined && (
                            <Button
                              variant={policyValue.enabled ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                updatePolicyMutation.mutate({
                                  policyKey: policy.policyKey,
                                  policyValue: { enabled: !policyValue.enabled }
                                });
                              }}
                            >
                              {policyValue.enabled 
                                ? (isArabic ? "مفعل" : "Enabled")
                                : (isArabic ? "معطل" : "Disabled")}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "سجل التدقيق" : "Audit Log"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? "تتبع جميع إجراءات المسؤول"
                    : "Track all admin actions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditLog?.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="flex items-center justify-between p-3 border rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{entry.actionCategory}</Badge>
                        <span className="font-medium">{entry.action}</span>
                        <span className="text-muted-foreground">
                          {entry.targetType}: {entry.targetId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{entry.userName || `User ${entry.userId}`}</span>
                        <span>•</span>
                        <span>{new Date(entry.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {(!auditLog || auditLog.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2" />
                      <p>{isArabic ? "لا توجد سجلات تدقيق" : "No audit log entries"}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
