/**
 * Labor Market & Wages - Real Income & Livelihoods Observatory
 * Sector 8: Comprehensive labor market intelligence with evidence-based data
 */

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from "@/lib/trpc";
import { SourcesUsedPanel } from "@/components/SourcesUsedPanel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  FileText, 
  Download, 
  Info, 
  Calendar,
  DollarSign,
  ShoppingCart,
  Building2,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BarChart3,
  LineChart,
  PieChart,
  Map,
  Wallet,
  Banknote,
  Home,
  Heart,
  GraduationCap,
  Factory
} from 'lucide-react';

// Types
interface LaborKPI {
  id: string;
  nameAr: string;
  nameEn: string;
  value: number | null;
  unit: string;
  change: number | null;
  changeType: 'increase' | 'decrease' | 'stable';
  status: 'measured' | 'proxied' | 'unknown' | 'gap';
  confidence: 'high' | 'medium' | 'low';
  lastUpdated: string;
  sourceCount: number;
  evidencePackId?: string;
}

interface LaborSignal {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  type: 'survey' | 'circular' | 'report' | 'event' | 'program';
  verified: boolean;
  date: string;
  source: string;
  linkedSectors: string[];
  evidencePackId: string;
}

interface WageAdequacyData {
  year: number;
  month?: number;
  basketCost: number | null;
  wageProxy: number | null;
  realWageIndex: number | null;
  wageAdequacyRatio: number | null;
  transferAdequacyRatio: number | null;
  remittanceProxy: number | null;
  governorate?: string;
  confidence: 'high' | 'medium' | 'low';
  sources: string[];
}

// Mock data for demonstration
const mockKPIs: LaborKPI[] = [
  {
    id: 'basket_cost',
    nameAr: 'تكلفة السلة الغذائية',
    nameEn: 'Food Basket Cost',
    value: 185000,
    unit: 'YER',
    change: 12.5,
    changeType: 'increase',
    status: 'measured',
    confidence: 'high',
    lastUpdated: '2026-01-15',
    sourceCount: 3,
    evidencePackId: 'EP-LAB-001'
  },
  {
    id: 'wage_proxy',
    nameAr: 'متوسط الأجر (تقديري)',
    nameEn: 'Wage Proxy',
    value: 95000,
    unit: 'YER',
    change: -8.2,
    changeType: 'decrease',
    status: 'proxied',
    confidence: 'medium',
    lastUpdated: '2025-12-01',
    sourceCount: 2,
    evidencePackId: 'EP-LAB-002'
  },
  {
    id: 'real_wage_index',
    nameAr: 'مؤشر الأجر الحقيقي',
    nameEn: 'Real Wage Index',
    value: 42.3,
    unit: '%',
    change: -15.7,
    changeType: 'decrease',
    status: 'proxied',
    confidence: 'medium',
    lastUpdated: '2025-12-01',
    sourceCount: 2,
    evidencePackId: 'EP-LAB-003'
  },
  {
    id: 'wage_adequacy',
    nameAr: 'نسبة كفاية الأجر',
    nameEn: 'Wage Adequacy Ratio',
    value: 0.51,
    unit: 'ratio',
    change: -18.3,
    changeType: 'decrease',
    status: 'proxied',
    confidence: 'medium',
    lastUpdated: '2025-12-01',
    sourceCount: 2,
    evidencePackId: 'EP-LAB-004'
  },
  {
    id: 'transfer_adequacy',
    nameAr: 'نسبة كفاية التحويلات',
    nameEn: 'Transfer Adequacy',
    value: 0.35,
    unit: 'ratio',
    change: 5.2,
    changeType: 'increase',
    status: 'measured',
    confidence: 'high',
    lastUpdated: '2026-01-10',
    sourceCount: 4,
    evidencePackId: 'EP-LAB-005'
  },
  {
    id: 'remittance_proxy',
    nameAr: 'تقدير التحويلات',
    nameEn: 'Remittance Proxy',
    value: null,
    unit: 'USD',
    change: null,
    changeType: 'stable',
    status: 'gap',
    confidence: 'low',
    lastUpdated: '2024-06-01',
    sourceCount: 0
  },
  {
    id: 'freshness',
    nameAr: 'حداثة البيانات',
    nameEn: 'Data Freshness',
    value: 78,
    unit: '%',
    change: 5,
    changeType: 'increase',
    status: 'measured',
    confidence: 'high',
    lastUpdated: '2026-01-30',
    sourceCount: 12
  },
  {
    id: 'contradictions',
    nameAr: 'التناقضات',
    nameEn: 'Contradictions',
    value: 3,
    unit: 'count',
    change: -1,
    changeType: 'decrease',
    status: 'measured',
    confidence: 'high',
    lastUpdated: '2026-01-30',
    sourceCount: 8
  }
];

const mockSignals: LaborSignal[] = [
  {
    id: 'sig-1',
    titleAr: 'تقرير برنامج الأغذية العالمي: ضغوط معيشية متزايدة',
    titleEn: 'WFP Report: Increasing Livelihood Stress',
    descriptionAr: 'يشير التقرير الشهري لبرنامج الأغذية العالمي إلى ارتفاع مستويات الضغط المعيشي في المحافظات الشمالية',
    descriptionEn: 'Monthly WFP report indicates rising livelihood stress levels in northern governorates',
    type: 'report',
    verified: true,
    date: '2026-01-28',
    source: 'WFP Yemen',
    linkedSectors: ['food_security', 'prices', 'humanitarian'],
    evidencePackId: 'EP-SIG-001'
  },
  {
    id: 'sig-2',
    titleAr: 'تعميم وزارة المالية: جدول صرف الرواتب',
    titleEn: 'MoF Circular: Salary Payment Schedule',
    descriptionAr: 'تعميم جديد من وزارة المالية بشأن جدول صرف رواتب موظفي القطاع العام',
    descriptionEn: 'New Ministry of Finance circular regarding public sector salary payment schedule',
    type: 'circular',
    verified: true,
    date: '2026-01-25',
    source: 'Ministry of Finance',
    linkedSectors: ['public_finance', 'banking'],
    evidencePackId: 'EP-SIG-002'
  },
  {
    id: 'sig-3',
    titleAr: 'مسح الأسر: تقييم سبل العيش',
    titleEn: 'Household Survey: Livelihoods Assessment',
    descriptionAr: 'نتائج مسح جديد للأسر يغطي 8 محافظات حول ظروف سبل العيش',
    descriptionEn: 'New household survey results covering 8 governorates on livelihood conditions',
    type: 'survey',
    verified: true,
    date: '2026-01-20',
    source: 'UNDP Yemen',
    linkedSectors: ['poverty', 'food_security'],
    evidencePackId: 'EP-SIG-003'
  }
];

// Helper functions
const formatNumber = (value: number | null, unit: string): string => {
  if (value === null) return '—';
  if (unit === 'YER') return value.toLocaleString() + ' ر.ي';
  if (unit === 'USD') return '$' + value.toLocaleString();
  if (unit === '%') return value.toFixed(1) + '%';
  if (unit === 'ratio') return value.toFixed(2);
  if (unit === 'count') return value.toString();
  return value.toLocaleString();
};

const getStatusBadge = (status: string, isArabic: boolean) => {
  const statusConfig: Record<string, { color: string; labelAr: string; labelEn: string }> = {
    measured: { color: 'bg-emerald-100 text-emerald-800', labelAr: 'مقاس', labelEn: 'Measured' },
    proxied: { color: 'bg-amber-100 text-amber-800', labelAr: 'تقديري', labelEn: 'Proxied' },
    unknown: { color: 'bg-gray-100 text-gray-800', labelAr: 'غير معروف', labelEn: 'Unknown' },
    gap: { color: 'bg-red-100 text-red-800', labelAr: 'فجوة', labelEn: 'Gap' }
  };
  const config = statusConfig[status] || statusConfig.unknown;
  return (
    <Badge className={`${config.color} text-xs`}>
      {isArabic ? config.labelAr : config.labelEn}
    </Badge>
  );
};

const getConfidenceBadge = (confidence: string, isArabic: boolean) => {
  const config: Record<string, { color: string; labelAr: string; labelEn: string }> = {
    high: { color: 'bg-green-100 text-green-800', labelAr: 'عالية', labelEn: 'High' },
    medium: { color: 'bg-yellow-100 text-yellow-800', labelAr: 'متوسطة', labelEn: 'Medium' },
    low: { color: 'bg-red-100 text-red-800', labelAr: 'منخفضة', labelEn: 'Low' }
  };
  const c = config[confidence] || config.low;
  return (
    <Badge variant="outline" className={`${c.color} text-xs`}>
      {isArabic ? c.labelAr : c.labelEn}
    </Badge>
  );
};

export default function LaborMarket() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedGovernorate, setSelectedGovernorate] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [roleView, setRoleView] = useState<'citizen' | 'policymaker' | 'donor' | 'researcher'>('citizen');
  
  // Year range for as-of lens
  const years = useMemo(() => {
    const arr = [];
    for (let y = 2010; y <= 2026; y++) arr.push(y);
    return arr;
  }, []);
  
  const governorates = [
    { value: 'all', labelAr: 'جميع المحافظات', labelEn: 'All Governorates' },
    { value: 'sanaa', labelAr: 'صنعاء', labelEn: "Sana'a" },
    { value: 'aden', labelAr: 'عدن', labelEn: 'Aden' },
    { value: 'taiz', labelAr: 'تعز', labelEn: 'Taiz' },
    { value: 'hodeidah', labelAr: 'الحديدة', labelEn: 'Hodeidah' },
    { value: 'marib', labelAr: 'مأرب', labelEn: 'Marib' },
    { value: 'ibb', labelAr: 'إب', labelEn: 'Ibb' },
    { value: 'hajjah', labelAr: 'حجة', labelEn: 'Hajjah' },
    { value: 'dhamar', labelAr: 'ذمار', labelEn: 'Dhamar' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--yeto-aloe)] to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[var(--yeto-moss)] via-[var(--yeto-cypress)] to-[var(--yeto-forest-2)] text-white">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <Badge className="bg-[var(--yeto-gold)] text-[var(--yeto-moss)] mb-2">
                    {isArabic ? 'القطاع 8' : 'Sector 8'}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {isArabic ? 'سوق العمل والأجور' : 'Labor Market & Wages'}
                  </h1>
                </div>
              </div>
              <p className="text-lg text-white/80 max-w-2xl">
                {isArabic 
                  ? 'مرصد الدخل الحقيقي وسبل العيش - تتبع شامل للأجور والقوة الشرائية والتحويلات منذ 2010'
                  : 'Real Income & Livelihoods Observatory - Comprehensive tracking of wages, purchasing power, and transfers since 2010'}
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Clock className="w-4 h-4" />
                <span>{isArabic ? 'آخر تحديث: 30 يناير 2026' : 'Last updated: Jan 30, 2026'}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  {isArabic ? 'تصدير' : 'Export'}
                </Button>
                <Button className="bg-[var(--yeto-gold)] text-[var(--yeto-moss)] hover:bg-[var(--yeto-gold)]/90">
                  <FileText className="w-4 h-4 mr-2" />
                  {isArabic ? 'المنهجية' : 'Methodology'}
                </Button>
              </div>
            </div>
          </div>
          
          {/* As-of Date Lens */}
          <div className="mt-8 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{isArabic ? 'عدسة التاريخ' : 'As-of Date Lens'}</span>
              </div>
              <div className="flex-1 w-full md:w-auto">
                <Slider
                  value={[selectedYear]}
                  onValueChange={(v) => setSelectedYear(v[0])}
                  min={2010}
                  max={2026}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>2010</span>
                  <span className="font-bold text-[var(--yeto-gold)]">{selectedYear}</span>
                  <span>2026</span>
                </div>
              </div>
              <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {governorates.map(g => (
                    <SelectItem key={g.value} value={g.value}>
                      {isArabic ? g.labelAr : g.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Panel B: KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {mockKPIs.map(kpi => (
            <Card key={kpi.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-muted-foreground truncate">
                    {isArabic ? kpi.nameAr : kpi.nameEn}
                  </span>
                  {getStatusBadge(kpi.status, isArabic)}
                </div>
                <div className="text-2xl font-bold text-[var(--yeto-moss)]">
                  {formatNumber(kpi.value, kpi.unit)}
                </div>
                {kpi.change !== null && (
                  <div className={`flex items-center gap-1 text-sm mt-1 ${
                    kpi.changeType === 'increase' ? 'text-red-600' : 
                    kpi.changeType === 'decrease' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {kpi.changeType === 'increase' ? <ArrowUpRight className="w-4 h-4" /> : 
                     kpi.changeType === 'decrease' ? <ArrowDownRight className="w-4 h-4" /> : null}
                    <span>{Math.abs(kpi.change)}%</span>
                  </div>
                )}
                {kpi.evidencePackId && (
                  <Button variant="ghost" size="sm" className="absolute bottom-1 right-1 p-1 h-auto">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[var(--yeto-aloe)] p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--yeto-moss)] data-[state=active]:text-white">
              {isArabic ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-[var(--yeto-moss)] data-[state=active]:text-white">
              {isArabic ? 'الاتجاهات' : 'Trends'}
            </TabsTrigger>
            <TabsTrigger value="mechanism" className="data-[state=active]:bg-[var(--yeto-moss)] data-[state=active]:text-white">
              {isArabic ? 'الآليات' : 'Mechanism'}
            </TabsTrigger>
            <TabsTrigger value="disagreements" className="data-[state=active]:bg-[var(--yeto-moss)] data-[state=active]:text-white">
              {isArabic ? 'التناقضات' : 'Disagreements'}
            </TabsTrigger>
            <TabsTrigger value="connected" className="data-[state=active]:bg-[var(--yeto-moss)] data-[state=active]:text-white">
              {isArabic ? 'الروابط' : 'Connected'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Panel A: Livelihoods Signal Feed */}
              <Card className="lg:col-span-2">
                <CardHeader className="bg-gradient-to-r from-[var(--yeto-cypress)] to-[var(--yeto-olive)] text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {isArabic ? 'إشارات سبل العيش' : 'Livelihoods Signal Feed'}
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    {isArabic ? 'التحديثات المتحقق منها هذا الأسبوع' : 'Verified updates this week'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {mockSignals.map(signal => (
                      <div key={signal.id} className="p-4 hover:bg-[var(--yeto-aloe)]/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            signal.type === 'report' ? 'bg-blue-100 text-blue-700' :
                            signal.type === 'circular' ? 'bg-purple-100 text-purple-700' :
                            signal.type === 'survey' ? 'bg-green-100 text-green-700' :
                            signal.type === 'event' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {signal.type === 'report' ? <FileText className="w-5 h-5" /> :
                             signal.type === 'circular' ? <Banknote className="w-5 h-5" /> :
                             signal.type === 'survey' ? <Users className="w-5 h-5" /> :
                             <AlertTriangle className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-[var(--yeto-moss)]">
                                {isArabic ? signal.titleAr : signal.titleEn}
                              </h4>
                              {signal.verified && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  {isArabic ? 'متحقق' : 'Verified'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {isArabic ? signal.descriptionAr : signal.descriptionEn}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {signal.date}
                              </span>
                              <span>{signal.source}</span>
                              <div className="flex gap-1">
                                {signal.linkedSectors.slice(0, 3).map(s => (
                                  <Badge key={s} variant="outline" className="text-xs">
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Data Coverage Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--yeto-moss)]">
                    <PieChart className="w-5 h-5" />
                    {isArabic ? 'تغطية البيانات' : 'Data Coverage'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* What is Measured */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        {isArabic ? 'ما هو مقاس' : 'What is Measured'}
                      </span>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• {isArabic ? 'تكلفة السلة الغذائية (WFP)' : 'Food basket cost (WFP)'}</li>
                      <li>• {isArabic ? 'مبالغ التحويلات النقدية' : 'Cash transfer amounts'}</li>
                      <li>• {isArabic ? 'أسعار الصرف' : 'Exchange rates'}</li>
                    </ul>
                  </div>

                  {/* What is Proxied */}
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-amber-800">
                        {isArabic ? 'ما هو تقديري' : 'What is Proxied'}
                      </span>
                    </div>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• {isArabic ? 'متوسط الأجور (من المسوحات)' : 'Average wages (from surveys)'}</li>
                      <li>• {isArabic ? 'مؤشر الأجر الحقيقي' : 'Real wage index'}</li>
                      <li>• {isArabic ? 'نسبة كفاية الأجر' : 'Wage adequacy ratio'}</li>
                    </ul>
                  </div>

                  {/* What is Unknown */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-800">
                        {isArabic ? 'ما هو غير معروف' : 'What is Unknown'}
                      </span>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• {isArabic ? 'معدل البطالة الرسمي' : 'Official unemployment rate'}</li>
                      <li>• {isArabic ? 'إجمالي التحويلات' : 'Total remittances'}</li>
                      <li>• {isArabic ? 'توزيع الأجور بالقطاع الخاص' : 'Private sector wage distribution'}</li>
                    </ul>
                  </div>

                  {/* Gap Tickets */}
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800">
                        {isArabic ? 'فجوات البيانات' : 'Data Gaps'}
                      </span>
                    </div>
                    <div className="text-sm text-red-700">
                      <span className="font-bold">5</span> {isArabic ? 'تذاكر فجوات نشطة' : 'active gap tickets'}
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 w-full border-red-300 text-red-700 hover:bg-red-100">
                      {isArabic ? 'عرض سير العمل' : 'View Workflows'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Core Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Real Wage Index Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--yeto-moss)]">
                    <LineChart className="w-5 h-5" />
                    {isArabic ? 'مؤشر الأجر الحقيقي (2010-2026)' : 'Real Wage Index (2010-2026)'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? 'الأجر الاسمي / تكلفة السلة × 100' : 'Nominal wage / Basket cost × 100'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-[var(--yeto-aloe)]/30 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{isArabic ? 'الرسم البياني التفاعلي' : 'Interactive Chart'}</p>
                      <p className="text-xs">{isArabic ? 'بيانات من ILOSTAT, WFP, UNDP' : 'Data from ILOSTAT, WFP, UNDP'}</p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      {isArabic ? 'تصدير' : 'Export'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Info className="w-4 h-4 mr-2" />
                      {isArabic ? 'الأدلة' : 'Evidence'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Wage Adequacy Ratio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--yeto-moss)]">
                    <Wallet className="w-5 h-5" />
                    {isArabic ? 'نسبة كفاية الأجر' : 'Wage Adequacy Ratio'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? 'كم سلة يمكن للأجر شراؤها' : 'How many baskets a wage can buy'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-[var(--yeto-aloe)]/30 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{isArabic ? 'الرسم البياني التفاعلي' : 'Interactive Chart'}</p>
                      <p className="text-xs">{isArabic ? 'مقارنة الأجر مع تكلفة السلة' : 'Wage vs Basket Cost comparison'}</p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      {isArabic ? 'تصدير' : 'Export'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Info className="w-4 h-4 mr-2" />
                      {isArabic ? 'الأدلة' : 'Evidence'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Transfer Adequacy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--yeto-moss)]">
                    <Heart className="w-5 h-5" />
                    {isArabic ? 'كفاية التحويلات النقدية' : 'Cash Transfer Adequacy'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? 'التحويل / تكلفة السلة' : 'Transfer / Basket Cost'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-[var(--yeto-aloe)]/30 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Banknote className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{isArabic ? 'الرسم البياني التفاعلي' : 'Interactive Chart'}</p>
                      <p className="text-xs">{isArabic ? 'بيانات من WFP, UNICEF' : 'Data from WFP, UNICEF'}</p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      {isArabic ? 'تصدير' : 'Export'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Info className="w-4 h-4 mr-2" />
                      {isArabic ? 'الأدلة' : 'Evidence'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Geographic Heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--yeto-moss)]">
                    <Map className="w-5 h-5" />
                    {isArabic ? 'خريطة الكفاية حسب المحافظة' : 'Adequacy Heatmap by Governorate'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? 'التوزيع الجغرافي للقوة الشرائية' : 'Geographic distribution of purchasing power'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-[var(--yeto-aloe)]/30 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Map className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{isArabic ? 'خريطة حرارية تفاعلية' : 'Interactive Heatmap'}</p>
                      <p className="text-xs">{isArabic ? 'حسب توفر البيانات' : 'Based on data availability'}</p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      {isArabic ? 'تصدير' : 'Export'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Info className="w-4 h-4 mr-2" />
                      {isArabic ? 'الأدلة' : 'Evidence'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mechanism Tab */}
          <TabsContent value="mechanism" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[var(--yeto-moss)]">
                  {isArabic ? 'آليات سوق العمل والأجور' : 'Labor Market & Wages Mechanisms'}
                </CardTitle>
                <CardDescription>
                  {isArabic ? 'كيف تؤثر الصدمات الاقتصادية على الدخل الحقيقي' : 'How economic shocks affect real income'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Role Selector */}
                <div className="flex gap-2 mb-6">
                  {(['citizen', 'policymaker', 'donor', 'researcher'] as const).map(role => (
                    <Button
                      key={role}
                      variant={roleView === role ? 'default' : 'outline'}
                      onClick={() => setRoleView(role)}
                      className={roleView === role ? 'bg-[var(--yeto-moss)]' : ''}
                    >
                      {role === 'citizen' ? (isArabic ? 'المواطن' : 'Citizen') :
                       role === 'policymaker' ? (isArabic ? 'صانع السياسات' : 'Policymaker') :
                       role === 'donor' ? (isArabic ? 'المانح' : 'Donor/UN') :
                       (isArabic ? 'الباحث' : 'Researcher')}
                    </Button>
                  ))}
                </div>

                {/* Conceptual Framework */}
                <div className="p-4 bg-[var(--yeto-aloe)]/50 rounded-lg mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {isArabic ? 'الإطار المفاهيمي' : 'Conceptual Framework'}
                    <Badge variant="outline">{isArabic ? 'مفاهيمي' : 'Conceptual'}</Badge>
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge className="bg-[var(--yeto-cypress)] text-white">{isArabic ? 'التضخم' : 'Inflation'}</Badge>
                    <span>→</span>
                    <Badge className="bg-[var(--yeto-olive)] text-white">{isArabic ? 'سعر الصرف' : 'FX Rate'}</Badge>
                    <span>→</span>
                    <Badge className="bg-[var(--yeto-forest-1)] text-white">{isArabic ? 'تكلفة السلة' : 'Basket Cost'}</Badge>
                    <span>→</span>
                    <Badge className="bg-red-600 text-white">{isArabic ? 'تآكل الأجر الحقيقي' : 'Real Wage Erosion'}</Badge>
                  </div>
                </div>

                {/* Role-specific content */}
                {roleView === 'citizen' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-[var(--yeto-moss)]">
                      {isArabic ? 'ماذا يعني هذا للأسر' : 'What This Means for Households'}
                    </h4>
                    <p className="text-muted-foreground">
                      {isArabic 
                        ? 'عندما ترتفع أسعار المواد الغذائية والوقود بينما تبقى الأجور ثابتة، تنخفض القوة الشرائية للأسر. هذا يعني أن نفس الراتب يشتري كمية أقل من الغذاء والخدمات الأساسية.'
                        : 'When food and fuel prices rise while wages remain stagnant, household purchasing power declines. This means the same salary buys less food and essential services.'}
                    </p>
                  </div>
                )}

                {roleView === 'policymaker' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-[var(--yeto-moss)]">
                      {isArabic ? 'خيارات السياسات' : 'Policy Options'}
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• {isArabic ? 'مراقبة نسبة كفاية الأجر كمؤشر إنذار مبكر' : 'Monitor wage adequacy ratio as early warning indicator'}</li>
                      <li>• {isArabic ? 'تقييم تأثير سياسات سعر الصرف على القوة الشرائية' : 'Assess impact of exchange rate policies on purchasing power'}</li>
                      <li>• {isArabic ? 'تنسيق برامج التحويلات النقدية مع تكلفة السلة' : 'Coordinate cash transfer programs with basket cost'}</li>
                    </ul>
                  </div>
                )}

                {roleView === 'donor' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-[var(--yeto-moss)]">
                      {isArabic ? 'الآثار على البرامج' : 'Program Implications'}
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• {isArabic ? 'ضغوط سبل العيش تتطلب تعديل قيم التحويلات' : 'Livelihood stress requires transfer value adjustments'}</li>
                      <li>• {isArabic ? 'فجوات البيانات تحد من دقة الاستهداف' : 'Data gaps limit targeting precision'}</li>
                      <li>• {isArabic ? 'التنسيق بين الوكالات ضروري لتجنب الازدواجية' : 'Inter-agency coordination essential to avoid duplication'}</li>
                    </ul>
                  </div>
                )}

                {roleView === 'researcher' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-[var(--yeto-moss)]">
                      {isArabic ? 'المنهجية والتحفظات' : 'Methodology & Caveats'}
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• {isArabic ? 'مؤشر الأجر الحقيقي = الأجر الاسمي / تكلفة السلة × 100' : 'Real Wage Index = Nominal Wage / Basket Cost × 100'}</li>
                      <li>• {isArabic ? 'بيانات الأجور تقديرية من المسوحات (ليست رسمية)' : 'Wage data is proxy from surveys (not official)'}</li>
                      <li>• {isArabic ? 'تكلفة السلة من WFP تغطي سلة غذائية محددة' : 'Basket cost from WFP covers specific food basket'}</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disagreements Tab */}
          <TabsContent value="disagreements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--yeto-moss)]">
                  <AlertTriangle className="w-5 h-5" />
                  {isArabic ? 'التناقضات والإصدارات' : 'Disagreements & Vintages'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Active Contradictions */}
                <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-3">
                    {isArabic ? 'التناقضات النشطة' : 'Active Contradictions'}
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded border">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium">{isArabic ? 'تقدير متوسط الأجور' : 'Average Wage Estimate'}</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            UNDP: 85,000 YER vs WFP Survey: 105,000 YER
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-amber-100">
                          {isArabic ? 'قيد المراجعة' : 'Under Review'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What Would Change Conclusions */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">
                    {isArabic ? 'ما الذي سيغير الاستنتاجات' : 'What Would Change Conclusions'}
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• {isArabic ? 'مسح عمالة وطني جديد' : 'New national labor force survey'}</li>
                    <li>• {isArabic ? 'بيانات رسمية عن رواتب القطاع العام' : 'Official public sector salary data'}</li>
                    <li>• {isArabic ? 'إحصاءات التحويلات من البنك المركزي' : 'Remittance statistics from Central Bank'}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connected Intelligence Tab */}
          <TabsContent value="connected" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Related Entities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--yeto-moss)]">
                    <Building2 className="w-5 h-5" />
                    {isArabic ? 'الجهات المرتبطة' : 'Related Entities'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['ILO', 'UNDP', 'WFP', 'UNICEF', 'Ministry of Finance', 'Central Bank of Yemen'].map(entity => (
                      <Button key={entity} variant="ghost" className="w-full justify-start">
                        <Building2 className="w-4 h-4 mr-2" />
                        {entity}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Related Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--yeto-moss)]">
                    <FileText className="w-5 h-5" />
                    {isArabic ? 'الوثائق المرتبطة' : 'Related Documents'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      'WFP Market Monitor Q4 2025',
                      'UNDP Livelihoods Assessment 2025',
                      'ILO Yemen Labor Brief 2024',
                      'MoF Salary Circular 2026'
                    ].map(doc => (
                      <Button key={doc} variant="ghost" className="w-full justify-start text-left">
                        <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{doc}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Related Sectors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--yeto-moss)]">
                    <Briefcase className="w-5 h-5" />
                    {isArabic ? 'القطاعات المرتبطة' : 'Related Sectors'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { name: isArabic ? 'الأسعار وتكلفة المعيشة' : 'Prices & Cost of Living', icon: ShoppingCart },
                      { name: isArabic ? 'العملة وسعر الصرف' : 'Currency & FX', icon: DollarSign },
                      { name: isArabic ? 'المالية العامة' : 'Public Finance', icon: Banknote },
                      { name: isArabic ? 'تدفقات المساعدات' : 'Aid Flows', icon: Heart },
                      { name: isArabic ? 'الأمن الغذائي' : 'Food Security', icon: Home }
                    ].map(sector => (
                      <Button key={sector.name} variant="ghost" className="w-full justify-start">
                        <sector.icon className="w-4 h-4 mr-2" />
                        {sector.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[var(--yeto-moss)]">
                  {isArabic ? 'اتجاهات سوق العمل (2010-2026)' : 'Labor Market Trends (2010-2026)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center bg-[var(--yeto-aloe)]/30 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">{isArabic ? 'رسم بياني تفاعلي للاتجاهات' : 'Interactive Trends Chart'}</p>
                    <p className="text-sm">{isArabic ? 'يعرض البيانات المتاحة مع تحديد الفجوات' : 'Shows available data with gaps identified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sources Used Panel */}
        <Card className="mt-8">
          <CardHeader className="bg-[var(--yeto-aloe)]">
            <CardTitle className="flex items-center gap-2 text-[var(--yeto-moss)]">
              <FileText className="w-5 h-5" />
              {isArabic ? 'المصادر المستخدمة في هذه الصفحة' : 'Sources Used on This Page'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { tier: 'T0', count: 2, sources: ['ILOSTAT', 'World Bank WDI'] },
                { tier: 'T1', count: 5, sources: ['WFP', 'UNDP', 'UNICEF', 'FAO', 'OCHA'] },
                { tier: 'T2', count: 3, sources: ['Sana\'a Center', 'ACAPS', 'RIY'] },
                { tier: 'T3', count: 1, sources: ['Media (events only)'] }
              ].map(tier => (
                <div key={tier.tier} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={
                      tier.tier === 'T0' ? 'bg-green-100 text-green-800' :
                      tier.tier === 'T1' ? 'bg-blue-100 text-blue-800' :
                      tier.tier === 'T2' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {tier.tier}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{tier.count} {isArabic ? 'مصادر' : 'sources'}</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {tier.sources.map(s => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources Used Panel */}
      <SourcesUsedPanel sectorCode="labor" />
    </div>
  );
}
