import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Eye, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Target,
  Layers,
  Users,
  FileCheck
} from 'lucide-react';

const TIER_COLORS: Record<string, string> = {
  T0: 'bg-purple-500',
  T1: 'bg-green-500',
  T2: 'bg-blue-500',
  T3: 'bg-yellow-500',
  T4: 'bg-red-500',
  UNKNOWN: 'bg-gray-500'
};

const TIER_DESCRIPTIONS: Record<string, string> = {
  T0: 'Official Statistical Authority',
  T1: 'Multilateral/UN Operational',
  T2: 'Research Institution',
  T3: 'Media (Event Detection Only)',
  T4: 'Restricted Access',
  UNKNOWN: 'Requires Classification'
};

export default function BulkClassification() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSources, setSelectedSources] = useState<number[]>([]);
  const [minConfidence, setMinConfidence] = useState(0.85);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({
    tier: '',
    status: '',
    notes: ''
  });

  // Queries
  const statsQuery = trpc.bulkClassification.getTierStats.useQuery();
  const previewQuery = trpc.bulkClassification.getClassificationPreview.useQuery();
  const reviewQueueQuery = trpc.bulkClassification.getReviewQueue.useQuery({ 
    page: reviewPage, 
    limit: 20 
  });

  // Mutations
  const applyMutation = trpc.bulkClassification.applyClassification.useMutation({
    onSuccess: (data) => {
      toast.success(`Classification applied: ${data.applied} sources updated, ${data.skipped} skipped`);
      statsQuery.refetch();
      previewQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Classification failed: ${error.message}`);
    }
  });

  const reviewMutation = trpc.bulkClassification.reviewSource.useMutation({
    onSuccess: () => {
      toast.success('Source reviewed successfully');
      reviewQueueQuery.refetch();
      statsQuery.refetch();
      setReviewDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Review failed: ${error.message}`);
    }
  });

  const revertMutation = trpc.bulkClassification.revertClassification.useMutation({
    onSuccess: () => {
      toast.success('Classification reverted');
      statsQuery.refetch();
      previewQuery.refetch();
    }
  });

  const handleApplyClassification = () => {
    applyMutation.mutate({
      sourceIds: selectedSources.length > 0 ? selectedSources : undefined,
      minConfidence
    });
  };

  const handleOpenReview = (source: any) => {
    setSelectedSource(source);
    setReviewForm({
      tier: source.tierClassificationSuggested || source.tier || '',
      status: source.status || 'ACTIVE',
      notes: ''
    });
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedSource || !reviewForm.tier) return;
    
    reviewMutation.mutate({
      sourceId: selectedSource.id,
      tier: reviewForm.tier as any,
      status: reviewForm.status as any,
      notes: reviewForm.notes || undefined
    });
  };

  const stats = statsQuery.data;
  const preview = previewQuery.data;
  const reviewQueue = reviewQueueQuery.data;

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Classification Engine</h1>
          <p className="text-muted-foreground mt-1">
            Deterministic tier classification for source trust hardening
          </p>
        </div>
        <div className="flex items-center gap-4">
          {stats && (
            <Badge 
              variant={stats.targetMet ? 'default' : 'destructive'}
              className="text-lg px-4 py-2"
            >
              {stats.targetMet ? (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 mr-2" />
              )}
              Unknown: {stats.unknownPercentage}%
              {stats.targetMet ? ' (Target Met)' : ' (Target: <50%)'}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Review Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats?.reviewQueueCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unknown Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats?.tierDistribution?.find((t: any) => t.tier === 'UNKNOWN')?.count || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Target Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress 
              value={stats ? Math.max(0, 100 - (stats.unknownPercentage * 2)) : 0} 
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.unknownPercentage}% unknown (target: &lt;50%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Distribution</CardTitle>
          <CardDescription>Current classification breakdown across all sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {['T0', 'T1', 'T2', 'T3', 'T4', 'UNKNOWN'].map(tier => {
              const count = stats?.tierDistribution?.find((t: any) => t.tier === tier)?.count || 0;
              const pct = stats?.total ? ((count / stats.total) * 100).toFixed(1) : '0';
              return (
                <div key={tier} className="text-center p-4 rounded-lg bg-muted/50">
                  <Badge className={`${TIER_COLORS[tier]} text-white mb-2`}>{tier}</Badge>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground">{pct}%</div>
                  <div className="text-xs text-muted-foreground mt-1">{TIER_DESCRIPTIONS[tier]}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Target className="w-4 h-4 mr-2" />
            Classification Preview
          </TabsTrigger>
          <TabsTrigger value="review">
            <Users className="w-4 h-4 mr-2" />
            Review Queue ({stats?.reviewQueueCount || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Classification Preview</CardTitle>
                  <CardDescription>
                    Preview tier assignments before applying. Sources with confidence ≥{minConfidence * 100}% will be auto-classified.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label>Min Confidence:</Label>
                    <Select 
                      value={minConfidence.toString()} 
                      onValueChange={(v) => setMinConfidence(parseFloat(v))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.95">95%</SelectItem>
                        <SelectItem value="0.85">85%</SelectItem>
                        <SelectItem value="0.75">75%</SelectItem>
                        <SelectItem value="0.60">60%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleApplyClassification}
                    disabled={applyMutation.isPending}
                  >
                    {applyMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Apply Classification
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {preview?.summary && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold">{preview.summary.total}</div>
                    <div className="text-sm text-muted-foreground">To Classify</div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 text-center">
                    <div className="text-2xl font-bold text-green-600">{preview.summary.byConfidence.high}</div>
                    <div className="text-sm text-muted-foreground">High Confidence</div>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-500/10 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{preview.summary.byConfidence.medium}</div>
                    <div className="text-sm text-muted-foreground">Medium Confidence</div>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/10 text-center">
                    <div className="text-2xl font-bold text-red-600">{preview.summary.byConfidence.low}</div>
                    <div className="text-sm text-muted-foreground">Low Confidence</div>
                  </div>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Suggested</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview?.results?.slice(0, 50).map((result: any) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-xs text-muted-foreground">{result.sourceId}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{result.currentTier || 'UNKNOWN'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${TIER_COLORS[result.suggestedTier]} text-white`}>
                          {result.suggestedTier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={result.confidence * 100} className="w-16 h-2" />
                          <span className="text-sm">{(result.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate" title={result.reason}>
                          {result.reason}
                        </div>
                        <div className="text-xs text-muted-foreground">{result.matchedRule}</div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenReview(result)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {preview?.results && preview.results.length > 50 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing 50 of {preview.results.length} sources
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Human Review Queue</CardTitle>
              <CardDescription>
                Sources flagged for human review due to low confidence or ambiguous classification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Current Tier</TableHead>
                    <TableHead>Suggested</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewQueue?.sources?.map((source: any) => (
                    <TableRow key={source.id}>
                      <TableCell>
                        <div className="font-medium">{source.name}</div>
                        <div className="text-xs text-muted-foreground">{source.sourceId}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{source.tier || 'UNKNOWN'}</Badge>
                      </TableCell>
                      <TableCell>
                        {source.tierClassificationSuggested && (
                          <Badge className={`${TIER_COLORS[source.tierClassificationSuggested]} text-white`}>
                            {source.tierClassificationSuggested}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {source.tierClassificationConfidence && (
                          <div className="flex items-center gap-2">
                            <Progress value={source.tierClassificationConfidence * 100} className="w-16 h-2" />
                            <span className="text-sm">{(source.tierClassificationConfidence * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {source.classificationMatchedRule}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenReview(source)}
                        >
                          <FileCheck className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {reviewQueue?.pagination && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {reviewQueue.pagination.page} of {reviewQueue.pagination.totalPages} 
                    ({reviewQueue.pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviewPage <= 1}
                      onClick={() => setReviewPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviewPage >= reviewQueue.pagination.totalPages}
                      onClick={() => setReviewPage(p => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Source Classification</DialogTitle>
            <DialogDescription>
              {selectedSource?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-2">Classification Suggestion</div>
              <div className="flex items-center gap-2">
                <Badge className={`${TIER_COLORS[selectedSource?.tierClassificationSuggested || 'UNKNOWN']} text-white`}>
                  {selectedSource?.tierClassificationSuggested || 'UNKNOWN'}
                </Badge>
                <span className="text-sm">
                  ({((selectedSource?.tierClassificationConfidence || 0) * 100).toFixed(0)}% confidence)
                </span>
              </div>
              <p className="text-sm mt-2">{selectedSource?.tierClassificationReason}</p>
            </div>

            <div className="space-y-2">
              <Label>Assign Tier</Label>
              <Select value={reviewForm.tier} onValueChange={(v) => setReviewForm(f => ({ ...f, tier: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T0">T0 - Official Statistical Authority</SelectItem>
                  <SelectItem value="T1">T1 - Multilateral/UN Operational</SelectItem>
                  <SelectItem value="T2">T2 - Research Institution</SelectItem>
                  <SelectItem value="T3">T3 - Media (Event Detection Only)</SelectItem>
                  <SelectItem value="T4">T4 - Restricted Access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={reviewForm.status} onValueChange={(v) => setReviewForm(f => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                  <SelectItem value="NEEDS_KEY">Needs API Key</SelectItem>
                  <SelectItem value="PARTNERSHIP_REQUIRED">Partnership Required</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Review Notes (optional)</Label>
              <Textarea 
                value={reviewForm.notes}
                onChange={(e) => setReviewForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Add any notes about this classification decision..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview}
              disabled={!reviewForm.tier || reviewMutation.isPending}
            >
              {reviewMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Approve Classification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
