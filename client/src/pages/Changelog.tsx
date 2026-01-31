import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Bug, 
  Sparkles, 
  Shield, 
  Database,
  Globe,
  Zap,
  FileText
} from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  titleEn: string;
  titleAr: string;
  changes: {
    type: "feature" | "fix" | "improvement" | "security" | "data";
    textEn: string;
    textAr: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2026-01-10",
    type: "major",
    titleEn: "Initial Public Release",
    titleAr: "الإصدار العام الأول",
    changes: [
      {
        type: "feature",
        textEn: "Launch of YETO platform with 15+ economic sectors",
        textAr: "إطلاق منصة يتو مع أكثر من 15 قطاعاً اقتصادياً"
      },
      {
        type: "feature",
        textEn: "AI Assistant (One Brain) for natural language queries",
        textAr: "المساعد الذكي (العقل الواحد) للاستعلامات باللغة الطبيعية"
      },
      {
        type: "feature",
        textEn: "Dual regime tracking (Aden IRG / Sana'a DFA)",
        textAr: "تتبع النظامين المزدوج (عدن / صنعاء)"
      },
      {
        type: "feature",
        textEn: "Evidence Pack system for data provenance",
        textAr: "نظام حزم الأدلة لمصدر البيانات"
      },
      {
        type: "feature",
        textEn: "Custom Report Builder with export functionality",
        textAr: "منشئ التقارير المخصصة مع وظيفة التصدير"
      },
      {
        type: "feature",
        textEn: "Bilingual support (Arabic RTL / English LTR)",
        textAr: "دعم ثنائي اللغة (العربية / الإنجليزية)"
      },
      {
        type: "data",
        textEn: "Initial dataset with 500+ indicators from 100+ sources",
        textAr: "مجموعة بيانات أولية مع أكثر من 500 مؤشر من أكثر من 100 مصدر"
      }
    ]
  },
  {
    version: "0.9.0",
    date: "2026-01-02",
    type: "minor",
    titleEn: "Beta Release - Partner Testing",
    titleAr: "إصدار تجريبي - اختبار الشركاء",
    changes: [
      {
        type: "feature",
        textEn: "Partner Portal for data contributors",
        textAr: "بوابة الشركاء لمساهمي البيانات"
      },
      {
        type: "feature",
        textEn: "Scenario Simulator for economic modeling",
        textAr: "محاكي السيناريوهات للنمذجة الاقتصادية"
      },
      {
        type: "improvement",
        textEn: "Enhanced dashboard with regime comparison view",
        textAr: "لوحة معلومات محسنة مع عرض مقارنة الأنظمة"
      },
      {
        type: "fix",
        textEn: "Fixed chart rendering issues on mobile devices",
        textAr: "إصلاح مشاكل عرض الرسوم البيانية على الأجهزة المحمولة"
      }
    ]
  },
  {
    version: "0.8.0",
    date: "2025-12-23",
    type: "minor",
    titleEn: "Data Infrastructure Update",
    titleAr: "تحديث البنية التحتية للبيانات",
    changes: [
      {
        type: "feature",
        textEn: "Coverage Scorecard for tracking data gaps",
        textAr: "بطاقة التغطية لتتبع فجوات البيانات"
      },
      {
        type: "feature",
        textEn: "Compliance & Sanctions monitoring dashboard",
        textAr: "لوحة مراقبة الامتثال والعقوبات"
      },
      {
        type: "data",
        textEn: "Added historical exchange rate data (2014-2024)",
        textAr: "إضافة بيانات أسعار الصرف التاريخية (2014-2024)"
      },
      {
        type: "security",
        textEn: "Implemented role-based access control",
        textAr: "تنفيذ التحكم في الوصول القائم على الأدوار"
      }
    ]
  },
  {
    version: "0.7.0",
    date: "2025-12-14",
    type: "minor",
    titleEn: "Research & Publications",
    titleAr: "البحث والمنشورات",
    changes: [
      {
        type: "feature",
        textEn: "Research Library with document filtering",
        textAr: "مكتبة البحث مع تصفية المستندات"
      },
      {
        type: "feature",
        textEn: "Publications engine for automated reports",
        textAr: "محرك المنشورات للتقارير الآلية"
      },
      {
        type: "feature",
        textEn: "Glossary with bilingual economic terms",
        textAr: "قاموس المصطلحات الاقتصادية ثنائي اللغة"
      },
      {
        type: "improvement",
        textEn: "Improved search functionality across all content",
        textAr: "تحسين وظيفة البحث عبر جميع المحتوى"
      }
    ]
  },
  {
    version: "0.6.0",
    date: "2024-11-20",
    type: "minor",
    titleEn: "Entity Profiles",
    titleAr: "ملفات الكيانات",
    changes: [
      {
        type: "feature",
        textEn: "Entity profiles for key economic actors",
        textAr: "ملفات الكيانات للفاعلين الاقتصاديين الرئيسيين"
      },
      {
        type: "feature",
        textEn: "HSA Group and major conglomerate profiles",
        textAr: "ملفات مجموعة هائل سعيد أنعم والتكتلات الكبرى"
      },
      {
        type: "feature",
        textEn: "Central bank profiles (Aden & Sana'a)",
        textAr: "ملفات البنك المركزي (عدن وصنعاء)"
      },
      {
        type: "data",
        textEn: "Added entity relationship mapping",
        textAr: "إضافة خريطة علاقات الكيانات"
      }
    ]
  },
  {
    version: "0.5.0",
    date: "2024-11-10",
    type: "minor",
    titleEn: "Sector Dashboards",
    titleAr: "لوحات القطاعات",
    changes: [
      {
        type: "feature",
        textEn: "15 sector-specific dashboards launched",
        textAr: "إطلاق 15 لوحة معلومات خاصة بالقطاعات"
      },
      {
        type: "feature",
        textEn: "Interactive charts with Recharts integration",
        textAr: "رسوم بيانية تفاعلية مع تكامل Recharts"
      },
      {
        type: "improvement",
        textEn: "Responsive design for all screen sizes",
        textAr: "تصميم متجاوب لجميع أحجام الشاشات"
      },
      {
        type: "fix",
        textEn: "Fixed Arabic text alignment issues",
        textAr: "إصلاح مشاكل محاذاة النص العربي"
      }
    ]
  },
  {
    version: "0.4.0",
    date: "2024-11-01",
    type: "minor",
    titleEn: "Timeline & Methodology",
    titleAr: "الجدول الزمني والمنهجية",
    changes: [
      {
        type: "feature",
        textEn: "Economic events timeline (2014-present)",
        textAr: "الجدول الزمني للأحداث الاقتصادية (2014-الحاضر)"
      },
      {
        type: "feature",
        textEn: "Methodology & Transparency page",
        textAr: "صفحة المنهجية والشفافية"
      },
      {
        type: "feature",
        textEn: "Corrections workflow and public log",
        textAr: "سير عمل التصحيحات والسجل العام"
      },
      {
        type: "security",
        textEn: "Added data provenance tracking",
        textAr: "إضافة تتبع مصدر البيانات"
      }
    ]
  },
  {
    version: "0.3.0",
    date: "2024-10-20",
    type: "minor",
    titleEn: "Core Platform",
    titleAr: "المنصة الأساسية",
    changes: [
      {
        type: "feature",
        textEn: "Main dashboard with key indicators",
        textAr: "لوحة المعلومات الرئيسية مع المؤشرات الرئيسية"
      },
      {
        type: "feature",
        textEn: "Data Repository with search and filters",
        textAr: "مستودع البيانات مع البحث والفلاتر"
      },
      {
        type: "feature",
        textEn: "User authentication via Manus OAuth",
        textAr: "مصادقة المستخدم عبر Manus OAuth"
      },
      {
        type: "data",
        textEn: "Initial database schema with 20+ tables",
        textAr: "مخطط قاعدة البيانات الأولي مع أكثر من 20 جدول"
      }
    ]
  },
  {
    version: "0.2.0",
    date: "2024-10-10",
    type: "minor",
    titleEn: "Design System",
    titleAr: "نظام التصميم",
    changes: [
      {
        type: "feature",
        textEn: "CauseWay branding and design tokens",
        textAr: "علامة كوزواي التجارية ورموز التصميم"
      },
      {
        type: "feature",
        textEn: "Header and footer components",
        textAr: "مكونات الرأس والتذييل"
      },
      {
        type: "improvement",
        textEn: "Dark mode support",
        textAr: "دعم الوضع الداكن"
      },
      {
        type: "improvement",
        textEn: "RTL layout for Arabic",
        textAr: "تخطيط RTL للعربية"
      }
    ]
  },
  {
    version: "0.1.0",
    date: "2024-10-01",
    type: "minor",
    titleEn: "Project Initialization",
    titleAr: "تهيئة المشروع",
    changes: [
      {
        type: "feature",
        textEn: "Project scaffolding with React + TypeScript",
        textAr: "هيكل المشروع مع React + TypeScript"
      },
      {
        type: "feature",
        textEn: "tRPC API setup with Express backend",
        textAr: "إعداد tRPC API مع خلفية Express"
      },
      {
        type: "feature",
        textEn: "Database setup with Drizzle ORM",
        textAr: "إعداد قاعدة البيانات مع Drizzle ORM"
      },
      {
        type: "data",
        textEn: "Initial data model design",
        textAr: "تصميم نموذج البيانات الأولي"
      }
    ]
  }
];

export default function Changelog() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Sparkles className="h-4 w-4 text-blue-500" />;
      case "fix":
        return <Bug className="h-4 w-4 text-red-500" />;
      case "improvement":
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case "security":
        return <Shield className="h-4 w-4 text-green-500" />;
      case "data":
        return <Database className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: "major" | "minor" | "patch") => {
    switch (type) {
      case "major":
        return <Badge className="bg-blue-500">{isArabic ? "رئيسي" : "Major"}</Badge>;
      case "minor":
        return <Badge className="bg-green-500">{isArabic ? "ثانوي" : "Minor"}</Badge>;
      case "patch":
        return <Badge className="bg-gray-500">{isArabic ? "تصحيح" : "Patch"}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4C583E] to-[#768064] text-white py-12">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="h-8 w-8" />
            <h1 className="text-3xl font-bold">
              {isArabic ? "سجل التغييرات" : "Changelog"}
            </h1>
          </div>
          <p className="text-white/80 max-w-2xl">
            {isArabic 
              ? "تتبع جميع التحديثات والميزات الجديدة والتحسينات على منصة يتو"
              : "Track all updates, new features, and improvements to the YETO platform"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {changelog.map((entry, index) => (
            <Card key={entry.version} className={index === 0 ? "border-2 border-blue-500" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">v{entry.version}</CardTitle>
                    {getTypeBadge(entry.type)}
                    {index === 0 && (
                      <Badge variant="outline" className="text-blue-500 border-blue-500">
                        {isArabic ? "الأحدث" : "Latest"}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{entry.date}</span>
                </div>
                <p className="text-lg font-medium text-gray-700">
                  {isArabic ? entry.titleAr : entry.titleEn}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {entry.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="flex items-start gap-3">
                      {getTypeIcon(change.type)}
                      <span className="text-gray-600">
                        {isArabic ? change.textAr : change.textEn}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
