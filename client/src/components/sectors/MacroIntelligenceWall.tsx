/**
 * MacroIntelligenceWall - Enhanced Macro Sector Page Component
 * 
 * Implements the 6-panel "Intelligence Wall" for the Macroeconomy & Growth sector:
 * - Panel A: Today/This Week Day Feed
 * - Panel B: Macro KPIs (8 tiles max)
 * - Panel C: Long Arc 2010→Today Charts
 * - Panel D: Mechanism Explainer
 * - Panel E: Contradictions & Vintages
 * - Panel F: Connected Intelligence
 */

import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Download,
  Info,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  BookOpen,
  Eye,
  RefreshCw,
  ChevronRight,
  Newspaper,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  GitCompare,
  Network,
  ExternalLink,
  Pin,
  Filter,
} from "lucide-react";
import { Link } from "wouter";
import EvidencePackButton from "@/components/EvidencePackButton";
import ContradictionBadge from "@/components/ContradictionBadge";
import { SectorKpiCard } from "./SectorKpiCard";
import { SectorChart } from "./SectorChart";
import { RelatedInsightsPanel } from "@/components/RelatedInsights";

interface MacroIntelligenceWallProps {
  regime?: 'both' | 'aden_irg' | 'sanaa_dfa';
  isVip?: boolean;
}

// ============================================================================
// PANEL A: TODAY/THIS WEEK DAY FEED
// ============================================================================

interface DayFeedItem {
  id: number;
  title: string;
  titleAr: string;
  timestamp: string;
  source: string;
  sourceType: 'world_bank' | 'imf' | 'un' | 'ocha' | 'think_tank' | 'government' | 'other';
  sectorTags: string[];
  whyMatters: string;
  whyMattersAr: string;
  evidencePackId?: number;
  isPinned?: boolean;
  changeType?: 'data_update' | 'report_release' | 'policy_change' | 'funding_shift' | 'event';
}

function DayFeedPanel({ isArabic, items, onPin }: { 
  isArabic: boolean; 
  items: DayFeedItem[];
  onPin?: (id: number) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'pinned' | 'data' | 'reports'>('all');
  
  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'pinned') return items.filter(i => i.isPinned);
    if (filter === 'data') return items.filter(i => i.changeType === 'data_update');
    if (filter === 'reports') return items.filter(i => i.changeType === 'report_release');
    return items;
  }, [items, filter]);

  const sourceColors: Record<string, string> = {
    world_bank: 'bg-[#DADED8] text-[#2a3a28] dark:bg-blue-900 dark:text-blue-200',
    imf: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    un: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    ocha: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    think_tank: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    government: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Newspaper className="h-5 w-5 text-primary" />
            {isArabic ? 'اليوم / هذا الأسبوع' : 'Today / This Week'}
          </CardTitle>
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-[140px] h-8">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
              <SelectItem value="pinned">{isArabic ? 'المثبتة' : 'Pinned'}</SelectItem>
              <SelectItem value="data">{isArabic ? 'تحديثات البيانات' : 'Data Updates'}</SelectItem>
              <SelectItem value="reports">{isArabic ? 'التقارير' : 'Reports'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          {isArabic 
            ? 'آخر التحديثات والتقارير المتعلقة بالاقتصاد الكلي'
            : 'Latest macro-relevant updates and reports'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{isArabic ? 'لا توجد تحديثات حديثة' : 'No recent updates'}</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id}
              className={`p-3 rounded-lg border transition-colors ${
                item.isPinned ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.isPinned && (
                      <Pin className="h-3 w-3 text-primary flex-shrink-0" />
                    )}
                    <Badge variant="secondary" className={`text-xs ${sourceColors[item.sourceType]}`}>
                      {item.source}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString(isArabic ? 'ar' : 'en', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm line-clamp-2">
                    {isArabic ? item.titleAr : item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    <span className="font-medium">{isArabic ? 'لماذا يهم:' : 'Why it matters:'}</span>{' '}
                    {isArabic ? item.whyMattersAr : item.whyMatters}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {item.sectorTags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.evidencePackId && (
                      <EvidencePackButton 
                        evidencePackId={item.evidencePackId} 
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL B: MACRO KPIs
// ============================================================================

interface MacroKpi {
  code: string;
  titleEn: string;
  titleAr: string;
  value: number | null;
  unit: string;
  delta?: number;
  deltaPeriod?: string;
  lastUpdated: string;
  confidence: 'high' | 'medium' | 'low' | 'proxy';
  evidencePackId?: number;
  isProxy?: boolean;
  proxyLabel?: string;
  proxyLabelAr?: string;
}

function MacroKpiPanel({ isArabic, kpis }: { isArabic: boolean; kpis: MacroKpi[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          {isArabic ? 'المؤشرات الرئيسية' : 'Key Indicators'}
        </CardTitle>
        <CardDescription>
          {isArabic 
            ? 'أهم 8 مؤشرات للاقتصاد الكلي مع روابط الأدلة'
            : 'Top 8 macro indicators with evidence links'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.slice(0, 8).map((kpi) => (
            <div 
              key={kpi.code}
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-muted-foreground line-clamp-2">
                  {isArabic ? kpi.titleAr : kpi.titleEn}
                </h4>
                {kpi.isProxy && (
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                    {isArabic ? 'بديل' : 'Proxy'}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-baseline gap-2">
                {kpi.value !== null ? (
                  <>
                    <span className="text-2xl font-bold">
                      {kpi.value.toLocaleString(isArabic ? 'ar' : 'en', { maximumFractionDigits: 1 })}
                    </span>
                    <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                  </>
                ) : (
                  <span className="text-xl text-muted-foreground">—</span>
                )}
              </div>
              
              {kpi.delta !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  {kpi.delta > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : kpi.delta < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : null}
                  <span className={`text-xs font-medium ${
                    kpi.delta > 0 ? 'text-green-500' : kpi.delta < 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {kpi.delta > 0 ? '+' : ''}{kpi.delta.toFixed(1)}%
                    {kpi.deltaPeriod && <span className="text-muted-foreground ml-1">vs {kpi.deltaPeriod}</span>}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      kpi.confidence === 'high' ? 'bg-green-100 text-green-700' :
                      kpi.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      kpi.confidence === 'proxy' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}
                  >
                    {isArabic 
                      ? kpi.confidence === 'high' ? 'عالية' : kpi.confidence === 'medium' ? 'متوسطة' : kpi.confidence === 'proxy' ? 'بديل' : 'منخفضة'
                      : kpi.confidence}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(kpi.lastUpdated).toLocaleDateString(isArabic ? 'ar' : 'en', { month: 'short', year: '2-digit' })}
                  </span>
                </div>
                {kpi.evidencePackId && (
                  <EvidencePackButton 
                    evidencePackId={kpi.evidencePackId} 
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                  />
                )}
              </div>
              
              {kpi.isProxy && kpi.proxyLabel && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {isArabic ? kpi.proxyLabelAr : kpi.proxyLabel}
                </p>
              )}
            </div>
          ))}
        </div>
        
        {kpis.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{isArabic ? 'لا توجد مؤشرات متاحة' : 'No indicators available'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL C: LONG ARC CHARTS (2010→TODAY)
// ============================================================================

interface ChartData {
  id: string;
  titleEn: string;
  titleAr: string;
  type: 'line' | 'bar' | 'area';
  data: Array<{ year: number; value: number | null; source?: string }>;
  unit: string;
  evidencePackId?: number;
  hasUncertainty?: boolean;
  uncertaintyNote?: string;
  uncertaintyNoteAr?: string;
}

function LongArcChartsPanel({ isArabic, charts, selectedYear, onYearChange }: { 
  isArabic: boolean; 
  charts: ChartData[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}) {
  const [activeChart, setActiveChart] = useState(charts[0]?.id || '');
  const currentYear = new Date().getFullYear();
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LineChart className="h-5 w-5 text-primary" />
              {isArabic ? 'المسار الطويل 2010→اليوم' : 'Long Arc 2010→Today'}
            </CardTitle>
            <CardDescription>
              {isArabic 
                ? 'الاتجاهات التاريخية للاقتصاد الكلي'
                : 'Historical macro trends with evidence'}
            </CardDescription>
          </div>
          
          {/* Date Lens Selector */}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">
                {isArabic ? 'عرض حتى:' : 'View as of:'}
              </span>
              <div className="flex items-center gap-2">
                <Slider
                  value={[selectedYear]}
                  onValueChange={(v) => onYearChange(v[0])}
                  min={2010}
                  max={currentYear}
                  step={1}
                  className="w-[150px]"
                />
                <Badge variant="outline">{selectedYear}</Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart selector tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {charts.map((chart) => (
            <Button
              key={chart.id}
              variant={activeChart === chart.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart(chart.id)}
            >
              {isArabic ? chart.titleAr : chart.titleEn}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {charts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <LineChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{isArabic ? 'لا توجد بيانات رسوم بيانية متاحة' : 'No chart data available'}</p>
          </div>
        ) : (
          <>
            {charts.filter(c => c.id === activeChart).map((chart) => (
              <div key={chart.id}>
                {/* Chart placeholder - would integrate with SectorChart component */}
                <div className="h-[300px] bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {isArabic ? chart.titleAr : chart.titleEn}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {chart.data.length} {isArabic ? 'نقاط بيانات' : 'data points'}
                    </p>
                  </div>
                </div>
                
                {/* Uncertainty note */}
                {chart.hasUncertainty && chart.uncertaintyNote && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {isArabic ? chart.uncertaintyNoteAr : chart.uncertaintyNote}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Chart controls */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {chart.evidencePackId && (
                      <EvidencePackButton 
                        evidencePackId={chart.evidencePackId}
                        variant="outline"
                        size="sm"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      {isArabic ? 'تصدير' : 'Export'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      {isArabic ? 'إضافة للتقرير' : 'Add to Report'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL D: MECHANISM EXPLAINER
// ============================================================================

interface MechanismSection {
  id: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  type: 'conceptual' | 'yemen_specific';
  citations: Array<{
    text: string;
    textAr: string;
    documentId?: number;
    anchorId?: number;
  }>;
  linkedSectors?: Array<{ code: string; nameEn: string; nameAr: string }>;
}

function MechanismExplainerPanel({ isArabic, sections }: { 
  isArabic: boolean; 
  sections: MechanismSection[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-primary" />
          {isArabic ? 'كيف يعمل الاقتصاد الكلي' : 'How Macro Works'}
        </CardTitle>
        <CardDescription>
          {isArabic 
            ? 'شرح الآليات مع الاستشهادات'
            : 'Evidence-locked mechanism explainer'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">
                {isArabic ? section.titleAr : section.titleEn}
              </h4>
              <Badge 
                variant="outline" 
                className={section.type === 'yemen_specific' 
                  ? 'bg-green-50 text-green-700 border-green-300' 
                  : 'bg-blue-50 text-[#2e8b6e] border-blue-300'
                }
              >
                {section.type === 'yemen_specific' 
                  ? (isArabic ? 'خاص باليمن' : 'Yemen-specific')
                  : (isArabic ? 'مفاهيمي' : 'Conceptual')
                }
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isArabic ? section.contentAr : section.contentEn}
            </p>
            
            {/* Citations */}
            {section.citations.length > 0 && (
              <div className="pl-4 border-l-2 border-primary/30 space-y-2">
                {section.citations.map((citation, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground italic">
                      {isArabic ? citation.textAr : citation.text}
                    </span>
                    {citation.documentId && (
                      <Link href={`/research-hub/${citation.documentId}`}>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Linked sectors */}
            {section.linkedSectors && section.linkedSectors.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {isArabic ? 'القطاعات المرتبطة:' : 'Linked sectors:'}
                </span>
                {section.linkedSectors.map((sector) => (
                  <Link key={sector.code} href={`/sectors/${sector.code}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">
                      {isArabic ? sector.nameAr : sector.nameEn}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {sections.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{isArabic ? 'لا توجد شروحات متاحة' : 'No explanations available'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL E: CONTRADICTIONS & VINTAGES
// ============================================================================

interface Contradiction {
  id: number;
  indicatorCode: string;
  indicatorNameEn: string;
  indicatorNameAr: string;
  sources: Array<{
    name: string;
    value: number;
    date: string;
    evidencePackId?: number;
  }>;
  reason?: string;
  reasonAr?: string;
}

interface Vintage {
  id: number;
  indicatorCode: string;
  indicatorNameEn: string;
  indicatorNameAr: string;
  revisions: Array<{
    date: string;
    oldValue: number;
    newValue: number;
    source: string;
    note?: string;
    noteAr?: string;
  }>;
}

function ContradictionsVintagesPanel({ isArabic, contradictions, vintages }: { 
  isArabic: boolean; 
  contradictions: Contradiction[];
  vintages: Vintage[];
}) {
  const [activeTab, setActiveTab] = useState<'contradictions' | 'vintages'>('contradictions');
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GitCompare className="h-5 w-5 text-yellow-500" />
          {isArabic ? 'التناقضات والمراجعات' : 'Contradictions & Vintages'}
        </CardTitle>
        <CardDescription>
          {isArabic 
            ? 'الشفافية حول الاختلافات في البيانات'
            : 'Transparency about data disagreements'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="mb-4">
            <TabsTrigger value="contradictions" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {isArabic ? 'التناقضات' : 'Contradictions'}
              {contradictions.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {contradictions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="vintages" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {isArabic ? 'المراجعات' : 'Vintages'}
              {vintages.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {vintages.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="contradictions" className="space-y-4">
            {contradictions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>{isArabic ? 'لا توجد تناقضات حالية' : 'No current contradictions'}</p>
              </div>
            ) : (
              contradictions.map((c) => (
                <div key={c.id} className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
                  <h4 className="font-medium mb-3">
                    {isArabic ? c.indicatorNameAr : c.indicatorNameEn}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {c.sources.map((source, idx) => (
                      <div key={idx} className="p-2 bg-white dark:bg-gray-900 rounded border">
                        <p className="text-xs text-muted-foreground">{source.name}</p>
                        <p className="font-bold">{source.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{source.date}</p>
                        {source.evidencePackId && (
                          <EvidencePackButton 
                            evidencePackId={source.evidencePackId}
                            size="sm"
                            variant="ghost"
                            className="h-6 mt-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  {c.reason && (
                    <p className="text-sm text-muted-foreground mt-3 italic">
                      <Info className="h-4 w-4 inline mr-1" />
                      {isArabic ? c.reasonAr : c.reason}
                    </p>
                  )}
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="vintages" className="space-y-4">
            {vintages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{isArabic ? 'لا توجد مراجعات حديثة' : 'No recent revisions'}</p>
              </div>
            ) : (
              vintages.map((v) => (
                <div key={v.id} className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-3">
                    {isArabic ? v.indicatorNameAr : v.indicatorNameEn}
                  </h4>
                  <div className="space-y-2">
                    {v.revisions.map((rev, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground w-24">{rev.date}</span>
                        <span className="line-through text-red-500">{rev.oldValue.toLocaleString()}</span>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-green-500 font-medium">{rev.newValue.toLocaleString()}</span>
                        <Badge variant="outline" className="text-xs">{rev.source}</Badge>
                        {rev.note && (
                          <span className="text-muted-foreground italic">
                            ({isArabic ? rev.noteAr : rev.note})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL F: CONNECTED INTELLIGENCE
// ============================================================================

function ConnectedIntelligencePanel({ isArabic, sectorCode }: { 
  isArabic: boolean; 
  sectorCode: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Network className="h-5 w-5 text-primary" />
          {isArabic ? 'الذكاء المترابط' : 'Connected Intelligence'}
        </CardTitle>
        <CardDescription>
          {isArabic 
            ? 'الكيانات والوثائق والأحداث المرتبطة'
            : 'Related entities, documents, and events'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RelatedInsightsPanel
          sourceType="sector"
          sourceId={sectorCode}
          maxItems={12}
          showExplanations={true}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MacroIntelligenceWall({ regime = 'both', isVip = false }: MacroIntelligenceWallProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Mock data - would be replaced with actual API calls
  const mockDayFeed: DayFeedItem[] = [
    {
      id: 1,
      title: "World Bank Updates Yemen GDP Estimates",
      titleAr: "البنك الدولي يحدث تقديرات الناتج المحلي الإجمالي لليمن",
      timestamp: new Date().toISOString(),
      source: "World Bank",
      sourceType: "world_bank",
      sectorTags: ["GDP", "Growth"],
      whyMatters: "First official revision since 2022, reflects updated conflict impact assessment",
      whyMattersAr: "أول مراجعة رسمية منذ 2022، تعكس تقييم تأثير الصراع المحدث",
      evidencePackId: 1,
      isPinned: true,
      changeType: "data_update"
    },
    {
      id: 2,
      title: "IMF Article IV Consultation Report Released",
      titleAr: "صدور تقرير مشاورات المادة الرابعة لصندوق النقد الدولي",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      source: "IMF",
      sourceType: "imf",
      sectorTags: ["Policy", "Fiscal"],
      whyMatters: "Contains new fiscal sustainability analysis and reform recommendations",
      whyMattersAr: "يتضمن تحليل جديد للاستدامة المالية وتوصيات الإصلاح",
      evidencePackId: 2,
      changeType: "report_release"
    }
  ];
  
  const mockKpis: MacroKpi[] = [
    {
      code: "GDP_NOMINAL",
      titleEn: "GDP (Nominal)",
      titleAr: "الناتج المحلي الإجمالي (الاسمي)",
      value: 21.8,
      unit: "B USD",
      delta: -2.3,
      deltaPeriod: "2023",
      lastUpdated: "2024-06-15",
      confidence: "medium",
      evidencePackId: 1
    },
    {
      code: "GDP_GROWTH",
      titleEn: "GDP Growth Rate",
      titleAr: "معدل نمو الناتج المحلي",
      value: -1.5,
      unit: "%",
      delta: 0.8,
      deltaPeriod: "2023",
      lastUpdated: "2024-06-15",
      confidence: "low",
      evidencePackId: 2
    },
    {
      code: "GDP_PER_CAPITA",
      titleEn: "GDP per Capita",
      titleAr: "نصيب الفرد من الناتج",
      value: 650,
      unit: "USD",
      delta: -3.1,
      deltaPeriod: "2023",
      lastUpdated: "2024-06-15",
      confidence: "medium",
      evidencePackId: 3
    },
    {
      code: "NIGHTLIGHTS_INDEX",
      titleEn: "Activity Proxy (Nightlights)",
      titleAr: "مؤشر النشاط (الأضواء الليلية)",
      value: 78.5,
      unit: "index",
      delta: 2.1,
      deltaPeriod: "Q3 2024",
      lastUpdated: "2024-09-30",
      confidence: "proxy",
      evidencePackId: 4,
      isProxy: true,
      proxyLabel: "Based on VIIRS nighttime lights data",
      proxyLabelAr: "بناءً على بيانات الأضواء الليلية VIIRS"
    },
    {
      code: "MACRO_STRESS",
      titleEn: "Macro Stress Index",
      titleAr: "مؤشر الضغط الكلي",
      value: 72,
      unit: "/100",
      delta: 5,
      deltaPeriod: "Q2 2024",
      lastUpdated: "2024-09-30",
      confidence: "medium",
      evidencePackId: 5,
      isProxy: true,
      proxyLabel: "Derived composite index",
      proxyLabelAr: "مؤشر مركب مشتق"
    },
    {
      code: "INFLATION_CPI",
      titleEn: "Inflation (CPI)",
      titleAr: "التضخم (مؤشر أسعار المستهلك)",
      value: 15.2,
      unit: "%",
      delta: -2.8,
      deltaPeriod: "2023",
      lastUpdated: "2024-08-15",
      confidence: "medium",
      evidencePackId: 6
    },
    {
      code: "FISCAL_DEFICIT",
      titleEn: "Fiscal Deficit",
      titleAr: "العجز المالي",
      value: null,
      unit: "% GDP",
      lastUpdated: "2023-12-31",
      confidence: "low"
    },
    {
      code: "EXTERNAL_DEBT",
      titleEn: "External Debt",
      titleAr: "الدين الخارجي",
      value: 7.2,
      unit: "B USD",
      lastUpdated: "2023-12-31",
      confidence: "medium",
      evidencePackId: 8
    }
  ];
  
  const mockCharts: ChartData[] = [
    {
      id: "gdp_nominal",
      titleEn: "GDP Nominal",
      titleAr: "الناتج المحلي الإجمالي الاسمي",
      type: "line",
      data: Array.from({ length: 15 }, (_, i) => ({
        year: 2010 + i,
        value: 30 - (i > 4 ? (i - 4) * 2 : 0) + Math.random() * 2,
        source: "World Bank"
      })),
      unit: "B USD",
      evidencePackId: 1
    },
    {
      id: "gdp_growth",
      titleEn: "GDP Growth Rate",
      titleAr: "معدل النمو",
      type: "bar",
      data: Array.from({ length: 15 }, (_, i) => ({
        year: 2010 + i,
        value: i > 4 ? -5 + Math.random() * 8 : 3 + Math.random() * 2,
        source: "World Bank"
      })),
      unit: "%",
      evidencePackId: 2
    },
    {
      id: "nightlights_proxy",
      titleEn: "Nightlights vs GDP",
      titleAr: "الأضواء الليلية مقابل الناتج",
      type: "area",
      data: Array.from({ length: 15 }, (_, i) => ({
        year: 2010 + i,
        value: 100 - (i > 4 ? (i - 4) * 5 : 0) + Math.random() * 10,
        source: "VIIRS"
      })),
      unit: "index",
      evidencePackId: 4,
      hasUncertainty: true,
      uncertaintyNote: "Proxy comparison - nightlights may not fully capture informal economic activity",
      uncertaintyNoteAr: "مقارنة بديلة - قد لا تعكس الأضواء الليلية النشاط الاقتصادي غير الرسمي بالكامل"
    }
  ];
  
  const mockMechanisms: MechanismSection[] = [
    {
      id: "what_gdp_measures",
      titleEn: "What GDP Measures",
      titleAr: "ما يقيسه الناتج المحلي الإجمالي",
      contentEn: "Gross Domestic Product (GDP) measures the total monetary value of all final goods and services produced within a country's borders in a specific time period. It is the primary indicator of a country's economic health.",
      contentAr: "يقيس الناتج المحلي الإجمالي القيمة النقدية الإجمالية لجميع السلع والخدمات النهائية المنتجة داخل حدود البلد في فترة زمنية محددة. وهو المؤشر الرئيسي للصحة الاقتصادية للبلد.",
      type: "conceptual",
      citations: []
    },
    {
      id: "yemen_transmission",
      titleEn: "Yemen Macro Transmission Channels",
      titleAr: "قنوات انتقال الاقتصاد الكلي في اليمن",
      contentEn: "Yemen's macroeconomic dynamics are shaped by unique transmission channels including: exchange rate pass-through affecting import costs, trade constraints limiting formal economic activity, aid dependency creating fiscal vulnerabilities, and conflict disrupting production capacity.",
      contentAr: "تتشكل ديناميكيات الاقتصاد الكلي في اليمن من خلال قنوات انتقال فريدة تشمل: تأثير سعر الصرف على تكاليف الاستيراد، والقيود التجارية التي تحد من النشاط الاقتصادي الرسمي، والاعتماد على المساعدات الذي يخلق نقاط ضعف مالية، والصراع الذي يعطل القدرة الإنتاجية.",
      type: "yemen_specific",
      citations: [
        {
          text: "World Bank Yemen Economic Monitor, 2023",
          textAr: "مرصد الاقتصاد اليمني للبنك الدولي، 2023",
          documentId: 1
        }
      ],
      linkedSectors: [
        { code: "fx", nameEn: "Foreign Exchange", nameAr: "الصرف الأجنبي" },
        { code: "trade", nameEn: "Trade", nameAr: "التجارة" },
        { code: "aid", nameEn: "Aid & Humanitarian", nameAr: "المساعدات والإنسانية" }
      ]
    }
  ];
  
  const mockContradictions: Contradiction[] = [
    {
      id: 1,
      indicatorCode: "GDP_2023",
      indicatorNameEn: "GDP 2023 Estimate",
      indicatorNameAr: "تقدير الناتج المحلي 2023",
      sources: [
        { name: "World Bank", value: 21.8, date: "Jun 2024", evidencePackId: 1 },
        { name: "IMF", value: 23.1, date: "Apr 2024", evidencePackId: 2 },
        { name: "UN ESCWA", value: 20.5, date: "Mar 2024", evidencePackId: 3 }
      ],
      reason: "Different methodologies for estimating informal sector contribution",
      reasonAr: "منهجيات مختلفة لتقدير مساهمة القطاع غير الرسمي"
    }
  ];
  
  const mockVintages: Vintage[] = [
    {
      id: 1,
      indicatorCode: "GDP_2022",
      indicatorNameEn: "GDP 2022",
      indicatorNameAr: "الناتج المحلي 2022",
      revisions: [
        {
          date: "Jan 2024",
          oldValue: 24.5,
          newValue: 23.2,
          source: "World Bank",
          note: "Revised conflict impact assessment",
          noteAr: "تقييم تأثير الصراع المنقح"
        }
      ]
    }
  ];
  
  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Row 1: Day Feed + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DayFeedPanel isArabic={isArabic} items={mockDayFeed} />
        </div>
        <div className="lg:col-span-2">
          <MacroKpiPanel isArabic={isArabic} kpis={mockKpis} />
        </div>
      </div>
      
      {/* Row 2: Long Arc Charts */}
      <LongArcChartsPanel 
        isArabic={isArabic} 
        charts={mockCharts}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />
      
      {/* Row 3: Mechanism + Contradictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MechanismExplainerPanel isArabic={isArabic} sections={mockMechanisms} />
        <ContradictionsVintagesPanel 
          isArabic={isArabic} 
          contradictions={mockContradictions}
          vintages={mockVintages}
        />
      </div>
      
      {/* Row 4: Connected Intelligence */}
      <ConnectedIntelligencePanel isArabic={isArabic} sectorCode="macro" />
    </div>
  );
}

export default MacroIntelligenceWall;
