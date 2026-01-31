import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Info,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ExternalLink,
  FileText
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Insight {
  id: string;
  type: "increase" | "decrease" | "alert" | "info";
  titleEn: string;
  titleAr: string;
  valueEn: string;
  valueAr: string;
  changeEn?: string;
  changeAr?: string;
  sector: string;
  timestamp: string;
  confidence: "A" | "B" | "C" | "D";
  sources: {
    name: string;
    url?: string;
    date: string;
  }[];
}

const insights: Insight[] = [
  {
    id: "1",
    type: "increase",
    titleEn: "Aden Exchange Rate",
    titleAr: "سعر الصرف - عدن",
    valueEn: "1,620 YER/USD",
    valueAr: "1,620 ريال/دولار",
    changeEn: "+2.3% this week",
    changeAr: "+2.3% هذا الأسبوع",
    sector: "currency",
    timestamp: "2024-12-28T10:00:00Z",
    confidence: "A",
    sources: [
      { name: "Central Bank of Yemen - Aden", url: "https://cby-ye.com", date: "2024-12-28" },
      { name: "Al-Kuraimi Exchange", date: "2024-12-28" }
    ]
  },
  {
    id: "2",
    type: "decrease",
    titleEn: "Wheat Flour Price - Sana'a",
    titleAr: "سعر دقيق القمح - صنعاء",
    valueEn: "12,500 YER/50kg",
    valueAr: "12,500 ريال/50كغ",
    changeEn: "-1.5% from last month",
    changeAr: "-1.5% عن الشهر الماضي",
    sector: "food",
    timestamp: "2024-12-27T14:00:00Z",
    confidence: "B",
    sources: [
      { name: "WFP Market Monitor", url: "https://dataviz.vam.wfp.org", date: "2024-12-27" }
    ]
  },
  {
    id: "3",
    type: "alert",
    titleEn: "Fuel Shortage Alert - Hudaydah",
    titleAr: "تنبيه نقص الوقود - الحديدة",
    valueEn: "Critical levels reported",
    valueAr: "مستويات حرجة",
    sector: "energy",
    timestamp: "2024-12-28T08:00:00Z",
    confidence: "B",
    sources: [
      { name: "OCHA Situation Report", url: "https://reliefweb.int", date: "2024-12-28" },
      { name: "Local market surveys", date: "2024-12-27" }
    ]
  },
  {
    id: "4",
    type: "info",
    titleEn: "New CBY-Aden Monetary Policy",
    titleAr: "سياسة نقدية جديدة للبنك المركزي - عدن",
    valueEn: "Interest rate unchanged at 27%",
    valueAr: "سعر الفائدة ثابت عند 27%",
    sector: "banking",
    timestamp: "2024-12-26T12:00:00Z",
    confidence: "A",
    sources: [
      { name: "CBY-Aden Official Statement", url: "https://cby-ye.com", date: "2024-12-26" }
    ]
  },
  {
    id: "5",
    type: "increase",
    titleEn: "Remittance Inflows",
    titleAr: "تدفقات التحويلات",
    valueEn: "$320M estimated Q4",
    valueAr: "320 مليون دولار تقديري للربع الرابع",
    changeEn: "+8% YoY",
    changeAr: "+8% سنوياً",
    sector: "banking",
    timestamp: "2024-12-25T09:00:00Z",
    confidence: "C",
    sources: [
      { name: "World Bank Remittance Data", url: "https://data.worldbank.org", date: "2024-12-20" },
      { name: "Exchange house estimates", date: "2024-12-24" }
    ]
  },
  {
    id: "6",
    type: "decrease",
    titleEn: "Oil Production - Marib",
    titleAr: "إنتاج النفط - مأرب",
    valueEn: "~18,000 bpd",
    valueAr: "~18,000 برميل/يوم",
    changeEn: "-12% from 2023",
    changeAr: "-12% عن 2023",
    sector: "energy",
    timestamp: "2024-12-24T16:00:00Z",
    confidence: "C",
    sources: [
      { name: "Industry estimates", date: "2024-12-20" },
      { name: "Satellite imagery analysis", date: "2024-12-15" }
    ]
  }
];

export default function InsightsTicker() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "increase":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "decrease":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-500",
      B: "bg-blue-500",
      C: "bg-yellow-500",
      D: "bg-red-500"
    };
    return (
      <Badge className={`${colors[confidence]} text-xs`}>
        {isArabic ? `ثقة ${confidence}` : `Conf. ${confidence}`}
      </Badge>
    );
  };

  const currentInsight = insights[currentIndex];

  return (
    <div 
      className="bg-gradient-to-r from-[#103050] to-[#1a4a70] text-white py-2 sticky top-0 z-50"
      dir={isArabic ? "rtl" : "ltr"}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <div className="flex items-center justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
              onClick={goToPrevious}
            >
              {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
              onClick={goToNext}
            >
              {isArabic ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {/* Insight Content */}
          <div className="flex-1 flex items-center gap-3 overflow-hidden">
            <div className="flex items-center gap-2">
              {getTypeIcon(currentInsight.type)}
              <span className="font-medium text-sm">
                {isArabic ? currentInsight.titleAr : currentInsight.titleEn}:
              </span>
            </div>
            <span className="text-sm text-white/90">
              {isArabic ? currentInsight.valueAr : currentInsight.valueEn}
            </span>
            {currentInsight.changeEn && (
              <span className={`text-xs ${currentInsight.type === 'increase' ? 'text-green-300' : currentInsight.type === 'decrease' ? 'text-red-300' : 'text-white/70'}`}>
                {isArabic ? currentInsight.changeAr : currentInsight.changeEn}
              </span>
            )}
            {getConfidenceBadge(currentInsight.confidence)}
          </div>

          {/* Evidence Pack Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-white/70 hover:text-white hover:bg-white/10 gap-1"
                onClick={() => setSelectedInsight(currentInsight)}
              >
                <FileText className="h-3 w-3" />
                {isArabic ? "الأدلة" : "Evidence"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" dir={isArabic ? "rtl" : "ltr"}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(currentInsight.type)}
                  {isArabic ? currentInsight.titleAr : currentInsight.titleEn}
                </DialogTitle>
                <DialogDescription>
                  {isArabic ? "حزمة الأدلة والمصادر" : "Evidence Pack & Sources"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Value */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">
                    {isArabic ? "القيمة" : "Value"}
                  </div>
                  <div className="text-lg font-semibold">
                    {isArabic ? currentInsight.valueAr : currentInsight.valueEn}
                  </div>
                  {currentInsight.changeEn && (
                    <div className={`text-sm ${currentInsight.type === 'increase' ? 'text-green-600' : currentInsight.type === 'decrease' ? 'text-red-600' : 'text-gray-600'}`}>
                      {isArabic ? currentInsight.changeAr : currentInsight.changeEn}
                    </div>
                  )}
                </div>

                {/* Confidence */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {isArabic ? "مستوى الثقة" : "Confidence Level"}
                  </span>
                  {getConfidenceBadge(currentInsight.confidence)}
                </div>

                {/* Timestamp */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {isArabic ? "آخر تحديث" : "Last Updated"}
                  </span>
                  <span className="text-sm">
                    {new Date(currentInsight.timestamp).toLocaleDateString(isArabic ? 'ar-YE' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Sources */}
                <div>
                  <div className="text-sm font-medium mb-2">
                    {isArabic ? "المصادر" : "Sources"}
                  </div>
                  <div className="space-y-2">
                    {currentInsight.sources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>{source.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">{source.date}</span>
                          {source.url && (
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Methodology Note */}
                <div className="text-xs text-gray-500 border-t pt-3">
                  {isArabic 
                    ? "يتم التحقق من جميع البيانات من مصادر متعددة. مستوى الثقة A يعني تأكيد من مصدر رسمي، B يعني مصادر موثوقة متعددة، C يعني تقديرات، D يعني بيانات أولية."
                    : "All data is verified from multiple sources. Confidence A means official source confirmation, B means multiple reliable sources, C means estimates, D means preliminary data."}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Progress Dots */}
          <div className="flex items-center gap-1">
            {insights.map((_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-3' : 'bg-white/40'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
