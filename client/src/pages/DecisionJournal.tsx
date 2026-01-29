import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/useToast";
import {
  BookOpen,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  FileText,
  Calendar,
  ChevronRight,
  Edit,
  Eye,
  BarChart3,
  Lightbulb,
  Shield,
  ArrowRight,
  History,
  ListChecks,
} from "lucide-react";

export default function DecisionJournal() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [activeTab, setActiveTab] = useState("all");
  const [showNewDecision, setShowNewDecision] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<number | null>(null);

  // Form state for new decision
  const [newDecision, setNewDecision] = useState({
    title: "",
    titleAr: "",
    contextSummary: "",
    contextSummaryAr: "",
    decision: "",
    decisionAr: "",
    rationale: "",
    rationaleAr: "",
    confidenceLevel: "medium" as "high" | "medium" | "low",
    confidenceExplanation: "",
  });

  // Fetch decisions
  const { data: decisions, isLoading, refetch } = trpc.vipCockpit.getMyDecisions.useQuery({});

  // Fetch decision stats
  const { data: stats } = trpc.vipCockpit.getDecisionStats.useQuery({});

  // Fetch pending follow-ups
  const { data: pendingFollowUps } = trpc.vipCockpit.getMyPendingFollowUps.useQuery();

  // Create decision mutation
  const createDecision = trpc.vipCockpit.createDecision.useMutation({
    onSuccess: () => {
      toast.success(
        isArabic ? "تم تسجيل القرار" : "Decision Logged",
        isArabic ? "تم تسجيل القرار بنجاح" : "Decision has been logged successfully"
      );
      setShowNewDecision(false);
      setNewDecision({
        title: "",
        titleAr: "",
        contextSummary: "",
        contextSummaryAr: "",
        decision: "",
        decisionAr: "",
        rationale: "",
        rationaleAr: "",
        confidenceLevel: "medium",
        confidenceExplanation: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(
        isArabic ? "خطأ" : "Error",
        error.message
      );
    },
  });

  const handleCreateDecision = () => {
    if (!newDecision.title || !newDecision.contextSummary || !newDecision.decision || !newDecision.rationale) {
      toast.warning(
        isArabic ? "حقول مطلوبة" : "Required Fields",
        isArabic ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields"
      );
      return;
    }

    createDecision.mutate({
      roleProfileId: null,
      title: newDecision.title,
      titleAr: newDecision.titleAr || undefined,
      contextSummary: newDecision.contextSummary,
      contextSummaryAr: newDecision.contextSummaryAr || undefined,
      decision: newDecision.decision,
      decisionAr: newDecision.decisionAr || undefined,
      rationale: newDecision.rationale,
      rationaleAr: newDecision.rationaleAr || undefined,
      confidenceLevel: newDecision.confidenceLevel,
      confidenceExplanation: newDecision.confidenceExplanation || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "implemented": return "bg-green-500";
      case "active": return "bg-blue-500";
      case "abandoned": return "bg-red-500";
      case "superseded": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      draft: { en: "Draft", ar: "مسودة" },
      active: { en: "Active", ar: "نشط" },
      implemented: { en: "Implemented", ar: "تم التنفيذ" },
      abandoned: { en: "Abandoned", ar: "مهجور" },
      superseded: { en: "Superseded", ar: "تم استبداله" },
    };
    return isArabic ? labels[status]?.ar || status : labels[status]?.en || status;
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high": return "text-green-500";
      case "medium": return "text-amber-500";
      case "low": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-500" />
            {isArabic ? "سجل القرارات" : "Decision Journal"}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? "تتبع القرارات والنتائج والتعلم من التجارب" : "Track decisions, outcomes, and learn from experience"}
          </p>
        </div>
        <Dialog open={showNewDecision} onOpenChange={setShowNewDecision}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? "قرار جديد" : "New Decision"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isArabic ? "تسجيل قرار جديد" : "Log New Decision"}</DialogTitle>
              <DialogDescription>
                {isArabic ? "سجل قرارك مع السياق والمنطق للرجوع إليه لاحقاً" : "Record your decision with context and rationale for future reference"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{isArabic ? "العنوان (إنجليزي)" : "Title (English)"} *</Label>
                  <Input
                    id="title"
                    value={newDecision.title}
                    onChange={(e) => setNewDecision({ ...newDecision, title: e.target.value })}
                    placeholder={isArabic ? "عنوان القرار" : "Decision title"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleAr">{isArabic ? "العنوان (عربي)" : "Title (Arabic)"}</Label>
                  <Input
                    id="titleAr"
                    value={newDecision.titleAr}
                    onChange={(e) => setNewDecision({ ...newDecision, titleAr: e.target.value })}
                    placeholder={isArabic ? "عنوان القرار بالعربية" : "Decision title in Arabic"}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">{isArabic ? "السياق" : "Context"} *</Label>
                <Textarea
                  id="context"
                  value={newDecision.contextSummary}
                  onChange={(e) => setNewDecision({ ...newDecision, contextSummary: e.target.value })}
                  placeholder={isArabic ? "ما هو الوضع الذي أدى إلى هذا القرار؟" : "What situation led to this decision?"}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="decision">{isArabic ? "القرار" : "Decision"} *</Label>
                <Textarea
                  id="decision"
                  value={newDecision.decision}
                  onChange={(e) => setNewDecision({ ...newDecision, decision: e.target.value })}
                  placeholder={isArabic ? "ما هو القرار الذي اتخذته؟" : "What decision did you make?"}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rationale">{isArabic ? "المنطق" : "Rationale"} *</Label>
                <Textarea
                  id="rationale"
                  value={newDecision.rationale}
                  onChange={(e) => setNewDecision({ ...newDecision, rationale: e.target.value })}
                  placeholder={isArabic ? "لماذا اتخذت هذا القرار؟" : "Why did you make this decision?"}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isArabic ? "مستوى الثقة" : "Confidence Level"}</Label>
                  <Select
                    value={newDecision.confidenceLevel}
                    onValueChange={(v) => setNewDecision({ ...newDecision, confidenceLevel: v as "high" | "medium" | "low" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{isArabic ? "عالي" : "High"}</SelectItem>
                      <SelectItem value="medium">{isArabic ? "متوسط" : "Medium"}</SelectItem>
                      <SelectItem value="low">{isArabic ? "منخفض" : "Low"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confExplanation">{isArabic ? "شرح الثقة" : "Confidence Explanation"}</Label>
                  <Input
                    id="confExplanation"
                    value={newDecision.confidenceExplanation}
                    onChange={(e) => setNewDecision({ ...newDecision, confidenceExplanation: e.target.value })}
                    placeholder={isArabic ? "لماذا هذا المستوى من الثقة؟" : "Why this confidence level?"}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewDecision(false)}>
                {isArabic ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleCreateDecision} disabled={createDecision.isPending}>
                {createDecision.isPending ? (isArabic ? "جاري الحفظ..." : "Saving...") : (isArabic ? "حفظ القرار" : "Save Decision")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.totalDecisions}</p>
                <p className="text-sm text-muted-foreground">{isArabic ? "إجمالي" : "Total"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">{stats.activeDecisions}</p>
                <p className="text-sm text-muted-foreground">{isArabic ? "نشط" : "Active"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{stats.implementedDecisions}</p>
                <p className="text-sm text-muted-foreground">{isArabic ? "منفذ" : "Implemented"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">{stats.successRate}%</p>
                <p className="text-sm text-muted-foreground">{isArabic ? "نجاح" : "Success"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-500">{pendingFollowUps?.length || 0}</p>
                <p className="text-sm text-muted-foreground">{isArabic ? "متابعات" : "Follow-ups"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Decisions List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "القرارات" : "Decisions"}</CardTitle>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">{isArabic ? "الكل" : "All"}</TabsTrigger>
                  <TabsTrigger value="active">{isArabic ? "نشط" : "Active"}</TabsTrigger>
                  <TabsTrigger value="implemented">{isArabic ? "منفذ" : "Implemented"}</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : decisions && decisions.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4 pr-4">
                    {decisions
                      .filter((d) => activeTab === "all" || d.status === activeTab)
                      .map((decision) => (
                        <div
                          key={decision.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedDecision === decision.id ? "border-primary bg-muted/50" : ""
                          }`}
                          onClick={() => setSelectedDecision(decision.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {isArabic ? decision.titleAr || decision.title : decision.title}
                              </h4>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(decision.decisionDate).toLocaleDateString(isArabic ? "ar-YE" : "en-US")}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getConfidenceColor(decision.confidenceLevel || "medium")}>
                                {decision.confidenceLevel || "medium"}
                              </Badge>
                              <Badge className={getStatusColor(decision.status || "draft")}>
                                {getStatusLabel(decision.status || "draft")}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {isArabic ? decision.contextSummaryAr || decision.contextSummary : decision.contextSummary}
                          </p>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {isArabic ? "لا توجد قرارات مسجلة بعد" : "No decisions recorded yet"}
                  </p>
                  <Button onClick={() => setShowNewDecision(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isArabic ? "سجل قرارك الأول" : "Log Your First Decision"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Follow-ups */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-amber-500" />
                {isArabic ? "المتابعات المعلقة" : "Pending Follow-ups"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingFollowUps && pendingFollowUps.length > 0 ? (
                <div className="space-y-3">
                  {pendingFollowUps.slice(0, 5).map((item) => (
                    <div key={item.followUp.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {isArabic ? item.followUp.titleAr || item.followUp.title : item.followUp.title}
                        </span>
                        <Badge variant={item.followUp.priority === "high" ? "destructive" : item.followUp.priority === "medium" ? "secondary" : "outline"}>
                          {item.followUp.priority}
                        </Badge>
                      </div>
                      {item.followUp.dueDate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {isArabic ? "مستحق:" : "Due:"} {new Date(item.followUp.dueDate).toLocaleDateString(isArabic ? "ar-YE" : "en-US")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isArabic ? "لا توجد متابعات معلقة" : "No pending follow-ups"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                {isArabic ? "نصائح" : "Tips"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {isArabic ? "سجل القرارات فور اتخاذها للحفاظ على السياق" : "Log decisions immediately to preserve context"}
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {isArabic ? "راجع النتائج بانتظام للتعلم من التجارب" : "Review outcomes regularly to learn from experience"}
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {isArabic ? "استخدم المتابعات لتتبع التنفيذ" : "Use follow-ups to track implementation"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
