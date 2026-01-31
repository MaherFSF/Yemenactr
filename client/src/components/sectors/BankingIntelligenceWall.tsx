/**
 * BankingIntelligenceWall - Enhanced Banking Sector Page Component
 * 
 * Implements the 6-panel "Intelligence Wall" for the Banking & Finance sector:
 * - Panel A: Today/This Week Banking News Feed
 * - Panel B: Banking KPIs (8 tiles max)
 * - Panel C: Long Arc 2010→Today Charts
 * - Panel D: Banking Mechanism Explainer
 * - Panel E: Contradictions & Vintages
 * - Panel F: Connected Intelligence
 */

import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Landmark,
  Wallet,
  CreditCard,
  DollarSign,
  PiggyBank,
  GitCompare,
  Network,
  ExternalLink,
  Pin,
  Filter,
  Shield,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { Link } from "wouter";
import EvidencePackButton from "@/components/EvidencePackButton";
import ContradictionBadge from "@/components/ContradictionBadge";
import { SectorKpiCard } from "./SectorKpiCard";
import { SectorChart } from "./SectorChart";
import { RelatedInsightsPanel } from "@/components/RelatedInsights";

interface BankingIntelligenceWallProps {
  regime?: 'both' | 'aden_irg' | 'sanaa_dfa';
  isVip?: boolean;
}

// ============================================================================
// PANEL A: TODAY/THIS WEEK BANKING NEWS FEED
// ============================================================================

interface BankingFeedItem {
  id: number;
  title: string;
  titleAr: string;
  timestamp: string;
  source: string;
  sourceType: 'cby' | 'imf' | 'world_bank' | 'commercial_bank' | 'regulator' | 'media' | 'other';
  bankTags: string[];
  whyMatters: string;
  whyMattersAr: string;
  evidencePackId?: number;
  isPinned?: boolean;
  changeType?: 'rate_change' | 'directive' | 'bank_action' | 'policy' | 'sanction' | 'merger';
}

function BankingFeedPanel({ isArabic, items, onPin }: { 
  isArabic: boolean; 
  items: BankingFeedItem[];
  onPin?: (id: number) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'pinned' | 'cby' | 'banks'>('all');
  
  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'pinned') return items.filter(i => i.isPinned);
    if (filter === 'cby') return items.filter(i => i.sourceType === 'cby' || i.changeType === 'directive');
    if (filter === 'banks') return items.filter(i => i.sourceType === 'commercial_bank');
    return items;
  }, [items, filter]);

  const sourceColors: Record<string, string> = {
    cby: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    imf: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    world_bank: 'bg-[#DADED8] text-[#2a3a28] dark:bg-blue-900 dark:text-blue-200',
    commercial_bank: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    regulator: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    media: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    other: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-emerald-600" />
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
              <SelectItem value="cby">{isArabic ? "البنك المركزي" : "CBY"}</SelectItem>
              <SelectItem value="banks">{isArabic ? "البنوك" : "Banks"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          {isArabic 
            ? "آخر التحديثات والأخبار المتعلقة بالقطاع المصرفي"
            : "Latest updates and news related to the banking sector"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className={`p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
              item.isPinned ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20' : ''
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
                  {item.bankTags.map(tag => (
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
                    className={`h-6 px-2 ${item.isPinned ? 'text-emerald-600' : ''}`}
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
// PANEL B: BANKING KPIs (8 TILES MAX)
// ============================================================================

interface BankingKpi {
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
  proxyNote?: string;
  proxyNoteAr?: string;
  icon?: React.ReactNode;
  regime?: 'aden' | 'sanaa' | 'both';
}

function BankingKpiPanel({ isArabic, kpis }: { isArabic: boolean; kpis: BankingKpi[] }) {
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
          <Landmark className="h-5 w-5 text-emerald-600" />
          <CardTitle className="text-lg">
            {isArabic ? "المؤشرات الرئيسية" : "Key Indicators"}
          </CardTitle>
        </div>
        <CardDescription>
          {isArabic 
            ? "أهم 8 مؤشرات للقطاع المصرفي مع روابط الأدلة"
            : "Top 8 banking sector indicators with evidence links"}
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
                    {kpi.regime && kpi.regime !== 'both' && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {kpi.regime === 'aden' ? (isArabic ? 'عدن' : 'Aden') : (isArabic ? 'صنعاء' : "Sana'a")}
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

interface BankingChartData {
  id: string;
  titleEn: string;
  titleAr: string;
  type: 'line' | 'bar' | 'area' | 'stacked';
  dataPoints: number;
  evidencePackId?: string;
}

function BankingChartsPanel({ isArabic, charts, selectedYear, onYearChange }: {
  isArabic: boolean;
  charts: BankingChartData[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}) {
  const [activeChart, setActiveChart] = useState(charts[0]?.id || 'reserves');

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">
              {isArabic ? "المسار الطويل 2010→اليوم" : "Long Arc 2010→Today"}
            </CardTitle>
          </div>
        </div>
        <CardDescription>
          {isArabic 
            ? "الاتجاهات التاريخية للقطاع المصرفي"
            : "Historical trends in the banking sector"}
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
// PANEL D: BANKING MECHANISM EXPLAINER
// ============================================================================

interface BankingMechanism {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  type: 'conceptual' | 'yemen_specific' | 'regulatory';
  citation?: string;
  linkedSectors?: string[];
}

function BankingMechanismPanel({ isArabic, mechanisms }: { 
  isArabic: boolean; 
  mechanisms: BankingMechanism[];
}) {
  const typeColors = {
    conceptual: 'bg-[#DADED8] text-[#2a3a28] dark:bg-blue-900 dark:text-blue-200',
    yemen_specific: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    regulatory: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  };

  const typeLabels = {
    conceptual: { en: 'Conceptual', ar: 'مفاهيمي' },
    yemen_specific: { en: 'Yemen-Specific', ar: 'خاص باليمن' },
    regulatory: { en: 'Regulatory', ar: 'تنظيمي' },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          <CardTitle className="text-lg">
            {isArabic ? "كيف يعمل القطاع المصرفي" : "How Banking Works"}
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
              <p className="text-xs text-muted-foreground italic border-l-2 border-emerald-500 pl-2">
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

interface BankingContradiction {
  id: string;
  indicatorEn: string;
  indicatorAr: string;
  sources: { name: string; value: string | number; date: string }[];
  explanation?: string;
  explanationAr?: string;
}

interface BankingVintage {
  id: string;
  indicatorEn: string;
  indicatorAr: string;
  revisions: { date: string; oldValue: string | number; newValue: string | number; reason?: string }[];
}

function BankingContradictionsPanel({ 
  isArabic, 
  contradictions, 
  vintages 
}: { 
  isArabic: boolean; 
  contradictions: BankingContradiction[];
  vintages: BankingVintage[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-emerald-600" />
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

function BankingConnectedPanel({ isArabic }: { isArabic: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-emerald-600" />
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
          sourceId="banking"
          maxItems={6}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BankingIntelligenceWall({ regime = 'both', isVip = false }: BankingIntelligenceWallProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [selectedYear, setSelectedYear] = useState(2026);

  // Mock data for Banking sector
  const feedItems: BankingFeedItem[] = [
    {
      id: 1,
      title: "CBY Aden Issues New Directive on Bank Liquidity Requirements",
      titleAr: "البنك المركزي في عدن يصدر توجيهاً جديداً بشأن متطلبات السيولة المصرفية",
      timestamp: new Date().toISOString(),
      source: "CBY Aden",
      sourceType: 'cby',
      bankTags: ['Liquidity', 'Regulation'],
      whyMatters: "First liquidity directive since 2022, affects all commercial banks",
      whyMattersAr: "أول توجيه للسيولة منذ 2022، يؤثر على جميع البنوك التجارية",
      isPinned: true,
      changeType: 'directive',
    },
    {
      id: 2,
      title: "IMF Article IV Consultation Highlights Banking Sector Fragility",
      titleAr: "مشاورات المادة الرابعة لصندوق النقد الدولي تسلط الضوء على هشاشة القطاع المصرفي",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      source: "IMF",
      sourceType: 'imf',
      bankTags: ['Assessment', 'Risk'],
      whyMatters: "Comprehensive assessment of banking system health and recommendations",
      whyMattersAr: "تقييم شامل لصحة النظام المصرفي والتوصيات",
      changeType: 'policy',
    },
  ];

  const kpis: BankingKpi[] = [
    {
      id: 'reserves',
      nameEn: 'CBY Foreign Reserves',
      nameAr: 'احتياطيات البنك المركزي الأجنبية',
      value: '1.2',
      unit: 'B USD',
      unitAr: 'مليار دولار',
      change: -15.3,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'medium',
      lastUpdated: '2024-06-01',
      icon: <DollarSign className="h-4 w-4 text-emerald-600" />,
      regime: 'aden',
    },
    {
      id: 'money_supply',
      nameEn: 'Money Supply (M2)',
      nameAr: 'عرض النقود (M2)',
      value: '6.8',
      unit: 'T YER',
      unitAr: 'تريليون ريال',
      change: 12.5,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'medium',
      lastUpdated: '2024-03-01',
      icon: <Banknote className="h-4 w-4 text-emerald-600" />,
    },
    {
      id: 'bank_assets',
      nameEn: 'Total Bank Assets',
      nameAr: 'إجمالي أصول البنوك',
      value: '18.7',
      unit: 'B USD',
      unitAr: 'مليار دولار',
      change: -2.1,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'medium',
      lastUpdated: '2024-06-01',
      icon: <Building2 className="h-4 w-4 text-emerald-600" />,
    },
    {
      id: 'npl_ratio',
      nameEn: 'Non-Performing Loans',
      nameAr: 'القروض المتعثرة',
      value: '45',
      unit: '%',
      unitAr: '%',
      change: 5.2,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'low',
      lastUpdated: '2024-03-01',
      icon: <AlertCircle className="h-4 w-4 text-red-600" />,
    },
    {
      id: 'deposit_growth',
      nameEn: 'Deposit Growth',
      nameAr: 'نمو الودائع',
      value: '-8.5',
      unit: '%',
      unitAr: '%',
      confidence: 'medium',
      lastUpdated: '2024-06-01',
      icon: <PiggyBank className="h-4 w-4 text-emerald-600" />,
    },
    {
      id: 'credit_growth',
      nameEn: 'Credit to Private Sector',
      nameAr: 'الائتمان للقطاع الخاص',
      value: '-12.3',
      unit: '%',
      unitAr: '%',
      confidence: 'medium',
      lastUpdated: '2024-06-01',
      icon: <CreditCard className="h-4 w-4 text-emerald-600" />,
    },
    {
      id: 'bank_branches',
      nameEn: 'Operational Branches',
      nameAr: 'الفروع العاملة',
      value: '487',
      unit: 'branches',
      unitAr: 'فرع',
      change: -8,
      changeLabel: 'vs 2023',
      changeLabelAr: 'مقارنة بـ 2023',
      confidence: 'high',
      lastUpdated: '2024-09-01',
      icon: <Building2 className="h-4 w-4 text-emerald-600" />,
    },
    {
      id: 'sanctions_exposure',
      nameEn: 'Banks Under Sanctions',
      nameAr: 'البنوك تحت العقوبات',
      value: '3',
      unit: 'banks',
      unitAr: 'بنوك',
      confidence: 'high',
      lastUpdated: '2024-09-01',
      icon: <Shield className="h-4 w-4 text-red-600" />,
    },
  ];

  const charts: BankingChartData[] = [
    { id: 'reserves', titleEn: 'Foreign Reserves', titleAr: 'الاحتياطيات الأجنبية', type: 'area', dataPoints: 15 },
    { id: 'money_supply', titleEn: 'Money Supply', titleAr: 'عرض النقود', type: 'line', dataPoints: 15 },
    { id: 'deposits', titleEn: 'Bank Deposits', titleAr: 'الودائع المصرفية', type: 'bar', dataPoints: 15 },
  ];

  const mechanisms: BankingMechanism[] = [
    {
      id: 'dual_cby',
      titleEn: 'Dual Central Bank System',
      titleAr: 'نظام البنك المركزي المزدوج',
      descriptionEn: "Yemen operates with two competing central banks since 2016: CBY Aden (internationally recognized) and CBY Sana'a (de facto authority in north). This creates parallel monetary policies, currency variants, and regulatory frameworks.",
      descriptionAr: "يعمل اليمن ببنكين مركزيين متنافسين منذ 2016: البنك المركزي في عدن (المعترف به دولياً) والبنك المركزي في صنعاء (السلطة الفعلية في الشمال). وهذا يخلق سياسات نقدية متوازية ومتغيرات للعملة وأطر تنظيمية.",
      type: 'yemen_specific',
      citation: 'World Bank Yemen Economic Monitor, 2023',
      linkedSectors: ['currency', 'macro'],
    },
    {
      id: 'liquidity_crisis',
      titleEn: 'Banking Liquidity Crisis',
      titleAr: 'أزمة السيولة المصرفية',
      descriptionEn: 'Commercial banks face severe liquidity constraints due to deposit flight, loan defaults, and limited access to CBY facilities. Many banks operate with minimal reserves and restricted lending capacity.',
      descriptionAr: 'تواجه البنوك التجارية قيوداً حادة على السيولة بسبب هروب الودائع وتعثر القروض ومحدودية الوصول إلى تسهيلات البنك المركزي. تعمل العديد من البنوك باحتياطيات ضئيلة وقدرة إقراض محدودة.',
      type: 'yemen_specific',
      linkedSectors: ['macro'],
    },
  ];

  const contradictions: BankingContradiction[] = [
    {
      id: 'reserves_2024',
      indicatorEn: 'Foreign Reserves Estimate 2024',
      indicatorAr: 'تقدير الاحتياطيات الأجنبية 2024',
      sources: [
        { name: 'CBY Aden', value: '1.2B', date: 'Jun 2024' },
        { name: 'IMF', value: '0.8B', date: 'Apr 2024' },
        { name: 'World Bank', value: '1.0B', date: 'Mar 2024' },
      ],
      explanation: 'Different methodologies for counting Saudi deposit and swap arrangements',
      explanationAr: 'منهجيات مختلفة لاحتساب الودائع السعودية وترتيبات المبادلة',
    },
  ];

  const vintages: BankingVintage[] = [
    {
      id: 'npl_revision',
      indicatorEn: 'NPL Ratio Revision',
      indicatorAr: 'مراجعة نسبة القروض المتعثرة',
      revisions: [
        { date: 'Jun 2024', oldValue: '38%', newValue: '45%', reason: 'Updated classification' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="h-7 w-7 text-emerald-600" />
            {isArabic ? "القطاع المصرفي والمالي" : "Banking & Finance Sector"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic 
              ? "لوحة الذكاء المصرفي - البنوك المركزية والتجارية والسيولة"
              : "Banking Intelligence Wall - Central banks, commercial banks, and liquidity"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            {isArabic ? "تصدير" : "Export"}
          </Button>
          <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <FileText className="h-4 w-4 mr-1" />
            {isArabic ? "إنشاء تقرير" : "Generate Report"}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Day Feed */}
        <div className="lg:col-span-1">
          <BankingFeedPanel isArabic={isArabic} items={feedItems} />
        </div>

        {/* Right Column: KPIs */}
        <div className="lg:col-span-2">
          <BankingKpiPanel isArabic={isArabic} kpis={kpis} />
        </div>
      </div>

      {/* Charts Section */}
      <BankingChartsPanel 
        isArabic={isArabic} 
        charts={charts}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {/* Bottom Grid: Mechanism + Contradictions + Connected */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BankingMechanismPanel isArabic={isArabic} mechanisms={mechanisms} />
        <BankingContradictionsPanel 
          isArabic={isArabic} 
          contradictions={contradictions}
          vintages={vintages}
        />
        <BankingConnectedPanel isArabic={isArabic} />
      </div>
    </div>
  );
}
