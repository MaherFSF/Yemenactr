import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, ChevronRight, X, Play, 
  BarChart3, BookOpen, Brain, Globe, 
  Search, Download, Users, Shield,
  Sparkles, Map, Clock, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { YETO_COLORS } from "@/lib/chartTheme";

interface TourStep {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: string; // CSS selector to highlight
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  features?: { label: string; labelAr: string }[];
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to YETO',
    titleAr: 'مرحباً بك في يتو',
    description: 'The Yemen Economic Transparency Observatory - Your comprehensive source for evidence-based economic data and analysis on Yemen from 2010 to present.',
    descriptionAr: 'مرصد الشفافية الاقتصادية اليمني - مصدرك الشامل للبيانات والتحليلات الاقتصادية المبنية على الأدلة عن اليمن من 2010 حتى الآن.',
    icon: Sparkles,
    position: 'center',
    features: [
      { label: '3,000+ Data Points', labelAr: '+3,000 نقطة بيانات' },
      { label: 'Bilingual (AR/EN)', labelAr: 'ثنائي اللغة (عربي/إنجليزي)' },
      { label: 'AI-Powered Insights', labelAr: 'رؤى مدعومة بالذكاء الاصطناعي' },
    ]
  },
  {
    id: 'dashboard',
    title: 'Economic Dashboard',
    titleAr: 'لوحة البيانات الاقتصادية',
    description: 'View real-time economic indicators including GDP, inflation, exchange rates, and more. All data is sourced from credible international organizations.',
    descriptionAr: 'عرض المؤشرات الاقتصادية في الوقت الفعلي بما في ذلك الناتج المحلي والتضخم وأسعار الصرف والمزيد. جميع البيانات مصدرها منظمات دولية موثوقة.',
    icon: BarChart3,
    highlight: '[data-tour="dashboard"]',
    features: [
      { label: 'Interactive Charts', labelAr: 'رسوم بيانية تفاعلية' },
      { label: 'Export to CSV/Excel', labelAr: 'تصدير إلى CSV/Excel' },
      { label: 'Regime Comparison', labelAr: 'مقارنة الأنظمة' },
    ]
  },
  {
    id: 'sectors',
    title: 'Sector Analysis',
    titleAr: 'تحليل القطاعات',
    description: 'Deep dive into 12 economic sectors including Banking, Trade, Energy, Agriculture, and more. Each sector has dedicated dashboards and analysis.',
    descriptionAr: 'تعمق في 12 قطاعاً اقتصادياً بما في ذلك البنوك والتجارة والطاقة والزراعة والمزيد. لكل قطاع لوحات بيانات وتحليلات مخصصة.',
    icon: Globe,
    highlight: '[data-tour="sectors"]',
    features: [
      { label: '12 Sectors', labelAr: '12 قطاعاً' },
      { label: 'Trend Analysis', labelAr: 'تحليل الاتجاهات' },
      { label: 'Policy Impact', labelAr: 'تأثير السياسات' },
    ]
  },
  {
    id: 'timeline',
    title: 'Economic Timeline',
    titleAr: 'الجدول الزمني الاقتصادي',
    description: 'Explore Yemen\'s economic history from 2010 to present with our interactive timeline. See how events impacted different sectors.',
    descriptionAr: 'استكشف التاريخ الاقتصادي لليمن من 2010 حتى الآن مع جدولنا الزمني التفاعلي. شاهد كيف أثرت الأحداث على القطاعات المختلفة.',
    icon: Clock,
    highlight: '[data-tour="timeline"]',
    features: [
      { label: 'Story Mode', labelAr: 'وضع القصة' },
      { label: 'Day/Week/Month View', labelAr: 'عرض يومي/أسبوعي/شهري' },
      { label: 'Cross-Sector Impact', labelAr: 'التأثير عبر القطاعات' },
    ]
  },
  {
    id: 'ai-assistant',
    title: 'AI Economic Assistant',
    titleAr: 'المساعد الاقتصادي الذكي',
    description: 'Ask questions in natural language and get evidence-based answers. Our AI is grounded in real data and never fabricates information.',
    descriptionAr: 'اطرح أسئلة بلغة طبيعية واحصل على إجابات مبنية على الأدلة. ذكاؤنا الاصطناعي مرتكز على بيانات حقيقية ولا يختلق معلومات أبداً.',
    icon: Brain,
    highlight: '[data-tour="ai-assistant"]',
    features: [
      { label: 'Evidence-Based', labelAr: 'مبني على الأدلة' },
      { label: 'Source Citations', labelAr: 'اقتباس المصادر' },
      { label: 'Role-Aware', labelAr: 'مدرك للأدوار' },
    ]
  },
  {
    id: 'research',
    title: 'Research Library',
    titleAr: 'مكتبة الأبحاث',
    description: 'Access 350+ research publications, CBY circulars, World Bank reports, and more. All documents are searchable and downloadable.',
    descriptionAr: 'الوصول إلى أكثر من 350 منشوراً بحثياً وتعميمات البنك المركزي وتقارير البنك الدولي والمزيد. جميع الوثائق قابلة للبحث والتنزيل.',
    icon: FileText,
    highlight: '[data-tour="research"]',
    features: [
      { label: '350+ Documents', labelAr: '+350 وثيقة' },
      { label: 'Full-Text Search', labelAr: 'بحث النص الكامل' },
      { label: 'PDF Downloads', labelAr: 'تنزيل PDF' },
    ]
  },
  {
    id: 'glossary',
    title: 'Bilingual Glossary',
    titleAr: 'المسرد ثنائي اللغة',
    description: 'Understand economic terms with our comprehensive bilingual glossary. Each term has definitions in both Arabic and English.',
    descriptionAr: 'افهم المصطلحات الاقتصادية مع مسردنا الشامل ثنائي اللغة. لكل مصطلح تعريفات بالعربية والإنجليزية.',
    icon: BookOpen,
    highlight: '[data-tour="glossary"]',
    features: [
      { label: '50+ Terms', labelAr: '+50 مصطلحاً' },
      { label: 'Categorized', labelAr: 'مصنف' },
      { label: 'Searchable', labelAr: 'قابل للبحث' },
    ]
  },
  {
    id: 'data-integrity',
    title: 'Data Integrity & Transparency',
    titleAr: 'نزاهة البيانات والشفافية',
    description: 'Every number has a source. We track provenance, flag contradictions, and never guess. If data is missing, we tell you.',
    descriptionAr: 'لكل رقم مصدر. نتتبع المصدر ونحدد التناقضات ولا نخمن أبداً. إذا كانت البيانات مفقودة، نخبرك.',
    icon: Shield,
    highlight: '[data-tour="methodology"]',
    features: [
      { label: 'Source Tracking', labelAr: 'تتبع المصادر' },
      { label: 'Contradiction Flags', labelAr: 'علامات التناقض' },
      { label: 'Confidence Scores', labelAr: 'درجات الثقة' },
    ]
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    titleAr: 'أنت جاهز!',
    description: 'Start exploring Yemen\'s economy with confidence. Use the search bar to find anything, or click on any section to dive deeper.',
    descriptionAr: 'ابدأ استكشاف اقتصاد اليمن بثقة. استخدم شريط البحث للعثور على أي شيء، أو انقر على أي قسم للتعمق أكثر.',
    icon: Sparkles,
    position: 'center',
    features: [
      { label: 'Explore Dashboard', labelAr: 'استكشف لوحة البيانات' },
      { label: 'Ask AI Assistant', labelAr: 'اسأل المساعد الذكي' },
      { label: 'Browse Research', labelAr: 'تصفح الأبحاث' },
    ]
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
  
  // Check if user has seen the tour
  useEffect(() => {
    const seen = localStorage.getItem('yeto_tour_completed');
    if (!seen && !hasSeenTour) {
      // Show tour after a short delay for first-time users
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (forceShow) {
      setIsOpen(true);
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
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const Icon = step.icon;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="max-w-lg p-0 overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header with gradient */}
        <div 
          className="p-6 text-white"
          style={{ 
            background: `linear-gradient(135deg, ${YETO_COLORS.navy} 0%, ${YETO_COLORS.green} 100%)` 
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {language === 'ar' 
                ? `${currentStep + 1} من ${tourSteps.length}` 
                : `${currentStep + 1} of ${tourSteps.length}`}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {language === 'ar' ? step.titleAr : step.title}
              </DialogTitle>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <DialogDescription className="text-base text-foreground leading-relaxed mb-6">
            {language === 'ar' ? step.descriptionAr : step.description}
          </DialogDescription>
          
          {/* Features */}
          {step.features && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {step.features.map((feature, idx) => (
                <Card key={idx} className="bg-gray-50">
                  <CardContent className="p-3 text-center">
                    <p className="text-sm font-medium">
                      {language === 'ar' ? feature.labelAr : feature.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Progress */}
          <Progress value={progress} className="h-1 mb-6" />
          
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {language === 'ar' ? 'السابق' : 'Previous'}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              {language === 'ar' ? 'تخطي الجولة' : 'Skip Tour'}
            </Button>
            
            <Button
              onClick={nextStep}
              className="gap-2"
              style={{ backgroundColor: YETO_COLORS.green }}
            >
              {currentStep === tourSteps.length - 1 
                ? (language === 'ar' ? 'ابدأ الاستكشاف' : 'Start Exploring')
                : (language === 'ar' ? 'التالي' : 'Next')}
              {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
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
        className="gap-2"
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
