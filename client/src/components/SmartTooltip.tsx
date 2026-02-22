import React, { useEffect, useState } from 'react';
import { X, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import { useTour } from '@/contexts/TourContext';

interface SmartTooltipProps {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  targetElement?: HTMLElement | null;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  stepNumber?: number;
  totalSteps?: number;
  showTip?: boolean; // Show lightbulb tip icon
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  title,
  titleAr,
  description,
  descriptionAr,
  targetElement,
  placement = 'bottom',
  onClose,
  onNext,
  onPrevious,
  stepNumber,
  totalSteps,
  showTip = false,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const { completeStep, state } = useTour();
  const isRTL = state.language === 'ar';
  const displayTitle = isRTL && titleAr ? titleAr : title;
  const displayDescription = isRTL && descriptionAr ? descriptionAr : description;

  useEffect(() => {
    if (!targetElement) {
      setIsVisible(true);
      return;
    }

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const gap = 12;
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = rect.top - tooltipHeight - gap;
          left = isRTL 
            ? rect.right - tooltipWidth 
            : rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + gap;
          left = isRTL 
            ? rect.right - tooltipWidth 
            : rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = isRTL ? rect.right + gap : rect.left - tooltipWidth - gap;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = isRTL ? rect.left - tooltipWidth - gap : rect.right + gap;
          break;
        case 'center':
          top = window.innerHeight / 2 - tooltipHeight / 2;
          left = window.innerWidth / 2 - tooltipWidth / 2;
          break;
      }

      // Keep tooltip within viewport
      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      }
      if (top < 10) top = 10;

      setPosition({ top, left });
      setIsVisible(true);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [targetElement, placement, isRTL]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleNext = () => {
    onNext?.();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Spotlight overlay */}
      {targetElement && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute border-2 border-[#C9A961] rounded-lg shadow-[0_0_30px_rgba(201,169,97,0.4)] animate-pulse"
            style={{
              top: targetElement.getBoundingClientRect().top - 8,
              left: targetElement.getBoundingClientRect().left - 8,
              width: targetElement.getBoundingClientRect().width + 16,
              height: targetElement.getBoundingClientRect().height + 16,
            }}
          />
        </div>
      )}

      {/* Tooltip */}
      <div
        className={`fixed z-50 w-80 pointer-events-auto ${isRTL ? 'rtl' : 'ltr'}`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >
        <div className="relative">
          {/* Glassmorphism card */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className={`text-lg font-bold text-[#2C3424] flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {showTip && <Zap className="w-5 h-5 text-[#C9A961] animate-pulse flex-shrink-0" />}
                  <span>{displayTitle}</span>
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Description */}
            <p className={`text-sm text-gray-700 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {displayDescription}
            </p>

            {/* Progress indicator */}
            {stepNumber !== undefined && totalSteps !== undefined && (
              <div className="space-y-2">
                <div className={`flex justify-between text-xs text-gray-500 font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? `الخطوة ${stepNumber} من ${totalSteps}` : `Step ${stepNumber} of ${totalSteps}`}</span>
                  <span>{Math.round((stepNumber / totalSteps) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#C9A961] to-[#d4af37] transition-all duration-300"
                    style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className={`flex gap-2 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {onPrevious && (
                <button
                  onClick={onPrevious}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  <span>{isRTL ? 'السابق' : 'Back'}</span>
                </button>
              )}
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isRTL ? 'تخطي' : 'Skip'}
              </button>
              {onNext && (
                <button
                  onClick={handleNext}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#C9A961] to-[#b8964d] hover:from-[#d4af37] hover:to-[#C9A961] rounded-lg transition-all shadow-lg hover:shadow-xl ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <span>{isRTL ? 'التالي' : 'Next'}</span>
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Tip badge */}
            <div className={`text-xs text-gray-500 pt-2 border-t border-gray-200 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? '💡 نصيحة: يمكنك الوصول إلى هذه الجولة من القائمة دائماً' : '💡 Pro tip: You can always access this tour from the menu'}
            </div>
          </div>

          {/* Arrow pointer */}
          {placement !== 'center' && (
            <div
              className="absolute w-4 h-4 bg-white/90 backdrop-blur-xl border border-white/20 rotate-45"
              style={{
                ...(placement === 'bottom' && {
                  top: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }),
                ...(placement === 'top' && {
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }),
                ...(placement === 'left' && {
                  right: isRTL ? 'auto' : '-8px',
                  left: isRTL ? '-8px' : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }),
                ...(placement === 'right' && {
                  left: isRTL ? '-8px' : 'auto',
                  right: isRTL ? 'auto' : '-8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }),
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};
