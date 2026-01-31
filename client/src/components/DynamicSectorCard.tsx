import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, TrendingDown, Minus, Info, ExternalLink } from "lucide-react";
import { formatIndicatorValue, getConfidenceColor } from "@/hooks/useSectorData";

interface DynamicSectorCardProps {
  titleEn: string;
  titleAr: string;
  value: number | undefined;
  previousValue?: number;
  unit: string;
  source: string;
  sourceUrl?: string;
  confidence: string;
  date?: Date;
  regime?: "aden" | "sanaa" | "both";
  icon?: React.ReactNode;
  trend?: number[];
}

export function DynamicSectorCard({
  titleEn,
  titleAr,
  value,
  previousValue,
  unit,
  source,
  sourceUrl,
  confidence,
  date,
  regime,
  icon,
  trend,
}: DynamicSectorCardProps) {
  const { language } = useLanguage();

  // Calculate change percentage
  const changePercent = previousValue && value
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : null;

  const isPositive = changePercent ? parseFloat(changePercent) > 0 : null;
  const isNeutral = changePercent ? Math.abs(parseFloat(changePercent)) < 0.5 : true;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <div className="text-primary">{icon}</div>}
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === "ar" ? titleAr : titleEn}
            </CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`${getConfidenceColor(confidence)} text-white border-0 text-xs`}
                >
                  {language === "ar" ? "ثقة" : "Conf."} {confidence}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {confidence === "A" && (language === "ar" ? "بيانات رسمية موثقة" : "Official verified data")}
                  {confidence === "B" && (language === "ar" ? "مصادر موثوقة" : "Reliable sources")}
                  {confidence === "C" && (language === "ar" ? "تقديرات" : "Estimates")}
                  {confidence === "D" && (language === "ar" ? "بيانات غير مؤكدة" : "Unverified data")}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatIndicatorValue(value, unit)}
            </div>
            {changePercent && !isNeutral && (
              <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{isPositive ? "+" : ""}{changePercent}%</span>
              </div>
            )}
            {isNeutral && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Minus className="h-4 w-4" />
                <span>{language === "ar" ? "مستقر" : "Stable"}</span>
              </div>
            )}
          </div>
          {trend && trend.length > 0 && (
            <div className="h-12 w-24">
              <svg viewBox="0 0 100 40" className="w-full h-full">
                <polyline
                  fill="none"
                  stroke={isPositive ? "#22c55e" : isNeutral ? "#6b7280" : "#ef4444"}
                  strokeWidth="2"
                  points={trend.map((v, i) => `${(i / (trend.length - 1)) * 100},${40 - (v / Math.max(...trend)) * 35}`).join(" ")}
                />
              </svg>
            </div>
          )}
        </div>

        {/* Source attribution */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              <span>{source}</span>
              {sourceUrl && (
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {date && (
              <span>
                {date.toLocaleDateString(language === "ar" ? "ar-YE" : "en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
          {regime && (
            <Badge variant="outline" className="mt-1 text-xs">
              {regime === "aden" && (language === "ar" ? "عدن" : "Aden")}
              {regime === "sanaa" && (language === "ar" ? "صنعاء" : "Sana'a")}
              {regime === "both" && (language === "ar" ? "كلا النظامين" : "Both Regimes")}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Comparison card showing both regime values
interface DynamicComparisonCardProps {
  titleEn: string;
  titleAr: string;
  adenValue: number | undefined;
  sanaaValue: number | undefined;
  unit: string;
  adenSource: string;
  sanaaSource: string;
  adenConfidence: string;
  sanaaConfidence: string;
  icon?: React.ReactNode;
}

export function DynamicComparisonCard({
  titleEn,
  titleAr,
  adenValue,
  sanaaValue,
  unit,
  adenSource,
  sanaaSource,
  adenConfidence,
  sanaaConfidence,
  icon,
}: DynamicComparisonCardProps) {
  const { language } = useLanguage();

  const gap = adenValue && sanaaValue ? Math.abs(adenValue - sanaaValue) : null;
  const gapPercent = adenValue && sanaaValue && sanaaValue !== 0
    ? ((adenValue - sanaaValue) / sanaaValue * 100).toFixed(0)
    : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <CardTitle className="text-sm font-medium">
            {language === "ar" ? titleAr : titleEn}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Aden */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {language === "ar" ? "عدن" : "Aden"}
              </span>
              <Badge variant="outline" className={`${getConfidenceColor(adenConfidence)} text-white border-0 text-xs`}>
                {adenConfidence}
              </Badge>
            </div>
            <div className="text-xl font-bold text-[#2e6b4f]">
              {formatIndicatorValue(adenValue, unit)}
            </div>
            <div className="text-xs text-muted-foreground truncate" title={adenSource}>
              {adenSource}
            </div>
          </div>

          {/* Sana'a */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {language === "ar" ? "صنعاء" : "Sana'a"}
              </span>
              <Badge variant="outline" className={`${getConfidenceColor(sanaaConfidence)} text-white border-0 text-xs`}>
                {sanaaConfidence}
              </Badge>
            </div>
            <div className="text-xl font-bold text-[#2e6b4f]">
              {formatIndicatorValue(sanaaValue, unit)}
            </div>
            <div className="text-xs text-muted-foreground truncate" title={sanaaSource}>
              {sanaaSource}
            </div>
          </div>
        </div>

        {/* Gap indicator */}
        {gap !== null && gapPercent !== null && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {language === "ar" ? "الفجوة" : "Gap"}
              </span>
              <span className="font-medium text-amber-600">
                {formatIndicatorValue(gap, unit)} ({gapPercent}%)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DynamicSectorCard;
