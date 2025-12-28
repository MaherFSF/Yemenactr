import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  CheckCircle, 
  AlertCircle, 
  FlaskConical, 
  Clock,
  Code2
} from "lucide-react";

export type DataQuality = "verified" | "provisional" | "experimental" | "dev" | "gap";

interface DataQualityBadgeProps {
  quality: DataQuality;
  lastUpdated?: string;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function DataQualityBadge({ 
  quality, 
  lastUpdated,
  showTooltip = true,
  size = "sm"
}: DataQualityBadgeProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const qualityConfig: Record<DataQuality, {
    labelEn: string;
    labelAr: string;
    descEn: string;
    descAr: string;
    icon: React.ReactNode;
    className: string;
  }> = {
    verified: {
      labelEn: "Verified",
      labelAr: "موثق",
      descEn: "Data verified from official sources with full provenance",
      descAr: "بيانات موثقة من مصادر رسمية مع تتبع كامل",
      icon: <CheckCircle className="h-3 w-3" />,
      className: "bg-green-500 text-white hover:bg-green-600"
    },
    provisional: {
      labelEn: "Provisional",
      labelAr: "مؤقت",
      descEn: "Data from reliable sources, pending final verification",
      descAr: "بيانات من مصادر موثوقة، في انتظار التحقق النهائي",
      icon: <Clock className="h-3 w-3" />,
      className: "bg-blue-500 text-white hover:bg-blue-600"
    },
    experimental: {
      labelEn: "Experimental",
      labelAr: "تجريبي",
      descEn: "Estimated or modeled data with methodological caveats",
      descAr: "بيانات تقديرية أو نموذجية مع تحفظات منهجية",
      icon: <FlaskConical className="h-3 w-3" />,
      className: "bg-yellow-500 text-black hover:bg-yellow-600"
    },
    dev: {
      labelEn: "DEV",
      labelAr: "تطوير",
      descEn: "Sample/synthetic data for development - not real",
      descAr: "بيانات عينة/اصطناعية للتطوير - ليست حقيقية",
      icon: <Code2 className="h-3 w-3" />,
      className: "bg-purple-500 text-white hover:bg-purple-600 animate-pulse"
    },
    gap: {
      labelEn: "Data Gap",
      labelAr: "فجوة بيانات",
      descEn: "No verified data available for this indicator",
      descAr: "لا تتوفر بيانات موثقة لهذا المؤشر",
      icon: <AlertCircle className="h-3 w-3" />,
      className: "bg-gray-400 text-white hover:bg-gray-500"
    }
  };

  const config = qualityConfig[quality];
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5"
  };

  const badge = (
    <Badge className={`${config.className} ${sizeClasses[size]} gap-1 cursor-help`}>
      {config.icon}
      {isArabic ? config.labelAr : config.labelEn}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs" dir={isArabic ? "rtl" : "ltr"}>
          <p className="text-sm">{isArabic ? config.descAr : config.descEn}</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              {isArabic ? "آخر تحديث:" : "Last updated:"} {new Date(lastUpdated).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US')}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper component for displaying DEV mode warning banner
export function DevModeBanner() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return (
    <div 
      className="bg-purple-600 text-white py-1 px-4 text-center text-sm font-medium"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Code2 className="h-4 w-4 inline-block mr-2" />
      {isArabic 
        ? "⚠️ وضع التطوير - البيانات المعروضة للعرض التوضيحي فقط وليست حقيقية"
        : "⚠️ Development Mode - Data shown is for demonstration only and is not real"}
    </div>
  );
}
