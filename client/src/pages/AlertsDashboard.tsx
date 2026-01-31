import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";

export default function AlertsDashboard() {
  const { user } = useAuth();

  const { data: alerts, refetch: refetchAlerts, isLoading } = trpc.alerts.getRecent.useQuery(
    { limit: 50 },
    { enabled: !!user }
  );
  const { data: thresholds } = trpc.alerts.getThresholds.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: unreadCount } = trpc.alerts.getUnreadCount.useQuery(
    undefined,
    { enabled: !!user }
  );

  const runDetectionMutation = trpc.alerts.runDetection.useMutation({
    onSuccess: (result) => {
      toast.success("Signal detection completed", {
        description: `${result.signalsDetected} signals detected, ${result.alertsStored} new alerts`,
      });
      refetchAlerts();
    },
    onError: (error) => {
      toast.error("Detection failed", { description: error.message });
    },
  });

  const markReadMutation = trpc.alerts.markRead.useMutation({
    onSuccess: () => {
      refetchAlerts();
    },
  });

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleString();
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#2e8b6e] text-white py-8">
        <div className="container">
          <Link href="/admin">
            <Button variant="ghost" className="text-white/70 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Alerts Dashboard</h1>
              <p className="text-white/70">
                Monitor economic signal alerts and threshold breaches
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {alerts?.filter(a => a.severity === "critical" && !a.isRead).length || 0}
                  </p>
                  <p className="text-sm text-gray-500">Critical Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {alerts?.filter(a => a.severity === "warning" && !a.isRead).length || 0}
                  </p>
                  <p className="text-sm text-gray-500">Warnings Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadCount || 0}</p>
                  <p className="text-sm text-gray-500">Total Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{thresholds?.length || 0}</p>
                  <p className="text-sm text-gray-500">Active Thresholds</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          {user?.role === "admin" && (
            <Button
              onClick={() => runDetectionMutation.mutate()}
              disabled={runDetectionMutation.isPending}
              className="bg-[#2e8b6e] hover:bg-[#0d5a34]"
            >
              {runDetectionMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Bell className="w-4 h-4 mr-2" />
              )}
              Run Signal Detection
            </Button>
          )}
          <Button variant="outline" onClick={() => refetchAlerts()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alerts List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>
                  Signal alerts triggered by threshold breaches
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : alerts && alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          alert.isRead ? "bg-gray-50" : "bg-white border-l-4 border-l-blue-500"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(alert.severity)}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {getSeverityBadge(alert.severity)}
                                {alert.indicatorCode && (
                                  <Badge variant="outline">{alert.indicatorCode}</Badge>
                                )}
                              </div>
                              <p className="font-medium">{alert.title}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(alert.createdAt)}
                              </p>
                            </div>
                          </div>
                          {!alert.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markReadMutation.mutate({ alertId: alert.id })}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No alerts yet</p>
                    <p className="text-sm">Alerts will appear here when thresholds are breached</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Thresholds */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Active Thresholds</CardTitle>
                <CardDescription>
                  Configured signal detection thresholds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {thresholds?.filter(t => t.enabled).slice(0, 10).map((threshold) => (
                    <div
                      key={threshold.id}
                      className="p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityBadge(threshold.severity)}
                      </div>
                      <p className="font-medium text-sm">{threshold.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {threshold.indicatorCode} {threshold.condition} {threshold.threshold}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
