/**
 * SectorPageTemplate - Unified template for all sector pages
 * Implements the sector page contract with consistent DNA across all sectors
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  FileText,
  Download,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Eye,
  ArrowLeft,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import EvidencePackButton from "@/components/EvidencePackButton";
import ContradictionBadge from "@/components/ContradictionBadge";
import { SectorKpiCard } from "./SectorKpiCard";
import { SectorChart } from "./SectorChart";
import { MechanismExplainer } from "./MechanismExplainer";
import { SectorWatchlist } from "./SectorWatchlist";
import { SectorFaqSection } from "./SectorFaqSection";
import { RelatedInsightsPanel } from "@/components/RelatedInsights";
import { Network } from "lucide-react";

interface SectorPageTemplateProps {
  sectorCode: string;
}

export function SectorPageTemplate({ sectorCode }: SectorPageTemplateProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [regime, setRegime] = useState<'both' | 'aden_irg' | 'sanaa_dfa'>('both');
  
  // Fetch sector page data from API
  const { data: pageData, isLoading, error, refetch } = trpc.sectorPages.getSectorPageData.useQuery({
    sectorCode,
    regime,
    isVip: false
  });

  if (isLoading) {
    return <SectorPageSkeleton />;
  }

  if (error || !pageData?.success || !pageData?.data) {
    return (
      <div className="container py-12">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {isArabic ? 'خطأ في تحميل القطاع' : 'Error Loading Sector'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {isArabic 
                ? 'لم نتمكن من تحميل بيانات هذا القطاع. يرجى المحاولة مرة أخرى.'
                : 'We could not load data for this sector. Please try again.'}
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {isArabic ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { definition, sectorIn60Seconds, coreTrends, mechanisms, driversAndLinks, contradictions, gaps, watchlist, faqs, coverage, releaseGate } = pageData.data;

  return (
    <div className="flex flex-col" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* A) Sector Hero */}
      <section 
        className="relative h-[350px] overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${definition.heroColor || '#2a3a28'}ee, ${definition.heroColor || '#2e8b6e'}99)`
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container relative h-full flex flex-col justify-center">
          <Link href="/sectors" className="text-white/80 hover:text-white flex items-center gap-1 mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            {isArabic ? 'جميع القطاعات' : 'All Sectors'}
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {isArabic ? definition.nameAr : definition.nameEn}
          </h1>
          
          <p className="text-white/90 text-lg max-w-2xl mb-6">
            {isArabic ? definition.missionAr : definition.missionEn}
          </p>
          
          {/* Status badges */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Clock className="h-3 w-3 mr-1" />
              {isArabic ? 'آخر تحديث:' : 'Last updated:'} {new Date(pageData.data.lastUpdated).toLocaleDateString(isArabic ? 'ar' : 'en')}
            </Badge>
            
            <Badge 
              variant="secondary" 
              className={`border-0 ${coverage.dataCoveragePercent >= 80 ? 'bg-green-500/20 text-green-100' : coverage.dataCoveragePercent >= 50 ? 'bg-yellow-500/20 text-yellow-100' : 'bg-red-500/20 text-red-100'}`}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {isArabic ? 'التغطية:' : 'Coverage:'} {coverage.dataCoveragePercent.toFixed(0)}%
            </Badge>
            
            {definition.hasRegimeSplit && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Info className="h-3 w-3 mr-1" />
                {isArabic ? 'بيانات منقسمة (عدن/صنعاء)' : 'Split data (Aden/Sana\'a)'}
              </Badge>
            )}
          </div>
          
          {/* Regime toggle if applicable */}
          {definition.hasRegimeSplit && (
            <div className="mt-4 flex gap-2">
              <Button 
                size="sm" 
                variant={regime === 'both' ? 'secondary' : 'ghost'}
                className={regime === 'both' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}
                onClick={() => setRegime('both')}
              >
                {isArabic ? 'كلاهما' : 'Both'}
              </Button>
              <Button 
                size="sm" 
                variant={regime === 'aden_irg' ? 'secondary' : 'ghost'}
                className={regime === 'aden_irg' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}
                onClick={() => setRegime('aden_irg')}
              >
                {isArabic ? 'عدن (IRG)' : 'Aden (IRG)'}
              </Button>
              <Button 
                size="sm" 
                variant={regime === 'sanaa_dfa' ? 'secondary' : 'ghost'}
                className={regime === 'sanaa_dfa' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}
                onClick={() => setRegime('sanaa_dfa')}
              >
                {isArabic ? 'صنعاء (DFA)' : 'Sana\'a (DFA)'}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Main content */}
      <div className="container py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview">
              {isArabic ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="trends">
              {isArabic ? 'الاتجاهات' : 'Trends'}
            </TabsTrigger>
            <TabsTrigger value="mechanism">
              {isArabic ? 'كيف يعمل' : 'How It Works'}
            </TabsTrigger>
            <TabsTrigger value="watchlist">
              {isArabic ? 'المراقبة' : 'Watchlist'}
            </TabsTrigger>
            <TabsTrigger value="faq">
              {isArabic ? 'الأسئلة' : 'FAQ'}
            </TabsTrigger>
            <TabsTrigger value="related">
              <Network className="h-4 w-4 mr-1" />
              {isArabic ? 'ذات صلة' : 'Related'}
            </TabsTrigger>
          </TabsList>

          {/* B) Sector in 60 Seconds */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {isArabic ? 'القطاع في 60 ثانية' : 'Sector in 60 Seconds'}
                </CardTitle>
                <CardDescription>
                  {isArabic ? 'أهم المؤشرات والتغييرات والتنبيهات' : 'Top KPIs, changes, and alerts'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Top 5 KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {sectorIn60Seconds.topKpis.slice(0, 5).map((kpi: any, index: number) => (
                    <SectorKpiCard
                      key={kpi.indicatorCode || index}
                      titleEn={kpi.titleEn}
                      titleAr={kpi.titleAr}
                      value={kpi.value}
                      change={kpi.change}
                      confidence={kpi.confidence}
                      source={kpi.source}
                      lastUpdated={kpi.lastUpdated}
                      isArabic={isArabic}
                    />
                  ))}
                </div>

                {/* Top 3 Changes */}
                {sectorIn60Seconds.topChanges.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {isArabic ? 'أهم التغييرات' : 'Top Changes'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {sectorIn60Seconds.topChanges.map((change: any, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <p className="font-medium text-sm">
                            {isArabic ? change.titleAr : change.titleEn}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {(change.changePercent || 0) > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm font-bold ${(change.changePercent || 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {change.changePercent > 0 ? '+' : ''}{change.changePercent?.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top 3 Alerts */}
                {sectorIn60Seconds.topAlerts.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {isArabic ? 'التنبيهات النشطة' : 'Active Alerts'}
                    </h4>
                    <div className="space-y-2">
                      {sectorIn60Seconds.topAlerts.map((alert: any, index: number) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${
                            alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
                            alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
                            'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          }`}
                        >
                          <p className="font-medium text-sm">
                            {isArabic ? alert.titleAr : alert.titleEn}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isArabic ? alert.descriptionAr : alert.descriptionEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* F) Disagreement & Revisions */}
            {(contradictions.length > 0 || gaps.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    {isArabic ? 'التناقضات والفجوات' : 'Contradictions & Gaps'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contradictions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">
                        {isArabic ? 'تناقضات البيانات' : 'Data Contradictions'}
                      </h4>
                      <div className="space-y-2">
                        {contradictions.slice(0, 3).map((c: any, i: number) => (
                          <div key={i} className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm font-medium">{isArabic ? c.descriptionAr : c.descriptionEn}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {isArabic ? 'المصادر:' : 'Sources:'} {c.sources?.join(', ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {gaps.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">
                        {isArabic ? 'فجوات البيانات' : 'Data Gaps'}
                      </h4>
                      <div className="space-y-2">
                        {gaps.slice(0, 3).map((g: any, i: number) => (
                          <div key={i} className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                            <p className="text-sm font-medium">{isArabic ? g.descriptionAr : g.descriptionEn}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {g.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Coverage & Quality Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  {isArabic ? 'الثقة والفجوات' : 'Confidence & Gaps'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{coverage.dataCoveragePercent.toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground">{isArabic ? 'التغطية الكلية' : 'Total Coverage'}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{coverage.dataFreshnessPercent.toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground">{isArabic ? 'حداثة البيانات' : 'Data Freshness'}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-yellow-500">{coverage.contradictionCount}</p>
                    <p className="text-sm text-muted-foreground">{isArabic ? 'تناقضات' : 'Contradictions'}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-orange-500">{coverage.gapCount}</p>
                    <p className="text-sm text-muted-foreground">{isArabic ? 'فجوات' : 'Gaps'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* H) Exports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {isArabic ? 'التصدير والتقارير' : 'Exports & Reports'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    {isArabic ? 'تصدير PDF' : 'Export PDF'}
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {isArabic ? 'تصدير CSV' : 'Export CSV'}
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {isArabic ? 'تصدير JSON' : 'Export JSON'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* C) Core Trends */}
          <TabsContent value="trends" className="space-y-6">
            <SectorChart
              sectorCode={sectorCode}
              primaryIndicator={coreTrends.primaryChart}
              secondaryIndicators={coreTrends.secondaryCharts}
              isArabic={isArabic}
              regime={regime}
            />
          </TabsContent>

          {/* D) Mechanism Explainer */}
          <TabsContent value="mechanism" className="space-y-6">
            <MechanismExplainer
              mechanisms={mechanisms}
              isArabic={isArabic}
              sectorCode={sectorCode}
            />
          </TabsContent>

          {/* G) Watchlist */}
          <TabsContent value="watchlist" className="space-y-6">
            <SectorWatchlist
              watchlist={watchlist}
              driversAndLinks={driversAndLinks}
              isArabic={isArabic}
            />
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq" className="space-y-6">
            <SectorFaqSection
              faqs={faqs}
              isArabic={isArabic}
            />
          </TabsContent>

          {/* Related */}
          <TabsContent value="related" className="space-y-6">
            <RelatedInsightsPanel
              sourceType="sector"
              sourceId={definition.id || 0}
              sourceLabel={isArabic ? definition.nameAr : definition.nameEn}
              showDocuments={true}
              showEntities={true}
              showDatasets={true}
              showEvents={true}
              showContradictions={true}
              maxItems={10}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Loading skeleton
function SectorPageSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="h-[350px] bg-muted animate-pulse" />
      <div className="container py-8 space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default SectorPageTemplate;
