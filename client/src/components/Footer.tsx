import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { 
  Mail, 
  ExternalLink,
  Database,
  BarChart3,
  BookOpen,
  Shield
} from "lucide-react";

export default function Footer() {
  const { language } = useLanguage();

  const quickLinks = [
    { nameEn: "Dashboard", nameAr: "لوحة المعلومات", href: "/dashboard", icon: BarChart3 },
    { nameEn: "Data Repository", nameAr: "مستودع البيانات", href: "/data-repository", icon: Database },
    { nameEn: "Research Library", nameAr: "مكتبة الأبحاث", href: "/research", icon: BookOpen },
    { nameEn: "Methodology", nameAr: "المنهجية", href: "/methodology", icon: Shield },
  ];

  const sectors = [
    { nameEn: "Banking & Finance", nameAr: "القطاع المصرفي", href: "/sectors/banking" },
    { nameEn: "Trade & Commerce", nameAr: "التجارة", href: "/sectors/trade" },
    { nameEn: "Macroeconomy", nameAr: "الاقتصاد الكلي", href: "/sectors/macroeconomy" },
    { nameEn: "Food Security", nameAr: "الأمن الغذائي", href: "/sectors/food-security" },
  ];

  const resources = [
    { nameEn: "About YETO", nameAr: "عن يتو", href: "/about" },
    { nameEn: "Contact Us", nameAr: "اتصل بنا", href: "/contact" },
    { nameEn: "Glossary", nameAr: "المصطلحات", href: "/glossary" },
    { nameEn: "Pricing", nameAr: "الاشتراكات", href: "/pricing" },
    { nameEn: "Sitemap", nameAr: "خريطة الموقع", href: "/sitemap" },
  ];

  return (
    <footer className="bg-[#1f2d1d] text-white mt-auto">
      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {/* CauseWay Logo SVG - Exact from mockup */}
              <svg viewBox="0 0 120 100" className="w-10 h-10">
                <path d="M8 10 L62 10 Q68 10 68 16 L68 28 L28 28 L28 72 L68 72 L68 84 Q68 90 62 90 L8 90 Q2 90 2 84 L2 16 Q2 10 8 10 Z" fill="#2e8b6e" />
                <rect x="48" y="36" width="26" height="26" rx="4" fill="#6b8e6b" />
                <rect x="82" y="10" width="26" height="26" rx="5" fill="#d4a528" />
                <rect x="82" y="48" width="16" height="16" rx="8" fill="#2e8b6e" />
              </svg>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-white tracking-wide">CauseWay</span>
                <span className="text-sm text-[#6b8e6b] font-arabic -mt-0.5">كوزواي</span>
                <span className="text-[9px] uppercase tracking-[0.15em] text-[#d4a528] font-medium mt-0.5">
                  {language === "ar" ? "مرصد اقتصادي" : "Economic Observatory"}
                </span>
              </div>
            </div>
            <p className="text-sm text-white/70 mb-4">
              {language === "ar"
                ? "مرصد اليمن للشفافية الاقتصادية - منصة استخبارات اقتصادية شاملة لليمن"
                : "Yemen Economic Transparency Observatory - A comprehensive economic intelligence platform for Yemen"}
            </p>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Mail className="h-4 w-4" />
              <a href="mailto:yeto@causewaygrp.com" className="hover:text-white transition-colors">
                yeto@causewaygrp.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">
              {language === "ar" ? "روابط سريعة" : "Quick Links"}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li key={index}>
                    <Link href={link.href} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                      <Icon className="h-4 w-4" />
                      {language === "ar" ? link.nameAr : link.nameEn}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sectors */}
          <div>
            <h3 className="font-semibold mb-4 text-white">
              {language === "ar" ? "القطاعات" : "Sectors"}
            </h3>
            <ul className="space-y-2">
              {sectors.map((sector, index) => (
                <li key={index}>
                  <Link href={sector.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {language === "ar" ? sector.nameAr : sector.nameEn}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/data-repository" className="text-sm text-[#C0A030] hover:text-[#D4B440] transition-colors flex items-center gap-1">
                  {language === "ar" ? "عرض جميع القطاعات" : "View All Sectors"}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-white">
              {language === "ar" ? "الموارد" : "Resources"}
            </h3>
            <ul className="space-y-2">
              {resources.map((resource, index) => (
                <li key={index}>
                  <Link href={resource.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {language === "ar" ? resource.nameAr : resource.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p>
              © {new Date().getFullYear()} {language === "ar" ? "يتو. جميع الحقوق محفوظة." : "YETO. All rights reserved."}
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                {language === "ar" ? "بدعم من" : "Powered by"}{" "}
                {/* CauseWay Logo - SVG with proper colors */}
                <span className="inline-flex items-center gap-1.5">
                  <svg width="20" height="18" viewBox="0 0 120 100" className="h-5 w-auto">
                    <path d="M20 15 L70 15 L70 30 L35 30 L35 70 L70 70 L70 85 L20 85 Z" fill="#2e8b6e" stroke="#6b8e6b" strokeWidth="2"/>
                    <rect x="50" y="35" width="25" height="25" fill="#6b8e6b" rx="2"/>
                    <rect x="80" y="15" width="20" height="20" fill="#d4a528" rx="3"/>
                    <rect x="80" y="45" width="12" height="12" fill="#2e8b6e" rx="2"/>
                  </svg>
                  <span className="text-white/80 text-xs">CauseWay</span>
                  <span className="text-[#6b8e6b] text-xs font-arabic">كوزواي</span>
                </span>
              </span>
              <span className="text-white/30">|</span>
              <Link href="/data-policy" className="hover:text-white transition-colors">
                {language === "ar" ? "سياسة البيانات" : "Data Policy"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
