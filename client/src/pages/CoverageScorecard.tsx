import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
  Database,
  FileQuestion,
  Target,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CoverageScorecard() {
  const { language } = useLanguage();
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewGapDialogOpen, setIsNewGapDialogOpen] = useState(false);

  // Coverage data by sector
  const sectorCoverage = [
    {
      sector: "Banking & Finance",
      sectorAr: "المصارف والمالية",
      coverage: 78,
      indicators: 45,
      gaps: 12,
      lastUpdated: "2024-12-20",
      status: "good",
    },
    {
      sector: "Currency & Exchange",
      sectorAr: "العملة والصرف",
      coverage: 92,
      indicators: 28,
      gaps: 3,
      lastUpdated: "2024-12-27",
      status: "excellent",
    },
    {
      sector: "Prices & Inflation",
      sectorAr: "الأسعار والتضخم",
      coverage: 85,
      indicators: 52,
      gaps: 8,
      lastUpdated: "2024-12-25",
      status: "good",
    },
    {
      sector: "Trade & Commerce",
      sectorAr: "التجارة",
      coverage: 65,
      indicators: 38,
      gaps: 18,
      lastUpdated: "2024-12-15",
      status: "moderate",
    },
    {
      sector: "Public Finance",
      sectorAr: "المالية العامة",
      coverage: 45,
      indicators: 32,
      gaps: 22,
      lastUpdated: "2024-11-30",
      status: "poor",
    },
    {
      sector: "Food Security",
      sectorAr: "الأمن الغذائي",
      coverage: 88,
      indicators: 41,
      gaps: 5,
      lastUpdated: "2024-12-22",
      status: "excellent",
    },
    {
      sector: "Energy & Fuel",
      sectorAr: "الطاقة والوقود",
      coverage: 72,
      indicators: 25,
      gaps: 9,
      lastUpdated: "2024-12-18",
      status: "good",
    },
    {
      sector: "Labor Market",
      sectorAr: "سوق العمل",
      coverage: 35,
      indicators: 20,
      gaps: 15,
      lastUpdated: "2024-10-15",
      status: "poor",
    },
  ];

  // Data gap tickets
  const gapTickets = [
    {
      id: "GAP-001",
      title: "Monthly FX rates for Sana'a 2022",
      titleAr: "أسعار الصرف الشهرية لصنعاء 2022",
      sector: "Currency & Exchange",
      priority: "high",
      status: "open",
      whyItMatters: "Critical for inflation analysis and purchasing power comparisons",
      candidateSources: "CBY-Sana'a, Money exchangers, WFP market monitoring",
      createdAt: "2024-12-01",
      assignedTo: "Research Team",
    },
    {
      id: "GAP-002",
      title: "Government revenue breakdown by source (IRG)",
      titleAr: "تفصيل الإيرادات الحكومية حسب المصدر (الشرعية)",
      sector: "Public Finance",
      priority: "high",
      status: "in_progress",
      whyItMatters: "Essential for fiscal sustainability analysis",
      candidateSources: "Ministry of Finance - Aden, IMF Article IV",
      createdAt: "2024-11-15",
      assignedTo: "Fiscal Team",
    },
    {
      id: "GAP-003",
      title: "Unemployment rate by governorate 2023",
      titleAr: "معدل البطالة حسب المحافظة 2023",
      sector: "Labor Market",
      priority: "medium",
      status: "open",
      whyItMatters: "Needed for regional economic analysis and policy recommendations",
      candidateSources: "ILO, World Bank, UNDP",
      createdAt: "2024-12-10",
      assignedTo: null,
    },
    {
      id: "GAP-004",
      title: "Port throughput data - Hodeidah 2024",
      titleAr: "بيانات حركة الميناء - الحديدة 2024",
      sector: "Trade & Commerce",
      priority: "high",
      status: "blocked",
      whyItMatters: "Key indicator for import capacity and humanitarian access",
      candidateSources: "UNVIM, Port Authority (DFA)",
      createdAt: "2024-12-05",
      assignedTo: "Trade Team",
    },
    {
      id: "GAP-005",
      title: "Electricity generation capacity by region",
      titleAr: "قدرة توليد الكهرباء حسب المنطقة",
      sector: "Energy & Fuel",
      priority: "medium",
      status: "resolved",
      whyItMatters: "Critical for infrastructure assessment",
      candidateSources: "PEC, ACAPS, Sector reports",
      createdAt: "2024-11-20",
      assignedTo: "Energy Team",
      resolvedAt: "2024-12-15",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "good":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "moderate":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "poor":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      open: "bg-blue-100 text-blue-800 border-blue-200",
      in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
      blocked: "bg-red-100 text-red-800 border-red-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
    };
    const labels: Record<string, string> = {
      open: language === "ar" ? "مفتوح" : "Open",
      in_progress: language === "ar" ? "قيد التنفيذ" : "In Progress",
      blocked: language === "ar" ? "محظور" : "Blocked",
      resolved: language === "ar" ? "تم الحل" : "Resolved",
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      <Badge variant="outline" className={variants[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const filteredTickets = gapTickets.filter((ticket) => {
    if (selectedSector !== "all" && ticket.sector !== selectedSector) return false;
    if (selectedPriority !== "all" && ticket.priority !== selectedPriority) return false;
    if (searchQuery && !ticket.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const overallCoverage = Math.round(
    sectorCoverage.reduce((sum, s) => sum + s.coverage, 0) / sectorCoverage.length
  );
  const totalIndicators = sectorCoverage.reduce((sum, s) => sum + s.indicators, 0);
  const totalGaps = sectorCoverage.reduce((sum, s) => sum + s.gaps, 0);
  const openTickets = gapTickets.filter((t) => t.status !== "resolved").length;

  const handleSubmitGap = () => {
    toast.success(language === "ar" ? "تم إرسال طلب البيانات بنجاح" : "Data gap ticket submitted successfully");
    setIsNewGapDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#103050] to-[#1a4a70] text-white">
        <div className="container py-8">
          <div className={language === "ar" ? "text-right" : ""}>
            <h1 className="text-3xl font-bold mb-2">
              {language === "ar" ? "بطاقة تغطية البيانات" : "Data Coverage Scorecard"}
            </h1>
            <p className="text-white/80 max-w-2xl">
              {language === "ar"
                ? "تتبع تغطية البيانات عبر القطاعات وإدارة فجوات البيانات لضمان الشفافية الكاملة"
                : "Track data coverage across sectors and manage data gaps to ensure complete transparency"}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#107040]/10 rounded-lg">
                  <Target className="h-6 w-6 text-[#107040]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "التغطية الإجمالية" : "Overall Coverage"}
                  </p>
                  <p className="text-2xl font-bold text-[#103050]">{overallCoverage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "إجمالي المؤشرات" : "Total Indicators"}
                  </p>
                  <p className="text-2xl font-bold text-[#103050]">{totalIndicators}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FileQuestion className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "فجوات البيانات" : "Data Gaps"}
                  </p>
                  <p className="text-2xl font-bold text-[#103050]">{totalGaps}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "تذاكر مفتوحة" : "Open Tickets"}
                  </p>
                  <p className="text-2xl font-bold text-[#103050]">{openTickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sector Coverage Grid */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {language === "ar" ? "تغطية البيانات حسب القطاع" : "Data Coverage by Sector"}
            </CardTitle>
            <CardDescription>
              {language === "ar"
                ? "نظرة عامة على اكتمال البيانات عبر جميع القطاعات الاقتصادية"
                : "Overview of data completeness across all economic sectors"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sectorCoverage.map((sector) => (
                <Card key={sector.sector} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-sm">
                          {language === "ar" ? sector.sectorAr : sector.sector}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {sector.indicators} {language === "ar" ? "مؤشر" : "indicators"}
                        </p>
                      </div>
                      {getStatusIcon(sector.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {language === "ar" ? "التغطية" : "Coverage"}
                        </span>
                        <span className="font-medium">{sector.coverage}%</span>
                      </div>
                      <Progress value={sector.coverage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {sector.gaps} {language === "ar" ? "فجوات" : "gaps"}
                        </span>
                        <span>
                          {language === "ar" ? "آخر تحديث:" : "Updated:"} {sector.lastUpdated}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Gap Tickets */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>
                  {language === "ar" ? "تذاكر فجوات البيانات" : "Data Gap Tickets"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "تتبع وإدارة طلبات البيانات المفقودة"
                    : "Track and manage missing data requests"}
                </CardDescription>
              </div>
              <Dialog open={isNewGapDialogOpen} onOpenChange={setIsNewGapDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#107040] hover:bg-[#0D5A34]">
                    <Plus className="h-4 w-4 mr-2" />
                    {language === "ar" ? "إضافة فجوة جديدة" : "Add New Gap"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {language === "ar" ? "الإبلاغ عن فجوة بيانات" : "Report Data Gap"}
                    </DialogTitle>
                    <DialogDescription>
                      {language === "ar"
                        ? "أخبرنا عن البيانات المفقودة التي تحتاجها"
                        : "Tell us about the missing data you need"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium">
                        {language === "ar" ? "عنوان الفجوة" : "Gap Title"}
                      </label>
                      <Input placeholder={language === "ar" ? "مثال: بيانات التضخم الشهرية لعدن 2023" : "e.g., Monthly inflation data for Aden 2023"} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        {language === "ar" ? "القطاع" : "Sector"}
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "ar" ? "اختر القطاع" : "Select sector"} />
                        </SelectTrigger>
                        <SelectContent>
                          {sectorCoverage.map((s) => (
                            <SelectItem key={s.sector} value={s.sector}>
                              {language === "ar" ? s.sectorAr : s.sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        {language === "ar" ? "لماذا هذه البيانات مهمة؟" : "Why does this data matter?"}
                      </label>
                      <Textarea placeholder={language === "ar" ? "اشرح أهمية هذه البيانات للتحليل..." : "Explain why this data is important for analysis..."} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        {language === "ar" ? "المصادر المحتملة" : "Candidate Sources"}
                      </label>
                      <Input placeholder={language === "ar" ? "مثال: البنك المركزي، البنك الدولي" : "e.g., Central Bank, World Bank"} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        {language === "ar" ? "الأولوية" : "Priority"}
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "ar" ? "اختر الأولوية" : "Select priority"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">{language === "ar" ? "عالية" : "High"}</SelectItem>
                          <SelectItem value="medium">{language === "ar" ? "متوسطة" : "Medium"}</SelectItem>
                          <SelectItem value="low">{language === "ar" ? "منخفضة" : "Low"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewGapDialogOpen(false)}>
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button className="bg-[#107040] hover:bg-[#0D5A34]" onClick={handleSubmitGap}>
                      {language === "ar" ? "إرسال" : "Submit"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={language === "ar" ? "البحث في التذاكر..." : "Search tickets..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={language === "ar" ? "القطاع" : "Sector"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ar" ? "جميع القطاعات" : "All Sectors"}</SelectItem>
                  {sectorCoverage.map((s) => (
                    <SelectItem key={s.sector} value={s.sector}>
                      {language === "ar" ? s.sectorAr : s.sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={language === "ar" ? "الأولوية" : "Priority"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ar" ? "الكل" : "All"}</SelectItem>
                  <SelectItem value="high">{language === "ar" ? "عالية" : "High"}</SelectItem>
                  <SelectItem value="medium">{language === "ar" ? "متوسطة" : "Medium"}</SelectItem>
                  <SelectItem value="low">{language === "ar" ? "منخفضة" : "Low"}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Tickets Table */}
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>{language === "ar" ? "العنوان" : "Title"}</TableHead>
                    <TableHead>{language === "ar" ? "القطاع" : "Sector"}</TableHead>
                    <TableHead>{language === "ar" ? "الأولوية" : "Priority"}</TableHead>
                    <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{language === "ar" ? "مسند إلى" : "Assigned"}</TableHead>
                    <TableHead>{language === "ar" ? "تاريخ الإنشاء" : "Created"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{language === "ar" ? ticket.titleAr : ticket.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {ticket.whyItMatters}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{ticket.sector}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-sm">
                        {ticket.assignedTo || (
                          <span className="text-muted-foreground italic">
                            {language === "ar" ? "غير مسند" : "Unassigned"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ticket.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
