/**
 * YETO Reports Page
 * 
 * Public-facing page for browsing and downloading generated reports
 * Supports filtering by template type, year, and language
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Search, 
  Bell, 
  Mail,
  ChevronRight,
  TrendingUp,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const { language, t } = useLanguage();
  const isArabic = language === "ar";
  const [, navigate] = useLocation();
  
  // Filters
  const [selectedTemplate, setSelectedTemplate] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Subscription modal
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeName, setSubscribeName] = useState("");
  const [subscribeOrg, setSubscribeOrg] = useState("");
  const [subscribeLang, setSubscribeLang] = useState<"en" | "ar">("en");
  const [subscribeTemplates, setSubscribeTemplates] = useState<string[]>([]);
  
  // Queries
  const { data: templates, isLoading: templatesLoading } = trpc.reports.listTemplates.useQuery();
  const { data: reports, isLoading: reportsLoading } = trpc.reports.listReports.useQuery({
    templateSlug: selectedTemplate === "all" ? undefined : selectedTemplate,
    year: selectedYear === "all" ? undefined : parseInt(selectedYear),
    limit: 50,
  });
  
  // Mutations
  const subscribeMutation = trpc.reports.subscribe.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم الاشتراك بنجاح! تحقق من بريدك الإلكتروني للتأكيد." : "Subscribed successfully! Check your email to confirm.");
      setSubscribeOpen(false);
      setSubscribeEmail("");
      setSubscribeName("");
      setSubscribeOrg("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Generate years for filter (2015-current)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i);
  
  // Filter reports by search query
  const filteredReports = reports?.filter(report => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.periodLabel?.toLowerCase().includes(query) ||
      report.templateNameEn?.toLowerCase().includes(query) ||
      report.templateNameAr?.includes(query)
    );
  }) || [];
  
  // Format file size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Format date
  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(isArabic ? "ar-YE" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  // Get template badge color
  const getTemplateBadgeColor = (slug: string) => {
    switch (slug) {
      case "quarterly": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "annual": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "monthly": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };
  
  const handleSubscribe = () => {
    if (!subscribeEmail) {
      toast.error(isArabic ? "البريد الإلكتروني مطلوب" : "Email is required");
      return;
    }
    subscribeMutation.mutate({
      email: subscribeEmail,
      nameEn: subscribeName,
      organization: subscribeOrg,
      preferredLanguage: subscribeLang,
      subscribedTemplates: subscribeTemplates.length > 0 ? subscribeTemplates : undefined,
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 ${isArabic ? "rtl" : "ltr"}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/50" />
        
        <div className="container relative py-16">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/10 text-white border-white/20">
              <FileText className="w-3 h-3 mr-1" />
              {isArabic ? "مركز التقارير" : "Reports Center"}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isArabic ? "التقارير الاقتصادية" : "Economic Reports"}
            </h1>
            
            <p className="text-lg text-emerald-100 mb-6 max-w-2xl">
              {isArabic 
                ? "تصفح وتحميل التقارير الاقتصادية الشاملة عن اليمن. تقارير فصلية وسنوية وشهرية مبنية على البيانات والأدلة."
                : "Browse and download comprehensive economic reports on Yemen. Quarterly, annual, and monthly reports built on data and evidence."}
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Dialog open={subscribeOpen} onOpenChange={setSubscribeOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50">
                    <Bell className="w-4 h-4 mr-2" />
                    {isArabic ? "اشترك في التقارير" : "Subscribe to Reports"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{isArabic ? "اشترك في التقارير" : "Subscribe to Reports"}</DialogTitle>
                    <DialogDescription>
                      {isArabic 
                        ? "احصل على التقارير الجديدة مباشرة في بريدك الإلكتروني"
                        : "Get new reports delivered directly to your email"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{isArabic ? "البريد الإلكتروني *" : "Email *"}</Label>
                      <Input 
                        type="email" 
                        placeholder="you@example.com"
                        value={subscribeEmail}
                        onChange={(e) => setSubscribeEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{isArabic ? "الاسم" : "Name"}</Label>
                      <Input 
                        placeholder={isArabic ? "اسمك" : "Your name"}
                        value={subscribeName}
                        onChange={(e) => setSubscribeName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{isArabic ? "المؤسسة" : "Organization"}</Label>
                      <Input 
                        placeholder={isArabic ? "اسم المؤسسة" : "Organization name"}
                        value={subscribeOrg}
                        onChange={(e) => setSubscribeOrg(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{isArabic ? "اللغة المفضلة" : "Preferred Language"}</Label>
                      <Select value={subscribeLang} onValueChange={(v) => setSubscribeLang(v as "en" | "ar")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">العربية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{isArabic ? "أنواع التقارير" : "Report Types"}</Label>
                      <div className="space-y-2">
                        {templates?.map((template) => (
                          <div key={template.slug} className="flex items-center space-x-2">
                            <Checkbox 
                              id={template.slug}
                              checked={subscribeTemplates.includes(template.slug || "")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSubscribeTemplates([...subscribeTemplates, template.slug || ""]);
                                } else {
                                  setSubscribeTemplates(subscribeTemplates.filter(t => t !== template.slug));
                                }
                              }}
                            />
                            <label htmlFor={template.slug} className="text-sm">
                              {isArabic ? template.nameAr : template.nameEn}
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? "اترك فارغاً للاشتراك في جميع التقارير" : "Leave empty to subscribe to all reports"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSubscribeOpen(false)}>
                      {isArabic ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button onClick={handleSubscribe} disabled={subscribeMutation.isPending}>
                      {subscribeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isArabic ? "اشترك" : "Subscribe"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Globe className="w-4 h-4 mr-2" />
                {isArabic ? "تصفح الأرشيف" : "Browse Archive"}
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="text-3xl font-bold">{reports?.length || 0}</div>
              <div className="text-sm text-emerald-200">{isArabic ? "تقرير متاح" : "Reports Available"}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="text-3xl font-bold">{templates?.length || 0}</div>
              <div className="text-sm text-emerald-200">{isArabic ? "نوع تقرير" : "Report Types"}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="text-3xl font-bold">2</div>
              <div className="text-sm text-emerald-200">{isArabic ? "لغات متاحة" : "Languages"}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="text-3xl font-bold">2010</div>
              <div className="text-sm text-emerald-200">{isArabic ? "بداية التغطية" : "Coverage Start"}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={isArabic ? "البحث في التقارير..." : "Search reports..."}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={isArabic ? "نوع التقرير" : "Report Type"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? "جميع الأنواع" : "All Types"}</SelectItem>
              {templates?.map((template) => (
                <SelectItem key={template.slug} value={template.slug || "unknown"}>
                  {isArabic ? template.nameAr : template.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full md:w-36">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder={isArabic ? "السنة" : "Year"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? "جميع السنوات" : "All Years"}</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Report Templates Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "أنواع التقارير" : "Report Types"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templatesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                </Card>
              ))
            ) : templates?.map((template) => (
              <Card 
                key={template.slug} 
                className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-emerald-500"
                onClick={() => setSelectedTemplate(template.slug || "all")}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getTemplateBadgeColor(template.slug || "")}>
                      {template.frequency}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">
                    {isArabic ? template.nameAr : template.nameEn}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {isArabic 
                      ? `يتضمن ${(template as any).sections?.length || 0} أقسام`
                      : `Includes ${(template as any).sections?.length || 0} sections`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Reports List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {isArabic ? "التقارير المتاحة" : "Available Reports"}
              {filteredReports.length > 0 && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({filteredReports.length})
                </span>
              )}
            </h2>
          </div>
          
          {reportsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {isArabic ? "لا توجد تقارير" : "No Reports Found"}
                </h3>
                <p className="text-muted-foreground">
                  {isArabic 
                    ? "لم يتم العثور على تقارير تطابق معايير البحث"
                    : "No reports match your search criteria"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getTemplateBadgeColor(report.templateSlug)}>
                        {isArabic ? report.templateNameAr : report.templateNameEn}
                      </Badge>
                      {report.status === "success" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                      {report.periodLabel}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {formatDate(report.generatedAt)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Summary preview */}
                    {report.summary && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {isArabic ? report.summary.summaryAr : report.summary.summaryEn}
                      </p>
                    )}
                    
                    {/* Download buttons */}
                    <div className="flex flex-col gap-2">
                      {report.s3UrlEn && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-between"
                          onClick={() => window.open(report.s3UrlEn, "_blank")}
                        >
                          <span className="flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            English PDF
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(report.fileSizeBytesEn)}
                          </span>
                        </Button>
                      )}
                      {report.s3UrlAr && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-between"
                          onClick={() => window.open(report.s3UrlAr, "_blank")}
                        >
                          <span className="flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            PDF العربية
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(report.fileSizeBytesAr)}
                          </span>
                        </Button>
                      )}
                      {!report.s3UrlEn && !report.s3UrlAr && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          {isArabic ? "التقرير قيد الإعداد" : "Report being prepared"}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-emerald-900 text-white py-12 mt-12">
        <div className="container text-center">
          <Mail className="w-12 h-12 mx-auto mb-4 text-emerald-300" />
          <h2 className="text-2xl font-bold mb-2">
            {isArabic ? "لا تفوت أي تقرير جديد" : "Never Miss a New Report"}
          </h2>
          <p className="text-emerald-200 mb-6 max-w-lg mx-auto">
            {isArabic 
              ? "اشترك في قائمتنا البريدية واحصل على التقارير الجديدة فور صدورها"
              : "Subscribe to our mailing list and get new reports as soon as they're published"}
          </p>
          <Button 
            size="lg" 
            className="bg-white text-emerald-900 hover:bg-emerald-50"
            onClick={() => setSubscribeOpen(true)}
          >
            <Bell className="w-4 h-4 mr-2" />
            {isArabic ? "اشترك الآن" : "Subscribe Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
