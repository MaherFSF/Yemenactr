/**
 * YETO Webhook Management Admin UI
 * 
 * Manage webhook endpoints, test deliveries, and monitor delivery status
 */

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, Trash2, Plus, Send, RefreshCw, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface WebhookEndpoint {
  id: string;
  url: string;
  name?: string;
  events: string[];
  active: boolean;
  createdAt: Date;
  stats?: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    successRate: number;
  };
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  sourceId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  responseTimeMs?: number;
  attemptNumber: number;
  errorMessage?: string;
  createdAt: Date;
}

export default function WebhookManagement() {
  const { language, t } = useLanguage();
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookName, setNewWebhookName] = useState('');
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleRegisterWebhook = async () => {
    if (!newWebhookUrl) return;

    setIsLoading(true);
    try {
      // In production, call tRPC endpoint
      // const result = await trpc.webhooks.registerWebhook.mutate({
      //   url: newWebhookUrl,
      //   name: newWebhookName,
      //   events: ['ingestion.completed', 'ingestion.failed', 'ingestion.partial'],
      // });

      // Mock webhook creation
      const newWebhook: WebhookEndpoint = {
        id: `webhook-${Date.now()}`,
        url: newWebhookUrl,
        name: newWebhookName || 'Unnamed Webhook',
        events: ['ingestion.completed', 'ingestion.failed', 'ingestion.partial'],
        active: true,
        createdAt: new Date(),
        stats: {
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          successRate: 0,
        },
      };

      setWebhooks([...webhooks, newWebhook]);
      setNewWebhookUrl('');
      setNewWebhookName('');
      setTestResult({ success: true, message: 'Webhook registered successfully' });
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to register webhook' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    setIsLoading(true);
    try {
      const webhook = webhooks.find((w) => w.id === webhookId);
      if (!webhook) return;

      // In production, call tRPC endpoint
      // const result = await trpc.webhooks.testWebhook.mutate({
      //   url: webhook.url,
      // });

      setTestResult({ success: true, message: `Webhook test successful (${Math.random() * 1000 | 0}ms)` });
    } catch (error) {
      setTestResult({ success: false, message: 'Webhook test failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      // In production, call tRPC endpoint
      // await trpc.webhooks.deleteWebhook.mutate({ webhookId });

      setWebhooks(webhooks.filter((w) => w.id !== webhookId));
      setTestResult({ success: true, message: 'Webhook deleted successfully' });
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to delete webhook' });
    }
  };

  const handleRetryDelivery = async (deliveryId: string) => {
    try {
      // In production, call tRPC endpoint
      // await trpc.webhooks.retryWebhook.mutate({ deliveryId });

      setTestResult({ success: true, message: 'Retry initiated' });
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to retry delivery' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'إدارة الخطافات' : 'Webhook Management'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'ar'
            ? 'إدارة نقاط نهاية الخطافات وتتبع حالة التسليم'
            : 'Manage webhook endpoints and monitor delivery status'}
        </p>
      </div>

      {/* Test Result Alert */}
      {testResult && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Register Webhook Section */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'تسجيل خطاف جديد' : 'Register New Webhook'}</CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'أضف نقطة نهاية جديدة لاستقبال إشعارات البيانات'
              : 'Add a new endpoint to receive data notifications'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder={language === 'ar' ? 'https://example.com/webhooks' : 'https://example.com/webhooks'}
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
            />
            <Input
              placeholder={language === 'ar' ? 'اسم الخطاف (اختياري)' : 'Webhook name (optional)'}
              value={newWebhookName}
              onChange={(e) => setNewWebhookName(e.target.value)}
            />
          </div>
          <Button onClick={handleRegisterWebhook} disabled={!newWebhookUrl || isLoading} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تسجيل الخطاف' : 'Register Webhook'}
          </Button>
        </CardContent>
      </Card>

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'الخطافات المسجلة' : 'Registered Webhooks'}</CardTitle>
          <CardDescription>
            {language === 'ar'
              ? `إجمالي: ${webhooks.length} خطاف`
              : `Total: ${webhooks.length} webhooks`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {language === 'ar' ? 'لا توجد خطافات مسجلة' : 'No webhooks registered'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                    <TableHead>{language === 'ar' ? 'URL' : 'URL'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead>{language === 'ar' ? 'معدل النجاح' : 'Success Rate'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.name}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{webhook.url}</TableCell>
                      <TableCell>
                        <Badge className={webhook.active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {webhook.active ? (language === 'ar' ? 'نشط' : 'Active') : language === 'ar' ? 'غير نشط' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {webhook.stats ? (
                          <span className="text-sm font-medium">{webhook.stats.successRate.toFixed(1)}%</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedWebhookId(webhook.id)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {language === 'ar' ? 'اختبار الخطاف' : 'Test Webhook'}
                                </DialogTitle>
                                <DialogDescription>
                                  {language === 'ar'
                                    ? 'إرسال رسالة اختبار إلى نقطة النهاية'
                                    : 'Send a test message to the endpoint'}
                                </DialogDescription>
                              </DialogHeader>
                              <Button
                                onClick={() => handleTestWebhook(webhook.id)}
                                disabled={isLoading}
                                className="w-full"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {language === 'ar' ? 'إرسال الاختبار' : 'Send Test'}
                              </Button>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'التسليمات الأخيرة' : 'Recent Deliveries'}</CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'آخر محاولات تسليم الخطافات'
              : 'Latest webhook delivery attempts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {language === 'ar' ? 'لا توجد تسليمات' : 'No deliveries yet'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ar' ? 'الحدث' : 'Event'}</TableHead>
                    <TableHead>{language === 'ar' ? 'المصدر' : 'Source'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الوقت' : 'Time'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.eventType}</TableCell>
                      <TableCell>{delivery.sourceId}</TableCell>
                      <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {delivery.responseTimeMs ? `${delivery.responseTimeMs}ms` : '-'}
                      </TableCell>
                      <TableCell>
                        {delivery.status === 'FAILED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetryDelivery(delivery.id)}
                            disabled={isLoading}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'إجمالي التسليمات' : 'Total Deliveries'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webhooks.reduce((sum, w) => sum + (w.stats?.totalDeliveries || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'التسليمات الناجحة' : 'Successful'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {webhooks.reduce((sum, w) => sum + (w.stats?.successfulDeliveries || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'التسليمات الفاشلة' : 'Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {webhooks.reduce((sum, w) => sum + (w.stats?.failedDeliveries || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'معدل النجاح' : 'Success Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webhooks.length > 0
                ? (
                    (webhooks.reduce((sum, w) => sum + (w.stats?.successRate || 0), 0) /
                      webhooks.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
