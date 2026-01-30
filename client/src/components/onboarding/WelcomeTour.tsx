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
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  actionLabelAr?: string;
  actionHref?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to YETO',
    titleAr: 'مرحباً بك في يتو',
    description: "Yemen's most comprehensive economic intelligence platform. Access verified data from 2010 to today, helping you understand Yemen's economic journey.",
    descriptionAr: "أشمل منصة للاستخبارات الاقتصادية في اليمن. الوصول إلى بيانات موثقة من 2010 حتى اليوم، لمساعدتك على فهم المسيرة الاقتصادية لليمن.",
    icon: Sparkles,
  },
  {
    id: 'dashboard',
    title: 'Live Economic Dashboard',
    titleAr: 'لوحة البيانات الاقتصادية الحية',
    description: "Real-time economic indicators - exchange rates, inflation, GDP growth. Every number from verified sources: World Bank, IMF, Central Bank of Yemen.",
    descriptionAr: "مؤشرات اقتصادية حية - أسعار الصرف، التضخم، نمو الناتج المحلي. كل رقم من مصادر موثقة: البنك الدولي، صندوق النقد، البنك المركزي اليمني.",
    icon: BarChart3,
    actionLabel: 'Explore Dashboard',
    actionLabelAr: 'استكشف لوحة البيانات',
    actionHref: '/dashboard',
  },
  {
    id: 'sectors',
    title: '16 Economic Sectors',
    titleAr: '16 قطاعاً اقتصادياً',
    description: "From Banking and Trade to Agriculture and Energy. Each sector has its own dashboard, trends, and expert analysis.",
    descriptionAr: "من البنوك والتجارة إلى الزراعة والطاقة. لكل قطاع لوحة بيانات خاصة واتجاهات وتحليلات خبراء.",
    icon: Globe,
    actionLabel: 'Browse Sectors',
    actionLabelAr: 'تصفح القطاعات',
    actionHref: '/data-repository',
  },
  {
    id: 'timeline',
    title: 'Interactive Timeline',
    titleAr: 'الجدول الزمني التفاعلي',
    description: "See how events from 2011 to today shaped Yemen's economy. Understand the connections between politics, conflict, and economics.",
    descriptionAr: "شاهد كيف شكلت الأحداث من 2011 حتى اليوم اقتصاد اليمن. افهم الروابط بين السياسة والصراع والاقتصاد.",
    icon: Clock,
    actionLabel: 'View Timeline',
    actionLabelAr: 'عرض الجدول الزمني',
    actionHref: '/timeline',
  },
  {
    id: 'ai-assistant',
    title: 'AI Economic Advisor',
    titleAr: 'المستشار الاقتصادي الذكي',
    description: "Ask questions in Arabic or English. Get answers backed by evidence from our entire database.",
    descriptionAr: "اسأل بالعربية أو الإنجليزية. احصل على إجابات مدعومة بالأدلة من قاعدة بياناتنا بالكامل.",
    icon: Brain,
    actionLabel: 'Ask AI Assistant',
    actionLabelAr: 'اسأل المساعد الذكي',
    actionHref: '/ai-assistant',
  },
  {
    id: 'research',
    title: 'Research Library',
    titleAr: 'مكتبة الأبحاث',
    description: "Access 370+ research publications - World Bank reports, IMF analyses, academic papers, and Central Bank circulars.",
    descriptionAr: "الوصول إلى أكثر من 370 منشوراً بحثياً - تقارير البنك الدولي، تحليلات صندوق النقد، أوراق أكاديمية، وتعميمات البنك المركزي.",
    icon: FileText,
    actionLabel: 'Browse Research',
    actionLabelAr: 'تصفح الأبحاث',
    actionHref: '/research',
  },
  {
    id: 'transparency',
    title: 'Full Transparency',
    titleAr: 'شفافية كاملة',
    description: "Click any number to see its source, methodology, and confidence level. We flag contradictions and never hide data gaps.",
    descriptionAr: "انقر على أي رقم لترى مصدره ومنهجيته ومستوى الثقة. نحدد التناقضات ولا نخفي فجوات البيانات.",
    icon: Shield,
    actionLabel: 'View Methodology',
    actionLabelAr: 'عرض المنهجية',
    actionHref: '/methodology',
  },
  {
    id: 'complete',
    title: 'Start Exploring',
    titleAr: 'ابدأ الاستكشاف',
    description: "Use the search bar to find anything, or start with the dashboard. Illuminate Yemen's path to economic recovery.",
    descriptionAr: "استخدم شريط البحث للعثور على أي شيء، أو ابدأ بلوحة البيانات. أضئ مسار اليمن نحو التعافي الاقتصادي.",
    icon: Sparkles,
    actionLabel: 'Go to Dashboard',
    actionLabelAr: 'الذهاب للوحة البيانات',
    actionHref: '/dashboard',
  },
];

interface WelcomeTourProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export function WelcomeTour({ onComplete, forceShow = false }: WelcomeTourProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const seen = localStorage.getItem('yeto_tour_completed');
    if (!seen && !hasSeenTour) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (forceShow) {
      setIsOpen(true);
      setCurrentStep(0);
    }
  }, [forceShow, hasSeenTour]);
  
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
      }, 200);
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
      }, 200);
    }
  };
  
  const step = tourSteps[currentStep];
  const Icon = step.icon;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="max-w-lg p-0 overflow-hidden border-0 shadow-2xl rounded-2xl"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img 
                src="/images/yeto-logo.png" 
                alt="YETO" 
                className="h-8 w-auto"
              />
              <Badge className="bg-[#C5A028] text-white border-0 text-xs">
                {language === 'ar' ? 'جولة سريعة' : 'Quick Tour'}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Step indicator dots */}
          <div className="flex items-center gap-1.5">
            {tourSteps.map((_, idx) => (
              <div 
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentStep 
                    ? "w-6 bg-[#C5A028]" 
                    : idx < currentStep 
                      ? "w-2 bg-white/60" 
                      : "w-2 bg-white/30"
                )}
              />
            ))}
            <span className="text-white/60 text-xs ml-auto">
              {currentStep + 1}/{tourSteps.length}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className={cn(
          "p-6 bg-white transition-opacity duration-200",
          isAnimating ? "opacity-0" : "opacity-100"
        )}>
          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1B5E20]/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-[#1B5E20]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#0D2818] mb-1">
                {language === 'ar' ? step.titleAr : step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {language === 'ar' ? step.descriptionAr : step.description}
              </p>
            </div>
          </div>
          
          {/* Action button if available */}
          {step.actionHref && (
            <a 
              href={step.actionHref}
              className="block w-full mb-4"
              onClick={handleComplete}
            >
              <Button 
                variant="outline" 
                className="w-full border-[#1B5E20]/30 text-[#1B5E20] hover:bg-[#1B5E20]/5"
              >
                {language === 'ar' ? step.actionLabelAr : step.actionLabel}
              </Button>
            </a>
          )}
        </div>
        
        {/* Navigation Footer */}
        <div className="px-6 pb-6 pt-0 bg-white border-t border-gray-100">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="text-gray-500 hover:text-[#1B5E20] disabled:opacity-30"
            >
              {isRTL ? <ChevronRight className="h-4 w-4 ml-1" /> : <ChevronLeft className="h-4 w-4 mr-1" />}
              {language === 'ar' ? 'السابق' : 'Previous'}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              {language === 'ar' ? 'تخطي' : 'Skip'}
            </Button>
            
            <Button
              onClick={nextStep}
              className="bg-[#1B5E20] hover:bg-[#0D2818] text-white"
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
