/**
 * PricesIntelligenceWall - Prices & Cost of Living Sector Page
 * 
 * Implements the 6-panel "Intelligence Wall" for the Prices sector:
 * - Panel A: Today's Price Signals
 * - Panel B: Key Price KPIs (CPI, Food Basket, Fuel, Exchange Rate Impact)
 * - Panel C: Long Arc 2010→Today Price Charts
 * - Panel D: Price Mechanism Explainer
 * - Panel E: Price Contradictions & Regional Variations
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
  ShoppingCart,
  Fuel,
  Wheat,
  DollarSign,
  MapPin,
  Scale,
  Zap,
  GitCompare,
  Network,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";
import EvidencePackButton from "@/components/EvidencePackButton";
import ContradictionBadge from "@/components/ContradictionBadge";
import { SourceMixDisclosure, SourceBadge } from "@/components/SourceMixDisclosure";
import { AsOfDateLens, AsOfDateBadge } from "@/components/AsOfDateLens";
import { RelatedInsightsPanel } from "@/components/RelatedInsights";

interface PricesIntelligenceWallProps {
  regime?: 'both' | 'aden_irg' | 'sanaa_dfa';
  isVip?: boolean;
}

// ============================================================================
// PANEL A: TODAY'S PRICE SIGNALS
// ============================================================================

interface PriceSignal {
  id: number;
  commodity: string;
  commodityAr: string;
  category: 'food' | 'fuel' | 'services' | 'housing' | 'transport';
  currentPrice: number;
  previousPrice: number;
  changePercent: number;
  currency: string;
  unit: string;
  market: string;
  marketAr: string;
  timestamp: string;
  source: string;
  evidencePackId?: number;
}

function PriceSignalsPanel({ isArabic, signals }: { isArabic: boolean; signals: PriceSignal[] }) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const filteredSignals = useMemo(() => {
    if (categoryFilter === 'all') return signals;
    return signals.filter(s => s.category === categoryFilter);
  }, [signals, categoryFilter]);

  const categoryIcons: Record<string, React.ReactNode> = {
    food: <Wheat className="h-4 w-4" />,
    fuel: <Fuel className="h-4 w-4" />,
    services: <Building2 className="h-4 w-4" />,
    housing: <Building2 className="h-4 w-4" />,
    transport: <ShoppingCart className="h-4 w-4" />,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            {isArabic ? 'إشارات الأسعار اليوم' : "Today's Price Signals"}
          </CardTitle>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
              <SelectItem value="food">{isArabic ? 'غذاء' : 'Food'}</SelectItem>
              <SelectItem value="fuel">{isArabic ? 'وقود' : 'Fuel'}</SelectItem>
              <SelectItem value="services">{isArabic ? 'خدمات' : 'Services'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredSignals.map((signal) => (
            <div 
              key={signal.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg">
                  {categoryIcons[signal.category]}
                </div>
                <div>
                  <div className="font-medium">
                    {isArabic ? signal.commodityAr : signal.commodity}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {isArabic ? signal.marketAr : signal.market}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">
                  {signal.currentPrice.toLocaleString()} {signal.currency}/{signal.unit}
                </div>
                <div className={`text-sm flex items-center justify-end gap-1 ${
                  signal.changePercent > 0 ? 'text-red-600' : signal.changePercent < 0 ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  {signal.changePercent > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : signal.changePercent < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  {signal.changePercent > 0 ? '+' : ''}{signal.changePercent.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
          
          {filteredSignals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {isArabic ? 'لا توجد إشارات أسعار' : 'No price signals available'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL B: KEY PRICE KPIs
// ============================================================================

interface PriceKPI {
  id: string;
  name: string;
  nameAr: string;
  value: number;
  previousValue: number;
  changePercent: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  regime?: 'aden_irg' | 'sanaa_dfa' | 'both';
  lastUpdated: string;
  source: string;
  evidencePackId?: number;
  hasContradiction?: boolean;
}

function PriceKPIsPanel({ isArabic, kpis, regime }: { 
  isArabic: boolean; 
  kpis: PriceKPI[];
  regime: string;
}) {
  const filteredKpis = useMemo(() => {
    if (regime === 'both') return kpis;
    return kpis.filter(k => k.regime === regime || k.regime === 'both');
  }, [kpis, regime]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredKpis.slice(0, 8).map((kpi) => (
        <Card key={kpi.id} className="relative">
          {kpi.hasContradiction && (
            <div className="absolute top-2 right-2">
              <ContradictionBadge size="sm" />
            </div>
          )}
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">
              {isArabic ? kpi.nameAr : kpi.name}
            </div>
            <div className="text-2xl font-bold">
              {kpi.value.toLocaleString()}{kpi.unit}
            </div>
            <div className={`text-sm flex items-center gap-1 mt-1 ${
              kpi.trend === 'up' ? 'text-red-600' : kpi.trend === 'down' ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              {kpi.trend === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : kpi.trend === 'down' ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              {kpi.changePercent > 0 ? '+' : ''}{kpi.changePercent.toFixed(1)}%
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <SourceBadge tier="T1" sourceName={kpi.source} />
              {kpi.evidencePackId && (
                <EvidencePackButton packId={kpi.evidencePackId} size="sm" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// PANEL C: LONG ARC PRICE CHARTS
// ============================================================================

function PriceChartsPanel({ isArabic }: { isArabic: boolean }) {
  const [selectedChart, setSelectedChart] = useState('cpi');
  
  const chartOptions = [
    { id: 'cpi', label: isArabic ? 'مؤشر أسعار المستهلك' : 'Consumer Price Index' },
    { id: 'food_basket', label: isArabic ? 'سلة الغذاء' : 'Food Basket Cost' },
    { id: 'fuel', label: isArabic ? 'أسعار الوقود' : 'Fuel Prices' },
    { id: 'exchange_impact', label: isArabic ? 'تأثير سعر الصرف' : 'Exchange Rate Impact' },
  ];

  // Mock chart data - in production this would come from the API
  const chartData = {
    cpi: { title: 'CPI 2010-2024', description: 'Consumer Price Index tracking inflation' },
    food_basket: { title: 'Food Basket Cost', description: 'Minimum food basket cost over time' },
    fuel: { title: 'Fuel Prices', description: 'Diesel and petrol price trends' },
    exchange_impact: { title: 'Exchange Rate Impact', description: 'How currency affects prices' },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            {isArabic ? 'الاتجاهات طويلة المدى' : 'Long-Term Price Trends'}
          </CardTitle>
          <Select value={selectedChart} onValueChange={setSelectedChart}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartOptions.map(opt => (
                <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <div className="font-medium">{chartData[selectedChart as keyof typeof chartData]?.title}</div>
            <div className="text-sm text-muted-foreground">
              {chartData[selectedChart as keyof typeof chartData]?.description}
            </div>
            <div className="text-xs text-muted-foreground mt-2">2010 → 2024</div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <SourceMixDisclosure 
            sources={[
              { sourceId: 'wfp', name: 'WFP VAM', publisher: 'World Food Programme', tier: 'T1' },
              { sourceId: 'cso', name: 'CSO Yemen', publisher: 'Central Statistical Organization', tier: 'T0' },
            ]}
            compact
          />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL D: PRICE MECHANISM EXPLAINER
// ============================================================================

function PriceMechanismPanel({ isArabic }: { isArabic: boolean }) {
  const mechanisms = [
    {
      id: 'import_dependency',
      title: isArabic ? 'الاعتماد على الاستيراد' : 'Import Dependency',
      description: isArabic 
        ? 'اليمن يستورد 90% من احتياجاته الغذائية، مما يجعل الأسعار حساسة لأسعار الصرف والشحن'
        : 'Yemen imports 90% of food needs, making prices sensitive to exchange rates and shipping costs',
      icon: <ShoppingCart className="h-5 w-5" />,
      impact: 'high',
    },
    {
      id: 'dual_currency',
      title: isArabic ? 'نظام العملة المزدوج' : 'Dual Currency System',
      description: isArabic
        ? 'اختلاف أسعار الصرف بين عدن وصنعاء يخلق فروقات سعرية إقليمية'
        : 'Different exchange rates in Aden vs Sana\'a create regional price disparities',
      icon: <DollarSign className="h-5 w-5" />,
      impact: 'high',
    },
    {
      id: 'supply_chain',
      title: isArabic ? 'اضطرابات سلسلة التوريد' : 'Supply Chain Disruptions',
      description: isArabic
        ? 'الصراع يعطل طرق النقل ويزيد تكاليف اللوجستيات'
        : 'Conflict disrupts transport routes and increases logistics costs',
      icon: <Zap className="h-5 w-5" />,
      impact: 'medium',
    },
    {
      id: 'fuel_prices',
      title: isArabic ? 'أسعار الوقود' : 'Fuel Price Transmission',
      description: isArabic
        ? 'أسعار الوقود تؤثر على تكاليف النقل والإنتاج في جميع القطاعات'
        : 'Fuel prices affect transport and production costs across all sectors',
      icon: <Fuel className="h-5 w-5" />,
      impact: 'high',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          {isArabic ? 'آليات تحديد الأسعار' : 'Price Mechanisms'}
        </CardTitle>
        <CardDescription>
          {isArabic 
            ? 'العوامل الرئيسية التي تحرك الأسعار في اليمن'
            : 'Key factors driving prices in Yemen'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mechanisms.map((mech) => (
            <div 
              key={mech.id}
              className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <div className={`p-2 rounded-lg ${
                mech.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                mech.impact === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                'bg-[#DADED8] text-[#2e8b6e] dark:bg-blue-900 dark:text-blue-300'
              }`}>
                {mech.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium">{mech.title}</div>
                <div className="text-sm text-muted-foreground">{mech.description}</div>
              </div>
              <Badge variant={mech.impact === 'high' ? 'destructive' : 'secondary'}>
                {mech.impact === 'high' ? (isArabic ? 'تأثير عالي' : 'High Impact') : 
                 mech.impact === 'medium' ? (isArabic ? 'تأثير متوسط' : 'Medium Impact') :
                 (isArabic ? 'تأثير منخفض' : 'Low Impact')}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PANEL E: PRICE CONTRADICTIONS & REGIONAL VARIATIONS
// ============================================================================

function PriceContradictionsPanel({ isArabic }: { isArabic: boolean }) {
  const contradictions = [
    {
      id: 1,
      commodity: isArabic ? 'القمح' : 'Wheat',
      adenPrice: 850,
      sanaaPrice: 720,
      difference: 18.1,
      explanation: isArabic 
        ? 'الفرق يعكس اختلاف سعر الصرف والتكاليف اللوجستية'
        : 'Difference reflects exchange rate variance and logistics costs',
    },
    {
      id: 2,
      commodity: isArabic ? 'الديزل' : 'Diesel',
      adenPrice: 1200,
      sanaaPrice: 950,
      difference: 26.3,
      explanation: isArabic
        ? 'عدن تعتمد على الاستيراد بينما صنعاء لديها إمدادات محلية'
        : 'Aden relies on imports while Sana\'a has local supply',
    },
    {
      id: 3,
      commodity: isArabic ? 'زيت الطهي' : 'Cooking Oil',
      adenPrice: 3500,
      sanaaPrice: 3200,
      difference: 9.4,
      explanation: isArabic
        ? 'فروق طفيفة بسبب تكاليف النقل'
        : 'Minor differences due to transport costs',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-primary" />
          {isArabic ? 'الفروقات الإقليمية في الأسعار' : 'Regional Price Variations'}
        </CardTitle>
        <CardDescription>
          {isArabic 
            ? 'مقارنة الأسعار بين عدن وصنعاء'
            : 'Price comparison between Aden and Sana\'a'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contradictions.map((item) => (
            <div key={item.id} className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{item.commodity}</span>
                <Badge variant="outline" className="text-amber-600">
                  {item.difference > 0 ? '+' : ''}{item.difference.toFixed(1)}% {isArabic ? 'فرق' : 'diff'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="text-center p-2 bg-background rounded">
                  <div className="text-xs text-muted-foreground">{isArabic ? 'عدن' : 'Aden'}</div>
                  <div className="font-bold">{item.adenPrice.toLocaleString()} YER</div>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <div className="text-xs text-muted-foreground">{isArabic ? 'صنعاء' : "Sana'a"}</div>
                  <div className="font-bold">{item.sanaaPrice.toLocaleString()} YER</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <Info className="h-3 w-3 inline mr-1" />
                {item.explanation}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PricesIntelligenceWall({ 
  regime = 'both',
  isVip = false,
}: PricesIntelligenceWallProps) {
  const { isArabic } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in production this would come from tRPC queries
  const priceSignals: PriceSignal[] = [
    {
      id: 1,
      commodity: 'Wheat Flour',
      commodityAr: 'دقيق القمح',
      category: 'food',
      currentPrice: 850,
      previousPrice: 820,
      changePercent: 3.7,
      currency: 'YER',
      unit: 'kg',
      market: 'Aden',
      marketAr: 'عدن',
      timestamp: new Date().toISOString(),
      source: 'WFP VAM',
    },
    {
      id: 2,
      commodity: 'Diesel',
      commodityAr: 'ديزل',
      category: 'fuel',
      currentPrice: 1200,
      previousPrice: 1150,
      changePercent: 4.3,
      currency: 'YER',
      unit: 'L',
      market: 'Aden',
      marketAr: 'عدن',
      timestamp: new Date().toISOString(),
      source: 'Local Survey',
    },
    {
      id: 3,
      commodity: 'Cooking Oil',
      commodityAr: 'زيت الطهي',
      category: 'food',
      currentPrice: 3500,
      previousPrice: 3600,
      changePercent: -2.8,
      currency: 'YER',
      unit: 'L',
      market: "Sana'a",
      marketAr: 'صنعاء',
      timestamp: new Date().toISOString(),
      source: 'WFP VAM',
    },
  ];

  const priceKpis: PriceKPI[] = [
    {
      id: 'cpi',
      name: 'CPI (YoY)',
      nameAr: 'مؤشر أسعار المستهلك',
      value: 35.2,
      previousValue: 32.1,
      changePercent: 9.7,
      unit: '%',
      trend: 'up',
      regime: 'both',
      lastUpdated: '2024-01',
      source: 'IMF',
    },
    {
      id: 'food_basket',
      name: 'Food Basket',
      nameAr: 'سلة الغذاء',
      value: 45000,
      previousValue: 42000,
      changePercent: 7.1,
      unit: ' YER',
      trend: 'up',
      regime: 'both',
      lastUpdated: '2024-01',
      source: 'WFP',
    },
    {
      id: 'fuel_index',
      name: 'Fuel Index',
      nameAr: 'مؤشر الوقود',
      value: 185,
      previousValue: 175,
      changePercent: 5.7,
      unit: '',
      trend: 'up',
      regime: 'aden_irg',
      lastUpdated: '2024-01',
      source: 'Local Survey',
    },
    {
      id: 'purchasing_power',
      name: 'Purchasing Power',
      nameAr: 'القوة الشرائية',
      value: 42,
      previousValue: 48,
      changePercent: -12.5,
      unit: '%',
      trend: 'down',
      regime: 'both',
      lastUpdated: '2024-01',
      source: 'World Bank',
      hasContradiction: true,
    },
  ];

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? 'الأسعار وتكاليف المعيشة' : 'Prices & Cost of Living'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic 
              ? 'مراقبة الأسعار والتضخم وتكاليف المعيشة في اليمن'
              : 'Monitoring prices, inflation, and cost of living in Yemen'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AsOfDateBadge date={selectedDate} />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Date Lens */}
      <AsOfDateLens
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        showTimeline={true}
        showQuickSelect={true}
      />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">
            {isArabic ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="trends">
            {isArabic ? 'الاتجاهات' : 'Trends'}
          </TabsTrigger>
          <TabsTrigger value="regional">
            {isArabic ? 'إقليمي' : 'Regional'}
          </TabsTrigger>
          <TabsTrigger value="related">
            {isArabic ? 'مرتبط' : 'Related'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Panel B: KPIs */}
          <PriceKPIsPanel isArabic={isArabic} kpis={priceKpis} regime={regime} />

          {/* Panels A & D side by side */}
          <div className="grid lg:grid-cols-2 gap-6">
            <PriceSignalsPanel isArabic={isArabic} signals={priceSignals} />
            <PriceMechanismPanel isArabic={isArabic} />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6 mt-6">
          {/* Panel C: Long Arc Charts */}
          <PriceChartsPanel isArabic={isArabic} />
        </TabsContent>

        <TabsContent value="regional" className="space-y-6 mt-6">
          {/* Panel E: Contradictions */}
          <PriceContradictionsPanel isArabic={isArabic} />
        </TabsContent>

        <TabsContent value="related" className="space-y-6 mt-6">
          {/* Panel F: Connected Intelligence */}
          <RelatedInsightsPanel
            sourceType="sector"
            sourceId="prices"
            showDocuments={true}
            showEntities={true}
            showDatasets={true}
            showEvents={true}
          />
        </TabsContent>
      </Tabs>

      {/* Source Mix Footer */}
      <SourceMixDisclosure
        sources={[
          { sourceId: 'wfp', name: 'WFP VAM', publisher: 'World Food Programme', tier: 'T1' },
          { sourceId: 'imf', name: 'IMF IFS', publisher: 'International Monetary Fund', tier: 'T1' },
          { sourceId: 'cso', name: 'CSO Yemen', publisher: 'Central Statistical Organization', tier: 'T0' },
          { sourceId: 'local', name: 'Local Surveys', publisher: 'YETO Field Team', tier: 'T2' },
        ]}
        asOfDate={selectedDate.toLocaleDateString()}
        showTierLegend={true}
      />
    </div>
  );
}
