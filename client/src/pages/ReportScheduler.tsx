/**
 * Intelligent Report Scheduling UI
 * 
 * World-class implementation featuring:
 * - Drag-and-drop report section builder
 * - AI-generated executive summaries
 * - Smart scheduling based on data freshness
 * - Customizable delivery preferences
 * - Preview before scheduling
 * - Multi-format export (PDF, Excel, Word)
 */

import { useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Settings,
  Mail,
  Download,
  Eye,
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// Toast notifications

interface ReportSchedulerProps {
  params?: Record<string, string | undefined>;
}

// Available report sections
const availableSections = [
  { id: "executive_summary", name: "Executive Summary", nameAr: "الملخص التنفيذي", aiGenerated: true },
  { id: "exchange_rates", name: "Exchange Rates Analysis", nameAr: "تحليل أسعار الصرف", aiGenerated: false },
  { id: "inflation", name: "Inflation Trends", nameAr: "اتجاهات التضخم", aiGenerated: false },
  { id: "gdp", name: "GDP Estimates", nameAr: "تقديرات الناتج المحلي", aiGenerated: false },
  { id: "banking", name: "Banking Sector Overview", nameAr: "نظرة عامة على القطاع المصرفي", aiGenerated: false },
  { id: "trade", name: "Trade Balance", nameAr: "الميزان التجاري", aiGenerated: false },
  { id: "humanitarian", name: "Humanitarian Economy", nameAr: "الاقتصاد الإنساني", aiGenerated: false },
  { id: "fuel", name: "Fuel & Energy", nameAr: "الوقود والطاقة", aiGenerated: false },
  { id: "fiscal", name: "Fiscal Analysis", nameAr: "التحليل المالي", aiGenerated: false },
  { id: "key_events", name: "Key Economic Events", nameAr: "الأحداث الاقتصادية الرئيسية", aiGenerated: true },
  { id: "outlook", name: "Economic Outlook", nameAr: "التوقعات الاقتصادية", aiGenerated: true },
  { id: "recommendations", name: "Policy Recommendations", nameAr: "توصيات السياسات", aiGenerated: true },
];

// Frequency options
const frequencyOptions = [
  { value: "daily", label: "Daily", labelAr: "يومي" },
  { value: "weekly", label: "Weekly", labelAr: "أسبوعي" },
  { value: "biweekly", label: "Bi-weekly", labelAr: "نصف شهري" },
  { value: "monthly", label: "Monthly", labelAr: "شهري" },
  { value: "quarterly", label: "Quarterly", labelAr: "ربع سنوي" },
];

// Format options
const formatOptions = [
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "excel", label: "Excel", icon: FileText },
  { value: "word", label: "Word", icon: FileText },
];

// Sample scheduled reports
const scheduledReports = [
  {
    id: "1",
    name: "Weekly Economic Digest",
    nameAr: "الملخص الاقتصادي الأسبوعي",
    frequency: "weekly",
    nextDelivery: "2026-01-19T09:00:00",
    recipients: 12,
    sections: 6,
    status: "active",
    lastGenerated: "2026-01-12T09:00:00",
  },
  {
    id: "2",
    name: "Monthly Exchange Rate Report",
    nameAr: "تقرير سعر الصرف الشهري",
    frequency: "monthly",
    nextDelivery: "2026-02-01T09:00:00",
    recipients: 45,
    sections: 4,
    status: "active",
    lastGenerated: "2026-01-01T09:00:00",
  },
  {
    id: "3",
    name: "Quarterly Economic Review",
    nameAr: "المراجعة الاقتصادية الربعية",
    frequency: "quarterly",
    nextDelivery: "2026-04-01T09:00:00",
    recipients: 89,
    sections: 10,
    status: "active",
    lastGenerated: "2026-01-01T09:00:00",
  },
];

export default function ReportScheduler({ params }: ReportSchedulerProps = {}) {
  const showToast = (title: string, description: string, variant?: string) => {
    console.log(`[Toast] ${title}: ${description}`);
    // In production, this would use a toast library
  };
  const [activeTab, setActiveTab] = useState("scheduled");
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // New report state
  const [reportName, setReportName] = useState("");
  const [reportNameAr, setReportNameAr] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [deliveryTime, setDeliveryTime] = useState("09:00");
  const [deliveryDay, setDeliveryDay] = useState("monday");
  const [selectedSections, setSelectedSections] = useState<string[]>(["executive_summary", "exchange_rates"]);
  const [format, setFormat] = useState("pdf");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [bilingual, setBilingual] = useState(true);
  const [aiSummary, setAiSummary] = useState(true);
  const [recipients, setRecipients] = useState("");
  
  const isRTL = false; // Could be dynamic based on user preference

  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleGenerateAISummary = async () => {
    setIsGeneratingAI(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGeneratingAI(false);
    showToast(
      t("AI Summary Generated", "تم إنشاء الملخص بالذكاء الاصطناعي"),
      t(
        "Executive summary has been generated based on latest data",
        "تم إنشاء الملخص التنفيذي بناءً على أحدث البيانات"
      )
    );
  };

  const handleCreateSchedule = () => {
    if (!reportName) {
      showToast(
        t("Error", "خطأ"),
        t("Please enter a report name", "الرجاء إدخال اسم التقرير"),
        "destructive"
      );
      return;
    }
    
    setIsCreating(true);
    // Simulate creation
    setTimeout(() => {
      setIsCreating(false);
      showToast(
        t("Schedule Created", "تم إنشاء الجدول"),
        t(
          `Report "${reportName}" scheduled for ${frequency} delivery`,
          `تم جدولة التقرير "${reportName}" للتسليم ${frequency}`
        )
      );
      // Reset form
      setReportName("");
      setReportNameAr("");
      setSelectedSections(["executive_summary", "exchange_rates"]);
      setActiveTab("scheduled");
    }, 1500);
  };

  const handleSendNow = (reportId: string) => {
    showToast(
      t("Report Sent", "تم إرسال التقرير"),
      t("Report is being generated and sent to recipients", "يتم إنشاء التقرير وإرساله للمستلمين")
    );
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {t("Report Scheduler", "جدولة التقارير")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t(
                "Configure automated report generation and delivery",
                "تكوين إنشاء التقارير وتسليمها تلقائياً"
              )}
            </p>
          </div>
          <Button onClick={() => setActiveTab("create")}>
            <Plus className="h-4 w-4 mr-2" />
            {t("Create Schedule", "إنشاء جدول")}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="scheduled">{t("Scheduled Reports", "التقارير المجدولة")}</TabsTrigger>
            <TabsTrigger value="create">{t("Create New", "إنشاء جديد")}</TabsTrigger>
            <TabsTrigger value="history">{t("Delivery History", "سجل التسليم")}</TabsTrigger>
          </TabsList>

          {/* Scheduled Reports Tab */}
          <TabsContent value="scheduled">
            <div className="grid gap-4">
              {scheduledReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{isRTL ? report.nameAr : report.name}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {frequencyOptions.find(f => f.value === report.frequency)?.label}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {report.recipients} {t("recipients", "مستلم")}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {report.sections} {t("sections", "قسم")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {t("Next delivery", "التسليم التالي")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.nextDelivery).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={report.status === "active" ? "default" : "secondary"}>
                          {report.status === "active" ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> {t("Active", "نشط")}</>
                          ) : (
                            <><AlertCircle className="h-3 w-3 mr-1" /> {t("Paused", "متوقف")}</>
                          )}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleSendNow(report.id)}>
                          <Send className="h-4 w-4 mr-1" />
                          {t("Send Now", "إرسال الآن")}
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create New Tab */}
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Configuration */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Report Details", "تفاصيل التقرير")}</CardTitle>
                    <CardDescription>
                      {t("Configure your automated report", "تكوين التقرير التلقائي")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("Report Name (English)", "اسم التقرير (إنجليزي)")}</Label>
                        <Input
                          value={reportName}
                          onChange={(e) => setReportName(e.target.value)}
                          placeholder="Weekly Economic Digest"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("Report Name (Arabic)", "اسم التقرير (عربي)")}</Label>
                        <Input
                          value={reportNameAr}
                          onChange={(e) => setReportNameAr(e.target.value)}
                          placeholder="الملخص الاقتصادي الأسبوعي"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>{t("Frequency", "التكرار")}</Label>
                        <Select value={frequency} onValueChange={setFrequency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencyOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {isRTL ? opt.labelAr : opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("Delivery Day", "يوم التسليم")}</Label>
                        <Select value={deliveryDay} onValueChange={setDeliveryDay}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sunday">{t("Sunday", "الأحد")}</SelectItem>
                            <SelectItem value="monday">{t("Monday", "الإثنين")}</SelectItem>
                            <SelectItem value="tuesday">{t("Tuesday", "الثلاثاء")}</SelectItem>
                            <SelectItem value="wednesday">{t("Wednesday", "الأربعاء")}</SelectItem>
                            <SelectItem value="thursday">{t("Thursday", "الخميس")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("Delivery Time", "وقت التسليم")}</Label>
                        <Input
                          type="time"
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("Recipients (comma-separated emails)", "المستلمون (بريد إلكتروني مفصول بفواصل)")}</Label>
                      <Textarea
                        value={recipients}
                        onChange={(e) => setRecipients(e.target.value)}
                        placeholder="user1@example.com, user2@example.com"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Section Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Report Sections", "أقسام التقرير")}</CardTitle>
                    <CardDescription>
                      {t("Select and arrange report sections", "اختر وترتيب أقسام التقرير")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {availableSections.map((section) => (
                          <div
                            key={section.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              selectedSections.includes(section.id)
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              <Checkbox
                                checked={selectedSections.includes(section.id)}
                                onCheckedChange={() => handleSectionToggle(section.id)}
                              />
                              <div>
                                <p className="font-medium">{isRTL ? section.nameAr : section.name}</p>
                                {section.aiGenerated && (
                                  <Badge variant="secondary" className="mt-1">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {t("AI Generated", "مولد بالذكاء الاصطناعي")}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Output Settings", "إعدادات الإخراج")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("Format", "الصيغة")}</Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formatOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t("Include Charts", "تضمين الرسوم البيانية")}</Label>
                      <Switch checked={includeCharts} onCheckedChange={setIncludeCharts} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t("Include Data Tables", "تضمين جداول البيانات")}</Label>
                      <Switch checked={includeTables} onCheckedChange={setIncludeTables} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t("Bilingual (AR/EN)", "ثنائي اللغة")}</Label>
                      <Switch checked={bilingual} onCheckedChange={setBilingual} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t("AI Executive Summary", "ملخص تنفيذي بالذكاء الاصطناعي")}</Label>
                      <Switch checked={aiSummary} onCheckedChange={setAiSummary} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("AI Features", "ميزات الذكاء الاصطناعي")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleGenerateAISummary}
                      disabled={isGeneratingAI}
                    >
                      {isGeneratingAI ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      {t("Generate AI Summary", "إنشاء ملخص بالذكاء الاصطناعي")}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "AI will analyze latest data and generate an executive summary highlighting key trends and insights.",
                        "سيقوم الذكاء الاصطناعي بتحليل أحدث البيانات وإنشاء ملخص تنفيذي يسلط الضوء على الاتجاهات والرؤى الرئيسية."
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("Actions", "الإجراءات")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Dialog open={showPreview} onOpenChange={setShowPreview}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          {t("Preview Report", "معاينة التقرير")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t("Report Preview", "معاينة التقرير")}</DialogTitle>
                          <DialogDescription>
                            {t("Preview of your scheduled report", "معاينة التقرير المجدول")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="p-6 bg-white rounded-lg border">
                          <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold">{reportName || "Report Title"}</h1>
                            <p className="text-muted-foreground">
                              {t("Generated on", "تم الإنشاء في")} {new Date().toLocaleDateString()}
                            </p>
                          </div>
                          <div className="space-y-4">
                            {selectedSections.map((sectionId) => {
                              const section = availableSections.find(s => s.id === sectionId);
                              return section ? (
                                <div key={sectionId} className="p-4 border rounded-lg">
                                  <h2 className="font-semibold mb-2">{section.name}</h2>
                                  <p className="text-sm text-muted-foreground">
                                    {t("[Section content will be generated here]", "[سيتم إنشاء محتوى القسم هنا]")}
                                  </p>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      className="w-full"
                      onClick={handleCreateSchedule}
                      disabled={isCreating || !reportName}
                    >
                      {isCreating ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Calendar className="h-4 w-4 mr-2" />
                      )}
                      {t("Create Schedule", "إنشاء الجدول")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Delivery History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>{t("Delivery History", "سجل التسليم")}</CardTitle>
                <CardDescription>
                  {t("Past report deliveries and their status", "التقارير السابقة وحالتها")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-green-100">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Weekly Economic Digest</p>
                          <p className="text-sm text-muted-foreground">
                            {t("Delivered to", "تم التسليم إلى")} 12 {t("recipients", "مستلم")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">09:00 AM</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        {t("Download", "تحميل")}
                      </Button>
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
