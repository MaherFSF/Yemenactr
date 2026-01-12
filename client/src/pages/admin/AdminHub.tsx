import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Database,
  FileText,
  Globe,
  History,
  Key,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  Sliders,
  Users,
  Webhook,
  Zap
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
  // Monitoring
  {
    title: "API Health Dashboard",
    description: "Monitor connector status, view error rates, and trigger manual data refreshes",
    href: "/admin/api-health",
    icon: <Activity className="w-6 h-6" />,
    category: "monitoring",
    badge: "Live",
    badgeVariant: "default",
  },
  {
    title: "Alert History",
    description: "View and manage system alerts, acknowledge issues, and track resolutions",
    href: "/admin/alert-history",
    icon: <Bell className="w-6 h-6" />,
    category: "monitoring",
  },
  {
    title: "Webhook Settings",
    description: "Configure Slack, Discord, and custom webhook notifications",
    href: "/admin/webhooks",
    icon: <Webhook className="w-6 h-6" />,
    category: "monitoring",
    badge: "New",
    badgeVariant: "secondary",
  },
  {
    title: "Connector Thresholds",
    description: "Customize stale data thresholds for each data connector",
    href: "/admin/connector-thresholds",
    icon: <Sliders className="w-6 h-6" />,
    category: "monitoring",
  },
  // Data Management
  {
    title: "Data Quality",
    description: "Review data quality scores, validation rules, and accuracy metrics",
    href: "/admin/data-quality",
    icon: <Shield className="w-6 h-6" />,
    category: "data",
  },
  {
    title: "Provenance Ledger",
    description: "Track data lineage, source attribution, and transformation history",
    href: "/admin/provenance",
    icon: <History className="w-6 h-6" />,
    category: "data",
  },
  {
    title: "Signal Detection",
    description: "View detected anomalies, trends, and economic signals",
    href: "/admin/signals",
    icon: <Zap className="w-6 h-6" />,
    category: "data",
  },
  {
    title: "Publications",
    description: "Manage auto-generated reports, daily snapshots, and weekly digests",
    href: "/admin/publications",
    icon: <FileText className="w-6 h-6" />,
    category: "data",
  },
  // Settings
  {
    title: "Platform Settings",
    description: "Configure platform-wide settings, branding, and feature flags",
    href: "/admin/settings",
    icon: <Settings className="w-6 h-6" />,
    category: "settings",
  },
  {
    title: "API Keys",
    description: "Manage API keys for external integrations and partner access",
    href: "/admin/api-keys",
    icon: <Key className="w-6 h-6" />,
    category: "settings",
  },
  {
    title: "Localization",
    description: "Manage translations, RTL support, and regional settings",
    href: "/admin/localization",
    icon: <Globe className="w-6 h-6" />,
    category: "settings",
  },
  // Users
  {
    title: "User Management",
    description: "View users, manage roles, and configure access permissions",
    href: "/admin/users",
    icon: <Users className="w-6 h-6" />,
    category: "users",
  },
  {
    title: "Analytics",
    description: "View platform usage, popular indicators, and user engagement",
    href: "/admin/analytics",
    icon: <BarChart3 className="w-6 h-6" />,
    category: "users",
  },
  {
    title: "Feedback",
    description: "Review user feedback, feature requests, and bug reports",
    href: "/admin/feedback",
    icon: <MessageSquare className="w-6 h-6" />,
    category: "users",
  },
];

const categories = [
  { id: "monitoring", title: "Monitoring & Alerts", icon: <Activity className="w-5 h-5" /> },
  { id: "data", title: "Data Management", icon: <Database className="w-5 h-5" /> },
  { id: "settings", title: "Platform Settings", icon: <Settings className="w-5 h-5" /> },
  { id: "users", title: "Users & Analytics", icon: <Users className="w-5 h-5" /> },
];

export default function AdminHub() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with impressive gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Control Center</h1>
                <p className="text-white/70">Manage all aspects of the YETO platform</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-sm">Active Connectors</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-sm">Data Points</p>
                <p className="text-2xl font-bold">2,000+</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-sm">Active Users</p>
                <p className="text-2xl font-bold">150+</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-sm">System Health</p>
                <p className="text-2xl font-bold text-green-400">98%</p>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-20 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl" />
        </div>

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
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Refresh All Data
                </button>
              </Link>
              <Link href="/admin/alert-history">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  View Alerts
                </button>
              </Link>
              <Link href="/admin/webhooks">
                <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2">
                  <Webhook className="w-4 h-4" />
                  Configure Webhooks
                </button>
              </Link>
              <Link href="/data-repository">
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Browse Data
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
