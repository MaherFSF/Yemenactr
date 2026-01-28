import { useState } from 'react';
import AdminGuard from "@/components/AdminGuard";
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, AlertTriangle, CheckCircle, Calendar, Database, TrendingDown } from 'lucide-react';

export default function CoverageMap() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedRegime, setSelectedRegime] = useState<string>('all');

  // Fetch coverage data
  const { data: coverageData, isLoading, refetch } = trpc.dataInfra.getCoverageMap.useQuery({
    sector: selectedSector === 'all' ? undefined : selectedSector,
    regimeTag: selectedRegime === 'all' ? undefined : selectedRegime,
  });

  // Fetch quick stats
  const { data: quickStats } = trpc.dataInfra.getQuickCoverageStats.useQuery();

  const sectors = [
    { value: 'all', labelEn: 'All Sectors', labelAr: 'جميع القطاعات' },
    { value: 'macro', labelEn: 'Macroeconomy', labelAr: 'الاقتصاد الكلي' },
    { value: 'banking', labelEn: 'Banking & Finance', labelAr: 'البنوك والتمويل' },
    { value: 'trade', labelEn: 'Trade', labelAr: 'التجارة' },
    { value: 'prices', labelEn: 'Prices & Inflation', labelAr: 'الأسعار والتضخم' },
    { value: 'fx', labelEn: 'Exchange Rates', labelAr: 'أسعار الصرف' },
    { value: 'fiscal', labelEn: 'Public Finance', labelAr: 'المالية العامة' },
    { value: 'energy', labelEn: 'Energy & Fuel', labelAr: 'الطاقة والوقود' },
    { value: 'food', labelEn: 'Food Security', labelAr: 'الأمن الغذائي' },
    { value: 'humanitarian', labelEn: 'Humanitarian', labelAr: 'الإنسانية' },
  ];

  const regimes = [
    { value: 'all', labelEn: 'All Regimes', labelAr: 'جميع الأنظمة' },
    { value: 'IRG', labelEn: 'Aden (IRG)', labelAr: 'عدن (الحكومة المعترف بها)' },
    { value: 'DFA', labelEn: "Sana'a (DFA)", labelAr: 'صنعاء (سلطة الأمر الواقع)' },
    { value: 'unified', labelEn: 'Unified', labelAr: 'موحد' },
  ];

  const getCoverageColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCoverageBadge = (percent: number) => {
    if (percent >= 80) return <Badge className="bg-green-500">{isArabic ? 'ممتاز' : 'Excellent'}</Badge>;
    if (percent >= 50) return <Badge className="bg-yellow-500">{isArabic ? 'متوسط' : 'Moderate'}</Badge>;
    return <Badge className="bg-red-500">{isArabic ? 'حرج' : 'Critical'}</Badge>;
  };

  return (
    <div className={`min-h-screen bg-background p-6 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isArabic ? 'خريطة التغطية' : 'Coverage Map'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isArabic 
                ? 'تتبع تغطية البيانات من 2010 إلى اليوم لجميع المؤشرات'
                : 'Track data coverage from 2010 to today for all indicators'}
            </p>
          </div>
          <Button onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'} ${isLoading ? 'animate-spin' : ''}`} />
            {isArabic ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'إجمالي المؤشرات' : 'Total Indicators'}
                  </p>
                  <p className="text-2xl font-bold">{quickStats?.totalIndicators || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'متوسط التغطية' : 'Avg Coverage'}
                  </p>
                  <p className="text-2xl font-bold">{quickStats?.avgCoverage || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'فجوات حرجة' : 'Critical Gaps'}
                  </p>
                  <p className="text-2xl font-bold">{quickStats?.criticalGaps || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'نطاق البيانات' : 'Data Range'}
                  </p>
                  <p className="text-lg font-bold">2010 → {isArabic ? 'اليوم' : 'Today'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">
                  {isArabic ? 'القطاع' : 'Sector'}
                </label>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map(s => (
                      <SelectItem key={s.value} value={s.value}>
                        {isArabic ? s.labelAr : s.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">
                  {isArabic ? 'النظام' : 'Regime'}
                </label>
                <Select value={selectedRegime} onValueChange={setSelectedRegime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regimes.map(r => (
                      <SelectItem key={r.value} value={r.value}>
                        {isArabic ? r.labelAr : r.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="sectors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sectors">
              {isArabic ? 'حسب القطاع' : 'By Sector'}
            </TabsTrigger>
            <TabsTrigger value="gaps">
              {isArabic ? 'أكبر الفجوات' : 'Top Gap Drivers'}
            </TabsTrigger>
            <TabsTrigger value="indicators">
              {isArabic ? 'جميع المؤشرات' : 'All Indicators'}
            </TabsTrigger>
          </TabsList>

          {/* By Sector Tab */}
          <TabsContent value="sectors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coverageData?.bySector?.map((sector: any) => (
                <Card key={sector.sector}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {isArabic ? sector.sectorNameAr : sector.sector}
                      </CardTitle>
                      {getCoverageBadge(sector.avgCoverage)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {isArabic ? 'المؤشرات' : 'Indicators'}: {sector.totalIndicators}
                        </span>
                        <span className="font-medium">{sector.avgCoverage}%</span>
                      </div>
                      <Progress value={sector.avgCoverage} className="h-2" />
                      {sector.topGapDrivers?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            {isArabic ? 'أكبر الفجوات:' : 'Top gaps:'}
                          </p>
                          <div className="space-y-1">
                            {sector.topGapDrivers.slice(0, 3).map((gap: any) => (
                              <div key={gap.indicatorCode} className="flex items-center justify-between text-xs">
                                <span className="truncate max-w-[200px]">{gap.indicatorName}</span>
                                <Badge variant="outline" className="text-red-500">
                                  {gap.coveragePercent}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Top Gap Drivers Tab */}
          <TabsContent value="gaps">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  {isArabic ? 'أكبر فجوات البيانات' : 'Top Data Gap Drivers'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isArabic ? 'المؤشر' : 'Indicator'}</TableHead>
                      <TableHead>{isArabic ? 'القطاع' : 'Sector'}</TableHead>
                      <TableHead>{isArabic ? 'الأيام المفقودة' : 'Missing Days'}</TableHead>
                      <TableHead>{isArabic ? 'التغطية' : 'Coverage'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coverageData?.topGapDrivers?.map((gap: any) => (
                      <TableRow key={gap.indicatorCode}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{gap.indicatorName}</p>
                            <p className="text-xs text-muted-foreground">{gap.indicatorCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>{gap.sector}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{gap.missingDays.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={gap.coveragePercent} className="w-20 h-2" />
                            <span className="text-sm">{gap.coveragePercent}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Indicators Tab */}
          <TabsContent value="indicators">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isArabic ? 'جميع المؤشرات' : 'All Indicators'}
                  <Badge className="ml-2">{coverageData?.totalIndicators || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isArabic ? 'المؤشر' : 'Indicator'}</TableHead>
                        <TableHead>{isArabic ? 'النظام' : 'Regime'}</TableHead>
                        <TableHead>{isArabic ? 'أول تاريخ' : 'Earliest'}</TableHead>
                        <TableHead>{isArabic ? 'آخر تاريخ' : 'Latest'}</TableHead>
                        <TableHead>{isArabic ? 'التغطية' : 'Coverage'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coverageData?.indicators?.slice(0, 50).map((ind: any) => (
                        <TableRow key={`${ind.indicatorCode}-${ind.regimeTag}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium truncate max-w-[200px]">{ind.indicatorName}</p>
                              <p className="text-xs text-muted-foreground">{ind.indicatorCode}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{ind.regimeTag}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{ind.earliestDate || '-'}</TableCell>
                          <TableCell className="text-sm">{ind.latestDate || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getCoverageColor(ind.coveragePercent)}`} />
                              <span>{ind.coveragePercent}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
