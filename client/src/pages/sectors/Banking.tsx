import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  FileText,
  Download,
  Search,
  Filter,
  ChevronRight,
  Landmark,
  DollarSign,
  Percent,
  Users,
  MapPin,
  ExternalLink,
  BarChart3,
  Scale,
  Calculator,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

// Format large numbers
function formatCurrency(value: number | null | undefined, compact = false): string {
  if (value === null || value === undefined) return "N/A";
  if (compact) {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  }
  return `$${value.toLocaleString()}`;
}

function formatPercent(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return "N/A";
  return `${numValue.toFixed(1)}%`;
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    operational: { variant: "default", label: "عامل" },
    limited: { variant: "secondary", label: "محدود" },
    distressed: { variant: "destructive", label: "متعثر" },
    suspended: { variant: "outline", label: "موقوف" },
    liquidation: { variant: "destructive", label: "تصفية" },
  };
  const { variant, label } = config[status] || { variant: "outline", label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

// Jurisdiction badge
function JurisdictionBadge({ jurisdiction }: { jurisdiction: string }) {
  const colors: Record<string, string> = {
    aden: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    sanaa: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    both: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };
  const labels: Record<string, string> = {
    aden: "عدن",
    sanaa: "صنعاء",
    both: "عدن/صنعاء",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[jurisdiction] || ""}`}>
      {labels[jurisdiction] || jurisdiction}
    </span>
  );
}

export default function BankingSector() {
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>("all");
  const [bankTypeFilter, setBankTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch data - using type assertions to handle tRPC type generation lag
  const { data: banks, isLoading: banksLoading } = (trpc as any).banking.getBanks.useQuery({
    jurisdiction: jurisdictionFilter as any,
    bankType: bankTypeFilter as any,
    status: statusFilter as any,
    search: searchQuery || undefined,
  });

  const { data: sectorMetrics, isLoading: metricsLoading } = (trpc as any).banking.getSectorMetrics.useQuery();
  const { data: watchList } = (trpc as any).banking.getBanksUnderWatch.useQuery();
  const { data: directives } = (trpc as any).banking.getDirectives.useQuery({ limit: 10 });
  const { data: historicalData } = (trpc as any).banking.getSectorTimeSeries.useQuery({ 
    metric: 'totalAssets',
    startYear: 2010,
    endYear: 2025
  });

  // Calculate totals
  const totals = useMemo(() => {
    if (!banks || banks.length === 0) return null;
    const parseNum = (val: any) => {
      if (val === null || val === undefined) return 0;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) ? 0 : num;
    };
    const total = banks.reduce(
      (acc: { assets: number; branches: number; count: number }, bank: any) => ({
        assets: acc.assets + parseNum(bank.totalAssets),
        branches: acc.branches + parseNum(bank.branchCount),
        count: acc.count + 1,
      }),
      { assets: 0, branches: 0, count: 0 }
    );
    const validCARBanks = banks.filter((b: any) => parseNum(b.capitalAdequacyRatio) > 0);
    const validNPLBanks = banks.filter((b: any) => parseNum(b.nonPerformingLoans) > 0);
    const avgCAR = validCARBanks.length > 0 
      ? validCARBanks.reduce((sum: number, b: any) => sum + parseNum(b.capitalAdequacyRatio), 0) / validCARBanks.length 
      : 0;
    const avgNPL = validNPLBanks.length > 0 
      ? validNPLBanks.reduce((sum: number, b: any) => sum + parseNum(b.nonPerformingLoans), 0) / validNPLBanks.length 
      : 0;
    return { ...total, avgCAR, avgNPL };
  }, [banks]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900" dir="rtl">
      {/* Hero Section */}
      <div className="relative h-[300px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('/images/cby-building.jpg')`,
            filter: "brightness(0.4)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Landmark className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">قطاع المصارف والتمويل</h1>
              <p className="text-white/80">تحليل شامل للقطاع المصرفي في اليمن</p>
            </div>
          </div>
          
          {/* Key Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Building2 className="h-4 w-4" />
                <span>عدد البنوك</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {totals?.count || 0}
                <span className="text-sm font-normal text-white/60 mr-2">بنك</span>
              </div>
              <div className="text-xs text-white/50 mt-1">
                عدن: {sectorMetrics?.adenStats?.bankCount || 0} | صنعاء: {sectorMetrics?.sanaaStats?.bankCount || 0}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <DollarSign className="h-4 w-4" />
                <span>إجمالي الأصول</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(totals?.assets, true)}
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+3.1% عن العام الماضي</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Shield className="h-4 w-4" />
                <span>نسبة كفاية رأس المال</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatPercent(totals?.avgCAR)}
              </div>
              <div className="text-xs text-white/50 mt-1">
                الحد الأدنى المطلوب: 12%
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span>القروض غير العاملة</span>
              </div>
              <div className="text-2xl font-bold text-amber-400">
                {formatPercent(totals?.avgNPL)}
              </div>
              <div className="text-xs text-white/50 mt-1">
                المعدل الإقليمي: 5%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="banks">البنوك العاملة</TabsTrigger>
                <TabsTrigger value="comparison">مقارنة النظامين</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Historical Time Series Chart */}
                {historicalData && historicalData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            تطور القطاع المصرفي (2010-2025)
                          </CardTitle>
                          <CardDescription>إجمالي أصول القطاع المصرفي بالمليون دولار</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 ml-2" />
                          تصدير البيانات
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={historicalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="year" className="text-xs" />
                            <YAxis className="text-xs" tickFormatter={(value) => `$${(value / 1000).toFixed(1)}B`} />
                            <Tooltip 
                              formatter={(value: number) => [`$${value.toLocaleString()}M`, 'إجمالي الأصول']}
                              labelFormatter={(label) => `السنة: ${label}`}
                              contentStyle={{ direction: 'rtl', textAlign: 'right' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="total" 
                              stroke="#3b82f6" 
                              fillOpacity={1} 
                              fill="url(#colorAssets)" 
                              strokeWidth={2}
                              name="إجمالي الأصول"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">2010 (قبل الصراع)</div>
                          <div className="text-lg font-bold text-primary">${((historicalData.find((d: any) => d.year === 2010)?.total || 0) / 1000).toFixed(1)}B</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">2016 (انقسام البنك المركزي)</div>
                          <div className="text-lg font-bold text-amber-600">${((historicalData.find((d: any) => d.year === 2016)?.total || 0) / 1000).toFixed(1)}B</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">2020 (كوفيد)</div>
                          <div className="text-lg font-bold text-red-600">${((historicalData.find((d: any) => d.year === 2020)?.total || 0) / 1000).toFixed(1)}B</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">2025 (الحالي)</div>
                          <div className="text-lg font-bold text-emerald-600">${((historicalData.find((d: any) => d.year === 2025)?.total || 0) / 1000).toFixed(1)}B</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Banks Table */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>البنوك الرئيسية</CardTitle>
                      <CardDescription>قائمة بأكبر البنوك من حيث الأصول</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("banks")}>
                      عرض الكل
                      <ChevronRight className="h-4 w-4 mr-2" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {banksLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b text-right">
                              <th className="pb-3 font-medium text-muted-foreground">اسم البنك</th>
                              <th className="pb-3 font-medium text-muted-foreground">الجهة</th>
                              <th className="pb-3 font-medium text-muted-foreground">الأصول (مليون$)</th>
                              <th className="pb-3 font-medium text-muted-foreground">نسبة كفاية رأس المال</th>
                              <th className="pb-3 font-medium text-muted-foreground">الحالة</th>
                              <th className="pb-3 font-medium text-muted-foreground">التفاصيل</th>
                            </tr>
                          </thead>
                          <tbody>
                            {banks?.slice(0, 10).map((bank: any) => (
                              <tr key={bank.id} className="border-b last:border-0 hover:bg-muted/50">
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Landmark className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{bank.nameAr || bank.name}</div>
                                      <div className="text-xs text-muted-foreground">{bank.acronym}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <JurisdictionBadge jurisdiction={bank.jurisdiction} />
                                </td>
                                <td className="py-3 font-mono">
                                  {bank.totalAssets ? parseFloat(bank.totalAssets).toLocaleString() : "N/A"}
                                </td>
                                <td className="py-3">
                                  <span className={bank.capitalAdequacyRatio && bank.capitalAdequacyRatio >= 12 ? "text-emerald-600" : "text-amber-600"}>
                                    {formatPercent(bank.capitalAdequacyRatio)}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <StatusBadge status={bank.operationalStatus} />
                                </td>
                                <td className="py-3">
                                  <Button variant="ghost" size="sm">
                                    عرض
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Banks Under Watch */}
                {watchList && watchList.length > 0 && (
                  <Card className="border-amber-200 dark:border-amber-900">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <CardTitle>البنوك تحت المراقبة</CardTitle>
                      </div>
                      <CardDescription>بنوك تواجه تحديات تشغيلية أو تنظيمية</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {watchList.map((bank: any) => (
                          <div key={bank.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="h-5 w-5 text-amber-500" />
                              <div>
                                <div className="font-medium">{bank.nameAr || bank.name}</div>
                                <div className="text-sm text-muted-foreground">{bank.watchReason}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={bank.operationalStatus} />
                              {bank.sanctionsStatus !== "none" && (
                                <Badge variant="destructive">{bank.sanctionsStatus.toUpperCase()}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Trends & Challenges */}
                <Card>
                  <CardHeader>
                    <CardTitle>الاتجاهات والتحديات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                            <span className="text-red-600 font-bold">1</span>
                          </div>
                          <h4 className="font-semibold">أزمة السيولة</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          نقص العملة المحلية أدى أزمة السيولة الحادة في المناطق الخاضعة لسيطرة الحوثيين
                        </p>
                      </div>
                      
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                            <span className="text-amber-600 font-bold">2</span>
                          </div>
                          <h4 className="font-semibold">الانقسام المؤسسي</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          تنقسم البنك المركزي اليمني القسم بين البنك المركزي في عدن والبنك في صنعاء
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <span className="text-purple-600 font-bold">3</span>
                          </div>
                          <h4 className="font-semibold">العقوبات الدولية</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          تواجه العقوبات الدولية أثر البنوك التي على استمرار العقوبات الدولية
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analytical Tools */}
                <Card>
                  <CardHeader>
                    <CardTitle>الأدوات التحليلية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Link href="/tools/bank-comparison">
                        <div className="p-4 text-center rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                          <Scale className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <div className="font-medium">مقارنة البنوك</div>
                        </div>
                      </Link>
                      <Link href="/tools/risk-analysis">
                        <div className="p-4 text-center rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                          <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <div className="font-medium">تحليل المخاطر</div>
                        </div>
                      </Link>
                      <Link href="/tools/policy-simulator">
                        <div className="p-4 text-center rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                          <Calculator className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <div className="font-medium">محاكي السياسات</div>
                        </div>
                      </Link>
                      <Link href="/tools/compliance">
                        <div className="p-4 text-center rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <div className="font-medium">تقييم الامتثال</div>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Banks Tab */}
              <TabsContent value="banks" className="space-y-6">
                {/* Filters */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="البحث عن بنك..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10"
                          />
                        </div>
                      </div>
                      <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="الجهة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الكل</SelectItem>
                          <SelectItem value="aden">عدن</SelectItem>
                          <SelectItem value="sanaa">صنعاء</SelectItem>
                          <SelectItem value="both">كلاهما</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={bankTypeFilter} onValueChange={setBankTypeFilter}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="نوع البنك" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الكل</SelectItem>
                          <SelectItem value="commercial">تجاري</SelectItem>
                          <SelectItem value="islamic">إسلامي</SelectItem>
                          <SelectItem value="specialized">متخصص</SelectItem>
                          <SelectItem value="microfinance">تمويل أصغر</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الكل</SelectItem>
                          <SelectItem value="operational">عامل</SelectItem>
                          <SelectItem value="limited">محدود</SelectItem>
                          <SelectItem value="distressed">متعثر</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Full Banks List */}
                <Card>
                  <CardHeader>
                    <CardTitle>جميع البنوك ({banks?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {banksLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {banks?.map((bank: any) => (
                          <div
                            key={bank.id}
                            className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Landmark className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <div className="font-semibold">{bank.nameAr || bank.name}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span>{bank.acronym}</span>
                                  {bank.swiftCode && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono text-xs">{bank.swiftCode}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-left">
                                <div className="text-sm text-muted-foreground">الأصول</div>
                                <div className="font-semibold">{formatCurrency(bank.totalAssets, true)}</div>
                              </div>
                              <div className="text-left">
                                <div className="text-sm text-muted-foreground">CAR</div>
                                <div className={`font-semibold ${bank.capitalAdequacyRatio && bank.capitalAdequacyRatio >= 12 ? "text-emerald-600" : "text-amber-600"}`}>
                                  {formatPercent(bank.capitalAdequacyRatio)}
                                </div>
                              </div>
                              <JurisdictionBadge jurisdiction={bank.jurisdiction} />
                              <StatusBadge status={bank.operationalStatus} />
                              <Button variant="outline" size="sm">
                                التفاصيل
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Comparison Tab */}
              <TabsContent value="comparison" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aden Stats */}
                  <Card className="border-emerald-200 dark:border-emerald-900">
                    <CardHeader className="bg-emerald-50 dark:bg-emerald-950/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                          <MapPin className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <CardTitle>عدن</CardTitle>
                          <CardDescription>البنك المركزي اليمني - عدن</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">عدد البنوك</div>
                          <div className="text-2xl font-bold">{sectorMetrics?.adenStats?.bankCount || 0}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">إجمالي الأصول</div>
                          <div className="text-2xl font-bold">{formatCurrency(sectorMetrics?.adenStats?.totalAssets, true)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">متوسط CAR</div>
                          <div className="text-2xl font-bold text-emerald-600">{formatPercent(sectorMetrics?.adenStats?.avgCAR)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">متوسط NPL</div>
                          <div className="text-2xl font-bold text-amber-600">{formatPercent(sectorMetrics?.adenStats?.avgNPL)}</div>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">نقاط القوة</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            اعتراف دولي بالبنك المركزي
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            وصول أفضل للنظام المالي العالمي
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            نسب كفاية رأس مال أعلى
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sanaa Stats */}
                  <Card className="border-amber-200 dark:border-amber-900">
                    <CardHeader className="bg-amber-50 dark:bg-amber-950/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                          <MapPin className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <CardTitle>صنعاء</CardTitle>
                          <CardDescription>البنك المركزي اليمني - صنعاء</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">عدد البنوك</div>
                          <div className="text-2xl font-bold">{sectorMetrics?.sanaaStats?.bankCount || 0}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">إجمالي الأصول</div>
                          <div className="text-2xl font-bold">{formatCurrency(sectorMetrics?.sanaaStats?.totalAssets, true)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">متوسط CAR</div>
                          <div className="text-2xl font-bold text-amber-600">{formatPercent(sectorMetrics?.sanaaStats?.avgCAR)}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">متوسط NPL</div>
                          <div className="text-2xl font-bold text-red-600">{formatPercent(sectorMetrics?.sanaaStats?.avgNPL)}</div>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">التحديات</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            عزلة عن النظام المالي الدولي
                          </li>
                          <li className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            أزمة سيولة حادة
                          </li>
                          <li className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            ارتفاع نسب القروض المتعثرة
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CBY Directives */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">التنبيهات القطاعية</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-r-4 border-blue-500">
                    <div className="text-sm font-medium">تحذير للمقيمين في البنك المركزي في عدن</div>
                    <div className="text-xs text-muted-foreground mt-1">انخفاض قيمة الريال اليمني في مناطق سيطرة الحوثيين</div>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border-r-4 border-amber-500">
                    <div className="text-sm font-medium">تحديثات إجراءات الامتثال</div>
                    <div className="text-xs text-muted-foreground mt-1">2024/04/25</div>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border-r-4 border-emerald-500">
                    <div className="text-sm font-medium">تعميم بشأن الحوالات الخارجية</div>
                    <div className="text-xs text-muted-foreground mt-1">2024/03/15</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  عرض جميع التنبيهات
                </Button>
              </CardContent>
            </Card>

            {/* Tracked Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المؤشرات المتابعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">سعر صرف الريال للدولار</span>
                    <span className="font-mono text-sm">1,890</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">سعر صرف الريال للدولار صنعاء</span>
                    <span className="font-mono text-sm">530</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">معدل التضخم السنوي</span>
                    <span className="font-mono text-sm">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Downloads */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">التحميلات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Download className="h-4 w-4 ml-2" />
                    تقرير القطاع 2024
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Download className="h-4 w-4 ml-2" />
                    قائمة المصارف المرخصة (PDF)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sector Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">التقارير القطاعية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/research?category=banking">
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">تقرير الاستقرار المالي 2024</span>
                    </div>
                  </Link>
                  <Link href="/research?category=banking">
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">تحليل سوق الصرافة اليمني</span>
                    </div>
                  </Link>
                  <Link href="/research?category=banking">
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">مؤشرات الشمول المالي</span>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
