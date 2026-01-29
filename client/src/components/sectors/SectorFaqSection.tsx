/**
 * SectorFaqSection - FAQ section for sector pages
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, AlertCircle, FileText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SectorFaqSectionProps {
  faqs: any[];
  isArabic: boolean;
}

export function SectorFaqSection({ faqs, isArabic }: SectorFaqSectionProps) {
  if (!faqs || faqs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{isArabic ? 'لم تتم إضافة أسئلة شائعة بعد' : 'No FAQs added yet'}</p>
            <p className="text-sm mt-2">
              {isArabic 
                ? 'سيتم إضافة الأسئلة الشائعة حول هذا القطاع قريباً'
                : 'Frequently asked questions about this sector will be added soon'}
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
          <HelpCircle className="h-5 w-5 text-primary" />
          {isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq: any, index: number) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left">
                <div className="flex items-start gap-2">
                  <span className="font-medium">
                    {isArabic ? faq.questionAr : faq.questionEn}
                  </span>
                  {faq.isRefusalAnswer && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {isArabic ? 'لا يمكن الإجابة' : 'Cannot Answer'}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className={`text-muted-foreground whitespace-pre-wrap ${faq.isRefusalAnswer ? 'italic' : ''}`}>
                    {isArabic ? faq.answerAr : faq.answerEn}
                  </p>
                  
                  {/* Citations */}
                  {faq.citations && faq.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {isArabic ? 'المصادر' : 'Sources'}
                      </h5>
                      <ul className="space-y-1">
                        {faq.citations.map((citation: any, citIndex: number) => (
                          <li key={citIndex} className="text-xs text-muted-foreground">
                            [{citIndex + 1}] Source ID: {citation.sourceId}
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

export default SectorFaqSection;
