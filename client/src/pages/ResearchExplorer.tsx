import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  BookOpen, 
  FileText, 
  Building2, 
  Calendar, 
  Filter,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Bookmark,
  Eye,
  Globe,
  Tag
} from "lucide-react";

// Publication type labels
const publicationTypeLabels: Record<string, string> = {
  research_paper: "Research Paper",
  working_paper: "Working Paper",
  policy_brief: "Policy Brief",
  technical_note: "Technical Note",
  case_study: "Case Study",
  statistical_bulletin: "Statistical Bulletin",
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
};

// Organization type labels
const orgTypeLabels: Record<string, string> = {
  ifi: "International Financial Institution",
  un_agency: "UN Agency",
  think_tank: "Think Tank",
  academic: "Academic Institution",
  central_bank: "Central Bank",
  government: "Government",
  ngo: "NGO",
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
};

export default function ResearchExplorer() {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<number[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([2010, 2025]);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  
  // Expanded filter sections
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    types: true,
    organizations: true,
    years: true,
  });

  // Fetch data
  const { data: categoryStats } = trpc.research.getCategoryStats.useQuery();
  const { data: organizations } = trpc.research.getOrganizations.useQuery();
  
  // Search with filters
  const { data: searchResults, isLoading } = trpc.research.search.useQuery({
    query: searchQuery || undefined,
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
    limit: 50,
  });

  // Filter results client-side for multiple selections
  const filteredResults = useMemo(() => {
    if (!searchResults) return [];
    
    return searchResults.filter((pub: any) => {
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(pub.researchCategory)) {
        return false;
      }
      
      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(pub.publicationType)) {
        return false;
      }
      
      // Organization filter
      if (selectedOrgs.length > 0 && pub.organizationId && !selectedOrgs.includes(pub.organizationId)) {
        return false;
      }
      
      // Year range filter
      if (pub.publicationYear < yearRange[0] || pub.publicationYear > yearRange[1]) {
        return false;
      }
      
      return true;
    });
  }, [searchResults, selectedCategories, selectedTypes, selectedOrgs, yearRange]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleOrg = (orgId: number) => {
    setSelectedOrgs(prev => 
      prev.includes(orgId) 
        ? prev.filter(o => o !== orgId)
        : [...prev, orgId]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedOrgs([]);
    setYearRange([2010, 2025]);
  };

  const activeFilterCount = selectedCategories.length + selectedTypes.length + selectedOrgs.length + 
    (yearRange[0] !== 2010 || yearRange[1] !== 2025 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/research-portal">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  ← Research Portal
                </Button>
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <Search className="h-6 w-6 text-emerald-400" />
                <h1 className="text-xl font-bold text-white">Research Explorer</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-white/20 text-white/70 hover:text-white"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-emerald-500">{activeFilterCount}</Badge>
                )}
              </Button>
              <div className="flex border border-white/20 rounded-md">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-emerald-600" : "text-white/60"}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-emerald-600" : "text-white/60"}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-72 flex-shrink-0 space-y-6">
              {/* Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    type="text"
                    placeholder="Search publications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(cat => (
                    <Badge key={cat} variant="secondary" className="bg-white/10 text-white/80">
                      {categoryLabels[cat] || cat}
                      <button onClick={() => toggleCategory(cat)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedTypes.map(type => (
                    <Badge key={type} variant="secondary" className="bg-white/10 text-white/80">
                      {publicationTypeLabels[type] || type}
                      <button onClick={() => toggleType(type)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-white/60 hover:text-white text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              )}

              {/* Categories Filter */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="py-3 cursor-pointer" onClick={() => setExpandedSections(s => ({ ...s, categories: !s.categories }))}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Tag className="h-4 w-4 text-emerald-400" />
                      Research Categories
                    </CardTitle>
                    {expandedSections.categories ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
                  </div>
                </CardHeader>
                {expandedSections.categories && (
                  <CardContent className="pt-0 space-y-2 max-h-64 overflow-y-auto">
                    {categoryStats?.map((cat: any) => (
                      <label key={cat.category} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded">
                        <Checkbox
                          checked={selectedCategories.includes(cat.category)}
                          onCheckedChange={() => toggleCategory(cat.category)}
                        />
                        <span className="text-sm text-white/80 flex-1">{categoryLabels[cat.category] || cat.category}</span>
                        <span className="text-xs text-white/40">{cat.count}</span>
                      </label>
                    ))}
                  </CardContent>
                )}
              </Card>

              {/* Publication Types Filter */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="py-3 cursor-pointer" onClick={() => setExpandedSections(s => ({ ...s, types: !s.types }))}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      Publication Types
                    </CardTitle>
                    {expandedSections.types ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
                  </div>
                </CardHeader>
                {expandedSections.types && (
                  <CardContent className="pt-0 space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(publicationTypeLabels).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded">
                        <Checkbox
                          checked={selectedTypes.includes(key)}
                          onCheckedChange={() => toggleType(key)}
                        />
                        <span className="text-sm text-white/80">{label}</span>
                      </label>
                    ))}
                  </CardContent>
                )}
              </Card>

              {/* Organizations Filter */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="py-3 cursor-pointer" onClick={() => setExpandedSections(s => ({ ...s, organizations: !s.organizations }))}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-400" />
                      Organizations
                    </CardTitle>
                    {expandedSections.organizations ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
                  </div>
                </CardHeader>
                {expandedSections.organizations && (
                  <CardContent className="pt-0 space-y-2 max-h-64 overflow-y-auto">
                    {organizations?.slice(0, 15).map((org: any) => (
                      <label key={org.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded">
                        <Checkbox
                          checked={selectedOrgs.includes(org.id)}
                          onCheckedChange={() => toggleOrg(org.id)}
                        />
                        <span className="text-sm text-white/80 flex-1 truncate">{org.acronym || org.name}</span>
                        <span className="text-xs text-white/40">{org.publicationCount}</span>
                      </label>
                    ))}
                  </CardContent>
                )}
              </Card>

              {/* Year Range Filter */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="py-3 cursor-pointer" onClick={() => setExpandedSections(s => ({ ...s, years: !s.years }))}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-400" />
                      Publication Year
                    </CardTitle>
                    {expandedSections.years ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
                  </div>
                </CardHeader>
                {expandedSections.years && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <Slider
                        value={yearRange}
                        onValueChange={(value) => setYearRange(value as [number, number])}
                        min={2010}
                        max={2025}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-sm text-white/60">
                        <span>{yearRange[0]}</span>
                        <span>{yearRange[1]}</span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </aside>
          )}

          {/* Results */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-white/60">
                {isLoading ? "Searching..." : `${filteredResults.length} publications found`}
              </p>
              <Button variant="outline" size="sm" className="border-white/20 text-white/70">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>

            {isLoading ? (
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-4" : "space-y-4"}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-4" : "space-y-4"}>
                {filteredResults.map((pub: any) => (
                  <Card key={pub.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className={categoryColors[pub.researchCategory] || "bg-gray-500/10 text-gray-500"}>
                              {categoryLabels[pub.researchCategory] || pub.researchCategory}
                            </Badge>
                            <Badge variant="outline" className="border-white/20 text-white/60">
                              {publicationTypeLabels[pub.publicationType] || pub.publicationType}
                            </Badge>
                            <span className="text-sm text-white/40">{pub.publicationYear}</span>
                          </div>
                          <h4 className="text-lg font-semibold text-white mb-2 line-clamp-2">{pub.title}</h4>
                          {pub.abstract && viewMode === "list" && (
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
                              {pub.viewCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              {pub.downloadCount || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {pub.sourceUrl && (
                            <Button size="sm" variant="outline" className="border-white/20 text-white/70" asChild>
                              <a href={pub.sourceUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
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

            {!isLoading && filteredResults.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No publications found</h3>
                <p className="text-white/60">Try adjusting your search or filters</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
