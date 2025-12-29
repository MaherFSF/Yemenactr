import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar,
  Building2,
  FileText,
  ArrowLeft,
  Download,
  GitCompare,
  Layers,
  Map,
  Clock
} from "lucide-react";

// Category labels and colors
const categoryLabels: Record<string, string> = {
  macroeconomic_analysis: "Macroeconomic",
  banking_sector: "Banking",
  monetary_policy: "Monetary Policy",
  fiscal_policy: "Fiscal Policy",
  trade_external: "Trade",
  poverty_development: "Poverty",
  conflict_economics: "Conflict",
  humanitarian_finance: "Humanitarian",
  split_system_analysis: "Split System",
  labor_market: "Labor",
  food_security: "Food Security",
  energy_sector: "Energy",
};

const categoryColors: Record<string, string> = {
  macroeconomic_analysis: "#3b82f6",
  banking_sector: "#10b981",
  monetary_policy: "#8b5cf6",
  fiscal_policy: "#f59e0b",
  trade_external: "#06b6d4",
  poverty_development: "#f43f5e",
  conflict_economics: "#ef4444",
  humanitarian_finance: "#f97316",
  split_system_analysis: "#6366f1",
  labor_market: "#14b8a6",
  food_security: "#84cc16",
  energy_sector: "#eab308",
};

// Organization type labels
const orgTypeLabels: Record<string, string> = {
  ifi: "IFIs",
  un_agency: "UN Agencies",
  think_tank: "Think Tanks",
  academic: "Academic",
  central_bank: "Central Banks",
  government: "Government",
  ngo: "NGOs",
};

export default function ResearchVisualization() {
  const [selectedTab, setSelectedTab] = useState("overview");
  
  // Fetch data
  const { data: stats, isLoading: statsLoading } = trpc.research.getStats.useQuery();
  const { data: categoryStats, isLoading: categoryLoading } = trpc.research.getCategoryStats.useQuery();
  const { data: organizations, isLoading: orgsLoading } = trpc.research.getOrganizations.useQuery();
  const { data: recentPubs } = trpc.research.getRecent.useQuery({ limit: 20 });

  // Calculate year distribution from recent publications
  const yearDistribution = useMemo(() => {
    if (!recentPubs) return [];
    const years: Record<number, number> = {};
    recentPubs.forEach((pub: any) => {
      years[pub.publicationYear] = (years[pub.publicationYear] || 0) + 1;
    });
    return Object.entries(years)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);
  }, [recentPubs]);

  // Calculate organization type distribution
  const orgTypeDistribution = useMemo(() => {
    if (!organizations) return [];
    const types: Record<string, number> = {};
    organizations.forEach((org: any) => {
      types[org.type] = (types[org.type] || 0) + org.publicationCount;
    });
    return Object.entries(types)
      .map(([type, count]) => ({ type, label: orgTypeLabels[type] || type, count }))
      .sort((a, b) => b.count - a.count);
  }, [organizations]);

  // Calculate max values for bar scaling
  const maxCategoryCount = Math.max(...(categoryStats?.map((c: any) => c.count) || [1]));
  const maxOrgTypeCount = Math.max(...orgTypeDistribution.map(o => o.count), 1);
  const maxYearCount = Math.max(...yearDistribution.map(y => y.count), 1);

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
                <BarChart3 className="h-6 w-6 text-emerald-400" />
                <h1 className="text-xl font-bold text-white">Research Analytics</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-white/20 text-white/70">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600">
              <Layers className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-emerald-600">
              <PieChart className="h-4 w-4 mr-2" />
              By Category
            </TabsTrigger>
            <TabsTrigger value="organizations" className="data-[state=active]:bg-emerald-600">
              <Building2 className="h-4 w-4 mr-2" />
              By Organization
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-emerald-600">
              <Calendar className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-emerald-600">
              <GitCompare className="h-4 w-4 mr-2" />
              Comparison
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-emerald-500/10">
                      <FileText className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {statsLoading ? <Skeleton className="h-9 w-16 bg-white/10" /> : stats?.totalPublications || 0}
                      </p>
                      <p className="text-sm text-white/60">Total Publications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <Building2 className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {statsLoading ? <Skeleton className="h-9 w-16 bg-white/10" /> : stats?.totalOrganizations || 0}
                      </p>
                      <p className="text-sm text-white/60">Organizations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-purple-500/10">
                      <Layers className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {statsLoading ? <Skeleton className="h-9 w-16 bg-white/10" /> : stats?.totalCategories || 0}
                      </p>
                      <p className="text-sm text-white/60">Categories</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-amber-500/10">
                      <Clock className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">15</p>
                      <p className="text-sm text-white/60">Years Covered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Category Distribution */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Publications by Category</CardTitle>
                  <CardDescription className="text-white/60">Distribution across research themes</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-8 w-full bg-white/10" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categoryStats?.slice(0, 8).map((cat: any) => (
                        <div key={cat.category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/80">{categoryLabels[cat.category] || cat.category}</span>
                            <span className="text-white/60">{cat.count}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(cat.count / maxCategoryCount) * 100}%`,
                                backgroundColor: categoryColors[cat.category] || '#6b7280'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Organization Type Distribution */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Publications by Source Type</CardTitle>
                  <CardDescription className="text-white/60">IFIs, UN agencies, think tanks, etc.</CardDescription>
                </CardHeader>
                <CardContent>
                  {orgsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-8 w-full bg-white/10" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orgTypeDistribution.map((item) => (
                        <div key={item.type} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/80">{item.label}</span>
                            <span className="text-white/60">{item.count}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${(item.count / maxOrgTypeCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats?.map((cat: any) => (
                <Card key={cat.category} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">{categoryLabels[cat.category] || cat.category}</h3>
                        <p className="text-3xl font-bold text-white">{cat.count}</p>
                        <p className="text-sm text-white/60">publications</p>
                      </div>
                      <div 
                        className="w-3 h-16 rounded-full"
                        style={{ backgroundColor: categoryColors[cat.category] || '#6b7280' }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-8">
            <div className="grid gap-4">
              {organizations?.slice(0, 15).map((org: any, index: number) => (
                <Card key={org.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{org.name}</h3>
                          {org.acronym && (
                            <Badge variant="outline" className="border-white/20 text-white/60">
                              {org.acronym}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-white/60">{orgTypeLabels[org.type] || org.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{org.publicationCount}</p>
                        <p className="text-xs text-white/60">publications</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-8">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Publication Timeline (2010-2025)</CardTitle>
                <CardDescription className="text-white/60">Research output over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 16 }, (_, i) => 2010 + i).map(year => {
                    const yearData = yearDistribution.find(y => y.year === year);
                    const count = yearData?.count || 0;
                    return (
                      <div key={year} className="flex items-center gap-4">
                        <span className="w-12 text-sm text-white/60">{year}</span>
                        <div className="flex-1 h-6 bg-white/10 rounded overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded transition-all duration-500"
                            style={{ width: maxYearCount > 0 ? `${(count / maxYearCount) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="w-8 text-sm text-white/60 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Pre-Conflict vs Post-Conflict</CardTitle>
                  <CardDescription className="text-white/60">Research focus before and after 2015</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-3xl font-bold text-blue-400">
                          {recentPubs?.filter((p: any) => p.publicationYear < 2015).length || 0}
                        </p>
                        <p className="text-sm text-white/60">Pre-2015</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-3xl font-bold text-emerald-400">
                          {recentPubs?.filter((p: any) => p.publicationYear >= 2015).length || 0}
                        </p>
                        <p className="text-sm text-white/60">Post-2015</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/60 text-center">
                      Research output increased significantly after the conflict began, with more focus on humanitarian and conflict-related topics.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">IFIs vs UN Agencies</CardTitle>
                  <CardDescription className="text-white/60">Publication comparison by source type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-3xl font-bold text-purple-400">
                          {orgTypeDistribution.find(o => o.type === 'ifi')?.count || 0}
                        </p>
                        <p className="text-sm text-white/60">IFIs</p>
                        <p className="text-xs text-white/40">World Bank, IMF, IsDB</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-3xl font-bold text-cyan-400">
                          {orgTypeDistribution.find(o => o.type === 'un_agency')?.count || 0}
                        </p>
                        <p className="text-sm text-white/60">UN Agencies</p>
                        <p className="text-xs text-white/40">UNDP, WFP, OCHA</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Topic Evolution */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Research Focus Evolution</CardTitle>
                <CardDescription className="text-white/60">How research priorities shifted over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      2010-2014: Development Focus
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["Poverty Reduction", "Infrastructure", "Education", "Health"].map(topic => (
                        <Badge key={topic} variant="outline" className="border-blue-400/30 text-blue-400">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      2015-2019: Crisis Response
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["Humanitarian Aid", "Food Security", "Conflict Impact", "Displacement"].map(topic => (
                        <Badge key={topic} variant="outline" className="border-red-400/30 text-red-400">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      2020-2025: Recovery Planning
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["Economic Recovery", "Banking Reform", "Currency Stability", "Reconstruction"].map(topic => (
                        <Badge key={topic} variant="outline" className="border-emerald-400/30 text-emerald-400">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
