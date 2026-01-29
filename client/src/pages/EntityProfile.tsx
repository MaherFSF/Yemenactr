/**
 * YETO Entity Profile Page
 * 
 * Comprehensive entity profile with timeline, relationships, assertions,
 * and role-aware RoleLens hooks.
 */

import { useState } from "react";
import { useParams, Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, Globe, Landmark, Calendar, Network, FileText,
  Download, ExternalLink, ChevronRight, Clock, DollarSign,
  Users, BookOpen, AlertTriangle, CheckCircle, Info
} from "lucide-react";

// Role lens configurations
const roleLenses = {
  president: {
    nameEn: "Presidential Advisor",
    nameAr: "مستشار رئاسي",
    focus: ["policy", "appointment", "statement"],
    questions: [
      "What policy decisions has this entity influenced?",
      "What is their relationship with the government?"
    ]
  },
  finance: {
    nameEn: "Finance Minister",
    nameAr: "وزير المالية",
    focus: ["funding", "data_release", "partnership"],
    questions: [
      "What funding has this entity provided?",
      "What financial data do they publish?"
    ]
  },
  cby: {
    nameEn: "Central Bank Governor",
    nameAr: "محافظ البنك المركزي",
    focus: ["funding", "policy", "sanction"],
    questions: [
      "What monetary policy positions have they taken?",
      "Any sanctions or compliance issues?"
    ]
  },
  donor: {
    nameEn: "International Donor",
    nameAr: "جهة مانحة دولية",
    focus: ["funding", "project", "publication"],
    questions: [
      "What projects have they funded in Yemen?",
      "What is their aid disbursement record?"
    ]
  },
  citizen: {
    nameEn: "Yemeni Citizen",
    nameAr: "مواطن يمني",
    focus: ["project", "publication", "statement"],
    questions: [
      "How does this entity affect daily life?",
      "What services do they provide?"
    ]
  }
};

// Event type icons
const eventTypeIcons: Record<string, any> = {
  publication: FileText,
  funding: DollarSign,
  project: Users,
  policy: Landmark,
  appointment: Users,
  statement: FileText,
  data_release: FileText,
  partnership: Network,
  sanction: AlertTriangle,
  other: Info,
};

export default function EntityProfile() {
  const { id } = useParams<{ id: string }>();
  const { language, isRTL } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string>("citizen");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch entity details
  const { data: entity, isLoading, error } = trpc.entities.getById.useQuery({
    id: parseInt(id || "0"),
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (error || !entity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {language === "ar" ? "الجهة غير موجودة" : "Entity Not Found"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === "ar" 
                ? "لم نتمكن من العثور على هذه الجهة"
                : "We couldn't find this entity"}
            </p>
            <Link href="/entities">
              <Button>{language === "ar" ? "العودة للدليل" : "Back to Directory"}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const currentLens = roleLenses[selectedRole as keyof typeof roleLenses] || roleLenses.citizen;
  
  // Filter timeline by role focus
  const filteredTimeline = entity.timeline?.filter((event: any) => 
    currentLens.focus.includes(event.eventType)
  ) || [];

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-8">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/entities" className="hover:text-foreground">
              {language === "ar" ? "دليل الجهات" : "Entity Directory"}
            </Link>
            <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            <span className="text-foreground">
              {language === "ar" && entity.nameAr ? entity.nameAr : entity.name}
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {language === "ar" && entity.nameAr ? entity.nameAr : entity.name}
                </h1>
                {language === "ar" && entity.nameAr && (
                  <p className="text-muted-foreground">{entity.name}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">
                    {entity.entityType?.replace(/_/g, " ")}
                  </Badge>
                  {entity.regimeTag && (
                    <Badge variant={entity.regimeTag === "international" ? "default" : "secondary"}>
                      {entity.regimeTag}
                    </Badge>
                  )}
                  {entity.status && (
                    <Badge variant={entity.status === "active" ? "default" : "destructive"}>
                      {entity.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {language === "ar" ? "تصدير الملف" : "Export Dossier"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Role Lens */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {language === "ar" ? "عدسة الدور" : "RoleLens"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "اختر دورك لرؤية المعلومات ذات الصلة"
                    : "Select your role to see relevant information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(roleLenses).map(([key, lens]) => (
                  <Button
                    key={key}
                    variant={selectedRole === key ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedRole(key)}
                  >
                    {language === "ar" ? lens.nameAr : lens.nameEn}
                  </Button>
                ))}
              </CardContent>
            </Card>
            
            {/* What Matters Panel */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  {language === "ar" ? "ما يهمك" : "What Matters for You"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {currentLens.questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">
                  {language === "ar" ? "نظرة عامة" : "Overview"}
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  {language === "ar" ? "الجدول الزمني" : "Timeline"}
                </TabsTrigger>
                <TabsTrigger value="relationships">
                  {language === "ar" ? "العلاقات" : "Relationships"}
                </TabsTrigger>
                <TabsTrigger value="evidence">
                  {language === "ar" ? "الأدلة" : "Evidence"}
                </TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid gap-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {language === "ar" ? "الأحداث" : "Events"}
                          </span>
                        </div>
                        <p className="text-2xl font-bold mt-1">
                          {entity.timeline?.length || 0}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {language === "ar" ? "العلاقات" : "Relationships"}
                          </span>
                        </div>
                        <p className="text-2xl font-bold mt-1">
                          {entity.relationships?.length || 0}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {language === "ar" ? "التأكيدات" : "Assertions"}
                          </span>
                        </div>
                        <p className="text-2xl font-bold mt-1">
                          {entity.assertions?.length || 0}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {language === "ar" ? "المعرفات" : "External IDs"}
                          </span>
                        </div>
                        <p className="text-2xl font-bold mt-1">
                          {entity.externalIds?.length || 0}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Description */}
                  {entity.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{language === "ar" ? "الوصف" : "Description"}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          {language === "ar" && entity.descriptionAr 
                            ? entity.descriptionAr 
                            : entity.description}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Aliases */}
                  {entity.aliases && entity.aliases.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{language === "ar" ? "الأسماء البديلة" : "Also Known As"}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {entity.aliases.map((alias: any, i: number) => (
                            <Badge key={i} variant="outline">
                              {alias.alias}
                              {alias.language !== "en" && (
                                <span className="ml-1 text-xs opacity-60">({alias.language})</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* External Links */}
                  {entity.externalIds && entity.externalIds.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{language === "ar" ? "الروابط الخارجية" : "External Links"}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {entity.externalIds.map((ext: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                              <div>
                                <span className="font-medium">{ext.systemName}</span>
                                <span className="text-muted-foreground ml-2">#{ext.externalId}</span>
                              </div>
                              {ext.url && (
                                <a href={ext.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="sm">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              {/* Timeline Tab */}
              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{language === "ar" ? "الجدول الزمني" : "Timeline"}</span>
                      <Badge variant="outline">
                        {filteredTimeline.length} {language === "ar" ? "حدث" : "events"}
                        {filteredTimeline.length !== entity.timeline?.length && (
                          <span className="ml-1 opacity-60">
                            ({language === "ar" ? "مفلتر" : "filtered"})
                          </span>
                        )}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" 
                        ? `عرض الأحداث ذات الصلة بدور ${currentLens.nameAr}`
                        : `Showing events relevant to ${currentLens.nameEn} role`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredTimeline.length > 0 ? (
                      <div className="space-y-4">
                        {filteredTimeline.map((event: any, i: number) => {
                          const IconComponent = eventTypeIcons[event.eventType] || Info;
                          return (
                            <div key={i} className="flex gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="flex-shrink-0">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-medium">
                                    {language === "ar" && event.titleAr ? event.titleAr : event.titleEn}
                                  </h4>
                                  <Badge variant="outline" className="flex-shrink-0">
                                    {event.eventType}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {language === "ar" && event.descriptionAr 
                                    ? event.descriptionAr 
                                    : event.descriptionEn}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(event.eventDate).toLocaleDateString()}
                                  </span>
                                  {event.amount && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      {event.amount.toLocaleString()} {event.currency || "USD"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {language === "ar" 
                            ? "لا توجد أحداث مطابقة لهذا الدور"
                            : "No events matching this role filter"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Relationships Tab */}
              <TabsContent value="relationships">
                <Card>
                  <CardHeader>
                    <CardTitle>{language === "ar" ? "العلاقات" : "Relationships"}</CardTitle>
                    <CardDescription>
                      {language === "ar" 
                        ? "الروابط مع الجهات الأخرى"
                        : "Connections with other entities"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {entity.relationships && entity.relationships.length > 0 ? (
                      <div className="space-y-3">
                        {entity.relationships.map((rel: any, i: number) => (
                          <Link key={i} href={`/entities/${rel.targetEntityId}`}>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                <Network className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="font-medium">
                                    {language === "ar" && rel.targetNameAr 
                                      ? rel.targetNameAr 
                                      : rel.targetName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {rel.relationshipType?.replace(/_/g, " ")}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className={`h-5 w-5 text-muted-foreground ${isRTL ? "rotate-180" : ""}`} />
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {language === "ar" 
                            ? "لم يتم تسجيل علاقات بعد"
                            : "No relationships recorded yet"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Evidence Tab */}
              <TabsContent value="evidence">
                <Card>
                  <CardHeader>
                    <CardTitle>{language === "ar" ? "الأدلة والتأكيدات" : "Evidence & Assertions"}</CardTitle>
                    <CardDescription>
                      {language === "ar" 
                        ? "الحقائق الموثقة حول هذه الجهة"
                        : "Documented facts about this entity"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {entity.assertions && entity.assertions.length > 0 ? (
                      <div className="space-y-3">
                        {entity.assertions.map((assertion: any, i: number) => (
                          <div key={i} className="p-4 rounded-lg border">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                <div>
                                  <p className="font-medium">
                                    {language === "ar" && assertion.assertionTextAr 
                                      ? assertion.assertionTextAr 
                                      : assertion.assertionTextEn}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <Badge variant="outline">{assertion.assertionType}</Badge>
                                    <Badge variant={
                                      assertion.confidenceGrade === "A" ? "default" :
                                      assertion.confidenceGrade === "B" ? "secondary" : "outline"
                                    }>
                                      {language === "ar" ? "درجة" : "Grade"} {assertion.confidenceGrade}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {language === "ar" 
                            ? "لم يتم تسجيل تأكيدات بعد"
                            : "No assertions recorded yet"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
