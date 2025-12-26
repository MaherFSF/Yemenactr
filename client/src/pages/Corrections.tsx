import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Search,
  Filter,
  Calendar,
  User,
  ArrowRight,
  Flag,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Sample corrections data
const corrections = [
  {
    id: "COR-2024-001",
    dateReported: "2024-12-20",
    dateResolved: "2024-12-22",
    status: "resolved",
    category: "data_error",
    indicator: "Exchange Rate (Aden)",
    indicatorAr: "سعر الصرف (عدن)",
    originalValue: "2,150 YER/USD",
    correctedValue: "2,070 YER/USD",
    descriptionEn: "Exchange rate data for December 15, 2024 was incorrectly reported due to a data entry error. The correct value has been updated based on CBY-Aden official bulletin.",
    descriptionAr: "تم الإبلاغ عن بيانات سعر الصرف ليوم 15 ديسمبر 2024 بشكل غير صحيح بسبب خطأ في إدخال البيانات. تم تحديث القيمة الصحيحة بناءً على نشرة البنك المركزي الرسمية.",
    reportedBy: "Community Member",
    resolvedBy: "YETO Data Team",
    impactLevel: "medium"
  },
  {
    id: "COR-2024-002",
    dateReported: "2024-12-18",
    dateResolved: "2024-12-19",
    status: "resolved",
    category: "source_update",
    indicator: "Inflation Rate (Sana'a)",
    indicatorAr: "معدل التضخم (صنعاء)",
    originalValue: "14.2%",
    correctedValue: "12.5%",
    descriptionEn: "Updated inflation figure based on new data release from CSO. Previous estimate was based on preliminary data.",
    descriptionAr: "تم تحديث رقم التضخم بناءً على إصدار بيانات جديد من الجهاز المركزي للإحصاء. كان التقدير السابق مبنياً على بيانات أولية.",
    reportedBy: "Research Partner",
    resolvedBy: "YETO Data Team",
    impactLevel: "low"
  },
  {
    id: "COR-2024-003",
    dateReported: "2024-12-15",
    dateResolved: null,
    status: "under_review",
    category: "methodology",
    indicator: "GDP Estimate (2023)",
    indicatorAr: "تقدير الناتج المحلي الإجمالي (2023)",
    originalValue: "$21.5B",
    correctedValue: "Under review",
    descriptionEn: "Question raised about methodology used for GDP estimation in conflict-affected areas. Currently under review with external experts.",
    descriptionAr: "أثير سؤال حول المنهجية المستخدمة لتقدير الناتج المحلي الإجمالي في المناطق المتأثرة بالصراع. قيد المراجعة حالياً مع خبراء خارجيين.",
    reportedBy: "Academic Researcher",
    resolvedBy: null,
    impactLevel: "high"
  },
  {
    id: "COR-2024-004",
    dateReported: "2024-12-10",
    dateResolved: "2024-12-12",
    status: "resolved",
    category: "attribution",
    indicator: "Oil Production Data",
    indicatorAr: "بيانات إنتاج النفط",
    originalValue: "Source: Ministry of Oil",
    correctedValue: "Source: PetroMasila",
    descriptionEn: "Corrected source attribution for oil production figures. Data was originally attributed to Ministry of Oil but actually sourced from PetroMasila operational reports.",
    descriptionAr: "تم تصحيح إسناد المصدر لأرقام إنتاج النفط. كانت البيانات منسوبة في الأصل إلى وزارة النفط ولكنها في الواقع مصدرها تقارير بترومسيلة التشغيلية.",
    reportedBy: "Industry Expert",
    resolvedBy: "YETO Data Team",
    impactLevel: "low"
  },
];

const categories = [
  { value: "all", labelEn: "All Categories", labelAr: "جميع الفئات" },
  { value: "data_error", labelEn: "Data Error", labelAr: "خطأ في البيانات" },
  { value: "source_update", labelEn: "Source Update", labelAr: "تحديث المصدر" },
  { value: "methodology", labelEn: "Methodology", labelAr: "المنهجية" },
  { value: "attribution", labelEn: "Attribution", labelAr: "الإسناد" },
];

const statuses = [
  { value: "all", labelEn: "All Statuses", labelAr: "جميع الحالات" },
  { value: "resolved", labelEn: "Resolved", labelAr: "تم الحل" },
  { value: "under_review", labelEn: "Under Review", labelAr: "قيد المراجعة" },
  { value: "pending", labelEn: "Pending", labelAr: "معلق" },
];

export default function Corrections() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const filteredCorrections = corrections.filter(correction => {
    const matchesSearch = 
      correction.indicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      correction.indicatorAr.includes(searchQuery) ||
      correction.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || correction.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || correction.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSubmitReport = () => {
    toast.success(language === "ar" 
      ? "تم إرسال التقرير بنجاح. سنراجعه قريباً." 
      : "Report submitted successfully. We'll review it soon.");
    setReportDialogOpen(false);
  };

  const statusConfig = {
    resolved: {
      labelEn: "Resolved",
      labelAr: "تم الحل",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle2
    },
    under_review: {
      labelEn: "Under Review",
      labelAr: "قيد المراجعة",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: Clock
    },
    pending: {
      labelEn: "Pending",
      labelAr: "معلق",
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: Clock
    },
  };

  const impactConfig = {
    high: { labelEn: "High Impact", labelAr: "تأثير عالي", color: "bg-red-100 text-red-700" },
    medium: { labelEn: "Medium Impact", labelAr: "تأثير متوسط", color: "bg-amber-100 text-amber-700" },
    low: { labelEn: "Low Impact", labelAr: "تأثير منخفض", color: "bg-green-100 text-green-700" },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-[#103050] text-white py-12">
        <div className="container">
          <div className={`${language === 'ar' ? 'text-right' : ''}`}>
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              {language === "ar" ? "الشفافية والمساءلة" : "Transparency & Accountability"}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {language === "ar" ? "سجل التصحيحات" : "Corrections Log"}
            </h1>
            <p className="text-white/80 max-w-3xl mb-6">
              {language === "ar"
                ? "نحن ملتزمون بالدقة والشفافية. يوثق هذا السجل جميع التصحيحات التي تم إجراؤها على بياناتنا، بما في ذلك ما تم تغييره ولماذا ومتى."
                : "We are committed to accuracy and transparency. This log documents all corrections made to our data, including what was changed, why, and when."}
            </p>
            
            {/* Report Issue Button */}
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#C0A030] hover:bg-[#A08020] text-white">
                  <Flag className="h-4 w-4 mr-2" />
                  {language === "ar" ? "الإبلاغ عن مشكلة" : "Report an Issue"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {language === "ar" ? "الإبلاغ عن مشكلة في البيانات" : "Report a Data Issue"}
                  </DialogTitle>
                  <DialogDescription>
                    {language === "ar"
                      ? "ساعدنا في تحسين جودة البيانات من خلال الإبلاغ عن أي أخطاء أو مشكلات تجدها."
                      : "Help us improve data quality by reporting any errors or issues you find."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === "ar" ? "نوع المشكلة" : "Issue Type"}
                    </label>
                    <Select defaultValue="data_error">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="data_error">
                          {language === "ar" ? "خطأ في البيانات" : "Data Error"}
                        </SelectItem>
                        <SelectItem value="source_update">
                          {language === "ar" ? "تحديث المصدر" : "Source Update"}
                        </SelectItem>
                        <SelectItem value="methodology">
                          {language === "ar" ? "مشكلة في المنهجية" : "Methodology Issue"}
                        </SelectItem>
                        <SelectItem value="attribution">
                          {language === "ar" ? "خطأ في الإسناد" : "Attribution Error"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === "ar" ? "المؤشر أو الصفحة المتأثرة" : "Affected Indicator or Page"}
                    </label>
                    <Input placeholder={language === "ar" ? "مثال: سعر الصرف، لوحة البيانات" : "e.g., Exchange Rate, Dashboard"} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === "ar" ? "وصف المشكلة" : "Issue Description"}
                    </label>
                    <Textarea 
                      placeholder={language === "ar" 
                        ? "يرجى وصف المشكلة بالتفصيل، بما في ذلك ما تعتقد أنه القيمة الصحيحة إذا كان ذلك ممكناً."
                        : "Please describe the issue in detail, including what you believe the correct value should be if possible."}
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === "ar" ? "المصدر الداعم (اختياري)" : "Supporting Source (Optional)"}
                    </label>
                    <Input placeholder={language === "ar" ? "رابط أو مرجع للمصدر" : "Link or reference to source"} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === "ar" ? "بريدك الإلكتروني (اختياري)" : "Your Email (Optional)"}
                    </label>
                    <Input type="email" placeholder={language === "ar" ? "للمتابعة معك" : "For follow-up"} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button onClick={handleSubmitReport} className="bg-[#107040] hover:bg-[#0D5A34]">
                    {language === "ar" ? "إرسال التقرير" : "Submit Report"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border-b py-4">
        <div className="container">
          <div className={`flex flex-wrap items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex-1 min-w-[250px]">
              <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={language === "ar" ? "البحث في التصحيحات..." : "Search corrections..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${language === 'ar' ? 'pr-10 text-right' : 'pl-10'}`}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {language === "ar" ? cat.labelAr : cat.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {language === "ar" ? status.labelAr : status.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-[#103050] dark:text-white">{corrections.length}</div>
              <div className="text-sm text-gray-500">
                {language === "ar" ? "إجمالي التصحيحات" : "Total Corrections"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {corrections.filter(c => c.status === "resolved").length}
              </div>
              <div className="text-sm text-gray-500">
                {language === "ar" ? "تم الحل" : "Resolved"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">
                {corrections.filter(c => c.status === "under_review").length}
              </div>
              <div className="text-sm text-gray-500">
                {language === "ar" ? "قيد المراجعة" : "Under Review"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-gray-600">2.1</div>
              <div className="text-sm text-gray-500">
                {language === "ar" ? "متوسط أيام الحل" : "Avg. Days to Resolve"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Corrections List */}
        <div className="space-y-4">
          {filteredCorrections.map((correction) => {
            const StatusIcon = statusConfig[correction.status as keyof typeof statusConfig].icon;
            return (
              <Card key={correction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {correction.id}
                      </Badge>
                      <Badge className={statusConfig[correction.status as keyof typeof statusConfig].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {language === "ar" 
                          ? statusConfig[correction.status as keyof typeof statusConfig].labelAr
                          : statusConfig[correction.status as keyof typeof statusConfig].labelEn}
                      </Badge>
                      <Badge className={impactConfig[correction.impactLevel as keyof typeof impactConfig].color}>
                        {language === "ar" 
                          ? impactConfig[correction.impactLevel as keyof typeof impactConfig].labelAr
                          : impactConfig[correction.impactLevel as keyof typeof impactConfig].labelEn}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {correction.dateReported}
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg text-[#103050] dark:text-white mb-2">
                    {language === "ar" ? correction.indicatorAr : correction.indicator}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {language === "ar" ? correction.descriptionAr : correction.descriptionEn}
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        {language === "ar" ? "القيمة الأصلية" : "Original Value"}
                      </div>
                      <div className="font-medium text-red-600 line-through">
                        {correction.originalValue}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        {language === "ar" ? "القيمة المصححة" : "Corrected Value"}
                      </div>
                      <div className="font-medium text-green-600">
                        {correction.correctedValue}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {language === "ar" ? "أبلغ عنه:" : "Reported by:"} {correction.reportedBy}
                      </span>
                      {correction.resolvedBy && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          {language === "ar" ? "حله:" : "Resolved by:"} {correction.resolvedBy}
                        </span>
                      )}
                    </div>
                    {correction.dateResolved && (
                      <span>
                        {language === "ar" ? "تاريخ الحل:" : "Resolved:"} {correction.dateResolved}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCorrections.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {language === "ar" ? "لم يتم العثور على تصحيحات" : "No corrections found"}
            </h3>
            <p className="text-gray-500">
              {language === "ar" 
                ? "جرب تعديل معايير البحث أو الفلتر"
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        )}
      </div>

      {/* Commitment Section */}
      <div className="bg-white dark:bg-gray-900 border-t py-12">
        <div className="container">
          <Card className="bg-[#103050]/5 border-[#103050]/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-[#103050] mt-1" />
                <div>
                  <h3 className="font-semibold text-[#103050] dark:text-white mb-2">
                    {language === "ar" ? "التزامنا بالدقة" : "Our Commitment to Accuracy"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {language === "ar"
                      ? "نحن نأخذ جودة البيانات على محمل الجد. عندما نكتشف خطأً أو يتم الإبلاغ عنه، نقوم بالتحقيق فيه على الفور وتصحيحه وتوثيق التغيير هنا. نهدف إلى حل جميع التصحيحات في غضون 48 ساعة."
                      : "We take data quality seriously. When we discover or receive a report of an error, we investigate promptly, correct it, and document the change here. We aim to resolve all corrections within 48 hours."}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="text-[#107040] border-[#107040]/30 hover:bg-[#107040]/10">
                      {language === "ar" ? "عرض المنهجية" : "View Methodology"}
                    </Button>
                    <Button variant="outline" className="text-[#107040] border-[#107040]/30 hover:bg-[#107040]/10">
                      {language === "ar" ? "سياسة جودة البيانات" : "Data Quality Policy"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
