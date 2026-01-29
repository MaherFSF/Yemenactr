/**
 * Updates Page - Public news feed with evidence-backed updates
 */

import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Newspaper, 
  Calendar, 
  Building2, 
  ExternalLink, 
  Search,
  Filter,
  ChevronRight,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileText
} from "lucide-react";

const UPDATE_TYPES = [
  { value: "all", labelEn: "All Types", labelAr: "جميع الأنواع" },
  { value: "policy_announcement", labelEn: "Policy", labelAr: "سياسة" },
  { value: "market_data", labelEn: "Market Data", labelAr: "بيانات السوق" },
  { value: "humanitarian_report", labelEn: "Humanitarian", labelAr: "إنساني" },
  { value: "economic_indicator", labelEn: "Economic", labelAr: "اقتصادي" },
  { value: "conflict_impact", labelEn: "Conflict", labelAr: "نزاع" },
  { value: "aid_announcement", labelEn: "Aid", labelAr: "مساعدات" },
];

const SECTORS = [
  { value: "all", labelEn: "All Sectors", labelAr: "جميع القطاعات" },
  { value: "currency_fx", labelEn: "Currency & FX", labelAr: "العملة والصرف" },
  { value: "trade_commerce", labelEn: "Trade", labelAr: "التجارة" },
  { value: "aid_flows", labelEn: "Aid Flows", labelAr: "تدفقات المساعدات" },
  { value: "prices_costofliving", labelEn: "Prices", labelAr: "الأسعار" },
  { value: "public_finance", labelEn: "Public Finance", labelAr: "المالية العامة" },
  { value: "banking_finance", labelEn: "Banking", labelAr: "البنوك" },
];

export default function Updates() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const [search, setSearch] = useState("");
  const [updateType, setUpdateType] = useState("all");
  const [sector, setSector] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 12;
  
  const { data, isLoading } = trpc.updates.getPublished.useQuery({
    limit: pageSize,
    offset: page * pageSize,
    sector: sector !== "all" ? sector : undefined,
    updateType: updateType !== "all" ? updateType : undefined,
    search: search || undefined,
  });
  
  const updates = data?.updates || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  
  const getConfidenceBadge = (grade: string) => {
    const colors: Record<string, string> = {
      "A": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      "B": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      "C": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      "D": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[grade] || colors["C"];
  };
  
  const getUpdateTypeIcon = (type: string) => {
    switch (type) {
      case "policy_announcement": return <FileText className="h-4 w-4" />;
      case "market_data": return <TrendingUp className="h-4 w-4" />;
      case "humanitarian_report": return <AlertTriangle className="h-4 w-4" />;
      case "economic_indicator": return <TrendingUp className="h-4 w-4" />;
      default: return <Newspaper className="h-4 w-4" />;
    }
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 ${isAr ? "rtl" : "ltr"}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Newspaper className="h-8 w-8" />
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {isAr ? "تحديثات مباشرة" : "Live Updates"}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {isAr ? "آخر التحديثات الاقتصادية" : "Latest Economic Updates"}
            </h1>
            <p className="text-xl text-blue-100">
              {isAr 
                ? "تحديثات موثقة بالأدلة من مصادر موثوقة حول الاقتصاد اليمني"
                : "Evidence-backed updates from verified sources on Yemen's economy"
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="container mx-auto px-4 -mt-8">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isAr ? "البحث في التحديثات..." : "Search updates..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={updateType} onValueChange={setUpdateType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UPDATE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {isAr ? type.labelAr : type.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {isAr ? s.labelAr : s.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Updates Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isAr ? "لا توجد تحديثات" : "No Updates Found"}
            </h3>
            <p className="text-muted-foreground">
              {isAr 
                ? "جرب تغيير معايير البحث أو الفلاتر"
                : "Try adjusting your search or filters"
              }
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {isAr 
                  ? `عرض ${updates.length} من ${total} تحديث`
                  : `Showing ${updates.length} of ${total} updates`
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {updates.map((update) => (
                <Link key={update.id} href={`/updates/${update.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getUpdateTypeIcon(update.updateType || "")}
                          <span className="capitalize">
                            {update.updateType?.replace(/_/g, " ") || "Update"}
                          </span>
                        </div>
                        <Badge className={getConfidenceBadge(update.confidenceGrade || "C")}>
                          {isAr ? `درجة ${update.confidenceGrade}` : `Grade ${update.confidenceGrade}`}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {isAr ? update.titleAr : update.titleEn}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                        {isAr ? update.summaryAr : update.summaryEn}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(update.sectors as string[] || []).slice(0, 2).map((sector) => (
                          <Badge key={sector} variant="outline" className="text-xs">
                            {sector.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{update.sourcePublisher}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {update.publishedAt 
                              ? new Date(update.publishedAt).toLocaleDateString(isAr ? "ar-YE" : "en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  {isAr ? "السابق" : "Previous"}
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  {isAr 
                    ? `صفحة ${page + 1} من ${totalPages}`
                    : `Page ${page + 1} of ${totalPages}`
                  }
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  {isAr ? "التالي" : "Next"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Trust Footer */}
      <div className="bg-slate-100 dark:bg-slate-800/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="font-semibold">
                  {isAr ? "موثق بالأدلة" : "Evidence-Backed"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "كل تحديث مرتبط بمصادره" : "Every update linked to sources"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold">
                  {isAr ? "تحديثات مستمرة" : "Continuously Updated"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "مراقبة يومية للمصادر" : "Daily source monitoring"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Filter className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="font-semibold">
                  {isAr ? "مراجعة تحريرية" : "Editorially Reviewed"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "6 بوابات جودة" : "6-gate quality pipeline"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
