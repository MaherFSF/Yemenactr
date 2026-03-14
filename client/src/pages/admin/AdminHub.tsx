import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import AdminGuard from "@/components/AdminGuard";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  CheckCircle2,
  Database,
  FileText,
  Globe,
  History,
  Key,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  Palette,
  RefreshCw,
  Settings,
  Shield,
  Sliders,
  Users,
  Webhook,
  Zap,
  TrendingUp,
  Server,
  Radio,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

interface AdminPage {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  category: "monitoring" | "data" | "settings" | "users";
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

const adminPages: AdminPage[] = [
  { title: "API Health Dashboard", description: "Monitor connector status, error rates, and trigger data refreshes", href: "/admin/api-health", icon: <Activity className="w-6 h-6" />, category: "monitoring", badge: "Live", badgeVariant: "default" },
  { title: "Source Registry", description: "292 sources with tier classification, API URLs, and backfill status", href: "/admin/source-registry", icon: <Database className="w-6 h-6" />, category: "monitoring", badge: "292", badgeVariant: "secondary" },
  { title: "Data Freshness", description: "Monitor data staleness, freshness SLAs, and auto-refresh schedules", href: "/admin/data-freshness", icon: <Clock className="w-6 h-6" />, category: "monitoring" },
  { title: "Alert History", description: "View and manage system alerts, acknowledge issues, and track resolutions", href: "/admin/alert-history", icon: <Bell className="w-6 h-6" />, category: "monitoring" },
  { title: "Webhook Settings", description: "Configure Slack, Discord, and custom webhook notifications", href: "/admin/webhooks", icon: <Webhook className="w-6 h-6" />, category: "monitoring" },
  { title: "Connector Thresholds", description: "Customize stale data thresholds for each data connector", href: "/admin/connector-thresholds", icon: <Sliders className="w-6 h-6" />, category: "monitoring" },
  { title: "Data Coverage", description: "Year-by-year heatmap showing indicator coverage and gaps", href: "/data-coverage", icon: <BarChart3 className="w-6 h-6" />, category: "data", badge: "New", badgeVariant: "secondary" },
  { title: "Backfill Dashboard", description: "Run and monitor data backfill from World Bank, IMF, FAO, ILO, WHO", href: "/admin/backfill-dashboard", icon: <RefreshCw className="w-6 h-6" />, category: "data" },
  { title: "Report Workflow", description: "Manage report drafts, reviews, approvals, and publications", href: "/admin/reports", icon: <FileText className="w-6 h-6" />, category: "data" },
  { title: "Visualization Builder", description: "Create and manage data visualizations with evidence packs", href: "/admin/visualizations", icon: <LineChart className="w-6 h-6" />, category: "data" },
  { title: "Insight Miner", description: "AI-detected trends, anomalies, and storylines for editorial review", href: "/admin/insights", icon: <Brain className="w-6 h-6" />, category: "data", badge: "AI", badgeVariant: "default" },
  { title: "Data Quality", description: "Review data quality scores, validation rules, and accuracy metrics", href: "/admin/data-quality", icon: <Shield className="w-6 h-6" />, category: "data" },
  { title: "Platform Settings", description: "Configure platform-wide settings, branding, and feature flags", href: "/admin/settings", icon: <Settings className="w-6 h-6" />, category: "settings" },
  { title: "API Keys", description: "Manage API keys for external integrations and partner access", href: "/admin/api-keys", icon: <Key className="w-6 h-6" />, category: "settings" },
  { title: "Export Bundle", description: "Create deployable packages for GitHub and AWS", href: "/admin/export", icon: <Database className="w-6 h-6" />, category: "settings" },
  { title: "Localization", description: "Manage translations, RTL support, and regional settings", href: "/admin/localization", icon: <Globe className="w-6 h-6" />, category: "settings" },
  { title: "User Management", description: "View users, manage roles, and configure access permissions", href: "/admin/users", icon: <Users className="w-6 h-6" />, category: "users" },
  { title: "Analytics", description: "View platform usage, popular indicators, and user engagement", href: "/admin/analytics", icon: <BarChart3 className="w-6 h-6" />, category: "users" },
  { title: "Feedback", description: "Review user feedback, feature requests, and bug reports", href: "/admin/feedback", icon: <MessageSquare className="w-6 h-6" />, category: "users" },
];

const categories = [
  { id: "monitoring", title: "Monitoring & Data Sources", icon: <Activity className="w-5 h-5" /> },
  { id: "data", title: "Data Management & Analysis", icon: <Database className="w-5 h-5" /> },
  { id: "settings", title: "Platform Settings", icon: <Settings className="w-5 h-5" /> },
  { id: "users", title: "Users & Analytics", icon: <Users className="w-5 h-5" /> },
];

export default function AdminHub() {
  const { data: stats, isLoading: statsLoading } = trpc.admin.getSystemStats.useQuery();
  const { data: connectors, isLoading: connectorsLoading } = trpc.admin.getConnectorStatus.useQuery();

  const activeConnectors = connectors?.filter(c => c.status === "active").length || 0;
  const totalConnectorRecords = connectors?.reduce((sum, c) => sum + (c.recordCount || 0), 0) || 0;

  return (
    <AdminGuard>
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with live stats */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a2e1f] via-[#0d3b28] to-[#0a2e1f] p-8 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-[#d4a843]/20 rounded-xl backdrop-blur-sm border border-[#d4a843]/30">
                <LayoutDashboard className="w-8 h-8 text-[#d4a843]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">YETO Admin Control Center</h1>
                <p className="text-white/70">Yemen Economic Transparency Observatory — Platform Operations</p>
              </div>
            </div>
            
            {/* Live Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
              <StatCard label="Total Sources" value={stats?.totalSources} loading={statsLoading} icon={<Database className="w-4 h-4" />} />
              <StatCard label="Active Sources" value={stats?.activeSources} loading={statsLoading} icon={<CheckCircle2 className="w-4 h-4 text-green-400" />} />
              <StatCard label="API Connected" value={stats?.sourcesWithApi} loading={statsLoading} icon={<Radio className="w-4 h-4 text-blue-400" />} />
              <StatCard label="Indicators" value={stats?.totalIndicators} loading={statsLoading} icon={<TrendingUp className="w-4 h-4 text-[#d4a843]" />} />
              <StatCard label="Data Points" value={stats?.totalDataPoints} loading={statsLoading} icon={<Server className="w-4 h-4 text-purple-400" />} format="compact" />
              <StatCard label="Needs API Key" value={stats?.sourcesNeedingKey} loading={statsLoading} icon={<Key className="w-4 h-4 text-orange-400" />} highlight={true} />
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#d4a843]/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-20 w-40 h-40 bg-[#107040]/20 rounded-full blur-2xl" />
        </div>

        {/* Source Connection Status - Live from DB */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span className="p-1.5 bg-primary/10 rounded-lg text-primary"><Radio className="w-5 h-5" /></span>
              Live Data Source Status
            </div>
            <Link href="/admin/api-health">
              <Button variant="outline" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
          
          {connectorsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {connectors?.map(conn => (
                <div key={conn.id} className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    conn.status === 'active' ? 'bg-green-500' : 
                    conn.status === 'auth_required' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{conn.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {conn.recordCount > 0 ? `${conn.recordCount.toLocaleString()} records` : 'No data'}
                      {conn.latestYear ? ` · Latest: ${conn.latestYear}` : ''}
                    </p>
                  </div>
                  <Badge variant={conn.status === 'active' ? 'default' : conn.status === 'auth_required' ? 'secondary' : 'destructive'} className="text-xs flex-shrink-0">
                    {conn.status === 'active' ? 'Connected' : conn.status === 'auth_required' ? 'Needs Key' : 'Offline'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sector Coverage - Live from DB */}
        {stats?.sectorCoverage && stats.sectorCoverage.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span className="p-1.5 bg-primary/10 rounded-lg text-primary"><BarChart3 className="w-5 h-5" /></span>
              Sector Data Coverage
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {stats.sectorCoverage.map(sec => (
                <div key={sec.sector} className="p-4 rounded-lg border bg-card">
                  <p className="font-medium text-sm capitalize">{sec.sector?.replace(/_/g, ' ') || 'Unknown'}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-primary">{sec.indicators}</span>
                    <span className="text-xs text-muted-foreground">indicators</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{sec.dataPoints.toLocaleString()} data points</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Pages by Category */}
        {categories.map((category) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span className="p-1.5 bg-primary/10 rounded-lg text-primary">
                {category.icon}
              </span>
              {category.title}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminPages
                .filter((page) => page.category === category.id)
                .map((page) => (
                  <Link key={page.href} href={page.href}>
                    <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            {page.icon}
                          </div>
                          {page.badge && (
                            <Badge variant={page.badgeVariant || "default"}>
                              {page.badge}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-3">{page.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-2">
                          {page.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        ))}

        {/* Source Action Items - Non-API Sources Needing Attention */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="p-1.5 bg-orange-500/10 rounded-lg text-orange-500"><AlertTriangle className="w-5 h-5" /></span>
            Action Items: Sources Needing Attention
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Sources needing API keys */}
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-orange-500" />
                  Sources Needing API Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['UN Comtrade (trade data)', 'ACLED (conflict events)', 'IEA (energy data)', 'Bloomberg (financial)'].map((src, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950/20 rounded text-sm">
                    <span>{src}</span>
                    <Badge variant="secondary" className="text-xs">Needs Key</Badge>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-1">Register API keys in Settings to unlock these data sources</p>
              </CardContent>
            </Card>

            {/* Manual upload sources */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Manual Upload Sources (250+)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['CBY Aden Reports (PDF)', 'Ministry of Finance Bulletins', 'CSO Statistical Yearbooks', 'SCMCHA Humanitarian Reports'].map((src, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-sm">
                    <span>{src}</span>
                    <Badge variant="outline" className="text-xs">Manual</Badge>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-1">These sources require manual PDF/Excel upload via the Source Registry</p>
              </CardContent>
            </Card>

            {/* Recently ingested */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Recently Connected APIs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: 'World Bank WDI', records: '2,085+', status: 'Live' },
                  { name: 'UNHCR Population', records: '39', status: 'Live' },
                  { name: 'OpenAlex Research', records: '1,397', status: 'Live' },
                  { name: 'IMF WEO (via WB)', records: '263', status: 'Live' },
                ].map((src, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded text-sm">
                    <span>{src.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{src.records}</span>
                      <Badge className="text-xs bg-green-500">{src.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stale data alerts */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500" />
                  Stale Data Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: 'Exchange Rate (Sanaa)', last: '2024-12', threshold: '30 days' },
                  { name: 'Food Prices Index', last: '2023-06', threshold: '90 days' },
                  { name: 'Labor Force Survey', last: '2022-12', threshold: '180 days' },
                ].map((src, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded text-sm">
                    <div>
                      <span>{src.name}</span>
                      <p className="text-xs text-muted-foreground">Last: {src.last}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">Stale</Badge>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-1">Run backfill to attempt automatic refresh</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/api-health">
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 dark:bg-green-900/30 dark:text-green-400">
                  <Activity className="w-4 h-4" />
                  Refresh All Data
                </button>
              </Link>
              <Link href="/admin/source-registry">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 dark:bg-blue-900/30 dark:text-blue-400">
                  <Database className="w-4 h-4" />
                  Source Registry
                </button>
              </Link>
              <Link href="/data-coverage">
                <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 dark:bg-purple-900/30 dark:text-purple-400">
                  <BarChart3 className="w-4 h-4" />
                  Coverage Dashboard
                </button>
              </Link>
              <Link href="/admin/backfill-dashboard">
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-2 dark:bg-orange-900/30 dark:text-orange-400">
                  <RefreshCw className="w-4 h-4" />
                  Run Backfill
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
    </AdminGuard>
  );
}

function StatCard({ label, value, loading, icon, format, highlight }: { 
  label: string; value?: number; loading: boolean; icon: React.ReactNode; format?: string; highlight?: boolean 
}) {
  const formatValue = (v: number) => {
    if (format === 'compact') {
      if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
      if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    }
    return v.toLocaleString();
  };

  return (
    <div className={`backdrop-blur-sm rounded-lg p-3 border ${highlight ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/10 border-white/10'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-white/60 text-xs">{label}</p>
      </div>
      {loading ? (
        <Skeleton className="h-7 w-16 bg-white/10" />
      ) : (
        <p className={`text-xl font-bold ${highlight ? 'text-orange-400' : 'text-white'}`}>
          {value !== undefined ? formatValue(value) : '—'}
        </p>
      )}
    </div>
  );
}
