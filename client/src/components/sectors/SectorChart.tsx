/**
 * SectorChart - Time series charts for sector data
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BarChart3 } from "lucide-react";

interface SectorChartProps {
  sectorCode: string;
  primaryIndicator: any;
  secondaryIndicators: any[];
  isArabic: boolean;
  regime: 'both' | 'aden_irg' | 'sanaa_dfa';
}

export function SectorChart({ sectorCode, primaryIndicator, secondaryIndicators, isArabic, regime }: SectorChartProps) {
  const { data: timeSeriesData, isLoading } = trpc.sectorPages.getSectorTimeSeries.useQuery({
    sectorCode,
    regime,
    startYear: 2015,
    endYear: 2026
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {isArabic ? 'الاتجاهات الأساسية' : 'Core Trends'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {primaryIndicator ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">
                  {isArabic ? primaryIndicator.nameAr : primaryIndicator.nameEn}
                </h4>
                <p className="text-3xl font-bold text-primary">
                  {primaryIndicator.currentValue?.toLocaleString() || '-'}
                </p>
                {primaryIndicator.changePercent && (
                  <p className={`text-sm ${primaryIndicator.changePercent > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {primaryIndicator.changePercent > 0 ? '+' : ''}{primaryIndicator.changePercent.toFixed(1)}%
                  </p>
                )}
              </div>
              
              {/* Simple bar representation of time series */}
              {timeSeriesData?.data && timeSeriesData.data.length > 0 && (
                <div className="h-48 flex items-end gap-1">
                  {timeSeriesData.data.slice(-20).map((point: any, index: number) => {
                    const maxValue = Math.max(...timeSeriesData.data.slice(-20).map((p: any) => p.value || 0));
                    const height = maxValue > 0 ? ((point.value || 0) / maxValue) * 100 : 0;
                    return (
                      <div
                        key={index}
                        className="flex-1 bg-primary/60 hover:bg-primary transition-colors rounded-t"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${point.date}: ${point.value}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 opacity-50" />
              <p className="ml-4">{isArabic ? 'لا توجد بيانات متاحة' : 'No data available'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary Charts */}
      {secondaryIndicators && secondaryIndicators.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {secondaryIndicators.map((indicator: any, index: number) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {isArabic ? indicator.nameAr : indicator.nameEn}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {indicator.currentValue?.toLocaleString() || '-'}
                </p>
                {indicator.changePercent && (
                  <p className={`text-sm ${indicator.changePercent > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {indicator.changePercent > 0 ? '+' : ''}{indicator.changePercent.toFixed(1)}%
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {isArabic ? 'المصدر:' : 'Source:'} {indicator.sourceName || 'Unknown'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default SectorChart;
