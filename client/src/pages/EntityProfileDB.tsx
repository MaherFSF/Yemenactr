import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Banknote, 
  ArrowLeft,
  ExternalLink,
  Globe,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2
} from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import EvidencePackButton from "@/components/EvidencePackButton";

// Entity type icons mapping
const entityTypeIcons: Record<string, any> = {
  central_bank: Banknote,
  commercial_bank: Banknote,
  government_ministry: Building2,
  ngo: Building2,
  private_company: Building2,
  state_enterprise: Building2,
  international_org: Globe,
  default: Building2
};

export default function EntityProfileDB() {
  const { language } = useLanguage();
  const params = useParams();
  const entityId = parseInt(params.id as string, 10);
  
  // Fetch entity from database
  const { data: entity, isLoading, error } = trpc.entities.getById.useQuery(
    { id: entityId },
    { enabled: !isNaN(entityId) }
  );
  
  // Fetch entity claims
  const { data: claims } = trpc.entities.getVerifiedClaims.useQuery(
    { entityId },
    { enabled: !isNaN(entityId) && !!entity }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-[#2e8b6e] mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {language === "ar" ? "الكيان غير موجود" : "Entity Not Found"}
          </h2>
          <p className="text-gray-500 mb-4">
            {language === "ar" 
              ? `لم يتم العثور على الكيان رقم ${entityId}` 
              : `Entity ID ${entityId} not found in database`}
          </p>
          <Link href="/entities">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === "ar" ? "العودة للكيانات" : "Back to Entities"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = entityTypeIcons[entity.entityType] || entityTypeIcons.default;
  const entityName = language === "ar" ? entity.nameAr : entity.name;
  const entityDescription = language === "ar" ? entity.descriptionAr : entity.description;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-[#2e8b6e] text-white py-8">
        <div className="container">
          <Link href="/entities">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 mb-4">
              <ArrowLeft className={`h-4 w-4 mr-2 ${language === 'ar' ? 'rotate-180' : ''}`} />
              {language === "ar" ? "العودة للكيانات" : "Back to Entities"}
            </Button>
          </Link>
          
          <div className={`flex items-start gap-6 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
            <div className="p-4 rounded-xl bg-white/20">
              <IconComponent className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {entityName}
                </h1>
                {entity.acronym && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    {entity.acronym}
                  </Badge>
                )}
                <Badge className={`${entity.status === 'active' ? 'bg-green-500/20 text-green-100' : 'bg-yellow-500/20 text-yellow-100'}`}>
                  {entity.status === 'active' 
                    ? (language === "ar" ? "نشط" : "Active")
                    : (language === "ar" ? "غير نشط" : "Inactive")}
                </Badge>
              </div>
              <p className="text-white/80 mb-2">
                {entity.entityType?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </p>
              {entity.headquarters && (
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <MapPin className="h-4 w-4" />
                  {entity.headquarters}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {entityDescription && (
              <Card>
                <CardHeader>
                  <CardTitle className={language === 'ar' ? 'text-right' : ''}>
                    {language === "ar" ? "نبذة عن الكيان" : "About"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-gray-600 dark:text-gray-400 leading-relaxed ${language === 'ar' ? 'text-right' : ''}`}>
                    {entityDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Verified Claims */}
            {claims && claims.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    {language === "ar" ? "البيانات الموثقة" : "Verified Data"}
                    <Badge variant="secondary">{claims.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {claims.map((claim: any) => (
                      <div 
                        key={claim.id} 
                        className={`p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 ${language === 'ar' ? 'text-right' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {claim.claim_type}
                              </Badge>
                              <Badge 
                                className={`text-xs ${
                                  claim.confidence_grade === 'A' ? 'bg-green-100 text-green-700' :
                                  claim.confidence_grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                Grade {claim.confidence_grade}
                              </Badge>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {typeof claim.claim_object === 'object' 
                                ? claim.claim_object.description || JSON.stringify(claim.claim_object)
                                : claim.claim_object}
                            </p>
                            {claim.claim_object?.value && (
                              <p className="text-lg font-bold text-[#2e8b6e] mt-1">
                                {claim.claim_object.value} {claim.claim_object.unit}
                              </p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">
                              {language === "ar" ? "المصدر:" : "Source:"} {claim.source_name}
                            </p>
                          </div>
                          <EvidencePackButton
                            subjectType="claim"
                            subjectId={claim.claim_id}
                            variant="compact"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Claims State */}
            {(!claims || claims.length === 0) && (
              <Card>
                <CardContent className="py-12">
                  <div className={`text-center ${language === 'ar' ? 'text-right' : ''}`}>
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {language === "ar" ? "لا توجد بيانات موثقة" : "No Verified Data Available"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {language === "ar" 
                        ? "لم يتم التحقق من أي بيانات لهذا الكيان بعد"
                        : "No verified claims have been added for this entity yet"}
                    </p>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                      GAP-ENTITY-{entityId}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <Card>
              <CardHeader>
                <CardTitle className={language === 'ar' ? 'text-right' : ''}>
                  {language === "ar" ? "معلومات سريعة" : "Quick Facts"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {entity.establishedDate && (
                  <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div className={language === 'ar' ? 'text-right' : ''}>
                      <p className="text-sm text-gray-500">
                        {language === "ar" ? "تاريخ التأسيس" : "Established"}
                      </p>
                      <p className="font-medium">
                        {new Date(entity.establishedDate).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
                
                {entity.website && (
                  <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <Globe className="h-5 w-5 text-gray-400" />
                    <div className={language === 'ar' ? 'text-right' : ''}>
                      <p className="text-sm text-gray-500">
                        {language === "ar" ? "الموقع الإلكتروني" : "Website"}
                      </p>
                      <a 
                        href={entity.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-[#2e8b6e] hover:underline flex items-center gap-1"
                      >
                        {entity.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                {entity.regimeTag && (
                  <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div className={language === 'ar' ? 'text-right' : ''}>
                      <p className="text-sm text-gray-500">
                        {language === "ar" ? "السلطة" : "Authority"}
                      </p>
                      <Badge variant="outline">
                        {entity.regimeTag === 'aden_irg' ? (language === "ar" ? "الحكومة الشرعية" : "IRG (Aden)") :
                         entity.regimeTag === 'sanaa_defacto' ? (language === "ar" ? "سلطة صنعاء" : "De Facto (Sanaa)") :
                         entity.regimeTag}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evidence Summary */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                  <FileText className="h-5 w-5" />
                  {language === "ar" ? "ملخص الأدلة" : "Evidence Summary"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`flex justify-between items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm text-gray-500">
                      {language === "ar" ? "المطالبات الموثقة" : "Verified Claims"}
                    </span>
                    <Badge variant="secondary">{claims?.length || 0}</Badge>
                  </div>
                  <div className={`flex justify-between items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm text-gray-500">
                      {language === "ar" ? "حزم الأدلة" : "Evidence Packs"}
                    </span>
                    <Badge variant="secondary">{claims?.length || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
