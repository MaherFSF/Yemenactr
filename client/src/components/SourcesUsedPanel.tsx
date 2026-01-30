/**
 * Sources Used Panel Component
 * Displays the sources used on a sector page with tier information
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Database, Shield, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Source {
  id: number;
  publisher: string;
  url: string | null;
  license: string | null;
  dataPointCount: number;
  lastDataDate: string | null;
  tier: string;
}

interface SourcesUsedPanelProps {
  sources: Source[];
  isLoading?: boolean;
  sectorName?: string;
}

const tierColors: Record<string, string> = {
  T0: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  T1: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  T2: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  T3: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
};

const tierLabels: Record<string, { en: string; ar: string }> = {
  T0: { en: "Official Government", ar: "حكومي رسمي" },
  T1: { en: "International Organization", ar: "منظمة دولية" },
  T2: { en: "Research Institution", ar: "مؤسسة بحثية" },
  T3: { en: "Other Source", ar: "مصدر آخر" },
};

export function SourcesUsedPanel({ sources, isLoading, sectorName }: SourcesUsedPanelProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Group sources by tier
  const sourcesByTier = sources.reduce((acc, source) => {
    const tier = source.tier || "T3";
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(source);
    return acc;
  }, {} as Record<string, Source[]>);

  const tierOrder = ["T0", "T1", "T2", "T3"];
  const displayedSources = isExpanded ? sources : sources.slice(0, 5);
  const hasMore = sources.length > 5;

  if (isLoading) {
    return (
      <Card className="border-[#4C583E]/20 bg-[#DADED8]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#2C3424]">
            <Database className="h-4 w-4" />
            {language === "ar" ? "المصادر المستخدمة" : "Sources Used on This Page"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sources.length === 0) {
    return (
      <Card className="border-[#4C583E]/20 bg-[#DADED8]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#2C3424]">
            <Database className="h-4 w-4" />
            {language === "ar" ? "المصادر المستخدمة" : "Sources Used on This Page"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {language === "ar" 
              ? "لا توجد مصادر مرتبطة بهذا القطاع حالياً"
              : "No sources currently linked to this sector"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#4C583E]/20 bg-gradient-to-br from-[#DADED8]/20 to-white dark:from-[#2C3424]/20 dark:to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-[#2C3424] dark:text-[#DADED8]">
            <Database className="h-4 w-4" />
            {language === "ar" ? "المصادر المستخدمة في هذه الصفحة" : "Sources Used on This Page"}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {sources.length} {language === "ar" ? "مصدر" : "sources"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {language === "ar"
            ? "جميع البيانات المعروضة مستمدة من هذه المصادر الموثقة"
            : "All data displayed is derived from these documented sources"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Tier Summary */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-[#4C583E]/10">
          {tierOrder.map((tier) => {
            const count = sourcesByTier[tier]?.length || 0;
            if (count === 0) return null;
            return (
              <Badge key={tier} className={`${tierColors[tier]} text-xs`}>
                {tierLabels[tier][language === "ar" ? "ar" : "en"]}: {count}
              </Badge>
            );
          })}
        </div>

        {/* Source List */}
        <div className="space-y-2">
          {displayedSources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-white/5 border border-[#4C583E]/10 hover:border-[#4C583E]/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Badge className={`${tierColors[source.tier]} text-xs shrink-0`}>
                  {source.tier}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{source.publisher}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{source.dataPointCount} {language === "ar" ? "نقطة بيانات" : "data points"}</span>
                    {source.license && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {source.license}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {source.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  onClick={() => window.open(source.url!, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                {language === "ar" ? "عرض أقل" : "Show Less"}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                {language === "ar" ? `عرض ${sources.length - 5} مصادر إضافية` : `Show ${sources.length - 5} More Sources`}
              </>
            )}
          </Button>
        )}

        {/* Methodology Link */}
        <div className="pt-2 border-t border-[#4C583E]/10">
          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-[#4C583E]">
            <FileText className="h-3 w-3 mr-1" />
            {language === "ar" ? "اقرأ منهجية البيانات الكاملة" : "Read Full Data Methodology"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SourcesUsedPanel;
