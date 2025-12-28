import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  Building2,
  Globe,
  Handshake,
  Banknote,
  Leaf
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { YETO_COLORS } from "@/lib/chartTheme";

// Event categories with colors matching the mockup
const eventCategories = {
  conflict: { color: '#dc2626', icon: AlertTriangle, labelEn: 'Conflict', labelAr: 'صراع' },
  banking: { color: '#C0A030', icon: Building2, labelEn: 'Banking/Financial', labelAr: 'مصرفي/مالي' },
  international: { color: '#3b82f6', icon: Globe, labelEn: 'International', labelAr: 'دولي' },
  currency: { color: '#f97316', icon: Banknote, labelEn: 'Currency', labelAr: 'عملة' },
  humanitarian: { color: '#22c55e', icon: Handshake, labelEn: 'Humanitarian', labelAr: 'إنساني' },
  recovery: { color: '#107040', icon: Leaf, labelEn: 'Recovery', labelAr: 'تعافي' },
};

// Timeline events data matching the mockup
const timelineEvents = [
  {
    id: 1,
    year: 2014,
    month: 'September',
    monthAr: 'سبتمبر',
    category: 'conflict',
    titleEn: 'Conflict Onset',
    titleAr: 'بداية الصراع',
    descriptionEn: 'Houthi rebels seize capital Sana\'a, escalating political crisis into armed conflict and disrupting economic activity.',
    descriptionAr: 'استيلاء المتمردين الحوثيين على العاصمة صنعاء، مما أدى إلى تصعيد الأزمة السياسية إلى صراع مسلح وتعطيل النشاط الاقتصادي.',
  },
  {
    id: 2,
    year: 2015,
    month: 'August',
    monthAr: 'أغسطس',
    category: 'banking',
    titleEn: 'Central Bank Split',
    titleAr: 'انقسام البنك المركزي',
    descriptionEn: 'Central Bank of Yemen headquarters moved to Aden, leading to dual exchange rates and a fractured financial system, causing severe inflation.',
    descriptionAr: 'نقل مقر البنك المركزي اليمني إلى عدن، مما أدى إلى أسعار صرف مزدوجة ونظام مالي متصدع، مسبباً تضخماً حاداً.',
  },
  {
    id: 3,
    year: 2016,
    month: 'February',
    monthAr: 'فبراير',
    category: 'international',
    titleEn: 'International Interventions: UN Humanitarian Response Plan',
    titleAr: 'التدخلات الدولية: خطة الاستجابة الإنسانية للأمم المتحدة',
    descriptionEn: 'Significant international aid efforts launched to address the worsening humanitarian crisis and support basic economic functions.',
    descriptionAr: 'إطلاق جهود مساعدات دولية كبيرة لمعالجة الأزمة الإنسانية المتفاقمة ودعم الوظائف الاقتصادية الأساسية.',
  },
  {
    id: 4,
    year: 2017,
    month: 'July',
    monthAr: 'يوليو',
    category: 'international',
    titleEn: 'International Interventions: World Bank Support',
    titleAr: 'التدخلات الدولية: دعم البنك الدولي',
    descriptionEn: 'World Bank approves grants for emergency response, focusing on health, nutrition, and infrastructure restoration.',
    descriptionAr: 'موافقة البنك الدولي على منح للاستجابة الطارئة، مع التركيز على الصحة والتغذية واستعادة البنية التحتية.',
  },
  {
    id: 5,
    year: 2018,
    month: 'December',
    monthAr: 'ديسمبر',
    category: 'humanitarian',
    titleEn: 'International Interventions: Stockholm Agreement',
    titleAr: 'التدخلات الدولية: اتفاق ستوكهولم',
    descriptionEn: 'Agreement reached on ceasefire in Hodeidah and prisoner exchange, aiming to de-escalate conflict and improve port access for aid.',
    descriptionAr: 'التوصل إلى اتفاق بشأن وقف إطلاق النار في الحديدة وتبادل الأسرى، بهدف تخفيف حدة الصراع وتحسين وصول المساعدات عبر الميناء.',
  },
  {
    id: 6,
    year: 2020,
    month: 'April',
    monthAr: 'أبريل',
    category: 'international',
    titleEn: 'International Interventions: G20 Debt Relief Initiative',
    titleAr: 'التدخلات الدولية: مبادرة مجموعة العشرين لتخفيف الديون',
    descriptionEn: 'Yemen participates in the G20\'s Debt Service Suspension Initiative (DSSI) to free up resources for COVID-19 response and economic stability.',
    descriptionAr: 'مشاركة اليمن في مبادرة تعليق خدمة الدين لمجموعة العشرين لتوفير الموارد للاستجابة لكوفيد-19 والاستقرار الاقتصادي.',
  },
  {
    id: 7,
    year: 2022,
    month: 'January',
    monthAr: 'يناير',
    category: 'currency',
    titleEn: 'Currency Reforms',
    titleAr: 'إصلاحات العملة',
    descriptionEn: 'Central Bank in Aden implements new measures to stabilize the rial, unify exchange rates, and curb illicit financial activities.',
    descriptionAr: 'تنفيذ البنك المركزي في عدن إجراءات جديدة لتثبيت الريال وتوحيد أسعار الصرف والحد من الأنشطة المالية غير المشروعة.',
  },
  {
    id: 8,
    year: 2023,
    month: 'March',
    monthAr: 'مارس',
    category: 'humanitarian',
    titleEn: 'International Interventions: UN-Led Peace Efforts',
    titleAr: 'التدخلات الدولية: جهود السلام بقيادة الأمم المتحدة',
    descriptionEn: 'Renewed diplomatic initiatives and temporary truces aim to pave the way for a comprehensive peace settlement and economic recovery.',
    descriptionAr: 'تهدف المبادرات الدبلوماسية المتجددة والهدن المؤقتة إلى تمهيد الطريق لتسوية سلام شاملة وتعافٍ اقتصادي.',
  },
  {
    id: 9,
    year: 2024,
    month: 'January',
    monthAr: 'يناير',
    category: 'recovery',
    titleEn: 'Recovery Initiatives',
    titleAr: 'مبادرات التعافي',
    descriptionEn: 'Launch of national recovery and reconstruction framework, focusing on rebuilding infrastructure, supporting small businesses, and attracting investment for sustainable growth.',
    descriptionAr: 'إطلاق إطار التعافي وإعادة الإعمار الوطني، مع التركيز على إعادة بناء البنية التحتية ودعم الشركات الصغيرة وجذب الاستثمار للنمو المستدام.',
  },
];

export default function Timeline() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const years = Array.from(new Set(timelineEvents.map(e => e.year))).sort();
  
  const filteredEvents = timelineEvents.filter(event => {
    if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
    if (selectedYear !== 'all' && event.year !== parseInt(selectedYear)) return false;
    return true;
  });

  // Group events by year
  const eventsByYear = filteredEvents.reduce((acc, event) => {
    if (!acc[event.year]) acc[event.year] = [];
    acc[event.year].push(event);
    return acc;
  }, {} as Record<number, typeof timelineEvents>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2" style={{ color: YETO_COLORS.navy }}>
            {language === 'ar' 
              ? 'الجدول الزمني الاقتصادي التفاعلي لليمن: 2014-2024'
              : 'Interactive Economic Timeline for Yemen: 2014-2024'}
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="container py-6">
        <div className="flex flex-wrap items-center gap-4 justify-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {language === 'ar' ? 'تصفية حسب:' : 'Filter by:'}
            </span>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={language === 'ar' ? 'الفئة' : 'Category'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</SelectItem>
              {Object.entries(eventCategories).map(([key, cat]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    {language === 'ar' ? cat.labelAr : cat.labelEn}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={language === 'ar' ? 'السنة' : 'Year'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'جميع السنوات' : 'All Years'}</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {language === 'ar' ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="container pb-16">
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div 
            className={cn(
              "absolute top-0 bottom-0 w-1 bg-gradient-to-b from-[#dc2626] via-[#C0A030] to-[#107040]",
              isRTL ? "right-8 md:right-1/4" : "left-8 md:left-1/4"
            )}
          />

          {/* Events by year */}
          {Object.entries(eventsByYear).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([year, events]) => (
            <div key={year} className="relative mb-8">
              {/* Year marker */}
              <div 
                className={cn(
                  "absolute flex items-center",
                  isRTL ? "right-0" : "left-0"
                )}
              >
                <div className="text-4xl font-bold text-gray-300">
                  {year}
                </div>
              </div>

              {/* Events for this year */}
              <div className={cn("space-y-6", isRTL ? "mr-20 md:mr-[30%]" : "ml-20 md:ml-[30%]")}>
                {events.map((event) => {
                  const category = eventCategories[event.category as keyof typeof eventCategories];
                  const Icon = category.icon;
                  
                  return (
                    <div key={event.id} className="relative">
                      {/* Connection dot */}
                      <div 
                        className={cn(
                          "absolute top-6 w-6 h-6 rounded-full border-4 border-white shadow-lg flex items-center justify-center",
                          isRTL ? "-right-[3.25rem] md:-right-[calc(30%-0.75rem)]" : "-left-[3.25rem] md:-left-[calc(30%-0.75rem)]"
                        )}
                        style={{ backgroundColor: category.color }}
                      >
                        <Icon className="h-3 w-3 text-white" />
                      </div>

                      {/* Event card */}
                      <Card 
                        className="overflow-hidden transition-all hover:shadow-lg"
                        style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant="outline"
                                  style={{ 
                                    borderColor: category.color, 
                                    color: category.color,
                                    backgroundColor: `${category.color}10`
                                  }}
                                >
                                  {language === 'ar' ? category.labelAr : category.labelEn}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {language === 'ar' ? event.monthAr : event.month} {event.year}
                                </span>
                              </div>
                              <h3 className="font-bold text-lg mb-2" style={{ color: YETO_COLORS.navy }}>
                                {language === 'ar' ? event.titleAr : event.titleEn}
                              </h3>
                              <p className="text-muted-foreground text-sm leading-relaxed">
                                {language === 'ar' ? event.descriptionAr : event.descriptionEn}
                              </p>
                            </div>
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              <Icon className="h-6 w-6" style={{ color: category.color }} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border-t py-8">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(eventCategories).map(([key, cat]) => {
              const Icon = cat.icon;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Icon className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-sm">
                    {language === 'ar' ? cat.labelAr : cat.labelEn}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
