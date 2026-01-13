import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
  isRTL: boolean;
  formatNumber: (num: number) => string;
  formatDate: (date: Date | string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Comprehensive translation keys for all pages
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // ============================================
    // Navigation
    // ============================================
    "nav.home": "الرئيسية",
    "nav.dashboard": "لوحة المعلومات",
    "nav.data": "البيانات والتحليلات",
    "nav.research": "الأبحاث",
    "nav.sectors": "القطاعات",
    "nav.tools": "الأدوات",
    "nav.resources": "الموارد",
    "nav.about": "من نحن",
    "nav.contact": "اتصل بنا",
    "nav.pricing": "الاشتراكات",
    "nav.login": "تسجيل الدخول",
    "nav.logout": "تسجيل الخروج",
    "nav.profile": "الملف الشخصي",
    "nav.admin": "لوحة الإدارة",
    "nav.partner": "بوابة الشركاء",
    
    // ============================================
    // Sectors
    // ============================================
    "sectors.banking": "القطاع المصرفي والمالي",
    "sectors.banking.desc": "تتبع أداء البنوك وتدفقات الائتمان والاستقرار المالي",
    "sectors.trade": "التجارة والاستيراد",
    "sectors.trade.desc": "مراقبة حركة الواردات والصادرات والميزان التجاري",
    "sectors.poverty": "الفقر والتنمية",
    "sectors.poverty.desc": "مؤشرات الفقر والتنمية البشرية والاحتياجات الإنسانية",
    "sectors.macroeconomy": "الاقتصاد الكلي",
    "sectors.macroeconomy.desc": "الناتج المحلي الإجمالي والنمو الاقتصادي والمؤشرات الكلية",
    "sectors.prices": "الأسعار والتضخم",
    "sectors.prices.desc": "تتبع أسعار السلع الأساسية ومعدلات التضخم",
    "sectors.currency": "العملة والصرف",
    "sectors.currency.desc": "أسعار الصرف وتحركات الريال اليمني",
    "sectors.publicFinance": "المالية العامة",
    "sectors.publicFinance.desc": "الإيرادات والنفقات الحكومية والدين العام",
    "sectors.energy": "الطاقة والوقود",
    "sectors.energy.desc": "أسعار الوقود وإمدادات الكهرباء وقطاع الطاقة",
    "sectors.foodSecurity": "الأمن الغذائي",
    "sectors.foodSecurity.desc": "مؤشرات الأمن الغذائي وأسعار المواد الغذائية",
    "sectors.aidFlows": "تدفقات المساعدات",
    "sectors.aidFlows.desc": "تتبع المساعدات الإنسانية والتنموية",
    "sectors.laborMarket": "سوق العمل",
    "sectors.laborMarket.desc": "معدلات البطالة والأجور وديناميكيات التوظيف",
    "sectors.conflictEconomy": "اقتصاد الصراع",
    "sectors.conflictEconomy.desc": "التأثير الاقتصادي للصراع والاقتصاد غير الرسمي",
    "sectors.infrastructure": "البنية التحتية",
    "sectors.infrastructure.desc": "حالة البنية التحتية والخدمات الأساسية",
    "sectors.agriculture": "الزراعة",
    "sectors.agriculture.desc": "الإنتاج الزراعي والأمن الغذائي المحلي",
    "sectors.investment": "الاستثمار",
    "sectors.investment.desc": "بيئة الاستثمار والتدفقات الرأسمالية",
    
    // ============================================
    // Tools
    // ============================================
    "tools.aiAssistant": "المساعد الذكي",
    "tools.aiAssistant.desc": "اسأل أي سؤال عن الاقتصاد اليمني",
    "tools.scenarioSimulator": "محاكي السيناريوهات",
    "tools.scenarioSimulator.desc": "استكشف السيناريوهات الاقتصادية المحتملة",
    "tools.reportBuilder": "منشئ التقارير",
    "tools.reportBuilder.desc": "أنشئ تقارير مخصصة من البيانات",
    "tools.dataRepository": "مستودع البيانات",
    "tools.dataRepository.desc": "تصفح وتحميل مجموعات البيانات",
    "tools.timeline": "الجدول الزمني",
    "tools.timeline.desc": "استعرض الأحداث الاقتصادية الرئيسية",
    "tools.entities": "الكيانات",
    "tools.entities.desc": "ملفات الشركات والمؤسسات الرئيسية",
    "tools.compliance": "الامتثال والعقوبات",
    "tools.compliance.desc": "مراقبة العقوبات والامتثال",
    "tools.coverage": "بطاقة التغطية",
    "tools.coverage.desc": "تتبع فجوات البيانات والتغطية",
    
    // ============================================
    // Common UI
    // ============================================
    "common.search": "بحث",
    "common.searchPlaceholder": "ابحث في المؤشرات والتقارير...",
    "common.filter": "تصفية",
    "common.export": "تصدير",
    "common.download": "تحميل",
    "common.share": "مشاركة",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.submit": "إرسال",
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ",
    "common.success": "تم بنجاح",
    "common.noData": "لا توجد بيانات",
    "common.viewAll": "عرض الكل",
    "common.learnMore": "اعرف المزيد",
    "common.readMore": "اقرأ المزيد",
    "common.showMore": "عرض المزيد",
    "common.showLess": "عرض أقل",
    "common.notAvailable": "غير متوفر حالياً",
    "common.source": "المصدر",
    "common.sources": "المصادر",
    "common.confidence": "مستوى الثقة",
    "common.lastUpdated": "آخر تحديث",
    "common.date": "التاريخ",
    "common.value": "القيمة",
    "common.change": "التغيير",
    "common.trend": "الاتجاه",
    "common.period": "الفترة",
    "common.unit": "الوحدة",
    "common.all": "الكل",
    "common.yes": "نعم",
    "common.no": "لا",
    "common.or": "أو",
    "common.and": "و",
    "common.from": "من",
    "common.to": "إلى",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.previous": "السابق",
    "common.close": "إغلاق",
    "common.open": "فتح",
    "common.edit": "تعديل",
    "common.delete": "حذف",
    "common.add": "إضافة",
    "common.new": "جديد",
    "common.update": "تحديث",
    "common.refresh": "تحديث",
    "common.reset": "إعادة تعيين",
    "common.apply": "تطبيق",
    "common.clear": "مسح",
    "common.select": "اختر",
    "common.selected": "محدد",
    "common.required": "مطلوب",
    "common.optional": "اختياري",
    "common.status": "الحالة",
    "common.active": "نشط",
    "common.inactive": "غير نشط",
    "common.pending": "قيد الانتظار",
    "common.approved": "معتمد",
    "common.rejected": "مرفوض",
    "common.draft": "مسودة",
    "common.published": "منشور",
    
    // ============================================
    // Dashboard
    // ============================================
    "dashboard.title": "لوحة المعلومات الاقتصادية",
    "dashboard.subtitle": "مراقبة المؤشرات الاقتصادية الرئيسية في اليمن",
    "dashboard.regimeComparison": "مقارنة بين السلطتين",
    "dashboard.aden": "عدن (الحكومة المعترف بها)",
    "dashboard.sanaa": "صنعاء (سلطة الأمر الواقع)",
    "dashboard.national": "وطني",
    "dashboard.dataQuality": "جودة البيانات",
    "dashboard.keyIndicators": "المؤشرات الرئيسية",
    "dashboard.recentUpdates": "آخر التحديثات",
    "dashboard.quickStats": "إحصائيات سريعة",
    "dashboard.exchangeRate": "سعر الصرف",
    "dashboard.inflation": "معدل التضخم",
    "dashboard.fuelPrice": "سعر الوقود",
    "dashboard.foodPrice": "مؤشر أسعار الغذاء",
    
    // ============================================
    // Data & Evidence
    // ============================================
    "data.indicator": "المؤشر",
    "data.indicators": "المؤشرات",
    "data.regime": "السلطة",
    "data.regimes": "السلطات",
    "data.timeSeries": "السلاسل الزمنية",
    "data.dataPoint": "نقطة بيانات",
    "data.dataPoints": "نقاط البيانات",
    "data.methodology": "المنهجية",
    "data.collection": "طريقة الجمع",
    "data.frequency": "التكرار",
    "data.coverage": "التغطية",
    "data.quality": "الجودة",
    "data.verified": "موثق",
    "data.unverified": "غير موثق",
    "data.estimated": "تقديري",
    "data.provisional": "مؤقت",
    "data.final": "نهائي",
    
    "evidence.showEvidence": "أظهر الدليل",
    "evidence.hideEvidence": "إخفاء الدليل",
    "evidence.evidencePack": "حزمة الأدلة",
    "evidence.sources": "المصادر",
    "evidence.methodology": "المنهجية",
    "evidence.confidence": "مستوى الثقة",
    "evidence.lastVerified": "آخر تحقق",
    "evidence.reportIssue": "الإبلاغ عن مشكلة",
    "evidence.high": "عالي",
    "evidence.medium": "متوسط",
    "evidence.low": "منخفض",
    "evidence.collectionDate": "تاريخ الجمع",
    "evidence.verificationDate": "تاريخ التحقق",
    
    // ============================================
    // Publications
    // ============================================
    "publications.title": "المنشورات",
    "publications.dailyDigest": "الملخص اليومي",
    "publications.weeklyMonitor": "المراقب الأسبوعي",
    "publications.monthlyBrief": "الموجز الشهري",
    "publications.specialReport": "تقرير خاص",
    "publications.subscribe": "اشترك",
    "publications.unsubscribe": "إلغاء الاشتراك",
    "publications.downloadPdf": "تحميل PDF",
    "publications.latestIssue": "أحدث إصدار",
    "publications.archive": "الأرشيف",
    "publications.featured": "مميز",
    
    // ============================================
    // AI Assistant
    // ============================================
    "ai.title": "المساعد الذكي",
    "ai.subtitle": "اسأل أي سؤال عن الاقتصاد اليمني",
    "ai.placeholder": "اكتب سؤالك هنا...",
    "ai.send": "إرسال",
    "ai.thinking": "جاري التفكير...",
    "ai.suggestions": "اقتراحات",
    "ai.newChat": "محادثة جديدة",
    "ai.history": "المحادثات السابقة",
    "ai.sources": "المصادر المستخدمة",
    "ai.disclaimer": "الإجابات مبنية على البيانات المتاحة وقد لا تكون شاملة",
    
    // ============================================
    // Scenario Simulator
    // ============================================
    "simulator.title": "محاكي السيناريوهات",
    "simulator.subtitle": "استكشف التأثيرات الاقتصادية المحتملة",
    "simulator.selectScenario": "اختر السيناريو",
    "simulator.runSimulation": "تشغيل المحاكاة",
    "simulator.results": "النتائج",
    "simulator.assumptions": "الافتراضات",
    "simulator.impact": "التأثير",
    "simulator.baseline": "خط الأساس",
    "simulator.projected": "المتوقع",
    
    // ============================================
    // Report Builder
    // ============================================
    "reportBuilder.title": "منشئ التقارير",
    "reportBuilder.subtitle": "أنشئ تقارير مخصصة",
    "reportBuilder.selectIndicators": "اختر المؤشرات",
    "reportBuilder.selectPeriod": "اختر الفترة",
    "reportBuilder.selectFormat": "اختر التنسيق",
    "reportBuilder.generate": "إنشاء التقرير",
    "reportBuilder.preview": "معاينة",
    "reportBuilder.download": "تحميل",
    
    // ============================================
    // Data Repository
    // ============================================
    "repository.title": "مستودع البيانات",
    "repository.subtitle": "تصفح وتحميل مجموعات البيانات",
    "repository.datasets": "مجموعات البيانات",
    "repository.documents": "الوثائق",
    "repository.filterBySector": "تصفية حسب القطاع",
    "repository.filterByRegime": "تصفية حسب السلطة",
    "repository.filterByDate": "تصفية حسب التاريخ",
    "repository.downloadData": "تحميل البيانات",
    "repository.format": "التنسيق",
    
    // ============================================
    // Timeline
    // ============================================
    "timeline.title": "الجدول الزمني",
    "timeline.subtitle": "الأحداث الاقتصادية الرئيسية",
    "timeline.filterByType": "تصفية حسب النوع",
    "timeline.filterByImpact": "تصفية حسب التأثير",
    "timeline.event": "حدث",
    "timeline.events": "أحداث",
    "timeline.policy": "سياسة",
    "timeline.economic": "اقتصادي",
    "timeline.conflict": "صراع",
    "timeline.humanitarian": "إنساني",
    
    // ============================================
    // Entities
    // ============================================
    "entities.title": "الكيانات",
    "entities.subtitle": "ملفات الشركات والمؤسسات",
    "entities.company": "شركة",
    "entities.companies": "شركات",
    "entities.bank": "بنك",
    "entities.banks": "بنوك",
    "entities.organization": "منظمة",
    "entities.organizations": "منظمات",
    "entities.government": "حكومي",
    "entities.profile": "الملف",
    "entities.subsidiaries": "الشركات التابعة",
    "entities.ownership": "الملكية",
    "entities.financials": "البيانات المالية",
    "entities.sanctions": "العقوبات",
    
    // ============================================
    // Compliance & Sanctions
    // ============================================
    "compliance.title": "الامتثال والعقوبات",
    "compliance.subtitle": "مراقبة العقوبات والامتثال",
    "compliance.sanctionsList": "قوائم العقوبات",
    "compliance.alerts": "التنبيهات",
    "compliance.screening": "الفحص",
    "compliance.risk": "المخاطر",
    "compliance.high": "عالي",
    "compliance.medium": "متوسط",
    "compliance.low": "منخفض",
    
    // ============================================
    // Coverage Scorecard
    // ============================================
    "coverage.title": "بطاقة التغطية",
    "coverage.subtitle": "تتبع فجوات البيانات",
    "coverage.score": "درجة التغطية",
    "coverage.gaps": "الفجوات",
    "coverage.complete": "مكتمل",
    "coverage.partial": "جزئي",
    "coverage.missing": "مفقود",
    "coverage.priority": "الأولوية",
    
    // ============================================
    // Research Library
    // ============================================
    "research.title": "مكتبة الأبحاث",
    "research.subtitle": "التقارير والدراسات البحثية",
    "research.featured": "مميز",
    "research.latest": "الأحدث",
    "research.categories": "التصنيفات",
    "research.authors": "المؤلفون",
    "research.download": "تحميل",
    "research.cite": "اقتباس",
    "research.abstract": "الملخص",
    "research.fullText": "النص الكامل",
    
    // ============================================
    // Glossary
    // ============================================
    "glossary.title": "المصطلحات",
    "glossary.subtitle": "قاموس المصطلحات الاقتصادية",
    "glossary.search": "ابحث عن مصطلح",
    "glossary.definition": "التعريف",
    "glossary.relatedTerms": "مصطلحات ذات صلة",
    "glossary.category": "التصنيف",
    
    // ============================================
    // Methodology
    // ============================================
    "methodology.title": "المنهجية",
    "methodology.subtitle": "كيف نجمع ونحلل البيانات",
    "methodology.dataCollection": "جمع البيانات",
    "methodology.verification": "التحقق",
    "methodology.quality": "ضمان الجودة",
    "methodology.transparency": "الشفافية",
    "methodology.limitations": "القيود",
    
    // ============================================
    // About
    // ============================================
    "about.title": "عن يتو",
    "about.subtitle": "المرصد اليمني للشفافية الاقتصادية",
    "about.mission": "مهمتنا",
    "about.vision": "رؤيتنا",
    "about.team": "فريقنا",
    "about.partners": "شركاؤنا",
    "about.funding": "التمويل",
    
    // ============================================
    // Contact
    // ============================================
    "contact.title": "اتصل بنا",
    "contact.subtitle": "نسعد بتواصلكم",
    "contact.name": "الاسم",
    "contact.email": "البريد الإلكتروني",
    "contact.subject": "الموضوع",
    "contact.message": "الرسالة",
    "contact.send": "إرسال",
    "contact.success": "تم إرسال رسالتك بنجاح",
    "contact.error": "حدث خطأ أثناء الإرسال",
    
    // ============================================
    // Pricing
    // ============================================
    "pricing.title": "الاشتراكات",
    "pricing.subtitle": "اختر الخطة المناسبة لك",
    "pricing.free": "مجاني",
    "pricing.basic": "أساسي",
    "pricing.professional": "احترافي",
    "pricing.enterprise": "مؤسسي",
    "pricing.monthly": "شهرياً",
    "pricing.yearly": "سنوياً",
    "pricing.features": "المميزات",
    "pricing.subscribe": "اشترك الآن",
    "pricing.contact": "تواصل معنا",
    
    // ============================================
    // Admin Portal
    // ============================================
    "admin.title": "لوحة الإدارة",
    "admin.dashboard": "لوحة المعلومات",
    "admin.users": "المستخدمون",
    "admin.data": "إدارة البيانات",
    "admin.content": "إدارة المحتوى",
    "admin.settings": "الإعدادات",
    "admin.logs": "السجلات",
    "admin.ingestion": "استيعاب البيانات",
    "admin.quality": "جودة البيانات",
    "admin.publications": "المنشورات",
    
    // ============================================
    // Partner Portal
    // ============================================
    "partner.title": "بوابة الشركاء",
    "partner.dashboard": "لوحة المعلومات",
    "partner.submissions": "المساهمات",
    "partner.status": "حالة المساهمات",
    "partner.guidelines": "إرشادات المساهمة",
    "partner.submit": "تقديم مساهمة",
    
    // ============================================
    // User Dashboard
    // ============================================
    "user.dashboard": "لوحتي",
    "user.savedSearches": "عمليات البحث المحفوظة",
    "user.watchlist": "قائمة المراقبة",
    "user.alerts": "التنبيهات",
    "user.subscriptions": "الاشتراكات",
    "user.apiKeys": "مفاتيح API",
    "user.settings": "الإعدادات",
    "user.notifications": "الإشعارات",
    
    // ============================================
    // Footer
    // ============================================
    "footer.about": "عن المنصة",
    "footer.methodology": "المنهجية",
    "footer.privacy": "الخصوصية",
    "footer.terms": "الشروط",
    "footer.dataLicense": "ترخيص البيانات",
    "footer.accessibility": "إمكانية الوصول",
    "footer.contact": "تواصل معنا",
    "footer.email": "yeto@causewaygrp.com",
    "footer.copyright": "© 2025 مرصد يتو. جميع الحقوق محفوظة.",
    "footer.poweredBy": "منتج من",
    "footer.causeway": "كوزواي للاستشارات المالية والمصرفية",
    
    // ============================================
    // Home Page
    // ============================================
    "home.hero.title": "المرصد اليمني للشفافية الاقتصادية",
    "home.hero.subtitle": "منصة استخبارات اقتصادية قائمة على الأدلة للسياسات والأبحاث المستنيرة",
    "home.hero.cta": "استكشف البيانات",
    "home.hero.research": "تصفح الأبحاث",
    "home.stats.users": "مستخدم",
    "home.stats.reports": "تقرير بحثي",
    "home.stats.sources": "مصدر بيانات",
    "home.stats.dataPoints": "نقطة بيانات",
    "home.features.title": "مميزات المنصة",
    "home.features.realtime": "بيانات محدثة",
    "home.features.realtime.desc": "تحديثات يومية للمؤشرات الاقتصادية الرئيسية",
    "home.features.evidence": "قائم على الأدلة",
    "home.features.evidence.desc": "كل نقطة بيانات موثقة بمصادرها",
    "home.features.bilingual": "ثنائي اللغة",
    "home.features.bilingual.desc": "دعم كامل للعربية والإنجليزية",
    "home.features.regime": "تتبع السلطتين",
    "home.features.regime.desc": "مقارنة بين عدن وصنعاء",
    "home.sectors.title": "القطاعات الاقتصادية",
    "home.sectors.subtitle": "تغطية شاملة للاقتصاد اليمني",
    "home.insights.title": "آخر التحديثات",
    "home.cta.title": "ابدأ الآن",
    "home.cta.subtitle": "انضم إلى مئات المستخدمين الذين يعتمدون على يتو",
    
    // ============================================
    // Dev Mode
    // ============================================
    "dev.banner": "وضع التطوير - البيانات المعروضة للعرض التوضيحي فقط",
    "dev.sampleData": "بيانات تجريبية",
    
    // ============================================
    // Errors
    // ============================================
    "error.notFound": "الصفحة غير موجودة",
    "error.notFound.desc": "عذراً، الصفحة التي تبحث عنها غير موجودة",
    "error.unauthorized": "غير مصرح",
    "error.unauthorized.desc": "ليس لديك صلاحية للوصول إلى هذه الصفحة",
    "error.serverError": "خطأ في الخادم",
    "error.serverError.desc": "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً",
    "error.networkError": "خطأ في الاتصال",
    "error.networkError.desc": "تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت",
    "error.goHome": "العودة للرئيسية",
    "error.tryAgain": "حاول مرة أخرى",
  },
  
  en: {
    // ============================================
    // Navigation
    // ============================================
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.data": "Data & Analytics",
    "nav.research": "Research",
    "nav.sectors": "Sectors",
    "nav.tools": "Tools",
    "nav.resources": "Resources",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.pricing": "Pricing",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.profile": "Profile",
    "nav.admin": "Admin Portal",
    "nav.partner": "Partner Portal",
    
    // ============================================
    // Sectors
    // ============================================
    "sectors.banking": "Banking & Finance",
    "sectors.banking.desc": "Track bank performance, credit flows, and financial stability",
    "sectors.trade": "Trade & Commerce",
    "sectors.trade.desc": "Monitor imports, exports, and trade balance",
    "sectors.poverty": "Poverty & Development",
    "sectors.poverty.desc": "Poverty indicators, human development, and humanitarian needs",
    "sectors.macroeconomy": "Macroeconomy",
    "sectors.macroeconomy.desc": "GDP, economic growth, and macro indicators",
    "sectors.prices": "Prices & Inflation",
    "sectors.prices.desc": "Track commodity prices and inflation rates",
    "sectors.currency": "Currency & Exchange",
    "sectors.currency.desc": "Exchange rates and Yemeni Rial movements",
    "sectors.publicFinance": "Public Finance",
    "sectors.publicFinance.desc": "Government revenues, expenditures, and public debt",
    "sectors.energy": "Energy & Fuel",
    "sectors.energy.desc": "Fuel prices, electricity supply, and energy sector",
    "sectors.foodSecurity": "Food Security",
    "sectors.foodSecurity.desc": "Food security indicators and food prices",
    "sectors.aidFlows": "Aid Flows",
    "sectors.aidFlows.desc": "Track humanitarian and development aid",
    "sectors.laborMarket": "Labor Market",
    "sectors.laborMarket.desc": "Unemployment rates, wages, and employment dynamics",
    "sectors.conflictEconomy": "Conflict Economy",
    "sectors.conflictEconomy.desc": "Economic impact of conflict and informal economy",
    "sectors.infrastructure": "Infrastructure",
    "sectors.infrastructure.desc": "Infrastructure status and basic services",
    "sectors.agriculture": "Agriculture",
    "sectors.agriculture.desc": "Agricultural production and local food security",
    "sectors.investment": "Investment",
    "sectors.investment.desc": "Investment environment and capital flows",
    
    // ============================================
    // Tools
    // ============================================
    "tools.aiAssistant": "AI Assistant",
    "tools.aiAssistant.desc": "Ask any question about Yemen's economy",
    "tools.scenarioSimulator": "Scenario Simulator",
    "tools.scenarioSimulator.desc": "Explore potential economic scenarios",
    "tools.reportBuilder": "Report Builder",
    "tools.reportBuilder.desc": "Create custom reports from data",
    "tools.dataRepository": "Data Repository",
    "tools.dataRepository.desc": "Browse and download datasets",
    "tools.timeline": "Timeline",
    "tools.timeline.desc": "Review key economic events",
    "tools.entities": "Entities",
    "tools.entities.desc": "Profiles of key companies and institutions",
    "tools.compliance": "Compliance & Sanctions",
    "tools.compliance.desc": "Sanctions and compliance monitoring",
    "tools.coverage": "Coverage Scorecard",
    "tools.coverage.desc": "Track data gaps and coverage",
    
    // ============================================
    // Common UI
    // ============================================
    "common.search": "Search",
    "common.searchPlaceholder": "Search indicators and reports...",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.download": "Download",
    "common.share": "Share",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.submit": "Submit",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
    "common.noData": "No data available",
    "common.viewAll": "View All",
    "common.learnMore": "Learn More",
    "common.readMore": "Read More",
    "common.showMore": "Show More",
    "common.showLess": "Show Less",
    "common.notAvailable": "Not available yet",
    "common.source": "Source",
    "common.sources": "Sources",
    "common.confidence": "Confidence Level",
    "common.lastUpdated": "Last Updated",
    "common.date": "Date",
    "common.value": "Value",
    "common.change": "Change",
    "common.trend": "Trend",
    "common.period": "Period",
    "common.unit": "Unit",
    "common.all": "All",
    "common.yes": "Yes",
    "common.no": "No",
    "common.or": "or",
    "common.and": "and",
    "common.from": "From",
    "common.to": "To",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.close": "Close",
    "common.open": "Open",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.add": "Add",
    "common.new": "New",
    "common.update": "Update",
    "common.refresh": "Refresh",
    "common.reset": "Reset",
    "common.apply": "Apply",
    "common.clear": "Clear",
    "common.select": "Select",
    "common.selected": "Selected",
    "common.required": "Required",
    "common.optional": "Optional",
    "common.status": "Status",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.pending": "Pending",
    "common.approved": "Approved",
    "common.rejected": "Rejected",
    "common.draft": "Draft",
    "common.published": "Published",
    
    // ============================================
    // Dashboard
    // ============================================
    "dashboard.title": "Economic Dashboard",
    "dashboard.subtitle": "Monitor key economic indicators in Yemen",
    "dashboard.regimeComparison": "Regime Comparison",
    "dashboard.aden": "Aden (IRG)",
    "dashboard.sanaa": "Sana'a (De Facto)",
    "dashboard.national": "National",
    "dashboard.dataQuality": "Data Quality",
    "dashboard.keyIndicators": "Key Indicators",
    "dashboard.recentUpdates": "Recent Updates",
    "dashboard.quickStats": "Quick Stats",
    "dashboard.exchangeRate": "Exchange Rate",
    "dashboard.inflation": "Inflation Rate",
    "dashboard.fuelPrice": "Fuel Price",
    "dashboard.foodPrice": "Food Price Index",
    
    // ============================================
    // Data & Evidence
    // ============================================
    "data.indicator": "Indicator",
    "data.indicators": "Indicators",
    "data.regime": "Regime",
    "data.regimes": "Regimes",
    "data.timeSeries": "Time Series",
    "data.dataPoint": "Data Point",
    "data.dataPoints": "Data Points",
    "data.methodology": "Methodology",
    "data.collection": "Collection Method",
    "data.frequency": "Frequency",
    "data.coverage": "Coverage",
    "data.quality": "Quality",
    "data.verified": "Verified",
    "data.unverified": "Unverified",
    "data.estimated": "Estimated",
    "data.provisional": "Provisional",
    "data.final": "Final",
    
    "evidence.showEvidence": "Show Evidence",
    "evidence.hideEvidence": "Hide Evidence",
    "evidence.evidencePack": "Evidence Pack",
    "evidence.sources": "Sources",
    "evidence.methodology": "Methodology",
    "evidence.confidence": "Confidence Level",
    "evidence.lastVerified": "Last Verified",
    "evidence.reportIssue": "Report Issue",
    "evidence.high": "High",
    "evidence.medium": "Medium",
    "evidence.low": "Low",
    "evidence.collectionDate": "Collection Date",
    "evidence.verificationDate": "Verification Date",
    
    // ============================================
    // Publications
    // ============================================
    "publications.title": "Publications",
    "publications.dailyDigest": "Daily Digest",
    "publications.weeklyMonitor": "Weekly Monitor",
    "publications.monthlyBrief": "Monthly Brief",
    "publications.specialReport": "Special Report",
    "publications.subscribe": "Subscribe",
    "publications.unsubscribe": "Unsubscribe",
    "publications.downloadPdf": "Download PDF",
    "publications.latestIssue": "Latest Issue",
    "publications.archive": "Archive",
    "publications.featured": "Featured",
    
    // ============================================
    // AI Assistant
    // ============================================
    "ai.title": "AI Assistant",
    "ai.subtitle": "Ask any question about Yemen's economy",
    "ai.placeholder": "Type your question here...",
    "ai.send": "Send",
    "ai.thinking": "Thinking...",
    "ai.suggestions": "Suggestions",
    "ai.newChat": "New Chat",
    "ai.history": "Chat History",
    "ai.sources": "Sources Used",
    "ai.disclaimer": "Answers are based on available data and may not be comprehensive",
    
    // ============================================
    // Scenario Simulator
    // ============================================
    "simulator.title": "Scenario Simulator",
    "simulator.subtitle": "Explore potential economic impacts",
    "simulator.selectScenario": "Select Scenario",
    "simulator.runSimulation": "Run Simulation",
    "simulator.results": "Results",
    "simulator.assumptions": "Assumptions",
    "simulator.impact": "Impact",
    "simulator.baseline": "Baseline",
    "simulator.projected": "Projected",
    
    // ============================================
    // Report Builder
    // ============================================
    "reportBuilder.title": "Report Builder",
    "reportBuilder.subtitle": "Create custom reports",
    "reportBuilder.selectIndicators": "Select Indicators",
    "reportBuilder.selectPeriod": "Select Period",
    "reportBuilder.selectFormat": "Select Format",
    "reportBuilder.generate": "Generate Report",
    "reportBuilder.preview": "Preview",
    "reportBuilder.download": "Download",
    
    // ============================================
    // Data Repository
    // ============================================
    "repository.title": "Data Repository",
    "repository.subtitle": "Browse and download datasets",
    "repository.datasets": "Datasets",
    "repository.documents": "Documents",
    "repository.filterBySector": "Filter by Sector",
    "repository.filterByRegime": "Filter by Regime",
    "repository.filterByDate": "Filter by Date",
    "repository.downloadData": "Download Data",
    "repository.format": "Format",
    
    // ============================================
    // Timeline
    // ============================================
    "timeline.title": "Timeline",
    "timeline.subtitle": "Key Economic Events",
    "timeline.filterByType": "Filter by Type",
    "timeline.filterByImpact": "Filter by Impact",
    "timeline.event": "Event",
    "timeline.events": "Events",
    "timeline.policy": "Policy",
    "timeline.economic": "Economic",
    "timeline.conflict": "Conflict",
    "timeline.humanitarian": "Humanitarian",
    
    // ============================================
    // Entities
    // ============================================
    "entities.title": "Entities",
    "entities.subtitle": "Company and Institution Profiles",
    "entities.company": "Company",
    "entities.companies": "Companies",
    "entities.bank": "Bank",
    "entities.banks": "Banks",
    "entities.organization": "Organization",
    "entities.organizations": "Organizations",
    "entities.government": "Government",
    "entities.profile": "Profile",
    "entities.subsidiaries": "Subsidiaries",
    "entities.ownership": "Ownership",
    "entities.financials": "Financials",
    "entities.sanctions": "Sanctions",
    
    // ============================================
    // Compliance & Sanctions
    // ============================================
    "compliance.title": "Compliance & Sanctions",
    "compliance.subtitle": "Sanctions and compliance monitoring",
    "compliance.sanctionsList": "Sanctions Lists",
    "compliance.alerts": "Alerts",
    "compliance.screening": "Screening",
    "compliance.risk": "Risk",
    "compliance.high": "High",
    "compliance.medium": "Medium",
    "compliance.low": "Low",
    
    // ============================================
    // Coverage Scorecard
    // ============================================
    "coverage.title": "Coverage Scorecard",
    "coverage.subtitle": "Track data gaps",
    "coverage.score": "Coverage Score",
    "coverage.gaps": "Gaps",
    "coverage.complete": "Complete",
    "coverage.partial": "Partial",
    "coverage.missing": "Missing",
    "coverage.priority": "Priority",
    
    // ============================================
    // Research Library
    // ============================================
    "research.title": "Research Library",
    "research.subtitle": "Reports and Research Studies",
    "research.featured": "Featured",
    "research.latest": "Latest",
    "research.categories": "Categories",
    "research.authors": "Authors",
    "research.download": "Download",
    "research.cite": "Cite",
    "research.abstract": "Abstract",
    "research.fullText": "Full Text",
    
    // ============================================
    // Glossary
    // ============================================
    "glossary.title": "Glossary",
    "glossary.subtitle": "Economic Terms Dictionary",
    "glossary.search": "Search for a term",
    "glossary.definition": "Definition",
    "glossary.relatedTerms": "Related Terms",
    "glossary.category": "Category",
    
    // ============================================
    // Methodology
    // ============================================
    "methodology.title": "Methodology",
    "methodology.subtitle": "How we collect and analyze data",
    "methodology.dataCollection": "Data Collection",
    "methodology.verification": "Verification",
    "methodology.quality": "Quality Assurance",
    "methodology.transparency": "Transparency",
    "methodology.limitations": "Limitations",
    
    // ============================================
    // About
    // ============================================
    "about.title": "About YETO",
    "about.subtitle": "Yemen Economic Transparency Observatory",
    "about.mission": "Our Mission",
    "about.vision": "Our Vision",
    "about.team": "Our Team",
    "about.partners": "Our Partners",
    "about.funding": "Funding",
    
    // ============================================
    // Contact
    // ============================================
    "contact.title": "Contact Us",
    "contact.subtitle": "We'd love to hear from you",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.subject": "Subject",
    "contact.message": "Message",
    "contact.send": "Send",
    "contact.success": "Your message has been sent successfully",
    "contact.error": "An error occurred while sending",
    
    // ============================================
    // Pricing
    // ============================================
    "pricing.title": "Pricing",
    "pricing.subtitle": "Choose the right plan for you",
    "pricing.free": "Free",
    "pricing.basic": "Basic",
    "pricing.professional": "Professional",
    "pricing.enterprise": "Enterprise",
    "pricing.monthly": "Monthly",
    "pricing.yearly": "Yearly",
    "pricing.features": "Features",
    "pricing.subscribe": "Subscribe Now",
    "pricing.contact": "Contact Us",
    
    // ============================================
    // Admin Portal
    // ============================================
    "admin.title": "Admin Portal",
    "admin.dashboard": "Dashboard",
    "admin.users": "Users",
    "admin.data": "Data Management",
    "admin.content": "Content Management",
    "admin.settings": "Settings",
    "admin.logs": "Logs",
    "admin.ingestion": "Data Ingestion",
    "admin.quality": "Data Quality",
    "admin.publications": "Publications",
    
    // ============================================
    // Partner Portal
    // ============================================
    "partner.title": "Partner Portal",
    "partner.dashboard": "Dashboard",
    "partner.submissions": "Submissions",
    "partner.status": "Submission Status",
    "partner.guidelines": "Contribution Guidelines",
    "partner.submit": "Submit Contribution",
    
    // ============================================
    // User Dashboard
    // ============================================
    "user.dashboard": "My Dashboard",
    "user.savedSearches": "Saved Searches",
    "user.watchlist": "Watchlist",
    "user.alerts": "Alerts",
    "user.subscriptions": "Subscriptions",
    "user.apiKeys": "API Keys",
    "user.settings": "Settings",
    "user.notifications": "Notifications",
    
    // ============================================
    // Footer
    // ============================================
    "footer.about": "About",
    "footer.methodology": "Methodology",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "footer.dataLicense": "Data License",
    "footer.accessibility": "Accessibility",
    "footer.contact": "Contact Us",
    "footer.email": "yeto@causewaygrp.com",
    "footer.copyright": "© 2025 YETO. All rights reserved.",
    "footer.poweredBy": "A product of",
    "footer.causeway": "CauseWay Financial & Banking Consultancies",
    
    // ============================================
    // Home Page
    // ============================================
    "home.hero.title": "Yemen Economic Transparency Observatory",
    "home.hero.subtitle": "Evidence-based economic intelligence platform for informed policy and research",
    "home.hero.cta": "Explore Data",
    "home.hero.research": "Browse Research",
    "home.stats.users": "Users",
    "home.stats.reports": "Research Reports",
    "home.stats.sources": "Data Sources",
    "home.stats.dataPoints": "Data Points",
    "home.features.title": "Platform Features",
    "home.features.realtime": "Real-time Data",
    "home.features.realtime.desc": "Daily updates on key economic indicators",
    "home.features.evidence": "Evidence-based",
    "home.features.evidence.desc": "Every data point documented with sources",
    "home.features.bilingual": "Bilingual",
    "home.features.bilingual.desc": "Full Arabic and English support",
    "home.features.regime": "Regime Tracking",
    "home.features.regime.desc": "Compare Aden and Sana'a",
    "home.sectors.title": "Economic Sectors",
    "home.sectors.subtitle": "Comprehensive coverage of Yemen's economy",
    "home.insights.title": "Latest Updates",
    "home.cta.title": "Get Started",
    "home.cta.subtitle": "Join hundreds of users who rely on YETO",
    
    // ============================================
    // Dev Mode
    // ============================================
    "dev.banner": "Development Mode - Data shown is for demonstration only",
    "dev.sampleData": "Sample Data",
    
    // ============================================
    // Errors
    // ============================================
    "error.notFound": "Page Not Found",
    "error.notFound.desc": "Sorry, the page you're looking for doesn't exist",
    "error.unauthorized": "Unauthorized",
    "error.unauthorized.desc": "You don't have permission to access this page",
    "error.serverError": "Server Error",
    "error.serverError.desc": "An unexpected error occurred. Please try again later",
    "error.networkError": "Network Error",
    "error.networkError.desc": "Unable to connect to server. Check your internet connection",
    "error.goHome": "Go Home",
    "error.tryAgain": "Try Again",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to Arabic (Arabic-first platform)
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("yeto-language");
      return (stored === "ar" || stored === "en") ? stored : "ar";
    }
    return "ar";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem("yeto-language", lang);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  // Format number based on language
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(language === "ar" ? "ar-YE" : "en-US").format(num);
  };

  // Format date based on language
  const formatDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(language === "ar" ? "ar-YE" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  };

  // Format currency based on language
  const formatCurrency = (amount: number, currency: string = "YER"): string => {
    return new Intl.NumberFormat(language === "ar" ? "ar-YE" : "en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Update document direction and lang attribute when language changes
  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
    document.body.setAttribute("dir", dir);
    
    // Update font family based on language
    if (language === "ar") {
      document.body.style.fontFamily = "'Cairo', 'Noto Sans Arabic', sans-serif";
    } else {
      document.body.style.fontFamily = "'Inter', sans-serif";
    }
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRTL: dir === 'rtl', formatNumber, formatDate, formatCurrency }}>
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
