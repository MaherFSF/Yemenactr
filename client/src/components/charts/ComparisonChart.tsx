import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { EvidencePack, type Source } from "@/components/EvidencePack";

interface DataPoint {
  name: string;
  nameAr?: string;
  adenValue: number;
  sanaaValue: number;
}

interface ComparisonChartProps {
  title: string;
  titleAr?: string;
  data: DataPoint[];
  unit: string;
  confidenceLevel?: "A" | "B" | "C" | "D";
  source?: string;
  sources?: Source[];
  methodology?: string;
  methodologyAr?: string;
  lastUpdated?: string;
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

export function ComparisonChart({
  title,
  titleAr,
  data,
  unit,
  confidenceLevel = "B",
  source,
  sources,
  methodology,
  methodologyAr,
  lastUpdated,
  className,
}: ComparisonChartProps) {
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
            {sources && sources.length > 0 && (
              <EvidencePack
                indicatorName={title}
                indicatorNameAr={titleAr}
                value={data[0]?.adenValue || 0}
                unit={unit}
                date={new Date().toISOString()}
                sources={sources}
                methodology={methodology}
                methodologyAr={methodologyAr}
                lastUpdated={lastUpdated || new Date().toLocaleDateString()}
                confidence={confidenceLevel === "A" ? "high" : confidenceLevel === "B" || confidenceLevel === "C" ? "medium" : "low"}
                variant="icon"
              />
            )}
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
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={100}
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
            <Bar dataKey="adenValue" name="Aden (IRG)" fill="#107040" radius={[0, 4, 4, 0]} />
            <Bar dataKey="sanaaValue" name="Sana'a (DFA)" fill="#103050" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
