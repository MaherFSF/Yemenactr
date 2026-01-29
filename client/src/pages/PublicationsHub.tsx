/**
 * Public Publications Hub
 * Displays all published reports with evidence appendix access
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  BarChart3,
  Shield,
  Loader2,
  BookOpen,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  FileJson,
  File
} from "lucide-react";

export default function PublicationsHub() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  
  const [publicationType, setPublicationType] = useState<string>("all");
  const [page, setPage] = useState(0);
  const limit = 12;
  
  // Fetch published publications
  const { data: publicationsData, isLoading } = trpc.publications.getPublished.useQuery({
    publicationType: publicationType === "all" ? undefined : publicationType,
    limit,
    offset: page * limit
  });

  const getPublicationTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      daily: { en: "Daily Signal", ar: "إشارة يومية" },
      weekly: { en: "Weekly Monitor", ar: "المراقب الأسبوعي" },
      monthly: { en: "Monthly Brief", ar: "الموجز الشهري" },
      quarterly: { en: "Quarterly Report", ar: "التقرير الربع سنوي" },
      annual: { en: "Annual Review", ar: "المراجعة السنوية" },
      shock_note: { en: "Shock Note", ar: "مذكرة صدمة" }
    };
    return isArabic ? labels[type]?.ar || type : labels[type]?.en || type;
  };

  const getPublicationTypeIcon = (type: string) => {
    switch (type) {
      case "daily": return <TrendingUp className="h-5 w-5" />;
      case "weekly": return <BarChart3 className="h-5 w-5" />;
      case "monthly": return <BookOpen className="h-5 w-5" />;
      case "quarterly": return <FileText className="h-5 w-5" />;
      case "annual": return <Calendar className="h-5 w-5" />;
      case "shock_note": return <AlertCircle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      high: { en: "High Confidence", ar: "ثقة عالية" },
      medium: { en: "Medium Confidence", ar: "ثقة متوسطة" },
      low: { en: "Low Confidence", ar: "ثقة منخفضة" }
    };
    return isArabic ? labels[confidence]?.ar || confidence : labels[confidence]?.en || confidence;
  };

  const publicationTypes = [
    { value: "all", label: isArabic ? "جميع المنشورات" : "All Publications" },
    { value: "daily", label: isArabic ? "إشارات يومية" : "Daily Signals" },
    { value: "weekly", label: isArabic ? "مراقب أسبوعي" : "Weekly Monitor" },
    { value: "monthly", label: isArabic ? "موجز شهري" : "Monthly Brief" },
    { value: "quarterly", label: isArabic ? "تقارير ربع سنوية" : "Quarterly Reports" },
    { value: "annual", label: isArabic ? "مراجعات سنوية" : "Annual Reviews" },
    { value: "shock_note", label: isArabic ? "مذكرات صدمة" : "Shock Notes" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" dir={isArabic ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <div className="bg-primary/5 border-b">
        <div className="container py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">
              {isArabic ? "مركز المنشورات" : "Publications Hub"}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {isArabic 
                ? "تقارير اقتصادية مدعومة بالأدلة حول الاقتصاد اليمني - يومية وأسبوعية وشهرية وربع سنوية"
                : "Evidence-backed economic intelligence on Yemen's economy - daily, weekly, monthly, and quarterly"}
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge variant="outline" className="text-sm py-1 px-3">
                <Shield className="h-4 w-4 mr-1" />
                {isArabic ? "مراجعة من 8 مراحل" : "8-Stage Review"}
              </Badge>
              <Badge variant="outline" className="text-sm py-1 px-3">
                <FileText className="h-4 w-4 mr-1" />
                {isArabic ? "ملحق أدلة كامل" : "Full Evidence Appendix"}
              </Badge>
              <Badge variant="outline" className="text-sm py-1 px-3">
                <Download className="h-4 w-4 mr-1" />
                {isArabic ? "PDF + JSON" : "PDF + JSON"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Select value={publicationType} onValueChange={(v) => { setPublicationType(v); setPage(0); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={isArabic ? "نوع المنشور" : "Publication Type"} />
              </SelectTrigger>
              <SelectContent>
                {publicationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {publicationsData?.total || 0} {isArabic ? "منشور" : "publications"}
          </p>
        </div>

        {/* Publications Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : publicationsData?.publications.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">
                {isArabic ? "لا توجد منشورات بعد" : "No Publications Yet"}
              </h3>
              <p className="text-muted-foreground">
                {isArabic 
                  ? "سيتم نشر التقارير هنا بمجرد اكتمال خط الأنابيب التحريري"
                  : "Reports will appear here once they complete the editorial pipeline"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicationsData?.publications.map((pub) => (
                <Card key={pub.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPublicationTypeIcon(pub.templateCode.split("_")[0])}
                        <Badge variant="secondary">
                          {getPublicationTypeLabel(pub.templateCode.split("_")[0])}
                        </Badge>
                      </div>
                      {pub.confidenceSummary && (
                        <Badge className={getConfidenceColor(pub.confidenceSummary.overallConfidence)}>
                          {getConfidenceLabel(pub.confidenceSummary.overallConfidence)}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-3">
                      {pub.templateCode.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </CardTitle>
                    <CardDescription>
                      {new Date(pub.runWindowStart).toLocaleDateString(isArabic ? "ar-YE" : "en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                      {" - "}
                      {new Date(pub.runWindowEnd).toLocaleDateString(isArabic ? "ar-YE" : "en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Confidence Metrics */}
                    {pub.confidenceSummary && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {isArabic ? "تغطية الاستشهاد:" : "Citation Coverage:"}
                          </span>
                          <span className="font-medium">{pub.confidenceSummary.citationCoverage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${pub.confidenceSummary.citationCoverage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Download Options */}
                    <div className="flex flex-wrap gap-2">
                      {pub.outputArtifacts?.pdfEnUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={pub.outputArtifacts.pdfEnUrl} target="_blank" rel="noopener noreferrer">
                            <File className="h-4 w-4 mr-1" />
                            PDF (EN)
                          </a>
                        </Button>
                      )}
                      {pub.outputArtifacts?.pdfArUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={pub.outputArtifacts.pdfArUrl} target="_blank" rel="noopener noreferrer">
                            <File className="h-4 w-4 mr-1" />
                            PDF (AR)
                          </a>
                        </Button>
                      )}
                      {pub.outputArtifacts?.jsonUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={pub.outputArtifacts.jsonUrl} target="_blank" rel="noopener noreferrer">
                            <FileJson className="h-4 w-4 mr-1" />
                            JSON
                          </a>
                        </Button>
                      )}
                      {pub.outputArtifacts?.evidenceBundleUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={pub.outputArtifacts.evidenceBundleUrl} target="_blank" rel="noopener noreferrer">
                            <Shield className="h-4 w-4 mr-1" />
                            {isArabic ? "الأدلة" : "Evidence"}
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* View Full Report */}
                    {pub.publicUrl && (
                      <Button className="w-full mt-4" asChild>
                        <a href={pub.publicUrl}>
                          <Eye className="h-4 w-4 mr-2" />
                          {isArabic ? "عرض التقرير الكامل" : "View Full Report"}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {publicationsData && publicationsData.total > limit && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  {isArabic ? "السابق" : "Previous"}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {isArabic ? `صفحة ${page + 1} من ${Math.ceil(publicationsData.total / limit)}` : `Page ${page + 1} of ${Math.ceil(publicationsData.total / limit)}`}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * limit >= publicationsData.total}
                >
                  {isArabic ? "التالي" : "Next"}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Methodology Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>{isArabic ? "منهجية النشر" : "Publication Methodology"}</CardTitle>
            <CardDescription>
              {isArabic 
                ? "كيف نضمن جودة ومصداقية منشوراتنا"
                : "How we ensure quality and credibility of our publications"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-medium mb-1">{isArabic ? "جمع البيانات" : "Data Collection"}</h4>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "من مصادر متعددة موثوقة" : "From multiple verified sources"}
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-medium mb-1">{isArabic ? "فحص التناقضات" : "Contradiction Check"}</h4>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "اكتشاف وحل التناقضات" : "Detect and resolve conflicts"}
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-medium mb-1">{isArabic ? "تقييم DQAF" : "DQAF Assessment"}</h4>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "معايير جودة البيانات" : "Data quality standards"}
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">4</span>
                </div>
                <h4 className="font-medium mb-1">{isArabic ? "مراجعة بشرية" : "Human Review"}</h4>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "موافقة المسؤول النهائية" : "Final admin approval"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
