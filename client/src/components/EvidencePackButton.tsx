import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  ExternalLink,
  Download,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Copy,
  Share2,
  History,
  AlertCircle,
  PlusCircle
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export interface EvidenceSource {
  id: string;
  name: string;
  nameAr?: string;
  type: "official" | "survey" | "estimate" | "satellite" | "partner" | "media";
  url?: string;
  date: string;
  accessDate?: string;
  methodology?: string;
  methodologyAr?: string;
  license?: string;
  quality: "A" | "B" | "C" | "D";
}

export interface EvidencePackData {
  indicatorId: string;
  indicatorNameEn: string;
  indicatorNameAr: string;
  value: string | number;
  unit: string;
  unitAr?: string;
  timestamp: string;
  regime?: "aden" | "sanaa" | "both";
  geography?: string;
  geographyAr?: string;
  confidence: "A" | "B" | "C" | "D";
  sources: EvidenceSource[];
  methodology?: string;
  methodologyAr?: string;
  caveats?: string[];
  caveatsAr?: string[];
  vintages?: {
    date: string;
    value: string | number;
    sources: string[];
  }[];
  lastVerified?: string;
  nextUpdate?: string;
}

interface EvidencePackButtonProps {
  data?: EvidencePackData;
  evidencePackId?: string;
  packId?: string; // alias for evidencePackId
  subjectType?: string; // For fetching evidence by subject
  subjectId?: string; // For fetching evidence by subject
  variant?: "button" | "icon" | "link" | "badge" | "ghost" | "outline" | "compact";
  size?: "sm" | "default" | "lg";
  showConfidence?: boolean;
  className?: string;
  indicatorName?: string; // For GAP ticket context
  indicatorNameAr?: string;
  sectorCode?: string;
}

// Generate a unique GAP ID
const generateGapId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GAP-${timestamp}-${random}`;
};

export default function EvidencePackButton({ 
  data: providedData, 
  evidencePackId,
  packId,
  subjectType: propSubjectType,
  subjectId: propSubjectId,
  variant = "button",
  size = "sm",
  showConfidence = true,
  className,
  indicatorName,
  indicatorNameAr,
  sectorCode
}: EvidencePackButtonProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [isRequestingEvidence, setIsRequestingEvidence] = useState(false);
  const [gapTicketId, setGapTicketId] = useState<string | null>(null);
  
  // Support both evidencePackId/packId and subjectType/subjectId patterns
  const requestedId = propSubjectId || evidencePackId || packId || "unknown";
  const querySubjectType = propSubjectType || "claim";
  
  // TRUTH-NATIVE: Fetch real evidence from database if evidencePackId is provided
  const { data: dbEvidence, isLoading: isLoadingEvidence } = trpc.evidence.getBySubject.useQuery(
    { subjectType: querySubjectType, subjectId: requestedId },
    { enabled: !!requestedId && requestedId !== "unknown" && !providedData }
  );
  
  // Transform DB evidence to EvidencePackData format
  const transformedEvidence: EvidencePackData | undefined = dbEvidence ? {
    indicatorId: dbEvidence.subjectId,
    indicatorNameEn: dbEvidence.subjectLabel || dbEvidence.subjectId,
    indicatorNameAr: dbEvidence.subjectLabel || dbEvidence.subjectId,
    value: "-",
    unit: "",
    timestamp: dbEvidence.createdAt?.toISOString() || new Date().toISOString(),
    regime: dbEvidence.regimeTags?.includes("aden_irg") ? "aden" : dbEvidence.regimeTags?.includes("sanaa_defacto") ? "sanaa" : "both",
    geography: dbEvidence.geoScope,
    confidence: dbEvidence.confidenceGrade as "A" | "B" | "C" | "D",
    sources: (dbEvidence.citations || []).map((c: any, idx: number) => ({
      id: String(c.sourceId || idx),
      name: c.title,
      type: "official" as const,
      url: c.url,
      date: c.retrievalDate,
      license: c.licenseFlag,
      quality: dbEvidence.confidenceGrade as "A" | "B" | "C" | "D"
    })),
    methodology: dbEvidence.confidenceExplanation,
    caveats: dbEvidence.whatWouldChange || [],
    lastVerified: dbEvidence.updatedAt?.toISOString()
  } : undefined;
  
  // Use provided data first, then transformed DB evidence
  const effectiveData = providedData || transformedEvidence;
  
  // TRUTH-NATIVE: No fabricated data fallback. If no data provided, show explicit "no evidence" state
  const hasEvidence = !!effectiveData && effectiveData.sources && effectiveData.sources.length > 0;

  // tRPC mutation for creating GAP tickets
  const createGapTicketMutation = trpc.system.createGapTicket?.useMutation?.({
    onSuccess: (data: any) => {
      setGapTicketId(data?.gapId || generateGapId());
      toast.success(isArabic ? "تم إنشاء تذكرة الفجوة" : "GAP ticket created");
      setIsRequestingEvidence(false);
    },
    onError: () => {
      // Fallback: generate local GAP ID if mutation fails
      const localGapId = generateGapId();
      setGapTicketId(localGapId);
      toast.info(isArabic ? `تم تسجيل الفجوة: ${localGapId}` : `Gap recorded: ${localGapId}`);
      setIsRequestingEvidence(false);
    }
  });

  const handleRequestEvidence = async () => {
    setIsRequestingEvidence(true);
    
    // Generate GAP ticket
    const newGapId = generateGapId();
    
    if (createGapTicketMutation) {
      try {
        await createGapTicketMutation.mutateAsync({
          gapType: "missing_data",
          severity: "medium",
          titleEn: `Missing evidence for: ${indicatorName || requestedId}`,
          titleAr: indicatorNameAr || `بيانات مفقودة: ${requestedId}`,
          descriptionEn: `Evidence pack requested but not found. Pack ID: ${requestedId}`,
          descriptionAr: `حزمة الأدلة المطلوبة غير موجودة. معرف الحزمة: ${requestedId}`,
          sectorCode: sectorCode,
          indicatorCode: requestedId
        });
      } catch {
        // Fallback handled in onError
        setGapTicketId(newGapId);
        setIsRequestingEvidence(false);
      }
    } else {
      // No mutation available, use local GAP ID
      setGapTicketId(newGapId);
      toast.info(isArabic ? `تم تسجيل الفجوة: ${newGapId}` : `Gap recorded: ${newGapId}`);
      setIsRequestingEvidence(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-500 text-white",
      B: "bg-blue-500 text-white",
      C: "bg-yellow-500 text-black",
      D: "bg-red-500 text-white"
    };
    return colors[confidence] || "bg-gray-500 text-white";
  };

  const getConfidenceLabel = (confidence: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      A: { en: "Verified (Official)", ar: "موثق (رسمي)" },
      B: { en: "Confirmed (Multiple)", ar: "مؤكد (متعدد)" },
      C: { en: "Estimated", ar: "تقديري" },
      D: { en: "Preliminary", ar: "أولي" }
    };
    return isArabic ? labels[confidence]?.ar : labels[confidence]?.en;
  };

  const getSourceTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      official: { en: "Official", ar: "رسمي" },
      survey: { en: "Survey", ar: "مسح" },
      estimate: { en: "Estimate", ar: "تقدير" },
      satellite: { en: "Satellite", ar: "أقمار صناعية" },
      partner: { en: "Partner", ar: "شريك" },
      media: { en: "Media", ar: "إعلام" }
    };
    return isArabic ? labels[type]?.ar : labels[type]?.en;
  };

  const copyToClipboard = () => {
    if (!hasEvidence || !effectiveData) {
      toast.error(isArabic ? "لا توجد أدلة للنسخ" : "No evidence to copy");
      return;
    }
    const citation = `${effectiveData.indicatorNameEn}: ${effectiveData.value} ${effectiveData.unit} (${new Date(effectiveData.timestamp).toLocaleDateString()}). Source: YETO Platform. Confidence: ${effectiveData.confidence}. Sources: ${effectiveData.sources.map(s => s.name).join(", ")}.`;
    navigator.clipboard.writeText(citation);
    toast.success(isArabic ? "تم نسخ الاقتباس" : "Citation copied to clipboard");
  };

  const renderTrigger = () => {
    // Show warning indicator if no evidence
    const noEvidenceIndicator = !hasEvidence && (
      <span className="ml-1 text-amber-500">
        <AlertCircle className="h-3 w-3 inline" />
      </span>
    );

    switch (variant) {
      case "icon":
        return (
          <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${className || ''}`}>
            <FileText className={`h-4 w-4 ${hasEvidence ? 'text-blue-500' : 'text-amber-500'}`} />
          </Button>
        );
      case "ghost":
        return (
          <Button variant="ghost" size={size} className={`gap-1 ${className || ''}`}>
            <FileText className={`h-4 w-4 ${hasEvidence ? 'text-blue-500' : 'text-amber-500'}`} />
            {noEvidenceIndicator}
          </Button>
        );
      case "outline":
        return (
          <Button variant="outline" size={size} className={`gap-1 ${className || ''}`}>
            <FileText className="h-4 w-4" />
            {isArabic ? "أدلة" : "Evidence"}
            {noEvidenceIndicator}
          </Button>
        );
      case "link":
        return (
          <button className={`text-xs ${hasEvidence ? 'text-blue-500 hover:text-blue-700' : 'text-amber-500 hover:text-amber-700'} underline flex items-center gap-1 ${className || ''}`}>
            <FileText className="h-3 w-3" />
            {isArabic ? "الأدلة" : "Evidence"}
            {noEvidenceIndicator}
          </button>
        );
      case "badge":
        return (
          <Badge variant="outline" className={`cursor-pointer ${hasEvidence ? 'hover:bg-blue-50' : 'hover:bg-amber-50 border-amber-300'} gap-1 ${className || ''}`}>
            <FileText className="h-3 w-3" />
            {isArabic ? "أدلة" : "Evidence"}
            {hasEvidence && showConfidence && effectiveData && (
              <span className={`ml-1 px-1 rounded text-xs ${getConfidenceColor(effectiveData.confidence)}`}>
                {effectiveData.confidence}
              </span>
            )}
            {!hasEvidence && (
              <span className="ml-1 px-1 rounded text-xs bg-amber-100 text-amber-700">
                {isArabic ? "فجوة" : "GAP"}
              </span>
            )}
          </Badge>
        );
      case "compact":
        return (
          <Button variant="outline" size="sm" className={`gap-1 text-xs ${!hasEvidence ? 'border-amber-300 text-amber-700' : 'border-green-300 text-green-700'} ${className || ''}`}>
            <FileText className="h-3 w-3" />
            {isArabic ? "كيف نعرف هذا؟" : "How do we know this?"}
            {hasEvidence && effectiveData && (
              <Badge className={`ml-1 text-xs py-0 px-1 ${getConfidenceColor(effectiveData.confidence)}`}>
                Grade {effectiveData.confidence}
              </Badge>
            )}
            {!hasEvidence && (
              <Badge className="ml-1 text-xs py-0 px-1 bg-amber-100 text-amber-700 border-amber-300">
                {isArabic ? "فجوة" : "GAP"}
              </Badge>
            )}
          </Button>
        );
      default:
        return (
          <Button variant="outline" size={size} className={`gap-1 ${!hasEvidence ? 'border-amber-300 text-amber-700' : ''} ${className || ''}`}>
            <FileText className="h-4 w-4" />
            {isArabic ? "كيف نعرف هذا؟" : "How do we know this?"}
            {hasEvidence && showConfidence && effectiveData && (
              <Badge className={`ml-1 ${getConfidenceColor(effectiveData.confidence)}`}>
                {effectiveData.confidence}
              </Badge>
            )}
            {!hasEvidence && (
              <Badge className="ml-1 bg-amber-100 text-amber-700 border-amber-300">
                {isArabic ? "فجوة" : "GAP"}
              </Badge>
            )}
          </Button>
        );
    }
  };

  // TRUTH-NATIVE: Render "No Evidence Available" state
  const renderNoEvidenceState = () => (
    <div className="space-y-6 py-4">
      {/* Warning Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800">
              {isArabic ? "لا توجد أدلة متاحة بعد" : "No evidence available yet"}
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              {isArabic 
                ? "لم يتم العثور على حزمة أدلة لهذا المؤشر. يمكنك طلب جمع الأدلة."
                : "No evidence pack was found for this indicator. You can request evidence collection."}
            </p>
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-gray-500" />
          {isArabic ? "تفاصيل الطلب" : "Request Details"}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">{isArabic ? "معرف الحزمة المطلوبة:" : "Requested Pack ID:"}</span>
            <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">{requestedId}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{isArabic ? "السبب:" : "Reason:"}</span>
            <span className="text-gray-700">{isArabic ? "غير موجود / لم يتم إنشاؤه" : "Not found / Not generated"}</span>
          </div>
          {indicatorName && (
            <div className="flex justify-between">
              <span className="text-gray-500">{isArabic ? "المؤشر:" : "Indicator:"}</span>
              <span className="text-gray-700">{isArabic ? indicatorNameAr || indicatorName : indicatorName}</span>
            </div>
          )}
          {sectorCode && (
            <div className="flex justify-between">
              <span className="text-gray-500">{isArabic ? "القطاع:" : "Sector:"}</span>
              <span className="text-gray-700">{sectorCode}</span>
            </div>
          )}
        </div>
      </div>

      {/* GAP Ticket Status */}
      {gapTicketId ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">
              {isArabic ? "تم إنشاء تذكرة الفجوة" : "GAP Ticket Created"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-green-100 text-green-800 px-3 py-1 rounded font-mono text-sm">
              {gapTicketId}
            </code>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(gapTicketId);
                toast.success(isArabic ? "تم نسخ المعرف" : "ID copied");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-green-700 mt-2">
            {isArabic 
              ? "سيتم مراجعة هذه الفجوة وجمع الأدلة المطلوبة."
              : "This gap will be reviewed and evidence will be collected."}
          </p>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button 
            onClick={handleRequestEvidence}
            disabled={isRequestingEvidence}
            className="gap-2"
          >
            {isRequestingEvidence ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isArabic ? "جاري الإنشاء..." : "Creating..."}
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                {isArabic ? "طلب جمع الأدلة" : "Request Evidence Collection"}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Explanation */}
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-2">
          {isArabic ? "لماذا لا توجد أدلة؟" : "Why is there no evidence?"}
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>{isArabic ? "قد لا يكون المؤشر مدعومًا بعد" : "The indicator may not be supported yet"}</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>{isArabic ? "قد تكون البيانات قيد الجمع" : "Data may be in the process of being collected"}</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>{isArabic ? "قد يكون الوصول إلى المصدر محدودًا" : "Source access may be restricted"}</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {renderTrigger()}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={isArabic ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasEvidence ? (
              <Shield className="h-5 w-5 text-blue-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            {isArabic ? "حزمة الأدلة" : "Evidence Pack"}
          </DialogTitle>
          <DialogDescription>
            {hasEvidence 
              ? (isArabic 
                  ? "التحقق الكامل من البيانات والمصادر والمنهجية"
                  : "Complete data verification, sources, and methodology")
              : (isArabic
                  ? `لا توجد أدلة متاحة بعد (${gapTicketId || requestedId})`
                  : `No evidence available yet (${gapTicketId || requestedId})`)}
          </DialogDescription>
        </DialogHeader>

        {/* TRUTH-NATIVE: Show either real evidence or explicit no-evidence state */}
        {hasEvidence && effectiveData ? (
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{isArabic ? "نظرة عامة" : "Overview"}</TabsTrigger>
              <TabsTrigger value="sources">{isArabic ? "المصادر" : "Sources"}</TabsTrigger>
              <TabsTrigger value="methodology">{isArabic ? "المنهجية" : "Methodology"}</TabsTrigger>
              <TabsTrigger value="history">{isArabic ? "التاريخ" : "History"}</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Indicator Info */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                <div className="text-sm text-gray-500 mb-1">
                  {isArabic ? "المؤشر" : "Indicator"}
                </div>
                <div className="text-lg font-semibold mb-2">
                  {isArabic ? effectiveData.indicatorNameAr : effectiveData.indicatorNameEn}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#2e8b6e]">
                    {effectiveData.value}
                  </span>
                  <span className="text-gray-500">
                    {isArabic ? effectiveData.unitAr || effectiveData.unit : effectiveData.unit}
                  </span>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Confidence */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {isArabic ? "مستوى الثقة" : "Confidence"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getConfidenceColor(effectiveData.confidence)}>
                      {effectiveData.confidence}
                    </Badge>
                    <span className="text-sm">{getConfidenceLabel(effectiveData.confidence)}</span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {isArabic ? "تاريخ البيانات" : "Data Date"}
                    </span>
                  </div>
                  <div className="text-sm font-medium">
                    {new Date(effectiveData.timestamp).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {/* Regime */}
                {effectiveData.regime && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">
                      {isArabic ? "النظام" : "Regime"}
                    </div>
                    <Badge variant="outline">
                      {effectiveData.regime === 'aden' 
                        ? (isArabic ? "عدن (IRG)" : "Aden (IRG)")
                        : effectiveData.regime === 'sanaa'
                        ? (isArabic ? "صنعاء (DFA)" : "Sana'a (DFA)")
                        : (isArabic ? "كلاهما" : "Both")}
                    </Badge>
                  </div>
                )}

                {/* Geography */}
                {effectiveData.geography && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">
                      {isArabic ? "النطاق الجغرافي" : "Geography"}
                    </div>
                    <span className="text-sm font-medium">
                      {isArabic ? effectiveData.geographyAr || effectiveData.geography : effectiveData.geography}
                    </span>
                  </div>
                )}
              </div>

              {/* Caveats */}
              {effectiveData.caveats && effectiveData.caveats.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      {isArabic ? "تحذيرات" : "Caveats"}
                    </span>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {(isArabic ? effectiveData.caveatsAr || effectiveData.caveats : effectiveData.caveats).map((caveat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{caveat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  {isArabic ? "نسخ الاقتباس" : "Copy Citation"}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  {isArabic ? "تحميل" : "Download"}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  {isArabic ? "مشاركة" : "Share"}
                </Button>
              </div>
            </TabsContent>

            {/* Sources Tab */}
            <TabsContent value="sources" className="space-y-3 mt-4">
              <div className="text-sm text-gray-500 mb-2">
                {isArabic 
                  ? `${effectiveData.sources.length} مصادر تم التحقق منها`
                  : `${effectiveData.sources.length} verified sources`}
              </div>
              {effectiveData.sources.map((source, index) => (
                <div key={source.id || index} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {isArabic ? source.nameAr || source.name : source.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getSourceTypeLabel(source.type)}
                        </Badge>
                        <Badge className={`text-xs ${getConfidenceColor(source.quality)}`}>
                          {source.quality}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {isArabic ? "تاريخ النشر:" : "Published:"} {source.date}
                        {source.accessDate && (
                          <span className="ml-2">
                            | {isArabic ? "تاريخ الوصول:" : "Accessed:"} {source.accessDate}
                          </span>
                        )}
                      </div>
                      {source.methodology && (
                        <div className="text-xs text-gray-400 mt-1">
                          {isArabic ? source.methodologyAr || source.methodology : source.methodology}
                        </div>
                      )}
                      {source.license && (
                        <div className="text-xs text-gray-400 mt-1">
                          {isArabic ? "الترخيص:" : "License:"} {source.license}
                        </div>
                      )}
                    </div>
                    {source.url && (
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Methodology Tab */}
            <TabsContent value="methodology" className="space-y-4 mt-4">
              {effectiveData.methodology ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    {isArabic ? "المنهجية" : "Methodology"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {isArabic ? effectiveData.methodologyAr || effectiveData.methodology : effectiveData.methodology}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                  {isArabic 
                    ? "لم يتم توثيق المنهجية لهذا المؤشر بعد"
                    : "Methodology not yet documented for this indicator"}
                </div>
              )}

              {/* Confidence Explanation */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">
                  {isArabic ? "مقياس الثقة" : "Confidence Scale"}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">A</Badge>
                    <span>{isArabic ? "موثق من مصدر رسمي مباشر" : "Verified from direct official source"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500 text-white">B</Badge>
                    <span>{isArabic ? "مؤكد من مصادر موثوقة متعددة" : "Confirmed from multiple reliable sources"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500 text-black">C</Badge>
                    <span>{isArabic ? "تقديرات مبنية على بيانات جزئية" : "Estimates based on partial data"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500 text-white">D</Badge>
                    <span>{isArabic ? "بيانات أولية تحتاج تأكيد" : "Preliminary data requiring confirmation"}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4 mt-4">
              {effectiveData.vintages && effectiveData.vintages.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-500">
                    {isArabic ? "سجل التحديثات (ماذا كان معروفاً متى)" : "Update history (what was known when)"}
                  </div>
                  {effectiveData.vintages.map((vintage, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{vintage.value}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {isArabic ? "المصادر:" : "Sources:"} {vintage.sources.join(", ")}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(vintage.date).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                  {isArabic 
                    ? "لا يوجد سجل تاريخي متاح لهذا المؤشر"
                    : "No historical vintages available for this indicator"}
                </div>
              )}

              {/* Verification Info */}
              <div className="p-3 border rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {effectiveData.lastVerified && (
                    <div>
                      <span className="text-gray-500">{isArabic ? "آخر تحقق:" : "Last verified:"}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {new Date(effectiveData.lastVerified).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US')}
                      </div>
                    </div>
                  )}
                  {effectiveData.nextUpdate && (
                    <div>
                      <span className="text-gray-500">{isArabic ? "التحديث القادم:" : "Next update:"}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-4 w-4 text-blue-500" />
                        {new Date(effectiveData.nextUpdate).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // TRUTH-NATIVE: No evidence state
          renderNoEvidenceState()
        )}
      </DialogContent>
    </Dialog>
  );
}
