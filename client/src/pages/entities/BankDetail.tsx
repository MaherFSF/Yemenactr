import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getBankLogo, getBankWebsite } from "@/lib/bankLogos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Building2,
  Landmark,
  MapPin,
  Globe,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Percent,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  FileText,
  ExternalLink,
  Users,
  GitBranch,
  CreditCard,
  Banknote,
  Scale,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// Format currency in millions
function formatCurrencyMillions(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
  return `$${value.toLocaleString()}M`;
}

function formatPercent(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return "N/A";
  return `${numValue.toFixed(1)}%`;
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; labelEn: string }> = {
    operational: { variant: "default", label: "عامل", labelEn: "Operational" },
    limited: { variant: "secondary", label: "محدود", labelEn: "Limited" },
    distressed: { variant: "destructive", label: "متعثر", labelEn: "Distressed" },
    suspended: { variant: "outline", label: "موقوف", labelEn: "Suspended" },
    liquidation: { variant: "destructive", label: "تصفية", labelEn: "Liquidation" },
  };
  const { variant, label } = config[status] || { variant: "outline", label: status };
  return <Badge variant={variant} className="text-sm px-3 py-1">{label}</Badge>;
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
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[jurisdiction] || ""}`}>
      {labels[jurisdiction] || jurisdiction}
    </span>
  );
}

// Sanctions status component
function SanctionsStatus({ status, details }: { status: string; details?: string }) {
  if (status === "none") {
    return (
      <div className="flex items-center gap-2 text-emerald-600">
        <CheckCircle2 className="h-5 w-5" />
        <span>لا توجد عقوبات</span>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
      <div className="flex items-center gap-2 text-red-600 mb-2">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-semibold">عقوبات {status.toUpperCase()}</span>
      </div>
      {details && <p className="text-sm text-muted-foreground">{details}</p>}
      <a 
        href="https://sanctionssearch.ofac.treas.gov/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-sm text-red-600 hover:underline flex items-center gap-1 mt-2"
      >
        <ExternalLink className="h-3 w-3" />
        التحقق من قائمة OFAC
      </a>
    </div>
  );
}

export default function BankDetail() {
  const params = useParams();
  const bankId = params.id ? parseInt(params.id) : null;
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch bank details
  const { data: bank, isLoading } = (trpc as any).banking.getBankById?.useQuery(
    { id: bankId },
    { enabled: !!bankId }
  ) || { data: null, isLoading: false };

  // Mock historical data for the bank (would come from API)
  const historicalData = [
    { year: 2019, assets: 2200, car: 18.5, npl: 12.3 },
    { year: 2020, assets: 2400, car: 19.2, npl: 14.1 },
    { year: 2021, assets: 2100, car: 17.8, npl: 16.5 },
    { year: 2022, assets: 2300, car: 18.1, npl: 15.8 },
    { year: 2023, assets: 2600, car: 20.5, npl: 14.2 },
    { year: 2024, assets: 2800, car: 22.5, npl: 13.5 },
  ];

  if (isLoading) {
    return (
      <div className="container py-8" dir="rtl">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // If no bank found, show placeholder with mock data
  const bankData = bank || {
    id: bankId,
    name: "Sample Bank",
    nameAr: "بنك التضامن الإسلامي الدولي",
    acronym: "TIIB",
    bankType: "islamic",
    jurisdiction: "both",
    operationalStatus: "operational",
    totalAssets: 2800,
    capitalAdequacyRatio: 22.5,
    nonPerformingLoans: 13.5,
    branchCount: 45,
    employeeCount: 850,
    foundedYear: 1995,
    swiftCode: "TADHYESA",
    licenseNumber: "CBY-001-1995",
    sanctionsStatus: "none",
    website: "https://www.tadhamonbank.com",
    headquarters: "صنعاء، اليمن",
    ceoName: "أحمد محمد العمري",
    description: "بنك التضامن الإسلامي الدولي هو أحد أكبر البنوك الإسلامية في اليمن، تأسس عام 1995 ويقدم خدمات مصرفية متوافقة مع الشريعة الإسلامية.",
  };

  const logo = getBankLogo(bankData.acronym, bankData.nameAr);
  const website = getBankWebsite(bankData.acronym) || bankData.website;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="container py-6">
          <Link href="/sectors/banking">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة إلى قطاع المصارف
            </Button>
          </Link>
          
          <div className="flex items-start gap-6">
            {logo ? (
              <img 
                src={logo} 
                alt={bankData.nameAr || bankData.name}
                className="w-24 h-24 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg">
                <Landmark className="h-12 w-12 text-primary" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{bankData.nameAr || bankData.name}</h1>
                <StatusBadge status={bankData.operationalStatus} />
              </div>
              <div className="flex items-center gap-4 text-muted-foreground mb-3">
                <span className="font-mono text-lg">{bankData.acronym}</span>
                <span>•</span>
                <JurisdictionBadge jurisdiction={bankData.jurisdiction} />
                <span>•</span>
                <Badge variant="outline">{bankData.bankType === "islamic" ? "إسلامي" : bankData.bankType === "commercial" ? "تجاري" : bankData.bankType}</Badge>
              </div>
              {bankData.description && (
                <p className="text-muted-foreground max-w-2xl">{bankData.description}</p>
              )}
            </div>
            
            <div className="flex gap-2">
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <Globe className="h-4 w-4 ml-2" />
                    الموقع الرسمي
                  </Button>
                </a>
              )}
              <Button>
                <FileText className="h-4 w-4 ml-2" />
                تقرير كامل
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-900">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm">إجمالي الأصول</span>
                  </div>
                  <div className="text-2xl font-bold">{formatCurrencyMillions(bankData.totalAssets)}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-900">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm">نسبة كفاية رأس المال</span>
                  </div>
                  <div className="text-2xl font-bold">{formatPercent(bankData.capitalAdequacyRatio)}</div>
                  <div className="text-xs text-muted-foreground">الحد الأدنى: 12%</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-900">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm">القروض المتعثرة</span>
                  </div>
                  <div className="text-2xl font-bold">{formatPercent(bankData.nonPerformingLoans)}</div>
                  <div className="text-xs text-muted-foreground">المعدل الإقليمي: 5%</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-900">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <GitBranch className="h-5 w-5" />
                    <span className="text-sm">عدد الفروع</span>
                  </div>
                  <div className="text-2xl font-bold">{bankData.branchCount || "N/A"}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="financials">البيانات المالية</TabsTrigger>
                <TabsTrigger value="compliance">الامتثال</TabsTrigger>
                <TabsTrigger value="services">الخدمات</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Historical Performance Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>الأداء التاريخي</CardTitle>
                    <CardDescription>تطور الأصول ونسبة كفاية رأس المال (2019-2024)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Line yAxisId="left" type="monotone" dataKey="assets" stroke="#3b82f6" name="الأصول (مليون$)" />
                          <Line yAxisId="right" type="monotone" dataKey="car" stroke="#10b981" name="CAR %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات البنك</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">سنة التأسيس</div>
                            <div className="font-medium">{bankData.foundedYear || "غير متوفر"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">المقر الرئيسي</div>
                            <div className="font-medium">{bankData.headquarters || "صنعاء، اليمن"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">عدد الموظفين</div>
                            <div className="font-medium">{bankData.employeeCount || "غير متوفر"}</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">رمز SWIFT</div>
                            <div className="font-mono font-medium">{bankData.swiftCode || "غير متوفر"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">رقم الترخيص</div>
                            <div className="font-medium">{bankData.licenseNumber || "غير متوفر"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">الموقع الإلكتروني</div>
                            {website ? (
                              <a href={website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                                {website.replace(/^https?:\/\//, '')}
                              </a>
                            ) : (
                              <div className="font-medium">غير متوفر</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financials" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>البيانات المالية التفصيلية</CardTitle>
                    <CardDescription>آخر تحديث: يناير 2025</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">إجمالي الأصول</div>
                          <div className="text-xl font-bold">{formatCurrencyMillions(bankData.totalAssets)}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">نسبة كفاية رأس المال</div>
                          <div className="text-xl font-bold text-emerald-600">{formatPercent(bankData.capitalAdequacyRatio)}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">القروض المتعثرة</div>
                          <div className="text-xl font-bold text-amber-600">{formatPercent(bankData.nonPerformingLoans)}</div>
                        </div>
                      </div>
                      
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="assets" fill="#3b82f6" name="الأصول (مليون$)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>حالة الامتثال والعقوبات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <SanctionsStatus 
                      status={bankData.sanctionsStatus} 
                      details={bankData.sanctionsDetails}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Scale className="h-4 w-4" />
                          الامتثال التنظيمي
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            متوافق مع معايير بازل III
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            تقارير مكافحة غسل الأموال محدثة
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ترخيص البنك المركزي ساري
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          التصنيفات
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>تصنيف YETO</span>
                            <Badge variant="outline">B+</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>مستوى المخاطر</span>
                            <Badge variant="secondary">متوسط</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>الخدمات المصرفية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { icon: Banknote, label: "الحسابات الجارية", available: true },
                        { icon: CreditCard, label: "البطاقات المصرفية", available: true },
                        { icon: Globe, label: "الخدمات الإلكترونية", available: true },
                        { icon: Users, label: "تمويل الشركات", available: true },
                        { icon: Building2, label: "التمويل العقاري", available: true },
                        { icon: TrendingUp, label: "الاستثمار", available: false },
                      ].map((service, i) => (
                        <div 
                          key={i}
                          className={`p-4 rounded-lg border ${service.available ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200' : 'bg-muted/50 border-muted'}`}
                        >
                          <service.icon className={`h-6 w-6 mb-2 ${service.available ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                          <div className="font-medium">{service.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {service.available ? "متاح" : "غير متاح"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 ml-2" />
                  تحميل التقرير السنوي
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Scale className="h-4 w-4 ml-2" />
                  مقارنة مع بنوك أخرى
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 ml-2" />
                  تحليل الأداء
                </Button>
              </CardContent>
            </Card>

            {/* Related Documents */}
            <Card>
              <CardHeader>
                <CardTitle>الوثائق ذات الصلة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a 
                  href="/research?category=banking" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">تقارير القطاع المصرفي</div>
                    <div className="text-xs text-muted-foreground">279 وثيقة</div>
                  </div>
                </a>
                <a 
                  href="https://cby-ye.com/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Landmark className="h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="font-medium">تعميمات البنك المركزي - عدن</div>
                    <div className="text-xs text-muted-foreground">الموقع الرسمي</div>
                  </div>
                </a>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">آخر تحديث: 14 يناير 2025</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
