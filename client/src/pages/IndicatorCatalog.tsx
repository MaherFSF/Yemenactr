/**
 * Indicator Catalog Page - Section 7 Implementation
 * Browse all 1,284+ indicators across 10 families with search and filtering
 */

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, Filter, Download, ChevronDown, ChevronRight,
  TrendingUp, Building2, Banknote, Ship, Droplet, Wheat, 
  Heart, Swords, Users, Scale, Briefcase, Calendar,
  Database, FileText, Info, ExternalLink
} from 'lucide-react';
import { 
  completeIndicatorCatalog, 
  getIndicatorsByFamily, 
  searchIndicators,
  type Indicator,
  type IndicatorFamily 
} from '@/../../shared/indicators';

// Family icons mapping
const familyIcons: Record<IndicatorFamily, typeof TrendingUp> = {
  macro_fiscal: TrendingUp,
  monetary_banking: Banknote,
  trade_bop: Ship,
  energy_fuel: Droplet,
  food_agriculture: Wheat,
  humanitarian: Heart,
  conflict_security: Swords,
  social_labor: Users,
  governance: Scale,
  private_sector: Briefcase,
};

// Family colors
const familyColors: Record<IndicatorFamily, string> = {
  macro_fiscal: 'bg-blue-500',
  monetary_banking: 'bg-green-500',
  trade_bop: 'bg-cyan-500',
  energy_fuel: 'bg-orange-500',
  food_agriculture: 'bg-lime-500',
  humanitarian: 'bg-red-500',
  conflict_security: 'bg-rose-500',
  social_labor: 'bg-purple-500',
  governance: 'bg-indigo-500',
  private_sector: 'bg-amber-500',
};

export default function IndicatorCatalog() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<IndicatorFamily | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null);
  const [showRegimeSplitOnly, setShowRegimeSplitOnly] = useState(false);
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Filter indicators
  const filteredIndicators = useMemo(() => {
    let results = completeIndicatorCatalog.indicators;
    
    // Search filter
    if (searchQuery) {
      results = searchIndicators(searchQuery, language);
    }
    
    // Family filter
    if (selectedFamily) {
      results = results.filter((i: Indicator) => i.family === selectedFamily);
    }
    
    // Frequency filter
    if (selectedFrequency) {
      results = results.filter((i: Indicator) => i.frequency === selectedFrequency);
    }
    
    // Regime split filter
    if (showRegimeSplitOnly) {
      results = results.filter((i: Indicator) => i.regimeSplit);
    }
    
    return results;
  }, [searchQuery, selectedFamily, selectedFrequency, showRegimeSplitOnly, language]);
  
  // Group by family for display
  const groupedIndicators = useMemo(() => {
    const grouped: Record<string, Indicator[]> = {};
    filteredIndicators.forEach((ind: Indicator) => {
      if (!grouped[ind.family]) grouped[ind.family] = [];
      grouped[ind.family].push(ind);
    });
    return grouped;
  }, [filteredIndicators]);
  
  // Frequency options
  const frequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual'];
  const frequencyLabels: Record<string, { en: string; ar: string }> = {
    daily: { en: 'Daily', ar: 'يومي' },
    weekly: { en: 'Weekly', ar: 'أسبوعي' },
    monthly: { en: 'Monthly', ar: 'شهري' },
    quarterly: { en: 'Quarterly', ar: 'ربع سنوي' },
    biannual: { en: 'Biannual', ar: 'نصف سنوي' },
    annual: { en: 'Annual', ar: 'سنوي' },
  };
  
  // Confidence rating colors
  const confidenceColors: Record<string, string> = {
    A: 'bg-green-500',
    B: 'bg-blue-500',
    C: 'bg-yellow-500',
    D: 'bg-red-500',
  };
  
  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#103050] to-[#107040] text-white py-12">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8" />
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'كتالوج المؤشرات' : 'Indicator Catalog'}
            </h1>
          </div>
          <p className="text-white/80 max-w-2xl">
            {language === 'ar' 
              ? `استعرض أكثر من ${completeIndicatorCatalog.totalIndicators} مؤشر اقتصادي وإنساني عبر 10 عائلات، تغطي الفترة من 2010 حتى الآن`
              : `Browse ${completeIndicatorCatalog.totalIndicators}+ economic and humanitarian indicators across 10 families, covering 2010 to present`
            }
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{completeIndicatorCatalog.totalIndicators}</div>
              <div className="text-sm text-white/70">
                {language === 'ar' ? 'إجمالي المؤشرات' : 'Total Indicators'}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">10</div>
              <div className="text-sm text-white/70">
                {language === 'ar' ? 'عائلات المؤشرات' : 'Indicator Families'}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">2010</div>
              <div className="text-sm text-white/70">
                {language === 'ar' ? 'سنة البداية' : 'Start Year'}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">47</div>
              <div className="text-sm text-white/70">
                {language === 'ar' ? 'مصادر البيانات' : 'Data Sources'}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">
                {completeIndicatorCatalog.indicators.filter((i: Indicator) => i.regimeSplit).length}
              </div>
              <div className="text-sm text-white/70">
                {language === 'ar' ? 'مؤشرات النظام المنقسم' : 'Split-System Indicators'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="sticky top-0 z-10 bg-background border-b py-4">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'البحث في المؤشرات...' : 'Search indicators...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Family Filter */}
            <select
              value={selectedFamily || ''}
              onChange={(e) => setSelectedFamily(e.target.value as IndicatorFamily || null)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">{language === 'ar' ? 'كل العائلات' : 'All Families'}</option>
              {completeIndicatorCatalog.families.map(family => (
                <option key={family.id} value={family.id}>
                  {family.name[language]} ({family.indicatorCount})
                </option>
              ))}
            </select>
            
            {/* Frequency Filter */}
            <select
              value={selectedFrequency || ''}
              onChange={(e) => setSelectedFrequency(e.target.value || null)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">{language === 'ar' ? 'كل الترددات' : 'All Frequencies'}</option>
              {frequencies.map(freq => (
                <option key={freq} value={freq}>
                  {frequencyLabels[freq][language]}
                </option>
              ))}
            </select>
            
            {/* Regime Split Toggle */}
            <Button
              variant={showRegimeSplitOnly ? 'default' : 'outline'}
              onClick={() => setShowRegimeSplitOnly(!showRegimeSplitOnly)}
            >
              <Building2 className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'النظام المنقسم' : 'Split System'}
            </Button>
            
            {/* Export */}
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'تصدير' : 'Export'}
            </Button>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            {language === 'ar' 
              ? `عرض ${filteredIndicators.length} من ${completeIndicatorCatalog.totalIndicators} مؤشر`
              : `Showing ${filteredIndicators.length} of ${completeIndicatorCatalog.totalIndicators} indicators`
            }
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container py-8">
        {/* Family Cards Overview */}
        {!selectedFamily && !searchQuery && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {completeIndicatorCatalog.families.map(family => {
              const Icon = familyIcons[family.id];
              return (
                <Card 
                  key={family.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedFamily(family.id)}
                >
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${familyColors[family.id]} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{family.name[language]}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {family.description[language]}
                    </p>
                    <Badge variant="secondary">{family.indicatorCount} {language === 'ar' ? 'مؤشر' : 'indicators'}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Indicator List */}
        <div className="space-y-6">
          {Object.entries(groupedIndicators).map(([familyId, indicators]) => {
            const family = completeIndicatorCatalog.families.find(f => f.id === familyId);
            const Icon = familyIcons[familyId as IndicatorFamily];
            
            return (
              <div key={familyId}>
                {/* Family Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-lg ${familyColors[familyId as IndicatorFamily]} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">{family?.name[language]}</h2>
                  <Badge variant="outline">{indicators.length}</Badge>
                </div>
                
                {/* Indicators */}
                <div className="space-y-2">
                  {indicators.map((indicator: Indicator) => (
                    <div
                      key={indicator.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      {/* Indicator Header */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedIndicator(expandedIndicator === indicator.id ? null : indicator.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {indicator.code}
                          </Badge>
                          <span className="font-medium">{indicator.name[language]}</span>
                          {indicator.regimeSplit && (
                            <Badge variant="secondary" className="text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              {language === 'ar' ? 'منقسم' : 'Split'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${confidenceColors[indicator.confidenceDefault]} text-white text-xs`}>
                            {indicator.confidenceDefault}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {frequencyLabels[indicator.frequency]?.[language] || indicator.frequency}
                          </Badge>
                          {expandedIndicator === indicator.id ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {expandedIndicator === indicator.id && (
                        <div className="border-t p-4 bg-muted/30">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold mb-2">
                                {language === 'ar' ? 'الوصف' : 'Description'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {indicator.description[language]}
                              </p>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs text-muted-foreground">
                                  {language === 'ar' ? 'الوحدة' : 'Unit'}
                                </span>
                                <p className="text-sm font-medium">{indicator.unit}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">
                                  {language === 'ar' ? 'سنة البداية' : 'Start Year'}
                                </span>
                                <p className="text-sm font-medium">{indicator.startYear}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">
                                  {language === 'ar' ? 'المنهجية' : 'Methodology'}
                                </span>
                                <p className="text-sm">{indicator.methodology}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">
                                  {language === 'ar' ? 'المصادر' : 'Sources'}
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {indicator.sources.map((source: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">
                                  {language === 'ar' ? 'الوسوم' : 'Tags'}
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {indicator.tags.map((tag: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button size="sm" variant="outline">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              {language === 'ar' ? 'عرض البيانات' : 'View Data'}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              {language === 'ar' ? 'تحميل' : 'Download'}
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4 mr-2" />
                              {language === 'ar' ? 'المنهجية' : 'Methodology'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Empty State */}
        {filteredIndicators.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'ar' ? 'لم يتم العثور على مؤشرات' : 'No indicators found'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'جرب تعديل معايير البحث أو التصفية'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Methodology Note */}
      <div className="bg-muted/30 border-t py-8">
        <div className="container">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">
                {language === 'ar' ? 'ملاحظة منهجية' : 'Methodology Note'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'تصنيفات الثقة (A-D) تعكس جودة البيانات وموثوقية المصدر. المؤشرات المميزة بـ "النظام المنقسم" لها قيم منفصلة لمناطق عدن (الحكومة الشرعية) وصنعاء (سلطات الأمر الواقع). جميع البيانات تخضع للتحقق والتحديث المستمر.'
                  : 'Confidence ratings (A-D) reflect data quality and source reliability. Indicators marked "Split System" have separate values for Aden (IRG) and Sanaa (de facto authorities) regions. All data is subject to ongoing verification and updates.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
