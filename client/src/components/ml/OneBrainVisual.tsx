import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Calendar,
  BarChart3,
  PieChartIcon,
  Activity,
  AlertCircle,
} from "lucide-react";

interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  labelAr?: string;
  category?: string;
  regime?: "aden" | "sanaa" | "unified";
  confidence?: number;
  upperBound?: number;
  lowerBound?: number;
}

interface ChartConfig {
  type: "line" | "bar" | "pie" | "area" | "scatter" | "timeline" | "comparison";
  title: string;
  titleAr: string;
  subtitle?: string;
  subtitleAr?: string;
  data: ChartDataPoint[];
  xAxis?: {
    label: string;
    labelAr: string;
    unit?: string;
    unitAr?: string;
  };
  yAxis?: {
    label: string;
    labelAr: string;
    unit?: string;
    unitAr?: string;
  };
  annotations?: Array<{
    x: string | number;
    y?: number;
    text: string;
    textAr: string;
    type: "event" | "threshold" | "trend" | "insight";
    importance: "high" | "medium" | "low";
  }>;
  sources: string[];
  confidenceLevel: "A" | "B" | "C" | "D";
}

interface VisualInsight {
  type: "chart" | "timeline" | "comparison" | "map" | "table";
  config: ChartConfig;
  narrative: string;
  narrativeAr: string;
  keyTakeaways: string[];
  keyTakeawaysAr: string[];
}

interface OneBrainVisualProps {
  visualization: VisualInsight | null;
  className?: string;
}

const COLORS = {
  primary: "#107040",
  secondary: "#103050",
  accent: "#C0A030",
  aden: "#107040",
  sanaa: "#103050",
  unified: "#6B7280",
  chart: ["#107040", "#103050", "#C0A030", "#4A90E2", "#E74C3C", "#9B59B6"],
};

export default function OneBrainVisual({ visualization, className = "" }: OneBrainVisualProps) {
  const { language } = useLanguage();

  if (!visualization || !visualization.config) {
    return null;
  }

  const config = visualization.config as ChartConfig;
  const title = language === "ar" ? config.titleAr : config.title;
  const subtitle = language === "ar" ? config.subtitleAr : config.subtitle;
  const narrative = language === "ar" ? visualization.narrativeAr : visualization.narrative;
  const takeaways = language === "ar" ? visualization.keyTakeawaysAr : visualization.keyTakeaways;

  const chartData = useMemo(() => {
    return config.data.map((point, index) => ({
      name: point.label || (language === "ar" ? point.labelAr : String(point.x)),
      value: point.y,
      x: point.x,
      regime: point.regime,
      upperBound: point.upperBound,
      lowerBound: point.lowerBound,
      fill: point.regime === "aden" ? COLORS.aden : point.regime === "sanaa" ? COLORS.sanaa : COLORS.chart[index % COLORS.chart.length],
    }));
  }, [config.data, language]);

  const getConfidenceBadge = (level: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      B: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      C: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      D: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    const labels: Record<string, { en: string; ar: string }> = {
      A: { en: "High Confidence", ar: "ثقة عالية" },
      B: { en: "Good Confidence", ar: "ثقة جيدة" },
      C: { en: "Moderate Confidence", ar: "ثقة متوسطة" },
      D: { en: "Low Confidence", ar: "ثقة منخفضة" },
    };
    return (
      <Badge className={colors[level] || colors.C}>
        {language === "ar" ? labels[level]?.ar : labels[level]?.en}
      </Badge>
    );
  };

  const renderChart = () => {
    switch (config.type) {
      case "line":
      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={COLORS.primary}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
              {config.data.some(d => d.upperBound) && (
                <>
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke={COLORS.primary}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke={COLORS.primary}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    fill="none"
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "bar":
      case "comparison":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <AlertCircle className="h-5 w-5 mr-2" />
            {language === "ar" ? "نوع الرسم البياني غير مدعوم" : "Chart type not supported"}
          </div>
        );
    }
  };

  const getChartIcon = () => {
    switch (config.type) {
      case "line":
      case "area":
        return <Activity className="h-5 w-5" />;
      case "bar":
      case "comparison":
        return <BarChart3 className="h-5 w-5" />;
      case "pie":
        return <PieChartIcon className="h-5 w-5" />;
      case "timeline":
        return <Calendar className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getChartIcon()}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {getConfidenceBadge(config.confidenceLevel)}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="mb-4">
          {renderChart()}
        </div>

        {/* Narrative */}
        {narrative && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{narrative}</p>
            </div>
          </div>
        )}

        {/* Key Takeaways */}
        {takeaways && takeaways.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#107040]" />
              {language === "ar" ? "النقاط الرئيسية" : "Key Takeaways"}
            </h4>
            <ul className="space-y-1">
              {takeaways.map((takeaway, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-[#107040] font-bold">•</span>
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources */}
        {config.sources && config.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              {language === "ar" ? "المصادر: " : "Sources: "}
              {config.sources.join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
