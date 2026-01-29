import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  ExternalLink,
  Calendar,
  MapPin,
  Shield,
  Clock,
  GitBranch,
  AlertCircle,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types for Evidence Pack
interface Citation {
  sourceId: number;
  title: string;
  publisher: string;
  url?: string;
  retrievalDate: string;
  licenseFlag: string;
  anchor?: string;
  rawObjectRef?: string;
}

interface Transform {
  formula?: string;
  parameters?: Record<string, unknown>;
  codeRef?: string;
  assumptions?: string[];
  description?: string;
}

interface Contradiction {
  altSourceId: number;
  altSourceName: string;
  altValue: string;
  ourValue: string;
  methodNotes?: string;
  whyDifferent?: string;
}

interface MissingRange {
  start: string;
  end: string;
  reason?: string;
}

type DQAFStatus = "pass" | "needs_review" | "unknown";
type ConfidenceGrade = "A" | "B" | "C" | "D";

interface EvidencePack {
  id: number;
  subjectType: string;
  subjectId: string;
  subjectLabel?: string;
  citations: Citation[];
  transforms?: Transform[];
  regimeTags: string[];
  geoScope: string;
  timeCoverageStart?: string;
  timeCoverageEnd?: string;
  missingRanges?: MissingRange[];
  contradictions?: Contradiction[];
  hasContradictions: boolean;
  dqafIntegrity: DQAFStatus;
  dqafMethodology: DQAFStatus;
  dqafAccuracyReliability: DQAFStatus;
  dqafServiceability: DQAFStatus;
  dqafAccessibility: DQAFStatus;
  uncertaintyInterval?: string;
  uncertaintyNote?: string;
  confidenceGrade: ConfidenceGrade;
  confidenceExplanation: string;
  whatWouldChange?: string[];
}

interface EvidenceDrawerProps {
  evidence: EvidencePack;
  trigger?: React.ReactNode;
  language?: "en" | "ar";
}

// Translations
const translations = {
  en: {
    showEvidence: "Show Evidence",
    evidenceFor: "Evidence for",
    sources: "Sources",
    quality: "Quality Assessment",
    provenance: "Provenance",
    contradictions: "Contradictions",
    citations: "Citations",
    transforms: "Transforms",
    coverage: "Coverage",
    confidence: "Confidence",
    dqafPanel: "DQAF Quality Panel",
    integrity: "Integrity",
    methodology: "Methodology",
    accuracy: "Accuracy & Reliability",
    serviceability: "Serviceability",
    accessibility: "Accessibility",
    pass: "Pass",
    needsReview: "Needs Review",
    unknown: "Unknown",
    gradeA: "Grade A - Highest Confidence",
    gradeB: "Grade B - Good Confidence",
    gradeC: "Grade C - Moderate Confidence",
    gradeD: "Grade D - Low Confidence",
    uncertainty: "Uncertainty",
    whatWouldChange: "What would change this assessment",
    regimeTags: "Regime Tags",
    geoScope: "Geographic Scope",
    timeCoverage: "Time Coverage",
    missingData: "Missing Data Ranges",
    retrievedOn: "Retrieved on",
    license: "License",
    formula: "Formula",
    assumptions: "Assumptions",
    multipleSourcesDisagree: "Multiple sources disagree",
    ourValue: "Our Value",
    altValue: "Alternative Value",
    whyDifferent: "Why they differ",
    source: "Source",
    noContradictions: "No contradictions detected",
    noTransforms: "No transformations applied - raw data",
  },
  ar: {
    showEvidence: "عرض الأدلة",
    evidenceFor: "الأدلة لـ",
    sources: "المصادر",
    quality: "تقييم الجودة",
    provenance: "المصدر",
    contradictions: "التناقضات",
    citations: "الاستشهادات",
    transforms: "التحويلات",
    coverage: "التغطية",
    confidence: "الثقة",
    dqafPanel: "لوحة جودة DQAF",
    integrity: "النزاهة",
    methodology: "المنهجية",
    accuracy: "الدقة والموثوقية",
    serviceability: "قابلية الخدمة",
    accessibility: "إمكانية الوصول",
    pass: "ناجح",
    needsReview: "يحتاج مراجعة",
    unknown: "غير معروف",
    gradeA: "الدرجة أ - أعلى ثقة",
    gradeB: "الدرجة ب - ثقة جيدة",
    gradeC: "الدرجة ج - ثقة متوسطة",
    gradeD: "الدرجة د - ثقة منخفضة",
    uncertainty: "عدم اليقين",
    whatWouldChange: "ما الذي سيغير هذا التقييم",
    regimeTags: "علامات النظام",
    geoScope: "النطاق الجغرافي",
    timeCoverage: "التغطية الزمنية",
    missingData: "نطاقات البيانات المفقودة",
    retrievedOn: "تم استرجاعه في",
    license: "الترخيص",
    formula: "الصيغة",
    assumptions: "الافتراضات",
    multipleSourcesDisagree: "مصادر متعددة تختلف",
    ourValue: "قيمتنا",
    altValue: "القيمة البديلة",
    whyDifferent: "لماذا تختلف",
    source: "المصدر",
    noContradictions: "لم يتم اكتشاف تناقضات",
    noTransforms: "لم يتم تطبيق تحويلات - بيانات خام",
  },
};

// Helper components
function DQAFStatusBadge({ status, label }: { status: DQAFStatus; label: string }) {
  const config = {
    pass: { icon: CheckCircle, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    needs_review: { icon: AlertTriangle, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
    unknown: { icon: HelpCircle, className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  };
  
  const Icon = config[status].icon;
  
  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg", config[status].className)}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function ConfidenceBadge({ grade, t }: { grade: ConfidenceGrade; t: typeof translations.en }) {
  const config = {
    A: { label: t.gradeA, className: "bg-green-500 text-white" },
    B: { label: t.gradeB, className: "bg-blue-500 text-white" },
    C: { label: t.gradeC, className: "bg-yellow-500 text-white" },
    D: { label: t.gradeD, className: "bg-red-500 text-white" },
  };
  
  return (
    <Badge className={cn("text-lg px-4 py-2", config[grade].className)}>
      {config[grade].label}
    </Badge>
  );
}

export function EvidenceDrawer({ evidence, trigger, language = "en" }: EvidenceDrawerProps) {
  const [open, setOpen] = useState(false);
  const t = translations[language];
  const isRTL = language === "ar";
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const getDQAFStatusLabel = (status: DQAFStatus) => {
    switch (status) {
      case "pass": return t.pass;
      case "needs_review": return t.needsReview;
      case "unknown": return t.unknown;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            {t.showEvidence}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent 
        side={isRTL ? "left" : "right"} 
        className={cn(
          "w-full sm:max-w-xl overflow-y-auto",
          isRTL && "text-right"
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <SheetHeader className="mb-6">
          <SheetTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Shield className="h-5 w-5 text-primary" />
            {t.evidenceFor}: {evidence.subjectLabel || evidence.subjectId}
          </SheetTitle>
          
          {/* Contradiction Warning */}
          {evidence.hasContradictions && (
            <div className={cn(
              "flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg mt-4",
              isRTL && "flex-row-reverse"
            )}>
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span className="text-amber-800 dark:text-amber-200 font-medium">
                {t.multipleSourcesDisagree}
              </span>
            </div>
          )}
        </SheetHeader>

        <Tabs defaultValue="sources" className="w-full">
          <TabsList className={cn("grid w-full grid-cols-4", isRTL && "direction-rtl")}>
            <TabsTrigger value="sources">{t.sources}</TabsTrigger>
            <TabsTrigger value="quality">{t.quality}</TabsTrigger>
            <TabsTrigger value="provenance">{t.provenance}</TabsTrigger>
            <TabsTrigger value="contradictions">
              {t.contradictions}
              {evidence.hasContradictions && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full">!</span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-4 mt-4">
            {/* Confidence Grade */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Shield className="h-4 w-4" />
                  {t.confidence}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ConfidenceBadge grade={evidence.confidenceGrade} t={t} />
                <p className="text-sm text-muted-foreground">{evidence.confidenceExplanation}</p>
                
                {evidence.uncertaintyInterval && (
                  <div className={cn("flex items-center gap-2 text-sm", isRTL && "flex-row-reverse")}>
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span>{t.uncertainty}: {evidence.uncertaintyInterval}</span>
                  </div>
                )}
                
                {evidence.uncertaintyNote && (
                  <p className="text-xs text-muted-foreground italic">{evidence.uncertaintyNote}</p>
                )}
              </CardContent>
            </Card>

            {/* Citations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <FileText className="h-4 w-4" />
                  {t.citations} ({evidence.citations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {evidence.citations.map((citation, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className={cn("flex items-start justify-between gap-2", isRTL && "flex-row-reverse")}>
                      <div>
                        <p className="font-medium text-sm">{citation.title}</p>
                        <p className="text-xs text-muted-foreground">{citation.publisher}</p>
                      </div>
                      {citation.url && (
                        <a 
                          href={citation.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <div className={cn("flex flex-wrap gap-2 text-xs", isRTL && "flex-row-reverse")}>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {t.retrievedOn}: {formatDate(citation.retrievalDate)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {t.license}: {citation.licenseFlag}
                      </Badge>
                    </div>
                    {citation.anchor && (
                      <p className="text-xs text-muted-foreground">
                        Anchor: {citation.anchor}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Coverage */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <MapPin className="h-4 w-4" />
                  {t.coverage}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t.geoScope}: {evidence.geoScope}</span>
                </div>
                
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t.timeCoverage}: {formatDate(evidence.timeCoverageStart)} - {formatDate(evidence.timeCoverageEnd)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {evidence.regimeTags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
                
                {evidence.missingRanges && evidence.missingRanges.length > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                      {t.missingData}:
                    </p>
                    {evidence.missingRanges.map((range, idx) => (
                      <p key={idx} className="text-xs text-amber-700 dark:text-amber-300">
                        {formatDate(range.start)} - {formatDate(range.end)}
                        {range.reason && ` (${range.reason})`}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality Tab - DQAF Panel */}
          <TabsContent value="quality" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Shield className="h-4 w-4" />
                  {t.dqafPanel}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground mb-4">
                  IMF Data Quality Assessment Framework - 5 Dimensions
                </p>
                
                <div className="space-y-2">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <span className="text-sm font-medium">{t.integrity}</span>
                    <DQAFStatusBadge status={evidence.dqafIntegrity} label={getDQAFStatusLabel(evidence.dqafIntegrity)} />
                  </div>
                  
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <span className="text-sm font-medium">{t.methodology}</span>
                    <DQAFStatusBadge status={evidence.dqafMethodology} label={getDQAFStatusLabel(evidence.dqafMethodology)} />
                  </div>
                  
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <span className="text-sm font-medium">{t.accuracy}</span>
                    <DQAFStatusBadge status={evidence.dqafAccuracyReliability} label={getDQAFStatusLabel(evidence.dqafAccuracyReliability)} />
                  </div>
                  
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <span className="text-sm font-medium">{t.serviceability}</span>
                    <DQAFStatusBadge status={evidence.dqafServiceability} label={getDQAFStatusLabel(evidence.dqafServiceability)} />
                  </div>
                  
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <span className="text-sm font-medium">{t.accessibility}</span>
                    <DQAFStatusBadge status={evidence.dqafAccessibility} label={getDQAFStatusLabel(evidence.dqafAccessibility)} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* What Would Change */}
            {evidence.whatWouldChange && evidence.whatWouldChange.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className={cn("text-sm flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <GitBranch className="h-4 w-4" />
                    {t.whatWouldChange}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {evidence.whatWouldChange.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Provenance Tab */}
          <TabsContent value="provenance" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <GitBranch className="h-4 w-4" />
                  {t.transforms}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {evidence.transforms && evidence.transforms.length > 0 ? (
                  <div className="space-y-3">
                    {evidence.transforms.map((transform, idx) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        {transform.description && (
                          <p className="text-sm">{transform.description}</p>
                        )}
                        {transform.formula && (
                          <div className="p-2 bg-background rounded font-mono text-xs">
                            {t.formula}: {transform.formula}
                          </div>
                        )}
                        {transform.assumptions && transform.assumptions.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">{t.assumptions}:</p>
                            <ul className="list-disc list-inside text-xs text-muted-foreground">
                              {transform.assumptions.map((assumption, i) => (
                                <li key={i}>{assumption}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t.noTransforms}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contradictions Tab */}
          <TabsContent value="contradictions" className="space-y-4 mt-4">
            {evidence.contradictions && evidence.contradictions.length > 0 ? (
              evidence.contradictions.map((contradiction, idx) => (
                <Card key={idx} className="border-amber-200 dark:border-amber-800">
                  <CardHeader className="pb-2 bg-amber-50 dark:bg-amber-950 rounded-t-lg">
                    <CardTitle className={cn("text-sm flex items-center gap-2 text-amber-800 dark:text-amber-200", isRTL && "flex-row-reverse")}>
                      <AlertTriangle className="h-4 w-4" />
                      {t.source}: {contradiction.altSourceName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">{t.ourValue}</p>
                        <p className="font-mono font-bold text-green-800 dark:text-green-200">
                          {contradiction.ourValue}
                        </p>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">{t.altValue}</p>
                        <p className="font-mono font-bold text-amber-800 dark:text-amber-200">
                          {contradiction.altValue}
                        </p>
                      </div>
                    </div>
                    
                    {contradiction.whyDifferent && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs font-medium mb-1">{t.whyDifferent}:</p>
                        <p className="text-sm text-muted-foreground">{contradiction.whyDifferent}</p>
                      </div>
                    )}
                    
                    {contradiction.methodNotes && (
                      <p className="text-xs text-muted-foreground italic">{contradiction.methodNotes}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-muted-foreground">{t.noContradictions}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Compact button variant for inline use in KPIs/tables
export function EvidenceButton({ 
  evidencePackId, 
  onClick,
  language = "en",
  size = "sm"
}: { 
  evidencePackId: number; 
  onClick?: () => void;
  language?: "en" | "ar";
  size?: "sm" | "xs";
}) {
  const t = translations[language];
  
  return (
    <Button 
      variant="ghost" 
      size={size === "xs" ? "sm" : "sm"}
      className={cn(
        "gap-1 text-muted-foreground hover:text-primary",
        size === "xs" && "h-6 px-2 text-xs"
      )}
      onClick={onClick}
    >
      <FileText className={cn("h-3 w-3", size === "xs" && "h-2.5 w-2.5")} />
      <span className="sr-only">{t.showEvidence}</span>
    </Button>
  );
}

export default EvidenceDrawer;
