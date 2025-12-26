import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText,
  Download,
  Plus,
  Trash2,
  GripVertical,
  BarChart3,
  Table,
  Type,
  Image,
  Settings,
  Eye,
  Save,
  Share2,
  Lock
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReportSection {
  id: string;
  type: "text" | "chart" | "table" | "indicator";
  title: string;
  content?: string;
  indicator?: string;
  chartType?: string;
}

export default function ReportBuilder() {
  const { language } = useLanguage();
  // Using sonner toast
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: "2024-01", end: "2024-12" });

  const sectors = [
    { value: "banking", labelEn: "Banking & Finance", labelAr: "البنوك والمالية" },
    { value: "trade", labelEn: "Trade & Commerce", labelAr: "التجارة" },
    { value: "currency", labelEn: "Currency & FX", labelAr: "العملة والصرف" },
    { value: "prices", labelEn: "Prices & Inflation", labelAr: "الأسعار والتضخم" },
    { value: "energy", labelEn: "Energy & Fuel", labelAr: "الطاقة والوقود" },
    { value: "food", labelEn: "Food Security", labelAr: "الأمن الغذائي" },
    { value: "aid", labelEn: "Aid Flows", labelAr: "تدفقات المساعدات" },
    { value: "public", labelEn: "Public Finance", labelAr: "المالية العامة" },
  ];

  const indicators = [
    { value: "fx_aden", label: "Exchange Rate - Aden" },
    { value: "fx_sanaa", label: "Exchange Rate - Sana'a" },
    { value: "cpi", label: "Consumer Price Index" },
    { value: "food_basket", label: "Food Basket Cost" },
    { value: "fuel_diesel", label: "Diesel Price" },
    { value: "fuel_petrol", label: "Petrol Price" },
    { value: "ipc_phase3", label: "IPC Phase 3+ Population" },
    { value: "aid_funding", label: "Humanitarian Funding" },
  ];

  const addSection = (type: ReportSection["type"]) => {
    const newSection: ReportSection = {
      id: Date.now().toString(),
      type,
      title: type === "text" ? "Text Section" : type === "chart" ? "Chart" : type === "table" ? "Data Table" : "Indicator",
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, updates: Partial<ReportSection>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleGenerateReport = () => {
    if (!reportTitle) {
      toast.error(language === "ar" ? "يرجى إدخال عنوان التقرير" : "Please enter a report title");
      return;
    }
    toast.success(language === "ar" ? "سيكون التقرير جاهزاً للتحميل قريباً" : "Your report will be ready for download shortly");
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "ar" 
                ? "منشئ التقارير المخصصة"
                : "Custom Report Builder"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === "ar"
                ? "أنشئ تقارير مخصصة بالمؤشرات والرسوم البيانية التي تحتاجها"
                : "Create custom reports with the indicators and charts you need"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Report Settings */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {language === "ar" ? "إعدادات التقرير" : "Report Settings"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{language === "ar" ? "عنوان التقرير" : "Report Title"}</Label>
                  <Input 
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder={language === "ar" ? "أدخل عنوان التقرير" : "Enter report title"}
                  />
                </div>
                <div>
                  <Label>{language === "ar" ? "الوصف" : "Description"}</Label>
                  <Textarea 
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder={language === "ar" ? "وصف مختصر للتقرير" : "Brief description of the report"}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>{language === "ar" ? "من" : "From"}</Label>
                    <Input 
                      type="month"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{language === "ar" ? "إلى" : "To"}</Label>
                    <Input 
                      type="month"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "القطاعات" : "Sectors"}</CardTitle>
                <CardDescription>
                  {language === "ar" ? "اختر القطاعات لتضمينها" : "Select sectors to include"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sectors.map(sector => (
                    <div key={sector.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={sector.value}
                        checked={selectedSectors.includes(sector.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSectors([...selectedSectors, sector.value]);
                          } else {
                            setSelectedSectors(selectedSectors.filter(s => s !== sector.value));
                          }
                        }}
                      />
                      <label htmlFor={sector.value} className="text-sm cursor-pointer">
                        {language === "ar" ? sector.labelAr : sector.labelEn}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "إضافة قسم" : "Add Section"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="gap-2" onClick={() => addSection("text")}>
                    <Type className="h-4 w-4" />
                    {language === "ar" ? "نص" : "Text"}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => addSection("chart")}>
                    <BarChart3 className="h-4 w-4" />
                    {language === "ar" ? "رسم بياني" : "Chart"}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => addSection("table")}>
                    <Table className="h-4 w-4" />
                    {language === "ar" ? "جدول" : "Table"}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => addSection("indicator")}>
                    <BarChart3 className="h-4 w-4" />
                    {language === "ar" ? "مؤشر" : "Indicator"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Report Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    {language === "ar" ? "معاينة التقرير" : "Report Preview"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Save className="h-4 w-4" />
                      {language === "ar" ? "حفظ" : "Save"}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      {language === "ar" ? "مشاركة" : "Share"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Report Header Preview */}
                <div className="border rounded-lg p-6 mb-6 bg-muted/30">
                  <h2 className="text-2xl font-bold mb-2">
                    {reportTitle || (language === "ar" ? "عنوان التقرير" : "Report Title")}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {reportDescription || (language === "ar" ? "وصف التقرير سيظهر هنا" : "Report description will appear here")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSectors.map(s => {
                      const sector = sectors.find(sec => sec.value === s);
                      return (
                        <Badge key={s} variant="secondary">
                          {sector ? (language === "ar" ? sector.labelAr : sector.labelEn) : s}
                        </Badge>
                      );
                    })}
                    <Badge variant="outline">
                      {dateRange.start} - {dateRange.end}
                    </Badge>
                  </div>
                </div>

                {/* Sections */}
                {sections.length === 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-12 text-center">
                    <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {language === "ar" ? "لا توجد أقسام" : "No Sections Yet"}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === "ar" 
                        ? "أضف أقسام من اللوحة اليسرى لبناء تقريرك"
                        : "Add sections from the left panel to build your report"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sections.map((section, index) => (
                      <div key={section.id} className="border rounded-lg p-4 bg-background">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <Badge variant="outline">
                              {section.type === "text" && <Type className="h-3 w-3 mr-1" />}
                              {section.type === "chart" && <BarChart3 className="h-3 w-3 mr-1" />}
                              {section.type === "table" && <Table className="h-3 w-3 mr-1" />}
                              {section.type === "indicator" && <BarChart3 className="h-3 w-3 mr-1" />}
                              {section.type}
                            </Badge>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeSection(section.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <Input 
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            placeholder={language === "ar" ? "عنوان القسم" : "Section title"}
                          />
                          
                          {section.type === "text" && (
                            <Textarea 
                              value={section.content || ""}
                              onChange={(e) => updateSection(section.id, { content: e.target.value })}
                              placeholder={language === "ar" ? "أدخل النص هنا..." : "Enter text here..."}
                              rows={4}
                            />
                          )}
                          
                          {(section.type === "chart" || section.type === "indicator") && (
                            <Select 
                              value={section.indicator}
                              onValueChange={(value) => updateSection(section.id, { indicator: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={language === "ar" ? "اختر المؤشر" : "Select indicator"} />
                              </SelectTrigger>
                              <SelectContent>
                                {indicators.map(ind => (
                                  <SelectItem key={ind.value} value={ind.value}>
                                    {ind.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          {section.type === "chart" && (
                            <Select 
                              value={section.chartType}
                              onValueChange={(value) => updateSection(section.id, { chartType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={language === "ar" ? "نوع الرسم البياني" : "Chart type"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="line">{language === "ar" ? "خطي" : "Line"}</SelectItem>
                                <SelectItem value="bar">{language === "ar" ? "أعمدة" : "Bar"}</SelectItem>
                                <SelectItem value="area">{language === "ar" ? "مساحة" : "Area"}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          
                          {section.type === "table" && (
                            <div className="p-4 bg-muted/50 rounded text-center text-sm text-muted-foreground">
                              {language === "ar" 
                                ? "سيتم إنشاء الجدول تلقائياً بناءً على القطاعات المحددة"
                                : "Table will be auto-generated based on selected sectors"}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Generate Button */}
                <div className="mt-8 flex justify-end gap-4">
                  <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    {language === "ar" ? "معاينة كاملة" : "Full Preview"}
                  </Button>
                  <Button className="gap-2" onClick={handleGenerateReport}>
                    <Download className="h-4 w-4" />
                    {language === "ar" ? "إنشاء وتحميل" : "Generate & Download"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Premium Features Notice */}
            <Card className="mt-6 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                      {language === "ar" ? "ميزات متقدمة" : "Premium Features"}
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {language === "ar"
                        ? "الاشتراك المميز يتيح تقارير غير محدودة، تصدير PDF/Word، وجدولة التقارير الآلية."
                        : "Premium subscription unlocks unlimited reports, PDF/Word export, and automated report scheduling."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
