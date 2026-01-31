import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Clock,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Database,
  Bell,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";

export default function SchedulerDashboard() {
  const { user } = useAuth();
  
  const [runningJob, setRunningJob] = useState<string | null>(null);

  const { data: status, refetch: refetchStatus } = trpc.scheduler.getStatus.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );
  const { data: history, refetch: refetchHistory } = trpc.scheduler.getHistory.useQuery(
    { limit: 20 },
    { enabled: user?.role === "admin" }
  );
  const { data: jobs } = trpc.scheduler.getJobs.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );

  const runJobMutation = trpc.scheduler.runJob.useMutation({
    onSuccess: (result) => {
      toast[result.status === "success" ? "success" : "error"](
        result.status === "success" ? "Job completed" : "Job failed",
        { description: `${result.jobName}: ${result.recordsProcessed} records processed in ${result.duration}ms` }
      );
      refetchStatus();
      refetchHistory();
      setRunningJob(null);
    },
    onError: (error) => {
      toast.error("Error running job", { description: error.message });
      setRunningJob(null);
    },
  });

  const runAllMutation = trpc.scheduler.runAll.useMutation({
    onSuccess: (results) => {
      const successful = results.filter(r => r.status === "success").length;
      toast.success("All jobs completed", { description: `${successful}/${results.length} jobs succeeded` });
      refetchStatus();
      refetchHistory();
    },
  });

  const setEnabledMutation = trpc.scheduler.setEnabled.useMutation({
    onSuccess: () => {
      refetchStatus();
      toast.success("Job status updated");
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to access the scheduler dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Success</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "running":
        return <Badge className="bg-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
      case "skipped":
        return <Badge variant="secondary"><Pause className="w-3 h-3 mr-1" />Skipped</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#2e6b4f] text-white py-8">
        <div className="container">
          <Link href="/admin">
            <Button variant="ghost" className="text-white/70 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Scheduler Dashboard</h1>
          <p className="text-white/70">
            Manage automated data refresh jobs and signal detection
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{status?.totalJobs || 0}</p>
                  <p className="text-sm text-gray-500">Total Jobs</p>
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
                  <p className="text-2xl font-bold">{status?.enabledJobs || 0}</p>
                  <p className="text-sm text-gray-500">Enabled Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{formatDate(status?.lastRunAt)}</p>
                  <p className="text-sm text-gray-500">Last Run</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{formatDate(status?.nextRunAt)}</p>
                  <p className="text-sm text-gray-500">Next Run</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => runAllMutation.mutate()}
            disabled={runAllMutation.isPending}
            className="bg-[#2e6b4f] hover:bg-[#0d5a34]"
          >
            {runAllMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Run All Jobs Now
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              refetchStatus();
              refetchHistory();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">Scheduled Jobs</TabsTrigger>
            <TabsTrigger value="history">Run History</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Jobs</CardTitle>
                <CardDescription>
                  Configure and manage automated data refresh jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs?.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          job.type === "signal_detection" ? "bg-yellow-100" : "bg-blue-100"
                        }`}>
                          {job.type === "signal_detection" ? (
                            <Bell className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <Database className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{job.name}</p>
                          <p className="text-sm text-gray-500">{job.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Cron: {job.cronExpression}
                            {job.connector && ` • Connector: ${job.connector}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={job.enabled}
                          onCheckedChange={(enabled) =>
                            setEnabledMutation.mutate({ jobId: job.id, enabled })
                          }
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRunningJob(job.id);
                            runJobMutation.mutate({ jobId: job.id });
                          }}
                          disabled={runningJob === job.id}
                        >
                          {runningJob === job.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Run History</CardTitle>
                <CardDescription>
                  Recent job executions and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history?.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusBadge(run.status)}
                        <div>
                          <p className="font-medium">{run.jobName}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(run.startedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {run.recordsProcessed} records
                        </p>
                        <p className="text-xs text-gray-500">
                          {run.duration ? `${run.duration}ms` : "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!history || history.length === 0) && (
                    <p className="text-center text-gray-500 py-8">
                      No run history yet. Jobs will appear here after they execute.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
