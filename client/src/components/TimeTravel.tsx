/**
 * Time Travel UI Component - Section 7 Implementation
 * Allows users to navigate data across 2010→Present timeline
 */

import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Calendar, Play, Pause, SkipBack, SkipForward, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface TimeTravelProps {
  startYear?: number;
  endYear?: number;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  granularity?: 'day' | 'month' | 'quarter' | 'year';
  showPlayback?: boolean;
  className?: string;
}

export function TimeTravel({
  startYear = 2010,
  endYear = new Date().getFullYear(),
  currentDate,
  onDateChange,
  granularity = 'month',
  showPlayback = true,
  className = ''
}: TimeTravelProps) {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per step
  
  // Calculate total steps based on granularity
  const getStepCount = useCallback(() => {
    const years = endYear - startYear + 1;
    switch (granularity) {
      case 'day': return years * 365;
      case 'month': return years * 12;
      case 'quarter': return years * 4;
      case 'year': return years;
      default: return years * 12;
    }
  }, [startYear, endYear, granularity]);
  
  // Convert date to step index
  const dateToStep = useCallback((date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    switch (granularity) {
      case 'day':
        const startDate = new Date(startYear, 0, 1);
        return Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      case 'month':
        return (year - startYear) * 12 + month;
      case 'quarter':
        return (year - startYear) * 4 + Math.floor(month / 3);
      case 'year':
        return year - startYear;
      default:
        return (year - startYear) * 12 + month;
    }
  }, [startYear, granularity]);
  
  // Convert step index to date
  const stepToDate = useCallback((step: number): Date => {
    switch (granularity) {
      case 'day':
        const startDate = new Date(startYear, 0, 1);
        return new Date(startDate.getTime() + step * 24 * 60 * 60 * 1000);
      case 'month':
        const monthYear = startYear + Math.floor(step / 12);
        const monthIndex = step % 12;
        return new Date(monthYear, monthIndex, 1);
      case 'quarter':
        const qYear = startYear + Math.floor(step / 4);
        const qMonth = (step % 4) * 3;
        return new Date(qYear, qMonth, 1);
      case 'year':
        return new Date(startYear + step, 0, 1);
      default:
        const mYear = startYear + Math.floor(step / 12);
        const mIndex = step % 12;
        return new Date(mYear, mIndex, 1);
    }
  }, [startYear, granularity]);
  
  const currentStep = dateToStep(currentDate);
  const totalSteps = getStepCount();
  
  // Format date for display
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {};
    switch (granularity) {
      case 'day':
        options.year = 'numeric';
        options.month = 'short';
        options.day = 'numeric';
        break;
      case 'month':
        options.year = 'numeric';
        options.month = 'long';
        break;
      case 'quarter':
        const q = Math.floor(date.getMonth() / 3) + 1;
        return language === 'ar' 
          ? `الربع ${q} ${date.getFullYear()}`
          : `Q${q} ${date.getFullYear()}`;
      case 'year':
        options.year = 'numeric';
        break;
    }
    return date.toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US', options);
  };
  
  // Navigation handlers
  const goToStart = () => onDateChange(stepToDate(0));
  const goToEnd = () => onDateChange(stepToDate(totalSteps - 1));
  const goBack = () => {
    const newStep = Math.max(0, currentStep - 1);
    onDateChange(stepToDate(newStep));
  };
  const goForward = () => {
    const newStep = Math.min(totalSteps - 1, currentStep + 1);
    onDateChange(stepToDate(newStep));
  };
  
  // Playback control
  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // Note: Playback requires external state management
      // This is a simplified version that advances one step
      const newStep = Math.min(totalSteps - 1, currentStep + 1);
      onDateChange(stepToDate(newStep));
    }
  };
  
  // Key events for timeline
  const keyEvents = [
    { year: 2011, label: { en: 'Arab Spring', ar: 'الربيع العربي' } },
    { year: 2014, label: { en: 'Houthi Takeover', ar: 'سيطرة الحوثيين' } },
    { year: 2015, label: { en: 'Coalition Intervention', ar: 'تدخل التحالف' } },
    { year: 2016, label: { en: 'CBY Split', ar: 'انقسام البنك المركزي' } },
    { year: 2018, label: { en: 'Hodeidah Agreement', ar: 'اتفاق الحديدة' } },
    { year: 2020, label: { en: 'COVID-19', ar: 'كوفيد-19' } },
    { year: 2022, label: { en: 'Truce', ar: 'الهدنة' } },
  ];
  
  return (
    <div className={`bg-card border rounded-lg p-4 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">
            {language === 'ar' ? 'السفر عبر الزمن' : 'Time Travel'}
          </h3>
        </div>
        <div className="text-lg font-bold text-primary">
          {formatDate(currentDate)}
        </div>
      </div>
      
      {/* Timeline Slider */}
      <div className="relative mb-6">
        {/* Key events markers */}
        <div className="absolute top-0 left-0 right-0 h-2 flex">
          {keyEvents.map((event, idx) => {
            const eventStep = (event.year - startYear) * (granularity === 'year' ? 1 : 12);
            const position = (eventStep / totalSteps) * 100;
            return (
              <div
                key={idx}
                className="absolute w-1 h-3 bg-accent rounded-full transform -translate-x-1/2 cursor-pointer group"
                style={{ left: `${position}%` }}
                title={event.label[language]}
              >
                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs bg-popover text-popover-foreground px-2 py-1 rounded shadow-lg">
                  {event.label[language]}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Slider */}
        <Slider
          value={[currentStep]}
          min={0}
          max={totalSteps - 1}
          step={1}
          onValueChange={(value) => onDateChange(stepToDate(value[0]))}
          className="mt-4"
        />
        
        {/* Year labels */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{startYear}</span>
          <span>{Math.floor((startYear + endYear) / 2)}</span>
          <span>{endYear}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={goToStart} title={language === 'ar' ? 'البداية' : 'Start'}>
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={goBack} title={language === 'ar' ? 'السابق' : 'Previous'}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {showPlayback && (
          <Button 
            variant={isPlaying ? 'default' : 'outline'} 
            size="icon" 
            onClick={togglePlayback}
            title={isPlaying ? (language === 'ar' ? 'إيقاف' : 'Pause') : (language === 'ar' ? 'تشغيل' : 'Play')}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={goForward} title={language === 'ar' ? 'التالي' : 'Next'}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={goToEnd} title={language === 'ar' ? 'النهاية' : 'End'}>
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Quick Jump Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {keyEvents.map((event, idx) => (
          <Button
            key={idx}
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => onDateChange(new Date(event.year, 0, 1))}
          >
            {event.label[language]} ({event.year})
          </Button>
        ))}
      </div>
    </div>
  );
}

// Date Range Selector Component
interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onRangeChange,
  minYear = 2010,
  maxYear = new Date().getFullYear(),
  className = ''
}: DateRangeSelectorProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i);
  
  const monthNames = language === 'ar' 
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const handleStartChange = (year: number, month: number) => {
    const newStart = new Date(year, month, 1);
    if (newStart <= endDate) {
      onRangeChange(newStart, endDate);
    }
  };
  
  const handleEndChange = (year: number, month: number) => {
    const newEnd = new Date(year, month + 1, 0); // Last day of month
    if (newEnd >= startDate) {
      onRangeChange(startDate, newEnd);
    }
  };
  
  // Preset ranges
  const presets = [
    { label: { en: 'Last Year', ar: 'السنة الماضية' }, months: 12 },
    { label: { en: 'Last 3 Years', ar: 'آخر 3 سنوات' }, months: 36 },
    { label: { en: 'Last 5 Years', ar: 'آخر 5 سنوات' }, months: 60 },
    { label: { en: 'Since Conflict', ar: 'منذ النزاع' }, year: 2015 },
    { label: { en: 'All Time', ar: 'كل الوقت' }, year: minYear },
  ];
  
  const applyPreset = (preset: typeof presets[0]) => {
    const end = new Date();
    let start: Date;
    
    if ('months' in preset && preset.months) {
      start = new Date();
      start.setMonth(start.getMonth() - preset.months);
    } else if ('year' in preset && preset.year) {
      start = new Date(preset.year, 0, 1);
    } else {
      start = new Date(minYear, 0, 1);
    }
    
    onRangeChange(start, end);
  };
  
  return (
    <div className={`bg-card border rounded-lg p-4 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">
          {language === 'ar' ? 'نطاق التاريخ' : 'Date Range'}
        </h3>
      </div>
      
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={() => applyPreset(preset)}
          >
            {preset.label[language]}
          </Button>
        ))}
      </div>
      
      {/* Custom Range Selectors */}
      <div className="grid grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            {language === 'ar' ? 'من' : 'From'}
          </label>
          <div className="flex gap-2">
            <select
              value={startDate.getMonth()}
              onChange={(e) => handleStartChange(startDate.getFullYear(), parseInt(e.target.value))}
              className="flex-1 px-2 py-1 border rounded text-sm bg-background"
            >
              {months.map(m => (
                <option key={m} value={m}>{monthNames[m]}</option>
              ))}
            </select>
            <select
              value={startDate.getFullYear()}
              onChange={(e) => handleStartChange(parseInt(e.target.value), startDate.getMonth())}
              className="flex-1 px-2 py-1 border rounded text-sm bg-background"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* End Date */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            {language === 'ar' ? 'إلى' : 'To'}
          </label>
          <div className="flex gap-2">
            <select
              value={endDate.getMonth()}
              onChange={(e) => handleEndChange(endDate.getFullYear(), parseInt(e.target.value))}
              className="flex-1 px-2 py-1 border rounded text-sm bg-background"
            >
              {months.map(m => (
                <option key={m} value={m}>{monthNames[m]}</option>
              ))}
            </select>
            <select
              value={endDate.getFullYear()}
              onChange={(e) => handleEndChange(parseInt(e.target.value), endDate.getMonth())}
              className="flex-1 px-2 py-1 border rounded text-sm bg-background"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Range Summary */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {language === 'ar' 
          ? `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))} شهر`
          : `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))} months`
        }
      </div>
    </div>
  );
}

export default TimeTravel;
