/**
 * AI-Powered Annotation Analytics Dashboard
 * 
 * World-class analytics featuring:
 * - Real-time trend detection
 * - Sentiment analysis visualization
 * - Contributor reputation leaderboard
 * - Issue detection and tracking
 * - Most-discussed data points
 * - Quality metrics dashboard
 */

import { useState } from "react";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  AlertTriangle,
  BarChart3,
  Star,
  ThumbsUp,
  Clock,
  Globe,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface AnnotationAnalyticsProps {
  language?: "en" | "ar";
  params?: Record<string, string | undefined>;
}

// Simulated data
const analyticsData = {
  totalAnnotations: 1247,
  annotationsThisWeek: 89,
  annotationsThisMonth: 312,
  averageQualityScore: 78.5,
  sentimentDistribution: {
    positive: 234,
    negative: 412,
    neutral: 489,
    mixed: 112,
    averageScore: -0.18,
  },
  qualityMetrics: {
    averageLength: 187,
    averageCitations: 1.4,
    responseRate: 0.73,
    resolutionRate: 0.68,
    expertParticipationRate: 0.42,
    bilingualCoverage: 0.89,
    timeToFirstResponse: 4.2,
  },
};

const topContributors = [
  {
    userId: "user_1",
    userName: "Dr. Ahmed Al-Rashid",
    userNameAr: "د. أحمد الرشيد",
    organization: "Central Bank of Yemen - Aden",
    annotationCount: 156,
    upvotesReceived: 892,
    reputationScore: 9850,
    reputationTier: "expert" as const,
    specializations: ["Monetary Policy", "Exchange Rates"],
  },
  {
    userId: "user_2",
    userName: "Sarah Hassan",
    userNameAr: "سارة حسن",
    organization: "World Bank Yemen Office",
    annotationCount: 98,
    upvotesReceived: 567,
    reputationScore: 7420,
    reputationTier: "expert" as const,
    specializations: ["GDP Analysis", "Poverty Metrics"],
  },
  {
    userId: "user_3",
    userName: "Mohammed Al-Sana'ani",
    userNameAr: "محمد الصنعاني",
    organization: "Sana'a Center",
    annotationCount: 87,
    upvotesReceived: 423,
    reputationScore: 5890,
    reputationTier: "trusted" as const,
    specializations: ["Conflict Economy", "Political Economy"],
  },
  {
    userId: "user_4",
    userName: "Fatima Al-Aden",
    userNameAr: "فاطمة العدني",
    organization: "UNDP Yemen",
    annotationCount: 72,
    upvotesReceived: 356,
    reputationScore: 4560,
    reputationTier: "trusted" as const,
    specializations: ["Humanitarian Economy", "Food Security"],
  },
  {
    userId: "user_5",
    userName: "Ali Nasser",
    userNameAr: "علي ناصر",
    organization: "Independent Researcher",
    annotationCount: 65,
    upvotesReceived: 298,
    reputationScore: 3890,
    reputationTier: "contributor" as const,
    specializations: ["Energy Sector", "Fuel Prices"],
  },
];

const trendingTopics = [
  { topic: "Saudi Deposit", topicAr: "الوديعة السعودية", mentionCount: 89, growthRate: 156, sentiment: "mixed" },
  { topic: "Fuel Crisis", topicAr: "أزمة الوقود", mentionCount: 67, growthRate: 89, sentiment: "negative" },
  { topic: "Remittance Flows", topicAr: "تدفقات التحويلات", mentionCount: 54, growthRate: 45, sentiment: "positive" },
  { topic: "Port Revenue", topicAr: "إيرادات الموانئ", mentionCount: 43, growthRate: 34, sentiment: "neutral" },
  { topic: "Humanitarian Funding", topicAr: "التمويل الإنساني", mentionCount: 38, growthRate: 67, sentiment: "negative" },
];

const detectedIssues = [
  {
    id: "issue_1",
    type: "data_quality",
    severity: "high",
    title: "Exchange Rate Data Discrepancy",
    titleAr: "تناقض في بيانات سعر الصرف",
    reportedBy: 3,
    status: "investigating",
  },
  {
    id: "issue_2",
    type: "methodology",
    severity: "medium",
    title: "GDP Calculation Methodology Unclear",
    titleAr: "منهجية حساب الناتج المحلي غير واضحة",
    reportedBy: 2,
    status: "open",
  },
  {
    id: "issue_3",
    type: "outdated",
    severity: "low",
    title: "Banking Sector Data Needs Update",
    titleAr: "بيانات القطاع المصرفي تحتاج تحديث",
    reportedBy: 1,
    status: "open",
  },
];

const mostDiscussedDataPoints = [
  {
    indicator: "Exchange Rate (Aden)",
    indicatorAr: "سعر الصرف (عدن)",
    value: "1,620 YER/USD",
    annotationCount: 47,
    controversyScore: 0.72,
  },
  {
    indicator: "GDP Estimate 2025",
    indicatorAr: "تقدير الناتج المحلي 2025",
    value: "$21.8B",
    annotationCount: 38,
    controversyScore: 0.58,
  },
  {
    indicator: "Inflation Rate (Sana'a)",
    indicatorAr: "معدل التضخم (صنعاء)",
    value: "28.5%",
    annotationCount: 31,
    controversyScore: 0.45,
  },
];

const tierColors = {
  expert: "bg-yellow-500",
  trusted: "bg-blue-500",
  contributor: "bg-green-500",
  newcomer: "bg-gray-500",
};

const tierLabels = {
  expert: { en: "Expert", ar: "خبير" },
  trusted: { en: "Trusted", ar: "موثوق" },
  contributor: { en: "Contributor", ar: "مساهم" },
  newcomer: { en: "Newcomer", ar: "جديد" },
};

const severityColors = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

const sentimentColors = {
  positive: "text-green-500",
  negative: "text-red-500",
  neutral: "text-gray-500",
  mixed: "text-yellow-500",
};

export default function AnnotationAnalytics({ language = "en" }: AnnotationAnalyticsProps = {}) {
  const [timeRange, setTimeRange] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRTL = language === "ar";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const t = (en: string, ar: string) => (isRTL ? ar : en);

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {t("Annotation Analytics", "تحليلات التعليقات")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t(
                "AI-powered insights from community annotations",
                "رؤى مدعومة بالذكاء الاصطناعي من تعليقات المجتمع"
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t("Last 7 days", "آخر 7 أيام")}</SelectItem>
                <SelectItem value="30d">{t("Last 30 days", "آخر 30 يوم")}</SelectItem>
                <SelectItem value="90d">{t("Last 90 days", "آخر 90 يوم")}</SelectItem>
                <SelectItem value="1y">{t("Last year", "السنة الماضية")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {t("Refresh", "تحديث")}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t("Export", "تصدير")}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Total Annotations", "إجمالي التعليقات")}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalAnnotations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{analyticsData.annotationsThisWeek} {t("this week", "هذا الأسبوع")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Quality Score", "درجة الجودة")}
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.averageQualityScore}%</div>
              <Progress value={analyticsData.averageQualityScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Expert Participation", "مشاركة الخبراء")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(analyticsData.qualityMetrics.expertParticipationRate * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {t("of discussions", "من النقاشات")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Issues Detected", "المشكلات المكتشفة")}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{detectedIssues.length}</div>
              <p className="text-xs text-muted-foreground">
                {detectedIssues.filter(i => i.status === "open").length} {t("open", "مفتوحة")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t("Overview", "نظرة عامة")}</TabsTrigger>
            <TabsTrigger value="contributors">{t("Contributors", "المساهمون")}</TabsTrigger>
            <TabsTrigger value="trends">{t("Trends", "الاتجاهات")}</TabsTrigger>
            <TabsTrigger value="issues">{t("Issues", "المشكلات")}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Sentiment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("Sentiment Distribution", "توزيع المشاعر")}</CardTitle>
                  <CardDescription>
                    {t("AI-analyzed sentiment of annotations", "تحليل المشاعر بالذكاء الاصطناعي")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-green-500">{t("Positive", "إيجابي")}</span>
                      <span className="font-medium">{analyticsData.sentimentDistribution.positive}</span>
                    </div>
                    <Progress value={(analyticsData.sentimentDistribution.positive / analyticsData.totalAnnotations) * 100} className="bg-green-100" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-red-500">{t("Negative", "سلبي")}</span>
                      <span className="font-medium">{analyticsData.sentimentDistribution.negative}</span>
                    </div>
                    <Progress value={(analyticsData.sentimentDistribution.negative / analyticsData.totalAnnotations) * 100} className="bg-red-100" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">{t("Neutral", "محايد")}</span>
                      <span className="font-medium">{analyticsData.sentimentDistribution.neutral}</span>
                    </div>
                    <Progress value={(analyticsData.sentimentDistribution.neutral / analyticsData.totalAnnotations) * 100} className="bg-gray-100" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-500">{t("Mixed", "مختلط")}</span>
                      <span className="font-medium">{analyticsData.sentimentDistribution.mixed}</span>
                    </div>
                    <Progress value={(analyticsData.sentimentDistribution.mixed / analyticsData.totalAnnotations) * 100} className="bg-yellow-100" />
                  </div>
                </CardContent>
              </Card>

              {/* Most Discussed Data Points */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("Most Discussed Data Points", "أكثر نقاط البيانات نقاشاً")}</CardTitle>
                  <CardDescription>
                    {t("Data points with highest annotation activity", "نقاط البيانات ذات أعلى نشاط تعليقات")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mostDiscussedDataPoints.map((dp, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{isRTL ? dp.indicatorAr : dp.indicator}</p>
                          <p className="text-sm text-muted-foreground">{dp.value}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{dp.annotationCount} {t("annotations", "تعليق")}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("Controversy", "جدل")}: {Math.round(dp.controversyScore * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>{t("Quality Metrics", "مقاييس الجودة")}</CardTitle>
                <CardDescription>
                  {t("Platform-wide annotation quality indicators", "مؤشرات جودة التعليقات على مستوى المنصة")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{analyticsData.qualityMetrics.averageLength}</p>
                    <p className="text-sm text-muted-foreground">{t("Avg. Length (chars)", "متوسط الطول (حرف)")}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{analyticsData.qualityMetrics.averageCitations}</p>
                    <p className="text-sm text-muted-foreground">{t("Avg. Citations", "متوسط الاستشهادات")}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{Math.round(analyticsData.qualityMetrics.responseRate * 100)}%</p>
                    <p className="text-sm text-muted-foreground">{t("Response Rate", "معدل الاستجابة")}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{analyticsData.qualityMetrics.timeToFirstResponse}h</p>
                    <p className="text-sm text-muted-foreground">{t("Avg. Response Time", "متوسط وقت الاستجابة")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contributors Tab */}
          <TabsContent value="contributors">
            <Card>
              <CardHeader>
                <CardTitle>{t("Top Contributors", "أفضل المساهمين")}</CardTitle>
                <CardDescription>
                  {t("Ranked by reputation score", "مرتبون حسب درجة السمعة")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {topContributors.map((contributor, index) => (
                      <div
                        key={contributor.userId}
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {contributor.userName.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {isRTL ? contributor.userNameAr : contributor.userName}
                            </p>
                            <Badge className={tierColors[contributor.reputationTier]}>
                              {tierLabels[contributor.reputationTier][isRTL ? "ar" : "en"]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{contributor.organization}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contributor.specializations.map((spec, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{contributor.reputationScore.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{t("reputation", "سمعة")}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            {contributor.annotationCount}
                            <ThumbsUp className="h-3 w-3 ml-2" />
                            {contributor.upvotesReceived}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>{t("Trending Topics", "المواضيع الرائجة")}</CardTitle>
                <CardDescription>
                  {t("AI-detected trending discussions", "مواضيع رائجة مكتشفة بالذكاء الاصطناعي")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{isRTL ? topic.topicAr : topic.topic}</p>
                          <p className="text-sm text-muted-foreground">
                            {topic.mentionCount} {t("mentions", "إشارة")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={sentimentColors[topic.sentiment as keyof typeof sentimentColors]}>
                          {t(topic.sentiment, topic.sentiment === "positive" ? "إيجابي" : 
                            topic.sentiment === "negative" ? "سلبي" : 
                            topic.sentiment === "neutral" ? "محايد" : "مختلط")}
                        </Badge>
                        <div className="text-right">
                          <p className="text-green-500 font-medium">+{topic.growthRate}%</p>
                          <p className="text-xs text-muted-foreground">{t("growth", "نمو")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>{t("Detected Issues", "المشكلات المكتشفة")}</CardTitle>
                <CardDescription>
                  {t("AI-flagged data quality issues from annotations", "مشكلات جودة البيانات المكتشفة من التعليقات")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detectedIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-12 rounded-full ${severityColors[issue.severity as keyof typeof severityColors]}`} />
                        <div>
                          <p className="font-medium">{isRTL ? issue.titleAr : issue.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{issue.type.replace("_", " ")}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {issue.reportedBy} {t("reporters", "مبلغين")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={issue.status === "investigating" ? "default" : "secondary"}
                      >
                        {t(
                          issue.status === "investigating" ? "Investigating" : "Open",
                          issue.status === "investigating" ? "قيد التحقيق" : "مفتوح"
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
