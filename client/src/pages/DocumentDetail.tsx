/**
 * Document Detail Page - Shows full document details with citation anchors
 */

import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Download,
  ExternalLink,
  Calendar,
  Building2,
  Globe,
  BookOpen,
  Table,
  Quote,
  Link as LinkIcon,
  Shield,
  Languages,
  Hash,
  Clock,
  Network
} from 'lucide-react';
import { RelatedInsightsPanel } from '@/components/RelatedInsights';

// Document type labels
const DOC_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  report: { en: 'Report', ar: 'تقرير' },
  working_paper: { en: 'Working Paper', ar: 'ورقة عمل' },
  policy_brief: { en: 'Policy Brief', ar: 'موجز سياسات' },
  dataset_doc: { en: 'Dataset Documentation', ar: 'توثيق البيانات' },
  sitrep: { en: 'Situation Report', ar: 'تقرير الوضع' },
  evaluation: { en: 'Evaluation', ar: 'تقييم' },
  annex: { en: 'Annex', ar: 'ملحق' },
  law_regulation: { en: 'Law/Regulation', ar: 'قانون/لائحة' },
  bulletin: { en: 'Bulletin', ar: 'نشرة' },
  circular: { en: 'Circular', ar: 'تعميم' },
  press_release: { en: 'Press Release', ar: 'بيان صحفي' },
  academic_paper: { en: 'Academic Paper', ar: 'ورقة أكاديمية' },
  thesis: { en: 'Thesis', ar: 'أطروحة' },
  methodology_note: { en: 'Methodology Note', ar: 'ملاحظة منهجية' },
  other: { en: 'Other', ar: 'أخرى' }
};

// Sector labels
const SECTOR_LABELS: Record<string, { en: string; ar: string }> = {
  banking_finance: { en: 'Banking & Finance', ar: 'البنوك والمالية' },
  fiscal_policy: { en: 'Fiscal Policy', ar: 'السياسة المالية' },
  monetary_policy: { en: 'Monetary Policy', ar: 'السياسة النقدية' },
  currency_fx: { en: 'Currency & FX', ar: 'العملة والصرف' },
  trade: { en: 'Trade', ar: 'التجارة' },
  food_security: { en: 'Food Security', ar: 'الأمن الغذائي' },
  humanitarian: { en: 'Humanitarian', ar: 'الإنسانية' },
  macroeconomic: { en: 'Macroeconomic', ar: 'الاقتصاد الكلي' },
  aid_flows: { en: 'Aid Flows', ar: 'تدفقات المساعدات' },
  energy: { en: 'Energy', ar: 'الطاقة' },
  infrastructure: { en: 'Infrastructure', ar: 'البنية التحتية' },
  environment: { en: 'Environment', ar: 'البيئة' }
};

// License flag labels
const LICENSE_LABELS: Record<string, { en: string; ar: string; color: string }> = {
  open: { en: 'Open Access', ar: 'وصول مفتوح', color: 'bg-green-100 text-green-800' },
  restricted_metadata_only: { en: 'Metadata Only', ar: 'بيانات وصفية فقط', color: 'bg-yellow-100 text-yellow-800' },
  unknown_requires_review: { en: 'Under Review', ar: 'قيد المراجعة', color: 'bg-gray-100 text-gray-800' }
};

export default function DocumentDetail() {
  const { docId } = useParams();
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch document
  const { data: document, isLoading: docLoading } = trpc.library.getDocument.useQuery(
    { docId: docId || '' },
    { enabled: !!docId }
  );

  // Fetch versions
  const { data: versions } = trpc.library.getDocumentVersions.useQuery(
    { documentId: document?.id || 0 },
    { enabled: !!document?.id }
  );

  // Fetch anchors for current version
  const { data: anchors } = trpc.library.getAnchorsForVersion.useQuery(
    { versionId: document?.currentVersionId || 0 },
    { enabled: !!document?.currentVersionId }
  );

  // Fetch tables for current version
  const { data: tables } = trpc.library.getTablesForVersion.useQuery(
    { versionId: document?.currentVersionId || 0 },
    { enabled: !!document?.currentVersionId }
  );

  if (docLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="container mx-auto max-w-5xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="container mx-auto max-w-5xl text-center py-16">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'ar' ? 'الوثيقة غير موجودة' : 'Document Not Found'}
          </h1>
          <p className="text-gray-500 mb-6">
            {language === 'ar'
              ? 'لم يتم العثور على الوثيقة المطلوبة'
              : 'The requested document could not be found'}
          </p>
          <Link href="/research">
            <Button>
              {isRTL ? <ArrowRight className="h-4 w-4 ml-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
              {language === 'ar' ? 'العودة إلى مركز الأبحاث' : 'Back to Research Hub'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = language === 'ar' && document.titleAr ? document.titleAr : document.titleEn;
  const summary = language === 'ar' && document.summaryAr ? document.summaryAr : document.summaryEn;
  const docTypeLabel = DOC_TYPE_LABELS[document.docType] || DOC_TYPE_LABELS.other;
  const licenseLabel = LICENSE_LABELS[document.licenseFlag] || LICENSE_LABELS.unknown_requires_review;

  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-5xl px-4 py-6">
          {/* Back Link */}
          <Link href="/research">
            <Button variant="ghost" size="sm" className="mb-4">
              {isRTL ? <ArrowRight className="h-4 w-4 ml-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
              {language === 'ar' ? 'العودة إلى مركز الأبحاث' : 'Back to Research Hub'}
            </Button>
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">
              {language === 'ar' ? docTypeLabel.ar : docTypeLabel.en}
            </Badge>
            <Badge className={licenseLabel.color}>
              <Shield className="h-3 w-3 mr-1" />
              {language === 'ar' ? licenseLabel.ar : licenseLabel.en}
            </Badge>
            {document.languageOriginal && (
              <Badge variant="outline">
                <Languages className="h-3 w-3 mr-1" />
                {document.languageOriginal === 'en' ? 'English' : 
                 document.languageOriginal === 'ar' ? 'العربية' :
                 document.languageOriginal === 'both' ? 'EN/AR' : 'Other'}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {document.publisherName}
            </span>
            {document.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(document.publishedAt).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              {document.docId}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {document.canonicalUrl && (
              <Button onClick={() => window.open(document.canonicalUrl, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'فتح المصدر الأصلي' : 'Open Original Source'}
              </Button>
            )}
            {versions && versions[0]?.s3OriginalUrl && (
              <Button variant="outline" onClick={() => window.open(versions[0].s3OriginalUrl, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">
              <BookOpen className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="citations">
              <Quote className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الاقتباسات' : 'Citations'}
              {anchors && anchors.length > 0 && (
                <Badge variant="secondary" className="ml-2">{anchors.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tables">
              <Table className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الجداول' : 'Tables'}
              {tables && tables.length > 0 && (
                <Badge variant="secondary" className="ml-2">{tables.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="versions">
              <Clock className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الإصدارات' : 'Versions'}
            </TabsTrigger>
            <TabsTrigger value="related">
              <Network className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'ذات صلة' : 'Related'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6">
              {/* Summary */}
              {summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'ar' ? 'الملخص' : 'Summary'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {summary}
                    </p>
                    {document.summaryIsAiGenerated && (
                      <p className="text-xs text-gray-400 mt-4">
                        {language === 'ar' ? 'تم إنشاء هذا الملخص بواسطة الذكاء الاصطناعي' : 'This summary was AI-generated'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Sectors */}
              {document.sectors && document.sectors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'ar' ? 'القطاعات' : 'Sectors'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {document.sectors.map((sector: string) => {
                        const sectorLabel = SECTOR_LABELS[sector];
                        return (
                          <Link key={sector} href={`/sectors/${sector}`}>
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                              {sectorLabel ? (language === 'ar' ? sectorLabel.ar : sectorLabel.en) : sector}
                            </Badge>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Geographies */}
              {document.geographies && document.geographies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Globe className="h-5 w-5 inline mr-2" />
                      {language === 'ar' ? 'المناطق الجغرافية' : 'Geographies'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {document.geographies.map((geo: string) => (
                        <Badge key={geo} variant="secondary">
                          {geo}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'ar' ? 'البيانات الوصفية' : 'Metadata'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-500">{language === 'ar' ? 'معرف الوثيقة' : 'Document ID'}</dt>
                      <dd className="font-mono">{document.docId}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">{language === 'ar' ? 'تاريخ الاسترجاع' : 'Retrieved Date'}</dt>
                      <dd>{new Date(document.retrievedAt).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">{language === 'ar' ? 'درجة الأهمية' : 'Importance Score'}</dt>
                      <dd>{document.importanceScore}/100</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">{language === 'ar' ? 'علامة النظام' : 'Regime Tag'}</dt>
                      <dd>{document.regimeTagApplicability || 'N/A'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Citations Tab */}
          <TabsContent value="citations">
            {anchors && anchors.length > 0 ? (
              <div className="space-y-4">
                {anchors.map((anchor: any) => (
                  <Card key={anchor.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{anchor.anchorType}</Badge>
                        {anchor.pageNumber && (
                          <span className="text-sm text-gray-500">
                            {language === 'ar' ? `صفحة ${anchor.pageNumber}` : `Page ${anchor.pageNumber}`}
                          </span>
                        )}
                      </div>
                      <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 text-gray-700 italic">
                        "{anchor.snippetText}"
                      </blockquote>
                      {anchor.snippetTextAr && language === 'ar' && (
                        <blockquote className="border-r-4 border-emerald-500 pr-4 py-2 text-gray-700 italic mt-2 text-right">
                          "{anchor.snippetTextAr}"
                        </blockquote>
                      )}
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Badge variant="secondary" className="text-xs">
                          {anchor.confidence} confidence
                        </Badge>
                        <span className="font-mono">{anchor.anchorId}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Quote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'ar'
                    ? 'لا توجد اقتباسات مستخرجة من هذه الوثيقة بعد'
                    : 'No citation anchors extracted from this document yet'}
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Tables Tab */}
          <TabsContent value="tables">
            {tables && tables.length > 0 ? (
              <div className="space-y-4">
                {tables.map((table: any) => (
                  <Card key={table.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">
                          {language === 'ar' && table.titleAr ? table.titleAr : table.titleEn || `Table ${table.tableIndex + 1}`}
                        </h4>
                        {table.pageNumber && (
                          <span className="text-sm text-gray-500">
                            {language === 'ar' ? `صفحة ${table.pageNumber}` : `Page ${table.pageNumber}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        {table.rowCount && (
                          <span>{table.rowCount} rows</span>
                        )}
                        {table.columnCount && (
                          <span>{table.columnCount} columns</span>
                        )}
                        <Badge variant="outline">{table.extractionMethod}</Badge>
                        <Badge variant={table.extractionQuality === 'high' ? 'default' : 'secondary'}>
                          {table.extractionQuality}
                        </Badge>
                      </div>
                      {table.s3TableCsvKey && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          {language === 'ar' ? 'تحميل CSV' : 'Download CSV'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'ar'
                    ? 'لا توجد جداول مستخرجة من هذه الوثيقة بعد'
                    : 'No tables extracted from this document yet'}
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Versions Tab */}
          <TabsContent value="versions">
            {versions && versions.length > 0 ? (
              <div className="space-y-4">
                {versions.map((version: any) => (
                  <Card key={version.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {language === 'ar' ? `الإصدار ${version.versionNumber}` : `Version ${version.versionNumber}`}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(version.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={version.extractionStatus === 'ok' ? 'default' : 'secondary'}>
                            {version.extractionStatus}
                          </Badge>
                          {version.s3OriginalUrl && (
                            <Button variant="outline" size="sm" onClick={() => window.open(version.s3OriginalUrl, '_blank')}>
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {version.mimeType && (
                        <p className="text-xs text-gray-400 mt-2">
                          {version.mimeType} • {version.pageCount ? `${version.pageCount} pages` : ''} • {version.fileSize ? `${Math.round(version.fileSize / 1024)} KB` : ''}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'ar'
                    ? 'لا توجد إصدارات متاحة'
                    : 'No versions available'}
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Related Tab */}
          <TabsContent value="related">
            {document?.id && (
              <RelatedInsightsPanel
                sourceType="document"
                sourceId={document.id}
                sourceLabel={title}
                showDocuments={true}
                showEntities={true}
                showDatasets={true}
                showEvents={true}
                showContradictions={true}
                maxItems={10}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
