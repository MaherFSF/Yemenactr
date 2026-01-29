import { useState } from "react";
import { Calendar, GitCompare, History, ChevronDown, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Vintage {
  id: number;
  versionNumber: number;
  vintageDate: string;
  changeType: "initial" | "revision" | "correction" | "restatement" | "methodology_change";
  changeDescription?: string;
  changeSummary?: {
    recordsAdded: number;
    recordsModified: number;
    recordsDeleted: number;
    affectedIndicators?: string[];
  };
}

interface VintageSelectorProps {
  vintages: Vintage[];
  currentVintageId?: number;
  onVintageChange: (vintageId: number) => void;
  onCompare?: (vintageId1: number, vintageId2: number) => void;
  language?: "en" | "ar";
}

const translations = {
  en: {
    asOfDate: "As of date",
    selectVintage: "Select vintage",
    compareVintages: "Compare vintages",
    currentVersion: "Current",
    version: "Version",
    initial: "Initial release",
    revision: "Revision",
    correction: "Correction",
    restatement: "Restatement",
    methodology_change: "Methodology change",
    recordsAdded: "Records added",
    recordsModified: "Records modified",
    recordsDeleted: "Records deleted",
    affectedIndicators: "Affected indicators",
    noChanges: "No changes recorded",
    compare: "Compare",
    vs: "vs",
    selectFirst: "Select first vintage",
    selectSecond: "Select second vintage",
    viewHistory: "View history",
    latestData: "Latest data",
    historicalView: "Historical view",
  },
  ar: {
    asOfDate: "اعتباراً من تاريخ",
    selectVintage: "اختر الإصدار",
    compareVintages: "مقارنة الإصدارات",
    currentVersion: "الحالي",
    version: "الإصدار",
    initial: "الإصدار الأولي",
    revision: "مراجعة",
    correction: "تصحيح",
    restatement: "إعادة صياغة",
    methodology_change: "تغيير المنهجية",
    recordsAdded: "السجلات المضافة",
    recordsModified: "السجلات المعدلة",
    recordsDeleted: "السجلات المحذوفة",
    affectedIndicators: "المؤشرات المتأثرة",
    noChanges: "لم يتم تسجيل تغييرات",
    compare: "مقارنة",
    vs: "مقابل",
    selectFirst: "اختر الإصدار الأول",
    selectSecond: "اختر الإصدار الثاني",
    viewHistory: "عرض التاريخ",
    latestData: "أحدث البيانات",
    historicalView: "عرض تاريخي",
  },
};

const changeTypeColors = {
  initial: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  revision: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  correction: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  restatement: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  methodology_change: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function VintageSelector({
  vintages,
  currentVintageId,
  onVintageChange,
  onCompare,
  language = "en",
}: VintageSelectorProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [compareVintage1, setCompareVintage1] = useState<number | null>(null);
  const [compareVintage2, setCompareVintage2] = useState<number | null>(null);
  const t = translations[language];
  const isRTL = language === "ar";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getChangeTypeLabel = (changeType: Vintage["changeType"]) => {
    return t[changeType] || changeType;
  };

  const currentVintage = vintages.find((v) => v.id === currentVintageId);
  const isLatest = currentVintageId === vintages[0]?.id;

  return (
    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
      {/* Current vintage indicator */}
      {currentVintage && !isLatest && (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300">
          <History className="h-3 w-3 mr-1" />
          {t.historicalView}
        </Badge>
      )}

      {/* Vintage selector */}
      <Select
        value={currentVintageId?.toString()}
        onValueChange={(value) => onVintageChange(parseInt(value))}
      >
        <SelectTrigger className="w-[200px]">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue placeholder={t.selectVintage} />
        </SelectTrigger>
        <SelectContent>
          {vintages.map((vintage, idx) => (
            <SelectItem key={vintage.id} value={vintage.id.toString()}>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <span>{formatDate(vintage.vintageDate)}</span>
                {idx === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {t.latestData}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Compare button */}
      {onCompare && vintages.length > 1 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <GitCompare className="h-4 w-4 mr-2" />
              {t.compareVintages}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <GitCompare className="h-5 w-5" />
                {t.compareVintages}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Vintage selectors */}
              <div className={cn("grid grid-cols-[1fr,auto,1fr] gap-4 items-center", isRTL && "direction-rtl")}>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t.selectFirst}</label>
                  <Select
                    value={compareVintage1?.toString()}
                    onValueChange={(value) => setCompareVintage1(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectVintage} />
                    </SelectTrigger>
                    <SelectContent>
                      {vintages.map((vintage) => (
                        <SelectItem key={vintage.id} value={vintage.id.toString()}>
                          {formatDate(vintage.vintageDate)} (v{vintage.versionNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-center pt-6">
                  {isRTL ? (
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t.selectSecond}</label>
                  <Select
                    value={compareVintage2?.toString()}
                    onValueChange={(value) => setCompareVintage2(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectVintage} />
                    </SelectTrigger>
                    <SelectContent>
                      {vintages.map((vintage) => (
                        <SelectItem key={vintage.id} value={vintage.id.toString()}>
                          {formatDate(vintage.vintageDate)} (v{vintage.versionNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Compare button */}
              <Button
                onClick={() => {
                  if (compareVintage1 && compareVintage2) {
                    onCompare(compareVintage1, compareVintage2);
                  }
                }}
                disabled={!compareVintage1 || !compareVintage2}
                className="w-full"
              >
                <GitCompare className="h-4 w-4 mr-2" />
                {t.compare}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View history button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <History className="h-4 w-4 mr-2" />
            {t.viewHistory}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <History className="h-5 w-5" />
              {t.viewHistory}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {vintages.map((vintage, idx) => (
              <Card
                key={vintage.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/50",
                  vintage.id === currentVintageId && "ring-2 ring-primary"
                )}
                onClick={() => onVintageChange(vintage.id)}
              >
                <CardHeader className="pb-2">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <CardTitle className="text-sm font-medium">
                      {t.version} {vintage.versionNumber}
                    </CardTitle>
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      {idx === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {t.currentVersion}
                        </Badge>
                      )}
                      <Badge className={cn("text-xs", changeTypeColors[vintage.changeType])}>
                        {getChangeTypeLabel(vintage.changeType)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {formatDate(vintage.vintageDate)}
                  </p>

                  {vintage.changeDescription && (
                    <p className="text-sm">{vintage.changeDescription}</p>
                  )}

                  {vintage.changeSummary && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                        <p className="text-green-600 dark:text-green-400">+{vintage.changeSummary.recordsAdded}</p>
                        <p className="text-muted-foreground">{t.recordsAdded}</p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
                        <p className="text-blue-600 dark:text-blue-400">~{vintage.changeSummary.recordsModified}</p>
                        <p className="text-muted-foreground">{t.recordsModified}</p>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-950 rounded">
                        <p className="text-red-600 dark:text-red-400">-{vintage.changeSummary.recordsDeleted}</p>
                        <p className="text-muted-foreground">{t.recordsDeleted}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Compact version for embedding in data views
export function VintageIndicator({
  vintageDate,
  isLatest,
  language = "en",
}: {
  vintageDate: string;
  isLatest: boolean;
  language?: "en" | "ar";
}) {
  const t = translations[language];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Calendar className="h-3 w-3" />
      <span>{t.asOfDate}: {formatDate(vintageDate)}</span>
      {isLatest && (
        <Badge variant="secondary" className="text-xs h-4">
          {t.latestData}
        </Badge>
      )}
    </div>
  );
}

export default VintageSelector;
