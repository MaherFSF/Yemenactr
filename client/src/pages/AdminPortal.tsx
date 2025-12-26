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
  Shield, 
  Database,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Settings,
  BarChart3,
  Search,
  Plus
} from "lucide-react";

export default function AdminPortal() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data
  const pendingSubmissions = [
    {
      id: 1,
      title: "Q4 2024 Banking Liquidity Data",
      contributor: "Central Bank Research Team",
      submitted: "2024-12-23",
      dataPoints: 45,
      status: "pending_review"
    },
    {
      id: 2,
      title: "Port Operations November 2024",
      contributor: "Aden Port Authority",
      submitted: "2024-12-22",
      dataPoints: 28,
      status: "pending_review"
    },
    {
      id: 3,
      title: "Humanitarian Aid Distribution Q4",
      contributor: "UN OCHA Yemen",
      submitted: "2024-12-21",
      dataPoints: 67,
      status: "under_review"
    },
  ];

  const recentActivity = [
    { action: "Dataset Published", item: "Trade Balance October 2024", user: "Admin User", time: "2 hours ago" },
    { action: "Source Verified", item: "World Bank Yemen Report", user: "Data Manager", time: "4 hours ago" },
    { action: "Quality Check Passed", item: "Banking Sector NPL Data", user: "QA Team", time: "6 hours ago" },
    { action: "New Submission", item: "Poverty Rate by Governorate", user: "UNICEF Yemen", time: "8 hours ago" },
  ];

  const dataQualityIssues = [
    {
      id: 1,
      dataset: "Import Statistics Sept 2024",
      issue: "Missing source attribution for 12 data points",
      severity: "high",
      reported: "2024-12-20"
    },
    {
      id: 2,
      dataset: "Banking Sector Deposits",
      issue: "Inconsistent date formats in time series",
      severity: "medium",
      reported: "2024-12-19"
    },
    {
      id: 3,
      dataset: "Humanitarian Needs Assessment",
      issue: "Confidence rating not specified",
      severity: "low",
      reported: "2024-12-18"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="outline" className="text-sm">
                {language === "ar" ? "بوابة الإدارة" : "Admin Portal"}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "ar" 
                ? "بوابة إدارة البيانات"
                : "Data Management Portal"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === "ar"
                ? "إدارة مجموعات البيانات، مراجعة المساهمات، ومراقبة جودة البيانات"
                : "Manage datasets, review contributions, and monitor data quality"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "قيد المراجعة" : "Pending Review"}</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <div className="text-sm text-muted-foreground mt-1">
                {language === "ar" ? "مساهمات جديدة" : "New submissions"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "مشاكل الجودة" : "Quality Issues"}</span>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8</div>
              <div className="text-sm text-muted-foreground mt-1">
                {language === "ar" ? "تتطلب الاهتمام" : "Require attention"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "المساهمون النشطون" : "Active Contributors"}</span>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <div className="text-sm text-muted-foreground mt-1">
                {language === "ar" ? "هذا الشهر" : "This month"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{language === "ar" ? "مجموعات البيانات" : "Total Datasets"}</span>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">342</div>
              <div className="text-sm text-muted-foreground mt-1">
                {language === "ar" ? "منشورة" : "Published"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              {language === "ar" ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="submissions">
              {language === "ar" ? "المساهمات" : "Submissions"}
            </TabsTrigger>
            <TabsTrigger value="quality">
              {language === "ar" ? "الجودة" : "Quality"}
            </TabsTrigger>
            <TabsTrigger value="sources">
              {language === "ar" ? "المصادر" : "Sources"}
            </TabsTrigger>
            <TabsTrigger value="upload">
              {language === "ar" ? "رفع" : "Upload"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {language === "ar" ? "النشاط الأخير" : "Recent Activity"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{activity.action}</Badge>
                          <span className="font-medium">{activity.item}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activity.user} • {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            {/* Pending Submissions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {language === "ar" ? "المساهمات قيد المراجعة" : "Pending Submissions"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Search className="h-4 w-4" />
                      {language === "ar" ? "بحث" : "Search"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingSubmissions.map((submission) => (
                    <div key={submission.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{submission.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {submission.contributor}
                            </span>
                            <span>{submission.submitted}</span>
                            <Badge variant="outline" className="text-xs">
                              {submission.dataPoints} {language === "ar" ? "نقاط" : "points"}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {submission.status === "pending_review" 
                            ? (language === "ar" ? "قيد المراجعة" : "Pending Review")
                            : (language === "ar" ? "تحت المراجعة" : "Under Review")}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" className="gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {language === "ar" ? "موافقة" : "Approve"}
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <FileText className="h-4 w-4" />
                          {language === "ar" ? "مراجعة" : "Review"}
                        </Button>
                        <Button size="sm" variant="outline">
                          {language === "ar" ? "رفض" : "Reject"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            {/* Data Quality Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {language === "ar" ? "مشاكل جودة البيانات" : "Data Quality Issues"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataQualityIssues.map((issue) => (
                    <div key={issue.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{issue.dataset}</h4>
                            <Badge 
                              variant={issue.severity === "high" ? "destructive" : issue.severity === "medium" ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {issue.severity === "high" 
                                ? (language === "ar" ? "عالية" : "High")
                                : issue.severity === "medium"
                                ? (language === "ar" ? "متوسطة" : "Medium")
                                : (language === "ar" ? "منخفضة" : "Low")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{issue.issue}</p>
                          <div className="text-xs text-muted-foreground">
                            {language === "ar" ? "تم الإبلاغ:" : "Reported:"} {issue.reported}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          {language === "ar" ? "حل" : "Resolve"}
                        </Button>
                        <Button size="sm" variant="outline">
                          {language === "ar" ? "تعيين" : "Assign"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            {/* Source Registry */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {language === "ar" ? "سجل المصادر" : "Source Registry"}
                  </CardTitle>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {language === "ar" ? "إضافة مصدر" : "Add Source"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={language === "ar" ? "ابحث في المصادر..." : "Search sources..."}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="border rounded-lg divide-y">
                    {["Central Bank of Aden", "World Bank", "UN OCHA", "Yemen Customs Authority", "UNICEF Yemen"].map((source, index) => (
                      <div key={index} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{source}</div>
                            <div className="text-sm text-muted-foreground">
                              {language === "ar" ? "موثوق" : "Verified"} • {Math.floor(Math.random() * 50) + 10} {language === "ar" ? "مجموعات بيانات" : "datasets"}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {language === "ar" ? "عرض" : "View"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            {/* Data Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {language === "ar" ? "رفع بيانات جديدة" : "Upload New Data"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "قم برفع مجموعة بيانات جديدة إلى المستودع"
                    : "Upload a new dataset to the repository"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "عنوان مجموعة البيانات" : "Dataset Title"}
                    </label>
                    <Input placeholder={language === "ar" ? "أدخل العنوان..." : "Enter title..."} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "الوصف" : "Description"}
                    </label>
                    <Textarea 
                      placeholder={language === "ar" ? "صف مجموعة البيانات..." : "Describe the dataset..."} 
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "ar" ? "القطاع" : "Sector"}
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
                        {language === "ar" ? "النظام" : "Regime"}
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "المصدر" : "Source"}
                    </label>
                    <Input placeholder={language === "ar" ? "مصدر البيانات..." : "Data source..."} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "ملف البيانات" : "Data File"}
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

                  <div className="flex gap-3">
                    <Button type="submit" className="gap-2">
                      <Upload className="h-4 w-4" />
                      {language === "ar" ? "رفع البيانات" : "Upload Data"}
                    </Button>
                    <Button type="button" variant="outline">
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
