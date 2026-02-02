import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Search,
  Filter,
  ExternalLink,
  Users,
  Globe,
  AlertTriangle,
  FileText,
  ChevronRight,
  Info,
  Database,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { SourcesUsedPanel } from "@/components/SourcesUsedPanel";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

// Entity type icons mapping
const entityTypeIcons: Record<string, typeof Building2> = {
  central_bank: Building2,
  government_ministry: Building2,
  commercial_bank: Building2,
  customs_authority: Building2,
  tax_authority: Building2,
  international_org: Globe,
  ngo: Users,
  company: Building2,
};

// GAP Ticket Badge Component
function GapTicketBadge({ gapId, titleEn, titleAr }: { gapId: string; titleEn: string; titleAr: string }) {
  const { language } = useLanguage();
  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
      <AlertCircle className="h-3 w-3 mr-1" />
      {language === "ar" ? "غير متوفر" : "Not available"} | {gapId}
    </Badge>
  );
}

// Empty State Component
function EmptyState({ type }: { type: "no-data" | "no-claims" }) {
  const { language } = useLanguage();
  
  if (type === "no-data") {
    return (
      <Card className="p-12 text-center">
        <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          {language === "ar" ? "لا توجد بيانات متاحة" : "No Data Available"}
        </h3>
        <p className="text-gray-500 text-sm">
          {language === "ar" 
            ? "لم يتم العثور على كيانات في قاعدة البيانات. يتم جمع البيانات من مصادر موثوقة."
            : "No entities found in the database. Data is being collected from verified sources."}
        </p>
      </Card>
    );
  }
  
  return (
    <div className="text-center py-4 text-gray-500 text-sm">
      <AlertCircle className="h-4 w-4 inline mr-1" />
      {language === "ar" ? "لا توجد مطالبات موثقة" : "No verified claims available"}
    </div>
  );
}

export default function Entities() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [regimeFilter, setRegimeFilter] = useState<string>("all");

  // Fetch entities from database with evidence-backed claims
  const { data, isLoading, error } = trpc.entities.getWithClaims.useQuery({
    search: searchQuery || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    regimeTag: regimeFilter !== "all" ? regimeFilter : undefined,
    limit: 50,
  });

  // Fetch entity types for filter
  const { data: entityTypes } = trpc.entities.getTypes.useQuery();

  const entities = data?.entities || [];
  const gapTickets = data?.gapTickets || [];
  const totalCount = data?.total || 0;

  // Get unique regime tags from entities
  const regimeTags = Array.from(new Set(entities.map((e: any) => e.regimeTag).filter(Boolean)));

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${isArabic ? "rtl" : "ltr"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Building2 className="h-8 w-8 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isArabic ? "دليل الكيانات" : "Entity Directory"}
              </h1>
              <p className="text-gray-600">
                {isArabic 
                  ? "قاعدة بيانات شاملة للمؤسسات والكيانات الاقتصادية في اليمن"
                  : "Comprehensive database of economic institutions and entities in Yemen"}
              </p>
            </div>
          </div>
          
          {/* Data Source Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  {isArabic ? "مصدر البيانات" : "Data Source"}
                </p>
                <p className="text-sm text-blue-700">
                  {isArabic 
                    ? "جميع البيانات المعروضة مستمدة من قاعدة البيانات الموثقة. الأرقام والإحصائيات تتطلب حزمة أدلة للعرض."
                    : "All displayed data is sourced from the verified database. Metrics require evidence packs to be displayed."}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-2xl font-bold text-emerald-700">{totalCount}</div>
              <div className="text-sm text-gray-600">
                {isArabic ? "إجمالي الكيانات" : "Total Entities"}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-blue-700">
                {entities.filter((e: any) => e.verifiedClaimsCount > 0).length}
              </div>
              <div className="text-sm text-gray-600">
                {isArabic ? "مع بيانات موثقة" : "With Verified Data"}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-amber-700">{gapTickets.length}</div>
              <div className="text-sm text-gray-600">
                {isArabic ? "فجوات بيانات" : "Data Gaps"}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-purple-700">
                {entityTypes?.length || 0}
              </div>
              <div className="text-sm text-gray-600">
                {isArabic ? "أنواع الكيانات" : "Entity Types"}
              </div>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={isArabic ? "البحث عن كيان..." : "Search entities..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={isArabic ? "نوع الكيان" : "Entity Type"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? "جميع الأنواع" : "All Types"}</SelectItem>
              {entityTypes?.map((type: any) => (
                <SelectItem key={type.entityType} value={type.entityType}>
                  {type.entityType.replace(/_/g, " ")} ({type.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={regimeFilter} onValueChange={setRegimeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={isArabic ? "النظام" : "Regime"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? "جميع الأنظمة" : "All Regimes"}</SelectItem>
              <SelectItem value="aden_irg">{isArabic ? "عدن (IRG)" : "Aden (IRG)"}</SelectItem>
              <SelectItem value="sanaa_defacto">{isArabic ? "صنعاء (DFA)" : "Sanaa (DFA)"}</SelectItem>
              <SelectItem value="mixed">{isArabic ? "مختلط" : "Mixed"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-12 text-center border-red-200 bg-red-50">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-700 mb-2">
              {isArabic ? "خطأ في تحميل البيانات" : "Error Loading Data"}
            </h3>
            <p className="text-red-600 text-sm">{error.message}</p>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && entities.length === 0 && (
          <EmptyState type="no-data" />
        )}

        {/* Entity Cards */}
        {!isLoading && !error && entities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity: any) => {
              const IconComponent = entityTypeIcons[entity.entityType] || Building2;
              const hasVerifiedClaims = entity.verifiedClaimsCount > 0;
              
              return (
                <Card key={entity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {isArabic ? entity.nameAr || entity.name : entity.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {entity.entityType?.replace(/_/g, " ")}
                          </CardDescription>
                        </div>
                      </div>
                      {entity.regimeTag && (
                        <Badge variant="outline" className="text-xs">
                          {entity.regimeTag === "aden_irg" ? "IRG" : 
                           entity.regimeTag === "sanaa_defacto" ? "DFA" : "Mixed"}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Description */}
                    {entity.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {isArabic ? entity.descriptionAr || entity.description : entity.description}
                      </p>
                    )}
                    
                    {/* Verified Claims Section */}
                    {hasVerifiedClaims ? (
                      <div className="space-y-2 mb-4">
                        <div className="text-xs font-medium text-gray-500 uppercase">
                          {isArabic ? "بيانات موثقة" : "Verified Data"}
                        </div>
                        {entity.verifiedClaims?.slice(0, 3).map((claim: any) => {
                          // Handle JSON objects in claim_subject and claim_object
                          const subjectText = typeof claim.claim_subject === 'object' 
                            ? (claim.claim_subject?.event || claim.claim_subject?.metric || JSON.stringify(claim.claim_subject))
                            : claim.claim_subject;
                          const objectText = typeof claim.claim_object === 'object'
                            ? (claim.claim_object?.value || claim.claim_object?.name || JSON.stringify(claim.claim_object))
                            : claim.claim_object;
                          return (
                            <div key={claim.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                              <span className="text-gray-700">{subjectText}</span>
                              <span className="font-medium">{objectText}</span>
                            </div>
                          );
                        })}
                        {entity.verifiedClaims?.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{entity.verifiedClaims.length - 3} {isArabic ? "مطالبات أخرى" : "more claims"}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mb-4">
                        <GapTicketBadge 
                          gapId={`GAP-ENTITY-${entity.id}`}
                          titleEn={`Missing verified claims for ${entity.name}`}
                          titleAr={`بيانات مفقودة لـ ${entity.nameAr || entity.name}`}
                        />
                      </div>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {entity.timelineCount || 0} {isArabic ? "أحداث" : "events"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {entity.relationshipCount || 0} {isArabic ? "علاقات" : "relations"}
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/entities/${entity.id}`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          {isArabic ? "عرض الملف" : "View Profile"}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                      {entity.website && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={entity.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* GAP Tickets Summary */}
        {gapTickets.length > 0 && (
          <Card className="mt-8 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {isArabic ? "فجوات البيانات" : "Data Gaps"}
              </CardTitle>
              <CardDescription className="text-amber-700">
                {isArabic 
                  ? `${gapTickets.length} كيان بدون بيانات موثقة`
                  : `${gapTickets.length} entities without verified data`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {gapTickets.slice(0, 9).map((gap: any) => (
                  <div key={gap.gapId} className="text-sm text-amber-800 bg-white p-2 rounded border border-amber-200">
                    <span className="font-mono text-xs text-amber-600">{gap.gapId}</span>
                    <span className="mx-2">|</span>
                    {isArabic ? gap.titleAr : gap.titleEn}
                  </div>
                ))}
                {gapTickets.length > 9 && (
                  <div className="text-sm text-amber-700 p-2">
                    +{gapTickets.length - 9} {isArabic ? "فجوات أخرى" : "more gaps"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sources Used Panel */}
        <div className="mt-8">
          <SourcesUsedPanel pageKey="entities" />
        </div>
      </div>
    </div>
  );
}
