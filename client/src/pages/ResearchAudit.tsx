import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Download,
  RefreshCw,
  TrendingUp,
  Calendar,
  Building2,
  FileText,
  Search,
  Target,
  Layers,
  Clock
} from "lucide-react";

// Expected coverage by category
const expectedCoverage = {
  macroeconomic_analysis: { minPubs: 20, sources: ["World Bank", "IMF", "UNDP"] },
  banking_sector: { minPubs: 15, sources: ["World Bank", "IMF", "CBY"] },
  monetary_policy: { minPubs: 15, sources: ["IMF", "CBY"] },
  fiscal_policy: { minPubs: 12, sources: ["World Bank", "IMF"] },
  trade_external: { minPubs: 10, sources: ["World Bank", "UN Comtrade", "WTO"] },
  poverty_development: { minPubs: 20, sources: ["World Bank", "UNDP", "UNICEF"] },
  conflict_economics: { minPubs: 15, sources: ["Sana'a Center", "ACLED", "Think Tanks"] },
  humanitarian_finance: { minPubs: 20, sources: ["OCHA", "WFP", "UNHCR"] },
  split_system_analysis: { minPubs: 10, sources: ["Sana'a Center", "Chatham House"] },
  labor_market: { minPubs: 8, sources: ["ILO", "World Bank"] },
  food_security: { minPubs: 25, sources: ["WFP", "FAO", "FEWS NET"] },
  energy_sector: { minPubs: 8, sources: ["World Bank", "IEA"] },
};

// Category labels
const categoryLabels: Record<string, string> = {
  macroeconomic_analysis: "Macroeconomic Analysis",
  banking_sector: "Banking Sector",
  monetary_policy: "Monetary Policy",
  fiscal_policy: "Fiscal Policy",
  trade_external: "Trade & External",
  poverty_development: "Poverty & Development",
  conflict_economics: "Conflict Economics",
  humanitarian_finance: "Humanitarian Finance",
  split_system_analysis: "Split System Analysis",
  labor_market: "Labor Market",
  food_security: "Food Security",
  energy_sector: "Energy Sector",
};

// Year coverage expected
const expectedYears = Array.from({ length: 16 }, (_, i) => 2010 + i);

export default function ResearchAudit() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data
  const { data: stats, isLoading: statsLoading } = trpc.research.getStats.useQuery();
  const { data: categoryStats, isLoading: categoryLoading } = trpc.research.getCategoryStats.useQuery();
  const { data: organizations } = trpc.research.getOrganizations.useQuery();
  const { data: recentPubs } = trpc.research.getRecent.useQuery({ limit: 100 });

  // Calculate coverage metrics
  const coverageMetrics = useMemo(() => {
    if (!categoryStats) return [];
    
    return Object.entries(expectedCoverage).map(([category, expected]) => {
      const actual = categoryStats.find((c: any) => c.category === category);
      const count = actual?.count || 0;
      const coverage = Math.min(100, (count / expected.minPubs) * 100);
      const status = coverage >= 100 ? "complete" : coverage >= 50 ? "partial" : "gap";
      
      return {
        category,
        label: categoryLabels[category],
        expected: expected.minPubs,
        actual: count,
        coverage,
        status,
        missingSources: expected.sources,
      };
    });
  }, [categoryStats]);

  // Calculate year coverage
  const yearCoverage = useMemo(() => {
    if (!recentPubs) return [];
    
    const yearCounts: Record<number, number> = {};
    recentPubs.forEach((pub: any) => {
      yearCounts[pub.publicationYear] = (yearCounts[pub.publicationYear] || 0) + 1;
    });
    
    return expectedYears.map(year => ({
      year,
      count: yearCounts[year] || 0,
      hasGap: (yearCounts[year] || 0) < 3,
    }));
  }, [recentPubs]);

  // Calculate organization coverage
  const orgCoverage = useMemo(() => {
    if (!organizations) return { covered: 0, total: 15, missing: [] };
    
    const expectedOrgs = [
      "World Bank", "IMF", "UNDP", "WFP", "OCHA", "UNHCR", "UNICEF",
      "FAO", "ILO", "CBY", "Sana'a Center", "Chatham House", "Brookings",
      "CSIS", "IsDB"
    ];
    
    const coveredOrgs = organizations.map((o: any) => o.name);
    const missing = expectedOrgs.filter(org => 
      !coveredOrgs.some((c: string) => c.toLowerCase().includes(org.toLowerCase()))
    );
    
    return {
      covered: expectedOrgs.length - missing.length,
      total: expectedOrgs.length,
      missing,
    };
  }, [organizations]);

  // Overall completeness score
  const overallScore = useMemo(() => {
    if (coverageMetrics.length === 0) return 0;
    const avgCoverage = coverageMetrics.reduce((sum, m) => sum + m.coverage, 0) / coverageMetrics.length;
    return Math.round(avgCoverage);
  }, [coverageMetrics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/research-portal">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Research Portal
                </Button>
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-emerald-400" />
                <h1 className="text-xl font-bold text-white">Completeness Audit</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-white/20 text-white/70"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Audit
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 text-white/70">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Overall Score */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-400 mb-1">Overall Completeness</p>
                  <p className="text-5xl font-bold text-white">{overallScore}%</p>
                  <p className="text-sm text-white/60 mt-2">
                    {overallScore >= 80 ? "Excellent coverage" : overallScore >= 50 ? "Good progress" : "Needs attention"}
                  </p>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                  {overallScore >= 80 ? (
                    <CheckCircle className="h-12 w-12 text-emerald-400" />
                  ) : overallScore >= 50 ? (
                    <TrendingUp className="h-12 w-12 text-amber-400" />
                  ) : (
                    <AlertTriangle className="h-12 w-12 text-red-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-white/60">Organizations</span>
              </div>
              <p className="text-3xl font-bold text-white">{orgCoverage.covered}/{orgCoverage.total}</p>
              <Progress value={(orgCoverage.covered / orgCoverage.total) * 100} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-white/60">Year Coverage</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {yearCoverage.filter(y => !y.hasGap).length}/{expectedYears.length}
              </p>
              <Progress value={(yearCoverage.filter(y => !y.hasGap).length / expectedYears.length) * 100} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Category Coverage */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-400" />
              Category Coverage Analysis
            </CardTitle>
            <CardDescription className="text-white/60">
              Research coverage by thematic category against expected minimums
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full bg-white/10" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {coverageMetrics.map((metric) => (
                  <div key={metric.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {metric.status === "complete" ? (
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                        ) : metric.status === "partial" ? (
                          <AlertTriangle className="h-5 w-5 text-amber-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                        <span className="text-white font-medium">{metric.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-white/60">
                          {metric.actual} / {metric.expected} publications
                        </span>
                        <Badge 
                          className={
                            metric.status === "complete" 
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : metric.status === "partial"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {Math.round(metric.coverage)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={metric.coverage} 
                      className={`h-2 ${
                        metric.status === "complete" 
                          ? "[&>div]:bg-emerald-500"
                          : metric.status === "partial"
                          ? "[&>div]:bg-amber-500"
                          : "[&>div]:bg-red-500"
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Year Coverage Timeline */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              Temporal Coverage (2010-2025)
            </CardTitle>
            <CardDescription className="text-white/60">
              Publication coverage by year - gaps indicate missing research periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
              {yearCoverage.map((year) => (
                <div 
                  key={year.year}
                  className={`p-2 rounded text-center ${
                    year.hasGap 
                      ? "bg-red-500/20 border border-red-500/30" 
                      : "bg-emerald-500/20 border border-emerald-500/30"
                  }`}
                >
                  <p className="text-xs text-white/60">{year.year}</p>
                  <p className={`text-lg font-bold ${year.hasGap ? "text-red-400" : "text-emerald-400"}`}>
                    {year.count}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/50" />
                <span className="text-white/60">Adequate coverage (3+ publications)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500/50" />
                <span className="text-white/60">Gap detected (&lt;3 publications)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missing Sources */}
        {orgCoverage.missing.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-amber-400" />
                Missing Data Sources
              </CardTitle>
              <CardDescription className="text-white/60">
                Expected organizations not yet represented in the research base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {orgCoverage.missing.map((org) => (
                  <Badge 
                    key={org}
                    variant="outline" 
                    className="border-amber-500/30 text-amber-400 bg-amber-500/10"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {org}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coverageMetrics.filter(m => m.status !== "complete").slice(0, 5).map((metric) => (
                <div key={metric.category} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">
                      Add {metric.expected - metric.actual} more publications for {metric.label}
                    </p>
                    <p className="text-sm text-white/60 mt-1">
                      Suggested sources: {metric.missingSources.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
