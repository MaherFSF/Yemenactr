/**
 * Admin Library Console - Document management and QA interface
 */

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  Upload,
  RefreshCw,
  Search,
  FileText,
  Table,
  Languages,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Settings,
  Play,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  ExternalLink,
  BarChart3,
  Activity
} from 'lucide-react';

export default function LibraryConsole() {
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [ingestionInProgress, setIngestionInProgress] = useState(false);

  // Fetch statistics
  const { data: docStats, isLoading: statsLoading } = trpc.library.getDocumentStatistics.useQuery();
  const { data: anchorStats } = trpc.library.getAnchorStatistics.useQuery();
  const { data: translationStats } = trpc.library.getTranslationStatistics.useQuery();
  const { data: ingestionStats } = trpc.library.getIngestionStatistics.useQuery();
  const { data: recentRuns, refetch: refetchRuns } = trpc.library.getRecentIngestionRuns.useQuery({ limit: 10 });
  const { data: tablesNeedingReview } = trpc.library.getTablesPendingReview.useQuery({ limit: 20 });
  const { data: translationsNeedingReview } = trpc.library.getTranslationsNeedingReview.useQuery({ limit: 20 });

  // Search documents (admin view - all statuses)
  const { data: searchResults, isLoading: searchLoading } = trpc.library.searchDocuments.useQuery({
    query: searchQuery || undefined,
    status: ['draft', 'queued_for_review', 'published', 'archived'],
    limit: 20
  });

  // Mutations
  const runWorldBankMutation = trpc.library.ingestWorldBank.useMutation({
    onSuccess: (result) => {
      toast.success(`World Bank ingestion complete: ${result.documentsNew} new documents`);
      refetchRuns();
      setIngestionInProgress(false);
    },
    onError: (error) => {
      toast.error(`Ingestion failed: ${error.message}`);
      setIngestionInProgress(false);
    }
  });

  const runReliefWebMutation = trpc.library.ingestReliefWeb.useMutation({
    onSuccess: (result) => {
      toast.success(`ReliefWeb ingestion complete: ${result.documentsNew} new documents`);
      refetchRuns();
      setIngestionInProgress(false);
    },
    onError: (error) => {
      toast.error(`Ingestion failed: ${error.message}`);
      setIngestionInProgress(false);
    }
  });

  const runAllIngestionMutation = trpc.library.runAllIngestion.useMutation({
    onSuccess: (results) => {
      const totalNew = results.reduce((sum, r) => sum + r.documentsNew, 0);
      toast.success(`All ingestion complete: ${totalNew} new documents`);
      refetchRuns();
      setIngestionInProgress(false);
    },
    onError: (error) => {
      toast.error(`Ingestion failed: ${error.message}`);
      setIngestionInProgress(false);
    }
  });

  const updateDocStatusMutation = trpc.library.updateDocumentStatus.useMutation({
    onSuccess: () => {
      toast.success('Document status updated');
    }
  });

  const handleRunIngestion = (source: 'world_bank' | 'reliefweb' | 'all') => {
    setIngestionInProgress(true);
    if (source === 'world_bank') {
      runWorldBankMutation.mutate({ limit: 50 });
    } else if (source === 'reliefweb') {
      runReliefWebMutation.mutate({ limit: 50 });
    } else {
      runAllIngestionMutation.mutate({ limit: 50 });
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {language === 'ar' ? 'وحدة تحكم المكتبة' : 'Library Console'}
                </h1>
                <p className="text-sm text-gray-500">
                  {language === 'ar' ? 'إدارة الوثائق والاستيعاب ومراقبة الجودة' : 'Document management, ingestion, and QA'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'رفع وثيقة' : 'Upload Document'}
              </Button>
              <Button 
                onClick={() => handleRunIngestion('all')}
                disabled={ingestionInProgress}
              >
                {ingestionInProgress ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {language === 'ar' ? 'تشغيل الاستيعاب' : 'Run Ingestion'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الوثائق' : 'Documents'}
            </TabsTrigger>
            <TabsTrigger value="ingestion">
              <Database className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الاستيعاب' : 'Ingestion'}
            </TabsTrigger>
            <TabsTrigger value="tables">
              <Table className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الجداول' : 'Tables'}
              {tablesNeedingReview && tablesNeedingReview.length > 0 && (
                <Badge variant="destructive" className="ml-2">{tablesNeedingReview.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="translations">
              <Languages className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الترجمات' : 'Translations'}
              {translationsNeedingReview && translationsNeedingReview.length > 0 && (
                <Badge variant="destructive" className="ml-2">{translationsNeedingReview.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Document Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {language === 'ar' ? 'إجمالي الوثائق' : 'Total Documents'}
                      </p>
                      <p className="text-3xl font-bold">{docStats?.total || 0}</p>
                    </div>
                    <FileText className="h-10 w-10 text-emerald-500 opacity-50" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary">{docStats?.byStatus?.published || 0} published</Badge>
                    <Badge variant="outline">{docStats?.byStatus?.draft || 0} draft</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Citation Anchors */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {language === 'ar' ? 'مراسي الاقتباس' : 'Citation Anchors'}
                      </p>
                      <p className="text-3xl font-bold">{anchorStats?.totalAnchors || 0}</p>
                    </div>
                    <Activity className="h-10 w-10 text-blue-500 opacity-50" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary">{anchorStats?.byConfidence?.high || 0} high</Badge>
                    <Badge variant="outline">{anchorStats?.byConfidence?.medium || 0} medium</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Extracted Tables */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {language === 'ar' ? 'الجداول المستخرجة' : 'Extracted Tables'}
                      </p>
                      <p className="text-3xl font-bold">{anchorStats?.totalTables || 0}</p>
                    </div>
                    <Table className="h-10 w-10 text-purple-500 opacity-50" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary">{anchorStats?.tablesByStatus?.promoted || 0} promoted</Badge>
                    <Badge variant="destructive">{tablesNeedingReview?.length || 0} need review</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Translation Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {language === 'ar' ? 'الترجمات' : 'Translations'}
                      </p>
                      <p className="text-3xl font-bold">{translationStats?.total || 0}</p>
                    </div>
                    <Languages className="h-10 w-10 text-orange-500 opacity-50" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary">
                      {translationStats?.avgGlossaryScore?.toFixed(0) || 0}% glossary
                    </Badge>
                    <Badge variant="outline">
                      {translationStats?.numericIntegrityRate?.toFixed(0) || 0}% numeric
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Types Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'توزيع أنواع الوثائق' : 'Document Types Distribution'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(docStats?.byType || {}).slice(0, 8).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{type.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${((count as number) / (docStats?.total || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count as number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Year Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'توزيع السنوات' : 'Year Distribution'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(docStats?.byYear || {}).slice(0, 8).map(([year, count]) => (
                      <div key={year} className="flex items-center justify-between">
                        <span className="text-sm">{year}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${((count as number) / (docStats?.total || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count as number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{language === 'ar' ? 'إدارة الوثائق' : 'Document Management'}</CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {searchLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults?.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={
                              doc.status === 'published' ? 'default' :
                              doc.status === 'draft' ? 'secondary' :
                              doc.status === 'queued_for_review' ? 'outline' : 'destructive'
                            }>
                              {doc.status}
                            </Badge>
                            <Badge variant="outline">{doc.docType}</Badge>
                          </div>
                          <h4 className="font-medium">{doc.titleEn}</h4>
                          <p className="text-sm text-gray-500">
                            {doc.publisherName} • {doc.publishedAt ? new Date(doc.publishedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={doc.status}
                            onValueChange={(value) => updateDocStatusMutation.mutate({ 
                              id: doc.id, 
                              status: value as any 
                            })}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="queued_for_review">Queue for Review</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {searchResults?.documents.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        {language === 'ar' ? 'لم يتم العثور على وثائق' : 'No documents found'}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingestion Tab */}
          <TabsContent value="ingestion">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ingestion Sources */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'مصادر الاستيعاب' : 'Ingestion Sources'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* World Bank */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">World Bank Documents</h4>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Reports, working papers, and policy briefs from World Bank
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => handleRunIngestion('world_bank')}
                      disabled={ingestionInProgress}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Now
                    </Button>
                  </div>

                  {/* ReliefWeb */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">ReliefWeb Reports</h4>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Humanitarian reports and situation updates
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => handleRunIngestion('reliefweb')}
                      disabled={ingestionInProgress}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Now
                    </Button>
                  </div>

                  {/* Manual Upload */}
                  <div className="p-4 border rounded-lg border-dashed">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Manual Upload</h4>
                      <Badge variant="outline">Manual</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Upload documents directly from local files
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setShowUploadDialog(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Runs */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{language === 'ar' ? 'عمليات الاستيعاب الأخيرة' : 'Recent Ingestion Runs'}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => refetchRuns()}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentRuns?.map((run: any) => (
                      <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {run.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : run.status === 'failed' ? (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium">{run.sourceName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(run.startedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600">+{run.documentsNew || 0} new</span>
                          <span className="text-gray-500">{run.documentsDuplicate || 0} dup</span>
                          {run.documentsFailed > 0 && (
                            <span className="text-red-500">{run.documentsFailed} failed</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!recentRuns || recentRuns.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        {language === 'ar' ? 'لا توجد عمليات استيعاب حديثة' : 'No recent ingestion runs'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tables Tab */}
          <TabsContent value="tables">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ar' ? 'الجداول المستخرجة بحاجة للمراجعة' : 'Extracted Tables Needing Review'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'راجع جودة الاستخراج وقم بترقية الجداول إلى مجموعات البيانات'
                    : 'Review extraction quality and promote tables to datasets'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tablesNeedingReview && tablesNeedingReview.length > 0 ? (
                  <div className="space-y-4">
                    {tablesNeedingReview.map((table: any) => (
                      <div key={table.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">
                              {table.titleEn || `Table ${table.tableIndex + 1}`}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Version ID: {table.versionId} • Page {table.pageNumber || 'N/A'}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{table.extractionMethod}</Badge>
                              <Badge variant={table.extractionQuality === 'high' ? 'default' : 'secondary'}>
                                {table.extractionQuality}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {table.rowCount} rows × {table.columnCount} cols
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button variant="default" size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Promote
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>{language === 'ar' ? 'جميع الجداول تمت مراجعتها' : 'All tables have been reviewed'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Translations Tab */}
          <TabsContent value="translations">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ar' ? 'الترجمات بحاجة للمراجعة' : 'Translations Needing Review'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar'
                    ? 'راجع الالتزام بالمسرد وسلامة الأرقام'
                    : 'Review glossary adherence and numeric integrity'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {translationsNeedingReview && translationsNeedingReview.length > 0 ? (
                  <div className="space-y-4">
                    {translationsNeedingReview.map((trans: any) => (
                      <div key={trans.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{trans.targetLang.toUpperCase()}</Badge>
                              <Badge variant={trans.numericIntegrityPass ? 'default' : 'destructive'}>
                                {trans.numericIntegrityPass ? 'Numeric OK' : 'Numeric Issues'}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Glossary: {trans.glossaryAdherenceScore?.toFixed(0) || 0}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              Version ID: {trans.versionId} • Method: {trans.method}
                            </p>
                            {trans.glossaryIssues && trans.glossaryIssues.length > 0 && (
                              <div className="mt-2 text-sm text-yellow-600">
                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                {trans.glossaryIssues.length} glossary issues
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button variant="default" size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>{language === 'ar' ? 'جميع الترجمات تمت مراجعتها' : 'All translations have been reviewed'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'رفع وثيقة جديدة' : 'Upload New Document'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar'
                ? 'أضف وثيقة يدويًا إلى المكتبة'
                : 'Manually add a document to the library'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
              <Input placeholder="Document title..." />
            </div>
            <div>
              <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
              <Input placeholder="عنوان الوثيقة..." dir="rtl" />
            </div>
            <div>
              <Label>{language === 'ar' ? 'الناشر' : 'Publisher'}</Label>
              <Input placeholder="Publisher name..." />
            </div>
            <div>
              <Label>{language === 'ar' ? 'نوع الوثيقة' : 'Document Type'}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="working_paper">Working Paper</SelectItem>
                  <SelectItem value="policy_brief">Policy Brief</SelectItem>
                  <SelectItem value="sitrep">Situation Report</SelectItem>
                  <SelectItem value="evaluation">Evaluation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{language === 'ar' ? 'رابط المصدر' : 'Source URL'}</Label>
              <Input placeholder="https://..." />
            </div>
            <div>
              <Label>{language === 'ar' ? 'الملخص' : 'Summary'}</Label>
              <Textarea placeholder="Brief summary..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={() => {
              toast.info('Upload functionality coming soon');
              setShowUploadDialog(false);
            }}>
              <Upload className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'رفع' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
