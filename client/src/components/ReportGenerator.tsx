import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Printer,
  Share2,
  Calendar,
  TrendingUp,
  Building2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  FileSpreadsheet,
  FileType,
  Mail,
  Sparkles,
} from "lucide-react";

export type ReportType = 
  | "daily_briefing"
  | "weekly_summary"
  | "monthly_report"
  | "sector_analysis"
  | "risk_assessment"
  | "policy_brief"
  | "custom";

export type ReportFormat = "pdf" | "docx" | "xlsx" | "pptx";

interface ReportSection {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
  required?: boolean;
}

interface ReportGeneratorProps {
  recipientRole?: "governor" | "deputy_governor" | "analyst" | "partner";
  language?: "en" | "ar";
  onGenerate?: (config: ReportConfig) => Promise<void>;
}

export interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  sections: string[];
  dateRange: { start: string; end: string };
  customNotes?: string;
  includeCharts: boolean;
  includeRawData: boolean;
  aiSummary: boolean;
  recipientEmail?: string;
}

const reportTypes: Record<ReportType, { 
  label: string; 
  labelAr: string; 
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
}> = {
  daily_briefing: {
    label: "Daily Briefing",
    labelAr: "الإحاطة اليومية",
    description: "Key indicators and overnight developments",
    descriptionAr: "المؤشرات الرئيسية والتطورات الليلية",
    icon: <Calendar className="h-5 w-5" />,
  },
  weekly_summary: {
    label: "Weekly Summary",
    labelAr: "الملخص الأسبوعي",
    description: "Week-over-week analysis and trends",
    descriptionAr: "تحليل أسبوعي والاتجاهات",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  monthly_report: {
    label: "Monthly Report",
    labelAr: "التقرير الشهري",
    description: "Comprehensive monthly economic review",
    descriptionAr: "مراجعة اقتصادية شهرية شاملة",
    icon: <FileText className="h-5 w-5" />,
  },
  sector_analysis: {
    label: "Sector Analysis",
    labelAr: "تحليل القطاع",
    description: "Deep dive into specific sector",
    descriptionAr: "تحليل معمق لقطاع محدد",
    icon: <Building2 className="h-5 w-5" />,
  },
  risk_assessment: {
    label: "Risk Assessment",
    labelAr: "تقييم المخاطر",
    description: "Current risks and mitigation strategies",
    descriptionAr: "المخاطر الحالية واستراتيجيات التخفيف",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  policy_brief: {
    label: "Policy Brief",
    labelAr: "موجز السياسات",
    description: "Policy recommendations and analysis",
    descriptionAr: "توصيات وتحليل السياسات",
    icon: <FileType className="h-5 w-5" />,
  },
  custom: {
    label: "Custom Report",
    labelAr: "تقرير مخصص",
    description: "Build your own report",
    descriptionAr: "أنشئ تقريرك الخاص",
    icon: <Sparkles className="h-5 w-5" />,
  },
};

const reportSections: ReportSection[] = [
  {
    id: "exchange_rates",
    title: "Exchange Rates",
    titleAr: "أسعار الصرف",
    description: "YER/USD rates for Aden and Sana'a",
    descriptionAr: "أسعار الريال/الدولار لعدن وصنعاء",
    icon: <DollarSign className="h-4 w-4" />,
    required: true,
  },
  {
    id: "banking_sector",
    title: "Banking Sector",
    titleAr: "القطاع المصرفي",
    description: "Bank performance and compliance",
    descriptionAr: "أداء البنوك والامتثال",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    id: "inflation",
    title: "Inflation & Prices",
    titleAr: "التضخم والأسعار",
    description: "CPI and commodity prices",
    descriptionAr: "مؤشر أسعار المستهلك وأسعار السلع",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    id: "reserves",
    title: "Foreign Reserves",
    titleAr: "الاحتياطيات الأجنبية",
    description: "CBY reserve levels and changes",
    descriptionAr: "مستويات احتياطيات البنك المركزي",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    id: "alerts",
    title: "Alerts & Warnings",
    titleAr: "التنبيهات والتحذيرات",
    description: "Active alerts and threshold breaches",
    descriptionAr: "التنبيهات النشطة وتجاوزات العتبات",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    id: "humanitarian",
    title: "Humanitarian Indicators",
    titleAr: "المؤشرات الإنسانية",
    description: "Food security and aid flows",
    descriptionAr: "الأمن الغذائي وتدفقات المساعدات",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    id: "sanctions",
    title: "Sanctions & Compliance",
    titleAr: "العقوبات والامتثال",
    description: "OFAC/UN sanctions updates",
    descriptionAr: "تحديثات عقوبات OFAC/الأمم المتحدة",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    id: "policy_updates",
    title: "Policy Updates",
    titleAr: "تحديثات السياسات",
    description: "Recent CBY directives and regulations",
    descriptionAr: "التعميمات واللوائح الأخيرة للبنك المركزي",
    icon: <FileText className="h-4 w-4" />,
  },
];

export function ReportGenerator({ 
  recipientRole = "governor", 
  language = "en",
  onGenerate 
}: ReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<ReportType>("daily_briefing");
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>("pdf");
  const [selectedSections, setSelectedSections] = useState<string[]>(["exchange_rates", "banking_sector", "alerts"]);
  const [customNotes, setCustomNotes] = useState("");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [aiSummary, setAiSummary] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState("");
  
  const isArabic = language === "ar";

  const handleSectionToggle = (sectionId: string) => {
    const section = reportSections.find(s => s.id === sectionId);
    if (section?.required) return; // Can't uncheck required sections
    
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    const config: ReportConfig = {
      type: selectedType,
      format: selectedFormat,
      sections: selectedSections,
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      customNotes,
      includeCharts,
      includeRawData,
      aiSummary,
      recipientEmail: recipientEmail || undefined,
    };

    try {
      // Simulate report generation progress
      const stages = [
        { progress: 20, message: isArabic ? "جمع البيانات..." : "Gathering data..." },
        { progress: 40, message: isArabic ? "تحليل المؤشرات..." : "Analyzing indicators..." },
        { progress: 60, message: isArabic ? "إنشاء الرسوم البيانية..." : "Generating charts..." },
        { progress: 80, message: isArabic ? "كتابة الملخص..." : "Writing summary..." },
        { progress: 100, message: isArabic ? "إنهاء التقرير..." : "Finalizing report..." },
      ];

      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(stage.progress);
        toast.info(stage.message);
      }

      if (onGenerate) {
        await onGenerate(config);
      }

      toast.success(
        isArabic 
          ? "تم إنشاء التقرير بنجاح" 
          : "Report generated successfully"
      );
      setIsOpen(false);
    } catch (error) {
      toast.error(
        isArabic 
          ? "فشل في إنشاء التقرير" 
          : "Failed to generate report"
      );
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          {isArabic ? "إنشاء تقرير" : "Generate Report"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={isArabic ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isArabic ? "مولد التقارير التنفيذية" : "Executive Report Generator"}
          </DialogTitle>
          <DialogDescription>
            {isArabic 
              ? "أنشئ تقارير مخصصة مع بيانات محدثة وتحليلات ذكية"
              : "Generate customized reports with real-time data and AI-powered analysis"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="type" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="type">
              {isArabic ? "نوع التقرير" : "Report Type"}
            </TabsTrigger>
            <TabsTrigger value="sections">
              {isArabic ? "الأقسام" : "Sections"}
            </TabsTrigger>
            <TabsTrigger value="options">
              {isArabic ? "الخيارات" : "Options"}
            </TabsTrigger>
          </TabsList>

          {/* Report Type Selection */}
          <TabsContent value="type" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(reportTypes).map(([key, type]) => (
                <Card 
                  key={key}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedType === key ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedType(key as ReportType)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      {type.icon}
                      {isArabic ? type.labelAr : type.label}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isArabic ? type.descriptionAr : type.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sections Selection */}
          <TabsContent value="sections" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {reportSections.map((section) => (
                <div
                  key={section.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    selectedSections.includes(section.id) 
                      ? "border-primary bg-primary/5" 
                      : "border-border"
                  }`}
                >
                  <Checkbox
                    id={section.id}
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                    disabled={section.required}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={section.id} 
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {section.icon}
                      <span className="font-medium">
                        {isArabic ? section.titleAr : section.title}
                      </span>
                      {section.required && (
                        <Badge variant="secondary" className="text-xs">
                          {isArabic ? "مطلوب" : "Required"}
                        </Badge>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isArabic ? section.descriptionAr : section.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Options */}
          <TabsContent value="options" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Format Selection */}
              <div className="space-y-2">
                <Label>{isArabic ? "صيغة الملف" : "File Format"}</Label>
                <Select value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as ReportFormat)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-500" />
                        PDF
                      </div>
                    </SelectItem>
                    <SelectItem value="docx">
                      <div className="flex items-center gap-2">
                        <FileType className="h-4 w-4 text-blue-500" />
                        Word (DOCX)
                      </div>
                    </SelectItem>
                    <SelectItem value="xlsx">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                        Excel (XLSX)
                      </div>
                    </SelectItem>
                    <SelectItem value="pptx">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-500" />
                        PowerPoint (PPTX)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email Recipient */}
              <div className="space-y-2">
                <Label>{isArabic ? "إرسال إلى" : "Send to Email"}</Label>
                <div className="flex gap-2">
                  <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder={isArabic ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="charts" 
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(!!checked)}
                />
                <Label htmlFor="charts" className="cursor-pointer">
                  {isArabic ? "تضمين الرسوم البيانية والمخططات" : "Include charts and visualizations"}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="rawData" 
                  checked={includeRawData}
                  onCheckedChange={(checked) => setIncludeRawData(!!checked)}
                />
                <Label htmlFor="rawData" className="cursor-pointer">
                  {isArabic ? "تضمين البيانات الخام كملحق" : "Include raw data as appendix"}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="aiSummary" 
                  checked={aiSummary}
                  onCheckedChange={(checked) => setAiSummary(!!checked)}
                />
                <Label htmlFor="aiSummary" className="cursor-pointer flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {isArabic ? "إنشاء ملخص تنفيذي بالذكاء الاصطناعي" : "Generate AI executive summary"}
                </Label>
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-2">
              <Label>{isArabic ? "ملاحظات إضافية" : "Additional Notes"}</Label>
              <Textarea
                placeholder={isArabic 
                  ? "أضف أي ملاحظات أو تعليمات خاصة للتقرير..."
                  : "Add any special notes or instructions for the report..."}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isArabic ? "جاري إنشاء التقرير..." : "Generating report..."}
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating}>
            {isArabic ? "إلغاء" : "Cancel"}
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || selectedSections.length === 0}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isArabic ? "جاري الإنشاء..." : "Generating..."}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {isArabic ? "إنشاء وتحميل" : "Generate & Download"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Quick Report Button for common report types
export function QuickReportButton({ 
  type, 
  language = "en",
  onGenerate 
}: { 
  type: ReportType; 
  language?: "en" | "ar";
  onGenerate?: (config: ReportConfig) => Promise<void>;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const reportType = reportTypes[type];
  const isArabic = language === "ar";

  const handleQuickGenerate = async () => {
    setIsGenerating(true);
    try {
      const config: ReportConfig = {
        type,
        format: "pdf",
        sections: ["exchange_rates", "banking_sector", "alerts", "inflation"],
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
        includeCharts: true,
        includeRawData: false,
        aiSummary: true,
      };

      if (onGenerate) {
        await onGenerate(config);
      }

      // Simulate generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(isArabic ? "تم إنشاء التقرير" : "Report generated");
    } catch (error) {
      toast.error(isArabic ? "فشل في إنشاء التقرير" : "Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2"
      onClick={handleQuickGenerate}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        reportType.icon
      )}
      {isArabic ? reportType.labelAr : reportType.label}
    </Button>
  );
}

export default ReportGenerator;
