import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  BookOpen, 
  FileText, 
  Building2, 
  Calendar, 
  TrendingUp,
  Filter,
  Download,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Globe,
  Users,
  Clock,
  Star,
  Bookmark,
  Eye
} from "lucide-react";

// Publication type labels
const publicationTypeLabels: Record<string, string> = {
  research_paper: "Research Paper",
  working_paper: "Working Paper",
  policy_brief: "Policy Brief",
  technical_note: "Technical Note",
  case_study: "Case Study",
  statistical_bulletin: "Statistical Bulletin",
  sanctions_notice: "Sanctions Notice",
  presentation: "Presentation",
  evaluation_report: "Evaluation Report",
  journal_article: "Journal Article",
  book_chapter: "Book Chapter",
  thesis: "Thesis",
  dataset_documentation: "Dataset Documentation",
  methodology_note: "Methodology Note",
  survey_report: "Survey Report",
  market_bulletin: "Market Bulletin",
  economic_monitor: "Economic Monitor",
  article_iv: "Article IV",
  country_report: "Country Report",
};

// Research category labels
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
  infrastructure: "Infrastructure",
  agriculture: "Agriculture",
  health_sector: "Health Sector",
  education: "Education",
  governance: "Governance",
  sanctions_compliance: "Sanctions Compliance",
};

// Category colors
const categoryColors: Record<string, string> = {
  macroeconomic_analysis: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  banking_sector: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  monetary_policy: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  fiscal_policy: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  trade_external: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  poverty_development: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  conflict_economics: "bg-red-500/10 text-red-500 border-red-500/20",
  humanitarian_finance: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  split_system_analysis: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  labor_market: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  food_security: "bg-lime-500/10 text-lime-500 border-lime-500/20",
  energy_sector: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  infrastructure: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  agriculture: "bg-green-500/10 text-green-500 border-green-500/20",
  health_sector: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  education: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  governance: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
  sanctions_compliance: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function ResearchPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Fetch research stats
  const { data: stats, isLoading: statsLoading } = trpc.research.getStats.useQuery();
  
  // Fetch recent publications
  const { data: recentPublications, isLoading: recentLoading } = trpc.research.getRecent.useQuery({ limit: 10 });
  
  // Fetch publications by category
  const { data: categoryStats } = trpc.research.getCategoryStats.useQuery();
  
  // Fetch organizations
  const { data: organizations } = trpc.research.getOrganizations.useQuery();
  
  // Search publications
  const { data: searchResults, isLoading: searchLoading } = trpc.research.search.useQuery(
    { 
      query: searchQuery, 
      category: selectedCategory || undefined,
      type: selectedType || undefined,
      year: selectedYear || undefined,
      limit: 20 
    },
    { enabled: searchQuery.length > 0 || selectedCategory !== null || selectedType !== null || selectedYear !== null }
  );

  // Get unique years from publications
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);
  }, []);

  const showSearchResults = searchQuery.length > 0 || selectedCategory !== null || selectedType !== null || selectedYear !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  ← Back to YETO
                </Button>
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-emerald-400" />
                <h1 className="text-xl font-bold text-white">Research Portal</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-white/20 text-white/70 hover:text-white">
                <Bookmark className="h-4 w-4 mr-2" />
                My Reading List
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 border-b border-white/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Yemen Economic Research Database
            </h2>
            <p className="text-lg text-white/60">
              Comprehensive collection of research papers, policy briefs, and economic reports on Yemen from leading institutions worldwide.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                type="text"
                placeholder="Search publications by title, author, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Button
              variant={selectedCategory === null && selectedType === null && selectedYear === null ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedType(null);
                setSelectedYear(null);
              }}
              className={selectedCategory === null && selectedType === null && selectedYear === null 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "border-white/20 text-white/70 hover:text-white"}
            >
              All
            </Button>
            <Button
              variant={selectedType === "article_iv" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(selectedType === "article_iv" ? null : "article_iv")}
              className={selectedType === "article_iv" 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "border-white/20 text-white/70 hover:text-white"}
            >
              Article IV Reports
            </Button>
            <Button
              variant={selectedCategory === "monetary_policy" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === "monetary_policy" ? null : "monetary_policy")}
              className={selectedCategory === "monetary_policy" 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "border-white/20 text-white/70 hover:text-white"}
            >
              Monetary Policy
            </Button>
            <Button
              variant={selectedCategory === "food_security" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === "food_security" ? null : "food_security")}
              className={selectedCategory === "food_security" 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "border-white/20 text-white/70 hover:text-white"}
            >
              Food Security
            </Button>
            <Button
              variant={selectedCategory === "conflict_economics" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === "conflict_economics" ? null : "conflict_economics")}
              className={selectedCategory === "conflict_economics" 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "border-white/20 text-white/70 hover:text-white"}
            >
              Conflict Economics
            </Button>
            <Button
              variant={selectedYear === 2024 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedYear(selectedYear === 2024 ? null : 2024)}
              className={selectedYear === 2024 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "border-white/20 text-white/70 hover:text-white"}
            >
              2024
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-12">
        <div className="container">
          {showSearchResults ? (
            /* Search Results */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {searchLoading ? "Searching..." : `${searchResults?.length || 0} Results`}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                    setSelectedType(null);
                    setSelectedYear(null);
                  }}
                  className="text-white/60 hover:text-white"
                >
                  Clear Filters
                </Button>
              </div>

              {searchLoading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-white/5 border-white/10">
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 bg-white/10 mb-3" />
                        <Skeleton className="h-4 w-1/2 bg-white/10 mb-2" />
                        <Skeleton className="h-4 w-full bg-white/10" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {searchResults?.map((pub: any) => (
                    <Card key={pub.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={categoryColors[pub.researchCategory] || "bg-gray-500/10 text-gray-500"}>
                                {categoryLabels[pub.researchCategory] || pub.researchCategory}
                              </Badge>
                              <Badge variant="outline" className="border-white/20 text-white/60">
                                {publicationTypeLabels[pub.publicationType] || pub.publicationType}
                              </Badge>
                              <span className="text-sm text-white/40">{pub.publicationYear}</span>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">{pub.title}</h4>
                            {pub.abstract && (
                              <p className="text-white/60 text-sm line-clamp-2 mb-3">{pub.abstract}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-white/40">
                              {pub.organizationName && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-4 w-4" />
                                  {pub.organizationName}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {pub.viewCount || 0} views
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="h-4 w-4" />
                                {pub.downloadCount || 0} downloads
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {pub.sourceUrl && (
                              <Button size="sm" variant="outline" className="border-white/20 text-white/70" asChild>
                                <a href={pub.sourceUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View
                                </a>
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="text-white/60">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Dashboard View */
            <div className="space-y-12">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-emerald-500/10">
                        <FileText className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {statsLoading ? <Skeleton className="h-8 w-16 bg-white/10" /> : stats?.totalPublications || 0}
                        </p>
                        <p className="text-sm text-white/60">Publications</p>
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
                        <p className="text-2xl font-bold text-white">
                          {statsLoading ? <Skeleton className="h-8 w-16 bg-white/10" /> : stats?.totalOrganizations || 0}
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
                        <BarChart3 className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {statsLoading ? <Skeleton className="h-8 w-16 bg-white/10" /> : stats?.totalCategories || 0}
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
                        <Calendar className="h-6 w-6 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {statsLoading ? <Skeleton className="h-8 w-16 bg-white/10" /> : "2010-2025"}
                        </p>
                        <p className="text-sm text-white/60">Coverage</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Two Column Layout */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Publications */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Clock className="h-5 w-5 text-emerald-400" />
                      Recent Additions
                    </h3>
                    <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  {recentLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="bg-white/5 border-white/10">
                          <CardContent className="p-4">
                            <Skeleton className="h-5 w-3/4 bg-white/10 mb-2" />
                            <Skeleton className="h-4 w-1/2 bg-white/10" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentPublications?.map((pub: any) => (
                        <Card key={pub.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded bg-white/5">
                                <FileText className="h-4 w-4 text-white/40" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate">{pub.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={`text-xs ${categoryColors[pub.researchCategory] || "bg-gray-500/10 text-gray-500"}`}>
                                    {categoryLabels[pub.researchCategory] || pub.researchCategory}
                                  </Badge>
                                  <span className="text-xs text-white/40">{pub.publicationYear}</span>
                                  {pub.organizationName && (
                                    <span className="text-xs text-white/40">• {pub.organizationName}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Browse by Category */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Filter className="h-5 w-5 text-emerald-400" />
                        Browse by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {categoryStats?.slice(0, 8).map((cat: any) => (
                        <button
                          key={cat.category}
                          onClick={() => setSelectedCategory(cat.category)}
                          className="w-full flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors text-left"
                        >
                          <span className="text-white/80">{categoryLabels[cat.category] || cat.category}</span>
                          <Badge variant="outline" className="border-white/20 text-white/60">
                            {cat.count}
                          </Badge>
                        </button>
                      ))}
                      <Button variant="ghost" size="sm" className="w-full text-emerald-400 hover:text-emerald-300 mt-2">
                        View All Categories
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Top Organizations */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-400" />
                        Top Organizations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {organizations?.slice(0, 6).map((org: any) => (
                        <div key={org.id} className="flex items-center gap-3">
                          <div className="p-2 rounded bg-white/5">
                            <Globe className="h-4 w-4 text-white/40" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{org.acronym || org.name}</p>
                            <p className="text-xs text-white/40">{org.publicationCount} publications</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Featured Topics */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-amber-400" />
                        Trending Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {["Exchange Rate", "Food Security", "Central Bank", "Humanitarian Aid", "Inflation", "Conflict Impact", "Banking Crisis", "Remittances"].map((topic) => (
                          <Badge 
                            key={topic} 
                            variant="outline" 
                            className="border-white/20 text-white/60 hover:bg-white/10 cursor-pointer"
                            onClick={() => setSearchQuery(topic)}
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container">
          <div className="flex items-center justify-between text-sm text-white/40">
            <p>YETO Research Portal • Yemen Economic Transparency Observatory</p>
            <p>Data updated continuously from 15+ international sources</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
