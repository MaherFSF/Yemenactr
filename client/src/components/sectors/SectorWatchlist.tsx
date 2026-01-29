/**
 * SectorWatchlist - Things to watch in this sector
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, FileText, Building2, Briefcase, AlertCircle } from "lucide-react";

interface SectorWatchlistProps {
  watchlist: any[];
  driversAndLinks: {
    relatedEvents: any[];
    relatedEntities: any[];
    relatedProjects: any[];
    relatedDocuments: any[];
  };
  isArabic: boolean;
}

export function SectorWatchlist({ watchlist, driversAndLinks, isArabic }: SectorWatchlistProps) {
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'indicator': return <AlertCircle className="h-4 w-4" />;
      case 'entity': return <Building2 className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'project': return <Briefcase className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Watchlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            {isArabic ? 'قائمة المراقبة' : 'Watchlist'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {watchlist && watchlist.length > 0 ? (
            <div className="space-y-3">
              {watchlist.map((item: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-muted-foreground">
                        {getItemIcon(item.itemType)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {isArabic ? item.titleAr : item.titleEn}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isArabic ? item.reasonAr : item.reasonEn}
                        </p>
                      </div>
                    </div>
                    <Badge className={getImportanceColor(item.importance)}>
                      {item.importance}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isArabic ? 'لا توجد عناصر في قائمة المراقبة' : 'No watchlist items'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Events */}
      {driversAndLinks.relatedEvents && driversAndLinks.relatedEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              {isArabic ? 'الأحداث ذات الصلة' : 'Related Events'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {driversAndLinks.relatedEvents.slice(0, 5).map((event: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {isArabic ? event.titleAr : event.titleEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString(isArabic ? 'ar' : 'en')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Documents */}
      {driversAndLinks.relatedDocuments && driversAndLinks.relatedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              {isArabic ? 'الوثائق ذات الصلة' : 'Related Documents'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {driversAndLinks.relatedDocuments.slice(0, 5).map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {isArabic ? doc.titleAr : doc.titleEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.sourceName} • {new Date(doc.publishDate).toLocaleDateString(isArabic ? 'ar' : 'en')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {doc.documentType}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SectorWatchlist;
