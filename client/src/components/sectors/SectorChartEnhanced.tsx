/**
 * SectorChartEnhanced - Professional chart component with Recharts
 * For sector Intelligence Walls with real-time data visualization
 */

import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, BarChart3 } from "lucide-react";

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: string | number;
}

export interface ChartSeries {
  key: string;
  name: string;
  nameAr: string;
  color: string;
  type?: 'line' | 'area' | 'bar';
}

// Custom tooltip component
function CustomTooltip({ active, payload, label, isArabic }: any) {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {typeof entry.value === 'number' 
              ? entry.value.toLocaleString(isArabic ? 'ar' : 'en', { maximumFractionDigits: 2 })
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// Sector-specific chart that fetches data from database
interface SectorTimeSeriesChartProps {
  sectorCode: string;
  indicators: string[];
  title: string;
  titleAr: string;
  startYear?: number;
  height?: number;
  chartType?: 'line' | 'area' | 'bar';
}

export function SectorTimeSeriesChart({
  sectorCode,
  indicators,
  title,
  titleAr,
  startYear = 2010,
  height = 350,
  chartType = 'line',
}: SectorTimeSeriesChartProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  // Fetch chart data from database
  const { data, isLoading, error } = trpc.sectorKpi.getChartData.useQuery({
    indicators,
    startYear,
  });
  
  // Define colors for each indicator
  const colors = [
    '#2563eb', // blue
    '#16a34a', // green
    '#dc2626', // red
    '#9333ea', // purple
    '#ea580c', // orange
    '#0891b2', // cyan
  ];
  
  // Process data for chart
  const chartData = useMemo(() => {
    if (!data?.chartData) return [];
    
    // Merge all indicator data by date
    const dateMap = new Map<string, any>();
    
    data.chartData.forEach((series: any, idx: number) => {
      series.data.forEach((point: any) => {
        const existing = dateMap.get(point.date) || { date: point.date };
        existing[series.indicator] = point.value;
        dateMap.set(point.date, existing);
      });
    });
    
    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(point => ({
        ...point,
        dateLabel: new Date(point.date).toLocaleDateString(isArabic ? 'ar' : 'en', {
          year: 'numeric',
          month: 'short',
        }),
      }));
  }, [data, isArabic]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isArabic ? titleAr : title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
            <p>{isArabic ? 'لا توجد بيانات متاحة' : 'No data available'}</p>
            <p className="text-sm mt-2">
              {isArabic ? 'سيتم تحديث البيانات قريباً' : 'Data will be updated soon'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const ChartComponent = chartType === 'area' ? AreaChart : 
                        chartType === 'bar' ? BarChart : 
                        LineChart;
  
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {isArabic ? titleAr : title}
          </CardTitle>
          <CardDescription>
            {chartData.length} {isArabic ? 'نقطة بيانات' : 'data points'}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          {isArabic ? 'تصدير' : 'Export'}
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="dateLabel" 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip isArabic={isArabic} />} />
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
            {indicators.map((indicator, idx) => {
              if (chartType === 'area') {
                return (
                  <Area
                    key={indicator}
                    type="monotone"
                    dataKey={indicator}
                    name={indicator.replace(/_/g, ' ')}
                    stroke={colors[idx % colors.length]}
                    fill={colors[idx % colors.length]}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                );
              } else if (chartType === 'bar') {
                return (
                  <Bar
                    key={indicator}
                    dataKey={indicator}
                    name={indicator.replace(/_/g, ' ')}
                    fill={colors[idx % colors.length]}
                  />
                );
              } else {
                return (
                  <Line
                    key={indicator}
                    type="monotone"
                    dataKey={indicator}
                    name={indicator.replace(/_/g, ' ')}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                );
              }
            })}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Multi-indicator comparison chart
interface ComparisonChartProps {
  title: string;
  titleAr: string;
  data: {
    name: string;
    nameAr: string;
    current: number;
    previous: number;
    target?: number;
  }[];
  height?: number;
}

export function ComparisonChart({
  title,
  titleAr,
  data,
  height = 300,
}: ComparisonChartProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const chartData = data.map(d => ({
    name: isArabic ? d.nameAr : d.name,
    current: d.current,
    previous: d.previous,
    target: d.target,
  }));
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{isArabic ? titleAr : title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              width={100}
            />
            <Tooltip content={<CustomTooltip isArabic={isArabic} />} />
            <Legend />
            <Bar 
              dataKey="previous" 
              name={isArabic ? 'السابق' : 'Previous'} 
              fill="#94a3b8" 
            />
            <Bar 
              dataKey="current" 
              name={isArabic ? 'الحالي' : 'Current'} 
              fill="#2563eb" 
            />
            {data.some(d => d.target) && (
              <Bar 
                dataKey="target" 
                name={isArabic ? 'المستهدف' : 'Target'} 
                fill="#16a34a" 
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Dual axis chart for showing related metrics
interface DualAxisChartProps {
  title: string;
  titleAr: string;
  data: ChartDataPoint[];
  leftAxis: {
    key: string;
    name: string;
    nameAr: string;
    color: string;
  };
  rightAxis: {
    key: string;
    name: string;
    nameAr: string;
    color: string;
  };
  height?: number;
}

export function DualAxisChart({
  title,
  titleAr,
  data,
  leftAxis,
  rightAxis,
  height = 350,
}: DualAxisChartProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const chartData = data.map(point => ({
    ...point,
    dateLabel: new Date(point.date).toLocaleDateString(isArabic ? 'ar' : 'en', {
      year: 'numeric',
      month: 'short',
    }),
  }));
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{isArabic ? titleAr : title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="dateLabel" 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              orientation="left"
            />
            <YAxis 
              yAxisId="right"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip isArabic={isArabic} />} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey={leftAxis.key}
              name={isArabic ? leftAxis.nameAr : leftAxis.name}
              fill={leftAxis.color}
              fillOpacity={0.8}
            />
            <Line 
              yAxisId="right"
              type="monotone"
              dataKey={rightAxis.key}
              name={isArabic ? rightAxis.nameAr : rightAxis.name}
              stroke={rightAxis.color}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default SectorTimeSeriesChart;
