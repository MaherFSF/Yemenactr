import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { language, setLanguage, t, dir } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
    setMobileMenuOpen(false);
  };

  const navItems = [
    { key: "home", href: "/" },
    { key: "dashboard", href: "/dashboard" },
    { key: "data", href: "/data" },
    { key: "research", href: "/research" },
    { key: "sectors", href: "/sectors" },
    { key: "about", href: "/about" },
    { key: "contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-3 text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-1">
              {/* CauseWay Logo Colors */}
              <div className="w-8 h-8 relative">
                <div className="absolute top-0 left-0 w-4 h-4 bg-[#107040] rounded-sm"></div>
                <div className="absolute top-0 right-0 w-4 h-4 bg-[#C0A030] rounded-sm"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#103050] rounded-sm"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4A90E2] rounded-full"></div>
              </div>
            </div>
            <span className="hidden sm:inline">
              {language === "ar" ? "يتو" : "YETO"}
            </span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.key} href={item.href}>
              <a className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                {t(`nav.${item.key}`)}
              </a>
            </Link>
          ))}
        </nav>

        {/* Language Switcher */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === "ar" ? "English" : "العربية"}
            </span>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <nav className="container flex flex-col py-4 gap-2">
            {navItems.map((item) => (
              <Link key={item.key} href={item.href}>
                <a
                  className="block px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(`nav.${item.key}`)}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
