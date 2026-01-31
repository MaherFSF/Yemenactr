/**
 * HumanitarianIntelligenceWall - Enhanced Humanitarian Sector Page Component
 * 
 * Implements the 6-panel "Intelligence Wall" for the Humanitarian sector:
 * - Panel A: Today/This Week Humanitarian News Feed
 * - Panel B: Humanitarian KPIs (8 tiles max)
 * - Panel C: Long Arc 2010→Today Charts
 * - Panel D: Humanitarian Mechanism Explainer
 * - Panel E: Contradictions & Vintages
 * - Panel F: Connected Intelligence
 */

import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  BookOpen,
  RefreshCw,
  ChevronRight,
  Newspaper,
  LineChart,
  Heart,
  Users,
  Home,
  Droplets,
  Stethoscope,
  GitCompare,
  Network,
  Pin,
  AlertCircle,
  HandHeart,
  ShieldAlert,
  MapPin,
  Tent,
  Baby,
} from "lucide-react";
import { Link } from "wouter";
import EvidencePackButton from "@/components/EvidencePackButton";
import { RelatedInsightsPanel } from "@/components/RelatedInsights";

interface HumanitarianIntelligenceWallProps {
  regime?: 'both' | 'aden_irg' | 'sanaa_dfa';
  isVip?: boolean;
}

// ============================================================================
// PANEL A: TODAY/THIS WEEK HUMANITARIAN NEWS FEED
// ============================================================================

interface HumanitarianFeedItem {
  id: number;
  title: string;
  titleAr: string;
  timestamp: string;
  source: string;
  sourceType: 'ocha' | 'wfp' | 'unhcr' | 'unicef' | 'who' | 'ngo' | 'media' | 'other';
  humanTags: string[];
  whyMatters: string;
  whyMattersAr: string;
  evidencePackId?: number;
  isPinned?: boolean;
  changeType?: 'funding' | 'needs_update' | 'response' | 'displacement' | 'alert';
  urgency?: 'critical' | 'high' | 'medium' | 'low';
}

function HumanitarianFeedPanel({ isArabic, items, onPin }: { 
  isArabic: boolean; 
  items: HumanitarianFeedItem[];
  onPin?: (id: number) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'pinned' | 'critical' | 'funding'>('all');
  
  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'pinned') return items.filter(i => i.isPinned);
    if (filter === 'critical') return items.filter(i => i.urgency === 'critical' || i.urgency === 'high');
    if (filter === 'funding') return items.filter(i => i.changeType === 'funding');
    return items;
  }, [items, filter]);

  const sourceColors: Record<string, string> = {
    ocha: 'bg-[#DADED8] text-[#2C3424] dark:bg-blue-900 dark:text-blue-200',
    wfp: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    unhcr: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    unicef: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    who: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    ngo: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    media: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    other: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  };

  const urgencyColors: Record<string, string> = {
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-black',
    low: 'bg-green-500 text-white',
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg">
              {isArabic ? "اليوم / هذا الأسبوع" : "Today / This Week"}
            </CardTitle>
          </div>
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? "الكل" : "All"}</SelectItem>
              <SelectItem value="pinned">{isArabic ? "المثبتة" : "Pinned"}</SelectItem>
              <SelectItem value="critical">{isArabic ? "حرجة" : "Critical"}</SelectItem>
              <SelectItem value="funding">{isArabic ? "التمويل" : "Funding"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          {isArabic 
            ? "آخر التحديثات والأخبار الإنسانية"
            : "Latest humanitarian updates and news"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className={`p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
              item.isPinned ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' : ''
            } ${item.urgency === 'critical' ? 'border-l-4 border-l-red-500' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={sourceColors[item.sourceType] || sourceColors.other} variant="secondary">
                    {item.source}
                  </Badge>
                  {item.urgency && (
                    <Badge className={urgencyColors[item.urgency]} variant="secondary">
                      {item.urgency.toUpperCase()}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US', { 
                      month: 'short', day: 'numeric' 
                    })}
                  </span>
                </div>
                <h4 className="font-medium text-sm mb-1">
                  {isArabic ? item.titleAr : item.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">{isArabic ? "لماذا يهم:" : "Why it matters:"}</span>{" "}
                  {isArabic ? item.whyMattersAr : item.whyMatters}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {item.humanTags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {item.evidencePackId && (
                  <EvidencePackButton 
                    evidencePackId={String(item.evidencePackId)} 
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                  />
                )}
                {onPin && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-6 px-2 ${item.isPinned ? 'text-red-600' : ''}`}
                    onClick={() => onPin(item.id)}
                  >
                    <Pin className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{isArabic ? "لا توجد تحديثات" : "No updates"}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL B: HUMANITARIAN KPIs (8 TILES MAX)
// ============================================================================

interface HumanitarianKpi {
  id: string;
  nameEn: string;
  nameAr: string;
  value: string | number;
  unit: string;
  unitAr: string;
  change?: number;
  changeLabel?: string;
  changeLabelAr?: string;
  confidence: 'high' | 'medium' | 'low' | 'proxy';
  lastUpdated: string;
  evidencePackId?: string;
  isProxy?: boolean;
  icon?: React.ReactNode;
  severity?: 'critical' | 'severe' | 'moderate' | 'low';
}

function HumanitarianKpiPanel({ isArabic, kpis }: { isArabic: boolean; kpis: HumanitarianKpi[] }) {
  const confidenceColors = {
    high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    proxy: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  const severityColors = {
    critical: 'border-l-4 border-l-red-500',
    severe: 'border-l-4 border-l-orange-500',
    moderate: 'border-l-4 border-l-yellow-500',
    low: 'border-l-4 border-l-green-500',
  };

  const confidenceLabels = {
    high: { en: 'High', ar: 'عالية' },
    medium: { en: 'Medium', ar: 'متوسطة' },
    low: { en: 'Low', ar: 'منخفضة' },
    proxy: { en: 'Proxy', ar: 'بديل' },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-600" />
          <CardTitle className="text-lg">
            {isArabic ? "المؤشرات الرئيسية" : "Key Indicators"}
          </CardTitle>
        </div>
        <CardDescription>
          {isArabic 
            ? "أهم 8 مؤشرات إنسانية مع روابط الأدلة"
            : "Top 8 humanitarian indicators with evidence links"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.slice(0, 8).map((kpi) => (
            <Card key={kpi.id} className={`relative overflow-hidden ${kpi.severity ? severityColors[kpi.severity] : ''}`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {kpi.isProxy && (
                      <Badge variant="outline" className="text-xs px-1 py-0 bg-purple-50">
                        {isArabic ? "بديل" : "Proxy"}
                      </Badge>
                    )}
                  </div>
                  {kpi.icon}
                </div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1 line-clamp-2">
                  {isArabic ? kpi.nameAr : kpi.nameEn}
                </h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold">{kpi.value}</span>
                  <span className="text-xs text-muted-foreground">
                    {isArabic ? kpi.unitAr : kpi.unit}
                  </span>
                </div>
                {kpi.change !== undefined && (
                  <div className={`flex items-center gap-1 text-xs mt-1 ${
                    kpi.change > 0 ? 'text-red-600' : kpi.change < 0 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {kpi.change > 0 ? <TrendingUp className="h-3 w-3" /> : 
                     kpi.change < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                    <span>{kpi.change > 0 ? '+' : ''}{kpi.change}%</span>
                    <span className="text-muted-foreground">
                      {isArabic ? kpi.changeLabelAr : kpi.changeLabel}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <Badge className={`text-xs ${confidenceColors[kpi.confidence]}`}>
                    {isArabic ? confidenceLabels[kpi.confidence].ar : confidenceLabels[kpi.confidence].en}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(kpi.lastUpdated).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US', {
                      month: 'short', year: '2-digit'
                    })}
                  </span>
                </div>
                {kpi.evidencePackId && (
                  <EvidencePackButton 
                    evidencePackId={kpi.evidencePackId} 
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 absolute top-2 right-2"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL C: LONG ARC 2010→TODAY CHARTS
// ============================================================================

interface HumanitarianChartData {
  id: string;
  titleEn: string;
  titleAr: string;
  type: 'line' | 'bar' | 'area' | 'stacked';
  dataPoints: number;
  evidencePackId?: string;
}

function HumanitarianChartsPanel({ isArabic, charts, selectedYear, onYearChange }: {
  isArabic: boolean;
  charts: HumanitarianChartData[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}) {
  const [activeChart, setActiveChart] = useState(charts[0]?.id || 'needs');

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg">
              {isArabic ? "المسار الطويل 2010→اليوم" : "Long Arc 2010→Today"}
            </CardTitle>
          </div>
        </div>
        <CardDescription>
          {isArabic 
            ? "الاتجاهات التاريخية للوضع الإنساني"
            : "Historical trends in humanitarian situation"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-muted-foreground">
            {isArabic ? "عرض حتى:" : "View up to:"}
          </span>
          <div className="flex-1 max-w-xs">
            <Slider
              value={[selectedYear]}
              onValueChange={([v]) => onYearChange(v)}
              min={2010}
              max={2026}
              step={1}
              className="w-full"
            />
          </div>
          <span className="text-sm font-medium w-12">{selectedYear}</span>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeChart} onValueChange={setActiveChart}>
          <TabsList className="mb-4">
            {charts.map(chart => (
              <TabsTrigger key={chart.id} value={chart.id} className="text-xs">
                {isArabic ? chart.titleAr : chart.titleEn}
              </TabsTrigger>
            ))}
          </TabsList>

          {charts.map(chart => (
            <TabsContent key={chart.id} value={chart.id}>
              <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? chart.titleAr : chart.titleEn}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chart.dataPoints} {isArabic ? "نقاط بيانات" : "data points"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-3">
                {chart.evidencePackId && (
                  <EvidencePackButton 
                    evidencePackId={chart.evidencePackId}
                    variant="outline"
                    size="sm"
                  />
                )}
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  {isArabic ? "تصدير" : "Export"}
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  {isArabic ? "إضافة للتقرير" : "Add to Report"}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL D: HUMANITARIAN MECHANISM EXPLAINER
// ============================================================================

interface HumanitarianMechanism {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  type: 'conceptual' | 'yemen_specific' | 'response';
  citation?: string;
  linkedSectors?: string[];
}

function HumanitarianMechanismPanel({ isArabic, mechanisms }: { 
  isArabic: boolean; 
  mechanisms: HumanitarianMechanism[];
}) {
  const typeColors = {
    conceptual: 'bg-[#DADED8] text-[#2C3424] dark:bg-blue-900 dark:text-blue-200',
    yemen_specific: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    response: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const typeLabels = {
    conceptual: { en: 'Conceptual', ar: 'مفاهيمي' },
    yemen_specific: { en: 'Yemen-Specific', ar: 'خاص باليمن' },
    response: { en: 'Response', ar: 'استجابة' },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-red-600" />
          <CardTitle className="text-lg">
            {isArabic ? "كيف تعمل الاستجابة الإنسانية" : "How Humanitarian Response Works"}
          </CardTitle>
        </div>
        <CardDescription>
          {isArabic 
            ? "شرح الآليات مع الاستشهادات"
            : "Mechanism explanations with citations"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mechanisms.map((mech) => (
          <div key={mech.id} className="p-3 rounded-lg border bg-card">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm">
                {isArabic ? mech.titleAr : mech.titleEn}
              </h4>
              <Badge className={typeColors[mech.type]}>
                {isArabic ? typeLabels[mech.type].ar : typeLabels[mech.type].en}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {isArabic ? mech.descriptionAr : mech.descriptionEn}
            </p>
            {mech.citation && (
              <p className="text-xs text-muted-foreground italic border-l-2 border-red-500 pl-2">
                {mech.citation}
              </p>
            )}
            {mech.linkedSectors && mech.linkedSectors.length > 0 && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  {isArabic ? "القطاعات المرتبطة:" : "Linked sectors:"}
                </span>
                {mech.linkedSectors.map(sector => (
                  <Link key={sector} href={`/sectors/${sector}`}>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                      {sector}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL E: CONTRADICTIONS & VINTAGES
// ============================================================================

interface HumanitarianContradiction {
  id: string;
  indicatorEn: string;
  indicatorAr: string;
  sources: { name: string; value: string | number; date: string }[];
  explanation?: string;
  explanationAr?: string;
}

interface HumanitarianVintage {
  id: string;
  indicatorEn: string;
  indicatorAr: string;
  revisions: { date: string; oldValue: string | number; newValue: string | number; reason?: string }[];
}

function HumanitarianContradictionsPanel({ 
  isArabic, 
  contradictions, 
  vintages 
}: { 
  isArabic: boolean; 
  contradictions: HumanitarianContradiction[];
  vintages: HumanitarianVintage[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-red-600" />
          <CardTitle className="text-lg">
            {isArabic ? "التناقضات والمراجعات" : "Contradictions & Revisions"}
          </CardTitle>
        </div>
        <CardDescription>
          {isArabic 
            ? "الشفافية حول الاختلافات في البيانات"
            : "Transparency about data discrepancies"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="contradictions">
          <TabsList className="mb-4">
            <TabsTrigger value="contradictions" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {isArabic ? "التناقضات" : "Contradictions"}
              {contradictions.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {contradictions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="vintages" className="gap-1">
              <RefreshCw className="h-3 w-3" />
              {isArabic ? "المراجعات" : "Revisions"}
              {vintages.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {vintages.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contradictions" className="space-y-3">
            {contradictions.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  {isArabic ? c.indicatorAr : c.indicatorEn}
                </h4>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {c.sources.map((src, i) => (
                    <div key={i} className="text-center p-2 bg-background rounded border">
                      <p className="text-xs text-muted-foreground">{src.name}</p>
                      <p className="font-bold">{src.value}</p>
                      <p className="text-xs text-muted-foreground">{src.date}</p>
                    </div>
                  ))}
                </div>
                {c.explanation && (
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? c.explanationAr : c.explanation}
                  </p>
                )}
              </div>
            ))}
            {contradictions.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">{isArabic ? "لا توجد تناقضات حالياً" : "No contradictions currently"}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="vintages" className="space-y-3">
            {vintages.map((v) => (
              <div key={v.id} className="p-3 rounded-lg border">
                <h4 className="font-medium text-sm mb-2">
                  {isArabic ? v.indicatorAr : v.indicatorEn}
                </h4>
                <div className="space-y-2">
                  {v.revisions.map((rev, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-xs text-muted-foreground w-20">{rev.date}</span>
                      <span className="line-through text-red-500">{rev.oldValue}</span>
                      <ChevronRight className="h-3 w-3" />
                      <span className="text-green-600 font-medium">{rev.newValue}</span>
                      {rev.reason && (
                        <span className="text-xs text-muted-foreground">({rev.reason})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {vintages.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">{isArabic ? "لا توجد مراجعات حالياً" : "No revisions currently"}</p>
              </div>
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

function HumanitarianConnectedPanel({ isArabic }: { isArabic: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-red-600" />
          <CardTitle className="text-lg">
            {isArabic ? "الذكاء المترابط" : "Connected Intelligence"}
          </CardTitle>
        </div>
        <CardDescription>
          {isArabic 
            ? "الكيانات والوثائق والأحداث المرتبطة"
            : "Related entities, documents, and events"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RelatedInsightsPanel
          sourceType="sector"
          sourceId="humanitarian"
          maxItems={6}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HumanitarianIntelligenceWall({ regime = 'both', isVip = false }: HumanitarianIntelligenceWallProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [selectedYear, setSelectedYear] = useState(2026);

  // Mock data for Humanitarian sector
  const feedItems: HumanitarianFeedItem[] = [
    {
      id: 1,
      title: "OCHA: 21.6 Million People in Need of Humanitarian Assistance",
      titleAr: "أوتشا: 21.6 مليون شخص بحاجة إلى مساعدات إنسانية",
      timestamp: new Date().toISOString(),
      source: "OCHA",
      sourceType: 'ocha',
      humanTags: ['HNO', 'Needs'],
      whyMatters: "Updated Humanitarian Needs Overview for 2024 planning cycle",
      whyMattersAr: "نظرة عامة محدثة على الاحتياجات الإنسانية لدورة التخطيط 2024",
      isPinned: true,
      changeType: 'needs_update',
      urgency: 'critical',
    },
    {
      id: 2,
      title: "WFP: Food Assistance Reaches 8.5 Million in October",
      titleAr: "برنامج الأغذية العالمي: المساعدات الغذائية تصل إلى 8.5 مليون في أكتوبر",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      source: "WFP",
      sourceType: 'wfp',
      humanTags: ['Food', 'Response'],
      whyMatters: "Highest monthly reach in 2024, but still below target",
      whyMattersAr: "أعلى وصول شهري في 2024، لكنه لا يزال أقل من المستهدف",
      changeType: 'response',
      urgency: 'high',
    },
  ];

  const kpis: HumanitarianKpi[] = [
    {
      id: 'pin',
      nameEn: 'People in Need',
      nameAr: 'الأشخاص المحتاجون',
      value: '21.6',
      unit: 'M',
      unitAr: 'مليون',
      change: 2.3,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'high',
      lastUpdated: '2024-02-01',
      icon: <Users className="h-4 w-4 text-red-600" />,
      severity: 'critical',
    },
    {
      id: 'food_insecure',
      nameEn: 'Food Insecure',
      nameAr: 'انعدام الأمن الغذائي',
      value: '17.4',
      unit: 'M',
      unitAr: 'مليون',
      change: 5.1,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'high',
      lastUpdated: '2024-06-01',
      icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      severity: 'critical',
    },
    {
      id: 'idps',
      nameEn: 'Internally Displaced',
      nameAr: 'النازحون داخلياً',
      value: '4.5',
      unit: 'M',
      unitAr: 'مليون',
      change: -2.1,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'medium',
      lastUpdated: '2024-09-01',
      icon: <Tent className="h-4 w-4 text-orange-600" />,
      severity: 'severe',
    },
    {
      id: 'acute_malnutrition',
      nameEn: 'Acute Malnutrition (Children)',
      nameAr: 'سوء التغذية الحاد (الأطفال)',
      value: '2.2',
      unit: 'M',
      unitAr: 'مليون',
      change: 8.5,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'medium',
      lastUpdated: '2024-06-01',
      icon: <Baby className="h-4 w-4 text-red-600" />,
      severity: 'critical',
    },
    {
      id: 'health_facilities',
      nameEn: 'Health Facilities Functional',
      nameAr: 'المرافق الصحية العاملة',
      value: '51',
      unit: '%',
      unitAr: '%',
      change: -3.2,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'medium',
      lastUpdated: '2024-06-01',
      icon: <Stethoscope className="h-4 w-4 text-green-600" />,
      severity: 'severe',
    },
    {
      id: 'water_access',
      nameEn: 'Without Safe Water',
      nameAr: 'بدون مياه آمنة',
      value: '17.8',
      unit: 'M',
      unitAr: 'مليون',
      confidence: 'medium',
      lastUpdated: '2024-06-01',
      icon: <Droplets className="h-4 w-4 text-blue-600" />,
      severity: 'severe',
    },
    {
      id: 'funding',
      nameEn: 'HRP Funding',
      nameAr: 'تمويل خطة الاستجابة',
      value: '42',
      unit: '% funded',
      unitAr: '% ممول',
      change: -8.5,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'high',
      lastUpdated: '2024-10-01',
      icon: <HandHeart className="h-4 w-4 text-purple-600" />,
      severity: 'moderate',
    },
    {
      id: 'protection_incidents',
      nameEn: 'Protection Incidents',
      nameAr: 'حوادث الحماية',
      value: '1,247',
      unit: 'YTD',
      unitAr: 'منذ بداية العام',
      change: 15.3,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'low',
      lastUpdated: '2024-09-01',
      icon: <ShieldAlert className="h-4 w-4 text-red-600" />,
      severity: 'severe',
    },
  ];

  const charts: HumanitarianChartData[] = [
    { id: 'needs', titleEn: 'People in Need', titleAr: 'الأشخاص المحتاجون', type: 'area', dataPoints: 10 },
    { id: 'funding', titleEn: 'HRP Funding', titleAr: 'تمويل خطة الاستجابة', type: 'bar', dataPoints: 10 },
    { id: 'displacement', titleEn: 'Displacement', titleAr: 'النزوح', type: 'line', dataPoints: 10 },
  ];

  const mechanisms: HumanitarianMechanism[] = [
    {
      id: 'hrp_cycle',
      titleEn: 'Humanitarian Response Plan Cycle',
      titleAr: 'دورة خطة الاستجابة الإنسانية',
      descriptionEn: "The annual HRP cycle includes needs assessment (HNO), response planning, funding appeals, and monitoring. Yemen's HRP is one of the world's largest, requiring $4.3B in 2024.",
      descriptionAr: "تشمل دورة خطة الاستجابة الإنسانية السنوية تقييم الاحتياجات (HNO) وتخطيط الاستجابة ونداءات التمويل والمراقبة. خطة الاستجابة الإنسانية لليمن من أكبر الخطط في العالم، وتتطلب 4.3 مليار دولار في 2024.",
      type: 'conceptual',
      citation: 'OCHA Yemen HRP 2024',
      linkedSectors: ['food-security'],
    },
    {
      id: 'access_constraints',
      titleEn: 'Humanitarian Access Constraints',
      titleAr: 'قيود الوصول الإنساني',
      descriptionEn: 'Humanitarian operations face significant access constraints including bureaucratic impediments, active conflict zones, and infrastructure damage. Access varies significantly between IRG and DFA-controlled areas.',
      descriptionAr: 'تواجه العمليات الإنسانية قيوداً كبيرة على الوصول بما في ذلك العوائق البيروقراطية ومناطق النزاع النشط وأضرار البنية التحتية. يختلف الوصول بشكل كبير بين المناطق الخاضعة لسيطرة الحكومة المعترف بها وسلطة الأمر الواقع.',
      type: 'yemen_specific',
      linkedSectors: ['conflict'],
    },
  ];

  const contradictions: HumanitarianContradiction[] = [
    {
      id: 'pin_2024',
      indicatorEn: 'People in Need 2024',
      indicatorAr: 'الأشخاص المحتاجون 2024',
      sources: [
        { name: 'OCHA HNO', value: '21.6M', date: 'Feb 2024' },
        { name: 'World Bank', value: '18.2M', date: 'Mar 2024' },
        { name: 'ACAPS', value: '23.1M', date: 'Jan 2024' },
      ],
      explanation: 'Different methodologies for calculating humanitarian needs thresholds',
      explanationAr: 'منهجيات مختلفة لحساب عتبات الاحتياجات الإنسانية',
    },
  ];

  const vintages: HumanitarianVintage[] = [
    {
      id: 'idp_revision',
      indicatorEn: 'IDP Estimate Revision',
      indicatorAr: 'مراجعة تقدير النازحين',
      revisions: [
        { date: 'Sep 2024', oldValue: '4.8M', newValue: '4.5M', reason: 'Updated IOM DTM data' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-7 w-7 text-red-600" />
            {isArabic ? "القطاع الإنساني" : "Humanitarian Sector"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic 
              ? "لوحة الذكاء الإنساني - الاحتياجات والاستجابة والتمويل"
              : "Humanitarian Intelligence Wall - Needs, response, and funding"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            {isArabic ? "تصدير" : "Export"}
          </Button>
          <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700">
            <FileText className="h-4 w-4 mr-1" />
            {isArabic ? "إنشاء تقرير" : "Generate Report"}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Day Feed */}
        <div className="lg:col-span-1">
          <HumanitarianFeedPanel isArabic={isArabic} items={feedItems} />
        </div>

        {/* Right Column: KPIs */}
        <div className="lg:col-span-2">
          <HumanitarianKpiPanel isArabic={isArabic} kpis={kpis} />
        </div>
      </div>

      {/* Charts Section */}
      <HumanitarianChartsPanel 
        isArabic={isArabic} 
        charts={charts}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {/* Bottom Grid: Mechanism + Contradictions + Connected */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HumanitarianMechanismPanel isArabic={isArabic} mechanisms={mechanisms} />
        <HumanitarianContradictionsPanel 
          isArabic={isArabic} 
          contradictions={contradictions}
          vintages={vintages}
        />
        <HumanitarianConnectedPanel isArabic={isArabic} />
      </div>
    </div>
  );
}
