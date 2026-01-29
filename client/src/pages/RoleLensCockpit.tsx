import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/useToast";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  RefreshCw,
  ChevronRight,
  Lightbulb,
  Scale,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
  Target,
  BarChart3,
  Shield,
  BookOpen,
  Bell,
  Settings,
  User,
  Building2,
  Globe,
  DollarSign,
  Heart,
  Network,
} from "lucide-react";
import { RelatedInsightsPanel } from "@/components/RelatedInsights";

// Role icons mapping
const roleIcons: Record<string, React.ReactNode> = {
  vip_president: <Building2 className="h-5 w-5" />,
  vip_finance_minister: <DollarSign className="h-5 w-5" />,
  vip_cby_governor: <Scale className="h-5 w-5" />,
  vip_humanitarian_coordinator: <Heart className="h-5 w-5" />,
  vip_donor_analyst: <Globe className="h-5 w-5" />,
};

// Role colors mapping
const roleColors: Record<string, string> = {
  vip_president: "border-l-purple-500",
  vip_finance_minister: "border-l-green-500",
  vip_cby_governor: "border-l-blue-500",
  vip_humanitarian_coordinator: "border-l-red-500",
  vip_donor_analyst: "border-l-amber-500",
};

export default function RoleLensCockpit() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [selectedRole, setSelectedRole] = useState<string>("vip_president");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch role profiles
  const { data: roleProfiles, isLoading: rolesLoading } = trpc.vipCockpit.getRoleProfiles.useQuery();

  // Fetch cockpit data for selected role
  const { data: cockpitData, isLoading: dataLoading, refetch: refetchCockpit } = trpc.vipCockpit.getCockpitData.useQuery(
    { roleCode: selectedRole },
    { enabled: !!selectedRole }
  );

  // Fetch user's watchlist
  const { data: watchlist } = trpc.vipCockpit.getWatchlist.useQuery({});

  // Fetch user's decisions
  const { data: decisions } = trpc.vipCockpit.getMyDecisions.useQuery({});

  // Fetch decision stats
  const { data: decisionStats } = trpc.vipCockpit.getDecisionStats.useQuery({});

  // Mutations
  const refreshSignals = trpc.vipCockpit.refreshSignals.useMutation({
    onSuccess: () => {
      refetchCockpit();
      toast.success(
        isArabic ? "تم التحديث" : "Refreshed",
        isArabic ? "تم تحديث البيانات بنجاح" : "Data has been refreshed successfully"
      );
    },
  });

  const generateBrief = trpc.vipCockpit.generateBrief.useMutation({
    onSuccess: () => {
      toast.success(
        isArabic ? "تم إنشاء الموجز" : "Brief Generated",
        isArabic ? "تم إنشاء الموجز بنجاح" : "Brief has been generated successfully"
      );
    },
  });

  if (rolesLoading) {
    return (
      <div className="container py-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const currentRole = roleProfiles?.find(r => r.roleCode === selectedRole);

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg bg-muted border-l-4 ${roleColors[selectedRole] || "border-l-primary"}`}>
            {roleIcons[selectedRole] || <User className="h-5 w-5" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isArabic ? currentRole?.roleNameAr || "لوحة القيادة" : currentRole?.roleName || "Command Center"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isArabic ? currentRole?.roleDescriptionAr || "" : currentRole?.roleDescription || ""}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={isArabic ? "اختر الدور" : "Select Role"} />
            </SelectTrigger>
            <SelectContent>
              {roleProfiles?.map((role) => (
                <SelectItem key={role.roleCode} value={role.roleCode}>
                  <div className="flex items-center gap-2">
                    {roleIcons[role.roleCode]}
                    <span>{isArabic ? role.roleNameAr : role.roleName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refreshSignals.mutate({ roleCode: selectedRole })}
            disabled={refreshSignals.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshSignals.isPending ? "animate-spin" : ""}`} />
            {isArabic ? "تحديث" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      {cockpitData && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {isArabic ? "آخر تحديث:" : "Last updated:"}{" "}
          {new Date(cockpitData.lastUpdated).toLocaleString(isArabic ? "ar-YE" : "en-US")}
        </div>
      )}

      {/* Main Content */}
      {dataLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : cockpitData ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">{isArabic ? "نظرة عامة" : "Overview"}</TabsTrigger>
            <TabsTrigger value="analysis">{isArabic ? "التحليل" : "Analysis"}</TabsTrigger>
            <TabsTrigger value="options">{isArabic ? "الخيارات" : "Options"}</TabsTrigger>
            <TabsTrigger value="watchlist">{isArabic ? "المراقبة" : "Watchlist"}</TabsTrigger>
            <TabsTrigger value="journal">{isArabic ? "سجل القرارات" : "Journal"}</TabsTrigger>
            <TabsTrigger value="related">
              <Network className="h-4 w-4 mr-1" />
              {isArabic ? "ذات صلة" : "Related"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today in 60 Seconds */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-primary" />
                    {isArabic ? "اليوم في 60 ثانية" : "Today in 60 Seconds"}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? "أهم الإشارات التي تحتاج انتباهك" : "Top signals requiring your attention"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cockpitData.signals.length > 0 ? (
                    <div className="space-y-3">
                      {cockpitData.signals.slice(0, 5).map((signal, index) => (
                        <div key={signal.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                            <div>
                              <p className="font-medium text-sm">{isArabic ? signal.indicatorAr : signal.indicator}</p>
                              <p className="text-xs text-muted-foreground">
                                {signal.value.toLocaleString()} {signal.unit}
                              </p>
                            </div>
                          </div>
                          <Badge variant={signal.status === "critical" ? "destructive" : signal.status === "warning" ? "secondary" : "outline"}>
                            {signal.trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : signal.trend === "down" ? <TrendingDown className="h-3 w-3 mr-1" /> : <Minus className="h-3 w-3 mr-1" />}
                            {signal.changePercent > 0 ? "+" : ""}{signal.changePercent.toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      {isArabic ? "لا توجد إشارات متاحة" : "No signals available"}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Confidence & Gaps */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-green-500" />
                    {isArabic ? "الثقة والفجوات" : "Confidence & Gaps"}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? "جودة البيانات والتغطية" : "Data quality and coverage"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{isArabic ? "التغطية الكلية" : "Overall Coverage"}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${cockpitData.confidence.overallCoverage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{cockpitData.confidence.overallCoverage}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{isArabic ? "حداثة البيانات" : "Data Freshness"}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${cockpitData.confidence.dataFreshness}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{cockpitData.confidence.dataFreshness}%</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-amber-500">{cockpitData.confidence.contradictionCount}</p>
                        <p className="text-xs text-muted-foreground">{isArabic ? "تناقضات" : "Contradictions"}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-red-500">{cockpitData.confidence.gapCount}</p>
                        <p className="text-xs text-muted-foreground">{isArabic ? "فجوات" : "Gaps"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* What Changed */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  {isArabic ? "ما الذي تغير" : "What Changed"}
                </CardTitle>
                <CardDescription>
                  {isArabic ? "التغييرات الرئيسية منذ آخر تحديث" : "Key changes since last update"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cockpitData.changes.length > 0 ? (
                  <div className="space-y-3">
                    {cockpitData.changes.map((change) => (
                      <div key={change.id} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{isArabic ? change.indicatorAr : change.indicator}</span>
                          <Badge variant={change.significance === "high" ? "destructive" : change.significance === "medium" ? "secondary" : "outline"}>
                            {change.significance === "high" ? (isArabic ? "عالي" : "High") : change.significance === "medium" ? (isArabic ? "متوسط" : "Medium") : (isArabic ? "منخفض" : "Low")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">{isArabic ? "السابق:" : "Previous:"}</span>
                            <span>{change.previousValue.toLocaleString()}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">{isArabic ? "الحالي:" : "Current:"}</span>
                            <span className="font-medium">{change.currentValue.toLocaleString()}</span>
                          </div>
                          <Badge variant={change.deltaPercent > 0 ? "default" : "destructive"}>
                            {change.deltaPercent > 0 ? "+" : ""}{change.deltaPercent.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    {isArabic ? "لا توجد تغييرات ملحوظة" : "No notable changes"}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  {isArabic ? "لماذا تغير" : "Why It Changed"}
                </CardTitle>
                <CardDescription>
                  {isArabic ? "المحركات الرئيسية وراء التغييرات" : "Key drivers behind the changes"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cockpitData.drivers.length > 0 ? (
                  <div className="space-y-4">
                    {cockpitData.drivers.map((driver) => (
                      <div key={driver.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {driver.impact === "positive" ? (
                              <ArrowUpRight className="h-5 w-5 text-green-500" />
                            ) : driver.impact === "negative" ? (
                              <ArrowDownRight className="h-5 w-5 text-red-500" />
                            ) : (
                              <Minus className="h-5 w-5 text-amber-500" />
                            )}
                            <span className="font-medium">{isArabic ? driver.factorAr : driver.factor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={driver.confidence === "high" ? "default" : driver.confidence === "medium" ? "secondary" : "outline"}>
                              {isArabic ? (driver.confidence === "high" ? "ثقة عالية" : driver.confidence === "medium" ? "ثقة متوسطة" : "ثقة منخفضة") : `${driver.confidence} confidence`}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {isArabic ? driver.explanationAr : driver.explanation}
                        </p>
                        {driver.citations.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {driver.citations.map((citation, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {citation}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    {isArabic ? "لا توجد محركات محددة" : "No drivers identified"}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Options Tab */}
          <TabsContent value="options" className="space-y-6 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-purple-500" />
                  {isArabic ? "الخيارات والمقايضات" : "Options & Trade-offs"}
                </CardTitle>
                <CardDescription>
                  {isArabic ? "خيارات السياسة المتاحة" : "Available policy options"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cockpitData.options.length > 0 ? (
                  <div className="space-y-4">
                    {cockpitData.options.map((option) => (
                      <div key={option.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium">{isArabic ? option.titleAr : option.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{option.timeframe}</Badge>
                            <Badge variant={option.confidence === "high" ? "default" : option.confidence === "medium" ? "secondary" : "outline"}>
                              {isArabic ? (option.confidence === "high" ? "ثقة عالية" : option.confidence === "medium" ? "ثقة متوسطة" : "ثقة منخفضة") : `${option.confidence} confidence`}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {isArabic ? option.mechanismAr : option.mechanism}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-green-600 mb-2">{isArabic ? "الشروط المسبقة" : "Preconditions"}</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {(isArabic ? option.preconditionsAr : option.preconditions).map((pre, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  {pre}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-red-600 mb-2">{isArabic ? "المخاطر" : "Risks"}</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {(isArabic ? option.risksAr : option.risks).map((risk, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                  {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    {isArabic ? "لا توجد خيارات متاحة" : "No options available"}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist" className="space-y-6 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-blue-500" />
                  {isArabic ? "قائمة المراقبة" : "Watchlist"}
                </CardTitle>
                <CardDescription>
                  {isArabic ? "العناصر التي تتابعها" : "Items you are tracking"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cockpitData.watchlist.length > 0 ? (
                  <div className="space-y-3">
                    {cockpitData.watchlist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Badge variant={item.status === "critical" ? "destructive" : item.status === "warning" ? "secondary" : "outline"}>
                            {item.type}
                          </Badge>
                          <div>
                            <p className="font-medium">{isArabic ? item.entityAr : item.entity}</p>
                            {item.value !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                {isArabic ? "القيمة الحالية:" : "Current:"} {item.value.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.change7d !== undefined && (
                            <Badge variant={item.change7d > 0 ? "default" : item.change7d < 0 ? "destructive" : "outline"}>
                              7d: {item.change7d > 0 ? "+" : ""}{item.change7d.toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      {isArabic ? "قائمة المراقبة فارغة" : "Your watchlist is empty"}
                    </p>
                    <Button variant="outline">
                      {isArabic ? "إضافة عناصر" : "Add Items"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decision Journal Tab */}
          <TabsContent value="journal" className="space-y-6 mt-6">
            {/* Decision Stats */}
            {decisionStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{decisionStats.totalDecisions}</p>
                      <p className="text-sm text-muted-foreground">{isArabic ? "إجمالي القرارات" : "Total Decisions"}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-500">{decisionStats.activeDecisions}</p>
                      <p className="text-sm text-muted-foreground">{isArabic ? "قرارات نشطة" : "Active"}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-500">{decisionStats.implementedDecisions}</p>
                      <p className="text-sm text-muted-foreground">{isArabic ? "تم تنفيذها" : "Implemented"}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-amber-500">{decisionStats.successRate}%</p>
                      <p className="text-sm text-muted-foreground">{isArabic ? "معدل النجاح" : "Success Rate"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Decisions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  {isArabic ? "سجل القرارات" : "Decision Journal"}
                </CardTitle>
                <CardDescription>
                  {isArabic ? "تتبع القرارات والنتائج" : "Track decisions and outcomes"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {decisions && decisions.length > 0 ? (
                  <div className="space-y-4">
                    {decisions.slice(0, 5).map((decision) => (
                      <div key={decision.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{isArabic ? decision.titleAr || decision.title : decision.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(decision.decisionDate).toLocaleDateString(isArabic ? "ar-YE" : "en-US")}
                            </p>
                          </div>
                          <Badge variant={
                            decision.status === "implemented" ? "default" :
                            decision.status === "active" ? "secondary" :
                            decision.status === "abandoned" ? "destructive" : "outline"
                          }>
                            {decision.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {isArabic ? decision.contextSummaryAr || decision.contextSummary : decision.contextSummary}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      {isArabic ? "لا توجد قرارات مسجلة بعد" : "No decisions recorded yet"}
                    </p>
                    <Button>
                      {isArabic ? "تسجيل قرار جديد" : "Log New Decision"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Related Tab */}
          <TabsContent value="related" className="space-y-6 mt-6">
            <RelatedInsightsPanel
              sourceType="entity"
              sourceId={0}
              sourceLabel={selectedRole}
              showDocuments={true}
              showEntities={true}
              showDatasets={true}
              showEvents={true}
              showContradictions={true}
              maxItems={10}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{isArabic ? "لا توجد بيانات" : "No Data"}</AlertTitle>
          <AlertDescription>
            {isArabic ? "لم يتم العثور على بيانات لهذا الدور" : "No data found for this role"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
