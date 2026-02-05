/**
 * Operations Command Center - Consolidated admin dashboard
 * 
 * Real-time views:
 * - Ingestion Health (per source/product/endpoint)
 * - Gap Tickets (severity, ETA, owners)
 * - Contradiction Registry (conflicts, variance)
 * - Discovery Queue (candidate sources)
 * - License/Credential Risks (expiring keys)
 * - AI Audit Logs (citations, confidence)
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  AlertTriangle,
  Database,
  FileText,
  Key,
  Bot,
  TrendingUp,
  XCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Mail,
  Search,
  Shield
} from 'lucide-react';

export default function OperationsCommandCenter() {
  const [activeTab, setActiveTab] = useState('health');

  // Fetch data for each dashboard
  const { data: healthData, refetch: refetchHealth } = trpc.canonicalRegistry.getRegistryStats.useQuery();
  const { data: queueData } = trpc.backfill.getQueueStats.useQuery();
  
  const stats = healthData?.stats;
  const queueStats = queueData?.stats;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Operations Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of ingestion, data quality, and system health
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            refetchHealth();
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh All
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSources || 0}</div>
            <p className="text-xs text-muted-foreground">total registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.byStatus?.ACTIVE || 0}
            </div>
            <p className="text-xs text-muted-foreground">sources ingesting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-600">
              <Key className="h-4 w-4" />
              Needs Key
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.byStatus?.NEEDS_KEY || 0}
            </div>
            <p className="text-xs text-muted-foreground">access required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEndpoints || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.endpointCoverage || '0'}% coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.productCoverage || '0'}% coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueStats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">jobs pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="health">
            <Activity className="mr-2 h-4 w-4" />
            Health
          </TabsTrigger>
          <TabsTrigger value="gaps">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Gaps
          </TabsTrigger>
          <TabsTrigger value="contradictions">
            <XCircle className="mr-2 h-4 w-4" />
            Conflicts
          </TabsTrigger>
          <TabsTrigger value="discovery">
            <Search className="mr-2 h-4 w-4" />
            Discovery
          </TabsTrigger>
          <TabsTrigger value="licenses">
            <Shield className="mr-2 h-4 w-4" />
            Licenses
          </TabsTrigger>
          <TabsTrigger value="ai-audit">
            <Bot className="mr-2 h-4 w-4" />
            AI Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <IngestionHealthDashboard />
        </TabsContent>

        <TabsContent value="gaps">
          <GapTicketsDashboard />
        </TabsContent>

        <TabsContent value="contradictions">
          <ContradictionRegistryDashboard />
        </TabsContent>

        <TabsContent value="discovery">
          <DiscoveryQueueDashboard />
        </TabsContent>

        <TabsContent value="licenses">
          <LicenseRisksDashboard />
        </TabsContent>

        <TabsContent value="ai-audit">
          <AIAuditLogDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components for each tab
function IngestionHealthDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingestion Health Monitor</CardTitle>
        <CardDescription>Per source/product/endpoint status, last run, errors, records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Real-time ingestion monitoring</p>
          <p className="text-xs mt-2">View source health, error rates, and cost estimates</p>
        </div>
      </CardContent>
    </Card>
  );
}

function GapTicketsDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Gap Tickets</CardTitle>
        <CardDescription>Missing data, severity, ETA, recommended sources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Gap tracking and resolution</p>
          <p className="text-xs mt-2">Track missing data and assign to owner agents</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ContradictionRegistryDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contradiction Registry</CardTitle>
        <CardDescription>Conflicts between sources, variance %, actions taken</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <XCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Source conflict tracking</p>
          <p className="text-xs mt-2">Detect and resolve data contradictions (>15% variance)</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DiscoveryQueueDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Source Discovery Queue</CardTitle>
        <CardDescription>Candidate sources/products to add to registry</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>New source candidates</p>
          <p className="text-xs mt-2">Review and approve new data sources</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LicenseRisksDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>License & Credential Risks</CardTitle>
        <CardDescription>Expiring keys, restricted sources, ToS changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Compliance monitoring</p>
          <p className="text-xs mt-2">Track API keys, licenses, and access issues</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AIAuditLogDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Audit Logs</CardTitle>
        <CardDescription>Response ID, citations, confidence, policy checks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Agent response tracking</p>
          <p className="text-xs mt-2">Monitor AI citations and evidence coverage</p>
        </div>
      </CardContent>
    </Card>
  );
}
