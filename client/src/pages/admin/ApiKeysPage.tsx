/**
 * API Key Management - Professional admin interface for managing data source credentials
 * 
 * Features:
 * - Secure credential storage and management
 * - Validation testing with real-time feedback
 * - Source contact information display
 * - Step-by-step registration instructions
 * - Credential health monitoring
 * - Expiry tracking and alerts
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Key,
  Mail,
  Phone,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export default function ApiKeysPage() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const [selectedSource, setSelectedSource] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: credentials, isLoading: loadingCreds, refetch: refetchCreds } = trpc.apiKeys.getAllCredentials.useQuery();
  const { data: sources, isLoading: loadingSources } = trpc.apiKeys.getSourcesWithInstructions.useQuery();

  const utils = trpc.useUtils();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? 'إدارة مفاتيح API' : 'API Key Management'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? 'إدارة بيانات الاعتماد الآمنة لمصادر البيانات مع التحقق والمراقبة'
              : 'Manage secure credentials for data sources with validation and monitoring'}
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? 'إضافة بيانات اعتماد' : 'Add Credential'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <AddCredentialDialog
              sources={sources || []}
              onSuccess={() => {
                setShowAddDialog(false);
                refetchCreds();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'بيانات الاعتماد النشطة' : 'Active Credentials'}
            </CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credentials?.filter(c => c.isActive && c.validationStatus === 'valid').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'تم التحقق منها وجاهزة' : 'Validated and ready'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'تتطلب التحقق' : 'Needs Validation'}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credentials?.filter(c => c.validationStatus === 'untested').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'لم يتم اختبارها بعد' : 'Not tested yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'منتهية الصلاحية' : 'Expired'}
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credentials?.filter(c => c.validationStatus === 'expired' || c.validationStatus === 'invalid').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'تحتاج إلى تحديث' : 'Need renewal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'المصادر المتاحة' : 'Available Sources'}
            </CardTitle>
            <Key className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sources?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'مع تعليمات التسجيل' : 'With registration guides'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="credentials" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credentials">
            {isArabic ? 'بيانات الاعتماد' : 'Credentials'}
          </TabsTrigger>
          <TabsTrigger value="sources">
            {isArabic ? 'المصادر' : 'Sources'}
          </TabsTrigger>
          <TabsTrigger value="health">
            {isArabic ? 'المراقبة' : 'Health Monitor'}
          </TabsTrigger>
        </TabsList>

        {/* Credentials Tab */}
        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'بيانات الاعتماد المُدارة' : 'Managed Credentials'}</CardTitle>
              <CardDescription>
                {isArabic
                  ? 'عرض وإدارة جميع بيانات اعتماد API المخزنة'
                  : 'View and manage all stored API credentials'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCreds ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isArabic ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : credentials && credentials.length > 0 ? (
                <CredentialsTable credentials={credentials} onRefetch={refetchCreds} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isArabic ? 'لا توجد بيانات اعتماد بعد' : 'No credentials yet'}</p>
                  <p className="text-sm mt-2">
                    {isArabic
                      ? 'انقر على "إضافة بيانات اعتماد" للبدء'
                      : 'Click "Add Credential" to get started'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'مصادر البيانات' : 'Data Sources'}</CardTitle>
              <CardDescription>
                {isArabic
                  ? 'تصفح المصادر المتاحة مع تعليمات التسجيل ومعلومات الاتصال'
                  : 'Browse available sources with registration instructions and contact information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSources ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isArabic ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : sources && sources.length > 0 ? (
                <SourcesGrid sources={sources} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{isArabic ? 'لا توجد مصادر متاحة' : 'No sources available'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Monitor Tab */}
        <TabsContent value="health" className="space-y-4">
          <HealthMonitor credentials={credentials || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Credentials Table Component
 */
function CredentialsTable({ credentials, onRefetch }: { credentials: any[]; onRefetch: () => void }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const validateMutation = trpc.apiKeys.validateCredential.useMutation({
    onSuccess: (data: any) => {
      toast(data.isValid ? (isArabic ? 'صالح' : 'Valid') : (isArabic ? 'غير صالح' : 'Invalid'), {
        description: data.message,
      });
      onRefetch();
    },
  });

  const deleteMutation = trpc.apiKeys.deleteCredential.useMutation({
    onSuccess: () => {
      toast(isArabic ? 'تم الحذف' : 'Deleted', {
        description: isArabic ? 'تم حذف بيانات الاعتماد بنجاح' : 'Credential deleted successfully',
      });
      onRefetch();
    },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{isArabic ? 'المصدر' : 'Source'}</TableHead>
          <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
          <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
          <TableHead>{isArabic ? 'آخر تحقق' : 'Last Validated'}</TableHead>
          <TableHead>{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {credentials.map((cred) => (
          <TableRow key={cred.id}>
            <TableCell className="font-medium">{cred.sourceName}</TableCell>
            <TableCell>
              <Badge variant="outline">{cred.credentialType}</Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  cred.validationStatus === 'valid'
                    ? 'default'
                    : cred.validationStatus === 'invalid' || cred.validationStatus === 'expired'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {cred.validationStatus === 'valid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {cred.validationStatus === 'invalid' && <XCircle className="h-3 w-3 mr-1" />}
                {cred.validationStatus === 'expired' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {cred.validationStatus === 'untested' && <Clock className="h-3 w-3 mr-1" />}
                {cred.validationStatus}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {cred.lastValidatedAt
                ? new Date(cred.lastValidatedAt).toLocaleDateString()
                : isArabic
                ? 'لم يتم التحقق بعد'
                : 'Not validated'}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => validateMutation.mutate({ credentialId: cred.id })}
                  disabled={validateMutation.isPending}
                >
                  {validateMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm(isArabic ? 'هل أنت متأكد؟' : 'Are you sure?')) {
                      deleteMutation.mutate({ credentialId: cred.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Sources Grid Component
 */
function SourcesGrid({ sources }: { sources: any[] }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sources.map((source) => (
        <Card key={source.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{source.name}</CardTitle>
                <CardDescription>{source.organization}</CardDescription>
              </div>
              {source.instructions && (
                <Badge variant={source.instructions.requiresApproval ? 'secondary' : 'default'}>
                  {source.instructions.requiresApproval
                    ? isArabic
                      ? 'يتطلب موافقة'
                      : 'Requires Approval'
                    : isArabic
                    ? 'وصول فوري'
                    : 'Instant Access'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Information */}
            {source.contacts && source.contacts.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {isArabic ? 'معلومات الاتصال' : 'Contact Information'}
                </h4>
                <div className="space-y-2">
                  {source.contacts.map((contact: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                          {contact.email}
                        </a>
                        {contact.isPrimary && (
                          <Badge variant="outline" className="text-xs">
                            {isArabic ? 'أساسي' : 'Primary'}
                          </Badge>
                        )}
                      </div>
                      {contact.department && (
                        <div className="text-xs text-muted-foreground ml-5">{contact.department}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* API Instructions */}
            {source.instructions && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {isArabic ? 'عرض تعليمات التسجيل' : 'View Registration Guide'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <RegistrationInstructionsDialog source={source} />
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Registration Instructions Dialog
 */
function RegistrationInstructionsDialog({ source }: { source: any }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const instructions = source.instructions;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast(isArabic ? 'تم النسخ' : 'Copied', {
      description: isArabic ? 'تم نسخ النص إلى الحافظة' : 'Text copied to clipboard',
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{source.name} - {isArabic ? 'دليل التسجيل' : 'Registration Guide'}</DialogTitle>
        <DialogDescription>{source.organization}</DialogDescription>
      </DialogHeader>

      <div className="space-y-6 mt-4">
        {/* Key Information */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <div className="text-sm font-medium">{isArabic ? 'النوع' : 'Type'}</div>
            <div className="text-sm text-muted-foreground">{instructions.credentialType}</div>
          </div>
          <div>
            <div className="text-sm font-medium">{isArabic ? 'حد المعدل' : 'Rate Limit'}</div>
            <div className="text-sm text-muted-foreground">
              {instructions.defaultRateLimit} / {instructions.rateLimitPeriod}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">{isArabic ? 'الموافقة' : 'Approval'}</div>
            <div className="text-sm text-muted-foreground">
              {instructions.requiresApproval
                ? instructions.approvalTimeline || (isArabic ? 'مطلوب' : 'Required')
                : isArabic
                ? 'فوري' 
                : 'Instant'}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">{isArabic ? 'التكلفة' : 'Cost'}</div>
            <div className="text-sm text-muted-foreground">
              {instructions.requiresPayment ? instructions.pricingInfo : isArabic ? 'مجاني' : 'Free'}
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div>
          <h3 className="font-semibold mb-3">{isArabic ? 'التعليمات خطوة بخطوة' : 'Step-by-Step Instructions'}</h3>
          <Accordion type="single" collapsible className="w-full">
            {instructions.steps.map((step: any, idx: number) => (
              <AccordionItem key={idx} value={`step-${idx}`}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {step.stepNumber}
                    </div>
                    <span>{step.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm">{step.description}</p>
                  {step.tips && step.tips.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        {isArabic ? 'نصائح' : 'Tips'}
                      </div>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        {step.tips.map((tip: string, tipIdx: number) => (
                          <li key={tipIdx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Example Request */}
        {instructions.exampleRequest && (
          <div>
            <h3 className="font-semibold mb-2">{isArabic ? 'مثال على الطلب' : 'Example Request'}</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                {instructions.exampleRequest}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(instructions.exampleRequest)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Common Issues */}
        {instructions.commonIssues && instructions.commonIssues.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">{isArabic ? 'المشاكل الشائعة' : 'Common Issues'}</h3>
            <div className="space-y-2">
              {instructions.commonIssues.map((issue: any, idx: number) => (
                <div key={idx} className="border-l-4 border-yellow-500 pl-4 py-2">
                  <div className="font-medium text-sm">{issue.issue}</div>
                  <div className="text-sm text-muted-foreground">{issue.solution}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips and Tricks */}
        {instructions.tipsAndTricks && instructions.tipsAndTricks.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">{isArabic ? 'نصائح وحيل' : 'Tips & Tricks'}</h3>
            <ul className="space-y-1 text-sm list-disc list-inside">
              {instructions.tipsAndTricks.map((tip: string, idx: number) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Links */}
        <div className="flex gap-4 pt-4 border-t">
          <Button variant="outline" asChild>
            <a href={instructions.registrationUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              {isArabic ? 'صفحة التسجيل' : 'Registration Page'}
            </a>
          </Button>
          {instructions.documentationUrl && (
            <Button variant="outline" asChild>
              <a href={instructions.documentationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {isArabic ? 'التوثيق' : 'Documentation'}
              </a>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Add Credential Dialog
 */
function AddCredentialDialog({ sources, onSuccess }: { sources: any[]; onSuccess: () => void }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [credentialType, setCredentialType] = useState<string>('api_key');
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const addMutation = trpc.apiKeys.addCredential.useMutation({
    onSuccess: () => {
      toast(isArabic ? 'تمت الإضافة' : 'Added', {
        description: isArabic ? 'تمت إضافة بيانات الاعتماد بنجاح' : 'Credential added successfully',
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(isArabic ? 'خطأ' : 'Error', {
        description: error.message,
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedSourceId) {
      toast.error(isArabic ? 'خطأ' : 'Error', {
        description: isArabic ? 'يرجى اختيار مصدر' : 'Please select a source',
      });
      return;
    }

    addMutation.mutate({
      sourceId: parseInt(selectedSourceId),
      credentialType: credentialType as any,
      apiKey: credentialType === 'api_key' ? apiKey : undefined,
      username: credentialType === 'basic_auth' ? username : undefined,
      password: credentialType === 'basic_auth' ? password : undefined,
      notes,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isArabic ? 'إضافة بيانات اعتماد جديدة' : 'Add New Credential'}</DialogTitle>
        <DialogDescription>
          {isArabic
            ? 'أضف مفتاح API أو بيانات اعتماد أخرى لمصدر بيانات'
            : 'Add an API key or other credentials for a data source'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div>
          <Label>{isArabic ? 'المصدر' : 'Source'}</Label>
          <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
            <SelectTrigger>
              <SelectValue placeholder={isArabic ? 'اختر مصدرًا' : 'Select a source'} />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source.id} value={source.id.toString()}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{isArabic ? 'نوع بيانات الاعتماد' : 'Credential Type'}</Label>
          <Select value={credentialType} onValueChange={setCredentialType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="api_key">{isArabic ? 'مفتاح API' : 'API Key'}</SelectItem>
              <SelectItem value="basic_auth">{isArabic ? 'مصادقة أساسية' : 'Basic Auth'}</SelectItem>
              <SelectItem value="oauth_token">{isArabic ? 'رمز OAuth' : 'OAuth Token'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {credentialType === 'api_key' && (
          <div>
            <Label>{isArabic ? 'مفتاح API' : 'API Key'}</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={isArabic ? 'أدخل مفتاح API' : 'Enter API key'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {credentialType === 'basic_auth' && (
          <>
            <div>
              <Label>{isArabic ? 'اسم المستخدم' : 'Username'}</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isArabic ? 'أدخل اسم المستخدم' : 'Enter username'}
              />
            </div>
            <div>
              <Label>{isArabic ? 'كلمة المرور' : 'Password'}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isArabic ? 'أدخل كلمة المرور' : 'Enter password'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        )}

        <div>
          <Label>{isArabic ? 'ملاحظات' : 'Notes'}</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isArabic ? 'ملاحظات اختيارية' : 'Optional notes'}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={addMutation.isPending}>
          {addMutation.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {isArabic ? 'إضافة' : 'Add'}
        </Button>
      </DialogFooter>
    </>
  );
}

/**
 * Health Monitor Component
 */
function HealthMonitor({ credentials }: { credentials: any[] }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const validCreds = credentials.filter(c => c.validationStatus === 'valid');
  const expiringSoon = credentials.filter(c => {
    if (!c.expiresAt) return false;
    const daysUntilExpiry = Math.floor((new Date(c.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });
  const expired = credentials.filter(c => c.validationStatus === 'expired' || c.validationStatus === 'invalid');

  return (
    <div className="space-y-6">
      {/* Expiring Soon */}
      {expiringSoon.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              {isArabic ? 'تنتهي صلاحيتها قريبًا' : 'Expiring Soon'}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? 'بيانات الاعتماد التي ستنتهي صلاحيتها خلال 30 يومًا'
                : 'Credentials expiring within 30 days'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.map((cred) => (
                <div key={cred.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{cred.sourceName}</div>
                    <div className="text-sm text-muted-foreground">
                      {isArabic ? 'تنتهي في' : 'Expires on'} {new Date(cred.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {Math.floor((new Date(cred.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}{' '}
                    {isArabic ? 'يوم' : 'days'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expired/Invalid */}
      {expired.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              {isArabic ? 'تحتاج إلى اهتمام' : 'Needs Attention'}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? 'بيانات الاعتماد المنتهية أو غير الصالحة'
                : 'Expired or invalid credentials'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expired.map((cred) => (
                <div key={cred.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg">
                  <div>
                    <div className="font-medium">{cred.sourceName}</div>
                    <div className="text-sm text-red-600">{cred.validationMessage || cred.validationStatus}</div>
                  </div>
                  <Badge variant="destructive">{cred.validationStatus}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Healthy Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {isArabic ? 'بيانات الاعتماد الصحية' : 'Healthy Credentials'}
          </CardTitle>
          <CardDescription>
            {isArabic
              ? 'بيانات الاعتماد الصالحة والنشطة'
              : 'Valid and active credentials'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validCreds.length > 0 ? (
            <div className="space-y-2">
              {validCreds.map((cred) => (
                <div key={cred.id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg">
                  <div>
                    <div className="font-medium">{cred.sourceName}</div>
                    <div className="text-sm text-muted-foreground">
                      {isArabic ? 'آخر تحقق:' : 'Last validated:'}{' '}
                      {cred.lastValidatedAt ? new Date(cred.lastValidatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <Badge variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {isArabic ? 'صالح' : 'Valid'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{isArabic ? 'لا توجد بيانات اعتماد صالحة بعد' : 'No valid credentials yet'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
