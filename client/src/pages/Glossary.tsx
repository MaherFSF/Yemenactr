import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Search, BookOpen, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Glossary() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch all glossary terms
  const { data: allTerms, isLoading } = trpc.glossary.list.useQuery({});

  // Get unique categories
  const categories = useMemo(() => {
    if (!allTerms) return [];
    const cats = new Set(allTerms.map(term => term.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allTerms]);

  // Filter terms based on search and category
  const filteredTerms = useMemo(() => {
    if (!allTerms) return [];
    
    let filtered = allTerms;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(term => term.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(term => {
        const termText = language === "ar" ? term.termAr : term.termEn;
        const definitionText = language === "ar" ? term.definitionAr : term.definitionEn;
        return (
          termText?.toLowerCase().includes(query) ||
          definitionText?.toLowerCase().includes(query)
        );
      });
    }

    // Sort alphabetically
    return filtered.sort((a, b) => {
      const aText = language === "ar" ? a.termAr || a.termEn : a.termEn;
      const bText = language === "ar" ? b.termAr || b.termEn : b.termEn;
      return aText.localeCompare(bText, language);
    });
  }, [allTerms, searchQuery, selectedCategory, language]);

  // Group terms by first letter
  const groupedTerms = useMemo(() => {
    const groups: Record<string, typeof filteredTerms> = {};
    filteredTerms.forEach(term => {
      const text = language === "ar" ? term.termAr || term.termEn : term.termEn;
      const firstLetter = text.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(term);
    });
    return groups;
  }, [filteredTerms, language]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {language === "ar" ? "قاموس المصطلحات الاقتصادية" : "Economic Glossary"}
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === "ar"
                ? "مصطلحات اقتصادية ومالية بالعربية والإنجليزية مع تعريفات شاملة"
                : "Bilingual economic and financial terms with comprehensive definitions"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-[1fr,auto] gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === "ar" ? "ابحث عن مصطلح..." : "Search for a term..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={language === "ar" ? "الفئة" : "Category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "ar" ? "جميع الفئات" : "All Categories"}
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category || "uncategorized"}>
                      {category || (language === "ar" ? "غير مصنف" : "Uncategorized")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-muted-foreground">
              {isLoading ? (
                language === "ar" ? "جاري التحميل..." : "Loading..."
              ) : (
                <>
                  {language === "ar" 
                    ? `${filteredTerms.length} مصطلح`
                    : `${filteredTerms.length} term${filteredTerms.length !== 1 ? 's' : ''}`}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Terms List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-6 bg-muted animate-pulse rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-5/6 mt-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTerms.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {language === "ar" 
                  ? "لم يتم العثور على مصطلحات مطابقة"
                  : "No matching terms found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTerms).map(([letter, terms]) => (
              <div key={letter}>
                {/* Letter Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{letter}</span>
                  </div>
                  <div className="flex-1 h-px bg-border"></div>
                </div>

                {/* Terms in this letter group */}
                <div className="space-y-4">
                  {terms.map((term) => (
                    <Card key={term.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          {/* Term */}
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-foreground mb-1">
                                  {language === "ar" ? term.termAr || term.termEn : term.termEn}
                                </h3>
                                {language === "ar" && term.termEn && (
                                  <p className="text-sm text-muted-foreground">
                                    {term.termEn}
                                  </p>
                                )}
                                {language === "en" && term.termAr && (
                                  <p className="text-sm text-muted-foreground">
                                    {term.termAr}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Definition */}
                            <p className="text-muted-foreground leading-relaxed mb-3">
                              {language === "ar" 
                                ? term.definitionAr || term.definitionEn 
                                : term.definitionEn}
                            </p>


                          </div>

                          {/* Category Badge */}
                          {term.category && (
                            <Badge variant="outline" className="flex-shrink-0">
                              {term.category}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
