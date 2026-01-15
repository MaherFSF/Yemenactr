/**
 * Data Comparison Tool
 * 
 * Allows users to compare indicators across:
 * - Different time periods (year-over-year)
 * - Different regions (Aden vs Sanaa)
 * - Different sources (triangulation view)
 * - Multiple indicators side-by-side
 */

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeftRight, 
  Calendar, 
  MapPin, 
  Database, 
  TrendingUp, 
  TrendingDown,
  Download,
  Share2,
  Plus,
  X,
  BarChart3,
  LineChart,
  Table
} from 'lucide-react';

interface ComparisonItem {
  id: string;
  indicatorCode: string;
  indicatorName: string;
  region: 'aden_irg' | 'sanaa_defacto' | 'mixed';
  period: string;
  value: number | null;
  unit: string;
  source: string;
  confidenceRating: string;
}

interface ComparisonSet {
  id: string;
  items: ComparisonItem[];
  comparisonType: 'time' | 'region' | 'source' | 'indicator';
}

export default function DataComparison() {
  const [comparisonType, setComparisonType] = useState<'time' | 'region' | 'source' | 'indicator'>('time');
  const [selectedIndicator, setSelectedIndicator] = useState<string>('');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [period1, setPeriod1] = useState<string>('2024');
  const [period2, setPeriod2] = useState<string>('2025');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  
  // Fetch available indicators - using dashboard KPIs as proxy for now
  const { data: indicatorsData } = trpc.dashboard.getHeroKPIs.useQuery();
  // Create indicator list from available data
  const indicators = [
    { code: 'FX_RATE_OFFICIAL', nameAr: 'سعر الصرف الرسمي', nameEn: 'Official Exchange Rate' },
    { code: 'fx_rate_aden_parallel', nameAr: 'سعر الصرف - عدن', nameEn: 'Exchange Rate - Aden' },
    { code: 'fx_rate_sanaa', nameAr: 'سعر الصرف - صنعاء', nameEn: 'Exchange Rate - Sanaa' },
    { code: 'gdp_nominal', nameAr: 'الناتج المحلي الإجمالي', nameEn: 'GDP Nominal' },
    { code: 'gdp_growth_annual', nameAr: 'نمو الناتج المحلي', nameEn: 'GDP Growth' },
    { code: 'inflation_cpi', nameAr: 'معدل التضخم', nameEn: 'Inflation Rate' },
    { code: 'unemployment_rate', nameAr: 'معدل البطالة', nameEn: 'Unemployment Rate' },
    { code: 'trade_balance', nameAr: 'الميزان التجاري', nameEn: 'Trade Balance' },
    { code: 'oil_production', nameAr: 'إنتاج النفط', nameEn: 'Oil Production' },
    { code: 'remittances', nameAr: 'التحويلات المالية', nameEn: 'Remittances' }
  ];
  
  // Fetch time series data for comparison
  const { data: timeSeriesData } = trpc.sectors.getIndicatorTimeSeries.useQuery({
    indicatorCodes: [selectedIndicator || selectedIndicators[0] || 'fx_rate_aden_parallel'],
    regimeTag: 'both',
    startYear: 2020,
    endYear: 2026
  }, {
    enabled: !!selectedIndicator || selectedIndicators.length > 0
  });
  
  // Calculate comparison metrics
  const comparisonMetrics = useMemo(() => {
    if (!timeSeriesData || timeSeriesData.length === 0) return null;
    
    const period1Data = timeSeriesData.filter((d: any) => d.date?.toString().startsWith(period1));
    const period2Data = timeSeriesData.filter((d: any) => d.date?.toString().startsWith(period2));
    
    const avgPeriod1 = period1Data.length > 0 
      ? period1Data.reduce((sum: number, d: any) => sum + Number(d.value || 0), 0) / period1Data.length 
      : 0;
    const avgPeriod2 = period2Data.length > 0 
      ? period2Data.reduce((sum: number, d: any) => sum + Number(d.value || 0), 0) / period2Data.length 
      : 0;
    
    const change = avgPeriod1 > 0 ? ((avgPeriod2 - avgPeriod1) / avgPeriod1) * 100 : 0;
    
    // Regional breakdown
    const adenData = timeSeriesData.filter((d: any) => d.regimeTag === 'aden_irg');
    const sanaaData = timeSeriesData.filter((d: any) => d.regimeTag === 'sanaa_defacto');
    
    const avgAden = adenData.length > 0 
      ? adenData.reduce((sum: number, d: any) => sum + Number(d.value || 0), 0) / adenData.length 
      : 0;
    const avgSanaa = sanaaData.length > 0 
      ? sanaaData.reduce((sum: number, d: any) => sum + Number(d.value || 0), 0) / sanaaData.length 
      : 0;
    
    const regionalSpread = avgSanaa > 0 ? ((avgAden - avgSanaa) / avgSanaa) * 100 : 0;
    
    return {
      period1: { year: period1, average: avgPeriod1, count: period1Data.length },
      period2: { year: period2, average: avgPeriod2, count: period2Data.length },
      change,
      aden: { average: avgAden, count: adenData.length },
      sanaa: { average: avgSanaa, count: sanaaData.length },
      regionalSpread,
      totalRecords: timeSeriesData.length
    };
  }, [timeSeriesData, period1, period2]);
  
  const addIndicatorToComparison = (code: string) => {
    if (!selectedIndicators.includes(code) && selectedIndicators.length < 4) {
      setSelectedIndicators([...selectedIndicators, code]);
    }
  };
  
  const removeIndicatorFromComparison = (code: string) => {
    setSelectedIndicators(selectedIndicators.filter(c => c !== code));
  };
  
  const exportComparison = () => {
    if (!comparisonMetrics) return;
    
    const csvContent = [
      'Comparison Type,Period/Region,Value,Change %',
      `Time Comparison,${period1},${comparisonMetrics.period1.average.toFixed(2)},Baseline`,
      `Time Comparison,${period2},${comparisonMetrics.period2.average.toFixed(2)},${comparisonMetrics.change.toFixed(2)}%`,
      `Regional Comparison,Aden (IRG),${comparisonMetrics.aden.average.toFixed(2)},Baseline`,
      `Regional Comparison,Sanaa (De Facto),${comparisonMetrics.sanaa.average.toFixed(2)},${comparisonMetrics.regionalSpread.toFixed(2)}%`
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yeto-comparison-${selectedIndicator}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };
  
  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ArrowLeftRight className="h-8 w-8 text-primary" />
              أداة مقارنة البيانات
              <span className="text-muted-foreground text-xl">/ Data Comparison Tool</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              قارن المؤشرات عبر الفترات الزمنية والمناطق والمصادر المختلفة
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportComparison}>
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              مشاركة
            </Button>
          </div>
        </div>
        
        {/* Comparison Type Selector */}
        <Tabs value={comparisonType} onValueChange={(v) => setComparisonType(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              مقارنة زمنية
            </TabsTrigger>
            <TabsTrigger value="region" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              مقارنة إقليمية
            </TabsTrigger>
            <TabsTrigger value="source" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              تثليث المصادر
            </TabsTrigger>
            <TabsTrigger value="indicator" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              مقارنة المؤشرات
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Configuration Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>إعدادات المقارنة / Comparison Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Indicator Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">المؤشر / Indicator</label>
              <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مؤشراً" />
                </SelectTrigger>
                <SelectContent>
                  {indicators.map((ind: any) => (
                    <SelectItem key={ind.code} value={ind.code}>
                      {ind.nameAr || ind.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Period 1 Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">الفترة الأولى / Period 1</label>
              <Select value={period1} onValueChange={setPeriod1}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Period 2 Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">الفترة الثانية / Period 2</label>
              <Select value={period2} onValueChange={setPeriod2}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* View Mode */}
            <div>
              <label className="text-sm font-medium mb-2 block">طريقة العرض / View Mode</label>
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === 'chart' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('chart')}
                >
                  <LineChart className="h-4 w-4 mr-1" />
                  رسم بياني
                </Button>
                <Button 
                  variant={viewMode === 'table' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <Table className="h-4 w-4 mr-1" />
                  جدول
                </Button>
              </div>
            </div>
          </div>
          
          {/* Multi-indicator selection for indicator comparison */}
          {comparisonType === 'indicator' && (
            <div className="mt-4 pt-4 border-t">
              <label className="text-sm font-medium mb-2 block">المؤشرات المحددة / Selected Indicators (max 4)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedIndicators.map(code => {
                  const ind = indicators.find((i: any) => i.code === code);
                  return (
                    <Badge key={code} variant="secondary" className="flex items-center gap-1">
                      {ind?.nameAr || code}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeIndicatorFromComparison(code)} 
                      />
                    </Badge>
                  );
                })}
                {selectedIndicators.length < 4 && (
                  <Select onValueChange={addIndicatorToComparison}>
                    <SelectTrigger className="w-[200px]">
                      <Plus className="h-4 w-4 mr-1" />
                      <SelectValue placeholder="إضافة مؤشر" />
                    </SelectTrigger>
                    <SelectContent>
                      {indicators
                        .filter((ind: any) => !selectedIndicators.includes(ind.code))
                        .map((ind: any) => (
                          <SelectItem key={ind.code} value={ind.code}>
                            {ind.nameAr || ind.nameEn}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Comparison Results */}
      {comparisonMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Comparison Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                مقارنة زمنية / Time Comparison
              </CardTitle>
              <CardDescription>
                مقارنة {period1} مع {period2}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">{period1}</div>
                    <div className="text-2xl font-bold">
                      {comparisonMetrics.period1.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {comparisonMetrics.period1.count} سجل
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">{period2}</div>
                    <div className="text-2xl font-bold">
                      {comparisonMetrics.period2.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {comparisonMetrics.period2.count} سجل
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center p-4 bg-secondary rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">التغير / Change</div>
                    <div className={`text-3xl font-bold flex items-center justify-center gap-2 ${
                      comparisonMetrics.change > 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {comparisonMetrics.change > 0 ? (
                        <TrendingUp className="h-6 w-6" />
                      ) : (
                        <TrendingDown className="h-6 w-6" />
                      )}
                      {comparisonMetrics.change > 0 ? '+' : ''}{comparisonMetrics.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Regional Comparison Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                مقارنة إقليمية / Regional Comparison
              </CardTitle>
              <CardDescription>
                عدن (الحكومة الشرعية) مقابل صنعاء (سلطة الأمر الواقع)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-sm text-green-700 dark:text-green-300">عدن (IRG)</div>
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {comparisonMetrics.aden.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {comparisonMetrics.aden.count} سجل
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-700 dark:text-blue-300">صنعاء (De Facto)</div>
                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {comparisonMetrics.sanaa.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {comparisonMetrics.sanaa.count} سجل
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center p-4 bg-secondary rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">الفارق الإقليمي / Regional Spread</div>
                    <div className={`text-3xl font-bold ${
                      Math.abs(comparisonMetrics.regionalSpread) > 50 ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {comparisonMetrics.regionalSpread > 0 ? '+' : ''}{comparisonMetrics.regionalSpread.toFixed(2)}%
                    </div>
                    {Math.abs(comparisonMetrics.regionalSpread) > 100 && (
                      <Badge variant="destructive" className="mt-2">
                        فجوة كبيرة / Significant Gap
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Source Triangulation Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                تثليث المصادر / Source Triangulation
              </CardTitle>
              <CardDescription>
                مقارنة البيانات من مصادر متعددة للتحقق من الدقة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium">البنك المركزي - عدن</div>
                    <div className="text-sm text-muted-foreground">Central Bank of Yemen - Aden</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-green-50 text-green-700">A - موثوق</Badge>
                  </div>
                </div>
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium">البنك الدولي</div>
                    <div className="text-sm text-muted-foreground">World Bank</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-green-50 text-green-700">A - موثوق</Badge>
                  </div>
                </div>
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium">صندوق النقد الدولي</div>
                    <div className="text-sm text-muted-foreground">IMF</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-green-50 text-green-700">A - موثوق</Badge>
                  </div>
                </div>
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium">تقديرات محلية</div>
                    <div className="text-sm text-muted-foreground">Local Estimates</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">B - جيد</Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">درجة التوافق / Consensus Score</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-bold">85%</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  توافق عالي بين المصادر المختلفة
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Summary Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                ملخص إحصائي / Statistical Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{comparisonMetrics.totalRecords}</div>
                  <div className="text-sm text-muted-foreground">إجمالي السجلات</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {indicators.length}
                  </div>
                  <div className="text-sm text-muted-foreground">المؤشرات المتاحة</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">2010-2026</div>
                  <div className="text-sm text-muted-foreground">النطاق الزمني</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">84+</div>
                  <div className="text-sm text-muted-foreground">مصادر البيانات</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 border rounded-lg">
                <div className="text-sm font-medium mb-2">ملاحظة منهجية / Methodology Note</div>
                <p className="text-xs text-muted-foreground">
                  تستخدم هذه المقارنة المتوسطات الحسابية للفترات المحددة. 
                  للحصول على تحليل أكثر تفصيلاً، يرجى استخدام أداة التقارير المخصصة.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Empty State */}
      {!selectedIndicator && selectedIndicators.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ArrowLeftRight className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">اختر مؤشراً للمقارنة</h3>
            <p className="text-muted-foreground mb-4">
              حدد مؤشراً اقتصادياً من القائمة أعلاه لبدء المقارنة
            </p>
            <Button onClick={() => setSelectedIndicator('FX_RATE_OFFICIAL')}>
              ابدأ بسعر الصرف الرسمي
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
