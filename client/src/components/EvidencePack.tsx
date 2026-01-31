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
import { 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  Info,
  Database,
  Shield,
  Link2
} from "lucide-react";

export interface Source {
  id: string;
  titleEn: string;
  titleAr: string;
  type: "primary" | "secondary" | "official" | "estimate";
  organization?: string;
  date?: string;
  url?: string;
  confidence: "high" | "medium" | "low";
}

export interface EvidencePackProps {
  indicatorName: string;
  indicatorNameAr?: string;
  value: string | number;
  unit?: string;
  date: string;
  regime?: "aden" | "sanaa" | "both";
  sources: Source[];
  methodology?: string;
  methodologyAr?: string;
  lastUpdated: string;
  confidence: "high" | "medium" | "low";
  variant?: "button" | "icon" | "inline";
  className?: string;
}

export function EvidencePack({
  indicatorName,
  indicatorNameAr,
  value,
  unit,
  date,
  regime,
  sources,
  methodology,
  methodologyAr,
  lastUpdated,
  confidence,
  variant = "button",
  className = "",
}: EvidencePackProps) {
  const { language } = useLanguage();

  const confidenceConfig = {
    high: {
      labelEn: "High Confidence",
      labelAr: "ثقة عالية",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle2,
    },
    medium: {
      labelEn: "Medium Confidence",
      labelAr: "ثقة متوسطة",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: AlertTriangle,
    },
    low: {
      labelEn: "Low Confidence",
      labelAr: "ثقة منخفضة",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: AlertTriangle,
    },
  };

  const sourceTypeLabels = {
    primary: { en: "Primary Source", ar: "مصدر أولي" },
    secondary: { en: "Secondary Source", ar: "مصدر ثانوي" },
    official: { en: "Official Source", ar: "مصدر رسمي" },
    estimate: { en: "Estimate", ar: "تقدير" },
  };

  const regimeLabels = {
    aden: { en: "Aden Regime", ar: "نظام عدن" },
    sanaa: { en: "Sana'a Regime", ar: "نظام صنعاء" },
    both: { en: "Both Regimes", ar: "كلا النظامين" },
  };

  const ConfidenceIcon = confidenceConfig[confidence].icon;

  const EvidenceContent = () => (
    <div className="space-y-6">
      {/* Data Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[#2e6b4f] dark:text-white">
            {language === "ar" ? indicatorNameAr || indicatorName : indicatorName}
          </h4>
          <Badge className={confidenceConfig[confidence].color}>
            <ConfidenceIcon className="h-3 w-3 mr-1" />
            {language === "ar" 
              ? confidenceConfig[confidence].labelAr 
              : confidenceConfig[confidence].labelEn}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{language === "ar" ? "القيمة:" : "Value:"}</span>
            <span className="font-medium ml-2">{value} {unit}</span>
          </div>
          <div>
            <span className="text-gray-500">{language === "ar" ? "التاريخ:" : "Date:"}</span>
            <span className="font-medium ml-2">{date}</span>
          </div>
          {regime && (
            <div>
              <span className="text-gray-500">{language === "ar" ? "النظام:" : "Regime:"}</span>
              <span className="font-medium ml-2">
                {language === "ar" ? regimeLabels[regime].ar : regimeLabels[regime].en}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-500">{language === "ar" ? "آخر تحديث:" : "Last Updated:"}</span>
            <span className="font-medium ml-2">{lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Sources */}
      <div>
        <h4 className="font-semibold text-[#2e6b4f] dark:text-white mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {language === "ar" ? "المصادر" : "Sources"} ({sources.length})
        </h4>
        <div className="space-y-3">
          {sources.map((source) => (
            <div 
              key={source.id} 
              className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-800 dark:text-white">
                    {language === "ar" ? source.titleAr : source.titleEn}
                  </div>
                  {source.organization && (
                    <div className="text-sm text-gray-500 mt-1">
                      {source.organization}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {language === "ar" 
                        ? sourceTypeLabels[source.type].ar 
                        : sourceTypeLabels[source.type].en}
                    </Badge>
                    {source.date && (
                      <span className="text-xs text-gray-500">{source.date}</span>
                    )}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        source.confidence === "high" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : source.confidence === "medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {source.confidence === "high" 
                        ? (language === "ar" ? "موثوق" : "Verified") 
                        : source.confidence === "medium"
                        ? (language === "ar" ? "مراجع" : "Reviewed")
                        : (language === "ar" ? "غير مؤكد" : "Unverified")}
                    </Badge>
                  </div>
                </div>
                {source.url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      {methodology && (
        <div>
          <h4 className="font-semibold text-[#2e6b4f] dark:text-white mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {language === "ar" ? "المنهجية" : "Methodology"}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {language === "ar" ? methodologyAr || methodology : methodology}
          </p>
        </div>
      )}

      {/* Data Quality Notice */}
      <div className="bg-[#2e6b4f]/5 border border-[#2e6b4f]/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-[#2e6b4f] mt-0.5" />
          <div>
            <h5 className="font-medium text-[#2e6b4f] mb-1">
              {language === "ar" ? "ملاحظة جودة البيانات" : "Data Quality Note"}
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === "ar"
                ? "يتم التحقق من جميع البيانات في YETO من خلال منهجية صارمة تشمل التحقق من المصادر المتعددة والمراجعة من قبل الخبراء. إذا وجدت أي خطأ، يرجى الإبلاغ عنه."
                : "All data in YETO is verified through a rigorous methodology including multi-source verification and expert review. If you find any errors, please report them."}
            </p>
            <Button variant="link" className="text-[#2e6b4f] p-0 h-auto mt-2">
              {language === "ar" ? "الإبلاغ عن مشكلة" : "Report an Issue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Button variant (default)
  if (variant === "button") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`text-[#2e6b4f] border-[#2e6b4f]/30 hover:bg-[#2e6b4f]/10 ${className}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            {language === "ar" ? "كيف نعرف هذا؟" : "How do we know this?"}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-[#2e6b4f]" />
              {language === "ar" ? "حزمة الأدلة" : "Evidence Pack"}
            </DialogTitle>
            <DialogDescription>
              {language === "ar"
                ? "مصادر البيانات والمنهجية المستخدمة لهذا المؤشر"
                : "Data sources and methodology used for this indicator"}
            </DialogDescription>
          </DialogHeader>
          <EvidenceContent />
        </DialogContent>
      </Dialog>
    );
  }

  // Icon variant (small icon button)
  if (variant === "icon") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-6 w-6 p-0 text-[#2e6b4f] hover:bg-[#2e6b4f]/10 ${className}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 max-h-[400px] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-semibold">
              <Database className="h-4 w-4 text-[#2e6b4f]" />
              {language === "ar" ? "حزمة الأدلة" : "Evidence Pack"}
            </div>
            <EvidenceContent />
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Inline variant (text link)
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={`inline-flex items-center gap-1 text-[#2e6b4f] hover:underline text-sm ${className}`}>
          <Link2 className="h-3 w-3" />
          {language === "ar" ? "عرض المصادر" : "View sources"}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-[#2e6b4f]" />
            {language === "ar" ? "حزمة الأدلة" : "Evidence Pack"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar"
              ? "مصادر البيانات والمنهجية المستخدمة لهذا المؤشر"
              : "Data sources and methodology used for this indicator"}
          </DialogDescription>
        </DialogHeader>
        <EvidenceContent />
      </DialogContent>
    </Dialog>
  );
}

// Quick Evidence Badge - for showing confidence inline
export function EvidenceBadge({ 
  confidence, 
  sourceCount,
  className = "" 
}: { 
  confidence: "high" | "medium" | "low";
  sourceCount: number;
  className?: string;
}) {
  const { language } = useLanguage();
  
  const config = {
    high: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    medium: { color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
    low: { color: "bg-red-100 text-red-700", icon: AlertTriangle },
  };

  const Icon = config[confidence].icon;

  return (
    <Badge variant="outline" className={`${config[confidence].color} ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {sourceCount} {language === "ar" ? "مصادر" : "sources"}
    </Badge>
  );
}

export default EvidencePack;
