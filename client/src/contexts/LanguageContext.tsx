import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys - will be expanded as we build pages
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.dashboard": "لوحة المعلومات",
    "nav.data": "البيانات والتحليلات",
    "nav.research": "الأبحاث",
    "nav.sectors": "القطاعات",
    "nav.about": "من نحن",
    "nav.contact": "اتصل بنا",
    
    // Common
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ",
    "common.notAvailable": "غير متوفر حالياً",
    "common.learnMore": "اعرف المزيد",
    "common.download": "تحميل",
    "common.share": "مشاركة",
    "common.source": "المصدر",
    "common.confidence": "مستوى الثقة",
    "common.lastUpdated": "آخر تحديث",
    
    // Home Page
    "home.hero.title": "المرصد اليمني للشفافية الاقتصادية",
    "home.hero.subtitle": "منصة استخبارات اقتصادية قائمة على الأدلة للسياسات والأبحاث المستنيرة",
    "home.hero.cta": "استكشف البيانات",
    
    // Footer
    "footer.contact": "تواصل معنا",
    "footer.email": "yeto@causewaygrp.com",
    "footer.copyright": "© 2025 مرصد يتو. جميع الحقوق محفوظة.",
    "footer.poweredBy": "منتج من",
    "footer.causeway": "كوزواي للاستشارات المالية والمصرفية",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.data": "Data & Analytics",
    "nav.research": "Research",
    "nav.sectors": "Sectors",
    "nav.about": "About",
    "nav.contact": "Contact",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.notAvailable": "Not available yet",
    "common.learnMore": "Learn More",
    "common.download": "Download",
    "common.share": "Share",
    "common.source": "Source",
    "common.confidence": "Confidence Level",
    "common.lastUpdated": "Last Updated",
    
    // Home Page
    "home.hero.title": "Yemen Economic Transparency Observatory",
    "home.hero.subtitle": "Evidence-based economic intelligence platform for informed policy and research",
    "home.hero.cta": "Explore Data",
    
    // Footer
    "footer.contact": "Contact Us",
    "footer.email": "yeto@causewaygrp.com",
    "footer.copyright": "© 2025 YETO. All rights reserved.",
    "footer.poweredBy": "A product of",
    "footer.causeway": "CauseWay Financial & Banking Consultancies",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to Arabic (Arabic-first platform)
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("yeto-language");
    return (stored === "ar" || stored === "en") ? stored : "ar";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("yeto-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  // Update document direction and lang attribute when language changes
  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
    document.body.setAttribute("dir", dir);
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
