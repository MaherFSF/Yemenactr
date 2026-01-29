/**
 * Admin Graph Console - Knowledge Graph Governance
 * 
 * Command center for managing the knowledge graph:
 * - Link rules management
 * - Review queue for suggested links
 * - Health metrics dashboard
 * - Enrichment controls
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/useToast";
import {
  Network,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  RefreshCw,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  Database,
  TrendingUp,
  BarChart3,
  Link2,
  Zap,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

export default function GraphConsole() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <DashboardLayout>
      <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Network className="h-6 w-6 text-primary" />
              {isRTL ? "وحدة تحكم الرسم البياني" : "Graph Console"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL 
                ? "إدارة الرسم البياني المعرفي والروابط ذات الصلة"
                : "Manage knowledge graph and related insights"}
            </p>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {isRTL ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {isRTL ? "القواعد" : "Rules"}
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {isRTL ? "المراجعة" : "Review"}
            </TabsTrigger>
            <TabsTrigger value="enrichment" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {isRTL ? "الإثراء" : "Enrichment"}
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {isRTL ? "الصحة" : "Health"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>
          
          <TabsContent value="rules" className="mt-6">
            <RulesTab />
          </TabsContent>
          
          <TabsContent value="review" className="mt-6">
            <ReviewTab />
          </TabsContent>
          
          <TabsContent value="enrichment" className="mt-6">
            <EnrichmentTab />
          </TabsContent>
          
          <TabsContent value="health" className="mt-6">
            <HealthTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  const { data: healthSummary, isLoading: healthLoading } = trpc.graph.getHealthSummary.useQuery();
  const { data: metrics, isLoading: metricsLoading } = trpc.graph.getHealthMetrics.useQuery();
  
  if (healthLoading || metricsLoading) {
    return <OverviewSkeleton />;
  }
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "إجمالي الروابط" : "Total Links"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthSummary?.totalLinks ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {healthSummary?.activeLinks ?? 0} {isRTL ? "نشط" : "active"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "نسبة التغطية" : "Coverage Score"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthSummary?.coverageScore ?? 0}%</div>
            <Progress value={healthSummary?.coverageScore ?? 0} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "في انتظار المراجعة" : "Pending Review"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.pendingReviewLinks ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "روابط مقترحة" : "suggested links"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? "العناصر اليتيمة" : "Orphan Items"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics?.orphanDocuments ?? 0) + (metrics?.orphanEntities ?? 0) + (metrics?.orphanEvents ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL ? "بدون روابط" : "without links"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Link Type Distribution */}
      {metrics?.linkTypeDistribution && (
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "توزيع أنواع الروابط" : "Link Type Distribution"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(metrics.linkTypeDistribution as Record<string, number>).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm capitalize">{type.replace(/_/g, " ")}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Coverage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "تفاصيل التغطية" : "Coverage Breakdown"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{isRTL ? "الوثائق المرتبطة بالقطاعات" : "Documents linked to sectors"}</span>
                <span>{parseFloat(String(metrics?.docsLinkedToSectors ?? 0)).toFixed(1)}%</span>
              </div>
              <Progress value={parseFloat(String(metrics?.docsLinkedToSectors ?? 0))} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{isRTL ? "الكيانات ذات الروابط" : "Entities with links"}</span>
                <span>{parseFloat(String(metrics?.entitiesWithLinks ?? 0)).toFixed(1)}%</span>
              </div>
              <Progress value={parseFloat(String(metrics?.entitiesWithLinks ?? 0))} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{isRTL ? "الأحداث مع الأدلة" : "Events with evidence"}</span>
                <span>{parseFloat(String(metrics?.eventsWithEvidence ?? 0)).toFixed(1)}%</span>
              </div>
              <Progress value={parseFloat(String(metrics?.eventsWithEvidence ?? 0))} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{isRTL ? "الروابط مع الأدلة" : "Links with evidence"}</span>
                <span>{parseFloat(String(metrics?.linksWithEvidence ?? 0)).toFixed(1)}%</span>
              </div>
              <Progress value={parseFloat(String(metrics?.linksWithEvidence ?? 0))} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// RULES TAB
// ============================================================================

function RulesTab() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { toast } = useToast();
  
  const { data: rules, isLoading, refetch } = trpc.graph.getRules.useQuery();
  const toggleRule = trpc.graph.toggleRule.useMutation({
    onSuccess: () => {
      refetch();
      toast({ title: isRTL ? "تم تحديث القاعدة" : "Rule updated" });
    },
  });
  const runRule = trpc.graph.runRule.useMutation({
    onSuccess: (result) => {
      toast({
        title: isRTL ? "تم تشغيل القاعدة" : "Rule executed",
        description: `${result.linksCreated} created, ${result.linksSuggested} suggested`,
      });
    },
  });
  const seedRules = trpc.graph.seedDefaultRules.useMutation({
    onSuccess: () => {
      refetch();
      toast({ title: isRTL ? "تم إنشاء القواعد الافتراضية" : "Default rules seeded" });
    },
  });
  
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{isRTL ? "قواعد الربط" : "Link Rules"}</h2>
        <Button onClick={() => seedRules.mutate()} disabled={seedRules.isPending}>
          <RefreshCw className={`h-4 w-4 mr-2 ${seedRules.isPending ? "animate-spin" : ""}`} />
          {isRTL ? "إنشاء القواعد الافتراضية" : "Seed Default Rules"}
        </Button>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isRTL ? "القاعدة" : "Rule"}</TableHead>
              <TableHead>{isRTL ? "نوع الإخراج" : "Output Type"}</TableHead>
              <TableHead>{isRTL ? "الأولوية" : "Priority"}</TableHead>
              <TableHead>{isRTL ? "تلقائي" : "Auto-approve"}</TableHead>
              <TableHead>{isRTL ? "مفعل" : "Enabled"}</TableHead>
              <TableHead>{isRTL ? "الإجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules?.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{isRTL ? rule.nameAr : rule.nameEn}</div>
                    <div className="text-xs text-muted-foreground">{rule.ruleId}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{rule.outputLinkType}</Badge>
                </TableCell>
                <TableCell>{rule.priority}</TableCell>
                <TableCell>
                  {rule.autoApprove ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={rule.isEnabled ?? false}
                    onCheckedChange={(checked) => 
                      toggleRule.mutate({ ruleId: rule.id, isEnabled: checked })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runRule.mutate({ ruleId: rule.id })}
                    disabled={runRule.isPending}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {isRTL ? "تشغيل" : "Run"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ============================================================================
// REVIEW TAB
// ============================================================================

function ReviewTab() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { toast } = useToast();
  const [reviewNotes, setReviewNotes] = useState("");
  
  const { data: reviews, isLoading, refetch } = trpc.graph.getPendingReviews.useQuery({});
  const approveReview = trpc.graph.approveReview.useMutation({
    onSuccess: () => {
      refetch();
      toast({ title: isRTL ? "تمت الموافقة" : "Approved" });
    },
  });
  const rejectReview = trpc.graph.rejectReview.useMutation({
    onSuccess: () => {
      refetch();
      toast({ title: isRTL ? "تم الرفض" : "Rejected" });
    },
  });
  
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {isRTL ? "قائمة المراجعة" : "Review Queue"}
          <Badge variant="secondary" className="ml-2">{reviews?.length ?? 0}</Badge>
        </h2>
      </div>
      
      {reviews?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>{isRTL ? "لا توجد روابط في انتظار المراجعة" : "No links pending review"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews?.map(({ review, link }) => (
            <Card key={review.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={review.priority === "high" ? "destructive" : "secondary"}>
                        {review.priority}
                      </Badge>
                      <Badge variant="outline">{link.linkType}</Badge>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">{link.srcLabel}</span>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <span className="font-medium">{link.dstLabel}</span>
                    </div>
                    
                    {review.evidenceSummary && (
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {review.evidenceSummary}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectReview.mutate({ reviewId: review.id })}
                      disabled={rejectReview.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1 text-red-500" />
                      {isRTL ? "رفض" : "Reject"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveReview.mutate({ reviewId: review.id })}
                      disabled={approveReview.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {isRTL ? "موافقة" : "Approve"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ENRICHMENT TAB
// ============================================================================

function EnrichmentTab() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { toast } = useToast();
  
  const runBatchEnrichment = trpc.graph.runBatchEnrichment.useMutation({
    onSuccess: (result) => {
      toast({
        title: isRTL ? "اكتمل الإثراء" : "Enrichment complete",
        description: `${result.totalLinksCreated} links created, ${result.totalLinksSuggested} suggested`,
      });
    },
  });
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "الإثراء الدفعي" : "Batch Enrichment"}</CardTitle>
          <CardDescription>
            {isRTL 
              ? "تشغيل الإثراء التلقائي على المحتوى الجديد"
              : "Run automatic enrichment on new content"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="font-medium">{isRTL ? "الوثائق" : "Documents"}</div>
            </Card>
            <Card className="p-4 text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <div className="font-medium">{isRTL ? "الكيانات" : "Entities"}</div>
            </Card>
            <Card className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <div className="font-medium">{isRTL ? "الأحداث" : "Events"}</div>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="font-medium">{isRTL ? "التحديثات" : "Updates"}</div>
            </Card>
          </div>
          
          <Button
            className="w-full"
            onClick={() => runBatchEnrichment.mutate({})}
            disabled={runBatchEnrichment.isPending}
          >
            {runBatchEnrichment.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {isRTL ? "تشغيل الإثراء الدفعي" : "Run Batch Enrichment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// HEALTH TAB
// ============================================================================

function HealthTab() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { toast } = useToast();
  
  const { data: metrics, isLoading, refetch } = trpc.graph.getHealthMetrics.useQuery();
  const calculateMetrics = trpc.graph.calculateHealthMetrics.useMutation({
    onSuccess: () => {
      refetch();
      toast({ title: isRTL ? "تم تحديث المقاييس" : "Metrics updated" });
    },
  });
  
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{isRTL ? "صحة الرسم البياني" : "Graph Health"}</h2>
        <Button
          onClick={() => calculateMetrics.mutate()}
          disabled={calculateMetrics.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${calculateMetrics.isPending ? "animate-spin" : ""}`} />
          {isRTL ? "تحديث المقاييس" : "Refresh Metrics"}
        </Button>
      </div>
      
      {/* Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "مقاييس الجودة" : "Quality Metrics"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded">
              <div className="text-2xl font-bold">
                {parseFloat(String(metrics?.linksWithEvidence ?? 0)).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {isRTL ? "روابط مع أدلة" : "Links with evidence"}
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded">
              <div className="text-2xl font-bold">
                {parseFloat(String(metrics?.linksWithAnchors ?? 0)).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {isRTL ? "روابط مع مراسي" : "Links with anchors"}
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded">
              <div className="text-2xl font-bold">
                {(parseFloat(String(metrics?.averageStrengthScore ?? 0)) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {isRTL ? "متوسط القوة" : "Avg strength"}
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded">
              <div className="text-2xl font-bold">{metrics?.brokenLinks ?? 0}</div>
              <div className="text-sm text-muted-foreground">
                {isRTL ? "روابط معطلة" : "Broken links"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Orphan Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {isRTL ? "العناصر اليتيمة" : "Orphan Items"}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? "عناصر بدون روابط في الرسم البياني"
              : "Items without links in the knowledge graph"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{metrics?.orphanDocuments ?? 0}</div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? "وثائق" : "Documents"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded">
              <Building2 className="h-8 w-8 text-emerald-500" />
              <div>
                <div className="text-2xl font-bold">{metrics?.orphanEntities ?? 0}</div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? "كيانات" : "Entities"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded">
              <Calendar className="h-8 w-8 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{metrics?.orphanEvents ?? 0}</div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? "أحداث" : "Events"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Last Updated */}
      {metrics?.measuredAt && (
        <p className="text-sm text-muted-foreground text-center">
          {isRTL ? "آخر تحديث:" : "Last updated:"}{" "}
          {new Date(metrics.measuredAt).toLocaleString(isRTL ? "ar" : "en")}
        </p>
      )}
    </div>
  );
}
