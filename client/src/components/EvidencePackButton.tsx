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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  History
} from "lucide-react";
import { toast } from "sonner";

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
  variant?: "button" | "icon" | "link" | "badge" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
  showConfidence?: boolean;
  className?: string;
}

// Default mock data for when only an ID is provided
const getMockEvidenceData = (id: string): EvidencePackData => ({
  indicatorId: id,
  indicatorNameEn: "Loading...",
  indicatorNameAr: "جاري التحميل...",
  value: "-",
  unit: "",
  timestamp: new Date().toISOString(),
  confidence: "B",
  sources: [{
    id: "src-1",
    name: "YETO Platform",
    type: "official",
    date: new Date().toISOString(),
    quality: "B"
  }]
});

export default function EvidencePackButton({ 
  data: providedData, 
  evidencePackId,
  packId,
  variant = "button",
  size = "sm",
  showConfidence = true,
  className
}: EvidencePackButtonProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [isOpen, setIsOpen] = useState(false);
  
  // Use provided data or generate mock data from ID
  const data = providedData || getMockEvidenceData(evidencePackId || packId || "unknown");

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
    const citation = `${data.indicatorNameEn}: ${data.value} ${data.unit} (${new Date(data.timestamp).toLocaleDateString()}). Source: YETO Platform. Confidence: ${data.confidence}. Sources: ${data.sources.map(s => s.name).join(", ")}.`;
    navigator.clipboard.writeText(citation);
    toast.success(isArabic ? "تم نسخ الاقتباس" : "Citation copied to clipboard");
  };

  const renderTrigger = () => {
    switch (variant) {
      case "icon":
        return (
          <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${className || ''}`}>
            <FileText className="h-4 w-4 text-blue-500" />
          </Button>
        );
      case "ghost":
        return (
          <Button variant="ghost" size={size} className={`gap-1 ${className || ''}`}>
            <FileText className="h-4 w-4 text-blue-500" />
          </Button>
        );
      case "outline":
        return (
          <Button variant="outline" size={size} className={`gap-1 ${className || ''}`}>
            <FileText className="h-4 w-4" />
            {isArabic ? "أدلة" : "Evidence"}
          </Button>
        );
      case "link":
        return (
          <button className={`text-xs text-blue-500 hover:text-blue-700 underline flex items-center gap-1 ${className || ''}`}>
            <FileText className="h-3 w-3" />
            {isArabic ? "الأدلة" : "Evidence"}
          </button>
        );
      case "badge":
        return (
          <Badge variant="outline" className={`cursor-pointer hover:bg-blue-50 gap-1 ${className || ''}`}>
            <FileText className="h-3 w-3" />
            {isArabic ? "أدلة" : "Evidence"}
            {showConfidence && (
              <span className={`ml-1 px-1 rounded text-xs ${getConfidenceColor(data.confidence)}`}>
                {data.confidence}
              </span>
            )}
          </Badge>
        );
      default:
        return (
          <Button variant="outline" size={size} className={`gap-1 ${className || ''}`}>
            <FileText className="h-4 w-4" />
            {isArabic ? "كيف نعرف هذا؟" : "How do we know this?"}
            {showConfidence && (
              <Badge className={`ml-1 ${getConfidenceColor(data.confidence)}`}>
                {data.confidence}
              </Badge>
            )}
          </Button>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {renderTrigger()}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={isArabic ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            {isArabic ? "حزمة الأدلة" : "Evidence Pack"}
          </DialogTitle>
          <DialogDescription>
            {isArabic 
              ? "التحقق الكامل من البيانات والمصادر والمنهجية"
              : "Complete data verification, sources, and methodology"}
          </DialogDescription>
        </DialogHeader>

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
                {isArabic ? data.indicatorNameAr : data.indicatorNameEn}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#103050]">
                  {data.value}
                </span>
                <span className="text-gray-500">
                  {isArabic ? data.unitAr || data.unit : data.unit}
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
                  <Badge className={getConfidenceColor(data.confidence)}>
                    {data.confidence}
                  </Badge>
                  <span className="text-sm">{getConfidenceLabel(data.confidence)}</span>
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
                  {new Date(data.timestamp).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Regime */}
              {data.regime && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">
                    {isArabic ? "السلطة" : "Authority"}
                  </div>
                  <Badge variant="outline">
                    {data.regime === 'aden' 
                      ? (isArabic ? "عدن (IRG)" : "Aden (IRG)")
                      : data.regime === 'sanaa'
                      ? (isArabic ? "صنعاء (DFA)" : "Sana'a (DFA)")
                      : (isArabic ? "كلاهما" : "Both")}
                  </Badge>
                </div>
              )}

              {/* Geography */}
              {data.geography && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">
                    {isArabic ? "النطاق الجغرافي" : "Geography"}
                  </div>
                  <span className="text-sm font-medium">
                    {isArabic ? data.geographyAr || data.geography : data.geography}
                  </span>
                </div>
              )}
            </div>

            {/* Caveats */}
            {data.caveats && data.caveats.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    {isArabic ? "تحذيرات" : "Caveats"}
                  </span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {(isArabic ? data.caveatsAr || data.caveats : data.caveats).map((caveat, i) => (
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
                ? `${data.sources.length} مصادر تم التحقق منها`
                : `${data.sources.length} verified sources`}
            </div>
            {data.sources.map((source, index) => (
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
            {data.methodology ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  {isArabic ? "المنهجية" : "Methodology"}
                </h4>
                <p className="text-sm text-gray-600">
                  {isArabic ? data.methodologyAr || data.methodology : data.methodology}
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
            {data.vintages && data.vintages.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-500">
                  {isArabic ? "سجل التحديثات (ماذا كان معروفاً متى)" : "Update history (what was known when)"}
                </div>
                {data.vintages.map((vintage, index) => (
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
                {data.lastVerified && (
                  <div>
                    <span className="text-gray-500">{isArabic ? "آخر تحقق:" : "Last verified:"}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {new Date(data.lastVerified).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US')}
                    </div>
                  </div>
                )}
                {data.nextUpdate && (
                  <div>
                    <span className="text-gray-500">{isArabic ? "التحديث القادم:" : "Next update:"}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      {new Date(data.nextUpdate).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
