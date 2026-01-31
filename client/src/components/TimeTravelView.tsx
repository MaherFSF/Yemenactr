import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Clock, 
  History, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertCircle,
  FileText,
  ArrowRight
} from "lucide-react";
import DataQualityBadge from "./DataQualityBadge";

interface Vintage {
  id: string;
  date: string;
  value: string;
  source: string;
  sourceAr: string;
  confidence: "A" | "B" | "C";
  notes?: string;
  notesAr?: string;
}

interface TimeTravelViewProps {
  indicatorId: string;
  indicatorNameEn: string;
  indicatorNameAr: string;
  currentValue: string;
  unit: string;
  vintages: Vintage[];
}

export default function TimeTravelView({
  indicatorId,
  indicatorNameEn,
  indicatorNameAr,
  currentValue,
  unit,
  vintages
}: TimeTravelViewProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [selectedVintage, setSelectedVintage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Sample vintages if none provided
  const sampleVintages: Vintage[] = vintages.length > 0 ? vintages : [
    {
      id: "v1",
      date: "2024-12-28",
      value: currentValue,
      source: "Current estimate",
      sourceAr: "التقدير الحالي",
      confidence: "B",
      notes: "Latest available data",
      notesAr: "أحدث البيانات المتاحة"
    },
    {
      id: "v2",
      date: "2024-11-15",
      value: "Previous value",
      source: "Monthly update",
      sourceAr: "التحديث الشهري",
      confidence: "B",
      notes: "Revised from initial estimate",
      notesAr: "منقح من التقدير الأولي"
    },
    {
      id: "v3",
      date: "2024-10-01",
      value: "Earlier value",
      source: "Quarterly report",
      sourceAr: "التقرير الربع سنوي",
      confidence: "A",
      notes: "Official quarterly release",
      notesAr: "الإصدار الربع سنوي الرسمي"
    },
  ];

  const displayVintages = sampleVintages;
  const selectedVintageData = displayVintages.find(v => v.id === selectedVintage);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-gray-500 hover:text-[#4C583E]">
          <History className="h-4 w-4" />
          {isArabic ? "عرض التاريخ" : "View History"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" dir={isArabic ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#4C583E]" />
            {isArabic ? "السفر عبر الزمن: ماذا كان معروفاً ومتى" : "Time Travel: What Was Known When"}
          </DialogTitle>
          <DialogDescription>
            {isArabic 
              ? `عرض الإصدارات التاريخية لـ "${indicatorNameAr}"`
              : `View historical vintages for "${indicatorNameEn}"`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Value */}
          <Card className="bg-[#768064]/5 border-[#768064]/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    {isArabic ? "القيمة الحالية" : "Current Value"}
                  </div>
                  <div className="text-2xl font-bold text-[#768064]">
                    {currentValue} {unit}
                  </div>
                </div>
                <Badge className="bg-[#4C583E]">
                  {isArabic ? "أحدث" : "Latest"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Vintage Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {isArabic ? "اختر تاريخاً للعرض" : "Select a date to view"}
            </label>
            <Select value={selectedVintage || ""} onValueChange={setSelectedVintage}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder={isArabic ? "اختر إصداراً" : "Select a vintage"} />
              </SelectTrigger>
              <SelectContent>
                {displayVintages.map((vintage) => (
                  <SelectItem key={vintage.id} value={vintage.id}>
                    {new Date(vintage.date).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Vintage Details */}
          {selectedVintageData && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>
                    {new Date(selectedVintageData.date).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <DataQualityBadge 
                    quality={selectedVintageData.confidence === "A" ? "verified" : selectedVintageData.confidence === "B" ? "provisional" : "experimental"} 
                    size="sm" 
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-500">
                    {isArabic ? "القيمة في ذلك الوقت" : "Value at that time"}
                  </span>
                  <span className="font-bold text-lg">{selectedVintageData.value} {unit}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    {isArabic ? "المصدر" : "Source"}
                  </span>
                  <span className="font-medium">
                    {isArabic ? selectedVintageData.sourceAr : selectedVintageData.source}
                  </span>
                </div>

                {selectedVintageData.notes && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {isArabic ? selectedVintageData.notesAr : selectedVintageData.notes}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-medium mb-3">
              {isArabic ? "الجدول الزمني للإصدارات" : "Vintage Timeline"}
            </h4>
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-4">
                {displayVintages.map((vintage, index) => (
                  <div 
                    key={vintage.id}
                    className={`relative flex items-start gap-4 pl-10 cursor-pointer transition-colors ${
                      selectedVintage === vintage.id ? 'bg-[#4C583E]/10 -mx-4 px-4 py-2 rounded-lg' : ''
                    }`}
                    onClick={() => setSelectedVintage(vintage.id)}
                  >
                    <div className={`absolute left-2 w-4 h-4 rounded-full border-2 ${
                      index === 0 
                        ? 'bg-[#4C583E] border-[#4C583E]' 
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {new Date(vintage.date).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-sm font-bold">{vintage.value}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {isArabic ? vintage.sourceAr : vintage.source}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  {isArabic ? "لماذا هذا مهم؟" : "Why does this matter?"}
                </h5>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {isArabic 
                    ? "البيانات الاقتصادية تُراجع بشكل متكرر. فهم ما كان معروفاً في وقت معين أمر حاسم لتحليل القرارات السياسية وتقييم دقة التنبؤات."
                    : "Economic data is frequently revised. Understanding what was known at a specific time is crucial for analyzing policy decisions and evaluating forecast accuracy."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compact version for inline use
export function TimeTravelBadge({ date, onClick }: { date: string; onClick?: () => void }) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 gap-1"
            onClick={onClick}
          >
            <Clock className="h-3 w-3" />
            {new Date(date).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US', {
              year: 'numeric',
              month: 'short'
            })}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {isArabic ? "انقر لعرض الإصدارات التاريخية" : "Click to view historical vintages"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
