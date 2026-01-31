import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Info,
  Landmark,
  Fuel,
  ShoppingCart,
  Wheat,
  Network,
  Building,
  Plane
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
import DataQualityBadge from "@/components/DataQualityBadge";
import EvidencePackButton from "@/components/EvidencePackButton";

// Complete Entity data with HSA Group subsidiaries
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
    descriptionEn: "Yemen's largest private conglomerate with operations spanning food manufacturing, trading, banking, telecommunications, and real estate. Founded by Hayel Saeed Anam in Taiz in 1938, the group has grown to become a dominant economic force in Yemen and the region, with significant market share across multiple sectors.",
    descriptionAr: "أكبر تكتل خاص في اليمن مع عمليات تشمل تصنيع الأغذية والتجارة والخدمات المصرفية والاتصالات والعقارات. أسسها هائل سعيد أنعم في تعز عام 1938، ونمت المجموعة لتصبح قوة اقتصادية مهيمنة في اليمن والمنطقة، مع حصة سوقية كبيرة عبر قطاعات متعددة.",
    subsidiaries: [
      { 
        id: "ykb",
        nameEn: "Yemen Kuwait Bank", 
        nameAr: "بنك اليمن والكويت", 
        sector: "banking",
        ownership: "Major shareholder",
        descEn: "One of Yemen's largest commercial banks",
        descAr: "أحد أكبر البنوك التجارية في اليمن",
        icon: Banknote
      },
      { 
        id: "hsa-trading",
        nameEn: "HSA Trading Company", 
        nameAr: "شركة هائل سعيد للتجارة", 
        sector: "trading",
        ownership: "100%",
        descEn: "Import/export and distribution",
        descAr: "الاستيراد والتصدير والتوزيع",
        icon: ShoppingCart
      },
      { 
        id: "ycgs",
        nameEn: "Yemen Company for Ghee & Soap (YCGS)", 
        nameAr: "الشركة اليمنية للسمن والصابون", 
        sector: "manufacturing",
        ownership: "100%",
        descEn: "Largest FMCG manufacturer in Yemen",
        descAr: "أكبر مصنع للسلع الاستهلاكية في اليمن",
        icon: Factory
      },
      { 
        id: "nfi",
        nameEn: "National Food Industries", 
        nameAr: "الصناعات الغذائية الوطنية", 
        sector: "food",
        ownership: "100%",
        descEn: "Food processing and packaging",
        descAr: "تصنيع وتعبئة المواد الغذائية",
        icon: Wheat
      },
      { 
        id: "aujan",
        nameEn: "Aujan Industries Yemen", 
        nameAr: "صناعات أوجان اليمن", 
        sector: "beverages",
        ownership: "Joint venture",
        descEn: "Beverage manufacturing (Rani, Barbican)",
        descAr: "تصنيع المشروبات (راني، باربيكان)",
        icon: Factory
      },
      { 
        id: "hsa-real-estate",
        nameEn: "HSA Real Estate", 
        nameAr: "هائل سعيد للعقارات", 
        sector: "real_estate",
        ownership: "100%",
        descEn: "Commercial and residential development",
        descAr: "التطوير التجاري والسكني",
        icon: Building
      },
      { 
        id: "yemen-mobile",
        nameEn: "Yemen Mobile (Y)", 
        nameAr: "يمن موبايل", 
        sector: "telecom",
        ownership: "Minority stake",
        descEn: "Mobile telecommunications",
        descAr: "الاتصالات المتنقلة",
        icon: Smartphone
      },
    ],
    keyIndicators: [
      { labelEn: "Market Share (Food/FMCG)", labelAr: "حصة السوق (الغذاء/السلع الاستهلاكية)", value: "~40%", confidence: "B" },
      { labelEn: "Banking Assets (YKB)", labelAr: "الأصول المصرفية (بنك اليمن والكويت)", value: "YER 850B", confidence: "A" },
      { labelEn: "Annual Import Volume", labelAr: "حجم الاستيراد السنوي", value: "$800M", confidence: "C" },
      { labelEn: "Employment (Direct)", labelAr: "التوظيف (مباشر)", value: "15,000+", confidence: "B" },
      { labelEn: "Distribution Network", labelAr: "شبكة التوزيع", value: "All 22 governorates", confidence: "A" },
    ],
    riskFactors: [
      { en: "Sanctions exposure through banking operations and international transfers", ar: "التعرض للعقوبات من خلال العمليات المصرفية والتحويلات الدولية", severity: "high" },
      { en: "Supply chain disruptions due to ongoing conflict and port blockades", ar: "اضطرابات سلسلة التوريد بسبب الصراع المستمر وحصار الموانئ", severity: "high" },
      { en: "Currency volatility affecting import costs and pricing", ar: "تقلبات العملة التي تؤثر على تكاليف الاستيراد والتسعير", severity: "medium" },
      { en: "Regulatory uncertainty across divided governance structures", ar: "عدم اليقين التنظيمي عبر هياكل الحوكمة المنقسمة", severity: "medium" },
    ],
    timeline: [
      { year: 1938, eventEn: "Founded by Hayel Saeed Anam in Taiz", eventAr: "تأسست على يد هائل سعيد أنعم في تعز" },
      { year: 1971, eventEn: "Established Yemen Company for Ghee & Soap", eventAr: "تأسيس الشركة اليمنية للسمن والصابون" },
      { year: 1979, eventEn: "Became major shareholder in Yemen Kuwait Bank", eventAr: "أصبحت مساهماً رئيسياً في بنك اليمن والكويت" },
      { year: 2000, eventEn: "Expanded into telecommunications sector", eventAr: "التوسع في قطاع الاتصالات" },
      { year: 2015, eventEn: "Operations disrupted by civil war", eventAr: "تعطلت العمليات بسبب الحرب الأهلية" },
      { year: 2020, eventEn: "Adapted supply chains to conflict conditions", eventAr: "تكييف سلاسل التوريد مع ظروف الصراع" },
    ],
    icon: Building2,
    color: "bg-blue-100 text-blue-700",
    featured: true
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
    descriptionEn: "The internationally recognized central bank of Yemen, relocated to Aden in 2016. Responsible for monetary policy, currency issuance, and banking supervision in government-controlled areas. Maintains relationships with international financial institutions.",
    descriptionAr: "البنك المركزي المعترف به دولياً في اليمن، انتقل إلى عدن في 2016. مسؤول عن السياسة النقدية وإصدار العملة والرقابة المصرفية في المناطق الخاضعة لسيطرة الحكومة. يحافظ على العلاقات مع المؤسسات المالية الدولية.",
    subsidiaries: [],
    keyIndicators: [
      { labelEn: "Foreign Reserves", labelAr: "الاحتياطيات الأجنبية", value: "$1.2B (est.)", confidence: "C" },
      { labelEn: "Currency in Circulation", labelAr: "العملة المتداولة", value: "YER 2.8T", confidence: "B" },
      { labelEn: "Licensed Banks", labelAr: "البنوك المرخصة", value: "18", confidence: "A" },
    ],
    riskFactors: [
      { en: "Limited foreign reserves constraining monetary policy", ar: "محدودية الاحتياطيات الأجنبية تقيد السياسة النقدية", severity: "high" },
      { en: "Dual central bank system creating monetary fragmentation", ar: "نظام البنك المركزي المزدوج يخلق تجزئة نقدية", severity: "high" },
    ],
    timeline: [
      { year: 1971, eventEn: "Central Bank of Yemen established in Sana'a", eventAr: "تأسيس البنك المركزي اليمني في صنعاء" },
      { year: 2016, eventEn: "Headquarters relocated to Aden by presidential decree", eventAr: "نقل المقر الرئيسي إلى عدن بمرسوم رئاسي" },
      { year: 2018, eventEn: "Saudi deposit of $2B to stabilize currency", eventAr: "وديعة سعودية بقيمة 2 مليار دولار لتثبيت العملة" },
    ],
    icon: Landmark,
    color: "bg-green-100 text-green-700",
    featured: true
  },
  {
    id: "cby-sanaa",
    nameEn: "Central Bank of Yemen (Sana'a)",
    nameAr: "البنك المركزي اليمني (صنعاء)",
    typeEn: "Central Bank (De facto)",
    typeAr: "بنك مركزي (بحكم الأمر الواقع)",
    sectorEn: "Banking & Finance",
    sectorAr: "القطاع المصرفي والمالي",
    foundedYear: 1971,
    headquarters: "Sana'a",
    employeesEn: "3,000+",
    employeesAr: "3,000+",
    revenueEn: "N/A",
    revenueAr: "غير متاح",
    descriptionEn: "The de facto central bank operating in Houthi-controlled areas. Continues to operate from the original headquarters in Sana'a. Issues currency and manages banking operations in northern Yemen, though not internationally recognized.",
    descriptionAr: "البنك المركزي بحكم الأمر الواقع العامل في المناطق الخاضعة لسيطرة الحوثيين. يواصل العمل من المقر الأصلي في صنعاء. يصدر العملة ويدير العمليات المصرفية في شمال اليمن، رغم عدم الاعتراف الدولي.",
    subsidiaries: [],
    keyIndicators: [
      { labelEn: "Old Currency Notes", labelAr: "الأوراق النقدية القديمة", value: "Only pre-2017 accepted", confidence: "A" },
      { labelEn: "Exchange Rate (unofficial)", labelAr: "سعر الصرف (غير رسمي)", value: "YER 530/USD", confidence: "B" },
    ],
    riskFactors: [
      { en: "International isolation and sanctions risk", ar: "العزلة الدولية ومخاطر العقوبات", severity: "high" },
      { en: "Currency fragmentation with Aden-issued notes", ar: "تجزئة العملة مع الأوراق النقدية الصادرة من عدن", severity: "high" },
    ],
    timeline: [
      { year: 2016, eventEn: "Split from Aden branch after government relocation", eventAr: "الانفصال عن فرع عدن بعد انتقال الحكومة" },
      { year: 2019, eventEn: "Banned new currency notes issued by Aden CBY", eventAr: "حظر الأوراق النقدية الجديدة الصادرة من البنك المركزي في عدن" },
    ],
    icon: Landmark,
    color: "bg-red-100 text-red-700",
    featured: true
  },
  {
    id: "aden-port",
    nameEn: "Aden Container Terminal",
    nameAr: "محطة حاويات عدن",
    typeEn: "Port Authority",
    typeAr: "هيئة ميناء",
    sectorEn: "Logistics & Trade",
    sectorAr: "الخدمات اللوجستية والتجارة",
    foundedYear: 1999,
    headquarters: "Aden",
    employeesEn: "1,500+",
    employeesAr: "1,500+",
    revenueEn: "$150M (est.)",
    revenueAr: "150 مليون دولار (تقدير)",
    descriptionEn: "Yemen's primary container port, strategically located at the entrance to the Red Sea. Operated by DP World until 2012, now under government management. Critical for humanitarian aid and commercial imports.",
    descriptionAr: "الميناء الرئيسي للحاويات في اليمن، يقع استراتيجياً عند مدخل البحر الأحمر. كان يديره موانئ دبي العالمية حتى 2012، والآن تحت إدارة الحكومة. حيوي للمساعدات الإنسانية والواردات التجارية.",
    subsidiaries: [],
    keyIndicators: [
      { labelEn: "Container Throughput", labelAr: "حركة الحاويات", value: "450,000 TEU/yr", confidence: "B" },
      { labelEn: "Vessel Calls", labelAr: "رسو السفن", value: "~800/yr", confidence: "B" },
    ],
    riskFactors: [
      { en: "Security concerns affecting shipping insurance", ar: "مخاوف أمنية تؤثر على تأمين الشحن", severity: "high" },
      { en: "Infrastructure damage from conflict", ar: "أضرار البنية التحتية من الصراع", severity: "medium" },
    ],
    timeline: [],
    icon: Ship,
    color: "bg-cyan-100 text-cyan-700",
    featured: false
  },
  {
    id: "yemen-mobile",
    nameEn: "Yemen Mobile (Y)",
    nameAr: "يمن موبايل",
    typeEn: "Telecommunications",
    typeAr: "اتصالات",
    sectorEn: "Telecommunications",
    sectorAr: "الاتصالات",
    foundedYear: 2004,
    headquarters: "Sana'a",
    employeesEn: "2,500+",
    employeesAr: "2,500+",
    revenueEn: "$300M (est.)",
    revenueAr: "300 مليون دولار (تقدير)",
    descriptionEn: "One of Yemen's major mobile network operators, providing GSM and 3G services. Operates primarily in northern Yemen with significant market share.",
    descriptionAr: "أحد مشغلي شبكات الهاتف المحمول الرئيسيين في اليمن، يوفر خدمات GSM و3G. يعمل بشكل رئيسي في شمال اليمن مع حصة سوقية كبيرة.",
    subsidiaries: [],
    keyIndicators: [
      { labelEn: "Subscribers", labelAr: "المشتركون", value: "5M+", confidence: "C" },
      { labelEn: "Network Coverage", labelAr: "تغطية الشبكة", value: "~60% population", confidence: "C" },
    ],
    riskFactors: [
      { en: "Infrastructure damage from airstrikes", ar: "أضرار البنية التحتية من الغارات الجوية", severity: "high" },
      { en: "Fuel shortages affecting tower operations", ar: "نقص الوقود يؤثر على تشغيل الأبراج", severity: "medium" },
    ],
    timeline: [],
    icon: Smartphone,
    color: "bg-purple-100 text-purple-700",
    featured: false
  },
  {
    id: "safer-oil",
    nameEn: "Safer Exploration & Production",
    nameAr: "صافر للاستكشاف والإنتاج",
    typeEn: "Oil & Gas",
    typeAr: "النفط والغاز",
    sectorEn: "Energy",
    sectorAr: "الطاقة",
    foundedYear: 1997,
    headquarters: "Sana'a",
    employeesEn: "1,000+",
    employeesAr: "1,000+",
    revenueEn: "Minimal (operations suspended)",
    revenueAr: "الحد الأدنى (العمليات معلقة)",
    descriptionEn: "Yemen's national oil company responsible for exploration and production. Operations largely suspended since 2015 due to conflict. The Safer FSO tanker remains a major environmental concern.",
    descriptionAr: "شركة النفط الوطنية اليمنية المسؤولة عن الاستكشاف والإنتاج. العمليات معلقة إلى حد كبير منذ 2015 بسبب الصراع. تظل ناقلة صافر العائمة مصدر قلق بيئي كبير.",
    subsidiaries: [],
    keyIndicators: [
      { labelEn: "Pre-war Production", labelAr: "الإنتاج قبل الحرب", value: "125,000 bpd", confidence: "A" },
      { labelEn: "Current Production", labelAr: "الإنتاج الحالي", value: "<15,000 bpd", confidence: "C" },
    ],
    riskFactors: [
      { en: "Safer FSO environmental disaster risk", ar: "خطر كارثة بيئية من ناقلة صافر العائمة", severity: "critical" },
      { en: "Infrastructure damage and looting", ar: "أضرار البنية التحتية والنهب", severity: "high" },
    ],
    timeline: [],
    icon: Fuel,
    color: "bg-orange-100 text-orange-700",
    featured: false
  },
];

// Entity type filters
const entityTypes = [
  { value: "all", labelEn: "All Types", labelAr: "جميع الأنواع" },
  { value: "conglomerate", labelEn: "Conglomerates", labelAr: "التكتلات" },
  { value: "bank", labelEn: "Banks", labelAr: "البنوك" },
  { value: "port", labelEn: "Ports & Logistics", labelAr: "الموانئ والخدمات اللوجستية" },
  { value: "telecom", labelEn: "Telecommunications", labelAr: "الاتصالات" },
  { value: "energy", labelEn: "Energy", labelAr: "الطاقة" },
];

export default function Entities() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  // Filter entities
  const filteredEntities = entities.filter(entity => {
    const matchesSearch = 
      entity.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.nameAr.includes(searchQuery) ||
      entity.sectorEn.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "all" || 
      entity.typeEn.toLowerCase().includes(selectedType) ||
      entity.sectorEn.toLowerCase().includes(selectedType);
    
    return matchesSearch && matchesType;
  });

  const featuredEntities = filteredEntities.filter(e => e.featured);
  const otherEntities = filteredEntities.filter(e => !e.featured);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir={isArabic ? "rtl" : "ltr"}>


      {/* Header */}
      <div className="bg-[#768064] text-white py-12">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <Network className="h-10 w-10" />
            <h1 className="text-3xl font-bold">
              {isArabic ? "ملفات الكيانات" : "Entity Profiles"}
            </h1>
          </div>
          <p className="text-white/80 max-w-2xl">
            {isArabic 
              ? "استكشف الملفات الشاملة للكيانات الاقتصادية الرئيسية في اليمن، بما في ذلك التكتلات التجارية والبنوك المركزية والبنية التحتية الحيوية."
              : "Explore comprehensive profiles of key economic entities in Yemen, including commercial conglomerates, central banks, and critical infrastructure."}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="container py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={isArabic ? "البحث عن كيان..." : "Search entities..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={isArabic ? "نوع الكيان" : "Entity Type"} />
            </SelectTrigger>
            <SelectContent>
              {entityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {isArabic ? type.labelAr : type.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Featured Entities */}
        {featuredEntities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#768064] dark:text-white mb-4">
              {isArabic ? "الكيانات الرئيسية" : "Key Entities"}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredEntities.map((entity) => (
                <Card key={entity.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${entity.color}`}>
                        <entity.icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        <DataQualityBadge quality="verified" size="sm" />
                        <Badge variant="outline">
                          {isArabic ? entity.typeAr : entity.typeEn}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="mt-4 group-hover:text-[#4C583E] transition-colors">
                      {isArabic ? entity.nameAr : entity.nameEn}
                    </CardTitle>
                    <CardDescription>
                      {isArabic ? entity.sectorAr : entity.sectorEn} • {entity.headquarters}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                      {isArabic ? entity.descriptionAr : entity.descriptionEn}
                    </p>
                    
                    {/* Key Indicators Preview */}
                    <div className="space-y-2 mb-4">
                      {entity.keyIndicators.slice(0, 2).map((indicator, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {isArabic ? indicator.labelAr : indicator.labelEn}
                          </span>
                          <span className="font-medium">{indicator.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Risk Factors Preview */}
                    {entity.riskFactors.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-amber-600 mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{entity.riskFactors.length} {isArabic ? "عوامل خطر" : "risk factors"}</span>
                      </div>
                    )}

                    <Link href={`/entities/${entity.id}`}>
                      <Button variant="outline" className="w-full group-hover:bg-[#4C583E] group-hover:text-white transition-colors">
                        {isArabic ? "عرض الملف الكامل" : "View Full Profile"}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Entities */}
        {otherEntities.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#768064] dark:text-white mb-4">
              {isArabic ? "كيانات أخرى" : "Other Entities"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherEntities.map((entity) => (
                <Card key={entity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${entity.color}`}>
                        <entity.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium">
                            {isArabic ? entity.nameAr : entity.nameEn}
                          </h3>
                          <DataQualityBadge quality="verified" size="sm" />
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {isArabic ? entity.sectorAr : entity.sectorEn}
                        </p>
                        <Link href={`/entities/${entity.id}`}>
                          <Button variant="ghost" size="sm" className="p-0 h-auto text-[#4C583E]">
                            {isArabic ? "عرض الملف" : "View Profile"}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredEntities.length === 0 && (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {isArabic ? "لم يتم العثور على كيانات" : "No entities found"}
            </h3>
            <p className="text-gray-500">
              {isArabic 
                ? "جرب تعديل معايير البحث أو الفلتر"
                : "Try adjusting your search or filter criteria"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
