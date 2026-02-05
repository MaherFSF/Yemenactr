/**
 * Source Import Console - Admin tool for importing sources from Excel
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Database,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Download,
  Activity,
  Layers,
  TrendingUp,
  BarChart3,
  Link2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export default function SourceImportConsole() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Get import statistics
  const { data: statsData, refetch: refetchStats } = trpc.sourceImport.getImportStatistics.useQuery();
  const stats = statsData?.stats;

  // Get registry statistics
  const { data: registryData, refetch: refetchRegistry } = trpc.sourceRegistry.getStats.useQuery();
  const registryStats = registryData?.stats;

  // Mutations
  const importMutation = trpc.sourceImport.importFromDefaultExcel.useMutation();
  const initSectorsMutation = trpc.sourceImport.initializeSectorCodebook.useMutation();

  // Handle import from Excel
  const handleImport = async () => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importMutation.mutateAsync();
      
      if (result.success) {
        toast.success(result.message);
        setImportResult(result.result);
        refetchStats();
        refetchRegistry();
      } else {
        toast.error(`Import failed: ${result.error}`);
        setImportResult({ errors: [{ error: result.error }] });
      }
    } catch (error) {
      toast.error(`Import failed: ${error}`);
      setImportResult({ errors: [{ error: String(error) }] });
    } finally {
      setIsImporting(false);
    }
  };

  // Handle sector codebook initialization
  const handleInitSectors = async () => {
    try {
      const result = await initSectorsMutation.mutateAsync();
      
      if (result.success) {
        toast.success(result.message);
        refetchStats();
      } else {
        toast.error(`Initialization failed: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Initialization failed: ${error}`);
    }
  };

  // Calculate progress
  const totalSources = stats?.totalSources || 0;
  const sourcesWithMappings = stats?.sourcesWithMappings || 0;
  const mappingProgress = totalSources > 0 ? (sourcesWithMappings / totalSources) * 100 : 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Source Import Console
          </h1>
          <p className="text-muted-foreground mt-1">
            Import and manage data sources from YETO Sources Universe Master
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetchStats();
              refetchRegistry();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Total Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSources}</div>
            <p className="text-xs text-muted-foreground mt-1">
              in source registry
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Sector Mappings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sourcesWithMappings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              sources with sectors
            </p>
            <Progress value={mappingProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Sectors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.sectorsWithMappings || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              sectors with sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {registryStats?.active || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ready for ingestion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Sources
          </CardTitle>
          <CardDescription>
            Import sources from YETO_Sources_Universe_Master_PRODUCTION_READY Excel file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertTitle>Source File</AlertTitle>
            <AlertDescription>
              Looking for: <code className="font-mono text-xs">YETO_Sources_Universe_Master_PRODUCTION_READY_v2_5.xlsx</code> in <code className="font-mono text-xs">/workspace/data/</code>
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="flex-1"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import from Excel
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleInitSectors}
              disabled={initSectorsMutation.isPending}
            >
              <Layers className="mr-2 h-4 w-4" />
              Init Sectors
            </Button>
          </div>

          {/* Import Result */}
          {importResult && (
            <Alert className={importResult.errors?.length > 0 ? 'border-yellow-500' : 'border-green-500'}>
              {importResult.errors?.length > 0 ? (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertTitle>Import Complete</AlertTitle>
              <AlertDescription>
                <div className="space-y-1 mt-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {importResult.imported} imported
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50">
                      <RefreshCw className="mr-1 h-3 w-3" />
                      {importResult.updated} updated
                    </Badge>
                    <Badge variant="outline" className="bg-gray-50">
                      {importResult.skipped} skipped
                    </Badge>
                    {importResult.errors?.length > 0 && (
                      <Badge variant="outline" className="bg-red-50">
                        <XCircle className="mr-1 h-3 w-3" />
                        {importResult.errors.length} errors
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm">
                    Created {importResult.sectorMappingsCreated} sector mappings
                  </div>
                </div>

                {importResult.errors?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Errors:</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {importResult.errors.map((err: any, idx: number) => (
                        <div key={idx} className="text-xs text-red-600 font-mono">
                          Row {err.row}: {err.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistics Tabs */}
      <Tabs defaultValue="tier" className="w-full">
        <TabsList>
          <TabsTrigger value="tier">By Tier</TabsTrigger>
          <TabsTrigger value="status">By Status</TabsTrigger>
          <TabsTrigger value="access">By Access Type</TabsTrigger>
        </TabsList>

        <TabsContent value="tier">
          <Card>
            <CardHeader>
              <CardTitle>Sources by Tier</CardTitle>
              <CardDescription>Distribution of sources across quality tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(stats?.byTier || {}).map(([tier, count]) => (
                    <TableRow key={tier}>
                      <TableCell>
                        <Badge variant={
                          tier === 'T0' ? 'default' :
                          tier === 'T1' ? 'secondary' :
                          tier === 'T2' ? 'outline' : 'secondary'
                        }>
                          {tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {registryStats?.tierDescriptions?.[tier] || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-right font-medium">{count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Sources by Status</CardTitle>
              <CardDescription>Current activation status of sources</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
                    <TableRow key={status}>
                      <TableCell>
                        <Badge variant={
                          status === 'ACTIVE' ? 'default' :
                          status === 'NEEDS_KEY' ? 'destructive' :
                          'secondary'
                        }>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {registryStats?.statusDescriptions?.[status] || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-right font-medium">{count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Sources by Access Type</CardTitle>
              <CardDescription>Distribution of data access methods</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Access Type</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(stats?.byAccessType || {}).map(([type, count]) => (
                    <TableRow key={type}>
                      <TableCell>
                        <Badge variant="outline">{type}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Related Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/source-registry">
                <Database className="mr-2 h-4 w-4" />
                View Source Registry
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/sector-feed-matrix">
                <Link2 className="mr-2 h-4 w-4" />
                Sector Feed Matrix
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/library-console">
                <FileText className="mr-2 h-4 w-4" />
                Literature Console
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
