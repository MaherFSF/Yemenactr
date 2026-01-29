/**
 * Advanced Analytics Dashboard
 * Comprehensive analytics and insights for platform administrators
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Database,
  Activity,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Zap,
  RefreshCw,
  Download,
} from 'lucide-react';

// Mock data for analytics
const USAGE_METRICS = {
  totalQueries: 15847,
  uniqueUsers: 342,
  avgResponseTime: 1.2,
  satisfactionRate: 0.89,
  dataPointsServed: 2450000,
  reportsGenerated: 156,
};

const SECTOR_USAGE = [
  { sector: 'Currency & FX', queries: 4521, growth: 12.5 },
  { sector: 'Prices & Inflation', queries: 3892, growth: 8.3 },
  { sector: 'Trade & Commerce', queries: 2847, growth: -2.1 },
  { sector: 'Banking & Finance', queries: 2156, growth: 15.7 },
  { sector: 'Fiscal & Budget', queries: 1543, growth: 5.2 },
  { sector: 'Energy & Fuel', queries: 888, growth: 22.4 },
];

const DATA_QUALITY_METRICS = {
  overallCoverage: 0.87,
  evidenceCoverage: 0.92,
  contradictionRate: 0.08,
  avgConfidence: 'B',
  staleSources: 3,
  missingIndicators: 12,
};

const AGENT_PERFORMANCE = [
  { agent: 'One Brain', queries: 8547, accuracy: 0.94, avgTime: 0.8 },
  { agent: 'Currency Agent', queries: 2341, accuracy: 0.91, avgTime: 0.6 },
  { agent: 'Prices Agent', queries: 1987, accuracy: 0.89, avgTime: 0.7 },
  { agent: 'Trade Agent', queries: 1456, accuracy: 0.87, avgTime: 0.9 },
  { agent: 'Banking Agent', queries: 1234, accuracy: 0.92, avgTime: 0.5 },
];

const USER_SEGMENTS = [
  { segment: 'Policy Makers', users: 45, queries: 3200, avgSession: 12.5 },
  { segment: 'International Donors', users: 78, queries: 4500, avgSession: 18.2 },
  { segment: 'Researchers', users: 124, queries: 5100, avgSession: 25.3 },
  { segment: 'Journalists', users: 56, queries: 1800, avgSession: 8.7 },
  { segment: 'Private Sector', users: 39, queries: 1247, avgSession: 15.1 },
];

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercent = (num: number) => `${(num * 100).toFixed(1)}%`;

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Advanced Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform performance, usage patterns, and AI agent insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-blue-500" />
              <Badge variant="secondary" className="text-xs">+12%</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{formatNumber(USAGE_METRICS.totalQueries)}</div>
              <div className="text-xs text-muted-foreground">Total Queries</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-green-500" />
              <Badge variant="secondary" className="text-xs">+8%</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{USAGE_METRICS.uniqueUsers}</div>
              <div className="text-xs text-muted-foreground">Unique Users</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-purple-500" />
              <Badge variant="secondary" className="text-xs">-15%</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{USAGE_METRICS.avgResponseTime}s</div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <Badge variant="secondary" className="text-xs">+3%</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{formatPercent(USAGE_METRICS.satisfactionRate)}</div>
              <div className="text-xs text-muted-foreground">Satisfaction</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Database className="h-5 w-5 text-orange-500" />
              <Badge variant="secondary" className="text-xs">+25%</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{formatNumber(USAGE_METRICS.dataPointsServed)}</div>
              <div className="text-xs text-muted-foreground">Data Points</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Zap className="h-5 w-5 text-yellow-500" />
              <Badge variant="secondary" className="text-xs">+18%</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{USAGE_METRICS.reportsGenerated}</div>
              <div className="text-xs text-muted-foreground">Reports</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="data">Data Quality</TabsTrigger>
          <TabsTrigger value="users">User Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Sector Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Sector Usage Distribution</CardTitle>
              <CardDescription>Query volume and growth by economic sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SECTOR_USAGE.map((sector, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-40 font-medium truncate">{sector.sector}</div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(sector.queries / SECTOR_USAGE[0].queries) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right font-medium">{formatNumber(sector.queries)}</div>
                    <div className={`w-16 text-right flex items-center justify-end gap-1 ${sector.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {sector.growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {Math.abs(sector.growth)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { country: 'Yemen', users: 89, flag: '🇾🇪' },
                    { country: 'United States', users: 67, flag: '🇺🇸' },
                    { country: 'United Kingdom', users: 45, flag: '🇬🇧' },
                    { country: 'Saudi Arabia', users: 38, flag: '🇸🇦' },
                    { country: 'UAE', users: 32, flag: '🇦🇪' },
                    { country: 'Germany', users: 28, flag: '🇩🇪' },
                    { country: 'Other', users: 43, flag: '🌍' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span>{item.country}</span>
                      </div>
                      <Badge variant="outline">{item.users} users</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Peak Usage Hours (UTC)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { hour: '08:00-10:00', queries: 2450, label: 'Morning Peak' },
                    { hour: '13:00-15:00', queries: 1890, label: 'Afternoon' },
                    { hour: '10:00-12:00', queries: 1750, label: 'Late Morning' },
                    { hour: '15:00-17:00', queries: 1420, label: 'Late Afternoon' },
                    { hour: '06:00-08:00', queries: 980, label: 'Early Morning' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.hour}</div>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                      </div>
                      <Badge variant="secondary">{formatNumber(item.queries)} queries</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Agent Performance
              </CardTitle>
              <CardDescription>Query handling and accuracy metrics by agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Agent</th>
                      <th className="text-right py-3 px-4">Queries</th>
                      <th className="text-right py-3 px-4">Accuracy</th>
                      <th className="text-right py-3 px-4">Avg Time</th>
                      <th className="text-right py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AGENT_PERFORMANCE.map((agent, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">{agent.agent}</td>
                        <td className="py-3 px-4 text-right">{formatNumber(agent.queries)}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant={agent.accuracy >= 0.9 ? 'default' : 'secondary'}>
                            {formatPercent(agent.accuracy)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">{agent.avgTime}s</td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Healthy
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Learning Status */}
          <Card>
            <CardHeader>
              <CardTitle>Continuous Learning Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Last Learning Run</div>
                  <div className="text-lg font-medium mt-1">Today 02:00 UTC</div>
                  <Badge variant="outline" className="mt-2 text-green-600">Completed</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Knowledge Updates</div>
                  <div className="text-lg font-medium mt-1">47 updates</div>
                  <Badge variant="outline" className="mt-2">Last 24h</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Next Scheduled Run</div>
                  <div className="text-lg font-medium mt-1">Tomorrow 02:00 UTC</div>
                  <Badge variant="outline" className="mt-2 text-blue-600">Scheduled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">
                    {formatPercent(DATA_QUALITY_METRICS.overallCoverage)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Overall Data Coverage</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {formatPercent(DATA_QUALITY_METRICS.evidenceCoverage)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Evidence Coverage</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600">
                    {formatPercent(DATA_QUALITY_METRICS.contradictionRate)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Contradiction Rate</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Data Quality Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Stale Sources</div>
                    <div className="text-sm text-muted-foreground">Sources not updated in 30+ days</div>
                  </div>
                  <Badge variant="destructive">{DATA_QUALITY_METRICS.staleSources}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Missing Indicators</div>
                    <div className="text-sm text-muted-foreground">Required indicators without data</div>
                  </div>
                  <Badge variant="secondary">{DATA_QUALITY_METRICS.missingIndicators}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Average Confidence Grade</div>
                    <div className="text-sm text-muted-foreground">Across all data points</div>
                  </div>
                  <Badge>{DATA_QUALITY_METRICS.avgConfidence}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Segment Analysis</CardTitle>
              <CardDescription>Engagement metrics by stakeholder type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Segment</th>
                      <th className="text-right py-3 px-4">Users</th>
                      <th className="text-right py-3 px-4">Queries</th>
                      <th className="text-right py-3 px-4">Avg Session (min)</th>
                      <th className="text-right py-3 px-4">Queries/User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {USER_SEGMENTS.map((segment, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">{segment.segment}</td>
                        <td className="py-3 px-4 text-right">{segment.users}</td>
                        <td className="py-3 px-4 text-right">{formatNumber(segment.queries)}</td>
                        <td className="py-3 px-4 text-right">{segment.avgSession}</td>
                        <td className="py-3 px-4 text-right">
                          {(segment.queries / segment.users).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
