/**
 * Registry Diff Viewer - Shows changes from last import
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function RegistryDiff() {
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>(undefined);

  // Fetch recent diffs
  const { data: diffsData, isLoading, refetch } = trpc.canonicalRegistry.getRecentDiffs.useQuery({
    limit: 100,
    importRunId: selectedRunId
  });

  // Fetch diff summary
  const { data: summaryData } = trpc.canonicalRegistry.getDiffSummary.useQuery({
    importRunId: selectedRunId
  });

  const diffs = diffsData?.diffs || [];
  const summary = summaryData?.summary || [];

  // Group diffs by change type
  const groupedDiffs = {
    ADD: diffs.filter(d => d.changeType === 'ADD'),
    EDIT: diffs.filter(d => d.changeType === 'EDIT'),
    DELETE: diffs.filter(d => d.changeType === 'DELETE'),
  };

  // Calculate summary totals
  const summaryTotals = {
    ADD: summary.find((s: any) => s.changeType === 'ADD')?.count || 0,
    EDIT: summary.find((s: any) => s.changeType === 'EDIT')?.count || 0,
    DELETE: summary.find((s: any) => s.changeType === 'DELETE')?.count || 0,
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Registry Diff
          </h1>
          <p className="text-muted-foreground mt-1">
            View changes from the last registry import
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Total Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summaryTotals.ADD + summaryTotals.EDIT + summaryTotals.DELETE}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              in last import
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <Plus className="h-4 w-4" />
              Added
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {summaryTotals.ADD}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              new sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600">
              <Edit className="h-4 w-4" />
              Edited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {summaryTotals.EDIT}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              updates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
              <Trash2 className="h-4 w-4" />
              Deleted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {summaryTotals.DELETE}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              removed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Diff Tables */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Changes ({diffs.length})</TabsTrigger>
          <TabsTrigger value="add">Added ({groupedDiffs.ADD.length})</TabsTrigger>
          <TabsTrigger value="edit">Edited ({groupedDiffs.EDIT.length})</TabsTrigger>
          <TabsTrigger value="delete">Deleted ({groupedDiffs.DELETE.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Changes</CardTitle>
              <CardDescription>Complete changelog from last import</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : diffs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No changes found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Source ID</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Old Value</TableHead>
                      <TableHead>New Value</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diffs.slice(0, 50).map((diff: any) => (
                      <TableRow key={diff.id}>
                        <TableCell>
                          <Badge
                            variant={
                              diff.changeType === 'ADD' ? 'default' :
                              diff.changeType === 'EDIT' ? 'secondary' :
                              'destructive'
                            }
                            className={
                              diff.changeType === 'ADD' ? 'bg-green-600' :
                              diff.changeType === 'EDIT' ? 'bg-blue-600' :
                              'bg-red-600'
                            }
                          >
                            {diff.changeType === 'ADD' && <Plus className="mr-1 h-3 w-3" />}
                            {diff.changeType === 'EDIT' && <Edit className="mr-1 h-3 w-3" />}
                            {diff.changeType === 'DELETE' && <Trash2 className="mr-1 h-3 w-3" />}
                            {diff.changeType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{diff.sourceId}</TableCell>
                        <TableCell>{diff.tableName}</TableCell>
                        <TableCell className="text-muted-foreground">{diff.fieldName || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs">
                          {diff.oldValue ? (
                            <span className="text-red-600">{diff.oldValue}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs">
                          {diff.newValue ? (
                            <span className="text-green-600">{diff.newValue}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(diff.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Plus className="h-5 w-5" />
                Added Sources
              </CardTitle>
              <CardDescription>New sources added to the registry</CardDescription>
            </CardHeader>
            <CardContent>
              <DiffTable diffs={groupedDiffs.ADD} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Edit className="h-5 w-5" />
                Edited Sources
              </CardTitle>
              <CardDescription>Sources with updated metadata</CardDescription>
            </CardHeader>
            <CardContent>
              <DiffTable diffs={groupedDiffs.EDIT} showComparison />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delete">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Deleted Sources
              </CardTitle>
              <CardDescription>Sources removed from the registry</CardDescription>
            </CardHeader>
            <CardContent>
              <DiffTable diffs={groupedDiffs.DELETE} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DiffTable({ diffs, showComparison }: { diffs: any[]; showComparison?: boolean }) {
  if (diffs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No changes in this category</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source ID</TableHead>
          <TableHead>Table</TableHead>
          <TableHead>Field</TableHead>
          {showComparison && (
            <>
              <TableHead>Old Value</TableHead>
              <TableHead></TableHead>
              <TableHead>New Value</TableHead>
            </>
          )}
          {!showComparison && <TableHead>Value</TableHead>}
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {diffs.slice(0, 50).map((diff: any) => (
          <TableRow key={diff.id}>
            <TableCell className="font-mono text-sm">{diff.sourceId}</TableCell>
            <TableCell>{diff.tableName}</TableCell>
            <TableCell className="text-muted-foreground">{diff.fieldName || '-'}</TableCell>
            {showComparison && (
              <>
                <TableCell className="max-w-xs truncate text-xs text-red-600">
                  {diff.oldValue || '-'}
                </TableCell>
                <TableCell>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs text-green-600">
                  {diff.newValue || '-'}
                </TableCell>
              </>
            )}
            {!showComparison && (
              <TableCell className="max-w-xs truncate text-xs">
                {diff.newValue || diff.oldValue || '-'}
              </TableCell>
            )}
            <TableCell className="text-xs text-muted-foreground">
              {new Date(diff.createdAt).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
