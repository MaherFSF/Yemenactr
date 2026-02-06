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
  BarChart3, Brain, Sparkles,
  FileText, Search, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  titleAr: string;
  kicker: string;
  kickerAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  features?: { en: string; ar: string }[];
  actionLabel?: string;
  actionLabelAr?: string;
  actionHref?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'YETO Discovery Atlas',
    titleAr: 'أطلس الاستكشاف في يتو',
    kicker: 'Discovery Portal',
    kickerAr: 'بوابة الاستكشاف',
    description: "A guided intelligence journey across Yemen's economy—verified, bilingual, and evidence-first.",
    descriptionAr: "رحلة ذكاء موجهة عبر اقتصاد اليمن — موثقة، ثنائية اللغة، قائمة على الأدلة.",
    icon: Sparkles,
    accent: '#1f2d1d',
    features: [
      { en: "Evidence-led answers, never guesses", ar: "إجابات مدعومة بالأدلة وليست تخميناً" },
      { en: "Bilingual interface (Arabic/English)", ar: "واجهة ثنائية اللغة (عربي/إنجليزي)" },
      { en: "Live confidence and provenance", ar: "ثقة ومصدر لكل معلومة" },
    ],
  },
  {
    id: 'dashboard',
    title: 'Live Signal Deck',
    titleAr: 'لوحة الإشارات الحية',
    kicker: 'Signals',
    kickerAr: 'الإشارات',
    description: "Real-time indicators with freshness SLAs, confidence grades, and provenance tracking.",
    descriptionAr: "مؤشرات فورية مع اتفاقيات حداثة، وتصنيفات ثقة، وتتبع المصدر.",
    icon: BarChart3,
    accent: '#2e8b6e',
    features: [
      { en: "Exchange rates by authority", ar: "أسعار صرف حسب السلطة" },
      { en: "Auto-refresh & anomaly flags", ar: "تحديث تلقائي وتنبيه الشذوذ" },
      { en: "Confidence grading for each KPI", ar: "تصنيف ثقة لكل مؤشر" },
    ],
    actionLabel: 'Open Dashboard',
    actionLabelAr: 'عرض لوحة الإشارات',
    actionHref: '/dashboard',
  },
  {
    id: 'sectors',
    title: 'Sector Intelligence Map',
    titleAr: 'خريطة ذكاء القطاعات',
    kicker: 'Sectors',
    kickerAr: 'القطاعات',
    description: "Sixteen sector lenses with regional overlays, evidence packs, and time-travel views.",
    descriptionAr: "ستة عشر عدسة قطاعية مع طبقات إقليمية وحزم أدلة وعرض تاريخي.",
    icon: Layers,
    accent: '#6b8e6b',
    features: [
      { en: "16 sector dashboards", ar: "16 لوحة قطاعية" },
      { en: "Regional + regime lenses", ar: "عدسات إقليمية وسلطوية" },
      { en: "Scenario-ready comparisons", ar: "مقارنات جاهزة للسيناريو" },
    ],
    actionLabel: 'Explore Sectors',
    actionLabelAr: 'استكشف القطاعات',
    actionHref: '/data-repository',
  },
  {
    id: 'ai-assistant',
    title: 'One Brain + Specialist Agents',
    titleAr: 'العقل الواحد + وكلاء متخصصون',
    kicker: 'Agents',
    kickerAr: 'الوكلاء',
    description: "Ask in Arabic or English and get evidence-backed responses with persona routing.",
    descriptionAr: "اسأل بالعربية أو الإنجليزية واحصل على إجابات مدعومة بالأدلة وتوجيه تلقائي للوكلاء.",
    icon: Brain,
    accent: '#C5A028',
    features: [
      { en: "Persona routing for every sector", ar: "توجيه الوكلاء حسب القطاع" },
      { en: "Evidence packs & caveats included", ar: "حزم أدلة وتحفظات مدمجة" },
      { en: "Translation duo built-in", ar: "وكيلان متخصصان للترجمة" },
    ],
    actionLabel: 'Open AI Assistant',
    actionLabelAr: 'افتح المساعد الذكي',
    actionHref: '/ai-assistant',
  },
  {
    id: 'research',
    title: 'Evidence Vault',
    titleAr: 'خزانة الأدلة',
    kicker: 'Evidence',
    kickerAr: 'الأدلة',
    description: "A verified research library with citations, audit trails, and export-ready evidence packs.",
    descriptionAr: "مكتبة أبحاث موثقة مع استشهادات ومسارات تدقيق وحزم أدلة قابلة للتصدير.",
    icon: FileText,
    accent: '#234876',
    features: [
      { en: "370+ vetted publications", ar: "أكثر من 370 منشوراً موثقاً" },
      { en: "Source reliability ratings", ar: "تصنيفات موثوقية للمصادر" },
      { en: "Exportable evidence packs", ar: "حزم أدلة قابلة للتصدير" },
    ],
    actionLabel: 'Browse Evidence',
    actionLabelAr: 'تصفح الأدلة',
    actionHref: '/research-library',
  },
  {
    id: 'complete',
    title: 'Launch Your Mission',
    titleAr: 'ابدأ المهمة',
    kicker: 'Ready',
    kickerAr: 'جاهز',
    description: "Search anything, navigate fast, and share insights across teams and devices.",
    descriptionAr: "ابحث عن أي شيء، تنقل بسرعة، وشارك الرؤى عبر الفرق والأجهزة.",
    icon: Search,
    accent: '#0D2818',
    features: [
      { en: "Unified global search", ar: "بحث شامل موحّد" },
      { en: "Mobile-first navigation", ar: "تنقل مهيأ للموبايل" },
      { en: "Download and share insights", ar: "تنزيل ومشاركة الرؤى" },
    ],
    actionLabel: 'Start Exploring',
    actionLabelAr: 'ابدأ الاستكشاف',
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
  const progress = Math.round(((currentStep + 1) / tourSteps.length) * 100);
  const accent = step.accent || "#1f2d1d";
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="max-w-lg p-0 overflow-hidden border-0 shadow-2xl rounded-3xl bg-white"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Discovery Header */}
        <div
          className="relative border-b border-gray-100"
          style={{ background: `linear-gradient(135deg, ${accent}22 0%, #ffffff 55%)` }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <img 
                src="/images/yeto-logo.png" 
                alt="YETO" 
                className="h-7 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <Badge
                className="border-0 text-xs font-medium"
                style={{ backgroundColor: accent, color: "#fff" }}
              >
                {language === 'ar' ? 'جولة الاستكشاف' : 'Discovery Tour'}
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

          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span>{language === 'ar' ? step.kickerAr : step.kicker}</span>
              <span className="text-gray-300">•</span>
              <span>{currentStep + 1}/{tourSteps.length}</span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: accent }}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              {tourSteps.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => goToStep(idx)}
                  className="rounded-full transition-all duration-300 cursor-pointer hover:opacity-80"
                  style={{
                    width: idx === currentStep ? "26px" : "8px",
                    height: "6px",
                    backgroundColor: idx <= currentStep ? accent : "#E5E7EB",
                    opacity: idx < currentStep ? 0.5 : 1,
                  }}
                />
              ))}
              <span className={cn(
                "text-gray-400 text-xs font-medium",
                isRTL ? "mr-auto" : "ml-auto"
              )}>
                {progress}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className={cn(
          "p-6 space-y-5 transition-opacity duration-150",
          isAnimating ? "opacity-0" : "opacity-100"
        )}>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${accent}1a` }}
            >
              <Icon className="h-7 w-7" style={{ color: accent }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                {language === 'ar' ? step.kickerAr : step.kicker}
              </p>
              <h3 className="text-xl font-bold text-gray-900">
                {language === 'ar' ? step.titleAr : step.title}
              </h3>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            {language === 'ar' ? step.descriptionAr : step.description}
          </p>

          {step.features && (
            <div className="space-y-2">
              {step.features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                  <span>{language === 'ar' ? feature.ar : feature.en}</span>
                </div>
              ))}
            </div>
          )}

          {step.actionHref && (
            <a 
              href={step.actionHref}
              className="block w-full"
              onClick={handleComplete}
            >
              <Button 
                variant="outline" 
                className="w-full hover:bg-black/5"
                style={{ borderColor: accent, color: accent }}
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
              className="text-white px-5 hover:opacity-90"
              style={{ backgroundColor: accent }}
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
        className="text-gray-600 hover:text-[#1f2d1d] hover:bg-[#1f2d1d]/5"
      >
        <Sparkles className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">
          {language === 'ar' ? 'جولة الاستكشاف' : 'Discovery Tour'}
        </span>
      </Button>
      <WelcomeTour 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
      />
    </>
  );
}
