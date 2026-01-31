/**
 * YETO Platform - Provenance Viewer Component
 * Section 8A: Visual display of data provenance information
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfidenceRating } from './ConfidenceRating';

interface TransformationStep {
  order: number;
  type: string;
  description: string;
  formula?: string;
  inputFields: string[];
  outputFields: string[];
  timestamp: string;
  executedBy: string;
}

interface QACheck {
  checkType: string;
  checkName: string;
  passed: boolean;
  severity: string;
  message: string;
  timestamp: string;
}

interface ProvenanceData {
  id: number;
  sourceId: number;
  accessMethod: string;
  retrievalTime: Date;
  rawDataHash: string;
  licenseType: string;
  licenseUrl?: string;
  termsAccepted: boolean;
  attributionRequired: boolean;
  attributionText?: string;
  commercialUseAllowed: boolean;
  derivativesAllowed: boolean;
  transformations: TransformationStep[];
  qaChecks: QACheck[];
  qaScore: number;
  limitations: string[];
  caveats: string[];
  knownIssues: string[];
  expectedUpdateFrequency: string;
  lastUpdated: Date;
  version: number;
}

interface ProvenanceViewerProps {
  provenance: ProvenanceData;
  sourceName?: string;
  language?: 'en' | 'ar';
  compact?: boolean;
  className?: string;
}

export function ProvenanceViewer({
  provenance,
  sourceName = 'Unknown Source',
  language = 'en',
  compact = false,
  className,
}: ProvenanceViewerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const qaRating = provenance.qaScore >= 85 ? 'A' 
    : provenance.qaScore >= 70 ? 'B' 
    : provenance.qaScore >= 50 ? 'C' 
    : 'D';
  
  if (compact) {
    return (
      <div className={cn('flex items-center gap-3 p-3 bg-gray-50 rounded-lg', className)}>
        <ConfidenceRating rating={qaRating as 'A' | 'B' | 'C' | 'D'} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{sourceName}</p>
          <p className="text-xs text-gray-500">
            {language === 'ar' ? 'آخر تحديث: ' : 'Last updated: '}
            {new Date(provenance.lastUpdated).toLocaleDateString()}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          v{provenance.version}
        </Badge>
      </div>
    );
  }
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {language === 'ar' ? 'مصدر البيانات' : 'Data Provenance'}
          </CardTitle>
          <ConfidenceRating rating={qaRating as 'A' | 'B' | 'C' | 'D'} size="md" showLabel language={language} />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              {language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="transformations">
              {language === 'ar' ? 'التحويلات' : 'Transforms'}
            </TabsTrigger>
            <TabsTrigger value="quality">
              {language === 'ar' ? 'الجودة' : 'Quality'}
            </TabsTrigger>
            <TabsTrigger value="license">
              {language === 'ar' ? 'الترخيص' : 'License'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                label={language === 'ar' ? 'المصدر' : 'Source'}
                value={sourceName}
              />
              <InfoItem
                label={language === 'ar' ? 'طريقة الوصول' : 'Access Method'}
                value={provenance.accessMethod}
              />
              <InfoItem
                label={language === 'ar' ? 'وقت الاسترجاع' : 'Retrieval Time'}
                value={new Date(provenance.retrievalTime).toLocaleString()}
              />
              <InfoItem
                label={language === 'ar' ? 'تكرار التحديث' : 'Update Frequency'}
                value={provenance.expectedUpdateFrequency}
              />
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 font-mono">
                {language === 'ar' ? 'تجزئة البيانات: ' : 'Data Hash: '}
                {provenance.rawDataHash}
              </p>
            </div>
            
            {provenance.limitations.length > 0 && (
              <div className="pt-4">
                <h4 className="text-sm font-medium text-amber-700 mb-2">
                  {language === 'ar' ? 'القيود المعروفة' : 'Known Limitations'}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {provenance.limitations.map((limitation, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="transformations" className="mt-4">
            {provenance.transformations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {language === 'ar' ? 'لم يتم تطبيق أي تحويلات' : 'No transformations applied'}
              </p>
            ) : (
              <div className="space-y-3">
                {provenance.transformations.map((transform, i) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {transform.order}
                      </span>
                      <span className="font-medium text-sm capitalize">
                        {transform.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {transform.description}
                    </p>
                    {transform.formula && (
                      <code className="block text-xs bg-gray-100 p-2 rounded font-mono">
                        {transform.formula}
                      </code>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {transform.executedBy} • {new Date(transform.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="quality" className="mt-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {language === 'ar' ? 'درجة الجودة' : 'Quality Score'}
                </span>
                <span className="text-2xl font-bold" style={{ color: getScoreColor(provenance.qaScore) }}>
                  {provenance.qaScore}/100
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${provenance.qaScore}%`,
                    backgroundColor: getScoreColor(provenance.qaScore),
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              {provenance.qaChecks.map((check, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg text-sm',
                    check.passed ? 'bg-green-50' : 'bg-red-50'
                  )}
                >
                  <span className={check.passed ? 'text-green-600' : 'text-red-600'}>
                    {check.passed ? '✓' : '✗'}
                  </span>
                  <span className="flex-1">{check.checkName}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      check.severity === 'critical' && 'border-red-300 text-red-700',
                      check.severity === 'warning' && 'border-amber-300 text-amber-700',
                      check.severity === 'info' && 'border-blue-300 text-blue-700'
                    )}
                  >
                    {check.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="license" className="mt-4 space-y-4">
            <InfoItem
              label={language === 'ar' ? 'نوع الترخيص' : 'License Type'}
              value={provenance.licenseType}
            />
            
            {provenance.licenseUrl && (
              <a
                href={provenance.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {language === 'ar' ? 'عرض الترخيص الكامل' : 'View full license'}
              </a>
            )}
            
            <div className="grid grid-cols-2 gap-3 pt-4">
              <LicenseFlag
                label={language === 'ar' ? 'الإسناد مطلوب' : 'Attribution Required'}
                value={provenance.attributionRequired}
              />
              <LicenseFlag
                label={language === 'ar' ? 'الاستخدام التجاري' : 'Commercial Use'}
                value={provenance.commercialUseAllowed}
              />
              <LicenseFlag
                label={language === 'ar' ? 'المشتقات مسموحة' : 'Derivatives Allowed'}
                value={provenance.derivativesAllowed}
              />
              <LicenseFlag
                label={language === 'ar' ? 'الشروط مقبولة' : 'Terms Accepted'}
                value={provenance.termsAccepted}
              />
            </div>
            
            {provenance.attributionRequired && provenance.attributionText && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 font-medium mb-1">
                  {language === 'ar' ? 'نص الإسناد المطلوب:' : 'Required Attribution:'}
                </p>
                <p className="text-sm text-blue-900">{provenance.attributionText}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper components
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function LicenseFlag({ label, value }: { label: string; value: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-2 p-2 rounded-lg text-sm',
      value ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
    )}>
      <span>{value ? '✓' : '✗'}</span>
      <span>{label}</span>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#2e6b4f';
  if (score >= 70) return '#1a6b9c';
  if (score >= 50) return '#C0A030';
  return '#c53030';
}

export default ProvenanceViewer;
