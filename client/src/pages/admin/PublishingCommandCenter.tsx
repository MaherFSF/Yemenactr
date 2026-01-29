/**
 * Admin Publishing Command Center
 * Manages publication templates, runs, approvals, and the 8-stage editorial pipeline
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Send,
  Eye,
  Download,
  Calendar,
  BarChart3,
  Shield,
  Loader2
} from "lucide-react";

export default function PublishingCommandCenter() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  
  // Fetch data
  const { data: templates, isLoading: templatesLoading } = trpc.publications.getTemplates.useQuery();
  const { data: dashboardSummary, isLoading: summaryLoading } = trpc.publications.getDashboardSummary.useQuery();
  const { data: runsData, isLoading: runsLoading, refetch: refetchRuns } = trpc.publications.getRuns.useQuery({
    templateCode: selectedTemplate || undefined,
    limit: 50
  });
  
  // Mutations
  const generateMutation = trpc.publications.generateRun.useMutation({
    onSuccess: (data) => {
      toast.success(isArabic ? "تم إنشاء النشر بنجاح" : "Publication run generated successfully");
      refetchRuns();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const approveMutation = trpc.publications.approveRun.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تمت الموافقة على النشر" : "Publication approved");
      refetchRuns();
      setSelectedRunId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const rejectMutation = trpc.publications.rejectRun.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم رفض النشر" : "Publication rejected");
      refetchRuns();
      setSelectedRunId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const publishMutation = trpc.publications.publishRun.useMutation({
    onSuccess: (data) => {
      toast.success(isArabic ? "تم نشر المنشور" : "Publication published");
      refetchRuns();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const getStateColor = (state: string) => {
    switch (state) {
      case "published": return "bg-green-500";
      case "approved": return "bg-blue-500";
      case "in_review": return "bg-yellow-500";
      case "rejected": return "bg-red-500";
      case "draft": return "bg-gray-500";
      default: return "bg-gray-400";
    }
  };

  const getStateLabel = (state: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      draft: { en: "Draft", ar: "مسودة" },
      in_review: { en: "In Review", ar: "قيد المراجعة" },
      approved: { en: "Approved", ar: "موافق عليه" },
      published: { en: "Published", ar: "منشور" },
      rejected: { en: "Rejected", ar: "مرفوض" },
      archived: { en: "Archived", ar: "مؤرشف" }
    };
    return isArabic ? labels[state]?.ar || state : labels[state]?.en || state;
  };

  const getPublicationTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      daily: { en: "Daily", ar: "يومي" },
      weekly: { en: "Weekly", ar: "أسبوعي" },
      monthly: { en: "Monthly", ar: "شهري" },
      quarterly: { en: "Quarterly", ar: "ربع سنوي" },
      annual: { en: "Annual", ar: "سنوي" },
      shock_note: { en: "Shock Note", ar: "مذكرة صدمة" }
    };
    return isArabic ? labels[type]?.ar || type : labels[type]?.en || type;
  };

  return (
    <div className="container py-8" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isArabic ? "مركز قيادة النشر" : "Publishing Command Center"}
        </h1>
        <p className="text-muted-foreground">
          {isArabic 
            ? "إدارة قوالب النشر والتشغيل والموافقات وخط الأنابيب التحريري"
            : "Manage publication templates, runs, approvals, and the editorial pipeline"}
        </p>
      </div>

      {/* Dashboard Summary */}
      {!summaryLoading && dashboardSummary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-2xl font-bold">{dashboardSummary.stateCounts?.draft || 0}</p>
                  <p className="text-sm text-muted-foreground">{isArabic ? "مسودات" : "Drafts"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{dashboardSummary.stateCounts?.in_review || 0}</p>
                  <p className="text-sm text-muted-foreground">{isArabic ? "قيد المراجعة" : "In Review"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{dashboardSummary.stateCounts?.approved || 0}</p>
                  <p className="text-sm text-muted-foreground">{isArabic ? "موافق عليه" : "Approved"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{dashboardSummary.stateCounts?.published || 0}</p>
                  <p className="text-sm text-muted-foreground">{isArabic ? "منشور" : "Published"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{dashboardSummary.stateCounts?.rejected || 0}</p>
                  <p className="text-sm text-muted-foreground">{isArabic ? "مرفوض" : "Rejected"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            {isArabic ? "القوالب" : "Templates"}
          </TabsTrigger>
          <TabsTrigger value="runs">
            <Play className="h-4 w-4 mr-2" />
            {isArabic ? "التشغيلات" : "Runs"}
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <Shield className="h-4 w-4 mr-2" />
            {isArabic ? "الموافقات" : "Approvals"}
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            {isArabic ? "الجدول الزمني" : "Schedule"}
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "قوالب النشر" : "Publication Templates"}</CardTitle>
              <CardDescription>
                {isArabic 
                  ? "9 تدفقات نشر مع خط أنابيب تحريري من 8 مراحل"
                  : "9 publication streams with 8-stage editorial pipeline"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates?.map((template) => (
                    <Card key={template.id} className="border">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {isArabic ? template.nameAr : template.nameEn}
                            </CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {getPublicationTypeLabel(template.publicationType)}
                            </Badge>
                          </div>
                          <Badge className={template.isActive ? "bg-green-500" : "bg-gray-500"}>
                            {template.isActive 
                              ? (isArabic ? "نشط" : "Active")
                              : (isArabic ? "غير نشط" : "Inactive")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {isArabic ? template.descriptionAr : template.descriptionEn}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary">
                            {template.sections?.length || 0} {isArabic ? "أقسام" : "sections"}
                          </Badge>
                          <Badge variant="secondary">
                            {template.requiredIndicators?.length || 0} {isArabic ? "مؤشرات" : "indicators"}
                          </Badge>
                          <Badge variant="secondary">
                            {template.evidenceThreshold}% {isArabic ? "عتبة" : "threshold"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {isArabic ? "سياسة الموافقة:" : "Approval:"} {template.approvalPolicy}
                          </span>
                          <Button 
                            size="sm"
                            onClick={() => {
                              generateMutation.mutate({ templateCode: template.templateCode });
                            }}
                            disabled={generateMutation.isPending}
                          >
                            {generateMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                            <span className="ml-1">{isArabic ? "إنشاء" : "Generate"}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Runs Tab */}
        <TabsContent value="runs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "تشغيلات النشر" : "Publication Runs"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "جميع تشغيلات النشر مع حالة خط الأنابيب" : "All publication runs with pipeline status"}
                  </CardDescription>
                </div>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={isArabic ? "تصفية حسب القالب" : "Filter by template"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{isArabic ? "الكل" : "All"}</SelectItem>
                    {templates?.map((t) => (
                      <SelectItem key={t.templateCode} value={t.templateCode}>
                        {isArabic ? t.nameAr : t.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : runsData?.runs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isArabic ? "لا توجد تشغيلات بعد" : "No runs yet"}
                </div>
              ) : (
                <div className="space-y-4">
                  {runsData?.runs.map((run) => (
                    <Card key={run.id} className="border">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getStateColor(run.approvalState || "draft")}>
                                {getStateLabel(run.approvalState || "draft")}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {run.templateCode}
                              </span>
                            </div>
                            <p className="text-sm">
                              {isArabic ? "فترة:" : "Period:"} {new Date(run.runWindowStart).toLocaleDateString()} - {new Date(run.runWindowEnd).toLocaleDateString()}
                            </p>
                            {run.confidenceSummary && (
                              <p className="text-sm text-muted-foreground">
                                {isArabic ? "تغطية الاستشهاد:" : "Citation Coverage:"} {run.confidenceSummary.citationCoverage}%
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {run.approvalState === "in_review" && (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" onClick={() => setSelectedRunId(run.id)}>
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      {isArabic ? "موافقة" : "Approve"}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>{isArabic ? "الموافقة على النشر" : "Approve Publication"}</DialogTitle>
                                      <DialogDescription>
                                        {isArabic ? "أضف ملاحظات اختيارية للموافقة" : "Add optional notes for approval"}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                      value={approvalNotes}
                                      onChange={(e) => setApprovalNotes(e.target.value)}
                                      placeholder={isArabic ? "ملاحظات..." : "Notes..."}
                                    />
                                    <DialogFooter>
                                      <Button
                                        onClick={() => {
                                          approveMutation.mutate({
                                            runId: run.id,
                                            notes: approvalNotes
                                          });
                                          setApprovalNotes("");
                                        }}
                                        disabled={approveMutation.isPending}
                                      >
                                        {approveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                        {isArabic ? "تأكيد الموافقة" : "Confirm Approval"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="destructive" onClick={() => setSelectedRunId(run.id)}>
                                      <XCircle className="h-4 w-4 mr-1" />
                                      {isArabic ? "رفض" : "Reject"}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>{isArabic ? "رفض النشر" : "Reject Publication"}</DialogTitle>
                                      <DialogDescription>
                                        {isArabic ? "يرجى تقديم سبب الرفض" : "Please provide a reason for rejection"}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                      value={rejectionNotes}
                                      onChange={(e) => setRejectionNotes(e.target.value)}
                                      placeholder={isArabic ? "سبب الرفض..." : "Reason for rejection..."}
                                      required
                                    />
                                    <DialogFooter>
                                      <Button
                                        variant="destructive"
                                        onClick={() => {
                                          if (!rejectionNotes.trim()) {
                                            toast.error(isArabic ? "يرجى تقديم سبب" : "Please provide a reason");
                                            return;
                                          }
                                          rejectMutation.mutate({
                                            runId: run.id,
                                            notes: rejectionNotes
                                          });
                                          setRejectionNotes("");
                                        }}
                                        disabled={rejectMutation.isPending}
                                      >
                                        {rejectMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                        {isArabic ? "تأكيد الرفض" : "Confirm Rejection"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                            {run.approvalState === "approved" && (
                              <Button 
                                size="sm"
                                onClick={() => publishMutation.mutate({ runId: run.id })}
                                disabled={publishMutation.isPending}
                              >
                                {publishMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                <Send className="h-4 w-4 mr-1" />
                                {isArabic ? "نشر" : "Publish"}
                              </Button>
                            )}
                            {run.approvalState === "published" && run.publicUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={run.publicUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4 mr-1" />
                                  {isArabic ? "عرض" : "View"}
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Pipeline Stages */}
                        {run.pipelineStages && run.pipelineStages.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-2">{isArabic ? "مراحل خط الأنابيب:" : "Pipeline Stages:"}</p>
                            <div className="flex flex-wrap gap-2">
                              {run.pipelineStages.map((stage, idx) => (
                                <Badge 
                                  key={idx}
                                  variant={stage.status === "passed" ? "default" : stage.status === "failed" ? "destructive" : "secondary"}
                                >
                                  {stage.stageName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "قائمة انتظار الموافقات" : "Approval Queue"}</CardTitle>
              <CardDescription>
                {isArabic ? "المنشورات التي تنتظر مراجعة المسؤول" : "Publications awaiting admin review"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {runsData?.runs.filter(r => r.approvalState === "in_review").length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>{isArabic ? "لا توجد منشورات تنتظر الموافقة" : "No publications awaiting approval"}</p>
                    </div>
                  ) : (
                    runsData?.runs.filter(r => r.approvalState === "in_review").map((run) => (
                      <Card key={run.id} className="border border-yellow-200 bg-yellow-50/50">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                <span className="font-medium">{run.templateCode}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isArabic ? "تم الإنشاء:" : "Created:"} {new Date(run.createdAt).toLocaleString()}
                              </p>
                              {run.confidenceSummary && (
                                <p className="text-sm">
                                  {isArabic ? "مستوى الثقة:" : "Confidence:"} {run.confidenceSummary.overallConfidence}
                                  {" | "}
                                  {isArabic ? "تغطية:" : "Coverage:"} {run.confidenceSummary.citationCoverage}%
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm"
                                onClick={() => approveMutation.mutate({ runId: run.id })}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {isArabic ? "موافقة" : "Approve"}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  const reason = prompt(isArabic ? "سبب الرفض:" : "Rejection reason:");
                                  if (reason) {
                                    rejectMutation.mutate({ runId: run.id, notes: reason });
                                  }
                                }}
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {isArabic ? "رفض" : "Reject"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "جدول النشر" : "Publication Schedule"}</CardTitle>
              <CardDescription>
                {isArabic ? "جداول النشر التلقائي لجميع القوالب" : "Automated publication schedules for all templates"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {templates?.filter(t => t.schedule).map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{isArabic ? template.nameAr : template.nameEn}</p>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? "جدول Cron:" : "Cron:"} <code className="bg-muted px-1 rounded">{template.schedule}</code>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getPublicationTypeLabel(template.publicationType)}</Badge>
                        <Badge className={template.isActive ? "bg-green-500" : "bg-gray-500"}>
                          {template.isActive ? (isArabic ? "نشط" : "Active") : (isArabic ? "معطل" : "Disabled")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
