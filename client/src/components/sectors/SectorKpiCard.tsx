/**
 * SectorKpiCard - Individual KPI card with evidence linking
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SectorKpiCardProps {
  titleEn: string;
  titleAr: string;
  value: number | string | null;
  change?: number | null;
  confidence?: string;
  source?: string;
  lastUpdated?: string;
  isArabic: boolean;
}

export function SectorKpiCard({
  titleEn,
  titleAr,
  value,
  change,
  confidence = 'B',
  source,
  lastUpdated,
  isArabic
}: SectorKpiCardProps) {
  const formatValue = (val: number | string | null) => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'string') return val;
    if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toFixed(1);
  };

  const getConfidenceBadge = (conf: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'B': 'bg-[#DADED8] text-[#2C3424] dark:bg-blue-900 dark:text-blue-200',
      'C': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'D': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[conf] || colors['B'];
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground line-clamp-2">
            {isArabic ? titleAr : titleEn}
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge className={`text-xs ${getConfidenceBadge(confidence)}`}>
                  {confidence}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p className="font-semibold mb-1">
                    {isArabic ? 'درجة الثقة' : 'Confidence Grade'}: {confidence}
                  </p>
                  {source && (
                    <p>{isArabic ? 'المصدر:' : 'Source:'} {source}</p>
                  )}
                  {lastUpdated && (
                    <p>{isArabic ? 'آخر تحديث:' : 'Last updated:'} {new Date(lastUpdated).toLocaleDateString()}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <p className="text-2xl font-bold mb-2">
          {formatValue(value)}
        </p>
        
        {change !== null && change !== undefined && (
          <div className="flex items-center gap-1">
            {change > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : change < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-gray-500" />
            )}
            <span className={`text-sm font-medium ${
              change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SectorKpiCard;
