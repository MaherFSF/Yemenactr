import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, ChevronRight, X, Play, 
  BarChart3, BookOpen, Brain, Globe, 
  Shield, Sparkles, Clock, FileText,
  TrendingUp, Users, Database, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  titleAr: string;
  narrative: string;
  narrativeAr: string;
  guide: 'male' | 'female';
  icon: React.ComponentType<{ className?: string }>;
  highlight?: string;
  actionLabel?: string;
  actionLabelAr?: string;
  actionHref?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to YETO',
    titleAr: 'مرحباً بك في يتو',
    narrative: "Assalamu Alaikum! I'm Ahmed, and together with my colleague Fatima, we'll guide you through Yemen's most comprehensive economic intelligence platform. YETO brings together data from 2010 to today, helping you understand Yemen's economic journey.",
    narrativeAr: "السلام عليكم! أنا أحمد، ومع زميلتي فاطمة، سنرشدك عبر أشمل منصة للاستخبارات الاقتصادية في اليمن. يتو يجمع البيانات من 2010 حتى اليوم، ليساعدك على فهم المسيرة الاقتصادية لليمن.",
    guide: 'male',
    icon: Sparkles,
  },
  {
    id: 'dashboard',
    title: 'Live Economic Dashboard',
    titleAr: 'لوحة البيانات الاقتصادية الحية',
    narrative: "Here you'll find real-time economic indicators - exchange rates, inflation, GDP growth, and more. Every number comes from verified sources like the World Bank, IMF, and Central Bank of Yemen. No guesswork, only facts.",
    narrativeAr: "هنا ستجد المؤشرات الاقتصادية الحية - أسعار الصرف، التضخم، نمو الناتج المحلي، والمزيد. كل رقم يأتي من مصادر موثقة مثل البنك الدولي وصندوق النقد والبنك المركزي اليمني. لا تخمين، فقط حقائق.",
    guide: 'female',
    icon: BarChart3,
    highlight: '[data-tour="dashboard"]',
    actionLabel: 'Explore Dashboard',
    actionLabelAr: 'استكشف لوحة البيانات',
    actionHref: '/dashboard',
  },
  {
    id: 'sectors',
    title: '16 Economic Sectors',
    titleAr: '16 قطاعاً اقتصادياً',
    narrative: "Yemen's economy is complex. We've organized it into 16 sectors - from Banking and Trade to Agriculture and Energy. Each sector has its own dashboard, trends, and expert analysis. Dive deep into what matters to you.",
    narrativeAr: "اقتصاد اليمن معقد. نظمناه في 16 قطاعاً - من البنوك والتجارة إلى الزراعة والطاقة. لكل قطاع لوحة بيانات خاصة واتجاهات وتحليلات خبراء. تعمق فيما يهمك.",
    guide: 'male',
    icon: Globe,
    highlight: '[data-tour="sectors"]',
    actionLabel: 'Browse Sectors',
    actionLabelAr: 'تصفح القطاعات',
    actionHref: '/data-repository',
  },
  {
    id: 'timeline',
    title: 'The Story of Yemen Since 2010',
    titleAr: 'قصة اليمن منذ 2010',
    narrative: "Every economic change has a story. Our interactive timeline shows you how events - from the 2011 uprising to the currency split - shaped Yemen's economy. See the connections between politics, conflict, and economics.",
    narrativeAr: "لكل تغيير اقتصادي قصة. جدولنا الزمني التفاعلي يوضح كيف شكلت الأحداث - من انتفاضة 2011 إلى انقسام العملة - اقتصاد اليمن. شاهد الروابط بين السياسة والصراع والاقتصاد.",
    guide: 'female',
    icon: Clock,
    highlight: '[data-tour="timeline"]',
    actionLabel: 'View Timeline',
    actionLabelAr: 'عرض الجدول الزمني',
    actionHref: '/timeline',
  },
  {
    id: 'ai-assistant',
    title: 'Your AI Economic Advisor',
    titleAr: 'مستشارك الاقتصادي الذكي',
    narrative: "Have a question? Ask our AI assistant in Arabic or English. It searches our entire database and gives you answers backed by evidence. It never makes things up - if data is missing, it tells you honestly.",
    narrativeAr: "لديك سؤال؟ اسأل مساعدنا الذكي بالعربية أو الإنجليزية. يبحث في قاعدة بياناتنا بالكامل ويعطيك إجابات مدعومة بالأدلة. لا يختلق أبداً - إذا كانت البيانات مفقودة، يخبرك بصدق.",
    guide: 'male',
    icon: Brain,
    highlight: '[data-tour="ai-assistant"]',
    actionLabel: 'Ask AI Assistant',
    actionLabelAr: 'اسأل المساعد الذكي',
    actionHref: '/ai-assistant',
  },
  {
    id: 'research',
    title: 'Research Library',
    titleAr: 'مكتبة الأبحاث',
    narrative: "Access over 370 research publications - World Bank reports, IMF analyses, academic papers, and Central Bank circulars. Everything is searchable and downloadable. Knowledge at your fingertips.",
    narrativeAr: "الوصول إلى أكثر من 370 منشوراً بحثياً - تقارير البنك الدولي، تحليلات صندوق النقد، أوراق أكاديمية، وتعميمات البنك المركزي. كل شيء قابل للبحث والتنزيل. المعرفة في متناول يدك.",
    guide: 'female',
    icon: FileText,
    highlight: '[data-tour="research"]',
    actionLabel: 'Browse Research',
    actionLabelAr: 'تصفح الأبحاث',
    actionHref: '/research',
  },
  {
    id: 'transparency',
    title: 'Every Number Has a Source',
    titleAr: 'لكل رقم مصدر',
    narrative: "Transparency is our foundation. Click any number to see its source, methodology, and confidence level. We flag contradictions between sources and never hide data gaps. You deserve the full picture.",
    narrativeAr: "الشفافية هي أساسنا. انقر على أي رقم لترى مصدره ومنهجيته ومستوى الثقة. نحدد التناقضات بين المصادر ولا نخفي فجوات البيانات أبداً. أنت تستحق الصورة الكاملة.",
    guide: 'male',
    icon: Shield,
    highlight: '[data-tour="methodology"]',
    actionLabel: 'View Methodology',
    actionLabelAr: 'عرض المنهجية',
    actionHref: '/methodology',
  },
  {
    id: 'vip',
    title: 'Tailored for Decision Makers',
    titleAr: 'مصمم لصناع القرار',
    narrative: "Whether you're a policymaker, researcher, donor, or business leader - YETO adapts to your needs. Our VIP dashboards provide role-specific insights, alerts, and recommendations.",
    narrativeAr: "سواء كنت صانع سياسات أو باحثاً أو مانحاً أو قائد أعمال - يتو يتكيف مع احتياجاتك. لوحات VIP الخاصة بنا توفر رؤى وتنبيهات وتوصيات مخصصة لدورك.",
    guide: 'female',
    icon: Users,
    actionLabel: 'Explore VIP Features',
    actionLabelAr: 'استكشف ميزات VIP',
    actionHref: '/pricing',
  },
  {
    id: 'complete',
    title: 'Your Journey Begins',
    titleAr: 'رحلتك تبدأ',
    narrative: "You're ready to explore! Use the search bar to find anything, or start with the dashboard. Remember - we're here to illuminate Yemen's path to economic recovery through data-driven accountability.",
    narrativeAr: "أنت جاهز للاستكشاف! استخدم شريط البحث للعثور على أي شيء، أو ابدأ بلوحة البيانات. تذكر - نحن هنا لإضاءة مسار اليمن نحو التعافي الاقتصادي من خلال المساءلة المبنية على البيانات.",
    guide: 'male',
    icon: Sparkles,
    actionLabel: 'Start Exploring',
    actionLabelAr: 'ابدأ الاستكشاف',
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
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const Icon = step.icon;
  
  const guideImage = step.guide === 'male' 
    ? '/images/guide-male-hadrami.png'
    : '/images/guide-female-professional.png';
  
  const guideName = step.guide === 'male'
    ? (language === 'ar' ? 'أحمد' : 'Ahmed')
    : (language === 'ar' ? 'فاطمة' : 'Fatima');
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="max-w-2xl p-0 overflow-hidden border-0 shadow-2xl"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header with YETO branding */}
        <div className="relative bg-gradient-to-br from-[#0D2818] via-[#1B5E20] to-[#2E7D32] p-6 text-white">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C0A030] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img 
                src="/images/yeto-logo.png" 
                alt="YETO" 
                className="h-10 w-auto"
              />
              <Badge className="bg-[#C0A030] text-[#0D2818] border-0 font-semibold">
                {language === 'ar' ? 'جولة تعريفية' : 'Welcome Tour'}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/80 hover:text-white hover:bg-white/20"
              onClick={handleSkip}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Step indicator */}
          <div className="relative flex items-center gap-2 mb-4">
            {tourSteps.map((_, idx) => (
              <div 
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentStep 
                    ? "w-8 bg-[#C0A030]" 
                    : idx < currentStep 
                      ? "w-4 bg-white/60" 
                      : "w-4 bg-white/30"
                )}
              />
            ))}
            <span className="text-white/60 text-sm ml-auto">
              {currentStep + 1} / {tourSteps.length}
            </span>
          </div>
          
          {/* Title with icon */}
          <div className="relative flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Icon className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold">
              {language === 'ar' ? step.titleAr : step.title}
            </h2>
          </div>
        </div>
        
        {/* Content with character guide */}
        <div className={cn(
          "p-6 bg-white transition-opacity duration-200",
          isAnimating ? "opacity-50" : "opacity-100"
        )}>
          <div className="flex gap-6">
            {/* Character guide */}
            <div className={cn(
              "flex-shrink-0 w-28",
              isRTL ? "order-2" : "order-1"
            )}>
              <div className="relative">
                <img 
                  src={guideImage}
                  alt={guideName}
                  className="w-28 h-auto rounded-xl shadow-lg"
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#1B5E20] text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
                  {guideName}
                </div>
              </div>
            </div>
            
            {/* Narrative bubble */}
            <div className={cn(
              "flex-1",
              isRTL ? "order-1" : "order-2"
            )}>
              <div className={cn(
                "relative bg-gray-50 rounded-2xl p-5 shadow-sm",
                isRTL ? "rounded-tr-none" : "rounded-tl-none"
              )}>
                {/* Speech bubble pointer */}
                <div className={cn(
                  "absolute top-4 w-4 h-4 bg-gray-50 transform rotate-45",
                  isRTL ? "-right-2" : "-left-2"
                )} />
                
                <p className="relative text-gray-700 leading-relaxed text-base">
                  {language === 'ar' ? step.narrativeAr : step.narrative}
                </p>
              </div>
              
              {/* Action button */}
              {step.actionHref && (
                <a 
                  href={step.actionHref}
                  className="inline-flex items-center gap-2 mt-4 text-[#1B5E20] font-medium hover:text-[#0D2818] transition-colors"
                  onClick={handleComplete}
                >
                  {language === 'ar' ? step.actionLabelAr : step.actionLabel}
                  {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer navigation */}
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="gap-2 text-gray-600"
          >
            {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {language === 'ar' ? 'السابق' : 'Previous'}
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600"
          >
            {language === 'ar' ? 'تخطي' : 'Skip'}
          </Button>
          
          <Button
            onClick={nextStep}
            className="gap-2 bg-[#1B5E20] hover:bg-[#0D2818] text-white shadow-lg"
          >
            {currentStep === tourSteps.length - 1 
              ? (language === 'ar' ? 'ابدأ الاستكشاف' : 'Start Exploring')
              : (language === 'ar' ? 'التالي' : 'Next')}
            {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick Tour Button for header
export function QuickTourButton() {
  const { language } = useLanguage();
  const [showTour, setShowTour] = useState(false);
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-[#1B5E20]/30 text-[#1B5E20] hover:bg-[#1B5E20]/10"
        onClick={() => setShowTour(true)}
      >
        <Play className="h-4 w-4" />
        {language === 'ar' ? 'جولة سريعة' : 'Quick Tour'}
      </Button>
      
      {showTour && (
        <WelcomeTour 
          forceShow={true} 
          onComplete={() => setShowTour(false)} 
        />
      )}
    </>
  );
}

export default WelcomeTour;
