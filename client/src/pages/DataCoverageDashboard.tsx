/**
 * Data Coverage Dashboard
 * Shows data completeness across sectors, identifies gaps, and triggers backfill
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Database,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Loader2,
  Download,
  Layers,
  Calendar,
  Zap,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const SECTOR_LABELS: Record<string, { en: string; ar: string }> = {
  macroeconomy: { en: 'Macroeconomy', ar: 'الاقتصاد الكلي' },
  banking: { en: 'Banking & Finance', ar: 'البنوك والمالية' },
  trade: { en: 'Trade', ar: 'التجارة' },
  prices: { en: 'Prices & Inflation', ar: 'الأسعار والتضخم' },
  labor: { en: 'Labor Market', ar: 'سوق العمل' },
  energy: { en: 'Energy', ar: 'الطاقة' },
  food_security: { en: 'Food Security', ar: 'الأمن الغذائي' },
  humanitarian: { en: 'Humanitarian', ar: 'الإنساني' },
  poverty: { en: 'Poverty', ar: 'الفقر' },
  currency: { en: 'Currency', ar: 'العملة' },
  public_finance: { en: 'Public Finance', ar: 'المالية العامة' },
  infrastructure: { en: 'Infrastructure', ar: 'البنية التحتية' },
  agriculture: { en: 'Agriculture', ar: 'الزراعة' },
};

export default function DataCoverageDashboard() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [isBackfilling, setIsBackfilling] = useState<string | null>(null);

  // Fetch data
  const { data: coverage, isLoading: loadingCoverage } = trpc.dataCoverage.getSectorCoverage.useQuery();
  const { data: gaps, isLoading: loadingGaps } = trpc.dataCoverage.getIndicatorGaps.useQuery({
    sector: selectedSector === 'all' ? undefined : selectedSector,
    limit: 50,
  });
  const { data: sourceStats } = trpc.dataCoverage.getSourceStats.useQuery();
  const { data: heatmap } = trpc.dataCoverage.getYearHeatmap.useQuery();
  const triggerBackfill = trpc.dataCoverage.triggerBackfill.useMutation();

  const handleBackfill = async (source: 'worldbank' | 'imf') => {
    setIsBackfilling(source);
    try {
      const result = await triggerBackfill.mutateAsync({ source, sector: selectedSector === 'all' ? undefined : selectedSector });
      if (result.success) {
        toast.success(`${source === 'worldbank' ? 'World Bank' : 'IMF'} backfill complete: ${(result as any).totalInserted || 0} new records`);
      } else {
        toast.error(`Backfill failed: ${(result as any).error}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Backfill failed');
    } finally {
      setIsBackfilling(null);
    }
  };

  // Build heatmap grid
  const years = Array.from({ length: 16 }, (_, i) => 2010 + i);
  const heatmapBySector = useMemo(() => {
    if (!heatmap) return {};
    const map: Record<string, Record<number, { indicators: number; points: number }>> = {};
    for (const row of heatmap) {
      if (!map[row.sector]) map[row.sector] = {};
      map[row.sector][row.year] = { indicators: row.indicatorCount, points: row.dataPoints };
    }
    return map;
  }, [heatmap]);

  const getHeatColor = (points: number) => {
    if (points === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (points < 5) return 'bg-red-200 dark:bg-red-900/40';
    if (points < 15) return 'bg-yellow-200 dark:bg-yellow-900/40';
    if (points < 30) return 'bg-green-200 dark:bg-green-900/40';
    return 'bg-green-400 dark:bg-green-700/60';
  };

  const getCoverageIcon = (pct: number) => {
    if (pct >= 75) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (pct >= 40) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  if (loadingCoverage) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3424] dark:text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-[#C9A961]" />
            {isArabic ? 'لوحة تغطية البيانات' : 'Data Coverage Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isArabic
              ? 'مراقبة اكتمال البيانات وتحديد الفجوات وتشغيل عمليات الملء التلقائي'
              : 'Monitor data completeness, identify gaps, and trigger automatic backfill'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleBackfill('worldbank')}
            disabled={isBackfilling !== null}
          >
            {isBackfilling === 'worldbank' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {isArabic ? 'تحديث البنك الدولي' : 'Backfill World Bank'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBackfill('imf')}
            disabled={isBackfilling !== null}
          >
            {isBackfilling === 'imf' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            {isArabic ? 'تحديث صندوق النقد' : 'Backfill IMF'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {coverage?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Layers className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coverage.summary.totalIndicators}</p>
                  <p className="text-xs text-gray-500">{isArabic ? 'إجمالي المؤشرات' : 'Total Indicators'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Database className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coverage.summary.totalDataPoints.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{isArabic ? 'نقاط البيانات' : 'Data Points'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#C9A961]/20">
                  <TrendingUp className="w-5 h-5 text-[#C9A961]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coverage.summary.avgCoverage}%</p>
                  <p className="text-xs text-gray-500">{isArabic ? 'متوسط التغطية' : 'Avg Coverage'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coverage.summary.gapCount}</p>
                  <p className="text-xs text-gray-500">{isArabic ? 'سنوات الفجوة' : 'Gap Years'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sector Coverage Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#C9A961]" />
            {isArabic ? 'تغطية القطاعات' : 'Sector Coverage'}
          </CardTitle>
          <CardDescription>
            {isArabic ? 'نسبة اكتمال البيانات لكل قطاع (2010-2025)' : 'Data completeness ratio per sector (2010-2025)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? 'القطاع' : 'Sector'}</TableHead>
                <TableHead className="text-center">{isArabic ? 'المؤشرات' : 'Indicators'}</TableHead>
                <TableHead className="text-center">{isArabic ? 'نقاط البيانات' : 'Data Points'}</TableHead>
                <TableHead className="text-center">{isArabic ? 'السنوات' : 'Years'}</TableHead>
                <TableHead>{isArabic ? 'التغطية' : 'Coverage'}</TableHead>
                <TableHead className="text-center">{isArabic ? 'الفجوات' : 'Gaps'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coverage?.sectors.map((sector) => {
                const label = SECTOR_LABELS[sector.sector] || { en: sector.sector, ar: sector.sector };
                return (
                  <TableRow key={sector.sector} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => setSelectedSector(sector.sector)}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getCoverageIcon(sector.coveragePercent)}
                        {isArabic ? label.ar : label.en}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{sector.indicatorCount}</TableCell>
                    <TableCell className="text-center">{sector.dataPoints.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{sector.yearsCovered}/16</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={sector.coveragePercent} className="h-2 flex-1" />
                        <span className="text-xs font-mono w-10 text-right">{sector.coveragePercent}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {sector.gapYears > 0 ? (
                        <Badge variant="destructive" className="text-xs">{sector.gapYears}</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 text-xs">0</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Year Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#C9A961]" />
            {isArabic ? 'خريطة حرارية للبيانات' : 'Data Heatmap'}
          </CardTitle>
          <CardDescription>
            {isArabic ? 'كثافة البيانات حسب القطاع والسنة' : 'Data density by sector and year (darker = more data points)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left p-1 font-medium w-32">{isArabic ? 'القطاع' : 'Sector'}</th>
                  {years.map(y => (
                    <th key={y} className="p-1 text-center font-mono">{String(y).slice(2)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(heatmapBySector).sort().map(sector => {
                  const label = SECTOR_LABELS[sector] || { en: sector, ar: sector };
                  return (
                    <tr key={sector}>
                      <td className="p-1 font-medium truncate max-w-[120px]">{isArabic ? label.ar : label.en}</td>
                      {years.map(y => {
                        const cell = heatmapBySector[sector]?.[y];
                        const points = cell?.points || 0;
                        return (
                          <td key={y} className="p-0.5">
                            <div
                              className={`w-full h-6 rounded-sm ${getHeatColor(points)} flex items-center justify-center`}
                              title={`${sector} ${y}: ${points} data points, ${cell?.indicators || 0} indicators`}
                            >
                              {points > 0 && <span className="text-[9px] font-mono opacity-70">{points}</span>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span>{isArabic ? 'الكثافة:' : 'Density:'}</span>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800" /> 0</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-red-200 dark:bg-red-900/40" /> 1-4</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-900/40" /> 5-14</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-green-200 dark:bg-green-900/40" /> 15-29</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-green-400 dark:bg-green-700/60" /> 30+</div>
          </div>
        </CardContent>
      </Card>

      {/* Indicator Gap Details */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#C9A961]" />
                {isArabic ? 'تفاصيل فجوات المؤشرات' : 'Indicator Gap Details'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'المؤشرات ذات أقل تغطية (يمكن الملء التلقائي)' : 'Indicators with lowest coverage (auto-backfill available)'}
              </CardDescription>
            </div>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={isArabic ? 'كل القطاعات' : 'All Sectors'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? 'كل القطاعات' : 'All Sectors'}</SelectItem>
                {Object.entries(SECTOR_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{isArabic ? label.ar : label.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadingGaps ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? 'المؤشر' : 'Indicator'}</TableHead>
                    <TableHead className="text-center">{isArabic ? 'القطاع' : 'Sector'}</TableHead>
                    <TableHead className="text-center">{isArabic ? 'نقاط' : 'Points'}</TableHead>
                    <TableHead>{isArabic ? 'التغطية' : 'Coverage'}</TableHead>
                    <TableHead>{isArabic ? 'السنوات المفقودة' : 'Missing Years'}</TableHead>
                    <TableHead className="text-center">{isArabic ? 'المصدر' : 'Source'}</TableHead>
                    <TableHead className="text-center">{isArabic ? 'ملء تلقائي' : 'Backfill'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gaps?.map((ind) => {
                    const sectorLabel = SECTOR_LABELS[ind.sector] || { en: ind.sector, ar: ind.sector };
                    return (
                      <TableRow key={ind.code}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{isArabic ? ind.nameAr : ind.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{ind.code}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">{isArabic ? sectorLabel.ar : sectorLabel.en}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono">{ind.dataPoints}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Progress value={ind.coveragePercent} className="h-1.5 flex-1" />
                            <span className="text-xs font-mono w-8">{ind.coveragePercent}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-0.5 max-w-[200px]">
                            {ind.missingYears.slice(0, 8).map(y => (
                              <span key={y} className="text-[10px] px-1 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">{y}</span>
                            ))}
                            {ind.missingYears.length > 8 && (
                              <span className="text-[10px] text-gray-400">+{ind.missingYears.length - 8}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-xs">{ind.source}</TableCell>
                        <TableCell className="text-center">
                          {ind.canBackfill ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {isArabic ? 'متاح' : 'Available'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-gray-400">
                              {isArabic ? 'يدوي' : 'Manual'}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Sources */}
      {sourceStats && sourceStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-[#C9A961]" />
              {isArabic ? 'مصادر البيانات' : 'Data Sources'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sourceStats.map((source) => (
                <div key={source.id} className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="font-semibold text-sm">{source.publisher}</h4>
                  <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <p>{isArabic ? 'المؤشرات' : 'Indicators'}: <span className="font-mono font-bold">{source.indicatorCount}</span></p>
                    <p>{isArabic ? 'نقاط البيانات' : 'Data Points'}: <span className="font-mono font-bold">{source.dataPoints.toLocaleString()}</span></p>
                    {source.latestData && (
                      <p>{isArabic ? 'أحدث بيانات' : 'Latest'}: <span className="font-mono">{new Date(source.latestData).toLocaleDateString()}</span></p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
