/**
 * Backfill Dashboard - Admin interface for managing historical data backfill
 * 
 * Features:
 * - Source analysis and strategy detection
 * - Backfill recommendations sorted by readiness
 * - Progress tracking with real-time updates
 * - Source-specific instructions for each strategy
 * - API key management
 * - Manual data entry workflows
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Key,
  FileText,
  Users,
  Database,
  TrendingUp,
  Info,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BackfillDashboardPage() {
  const { language } = useLanguage();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const { data: recommendations, isLoading: loadingRecs } = trpc.backfill.getRecommendations.useQuery();
  const { data: checkpoints, isLoading: loadingCheckpoints } = trpc.backfill.getCheckpoints.useQuery();

  const isArabic = language === 'ar';

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {isArabic ? 'لوحة تحكم الملء التاريخي' : 'Historical Backfill Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic
            ? 'إدارة استيراد البيانات التاريخية من 2010 إلى الآن عبر مصادر متعددة'
            : 'Manage historical data ingestion from 2010 to present across multiple sources'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'المصادر الجاهزة' : 'Ready Sources'}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recommendations?.filter(r => r.readinessScore >= 80).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'يمكن البدء فورًا' : 'Can start immediately'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'تتطلب مفاتيح API' : 'Require API Keys'}
            </CardTitle>
            <Key className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recommendations?.filter(r => r.readinessScore >= 50 && r.readinessScore < 80).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'جهود متوسطة' : 'Medium effort'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'تتطلب شراكات' : 'Need Partnerships'}
            </CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recommendations?.filter(r => r.readinessScore < 30).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? '2-6 أشهر' : '2-6 months'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'عمليات نشطة' : 'Active Jobs'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checkpoints?.filter(c => c.status === 'running').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'قيد التنفيذ' : 'In progress'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">
            {isArabic ? 'التوصيات' : 'Recommendations'}
          </TabsTrigger>
          <TabsTrigger value="progress">
            {isArabic ? 'التقدم' : 'Progress'}
          </TabsTrigger>
          <TabsTrigger value="instructions">
            {isArabic ? 'التعليمات' : 'Instructions'}
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'توصيات الملء حسب الجاهزية' : 'Backfill Recommendations by Readiness'}</CardTitle>
              <CardDescription>
                {isArabic
                  ? 'المصادر مرتبة حسب مدى جاهزيتها للملء التلقائي'
                  : 'Sources sorted by readiness for automated backfill'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRecs ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isArabic ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isArabic ? 'المصدر' : 'Source'}</TableHead>
                      <TableHead>{isArabic ? 'الأولوية' : 'Priority'}</TableHead>
                      <TableHead>{isArabic ? 'الجاهزية' : 'Readiness'}</TableHead>
                      <TableHead>{isArabic ? 'الأثر المتوقع' : 'Estimated Impact'}</TableHead>
                      <TableHead>{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendations?.map((rec) => (
                      <TableRow key={rec.sourceId}>
                        <TableCell className="font-medium">{rec.sourceName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              rec.priority === 'critical'
                                ? 'destructive'
                                : rec.priority === 'high'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {rec.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={rec.readinessScore} className="w-20" />
                            <span className="text-sm">{rec.readinessScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{rec.estimatedImpact}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSource(rec.sourceId)}
                              >
                                <Info className="h-4 w-4 mr-1" />
                                {isArabic ? 'التفاصيل' : 'Details'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <SourceAnalysisDialog sourceId={rec.sourceId} />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'عمليات الملء النشطة' : 'Active Backfill Jobs'}</CardTitle>
              <CardDescription>
                {isArabic
                  ? 'تتبع التقدم في الوقت الفعلي لعمليات استيراد البيانات'
                  : 'Real-time progress tracking for data ingestion jobs'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCheckpoints ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isArabic ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : checkpoints && checkpoints.length > 0 ? (
                <div className="space-y-4">
                  {checkpoints.map((checkpoint) => (
                    <Card key={checkpoint.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {checkpoint.indicatorCode}
                            </CardTitle>
                            <CardDescription>{checkpoint.datasetId}</CardDescription>
                          </div>
                          <Badge
                            variant={
                              checkpoint.status === 'completed'
                                ? 'default'
                                : checkpoint.status === 'running'
                                ? 'secondary'
                                : checkpoint.status === 'failed'
                                ? 'destructive'
                                : 'outline'
                            }
                          >
                            {checkpoint.status === 'running' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                            {checkpoint.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {checkpoint.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                            {checkpoint.status === 'paused' && <Pause className="h-3 w-3 mr-1" />}
                            {checkpoint.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>
                              {isArabic ? 'التقدم' : 'Progress'}: {checkpoint.processedDays} / {checkpoint.totalDays} {isArabic ? 'يوم' : 'days'}
                            </span>
                            <span>
                              {checkpoint.totalDays > 0
                                ? Math.round((checkpoint.processedDays / checkpoint.totalDays) * 100)
                                : 0}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              checkpoint.totalDays > 0
                                ? (checkpoint.processedDays / checkpoint.totalDays) * 100
                                : 0
                            }
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">{isArabic ? 'تم الإدراج' : 'Inserted'}</div>
                            <div className="font-semibold text-green-600">{checkpoint.insertedRecords}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">{isArabic ? 'تم التخطي' : 'Skipped'}</div>
                            <div className="font-semibold text-gray-600">{checkpoint.skippedRecords}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">{isArabic ? 'أخطاء' : 'Errors'}</div>
                            <div className="font-semibold text-red-600">{checkpoint.errorCount}</div>
                          </div>
                        </div>

                        {checkpoint.errors && checkpoint.errors.length > 0 && (
                          <div className="mt-4">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-muted-foreground">
                                {isArabic ? 'عرض الأخطاء' : 'View errors'} ({checkpoint.errors.length})
                              </summary>
                              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                                {checkpoint.errors.slice(-10).map((error, idx) => (
                                  <div key={idx} className="text-xs text-red-600 font-mono">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isArabic ? 'لا توجد عمليات ملء نشطة' : 'No active backfill jobs'}</p>
                  <p className="text-sm mt-2">
                    {isArabic
                      ? 'ابدأ عملية ملء جديدة من علامة التبويب "التوصيات"'
                      : 'Start a new backfill from the "Recommendations" tab'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instructions Tab */}
        <TabsContent value="instructions" className="space-y-4">
          <InstructionsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Source Analysis Dialog - Shows detailed strategy and instructions
 */
function SourceAnalysisDialog({ sourceId }: { sourceId: string }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const { data: analysis, isLoading } = trpc.backfill.analyzeSource.useQuery({ sourceId });

  if (isLoading) {
    return <div className="text-center py-8">{isArabic ? 'جاري التحليل...' : 'Analyzing...'}</div>;
  }

  if (!analysis) {
    return <div className="text-center py-8 text-red-600">{isArabic ? 'فشل التحليل' : 'Analysis failed'}</div>;
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{analysis.sourceName}</DialogTitle>
        <DialogDescription>{analysis.organization}</DialogDescription>
      </DialogHeader>

      <div className="space-y-6 mt-4">
        {/* Strategy */}
        <div>
          <h3 className="font-semibold mb-2">{isArabic ? 'الاستراتيجية الموصى بها' : 'Recommended Strategy'}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-base">
              {analysis.strategy.replace(/_/g, ' ')}
            </Badge>
            <span className="text-sm text-muted-foreground">
              ({Math.round(analysis.confidence * 100)}% {isArabic ? 'ثقة' : 'confidence'})
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{analysis.reasoning}</p>
        </div>

        {/* Requirements */}
        {analysis.requirements.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">{isArabic ? 'المتطلبات' : 'Requirements'}</h3>
            <div className="space-y-2">
              {analysis.requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  {req.status === 'met' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : req.status === 'blocked' ? (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                  )}
                  <div>
                    <div className="font-medium">{req.description}</div>
                    <div className="text-muted-foreground">{req.actionRequired}</div>
                    <div className="text-xs text-muted-foreground">
                      {isArabic ? 'مسؤول:' : 'Responsible:'} {req.responsibleParty}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {analysis.instructions.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">{isArabic ? 'التعليمات خطوة بخطوة' : 'Step-by-Step Instructions'}</h3>
            <ol className="space-y-2 text-sm">
              {analysis.instructions.map((instruction, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="font-mono text-muted-foreground">{idx + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Blockers */}
        {analysis.blockers.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              {isArabic ? 'العوائق' : 'Blockers'}
            </h3>
            <ul className="space-y-1 text-sm">
              {analysis.blockers.map((blocker, idx) => (
                <li key={idx} className="text-red-600">
                  • {blocker}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternatives */}
        {analysis.alternatives.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">{isArabic ? 'البدائل' : 'Alternatives'}</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analysis.alternatives.map((alt, idx) => (
                <li key={idx}>• {alt}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Estimated Effort */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{isArabic ? 'الجهد المقدر' : 'Estimated Effort'}:</span>
            <Badge
              variant={
                analysis.estimatedEffort === 'low'
                  ? 'default'
                  : analysis.estimatedEffort === 'medium'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {analysis.estimatedEffort}
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Instructions Panel - General guidance for different strategies
 */
function InstructionsPanel() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const strategies = [
    {
      type: 'api_public',
      title: isArabic ? 'واجهات برمجة التطبيقات العامة' : 'Public APIs',
      icon: <Database className="h-5 w-5" />,
      description: isArabic
        ? 'مصادر بيانات مع واجهات برمجة تطبيقات عامة لا تتطلب مصادقة'
        : 'Data sources with public APIs that require no authentication',
      steps: [
        isArabic ? 'راجع وثائق API للمصدر' : 'Review API documentation for the source',
        isArabic ? 'اختبر نقاط النهاية بطلبات عينة' : 'Test endpoints with sample requests',
        isArabic ? 'تحقق من حدود المعدل ونفذ التقييد' : 'Check rate limits and implement throttling',
        isArabic ? 'قم بتشغيل الملء مع إعادة المحاولة التلقائية' : 'Run backfill with automatic retries',
        isArabic ? 'راقب التغييرات في API أو الإهمال' : 'Monitor for API changes or deprecations',
      ],
      effort: isArabic ? 'منخفض' : 'Low',
      timeline: isArabic ? 'يمكن البدء فورًا' : 'Can start immediately',
    },
    {
      type: 'api_key_required',
      title: isArabic ? 'واجهات برمجة التطبيقات المصادق عليها' : 'Authenticated APIs',
      icon: <Key className="h-5 w-5" />,
      description: isArabic
        ? 'مصادر بيانات تتطلب مفاتيح API أو بيانات اعتماد'
        : 'Data sources that require API keys or credentials',
      steps: [
        isArabic ? 'قم بزيارة موقع المصدر للتسجيل للوصول إلى API' : 'Visit source website to register for API access',
        isArabic ? 'اطلب مفتاح API (قد يتطلب بريدًا إلكترونيًا مؤسسيًا)' : 'Request API key (may require institutional email)',
        isArabic ? 'قم بتخزين المفتاح بشكل آمن في لوحة إدارة YETO' : 'Store key securely in YETO admin panel',
        isArabic ? 'اختبر الاتصال قبل تشغيل الملء' : 'Test connection before running backfill',
        isArabic ? 'راقب حدود المعدل أثناء تنفيذ الملء' : 'Monitor rate limits during backfill execution',
      ],
      effort: isArabic ? 'متوسط' : 'Medium',
      timeline: isArabic ? '1-2 أيام (بعد الحصول على مفتاح API)' : '1-2 days (after API key obtained)',
    },
    {
      type: 'partnership_required',
      title: isArabic ? 'الشراكات المطلوبة' : 'Partnership Required',
      icon: <Users className="h-5 w-5" />,
      description: isArabic
        ? 'مصادر تتطلب اتفاقية شراكة رسمية أو مذكرة تفاهم'
        : 'Sources requiring formal partnership agreement or MOU',
      steps: [
        isArabic ? 'قم بصياغة اقتراح شراكة يسلط الضوء على مهمة YETO' : 'Draft partnership proposal highlighting YETO mission',
        isArabic ? 'أرسل بريدًا إلكترونيًا إلى منظمة المصدر مع الاقتراح' : 'Email source organization with proposal',
        isArabic ? 'حدد موعدًا لمكالمة لمناقشة شروط مشاركة البيانات' : 'Schedule call to discuss data sharing terms',
        isArabic ? 'تفاوض على تكرار الوصول إلى البيانات والتنسيق' : 'Negotiate data access frequency and format',
        isArabic ? 'وقع مذكرة تفاهم أو اتفاقية مشاركة البيانات' : 'Sign MOU or data sharing agreement',
        isArabic ? 'أنشئ التكامل التقني (مفتاح API، SFTP، إلخ)' : 'Establish technical integration (API key, SFTP, etc.)',
      ],
      effort: isArabic ? 'عالي جدًا' : 'Very High',
      timeline: isArabic ? '2-6 أشهر نموذجية' : '2-6 months typical',
    },
    {
      type: 'manual_entry',
      title: isArabic ? 'الإدخال اليدوي' : 'Manual Entry',
      icon: <FileText className="h-5 w-5" />,
      description: isArabic
        ? 'لا توجد طريقة وصول آلية - مطلوب إدخال بيانات يدوي'
        : 'No automated access method - manual data entry required',
      steps: [
        isArabic ? 'قم بتنزيل جميع التقارير المتاحة من موقع المصدر' : 'Download all available reports from source website',
        isArabic ? 'أنشئ قالب إدخال بيانات يطابق مخطط YETO' : 'Create data entry template matching YETO schema',
        isArabic ? 'استخرج نقاط البيانات يدويًا مع استشهادات المصدر' : 'Extract data points manually with source citations',
        isArabic ? 'تحقق مرة أخرى من جميع الإدخالات للتأكد من الدقة' : 'Double-check all entries for accuracy',
        isArabic ? 'قم بالتحميل عبر بوابة مساهمة شريك YETO' : 'Upload via YETO Partner Contribution Portal',
        isArabic ? 'ضع علامة على أي نقاط بيانات غامضة أو غير واضحة' : 'Flag any ambiguous or unclear data points',
      ],
      effort: isArabic ? 'عالي جدًا' : 'Very High',
      timeline: isArabic ? 'يعتمد على حجم مجموعة البيانات' : 'Depends on dataset size',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {strategies.map((strategy) => (
        <Card key={strategy.type}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">{strategy.icon}</div>
              <div>
                <CardTitle className="text-lg">{strategy.title}</CardTitle>
                <CardDescription>{strategy.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">
                {isArabic ? 'الخطوات:' : 'Steps:'}
              </h4>
              <ol className="space-y-2 text-sm">
                {strategy.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-mono text-muted-foreground">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-4 border-t flex justify-between items-center text-sm">
              <div>
                <span className="text-muted-foreground">{isArabic ? 'الجهد:' : 'Effort:'}</span>
                <span className="font-semibold ml-2">{strategy.effort}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isArabic ? 'الجدول الزمني:' : 'Timeline:'}</span>
                <span className="font-semibold ml-2">{strategy.timeline}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
