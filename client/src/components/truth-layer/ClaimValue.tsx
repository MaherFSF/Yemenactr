/**
 * ClaimValue Component
 * 
 * Renders a data value with its provenance badge and lineage drawer.
 * Every number/value in YETO should be wrapped in this component to ensure
 * full traceability and transparency.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProvenanceBadge, type ConfidenceGrade } from './ProvenanceBadge';
import { LineageDrawer, type LineageStep } from './LineageDrawer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ClaimValueProps {
  /** The value to display */
  value: number | string;
  /** Unit of measurement (e.g., "USD", "YER", "%") */
  unit?: string;
  /** Confidence grade A-D */
  confidenceGrade: ConfidenceGrade;
  /** Claim ID for fetching full details */
  claimId?: string;
  /** Source name for quick reference */
  sourceName?: string;
  /** Source name in Arabic */
  sourceNameAr?: string;
  /** As-of date for the value */
  asOfDate?: Date | string;
  /** Computation lineage steps */
  lineage?: LineageStep[];
  /** Whether to show the lineage drawer on click */
  showLineage?: boolean;
  /** Format options for numbers */
  formatOptions?: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
    compactDisplay?: 'short' | 'long';
  };
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the value is disputed */
  isDisputed?: boolean;
  /** Regime tag for split-system context */
  regimeTag?: 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'unknown';
}

export function ClaimValue({
  value,
  unit,
  confidenceGrade,
  claimId,
  sourceName,
  sourceNameAr,
  asOfDate,
  lineage,
  showLineage = true,
  formatOptions = {},
  className,
  size = 'md',
  isDisputed = false,
  regimeTag,
}: ClaimValueProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { language, isRTL } = useLanguage();

  // Format the value
  const formattedValue = React.useMemo(() => {
    if (typeof value === 'string') return value;
    
    const defaultOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...formatOptions,
    };
    
    return new Intl.NumberFormat(
      language === 'ar' ? 'ar-YE' : 'en-US',
      defaultOptions
    ).format(value);
  }, [value, language, formatOptions]);

  // Format the date
  const formattedDate = React.useMemo(() => {
    if (!asOfDate) return null;
    const date = typeof asOfDate === 'string' ? new Date(asOfDate) : asOfDate;
    return new Intl.DateTimeFormat(
      language === 'ar' ? 'ar-YE' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    ).format(date);
  }, [asOfDate, language]);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl font-semibold',
  };

  // Regime tag labels
  const regimeLabels = {
    aden_irg: { en: 'Aden (IRG)', ar: 'عدن (الحكومة)' },
    sanaa_defacto: { en: "Sana'a (De Facto)", ar: 'صنعاء (الأمر الواقع)' },
    mixed: { en: 'Mixed', ar: 'مختلط' },
    unknown: { en: 'Unknown', ar: 'غير محدد' },
  };

  const handleClick = () => {
    if (showLineage && (lineage || claimId)) {
      setIsDrawerOpen(true);
    }
  };

  return (
    <TooltipProvider>
      <span 
        className={cn(
          'inline-flex items-center gap-1.5',
          showLineage && (lineage || claimId) && 'cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors',
          isDisputed && 'border-b-2 border-dashed border-amber-500',
          sizeClasses[size],
          className
        )}
        onClick={handleClick}
        role={showLineage ? 'button' : undefined}
        tabIndex={showLineage ? 0 : undefined}
        onKeyDown={(e) => {
          if (showLineage && (e.key === 'Enter' || e.key === ' ')) {
            handleClick();
          }
        }}
      >
        {/* Value with unit */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-mono">
              {formattedValue}
              {unit && <span className="text-muted-foreground ml-0.5">{unit}</span>}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1 text-xs">
              {sourceName && (
                <div>
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'المصدر: ' : 'Source: '}
                  </span>
                  <span>{language === 'ar' && sourceNameAr ? sourceNameAr : sourceName}</span>
                </div>
              )}
              {formattedDate && (
                <div>
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'بتاريخ: ' : 'As of: '}
                  </span>
                  <span>{formattedDate}</span>
                </div>
              )}
              {regimeTag && regimeTag !== 'unknown' && (
                <div>
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'النطاق: ' : 'Scope: '}
                  </span>
                  <span>{regimeLabels[regimeTag][language]}</span>
                </div>
              )}
              {isDisputed && (
                <div className="text-amber-600 font-medium">
                  {language === 'ar' ? '⚠️ قيمة متنازع عليها' : '⚠️ Disputed value'}
                </div>
              )}
              {showLineage && (
                <div className="text-primary">
                  {language === 'ar' ? 'انقر لعرض التفاصيل' : 'Click for details'}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Provenance badge */}
        <ProvenanceBadge 
          grade={confidenceGrade} 
          size={size === 'lg' ? 'md' : 'sm'}
          showLabel={false}
        />

        {/* Disputed indicator */}
        {isDisputed && (
          <span className="text-amber-500 text-xs" title={language === 'ar' ? 'متنازع عليه' : 'Disputed'}>
            ⚠️
          </span>
        )}
      </span>

      {/* Lineage drawer */}
      {showLineage && (
        <LineageDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          claimId={claimId}
          value={value}
          unit={unit}
          confidenceGrade={confidenceGrade}
          sourceName={sourceName}
          sourceNameAr={sourceNameAr}
          asOfDate={asOfDate}
          lineage={lineage}
          regimeTag={regimeTag}
          isDisputed={isDisputed}
        />
      )}
    </TooltipProvider>
  );
}

export default ClaimValue;
