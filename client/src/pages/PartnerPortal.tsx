import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Globe,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Bell,
  Calendar,
  Building2,
  Mail,
  Phone,
  HelpCircle,
  Info,
  Eye,
  Edit,
  MessageSquare,
  Download,
  RefreshCw,
  Landmark,
} from "lucide-react";
// getLoginUrl imported from useAuth hook above

// Status configuration
const statusConfig: Record<string, { label: string; labelAr: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  draft: { label: "Draft", labelAr: "مسودة", variant: "outline", icon: <Edit className="h-3 w-3" /> },
  submitted: { label: "Submitted", labelAr: "مقدم", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  under_review: { label: "Under Review", labelAr: "قيد المراجعة", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  published: { label: "Published", labelAr: "منشور", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: "Rejected", labelAr: "مرفوض", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  active: { label: "Active", labelAr: "نشط", variant: "default", icon: <RefreshCw className="h-3 w-3" /> },
};

// File type icons
const fileTypeIcons: Record<string, React.ReactNode> = {
  excel: <FileSpreadsheet className="h-4 w-4 text-green-600" />,
  pdf: <FileText className="h-4 w-4 text-red-600" />,
  api: <Globe className="h-4 w-4 text-blue-600" />,
  csv: <FileSpreadsheet className="h-4 w-4 text-emerald-600" />,
};

// Data categories
const dataCategories = [
  { value: "monetary_reserves", label: "الاحتياطيات النقدية", labelEn: "Monetary Reserves" },
  { value: "exchange_rates", label: "أسعار الصرف", labelEn: "Exchange Rates" },
  { value: "balance_sheet", label: "الميزانية العمومية", labelEn: "Balance Sheet" },
  { value: "loan_statistics", label: "إحصائيات القروض", labelEn: "Loan Statistics" },
  { value: "banking_indicators", label: "المؤشرات المصرفية", labelEn: "Banking Indicators" },
  { value: "inflation_data", label: "بيانات التضخم", labelEn: "Inflation Data" },
  { value: "trade_data", label: "بيانات التجارة", labelEn: "Trade Data" },
  { value: "other", label: "أخرى", labelEn: "Other" },
];

export default function PartnerPortal() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<any>(null);
  const [rejectionReasonOpen, setRejectionReasonOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    titleAr: "",
    description: "",
    dataCategory: "",
    timePeriod: "",
    fileType: "excel",
    notes: "",
  });

  // Sample data matching the mockup
  const contributions = useMemo(() => [
    {
      id: 1,
      title: "Monetary Reserves November 2024",
      titleAr: "الاحتياطيات النقدية نوفمبر 2024",
      dataCategory: "monetary_reserves",
      fileType: "excel",
      submittedAt: new Date("2024-12-10"),
      status: "published",
      organizationNameAr: "البنك المركزي اليمني - عدن",
    },
    {
      id: 2,
      title: "Daily Exchange Rates",
      titleAr: "أسعار الصرف اليومية",
      dataCategory: "exchange_rates",
      fileType: "api",
      submittedAt: new Date("2024-12-18"),
      status: "active",
      organizationNameAr: "البنك المركزي اليمني - عدن",
    },
    {
      id: 3,
      title: "Balance Sheet Q3 2024",
      titleAr: "الميزانية العمومية Q3 2024",
      dataCategory: "balance_sheet",
      fileType: "pdf",
      submittedAt: new Date("2024-11-25"),
      status: "under_review",
      reviewNotes: "Please provide additional breakdown of foreign currency reserves.",
      organizationNameAr: "البنك المركزي اليمني - عدن",
    },
    {
      id: 4,
      title: "Loan Statistics",
      titleAr: "إحصائيات القروض",
      dataCategory: "loan_statistics",
      fileType: "excel",
      submittedAt: new Date("2024-12-05"),
      status: "rejected",
      rejectionReason: "بيانات غير مكتملة أو غير متوافقة مع المعايير. يرجى مراجعة ملف التعليمات.",
      organizationNameAr: "البنك المركزي اليمني - عدن",
    },
  ], []);

  const stats = useMemo(() => ({
    total: 24,
    published: 187,
    underReview: 3,
    rejected: 2,
    pending: 5,
  }), []);

  const notifications = useMemo(() => [
    {
      id: 1,
      type: "success",
      title: isRTL ? "تم قبول مساهمتك" : "Contribution Accepted",
      message: isRTL ? 'تم قبول بيانات "الاحتياطيات النقدية نوفمبر 2024" بنجاح.' : 'Your "Monetary Reserves November 2024" data was accepted.',
      time: isRTL ? "اليوم، 09:30 ص" : "Today, 09:30 AM",
      isNew: true,
    },
    {
      id: 2,
      type: "warning",
      title: isRTL ? "طلب توضيح" : "Clarification Request",
      message: isRTL ? 'يرجى تقديم توضيح بشأن البيانات المقدمة في "الميزانية العمومية Q3 2024".' : 'Please provide clarification for "Balance Sheet Q3 2024".',
      time: isRTL ? "أمس، 14:15 م" : "Yesterday, 14:15 PM",
      isNew: true,
    },
    {
      id: 3,
      type: "info",
      title: isRTL ? "تذكير: تحديث شهري مستحق" : "Reminder: Monthly Update Due",
      message: isRTL ? 'موعد رفع بيانات "أسعار الصرف اليومية" لشهر ديسمبر يقترب.' : 'December exchange rate data submission deadline approaching.',
      time: isRTL ? "قبل يومين" : "2 days ago",
      isNew: false,
    },
  ], [isRTL]);

  const organization = useMemo(() => ({
    name: "Central Bank of Yemen - Aden",
    nameAr: "البنك المركزي اليمني - عدن",
    contactPerson: isRTL ? "أحمد علي" : "Ahmed Ali",
    contactRole: isRTL ? "مدير البيانات" : "Data Manager",
    email: "data.central@cby.ye",
    phone: "+967-1-234567",
    status: "active",
    agreementExpiry: isRTL ? "تجديد تلقائي" : "Auto-renewal",
  }), [isRTL]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-CA');
  };

  const handleSubmit = () => {
    console.log("Submitting:", formData);
    setUploadDialogOpen(false);
    setFormData({
      title: "",
      titleAr: "",
      description: "",
      dataCategory: "",
      timePeriod: "",
      fileType: "excel",
      notes: "",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
              <Landmark className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">{isRTL ? "بوابة الشركاء المساهمين" : "Partner Contribution Portal"}</CardTitle>
            <CardDescription>{isRTL ? "يرجى تسجيل الدخول للوصول إلى بوابة إدارة البيانات" : "Please log in to access the data management portal"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
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
      <div className="bg-gradient-to-l from-emerald-700 to-emerald-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <Landmark className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {isRTL ? `مرحباً بك، ${organization.nameAr}` : `Welcome, ${organization.name}`}
                </h1>
                <p className="text-white/80">{isRTL ? "بوابة إدارة ومساهمة البيانات" : "Data Management & Contribution Portal"}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-emerald-700 hover:bg-white/90">
                    <Upload className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? "رفع بيانات جديدة" : "Upload New Data"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg" dir={isRTL ? "rtl" : "ltr"}>
                  <DialogHeader>
                    <DialogTitle>{isRTL ? "رفع بيانات جديدة" : "Upload New Data"}</DialogTitle>
                    <DialogDescription>{isRTL ? "أضف مساهمة بيانات جديدة للمنصة" : "Add a new data contribution to the platform"}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer">
                      <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {isRTL ? "اسحب وأفلت الملفات هنا" : "Drag and drop files here"}
                        <br />
                        <span className="text-emerald-600">{isRTL ? "أو اضغط للتحميل" : "or click to upload"}</span>
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">{isRTL ? "اختر نوع البيانات" : "Select Data Type"}</label>
                      <Select value={formData.dataCategory} onValueChange={(v) => setFormData({ ...formData, dataCategory: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder={isRTL ? "اختر نوع البيانات" : "Select data type"} />
                        </SelectTrigger>
                        <SelectContent>
                          {dataCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>{isRTL ? cat.label : cat.labelEn}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">{isRTL ? "الفترة الزمنية" : "Time Period"}</label>
                      <Input 
                        type="text" 
                        placeholder={isRTL ? "مثال: نوفمبر 2024" : "e.g., November 2024"} 
                        value={formData.timePeriod}
                        onChange={(e) => setFormData({ ...formData, timePeriod: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">{isRTL ? "ملاحظات" : "Notes"}</label>
                      <Textarea 
                        placeholder={isRTL ? "أضف أي ملاحظات إضافية..." : "Add any additional notes..."}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                    
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit}>
                      {isRTL ? "رفع" : "Upload"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Info className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? "عرض التعليمات" : "View Instructions"}
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <HelpCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? "الدعم الفني" : "Technical Support"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-bl from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{isRTL ? "مساهمات نشطة" : "Active Contributions"}</p>
                  <p className="text-4xl font-bold text-emerald-600">{stats.total}</p>
                  <p className="text-xs text-slate-500">{isRTL ? "إجمالي المساهمات الحالية" : "Total current contributions"}</p>
                </div>
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-bl from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{isRTL ? "قيد المراجعة" : "Under Review"}</p>
                  <p className="text-4xl font-bold text-amber-600">{stats.underReview}</p>
                  <p className="text-xs text-slate-500">{isRTL ? "في انتظار الموافقة" : "Awaiting approval"}</p>
                </div>
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="h-7 w-7 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-bl from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{isRTL ? "منشورة" : "Published"}</p>
                  <p className="text-4xl font-bold text-blue-600">{stats.published}</p>
                  <p className="text-xs text-slate-500">{isRTL ? "تم نشرها بنجاح" : "Successfully published"}</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Globe className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Contributions */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "مساهماتي الأخيرة" : "My Recent Contributions"}</CardTitle>
                <CardDescription>{isRTL ? "قائمة بآخر البيانات المرفوعة" : "List of recently uploaded data"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>{isRTL ? "المجموعة" : "Dataset"}</TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>{isRTL ? "النوع" : "Type"}</TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>{isRTL ? "تاريخ الرفع" : "Upload Date"}</TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>{isRTL ? "الحالة" : "Status"}</TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map((contribution) => {
                      const status = statusConfig[contribution.status] || statusConfig.draft;
                      return (
                        <TableRow key={contribution.id}>
                          <TableCell>
                            <div className="font-medium">{isRTL ? contribution.titleAr : contribution.title}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {fileTypeIcons[contribution.fileType] || <FileText className="h-4 w-4" />}
                              <span className="uppercase text-xs font-medium">{contribution.fileType}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {formatDate(contribution.submittedAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className="gap-1">
                              {status.icon}
                              {isRTL ? status.labelAr : status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {contribution.status === "published" && (
                                <>
                                  <Button variant="ghost" size="sm" className="h-8">
                                    <Edit className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                    {isRTL ? "تحرير" : "Edit"}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8">
                                    <Eye className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                    {isRTL ? "عرض" : "View"}
                                  </Button>
                                </>
                              )}
                              {contribution.status === "active" && (
                                <Button variant="ghost" size="sm" className="h-8">
                                  <Eye className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                  {isRTL ? "عرض" : "View"}
                                </Button>
                              )}
                              {contribution.status === "under_review" && (
                                <Button variant="ghost" size="sm" className="h-8">
                                  <MessageSquare className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                  {isRTL ? "عرض الملاحظات" : "View Notes"}
                                </Button>
                              )}
                              {contribution.status === "rejected" && (
                                <Dialog open={rejectionReasonOpen && selectedContribution?.id === contribution.id} onOpenChange={(open) => {
                                  setRejectionReasonOpen(open);
                                  if (open) setSelectedContribution(contribution);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700">
                                      <AlertTriangle className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                      {isRTL ? "عرض السبب" : "View Reason"}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent dir={isRTL ? "rtl" : "ltr"}>
                                    <DialogHeader>
                                      <DialogTitle className="text-red-600">{isRTL ? "سبب الرفض" : "Rejection Reason"}</DialogTitle>
                                    </DialogHeader>
                                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                                      <p className="text-sm">{contribution.rejectionReason}</p>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Organization Profile */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "ملف المنظمة" : "Organization Profile"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{isRTL ? organization.nameAr : organization.name}</p>
                        <p className="text-sm text-slate-500">{isRTL ? organization.name : organization.nameAr}</p>
                      </div>
                    </div>
                    <div className="text-sm space-y-2">
                      <p><span className="text-slate-500">{isRTL ? "جهة الاتصال:" : "Contact:"}</span> {organization.contactPerson} ({organization.contactRole})</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{organization.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span dir="ltr">{organization.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>{isRTL ? "حالة الاتفاقية:" : "Agreement Status:"} <span className="text-emerald-600">{isRTL ? `سارية المفعول (${organization.agreementExpiry})` : `Active (${organization.agreementExpiry})`}</span></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {isRTL ? "التنبيهات" : "Notifications"}
                  </CardTitle>
                  <Badge variant="secondary">{notifications.filter(n => n.isNew).length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.type === "success" 
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" 
                        : notification.type === "warning"
                        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                        : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${
                        notification.type === "success" ? "text-emerald-600" 
                        : notification.type === "warning" ? "text-amber-600" 
                        : "text-blue-600"
                      }`}>
                        {notification.type === "success" ? <CheckCircle2 className="h-5 w-5" /> 
                         : notification.type === "warning" ? <AlertTriangle className="h-5 w-5" />
                         : <Calendar className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  {isRTL ? "عرض جميع التنبيهات" : "View All Notifications"}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Downloads */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {isRTL ? "التحميلات السريعة" : "Quick Downloads"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-red-600`} />
                  {isRTL ? "دليل رفع البيانات (PDF)" : "Data Upload Guide (PDF)"}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileSpreadsheet className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-green-600`} />
                  {isRTL ? "قوالب البيانات (Excel)" : "Data Templates (Excel)"}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-blue-600`} />
                  {isRTL ? "وثائق API" : "API Documentation"}
                </Button>
              </CardContent>
            </Card>

            {/* Data Quality Tips */}
            <Card className="bg-gradient-to-bl from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-5 w-5 text-blue-600" />
                  {isRTL ? "نصائح جودة البيانات" : "Data Quality Tips"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                {isRTL ? (
                  <>
                    <p>• تأكد من اكتمال جميع الحقول المطلوبة</p>
                    <p>• استخدم التنسيقات المعتمدة للتواريخ والأرقام</p>
                    <p>• راجع البيانات قبل الإرسال للتأكد من دقتها</p>
                    <p>• أرفق مصادر البيانات عند الإمكان</p>
                  </>
                ) : (
                  <>
                    <p>• Ensure all required fields are complete</p>
                    <p>• Use approved formats for dates and numbers</p>
                    <p>• Review data before submission for accuracy</p>
                    <p>• Attach data sources when possible</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
