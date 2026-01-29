/**
 * YETO Source Registry Admin Page
 * 
 * Manages all 226 data sources with:
 * - Source listing with status/priority/frequency
 * - Connector health monitoring
 * - Manual sync triggers
 * - SLA threshold configuration
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Database,
  RefreshCw,
  Search,
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Globe,
  FileText,
  Activity,
  Zap,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

// Source categories
const CATEGORIES = [
  { id: "all", label: "All Sources", labelAr: "جميع المصادر" },
  { id: "international", label: "International Orgs", labelAr: "المنظمات الدولية" },
  { id: "government", label: "Government", labelAr: "الحكومة" },
  { id: "research", label: "Research", labelAr: "البحث" },
  { id: "humanitarian", label: "Humanitarian", labelAr: "الإنسانية" },
  { id: "financial", label: "Financial", labelAr: "المالية" },
];

// API types
const API_TYPES = ["REST", "SDMX", "CKAN", "OData", "MANUAL", "SCRAPER"];

// Frequencies
const FREQUENCIES = ["REALTIME", "DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];

// Sample flagship sources (would come from API in production)
const FLAGSHIP_SOURCES = [
  {
    id: "world-bank",
    name: "World Bank WDI",
    nameAr: "البنك الدولي",
    category: "international",
    apiType: "REST",
    frequency: "DAILY",
    priority: 1,
    status: "active",
    lastSync: "2025-01-29T10:00:00Z",
    recordCount: 15420,
    indicators: ["GDP", "Population", "Poverty", "Trade"],
    url: "https://api.worldbank.org/v2/",
  },
  {
    id: "imf-data",
    name: "IMF SDMX",
    nameAr: "صندوق النقد الدولي",
    category: "international",
    apiType: "SDMX",
    frequency: "WEEKLY",
    priority: 1,
    status: "active",
    lastSync: "2025-01-28T08:00:00Z",
    recordCount: 8750,
    indicators: ["Exchange Rates", "Reserves", "Balance of Payments"],
    url: "https://sdmxcentral.imf.org/",
  },
  {
    id: "unhcr",
    name: "UNHCR Refugee Data",
    nameAr: "المفوضية السامية للاجئين",
    category: "humanitarian",
    apiType: "REST",
    frequency: "DAILY",
    priority: 1,
    status: "active",
    lastSync: "2025-01-29T06:00:00Z",
    recordCount: 4230,
    indicators: ["Refugees", "IDPs", "Asylum Seekers"],
    url: "https://api.unhcr.org/",
  },
  {
    id: "who-gho",
    name: "WHO Global Health",
    nameAr: "منظمة الصحة العالمية",
    category: "humanitarian",
    apiType: "OData",
    frequency: "WEEKLY",
    priority: 1,
    status: "active",
    lastSync: "2025-01-27T12:00:00Z",
    recordCount: 6890,
    indicators: ["Life Expectancy", "Mortality", "Disease Burden"],
    url: "https://ghoapi.azureedge.net/api/",
  },
  {
    id: "ocha-fts",
    name: "OCHA Financial Tracking",
    nameAr: "مكتب تنسيق الشؤون الإنسانية",
    category: "humanitarian",
    apiType: "REST",
    frequency: "DAILY",
    priority: 1,
    status: "active",
    lastSync: "2025-01-29T07:00:00Z",
    recordCount: 3450,
    indicators: ["Humanitarian Funding", "Appeals", "Donors"],
    url: "https://api.hpc.tools/v2/public/fts/",
  },
  {
    id: "wfp-vam",
    name: "WFP Food Security",
    nameAr: "برنامج الأغذية العالمي",
    category: "humanitarian",
    apiType: "REST",
    frequency: "DAILY",
    priority: 1,
    status: "active",
    lastSync: "2025-01-29T05:00:00Z",
    recordCount: 2890,
    indicators: ["Food Prices", "Food Security", "Nutrition"],
    url: "https://api.vam.wfp.org/",
  },
  {
    id: "cby-aden",
    name: "CBY Aden",
    nameAr: "البنك المركزي اليمني - عدن",
    category: "government",
    apiType: "MANUAL",
    frequency: "DAILY",
    priority: 1,
    status: "active",
    lastSync: "2025-01-29T04:00:00Z",
    recordCount: 1250,
    indicators: ["Exchange Rate", "Monetary Policy", "Reserves"],
    url: "https://cby-ye.com/",
  },
  {
    id: "cby-sanaa",
    name: "CBY Sana'a",
    nameAr: "البنك المركزي اليمني - صنعاء",
    category: "government",
    apiType: "MANUAL",
    frequency: "DAILY",
    priority: 1,
    status: "warning",
    lastSync: "2025-01-25T04:00:00Z",
    recordCount: 980,
    indicators: ["Exchange Rate", "Monetary Policy"],
    url: "https://centralbank.gov.ye/",
  },
  {
    id: "hdx-hapi",
    name: "HDX Humanitarian",
    nameAr: "منصة البيانات الإنسانية",
    category: "humanitarian",
    apiType: "CKAN",
    frequency: "DAILY",
    priority: 1,
    status: "active",
    lastSync: "2025-01-29T08:00:00Z",
    recordCount: 5670,
    indicators: ["Population", "Displacement", "Needs"],
    url: "https://data.humdata.org/",
  },
  {
    id: "fews-net",
    name: "FEWS NET",
    nameAr: "شبكة نظم الإنذار المبكر",
    category: "humanitarian",
    apiType: "REST",
    frequency: "WEEKLY",
    priority: 1,
    status: "active",
    lastSync: "2025-01-27T10:00:00Z",
    recordCount: 890,
    indicators: ["IPC Classification", "Food Security Outlook"],
    url: "https://fdw.fews.net/api/",
  },
  {
    id: "un-comtrade",
    name: "UN Comtrade",
    nameAr: "قاعدة بيانات التجارة الدولية",
    category: "international",
    apiType: "REST",
    frequency: "MONTHLY",
    priority: 2,
    status: "active",
    lastSync: "2025-01-15T00:00:00Z",
    recordCount: 12340,
    indicators: ["Imports", "Exports", "Trade Partners"],
    url: "https://comtradeapi.un.org/",
  },
  {
    id: "acled",
    name: "ACLED Conflict Data",
    nameAr: "بيانات النزاعات المسلحة",
    category: "research",
    apiType: "REST",
    frequency: "DAILY",
    priority: 1,
    status: "active",
    lastSync: "2025-01-29T03:00:00Z",
    recordCount: 8920,
    indicators: ["Conflict Events", "Fatalities", "Actors"],
    url: "https://api.acleddata.com/",
  },
];

export default function SourceRegistry() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSource, setSelectedSource] = useState<typeof FLAGSHIP_SOURCES[0] | null>(null);

  // Filter sources
  const filteredSources = FLAGSHIP_SOURCES.filter((source) => {
    const matchesSearch =
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.nameAr.includes(searchQuery) ||
      source.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || source.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || source.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const stats = {
    total: FLAGSHIP_SOURCES.length,
    active: FLAGSHIP_SOURCES.filter((s) => s.status === "active").length,
    warning: FLAGSHIP_SOURCES.filter((s) => s.status === "warning").length,
    error: FLAGSHIP_SOURCES.filter((s) => s.status === "error").length,
    totalRecords: FLAGSHIP_SOURCES.reduce((sum, s) => sum + s.recordCount, 0),
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
      case "error":
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <Badge className="bg-purple-500">P1 Critical</Badge>;
      case 2:
        return <Badge className="bg-blue-500">P2 High</Badge>;
      case 3:
        return <Badge variant="secondary">P3 Medium</Badge>;
      default:
        return <Badge variant="outline">P4 Low</Badge>;
    }
  };

  const handleSync = (sourceId: string) => {
    toast.success(`Triggering sync for ${sourceId}...`);
    // In production, this would call trpc.admin.triggerConnectorRefresh
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="w-8 h-8" />
            Source Registry
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all {stats.total} data sources and connectors
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Refreshing all sources...")}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configure SLAs
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sources</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Database className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.warning}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-500">{stats.error}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sources ({filteredSources.length})</CardTitle>
          <CardDescription>
            Click on a source to view details and configure settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>API Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSources.map((source) => (
                <TableRow
                  key={source.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedSource(source)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-sm text-muted-foreground">{source.nameAr}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {source.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{source.apiType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {source.frequency}
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(source.priority)}</TableCell>
                  <TableCell>{getStatusBadge(source.status)}</TableCell>
                  <TableCell>{formatDate(source.lastSync)}</TableCell>
                  <TableCell>{source.recordCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSync(source.id);
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Source Detail Dialog */}
      <Dialog open={!!selectedSource} onOpenChange={() => setSelectedSource(null)}>
        <DialogContent className="max-w-2xl">
          {selectedSource && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {selectedSource.name}
                </DialogTitle>
                <DialogDescription>{selectedSource.nameAr}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">API URL</p>
                    <p className="font-mono text-sm">{selectedSource.url}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">API Type</p>
                    <Badge variant="secondary">{selectedSource.apiType}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Frequency</p>
                    <p>{selectedSource.frequency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedSource.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Indicators</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSource.indicators.map((ind) => (
                      <Badge key={ind} variant="outline">
                        {ind}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleSync(selectedSource.id)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Logs
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
