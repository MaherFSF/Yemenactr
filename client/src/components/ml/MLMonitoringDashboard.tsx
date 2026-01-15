/**
 * ML Monitoring Dashboard - System health and alerts
 */

import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Bell,
  RefreshCw,
  TrendingUp,
  Database,
  Cpu,
  Clock
} from 'lucide-react';

interface MLMonitoringDashboardProps {
  className?: string;
}

export function MLMonitoringDashboard({ className }: MLMonitoringDashboardProps) {
  const { data: healthScore } = trpc.ml.monitoring.getHealthScore.useQuery();
  const { data: summary } = trpc.ml.monitoring.getDashboardSummary.useQuery();
  const { data: alerts, refetch: refetchAlerts } = trpc.ml.monitoring.getActiveAlerts.useQuery();
  const { data: alertStats } = trpc.ml.monitoring.getAlertStatistics.useQuery();
  
  const acknowledgeAlert = trpc.ml.monitoring.acknowledgeAlert.useMutation({
    onSuccess: () => refetchAlerts(),
  });

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Health Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>
            Overall ML system health and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(healthScore || 0) * 3.52} 352`}
                  className={getHealthColor(healthScore || 0)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${getHealthColor(healthScore || 0)}`}>
                  {healthScore || 0}
                </span>
              </div>
            </div>
          </div>
          
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-semibold">{(summary.modelAccuracy * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Model Accuracy</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Database className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="text-lg font-semibold">{(summary.dataCompleteness * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Data Completeness</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Activity className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                <p className="text-lg font-semibold">{(summary.dataDrift * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Data Drift</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-semibold">{summary.inferenceLatency}ms</p>
                <p className="text-xs text-muted-foreground">Inference Latency</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                <p className="text-lg font-semibold">{summary.activeAlerts}</p>
                <p className="text-xs text-muted-foreground">Active Alerts</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Cpu className="h-5 w-5 mx-auto mb-1 text-cyan-500" />
                <p className="text-lg font-semibold">{summary.healthScore}</p>
                <p className="text-xs text-muted-foreground">Health Score</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Active Alerts
              </CardTitle>
              <CardDescription>
                System alerts requiring attention
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchAlerts()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {alerts && alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              alert.severity === 'high' 
                                ? 'bg-red-500/10 text-red-500' 
                                : alert.severity === 'medium'
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-blue-500/10 text-blue-500'
                            }`}
                          >
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rule: {alert.ruleId}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => acknowledgeAlert.mutate({ alertId: alert.id })}
                        disabled={acknowledgeAlert.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
                  <p>No active alerts</p>
                  <p className="text-xs mt-1">All systems operating normally</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Alert Statistics */}
      {alertStats && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Statistics</CardTitle>
            <CardDescription>
              Historical alert distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{alertStats.totalAlerts}</p>
                    <p className="text-xs text-muted-foreground">Total Alerts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-500">{alertStats.activeAlerts}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MLMonitoringDashboard;
