/**
 * AsOfDateLens Component
 * Allows users to view data as of any date from 2010 to today
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Calendar as CalendarIcon,
  Clock,
  History,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Play,
  Pause,
  FastForward,
  Rewind,
} from 'lucide-react';
import { format, subDays, subMonths, subYears, addDays, isAfter, isBefore, startOfYear } from 'date-fns';

interface AsOfDateLensProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  showTimeline?: boolean;
  showQuickSelect?: boolean;
  className?: string;
}

// Key events for Yemen economic timeline
const keyEvents = [
  { date: new Date('2011-02-03'), label: 'Arab Spring protests begin' },
  { date: new Date('2014-09-21'), label: 'Houthi takeover of Sana\'a' },
  { date: new Date('2015-03-26'), label: 'Saudi-led coalition intervention' },
  { date: new Date('2016-09-18'), label: 'CBY split (Aden branch established)' },
  { date: new Date('2018-12-13'), label: 'Stockholm Agreement' },
  { date: new Date('2020-03-11'), label: 'COVID-19 pandemic declared' },
  { date: new Date('2022-04-02'), label: 'UN-mediated truce begins' },
  { date: new Date('2023-04-09'), label: 'Saudi-Iran agreement' },
];

export function AsOfDateLens({
  selectedDate,
  onDateChange,
  minDate = new Date('2010-01-01'),
  maxDate = new Date(),
  showTimeline = true,
  showQuickSelect = true,
  className = '',
}: AsOfDateLensProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // months per tick
  
  // Calculate slider position (0-100)
  const totalDays = Math.floor((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDays = Math.floor((selectedDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const sliderValue = Math.round((currentDays / totalDays) * 100);
  
  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const days = Math.round((value[0] / 100) * totalDays);
    const newDate = addDays(minDate, days);
    if (!isAfter(newDate, maxDate) && !isBefore(newDate, minDate)) {
      onDateChange(newDate);
    }
  };
  
  // Playback effect
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      const newDate = addDays(selectedDate, playSpeed * 30); // Approximate month
      if (isAfter(newDate, maxDate)) {
        setIsPlaying(false);
        onDateChange(maxDate);
      } else {
        onDateChange(newDate);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [isPlaying, selectedDate, playSpeed, maxDate, onDateChange]);
  
  // Quick select options
  const quickSelects = [
    { label: 'Today', date: new Date() },
    { label: '1M ago', date: subMonths(new Date(), 1) },
    { label: '3M ago', date: subMonths(new Date(), 3) },
    { label: '6M ago', date: subMonths(new Date(), 6) },
    { label: '1Y ago', date: subYears(new Date(), 1) },
    { label: '2Y ago', date: subYears(new Date(), 2) },
    { label: '5Y ago', date: subYears(new Date(), 5) },
    { label: '2010', date: new Date('2010-01-01') },
  ];
  
  // Find nearest key event
  const nearestEvent = keyEvents.reduce((nearest, event) => {
    const currentDiff = Math.abs(selectedDate.getTime() - event.date.getTime());
    const nearestDiff = nearest ? Math.abs(selectedDate.getTime() - nearest.date.getTime()) : Infinity;
    return currentDiff < nearestDiff ? event : nearest;
  }, null as typeof keyEvents[0] | null);
  
  const isNearEvent = nearestEvent && 
    Math.abs(selectedDate.getTime() - nearestEvent.date.getTime()) < 30 * 24 * 60 * 60 * 1000; // Within 30 days
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main date selector */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              disabled={(date) => isAfter(date, maxDate) || isBefore(date, minDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onDateChange(subMonths(selectedDate, 1))}
                disabled={isBefore(subMonths(selectedDate, 1), minDate)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous month</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onDateChange(addDays(selectedDate, 30))}
                disabled={isAfter(addDays(selectedDate, 30), maxDate)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next month</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onDateChange(new Date())}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to today</TooltipContent>
          </Tooltip>
        </div>
        
        {/* Event indicator */}
        {isNearEvent && nearestEvent && (
          <Badge variant="outline" className="text-xs">
            <History className="h-3 w-3 mr-1" />
            {nearestEvent.label}
          </Badge>
        )}
      </div>
      
      {/* Quick select buttons */}
      {showQuickSelect && (
        <div className="flex flex-wrap gap-1">
          {quickSelects.map((qs) => (
            <Button
              key={qs.label}
              variant={format(selectedDate, 'yyyy-MM-dd') === format(qs.date, 'yyyy-MM-dd') ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => onDateChange(qs.date)}
            >
              {qs.label}
            </Button>
          ))}
        </div>
      )}
      
      {/* Timeline slider */}
      {showTimeline && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {/* Playback controls */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => {
                      setPlaySpeed(Math.max(1, playSpeed - 1));
                    }}
                  >
                    <Rewind className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Slower</TooltipContent>
              </Tooltip>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => {
                      setPlaySpeed(Math.min(12, playSpeed + 1));
                    }}
                  >
                    <FastForward className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Faster ({playSpeed}x)</TooltipContent>
              </Tooltip>
            </div>
            
            {/* Slider */}
            <div className="flex-1 relative">
              <Slider
                value={[sliderValue]}
                onValueChange={handleSliderChange}
                max={100}
                step={1}
                className="w-full"
              />
              
              {/* Event markers */}
              <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                {keyEvents.map((event, i) => {
                  const eventDays = Math.floor((event.date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
                  const position = (eventDays / totalDays) * 100;
                  if (position < 0 || position > 100) return null;
                  
                  return (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-primary/50 rounded-full cursor-pointer pointer-events-auto"
                          style={{ left: `${position}%` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{event.label}</p>
                        <p className="text-xs text-muted-foreground">{format(event.date, 'PPP')}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Year labels */}
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>2010</span>
            <span>2015</span>
            <span>2020</span>
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for inline use
export function AsOfDateBadge({
  date,
  onClick,
}: {
  date: Date;
  onClick?: () => void;
}) {
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  
  return (
    <Badge 
      variant={isToday ? 'default' : 'secondary'}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Clock className="h-3 w-3 mr-1" />
      {isToday ? 'Live' : `As of ${format(date, 'MMM d, yyyy')}`}
    </Badge>
  );
}

export default AsOfDateLens;
