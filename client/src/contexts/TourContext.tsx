import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for the element to highlight
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'scroll' | 'none';
  prerequisite?: string; // Step that must be completed first
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string; // e.g., 'navigation', 'data', 'analysis'
  titleAr?: string; // Arabic title
  descriptionAr?: string; // Arabic description
}

export interface TourAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface TourState {
  completedSteps: Set<string>;
  currentStep: string | null;
  isActive: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  achievements: TourAchievement[];
  lastInteractionTime: number;
  pageVisits: Record<string, number>;
  featureDiscoveries: Set<string>;
  language: 'en' | 'ar';
}

export interface TourContextType {
  state: TourState;
  startTour: (stepId?: string) => void;
  endTour: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  completeStep: (stepId: string) => void;
  setDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
  recordInteraction: (elementId: string) => void;
  recordPageVisit: (page: string) => void;
  getRecommendedNextStep: () => string | null;
  getSuggestedFeatures: () => TourStep[];
  unlockAchievement: (achievementId: string) => void;
  resetTour: () => void;
  keyboardShortcutsEnabled: boolean;
  setKeyboardShortcutsEnabled: (enabled: boolean) => void;
  setLanguage: (language: 'en' | 'ar') => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);
  const [state, setState] = useState<TourState>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('yeto_tour_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          completedSteps: new Set(parsed.completedSteps),
          featureDiscoveries: new Set(parsed.featureDiscoveries),
          achievements: parsed.achievements || [],
          language: parsed.language || 'en',
        };
      } catch {
        // Fall back to defaults
      }
    }

    return {
      completedSteps: new Set(),
      currentStep: null,
      isActive: false,
      difficulty: 'beginner',
      achievements: [],
      lastInteractionTime: Date.now(),
      pageVisits: {},
      featureDiscoveries: new Set(),
      language: 'en',
    };
  });

  // Persist to localStorage
  useEffect(() => {
    const toSave = {
      ...state,
      completedSteps: Array.from(state.completedSteps),
      featureDiscoveries: Array.from(state.featureDiscoveries),
    };
    localStorage.setItem('yeto_tour_state', JSON.stringify(toSave));
  }, [state]);

  // Keyboard shortcuts handler
  useEffect(() => {
    if (!keyboardShortcutsEnabled || !state.isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = e.target as HTMLElement;
      const isTyping = ['INPUT', 'TEXTAREA'].includes(target.tagName);
      if (isTyping) return;

      const steps = ['welcome', 'search', 'dashboard', 'sectors', 'tools', 'data-repo', 'ai-assistant', 'report-builder', 'scenario-simulator'];
      const currentIndex = state.currentStep ? steps.indexOf(state.currentStep) : -1;

      switch (e.key) {
        case 'ArrowRight':
        case 'n':
        case 'N':
          e.preventDefault();
          if (currentIndex < steps.length - 1) {
            setState(prev => ({
              ...prev,
              currentStep: steps[currentIndex + 1],
            }));
          }
          break;
        case 'ArrowLeft':
        case 'p':
        case 'P':
          e.preventDefault();
          if (currentIndex > 0) {
            setState(prev => ({
              ...prev,
              currentStep: steps[currentIndex - 1],
            }));
          }
          break;
        case 'Escape':
          e.preventDefault();
          endTour();
          break;
        case '?':
          // Show keyboard shortcuts help
          e.preventDefault();
          const helpText = state.language === 'ar'
            ? 'اختصارات لوحة المفاتيح للجولة:\n→ أو N: الخطوة التالية\n← أو P: الخطوة السابقة\nEsc: إغلاق الجولة\n? : عرض هذه المساعدة'
            : 'Tour Keyboard Shortcuts:\n→ or N: Next step\n← or P: Previous step\nEsc: Exit tour\n? : Show this help';
          console.log(helpText);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcutsEnabled, state.isActive, state.currentStep]);

  const startTour = useCallback((stepId?: string) => {
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStep: stepId || null,
    }));
  }, []);

  const endTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      currentStep: null,
    }));
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setState(prev => {
      const newCompleted = new Set(prev.completedSteps);
      newCompleted.add(stepId);
      return {
        ...prev,
        completedSteps: newCompleted,
        lastInteractionTime: Date.now(),
      };
    });
  }, []);

  const recordInteraction = useCallback((elementId: string) => {
    setState(prev => {
      const newDiscoveries = new Set(prev.featureDiscoveries);
      newDiscoveries.add(elementId);
      return {
        ...prev,
        featureDiscoveries: newDiscoveries,
        lastInteractionTime: Date.now(),
      };
    });
  }, []);

  const recordPageVisit = useCallback((page: string) => {
    setState(prev => ({
      ...prev,
      pageVisits: {
        ...prev.pageVisits,
        [page]: (prev.pageVisits[page] || 0) + 1,
      },
    }));
  }, []);

  const setDifficulty = useCallback((difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    setState(prev => ({
      ...prev,
      difficulty,
    }));
  }, []);

  const nextStep = useCallback(() => {
    // Implementation will depend on tour steps array
    setState(prev => ({
      ...prev,
      lastInteractionTime: Date.now(),
    }));
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastInteractionTime: Date.now(),
    }));
  }, []);

  const skipStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastInteractionTime: Date.now(),
    }));
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    setState(prev => {
      const existingAchievement = prev.achievements.find(a => a.id === achievementId);
      if (existingAchievement) return prev;

      return {
        ...prev,
        achievements: [
          ...prev.achievements,
          {
            id: achievementId,
            title: '',
            description: '',
            icon: '🏆',
            unlockedAt: Date.now(),
          },
        ],
      };
    });
  }, []);

  const getRecommendedNextStep = useCallback((): string | null => {
    // Smart algorithm to recommend next step based on:
    // 1. User difficulty level
    // 2. Completed steps
    // 3. Current page
    // 4. Time spent on features
    // 5. Discovery patterns
    return null; // Will be implemented with tour steps
  }, [state]);

  const getSuggestedFeatures = useCallback((): TourStep[] => {
    // Return features user hasn't discovered yet
    // Prioritized by difficulty and relevance
    return [];
  }, [state]);

  const resetTour = useCallback(() => {
    setState({
      completedSteps: new Set(),
      currentStep: null,
      isActive: false,
      difficulty: 'beginner',
      achievements: [],
      lastInteractionTime: Date.now(),
      pageVisits: {},
      featureDiscoveries: new Set(),
      language: 'en',
    });
    localStorage.removeItem('yeto_tour_state');
  }, []);

  const setLanguage = useCallback((language: 'en' | 'ar') => {
    setState(prev => ({
      ...prev,
      language,
    }));
  }, []);

  const value: TourContextType = {
    state,
    startTour,
    endTour,
    nextStep,
    previousStep,
    skipStep,
    completeStep,
    setDifficulty,
    recordInteraction,
    recordPageVisit,
    getRecommendedNextStep,
    getSuggestedFeatures,
    unlockAchievement,
    resetTour,
    keyboardShortcutsEnabled,
    setKeyboardShortcutsEnabled,
    setLanguage,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
};
