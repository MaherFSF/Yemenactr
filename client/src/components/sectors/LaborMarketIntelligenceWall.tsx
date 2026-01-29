/**
 * LaborMarketIntelligenceWall - Enhanced Labor Market Sector Page Component
 * 
 * Implements the 6-panel "Intelligence Wall" for the Labor Market sector:
 * - Panel A: Today/This Week Day Feed
 * - Panel B: Labor Market KPIs (8 tiles max)
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
  Users,
  Briefcase,
  GraduationCap,
  Building,
  Banknote,
  UserX,
  Network,
  Pin,
  Factory,
  Wallet,
} from "lucide-react";
import EvidencePackButton from "@/components/EvidencePackButton";
import { RelatedInsightsPanel } from "@/components/RelatedInsights";

interface LaborMarketIntelligenceWallProps {
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
                <Briefcase className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {item.isPinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" />}
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
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
// PANEL B: LABOR MARKET KPIs
// ============================================================================

interface LaborMarketKpi {
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

function LaborMarketKpiPanel({ isArabic, kpis }: { isArabic: boolean; kpis: LaborMarketKpi[] }) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'users': return <Users className="h-4 w-4" />;
      case 'briefcase': return <Briefcase className="h-4 w-4" />;
      case 'graduation': return <GraduationCap className="h-4 w-4" />;
      case 'building': return <Building className="h-4 w-4" />;
      case 'banknote': return <Banknote className="h-4 w-4" />;
      case 'userx': return <UserX className="h-4 w-4" />;
      case 'factory': return <Factory className="h-4 w-4" />;
      case 'wallet': return <Wallet className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
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
          {isArabic ? 'أهم 8 مؤشرات لسوق العمل مع روابط الأدلة' : 'Top 8 labor market indicators with evidence links'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.slice(0, 8).map((kpi) => (
            <div key={kpi.code} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-100 text-purple-700">
                    {getIcon(kpi.icon)}
                  </div>
                  <h4 className="text-sm font-medium text-muted-foreground line-clamp-1">
                    {isArabic ? kpi.titleAr : kpi.titleEn}
                  </h4>
                </div>
                {kpi.isProxy && (
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
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
              {isArabic ? 'بيانات سوق العمل من 2010 حتى اليوم' : 'Labor market data from 2010 to today'}
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
          {/* Unemployment Rate Chart */}
          <div className="p-4 rounded-lg border">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-600" />
              {isArabic ? 'معدل البطالة' : 'Unemployment Rate'}
            </h4>
            <div className="h-48 flex items-end gap-1">
              {Array.from({ length: 15 }, (_, i) => {
                const year = 2010 + i;
                const height = Math.min(90, 25 + (i > 5 ? (i - 5) * 6 : 0) + Math.random() * 10);
                const isSelected = year <= selectedYear;
                return (
                  <div
                    key={year}
                    className={`flex-1 rounded-t transition-all ${
                      isSelected ? 'bg-red-500' : 'bg-muted'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${year}: ${Math.round(height / 3)}%`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>2010</span>
              <span>2024</span>
            </div>
          </div>

          {/* Public Sector Employment Chart */}
          <div className="p-4 rounded-lg border">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-600" />
              {isArabic ? 'التوظيف الحكومي' : 'Public Sector Employment'}
            </h4>
            <div className="h-48 flex items-end gap-1">
              {Array.from({ length: 15 }, (_, i) => {
                const year = 2010 + i;
                const height = Math.max(30, 70 - (i > 5 ? (i - 5) * 3 : 0) + Math.random() * 10);
                const isSelected = year <= selectedYear;
                return (
                  <div
                    key={year}
                    className={`flex-1 rounded-t transition-all ${
                      isSelected ? 'bg-purple-500' : 'bg-muted'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${year}: ${Math.round(height * 15)}K employees`}
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
      id: 'labor_crisis',
      titleEn: 'Labor Market Crisis',
      titleAr: 'أزمة سوق العمل',
      contentEn: 'The conflict has devastated Yemen\'s labor market. Public sector salary payments are irregular, private sector has contracted, and youth unemployment exceeds 50%.',
      contentAr: 'دمر الصراع سوق العمل في اليمن. مدفوعات رواتب القطاع العام غير منتظمة، وتقلص القطاع الخاص، وتتجاوز بطالة الشباب 50٪.',
    },
    {
      id: 'dual_authority',
      titleEn: 'Dual Authority Impact',
      titleAr: 'تأثير السلطة المزدوجة',
      contentEn: 'The split between IRG and DFA has created parallel public sectors. Many civil servants haven\'t received regular salaries since 2016.',
      contentAr: 'أدى الانقسام بين الحكومة الشرعية وسلطة الأمر الواقع إلى إنشاء قطاعين عامين متوازيين. لم يتلق العديد من موظفي الخدمة المدنية رواتب منتظمة منذ 2016.',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-primary" />
          {isArabic ? 'كيف يعمل سوق العمل' : 'How Labor Market Works'}
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
      indicatorNameEn: 'Unemployment Rate 2023',
      indicatorNameAr: 'معدل البطالة 2023',
      sources: [
        { name: 'ILO', value: 32, date: 'Est. 2023' },
        { name: 'World Bank', value: 28, date: 'Est. 2023' },
      ],
      reason: 'Different estimation methodologies due to lack of surveys',
      reasonAr: 'منهجيات تقدير مختلفة بسبب عدم وجود مسوحات',
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
                        <span className="font-medium">{s.value}%</span>
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
          sourceId="labor"
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

export function LaborMarketIntelligenceWall({ regime = 'both', isVip = false }: LaborMarketIntelligenceWallProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Mock data
  const mockDayFeed: DayFeedItem[] = [
    {
      id: 1,
      title: "IRG announces partial salary payment for civil servants",
      titleAr: "الحكومة الشرعية تعلن عن دفع جزئي لرواتب موظفي الخدمة المدنية",
      timestamp: new Date().toISOString(),
      source: "Government",
      sectorTags: ["Salaries", "Public Sector"],
      whyMatters: "First payment in 3 months, covers 50% of December salaries",
      whyMattersAr: "أول دفعة منذ 3 أشهر، تغطي 50٪ من رواتب ديسمبر",
      evidencePackId: 1,
      isPinned: true,
      changeType: "data_update"
    },
    {
      id: 2,
      title: "ILO releases Yemen labor market assessment",
      titleAr: "منظمة العمل الدولية تصدر تقييم سوق العمل في اليمن",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      source: "ILO",
      sectorTags: ["Employment", "Assessment"],
      whyMatters: "Estimates 32% unemployment, 50%+ youth unemployment",
      whyMattersAr: "تقدر البطالة بـ 32٪، وبطالة الشباب بأكثر من 50٪",
      evidencePackId: 2,
      changeType: "report_release"
    }
  ];
  
  const mockKpis: LaborMarketKpi[] = [
    { code: "UNEMPLOYMENT", titleEn: "Unemployment", titleAr: "البطالة", value: 32, unit: "%", delta: 8.5, lastUpdated: "2024-01-15", confidence: "low", isProxy: true, icon: "userx" },
    { code: "YOUTH_UNEMP", titleEn: "Youth Unemployment", titleAr: "بطالة الشباب", value: 52, unit: "%", delta: 12.0, lastUpdated: "2024-01-15", confidence: "low", isProxy: true, icon: "graduation" },
    { code: "PUBLIC_SECTOR", titleEn: "Public Employees", titleAr: "موظفو القطاع العام", value: 1.2, unit: "M", delta: -5.0, lastUpdated: "2024-01-15", confidence: "medium", icon: "building" },
    { code: "SALARY_ARREARS", titleEn: "Salary Arrears", titleAr: "متأخرات الرواتب", value: 24, unit: "months", delta: 2.0, lastUpdated: "2024-01-15", confidence: "medium", icon: "banknote" },
    { code: "PRIVATE_SECTOR", titleEn: "Private Sector", titleAr: "القطاع الخاص", value: 35, unit: "% of pre-war", delta: -15.0, lastUpdated: "2024-01-15", confidence: "low", isProxy: true, icon: "factory" },
    { code: "LABOR_FORCE", titleEn: "Labor Force", titleAr: "القوى العاملة", value: 7.8, unit: "M", delta: -2.0, lastUpdated: "2024-01-15", confidence: "low", icon: "users" },
    { code: "AVG_WAGE", titleEn: "Avg. Public Wage", titleAr: "متوسط الراتب العام", value: 85000, unit: "YER", delta: -45.0, lastUpdated: "2024-01-15", confidence: "medium", icon: "wallet" },
    { code: "INFORMAL", titleEn: "Informal Sector", titleAr: "القطاع غير الرسمي", value: 65, unit: "%", delta: 20.0, lastUpdated: "2024-01-15", confidence: "low", isProxy: true, icon: "briefcase" },
  ];
  
  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DayFeedPanel isArabic={isArabic} items={mockDayFeed} />
        </div>
        <div className="lg:col-span-2">
          <LaborMarketKpiPanel isArabic={isArabic} kpis={mockKpis} />
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

export default LaborMarketIntelligenceWall;
