/**
 * YETO Platform - Vintage Timeline Component
 * Section 8D: Visual display of data version history and revisions
 */

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfidenceRating } from './ConfidenceRating';

interface VintageRecord {
  id: number;
  dataPointId: number;
  dataPointType: string;
  vintageDate: Date;
  value: number;
  previousValue?: number;
  changeType: 'initial' | 'revision' | 'correction' | 'restatement';
  changeReason?: string;
  changeMagnitude?: number;
  sourceId?: number;
  sourceName?: string;
  confidenceRating?: 'A' | 'B' | 'C' | 'D';
  createdBy: string;
  createdAt: Date;
}

interface VintageTimelineProps {
  vintages: VintageRecord[];
  language?: 'en' | 'ar';
  onSelectVintage?: (id: number) => void;
  className?: string;
}

const CHANGE_TYPE_CONFIG = {
  initial: {
    label: { en: 'Initial Value', ar: 'القيمة الأولية' },
    color: '#1a6b9c',
    bgColor: '#e6f0f7',
    icon: '📊',
  },
  revision: {
    label: { en: 'Revision', ar: 'مراجعة' },
    color: '#d97706',
    bgColor: '#fff3e6',
    icon: '🔄',
  },
  correction: {
    label: { en: 'Correction', ar: 'تصحيح' },
    color: '#c53030',
    bgColor: '#fde8e8',
    icon: '✏️',
  },
  restatement: {
    label: { en: 'Restatement', ar: 'إعادة بيان' },
    color: '#7c3aed',
    bgColor: '#f3e8ff',
    icon: '📝',
  },
};

export function VintageTimeline({
  vintages,
  language = 'en',
  onSelectVintage,
  className,
}: VintageTimelineProps) {
  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(2);
  };
  
  const formatChange = (magnitude: number | undefined) => {
    if (magnitude === undefined) return null;
    const sign = magnitude >= 0 ? '+' : '';
    return `${sign}${magnitude.toFixed(2)}%`;
  };
  
  if (vintages.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <p className="text-sm">
          {language === 'ar' ? 'لا يوجد سجل إصدارات' : 'No version history available'}
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      {/* Timeline items */}
      <div className="space-y-4">
        {vintages.map((vintage, index) => {
          const config = CHANGE_TYPE_CONFIG[vintage.changeType];
          const isLatest = index === 0;
          
          return (
            <div
              key={vintage.id}
              className={cn(
                'relative pl-10 cursor-pointer transition-opacity',
                onSelectVintage && 'hover:opacity-80'
              )}
              onClick={() => onSelectVintage?.(vintage.id)}
            >
              {/* Timeline dot */}
              <div
                className={cn(
                  'absolute left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs',
                  isLatest && 'ring-2 ring-offset-2'
                )}
                style={{
                  backgroundColor: config.bgColor,
                  color: config.color,
                  // Ring color handled by Tailwind classes
                }}
              >
                {config.icon}
              </div>
              
              {/* Content card */}
              <div
                className={cn(
                  'p-4 rounded-lg border',
                  isLatest ? 'bg-white shadow-sm' : 'bg-gray-50'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge
                      variant="outline"
                      className="mb-1"
                      style={{
                        backgroundColor: config.bgColor,
                        color: config.color,
                        borderColor: config.color,
                      }}
                    >
                      {config.label[language]}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {new Date(vintage.vintageDate).toLocaleDateString()}
                    </p>
                  </div>
                  {vintage.confidenceRating && (
                    <ConfidenceRating
                      rating={vintage.confidenceRating}
                      size="sm"
                      language={language}
                    />
                  )}
                </div>
                
                {/* Value display */}
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatValue(vintage.value)}
                  </span>
                  {vintage.changeMagnitude !== undefined && vintage.changeType !== 'initial' && (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        vintage.changeMagnitude >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {formatChange(vintage.changeMagnitude)}
                    </span>
                  )}
                </div>
                
                {/* Previous value */}
                {vintage.previousValue !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'القيمة السابقة: ' : 'Previous: '}
                    {formatValue(vintage.previousValue)}
                  </p>
                )}
                
                {/* Change reason */}
                {vintage.changeReason && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    "{vintage.changeReason}"
                  </p>
                )}
                
                {/* Metadata */}
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  {vintage.sourceName && (
                    <span>{vintage.sourceName}</span>
                  )}
                  <span>•</span>
                  <span>{vintage.createdBy}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Revision summary card
interface RevisionSummaryProps {
  summary: {
    totalRevisions: number;
    initialValue: number;
    currentValue: number;
    totalChange: number;
    totalChangePercent: number;
    revisionTypes: Record<string, number>;
    lastRevisionDate: Date | null;
  };
  language?: 'en' | 'ar';
  className?: string;
}

export function RevisionSummary({
  summary,
  language = 'en',
  className,
}: RevisionSummaryProps) {
  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(2);
  };
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {language === 'ar' ? 'ملخص المراجعات' : 'Revision Summary'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">
              {language === 'ar' ? 'القيمة الأولية' : 'Initial Value'}
            </p>
            <p className="text-lg font-bold">{formatValue(summary.initialValue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">
              {language === 'ar' ? 'القيمة الحالية' : 'Current Value'}
            </p>
            <p className="text-lg font-bold">{formatValue(summary.currentValue)}</p>
          </div>
        </div>
        
        {/* Total change */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {language === 'ar' ? 'إجمالي التغيير' : 'Total Change'}
            </span>
            <div className="text-right">
              <span
                className={cn(
                  'text-lg font-bold',
                  summary.totalChange >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {summary.totalChange >= 0 ? '+' : ''}{formatValue(summary.totalChange)}
              </span>
              <span
                className={cn(
                  'text-sm ml-2',
                  summary.totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                ({summary.totalChangePercent >= 0 ? '+' : ''}{summary.totalChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        
        {/* Revision type breakdown */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">
            {language === 'ar' ? 'أنواع المراجعات' : 'Revision Types'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(summary.revisionTypes).map(([type, count]) => {
              const config = CHANGE_TYPE_CONFIG[type as keyof typeof CHANGE_TYPE_CONFIG];
              if (!config || count === 0) return null;
              
              return (
                <div
                  key={type}
                  className="flex items-center gap-2 p-2 rounded-lg"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <span>{config.icon}</span>
                  <span className="text-sm" style={{ color: config.color }}>
                    {config.label[language]}
                  </span>
                  <span className="ml-auto font-medium" style={{ color: config.color }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Last revision */}
        {summary.lastRevisionDate && (
          <p className="text-xs text-gray-400 mt-4">
            {language === 'ar' ? 'آخر مراجعة: ' : 'Last revision: '}
            {new Date(summary.lastRevisionDate).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Version diff viewer
interface VersionDiffProps {
  diff: {
    vintageDate1: Date;
    vintageDate2: Date;
    value1: number;
    value2: number;
    absoluteChange: number;
    percentChange: number;
    changeType: string;
    changeReason?: string;
  };
  language?: 'en' | 'ar';
  className?: string;
}

export function VersionDiff({
  diff,
  language = 'en',
  className,
}: VersionDiffProps) {
  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(2);
  };
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {language === 'ar' ? 'مقارنة الإصدارات' : 'Version Comparison'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          {/* Version 1 */}
          <div className="flex-1 text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">
              {new Date(diff.vintageDate1).toLocaleDateString()}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatValue(diff.value1)}
            </p>
          </div>
          
          {/* Arrow and change */}
          <div className="flex flex-col items-center">
            <span className="text-2xl text-gray-400">→</span>
            <span
              className={cn(
                'text-sm font-medium',
                diff.percentChange >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {diff.percentChange >= 0 ? '+' : ''}{diff.percentChange.toFixed(2)}%
            </span>
          </div>
          
          {/* Version 2 */}
          <div className="flex-1 text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">
              {new Date(diff.vintageDate2).toLocaleDateString()}
            </p>
            <p className="text-2xl font-bold text-blue-900">
              {formatValue(diff.value2)}
            </p>
          </div>
        </div>
        
        {diff.changeReason && (
          <p className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg italic">
            "{diff.changeReason}"
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default VintageTimeline;
