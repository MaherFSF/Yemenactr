import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from "recharts";
import { 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  Download
} from "lucide-react";

interface ExchangeRateDataPoint {
  date: string;
  adenRate: number;
  sanaaRate: number;
  spread: number;
  event?: string;
  eventAr?: string;
}

interface EconomicEvent {
  date: string;
  title: string;
  titleAr: string;
  type: "positive" | "negative" | "neutral";
}

const generateHistoricalData = (): ExchangeRateDataPoint[] => {
  const data: ExchangeRateDataPoint[] = [];
  const startDate = new Date("2020-01-01");
  const endDate = new Date("2026-01-14");
  
  const events: Record<string, { en: string; ar: string }> = {
    "2020-03-15": { en: "COVID-19 Lockdowns Begin", ar: "بداية إغلاقات كوفيد-19" },
    "2020-08-01": { en: "Saudi Deposit Depleted", ar: "نفاد الوديعة السعودية" },
    "2021-06-15": { en: "New Banknote Controversy", ar: "جدل الأوراق النقدية الجديدة" },
    "2022-04-02": { en: "UN Truce Begins", ar: "بداية الهدنة الأممية" },
    "2022-10-02": { en: "UN Truce Expires", ar: "انتهاء الهدنة الأممية" },
    "2023-03-10": { en: "Saudi-Iran Rapprochement", ar: "التقارب السعودي-الإيراني" },
    "2024-01-15": { en: "Red Sea Shipping Crisis", ar: "أزمة الشحن في البحر الأحمر" },
    "2024-06-01": { en: "CBY Aden New Regulations", ar: "لوائح البنك المركزي عدن الجديدة" },
    "2025-01-17": { en: "OFAC Sanctions on YKB", ar: "عقوبات أوفاك على بنك اليمن والكويت" },
  };
  
  let adenRate = 600;
  let sanaaRate = 600;
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
    const dateStr = d.toISOString().split("T")[0];
    const year = d.getFullYear();
    const month = d.getMonth();
    
    if (year === 2020) {
      adenRate = 600 + Math.random() * 50 + (month * 10);
      sanaaRate = 600 + Math.random() * 20;
    } else if (year === 2021) {
      adenRate = 700 + Math.random() * 100 + (month * 20);
      sanaaRate = 600 + Math.random() * 30;
    } else if (year === 2022) {
      adenRate = 900 + Math.random() * 150 + (month * 25);
      sanaaRate = 560 + Math.random() * 40;
    } else if (year === 2023) {
      adenRate = 1200 + Math.random() * 200 + (month * 30);
      sanaaRate = 530 + Math.random() * 30;
    } else if (year === 2024) {
      adenRate = 1500 + Math.random() * 150 + (month * 15);
      sanaaRate = 530 + Math.random() * 20;
    } else if (year === 2025 || year === 2026) {
      adenRate = 1580 + Math.random() * 80;
      sanaaRate = 525 + Math.random() * 15;
    }
    
    const eventInfo = events[dateStr];
    
    data.push({
      date: dateStr,
      adenRate: Math.round(adenRate * 10) / 10,
      sanaaRate: Math.round(sanaaRate * 10) / 10,
      spread: Math.round((adenRate - sanaaRate) * 10) / 10,
      event: eventInfo?.en,
      eventAr: eventInfo?.ar,
    });
  }
  
  data[data.length - 1] = {
    date: "2026-01-14",
    adenRate: 1620,
    sanaaRate: 530,
    spread: 1090,
  };
  
  return data;
};

const economicEvents: EconomicEvent[] = [
  { date: "2020-03-15", title: "COVID-19 Lockdowns", titleAr: "إغلاقات كوفيد-19", type: "negative" },
  { date: "2022-04-02", title: "UN Truce", titleAr: "الهدنة الأممية", type: "positive" },
  { date: "2024-01-15", title: "Red Sea Crisis", titleAr: "أزمة البحر الأحمر", type: "negative" },
  { date: "2025-01-17", title: "OFAC Sanctions", titleAr: "عقوبات أوفاك", type: "negative" },
];

interface ExchangeRateChartProps {
  showTitle?: boolean;
  height?: number;
  compact?: boolean;
}

export default function ExchangeRateChart({ 
  showTitle = true, 
  height = 400,
  compact = false 
}: ExchangeRateChartProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  
  const [timeRange, setTimeRange] = useState<"1W" | "1M" | "3M" | "1Y" | "5Y" | "ALL">("1Y");
  const [showEvents, setShowEvents] = useState(true);
  const [showSpread, setShowSpread] = useState(false);
  
  const allData = useMemo(() => generateHistoricalData(), []);
  
  const filteredData = useMemo(() => {
    const now = new Date("2026-01-14");
    let startDate: Date;
    
    switch (timeRange) {
      case "1W":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "1M":
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "3M":
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "1Y":
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "5Y":
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      case "ALL":
      default:
        return allData;
    }
    
    return allData.filter(d => new Date(d.date) >= startDate);
  }, [allData, timeRange]);
  
  const stats = useMemo(() => {
    if (filteredData.length < 2) return null;
    
    const first = filteredData[0];
    const last = filteredData[filteredData.length - 1];
    const adenChange = ((last.adenRate - first.adenRate) / first.adenRate) * 100;
    const maxAden = Math.max(...filteredData.map(d => d.adenRate));
    const minAden = Math.min(...filteredData.map(d => d.adenRate));
    const avgAden = filteredData.reduce((sum, d) => sum + d.adenRate, 0) / filteredData.length;
    
    return {
      adenChange: adenChange.toFixed(1),
      maxAden: maxAden.toFixed(0),
      minAden: minAden.toFixed(0),
      avgAden: avgAden.toFixed(0),
      currentSpread: (last.adenRate - last.sanaaRate).toFixed(0),
    };
  }, [filteredData]);
  
  const content = {
    title: { en: "Exchange Rate Trends", ar: "اتجاهات سعر الصرف" },
    subtitle: { en: "Historical USD/YER exchange rates comparison", ar: "مقارنة أسعار صرف الدولار/الريال التاريخية" },
    adenRate: { en: "Aden Rate (IRG)", ar: "سعر عدن (الشرعية)" },
    sanaaRate: { en: "Sana'a Rate (DFA)", ar: "سعر صنعاء (الأمر الواقع)" },
    spread: { en: "Spread", ar: "الفارق" },
    showEvents: { en: "Show Events", ar: "إظهار الأحداث" },
    showSpread: { en: "Show Spread", ar: "إظهار الفارق" },
    change: { en: "Change", ar: "التغير" },
    high: { en: "High", ar: "الأعلى" },
    low: { en: "Low", ar: "الأدنى" },
    average: { en: "Average", ar: "المتوسط" },
    currentSpread: { en: "Current Spread", ar: "الفارق الحالي" },
    exportData: { en: "Export Data", ar: "تصدير البيانات" },
    yerPerUsd: { en: "YER/USD", ar: "ريال/دولار" },
  };
  
  const t = (key: keyof typeof content) => isArabic ? content[key].ar : content[key].en;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const dataPoint = payload[0]?.payload as ExchangeRateDataPoint;
    const formattedDate = new Date(label).toLocaleDateString(isArabic ? "ar-YE" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
        <p className="font-semibold text-sm mb-2">{formattedDate}</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              {t("adenRate")}
            </span>
            <span className="font-mono font-semibold">{dataPoint?.adenRate?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-600 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              {t("sanaaRate")}
            </span>
            <span className="font-mono font-semibold">{dataPoint?.sanaaRate?.toLocaleString()}</span>
          </div>
          {showSpread && (
            <div className="flex justify-between items-center pt-1 border-t">
              <span className="text-sm text-orange-600">{t("spread")}</span>
              <span className="font-mono font-semibold">{dataPoint?.spread?.toLocaleString()}</span>
            </div>
          )}
        </div>
        {dataPoint?.event && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center gap-1 text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs font-medium">
                {isArabic ? dataPoint.eventAr : dataPoint.event}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const handleExport = () => {
    const csvContent = [
      ["Date", "Aden Rate", "Sana'a Rate", "Spread"].join(","),
      ...filteredData.map(d => [d.date, d.adenRate, d.sanaaRate, d.spread].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exchange-rates-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <Card className={compact ? "border-0 shadow-none" : ""}>
      {showTitle && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                {t("title")}
              </CardTitle>
              <CardDescription>{t("subtitle")}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" />
              {t("exportData")}
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <TabsList className="h-8">
              <TabsTrigger value="1W" className="text-xs px-2">1W</TabsTrigger>
              <TabsTrigger value="1M" className="text-xs px-2">1M</TabsTrigger>
              <TabsTrigger value="3M" className="text-xs px-2">3M</TabsTrigger>
              <TabsTrigger value="1Y" className="text-xs px-2">1Y</TabsTrigger>
              <TabsTrigger value="5Y" className="text-xs px-2">5Y</TabsTrigger>
              <TabsTrigger value="ALL" className="text-xs px-2">ALL</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button
              variant={showEvents ? "default" : "outline"}
              size="sm"
              onClick={() => setShowEvents(!showEvents)}
              className="text-xs"
            >
              <Calendar className="w-3 h-3 mr-1" />
              {t("showEvents")}
            </Button>
            <Button
              variant={showSpread ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSpread(!showSpread)}
              className="text-xs"
            >
              {t("showSpread")}
            </Button>
          </div>
        </div>
        
        {stats && !compact && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{t("change")} (Aden)</p>
              <p className={`text-lg font-bold ${Number(stats.adenChange) > 0 ? "text-red-600" : "text-green-600"}`}>
                {Number(stats.adenChange) > 0 ? "+" : ""}{stats.adenChange}%
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{t("high")}</p>
              <p className="text-lg font-bold">{Number(stats.maxAden).toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{t("low")}</p>
              <p className="text-lg font-bold">{Number(stats.minAden).toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{t("average")}</p>
              <p className="text-lg font-bold">{Number(stats.avgAden).toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{t("currentSpread")}</p>
              <p className="text-lg font-bold text-orange-600">{Number(stats.currentSpread).toLocaleString()}</p>
            </div>
          </div>
        )}
        
        <div style={{ height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => {
                  const d = new Date(date);
                  if (timeRange === "1W" || timeRange === "1M") {
                    return d.toLocaleDateString(isArabic ? "ar-YE" : "en-US", { month: "short", day: "numeric" });
                  }
                  return d.toLocaleDateString(isArabic ? "ar-YE" : "en-US", { year: "2-digit", month: "short" });
                }}
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="left"
                domain={["auto", "auto"]}
                tickFormatter={(value) => value.toLocaleString()}
                tick={{ fontSize: 11 }}
                label={{ 
                  value: t("yerPerUsd"), 
                  angle: -90, 
                  position: "insideLeft",
                  style: { textAnchor: "middle", fontSize: 11 }
                }}
              />
              {showSpread && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={["auto", "auto"]}
                  tickFormatter={(value) => value.toLocaleString()}
                  tick={{ fontSize: 11 }}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
                formatter={(value) => {
                  if (value === "adenRate") return t("adenRate");
                  if (value === "sanaaRate") return t("sanaaRate");
                  if (value === "spread") return t("spread");
                  return value;
                }}
              />
              
              {showEvents && economicEvents
                .filter(e => filteredData.some(d => d.date === e.date))
                .map((event, i) => (
                  <ReferenceLine
                    key={i}
                    x={event.date}
                    yAxisId="left"
                    stroke={event.type === "positive" ? "#22c55e" : event.type === "negative" ? "#ef4444" : "#6b7280"}
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                    label={{
                      value: isArabic ? event.titleAr : event.title,
                      position: "top",
                      fill: event.type === "positive" ? "#22c55e" : event.type === "negative" ? "#ef4444" : "#6b7280",
                      fontSize: 10,
                      angle: -45,
                    }}
                  />
                ))
              }
              
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="adenRate"
                name="adenRate"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sanaaRate"
                name="sanaaRate"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              
              {showSpread && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="spread"
                  name="spread"
                  stroke="#f97316"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
              
              <Brush 
                dataKey="date" 
                height={30} 
                stroke="#10b981"
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return d.toLocaleDateString(isArabic ? "ar-YE" : "en-US", { year: "2-digit", month: "short" });
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {showEvents && !compact && (
          <div className="flex flex-wrap gap-3 pt-2 border-t">
            <span className="text-xs text-muted-foreground">{isArabic ? "الأحداث:" : "Events:"}</span>
            {economicEvents
              .filter(e => filteredData.some(d => d.date === e.date))
              .map((event, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className={`text-xs ${
                    event.type === "positive" ? "border-green-500 text-green-600" :
                    event.type === "negative" ? "border-red-500 text-red-600" :
                    "border-gray-500 text-gray-600"
                  }`}
                >
                  {isArabic ? event.titleAr : event.title}
                </Badge>
              ))
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}
