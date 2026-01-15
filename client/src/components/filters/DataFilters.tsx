import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Calendar as CalendarIcon, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Save,
  RotateCcw,
  Share2,
  Download,
  Clock,
  Building2,
  Globe,
  Shield,
  Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subYears, subMonths, subDays, startOfYear, endOfYear, startOfMonth, endOfMonth } from "date-fns";
import { ar, enUS } from "date-fns/locale";

// Filter types
export interface FilterState {
  // Time filters
  periodType: 'preset' | 'custom';
  presetPeriod: PresetPeriod;
  startDate: Date | null;
  endDate: Date | null;
  granularity: Granularity;
  
  // Data filters
  sectors: string[];
  regimes: Regime[];
  sources: string[];
  confidenceRatings: ConfidenceRating[];
  
  // Display filters
  showGaps: boolean;
  showProjections: boolean;
  compareRegimes: boolean;
}

export type PresetPeriod = 
  | 'all' // 2010 to present
  | 'ytd' // Year to date
  | 'last_year'
  | 'last_3_years'
  | 'last_5_years'
  | 'last_10_years'
  | 'pre_conflict' // 2010-2014
  | 'conflict_onset' // 2015-2016
  | 'dual_economy' // 2017-2019
  | 'covid_era' // 2020-2021
  | 'truce_recovery' // 2022-present
  | 'custom';

export type Granularity = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';

export type Regime = 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'unknown';

export type ConfidenceRating = 'A' | 'B' | 'C' | 'D';

// Sector definitions
export const SECTORS = [
  { id: 'banking', label: 'Banking & Finance', labelAr: 'البنوك والمالية', icon: Building2 },
  { id: 'trade', label: 'Trade & Commerce', labelAr: 'التجارة', icon: Globe },
  { id: 'energy', label: 'Energy & Fuel', labelAr: 'الطاقة والوقود', icon: Globe },
  { id: 'agriculture', label: 'Agriculture', labelAr: 'الزراعة', icon: Globe },
  { id: 'humanitarian', label: 'Humanitarian Aid', labelAr: 'المساعدات الإنسانية', icon: Globe },
  { id: 'food_security', label: 'Food Security', labelAr: 'الأمن الغذائي', icon: Globe },
  { id: 'health', label: 'Health', labelAr: 'الصحة', icon: Globe },
  { id: 'education', label: 'Education', labelAr: 'التعليم', icon: Globe },
  { id: 'infrastructure', label: 'Infrastructure', labelAr: 'البنية التحتية', icon: Globe },
  { id: 'labor', label: 'Labor & Employment', labelAr: 'العمل والتوظيف', icon: Globe },
  { id: 'fiscal', label: 'Fiscal Policy', labelAr: 'السياسة المالية', icon: Globe },
  { id: 'monetary', label: 'Monetary Policy', labelAr: 'السياسة النقدية', icon: Globe },
];

// Source definitions
export const SOURCES = [
  { id: 'world_bank', label: 'World Bank', labelAr: 'البنك الدولي' },
  { id: 'imf', label: 'IMF', labelAr: 'صندوق النقد الدولي' },
  { id: 'cby_aden', label: 'CBY Aden', labelAr: 'البنك المركزي عدن' },
  { id: 'cby_sanaa', label: 'CBY Sanaa', labelAr: 'البنك المركزي صنعاء' },
  { id: 'un_ocha', label: 'UN OCHA', labelAr: 'مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية' },
  { id: 'wfp', label: 'WFP', labelAr: 'برنامج الأغذية العالمي' },
  { id: 'fao', label: 'FAO', labelAr: 'منظمة الأغذية والزراعة' },
  { id: 'undp', label: 'UNDP', labelAr: 'برنامج الأمم المتحدة الإنمائي' },
  { id: 'acled', label: 'ACLED', labelAr: 'مشروع بيانات مواقع النزاعات المسلحة' },
  { id: 'ofac', label: 'OFAC Treasury', labelAr: 'مكتب مراقبة الأصول الأجنبية' },
];

// Preset period definitions
const PRESET_PERIODS: Record<PresetPeriod, { label: string; labelAr: string; getRange: () => [Date, Date] }> = {
  all: {
    label: 'All Time (2010-Present)',
    labelAr: 'كل الوقت (2010-الآن)',
    getRange: () => [new Date(2010, 0, 1), new Date()]
  },
  ytd: {
    label: 'Year to Date',
    labelAr: 'منذ بداية العام',
    getRange: () => [startOfYear(new Date()), new Date()]
  },
  last_year: {
    label: 'Last 12 Months',
    labelAr: 'آخر 12 شهراً',
    getRange: () => [subMonths(new Date(), 12), new Date()]
  },
  last_3_years: {
    label: 'Last 3 Years',
    labelAr: 'آخر 3 سنوات',
    getRange: () => [subYears(new Date(), 3), new Date()]
  },
  last_5_years: {
    label: 'Last 5 Years',
    labelAr: 'آخر 5 سنوات',
    getRange: () => [subYears(new Date(), 5), new Date()]
  },
  last_10_years: {
    label: 'Last 10 Years',
    labelAr: 'آخر 10 سنوات',
    getRange: () => [subYears(new Date(), 10), new Date()]
  },
  pre_conflict: {
    label: 'Pre-Conflict (2010-2014)',
    labelAr: 'ما قبل النزاع (2010-2014)',
    getRange: () => [new Date(2010, 0, 1), new Date(2014, 11, 31)]
  },
  conflict_onset: {
    label: 'Conflict Onset (2015-2016)',
    labelAr: 'بداية النزاع (2015-2016)',
    getRange: () => [new Date(2015, 0, 1), new Date(2016, 11, 31)]
  },
  dual_economy: {
    label: 'Dual Economy (2017-2019)',
    labelAr: 'الاقتصاد المزدوج (2017-2019)',
    getRange: () => [new Date(2017, 0, 1), new Date(2019, 11, 31)]
  },
  covid_era: {
    label: 'COVID Era (2020-2021)',
    labelAr: 'فترة كوفيد (2020-2021)',
    getRange: () => [new Date(2020, 0, 1), new Date(2021, 11, 31)]
  },
  truce_recovery: {
    label: 'Truce & Recovery (2022-Present)',
    labelAr: 'الهدنة والتعافي (2022-الآن)',
    getRange: () => [new Date(2022, 0, 1), new Date()]
  },
  custom: {
    label: 'Custom Range',
    labelAr: 'نطاق مخصص',
    getRange: () => [new Date(2010, 0, 1), new Date()]
  }
};

// Default filter state
const defaultFilters: FilterState = {
  periodType: 'preset',
  presetPeriod: 'last_5_years',
  startDate: null,
  endDate: null,
  granularity: 'monthly',
  sectors: [],
  regimes: [],
  sources: [],
  confidenceRatings: [],
  showGaps: true,
  showProjections: false,
  compareRegimes: false,
};

interface DataFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onApply?: () => void;
  onReset?: () => void;
  compact?: boolean;
  showPresets?: boolean;
}

export function DataFilters({
  filters,
  onChange,
  onApply,
  onReset,
  compact = false,
  showPresets = true
}: DataFiltersProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const dateLocale = language === 'ar' ? ar : enUS;
  
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [activeSection, setActiveSection] = useState<string | null>('time');
  
  // Calculate date range from filters
  const getDateRange = useCallback((): [Date, Date] => {
    if (filters.periodType === 'custom' && filters.startDate && filters.endDate) {
      return [filters.startDate, filters.endDate];
    }
    return PRESET_PERIODS[filters.presetPeriod].getRange();
  }, [filters]);
  
  const [startDate, endDate] = getDateRange();
  
  // Update filter
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };
  
  // Toggle array filter
  const toggleArrayFilter = <K extends keyof FilterState>(
    key: K, 
    value: string
  ) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated });
  };
  
  // Reset filters
  const handleReset = () => {
    onChange(defaultFilters);
    onReset?.();
  };
  
  // Generate shareable URL
  const generateShareableUrl = () => {
    const params = new URLSearchParams();
    params.set('period', filters.presetPeriod);
    if (filters.startDate) params.set('start', filters.startDate.toISOString());
    if (filters.endDate) params.set('end', filters.endDate.toISOString());
    params.set('granularity', filters.granularity);
    if (filters.sectors.length) params.set('sectors', filters.sectors.join(','));
    if (filters.regimes.length) params.set('regimes', filters.regimes.join(','));
    if (filters.sources.length) params.set('sources', filters.sources.join(','));
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    // Show toast notification
  };
  
  // Count active filters
  const activeFilterCount = [
    filters.sectors.length > 0,
    filters.regimes.length > 0,
    filters.sources.length > 0,
    filters.confidenceRatings.length > 0,
    filters.presetPeriod !== 'last_5_years',
    filters.granularity !== 'monthly',
  ].filter(Boolean).length;
  
  return (
    <Card className={cn("border-2", isExpanded ? "border-primary/20" : "")} dir={isRTL ? 'rtl' : 'ltr'}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">
                  {language === 'ar' ? 'المرشحات' : 'Filters'}
                </CardTitle>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeFilterCount} {language === 'ar' ? 'نشط' : 'active'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Quick period display */}
                <Badge variant="outline" className="text-xs">
                  {format(startDate, 'MMM yyyy', { locale: dateLocale })} - {format(endDate, 'MMM yyyy', { locale: dateLocale })}
                </Badge>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <Tabs defaultValue="time" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="time" className="gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {language === 'ar' ? 'الفترة' : 'Period'}
                </TabsTrigger>
                <TabsTrigger value="sectors" className="gap-1 text-xs">
                  <Globe className="h-3 w-3" />
                  {language === 'ar' ? 'القطاعات' : 'Sectors'}
                </TabsTrigger>
                <TabsTrigger value="sources" className="gap-1 text-xs">
                  <Building2 className="h-3 w-3" />
                  {language === 'ar' ? 'المصادر' : 'Sources'}
                </TabsTrigger>
                <TabsTrigger value="advanced" className="gap-1 text-xs">
                  <Shield className="h-3 w-3" />
                  {language === 'ar' ? 'متقدم' : 'Advanced'}
                </TabsTrigger>
              </TabsList>
              
              {/* Time Period Tab */}
              <TabsContent value="time" className="space-y-4">
                {/* Preset periods */}
                {showPresets && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {language === 'ar' ? 'الفترات المحددة مسبقاً' : 'Preset Periods'}
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(PRESET_PERIODS) as PresetPeriod[])
                        .filter(p => p !== 'custom')
                        .map(period => (
                          <Button
                            key={period}
                            variant={filters.presetPeriod === period ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => {
                              updateFilter('periodType', 'preset');
                              updateFilter('presetPeriod', period);
                            }}
                          >
                            {language === 'ar' 
                              ? PRESET_PERIODS[period].labelAr 
                              : PRESET_PERIODS[period].label}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* Custom date range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'ar' ? 'نطاق تاريخ مخصص' : 'Custom Date Range'}
                  </Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startDate 
                            ? format(filters.startDate, 'PPP', { locale: dateLocale })
                            : (language === 'ar' ? 'تاريخ البداية' : 'Start date')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.startDate || undefined}
                          onSelect={(date) => {
                            updateFilter('startDate', date || null);
                            updateFilter('periodType', 'custom');
                            updateFilter('presetPeriod', 'custom');
                          }}
                          disabled={(date) => date > new Date() || date < new Date(2010, 0, 1)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endDate 
                            ? format(filters.endDate, 'PPP', { locale: dateLocale })
                            : (language === 'ar' ? 'تاريخ النهاية' : 'End date')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.endDate || undefined}
                          onSelect={(date) => {
                            updateFilter('endDate', date || null);
                            updateFilter('periodType', 'custom');
                            updateFilter('presetPeriod', 'custom');
                          }}
                          disabled={(date) => date > new Date() || (filters.startDate ? date < filters.startDate : false)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {/* Granularity */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'ar' ? 'الدقة الزمنية' : 'Time Granularity'}
                  </Label>
                  <Select
                    value={filters.granularity}
                    onValueChange={(value: Granularity) => updateFilter('granularity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{language === 'ar' ? 'يومي' : 'Daily'}</SelectItem>
                      <SelectItem value="weekly">{language === 'ar' ? 'أسبوعي' : 'Weekly'}</SelectItem>
                      <SelectItem value="monthly">{language === 'ar' ? 'شهري' : 'Monthly'}</SelectItem>
                      <SelectItem value="quarterly">{language === 'ar' ? 'ربع سنوي' : 'Quarterly'}</SelectItem>
                      <SelectItem value="annual">{language === 'ar' ? 'سنوي' : 'Annual'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              {/* Sectors Tab */}
              <TabsContent value="sectors" className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {SECTORS.map(sector => (
                    <div
                      key={sector.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                        filters.sectors.includes(sector.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => toggleArrayFilter('sectors', sector.id)}
                    >
                      <Checkbox
                        checked={filters.sectors.includes(sector.id)}
                        onCheckedChange={() => toggleArrayFilter('sectors', sector.id)}
                      />
                      <span className="text-sm">
                        {language === 'ar' ? sector.labelAr : sector.label}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter('sectors', SECTORS.map(s => s.id))}
                  >
                    {language === 'ar' ? 'تحديد الكل' : 'Select All'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter('sectors', [])}
                  >
                    {language === 'ar' ? 'إلغاء الكل' : 'Clear All'}
                  </Button>
                </div>
              </TabsContent>
              
              {/* Sources Tab */}
              <TabsContent value="sources" className="space-y-4">
                {/* Regime filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'ar' ? 'النظام/السلطة' : 'Regime/Authority'}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'aden_irg', label: 'Aden (IRG)', labelAr: 'عدن (الحكومة المعترف بها)' },
                      { id: 'sanaa_defacto', label: 'Sanaa (De-facto)', labelAr: 'صنعاء (سلطة الأمر الواقع)' },
                      { id: 'mixed', label: 'Mixed/Both', labelAr: 'مختلط/كلاهما' },
                    ].map(regime => (
                      <Badge
                        key={regime.id}
                        variant={filters.regimes.includes(regime.id as Regime) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArrayFilter('regimes', regime.id)}
                      >
                        {language === 'ar' ? regime.labelAr : regime.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Data sources */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'ar' ? 'مصادر البيانات' : 'Data Sources'}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SOURCES.map(source => (
                      <div
                        key={source.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                          filters.sources.includes(source.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => toggleArrayFilter('sources', source.id)}
                      >
                        <Checkbox
                          checked={filters.sources.includes(source.id)}
                          onCheckedChange={() => toggleArrayFilter('sources', source.id)}
                        />
                        <span className="text-sm">
                          {language === 'ar' ? source.labelAr : source.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4">
                {/* Confidence ratings */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'ar' ? 'تصنيف الثقة' : 'Confidence Rating'}
                  </Label>
                  <div className="flex gap-2">
                    {(['A', 'B', 'C', 'D'] as ConfidenceRating[]).map(rating => (
                      <Badge
                        key={rating}
                        variant={filters.confidenceRatings.includes(rating) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer",
                          rating === 'A' && "bg-green-500",
                          rating === 'B' && "bg-blue-500",
                          rating === 'C' && "bg-yellow-500",
                          rating === 'D' && "bg-red-500"
                        )}
                        onClick={() => toggleArrayFilter('confidenceRatings', rating)}
                      >
                        {rating}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? 'A = موثوقية عالية، D = تقدير/غير مؤكد'
                      : 'A = High reliability, D = Estimate/Uncertain'}
                  </p>
                </div>
                
                {/* Display options */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {language === 'ar' ? 'خيارات العرض' : 'Display Options'}
                  </Label>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="showGaps"
                      checked={filters.showGaps}
                      onCheckedChange={(checked) => updateFilter('showGaps', !!checked)}
                    />
                    <Label htmlFor="showGaps" className="text-sm cursor-pointer">
                      {language === 'ar' ? 'إظهار فجوات البيانات' : 'Show data gaps'}
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="showProjections"
                      checked={filters.showProjections}
                      onCheckedChange={(checked) => updateFilter('showProjections', !!checked)}
                    />
                    <Label htmlFor="showProjections" className="text-sm cursor-pointer">
                      {language === 'ar' ? 'إظهار التوقعات' : 'Show projections'}
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="compareRegimes"
                      checked={filters.compareRegimes}
                      onCheckedChange={(checked) => updateFilter('compareRegimes', !!checked)}
                    />
                    <Label htmlFor="compareRegimes" className="text-sm cursor-pointer">
                      {language === 'ar' ? 'مقارنة الأنظمة جنباً إلى جنب' : 'Compare regimes side-by-side'}
                    </Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Action buttons */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                </Button>
                <Button variant="outline" size="sm" onClick={generateShareableUrl}>
                  <Share2 className="h-4 w-4 mr-1" />
                  {language === 'ar' ? 'مشاركة' : 'Share'}
                </Button>
              </div>
              
              <Button size="sm" onClick={onApply}>
                {language === 'ar' ? 'تطبيق المرشحات' : 'Apply Filters'}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Hook for managing filter state with URL sync
export function useDataFilters(initialFilters?: Partial<FilterState>) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters
  });
  
  // Sync with URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFilters: Partial<FilterState> = {};
    
    if (params.get('period')) {
      urlFilters.presetPeriod = params.get('period') as PresetPeriod;
    }
    if (params.get('start')) {
      urlFilters.startDate = new Date(params.get('start')!);
      urlFilters.periodType = 'custom';
    }
    if (params.get('end')) {
      urlFilters.endDate = new Date(params.get('end')!);
      urlFilters.periodType = 'custom';
    }
    if (params.get('granularity')) {
      urlFilters.granularity = params.get('granularity') as Granularity;
    }
    if (params.get('sectors')) {
      urlFilters.sectors = params.get('sectors')!.split(',');
    }
    if (params.get('regimes')) {
      urlFilters.regimes = params.get('regimes')!.split(',') as Regime[];
    }
    if (params.get('sources')) {
      urlFilters.sources = params.get('sources')!.split(',');
    }
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...urlFilters }));
    }
  }, []);
  
  // Get computed date range
  const getDateRange = useCallback((): [Date, Date] => {
    if (filters.periodType === 'custom' && filters.startDate && filters.endDate) {
      return [filters.startDate, filters.endDate];
    }
    return PRESET_PERIODS[filters.presetPeriod].getRange();
  }, [filters]);
  
  return {
    filters,
    setFilters,
    getDateRange,
    resetFilters: () => setFilters(defaultFilters)
  };
}

export default DataFilters;
