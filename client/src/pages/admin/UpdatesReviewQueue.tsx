/**
 * Admin Updates Review Queue
 * 
 * Manage update ingestion, review, and publishing
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Newspaper,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  RefreshCw,
  Eye,
  Shield,
  AlertTriangle,
  FileText,
  Plus,
  BarChart3,
  Bell
} from "lucide-react";

export default function UpdatesReviewQueue() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [activeTab, setActiveTab] = useState("queue");
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showIngestDialog, setShowIngestDialog] = useState(false);
  
  // Form state for manual ingestion
  const [ingestForm, setIngestForm] = useState({
    title: "",
    summary: "",
    body: "",
    sourceUrl: "",
    sourcePublisher: "",
    publishedAt: new Date().toISOString().split("T")[0],
    language: "en" as "en" | "ar",
    updateType: "other",
  });
  
  // Queries
  const { data: queueData, isLoading: queueLoading, refetch: refetchQueue } = trpc.updates.getReviewQueue.useQuery({
    status: "queued_for_review",
    limit: 50,
  });
  
  const { data: stats } = trpc.updates.getStats.useQuery();
  const { data: notifications } = trpc.updates.getNotifications.useQuery({ limit: 10 });
  
  // Mutations
  const runPipeline = trpc.updates.runPipeline.useMutation({
    onSuccess: (data) => {
      toast.success(`Pipeline complete: ${data.overallScore}% score`);
      refetchQueue();
    },
    onError: (error) => {
      toast.error(`Pipeline failed: ${error.message}`);
    },
  });
  
  const approve = trpc.updates.approve.useMutation({
    onSuccess: () => {
      toast.success("Update approved and published");
      setSelectedUpdate(null);
      refetchQueue();
    },
    onError: (error) => {
      toast.error(`Approval failed: ${error.message}`);
    },
  });
  
  const reject = trpc.updates.reject.useMutation({
    onSuccess: () => {
      toast.success("Update rejected");
      setSelectedUpdate(null);
      setRejectReason("");
      refetchQueue();
    },
    onError: (error) => {
      toast.error(`Rejection failed: ${error.message}`);
    },
  });
  
  const ingest = trpc.updates.ingest.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Update ingested successfully");
        setShowIngestDialog(false);
        setIngestForm({
          title: "",
          summary: "",
          body: "",
          sourceUrl: "",
          sourcePublisher: "",
          publishedAt: new Date().toISOString().split("T")[0],
          language: "en",
          updateType: "other",
        });
        refetchQueue();
      } else {
        toast.error(`Ingestion failed: ${data.error}`);
      }
    },
    onError: (error) => {
      toast.error(`Ingestion failed: ${error.message}`);
    },
  });
  
  const runDailyIngestion = trpc.updates.runDailyIngestion.useMutation({
    onSuccess: (data) => {
      toast.success(`Daily ingestion complete: ${data.totalProcessed} processed, ${data.totalIngested} ingested`);
      refetchQueue();
    },
    onError: (error) => {
      toast.error(`Daily ingestion failed: ${error.message}`);
    },
  });
  
  const queue = queueData?.updates || [];
  
  const getConfidenceBadge = (grade: string) => {
    const colors: Record<string, string> = {
      "A": "bg-emerald-100 text-emerald-800",
      "B": "bg-blue-100 text-blue-800",
      "C": "bg-amber-100 text-amber-800",
      "D": "bg-red-100 text-red-800",
    };
    return colors[grade] || colors["C"];
  };
  
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "published": "bg-emerald-100 text-emerald-800",
      "queued_for_review": "bg-amber-100 text-amber-800",
      "draft": "bg-slate-100 text-slate-800",
      "rejected": "bg-red-100 text-red-800",
    };
    return colors[status] || colors["draft"];
  };
  
  return (
    <DashboardLayout>
      <div className={`space-y-6 ${isAr ? "rtl" : "ltr"}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Newspaper className="h-6 w-6" />
              {isAr ? "مراجعة التحديثات" : "Updates Review Queue"}
            </h1>
            <p className="text-muted-foreground">
              {isAr 
                ? "مراجعة ونشر التحديثات الاقتصادية"
                : "Review and publish economic updates"
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => runDailyIngestion.mutate()}
              disabled={runDailyIngestion.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${runDailyIngestion.isPending ? "animate-spin" : ""}`} />
              {isAr ? "تشغيل الاستيعاب اليومي" : "Run Daily Ingestion"}
            </Button>
            <Dialog open={showIngestDialog} onOpenChange={setShowIngestDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {isAr ? "إضافة تحديث يدوي" : "Add Manual Update"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {isAr ? "إضافة تحديث يدوي" : "Add Manual Update"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        {isAr ? "اللغة" : "Language"}
                      </label>
                      <Select
                        value={ingestForm.language}
                        onValueChange={(v) => setIngestForm({ ...ingestForm, language: v as "en" | "ar" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">العربية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        {isAr ? "النوع" : "Type"}
                      </label>
                      <Select
                        value={ingestForm.updateType}
                        onValueChange={(v) => setIngestForm({ ...ingestForm, updateType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="policy_announcement">Policy</SelectItem>
                          <SelectItem value="market_data">Market Data</SelectItem>
                          <SelectItem value="humanitarian_report">Humanitarian</SelectItem>
                          <SelectItem value="economic_indicator">Economic</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {isAr ? "العنوان" : "Title"} *
                    </label>
                    <Input
                      value={ingestForm.title}
                      onChange={(e) => setIngestForm({ ...ingestForm, title: e.target.value })}
                      placeholder={isAr ? "عنوان التحديث" : "Update title"}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {isAr ? "الملخص" : "Summary"} *
                    </label>
                    <Textarea
                      value={ingestForm.summary}
                      onChange={(e) => setIngestForm({ ...ingestForm, summary: e.target.value })}
                      placeholder={isAr ? "ملخص قصير" : "Brief summary"}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {isAr ? "المحتوى الكامل" : "Full Body"}
                    </label>
                    <Textarea
                      value={ingestForm.body}
                      onChange={(e) => setIngestForm({ ...ingestForm, body: e.target.value })}
                      placeholder={isAr ? "المحتوى الكامل (اختياري)" : "Full content (optional)"}
                      rows={5}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        {isAr ? "رابط المصدر" : "Source URL"} *
                      </label>
                      <Input
                        type="url"
                        value={ingestForm.sourceUrl}
                        onChange={(e) => setIngestForm({ ...ingestForm, sourceUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        {isAr ? "الناشر" : "Publisher"} *
                      </label>
                      <Input
                        value={ingestForm.sourcePublisher}
                        onChange={(e) => setIngestForm({ ...ingestForm, sourcePublisher: e.target.value })}
                        placeholder={isAr ? "اسم الناشر" : "Publisher name"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {isAr ? "تاريخ النشر" : "Published Date"} *
                    </label>
                    <Input
                      type="date"
                      value={ingestForm.publishedAt}
                      onChange={(e) => setIngestForm({ ...ingestForm, publishedAt: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowIngestDialog(false)}>
                    {isAr ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    onClick={() => ingest.mutate(ingestForm)}
                    disabled={ingest.isPending || !ingestForm.title || !ingestForm.summary || !ingestForm.sourceUrl || !ingestForm.sourcePublisher}
                  >
                    {ingest.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {isAr ? "إضافة" : "Add Update"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats?.totalUpdates || 0}</div>
              <p className="text-xs text-muted-foreground">
                {isAr ? "إجمالي التحديثات" : "Total Updates"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-emerald-600">{stats?.published || 0}</div>
              <p className="text-xs text-muted-foreground">
                {isAr ? "منشور" : "Published"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">{stats?.queued || 0}</div>
              <p className="text-xs text-muted-foreground">
                {isAr ? "في الانتظار" : "Queued"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</div>
              <p className="text-xs text-muted-foreground">
                {isAr ? "مرفوض" : "Rejected"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats?.avgScore || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {isAr ? "متوسط الجودة" : "Avg Quality"}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {isAr ? "قائمة المراجعة" : "Review Queue"}
              {queue.length > 0 && (
                <Badge variant="secondary" className="ml-1">{queue.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {isAr ? "بوابات النشر" : "Publishing Gates"}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {isAr ? "الإشعارات" : "Notifications"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="queue" className="mt-6">
            {queueLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : queue.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isAr ? "لا توجد تحديثات في الانتظار" : "No Updates Pending"}
                  </h3>
                  <p className="text-muted-foreground">
                    {isAr 
                      ? "جميع التحديثات تمت مراجعتها"
                      : "All updates have been reviewed"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {queue.map((update) => (
                  <Card key={update.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusBadge(update.status)}>
                              {update.status.replace(/_/g, " ")}
                            </Badge>
                            <Badge className={getConfidenceBadge(update.confidenceGrade || "C")}>
                              Grade {update.confidenceGrade}
                            </Badge>
                            <Badge variant="outline">
                              {update.updateType?.replace(/_/g, " ") || "Update"}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg mb-1">
                            {isAr ? update.titleAr : update.titleEn}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {isAr ? update.summaryAr : update.summaryEn}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{update.sourcePublisher}</span>
                            <span>
                              {update.publishedAt 
                                ? new Date(update.publishedAt).toLocaleDateString()
                                : "—"
                              }
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runPipeline.mutate({ updateItemId: update.id })}
                            disabled={runPipeline.isPending}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            {isAr ? "تشغيل البوابات" : "Run Pipeline"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approve.mutate({ updateItemId: update.id })}
                            disabled={approve.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {isAr ? "موافقة" : "Approve"}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <XCircle className="h-4 w-4 mr-1" />
                                {isAr ? "رفض" : "Reject"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {isAr ? "رفض التحديث" : "Reject Update"}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <label className="text-sm font-medium">
                                  {isAr ? "سبب الرفض" : "Rejection Reason"}
                                </label>
                                <Textarea
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  placeholder={isAr ? "اشرح سبب الرفض..." : "Explain why this update is being rejected..."}
                                  rows={4}
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    reject.mutate({ 
                                      updateItemId: update.id, 
                                      reason: rejectReason 
                                    });
                                  }}
                                  disabled={reject.isPending || !rejectReason}
                                >
                                  {isAr ? "تأكيد الرفض" : "Confirm Rejection"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pipeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isAr ? "بوابات النشر الستة" : "6-Gate Publishing Pipeline"}
                </CardTitle>
                <CardDescription>
                  {isAr 
                    ? "كل تحديث يمر عبر 6 بوابات جودة قبل النشر"
                    : "Every update passes through 6 quality gates before publishing"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Evidence Gate", icon: Shield, rate: stats?.gatePassRates?.["Evidence Gate"] || 85 },
                    { name: "Source Gate", icon: FileText, rate: stats?.gatePassRates?.["Source Gate"] || 90 },
                    { name: "Translation Gate", icon: FileText, rate: stats?.gatePassRates?.["Translation Gate"] || 75 },
                    { name: "Sensitivity Gate", icon: AlertTriangle, rate: stats?.gatePassRates?.["Sensitivity Gate"] || 80 },
                    { name: "Contradiction Gate", icon: AlertTriangle, rate: stats?.gatePassRates?.["Contradiction Gate"] || 95 },
                    { name: "Quality Gate", icon: BarChart3, rate: stats?.gatePassRates?.["Quality Gate"] || 70 },
                  ].map((gate) => (
                    <Card key={gate.name}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${gate.rate >= 80 ? "bg-emerald-100" : gate.rate >= 60 ? "bg-amber-100" : "bg-red-100"}`}>
                            <gate.icon className={`h-5 w-5 ${gate.rate >= 80 ? "text-emerald-600" : gate.rate >= 60 ? "text-amber-600" : "text-red-600"}`} />
                          </div>
                          <div>
                            <p className="font-medium">{gate.name}</p>
                            <p className="text-2xl font-bold">{gate.rate}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isAr ? "إشعارات التحديثات" : "Update Notifications"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications && notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">
                            {isAr ? notif.titleAr : notif.titleEn}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isAr ? notif.bodyAr : notif.bodyEn}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={notif.status === "sent" ? "default" : "secondary"}>
                          {notif.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{isAr ? "لا توجد إشعارات" : "No notifications"}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
