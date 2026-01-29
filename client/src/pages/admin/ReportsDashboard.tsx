/**
 * YETO Admin Reports Dashboard
 * 
 * Admin interface for managing report generation, distribution, and subscribers
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Mail,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Send,
  TrendingUp,
  BarChart3,
  Settings,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function ReportsDashboard() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isArabic = language === "ar";
  
  // State
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(Math.ceil((new Date().getMonth() + 1) / 3) as 1 | 2 | 3 | 4);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ar">("en");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  
  // Queries
  const { data: templates } = trpc.reports.listTemplates.useQuery();
  const { data: reports, refetch: refetchReports } = trpc.reports.listReports.useQuery({ limit: 20 });
  const { data: subscriberStats } = trpc.reports.getSubscriberStats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const { data: subscribers } = trpc.reports.listSubscribers.useQuery({ limit: 50 }, {
    enabled: user?.role === "admin",
  });
  const { data: schedule } = trpc.reports.getSchedule.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  
  // Mutations
  const generateQuarterlyMutation = trpc.reports.generateQuarterly.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم إنشاء التقرير بنجاح" : "Report generated successfully");
      refetchReports();
      setGenerateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const generateAnnualMutation = trpc.reports.generateAnnual.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم إنشاء التقرير السنوي بنجاح" : "Annual report generated successfully");
      refetchReports();
      setGenerateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const distributeMutation = trpc.reports.distributeReport.useMutation({
    onSuccess: (result) => {
      toast.success(
        isArabic 
          ? `تم إرسال ${result.emailsSent} رسالة بنجاح`
          : `Successfully sent ${result.emailsSent} emails`
      );
      setDistributeDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Check admin access
  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-md text-center p-8">
            <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isArabic ? "الوصول مقيد" : "Access Restricted"}
            </h2>
            <p className="text-muted-foreground">
              {isArabic 
                ? "هذه الصفحة متاحة للمسؤولين فقط"
                : "This page is only available to administrators"}
            </p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(isArabic ? "ar-YE" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {isArabic ? "لوحة تحكم التقارير" : "Reports Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {isArabic 
                ? "إدارة إنشاء وتوزيع التقارير الاقتصادية"
                : "Manage economic report generation and distribution"}
            </p>
          </div>
          
          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Play className="w-4 h-4 mr-2" />
                {isArabic ? "إنشاء تقرير" : "Generate Report"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isArabic ? "إنشاء تقرير جديد" : "Generate New Report"}</DialogTitle>
                <DialogDescription>
                  {isArabic 
                    ? "اختر نوع التقرير والفترة الزمنية"
                    : "Select report type and time period"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isArabic ? "السنة" : "Year"}</Label>
                    <Select 
                      value={selectedYear.toString()} 
                      onValueChange={(v) => setSelectedYear(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 16 }, (_, i) => 2025 - i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{isArabic ? "الربع" : "Quarter"}</Label>
                    <Select 
                      value={selectedQuarter.toString()} 
                      onValueChange={(v) => setSelectedQuarter(parseInt(v) as 1 | 2 | 3 | 4)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                        <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                        <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                        <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{isArabic ? "اللغة" : "Language"}</Label>
                  <Select 
                    value={selectedLanguage} 
                    onValueChange={(v) => setSelectedLanguage(v as "en" | "ar")}
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
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => generateQuarterlyMutation.mutate({
                    year: selectedYear,
                    quarter: selectedQuarter,
                    language: selectedLanguage,
                  })}
                  disabled={generateQuarterlyMutation.isPending}
                >
                  {generateQuarterlyMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isArabic ? "تقرير فصلي" : "Quarterly Report"}
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => generateAnnualMutation.mutate({
                    year: selectedYear,
                    language: selectedLanguage,
                  })}
                  disabled={generateAnnualMutation.isPending}
                >
                  {generateAnnualMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isArabic ? "تقرير سنوي" : "Annual Report"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isArabic ? "إجمالي التقارير" : "Total Reports"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "تقرير منشور" : "published reports"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isArabic ? "المشتركين" : "Subscribers"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriberStats?.totalSubscribers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {subscriberStats?.activeSubscribers || 0} {isArabic ? "نشط" : "active"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isArabic ? "التوزيعات الأخيرة" : "Recent Distributions"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriberStats?.recentDistributions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "آخر 30 يوم" : "last 30 days"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isArabic ? "أنواع التقارير" : "Report Types"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "قالب متاح" : "templates available"}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="reports" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 mr-2" />
              {isArabic ? "التقارير" : "Reports"}
            </TabsTrigger>
            <TabsTrigger value="subscribers">
              <Users className="w-4 h-4 mr-2" />
              {isArabic ? "المشتركين" : "Subscribers"}
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Clock className="w-4 h-4 mr-2" />
              {isArabic ? "الجدولة" : "Schedule"}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              {isArabic ? "التحليلات" : "Analytics"}
            </TabsTrigger>
          </TabsList>
          
          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{isArabic ? "التقارير المنشورة" : "Published Reports"}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => refetchReports()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {isArabic ? "تحديث" : "Refresh"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isArabic ? "الفترة" : "Period"}</TableHead>
                      <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
                      <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                      <TableHead>{isArabic ? "تاريخ الإنشاء" : "Generated"}</TableHead>
                      <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {isArabic ? "لا توجد تقارير بعد" : "No reports yet"}
                        </TableCell>
                      </TableRow>
                    ) : reports?.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.periodLabel}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {isArabic ? report.templateNameAr : report.templateNameEn}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {report.status === "success" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {isArabic ? "مكتمل" : "Complete"}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              {report.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(report.generatedAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {report.s3UrlEn && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(report.s3UrlEn, "_blank")}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedReportId(report.id);
                                setDistributeDialogOpen(true);
                              }}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{isArabic ? "توزيع المستويات" : "Tier Distribution"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriberStats?.tierDistribution && Object.entries(subscriberStats.tierDistribution).map(([tier, count]) => (
                    <div key={tier} className="flex items-center justify-between py-1">
                      <span className="capitalize">{tier}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{isArabic ? "توزيع اللغات" : "Language Distribution"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriberStats?.languageDistribution && Object.entries(subscriberStats.languageDistribution).map(([lang, count]) => (
                    <div key={lang} className="flex items-center justify-between py-1">
                      <span>{lang === "ar" ? "العربية" : "English"}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{isArabic ? "معدل التحقق" : "Verification Rate"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subscriberStats?.totalSubscribers 
                      ? Math.round((subscriberStats.verifiedSubscribers / subscriberStats.totalSubscribers) * 100)
                      : 0}%
                  </div>
                  <Progress 
                    value={subscriberStats?.totalSubscribers 
                      ? (subscriberStats.verifiedSubscribers / subscriberStats.totalSubscribers) * 100
                      : 0} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "قائمة المشتركين" : "Subscriber List"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isArabic ? "البريد" : "Email"}</TableHead>
                      <TableHead>{isArabic ? "الاسم" : "Name"}</TableHead>
                      <TableHead>{isArabic ? "المؤسسة" : "Organization"}</TableHead>
                      <TableHead>{isArabic ? "المستوى" : "Tier"}</TableHead>
                      <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                      <TableHead>{isArabic ? "تاريخ الاشتراك" : "Subscribed"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {isArabic ? "لا يوجد مشتركين بعد" : "No subscribers yet"}
                        </TableCell>
                      </TableRow>
                    ) : subscribers?.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>{sub.email}</TableCell>
                        <TableCell>{isArabic ? sub.nameAr : sub.nameEn}</TableCell>
                        <TableCell>{sub.organization || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{sub.tier}</Badge>
                        </TableCell>
                        <TableCell>
                          {sub.isVerified ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {isArabic ? "مؤكد" : "Verified"}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {isArabic ? "في الانتظار" : "Pending"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(sub.subscribedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "جدول إنشاء التقارير" : "Report Generation Schedule"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? "التقارير المجدولة للإنشاء التلقائي"
                    : "Reports scheduled for automatic generation"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isArabic ? "القالب" : "Template"}</TableHead>
                      <TableHead>{isArabic ? "الجدول" : "Schedule"}</TableHead>
                      <TableHead>{isArabic ? "التشغيل التالي" : "Next Run"}</TableHead>
                      <TableHead>{isArabic ? "آخر تشغيل" : "Last Run"}</TableHead>
                      <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {isArabic ? "لا توجد جداول مكونة" : "No schedules configured"}
                        </TableCell>
                      </TableRow>
                    ) : schedule?.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          {isArabic ? s.templateNameAr : s.templateNameEn}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {s.cronExpression}
                          </code>
                        </TableCell>
                        <TableCell>{formatDate(s.nextRunAt)}</TableCell>
                        <TableCell>{formatDate(s.lastRunAt)}</TableCell>
                        <TableCell>
                          {s.isActive ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600">
                              {isArabic ? "نشط" : "Active"}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {isArabic ? "متوقف" : "Paused"}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "التقارير حسب النوع" : "Reports by Type"}</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-8 h-8 mr-2" />
                  {isArabic ? "الرسم البياني قيد التطوير" : "Chart coming soon"}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "نمو المشتركين" : "Subscriber Growth"}</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mr-2" />
                  {isArabic ? "الرسم البياني قيد التطوير" : "Chart coming soon"}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Distribute Dialog */}
        <Dialog open={distributeDialogOpen} onOpenChange={setDistributeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isArabic ? "توزيع التقرير" : "Distribute Report"}</DialogTitle>
              <DialogDescription>
                {isArabic 
                  ? "إرسال التقرير إلى جميع المشتركين"
                  : "Send the report to all subscribers"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isArabic ? "اللغة" : "Language"}</Label>
                <Select 
                  value={selectedLanguage} 
                  onValueChange={(v) => setSelectedLanguage(v as "en" | "ar")}
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
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  {isArabic 
                    ? `سيتم إرسال التقرير إلى ${subscriberStats?.activeSubscribers || 0} مشترك نشط`
                    : `Report will be sent to ${subscriberStats?.activeSubscribers || 0} active subscribers`}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDistributeDialogOpen(false)}>
                {isArabic ? "إلغاء" : "Cancel"}
              </Button>
              <Button 
                onClick={() => {
                  if (selectedReportId) {
                    distributeMutation.mutate({
                      reportId: selectedReportId,
                      language: selectedLanguage,
                    });
                  }
                }}
                disabled={distributeMutation.isPending}
              >
                {distributeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Send className="w-4 h-4 mr-2" />
                {isArabic ? "إرسال" : "Send"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
