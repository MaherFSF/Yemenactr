import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  X,
  Maximize2,
  Minimize2,
  Bell,
  ChevronUp,
  ChevronDown,
  Activity,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Currency pair definitions
const CURRENCY_PAIRS = [
  { code: "USD", name: "US Dollar", nameAr: "دولار أمريكي", flag: "🇺🇸" },
  { code: "SAR", name: "Saudi Riyal", nameAr: "ريال سعودي", flag: "🇸🇦" },
  { code: "EUR", name: "Euro", nameAr: "يورو", flag: "🇪🇺" },
  { code: "AED", name: "UAE Dirham", nameAr: "درهم إماراتي", flag: "🇦🇪" },
];

// Regime definitions
const REGIMES = [
  { id: "aden", name: "Aden (IRG)", nameAr: "عدن (الحكومة)", color: "bg-blue-500" },
  { id: "sanaa", name: "Sana'a (DFA)", nameAr: "صنعاء (أنصار الله)", color: "bg-red-500" },
];

interface ExchangeRate {
  currency: string;
  regime: string;
  rate: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  lastUpdated: Date;
  source: string;
  confidence: "A" | "B" | "C";
}

interface ExchangeRateWidgetProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  defaultMinimized?: boolean;
  showAlerts?: boolean;
  refreshInterval?: number; // in seconds
}

export default function ExchangeRateWidget({
  position = "bottom-right",
  defaultMinimized = false,
  showAlerts = true,
  refreshInterval = 300, // 5 minutes default
}: ExchangeRateWidgetProps) {
  const { language } = useLanguage();
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [alerts, setAlerts] = useState<string[]>([]);

  // Mock exchange rate data - in production would come from tRPC
  const [rates, setRates] = useState<ExchangeRate[]>([
    {
      currency: "USD",
      regime: "aden",
      rate: 1620,
      change: 15,
      changePercent: 0.93,
      trend: "up",
      lastUpdated: new Date(),
      source: "CBY Aden",
      confidence: "A",
    },
    {
      currency: "USD",
      regime: "sanaa",
      rate: 530,
      change: 0,
      changePercent: 0,
      trend: "stable",
      lastUpdated: new Date(),
      source: "CBY Sanaa",
      confidence: "A",
    },
    {
      currency: "SAR",
      regime: "aden",
      rate: 432,
      change: 4,
      changePercent: 0.93,
      trend: "up",
      lastUpdated: new Date(),
      source: "Money Exchangers",
      confidence: "B",
    },
    {
      currency: "SAR",
      regime: "sanaa",
      rate: 141,
      change: 0,
      changePercent: 0,
      trend: "stable",
      lastUpdated: new Date(),
      source: "Money Exchangers",
      confidence: "B",
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRates(prev => prev.map(rate => {
        // Simulate small random changes
        const randomChange = (Math.random() - 0.5) * 10;
        const newRate = rate.rate + randomChange;
        const change = newRate - rate.rate;
        const changePercent = (change / rate.rate) * 100;
        
        return {
          ...rate,
          rate: Math.round(newRate),
          change: Math.round(change),
          changePercent: Number(changePercent.toFixed(2)),
          trend: change > 0.5 ? "up" : change < -0.5 ? "down" : "stable",
          lastUpdated: new Date(),
        };
      }));
      setLastRefresh(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  }, []);

  // Get rates for selected currency
  const currentRates = rates.filter(r => r.currency === selectedCurrency);
  const adenRate = currentRates.find(r => r.regime === "aden");
  const sanaaRate = currentRates.find(r => r.regime === "sanaa");
  const spread = adenRate && sanaaRate 
    ? ((adenRate.rate - sanaaRate.rate) / sanaaRate.rate * 100).toFixed(1)
    : "0";

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-20 right-4",
    "top-left": "top-20 left-4",
  };

  // Trend icon
  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    if (trend === "up") return <TrendingUp className="h-3 w-3 text-red-500" />;
    if (trend === "down") return <TrendingDown className="h-3 w-3 text-green-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  // Minimized view
  if (isMinimized) {
    return (
      <div className={cn("fixed z-50", positionClasses[position])}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsMinimized(false)}
                className="h-14 w-14 rounded-full bg-[#103050] hover:bg-[#1a4060] shadow-lg"
              >
                <div className="flex flex-col items-center">
                  <Activity className="h-5 w-5 text-[#C0A030]" />
                  <span className="text-[10px] text-white mt-0.5">
                    {adenRate?.rate.toLocaleString()}
                  </span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{language === "ar" ? "سعر الصرف الحي" : "Live Exchange Rate"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed z-50 transition-all duration-300",
      positionClasses[position],
      isExpanded ? "w-96" : "w-72"
    )}>
      <Card className="shadow-xl border-2 border-[#103050]/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#103050] to-[#1a4060] text-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#C0A030]" />
              <span className="font-semibold text-sm">
                {language === "ar" ? "سعر الصرف الحي" : "Live Exchange Rate"}
              </span>
              <Badge variant="outline" className="text-[10px] border-[#C0A030] text-[#C0A030]">
                LIVE
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setIsMinimized(true)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Currency selector */}
          <div className="flex gap-1 mt-2">
            {CURRENCY_PAIRS.map(currency => (
              <Button
                key={currency.code}
                variant={selectedCurrency === currency.code ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs",
                  selectedCurrency === currency.code 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
                onClick={() => setSelectedCurrency(currency.code)}
              >
                <span className="mr-1">{currency.flag}</span>
                {currency.code}
              </Button>
            ))}
          </div>
        </div>

        <CardContent className="p-3 space-y-3">
          {/* Main rates display */}
          <div className="grid grid-cols-2 gap-3">
            {/* Aden Rate */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                  {language === "ar" ? "عدن" : "Aden"}
                </span>
                <Badge className="h-4 text-[8px] bg-blue-500">IRG</Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {adenRate?.rate.toLocaleString()}
                </span>
                <span className="text-[10px] text-blue-600/70">YER</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon trend={adenRate?.trend || "stable"} />
                <span className={cn(
                  "text-[10px] font-medium",
                  adenRate?.trend === "up" ? "text-red-500" : 
                  adenRate?.trend === "down" ? "text-green-500" : "text-gray-500"
                )}>
                  {(adenRate?.change ?? 0) > 0 ? "+" : ""}{adenRate?.change ?? 0} ({adenRate?.changePercent}%)
                </span>
              </div>
            </div>

            {/* Sanaa Rate */}
            <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-red-600 dark:text-red-400">
                  {language === "ar" ? "صنعاء" : "Sana'a"}
                </span>
                <Badge className="h-4 text-[8px] bg-red-500">DFA</Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-red-700 dark:text-red-300">
                  {sanaaRate?.rate.toLocaleString()}
                </span>
                <span className="text-[10px] text-red-600/70">YER</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon trend={sanaaRate?.trend || "stable"} />
                <span className={cn(
                  "text-[10px] font-medium",
                  sanaaRate?.trend === "up" ? "text-red-500" : 
                  sanaaRate?.trend === "down" ? "text-green-500" : "text-gray-500"
                )}>
                  {(sanaaRate?.change ?? 0) > 0 ? "+" : ""}{sanaaRate?.change ?? 0} ({sanaaRate?.changePercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Spread indicator */}
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                {language === "ar" ? "الفارق بين المنطقتين" : "Regional Spread"}
              </span>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  {spread}%
                </span>
              </div>
            </div>
            <div className="w-full bg-amber-200 dark:bg-amber-900 rounded-full h-1.5 mt-1">
              <div 
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Number(spread), 300) / 3}%` }}
              />
            </div>
          </div>

          {/* Expanded view - Mini sparklines */}
          {isExpanded && (
            <div className="space-y-2 pt-2 border-t">
              <div className="text-[10px] font-medium text-muted-foreground">
                {language === "ar" ? "اتجاه 7 أيام" : "7-Day Trend"}
              </div>
              <div className="h-12 bg-muted/30 rounded flex items-end justify-around px-2">
                {/* Mini sparkline bars */}
                {[65, 70, 68, 72, 75, 73, 78].map((height, i) => (
                  <div
                    key={i}
                    className="w-2 bg-[#107040] rounded-t transition-all duration-300"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {language === "ar" ? "آخر تحديث:" : "Updated:"}{" "}
                {lastRefresh.toLocaleTimeString(language === "ar" ? "ar-YE" : "en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="h-4 text-[8px]">
                    {adenRate?.confidence}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{language === "ar" ? "مستوى الثقة" : "Confidence Level"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
