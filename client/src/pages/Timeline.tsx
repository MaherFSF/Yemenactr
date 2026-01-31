import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { StorytellingTimeline } from "@/components/timeline/StorytellingTimeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  Building2,
  Globe,
  Handshake,
  Banknote,
  Leaf,
  Fuel,
  ShoppingCart,
  Wheat,
  Construction,
  ChevronLeft,
  ChevronRight,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  ZoomIn,
  Clock
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { YETO_COLORS } from "@/lib/chartTheme";
import { economicEventsData, categoryLabels, getUniqueYears, type EconomicEvent } from "@shared/economic-events-data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Event categories with icons
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  conflict: AlertTriangle,
  banking: Building2,
  international: Globe,
  currency: Banknote,
  humanitarian: Handshake,
  recovery: Leaf,
  trade: ShoppingCart,
  oil: Fuel,
  fiscal: TrendingUp,
  food_security: Wheat,
  infrastructure: Construction,
};

// Severity colors
const severityColors = {
  critical: '#dc2626',
  major: '#f59e0b',
  moderate: '#3b82f6',
  minor: '#6b7280',
};

// Month names
const monthNames = {
  en: ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ar: ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

export default function Timeline() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'compact'>('timeline');
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);

  const years = getUniqueYears();
  
  // Filter events
  const filteredEvents = useMemo(() => {
    return economicEventsData.filter(event => {
      if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
      if (selectedYear !== 'all' && event.year !== parseInt(selectedYear)) return false;
      if (selectedSeverity !== 'all' && event.severity !== selectedSeverity) return false;
      return true;
    });
  }, [selectedCategory, selectedYear, selectedSeverity]);

  // Group events by year
  const eventsByYear = useMemo(() => {
    return filteredEvents.reduce((acc, event) => {
      if (!acc[event.year]) acc[event.year] = [];
      acc[event.year].push(event);
      return acc;
    }, {} as Record<number, EconomicEvent[]>);
  }, [filteredEvents]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const critical = filteredEvents.filter(e => e.severity === 'critical').length;
    const byCategory = Object.keys(categoryLabels).reduce((acc, cat) => {
      acc[cat] = filteredEvents.filter(e => e.category === cat).length;
      return acc;
    }, {} as Record<string, number>);
    return { total, critical, byCategory };
  }, [filteredEvents]);

  // Navigate years
  const navigateYear = (direction: 'prev' | 'next') => {
    if (selectedYear === 'all') {
      setSelectedYear(direction === 'prev' ? years[years.length - 1].toString() : years[0].toString());
    } else {
      const currentIndex = years.indexOf(parseInt(selectedYear));
      if (direction === 'prev' && currentIndex > 0) {
        setSelectedYear(years[currentIndex - 1].toString());
      } else if (direction === 'next' && currentIndex < years.length - 1) {
        setSelectedYear(years[currentIndex + 1].toString());
      }
    }
  };

  // Export timeline data
  const exportTimeline = () => {
    const data = filteredEvents.map(e => ({
      date: e.date,
      title: language === 'ar' ? e.titleAr : e.title,
      description: language === 'ar' ? e.descriptionAr : e.description,
      category: language === 'ar' ? categoryLabels[e.category].ar : categoryLabels[e.category].en,
      severity: e.severity,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yemen-economic-timeline.json';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Storytelling Timeline - New Enhanced View */}
      <StorytellingTimeline />
      
      {/* Divider */}
      <div className="container py-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-muted-foreground font-medium">
            {language === 'ar' ? 'أو استكشف الجدول الزمني الكلاسيكي' : 'Or explore the classic timeline'}
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      </div>
      
      {/* Classic Timeline Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Clock className="h-8 w-8" style={{ color: YETO_COLORS.navy }} />
            <h1 className="text-3xl md:text-4xl font-bold text-center" style={{ color: YETO_COLORS.navy }}>
              {language === 'ar' 
                ? 'الجدول الزمني الاقتصادي التفاعلي لليمن'
                : 'Interactive Economic Timeline for Yemen'}
            </h1>
          </div>
          <p className="text-center text-muted-foreground text-lg">
            {language === 'ar' 
              ? `2010-2026 • ${stats.total} حدث اقتصادي موثق`
              : `2010-2026 • ${stats.total} Documented Economic Events`}
          </p>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                {stats.critical} {language === 'ar' ? 'حدث حرج' : 'Critical Events'}
              </span>
            </div>
            {Object.entries(categoryLabels).slice(0, 5).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }} />
                <span className="text-sm text-gray-600">
                  {stats.byCategory[key] || 0} {language === 'ar' ? label.ar : label.en}
                </span>
              </div>
            ))}
          </div>
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
              {Object.entries(categoryLabels).map(([key, cat]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    {language === 'ar' ? cat.ar : cat.en}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9"
              onClick={() => navigateYear('prev')}
              disabled={selectedYear === years[0].toString()}
            >
              {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
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
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9"
              onClick={() => navigateYear('next')}
              disabled={selectedYear === years[years.length - 1].toString()}
            >
              {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={language === 'ar' ? 'الأهمية' : 'Severity'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'جميع المستويات' : 'All Levels'}</SelectItem>
              <SelectItem value="critical">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  {language === 'ar' ? 'حرج' : 'Critical'}
                </div>
              </SelectItem>
              <SelectItem value="major">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  {language === 'ar' ? 'رئيسي' : 'Major'}
                </div>
              </SelectItem>
              <SelectItem value="moderate">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  {language === 'ar' ? 'متوسط' : 'Moderate'}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="gap-2" onClick={exportTimeline}>
            <Download className="h-4 w-4" />
            {language === 'ar' ? 'تصدير' : 'Export'}
          </Button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex justify-center mt-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <TabsList>
              <TabsTrigger value="timeline">
                {language === 'ar' ? 'عرض الجدول الزمني' : 'Timeline View'}
              </TabsTrigger>
              <TabsTrigger value="grid">
                {language === 'ar' ? 'عرض الشبكة' : 'Grid View'}
              </TabsTrigger>
              <TabsTrigger value="compact">
                {language === 'ar' ? 'عرض مضغوط' : 'Compact View'}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Year Navigation Bar */}
      <div className="container pb-4">
        <div className="flex justify-center gap-1 flex-wrap">
          {years.map(year => {
            const yearEvents = economicEventsData.filter(e => e.year === year);
            const hasCritical = yearEvents.some(e => e.severity === 'critical');
            const isSelected = selectedYear === year.toString();
            
            return (
              <TooltipProvider key={year}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-8 px-3 text-xs",
                        hasCritical && !isSelected && "border-red-300 bg-red-50"
                      )}
                      onClick={() => setSelectedYear(year.toString())}
                    >
                      {year}
                      {hasCritical && <span className="ml-1 w-2 h-2 rounded-full bg-red-500" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{yearEvents.length} {language === 'ar' ? 'أحداث' : 'events'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="container pb-16">
        {viewMode === 'timeline' && (
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical line */}
            <div 
              className={cn(
                "absolute top-0 bottom-0 w-1 bg-gradient-to-b from-[#dc2626] via-[#C0A030] to-[#2e8b6e]",
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
                  {events.sort((a, b) => a.month - b.month).map((event) => {
                    const catLabel = categoryLabels[event.category];
                    const Icon = categoryIcons[event.category] || Globe;
                    
                    return (
                      <div key={event.id} className="relative">
                        {/* Connection dot */}
                        <div 
                          className={cn(
                            "absolute top-6 w-6 h-6 rounded-full border-4 border-white shadow-lg flex items-center justify-center",
                            isRTL ? "-right-[3.25rem] md:-right-[calc(30%-0.75rem)]" : "-left-[3.25rem] md:-left-[calc(30%-0.75rem)]"
                          )}
                          style={{ backgroundColor: catLabel.color }}
                        >
                          <Icon className="h-3 w-3 text-white" />
                        </div>

                        {/* Event card */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Card 
                              className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                              style={{ borderLeftColor: catLabel.color, borderLeftWidth: '4px' }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      <Badge 
                                        variant="secondary" 
                                        className="text-white text-xs"
                                        style={{ backgroundColor: catLabel.color }}
                                      >
                                        {language === 'ar' ? catLabel.ar : catLabel.en}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {monthNames[language === 'ar' ? 'ar' : 'en'][event.month]} {event.year}
                                        {event.day && `, ${event.day}`}
                                      </span>
                                      {event.severity === 'critical' && (
                                        <Badge variant="destructive" className="text-xs">
                                          {language === 'ar' ? 'حرج' : 'Critical'}
                                        </Badge>
                                      )}
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2" style={{ color: YETO_COLORS.navy }}>
                                      {language === 'ar' ? event.titleAr : event.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm line-clamp-3">
                                      {language === 'ar' ? event.descriptionAr : event.description}
                                    </p>
                                    
                                    {/* Economic Impact Preview */}
                                    {event.economicImpact && (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {event.economicImpact.gdpEffect && (
                                          <Badge variant="outline" className="text-xs gap-1">
                                            <TrendingDown className="h-3 w-3" />
                                            GDP
                                          </Badge>
                                        )}
                                        {event.economicImpact.currencyEffect && (
                                          <Badge variant="outline" className="text-xs gap-1">
                                            <Banknote className="h-3 w-3" />
                                            {language === 'ar' ? 'العملة' : 'Currency'}
                                          </Badge>
                                        )}
                                        {event.economicImpact.tradeEffect && (
                                          <Badge variant="outline" className="text-xs gap-1">
                                            <ShoppingCart className="h-3 w-3" />
                                            {language === 'ar' ? 'التجارة' : 'Trade'}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div 
                                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${catLabel.color}20` }}
                                  >
                                    <Icon className="h-5 w-5" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
                            <DialogHeader>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  className="text-white"
                                  style={{ backgroundColor: catLabel.color }}
                                >
                                  {language === 'ar' ? catLabel.ar : catLabel.en}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {event.date}
                                </span>
                                {event.severity === 'critical' && (
                                  <Badge variant="destructive">
                                    {language === 'ar' ? 'حدث حرج' : 'Critical Event'}
                                  </Badge>
                                )}
                              </div>
                              <DialogTitle className="text-2xl" style={{ color: YETO_COLORS.navy }}>
                                {language === 'ar' ? event.titleAr : event.title}
                              </DialogTitle>
                              <DialogDescription className="text-base mt-4">
                                {language === 'ar' ? event.descriptionAr : event.description}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {/* Event Image */}
                            {event.image && (
                              <div className="mt-4 rounded-lg overflow-hidden">
                                <img 
                                  src={event.image} 
                                  alt={language === 'ar' ? event.titleAr : event.title}
                                  className="w-full h-48 object-cover"
                                />
                              </div>
                            )}
                            
                            {/* Economic Impact Details */}
                            {event.economicImpact && (
                              <div className="mt-6">
                                <h4 className="font-semibold mb-3" style={{ color: YETO_COLORS.navy }}>
                                  {language === 'ar' ? 'التأثير الاقتصادي' : 'Economic Impact'}
                                </h4>
                                <div className="grid gap-3">
                                  {event.economicImpact.gdpEffect && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                      <TrendingDown className="h-5 w-5 text-red-500 mt-0.5" />
                                      <div>
                                        <p className="font-medium text-sm">
                                          {language === 'ar' ? 'تأثير الناتج المحلي' : 'GDP Effect'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {event.economicImpact.gdpEffect}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {event.economicImpact.currencyEffect && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                      <Banknote className="h-5 w-5 text-amber-500 mt-0.5" />
                                      <div>
                                        <p className="font-medium text-sm">
                                          {language === 'ar' ? 'تأثير العملة' : 'Currency Effect'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {event.economicImpact.currencyEffect}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {event.economicImpact.tradeEffect && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                      <ShoppingCart className="h-5 w-5 text-blue-500 mt-0.5" />
                                      <div>
                                        <p className="font-medium text-sm">
                                          {language === 'ar' ? 'تأثير التجارة' : 'Trade Effect'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {event.economicImpact.tradeEffect}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {event.economicImpact.inflationEffect && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                      <TrendingUp className="h-5 w-5 text-orange-500 mt-0.5" />
                                      <div>
                                        <p className="font-medium text-sm">
                                          {language === 'ar' ? 'تأثير التضخم' : 'Inflation Effect'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {event.economicImpact.inflationEffect}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Sources */}
                            {event.sources && event.sources.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">{language === 'ar' ? 'المصادر:' : 'Sources:'}</span>{' '}
                                  {event.sources.join(', ')}
                                </p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => {
              const catLabel = categoryLabels[event.category];
              const Icon = categoryIcons[event.category] || Globe;
              
              return (
                <Card 
                  key={event.id}
                  className="overflow-hidden transition-all hover:shadow-lg"
                  style={{ borderTopColor: catLabel.color, borderTopWidth: '4px' }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className="text-white text-xs"
                        style={{ backgroundColor: catLabel.color }}
                      >
                        {language === 'ar' ? catLabel.ar : catLabel.en}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                    </div>
                    <h3 className="font-semibold mb-2" style={{ color: YETO_COLORS.navy }}>
                      {language === 'ar' ? event.titleAr : event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {language === 'ar' ? event.descriptionAr : event.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {viewMode === 'compact' && (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-2">
              {filteredEvents.map((event) => {
                const catLabel = categoryLabels[event.category];
                
                return (
                  <div 
                    key={event.id}
                    className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: catLabel.color }}
                    />
                    <span className="text-sm text-muted-foreground w-24 flex-shrink-0">{event.date}</span>
                    <span className="font-medium flex-1" style={{ color: YETO_COLORS.navy }}>
                      {language === 'ar' ? event.titleAr : event.title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {language === 'ar' ? catLabel.ar : catLabel.en}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {language === 'ar' ? 'لا توجد أحداث' : 'No Events Found'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'جرب تغيير معايير التصفية'
                : 'Try adjusting your filter criteria'}
            </p>
          </div>
        )}
      </div>

      {/* Category Legend */}
      <div className="bg-white border-t py-6">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? label.ar : label.en}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
