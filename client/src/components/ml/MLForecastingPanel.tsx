/**
 * ML Forecasting Panel - Ensemble forecasts with uncertainty visualization
 */

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MLForecastingPanelProps {
  data?: number[];
  indicatorName?: string;
  className?: string;
}

export function MLForecastingPanel({ 
  data = [], 
  indicatorName = 'Indicator',
  className 
}: MLForecastingPanelProps) {
  const [forecastSteps, setForecastSteps] = useState(30);
  
  const { data: forecasts, isLoading, refetch } = trpc.ml.forecasting.forecast.useQuery(
    { data, steps: forecastSteps },
    { enabled: data.length >= 10 }
  );
  
  const { data: weights } = trpc.ml.forecasting.getWeights.useQuery();
  const { data: performance } = trpc.ml.forecasting.getPerformance.useQuery();

  // Calculate trend from forecasts
  const trend = useMemo(() => {
    if (!forecasts || forecasts.length < 2) return null;
    const first = forecasts[0].ensembleValue;
    const last = forecasts[forecasts.length - 1].ensembleValue;
    const change = ((last - first) / first) * 100;
    return {
      direction: change >= 0 ? 'up' : 'down',
      percentage: Math.abs(change).toFixed(1),
    };
  }, [forecasts]);

  // Simple chart visualization
  const chartData = useMemo(() => {
    if (!forecasts) return [];
    const maxValue = Math.max(...forecasts.map(f => f.uncertaintyBands?.upper95 || f.ensembleValue));
    const minValue = Math.min(...forecasts.map(f => f.uncertaintyBands?.lower95 || f.ensembleValue));
    const range = maxValue - minValue || 1;
    
    return forecasts.map((f, i) => ({
      x: (i / (forecasts.length - 1)) * 100,
      y: ((f.ensembleValue - minValue) / range) * 100,
      upper95: f.uncertaintyBands ? ((f.uncertaintyBands.upper95 - minValue) / range) * 100 : 0,
      lower95: f.uncertaintyBands ? ((f.uncertaintyBands.lower95 - minValue) / range) * 100 : 0,
      value: f.ensembleValue,
      confidence: f.confidence,
    }));
  }, [forecasts]);

  if (data.length < 10) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ensemble Forecasting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Insufficient data for forecasting</p>
            <p className="text-xs mt-1">At least 10 data points required</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ensemble Forecast: {indicatorName}
            </CardTitle>
            <CardDescription>
              ML-powered predictions with uncertainty bands
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Forecast Horizon Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Forecast Horizon</span>
            <span className="text-sm text-muted-foreground">{forecastSteps} days</span>
          </div>
          <Slider
            value={[forecastSteps]}
            onValueChange={(v) => setForecastSteps(v[0])}
            min={7}
            max={365}
            step={7}
            className="w-full"
          />
        </div>

        {/* Trend Summary */}
        {trend && (
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            {trend.direction === 'up' ? (
              <TrendingUp className="h-8 w-8 text-green-500" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-500" />
            )}
            <div>
              <p className="text-lg font-semibold">
                {trend.direction === 'up' ? '+' : '-'}{trend.percentage}% 
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  over {forecastSteps} days
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Ensemble forecast trend
              </p>
            </div>
          </div>
        )}

        {/* Simple Chart Visualization */}
        {chartData.length > 0 && (
          <div className="relative h-48 w-full border rounded-lg p-4 bg-muted/20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Uncertainty band */}
              <path
                d={`M ${chartData.map((d, i) => `${d.x},${100 - d.upper95}`).join(' L ')} L ${chartData.slice().reverse().map((d) => `${d.x},${100 - d.lower95}`).join(' L ')} Z`}
                fill="currentColor"
                className="text-primary/10"
              />
              {/* Main forecast line */}
              <path
                d={`M ${chartData.map((d) => `${d.x},${100 - d.y}`).join(' L ')}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-primary"
              />
              {/* Data points */}
              {chartData.filter((_, i) => i % Math.ceil(chartData.length / 10) === 0).map((d, i) => (
                <circle
                  key={i}
                  cx={d.x}
                  cy={100 - d.y}
                  r="1"
                  fill="currentColor"
                  className="text-primary"
                />
              ))}
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-2 right-2 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-primary" />
                <span>Forecast</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary/10 rounded" />
                <span>95% CI</span>
              </div>
            </div>
          </div>
        )}

        {/* Model Weights */}
        {weights && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Model Weights</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Weights are automatically optimized based on model performance</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(weights).map(([model, weight]) => (
                <div key={model} className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-semibold">{((weight as number) * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground uppercase">{model}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {performance && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Model Performance</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(performance).slice(0, 4).map(([model, metrics]) => (
                <div key={model} className="p-3 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground uppercase mb-1">{model}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>R²</span>
                      <span className="font-medium">{((metrics as any).r2 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>MAE</span>
                      <span className="font-medium">{(metrics as any).mae?.toFixed(2) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forecast Details */}
        {forecasts && forecasts.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Forecast Details</span>
            <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {forecasts[0].ensembleValue.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Next Period</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {forecasts[Math.floor(forecasts.length / 2)]?.ensembleValue.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Mid-term</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {forecasts[forecasts.length - 1].ensembleValue.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">End of Period</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                Confidence: {(forecasts[0].confidence * 100).toFixed(0)}%
              </Badge>
              <Badge variant="outline" className="text-xs">
                95% CI: [{forecasts[0].confidenceInterval?.[0].toFixed(2)}, {forecasts[0].confidenceInterval?.[1].toFixed(2)}]
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MLForecastingPanel;
