/**
 * Timeline Navigation Component - Section 7 Implementation
 * Shows events, documents, and indicators along the 2010→Present timeline
 */

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, FileText, TrendingUp, AlertTriangle, 
  Building2, Banknote, Ship, Droplet, Wheat, Heart,
  Swords, Users, Scale, Briefcase, Filter, ChevronDown
} from 'lucide-react';

// Event types for Yemen timeline
type EventCategory = 
  | 'political' 
  | 'military' 
  | 'economic' 
  | 'humanitarian' 
  | 'policy' 
  | 'international';

interface TimelineEvent {
  id: string;
  date: Date;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  category: EventCategory;
  impact: 'high' | 'medium' | 'low';
  sources: string[];
  relatedIndicators?: string[];
}

interface TimelineDocument {
  id: string;
  date: Date;
  title: { en: string; ar: string };
  type: 'report' | 'policy' | 'data' | 'analysis';
  source: string;
  url?: string;
}

interface TimelineIndicatorUpdate {
  id: string;
  date: Date;
  indicatorCode: string;
  indicatorName: { en: string; ar: string };
  value: number;
  previousValue?: number;
  change?: number;
  unit: string;
}

// Comprehensive Yemen timeline events 2010-Present
const yemenTimelineEvents: TimelineEvent[] = [
  {
    id: 'evt-001',
    date: new Date(2011, 0, 27),
    title: { en: 'Yemeni Revolution Begins', ar: 'بداية الثورة اليمنية' },
    description: { 
      en: 'Mass protests begin in Sanaa demanding political reform and end to Saleh regime',
      ar: 'بدء الاحتجاجات الجماهيرية في صنعاء للمطالبة بالإصلاح السياسي وإنهاء نظام صالح'
    },
    category: 'political',
    impact: 'high',
    sources: ['Reuters', 'Al Jazeera'],
    relatedIndicators: ['GDP_GROWTH', 'INFLATION']
  },
  {
    id: 'evt-002',
    date: new Date(2011, 10, 23),
    title: { en: 'GCC Initiative Signed', ar: 'توقيع المبادرة الخليجية' },
    description: {
      en: 'President Saleh signs GCC-brokered power transfer agreement',
      ar: 'الرئيس صالح يوقع اتفاق نقل السلطة برعاية مجلس التعاون الخليجي'
    },
    category: 'political',
    impact: 'high',
    sources: ['UN', 'GCC'],
    relatedIndicators: ['FDI', 'REMITTANCES']
  },
  {
    id: 'evt-003',
    date: new Date(2014, 8, 21),
    title: { en: 'Houthi Forces Enter Sanaa', ar: 'دخول قوات الحوثي صنعاء' },
    description: {
      en: 'Houthi forces take control of key government buildings in Sanaa',
      ar: 'قوات الحوثي تسيطر على المباني الحكومية الرئيسية في صنعاء'
    },
    category: 'military',
    impact: 'high',
    sources: ['UN', 'Reuters'],
    relatedIndicators: ['EXCHANGE_RATE', 'FOOD_PRICES']
  },
  {
    id: 'evt-004',
    date: new Date(2015, 2, 26),
    title: { en: 'Saudi-led Coalition Intervention', ar: 'تدخل التحالف بقيادة السعودية' },
    description: {
      en: 'Operation Decisive Storm begins with airstrikes against Houthi positions',
      ar: 'بدء عملية عاصفة الحزم بغارات جوية على مواقع الحوثيين'
    },
    category: 'military',
    impact: 'high',
    sources: ['Saudi MoD', 'UN'],
    relatedIndicators: ['OIL_IMPORTS', 'FOOD_IMPORTS', 'HUMANITARIAN_NEEDS']
  },
  {
    id: 'evt-005',
    date: new Date(2016, 8, 18),
    title: { en: 'Central Bank Relocated to Aden', ar: 'نقل البنك المركزي إلى عدن' },
    description: {
      en: 'IRG government relocates Central Bank of Yemen headquarters to Aden',
      ar: 'الحكومة الشرعية تنقل مقر البنك المركزي اليمني إلى عدن'
    },
    category: 'economic',
    impact: 'high',
    sources: ['CBY', 'IMF'],
    relatedIndicators: ['EXCHANGE_RATE_ADEN', 'EXCHANGE_RATE_SANAA', 'MONEY_SUPPLY']
  },
  {
    id: 'evt-006',
    date: new Date(2016, 11, 1),
    title: { en: 'Dual Currency System Emerges', ar: 'ظهور نظام العملة المزدوج' },
    description: {
      en: 'Sanaa authorities ban new banknotes, creating parallel currency systems',
      ar: 'سلطات صنعاء تحظر الأوراق النقدية الجديدة مما يخلق نظامين نقديين متوازيين'
    },
    category: 'economic',
    impact: 'high',
    sources: ['CBY Aden', 'CBY Sanaa'],
    relatedIndicators: ['EXCHANGE_RATE_ADEN', 'EXCHANGE_RATE_SANAA']
  },
  {
    id: 'evt-007',
    date: new Date(2018, 11, 13),
    title: { en: 'Stockholm Agreement', ar: 'اتفاق ستوكهولم' },
    description: {
      en: 'UN-brokered agreement on Hodeidah ceasefire and prisoner exchange',
      ar: 'اتفاق برعاية الأمم المتحدة بشأن وقف إطلاق النار في الحديدة وتبادل الأسرى'
    },
    category: 'political',
    impact: 'high',
    sources: ['UN', 'OSESGY'],
    relatedIndicators: ['PORT_THROUGHPUT', 'FOOD_IMPORTS']
  },
  {
    id: 'evt-008',
    date: new Date(2020, 2, 15),
    title: { en: 'First COVID-19 Case Reported', ar: 'الإبلاغ عن أول حالة كوفيد-19' },
    description: {
      en: 'Yemen confirms first COVID-19 case amid already dire humanitarian situation',
      ar: 'اليمن يؤكد أول حالة كوفيد-19 وسط وضع إنساني متردٍ أصلاً'
    },
    category: 'humanitarian',
    impact: 'high',
    sources: ['WHO', 'MoPHP'],
    relatedIndicators: ['HEALTH_FACILITIES', 'HUMANITARIAN_FUNDING']
  },
  {
    id: 'evt-009',
    date: new Date(2022, 3, 2),
    title: { en: 'UN-Mediated Truce', ar: 'الهدنة برعاية الأمم المتحدة' },
    description: {
      en: 'Two-month nationwide truce begins, later extended twice',
      ar: 'بدء هدنة وطنية لمدة شهرين، تم تمديدها لاحقاً مرتين'
    },
    category: 'political',
    impact: 'high',
    sources: ['UN', 'OSESGY'],
    relatedIndicators: ['FUEL_IMPORTS', 'FLIGHTS', 'EXCHANGE_RATE']
  },
  {
    id: 'evt-010',
    date: new Date(2023, 3, 9),
    title: { en: 'Saudi-Iran Rapprochement', ar: 'التقارب السعودي الإيراني' },
    description: {
      en: 'Saudi Arabia and Iran restore diplomatic ties, raising hopes for Yemen peace',
      ar: 'السعودية وإيران تستعيدان العلاقات الدبلوماسية مما يرفع الآمال بسلام اليمن'
    },
    category: 'international',
    impact: 'medium',
    sources: ['Reuters', 'Al Jazeera'],
    relatedIndicators: ['FDI', 'REMITTANCES']
  },
];

// Category icons and colors
const categoryConfig: Record<EventCategory, { icon: typeof Calendar; color: string; label: { en: string; ar: string } }> = {
  political: { icon: Scale, color: 'bg-blue-500', label: { en: 'Political', ar: 'سياسي' } },
  military: { icon: Swords, color: 'bg-red-500', label: { en: 'Military', ar: 'عسكري' } },
  economic: { icon: Banknote, color: 'bg-green-500', label: { en: 'Economic', ar: 'اقتصادي' } },
  humanitarian: { icon: Heart, color: 'bg-orange-500', label: { en: 'Humanitarian', ar: 'إنساني' } },
  policy: { icon: FileText, color: 'bg-purple-500', label: { en: 'Policy', ar: 'سياسات' } },
  international: { icon: Building2, color: 'bg-cyan-500', label: { en: 'International', ar: 'دولي' } },
};

interface TimelineNavigationProps {
  startYear?: number;
  endYear?: number;
  selectedDate?: Date;
  onEventSelect?: (event: TimelineEvent) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

export function TimelineNavigation({
  startYear = 2010,
  endYear = new Date().getFullYear(),
  selectedDate,
  onEventSelect,
  onDateSelect,
  className = ''
}: TimelineNavigationProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Group events by year
  const eventsByYear = useMemo(() => {
    const grouped: Record<number, TimelineEvent[]> = {};
    
    yemenTimelineEvents
      .filter(e => selectedCategories.length === 0 || selectedCategories.includes(e.category))
      .forEach(event => {
        const year = event.date.getFullYear();
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(event);
      });
    
    return grouped;
  }, [selectedCategories]);
  
  // Years array
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  
  const toggleCategory = (category: EventCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className={`bg-card border rounded-lg ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">
              {language === 'ar' ? 'الجدول الزمني' : 'Timeline Navigation'}
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'تصفية' : 'Filter'}
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const category = key as EventCategory;
              const isSelected = selectedCategories.includes(category);
              const Icon = config.icon;
              
              return (
                <Button
                  key={category}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleCategory(category)}
                  className="gap-1"
                >
                  <Icon className="w-3 h-3" />
                  {config.label[language]}
                </Button>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Timeline */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          
          {years.map(year => {
            const events = eventsByYear[year] || [];
            const isExpanded = expandedYear === year;
            const hasEvents = events.length > 0;
            
            return (
              <div key={year} className="relative mb-4">
                {/* Year marker */}
                <div 
                  className={`flex items-center gap-3 cursor-pointer ${hasEvents ? 'hover:bg-muted/50' : ''} rounded-lg p-2 -ml-2`}
                  onClick={() => {
                    if (hasEvents) {
                      setExpandedYear(isExpanded ? null : year);
                    }
                    onDateSelect?.(new Date(year, 0, 1));
                  }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    hasEvents ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {events.length || '-'}
                  </div>
                  <span className={`font-semibold ${hasEvents ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {year}
                  </span>
                  {hasEvents && (
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </div>
                
                {/* Events for this year */}
                {isExpanded && events.length > 0 && (
                  <div className="ml-12 mt-2 space-y-3">
                    {events.map(event => {
                      const config = categoryConfig[event.category];
                      const Icon = config.icon;
                      
                      return (
                        <div
                          key={event.id}
                          className="bg-muted/30 rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => onEventSelect?.(event)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(event.date)}
                                </span>
                                <Badge variant={event.impact === 'high' ? 'destructive' : event.impact === 'medium' ? 'default' : 'secondary'} className="text-xs">
                                  {event.impact === 'high' 
                                    ? (language === 'ar' ? 'تأثير عالي' : 'High Impact')
                                    : event.impact === 'medium'
                                    ? (language === 'ar' ? 'تأثير متوسط' : 'Medium Impact')
                                    : (language === 'ar' ? 'تأثير منخفض' : 'Low Impact')
                                  }
                                </Badge>
                              </div>
                              <h4 className="font-medium text-sm">
                                {event.title[language]}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {event.description[language]}
                              </p>
                              {event.relatedIndicators && event.relatedIndicators.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {event.relatedIndicators.slice(0, 3).map(ind => (
                                    <Badge key={ind} variant="outline" className="text-xs">
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                      {ind}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Summary */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {language === 'ar' 
              ? `${yemenTimelineEvents.length} حدث مسجل`
              : `${yemenTimelineEvents.length} events recorded`
            }
          </span>
          <span className="text-muted-foreground">
            {startYear} - {endYear}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TimelineNavigation;
