/**
import AdminGuard from "@/components/AdminGuard";
 * Autopilot Control Room
 * 
 * Admin dashboard for monitoring and controlling the YETO Autopilot OS.
 * Provides visibility into:
 * - Ingestion status and connector health
 * - QA runs and integrity reports
 * - Fix tickets and their resolution status
 * - Coverage map and gaps
 * - Publish gate status
 */

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  FileText,
  Globe,
  Loader2,
  Play,
  RefreshCw,
  Settings,
  Shield,
  Target,
  Ticket,
  TrendingUp,
  XCircle,
  Zap
} from 'lucide-react';

export default function AutopilotControlRoom() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard data
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = 
    trpc.autopilot.getDashboard.useQuery();
  
  const { data: ingestionStatus } = trpc.autopilot.getIngestionStatus.useQuery();
  const { data: qaStatus } = trpc.autopilot.getQAStatus.useQuery();
  const { data: tickets } = trpc.autopilot.getFixTickets.useQuery({ limit: 20 });
  const { data: publishGate } = trpc.autopilot.checkPublishGate.useQuery();
  const { data: events } = trpc.autopilot.getEvents.useQuery({ limit: 50 });

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      running: { variant: 'default', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
      success: { variant: 'secondary', icon: <CheckCircle className="h-3 w-3 text-emerald-500" /> },
      pass: { variant: 'secondary', icon: <CheckCircle className="h-3 w-3 text-emerald-500" /> },
      pass_warn: { variant: 'outline', icon: <AlertTriangle className="h-3 w-3 text-amber-500" /> },
      partial: { variant: 'outline', icon: <AlertTriangle className="h-3 w-3 text-amber-500" /> },
      failed: { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
      fail: { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
      open: { variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
      in_progress: { variant: 'default', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
      resolved: { variant: 'secondary', icon: <CheckCircle className="h-3 w-3 text-emerald-500" /> },
    };
    
    const config = statusConfig[status] || { variant: 'outline' as const, icon: null };
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  };

  // Severity badge helper
  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return (
      <Badge className={cn('border-0', colors[severity] || colors.low)}>
        {severity}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              {language === 'ar' ? 'غرفة التحكم الآلي' : 'Autopilot Control Room'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'مراقبة وإدارة نظام YETO الآلي'
                : 'Monitor and manage the YETO Autopilot OS'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetchDashboard()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </Button>
            <Button size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الإعدادات' : 'Settings'}
            </Button>
          </div>
        </div>

        {/* Publish Gate Status */}
        <Card className={cn(
          'border-2',
          publishGate?.allowed 
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
            : 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
        )}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-full',
                  publishGate?.allowed ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-red-100 dark:bg-red-900'
                )}>
                  {publishGate?.allowed 
                    ? <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    : <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                  }
                </div>
                <div>
                  <h3 className="font-semibold">
                    {language === 'ar' ? 'بوابة النشر' : 'Publish Gate'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {publishGate?.allowed 
                      ? (language === 'ar' ? 'جاهز للنشر - جميع الفحوصات ناجحة' : 'Ready to publish - all checks passed')
                      : (language === 'ar' ? `محظور: ${publishGate?.blockedReason}` : `Blocked: ${publishGate?.blockedReason}`)
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{publishGate?.criticalTickets || 0}</div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'تذاكر حرجة' : 'Critical Tickets'}
                  </div>
                </div>
                <Button 
                  disabled={!publishGate?.allowed}
                  className={publishGate?.allowed ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'نشر' : 'Publish'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                {language === 'ar' ? 'الاستيعاب' : 'Ingestion'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboard?.ingestion as any)?.activeConnectors || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'موصلات نشطة' : 'Active connectors'}
              </p>
              {(dashboard?.ingestion as any)?.runningJobs > 0 && (
                <Badge variant="default" className="mt-2">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  {(dashboard?.ingestion as any)?.runningJobs} {language === 'ar' ? 'قيد التشغيل' : 'running'}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                {language === 'ar' ? 'ضمان الجودة' : 'QA Status'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboard?.qa as any)?.passedRuns || 0}/{(dashboard?.qa as any)?.totalRuns || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'فحوصات ناجحة (24 ساعة)' : 'Checks passed (24h)'}
              </p>
              <Progress 
                value={((dashboard?.qa as any)?.passedRuns / Math.max((dashboard?.qa as any)?.totalRuns, 1)) * 100} 
                className="mt-2 h-1"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Ticket className="h-4 w-4 text-amber-500" />
                {language === 'ar' ? 'التذاكر' : 'Tickets'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboard?.tickets as any)?.open || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'تذاكر مفتوحة' : 'Open tickets'}
              </p>
              {(dashboard?.tickets as any)?.critical > 0 && (
                <Badge variant="destructive" className="mt-2">
                  {(dashboard?.tickets as any)?.critical} {language === 'ar' ? 'حرجة' : 'critical'}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                {language === 'ar' ? 'التغطية' : 'Coverage'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((dashboard?.coverage as any)?.avgCoverage * 100 || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'متوسط التغطية' : 'Average coverage'}
              </p>
              <Progress 
                value={(dashboard?.coverage as any)?.avgCoverage * 100 || 0} 
                className="mt-2 h-1"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="ingestion">
              <Database className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الاستيعاب' : 'Ingestion'}
            </TabsTrigger>
            <TabsTrigger value="qa">
              <Shield className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'ضمان الجودة' : 'QA'}
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <Ticket className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'التذاكر' : 'Tickets'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'ar' ? 'الأحداث الأخيرة' : 'Recent Events'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {(dashboard?.recentEvents as any[] || []).map((event: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <div className={cn(
                            'p-1.5 rounded-full',
                            event.eventType.includes('completed') || event.eventType.includes('resolved')
                              ? 'bg-emerald-100 dark:bg-emerald-900/30'
                              : event.eventType.includes('failed') || event.eventType.includes('error')
                                ? 'bg-red-100 dark:bg-red-900/30'
                                : 'bg-blue-100 dark:bg-blue-900/30'
                          )}>
                            {event.eventType.includes('ingestion') && <Database className="h-3 w-3" />}
                            {event.eventType.includes('qa') && <Shield className="h-3 w-3" />}
                            {event.eventType.includes('ticket') && <Ticket className="h-3 w-3" />}
                            {event.eventType.includes('page') && <FileText className="h-3 w-3" />}
                            {event.eventType.includes('setting') && <Settings className="h-3 w-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.summary}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.createdAt).toLocaleString(language === 'ar' ? 'ar-YE' : 'en-US')}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(!dashboard?.recentEvents || (dashboard.recentEvents as any[]).length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          {language === 'ar' ? 'لا توجد أحداث حديثة' : 'No recent events'}
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تشغيل فحص الجودة الكامل' : 'Run Full QA Scan'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تحديث جميع الموصلات' : 'Refresh All Connectors'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تحديث خريطة التغطية' : 'Update Coverage Map'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'إنشاء تقرير النزاهة' : 'Generate Integrity Report'}
                  </Button>
                  <Separator />
                  <Button variant="outline" className="w-full justify-start text-amber-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'مسح الكود الثابت' : 'Scan for Hardcoded Values'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ingestion Tab */}
          <TabsContent value="ingestion">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'حالة الموصلات' : 'Connector Status'}</CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'حالة جميع موصلات البيانات وآخر تشغيل'
                    : 'Status of all data connectors and their last run'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ar' ? 'الموصل' : 'Connector'}</TableHead>
                      <TableHead>{language === 'ar' ? 'آخر تشغيل' : 'Last Run'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead>{language === 'ar' ? 'السجلات' : 'Records'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الإجمالي' : 'Total Runs'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(ingestionStatus as any[] || []).map((connector: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{connector.connectorName}</TableCell>
                        <TableCell>
                          {connector.lastRun 
                            ? new Date(connector.lastRun).toLocaleString(language === 'ar' ? 'ar-YE' : 'en-US')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(connector.lastStatus || 'unknown')}</TableCell>
                        <TableCell>{connector.lastRecordsFetched || 0}</TableCell>
                        <TableCell>
                          <span className="text-emerald-600">{connector.successRuns || 0}</span>
                          {' / '}
                          <span className="text-red-600">{connector.failedRuns || 0}</span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!ingestionStatus || (ingestionStatus as any[]).length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {language === 'ar' ? 'لا توجد موصلات مسجلة' : 'No connectors registered'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QA Tab */}
          <TabsContent value="qa">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'فحوصات الجودة' : 'QA Checks'}</CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'حالة جميع فحوصات الجودة وآخر نتائج'
                    : 'Status of all QA checks and their latest results'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ar' ? 'نوع الفحص' : 'Check Type'}</TableHead>
                      <TableHead>{language === 'ar' ? 'آخر تشغيل' : 'Last Run'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الفحوصات' : 'Checks'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الفشل' : 'Failed'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(qaStatus as any[] || []).map((qa: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{qa.runType}</TableCell>
                        <TableCell>
                          {qa.lastRun 
                            ? new Date(qa.lastRun).toLocaleString(language === 'ar' ? 'ar-YE' : 'en-US')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(qa.lastStatus || 'unknown')}</TableCell>
                        <TableCell>{qa.lastTotalChecks || 0}</TableCell>
                        <TableCell>
                          <span className={qa.lastFailedChecks > 0 ? 'text-red-600 font-medium' : ''}>
                            {qa.lastFailedChecks || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!qaStatus || (qaStatus as any[]).length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {language === 'ar' ? 'لا توجد فحوصات مسجلة' : 'No QA runs recorded'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'تذاكر الإصلاح' : 'Fix Tickets'}</CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'المشاكل المكتشفة التي تحتاج إلى إصلاح'
                    : 'Issues detected that need to be fixed'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ar' ? 'العنوان' : 'Title'}</TableHead>
                      <TableHead>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الخطورة' : 'Severity'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead>{language === 'ar' ? 'تاريخ الإنشاء' : 'Created'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(tickets as any[] || []).map((ticket: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {ticket.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.ticketType}</Badge>
                        </TableCell>
                        <TableCell>{getSeverityBadge(ticket.severity)}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>
                          {new Date(ticket.createdAt).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            {language === 'ar' ? 'عرض' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!tickets || (tickets as any[]).length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {language === 'ar' ? 'لا توجد تذاكر مفتوحة' : 'No open tickets'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
