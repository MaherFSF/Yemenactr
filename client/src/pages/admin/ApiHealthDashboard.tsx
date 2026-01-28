import { useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Database,
  Activity,
  Calendar,
  Play,
  Pause,
  Settings
} from "lucide-react";

interface ConnectorStatus {
  id: string;
  name: string;
  nameAr: string;
  status: "active" | "error" | "auth_required" | "unavailable";
  lastFetch: string | null;
  recordCount: number;
  latestYear: number | null;
  errorMessage: string | null;
  apiUrl: string;
}

interface SchedulerJob {
  id: number;
  jobName: string;
  jobType: string;
  cronExpression: string;
  isEnabled: boolean;
  lastRunAt: string | null;
  lastRunStatus: string | null;
  lastRunDuration: number | null;
  lastRunError: string | null;
  nextRunAt: string | null;
  runCount: number;
  failCount: number;
}

export default function ApiHealthDashboard() {
  // Using sonner toast directly
  const [refreshingConnector, setRefreshingConnector] = useState<string | null>(null);

  // Fetch connector status
  const { data: connectors, isLoading: loadingConnectors, refetch: refetchConnectors } = 
    // @ts-ignore - tRPC types may not be fully generated yet
    trpc.admin.getConnectorStatus?.useQuery?.() || { data: undefined, isLoading: true, refetch: () => {} };

  // Fetch scheduler jobs
  const { data: jobs, isLoading: loadingJobs, refetch: refetchJobs } = 
    // @ts-ignore - tRPC types may not be fully generated yet
    trpc.admin.getSchedulerJobs?.useQuery?.() || { data: undefined, isLoading: true, refetch: () => {} };

  // Mutation to trigger manual refresh
  // @ts-ignore - tRPC types may not be fully generated yet
  const triggerRefresh = trpc.admin.triggerConnectorRefresh?.useMutation?.({
    onSuccess: (data: { recordsIngested: number; connector: string }) => {
      toast.success(`${data.recordsIngested} records ingested from ${data.connector}`);
      refetchConnectors();
      setRefreshingConnector(null);
    },
    onError: (error: { message: string }) => {
      toast.error("Refresh Failed", { description: error.message });
      setRefreshingConnector(null);
    },
  });

  // Mutation to toggle job status
  const toggleJob = trpc.admin.toggleSchedulerJob?.useMutation?.({
    onSuccess: () => {
      toast.success("Job Updated");
      refetchJobs();
    },
    onError: (error: { message: string }) => {
      toast.error("Update Failed", { description: error.message });
    },
  });

  // Mutation to run job now
  // @ts-ignore - tRPC types may not be fully generated yet
  const runJobNow = trpc.admin.runSchedulerJobNow?.useMutation?.({
    onSuccess: (data: { jobName: string; duration: number }) => {
      toast.success(`${data.jobName} completed in ${data.duration}ms`);
      refetchJobs();
    },
    onError: (error: { message: string }) => {
      toast.error("Execution Failed", { description: error.message });
    },
  });

  const handleRefresh = (connectorId: string) => {
    setRefreshingConnector(connectorId);
    triggerRefresh.mutate({ connectorId });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case "error":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      case "auth_required":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertTriangle className="w-3 h-3 mr-1" />Auth Required</Badge>;
      case "unavailable":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30"><Clock className="w-3 h-3 mr-1" />Unavailable</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getJobStatusBadge = (status: string | null) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Success</Badge>;
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "running":
        return <Badge className="bg-blue-500/20 text-blue-400"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
      case "skipped":
        return <Badge className="bg-gray-500/20 text-gray-400">Skipped</Badge>;
      default:
        return <Badge variant="outline">Never Run</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Calculate summary stats
  const activeConnectors = connectors?.filter((c: ConnectorStatus) => c.status === "active").length || 0;
  const totalConnectors = connectors?.length || 0;
  const totalRecords = connectors?.reduce((sum: number, c: ConnectorStatus) => sum + c.recordCount, 0) || 0;
  const enabledJobs = jobs?.filter((j: SchedulerJob) => j.isEnabled).length || 0;
  const totalJobs = jobs?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">API Health Dashboard</h1>
            <p className="text-muted-foreground">Monitor data connectors and scheduled jobs</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => { refetchConnectors(); refetchJobs(); }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <Activity className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeConnectors}/{totalConnectors}</p>
                  <p className="text-sm text-muted-foreground">Active Connectors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Database className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Calendar className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enabledJobs}/{totalJobs}</p>
                  <p className="text-sm text-muted-foreground">Scheduled Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/10">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">6:00 AM</p>
                  <p className="text-sm text-muted-foreground">Daily Refresh (UTC)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Connectors */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Connectors
            </CardTitle>
            <CardDescription>External API connections for data ingestion</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingConnectors ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {connectors?.map((connector: ConnectorStatus) => (
                  <div 
                    key={connector.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30 hover:border-border/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="min-w-[200px]">
                        <p className="font-medium">{connector.name}</p>
                        <p className="text-sm text-muted-foreground">{connector.nameAr}</p>
                      </div>
                      {getStatusBadge(connector.status)}
                    </div>

                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{connector.recordCount.toLocaleString()}</p>
                        <p className="text-muted-foreground">Records</p>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <p className="font-medium">{connector.latestYear || "-"}</p>
                        <p className="text-muted-foreground">Latest Year</p>
                      </div>
                      <div className="text-center min-w-[150px]">
                        <p className="font-medium">{formatDate(connector.lastFetch)}</p>
                        <p className="text-muted-foreground">Last Fetch</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={connector.status === "auth_required" || connector.status === "unavailable" || refreshingConnector === connector.id}
                        onClick={() => handleRefresh(connector.id)}
                      >
                        {refreshingConnector === connector.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduler Jobs */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Scheduled Jobs
            </CardTitle>
            <CardDescription>Automated data refresh and maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingJobs ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {jobs?.map((job: SchedulerJob) => (
                  <div 
                    key={job.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30 hover:border-border/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="min-w-[200px]">
                        <p className="font-medium">{job.jobName}</p>
                        <p className="text-sm text-muted-foreground font-mono">{job.cronExpression}</p>
                      </div>
                      <Badge variant="outline">{job.jobType}</Badge>
                      {getJobStatusBadge(job.lastRunStatus)}
                    </div>

                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{job.runCount}</p>
                        <p className="text-muted-foreground">Runs</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-red-400">{job.failCount}</p>
                        <p className="text-muted-foreground">Fails</p>
                      </div>
                      <div className="text-center min-w-[100px]">
                        <p className="font-medium">{formatDuration(job.lastRunDuration)}</p>
                        <p className="text-muted-foreground">Duration</p>
                      </div>
                      <div className="text-center min-w-[150px]">
                        <p className="font-medium">{formatDate(job.nextRunAt)}</p>
                        <p className="text-muted-foreground">Next Run</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleJob.mutate({ jobId: job.id, isEnabled: !job.isEnabled })}
                        >
                          {job.isEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!job.isEnabled}
                          onClick={() => runJobNow.mutate({ jobId: job.id })}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Run Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Log */}
        {connectors?.some((c: ConnectorStatus) => c.errorMessage) && (
          <Card className="bg-card/50 border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Recent Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {connectors.filter((c: ConnectorStatus) => c.errorMessage).map((connector: ConnectorStatus) => (
                  <div key={connector.id} className="p-3 rounded bg-red-500/10 border border-red-500/20">
                    <p className="font-medium text-red-400">{connector.name}</p>
                    <p className="text-sm text-muted-foreground">{connector.errorMessage}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
