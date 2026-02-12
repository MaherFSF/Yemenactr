/**
 * YETO Source Registry Admin Page - CANONICAL
 * 
 * Displays all 295 sources from the canonical source_registry table
 * imported from YETO_Sources_Universe_Master_SINGLE_SOURCE_OF_TRUTH_v3_0.xlsx
 * 
 * Features:
 * - Source listing with tier/status/frequency filters
 * - Search across names and descriptions
 * - Source detail view with sector mappings
 * - Registry statistics and lint report
 */

import { useState, type ReactNode } from "react";
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
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Database,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Globe,
  FileText,
  Activity,
  Filter,
  ExternalLink,
  Key,
  Building,
  Calendar,
  Shield,
  AlertCircle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

// Tier colors
const TIER_COLORS: Record<string, string> = {
  T0: "bg-purple-600",
  T1: "bg-blue-600",
  T2: "bg-green-600",
  T3: "bg-yellow-600",
  T4: "bg-orange-600",
  UNKNOWN: "bg-gray-500",
};

// Status colors
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-500",
  NEEDS_KEY: "bg-yellow-500",
  PENDING_REVIEW: "bg-blue-500",
  INACTIVE: "bg-gray-500",
  DEPRECATED: "bg-red-500",
};

export default function SourceRegistry() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  // Fetch sources from canonical source_registry table
  const { data: sourcesData, isLoading: sourcesLoading, refetch: refetchSources } = trpc.sourceRegistry.getAll.useQuery({
    tier: tierFilter === "all" ? undefined : tierFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchQuery || undefined,
    limit: pageSize,
    offset: currentPage * pageSize,
  });

  // Fetch registry statistics
  const { data: statsData, isLoading: statsLoading } = trpc.sourceRegistry.getStats.useQuery();

  // Fetch lint report
  const { data: lintData } = trpc.sourceRegistry.getLintReport.useQuery();

  // Fetch selected source details
  const { data: sourceDetail, isLoading: detailLoading } = trpc.sourceRegistry.getById.useQuery(
    { sourceId: selectedSourceId || "" },
    { enabled: !!selectedSourceId }
  );

  // Fetch sectors
  const { data: sectorsData } = trpc.sourceRegistry.getSectors.useQuery();

  const sources = sourcesData?.sources || [];
  const total = sourcesData?.total || 0;
  const stats = statsData?.stats;
  const lint = lintData?.report;
  const sectors = sectorsData?.sectors || [];

  const getTierBadge = (tier: string) => {
    return (
      <Badge className={`${TIER_COLORS[tier] || TIER_COLORS.UNKNOWN} text-white`}>
        {tier}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const icons: Record<string, ReactNode> = {
      ACTIVE: <CheckCircle className="w-3 h-3 mr-1" />,
      NEEDS_KEY: <Key className="w-3 h-3 mr-1" />,
      PENDING_REVIEW: <Clock className="w-3 h-3 mr-1" />,
      INACTIVE: <XCircle className="w-3 h-3 mr-1" />,
      DEPRECATED: <AlertTriangle className="w-3 h-3 mr-1" />,
    };
    return (
      <Badge className={`${STATUS_COLORS[status] || STATUS_COLORS.PENDING_REVIEW} text-white`}>
        {icons[status]}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const handleRefresh = () => {
    refetchSources();
    toast.success("Refreshing source registry...");
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="w-8 h-8 text-[#2e8b6e]" />
            Source Registry
          </h1>
          <p className="text-muted-foreground mt-1">
            Canonical registry of {total} data sources from YETO Universe v3.0
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-[#2e8b6e]">{stats?.total || 0}</div>
            <p className="text-sm text-muted-foreground">Total Sources</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats?.needsKey || 0}</div>
            <p className="text-sm text-muted-foreground">Needs API Key</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats?.pending || 0}</div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats?.sectorCount || 0}</div>
            <p className="text-sm text-muted-foreground">Sectors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className={`text-2xl font-bold ${lint?.status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
              {lint?.p0Errors || 0} / {lint?.p1Warnings || 0}
            </div>
            <p className="text-sm text-muted-foreground">P0 / P1 Issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Distribution */}
      {stats?.byTier && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Source Tier Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(stats.byTier).map(([tier, count]) => (
                <div key={tier} className="flex items-center gap-2">
                  {getTierBadge(tier)}
                  <span className="text-sm font-medium">{count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({stats.tierDescriptions?.[tier]?.split(' ')[0] || tier})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sources..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v); setCurrentPage(0); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="T0">T0 - Government</SelectItem>
                <SelectItem value="T1">T1 - International</SelectItem>
                <SelectItem value="T2">T2 - Research</SelectItem>
                <SelectItem value="T3">T3 - Aggregated</SelectItem>
                <SelectItem value="T4">T4 - Supplementary</SelectItem>
                <SelectItem value="UNKNOWN">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(0); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="NEEDS_KEY">Needs API Key</SelectItem>
                <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="DEPRECATED">Deprecated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sources ({total})</span>
            <div className="flex items-center gap-2 text-sm font-normal">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-muted-foreground">
                Page {currentPage + 1} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sourcesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading sources...</div>
          ) : sources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No sources found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source: any) => (
                  <TableRow
                    key={source.sourceId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedSourceId(source.sourceId)}
                  >
                    <TableCell className="font-mono text-xs">{source.sourceId}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{source.name}</div>
                        {source.nameAr && (
                          <div className="text-xs text-muted-foreground" dir="rtl">{source.nameAr}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTierBadge(source.tier)}</TableCell>
                    <TableCell>{getStatusBadge(source.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{source.updateFrequency || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{source.accessType || 'WEB'}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                      {source.sectorCategory || '-'}
                    </TableCell>
                    <TableCell>
                      {source.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(source.url, '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Source Detail Dialog */}
      <Dialog open={!!selectedSourceId} onOpenChange={() => setSelectedSourceId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <ScrollArea className="max-h-[80vh]">
            {detailLoading ? (
              <div className="text-center py-8">Loading source details...</div>
            ) : sourceDetail?.source ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#2e8b6e]" />
                    {sourceDetail.source.name}
                  </DialogTitle>
                  <DialogDescription>
                    {sourceDetail.source.altName && (
                      <span dir="rtl" className="block">{sourceDetail.source.altName}</span>
                    )}
                    <span className="font-mono text-xs">{sourceDetail.source.sourceId}</span>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Status Row */}
                  <div className="flex flex-wrap gap-2">
                    {getTierBadge(sourceDetail.source.tier)}
                    {getStatusBadge(sourceDetail.source.status)}
                    <Badge variant="outline">{sourceDetail.source.updateFrequency || 'N/A'}</Badge>
                    <Badge variant="secondary">{sourceDetail.source.accessType || 'WEB'}</Badge>
                    {sourceDetail.source.confidenceRating && (
                      <Badge className="bg-amber-500">Grade: {sourceDetail.source.confidenceRating}</Badge>
                    )}
                  </div>

                  {/* Description */}
                  {sourceDetail.source.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{sourceDetail.source.description}</p>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                        <Building className="w-4 h-4" /> Publisher
                      </h4>
                      <p className="text-sm">{sourceDetail.source.publisher || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                        <Globe className="w-4 h-4" /> URL
                      </h4>
                      {sourceDetail.source.webUrl ? (
                        <a 
                          href={sourceDetail.source.webUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate block"
                        >
                          {sourceDetail.source.webUrl}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">N/A</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> Coverage
                      </h4>
                      <p className="text-sm">
                        {sourceDetail.source.historicalStart || '?'} - {sourceDetail.source.historicalEnd || 'Present'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                        <Shield className="w-4 h-4" /> License
                      </h4>
                      <p className="text-sm">{sourceDetail.source.license || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Geographic Scope</h4>
                      <p className="text-sm">{sourceDetail.source.geographicScope || 'Yemen'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Freshness SLA</h4>
                      <p className="text-sm">
                        {sourceDetail.source.freshnessSla ? `${sourceDetail.source.freshnessSla} days` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* API Key / Partnership Info */}
                  {(sourceDetail.source.apiKeyRequired || sourceDetail.source.needsPartnership) && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-yellow-800 dark:text-yellow-200">
                        <Key className="w-4 h-4" /> Access Requirements
                      </h4>
                      {sourceDetail.source.apiKeyRequired && (
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">• API key required</p>
                      )}
                      {sourceDetail.source.needsPartnership && (
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">• Partnership required</p>
                      )}
                      {sourceDetail.source.partnershipContact && (
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Contact: {sourceDetail.source.partnershipContact}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Sectors */}
                  {sourceDetail.source.sectors && sourceDetail.source.sectors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Sectors</h4>
                      <div className="flex flex-wrap gap-2">
                        {sourceDetail.source.sectors.map((sector: any) => (
                          <Badge 
                            key={sector.code} 
                            variant={sector.isPrimary ? "default" : "outline"}
                            className={sector.isPrimary ? "bg-[#2e8b6e]" : ""}
                          >
                            {sector.code}: {sector.name}
                            {sector.isPrimary && " (Primary)"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connector Info */}
                  {sourceDetail.source.connectorType && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Connector Type</h4>
                      <p className="text-sm text-muted-foreground">{sourceDetail.source.connectorType}</p>
                    </div>
                  )}

                  {/* Tier Description */}
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Tier Classification</h4>
                    <p className="text-sm text-muted-foreground">{sourceDetail.source.tierDescription}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Source not found</div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
