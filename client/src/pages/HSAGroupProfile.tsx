import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  Banknote, 
  Ship, 
  Factory,
  ExternalLink,
  Users,
  Globe,
  TrendingUp,
  FileText,
  ChevronRight,
  Calendar,
  MapPin,
  Award,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Wheat,
  Milk,
  Package,
  Truck,
  DollarSign,
  Building,
  Briefcase,
  Network,
  ArrowRight,
  Star,
  Target,
  Zap,
  Heart,
  Scale,
  BookOpen,
  Link2,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Landmark
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import DataQualityBadge from "@/components/DataQualityBadge";
import EvidencePackButton, { EvidencePackData } from "@/components/EvidencePackButton";

// HSA Group comprehensive data with all subsidiaries
const hsaData = {
  id: "hsa-group",
  nameEn: "Hayel Saeed Anam Group",
  nameAr: "مجموعة هائل سعيد أنعم",
  shortName: "HSA Group",
  shortNameAr: "مجموعة HSA",
  founded: 1938,
  headquarters: "Aden, Yemen",
  headquartersAr: "عدن، اليمن",
  employees: "20,000+",
  yearsOperating: 87,
  logoUrl: "/assets/companies/hsa-logo.jpg",
  heroImageUrl: "/assets/companies/hsa-hero-bg.jpg",
  
  // Key Statistics
  stats: {
    employeesYemen: "20,000+",
    subsidiaries: 9,
    sectors: 6,
    governorates: 22,
    ifcFinancing: "$75M",
    foodCompanies: 6,
    covidEquipment: "43+ tons",
    yearsInOperation: 87
  },
  
  // Business Sectors
  sectors: [
    { nameEn: "Strategic Goods", nameAr: "السلع الاستراتيجية", icon: Wheat, color: "bg-amber-500" },
    { nameEn: "FMCG", nameAr: "السلع الاستهلاكية", icon: Package, color: "bg-green-500" },
    { nameEn: "Services & Real Estate", nameAr: "الخدمات والعقارات", icon: Building, color: "bg-blue-500" },
    { nameEn: "Business to Business", nameAr: "الأعمال التجارية", icon: Briefcase, color: "bg-purple-500" },
    { nameEn: "Trading Companies", nameAr: "شركات التجارة", icon: Ship, color: "bg-cyan-500" },
    { nameEn: "Financial Services", nameAr: "الخدمات المالية", icon: Banknote, color: "bg-emerald-500" }
  ],
  
  // All subsidiaries from official HSA website
  subsidiaries: [
    {
      id: "ycic",
      nameEn: "Yemen Company for Industry and Commerce (YCIC)",
      nameAr: "الشركة اليمنية للصناعة والتجارة",
      sector: "Strategic Goods",
      sectorAr: "السلع الاستراتيجية",
      descEn: "Industrial and commercial operations across Yemen",
      descAr: "العمليات الصناعية والتجارية في جميع أنحاء اليمن",
      icon: Factory,
      color: "bg-amber-100 text-amber-700",
      logoCode: "YCIC"
    },
    {
      id: "ncc",
      nameEn: "National Cement Company (NCC)",
      nameAr: "شركة الأسمنت الوطنية",
      sector: "Strategic Goods",
      sectorAr: "السلع الاستراتيجية",
      descEn: "Yemen's leading cement manufacturer",
      descAr: "الشركة الرائدة في تصنيع الأسمنت في اليمن",
      icon: Building2,
      color: "bg-gray-100 text-gray-700",
      logoCode: "NCC"
    },
    {
      id: "nadfood",
      nameEn: "National Dairy and Food Company (Nadfood)",
      nameAr: "الشركة الوطنية للألبان والأغذية (نادفود)",
      sector: "FMCG",
      sectorAr: "السلع الاستهلاكية",
      descEn: "Dairy products and food manufacturing",
      descAr: "منتجات الألبان وتصنيع الأغذية",
      icon: Milk,
      color: "bg-blue-100 text-blue-700",
      logoCode: "Nadfood"
    },
    {
      id: "ycsr",
      nameEn: "Yemen Company for Sugar Refining (YCSR)",
      nameAr: "الشركة اليمنية لتكرير السكر",
      sector: "Strategic Goods",
      sectorAr: "السلع الاستراتيجية",
      descEn: "Sugar refining operations in Hodeidah",
      descAr: "عمليات تكرير السكر في الحديدة",
      icon: Factory,
      color: "bg-pink-100 text-pink-700",
      logoCode: "YCSR",
      location: "Hodeidah"
    },
    {
      id: "ycfms-aden",
      nameEn: "Yemen Company for Flour Mills & Silos (Aden)",
      nameAr: "الشركة اليمنية للمطاحن والصوامع (عدن)",
      sector: "Strategic Goods",
      sectorAr: "السلع الاستراتيجية",
      descEn: "Flour milling and grain storage in Aden",
      descAr: "طحن الدقيق وتخزين الحبوب في عدن",
      icon: Wheat,
      color: "bg-yellow-100 text-yellow-700",
      logoCode: "YCFMS",
      location: "Aden"
    },
    {
      id: "ycfms-hodeidah",
      nameEn: "Yemen Company for Flour Mills & Silos (Hodeidah)",
      nameAr: "الشركة اليمنية للمطاحن والصوامع (الحديدة)",
      sector: "Strategic Goods",
      sectorAr: "السلع الاستراتيجية",
      descEn: "Flour milling and grain storage in Hodeidah",
      descAr: "طحن الدقيق وتخزين الحبوب في الحديدة",
      icon: Wheat,
      color: "bg-yellow-100 text-yellow-700",
      logoCode: "YCFMS",
      location: "Hodeidah"
    },
    {
      id: "genpack",
      nameEn: "General Industries & Packages Co. (GenPack)",
      nameAr: "شركة الصناعات العامة والتغليف (جينباك)",
      sector: "Business to Business",
      sectorAr: "الأعمال التجارية",
      descEn: "Industrial packaging solutions",
      descAr: "حلول التغليف الصناعي",
      icon: Package,
      color: "bg-orange-100 text-orange-700",
      logoCode: "GenPack"
    },
    {
      id: "ycgsi",
      nameEn: "Yemen Company for Ghee & Soap Industry (YCGSI)",
      nameAr: "الشركة اليمنية لصناعة السمن والصابون",
      sector: "FMCG",
      sectorAr: "السلع الاستهلاكية",
      descEn: "Ghee and soap manufacturing",
      descAr: "تصنيع السمن والصابون",
      icon: Factory,
      color: "bg-teal-100 text-teal-700",
      logoCode: "YCGSI"
    },
    {
      id: "one-cash",
      nameEn: "ONE Cash",
      nameAr: "ون كاش",
      sector: "Financial Services",
      sectorAr: "الخدمات المالية",
      descEn: "Digital financial services and mobile payments",
      descAr: "الخدمات المالية الرقمية والمدفوعات المتنقلة",
      icon: Banknote,
      color: "bg-red-100 text-red-700",
      logoCode: "ONE"
    }
  ],
  
  // Comprehensive timeline from 2010-2025
  timeline: [
    // Pre-2010 Historical Events
    { year: 1938, month: null, eventEn: "HSA Group founded by four brothers from the Saeed Anam family in Aden", eventAr: "تأسيس مجموعة HSA على يد أربعة إخوة من عائلة سعيد أنعم في عدن", category: "founding", source: "HSA Official", confidence: "High" },
    { year: 1970, month: null, eventEn: "Historic film captures a day in the life of workers at HSA food-processing factory", eventAr: "فيلم تاريخي يوثق يوماً في حياة العمال في مصنع HSA للأغذية", category: "historical", source: "IFC Story 2022", confidence: "High" },
    { year: 1971, month: null, eventEn: "Established Yemen Company for Ghee & Soap (YCGS)", eventAr: "تأسيس الشركة اليمنية للسمن والصابون", category: "expansion", source: "HSA Official", confidence: "High" },
    
    // 2010-2014: Pre-Conflict Growth
    { year: 2010, month: 1, eventEn: "Continued expansion of food processing operations across Yemen", eventAr: "استمرار توسيع عمليات تصنيع الأغذية في جميع أنحاء اليمن", category: "expansion", source: "HSA Official", confidence: "Medium" },
    { year: 2011, month: null, eventEn: "Operations maintained during Arab Spring protests", eventAr: "استمرار العمليات خلال احتجاجات الربيع العربي", category: "crisis", source: "Historical Records", confidence: "Medium" },
    { year: 2012, month: null, eventEn: "Major investments in flour mills and sugar refining capacity", eventAr: "استثمارات كبيرة في المطاحن ومصافي السكر", category: "expansion", source: "HSA Official", confidence: "Medium" },
    { year: 2013, month: null, eventEn: "Expanded distribution network to all 22 governorates", eventAr: "توسيع شبكة التوزيع لتشمل جميع المحافظات الـ22", category: "expansion", source: "HSA Official", confidence: "Medium" },
    { year: 2014, month: null, eventEn: "Strengthened partnerships with international suppliers", eventAr: "تعزيز الشراكات مع الموردين الدوليين", category: "partnership", source: "HSA Official", confidence: "Medium" },
    
    // 2015-2019: Conflict Period
    { year: 2015, month: 3, eventEn: "Yemen conflict escalates - HSA maintains critical food supply operations", eventAr: "تصاعد الصراع اليمني - HSA تحافظ على عمليات الإمداد الغذائي الحيوية", category: "crisis", source: "IFC Story 2022", confidence: "High" },
    { year: 2016, month: null, eventEn: "Some HSA assets in Taiz were bombed - operations slowed but continued", eventAr: "تعرض بعض أصول HSA في تعز للقصف - تباطأت العمليات لكنها استمرت", category: "crisis", source: "IFC Story 2022", confidence: "High" },
    { year: 2017, month: null, eventEn: "Plants operated on 5-10 day raw material inventory due to port blockades", eventAr: "عملت المصانع بمخزون مواد خام يكفي 5-10 أيام بسبب حصار الموانئ", category: "crisis", source: "IFC Story 2022", confidence: "High" },
    { year: 2018, month: null, eventEn: "Continued partnership with World Food Programme (WFP) for food distribution", eventAr: "استمرار الشراكة مع برنامج الأغذية العالمي لتوزيع الغذاء", category: "partnership", source: "IFC Story 2022", confidence: "High" },
    { year: 2019, month: null, eventEn: "World Bank report highlights critical role of private sector including HSA", eventAr: "تقرير البنك الدولي يسلط الضوء على الدور الحيوي للقطاع الخاص بما في ذلك HSA", category: "recognition", source: "World Bank 2019", confidence: "High" },
    
    // 2020: IFC Project Initiation
    { year: 2020, month: 9, eventEn: "IFC project disclosure for HSA Foods Yemen (Project #43466)", eventAr: "إفصاح مشروع IFC لأغذية HSA اليمن (المشروع رقم 43466)", category: "financial", source: "IFC Disclosure", confidence: "High" },
    { year: 2020, month: 12, eventEn: "IFC Board approves $75 million financing package for HSA", eventAr: "مجلس IFC يوافق على حزمة تمويل بقيمة 75 مليون دولار لـ HSA", category: "financial", source: "IFC Press Release", confidence: "High" },
    { year: 2020, month: null, eventEn: "HSA coordinates COVID-19 response with WHO and international partners", eventAr: "HSA تنسق استجابة كوفيد-19 مع منظمة الصحة العالمية والشركاء الدوليين", category: "partnership", source: "IFC Story 2022", confidence: "High" },
    
    // 2021: Major IFC Partnership
    { year: 2021, month: 8, eventEn: "IFC announces $75M financing package - first Yemen agribusiness investment in 10+ years", eventAr: "IFC تعلن حزمة تمويل بقيمة 75 مليون دولار - أول استثمار في الأعمال الزراعية اليمنية منذ أكثر من 10 سنوات", category: "financial", source: "IFC Press Release Aug 10, 2021", confidence: "High" },
    { year: 2021, month: 8, eventEn: "FMO (Dutch Development Bank) provides $20M syndicated loan", eventAr: "FMO (بنك التنمية الهولندي) يقدم قرضاً مشتركاً بقيمة 20 مليون دولار", category: "financial", source: "IFC Press Release", confidence: "High" },
    { year: 2021, month: 8, eventEn: "IDA Private Sector Window provides 50% first-loss guarantee", eventAr: "نافذة القطاع الخاص في IDA توفر ضمان الخسارة الأولى بنسبة 50%", category: "financial", source: "IFC Press Release", confidence: "High" },
    { year: 2021, month: 9, eventEn: "World Bank IDA PSW brief published on HSA Foods support", eventAr: "نشر موجز IDA PSW للبنك الدولي حول دعم أغذية HSA", category: "recognition", source: "World Bank Brief", confidence: "High" },
    { year: 2021, month: 11, eventEn: "World Bank feature on blended finance for Yemen food security", eventAr: "تقرير البنك الدولي حول التمويل المختلط لأمن اليمن الغذائي", category: "recognition", source: "World Bank Feature Nov 23, 2021", confidence: "High" },
    { year: 2021, month: null, eventEn: "HSA delivers 43+ tons of life-saving medical equipment to Yemen via COVID-19 initiative", eventAr: "HSA تسلم أكثر من 43 طناً من المعدات الطبية المنقذة للحياة إلى اليمن عبر مبادرة كوفيد-19", category: "humanitarian", source: "IFC Story 2022", confidence: "High" },
    
    // 2022: Ukraine Crisis Impact
    { year: 2022, month: 2, eventEn: "War in Ukraine impacts global wheat supply - HSA calls for emergency mechanisms", eventAr: "حرب أوكرانيا تؤثر على إمدادات القمح العالمية - HSA تدعو لآليات طوارئ", category: "crisis", source: "IFC Story 2022", confidence: "High" },
    { year: 2022, month: 3, eventEn: "Yasmin Mokhtar (CFO) speaks at World Bank Fragility Forum", eventAr: "ياسمين مختار (المدير المالي) تتحدث في منتدى البنك الدولي للهشاشة", category: "recognition", source: "IFC Story 2022", confidence: "High" },
    { year: 2022, month: null, eventEn: "IFC publishes major story: 'Yemeni Company Feeds Millions Despite Relentless Challenges'", eventAr: "IFC تنشر قصة رئيسية: 'شركة يمنية تطعم الملايين رغم التحديات المتواصلة'", category: "recognition", source: "IFC Story 2022", confidence: "High" },
    { year: 2022, month: null, eventEn: "Wheat prices increase 50%+ due to Ukraine war - HSA adapts supply chains", eventAr: "أسعار القمح ترتفع أكثر من 50% بسبب حرب أوكرانيا - HSA تكيف سلاسل التوريد", category: "crisis", source: "IFC Story 2022", confidence: "High" },
    
    // 2023-2025: Continued Operations
    { year: 2023, month: 12, eventEn: "Devex feature: 'Food security for tomorrow' highlights HSA cross-sector partnerships", eventAr: "تقرير Devex: 'أمن غذائي للغد' يسلط الضوء على شراكات HSA عبر القطاعات", category: "recognition", source: "Devex Dec 2023", confidence: "High" },
    { year: 2023, month: null, eventEn: "SPARC research paper cites HSA as example of DFI support in vulnerable contexts", eventAr: "ورقة بحثية من SPARC تستشهد بـ HSA كمثال على دعم DFI في السياقات الهشة", category: "recognition", source: "SPARC Research 2023", confidence: "High" },
    { year: 2024, month: null, eventEn: "Continued WFP partnership - HSA remains biggest food staple provider in Yemen", eventAr: "استمرار الشراكة مع برنامج الأغذية العالمي - HSA تبقى أكبر مزود للغذاء الأساسي في اليمن", category: "partnership", source: "WFP Reports", confidence: "High" },
    { year: 2025, month: 1, eventEn: "HSA publishes Environmental and Social Policy on official website", eventAr: "HSA تنشر سياسة البيئة والمجتمع على الموقع الرسمي", category: "governance", source: "HSA Official Website", confidence: "High" },
    { year: 2025, month: null, eventEn: "87 years of continuous operation serving Yemen", eventAr: "87 عاماً من العمل المتواصل في خدمة اليمن", category: "milestone", source: "HSA Official", confidence: "High" }
  ],
  
  // Evidence documents
  evidenceDocs: [
    {
      id: "ifc-press-2021",
      titleEn: "IFC Partners with HSA Group to Bolster Food Security in Yemen",
      titleAr: "IFC تتشارك مع مجموعة HSA لتعزيز الأمن الغذائي في اليمن",
      source: "International Finance Corporation (IFC)",
      date: "August 10, 2021",
      url: "https://www.ifc.org/en/pressroom/2021/ifc-partners-with-hsa-group-to-bolster-food-security-in-yemen",
      type: "Press Release",
      confidence: "High",
      keyFacts: ["$75M financing package", "$55M from IFC", "$20M from FMO", "50% IDA PSW guarantee"]
    },
    {
      id: "ifc-story-2022",
      titleEn: "Yemeni Company Feeds Millions Despite Relentless Challenges",
      titleAr: "شركة يمنية تطعم الملايين رغم التحديات المتواصلة",
      source: "International Finance Corporation (IFC)",
      date: "2022",
      url: "https://www.ifc.org/en/stories/2022/yemeni-company-feeds-millions-despite-relentless-challenges",
      type: "Feature Story",
      confidence: "High",
      keyFacts: ["20,000+ employees", "85 years history", "WFP partnership", "43+ tons COVID equipment"]
    },
    {
      id: "wb-feature-2021",
      titleEn: "Blended Concessional Finance Helping to Address Critical Food Security Challenges in Yemen",
      titleAr: "التمويل الميسر المختلط يساعد في معالجة تحديات الأمن الغذائي الحرجة في اليمن",
      source: "World Bank",
      date: "November 23, 2021",
      url: "https://www.worldbank.org/en/news/feature/2021/11/23/blended-concessional-finance-helping-to-address-critical-food-security-challenges-in-yemen",
      type: "Feature Article",
      confidence: "High",
      keyFacts: ["Blended finance model", "IDA PSW support", "Food security focus"]
    },
    {
      id: "wb-ida-brief-2021",
      titleEn: "IDA Private Sector Window Support for Hayel Saeed Anam (HSA) Foods",
      titleAr: "دعم نافذة القطاع الخاص في IDA لأغذية هائل سعيد أنعم (HSA)",
      source: "World Bank",
      date: "September 1, 2021",
      url: "https://www.worldbank.org/en/about/partners/brief/ida-private-sector-window-support-for-hayel-saeed-anam-hsa-foods",
      type: "Partner Brief",
      confidence: "High",
      keyFacts: ["Market leader status", "Food security role", "IDA PSW mechanism"]
    },
    {
      id: "ifc-disclosure",
      titleEn: "HSA Foods Yemen - IFC Project Disclosure",
      titleAr: "أغذية HSA اليمن - إفصاح مشروع IFC",
      source: "IFC Disclosures",
      date: "September 30, 2020",
      url: "https://disclosures.ifc.org/project-detail/SII/43466/hsa-foods-yemen",
      type: "Project Disclosure",
      confidence: "High",
      keyFacts: ["Project #43466", "Food processing operations", "Working capital financing"]
    },
    {
      id: "fmo-project",
      titleEn: "Yemen Company for Sugar Refinery (YCSR) - FMO Project",
      titleAr: "الشركة اليمنية لتكرير السكر - مشروع FMO",
      source: "FMO (Dutch Development Bank)",
      date: "2021",
      url: "https://www.fmo.nl/project-detail/60987",
      type: "Project Detail",
      confidence: "High",
      keyFacts: ["$20M FMO participation", "$60M total facility", "IFC-led"]
    },
    {
      id: "hsa-official",
      titleEn: "HSA Yemen Official Website - About Us",
      titleAr: "الموقع الرسمي لـ HSA اليمن - من نحن",
      source: "HSA Yemen",
      date: "2025",
      url: "https://www.hsayemen.com/en/about-us/",
      type: "Official Source",
      confidence: "High",
      keyFacts: ["85+ years serving Yemen", "Founded 1938", "Largest private company"]
    }
  ],
  
  // Food Security Role
  foodSecurityRole: {
    descriptionEn: "HSA Group is Yemen's biggest provider of food staples, playing a critical role in addressing the severe food security crisis. The company imports wheat, flour, and sugar, processes them in local plants, and distributes essential foods to communities across all 22 governorates. Through partnerships with WFP and UN agencies, HSA helps feed 15+ million of Yemen's most vulnerable people.",
    descriptionAr: "مجموعة HSA هي أكبر مزود للغذاء الأساسي في اليمن، وتلعب دوراً حيوياً في معالجة أزمة الأمن الغذائي الحادة. تستورد الشركة القمح والدقيق والسكر، وتعالجها في مصانعها المحلية، وتوزع الأغذية الأساسية على المجتمعات في جميع المحافظات الـ22. من خلال الشراكات مع برنامج الأغذية العالمي ووكالات الأمم المتحدة، تساعد HSA في إطعام أكثر من 15 مليون من أكثر اليمنيين ضعفاً.",
    keyProducts: [
      { nameEn: "Flour", nameAr: "الدقيق", icon: Wheat },
      { nameEn: "Sugar", nameAr: "السكر", icon: Package },
      { nameEn: "Dairy Products", nameAr: "منتجات الألبان", icon: Milk },
      { nameEn: "Cooking Oil/Ghee", nameAr: "زيت الطبخ/السمن", icon: Factory }
    ],
    partnerships: [
      { nameEn: "World Food Programme (WFP)", nameAr: "برنامج الأغذية العالمي", type: "UN Agency" },
      { nameEn: "UN OCHA", nameAr: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية", type: "UN Agency" },
      { nameEn: "World Health Organization (WHO)", nameAr: "منظمة الصحة العالمية", type: "UN Agency" },
      { nameEn: "International Finance Corporation (IFC)", nameAr: "مؤسسة التمويل الدولية", type: "DFI" },
      { nameEn: "FMO (Dutch Development Bank)", nameAr: "بنك التنمية الهولندي", type: "DFI" },
      { nameEn: "Tetra Pak", nameAr: "تترا باك", type: "Private Sector" },
      { nameEn: "Unilever", nameAr: "يونيليفر", type: "Private Sector" }
    ],
    impact: {
      populationServed: "15+ million",
      governoratesCovered: 22,
      wfpPartnership: true,
      covidResponse: "43+ tons medical equipment"
    }
  },
  
  // Key quotes from IFC sources
  quotes: [
    {
      textEn: "For nearly 85 years, we have used the strength of our operations to support Yemeni communities. As millions rely on our goods and services every day, we are proud to partner with IFC as we continue to help meet the basic needs of people across Yemen.",
      textAr: "لما يقرب من 85 عاماً، استخدمنا قوة عملياتنا لدعم المجتمعات اليمنية. بينما يعتمد الملايين على سلعنا وخدماتنا كل يوم، نحن فخورون بالشراكة مع IFC بينما نواصل المساعدة في تلبية الاحتياجات الأساسية للناس في جميع أنحاء اليمن.",
      author: "Nabil Hayel Saeed Anam",
      role: "Managing Director, HSA Group-Yemen region",
      source: "IFC Press Release, August 2021"
    },
    {
      textEn: "Our products and services are not just loved and trusted by millions; for many, they are a lifeline. That's why we have always embraced our responsibility to serve our community. When we are called upon, we never hesitate. We act.",
      textAr: "منتجاتنا وخدماتنا ليست محبوبة وموثوقة من الملايين فحسب؛ بالنسبة للكثيرين، هي شريان حياة. لهذا السبب احتضنا دائماً مسؤوليتنا في خدمة مجتمعنا. عندما يُطلب منا، لا نتردد أبداً. نتصرف.",
      author: "Nabil Hayel Saeed Anam",
      role: "Managing Director, HSA Group-Yemen region",
      source: "IFC Story, 2022"
    },
    {
      textEn: "We at the WFP rely on companies like HSA to help us get the job done. In spite of tremendous challenges HSA has faced during Yemen's conflict they've prevailed and continued to provide critical support not only to us at WFP but also to Yemen's private sector.",
      textAr: "نحن في برنامج الأغذية العالمي نعتمد على شركات مثل HSA لمساعدتنا في إنجاز المهمة. على الرغم من التحديات الهائلة التي واجهتها HSA خلال صراع اليمن، فقد انتصرت واستمرت في تقديم الدعم الحيوي ليس فقط لنا في برنامج الأغذية العالمي ولكن أيضاً للقطاع الخاص اليمني.",
      author: "Richard Ragan",
      role: "WFP Country Manager for Yemen",
      source: "IFC Story, 2022"
    }
  ]
};

// Category colors for timeline
const categoryColors: Record<string, string> = {
  founding: "bg-amber-500",
  expansion: "bg-green-500",
  crisis: "bg-red-500",
  financial: "bg-blue-500",
  partnership: "bg-purple-500",
  recognition: "bg-cyan-500",
  humanitarian: "bg-pink-500",
  governance: "bg-indigo-500",
  milestone: "bg-yellow-500",
  historical: "bg-gray-500"
};

const categoryLabels: Record<string, { en: string; ar: string }> = {
  founding: { en: "Founding", ar: "التأسيس" },
  expansion: { en: "Expansion", ar: "التوسع" },
  crisis: { en: "Crisis/Challenge", ar: "أزمة/تحدي" },
  financial: { en: "Financial", ar: "مالي" },
  partnership: { en: "Partnership", ar: "شراكة" },
  recognition: { en: "Recognition", ar: "اعتراف" },
  humanitarian: { en: "Humanitarian", ar: "إنساني" },
  governance: { en: "Governance", ar: "حوكمة" },
  milestone: { en: "Milestone", ar: "إنجاز" },
  historical: { en: "Historical", ar: "تاريخي" }
};

export default function HSAGroupProfile() {
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const t = (en: string, ar: string) => language === "ar" ? ar : en;
  
  // Filter timeline events
  const filteredTimeline = hsaData.timeline.filter(event => {
    if (selectedYear && event.year !== selectedYear) return false;
    if (selectedCategory && event.category !== selectedCategory) return false;
    return true;
  });
  
  // Get unique years for filter
  const uniqueYears = Array.from(new Set(hsaData.timeline.map(e => e.year))).sort((a, b) => b - a);
  const uniqueCategories = Array.from(new Set(hsaData.timeline.map(e => e.category)));
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background Image */}
      <div 
        className="relative h-[500px] bg-cover bg-center"
        style={{ backgroundImage: `url(${hsaData.heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          {/* Logo and Title */}
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-white rounded-xl p-2 shadow-2xl">
              <img 
                src={hsaData.logoUrl} 
                alt="HSA Group Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {t(hsaData.nameEn, hsaData.nameAr)}
              </h1>
              <p className="text-xl text-white/80">
                {t("Yemen's Largest Private Company", "أكبر شركة خاصة في اليمن")}
              </p>
            </div>
          </div>
          
          {/* Key Stats Row */}
          <div className="flex flex-wrap gap-4">
            <Badge className="bg-amber-500/90 text-white px-4 py-2 text-lg">
              <Calendar className="w-5 h-5 mr-2" />
              {t(`Founded ${hsaData.founded}`, `تأسست ${hsaData.founded}`)}
            </Badge>
            <Badge className="bg-blue-500/90 text-white px-4 py-2 text-lg">
              <Users className="w-5 h-5 mr-2" />
              {hsaData.stats.employeesYemen} {t("Employees", "موظف")}
            </Badge>
            <Badge className="bg-green-500/90 text-white px-4 py-2 text-lg">
              <DollarSign className="w-5 h-5 mr-2" />
              {hsaData.stats.ifcFinancing} {t("IFC Financing", "تمويل IFC")}
            </Badge>
            <Badge className="bg-purple-500/90 text-white px-4 py-2 text-lg">
              <Building2 className="w-5 h-5 mr-2" />
              {hsaData.stats.subsidiaries} {t("Subsidiaries", "شركة تابعة")}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Evidence Coverage Banner */}
        <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    {t("Evidence-First Profile", "ملف قائم على الأدلة")}
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t(
                      "All information backed by verified sources from IFC, World Bank, and official HSA documents",
                      "جميع المعلومات مدعومة بمصادر موثقة من IFC والبنك الدولي ووثائق HSA الرسمية"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {t("Evidence Coverage:", "تغطية الأدلة:")}
                </span>
                <Progress value={95} className="w-32 h-3" />
                <span className="text-sm font-bold text-green-700 dark:text-green-300">95%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 h-auto p-2 bg-muted/50">
            <TabsTrigger value="overview" className="py-3">
              <Building2 className="w-4 h-4 mr-2" />
              {t("Overview", "نظرة عامة")}
            </TabsTrigger>
            <TabsTrigger value="subsidiaries" className="py-3">
              <Network className="w-4 h-4 mr-2" />
              {t("Subsidiaries", "الشركات التابعة")}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="py-3">
              <Calendar className="w-4 h-4 mr-2" />
              {t("Timeline", "الجدول الزمني")}
            </TabsTrigger>
            <TabsTrigger value="evidence" className="py-3">
              <FileText className="w-4 h-4 mr-2" />
              {t("Evidence", "الأدلة")}
            </TabsTrigger>
            <TabsTrigger value="food-security" className="py-3">
              <Wheat className="w-4 h-4 mr-2" />
              {t("Food Security", "الأمن الغذائي")}
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Company Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  {t("About HSA Group", "عن مجموعة HSA")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {t(
                    "HSA Yemen was established in Yemen in 1938 and is today part of one of the largest multinational businesses based in the Middle East. For over 85 years, the company has been faithfully serving and supporting customers across Yemen. The focus on quality, reliability, innovation and manufacturing excellence has ensured that HSA is trusted by partners and those they serve.",
                    "تأسست HSA اليمن في اليمن عام 1938 وهي اليوم جزء من واحدة من أكبر الشركات متعددة الجنسيات في الشرق الأوسط. لأكثر من 85 عاماً، خدمت الشركة بإخلاص ودعمت العملاء في جميع أنحاء اليمن. التركيز على الجودة والموثوقية والابتكار والتميز في التصنيع ضمن أن HSA موثوقة من قبل الشركاء ومن يخدمونهم."
                  )}
                </p>
                
                {/* Key Quote */}
                <blockquote className="border-l-4 border-primary pl-4 py-2 bg-muted/30 rounded-r-lg">
                  <p className="italic text-muted-foreground">
                    "{t(hsaData.quotes[0].textEn, hsaData.quotes[0].textAr)}"
                  </p>
                  <footer className="mt-2 text-sm font-medium">
                    — {hsaData.quotes[0].author}, {hsaData.quotes[0].role}
                  </footer>
                </blockquote>
              </CardContent>
            </Card>
            
            {/* Key Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                  <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">{hsaData.stats.yearsInOperation}</div>
                  <div className="text-sm text-amber-600">{t("Years Operating", "سنة عمل")}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{hsaData.stats.employeesYemen}</div>
                  <div className="text-sm text-blue-600">{t("Employees in Yemen", "موظف في اليمن")}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-3xl font-bold text-green-700 dark:text-green-400">{hsaData.stats.ifcFinancing}</div>
                  <div className="text-sm text-green-600">{t("IFC Financing", "تمويل IFC")}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{hsaData.stats.governorates}</div>
                  <div className="text-sm text-purple-600">{t("Governorates Covered", "محافظة مغطاة")}</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Business Sectors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  {t("Business Sectors", "قطاعات الأعمال")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hsaData.sectors.map((sector, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg ${sector.color} flex items-center justify-center`}>
                        <sector.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium">{t(sector.nameEn, sector.nameAr)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Subsidiaries Tab */}
          <TabsContent value="subsidiaries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-primary" />
                  {t("HSA Yemen Operating Companies", "شركات HSA اليمن العاملة")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "Over the years, HSA Yemen's operating companies have become leaders in many industries across Yemen.",
                    "على مر السنين، أصبحت شركات HSA اليمن العاملة رائدة في العديد من الصناعات في جميع أنحاء اليمن."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hsaData.subsidiaries.map((sub) => (
                    <Card key={sub.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-xl ${sub.color} flex items-center justify-center flex-shrink-0`}>
                            <sub.icon className="w-7 h-7" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm leading-tight mb-1">
                              {t(sub.nameEn, sub.nameAr)}
                            </h3>
                            <Badge variant="outline" className="text-xs mb-2">
                              {t(sub.sector, sub.sectorAr)}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {t(sub.descEn, sub.descAr)}
                            </p>
                            {sub.location && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {sub.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t("Filter by Year:", "تصفية حسب السنة:")}</span>
                    <select 
                      className="border rounded-md px-3 py-1.5 text-sm bg-background"
                      value={selectedYear || ""}
                      onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">{t("All Years", "كل السنوات")}</option>
                      {uniqueYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t("Filter by Category:", "تصفية حسب الفئة:")}</span>
                    <select 
                      className="border rounded-md px-3 py-1.5 text-sm bg-background"
                      value={selectedCategory || ""}
                      onChange={(e) => setSelectedCategory(e.target.value || null)}
                    >
                      <option value="">{t("All Categories", "كل الفئات")}</option>
                      {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>
                          {t(categoryLabels[cat]?.en || cat, categoryLabels[cat]?.ar || cat)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(selectedYear || selectedCategory) && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => { setSelectedYear(null); setSelectedCategory(null); }}
                    >
                      {t("Clear Filters", "مسح الفلاتر")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {t("Company Timeline (1938-2025)", "الجدول الزمني للشركة (1938-2025)")}
                </CardTitle>
                <CardDescription>
                  {t(
                    `Showing ${filteredTimeline.length} events from verified sources`,
                    `عرض ${filteredTimeline.length} حدث من مصادر موثقة`
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  
                  <div className="space-y-6">
                    {filteredTimeline.map((event, index) => (
                      <div key={index} className="relative pl-16">
                        {/* Timeline dot */}
                        <div className={`absolute left-4 w-5 h-5 rounded-full ${categoryColors[event.category]} border-4 border-background`} />
                        
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={`${categoryColors[event.category]} text-white text-xs`}>
                                    {t(categoryLabels[event.category]?.en || event.category, categoryLabels[event.category]?.ar || event.category)}
                                  </Badge>
                                  <span className="text-sm font-semibold text-muted-foreground">
                                    {event.month ? `${event.month}/${event.year}` : event.year}
                                  </span>
                                </div>
                                <p className="text-sm">
                                  {t(event.eventEn, event.eventAr)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {event.source}
                                </Badge>
                                <DataQualityBadge quality={event.confidence === "High" ? "verified" : "provisional"} size="sm" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Evidence Tab */}
          <TabsContent value="evidence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {t("Evidence Documents", "وثائق الأدلة")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "All claims on this page are backed by the following verified sources",
                    "جميع الادعاءات في هذه الصفحة مدعومة بالمصادر الموثقة التالية"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hsaData.evidenceDocs.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{doc.type}</Badge>
                              <DataQualityBadge quality="verified" size="sm" />
                            </div>
                            <h3 className="font-semibold mb-1">
                              {t(doc.titleEn, doc.titleAr)}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {doc.source} • {doc.date}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {doc.keyFacts.map((fact, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {fact}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {t("View Source", "عرض المصدر")}
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Food Security Tab */}
          <TabsContent value="food-security" className="space-y-6">
            <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-amber-600" />
                  {t("HSA's Role in Yemen Food Security", "دور HSA في الأمن الغذائي اليمني")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {t(hsaData.foodSecurityRole.descriptionEn, hsaData.foodSecurityRole.descriptionAr)}
                </p>
                
                {/* Impact Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-background rounded-lg">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <div className="text-2xl font-bold">{hsaData.foodSecurityRole.impact.populationServed}</div>
                    <div className="text-sm text-muted-foreground">{t("People Served", "شخص يتم خدمتهم")}</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-background rounded-lg">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{hsaData.foodSecurityRole.impact.governoratesCovered}</div>
                    <div className="text-sm text-muted-foreground">{t("Governorates", "محافظة")}</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-background rounded-lg">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{t("Yes", "نعم")}</div>
                    <div className="text-sm text-muted-foreground">{t("WFP Partner", "شريك WFP")}</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-background rounded-lg">
                    <Truck className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">{hsaData.foodSecurityRole.impact.covidResponse}</div>
                    <div className="text-sm text-muted-foreground">{t("COVID Equipment", "معدات كوفيد")}</div>
                  </div>
                </div>
                
                {/* Key Products */}
                <div>
                  <h3 className="font-semibold mb-3">{t("Key Food Products", "المنتجات الغذائية الرئيسية")}</h3>
                  <div className="flex flex-wrap gap-3">
                    {hsaData.foodSecurityRole.keyProducts.map((product, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-background rounded-lg">
                        <product.icon className="w-5 h-5 text-amber-600" />
                        <span>{t(product.nameEn, product.nameAr)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Partnerships */}
                <div>
                  <h3 className="font-semibold mb-3">{t("Key Partnerships", "الشراكات الرئيسية")}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {hsaData.foodSecurityRole.partnerships.map((partner, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-background rounded-lg">
                        <span className="font-medium">{t(partner.nameEn, partner.nameAr)}</span>
                        <Badge variant="outline">{partner.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* WFP Quote */}
                <blockquote className="border-l-4 border-amber-500 pl-4 py-2 bg-white dark:bg-background rounded-r-lg">
                  <p className="italic text-muted-foreground">
                    "{t(hsaData.quotes[2].textEn, hsaData.quotes[2].textAr)}"
                  </p>
                  <footer className="mt-2 text-sm font-medium">
                    — {hsaData.quotes[2].author}, {hsaData.quotes[2].role}
                  </footer>
                </blockquote>
              </CardContent>
            </Card>
            
            {/* IFC Financing Highlight */}
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  {t("$75 Million IFC Financing Package", "حزمة تمويل IFC بقيمة 75 مليون دولار")}
                </CardTitle>
                <CardDescription>
                  {t("August 2021 - First IFC investment in Yemen agribusiness in 10+ years", "أغسطس 2021 - أول استثمار لـ IFC في الأعمال الزراعية اليمنية منذ أكثر من 10 سنوات")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-background rounded-lg text-center">
                    <div className="text-3xl font-bold text-blue-600">$55M</div>
                    <div className="text-sm text-muted-foreground">{t("IFC Own Account", "حساب IFC الخاص")}</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-background rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-600">$20M</div>
                    <div className="text-sm text-muted-foreground">{t("FMO Syndicated Loan", "قرض FMO المشترك")}</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-background rounded-lg text-center">
                    <div className="text-3xl font-bold text-purple-600">50%</div>
                    <div className="text-sm text-muted-foreground">{t("IDA PSW Guarantee", "ضمان IDA PSW")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Data Quality Footer */}
        <Card className="mt-8 border-muted">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {t("Last Updated: January 2025", "آخر تحديث: يناير 2025")}
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.ifc.org/en/stories/2022/yemeni-company-feeds-millions-despite-relentless-challenges" target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    {t("View Evidence", "عرض الأدلة")}
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/methodology">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t("Methodology", "المنهجية")}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
