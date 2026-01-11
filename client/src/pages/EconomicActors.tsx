import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Network, 
  Building2,
  Users,
  Globe,
  FileText,
  AlertTriangle,
  Search,
  ExternalLink,
  Shield,
  Landmark,
  Factory,
  Ship
} from "lucide-react";
import { useState } from "react";

export default function EconomicActors() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  // Key economic actors
  const actors = [
    // Government Entities
    {
      id: "cby-aden",
      nameEn: "Central Bank of Yemen - Aden",
      nameAr: "البنك المركزي اليمني - عدن",
      category: "government",
      categoryEn: "Government",
      categoryAr: "حكومي",
      regime: "IRG",
      descriptionEn: "Official central bank recognized by international community. Manages monetary policy for IRG-controlled areas.",
      descriptionAr: "البنك المركزي الرسمي المعترف به دولياً. يدير السياسة النقدية في المناطق الخاضعة للحكومة.",
      keyFunctions: ["Monetary Policy", "Currency Issuance", "Banking Supervision"],
      keyFunctionsAr: ["السياسة النقدية", "إصدار العملة", "الرقابة المصرفية"],
      sanctioned: false
    },
    {
      id: "cby-sanaa",
      nameEn: "Central Bank of Yemen - Sana'a",
      nameAr: "البنك المركزي اليمني - صنعاء",
      category: "government",
      categoryEn: "Government",
      categoryAr: "حكومي",
      regime: "DFA",
      descriptionEn: "De facto central bank in Ansar Allah-controlled areas. Not recognized internationally.",
      descriptionAr: "البنك المركزي الفعلي في المناطق الخاضعة لأنصار الله. غير معترف به دولياً.",
      keyFunctions: ["Monetary Policy (North)", "Banking Oversight", "Currency Control"],
      keyFunctionsAr: ["السياسة النقدية (الشمال)", "الرقابة المصرفية", "التحكم بالعملة"],
      sanctioned: false
    },
    {
      id: "mof-irg",
      nameEn: "Ministry of Finance - IRG",
      nameAr: "وزارة المالية - الحكومة",
      category: "government",
      categoryEn: "Government",
      categoryAr: "حكومي",
      regime: "IRG",
      descriptionEn: "Manages government budget, revenue collection, and fiscal policy for recognized government.",
      descriptionAr: "تدير الميزانية الحكومية وتحصيل الإيرادات والسياسة المالية للحكومة المعترف بها.",
      keyFunctions: ["Budget Management", "Revenue Collection", "Public Debt"],
      keyFunctionsAr: ["إدارة الميزانية", "تحصيل الإيرادات", "الدين العام"],
      sanctioned: false
    },
    // Commercial Banks
    {
      id: "kuraimi",
      nameEn: "Al-Kuraimi Islamic Microfinance Bank",
      nameAr: "بنك الكريمي الإسلامي للتمويل الأصغر",
      category: "banking",
      categoryEn: "Banking",
      categoryAr: "مصرفي",
      regime: "Both",
      descriptionEn: "Largest microfinance bank in Yemen. Operates across both zones. Key remittance channel.",
      descriptionAr: "أكبر بنك للتمويل الأصغر في اليمن. يعمل في كلا المنطقتين. قناة رئيسية للتحويلات.",
      keyFunctions: ["Microfinance", "Remittances", "Mobile Banking"],
      keyFunctionsAr: ["التمويل الأصغر", "التحويلات", "الخدمات المصرفية عبر الهاتف"],
      sanctioned: false
    },
    {
      id: "cac-bank",
      nameEn: "CAC Bank",
      nameAr: "بنك كاك",
      category: "banking",
      categoryEn: "Banking",
      categoryAr: "مصرفي",
      regime: "Both",
      descriptionEn: "Major commercial bank with extensive branch network. Provides corporate and retail banking.",
      descriptionAr: "بنك تجاري رئيسي مع شبكة فروع واسعة. يقدم الخدمات المصرفية للشركات والأفراد.",
      keyFunctions: ["Commercial Banking", "Trade Finance", "Corporate Services"],
      keyFunctionsAr: ["الخدمات المصرفية التجارية", "تمويل التجارة", "خدمات الشركات"],
      sanctioned: false
    },
    {
      id: "ybrd",
      nameEn: "Yemen Bank for Reconstruction & Development",
      nameAr: "بنك اليمن للإنشاء والتعمير",
      category: "banking",
      categoryEn: "Banking",
      categoryAr: "مصرفي",
      regime: "Both",
      descriptionEn: "State-owned development bank. Historically funded infrastructure projects.",
      descriptionAr: "بنك تنمية مملوك للدولة. مول تاريخياً مشاريع البنية التحتية.",
      keyFunctions: ["Development Finance", "Infrastructure", "SME Lending"],
      keyFunctionsAr: ["تمويل التنمية", "البنية التحتية", "إقراض المشاريع الصغيرة"],
      sanctioned: false
    },
    // Energy Sector
    {
      id: "safer",
      nameEn: "SAFER Exploration & Production",
      nameAr: "سيفر للاستكشاف والإنتاج",
      category: "energy",
      categoryEn: "Energy",
      categoryAr: "الطاقة",
      regime: "DFA",
      descriptionEn: "State oil company. Operations largely suspended since 2015. FSO Safer tanker crisis.",
      descriptionAr: "شركة النفط الحكومية. العمليات متوقفة إلى حد كبير منذ 2015. أزمة ناقلة صافر.",
      keyFunctions: ["Oil Production", "Gas Operations", "Exploration"],
      keyFunctionsAr: ["إنتاج النفط", "عمليات الغاز", "الاستكشاف"],
      sanctioned: false
    },
    {
      id: "petro-masila",
      nameEn: "PetroMasila",
      nameAr: "بترومسيلة",
      category: "energy",
      categoryEn: "Energy",
      categoryAr: "الطاقة",
      regime: "IRG",
      descriptionEn: "Oil production company in Hadramawt. Operations disrupted by conflict and export blockade.",
      descriptionAr: "شركة إنتاج النفط في حضرموت. العمليات معطلة بسبب الصراع وحصار التصدير.",
      keyFunctions: ["Oil Production", "Export Operations"],
      keyFunctionsAr: ["إنتاج النفط", "عمليات التصدير"],
      sanctioned: false
    },
    {
      id: "yemen-lng",
      nameEn: "Yemen LNG Company",
      nameAr: "شركة الغاز الطبيعي المسال اليمنية",
      category: "energy",
      categoryEn: "Energy",
      categoryAr: "الطاقة",
      regime: "IRG",
      descriptionEn: "LNG export facility in Balhaf. Operations suspended since 2015.",
      descriptionAr: "منشأة تصدير الغاز المسال في بلحاف. العمليات متوقفة منذ 2015.",
      keyFunctions: ["LNG Export", "Gas Processing"],
      keyFunctionsAr: ["تصدير الغاز المسال", "معالجة الغاز"],
      sanctioned: false
    },
    // Ports
    {
      id: "aden-port",
      nameEn: "Aden Container Terminal",
      nameAr: "محطة حاويات عدن",
      category: "infrastructure",
      categoryEn: "Infrastructure",
      categoryAr: "البنية التحتية",
      regime: "IRG",
      descriptionEn: "Main commercial port for IRG. Handles majority of imports for southern regions.",
      descriptionAr: "الميناء التجاري الرئيسي للحكومة. يتعامل مع معظم الواردات للمناطق الجنوبية.",
      keyFunctions: ["Container Handling", "Import/Export", "Transshipment"],
      keyFunctionsAr: ["مناولة الحاويات", "الاستيراد/التصدير", "إعادة الشحن"],
      sanctioned: false
    },
    {
      id: "hodeidah-port",
      nameEn: "Hodeidah Port",
      nameAr: "ميناء الحديدة",
      category: "infrastructure",
      categoryEn: "Infrastructure",
      categoryAr: "البنية التحتية",
      regime: "DFA",
      descriptionEn: "Critical port for northern Yemen. Handles ~70% of imports. Subject to inspection regime.",
      descriptionAr: "ميناء حيوي لشمال اليمن. يتعامل مع ~70% من الواردات. خاضع لنظام التفتيش.",
      keyFunctions: ["Bulk Cargo", "Food Imports", "Fuel Imports"],
      keyFunctionsAr: ["البضائع السائبة", "واردات الغذاء", "واردات الوقود"],
      sanctioned: false
    },
    // International Organizations
    {
      id: "wfp-yemen",
      nameEn: "World Food Programme - Yemen",
      nameAr: "برنامج الغذاء العالمي - اليمن",
      category: "international",
      categoryEn: "International",
      categoryAr: "دولي",
      regime: "Both",
      descriptionEn: "Largest humanitarian operation in Yemen. Provides food assistance to 13+ million people.",
      descriptionAr: "أكبر عملية إنسانية في اليمن. يقدم المساعدات الغذائية لأكثر من 13 مليون شخص.",
      keyFunctions: ["Food Distribution", "Cash Transfers", "Nutrition Programs"],
      keyFunctionsAr: ["توزيع الغذاء", "التحويلات النقدية", "برامج التغذية"],
      sanctioned: false
    },
    {
      id: "undp-yemen",
      nameEn: "UNDP Yemen",
      nameAr: "برنامج الأمم المتحدة الإنمائي - اليمن",
      category: "international",
      categoryEn: "International",
      categoryAr: "دولي",
      regime: "Both",
      descriptionEn: "Leads development and resilience programming. Manages Yemen Humanitarian Fund.",
      descriptionAr: "يقود برامج التنمية والمرونة. يدير صندوق اليمن الإنساني.",
      keyFunctions: ["Development Programs", "Livelihoods", "Governance Support"],
      keyFunctionsAr: ["برامج التنمية", "سبل العيش", "دعم الحوكمة"],
      sanctioned: false
    },
    // Sanctioned Entities
    {
      id: "houthis",
      nameEn: "Ansar Allah (Houthis)",
      nameAr: "أنصار الله (الحوثيون)",
      category: "political",
      categoryEn: "Political",
      categoryAr: "سياسي",
      regime: "DFA",
      descriptionEn: "De facto authority controlling northern Yemen. Designated as terrorist organization by some countries.",
      descriptionAr: "السلطة الفعلية المسيطرة على شمال اليمن. مصنفة كمنظمة إرهابية من قبل بعض الدول.",
      keyFunctions: ["Governance (North)", "Military Operations", "Economic Control"],
      keyFunctionsAr: ["الحكم (الشمال)", "العمليات العسكرية", "السيطرة الاقتصادية"],
      sanctioned: true
    },
  ];

  // Filter actors
  const filteredActors = actors.filter(actor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      actor.nameEn.toLowerCase().includes(searchLower) ||
      actor.nameAr.includes(searchTerm) ||
      actor.categoryEn.toLowerCase().includes(searchLower)
    );
  });

  // Group by category
  const categories = [
    { id: "government", nameEn: "Government Entities", nameAr: "الجهات الحكومية", icon: Landmark },
    { id: "banking", nameEn: "Banking & Finance", nameAr: "البنوك والمالية", icon: Building2 },
    { id: "energy", nameEn: "Energy Sector", nameAr: "قطاع الطاقة", icon: Factory },
    { id: "infrastructure", nameEn: "Infrastructure", nameAr: "البنية التحتية", icon: Ship },
    { id: "international", nameEn: "International Organizations", nameAr: "المنظمات الدولية", icon: Globe },
    { id: "political", nameEn: "Political Entities", nameAr: "الكيانات السياسية", icon: Shield },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[350px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container relative h-full flex items-center">
          <div className={`max-w-2xl ${language === 'ar' ? 'mr-auto text-right' : 'ml-0'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Network className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-purple-500 text-white border-0">
                {language === "ar" ? "خريطة الفاعلين" : "Actor Mapping"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "الفاعلون الاقتصاديون"
                : "Economic Actors"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "قاعدة بيانات الكيانات الاقتصادية الرئيسية في اليمن"
                : "Database of key economic entities in Yemen"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === "ar" ? "البحث عن كيان..." : "Search entities..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2">
            <TabsTrigger value="all">
              {language === "ar" ? "الكل" : "All"}
            </TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {language === "ar" ? cat.nameAr : cat.nameEn}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActors.map(actor => (
                <ActorCard key={actor.id} actor={actor} language={language} />
              ))}
            </div>
          </TabsContent>

          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredActors
                  .filter(a => a.category === cat.id)
                  .map(actor => (
                    <ActorCard key={actor.id} actor={actor} language={language} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function ActorCard({ actor, language }: { actor: any; language: string }) {
  return (
    <Card className={actor.sanctioned ? "border-red-300 dark:border-red-800" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {language === "ar" ? actor.nameAr : actor.nameEn}
          </CardTitle>
          {actor.sanctioned && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {language === "ar" ? "معاقب" : "Sanctioned"}
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="outline">
            {language === "ar" ? actor.categoryAr : actor.categoryEn}
          </Badge>
          <Badge variant="secondary">{actor.regime}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {language === "ar" ? actor.descriptionAr : actor.descriptionEn}
        </p>
        <div>
          <span className="text-xs text-muted-foreground">
            {language === "ar" ? "الوظائف الرئيسية:" : "Key Functions:"}
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {(language === "ar" ? actor.keyFunctionsAr : actor.keyFunctions).map((fn: string, i: number) => (
              <Badge key={i} variant="outline" className="text-xs">{fn}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
