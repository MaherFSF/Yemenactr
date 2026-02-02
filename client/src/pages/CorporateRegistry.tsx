import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Search,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  FileText,
  ExternalLink,
  AlertCircle,
  Database,
  Info
} from "lucide-react";
import { useState } from "react";
import { SourcesUsedPanel } from "@/components/SourcesUsedPanel";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// GAP Ticket Badge Component
function GapTicketBadge({ gapId, label }: { gapId: string; label: string }) {
  const { language } = useLanguage();
  return (
    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <span className="text-sm text-amber-700">
        {language === "ar" ? "غير متوفر" : "Not available"} | <span className="font-mono">{gapId}</span>
      </span>
    </div>
  );
}

// Evidence-backed KPI Card
function EvidenceKpiCard({ 
  label, 
  value, 
  evidencePackId, 
  source, 
  date,
  gapId 
}: { 
  label: string; 
  value?: string | number; 
  evidencePackId?: string;
  source?: string;
  date?: string;
  gapId: string;
}) {
  const { language } = useLanguage();
  
  // If no evidence pack, show GAP ticket
  if (!evidencePackId || !value) {
    return (
      <Card className="p-4 border-amber-200 bg-amber-50">
        <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
        <GapTicketBadge gapId={gapId} label={label} />
      </Card>
    );
  }
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" title={`Evidence Pack: ${evidencePackId}`}>
      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-emerald-700">{value}</div>
      {source && (
        <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {source} {date && `(${date})`}
        </div>
      )}
      <Badge variant="outline" className="mt-2 text-xs bg-emerald-50 text-emerald-700">
        {language === "ar" ? "موثق" : "Verified"} | {evidencePackId}
      </Badge>
    </Card>
  );
}

export default function CorporateRegistry() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch registry metrics from database
  const { data: metricsData, isLoading: metricsLoading } = trpc.timeSeries.getByIndicator.useQuery({
    indicatorCode: "CORP_REG_TOTAL",
    regimeTag: "aden_irg"
  });

  // Fetch companies from entities table
  const { data: companiesData, isLoading: companiesLoading } = trpc.entities.getWithClaims.useQuery({
    type: "company",
    limit: 20
  });

  // Fetch time series data for registration trends
  const { data: trendsData, isLoading: trendsLoading } = trpc.timeSeries.getByIndicator.useQuery({
    indicatorCode: "CORP_REG_NEW",
    regimeTag: "aden_irg"
  });

  const companies = companiesData?.entities || [];
  const gapTickets = companiesData?.gapTickets || [];

  // Check if we have real data
  const hasRealMetrics = metricsData && metricsData.length > 0;
  const hasRealTrends = trendsData && trendsData.length > 0;
  const hasRealCompanies = companies.length > 0;

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
                {isArabic ? "السجل التجاري" : "Corporate Registry"}
              </h1>
              <p className="text-gray-600">
                {isArabic 
                  ? "بيانات تسجيل الشركات والأعمال في اليمن"
                  : "Business registration data for Yemen"}
              </p>
            </div>
          </div>
          
          {/* Data Source Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  {isArabic ? "مصدر البيانات" : "Data Source Policy"}
                </p>
                <p className="text-sm text-blue-700">
                  {isArabic 
                    ? "جميع الإحصائيات المعروضة مستمدة من قاعدة البيانات الموثقة. البيانات غير المتوفرة تظهر كفجوات بيانات مع معرفات التتبع."
                    : "All statistics shown are sourced from the verified database. Unavailable data is displayed as data gaps with tracking IDs."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {isArabic ? "إحصائيات التسجيل" : "Registration Statistics"}
          </h2>
          
          {metricsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <EvidenceKpiCard
                label={isArabic ? "إجمالي الشركات المسجلة" : "Total Registered Businesses"}
                value={hasRealMetrics ? metricsData[0]?.value : undefined}
                evidencePackId={hasRealMetrics ? String(metricsData[0]?.id) : undefined}
                source={hasRealMetrics ? `Source #${metricsData[0]?.sourceId}` : undefined}
                date={hasRealMetrics ? metricsData[0]?.date?.toISOString().split('-')[0] : undefined}
                gapId="GAP-CORP-001"
              />
              <EvidenceKpiCard
                label={isArabic ? "الشركات النشطة" : "Active Businesses"}
                gapId="GAP-CORP-002"
              />
              <EvidenceKpiCard
                label={isArabic ? "التسجيلات الجديدة (2024)" : "New Registrations (2024)"}
                gapId="GAP-CORP-003"
              />
              <EvidenceKpiCard
                label={isArabic ? "إغلاق الشركات (2024)" : "Business Closures (2024)"}
                gapId="GAP-CORP-004"
              />
            </div>
          )}
        </section>

        {/* Sector Distribution Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "توزيع القطاعات" : "Sector Distribution"}</CardTitle>
              <CardDescription>
                {isArabic ? "توزيع الشركات المسجلة حسب القطاع" : "Distribution of registered businesses by sector"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GapTicketBadge 
                gapId="GAP-CORP-005" 
                label={isArabic ? "بيانات توزيع القطاعات" : "Sector distribution data"} 
              />
              <p className="text-sm text-gray-500 mt-3">
                {isArabic 
                  ? "بيانات توزيع القطاعات غير متوفرة حالياً. يتم جمع البيانات من وزارة الصناعة والتجارة."
                  : "Sector distribution data is currently unavailable. Data is being collected from the Ministry of Industry and Trade."}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Registration Trends Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "اتجاهات التسجيل" : "Registration Trends"}</CardTitle>
              <CardDescription>
                {isArabic ? "التسجيلات الجديدة والإغلاقات بمرور الوقت" : "New registrations and closures over time"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : hasRealTrends ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodEnd" tickFormatter={(val) => val?.split('-')[0]} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name={isArabic ? "القيمة" : "Value"} fill="#2e8b6e" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Badge variant="outline" className="mt-2 text-xs bg-emerald-50 text-emerald-700">
                    {isArabic ? "موثق" : "Verified"} | {trendsData[0]?.id || "DB-SERIES"}
                  </Badge>
                </div>
              ) : (
                <>
                  <GapTicketBadge 
                    gapId="GAP-CORP-006" 
                    label={isArabic ? "بيانات اتجاهات التسجيل" : "Registration trends data"} 
                  />
                  <p className="text-sm text-gray-500 mt-3">
                    {isArabic 
                      ? "بيانات اتجاهات التسجيل التاريخية غير متوفرة. يتم جمع البيانات من السجل التجاري."
                      : "Historical registration trends data is unavailable. Data is being collected from the commercial registry."}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Regional Distribution Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "التوزيع الإقليمي" : "Regional Distribution"}</CardTitle>
              <CardDescription>
                {isArabic ? "توزيع الشركات حسب المنطقة" : "Business distribution by region"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GapTicketBadge 
                gapId="GAP-CORP-007" 
                label={isArabic ? "بيانات التوزيع الإقليمي" : "Regional distribution data"} 
              />
              <p className="text-sm text-gray-500 mt-3">
                {isArabic 
                  ? "بيانات التوزيع الإقليمي غير متوفرة حالياً. يتم جمع البيانات من الغرف التجارية الإقليمية."
                  : "Regional distribution data is currently unavailable. Data is being collected from regional chambers of commerce."}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Major Companies Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "الشركات الرئيسية" : "Major Companies"}</CardTitle>
              <CardDescription>
                {isArabic ? "الشركات المسجلة مع بيانات موثقة" : "Registered companies with verified data"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : hasRealCompanies ? (
                <div className="space-y-4">
                  {companies.map((company: any) => (
                    <div 
                      key={company.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Building2 className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {isArabic ? company.nameAr || company.name : company.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {company.entityType?.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {company.verifiedClaimsCount > 0 ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                            {company.verifiedClaimsCount} {isArabic ? "مطالبات موثقة" : "verified claims"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            GAP-ENTITY-{company.id}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <GapTicketBadge 
                    gapId="GAP-CORP-008" 
                    label={isArabic ? "بيانات الشركات الرئيسية" : "Major companies data"} 
                  />
                  <p className="text-sm text-gray-500 mt-3">
                    {isArabic 
                      ? "لا توجد شركات مسجلة في قاعدة البيانات حالياً. يتم جمع البيانات من السجل التجاري."
                      : "No companies currently registered in the database. Data is being collected from the commercial registry."}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Data Gaps Summary */}
        <section className="mb-8">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {isArabic ? "ملخص فجوات البيانات" : "Data Gaps Summary"}
              </CardTitle>
              <CardDescription className="text-amber-700">
                {isArabic 
                  ? "البيانات التالية غير متوفرة حالياً ويتم جمعها"
                  : "The following data is currently unavailable and being collected"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: "GAP-CORP-001", en: "Total registered businesses count", ar: "إجمالي عدد الشركات المسجلة" },
                  { id: "GAP-CORP-002", en: "Active businesses count", ar: "عدد الشركات النشطة" },
                  { id: "GAP-CORP-003", en: "New registrations 2024", ar: "التسجيلات الجديدة 2024" },
                  { id: "GAP-CORP-004", en: "Business closures 2024", ar: "إغلاق الشركات 2024" },
                  { id: "GAP-CORP-005", en: "Sector distribution percentages", ar: "نسب توزيع القطاعات" },
                  { id: "GAP-CORP-006", en: "Historical registration trends", ar: "اتجاهات التسجيل التاريخية" },
                  { id: "GAP-CORP-007", en: "Regional distribution data", ar: "بيانات التوزيع الإقليمي" },
                ].map((gap) => (
                  <div key={gap.id} className="text-sm text-amber-800 bg-white p-2 rounded border border-amber-200">
                    <span className="font-mono text-xs text-amber-600">{gap.id}</span>
                    <span className="mx-2">|</span>
                    {isArabic ? gap.ar : gap.en}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sources Used Panel */}
        <div className="mt-8">
          <SourcesUsedPanel pageKey="corporate-registry" />
        </div>
      </div>
    </div>
  );
}
