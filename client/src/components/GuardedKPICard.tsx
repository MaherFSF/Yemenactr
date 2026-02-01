/**
 * TRUTH-NATIVE Guarded KPI Card
 * 
 * A KPI card that enforces evidence requirements:
 * - Shows value only if DB-driven AND evidence_pack_id exists AND license allows
 * - Otherwise shows "— | GAP-ID" with warning styling
 * - Clicking opens Evidence Drawer (or GAP creation if no evidence)
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import EvidencePackButton, { EvidencePackData } from "./EvidencePackButton";
import { useEvidenceGuard } from "@/hooks/useEvidenceGuard";
import { cn } from "@/lib/utils";

interface GuardedKPICardProps {
  // Display
  title: string;
  titleAr?: string;
  value: string | number | null | undefined;
  unit?: string;
  unitAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  icon?: React.ReactNode;
  
  // Evidence
  evidencePackId?: string | null;
  evidenceData?: EvidencePackData;
  isDbDriven?: boolean;
  licenseAllows?: boolean;
  
  // Context for GAP tickets
  indicatorCode?: string;
  sectorCode?: string;
  
  // Styling
  className?: string;
  valueClassName?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  confidenceGrade?: "A" | "B" | "C" | "D";
}

export default function GuardedKPICard({
  title,
  titleAr,
  value,
  unit,
  unitAr,
  subtitle,
  subtitleAr,
  icon,
  evidencePackId,
  evidenceData,
  isDbDriven = true,
  licenseAllows = true,
  indicatorCode,
  sectorCode,
  className,
  valueClassName,
  trend,
  trendValue,
  confidenceGrade,
}: GuardedKPICardProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  // Use evidence guard to determine display
  const guard = useEvidenceGuard({
    value,
    evidencePackId,
    isDbDriven,
    licenseAllows,
    indicatorCode,
    sectorCode,
  });

  const getConfidenceColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-500 text-white",
      B: "bg-blue-500 text-white",
      C: "bg-yellow-500 text-black",
      D: "bg-red-500 text-white",
    };
    return colors[grade] || "bg-gray-500 text-white";
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === "up") return <span className="text-green-500">↑</span>;
    if (trend === "down") return <span className="text-red-500">↓</span>;
    return <span className="text-gray-500">→</span>;
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all",
      !guard.hasEvidence && "border-amber-300 bg-amber-50/30",
      className
    )}>
      <CardContent className="p-4">
        {/* Header with title and evidence indicator */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-gray-500">{icon}</span>}
            <span className="text-sm font-medium text-gray-600">
              {isArabic ? titleAr || title : title}
            </span>
          </div>
          
          {/* Evidence status indicator */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  {guard.hasEvidence ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  {confidenceGrade && guard.hasEvidence && (
                    <Badge className={cn("text-xs", getConfidenceColor(confidenceGrade))}>
                      {confidenceGrade}
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{guard.tooltipMessage}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Value display */}
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-2xl font-bold",
            guard.hasEvidence ? "text-[#2e8b6e]" : "text-amber-600",
            valueClassName
          )}>
            {guard.hasEvidence ? guard.displayValue : (
              <span className="flex items-center gap-1">
                <span>—</span>
                <span className="text-sm font-normal text-amber-500">
                  {guard.gapId}
                </span>
              </span>
            )}
          </span>
          {guard.hasEvidence && unit && (
            <span className="text-sm text-gray-500">
              {isArabic ? unitAr || unit : unit}
            </span>
          )}
          {guard.hasEvidence && trend && (
            <span className="flex items-center gap-1 text-sm">
              {getTrendIcon()}
              {trendValue && <span className="text-gray-500">{trendValue}</span>}
            </span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">
            {isArabic ? subtitleAr || subtitle : subtitle}
          </p>
        )}

        {/* Evidence button */}
        <div className="mt-3 flex justify-end">
          <EvidencePackButton
            data={evidenceData}
            evidencePackId={evidencePackId || undefined}
            variant="link"
            size="sm"
            indicatorName={title}
            indicatorNameAr={titleAr}
            sectorCode={sectorCode}
          />
        </div>

        {/* GAP warning banner */}
        {!guard.hasEvidence && (
          <div className="absolute bottom-0 left-0 right-0 bg-amber-100 border-t border-amber-200 px-2 py-1">
            <div className="flex items-center justify-center gap-1 text-xs text-amber-700">
              <Info className="h-3 w-3" />
              <span>
                {isArabic 
                  ? "بيانات غير موثقة - انقر للتفاصيل"
                  : "Unverified data - click for details"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
