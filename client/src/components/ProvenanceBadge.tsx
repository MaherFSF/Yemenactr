import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  ExternalLink,
  Calendar,
  Building2,
  FileText,
  Shield,
  Clock,
  RefreshCw,
} from "lucide-react";

export type ConfidenceLevel = "A" | "B" | "C" | "D" | "E";
export type DataSourceType = "official" | "field" | "research" | "estimate" | "derived";

export interface ProvenanceData {
  source: string;
  sourceAr?: string;
  sourceType: DataSourceType;
  confidence: ConfidenceLevel;
  lastUpdated: string;
  methodology?: string;
  methodologyAr?: string;
  sourceUrl?: string;
  caveats?: string[];
  caveatsAr?: string[];
  regime?: "IRG" | "DFA" | "both";
}

interface ProvenanceBadgeProps {
  data: ProvenanceData;
  language?: "en" | "ar";
  compact?: boolean;
  showConfidence?: boolean;
  showSource?: boolean;
}

const confidenceConfig: Record<ConfidenceLevel, { 
  label: string; 
  labelAr: string; 
  color: string; 
  bgColor: string;
  description: string;
  descriptionAr: string;
}> = {
  A: {
    label: "High Confidence",
    labelAr: "ثقة عالية",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    description: "Official source, verified data",
    descriptionAr: "مصدر رسمي، بيانات موثقة",
  },
  B: {
    label: "Good Confidence",
    labelAr: "ثقة جيدة",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    description: "Reliable source, cross-verified",
    descriptionAr: "مصدر موثوق، تم التحقق المتقاطع",
  },
  C: {
    label: "Moderate Confidence",
    labelAr: "ثقة متوسطة",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    description: "Single source, not fully verified",
    descriptionAr: "مصدر واحد، لم يتم التحقق الكامل",
  },
  D: {
    label: "Low Confidence",
    labelAr: "ثقة منخفضة",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    description: "Estimated or derived data",
    descriptionAr: "بيانات مقدرة أو مشتقة",
  },
  E: {
    label: "Unverified",
    labelAr: "غير موثق",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    description: "Unverified, use with caution",
    descriptionAr: "غير موثق، استخدم بحذر",
  },
};

const sourceTypeConfig: Record<DataSourceType, {
  label: string;
  labelAr: string;
  icon: React.ReactNode;
}> = {
  official: {
    label: "Official",
    labelAr: "رسمي",
    icon: <Building2 className="h-3 w-3" />,
  },
  field: {
    label: "Field Data",
    labelAr: "بيانات ميدانية",
    icon: <RefreshCw className="h-3 w-3" />,
  },
  research: {
    label: "Research",
    labelAr: "بحثي",
    icon: <FileText className="h-3 w-3" />,
  },
  estimate: {
    label: "Estimate",
    labelAr: "تقديري",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  derived: {
    label: "Derived",
    labelAr: "مشتق",
    icon: <Shield className="h-3 w-3" />,
  },
};

const ConfidenceIcon = ({ level }: { level: ConfidenceLevel }) => {
  switch (level) {
    case "A":
      return <CheckCircle2 className="h-3 w-3" />;
    case "B":
      return <CheckCircle2 className="h-3 w-3" />;
    case "C":
      return <Info className="h-3 w-3" />;
    case "D":
      return <AlertTriangle className="h-3 w-3" />;
    case "E":
      return <AlertCircle className="h-3 w-3" />;
  }
};

export function ProvenanceBadge({
  data,
  language = "en",
  compact = false,
  showConfidence = true,
  showSource = true,
}: ProvenanceBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const conf = confidenceConfig[data.confidence];
  const sourceType = sourceTypeConfig[data.sourceType];
  const isArabic = language === "ar";

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`${conf.bgColor} ${conf.color} cursor-help text-xs gap-1`}
            >
              <ConfidenceIcon level={data.confidence} />
              {data.confidence}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <div className="font-medium">
                {isArabic ? conf.labelAr : conf.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {isArabic ? data.sourceAr || data.source : data.source}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-auto py-1 px-2 gap-1.5 ${conf.color} hover:${conf.bgColor}`}
        >
          {showConfidence && (
            <Badge 
              variant="outline" 
              className={`${conf.bgColor} ${conf.color} text-xs gap-1`}
            >
              <ConfidenceIcon level={data.confidence} />
              {data.confidence}
            </Badge>
          )}
          {showSource && (
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {isArabic ? data.sourceAr || data.source : data.source}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80" 
        align="start"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">
              {isArabic ? "معلومات المصدر" : "Source Information"}
            </h4>
            <Badge 
              variant="outline" 
              className={`${conf.bgColor} ${conf.color} gap-1`}
            >
              <ConfidenceIcon level={data.confidence} />
              {isArabic ? conf.labelAr : conf.label}
            </Badge>
          </div>

          {/* Source Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">
                  {isArabic ? "المصدر" : "Source"}
                </div>
                <div className="text-sm font-medium">
                  {isArabic ? data.sourceAr || data.source : data.source}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              {sourceType.icon}
              <div>
                <div className="text-xs text-muted-foreground">
                  {isArabic ? "نوع المصدر" : "Source Type"}
                </div>
                <div className="text-sm">
                  {isArabic ? sourceType.labelAr : sourceType.label}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">
                  {isArabic ? "آخر تحديث" : "Last Updated"}
                </div>
                <div className="text-sm">{data.lastUpdated}</div>
              </div>
            </div>

            {data.regime && (
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    {isArabic ? "النطاق" : "Coverage"}
                  </div>
                  <div className="text-sm">
                    {data.regime === "IRG" 
                      ? (isArabic ? "الحكومة الشرعية (عدن)" : "IRG (Aden)")
                      : data.regime === "DFA"
                      ? (isArabic ? "سلطة الأمر الواقع (صنعاء)" : "DFA (Sana'a)")
                      : (isArabic ? "كلا النظامين" : "Both Regimes")}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Methodology */}
          {data.methodology && (
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-1">
                {isArabic ? "المنهجية" : "Methodology"}
              </div>
              <p className="text-xs leading-relaxed">
                {isArabic ? data.methodologyAr || data.methodology : data.methodology}
              </p>
            </div>
          )}

          {/* Caveats */}
          {data.caveats && data.caveats.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 mb-1">
                <AlertTriangle className="h-3 w-3" />
                {isArabic ? "تحفظات" : "Caveats"}
              </div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {(isArabic ? data.caveatsAr || data.caveats : data.caveats).map((caveat, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-yellow-500">•</span>
                    {caveat}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Source Link */}
          {data.sourceUrl && (
            <div className="pt-2 border-t">
              <a
                href={data.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                {isArabic ? "عرض المصدر الأصلي" : "View Original Source"}
              </a>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Utility function to create provenance data
export function createProvenance(
  source: string,
  sourceType: DataSourceType,
  confidence: ConfidenceLevel,
  lastUpdated: string,
  options?: Partial<ProvenanceData>
): ProvenanceData {
  return {
    source,
    sourceType,
    confidence,
    lastUpdated,
    ...options,
  };
}

// Common provenance presets for Yemen data sources
export const PROVENANCE_PRESETS = {
  CBY_ADEN: (lastUpdated: string): ProvenanceData => ({
    source: "Central Bank of Yemen - Aden",
    sourceAr: "البنك المركزي اليمني - عدن",
    sourceType: "official",
    confidence: "A",
    lastUpdated,
    regime: "IRG",
  }),
  CBY_SANAA: (lastUpdated: string): ProvenanceData => ({
    source: "Central Bank of Yemen - Sana'a",
    sourceAr: "البنك المركزي اليمني - صنعاء",
    sourceType: "official",
    confidence: "B",
    lastUpdated,
    regime: "DFA",
    caveats: ["Data from de facto authority, limited verification"],
    caveatsAr: ["بيانات من سلطة الأمر الواقع، تحقق محدود"],
  }),
  WORLD_BANK: (lastUpdated: string): ProvenanceData => ({
    source: "World Bank",
    sourceAr: "البنك الدولي",
    sourceType: "official",
    confidence: "A",
    lastUpdated,
    regime: "both",
  }),
  IMF: (lastUpdated: string): ProvenanceData => ({
    source: "International Monetary Fund",
    sourceAr: "صندوق النقد الدولي",
    sourceType: "official",
    confidence: "A",
    lastUpdated,
    regime: "both",
  }),
  OCHA: (lastUpdated: string): ProvenanceData => ({
    source: "UN OCHA",
    sourceAr: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية",
    sourceType: "official",
    confidence: "A",
    lastUpdated,
    regime: "both",
  }),
  WFP: (lastUpdated: string): ProvenanceData => ({
    source: "World Food Programme",
    sourceAr: "برنامج الغذاء العالمي",
    sourceType: "field",
    confidence: "A",
    lastUpdated,
    regime: "both",
  }),
  MARKET_SURVEY: (lastUpdated: string): ProvenanceData => ({
    source: "Market Survey",
    sourceAr: "مسح السوق",
    sourceType: "field",
    confidence: "B",
    lastUpdated,
    methodology: "Data collected from exchange bureaus and markets",
    methodologyAr: "بيانات مجمعة من مكاتب الصرافة والأسواق",
  }),
  ESTIMATE: (source: string, lastUpdated: string): ProvenanceData => ({
    source,
    sourceType: "estimate",
    confidence: "D",
    lastUpdated,
    caveats: ["Estimated value based on available data"],
    caveatsAr: ["قيمة تقديرية بناءً على البيانات المتاحة"],
  }),
};

export default ProvenanceBadge;
