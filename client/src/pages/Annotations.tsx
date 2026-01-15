/**
 * Collaborative Annotations Page
 * 
 * Allows institutional users to add private annotations to data points
 * that can be shared within their organization.
 */

import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  MessageSquare, 
  Flag,
  Bookmark,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  FileText,
  Plus,
  ThumbsUp,
  Reply,
  MoreHorizontal,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Users,
  Lock,
  Globe,
  Building2,
  Eye,
  EyeOff,
  Trash2,
  Edit,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Types
interface Annotation {
  id: string;
  userId: string;
  organizationId?: string;
  targetType: "time_series" | "indicator" | "event" | "publication" | "entity" | "report";
  targetId: string;
  annotationType: "note" | "question" | "correction" | "insight" | "flag" | "bookmark";
  title?: string;
  content: string;
  contentAr?: string;
  visibility: "private" | "organization" | "public";
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  parentId?: string;
  threadCount: number;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string;
    organization?: string;
  };
  replies?: Annotation[];
  hasUpvoted?: boolean;
}

// Sample annotations for demonstration
const sampleAnnotations: Annotation[] = [
  {
    id: "ann_001",
    userId: "user_001",
    organizationId: "org_world_bank",
    targetType: "indicator",
    targetId: "FX_ADEN",
    annotationType: "insight",
    title: "Exchange Rate Volatility Analysis",
    content: "The Aden exchange rate has shown increased volatility since Q3 2023, correlating with reduced Saudi support payments. This pattern suggests dependency on external financing.",
    contentAr: "أظهر سعر صرف عدن تقلبات متزايدة منذ الربع الثالث 2023، مرتبطة بانخفاض مدفوعات الدعم السعودي.",
    visibility: "organization",
    isResolved: false,
    threadCount: 3,
    upvotes: 12,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    author: {
      id: "user_001",
      name: "Dr. Ahmed Hassan",
      organization: "World Bank",
    },
  },
  {
    id: "ann_002",
    userId: "user_002",
    organizationId: "org_imf",
    targetType: "time_series",
    targetId: "ts_inflation_2024_01",
    annotationType: "correction",
    title: "Inflation Data Correction",
    content: "The January 2024 inflation figure appears to use outdated basket weights. Recommend recalculating with 2023 consumption survey data.",
    contentAr: "يبدو أن رقم التضخم لشهر يناير 2024 يستخدم أوزان سلة قديمة.",
    visibility: "public",
    isResolved: true,
    resolvedBy: "admin_001",
    resolvedAt: new Date("2024-02-01"),
    threadCount: 5,
    upvotes: 8,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-02-01"),
    author: {
      id: "user_002",
      name: "Sarah Mitchell",
      organization: "IMF",
    },
  },
  {
    id: "ann_003",
    userId: "user_003",
    organizationId: "org_undp",
    targetType: "event",
    targetId: "event_2024_port_closure",
    annotationType: "note",
    title: "Port Closure Impact Assessment",
    content: "The Hodeidah port closure in February 2024 had cascading effects on food prices in northern governorates. Our field teams reported 15-20% price increases within 2 weeks.",
    contentAr: "كان لإغلاق ميناء الحديدة في فبراير 2024 آثار متتالية على أسعار الغذاء.",
    visibility: "organization",
    isResolved: false,
    threadCount: 2,
    upvotes: 15,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
    author: {
      id: "user_003",
      name: "Mohammed Al-Qadhi",
      organization: "UNDP Yemen",
    },
  },
  {
    id: "ann_004",
    userId: "user_004",
    targetType: "publication",
    targetId: "pub_quarterly_2024_q1",
    annotationType: "question",
    title: "Methodology Clarification",
    content: "Could you clarify the methodology used for GDP estimation in conflict-affected areas? The report mentions satellite imagery but doesn't detail the specific approach.",
    contentAr: "هل يمكنكم توضيح المنهجية المستخدمة لتقدير الناتج المحلي الإجمالي؟",
    visibility: "public",
    isResolved: false,
    threadCount: 1,
    upvotes: 6,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
    author: {
      id: "user_004",
      name: "Dr. Fatima Al-Sanabani",
    },
  },
  {
    id: "ann_005",
    userId: "user_005",
    organizationId: "org_cby_aden",
    targetType: "indicator",
    targetId: "FX_SPREAD",
    annotationType: "flag",
    title: "Data Quality Alert",
    content: "The spread calculation for March 2024 may be affected by temporary market disruptions. Recommend flagging this data point with reduced confidence.",
    contentAr: "قد يتأثر حساب الفارق لشهر مارس 2024 باضطرابات السوق المؤقتة.",
    visibility: "organization",
    isResolved: false,
    threadCount: 0,
    upvotes: 4,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    author: {
      id: "user_005",
      name: "Ali Saeed",
      organization: "Central Bank of Yemen (Aden)",
    },
  },
];

export default function Annotations() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedVisibility, setSelectedVisibility] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

  // New annotation form state
  const [newAnnotation, setNewAnnotation] = useState({
    targetType: "indicator" as Annotation["targetType"],
    targetId: "",
    annotationType: "note" as Annotation["annotationType"],
    title: "",
    content: "",
    contentAr: "",
    visibility: "private" as Annotation["visibility"],
  });

  const isRTL = language === "ar";

  // Filter annotations
  const filteredAnnotations = useMemo(() => {
    let results = [...sampleAnnotations];

    if (selectedType !== "all") {
      results = results.filter(ann => ann.annotationType === selectedType);
    }

    if (selectedVisibility !== "all") {
      results = results.filter(ann => ann.visibility === selectedVisibility);
    }

    if (selectedStatus !== "all") {
      results = results.filter(ann => 
        selectedStatus === "resolved" ? ann.isResolved : !ann.isResolved
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(ann =>
        ann.content.toLowerCase().includes(query) ||
        ann.title?.toLowerCase().includes(query) ||
        ann.author?.name.toLowerCase().includes(query)
      );
    }

    return results;
  }, [selectedType, selectedVisibility, selectedStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    let resolved = 0;
    let unresolved = 0;

    sampleAnnotations.forEach(ann => {
      byType[ann.annotationType] = (byType[ann.annotationType] || 0) + 1;
      if (ann.isResolved) resolved++;
      else unresolved++;
    });

    return { byType, resolved, unresolved, total: sampleAnnotations.length };
  }, []);

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case "note": return <MessageSquare className="h-4 w-4" />;
      case "question": return <HelpCircle className="h-4 w-4" />;
      case "correction": return <AlertTriangle className="h-4 w-4" />;
      case "insight": return <Lightbulb className="h-4 w-4" />;
      case "flag": return <Flag className="h-4 w-4" />;
      case "bookmark": return <Bookmark className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getAnnotationColor = (type: string) => {
    switch (type) {
      case "note": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "question": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "correction": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "insight": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "flag": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "bookmark": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "private": return <Lock className="h-3 w-3" />;
      case "organization": return <Building2 className="h-3 w-3" />;
      case "public": return <Globe className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleCreateAnnotation = () => {
    console.log("Creating annotation:", newAnnotation);
    setShowCreateDialog(false);
    setNewAnnotation({
      targetType: "indicator",
      targetId: "",
      annotationType: "note",
      title: "",
      content: "",
      contentAr: "",
      visibility: "private",
    });
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isRTL ? "التعليقات التعاونية" : "Collaborative Annotations"}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? "أضف ملاحظات خاصة إلى نقاط البيانات وشاركها مع مؤسستك"
                : "Add private notes to data points and share them within your organization"}
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? "إضافة تعليق" : "Add Annotation"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{isRTL ? "إضافة تعليق جديد" : "Add New Annotation"}</DialogTitle>
                <DialogDescription>
                  {isRTL 
                    ? "أضف ملاحظة أو سؤال أو رؤية إلى نقطة بيانات محددة"
                    : "Add a note, question, or insight to a specific data point"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {isRTL ? "نوع الهدف" : "Target Type"}
                    </label>
                    <Select 
                      value={newAnnotation.targetType} 
                      onValueChange={(v) => setNewAnnotation(prev => ({ ...prev, targetType: v as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indicator">{isRTL ? "مؤشر" : "Indicator"}</SelectItem>
                        <SelectItem value="time_series">{isRTL ? "سلسلة زمنية" : "Time Series"}</SelectItem>
                        <SelectItem value="event">{isRTL ? "حدث" : "Event"}</SelectItem>
                        <SelectItem value="publication">{isRTL ? "منشور" : "Publication"}</SelectItem>
                        <SelectItem value="entity">{isRTL ? "كيان" : "Entity"}</SelectItem>
                        <SelectItem value="report">{isRTL ? "تقرير" : "Report"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {isRTL ? "نوع التعليق" : "Annotation Type"}
                    </label>
                    <Select 
                      value={newAnnotation.annotationType} 
                      onValueChange={(v) => setNewAnnotation(prev => ({ ...prev, annotationType: v as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="note">{isRTL ? "ملاحظة" : "Note"}</SelectItem>
                        <SelectItem value="question">{isRTL ? "سؤال" : "Question"}</SelectItem>
                        <SelectItem value="correction">{isRTL ? "تصحيح" : "Correction"}</SelectItem>
                        <SelectItem value="insight">{isRTL ? "رؤية" : "Insight"}</SelectItem>
                        <SelectItem value="flag">{isRTL ? "تنبيه" : "Flag"}</SelectItem>
                        <SelectItem value="bookmark">{isRTL ? "إشارة مرجعية" : "Bookmark"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {isRTL ? "معرف الهدف" : "Target ID"}
                  </label>
                  <Input
                    placeholder={isRTL ? "مثال: FX_ADEN" : "e.g., FX_ADEN"}
                    value={newAnnotation.targetId}
                    onChange={(e) => setNewAnnotation(prev => ({ ...prev, targetId: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {isRTL ? "العنوان" : "Title"}
                  </label>
                  <Input
                    placeholder={isRTL ? "عنوان التعليق" : "Annotation title"}
                    value={newAnnotation.title}
                    onChange={(e) => setNewAnnotation(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {isRTL ? "المحتوى" : "Content"}
                  </label>
                  <Textarea
                    placeholder={isRTL ? "اكتب تعليقك هنا..." : "Write your annotation here..."}
                    value={newAnnotation.content}
                    onChange={(e) => setNewAnnotation(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {isRTL ? "الرؤية" : "Visibility"}
                  </label>
                  <Select 
                    value={newAnnotation.visibility} 
                    onValueChange={(v) => setNewAnnotation(prev => ({ ...prev, visibility: v as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          {isRTL ? "خاص (أنت فقط)" : "Private (Only you)"}
                        </div>
                      </SelectItem>
                      <SelectItem value="organization">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {isRTL ? "المؤسسة" : "Organization"}
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {isRTL ? "عام" : "Public"}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button onClick={handleCreateAnnotation}>
                  {isRTL ? "إنشاء" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "إجمالي التعليقات" : "Total Annotations"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تم الحل" : "Resolved"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unresolved}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "قيد الانتظار" : "Pending"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "المساهمون" : "Contributors"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={isRTL ? "البحث في التعليقات..." : "Search annotations..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={isRTL ? "النوع" : "Type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "جميع الأنواع" : "All Types"}</SelectItem>
                  <SelectItem value="note">{isRTL ? "ملاحظة" : "Note"}</SelectItem>
                  <SelectItem value="question">{isRTL ? "سؤال" : "Question"}</SelectItem>
                  <SelectItem value="correction">{isRTL ? "تصحيح" : "Correction"}</SelectItem>
                  <SelectItem value="insight">{isRTL ? "رؤية" : "Insight"}</SelectItem>
                  <SelectItem value="flag">{isRTL ? "تنبيه" : "Flag"}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={isRTL ? "الرؤية" : "Visibility"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
                  <SelectItem value="private">{isRTL ? "خاص" : "Private"}</SelectItem>
                  <SelectItem value="organization">{isRTL ? "المؤسسة" : "Organization"}</SelectItem>
                  <SelectItem value="public">{isRTL ? "عام" : "Public"}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={isRTL ? "الحالة" : "Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
                  <SelectItem value="open">{isRTL ? "مفتوح" : "Open"}</SelectItem>
                  <SelectItem value="resolved">{isRTL ? "محلول" : "Resolved"}</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {isRTL ? "تصدير" : "Export"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Annotations List */}
        <div className="space-y-4">
          {filteredAnnotations.map((annotation) => (
            <Card key={annotation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {annotation.author?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{annotation.author?.name}</span>
                      {annotation.author?.organization && (
                        <Badge variant="outline" className="text-xs">
                          {annotation.author.organization}
                        </Badge>
                      )}
                      <Badge className={getAnnotationColor(annotation.annotationType)}>
                        {getAnnotationIcon(annotation.annotationType)}
                        <span className="ml-1 capitalize">{annotation.annotationType}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        {getVisibilityIcon(annotation.visibility)}
                        <span className="capitalize">{annotation.visibility}</span>
                      </Badge>
                      {annotation.isResolved && (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {isRTL ? "محلول" : "Resolved"}
                        </Badge>
                      )}
                    </div>
                    
                    {annotation.title && (
                      <h3 className="font-semibold text-lg mb-1">
                        {isRTL ? annotation.title : annotation.title}
                      </h3>
                    )}
                    
                    <p className="text-muted-foreground mb-3">
                      {isRTL ? annotation.contentAr || annotation.content : annotation.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {annotation.targetType}: {annotation.targetId}
                      </span>
                      <span>
                        {new Date(annotation.createdAt).toLocaleDateString(isRTL ? 'ar' : 'en', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <Button variant="ghost" size="sm" className="h-8">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {annotation.upvotes}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Reply className="h-4 w-4 mr-1" />
                        {annotation.threadCount} {isRTL ? "ردود" : "replies"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAnnotations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isRTL ? "لا توجد تعليقات" : "No Annotations Found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? "لم يتم العثور على تعليقات تطابق معايير البحث"
                  : "No annotations match your search criteria"}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? "إضافة أول تعليق" : "Add First Annotation"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
