import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertTriangle,
  Bell,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Shield,
  Globe,
  Building2,
  Users,
  Clock,
  Calendar,
  Download,
  Send,
  MessageSquare,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Eye,
  Settings,
  Briefcase,
  Scale,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Target,
  Gauge,
  FileWarning,
  Ban,
} from "lucide-react";

// Deputy Governor profile
const deputyProfile = {
  name: "Dr. Mohammed Al-Sadi",
  nameAr: "د. محمد السعدي",
  title: "Deputy Governor for Banking Supervision",
  titleAr: "نائب المحافظ للرقابة المصرفية",
  institution: "Central Bank of Yemen - Aden",
  institutionAr: "البنك المركزي اليمني - عدن",
  department: "Banking Supervision Department",
  departmentAr: "إدارة الرقابة المصرفية",
};

// Key supervision metrics
const supervisionMetrics = [
  {
    id: "total_banks",
    label: "Banks Under Supervision",
    labelAr: "البنوك تحت الرقابة",
    value: 25,
    subtext: "Aden: 18 | Sanaa: 7",
    subtextAr: "عدن: 18 | صنعاء: 7",
    icon: <Building2 className="h-5 w-5" />,
    color: "blue",
  },
  {
    id: "total_assets",
    label: "Total Sector Assets",
    labelAr: "إجمالي أصول القطاع",
    value: "$8.2B",
    subtext: "+3.1% YoY",
    subtextAr: "+3.1% سنوياً",
    icon: <Banknote className="h-5 w-5" />,
    color: "emerald",
    trend: "up",
  },
  {
    id: "avg_car",
    label: "Average CAR",
    labelAr: "متوسط نسبة كفاية رأس المال",
    value: "18.7%",
    subtext: "Min required: 12%",
    subtextAr: "الحد الأدنى: 12%",
    icon: <Shield className="h-5 w-5" />,
    color: "emerald",
  },
  {
    id: "npl_ratio",
    label: "NPL Ratio",
    labelAr: "نسبة القروض غير العاملة",
    value: "12.3%",
    subtext: "Regional avg: 5%",
    subtextAr: "المتوسط الإقليمي: 5%",
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "amber",
  },
];

// Banks data for supervision
const banksData = [
  { id: 1, name: "Yemen Bank for Reconstruction", nameAr: "بنك اليمن والكويت", jurisdiction: "Aden/Sanaa", assets: 2800, car: 22.5, npl: 8.2, status: "operational", statusAr: "عامل", riskLevel: "low" },
  { id: 2, name: "Yemen Kuwait Bank", nameAr: "بنك اليمن والكويت", jurisdiction: "Aden/Sanaa", assets: 2800, car: 22.5, npl: 9.1, status: "limited", statusAr: "محدود", riskLevel: "medium" },
  { id: 3, name: "Tadamon Bank", nameAr: "بنك التضامن", jurisdiction: "Aden", assets: 1900, car: 25.1, npl: 6.5, status: "operational", statusAr: "عامل", riskLevel: "low" },
  { id: 4, name: "National Bank of Yemen", nameAr: "البنك الأهلي اليمني", jurisdiction: "Aden", assets: 1650, car: 19.8, npl: 11.2, status: "operational", statusAr: "عامل", riskLevel: "medium" },
  { id: 5, name: "CAC Bank", nameAr: "كاك بنك", jurisdiction: "Sanaa", assets: 1400, car: 15.2, npl: 18.5, status: "distressed", statusAr: "متعثر", riskLevel: "high" },
  { id: 6, name: "Saba Islamic Bank", nameAr: "بنك سبأ الإسلامي", jurisdiction: "Aden/Sanaa", assets: 1250, car: 21.0, npl: 7.8, status: "limited", statusAr: "محدود", riskLevel: "medium" },
  { id: 7, name: "Al-Shamil Islamic Bank", nameAr: "بنك الشامل الإسلامي", jurisdiction: "Sanaa", assets: 980, car: 12.5, npl: 22.3, status: "distressed", statusAr: "متعثر", riskLevel: "high" },
  { id: 8, name: "International Bank of Yemen", nameAr: "بنك اليمن الدولي", jurisdiction: "Aden", assets: 850, car: 18.2, npl: 9.8, status: "operational", statusAr: "عامل", riskLevel: "low" },
];

// Banks under monitoring
const banksUnderMonitoring = [
  { id: 1, name: "Red Sea Bank", nameAr: "بنك البحر الأحمر", issue: "High NPL", issueAr: "ارتفاع القروض المتعثرة", status: "distressed", statusAr: "متعثر" },
  { id: 2, name: "Al-Thiqah Islamic Bank", nameAr: "بنك الثقة الإسلامي", issue: "CAR Below Minimum", issueAr: "كفاية رأس المال أقل من الحد", status: "limited", statusAr: "محدود" },
  { id: 3, name: "Future Microfinance Bank", nameAr: "بنك المستقبل للتمويل", issue: "Under Review", issueAr: "تحت المراجعة", status: "review", statusAr: "تحت المراجعة" },
];

// Compliance status
const complianceStatus = [
  { id: 1, requirement: "Capital Adequacy (Basel III)", requirementAr: "كفاية رأس المال (بازل III)", compliant: 18, nonCompliant: 4, pending: 3 },
  { id: 2, requirement: "AML/CFT Compliance", requirementAr: "مكافحة غسل الأموال", compliant: 20, nonCompliant: 2, pending: 3 },
  { id: 3, requirement: "Liquidity Coverage Ratio", requirementAr: "نسبة تغطية السيولة", compliant: 15, nonCompliant: 6, pending: 4 },
  { id: 4, requirement: "Reporting Requirements", requirementAr: "متطلبات الإبلاغ", compliant: 22, nonCompliant: 1, pending: 2 },
];

// Recent supervisory actions
const recentActions = [
  { id: 1, action: "Issued warning to CAC Bank for NPL threshold breach", actionAr: "إصدار تحذير لكاك بنك بسبب تجاوز عتبة القروض المتعثرة", date: "2024-01-10", type: "warning" },
  { id: 2, action: "Approved capital increase for Tadamon Bank", actionAr: "الموافقة على زيادة رأس مال بنك التضامن", date: "2024-01-08", type: "approval" },
  { id: 3, action: "Initiated inspection of Al-Shamil Islamic Bank", actionAr: "بدء التفتيش على بنك الشامل الإسلامي", date: "2024-01-05", type: "inspection" },
  { id: 4, action: "Updated AML guidelines for all banks", actionAr: "تحديث إرشادات مكافحة غسل الأموال لجميع البنوك", date: "2024-01-03", type: "regulation" },
];

// Sanctions and restrictions
const sanctionsData = [
  { id: 1, bank: "CAC Bank", bankAr: "كاك بنك", type: "OFAC SDN", typeAr: "قائمة العقوبات الأمريكية", since: "2022-03-15", reason: "Houthi affiliation", reasonAr: "الارتباط بالحوثيين" },
];

export default function DeputyGovernorDashboard() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [activeTab, setActiveTab] = useState("overview");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter banks
  const filteredBanks = useMemo(() => {
    return banksData.filter(bank => {
      const matchesJurisdiction = jurisdictionFilter === "all" || bank.jurisdiction.toLowerCase().includes(jurisdictionFilter.toLowerCase());
      const matchesStatus = statusFilter === "all" || bank.status === statusFilter;
      const matchesSearch = searchQuery === "" || 
        bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bank.nameAr.includes(searchQuery);
      return matchesJurisdiction && matchesStatus && matchesSearch;
    });
  }, [jurisdictionFilter, statusFilter, searchQuery]);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{isRTL ? "عالي" : "High"}</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{isRTL ? "متوسط" : "Medium"}</Badge>;
      default:
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{isRTL ? "منخفض" : "Low"}</Badge>;
    }
  };

  const getStatusBadge = (status: string, statusAr: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{isRTL ? statusAr : "Operational"}</Badge>;
      case "limited":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{isRTL ? statusAr : "Limited"}</Badge>;
      case "distressed":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{isRTL ? statusAr : "Distressed"}</Badge>;
      default:
        return <Badge variant="outline">{isRTL ? statusAr : status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="max-w-md w-full mx-4 bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-10 w-10 text-blue-500" />
            </div>
            <CardTitle className="text-2xl text-white">{isRTL ? "لوحة الرقابة المصرفية" : "Banking Supervision Dashboard"}</CardTitle>
            <CardDescription className="text-slate-400">{isRTL ? "يرجى تسجيل الدخول للوصول إلى لوحة التحكم" : "Please log in to access the supervision dashboard"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <a href={getLoginUrl()}>{isRTL ? "تسجيل الدخول" : "Log In"}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white border-b border-blue-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {isRTL ? "لوحة الرقابة المصرفية" : "Banking Supervision"}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold">{isRTL ? deputyProfile.nameAr : deputyProfile.name}</h1>
                <p className="text-blue-200">{isRTL ? deputyProfile.titleAr : deputyProfile.title}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="border-blue-600 text-blue-200 hover:bg-blue-700 hover:text-white">
                <Bell className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? "التنبيهات" : "Alerts"}
                <Badge className="bg-red-500 text-white text-xs ml-2">5</Badge>
              </Button>
              <Button variant="outline" className="border-blue-600 text-blue-200 hover:bg-blue-700 hover:text-white">
                <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? "التقارير" : "Reports"}
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? "مساعد الرقابة" : "Supervision AI"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {supervisionMetrics.map((metric) => (
            <Card key={metric.id} className={`border-${metric.color}-200 dark:border-${metric.color}-800`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/30`}>
                    <div className={`text-${metric.color}-600 dark:text-${metric.color}-400`}>{metric.icon}</div>
                  </div>
                  {metric.trend === "up" && <ArrowUpRight className="h-4 w-4 text-emerald-500" />}
                </div>
                <div className="text-2xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{isRTL ? metric.labelAr : metric.label}</div>
                <div className="text-xs text-slate-500 mt-1">{isRTL ? metric.subtextAr : metric.subtext}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview">{isRTL ? "نظرة عامة" : "Overview"}</TabsTrigger>
            <TabsTrigger value="banks">{isRTL ? "البنوك" : "Banks"}</TabsTrigger>
            <TabsTrigger value="compliance">{isRTL ? "الامتثال" : "Compliance"}</TabsTrigger>
            <TabsTrigger value="sanctions">{isRTL ? "العقوبات" : "Sanctions"}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Banks Under Monitoring */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                    {isRTL ? "البنوك تحت المراقبة" : "Banks Under Monitoring"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {banksUnderMonitoring.map((bank) => (
                      <div key={bank.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                          <div>
                            <p className="font-medium">{isRTL ? bank.nameAr : bank.name}</p>
                            <p className="text-sm text-slate-500">{isRTL ? bank.issueAr : bank.issue}</p>
                          </div>
                        </div>
                        <Badge variant={bank.status === "distressed" ? "destructive" : "secondary"}>
                          {isRTL ? bank.statusAr : bank.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {isRTL ? "الإجراءات الأخيرة" : "Recent Actions"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActions.map((action) => (
                      <div key={action.id} className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          action.type === "warning" ? "bg-amber-500" :
                          action.type === "approval" ? "bg-emerald-500" :
                          action.type === "inspection" ? "bg-blue-500" :
                          "bg-slate-500"
                        }`}></div>
                        <div>
                          <p className="text-sm">{isRTL ? action.actionAr : action.action}</p>
                          <p className="text-xs text-slate-500 mt-1">{action.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  {isRTL ? "نظرة عامة على الامتثال" : "Compliance Overview"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {complianceStatus.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="font-medium text-sm mb-3">{isRTL ? item.requirementAr : item.requirement}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-emerald-600">{isRTL ? "ملتزم" : "Compliant"}</span>
                          <span className="font-medium">{item.compliant}</span>
                        </div>
                        <Progress value={(item.compliant / 25) * 100} className="h-2 bg-emerald-100" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-red-600">{isRTL ? "غير ملتزم" : "Non-Compliant"}</span>
                          <span className="font-medium">{item.nonCompliant}</span>
                        </div>
                        <Progress value={(item.nonCompliant / 25) * 100} className="h-2 bg-red-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banks Tab */}
          <TabsContent value="banks" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                      <Input
                        placeholder={isRTL ? "البحث عن بنك..." : "Search banks..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={isRTL ? "pr-10" : "pl-10"}
                      />
                    </div>
                  </div>
                  <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder={isRTL ? "الجهة" : "Jurisdiction"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
                      <SelectItem value="aden">{isRTL ? "عدن" : "Aden"}</SelectItem>
                      <SelectItem value="sanaa">{isRTL ? "صنعاء" : "Sanaa"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder={isRTL ? "الحالة" : "Status"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
                      <SelectItem value="operational">{isRTL ? "عامل" : "Operational"}</SelectItem>
                      <SelectItem value="limited">{isRTL ? "محدود" : "Limited"}</SelectItem>
                      <SelectItem value="distressed">{isRTL ? "متعثر" : "Distressed"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Banks Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? "البنك" : "Bank"}</TableHead>
                      <TableHead>{isRTL ? "الجهة" : "Jurisdiction"}</TableHead>
                      <TableHead className="text-right">{isRTL ? "الأصول (مليون $)" : "Assets ($M)"}</TableHead>
                      <TableHead className="text-right">{isRTL ? "كفاية رأس المال" : "CAR"}</TableHead>
                      <TableHead className="text-right">{isRTL ? "القروض المتعثرة" : "NPL"}</TableHead>
                      <TableHead>{isRTL ? "المخاطر" : "Risk"}</TableHead>
                      <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBanks.map((bank) => (
                      <TableRow key={bank.id}>
                        <TableCell className="font-medium">{isRTL ? bank.nameAr : bank.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{bank.jurisdiction}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{bank.assets.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className={bank.car < 12 ? "text-red-600 font-medium" : ""}>{bank.car}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={bank.npl > 15 ? "text-red-600 font-medium" : bank.npl > 10 ? "text-amber-600" : ""}>{bank.npl}%</span>
                        </TableCell>
                        <TableCell>{getRiskBadge(bank.riskLevel)}</TableCell>
                        <TableCell>{getStatusBadge(bank.status, bank.statusAr)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {complianceStatus.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{isRTL ? item.requirementAr : item.requirement}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          <span>{isRTL ? "ملتزم" : "Compliant"}</span>
                        </div>
                        <span className="text-2xl font-bold text-emerald-600">{item.compliant}</span>
                      </div>
                      <Progress value={(item.compliant / 25) * 100} className="h-3" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span>{isRTL ? "غير ملتزم" : "Non-Compliant"}</span>
                        </div>
                        <span className="text-2xl font-bold text-red-600">{item.nonCompliant}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-amber-600" />
                          <span>{isRTL ? "قيد المراجعة" : "Pending"}</span>
                        </div>
                        <span className="text-2xl font-bold text-amber-600">{item.pending}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sanctions Tab */}
          <TabsContent value="sanctions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-600" />
                  {isRTL ? "العقوبات والقيود" : "Sanctions & Restrictions"}
                </CardTitle>
                <CardDescription>
                  {isRTL ? "البنوك الخاضعة للعقوبات الدولية أو القيود التنظيمية" : "Banks under international sanctions or regulatory restrictions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? "البنك" : "Bank"}</TableHead>
                      <TableHead>{isRTL ? "نوع العقوبة" : "Sanction Type"}</TableHead>
                      <TableHead>{isRTL ? "منذ" : "Since"}</TableHead>
                      <TableHead>{isRTL ? "السبب" : "Reason"}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sanctionsData.map((sanction) => (
                      <TableRow key={sanction.id}>
                        <TableCell className="font-medium">{isRTL ? sanction.bankAr : sanction.bank}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{isRTL ? sanction.typeAr : sanction.type}</Badge>
                        </TableCell>
                        <TableCell>{sanction.since}</TableCell>
                        <TableCell>{isRTL ? sanction.reasonAr : sanction.reason}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Sanctions Impact */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "تأثير العقوبات على القطاع" : "Sanctions Impact on Sector"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-3xl font-bold text-red-600">1</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{isRTL ? "بنوك تحت عقوبات OFAC" : "Banks under OFAC sanctions"}</div>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="text-3xl font-bold text-amber-600">3</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{isRTL ? "بنوك تحت قيود المراسلة" : "Banks with correspondent restrictions"}</div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-3xl font-bold text-blue-600">$1.4B</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{isRTL ? "أصول متأثرة بالعقوبات" : "Assets affected by sanctions"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
