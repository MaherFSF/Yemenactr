/**
 * ML Insights Panel - Displays real-time ML insights from the pipeline
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  Zap,
  RefreshCw,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MLInsightsPanelProps {
  className?: string;
  compact?: boolean;
}

export function MLInsightsPanel({ className, compact = false }: MLInsightsPanelProps) {
  const [insightType, setInsightType] = useState<string>('all');
  const [severity, setSeverity] = useState<string>('all');
  
  const { data: insights, isLoading, refetch } = trpc.ml.pipeline.getInsights.useQuery({
    limit: compact ? 5 : 20,
    type: insightType !== 'all' ? insightType as any : undefined,
    severity: severity !== 'all' ? severity as any : undefined,
  });
  
  const { data: metrics } = trpc.ml.pipeline.getMetrics.useQuery();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'forecast':
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      case 'correlation':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'causality':
        return <Zap className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">ML Insights</CardTitle>
            <Badge variant="outline" className="text-xs">
              {insights?.length || 0} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {insights?.slice(0, 3).map((insight, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50"
              >
                {getInsightIcon(insight.type)}
                <span className="flex-1 truncate">{insight.description}</span>
                <Badge variant="outline" className={`text-xs ${getSeverityColor(insight.severity)}`}>
                  {insight.severity}
                </Badge>
              </div>
            ))}
            {(!insights || insights.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active insights
              </p>
            )}
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
            <CardTitle>ML Intelligence Insights</CardTitle>
            <CardDescription>
              Real-time insights from the ML pipeline
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Metrics Summary */}
        {metrics && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center p-2 rounded-md bg-muted/50">
              <p className="text-2xl font-bold">{metrics.samplesProcessed}</p>
              <p className="text-xs text-muted-foreground">Samples Processed</p>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/50">
              <p className="text-2xl font-bold">{(metrics as any).insightsGenerated || 0}</p>
              <p className="text-xs text-muted-foreground">Insights Generated</p>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/50">
              <p className="text-2xl font-bold">{metrics.modelsUpdated}</p>
              <p className="text-xs text-muted-foreground">Model Updates</p>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/50">
              <p className={`text-2xl font-bold ${metrics.driftDetected ? 'text-amber-500' : 'text-green-500'}`}>
                {metrics.driftDetected ? 'Yes' : 'No'}
              </p>
              <p className="text-xs text-muted-foreground">Drift Detected</p>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={insightType} onValueChange={setInsightType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="anomaly">Anomaly</SelectItem>
                <SelectItem value="trend">Trend</SelectItem>
                <SelectItem value="forecast">Forecast</SelectItem>
                <SelectItem value="correlation">Correlation</SelectItem>
                <SelectItem value="causality">Causality</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Insights List */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : insights && insights.length > 0 ? (
                  insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {insight.type}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getSeverityColor(insight.severity)}`}
                            >
                              {insight.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(insight.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{insight.description}</p>
                          {insight.relatedIndicators && insight.relatedIndicators.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {insight.relatedIndicators.map((ind: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {ind}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                            {(insight as any).source && <span>Source: {(insight as any).source}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No insights matching your filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="timeline">
            <ScrollArea className="h-[400px]">
              <div className="relative pl-6 border-l-2 border-muted space-y-4">
                {insights?.map((insight, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-background border-2 border-primary" />
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        {getInsightIcon(insight.type)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(insight.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default MLInsightsPanel;
