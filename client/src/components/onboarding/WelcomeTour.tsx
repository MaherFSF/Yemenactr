import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, ChevronRight, X,
  BarChart3, BookOpen, Brain, Globe, 
  Shield, Sparkles, Clock, FileText,
  TrendingUp, Database, Search, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  features?: { en: string; ar: string }[];
  actionLabel?: string;
  actionLabelAr?: string;
  actionHref?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to YETO',
    titleAr: 'مرحباً بك في يتو',
    description: "Yemen Economic Transparency Observatory - the most comprehensive economic intelligence platform for Yemen.",
    descriptionAr: "مرصد الشفافية الاقتصادية اليمني - أشمل منصة للاستخبارات الاقتصادية في اليمن.",
    icon: Sparkles,
    features: [
      { en: "Verified data from 2010-2026", ar: "بيانات موثقة من 2010-2026" },
      { en: "170+ trusted sources", ar: "+170 مصدر موثوق" },
      { en: "Bilingual (Arabic/English)", ar: "ثنائي اللغة (عربي/إنجليزي)" },
    ],
  },
  {
    id: 'dashboard',
    title: 'Economic Dashboard',
    titleAr: 'لوحة البيانات الاقتصادية',
    description: "Real-time economic indicators with live data from World Bank, IMF, and Central Bank of Yemen.",
    descriptionAr: "مؤشرات اقتصادية حية مع بيانات مباشرة من البنك الدولي وصندوق النقد والبنك المركزي اليمني.",
    icon: BarChart3,
    features: [
      { en: "Exchange rates (Aden/Sana'a)", ar: "أسعار الصرف (عدن/صنعاء)" },
      { en: "GDP & inflation tracking", ar: "تتبع الناتج المحلي والتضخم" },
      { en: "Auto-updated daily", ar: "تحديث يومي تلقائي" },
    ],
    actionLabel: 'View Dashboard',
    actionLabelAr: 'عرض لوحة البيانات',
    actionHref: '/dashboard',
  },
  {
    id: 'sectors',
    title: '16 Economic Sectors',
    titleAr: '16 قطاعاً اقتصادياً',
    description: "Comprehensive coverage of every economic sector with dedicated dashboards and analysis.",
    descriptionAr: "تغطية شاملة لكل قطاع اقتصادي مع لوحات بيانات وتحليلات مخصصة.",
    icon: Layers,
    features: [
      { en: "Banking & Finance", ar: "البنوك والتمويل" },
      { en: "Trade & Commerce", ar: "التجارة" },
      { en: "Energy, Agriculture, Aid...", ar: "الطاقة، الزراعة، المساعدات..." },
    ],
    actionLabel: 'Explore Sectors',
    actionLabelAr: 'استكشف القطاعات',
    actionHref: '/data-repository',
  },
  {
    id: 'ai-assistant',
    title: 'AI Economic Advisor',
    titleAr: 'المستشار الاقتصادي الذكي',
    description: "Ask questions in Arabic or English and get evidence-backed answers from our database.",
    descriptionAr: "اسأل بالعربية أو الإنجليزية واحصل على إجابات مدعومة بالأدلة من قاعدة بياناتنا.",
    icon: Brain,
    features: [
      { en: "Natural language queries", ar: "استعلامات باللغة الطبيعية" },
      { en: "Source citations included", ar: "مع ذكر المصادر" },
      { en: "Expert-level analysis", ar: "تحليل على مستوى الخبراء" },
    ],
    actionLabel: 'Ask AI Assistant',
    actionLabelAr: 'اسأل المساعد الذكي',
    actionHref: '/ai-assistant',
  },
  {
    id: 'research',
    title: 'Research Library',
    titleAr: 'مكتبة الأبحاث',
    description: "Access 370+ research publications from leading institutions and organizations.",
    descriptionAr: "الوصول إلى أكثر من 370 منشوراً بحثياً من المؤسسات والمنظمات الرائدة.",
    icon: FileText,
    features: [
      { en: "World Bank & IMF reports", ar: "تقارير البنك الدولي وصندوق النقد" },
      { en: "CBY circulars & decisions", ar: "تعميمات وقرارات البنك المركزي" },
      { en: "Academic publications", ar: "المنشورات الأكاديمية" },
    ],
    actionLabel: 'Browse Library',
    actionLabelAr: 'تصفح المكتبة',
    actionHref: '/research-library',
  },
  {
    id: 'tools',
    title: 'Analysis Tools',
    titleAr: 'أدوات التحليل',
    description: "Professional tools for economic analysis, comparison, and scenario simulation.",
    descriptionAr: "أدوات احترافية للتحليل الاقتصادي والمقارنة ومحاكاة السيناريوهات.",
    icon: TrendingUp,
    features: [
      { en: "Report Builder", ar: "منشئ التقارير" },
      { en: "Scenario Simulator", ar: "محاكي السيناريوهات" },
      { en: "Comparison Tool", ar: "أداة المقارنة" },
    ],
    actionLabel: 'Explore Tools',
    actionLabelAr: 'استكشف الأدوات',
    actionHref: '/report-builder',
  },
  {
    id: 'complete',
    title: 'Start Exploring',
    titleAr: 'ابدأ الاستكشاف',
    description: "Use the search bar to find anything, or start with the dashboard.",
    descriptionAr: "استخدم شريط البحث للعثور على أي شيء، أو ابدأ بلوحة البيانات.",
    icon: Search,
    features: [
      { en: "Global search across all data", ar: "بحث شامل في جميع البيانات" },
      { en: "Keyboard shortcuts available", ar: "اختصارات لوحة المفاتيح متاحة" },
      { en: "Export data anytime", ar: "تصدير البيانات في أي وقت" },
    ],
    actionLabel: 'Go to Dashboard',
    actionLabelAr: 'الذهاب للوحة البيانات',
    actionHref: '/dashboard',
  },
];

interface WelcomeTourProps {
  onComplete?: () => void;
  forceShow?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function WelcomeTour({ onComplete, forceShow = false, isOpen: externalIsOpen, onClose }: WelcomeTourProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onClose ? (value: boolean) => { if (!value) onClose(); } : setInternalIsOpen;
  
  useEffect(() => {
    if (externalIsOpen !== undefined) return; // Skip auto-open if externally controlled
    
    const seen = localStorage.getItem('yeto_tour_completed');
    if (!seen && !hasSeenTour) {
      const timer = setTimeout(() => {
        setInternalIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (forceShow) {
      setInternalIsOpen(true);
      setCurrentStep(0);
    }
  }, [forceShow, hasSeenTour, externalIsOpen]);
  
  const handleComplete = () => {
    localStorage.setItem('yeto_tour_completed', 'true');
    setHasSeenTour(true);
    setIsOpen(false);
    onComplete?.();
  };
  
  const handleSkip = () => {
    localStorage.setItem('yeto_tour_completed', 'true');
    setHasSeenTour(true);
    setIsOpen(false);
  };
  
  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      handleComplete();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };
  
  const goToStep = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(index);
      setIsAnimating(false);
    }, 150);
  };
  
  const step = tourSteps[currentStep];
  const Icon = step.icon;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-white"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Clean Header */}
        <div className="relative bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/images/yeto-logo.png" 
                alt="YETO" 
                className="h-7 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <Badge className="bg-[#1B5E20] text-white border-0 text-xs font-medium">
                {language === 'ar' ? 'جولة سريعة' : 'Quick Tour'}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 h-8 w-8 rounded-full"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Step indicator dots - clickable */}
          <div className="flex items-center gap-1.5 mt-4">
            {tourSteps.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => goToStep(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer hover:opacity-80",
                  idx === currentStep 
                    ? "w-8 bg-[#1B5E20]" 
                    : idx < currentStep 
                      ? "w-2 bg-[#1B5E20]/40" 
                      : "w-2 bg-gray-200"
                )}
              />
            ))}
            <span className={cn(
              "text-gray-400 text-xs font-medium",
              isRTL ? "mr-auto" : "ml-auto"
            )}>
              {currentStep + 1}/{tourSteps.length}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className={cn(
          "p-6 transition-opacity duration-150",
          isAnimating ? "opacity-0" : "opacity-100"
        )}>
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B5E20]/10 to-[#C5A028]/10 flex items-center justify-center">
              <Icon className="h-8 w-8 text-[#1B5E20]" />
            </div>
          </div>
          
          {/* Title and Description */}
          <div className="text-center mb-5">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {language === 'ar' ? step.titleAr : step.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {language === 'ar' ? step.descriptionAr : step.description}
            </p>
          </div>
          
          {/* Feature list */}
          {step.features && (
            <div className="space-y-2 mb-5">
              {step.features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C5A028]" />
                  <span>{language === 'ar' ? feature.ar : feature.en}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Action button if available */}
          {step.actionHref && (
            <a 
              href={step.actionHref}
              className="block w-full"
              onClick={handleComplete}
            >
              <Button 
                variant="outline" 
                className="w-full border-[#1B5E20]/20 text-[#1B5E20] hover:bg-[#1B5E20]/5 hover:border-[#1B5E20]/40"
              >
                {language === 'ar' ? step.actionLabelAr : step.actionLabel}
              </Button>
            </a>
          )}
        </div>
        
        {/* Navigation Footer */}
        <div className="px-6 pb-5 pt-0 bg-white">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 px-3"
            >
              {isRTL ? <ChevronRight className="h-4 w-4 ml-1" /> : <ChevronLeft className="h-4 w-4 mr-1" />}
              {language === 'ar' ? 'السابق' : 'Previous'}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-500 text-sm px-3"
            >
              {language === 'ar' ? 'تخطي' : 'Skip'}
            </Button>
            
            <Button
              onClick={nextStep}
              className="bg-[#1B5E20] hover:bg-[#0D2818] text-white px-5"
            >
              {currentStep === tourSteps.length - 1 
                ? (language === 'ar' ? 'ابدأ' : 'Start')
                : (language === 'ar' ? 'التالي' : 'Next')
              }
              {isRTL ? <ChevronLeft className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


// QuickTourButton component for header
export function QuickTourButton() {
  const [showTour, setShowTour] = useState(false);
  const { language } = useLanguage();
  
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowTour(true)}
        className="text-gray-600 hover:text-[#1B5E20] hover:bg-[#1B5E20]/5"
      >
        <Sparkles className="h-4 w-4 mr-1" />
        {language === 'ar' ? 'جولة سريعة' : 'Quick Tour'}
      </Button>
      <WelcomeTour 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
      />
    </>
  );
}
