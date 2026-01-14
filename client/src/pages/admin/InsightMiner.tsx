import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  BarChart3,
  FileText,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Brain,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

type InsightType = "trend" | "anomaly" | "correlation" | "forecast" | "alert";
type InsightStatus = "pending" | "approved" | "rejected" | "published";

interface InsightProposal {
  id: number;
  type: InsightType;
  title: string;
  titleAr?: string;
  summary: string;
  summaryAr?: string;
  confidence: number;
  status: InsightStatus;
  indicators: string[];
  dataPoints: number;
  detectedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  suggestedStoryline?: string;
}

const mockInsights: InsightProposal[] = [
  {
    id: 1,
    type: "trend",
    title: "Exchange Rate Stabilization Detected",
    titleAr: "تم رصد استقرار سعر الصرف",
    summary: "The Aden exchange rate has shown reduced volatility over the past 30 days, with daily fluctuations decreasing from ±3% to ±0.5%. This suggests improved market confidence or intervention effectiveness.",
    summaryAr: "أظهر سعر صرف عدن تقلبات منخفضة خلال الثلاثين يومًا الماضية",
    confidence: 0.87,
    status: "pending",
    indicators: ["FX_ADEN", "FX_VOLATILITY"],
    dataPoints: 30,
    detectedAt: "2026-01-14T06:00:00Z",
    suggestedStoryline: "Yemen's parallel exchange rate shows signs of stabilization as the Aden rate holds steady at 1,620 YER/USD for the third consecutive week, potentially signaling improved market conditions or effective central bank intervention."
  },
  {
    id: 2,
    type: "anomaly",
    title: "Unusual Spike in Wheat Flour Prices",
    titleAr: "ارتفاع غير عادي في أسعار دقيق القمح",
    summary: "Wheat flour prices in Sana'a increased by 15% in the past week, significantly above the 3-month average increase of 2%. This may indicate supply chain disruptions or import restrictions.",
    summaryAr: "ارتفعت أسعار دقيق القمح في صنعاء بنسبة 15% خلال الأسبوع الماضي",
    confidence: 0.92,
    status: "pending",
    indicators: ["WHEAT_PRICE_SANAA", "FOOD_IMPORTS"],
    dataPoints: 7,
    detectedAt: "2026-01-13T18:00:00Z",
    suggestedStoryline: "Food security concerns rise as wheat flour prices in Sana'a surge 15% in one week, far exceeding normal seasonal variations and potentially impacting millions of food-insecure Yemenis."
  },
  {
    id: 3,
    type: "correlation",
    title: "Oil Export-Exchange Rate Correlation Strengthening",
    titleAr: "تعزز الارتباط بين صادرات النفط وسعر الصرف",
    summary: "Analysis shows a strengthening correlation (r=0.78) between oil export volumes and exchange rate stability over the past 6 months. This suggests oil revenues are increasingly important for currency support.",
    summaryAr: "يظهر التحليل ارتباطًا متزايدًا بين حجم صادرات النفط واستقرار سعر الصرف",
    confidence: 0.81,
    status: "approved",
    indicators: ["OIL_EXPORTS", "FX_ADEN", "FX_VOLATILITY"],
    dataPoints: 180,
    detectedAt: "2026-01-10T06:00:00Z",
    reviewedAt: "2026-01-11T14:00:00Z",
    reviewedBy: "Editor",
    suggestedStoryline: "New analysis reveals oil exports are becoming the primary driver of exchange rate stability, with a 0.78 correlation coefficient suggesting Yemen's currency fate is increasingly tied to energy sector performance."
  },
  {
    id: 4,
    type: "forecast",
    title: "Inflation Trajectory Projection",
    titleAr: "توقعات مسار التضخم",
    summary: "Based on current trends, inflation is projected to decrease from 15% to 12-13% by Q2 2026, assuming continued exchange rate stability and no major supply shocks.",
    summaryAr: "بناءً على الاتجاهات الحالية، من المتوقع أن ينخفض التضخم",
    confidence: 0.72,
    status: "rejected",
    indicators: ["INFLATION_YOY", "FX_ADEN", "FOOD_PRICES"],
    dataPoints: 365,
    detectedAt: "2026-01-08T06:00:00Z",
    reviewedAt: "2026-01-09T10:00:00Z",
    reviewedBy: "Senior Editor",
    reviewNotes: "Forecast relies on too many assumptions. Need to include conflict scenario variations before publishing.",
    suggestedStoryline: "Economic models suggest Yemen may see inflation ease to 12-13% by mid-2026, offering potential relief for households struggling with rising costs."
  },
  {
    id: 5,
    type: "alert",
    title: "Humanitarian Funding Gap Alert",
    titleAr: "تنبيه فجوة التمويل الإنساني",
    summary: "2026 humanitarian funding is tracking 35% below 2025 levels for the same period. At current pace, the funding gap could reach $1.2B by mid-year.",
    summaryAr: "تمويل 2026 الإنساني يتتبع بنسبة 35% أقل من مستويات 2025",
    confidence: 0.95,
    status: "published",
    indicators: ["HUM_FUNDING", "HUM_NEEDS"],
    dataPoints: 14,
    detectedAt: "2026-01-12T06:00:00Z",
    reviewedAt: "2026-01-12T16:00:00Z",
    reviewedBy: "Super Admin",
    suggestedStoryline: "Yemen faces a looming humanitarian crisis as 2026 funding falls 35% short of last year's pace, potentially leaving millions without critical aid if the gap is not addressed."
  }
];

const typeConfig: Record<InsightType, { label: string; color: string; icon: React.ReactNode }> = {
  trend: { label: "Trend", color: "bg-blue-500", icon: <TrendingUp className="w-4 h-4" /> },
  anomaly: { label: "Anomaly", color: "bg-orange-500", icon: <AlertTriangle className="w-4 h-4" /> },
  correlation: { label: "Correlation", color: "bg-purple-500", icon: <BarChart3 className="w-4 h-4" /> },
  forecast: { label: "Forecast", color: "bg-green-500", icon: <Zap className="w-4 h-4" /> },
  alert: { label: "Alert", color: "bg-red-500", icon: <AlertTriangle className="w-4 h-4" /> }
};

const statusConfig: Record<InsightStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending Review", color: "bg-yellow-500", icon: <Clock className="w-4 h-4" /> },
  approved: { label: "Approved", color: "bg-green-500", icon: <CheckCircle className="w-4 h-4" /> },
  rejected: { label: "Rejected", color: "bg-red-500", icon: <XCircle className="w-4 h-4" /> },
  published: { label: "Published", color: "bg-blue-500", icon: <FileText className="w-4 h-4" /> }
};

export default function InsightMiner() {
  const [selectedTab, setSelectedTab] = useState<string>("pending");
  const [selectedInsight, setSelectedInsight] = useState<InsightProposal | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [minerEnabled, setMinerEnabled] = useState(true);

  const filteredInsights = mockInsights.filter(insight => {
    if (selectedTab === "all") return true;
    return insight.status === selectedTab;
  });

  const handleReview = (insight: InsightProposal, action: "approve" | "reject") => {
    setSelectedInsight(insight);
    setReviewAction(action);
    setReviewNotes("");
    setIsReviewDialogOpen(true);
  };

  const executeReview = () => {
    if (!selectedInsight || !reviewAction) return;
    
    toast.success(`Insight "${selectedInsight.title}" has been ${reviewAction === "approve" ? "approved" : "rejected"}.`);
    setIsReviewDialogOpen(false);
    setSelectedInsight(null);
    setReviewAction(null);
  };

  const runManualMining = () => {
    toast.info("Insight mining started. New insights will appear when detected.");
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="w-8 h-8" />
              Insight Miner
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-detected trends, anomalies, and storylines for editorial review
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="miner-toggle">Auto-Mining</Label>
              <Switch
                id="miner-toggle"
                checked={minerEnabled}
                onCheckedChange={setMinerEnabled}
              />
            </div>
            <Button onClick={runManualMining}>
              <Sparkles className="w-4 h-4 mr-2" />
              Run Now
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-yellow-500 text-white">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockInsights.filter(i => i.status === "pending").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-500 text-white">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockInsights.filter(i => i.status === "approved").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-500 text-white">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockInsights.filter(i => i.status === "published").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-purple-500 text-white">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockInsights.length}</p>
                  <p className="text-xs text-muted-foreground">Total Insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mining Status */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${minerEnabled ? "bg-green-500" : "bg-gray-400"} text-white`}>
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">
                    {minerEnabled ? "Insight Miner Active" : "Insight Miner Paused"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {minerEnabled 
                      ? "Running nightly at 02:00 UTC. Last run: 6 hours ago"
                      : "Enable auto-mining to detect new insights automatically"
                    }
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Next scheduled run</p>
                <p className="font-medium">Jan 15, 2026 02:00 UTC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              <Clock className="w-4 h-4 mr-2" />
              Pending ({mockInsights.filter(i => i.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="published">
              <FileText className="w-4 h-4 mr-2" />
              Published
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="w-4 h-4 mr-2" />
              Rejected
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            <div className="space-y-4">
              {filteredInsights.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No insights found</h3>
                    <p className="text-muted-foreground">
                      {selectedTab === "pending" 
                        ? "All insights have been reviewed"
                        : "No insights in this category"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredInsights.map(insight => {
                  const type = typeConfig[insight.type];
                  const status = statusConfig[insight.status];

                  return (
                    <Card key={insight.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${type.color} text-white`}>
                                {type.icon}
                                <span className="ml-1">{type.label}</span>
                              </Badge>
                              <Badge className={`${status.color} text-white`}>
                                {status.icon}
                                <span className="ml-1">{status.label}</span>
                              </Badge>
                              <Badge variant="outline">
                                {Math.round(insight.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            {insight.titleAr && (
                              <p className="text-sm text-muted-foreground mt-1" dir="rtl">
                                {insight.titleAr}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{insight.summary}</p>

                        {insight.suggestedStoryline && (
                          <div className="p-4 bg-muted/50 rounded-lg mb-4">
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Suggested Storyline
                            </p>
                            <p className="text-sm italic">{insight.suggestedStoryline}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            {insight.indicators.join(", ")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Detected {new Date(insight.detectedAt).toLocaleDateString()}
                          </span>
                          <span>{insight.dataPoints} data points</span>
                        </div>

                        {insight.reviewNotes && (
                          <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg mb-4 text-sm">
                            <p className="font-medium text-red-700 dark:text-red-300">Review Notes:</p>
                            <p className="text-red-600 dark:text-red-400">{insight.reviewNotes}</p>
                          </div>
                        )}

                        {insight.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReview(insight, "approve")}
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReview(insight, "reject")}
                            >
                              <ThumbsDown className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View Data
                            </Button>
                          </div>
                        )}

                        {insight.reviewedAt && (
                          <p className="text-xs text-muted-foreground mt-4">
                            Reviewed by {insight.reviewedBy} on {new Date(insight.reviewedAt).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === "approve" ? "Approve Insight" : "Reject Insight"}
              </DialogTitle>
              <DialogDescription>
                {reviewAction === "approve" 
                  ? "This insight will be marked as approved and can be used in reports."
                  : "This insight will be rejected. Please provide feedback for improvement."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Insight</Label>
                <p className="text-sm text-muted-foreground">{selectedInsight?.title}</p>
              </div>
              <div>
                <Label htmlFor="notes">
                  {reviewAction === "reject" ? "Rejection Reason (required)" : "Notes (optional)"}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={reviewAction === "reject" 
                    ? "Please explain why this insight is being rejected..."
                    : "Add any notes..."
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant={reviewAction === "reject" ? "destructive" : "default"}
                onClick={executeReview}
                disabled={reviewAction === "reject" && !reviewNotes}
              >
                {reviewAction === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
