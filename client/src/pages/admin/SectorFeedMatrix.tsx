/**
 * Sector Feed Matrix Admin Page
 * 
 * Shows which sources feed each sector with ingestion stats and coverage.
 * For each sector: TOP 50 sources, last_ingestion, coverage 2010→today, gaps, allowedUse mix.
 */

import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Search,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  BarChart3,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

// Tier badge colors
const TIER_COLORS: Record<string, string> = {
  T0: 'bg-emerald-500 text-white',
  T1: 'bg-blue-500 text-white',
  T2: 'bg-amber-500 text-white',
  T3: 'bg-orange-500 text-white',
  T4: 'bg-red-500 text-white',
  UNKNOWN: 'bg-gray-500 text-white',
};

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  NEEDS_KEY: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PENDING_REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  DEPRECATED: 'bg-red-100 text-red-800 border-red-200',
};

export default function SectorFeedMatrix() {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sector feed matrix
  const { data: matrixData, isLoading } = trpc.feedMatrix.getSectorFeedMatrix.useQuery({
    sectorCode: selectedSector === 'all' ? undefined : selectedSector,
    limit: 50,
  });

  // Fetch matrix stats
  const { data: statsData } = trpc.feedMatrix.getMatrixStats.useQuery();

  // Export mutation
  // Export is a query, not a mutation
  const { data: exportData, refetch: triggerExport } = trpc.feedMatrix.exportSectorMatrix.useQuery(undefined, { enabled: false });

  // Filter sectors by search
  const filteredSectors = useMemo(() => {
    if (!matrixData?.sectors) return [];
    if (!searchQuery) return matrixData.sectors;
    
    const query = searchQuery.toLowerCase();
    return matrixData.sectors.filter(s => 
      s.sector.name.toLowerCase().includes(query) ||
      s.sector.nameAr.includes(searchQuery) ||
      s.sources.some((src: any) => 
        src.name.toLowerCase().includes(query) ||
        src.sourceId.toLowerCase().includes(query)
      )
    );
  }, [matrixData?.sectors, searchQuery]);

  // Handle export
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await triggerExport();
      if (result.data?.success && result.data?.csv) {
        const blob = new Blob([result.data.csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sector-feed-matrix-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sector Feed Matrix</h1>
            <p className="text-muted-foreground">
              View which sources feed each sector with ingestion stats and coverage
            </p>
          </div>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>

        {/* Stats Cards */}
        {statsData?.stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData.stats.totalSources}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Mapped to Sectors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statsData.stats.mappedSources}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unmapped
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {statsData.stats.unmappedSources}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tier Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(statsData.stats.tierDistribution || {}).map(([tier, count]) => (
                    <Badge key={tier} className={TIER_COLORS[tier] || 'bg-gray-500'}>
                      {tier}: {count as number}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search sectors or sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="S01">S01 - Macroeconomy</SelectItem>
                  <SelectItem value="S02">S02 - Trade</SelectItem>
                  <SelectItem value="S03">S03 - Monetary</SelectItem>
                  <SelectItem value="S04">S04 - Fiscal</SelectItem>
                  <SelectItem value="S05">S05 - Banking</SelectItem>
                  <SelectItem value="S06">S06 - Energy</SelectItem>
                  <SelectItem value="S07">S07 - Agriculture</SelectItem>
                  <SelectItem value="S08">S08 - Humanitarian</SelectItem>
                  <SelectItem value="S09">S09 - Labor</SelectItem>
                  <SelectItem value="S10">S10 - Infrastructure</SelectItem>
                  <SelectItem value="S11">S11 - Governance</SelectItem>
                  <SelectItem value="S12">S12 - Security</SelectItem>
                  <SelectItem value="S13">S13 - Health</SelectItem>
                  <SelectItem value="S14">S14 - Education</SelectItem>
                  <SelectItem value="S15">S15 - Environment</SelectItem>
                  <SelectItem value="S16">S16 - Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Matrix Content */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-pulse">Loading sector feed matrix...</div>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {filteredSectors.map((sectorData: any) => (
              <AccordionItem
                key={sectorData.sector.code}
                value={sectorData.sector.code}
                className="border rounded-lg bg-card"
              >
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-mono">
                        {sectorData.sector.code}
                      </Badge>
                      <div className="text-left">
                        <div className="font-semibold">{sectorData.sector.name}</div>
                        <div className="text-sm text-muted-foreground" dir="rtl">
                          {sectorData.sector.nameAr}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span>{sectorData.sourceCount} sources</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{sectorData.activeCount} active</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Layers className="h-4 w-4 text-blue-500" />
                        <span>{sectorData.primaryCount} primary</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <Tabs defaultValue="sources" className="mt-4">
                    <TabsList>
                      <TabsTrigger value="sources">Sources</TabsTrigger>
                      <TabsTrigger value="distribution">Distribution</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="sources" className="mt-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Source ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Tier</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Confidence</TableHead>
                              <TableHead>Primary</TableHead>
                              <TableHead>Coverage</TableHead>
                              <TableHead>Last Fetch</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sectorData.sources.map((source: any) => (
                              <TableRow key={source.sourceId}>
                                <TableCell className="font-mono text-xs">
                                  {source.sourceId}
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-[200px] truncate" title={source.name}>
                                    {source.name}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={TIER_COLORS[source.tier] || 'bg-gray-500'}>
                                    {source.tier}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={STATUS_COLORS[source.status] || ''}
                                  >
                                    {source.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {source.confidenceRating || '-'}
                                </TableCell>
                                <TableCell>
                                  {source.isPrimary ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {source.coverageStart && source.coverageEnd
                                    ? `${source.coverageStart}–${source.coverageEnd}`
                                    : '-'}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {source.lastFetch
                                    ? new Date(source.lastFetch).toLocaleDateString()
                                    : '-'}
                                </TableCell>
                                <TableCell>
                                  {source.webUrl && (
                                    <a
                                      href={source.webUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:text-blue-700"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="distribution" className="mt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Tier Distribution</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {Object.entries(sectorData.tierDistribution || {}).map(
                                ([tier, count]) => (
                                  <div key={tier} className="flex items-center justify-between">
                                    <Badge className={TIER_COLORS[tier] || 'bg-gray-500'}>
                                      {tier}
                                    </Badge>
                                    <span className="font-mono">{count as number}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Allowed Use Distribution</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {Object.entries(sectorData.allowedUseDistribution || {}).map(
                                ([use, count]) => (
                                  <div key={use} className="flex items-center justify-between">
                                    <span className="text-sm">{use}</span>
                                    <span className="font-mono">{count as number}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {filteredSectors.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No sectors found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
