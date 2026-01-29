import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/useToast";
import {
  FileText,
  Clock,
  Calendar,
  Bell,
  BellOff,
  Mail,
  LayoutDashboard,
  Download,
  Eye,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Settings,
  Plus,
  Inbox,
  Send,
} from "lucide-react";

export default function AutoBriefs() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedBrief, setSelectedBrief] = useState<number | null>(null);

  // Fetch brief templates
  const { data: templates, isLoading: templatesLoading } = trpc.vipCockpit.getBriefTemplates.useQuery({});

  // Fetch user subscriptions
  const { data: subscriptions, refetch: refetchSubscriptions } = trpc.vipCockpit.getMySubscriptions.useQuery();

  // Fetch brief history
  const { data: briefHistory, isLoading: historyLoading, refetch: refetchHistory } = trpc.vipCockpit.getBriefHistory.useQuery({});

  // Subscribe mutation
  const subscribeMutation = trpc.vipCockpit.subscribeToBrief.useMutation({
    onSuccess: () => {
      toast.success(
        isArabic ? "تم الاشتراك" : "Subscribed",
        isArabic ? "تم الاشتراك في الموجز بنجاح" : "Successfully subscribed to brief"
      );
      refetchSubscriptions();
    },
  });

  // Unsubscribe mutation
  const unsubscribeMutation = trpc.vipCockpit.unsubscribeFromBrief.useMutation({
    onSuccess: () => {
      toast.success(
        isArabic ? "تم إلغاء الاشتراك" : "Unsubscribed",
        isArabic ? "تم إلغاء الاشتراك من الموجز" : "Successfully unsubscribed from brief"
      );
      refetchSubscriptions();
    },
  });

  // Generate brief mutation
  const generateBriefMutation = trpc.vipCockpit.generateBrief.useMutation({
    onSuccess: () => {
      toast.success(
        isArabic ? "تم إنشاء الموجز" : "Brief Generated",
        isArabic ? "تم إنشاء الموجز بنجاح" : "Brief has been generated successfully"
      );
      refetchHistory();
    },
  });

  // Mark as read mutation
  const markAsReadMutation = trpc.vipCockpit.markBriefAsRead.useMutation({
    onSuccess: () => {
      refetchHistory();
    },
  });

  const isSubscribed = (templateId: number) => {
    return subscriptions?.some((s) => s.template.id === templateId);
  };

  const getSubscription = (templateId: number) => {
    return subscriptions?.find((s) => s.template.id === templateId);
  };

  const handleToggleSubscription = (templateId: number) => {
    const subscription = getSubscription(templateId);
    if (subscription) {
      unsubscribeMutation.mutate({ subscriptionId: subscription.subscription.id });
    } else {
      subscribeMutation.mutate({ templateId });
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      daily: { en: "Daily", ar: "يومي" },
      weekly: { en: "Weekly", ar: "أسبوعي" },
      monthly: { en: "Monthly", ar: "شهري" },
      on_demand: { en: "On Demand", ar: "عند الطلب" },
    };
    return isArabic ? labels[frequency]?.ar || frequency : labels[frequency]?.en || frequency;
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case "read": return "bg-green-500";
      case "sent": return "bg-blue-500";
      case "pending": return "bg-amber-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" />
            {isArabic ? "الموجزات التلقائية" : "Auto-Briefs"}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? "موجزات ذكية يومية وأسبوعية مخصصة لدورك" : "Smart daily and weekly briefs tailored to your role"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {subscriptions?.length || 0} {isArabic ? "اشتراكات نشطة" : "active subscriptions"}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            {isArabic ? "صندوق الوارد" : "Inbox"}
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            {isArabic ? "القوالب" : "Templates"}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {isArabic ? "الإعدادات" : "Settings"}
          </TabsTrigger>
        </TabsList>

        {/* Inbox Tab */}
        <TabsContent value="inbox" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Brief List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "الموجزات الأخيرة" : "Recent Briefs"}</CardTitle>
                  <CardDescription>
                    {isArabic ? "موجزاتك المولدة تلقائياً" : "Your automatically generated briefs"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20" />
                      ))}
                    </div>
                  ) : briefHistory && briefHistory.length > 0 ? (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4 pr-4">
                        {briefHistory.map((brief) => (
                          <div
                            key={brief.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedBrief === brief.id ? "border-primary bg-muted/50" : ""
                            } ${brief.deliveryStatus !== "read" ? "border-l-4 border-l-blue-500" : ""}`}
                            onClick={() => {
                              setSelectedBrief(brief.id);
                              if (brief.deliveryStatus !== "read") {
                                markAsReadMutation.mutate({ briefId: brief.id });
                              }
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium">
                                  {isArabic ? brief.titleAr : brief.title}
                                </h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(brief.generatedAt).toLocaleDateString(isArabic ? "ar-YE" : "en-US")}
                                </p>
                              </div>
                              <Badge className={getDeliveryStatusColor(brief.deliveryStatus || "pending")}>
                                {brief.deliveryStatus}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {isArabic ? brief.executiveSummaryAr : brief.executiveSummary}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {brief.totalSignals} {isArabic ? "إشارات" : "signals"}
                              </span>
                              {(brief.criticalSignals || 0) > 0 && (
                                <span className="flex items-center gap-1 text-red-500">
                                  <AlertTriangle className="h-3 w-3" />
                                  {brief.criticalSignals} {isArabic ? "حرجة" : "critical"}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12">
                      <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        {isArabic ? "لا توجد موجزات بعد" : "No briefs yet"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? "اشترك في قالب لبدء تلقي الموجزات" : "Subscribe to a template to start receiving briefs"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Brief Preview */}
            <div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{isArabic ? "معاينة" : "Preview"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedBrief && briefHistory ? (
                    (() => {
                      const brief = briefHistory.find((b) => b.id === selectedBrief);
                      if (!brief) return null;
                      return (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">{isArabic ? "الملخص التنفيذي" : "Executive Summary"}</h4>
                            <p className="text-sm text-muted-foreground">
                              {isArabic ? brief.executiveSummaryAr : brief.executiveSummary}
                            </p>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-2xl font-bold">{brief.totalSignals}</p>
                              <p className="text-xs text-muted-foreground">{isArabic ? "إشارات" : "Signals"}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-2xl font-bold text-red-500">{brief.criticalSignals}</p>
                              <p className="text-xs text-muted-foreground">{isArabic ? "حرجة" : "Critical"}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-2xl font-bold text-amber-500">{brief.warningSignals}</p>
                              <p className="text-xs text-muted-foreground">{isArabic ? "تحذيرات" : "Warnings"}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-2xl font-bold text-blue-500">{brief.activeOptions}</p>
                              <p className="text-xs text-muted-foreground">{isArabic ? "خيارات" : "Options"}</p>
                            </div>
                          </div>
                          <Button className="w-full" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            {isArabic ? "عرض كامل" : "View Full Brief"}
                          </Button>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {isArabic ? "اختر موجزاً للمعاينة" : "Select a brief to preview"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesLoading ? (
              [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))
            ) : templates && templates.length > 0 ? (
              templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {isArabic ? template.templateNameAr : template.templateName}
                        </CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {getFrequencyLabel(template.frequency || "daily")}
                        </Badge>
                      </div>
                      <Switch
                        checked={isSubscribed(template.id)}
                        onCheckedChange={() => handleToggleSubscription(template.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {isArabic ? "وقت التسليم:" : "Delivery:"} {template.deliveryTime || "08:00"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Send className="h-4 w-4" />
                        {isArabic ? "القنوات:" : "Channels:"}{" "}
                        {(template.deliveryChannels as string[] | null)?.join(", ") || "dashboard"}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => generateBriefMutation.mutate({
                        templateId: template.id,
                        roleCode: "vip_president",
                      })}
                      disabled={generateBriefMutation.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${generateBriefMutation.isPending ? "animate-spin" : ""}`} />
                      {isArabic ? "إنشاء الآن" : "Generate Now"}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <LayoutDashboard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isArabic ? "لا توجد قوالب متاحة" : "No templates available"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "إعدادات الموجزات" : "Brief Settings"}</CardTitle>
              <CardDescription>
                {isArabic ? "تخصيص كيفية تلقي الموجزات" : "Customize how you receive briefs"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">{isArabic ? "إشعارات البريد الإلكتروني" : "Email Notifications"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "تلقي الموجزات عبر البريد الإلكتروني" : "Receive briefs via email"}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="font-medium">{isArabic ? "إشعارات لوحة المعلومات" : "Dashboard Notifications"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "عرض الموجزات في لوحة المعلومات" : "Show briefs in dashboard"}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">{isArabic ? "تنبيهات الطوارئ" : "Emergency Alerts"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "تلقي تنبيهات فورية للإشارات الحرجة" : "Receive immediate alerts for critical signals"}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
