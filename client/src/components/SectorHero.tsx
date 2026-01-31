import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ExportButton";
import { FileText } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface SectorHeroProps {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  badgeEn: string;
  badgeAr: string;
  icon: LucideIcon;
  backgroundImage?: string;
  exportData?: any[];
  exportFilename?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function SectorHero({
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  badgeEn,
  badgeAr,
  icon: Icon,
  backgroundImage,
  exportData,
  exportFilename,
  gradientFrom = "#1B5E20",
  gradientTo = "#2E7D32",
}: SectorHeroProps) {
  const { language } = useLanguage();

  return (
    <section className="relative h-[400px] overflow-hidden">
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {/* Gradient Overlay - minimal opacity to preserve original image */}
      <div 
        className="absolute inset-0"
        style={{
          background: backgroundImage 
            ? `linear-gradient(to right, ${gradientFrom}80, ${gradientTo}50, transparent)`
            : `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
        }}
      />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Content */}
      <div className="container relative h-full flex items-center">
        <div className={`max-w-2xl ${language === 'ar' ? 'mr-auto text-right' : 'ml-0'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <Icon className="h-8 w-8 text-white" />
            </div>
            <Badge className="bg-[#C5A028] text-[#0D2818] border-0 font-semibold">
              {language === "ar" ? badgeAr : badgeEn}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === "ar" ? titleAr : titleEn}
          </h1>
          <p className="text-xl text-white/90 mb-6">
            {language === "ar" ? descriptionAr : descriptionEn}
          </p>
          <div className="flex flex-wrap gap-4">
            {exportData && exportFilename && (
              <ExportButton 
                data={exportData}
                filename={exportFilename}
                title={language === "ar" ? "تصدير البيانات" : "Export Data"}
                variant="default"
                size="lg"
              />
            )}
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2">
              <FileText className="h-5 w-5" />
              {language === "ar" ? "تقرير القطاع" : "Sector Report"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Sector background image mapping
export const sectorBackgrounds: Record<string, string> = {
  banking: "/sectors/banking.png",
  trade: "/sectors/trade.jpg",
  macroeconomy: "/sectors/economy.jpg",
  prices: "/sectors/consumer-prices.png",
  currency: "/sectors/currency.jpg",
  "public-finance": "/sectors/public-finance.png",
  energy: "/sectors/energy.jpg",
  "food-security": "/sectors/food-security.jpg",
  "aid-flows": "/sectors/humanitarian.jpg",
  "labor-market": "/sectors/labor.jpg",
  "conflict-economy": "/sectors/conflict-economy.jpg",
  infrastructure: "/sectors/infrastructure.jpg",
  agriculture: "/sectors/agriculture.jpg",
  investment: "/sectors/investment.webp",
  poverty: "/sectors/poverty.jpg",
  "local-economy": "/sectors/local-economy.jpg",
  "rural-development": "/sectors/rural-development.jpg",
};
