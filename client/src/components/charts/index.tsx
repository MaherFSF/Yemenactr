/**
 * YETO Standardized Chart Components
 * All charts use consistent Navy/Green/Gold color scheme
 */

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { YETO_COLORS, CHART_PALETTES, RECHARTS_THEME, formatChartNumber } from '@/lib/chartTheme';

// Common props for all charts
interface BaseChartProps {
  data: Record<string, unknown>[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload) return null;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-medium text-gray-900 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium">{formatChartNumber(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================
// LINE CHART
// ============================================
interface YETOLineChartProps extends BaseChartProps {
  lines: {
    dataKey: string;
    name: string;
    color?: string;
    dashed?: boolean;
  }[];
  xAxisKey: string;
  yAxisLabel?: string;
}

export function YETOLineChart({
  data,
  lines,
  xAxisKey,
  yAxisLabel,
  height = 300,
  className = '',
  showGrid = true,
  showLegend = true,
}: YETOLineChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid 
              stroke={RECHARTS_THEME.grid.stroke} 
              strokeDasharray={RECHARTS_THEME.grid.strokeDasharray} 
            />
          )}
          <XAxis 
            dataKey={xAxisKey} 
            stroke={RECHARTS_THEME.axis.stroke}
            fontSize={RECHARTS_THEME.axis.fontSize}
            tickLine={false}
          />
          <YAxis 
            stroke={RECHARTS_THEME.axis.stroke}
            fontSize={RECHARTS_THEME.axis.fontSize}
            tickLine={false}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || CHART_PALETTES.primary[index]}
              strokeWidth={2}
              strokeDasharray={line.dashed ? '5 5' : undefined}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// BAR CHART
// ============================================
interface YETOBarChartProps extends BaseChartProps {
  bars: {
    dataKey: string;
    name: string;
    color?: string;
    stackId?: string;
  }[];
  xAxisKey: string;
  yAxisLabel?: string;
  layout?: 'horizontal' | 'vertical';
}

export function YETOBarChart({
  data,
  bars,
  xAxisKey,
  yAxisLabel,
  height = 300,
  className = '',
  showGrid = true,
  showLegend = true,
  layout = 'horizontal',
}: YETOBarChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={data} 
          layout={layout === 'vertical' ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid 
              stroke={RECHARTS_THEME.grid.stroke} 
              strokeDasharray={RECHARTS_THEME.grid.strokeDasharray} 
            />
          )}
          {layout === 'vertical' ? (
            <>
              <XAxis type="number" stroke={RECHARTS_THEME.axis.stroke} fontSize={RECHARTS_THEME.axis.fontSize} tickLine={false} />
              <YAxis dataKey={xAxisKey} type="category" stroke={RECHARTS_THEME.axis.stroke} fontSize={RECHARTS_THEME.axis.fontSize} tickLine={false} width={80} />
            </>
          ) : (
            <>
              <XAxis dataKey={xAxisKey} stroke={RECHARTS_THEME.axis.stroke} fontSize={RECHARTS_THEME.axis.fontSize} tickLine={false} />
              <YAxis stroke={RECHARTS_THEME.axis.stroke} fontSize={RECHARTS_THEME.axis.fontSize} tickLine={false} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || CHART_PALETTES.primary[index]}
              stackId={bar.stackId}
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// AREA CHART
// ============================================
interface YETOAreaChartProps extends BaseChartProps {
  areas: {
    dataKey: string;
    name: string;
    color?: string;
    stackId?: string;
  }[];
  xAxisKey: string;
  yAxisLabel?: string;
}

export function YETOAreaChart({
  data,
  areas,
  xAxisKey,
  yAxisLabel,
  height = 300,
  className = '',
  showGrid = true,
  showLegend = true,
}: YETOAreaChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid 
              stroke={RECHARTS_THEME.grid.stroke} 
              strokeDasharray={RECHARTS_THEME.grid.strokeDasharray} 
            />
          )}
          <XAxis 
            dataKey={xAxisKey} 
            stroke={RECHARTS_THEME.axis.stroke}
            fontSize={RECHARTS_THEME.axis.fontSize}
            tickLine={false}
          />
          <YAxis 
            stroke={RECHARTS_THEME.axis.stroke}
            fontSize={RECHARTS_THEME.axis.fontSize}
            tickLine={false}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color || CHART_PALETTES.primary[index]}
              fill={area.color || CHART_PALETTES.primary[index]}
              fillOpacity={0.3}
              strokeWidth={2}
              stackId={area.stackId}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// PIE/DONUT CHART
// ============================================
interface YETOPieChartProps extends BaseChartProps {
  dataKey: string;
  nameKey: string;
  colors?: string[];
  innerRadius?: number;
  showLabels?: boolean;
}

export function YETOPieChart({
  data,
  dataKey,
  nameKey,
  colors = CHART_PALETTES.primary,
  height = 300,
  className = '',
  showLegend = true,
  innerRadius = 0,
  showLabels = true,
}: YETOPieChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="80%"
            paddingAngle={2}
            label={showLabels ? ({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%` : false}
            labelLine={showLabels}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// DUAL AXIS CHART (for comparing different scales)
// ============================================
interface YETODualAxisChartProps extends BaseChartProps {
  xAxisKey: string;
  leftAxis: {
    dataKey: string;
    name: string;
    color?: string;
    type: 'line' | 'bar';
  };
  rightAxis: {
    dataKey: string;
    name: string;
    color?: string;
    type: 'line' | 'bar';
  };
}

export function YETODualAxisChart({
  data,
  xAxisKey,
  leftAxis,
  rightAxis,
  height = 300,
  className = '',
  showGrid = true,
  showLegend = true,
}: YETODualAxisChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid 
              stroke={RECHARTS_THEME.grid.stroke} 
              strokeDasharray={RECHARTS_THEME.grid.strokeDasharray} 
            />
          )}
          <XAxis 
            dataKey={xAxisKey} 
            stroke={RECHARTS_THEME.axis.stroke}
            fontSize={RECHARTS_THEME.axis.fontSize}
            tickLine={false}
          />
          <YAxis 
            yAxisId="left"
            stroke={leftAxis.color || YETO_COLORS.green}
            fontSize={RECHARTS_THEME.axis.fontSize}
            tickLine={false}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke={rightAxis.color || YETO_COLORS.navy}
            fontSize={RECHARTS_THEME.axis.fontSize}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          
          {leftAxis.type === 'bar' ? (
            <Bar
              yAxisId="left"
              dataKey={leftAxis.dataKey}
              name={leftAxis.name}
              fill={leftAxis.color || YETO_COLORS.green}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          ) : (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={leftAxis.dataKey}
              name={leftAxis.name}
              stroke={leftAxis.color || YETO_COLORS.green}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          )}
          
          {rightAxis.type === 'bar' ? (
            <Bar
              yAxisId="right"
              dataKey={rightAxis.dataKey}
              name={rightAxis.name}
              fill={rightAxis.color || YETO_COLORS.navy}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          ) : (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={rightAxis.dataKey}
              name={rightAxis.name}
              stroke={rightAxis.color || YETO_COLORS.navy}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// REGIME COMPARISON CHART
// ============================================
interface RegimeComparisonChartProps extends BaseChartProps {
  xAxisKey: string;
  adenKey: string;
  sanaaKey: string;
  adenLabel?: string;
  sanaaLabel?: string;
  showReferenceLine?: boolean;
  referenceValue?: number;
}

export function RegimeComparisonChart({
  data,
  xAxisKey,
  adenKey,
  sanaaKey,
  adenLabel = 'Aden',
  sanaaLabel = "Sana'a",
  height = 300,
  className = '',
  showGrid = true,
  showLegend = true,
  showReferenceLine = false,
  referenceValue = 0,
}: RegimeComparisonChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid 
              stroke={RECHARTS_THEME.grid.stroke} 
              strokeDasharray={RECHARTS_THEME.grid.strokeDasharray} 
            />
          )}
          <XAxis 
            dataKey={xAxisKey} 
            stroke={RECHARTS_THEME.axis.stroke}
            fontSize={RECHARTS_THEME.axis.fontSize}
            tickLine={false}
          />
          <YAxis 
            stroke={RECHARTS_THEME.axis.stroke}
            fontSize={RECHARTS_THEME.axis.fontSize}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {showReferenceLine && (
            <ReferenceLine y={referenceValue} stroke={YETO_COLORS.gold} strokeDasharray="5 5" />
          )}
          <Line
            type="monotone"
            dataKey={adenKey}
            name={adenLabel}
            stroke={CHART_PALETTES.regime.aden}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey={sanaaKey}
            name={sanaaLabel}
            stroke={CHART_PALETTES.regime.sanaa}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Export all components and utilities
export { YETO_COLORS, CHART_PALETTES, formatChartNumber };
