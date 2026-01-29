/**
 * Historical Store - Zustand store for Time-Travel What-If System
 * 
 * Manages:
 * 1. Selected timestamp for time-travel
 * 2. Neutralized events for what-if scenarios
 * 3. Historical data state from API
 * 4. Loading and error states
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types for historical data
export interface KeyEvent {
  id: number;
  eventDate: Date;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  category: string;
  impactLevel: number;
  regimeTag: string;
  affectedIndicators?: string[];
  sourceCitation: string;
  sourceUrl?: string;
  isNeutralizable: boolean;
}

export interface HistoricalObservation {
  indicatorCode: string;
  regimeTag: string;
  date: Date;
  value: number;
  unit: string;
  confidenceRating: string;
}

export interface HistoricalSummary {
  fxRateAden: number | null;
  fxRateSanaa: number | null;
  inflationAden: number | null;
  inflationSanaa: number | null;
  totalEvents: number;
  criticalEvents: number;
}

export interface HistoricalState {
  timestamp: Date;
  observations: HistoricalObservation[];
  keyEvents: KeyEvent[];
  summary: HistoricalSummary;
  neutralizedEventIds: number[];
}

export interface WhatIfProjection {
  projectedIndicators: Array<{
    indicatorCode: string;
    originalValue: number;
    projectedValue: number;
    confidence: number;
    reasoning: string;
  }>;
  narrativeSummary: string;
  narrativeSummaryAr: string;
  methodology: string;
  caveats: string[];
}

interface HistoricalStoreState {
  // Current selected state
  selectedYear: number;
  selectedMonth: number;
  selectedTimestamp: Date;
  
  // Neutralized events for what-if
  neutralizedEventIds: number[];
  
  // Data from API
  historicalData: HistoricalState | null;
  whatIfProjection: WhatIfProjection | null;
  allKeyEvents: KeyEvent[];
  yearEventCounts: Array<{ year: number; count: number; criticalCount: number }>;
  
  // UI state
  isLoading: boolean;
  isProjectionLoading: boolean;
  error: string | null;
  isTimeTravelActive: boolean;
  showWhatIfPanel: boolean;
  
  // Regime filter
  selectedRegime: 'all' | 'aden_irg' | 'sanaa_defacto';
  
  // Actions
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedTimestamp: (timestamp: Date) => void;
  toggleEventNeutralization: (eventId: number) => void;
  clearNeutralizedEvents: () => void;
  setHistoricalData: (data: HistoricalState) => void;
  setWhatIfProjection: (projection: WhatIfProjection | null) => void;
  setAllKeyEvents: (events: KeyEvent[]) => void;
  setYearEventCounts: (counts: Array<{ year: number; count: number; criticalCount: number }>) => void;
  setLoading: (loading: boolean) => void;
  setProjectionLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTimeTravelActive: (active: boolean) => void;
  setShowWhatIfPanel: (show: boolean) => void;
  setSelectedRegime: (regime: 'all' | 'aden_irg' | 'sanaa_defacto') => void;
  resetToPresent: () => void;
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export const useHistoricalStore = create<HistoricalStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        selectedYear: currentYear,
        selectedMonth: currentMonth,
        selectedTimestamp: new Date(),
        neutralizedEventIds: [],
        historicalData: null,
        whatIfProjection: null,
        allKeyEvents: [],
        yearEventCounts: [],
        isLoading: false,
        isProjectionLoading: false,
        error: null,
        isTimeTravelActive: false,
        showWhatIfPanel: false,
        selectedRegime: 'all',

        // Actions
        setSelectedYear: (year) => {
          const { selectedMonth } = get();
          const newTimestamp = new Date(year, selectedMonth - 1, 15);
          set({ 
            selectedYear: year, 
            selectedTimestamp: newTimestamp,
            isTimeTravelActive: year !== currentYear || selectedMonth !== currentMonth,
          });
        },

        setSelectedMonth: (month) => {
          const { selectedYear } = get();
          const newTimestamp = new Date(selectedYear, month - 1, 15);
          set({ 
            selectedMonth: month, 
            selectedTimestamp: newTimestamp,
            isTimeTravelActive: selectedYear !== currentYear || month !== currentMonth,
          });
        },

        setSelectedTimestamp: (timestamp) => {
          const year = timestamp.getFullYear();
          const month = timestamp.getMonth() + 1;
          set({ 
            selectedTimestamp: timestamp,
            selectedYear: year,
            selectedMonth: month,
            isTimeTravelActive: year !== currentYear || month !== currentMonth,
          });
        },

        toggleEventNeutralization: (eventId) => {
          const { neutralizedEventIds } = get();
          const newIds = neutralizedEventIds.includes(eventId)
            ? neutralizedEventIds.filter(id => id !== eventId)
            : [...neutralizedEventIds, eventId];
          set({ 
            neutralizedEventIds: newIds,
            whatIfProjection: null, // Clear projection when events change
          });
        },

        clearNeutralizedEvents: () => {
          set({ 
            neutralizedEventIds: [],
            whatIfProjection: null,
          });
        },

        setHistoricalData: (data) => set({ historicalData: data, isLoading: false, error: null }),
        setWhatIfProjection: (projection) => set({ whatIfProjection: projection, isProjectionLoading: false }),
        setAllKeyEvents: (events) => set({ allKeyEvents: events }),
        setYearEventCounts: (counts) => set({ yearEventCounts: counts }),
        setLoading: (loading) => set({ isLoading: loading }),
        setProjectionLoading: (loading) => set({ isProjectionLoading: loading }),
        setError: (error) => set({ error, isLoading: false }),
        setTimeTravelActive: (active) => set({ isTimeTravelActive: active }),
        setShowWhatIfPanel: (show) => set({ showWhatIfPanel: show }),
        setSelectedRegime: (regime) => set({ selectedRegime: regime }),

        resetToPresent: () => {
          set({
            selectedYear: currentYear,
            selectedMonth: currentMonth,
            selectedTimestamp: new Date(),
            neutralizedEventIds: [],
            whatIfProjection: null,
            isTimeTravelActive: false,
            showWhatIfPanel: false,
          });
        },
      }),
      {
        name: 'yeto-historical-store',
        partialize: (state) => ({
          // Only persist these fields
          selectedYear: state.selectedYear,
          selectedMonth: state.selectedMonth,
          selectedRegime: state.selectedRegime,
        }),
      }
    ),
    { name: 'HistoricalStore' }
  )
);

// Selector hooks for common use cases
export const useSelectedTimestamp = () => useHistoricalStore(state => state.selectedTimestamp);
export const useSelectedYear = () => useHistoricalStore(state => state.selectedYear);
export const useIsTimeTravelActive = () => useHistoricalStore(state => state.isTimeTravelActive);
export const useNeutralizedEventIds = () => useHistoricalStore(state => state.neutralizedEventIds);
export const useHistoricalData = () => useHistoricalStore(state => state.historicalData);
export const useWhatIfProjection = () => useHistoricalStore(state => state.whatIfProjection);
