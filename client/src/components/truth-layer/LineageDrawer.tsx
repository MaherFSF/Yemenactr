/**
 * LineageDrawer Component
 * 
 * Shows the full computation lineage and evidence chain for a claim.
 * Opens as a side drawer to display how a value was derived.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProvenanceBadge, type ConfidenceGrade } from './ProvenanceBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { 
  FileText, 
  Database, 
  Calculator, 
  ArrowRight, 
  ExternalLink,
  Calendar,
  Building2,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Link2,
  Download
} from 'lucide-react';

export interface LineageStep {
  /** Step number */
  step: number;
  /** Operation performed */
  operation: string;
  /** Operation in Arabic */
  operationAr?: string;
  /** Input description */
  input: string;
  /** Input in Arabic */
  inputAr?: string;
  /** Output description */
  output: string;
  /** Output in Arabic */
  outputAr?: string;
  /** Source reference */
  sourceRef?: string;
}

export interface LineageDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Claim ID for fetching full details */
  claimId?: string;
  /** The value being explained */
  value: number | string;
  /** Unit of measurement */
  unit?: string;
  /** Confidence grade */
  confidenceGrade: ConfidenceGrade;
  /** Source name */
  sourceName?: string;
  /** Source name in Arabic */
  sourceNameAr?: string;
  /** As-of date */
  asOfDate?: Date | string;
  /** Pre-loaded lineage steps */
  lineage?: LineageStep[];
  /** Regime tag */
  regimeTag?: 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'unknown';
  /** Whether disputed */
  isDisputed?: boolean;
}

export function LineageDrawer({
  open,
  onOpenChange,
  claimId,
  value,
  unit,
  confidenceGrade,
  sourceName,
  sourceNameAr,
  asOfDate,
  lineage,
  regimeTag,
  isDisputed,
}: LineageDrawerProps) {
  const { language, isRTL } = useLanguage();

  // Fetch claim details if claimId provided
  const { data: claimData, isLoading } = trpc.truthLayer.getClaim.useQuery(
    { claimId: claimId! },
    { enabled: !!claimId && open }
  );

  // Fetch evidence for claim
  const { data: evidenceData } = trpc.truthLayer.getClaimEvidence.useQuery(
    { claimId: claimId! },
    { enabled: !!claimId && open }
  );

  // Format date
  const formattedDate = React.useMemo(() => {
    if (!asOfDate) return null;
    const date = typeof asOfDate === 'string' ? new Date(asOfDate) : asOfDate;
    return new Intl.DateTimeFormat(
      language === 'ar' ? 'ar-YE' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    ).format(date);
  }, [asOfDate, language]);

  // Regime labels
  const regimeLabels = {
    aden_irg: { en: 'Aden (IRG)', ar: 'عدن (الحكومة الشرعية)' },
    sanaa_defacto: { en: "Sana'a (De Facto)", ar: 'صنعاء (سلطة الأمر الواقع)' },
    mixed: { en: 'Mixed/National', ar: 'مختلط/وطني' },
    unknown: { en: 'Unknown', ar: 'غير محدد' },
  };

  // Use lineage from props or from fetched claim data
  const displayLineage = lineage || (claimData as any)?.computationLineage?.steps || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isRTL ? 'left' : 'right'} 
        className="w-full sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            {language === 'ar' ? 'سلسلة الحساب' : 'Computation Lineage'}
          </SheetTitle>
          <SheetDescription>
            {language === 'ar' 
              ? 'كيف تم حساب هذه القيمة ومصادر البيانات المستخدمة'
              : 'How this value was computed and the data sources used'
            }
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
          <div className="space-y-6">
            {/* Value Summary Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{language === 'ar' ? 'القيمة' : 'Value'}</span>
                  <ProvenanceBadge grade={confidenceGrade} size="md" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold font-mono">
                  {typeof value === 'number' 
                    ? new Intl.NumberFormat(language === 'ar' ? 'ar-YE' : 'en-US').format(value)
                    : value
                  }
                  {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
                </div>

                {isDisputed && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-md">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {language === 'ar' ? 'قيمة متنازع عليها - يوجد مصادر متعارضة' : 'Disputed value - conflicting sources exist'}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {sourceName && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{language === 'ar' && sourceNameAr ? sourceNameAr : sourceName}</span>
                    </div>
                  )}
                  {formattedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  {regimeTag && regimeTag !== 'unknown' && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{regimeLabels[regimeTag][language]}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Computation Steps */}
            {displayLineage.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  {language === 'ar' ? 'خطوات الحساب' : 'Computation Steps'}
                </h3>
                <div className="space-y-2">
                  {displayLineage.map((step: LineageStep, index: number) => (
                    <div 
                      key={index}
                      className="relative pl-6 pb-4 border-l-2 border-muted last:border-l-0 last:pb-0"
                    >
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {step.step || index + 1}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <div className="font-medium text-sm">
                          {language === 'ar' && step.operationAr ? step.operationAr : step.operation}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">
                            {language === 'ar' ? 'المدخل: ' : 'Input: '}
                          </span>
                          {language === 'ar' && step.inputAr ? step.inputAr : step.input}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium text-primary">
                            {language === 'ar' ? 'المخرج: ' : 'Output: '}
                          </span>
                          {language === 'ar' && step.outputAr ? step.outputAr : step.output}
                        </div>
                        {step.sourceRef && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Link2 className="h-3 w-3" />
                            {step.sourceRef}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Chain */}
            {evidenceData && (evidenceData as any[]).length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {language === 'ar' ? 'سلسلة الأدلة' : 'Evidence Chain'}
                </h3>
                <div className="space-y-2">
                  {(evidenceData as any[]).map((evidence: any, index: number) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'p-2 rounded-md',
                          evidence.isPrimary ? 'bg-primary/10' : 'bg-muted'
                        )}>
                          {evidence.evidenceType === 'document' && <FileText className="h-4 w-4" />}
                          {evidence.evidenceType === 'dataset' && <Database className="h-4 w-4" />}
                          {evidence.evidenceType === 'excerpt' && <FileText className="h-4 w-4" />}
                          {evidence.evidenceType === 'observation' && <Database className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {evidence.data?.title || evidence.data?.documentTitle || `Evidence #${evidence.evidenceId}`}
                            </span>
                            {evidence.isPrimary && (
                              <Badge variant="outline" className="text-xs">
                                {language === 'ar' ? 'أساسي' : 'Primary'}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {evidence.data?.sourceName || evidence.evidenceType}
                          </div>
                          {evidence.data?.sourceUrl && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              asChild
                            >
                              <a href={evidence.data.sourceUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {language === 'ar' ? 'عرض المصدر' : 'View Source'}
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence Breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <ProvenanceBadge grade={confidenceGrade} size="sm" showLabel={false} />
                {language === 'ar' ? 'تفاصيل درجة الثقة' : 'Confidence Score Details'}
              </h3>
              <Card className="p-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'موثوقية المصدر' : 'Source Reliability'}
                    </span>
                    <span className="font-medium">
                      {confidenceGrade === 'A' ? '95%' : confidenceGrade === 'B' ? '80%' : confidenceGrade === 'C' ? '60%' : '40%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'حداثة البيانات' : 'Data Recency'}
                    </span>
                    <span className="font-medium">
                      {confidenceGrade === 'A' ? '90%' : confidenceGrade === 'B' ? '75%' : confidenceGrade === 'C' ? '55%' : '35%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'وضوح المنهجية' : 'Methodology Clarity'}
                    </span>
                    <span className="font-medium">
                      {confidenceGrade === 'A' ? '85%' : confidenceGrade === 'B' ? '70%' : confidenceGrade === 'C' ? '50%' : '30%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'مستوى التأكيد' : 'Corroboration Level'}
                    </span>
                    <span className="font-medium">
                      {confidenceGrade === 'A' ? '88%' : confidenceGrade === 'B' ? '72%' : confidenceGrade === 'C' ? '48%' : '25%'}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>{language === 'ar' ? 'الدرجة الإجمالية' : 'Overall Score'}</span>
                    <span className={cn(
                      confidenceGrade === 'A' && 'text-emerald-600',
                      confidenceGrade === 'B' && 'text-blue-600',
                      confidenceGrade === 'C' && 'text-amber-600',
                      confidenceGrade === 'D' && 'text-red-600',
                    )}>
                      {language === 'ar' ? `الدرجة ${confidenceGrade}` : `Grade ${confidenceGrade}`}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'تصدير حزمة الأدلة' : 'Export Evidence Pack'}
              </Button>
              {claimId && (
                <Button variant="outline" size="sm" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'عرض المطالبة الكاملة' : 'View Full Claim'}
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default LineageDrawer;
