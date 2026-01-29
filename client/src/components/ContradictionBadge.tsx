import { useState } from "react";
import { AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface ContradictionValue {
  sourceId: number;
  sourceName: string;
  value: string;
  methodology?: string;
}

interface ContradictionBadgeProps {
  primaryValue: string;
  contradictions: ContradictionValue[];
  whyDifferent?: string;
  language?: "en" | "ar";
  showInline?: boolean;
}

const translations = {
  en: {
    multipleSourcesDisagree: "Multiple sources disagree",
    sourcesReport: "Sources report different values",
    ourValue: "Displayed Value",
    alternativeValues: "Alternative Values",
    whyDifferent: "Why they differ",
    source: "Source",
    methodology: "Methodology",
    viewDetails: "View details",
    hideDetails: "Hide details",
    noExplanation: "No explanation available - under investigation",
  },
  ar: {
    multipleSourcesDisagree: "مصادر متعددة تختلف",
    sourcesReport: "المصادر تبلغ عن قيم مختلفة",
    ourValue: "القيمة المعروضة",
    alternativeValues: "القيم البديلة",
    whyDifferent: "لماذا تختلف",
    source: "المصدر",
    methodology: "المنهجية",
    viewDetails: "عرض التفاصيل",
    hideDetails: "إخفاء التفاصيل",
    noExplanation: "لا يوجد تفسير متاح - قيد التحقيق",
  },
};

export function ContradictionBadge({
  primaryValue,
  contradictions,
  whyDifferent,
  language = "en",
  showInline = false,
}: ContradictionBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[language];
  const isRTL = language === "ar";

  if (contradictions.length === 0) {
    return null;
  }

  const content = (
    <div className={cn("space-y-4", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium text-sm">{t.sourcesReport}</span>
      </div>

      {/* Primary Value */}
      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
        <p className="text-xs text-green-600 dark:text-green-400 mb-1">{t.ourValue}</p>
        <p className="font-mono font-bold text-green-800 dark:text-green-200 text-lg">
          {primaryValue}
        </p>
      </div>

      {/* Alternative Values */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{t.alternativeValues}:</p>
        {contradictions.map((c, idx) => (
          <div
            key={idx}
            className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800"
          >
            <div className={cn("flex justify-between items-start gap-2", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                  {t.source}: {c.sourceName}
                </p>
                <p className="font-mono font-bold text-amber-800 dark:text-amber-200">
                  {c.value}
                </p>
              </div>
            </div>
            {c.methodology && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                {t.methodology}: {c.methodology}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Why Different */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-xs font-medium mb-1">{t.whyDifferent}:</p>
        <p className="text-sm text-muted-foreground">
          {whyDifferent || t.noExplanation}
        </p>
      </div>
    </div>
  );

  if (showInline) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t.multipleSourcesDisagree}
          </Badge>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              {isOpen ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  {t.hideDetails}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  {t.viewDetails}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-3">
          <div className="p-4 border rounded-lg bg-background">{content}</div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="outline"
          className="cursor-pointer bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          {t.multipleSourcesDisagree}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        {content}
      </PopoverContent>
    </Popover>
  );
}

// Compact version for table cells
export function ContradictionIndicator({
  hasContradiction,
  onClick,
  language = "en",
}: {
  hasContradiction: boolean;
  onClick?: () => void;
  language?: "en" | "ar";
}) {
  const t = translations[language];

  if (!hasContradiction) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-400 dark:hover:bg-amber-800 transition-colors"
      title={t.multipleSourcesDisagree}
    >
      <AlertTriangle className="h-3 w-3" />
    </button>
  );
}

export default ContradictionBadge;
