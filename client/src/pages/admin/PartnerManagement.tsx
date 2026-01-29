/**
 * Admin Partner Management
 * Manage partner organizations, data contracts, and submissions
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  XCircle,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Shield,
  AlertTriangle
} from "lucide-react";

export default function PartnerManagement() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [activeTab, setActiveTab] = useState("contracts");
  const [queueFilter, setQueueFilter] = useState<string>("all");

  // Queries
  const { data: contracts } = trpc.partnerEngine.getContracts.useQuery();
  const { data: partners, refetch: refetchPartners } = trpc.partnerEngine.getPartnerOrganizations.useQuery({ limit: 50 });
  const { data: moderationQueue, refetch: refetchQueue } = trpc.partnerEngine.getModerationQueue.useQuery({
    status: queueFilter !== "all" ? queueFilter as "pending_review" | "quarantined" : undefined,
    limit: 50
  });
  const { data: moderationStats } = trpc.partnerEngine.getModerationStats.useQuery();

  // Mutations
  const updatePartnerStatusMutation = trpc.partnerEngine.updatePartnerStatus.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم تحديث حالة الشريك" : "Partner status updated");
      refetchPartners();
    }
  });

  const reviewSubmissionMutation = trpc.partnerEngine.reviewSubmission.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم مراجعة التقديم" : "Submission reviewed");
      refetchQueue();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const qaSignoffMutation = trpc.partnerEngine.qaSignoff.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم توقيع ضمان الجودة" : "QA signoff completed");
      refetchQueue();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const publishMutation = trpc.partnerEngine.publishSubmission.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم نشر البيانات" : "Data published");
      refetchQueue();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500">{isArabic ? "نشط" : "Active"}</Badge>;
      case "pending": return <Badge className="bg-yellow-500">{isArabic ? "معلق" : "Pending"}</Badge>;
      case "suspended": return <Badge className="bg-red-500">{isArabic ? "موقوف" : "Suspended"}</Badge>;
      case "expired": return <Badge className="bg-gray-500">{isArabic ? "منتهي" : "Expired"}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getQueueStatusBadge = (status: string) => {
    switch (status) {
      case "pending_review": return <Badge className="bg-yellow-500">{isArabic ? "قيد المراجعة" : "Pending Review"}</Badge>;
      case "approved_restricted": return <Badge className="bg-blue-500">{isArabic ? "موافق (مقيد)" : "Approved (Restricted)"}</Badge>;
      case "approved_public_aggregate": return <Badge className="bg-green-500">{isArabic ? "موافق (عام)" : "Approved (Public)"}</Badge>;
      case "published": return <Badge className="bg-green-600">{isArabic ? "منشور" : "Published"}</Badge>;
      case "rejected": return <Badge className="bg-red-500">{isArabic ? "مرفوض" : "Rejected"}</Badge>;
      case "quarantined": return <Badge className="bg-orange-500">{isArabic ? "محجور" : "Quarantined"}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? "إدارة الشركاء" : "Partner Management"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic 
              ? "إدارة المنظمات الشريكة وعقود البيانات والتقديمات"
              : "Manage partner organizations, data contracts, and submissions"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "عقود البيانات" : "Data Contracts"}
                  </p>
                  <p className="text-2xl font-bold">{contracts?.length || 0}</p>
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
                    {isArabic ? "الشركاء النشطون" : "Active Partners"}
                  </p>
                  <p className="text-2xl font-bold">
                    {partners?.filter(p => p.partnershipStatus === "active").length || 0}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-green-500" />
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
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "محجور" : "Quarantined"}
                  </p>
                  <p className="text-2xl font-bold">
                    {(moderationStats?.byStatus as Record<string, number>)?.quarantined || 0}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contracts">
              <FileText className="w-4 h-4 mr-2" />
              {isArabic ? "عقود البيانات" : "Data Contracts"}
            </TabsTrigger>
            <TabsTrigger value="partners">
              <Building2 className="w-4 h-4 mr-2" />
              {isArabic ? "الشركاء" : "Partners"}
            </TabsTrigger>
            <TabsTrigger value="queue">
              <Shield className="w-4 h-4 mr-2" />
              {isArabic ? "قائمة الإشراف" : "Moderation Queue"}
            </TabsTrigger>
          </TabsList>

          {/* Data Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "عقود البيانات النشطة" : "Active Data Contracts"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? "قوالب لتقديم البيانات من الشركاء"
                    : "Templates for partner data submissions"}
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
                          <Badge variant="outline">{contract.geoLevel}</Badge>
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
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        {isArabic ? "عرض" : "View"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "المنظمات الشريكة" : "Partner Organizations"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? "إدارة حالة الشراكة والوصول"
                    : "Manage partnership status and access"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partners?.map((partner) => (
                    <div 
                      key={partner.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{partner.name}</h4>
                        {partner.nameAr && (
                          <p className="text-sm text-muted-foreground">{partner.nameAr}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{partner.organizationType}</Badge>
                          {getStatusBadge(partner.partnershipStatus)}
                          <span className="text-xs text-muted-foreground">
                            {partner.totalContributions} {isArabic ? "مساهمة" : "contributions"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {partner.partnershipStatus === "pending" && (
                          <Button 
                            size="sm"
                            onClick={() => updatePartnerStatusMutation.mutate({ 
                              id: partner.id, 
                              status: "active" 
                            })}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {isArabic ? "تفعيل" : "Activate"}
                          </Button>
                        )}
                        {partner.partnershipStatus === "active" && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => updatePartnerStatusMutation.mutate({ 
                              id: partner.id, 
                              status: "suspended" 
                            })}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {isArabic ? "تعليق" : "Suspend"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!partners || partners.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="w-12 h-12 mx-auto mb-2" />
                      <p>{isArabic ? "لا توجد منظمات شريكة" : "No partner organizations"}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Queue Tab */}
          <TabsContent value="queue" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{isArabic ? "قائمة الإشراف" : "Moderation Queue"}</CardTitle>
                    <CardDescription>
                      {isArabic 
                        ? "مراجعة والموافقة على تقديمات البيانات"
                        : "Review and approve data submissions"}
                    </CardDescription>
                  </div>
                  <Select value={queueFilter} onValueChange={setQueueFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={isArabic ? "تصفية" : "Filter"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? "الكل" : "All"}</SelectItem>
                      <SelectItem value="pending_review">{isArabic ? "قيد المراجعة" : "Pending Review"}</SelectItem>
                      <SelectItem value="quarantined">{isArabic ? "محجور" : "Quarantined"}</SelectItem>
                      <SelectItem value="approved_restricted">{isArabic ? "موافق (مقيد)" : "Approved (Restricted)"}</SelectItem>
                      <SelectItem value="approved_public_aggregate">{isArabic ? "موافق (عام)" : "Approved (Public)"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderationQueue?.map((item) => (
                    <div 
                      key={item.queue.id} 
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{item.submission?.title || `Submission #${item.queue.submissionId}`}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.submission?.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {getQueueStatusBadge(item.queue.status)}
                            {item.queue.publishingLane !== "none" && (
                              <Badge variant="outline">
                                {item.queue.publishingLane === "lane_a_public" 
                                  ? (isArabic ? "مسار عام" : "Public Lane")
                                  : (isArabic ? "مسار مقيد" : "Restricted Lane")}
                              </Badge>
                            )}
                            {item.validation && (
                              <Badge variant="outline">
                                {isArabic ? "نقاط التحقق:" : "Validation Score:"} {item.validation.validationScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {item.queue.status === "pending_review" && (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => reviewSubmissionMutation.mutate({ 
                                  queueId: item.queue.id, 
                                  decision: "approve_restricted",
                                  notes: "Approved for restricted use"
                                })}
                              >
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                {isArabic ? "موافقة (مقيد)" : "Approve (Restricted)"}
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => reviewSubmissionMutation.mutate({ 
                                  queueId: item.queue.id, 
                                  decision: "approve_public",
                                  notes: "Approved for public aggregate"
                                })}
                              >
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                {isArabic ? "موافقة (عام)" : "Approve (Public)"}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => reviewSubmissionMutation.mutate({ 
                                  queueId: item.queue.id, 
                                  decision: "reject",
                                  rejectionReason: "Does not meet quality standards"
                                })}
                              >
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                {isArabic ? "رفض" : "Reject"}
                              </Button>
                            </>
                          )}
                          {item.queue.status === "approved_public_aggregate" && !item.queue.qaSignoffBy && (
                            <Button 
                              size="sm"
                              onClick={() => qaSignoffMutation.mutate({ 
                                queueId: item.queue.id,
                                notes: "QA verified"
                              })}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              {isArabic ? "توقيع ضمان الجودة" : "QA Signoff"}
                            </Button>
                          )}
                          {(item.queue.status === "approved_restricted" || 
                            (item.queue.status === "approved_public_aggregate" && item.queue.qaSignoffBy)) && (
                            <Button 
                              size="sm"
                              onClick={() => publishMutation.mutate({ queueId: item.queue.id })}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {isArabic ? "نشر" : "Publish"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!moderationQueue || moderationQueue.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>{isArabic ? "لا توجد تقديمات في قائمة الانتظار" : "No submissions in queue"}</p>
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
