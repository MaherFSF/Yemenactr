import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface DataPoint {
  date: string;
  adenValue?: number;
  sanaaValue?: number;
  value?: number;
  label?: string;
}

interface TimeSeriesChartProps {
  title: string;
  titleAr?: string;
  data: DataPoint[];
  unit: string;
  showDualRegime?: boolean;
  chartType?: "line" | "area";
  confidenceLevel?: "A" | "B" | "C" | "D";
  source?: string;
  className?: string;
}

const confidenceColors = {
  A: "bg-green-500",
  B: "bg-blue-500",
  C: "bg-yellow-500",
  D: "bg-red-500",
};

const confidenceLabels = {
  A: "High Confidence",
  B: "Medium-High Confidence",
  C: "Medium Confidence",
  D: "Low Confidence",
};

export function TimeSeriesChart({
  title,
  titleAr,
  data,
  unit,
  showDualRegime = true,
  chartType = "line",
  confidenceLevel = "B",
  source,
  className,
}: TimeSeriesChartProps) {
  const formattedData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      date: d.label || new Date(d.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    }));
  }, [data]);

  const ChartComponent = chartType === "area" ? AreaChart : LineChart;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {titleAr && (
              <p className="text-sm text-muted-foreground mt-1" dir="rtl">
                {titleAr}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${confidenceColors[confidenceLevel]} text-white text-xs`}>
              {confidenceLabels[confidenceLevel]}
            </Badge>
          </div>
        </div>
        {source && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Info className="h-3 w-3" />
            Source: {source}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ChartComponent data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toLocaleString()}`}
              label={{ value: unit, angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value.toLocaleString()} ${unit}`, ""]}
            />
            <Legend />
            {showDualRegime ? (
              <>
                {chartType === "area" ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="adenValue"
                      name="Aden (IRG)"
                      stroke="#107040"
                      fill="#107040"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="sanaaValue"
                      name="Sana'a (DFA)"
                      stroke="#103050"
                      fill="#103050"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="adenValue"
                      name="Aden (IRG)"
                      stroke="#107040"
                      strokeWidth={2}
                      dot={{ fill: "#107040", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sanaaValue"
                      name="Sana'a (DFA)"
                      stroke="#103050"
                      strokeWidth={2}
                      dot={{ fill: "#103050", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {chartType === "area" ? (
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={title}
                    stroke="#C0A030"
                    fill="#C0A030"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={title}
                    stroke="#C0A030"
                    strokeWidth={2}
                    dot={{ fill: "#C0A030", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
