import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { EvidencePack, type Source } from "@/components/EvidencePack";

interface KPICardProps {
  title: string;
  titleAr?: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  sparklineData?: number[];
  regime?: "aden" | "sanaa" | "mixed";
  confidenceLevel?: "A" | "B" | "C" | "D";
  source?: string;
  sources?: Source[];
  methodology?: string;
  methodologyAr?: string;
  lastUpdated?: string;
  className?: string;
}

const confidenceColors = {
  A: "bg-green-500/20 text-green-700 border-green-500/30",
  B: "bg-blue-500/20 text-[#2e8b6e] border-blue-500/30",
  C: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  D: "bg-red-500/20 text-red-700 border-red-500/30",
};

const regimeColors = {
  aden: "#2e8b6e",
  sanaa: "#2e8b6e",
  mixed: "#C0A030",
};

const regimeLabels = {
  aden: "Aden (IRG)",
  sanaa: "Sana'a (DFA)",
  mixed: "National",
};

export function KPICard({
  title,
  titleAr,
  value,
  unit,
  change,
  changeLabel,
  sparklineData,
  regime = "mixed",
  confidenceLevel = "B",
  source,
  sources,
  methodology,
  methodologyAr,
  lastUpdated,
  className,
}: KPICardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return "text-muted-foreground";
    if (change > 0) return "text-green-600";
    return "text-red-600";
  };

  const sparklineChartData = sparklineData?.map((v, i) => ({ value: v })) || [];

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: regimeColors[regime] }}
      />
      <CardContent className="p-4 pl-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {titleAr && (
              <p className="text-xs text-muted-foreground" dir="rtl">
                {titleAr}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {regimeLabels[regime]}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${confidenceColors[confidenceLevel]}`}>
                    {confidenceLevel}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    Confidence Level {confidenceLevel}
                    {source && <><br />Source: {source}</>}
                    {lastUpdated && <><br />Updated: {lastUpdated}</>}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {sources && sources.length > 0 && (
              <EvidencePack
                indicatorName={title}
                indicatorNameAr={titleAr}
                value={value}
                unit={unit}
                date={new Date().toISOString()}
                sources={sources}
                methodology={methodology}
                methodologyAr={methodologyAr}
                lastUpdated={lastUpdated || new Date().toLocaleDateString()}
                confidence={confidenceLevel === "A" ? "high" : confidenceLevel === "B" || confidenceLevel === "C" ? "medium" : "low"}
                variant="icon"
                className="h-5 w-5 p-0"
              />
            )}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</span>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{change > 0 ? "+" : ""}{change}%</span>
                {changeLabel && <span className="text-muted-foreground text-xs">({changeLabel})</span>}
              </div>
            )}
          </div>

          {sparklineData && sparklineData.length > 0 && (
            <div className="w-20 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineChartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={regimeColors[regime]}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
