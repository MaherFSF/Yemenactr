/**
 * YETO Enhanced Visualizations
 * Advanced chart components for economic data visualization:
 * - Sparkline charts for KPI cards
 * - Regime comparison heatmaps
 * - Animated time series
 * - Interactive drill-down charts
 */

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Types
interface DataPoint {
  date: string;
  value: number;
  regime?: "aden" | "sanaa" | "national";
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showTrend?: boolean;
  animated?: boolean;
}

interface HeatmapCell {
  indicator: string;
  indicatorAr: string;
  adenValue: number;
  sanaaValue: number;
  divergence: number;
  trend: "widening" | "narrowing" | "stable";
}

interface RegimeHeatmapProps {
  data: HeatmapCell[];
  title?: string;
  titleAr?: string;
}

interface AnimatedTimeSeriesProps {
  data: DataPoint[];
  title: string;
  titleAr: string;
  unit?: string;
  color?: string;
  showControls?: boolean;
}

interface DrillDownChartProps {
  data: DataPoint[];
  title: string;
  titleAr: string;
  onDrillDown?: (date: string) => void;
  drillDownData?: Map<string, DataPoint[]>;
}

// Sparkline Component
export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = "#166534",
  showTrend = true,
  animated = true
}: SparklineProps) {
  const [animatedData, setAnimatedData] = useState<number[]>([]);
  
  useEffect(() => {
    if (animated) {
      // Animate the sparkline drawing
      const steps = data.length;
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setAnimatedData(data.slice(0, currentStep));
        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    } else {
      setAnimatedData(data);
    }
  }, [data, animated]);
  
  const displayData = animated ? animatedData : data;
  
  if (displayData.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  // Calculate SVG path
  const points = displayData.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  
  // Determine trend
  const trend = data[data.length - 1] > data[0] ? "up" : data[data.length - 1] < data[0] ? "down" : "stable";
  const trendColor = trend === "up" ? "#16a34a" : trend === "down" ? "#dc2626" : "#6b7280";
  
  return (
    <div className="inline-flex items-center gap-1">
      <svg width={width} height={height} className="overflow-visible">
        {/* Area fill */}
        <path
          d={`M0,${height} L${points} L${width},${height} Z`}
          fill={`${color}20`}
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End point */}
        {displayData.length > 0 && (
          <circle
            cx={width}
            cy={height - ((displayData[displayData.length - 1] - min) / range) * height}
            r="2"
            fill={color}
          />
        )}
      </svg>
      {showTrend && (
        <span className="text-xs" style={{ color: trendColor }}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
        </span>
      )}
    </div>
  );
}

// Regime Comparison Heatmap
export function RegimeHeatmap({ data, title, titleAr }: RegimeHeatmapProps) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  // Calculate color intensity based on divergence
  const getColor = (divergence: number, trend: string) => {
    const intensity = Math.min(Math.abs(divergence) / 100, 1);
    if (divergence > 0) {
      // Aden higher - use green shades
      return `rgba(22, 163, 74, ${0.2 + intensity * 0.6})`;
    } else {
      // Sana'a higher - use blue shades
      return `rgba(37, 99, 235, ${0.2 + intensity * 0.6})`;
    }
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "widening": return "↔️";
      case "narrowing": return "↕️";
      default: return "➖";
    }
  };
  
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-lg font-semibold mb-4">
        {isRTL ? titleAr || "مقارنة المناطق" : title || "Regime Comparison"}
      </h3>
      
      {/* Header */}
      <div className="grid grid-cols-5 gap-2 mb-2 text-sm font-medium text-muted-foreground">
        <div>{isRTL ? "المؤشر" : "Indicator"}</div>
        <div className="text-center">{isRTL ? "عدن" : "Aden"}</div>
        <div className="text-center">{isRTL ? "صنعاء" : "Sana'a"}</div>
        <div className="text-center">{isRTL ? "التباين" : "Divergence"}</div>
        <div className="text-center">{isRTL ? "الاتجاه" : "Trend"}</div>
      </div>
      
      {/* Data rows */}
      {data.map((cell, index) => (
        <div
          key={index}
          className="grid grid-cols-5 gap-2 py-2 border-t border-border/50 items-center"
          style={{ backgroundColor: getColor(cell.divergence, cell.trend) }}
        >
          <div className="text-sm font-medium">
            {isRTL ? cell.indicatorAr : cell.indicator}
          </div>
          <div className="text-center text-sm">
            {cell.adenValue.toLocaleString()}
          </div>
          <div className="text-center text-sm">
            {cell.sanaaValue.toLocaleString()}
          </div>
          <div className="text-center text-sm font-medium">
            {cell.divergence > 0 ? "+" : ""}{cell.divergence.toFixed(1)}%
          </div>
          <div className="text-center">
            {getTrendIcon(cell.trend)}
          </div>
        </div>
      ))}
      
      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "rgba(22, 163, 74, 0.5)" }} />
          <span>{isRTL ? "عدن أعلى" : "Aden Higher"}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "rgba(37, 99, 235, 0.5)" }} />
          <span>{isRTL ? "صنعاء أعلى" : "Sana'a Higher"}</span>
        </div>
      </div>
    </div>
  );
}

// Animated Time Series Chart
export function AnimatedTimeSeries({
  data,
  title,
  titleAr,
  unit = "",
  color = "#166534",
  showControls = true
}: AnimatedTimeSeriesProps) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(data.length - 1);
  const [playbackSpeed, setPlaybackSpeed] = useState(100);
  
  useEffect(() => {
    if (isPlaying && currentIndex < data.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, playbackSpeed);
      return () => clearTimeout(timer);
    } else if (currentIndex >= data.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIndex, data.length, playbackSpeed]);
  
  const handlePlay = () => {
    if (currentIndex >= data.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  };
  
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };
  
  const visibleData = data.slice(0, currentIndex + 1);
  const currentValue = visibleData[visibleData.length - 1];
  
  // Calculate chart dimensions
  const width = 400;
  const height = 200;
  const padding = 40;
  
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  const points = visibleData.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.value - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {isRTL ? titleAr : title}
        </h3>
        {currentValue && (
          <div className="text-2xl font-bold text-primary">
            {currentValue.value.toLocaleString()} {unit}
          </div>
        )}
      </div>
      
      {/* Chart */}
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={height - padding - ratio * (height - 2 * padding)}
            x2={width - padding}
            y2={height - padding - ratio * (height - 2 * padding)}
            stroke="#e5e7eb"
            strokeDasharray="4"
          />
        ))}
        
        {/* Area fill */}
        <path
          d={`M${padding},${height - padding} L${points} L${padding + (visibleData.length - 1) / (data.length - 1) * (width - 2 * padding)},${height - padding} Z`}
          fill={`${color}20`}
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Current point */}
        {visibleData.length > 0 && (
          <>
            <circle
              cx={padding + (visibleData.length - 1) / (data.length - 1) * (width - 2 * padding)}
              cy={height - padding - ((currentValue?.value || 0) - min) / range * (height - 2 * padding)}
              r="6"
              fill={color}
              className="animate-pulse"
            />
            <text
              x={padding + (visibleData.length - 1) / (data.length - 1) * (width - 2 * padding)}
              y={height - padding - ((currentValue?.value || 0) - min) / range * (height - 2 * padding) - 12}
              textAnchor="middle"
              className="text-xs fill-current"
            >
              {currentValue?.date}
            </text>
          </>
        )}
        
        {/* Y-axis labels */}
        <text x={padding - 5} y={height - padding} textAnchor="end" className="text-xs fill-muted-foreground">
          {min.toLocaleString()}
        </text>
        <text x={padding - 5} y={padding} textAnchor="end" className="text-xs fill-muted-foreground">
          {max.toLocaleString()}
        </text>
      </svg>
      
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={handleReset}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            title={isRTL ? "إعادة تعيين" : "Reset"}
          >
            ⏮️
          </button>
          {isPlaying ? (
            <button
              onClick={handlePause}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              title={isRTL ? "إيقاف مؤقت" : "Pause"}
            >
              ⏸️
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              title={isRTL ? "تشغيل" : "Play"}
            >
              ▶️
            </button>
          )}
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value={200}>0.5x</option>
            <option value={100}>1x</option>
            <option value={50}>2x</option>
            <option value={25}>4x</option>
          </select>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {data.length}
          </span>
        </div>
      )}
    </div>
  );
}

// Drill-Down Chart Component
export function DrillDownChart({
  data,
  title,
  titleAr,
  onDrillDown,
  drillDownData
}: DrillDownChartProps) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [drillLevel, setDrillLevel] = useState(0);
  
  const currentData = useMemo(() => {
    if (drillLevel === 0 || !selectedPoint || !drillDownData) {
      return data;
    }
    return drillDownData.get(selectedPoint) || data;
  }, [data, drillLevel, selectedPoint, drillDownData]);
  
  const handlePointClick = (date: string) => {
    if (onDrillDown && drillDownData?.has(date)) {
      setSelectedPoint(date);
      setDrillLevel(1);
      onDrillDown(date);
    }
  };
  
  const handleBack = () => {
    setDrillLevel(0);
    setSelectedPoint(null);
  };
  
  // Chart dimensions
  const width = 400;
  const height = 200;
  const padding = 40;
  const barWidth = (width - 2 * padding) / currentData.length - 4;
  
  const values = currentData.map(d => d.value);
  const max = Math.max(...values);
  
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {drillLevel > 0 && (
            <button
              onClick={handleBack}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              ← {isRTL ? "رجوع" : "Back"}
            </button>
          )}
          <h3 className="text-lg font-semibold">
            {isRTL ? titleAr : title}
            {selectedPoint && ` - ${selectedPoint}`}
          </h3>
        </div>
        {drillDownData && drillLevel === 0 && (
          <span className="text-xs text-muted-foreground">
            {isRTL ? "انقر للتفاصيل" : "Click to drill down"}
          </span>
        )}
      </div>
      
      {/* Bar Chart */}
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {currentData.map((d, i) => {
          const barHeight = (d.value / max) * (height - 2 * padding);
          const x = padding + i * ((width - 2 * padding) / currentData.length) + 2;
          const y = height - padding - barHeight;
          const isClickable = drillDownData?.has(d.date);
          
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={selectedPoint === d.date ? "#166534" : "#16653480"}
                rx="2"
                className={isClickable ? "cursor-pointer hover:fill-primary transition-colors" : ""}
                onClick={() => isClickable && handlePointClick(d.date)}
              />
              {/* Value label */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                {d.value.toLocaleString()}
              </text>
              {/* Date label */}
              <text
                x={x + barWidth / 2}
                y={height - padding + 15}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
                transform={`rotate(-45, ${x + barWidth / 2}, ${height - padding + 15})`}
              >
                {d.date.slice(0, 7)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Smart Insights Ticker
interface InsightTickerProps {
  insights: Array<{
    id: string;
    type: string;
    priority: string;
    title: string;
    titleAr: string;
    indicator: string;
    value?: number;
    change?: number;
  }>;
  speed?: number;
}

export function InsightsTicker({ insights, speed = 50 }: InsightTickerProps) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => (prev + 1) % (insights.length * 300));
    }, speed);
    return () => clearInterval(interval);
  }, [insights.length, speed]);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-600 bg-red-50";
      case "high": return "text-orange-600 bg-orange-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      default: return "text-blue-600 bg-blue-50";
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "anomaly": return "⚠️";
      case "trend": return "📈";
      case "milestone": return "🎯";
      case "divergence": return "↔️";
      default: return "📊";
    }
  };
  
  return (
    <div className="bg-card border-y border-border overflow-hidden">
      <div
        className="flex items-center gap-8 py-2 whitespace-nowrap"
        style={{
          transform: `translateX(${isRTL ? offset : -offset}px)`,
          direction: isRTL ? "rtl" : "ltr"
        }}
      >
        {[...insights, ...insights].map((insight, index) => (
          <div
            key={`${insight.id}-${index}`}
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${getPriorityColor(insight.priority)}`}
          >
            <span>{getTypeIcon(insight.type)}</span>
            <span className="font-medium">
              {isRTL ? insight.titleAr : insight.title}
            </span>
            {insight.change !== undefined && (
              <span className={insight.change > 0 ? "text-green-600" : "text-red-600"}>
                {insight.change > 0 ? "+" : ""}{insight.change.toFixed(1)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Correlation Matrix Visualization
interface CorrelationMatrixProps {
  indicators: string[];
  indicatorsAr: string[];
  correlations: number[][]; // n x n matrix
}

export function CorrelationMatrix({ indicators, indicatorsAr, correlations }: CorrelationMatrixProps) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const labels = isRTL ? indicatorsAr : indicators;
  
  const getColor = (value: number) => {
    if (value > 0.7) return "bg-green-600 text-white";
    if (value > 0.4) return "bg-green-400";
    if (value > 0.2) return "bg-green-200";
    if (value > -0.2) return "bg-gray-100";
    if (value > -0.4) return "bg-red-200";
    if (value > -0.7) return "bg-red-400";
    return "bg-red-600 text-white";
  };
  
  return (
    <div className="bg-card rounded-lg border border-border p-4 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">
        {isRTL ? "مصفوفة الارتباط" : "Correlation Matrix"}
      </h3>
      
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="p-2"></th>
            {labels.map((label, i) => (
              <th key={i} className="p-2 text-center font-medium" style={{ writingMode: "vertical-rl" }}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {correlations.map((row, i) => (
            <tr key={i}>
              <td className="p-2 font-medium">{labels[i]}</td>
              {row.map((value, j) => (
                <td
                  key={j}
                  className={`p-2 text-center ${getColor(value)} ${i === j ? "font-bold" : ""}`}
                  title={`${labels[i]} ↔ ${labels[j]}: ${value.toFixed(2)}`}
                >
                  {value.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center gap-2 text-xs">
        <span className="px-2 py-1 bg-red-600 text-white rounded">-1.0</span>
        <span className="px-2 py-1 bg-red-200 rounded">-0.5</span>
        <span className="px-2 py-1 bg-gray-100 rounded">0</span>
        <span className="px-2 py-1 bg-green-200 rounded">+0.5</span>
        <span className="px-2 py-1 bg-green-600 text-white rounded">+1.0</span>
      </div>
    </div>
  );
}

export default {
  Sparkline,
  RegimeHeatmap,
  AnimatedTimeSeries,
  DrillDownChart,
  InsightsTicker,
  CorrelationMatrix
};
