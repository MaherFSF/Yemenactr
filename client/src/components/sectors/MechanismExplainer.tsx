/**
 * MechanismExplainer - How things work in this sector
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface MechanismExplainerProps {
  mechanisms: any[];
  isArabic: boolean;
  sectorCode: string;
}

export function MechanismExplainer({ mechanisms, isArabic, sectorCode }: MechanismExplainerProps) {
  if (!mechanisms || mechanisms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {isArabic ? 'كيف يعمل' : 'How It Works'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{isArabic ? 'لم تتم إضافة شروحات الآليات بعد' : 'Mechanism explainers not yet added'}</p>
            <p className="text-sm mt-2">
              {isArabic 
                ? 'سيتم إضافة شروحات مفصلة حول كيفية عمل هذا القطاع قريباً'
                : 'Detailed explanations of how this sector works will be added soon'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {isArabic ? 'كيف يعمل' : 'How It Works'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {mechanisms.map((mechanism: any, index: number) => (
            <AccordionItem key={index} value={`mechanism-${index}`}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <span>{isArabic ? mechanism.headingAr : mechanism.headingEn}</span>
                  {mechanism.contentType === 'evidence_backed' && (
                    <Badge variant="secondary" className="text-xs">
                      {isArabic ? 'مدعوم بالأدلة' : 'Evidence-backed'}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {isArabic ? mechanism.contentAr : mechanism.contentEn}
                  </p>
                  
                  {/* Citations */}
                  {mechanism.citations && mechanism.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {isArabic ? 'المصادر' : 'Sources'}
                      </h5>
                      <ul className="space-y-1">
                        {mechanism.citations.map((citation: any, citIndex: number) => (
                          <li key={citIndex} className="text-xs text-muted-foreground flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {citation.quote || `Source ${citation.sourceId}`}
                            {citation.pageRef && ` (p. ${citation.pageRef})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default MechanismExplainer;
