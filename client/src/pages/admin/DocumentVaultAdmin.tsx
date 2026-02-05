/**
 * Document Vault Admin Dashboard
 * 
 * Monitoring and management:
 * - Ingestion runs and job status
 * - Document coverage by year and source
 * - Search index health
 * - Backfill plan management
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Database,
  Settings,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  BarChart3,
  Calendar,
  Target,
  Activity,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface JobStatus {
  id: number;
  jobType: string;
  jobStatus: string;
  totalItems?: number;
  processedItems?: number;
  successItems?: number;
  failedItems?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface BackfillPlan {
  id: number;
  sourceProductId: number;
  productName: string;
  targetYear: number;
  targetMonth: number | null;
  priority: string;
  status: string;
}

interface VaultStats {
  documents: any[];
  backfillPlans: any[];
  sourceProducts: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DocumentVaultAdmin() {
  const navigate = useNavigate();

  // State
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [backfillPlans, setBackfillPlans] = useState<BackfillPlan[]>([]);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"jobs" | "backfill" | "stats">("jobs");

  // Load data
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, plansRes, statsRes] = await Promise.all([
        fetch("/api/document-vault/jobs"),
        fetch("/api/document-vault/backfill-plans?limit=50"),
        fetch("/api/document-vault/stats"),
      ]);

      const [jobsData, plansData, statsData] = await Promise.all([
        jobsRes.json(),
        plansRes.json(),
        statsRes.json(),
      ]);

      setJobs(jobsData.jobs || []);
      setBackfillPlans(plansData.plans || []);
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading vault data:", error);
      setLoading(false);
    }
  };

  const runBackfillPlan = async (planId: number) => {
    if (!confirm("Start ingestion for this backfill plan?")) return;
    
    // This would trigger the ingestion process
    alert("Ingestion would be triggered (not fully implemented in UI)");
  };

  // Calculate metrics
  const runningJobs = jobs.filter(j => j.jobStatus === "running").length;
  const completedJobs = jobs.filter(j => j.jobStatus === "completed").length;
  const failedJobs = jobs.filter(j => j.jobStatus === "failed").length;
  const pendingPlans = backfillPlans.filter(p => p.status === "planned").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading vault data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                Document Vault Admin
              </h1>
              <p className="text-slate-600 mt-1">
                Monitor ingestion runs, coverage, and index health
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => navigate("/literature")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View Library
              </button>
            </div>
          </div>

          {/* Metrics Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Running Jobs</p>
                  <p className="text-2xl font-bold text-blue-900">{runningJobs}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{completedJobs}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">Failed</p>
                  <p className="text-2xl font-bold text-red-900">{failedJobs}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">Pending Plans</p>
                  <p className="text-2xl font-bold text-orange-900">{pendingPlans}</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2">
            {[
              { id: "jobs", label: "Active Jobs", icon: Activity },
              { id: "backfill", label: "Backfill Plans", icon: Target },
              { id: "stats", label: "Statistics", icon: BarChart3 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Recent Jobs
            </h2>
            {jobs.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No jobs found</p>
              </div>
            ) : (
              jobs.map(job => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg border border-slate-200 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-slate-500">
                          #{job.id}
                        </span>
                        <span className="font-medium text-slate-900">
                          {job.jobType.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${
                            job.jobStatus === "completed"
                              ? "bg-green-100 text-green-700"
                              : job.jobStatus === "running"
                              ? "bg-blue-100 text-blue-700"
                              : job.jobStatus === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {job.jobStatus}
                        </span>
                      </div>

                      {job.totalItems && (
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>
                            Progress: {job.processedItems || 0} / {job.totalItems}
                          </span>
                          <span>
                            Success: {job.successItems || 0}
                          </span>
                          <span>
                            Failed: {job.failedItems || 0}
                          </span>
                        </div>
                      )}

                      {job.totalItems && (
                        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                ((job.processedItems || 0) / job.totalItems) * 100
                              }%`,
                            }}
                          />
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        {job.startedAt && (
                          <span>
                            Started: {new Date(job.startedAt).toLocaleString()}
                          </span>
                        )}
                        {job.completedAt && (
                          <span>
                            Completed: {new Date(job.completedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Backfill Plans Tab */}
        {activeTab === "backfill" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Backfill Plans
              </h2>
              <span className="text-sm text-slate-600">
                {pendingPlans} pending plans
              </span>
            </div>
            {backfillPlans.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No backfill plans found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {backfillPlans.map(plan => (
                  <div
                    key={plan.id}
                    className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {plan.productName}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {plan.targetYear}
                          {plan.targetMonth && ` - Month ${plan.targetMonth}`}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          plan.priority === "critical"
                            ? "bg-red-100 text-red-700"
                            : plan.priority === "high"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {plan.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          plan.status === "planned"
                            ? "bg-blue-100 text-blue-700"
                            : plan.status === "ingested"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {plan.status}
                      </span>

                      {plan.status === "planned" && (
                        <button
                          onClick={() => runBackfillPlan(plan.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <PlayCircle className="w-3 h-3" />
                          Run
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && stats && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Vault Statistics
            </h2>

            {/* Document Stats */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Documents by Processing Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(stats.documents as any)[0]?.map((stat: any) => (
                  <div key={stat.processingStatus} className="text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.count}
                    </p>
                    <p className="text-sm text-slate-600 capitalize">
                      {stat.processingStatus?.replace(/_/g, " ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Backfill Stats */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Backfill Plans by Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(stats.backfillPlans as any)[0]?.map((stat: any) => (
                  <div key={stat.status} className="text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.count}
                    </p>
                    <p className="text-sm text-slate-600 capitalize">
                      {stat.status?.replace(/_/g, " ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Products */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Source Products
              </h3>
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-900">
                  {stats.sourceProducts}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Total configured source products
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
