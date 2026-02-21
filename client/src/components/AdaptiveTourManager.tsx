import React, { useState, useEffect, useCallback } from 'react';
import { useTour, TourStep } from '@/contexts/TourContext';
import { SmartTooltip } from './SmartTooltip';
import { Trophy, Lightbulb } from 'lucide-react';

// Define all tour steps with intelligent sequencing
const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CauseWay',
    description: 'Your intelligent guide to Yemen\'s economic data. Let\'s explore together!',
    placement: 'center',
    difficulty: 'beginner',
    category: 'introduction',
  },
  {
    id: 'search-bar',
    title: 'Search Everything',
    description: 'Search for indicators, documents, or entities. Try searching for "GDP" or "inflation".',
    target: '[data-tour="search"]',
    placement: 'bottom',
    difficulty: 'beginner',
    category: 'navigation',
  },
  {
    id: 'sectors-menu',
    title: 'Explore by Sector',
    description: 'Browse economic data organized by sector. Each sector has curated indicators and analysis.',
    target: '[data-tour="sectors"]',
    placement: 'bottom',
    difficulty: 'beginner',
    category: 'navigation',
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Customize your view with key indicators. Drag, drop, and personalize your workspace.',
    target: '[data-tour="dashboard"]',
    placement: 'bottom',
    difficulty: 'beginner',
    category: 'features',
  },
  {
    id: 'evidence-drawer',
    title: 'Evidence-Backed Data',
    description: 'Every number is backed by sources. Click the Evidence button to see citations and methodology.',
    target: '[data-tour="evidence"]',
    placement: 'left',
    difficulty: 'intermediate',
    category: 'data-quality',
  },
  {
    id: 'ai-assistant',
    title: 'Ask Our AI Assistant',
    description: 'Ask questions in natural language. \"What\'s the inflation trend?\" or \"Compare exchange rates.\"',
    target: '[data-tour="ai-assistant"]',
    placement: 'left',
    difficulty: 'intermediate',
    category: 'features',
  },
  {
    id: 'export-data',
    title: 'Export & Share',
    description: 'Export data as CSV, Excel, or PDF. Perfect for reports and presentations.',
    target: '[data-tour="export"]',
    placement: 'bottom',
    difficulty: 'intermediate',
    category: 'features',
  },
  {
    id: 'advanced-filters',
    title: 'Advanced Filters',
    description: 'Filter by date range, regime, or data quality. Combine filters for precise analysis.',
    target: '[data-tour="filters"]',
    placement: 'bottom',
    difficulty: 'advanced',
    category: 'analysis',
  },
  {
    id: 'comparison-mode',
    title: 'Compare Regimes',
    description: 'Compare economic indicators between CBY Aden and CBY Sana\'a. Spot differences instantly.',
    target: '[data-tour="comparison"]',
    placement: 'bottom',
    difficulty: 'advanced',
    category: 'analysis',
  },
];

interface AdaptiveTourManagerProps {
  onTourComplete?: () => void;
}

export const AdaptiveTourManager: React.FC<AdaptiveTourManagerProps> = ({ onTourComplete }) => {
  const { state, startTour, endTour, completeStep, recordInteraction } = useTour();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [suggestedStep, setSuggestedStep] = useState<TourStep | null>(null);

  const currentStep = state.isActive ? TOUR_STEPS[currentStepIndex] : null;

  // Smart pause detection - offer help if user seems confused
  useEffect(() => {
    if (!state.isActive) {
      const timeSinceLastInteraction = Date.now() - state.lastInteractionTime;
      // If user hasn't interacted for 30 seconds, suggest help
      if (timeSinceLastInteraction > 30000 && Math.random() > 0.7) {
        const uncompletedSteps = TOUR_STEPS.filter(
          step => !state.completedSteps.has(step.id) && step.difficulty === state.difficulty
        );
        if (uncompletedSteps.length > 0) {
          setSuggestedStep(uncompletedSteps[0]);
        }
      }
    }
  }, [state.isActive, state.lastInteractionTime, state.completedSteps, state.difficulty]);

  const handleNextStep = useCallback(() => {
    if (!currentStep) return;

    completeStep(currentStep.id);
    recordInteraction(currentStep.id);

    // Check if tour is complete
    if (currentStepIndex >= TOUR_STEPS.length - 1) {
      endTour();
      setShowAchievement(true);
      setTimeout(() => {
        setShowAchievement(false);
        onTourComplete?.();
      }, 3000);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStep, currentStepIndex, completeStep, recordInteraction, endTour, onTourComplete]);

  const handlePreviousStep = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleSkipTour = useCallback(() => {
    endTour();
    setSuggestedStep(null);
  }, [endTour]);

  const handleAcceptSuggestion = useCallback(() => {
    if (suggestedStep) {
      const stepIndex = TOUR_STEPS.findIndex(s => s.id === suggestedStep.id);
      setCurrentStepIndex(stepIndex);
      startTour(suggestedStep.id);
      setSuggestedStep(null);
    }
  }, [suggestedStep, startTour]);

  // Get target element
  const targetElement = currentStep?.target
    ? document.querySelector(currentStep.target) as HTMLElement
    : null;

  return (
    <>
      {/* Main tour tooltip */}
      {state.isActive && currentStep && (
        <SmartTooltip
          title={currentStep.title}
          description={currentStep.description}
          targetElement={targetElement}
          placement={currentStep.placement}
          onClose={handleSkipTour}
          onNext={handleNextStep}
          onPrevious={currentStepIndex > 0 ? handlePreviousStep : undefined}
          stepNumber={currentStepIndex + 1}
          totalSteps={TOUR_STEPS.length}
          showTip={currentStep.difficulty === 'advanced'}
        />
      )}

      {/* Smart suggestion tooltip */}
      {suggestedStep && !state.isActive && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-[#C9A961] flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <h4 className="font-bold text-[#2C3424]">Need help?</h4>
                <p className="text-sm text-gray-700 mt-1">
                  We noticed you might want to learn about {suggestedStep.title.toLowerCase()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSuggestedStep(null)}
                className="flex-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleAcceptSuggestion}
                className="flex-1 px-3 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#C9A961] to-[#b8964d] rounded-lg transition-all hover:shadow-lg"
              >
                Learn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement popup */}
      {showAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center space-y-4 animate-bounce">
            <Trophy className="w-16 h-16 text-[#C9A961] mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-[#2C3424]">Tour Complete!</h3>
              <p className="text-gray-600 mt-2">You've unlocked the full power of CauseWay 🎉</p>
            </div>
          </div>
        </div>
      )}

      {/* Tour progress indicator (always visible) */}
      {state.isActive && (
        <div className="fixed top-6 left-6 z-40 bg-white/90 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#C9A961] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              Tour: Step {currentStepIndex + 1}/{TOUR_STEPS.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
