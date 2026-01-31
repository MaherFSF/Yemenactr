import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, ChevronLeft, ChevronRight, Play, Pause, 
  ZoomIn, ZoomOut, BookOpen, TrendingUp, TrendingDown,
  AlertTriangle, Building2, Globe, Banknote, Wheat
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { YETO_COLORS } from "@/lib/chartTheme";

// Granularity types
type Granularity = 'day' | 'week' | 'month' | 'quarter' | 'year';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  impactScore: number;
  sectors: string[];
  indicators: string[];
  beforeValue?: number;
  afterValue?: number;
  sources: string[];
}

interface StoryChapter {
  id: string;
  title: string;
  titleAr: string;
  narrative: string;
  narrativeAr: string;
  events: TimelineEvent[];
  startDate: string;
  endDate: string;
  theme: string;
}

// Sample story chapters for Yemen's economic history
const storyChapters: StoryChapter[] = [
  {
    id: 'pre-conflict',
    title: 'Pre-Conflict Stability (2010-2014)',
    titleAr: 'الاستقرار قبل الصراع (2010-2014)',
    narrative: 'Yemen maintained relative economic stability with unified monetary policy, stable exchange rates around 215 YER/USD, and functioning institutions. Oil exports provided 70% of government revenue.',
    narrativeAr: 'حافظ اليمن على استقرار اقتصادي نسبي مع سياسة نقدية موحدة وأسعار صرف مستقرة حول 215 ريال/دولار ومؤسسات عاملة. وفرت صادرات النفط 70% من إيرادات الحكومة.',
    events: [],
    startDate: '2010-01-01',
    endDate: '2014-12-31',
    theme: 'stability'
  },
  {
    id: 'conflict-onset',
    title: 'Conflict Onset & Economic Collapse (2015-2016)',
    titleAr: 'بداية الصراع والانهيار الاقتصادي (2015-2016)',
    narrative: 'The conflict erupted in March 2015, triggering immediate economic collapse. GDP contracted by 28%, the Central Bank split between Aden and Sanaa, and the currency began its dramatic depreciation.',
    narrativeAr: 'اندلع الصراع في مارس 2015، مما أدى إلى انهيار اقتصادي فوري. انكمش الناتج المحلي بنسبة 28%، وانقسم البنك المركزي بين عدن وصنعاء، وبدأت العملة انخفاضها الحاد.',
    events: [],
    startDate: '2015-01-01',
    endDate: '2016-12-31',
    theme: 'crisis'
  },
  {
    id: 'dual-economy',
    title: 'Emergence of Dual Economy (2017-2019)',
    titleAr: 'ظهور الاقتصاد المزدوج (2017-2019)',
    narrative: 'Two parallel economic systems emerged with different currencies, exchange rates, and regulations. The humanitarian crisis deepened with 80% of population requiring assistance.',
    narrativeAr: 'ظهر نظامان اقتصاديان متوازيان بعملات وأسعار صرف ولوائح مختلفة. تعمقت الأزمة الإنسانية مع حاجة 80% من السكان للمساعدة.',
    events: [],
    startDate: '2017-01-01',
    endDate: '2019-12-31',
    theme: 'fragmentation'
  },
  {
    id: 'pandemic-impact',
    title: 'COVID-19 & Compounding Crises (2020-2021)',
    titleAr: 'كوفيد-19 والأزمات المتراكمة (2020-2021)',
    narrative: 'The pandemic added another layer of crisis. Remittances dropped 70%, aid flows decreased, and food insecurity reached unprecedented levels.',
    narrativeAr: 'أضافت الجائحة طبقة أخرى من الأزمة. انخفضت التحويلات 70%، وتراجعت تدفقات المساعدات، ووصل انعدام الأمن الغذائي لمستويات غير مسبوقة.',
    events: [],
    startDate: '2020-01-01',
    endDate: '2021-12-31',
    theme: 'pandemic'
  },
  {
    id: 'truce-recovery',
    title: 'Truce & Fragile Recovery (2022-Present)',
    titleAr: 'الهدنة والتعافي الهش (2022-الحاضر)',
    narrative: 'The April 2022 truce brought temporary stability. Oil exports partially resumed, exchange rates stabilized somewhat, but structural challenges remain.',
    narrativeAr: 'جلبت هدنة أبريل 2022 استقراراً مؤقتاً. استؤنفت صادرات النفط جزئياً، واستقرت أسعار الصرف نوعاً ما، لكن التحديات الهيكلية لا تزال قائمة.',
    events: [],
    startDate: '2022-01-01',
    endDate: '2026-12-31',
    theme: 'recovery'
  }
];

// Theme colors
const themeColors: Record<string, string> = {
  stability: '#2e8b6e',
  crisis: '#dc2626',
  fragmentation: '#f59e0b',
  pandemic: '#7c3aed',
  recovery: '#3b82f6'
};

interface StorytellingTimelineProps {
  events?: TimelineEvent[];
  onEventSelect?: (event: TimelineEvent) => void;
}

export function StorytellingTimeline({ events = [], onEventSelect }: StorytellingTimelineProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  // State
  const [granularity, setGranularity] = useState<Granularity>('month');
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2015-03-26'));
  const [viewMode, setViewMode] = useState<'story' | 'explore' | 'compare'>('story');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Auto-play story mode
  useEffect(() => {
    if (isPlaying && viewMode === 'story') {
      const timer = setInterval(() => {
        setCurrentChapter(prev => {
          if (prev >= storyChapters.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 8000); // 8 seconds per chapter
      return () => clearInterval(timer);
    }
  }, [isPlaying, viewMode]);
  
  // Generate time periods based on granularity
  const timePeriods = useMemo(() => {
    const periods: { start: Date; end: Date; label: string; labelAr: string }[] = [];
    const startYear = 2010;
    const endYear = 2026;
    
    for (let year = startYear; year <= endYear; year++) {
      if (granularity === 'year') {
        periods.push({
          start: new Date(year, 0, 1),
          end: new Date(year, 11, 31),
          label: year.toString(),
          labelAr: year.toString()
        });
      } else if (granularity === 'quarter') {
        for (let q = 0; q < 4; q++) {
          periods.push({
            start: new Date(year, q * 3, 1),
            end: new Date(year, q * 3 + 2, 31),
            label: `Q${q + 1} ${year}`,
            labelAr: `ر${q + 1} ${year}`
          });
        }
      } else if (granularity === 'month') {
        for (let m = 0; m < 12; m++) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
          periods.push({
            start: new Date(year, m, 1),
            end: new Date(year, m + 1, 0),
            label: `${monthNames[m]} ${year}`,
            labelAr: `${monthNamesAr[m]} ${year}`
          });
        }
      } else if (granularity === 'week') {
        // Generate weeks for current selected year only to avoid too many
        const currentYear = selectedDate.getFullYear();
        if (year === currentYear) {
          for (let w = 0; w < 52; w++) {
            const start = new Date(year, 0, 1 + w * 7);
            const end = new Date(year, 0, 7 + w * 7);
            periods.push({
              start,
              end,
              label: `W${w + 1} ${year}`,
              labelAr: `أ${w + 1} ${year}`
            });
          }
        }
      } else if (granularity === 'day') {
        // Generate days for current selected month only
        const currentYear = selectedDate.getFullYear();
        const currentMonth = selectedDate.getMonth();
        if (year === currentYear) {
          const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
          for (let d = 1; d <= daysInMonth; d++) {
            periods.push({
              start: new Date(year, currentMonth, d),
              end: new Date(year, currentMonth, d),
              label: `${d}/${currentMonth + 1}/${year}`,
              labelAr: `${d}/${currentMonth + 1}/${year}`
            });
          }
        }
      }
    }
    
    return periods;
  }, [granularity, selectedDate]);
  
  // Navigate timeline
  const navigate = useCallback((direction: 'prev' | 'next') => {
    const increment = granularity === 'day' ? 1 : 
                      granularity === 'week' ? 7 :
                      granularity === 'month' ? 30 :
                      granularity === 'quarter' ? 90 : 365;
    
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'next') {
        newDate.setDate(newDate.getDate() + increment);
      } else {
        newDate.setDate(newDate.getDate() - increment);
      }
      return newDate;
    });
  }, [granularity]);
  
  // Current chapter data
  const chapter = storyChapters[currentChapter];
  
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mode Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList>
            <TabsTrigger value="story" className="gap-2">
              <BookOpen className="h-4 w-4" />
              {language === 'ar' ? 'وضع القصة' : 'Story Mode'}
            </TabsTrigger>
            <TabsTrigger value="explore" className="gap-2">
              <Calendar className="h-4 w-4" />
              {language === 'ar' ? 'استكشاف' : 'Explore'}
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              {language === 'ar' ? 'مقارنة' : 'Compare'}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Granularity Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {language === 'ar' ? 'الدقة:' : 'Granularity:'}
          </span>
          <Select value={granularity} onValueChange={(v) => setGranularity(v as Granularity)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{language === 'ar' ? 'يومي' : 'Day'}</SelectItem>
              <SelectItem value="week">{language === 'ar' ? 'أسبوعي' : 'Week'}</SelectItem>
              <SelectItem value="month">{language === 'ar' ? 'شهري' : 'Month'}</SelectItem>
              <SelectItem value="quarter">{language === 'ar' ? 'ربع سنوي' : 'Quarter'}</SelectItem>
              <SelectItem value="year">{language === 'ar' ? 'سنوي' : 'Year'}</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Story Mode View */}
      {viewMode === 'story' && (
        <Card className="overflow-hidden">
          <div 
            className="h-2" 
            style={{ backgroundColor: themeColors[chapter.theme] }}
          />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge 
                  variant="outline" 
                  style={{ borderColor: themeColors[chapter.theme], color: themeColors[chapter.theme] }}
                >
                  {language === 'ar' ? `الفصل ${currentChapter + 1}` : `Chapter ${currentChapter + 1}`}
                </Badge>
                <CardTitle className="mt-2 text-2xl">
                  {language === 'ar' ? chapter.titleAr : chapter.title}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentChapter(prev => Math.max(0, prev - 1))}
                  disabled={currentChapter === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentChapter(prev => Math.min(storyChapters.length - 1, prev + 1))}
                  disabled={currentChapter === storyChapters.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {language === 'ar' ? chapter.narrativeAr : chapter.narrative}
            </p>
            
            {/* Chapter Progress */}
            <div className="flex gap-2 mt-4">
              {storyChapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => setCurrentChapter(idx)}
                  className={cn(
                    "flex-1 h-2 rounded-full transition-all",
                    idx === currentChapter ? "opacity-100" : "opacity-30 hover:opacity-60"
                  )}
                  style={{ backgroundColor: themeColors[ch.theme] }}
                />
              ))}
            </div>
            
            {/* Key Events in Chapter */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-700">
                      {language === 'ar' ? 'أحداث حرجة' : 'Critical Events'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {currentChapter === 1 ? '12' : currentChapter === 2 ? '8' : '3'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Banknote className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-[#2e8b6e]">
                      {language === 'ar' ? 'تأثير العملة' : 'Currency Impact'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentChapter === 0 ? '215' : currentChapter === 1 ? '370' : currentChapter === 2 ? '560' : currentChapter === 3 ? '890' : '1,620'} YER/USD
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wheat className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-amber-700">
                      {language === 'ar' ? 'انعدام الأمن الغذائي' : 'Food Insecurity'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {currentChapter === 0 ? '32%' : currentChapter === 1 ? '48%' : currentChapter === 2 ? '65%' : currentChapter === 3 ? '73%' : '61%'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Explore Mode View */}
      {viewMode === 'explore' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {language === 'ar' ? 'استكشاف الجدول الزمني' : 'Timeline Explorer'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {selectedDate.toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: granularity === 'day' ? 'numeric' : undefined
                  })}
                </span>
                <Button variant="outline" size="icon" onClick={() => navigate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Timeline Ruler */}
            <div 
              className="relative h-16 bg-gray-100 rounded-lg overflow-x-auto"
              style={{ transform: `scaleX(${zoomLevel})`, transformOrigin: 'left' }}
            >
              <div className="absolute inset-0 flex">
                {timePeriods.slice(0, 50).map((period, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex-shrink-0 border-r border-gray-300 flex items-end justify-center pb-1 cursor-pointer hover:bg-gray-200 transition-colors",
                      granularity === 'year' ? 'w-20' : granularity === 'quarter' ? 'w-16' : 'w-12'
                    )}
                    onClick={() => setSelectedDate(period.start)}
                  >
                    <span className="text-xs text-gray-600 truncate px-1">
                      {language === 'ar' ? period.labelAr : period.label}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Event Markers */}
              <div className="absolute top-0 left-0 right-0 h-8 flex items-center">
                {/* Sample event markers - would be populated from actual events */}
                <div 
                  className="absolute w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:scale-150 transition-transform"
                  style={{ left: '15%' }}
                  title="Conflict Onset - March 2015"
                />
                <div 
                  className="absolute w-3 h-3 rounded-full bg-amber-500 cursor-pointer hover:scale-150 transition-transform"
                  style={{ left: '35%' }}
                  title="CBY Split - September 2016"
                />
                <div 
                  className="absolute w-3 h-3 rounded-full bg-blue-500 cursor-pointer hover:scale-150 transition-transform"
                  style={{ left: '70%' }}
                  title="Truce - April 2022"
                />
              </div>
            </div>
            
            {/* Cross-Sector Impact View */}
            <div className="mt-6">
              <h4 className="font-medium mb-4">
                {language === 'ar' ? 'التأثير عبر القطاعات' : 'Cross-Sector Impact'}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Building2, label: language === 'ar' ? 'البنوك' : 'Banking', impact: -45 },
                  { icon: Globe, label: language === 'ar' ? 'التجارة' : 'Trade', impact: -62 },
                  { icon: Wheat, label: language === 'ar' ? 'الغذاء' : 'Food', impact: -38 },
                  { icon: Banknote, label: language === 'ar' ? 'العملة' : 'Currency', impact: -87 },
                ].map((sector, idx) => (
                  <Card key={idx} className="bg-gray-50">
                    <CardContent className="p-4 flex items-center gap-3">
                      <sector.icon className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="text-sm text-muted-foreground">{sector.label}</p>
                        <p className={cn(
                          "text-lg font-bold",
                          sector.impact < 0 ? "text-red-600" : "text-green-600"
                        )}>
                          {sector.impact > 0 ? '+' : ''}{sector.impact}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Compare Mode View */}
      {viewMode === 'compare' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ar' ? 'مقارنة الفترات' : 'Period Comparison'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Period 1 */}
              <Card className="border-2 border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-lg text-[#2e8b6e]">
                    {language === 'ar' ? 'الفترة الأولى' : 'Period 1'}
                  </CardTitle>
                  <p className="text-sm text-blue-600">2010-2014 (Pre-Conflict)</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GDP Growth</span>
                    <span className="font-medium text-green-600">+2.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exchange Rate</span>
                    <span className="font-medium">215 YER/USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inflation</span>
                    <span className="font-medium">8.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Food Insecurity</span>
                    <span className="font-medium">32%</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Period 2 */}
              <Card className="border-2 border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-lg text-red-700">
                    {language === 'ar' ? 'الفترة الثانية' : 'Period 2'}
                  </CardTitle>
                  <p className="text-sm text-red-600">2015-2019 (Conflict)</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GDP Growth</span>
                    <span className="font-medium text-red-600">-28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exchange Rate</span>
                    <span className="font-medium">560 YER/USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inflation</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Food Insecurity</span>
                    <span className="font-medium">65%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Change Summary */}
            <Card className="mt-6 bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">
                  {language === 'ar' ? 'ملخص التغيير' : 'Change Summary'}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <TrendingDown className="h-6 w-6 text-red-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">-30.4%</p>
                    <p className="text-xs text-muted-foreground">GDP Change</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 text-red-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">+160%</p>
                    <p className="text-xs text-muted-foreground">FX Depreciation</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 text-red-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">+327%</p>
                    <p className="text-xs text-muted-foreground">Inflation Rise</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 text-red-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">+103%</p>
                    <p className="text-xs text-muted-foreground">Food Insecurity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default StorytellingTimeline;
