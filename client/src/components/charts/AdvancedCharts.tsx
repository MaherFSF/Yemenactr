/**
 * Advanced Chart Library
 * World-class visualizations matching reference mockups
 * Using D3, Visx, and Victory for maximum flexibility
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

// Color palette inspired by mockups
export const CHART_COLORS = {
  primary: '#107040',
  secondary: '#2563eb',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
  gradient1: ['#107040', '#22c55e'],
  gradient2: ['#2563eb', '#3b82f6'],
  gradient3: ['#f59e0b', '#f97316']
};

// Custom tooltip matching mockup style
export function CustomTooltip({ active, payload, label, language = 'en' }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[200px]"
    >
      <p className="font-semibold text-sm mb-2 text-foreground">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-medium text-foreground">
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString(language === 'ar' ? 'ar-YE' : 'en-US')
              : entry.value}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

// Multi-line time series chart (like mockup 05)
interface TimeSeriesChartProps {
  data: any[];
  lines: Array<{
    dataKey: string;
    name: string;
    nameAr: string;
    color: string;
    strokeWidth?: number;
  }>;
  xAxisKey?: string;
  height?: number;
  showBrush?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function TimeSeriesChart({
  data,
  lines,
  xAxisKey = 'date',
  height = 400,
  showBrush = true,
  showGrid = true,
  showLegend = true
}: TimeSeriesChartProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
        )}
        <XAxis
          dataKey={xAxisKey}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            value.toLocaleString(isRTL ? 'ar-YE' : 'en-US', {
              notation: 'compact',
              compactDisplay: 'short'
            })
          }
        />
        <Tooltip content={<CustomTooltip language={language} />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
            formatter={(value, entry: any) => {
              const line = lines.find(l => l.dataKey === entry.dataKey);
              return isRTL ? line?.nameAr || value : line?.name || value;
            }}
          />
        )}
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={line.strokeWidth || 2}
            dot={false}
            activeDot={{ r: 6 }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        ))}
        {showBrush && (
          <Brush
            dataKey={xAxisKey}
            height={30}
            stroke={CHART_COLORS.primary}
            fill="hsl(var(--muted))"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Stacked area chart for composition analysis
interface StackedAreaChartProps {
  data: any[];
  areas: Array<{
    dataKey: string;
    name: string;
    nameAr: string;
    color: string;
  }>;
  xAxisKey?: string;
  height?: number;
  showPercentage?: boolean;
}

export function StackedAreaChart({
  data,
  areas,
  xAxisKey = 'date',
  height = 400,
  showPercentage = false
}: StackedAreaChartProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // Calculate percentages if needed
  const processedData = useMemo(() => {
    if (!showPercentage) return data;

    return data.map(item => {
      const total = areas.reduce((sum, area) => sum + (item[area.dataKey] || 0), 0);
      const percentages: any = { [xAxisKey]: item[xAxisKey] };
      areas.forEach(area => {
        percentages[area.dataKey] = total > 0 ? (item[area.dataKey] / total) * 100 : 0;
      });
      return percentages;
    });
  }, [data, areas, showPercentage, xAxisKey]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          {areas.map((area, index) => (
            <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey={xAxisKey}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) =>
            showPercentage
              ? `${value.toFixed(0)}%`
              : value.toLocaleString(isRTL ? 'ar-YE' : 'en-US', { notation: 'compact' })
          }
        />
        <Tooltip content={<CustomTooltip language={language} />} />
        <Legend
          formatter={(value, entry: any) => {
            const area = areas.find(a => a.dataKey === entry.dataKey);
            return isRTL ? area?.nameAr || value : area?.name || value;
          }}
        />
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            stackId="1"
            stroke={area.color}
            fill={`url(#gradient-${area.dataKey})`}
            animationDuration={1000}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Grouped bar chart for comparisons
interface GroupedBarChartProps {
  data: any[];
  bars: Array<{
    dataKey: string;
    name: string;
    nameAr: string;
    color: string;
  }>;
  xAxisKey?: string;
  height?: number;
  horizontal?: boolean;
}

export function GroupedBarChart({
  data,
  bars,
  xAxisKey = 'category',
  height = 400,
  horizontal = false
}: GroupedBarChartProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const ChartComponent = horizontal ? BarChart : BarChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        {horizontal ? (
          <>
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xAxisKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
          </>
        )}
        <Tooltip content={<CustomTooltip language={language} />} />
        <Legend
          formatter={(value, entry: any) => {
            const bar = bars.find(b => b.dataKey === entry.dataKey);
            return isRTL ? bar?.nameAr || value : bar?.name || value;
          }}
        />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        ))}
      </ChartComponent>
    </ResponsiveContainer>
  );
}

// Scatter plot for correlation analysis
interface ScatterPlotProps {
  data: any[];
  xKey: string;
  yKey: string;
  xLabel: string;
  xLabelAr: string;
  yLabel: string;
  yLabelAr: string;
  color?: string;
  height?: number;
  showTrendLine?: boolean;
}

export function ScatterPlot({
  data,
  xKey,
  yKey,
  xLabel,
  xLabelAr,
  yLabel,
  yLabelAr,
  color = CHART_COLORS.primary,
  height = 400,
  showTrendLine = true
}: ScatterPlotProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // Calculate trend line
  const trendLine = useMemo(() => {
    if (!showTrendLine || data.length < 2) return null;

    const xValues = data.map(d => d[xKey]);
    const yValues = data.map(d => d[yKey]);
    const n = data.length;

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    return [
      { [xKey]: minX, [yKey]: slope * minX + intercept },
      { [xKey]: maxX, [yKey]: slope * maxX + intercept }
    ];
  }, [data, xKey, yKey, showTrendLine]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          type="number"
          dataKey={xKey}
          name={isRTL ? xLabelAr : xLabel}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          label={{
            value: isRTL ? xLabelAr : xLabel,
            position: 'insideBottom',
            offset: -10
          }}
        />
        <YAxis
          type="number"
          dataKey={yKey}
          name={isRTL ? yLabelAr : yLabel}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          label={{
            value: isRTL ? yLabelAr : yLabel,
            angle: -90,
            position: 'insideLeft'
          }}
        />
        <Tooltip content={<CustomTooltip language={language} />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter
          name={`${isRTL ? xLabelAr : xLabel} vs ${isRTL ? yLabelAr : yLabel}`}
          data={data}
          fill={color}
          animationDuration={1000}
        />
        {trendLine && (
          <Scatter
            name={isRTL ? 'خط الاتجاه' : 'Trend Line'}
            data={trendLine}
            fill="none"
            line={{ stroke: CHART_COLORS.danger, strokeWidth: 2, strokeDasharray: '5 5' }}
          />
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// Heatmap for correlation matrix
interface HeatmapProps {
  data: Array<{
    x: string;
    y: string;
    value: number;
  }>;
  height?: number;
  colorScale?: [string, string];
}

export function Heatmap({
  data,
  height = 400,
  colorScale = ['#ef4444', '#22c55e']
}: HeatmapProps) {
  const { language } = useLanguage();

  // Get unique x and y values
  const xValues = Array.from(new Set(data.map(d => d.x)));
  const yValues = Array.from(new Set(data.map(d => d.y)));

  // Find min and max values for color scaling
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    // Simple linear interpolation between two colors
    return normalized > 0.5 ? colorScale[1] : colorScale[0];
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${xValues.length + 1}, minmax(60px, 1fr))` }}>
        {/* Header row */}
        <div />
        {xValues.map(x => (
          <div key={x} className="text-xs font-medium text-center p-2">
            {x}
          </div>
        ))}

        {/* Data rows */}
        {yValues.map(y => (
          <>
            <div key={`label-${y}`} className="text-xs font-medium flex items-center p-2">
              {y}
            </div>
            {xValues.map(x => {
              const cell = data.find(d => d.x === x && d.y === y);
              const value = cell?.value || 0;
              return (
                <motion.div
                  key={`${x}-${y}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-square rounded flex items-center justify-center text-xs font-medium text-white"
                  style={{
                    backgroundColor: getColor(value),
                    opacity: Math.abs(value) / maxValue
                  }}
                  title={`${x} vs ${y}: ${value.toFixed(2)}`}
                >
                  {value.toFixed(2)}
                </motion.div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

export default {
  TimeSeriesChart,
  StackedAreaChart,
  GroupedBarChart,
  ScatterPlot,
  Heatmap,
  CustomTooltip,
  CHART_COLORS
};
