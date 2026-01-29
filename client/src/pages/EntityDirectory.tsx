/**
 * YETO Entity Directory Page
 * 
 * Searchable directory of all entities (organizations, agencies, authorities)
 * with filtering by type, regime, and category.
 */

import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Building2, Globe, Landmark, Users, 
  BookOpen, Filter, ChevronRight, Network, Calendar
} from "lucide-react";

// Entity type icons
const entityTypeIcons: Record<string, any> = {
  multilateral: Globe,
  eu_institution: Building2,
  un_agency: Globe,
  national_authority: Landmark,
  central_bank: Landmark,
  ministry: Building2,
  development_program: Users,
  think_tank: BookOpen,
  donor: Globe,
  implementer: Users,
  private_sector: Building2,
  ngo: Users,
};

// Regime tag colors
const regimeColors: Record<string, string> = {
  aden: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  sanaa: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  both: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  international: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export default function EntityDirectory() {
  const { language, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [regimeFilter, setRegimeFilter] = useState<string>("all");
  
  // Fetch entities
  const { data: entities, isLoading } = trpc.entities.list.useQuery({
    search: searchQuery || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    regimeTag: regimeFilter !== "all" ? regimeFilter : undefined,
    limit: 100,
  });
  
  // Entity type options
  const entityTypes = [
    { value: "all", label: language === "ar" ? "جميع الأنواع" : "All Types" },
    { value: "multilateral", label: language === "ar" ? "متعدد الأطراف" : "Multilateral" },
    { value: "un_agency", label: language === "ar" ? "وكالة أممية" : "UN Agency" },
    { value: "eu_institution", label: language === "ar" ? "مؤسسة أوروبية" : "EU Institution" },
    { value: "central_bank", label: language === "ar" ? "بنك مركزي" : "Central Bank" },
    { value: "ministry", label: language === "ar" ? "وزارة" : "Ministry" },
    { value: "development_program", label: language === "ar" ? "برنامج تنمية" : "Development Program" },
    { value: "think_tank", label: language === "ar" ? "مركز أبحاث" : "Think Tank" },
    { value: "donor", label: language === "ar" ? "جهة مانحة" : "Donor" },
  ];
  
  // Regime options
  const regimeOptions = [
    { value: "all", label: language === "ar" ? "جميع الأنظمة" : "All Regimes" },
    { value: "international", label: language === "ar" ? "دولي" : "International" },
    { value: "aden", label: language === "ar" ? "عدن" : "Aden" },
    { value: "sanaa", label: language === "ar" ? "صنعاء" : "Sana'a" },
    { value: "both", label: language === "ar" ? "كلاهما" : "Both" },
    { value: "neutral", label: language === "ar" ? "محايد" : "Neutral" },
  ];

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-12">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <Network className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {language === "ar" ? "دليل الجهات" : "Entity Directory"}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {language === "ar" 
              ? "استكشف المنظمات والوكالات والسلطات العاملة في اليمن. كل جهة لديها ملف شامل مع الجدول الزمني والعلاقات والأدلة."
              : "Explore organizations, agencies, and authorities operating in Yemen. Each entity has a comprehensive profile with timeline, relationships, and evidence."}
          </p>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="container py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                <Input
                  placeholder={language === "ar" ? "البحث عن جهة..." : "Search entities..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={isRTL ? "pr-10" : "pl-10"}
                />
              </div>
              
              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Regime Filter */}
              <Select value={regimeFilter} onValueChange={setRegimeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Landmark className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regimeOptions.map((regime) => (
                    <SelectItem key={regime.value} value={regime.value}>
                      {regime.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading 
              ? (language === "ar" ? "جاري التحميل..." : "Loading...")
              : (language === "ar" 
                  ? `${entities?.length || 0} جهة` 
                  : `${entities?.length || 0} entities found`)}
          </p>
        </div>
        
        {/* Entity Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-muted rounded w-20" />
                    <div className="h-5 bg-muted rounded w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : entities && entities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entities.map((entity: any) => {
              const IconComponent = entityTypeIcons[entity.entityType] || Building2;
              return (
                <Link key={entity.id} href={`/entities/${entity.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {language === "ar" && entity.nameAr ? entity.nameAr : entity.name}
                          </h3>
                          {language === "ar" && entity.nameAr && (
                            <p className="text-sm text-muted-foreground truncate">
                              {entity.name}
                            </p>
                          )}
                        </div>
                        <ChevronRight className={`h-5 w-5 text-muted-foreground ${isRTL ? "rotate-180" : ""}`} />
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {entity.entityType?.replace(/_/g, " ")}
                        </Badge>
                        {entity.regimeTag && (
                          <Badge className={`text-xs ${regimeColors[entity.regimeTag] || regimeColors.neutral}`}>
                            {entity.regimeTag}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{entity.timelineCount || 0} {language === "ar" ? "أحداث" : "events"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Network className="h-3 w-3" />
                          <span>{entity.relationshipCount || 0} {language === "ar" ? "علاقات" : "links"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {language === "ar" ? "لم يتم العثور على جهات" : "No entities found"}
              </h3>
              <p className="text-muted-foreground">
                {language === "ar" 
                  ? "حاول تعديل معايير البحث أو الفلاتر"
                  : "Try adjusting your search criteria or filters"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
