import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, X, Play, Pause,
  BarChart3, BookOpen, Brain, Globe, 
  Search, Download, Users, Shield,
  Sparkles, Map, Clock, FileText,
  TrendingUp, Building2, Banknote, Scale,
  ExternalLink, CheckCircle2, Circle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { YETO_COLORS } from "@/lib/chartTheme";

// Tour types for different user levels
type TourType = 'quick' | 'full' | 'expert';
type TourCategory = 'overview' | 'data' | 'analysis' | 'tools' | 'advanced';

interface TourStep {
  id: string;
  category: TourCategory;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string; // Actual route to navigate to
  highlight?: string; // CSS selector to highlight on page
  action?: string; // Action to demonstrate
  actionAr?: string;
  tryItPrompt?: string;
  tryItPromptAr?: string;
  features?: { label: string; labelAr: string; done?: boolean }[];
  tourTypes: TourType[]; // Which tour types include this step
}

const tourSteps: TourStep[] = [
  // Overview Category
  {
    id: 'welcome',
    category: 'overview',
    title: 'Welcome to YETO',
    titleAr: 'مرحباً بك في يتو',
    description: 'The Yemen Economic Transparency Observatory - Your comprehensive source for evidence-based economic data and analysis on Yemen from 2010 to present.',
    descriptionAr: 'مرصد الشفافية الاقتصادية اليمني - مصدرك الشامل للبيانات والتحليلات الاقتصادية المبنية على الأدلة عن اليمن من 2010 حتى الآن.',
    icon: Sparkles,
    route: '/',
    features: [
      { label: '3,000+ Data Points', labelAr: '+3,000 نقطة بيانات' },
      { label: 'Bilingual (AR/EN)', labelAr: 'ثنائي اللغة' },
      { label: 'AI-Powered', labelAr: 'مدعوم بالذكاء الاصطناعي' },
    ],
    tourTypes: ['quick', 'full', 'expert']
  },
  {
    id: 'dashboard',
    category: 'data',
    title: 'Economic Dashboard',
    titleAr: 'لوحة البيانات الاقتصادية',
    description: 'View real-time economic indicators. Try changing the time period or comparing regimes.',
    descriptionAr: 'عرض المؤشرات الاقتصادية في الوقت الفعلي. جرب تغيير الفترة الزمنية أو مقارنة الأنظمة.',
    icon: BarChart3,
    route: '/dashboard',
    highlight: '[data-tour="kpi-cards"]',
    action: 'Click on any KPI card to see detailed breakdown',
    actionAr: 'انقر على أي بطاقة مؤشر لرؤية التفاصيل',
    tryItPrompt: 'Try clicking on the GDP card to see historical data',
    tryItPromptAr: 'جرب النقر على بطاقة الناتج المحلي لرؤية البيانات التاريخية',
    features: [
      { label: 'Interactive Charts', labelAr: 'رسوم بيانية تفاعلية' },
      { label: 'Period Selection', labelAr: 'اختيار الفترة' },
      { label: 'Export Data', labelAr: 'تصدير البيانات' },
    ],
    tourTypes: ['quick', 'full', 'expert']
  },
  {
    id: 'data-explorer',
    category: 'data',
    title: 'Data Explorer',
    titleAr: 'مستكشف البيانات',
    description: 'Browse all 66 economic indicators with advanced filtering. Select time periods, sources, and confidence levels.',
    descriptionAr: 'تصفح جميع المؤشرات الاقتصادية الـ66 مع تصفية متقدمة. حدد الفترات الزمنية والمصادر ومستويات الثقة.',
    icon: Search,
    route: '/data-explorer',
    highlight: '[data-tour="filters"]',
    action: 'Use the filters to narrow down indicators',
    actionAr: 'استخدم المرشحات لتضييق نطاق المؤشرات',
    tryItPrompt: 'Try filtering by "Banking" sector and "2020-2024" period',
    tryItPromptAr: 'جرب التصفية حسب قطاع "البنوك" والفترة "2020-2024"',
    features: [
      { label: '66 Indicators', labelAr: '66 مؤشراً' },
      { label: 'Custom Date Range', labelAr: 'نطاق تاريخ مخصص' },
      { label: 'Source Filtering', labelAr: 'تصفية المصادر' },
    ],
    tourTypes: ['full', 'expert']
  },
  {
    id: 'timeline',
    category: 'analysis',
    title: 'Economic Timeline',
    titleAr: 'الجدول الزمني الاقتصادي',
    description: 'Explore Yemen\'s economic history with our storytelling timeline. Switch between Story Mode and Explore Mode.',
    descriptionAr: 'استكشف التاريخ الاقتصادي لليمن مع جدولنا الزمني القصصي. بدّل بين وضع القصة ووضع الاستكشاف.',
    icon: Clock,
    route: '/timeline',
    highlight: '[data-tour="timeline-controls"]',
    action: 'Click "Story Mode" to see the narrative view',
    actionAr: 'انقر على "وضع القصة" لرؤية العرض السردي',
    tryItPrompt: 'Try switching to "Day" view to see daily events',
    tryItPromptAr: 'جرب التبديل إلى عرض "يومي" لرؤية الأحداث اليومية',
    features: [
      { label: 'Story Mode', labelAr: 'وضع القصة' },
      { label: 'Day/Week/Month', labelAr: 'يومي/أسبوعي/شهري' },
      { label: 'Cross-Sector Impact', labelAr: 'التأثير عبر القطاعات' },
    ],
    tourTypes: ['quick', 'full', 'expert']
  },
  {
    id: 'sectors',
    category: 'analysis',
    title: 'Sector Analysis',
    titleAr: 'تحليل القطاعات',
    description: 'Deep dive into 12 economic sectors. Each sector has dedicated dashboards with KPIs, trends, and policy analysis.',
    descriptionAr: 'تعمق في 12 قطاعاً اقتصادياً. لكل قطاع لوحات بيانات مخصصة مع مؤشرات واتجاهات وتحليل سياسات.',
    icon: Globe,
    route: '/sectors',
    highlight: '[data-tour="sector-grid"]',
    action: 'Click on "Banking & Finance" to see the sector dashboard',
    actionAr: 'انقر على "البنوك والمالية" لرؤية لوحة بيانات القطاع',
    features: [
      { label: '12 Sectors', labelAr: '12 قطاعاً' },
      { label: 'Trend Analysis', labelAr: 'تحليل الاتجاهات' },
      { label: 'Policy Impact', labelAr: 'تأثير السياسات' },
    ],
    tourTypes: ['full', 'expert']
  },
  {
    id: 'banking',
    category: 'analysis',
    title: 'Banking Sector Deep Dive',
    titleAr: 'تعمق في قطاع البنوك',
    description: 'Explore Yemen\'s dual banking system with data on 31 commercial banks, exchange rates, and CBY policies.',
    descriptionAr: 'استكشف النظام المصرفي المزدوج في اليمن مع بيانات عن 31 بنكاً تجارياً وأسعار الصرف وسياسات البنك المركزي.',
    icon: Building2,
    route: '/sectors/banking',
    highlight: '[data-tour="bank-comparison"]',
    action: 'Compare CBY Aden vs CBY Sanaa exchange rates',
    actionAr: 'قارن أسعار صرف البنك المركزي عدن مقابل صنعاء',
    features: [
      { label: '31 Banks', labelAr: '31 بنكاً' },
      { label: 'Dual CBY Analysis', labelAr: 'تحليل البنك المركزي المزدوج' },
      { label: 'Exchange Rates', labelAr: 'أسعار الصرف' },
    ],
    tourTypes: ['expert']
  },
  {
    id: 'ai-assistant',
    category: 'tools',
    title: 'AI Economic Assistant',
    titleAr: 'المساعد الاقتصادي الذكي',
    description: 'Ask questions in natural language. The AI provides evidence-based answers with source citations.',
    descriptionAr: 'اطرح أسئلة بلغة طبيعية. يقدم الذكاء الاصطناعي إجابات مبنية على الأدلة مع اقتباس المصادر.',
    icon: Brain,
    route: '/ai-assistant',
    highlight: '[data-tour="chat-input"]',
    action: 'Type a question like "What is Yemen\'s current inflation rate?"',
    actionAr: 'اكتب سؤالاً مثل "ما هو معدل التضخم الحالي في اليمن؟"',
    tryItPrompt: 'Try asking: "Compare GDP growth before and after 2015"',
    tryItPromptAr: 'جرب السؤال: "قارن نمو الناتج المحلي قبل وبعد 2015"',
    features: [
      { label: 'Evidence-Based', labelAr: 'مبني على الأدلة' },
      { label: 'Source Citations', labelAr: 'اقتباس المصادر' },
      { label: 'Role-Aware', labelAr: 'مدرك للأدوار' },
    ],
    tourTypes: ['quick', 'full', 'expert']
  },
  {
    id: 'scenario-simulator',
    category: 'tools',
    title: 'Scenario Simulator',
    titleAr: 'محاكي السيناريوهات',
    description: 'Model economic scenarios and see projected impacts. Adjust variables like oil prices, aid flows, and exchange rates.',
    descriptionAr: 'نمذجة السيناريوهات الاقتصادية ورؤية التأثيرات المتوقعة. اضبط المتغيرات مثل أسعار النفط وتدفقات المساعدات وأسعار الصرف.',
    icon: TrendingUp,
    route: '/scenario-simulator',
    highlight: '[data-tour="scenario-controls"]',
    action: 'Adjust the oil price slider to see economic impact',
    actionAr: 'اضبط شريط تمرير سعر النفط لرؤية التأثير الاقتصادي',
    features: [
      { label: 'What-If Analysis', labelAr: 'تحليل ماذا لو' },
      { label: 'Multi-Variable', labelAr: 'متعدد المتغيرات' },
      { label: 'Uncertainty Bands', labelAr: 'نطاقات عدم اليقين' },
    ],
    tourTypes: ['full', 'expert']
  },
  {
    id: 'research',
    category: 'tools',
    title: 'Research Library',
    titleAr: 'مكتبة الأبحاث',
    description: 'Access 370+ research publications from World Bank, IMF, UN agencies, and academic institutions.',
    descriptionAr: 'الوصول إلى أكثر من 370 منشوراً بحثياً من البنك الدولي وصندوق النقد الدولي ووكالات الأمم المتحدة والمؤسسات الأكاديمية.',
    icon: FileText,
    route: '/research',
    highlight: '[data-tour="research-filters"]',
    action: 'Filter by source or year to find specific publications',
    actionAr: 'صفّ حسب المصدر أو السنة للعثور على منشورات محددة',
    features: [
      { label: '370+ Documents', labelAr: '+370 وثيقة' },
      { label: 'Full-Text Search', labelAr: 'بحث النص الكامل' },
      { label: 'PDF Downloads', labelAr: 'تنزيل PDF' },
    ],
    tourTypes: ['full', 'expert']
  },
  {
    id: 'sanctions',
    category: 'advanced',
    title: 'Sanctions Dashboard',
    titleAr: 'لوحة العقوبات',
    description: 'Track OFAC sanctions, UN designations, and compliance requirements for Yemen-related entities.',
    descriptionAr: 'تتبع عقوبات OFAC وتصنيفات الأمم المتحدة ومتطلبات الامتثال للكيانات المتعلقة باليمن.',
    icon: Scale,
    route: '/sanctions',
    highlight: '[data-tour="sanctions-list"]',
    action: 'Search for specific entities or view by designation type',
    actionAr: 'ابحث عن كيانات محددة أو عرض حسب نوع التصنيف',
    features: [
      { label: 'OFAC SDN List', labelAr: 'قائمة OFAC SDN' },
      { label: 'UN Designations', labelAr: 'تصنيفات الأمم المتحدة' },
      { label: 'Compliance Tools', labelAr: 'أدوات الامتثال' },
    ],
    tourTypes: ['expert']
  },
  {
    id: 'glossary',
    category: 'tools',
    title: 'Bilingual Glossary',
    titleAr: 'المسرد ثنائي اللغة',
    description: 'Understand economic terms with definitions in both Arabic and English. Linked to related indicators.',
    descriptionAr: 'افهم المصطلحات الاقتصادية مع تعريفات بالعربية والإنجليزية. مرتبط بالمؤشرات ذات الصلة.',
    icon: BookOpen,
    route: '/glossary',
    highlight: '[data-tour="glossary-search"]',
    action: 'Search for a term like "inflation" or "تضخم"',
    actionAr: 'ابحث عن مصطلح مثل "تضخم" أو "inflation"',
    features: [
      { label: '51 Terms', labelAr: '51 مصطلحاً' },
      { label: 'Categorized', labelAr: 'مصنف' },
      { label: 'Linked Indicators', labelAr: 'مؤشرات مرتبطة' },
    ],
    tourTypes: ['full', 'expert']
  },
  {
    id: 'methodology',
    category: 'advanced',
    title: 'Methodology & Sources',
    titleAr: 'المنهجية والمصادر',
    description: 'Understand our data collection, validation, and confidence scoring methodology. Full transparency.',
    descriptionAr: 'افهم منهجيتنا في جمع البيانات والتحقق منها وتسجيل الثقة. شفافية كاملة.',
    icon: Shield,
    route: '/methodology',
    highlight: '[data-tour="confidence-scale"]',
    features: [
      { label: 'Source Tracking', labelAr: 'تتبع المصادر' },
      { label: 'Confidence Scores', labelAr: 'درجات الثقة' },
      { label: 'Data Gaps', labelAr: 'فجوات البيانات' },
    ],
    tourTypes: ['expert']
  },
  {
    id: 'complete',
    category: 'overview',
    title: 'You\'re Ready to Explore!',
    titleAr: 'أنت جاهز للاستكشاف!',
    description: 'You\'ve completed the tour. Start exploring Yemen\'s economy with confidence.',
    descriptionAr: 'لقد أكملت الجولة. ابدأ استكشاف اقتصاد اليمن بثقة.',
    icon: CheckCircle2,
    route: '/dashboard',
    features: [
      { label: 'Explore Dashboard', labelAr: 'استكشف لوحة البيانات' },
      { label: 'Ask AI Assistant', labelAr: 'اسأل المساعد الذكي' },
      { label: 'Browse Research', labelAr: 'تصفح الأبحاث' },
    ],
    tourTypes: ['quick', 'full', 'expert']
  },
];

interface InteractiveTourProps {
  onComplete?: () => void;
  forceShow?: boolean;
  tourType?: TourType;
}

export function InteractiveTour({ 
  onComplete, 
  forceShow = false,
  tourType = 'full'
}: InteractiveTourProps) {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const isRTL = language === 'ar';
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set());
  const [selectedTourType, setSelectedTourType] = useState<TourType>(tourType);
  const [showTourSelection, setShowTourSelection] = useState(true);
  
  // Filter steps based on tour type
  const filteredSteps = tourSteps.filter(step => step.tourTypes.includes(selectedTourType));
  
  // Check if user has seen the tour
  useEffect(() => {
    const seen = localStorage.getItem('yeto_interactive_tour_completed');
    if (!seen && !hasSeenTour) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (forceShow) {
      setIsOpen(true);
      setShowTourSelection(true);
    }
  }, [forceShow, hasSeenTour]);
  
  const handleComplete = () => {
    localStorage.setItem('yeto_interactive_tour_completed', 'true');
    setHasSeenTour(true);
    setIsOpen(false);
    onComplete?.();
  };
  
  const handleSkip = () => {
    localStorage.setItem('yeto_interactive_tour_completed', 'true');
    setHasSeenTour(true);
    setIsOpen(false);
  };
  
  const navigateToStep = useCallback((stepIndex: number) => {
    const step = filteredSteps[stepIndex];
    if (step && step.route) {
      setLocation(step.route);
      setVisitedSteps(prev => new Set([...Array.from(prev), step.id]));
    }
  }, [filteredSteps, setLocation]);
  
  const nextStep = () => {
    if (currentStep < filteredSteps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      navigateToStep(nextIndex);
    } else {
      handleComplete();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      const prevIndex = currentStep - 1;
      setCurrentStep(prevIndex);
      navigateToStep(prevIndex);
    }
  };
  
  const goToStep = (index: number) => {
    setCurrentStep(index);
    navigateToStep(index);
  };
  
  const startTour = (type: TourType) => {
    setSelectedTourType(type);
    setShowTourSelection(false);
    setCurrentStep(0);
    const firstStep = tourSteps.filter(s => s.tourTypes.includes(type))[0];
    if (firstStep) {
      setLocation(firstStep.route);
      setVisitedSteps(new Set([firstStep.id]));
    }
  };
  
  const step = filteredSteps[currentStep];
  const progress = ((currentStep + 1) / filteredSteps.length) * 100;
  const Icon = step?.icon || Sparkles;
  
  if (!isOpen) return null;
  
  // Tour type selection screen
  if (showTourSelection) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div 
            className="p-8 text-white text-center"
            style={{ 
              background: `linear-gradient(135deg, ${YETO_COLORS.navy} 0%, ${YETO_COLORS.green} 100%)` 
            }}
          >
            <Sparkles className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">
              {language === 'ar' ? 'مرحباً بك في يتو' : 'Welcome to YETO'}
            </h2>
            <p className="text-white/80">
              {language === 'ar' 
                ? 'اختر نوع الجولة التي تناسبك'
                : 'Choose the tour that fits your needs'}
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Quick Tour */}
            <button
              onClick={() => startTour('quick')}
              className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {language === 'ar' ? 'جولة سريعة' : 'Quick Tour'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' 
                      ? '5 خطوات • 2 دقيقة • أساسيات المنصة'
                      : '5 steps • 2 minutes • Platform basics'}
                  </p>
                </div>
                <Badge variant="secondary">
                  {language === 'ar' ? 'موصى به' : 'Recommended'}
                </Badge>
              </div>
            </button>
            
            {/* Full Tour */}
            <button
              onClick={() => startTour('full')}
              className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {language === 'ar' ? 'جولة كاملة' : 'Full Tour'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' 
                      ? '10 خطوات • 5 دقائق • جميع الميزات'
                      : '10 steps • 5 minutes • All features'}
                  </p>
                </div>
              </div>
            </button>
            
            {/* Expert Tour */}
            <button
              onClick={() => startTour('expert')}
              className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {language === 'ar' ? 'جولة الخبراء' : 'Expert Tour'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' 
                      ? '13 خطوة • 10 دقائق • تحليل متقدم'
                      : '13 steps • 10 minutes • Advanced analysis'}
                  </p>
                </div>
              </div>
            </button>
            
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleSkip}
              >
                {language === 'ar' ? 'تخطي الجولة' : 'Skip Tour'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Main tour interface
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-xl mx-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Card className="shadow-2xl border-2 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-200">
            <motion.div
              className="h-full"
              style={{ backgroundColor: YETO_COLORS.green }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center gap-1 p-2 bg-gray-50 border-b overflow-x-auto">
            {filteredSteps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToStep(idx)}
                className={cn(
                  "flex-shrink-0 w-2 h-2 rounded-full transition-all",
                  idx === currentStep 
                    ? "w-6 bg-green-500" 
                    : visitedSteps.has(s.id)
                      ? "bg-green-300"
                      : "bg-gray-300"
                )}
                title={language === 'ar' ? s.titleAr : s.title}
              />
            ))}
          </div>
          
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div 
                className="p-3 rounded-xl flex-shrink-0"
                style={{ backgroundColor: `${YETO_COLORS.green}20` }}
              >
                <Icon className="h-6 w-6 text-green-600" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {currentStep + 1}/{filteredSteps.length}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="text-xs capitalize"
                    style={{ 
                      backgroundColor: step.category === 'data' ? '#e0f2fe' :
                        step.category === 'analysis' ? '#fef3c7' :
                        step.category === 'tools' ? '#e0e7ff' :
                        step.category === 'advanced' ? '#fce7f3' : '#f3f4f6'
                    }}
                  >
                    {step.category}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg mb-1">
                  {language === 'ar' ? step.titleAr : step.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  {language === 'ar' ? step.descriptionAr : step.description}
                </p>
                
                {/* Try it prompt */}
                {step.tryItPrompt && (
                  <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200 mb-3">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {language === 'ar' ? step.tryItPromptAr : step.tryItPrompt}
                    </p>
                  </div>
                )}
                
                {/* Features */}
                {step.features && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {step.features.map((f, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {language === 'ar' ? f.labelAr : f.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={handleSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="gap-1"
              >
                {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                {language === 'ar' ? 'السابق' : 'Back'}
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                >
                  {language === 'ar' ? 'إنهاء' : 'Exit'}
                </Button>
              </div>
              
              <Button
                size="sm"
                onClick={nextStep}
                className="gap-1"
                style={{ backgroundColor: YETO_COLORS.green }}
              >
                {currentStep === filteredSteps.length - 1 
                  ? (language === 'ar' ? 'إنهاء' : 'Finish')
                  : (language === 'ar' ? 'التالي' : 'Next')}
                {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Quick Tour Button for header
export function InteractiveTourButton() {
  const { language } = useLanguage();
  const [showTour, setShowTour] = useState(false);
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setShowTour(true)}
      >
        <Play className="h-4 w-4" />
        {language === 'ar' ? 'جولة تفاعلية' : 'Interactive Tour'}
      </Button>
      
      {showTour && (
        <InteractiveTour 
          forceShow={true} 
          onComplete={() => setShowTour(false)} 
        />
      )}
    </>
  );
}

export default InteractiveTour;
