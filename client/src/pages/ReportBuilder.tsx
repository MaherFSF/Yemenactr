import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  LineChart,
  BarChart3,
  PieChart,
  Table,
  Map,
  Calendar,
  TrendingUp,
  Grid3X3,
  Image,
  Upload
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { YETO_COLORS } from "@/lib/chartTheme";

// Visualization types matching the mockup
const visualizations = [
  { id: 'line', icon: LineChart, labelEn: 'Line Chart', labelAr: 'رسم بياني خطي' },
  { id: 'bar', icon: BarChart3, labelEn: 'Bar Chart', labelAr: 'رسم بياني شريطي' },
  { id: 'area', icon: TrendingUp, labelEn: 'Stacked Area Chart', labelAr: 'رسم بياني مساحي' },
  { id: 'scatter', icon: Grid3X3, labelEn: 'Scatter Plot', labelAr: 'مخطط مبعثر' },
  { id: 'table', icon: Table, labelEn: 'Table View', labelAr: 'عرض جدولي' },
  { id: 'heatmap', icon: Map, labelEn: 'Heat Map', labelAr: 'خريطة حرارية' },
  { id: 'infographic', icon: Image, labelEn: 'Infographic', labelAr: 'إنفوجرافيك' },
  { id: 'timeline', icon: Calendar, labelEn: 'Timeline', labelAr: 'خط زمني' },
];

// Data categories
const dataCategories = [
  { id: 'fx', labelEn: 'Exchange Rates', labelAr: 'أسعار الصرف' },
  { id: 'inflation', labelEn: 'Inflation & Prices', labelAr: 'التضخم والأسعار' },
  { id: 'trade', labelEn: 'Trade & Commerce', labelAr: 'التجارة' },
  { id: 'banking', labelEn: 'Banking & Finance', labelAr: 'البنوك والمالية' },
  { id: 'humanitarian', labelEn: 'Humanitarian', labelAr: 'الإنساني' },
  { id: 'energy', labelEn: 'Energy & Fuel', labelAr: 'الطاقة والوقود' },
  { id: 'food', labelEn: 'Food Security', labelAr: 'الأمن الغذائي' },
  { id: 'conflict', labelEn: 'Conflict Economy', labelAr: 'اقتصاد الصراع' },
];

// Color schemes
const colorSchemes = [
  { id: 'default', name: 'Default Green/Navy/Gold', colors: [YETO_COLORS.navy, YETO_COLORS.green, YETO_COLORS.gold] },
  { id: 'green', name: 'Green Palette', colors: ['#2e8b6e', '#15a060', '#2dd4bf'] },
  { id: 'navy', name: 'Navy Palette', colors: ['#2e8b6e', '#1a4a6e', '#3b82f6'] },
  { id: 'warm', name: 'Warm Palette', colors: ['#C0A030', '#f59e0b', '#ef4444'] },
];

export default function ReportBuilder() {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [selectedVisualizations, setSelectedVisualizations] = useState<string[]>(['line', 'area', 'table', 'heatmap']);
  const [reportSettings, setReportSettings] = useState({
    title: '',
    author: '',
    dateStart: '2023-01-01',
    dateEnd: '2023-12-31',
    colorScheme: 'default',
    language: 'en',
    logo: '/images/causeway-logo.png',
  });
  const [layoutSections, setLayoutSections] = useState<{ id: string; type: string; title: string }[]>([]);

  const steps = [
    { id: 1, labelEn: 'Select Data', labelAr: 'اختر البيانات' },
    { id: 2, labelEn: 'Choose Visualizations', labelAr: 'اختر الرسوم البيانية' },
    { id: 3, labelEn: 'Customize Layout', labelAr: 'تخصيص التخطيط' },
    { id: 4, labelEn: 'Export', labelAr: 'تصدير' },
  ];

  const toggleDataSelection = (id: string) => {
    setSelectedData(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleVisualization = (id: string) => {
    setSelectedVisualizations(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleExport = (format: string) => {
    toast.success(
      language === 'ar' 
        ? `جاري تصدير التقرير بصيغة ${format}...`
        : `Exporting report as ${format}...`
    );
  };

  const addToReport = () => {
    const newSection = {
      id: Date.now().toString(),
      type: selectedVisualizations[0] || 'line',
      title: language === 'ar' ? 'قسم جديد' : 'New Section',
    };
    setLayoutSections([...layoutSections, newSection]);
    toast.success(language === 'ar' ? 'تمت الإضافة إلى التقرير' : 'Added to report');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2" style={{ color: YETO_COLORS.navy }}>
            {language === 'ar' ? 'إنشاء تقرير مخصص' : 'Generate Custom Report'}
          </h1>
        </div>
      </div>

      {/* Wizard Container */}
      <div className="container py-8">
        <Card className="max-w-5xl mx-auto shadow-xl border-0">
          <CardContent className="p-0">
            {/* Step Indicator */}
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div 
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                      currentStep === step.id 
                        ? "bg-[#2e8b6e] text-white" 
                        : currentStep > step.id 
                          ? "bg-[#2e8b6e]/20 text-[#2e8b6e]"
                          : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="w-4 text-center">{step.id}</span>
                    )}
                    <span className="font-medium text-sm">
                      {language === 'ar' ? step.labelAr : step.labelEn}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-12 h-0.5 mx-2",
                      currentStep > step.id ? "bg-[#2e8b6e]" : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="p-6">
              {/* Step 1: Select Data */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    {language === 'ar' ? 'اختر فئات البيانات' : 'Select Data Categories'}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {dataCategories.map(cat => (
                      <div
                        key={cat.id}
                        onClick={() => toggleDataSelection(cat.id)}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all text-center",
                          selectedData.includes(cat.id)
                            ? "border-[#2e8b6e] bg-[#2e8b6e]/10"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {selectedData.includes(cat.id) && (
                          <Check className="h-5 w-5 text-[#2e8b6e] mx-auto mb-2" />
                        )}
                        <span className="font-medium">
                          {language === 'ar' ? cat.labelAr : cat.labelEn}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Choose Visualizations */}
              {currentStep === 2 && (
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Visualization Grid */}
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">
                      {language === 'ar' ? 'اختر الرسوم البيانية' : 'Choose Visualizations'}
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                      {visualizations.map(viz => {
                        const Icon = viz.icon;
                        const isSelected = selectedVisualizations.includes(viz.id);
                        return (
                          <div
                            key={viz.id}
                            onClick={() => toggleVisualization(viz.id)}
                            className={cn(
                              "p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center gap-2",
                              isSelected
                                ? "border-[#2e8b6e] bg-[#2e8b6e]/10"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            {isSelected && (
                              <div className="absolute top-2 left-2">
                                <Check className="h-4 w-4 text-[#2e8b6e]" />
                              </div>
                            )}
                            <div className={cn(
                              "w-16 h-16 rounded-lg flex items-center justify-center",
                              isSelected ? "bg-[#2e8b6e]/20" : "bg-gray-100"
                            )}>
                              <Icon className={cn(
                                "h-8 w-8",
                                isSelected ? "text-[#2e8b6e]" : "text-gray-500"
                              )} />
                            </div>
                            <span className="text-sm font-medium text-center">
                              {language === 'ar' ? viz.labelAr : viz.labelEn}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Report Settings */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">
                      {language === 'ar' ? 'إعدادات التقرير' : 'Report Settings'}
                    </h2>
                    
                    <div>
                      <Label>{language === 'ar' ? 'عنوان التقرير' : 'Report Title'}</Label>
                      <Input
                        value={reportSettings.title}
                        onChange={(e) => setReportSettings({ ...reportSettings, title: e.target.value })}
                        placeholder={language === 'ar' ? 'أدخل عنوان التقرير...' : 'Enter report title...'}
                      />
                    </div>

                    <div>
                      <Label>{language === 'ar' ? 'اسم المؤلف' : 'Author Name'}</Label>
                      <Input
                        value={reportSettings.author}
                        onChange={(e) => setReportSettings({ ...reportSettings, author: e.target.value })}
                        placeholder={language === 'ar' ? 'أدخل اسم المؤلف...' : 'Enter author name...'}
                      />
                    </div>

                    <div>
                      <Label>{language === 'ar' ? 'النطاق الزمني' : 'Date Range'}</Label>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Jan 1, 2023 - Dec 31, 2023</span>
                      </div>
                    </div>

                    <div>
                      <Label>{language === 'ar' ? 'الشعار' : 'Logo'}</Label>
                      <div className="mt-2 p-4 border rounded-lg flex flex-col items-center gap-2 bg-white">
                        <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center">
                          <img src="/images/causeway-logo.png" alt="YETO" className="w-16 h-16 object-contain" />
                        </div>
                        <span className="font-bold text-lg" style={{ color: YETO_COLORS.navy }}>YETO</span>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Upload className="h-4 w-4" />
                          {language === 'ar' ? 'تحميل شعار جديد' : 'Upload New Logo'}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>{language === 'ar' ? 'نظام الألوان' : 'Color Scheme'}</Label>
                      <Select
                        value={reportSettings.colorScheme}
                        onValueChange={(value) => setReportSettings({ ...reportSettings, colorScheme: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorSchemes.map(scheme => (
                            <SelectItem key={scheme.id} value={scheme.id}>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {scheme.colors.map((color, i) => (
                                    <div
                                      key={i}
                                      className="w-4 h-4 rounded-sm -ml-1 first:ml-0 border border-white"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                                <span>{scheme.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>{language === 'ar' ? 'اللغة' : 'Language'}</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant={reportSettings.language === 'en' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setReportSettings({ ...reportSettings, language: 'en' })}
                          className={reportSettings.language === 'en' ? 'bg-[#2e8b6e]' : ''}
                        >
                          English
                        </Button>
                        <Button
                          variant={reportSettings.language === 'ar' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setReportSettings({ ...reportSettings, language: 'ar' })}
                          className={reportSettings.language === 'ar' ? 'bg-[#2e8b6e]' : ''}
                        >
                          العربية
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Customize Layout */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    {language === 'ar' ? 'تخصيص تخطيط التقرير' : 'Customize Report Layout'}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        {language === 'ar' 
                          ? 'اسحب وأفلت الأقسام لترتيبها'
                          : 'Drag and drop sections to arrange them'}
                      </p>
                      <div className="space-y-2">
                        {layoutSections.length === 0 ? (
                          <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                            {language === 'ar' 
                              ? 'لم تتم إضافة أقسام بعد. انقر على "إضافة إلى التقرير" لإضافة رسوم بيانية.'
                              : 'No sections added yet. Click "Add to Report" to add visualizations.'}
                          </div>
                        ) : (
                          layoutSections.map((section, index) => (
                            <div key={section.id} className="p-4 border rounded-lg bg-white flex items-center gap-4">
                              <span className="text-muted-foreground">{index + 1}</span>
                              <div className="flex-1">
                                <span className="font-medium">{section.title}</span>
                                <span className="text-sm text-muted-foreground ml-2">({section.type})</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-4">
                        {language === 'ar' ? 'معاينة' : 'Preview'}
                      </h3>
                      <div className="aspect-[8.5/11] bg-white rounded-lg shadow-inner border p-4">
                        <div className="h-full flex flex-col">
                          <div className="text-center mb-4">
                            <h4 className="font-bold">{reportSettings.title || 'Report Title'}</h4>
                            <p className="text-xs text-muted-foreground">{reportSettings.author || 'Author'}</p>
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            {layoutSections.slice(0, 4).map((section) => (
                              <div key={section.id} className="bg-gray-100 rounded p-2 text-xs text-center">
                                {section.type}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Export */}
              {currentStep === 4 && (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-[#2e8b6e]" />
                  <h2 className="text-2xl font-semibold mb-2">
                    {language === 'ar' ? 'تقريرك جاهز!' : 'Your Report is Ready!'}
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    {language === 'ar' 
                      ? 'اختر صيغة التصدير المفضلة لديك'
                      : 'Choose your preferred export format'}
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={() => handleExport('PDF')}
                      className="gap-2 bg-[#2e8b6e] hover:bg-[#2e8b6e]/90"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button 
                      onClick={() => handleExport('Excel')}
                      variant="outline"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Excel
                    </Button>
                    <Button 
                      onClick={() => handleExport('JSON')}
                      variant="outline"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      JSON
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="flex gap-2">
                {currentStep === 2 && (
                  <>
                    <Button 
                      onClick={addToReport}
                      className="gap-2 bg-[#2e8b6e] hover:bg-[#2e8b6e]/90"
                    >
                      {language === 'ar' ? 'إضافة إلى التقرير' : 'Add to Report'}
                    </Button>
                    <Button variant="outline" className="gap-2">
                      {language === 'ar' ? 'معاينة التقرير' : 'Preview Report'}
                    </Button>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  {language === 'ar' ? 'السابق' : 'Back'}
                </Button>
                {currentStep < 4 && (
                  <Button
                    onClick={handleNext}
                    className="gap-2 bg-[#2e8b6e] hover:bg-[#2e8b6e]/90"
                  >
                    {language === 'ar' ? 'التالي' : 'Next'}
                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
