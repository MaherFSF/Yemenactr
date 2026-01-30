import { useState } from 'react';
import { SourcesUsedPanel } from "@/components/SourcesUsedPanel";
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  AlertTriangle,
  Download,
  ExternalLink,
  FileText,
  ChevronLeft,
  Info,
  Target,
  Wallet,
  Globe,
  Shield,
  Clock,
  MapPin,
  BarChart3,
  PieChart,
  Landmark
} from 'lucide-react';
import { toast } from 'sonner';

// Yemen Microfinance Network (YMN) member institutions
const MFI_DATA = [
  {
    id: 1,
    name: 'بنك الكريمي الإسلامي للتمويل الأصغر',
    nameEn: 'Al-Kuraimi Islamic Microfinance Bank',
    code: 'KIMB',
    type: 'بنك تمويل أصغر',
    typeEn: 'Microfinance Bank',
    founded: 2010,
    headquarters: 'صنعاء',
    branches: 85,
    activeClients: 450000,
    loanPortfolio: 125000000, // USD
    deposits: 280000000,
    par30: 3.2, // Portfolio at Risk > 30 days
    oss: 112, // Operational Self-Sufficiency %
    status: 'عامل',
    logo: '/images/banks/kuraimi.webp',
    website: 'https://www.alkuraimi.com',
    jurisdiction: 'عدن/صنعاء',
    products: ['قروض صغرى', 'حسابات توفير', 'تحويلات مالية', 'تأمين أصغر'],
    targetGroups: ['نساء', 'شباب', 'مزارعين', 'تجار صغار'],
    awards: ['أفضل مؤسسة تمويل أصغر في اليمن 2023']
  },
  {
    id: 2,
    name: 'صندوق التنمية الاجتماعية - برنامج التمويل الأصغر',
    nameEn: 'Social Fund for Development - Microfinance Program',
    code: 'SFD-MF',
    type: 'برنامج حكومي',
    typeEn: 'Government Program',
    founded: 2000,
    headquarters: 'صنعاء',
    branches: 22,
    activeClients: 85000,
    loanPortfolio: 28000000,
    deposits: 0,
    par30: 8.5,
    oss: 78,
    status: 'عامل',
    logo: '/images/institutions/sfd.png',
    website: 'https://www.sfd-yemen.org',
    jurisdiction: 'عدن/صنعاء',
    products: ['قروض إنتاجية', 'قروض طوارئ', 'تدريب مهني'],
    targetGroups: ['نساء ريفيات', 'نازحين', 'فقراء'],
    awards: []
  },
  {
    id: 3,
    name: 'مؤسسة الأمل للتمويل الأصغر',
    nameEn: 'Al-Amal Microfinance Institution',
    code: 'AMFI',
    type: 'مؤسسة تمويل أصغر',
    typeEn: 'MFI',
    founded: 2002,
    headquarters: 'صنعاء',
    branches: 18,
    activeClients: 42000,
    loanPortfolio: 12500000,
    deposits: 8500000,
    par30: 5.8,
    oss: 95,
    status: 'عامل',
    logo: null,
    website: null,
    jurisdiction: 'صنعاء',
    products: ['قروض فردية', 'قروض جماعية', 'توفير'],
    targetGroups: ['نساء', 'أسر فقيرة'],
    awards: []
  },
  {
    id: 4,
    name: 'مؤسسة عدن للتمويل الأصغر',
    nameEn: 'Aden Microfinance Foundation',
    code: 'AMF',
    type: 'مؤسسة تمويل أصغر',
    typeEn: 'MFI',
    founded: 2003,
    headquarters: 'عدن',
    branches: 12,
    activeClients: 28000,
    loanPortfolio: 8200000,
    deposits: 4500000,
    par30: 6.2,
    oss: 88,
    status: 'عامل',
    logo: null,
    website: null,
    jurisdiction: 'عدن',
    products: ['قروض صغرى', 'قروض متوسطة', 'توفير'],
    targetGroups: ['تجار صغار', 'نساء', 'شباب'],
    awards: []
  },
  {
    id: 5,
    name: 'مؤسسة نماء للتمويل الأصغر',
    nameEn: 'Namaa Microfinance Institution',
    code: 'NMFI',
    type: 'مؤسسة تمويل أصغر',
    typeEn: 'MFI',
    founded: 2008,
    headquarters: 'تعز',
    branches: 8,
    activeClients: 18000,
    loanPortfolio: 5500000,
    deposits: 2800000,
    par30: 7.1,
    oss: 82,
    status: 'عامل',
    logo: null,
    website: null,
    jurisdiction: 'عدن',
    products: ['قروض فردية', 'قروض جماعية'],
    targetGroups: ['نساء', 'مزارعين'],
    awards: []
  },
  {
    id: 6,
    name: 'مؤسسة الوطن للتمويل الأصغر',
    nameEn: 'Al-Watan Microfinance Institution',
    code: 'WMFI',
    type: 'مؤسسة تمويل أصغر',
    typeEn: 'MFI',
    founded: 2006,
    headquarters: 'حضرموت',
    branches: 6,
    activeClients: 12000,
    loanPortfolio: 3800000,
    deposits: 1900000,
    par30: 4.5,
    oss: 91,
    status: 'عامل',
    logo: null,
    website: null,
    jurisdiction: 'عدن',
    products: ['قروض صغرى', 'توفير'],
    targetGroups: ['صيادين', 'تجار', 'نساء'],
    awards: []
  }
];

// Sector KPIs
const SECTOR_KPIS = {
  totalMFIs: 12,
  activeBorrowers: 680000,
  totalPortfolio: 195000000, // USD
  averageLoanSize: 287, // USD
  womenBorrowers: 68, // percentage
  par30Average: 5.2, // percentage
  ossAverage: 89, // percentage
  youthBorrowers: 35, // percentage
};

// Historical data
const HISTORICAL_DATA = [
  { year: 2010, borrowers: 120000, portfolio: 35, par30: 2.1 },
  { year: 2012, borrowers: 280000, portfolio: 78, par30: 2.8 },
  { year: 2014, borrowers: 450000, portfolio: 145, par30: 3.2 },
  { year: 2015, borrowers: 380000, portfolio: 125, par30: 8.5 }, // Conflict starts
  { year: 2016, borrowers: 320000, portfolio: 98, par30: 15.2 },
  { year: 2018, borrowers: 420000, portfolio: 120, par30: 9.8 },
  { year: 2020, borrowers: 520000, portfolio: 155, par30: 7.2 },
  { year: 2022, borrowers: 610000, portfolio: 175, par30: 5.8 },
  { year: 2024, borrowers: 680000, portfolio: 195, par30: 5.2 },
];

// Key reports and resources
const REPORTS = [
  {
    title: 'تقرير قطاع التمويل الأصغر في اليمن 2024',
    titleEn: 'Yemen Microfinance Sector Report 2024',
    source: 'شبكة التمويل الأصغر اليمنية',
    sourceEn: 'Yemen Microfinance Network',
    url: '/research?category=microfinance',
    date: '2024-06'
  },
  {
    title: 'تأثير الصراع على التمويل الأصغر',
    titleEn: 'Conflict Impact on Microfinance',
    source: 'CGAP',
    sourceEn: 'CGAP',
    url: 'https://www.cgap.org/research/publication/microfinance-conflict-affected-countries',
    date: '2023-11'
  },
  {
    title: 'الشمول المالي في اليمن',
    titleEn: 'Financial Inclusion in Yemen',
    source: 'البنك الدولي',
    sourceEn: 'World Bank',
    url: 'https://www.worldbank.org/en/topic/financialinclusion',
    date: '2024-03'
  },
  {
    title: 'دور التمويل الأصغر في التعافي الاقتصادي',
    titleEn: 'Role of Microfinance in Economic Recovery',
    source: 'UNDP Yemen',
    sourceEn: 'UNDP Yemen',
    url: 'https://www.undp.org/yemen',
    date: '2024-01'
  }
];

// Format currency in millions
function formatCurrencyMillions(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(0)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

// Format number with commas
function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export default function Microfinance() {
  const [activeTab, setActiveTab] = useState('overview');
  // Using sonner toast

  const handleComingSoon = (feature: string) => {
    toast.info(`${feature} - هذه الميزة قيد التطوير`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 text-white py-12">
        <div className="container">
          <div className="flex items-center gap-2 text-emerald-200 mb-4">
            <Link href="/sectors/banking" className="hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4 inline" />
              العودة إلى قطاع المصارف
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="h-10 w-10" />
                <h1 className="text-3xl font-bold">قطاع التمويل الأصغر</h1>
              </div>
              <p className="text-emerald-100 text-lg max-w-2xl">
                تحليل شامل لقطاع التمويل الأصغر في اليمن - الشمول المالي وتمكين الفئات المهمشة
              </p>
            </div>
            <Badge variant="outline" className="bg-emerald-900/50 text-emerald-100 border-emerald-500">
              آخر تحديث: 14 يناير 2026
            </Badge>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200 text-sm">عدد المؤسسات</span>
                  <Building2 className="h-5 w-5 text-emerald-300" />
                </div>
                <div className="text-2xl font-bold mt-1">{SECTOR_KPIS.totalMFIs}</div>
                <div className="text-xs text-emerald-200">مؤسسة تمويل أصغر</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200 text-sm">المقترضين النشطين</span>
                  <Users className="h-5 w-5 text-emerald-300" />
                </div>
                <div className="text-2xl font-bold mt-1">{formatNumber(SECTOR_KPIS.activeBorrowers)}</div>
                <div className="text-xs text-emerald-200">{SECTOR_KPIS.womenBorrowers}% نساء</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200 text-sm">محفظة القروض</span>
                  <DollarSign className="h-5 w-5 text-emerald-300" />
                </div>
                <div className="text-2xl font-bold mt-1">{formatCurrencyMillions(SECTOR_KPIS.totalPortfolio)}</div>
                <div className="text-xs text-emerald-200">متوسط القرض: ${SECTOR_KPIS.averageLoanSize}</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200 text-sm">جودة المحفظة</span>
                  <Target className="h-5 w-5 text-emerald-300" />
                </div>
                <div className="text-2xl font-bold mt-1">{SECTOR_KPIS.par30Average}%</div>
                <div className="text-xs text-emerald-200">PAR &gt; 30 يوم</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="institutions">المؤسسات</TabsTrigger>
                <TabsTrigger value="impact">الأثر الاجتماعي</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                {/* Historical Chart */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      تطور قطاع التمويل الأصغر (2010-2024)
                    </CardTitle>
                    <CardDescription>
                      عدد المقترضين ومحفظة القروض بالمليون دولار
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {HISTORICAL_DATA.map((data, index) => (
                        <div key={data.year} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                            style={{ height: `${(data.portfolio / 200) * 100}%` }}
                            title={`${data.year}: $${data.portfolio}M`}
                          />
                          <span className="text-xs text-muted-foreground mt-2">{data.year}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">2010 (ما قبل الصراع)</div>
                        <div className="text-lg font-bold text-emerald-600">$35M</div>
                        <div className="text-xs text-muted-foreground">120,000 مقترض</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">2016 (ذروة الأزمة)</div>
                        <div className="text-lg font-bold text-red-600">$98M</div>
                        <div className="text-xs text-muted-foreground">320,000 مقترض</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">2024 (الحالي)</div>
                        <div className="text-lg font-bold text-emerald-600">$195M</div>
                        <div className="text-xs text-muted-foreground">680,000 مقترض</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        نقاط القوة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 shrink-0">1</Badge>
                          <span>نسبة عالية من المقترضات النساء (68%)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 shrink-0">2</Badge>
                          <span>تعافي سريع بعد صدمة 2015-2016</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 shrink-0">3</Badge>
                          <span>انتشار جغرافي واسع في المناطق الريفية</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 shrink-0">4</Badge>
                          <span>منتجات متوافقة مع الشريعة الإسلامية</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        التحديات
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 shrink-0">1</Badge>
                          <span>ارتفاع معدل التعثر (PAR30) مقارنة بالمعايير الدولية</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 shrink-0">2</Badge>
                          <span>صعوبة الوصول للمناطق المتأثرة بالصراع</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 shrink-0">3</Badge>
                          <span>تقلبات سعر الصرف تؤثر على قيمة القروض</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 shrink-0">4</Badge>
                          <span>محدودية التمويل الدولي</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Yemen Microfinance Network */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      شبكة التمويل الأصغر اليمنية (YMN)
                    </CardTitle>
                    <CardDescription>
                      الجهة المنظمة لقطاع التمويل الأصغر في اليمن
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm text-muted-foreground">تأسست</div>
                        <div className="font-bold">2009</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm text-muted-foreground">الأعضاء</div>
                        <div className="font-bold">12 مؤسسة</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm text-muted-foreground">الشركاء الدوليين</div>
                        <div className="font-bold">CGAP, MIX, UNDP</div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h4 className="font-semibold text-emerald-800 mb-2">الأهداف الاستراتيجية</h4>
                      <ul className="text-sm text-emerald-700 space-y-1">
                        <li>• تعزيز الشمول المالي للفئات المهمشة</li>
                        <li>• تطوير القدرات المؤسسية للأعضاء</li>
                        <li>• الدفاع عن مصالح القطاع لدى صانعي السياسات</li>
                        <li>• تبادل المعرفة وأفضل الممارسات</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="institutions">
                <Card>
                  <CardHeader>
                    <CardTitle>مؤسسات التمويل الأصغر</CardTitle>
                    <CardDescription>
                      قائمة بمؤسسات التمويل الأصغر العاملة في اليمن
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {MFI_DATA.map((mfi) => (
                        <div key={mfi.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                {mfi.logo ? (
                                  <img src={mfi.logo} alt={mfi.name} className="w-10 h-10 object-contain" />
                                ) : (
                                  <Wallet className="h-6 w-6 text-emerald-600" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold">{mfi.name}</h3>
                                <p className="text-sm text-muted-foreground">{mfi.code} • {mfi.type}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{mfi.jurisdiction}</Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={mfi.status === 'عامل' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}
                                  >
                                    {mfi.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleComingSoon('صفحة تفاصيل المؤسسة')}
                            >
                              تفاصيل
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                            <div>
                              <div className="text-xs text-muted-foreground">المقترضين</div>
                              <div className="font-semibold">{formatNumber(mfi.activeClients)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">المحفظة</div>
                              <div className="font-semibold">{formatCurrencyMillions(mfi.loanPortfolio)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">PAR30</div>
                              <div className={`font-semibold ${mfi.par30 > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {mfi.par30}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">الفروع</div>
                              <div className="font-semibold">{mfi.branches}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="impact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-pink-500" />
                        تمكين المرأة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                          <span>نسبة المقترضات النساء</span>
                          <span className="font-bold text-pink-600">68%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                          <span>قروض المشاريع النسائية</span>
                          <span className="font-bold text-pink-600">$85M</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                          <span>معدل السداد للنساء</span>
                          <span className="font-bold text-pink-600">97%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          يلعب التمويل الأصغر دوراً محورياً في تمكين المرأة اليمنية اقتصادياً، 
                          خاصة في ظل الصراع حيث أصبحت كثير من النساء المعيلات الرئيسيات لأسرهن.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        الوصول للفئات المهمشة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span>المناطق الريفية</span>
                          <span className="font-bold text-blue-600">55%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span>النازحين داخلياً</span>
                          <span className="font-bold text-blue-600">12%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span>الشباب (18-35)</span>
                          <span className="font-bold text-blue-600">35%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          تستهدف مؤسسات التمويل الأصغر الفئات الأكثر احتياجاً والمستبعدة من النظام المصرفي التقليدي.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-emerald-500" />
                        توزيع القروض حسب القطاع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                          <div className="text-2xl font-bold text-emerald-600">42%</div>
                          <div className="text-sm text-muted-foreground">تجارة صغيرة</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">28%</div>
                          <div className="text-sm text-muted-foreground">زراعة</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">18%</div>
                          <div className="text-sm text-muted-foreground">خدمات</div>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-lg">
                          <div className="text-2xl font-bold text-amber-600">12%</div>
                          <div className="text-sm text-muted-foreground">صناعات صغيرة</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  روابط سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a 
                  href="https://www.alkuraimi.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                >
                  <Landmark className="h-4 w-4 text-emerald-600" />
                  بنك الكريمي للتمويل الأصغر
                </a>
                <a 
                  href="https://www.sfd-yemen.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                >
                  <Building2 className="h-4 w-4 text-blue-600" />
                  صندوق التنمية الاجتماعية
                </a>
                <a 
                  href="https://www.cgap.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                >
                  <Globe className="h-4 w-4 text-purple-600" />
                  CGAP - الشمول المالي
                </a>
                <Link 
                  href="/sectors/banking"
                  className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                >
                  <Landmark className="h-4 w-4 text-slate-600" />
                  قطاع المصارف والتمويل
                </Link>
              </CardContent>
            </Card>

            {/* Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  التقارير والدراسات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {REPORTS.map((report, index) => (
                  <a 
                    key={index}
                    href={report.url}
                    target={report.url.startsWith('http') ? '_blank' : undefined}
                    rel={report.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-medium text-sm">{report.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {report.source} • {report.date}
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  مصادر البيانات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• شبكة التمويل الأصغر اليمنية (YMN)</p>
                  <p>• MIX Market Database</p>
                  <p>• CGAP Reports</p>
                  <p>• البنك المركزي اليمني</p>
                  <p>• تقارير المؤسسات السنوية</p>
                </div>
                <Link href="/methodology">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    منهجية البيانات
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sources Used Panel */}
      <SourcesUsedPanel sectorCode="microfinance" />
    </div>
  );
}
