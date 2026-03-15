/**
 * Literature Vault Page
 * 
 * Searchable library of documents with:
 * - Hybrid search (keyword + semantic)
 * - Filters: sector, source, year, language, regime_tag, license, visibility
 * - Document viewer with evidence pack links
 * - Citation anchors for references
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  FileText,
  Filter,
  Download,
  ExternalLink,
  Calendar,
  Building,
  Tag,
  Globe,
  Lock,
  CheckCircle,
  AlertCircle,
  Book,
  FileCheck,
  Zap,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface SearchResult {
  documentId: number;
  title: string;
  titleAr?: string;
  snippet: string;
  snippetAr?: string;
  relevanceScore: number;
  source?: string;
  publicationDate?: string;
  regimeTag?: string;
  sectors?: string[];
  url: string;
  citationAnchors: Array<{
    anchorId: string;
    anchorType: string;
    pageNumber?: number;
    snippet: string;
  }>;
  evidencePackId?: number;
}

interface SearchFilters {
  sectors?: string[];
  regimeTag?: string;
  yearFrom?: number;
  yearTo?: number;
  visibility?: string;
  language?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function LiteratureVault() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [facets, setFacets] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ar" | "both">("both");

  // Search function
  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("q", query);
      params.set("language", selectedLanguage);
      if (filters.sectors) params.set("sectors", filters.sectors.join(","));
      if (filters.regimeTag) params.set("regimeTag", filters.regimeTag);
      if (filters.yearFrom) params.set("yearFrom", filters.yearFrom.toString());
      if (filters.yearTo) params.set("yearTo", filters.yearTo.toString());
      if (filters.visibility) params.set("visibility", filters.visibility);

      const response = await fetch(`/api/document-vault/documents?${params}`);
      const data = await response.json();

      setResults(data.results || []);
      setTotalCount(data.totalCount || 0);
      setFacets(data.facets || {});

      // Update URL
      setSearchParams({ q: query });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load search from URL on mount
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch();
    }
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  // Filter handlers
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Book className="w-8 h-8 text-blue-600" />
                Literature Vault
              </h1>
              <p className="text-slate-600 mt-1">
                Search and explore Yemen's economic and humanitarian knowledge base
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/document-vault")}
                className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Admin Dashboard
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search reports, papers, datasets, and documents..."
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                showFilters
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </form>

          {/* Language Selector */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-slate-600">Language:</span>
            <div className="flex gap-2">
              {[
                { value: "both", label: "Both" },
                { value: "en", label: "English" },
                { value: "ar", label: "العربية" },
              ].map(lang => (
                <button
                  key={lang.value}
                  onClick={() => setSelectedLanguage(lang.value as any)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    selectedLanguage === lang.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Sector Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sector
                </label>
                <select
                  value={filters.sectors?.[0] || ""}
                  onChange={e =>
                    handleFilterChange(
                      "sectors",
                      e.target.value ? [e.target.value] : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Sectors</option>
                  <option value="banking">Banking</option>
                  <option value="humanitarian">Humanitarian</option>
                  <option value="food_security">Food Security</option>
                  <option value="trade">Trade</option>
                  <option value="energy">Energy</option>
                </select>
              </div>

              {/* Regime Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Regime
                </label>
                <select
                  value={filters.regimeTag || ""}
                  onChange={e => handleFilterChange("regimeTag", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Regimes</option>
                  <option value="aden">Aden (IRG)</option>
                  <option value="sanaa">Sana'a (DFA)</option>
                  <option value="both">Both</option>
                  <option value="international">International</option>
                </select>
              </div>

              {/* Year From */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Year From
                </label>
                <input
                  type="number"
                  value={filters.yearFrom || ""}
                  onChange={e =>
                    handleFilterChange("yearFrom", e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="2010"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Year To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Year To
                </label>
                <input
                  type="number"
                  value={filters.yearTo || ""}
                  onChange={e =>
                    handleFilterChange("yearTo", e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {totalCount > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-slate-600">
              Found <span className="font-semibold text-slate-900">{totalCount}</span>{" "}
              documents
            </p>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4">
          {results.map(result => (
            <div
              key={result.documentId}
              className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {result.title}
                      </h3>
                      {result.titleAr && (
                        <h4 className="text-sm text-slate-600 mb-2 font-arabic">
                          {result.titleAr}
                        </h4>
                      )}

                      <p className="text-slate-700 mb-3 line-clamp-3">
                        {result.snippet}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-3 mb-3 text-sm text-slate-600">
                        {result.source && (
                          <span className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {result.source}
                          </span>
                        )}
                        {result.publicationDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(result.publicationDate).toLocaleDateString()}
                          </span>
                        )}
                        {result.regimeTag && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            {result.regimeTag}
                          </span>
                        )}
                      </div>

                      {/* Sectors */}
                      {result.sectors && result.sectors.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {result.sectors.map(sector => (
                            <span
                              key={sector}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
                            >
                              <Tag className="w-3 h-3" />
                              {sector}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Evidence Pack */}
                      {result.evidencePackId && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-700">
                            Evidence Pack Available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/documents/${result.documentId}`)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <FileCheck className="w-4 h-4" />
                    View
                  </button>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>

              {/* Citation Anchors */}
              {result.citationAnchors && result.citationAnchors.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Quick Citations</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.citationAnchors.slice(0, 2).map((anchor, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 rounded-lg p-3 text-sm"
                      >
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          {anchor.pageNumber && (
                            <span>Page {anchor.pageNumber}</span>
                          )}
                          <span className="text-slate-400">•</span>
                          <span>{anchor.anchorType}</span>
                        </div>
                        <p className="text-slate-700 line-clamp-2">
                          {anchor.snippet}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && results.length === 0 && query && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No documents found
            </h3>
            <p className="text-slate-600 mb-4">
              Try adjusting your search query or filters
            </p>
          </div>
        )}

        {/* Welcome State */}
        {!loading && results.length === 0 && !query && (
          <div className="text-center py-12">
            <Book className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Welcome to the Literature Vault
            </h3>
            <p className="text-slate-600 mb-4">
              Search for reports, research papers, datasets, and documents about Yemen's economy
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  setQuery("inflation");
                  performSearch();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm"
              >
                Example: "inflation"
              </button>
              <button
                onClick={() => {
                  setQuery("central bank");
                  performSearch();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm"
              >
                Example: "central bank"
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
