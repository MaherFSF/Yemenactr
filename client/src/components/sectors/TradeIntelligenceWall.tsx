/**
 * TradeIntelligenceWall - Enhanced Trade Sector Page Component
 * 
 * Implements the 6-panel "Intelligence Wall" for the Trade & Ports sector:
 * - Panel A: Today/This Week Trade News Feed
 * - Panel B: Trade KPIs (8 tiles max)
 * - Panel C: Long Arc 2010→Today Charts
 * - Panel D: Trade Mechanism Explainer
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
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  BookOpen,
  RefreshCw,
  ChevronRight,
  Newspaper,
  LineChart,
  Ship,
  Anchor,
  Package,
  Container,
  Truck,
  GitCompare,
  Network,
  Pin,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  MapPin,
} from "lucide-react";
import { Link } from "wouter";
import EvidencePackButton from "@/components/EvidencePackButton";
import { RelatedInsightsPanel } from "@/components/RelatedInsights";

interface TradeIntelligenceWallProps {
  regime?: 'both' | 'aden_irg' | 'sanaa_dfa';
  isVip?: boolean;
}

// ============================================================================
// PANEL A: TODAY/THIS WEEK TRADE NEWS FEED
// ============================================================================

interface TradeFeedItem {
  id: number;
  title: string;
  titleAr: string;
  timestamp: string;
  source: string;
  sourceType: 'un_comtrade' | 'customs' | 'port_authority' | 'world_bank' | 'shipping' | 'media' | 'other';
  tradeTags: string[];
  whyMatters: string;
  whyMattersAr: string;
  evidencePackId?: number;
  isPinned?: boolean;
  changeType?: 'port_update' | 'tariff_change' | 'trade_data' | 'blockade' | 'agreement';
}

function TradeFeedPanel({ isArabic, items, onPin }: { 
  isArabic: boolean; 
  items: TradeFeedItem[];
  onPin?: (id: number) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'pinned' | 'ports' | 'data'>('all');
  
  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'pinned') return items.filter(i => i.isPinned);
    if (filter === 'ports') return items.filter(i => i.changeType === 'port_update' || i.sourceType === 'port_authority');
    if (filter === 'data') return items.filter(i => i.changeType === 'trade_data');
    return items;
  }, [items, filter]);

  const sourceColors: Record<string, string> = {
    un_comtrade: 'bg-[#DADED8] text-[#2a3a28] dark:bg-blue-900 dark:text-blue-200',
    customs: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    port_authority: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    world_bank: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    shipping: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    media: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    other: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-cyan-600" />
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
              <SelectItem value="ports">{isArabic ? "الموانئ" : "Ports"}</SelectItem>
              <SelectItem value="data">{isArabic ? "البيانات" : "Data"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          {isArabic 
            ? "آخر التحديثات والأخبار المتعلقة بالتجارة والموانئ"
            : "Latest updates and news related to trade and ports"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className={`p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
              item.isPinned ? 'border-cyan-300 bg-cyan-50/50 dark:bg-cyan-950/20' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={sourceColors[item.sourceType] || sourceColors.other} variant="secondary">
                    {item.source}
                  </Badge>
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
                  {item.tradeTags.map(tag => (
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
                    className={`h-6 px-2 ${item.isPinned ? 'text-cyan-600' : ''}`}
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
// PANEL B: TRADE KPIs (8 TILES MAX)
// ============================================================================

interface TradeKpi {
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
  regime?: 'aden' | 'sanaa' | 'both';
}

function TradeKpiPanel({ isArabic, kpis }: { isArabic: boolean; kpis: TradeKpi[] }) {
  const confidenceColors = {
    high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    proxy: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
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
          <Ship className="h-5 w-5 text-cyan-600" />
          <CardTitle className="text-lg">
            {isArabic ? "المؤشرات الرئيسية" : "Key Indicators"}
          </CardTitle>
        </div>
        <CardDescription>
          {isArabic 
            ? "أهم 8 مؤشرات للتجارة والموانئ مع روابط الأدلة"
            : "Top 8 trade and port indicators with evidence links"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.slice(0, 8).map((kpi) => (
            <Card key={kpi.id} className="relative overflow-hidden">
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
                    kpi.change > 0 ? 'text-green-600' : kpi.change < 0 ? 'text-red-600' : 'text-gray-500'
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

interface TradeChartData {
  id: string;
  titleEn: string;
  titleAr: string;
  type: 'line' | 'bar' | 'area' | 'stacked';
  dataPoints: number;
  evidencePackId?: string;
}

function TradeChartsPanel({ isArabic, charts, selectedYear, onYearChange }: {
  isArabic: boolean;
  charts: TradeChartData[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}) {
  const [activeChart, setActiveChart] = useState(charts[0]?.id || 'imports');

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-cyan-600" />
            <CardTitle className="text-lg">
              {isArabic ? "المسار الطويل 2010→اليوم" : "Long Arc 2010→Today"}
            </CardTitle>
          </div>
        </div>
        <CardDescription>
          {isArabic 
            ? "الاتجاهات التاريخية للتجارة والموانئ"
            : "Historical trends in trade and ports"}
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
// PANEL D: TRADE MECHANISM EXPLAINER
// ============================================================================

interface TradeMechanism {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  type: 'conceptual' | 'yemen_specific' | 'port_specific';
  citation?: string;
  linkedSectors?: string[];
}

function TradeMechanismPanel({ isArabic, mechanisms }: { 
  isArabic: boolean; 
  mechanisms: TradeMechanism[];
}) {
  const typeColors = {
    conceptual: 'bg-[#DADED8] text-[#2a3a28] dark:bg-blue-900 dark:text-blue-200',
    yemen_specific: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    port_specific: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  };

  const typeLabels = {
    conceptual: { en: 'Conceptual', ar: 'مفاهيمي' },
    yemen_specific: { en: 'Yemen-Specific', ar: 'خاص باليمن' },
    port_specific: { en: 'Port-Specific', ar: 'خاص بالموانئ' },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-cyan-600" />
          <CardTitle className="text-lg">
            {isArabic ? "كيف تعمل التجارة" : "How Trade Works"}
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
              <p className="text-xs text-muted-foreground italic border-l-2 border-cyan-500 pl-2">
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

interface TradeContradiction {
  id: string;
  indicatorEn: string;
  indicatorAr: string;
  sources: { name: string; value: string | number; date: string }[];
  explanation?: string;
  explanationAr?: string;
}

interface TradeVintage {
  id: string;
  indicatorEn: string;
  indicatorAr: string;
  revisions: { date: string; oldValue: string | number; newValue: string | number; reason?: string }[];
}

function TradeContradictionsPanel({ 
  isArabic, 
  contradictions, 
  vintages 
}: { 
  isArabic: boolean; 
  contradictions: TradeContradiction[];
  vintages: TradeVintage[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-cyan-600" />
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

function TradeConnectedPanel({ isArabic }: { isArabic: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-cyan-600" />
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
          sourceId="trade"
          maxItems={6}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TradeIntelligenceWall({ regime = 'both', isVip = false }: TradeIntelligenceWallProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [selectedYear, setSelectedYear] = useState(2026);

  // Mock data for Trade sector
  const feedItems: TradeFeedItem[] = [
    {
      id: 1,
      title: "Hodeidah Port Reports 15% Increase in Container Throughput",
      titleAr: "ميناء الحديدة يسجل زيادة 15% في حركة الحاويات",
      timestamp: new Date().toISOString(),
      source: "Port Authority",
      sourceType: 'port_authority',
      tradeTags: ['Hodeidah', 'Containers'],
      whyMatters: "First significant increase since 2022, signals improved port operations",
      whyMattersAr: "أول زيادة ملموسة منذ 2022، تشير إلى تحسن عمليات الميناء",
      isPinned: true,
      changeType: 'port_update',
    },
    {
      id: 2,
      title: "UN Comtrade Releases Updated Yemen Trade Statistics",
      titleAr: "كومتريد الأمم المتحدة تصدر إحصاءات التجارة اليمنية المحدثة",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      source: "UN Comtrade",
      sourceType: 'un_comtrade',
      tradeTags: ['Statistics', 'Annual'],
      whyMatters: "Comprehensive 2023 trade data now available for analysis",
      whyMattersAr: "بيانات التجارة الشاملة لعام 2023 متاحة الآن للتحليل",
      changeType: 'trade_data',
    },
  ];

  const kpis: TradeKpi[] = [
    {
      id: 'imports',
      nameEn: 'Total Imports',
      nameAr: 'إجمالي الواردات',
      value: '8.2',
      unit: 'B USD',
      unitAr: 'مليار دولار',
      change: -5.3,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'medium',
      lastUpdated: '2024-06-01',
      icon: <ArrowDownRight className="h-4 w-4 text-cyan-600" />,
    },
    {
      id: 'exports',
      nameEn: 'Total Exports',
      nameAr: 'إجمالي الصادرات',
      value: '0.4',
      unit: 'B USD',
      unitAr: 'مليار دولار',
      change: -12.5,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'medium',
      lastUpdated: '2024-06-01',
      icon: <ArrowUpRight className="h-4 w-4 text-cyan-600" />,
    },
    {
      id: 'trade_balance',
      nameEn: 'Trade Balance',
      nameAr: 'الميزان التجاري',
      value: '-7.8',
      unit: 'B USD',
      unitAr: 'مليار دولار',
      confidence: 'medium',
      lastUpdated: '2024-06-01',
      icon: <Globe className="h-4 w-4 text-red-600" />,
    },
    {
      id: 'port_throughput',
      nameEn: 'Port Throughput',
      nameAr: 'حركة الموانئ',
      value: '12.5',
      unit: 'M MT',
      unitAr: 'مليون طن',
      change: 8.2,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'high',
      lastUpdated: '2024-09-01',
      icon: <Container className="h-4 w-4 text-cyan-600" />,
    },
    {
      id: 'food_imports',
      nameEn: 'Food Imports',
      nameAr: 'واردات الغذاء',
      value: '3.8',
      unit: 'B USD',
      unitAr: 'مليار دولار',
      change: 2.1,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'medium',
      lastUpdated: '2024-06-01',
      icon: <Package className="h-4 w-4 text-cyan-600" />,
    },
    {
      id: 'fuel_imports',
      nameEn: 'Fuel Imports',
      nameAr: 'واردات الوقود',
      value: '2.1',
      unit: 'B USD',
      unitAr: 'مليار دولار',
      change: -8.5,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'medium',
      lastUpdated: '2024-06-01',
      icon: <Truck className="h-4 w-4 text-cyan-600" />,
    },
    {
      id: 'aden_port',
      nameEn: 'Aden Port Activity',
      nameAr: 'نشاط ميناء عدن',
      value: '4.2',
      unit: 'M MT',
      unitAr: 'مليون طن',
      change: 12.3,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'high',
      lastUpdated: '2024-09-01',
      icon: <Anchor className="h-4 w-4 text-cyan-600" />,
      regime: 'aden',
    },
    {
      id: 'hodeidah_port',
      nameEn: 'Hodeidah Port Activity',
      nameAr: 'نشاط ميناء الحديدة',
      value: '5.8',
      unit: 'M MT',
      unitAr: 'مليون طن',
      change: 5.1,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'medium',
      lastUpdated: '2024-09-01',
      icon: <Ship className="h-4 w-4 text-cyan-600" />,
      regime: 'sanaa',
    },
  ];

  const charts: TradeChartData[] = [
    { id: 'imports', titleEn: 'Imports', titleAr: 'الواردات', type: 'area', dataPoints: 15 },
    { id: 'exports', titleEn: 'Exports', titleAr: 'الصادرات', type: 'line', dataPoints: 15 },
    { id: 'ports', titleEn: 'Port Activity', titleAr: 'نشاط الموانئ', type: 'bar', dataPoints: 15 },
  ];

  const mechanisms: TradeMechanism[] = [
    {
      id: 'import_dependency',
      titleEn: 'Import Dependency Structure',
      titleAr: 'هيكل الاعتماد على الواردات',
      descriptionEn: "Yemen imports approximately 90% of its food and nearly all fuel. This extreme import dependency makes the economy highly vulnerable to exchange rate fluctuations, port access restrictions, and global commodity price shocks.",
      descriptionAr: "يستورد اليمن حوالي 90% من غذائه وكل الوقود تقريباً. هذا الاعتماد الشديد على الواردات يجعل الاقتصاد معرضاً بشدة لتقلبات سعر الصرف وقيود الوصول للموانئ وصدمات أسعار السلع العالمية.",
      type: 'yemen_specific',
      citation: 'World Bank Yemen Economic Monitor, 2023',
      linkedSectors: ['food-security', 'currency', 'prices'],
    },
    {
      id: 'port_split',
      titleEn: 'Dual Port System',
      titleAr: 'نظام الموانئ المزدوج',
      descriptionEn: 'Major ports are split between authorities: Aden (IRG-controlled) and Hodeidah (DFA-controlled). This creates parallel import channels, different tariff regimes, and competing customs systems.',
      descriptionAr: 'الموانئ الرئيسية مقسمة بين السلطات: عدن (تحت سيطرة الحكومة المعترف بها) والحديدة (تحت سيطرة سلطة الأمر الواقع). وهذا يخلق قنوات استيراد متوازية وأنظمة تعريفات مختلفة وأنظمة جمركية متنافسة.',
      type: 'port_specific',
      linkedSectors: ['macro'],
    },
  ];

  const contradictions: TradeContradiction[] = [
    {
      id: 'imports_2023',
      indicatorEn: 'Total Imports 2023',
      indicatorAr: 'إجمالي الواردات 2023',
      sources: [
        { name: 'UN Comtrade', value: '8.2B', date: 'Jun 2024' },
        { name: 'World Bank', value: '7.8B', date: 'Apr 2024' },
        { name: 'IMF', value: '8.5B', date: 'Mar 2024' },
      ],
      explanation: 'Different treatment of humanitarian imports and informal trade',
      explanationAr: 'معاملة مختلفة للواردات الإنسانية والتجارة غير الرسمية',
    },
  ];

  const vintages: TradeVintage[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ship className="h-7 w-7 text-cyan-600" />
            {isArabic ? "التجارة والموانئ" : "Trade & Ports"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic 
              ? "لوحة الذكاء التجاري - الواردات والصادرات والموانئ"
              : "Trade Intelligence Wall - Imports, exports, and port activity"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            {isArabic ? "تصدير" : "Export"}
          </Button>
          <Button variant="default" size="sm" className="bg-cyan-600 hover:bg-cyan-700">
            <FileText className="h-4 w-4 mr-1" />
            {isArabic ? "إنشاء تقرير" : "Generate Report"}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Day Feed */}
        <div className="lg:col-span-1">
          <TradeFeedPanel isArabic={isArabic} items={feedItems} />
        </div>

        {/* Right Column: KPIs */}
        <div className="lg:col-span-2">
          <TradeKpiPanel isArabic={isArabic} kpis={kpis} />
        </div>
      </div>

      {/* Charts Section */}
      <TradeChartsPanel 
        isArabic={isArabic} 
        charts={charts}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {/* Bottom Grid: Mechanism + Contradictions + Connected */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TradeMechanismPanel isArabic={isArabic} mechanisms={mechanisms} />
        <TradeContradictionsPanel 
          isArabic={isArabic} 
          contradictions={contradictions}
          vintages={vintages}
        />
        <TradeConnectedPanel isArabic={isArabic} />
      </div>
    </div>
  );
}
