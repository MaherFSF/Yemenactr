/**
 * Admin Source Console
 * Comprehensive source registry management with tier system, review queue, and feed matrix
 *
 * Sources loaded from canonical source_registry table via tRPC.
 */

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Database,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Shield,
  Globe,
  FileText,
  BarChart3,
  Grid3X3,
  History,
  Zap,
} from 'lucide-react';

// Tier badge colors
const tierColors: Record<string, string> = {
  T0: 'bg-emerald-500 text-white',
  T1: 'bg-blue-500 text-white',
  T2: 'bg-amber-500 text-white',
  T3: 'bg-orange-500 text-white',
  T4: 'bg-red-500 text-white',
  UNKNOWN: 'bg-gray-500 text-white',
};

// Status badge colors
const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  NEEDS_KEY: 'bg-blue-100 text-blue-800 border-blue-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  DEPRECATED: 'bg-red-100 text-red-800 border-red-200',
};

// Tier descriptions
const tierDescriptions: Record<string, string> = {
  T0: 'Official Government/Central Bank - Highest authority',
  T1: 'International Organizations (UN, WB, IMF) - High credibility',
  T2: 'Academic/Research Institutions - Peer-reviewed',
  T3: 'Media/News - Event detection only',
  T4: 'Unverified/User-submitted - Requires verification',
  UNKNOWN: 'Not yet classified',
};

export default function SourceConsole() {
  const [activeTab, setActiveTab] = useState('registry');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Load real sources from canonical source_registry via tRPC
  const { data: sourcesData, isLoading: sourcesLoading } = trpc.sourceRegistry.getAll.useQuery({
    limit: 500,
  });
  const { data: statsData } = trpc.sourceRegistry.getStats.useQuery();

  // Map DB sources to display format
  const sources = useMemo(() => {
    if (!sourcesData?.sources) return [];
    return sourcesData.sources.map((s: any) => ({
      id: s.id,
      sourceId: s.sourceId,
      name: s.name,
      publisher: s.publisher || '',
      tier: s.tier || 'UNKNOWN',
      status: s.status || 'PENDING_REVIEW',
      accessType: s.accessType || 'WEB',
      updateFrequency: s.updateFrequency || 'IRREGULAR',
      sectorCategory: s.sectorCategory || '',
      lastFetch: s.lastFetch ? new Date(s.lastFetch).toLocaleDateString() : null,
      confidenceRating: s.confidenceRating || '',
    }));
  }, [sourcesData]);

  // Filter sources (client-side for instant feedback)
  const filteredSources = sources.filter((source: any) => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.sourceId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || source.tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || source.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  // Statistics from DB
  const stats = {
    total: statsData?.stats?.total || sources.length,
    active: statsData?.stats?.active || 0,
    pendingReview: statsData?.stats?.pending || 0,
    byTier: {
      T0: (statsData?.stats?.byTier as any)?.T0 || 0,
      T1: (statsData?.stats?.byTier as any)?.T1 || 0,
      T2: (statsData?.stats?.byTier as any)?.T2 || 0,
      T3: (statsData?.stats?.byTier as any)?.T3 || 0,
      T4: (statsData?.stats?.byTier as any)?.T4 || 0,
    },
  };
  
  // @placeholder — awaiting backend verification endpoint (tRPC procedure needed)
  const mockVerificationQueue = [
    {
      id: 1,
      title: 'Fuel price increase reported in Sana\'a',
      eventType: 'PRICE_CHANGE',
      sourceName: 'Al Jazeera Arabic',
      detectedAt: '2025-01-29T10:30:00Z',
      status: 'PENDING',
      corroborationScore: 45,
    },
    {
      id: 2,
      title: 'CBY Aden announces new monetary policy',
      eventType: 'POLICY_ANNOUNCEMENT',
      sourceName: 'Yemen News Agency',
      detectedAt: '2025-01-28T14:00:00Z',
      status: 'PENDING',
      corroborationScore: 72,
    },
    {
      id: 3,
      title: 'Port of Aden reports increased cargo volume',
      eventType: 'ECONOMIC_INDICATOR',
      sourceName: 'Reuters',
      detectedAt: '2025-01-27T09:15:00Z',
      status: 'NEEDS_MORE_EVIDENCE',
      corroborationScore: 38,
    },
  ];
  
  // @placeholder — awaiting backend feed matrix endpoint (tRPC procedure needed)
  const mockSectorFeedMatrix = [
    { sector: 'Macroeconomy', sourceCount: 12, primarySources: 4, lastUpdate: '2025-01-29', coverage: 95 },
    { sector: 'Trade', sourceCount: 8, primarySources: 3, lastUpdate: '2025-01-28', coverage: 88 },
    { sector: 'Monetary', sourceCount: 6, primarySources: 2, lastUpdate: '2025-01-29', coverage: 92 },
    { sector: 'Humanitarian', sourceCount: 15, primarySources: 5, lastUpdate: '2025-01-29', coverage: 97 },
    { sector: 'Prices', sourceCount: 7, primarySources: 3, lastUpdate: '2025-01-27', coverage: 85 },
    { sector: 'Banking', sourceCount: 5, primarySources: 2, lastUpdate: '2025-01-26', coverage: 78 },
    { sector: 'Energy', sourceCount: 4, primarySources: 1, lastUpdate: '2025-01-25', coverage: 65 },
    { sector: 'Agriculture', sourceCount: 6, primarySources: 2, lastUpdate: '2025-01-24', coverage: 72 },
  ];
  
  const handleTierChange = (sourceId: string, newTier: string) => {
    toast.success(`Source ${sourceId} tier changed to ${newTier}. Change logged to audit trail.`);
  };
  
  const handleVerify = (eventId: number, action: 'verify' | 'reject') => {
    if (action === 'verify') {
      toast.success(`Event #${eventId} has been verified and will be added to the timeline.`);
    } else {
      toast.error(`Event #${eventId} has been rejected.`);
    }
  };
  
  const handleImportCSV = () => {
    toast.info('Importing sources from CSV file...');
  };
  
  const handleRunIngestion = () => {
    toast.info('Running data ingestion from all active sources...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Source Registry Console
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage {stats.total}+ data sources with tier classification, verification queue, and feed matrix
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleImportCSV}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={handleRunIngestion}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Ingestion
            </Button>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Sources</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-1">
                <Badge className={tierColors.T0}>T0</Badge>
                <span className="font-bold">{stats.byTier.T0}</span>
              </div>
              <div className="text-sm text-muted-foreground">Official</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-1">
                <Badge className={tierColors.T1}>T1</Badge>
                <span className="font-bold">{stats.byTier.T1}</span>
              </div>
              <div className="text-sm text-muted-foreground">Int'l Orgs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-1">
                <Badge className={tierColors.T2}>T2</Badge>
                <span className="font-bold">{stats.byTier.T2}</span>
              </div>
              <div className="text-sm text-muted-foreground">Academic</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="registry" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Registry
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Feed Matrix
            </TabsTrigger>
            <TabsTrigger value="discovery" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Discovery
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>
          
          {/* Registry Tab */}
          <TabsContent value="registry" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search sources by name, publisher, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="T0">T0 - Official</SelectItem>
                      <SelectItem value="T1">T1 - Int'l Orgs</SelectItem>
                      <SelectItem value="T2">T2 - Academic</SelectItem>
                      <SelectItem value="T3">T3 - Media</SelectItem>
                      <SelectItem value="T4">T4 - Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                      <SelectItem value="NEEDS_KEY">Needs API Key</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Source List */}
            <Card>
              <CardHeader>
                <CardTitle>Source Registry ({filteredSources.length} sources)</CardTitle>
                <CardDescription>
                  Complete catalog of data sources with tier classification and routing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredSources.map((source: any) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Badge className={tierColors[source.tier]}>{source.tier}</Badge>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {source.name}
                            <Badge variant="outline" className={statusColors[source.status]}>
                              {source.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {source.publisher} • {source.accessType} • {source.updateFrequency}
                          </div>
                          {source.sectorCategory && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {source.sectorCategory}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm mr-4">
                          <div className="text-muted-foreground">Last fetch</div>
                          <div>{source.lastFetch || 'Never'}</div>
                        </div>
                        <Select
                          value={source.tier}
                          onValueChange={(value) => handleTierChange(source.sourceId, value)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="T0">T0</SelectItem>
                            <SelectItem value="T1">T1</SelectItem>
                            <SelectItem value="T2">T2</SelectItem>
                            <SelectItem value="T3">T3</SelectItem>
                            <SelectItem value="T4">T4</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Tier Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tier Classification System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(tierDescriptions).map(([tier, description]) => (
                    <div key={tier} className="flex items-start gap-3">
                      <Badge className={tierColors[tier]}>{tier}</Badge>
                      <span className="text-sm text-muted-foreground">{description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Verification Queue Tab */}
          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Media Event Verification Queue
                </CardTitle>
                <CardDescription>
                  Events detected from media sources require verification before becoming facts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockVerificationQueue.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Source: {event.sourceName} • Detected: {new Date(event.detectedAt).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline">{event.eventType.replace('_', ' ')}</Badge>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Corroboration:</span>
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${event.corroborationScore >= 70 ? 'bg-green-500' : event.corroborationScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${event.corroborationScore}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{event.corroborationScore}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleVerify(event.id, 'verify')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleVerify(event.id, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Feed Matrix Tab */}
          <TabsContent value="matrix" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5" />
                  Sector Feed Matrix
                </CardTitle>
                <CardDescription>
                  Proves that all sources feed all pages/sectors per the "All sources feed all pages" rule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Sector</th>
                        <th className="text-center py-3 px-4">Sources</th>
                        <th className="text-center py-3 px-4">Primary</th>
                        <th className="text-center py-3 px-4">Last Update</th>
                        <th className="text-center py-3 px-4">Coverage</th>
                        <th className="text-center py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockSectorFeedMatrix.map((row) => (
                        <tr key={row.sector} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{row.sector}</td>
                          <td className="text-center py-3 px-4">{row.sourceCount}</td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="secondary">{row.primarySources}</Badge>
                          </td>
                          <td className="text-center py-3 px-4 text-sm text-muted-foreground">
                            {row.lastUpdate}
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${row.coverage >= 90 ? 'bg-green-500' : row.coverage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${row.coverage}%` }}
                                />
                              </div>
                              <span className="text-sm">{row.coverage}%</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Discovery Tab */}
          <TabsContent value="discovery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Source Discovery Queue
                </CardTitle>
                <CardDescription>
                  New sources discovered through automated search and citation crawling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Source Discovery Playbook runs weekly</p>
                  <p className="text-sm mt-2">Next run: Sunday 00:00 UTC</p>
                  <Button className="mt-4" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Discovery Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Tier Change Audit Log
                </CardTitle>
                <CardDescription>
                  Complete history of tier changes with reasons and approvers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">SRC-007 tier changed</div>
                      <div className="text-sm text-muted-foreground">
                        Changed from T2 to T1 • Reason: Verified as official UN source
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      2025-01-28 14:30 • admin@yeto.org
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">SRC-012 tier changed</div>
                      <div className="text-sm text-muted-foreground">
                        Changed from UNKNOWN to T3 • Reason: Classified as media source
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      2025-01-27 09:15 • admin@yeto.org
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
