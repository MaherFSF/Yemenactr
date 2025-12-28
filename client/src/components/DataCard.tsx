import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { Info, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

export type ConfidenceRating = "A" | "B" | "C" | "D";

interface DataCardProps {
  title: string;
  titleAr?: string;
  value: string | number;
  unit?: string;
  description?: string;
  descriptionAr?: string;
  confidenceRating?: ConfidenceRating;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  trendLabel?: string;
  trendLabelAr?: string;
  icon?: ReactNode;
  source?: string;
  sourceAr?: string;
  lastUpdated?: string;
  isProvisional?: boolean;
  isSynthetic?: boolean;
  onClick?: () => void;
  className?: string;
}

const confidenceConfig: Record<ConfidenceRating, {
  label: string;
  labelAr: string;
  color: string;
  bgColor: string;
  description: string;
  descriptionAr: string;
}> = {
  A: {
    label: "Highly Reliable",
    labelAr: "موثوق للغاية",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800",
    description: "Official/audited data from authoritative sources",
    descriptionAr: "بيانات رسمية/مدققة من مصادر موثوقة",
  },
  B: {
    label: "Reliable",
    labelAr: "موثوق",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800",
    description: "Credible institutional source with minor gaps",
    descriptionAr: "مصدر مؤسسي موثوق مع فجوات طفيفة",
  },
  C: {
    label: "Moderate",
    labelAr: "متوسط",
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800",
    description: "Proxy or modelled data with some uncertainty",
    descriptionAr: "بيانات تقريبية أو نموذجية مع بعض عدم اليقين",
  },
  D: {
    label: "Low Reliability",
    labelAr: "موثوقية منخفضة",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-800",
    description: "Disputed or unverified data - use with caution",
    descriptionAr: "بيانات متنازع عليها أو غير موثقة - استخدم بحذر",
  },
};

export function ConfidenceBadge({ 
  rating, 
  showLabel = false,
  size = "default" 
}: { 
  rating: ConfidenceRating; 
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
}) {
  const { language } = useLanguage();
  const config = confidenceConfig[rating];
  
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    default: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={`${config.bgColor} ${config.color} ${sizeClasses[size]} font-semibold cursor-help border`}
        >
          {rating}{showLabel && ` - ${language === "ar" ? config.labelAr : config.label}`}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">
            {language === "ar" ? `تصنيف الثقة: ${config.labelAr}` : `Confidence: ${config.label}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {language === "ar" ? config.descriptionAr : config.description}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function DataCard({
  title,
  titleAr,
  value,
  unit,
  description,
  descriptionAr,
  confidenceRating,
  trend,
  trendValue,
  trendLabel,
  trendLabelAr,
  icon,
  source,
  sourceAr,
  lastUpdated,
  isProvisional,
  isSynthetic,
  onClick,
  className = "",
}: DataCardProps) {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "stable":
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <Card 
      className={`relative overflow-hidden transition-all hover:shadow-md ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {/* DEV/Synthetic Label */}
      {(isProvisional || isSynthetic) && (
        <div className="absolute top-0 right-0 z-10">
          <Badge 
            variant="outline" 
            className={`rounded-none rounded-bl-lg text-xs ${
              isSynthetic 
                ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-400" 
                : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400"
            }`}
          >
            {isSynthetic 
              ? (language === "ar" ? "تجريبي" : "DEV") 
              : (language === "ar" ? "مؤقت" : "PROVISIONAL")}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL && titleAr ? titleAr : title}
            </CardTitle>
          </div>
          {confidenceRating && (
            <ConfidenceBadge rating={confidenceRating} size="sm" />
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {/* Main Value */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            {unit && (
              <span className="text-sm text-muted-foreground">{unit}</span>
            )}
          </div>

          {/* Trend */}
          {(trend || trendValue) && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              {trendValue && <span className="font-medium">{trendValue}</span>}
              {(trendLabel || trendLabelAr) && (
                <span className="text-muted-foreground">
                  {isRTL && trendLabelAr ? trendLabelAr : trendLabel}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {(description || descriptionAr) && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {isRTL && descriptionAr ? descriptionAr : description}
            </p>
          )}

          {/* Source & Last Updated */}
          {(source || lastUpdated) && (
            <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
              {source && (
                <span className="truncate max-w-[60%]">
                  {isRTL && sourceAr ? sourceAr : source}
                </span>
              )}
              {lastUpdated && (
                <span className="text-right">{lastUpdated}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Confidence Rating Legend Component
export function ConfidenceRatingLegend({ compact = false }: { compact?: boolean }) {
  const { language } = useLanguage();
  const ratings: ConfidenceRating[] = ["A", "B", "C", "D"];

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{language === "ar" ? "تصنيف الثقة:" : "Confidence:"}</span>
        <div className="flex items-center gap-1">
          {ratings.map((rating) => (
            <ConfidenceBadge key={rating} rating={rating} size="sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">
        {language === "ar" ? "دليل تصنيف الثقة" : "Confidence Rating Guide"}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {ratings.map((rating) => {
          const config = confidenceConfig[rating];
          return (
            <div 
              key={rating} 
              className={`p-2 rounded-lg border ${config.bgColor}`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-bold ${config.color}`}>{rating}</span>
                <span className="text-xs font-medium">
                  {language === "ar" ? config.labelAr : config.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {language === "ar" ? config.descriptionAr : config.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DataCard;
