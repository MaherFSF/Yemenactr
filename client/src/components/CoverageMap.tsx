/**
 * Coverage Map Component
 * 
 * Visualizes data coverage across years and sectors as a heatmap.
 * Shows gaps and allows drilling down into specific cells.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, Target, XCircle } from 'lucide-react';

interface CoverageCell {
  year: number;
  sector: string;
  governorate: string;
  coverageScore: number;
  claimCount: number;
  sourceCount: number;
  lastUpdated?: string;
  gaps?: string[];
}

interface CoverageMapProps {
  data: CoverageCell[];
  years?: number[];
  sectors?: string[];
  onCellClick?: (cell: CoverageCell) => void;
  className?: string;
}

// Sector display names
const SECTOR_LABELS: Record<string, { en: string; ar: string }> = {
  banking: { en: 'Banking', ar: 'المصارف' },
  trade: { en: 'Trade', ar: 'التجارة' },
  poverty: { en: 'Poverty', ar: 'الفقر' },
  macroeconomy: { en: 'Macroeconomy', ar: 'الاقتصاد الكلي' },
  prices: { en: 'Prices', ar: 'الأسعار' },
  currency: { en: 'Currency', ar: 'العملة' },
  public_finance: { en: 'Public Finance', ar: 'المالية العامة' },
  energy: { en: 'Energy', ar: 'الطاقة' },
  food_security: { en: 'Food Security', ar: 'الأمن الغذائي' },
  aid_flows: { en: 'Aid Flows', ar: 'تدفقات المساعدات' },
  labor_market: { en: 'Labor Market', ar: 'سوق العمل' },
  conflict_economy: { en: 'Conflict Economy', ar: 'اقتصاد الصراع' },
  infrastructure: { en: 'Infrastructure', ar: 'البنية التحتية' },
  agriculture: { en: 'Agriculture', ar: 'الزراعة' },
  investment: { en: 'Investment', ar: 'الاستثمار' },
  remittances: { en: 'Remittances', ar: 'التحويلات' },
  sanctions: { en: 'Sanctions', ar: 'العقوبات' },
  humanitarian: { en: 'Humanitarian', ar: 'الإنساني' },
};

// Coverage score to color
function getCoverageColor(score: number): string {
  if (score >= 0.8) return 'bg-emerald-500';
  if (score >= 0.6) return 'bg-emerald-400';
  if (score >= 0.4) return 'bg-amber-400';
  if (score >= 0.2) return 'bg-orange-400';
  if (score > 0) return 'bg-red-400';
  return 'bg-gray-300 dark:bg-gray-700';
}

function getCoverageGrade(score: number): { grade: string; label: string } {
  if (score >= 0.8) return { grade: 'A', label: 'Excellent' };
  if (score >= 0.6) return { grade: 'B', label: 'Good' };
  if (score >= 0.4) return { grade: 'C', label: 'Fair' };
  if (score >= 0.2) return { grade: 'D', label: 'Poor' };
  return { grade: 'F', label: 'Critical' };
}

export function CoverageMap({ 
  data, 
  years: propYears, 
  sectors: propSectors,
  onCellClick,
  className 
}: CoverageMapProps) {
  const { language } = useLanguage();
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('national');
  const [hoveredCell, setHoveredCell] = useState<CoverageCell | null>(null);

  // Extract unique years and sectors from data
  const years = useMemo(() => {
    if (propYears) return propYears;
    const uniqueYears = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
    return uniqueYears.length > 0 ? uniqueYears : Array.from({ length: 16 }, (_, i) => 2010 + i);
  }, [data, propYears]);

  const sectors = useMemo(() => {
    if (propSectors) return propSectors;
    return Array.from(new Set(data.map(d => d.sector)));
  }, [data, propSectors]);

  // Build lookup map
  const cellMap = useMemo(() => {
    const map = new Map<string, CoverageCell>();
    for (const cell of data) {
      const key = `${cell.year}-${cell.sector}-${cell.governorate}`;
      map.set(key, cell);
    }
    return map;
  }, [data]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const filteredCells = data.filter(c => c.governorate === selectedGovernorate);
    const total = filteredCells.length;
    const covered = filteredCells.filter(c => c.coverageScore >= 0.3).length;
    const avgScore = total > 0 
      ? filteredCells.reduce((sum, c) => sum + c.coverageScore, 0) / total 
      : 0;
    const gaps = filteredCells.filter(c => c.coverageScore < 0.3).length;
    const critical = filteredCells.filter(c => c.coverageScore < 0.1).length;
    
    return { total, covered, avgScore, gaps, critical };
  }, [data, selectedGovernorate]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {language === 'ar' ? 'خريطة التغطية' : 'Coverage Map'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'تغطية البيانات حسب السنة والقطاع'
                : 'Data coverage by year and sector'
              }
            </CardDescription>
          </div>
          <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="national">
                {language === 'ar' ? 'المستوى الوطني' : 'National Level'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{(stats.avgScore * 100).toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">
              {language === 'ar' ? 'متوسط التغطية' : 'Avg Coverage'}
            </div>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{stats.covered}</div>
            <div className="text-xs text-muted-foreground">
              {language === 'ar' ? 'خلايا مغطاة' : 'Covered Cells'}
            </div>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{stats.gaps}</div>
            <div className="text-xs text-muted-foreground">
              {language === 'ar' ? 'فجوات' : 'Gaps'}
            </div>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-xs text-muted-foreground">
              {language === 'ar' ? 'حرجة' : 'Critical'}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-sm font-medium sticky left-0 bg-background z-10">
                    {language === 'ar' ? 'القطاع' : 'Sector'}
                  </th>
                  {years.map(year => (
                    <th key={year} className="p-1 text-center text-xs font-medium min-w-[40px]">
                      {year.toString().slice(-2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sectors.map(sector => (
                  <tr key={sector}>
                    <td className="p-2 text-sm font-medium sticky left-0 bg-background z-10 whitespace-nowrap">
                      {SECTOR_LABELS[sector]?.[language] || sector}
                    </td>
                    {years.map(year => {
                      const key = `${year}-${sector}-${selectedGovernorate}`;
                      const cell = cellMap.get(key);
                      const score = cell?.coverageScore || 0;
                      const { grade, label } = getCoverageGrade(score);

                      return (
                        <td key={year} className="p-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className={cn(
                                  'w-full h-8 rounded-sm transition-all',
                                  getCoverageColor(score),
                                  'hover:ring-2 hover:ring-primary hover:ring-offset-1',
                                  onCellClick && 'cursor-pointer'
                                )}
                                onClick={() => cell && onCellClick?.(cell)}
                                onMouseEnter={() => cell && setHoveredCell(cell)}
                                onMouseLeave={() => setHoveredCell(null)}
                              >
                                <span className="text-[10px] font-bold text-white drop-shadow">
                                  {score > 0 ? grade : '—'}
                                </span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-1">
                                <div className="font-semibold">
                                  {SECTOR_LABELS[sector]?.[language] || sector} ({year})
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={cn('text-xs', getCoverageColor(score))}>
                                    {(score * 100).toFixed(0)}% - {label}
                                  </Badge>
                                </div>
                                {cell && (
                                  <>
                                    <div className="text-xs">
                                      {language === 'ar' ? 'المطالبات:' : 'Claims:'} {cell.claimCount}
                                    </div>
                                    <div className="text-xs">
                                      {language === 'ar' ? 'المصادر:' : 'Sources:'} {cell.sourceCount}
                                    </div>
                                    {cell.gaps && cell.gaps.length > 0 && (
                                      <div className="text-xs text-amber-500">
                                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                                        {cell.gaps.join(', ')}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span>{language === 'ar' ? 'ممتاز' : 'Excellent'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-emerald-400" />
            <span>{language === 'ar' ? 'جيد' : 'Good'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-amber-400" />
            <span>{language === 'ar' ? 'مقبول' : 'Fair'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-orange-400" />
            <span>{language === 'ar' ? 'ضعيف' : 'Poor'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-red-400" />
            <span>{language === 'ar' ? 'حرج' : 'Critical'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-700" />
            <span>{language === 'ar' ? 'لا بيانات' : 'No Data'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CoverageMap;
