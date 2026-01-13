import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  Plus,
  Eye
} from "lucide-react";

export default function PartnerPortal() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data
  const mySubmissions = [
    {
      id: 1,
      title: "Q4 2025 Banking Sector Report",
      submitted: "2026-01-05",
      status: "approved",
      dataPoints: 45,
      views: 234
    },
    {
      id: 2,
      title: "Trade Statistics December 2025",
      submitted: "2026-01-03",
      status: "under_review",
      dataPoints: 32,
      views: 0
    },
    {
      id: 3,
      title: "Humanitarian Needs Assessment Q4 2025",
      submitted: "2026-01-02",
      status: "pending",
      dataPoints: 67,
      views: 0
    },
  ];

  const contributionGuidelines = [
    {
      title: language === "ar" ? "تنسيق البيانات" : "Data Format",
      description: language === "ar" 
        ? "استخدم CSV أو Excel أو JSON مع رؤوس أعمدة واضحة"
        : "Use CSV, Excel, or JSON with clear column headers"
    },
    {
      title: language === "ar" ? "توثيق المصدر" : "Source Documentation",
      description: language === "ar"
        ? "قدم مصادر كاملة لجميع نقاط البيانات"
        : "Provide complete sources for all data points"
    },
    {
      title: language === "ar" ? "تقييم الثقة" : "Confidence Rating",
      description: language === "ar"
        ? "حدد مستوى الثقة (عالي، متوسط، منخفض)"
        : "Specify confidence level (high, medium, low)"
    },
    {
      title: language === "ar" ? "وضع علامات النظام" : "Regime Tagging",
      description: language === "ar"
        ? "حدد ما إذا كانت البيانات تتعلق بعدن أو صنعاء أو كليهما"
        : "Indicate if data relates to Aden, Sana'a, or both"
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> {language === "ar" ? "موافق عليه" : "Approved"}</Badge>;
    } else if (status === "under_review") {
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> {language === "ar" ? "قيد المراجعة" : "Under Review"}</Badge>;
    } else {
      return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" /> {language === "ar" ? "قيد الانتظار" : "Pending"}</Badge>;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-900/20 via-primary/10 to-green-900/20 border-b">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="outline" className="text-sm">
                {language === "ar" ? "بوابة الشركاء" : "Partner Portal"}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "ar" 
                ? "بوابة المساهمين"
                : "Contributor Portal"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === "ar"
                ? "ساهم بالبيانات الاقتصادية وتتبع مساهماتك وتعاون مع المجتمع"
                : "Contribute economic data, track your submissions, and collaborate with the community"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Contributor Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "إجمالي المساهمات" : "Total Contributions"}</span>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <div className="text-sm text-muted-foreground mt-1">
                {language === "ar" ? "مجموعات بيانات" : "Datasets"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "معتمدة" : "Approved"}</span>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">18</div>
              <div className="text-sm text-muted-foreground mt-1">
                {language === "ar" ? "منشورة" : "Published"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "المشاهدات" : "Total Views"}</span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3.2K</div>
              <div className="text-sm text-muted-foreground mt-1">
                {language === "ar" ? "هذا الشهر" : "This month"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "نقاط المساهمة" : "Contribution Points"}</span>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">850</div>
              <div className="text-sm text-muted-foreground mt-1">
                <Badge variant="secondary" className="text-xs">
                  {language === "ar" ? "مساهم ذهبي" : "Gold Contributor"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              {language === "ar" ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="submissions">
              {language === "ar" ? "مساهماتي" : "My Submissions"}
            </TabsTrigger>
            <TabsTrigger value="submit">
              {language === "ar" ? "إرسال بيانات" : "Submit Data"}
            </TabsTrigger>
            <TabsTrigger value="guidelines">
              {language === "ar" ? "الإرشادات" : "Guidelines"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Message */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "مرحباً بك في بوابة المساهمين" : "Welcome to the Contributor Portal"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "شكراً لمساهمتك في بناء قاعدة بيانات اقتصادية شاملة لليمن"
                    : "Thank you for contributing to building a comprehensive economic database for Yemen"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {language === "ar" ? "لماذا تساهم؟" : "Why Contribute?"}
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>
                          {language === "ar"
                            ? "ساعد في بناء قاعدة بيانات موثوقة لدعم صنع القرار"
                            : "Help build a trusted database to support decision-making"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>
                          {language === "ar"
                            ? "احصل على الاعتراف بمساهماتك في المجتمع البحثي"
                            : "Get recognition for your contributions in the research community"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>
                          {language === "ar"
                            ? "تعاون مع خبراء وباحثين من جميع أنحاء العالم"
                            : "Collaborate with experts and researchers worldwide"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>
                          {language === "ar"
                            ? "ساهم في تحسين الشفافية الاقتصادية في اليمن"
                            : "Contribute to improving economic transparency in Yemen"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button className="gap-2" onClick={() => setActiveTab("submit")}>
                      <Plus className="h-4 w-4" />
                      {language === "ar" ? "إرسال بيانات جديدة" : "Submit New Data"}
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("guidelines")}>
                      {language === "ar" ? "عرض الإرشادات" : "View Guidelines"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "النشاط الأخير" : "Recent Activity"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {language === "ar" ? "تمت الموافقة على مساهمتك" : "Your submission was approved"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Q4 2024 Banking Sector Report • {language === "ar" ? "منذ ساعتين" : "2 hours ago"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Eye className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {language === "ar" ? "مجموعة بياناتك حصلت على 50 مشاهدة" : "Your dataset reached 50 views"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Trade Statistics November 2024 • {language === "ar" ? "منذ 5 ساعات" : "5 hours ago"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            {/* My Submissions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {language === "ar" ? "مساهماتي" : "My Submissions"}
                  </CardTitle>
                  <Button size="sm" className="gap-2" onClick={() => setActiveTab("submit")}>
                    <Plus className="h-4 w-4" />
                    {language === "ar" ? "جديد" : "New"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mySubmissions.map((submission) => (
                    <div key={submission.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">{submission.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                            <span>{language === "ar" ? "تم الإرسال:" : "Submitted:"} {submission.submitted}</span>
                            <Badge variant="outline" className="text-xs">
                              {submission.dataPoints} {language === "ar" ? "نقاط" : "points"}
                            </Badge>
                            {submission.status === "approved" && (
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {submission.views} {language === "ar" ? "مشاهدة" : "views"}
                              </span>
                            )}
                          </div>
                          {getStatusBadge(submission.status)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          {language === "ar" ? "عرض" : "View"}
                        </Button>
                        {submission.status === "pending" && (
                          <Button size="sm" variant="outline">
                            {language === "ar" ? "تعديل" : "Edit"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            {/* Submit New Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {language === "ar" ? "إرسال بيانات جديدة" : "Submit New Data"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "املأ النموذج أدناه لإرسال مجموعة بيانات جديدة"
                    : "Fill out the form below to submit a new dataset"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "عنوان مجموعة البيانات" : "Dataset Title"} *
                    </label>
                    <Input placeholder={language === "ar" ? "أدخل عنواً وصفياً..." : "Enter a descriptive title..."} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "الوصف" : "Description"} *
                    </label>
                    <Textarea 
                      placeholder={language === "ar" ? "صف مجموعة البيانات والمنهجية..." : "Describe the dataset and methodology..."} 
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "ar" ? "القطاع" : "Sector"} *
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "ar" ? "اختر القطاع" : "Select sector"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="banking">{language === "ar" ? "المصرفي والمالي" : "Banking & Finance"}</SelectItem>
                          <SelectItem value="trade">{language === "ar" ? "التجارة" : "Trade & Commerce"}</SelectItem>
                          <SelectItem value="poverty">{language === "ar" ? "الفقر والتنمية" : "Poverty & Development"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "ar" ? "النظام" : "Regime"} *
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "ar" ? "اختر النظام" : "Select regime"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aden">Aden</SelectItem>
                          <SelectItem value="sanaa">Sana'a</SelectItem>
                          <SelectItem value="both">{language === "ar" ? "كلاهما" : "Both"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "ar" ? "المصدر" : "Source"} *
                      </label>
                      <Input placeholder={language === "ar" ? "مصدر البيانات..." : "Data source..."} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "ar" ? "مستوى الثقة" : "Confidence Level"} *
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "ar" ? "اختر المستوى" : "Select level"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">{language === "ar" ? "عالي" : "High"}</SelectItem>
                          <SelectItem value="medium">{language === "ar" ? "متوسط" : "Medium"}</SelectItem>
                          <SelectItem value="low">{language === "ar" ? "منخفض" : "Low"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "ملف البيانات" : "Data File"} *
                    </label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" 
                          ? "اسحب وأفلت الملف هنا أو انقر للتحميل"
                          : "Drag and drop file here or click to upload"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        CSV, Excel, JSON (Max 10MB)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "ملاحظات إضافية" : "Additional Notes"}
                    </label>
                    <Textarea 
                      placeholder={language === "ar" ? "أي معلومات إضافية..." : "Any additional information..."} 
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="gap-2">
                      <Upload className="h-4 w-4" />
                      {language === "ar" ? "إرسال للمراجعة" : "Submit for Review"}
                    </Button>
                    <Button type="button" variant="outline">
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-6">
            {/* Contribution Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "إرشادات المساهمة" : "Contribution Guidelines"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "اتبع هذه الإرشادات لضمان قبول مساهماتك"
                    : "Follow these guidelines to ensure your contributions are accepted"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {contributionGuidelines.map((guideline, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        {guideline.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {guideline.description}
                      </p>
                    </div>
                  ))}

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      {language === "ar" ? "عملية المراجعة" : "Review Process"}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {language === "ar"
                        ? "سيتم مراجعة جميع المساهمات من قبل فريق الجودة لدينا خلال 3-5 أيام عمل. ستتلقى إشعاراً بمجرد الموافقة على مساهمتك أو إذا كانت هناك حاجة لمعلومات إضافية."
                        : "All submissions are reviewed by our quality team within 3-5 business days. You will receive a notification once your contribution is approved or if additional information is needed."}
                    </p>
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
