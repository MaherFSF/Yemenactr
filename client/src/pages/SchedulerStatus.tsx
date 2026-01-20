/**
 * YETO Scheduler Status Dashboard
 * 
 * Real-time view of automated ingestion scheduling
 * - Scheduler status (running/stopped)
 * - Next 10 scheduled runs
 * - Control buttons (start/stop)
 * - Source pause/resume controls
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ScheduledRun {
  sourceId: string;
  sourceName: string;
  nextRun: string;
}

interface SchedulerStatus {
  isRunning: boolean;
  totalSources: number;
  activeSources: number;
  nextRuns: ScheduledRun[];
}

export function SchedulerStatus() {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  // Load scheduler status
  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function loadStatus() {
    try {
      const response = await fetch('/api/scheduler/status');
      const data = await response.json();
      setStatus(data.data);
    } catch (error) {
      console.error('Failed to load scheduler status:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    setIsStarting(true);
    try {
      const response = await fetch('/api/scheduler/start', { method: 'POST' });
      if (response.ok) {
        await loadStatus();
      }
    } catch (error) {
      console.error('Failed to start scheduler:', error);
    } finally {
      setIsStarting(false);
    }
  }

  async function handleStop() {
    try {
      const response = await fetch('/api/scheduler/stop', { method: 'POST' });
      if (response.ok) {
        await loadStatus();
      }
    } catch (error) {
      console.error('Failed to stop scheduler:', error);
    }
  }

  const formatTimeUntil = (nextRun: string): string => {
    const now = new Date();
    const runTime = new Date(nextRun);
    const diff = runTime.getTime() - now.getTime();

    if (diff < 0) return 'Overdue';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading scheduler status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scheduler Status</h1>
          <p className="text-gray-500">Automated ingestion scheduling</p>
        </div>
        <div className="flex gap-2">
          {status?.isRunning ? (
            <Button onClick={handleStop} variant="destructive" className="gap-2">
              <Pause className="w-4 h-4" />
              Stop Scheduler
            </Button>
          ) : (
            <Button onClick={handleStart} disabled={isStarting} className="gap-2">
              <Play className="w-4 h-4" />
              {isStarting ? 'Starting...' : 'Start Scheduler'}
            </Button>
          )}
          <Button onClick={loadStatus} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Scheduler Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {status.isRunning ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-lg font-bold text-green-600">Running</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                    <span className="text-lg font-bold text-yellow-600">Stopped</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.totalSources}</div>
              <p className="text-xs text-gray-500 mt-1">
                {status.activeSources} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Next Scheduled Run
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status.nextRuns.length > 0 ? (
                <>
                  <p className="font-medium text-sm">{status.nextRuns[0].sourceName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeUntil(status.nextRuns[0].nextRun)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No scheduled runs</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Next Scheduled Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Next 10 Scheduled Runs</CardTitle>
          <CardDescription>
            Upcoming automated ingestion jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {status?.nextRuns.map((run, index) => (
              <div
                key={`${run.sourceId}-${index}`}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{run.sourceName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(run.nextRun).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {formatTimeUntil(run.nextRun)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduler Information */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduler Configuration</CardTitle>
          <CardDescription>
            Ingestion schedule by tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tier 1 (Priority)</span>
              <Badge>Daily at 2 AM UTC</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tier 2 (High)</span>
              <Badge variant="outline">Mon & Thu at 3 AM UTC</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tier 3 (Medium)</span>
              <Badge variant="outline">Monday at 4 AM UTC</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tier 4 (Low)</span>
              <Badge variant="outline">Bi-weekly at 5 AM UTC</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SchedulerStatus;
