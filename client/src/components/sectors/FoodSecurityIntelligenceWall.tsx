/**
 * FoodSecurityIntelligenceWall - Enhanced Food Security Sector Page Component
 * 
 * Implements the 6-panel "Intelligence Wall" for the Food Security sector:
 * - Panel A: Today/This Week Day Feed
 * - Panel B: Food Security KPIs (8 tiles max)
 * - Panel C: Long Arc 2010→Today Charts
 * - Panel D: Mechanism Explainer
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
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Clock,
  Newspaper,
  BarChart3,
  LineChart,
  Wheat,
  Apple,
  Droplets,
  Users,
  ShoppingCart,
  Truck,
  Network,
  Pin,
} from "lucide-react";
import EvidencePackButton from "@/components/EvidencePackButton";
import { RelatedInsightsPanel } from "@/components/RelatedInsights";

interface FoodSecurityIntelligenceWallProps {
  regime?: 'both' | 'aden_irg' | 'sanaa_dfa';
  isVip?: boolean;
}

// ============================================================================
// PANEL A: DAY FEED
// ============================================================================

interface DayFeedItem {
  id: number;
  title: string;
  titleAr: string;
  timestamp: string;
  source: string;
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
                <Wheat className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {item.isPinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" />}
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
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
// PANEL B: FOOD SECURITY KPIs
// ============================================================================

interface FoodSecurityKpi {
  code: string;
  titleEn: string;
  titleAr: string;
  value: number | null;
  unit: string;
  delta?: number;
  lastUpdated: string;
  confidence: 'high' | 'medium' | 'low' | 'proxy';
  evidencePackId?: number;
  isProxy?: boolean;
  icon: string;
}

function FoodSecurityKpiPanel({ isArabic, kpis }: { isArabic: boolean; kpis: FoodSecurityKpi[] }) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'wheat': return <Wheat className="h-4 w-4" />;
      case 'apple': return <Apple className="h-4 w-4" />;
      case 'droplets': return <Droplets className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'cart': return <ShoppingCart className="h-4 w-4" />;
      case 'truck': return <Truck className="h-4 w-4" />;
      default: return <Wheat className="h-4 w-4" />;
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
          {isArabic ? 'أهم 8 مؤشرات للأمن الغذائي مع روابط الأدلة' : 'Top 8 food security indicators with evidence links'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.slice(0, 8).map((kpi) => (
            <div key={kpi.code} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-100 text-amber-700">
                    {getIcon(kpi.icon)}
                  </div>
                  <h4 className="text-sm font-medium text-muted-foreground line-clamp-1">
                    {isArabic ? kpi.titleAr : kpi.titleEn}
                  </h4>
                </div>
                {kpi.isProxy && (
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
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
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  ) : kpi.delta < 0 ? (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  ) : null}
                  <span className={`text-xs font-medium ${
                    kpi.delta > 0 ? 'text-red-500' : kpi.delta < 0 ? 'text-green-500' : 'text-muted-foreground'
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
              {isArabic ? 'بيانات الأمن الغذائي من 2010 حتى اليوم' : 'Food security data from 2010 to today'}
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
          {/* Food Insecurity Chart */}
          <div className="p-4 rounded-lg border">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-red-600" />
              {isArabic ? 'انعدام الأمن الغذائي' : 'Food Insecurity'}
            </h4>
            <div className="h-48 flex items-end gap-1">
              {Array.from({ length: 15 }, (_, i) => {
                const year = 2010 + i;
                const height = Math.min(95, 30 + i * 4 + Math.random() * 10);
                const isSelected = year <= selectedYear;
                return (
                  <div
                    key={year}
                    className={`flex-1 rounded-t transition-all ${
                      isSelected ? 'bg-red-500' : 'bg-muted'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${year}: ${Math.round(height / 5)}M people`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>2010</span>
              <span>2024</span>
            </div>
          </div>

          {/* Wheat Imports Chart */}
          <div className="p-4 rounded-lg border">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Wheat className="h-4 w-4 text-amber-600" />
              {isArabic ? 'واردات القمح' : 'Wheat Imports'}
            </h4>
            <div className="h-48 flex items-end gap-1">
              {Array.from({ length: 15 }, (_, i) => {
                const year = 2010 + i;
                const height = Math.max(20, 70 - (i > 5 ? (i - 5) * 5 : 0) + Math.random() * 15);
                const isSelected = year <= selectedYear;
                return (
                  <div
                    key={year}
                    className={`flex-1 rounded-t transition-all ${
                      isSelected ? 'bg-amber-500' : 'bg-muted'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${year}: ${Math.round(height * 30)}K MT`}
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
      id: 'food_imports',
      titleEn: 'Import Dependency',
      titleAr: 'الاعتماد على الواردات',
      contentEn: 'Yemen imports over 90% of its staple foods. Port access, currency availability, and global prices directly impact food availability and affordability.',
      contentAr: 'يستورد اليمن أكثر من 90٪ من أغذيته الأساسية. يؤثر الوصول إلى الموانئ وتوفر العملة والأسعار العالمية بشكل مباشر على توفر الغذاء والقدرة على تحمل تكاليفه.',
    },
    {
      id: 'ipc_classification',
      titleEn: 'IPC Classification',
      titleAr: 'تصنيف IPC',
      contentEn: 'The Integrated Food Security Phase Classification (IPC) measures food insecurity on a 5-phase scale. Yemen has areas in Phase 4 (Emergency) and Phase 5 (Famine).',
      contentAr: 'يقيس التصنيف المرحلي المتكامل للأمن الغذائي (IPC) انعدام الأمن الغذائي على مقياس من 5 مراحل. لدى اليمن مناطق في المرحلة 4 (طوارئ) والمرحلة 5 (مجاعة).',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-primary" />
          {isArabic ? 'كيف يعمل الأمن الغذائي' : 'How Food Security Works'}
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
      indicatorNameEn: 'Food Insecure Population 2024',
      indicatorNameAr: 'السكان المعرضون لانعدام الأمن الغذائي 2024',
      sources: [
        { name: 'WFP', value: 17.4, date: 'Jan 2024' },
        { name: 'FAO', value: 18.2, date: 'Dec 2023' },
      ],
      reason: 'Different survey methodologies and timing',
      reasonAr: 'منهجيات مسح مختلفة وتوقيت مختلف',
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
                        <span className="font-medium">{s.value}M people</span>
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
          sourceId="food-security"
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

export function FoodSecurityIntelligenceWall({ regime = 'both', isVip = false }: FoodSecurityIntelligenceWallProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Mock data
  const mockDayFeed: DayFeedItem[] = [
    {
      id: 1,
      title: "WFP releases January food security update",
      titleAr: "برنامج الأغذية العالمي يصدر تحديث الأمن الغذائي لشهر يناير",
      timestamp: new Date().toISOString(),
      source: "WFP",
      sectorTags: ["Food Security", "IPC"],
      whyMatters: "17.4 million people facing food insecurity, slight increase from December",
      whyMattersAr: "17.4 مليون شخص يواجهون انعدام الأمن الغذائي، زيادة طفيفة عن ديسمبر",
      evidencePackId: 1,
      isPinned: true,
      changeType: "report_release"
    },
    {
      id: 2,
      title: "Wheat prices rise 8% in Sana'a markets",
      titleAr: "ارتفاع أسعار القمح 8٪ في أسواق صنعاء",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      source: "WFP mVAM",
      sectorTags: ["Prices", "Wheat"],
      whyMatters: "Currency depreciation and global price increases driving local inflation",
      whyMattersAr: "انخفاض قيمة العملة وارتفاع الأسعار العالمية يدفعان التضخم المحلي",
      evidencePackId: 2,
      changeType: "data_update"
    }
  ];
  
  const mockKpis: FoodSecurityKpi[] = [
    { code: "FOOD_INSECURE", titleEn: "Food Insecure", titleAr: "انعدام الأمن الغذائي", value: 17.4, unit: "M people", delta: 2.3, lastUpdated: "2024-01-15", confidence: "high", icon: "users" },
    { code: "IPC_PHASE4", titleEn: "IPC Phase 4+", titleAr: "المرحلة 4+ IPC", value: 5.1, unit: "M people", delta: 8.5, lastUpdated: "2024-01-15", confidence: "high", icon: "users" },
    { code: "WHEAT_PRICE", titleEn: "Wheat Price", titleAr: "سعر القمح", value: 850, unit: "YER/kg", delta: 12.0, lastUpdated: "2024-01-15", confidence: "high", icon: "wheat" },
    { code: "FOOD_BASKET", titleEn: "Food Basket", titleAr: "سلة الغذاء", value: 42500, unit: "YER", delta: 15.0, lastUpdated: "2024-01-15", confidence: "high", icon: "cart" },
    { code: "WHEAT_IMPORTS", titleEn: "Wheat Imports", titleAr: "واردات القمح", value: 2.8, unit: "M MT", delta: -5.0, lastUpdated: "2024-01-15", confidence: "medium", icon: "truck" },
    { code: "AID_REACH", titleEn: "Aid Reach", titleAr: "وصول المساعدات", value: 8.2, unit: "M people", delta: -12.0, lastUpdated: "2024-01-15", confidence: "medium", icon: "users" },
    { code: "MALNUTRITION", titleEn: "Acute Malnutrition", titleAr: "سوء التغذية الحاد", value: 2.2, unit: "M children", delta: 5.0, lastUpdated: "2024-01-15", confidence: "medium", icon: "apple" },
    { code: "WATER_ACCESS", titleEn: "Water Access", titleAr: "الوصول للمياه", value: 54, unit: "%", delta: -3.0, lastUpdated: "2024-01-15", confidence: "low", icon: "droplets" },
  ];
  
  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DayFeedPanel isArabic={isArabic} items={mockDayFeed} />
        </div>
        <div className="lg:col-span-2">
          <FoodSecurityKpiPanel isArabic={isArabic} kpis={mockKpis} />
        </div>
      </div>
      
      <LongArcChartsPanel 
        isArabic={isArabic} 
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MechanismExplainerPanel isArabic={isArabic} />
        <ContradictionsVintagesPanel isArabic={isArabic} />
      </div>
      
      <ConnectedIntelligencePanel isArabic={isArabic} />
    </div>
  );
}

export default FoodSecurityIntelligenceWall;
