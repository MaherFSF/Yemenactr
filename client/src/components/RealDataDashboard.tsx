/**
 * YETO Platform - Real Data Dashboard Component
 * Yemen Economic Transparency Observatory
 * 
 * Displays live data from external sources with evidence packs
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useKeyIndicators, 
  useReliefWebReports, 
  useDataSourceStatus,
  formatIndicatorValue,
  getConfidenceColor,
  getConfidenceLabel,
} from '@/hooks/useRealData';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ExternalLink, 
  Database, 
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================
// Key Indicators Section
// ============================================

function KeyIndicatorsSection() {
  const { data, isLoading, error, refetch, isFetching } = useKeyIndicators();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{t('errors.failedToLoad')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {t('dashboard.lastUpdated')}: {data?.retrievedAt ? new Date(data.retrievedAt).toLocaleString() : 'N/A'}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isFetching ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.indicators.map((indicator) => (
          <Card key={indicator.code} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {indicator.name}
                </CardTitle>
                <Badge className={getConfidenceColor(indicator.confidence)}>
                  {indicator.confidence}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {formatIndicatorValue(indicator.value, indicator.unit)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{indicator.date}</span>
                <span>{indicator.source}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// ReliefWeb Reports Section
// ============================================

function ReliefWebReportsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useReliefWebReports(searchQuery || undefined, 10);
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            <span>{data?.error || t('errors.failedToLoad')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>{data.total} {t('research.reportsFound')}</span>
      </div>
      
      <div className="space-y-3">
        {data.data.map((report: any) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium line-clamp-2">{report.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <span>{report.source}</span>
                    <span>•</span>
                    <span>{report.date ? new Date(report.date).toLocaleDateString() : 'N/A'}</span>
                    {report.format && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">{report.format}</Badge>
                      </>
                    )}
                  </div>
                  {report.theme?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {report.theme.slice(0, 3).map((theme: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {report.url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={report.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Data Source Status Section
// ============================================

function DataSourceStatusSection() {
  const { data, isLoading, error } = useDataSourceStatus();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{t('errors.failedToLoad')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {data?.map((source: any) => (
        <div 
          key={source.id} 
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Database className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">{source.name}</p>
              <p className="text-xs text-muted-foreground">
                {source.cadence} • {source.type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {source.requiresKey && (
              <Badge variant="outline" className="text-xs">
                {t('admin.requiresKey')}
              </Badge>
            )}
            <Badge 
              variant={source.status === 'active' ? 'default' : source.status === 'blocked' ? 'destructive' : 'secondary'}
              className="capitalize"
            >
              {source.status === 'active' && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {source.status === 'blocked' && <AlertCircle className="h-3 w-3 mr-1" />}
              {source.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function RealDataDashboard() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {t('dashboard.liveData')}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {t('dashboard.realTimeFromSources')}
        </span>
      </div>

      <Tabs defaultValue="indicators" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="indicators">{t('dashboard.keyIndicators')}</TabsTrigger>
          <TabsTrigger value="reports">{t('dashboard.latestReports')}</TabsTrigger>
          <TabsTrigger value="sources">{t('dashboard.dataSources')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="indicators" className="mt-4">
          <KeyIndicatorsSection />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-4">
          <ReliefWebReportsSection />
        </TabsContent>
        
        <TabsContent value="sources" className="mt-4">
          <DataSourceStatusSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RealDataDashboard;
