import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Bell, 
  Filter,
  Search,
  XCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Calendar,
  User,
  MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Types for alerts (matches API response)
interface Alert {
  id: number;
  type: string;
  severity: string;
  title: string;
  message: string | null;  // API returns 'message' not 'description'
  source: string | null;   // API returns 'source' not 'indicatorCode'
  acknowledged: boolean;   // API returns 'acknowledged' not 'isRead'
  acknowledgedAt: string | null;
  resolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
}

export default function AlertHistory() {
  const [filter, setFilter] = useState<"all" | "unread" | "critical" | "warning">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch alerts from database
  // @ts-ignore - tRPC types may not be fully generated yet
  const { data: alerts, isLoading, refetch } = trpc.admin.getAlerts.useQuery({ status: filter, limit: 100 });

  // Mutation to acknowledge alert
  // @ts-ignore
  const acknowledgeAlert = trpc.admin.acknowledgeAlert?.useMutation?.({
    onSuccess: () => {
      toast.success("Alert acknowledged");
      refetch();
    },
    onError: (error: { message: string }) => {
      toast.error("Failed to acknowledge", { description: error.message });
    },
  });

  // Mutation to resolve alert
  // @ts-ignore
  const resolveAlert = trpc.admin.resolveAlert?.useMutation?.({
    onSuccess: () => {
      toast.success("Alert resolved");
      refetch();
    },
    onError: (error: { message: string }) => {
      toast.error("Failed to resolve", { description: error.message });
    },
  });

  // Filter and search alerts
  const filteredAlerts = (alerts || []).filter((alert: Alert) => {
    // Apply type filter
    if (filter === "unread" && alert.acknowledged) return false;
    if (filter === "critical" && alert.severity !== "critical") return false;
    if (filter === "warning" && alert.severity !== "warning") return false;
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(query) ||
        alert.message?.toLowerCase().includes(query) ||
        alert.source?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total: (alerts || []).length,
    unread: (alerts || []).filter((a: Alert) => !a.acknowledged).length,
    critical: (alerts || []).filter((a: Alert) => a.severity === "critical").length,
    warning: (alerts || []).filter((a: Alert) => a.severity === "warning").length,
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info": return <Info className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": 
        return <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200">Critical</Badge>;
      case "warning": 
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Warning</Badge>;
      case "info": 
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">Info</Badge>;
      default: 
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Bell className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">Alert History</h1>
            </div>
            <p className="text-white/80 max-w-2xl">
              Monitor system alerts, connector failures, and data quality issues. 
              Acknowledge and resolve alerts to maintain platform health.
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -right-5 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-gray-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Bell className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant={filter === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All ({stats.total})
                </Button>
                <Button 
                  variant={filter === "unread" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("unread")}
                  className={filter === "unread" ? "" : "border-blue-200 text-blue-600 hover:bg-blue-50"}
                >
                  Unread ({stats.unread})
                </Button>
                <Button 
                  variant={filter === "critical" ? "destructive" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("critical")}
                  className={filter === "critical" ? "" : "border-red-200 text-red-600 hover:bg-red-50"}
                >
                  Critical ({stats.critical})
                </Button>
                <Button 
                  variant={filter === "warning" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("warning")}
                  className={filter === "warning" ? "bg-yellow-500 hover:bg-yellow-600" : "border-yellow-200 text-yellow-600 hover:bg-yellow-50"}
                >
                  Warnings ({stats.warning})
                </Button>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search alerts..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Alerts
            </CardTitle>
            <CardDescription>
              {filteredAlerts.length} alerts matching your filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-4 border rounded-lg">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                <p className="text-muted-foreground">
                  No alerts match your current filters. The system is running smoothly.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert: Alert) => (
                  <div 
                    key={alert.id} 
                    className={`flex gap-4 p-4 border rounded-lg transition-all hover:shadow-md ${
                      !alert.acknowledged ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200" : ""
                    } ${
                      alert.severity === "critical" ? "border-l-4 border-l-red-500" :
                      alert.severity === "warning" ? "border-l-4 border-l-yellow-500" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium truncate">{alert.title}</h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getSeverityBadge(alert.severity)}
                          {!alert.acknowledged && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {alert.message && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {alert.message}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatTimeAgo(new Date(alert.createdAt))}
                        </span>
                        {alert.source && (
                          <span className="flex items-center gap-1">
                            <Filter className="w-3 h-3" />
                            {alert.source}
                          </span>
                        )}
                        {alert.acknowledgedAt && (
                          <span className="flex items-center gap-1 text-green-600">
                            <User className="w-3 h-3" />
                            Acknowledged
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {!alert.acknowledged && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => acknowledgeAlert?.mutate?.({ id: alert.id })}
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => resolveAlert?.mutate?.({ id: alert.id })}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
