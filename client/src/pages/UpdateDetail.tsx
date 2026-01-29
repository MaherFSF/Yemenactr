/**
 * Update Detail Page - Single update with full evidence
 */

import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  ArrowRight,
  Calendar, 
  Building2, 
  ExternalLink, 
  Shield,
  FileText,
  Link as LinkIcon,
  Quote,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

export default function UpdateDetail() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const { data: update, isLoading } = trpc.updates.getById.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id }
  );
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  if (!update) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {isAr ? "التحديث غير موجود" : "Update Not Found"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isAr 
              ? "قد يكون هذا التحديث قد تم حذفه أو غير متاح"
              : "This update may have been removed or is not available"
            }
          </p>
          <Link href="/updates">
            <Button>
              {isAr ? "العودة للتحديثات" : "Back to Updates"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const getConfidenceBadge = (grade: string) => {
    const colors: Record<string, string> = {
      "A": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      "B": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      "C": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      "D": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[grade] || colors["C"];
  };
  
  const citations = update.evidenceBundle?.citations as any[] || [];
  
  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 ${isAr ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/updates">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              {isAr ? (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  العودة للتحديثات
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Updates
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-4xl -mt-8">
        {/* Main Content Card */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className={getConfidenceBadge(update.confidenceGrade || "C")}>
                <Shield className="h-3 w-3 mr-1" />
                {isAr ? `درجة الثقة ${update.confidenceGrade}` : `Confidence Grade ${update.confidenceGrade}`}
              </Badge>
              <Badge variant="outline">
                {update.updateType?.replace(/_/g, " ") || "Update"}
              </Badge>
              {(update.sectors as string[] || []).map((sector) => (
                <Badge key={sector} variant="secondary">
                  {sector.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
            
            <CardTitle className="text-2xl md:text-3xl leading-tight">
              {isAr ? update.titleAr : update.titleEn}
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{update.sourcePublisher}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {update.publishedAt 
                    ? new Date(update.publishedAt).toLocaleDateString(isAr ? "ar-YE" : "en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"
                  }
                </span>
              </div>
              {update.sourceUrl && (
                <a 
                  href={update.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  {isAr ? "المصدر الأصلي" : "Original Source"}
                </a>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Summary */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Quote className="h-4 w-4" />
                {isAr ? "الملخص" : "Summary"}
              </h3>
              <p className="text-lg leading-relaxed">
                {isAr ? update.summaryAr : update.summaryEn}
              </p>
            </div>
            
            {/* Full Body */}
            {(update.bodyEn || update.bodyAr) && (
              <div className="prose dark:prose-invert max-w-none mb-8">
                <h3 className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {isAr ? "التفاصيل الكاملة" : "Full Details"}
                </h3>
                <div className="whitespace-pre-wrap">
                  {isAr ? update.bodyAr : update.bodyEn}
                </div>
              </div>
            )}
            
            {/* Confidence Explanation */}
            {update.confidenceReason && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <Info className="h-4 w-4" />
                  {isAr ? "سبب درجة الثقة" : "Confidence Explanation"}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {update.confidenceReason}
                </p>
              </div>
            )}
            
            {/* Related Entities */}
            {(update.entities as string[] || []).length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">
                  {isAr ? "الجهات المذكورة" : "Mentioned Entities"}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(update.entities as string[]).map((entity) => (
                    <Badge key={entity} variant="outline" className="text-sm">
                      {entity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Evidence Bundle Card */}
        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              {isAr ? "حزمة الأدلة" : "Evidence Bundle"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {citations.length > 0 ? (
              <div className="space-y-4">
                {citations.map((citation, index) => (
                  <div 
                    key={index}
                    className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm mb-2">{citation.text}</p>
                        {citation.sourceUrl && (
                          <a 
                            href={citation.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <LinkIcon className="h-3 w-3" />
                            {citation.sourceUrl}
                          </a>
                        )}
                        {citation.anchor && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({citation.anchor})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{isAr ? "لا توجد استشهادات إضافية" : "No additional citations available"}</p>
              </div>
            )}
            
            {/* What Changed */}
            {update.evidenceBundle?.whatChanged && (update.evidenceBundle.whatChanged as any[]).length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">
                  {isAr ? "ما الذي تغير" : "What Changed"}
                </h4>
                <ul className="space-y-2">
                  {(update.evidenceBundle.whatChanged as any[]).map((change, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600">•</span>
                      <span>{typeof change === "string" ? change : JSON.stringify(change)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Navigation */}
        <div className="flex justify-center pb-12">
          <Link href="/updates">
            <Button variant="outline" size="lg">
              {isAr ? (
                <>
                  العودة لجميع التحديثات
                  <ArrowLeft className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All Updates
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
