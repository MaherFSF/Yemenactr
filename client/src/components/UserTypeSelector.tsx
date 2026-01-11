import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Building2,
  FileText,
  Users,
  Briefcase,
  Globe,
  Heart,
  BarChart3,
  X,
} from "lucide-react";

export type UserType = 
  | "researcher"
  | "donor"
  | "policymaker"
  | "journalist"
  | "ngo"
  | "business"
  | "diplomat"
  | "general";

interface UserTypeConfig {
  id: UserType;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
  color: string;
  recommendedSections: string[];
  quickLinks: { label: string; labelAr: string; href: string }[];
}

const USER_TYPES: UserTypeConfig[] = [
  {
    id: "researcher",
    label: "Researcher / Academic",
    labelAr: "باحث / أكاديمي",
    description: "Access detailed datasets, methodology documentation, and academic publications",
    descriptionAr: "الوصول إلى مجموعات البيانات التفصيلية والوثائق المنهجية والمنشورات الأكاديمية",
    icon: <GraduationCap className="w-8 h-8" />,
    color: "bg-blue-500",
    recommendedSections: ["data-repository", "methodology", "research", "timeline"],
    quickLinks: [
      { label: "Data Repository", labelAr: "مستودع البيانات", href: "/data-repository" },
      { label: "Research Portal", labelAr: "بوابة الأبحاث", href: "/research" },
      { label: "Methodology", labelAr: "المنهجية", href: "/methodology" },
      { label: "API Access", labelAr: "الوصول للـ API", href: "/api-docs" },
    ],
  },
  {
    id: "donor",
    label: "Donor / Funding Agency",
    labelAr: "جهة مانحة / وكالة تمويل",
    description: "Track humanitarian funding, aid flows, and development project outcomes",
    descriptionAr: "تتبع التمويل الإنساني وتدفقات المساعدات ونتائج مشاريع التنمية",
    icon: <Heart className="w-8 h-8" />,
    color: "bg-green-500",
    recommendedSections: ["humanitarian-funding", "aid-flows", "dashboard", "reports"],
    quickLinks: [
      { label: "Humanitarian Funding", labelAr: "التمويل الإنساني", href: "/humanitarian-funding" },
      { label: "Aid Flows", labelAr: "تدفقات المساعدات", href: "/sectors/aid" },
      { label: "Report Builder", labelAr: "منشئ التقارير", href: "/report-builder" },
      { label: "Dashboard", labelAr: "لوحة المعلومات", href: "/dashboard" },
    ],
  },
  {
    id: "policymaker",
    label: "Policymaker / Government",
    labelAr: "صانع سياسات / حكومي",
    description: "Access policy briefs, economic indicators, and scenario modeling tools",
    descriptionAr: "الوصول إلى موجزات السياسات والمؤشرات الاقتصادية وأدوات نمذجة السيناريوهات",
    icon: <Building2 className="w-8 h-8" />,
    color: "bg-amber-500",
    recommendedSections: ["dashboard", "scenario-simulator", "sectors", "compliance"],
    quickLinks: [
      { label: "Economic Dashboard", labelAr: "لوحة المعلومات الاقتصادية", href: "/dashboard" },
      { label: "Scenario Simulator", labelAr: "محاكي السيناريوهات", href: "/scenario-simulator" },
      { label: "Compliance Dashboard", labelAr: "لوحة الامتثال", href: "/compliance" },
      { label: "Policy Briefs", labelAr: "موجزات السياسات", href: "/research?category=policy_brief" },
    ],
  },
  {
    id: "journalist",
    label: "Journalist / Media",
    labelAr: "صحفي / إعلامي",
    description: "Find verified data, source citations, and downloadable visualizations",
    descriptionAr: "العثور على بيانات موثقة واستشهادات المصادر والرسوم البيانية القابلة للتنزيل",
    icon: <FileText className="w-8 h-8" />,
    color: "bg-purple-500",
    recommendedSections: ["timeline", "data-repository", "glossary", "about"],
    quickLinks: [
      { label: "Timeline", labelAr: "الجدول الزمني", href: "/timeline" },
      { label: "Data Repository", labelAr: "مستودع البيانات", href: "/data-repository" },
      { label: "Glossary", labelAr: "المصطلحات", href: "/glossary" },
      { label: "About YETO", labelAr: "عن يتو", href: "/about" },
    ],
  },
  {
    id: "ngo",
    label: "NGO / Humanitarian Worker",
    labelAr: "منظمة غير حكومية / عامل إنساني",
    description: "Access humanitarian data, regional analysis, and operational information",
    descriptionAr: "الوصول إلى البيانات الإنسانية والتحليل الإقليمي والمعلومات التشغيلية",
    icon: <Users className="w-8 h-8" />,
    color: "bg-red-500",
    recommendedSections: ["humanitarian", "regional-zones", "food-security", "health"],
    quickLinks: [
      { label: "Humanitarian Sector", labelAr: "القطاع الإنساني", href: "/sectors/humanitarian" },
      { label: "Regional Zones", labelAr: "المناطق الإقليمية", href: "/regional-zones" },
      { label: "Food Security", labelAr: "الأمن الغذائي", href: "/sectors/food-security" },
      { label: "Health Data", labelAr: "بيانات الصحة", href: "/sectors/health" },
    ],
  },
  {
    id: "business",
    label: "Business / Private Sector",
    labelAr: "قطاع خاص / أعمال",
    description: "Access market data, sanctions information, and business environment analysis",
    descriptionAr: "الوصول إلى بيانات السوق ومعلومات العقوبات وتحليل بيئة الأعمال",
    icon: <Briefcase className="w-8 h-8" />,
    color: "bg-teal-500",
    recommendedSections: ["banking", "trade", "sanctions", "corporate-registry"],
    quickLinks: [
      { label: "Banking Sector", labelAr: "القطاع المصرفي", href: "/sectors/banking" },
      { label: "Trade Data", labelAr: "بيانات التجارة", href: "/sectors/trade" },
      { label: "Sanctions", labelAr: "العقوبات", href: "/sanctions" },
      { label: "Corporate Registry", labelAr: "السجل التجاري", href: "/corporate-registry" },
    ],
  },
  {
    id: "diplomat",
    label: "Diplomat / International Organization",
    labelAr: "دبلوماسي / منظمة دولية",
    description: "Access political economy analysis, conflict tracking, and stakeholder mapping",
    descriptionAr: "الوصول إلى تحليل الاقتصاد السياسي وتتبع النزاعات ورسم خرائط أصحاب المصلحة",
    icon: <Globe className="w-8 h-8" />,
    color: "bg-indigo-500",
    recommendedSections: ["economic-actors", "timeline", "conflict-economy", "sanctions"],
    quickLinks: [
      { label: "Economic Actors", labelAr: "الفاعلون الاقتصاديون", href: "/economic-actors" },
      { label: "Conflict Economy", labelAr: "اقتصاد النزاع", href: "/sectors/conflict" },
      { label: "Timeline", labelAr: "الجدول الزمني", href: "/timeline" },
      { label: "Sanctions", labelAr: "العقوبات", href: "/sanctions" },
    ],
  },
  {
    id: "general",
    label: "General Public",
    labelAr: "عام",
    description: "Explore Yemen's economic situation through accessible dashboards and explanations",
    descriptionAr: "استكشاف الوضع الاقتصادي في اليمن من خلال لوحات معلومات وشروحات سهلة الوصول",
    icon: <BarChart3 className="w-8 h-8" />,
    color: "bg-gray-500",
    recommendedSections: ["dashboard", "glossary", "about", "timeline"],
    quickLinks: [
      { label: "Dashboard", labelAr: "لوحة المعلومات", href: "/dashboard" },
      { label: "Glossary", labelAr: "المصطلحات", href: "/glossary" },
      { label: "About YETO", labelAr: "عن يتو", href: "/about" },
      { label: "Timeline", labelAr: "الجدول الزمني", href: "/timeline" },
    ],
  },
];

interface UserTypeSelectorProps {
  onSelect?: (userType: UserType) => void;
  showOnFirstVisit?: boolean;
}

export default function UserTypeSelector({ onSelect, showOnFirstVisit = true }: UserTypeSelectorProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  useEffect(() => {
    // Check if user has already selected a type
    const savedType = localStorage.getItem("yeto_user_type");
    if (savedType) {
      setSelectedType(savedType as UserType);
    } else if (showOnFirstVisit) {
      // Show dialog on first visit after a short delay
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [showOnFirstVisit]);

  const handleSelect = (type: UserType) => {
    setSelectedType(type);
    localStorage.setItem("yeto_user_type", type);
    setIsOpen(false);
    onSelect?.(type);
  };

  const handleSkip = () => {
    setIsOpen(false);
    localStorage.setItem("yeto_user_type", "general");
    setSelectedType("general");
  };

  const selectedConfig = USER_TYPES.find(t => t.id === selectedType);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {language === "ar" ? "مرحباً بك في يتو" : "Welcome to YETO"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {language === "ar" 
                ? "اختر نوع المستخدم الخاص بك للحصول على تجربة مخصصة"
                : "Select your user type for a personalized experience"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {USER_TYPES.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                  selectedType === type.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleSelect(type.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`${type.color} text-white rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center`}>
                    {type.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">
                    {language === "ar" ? type.labelAr : type.label}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {language === "ar" ? type.descriptionAr : type.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center mt-4">
            <Button variant="ghost" onClick={handleSkip}>
              {language === "ar" ? "تخطي" : "Skip for now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick access bar for selected user type */}
      {selectedConfig && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40">
          <Card className="shadow-lg border-2">
            <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`${selectedConfig.color} text-white rounded-full w-8 h-8 flex items-center justify-center`}>
                  {selectedConfig.icon}
                </div>
                <span className="font-medium text-sm">
                  {language === "ar" ? selectedConfig.labelAr : selectedConfig.label}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsOpen(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-xs text-muted-foreground mb-2">
                {language === "ar" ? "روابط سريعة:" : "Quick links:"}
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedConfig.quickLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded transition-colors"
                  >
                    {language === "ar" ? link.labelAr : link.label}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export { USER_TYPES };
export type { UserTypeConfig };
