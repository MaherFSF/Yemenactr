/**
 * TimeTravelSlider - Interactive time-travel control for the dashboard
 * 
 * Features:
 * 1. Year slider from 2010 to present
 * 2. Event markers on the timeline
 * 3. What-if event neutralization controls
 * 4. Dual regime perspective toggle
 */

import React, { useEffect, useCallback, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  RotateCcw, 
  Zap, 
  AlertTriangle, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Sparkles,
  History,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { 
  useHistoricalStore,
  useSelectedYear,
  useIsTimeTravelActive,
  useNeutralizedEventIds,
  type KeyEvent
} from '@/stores/historicalStore';
import { useLanguage } from '@/contexts/LanguageContext';

// Category colors for event markers
const categoryColors: Record<string, string> = {
  political: 'bg-red-500',
  economic: 'bg-blue-500',
  military: 'bg-orange-500',
  humanitarian: 'bg-purple-500',
  monetary: 'bg-green-500',
  fiscal: 'bg-yellow-500',
  trade: 'bg-cyan-500',
  infrastructure: 'bg-pink-500',
  social: 'bg-indigo-500',
};

// Impact level colors
const impactColors: Record<number, string> = {
  1: 'border-gray-400',
  2: 'border-blue-400',
  3: 'border-yellow-400',
  4: 'border-orange-400',
  5: 'border-red-500',
};

interface TimeTravelSliderProps {
  className?: string;
  compact?: boolean;
}

export function TimeTravelSlider({ className, compact = false }: TimeTravelSliderProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const {
    selectedYear,
    selectedMonth,
    selectedTimestamp,
    neutralizedEventIds,
    isTimeTravelActive,
    showWhatIfPanel,
    selectedRegime,
    allKeyEvents,
    yearEventCounts,
    setSelectedYear,
    setSelectedMonth,
    toggleEventNeutralization,
    clearNeutralizedEvents,
    setAllKeyEvents,
    setYearEventCounts,
    setHistoricalData,
    setLoading,
    setError,
    setShowWhatIfPanel,
    setSelectedRegime,
    resetToPresent,
  } = useHistoricalStore();

  const [isExpanded, setIsExpanded] = useState(!compact);
  const currentYear = new Date().getFullYear();
  const minYear = 2010;

  // Fetch all key events
  const { data: keyEventsData } = trpc.historical.getAllKeyEvents.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch year event counts
  const { data: yearCountsData } = trpc.historical.getYearEventCounts.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // Fetch historical state when timestamp changes
  const { data: historicalState, isLoading, error } = trpc.historical.getStateAtTimestamp.useQuery(
    {
      timestamp: selectedTimestamp,
      neutralizedEventIds,
      regimeTag: selectedRegime === 'all' ? undefined : selectedRegime,
    },
    {
      enabled: isTimeTravelActive,
      staleTime: 30 * 1000, // 30 seconds
    }
  );

  // Update store when data changes
  useEffect(() => {
    if (keyEventsData) {
      setAllKeyEvents(keyEventsData as KeyEvent[]);
    }
  }, [keyEventsData, setAllKeyEvents]);

  useEffect(() => {
    if (yearCountsData) {
      setYearEventCounts(yearCountsData);
    }
  }, [yearCountsData, setYearEventCounts]);

  useEffect(() => {
    setLoading(isLoading);
    if (error) {
      setError(error.message);
    }
  }, [isLoading, error, setLoading, setError]);

  useEffect(() => {
    if (historicalState) {
      setHistoricalData(historicalState as any);
    }
  }, [historicalState, setHistoricalData]);

  // Get events for current year
  const eventsForYear = allKeyEvents.filter(
    e => new Date(e.eventDate).getFullYear() === selectedYear
  );

  // Calculate slider position percentage for event markers
  const getEventPosition = (eventDate: Date) => {
    const year = new Date(eventDate).getFullYear();
    return ((year - minYear) / (currentYear - minYear)) * 100;
  };

  const handleYearChange = useCallback((value: number[]) => {
    setSelectedYear(value[0]);
  }, [setSelectedYear]);

  const handleMonthChange = useCallback((value: number[]) => {
    setSelectedMonth(value[0]);
  }, [setSelectedMonth]);

  // Get event count for a specific year
  const getYearEventCount = (year: number) => {
    const yearData = yearEventCounts.find(y => y.year === year);
    return yearData?.count || 0;
  };

  const getCriticalEventCount = (year: number) => {
    const yearData = yearEventCounts.find(y => y.year === year);
    return yearData?.criticalCount || 0;
  };

  if (compact && !isExpanded) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className={cn(
            'gap-2',
            isTimeTravelActive && 'border-cyan-500 text-cyan-500'
          )}
        >
          <History className="h-4 w-4" />
          {isTimeTravelActive ? (
            <span className="font-mono">{selectedYear}</span>
          ) : (
            <span>{isArabic ? 'السفر عبر الزمن' : 'Time Travel'}</span>
          )}
        </Button>
        {isTimeTravelActive && (
          <Button variant="ghost" size="sm" onClick={resetToPresent}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('border-slate-700 bg-slate-900/80 backdrop-blur', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-cyan-400" />
            {isArabic ? 'السفر عبر الزمن والتحليل الافتراضي' : 'Time-Travel & What-If Analysis'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isTimeTravelActive && (
              <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                <History className="mr-1 h-3 w-3" />
                {isArabic ? 'الوضع التاريخي' : 'Historical Mode'}
              </Badge>
            )}
            {compact && (
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Year Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-slate-400">
              {isArabic ? 'السنة' : 'Year'}
            </Label>
            <span className="font-mono text-2xl font-bold text-cyan-400">
              {selectedYear}
            </span>
          </div>
          
          <div className="relative pt-6 pb-2">
            {/* Event markers on slider track */}
            <div className="absolute top-0 left-0 right-0 h-4">
              <TooltipProvider>
                {allKeyEvents.slice(0, 50).map((event) => {
                  const position = getEventPosition(new Date(event.eventDate));
                  const isNeutralized = neutralizedEventIds.includes(event.id);
                  return (
                    <Tooltip key={event.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'absolute top-0 h-3 w-3 -translate-x-1/2 rounded-full border-2 cursor-pointer transition-all hover:scale-125',
                            categoryColors[event.category] || 'bg-gray-500',
                            impactColors[event.impactLevel] || 'border-gray-400',
                            isNeutralized && 'opacity-30 grayscale'
                          )}
                          style={{ left: `${position}%` }}
                          onClick={() => toggleEventNeutralization(event.id)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {isArabic && event.titleAr ? event.titleAr : event.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(event.eventDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs">
                            {isArabic ? 'انقر للتبديل في سيناريو "ماذا لو"' : 'Click to toggle in what-if scenario'}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
            
            <Slider
              value={[selectedYear]}
              min={minYear}
              max={currentYear}
              step={1}
              onValueChange={handleYearChange}
              className="mt-2"
            />
            
            {/* Year labels */}
            <div className="flex justify-between mt-1 text-xs text-slate-500">
              <span>{minYear}</span>
              <span>2015</span>
              <span>2020</span>
              <span>{currentYear}</span>
            </div>
          </div>
        </div>

        {/* Month Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-slate-400">
              {isArabic ? 'الشهر' : 'Month'}
            </Label>
            <span className="font-mono text-lg text-slate-300">
              {new Date(selectedYear, selectedMonth - 1).toLocaleDateString(isArabic ? 'ar' : 'en', { month: 'long' })}
            </span>
          </div>
          <Slider
            value={[selectedMonth]}
            min={1}
            max={12}
            step={1}
            onValueChange={handleMonthChange}
          />
        </div>

        {/* Regime Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-slate-700">
          <Label className="text-sm text-slate-400">
            {isArabic ? 'المنظور' : 'Perspective'}
          </Label>
          <div className="flex gap-2">
            <Button
              variant={selectedRegime === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRegime('all')}
            >
              {isArabic ? 'الكل' : 'All'}
            </Button>
            <Button
              variant={selectedRegime === 'aden_irg' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRegime('aden_irg')}
              className={selectedRegime === 'aden_irg' ? 'bg-blue-600' : ''}
            >
              {isArabic ? 'عدن' : 'Aden (IRG)'}
            </Button>
            <Button
              variant={selectedRegime === 'sanaa_defacto' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRegime('sanaa_defacto')}
              className={selectedRegime === 'sanaa_defacto' ? 'bg-green-600' : ''}
            >
              {isArabic ? 'صنعاء' : "Sana'a (DFA)"}
            </Button>
          </div>
        </div>

        {/* Events for Selected Year */}
        {eventsForYear.length > 0 && (
          <div className="space-y-2 border-t border-slate-700 pt-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-slate-400">
                {isArabic ? `أحداث ${selectedYear}` : `${selectedYear} Events`}
              </Label>
              <Badge variant="secondary">{eventsForYear.length}</Badge>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {eventsForYear.map((event) => {
                const isNeutralized = neutralizedEventIds.includes(event.id);
                return (
                  <div
                    key={event.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all',
                      'hover:bg-slate-800',
                      isNeutralized && 'opacity-50 line-through'
                    )}
                    onClick={() => toggleEventNeutralization(event.id)}
                  >
                    <div className={cn(
                      'h-2 w-2 rounded-full',
                      categoryColors[event.category] || 'bg-gray-500'
                    )} />
                    <span className="text-sm flex-1 truncate">
                      {isArabic && event.titleAr ? event.titleAr : event.title}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(event.eventDate).toLocaleDateString(isArabic ? 'ar' : 'en', { month: 'short', day: 'numeric' })}
                    </span>
                    {isNeutralized ? (
                      <EyeOff className="h-3 w-3 text-slate-500" />
                    ) : (
                      <Eye className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* What-If Controls */}
        {neutralizedEventIds.length > 0 && (
          <div className="space-y-2 border-t border-slate-700 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <Label className="text-sm text-amber-400">
                  {isArabic ? 'سيناريو "ماذا لو"' : 'What-If Scenario'}
                </Label>
              </div>
              <Badge variant="outline" className="border-amber-500 text-amber-400">
                {neutralizedEventIds.length} {isArabic ? 'أحداث معطلة' : 'events disabled'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              {isArabic 
                ? 'الأحداث المعطلة لن تؤثر على التوقعات. انقر على حدث لتبديله.'
                : 'Disabled events will not affect projections. Click an event to toggle.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearNeutralizedEvents}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {isArabic ? 'إعادة تعيين السيناريو' : 'Reset Scenario'}
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToPresent}
            disabled={!isTimeTravelActive}
            className="flex-1"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {isArabic ? 'العودة للحاضر' : 'Return to Present'}
          </Button>
          {neutralizedEventIds.length > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowWhatIfPanel(true)}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isArabic ? 'عرض التوقعات' : 'View Projection'}
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400" />
            <span className="ml-2 text-sm text-slate-400">
              {isArabic ? 'جاري التحميل...' : 'Loading historical data...'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TimeTravelSlider;
