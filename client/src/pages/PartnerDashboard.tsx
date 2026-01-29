/**
 * Partner Dashboard
 * Dashboard for partner organizations to submit data and track contributions
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
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock,
  AlertTriangle,
  BarChart3,
  History,
  Plus
} from "lucide-react";

export default function PartnerDashboard() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [activeTab, setActiveTab] = useState("overview");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [newSubmission, setNewSubmission] = useState({
    contractId: "",
    title: "",
    description: "",
    periodStart: "",
    periodEnd: "",
    geoScope: "national" as "national" | "governorate" | "district" | "locality"
  });

  // Queries
  const { data: contracts } = trpc.partnerEngine.getContracts.useQuery();
  const { data: submissions, refetch: refetchSubmissions } = trpc.partnerEngine.getMySubmissions.useQuery({ limit: 50 });
  const { data: moderationStats } = trpc.partnerEngine.getModerationStats.useQuery();

  // Mutations
  const submitDataMutation = trpc.partnerEngine.submitData.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم تقديم البيانات بنجاح" : "Data submitted successfully");
      setShowSubmitDialog(false);
      setNewSubmission({
        contractId: "",
        title: "",
        description: "",
        periodStart: "",
        periodEnd: "",
        geoScope: "national"
      });
      refetchSubmissions();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Calculate stats
  const pendingCount = submissions?.filter((s: { status: string }) => s.status === "pending" || s.status === "under_review").length || 0;
  const approvedCount = submissions?.filter((s: { status: string }) => s.status === "approved").length || 0;
  const rejectedCount = submissions?.filter((s: { status: string }) => s.status === "rejected").length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="outline">{isArabic ? "مسودة" : "Draft"}</Badge>;
      case "validating": return <Badge className="bg-blue-500">{isArabic ? "قيد التحقق" : "Validating"}</Badge>;
      case "pending_review": return <Badge className="bg-yellow-500">{isArabic ? "قيد المراجعة" : "Pending Review"}</Badge>;
      case "approved": return <Badge className="bg-green-500">{isArabic ? "موافق" : "Approved"}</Badge>;
      case "published": return <Badge className="bg-green-600">{isArabic ? "منشور" : "Published"}</Badge>;
      case "rejected": return <Badge className="bg-red-500">{isArabic ? "مرفوض" : "Rejected"}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isArabic ? "لوحة تحكم الشريك" : "Partner Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isArabic 
                ? "إدارة تقديمات البيانات وتتبع المساهمات"
                : "Manage data submissions and track contributions"}
            </p>
          </div>
          <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {isArabic ? "تقديم بيانات جديدة" : "Submit New Data"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{isArabic ? "تقديم بيانات جديدة" : "Submit New Data"}</DialogTitle>
                <DialogDescription>
                  {isArabic 
                    ? "اختر عقد البيانات وقدم مساهمتك"
                    : "Select a data contract and submit your contribution"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Select
                  value={newSubmission.contractId}
                  onValueChange={(v) => setNewSubmission({ ...newSubmission, contractId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isArabic ? "اختر عقد البيانات" : "Select data contract"} />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts?.map((contract) => (
                      <SelectItem key={contract.contractId} value={contract.contractId}>
                        {contract.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder={isArabic ? "عنوان التقديم" : "Submission title"}
                  value={newSubmission.title}
                  onChange={(e) => setNewSubmission({ ...newSubmission, title: e.target.value })}
                />
                <Textarea
                  placeholder={isArabic ? "وصف البيانات" : "Data description"}
                  value={newSubmission.description}
                  onChange={(e) => setNewSubmission({ ...newSubmission, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      {isArabic ? "بداية الفترة" : "Period Start"}
                    </label>
                    <Input
                      type="date"
                      value={newSubmission.periodStart}
                      onChange={(e) => setNewSubmission({ ...newSubmission, periodStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      {isArabic ? "نهاية الفترة" : "Period End"}
                    </label>
                    <Input
                      type="date"
                      value={newSubmission.periodEnd}
                      onChange={(e) => setNewSubmission({ ...newSubmission, periodEnd: e.target.value })}
                    />
                  </div>
                </div>
                <Select
                  value={newSubmission.geoScope}
                  onValueChange={(v) => setNewSubmission({ ...newSubmission, geoScope: v as typeof newSubmission.geoScope })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isArabic ? "النطاق الجغرافي" : "Geographic Scope"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">{isArabic ? "وطني" : "National"}</SelectItem>
                    <SelectItem value="governorate">{isArabic ? "محافظة" : "Governorate"}</SelectItem>
                    <SelectItem value="district">{isArabic ? "مديرية" : "District"}</SelectItem>
                    <SelectItem value="locality">{isArabic ? "محلي" : "Locality"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
                <Button 
                  onClick={() => submitDataMutation.mutate({
                    contractId: parseInt(newSubmission.contractId) || 1,
                    title: newSubmission.title,
                    description: newSubmission.description,
                    dataType: "report" as const,
                    sourceDescription: `Period: ${newSubmission.periodStart} to ${newSubmission.periodEnd}, Scope: ${newSubmission.geoScope}`
                  })}
                  disabled={!newSubmission.contractId || !newSubmission.title || !newSubmission.periodStart || !newSubmission.periodEnd}
                >
                  {isArabic ? "تقديم" : "Submit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "إجمالي التقديمات" : "Total Submissions"}
                  </p>
                  <p className="text-2xl font-bold">{submissions?.length || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
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
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "موافق عليها" : "Approved"}
                  </p>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "مرفوضة" : "Rejected"}
                  </p>
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              {isArabic ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="submissions">
              <Upload className="w-4 h-4 mr-2" />
              {isArabic ? "التقديمات" : "Submissions"}
            </TabsTrigger>
            <TabsTrigger value="contracts">
              <FileText className="w-4 h-4 mr-2" />
              {isArabic ? "العقود المتاحة" : "Available Contracts"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "النشاط الأخير" : "Recent Activity"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {submissions?.slice(0, 5).map((submission: { id: number; title: string; status: string; createdAt: Date }) => (
                      <div key={submission.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{submission.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>
                    ))}
                    {(!submissions || submissions.length === 0) && (
                      <p className="text-center text-muted-foreground py-4">
                        {isArabic ? "لا توجد تقديمات حتى الآن" : "No submissions yet"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "إحصائيات الحالة" : "Status Statistics"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moderationStats?.byStatus && Object.entries(moderationStats.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{status.replace(/_/g, " ")}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "تقديماتي" : "My Submissions"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? "عرض جميع تقديمات البيانات الخاصة بك"
                    : "View all your data submissions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions?.map((submission: { id: number; title: string; description?: string | null; status: string; submittedAt: Date }) => (
                    <div 
                      key={submission.id} 
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{submission.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {submission.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(submission.status)}
                          <span className="text-xs text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <History className="w-4 h-4 mr-2" />
                        {isArabic ? "التفاصيل" : "Details"}
                      </Button>
                    </div>
                  ))}
                  {(!submissions || submissions.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Upload className="w-12 h-12 mx-auto mb-2" />
                      <p>{isArabic ? "لا توجد تقديمات حتى الآن" : "No submissions yet"}</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => setShowSubmitDialog(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {isArabic ? "تقديم بيانات جديدة" : "Submit New Data"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "عقود البيانات المتاحة" : "Available Data Contracts"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? "اختر عقدًا لتقديم البيانات"
                    : "Select a contract to submit data"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contracts?.map((contract) => (
                    <div 
                      key={contract.id} 
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{contract.nameEn}</h4>
                        {contract.nameAr && (
                          <p className="text-sm text-muted-foreground">{contract.nameAr}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{contract.datasetFamily}</Badge>
                          <Badge variant="outline">{contract.frequency}</Badge>
                          <Badge 
                            className={
                              contract.privacyClassification === "public" 
                                ? "bg-green-500" 
                                : contract.privacyClassification === "restricted"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }
                          >
                            {contract.privacyClassification}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          setNewSubmission({ ...newSubmission, contractId: contract.contractId });
                          setShowSubmitDialog(true);
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isArabic ? "تقديم" : "Submit"}
                      </Button>
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
