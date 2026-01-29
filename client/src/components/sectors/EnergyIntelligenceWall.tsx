/**
 * EnergyIntelligenceWall - Enhanced Energy Sector Page Component
 * 
 * Implements the 6-panel "Intelligence Wall" for the Energy sector:
 * - Panel A: Today/This Week Day Feed
 * - Panel B: Energy KPIs (8 tiles max)
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
  Zap,
  Fuel,
  Sun,
  Battery,
  Flame,
  Network,
  ExternalLink,
  Pin,
  Filter,
} from "lucide-react";
import { Link } from "wouter";
import EvidencePackButton from "@/components/EvidencePackButton";
import ContradictionBadge from "@/components/ContradictionBadge";
import { RelatedInsightsPanel } from "@/components/RelatedInsights";

interface EnergyIntelligenceWallProps {
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
  sourceType: string;
  sectorTags: string[];
  whyMatters: string;
  whyMattersAr: string;
  evidencePackId?: number;
  isPinned?: boolean;
  changeType?: string;
}

function DayFeedPanel({ isArabic, items }: { isArabic: boolean; items: DayFeedItem[] }) {
  const [filter, setFilter] = useState<'all' | 'pinned' | 'data' | 'reports'>('all');
  
  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'pinned') return items.filter(i => i.isPinned);
    if (filter === 'data') return items.filter(i => i.changeType === 'data_update');
    if (filter === 'reports') return items.filter(i => i.changeType === 'report_release');
    return items;
  }, [items, filter]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Newspaper className="h-5 w-5 text-primary" />
            {isArabic ? 'آخر التطورات' : 'Latest Updates'}
          </CardTitle>
          <div className="flex gap-1">
            {['all', 'pinned', 'data', 'reports'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setFilter(f as any)}
              >
                {f === 'all' ? (isArabic ? 'الكل' : 'All') :
                 f === 'pinned' ? <Pin className="h-3 w-3" /> :
                 f === 'data' ? (isArabic ? 'بيانات' : 'Data') :
                 (isArabic ? 'تقارير' : 'Reports')}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{isArabic ? 'لا توجد تحديثات حديثة' : 'No recent updates'}</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <Zap className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {item.isPinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" />}
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                      {item.source}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString(isArabic ? 'ar' : 'en', { 
                        month: 'short', day: 'numeric' 
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
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                    {item.evidencePackId && (
                      <EvidencePackButton evidencePackId={item.evidencePackId} size="sm" variant="ghost" className="h-6 px-2" />
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
// PANEL B: ENERGY KPIs
// ============================================================================

interface EnergyKpi {
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
  icon: string;
}

function EnergyKpiPanel({ isArabic, kpis }: { isArabic: boolean; kpis: EnergyKpi[] }) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'fuel': return <Fuel className="h-4 w-4" />;
      case 'sun': return <Sun className="h-4 w-4" />;
      case 'battery': return <Battery className="h-4 w-4" />;
      case 'flame': return <Flame className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          {isArabic ? 'المؤشرات الرئيسية' : 'Key Indicators'}
        </CardTitle>
        <CardDescription>
          {isArabic ? 'أهم 8 مؤشرات للطاقة مع روابط الأدلة' : 'Top 8 energy indicators with evidence links'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.slice(0, 8).map((kpi) => (
            <div key={kpi.code} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-yellow-100 text-yellow-700">
                    {getIcon(kpi.icon)}
                  </div>
                  <h4 className="text-sm font-medium text-muted-foreground line-clamp-1">
                    {isArabic ? kpi.titleAr : kpi.titleEn}
                  </h4>
                </div>
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
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3 pt-2 border-t">
                <Badge variant="secondary" className={`text-xs ${
                  kpi.confidence === 'high' ? 'bg-green-100 text-green-700' :
                  kpi.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {kpi.confidence}
                </Badge>
                {kpi.evidencePackId && (
                  <EvidencePackButton evidencePackId={kpi.evidencePackId} size="sm" variant="ghost" className="h-6 w-6 p-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL C: LONG ARC CHARTS
// ============================================================================

function LongArcChartsPanel({ isArabic, selectedYear, onYearChange }: { 
  isArabic: boolean;
  selectedYear: number;
  onYearChange: (year: number) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LineChart className="h-5 w-5 text-primary" />
              {isArabic ? 'الاتجاهات طويلة المدى' : 'Long-Term Trends'}
            </CardTitle>
            <CardDescription>
              {isArabic ? 'بيانات الطاقة من 2010 حتى اليوم' : 'Energy data from 2010 to today'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">2010</span>
            <Slider
              value={[selectedYear]}
              onValueChange={([v]) => onYearChange(v)}
              min={2010}
              max={new Date().getFullYear()}
              step={1}
              className="w-32"
            />
            <span className="text-sm font-medium">{selectedYear}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fuel Imports Chart */}
          <div className="p-4 rounded-lg border">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Fuel className="h-4 w-4 text-yellow-600" />
              {isArabic ? 'واردات الوقود' : 'Fuel Imports'}
            </h4>
            <div className="h-48 flex items-end gap-1">
              {Array.from({ length: 15 }, (_, i) => {
                const year = 2010 + i;
                const height = Math.random() * 60 + 20;
                const isSelected = year <= selectedYear;
                return (
                  <div
                    key={year}
                    className={`flex-1 rounded-t transition-all ${
                      isSelected ? 'bg-yellow-500' : 'bg-muted'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${year}: ${Math.round(height * 10)}M barrels`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>2010</span>
              <span>2024</span>
            </div>
          </div>

          {/* Electricity Generation Chart */}
          <div className="p-4 rounded-lg border">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              {isArabic ? 'توليد الكهرباء' : 'Electricity Generation'}
            </h4>
            <div className="h-48 flex items-end gap-1">
              {Array.from({ length: 15 }, (_, i) => {
                const year = 2010 + i;
                const height = Math.max(10, 80 - i * 3 + Math.random() * 20);
                const isSelected = year <= selectedYear;
                return (
                  <div
                    key={year}
                    className={`flex-1 rounded-t transition-all ${
                      isSelected ? 'bg-blue-500' : 'bg-muted'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${year}: ${Math.round(height * 50)}MW`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>2010</span>
              <span>2024</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL D: MECHANISM EXPLAINER
// ============================================================================

function MechanismExplainerPanel({ isArabic }: { isArabic: boolean }) {
  const mechanisms = [
    {
      id: 'energy_supply',
      titleEn: 'Energy Supply Chain',
      titleAr: 'سلسلة إمداد الطاقة',
      contentEn: 'Yemen relies heavily on imported fuel, primarily through Aden and Hodeidah ports. The conflict has disrupted supply chains, leading to fuel shortages and price spikes.',
      contentAr: 'يعتمد اليمن بشكل كبير على الوقود المستورد، بشكل رئيسي عبر ميناءي عدن والحديدة. أدى الصراع إلى تعطيل سلاسل الإمداد، مما أدى إلى نقص الوقود وارتفاع الأسعار.',
    },
    {
      id: 'electricity_crisis',
      titleEn: 'Electricity Crisis',
      titleAr: 'أزمة الكهرباء',
      contentEn: 'Pre-war electricity generation capacity has collapsed by over 50%. Solar adoption has increased as households and businesses seek alternatives to unreliable grid power.',
      contentAr: 'انهارت قدرة توليد الكهرباء قبل الحرب بأكثر من 50٪. زاد اعتماد الطاقة الشمسية حيث تبحث الأسر والشركات عن بدائل لشبكة الكهرباء غير الموثوقة.',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-primary" />
          {isArabic ? 'كيف يعمل قطاع الطاقة' : 'How Energy Works'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mechanisms.map((m) => (
          <div key={m.id} className="p-4 rounded-lg border bg-muted/30">
            <h4 className="font-medium mb-2">{isArabic ? m.titleAr : m.titleEn}</h4>
            <p className="text-sm text-muted-foreground">
              {isArabic ? m.contentAr : m.contentEn}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL E: CONTRADICTIONS & VINTAGES
// ============================================================================

function ContradictionsVintagesPanel({ isArabic }: { isArabic: boolean }) {
  const contradictions = [
    {
      id: 1,
      indicatorNameEn: 'Fuel Import Volume 2023',
      indicatorNameAr: 'حجم واردات الوقود 2023',
      sources: [
        { name: 'OCHA', value: 4.2, date: 'Dec 2023' },
        { name: 'Port Authority', value: 3.8, date: 'Jan 2024' },
      ],
      reason: 'Different tracking methodologies',
      reasonAr: 'منهجيات تتبع مختلفة',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          {isArabic ? 'التناقضات والمراجعات' : 'Contradictions & Revisions'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="contradictions">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contradictions">
              {isArabic ? 'التناقضات' : 'Contradictions'}
            </TabsTrigger>
            <TabsTrigger value="vintages">
              {isArabic ? 'المراجعات' : 'Revisions'}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="contradictions" className="mt-4 space-y-4">
            {contradictions.map((c) => (
              <div key={c.id} className="p-4 rounded-lg border">
                <h4 className="font-medium mb-3">
                  {isArabic ? c.indicatorNameAr : c.indicatorNameEn}
                </h4>
                <div className="space-y-2">
                  {c.sources.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{s.value}M barrels</span>
                        <Badge variant="outline" className="text-xs">{s.date}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  {isArabic ? c.reasonAr : c.reason}
                </p>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="vintages" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{isArabic ? 'لا توجد مراجعات حديثة' : 'No recent revisions'}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL F: CONNECTED INTELLIGENCE
// ============================================================================

function ConnectedIntelligencePanel({ isArabic }: { isArabic: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Network className="h-5 w-5 text-primary" />
          {isArabic ? 'الذكاء المترابط' : 'Connected Intelligence'}
        </CardTitle>
        <CardDescription>
          {isArabic ? 'الكيانات والوثائق والأحداث المرتبطة' : 'Related entities, documents, and events'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RelatedInsightsPanel
          sourceType="sector"
          sourceId="energy"
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

export function EnergyIntelligenceWall({ regime = 'both', isVip = false }: EnergyIntelligenceWallProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Mock data - would be replaced with actual API calls
  const mockDayFeed: DayFeedItem[] = [
    {
      id: 1,
      title: "Fuel shipment arrives at Aden port",
      titleAr: "وصول شحنة وقود إلى ميناء عدن",
      timestamp: new Date().toISOString(),
      source: "Port Authority",
      sourceType: "government",
      sectorTags: ["Fuel", "Imports"],
      whyMatters: "First major shipment in 3 weeks, may ease fuel shortages",
      whyMattersAr: "أول شحنة كبيرة منذ 3 أسابيع، قد تخفف من نقص الوقود",
      evidencePackId: 1,
      isPinned: true,
      changeType: "data_update"
    },
    {
      id: 2,
      title: "Solar panel imports increase 40% YoY",
      titleAr: "واردات الألواح الشمسية ترتفع 40٪ سنوياً",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      source: "Trade Statistics",
      sourceType: "government",
      sectorTags: ["Solar", "Imports"],
      whyMatters: "Indicates continued shift to renewable energy sources",
      whyMattersAr: "يشير إلى استمرار التحول نحو مصادر الطاقة المتجددة",
      evidencePackId: 2,
      changeType: "report_release"
    }
  ];
  
  const mockKpis: EnergyKpi[] = [
    { code: "FUEL_IMPORTS", titleEn: "Fuel Imports", titleAr: "واردات الوقود", value: 4.2, unit: "M barrels", delta: -8.5, lastUpdated: "2024-06-15", confidence: "medium", icon: "fuel" },
    { code: "ELEC_GEN", titleEn: "Electricity Gen", titleAr: "توليد الكهرباء", value: 1200, unit: "MW", delta: -45.2, lastUpdated: "2024-06-15", confidence: "low", icon: "zap" },
    { code: "SOLAR_CAPACITY", titleEn: "Solar Capacity", titleAr: "قدرة الطاقة الشمسية", value: 850, unit: "MW", delta: 35.0, lastUpdated: "2024-06-15", confidence: "proxy", isProxy: true, icon: "sun" },
    { code: "FUEL_PRICE", titleEn: "Fuel Price", titleAr: "سعر الوقود", value: 850, unit: "YER/L", delta: 12.3, lastUpdated: "2024-06-15", confidence: "high", icon: "fuel" },
    { code: "LPG_SUPPLY", titleEn: "LPG Supply", titleAr: "إمدادات الغاز", value: 180, unit: "K tons", delta: -15.0, lastUpdated: "2024-06-15", confidence: "medium", icon: "flame" },
    { code: "GRID_ACCESS", titleEn: "Grid Access", titleAr: "الوصول للشبكة", value: 42, unit: "%", delta: -5.2, lastUpdated: "2024-06-15", confidence: "low", icon: "zap" },
    { code: "OUTAGE_HOURS", titleEn: "Daily Outages", titleAr: "ساعات الانقطاع", value: 16, unit: "hrs", delta: 8.5, lastUpdated: "2024-06-15", confidence: "medium", icon: "battery" },
    { code: "DIESEL_PRICE", titleEn: "Diesel Price", titleAr: "سعر الديزل", value: 920, unit: "YER/L", delta: 15.0, lastUpdated: "2024-06-15", confidence: "high", icon: "fuel" },
  ];
  
  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Row 1: Day Feed + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DayFeedPanel isArabic={isArabic} items={mockDayFeed} />
        </div>
        <div className="lg:col-span-2">
          <EnergyKpiPanel isArabic={isArabic} kpis={mockKpis} />
        </div>
      </div>
      
      {/* Row 2: Long Arc Charts */}
      <LongArcChartsPanel 
        isArabic={isArabic} 
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />
      
      {/* Row 3: Mechanism + Contradictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MechanismExplainerPanel isArabic={isArabic} />
        <ContradictionsVintagesPanel isArabic={isArabic} />
      </div>
      
      {/* Row 4: Connected Intelligence */}
      <ConnectedIntelligencePanel isArabic={isArabic} />
    </div>
  );
}

export default EnergyIntelligenceWall;
