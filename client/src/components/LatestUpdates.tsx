/**
 * Latest Updates Component for Homepage
 * 
 * Displays the most recent evidence-backed updates
 */

import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Newspaper, 
  Calendar, 
  Building2, 
  ChevronRight,
  Shield,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

interface LatestUpdatesProps {
  limit?: number;
  showHeader?: boolean;
}

export function LatestUpdates({ limit = 6, showHeader = true }: LatestUpdatesProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const { data, isLoading } = trpc.updates.getPublished.useQuery({
    limit,
    offset: 0,
  });
  
  const updates = data?.updates || [];
  
  const getConfidenceBadge = (grade: string) => {
    const colors: Record<string, string> = {
      "A": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      "B": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      "C": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      "D": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[grade] || colors["C"];
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        {showHeader && (
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (updates.length === 0) {
    return (
      <div className="text-center py-12">
        <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {isAr ? "لا توجد تحديثات حالياً" : "No Updates Available"}
        </h3>
        <p className="text-muted-foreground">
          {isAr 
            ? "سيتم عرض التحديثات الجديدة هنا"
            : "New updates will appear here"
          }
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Newspaper className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">
              {isAr ? "آخر التحديثات" : "Latest Updates"}
            </h2>
          </div>
          <Link href="/updates">
            <Button variant="outline" className="group">
              {isAr ? "عرض الكل" : "View All"}
              {isAr ? (
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {updates.map((update) => (
          <Link key={update.id} href={`/updates/${update.id}`}>
            <Card className="h-full hover:shadow-lg transition-all cursor-pointer group border-transparent hover:border-blue-200 dark:hover:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {update.updateType?.replace(/_/g, " ") || "Update"}
                  </Badge>
                  <Badge className={`${getConfidenceBadge(update.confidenceGrade || "C")} text-xs`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {update.confidenceGrade}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {isAr ? update.titleAr : update.titleEn}
                </h3>
                
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                  {isAr ? update.summaryAr : update.summaryEn}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{update.sourcePublisher}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {update.publishedAt 
                        ? new Date(update.publishedAt).toLocaleDateString(isAr ? "ar-YE" : "en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "—"
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
