import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Banknote, 
  Ship, 
  Smartphone, 
  Factory,
  Search,
  Filter,
  ExternalLink,
  Users,
  Globe,
  TrendingUp,
  AlertTriangle,
  FileText,
  ChevronRight,
  Info
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Entity data
const entities = [
  {
    id: "hsa-group",
    nameEn: "Hayel Saeed Anam Group (HSA)",
    nameAr: "مجموعة هائل سعيد أنعم",
    typeEn: "Commercial Conglomerate",
    typeAr: "تكتل تجاري",
    sectorEn: "Multi-sector",
    sectorAr: "متعدد القطاعات",
    foundedYear: 1938,
    headquarters: "Taiz / Aden",
    employeesEn: "15,000+",
    employeesAr: "15,000+",
    revenueEn: "$2.5B+ (est.)",
    revenueAr: "2.5+ مليار دولار (تقدير)",
    descriptionEn: "Yemen's largest private conglomerate with operations spanning food manufacturing, trading, banking, telecommunications, and real estate. Founded by Hayel Saeed Anam in Taiz, the group has grown to become a dominant economic force in Yemen and the region.",
    descriptionAr: "أكبر تكتل خاص في اليمن مع عمليات تشمل تصنيع الأغذية والتجارة والخدمات المصرفية والاتصالات والعقارات. أسسها هائل سعيد أنعم في تعز، ونمت المجموعة لتصبح قوة اقتصادية مهيمنة في اليمن والمنطقة.",
    subsidiaries: [
      { nameEn: "Yemen Kuwait Bank", nameAr: "بنك اليمن والكويت", sector: "banking" },
      { nameEn: "HSA Trading", nameAr: "هائل سعيد للتجارة", sector: "trading" },
      { nameEn: "Aujan Industries", nameAr: "صناعات أوجان", sector: "manufacturing" },
      { nameEn: "National Food Industries", nameAr: "الصناعات الغذائية الوطنية", sector: "food" },
    ],
    keyIndicators: [
      { labelEn: "Market Share (Food)", labelAr: "حصة السوق (الغذاء)", value: "~40%" },
      { labelEn: "Banking Assets", labelAr: "أصول مصرفية", value: "YER 850B" },
      { labelEn: "Import Volume", labelAr: "حجم الاستيراد", value: "$800M/yr" },
    ],
    riskFactors: [
      { en: "Sanctions exposure through banking operations", ar: "التعرض للعقوبات من خلال العمليات المصرفية" },
      { en: "Supply chain disruptions due to conflict", ar: "اضطرابات سلسلة التوريد بسبب الصراع" },
    ],
    icon: Building2,
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: "cby-aden",
    nameEn: "Central Bank of Yemen (Aden)",
    nameAr: "البنك المركزي اليمني (عدن)",
    typeEn: "Central Bank",
    typeAr: "بنك مركزي",
    sectorEn: "Banking & Finance",
    sectorAr: "القطاع المصرفي والمالي",
    foundedYear: 1971,
    headquarters: "Aden",
    employeesEn: "2,000+",
    employeesAr: "2,000+",
    revenueEn: "N/A",
    revenueAr: "غير متاح",
    descriptionEn: "The internationally recognized central bank of Yemen, relocated to Aden in 2016. Responsible for monetary policy, currency issuance, and banking supervision in government-controlled areas.",
    descriptionAr: "البنك المركزي المعترف به دولياً في اليمن، انتقل إلى عدن في 2016. مسؤول عن السياسة النقدية وإصدار العملة والرقابة المصرفية في المناطق الخاضعة للحكومة.",
    subsidiaries: [],
    keyIndicators: [
      { labelEn: "Foreign Reserves", labelAr: "الاحتياطيات الأجنبية", value: "$1.2B" },
      { labelEn: "Exchange Rate", labelAr: "سعر الصرف", value: "2,070 YER/USD" },
      { labelEn: "Money Supply (M2)", labelAr: "عرض النقود (M2)", value: "YER 7.2T" },
    ],
    riskFactors: [
      { en: "Limited foreign reserves", ar: "احتياطيات أجنبية محدودة" },
      { en: "Currency depreciation pressure", ar: "ضغوط انخفاض قيمة العملة" },
    ],
    icon: Banknote,
    color: "bg-green-100 text-green-700"
  },
  {
    id: "cby-sanaa",
    nameEn: "Central Bank of Yemen (Sana'a)",
    nameAr: "البنك المركزي اليمني (صنعاء)",
    typeEn: "Central Bank (De facto)",
    typeAr: "بنك مركزي (فعلي)",
    sectorEn: "Banking & Finance",
    sectorAr: "القطاع المصرفي والمالي",
    foundedYear: 1971,
    headquarters: "Sana'a",
    employeesEn: "3,000+",
    employeesAr: "3,000+",
    revenueEn: "N/A",
    revenueAr: "غير متاح",
    descriptionEn: "The de facto central bank operating in Houthi-controlled areas. Maintains separate monetary policy and has issued currency notes not recognized by the Aden-based CBY.",
    descriptionAr: "البنك المركزي الفعلي العامل في المناطق الخاضعة للحوثيين. يحافظ على سياسة نقدية منفصلة وأصدر أوراق نقدية غير معترف بها من قبل البنك المركزي في عدن.",
    subsidiaries: [],
    keyIndicators: [
      { labelEn: "Exchange Rate", labelAr: "سعر الصرف", value: "535 YER/USD" },
      { labelEn: "Currency Control", labelAr: "التحكم بالعملة", value: "Strict" },
      { labelEn: "Banking Licenses", labelAr: "تراخيص مصرفية", value: "18 banks" },
    ],
    riskFactors: [
      { en: "International sanctions risk", ar: "مخاطر العقوبات الدولية" },
      { en: "Limited international recognition", ar: "اعتراف دولي محدود" },
    ],
    icon: Banknote,
    color: "bg-amber-100 text-amber-700"
  },
  {
    id: "aden-port",
    nameEn: "Aden Container Terminal",
    nameAr: "محطة حاويات عدن",
    typeEn: "Port Operator",
    typeAr: "مشغل ميناء",
    sectorEn: "Logistics & Trade",
    sectorAr: "اللوجستيات والتجارة",
    foundedYear: 1999,
    headquarters: "Aden",
    employeesEn: "1,500+",
    employeesAr: "1,500+",
    revenueEn: "$150M (est.)",
    revenueAr: "150 مليون دولار (تقدير)",
    descriptionEn: "Yemen's primary container port, handling the majority of the country's imports. Critical infrastructure for humanitarian aid delivery and commercial trade.",
    descriptionAr: "ميناء الحاويات الرئيسي في اليمن، يتعامل مع غالبية واردات البلاد. بنية تحتية حيوية لتوصيل المساعدات الإنسانية والتجارة التجارية.",
    subsidiaries: [],
    keyIndicators: [
      { labelEn: "Container Throughput", labelAr: "إنتاجية الحاويات", value: "450K TEU/yr" },
      { labelEn: "Import Share", labelAr: "حصة الاستيراد", value: "~60%" },
      { labelEn: "Capacity Utilization", labelAr: "استخدام الطاقة", value: "75%" },
    ],
    riskFactors: [
      { en: "Security threats from conflict", ar: "تهديدات أمنية من الصراع" },
      { en: "Infrastructure damage", ar: "أضرار البنية التحتية" },
    ],
    icon: Ship,
    color: "bg-cyan-100 text-cyan-700"
  },
  {
    id: "yemenmobile",
    nameEn: "Yemen Mobile (TeleYemen)",
    nameAr: "يمن موبايل (تيليمن)",
    typeEn: "Telecommunications",
    typeAr: "اتصالات",
    sectorEn: "Telecommunications",
    sectorAr: "الاتصالات",
    foundedYear: 2000,
    headquarters: "Sana'a",
    employeesEn: "3,000+",
    employeesAr: "3,000+",
    revenueEn: "$400M (est.)",
    revenueAr: "400 مليون دولار (تقدير)",
    descriptionEn: "State-owned telecommunications company providing mobile and fixed-line services across Yemen. Operates under Houthi control in northern areas.",
    descriptionAr: "شركة اتصالات مملوكة للدولة تقدم خدمات الهاتف المحمول والثابت في جميع أنحاء اليمن. تعمل تحت سيطرة الحوثيين في المناطق الشمالية.",
    subsidiaries: [],
    keyIndicators: [
      { labelEn: "Subscribers", labelAr: "المشتركون", value: "12M+" },
      { labelEn: "Network Coverage", labelAr: "تغطية الشبكة", value: "85%" },
      { labelEn: "Market Share", labelAr: "حصة السوق", value: "~55%" },
    ],
    riskFactors: [
      { en: "Infrastructure damage from conflict", ar: "أضرار البنية التحتية من الصراع" },
      { en: "Regulatory uncertainty", ar: "عدم اليقين التنظيمي" },
    ],
    icon: Smartphone,
    color: "bg-purple-100 text-purple-700"
  },
];

// Entity types for filtering
const entityTypes = [
  { valueEn: "all", valueAr: "الكل", labelEn: "All Types", labelAr: "جميع الأنواع" },
  { valueEn: "conglomerate", valueAr: "تكتل", labelEn: "Conglomerates", labelAr: "التكتلات" },
  { valueEn: "bank", valueAr: "بنك", labelEn: "Banks", labelAr: "البنوك" },
  { valueEn: "port", valueAr: "ميناء", labelEn: "Ports & Logistics", labelAr: "الموانئ واللوجستيات" },
  { valueEn: "telecom", valueAr: "اتصالات", labelEn: "Telecommunications", labelAr: "الاتصالات" },
];

export default function Entities() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = 
      entity.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.nameAr.includes(searchQuery);
    const matchesType = selectedType === "all" || 
      entity.typeEn.toLowerCase().includes(selectedType.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-[#103050] text-white py-12">
        <div className="container">
          <div className={`${language === 'ar' ? 'text-right' : ''}`}>
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              {language === "ar" ? "ملفات الكيانات" : "Entity Profiles"}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {language === "ar" 
                ? "الكيانات الاقتصادية الرئيسية في اليمن"
                : "Key Economic Entities in Yemen"}
            </h1>
            <p className="text-white/80 max-w-3xl">
              {language === "ar"
                ? "ملفات تعريفية شاملة للشركات والمؤسسات والجهات الفاعلة الرئيسية في الاقتصاد اليمني، بما في ذلك هياكل الملكية والمؤشرات الرئيسية وعوامل المخاطر."
                : "Comprehensive profiles of major companies, institutions, and key actors in Yemen's economy, including ownership structures, key indicators, and risk factors."}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 border-b py-4">
        <div className="container">
          <div className={`flex flex-wrap items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex-1 min-w-[250px]">
              <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={language === "ar" ? "البحث عن كيان..." : "Search entities..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${language === 'ar' ? 'pr-10 text-right' : 'pl-10'}`}
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map((type) => (
                  <SelectItem key={type.valueEn} value={type.valueEn}>
                    {language === "ar" ? type.labelAr : type.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Entity Grid */}
      <div className="container py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntities.map((entity) => (
            <Card 
              key={entity.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setLocation(`/entities/${entity.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${entity.color}`}>
                    <entity.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {language === "ar" ? entity.typeAr : entity.typeEn}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3 group-hover:text-[#107040] transition-colors">
                  {language === "ar" ? entity.nameAr : entity.nameEn}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {language === "ar" ? entity.sectorAr : entity.sectorEn}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                  {language === "ar" ? entity.descriptionAr : entity.descriptionEn}
                </p>
                
                {/* Key Indicators Preview */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {entity.keyIndicators.slice(0, 2).map((indicator, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? indicator.labelAr : indicator.labelEn}
                      </div>
                      <div className="font-semibold text-[#103050] dark:text-white">
                        {indicator.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Risk Indicator */}
                {entity.riskFactors.length > 0 && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{entity.riskFactors.length} {language === "ar" ? "عوامل خطر" : "risk factors"}</span>
                  </div>
                )}

                <Button variant="ghost" className="w-full mt-4 group-hover:bg-[#107040]/10 group-hover:text-[#107040]">
                  {language === "ar" ? "عرض الملف الكامل" : "View Full Profile"}
                  <ChevronRight className={`h-4 w-4 ml-2 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEntities.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {language === "ar" ? "لم يتم العثور على كيانات" : "No entities found"}
            </h3>
            <p className="text-gray-500">
              {language === "ar" 
                ? "جرب تعديل معايير البحث أو الفلتر"
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white dark:bg-gray-900 border-t py-12">
        <div className="container">
          <Card className="bg-[#103050]/5 border-[#103050]/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Info className="h-6 w-6 text-[#103050] mt-1" />
                <div>
                  <h3 className="font-semibold text-[#103050] dark:text-white mb-2">
                    {language === "ar" ? "حول ملفات الكيانات" : "About Entity Profiles"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === "ar"
                      ? "تم تجميع ملفات الكيانات من مصادر متعددة بما في ذلك السجلات الحكومية والتقارير المالية والمصادر المفتوحة. يتم تحديث المعلومات بشكل دوري ويتم التحقق منها من خلال منهجية YETO للتحقق من البيانات."
                      : "Entity profiles are compiled from multiple sources including government registries, financial reports, and open sources. Information is updated periodically and verified through YETO's data verification methodology."}
                  </p>
                  <Button variant="link" className="text-[#107040] p-0 h-auto mt-2">
                    {language === "ar" ? "عرض المنهجية" : "View Methodology"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
